'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [counts, setCounts] = useState({
    wallets: 0,
    tokens: 0,
    scores: 0,
  });

  // Animate counters
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      wallets: 10000,
      tokens: 50000,
      scores: 8500,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounts({
        wallets: Math.floor(targets.wallets * progress),
        tokens: Math.floor(targets.tokens * progress),
        scores: Math.floor(targets.scores * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: 'Wallet Analysis',
      description: 'Deep dive into your trading history with AI-powered insights',
    },
    {
      title: 'Degen Score',
      description: 'Get rated from 0 to 100 based on your trading patterns',
    },
    {
      title: 'AI Chat',
      description: 'Ask anything about your portfolio and get instant answers',
    },
  ];

  const techStack = [
    { name: 'Solana', logo: '◎' },
    { name: 'Helius', logo: 'H' },
    { name: 'Claude AI', logo: 'C' },
    { name: 'Next.js', logo: '▲' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-16 px-6 font-quicksand"
    >
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text font-orbitron">
            Meet SUKI
          </h1>
          <p className="text-2xl text-purple-300 font-rajdhani font-semibold">
            Your AI-Powered Anime Degen Analyst
          </p>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            SUKI analyzes your Solana wallet, scores your degen level, and roasts your trading decisions — all with anime personality.
          </p>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass hover-scale rounded-xl p-6 text-center animate-pulse-glow">
            <div className="text-4xl md:text-5xl font-bold font-orbitron gradient-text mb-2">
              {counts.wallets.toLocaleString()}+
            </div>
            <div className="text-sm text-slate-400 font-rajdhani font-semibold">
              Wallets Analyzed
            </div>
          </div>

          <div className="glass hover-scale rounded-xl p-6 text-center animate-pulse-glow" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl md:text-5xl font-bold font-orbitron gradient-text mb-2">
              {counts.tokens.toLocaleString()}+
            </div>
            <div className="text-sm text-slate-400 font-rajdhani font-semibold">
              Tokens Tracked
            </div>
          </div>

          <div className="glass hover-scale rounded-xl p-6 text-center animate-pulse-glow" style={{ animationDelay: '0.4s' }}>
            <div className="text-4xl md:text-5xl font-bold font-orbitron gradient-text mb-2">
              {counts.scores.toLocaleString()}+
            </div>
            <div className="text-sm text-slate-400 font-rajdhani font-semibold">
              Degen Scores Given
            </div>
          </div>

          <div className="glass hover-scale rounded-xl p-6 text-center animate-pulse-glow" style={{ animationDelay: '0.6s' }}>
            <div className="text-4xl md:text-5xl font-bold font-orbitron gradient-text mb-2">
              &lt;2s
            </div>
            <div className="text-sm text-slate-400 font-rajdhani font-semibold">
              Avg Response Time
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center gradient-text font-orbitron">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass hover-scale rounded-xl p-8 text-center space-y-4"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <h3 className="text-xl font-bold text-purple-300 font-rajdhani">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center gradient-text font-orbitron">
            Powered By
          </h2>
          <p className="text-center text-slate-400 font-rajdhani font-semibold">
            Built with the best tools in Web3 and AI
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 text-center space-y-3 hover-scale cursor-pointer"
                style={{ opacity: 0.8 }}
              >
                <div className="text-4xl font-bold text-purple-400 font-orbitron">
                  {tech.logo}
                </div>
                <div className="text-sm font-rajdhani font-semibold text-slate-300">
                  {tech.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
