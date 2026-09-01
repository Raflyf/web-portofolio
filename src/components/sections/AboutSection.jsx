import React from 'react';
import { motion } from 'framer-motion';
import { DEVELOPER_PROFILE } from '../../data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function AboutSection() {
  return (
    <section id="about" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="text-center space-y-4 mb-16"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
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
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        {/* Main Bio Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-6 space-y-6 text-base sm:text-lg text-zinc-300 leading-relaxed p-8 sm:p-10 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col justify-center"
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
              title: 'AI & NLP Research',
              desc: 'Pengolahan bahasa alami, deteksi parafrasa semantik, embedding transformer, dan komparasi algoritma ML.',
              gradient: 'from-indigo-500/10'
            },
            {
              title: 'Network & Systems',
              desc: 'Konfigurasi MikroTik RouterOS v7 (MTCNA), routing statis/dinamis, firewall filtering, dan manajemen bandwidth.',
              gradient: 'from-cyan-500/10'
            },
            {
              title: 'Computer Vision',
              desc: 'Deteksi gesture tangan dan landmark wajah via MediaPipe Tasks Vision & OpenCV di peramban secara real-time.',
              gradient: 'from-purple-500/10'
            },
            {
              title: 'Full-Stack & Security',
              desc: 'Pengembangan server Flask/PHP, interaksi real-time WebSockets, proteksi OWASP, dan frontend WCAG 2.2 AA.',
              gradient: 'from-emerald-500/10'
            }
          ].map((pillar, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl hover:bg-white/10 transition-colors shadow-xl group cursor-default relative overflow-hidden flex flex-col justify-between"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} to-transparent opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none`} />
              <div>
                <h3 className="text-lg font-bold text-white mb-2 relative z-10 tracking-tight">{pillar.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed relative z-10">{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
