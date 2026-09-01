import React from 'react';
import { TIMELINE_DATA } from '../../data';
import { Briefcase, GraduationCap } from 'lucide-react';

export default function ExperienceTimeline() {
  return (
    <section id="experience" className="relative px-4 sm:px-6 w-full max-w-4xl mx-auto pt-24 pb-24">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Rekam Jejak</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Pengalaman Akademik & Profesional
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Perjalanan pengembangan karir, mulai dari edukasi formal, sertifikasi intensif, hingga simulasi kerja praktikal.
        </p>
      </div>

      <div className="relative pl-8 sm:pl-0">
        {/* Glow Line (Central on Desktop, Left on Mobile) */}
        <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-white/10 transform sm:-translate-x-1/2">
          <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-b from-emerald-500/0 via-emerald-500/50 to-indigo-500/0 opacity-50 blur-sm" />
        </div>

        <div className="space-y-12">
          {TIMELINE_DATA.map((item, index) => {
            const isLeft = index % 2 === 0;
            const isEducation = item.type === 'education';

            return (
              <div key={index} className={`relative flex flex-col sm:flex-row items-start sm:items-center ${isLeft ? 'sm:justify-start' : 'sm:justify-end'} group`}>
                
                {/* Timeline Dot */}
                <div className="absolute left-0 sm:left-1/2 w-8 h-8 rounded-full border border-white/20 bg-black/80 backdrop-blur-xl flex items-center justify-center transform -translate-x-1/2 sm:-translate-x-1/2 z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
                  <div className={`w-3 h-3 rounded-full ${isEducation ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'}`} />
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-[45%] pl-8 sm:pl-0 ${isLeft ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:text-left'}`}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl hover:bg-white/10 transition-colors relative overflow-hidden text-left">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-300 bg-white/10 border border-white/10 rounded uppercase">
                        {item.date}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      {isEducation ? <GraduationCap className="w-5 h-5 text-indigo-400" /> : <Briefcase className="w-5 h-5 text-emerald-400" />}
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-zinc-300 mb-4">{item.subtitle}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
