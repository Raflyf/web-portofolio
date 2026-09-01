import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECTS_DATA } from '../../data';
import { ArrowRight, Star, ExternalLink } from 'lucide-react';
import { LiquidButton } from '../ui/liquid-glass-button';

const GithubIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function ProjectsGrid() {
  const [filter, setFilter] = useState('all');

  const filteredProjects = PROJECTS_DATA.filter(project => 
    filter === 'all' ? true : project.category === filter
  );

  const featuredProject = PROJECTS_DATA.find(p => p.id === 'open-plagiarism-checker');
  const secondaryProjects = filteredProjects.filter(p => p.id !== 'open-plagiarism-checker');

  return (
    <section id="projects" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Karya Terpilih</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          Portofolio Riset & Proyek GitHub
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          Implementasi terbuka dengan penekanan pada akurasi komputasi, benchmark empiris, dan kejelasan arsitektur.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {[
          { id: 'all', label: 'Semua Proyek' },
          { id: 'ai-ml', label: 'AI & ML' },
          { id: 'cv-tools', label: 'Vision & Tools' },
          { id: 'web', label: 'Web Systems' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border cursor-pointer ${
              filter === tab.id 
                ? 'bg-white/10 border-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Featured Project Showcase Card */}
      {featuredProject && (filter === 'all' || featuredProject.category === filter) && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7 }}
          className="mb-12 rounded-3xl border border-white/15 bg-black/40 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 text-xs font-semibold tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full uppercase backdrop-blur-md">
                  {featuredProject.badge}
                </span>
                <span className="px-3 py-1 text-xs font-medium text-zinc-300 bg-white/10 border border-white/10 rounded-full">
                  {featuredProject.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">{featuredProject.stars} Stars</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {featuredProject.title}
              </h3>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
                {featuredProject.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {featuredProject.techStack.map((tech, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-300 border border-white/10 bg-white/5">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <a href={featuredProject.githubUrl} target="_blank" rel="noopener noreferrer">
                  <LiquidButton variant="glass" size="sm">
                    Lihat Source Code
                    <GithubIcon className="w-4 h-4 ml-2" />
                  </LiquidButton>
                </a>
              </div>
            </div>

            {/* Key Features Pod */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-3 p-6 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Highlight Fitur Riset</h4>
              <div className="space-y-2">
                {(featuredProject.keyFeatures || []).slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="text-cyan-400 font-bold shrink-0">›</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Secondary Projects Grid */}
      <motion.div 
        layout
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {secondaryProjects.map((project) => (
            <motion.div
              layout
              key={project.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-7 backdrop-blur-2xl hover:border-white/20 transition-colors shadow-xl flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="px-2.5 py-1 text-[10px] font-medium text-zinc-300 bg-white/10 border border-white/10 rounded-full">
                    {project.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500/80">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-medium">{project.stars}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 relative z-10 group-hover:text-cyan-300 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed relative z-10 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
                  {project.techStack.slice(0,4).map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] text-zinc-400 border border-white/5 bg-black/60">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center gap-3 relative z-10 pt-4 border-t border-white/5">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors" title="GitHub Repository">
                    <GithubIcon className="w-5 h-5" />
                  </a>
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors" title="Live Demo">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
