import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getCertificatesData } from '../../data.js';
import { Award, FileText, CheckCircle2, ExternalLink, X } from 'lucide-react';
import { telemetry } from '../../lib/telemetry';

export default function StitchCredentials() {
  const { language } = useLanguage();
  const certs = getCertificatesData(language);
  const [activePdfModal, setActivePdfModal] = useState(null);

  const openPdf = (cert) => {
    telemetry.logEvent('cert_view', `stitch_cert_${cert.id}`, `Buka Sertifikat: ${cert.title}`);
    setActivePdfModal(cert);
  };

  return (
    <section className="flex flex-col gap-8" id="credentials">
      {/* Section Header */}
      <div className="flex flex-col gap-1 border-b border-white/[0.1] pb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-medium">
          {language === 'id' ? 'Kualifikasi Terverifikasi' : 'Verified Qualifications'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          {language === 'id' ? 'Sertifikasi Resmi & Riset Ilmiah' : 'Academic Research & Certifications'}
        </h2>
      </div>

      {/* Grid of Verified Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {certs.slice(0, 6).map((cert) => (
          <div 
            key={cert.id}
            className="rounded-xl stitch-glass stitch-glass-hover p-6 flex flex-col justify-between gap-6 cursor-pointer group"
            onClick={() => openPdf(cert)}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  {cert.issuer}
                </span>
                <CheckCircle2 className="w-4 h-4 text-cyan-300" />
              </div>

              <h3 className="text-base font-semibold text-white group-hover:text-cyan-200 transition-colors">
                {cert.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {cert.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/[0.08]">
              <span className="truncate max-w-[140px]">
                {cert.credentialId ? `ID: ${cert.credentialId}` : (cert.date || 'Verified')}
              </span>
              <span className="text-cyan-300 font-medium flex items-center gap-1 group-hover:underline">
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Buka Dokumen' : 'View PDF'}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal PDF Viewer */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-2xl stitch-glass border border-white/20 flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-white/[0.06] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Award className="w-4 h-4 text-cyan-300" />
                <span className="truncate max-w-md sm:max-w-xl">{activePdfModal.title}</span>
              </div>
              <button
                onClick={() => setActivePdfModal(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-black/50 p-2 overflow-hidden">
              <iframe
                src={`/${activePdfModal.pdfUrl}`}
                title={activePdfModal.title}
                className="w-full h-full rounded-lg border border-white/10"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
