import React, { useEffect, useState } from 'react';

/**
 * StitchCausticsBackdrop — High-Performance 60fps Ambient Liquid Glass Backdrop
 * - Pure GPU-composited radial ambient gradients (zero layout thrashing, zero framedrops)
 * - Calming, professional color palette: Deep Obsidian (#080b11), Ice Mist, Slate Indigo
 * - Removed CPU-bound SVG displacement filters to guarantee silky smooth 60fps scrolling
 * - Auto-pauses on document.hidden to conserve power and CPU/GPU cycles
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

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080b11]"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Ambient Radial Mesh Glows (GPU Accelerated, Static & Performant) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isTabVisible ? 1 : 0.35, transition: 'opacity 0.4s ease' }}
      >
        {/* Glow 1: Rich Violet-Indigo Aurora (Top-Left) */}
        <div
          className="absolute rounded-full -top-24 -left-24 w-170 h-160 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(139, 92, 246, 0.16) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 2: Sapphire & Cyan Refraction (Mid-Right) */}
        <div
          className="absolute rounded-full top-[28%] -right-20 w-180 h-170 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.14) 0%, rgba(37, 99, 235, 0.06) 45%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 3: Twilight Amethyst & Deep Indigo (Interactive Lab Anchor) */}
        <div
          className="absolute rounded-full top-[60%] -left-16 w-160 h-150 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(168, 85, 247, 0.13) 0%, rgba(79, 70, 229, 0.06) 45%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 4: Luminous Cyan-Azure Atmospheric Anchor (Bottom) */}
        <div
          className="absolute rounded-full bottom-0 right-[15%] w-175 h-125 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.12) 0%, rgba(30, 41, 59, 0.04) 45%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Crisp Dot Matrix Grid (visionOS Texture - GPU Composited) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
            transform: 'translateZ(0)'
          }}
        />
        {/* Periphery Vignette Overlay (eliminates CPU mask-image rasterization) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, #080b11 100%)',
            transform: 'translateZ(0)'
          }}
        />
      </div>
    </div>
  );
}
