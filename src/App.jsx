import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Shield, Sparkles, Menu, X, Terminal, ExternalLink } from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

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

  const navLinks = [
    { name: 'Tentang', href: '/#about' },
    { name: 'Keahlian', href: '/#skills' },
    { name: 'Proyek', href: '/#projects' },
    { name: 'Sertifikat', href: '/#certificates' },
    { name: 'Riwayat', href: '/#timeline' },
    { name: 'Lab AI', href: '/#lab' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 mx-auto max-w-5xl z-50 px-4 pointer-events-none">
      <div className={`w-full rounded-full border transition-all duration-300 pointer-events-auto px-5 py-2.5 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.6)] ${
        scrolled 
          ? 'bg-slate-950/85 border-white/20 backdrop-blur-2xl' 
          : 'bg-slate-900/70 border-white/15 backdrop-blur-xl'
      }`}>
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/30 to-indigo-500/30 border border-cyan-400/40 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <span className="text-xs font-bold text-white tracking-tighter">RF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-cyan-300 transition-colors">
              Rafly Firmansyah
            </span>
            <span className="text-[10px] font-mono text-zinc-400 leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              Online
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions: Dashboard Badge */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl bg-slate-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl pointer-events-auto flex flex-col gap-2">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-white/10 transition-all"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10 mt-1">
            <Link 
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            >
              <Shield className="w-4 h-4" />
              Observability Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function App() {
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
      </div>
    </BrowserRouter>
  );
}
