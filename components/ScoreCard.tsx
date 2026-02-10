'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ScoreCardProps {
  score: number;
  title: string;
  emoji: string;
  desc: string;
}

export default function ScoreCard({ score, title, emoji, desc }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = score / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [score]);

  const getGlowColor = (s: number) => {
    if (s >= 80) return 'rgba(239, 68, 68, 0.3)';
    if (s >= 60) return 'rgba(251, 146, 60, 0.3)';
    if (s >= 40) return 'rgba(251, 191, 36, 0.3)';
    if (s >= 20) return 'rgba(34, 211, 238, 0.3)';
    return 'rgba(74, 222, 128, 0.3)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-8 text-center"
      style={{
        boxShadow: `0 0 40px ${getGlowColor(score)}`,
      }}
    >
      <div className="text-sm font-rajdhani font-bold text-purple-300 mb-2 uppercase tracking-wider">
        Degen Score
      </div>
      <div
        className="text-7xl font-orbitron font-black mb-4 gradient-text"
        style={{ lineHeight: 1 }}
      >
        {animatedScore}
      </div>
      <div className="text-2xl font-bold text-purple-200 mb-2 font-rajdhani">{title}</div>
      <div className="text-sm text-slate-400 font-quicksand leading-relaxed">{desc}</div>
      <div className="mt-6 w-full h-3 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        />
      </div>
    </motion.div>
  );
}
