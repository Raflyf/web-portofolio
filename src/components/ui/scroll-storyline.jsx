import React, { useState, useEffect, useRef, useMemo } from 'react';
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

  const sections = useMemo(() => SECTION_IDS.map(id => ({
    id,
    label: t(`storyline.${id}`)
  })), [t]);

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
      <aside className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-2 pointer-events-auto select-none" aria-label="Navigasi Cerita">
        <div className="flex flex-col items-center gap-2 p-1.5 rounded-full bg-[#080c18]/70 backdrop-blur-xl border border-white/12 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className="stitch-raw-btn group relative flex items-center justify-center p-1 focus:outline-none cursor-pointer"
                aria-label={`${t('storyline.scrollTo')} ${sec.label}`}
              >
                {/* Hover / Active Tooltip with Transient Auto-Hide */}
                <span className={`absolute right-7 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-200 pointer-events-none border ${
                  isActive && showActiveLabel
                    ? 'opacity-100 bg-[#0c1020]/90 text-cyan-300 border-cyan-500/30 backdrop-blur-md translate-x-0 shadow-lg' 
                    : 'opacity-0 group-hover:opacity-100 bg-black/85 text-zinc-300 border-white/10 translate-x-1 group-hover:translate-x-0'
                }`}>
                  {sec.label}
                </span>

                {/* Dot with Spring Motion */}
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-2.5 h-2.5 bg-linear-to-tr from-cyan-400 to-white shadow-[0_0_8px_rgba(34,211,238,0.85)] ring-1.5 ring-cyan-400/50 scale-110'
                      : 'w-1.5 h-1.5 bg-zinc-600 group-hover:bg-zinc-300 group-hover:scale-125'
                  }`}
                />
              </button>
            );
          })}

          {/* Minimalist Live Scrubber Percentage Indicator */}
          <div className="pt-1 mt-0.5 border-t border-white/10 text-[8px] font-mono font-bold text-zinc-400 tracking-tighter" title="Scroll Progress">
            {percent.toString().padStart(2, '0')}%
          </div>
        </div>
      </aside>
    </>
  );
}
