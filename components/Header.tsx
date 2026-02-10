'use client';

import { Twitter, Menu, X } from 'lucide-react';
import { useState } from 'react';
import SoundToggle from './SoundToggle';

interface HeaderProps {
  activeTab: 'chat' | 'how-it-works' | 'about' | 'faq';
  onTabChange: (tab: 'chat' | 'how-it-works' | 'about' | 'faq') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: '💬' },
    { id: 'how-it-works' as const, label: 'How It Works', icon: '⚡' },
    { id: 'about' as const, label: 'About', icon: '✦' },
    { id: 'faq' as const, label: 'FAQ', icon: '❓' },
  ];

  const handleTabClick = (tabId: 'chat' | 'how-it-works' | 'about' | 'faq') => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-purple-500/10">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-xl sparkle-pulse">✦</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron">
              SUKI
            </h1>
            <p className="text-[10px] text-slate-600 font-outfit hidden sm:block">Anime Degen Analyst</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 font-outfit ${
                activeTab === tab.id
                  ? 'text-purple-300 bg-purple-500/15 shadow-[0_0_10px_rgba(139,92,246,0.15)] border border-purple-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-purple-400" />
            ) : (
              <Menu className="w-5 h-5 text-purple-400" />
            )}
          </button>

          <SoundToggle />
          <a
            href="https://twitter.com/SukiDegen"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:bg-white/10 hidden sm:flex"
          >
            <Twitter className="w-5 h-5 text-purple-400" />
          </a>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-500/10 bg-[#12121e]/95 backdrop-blur-md">
          <nav className="px-6 py-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all font-outfit ${
                  activeTab === tab.id
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
