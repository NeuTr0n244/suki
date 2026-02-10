'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Chat from '@/components/Chat';
import ChatMessage from '@/components/ChatMessage';
import ScoreCard from '@/components/ScoreCard';
import FinancialCard from '@/components/FinancialCard';
import TradesCard from '@/components/TradesCard';
import AllTradesTable from '@/components/AllTradesTable';
import SparkleDecoration from '@/components/SparkleDecoration';
import HowItWorksPage from '@/components/HowItWorksPage';
import AboutPage from '@/components/AboutPage';
import FaqPage from '@/components/FaqPage';
import SukiFallback from '@/components/SukiFallback';
import ErrorBoundary from '@/components/ErrorBoundary';
import { speak } from '@/lib/tts';
import { truncateWallet } from '@/lib/format';

// Dynamically import 3D character (client-side only)
const SukiCharacter3D = dynamic(() => import('@/components/SukiCharacter'), {
  ssr: false,
  loading: () => null,
});

interface Message {
  id: string;
  role: 'user' | 'suki';
  content: string | React.ReactNode;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [emotion, setEmotion] = useState<'neutral' | 'thinking' | 'happy' | 'sad' | 'impressed' | 'angry'>('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'how-it-works' | 'about' | 'faq'>('chat');
  const [use3D, setUse3D] = useState(true);

  // Check if .glb exists and is valid
  useEffect(() => {
    fetch('/anime.glb', { method: 'HEAD' })
      .then((res) => {
        const size = parseInt(res.headers.get('content-length') || '0');
        if (!res.ok || size < 50000) {
          console.log('3D model not available or too small, using SVG fallback');
          setUse3D(false);
        }
      })
      .catch(() => {
        console.log('3D model failed to load, using SVG fallback');
        setUse3D(false);
      });
  }, []);

  // Initial greeting
  useEffect(() => {
    const greeting = "Hey~ I'm SUKI, your degen analyst ✦ Paste your Solana wallet and I'll tell you exactly how rekt you are... or maybe you'll surprise me.";
    addMessage('suki', greeting);
    speak(greeting, () => setIsSpeaking(true), () => setIsSpeaking(false));
  }, []);

  const addMessage = (role: 'user' | 'suki', content: string | React.ReactNode) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const detectWallet = (text: string): string | null => {
    const walletRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
    const match = text.match(walletRegex);
    return match ? match[0] : null;
  };

  const analyzeWallet = async (wallet: string) => {
    setIsAnalyzing(true);
    setEmotion('thinking');

    // Thinking message
    const thinkingMsg = "Hmm, let me look into this wallet... ✦";
    addMessage('suki', thinkingMsg);
    speak(thinkingMsg, () => setIsSpeaking(true), () => setIsSpeaking(false));

    try {
      // Simulate progress messages
      const progressMessages = [
        'Scanning your trades...',
        'Checking tokens on DexScreener...',
        'Crunching the numbers... almost done ✦',
      ];

      let index = 0;
      const progressInterval = setInterval(() => {
        if (index < progressMessages.length) {
          addMessage('suki', progressMessages[index]);
          index++;
        }
      }, 2500);

      // Fetch analysis
      const res = await fetch(`/api/analyze?wallet=${wallet}`);
      clearInterval(progressInterval);

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setWalletData(data);

      // Determine emotion based on PnL
      if (data.totalPnlPercent > 100) setEmotion('impressed');
      else if (data.totalPnlPercent > 0) setEmotion('happy');
      else if (data.totalPnlPercent > -30) setEmotion('neutral');
      else if (data.totalPnlPercent > -70) setEmotion('sad');
      else setEmotion('angry');

      // Send cards in sequence with delays
      setTimeout(() => {
        addMessage('suki', <ScoreCard score={data.score} title={data.title} emoji={data.emoji} desc={data.desc} />);
      }, 500);

      setTimeout(() => {
        addMessage('suki', <FinancialCard data={data} />);
      }, 1500);

      setTimeout(() => {
        addMessage('suki', <TradesCard topWins={data.topWins} topLosses={data.topLosses} />);
      }, 2500);

      setTimeout(() => {
        addMessage('suki', <AllTradesTable allTokens={data.allTokens} />);
      }, 3500);

      // Get AI diagnosis
      setTimeout(async () => {
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Give me 2-3 personalized observations about this wallet based on the data. Be sarcastic but helpful.',
            walletData: data,
          }),
        });
        const chatData = await chatRes.json();
        addMessage('suki', chatData.response);
        speak(chatData.response, () => setIsSpeaking(true), () => setIsSpeaking(false));
      }, 4500);

      // Final message
      setTimeout(() => {
        const finalMsg = "Got questions? Ask me anything about your wallet — best trade, worst trade, what to fix, whatever~ ✦";
        addMessage('suki', finalMsg);
        speak(finalMsg, () => setIsSpeaking(true), () => setIsSpeaking(false));
      }, 6000);

    } catch (error) {
      const errorMsg = "Ugh, something went wrong analyzing this wallet... Make sure it's a valid Solana address with some trading history, ser.";
      addMessage('suki', errorMsg);
      speak(errorMsg, () => setIsSpeaking(true), () => setIsSpeaking(false));
      setEmotion('sad');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async (text: string) => {
    // Check if it's a wallet address
    const wallet = detectWallet(text);

    if (wallet) {
      addMessage('user', truncateWallet(wallet));
      await analyzeWallet(wallet);
    } else {
      // Regular chat message
      addMessage('user', text);

      // Get AI response
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            walletData,
          }),
        });
        const data = await res.json();
        addMessage('suki', data.response);
        speak(data.response, () => setIsSpeaking(true), () => setIsSpeaking(false));
      } catch {
        const errorMsg = "Hmm, my circuits glitched~ Try again.";
        addMessage('suki', errorMsg);
        speak(errorMsg, () => setIsSpeaking(true), () => setIsSpeaking(false));
      }
    }
  };

  const handleTabChange = (tab: 'chat' | 'how-it-works' | 'about' | 'faq') => {
    setActiveTab(tab);
    // When not on chat, set emotion to neutral
    if (tab !== 'chat') {
      setEmotion('neutral');
    }
  };

  return (
    <div className="min-h-screen relative">
      <SparkleDecoration />
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main content area - changes based on active tab */}
      <main className="pt-16 min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <div key="chat" className="h-[calc(100vh-64px)] flex items-start justify-center pt-4">
              <Chat onSend={handleSend} disabled={isAnalyzing}>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </Chat>
            </div>
          )}

          {activeTab === 'how-it-works' && <HowItWorksPage key="how-it-works" />}

          {activeTab === 'about' && <AboutPage key="about" />}

          {activeTab === 'faq' && <FaqPage key="faq" />}
        </AnimatePresence>
      </main>

      {/* SUKI Character - floating freely, no box, visible on all tabs */}
      <div
        className="hidden md:block"
        style={{
          position: 'fixed',
          bottom: 0,
          right: '-5%',
          height: '60vh',
          width: 'auto',
          zIndex: 1,
          pointerEvents: 'none',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        {use3D ? (
          <ErrorBoundary fallback={<SukiFallback emotion={emotion} isSpeaking={isSpeaking} />}>
            <SukiCharacter3D />
          </ErrorBoundary>
        ) : (
          <SukiFallback emotion={emotion} isSpeaking={isSpeaking} />
        )}
      </div>

      {/* Minimal Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-600 font-mono border-t border-purple-500/10">
        © 2026 SUKI · Not financial advice · DYOR
      </footer>
    </div>
  );
}
