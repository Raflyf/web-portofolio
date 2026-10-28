import React from 'react';

/**
 * StitchCausticsBackdrop — Pure High-Resolution Wallpaper Backdrop (60fps GPU)
 * - Menggunakan wallpaper resolusi tinggi (`bg-hd.webp`) di seluruh perangkat
 *   tanpa tumpukan blob radial-gradient atau dot-grid di atas foto latar.
 * - Posisi `fixed` dengan `contain: layout style paint` dan `translateZ(0)`
 *   sehingga kompositor GPU tidak pernah melakukan repaint saat scroll.
 */
export default function StitchCausticsBackdrop() {
  return (
    <div 
      className="fixed inset-x-0 top-0 pointer-events-none z-0 overflow-hidden bg-[#080b11] stitch-backdrop-root"
      style={{ contain: 'layout style paint' }}
      aria-hidden="true"
    >
      <div className="stitch-wallpaper" />
      <div className="stitch-wallpaper-scrim" />
    </div>
  );
}
