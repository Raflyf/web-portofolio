import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Mail, ExternalLink, ArrowUpRight, BarChart3, Check } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { telemetry } from '../../lib/telemetry';

export default function StitchNav() {
  const { language, toggleLanguage, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      if (currentY < 70) {
        setNavVisible(true);
      } else if (delta > 8) {
        setNavVisible(false);
      } else if (delta < -8) {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('raflyfirmansyah02@gmail.com');
    setCopied(true);
    telemetry.logEvent('email_copy', 'stitch_nav', 'Salin Alamat Email dari Stitch Nav');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 pointer-events-none transition-transform duration-300 ease-in-out ${
      navVisible ? 'translate-y-0' : '-translate-y-32'
    }`}>
      <div className="pointer-events-auto h-13 max-w-[1240px] w-full stitch-glass-nav rounded-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-3.5 shrink-0">
          <a href="#hero" className="flex items-center gap-2 group">
            <span className="font-mono text-sm font-semibold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              RF<span className="text-cyan-400">.</span>dev
            </span>
          </a>
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/15 text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(111,246,255,0.85)] animate-pulse" />
            <span>{language === 'id' ? 'Tersedia untuk Riset & Rekayasa' : 'Available for Research & Eng'}</span>
          </div>
        </div>

        {/* Section Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 text-xs font-medium text-slate-300 font-sans">
          <a className="px-2.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all" href="#about">
            {language === 'id' ? 'Tentang' : 'About'}
          </a>
          <a className="px-2.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all" href="#skills">
            {language === 'id' ? 'Keahlian' : 'Skills'}
          </a>
          <a className="px-2.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all" href="#projects">
            {language === 'id' ? 'Proyek' : 'Projects'}
          </a>
          <a className="px-2.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all" href="#certificates">
            {language === 'id' ? 'Sertifikasi' : 'Certs'}
          </a>
          <a className="px-2.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all" href="#experience">
            {language === 'id' ? 'Pengalaman' : 'Experience'}
          </a>
          <a className="px-2.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all" href="#lab">
            {language === 'id' ? 'AI Lab' : 'AI Lab'}
          </a>
          <a className="px-2.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all" href="#contact">
            {language === 'id' ? 'Kontak' : 'Contact'}
          </a>
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className="px-2.5 py-1.5 rounded-full stitch-btn-glass text-[11px] font-mono text-cyan-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Buka Observability Dashboard"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry</span>
          </Link>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-full hover:bg-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Toggle Language ID/EN"
          >
            {language.toUpperCase()}
          </button>

          {/* Copy Email Button */}
          <button
            onClick={handleCopyEmail}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            title={copied ? 'Disalin!' : 'Salin Email'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4" />}
          </button>

          {/* GitHub Icon */}
          <a
            href="https://github.com/Raflyf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
            title="Profil GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* Direct CTA */}
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full stitch-btn-primary font-medium text-xs transition-all"
          >
            <span>{language === 'id' ? 'Hubungi' : 'Get in Touch'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
