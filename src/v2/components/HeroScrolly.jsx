import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getDeveloperProfile } from '../../data.js';
import { ArrowDown, Terminal, Sparkles, ShieldCheck, Award, Network, Cpu } from 'lucide-react';
import { telemetry } from '../../lib/telemetry.js';

export default function HeroScrolly() {
  const { language, t } = useLanguage();
  const profile = getDeveloperProfile(language);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scaleEffect = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: -60, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const stats = [
    { label: language === 'id' ? 'Sertifikasi BNSP' : 'BNSP Certified', value: '10 Unit', icon: ShieldCheck, color: 'text-cyan-400' },
    { label: language === 'id' ? 'MikroTik Network' : 'MikroTik Network', value: 'MTCNA', icon: Network, color: 'text-emerald-400' },
    { label: language === 'id' ? 'Proyek Riset & Alat' : 'Research & Tools', value: '5 Proyek', icon: Cpu, color: 'text-indigo-400' },
    { label: language === 'id' ? 'Pendidikan' : 'Education', value: 'S1 UBSI', icon: Award, color: 'text-amber-400' },
  ];

  return (
    <section 
      ref={containerRef}
      id="hero"
      className="relative min-h-[95vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-28 pb-16 overflow-hidden"
    >
      {/* Dynamic Background Glows */}
      <div className="v2-glow-spot top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/20" />
      <div className="v2-glow-spot bottom-10 left-10 bg-indigo-500/15" />
      <div className="v2-glow-spot top-1/3 right-10 bg-emerald-500/15" />

      {/* Main Parallax Content */}
      <motion.div 
        style={{ y: heroY, opacity: heroOpacity, scale: scaleEffect }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 space-y-8"
      >
        {/* Editorial Sub-badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full v2-glass-pill border border-white/10"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase v2-font-mono">
            {profile.institution}
          </span>
        </motion.div>

        {/* Master Typographic Headline */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight v2-font-display text-white leading-[1.05]"
          >
            ENGINEERING <br className="hidden sm:block" />
            <span className="v2-text-gradient-cyan">INTELLIGENCE</span> & CODE.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            {profile.bio}
          </motion.p>
        </div>

        {/* Action Triggers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <a
            href="#projects"
            onClick={(e) => {
              telemetry.logEvent('hero_cta_projects', 'click', 'Klik Jelajahi Karya V2');
              handleScrollTo(e, '#projects');
            }}
            className="px-6 py-3 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 flex items-center gap-2 cursor-pointer"
          >
            <span>{language === 'id' ? 'Eksplorasi Proyek' : 'Explore Projects'}</span>
            <ArrowDown className="w-4 h-4" />
          </a>

          <a
            href="#lab"
            onClick={(e) => {
              telemetry.logEvent('hero_cta_lab', 'click', 'Klik Buka AI Terminal V2');
              handleScrollTo(e, '#lab');
            }}
            className="px-6 py-3 rounded-full v2-glass-card hover:border-cyan-400/50 text-white font-medium text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>{language === 'id' ? 'Terminal AI Lab' : 'Interactive AI Lab'}</span>
          </a>
        </motion.div>

        {/* Key Indicators Bento Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl pt-8"
        >
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="v2-glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white v2-font-display tracking-tight">
                  {item.value}
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Downward Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-500 text-[10px] uppercase tracking-widest pointer-events-none"
      >
        <span>SCROLL DOWN</span>
        <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400/80 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
