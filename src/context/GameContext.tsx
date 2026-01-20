"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Message = {
  id: string;
  text: string;
  sender: "system" | "user" | "narrator";
  timestamp: number;
};

export type CharacterStats = {
  health: number; // Keep generic health/stamina
  maxHealth: number;
  mana: number; // Could be "Mental Energy"
  maxMana: number;
  level: number;
  inventory: string[];
  preparationPoints: number;
};

export type InteractionType = "PUZZLE" | "DEBATE" | "INVESTIGATION";

export type InteractionState = {
  isActive: boolean;
  type: InteractionType | null;
  title: string;
  description: string;
  progress: number; // 0-100
  clues: string[];
};

interface GameContextType {
  messages: Message[];
  addMessage: (text: string, sender: Message["sender"]) => void;
  character: CharacterStats;
  updateCharacter: (updates: Partial<CharacterStats>) => void;
  // Interaction State
  gameMode: "EXPLORATION" | "INTERACTION";
  setGameMode: (mode: "EXPLORATION" | "INTERACTION") => void;
  interactionState: InteractionState;
  updateInteractionState: (updates: Partial<InteractionState>) => void;
  // Book ID
  currentBookId: string | null;
  setCurrentBookId: (id: string) => void;

  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
  performAction: (action: string, bookId: string) => Promise<void>;
  startQuest: (bookId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const [character, setCharacter] = useState<CharacterStats>({
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    inventory: [],
    preparationPoints: 0,
  });

  // NEW: Interaction State
  const [gameMode, setGameMode] = useState<"EXPLORATION" | "INTERACTION">(
    "EXPLORATION",
  );
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isActive: false,
    type: null,
    title: "",
    description: "",
    progress: 0,
    clues: [],
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

  const updateInteractionState = (updates: Partial<InteractionState>) => {
    setInteractionState((prev) => ({ ...prev, ...updates }));
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
          inventory: character.inventory,
          gameMode,
          interactionState,
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
        const { inventory, stats, interaction } = data.updates;
        const newUpdates: Partial<CharacterStats> = {};

        // INTERACTION TRIGGER
        if (interaction && interaction.active) {
          if (gameMode !== "INTERACTION") {
            // New interaction starting
            setGameMode("INTERACTION");
            addMessage(`🧩 CHALLENGE STARTED: ${interaction.title}`, "system");
            // Give preparation points
            newUpdates.preparationPoints =
              (character.preparationPoints || 0) + 3;
            addMessage(`💡 You gained 3 Preparation Points!`, "system");
          }

          setInteractionState((prev) => ({
            ...prev,
            isActive: true,
            type: interaction.type || prev.type,
            title: interaction.title || prev.title,
            description: interaction.description || prev.description,
            progress:
              interaction.progress !== undefined
                ? interaction.progress
                : prev.progress,
            clues: interaction.clues || prev.clues,
          }));
        } else if (
          interaction &&
          interaction.active === false &&
          gameMode === "INTERACTION"
        ) {
          // Interaction Ended
          setGameMode("EXPLORATION");
          addMessage(`✨ CHALLENGE RESOLVED!`, "system");
          setInteractionState({
            isActive: false,
            type: null,
            title: "",
            description: "",
            progress: 0,
            clues: [],
          });
        }

        // Handle Progress Updates during Interaction
        if (
          data.updates.interactionProgress !== undefined &&
          gameMode === "INTERACTION"
        ) {
          setInteractionState((prev) => {
            const newProgress = Math.min(
              Math.max(
                (prev.progress || 0) + data.updates.interactionProgress,
                0,
              ),
              100,
            );
            if (newProgress >= 100) {
              // Auto-resolve if 100%? Or wait for AI to say active: false?
              // User prompt didn't specify auto-resolve logic, rely on AI "active: false"
            }
            return { ...prev, progress: newProgress };
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
              (item) => !inventory.remove.includes(item),
            );
            inventory.remove.forEach((item: string) => {
              addMessage(`Lost: ${item}`, "system");
            });
          }

          newUpdates.inventory = currentInventory;
        }

        // Stat Updates
        if (stats) {
          if (stats.health) newUpdates.health = character.health + stats.health;
          if (stats.mana) newUpdates.mana = character.mana + stats.mana;
          if (stats.preparationPoints)
            newUpdates.preparationPoints =
              (character.preparationPoints || 0) + stats.preparationPoints;

          // Clamp Player Values
          if (newUpdates.health)
            newUpdates.health = Math.min(
              Math.max(newUpdates.health, 0),
              character.maxHealth,
            );
          if (newUpdates.mana)
            newUpdates.mana = Math.min(
              Math.max(newUpdates.mana, 0),
              character.maxMana,
            );
          if (
            newUpdates.preparationPoints &&
            newUpdates.preparationPoints < 0
          ) {
            newUpdates.preparationPoints = 0;
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
        "system",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const startQuest = async (bookId: string) => {
    setIsProcessing(true);
    try {
      const action = "Begin the story. Describe the opening scene and setting.";

      // Call API
      const response = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          action,
          history: [],
          character,
          gameMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      // Add AI response
      addMessage(data.narrative, "narrator");

      // Handle Game State Updates (Reuse logic if possible, or copy for now)
      if (data.updates) {
        const { inventory, stats, interaction } = data.updates;
        const newUpdates: Partial<CharacterStats> = {};

        // INTERACTION TRIGGER
        if (interaction && interaction.active) {
          setGameMode("INTERACTION");
          addMessage(`🧩 CHALLENGE STARTED: ${interaction.title}`, "system");
          setInteractionState((prev) => ({
            ...prev,
            isActive: true,
            type: interaction.type || prev.type,
            title: interaction.title || prev.title,
            description: interaction.description || prev.description,
            progress:
              interaction.progress !== undefined
                ? interaction.progress
                : prev.progress,
            clues: interaction.clues || prev.clues,
          }));
        }

        // Inventory Updates
        if (inventory && inventory.add && Array.isArray(inventory.add)) {
          const currentInventory = [...character.inventory];
          inventory.add.forEach((item: string) => {
            if (!currentInventory.includes(item)) {
              currentInventory.push(item);
              addMessage(`Received: ${item}`, "system");
            }
          });
          newUpdates.inventory = currentInventory;
        }
        // Stat Updates
        if (stats) {
          if (stats.health)
            newUpdates.health = Math.min(
              Math.max(character.health + stats.health, 0),
              character.maxHealth,
            );
          if (stats.mana)
            newUpdates.mana = Math.min(
              Math.max(character.mana + stats.mana, 0),
              character.maxMana,
            );
          if (stats.preparationPoints)
            newUpdates.preparationPoints =
              (character.preparationPoints || 0) + stats.preparationPoints;
        }

        if (Object.keys(newUpdates).length > 0) {
          updateCharacter(newUpdates);
        }
      }
    } catch (error) {
      console.error("Quest Start Error:", error);
      addMessage("Failed to start the story.", "system");
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
        interactionState,
        updateInteractionState,
        currentBookId,
        setCurrentBookId,
        isProcessing,
        setIsProcessing,
        performAction,
        startQuest,
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
