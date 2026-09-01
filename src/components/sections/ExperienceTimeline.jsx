import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { TIMELINE_DATA } from '../../data';
import { Briefcase, GraduationCap } from 'lucide-react';

export default function ExperienceTimeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section id="timeline" ref={containerRef} className="relative px-4 sm:px-6 w-full max-w-4xl mx-auto pt-24 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Rekam Jejak</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          Pengalaman Akademik & Profesional
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          Perjalanan pengembangan karir, mulai dari edukasi formal, sertifikasi intensif, hingga simulasi kerja praktikal.
        </p>
      </motion.div>

      <div className="relative pl-8 sm:pl-0">
        {/* Base Timeline Line (Gray) */}
        <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-[2px] bg-white/10 transform sm:-translate-x-1/2" />

        {/* Scroll-Driven Light Beam Line */}
        <motion.div 
          style={{ scaleY }}
          className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 via-indigo-500 to-emerald-400 origin-top transform sm:-translate-x-1/2 shadow-[0_0_12px_rgba(34,211,238,0.8)] z-0"
        />

        <div className="space-y-12">
          {TIMELINE_DATA.map((item, index) => {
            const isLeft = index % 2 === 0;
            const isEducation = item.type === 'education';

            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center ${isLeft ? 'sm:justify-start' : 'sm:justify-end'} group`}
              >
                
                {/* Timeline Dot */}
                <div className="absolute left-0 sm:left-1/2 w-8 h-8 rounded-full border border-white/20 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center transform -translate-x-1/2 sm:-translate-x-1/2 z-10 shadow-[0_0_15px_rgba(0,0,0,0.8)] group-hover:scale-125 transition-all duration-300">
                  <div className={`w-3 h-3 rounded-full ${isEducation ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,1)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]'}`} />
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-[45%] pl-8 sm:pl-0 ${isLeft ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:text-left'}`}>
                  <motion.div 
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-7 backdrop-blur-2xl shadow-xl hover:border-cyan-500/30 transition-all relative overflow-hidden text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full uppercase">
                        {item.date}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
                      {isEducation ? <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" /> : <Briefcase className="w-5 h-5 text-cyan-400 shrink-0" />}
                      <span>{item.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-cyan-400/90 mb-3">{item.subtitle}</p>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
