import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Cpu, Network, Server, Eye, CheckCircle } from 'lucide-react';

export default function SkillsMatrix() {
  const { language, t } = useLanguage();

  const marqueeGroup1 = [
    "PyTorch Core", "Sentence-Transformers", "IndoBERT & RoBERTa", 
    "NLP Cosine Metrics", "Scikit-Learn ML", "MediaPipe Tasks Vision", 
    "OpenCV Python", "XGBoost & Naive Bayes", "Pandas & NumPy", "N-Gram Shingling"
  ];

  const marqueeGroup2 = [
    "MikroTik RouterOS v7", "MTCNA Certified", "Static & Dynamic Routing", 
    "Firewall Filtering", "Flask-SocketIO", "Supabase Postgres RAG", 
    "JavaScript ES2024", "RESTful APIs Architecture", "Linux & Git Workflow", "React 19"
  ];

  const skillCards = [
    {
      title: t('skills.catMl'),
      icon: Cpu,
      color: 'text-cyan-400',
      badgeClass: 'v2-badge-cyan',
      skills: ["Python 3", "PyTorch", "Scikit-Learn", "XGBoost", "Sentence-Transformers", "N-Gram Shingling", "Pandas", "NumPy", "Concept Drift", "Cosine Similarity"]
    },
    {
      title: t('skills.catNet'),
      icon: Network,
      color: 'text-emerald-400',
      badgeClass: 'v2-badge-emerald',
      skills: ["MikroTik RouterOS", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filter Rules", "Simple Queues (QoS)", "VLAN & Tunnels", "Bandwidth Management", "Network Diagnostics"]
    },
    {
      title: t('skills.catFullstack'),
      icon: Server,
      color: 'text-indigo-400',
      badgeClass: 'v2-badge-indigo',
      skills: ["React 19", "Tailwind CSS", "Framer Motion", "Supabase DB", "Node.js API", "Flask API", "Vercel Serverless", "RESTful Architecture"]
    },
    {
      title: t('skills.catVision'),
      icon: Eye,
      color: 'text-amber-400',
      badgeClass: 'v2-badge-amber',
      skills: ["MediaPipe Tasks Vision", "OpenCV Python", "Flask-SocketIO", "WebSockets", "PyAutoGUI", "DeviceOrientation API", "Edge AI Inference", "WebRTC"]
    }
  ];

  return (
    <section id="skills" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto py-24">
      <div className="v2-glow-spot top-1/3 left-10 bg-cyan-500/10" />

      {/* Header */}
      <div className="space-y-4 mb-14 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full v2-glass-pill text-xs font-semibold uppercase tracking-wider text-cyan-400 v2-font-mono">
          <span>03 / {t('skills.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight v2-font-display">
          {t('skills.title')}
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg">
          {t('skills.subtitle')}
        </p>
      </div>

      {/* Ticker 1 */}
      <div 
        className="relative overflow-hidden flex w-full mb-3 select-none"
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div className="animate-marquee-left flex gap-3 whitespace-nowrap py-1">
          {[...Array(2)].map((_, loopIdx) => (
            <React.Fragment key={loopIdx}>
              {marqueeGroup1.map((skill, sIdx) => (
                <div key={`${loopIdx}-${sIdx}`} className="inline-flex items-center gap-2 rounded-full v2-glass-pill px-4 py-2 hover:border-cyan-400/40 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Ticker 2 */}
      <div 
        className="relative overflow-hidden flex w-full mb-14 select-none"
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div className="animate-marquee-right flex gap-3 whitespace-nowrap py-1">
          {[...Array(2)].map((_, loopIdx) => (
            <React.Fragment key={loopIdx}>
              {marqueeGroup2.map((skill, sIdx) => (
                <div key={`${loopIdx}-${sIdx}`} className="inline-flex items-center gap-2 rounded-full v2-glass-pill px-4 py-2 hover:border-emerald-400/40 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="v2-glass-card p-7 sm:p-8 rounded-3xl space-y-6 group hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl v2-glass-pill flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white v2-font-display">
                  {card.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {card.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-3.5 py-1.5 rounded-xl v2-glass-pill text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:border-cyan-400/30 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
