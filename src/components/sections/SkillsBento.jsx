import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Network, Server, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../ui/Reveal.jsx';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20 },
  visible: {
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.05 }
  }
};

const badgeVariants = {
  hidden: { scale: 0.8 },
  visible: { scale: 1, transition: { duration: 0.2 } }
};

export default function SkillsBento() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(true);

  // Viewport-Aware Animation Gating: Jeda animasi marquee saat di luar viewport untuk hemat CPU
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '250px 0px' }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={containerVariants}
        className="text-center space-y-4 mb-14"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t('skills.badge')}</span>
        </motion.div>
        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          {t('skills.title')}
        </motion.h2>
        <motion.p variants={itemVariants} className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          {t('skills.subtitle')}
        </motion.p>
      </motion.div>

      {/* Infinite Marquee 1 (Left Scrolling) */}
      <Reveal y={20} duration={0.5} delay={0.1} amount={0.8} className="relative overflow-hidden flex w-full mb-4 marquee-mask-x">
        <div 
          className="animate-marquee-left flex gap-3 whitespace-nowrap py-1"
          style={{ animationPlayState: isInView ? 'running' : 'paused' }}
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {["PyTorch Core", "Prompt Engineering", "Sentence-Transformers", "IndoBERT & RoBERTa", "Whisper AI Audio", "NLP Cosine Metrics", "Scikit-Learn ML", "MediaPipe Tasks Vision", "OpenCV Python", "XGBoost & Naive Bayes", "Pandas & NumPy"].map((skill, j) => (
                <div key={`${i}-${j}`} className="inline-flex items-center gap-2 rounded-full stitch-btn-glass px-4 py-2 hover:border-cyan-400/40 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </Reveal>

      {/* Infinite Marquee 2 (Right Scrolling) */}
      <Reveal y={20} duration={0.5} delay={0.2} amount={0.8} className="relative overflow-hidden flex w-full mb-16 marquee-mask-x">
        <div 
          className="animate-marquee-right flex gap-3 whitespace-nowrap py-1"
          style={{ animationPlayState: isInView ? 'running' : 'paused' }}
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {["MikroTik RouterOS v7", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filtering", "Flask-SocketIO", "Supabase Postgres RAG", "TypeScript & Node.js", "JavaScript ES2024", "RESTful APIs Architecture", "Linux & Git Workflow"].map((skill, j) => (
                <div key={`${i}-${j}`} className="inline-flex items-center gap-2 rounded-full stitch-btn-glass px-4 py-2 hover:border-emerald-400/40 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </Reveal>

      {/* Bento Grid with Uniform Obsidian Liquid Glass & Lucide SVG Icons */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        
        {/* Machine Learning & NLP */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="md:col-span-7 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            {t('skills.catMl')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["Python 3", "PyTorch", "Prompt Engineering", "Sentence-Transformers", "Scikit-Learn", "XGBoost", "N-Gram Shingling", "Pandas", "NumPy"].map((tech, i) => (
              <motion.span variants={badgeVariants} key={i} className="px-3.5 py-1.5 rounded-full stitch-btn-glass text-xs sm:text-sm text-zinc-300 font-medium hover:text-white transition-all">
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Network & Infrastructure */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="md:col-span-5 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Network className="w-5 h-5" />
            </div>
            {t('skills.catNet')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MikroTik RouterOS", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filter Rules", "Simple Queues (QoS)", "VLAN & Tunnels"].map((tech, i) => (
              <motion.span variants={badgeVariants} key={i} className="px-3.5 py-1.5 rounded-full stitch-btn-glass text-xs sm:text-sm text-zinc-300 font-medium hover:text-white transition-all">
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Backend & Full-Stack */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="md:col-span-5 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Server className="w-5 h-5" />
            </div>
            {t('skills.catFullstack')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["React.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Supabase DB", "Node.js API", "Flask API"].map((tech, i) => (
              <motion.span variants={badgeVariants} key={i} className="px-3.5 py-1.5 rounded-full stitch-btn-glass text-xs sm:text-sm text-zinc-300 font-medium hover:text-white transition-all">
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Computer Vision & Interactive Tools */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="md:col-span-7 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Eye className="w-5 h-5" />
            </div>
            {t('skills.catVision')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MediaPipe Tasks Vision", "OpenCV Python", "Flask-SocketIO", "WebSockets", "PyAutoGUI", "DeviceOrientation API"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full stitch-btn-glass text-xs sm:text-sm text-zinc-300 font-medium hover:text-white transition-all">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
