'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function AnimatedCounter({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Landing() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const steps = [
    { step: '01', icon: '📋', title: 'Paste Wallet', desc: 'Drop your Solana wallet address in the chat above' },
    { step: '02', icon: '🔍', title: 'SUKI Analyzes', desc: 'She scans all your trades, tokens, and calculates PnL' },
    { step: '03', icon: '✦', title: 'Get Your Score', desc: 'Receive your Degen Score from 0 to 100' },
    { step: '04', icon: '💬', title: 'Chat & Learn', desc: 'Ask SUKI questions about your trading patterns' },
  ];

  const features = [
    { icon: '📈', title: 'Profit & Loss', desc: 'Real PnL for every token — what you made and lost' },
    { icon: '☠️', title: 'Rug Detection', desc: 'Finds dead tokens, rug pulls, and honeypots' },
    { icon: '⏱️', title: 'Hold Patterns', desc: 'How long you hold and your paper/diamond ratio' },
    { icon: '🎯', title: 'Win Rate', desc: 'Your success rate across all trades' },
    { icon: '🌙', title: 'Night Trading', desc: 'Detects late-night FOMO trading habits' },
    { icon: '🔥', title: 'Degen Score', desc: 'Combined score rating your overall degeneracy' },
  ];

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
    <div className="space-y-24 pb-24">
      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron"
        >
          How It Works ✦
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-purple-500/30 transition-all group"
            >
              <div className="text-6xl font-orbitron font-black text-purple-500/20 mb-3">{step.step}</div>
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold text-slate-200 mb-2 font-outfit">{step.title}</h3>
              <p className="text-sm text-slate-400 font-outfit">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What SUKI Analyzes */}
      <section className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron"
        >
          What SUKI Analyzes ✦
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-purple-500/30 transition-all"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-bold text-slate-200 mb-2 font-outfit">{feature.title}</h3>
              <p className="text-sm text-slate-400 font-outfit">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 text-center border-2 border-purple-500/30"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-200 mb-4 font-outfit">Your Privacy is Safe</h2>
          <p className="text-slate-400 leading-relaxed font-outfit">
            SUKI never stores your wallet address or trading data. All analysis runs in real-time using
            public on-chain data via Helius and DexScreener APIs. Data is discarded after your session.
            No wallet connection needed — ever.
          </p>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron"
        >
          FAQ
        </motion.h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="font-bold text-slate-200 font-outfit">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-purple-400 transition-transform ${
                    expandedFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: expandedFaq === i ? 'auto' : 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 text-slate-400 font-outfit border-l-2 border-purple-500 ml-6">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { label: 'Wallets Analyzed', value: 2500 },
            { label: 'Trades Scanned', value: 1000000 },
            { label: 'Wallets Stored', value: 0 },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-5xl font-orbitron font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                <AnimatedCounter end={stat.value} />
                {stat.value > 1000 ? '+' : ''}
              </div>
              <div className="text-sm text-slate-400 font-outfit">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 pt-12 max-w-4xl mx-auto px-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-purple-400">✦</span>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron">
              SUKI
            </h3>
            <span className="text-slate-500 font-outfit">— Your Anime Degen Analyst</span>
          </div>
          <a
            href="https://x.com/SukiAnalyst"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-purple-400 hover:text-purple-300 transition-colors font-outfit"
          >
            X (Twitter): @SukiAnalyst
          </a>
          <div className="border-t border-purple-500/10 pt-6 text-xs text-slate-500 font-mono space-y-2">
            <p>© 2026 SUKI. Not financial advice. DYOR.</p>
            <p>Built with ☕ and questionable life choices.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
