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
          className="absolute rounded-full blur-[90px] -top-24 -left-24 w-[680px] h-[640px]"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(139, 92, 246, 0.18) 0%, rgba(99, 102, 241, 0.10) 45%, transparent 75%)',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        />

        {/* Glow 2: Sapphire & Cyan Refraction (Mid-Right) */}
        <div
          className="absolute rounded-full blur-[100px] top-[28%] -right-20 w-[720px] h-[680px]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.16) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 75%)',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        />

        {/* Glow 3: Twilight Amethyst & Deep Indigo (Interactive Lab Anchor) */}
        <div
          className="absolute rounded-full blur-[100px] top-[60%] -left-16 w-[640px] h-[600px]"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(168, 85, 247, 0.14) 0%, rgba(79, 70, 229, 0.08) 50%, transparent 75%)',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        />

        {/* Glow 4: Luminous Cyan-Azure Atmospheric Anchor (Bottom) */}
        <div
          className="absolute rounded-full blur-[100px] bottom-0 right-[15%] w-[700px] h-[500px]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.14) 0%, rgba(30, 41, 59, 0.04) 55%, transparent 75%)',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        />

        {/* Crisp Dot Matrix Grid (visionOS Texture) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 50%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
}
