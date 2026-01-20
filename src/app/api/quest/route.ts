import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getBookById } from "@/lib/api";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const {
      bookId,
      action,
      history,
      character,
      gameMode,
      interactionState,
      inventory,
    } = await req.json();

    let bookTitle = "Unknown Book";
    let bookAuthor = "Unknown Author";

    // 1. Logic for Book Identification
    const isCustomQuest = bookId.startsWith("custom-");

    if (isCustomQuest) {
      // Do NOT call getBookById
      bookTitle = decodeURIComponent(bookId.replace("custom-", ""));
      bookAuthor = "the original author";
    } else {
      // Keep existing logic
      const book = await getBookById(bookId);
      if (book) {
        bookTitle = book.title;
        bookAuthor = book.authors[0]?.name || "Unknown Author";
      }
    }

    // 2. The "Narrative Director" System Prompt
    const systemPrompt = `
  ROLE: You are the Lead Narrative Designer adapting "${bookTitle}" by ${bookAuthor}.
  
  CRITICAL INSTRUCTION:
  - If "${bookTitle}" is a famous book, use your INTERNAL KNOWLEDGE to be faithful to the plot/tone.
  - If unknown, improvise.

  GAMEPLAY RULES:
  1. NO COMBAT. Deflect violence with narrative consequences.
  2. INTERACTION ENGINE: Every 3-5 turns, trigger a "PUZZLE", "DEBATE", or "INVESTIGATION".
  3. CALL TO ACTION (CRITICAL): You must ALWAYS end your "narrative" output with a direct question or a set of choices to guide the user. Never just stop talking.
     - Bad: "The door is locked."
     - Good: "The door is locked, but you see a glimmer of light under the frame. Do you knock, or try to pick the lock?"

  CURRENT CONTEXT:
  - Inventory: ${JSON.stringify(inventory)}
  - Active Interaction: ${interactionState?.isActive ? JSON.stringify(interactionState) : "None"}

  OUTPUT FORMAT (Strict JSON):
  {
    "narrative": "Story prose... [Ends with Question/Choice]",
    "interaction": {
      "active": boolean,
      "type": "PUZZLE" | "DEBATE" | "INVESTIGATION",
      "title": "String",
      "description": "String",
      "progress_delta": number
    },
    "updates": {
      "inventory": { "add": [], "remove": [] }
    }
  }
`;

    // 3. Construct Message History
    // We limit history to the last ~10 turns to save tokens (Groq limit).
    // Format: User: [Action], AI: [Response]
    const conversationHistory = history.slice(-6).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    // Add current action
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: action },
    ];

    // 4. Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.3-70b-versatile", // Updated to supported model
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }, // Force JSON mode
    });

    const content = completion.choices[0]?.message?.content;
    let responseData;

    try {
      responseData = JSON.parse(content || "{}");
    } catch (e) {
      console.error("Failed to parse JSON response:", content);
      // Fallback Logic: Regex extraction
      const match = content?.match(/"narrative":\s*"([^"]*)"/);
      if (match) {
        responseData = { narrative: match[1], updates: {} };
      } else {
        responseData = {
          narrative:
            content || "The story shifts unpredictably. (AI Parse Error)",
          updates: {},
        };
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Quest API Error:", error);
    return NextResponse.json(
      { error: "Failed to process quest action" },
      { status: 500 },
    );
  }
}
