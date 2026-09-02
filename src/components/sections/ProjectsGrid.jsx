import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECTS_DATA } from '../../data';
import { Star, ExternalLink } from 'lucide-react';
import { telemetry } from '../../lib/telemetry';

const GithubIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const tabVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

const GITHUB_STARS_CACHE_KEY = 'portfolio_github_stars_v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit TTL cache agar bebas rate-limit GitHub

export default function ProjectsGrid() {
  const [filter, setFilter] = useState('all');

  const filteredProjects = PROJECTS_DATA.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'tools') return project.category === 'tools' || project.category === 'cv-tools';
    return project.category === filter;
  });

  const isAllFilter = filter === 'all';
  // Featured Project Showcase Card (raksasa) HANYA tampil saat tab 'Semua Proyek' (filter === 'all')
  const featuredProject = isAllFilter ? PROJECTS_DATA.find(p => p.id === 'open-plagiarism-checker') : null;

  // Saat filter === 'all': proyek selain open-plagiarism-checker ditampilkan di grid bawah
  // Saat memilih kategori (filter !== 'all'): SELURUH proyek kategori tersebut (termasuk open-plagiarism-checker)
  // ditampilkan di grid dengan ukuran card yang SAMA PERSIS dengan proyek lainnya
  const displayProjects = isAllFilter 
    ? filteredProjects.filter(p => p.id !== 'open-plagiarism-checker')
    : filteredProjects;

  // Real-time Dynamic GitHub Stars State with SWR Cache
  const [starsMap, setStarsMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const cached = localStorage.getItem(GITHUB_STARS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (data && timestamp && Date.now() - timestamp < CACHE_TTL_MS) {
          return data;
        }
      }
    } catch {}
    return {};
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchStars() {
      try {
        const res = await fetch('https://api.github.com/users/Raflyf/repos?per_page=100', {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!res.ok) return;
        const repos = await res.json();
        if (Array.isArray(repos)) {
          const map = {};
          repos.forEach(repo => {
            if (repo.name) {
              map[repo.name.toLowerCase()] = repo.stargazers_count;
            }
          });
          if (isMounted) {
            setStarsMap(map);
            try {
              localStorage.setItem(GITHUB_STARS_CACHE_KEY, JSON.stringify({
                data: map,
                timestamp: Date.now()
              }));
            } catch {}
          }
        }
      } catch {
        // Fallback otomatis ke project.stars default jika offline
      }
    }

    fetchStars();
    return () => { isMounted = false; };
  }, []);

  const getProjectStars = (project) => {
    if (!project) return 0;
    if (!project.githubUrl) return project.stars ?? 0;
    const repoName = project.githubUrl.split('/').pop()?.toLowerCase();
    if (repoName && starsMap[repoName] !== undefined) {
      return starsMap[repoName];
    }
    return project.stars ?? 0;
  };

  return (
    <section id="projects" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
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
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.8 }}
        className="flex flex-wrap justify-center gap-2 mb-12"
      >
        {[
          { id: 'all', label: 'Semua Proyek' },
          { id: 'ai-ml', label: 'AI & Machine Learning' },
          { id: 'tools', label: 'Vision & Tools' },
          { id: 'web', label: 'Web Systems' }
        ].map(tab => (
          <motion.button
            variants={tabVariants}
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all backdrop-blur-xl border cursor-pointer ${
              filter === tab.id 
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                : 'bg-slate-900/50 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Featured Project Showcase Card (HANYA tampil pada tab 'Semua Proyek') */}
      {featuredProject && (
        <motion.div 
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 p-8 sm:p-12 liquid-glass-strong liquid-glass-hover relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 text-xs font-semibold tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full uppercase backdrop-blur-md">
                  {featuredProject.badge}
                </span>
                <span className="px-3.5 py-1 text-xs font-medium text-zinc-300 bg-white/5 border border-white/10 rounded-full">
                  {featuredProject.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{getProjectStars(featuredProject)} Stars</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {featuredProject.title}
              </h3>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
                {featuredProject.description}
              </p>

              <div className="space-y-2 pt-1">
                {featuredProject.keyFeatures.slice(0, 3).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {featuredProject.techStack.map((tech, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-300 border border-white/10 bg-white/5">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <a
                  href={featuredProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => telemetry.logEvent('link_click', 'github_openplagiarismchecker', 'Kunjungi Repositori: OpenPlagiarismChecker')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm transition-all hover:scale-105 shadow-md"
                >
                  <GithubIcon className="w-4 h-4" />
                  Kunjungi Repositori
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 liquid-glass-inset p-6 space-y-4">
              <div className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Basis Data Riset Terindeks:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300 font-mono">
                <span className="p-2 rounded bg-white/5 border border-white/5">GARUDA</span>
                <span className="p-2 rounded bg-white/5 border border-white/5">OneSearch</span>
                <span className="p-2 rounded bg-white/5 border border-white/5">Neliti</span>
                <span className="p-2 rounded bg-white/5 border border-white/5">BASE (Bielefeld)</span>
                <span className="p-2 rounded bg-white/5 border border-white/5">OpenAlex</span>
                <span className="p-2 rounded bg-white/5 border border-white/5">Semantic Scholar</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {displayProjects.map((project, index) => (
            <motion.div 
              layout
              key={project.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.16, 1, 0.3, 1],
                delay: (index % 2) * 0.08
              }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="liquid-glass liquid-glass-hover p-7 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 rounded-full">
                      {project.categoryLabel}
                    </span>
                    {project.badge && (
                      <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        {project.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>{getProjectStars(project)}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {project.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-300 bg-white/5 border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => telemetry.logEvent('link_click', `github_${project.id}`, `Kunjungi Repositori: ${project.title}`)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  GitHub Repository
                </a>
                
                {project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => telemetry.logEvent('link_click', `demo_${project.id}`, `Buka Demo: ${project.title}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Live Demo
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] font-mono text-zinc-500">Standalone App</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
