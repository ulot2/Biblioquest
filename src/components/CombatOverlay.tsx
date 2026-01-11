import React from "react";
import { useGame } from "@/context/GameContext";
import { Shield, Sword, Heart, Zap, Scroll, XCircle, User } from "lucide-react";

export function CombatOverlay() {
  const { gameMode, combatState, performAction, messages, character } =
    useGame();
  const { enemy, log } = combatState;

  if (gameMode !== "COMBAT" || !enemy) return null;

  const handleCombatAction = (action: string) => {
    // Determine the user's intent and send it to the AI
    // In a real game, we might handle dice rolls here.
    // For now, we rely on the Narrator AI to resolve it.

    const prompt = `[COMBAT ACTION] I use ${action} on the ${enemy.name}.`;
    performAction(prompt, "active-book"); // active-book ID usage needs refinement in context
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-4xl bg-gray-900 border border-red-500/50 rounded-2xl shadow-2xl shadow-red-900/20 overflow-hidden flex flex-col md:flex-row h-[600px]">
        {/* Left: Battlefield (Enemy vs Player) */}
        <div className="w-full md:w-1/3 bg-gray-950/50 p-6 border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-red-900/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-blue-900/20 to-transparent pointer-events-none" />

          {/* ENEMY SECTION */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="text-center">
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-wider drop-shadow-md">
                {enemy.name}
              </h2>
              <div className="text-red-300/60 text-xs font-mono">
                CR {enemy.challenge_rating}
              </div>
            </div>

            <div className="w-20 h-20 rounded-full bg-black border-2 border-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <Sword size={32} className="text-red-500" />
            </div>

            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>HP</span>
                <span className="text-white">{enemy.hit_points}</span>
              </div>
              <div className="w-full bg-red-900/40 rounded-full h-2 overflow-hidden">
                <div className="bg-red-500 h-full w-full" />
                {/* Note: We don't have max HP for enemies easily from API without processing, assuming full for now or just visual */}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="relative z-10 flex justify-center py-4">
            <span className="font-black text-white/20 text-4xl italic">VS</span>
          </div>

          {/* PLAYER SECTION */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span className="text-white">
                  {character.health}/{character.maxHealth}
                </span>
                <span>YOUR HP</span>
              </div>
              <div className="w-full bg-blue-900/40 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{
                    width: `${(character.health / character.maxHealth) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="w-20 h-20 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <User size={32} className="text-blue-400" />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest">
                HERO
              </h2>
            </div>
          </div>
        </div>

        {/* Right: Actions & Log */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Combat Log */}
          <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-2 border-b border-white/10">
            {/* We can show the last few narrative messages here or a dedicated log */}
            <div className="text-gray-500 italic">Combat started...</div>
            {log.map((line, i) => (
              <div key={i} className="text-red-300">
                » {line}
              </div>
            ))}
            {/* Show recent AI responses that are combat related */}
            {messages.slice(-3).map((m) => (
              <div
                key={m.id}
                className={m.sender === "user" ? "text-gray-400" : "text-white"}
              >
                {m.sender === "narrator" ? `DM: ${m.text}` : `You: ${m.text}`}
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="h-32 bg-black/60 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleCombatAction("Melee Attack")}
              className="flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all active:scale-95 group"
            >
              <Sword
                size={24}
                className="group-hover:rotate-12 transition-transform"
              />
              <span className="font-bold text-sm">ATTACK</span>
            </button>

            <button
              onClick={() => handleCombatAction("Magic Missile")}
              className="flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-95"
            >
              <Zap size={24} />
              <span className="font-bold text-sm">SPELL</span>
            </button>

            <button
              onClick={() => handleCombatAction("Healing Potion")}
              className="flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all active:scale-95"
            >
              <Heart size={24} />
              <span className="font-bold text-sm">ITEM</span>
            </button>

            <button
              onClick={() => handleCombatAction("Flee")}
              className="flex flex-col items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all active:scale-95"
            >
              <XCircle size={24} />
              <span className="font-bold text-sm">FLEE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
