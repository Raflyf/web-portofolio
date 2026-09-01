import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function GlassFilter() {
  return (
    <svg className="hidden absolute w-0 h-0">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-foreground relative selection:bg-white/20 font-sans">
        <GlassFilter />
        
        {/* Navigation Bar Header (Ported from old HorizonX Header) */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="text-white font-bold tracking-tight text-lg">
              <span className="text-zinc-400">Rafly</span> Firmansyah
            </a>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-300">
              <a href="/#about" className="hover:text-white transition-colors">Tentang</a>
              <a href="/#skills" className="hover:text-white transition-colors">Keahlian</a>
              <a href="/#projects" className="hover:text-white transition-colors">Proyek</a>
              <a href="/#certificates" className="hover:text-white transition-colors">Sertifikat</a>
              <a href="/dashboard" className="hover:text-white transition-colors text-emerald-400">Dashboard</a>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
