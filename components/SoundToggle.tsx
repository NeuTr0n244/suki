'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isSoundEnabled, setSoundEnabled } from '@/lib/tts';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    setSoundEnabled(newState);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:bg-white/10"
      aria-label={enabled ? 'Mute SUKI' : 'Unmute SUKI'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 text-purple-400" />
      ) : (
        <VolumeX className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );
}
