import React, { useEffect, useRef } from 'react';

/* v2 Reveal — IntersectionObserver + CSS classes.
   No animation library. transform/opacity only. Once visible, stays. */

export function Reveal({ children, className = '', delay = 0, as: Tag = 'div', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('is-visible');
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: delay ? `${delay}ms` : undefined }} {...rest}>
      {children}
    </Tag>
  );
}

export function RevealGroup({ children, className = '', step = 70, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll(':scope > .reveal');
    if (typeof IntersectionObserver === 'undefined') {
      items.forEach((n) => n.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            items.forEach((n, i) => {
              n.style.transitionDelay = `${i * step}ms`;
              n.classList.add('is-visible');
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [step]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}

export default Reveal;
