import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import TerminalAI from '../../components/terminal/TerminalAI.jsx';
import { Terminal, Sparkles, Cpu, Bot } from 'lucide-react';

export default function InteractiveAILab() {
  const { language, t } = useLanguage();

  return (
    <section id="lab" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto py-24">
      <div className="v2-glow-spot top-1/4 left-1/3 bg-cyan-500/10" />

      {/* Header */}
      <div className="space-y-4 mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full v2-glass-pill text-xs font-semibold uppercase tracking-wider text-cyan-400 v2-font-mono">
          <span>06 / {t('lab.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight v2-font-display">
          {t('lab.title')}
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg">
          {t('lab.subtitle')}
        </p>
      </div>

      {/* Embedded Terminal AI Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="w-full relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10"
      >
        <TerminalAI />
      </motion.div>
    </section>
  );
}
