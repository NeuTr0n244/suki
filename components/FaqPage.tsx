'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is SUKI free?',
      a: 'Completely free. No wallet connection, no sign-up, no catch. Just paste your public address.',
    },
    {
      q: 'How is the Degen Score calculated?',
      a: 'Based on 8 factors: trading frequency, token diversity, rug pull rate, paper/diamond hands ratio, FOMO buying patterns, night trading, average hold time, and consistency.',
    },
    {
      q: 'Can SUKI access my funds?',
      a: 'No. We only read public blockchain data. We never ask for private keys or wallet signatures.',
    },
    {
      q: 'Which blockchains?',
      a: 'Solana only for now. More chains coming soon.',
    },
    {
      q: 'Why are some values approximate?',
      a: 'We use current SOL price for historical conversions. Exact USD values at each trade timestamp would require premium APIs.',
    },
    {
      q: 'Who made SUKI?',
      a: 'A degen who got tired of not knowing their own stats.',
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
      <div className="max-w-3xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron"
        >
          FAQ
        </motion.h1>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-8 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="font-bold text-lg text-slate-200 font-outfit">{faq.q}</span>
                <ChevronDown
                  className={`w-6 h-6 text-purple-400 transition-transform ${
                    expandedFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: expandedFaq === i ? 'auto' : 0 }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-5 text-slate-400 font-outfit leading-relaxed border-l-2 border-purple-500 ml-8">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
