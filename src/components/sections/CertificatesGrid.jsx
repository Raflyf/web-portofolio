import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CERTIFICATES_DATA } from '../../data';
import { FileText, Award } from 'lucide-react';
import { LiquidButton } from '../ui/liquid-glass-button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function CertificatesGrid() {
  const [filter, setFilter] = useState('all');

  const filteredCertificates = CERTIFICATES_DATA.filter(cert => 
    filter === 'all' ? true : cert.category === filter
  );

  return (
    <section id="certificates" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Validasi Kredensial</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          Sertifikasi Resmi & Penghargaan
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          Lisensi profesional dan transkrip akademik yang divalidasi oleh lembaga tersertifikasi (BNSP, MikroTik, Cisco, dll).
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {[
          { id: 'all', label: 'Semua Sertifikat' },
          { id: 'bnsp', label: 'BNSP / Nasional' },
          { id: 'international', label: 'Internasional (Cisco/MikroTik)' },
          { id: 'bootcamp', label: 'Bootcamp & Workshop' },
          { id: 'seminar', label: 'Seminar Akademik' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border cursor-pointer ${
              filter === tab.id 
                ? 'bg-white/10 border-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div 
        layout
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredCertificates.map(cert => (
            <motion.div 
              layout
              key={cert.id} 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl hover:border-white/20 transition-all shadow-xl group flex flex-col relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Certificate Image Frame */}
              <div className="h-48 w-full relative overflow-hidden bg-black/60 border-b border-white/5">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-white/5 z-0">
                  <Award className="w-12 h-12 opacity-40" />
                </div>
                <img 
                  src={`/${cert.imageUrl}`} 
                  alt={cert.title}
                  className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                
                <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                  {cert.badge && (
                    <span className="px-2 py-1 text-[10px] font-semibold tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded backdrop-blur-md uppercase">
                      {cert.badge}
                    </span>
                  )}
                  <span className="px-2 py-1 text-[10px] font-medium tracking-wider text-zinc-300 bg-black/60 border border-white/10 rounded backdrop-blur-md uppercase">
                    {cert.date}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 relative z-20">
                <h3 className="text-lg font-bold text-white mb-1 tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {cert.title}
                </h3>
                <p className="text-sm font-medium text-indigo-400 mb-4">
                  {cert.issuer}
                </p>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed line-clamp-2">
                  {cert.description}
                </p>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <LiquidButton variant="glass" size="sm" className="w-full justify-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Lihat Dokumen PDF
                    </LiquidButton>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
