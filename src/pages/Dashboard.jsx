import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Activity, Users, MousePointerClick, MessageSquare, Radar } from 'lucide-react';
import { LiquidButton } from '../components/ui/liquid-glass-button';

const PIN_SALT = "rafly_telemetry_salt";
const DEFAULT_PIN_HASH = "db533e5fe9b399627eb386c19c967aa171dbc121a43fda2fa583c0a731aba78c"; 
const SESSION_AUTH_KEY = "dash_admin_auth_session";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_AUTH_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed && parsed.auth) setIsAuthenticated(true);
      } catch (e) {}
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pinInput) return;

    try {
      const hashedInput = await sha256(pinInput + PIN_SALT);
      if (hashedInput === DEFAULT_PIN_HASH) {
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ auth: true, timestamp: Date.now() }));
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Master PIN tidak valid. Akses ditolak.');
      }
    } catch (err) {
      setError('Kesalahan sistem kriptografi internal.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setIsAuthenticated(false);
    setPinInput('');
  };

  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-screen relative z-10 flex items-center justify-center p-4">
        {/* Auth Gateway (Liquid Glass) */}
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Admin Observability Portal</h1>
            <p className="text-sm text-zinc-400">Masukkan Master PIN keamanan untuk membuka akses metrik dan telemetri server.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <input 
                type="password" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                maxLength={8}
                autoFocus
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-700"
              />
            </div>
            {error && <div className="text-rose-400 text-sm text-center font-medium">{error}</div>}
            <LiquidButton type="submit" variant="primary" className="w-full justify-center">
              Buka Panel Observabilitas
              <ArrowRight className="w-4 h-4 ml-2" />
            </LiquidButton>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-center items-center gap-2 text-[10px] font-mono text-zinc-500 relative z-10">
            <Lock className="w-3 h-3" />
            SHA-256 Web Crypto & Cloud PIN Sync Protected
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full relative z-10 pt-24 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-sm font-medium text-emerald-400">Supabase Live Sync Active</span>
        </div>
        <div className="flex gap-3">
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors flex items-center gap-2">
            <Lock className="w-4 h-4" /> Kunci Dashboard
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Page Views', value: '1,248', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Pengunjung Unik', value: '892', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
          { label: 'Interaksi Klik', value: '3,410', icon: MousePointerClick, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Konversi Kontak', value: '45', icon: MessageSquare, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          { label: 'Rasio Interaksi', value: '3.8', icon: Radar, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        ].map((kpi, i) => (
          <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${kpi.bg} blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-xs font-medium text-zinc-400">{kpi.label}</span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.border} border`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${kpi.color} tracking-tight relative z-10`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Data Area - Placeholder for Chart.js Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl min-h-[350px] flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <Activity className="w-32 h-32 text-zinc-500" />
          </div>
          <p className="text-zinc-400 font-medium relative z-10">Chart.js Canvas (Traffic Velocity)</p>
          <p className="text-xs text-zinc-500 relative z-10">Supabase Sync Rendering...</p>
        </div>
        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl min-h-[350px] flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <Radar className="w-32 h-32 text-zinc-500" />
          </div>
          <p className="text-zinc-400 font-medium relative z-10">Chart.js Canvas (Link Clicks)</p>
          <p className="text-xs text-zinc-500 relative z-10">Supabase Sync Rendering...</p>
        </div>
      </div>
      
      {/* Activity Table Placeholder */}
      <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl min-h-[400px] flex flex-col items-center justify-center relative">
         <p className="text-zinc-400 font-medium relative z-10">Activity Stream Table (Supabase Realtime)</p>
      </div>

    </main>
  );
}
