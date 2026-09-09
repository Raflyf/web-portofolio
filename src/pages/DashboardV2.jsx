import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';
import { telemetry } from '../lib/telemetry.js';
import {
  Lock,
  ArrowLeft,
  Activity,
  Users,
  MousePointerClick,
  MessageSquare,
  Shield,
  RefreshCw,
  Search,
  LogOut,
  ChevronDown,
  Cpu,
  KeyRound,
  Mail,
  CheckCircle2,
  Check,
  AlertCircle,
  TrendingUp,
  Download,
  Zap,
  Globe,
  Award,
  Layers,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  X,
  Database
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PIN_SALT = "rafly_telemetry_salt";
const SESSION_AUTH_KEY = "dash_admin_auth_session";
const CACHE_EVENTS_KEY = 'portfolio_dashboard_cached_events';
const CACHE_MEMORIES_KEY = 'portfolio_dashboard_cached_memories';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 16 SOTA Models Definition
const INDIVIDUAL_MODELS = [
  { id: 'ollama-nemotron-nano', name: 'Nemotron 3 Nano (Ollama)', desc: 'Prioritas #1 - Dense 30B inferensi kilat', provider: 'OLLAMA', matcher: (s) => (s.includes('ollama') && (s.includes('nano') || s.includes('30b') || s.includes('nemotron'))) || s.includes('nemotron-3-nano') },
  { id: 'ollama-gemma4', name: 'Gemma 4 31B (Ollama)', desc: 'Prioritas #2 - Google Gemma 4 31B', provider: 'OLLAMA', matcher: (s) => (s.includes('ollama') && s.includes('gemma')) || s.includes('gemma4') || s.includes('31b') },
  { id: 'openrouter-gemma4', name: 'Gemma 4 31B (OpenRouter)', desc: 'Cadangan Gemma 4 via OpenRouter', provider: 'OPENROUTER', matcher: (s) => s.includes('openrouter') && s.includes('gemma') },
  { id: 'openrouter-nemotron-lightning', name: 'Nemotron 3.5 Lightning', desc: 'Prioritas #3 - Ultra fast cloud reasoning', provider: 'OPENROUTER', matcher: (s) => s.includes('lightning') || s.includes('lighting') },
  { id: 'openrouter-nemotron-nano-omni', name: 'Nemotron 3 Nano Omni', desc: 'Prioritas #5 - Multimodal 30B CoT', provider: 'OPENROUTER', matcher: (s) => s.includes('omni') || s.includes('30b-a3b') },
  { id: 'openrouter-free', name: 'OpenRouter Free Auto SOTA', desc: 'Dynamic Free Router otomatis', provider: 'OPENROUTER', matcher: (s) => s.includes('openrouter/free') || (s.includes('openrouter') && s.includes('free')) },
  { id: 'openrouter-deepseek', name: 'DeepSeek Chat V3', desc: 'Frontier reasoning & code logic', provider: 'OPENROUTER', matcher: (s) => s.includes('deepseek') },
  { id: 'openrouter-nemotron-super', name: 'Nemotron 3 Super 120B', desc: 'Dense 120B low latency', provider: 'OPENROUTER', matcher: (s) => s.includes('super-120b') || (s.includes('super') && !s.includes('ollama')) },
  { id: 'openrouter-nemotron-ultra', name: 'Nemotron 3 Ultra 550B', desc: 'Frontier MoE 550B parameter', provider: 'OPENROUTER', matcher: (s) => s.includes('ultra-550b') || (s.includes('ultra') && !s.includes('ollama')) },
  { id: 'openrouter-minimax', name: 'MiniMax M3 Free', desc: 'Multimodal vision & text', provider: 'OPENROUTER', matcher: (s) => s.includes('minimax') },
  { id: 'openrouter-cohere', name: 'Cohere North Mini Code', desc: 'Model penalaran logika kode', provider: 'OPENROUTER', matcher: (s) => s.includes('cohere') || s.includes('north-mini') },
  { id: 'ollama-nemotron-ultra', name: 'Nemotron 3 Ultra (Ollama)', desc: 'Frontier reasoning di Ollama Cloud', provider: 'OLLAMA', matcher: (s) => s.includes('ollama') && s.includes('ultra') },
  { id: 'ollama-nemotron-super', name: 'Nemotron 3 Super (Ollama)', desc: 'Dense 120B CoT Reasoning', provider: 'OLLAMA', matcher: (s) => s.includes('ollama') && s.includes('super') },
  { id: 'ollama-minimax', name: 'MiniMax M3 (Ollama)', desc: 'Multimodal vision and text', provider: 'OLLAMA', matcher: (s) => s.includes('ollama') && s.includes('minimax') },
  { id: 'opencode-preview', name: 'OpenCode x-preview-f-free', desc: 'Engine koding berkecepatan tinggi', provider: 'OPENCODE', matcher: (s) => s.includes('opencode') },
  { id: 'fallback-emergency', name: 'System Knowledge Engine', desc: 'Fallback deterministik offline', provider: 'SYSTEM', matcher: (s) => s.includes('fallback') || s.includes('offline') }
];

export default function DashboardV2() {
  const { language, t } = useLanguage();

  // Enforce dark mode strictly
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const session = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return Boolean(parsed && parsed.auth);
      }
    } catch {
      return false;
    }
    return false;
  });

  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Telemetry Data State
  const [events, setEvents] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_EVENTS_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [memories, setMemories] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_MEMORIES_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [filterRange, setFilterRange] = useState('7d');
  const [tableSearch, setTableSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Change PIN modal state
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  // SWR Watermark
  const watermarkRef = useRef('');

  // Fetch Telemetry Function
  const fetchTelemetry = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const sessionRaw = sessionStorage.getItem(SESSION_AUTH_KEY);
      let sessionToken = '';
      try {
        const session = JSON.parse(sessionRaw || '{}');
        if (session?.session_token) sessionToken = session.session_token;
      } catch {}

      const sinceParam = watermarkRef.current ? `?since=${encodeURIComponent(watermarkRef.current)}` : '';
      const res = await fetch(`/api/dashboard-data${sinceParam}`, {
        headers: {
          'Accept': 'application/json',
          'X-Admin-Token': sessionToken
        }
      });

      if (res.ok) {
        const data = await res.json();
        let loadedEvents = Array.isArray(data.events) ? data.events : [];
        let loadedMemories = Array.isArray(data.memories) ? data.memories : [];

        if (loadedEvents.length > 0) {
          setEvents(loadedEvents);
          try {
            localStorage.setItem(CACHE_EVENTS_KEY, JSON.stringify(loadedEvents.slice(0, 5000)));
          } catch {}
        }
        if (loadedMemories.length > 0) {
          setMemories(loadedMemories);
          try {
            localStorage.setItem(CACHE_MEMORIES_KEY, JSON.stringify(loadedMemories.slice(0, 5000)));
          } catch {}
        }
        if (data.server_max) watermarkRef.current = data.server_max;
        setIsLiveConnected(true);
      } else {
        setIsLiveConnected(false);
      }
    } catch {
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTelemetry();
      const timer = setInterval(() => {
        if (!document.hidden) fetchTelemetry();
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const hashed = await sha256(pinInput.trim() + PIN_SALT);
      const res = await fetch('/api/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', pin_hash: hashed })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const sessionPayload = {
          auth: true,
          session_token: data.session_token || '',
          timestamp: Date.now()
        };
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(sessionPayload));
        setIsAuthenticated(true);
        setPinInput('');
      } else {
        setAuthError(data.message || (language === 'id' ? 'PIN salah. Akses ditolak.' : 'Invalid PIN. Access denied.'));
      }
    } catch {
      setAuthError(language === 'id' ? 'Gagal menghubungi server otentikasi.' : 'Authentication server connection failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setIsAuthenticated(false);
  };

  // Filtered Events by Date Range
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    if (filterRange === 'all') return events;
    const now = Date.now();
    let cutoff = 0;
    if (filterRange === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      cutoff = d.getTime();
    } else if (filterRange === '7d') {
      cutoff = now - 7 * 86400000;
    } else if (filterRange === '30d') {
      cutoff = now - 30 * 86400000;
    }
    return events.filter(e => new Date(e.created_at || 0).getTime() >= cutoff);
  }, [events, filterRange]);

  // High-Level KPIs
  const kpiStats = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const visitors = new Set(filteredEvents.map(e => e.visitor_id || e.ip).filter(Boolean)).size;
    const terminalQueries = filteredEvents.filter(e => e.event_type === 'terminal_message' || e.event_name === 'terminal_submit').length;
    const memoryCount = memories.length;

    return {
      visitors: visitors || 0,
      totalEvents: totalEvents || 0,
      queries: terminalQueries || 0,
      memories: memoryCount || 0
    };
  }, [filteredEvents, memories]);

  // Chart 1: Traffic Line Chart (Last 7 Days)
  const trafficChartData = useMemo(() => {
    const daysMap = {};
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric' });
      labels.push(key);
      daysMap[key] = { pageViews: 0, interactions: 0 };
    }

    filteredEvents.forEach(e => {
      const d = new Date(e.created_at || 0);
      const key = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric' });
      if (daysMap[key]) {
        if (e.event_type === 'page_view') {
          daysMap[key].pageViews += 1;
        } else {
          daysMap[key].interactions += 1;
        }
      }
    });

    return {
      labels,
      datasets: [
        {
          label: language === 'id' ? 'Kunjungan Halaman' : 'Page Views',
          data: labels.map(l => daysMap[l]?.pageViews || 0),
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: language === 'id' ? 'Interaksi & Klik' : 'Interactions',
          data: labels.map(l => daysMap[l]?.interactions || 0),
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.05)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [filteredEvents, language]);

  // Chart 2: Event Type Distribution
  const eventDistChartData = useMemo(() => {
    const types = {};
    filteredEvents.forEach(e => {
      const t = e.event_type || 'other';
      types[t] = (types[t] || 0) + 1;
    });

    const labels = Object.keys(types).slice(0, 5);
    const data = labels.map(l => types[l]);

    return {
      labels: labels.map(l => l.replace(/_/g, ' ').toUpperCase()),
      datasets: [
        {
          data,
          backgroundColor: [
            '#38bdf8',
            '#34d399',
            '#818cf8',
            '#fbbf24',
            '#f43f5e'
          ],
          borderWidth: 0
        }
      ]
    };
  }, [filteredEvents]);

  // Filtered Events Table
  const tableEvents = useMemo(() => {
    return filteredEvents.filter(e => {
      const matchesType = eventTypeFilter === 'all' || e.event_type === eventTypeFilter;
      const term = tableSearch.toLowerCase();
      const matchesSearch = !term ||
        (e.event_name && e.event_name.toLowerCase().includes(term)) ||
        (e.details && JSON.stringify(e.details).toLowerCase().includes(term)) ||
        (e.event_type && e.event_type.toLowerCase().includes(term));
      return matchesType && matchesSearch;
    });
  }, [filteredEvents, eventTypeFilter, tableSearch]);

  const totalPages = Math.ceil(tableEvents.length / pageSize) || 1;
  const paginatedEvents = tableEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredEvents.length) return;
    const headers = ['Timestamp', 'Event Type', 'Event Name', 'Visitor ID', 'Details'];
    const rows = filteredEvents.map(e => [
      `"${e.created_at || ''}"`,
      `"${e.event_type || ''}"`,
      `"${e.event_name || ''}"`,
      `"${e.visitor_id || ''}"`,
      `"${(typeof e.details === 'string' ? e.details : JSON.stringify(e.details || '')).replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetry_v2_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Change PIN Submit
  const handleChangePin = async (e) => {
    e.preventDefault();
    if (!currentPin || !newPin) return;

    setPinMessage(language === 'id' ? 'Memproses perubahan PIN...' : 'Updating PIN...');

    try {
      const oldHash = await sha256(currentPin + PIN_SALT);
      const newHash = await sha256(newPin + PIN_SALT);

      const res = await fetch('/api/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_pin', current_pin_hash: oldHash, new_pin_hash: newHash })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setPinMessage(language === 'id' ? 'PIN berhasil diperbarui di server!' : 'PIN successfully updated!');
        setTimeout(() => {
          setIsChangePinOpen(false);
          setCurrentPin('');
          setNewPin('');
          setPinMessage('');
        }, 1500);
      } else {
        setPinMessage(data.message || (language === 'id' ? 'Gagal mengubah PIN.' : 'Failed to update PIN.'));
      }
    } catch {
      setPinMessage(language === 'id' ? 'Terjadi kesalahan jaringan.' : 'Network error occurred.');
    }
  };

  // Unauthenticated PIN Wall Screen
  if (!isAuthenticated) {
    return (
      <div className="v2-canvas min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="v2-glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 space-y-6 text-center shadow-2xl relative"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white v2-font-display">
              Observability Gateway V2
            </h1>
            <p className="text-xs text-zinc-400">
              {language === 'id'
                ? 'Masukkan PIN Administrator untuk mengakses telemetri & memori AI.'
                : 'Enter Administrator PIN to access live telemetry and AI logs.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1.5" htmlFor="v2-pin">
                PIN Administrator
              </label>
              <input
                id="v2-pin"
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-center tracking-[0.5em] text-lg focus:outline-none focus:border-cyan-400 transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-medium text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Otentikasi Akses</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link to="/v2" className="text-xs text-zinc-500 hover:text-white transition-colors">
                ← Kembali ke Halaman V2
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="v2-canvas min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header Navigation Bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl v2-glass-nav border border-white/10">
        <div className="flex items-center gap-3">
          <Link
            to="/v2"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Kembali ke Portofolio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white v2-font-display">
                Observability Bento V2
              </h1>
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {isLiveConnected ? 'Supabase RLS Live Stream Active' : 'Offline Buffer Mode'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Time Filter */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 text-xs">
            {['today', '7d', '30d', 'all'].map(r => (
              <button
                key={r}
                onClick={() => setFilterRange(r)}
                className={`px-3 py-1 rounded-xl font-medium transition-colors cursor-pointer ${
                  filterRange === r ? 'bg-white text-slate-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchTelemetry}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => setIsChangePinOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Ubah PIN"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bento Grid Core */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* KPI Strip (4 Bento Cards) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="v2-glass-card p-5 rounded-3xl space-y-2 group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-mono uppercase tracking-wider">Unik Pengunjung</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white v2-font-display">
              {kpiStats.visitors}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              IP & Device Fingerprints
            </p>
          </div>

          <div className="v2-glass-card p-5 rounded-3xl space-y-2 group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-mono uppercase tracking-wider">Total Peristiwa</span>
              <MousePointerClick className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white v2-font-display">
              {kpiStats.totalEvents}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Semua Interaksi Telemetri
            </p>
          </div>

          <div className="v2-glass-card p-5 rounded-3xl space-y-2 group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-mono uppercase tracking-wider">Terminal AI Queries</span>
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white v2-font-display">
              {kpiStats.queries}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Pertanyaan & Inferensi Model
            </p>
          </div>

          <div className="v2-glass-card p-5 rounded-3xl space-y-2 group hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-mono uppercase tracking-wider">RAG AI Memory</span>
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white v2-font-display">
              {kpiStats.memories}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Percakapan Terindeks di Supabase
            </p>
          </div>
        </section>

        {/* Charts Bento (2 Cards: Line and Doughnut) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 v2-glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white v2-font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Aktivitas Pengunjung (7 Hari Terakhir)</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">Live Metric</span>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <Line
                data={trafficChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#71717a' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717a' } }
                  },
                  plugins: {
                    legend: { labels: { color: '#d4d4d8', font: { size: 11 } } }
                  }
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-4 v2-glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white v2-font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Distribusi Kategori</span>
              </h2>
            </div>
            <div className="h-56 w-full flex items-center justify-center">
              <Doughnut
                data={eventDistChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 10 } } }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* AI Models Matrix Bento */}
        <section className="v2-glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white v2-font-display flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Katalog 16 Model AI Gateway</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Pemantauan pool model inferensi SOTA & sistem multi-routing
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              16/16 Registered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {INDIVIDUAL_MODELS.map((m) => {
              const count = filteredEvents.filter(e => {
                const s = `${e.details || ''} ${e.event_name || ''}`.toLowerCase();
                return m.matcher(s);
              }).length;

              return (
                <div key={m.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">{m.provider}</span>
                    <span className="text-cyan-400 font-semibold">{count} call</span>
                  </div>
                  <h3 className="text-xs font-bold text-white truncate">
                    {m.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Visitor Event Stream Table */}
        <section className="v2-glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white v2-font-display flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Log Peristiwa Realtime Telemetri</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Menampilkan {paginatedEvents.length} dari {tableEvents.length} catatan
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Cari log..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <select
                value={eventTypeFilter}
                onChange={(e) => { setEventTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">Semua Tipe</option>
                <option value="page_view">Page View</option>
                <option value="terminal_message">Terminal Message</option>
                <option value="project_select">Project Select</option>
                <option value="contact_submit">Contact Submit</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-zinc-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Tipe Peristiwa</th>
                  <th className="py-3 px-4">Nama Aksi</th>
                  <th className="py-3 px-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {paginatedEvents.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(row.created_at || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-cyan-300">
                        {row.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {row.event_name}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                      {typeof row.details === 'string' ? row.details : JSON.stringify(row.details || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
              <span>Halaman {currentPage} dari {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Change PIN Modal */}
      <AnimatePresence>
        {isChangePinOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="v2-glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/15 space-y-5 relative shadow-2xl"
            >
              <button
                onClick={() => setIsChangePinOpen(false)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-white v2-font-display flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Ubah PIN Administrator</span>
              </h3>

              <form onSubmit={handleChangePin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">PIN Saat Ini</label>
                  <input
                    type="password"
                    maxLength={8}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                    placeholder="••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400">PIN Baru</label>
                  <input
                    type="password"
                    maxLength={8}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                    placeholder="••••••"
                  />
                </div>

                {pinMessage && (
                  <p className="text-xs text-amber-400 font-medium">{pinMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Simpan PIN Baru
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
