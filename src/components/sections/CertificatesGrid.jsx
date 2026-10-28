import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { getCertificatesData } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, Award, Calendar, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { telemetry } from '../../lib/telemetry';
import Reveal from '../ui/Reveal.jsx';

export default function CertificatesGrid() {
  const { language, t } = useLanguage();
  const certificates = useMemo(() => getCertificatesData(language), [language]);
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
    const title = cert.title || (language === 'id' ? 'Sertifikat' : 'Certificate');
    telemetry.logEvent('cert_view', cert.id || title, `Buka Detail Kredensial: ${title}`);
  };

  const closeCertModal = () => {
    setSelectedCert(null);
    setSelectedPage(0);
    // FIX M6: return focus to the trigger card without scrolling the viewport.
    if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus({ preventScroll: true });
    }
    triggerRef.current = null;
  };

  // FIX M6: focus the dialog container when it opens without scrolling, and lock Lenis scroll.
  useEffect(() => {
    if (selectedCert) {
      if (modalRef.current) {
        modalRef.current.focus({ preventScroll: true });
      }
      if (window.__lenis) {
        try { window.__lenis.stop(); } catch {}
      }
      document.body.style.overflow = 'hidden';
    } else {
      if (window.__lenis) {
        try { window.__lenis.start(); } catch {}
      }
      document.body.style.overflow = '';
    }
    return () => {
      if (window.__lenis) {
        try { window.__lenis.start(); } catch {}
      }
      document.body.style.overflow = '';
    };
  }, [selectedCert]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      if (filter === 'all') return true;
      if (filter === 'security') return cert.category === 'security' || cert.category === 'network';
      return cert.category === filter;
    });
  }, [certificates, filter]);

  const filterTabs = useMemo(() => [
    { id: 'all', label: t('certificates.tabAll') },
    { id: 'ai-ml', label: t('certificates.tabAi') },
    { id: 'security', label: t('certificates.tabSecurity') },
    { id: 'web', label: t('certificates.tabWeb') },
    { id: 'cloud', label: t('certificates.tabCloud') }
  ], [t]);

  return (
    <section id="certificates" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <Reveal className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full stitch-btn-glass px-3.5 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t('certificates.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          {t('certificates.title')}
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          {t('certificates.subtitle')}
        </p>
      </Reveal>

      {/* Filter Tabs */}
      <Reveal delay={0.06} className="flex justify-center mb-12">
        <div className="stitch-capsule-group">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                telemetry.logEvent('filter_click', tab.id, `Filter Sertifikat: ${tab.label}`);
              }}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                filter === tab.id 
                  ? 'stitch-tab-active text-white' 
                  : 'stitch-tab-flat'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Cards Grid — Unified GPU Reveal per-card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((cert, index) => (
          <Reveal 
            key={cert.id} 
            delay={(index % 3) * 0.08}
            className="liquid-glass liquid-glass-hover group flex flex-col justify-between relative overflow-hidden p-6"
          >
            <div>
              {/* Certificate Preview Frame */}
              <div
                onClick={(e) => openCertModal(cert, e.currentTarget)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCertModal(cert, e.currentTarget); } }}
                role="button"
                tabIndex={0}
                aria-label={`${t('certificates.previewTitle')} ${cert.title}`}
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
                    decoding="async"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-20" />
                
                <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 border border-white/10 text-[10px] font-mono text-zinc-300">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  {cert.date}
                </div>

                <div className="absolute bottom-3 right-3 z-30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950/85 border border-cyan-400/40 text-[10px] font-semibold text-cyan-300">
                  <Eye className="w-3 h-3" />
                  {language === 'id' ? 'Pratinjau' : 'Preview'}
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
                className="w-full py-2.5 px-4 rounded-full stitch-btn-glass text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-all group/btn shadow-md"
              >
                <FileText className="w-4 h-4 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                <span>{t('certificates.viewPdf')}</span>
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Certificate Viewer Modal (Top-Level Portal agar fixed terhadap layar saat ini, bukan terhadap .section-contain) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedCert && (
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${t('certificates.previewTitle')} ${selectedCert.title}`}
              tabIndex={-1}
              data-lenis-prevent="true"
              className="stitch-liquid-theme fixed inset-0 z-100 flex items-center justify-center p-4 glass-backdrop-in focus:outline-none"
              onClick={closeCertModal}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  closeCertModal();
                } else if (e.key === 'ArrowLeft') {
                  setSelectedPage((p) => Math.max(0, p - 1));
                } else if (e.key === 'ArrowRight') {
                  const total = (selectedCert.images && selectedCert.images.length) || 1;
                  setSelectedPage((p) => Math.min(total - 1, p + 1));
                }
              }}
            >
              <div
                data-lenis-prevent="true"
                className="relative max-w-4xl w-full max-h-[90vh] liquid-glass-strong glass-spring-in p-4 sm:p-5 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 mb-3 shrink-0">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">{selectedCert.title}</h3>
                    <p className="text-[11px] text-zinc-400 truncate">{selectedCert.issuer} · {selectedCert.date}</p>
                  </div>
                  <button
                    onClick={closeCertModal}
                    className="w-9 h-9 rounded-full stitch-btn-glass flex items-center justify-center text-white cursor-pointer shrink-0"
                    aria-label={t('certificates.close')}
                  >
                    <X className="w-4 h-4" />
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
                        alt={`${selectedCert.title} - ${t('certificates.page')} ${pageIndex + 1}`}
                        className="w-full h-auto max-h-[70vh] object-contain rounded-2xl mx-auto"
                      />

                      {pages.length > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-white/10">
                          <button
                            onClick={() => setSelectedPage((p) => Math.max(0, p - 1))}
                            disabled={pageIndex === 0}
                            className="w-8 h-8 rounded-full stitch-btn-glass disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white cursor-pointer"
                            aria-label={t('certificates.prevPage')}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-mono text-zinc-300">
                            {t('certificates.page')} {pageIndex + 1} / {pages.length}
                          </span>
                          <button
                            onClick={() => setSelectedPage((p) => Math.min(pages.length - 1, p + 1))}
                            disabled={pageIndex === pages.length - 1}
                            className="w-8 h-8 rounded-full stitch-btn-glass disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white cursor-pointer"
                            aria-label={t('certificates.nextPage')}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
