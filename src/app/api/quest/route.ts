import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getBookById } from "@/lib/api";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { bookId, action, history, character, gameMode } = await req.json();

    // 1. Fetch Book Details (In a real app, we might cache this or store it in a DB)
    const book = await getBookById(bookId);
    const bookTitle = book?.title || "Unknown Book";
    const bookAuthor = book?.authors[0]?.name || "Unknown Author";

    const isCustomQuest = bookId.startsWith("custom-");
    let systemPrompt = "";

    if (isCustomQuest) {
      if (gameMode === "COMBAT") {
        systemPrompt = `
        You are the Turn-Based Combat Referee for a D&D 5e encounter in "${bookTitle}".
        
        Current State: Combat is ACTIVE.
        Player Action: "${action}"
        
        Goal:
        - Resolve the player's action (Attack, Spell, etc.) using D&D 5e logic (simulate dice rolls).
        - Describe the outcome dramatically but briefly.
        - Dictate the enemy's counter-attack.
        
        Output JSON:
        {
            "narrative": "Combat narration...",
            "updates": {
                "stats": { 
                    "health": -5,        // Player HP change
                    "enemy_damage": 8    // DAMAGE dealt to enemy (positive number)
                },
                "combatLog": ["Player hit Goblin for 8 dmg", "Goblin missed"]
            }
        }
        `;
      } else {
        // CUSTOM QUEST EXPLORATION (D&D Enabled)
        systemPrompt = `
        You are the Dungeon Master for an interactive D&D 5e adventure based on the universe of "${bookTitle}".
        
        Your Goal:
        - Guide the player through an open-ended adventure.
        - Respond to actions logically using D&D 5e capability.
        - DETECT COMBAT: If the player encounters a hostile entity that attacks or is attacked, trigger COMBAT mode.
        - IMPORTANT: You must output strict JSON.
        
        JSON Structure:
        {
            "narrative": "Story text...",
            "updates": {
                "mode": "COMBAT" (ONLY if combat starts),
                "enemy": "Monster Name" (e.g. "Goblin", "Wolf" - use singular D&D name),
                "inventory": { ... },
                "stats": { ... }
            }
        }
        `;
      }
    } else {
      // NORMAL NOVEL MODE (Pure Storytelling, No D&D)
      systemPrompt = `
        You are the AI Storyteller for an interactive novel adaptation of "${bookTitle}" by ${bookAuthor}.
        
        Your Goal:
        - Weave a compelling narrative that adapts the book into a "Choose Your Own Adventure" style experience.
        - Emulate the writing style, tone, and vocabulary of ${bookAuthor}.
        - Act as a co-author, guiding the player (the protagonist) through the plot actions.
        - Do NOT use D&D mechanics (no HP, no rolling dice, no "Combat Mode").
        - If the player fights, describe it purely through action and prose.
        
        Output strict JSON:
        {
            "narrative": "The story text continuing the narrative or responding to the user's choice...",
            "updates": {
                 "inventory": { ... } // Optional: Can still track key items if relevant to the plot
            }
        }
        `;
    }

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
      // Fallback for malformed JSON
      responseData = {
        narrative:
          content || "The world shifts unpredictably. (AI Parse Error)",
        updates: {},
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Quest API Error:", error);
    return NextResponse.json(
      { error: "Failed to process quest action" },
      { status: 500 }
    );
  }
}
