import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';
import { telemetry } from '../lib/telemetry.js';
import V2Navbar from '../v2/components/V2Navbar.jsx';
import HeroScrolly from '../v2/components/HeroScrolly.jsx';
import AboutStory from '../v2/components/AboutStory.jsx';
import ProjectsCurated from '../v2/components/ProjectsCurated.jsx';
import SkillsMatrix from '../v2/components/SkillsMatrix.jsx';
import CertificatesShowcase from '../v2/components/CertificatesShowcase.jsx';
import ExperienceTrack from '../v2/components/ExperienceTrack.jsx';
import InteractiveAILab from '../v2/components/InteractiveAILab.jsx';
import ContactPortal from '../v2/components/ContactPortal.jsx';
import V2Footer from '../v2/components/V2Footer.jsx';

export default function HomeV2() {
  const { t } = useLanguage();

  useEffect(() => {
    // Mandat User: V2 strictly Dark Mode
    document.documentElement.classList.add('dark');
    telemetry.init();
    telemetry.logEvent('page_view', 'v2_landing', 'Kunjungan Halaman Landing V2');
  }, []);

  return (
    <div className="v2-canvas min-h-screen text-slate-100 relative selection:bg-cyan-500/25 selection:text-cyan-200 overflow-x-hidden">
      {/* Floating V2 Navbar */}
      <V2Navbar />

      {/* Main Narrative Scrollytelling Flow */}
      <main className="w-full relative z-10 flex flex-col space-y-16 sm:space-y-24">
        <HeroScrolly />
        <AboutStory />
        <ProjectsCurated />
        <SkillsMatrix />
        <CertificatesShowcase />
        <ExperienceTrack />
        <InteractiveAILab />
        <ContactPortal />
      </main>

      {/* Footer Colophon */}
      <V2Footer />
    </div>
  );
}
