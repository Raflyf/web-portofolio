import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ArrowUp, Mail, Shield, Code, Heart } from 'lucide-react';
import { DEVELOPER_PROFILE } from '../../data.js';

export default function V2Footer() {
  const { language, t } = useLanguage();

  const handleScrollTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#05070e] relative z-10 px-4 sm:px-6 py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Identity */}
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-xs font-black text-white">
              RF
            </div>
            <span className="font-bold text-white tracking-wide v2-font-display text-sm">
              Rafly Firmansyah
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {DEVELOPER_PROFILE.degree}
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            Universitas Bina Sarana Informatika (UBSI) — Program Studi S1 Informatika.
          </p>
        </div>

        {/* Tech Stack Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="px-2.5 py-1 rounded-lg v2-glass-pill text-zinc-300">React 19</span>
          <span className="px-2.5 py-1 rounded-lg v2-glass-pill text-zinc-300">Vite 8</span>
          <span className="px-2.5 py-1 rounded-lg v2-glass-pill text-zinc-300">Framer Motion</span>
          <span className="px-2.5 py-1 rounded-lg v2-glass-pill text-zinc-300">Lenis Physics</span>
          <span className="px-2.5 py-1 rounded-lg v2-glass-pill text-zinc-300">Supabase</span>
        </div>

        {/* Back to Top & Switch */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full v2-glass-pill transition-colors"
          >
            Versi Klasik V1
          </Link>

          <button
            onClick={handleScrollTop}
            className="w-10 h-10 rounded-full v2-glass-card hover:border-cyan-400/50 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
            aria-label="Kembali ke Paling Atas"
            title="Kembali ke Atas"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
        <p>
          © 2026 Rafly Firmansyah. All rights reserved.
        </p>
        <p className="font-mono">
          WCAG 2.2 AA Compliant · Zero Data Leakage Architecture
        </p>
      </div>
    </footer>
  );
}
