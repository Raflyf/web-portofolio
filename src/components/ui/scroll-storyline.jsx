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
    let lastPercent = -1;
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const p = Math.min(100, Math.max(0, Math.round(latest * 100)));
      if (p !== lastPercent) {
        lastPercent = p;
        setPercent(p);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Synchronize active section via zero-reflow IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(prev => (prev !== entry.target.id ? entry.target.id : prev));
          }
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0.1
      }
    );

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Top of page boundary check (zero layout queries)
  useEffect(() => {
    const handleTopScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection(prev => (prev !== 'hero' ? 'hero' : prev));
      }
    };
    window.addEventListener('scroll', handleTopScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleTopScroll);
  }, []);

  const scrollTo = (e, id) => {
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { duration: 1.2, offset: -70 });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
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
                onClick={(e) => scrollTo(e, sec.id)}
                className="stitch-raw-btn group relative flex items-center justify-center p-1 rounded-full focus:outline-none focus-visible:ring-1.5 focus-visible:ring-cyan-400/80 cursor-pointer"
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
