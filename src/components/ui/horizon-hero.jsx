import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  ArrowRight, 
  Play, 
  Target, 
  Star,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu,
  Sparkles
} from "lucide-react";
import { LiquidButton } from "./liquid-glass-button";

const CLIENTS = [
  { name: "PyTorch", icon: Hexagon },
  { name: "Transformers", icon: Triangle },
  { name: "MikroTik", icon: Command },
  { name: "OpenCV", icon: Ghost },
  { name: "Supabase", icon: Gem },
  { name: "React 19", icon: Cpu },
];

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">{label}</span>
  </div>
);

export default function HorizonHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  // Parallax layer transforms
  const heroTextY = useTransform(smoothProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);
  const horizonScale = useTransform(smoothProgress, [0, 1], [1, 1.25]);
  const horizonY = useTransform(smoothProgress, [0, 1], [0, 50]);
  const cardsY = useTransform(smoothProgress, [0, 1], [0, -80]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[110vh] flex flex-col justify-center items-center bg-zinc-950 text-white overflow-hidden font-sans pt-16 pb-24"
    >
      {/* Ambient Deep Space Nebula */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/20 via-cyan-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Horizon Curved Arc (21st.dev Horizon Curve Inspiration) */}
      <motion.div 
        style={{ scale: horizonScale, y: horizonY }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140vw] sm:w-[120vw] lg:w-[100vw] h-[320px] sm:h-[400px] pointer-events-none z-0 overflow-hidden"
      >
        <div className="w-full h-full rounded-[100%] border-t border-cyan-400/40 bg-gradient-to-b from-cyan-500/15 via-indigo-950/40 to-transparent shadow-[0_-20px_80px_rgba(34,211,238,0.25)] relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#fff]" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1/2 h-[40px] bg-cyan-400/20 blur-xl" />
        </div>
      </motion.div>

      {/* Main Grid Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-12 md:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content */}
          <motion.div 
            style={{ y: heroTextY, opacity: heroOpacity }}
            className="lg:col-span-7 flex flex-col justify-center space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  Portofolio Pribadi & Developer Lab
                  <Star className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                </span>
              </div>
            </div>

            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.9]"
            >
              Rafly<br />
              <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
                Firmansyah
              </span>
            </h1>

            <p className="max-w-xl text-lg text-zinc-400 leading-relaxed font-normal">
              Mengeksplorasi kecerdasan buatan, arsitektur web modern, dan infrastruktur cloud. Saya membangun produk digital dengan presisi tinggi, etika privasi, dan performa terbaik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="#projects">
                <LiquidButton variant="cool" size="lg" className="w-full sm:w-auto">
                  Jelajahi Karya
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </LiquidButton>
              </a>
              
              <a href="#lab">
                <LiquidButton variant="ghost" size="lg" className="w-full sm:w-auto border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md text-white">
                  <Play className="w-4 h-4 fill-current mr-2 text-cyan-400" />
                  Terminal AI
                </LiquidButton>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Floating System & Metrics Pods */}
          <motion.div 
            style={{ y: cardsY }}
            className="lg:col-span-5 space-y-6"
          >
            {/* System Status Pod */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:border-white/20">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <Target className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                      99.9%
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-sm text-zinc-400">Uptime Sistem & Komputasi</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Efisiensi Pipeline Model</span>
                    <span className="text-white font-medium">100%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-white shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="AI" label="Agentic" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="UI" label="Liquid Glass" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="3D" label="Parallax" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    SYSTEM ONLINE & AGENT READY
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee Tech Brand Pod */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 py-6 backdrop-blur-2xl shadow-xl">
              <h3 className="mb-4 px-8 text-xs font-semibold uppercase tracking-wider text-zinc-400">Core Engineering Stack</h3>
              
              <div 
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
                }}
              >
                <div className="animate-marquee flex gap-10 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 opacity-60 transition-all hover:opacity-100 hover:scale-105 cursor-default"
                    >
                      <client.icon className="h-5 w-5 text-cyan-400 fill-current drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                      <span className="text-base font-semibold text-white tracking-tight">
                        {client.name}
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
