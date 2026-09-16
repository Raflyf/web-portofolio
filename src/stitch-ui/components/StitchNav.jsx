import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Mail, ArrowUpRight, BarChart3, Check, Globe } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { telemetry } from '../../lib/telemetry';

const NAV_ITEMS = [
  { id: 'about', labelId: 'Tentang', labelEn: 'About' },
  { id: 'skills', labelId: 'Keahlian', labelEn: 'Skills' },
  { id: 'projects', labelId: 'Proyek', labelEn: 'Projects' },
  { id: 'certificates', labelId: 'Sertifikasi', labelEn: 'Certificates' },
  { id: 'timeline', labelId: 'Pengalaman', labelEn: 'Experience' },
  { id: 'lab', labelId: 'AI Lab', labelEn: 'AI Lab' },
  { id: 'contact', labelId: 'Kontak', labelEn: 'Contact' },
];

export default function StitchNav() {
  const { language, toggleLanguage, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const lastScrollY = useRef(0);

  // Scroll to section with Lenis Smooth Scroll or native fallback
  const scrollToSection = (e, id) => {
    if (e) e.preventDefault();
    setActiveSection(id);
    setNavVisible(true);
    
    // Update hash in browser without harsh jumping
    window.history.pushState(null, '', `#${id}`);

    const el = document.getElementById(id);
    if (el) {
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { duration: 1.2, offset: -70 });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  // Synchronize active nav highlight with viewport scroll
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      // Always keep floating navbar visible on desktop so user can see the active sync pill
      if (currentY < 70 || window.innerWidth >= 1024) {
        setNavVisible(true);
      } else if (delta > 8) {
        setNavVisible(false);
      } else if (delta < -8) {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY < 200) {
            setActiveSection('hero');
          } else {
            const scrollPosition = currentY + window.innerHeight / 3;
            let currentActive = 'hero';

            for (const item of NAV_ITEMS) {
              const el = document.getElementById(item.id);
              if (el) {
                const top = el.offsetTop;
                const height = el.offsetHeight;
                if (scrollPosition >= top && scrollPosition < top + height) {
                  currentActive = item.id;
                  break;
                }
              }
            }
            setActiveSection(currentActive);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle direct URL hash landing (e.g. #timeline)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          if (window.__lenis) {
            window.__lenis.scrollTo(el, { duration: 1.0, offset: -70 });
          } else {
            const top = el.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      }, 350);
      return () => clearTimeout(timer);
    }
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
          <a 
            href="#hero" 
            onClick={(e) => scrollToSection(e, 'hero')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="font-mono text-sm font-semibold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              RF<span className="text-cyan-400">.</span>dev
            </span>
          </a>
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/15 text-[11px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(111,246,255,0.85)] animate-pulse" />
            <span>{language === 'id' ? 'Tersedia untuk Riset & Rekayasa' : 'Available for Research & Eng'}</span>
          </div>
        </div>

        {/* Section Navigation Links with Synchronized 3D Liquid Glass Pill */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300 font-sans">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  isActive 
                    ? 'stitch-nav-link-active' 
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {language === 'id' ? item.labelId : item.labelEn}
              </a>
            );
          })}
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
            className="px-2.5 py-1.5 rounded-full stitch-btn-glass text-[11px] font-mono text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Language ID/EN"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Copy Email Button */}
          <button
            onClick={handleCopyEmail}
            className="p-2 rounded-full stitch-btn-glass text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title={copied ? 'Disalin!' : 'Salin Email'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
          </button>

          {/* GitHub Icon */}
          <a
            href="https://github.com/Raflyf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full stitch-btn-glass text-slate-200 hover:text-white transition-all flex items-center justify-center"
            title="Profil GitHub"
          >
            <GithubIcon className="w-3.5 h-3.5" />
          </a>

          {/* Direct CTA */}
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full stitch-btn-primary font-semibold text-xs transition-all cursor-pointer"
          >
            <span>{language === 'id' ? 'Hubungi' : 'Get in Touch'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
