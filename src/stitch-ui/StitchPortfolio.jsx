import React, { useEffect } from 'react';
import './stitch.css';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';
import { telemetry } from '../lib/telemetry.js';
import StitchCausticsBackdrop from './components/StitchCausticsBackdrop.jsx';
import StitchNav from './components/StitchNav.jsx';
import ScrollStoryline from '../components/ui/scroll-storyline.jsx';
import HorizonHero from '../components/ui/horizon-hero.jsx';
import AboutSection from '../components/sections/AboutSection.jsx';
import SkillsBento from '../components/sections/SkillsBento.jsx';
import ProjectsGrid from '../components/sections/ProjectsGrid.jsx';
import CertificatesGrid from '../components/sections/CertificatesGrid.jsx';
import ExperienceTimeline from '../components/sections/ExperienceTimeline.jsx';
import TerminalAI from '../components/terminal/TerminalAI.jsx';
import ContactSection from '../components/sections/ContactSection.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function StitchPortfolio() {
  const { t } = useLanguage();

  useEffect(() => {
    telemetry.init();
    telemetry.logEvent('page_view', 'portfolio_home', 'Membuka Beranda Portofolio Liquid Glass');
    document.title = 'Rafly Firmansyah — AI Engineering & Full-Stack Research Portfolio';
  }, []);

  return (
    <div className="stitch-liquid-theme min-h-screen bg-[#06080d] text-slate-100 selection:bg-cyan-500/20 font-sans relative overflow-x-hidden">
      {/* 1. Liquid Caustics & Organic Mesh Backdrop (Google Stitch) */}
      <StitchCausticsBackdrop />

      {/* 2. Floating Refractive Navigation Pill */}
      <StitchNav />

      {/* 3. Main Authentic Content Sections in Exact Layout & Order */}
      <main className="w-full relative z-10 flex flex-col space-y-24 overflow-x-hidden pt-6">
        {/* Scrollytelling Progress & HUD */}
        <ScrollStoryline />

        {/* Horizon Parallax Hero with Project Showcase Deck */}
        <div id="hero">
          <HorizonHero />
        </div>

        {/* Main Sections with Bidirectional Scroll Reveal */}
        <div className="section-contain"><AboutSection /></div>
        <div className="section-contain"><SkillsBento /></div>
        <div className="section-contain"><ProjectsGrid /></div>
        <div className="section-contain"><CertificatesGrid /></div>
        <div className="section-contain"><ExperienceTimeline /></div>

        {/* Terminal & Interactive AI Lab */}
        <section className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-12 pb-24 section-contain" id="lab">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <div className="inline-flex items-center gap-2 liquid-glass-inset liquid-glass-pill px-3.5 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono">{t('lab.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              {t('lab.title')}
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
              {t('lab.subtitle')}
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
        </section>

        {/* Contact Form & Information */}
        <div className="section-contain"><ContactSection /></div>
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
