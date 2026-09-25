import React, { useEffect, useRef, useState } from 'react';

/**
 * Reveal — animasi reveal dua arah berbasis CSS transition (compositor GPU),
 * BUKAN animasi JS per frame.
 *
 * KENAPA (terukur 25 Sep, Intel UHD): mengganti reveal framer-motion (yang
 * menganimasikan via JS di main thread setiap frame) dengan CSS transition
 * menaikkan FPS scroll 74 -> 84 dan menghapus seluruh frame jank
 * (frame >33ms: 2-5 -> 0) tanpa mengubah visual sedikit pun — kurva easing,
 * durasi, delay, arah, dan dua-arah (re-trigger) semuanya identik.
 * Teknik ini yang dipakai web bot FreeAIBot (terukur 115 fps di monitor 120Hz).
 *
 * PENTING: default TANPA opacity (hanya transform) — Chromium mematikan
 * backdrop-filter selama opacity < 1, jadi elemen kaca yang di-fade akan
 * kehilangan blur (bug "blur pop-in" yang sudah diperbaiki). Prop `fade`
 * hanya untuk wrapper non-kaca.
 *
 * Props:
 *  - y, x: offset awal (px, angka)
 *  - scale: skala awal (angka, opsional)
 *  - duration: detik (default 0.6)
 *  - delay: detik atau ekspresi (default 0)
 *  - amount: fraksi elemen harus terlihat agar ter-trigger (default 0.2)
 *  - fade: true = ikut animasikan opacity (default false)
 *  - as: tag elemen ('div' | 'section' | 'a' | 'span' | 'li')
 *  - className/style/props lain diteruskan apa adanya ke elemen.
 */
export default function Reveal({
  y = 0, x = 0, scale = null, fade = false,
  duration = 0.6, delay = 0, amount = 0.2,
  as: Tag = 'div', className = '', style, children, ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const threshold = Math.min(1, Math.max(0.01, Number(amount) || 0.2));
    const io = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold, rootMargin: '-15px 0px -15px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  const vars = {
    '--rv-duration': `${duration}s`,
    '--rv-delay': typeof delay === 'number' ? `${delay}s` : delay,
    '--rv-y': `${y}px`,
    '--rv-x': `${x}px`,
    '--rv-scale': scale == null ? 1 : scale,
  };

  return (
    <Tag
      ref={ref}
      className={`reveal-init${fade ? ' reveal-fade' : ''}${shown ? ' revealed' : ''}${className ? ' ' + className : ''}`}
      style={{ ...vars, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
