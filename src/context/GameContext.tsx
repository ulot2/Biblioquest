"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// ... imports
import { Monster, getMonster } from "@/lib/dnd";

export type Message = {
  id: string;
  text: string;
  sender: "system" | "user" | "narrator";
  timestamp: number;
};

export type CharacterStats = {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  inventory: string[];
};

export type CombatState = {
  isActive: boolean;
  enemy: Monster | null;
  log: string[];
};

interface GameContextType {
  messages: Message[];
  addMessage: (text: string, sender: Message["sender"]) => void;
  character: CharacterStats;
  updateCharacter: (updates: Partial<CharacterStats>) => void;
  // Combat State
  gameMode: "EXPLORATION" | "COMBAT";
  setGameMode: (mode: "EXPLORATION" | "COMBAT") => void;
  combatState: CombatState;
  updateCombatState: (updates: Partial<CombatState>) => void;
  // Book ID
  currentBookId: string | null;
  setCurrentBookId: (id: string) => void;

  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
  performAction: (action: string, bookId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      text: "The adventure begins...",
      sender: "system",
      timestamp: Date.now(),
    },
  ]);

  const [character, setCharacter] = useState<CharacterStats>({
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    inventory: [],
  });

  // NEW: Combat State
  const [gameMode, setGameMode] = useState<"EXPLORATION" | "COMBAT">(
    "EXPLORATION"
  );
  const [combatState, setCombatState] = useState<CombatState>({
    isActive: false,
    enemy: null,
    log: [],
  });

  // NEW: Book ID State
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = (text: string, sender: Message["sender"]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        text,
        sender,
        timestamp: Date.now(),
      },
    ]);
  };

  const updateCharacter = (updates: Partial<CharacterStats>) => {
    setCharacter((prev) => ({ ...prev, ...updates }));
  };

  const updateCombatState = (updates: Partial<CombatState>) => {
    setCombatState((prev) => ({ ...prev, ...updates }));
  };

  const performAction = async (action: string, bookId: string) => {
    // 1. Add user message
    addMessage(action, "user");
    setIsProcessing(true);

    try {
      // 2. Call API
      const response = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          action,
          history: messages,
          character,
          gameMode, // Pass current mode to AI
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      // 3. Add AI response
      addMessage(data.narrative, "narrator");

      // 4. Handle Game State Updates
      if (data.updates) {
        const { inventory, stats, mode, enemy } = data.updates;
        const newUpdates: Partial<CharacterStats> = {};

        // COMBAT TRIGGER
        if (mode === "COMBAT" && enemy) {
          setGameMode("COMBAT");
          addMessage(`⚠️ COMBAT STARTED: ${enemy}`, "system");

          // Fetch Monster Details
          getMonster(enemy).then((monster) => {
            if (monster) {
              setCombatState({
                isActive: true,
                enemy: monster,
                log: [`${monster.name} prepares to attack!`],
              });
            } else {
              addMessage(
                `(System: Could not find stats for ${enemy})`,
                "system"
              );
            }
          });
        }

        // Inventory Updates
        if (inventory) {
          let currentInventory = [...character.inventory];

          if (inventory.add && Array.isArray(inventory.add)) {
            inventory.add.forEach((item: string) => {
              if (!currentInventory.includes(item)) {
                currentInventory.push(item);
                addMessage(`Received: ${item}`, "system");
              }
            });
          }

          if (inventory.remove && Array.isArray(inventory.remove)) {
            currentInventory = currentInventory.filter(
              (item) => !inventory.remove.includes(item)
            );
            inventory.remove.forEach((item: string) => {
              addMessage(`Lost: ${item}`, "system");
            });
          }

          newUpdates.inventory = currentInventory;
        }

        // Stat Updates (Player & Enemy)
        if (stats) {
          // 1. Player Stats
          if (stats.health) newUpdates.health = character.health + stats.health;
          if (stats.mana) newUpdates.mana = character.mana + stats.mana;

          // Clamp Player Values
          if (newUpdates.health)
            newUpdates.health = Math.min(
              Math.max(newUpdates.health, 0),
              character.maxHealth
            );
          if (newUpdates.mana)
            newUpdates.mana = Math.min(
              Math.max(newUpdates.mana, 0),
              character.maxMana
            );

          // 2. Enemy Stats (Combat Only)
          if (
            gameMode === "COMBAT" &&
            combatState.enemy &&
            stats.enemy_damage
          ) {
            const damage = stats.enemy_damage;
            const newEnemyHp = Math.max(
              combatState.enemy.hit_points - damage,
              0
            );
            const newLog = [...combatState.log];

            if (data.updates.combatLog) {
              newLog.push(...data.updates.combatLog);
            }

            // Update Combat State
            setCombatState((prev) => ({
              ...prev,
              enemy: prev.enemy
                ? { ...prev.enemy, hit_points: newEnemyHp }
                : null,
              log: newLog,
            }));

            // Check for Death
            if (newEnemyHp <= 0) {
              setGameMode("EXPLORATION");
              addMessage(
                `🏆 VICTORY! You defeated the ${combatState.enemy.name}!`,
                "system"
              );
              setCombatState((prev) => ({
                ...prev,
                isActive: false,
                enemy: null,
                log: [],
              }));
            }
          }
        }

        if (Object.keys(newUpdates).length > 0) {
          updateCharacter(newUpdates);
        }
      }
    } catch (error) {
      console.error("Quest Error:", error);
      addMessage(
        "A mysterious force prevents you from acting. (Error connecting to AI)",
        "system"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <GameContext.Provider
      value={{
        messages,
        addMessage,
        character,
        updateCharacter,
        gameMode,
        setGameMode,
        combatState,
        updateCombatState,
        currentBookId,
        setCurrentBookId,
        isProcessing,
        setIsProcessing,
        performAction,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
