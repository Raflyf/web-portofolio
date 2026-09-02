import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const SECTIONS = [
  { id: 'hero', label: 'Overview' },
  { id: 'about', label: 'Profil' },
  { id: 'skills', label: 'Keahlian' },
  { id: 'projects', label: 'Karya' },
  { id: 'certificates', label: 'Sertifikat' },
  { id: 'timeline', label: 'Riwayat' },
  { id: 'lab', label: 'AI Lab' },
  { id: 'contact', label: 'Kontak' },
];

export default function ScrollStoryline() {
  const [activeSection, setActiveSection] = useState('hero');
  const [percent, setPercent] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setPercent(Math.min(100, Math.max(0, Math.round(latest * 100))));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { duration: 1.2, offset: -30 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Top Global Scroll Progress Bar with Dynamic Glow */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-linear-to-r from-cyan-400 via-indigo-500 to-emerald-400 z-50 origin-left shadow-[0_0_12px_rgba(34,211,238,0.8)] pointer-events-none"
        style={{ scaleX: scaleY }}
      />

      {/* Floating Scrollytelling Sidebar Navigation */}
      <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-3 pointer-events-auto select-none" aria-label="Navigasi Cerita">
        <div className="flex flex-col items-center gap-3 p-2.5 liquid-glass-inset liquid-glass-pill">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className="group relative flex items-center justify-center p-1.5 focus:outline-none cursor-pointer"
                aria-label={`Scroll ke bagian ${sec.label}`}
              >
                {/* Hover / Active Tooltip */}
                <span className={`absolute right-8 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-200 pointer-events-none border ${
                  isActive 
                    ? 'opacity-100 bg-white/10 text-white border-white/20 backdrop-blur-md translate-x-0' 
                    : 'opacity-0 group-hover:opacity-100 bg-black/80 text-zinc-400 border-white/10 translate-x-2'
                }`}>
                  {sec.label}
                </span>

                {/* Dot with Spring Motion */}
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-3 h-3 bg-linear-to-tr from-cyan-400 to-white shadow-[0_0_10px_rgba(34,211,238,1)] ring-2 ring-cyan-400/40 scale-110'
                      : 'w-2.5 h-2.5 bg-zinc-600 group-hover:bg-zinc-400 group-hover:scale-110'
                  }`}
                />
              </button>
            );
          })}

          {/* Minimalist Live Scrubber Percentage Indicator */}
          <div className="pt-1.5 mt-1 border-t border-white/10 text-[9px] font-mono font-bold text-zinc-500 tracking-tighter" title="Scroll Progress">
            {percent.toString().padStart(2, '0')}%
          </div>
        </div>
      </aside>
    </>
  );
}
