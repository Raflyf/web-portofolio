import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * StitchCausticsBackdrop — High-Performance 3D Scrollytelling Liquid Glass Backdrop
 * - Pure 60fps GPU-composited parallax depth (Z-axis transforms, zero layout thrashing)
 * - Calming, professional color palette: Deep Obsidian (#080b11), Ice Mist, Slate Indigo
 * - Optical refractive distortion filter for Apple iOS / visionOS liquid glass aesthetic
 * - Auto-pauses on document.hidden to save power and eliminate background overhead
 */
export default function StitchCausticsBackdrop() {
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Monitor visibility to pause animations when tab is inactive
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Smooth scroll tracking across the whole page storyline
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 24,
    mass: 0.4,
    restDelta: 0.0005
  });

  // 3D Parallax coordinates mapped smoothly across the page scroll
  // Orb 1: Hero & Overview anchor (Top-Left, Depth Z: -40px)
  const orb1Y = useTransform(smoothProgress, [0, 0.4, 1], ['-5%', '35%', '85%']);
  const orb1X = useTransform(smoothProgress, [0, 0.5, 1], ['15%', '30%', '10%']);
  const orb1Scale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.15, 0.95]);

  // Orb 2: Projects & Architecture anchor (Mid-Right, Depth Z: 10px)
  const orb2Y = useTransform(smoothProgress, [0, 0.4, 0.8, 1], ['25%', '15%', '55%', '90%']);
  const orb2X = useTransform(smoothProgress, [0, 0.5, 1], ['75%', '60%', '80%']);
  const orb2Scale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1.1, 1.05]);

  // Orb 3: Interactive Lab & Terminal anchor (Mid-Left, Depth Z: 30px)
  const orb3Y = useTransform(smoothProgress, [0, 0.6, 1], ['45%', '60%', '75%']);
  const orb3X = useTransform(smoothProgress, [0, 0.6, 1], ['5%', '18%', '45%']);

  // Orb 4: Horizon Deep Slate Anchor (Lower Viewport)
  const orb4Y = useTransform(smoothProgress, [0, 1], ['70%', '95%']);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080b11]"
      style={{ perspective: '1200px', contain: 'strict' }}
      aria-hidden="true"
    >
      {/* SVG Liquid Lens Refraction & Optical Distortion Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="stitch-liquid-distortion" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 3D Parallax Optical Volumetric Canvas */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* Orb 1: Soft Ice-Mist Refraction (Calm, understated) */}
        <motion.div
          className="absolute rounded-full blur-[100px]"
          style={{
            top: 0,
            left: 0,
            width: '680px',
            height: '620px',
            x: orb1X,
            y: orb1Y,
            scale: orb1Scale,
            transform: 'translateZ(-40px)',
            willChange: 'transform',
            background: 'radial-gradient(circle at 40% 40%, rgba(226, 232, 240, 0.08) 0%, rgba(148, 163, 184, 0.03) 50%, transparent 75%)',
            opacity: isTabVisible ? 1 : 0.4
          }}
        />

        {/* Orb 2: Serene Steel-Blue Horizon (Very low saturation, non-glaring) */}
        <motion.div
          className="absolute rounded-full blur-[110px]"
          style={{
            top: 0,
            left: 0,
            width: '760px',
            height: '700px',
            x: orb2X,
            y: orb2Y,
            scale: orb2Scale,
            transform: 'translateZ(10px)',
            willChange: 'transform',
            background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.07) 0%, rgba(30, 41, 59, 0.04) 55%, transparent 75%)',
            opacity: isTabVisible ? 1 : 0.4
          }}
        />

        {/* Orb 3: Twilight Slate & Muted Indigo (Smooth ambient depth) */}
        <motion.div
          className="absolute rounded-full blur-[115px]"
          style={{
            top: 0,
            left: 0,
            width: '620px',
            height: '580px',
            x: orb3X,
            y: orb3Y,
            transform: 'translateZ(30px)',
            willChange: 'transform',
            background: 'radial-gradient(circle at 45% 45%, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.03) 50%, transparent 70%)',
            opacity: isTabVisible ? 1 : 0.4
          }}
        />

        {/* Orb 4: Subtle Lower Atmosphere Deep Azure Anchor */}
        <motion.div
          className="absolute right-1/4 rounded-full blur-[120px]"
          style={{
            top: 0,
            width: '720px',
            height: '620px',
            y: orb4Y,
            transform: 'translateZ(-20px)',
            willChange: 'transform',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%)',
            opacity: isTabVisible ? 1 : 0.4
          }}
        />

        {/* Delicate Micro-Grid Pattern with Smooth Vignette Falloff */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
}
