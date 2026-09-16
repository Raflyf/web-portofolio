import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getProjectsData } from '../../data.js';
import { ArrowRight, ExternalLink, Star } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { telemetry } from '../../lib/telemetry';

export default function StitchProjects() {
  const { language } = useLanguage();
  const projects = getProjectsData(language);

  // Custom schematic blueprint renderers based on project id
  const renderSchematic = (projectId) => {
    switch (projectId) {
      case 'open-plagiarism-checker':
        return (
          <div className="p-4 rounded-xl stitch-blueprint-cavity font-mono text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">PIPELINE SCHEMATIC</span>
              <span className="text-cyan-300">k=5 SHINGLE HASHING</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="p-2 rounded-lg stitch-capsule flex flex-col">
                <span className="text-slate-400 text-[10px]">STAGE 1</span>
                <span className="text-white text-[11px] font-medium">N-Gram Sieve</span>
              </div>
              <div className="p-2 rounded-lg stitch-capsule flex flex-col">
                <span className="text-slate-400 text-[10px]">STAGE 2</span>
                <span className="text-white text-[11px] font-medium">S-BERT Dense</span>
              </div>
              <div className="p-2 rounded-lg stitch-capsule flex flex-col">
                <span className="text-slate-400 text-[10px]">STAGE 3</span>
                <span className="text-white text-[11px] font-medium">Cosine Matrix</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Base: all-MiniLM-L6-v2</span>
              <span>Storage: In-memory Trie</span>
            </div>
          </div>
        );

      case 'spam-email-detector':
        return (
          <div className="p-4 rounded-xl stitch-blueprint-cavity font-mono text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">MODEL BENCHMARK (S1 THESIS)</span>
              <span className="text-cyan-300">DOMAIN ADAPTATION</span>
            </div>
            <div className="grid grid-cols-2 gap-2 py-1 text-center">
              <div className="p-2 rounded-lg stitch-capsule flex flex-col">
                <span className="text-slate-400 text-[10px]">COMPLEMENT NAIVE BAYES</span>
                <span className="text-emerald-300 text-[12px] font-semibold">98.83% Accuracy</span>
              </div>
              <div className="p-2 rounded-lg stitch-capsule flex flex-col">
                <span className="text-slate-400 text-[10px]">XGBOOST CLASSIFIER</span>
                <span className="text-cyan-300 text-[12px] font-semibold">0.991 ROC-AUC</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Imbalance Ratio: 10:90 up to 90:10</span>
              <span>Dataset: Enron + PU Corpus</span>
            </div>
          </div>
        );

      case 'chat-bot':
        return (
          <div className="p-4 rounded-xl stitch-blueprint-cavity font-mono text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">FAILOVER &amp; MULTIMODAL ROUTING</span>
              <span className="text-cyan-300">WHISPER ASR + 4-TIER LLM</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
              <div className="p-1.5 rounded stitch-capsule text-[10px] text-slate-300">xKiro</div>
              <div className="p-1.5 rounded stitch-capsule text-[10px] text-slate-300">Groq</div>
              <div className="p-1.5 rounded stitch-capsule text-[10px] text-slate-300">Gemini</div>
              <div className="p-1.5 rounded stitch-capsule text-[10px] text-slate-300">OpenRouter</div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Voice: Whisper ~480ms</span>
              <span>Memory: /salah rollbacks</span>
            </div>
          </div>
        );

      case 'laser-pointer-ppt':
        return (
          <div className="p-4 rounded-xl stitch-blueprint-cavity font-mono text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">WEBSOCKET REALTIME CONTROL</span>
              <span className="text-cyan-300">GYROSCOPE INERTIAL SENSOR</span>
            </div>
            <div className="flex items-center justify-between py-1 border-y border-white/[0.08] text-[11px]">
              <span className="text-slate-400">DeviceOrientation API</span>
              <span className="text-emerald-300 font-semibold">&lt; 15ms SocketIO Latency</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Slide Engine: PyAutoGUI</span>
              <span>Security: Dynamic Pairing Token</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-xl stitch-blueprint-cavity font-mono text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>SYSTEM SPECIFICATION</span>
              <span className="text-cyan-300">Production Ready</span>
            </div>
            <div className="text-slate-300 text-xs py-1">
              Edge serverless deployment with responsive state management.
            </div>
          </div>
        );
    }
  };

  return (
    <section className="flex flex-col gap-8" id="projects-showcase">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.1] pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-medium">
            {language === 'id' ? 'Kode Produksi & Riset' : 'Production & Research Code'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {language === 'id' ? 'Karya Sistem & Rekayasa Terpilih' : 'Featured Engineering Systems'}
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400">
          [{projects.length} Verified Artifacts]
        </div>
      </div>

      {/* 2x2 Architectural Liquid Glass Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="rounded-2xl stitch-glass stitch-glass-hover p-6 md:p-7 flex flex-col justify-between gap-6 group"
          >
            <div className="flex flex-col gap-5">
              {/* Header Meta */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 bg-white/[0.06] px-2.5 py-1 rounded-md border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                  {project.categoryLabel}
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                  {project.badge && (
                    <span className="text-slate-300">{project.badge}</span>
                  )}
                  <span className="text-slate-500">•</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{project.stars || 3}</span>
                  </div>
                </div>
              </div>

              {/* Technical Blueprint Card */}
              {renderSchematic(project.id)}

              {/* Title & Description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-white group-hover:text-cyan-200 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Stack Badges & Actions */}
            <div className="flex flex-col gap-4 pt-3 border-t border-white/[0.08]">
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech, ti) => (
                  <span 
                    key={ti}
                    className="px-2.5 py-0.5 rounded-md stitch-capsule text-[11px] font-mono text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => telemetry.logEvent('link_click', `stitch_github_${project.id}`, `Buka GitHub: ${project.title}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-white transition-colors"
                  >
                    <span>{language === 'id' ? 'Lihat Repositori' : 'Inspect Repository'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
                      title="Source Code"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a 
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-white/[0.1] text-cyan-300 hover:text-white transition-colors"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
