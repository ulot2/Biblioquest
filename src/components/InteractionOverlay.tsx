import React from "react";
import { useGame } from "@/context/GameContext";
import {
  Brain,
  Search,
  MessageCircle,
  XCircle,
  Lightbulb,
  Briefcase,
} from "lucide-react";

export function InteractionOverlay() {
  const { gameMode, interactionState, performAction, character } = useGame();

  // Only show if interaction is active
  if (gameMode !== "INTERACTION" || !interactionState.isActive) return null;

  const { title, description, progress, type } = interactionState;

  const handleInteractionAction = (actionType: string) => {
    // Logic for different specific actions based on the broad category
    let prompt = "";
    switch (actionType) {
      case "ANALYZE":
        prompt = `[ANALYZE] I want to inspect the details of the situation. give me a hint or a clue.`;
        break;
      case "ITEM":
        prompt = `[PRESENT ITEM] I want to show an item from my inventory to solve this.`;
        break;
      case "SOLVE":
        prompt = `[SOLVE/ARGUE] I attempt to resolved the challenge with logic or persuasion.`;
        break;
      case "RETREAT":
        prompt = `[RETREAT] I back away from this challenge for now.`;
        break;
      default:
        prompt = actionType;
    }
    performAction(prompt, "active-book");
  };

  const getIconForType = () => {
    switch (type) {
      case "PUZZLE":
        return <Brain size={32} className="text-purple-400" />;
      case "DEBATE":
        return <MessageCircle size={32} className="text-blue-400" />;
      case "INVESTIGATION":
        return <Search size={32} className="text-amber-400" />;
      default:
        return <Lightbulb size={32} className="text-white" />;
    }
  };

  const getThemeStyles = () => {
    switch (type) {
      case "PUZZLE":
        return {
          bg: "bg-purple-900",
          border: "border-purple-500/50",
          glow: "shadow-purple-900/20",
          accent: "purple",
          button: "bg-purple-700 hover:bg-purple-600",
          bar: "from-purple-600 to-purple-400",
          text: "text-purple-400",
        };
      case "DEBATE":
        return {
          bg: "bg-blue-900",
          border: "border-blue-500/50",
          glow: "shadow-blue-900/20",
          accent: "blue",
          button: "bg-blue-700 hover:bg-blue-600",
          bar: "from-blue-600 to-blue-400",
          text: "text-blue-400",
        };
      case "INVESTIGATION":
        return {
          bg: "bg-amber-900",
          border: "border-amber-500/50",
          glow: "shadow-amber-900/20",
          accent: "amber",
          button: "bg-amber-700 hover:bg-amber-600",
          bar: "from-amber-600 to-amber-400",
          text: "text-amber-400",
        };
      default:
        return {
          bg: "bg-gray-900",
          border: "border-gray-500/50",
          glow: "shadow-gray-900/20",
          accent: "gray",
          button: "bg-gray-700 hover:bg-gray-600",
          bar: "from-gray-600 to-gray-400",
          text: "text-gray-400",
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
      <div
        className={`w-full max-w-3xl bg-gray-900 border ${styles.border} rounded-2xl shadow-2xl ${styles.glow} overflow-hidden flex flex-col`}
      >
        {/* Header: The Challenge */}
        <div className="bg-gray-950/80 p-6 border-b border-white/10 text-center relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-${styles.accent}-500 shadow-[0_0_20px_rgba(var(--color-${styles.accent}-500),0.5)]`}
          />

          <div className="flex flex-col items-center gap-4 z-10 relative">
            <div
              className={`w-16 h-16 rounded-full bg-black border-2 border-${styles.accent}-500 flex items-center justify-center shadow-lg`}
            >
              {getIconForType()}
            </div>

            <div>
              <div
                className={`${styles.text} text-xs font-bold tracking-widest uppercase mb-1`}
              >
                {type || "CHALLENGE"}
              </div>
              <h2 className="text-3xl font-black text-white px-8">{title}</h2>
            </div>

            <p className="text-gray-300 max-w-lg italic">"{description}"</p>
          </div>
        </div>

        {/* Center: Progress Meter */}
        <div className="bg-gray-900 p-8 flex flex-col items-center gap-2">
          <div className="w-full flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            <span>Unresolved</span>
            <span>Resolved</span>
          </div>
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden relative border border-white/5">
            <div
              className={`h-full bg-linear-to-r ${styles.bar} transition-all duration-700 ease-out`}
              style={{ width: `${progress}%` }}
            />

            {/* Notches */}
            <div className="absolute inset-0 flex justify-between px-1">
              {[25, 50, 75].map((p) => (
                <div
                  key={p}
                  className="h-full w-px bg-white/10"
                  style={{ left: `${p}%` }}
                />
              ))}
            </div>
          </div>
          <div className="text-white font-mono text-sm mt-2">
            Progress: {progress}%
          </div>
        </div>

        {/* Bottom: Response Deck */}
        <div className="bg-black/40 p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Analyze */}
          <button
            onClick={() => handleInteractionAction("ANALYZE")}
            disabled={
              !character.preparationPoints || character.preparationPoints < 1
            }
            className="flex flex-col items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 hover:text-amber-300 border border-white/5 p-4 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-bold text-sm">INSPECT</span>
            <span className="text-[10px] text-gray-500 uppercase">
              Cost: 1 Point
            </span>
          </button>

          {/* 2. Present Item */}
          <button
            onClick={() => handleInteractionAction("ITEM")}
            className="flex flex-col items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 hover:text-blue-300 border border-white/5 p-4 rounded-xl transition-all group"
          >
            <Briefcase
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-bold text-sm">ITEM</span>
            <span className="text-[10px] text-gray-500 uppercase">
              Use Inventory
            </span>
          </button>

          {/* 3. Solve/Argue */}
          <button
            onClick={() => handleInteractionAction("SOLVE")}
            className={`flex flex-col items-center justify-center gap-2 ${styles.button} text-white border border-white/10 p-4 rounded-xl transition-all group shadow-lg ${styles.glow}`}
          >
            <Lightbulb
              size={24}
              className="group-hover:scale-110 transition-transform text-white"
            />
            <span className="font-bold text-sm">SOLVE</span>
            <span className="text-[10px] text-white/60 uppercase">
              Attempt Resolution
            </span>
          </button>

          {/* 4. Retreat */}
          <button
            onClick={() => handleInteractionAction("RETREAT")}
            className="flex flex-col items-center justify-center gap-2 bg-gray-900 hover:bg-red-900/30 hover:text-red-400 border border-white/5 p-4 rounded-xl transition-all group"
          >
            <XCircle
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-bold text-sm">RETREAT</span>
            <span className="text-[10px] text-gray-500 uppercase">
              Leave Interaction
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
