'use client';

import { useState } from 'react';

interface HeaderProps {
  activeTab: 'chat' | 'how-it-works' | 'about' | 'faq';
  onTabChange: (tab: 'chat' | 'how-it-works' | 'about' | 'faq') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'how-it-works', label: 'How It Works', icon: '⚡' },
    { id: 'about', label: 'About', icon: '✦' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
  ] as const;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 glass border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold logo-suki gradient-text">SUKI</h1>
            <p className="text-[10px] text-slate-400 font-rajdhani hidden sm:block">
              Anime Degen Analyst
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-rajdhani font-semibold
                transition-all duration-300 relative
                ${
                  activeTab === tab.id
                    ? 'text-purple-300 bg-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-500/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/40 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-purple-400"
          >
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-purple-500/20 py-4 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id as any);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full text-left px-4 py-3 rounded-lg mb-2 font-rajdhani font-semibold
                transition-all duration-300
                ${
                  activeTab === tab.id
                    ? 'text-purple-300 bg-purple-500/20 border border-purple-500/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
