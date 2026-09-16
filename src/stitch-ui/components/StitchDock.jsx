import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Terminal, Activity } from 'lucide-react';

export default function StitchDock() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <aside className="fixed bottom-5 inset-x-0 z-40 flex items-center justify-center pointer-events-none px-4">
      <div className="pointer-events-auto h-11 stitch-glass-nav rounded-full px-5 flex items-center gap-4 text-[11px] font-mono text-slate-300 shadow-2xl">
        {/* Realtime Latency / State */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(111,246,255,0.9)] animate-pulse" />
          <span className="text-slate-200">Latency: 18ms</span>
        </div>

        <div className="w-px h-3.5 bg-white/20" />

        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          title="Ganti Bahasa / Toggle Language"
        >
          <span className={language === 'en' ? 'text-white font-bold underline' : 'text-slate-400'}>EN</span>
          <span className="text-slate-500">/</span>
          <span className={language === 'id' ? 'text-white font-bold underline' : 'text-slate-400'}>ID</span>
        </button>

        <div className="w-px h-3.5 bg-white/20" />

        {/* CLI Quick Anchor */}
        <a 
          href="#interactive-lab"
          className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-300" />
          <span>CLI v2.4</span>
        </a>
      </div>
    </aside>
  );
}
