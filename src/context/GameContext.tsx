"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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

interface GameContextType {
  messages: Message[];
  addMessage: (text: string, sender: Message["sender"]) => void;
  character: CharacterStats;
  updateCharacter: (updates: Partial<CharacterStats>) => void;
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      // 3. Add AI response
      addMessage(data.narrative, "narrator");

      // Future: Update character stats if API returns them
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
