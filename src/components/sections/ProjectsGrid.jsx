import React, { useState } from 'react';
import { PROJECTS_DATA } from '../../data';
import { ArrowRight, Star, ExternalLink } from 'lucide-react';
import { LiquidButton } from '../ui/liquid-glass-button';

const GithubIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export default function ProjectsGrid() {
  const [filter, setFilter] = useState('all');

  const filteredProjects = PROJECTS_DATA.filter(project => 
    filter === 'all' ? true : project.category === filter
  );

  const featuredProject = PROJECTS_DATA.find(p => p.id === 'open-plagiarism-checker');
  const secondaryProjects = filteredProjects.filter(p => p.id !== 'open-plagiarism-checker');

  return (
    <section id="projects" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Karya Terpilih</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Portofolio Riset & Proyek GitHub
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Koleksi repositori yang dikembangkan secara mandiri, terdokumentasi, dan berbasis pemecahan masalah nyata.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {[
          { id: 'all', label: 'Semua Proyek' },
          { id: 'ai-ml', label: 'AI & Machine Learning' },
          { id: 'tools', label: 'Vision & Tools' },
          { id: 'web', label: 'Web Systems' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border ${
              filter === tab.id 
                ? 'bg-white/10 border-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Featured Project */}
      {(filter === 'all' || filter === featuredProject.category) && (
        <div className="mb-12 rounded-3xl border border-white/10 bg-black/40 p-1 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10 bg-white/5 rounded-[22px] overflow-hidden border border-white/5">
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-max mb-4">
                {featuredProject.badge}
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                {featuredProject.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                {featuredProject.longDescription}
              </p>
              
              <ul className="space-y-3 mb-8">
                {featuredProject.keyFeatures.slice(0,3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 mt-auto">
                <a href={featuredProject.githubUrl} target="_blank" rel="noopener noreferrer">
                  <LiquidButton variant="cool" size="sm">
                    Kunjungi Repositori
                    <Github className="w-4 h-4 ml-2" />
                  </LiquidButton>
                </a>
              </div>
            </div>
            
            <div className="bg-black/60 p-8 border-l border-white/10 flex flex-col justify-center relative overflow-hidden">
              <div className="font-mono text-xs text-emerald-400 font-semibold mb-4 tracking-wider uppercase">
                Indexed Academic Databases:
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {["GARUDA (Kemdikbud)", "Indonesia OneSearch", "Neliti Repository", "BASE (Bielefeld)", "OpenAlex Graph", "Semantic Scholar"].map((db, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-zinc-300 backdrop-blur-md">
                    {db}
                  </span>
                ))}
              </div>
              <div className="font-mono text-[10px] text-zinc-500 pt-4 border-t border-white/10">
                Stack: {featuredProject.techStack.join(' · ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secondaryProjects.map(project => (
          <div key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:bg-white/10 transition-all shadow-xl group flex flex-col relative overflow-hidden hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="px-2.5 py-1 text-[10px] font-medium text-zinc-300 bg-white/10 border border-white/10 rounded-full">
                {project.categoryLabel}
              </span>
              <div className="flex items-center gap-1 text-yellow-500/80">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-medium">{project.stars}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 relative z-10 group-hover:text-emerald-400 transition-colors">
              {project.title}
            </h3>
            
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed relative z-10 line-clamp-3">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
              {project.techStack.slice(0,4).map((tech, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] text-zinc-400 border border-white/5 bg-black/40">
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-3 relative z-10 pt-4 border-t border-white/5">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors" title="GitHub Repository">
                <Github className="w-5 h-5" />
              </a>
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors" title="Live Demo">
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
