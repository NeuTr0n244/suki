'use client';

import { motion } from 'framer-motion';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Paste Wallet Address',
      desc: 'Simply drop your Solana wallet address in the chat. No sign-up, no wallet connection required.',
      details: 'SUKI reads public blockchain data only',
    },
    {
      step: '02',
      title: 'AI Analysis Begins',
      desc: 'SUKI scans your entire trading history, token transactions, and calculates real-time PnL across all trades.',
      details: 'Powered by Helius API + Claude AI',
    },
    {
      step: '03',
      title: 'Degen Score Reveal',
      desc: 'Receive your personalized Degen Score from 0 to 100, based on 8 key trading behavior factors.',
      details: 'From cautious holder to ultimate degen',
    },
    {
      step: '04',
      title: 'Interactive Chat',
      desc: 'Ask SUKI anything about your wallet: best trades, worst losses, patterns, advice, and more.',
      details: 'Get roasted or get insights',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-16 px-6 font-quicksand"
    >
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Title */}
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text font-orbitron">
            How It Works
          </h1>
          <p className="text-xl text-purple-300 font-rajdhani font-semibold">
            Four simple steps to discover your degen identity
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-8 md:left-16 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 opacity-30 hidden sm:block" />

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 + 0.2 }}
                className="relative"
              >
                <div className="flex items-start gap-6 md:gap-12">
                  {/* Step Number Circle */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full glass flex items-center justify-center border-2 border-purple-500/40 hover-scale animate-pulse-glow z-10 relative">
                      <span className="text-3xl md:text-4xl font-bold gradient-text font-orbitron">
                        {step.step}
                      </span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 glass rounded-2xl p-6 md:p-8 hover-scale">
                    <h3 className="text-2xl md:text-3xl font-bold text-purple-200 mb-3 font-rajdhani">
                      {step.title}
                    </h3>
                    <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-4 font-quicksand">
                      {step.desc}
                    </p>
                    <div className="inline-block px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <span className="text-sm text-purple-400 font-rajdhani font-semibold">
                        {step.details}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-6 pt-8 animate-slide-up">
          <p className="text-lg text-slate-400 font-quicksand">
            Ready to see your trading truth?
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-neon inline-block"
          >
            Try SUKI Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
