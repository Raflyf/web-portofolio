import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ArrowDown, Terminal, Sparkles, Compass } from 'lucide-react';
import { getDeveloperProfile } from '../../data.js';

export default function StitchHero() {
  const { language, t } = useLanguage();
  const profile = getDeveloperProfile(language);

  const techPills = [
    'Natural Language Processing',
    'Sentence Transformers (S-BERT)',
    'Computer Vision (MediaPipe & OpenCV)',
    'Prompt Engineering & Agent System',
    'MikroTik MTCNA Network Architecture',
    'FastAPI, PyTorch & Supabase RAG'
  ];

  return (
    <section className="flex flex-col items-start gap-8 max-w-4xl pt-4" id="overview">
      {/* Minimal Status Pill (Refractive Glass) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 px-4 py-1.5 rounded-full stitch-glass text-xs text-slate-200 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300 shadow-[0_0_6px_rgba(111,246,255,0.9)]" />
        </span>
        <span className="text-white font-medium">{profile.name}</span>
        <span className="text-slate-500">/</span>
        <span className="text-slate-300">
          {language === 'id' 
            ? 'Peneliti AI & Pengembang Perangkat Lunak' 
            : 'AI Researcher & Informatics Engineer'}
        </span>
      </motion.div>

      {/* Hero Headline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-5"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-[-0.035em] leading-[1.12]">
          {language === 'id'
            ? 'Merekayasa kecerdasan terapan dan sistem neural berakurasi tinggi.'
            : 'Engineering applied intelligence and rigorous neural systems.'}
        </h1>

        <p className="text-base sm:text-lg text-slate-300/90 font-normal leading-relaxed max-w-2xl">
          {language === 'id'
            ? 'Lulusan Sarjana Informatika dengan spesialisasi pada Deep Learning Terapan, arsitektur NLP berbasis Transformer, dan runtime inferensi berskala tinggi. Berfokus mentransformasikan riset empiris ke platform produksi nyata.'
            : 'Informatics graduate specializing in Applied Deep Learning, Transformer-driven NLP architectures, and scalable inference runtimes. Focused on transitioning empirical research into production-grade systems.'}
        </p>
      </motion.div>

      {/* High-density Technical Tags (Translucent Liquid Capsules) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300"
      >
        {techPills.map((pill, i) => (
          <span 
            key={i} 
            className="px-3 py-1 rounded-lg stitch-capsule text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200 transition-colors"
          >
            {pill}
          </span>
        ))}
      </motion.div>

      {/* Sleek visionOS Liquid Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap items-center gap-3 pt-2"
      >
        <a 
          href="#projects-showcase" 
          className="px-5 py-2.5 rounded-full stitch-btn-primary font-medium text-xs sm:text-sm flex items-center gap-2"
        >
          <span>{language === 'id' ? 'Eksplorasi Karya Rekayasa' : 'Explore Engineering Works'}</span>
          <ArrowDown className="w-4 h-4" />
        </a>

        <a 
          href="#interactive-lab" 
          className="px-5 py-2.5 rounded-full stitch-btn-glass text-slate-100 hover:text-white font-medium text-xs sm:text-sm flex items-center gap-2"
        >
          <Terminal className="w-4 h-4 text-cyan-300" />
          <span>{language === 'id' ? 'Buka Terminal Interaktif' : 'Launch Interactive Shell'}</span>
        </a>

        <div className="px-4 py-2.5 rounded-full text-slate-300 text-xs sm:text-sm font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>{profile.location} (WIB / UTC+7)</span>
        </div>
      </motion.div>
    </section>
  );
}
