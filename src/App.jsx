import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Shield, Sparkles, Menu, X, Terminal, ExternalLink } from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { useTerminal } from './context/TerminalContext.jsx';

function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          ? 'bg-slate-950/90 border-b border-white/10 backdrop-blur-2xl shadow-lg' 
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
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-4 py-2 rounded-full text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions: Dashboard Badge */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <Shield className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200 hover:text-white cursor-pointer"
          aria-label="Menu Navigasi"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden mt-3 p-2 bg-slate-900/95 border border-white/10 rounded-2xl backdrop-blur-2xl flex flex-col gap-1 shadow-2xl pointer-events-auto">
          {navLinks.map((link) => (
            <button 
              key={link.name}
              onClick={(e) => {
                handleNavClick(e, link.href);
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors text-left"
            >
              {link.name}
            </button>
          ))}
          <div className="h-px bg-white/10 my-1 mx-2" />
          <Link 
            to="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
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

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-foreground relative selection:bg-cyan-500/20 font-sans">
        <FloatingNavbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      
      {/* Floating Action Buttons */}
      {location.pathname !== '/dashboard' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button 
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) || window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg transition-all hover:-translate-y-1"
            aria-label="Back to top"
            title="Kembali ke Atas"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          
          <button 
            onClick={() => setIsTerminalPopupOpen(true)}
            className="w-12 h-12 rounded-full bg-cyan-500 border border-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:scale-105 hover:bg-cyan-400 animate-pulse-glow"
            aria-label="Open Terminal"
            title="Buka Terminal AI"
          >
            <Terminal className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
    </BrowserRouter>
  );
}
