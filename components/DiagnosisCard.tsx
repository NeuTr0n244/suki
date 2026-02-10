'use client';

import { motion } from 'framer-motion';

interface DiagnosisCardProps {
  diagnosis: string;
}

export default function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 border-l-4 border-purple-500"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-purple-400">✦</span>
        <h3 className="text-lg font-bold text-slate-200 font-outfit">SUKI's Diagnosis</h3>
      </div>
      <p className="text-slate-300 leading-relaxed font-outfit whitespace-pre-line">{diagnosis}</p>
    </motion.div>
  );
}
