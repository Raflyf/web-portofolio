import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getTimelineData } from '../../data.js';
import { Briefcase, GraduationCap, Calendar, Sparkles } from 'lucide-react';

export default function ExperienceTrack() {
  const { language, t } = useLanguage();
  const timeline = getTimelineData(language);

  return (
    <section id="timeline" className="relative px-4 sm:px-6 w-full max-w-5xl mx-auto py-24">
      <div className="v2-glow-spot top-1/2 left-1/4 bg-indigo-600/10" />

      {/* Header */}
      <div className="space-y-4 mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full v2-glass-pill text-xs font-semibold uppercase tracking-wider text-indigo-400 v2-font-mono">
          <span>05 / {t('timeline.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight v2-font-display">
          {t('timeline.title')}
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
          {t('timeline.subtitle')}
        </p>
      </div>

      {/* Vertical Connected Track */}
      <div className="relative border-l border-white/10 ml-4 sm:ml-8 space-y-12 pl-6 sm:pl-10">
        {timeline.map((item, idx) => {
          const isEducation = item.type === 'education';
          const isCurrent = item.period.includes('Sekarang') || item.period.includes('Present');

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative group"
            >
              {/* Timeline Bullet Node */}
              <div 
                className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                    : 'bg-slate-900 border-white/20 text-zinc-400'
                }`}
              >
                {isEducation ? (
                  <GraduationCap className="w-3 h-3" />
                ) : (
                  <Briefcase className="w-3 h-3" />
                )}
              </div>

              {/* Card */}
              <div className="v2-glass-card p-6 sm:p-7 rounded-3xl space-y-3 group-hover:border-white/20 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full v2-badge-indigo text-xs font-mono font-semibold">
                    {item.period}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>{language === 'id' ? 'Aktif Berjalan' : 'Currently Active'}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors v2-font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-cyan-400">
                    {item.institution}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
