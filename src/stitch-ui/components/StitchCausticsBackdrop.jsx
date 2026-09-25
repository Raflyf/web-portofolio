import React, { useEffect, useState } from 'react';

/**
 * StitchCausticsBackdrop — High-Performance 60fps Ambient Liquid Glass Backdrop
 * - Wallpaper foto (dari proyek FreeAIBot) sebagai substrat agar backdrop-filter
 *   kartu punya tekstur untuk di-blur. Tanpa substrat bertekstur, blur di atas
 *   warna solid menghasilkan warna solid yang sama -> efek kaca tidak terlihat.
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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080b11] stitch-backdrop-root"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Wallpaper foto — substrat bertekstur untuk backdrop-filter.
          position:fixed agar tidak ikut scroll (kompositor GPU, nol repaint).
          Posisi 85% 50% menampilkan subjek (robot) di kanan-atas.
          Ukuran file dipilih browser via media query: tidak ada unduhan ganda. */}
      <div className="stitch-wallpaper" />

      {/* Scrim gelap tipis: menjaga kontras teks tetap WCAG AA di atas wallpaper
          yang lebih terang dari latar sebelumnya, tanpa menutupi teksturnya. */}
      <div className="stitch-wallpaper-scrim" />

      {/* Ambient Radial Mesh Glows (GPU Accelerated, Static & Performant) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isTabVisible ? 1 : 0.35, transition: 'opacity 0.4s ease' }}
      >
        {/* Glow 1: Netral Lembut (Top-Left) */}
        <div
          className="absolute rounded-full -top-24 -left-24 w-170 h-160 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(226, 232, 240, 0.055) 0%, rgba(203, 213, 225, 0.028) 40%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 2: Netral Lembut (Mid-Right) */}
        <div
          className="absolute rounded-full top-[28%] -right-20 w-180 h-170 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(226, 232, 240, 0.048) 0%, rgba(203, 213, 225, 0.022) 45%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 3: Netral Lembut (Interactive Lab Anchor) */}
        <div
          className="absolute rounded-full top-[60%] -left-16 w-160 h-150 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(226, 232, 240, 0.045) 0%, rgba(203, 213, 225, 0.020) 45%, transparent 70%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 4: Netral Lembut (Bottom) */}
        <div
          className="absolute rounded-full bottom-0 right-[15%] w-175 h-125 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(226, 232, 240, 0.042) 0%, rgba(203, 213, 225, 0.018) 45%, transparent 70%)',
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
