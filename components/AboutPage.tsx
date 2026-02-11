'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-6 py-24"
    >
      <div className="max-w-3xl w-full">
        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-12 space-y-8 backdrop-blur-xl bg-slate-900/60 border border-purple-500/30 shadow-2xl"
        >
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center gradient-text font-orbitron">
            About SUKI
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-200 leading-relaxed text-center">
            SUKI is your anime-powered degen analyst. She dives deep into your Solana wallet, roasts your trades,
            calculates your PnL, and gives you a Degen Score from 0 to 100. Built with AI and Web3 technology,
            SUKI combines on-chain analysis with anime personality to make crypto trading insights fun and savage.
            Paste your wallet and find out if you're ngmi or actually based.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="https://x.com/SukiAnalyst"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600
                       hover:from-purple-500 hover:to-pink-500 transition-all duration-300
                       text-white font-bold text-lg text-center hover:scale-105
                       shadow-lg hover:shadow-purple-500/50"
            >
              <span className="relative z-10">Follow on X</span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity
                            bg-gradient-to-r from-purple-400 to-pink-400 blur-xl -z-10"></div>
            </a>

            <a
              href="https://x.com/i/communities/2021718673048973603"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600
                       hover:from-pink-500 hover:to-purple-500 transition-all duration-300
                       text-white font-bold text-lg text-center hover:scale-105
                       shadow-lg hover:shadow-pink-500/50"
            >
              <span className="relative z-10">Community</span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity
                            bg-gradient-to-r from-pink-400 to-purple-400 blur-xl -z-10"></div>
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
