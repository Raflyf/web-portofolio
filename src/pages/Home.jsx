import React from 'react';
import { motion } from 'framer-motion';
import HorizonHero from '../components/ui/horizon-hero';
import ScrollStoryline from '../components/ui/scroll-storyline';
import TerminalAI from '../components/terminal/TerminalAI';
import LiquidOTPInput from '../components/ui/liquid-otp';
import AboutSection from '../components/sections/AboutSection';
import SkillsBento from '../components/sections/SkillsBento';
import ProjectsGrid from '../components/sections/ProjectsGrid';
import CertificatesGrid from '../components/sections/CertificatesGrid';
import ExperienceTimeline from '../components/sections/ExperienceTimeline';

export default function Home() {
  return (
    <main className="w-full relative z-10 flex flex-col space-y-24 pb-24 overflow-x-hidden">
      {/* Scrollytelling Progress & HUD */}
      <ScrollStoryline />

      {/* Horizon Parallax Hero */}
      <div id="hero">
        <HorizonHero />
      </div>

      {/* Main Sections */}
      <AboutSection />
      <SkillsBento />
      <ProjectsGrid />
      <CertificatesGrid />
      <ExperienceTimeline />

      {/* Terminal & Interactive AI Lab */}
      <section className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-12" id="lab">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">CLI & AI Assistant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            Terminal Developer Lab & AI
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
            Eksplorasi profil, riset AI/ML, dan kompetensi melalui konsol perintah atau tanyakan langsung dengan bahasa alami bebas.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7 }}
        >
          <TerminalAI />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md mx-auto pt-16"
        >
          <LiquidOTPInput />
        </motion.div>
      </section>
    </main>
  );
}
