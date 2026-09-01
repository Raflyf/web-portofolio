import React from 'react';

export default function SkillsBento() {
  return (
    <section id="skills" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Matriks Keahlian</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Teknologi & Lingkup Rekayasa
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Arsitektur piranti lunak, kerangka kerja AI/ML, dan pustaka yang rutin digunakan dalam implementasi nyata.
        </p>
      </div>

      {/* Infinite Marquee 1 */}
      <div className="relative overflow-hidden flex w-full mb-8" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
        <div className="animate-marquee flex gap-4 whitespace-nowrap px-2">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {["PyTorch Core", "Sentence-Transformers", "IndoBERT & RoBERTa", "NLP Cosine Metrics", "Scikit-Learn ML", "MediaPipe Tasks Vision", "OpenCV Python", "XGBoost & Naive Bayes", "Pandas & NumPy"].map((skill, j) => (
                <div key={`${i}-${j}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <span className="text-sm font-medium text-white">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Infinite Marquee 2 */}
      <div className="relative overflow-hidden flex w-full mb-16" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
        <div className="animate-marquee-reverse flex gap-4 whitespace-nowrap px-2">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {["MikroTik RouterOS v7", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filtering", "Flask-SocketIO", "Supabase Postgres RAG", "JavaScript ES2024", "RESTful APIs Architecture", "Linux & Git Workflow"].map((skill, j) => (
                <div key={`${i}-${j}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-sm font-medium text-white">{skill}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Machine Learning & NLP */}
        <div className="md:col-span-7 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
          <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-white/10 text-indigo-400 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              🤖
            </span>
            Machine Learning & NLP Engineering
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["Python 3", "PyTorch", "Scikit-Learn", "XGBoost", "Sentence-Transformers", "N-Gram Shingling", "Pandas", "NumPy"].map((tech, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-sm text-zinc-300 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Network & Infrastructure */}
        <div className="md:col-span-5 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
          <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-white/10 text-cyan-400 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              🌐
            </span>
            Network & Infrastructure
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MikroTik RouterOS", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filter Rules", "Simple Queues (QoS)", "VLAN & Tunnels"].map((tech, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-sm text-zinc-300 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Backend & Full-Stack */}
        <div className="md:col-span-5 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
          <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-white/10 text-emerald-400 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              ⚡
            </span>
            Backend & Full-Stack Systems
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["Python Flask", "PHP 8 MVC", "RESTful APIs", "MySQL Database", "Vanilla JS (ES6+)", "Modern CSS / OKLCH"].map((tech, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-sm text-zinc-300 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Computer Vision & Edge AI */}
        <div className="md:col-span-7 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
          <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-white/10 text-purple-400 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              👁️
            </span>
            Vision, Interactive & Realtime Tools
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MediaPipe Tasks Vision", "OpenCV Python", "Flask-SocketIO", "WebSockets", "PyAutoGUI", "DeviceOrientation API"].map((tech, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-sm text-zinc-300 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }
      `}</style>
    </section>
  );
}
