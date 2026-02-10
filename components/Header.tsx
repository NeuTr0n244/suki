'use client';

import { useState } from 'react';

interface HeaderProps {
  activeTab: 'chat' | 'how-it-works' | 'about' | 'faq';
  onTabChange: (tab: 'chat' | 'how-it-works' | 'about' | 'faq') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function Header({ activeTab, onTabChange, soundEnabled, onToggleSound }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'chat', label: 'Chat' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'faq', label: 'FAQ' },
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

        {/* Desktop Navigation + Sound Button */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-2">
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

          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            className="p-2.5 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all"
            title={soundEnabled ? 'Desligar som' : 'Ligar som'}
          >
            {soundEnabled ? (
              // Volume On Icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-400"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              // Volume Off Icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-500"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="22" y1="9" x2="16" y2="15" />
                <line x1="16" y1="9" x2="22" y2="15" />
              </svg>
            )}
          </button>
        </div>

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

          {/* Sound Toggle in Mobile Menu */}
          <button
            onClick={onToggleSound}
            className="w-full text-left px-4 py-3 rounded-lg font-rajdhani font-semibold text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
          >
            {soundEnabled ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>Som Ligado</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </svg>
                <span>Som Desligado</span>
              </>
            )}
          </button>
        </div>
      )}
    </header>
  );
}
