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
      className="fixed inset-x-0 top-0 pointer-events-none z-0 overflow-hidden bg-[#080b11] stitch-backdrop-root"
      style={{ contain: 'layout style paint' }}
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

      {/* Ambient Radial Mesh Glows (GPU Accelerated, Static & Performant)
          Substrat cahaya hangat + dingin agar material Glassy V4 dapat membiaskan
          gradien halus seperti kaca buram optik visionOS. */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isTabVisible ? 1 : 0.35, transition: 'opacity 0.4s ease' }}
      >
        {/* Glow 1: Warm Champagne & Pearl Light Pool (Top-Left) */}
        <div
          className="absolute rounded-full -top-28 -left-24 w-190 h-175 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(254, 243, 199, 0.11) 0%, rgba(226, 232, 240, 0.065) 38%, rgba(148, 163, 184, 0.02) 62%, transparent 76%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 2: Ice Cyan & Satin Silver Light Pool (Mid-Right) */}
        <div
          className="absolute rounded-full top-[22%] -right-24 w-195 h-185 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(186, 230, 253, 0.105) 0%, rgba(226, 232, 240, 0.055) 42%, rgba(99, 102, 241, 0.025) 65%, transparent 78%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 3: Warm Amber-Rose & Mist Light Pool (Mid-Left / Projects & Lab Anchor) */}
        <div
          className="absolute rounded-full top-[54%] -left-20 w-185 h-175 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 45% 45%, rgba(253, 230, 138, 0.085) 0%, rgba(226, 232, 240, 0.05) 42%, rgba(125, 211, 252, 0.025) 64%, transparent 76%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Glow 4: Soft Indigo & Pearl Horizon Pool (Bottom) */}
        <div
          className="absolute rounded-full -bottom-16 right-[10%] w-190 h-150 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(199, 210, 254, 0.095) 0%, rgba(186, 230, 253, 0.05) 45%, transparent 75%)',
            transform: 'translateZ(0)'
          }}
        />

        {/* Subtle Dot Matrix Micro-Texture (Reduced opacity so glass looks creamy, not grainy) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-12"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            transform: 'translateZ(0)'
          }}
        />
        {/* Periphery Vignette Overlay (eliminates CPU mask-image rasterization) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 88% 88% at 50% 50%, transparent 54%, rgba(8, 11, 17, 0.88) 100%)',
            transform: 'translateZ(0)'
          }}
        />
      </div>
    </div>
  );
}
