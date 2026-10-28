import React, { useEffect, useRef } from 'react';

/**
 * Shared IntersectionObserver Pool with Offscreen Hysteresis (Zero React Re-Renders on Scroll)
 * - Satu observer dibagi oleh seluruh elemen Reveal di halaman.
 * - Begitu 1% kartu menyentuh viewport (`entry.isIntersecting`), `.revealed` langsung aktif
 *   sehingga kartu meluncur mulus (cubic-bezier(0.22, 1, 0.36, 1)) tanpa jeda kaku.
 * - Reset (`revealed` dilepas & arah `reveal-from-top` disetel) HANYA terjadi saat kartu 100%
 *   keluar dari viewport (`!entry.isIntersecting`) dengan `transition: none` (biaya GPU 0ms).
 * - Murni menganimasikan `translate3d` pada compositor GPU (tanpa mengubah `opacity` atau `scale`
 *   pada kartu ber-backdrop-filter) sehingga Chromium tidak pernah membuat Backdrop Root
 *   perantara atau mengalokasikan ulang tekstur FBO blur saat scroll.
 */
let sharedObserver = null;

function getSharedObserver() {
  if (sharedObserver) {
    return sharedObserver;
  }

  sharedObserver = new IntersectionObserver(
    (entries) => {
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
          el.classList.add('revealed');
        }
      }
    },
    {
      threshold: [0, 0.01],
      rootMargin: '0px',
    }
  );

  return sharedObserver;
}

export default function Reveal({
  y = 26,
  x = 0,
  scale = null,
  fade = false,
  duration = 0.62,
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
