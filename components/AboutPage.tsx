'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  const features = [
    {
      icon: '📈',
      title: 'Profit & Loss',
      desc: 'Real PnL for every token — what you made and lost',
    },
    {
      icon: '☠️',
      title: 'Rug Detection',
      desc: 'Finds dead tokens, rug pulls, and honeypots',
    },
    {
      icon: '⏱️',
      title: 'Hold Patterns',
      desc: 'How long you hold and your paper/diamond ratio',
    },
    {
      icon: '🎯',
      title: 'Win Rate',
      desc: 'Your success rate across all trades',
    },
    {
      icon: '🌙',
      title: 'Night Trading',
      desc: 'Detects late-night FOMO trading habits',
    },
    {
      icon: '🔥',
      title: 'Degen Score',
      desc: 'Combined score rating your overall degeneracy',
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
      <div className="max-w-6xl w-full space-y-16">
        {/* What SUKI Analyzes */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron"
          >
            What SUKI Analyzes ✦
          </motion.h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="glass-card p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-slate-200 mb-3 font-outfit">
                  {feature.title}
                </h4>
                <p className="text-sm text-slate-400 font-outfit leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-10 text-center border-2 border-purple-500/30"
        >
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold text-slate-200 mb-6 font-outfit">
            Your Privacy is Safe
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed font-outfit max-w-3xl mx-auto">
            SUKI never stores your wallet address or trading data. All analysis runs in
            real-time using public on-chain data via Helius and DexScreener APIs. Data is
            discarded after your session. No wallet connection needed — ever.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
