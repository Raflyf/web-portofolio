import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Sun, Moon, Globe, ArrowUp } from 'lucide-react';
import Home from './home.jsx';
import Ambient from './ambient.jsx';
import { useLanguage } from '../../src/context/LanguageContext.jsx';
import { telemetry } from '../../src/lib/telemetry.js';

const Dashboard = React.lazy(() => import('./dashboard.jsx'));

const NAV = [
  { key: 'about', href: '/#about' },
  { key: 'skills', href: '/#skills' },
  { key: 'projects', href: '/#projects' },
  { key: 'certificates', href: '/#certificates' },
  { key: 'timeline', href: '/#timeline' },
  { key: 'lab', href: '/#lab' },
  { key: 'contact', href: '/#contact' },
];

function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const lastY = useRef(0);
  const location = useLocation();
  const isDash = location.pathname === '/dashboard';

  useEffect(() => {
    let tick = false;
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 20);
        if (y < 70) setVisible(true);
        else if (Math.abs(y - lastY.current) > 10) {
          setVisible(y < lastY.current);
          lastY.current = y;
        }
        tick = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open ]);

  if (isDash) return null;

  const theme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('portfolio-theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
    setIsDark(next);
  };
  const go = (e, href) => {
    if (!href.startsWith('/#')) return;
    e.preventDefault();
    setOpen(false);
    document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ${visible ? '' : '-translate-y-full'}`}>
      <a href="#main" className="skip-link">Lewati ke konten</a>
      <div className={`flex items-center justify-between px-5 lg:px-8 py-3 ${scrolled || open ? 'nav-shell' : 'bg-transparent'}`}>
        <Link to="/" onClick={(e) => { if (location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full inline-flex items-center justify-center text-sm font-bold" style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }} aria-hidden="true">RF</span>
          <span>
            <span className="block text-[15px] font-bold leading-tight">Rafly Firmansyah</span>
            <span className="text-[11px] font-mono flex items-center gap-1.5" style={{ color: 'var(--faint)' }}>
              <span className="dot-live" style={{ width: 7, height: 7 }} aria-hidden="true" />
              {t('nav.onlineStatus')}
            </span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {NAV.map((n) => (
            <a key={n.key} href={n.href} onClick={(e) => { go(e, n.href); telemetry.logEvent('nav_click', n.href, n.key); }} className="px-3.5 py-2 rounded-full text-sm font-medium hover:underline underline-offset-4" style={{ color: 'var(--muted)' }}>
              {t(`nav.${n.key}`)}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <button type="button" onClick={toggleLanguage} className="chip text-[11px] font-mono font-bold" aria-label={t('nav.switchLanguage')} title={language === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}>
            <Globe className="w-3.5 h-3.5 accent" aria-hidden="true" />
            <span className={language === 'id' ? 'accent' : undefined} style={language !== 'id' ? { opacity: 0.55 } : undefined}>ID</span>
            <span style={{ opacity: 0.35 }}>/</span>
            <span className={language === 'en' ? 'accent' : undefined} style={language !== 'en' ? { opacity: 0.55 } : undefined}>EN</span>
          </button>
          <button type="button" onClick={theme} className="inset w-9 h-9 rounded-full! inline-flex items-center justify-center" aria-label={t('nav.themeToggle')}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/dashboard" className="chip py-2! px-4! text-sm font-semibold" style={{ borderColor: 'var(--ok)', color: 'var(--ok)' }}>
            <Shield className="w-4 h-4" aria-hidden="true" />
            {t('nav.dashboard')}
          </Link>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} className="lg:hidden inset w-9 h-9 rounded-full! inline-flex items-center justify-center" aria-label="Menu Navigasi" aria-expanded={open}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <nav className="lg:hidden mx-4 mt-2 p-3 glass-strong flex flex-col gap-1" aria-label="Menu Mobile">
          {NAV.map((n) => (
            <a key={n.key} href={n.href} onClick={(e) => go(e, n.href)} className="px-4 py-3 rounded-xl text-sm font-semibold hover:underline underline-offset-4">
              {t(`nav.${n.key}`)}
            </a>
          ))}
          <div className="flex gap-2 px-1 pt-2">
            <button type="button" onClick={toggleLanguage} className="chip flex-1 justify-center py-2.5! text-xs font-bold">
              {language === 'id' ? 'ID → EN' : 'EN → ID'}
            </button>
            <button type="button" onClick={theme} className="chip flex-1 justify-center py-2.5! text-xs font-bold">
              {isDark ? t('nav.darkMode') : t('nav.lightMode')}
            </button>
          </div>
          <Link to="/dashboard" onClick={() => setOpen(false)} className="mx-1 mt-1 px-4 py-3 rounded-xl text-sm font-semibold text-center" style={{ border: '1px solid var(--ok)', color: 'var(--ok)' }}>
            {t('nav.dashboardFull')}
          </Link>
        </nav>
      )}
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const [top, setTop] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let tick = false;
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        setTop(window.scrollY > 400);
        tick = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] relative">
      <Ambient />
      <Navbar />
      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <React.Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center" role="status"><span className="chip">…</span></div>}>
              <Dashboard />
            </React.Suspense>
          } />
        </Routes>
      </div>
      {location.pathname !== '/dashboard' && top && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inset fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full! inline-flex items-center justify-center"
          aria-label={t('nav.backToTop')}
          title={t('nav.backToTop')}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
