import React, { useState } from 'react';
import { CERTIFICATES_DATA } from '../../data';
import { FileText, ExternalLink, Award } from 'lucide-react';
import { LiquidButton } from '../ui/liquid-glass-button';

export default function CertificatesGrid() {
  const [filter, setFilter] = useState('all');

  const filteredCertificates = CERTIFICATES_DATA.filter(cert => 
    filter === 'all' ? true : cert.category === filter
  );

  return (
    <section id="certificates" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Validasi Kredensial</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Sertifikasi Resmi & Penghargaan
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Lisensi profesional dan transkrip akademik yang divalidasi oleh lembaga tersertifikasi (BNSP, MikroTik, Cisco, dll).
        </p>
      </div>

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
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border ${
              filter === tab.id 
                ? 'bg-white/10 border-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map(cert => (
          <div key={cert.id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all shadow-xl group flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {/* Certificate Image Frame */}
            <div className="h-48 w-full relative overflow-hidden bg-black/40 border-b border-white/5">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-white/5 z-0">
                <Award className="w-12 h-12 opacity-50" />
              </div>
              {/* Fallback pattern logic: In real app, we use absolute paths from public */}
              <img 
                src={`/${cert.imageUrl}`} 
                alt={cert.title}
                className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {/* Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              
              <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                {cert.badge && (
                  <span className="px-2 py-1 text-[10px] font-semibold tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded backdrop-blur-md uppercase">
                    {cert.badge}
                  </span>
                )}
                <span className="px-2 py-1 text-[10px] font-medium tracking-wider text-zinc-300 bg-black/60 border border-white/10 rounded backdrop-blur-md uppercase">
                  {cert.date}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 relative z-20">
              <h3 className="text-lg font-bold text-white mb-1 tracking-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
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
          </div>
        ))}
      </div>
    </section>
  );
}
