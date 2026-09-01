import React from 'react';
import HeroSection from '../components/ui/glassmorphism-trust-hero';
import TerminalAI from '../components/terminal/TerminalAI';
import LiquidOTPInput from '../components/ui/liquid-otp';
// Import sections that will be created
import AboutSection from '../components/sections/AboutSection';
import SkillsBento from '../components/sections/SkillsBento';
import ProjectsGrid from '../components/sections/ProjectsGrid';
import CertificatesGrid from '../components/sections/CertificatesGrid';
import ExperienceTimeline from '../components/sections/ExperienceTimeline';

export default function Home() {
  return (
    <main className="w-full relative z-10 flex flex-col space-y-24 pb-24 overflow-x-hidden">
      <HeroSection />

      <AboutSection />
      <SkillsBento />
      <ProjectsGrid />
      <CertificatesGrid />
      <ExperienceTimeline />

      <section className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto" id="lab">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">CLI & AI Assistant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Terminal Developer Lab & AI
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Eksplorasi profil, riset AI/ML, dan kompetensi melalui konsol perintah atau tanyakan langsung dengan bahasa alami bebas.
          </p>
        </div>
        
        <TerminalAI />

        <div className="max-w-md mx-auto pt-12">
          <LiquidOTPInput />
        </div>
      </section>
    </main>
  );
}
