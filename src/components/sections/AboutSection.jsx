import React from 'react';
import { motion } from 'framer-motion';
import { DEVELOPER_PROFILE } from '../../data';
import { Brain, Network, Eye, ShieldCheck } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export default function AboutSection() {
  return (
    <section id="about" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={containerVariants}
        className="text-center space-y-4 mb-16"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Profil & Visi</span>
        </motion.div>
        
        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          Dedikasi pada Rekayasa Perangkat Lunak & Riset Terbuka
        </motion.h2>
        
        <motion.p variants={itemVariants} className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          Mengkombinasikan ketajaman analisis algoritmik dengan arsitektur sistem yang transparan, dapat direproduksi, dan beretika privasi.
        </motion.p>
      </motion.div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        {/* Main Bio Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-6 space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed p-8 sm:p-10 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col justify-center hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <p className="relative z-10">
            Saya adalah seorang pengembang perangkat lunak dan mahasiswa <strong>{DEVELOPER_PROFILE.degree}</strong> di <strong>Universitas Bina Sarana Informatika (UBSI)</strong> yang mendalami bidang <strong>Kecerdasan Buatan (NLP, Machine Learning, Computer Vision)</strong> serta <strong>Arsitektur Jaringan Komputer & Web Modern</strong>.
          </p>
          <p className="relative z-10">
            Melalui proyek riset seperti <strong>OpenPlagiarismChecker</strong>, saya mengembangkan alternatif mesin pemeriksa dokumen akademik yang menggabungkan pencocokan eksak <em>N-Gram Shingling</em> dan embedding semantik <em>Sentence Transformers</em> tanpa kompromi privasi data. Di bidang klasifikasi, saya merancang evaluasi model <em>Complement Naive Bayes vs XGBoost</em> serta metode <em>Domain Adaptation</em> untuk mengatasi <em>Concept Drift</em> pada email spam modern.
          </p>
        </motion.div>

        {/* Pillars Cards - Liquid Glass 2x2 Grid */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Brain,
              title: 'AI & NLP Research',
              desc: 'Pengolahan bahasa alami, deteksi parafrasa semantik, embedding transformer, dan komparasi algoritma ML.',
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/15',
              border: 'border-indigo-500/30'
            },
            {
              icon: Network,
              title: 'Network & Systems',
              desc: 'Konfigurasi MikroTik RouterOS v7 (MTCNA), routing statis/dinamis, firewall filtering, dan manajemen bandwidth.',
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/15',
              border: 'border-cyan-500/30'
            },
            {
              icon: Eye,
              title: 'Computer Vision',
              desc: 'Deteksi gesture tangan dan landmark wajah via MediaPipe Tasks Vision & OpenCV di peramban secara real-time.',
              color: 'text-purple-400',
              bg: 'bg-purple-500/15',
              border: 'border-purple-500/30'
            },
            {
              icon: ShieldCheck,
              title: 'Full-Stack & Security',
              desc: 'Pengembangan server Flask/PHP, interaksi real-time WebSockets, proteksi OWASP, dan frontend WCAG 2.2 AA.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/15',
              border: 'border-emerald-500/30'
            }
          ].map((pillar, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl hover:border-cyan-500/30 transition-all shadow-xl group cursor-default relative overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl ${pillar.bg} border ${pillar.border} flex items-center justify-center ${pillar.color} mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]`}>
                  <pillar.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
