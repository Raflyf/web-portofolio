import React from "react";
import { 
  ArrowRight, 
  Play, 
  Target, 
  Crown, 
  Star,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu
} from "lucide-react";
import { LiquidButton } from "./liquid-glass-button";

const CLIENTS = [
  { name: "Acme Corp", icon: Hexagon },
  { name: "Quantum", icon: Triangle },
  { name: "Command+Z", icon: Command },
  { name: "Phantom", icon: Ghost },
  { name: "Ruby", icon: Gem },
  { name: "Chipset", icon: Cpu },
];

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">{label}</span>
  </div>
);

export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen flex items-center bg-zinc-950 text-white overflow-hidden font-sans">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      <div 
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=3840&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"
        style={{
          maskImage: "linear-gradient(180deg, transparent, black 0%, black 70%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 0%, black 70%, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 md:pt-32 md:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">
            <div className="animate-fade-in delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  Portofolio Pribadi
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                </span>
              </div>
            </div>

            <h1 
              className="animate-fade-in delay-200 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.9]"
              style={{
                maskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)"
              }}
            >
              Rafly<br />
              <span className="bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-transparent">
                Firmansyah
              </span>
            </h1>

            <p className="animate-fade-in delay-300 max-w-xl text-lg text-zinc-400 leading-relaxed">
              Mengeksplorasi kecerdasan buatan, arsitektur web modern, dan infrastruktur cloud. Saya membangun produk digital dengan presisi tinggi dan performa terbaik.
            </p>

            <div className="animate-fade-in delay-400 flex flex-col sm:flex-row gap-4">
              <LiquidButton variant="cool" size="lg">
                Jelajahi Karya
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </LiquidButton>
              
              <LiquidButton variant="ghost" size="lg" className="border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md text-white">
                <Play className="w-4 h-4 fill-current mr-2" />
                Terminal AI
              </LiquidButton>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:mt-12">
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">99.9%</div>
                    <div className="text-sm text-zinc-400">Uptime Sistem</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Efisiensi Model</span>
                    <span className="text-white font-medium">100%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-white to-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="Ai" label="Agentic" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="UI" label="Liquid" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="3D" label="Motion" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    SYSTEM ONLINE
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl shadow-2xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-400">Teknologi yang Digunakan</h3>
              
              <div 
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"
                    >
                      <client.icon className="h-6 w-6 text-white fill-current drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                      <span className="text-lg font-bold text-white tracking-tight drop-shadow-md">
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
