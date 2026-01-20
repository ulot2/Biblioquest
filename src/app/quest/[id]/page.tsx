"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  User,
  Sparkles,
  Send,
  Key,
  Scroll,
  Sword,
  Shield,
  FlaskConical,
  Map as MapIcon,
  Coins,
  Package,
} from "lucide-react";
import Link from "next/link";
import { GameProvider, useGame } from "@/context/GameContext";
import { InteractionOverlay } from "@/components/InteractionOverlay";

function QuestView({ id }: { id: string }) {
  const {
    messages,
    addMessage,
    character,
    updateCharacter,
    isProcessing,
    setIsProcessing,
    performAction,
    startQuest,
  } = useGame();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial Quest Start
  useEffect(() => {
    if (messages.length === 0 && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startQuest(id);
    }
  }, [id, startQuest, messages.length]);

  const handleAction = async () => {
    if (!input.trim() || isProcessing) return;

    const actionToPerform = input;
    setInput(""); // Clear input immediately

    // Narrative Engine: All inputs are treated as narrative actions or puzzle solutions
    await performAction(actionToPerform, id);
  };

  const getItemIcon = (itemName: string) => {
    const lower = itemName.toLowerCase();

    // Narrative / Puzzle Items
    if (
      lower.includes("key") ||
      lower.includes("lockpick") ||
      lower.includes("access")
    )
      return <Key size={20} className="text-amber-400" />;

    if (
      lower.includes("note") ||
      lower.includes("letter") ||
      lower.includes("evidence") ||
      lower.includes("paper") ||
      lower.includes("scroll") ||
      lower.includes("clue")
    )
      return <Scroll size={20} className="text-amber-100" />;

    // RPG Fallbacks (kept for legacy support or specific story items)
    if (
      lower.includes("sword") ||
      lower.includes("blade") ||
      lower.includes("knife") ||
      lower.includes("dagger")
    )
      return <Sword size={20} className="text-red-400" />;
    if (lower.includes("shield") || lower.includes("armor"))
      return <Shield size={20} className="text-blue-400" />;
    if (
      lower.includes("potion") ||
      lower.includes("flask") ||
      lower.includes("elixir")
    )
      return <FlaskConical size={20} className="text-purple-400" />;
    if (lower.includes("map"))
      return <MapIcon size={20} className="text-green-400" />;
    if (
      lower.includes("coin") ||
      lower.includes("gold") ||
      lower.includes("gem") ||
      lower.includes("money")
    )
      return <Coins size={20} className="text-yellow-400" />;
    if (
      lower.includes("book") ||
      lower.includes("tome") ||
      lower.includes("diary")
    )
      return <BookOpen size={20} className="text-amber-700" />;

    return <Package size={20} className="text-gray-400" />; // Fallback
  };

  return (
    <div className="lg:h-screen min-h-screen flex flex-col bg-charcoal text-white font-sans selection:bg-amber-500/30 overflow-x-hidden lg:overflow-hidden relative">
      <InteractionOverlay />

      {/* Header / Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-black/20 backdrop-blur-md shrink-0 sticky top-0 z-30 lg:relative">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium hidden sm:inline">
            Exit Quest
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber" />
          <h1 className="text-lg font-bold text-gray-200 truncate max-w-[200px] sm:max-w-none">
            {id.startsWith("custom-")
              ? decodeURIComponent(id.replace("custom-", ""))
              : `Quest ID: ${id}`}
          </h1>
        </div>
        <div className="w-10 sm:w-20"></div> {/* Spacer for alignment */}
      </header>

      {/* Main Game Area */}
      <main className="flex-1 lg:min-h-0 container mx-auto max-w-6xl p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
        {/* Left Column: Game Output (Story) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-[70vh] lg:h-full lg:min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-4 md:p-8 overflow-y-auto shadow-inner relative scroll-smooth"
          >
            {/* Decorative gradients */}
            <div className="sticky top-0 left-0 right-0 h-20 bg-linear-to-b from-charcoal/50 to-transparent pointer-events-none z-10" />

            <div className="space-y-6 text-base md:text-lg leading-relaxed text-gray-300 pb-20">
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
                  <span>The story unfolds...</span>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="min-h-32 bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col gap-3 shrink-0">
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
                placeholder="What will you do? (e.g., 'Inspect the letter', 'Ask about the will')"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber/50 placeholder:text-gray-600 transition-colors"
              />
              <button
                onClick={handleAction}
                disabled={isProcessing}
                className="px-6 py-3 bg-amber text-black font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="hidden sm:inline">Act</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Character & Status */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-auto lg:h-full">
          {/* Character Card */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber to-orange-600 flex items-center justify-center text-black font-bold text-xl shadow-lg ring-2 ring-white/10">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Protagonist</h2>
                <div className="flex items-center gap-2 text-xs text-amber">
                  {/* Narrative Role/Level */}
                  <span>Level {character.level}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stamina</span>
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

              {/* Preparation Points Display */}
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">Preparation Points</span>
                <span className="text-amber font-mono text-lg">
                  {character.preparationPoints || 0}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">Focus</span>
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
              Clues & Items
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {/* Render actual items */}
              {character.inventory.map((item, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white/10 rounded-lg border border-amber/30 flex items-center justify-center hover:border-amber/60 transition-colors cursor-help group relative"
                  title={item}
                >
                  {getItemIcon(item)}

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 border border-white/20">
                    {item}
                  </div>
                </div>
              ))}

              {/* Render empty slots to fill grid up to 8 */}
              {Array.from({
                length: Math.max(8 - character.inventory.length, 0),
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square bg-black/20 rounded-lg border border-white/5 flex items-center justify-center"
                />
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
