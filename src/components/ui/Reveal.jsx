import React, { useEffect, useRef } from 'react';

/**
 * Shared IntersectionObserver Pool with Hysteresis (Zero React Re-Renders on Scroll)
 * - Satu observer per nilai threshold (default 0.08), dibagi oleh seluruh kartu di halaman.
 * - Menggunakan hysteresis multi-threshold `[0, 0.02, targetRatio]`:
 *   - Kartu langsung mulai reveal saat 6-8% bagiannya menyentuh viewport (atau 2% untuk kartu tinggi di mobile).
 *   - Reset (`revealed` dilepas & arah `reveal-from-top` disetel) HANYA terjadi saat kartu 100%
 *     keluar dari viewport (`!entry.isIntersecting || entry.intersectionRatio === 0`).
 *     Hasilnya: kartu tidak pernah melompat/reset saat masih terlihat di layar, dan selalu
 *     siap memainkan animasi reveal mewah yang konsisten baik saat di-scroll ke bawah maupun ke atas.
 */
const observerPool = new Map();

function getSharedObserver(threshold) {
  const targetRatio = Math.min(0.5, Math.max(0.02, Number(threshold) || 0.08));
  const key = targetRatio.toFixed(2);
  if (observerPool.has(key)) {
    return observerPool.get(key);
  }

  const thresholds = Array.from(new Set([0, 0.02, targetRatio])).sort((a, b) => a - b);

  const io = new IntersectionObserver(
    (entries) => {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const el = entry.target;

        if (!entry.isIntersecting || entry.intersectionRatio <= 0) {
          el.classList.remove('revealed');
          if (entry.boundingClientRect.top < 0) {
            el.classList.add('reveal-from-top');
          } else {
            el.classList.remove('reveal-from-top');
          }
        } else if (
          entry.intersectionRatio >= targetRatio ||
          (entry.intersectionRatio >= 0.02 && entry.boundingClientRect.height > vh * 0.65)
        ) {
          el.classList.add('revealed');
        }
      }
    },
    {
      threshold: thresholds,
      rootMargin: '0px 0px -3% 0px',
    }
  );

  observerPool.set(key, io);
  return io;
}

export default function Reveal({
  y = 36,
  x = 0,
  scale = 0.955,
  fade = true,
  duration = 0.78,
  delay = 0,
  amount = 0.08,
  as: Tag = 'div',
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      if (el) el.classList.add('revealed');
      return;
    }

    const io = getSharedObserver(amount);
    io.observe(el);
    return () => {
      io.unobserve(el);
    };
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
      className={`reveal-init${fade ? ' reveal-fade' : ''}${className ? ' ' + className : ''}`}
      style={{ ...vars, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
