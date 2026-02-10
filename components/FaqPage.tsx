'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function FaqPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is SUKI?',
      a: 'SUKI is an AI-powered anime degen analyst that analyzes your Solana wallet trading history, calculates your Degen Score (0-100), tracks your PnL, and roasts your trading decisions with personality.',
    },
    {
      q: 'Is SUKI free?',
      a: 'Completely free. No wallet connection, no sign-up, no catch. Just paste your public Solana address and get instant insights.',
    },
    {
      q: 'Is my wallet safe?',
      a: 'Absolutely. We only read public blockchain data using your wallet address. We never ask for private keys, seed phrases, or wallet signatures. Your funds are completely safe.',
    },
    {
      q: 'How does the Degen Score work?',
      a: 'Your score is calculated based on 8 factors: trading frequency, token diversity, rug pull survival rate, paper/diamond hands ratio, FOMO buying patterns, night trading habits, average hold time, and consistency. Higher scores mean more degen behavior.',
    },
    {
      q: 'What blockchain does SUKI support?',
      a: 'Currently Solana only. We track all SPL token trades on the Solana blockchain. More chains coming soon.',
    },
    {
      q: 'Who built SUKI?',
      a: 'Built by a degen who got tired of not knowing their own trading stats. Powered by Helius API for blockchain data, Claude AI for personality, and Next.js for the frontend.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-16 px-6 font-quicksand"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-center gradient-text font-orbitron mb-12 animate-slide-up">
          FAQ
        </h1>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="accordion-item"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className={`accordion-header ${expandedFaq === i ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-rajdhani font-bold text-lg text-purple-200">
                    {faq.q}
                  </span>
                  <span className="text-2xl text-purple-400 font-orbitron transition-transform duration-300" style={{ transform: expandedFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    +
                  </span>
                </div>
              </div>
              <div className={`accordion-content ${expandedFaq === i ? 'open' : ''}`}>
                <div className="accordion-body">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
