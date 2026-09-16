import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { 
  Mail, 
  ArrowUpRight, 
  BarChart3, 
  Check, 
  Globe, 
  Menu, 
  X, 
  User, 
  Cpu, 
  Layers, 
  Award, 
  Briefcase, 
  Terminal as TerminalIcon, 
  Send 
} from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { telemetry } from '../../lib/telemetry';

const NAV_ITEMS = [
  { id: 'about', labelKey: 'about', icon: User },
  { id: 'skills', labelKey: 'skills', icon: Cpu },
  { id: 'projects', labelKey: 'projects', icon: Layers },
  { id: 'certificates', labelKey: 'certificates', icon: Award },
  { id: 'timeline', labelKey: 'timeline', icon: Briefcase },
  { id: 'lab', labelKey: 'lab', icon: TerminalIcon },
  { id: 'contact', labelKey: 'contact', icon: Send },
];

export default function StitchNav() {
  const { language, toggleLanguage, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const lastScrollY = useRef(0);

  // Scroll to section with Lenis Smooth Scroll or native fallback (Clean URL without hash #)
  const scrollToSection = (e, id) => {
    if (e) e.preventDefault();
    setActiveSection(id);
    setNavVisible(true);
    setMobileMenuOpen(false);
    
    // Maintain clean URL without '#'
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.href.split('#')[0]);
    }

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

      // Smart Auto-Hide: Match dashboard navbar behavior (slide up on scroll down, reveal on scroll up)
      if (currentY < 70 || mobileMenuOpen) {
        setNavVisible(true);
      } else if (Math.abs(delta) > 8) {
        if (delta > 0) {
          setNavVisible(false); // Scrolling down: slide up out of view
        } else {
          setNavVisible(true);  // Scrolling up: reveal navbar
        }
        lastScrollY.current = currentY;
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          const triggerLine = viewportHeight * 0.35;
          const scrollBottom = viewportHeight + scrollY;
          const docHeight = document.documentElement.scrollHeight;

          if (scrollY < 120) {
            setActiveSection('hero');
          } else if (scrollBottom >= docHeight - 80) {
            setActiveSection('contact');
          } else {
            let currentActive = 'hero';
            for (const item of NAV_ITEMS) {
              const el = document.getElementById(item.id);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= triggerLine) {
                  currentActive = item.id;
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
  }, [mobileMenuOpen]);

  // Accessibility: close mobile menu on Escape key press or window resize
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle direct URL landing (saved in pre-paint) and ensure URL remains clean without '#'
  useEffect(() => {
    const targetHash = window.__initialTargetHash || window.location.hash.replace('#', '');
    if (targetHash) {
      setActiveSection(targetHash);
      const timer = setTimeout(() => {
        const el = document.getElementById(targetHash);
        if (el) {
          if (window.__lenis) {
            window.__lenis.scrollTo(el, { duration: 1.0, offset: -70 });
          } else {
            const top = el.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
        delete window.__initialTargetHash;
        // Eradicate trailing '#' from address bar
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.href.split('#')[0]);
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
    <>
      {/* Soft backdrop dimmer when mobile menu is open (Fixed full viewport, behind header) */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-45 pointer-events-auto transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <header className={`fixed top-0 inset-x-0 z-50 flex flex-col items-center pt-2 sm:pt-3 px-3 sm:px-6 pointer-events-none transition-transform duration-300 ease-in-out ${
        navVisible ? 'translate-y-0' : '-translate-y-32'
      }`}>
        <div className="pointer-events-auto h-13 max-w-310 w-full stitch-glass-nav rounded-full px-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
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

        {/* Desktop Section Navigation Links with Synchronized 3D Liquid Glass Pill */}
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
                    : 'text-slate-300 hover:text-white hover:bg-white/8'
                }`}
              >
                {t(`nav.${item.labelKey}`)}
              </a>
            );
          })}
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            className="px-2.5 py-1.5 rounded-full stitch-btn-glass text-[11px] font-mono text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            title="Toggle Language ID/EN"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Copy Email Button */}
          <button
            onClick={handleCopyEmail}
            className="hidden md:flex p-2 rounded-full stitch-btn-glass text-slate-200 hover:text-white transition-all cursor-pointer items-center justify-center"
            title={copied ? 'Disalin!' : 'Salin Email'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
          </button>

          {/* GitHub Icon */}
          <a
            href="https://github.com/Raflyf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex p-2 rounded-full stitch-btn-glass text-slate-200 hover:text-white transition-all items-center justify-center"
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

          {/* Mobile Hamburger Toggle Button (Active on < lg screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full stitch-btn-glass text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-center lg:hidden"
            aria-label={mobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-cyan-300" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Liquid Glass Navigation Card (Direct Child of Header, Outside Pill) */}
      {mobileMenuOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Mobile"
          className="pointer-events-auto w-full max-w-md mt-2 p-4 sm:p-5 stitch-nav-mobile-sheet glass-spring-in space-y-3.5 font-sans"
        >
          {/* Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(111,246,255,0.85)] animate-pulse" />
              <span className="text-[11px]">{language === 'id' ? 'Tersedia untuk Riset & Rekayasa' : 'Available for Research & Eng'}</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold tracking-wider">RF.dev</span>
          </div>

          {/* Nav Items List */}
          <div className="grid grid-cols-1 gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'stitch-nav-link-active' 
                      : 'text-slate-200 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />}
                    <span>{t(`nav.${item.labelKey}`)}</span>
                  </div>
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
                  ) : (
                    <span className="text-slate-500 text-xs">→</span>
                  )}
                </a>
              );
            })}
          </div>

          {/* Mobile Footer Quick Utilities */}
          <div className="pt-3 border-t border-white/10 space-y-2.5">
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, 'contact')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl stitch-btn-primary font-semibold text-xs tracking-wide transition-all cursor-pointer"
            >
              <span>{language === 'id' ? 'Hubungi Saya' : 'Get in Touch'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 px-3 rounded-xl stitch-btn-glass text-[11px] font-mono text-cyan-300 hover:text-white flex items-center justify-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Telemetry</span>
              </Link>

              <button
                onClick={handleCopyEmail}
                className="py-2 px-3 rounded-xl stitch-btn-glass text-[11px] font-mono text-slate-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                title="Salin Email"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
                <span>{copied ? 'Disalin!' : 'Email'}</span>
              </button>

              <a
                href="https://github.com/Raflyf"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl stitch-btn-glass text-slate-200 hover:text-white flex items-center justify-center"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
