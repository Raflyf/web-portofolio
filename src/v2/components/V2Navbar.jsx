import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Globe, Shield, Terminal, ArrowUpRight, Menu, X } from 'lucide-react';
import { telemetry } from '../../lib/telemetry.js';

export default function V2Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 60) {
        setNavVisible(true);
        setScrolled(false);
      } else {
        setScrolled(true);
        if (delta > 8) {
          setNavVisible(false);
        } else if (delta < -8) {
          setNavVisible(true);
        }
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#about', label: t('nav.about') },
    { href: '#skills', label: t('nav.skills') },
    { href: '#projects', label: t('nav.projects') },
    { href: '#certificates', label: t('nav.certificates') },
    { href: '#timeline', label: t('nav.timeline') },
    { href: '#lab', label: t('nav.lab') },
    { href: '#contact', label: t('nav.contact') },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-transform duration-500 will-change-transform"
        style={{
          transform: navVisible ? 'translateY(0)' : 'translateY(-120%)'
        }}
      >
        <nav 
          aria-label="Navigasi Utama V2"
          className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 rounded-full v2-glass-nav border border-white/10 transition-all duration-300 ${
            scrolled ? 'shadow-2xl shadow-black/80 max-w-5xl w-full' : 'max-w-6xl w-full'
          }`}
        >
          {/* Brand & Live Beacon */}
          <div className="flex items-center gap-3">
            <a 
              href="#hero" 
              onClick={(e) => handleNavClick(e, '#hero')}
              className="flex items-center gap-2 text-white font-bold tracking-wider v2-font-display text-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-xs font-black text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                RF
              </div>
              <span className="hidden sm:inline text-zinc-200 group-hover:text-white transition-colors">
                Rafly Firmansyah
              </span>
            </a>

            {/* Status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'id' ? 'Tersedia Proyek' : 'Open for Work'}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-300">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-all"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => {
                toggleLanguage();
                telemetry.logEvent('language_toggle', 'locale_change', `Switch to ${language === 'id' ? 'en' : 'id'}`);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full v2-glass-pill text-xs font-medium text-zinc-300 hover:text-white hover:border-cyan-400/40 transition-colors cursor-pointer"
              aria-label={t('nav.switchLanguage')}
              title={t('nav.switchLanguage')}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Dashboard V2 Link */}
            <Link
              to="/v2/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all group"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>{t('nav.dashboard')}</span>
              <ArrowUpRight className="w-3 h-3 text-cyan-400/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full v2-glass-pill text-zinc-300 hover:text-white cursor-pointer"
              aria-label="Buka Menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-40 p-5 rounded-3xl v2-glass-card border border-white/10 md:hidden flex flex-col gap-3 shadow-2xl backdrop-blur-3xl"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <Link
                to="/v2/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>{t('nav.dashboardFull')}</span>
              </Link>
              
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                Versi V1
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
