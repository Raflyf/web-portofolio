import React, { useState, useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';

const SECTION_IDS = [
  'hero',
  'about',
  'skills',
  'projects',
  'certificates',
  'timeline',
  'lab',
  'contact',
];

export default function ScrollStoryline() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('hero');
  const [percent, setPercent] = useState(0);
  const [showActiveLabel, setShowActiveLabel] = useState(false);
  const prevSectionRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const sections = SECTION_IDS.map(id => ({
    id,
    label: t(`storyline.${id}`)
  }));

  // Auto-hide label seksi: hanya tampil sejenak (1.8s) saat ada perpindahan seksi, lalu otomatis disembunyikan
  useEffect(() => {
    if (prevSectionRef.current !== null && prevSectionRef.current !== activeSection) {
      setShowActiveLabel(true);
      const timer = setTimeout(() => {
        setShowActiveLabel(false);
      }, 1800);
      prevSectionRef.current = activeSection;
      return () => clearTimeout(timer);
    }
    prevSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setPercent(Math.min(100, Math.max(0, Math.round(latest * 100))));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + window.innerHeight / 3;

          for (const section of sections) {
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
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

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

      {/* Floating Scrollytelling Sidebar Navigation */}
      <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-3 pointer-events-auto select-none" aria-label="Navigasi Cerita">
        <div className="flex flex-col items-center gap-3 p-2.5 liquid-glass-inset liquid-glass-pill">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className="group relative flex items-center justify-center p-1.5 focus:outline-none cursor-pointer"
                aria-label={`${t('storyline.scrollTo')} ${sec.label}`}
              >
                {/* Hover / Active Tooltip with Transient Auto-Hide */}
                <span className={`absolute right-8 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-300 pointer-events-none border ${
                  isActive && showActiveLabel
                    ? 'opacity-100 bg-white/10 text-white border-white/20 backdrop-blur-md translate-x-0' 
                    : 'opacity-0 group-hover:opacity-100 bg-black/80 text-zinc-300 border-white/10 translate-x-2 group-hover:translate-x-0'
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
