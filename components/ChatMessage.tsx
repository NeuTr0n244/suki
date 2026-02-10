'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'suki';
    content: string | React.ReactNode;
    timestamp: Date;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message.role === 'suki' && typeof message.content === 'string') {
      setIsTyping(true);
      setDisplayedText('');
      let i = 0;
      const contentStr = message.content as string;
      const timer = setInterval(() => {
        if (i < contentStr.length) {
          setDisplayedText(contentStr.slice(0, i + 1));
          i++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 12); // Faster typing speed for better sync with audio
      return () => clearInterval(timer);
    } else if (typeof message.content === 'string') {
      setDisplayedText(message.content);
    }
  }, [message.content, message.role]);

  const time = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (message.role === 'suki') {
    // If content is a React component (card), render it directly without avatar
    if (typeof message.content !== 'string') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {message.content}
        </motion.div>
      );
    }

    // Regular text message with typewriter effect
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-3 max-w-[85%]"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 font-orbitron text-sm font-bold">
          S
        </div>
        <div className="flex-1">
          <div className="text-xs text-purple-400 mb-1 font-outfit">SUKI</div>
          <div className="suki-message">
            {displayedText}
            {isTyping && <span className="inline-block w-1 h-4 bg-purple-400 ml-1 animate-pulse" />}
          </div>
          <div className="text-xs text-slate-600 mt-1 font-mono">{time}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-end"
    >
      <div className="user-message max-w-[75%]">{displayedText}</div>
      <div className="text-xs text-slate-600 mt-1 font-mono">{time}</div>
    </motion.div>
  );
}
