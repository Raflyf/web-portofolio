import React, { useEffect, useRef } from 'react';

/* v2 Ambient — single-hue canvas wash + sparse drift dots.
   DPR capped, ~36 particles, pauses when hidden, static when reduced-motion. */

export default function Ambient() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const dark = () => document.documentElement.classList.contains('dark');
    const dots = Array.from({ length: 36 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      r: Math.random() * 1.4 + 0.6,
      p: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const render = () => {
      if (document.hidden) {
        raf = 0;
        return;
      }
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      const isDark = dark();
      // one travelling wash, cyan family only
      const nx = w * (0.5 + Math.sin(t * 0.7) * 0.22);
      const ny = h * (0.32 + Math.cos(t * 0.5) * 0.14);
      const r = Math.max(w, h) * 0.42;
      const g = ctx.createRadialGradient(nx, ny, 10, nx, ny, r);
      if (isDark) {
        g.addColorStop(0, 'rgba(34, 211, 238, 0.075)');
        g.addColorStop(0.55, 'rgba(14, 116, 144, 0.035)');
      } else {
        g.addColorStop(0, 'rgba(14, 116, 144, 0.07)');
        g.addColorStop(0.55, 'rgba(34, 211, 238, 0.03)');
      }
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(Math.max(0, nx - r), Math.max(0, ny - r), Math.min(w, r * 2), Math.min(h, r * 2));

      ctx.beginPath();
      for (const d of dots) {
        d.x = (d.x + d.vx + 1) % 1;
        d.y = (d.y + d.vy + 1) % 1;
        const tw = 0.55 + 0.45 * Math.sin(t * 2 + d.p);
        ctx.moveTo(d.x * w + d.r, d.y * h);
        ctx.arc(d.x * w, d.y * h, d.r * tw, 0, Math.PI * 2);
      }
      ctx.fillStyle = isDark ? 'rgba(103, 232, 249, 0.30)' : 'rgba(14, 116, 144, 0.25)';
      ctx.fill();
      raf = requestAnimationFrame(render);
    };

    const onVis = () => {
      if (!document.hidden && !raf) raf = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(render);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      <canvas ref={ref} className="w-full h-full block" />
    </div>
  );
}
