import HeroSection from './components/ui/glassmorphism-trust-hero'
import TerminalAI from './components/terminal/TerminalAI'
import LiquidOTPInput from './components/ui/liquid-otp'

function GlassFilter() {
  return (
    <svg className="hidden absolute w-0 h-0">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground relative selection:bg-white/20">
      <GlassFilter />
      <HeroSection />
      
      {/* Terminal Section */}
      <section className="relative py-24 px-4 sm:px-6 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-black pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              Sistem Terminal AI
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Berinteraksi langsung dengan AI Engine portofolio ini. Tanyakan tentang proyek, sertifikasi, atau diskusi teknis.
            </p>
          </div>
          
          <TerminalAI />

          <div className="max-w-md mx-auto pt-12">
            <LiquidOTPInput />
          </div>
        </div>
      </section>
    </div>
  )
}
