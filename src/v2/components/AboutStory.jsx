import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getDeveloperProfile } from '../../data.js';
import { Cpu, Network, Eye, ShieldCheck, MapPin, GraduationCap, Mail } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';

export default function AboutStory() {
  const { language, t } = useLanguage();
  const profile = getDeveloperProfile(language);

  const pillars = [
    {
      title: t('about.pillarAiTitle'),
      desc: t('about.pillarAiDesc'),
      icon: Cpu,
      color: 'text-cyan-400',
      border: 'hover:border-cyan-500/40',
      bg: 'group-hover:bg-cyan-500/10'
    },
    {
      title: t('about.pillarNetTitle'),
      desc: t('about.pillarNetDesc'),
      icon: Network,
      color: 'text-emerald-400',
      border: 'hover:border-emerald-500/40',
      bg: 'group-hover:bg-emerald-500/10'
    },
    {
      title: t('about.pillarVisionTitle'),
      desc: t('about.pillarVisionDesc'),
      icon: Eye,
      color: 'text-indigo-400',
      border: 'hover:border-indigo-500/40',
      bg: 'group-hover:bg-indigo-500/10'
    },
    {
      title: t('about.pillarFullstackTitle'),
      desc: t('about.pillarFullstackDesc'),
      icon: ShieldCheck,
      color: 'text-amber-400',
      border: 'hover:border-amber-500/40',
      bg: 'group-hover:bg-amber-500/10'
    }
  ];

  return (
    <section id="about" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto py-24">
      {/* Background Accent */}
      <div className="v2-glow-spot top-1/2 left-0 bg-cyan-600/10" />

      {/* Section Header */}
      <div className="space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full v2-glass-pill text-xs font-semibold uppercase tracking-wider text-cyan-400 v2-font-mono">
          <span>01 / {t('about.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight v2-font-display max-w-3xl">
          {t('about.title')}
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Narrative Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="v2-glass-card p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight v2-font-display">
              {language === 'id' ? 'Filosofi Rekayasa & Riset' : 'Engineering Philosophy & Research'}
            </h3>
            
            <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
              {t('about.bioP1')}
            </p>

            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
              {t('about.bioP2')}
            </p>

            {/* Micro Details */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{profile.degree}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <GithubIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  {profile.handle}
                </a>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${profile.email}`} className="hover:text-cyan-400 transition-colors truncate">
                  {profile.email}
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Pillars Grid */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`v2-glass-card v2-glass-card-interactive p-6 rounded-2xl flex flex-col justify-between space-y-4 group ${item.border}`}
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl v2-glass-pill flex items-center justify-center transition-colors ${item.bg}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h4 className="text-base font-bold text-white v2-font-display">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-cyan-400 transition-colors" />
                  <span>Domain #{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
