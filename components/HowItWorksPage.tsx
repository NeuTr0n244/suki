'use client';

import { motion } from 'framer-motion';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      icon: '📋',
      title: 'Paste Wallet',
      desc: 'Drop your Solana wallet address in the chat',
    },
    {
      step: '02',
      icon: '🔍',
      title: 'SUKI Analyzes',
      desc: 'She scans all your trades, tokens, and calculates PnL',
    },
    {
      step: '03',
      icon: '✦',
      title: 'Get Your Score',
      desc: 'Receive your Degen Score from 0 to 100',
    },
    {
      step: '04',
      icon: '💬',
      title: 'Chat & Learn',
      desc: 'Ask SUKI questions about your trading patterns',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8"
    >
      <div className="max-w-6xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron"
        >
          How It Works ✦
        </motion.h1>
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="glass-card p-8 hover:border-purple-500/30 transition-all"
            >
              <div className="text-6xl font-orbitron font-black text-purple-500/30 mb-4">
                {step.step}
              </div>
              <div className="text-6xl mb-6">{step.icon}</div>
              <h3 className="text-2xl font-bold text-slate-200 mb-3 font-outfit">{step.title}</h3>
              <p className="text-base text-slate-400 font-outfit leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
