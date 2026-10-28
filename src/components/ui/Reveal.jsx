import React, { useEffect, useRef } from 'react';

/**
 * Dual-Observer Bidirectional Scroll Reveal Engine (Zero React Re-Renders, 60fps Compositor-Only)
 * - `enterObserver` (`rootMargin: '-9% 0px -9% 0px'`): Mengaktifkan `.revealed` tepat ketika
 *   kartu sudah masuk ~9% ke dalam layar (area pandang mata pengguna), sehingga gerakan meluncur
 *   56px dari bawah ke atas (saat scroll down) maupun dari atas ke bawah (saat scroll up)
 *   benar-benar terlihat jelas dan halus.
 * - `exitObserver` (`rootMargin: '0px'`): Mereset `.revealed` dan menyetel arah `.reveal-from-top`
 *   HANYA saat kartu 100% keluar dari batas layar dengan `transition: none` (biaya GPU 0ms).
 * - Murni menganimasikan `translate3d` pada compositor GPU dengan `opacity: 1` konstan,
 *   sehingga Chromium tidak pernah mengalokasikan ulang tekstur FBO `backdrop-filter` saat scroll.
 */
let sharedEnterObserver = null;
let sharedExitObserver = null;

function getSharedObservers() {
  if (sharedEnterObserver && sharedExitObserver) {
    return { enterObserver: sharedEnterObserver, exitObserver: sharedExitObserver };
  }

  sharedEnterObserver = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          entry.target.classList.add('revealed');
        }
      }
    },
    {
      threshold: [0.01],
      rootMargin: '-9% 0px -9% 0px',
    }
  );

  sharedExitObserver = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const el = entry.target;

        if (!entry.isIntersecting && entry.intersectionRatio <= 0) {
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
      threshold: [0],
      rootMargin: '0px',
    }
  );

  return { enterObserver: sharedEnterObserver, exitObserver: sharedExitObserver };
}

export default function Reveal({
  y = 56,
  x = 0,
  scale = null,
  fade = false,
  duration = 0.78,
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

    const { enterObserver, exitObserver } = getSharedObservers();
    exitObserver.observe(el);
    enterObserver.observe(el);
    return () => {
      enterObserver.unobserve(el);
      exitObserver.unobserve(el);
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
