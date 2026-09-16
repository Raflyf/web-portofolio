import React, { useEffect } from 'react';
import './stitch.css';
import Dashboard from '../pages/Dashboard.jsx';
import StitchCausticsBackdrop from './components/StitchCausticsBackdrop.jsx';

export default function StitchDashboard() {
  useEffect(() => {
    document.title = 'Dashboard Telemetri — Stitch Liquid Glass Preview';
  }, []);

  return (
    <div className="stitch-liquid-theme stitch-dashboard-container relative min-h-screen bg-[#06080d] text-slate-100 selection:bg-cyan-500/20 font-sans overflow-x-hidden">
      <StitchCausticsBackdrop />
      <div className="relative z-10">
        <Dashboard isStitch={true} />
      </div>
    </div>
  );
}
