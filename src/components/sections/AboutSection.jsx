import React from 'react';
import { DEVELOPER_PROFILE } from '../../data';

export default function AboutSection() {
  return (
    <section id="about" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Profil & Visi</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Dedikasi pada Rekayasa Perangkat Lunak & Riset Terbuka
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Mengkombinasikan ketajaman analisis algoritmik dengan arsitektur sistem yang transparan, dapat direproduksi, dan beretika privasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Bio Text */}
        <div className="space-y-6 text-lg text-zinc-300 leading-relaxed p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <p className="relative z-10">
            Saya adalah seorang pengembang perangkat lunak dan mahasiswa <strong>{DEVELOPER_PROFILE.degree}</strong> di <strong>Universitas Bina Sarana Informatika (UBSI)</strong> yang mendalami bidang <strong>Kecerdasan Buatan (NLP, Machine Learning, Computer Vision)</strong> serta <strong>Arsitektur Jaringan Komputer & Web Modern</strong>.
          </p>
          <p className="relative z-10">
            Melalui proyek riset seperti <strong>OpenPlagiarismChecker</strong>, saya mengembangkan alternatif mesin pemeriksa dokumen akademik yang menggabungkan pencocokan eksak <em>N-Gram Shingling</em> dan embedding semantik <em>Sentence Transformers</em> tanpa kompromi privasi data. Di bidang klasifikasi, saya merancang evaluasi model <em>Complement Naive Bayes vs XGBoost</em> serta metode <em>Domain Adaptation</em> untuk mengatasi <em>Concept Drift</em> pada email spam modern.
          </p>
        </div>

        {/* Pillars Cards - Liquid Glass */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'AI & NLP Research',
              desc: 'Pengolahan bahasa alami, deteksi parafrasa semantik, embedding transformer, dan komparasi algoritma ML.'
            },
            {
              title: 'Network & Systems',
              desc: 'Konfigurasi MikroTik RouterOS v7 (MTCNA), routing statis/dinamis, firewall filtering, dan manajemen bandwidth.'
            },
            {
              title: 'Computer Vision',
              desc: 'Deteksi gesture tangan dan landmark wajah via MediaPipe Tasks Vision & OpenCV di peramban secara real-time.'
            },
            {
              title: 'Full-Stack & Security',
              desc: 'Pengembangan server Flask/PHP, interaksi real-time WebSockets, proteksi OWASP, dan frontend WCAG 2.2 AA.'
            }
          ].map((pillar, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors shadow-xl group cursor-default relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">{pillar.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed relative z-10">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
