import React, { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';

/**
 * InteractiveScrollBackground
 * Continuous full-page interactive ambient canvas:
 * 1. Scroll-driven chromatic shifts across all sections (Hero -> About -> Skills -> Projects -> Certs -> Lab -> Contact)
 * 2. Velocity-responsive kinetic warp on scroll
 * 3. Interactive mouse / touch physics (particle network connection)
 * 4. High-performance RAF engine with auto-pause on document.hidden and reduced-motion respect
 */
export default function InteractiveScrollBackground() {
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scrollProgressRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Update scroll progress & velocity continuously
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (latest) => {
      scrollProgressRef.current = latest;
    });

    const handleScrollVelocity = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;
      scrollVelocityRef.current = Math.min(Math.abs(delta) * 0.15, 6);
    };

    window.addEventListener('scroll', handleScrollVelocity, { passive: true });
    return () => {
      unsub();
      window.removeEventListener('scroll', handleScrollVelocity);
    };
  }, [scrollYProgress]);

  // Track mouse position for interactive particle physics
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle nodes configuration (dynamic neural constellation)
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 18000), 65);
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.35 + 0.15,
      phase: Math.random() * Math.PI * 2
    }));

    // Color palette interpolator based on scroll progress:
    // 0.0 - 0.18: Hero (Electric Cyan & Deep Indigo)
    // 0.18 - 0.38: About (Sapphire Blue & Teal)
    // 0.38 - 0.58: Skills (Neon Cyan & Violet Glow)
    // 0.58 - 0.78: Projects (Emerald & Cyan Stream)
    // 0.78 - 0.90: Timeline & Certs (Galactic Violet & Warm Gold)
    // 0.90 - 1.00: AI Lab & Contact (Cyber Emerald & Matrix Teal)
    const getPalette = (p) => {
      if (p < 0.2) {
        // Hero: Cyan & Indigo
        return {
          primary: [34, 211, 238],    // cyan-400
          secondary: [99, 102, 241],  // indigo-500
          tertiary: [16, 185, 129],   // emerald-500
        };
      } else if (p < 0.4) {
        // About: Sapphire & Teal
        return {
          primary: [14, 165, 233],    // sky-500
          secondary: [45, 212, 191],  // teal-400
          tertiary: [79, 70, 229],    // indigo-600
        };
      } else if (p < 0.6) {
        // Skills: Violet & Cyan
        return {
          primary: [168, 85, 247],   // purple-500
          secondary: [34, 211, 238],  // cyan-400
          tertiary: [236, 72, 153],  // pink-500
        };
      } else if (p < 0.8) {
        // Projects: Emerald & Cyan
        return {
          primary: [16, 185, 129],   // emerald-500
          secondary: [6, 182, 212],   // cyan-500
          tertiary: [59, 130, 246],  // blue-500
        };
      } else {
        // Lab & Contact: Emerald & Cyber Teal
        return {
          primary: [20, 184, 166],   // teal-500
          secondary: [16, 185, 129],  // emerald-500
          tertiary: [129, 140, 248], // indigo-400
        };
      }
    };

    let time = 0;

    const render = () => {
      // Pause loop if tab is inactive
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const progress = scrollProgressRef.current;
      const palette = getPalette(progress);
      const isDark = document.documentElement.classList.contains('dark');
      time += 0.008;

      // Dampen velocity over time
      scrollVelocityRef.current *= 0.92;
      const velocity = scrollVelocityRef.current;

      // 1. Dynamic Aurora Atmosphere Nodes (Traveling Nebulas across full scroll)
      const auraAlpha = isDark ? 0.08 : 0.04;
      const auraAlpha2 = isDark ? 0.06 : 0.03;

      // Primary traveling nebula
      const nebula1X = width * 0.5 + Math.sin(time * 0.7 + progress * 4) * (width * 0.25);
      const nebula1Y = height * 0.35 + Math.cos(time * 0.5 + progress * 3) * (height * 0.2);
      const grad1 = ctx.createRadialGradient(nebula1X, nebula1Y, 10, nebula1X, nebula1Y, width * 0.45);
      grad1.addColorStop(0, `rgba(${palette.primary[0]}, ${palette.primary[1]}, ${palette.primary[2]}, ${auraAlpha + velocity * 0.01})`);
      grad1.addColorStop(0.5, `rgba(${palette.secondary[0]}, ${palette.secondary[1]}, ${palette.secondary[2]}, ${auraAlpha * 0.4})`);
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Secondary counter-rotating nebula
      const nebula2X = width * 0.3 + Math.cos(time * 0.6 - progress * 3) * (width * 0.2);
      const nebula2Y = height * 0.65 + Math.sin(time * 0.8 + progress * 2) * (height * 0.2);
      const grad2 = ctx.createRadialGradient(nebula2X, nebula2Y, 10, nebula2X, nebula2Y, width * 0.4);
      grad2.addColorStop(0, `rgba(${palette.secondary[0]}, ${palette.secondary[1]}, ${palette.secondary[2]}, ${auraAlpha2})`);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Tertiary subtle accent nebula
      const nebula3X = width * 0.7 + Math.sin(time * 0.5) * (width * 0.15);
      const nebula3Y = height * 0.8 + Math.cos(time * 0.4) * (height * 0.15);
      const grad3 = ctx.createRadialGradient(nebula3X, nebula3Y, 5, nebula3X, nebula3Y, width * 0.35);
      grad3.addColorStop(0, `rgba(${palette.tertiary[0]}, ${palette.tertiary[1]}, ${palette.tertiary[2]}, ${auraAlpha2 * 0.8})`);
      grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 2. Interactive Neural Constellation Mesh
      const mouse = mouseRef.current;
      const connectionDist = Math.min(width * 0.13, 140);
      const mouseRadius = 150;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Kinetic velocity push along Y-axis on scroll
          p.x += p.vx;
          p.y += p.vy - velocity * 0.4;

          // Mouse gentle interaction
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouseRadius && dist > 0) {
              const force = (1 - dist / mouseRadius) * 0.8;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          // Screen wrapping
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        }

        // Draw particle dot with gentle breathing
        const alpha = p.baseAlpha * (0.7 + Math.sin(time * 2 + p.phase) * 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${palette.primary[0]}, ${palette.primary[1]}, ${palette.primary[2]}, ${alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const lineAlpha = (1 - dist / connectionDist) * 0.12 * (isDark ? 1 : 0.6);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${palette.primary[0]}, ${palette.primary[1]}, ${palette.primary[2]}, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
