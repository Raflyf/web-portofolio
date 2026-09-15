import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Activity, Users, MousePointerClick, MessageSquare, Shield,
  RefreshCw, Search, LogOut, Cpu, KeyRound, CheckCircle2, AlertCircle,
  Download, Globe, Sun, Moon, Monitor, Smartphone, Tablet, Lock,
} from 'lucide-react';
import { useLanguage } from '../../src/context/LanguageContext.jsx';
import { telemetry } from '../../src/lib/telemetry.js';
import { Reveal } from './reveal.jsx';

const PIN_SALT = 'rafly_telemetry_salt';
const SESSION_AUTH_KEY = 'dash_admin_auth_session';

async function sha256(message) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function rangeCutoff(range) {
  if (range === 'all') return 0;
  if (range === 'today') {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
  return Date.now() - days * 86400000;
}

const inRange = (items, range) => {
  const cut = rangeCutoff(range);
  if (!cut) return items;
  return items.filter((e) => new Date(e.created_at || 0).getTime() >= cut);
};

/* Lightweight SVG area chart (views + visitors) */
function TrafficChart({ labels, views, visitors }) {
  const W = 640;
  const H = 220;
  const P = 28;
  const max = Math.max(1, ...views, ...visitors);
  const x = (i) => P + (i * (W - P * 2)) / Math.max(1, labels.length - 1);
  const y = (v) => H - P - (v / max) * (H - P * 2);
  const line = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = (arr) => `${line(arr)} L${x(arr.length - 1).toFixed(1)},${H - P} L${x(0).toFixed(1)},${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Grafik trafik kunjungan">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={P} x2={W - P} y1={H - P - f * (H - P * 2)} y2={H - P - f * (H - P * 2)} stroke="var(--border)" strokeWidth="1" />
      ))}
      <path d={area(views)} fill="rgba(34,211,238,0.14)" />
      <path d={line(views)} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d={line(visitors)} fill="none" stroke="var(--ok)" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
      {views.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--accent)" />
      ))}
    </svg>
  );
}

function Donut({ parts }) {
  const total = Math.max(1, parts.reduce((a, p) => a + p.value, 0));
  let acc = 0;
  const R = 54;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 140 140" className="w-36 h-36" role="img" aria-label="Distribusi perangkat">
      <circle cx="70" cy="70" r={R} fill="none" stroke="var(--border)" strokeWidth="16" />
      {parts.map((p) => {
        const frac = p.value / total;
        const el = (
          <circle
            key={p.label} cx="70" cy="70" r={R} fill="none" stroke={p.color} strokeWidth="16"
            strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`}
            strokeDashoffset={(-acc * C).toFixed(1)}
            transform="rotate(-90 70 70)" strokeLinecap="butt"
          />
        );
        acc += frac;
        return el;
      })}
      <text x="70" y="70" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="800" fill="var(--ink)">{total}</text>
    </svg>
  );
}

function BarList({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.name}>
          <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
            <span className="font-medium truncate">{r.name}</span>
            <span className="font-mono shrink-0" style={{ color: 'var(--faint)' }}>{r.count}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }} role="progressbar" aria-valuenow={r.count} aria-valuemin={0} aria-valuemax={max} aria-label={r.name}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((r.count / max) * 100)}%`, background: 'var(--accent)' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RangeTabs({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist">
      {options.map((o) => (
        <button
          key={o.value} type="button" role="tab" aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className="chip !py-1.5 text-[11px] font-semibold"
          style={value === o.value ? { borderColor: 'var(--accent)', color: 'var(--accent-ink)' } : undefined}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const RANGES = [
  { value: 'today', label: 'Hari ini' },
  { value: '7d', label: '7 hari' },
  { value: '14d', label: '14 hari' },
  { value: '30d', label: '30 hari' },
  { value: 'all', label: 'Semua' },
];

export default function Dashboard() {
  const { language, toggleLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const [authed, setAuthed] = useState(() => {
    try {
      return !!JSON.parse(sessionStorage.getItem(SESSION_AUTH_KEY) || 'null')?.auth;
    } catch { return false; }
  });
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [lockout, setLockout] = useState(0);
  const fails = useRef(0);

  const [events, setEvents] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(true);

  const [kpiRange, setKpiRange] = useState('all');
  const [chartRange, setChartRange] = useState('7d');
  const [gridRange, setGridRange] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [memPage, setMemPage] = useState(1);
  const [memQ, setMemQ] = useState('');
  const [ping, setPing] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [curPin, setCurPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changeMsg, setChangeMsg] = useState('');
  const forgotRef = useRef(null);
  const changeRef = useRef(null);

  useEffect(() => { telemetry.init(); }, []);
  useEffect(() => {
    if (lockout <= 0) return;
    const id = setInterval(() => setLockout((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [lockout]);
  useEffect(() => { if (forgotOpen) forgotRef.current?.showModal(); else if (forgotRef.current?.open) forgotRef.current.close(); }, [forgotOpen]);
  useEffect(() => { if (changeOpen) changeRef.current?.showModal(); else if (changeRef.current?.open) changeRef.current.close(); }, [changeOpen]);

  const themeToggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('portfolio-theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
    setIsDark(next);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let token = '';
      try { token = JSON.parse(sessionStorage.getItem(SESSION_AUTH_KEY) || '{}')?.session_token || ''; } catch { /* ignore */ }
      const res = await fetch('/api/dashboard-data', { headers: { Accept: 'application/json', 'X-Admin-Token': token } });
      if (res.status === 401) {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        setAuthed(false);
        setAuthError(language === 'id' ? 'Sesi admin kedaluwarsa (24 jam). Masukkan kembali Master PIN.' : 'Admin session expired (24h). Re-enter your Master PIN.');
        return;
      }
      if (!res.ok) throw new Error('fetch-failed');
      const payload = await res.json();
      if (Array.isArray(payload.events)) setEvents(payload.incremental && events.length ? merge(events, payload.events) : payload.events);
      if (Array.isArray(payload.memories)) setMemories(payload.incremental && memories.length ? merge(memories, payload.memories) : payload.memories);
      setLive(true);
    } catch {
      setLive(false);
      try {
        const local = JSON.parse(localStorage.getItem('portfolio_telemetry_events') || '[]');
        if (Array.isArray(local) && events.length === 0) setEvents(local);
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  function merge(prev, next) {
    const seen = new Set(prev.map((e) => e?.id));
    const add = (next || []).filter((e) => e?.id && !seen.has(e.id));
    return [...add, ...prev];
  }

  useEffect(() => {
    if (!authed) return;
    fetchData();
    const id = setInterval(() => { if (!document.hidden) fetchData(); }, 30000);
    const onVis = () => { if (!document.hidden) fetchData(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const login = async (e) => {
    e.preventDefault();
    if (!pin || lockout > 0) return;
    try {
      const hash = await sha256(pin + PIN_SALT);
      const res = await fetch('/api/admin-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', pin_hash: hash }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.verified && data?.session_token) {
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ auth: true, session_token: data.session_token, timestamp: Date.now() }));
        setAuthed(true);
        setAuthError('');
        fails.current = 0;
        setPin('');
      } else {
        fails.current += 1;
        if (fails.current >= 5) {
          setLockout(60);
          setAuthError('Terlalu banyak percobaan salah. Terkunci 60 detik.');
        } else {
          setAuthError(data?.message || `Master PIN tidak valid. Percobaan ${fails.current}/5.`);
        }
      }
    } catch {
      setAuthError('Kesalahan sistem kriptografi internal.');
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setAuthed(false);
    setPin('');
    setEvents([]);
    setMemories([]);
  };

  /* ---------- metrics ---------- */
  const kpi = useMemo(() => inRange(events, kpiRange), [events, kpiRange]);
  const views = kpi.filter((e) => e.event_type === 'page_view').length;
  const visitors = new Set(kpi.map((e) => e.session_id).filter(Boolean)).size;
  const clicks = kpi.filter((e) => e.event_type !== 'page_view').length;
  const contacts = kpi.filter((e) => e.event_type === 'contact_submit' || /contact|whatsapp/.test((e.event_target || '').toLowerCase())).length;
  const ratio = views === 0 ? '0%' : `${Math.min((clicks / views) * 100, 100).toFixed(1)}%`;

  const traffic = useMemo(() => {
    const rows = inRange(events, chartRange);
    let n = chartRange === '14d' ? 14 : chartRange === '30d' ? 30 : chartRange === 'today' ? 1 : 7;
    if (chartRange === 'all') n = 30;
    const labels = [];
    const v = Array.from({ length: n }, () => 0);
    const u = Array.from({ length: n }, () => new Set());
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', n === 1 ? { hour: 'numeric' } : { weekday: 'short', day: 'numeric' }));
    }
    rows.forEach((e) => {
      const day = Math.floor((Date.now() - new Date(e.created_at || 0).getTime()) / 86400000);
      if (day >= 0 && day < n) {
        const s = n - 1 - day;
        if (e.event_type === 'page_view') v[s] += 1;
        if (e.session_id) u[s].add(e.session_id);
      }
    });
    return { labels, views: v, visitors: u.map((s) => s.size) };
  }, [events, chartRange, language]);

  const dist = useMemo(() => {
    const rows = inRange(events, chartRange);
    const cats = ['WhatsApp', 'GitHub', 'Plagiarism', 'Spam-Email', 'Laser PPT', 'FotoKita', language === 'id' ? 'Sertifikat' : 'Certificate', 'Portfolio', 'Terminal'];
    const counts = Array(cats.length).fill(0);
    rows.forEach((e) => {
      const c = `${e.event_target || ''} ${e.event_label || ''} ${e.event_type || ''}`.toLowerCase();
      if (/\b(wa|whatsapp)\b/.test(c)) counts[0]++;
      else if (/\b(github|git)\b/.test(c)) counts[1]++;
      else if (/\b(plagiarism|skripsi)\b/.test(c)) counts[2]++;
      else if (/\b(spam|email)\b/.test(c)) counts[3]++;
      else if (/\b(laser|ppt)\b/.test(c)) counts[4]++;
      else if (/\b(fotokita|foto)\b/.test(c)) counts[5]++;
      else if (/\b(cert|sertifikat)\b/.test(c)) counts[6]++;
      else if (/\b(portfolio|web)\b/.test(c)) counts[7]++;
      else if (/\b(terminal)\b/.test(c) || c.includes('ai_')) counts[8]++;
    });
    return cats.map((name, i) => ({ name, count: counts[i] }));
  }, [events, chartRange, language]);

  const grid = useMemo(() => inRange(events, gridRange), [events, gridRange]);
  const devices = useMemo(() => {
    let d = 0;
    let m = 0;
    let tb = 0;
    grid.forEach((e) => {
      const t = (e.device_type || '').toLowerCase();
      if (t.includes('mob')) m++;
      else if (t.includes('tab')) tb++;
      else d++;
    });
    return { d, m, tb };
  }, [grid]);

  const rank = (match) => {
    const map = {};
    grid.forEach((e) => {
      const target = `${e.event_target || ''} ${e.event_label || ''}`.toLowerCase();
      for (const [name, keys] of match) {
        if (keys.some((k) => target.includes(k))) {
          map[name] = (map[name] || 0) + 1;
          break;
        }
      }
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  };
  const topProjects = rank([
    ['Plagiarism Checker Skripsi', ['plagiarism', 'skripsi']],
    ['Spam Email AI Classifier', ['spam', 'email']],
    ['Laser PPT Controller', ['laser', 'ppt']],
    ['FotoKita Studio', ['fotokita', 'studio']],
    ['Observability Dashboard', ['dashboard', 'telemetry']],
  ]);
  const topCerts = rank([
    ['MikroTik MTCNA', ['mtcna', 'mikrotik']],
    ['Deep Learning & NLP', ['deep learning', 'nlp']],
    ['Cloud & DevOps', ['cloud', 'devops']],
    ['Cybersecurity', ['cyber', 'security']],
    ['Fullstack Web', ['fullstack', 'react']],
  ]);
  const providers = useMemo(() => {
    const rows = inRange(events, 'all');
    const out = { 'Ollama Cloud': 0, OpenRouter: 0, OpenCode: 0, Lainnya: 0 };
    let total = 0;
    rows.forEach((e) => {
      const c = `${e.event_target || ''} ${e.event_label || ''} ${e.event_type || ''}`.toLowerCase();
      const ai = e.event_type === 'ai_query_resolved' || e.event_type === 'ai_chat' || c.includes('ai_') || c.startsWith('terminal_cmd ai:') || c.includes('chat:') || c.includes('ask:');
      if (!ai) return;
      total++;
      if (c.includes('ollama')) out['Ollama Cloud']++;
      else if (c.includes('openrouter')) out.OpenRouter++;
      else if (c.includes('opencode') || c.includes('laguna') || c.includes('mimo')) out.OpenCode++;
      else out.Lainnya++;
    });
    return { total, rows: Object.entries(out).map(([name, count]) => ({ name, count })) };
  }, [events]);

  const tableRows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return events.filter((e) => {
      if (typeFilter !== 'all' && e.event_type !== typeFilter) return false;
      if (!needle) return true;
      return `${e.event_type || ''} ${e.event_target || ''} ${e.event_label || ''}`.toLowerCase().includes(needle);
    });
  }, [events, typeFilter, q]);
  const typeOptions = useMemo(() => ['all', ...new Set(events.map((e) => e.event_type).filter(Boolean))].slice(0, 12), [events]);
  const pages = Math.max(1, Math.ceil(tableRows.length / 8));
  const pageRows = tableRows.slice((page - 1) * 8, page * 8);

  const memRows = useMemo(() => {
    const needle = memQ.trim().toLowerCase();
    return memories.filter((m) => !needle || `${m.content || m.memory || ''} ${m.topic || ''}`.toLowerCase().includes(needle));
  }, [memories, memQ]);
  const memPages = Math.max(1, Math.ceil(memRows.length / 5));
  const memSlice = memRows.slice((memPage - 1) * 5, memPage * 5);

  const exportCsv = () => {
    if (!events.length) return;
    const head = ['id', 'created_at', 'event_type', 'event_target', 'event_label', 'device_type', 'session_id'];
    const lines = [head.join(',')];
    events.forEach((e) => lines.push(head.map((h) => `"${String(e[h] ?? '').replace(/"/g, '""')}"`).join(',')));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportJson = () => {
    if (!events.length) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const sendPing = async () => {
    setPing('Mengirim ping…');
    try {
      telemetry.logEvent('ping_test', 'Admin Dashboard', 'Observability Manual Ping Test');
      await fetchData();
      setPing('Ping terkirim, telemetri diperbarui.');
    } catch {
      setPing('Ping gagal: gangguan jaringan.');
    }
    setTimeout(() => setPing(''), 4000);
  };

  /* ---------- PIN gate ---------- */
  if (!authed) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-4 relative z-10">
        <Reveal className="glass-strong w-full max-w-sm p-8 space-y-5">
          <span className="inset w-12 h-12 inline-flex items-center justify-center !rounded-2xl">
            <Lock className="w-5 h-5 accent" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Dashboard Observabilitas</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{language === 'id' ? 'Area admin. Masukkan Master PIN.' : 'Admin area. Enter the Master PIN.'}</p>
          </div>
          <form onSubmit={login} className="space-y-3">
            <label htmlFor="v2-pin" className="text-xs font-semibold">Master PIN</label>
            <input id="v2-pin" type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(e) => setPin(e.target.value)} className="field font-mono tracking-[0.3em] text-center" placeholder="••••" disabled={lockout > 0} />
            {authError && <p role="alert" className="text-xs flex items-start gap-1.5" style={{ color: '#f87171' }}><AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />{authError}</p>}
            <button type="submit" disabled={!pin || lockout > 0} className="btn-primary w-full disabled:opacity-50">
              {lockout > 0 ? `Terkunci ${lockout}s` : 'Masuk'}
            </button>
          </form>
          <div className="flex items-center justify-between text-xs">
            <Link to="/" className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"><ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />Beranda</Link>
            <button type="button" onClick={() => { setForgotOpen(true); setOtpStep(1); setOtpMsg(''); }} className="accent hover:underline underline-offset-4">Lupa PIN?</button>
          </div>
        </Reveal>

        <dialog ref={forgotRef} onClose={() => setForgotOpen(false)} aria-labelledby="v2-forgot-t" className="glass-strong p-0 w-[min(92vw,26rem)]" style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
          <form method="dialog" className="p-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <h2 id="v2-forgot-t" className="font-bold">Reset Master PIN via OTP</h2>
            {otpStep === 1 ? (
              <>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Kode OTP dikirim ke email admin terdaftar.</p>
                <button type="button" disabled={otpBusy} className="btn-primary w-full disabled:opacity-50" onClick={async () => {
                  setOtpBusy(true);
                  setOtpMsg('');
                  try {
                    const r = await fetch('/api/admin-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send_otp' }) });
                    const d = await r.json().catch(() => ({}));
                    if (r.ok && d.success) { setOtpStep(2); setOtpMsg('OTP terkirim.'); }
                    else setOtpMsg(d.error || 'Gagal mengirim OTP.');
                  } catch { setOtpMsg('Koneksi API terganggu.'); }
                  finally { setOtpBusy(false); }
                }}>Kirim OTP</button>
              </>
            ) : (
              <>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} className="field font-mono tracking-[0.3em] text-center" placeholder="OTP 6 digit" inputMode="numeric" aria-label="Kode OTP" />
                <input value={newPin} onChange={(e) => setNewPin(e.target.value)} className="field font-mono tracking-[0.3em] text-center" placeholder="PIN baru 4–8 digit" inputMode="numeric" aria-label="PIN baru" />
                <button type="button" disabled={otpBusy} className="btn-primary w-full disabled:opacity-50" onClick={async () => {
                  setOtpBusy(true);
                  setOtpMsg('');
                  try {
                    const r = await fetch('/api/admin-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify_otp_and_reset_pin', otp_code: otp, new_pin: newPin }) });
                    const d = await r.json().catch(() => ({}));
                    if (r.ok && d.success) { setOtpMsg('PIN direset. Silakan masuk.'); setTimeout(() => setForgotOpen(false), 1500); }
                    else setOtpMsg(d.error || 'OTP salah atau kedaluwarsa.');
                  } catch { setOtpMsg('Gagal memverifikasi OTP.'); }
                  finally { setOtpBusy(false); }
                }}>Verifikasi & Reset</button>
              </>
            )}
            {otpMsg && <p role="status" className="text-xs" style={{ color: 'var(--muted)' }}>{otpMsg}</p>}
            <button type="button" onClick={() => setForgotOpen(false)} className="btn-ghost w-full !py-2.5 text-sm">Tutup</button>
          </form>
        </dialog>
      </main>
    );
  }

  const kpis = [
    { icon: Activity, label: language === 'id' ? 'Kunjungan' : 'Page views', value: views },
    { icon: Users, label: language === 'id' ? 'Pengunjung unik' : 'Unique visitors', value: visitors },
    { icon: MousePointerClick, label: language === 'id' ? 'Klik / aksi' : 'Clicks / actions', value: clicks },
    { icon: MessageSquare, label: language === 'id' ? 'Kontak masuk' : 'Contact submits', value: contacts },
  ];

  return (
    <main className="w-full relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-6">
      {/* header */}
      <Reveal className="nav-shell !rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="inset w-9 h-9 !rounded-xl inline-flex items-center justify-center" aria-label="Kembali ke beranda">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold leading-tight flex items-center gap-2">
              <Shield className="w-4 h-4 accent" aria-hidden="true" />
              Dashboard Observabilitas
              <span className="chip text-[10px] font-mono" style={live ? { color: 'var(--ok)' } : { color: '#f87171' }}>
                <span className="dot-live" style={!live ? { background: '#f87171', boxShadow: '0 0 8px #f87171' } : undefined} aria-hidden="true" />
                {live ? 'LIVE' : 'OFFLINE'}
              </span>
            </h1>
            <p className="text-[11px] font-mono" style={{ color: 'var(--faint)' }}>{events.length} events • {memories.length} memories • v2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleLanguage} className="chip text-[11px] font-mono font-bold" aria-label={t('nav.switchLanguage')}>
            <Globe className="w-3.5 h-3.5 accent" aria-hidden="true" />
            {language === 'id' ? 'ID / EN' : 'EN / ID'}
          </button>
          <button type="button" onClick={themeToggle} className="inset w-9 h-9 !rounded-xl inline-flex items-center justify-center" aria-label={t('nav.themeToggle')}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => { setChangeOpen(true); setChangeMsg(''); }} className="inset w-9 h-9 !rounded-xl inline-flex items-center justify-center" aria-label="Ubah PIN">
            <KeyRound className="w-4 h-4" />
          </button>
          <button type="button" onClick={fetchData} className="inset w-9 h-9 !rounded-xl inline-flex items-center justify-center" aria-label="Muat ulang data">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={logout} className="inset w-9 h-9 !rounded-xl inline-flex items-center justify-center" aria-label="Keluar">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </Reveal>

      {/* KPI */}
      <section aria-label="Indikator utama">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider eyebrow">Ringkasan</h2>
          <RangeTabs value={kpiRange} onChange={setKpiRange} options={RANGES} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="glass card-lift p-5">
              <k.icon className="w-5 h-5 accent" aria-hidden="true" />
              <p className="text-3xl font-extrabold mt-2 tabular-nums">{k.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{k.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-mono mt-2" style={{ color: 'var(--faint)' }}>Rasio interaktivitas: {ratio}</p>
      </section>

      {/* traffic + distribution */}
      <section className="grid lg:grid-cols-12 gap-4">
        <div className="glass p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-bold text-sm">Kecepatan trafik</h2>
            <RangeTabs value={chartRange} onChange={setChartRange} options={RANGES.filter((r) => r.value !== 'today')} />
          </div>
          <TrafficChart labels={traffic.labels} views={traffic.views} visitors={traffic.visitors} />
          <div className="flex gap-4 mt-3 text-[11px]" style={{ color: 'var(--faint)' }}>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block" style={{ background: 'var(--accent)' }} />Kunjungan</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block" style={{ background: 'var(--ok)' }} />Unik</span>
          </div>
        </div>
        <div className="glass p-6 lg:col-span-5">
          <h2 className="font-bold text-sm mb-4">Distribusi klik</h2>
          <BarList rows={dist} />
        </div>
      </section>

      {/* intel grid */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider eyebrow">Intelijen audiens</h2>
          <RangeTabs value={gridRange} onChange={setGridRange} options={RANGES} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-6 flex items-center gap-4">
            <Donut parts={[
              { label: 'Desktop', value: devices.d, color: '#22d3ee' },
              { label: 'Mobile', value: devices.m, color: '#a5b4fc' },
              { label: 'Tablet', value: devices.tb, color: '#34d399' },
            ]} />
            <ul className="text-xs space-y-1.5">
              <li className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" aria-hidden="true" />Desktop · {devices.d}</li>
              <li className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" aria-hidden="true" />Mobile · {devices.m}</li>
              <li className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5" aria-hidden="true" />Tablet · {devices.tb}</li>
            </ul>
          </div>
          <div className="glass p-6">
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--faint)' }}>Proyek teratas</h3>
            <BarList rows={topProjects.length ? topProjects : [{ name: 'Belum ada data', count: 0 }]} />
          </div>
          <div className="glass p-6">
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--faint)' }}>Sertifikat teratas</h3>
            <BarList rows={topCerts.length ? topCerts : [{ name: 'Belum ada data', count: 0 }]} />
          </div>
          <div className="glass p-6">
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--faint)' }}><Cpu className="w-3.5 h-3.5" aria-hidden="true" />Model AI · {providers.total} query</h3>
            <BarList rows={providers.rows} />
          </div>
        </div>
      </section>

      {/* activity table */}
      <section className="glass p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-sm">Aktivitas ({tableRows.length})</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--faint)' }} aria-hidden="true" />
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="field !py-2 !pl-9 !w-52" placeholder="Cari…" aria-label="Cari aktivitas" />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="field !py-2 !w-auto text-xs" aria-label="Filter tipe event">
              {typeOptions.map((o) => <option key={o} value={o}>{o === 'all' ? 'Semua tipe' : o}</option>)}
            </select>
            <button type="button" onClick={exportCsv} className="btn-ghost !py-2 !px-4 text-xs" disabled={!events.length}>
              <Download className="w-3.5 h-3.5" aria-hidden="true" />CSV
            </button>
            <button type="button" onClick={exportJson} className="btn-ghost !py-2 !px-4 text-xs" disabled={!events.length}>
              <Download className="w-3.5 h-3.5" aria-hidden="true" />JSON
            </button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="text-left" style={{ color: 'var(--faint)' }}>
                <th className="py-2 pr-3 font-semibold">Waktu</th>
                <th className="py-2 pr-3 font-semibold">Tipe</th>
                <th className="py-2 pr-3 font-semibold">Target</th>
                <th className="py-2 pr-3 font-semibold">Label</th>
                <th className="py-2 font-semibold">Perangkat</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e) => (
                <tr key={e.id || `${e.created_at}-${e.session_id}`} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-2.5 pr-3 font-mono whitespace-nowrap" style={{ color: 'var(--faint)' }}>{new Date(e.created_at || 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-2.5 pr-3 font-mono accent">{e.event_type}</td>
                  <td className="py-2.5 pr-3 max-w-52 truncate">{e.event_target}</td>
                  <td className="py-2.5 pr-3 max-w-64 truncate" style={{ color: 'var(--muted)' }}>{e.event_label}</td>
                  <td className="py-2.5" style={{ color: 'var(--muted)' }}>{e.device_type}</td>
                </tr>
              ))}
              {!pageRows.length && (
                <tr><td colSpan={5} className="py-8 text-center" style={{ color: 'var(--faint)' }}>{loading ? 'Memuat…' : 'Belum ada aktivitas.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs" style={{ color: 'var(--faint)' }}>
          <span>Halaman {page} / {pages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="chip disabled:opacity-40">←</button>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="chip disabled:opacity-40">→</button>
          </div>
        </div>
      </section>

      {/* memories + ops */}
      <section className="grid lg:grid-cols-12 gap-4">
        <div className="glass p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-bold text-sm">Memori RAG ({memRows.length})</h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--faint)' }} aria-hidden="true" />
              <input value={memQ} onChange={(e) => { setMemQ(e.target.value); setMemPage(1); }} className="field !py-2 !pl-9 !w-52" placeholder="Cari memori…" aria-label="Cari memori" />
            </div>
          </div>
          <ul className="space-y-3">
            {memSlice.map((m, i) => (
              <li key={m.id || i} className="inset p-4 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                <span className="block font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>{m.topic || m.title || 'Memori'}</span>
                {(m.content || m.memory || '').slice(0, 280)}
              </li>
            ))}
            {!memSlice.length && <li className="text-xs text-center py-6" style={{ color: 'var(--faint)' }}>Belum ada memori.</li>}
          </ul>
          <div className="flex items-center justify-between mt-4 text-xs" style={{ color: 'var(--faint)' }}>
            <span>Halaman {memPage} / {memPages}</span>
            <div className="flex gap-2">
              <button type="button" disabled={memPage <= 1} onClick={() => setMemPage((p) => p - 1)} className="chip disabled:opacity-40">←</button>
              <button type="button" disabled={memPage >= memPages} onClick={() => setMemPage((p) => p + 1)} className="chip disabled:opacity-40">→</button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <div className="glass p-6">
            <h2 className="font-bold text-sm mb-3">Observabilitas</h2>
            <button type="button" onClick={sendPing} className="btn-ghost w-full !py-2.5 text-sm">Kirim ping telemetri</button>
            {ping && <p role="status" className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color: 'var(--ok)' }}><CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />{ping}</p>}
          </div>
          <div className="glass p-6 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            <p className="font-bold text-sm mb-1.5" style={{ color: 'var(--ink)' }}>Restore v1</p>
            <p>Versi sebelumnya tersimpan di branch <code className="font-mono">backup-v1-20260916-0030</code> dan tag <code className="font-mono">v1-pre-redesign-20260916</code>. Kembalikan dengan <code className="font-mono">git checkout</code> ke branch tersebut.</p>
          </div>
        </div>
      </section>

      <dialog ref={changeRef} onClose={() => setChangeOpen(false)} aria-labelledby="v2-change-t" className="glass-strong p-0 w-[min(92vw,26rem)]" style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
        <form method="dialog" className="p-7 space-y-3.5" onSubmit={(e) => e.preventDefault()}>
          <h2 id="v2-change-t" className="font-bold">Ubah Master PIN</h2>
          <input type="password" value={curPin} onChange={(e) => setCurPin(e.target.value)} className="field font-mono" placeholder="PIN saat ini" aria-label="PIN saat ini" inputMode="numeric" />
          <input type="password" value={newPin2} onChange={(e) => setNewPin2(e.target.value)} className="field font-mono" placeholder="PIN baru 4–8 digit" aria-label="PIN baru" inputMode="numeric" />
          <input type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="field font-mono" placeholder="Konfirmasi PIN baru" aria-label="Konfirmasi PIN baru" inputMode="numeric" />
          {changeMsg && <p role="status" className="text-xs" style={{ color: 'var(--muted)' }}>{changeMsg}</p>}
          <button type="button" className="btn-primary w-full" onClick={async () => {
            setChangeMsg('');
            if (newPin2.length < 4 || newPin2.length > 8) { setChangeMsg('PIN baru harus 4–8 digit.'); return; }
            if (newPin2 !== confirmPin) { setChangeMsg('Konfirmasi PIN tidak cocok.'); return; }
            try {
              const currentHashed = await sha256(curPin + PIN_SALT);
              const r = await fetch('/api/admin-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_pin', current_pin_hash: currentHashed, new_pin: newPin2 }) });
              const d = await r.json().catch(() => ({}));
              if (!r.ok || !d.success) { setChangeMsg(d.message || d.error || 'Gagal mengubah PIN.'); return; }
              setChangeMsg('PIN diperbarui di semua device.');
              setTimeout(() => setChangeOpen(false), 1400);
            } catch { setChangeMsg('Gagal mengubah PIN.'); }
          }}>Simpan PIN baru</button>
          <button type="button" onClick={() => setChangeOpen(false)} className="btn-ghost w-full !py-2.5 text-sm">Batal</button>
        </form>
      </dialog>
    </main>
  );
}
