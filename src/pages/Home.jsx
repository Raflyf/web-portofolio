import React from 'react';
import { motion } from 'framer-motion';
import HorizonHero from '../components/ui/horizon-hero';
import ScrollStoryline from '../components/ui/scroll-storyline';
import AboutSection from '../components/sections/AboutSection';
import SkillsBento from '../components/sections/SkillsBento';
import ProjectsGrid from '../components/sections/ProjectsGrid';
import CertificatesGrid from '../components/sections/CertificatesGrid';
import ExperienceTimeline from '../components/sections/ExperienceTimeline';
import ContactSection from '../components/sections/ContactSection';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <>
      <main className="w-full relative z-10 flex flex-col space-y-24 overflow-x-hidden">
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


        {/* Contact Form & Information */}
        <ContactSection />
      </main>

      {/* Footer rapat ke bawah, tidak menggantung */}
      <Footer />
    </>
  );
}
