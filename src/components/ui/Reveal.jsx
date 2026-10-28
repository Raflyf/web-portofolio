import React, { useEffect, useRef } from 'react';

/**
 * Shared IntersectionObserver Pool (Zero React Re-Renders on Scroll)
 * - Satu observer per nilai threshold (default 0.15), dibagi oleh seluruh kartu di halaman.
 * - Memodifikasi class DOM (`revealed` & `reveal-from-top`) secara langsung tanpa memicu
 *   React `setState` / re-render saat pengguna sedang melakukan scroll.
 * - Mendukung animasi dua arah (bidirectional scroll up & down) yang 100% konsisten:
 *   - Saat di-scroll ke bawah (elemen masuk dari bawah): meluncur naik (+24px -> 0)
 *   - Saat di-scroll ke atas (elemen masuk dari atas): meluncur turun (-24px -> 0)
 */
const observerPool = new Map();

function getSharedObserver(threshold) {
  const key = Math.min(1, Math.max(0.01, Number(threshold) || 0.15)).toFixed(2);
  if (observerPool.has(key)) {
    return observerPool.get(key);
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('revealed');
        } else {
          el.classList.remove('revealed');
          if (entry.boundingClientRect.top < 0) {
            el.classList.add('reveal-from-top');
          } else {
            el.classList.remove('reveal-from-top');
          }
        }
      }
    },
    {
      threshold: Number(key),
      rootMargin: '-12px 0px -12px 0px',
    }
  );

  observerPool.set(key, io);
  return io;
}

export default function Reveal({
  y = 24,
  x = 0,
  scale = null,
  fade = false,
  duration = 0.55,
  delay = 0,
  amount = 0.15,
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
