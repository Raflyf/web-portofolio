import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getProjectsData } from '../../data.js';
import { ExternalLink, Star, Sparkles, CheckCircle2, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { telemetry } from '../../lib/telemetry.js';

export default function ProjectsCurated() {
  const { language, t } = useLanguage();
  const projects = getProjectsData(language);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  const categories = [
    { id: 'all', label: t('projects.tabAll') },
    { id: 'ai-ml', label: t('projects.tabAi') },
    { id: 'tools', label: t('projects.tabTools') },
    { id: 'web', label: t('projects.tabWeb') },
  ];

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="projects" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto py-24">
      {/* Glow Backdrop */}
      <div className="v2-glow-spot top-1/4 right-0 bg-indigo-500/10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full v2-glass-pill text-xs font-semibold uppercase tracking-wider text-cyan-400 v2-font-mono">
            <span>02 / {t('projects.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight v2-font-display">
            {t('projects.title')}
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl">
            {t('projects.subtitle')}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                telemetry.logEvent('project_filter', 'category_change', cat.id);
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-white text-slate-950 shadow-lg font-semibold'
                  : 'v2-glass-pill text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollytelling Interactive Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Project Selector Navigation Reel (Left Column) */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
            {language === 'id' ? 'PILIH PROYEK UNTUK MEMBACA SPESIFIKASI:' : 'SELECT ARTIFACT TO INSPECT:'}
          </p>
          {filteredProjects.map((proj, idx) => {
            const isSelected = selectedProject?.id === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  setSelectedProject(proj);
                  telemetry.logEvent('project_select', 'inspect', proj.title);
                }}
                className={`w-full text-left p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'v2-glass-card border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-transparent'
                    : 'v2-glass-card border-white/5 hover:border-white/15 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                    {`0${idx + 1} // ${proj.categoryLabel}`}
                  </span>
                  {proj.stars > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{proj.stars}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors v2-font-display">
                  {proj.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                  {proj.description}
                </p>
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Cinematic Detailed Viewport (Right Column Sticky) */}
        <div className="lg:col-span-7 sticky top-24">
          <AnimatePresence mode="wait">
            {selectedProject && (
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="v2-glass-card p-7 sm:p-9 rounded-3xl space-y-6 border border-white/10 relative overflow-hidden"
              >
                {/* Ambient Top Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                  <span className="px-3 py-1 rounded-full v2-badge-cyan text-xs font-semibold v2-font-mono">
                    {selectedProject.badge}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    ID: {selectedProject.id}
                  </span>
                </div>

                <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white v2-font-display">
                    {selectedProject.title}
                  </h3>
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                    {selectedProject.longDescription || selectedProject.description}
                  </p>
                </div>

                {/* Key Engineering Highlights */}
                {selectedProject.keyFeatures && (
                  <div className="space-y-3 pt-3 border-t border-white/10 relative z-10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{language === 'id' ? 'Fitur & Arsitektur Utama:' : 'Core Architectural Features:'}</span>
                    </h4>
                    <ul className="space-y-2">
                      {selectedProject.keyFeatures.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack Chips */}
                <div className="space-y-2.5 pt-3 border-t border-white/10 relative z-10">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    {language === 'id' ? 'Tumpukan Teknologi:' : 'Technology Stack:'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1 rounded-lg v2-glass-pill text-xs font-medium text-zinc-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-4 flex flex-wrap items-center gap-3 relative z-10">
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>{t('projects.githubRepo')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  )}

                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full v2-glass-card hover:border-cyan-400/50 text-cyan-300 text-xs font-medium transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      <span>{t('projects.liveDemo')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400/70" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
