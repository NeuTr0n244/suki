'use client';

import { motion } from 'framer-motion';

interface SukiFallbackProps {
  emotion?: 'neutral' | 'thinking' | 'happy' | 'sad' | 'impressed' | 'angry';
  isSpeaking?: boolean;
}

export default function SukiFallback({ emotion = 'neutral', isSpeaking = false }: SukiFallbackProps) {
  const glowColor: Record<string, string> = {
    happy: '#4ade80',
    sad: '#6366f1',
    neutral: '#c084fc',
    angry: '#f87171',
    impressed: '#fde047',
    thinking: '#a78bfa',
  };
  const glow = glowColor[emotion] || '#c084fc';

  return (
    <div className="fixed bottom-0 right-4 z-50 pointer-events-none select-none" style={{ width: 250, height: 380 }}>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full h-full"
      >
        {/* Glow behind character */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-25 transition-colors duration-1000"
          style={{ backgroundColor: glow }}
        />

        {/* Speaking bubble */}
        {isSpeaking && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-lg">💬</span>
          </motion.div>
        )}

        {/* SVG Character */}
        <svg viewBox="0 0 240 420" className="w-full h-full" style={{ filter: `drop-shadow(0 0 15px ${glow}30)` }}>
          {/* === HAIR BACK === */}
          <path d="M70 100 Q50 130 45 220 Q43 240 55 230 Q50 160 75 110 Z" fill="#06b6a4" opacity="0.9"/>
          <path d="M170 100 Q190 130 195 220 Q197 240 185 230 Q190 160 165 110 Z" fill="#06b6a4" opacity="0.9"/>
          {/* Long hair strands back */}
          <path d="M55 220 Q48 280 55 340 Q57 345 62 335 Q55 280 60 220 Z" fill="#059e8e" opacity="0.8"/>
          <path d="M185 220 Q192 280 185 340 Q183 345 178 335 Q185 280 180 220 Z" fill="#059e8e" opacity="0.8"/>

          {/* === BODY === */}
          {/* Jacket */}
          <path d="M78 195 Q75 190 70 195 L55 320 Q53 335 70 340 L170 340 Q187 335 185 320 L170 195 Q165 190 162 195 L155 200 Q140 210 120 210 Q100 210 85 200 Z" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="0.5"/>
          {/* Jacket collar/fur */}
          <path d="M78 195 Q85 188 95 192 Q105 198 115 198 Q125 198 135 194 Q145 188 162 195 Q155 205 140 210 Q130 214 120 214 Q110 214 100 210 Q85 205 78 195 Z" fill="#e8e0f0" opacity="0.9"/>

          {/* Shirt underneath */}
          <path d="M90 200 Q100 210 120 210 Q140 210 150 200 L148 240 Q135 245 120 245 Q105 245 92 240 Z" fill="white" opacity="0.9"/>

          {/* Skirt */}
          <path d="M75 300 Q80 285 85 280 L155 280 Q160 285 165 300 L170 335 Q165 340 120 340 Q75 340 70 335 Z" fill="#60a5fa" opacity="0.85"/>

          {/* Legs */}
          <path d="M90 335 L88 395 Q88 400 95 400 L105 400 Q108 400 108 395 L106 335 Z" fill="#fce4e4"/>
          <path d="M132 335 L130 395 Q130 400 137 400 L147 400 Q150 400 150 395 L148 335 Z" fill="#fce4e4"/>

          {/* Thigh highs */}
          <path d="M88 360 L87 395 Q87 402 95 402 L106 402 Q109 402 109 395 L108 360 Z" fill="white" opacity="0.9"/>
          <path d="M130 360 L129 395 Q129 402 137 402 L148 402 Q151 402 151 395 L150 360 Z" fill="white" opacity="0.9"/>

          {/* === FACE === */}
          <ellipse cx="120" cy="120" rx="45" ry="52" fill="#fce8e8"/>

          {/* === HAIR FRONT === */}
          {/* Main hair top */}
          <path d="M75 100 Q78 55 120 48 Q162 55 165 100 L160 80 Q140 65 120 70 Q100 65 80 80 Z" fill="#10b9a3"/>
          {/* Bangs */}
          <path d="M78 98 Q86 82 95 100 Q100 80 108 96 Q112 78 120 95 Q126 78 132 96 Q138 80 145 100 Q152 82 162 98 L162 80 Q145 52 120 55 Q95 52 78 80 Z" fill="#0ed1b8" opacity="0.95"/>

          {/* Hair highlight streaks */}
          <path d="M85 90 Q90 78 95 92" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3"/>
          <path d="M115 82 Q120 72 125 85" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3"/>

          {/* Cat ears */}
          <path d="M78 78 L62 32 L95 68 Z" fill="#10b9a3" stroke="#0ed1b8" strokeWidth="1"/>
          <path d="M162 78 L178 32 L145 68 Z" fill="#10b9a3" stroke="#0ed1b8" strokeWidth="1"/>
          {/* Inner ear */}
          <path d="M78 74 L67 40 L91 66 Z" fill="#fce4e4" opacity="0.4"/>
          <path d="M162 74 L173 40 L149 66 Z" fill="#fce4e4" opacity="0.4"/>

          {/* === EYES === */}
          {/* Eye whites */}
          <ellipse cx="100" cy="122" rx="12" ry="14" fill="white"/>
          <ellipse cx="140" cy="122" rx="12" ry="14" fill="white"/>
          {/* Iris - color changes with emotion */}
          <ellipse cx="102" cy="124" rx="8" ry="10" fill={glow}/>
          <ellipse cx="142" cy="124" rx="8" ry="10" fill={glow}/>
          {/* Pupils */}
          <ellipse cx="103" cy="122" rx="4" ry="5" fill="#0f172a"/>
          <ellipse cx="143" cy="122" rx="4" ry="5" fill="#0f172a"/>
          {/* Eye shine */}
          <circle cx="106" cy="119" r="3" fill="white" opacity="0.9"/>
          <circle cx="146" cy="119" r="3" fill="white" opacity="0.9"/>
          <circle cx="99" cy="126" r="1.5" fill="white" opacity="0.5"/>
          <circle cx="139" cy="126" r="1.5" fill="white" opacity="0.5"/>

          {/* Eyebrows */}
          <path d="M88 105 Q100 100 112 105" stroke="#0a8c7a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M128 105 Q140 100 152 105" stroke="#0a8c7a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

          {/* Blush */}
          <ellipse cx="88" cy="135" rx="10" ry="5" fill="#fca5c0" opacity="0.25"/>
          <ellipse cx="152" cy="135" rx="10" ry="5" fill="#fca5c0" opacity="0.25"/>

          {/* Mouth */}
          {isSpeaking ? (
            <ellipse cx="120" cy="145" rx="6" ry="5" fill="#f472b6">
              <animate attributeName="ry" values="5;7;3;6;5" dur="0.3s" repeatCount="indefinite"/>
            </ellipse>
          ) : (
            <path d="M112 143 Q120 149 128 143" stroke="#f472b6" strokeWidth="2" fill="none" strokeLinecap="round"/>
          )}

          {/* === ACCESSORIES === */}
          {/* Chain necklace */}
          <path d="M95 190 Q108 200 120 198 Q132 200 145 190" stroke="#a1a1aa" strokeWidth="1" fill="none" opacity="0.6"/>
          <circle cx="120" cy="199" r="3" fill={glow} opacity="0.8"/>

          {/* Sparkle decorations */}
          <text x="42" y="55" fill={glow} fontSize="14" opacity="0.6" fontFamily="serif">✦</text>
          <text x="185" y="70" fill="#f472b6" fontSize="11" opacity="0.5" fontFamily="serif">✦</text>
          <text x="35" y="250" fill={glow} fontSize="9" opacity="0.35" fontFamily="serif">✧</text>
          <text x="195" y="280" fill="#f472b6" fontSize="11" opacity="0.4" fontFamily="serif">✧</text>
          <text x="120" y="28" fill={glow} fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
        </svg>

        {/* Animated sparkle particles around her */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${5 + Math.random() * 70}%`,
              fontSize: `${8 + Math.random() * 8}px`,
              color: i % 2 === 0 ? glow : '#f472b6',
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.15, 0.5, 0.15],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            ✦
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
