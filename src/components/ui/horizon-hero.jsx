import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu,
  Sparkles,
  Clock
} from "lucide-react";

const HERO_SHOWCASE_PROJECTS = [
  {
    id: "open-plagiarism-checker",
    tag: "NLP · Skripsi S1",
    title: "OpenPlagiarismChecker",
    desc: "Mesin riset pemeriksa dokumen akademik lokal berbasis N-Gram Shingling dan Sentence Transformers.",
    spec: "IndoBERT & N-Gram"
  },
  {
    id: "spam-email-classifier",
    tag: "Machine Learning · Riset",
    title: "Spam-Email Detection System",
    desc: "Evaluasi komparatif Complement Naive Bayes (CNB) vs XGBoost dengan mitigasi Concept Drift.",
    spec: "CNB vs XGBoost"
  },
  {
    id: "laser-pointer-ppt",
    tag: "Computer Vision / IoT",
    title: "laser_pointer_PPT",
    desc: "Pengendali presentasi PowerPoint nirsentuh dari smartphone menggunakan sensor gyroscope dan WebSocket.",
    spec: "Gyroscope & WebSockets"
  },
  {
    id: "fotokita-blur",
    tag: "Edge AI / Vision",
    title: "FotoKitaBlur",
    desc: "Deteksi gestur tangan realtime berbasis browser menggunakan MediaPipe Tasks Vision dan OpenCV.",
    spec: "MediaPipe & OpenCV"
  },
  {
    id: "web-portofolio",
    tag: "Frontend & Systems",
    title: "Web Portofolio & AI Platform",
    desc: "Arsitektur antarmuka web modern Vanilla JS/CSS, observabilitas telemetri, dan integrasi AI.",
    spec: "Vanilla Architecture"
  }
];

const STACK_BADGES = [
  { name: "PyTorch", icon: Hexagon },
  { name: "Transformers", icon: Triangle },
  { name: "MikroTik", icon: Command },
  { name: "OpenCV", icon: Ghost },
  { name: "Supabase", icon: Gem },
  { name: "React 19", icon: Cpu },
  { name: "Sentence-Transformers", icon: Sparkles },
  { name: "Flask & WebSockets", icon: Command }
];

export default function HorizonHero() {
  const containerRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [clockTime, setClockTime] = useState('');

  // Live WIB clock (UTC+7), paused when the tab is hidden
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Bangkok',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now);
      setClockTime(`WIB (UTC+7) · ${timeStr}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    const onVisibility = () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        updateClock();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  // Parallax layer transforms
  const heroTextY = useTransform(smoothProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);
  const horizonScale = useTransform(smoothProgress, [0, 1], [1, 1.25]);
  const horizonY = useTransform(smoothProgress, [0, 1], [0, 40]);
  const showcaseY = useTransform(smoothProgress, [0, 1], [0, -60]);

  // Auto slide interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SHOWCASE_PROJECTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SHOWCASE_PROJECTS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SHOWCASE_PROJECTS.length);
  };

  const activeProject = HERO_SHOWCASE_PROJECTS[currentSlide];

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[105vh] flex flex-col justify-center items-center bg-background dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden font-sans pt-20 pb-24"
    >
      {/* Ambient Deep Space Nebula */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-linear-to-b from-indigo-500/20 via-cyan-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-100 h-75 bg-purple-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-100 h-75 bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Horizon Curved Arc (Liquid Glass Glow Curve) */}
      <motion.div 
        style={{ scale: horizonScale, y: horizonY }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140vw] sm:w-[120vw] lg:w-[100vw] h-80 sm:h-125 pointer-events-none z-0"
      >
        <div 
          className="w-full h-full border-t border-cyan-400/40 bg-linear-to-b from-cyan-500/15 via-indigo-950/20 to-transparent shadow-[0_-20px_80px_rgba(34,211,238,0.25)] relative"
          style={{ borderTopLeftRadius: '100%', borderTopRightRadius: '100%' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-linear-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#fff]" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1/2 h-10 bg-cyan-400/20 blur-xl" />
        </div>
      </motion.div>

      {/* Main Grid Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-10 md:pt-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content */}
          <motion.div 
            style={{ y: heroTextY, opacity: heroOpacity }}
            className="lg:col-span-7 flex flex-col justify-center space-y-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl transition-colors hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  Portofolio Pribadi & Developer Lab
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/5 px-3.5 py-1.5 backdrop-blur-xl">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] sm:text-xs font-mono font-semibold text-cyan-300 tabular-nums">
                  {clockTime}
                </span>
              </div>
            </div>

            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.95]"
            >
              Rafly<br />
              <span className="bg-linear-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
                Firmansyah
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              Mengkombinasikan ketajaman analisis algoritmik dengan arsitektur sistem yang transparan, dapat direproduksi, dan beretika privasi.
            </p>

            {/* Pristine iOS Liquid Glass Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a 
                href="#projects"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-linear-to-b from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 border border-cyan-300/60 text-white font-semibold tracking-wide text-sm shadow-[0_8px_24px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] liquid-press transition-all hover:scale-[1.03] group"
              >
                <span>Jelajahi Karya</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              
              <a 
                href="#lab"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full liquid-glass-inset liquid-glass-pill liquid-press text-slate-200 font-semibold tracking-wide text-sm transition-all hover:scale-[1.03] group"
              >
                <Terminal className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
                <span>Uji Terminal AI Lab</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Dynamic Project Showcase Deck & Carousel */}
          <motion.div 
            style={{ y: showcaseY }}
            className="lg:col-span-5 space-y-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            {/* Dynamic Project Showcase Canvas */}
            <div className="relative overflow-hidden liquid-glass-strong liquid-glass-hover p-6 sm:p-7">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

              {/* Showcase Window Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-emerald-400 tracking-tight truncate max-w-[200px] sm:max-w-[250px]">
                    rafly@node-ubsi-s1: ~/research-deck
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-medium">
                    0{currentSlide + 1} / 0{HERO_SHOWCASE_PROJECTS.length}
                  </span>
                  <div className="flex gap-1">
                    {/* FIX M6: visible pause/play control for the auto-slide
                        (WCAG 2.2.2 — auto-rotating content must be pausable by
                        the user; this is user control, not a reduced-motion kill). */}
                    <button
                      type="button"
                      onClick={() => setIsPaused(prev => !prev)}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        isPaused
                          ? "bg-cyan-500/25 border-cyan-500/40 text-cyan-300"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/40"
                      }`}
                      title={isPaused ? "Lanjutkan putar otomatis" : "Jeda putar otomatis"}
                      aria-label={isPaused ? "Lanjutkan putar otomatis" : "Jeda putar otomatis"}
                      aria-pressed={isPaused}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handlePrev}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer"
                      title="Proyek Sebelumnya"
                      aria-label="Proyek Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer"
                      title="Proyek Berikutnya"
                      aria-label="Proyek Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Animated Card Content */}
              <div className="relative min-h-[170px] flex flex-col justify-between z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide text-cyan-300 bg-cyan-500/10 border border-cyan-500/30">
                        {activeProject.tag}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {activeProject.spec}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight hover:text-cyan-300 transition-colors">
                      <a href="#projects" className="flex items-center gap-2 group">
                        {activeProject.title}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-cyan-400" />
                      </a>
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {activeProject.desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">
                    Live Interactive Gateway
                  </span>
                  <a 
                    href="#projects" 
                    className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    Detail Proyek &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Marquee Tech Brand Pod */}
            <div className="relative overflow-hidden liquid-glass py-4">
              <div className="mb-2.5 px-6 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Core Engineering Stack</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </div>
              
              <div 
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
                }}
              >
                <div className="animate-marquee-left flex gap-8 whitespace-nowrap px-4 py-1">
                  {[...STACK_BADGES, ...STACK_BADGES].map((tech, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 opacity-70 transition-all hover:opacity-100 hover:scale-105 cursor-default"
                    >
                      <tech.icon className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                      <span className="text-xs font-semibold text-zinc-200 tracking-tight">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
