import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import InteractiveScrollBackground from '../components/ui/interactive-scroll-background.jsx';
import { telemetry } from '../lib/telemetry';
import { getSupabaseConfig } from '../lib/supabase';
import {
  Lock,
  ArrowRight,
  Activity,
  Users,
  MousePointerClick,
  MessageSquare,
  Radar,
  Shield,
  Database,
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
  Sun,
  Moon
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

// PIN_SALT MUST match the server salt (api/admin-otp.js PIN_SALT). The client
// hashes the input locally before sending pin_hash to /api/admin-otp, which
// compares SHA-256 hashes directly. Moving to server-side PBKDF is tracked
// separately — do not change this constant without updating the server.
const PIN_SALT = "rafly_telemetry_salt";
const SESSION_AUTH_KEY = "dash_admin_auth_session";
const PIN_STORAGE_KEY = "admin_master_pin_hash";

// Shared Supabase config (single source of truth, see src/lib/supabase.js).
// FAIL-CLOSED: no hardcoded key fallback. The dashboard reads telemetry via
// /api/dashboard-data; direct Supabase writes (ping test) only use env config.

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 16 Individual AI Models Definition (Ported from archive_v1)
const INDIVIDUAL_MODELS = [
  // PRIORITAS UTAMA
  {
    id: 'ollama-nemotron-nano',
    name: 'Nemotron 3 Nano (Ollama Cloud)',
    desc: 'Prioritas #1 - Model text-to-text dense 30B inferensi instan',
    provider: 'OLLAMA CLOUD',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => (s.includes('ollama') && (s.includes('nano') || s.includes('30b') || s.includes('nemotron'))) || s.includes('nemotron-3-nano') || s.includes('nano:30b') || s.includes('nano-30b') || /\bnano\b/.test(s)
  },
  {
    id: 'openrouter-nemotron-lightning',
    name: 'Nemotron 3.5 Lightning (OpenRouter)',
    desc: 'Prioritas #2 - Model berkecepatan tinggi OpenRouter Cloud',
    provider: 'OPENROUTER',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => (s.includes('openrouter') || !s.includes('opencode')) && (s.includes('lightning') || s.includes('lighting'))
  },
  {
    id: 'openrouter-nemotron-nano-omni',
    name: 'Nemotron 3 Nano Omni (OpenRouter)',
    desc: 'Prioritas #3 - Model multimodal & penalaran CoT 30B',
    provider: 'OPENROUTER',
    badgeClass: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    matcher: (s) => s.includes('omni') || s.includes('30b-a3b') || s.includes('reasoning:free')
  },

  // SISA MODEL (TIER OPENROUTER)
  {
    id: 'openrouter-free',
    name: 'OpenRouter Free (Auto SOTA Pool)',
    desc: 'Dynamic SOTA Free router otomatis',
    provider: 'OPENROUTER',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => s.includes('openrouter/free') || s.includes('openrouter_free') || (s.includes('openrouter') && s.includes('free') && !s.includes('nemotron') && !s.includes('minimax') && !s.includes('ultra'))
  },
  {
    id: 'openrouter-deepseek',
    name: 'DeepSeek Chat V3 (OpenRouter)',
    desc: 'Frontier Intelligence logika koding',
    provider: 'OPENROUTER',
    badgeClass: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    matcher: (s) => s.includes('deepseek')
  },
  {
    id: 'openrouter-nemotron-super',
    name: 'Nemotron 3 Super 120B (OpenRouter)',
    desc: 'Model penalaran dense 120B teroptimasi latensi rendah',
    provider: 'OPENROUTER',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => (s.includes('openrouter') && (s.includes('super-120b') || s.includes('super:120b') || s.includes('a12b'))) || (s.includes('super') && !s.includes('ollama'))
  },
  {
    id: 'openrouter-nemotron-ultra',
    name: 'Nemotron 3 Ultra 550B (OpenRouter)',
    desc: 'Arsitektur MoE 550B parameter penuh',
    provider: 'OPENROUTER',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => (s.includes('openrouter') && (s.includes('ultra-550b') || s.includes('ultra:550b') || s.includes('a55b'))) || (s.includes('ultra') && !s.includes('ollama') && !s.includes('opencode'))
  },
  {
    id: 'openrouter-minimax',
    name: 'MiniMax M3 Free (OpenRouter)',
    desc: 'Model multimodal untuk pemrosesan teks dan citra',
    provider: 'OPENROUTER',
    badgeClass: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    matcher: (s) => (s.includes('openrouter') && s.includes('minimax')) || (s.includes('minimax') && !s.includes('ollama'))
  },
  {
    id: 'openrouter-cohere',
    name: 'Cohere North Mini Code (OpenRouter)',
    desc: 'Model penalaran logika kode',
    provider: 'OPENROUTER',
    badgeClass: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    matcher: (s) => s.includes('cohere') || s.includes('north-mini')
  },

  // SISA MODEL (TIER OLLAMA)
  {
    id: 'ollama-nemotron-ultra',
    name: 'Nemotron 3 Ultra (Ollama Cloud)',
    desc: 'Model frontier reasoning di Ollama Cloud AI Gateway',
    provider: 'OLLAMA CLOUD',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => s.includes('ollama') && s.includes('ultra')
  },
  {
    id: 'ollama-nemotron-super',
    name: 'Nemotron 3 Super (Ollama Cloud)',
    desc: 'Model dense 120B teroptimasi latensi rendah',
    provider: 'OLLAMA CLOUD',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => s.includes('ollama') && s.includes('super')
  },
  {
    id: 'ollama-minimax',
    name: 'MiniMax M3 (Ollama Cloud)',
    desc: 'Multimodal vision and text model',
    provider: 'OLLAMA CLOUD',
    badgeClass: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    matcher: (s) => s.includes('ollama') && s.includes('minimax')
  },

  // TIER OPENCODE ZEN DIRECT MODELS
  {
    id: 'opencode-nemotron-lightning',
    name: 'Nemotron 3.5 Lightning (OpenCode)',
    desc: 'Model super kilat via endpoint langsung OpenCode Zen API',
    provider: 'OPENCODE',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => s.includes('opencode') && (s.includes('lightning') || s.includes('lighting'))
  },
  {
    id: 'opencode-nemotron-ultra',
    name: 'Nemotron 3 Ultra Free (OpenCode)',
    desc: 'Frontier reasoning engine via direct endpoint OpenCode Zen',
    provider: 'OPENCODE',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    matcher: (s) => s.includes('opencode') && s.includes('ultra')
  }
];

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative inline-block text-left z-60">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between w-40 sm:w-48 px-3.5 py-1.5 liquid-glass-inset rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer outline-none border border-zinc-300 dark:border-white/10 ${
          isOpen 
            ? 'border-cyan-400 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
            : 'hover:border-cyan-400/50 text-zinc-800 dark:text-zinc-200'
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-cyan-600 dark:text-cyan-400" : "rotate-0 text-zinc-500 dark:text-zinc-400"}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          data-lenis-prevent="true"
          className="absolute right-0 z-100 mt-1.5 w-48 sm:w-56 origin-top-right rounded-2xl liquid-glass border border-zinc-200 dark:border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_20px_rgba(6,182,212,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(6,182,212,0.15)] focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
        >
          <div 
            data-lenis-prevent="true" 
            className="py-1.5 max-h-72 overflow-y-auto overscroll-contain divide-y divide-zinc-200/50 dark:divide-white/5 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
          >
            {options.map((option) => (
              <button
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                  value === option.value 
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold" 
                    : "text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <span className="truncate pr-2">{option.label}</span>
                {value === option.value && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Plugin kustom untuk selalu menampilkan label data di atas grafik batang
const alwaysShowDataLabelPlugin = {
  id: 'alwaysShowDataLabel',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, index) => {
        const data = dataset.data[index];
        if (data > 0) {
          // FIX M4: backgroundColor may be a single string or missing at index
          const color = dataset.backgroundColor?.[index] || '#94a3b8';
          ctx.fillStyle = color;
          ctx.fillText(data, bar.x, bar.y - 4);
        }
      });
    });
  }
};

export default function Dashboard() {
  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return document.documentElement.classList.contains('dark') || localStorage.getItem('portfolio-theme') !== 'light';
  });


  const handleThemeToggle = () => {
    const nextDark = !isDark;
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('portfolio-theme', nextDark ? 'dark' : 'light');
    setIsDark(nextDark);
    telemetry.logEvent('theme_toggle', 'admin_switch', `Ubah Tema Admin ke ${nextDark ? 'gelap' : 'terang'}`);
  };

  // Authentication State with Instant Synchronous Session Restore (Eliminates PIN Screen Flash on Refresh)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const session = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.auth) {
          return true;
        }
      }
    } catch {
      // Ignore JSON parse error
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const failedAttemptsRef = useRef(0);

  // Modals State
  const [isForgotPinOpen, setIsForgotPinOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);

  // Forgot PIN / OTP State
  const [otpStep, setOtpStep] = useState(1);
  const [otpInput, setOtpInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Change PIN State
  const [currentPinChange, setCurrentPinChange] = useState('');
  const [newPinChange, setNewPinChange] = useState('');
  const [confirmPinChange, setConfirmPinChange] = useState('');
  const [changePinMessage, setChangePinMessage] = useState('');

  const CACHE_EVENTS_KEY = 'portfolio_dashboard_cached_events';
  const CACHE_MEMORIES_KEY = 'portfolio_dashboard_cached_memories';

  // Telemetry & DB State with Instant SWR (Stale-While-Revalidate) Cache
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
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_EVENTS_KEY);
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Range Filters
  const [kpiRange, setKpiRange] = useState('all');
  const [chartRange, setChartRange] = useState('7d');
  const [gridRange, setGridRange] = useState('all');
  const [aiModelsRange, setAiModelsRange] = useState('all');
  const [ragMemoriesRange, setRagMemoriesRange] = useState('all');
  const [ragSearchTerm, setRagSearchTerm] = useState('');
  const [tableRange, setTableRange] = useState('all');

  // Activity Table State
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const tablePageSize = 8;

  // Memories Pagination State
  const [memoryCurrentPage, setMemoryCurrentPage] = useState(1);
  const memoryPageSize = 5;

  // Ping Toast
  const [pingStatus, setPingStatus] = useState('');

  // Smart Auto-Hide Dashboard Header on Scroll
  const [dashboardNavVisible, setDashboardNavVisible] = useState(true);
  const lastDashboardScrollY = useRef(0);

  useEffect(() => {
    const threshold = 10;
    let ticking = false;

    const handleDashboardScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastDashboardScrollY.current;

          if (currentY < 70) {
            setDashboardNavVisible(true);
          } else if (Math.abs(delta) > threshold) {
            if (delta > 0) {
              setDashboardNavVisible(false); // Scroll down -> hide
            } else {
              setDashboardNavVisible(true);  // Scroll up -> reveal
            }
            lastDashboardScrollY.current = currentY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleDashboardScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleDashboardScroll);
  }, []);

  // 0. Telemetry: record dashboard visit
  useEffect(() => {
    telemetry.init();
  }, []);

  // 1. Session Auth Expiry Check
  useEffect(() => {
    try {
      const session = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (!session) {
        setIsAuthenticated(false);
      } else {
        const parsed = JSON.parse(session);
        if (!parsed || !parsed.auth) {
          setIsAuthenticated(false);
        }
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutSeconds]);

  // 2. Fetch Telemetry Loop
  // FIX M3: all fetch triggers (interval + telemetry_update event) go through a
  // single throttled wrapper with an in-flight guard, so overlapping async
  // requests and out-of-order state overwrites are prevented.
  const isFetchingRef = useRef(false);
  // FIX M3: pending timers + in-flight fetch are tracked in refs so they can be
  // cleaned up on unmount (no leaked setTimeout / dangling fetch callbacks).
  const timeoutsRef = useRef([]);
  const abortControllerRef = useRef(null);
  const fetchTelemetryData = useMemo(() => {
    const run = async () => {
      if (isFetchingRef.current) return; // skip if already in flight
      isFetchingRef.current = true;
      setIsLoading(true);
      let loadedEvents = [];
      let loadedMemories = [];

      // FIX M3: cancel any previous in-flight request before starting a new one.
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        // SECURE: telemetry + memories are private (RLS) and read via the
        // serverless endpoint /api/dashboard-data with the admin session token.
        const sessionRaw = sessionStorage.getItem(SESSION_AUTH_KEY);
        let sessionToken = '';
        try {
          const session = JSON.parse(sessionRaw || '{}');
          if (session?.session_token) sessionToken = session.session_token;
        } catch {}

        const dataRes = await fetch('/api/dashboard-data', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Admin-Token': sessionToken
          },
          signal: abortControllerRef.current.signal
        });

        if (dataRes.ok) {
          const payload = await dataRes.json();
          if (Array.isArray(payload.events)) loadedEvents = payload.events;
          if (Array.isArray(payload.memories)) loadedMemories = payload.memories;
          setIsLiveConnected(true);
        } else {
          // Direct Supabase Cloud Fallback (Fetches 100% of all 2700+ telemetry rows & 1700+ memories via pagination)
          const cfg = getSupabaseConfig();
          if (cfg && cfg.url && cfg.anonKey) {
            try {
              const fetchBatch = async (table) => {
                let all = [];
                let offset = 0;
                const batchSize = 1000;
                while (true) {
                  const res = await fetch(`${cfg.url}/rest/v1/${table}?select=*&order=created_at.desc&offset=${offset}&limit=${batchSize}`, {
                    headers: {
                      'apikey': cfg.anonKey,
                      'Authorization': `Bearer ${cfg.anonKey}`,
                      'Range-Unit': 'items',
                      'Range': `${offset}-${offset + batchSize - 1}`
                    },
                    signal: abortControllerRef.current?.signal
                  });
                  if (!res.ok) break;
                  const data = await res.json();
                  if (!Array.isArray(data) || data.length === 0) break;
                  all = all.concat(data);
                  if (data.length < batchSize) break;
                  offset += data.length;
                }
                const seenIds = new Set();
                return all.filter(item => {
                  if (!item.id) return true;
                  if (seenIds.has(item.id)) return false;
                  seenIds.add(item.id);
                  return true;
                });
              };

              const [allEvents, allMemories] = await Promise.all([
                fetchBatch('portfolio_telemetry'),
                fetchBatch('ai_memories')
              ]);

              if (allEvents.length > 0) {
                loadedEvents = allEvents;
                setIsLiveConnected(true);
              }
              if (allMemories.length > 0) {
                loadedMemories = allMemories;
              }
            } catch {}
          }
        }

        // SINGLE SOURCE OF TRUTH:
        // Jika server Supabase Cloud berhasil mengembalikan data (loadedEvents.length > 0),
        // gunakan 100% data resmi dari server tanpa mencampurkan riwayat lokal localStorage browser.
        // Mencampurkan localStorage lokal menyebabkan angka metrik berbeda-beda antara Laptop dan HP
        // karena setiap perangkat menyimpan ring-buffer lokal yang berbeda.
        // localStorage HANYA digunakan sebagai fallback darurat saat perangkat sedang offline.
        if (!Array.isArray(loadedEvents) || loadedEvents.length === 0) {
          const localEventsStr = localStorage.getItem('portfolio_telemetry_events');
          if (localEventsStr) {
            try {
              const localEvents = JSON.parse(localEventsStr);
              if (Array.isArray(localEvents)) {
                loadedEvents = localEvents;
              }
            } catch {}
          }
        }

        if (!Array.isArray(loadedMemories) || loadedMemories.length === 0) {
          const localMemStr = localStorage.getItem('portfolio_ai_memories');
          if (localMemStr) {
            try {
              const localMems = JSON.parse(localMemStr);
              if (Array.isArray(localMems)) {
                loadedMemories = localMems;
              }
            } catch {}
          }
        }
      } catch (err) {
        // FIX M3: aborted requests (unmount / superseded) are expected; skip noise.
        if (err && err.name === 'AbortError') return;
        console.warn("Dashboard data fetch warning:", err);
        setIsLiveConnected(false);

        // Fallback: local storage only (offline / no session)
        if (!Array.isArray(loadedEvents) || loadedEvents.length === 0) {
          const local = localStorage.getItem('portfolio_telemetry_events');
          if (local) {
            try { loadedEvents = JSON.parse(local); } catch {}
          }
        }
        if (!Array.isArray(loadedMemories) || loadedMemories.length === 0) {
          const localMem = localStorage.getItem('portfolio_ai_memories');
          if (localMem) {
            try { loadedMemories = JSON.parse(localMem); } catch {}
          }
        }
      } finally {
        if (Array.isArray(loadedEvents) && loadedEvents.length > 0) {
          setEvents(loadedEvents);
          try {
            localStorage.setItem(CACHE_EVENTS_KEY, JSON.stringify(loadedEvents.slice(0, 10000)));
          } catch {}
        }
        if (Array.isArray(loadedMemories) && loadedMemories.length > 0) {
          setMemories(loadedMemories);
          try {
            localStorage.setItem(CACHE_MEMORIES_KEY, JSON.stringify(loadedMemories.slice(0, 10000)));
          } catch {}
        }
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };
    return run;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTelemetryData();
      const interval = setInterval(fetchTelemetryData, 15000);
      window.addEventListener('telemetry_update', fetchTelemetryData);

      return () => {
        clearInterval(interval);
        window.removeEventListener('telemetry_update', fetchTelemetryData);
      };
    }
  }, [isAuthenticated, fetchTelemetryData]);

  // FIX M3: on unmount, clear all pending timers and abort the in-flight fetch.
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Helper Filter by Range
  const filterByRange = (items, range) => {
    if (!Array.isArray(items)) return [];
    if (range === 'all') return items;
    const now = Date.now();
    let cutoff = 0;
    if (range === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      cutoff = startOfDay.getTime();
    } else if (range === '7d') {
      cutoff = now - 7 * 86400000;
    } else if (range === '14d') {
      cutoff = now - 14 * 86400000;
    } else if (range === '30d') {
      cutoff = now - 30 * 86400000;
    }
    return items.filter((item) => {
      const ts = new Date(item.created_at || 0).getTime();
      return ts >= cutoff;
    });
  };

  // 3. Login Authentication Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pinInput || lockoutSeconds > 0) return;

    try {
      const hashedInput = await sha256(pinInput + PIN_SALT);
      const savedHash = localStorage.getItem(PIN_STORAGE_KEY);

      // 1. Verifikasi langsung ke Serverless Supabase Gateway (Source of Truth)
      let sessionToken = '';
      let serverVerified = false;

      try {
        const verifyRes = await fetch('/api/admin-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_pin', pin_hash: hashedInput })
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData?.verified && verifyData?.session_token) {
            sessionToken = verifyData.session_token;
            serverVerified = true;
          }
        }
      } catch {}

      // 2. Jika server verified atau cocok dengan local synced hash
      if (serverVerified || (savedHash && hashedInput === savedHash)) {
        localStorage.setItem(PIN_STORAGE_KEY, hashedInput);
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ 
          auth: true, 
          session_token: sessionToken, 
          timestamp: Date.now() 
        }));
        setIsAuthenticated(true);
        setAuthError('');
        failedAttemptsRef.current = 0;
        // Panggil langsung pemuatan data telemetri real-time
        setTimeout(() => fetchTelemetryData(), 50);
      } else {
        failedAttemptsRef.current += 1;
        if (failedAttemptsRef.current >= 5) {
          setLockoutSeconds(60);
          setAuthError('Terlalu banyak percobaan salah. Terkunci selama 60 detik.');
        } else {
          setAuthError(`Master PIN tidak valid. Percobaan ${failedAttemptsRef.current}/5.`);
        }
      }
    } catch {
      setAuthError('Kesalahan sistem kriptografi internal.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setIsAuthenticated(false);
    setPinInput('');
  };

  // 4. Change PIN Handler
  const handleChangePin = async (e) => {
    e.preventDefault();
    setChangePinMessage('');
    if (newPinChange.length < 6) {
      setChangePinMessage('PIN baru minimal 6 digit angka.');
      return;
    }
    if (newPinChange !== confirmPinChange) {
      setChangePinMessage('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    try {
      const currentHashed = await sha256(currentPinChange + PIN_SALT);
      const activeHash = localStorage.getItem(PIN_STORAGE_KEY);

      // FAIL-CLOSED: no hardcoded default-PIN bypass.
      if (!activeHash || currentHashed !== activeHash) {
        setChangePinMessage('Master PIN saat ini salah.');
        return;
      }

      // FIX M4: persist the change server-side FIRST. The API verifies
      // current_pin_hash and hashes the new PIN itself. localStorage is only
      // updated AFTER the server confirms success.
      const res = await fetch('/api/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_pin', current_pin_hash: currentHashed, new_pin: newPinChange })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setChangePinMessage(data.message || data.error || 'Gagal mengubah PIN di cloud. PIN lokal tidak diubah.');
        return;
      }

      const newHashed = await sha256(newPinChange + PIN_SALT);
      localStorage.setItem(PIN_STORAGE_KEY, newHashed);
      setChangePinMessage('Master PIN berhasil diperbarui & tersimpan!');
      timeoutsRef.current.push(setTimeout(() => {
        setIsChangePinOpen(false);
        setCurrentPinChange('');
        setNewPinChange('');
        setConfirmPinChange('');
        setChangePinMessage('');
      }, 1500));
    } catch {
      setChangePinMessage('Gagal mengubah PIN.');
    }
  };

  // 5. (removed) Obsolete Supabase Config modal — data path is /api/dashboard-data.

  // 6. OTP Reset Handlers
  const handleRequestOtp = async () => {
    setOtpLoading(true);
    setOtpMessage('');
    try {
      const res = await fetch('/api/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpStep(2);
        setOtpMessage('Kode OTP 6-digit berhasil dikirim ke email raflyfirmansyah02@gmail.com.');
      } else {
        setOtpMessage(data.error || 'Gagal mengirim OTP pemulihan.');
      }
    } catch {
      setOtpMessage('Koneksi ke API OTP terganggu.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpMessage('');
    if (newPinInput.length < 6) {
      setOtpMessage('Master PIN baru harus minimal 6 karakter.');
      setOtpLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp_and_reset_pin', otp_code: otpInput, new_pin: newPinInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const hashed = await sha256(newPinInput + PIN_SALT);
        localStorage.setItem(PIN_STORAGE_KEY, hashed);
        setOtpMessage('Master PIN berhasil direset! Silakan masuk kembali.');
        timeoutsRef.current.push(setTimeout(() => {
          setIsForgotPinOpen(false);
          setOtpStep(1);
          setOtpInput('');
          setNewPinInput('');
          setOtpMessage('');
        }, 2000));
      } else {
        setOtpMessage(data.error || 'Kode OTP salah atau kedaluwarsa.');
      }
    } catch {
      setOtpMessage('Gagal memverifikasi OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 7. Ping Test Handler
  const handleSendPing = async () => {
    setPingStatus('Mengirim Ping Telemetri...');
    try {
      telemetry.logEvent('ping_test', 'Admin Dashboard', 'Observability Manual Ping Test');
      await fetchTelemetryData();
      setPingStatus('Ping Berhasil Terkirim & Telemetri Diperbarui!');
    } catch {
      setPingStatus('Ping Gagal: Terjadi gangguan jaringan.');
    }
    timeoutsRef.current.push(setTimeout(() => setPingStatus(''), 4000));
  };

  // 8. Export CSV & JSON
  const handleExportCsv = () => {
    if (events.length === 0) return;
    const headers = ['id', 'created_at', 'event_type', 'event_target', 'event_label', 'device_type', 'session_id'];
    const csvRows = [headers.join(',')];
    events.forEach(e => {
      const row = [
        `"${e.id || ''}"`,
        `"${e.created_at || ''}"`,
        `"${e.event_type || ''}"`,
        `"${(e.event_target || '').replace(/"/g, '""')}"`,
        `"${(e.event_label || '').replace(/"/g, '""')}"`,
        `"${e.device_type || ''}"`,
        `"${e.session_id || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafly_portfolio_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (events.length === 0) return;
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafly_portfolio_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // METRICS & COMPUTATIONS
  // ==========================================

  // KPI Metrics Computed
  const kpiFilteredEvents = useMemo(() => filterByRange(events, kpiRange), [events, kpiRange]);
  const totalViews = useMemo(() => kpiFilteredEvents.filter(e => e.event_type === 'page_view').length, [kpiFilteredEvents]);
  const uniqueVisitors = useMemo(() => {
    const set = new Set(kpiFilteredEvents.map(e => e.session_id).filter(Boolean));
    return set.size;
  }, [kpiFilteredEvents]);
  const totalClicks = useMemo(() => kpiFilteredEvents.filter(e => e.event_type !== 'page_view').length, [kpiFilteredEvents]);
  const contactSubmissions = useMemo(() => kpiFilteredEvents.filter(e => e.event_type === 'contact_submit' || e.event_target?.toLowerCase().includes('contact') || e.event_target?.toLowerCase().includes('whatsapp')).length, [kpiFilteredEvents]);
  const interactivityRatio = useMemo(() => {
    if (totalViews === 0) return '0%';
    const ratio = Math.min((totalClicks / totalViews) * 100, 100);
    return `${ratio.toFixed(1)}%`;
  }, [totalViews, totalClicks]);

  // Chart 1: Traffic Velocity Line Chart
  const chartFilteredEvents = useMemo(() => filterByRange(events, chartRange), [events, chartRange]);
  const lineChartData = useMemo(() => {
    let daysCount = 7;
    if (chartRange === '14d') daysCount = 14;
    else if (chartRange === '30d') daysCount = 30;
    else if (chartRange === 'all') {
      if (events.length > 0) {
        const oldestTs = Math.min(...events.map(e => new Date(e.created_at || 0).getTime()).filter(t => !isNaN(t) && t > 0));
        const diffDays = Math.ceil((Date.now() - oldestTs) / 86400000);
        daysCount = Math.max(30, Math.min(diffDays + 1, 90));
      } else {
        daysCount = 30;
      }
    }

    const labels = [];
    const viewsPerDay = Array.from({ length: daysCount }, () => 0);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
    }

    const uniqueSessionsPerDay = Array.from({ length: daysCount }, () => new Set());

    chartFilteredEvents.forEach(e => {
      const eDate = new Date(e.created_at || 0);
      const dayIndex = Math.floor((Date.now() - eDate.getTime()) / 86400000);
      if (dayIndex >= 0 && dayIndex < daysCount) {
        const slot = (daysCount - 1) - dayIndex;
        if (e.event_type === 'page_view') viewsPerDay[slot]++;
        if (e.session_id) uniqueSessionsPerDay[slot].add(e.session_id);
      }
    });
    
    // Konversi set ke size (jumlah sesi unik per hari)
    const finalVisitors = uniqueSessionsPerDay.map(set => set.size);
    const finalViews = viewsPerDay;

    return {
      labels: labels,
      datasets: [
        {
          label: 'Total Kunjungan (Page Views)',
          data: finalViews,
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34, 211, 238, 0.12)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#0891b2',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Pengunjung Unik (Unique Sessions)',
          data: finalVisitors,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.12)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#a855f7',
          pointBorderColor: '#7e22ce',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
    // FIX M4: keyed only on the actual data source (chartFilteredEvents). The
    // previous deps (totalViews/uniqueVisitors) are not referenced inside and
    // caused the chart to rebuild on every unrelated KPI re-render.
  }, [chartFilteredEvents, chartRange]);

  // Chart 2: Link Click & Action Distribution (9 Categories)
  const barChartData = useMemo(() => {
    const categories = ['WhatsApp', 'GitHub', 'Plagiarism', 'Spam-Email', 'Laser PPT', 'FotoKita', 'Portfolio', 'Sertifikat', 'Terminal'];
    const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    chartFilteredEvents.forEach(e => {
      const combined = `${e.event_target || ''} ${e.event_label || ''} ${e.event_type || ''}`.toLowerCase();
      if (/\b(wa|whatsapp)\b/.test(combined)) counts[0]++;
      else if (/\b(github|git)\b/.test(combined)) counts[1]++;
      else if (/\b(plagiarism|skripsi)\b/.test(combined)) counts[2]++;
      else if (/\b(spam|email)\b/.test(combined)) counts[3]++;
      else if (/\b(laser|ppt)\b/.test(combined)) counts[4]++;
      else if (/\b(fotokita|foto)\b/.test(combined)) counts[5]++;
      else if (/\b(portfolio|web)\b/.test(combined)) counts[6]++;
      else if (/\b(cert|sertifikat)\b/.test(combined)) counts[7]++;
      else if (/\b(terminal)\b/.test(combined) || combined.includes('ai_')) counts[8]++;
    });

    return {
      labels: categories,
      datasets: [
        {
          label: 'Total Klik / Aksi',
          data: counts,
          backgroundColor: [
            'rgba(34, 211, 238, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(52, 211, 153, 0.7)',
            'rgba(244, 114, 182, 0.7)',
            'rgba(251, 191, 36, 0.7)',
            'rgba(96, 165, 250, 0.7)',
            'rgba(129, 140, 248, 0.7)',
            'rgba(45, 212, 191, 0.7)',
            'rgba(167, 139, 250, 0.7)'
          ],
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }
      ]
    };
  }, [chartFilteredEvents]);

  // Intelligence Grid Computations
  const gridFilteredEvents = useMemo(() => filterByRange(events, gridRange), [events, gridRange]);

  // 1. Device Ratio
  const deviceStats = useMemo(() => {
    let desktop = 0, mobile = 0, tablet = 0;
    gridFilteredEvents.forEach(e => {
      const dev = (e.device_type || '').toLowerCase();
      if (dev.includes('mob')) mobile++;
      else if (dev.includes('tab')) tablet++;
      else desktop++;
    });
    const total = desktop + mobile + tablet;
    // m-5: guard division-by-zero so an empty dashboard shows 0% instead of NaN%.
    const pct = (n) => (total > 0 ? ((n / total) * 100).toFixed(0) : '0');
    return {
      desktop,
      mobile,
      tablet,
      desktopPct: pct(desktop),
      mobilePct: pct(mobile),
      tabletPct: pct(tablet)
    };
  }, [gridFilteredEvents]);

  // FIX M4: stabilize the doughnut data object with useMemo keyed on the actual
  // values so the chart does not re-init on every unrelated render.
  const deviceDoughnutData = useMemo(() => ({
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [deviceStats.desktop, deviceStats.mobile, deviceStats.tablet],
        backgroundColor: ['#22d3ee', '#a855f7', '#34d399'],
        borderWidth: 0
      }
    ]
  }), [deviceStats]);

  // 2. Top Projects Ranked
  const topProjects = useMemo(() => {
    const projMap = {
      'Plagiarism Checker Skripsi': 0,
      'Spam Email AI Classifier': 0,
      'Laser PPT Controller Hardware': 0,
      'FotoKita Studio Platform': 0,
      'Portfolio Observability Dashboard': 0
    };

    gridFilteredEvents.forEach(e => {
      const target = (e.event_target || '').toLowerCase();
      if (target.includes('plagiarism') || target.includes('skripsi')) projMap['Plagiarism Checker Skripsi']++;
      else if (target.includes('spam') || target.includes('email')) projMap['Spam Email AI Classifier']++;
      else if (target.includes('laser') || target.includes('ppt')) projMap['Laser PPT Controller Hardware']++;
      else if (target.includes('fotokita') || target.includes('studio')) projMap['FotoKita Studio Platform']++;
      else if (target.includes('dashboard') || target.includes('telemetry')) projMap['Portfolio Observability Dashboard']++;
    });

    const sorted = Object.entries(projMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map(item => ({
      ...item,
      pct: Math.round((item.count / maxCount) * 100)
    }));
  }, [gridFilteredEvents]);

  // 3. Top Certificates Ranked
  const topCertificates = useMemo(() => {
    const certMap = {
      'MikroTik MTCNA Network Engineer': 0,
      'Deep Learning & NLP Specialist': 0,
      'Cloud Architecture & DevOps': 0,
      'Cybersecurity & Network Defense': 0,
      'Fullstack Web Architecture': 0
    };

    gridFilteredEvents.forEach(e => {
      const target = (e.event_target || '').toLowerCase();
      if (target.includes('mtcna') || target.includes('mikrotik')) certMap['MikroTik MTCNA Network Engineer']++;
      else if (target.includes('deep learning') || target.includes('nlp')) certMap['Deep Learning & NLP Specialist']++;
      else if (target.includes('cloud') || target.includes('devops')) certMap['Cloud Architecture & DevOps']++;
      else if (target.includes('cyber') || target.includes('security')) certMap['Cybersecurity & Network Defense']++;
      else if (target.includes('fullstack') || target.includes('react')) certMap['Fullstack Web Architecture']++;
    });

    const sorted = Object.entries(certMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map(item => ({
      ...item,
      pct: Math.round((item.count / maxCount) * 100)
    }));
  }, [gridFilteredEvents]);

  // 4. Top Referrers
  const topReferrers = useMemo(() => {
    const refMap = {
      'Direct Navigation / URL': 0,
      'GitHub Repository': 0,
      'Instagram Profile': 0,
      'Google Search': 0,
      'WhatsApp Share': 0
    };

    gridFilteredEvents.forEach(e => {
      const ref = (e.referrer || '').toLowerCase();
      if (ref.includes('github')) refMap['GitHub Repository']++;
      else if (ref.includes('instagram')) refMap['Instagram Profile']++;
      else if (ref.includes('google')) refMap['Google Search']++;
      else if (ref.includes('whatsapp') || ref.includes('wa.me')) refMap['WhatsApp Share']++;
      else refMap['Direct Navigation / URL']++;
    });

    const sorted = Object.entries(refMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map(item => ({
      ...item,
      pct: Math.round((item.count / maxCount) * 100)
    }));
  }, [gridFilteredEvents]);

  // AI Models Execution Matrix Computation
  const aiModelsStats = useMemo(() => {
    const aiFilteredEvents = filterByRange(events, aiModelsRange);
    let totalAIQueries = 0;
    let autoRouterCount = 0;
    const modelCounts = {};
    const modelLastUsed = {};

    INDIVIDUAL_MODELS.forEach(m => {
      modelCounts[m.id] = 0;
      modelLastUsed[m.id] = 0;
    });

    aiFilteredEvents.forEach(e => {
      const type = (e.event_type || '').toLowerCase();
      const target = (e.event_target || '').toLowerCase();
      const label = (e.event_label || '').toLowerCase();
      const combined = `${target} ${label} ${type}`;
      const ts = new Date(e.created_at || 0).getTime();

      const isAIEvent = type === 'ai_query_resolved' ||
                        type === 'ai_chat' ||
                        type === 'ai_query' ||
                        type === 'model_select' ||
                        combined.includes('ai_') ||
                        (type === 'terminal_cmd' && (target.startsWith('ai:') || target.startsWith('chat:') || target.startsWith('ask:') || target.startsWith('model')));

      if (isAIEvent) {
        totalAIQueries++;
        const isAutoRouted = target.startsWith('auto') || 
                             label.includes('auto') || 
                             label.includes('[auto') || 
                             label.includes('smart cascade') ||
                             target === 'auto' ||
                             type === 'ai_chat' ||
                             type === 'ai_query' ||
                             type === 'ai_query_resolved';
        if (isAutoRouted) autoRouterCount++;

        let matched = false;
        for (const m of INDIVIDUAL_MODELS) {
          if (m.matcher(combined)) {
            modelCounts[m.id]++;
            if (ts > modelLastUsed[m.id]) modelLastUsed[m.id] = ts;
            matched = true;
            break;
          }
        }
        // Atribusi riwayat lama: Jika tidak ada matcher spesifik,
        // atribusikan ke prioritas default #1 (Nemotron 3 Nano - Ollama Cloud)
        if (!matched) {
          modelCounts['ollama-nemotron-nano']++;
          if (ts > modelLastUsed['ollama-nemotron-nano']) modelLastUsed['ollama-nemotron-nano'] = ts;
        }
      }
    });

    const sortedModels = [...INDIVIDUAL_MODELS].map(m => ({
      ...m,
      count: modelCounts[m.id] || 0,
      lastUsedAt: modelLastUsed[m.id] || 0
    })).sort((a, b) => {
      if (b.lastUsedAt !== a.lastUsedAt) return b.lastUsedAt - a.lastUsedAt;
      return b.count - a.count;
    });

    return {
      totalAIQueries,
      autoRouterCount,
      models: sortedModels
    };
  }, [events, aiModelsRange]);

  // Dedicated Continuous RAG Knowledge (Murni dari tabel Supabase ai_memories: kumpulan pengetahuan, scraping, dan fakta tersimpan)
  const allDerivedMemories = useMemo(() => {
    if (!Array.isArray(memories)) return [];
    
    // Deduplikasi dan urutkan berdasarkan waktu fakta pengetahuan tersimpan di Supabase ai_memories
    const seen = new Set();
    const cleanList = [];
    for (const m of memories) {
      const text = (m.fact_text || m.memory_text || m.content || '').trim();
      if (!text) continue;
      const lower = text.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      cleanList.push(m);
    }
    return cleanList.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [memories]);

  const filteredMemories = useMemo(() => {
    let list = filterByRange(allDerivedMemories, ragMemoriesRange);
    if (ragSearchTerm.trim()) {
      const term = ragSearchTerm.toLowerCase();
      list = list.filter(m => (m.fact_text || m.memory_text || m.content || '').toLowerCase().includes(term));
    }
    return list;
  }, [allDerivedMemories, ragMemoriesRange, ragSearchTerm]);

  const memoryTotalPages = Math.ceil(filteredMemories.length / memoryPageSize) || 1;
  const currentMemories = useMemo(() => {
    const start = (memoryCurrentPage - 1) * memoryPageSize;
    return filteredMemories.slice(start, start + memoryPageSize);
  }, [filteredMemories, memoryCurrentPage, memoryPageSize]);

  // Real-Time Activity Stream Filter & Pagination
  const filteredActivityEvents = useMemo(() => {
    let list = filterByRange(events, tableRange);
    if (selectedEventType !== 'all') {
      list = list.filter(e => e.event_type === selectedEventType);
    }
    if (tableSearchTerm) {
      const q = tableSearchTerm.toLowerCase();
      list = list.filter(e => {
        const target = (e.event_target || '').toLowerCase();
        const label = (e.event_label || '').toLowerCase();
        const sid = (e.session_id || '').toLowerCase();
        return target.includes(q) || label.includes(q) || sid.includes(q);
      });
    }
    return list;
  }, [events, tableRange, selectedEventType, tableSearchTerm]);

  const activityTotalPages = Math.ceil(filteredActivityEvents.length / tablePageSize) || 1;
  const currentActivityEvents = useMemo(() => {
    const start = (tableCurrentPage - 1) * tablePageSize;
    return filteredActivityEvents.slice(start, start + tablePageSize);
  }, [filteredActivityEvents, tableCurrentPage, tablePageSize]);

  // FIX M4: animation disabled to avoid blink/re-init on every 15s poll update.
  // Standard Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { size: 11, family: 'monospace' } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } }
    }
  };

  // ==========================================
  // RENDER AUTH GATEWAY (IF NOT AUTHENTICATED)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <>
        <InteractiveScrollBackground />
        <main className="w-full min-h-screen relative z-10 flex items-center justify-center p-4 pt-24 bg-transparent text-zinc-900 dark:text-white font-sans">
          {/* Auth Glass Card */}
        <div className="w-full max-w-md liquid-glass-strong p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
          
          <div className="flex justify-center mb-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono mb-3">
              <Lock className="w-3 h-3" />
              <span>Restricted Security Zone</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Observability Gateway</h1>
            <p className="text-xs text-zinc-400">Masukkan Master PIN keamanan untuk membuka akses metrik telemetri Supabase Cloud.</p>
          </div>

          {!isForgotPinOpen ? (
            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••••"
                  aria-label="Master PIN"
                  maxLength={8}
                  disabled={lockoutSeconds > 0}
                  autoFocus
                  className="w-full liquid-glass-inset border border-white/15 rounded-2xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-zinc-700 disabled:opacity-50"
                />
              </div>

              {authError && (
                <div className="text-rose-400 text-xs text-center font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {lockoutSeconds > 0 && (
                <div className="text-amber-400 text-xs text-center font-mono">
                  Menunggu {lockoutSeconds} detik sebelum dapat mencoba lagi...
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={lockoutSeconds > 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer disabled:opacity-50"
              >
                <span>Buka Panel Observabilitas</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPinOpen(true)}
                  className="text-xs text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Lupa Master PIN? Pulihkan via Email OTP
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 relative z-10">
              {otpStep === 1 ? (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Kirim kode 6-digit OTP pemulihan ke email administrator terdaftar: <strong className="text-cyan-300 font-mono">raflyfirmansyah02@gmail.com</strong>
                  </p>
                  <button
                    onClick={handleRequestOtp}
                    disabled={otpLoading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                    {otpLoading ? 'Mengirim OTP...' : 'Kirim OTP Pemulihan'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Kode OTP 6-Digit"
                    aria-label="Kode OTP 6-Digit"
                    maxLength={6}
                    className="w-full liquid-glass-inset border border-white/15 rounded-xl px-4 py-2.5 text-center font-mono text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="password"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Master PIN Baru (6+ Angka)"
                    aria-label="Master PIN Baru (minimal 6 karakter)"
                    maxLength={8}
                    className="w-full liquid-glass-inset border border-white/15 rounded-xl px-4 py-2.5 text-center font-mono text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {otpLoading ? 'Memverifikasi...' : 'Reset PIN & Simpan'}
                  </button>
                </div>
              )}

              {otpMessage && (
                <div className="text-xs text-center text-zinc-300 bg-white/5 p-2.5 rounded-xl border border-white/10">
                  {otpMessage}
                </div>
              )}

              <button
                type="button"
                onClick={() => { setIsForgotPinOpen(false); setOtpStep(1); setOtpMessage(''); }}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 pt-2 cursor-pointer"
              >
                &larr; Kembali ke Layar Masuk
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-center items-center gap-2 text-[11px] font-mono text-zinc-500 relative z-10">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Supabase Cloud REST API & Web Crypto SHA-256</span>
          </div>
        </div>
      </main>
    </>
  );
}

  // ==========================================
  // MAIN AUTHENTICATED OBSERVABILITY DASHBOARD
  // ==========================================
  return (
    <>
      <InteractiveScrollBackground />
      <main className="w-full min-h-screen relative z-10 pb-20 bg-transparent text-zinc-900 dark:text-white font-sans">


      {/* Top Header Controls Bar (Sleek Compact Navbar with Smart Auto-Hide) */}
      <header className={`fixed top-0 inset-x-0 z-50 w-full liquid-glass-nav border-b border-white/10 transition-transform duration-300 ease-in-out ${
        dashboardNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isLiveConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
                Admin Observability
              </h1>
            </div>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
              {isLiveConnected ? 'Supabase Live' : 'Local Cache'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
            {/* Theme Toggle Button */}
            <button
              onClick={handleThemeToggle}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </button>

            <button
              onClick={handleSendPing}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-medium text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Kirim event tes langsung ke Supabase"
            >
              <Zap className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
              <span className="hidden sm:inline">Uji Ping</span>
            </button>

            <button
              onClick={() => setIsChangePinOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Ubah Master PIN"
            >
              <KeyRound className="w-3 h-3 text-purple-500 dark:text-purple-400" />
              <span className="hidden sm:inline">Ubah PIN</span>
            </button>

            <button
              onClick={fetchTelemetryData}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-medium text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Keluar dari Admin"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 space-y-8">

        {pingStatus && (
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono text-cyan-300 text-center animate-fade-in">
            {pingStatus}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. 5 BENTO KPI METRIC CARDS WITH TIME RANGE FILTER */}
        {/* ========================================================================= */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Ringkasan Metrik Kunci (KPI Telemetry)</h2>
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px] font-mono">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: '7d', label: '7 Hari' },
                { id: '14d', label: '14 Hari' },
                { id: '30d', label: '30 Hari' },
                { id: 'all', label: 'Semua' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setKpiRange(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${kpiRange === tab.id ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-zinc-400 hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Page Views */}
            <div className="p-5 liquid-glass liquid-glass-hover flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Total Page Views</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{totalViews}</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live Visitor Impressions
              </div>
            </div>

            {/* Card 2: Unique Visitors */}
            <div className="p-5 liquid-glass liquid-glass-hover flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Pengunjung Unik</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{uniqueVisitors}</div>
              <div className="text-[10px] font-mono text-purple-400 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Unique Session IDs
              </div>
            </div>

            {/* Card 3: Link Clicks */}
            <div className="p-5 liquid-glass liquid-glass-hover flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Total Klik Tautan</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{totalClicks}</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <MousePointerClick className="w-3 h-3" /> External & UI Actions
              </div>
            </div>

            {/* Card 4: Contact Conversions */}
            <div className="p-5 liquid-glass liquid-glass-hover flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Konversi Kontak</span>
                <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{contactSubmissions}</div>
              <div className="text-[10px] font-mono text-pink-400 mt-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> WA & Email Inquiries
              </div>
            </div>

            {/* Card 5: Interactivity Ratio */}
            <div className="p-5 liquid-glass liquid-glass-hover flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Rasio Interaktivitas</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{interactivityRatio}</div>
              <div className="text-[10px] font-mono text-indigo-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Action to View Rate
              </div>
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 2. TOP ROW CHARTS: TRAFFIC VELOCITY & CLICK DISTRIBUTION */}
        {/* ========================================================================= */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Traffic Velocity Line Chart */}
          <div className="lg:col-span-7 p-6 liquid-glass space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Tren Kunjungan Portofolio (Traffic Velocity)</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Perbandingan Page Views vs Pengunjung Unik harian</p>
              </div>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
                {[
                  { id: '7d', label: '7 Hari' },
                  { id: '14d', label: '14 Hari' },
                  { id: '30d', label: '30 Hari' },
                  { id: 'all', label: 'Semua' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setChartRange(tab.id)}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${chartRange === tab.id ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Chart 2: Link Click Distribution Bar Chart */}
          <div className="lg:col-span-5 p-6 liquid-glass space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-purple-400" />
                  <span>Distribusi Klik Tautan & Aksi</span>
                </h3>
                <p className="text-[11px] text-zinc-400">9 Kategori Interaksi Utama Pengguna</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <Bar data={barChartData} options={barChartOptions} plugins={[alwaysShowDataLabelPlugin]} />
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 3. 4-CARD INTELLIGENCE GRID: PLATFORM, PROJECTS, CERTS, REFERRERS */}
        {/* ========================================================================= */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Analisis Intelijen Platform & Konten</h2>
            </div>
            <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-black/40 p-1 rounded-xl border border-zinc-300/80 dark:border-white/10 text-[11px] font-mono">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: '7d', label: '7 Hari' },
                { id: '30d', label: '30 Hari' },
                { id: 'all', label: 'Semua' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setGridRange(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${gridRange === tab.id ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-500/30' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Intel Card 1: Rasio Perangkat */}
            <div className="p-6 liquid-glass flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Rasio Perangkat</span>
                </h3>
              </div>

              <div className="h-36 w-full flex items-center justify-center">
                <Doughnut data={deviceDoughnutData} options={{ responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } } }} />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5"><Monitor className="w-3 h-3 text-cyan-500 dark:text-cyan-400" /> Desktop</span>
                  <span className="font-mono text-cyan-700 dark:text-cyan-300 font-semibold">{deviceStats.desktopPct}% ({deviceStats.desktop})</span>
                </div>
                <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5"><Smartphone className="w-3 h-3 text-purple-500 dark:text-purple-400" /> Mobile</span>
                  <span className="font-mono text-purple-700 dark:text-purple-300 font-semibold">{deviceStats.mobilePct}% ({deviceStats.mobile})</span>
                </div>
                <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5"><Tablet className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Tablet</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">{deviceStats.tabletPct}% ({deviceStats.tablet})</span>
                </div>
              </div>
            </div>

            {/* Intel Card 2: Repositori Proyek Unggulan */}
            <div className="p-6 liquid-glass flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span>Proyek Terpopuler</span>
                </h3>
              </div>

              <div className="space-y-3">
                {topProjects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-800 dark:text-zinc-300 truncate max-w-42.5">{proj.name}</span>
                      <span className="font-mono text-purple-700 dark:text-purple-300 font-semibold">{proj.count}x</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-linear-to-r from-purple-500 to-cyan-500 transition-all duration-500" style={{ width: `${proj.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intel Card 3: Sertifikat Paling Diminati */}
            <div className="p-6 liquid-glass flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Sertifikat Diminati</span>
                </h3>
              </div>

              <div className="space-y-3">
                {topCertificates.map((cert, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-800 dark:text-zinc-300 truncate max-w-42.5">{cert.name}</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">{cert.count}x</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${cert.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intel Card 4: Saluran Trafik & Referrer */}
            <div className="p-6 liquid-glass flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Saluran Trafik (Referrer)</span>
                </h3>
              </div>

              <div className="space-y-3">
                {topReferrers.map((ref, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-800 dark:text-zinc-300 truncate max-w-42.5">{ref.name}</span>
                      <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold">{ref.count}x</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-linear-to-r from-indigo-500 to-pink-500 transition-all duration-500" style={{ width: `${ref.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 4. AI MODELS MULTI-TIER MATRIX & INFERENCE MONITORING */}
        {/* ========================================================================= */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5 }} className="p-6 liquid-glass space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Pemantauan Eksekusi AI Multi-Model</h2>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Multi-Tier Smart Inference Cascades (OpenRouter, Ollama Cloud & OpenCode Zen)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300">
                Total Inferensi: <strong>{aiModelsStats.totalAIQueries}x</strong>
              </span>

              <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-black/40 p-1 rounded-xl border border-zinc-300/80 dark:border-white/10 text-[10px] font-mono">
                {[
                  { id: 'today', label: 'Hari Ini' },
                  { id: '7d', label: '7 Hari' },
                  { id: '30d', label: '30 Hari' },
                  { id: 'all', label: 'Semua' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAiModelsRange(tab.id)}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${aiModelsRange === tab.id ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-300 dark:border-cyan-500/30' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Standalone Full-Width Auto Gateway Router Banner */}
          <div className="p-5 rounded-2xl border border-cyan-300 dark:border-cyan-500/30 bg-linear-to-r from-cyan-50 dark:from-cyan-950/40 via-indigo-50 dark:via-slate-900/50 to-purple-50 dark:to-indigo-950/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  SMART AUTO GATEWAY
                </span>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">Automatic Load-Balancing & Failover</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Auto Gateway Router (Smart Cascades)</h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-2xl">
                Routing otomatis cerdas yang mendeteksi latensi, kuota, dan kapabilitas kueri pengguna untuk mengarahkan ke model AI terbaik secara real-time.
              </p>
            </div>

            <div className="text-right shrink-0 bg-white/80 dark:bg-black/40 px-5 py-3 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <div className="text-[10px] uppercase font-mono text-zinc-500 dark:text-zinc-400">Total Resolusi Router</div>
              <div className="text-2xl font-bold font-mono text-cyan-700 dark:text-cyan-300">{aiModelsStats.autoRouterCount}x</div>
            </div>
          </div>

          {/* Dynamic 16-Model Sorted Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiModelsStats.models.map((m, idx) => {
              const isLatestUsed = idx === 0 && (m.count > 0 || m.lastUsedAt > 0);
              return (
                <div 
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isLatestUsed 
                      ? 'border-cyan-300 dark:border-cyan-400/50 bg-cyan-50 dark:bg-cyan-950/30 shadow-[0_10px_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-300 dark:ring-cyan-500/40' 
                      : 'bg-white/70 dark:bg-white/3 border-zinc-200/80 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">#{idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        {isLatestUsed && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400" /> AKTIF TERBARU
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold border ${m.badgeClass}`}>
                          {m.provider}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">{m.name}</h4>
                      <p className="text-[10px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">{m.desc}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">Total Eksekusi</span>
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{m.count}x</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 5. AI LONG-TERM MEMORY EXPLORER (Supabase Continuous RAG) */}
        {/* ========================================================================= */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5 }} className="p-6 liquid-glass space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Memori Jangka Panjang AI (Continuous RAG Knowledge)</h2>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Fakta dan pengetahuan kontekstual yang dipelajari AI dari sesi pengguna dan dipersistenkan di Supabase
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari fakta pengetahuan RAG..."
                  value={ragSearchTerm}
                  onChange={(e) => { setRagSearchTerm(e.target.value); setMemoryCurrentPage(1); }}
                  className="pl-8 pr-3 py-1.5 liquid-glass-inset border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 w-full sm:w-56"
                />
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shrink-0">
                {filteredMemories.length} Fakta Aktif
              </span>

              <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-black/40 p-1 rounded-xl border border-zinc-300/80 dark:border-white/10 text-[10px] font-mono">
                {[
                  { id: 'today', label: 'Hari Ini' },
                  { id: '7d', label: '7 Hari' },
                  { id: 'all', label: 'Semua' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setRagMemoriesRange(tab.id); setMemoryCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${ragMemoriesRange === tab.id ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-500/30' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/10 bg-zinc-100/70 dark:bg-white/5">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Tipe Memori</th>
                  <th className="py-3 px-4">Fakta / Pengetahuan Kontekstual</th>
                  <th className="py-3 px-4">Session ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5">
                {currentMemories.length > 0 ? (
                  currentMemories.map((m, i) => (
                    <tr key={m.id || i} className="hover:bg-zinc-100/70 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {m.created_at ? new Date(m.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                          RAG KNOWLEDGE
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-white max-w-lg">
                        {m.fact_text || m.memory_text || m.content || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500 text-[10px] whitespace-nowrap">
                        {(m.session_id || 'anon').substring(0, 16)}...
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">
                      Tidak ada memori yang sesuai dengan rentang waktu filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Memories Pagination */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-white/10 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-mono">
              Halaman {memoryCurrentPage} dari {memoryTotalPages} ({filteredMemories.length} entri)
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setMemoryCurrentPage(p => Math.max(1, p - 1))}
                disabled={memoryCurrentPage === 1}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer text-xs"
              >
                &lsaquo; Sebelumnya
              </button>
              <button
                onClick={() => setMemoryCurrentPage(p => Math.min(memoryTotalPages, p + 1))}
                disabled={memoryCurrentPage === memoryTotalPages}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer text-xs"
              >
                Berikutnya &rsaquo;
              </button>
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 6. REAL-TIME ACTIVITY STREAM TABLE & EXPORT */}
        {/* ========================================================================= */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5 }} className="p-6 liquid-glass space-y-5">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white truncate">Log Aktivitas Pengunjung Terkini</h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-400 shrink-0">
                  {filteredActivityEvents.length} entri
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                Rekaman telemetri event lengkap termasuk navigasi, interaksi tombol, klik proyek, dan kueri terminal
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Ekspor sebagai CSV"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Ekspor sebagai JSON"
                >
                  <Download className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span>JSON</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-none w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari target / sesi..."
                    value={tableSearchTerm}
                    onChange={(e) => { setTableSearchTerm(e.target.value); setTableCurrentPage(1); }}
                    className="pl-8 pr-3 py-1.5 liquid-glass-inset border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 w-full sm:w-56"
                  />
                </div>

                <CustomSelect 
                  value={selectedEventType}
                  onChange={(val) => { setSelectedEventType(val); setTableCurrentPage(1); }}
                  options={[
                    { value: 'all', label: 'Semua Tipe Event' },
                    { value: 'page_view', label: 'Page View' },
                    { value: 'link_click', label: 'Link Click' },
                    { value: 'cert_filter', label: 'Cert Filter' },
                    { value: 'terminal_cmd', label: 'Terminal Command' },
                    { value: 'ai_query_resolved', label: 'AI Query Resolved' },
                    { value: 'contact_submit', label: 'Contact Submit' },
                  ]}
                />

                <CustomSelect 
                  value={tableRange}
                  onChange={(val) => { setTableRange(val); setTableCurrentPage(1); }}
                  options={[
                    { value: 'all', label: 'Semua Waktu' },
                    { value: 'today', label: 'Hari Ini' },
                    { value: '7d', label: '7 Hari Terakhir' },
                    { value: '14d', label: '14 Hari Terakhir' },
                    { value: '30d', label: '30 Hari Terakhir' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-white/10 bg-zinc-100/70 dark:bg-white/5">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Tipe Event</th>
                  <th className="py-3 px-4">Aksi / Target Interaksi</th>
                  <th className="py-3 px-4">Perangkat</th>
                  <th className="py-3 px-4">Sesi ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5">
                {currentActivityEvents.length > 0 ? (
                  currentActivityEvents.map((ev, i) => {
                    const targetText = ev.event_label ? `${ev.event_target} (${ev.event_label})` : (ev.event_target || '—');
                    return (
                      <tr key={ev.id || i} className="hover:bg-zinc-100/70 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {ev.created_at ? new Date(ev.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 text-cyan-800 dark:text-cyan-300">
                            {ev.event_type || 'event'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900 dark:text-white max-w-md">
                          {targetText}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {ev.device_type || 'desktop'}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500 text-[10px] whitespace-nowrap">
                          {(ev.session_id || 'sess').substring(0, 16)}...
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      Tidak ada data aktivitas yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Activity Table Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/10 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-mono">
              Halaman {tableCurrentPage} dari {activityTotalPages} ({filteredActivityEvents.length} entri)
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setTableCurrentPage(p => Math.max(1, p - 1))}
                disabled={tableCurrentPage === 1}
                className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer text-xs"
              >
                &lsaquo; Sebelumnya
              </button>
              <button
                onClick={() => setTableCurrentPage(p => Math.min(activityTotalPages, p + 1))}
                disabled={tableCurrentPage === activityTotalPages}
                className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer text-xs"
              >
                Berikutnya &rsaquo;
              </button>
            </div>
          </div>
        </motion.section>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: UBAH MASTER PIN */}
      {/* ========================================================================= */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl glass-backdrop-in">
          <div className="w-full max-w-md liquid-glass-strong p-6 space-y-5 relative">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Ubah Master PIN Dashboard</h3>
              </div>
              <button
                onClick={() => setIsChangePinOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Master PIN Saat Ini</label>
                <input
                  type="password"
                  value={currentPinChange}
                  onChange={(e) => setCurrentPinChange(e.target.value)}
                  placeholder="PIN Saat Ini"
                  aria-label="Master PIN saat ini"
                  className="w-full liquid-glass-inset border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Master PIN Baru (Min 6 Digit)</label>
                <input
                  type="password"
                  value={newPinChange}
                  onChange={(e) => setNewPinChange(e.target.value)}
                  placeholder="PIN Baru"
                  aria-label="Master PIN baru (minimal 6 digit)"
                  maxLength={8}
                  className="w-full liquid-glass-inset border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Konfirmasi Master PIN Baru</label>
                <input
                  type="password"
                  value={confirmPinChange}
                  onChange={(e) => setConfirmPinChange(e.target.value)}
                  placeholder="Ulangi PIN Baru"
                  aria-label="Konfirmasi master PIN baru"
                  maxLength={8}
                  className="w-full liquid-glass-inset border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              {changePinMessage && (
                <div className="text-xs text-center text-zinc-300 bg-white/5 p-2.5 rounded-xl border border-white/10">
                  {changePinMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold cursor-pointer"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Smooth Scroll to Top Button for Admin */}
      <button
        onClick={() => {
          if (window.__lenis) {
            window.__lenis.scrollTo(0, { duration: 1 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full liquid-glass-strong liquid-glass-pill liquid-press text-zinc-400 hover:text-white hover:border-cyan-500/40 flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-lg cursor-pointer"
        aria-label="Scroll ke Atas"
        title="Kembali ke Atas Dashboard"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      </button>

    </main>
    </>
  );
}
