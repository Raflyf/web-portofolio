import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { telemetry } from '../lib/telemetry';
import HorizonHero from '../components/ui/horizon-hero';
import ScrollStoryline from '../components/ui/scroll-storyline';
import TerminalAI from '../components/terminal/TerminalAI';
import AboutSection from '../components/sections/AboutSection';
import SkillsBento from '../components/sections/SkillsBento';
import ProjectsGrid from '../components/sections/ProjectsGrid';
import CertificatesGrid from '../components/sections/CertificatesGrid';
import ExperienceTimeline from '../components/sections/ExperienceTimeline';
import ContactSection from '../components/sections/ContactSection';
import Footer from '../components/layout/Footer';

export default function Home() {
  const { scrollYProgress } = useScroll();

  // Scroll-craft Ambient Ground Color & Parallax Shifter
  const ambientY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0.15, 0.25, 0.2, 0.25, 0.15]);

  useEffect(() => {
    telemetry.init();
  }, []);

  return (
    <>
      <main className="w-full relative z-10 flex flex-col space-y-24 overflow-x-hidden">
        {/* Scroll-craft Kinetic Ambient Ground Atmosphere */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          <motion.div 
            style={{ y: ambientY, opacity: glowOpacity }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[90vw] max-w-7xl h-150 bg-linear-to-b from-cyan-500/10 via-indigo-600/5 to-emerald-500/10 blur-[140px] rounded-full"
          />
        </div>

        {/* Scrollytelling Progress & HUD */}
        <ScrollStoryline />

        {/* Horizon Parallax Hero */}
        <div id="hero">
          <HorizonHero />
        </div>

        {/* Main Sections with Bidirectional Scroll Reveal */}
        <AboutSection />
        <SkillsBento />
        <ProjectsGrid />
        <CertificatesGrid />
        <ExperienceTimeline />

        {/* Terminal & Interactive AI Lab */}
        <section className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-12 pb-24" id="lab">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <div className="inline-flex items-center gap-2 liquid-glass-inset liquid-glass-pill px-3.5 py-1.5">
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
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7 }}
          >
            <TerminalAI />
          </motion.div>
        </section>

        {/* Contact Form & Information */}
        <ContactSection />
      </main>

      {/* Footer rapat ke bawah, tidak menggantung */}
      <Footer />
    </>
  );
}
