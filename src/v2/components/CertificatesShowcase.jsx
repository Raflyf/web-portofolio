import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getCertificatesData } from '../../data.js';
import { Award, ShieldCheck, ExternalLink, Eye, X, Calendar, UserCheck, FileText, CheckCircle2 } from 'lucide-react';
import { telemetry } from '../../lib/telemetry.js';

export default function CertificatesShowcase() {
  const { language, t } = useLanguage();
  const certificates = getCertificatesData(language);
  const [selectedCert, setSelectedCert] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    { id: 'all', label: t('certificates.tabAll') },
    { id: 'web', label: language === 'id' ? 'Rekayasa Software' : 'Software Engineering' },
    { id: 'security', label: language === 'id' ? 'Jaringan & Keamanan' : 'Network & Security' },
    { id: 'ai-ml', label: 'Python & AI' },
    { id: 'cloud', label: 'Cloud Systems' }
  ];

  const filteredCerts = filterCategory === 'all'
    ? certificates
    : certificates.filter(c => c.category === filterCategory);

  const openCertModal = (cert) => {
    setSelectedCert(cert);
    telemetry.logEvent('certificate_modal_open', 'inspect', cert.title);
  };

  const closeCertModal = () => {
    setSelectedCert(null);
  };

  return (
    <section id="certificates" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto py-24">
      <div className="v2-glow-spot top-1/3 right-10 bg-emerald-500/10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full v2-glass-pill text-xs font-semibold uppercase tracking-wider text-emerald-400 v2-font-mono">
            <span>04 / {t('certificates.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight v2-font-display">
            {t('certificates.title')}
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl">
            {t('certificates.subtitle')}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-400/20'
                  : 'v2-glass-pill text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert, idx) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="v2-glass-card v2-glass-card-interactive p-6 rounded-3xl flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-4">
              {/* Badge & Date */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full v2-badge-emerald text-[11px] font-mono font-semibold">
                  {cert.categoryLabel}
                </span>
                <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  {cert.date}
                </span>
              </div>

              {/* Title & Issuer */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors v2-font-display line-clamp-2">
                  {cert.title}
                </h3>
                <p className="text-xs text-zinc-400 font-medium">
                  {cert.issuer}
                </p>
              </div>

              {/* Description Preview */}
              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {cert.description}
              </p>

              {/* Credential ID */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="text-zinc-500">ID:</span>
                <span className="text-zinc-300 font-semibold truncate max-w-[180px]">
                  {cert.credentialId}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => openCertModal(cert)}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'id' ? 'Lihat Bukti' : 'View Credential'}</span>
              </button>

              {cert.verificationUrl && (
                <a
                  href={cert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-emerald-300 transition-colors"
                  aria-label="Verifikasi Eksternal"
                  title="Verifikasi Lembaga"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Dialog Viewer */}
      <AnimatePresence>
        {selectedCert && (
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="v2-glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={closeCertModal}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-8">
                <span className="px-3 py-1 rounded-full v2-badge-emerald text-xs font-mono font-semibold">
                  {selectedCert.categoryLabel}
                </span>
                <h3 id="cert-modal-title" className="text-xl sm:text-2xl font-bold text-white v2-font-display">
                  {selectedCert.title}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-400 font-medium">
                  {selectedCert.issuer} — {selectedCert.institution}
                </p>
              </div>

              {/* Certificate Image Preview */}
              {selectedCert.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 p-2">
                  <img
                    src={selectedCert.imageUrl}
                    alt={selectedCert.title}
                    className="w-full max-h-80 object-contain rounded-xl"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Description & Details */}
              <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
                <p className="leading-relaxed">
                  {selectedCert.description}
                </p>

                {selectedCert.skillsGained && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      {language === 'id' ? 'Kompetensi Tervalidasi:' : 'Validated Competencies:'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCert.skillsGained.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg v2-glass-pill text-xs font-medium text-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500">Credential ID:</span>{' '}
                    <span className="text-zinc-200 font-semibold">{selectedCert.credentialId}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Issued Date:</span>{' '}
                    <span className="text-zinc-200 font-semibold">{selectedCert.date}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {selectedCert.pdfUrl && (
                  <a
                    href={selectedCert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}

                {selectedCert.verificationUrl && (
                  <a
                    href={selectedCert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>Lembaga Penerbit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
