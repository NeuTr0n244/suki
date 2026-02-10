'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SpeakingContextType {
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
}

const SpeakingContext = createContext<SpeakingContextType | undefined>(undefined);

// Global setter that can be called from anywhere (including non-React code)
let globalSetSpeaking: ((speaking: boolean) => void) | null = null;

export function SpeakingProvider({ children }: { children: ReactNode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Expose setter globally
  useEffect(() => {
    globalSetSpeaking = setIsSpeaking;
    return () => {
      globalSetSpeaking = null;
    };
  }, []);

  return (
    <SpeakingContext.Provider value={{ isSpeaking, setIsSpeaking }}>
      {children}
    </SpeakingContext.Provider>
  );
}

export function useSpeaking() {
  const context = useContext(SpeakingContext);
  if (context === undefined) {
    throw new Error('useSpeaking must be used within a SpeakingProvider');
  }
  return context;
}

// Function that can be called from non-React code (like TTS)
export function setGlobalSpeaking(speaking: boolean) {
  if (globalSetSpeaking) {
    globalSetSpeaking(speaking);
  }
}
