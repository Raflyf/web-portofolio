import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Shield, Menu, X, Terminal, Sun, Moon } from 'lucide-react';
import Home from './pages/Home';
// Dashboard is heavy (Chart.js) — code-split so the landing bundle stays light.
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
import { useTerminal } from './context/TerminalContext.jsx';
import { telemetry } from './lib/telemetry';

function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });
  const location = useLocation();

  useEffect(() => {
    const applyTheme = (dark) => {
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
      setIsDark(dark);
    };

    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved === 'dark');
    }
  }, []);

  const handleThemeToggle = () => {
    const nextDark = !isDark;
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('portfolio-theme', nextDark ? 'dark' : 'light');
    setIsDark(nextDark);
    telemetry.logEvent('theme_toggle', 'mode_switch', `Ubah Mode Tema Tampilan ke ${nextDark ? 'gelap' : 'terang'}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Isolate Dashboard: Hide public floating navbar on dashboard route
  if (location.pathname === '/dashboard') {
    return null;
  }

  const handleBrandClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { name: 'Tentang', href: '/#about' },
    { name: 'Keahlian', href: '/#skills' },
    { name: 'Proyek', href: '/#projects' },
    { name: 'Sertifikat', href: '/#certificates' },
    { name: 'Riwayat', href: '/#timeline' },
    { name: 'Lab AI', href: '/#lab' },
    { name: 'Kontak', href: '/#contact' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none transition-all duration-300">
      <div className={`w-full pointer-events-auto px-6 lg:px-8 py-3.5 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? 'liquid-glass-nav'
          : 'bg-transparent border-b border-transparent'
      }`}>
        {/* Brand / Logo - Clicking smoothly scrolls to the very top */}
        <Link to="/" onClick={handleBrandClick} className="flex items-center gap-3 group cursor-pointer" title="Kembali ke Paling Atas">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500/30 to-indigo-500/30 border border-cyan-400/50 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform">
            <span className="text-sm font-bold text-white tracking-tight">RF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-cyan-300 transition-colors">
              Rafly Firmansyah
            </span>
            <span className="text-xs font-mono text-zinc-400 leading-none flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              Online
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                handleNavClick(e, link.href);
                telemetry.logEvent('nav_click', link.href, `Navigasi Menu: ${link.name}`);
              }}
              className="px-4 py-2 rounded-full text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 liquid-press transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions: Theme Toggle + Dashboard Badge */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleThemeToggle}
            className="w-9 h-9 rounded-full liquid-glass-inset liquid-glass-pill liquid-press flex items-center justify-center text-zinc-200 hover:text-white cursor-pointer"
            aria-label="Ubah Mode Tema"
            title="Ubah Mode Tema (Terang/Gelap)"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 liquid-press transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <Shield className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-9 h-9 rounded-full liquid-glass-inset liquid-glass-pill liquid-press flex items-center justify-center text-zinc-200 hover:text-white cursor-pointer"
          aria-label="Menu Navigasi"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden mt-3 p-2 liquid-glass-strong glass-spring-in flex flex-col gap-1 pointer-events-auto">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={(e) => {
                handleNavClick(e, link.href);
                telemetry.logEvent('nav_click', link.href, `Navigasi Menu: ${link.name}`);
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 liquid-press transition-colors text-left"
            >
              {link.name}
            </button>
          ))}
          <div className="h-px bg-white/10 my-1 mx-2" />
          <button
            onClick={() => {
              handleThemeToggle();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-zinc-200 hover:bg-white/10 liquid-press transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            <span>Ubah Mode Tema</span>
          </button>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 liquid-press transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Dashboard Admin</span>
          </Link>
        </nav>
      )}
    </header>
  );
}

export default function App() {
  const { setIsTerminalPopupOpen } = useTerminal();
  const location = useLocation();
  // Momentum Inertia Smooth Wheel Physics Engine (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    // RAF loop with a stored id so it is actually canceled on unmount
    // (lenis.destroy() alone does not stop our own loop).
    let rafId = 0;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 text-foreground relative selection:bg-cyan-500/20 font-sans">
        <FloatingNavbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
                  <div className="w-9 h-9 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin" aria-label="Memuat dashboard" />
                </div>
              }>
                <Dashboard />
              </React.Suspense>
            }
          />
        </Routes>
      
      {/* Floating Action Buttons */}
      {location.pathname !== '/dashboard' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button 
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) || window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full liquid-glass-strong liquid-glass-pill liquid-press text-zinc-400 hover:text-white hover:border-cyan-500/40 flex items-center justify-center transition-all hover:-translate-y-1"
            aria-label="Back to top"
            title="Kembali ke Atas"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          
          <button
            onClick={() => {
              telemetry.logEvent('terminal_open', 'terminal_modal', 'Buka Jendela Terminal AI Modal');
              setIsTerminalPopupOpen(true);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600 border border-cyan-300/60 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4),inset_0_1px_0_rgba(255,255,255,0.5)] liquid-press transition-all hover:scale-105 animate-pulse-glow"
            aria-label="Open Terminal"
            title="Buka Terminal AI"
          >
            <Terminal className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
