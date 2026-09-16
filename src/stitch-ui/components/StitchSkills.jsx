import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Brain, Network, Server, ShieldCheck } from 'lucide-react';

export default function StitchSkills() {
  const { language } = useLanguage();

  const skillColumns = [
    {
      icon: Brain,
      title: 'AI & Deep Learning',
      skills: [
        { name: 'PyTorch & CUDA', level: 'Advanced', percent: '92%' },
        { name: 'Sentence-Transformers', level: 'Specialist', percent: '95%' },
        { name: 'Prompt Engineering', level: 'Specialist', percent: '95%' },
        { name: 'Computer Vision', level: 'Proficient', percent: '84%' },
        { name: 'Scikit-Learn & XGBoost', level: 'Experienced', percent: '88%' }
      ]
    },
    {
      icon: Network,
      title: 'Network & Infrastructure',
      skills: [
        { name: 'MikroTik RouterOS v7', level: 'MTCNA Certified', percent: '95%' },
        { name: 'Firewall Filter Rules', level: 'Production', percent: '92%' },
        { name: 'Routing (Static/Dynamic)', level: 'Advanced', percent: '90%' },
        { name: 'Simple Queues (QoS)', level: 'Specialist', percent: '88%' },
        { name: 'VLAN & WireGuard Tunnels', level: 'Proficient', percent: '85%' }
      ]
    },
    {
      icon: Server,
      title: 'Backend & Data Systems',
      skills: [
        { name: 'FastAPI & Flask API', level: 'Production', percent: '90%' },
        { name: 'Supabase PostgreSQL RAG', level: 'Specialist', percent: '92%' },
        { name: 'WebSockets & Socket.IO', level: 'Realtime', percent: '88%' },
        { name: 'Node.js & TypeScript', level: 'Production', percent: '86%' },
        { name: 'Docker & Linux Systems', level: 'Proficient', percent: '84%' }
      ]
    },
    {
      icon: ShieldCheck,
      title: 'Frontend & Security',
      skills: [
        { name: 'React 19 & Vite 8', level: 'Advanced', percent: '92%' },
        { name: 'Tailwind CSS v4', level: 'Mastery', percent: '94%' },
        { name: 'Framer Motion Physics', level: 'Fluid', percent: '90%' },
        { name: 'OWASP Security Best Practice', level: 'Strict', percent: '89%' },
        { name: 'WCAG 2.2 AA Accessibility', level: 'Audited', percent: '92%' }
      ]
    }
  ];

  return (
    <section className="flex flex-col gap-8" id="stack-matrix">
      {/* Section Header */}
      <div className="flex flex-col gap-1 border-b border-white/[0.1] pb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-medium">
          {language === 'id' ? 'Kompetensi Inti' : 'Core Competencies'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          {language === 'id' ? 'Matriks Rekayasa Perangkat Lunak & AI' : 'Machine Intelligence & Software Matrix'}
        </h2>
      </div>

      {/* 4-Column Refractive Liquid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skillColumns.map((col, idx) => {
          const Icon = col.icon;
          return (
            <div 
              key={idx}
              className="rounded-xl stitch-glass stitch-glass-hover p-5 flex flex-col gap-5"
            >
              <div className="flex items-center gap-2.5 text-white font-medium text-sm border-b border-white/10 pb-3">
                <div className="p-1.5 rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  <Icon className="w-4 h-4" />
                </div>
                <span>{col.title}</span>
              </div>

              <div className="flex flex-col gap-3.5 font-mono text-xs text-slate-300">
                {col.skills.map((s, si) => (
                  <div key={si} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-200">{s.name}</span>
                      <span className="text-cyan-300 font-medium">{s.level}</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full shadow-[0_0_8px_rgba(111,246,255,0.7)]" 
                        style={{ width: s.percent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
