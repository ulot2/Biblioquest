"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, User, Sparkles, Send } from "lucide-react";
import Link from "next/link";
import { GameProvider, useGame } from "@/context/GameContext";

function QuestView({ id }: { id: string }) {
  const {
    messages,
    addMessage,
    character,
    updateCharacter,
    isProcessing,
    setIsProcessing,
    performAction,
  } = useGame();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAction = async () => {
    if (!input.trim() || isProcessing) return;

    const actionToPerform = input;
    setInput(""); // Clear input immediately

    await performAction(actionToPerform, id);
  };

  return (
    <div className="h-screen flex flex-col bg-charcoal text-white font-sans selection:bg-amber-500/30 overflow-hidden">
      {/* Header / Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Exit Quest</span>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber" />
          <h1 className="text-lg font-bold text-gray-200">Quest ID: {id}</h1>
        </div>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </header>

      {/* Main Game Area */}
      <main className="flex-1 min-h-0 container mx-auto max-w-6xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Game Output (Story) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-8 overflow-y-auto shadow-inner relative scroll-smooth"
          >
            {/* Decorative gradients */}
            <div className="sticky top-0 left-0 right-0 h-20 bg-linear-to-b from-charcoal/50 to-transparent pointer-events-none z-10" />

            <div className="space-y-6 text-lg leading-relaxed text-gray-300 pb-20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                    msg.sender === "user" ? "text-right" : ""
                  }`}
                >
                  {msg.sender === "user" ? (
                    <span className="inline-block bg-white/10 text-white px-4 py-2 rounded-lg rounded-tr-none">
                      {msg.text}
                    </span>
                  ) : (
                    <div
                      className={
                        msg.sender === "system" ? "text-amber italic" : ""
                      }
                    >
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="text-gray-500 animate-pulse flex gap-1 items-center">
                  <Sparkles size={14} />
                  <span>The world reacts...</span>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="min-h-32 bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider font-bold">
              <Sparkles size={12} />
              <span>Your Action</span>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction()}
                placeholder="What do you want to do?"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber/50 placeholder:text-gray-600 transition-colors"
              />
              <button
                onClick={handleAction}
                disabled={isProcessing}
                className="px-6 py-3 bg-amber text-black font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Act</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Character & Status */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          {/* Character Card */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber to-orange-600 flex items-center justify-center text-black font-bold text-xl shadow-lg ring-2 ring-white/10">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Adventurer</h2>
                <div className="flex items-center gap-2 text-xs text-amber">
                  <span>Level {character.level}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>Novice</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Health</span>
                <span className="text-green-400 font-mono">
                  {character.health}/{character.maxHealth}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={
                    {
                      width: `${
                        (character.health / character.maxHealth) * 100
                      }%`,
                    } as React.CSSProperties
                  }
                />
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">Mana</span>
                <span className="text-blue-400 font-mono">
                  {character.mana}/{character.maxMana}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={
                    {
                      width: `${(character.mana / character.maxMana) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          </div>

          {/* Inventory / Stats Placeholder */}
          <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Inventory
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-black/20 rounded-lg border border-white/5 flex items-center justify-center hover:border-white/20 transition-colors cursor-pointer group"
                >
                  <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-amber/50 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Untrap the params
  const { id } = use(params);

  return (
    <GameProvider>
      <QuestView id={id} />
    </GameProvider>
  );
}
