'use client';

import { useRef, useEffect, ReactNode } from 'react';
import ChatInput from './ChatInput';

interface ChatProps {
  children: ReactNode;
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function Chat({ children, onSend, disabled }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [children]);

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="px-6 py-3 border-b border-purple-500/20 bg-black/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm font-rajdhani font-semibold">SUKI is online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-rajdhani font-semibold">Live</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
        {children}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={onSend} disabled={disabled} />
    </div>
  );
}
