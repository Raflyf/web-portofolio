import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CERTIFICATES_DATA } from '../../data';
import { FileText, Award, ExternalLink, Calendar, Eye, X } from 'lucide-react';

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
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredCertificates = CERTIFICATES_DATA.filter(cert => {
    if (filter === 'all') return true;
    if (filter === 'security') return cert.category === 'security' || cert.category === 'network';
    return cert.category === filter;
  });

  return (
    <section id="certificates" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
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
          { id: 'ai-ml', label: 'AI & Python' },
          { id: 'security', label: 'Jaringan & Keamanan' },
          { id: 'web', label: 'Web & BNSP' },
          { id: 'cloud', label: 'Cloud Computing' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all backdrop-blur-xl border cursor-pointer ${
              filter === tab.id 
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                : 'bg-slate-900/50 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white'
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
        whileInView="visible"
        viewport={{ once: false, amount: 0.1 }}
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
              className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl hover:border-cyan-500/30 transition-all shadow-xl group flex flex-col justify-between relative overflow-hidden p-6"
            >
              <div>
                {/* Certificate Preview Frame */}
                <div 
                  onClick={() => setSelectedImage(cert.imageUrl || cert.images?.[0])}
                  className="h-44 w-full relative overflow-hidden rounded-2xl bg-black/60 border border-white/10 mb-5 group/img cursor-pointer"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-slate-900/80 z-0">
                    <Award className="w-10 h-10 opacity-30 text-cyan-400" />
                  </div>
                  
                  {cert.imageUrl && (
                    <img 
                      src={cert.imageUrl} 
                      alt={cert.title}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105 opacity-90 group-hover/img:opacity-100 z-10"
                      loading="lazy"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
                  
                  <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    {cert.date}
                  </div>

                  <div className="absolute bottom-3 right-3 z-30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 text-[10px] font-semibold text-cyan-300">
                    <Eye className="w-3 h-3" />
                    Pratinjau
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-3">
                  <div className="text-[11px] font-semibold text-cyan-400 tracking-wide">
                    {cert.issuer}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {cert.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {cert.description}
                  </p>
                </div>
              </div>

              {/* Pristine Full-Width Liquid Glass PDF Button */}
              <div className="pt-5 mt-4 border-t border-white/10">
                <a
                  href={cert.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all shadow-sm group/btn"
                >
                  <FileText className="w-4 h-4 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                  <span>Lihat Dokumen PDF</span>
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-950 border border-white/15 rounded-3xl p-4 overflow-hidden shadow-2xl">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={selectedImage} 
                alt="Pratinjau Sertifikat" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
