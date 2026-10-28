import React, { useEffect, useRef } from 'react';

/**
 * Shared IntersectionObserver Pool with Threshold Hysteresis (Zero React Re-Renders, 60fps Compositor-Only)
 * - Satu observer (`rootMargin: '0px'`, `threshold: [0, 0.05, 0.14]`) dipakai bersama seluruh halaman.
 * - Mengaktifkan `.revealed` saat >= 14% tinggi kartu sudah masuk ke dalam viewport
 *   (atau untuk section tinggi, segera saat melewati >= 5% / > 70px ke dalam layar), sehingga
 *   gerakan meluncur 46px dari bawah ke atas (scroll down) maupun dari atas ke bawah (scroll up)
 *   terlihat jelas di area pandang mata dan tidak pernah gagal memicu elemen di ujung paling bawah halaman.
 * - Mereset `.revealed` dan menyetel arah `.reveal-from-top` HANYA saat kartu 100% keluar dari
 *   viewport (`!entry.isIntersecting`) dengan `transition: none` (biaya GPU 0ms).
 */
let sharedObserver = null;

function getSharedObserver() {
  if (sharedObserver) {
    return sharedObserver;
  }

  sharedObserver = new IntersectionObserver(
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
        } else {
          const visiblePx = entry.intersectionRect ? entry.intersectionRect.height : 0;
          if (entry.intersectionRatio >= 0.14 || visiblePx >= 64 || entry.boundingClientRect.height > vh * 0.5) {
            el.classList.add('revealed');
          }
        }
      }
    },
    {
      threshold: [0, 0.05, 0.14],
      rootMargin: '0px',
    }
  );

  return sharedObserver;
}

export default function Reveal({
  y = 46,
  x = 0,
  scale = null,
  fade = false,
  duration = 0.76,
  delay = 0,
  amount = 0.01,
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

    const io = getSharedObserver();
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
    ...(scale != null ? { '--rv-scale': scale } : {}),
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
