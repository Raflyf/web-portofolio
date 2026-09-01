import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CERTIFICATES_DATA } from '../../data';
import { FileText, Award, ExternalLink, Calendar, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { telemetry } from '../../lib/telemetry';

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
const tabVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

export default function CertificatesGrid() {
  const [filter, setFilter] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedPage, setSelectedPage] = useState(0);
  // FIX M6: dialog focus management — modal container ref + trigger element ref.
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  const openCertModal = (cert, triggerEl) => {
    setSelectedCert(cert);
    setSelectedPage(0);
    // Remember which card opened the modal so focus can return on close.
    triggerRef.current = triggerEl || null;
    const title = cert.title || 'Sertifikat';
    telemetry.logEvent('cert_view', cert.id || title, `Buka Detail Kredensial: ${title}`);
  };

  const closeCertModal = () => {
    setSelectedCert(null);
    setSelectedPage(0);
    // FIX M6: return focus to the trigger card (if it is still mounted).
    if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
    }
    triggerRef.current = null;
  };

  // FIX M6: focus the dialog container when it opens.
  useEffect(() => {
    if (selectedCert && modalRef.current) {
      modalRef.current.focus();
    }
  }, [selectedCert]);

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
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.8 }}
        className="flex flex-wrap justify-center gap-2 mb-12"
      >
        {[
          { id: 'all', label: 'Semua Sertifikat' },
          { id: 'ai-ml', label: 'AI & Python' },
          { id: 'security', label: 'Jaringan & Keamanan' },
          { id: 'web', label: 'Web & BNSP' },
          { id: 'cloud', label: 'Cloud Computing' }
        ].map(tab => (
          <motion.button
            variants={tabVariants}
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all backdrop-blur-xl border cursor-pointer ${
              filter === tab.id 
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                : 'bg-slate-900/50 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Cards Grid — whileInView per-card agar animasi individual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCertificates.map((cert, index) => (
            <motion.div 
              layout
              key={cert.id} 
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.16, 1, 0.3, 1],
                delay: (index % 3) * 0.08
              }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="liquid-glass liquid-glass-hover group flex flex-col justify-between relative overflow-hidden p-6"
            >
              <div>
                {/* Certificate Preview Frame */}
                <div
                  onClick={(e) => openCertModal(cert, e.currentTarget)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCertModal(cert, e.currentTarget); } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat detail sertifikat ${cert.title}`}
                  className="h-44 w-full relative overflow-hidden liquid-glass-inset mb-5 group/img cursor-pointer"
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
                  onClick={() => telemetry.logEvent('cert_view', `${cert.id}_pdf`, `Buka PDF: ${cert.title}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all shadow-sm group/btn"
                >
                  <FileText className="w-4 h-4 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                  <span>Lihat Dokumen PDF</span>
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Certificate Viewer Modal (Multi-Page Support) */}
      <AnimatePresence>
        {selectedCert && (
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Pratinjau sertifikat ${selectedCert.title}`}
            tabIndex={-1}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl glass-backdrop-in"
            onClick={closeCertModal}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] liquid-glass-strong glass-spring-in p-4 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 mb-3 shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">{selectedCert.title}</h3>
                  <p className="text-[11px] text-zinc-400 truncate">{selectedCert.issuer} · {selectedCert.date}</p>
                </div>
                <button
                  onClick={closeCertModal}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer shrink-0"
                  aria-label="Tutup Pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Multi-Page Image Area */}
              {(() => {
                const pages = (selectedCert.images && selectedCert.images.length > 0)
                  ? selectedCert.images
                  : [selectedCert.imageUrl].filter(Boolean);
                const pageIndex = Math.min(selectedPage, pages.length - 1);
                const currentPage = pages[pageIndex];

                return (
                  <div className="relative flex-1 min-h-0 overflow-hidden">
                    <img
                      src={currentPage}
                      alt={`${selectedCert.title} - Halaman ${pageIndex + 1}`}
                      className="w-full h-auto max-h-[70vh] object-contain rounded-2xl mx-auto"
                    />

                    {pages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedPage(prev => (prev - 1 + pages.length) % pages.length)}
                          disabled={pages.length <= 1}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white cursor-pointer"
                          aria-label="Halaman Sebelumnya"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedPage(prev => (prev + 1) % pages.length)}
                          disabled={pages.length <= 1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white cursor-pointer"
                          aria-label="Halaman Berikutnya"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 border border-white/15 text-[11px] font-mono text-zinc-300">
                          {pageIndex + 1} / {pages.length}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Footer Actions */}
              {selectedCert.pdfUrl && (
                <div className="pt-3 border-t border-white/10 mt-3 shrink-0">
                  <a
                    href={selectedCert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-zinc-300 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Lihat Dokumen PDF Lengkap</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
