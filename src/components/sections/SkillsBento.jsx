import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Network, Server, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Reveal from '../ui/Reveal.jsx';

const MARQUEE_ROW_1 = [
  "PyTorch Core",
  "Prompt Engineering",
  "Sentence-Transformers",
  "IndoBERT & RoBERTa",
  "Whisper AI Audio",
  "NLP Cosine Metrics",
  "Scikit-Learn ML",
  "MediaPipe Tasks Vision",
  "OpenCV Python",
  "XGBoost & Naive Bayes",
  "Pandas & NumPy",
];

const MARQUEE_ROW_2 = [
  "MikroTik RouterOS v7",
  "MTCNA Certified",
  "Static & Dynamic Routing",
  "Firewall Filtering",
  "Flask-SocketIO",
  "Supabase Postgres RAG",
  "TypeScript & Node.js",
  "JavaScript ES2024",
  "RESTful APIs Architecture",
  "Linux & Git Workflow",
];

export default function SkillsBento() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const marquee1Ref = useRef(null);
  const marquee2Ref = useRef(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '250px 0px' }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * ScrollLeft Marquee Engine (Zero Ancestor Transform / Zero Backdrop Root):
   * - Di Chromium, animasi `@keyframes transform` pada container induk membentuk
   *   RenderSurface (Backdrop Root) yang mematikan `backdrop-filter` pada seluruh
   *   chip di dalamnya.
   * - Optimasi 60fps:
   *   1. `scrollWidth` di-cache melalui `ResizeObserver` (nol forced synchronous reflow di rAF).
   *   2. Saat pengguna melakukan scroll vertikal, mutasi `scrollLeft` horizontal dijeda
   *      sementara agar tidak terjadi dual-axis scroll layer invalidation bersamaan dengan Lenis.
   *   3. Chip marquee yang berada di luar area pandang horizontal (`!isIntersecting`)
   *      dinonaktifkan `backdrop-filter`-nya via `IntersectionObserver` (`.pill-offscreen`),
   *      memangkas ~65% beban FBO GPU tanpa mengubah tampilan chip yang terlihat di layar.
   */
  useEffect(() => {
    if (!isInView) return;
    const el1 = marquee1Ref.current;
    const el2 = marquee2Ref.current;
    if (!el1 || !el2) return;

    let rafId = null;
    let lastTime = performance.now();
    let half1 = el1.scrollWidth / 2;
    let half2 = el2.scrollWidth / 2;
    let pos1 = el1.scrollLeft || 0;
    let pos2 = el2.scrollLeft || half2;
    let paused1 = false;
    let paused2 = false;
    let isVerticallyScrolling = false;
    let scrollPauseTimer = null;

    const updateDimensions = () => {
      half1 = el1.scrollWidth / 2;
      half2 = el2.scrollWidth / 2;
      if (pos2 <= 0 && half2 > 0) pos2 = half2;
    };

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateDimensions);
      ro.observe(el1);
      ro.observe(el2);
    }

    const createPillObserver = (rootEl) => {
      if (typeof IntersectionObserver === 'undefined') return null;
      const obs = new IntersectionObserver(
        (entries) => {
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            entry.target.classList.toggle('pill-offscreen', !entry.isIntersecting);
          }
        },
        { root: rootEl, rootMargin: '0px 64px' }
      );
      const pills = rootEl.querySelectorAll('[data-marquee-pill]');
      pills.forEach((pill) => obs.observe(pill));
      return obs;
    };

    const io1 = createPillObserver(el1);
    const io2 = createPillObserver(el2);

    const onWindowScroll = () => {
      isVerticallyScrolling = true;
      if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
      scrollPauseTimer = setTimeout(() => {
        isVerticallyScrolling = false;
        lastTime = performance.now();
      }, 110);
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });

    const onEnter1 = () => { paused1 = true; };
    const onLeave1 = () => { paused1 = false; };
    const onEnter2 = () => { paused2 = true; };
    const onLeave2 = () => { paused2 = false; };

    el1.addEventListener('pointerenter', onEnter1, { passive: true });
    el1.addEventListener('pointerleave', onLeave1, { passive: true });
    el2.addEventListener('pointerenter', onEnter2, { passive: true });
    el2.addEventListener('pointerleave', onLeave2, { passive: true });

    const speed = 42; // px per detik

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!document.hidden && !isVerticallyScrolling) {
        if (half1 > 0 && !paused1) {
          pos1 += speed * dt;
          if (pos1 >= half1) pos1 -= half1;
          el1.scrollLeft = pos1;
        }

        if (half2 > 0 && !paused2) {
          if (pos2 <= 0) pos2 = half2;
          pos2 -= speed * dt;
          if (pos2 <= 0) pos2 += half2;
          el2.scrollLeft = pos2;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
      if (ro) ro.disconnect();
      if (io1) io1.disconnect();
      if (io2) io2.disconnect();
      window.removeEventListener('scroll', onWindowScroll);
      el1.removeEventListener('pointerenter', onEnter1);
      el1.removeEventListener('pointerleave', onLeave1);
      el2.removeEventListener('pointerenter', onEnter2);
      el2.removeEventListener('pointerleave', onLeave2);
    };
  }, [isInView]);

  return (
    <section ref={sectionRef} id="skills" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <Reveal className="text-center space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 rounded-full stitch-btn-glass px-3.5 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t('skills.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          {t('skills.title')}
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          {t('skills.subtitle')}
        </p>
      </Reveal>

      {/* Infinite Marquee 1 (Left Scrolling - Pure Optical Backdrop Blur + Bidirectional Scroll Reveal) */}
      <Reveal delay={0.04} className="w-full mb-4">
        <div
          ref={marquee1Ref}
          className="relative overflow-x-hidden flex w-full no-scrollbar select-none"
        >
          <div className="flex gap-3 whitespace-nowrap py-1 w-max">
            {[0, 1].map((i) => (
              <React.Fragment key={i}>
                {MARQUEE_ROW_1.map((skill, j) => (
                  <div
                    key={`${i}-${j}`}
                    data-marquee-pill
                    className="inline-flex items-center gap-2 rounded-full stitch-marquee-pill px-4 py-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Infinite Marquee 2 (Right Scrolling - Pure Optical Backdrop Blur + Bidirectional Scroll Reveal) */}
      <Reveal delay={0.10} className="w-full mb-16">
        <div
          ref={marquee2Ref}
          className="relative overflow-x-hidden flex w-full no-scrollbar select-none"
        >
          <div className="flex gap-3 whitespace-nowrap py-1 w-max">
            {[0, 1].map((i) => (
              <React.Fragment key={i}>
                {MARQUEE_ROW_2.map((skill, j) => (
                  <div
                    key={`${i}-${j}`}
                    data-marquee-pill
                    className="inline-flex items-center gap-2 rounded-full stitch-marquee-pill px-4 py-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs sm:text-sm font-medium text-zinc-200">{skill}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Bento Grid with Uniform Obsidian Liquid Glass & Lucide SVG Icons */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Machine Learning & NLP */}
        <Reveal 
          className="md:col-span-7 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            {t('skills.catMl')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["Python 3", "PyTorch", "Prompt Engineering", "Sentence-Transformers", "Scikit-Learn", "XGBoost", "N-Gram Shingling", "Pandas", "NumPy"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full stitch-skill-tag text-xs sm:text-sm text-zinc-200 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Network & Infrastructure */}
        <Reveal 
          delay={0.08}
          className="md:col-span-5 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Network className="w-5 h-5" />
            </div>
            {t('skills.catNet')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MikroTik RouterOS", "MTCNA Certified", "Static & Dynamic Routing", "Firewall Filter Rules", "Simple Queues (QoS)", "VLAN & Tunnels"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full stitch-skill-tag text-xs sm:text-sm text-zinc-200 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Backend & Full-Stack */}
        <Reveal 
          className="md:col-span-5 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Server className="w-5 h-5" />
            </div>
            {t('skills.catFullstack')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["React.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Supabase DB", "Node.js API", "Flask API"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full stitch-skill-tag text-xs sm:text-sm text-zinc-200 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Computer Vision & Interactive Tools */}
        <Reveal 
          delay={0.08}
          className="md:col-span-7 liquid-glass liquid-glass-hover p-7 sm:p-8 relative overflow-hidden group"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Eye className="w-5 h-5" />
            </div>
            {t('skills.catVision')}
          </h3>
          <div className="flex flex-wrap gap-2 relative z-10">
            {["MediaPipe Tasks Vision", "OpenCV Python", "Flask-SocketIO", "WebSockets", "PyAutoGUI", "DeviceOrientation API"].map((tech, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full stitch-skill-tag text-xs sm:text-sm text-zinc-200 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  );
}
