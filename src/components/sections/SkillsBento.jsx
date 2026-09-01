import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Network, Server, Eye } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function SkillsBento() {
  return (
    <section id="skills" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={containerVariants}
        className="text-center space-y-4 mb-14"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Matriks Keahlian</span>
        </motion.div>
        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          Teknologi & Lingkup Rekayasa
        </motion.h2>
        <motion.p variants={itemVariants} className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          Arsitektur piranti lunak, kerangka kerja AI/ML, dan pustaka yang rutin digunakan dalam implementasi nyata.
        </motion.p>
      </motion.div>

      {/* Infinite Marquee 1 (Left Scrolling) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden flex w-full mb-4" 
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div className="animate-marquee-left flex gap-3 whitespace-nowrap py-1">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {["PyTorch Core", "Sentence-Transformers", "IndoBERT & RoBERTa", "NLP Cosine Metrics", "Scikit-Learn ML", "MediaPipe Tasks Vision", "OpenCV Python", "XGBoost & Naive Bayes", "Pandas & NumPy"].map((skill, j) => (
                <div key={`${i}-${j}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 backdrop-blur-xl hover:border-cyan-400/40 transition-colors shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Infinite Marquee 2 (Right Scrolling) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative overflow-hidden flex w-full mb-16" 
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div className="animate-marquee-right flex gap-3 whitespace-nowrap py-1">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {["MikroTik RouterOS v7", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filtering", "Flask-SocketIO", "Supabase Postgres RAG", "JavaScript ES2024", "RESTful APIs Architecture", "Linux & Git Workflow"].map((skill, j) => (
                <div key={`${i}-${j}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 backdrop-blur-xl hover:border-emerald-400/40 transition-colors shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

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
          className="md:col-span-7 rounded-3xl border border-white/10 bg-slate-950/70 p-7 sm:p-8 backdrop-blur-2xl shadow-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            Machine Learning & NLP Engineering
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["Python 3", "PyTorch", "Scikit-Learn", "XGBoost", "Sentence-Transformers", "N-Gram Shingling", "Pandas", "NumPy"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-zinc-300 font-medium hover:border-cyan-400/30 hover:text-cyan-200 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Network & Infrastructure */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="md:col-span-5 rounded-3xl border border-white/10 bg-slate-950/70 p-7 sm:p-8 backdrop-blur-2xl shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Network className="w-5 h-5" />
            </div>
            Network & Infrastructure
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MikroTik RouterOS", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filter Rules", "Simple Queues (QoS)", "VLAN & Tunnels"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-zinc-300 font-medium hover:border-emerald-400/30 hover:text-emerald-200 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Backend & Full-Stack */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="md:col-span-5 rounded-3xl border border-white/10 bg-slate-950/70 p-7 sm:p-8 backdrop-blur-2xl shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Server className="w-5 h-5" />
            </div>
            Backend & Full-Stack Systems
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["Python Flask", "PHP 8 MVC", "RESTful APIs", "MySQL Database", "Vanilla JS (ES6+)", "Modern CSS / OKLCH"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-zinc-300 font-medium hover:border-indigo-400/30 hover:text-indigo-200 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Computer Vision & Interactive Tools */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="md:col-span-7 rounded-3xl border border-white/10 bg-slate-950/70 p-7 sm:p-8 backdrop-blur-2xl shadow-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Eye className="w-5 h-5" />
            </div>
            Vision, Interactive & Realtime Tools
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MediaPipe Tasks Vision", "OpenCV Python", "Flask-SocketIO", "WebSockets", "PyAutoGUI", "DeviceOrientation API"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-zinc-300 font-medium hover:border-cyan-400/30 hover:text-cyan-200 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
