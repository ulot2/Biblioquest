import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getBookById } from "@/lib/api";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { bookId, action, history, character } = await req.json();

    // 1. Fetch Book Details (In a real app, we might cache this or store it in a DB)
    // For now, we fetch metadata to get the title/author/subjects to frame the context.
    const book = await getBookById(bookId);
    const bookTitle = book?.title || "Unknown Book";
    const bookAuthor = book?.authors[0]?.name || "Unknown Author";

    // 2. Construct System Prompt
    // We act as a Dungeon Master.
    const systemPrompt = `
        You are the Dungeon Master for an interactive text adventure game based on the book "${bookTitle}" by ${bookAuthor}.
        
        Your Goal:
        - Guide the player (the main character) through the story.
        - Respond to their actions logically within the world of the book.
        - Keep descriptions immersive but concise (max 2-3 paragraphs).
        - Track the character's status (Health, Mana, Inventory) implicitly in your narration, but explicitly output updates in JSON if needed (not implemented yet, just focus on story).
        - If the user's action is impossible, explain why.
        
        Format:
        - Provide ONLY the narrative response. Do not include "Here is the response" or similar meta-text.
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
      max_tokens: 500,
    });

    const narrative =
      completion.choices[0]?.message?.content ||
      "The world fades... (AI Error)";

    return NextResponse.json({
      narrative,
      // Future: data updates, options, etc.
    });
  } catch (error) {
    console.error("Quest API Error:", error);
    return NextResponse.json(
      { error: "Failed to process quest action" },
      { status: 500 }
    );
  }
}
