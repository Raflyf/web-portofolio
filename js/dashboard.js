/**
 * ============================================================================
 * RAFLY FIRMANSYAH - ADMIN TELEMETRY DASHBOARD CONTROLLER (v3.2.0)
 * Chart.js Visualizations, Web Crypto PIN Auth, Supabase REST Sync, Leaderboards
 * Inertia Smooth-Scroll Physics Engine & Anti-Cache Real-Time Polling
 * ============================================================================
 */

// Default Hash for Master PIN "140225" (SHA-256 + Salt "rafly_telemetry_salt")
const PIN_SALT = "rafly_telemetry_salt";
const DEFAULT_PIN_HASH = "8a5e8f3efcb5c98e2170327f2906b3a033f92d475ef29486c96ebcb8e3e482ad"; 
const SESSION_AUTH_KEY = "dash_admin_auth_session";
const LOCKOUT_KEY = "dash_admin_lockout_info";
const CONFIG_KEY = "portfolio_supabase_config";
const LOCAL_STORAGE_KEY = "portfolio_telemetry_events";

class DashboardApp {
  constructor() {
    this.events = [];
    this.filteredEvents = [];
    this.activeRange = '7d';
    this.charts = {};
    this.searchTerm = '';
    this.selectedEventType = 'all';
    this.pollInterval = null;
    this.supabaseConfig = this.getSupabaseConfig();
    this.memories = [];
    this.memoryCurrentPage = 1;
    this.memoryPageSize = 10;
    this.tableCurrentPage = 1;
    this.tablePageSize = 10;
  }

  cleanKey(val) {
    if (!val) return '';
    return String(val)
      .trim()
      .replace(/^['"`]+|['"`]+$/g, '')
      .replace(/;+$/, '')
      .trim();
  }

  getSupabaseConfig() {
    const defaultUrl = 'https://rphyzcqwpkxtzllvymss.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU';
    try {
      const configRaw = localStorage.getItem(CONFIG_KEY);
      if (configRaw) {
        const parsed = JSON.parse(configRaw);
        if (parsed) {
          const url = this.cleanKey(parsed.url);
          const anonKey = this.cleanKey(parsed.anonKey);
          if (url && anonKey) {
            return {
              url: url.startsWith('http') ? url.replace(/\/+$/, '') : `https://${url.replace(/\/+$/, '')}`,
              anonKey
            };
          }
        }
      }
    } catch (_) {}
    return { url: defaultUrl, anonKey: defaultKey };
  }

  async init() {
    this.initAuthGateway();
    this.initEventListeners();
    this.initInertiaSmoothWheel();
    this.initBackToTopButton();
    this.checkOmniRouteRealtimeStatus();
  }

  // =========================================================================
  // 1. CRYPTOGRAPHIC PIN AUTHENTICATION
  // =========================================================================
  async hashPin(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + PIN_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  initAuthGateway() {
    const overlay = document.getElementById('pin-gateway');
    const form = document.getElementById('pin-form');
    const input = document.getElementById('pin-input');
    const errorEl = document.getElementById('pin-error');

    // Check existing valid session (30-min auto expiry)
    const session = sessionStorage.getItem(SESSION_AUTH_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        overlay.style.display = 'none';
        this.loadDashboardData();
        this.startRealtimePolling();
        return;
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredPin = input.value.trim();

      // Check brute-force lockout
      const lockout = this.getLockoutInfo();
      if (lockout.lockedUntil && Date.now() < lockout.lockedUntil) {
        const remainingMin = Math.ceil((lockout.lockedUntil - Date.now()) / 60000);
        errorEl.textContent = `Akses terkunci sementara. Coba lagi dalam ${remainingMin} menit.`;
        errorEl.style.display = 'block';
        return;
      }

      const inputHash = await this.hashPin(enteredPin);
      const savedHash = localStorage.getItem('dash_custom_pin_hash') || DEFAULT_PIN_HASH;

      // Master PIN verification
      if (inputHash === savedHash || inputHash === DEFAULT_PIN_HASH) {
        // Success
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ auth: true, timestamp: Date.now() }));
        localStorage.removeItem(LOCKOUT_KEY);
        overlay.style.display = 'none';
        this.loadDashboardData();
        this.startRealtimePolling();
      } else {
        // Failed attempt handling
        const attempts = (lockout.attempts || 0) + 1;
        let lockedUntil = null;
        if (attempts >= 5) {
          lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
          errorEl.textContent = 'Terlalu banyak percobaan gagal. Akses dikunci 15 menit.';
        } else {
          errorEl.textContent = `PIN Salah. Sisa percobaan: ${5 - attempts}`;
        }
        localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts, lockedUntil }));
        errorEl.style.display = 'block';
        input.value = '';
        input.focus();
      }
    });
  }

  getLockoutInfo() {
    try {
      const raw = localStorage.getItem(LOCKOUT_KEY);
      return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };
    } catch {
      return { attempts: 0, lockedUntil: null };
    }
  }

  startRealtimePolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    // Real-time live background polling every 3 seconds for telemetry, and OmniRoute status check every 8 seconds
    this.checkOmniRouteRealtimeStatus();
    let pollTick = 0;
    this.pollInterval = setInterval(() => {
      this.loadDashboardData(true);
      pollTick++;
      if (pollTick % 3 === 0) {
        this.checkOmniRouteRealtimeStatus();
      }
    }, 3000);
  }

  async checkOmniRouteRealtimeStatus() {
    const pillEl = document.getElementById('omniroute-live-pill');
    const dotEl = document.getElementById('omniroute-live-dot');
    const textEl = document.getElementById('omniroute-live-text');
    if (!pillEl && !textEl) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const isOnline = Boolean(data?.omniroute?.isOnline);
      const latency = data?.omniroute?.latencyMs;

      if (isOnline) {
        if (pillEl) {
          pillEl.classList.remove('is-offline', 'is-standby');
          pillEl.classList.add('is-online');
        }
        if (dotEl) {
          dotEl.style.backgroundColor = 'var(--accent-emerald)';
          dotEl.style.boxShadow = '0 0 8px var(--accent-emerald)';
        }
        if (textEl) {
          textEl.textContent = `HOST STATUS: ACTIVE TUNNEL (${latency ? latency + 'ms' : '<50ms'})`;
        }
      } else {
        if (pillEl) {
          pillEl.classList.remove('is-online');
          pillEl.classList.add('is-offline', 'is-standby');
        }
        if (dotEl) {
          dotEl.style.backgroundColor = 'var(--accent-amber)';
          dotEl.style.boxShadow = 'none';
        }
        if (textEl) {
          textEl.textContent = 'HOST STATUS: STANDBY / OFFLINE (Auto Cloud Failover)';
        }
      }
    } catch (_) {
      if (pillEl) {
        pillEl.classList.remove('is-online');
        pillEl.classList.add('is-offline', 'is-standby');
      }
      if (dotEl) {
        dotEl.style.backgroundColor = 'var(--accent-amber)';
        dotEl.style.boxShadow = 'none';
      }
      if (textEl) {
        textEl.textContent = 'HOST STATUS: STANDBY / OFFLINE (Auto Cloud Failover)';
      }
    }
  }

  logout() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    window.location.reload();
  }

  // =========================================================================
  // 2. DATA RETRIEVAL (Dual-Source Hybrid Merge: Supabase REST + Local Cache)
  // =========================================================================
  async loadDashboardData(isBackground = false) {
    const syncStatusEl = document.getElementById('sync-status');
    if (syncStatusEl && !isBackground) syncStatusEl.textContent = 'Menyinkronkan data...';

    // 1. Read local storage events first (0ms instant response)
    let localEvents = [];
    try {
      const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      localEvents = localRaw ? JSON.parse(localRaw) : [];
      if (!Array.isArray(localEvents)) localEvents = [];
    } catch {
      localEvents = [];
    }

    // 2. Fetch remote Supabase events
    let remoteEvents = [];
    const config = this.getSupabaseConfig();

    let isSupabaseConnected = false;
    if (config && config.url && config.anonKey) {
      try {
        const endpoint = `${config.url}/rest/v1/portfolio_telemetry?select=*&order=created_at.desc&limit=1000`;
        const res = await fetch(endpoint, {
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          remoteEvents = await res.json();
          if (Array.isArray(remoteEvents)) {
            isSupabaseConnected = true;
          } else {
            remoteEvents = [];
          }
        } else {
          console.warn('Supabase HTTP error:', res.status, res.statusText);
        }
      } catch (err) {
        console.warn('Gagal memuat Supabase, menggunakan cache lokal:', err);
      }
    }

    if (syncStatusEl) {
      syncStatusEl.textContent = isSupabaseConnected 
        ? 'Cloud Supabase Terhubung (Live Real-Time)' 
        : 'Penyimpanan Lokal Aktif (Offline Mode)';
      const syncDotEl = document.querySelector('.dash-status-dot');
      if (syncDotEl) {
        syncDotEl.style.backgroundColor = isSupabaseConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)';
        syncDotEl.style.boxShadow = isSupabaseConnected ? '0 0 8px var(--accent-emerald)' : '0 0 8px var(--accent-amber)';
      }
    }

    // 3. Intelligent Dual-Source Deduplication & Noise Filter (Collapses identical duplicates)
    const allRawEvents = [...remoteEvents, ...localEvents];

    // Sort chronologically descending first
    allRawEvents.sort((a, b) => {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    const deduplicated = [];
    const seenSignatures = new Set();

    for (const e of allRawEvents) {
      if (!e) continue;
      
      // Compute 3-second time bucket to merge duplicate transmissions / remote vs local identical logs
      const ts = new Date(e.created_at || 0).getTime();
      const timeBucket = Math.floor(ts / 3000);
      const sid = (e.session_id || 'sess').substring(0, 30);
      const type = (e.event_type || 'unknown').toLowerCase();
      const target = (e.event_target || '').toLowerCase().trim().substring(0, 50);

      const signature = `${sid}__${type}__${target}__${timeBucket}`;
      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        deduplicated.push(e);
      }
    }

    this.events = deduplicated;
    this.filterAndRender();
  }

  // =========================================================================
  // 3. FILTERING & AGGREGATION
  // =========================================================================
  filterAndRender() {
    const now = Date.now();
    let cutoff = 0;

    if (this.activeRange === 'today') {
      cutoff = now - 24 * 60 * 60 * 1000;
    } else if (this.activeRange === '7d') {
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
    } else if (this.activeRange === '30d') {
      cutoff = now - 30 * 24 * 60 * 60 * 1000;
    }

    this.filteredEvents = this.events.filter(e => {
      const time = new Date(e.created_at).getTime();
      return cutoff === 0 || time >= cutoff;
    });

    this.renderKPIs();
    this.renderCharts();
    this.renderIntelligenceLists();
    this.renderAllAIModelsMatrix();
    this.renderAIMemoryList();
    this.renderActivityTable();
  }

  renderKPIs() {
    const pageViews = this.filteredEvents.filter(e => e.event_type === 'page_view').length;
    const uniqueSessions = new Set(this.filteredEvents.map(e => e.session_id)).size || 1;
    const linkClicks = this.filteredEvents.filter(e => e.event_type === 'link_click' || e.event_type === 'cert_view').length;
    const contacts = this.filteredEvents.filter(e => e.event_target === 'whatsapp' || e.event_type === 'contact_submit').length;
    const interactivity = (this.filteredEvents.length / Math.max(1, uniqueSessions)).toFixed(1);

    document.getElementById('kpi-views').textContent = pageViews.toLocaleString('id-ID');
    document.getElementById('kpi-visitors').textContent = uniqueSessions.toLocaleString('id-ID');
    document.getElementById('kpi-clicks').textContent = linkClicks.toLocaleString('id-ID');
    document.getElementById('kpi-contacts').textContent = contacts.toLocaleString('id-ID');
    document.getElementById('kpi-engagement').textContent = interactivity;
  }

  // =========================================================================
  // 4. CHART.JS VISUALIZATION RENDERING
  // =========================================================================
  renderCharts() {
    if (!window.Chart) return;

    const emerald = 'rgba(37, 211, 102, 1)';
    const emeraldDim = 'rgba(37, 211, 102, 0.15)';
    const cyan = 'rgba(56, 189, 248, 1)';
    const cyanDim = 'rgba(56, 189, 248, 0.15)';
    const gridColor = 'rgba(255, 255, 255, 0.08)';
    const textColor = 'rgba(203, 213, 225, 0.8)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 11;

    // 1. Traffic Velocity Line Chart
    const trafficCtx = document.getElementById('traffic-chart')?.getContext('2d');
    if (trafficCtx) {
      if (this.charts.traffic) this.charts.traffic.destroy();

      const dayBuckets = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        dayBuckets[key] = { views: 0, sessions: new Set() };
      }

      this.filteredEvents.forEach(e => {
        const key = new Date(e.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (dayBuckets[key]) {
          if (e.event_type === 'page_view') dayBuckets[key].views++;
          dayBuckets[key].sessions.add(e.session_id);
        }
      });

      const labels = Object.keys(dayBuckets);
      const viewsData = labels.map(k => dayBuckets[k].views);
      const visitorsData = labels.map(k => dayBuckets[k].sessions.size);

      this.charts.traffic = new Chart(trafficCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Total Views',
              data: viewsData,
              borderColor: emerald,
              backgroundColor: emeraldDim,
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Pengunjung Unik',
              data: visitorsData,
              borderColor: cyan,
              backgroundColor: cyanDim,
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            x: { grid: { color: gridColor } },
            y: { grid: { color: gridColor }, beginAtZero: true }
          }
        }
      });
    }

    // 2. Link & Project Interactions Bar Chart (9 Categories)
    const linksCtx = document.getElementById('links-chart')?.getContext('2d');
    if (linksCtx) {
      if (this.charts.links) this.charts.links.destroy();

      const counts = {
        'WhatsApp': 0,
        'GitHub': 0,
        'Plagiarism': 0,
        'Spam-Email': 0,
        'Laser PPT': 0,
        'FotoKita': 0,
        'Portfolio': 0,
        'Sertifikat': 0,
        'Terminal': 0
      };

      this.filteredEvents.forEach(e => {
        const target = (e.event_target || '').toLowerCase();
        const label = (e.event_label || '').toLowerCase();

        if (target.includes('whatsapp') || label.includes('whatsapp')) counts['WhatsApp']++;
        else if (target === 'github' || label.includes('github profile')) counts['GitHub']++;
        else if (target.includes('plagiarism') || label.includes('plagiarism')) counts['Plagiarism']++;
        else if (target.includes('spam') || label.includes('spam')) counts['Spam-Email']++;
        else if (target.includes('laser') || label.includes('laser')) counts['Laser PPT']++;
        else if (target.includes('fotokita') || label.includes('fotokita')) counts['FotoKita']++;
        else if (target.includes('portofolio') || label.includes('portofolio')) counts['Portfolio']++;
        else if (e.event_type === 'cert_view' || label.includes('sertifikat')) counts['Sertifikat']++;
        else if (e.event_type === 'terminal_cmd' || label.includes('terminal')) counts['Terminal']++;
      });

      this.charts.links = new Chart(linksCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Total Klik',
            data: Object.values(counts),
            backgroundColor: [
              'rgba(37, 211, 102, 0.85)',
              'rgba(56, 189, 248, 0.85)',
              'rgba(168, 85, 247, 0.85)',
              'rgba(251, 191, 36, 0.85)',
              'rgba(236, 72, 153, 0.85)',
              'rgba(20, 184, 166, 0.85)',
              'rgba(99, 102, 241, 0.85)',
              'rgba(244, 63, 94, 0.85)',
              'rgba(148, 163, 184, 0.85)'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { 
              grid: { display: false },
              ticks: { font: { size: 10 } }
            },
            y: { grid: { color: gridColor }, beginAtZero: true }
          }
        }
      });
    }

    // 3. Platform & Device Ratio Doughnut Chart
    const devicesCtx = document.getElementById('devices-chart')?.getContext('2d');
    if (devicesCtx) {
      if (this.charts.devices) this.charts.devices.destroy();

      const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
      this.filteredEvents.forEach(e => {
        const type = (e.device_type || 'desktop').toLowerCase();
        if (type.includes('mobile')) deviceCounts.Mobile++;
        else if (type.includes('tablet')) deviceCounts.Tablet++;
        else deviceCounts.Desktop++;
      });

      this.charts.devices = new Chart(devicesCtx, {
        type: 'doughnut',
        data: {
          labels: ['Mobile', 'Desktop', 'Tablet'],
          datasets: [{
            data: [deviceCounts.Mobile, deviceCounts.Desktop, deviceCounts.Tablet],
            backgroundColor: [
              'rgba(37, 211, 102, 0.85)',
              'rgba(56, 189, 248, 0.85)',
              'rgba(251, 191, 36, 0.85)'
            ],
            borderColor: 'oklch(0.16 0.018 250)',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          cutout: '70%'
        }
      });
    }
  }

  // =========================================================================
  // =========================================================================
  // 5. INTELLIGENCE LEADERBOARDS (Unified Normalization)
  // =========================================================================
  normalizeCertName(target = '', label = '') {
    const combined = `${target} ${label}`.toLowerCase();
    if (combined.includes('bnsp') || combined.includes('analis') || combined.includes('program')) return 'BNSP: Analis Program';
    if (combined.includes('mikrotik') || combined.includes('mtcna')) return 'MikroTik MTCNA (Latvia)';
    if (combined.includes('python') || combined.includes('pcap')) return 'Cisco Python PCAP (OpenEDG)';
    if (combined.includes('blockchain') || combined.includes('cloud-blockchain')) return 'Seminar Cloud & Blockchain';
    if (combined.includes('bootcamp') || combined.includes('sdns') || combined.includes('network-security')) return 'IT Bootcamp Network Security';
    if (combined.includes('specialist') || combined.includes('cloud-specialist')) return 'Seminar Cloud Specialist';
    if (combined.includes('bisnis') || combined.includes('google-profil') || combined.includes('dea')) return 'Kominfo DEA E-Commerce';
    if (combined.includes('tailwind') || combined.includes('slicing')) return 'Workshop Slicing Tailwind';
    if (combined.includes('simk') || combined.includes('simulasi')) return 'Harisenin Full-Stack SiM-K';
    if (combined.includes('coding-camp') || combined.includes('javascript')) return 'Harisenin JavaScript Camp';
    return target || label || 'Sertifikat Kompetensi';
  }

  normalizeAIQuery(target = '', label = '') {
    const combined = `${target} ${label}`.toLowerCase();
    const isAuto = combined.includes('auto:') || combined.includes('[auto') || combined.includes('auto ➔') || target === 'auto';
    const tag = isAuto ? 'Auto: ' : '';

    if (combined.includes('nemotron-3.5-lightning') || combined.includes('lightning')) return `${tag}Nvidia Nemotron 3.5 Lightning (1M Context)`;
    if (combined.includes('nemotron-3-super') || combined.includes('nemotron super') || combined.includes('120b')) return `${tag}Nvidia Nemotron 3 Super (120B)`;
    if (combined.includes('nemotron-3-nano-omni') || combined.includes('nano-omni') || combined.includes('nano-12b-v2-vl')) return `${tag}Nemotron Omni / VL Vision Multimodal`;
    if (combined.includes('nemotron-3-nano') || combined.includes('nemotron nano') || combined.includes('nano:30b') || combined.includes('30b')) return `${tag}Nvidia Nemotron 3 Nano (30B)`;
    if (combined.includes('nemotron-3-ultra') || combined.includes('nemotron ultra') || combined.includes('550b') || combined.includes('ultra-free') || combined.includes('nemotron')) return `${tag}Nvidia Nemotron 3 Ultra (550B MoE)`;
    if (combined.includes('gemma-4') || combined.includes('gemma')) return `${tag}Google Gemma 4 Vision Multimodal`;
    if (combined.includes('laguna') || combined.includes('laguna-s')) return `${tag}Nemotron Laguna S (Jan 2026)`;
    if (combined.includes('x-preview')) return `${tag}OpenCode X-Preview Frontier (Feb 2026)`;
    if (combined.includes('minimax-m3') || combined.includes('vision-model') || combined.includes('mimo') || combined.includes('minimax')) return `${tag}MiniMax-M3 Vision Multimodal`;
    if (combined.includes('deepseek-r1') || combined.includes('thinking') || combined.includes('reasoning')) return `${tag}DeepSeek R1 (Thinking CoT)`;
    if (combined.includes('deepseek') || combined.includes('v4-flash') || combined.includes('flash-free')) return `${tag}DeepSeek V4 Flash`;
    if (combined.includes('codex') || combined.includes('gpt-5') || combined.includes('koding') || combined.includes('coding')) return `${tag}Codex (GPT-5.6 Terra)`;
    if (combined.includes('antigravity') || combined.includes('opus') || combined.includes('claude')) return `${tag}Antigravity (Claude Opus 4.6)`;
    if (combined.includes('openrouter/free') || combined.includes('universal free')) return `${tag}OpenRouter Universal Free Auto Router`;
    if (combined.includes('local_semantic') || combined.includes('semantic engine')) return 'Auto: Local Semantic Fallback';

    if (combined.includes('plagiarism') || combined.includes('plagiat')) return 'Tanya: Arsitektur Plagiarism';
    if (combined.includes('skripsi') || combined.includes('nlp')) return 'Tanya: Riset NLP & Skripsi';
    if (combined.includes('kontak') || combined.includes('hubungi') || combined.includes('email') || combined.includes('wa')) return 'Tanya: Informasi Kontak';
    if (combined.includes('sertifikat') || combined.includes('bnsp') || combined.includes('mikrotik')) return 'Tanya: Kredensial Kompetensi';
    if (combined.includes('help') || combined.includes('skills') || combined.includes('projects') || combined.includes('benchmarks')) return `CLI: $ ${target.toLowerCase()}`;
    return label ? (label.length > 28 ? label.substring(0, 26) + '...' : label) : (target || 'Konsultasi AI');
  }

  normalizeProjectName(target = '', label = '') {
    const combined = `${target} ${label}`.toLowerCase();
    if (combined.includes('plagiar') || combined.includes('openplagiarism')) return 'OpenPlagiarismChecker (NLP)';
    if (combined.includes('spam') || combined.includes('email')) return 'Spam-Email-Classifier (ML)';
    if (combined.includes('laser') || combined.includes('ppt') || combined.includes('pointer')) return 'Laser Pointer PPT (IoT/CV)';
    if (combined.includes('foto') || combined.includes('blur') || combined.includes('kita')) return 'FotoKitaBlur (MediaPipe)';
    if (combined.includes('porto') || combined.includes('landing') || combined.includes('web-portofolio')) return 'Web Portofolio (Vanilla Modern)';
    return target || label || 'Repositori Riset';
  }

  normalizeReferrer(ref = '') {
    const r = (ref || '').toLowerCase();
    if (r.includes('google')) return 'Google Search (Organik)';
    if (r.includes('github')) return 'GitHub (@Raflyf)';
    if (r.includes('whatsapp') || r.includes('wa.me')) return 'WhatsApp Web / Mobile';
    if (r.includes('linkedin')) return 'LinkedIn Professional';
    if (r.includes('instagram')) return 'Instagram';
    if (r.includes('localhost') || r.includes('127.0.0.1')) return 'Local Dev Server';
    if (r.includes('direct') || r.includes('bookmark') || !r) return 'Direct / Bookmark';
    return ref;
  }

  renderIntelligenceLists() {
    // 1. Project Exploration Leaderboard
    const projectListEl = document.getElementById('project-ranked-list');
    if (projectListEl) {
      const counts = {};
      this.filteredEvents.filter(e => e.event_type === 'project_view' || (e.event_type === 'link_click' && e.event_target && !e.event_target.includes('wa'))).forEach(e => {
        const unified = this.normalizeProjectName(e.event_target, e.event_label);
        counts[unified] = (counts[unified] || 0) + 1;
      });

      if (Object.keys(counts).length === 0) {
        counts['OpenPlagiarismChecker (NLP)'] = 0;
        counts['Spam-Email-Classifier (ML)'] = 0;
        counts['Laser Pointer PPT (IoT/CV)'] = 0;
        counts['FotoKitaBlur (MediaPipe)'] = 0;
        counts['Web Portofolio (Vanilla Modern)'] = 0;
      }

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const maxVal = Math.max(1, ...sorted.map(c => c[1]));

      projectListEl.innerHTML = sorted.map(([name, count], idx) => {
        const pct = Math.round((count / maxVal) * 100);
        const rankNum = String(idx + 1).padStart(2, '0');
        return `
          <div class="ranked-item">
            <div class="ranked-item-header">
              <div class="ranked-name-wrap">
                <span class="ranked-num-badge">${rankNum}</span>
                <span class="ranked-item-name" title="${this.sanitize(name)}">${this.sanitize(name)}</span>
              </div>
              <span class="ranked-item-count">${count}x</span>
            </div>
            <div class="ranked-progress-bg">
              <div class="ranked-progress-fill" style="width:${pct}%;background-color:var(--accent-cyan);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Certificate Views Leaderboard (Consolidated)
    const certListEl = document.getElementById('cert-ranked-list');
    if (certListEl) {
      const certCounts = {};
      this.filteredEvents.filter(e => e.event_type === 'cert_view').forEach(e => {
        const unifiedName = this.normalizeCertName(e.event_target, e.event_label);
        certCounts[unifiedName] = (certCounts[unifiedName] || 0) + 1;
      });

      if (Object.keys(certCounts).length === 0) {
        certCounts['BNSP: Analis Program'] = 0;
        certCounts['MikroTik MTCNA (Latvia)'] = 0;
        certCounts['Cisco Python PCAP (OpenEDG)'] = 0;
        certCounts['Kominfo DEA E-Commerce'] = 0;
      }

      const sortedCerts = Object.entries(certCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const maxCert = Math.max(1, ...sortedCerts.map(c => c[1]));

      certListEl.innerHTML = sortedCerts.map(([title, count], idx) => {
        const pct = Math.round((count / maxCert) * 100);
        const rankNum = String(idx + 1).padStart(2, '0');
        return `
          <div class="ranked-item">
            <div class="ranked-item-header">
              <div class="ranked-name-wrap">
                <span class="ranked-num-badge">${rankNum}</span>
                <span class="ranked-item-name" title="${this.sanitize(title)}">${this.sanitize(title)}</span>
              </div>
              <span class="ranked-item-count">${count}x</span>
            </div>
            <div class="ranked-progress-bg">
              <div class="ranked-progress-fill" style="width:${pct}%;background-color:var(--accent-emerald);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Traffic Acquisition & Referrer Leaderboard
    const refListEl = document.getElementById('referrer-ranked-list');
    if (refListEl) {
      const refCounts = {};
      this.filteredEvents.forEach(e => {
        const unified = this.normalizeReferrer(e.referrer);
        refCounts[unified] = (refCounts[unified] || 0) + 1;
      });

      if (Object.keys(refCounts).length === 0) {
        refCounts['Google Search (Organik)'] = 0;
        refCounts['GitHub (@Raflyf)'] = 0;
        refCounts['Direct / Bookmark'] = 0;
        refCounts['WhatsApp Web / Mobile'] = 0;
      }

      const sortedRefs = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const maxRef = Math.max(1, ...sortedRefs.map(c => c[1]));

      refListEl.innerHTML = sortedRefs.map(([source, count], idx) => {
        const pct = Math.round((count / maxRef) * 100);
        const rankNum = String(idx + 1).padStart(2, '0');
        return `
          <div class="ranked-item">
            <div class="ranked-item-header">
              <div class="ranked-name-wrap">
                <span class="ranked-num-badge">${rankNum}</span>
                <span class="ranked-item-name" title="${this.sanitize(source)}">${this.sanitize(source)}</span>
              </div>
              <span class="ranked-item-count">${count}x</span>
            </div>
            <div class="ranked-progress-bg">
              <div class="ranked-progress-fill" style="width:${pct}%;background-color:var(--accent-amber);"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // =========================================================================
  // 5B. COMPREHENSIVE ALL AI MODELS USAGE MATRIX (Counters & Auto Resolution)
  // =========================================================================
  renderAllAIModelsMatrix() {
    const gridEl = document.getElementById('ai-models-grid');
    const totalCountEl = document.getElementById('ai-matrix-total-count');
    if (!gridEl) return;

    const SVG_ICONS = {
      router: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>`,
      code: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      cot: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`,
      fast: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      flagship: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
      vision: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
      offline: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`
    };

    const isNIM = (s) => /\b(nim|integrate\.api\.nvidia\.com)\b/i.test(s);
    const isOpenCode = (s) => /\b(opencode|api\.opencode\.ai|opencode\.ai)\b/i.test(s);
    const isOllama = (s) => /\b(ollama|ollama\.com)\b/i.test(s);
    const isOmniRoute = (s) => /\b(omniroute|trycloudflare)\b/i.test(s);
    const isOpenRouter = (s) => /\b(openrouter|open-router)\b/i.test(s) || (!isOpenCode(s) && !isOllama(s) && !isOmniRoute(s) && !/\b(minimax|local_semantic)\b/i.test(s));

    const MODELS_CATALOG = [
      // 0. Auto Gateway Router Overview
      {
        id: 'auto-router',
        name: 'Auto Cloud Gateway',
        category: 'Router Gateway',
        tag: 'Intelligent Adaptive SOTA Cascade',
        icon: SVG_ICONS.router,
        color: 'var(--accent-cyan)',
        isRouterCard: true
      },

      // 1. Ollama Cloud SOTA Hub (High Throughput SOTA Engines)
      {
        id: 'nemotron-nano-ollama',
        name: 'Nemotron 3 Nano (30B)',
        category: 'Ollama Cloud Engine',
        tag: 'ollama.com · nemotron-3-nano:30b (Sub-1.5s Fast Q&A)',
        icon: SVG_ICONS.fast,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOllama(s) && /\b(nano|30b)\b/i.test(s);
        }
      },
      {
        id: 'nemotron-super-ollama',
        name: 'Nemotron 3 Super (120B)',
        category: 'Ollama Cloud Engine',
        tag: 'ollama.com · nemotron-3-super (CoT Reasoning)',
        icon: SVG_ICONS.flagship,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOllama(s) && /\b(super|120b)\b/i.test(s);
        }
      },
      {
        id: 'nemotron-lightning-ollama',
        name: 'Nemotron 3.5 Lightning',
        category: 'Ollama Cloud Engine',
        tag: 'ollama.com · nemotron-3.5-lightning (1M Context SOTA)',
        icon: SVG_ICONS.fast,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOllama(s) && /\b(lightning|3\.5-lightning)\b/i.test(s);
        }
      },
      {
        id: 'nemotron-ultra-ollama',
        name: 'Nemotron 3 Ultra (550B)',
        category: 'Ollama Cloud Engine',
        tag: 'ollama.com · nemotron-3-ultra (550B MoE)',
        icon: SVG_ICONS.flagship,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOllama(s) && /\b(ultra|550b)\b/i.test(s);
        }
      },
      {
        id: 'minimax-m3-ollama',
        name: 'MiniMax-M3 Multimodal',
        category: 'Ollama Cloud Engine',
        tag: 'ollama.com · minimax-m3 (Vision Multimodal)',
        icon: SVG_ICONS.vision,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOllama(s) && /\b(minimax|m3|mimo)\b/i.test(s);
        }
      },

      // 2. OmniRoute Dedicated Local Gateway (The 5 Combos Configured in OmniRoute)
      {
        id: 'omniroute-codex',
        name: 'Codex',
        category: 'OmniRoute Dedicated',
        tag: 'codex/gpt-5.6-terra · Heavy Coding & Architecture',
        icon: SVG_ICONS.code,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return /\b(codex|gpt-5\.6|terra)\b/i.test(s);
        }
      },
      {
        id: 'omniroute-antigravity',
        name: 'Antigravity',
        category: 'OmniRoute Dedicated',
        tag: 'claude-opus-4-6-thinking · Deep CoT Reasoning',
        icon: SVG_ICONS.cot,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return /\b(antigravity|claude-opus|opus|kiro)\b/i.test(s);
        }
      },
      {
        id: 'omniroute-deepseek-v4',
        name: 'Deepseek-V4-Flash-Free',
        category: 'OmniRoute Dedicated',
        tag: 'opencode/deepseek-v4-flash-free · Fast Interaction',
        icon: SVG_ICONS.fast,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return /\b(deepseek-v4|v4-flash|flash-free)\b/i.test(s) || (isOmniRoute(s) && /\bdeepseek\b/i.test(s));
        }
      },
      {
        id: 'omniroute-vision',
        name: 'Vision-model',
        category: 'OmniRoute Dedicated',
        tag: 'MiniMax-M3 / mimo-v2.5 · Multimodal Vision & OCR',
        icon: SVG_ICONS.vision,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOmniRoute(s) && /\b(vision-model|vision)\b/i.test(s);
        }
      },
      {
        id: 'omniroute-nemotron',
        name: 'nemotron-laguna',
        category: 'OmniRoute Dedicated',
        tag: 'opencode/nemotron-3-ultra-free · Frontier MoE',
        icon: SVG_ICONS.flagship,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOmniRoute(s) && /\b(laguna|nemotron-laguna)\b/i.test(s);
        }
      },

      // 3. OpenRouter Modern SOTA Pool (Multi-Key Cloud Pool)
      {
        id: 'nemotron-3-ultra-openrouter',
        name: 'Nvidia Nemotron 3 Ultra (550B)',
        category: 'OpenRouter Cloud Pool',
        tag: '550B MoE · Frontier Analytical Engine',
        icon: SVG_ICONS.flagship,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOpenRouter(s) && /\b(ultra|550b|nemotron-3-ultra)\b/i.test(s);
        }
      },
      {
        id: 'nemotron-3-nano-openrouter',
        name: 'Nvidia Nemotron 3 Nano (30B)',
        category: 'OpenRouter Cloud Pool',
        tag: '30B A3B · Ultra-Fast Conversational SOTA',
        icon: SVG_ICONS.fast,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOpenRouter(s) && /\b(nano|30b|nemotron-3-nano)\b/i.test(s) && !/omni|vl/i.test(s);
        }
      },
      {
        id: 'nemotron-vision-openrouter',
        name: 'Nemotron Omni / VL Vision',
        category: 'OpenRouter Cloud Pool',
        tag: 'Multimodal Vision · Image Perception & OCR',
        icon: SVG_ICONS.vision,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOpenRouter(s) && /\b(omni|vl|vision-instruct|pixtral|gemma-4)\b/i.test(s);
        }
      },
      {
        id: 'nemotron-35-lightning-openrouter',
        name: 'Nvidia Nemotron 3.5 Lightning',
        category: 'OpenRouter Cloud Pool',
        tag: '1M Context · High-Speed Lightning Inference',
        icon: SVG_ICONS.fast,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOpenRouter(s) && /\b(lightning|3\.5-lightning)\b/i.test(s);
        }
      },
      {
        id: 'liquid-lfm-openrouter',
        name: 'LiquidAI LFM 2.5 (2.6B)',
        category: 'OpenRouter Cloud Pool',
        tag: '2.6B Dynamic · Sub-2s Instant Engine',
        icon: SVG_ICONS.fast,
        color: 'var(--accent-amber)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOpenRouter(s) && /\b(liquid|lfm|2\.6b)\b/i.test(s);
        }
      },
      {
        id: 'openrouter-free-auto',
        name: 'OpenRouter Universal Free',
        category: 'OpenRouter Cloud Pool',
        tag: 'openrouter/free · Universal SOTA Auto Router',
        icon: SVG_ICONS.router,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOpenRouter(s) && (/\b(openrouter\/free|universal free)\b/i.test(s) || (t === 'openrouter/free' || l.includes('openrouter/free')));
        }
      },

      // 4. OpenCode Zen Cloud Pool
      {
        id: 'nemotron-ultra-opencode',
        name: 'Nemotron 3 Ultra (550B)',
        category: 'OpenCode Cloud Pool',
        tag: 'Model ID: opencode/nemotron-3-ultra-free',
        icon: SVG_ICONS.flagship,
        color: 'var(--accent-emerald)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return isOpenCode(s) && /\b(ultra|550b|nemotron-3-ultra)\b/i.test(s);
        }
      },

      // 5. MiniMax Frontier API Provider
      {
        id: 'minimax-m3-direct',
        name: 'MiniMax-M3 Frontier Vision',
        category: 'MiniMax Frontier API',
        tag: 'api.minimax.io · MiniMax-M3',
        icon: SVG_ICONS.vision,
        color: 'var(--accent-cyan)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return !isOllama(s) && !isOmniRoute(s) && /\b(minimax|mimo|api\.minimax\.io)\b/i.test(s);
        }
      },

      // 6. In-Browser Local Engine (Zero-Latency Offline)
      {
        id: 'local-semantic',
        name: 'Local Semantic Engine',
        category: 'In-Browser Engine',
        tag: 'In-Browser Sub-15ms Pattern Matcher + Supabase RAG',
        icon: SVG_ICONS.offline,
        color: 'var(--text-muted)',
        match: (t, l) => {
          const s = `${t} ${l}`;
          return /\b(local_semantic|semantic pattern|local semantic)\b/i.test(s);
        }
      }
    ];

    // 1. Isolate verified unique AI consultation executions (deduplicate and filter out UI/noise events)
    const actualConsultations = [];
    const seenQueries = new Set();

    // Priority 1: Resolved events (ai_query_resolved)
    const resolvedEvents = this.filteredEvents.filter(e => e.event_type === 'ai_query_resolved');
    resolvedEvents.forEach(e => {
      const ts = new Date(e.created_at || 0).getTime();
      const bucket = Math.floor(ts / 3000);
      const sid = (e.session_id || 'sess').substring(0, 30);
      const sig = `${sid}__${bucket}`;
      if (!seenQueries.has(sig)) {
        seenQueries.add(sig);
        actualConsultations.push(e);
      }
    });

    // Priority 2: Standalone legacy ai_query events without resolved event in same window
    this.filteredEvents.forEach(e => {
      if (e.event_type === 'ai_query' || e.event_type === 'terminal_ai_query') {
        const ts = new Date(e.created_at || 0).getTime();
        const bucket = Math.floor(ts / 3000);
        const sid = (e.session_id || 'sess').substring(0, 30);
        const sig = `${sid}__${bucket}`;
        if (!seenQueries.has(sig)) {
          seenQueries.add(sig);
          actualConsultations.push(e);
        }
      }
    });

    const totalConsultations = actualConsultations.length;

    // 2. Track Auto Router breakdown & Individual Model Statistics
    const autoResolvedBreakdown = {};
    let totalAutoInferences = 0;
    let totalManualInferences = 0;

    const modelStatsMap = {};
    MODELS_CATALOG.forEach(m => {
      modelStatsMap[m.id] = { ...m, manualCount: 0, autoCount: 0, total: 0, lastUsedAt: 0 };
    });

    actualConsultations.forEach(e => {
      const ts = new Date(e.created_at || 0).getTime() || 0;
      const t = (e.event_target || '').trim();
      const l = (e.event_label || '').trim();
      const isAuto = t.startsWith('auto:') || t === 'auto' || l.includes('[Auto ➔') || l.includes('Auto Router') || (!t.includes(':') && t === 'auto');

      // Match against model catalog
      const matchedModel = MODELS_CATALOG.find(m => !m.isRouterCard && m.match && m.match(t, l));

      if (isAuto) {
        totalAutoInferences++;
        if (matchedModel) {
          modelStatsMap[matchedModel.id].autoCount++;
          modelStatsMap[matchedModel.id].total++;
          if (ts > modelStatsMap[matchedModel.id].lastUsedAt) {
            modelStatsMap[matchedModel.id].lastUsedAt = ts;
          }
          const breakdownLabel = `${matchedModel.name} · ${matchedModel.category}`;
          autoResolvedBreakdown[breakdownLabel] = (autoResolvedBreakdown[breakdownLabel] || 0) + 1;
        } else {
          // Resolve fallback model name cleanly
          let fallbackName = t.replace(/^auto:/, '').trim();
          if ((!fallbackName || fallbackName === 'auto') && l.includes('[Auto ➔')) {
            fallbackName = l.split('[Auto ➔')[1]?.split('via')[0]?.trim() || '';
          }
          if (fallbackName.includes('llama-3.3-70b') || fallbackName.includes('meta-llama')) {
            fallbackName = 'Meta Llama 3.3 (70B) · Legacy Cloud Fallback';
          } else if (fallbackName.includes('nemotron-3-nano') || fallbackName.includes('nano-30b')) {
            fallbackName = 'Nvidia Nemotron 3 Nano (30B) · OpenRouter Cloud Pool';
          } else if (fallbackName.includes('nemotron-3-ultra') || fallbackName.includes('ultra-550b')) {
            fallbackName = 'Nvidia Nemotron 3 Ultra (550B) · OpenRouter Cloud Pool';
          } else if (fallbackName.includes('lightning')) {
            fallbackName = 'Nvidia Nemotron 3.5 Lightning · OpenRouter Cloud Pool';
          } else if (fallbackName.includes('liquid') || fallbackName.includes('lfm')) {
            fallbackName = 'LiquidAI LFM 2.5 (2.6B) · OpenRouter Cloud Pool';
          } else if (!fallbackName || fallbackName === 'auto') {
            fallbackName = 'Nvidia Nemotron 3 Nano (30B) · OpenRouter Cloud Pool';
          }
          autoResolvedBreakdown[fallbackName] = (autoResolvedBreakdown[fallbackName] || 0) + 1;
        }
      } else {
        totalManualInferences++;
        if (matchedModel) {
          modelStatsMap[matchedModel.id].manualCount++;
          modelStatsMap[matchedModel.id].total++;
          if (ts > modelStatsMap[matchedModel.id].lastUsedAt) {
            modelStatsMap[matchedModel.id].lastUsedAt = ts;
          }
        }
      }
    });

    // Populate auto-router overview card
    modelStatsMap['auto-router'].autoCount = totalAutoInferences;
    modelStatsMap['auto-router'].manualCount = totalManualInferences;
    modelStatsMap['auto-router'].total = totalAutoInferences;

    if (totalCountEl) {
      totalCountEl.textContent = `${totalConsultations.toLocaleString('id-ID')}x`;
    }

    // Dynamic Auto-Sort: Separate Router Card and sort individual Model Cards dynamically
    const routerCard = modelStatsMap['auto-router'];
    const nonRouterStats = MODELS_CATALOG
      .filter(m => !m.isRouterCard)
      .map(m => modelStatsMap[m.id]);

    // Primary: Most recently used timestamp (lastUsedAt DESC). The active model instantly jumps to #1!
    // Secondary: Highest total usage count (total DESC).
    nonRouterStats.sort((a, b) => {
      const timeDiff = (b.lastUsedAt || 0) - (a.lastUsedAt || 0);
      if (timeDiff !== 0) return timeDiff;
      return (b.total || 0) - (a.total || 0);
    });

    const modelStats = routerCard ? [routerCard, ...nonRouterStats] : nonRouterStats;
    const maxModelCount = Math.max(1, ...modelStats.map(m => m.total));

    gridEl.innerHTML = modelStats.map((m, index) => {
      const pct = Math.round((m.total / maxModelCount) * 100);

      if (m.isRouterCard) {
        const entries = Object.entries(autoResolvedBreakdown).sort((a, b) => b[1] - a[1]);
        const listHtml = entries.length > 0
          ? entries.map(([modelName, count]) => `
            <div class="ai-model-auto-item" style="display:flex;justify-content:space-between;align-items:center;padding:0.3rem 0.5rem;font-size:0.75rem;font-family:var(--font-mono);border-bottom:1px dashed var(--border-subtle);background:rgba(255,255,255,0.015);border-radius:4px;margin-bottom:0.25rem;">
              <span style="color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:0.5rem;">${this.sanitize(modelName)}</span>
              <strong style="color:var(--accent-emerald);background:rgba(16,185,129,0.1);padding:0.1rem 0.45rem;border-radius:3px;font-size:0.75rem;white-space:nowrap;">${count}x</strong>
            </div>
          `).join('')
          : `<div style="color:var(--text-dim);font-size:0.75rem;padding:0.5rem 0;">Belum ada resolusi mode auto.</div>`;

        return `
          <div class="ai-model-card ai-model-card-auto-full">
            <div class="ai-auto-card-grid">
              
              <!-- Sisi Kiri: Ringkasan Auto Router & Stats -->
              <div class="ai-auto-overview-panel" style="display:flex;flex-direction:column;gap:0.6rem;">
                <div class="ai-model-card-header" style="display:flex;align-items:center;justify-content:space-between;">
                  <span class="ai-model-category-tag" style="background:rgba(6,182,212,0.12);border-color:rgba(6,182,212,0.3);color:var(--accent-cyan);font-weight:800;letter-spacing:0.04em;">${this.sanitize(m.category)}</span>
                  <span class="ai-model-count" style="color:${m.color};font-size:1.6rem;font-weight:900;">${m.total}x</span>
                </div>

                <div class="ai-model-name-wrap">
                  <div style="display:flex;align-items:center;gap:0.5rem;color:${m.color};font-size:1.05rem;">
                    ${m.icon}
                    <span class="ai-model-name" style="font-size:1.05rem;font-weight:800;">${this.sanitize(m.name)}</span>
                  </div>
                  <span class="ai-model-tag" style="font-size:0.75rem;color:var(--text-dim);margin-top:0.2rem;display:block;">${this.sanitize(m.tag)}</span>
                </div>

                <div class="ai-model-bar-wrap" style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;">
                  <div class="ai-model-bar-fill" style="width:${pct}%;background:linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald));border-radius:3px;"></div>
                </div>

                <div class="ai-model-breakdown" style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-dim);font-family:var(--font-mono);background:rgba(0,0,0,0.25);padding:0.45rem 0.75rem;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);margin-top:0.2rem;">
                  <span>Manual: <strong style="color:var(--text-body);">${m.manualCount}x</strong></span>
                  <span>Auto: <strong style="color:var(--accent-cyan);">${m.autoCount}x</strong></span>
                </div>
              </div>

              <!-- Sisi Kanan: Daftar Model Terpilih (Scrollable > 5 Items) -->
              <div class="ai-auto-breakdown-panel" style="display:flex;flex-direction:column;gap:0.35rem;border-left:1px solid var(--border-subtle);padding-left:1.5rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
                  <span style="font-size:0.725rem;font-weight:800;color:var(--text-heading);text-transform:uppercase;letter-spacing:0.04em;font-family:var(--font-mono);">
                    Model Terpilih Saat Mode Auto:
                  </span>
                  <span style="font-size:0.7rem;font-weight:700;color:var(--accent-cyan);font-family:var(--font-mono);">
                    ${totalAutoInferences}x Total
                  </span>
                </div>

                <div class="ai-model-auto-list">
                  ${listHtml}
                </div>
              </div>

            </div>
          </div>
        `;
      }

      // Rank Badges & Active Highlighting for dynamically sorted model cards
      let rankBadgeHtml = '';
      let isTopActive = false;
      if (m.total > 0) {
        if (index === 1) { // Position #1 among individual models
          isTopActive = true;
          rankBadgeHtml = `<span class="ai-model-rank-badge"><span class="ai-model-rank-pulse"></span> #1 AKTIF</span>`;
        } else if (index === 2) {
          rankBadgeHtml = `<span class="ai-model-rank-badge" style="background:rgba(6,182,212,0.15);border-color:rgba(6,182,212,0.35);color:var(--accent-cyan);">#2</span>`;
        } else if (index === 3) {
          rankBadgeHtml = `<span class="ai-model-rank-badge" style="background:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.35);color:var(--accent-amber);">#3</span>`;
        }
      }

      return `
        <div class="ai-model-card ${isTopActive ? 'is-top-active' : ''}">
          <div class="ai-model-card-header">
            <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
              <span class="ai-model-category-tag">${this.sanitize(m.category)}</span>
              ${rankBadgeHtml}
            </div>
            <span class="ai-model-count" style="color:${m.color};">${m.total}x</span>
          </div>

          <div class="ai-model-name-wrap">
            <div style="display:flex;align-items:center;gap:0.45rem;color:${m.color};">
              ${m.icon}
              <span class="ai-model-name">${this.sanitize(m.name)}</span>
            </div>
            <span class="ai-model-tag" style="font-size:0.7rem;color:var(--text-dim);">${this.sanitize(m.tag)}</span>
          </div>

          <div class="ai-model-bar-wrap">
            <div class="ai-model-bar-fill" style="width:${pct}%;background-color:${m.color};"></div>
          </div>

          <div class="ai-model-breakdown" style="display:flex;justify-content:space-between;font-size:0.725rem;color:var(--text-dim);font-family:var(--font-mono);">
            <span>Manual: <strong style="color:var(--text-body);">${m.manualCount}x</strong></span>
            <span>Auto: <strong style="color:var(--accent-cyan);">${m.autoCount}x</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // 5C. AI CONTINUOUS RAG / LONG-TERM MEMORY LIVE EXPLORER
  // =========================================================================
  async renderAIMemoryList() {
    const listEl = document.getElementById('ai-memories-list');
    const countEl = document.getElementById('ai-memory-total-count');
    const pagEl = document.getElementById('ai-memories-pagination');
    if (!listEl) return;

    try {
      const config = this.getSupabaseConfig();
      if (!config.url || !config.anonKey) {
        listEl.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem 0;">Supabase tidak terkonfigurasi.</div>`;
        if (pagEl) pagEl.innerHTML = '';
        return;
      }

      const res = await fetch(`${config.url}/rest/v1/ai_memories?select=*&order=created_at.desc&limit=500`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        listEl.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem 0;">Gagal memuat memori (HTTP ${res.status}).</div>`;
        if (pagEl) pagEl.innerHTML = '';
        return;
      }

      const memories = await res.json();
      this.memories = Array.isArray(memories) ? memories : [];

      if (this.memories.length === 0) {
        listEl.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem 0;">Belum ada memori fakta yang tersimpan di database.</div>`;
        if (countEl) countEl.textContent = '0 Fakta';
        if (pagEl) pagEl.innerHTML = '';
        return;
      }

      if (countEl) countEl.textContent = `${this.memories.length} Fakta Terkini (Supabase RAG)`;

      this.renderPaginatedMemories();
    } catch (e) {
      listEl.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem 0;">Error memuat memori: ${this.sanitize(e.message)}</div>`;
      if (pagEl) pagEl.innerHTML = '';
    }
  }

  renderPaginatedMemories() {
    const listEl = document.getElementById('ai-memories-list');
    const pagEl = document.getElementById('ai-memories-pagination');
    if (!listEl) return;

    const total = this.memories.length;
    const totalPages = Math.max(1, Math.ceil(total / this.memoryPageSize));
    if (this.memoryCurrentPage > totalPages) this.memoryCurrentPage = totalPages;
    if (this.memoryCurrentPage < 1) this.memoryCurrentPage = 1;

    const startIdx = (this.memoryCurrentPage - 1) * this.memoryPageSize;
    const endIdx = Math.min(startIdx + this.memoryPageSize, total);
    const pageItems = this.memories.slice(startIdx, endIdx);

    listEl.innerHTML = pageItems.map(m => {
      const dateStr = new Date(m.created_at).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      return `
        <div class="ranked-item" style="background:var(--bg-primary);padding:0.75rem 1rem;border-radius:var(--radius-md);border:1px solid var(--border-card);display:flex;flex-direction:column;gap:0.35rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:var(--text-muted);flex-wrap:wrap;gap:0.5rem;">
            <span style="color:var(--accent-emerald);font-family:var(--font-mono);font-weight:600;">Sesi: ${this.sanitize(m.session_id || 'unknown')}</span>
            <span style="font-family:var(--font-mono);color:var(--text-dim);">${dateStr}</span>
          </div>
          <div style="color:var(--text-heading);font-size:0.825rem;line-height:1.5;">${this.sanitize(m.fact_text)}</div>
        </div>
      `;
    }).join('');

    if (pagEl) {
      if (totalPages <= 1) {
        pagEl.innerHTML = `<span class="pagination-info">Menampilkan ${total} dari ${total} fakta</span>`;
        return;
      }

      let pageButtonsHtml = '';
      for (let i = 1; i <= totalPages; i++) {
        pageButtonsHtml += `
          <button type="button" class="pagination-btn ${i === this.memoryCurrentPage ? 'active' : ''}" data-mempage="${i}" aria-label="Halaman ${i}">
            ${i}
          </button>
        `;
      }

      pagEl.innerHTML = `
        <span class="pagination-info">Menampilkan ${startIdx + 1}-${endIdx} dari ${total} fakta (Halaman ${this.memoryCurrentPage}/${totalPages})</span>
        <div class="pagination-controls">
          <button type="button" class="pagination-btn" id="mem-prev-btn" ${this.memoryCurrentPage === 1 ? 'disabled' : ''} aria-label="Halaman Sebelumnya">
            Prev
          </button>
          ${pageButtonsHtml}
          <button type="button" class="pagination-btn" id="mem-next-btn" ${this.memoryCurrentPage === totalPages ? 'disabled' : ''} aria-label="Halaman Selanjutnya">
            Next
          </button>
        </div>
      `;

      const prevBtn = pagEl.querySelector('#mem-prev-btn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (this.memoryCurrentPage > 1) {
            this.memoryCurrentPage--;
            this.renderPaginatedMemories();
          }
        });
      }

      const nextBtn = pagEl.querySelector('#mem-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (this.memoryCurrentPage < totalPages) {
            this.memoryCurrentPage++;
            this.renderPaginatedMemories();
          }
        });
      }

      pagEl.querySelectorAll('.pagination-btn[data-mempage]').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.getAttribute('data-mempage'), 10);
          if (page && page !== this.memoryCurrentPage) {
            this.memoryCurrentPage = page;
            this.renderPaginatedMemories();
          }
        });
      });
    }
  }

  // =========================================================================
  // 6. ACTIVITY STREAM TABLE & EXPORT
  // =========================================================================
  renderActivityTable() {
    const tbody = document.getElementById('activity-table-body');
    const pagEl = document.getElementById('table-pagination');
    if (!tbody) return;

    let displayList = this.filteredEvents;

    if (this.selectedEventType !== 'all') {
      displayList = displayList.filter(e => e.event_type === this.selectedEventType);
    }

    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      displayList = displayList.filter(e => {
        const t = (e.event_target || '').toLowerCase();
        const l = (e.event_label || '').toLowerCase();
        const tp = (e.event_type || '').toLowerCase();
        return t.includes(q) || l.includes(q) || tp.includes(q);
      });
    }

    const total = displayList.length;

    if (total === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:var(--text-dim);padding:2rem;">
            Tidak ada data aktivitas yang sesuai dengan filter.
          </td>
        </tr>
      `;
      if (pagEl) pagEl.innerHTML = '';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(total / this.tablePageSize));
    if (this.tableCurrentPage > totalPages) this.tableCurrentPage = totalPages;
    if (this.tableCurrentPage < 1) this.tableCurrentPage = 1;

    const startIdx = (this.tableCurrentPage - 1) * this.tablePageSize;
    const endIdx = Math.min(startIdx + this.tablePageSize, total);
    const pageItems = displayList.slice(startIdx, endIdx);

    tbody.innerHTML = '';
    pageItems.forEach(e => {
      const tr = document.createElement('tr');
      const timeStr = new Date(e.created_at).toLocaleString('id-ID', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });

      const typeBadge = `<span class="table-event-tag">${this.sanitize(e.event_type)}</span>`;
      
      let targetDisplay = e.event_target ? this.sanitize(e.event_target) : '-';
      let labelDisplay = e.event_label ? this.sanitize(e.event_label) : '';

      // Format page_view with human-readable page name
      if (e.event_type === 'page_view') {
        const raw = (e.event_target || '/').toLowerCase();
        let pageTitle = 'Halaman Utama (Landing Page)';
        if (raw.includes('dashboard')) pageTitle = 'Admin Dashboard & Telemetri';
        else if (raw.includes('preview')) pageTitle = 'Pratinjau Kredensial (Preview)';
        else if (raw !== '/' && raw !== '/index.html' && !raw.includes('halaman utama')) pageTitle = `Halaman: ${this.sanitize(e.event_target)}`;
        
        targetDisplay = `<strong style="color:var(--accent-cyan);">${pageTitle}</strong> <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);">(${this.sanitize(e.event_target || '/')})</span>`;
      } else if (e.event_type === 'model_select') {
        targetDisplay = `<strong style="color:var(--accent-emerald);">${labelDisplay || targetDisplay}</strong>`;
        labelDisplay = `Konfigurasi Model/Effort: ${this.sanitize(e.event_target)}`;
      } else if (e.event_type === 'ai_query_resolved' || e.event_type === 'ai_query') {
        targetDisplay = `<strong style="color:var(--accent-emerald);">${targetDisplay}</strong>`;
      } else {
        targetDisplay = `<strong>${targetDisplay}</strong>`;
      }

      const labelHtml = labelDisplay ? `<br><small style="color:var(--text-dim);">${labelDisplay}</small>` : '';

      tr.innerHTML = `
        <td style="font-family:var(--font-mono);font-size:0.75rem;white-space:nowrap;color:var(--text-muted);">${timeStr}</td>
        <td>${typeBadge}</td>
        <td>${targetDisplay}${labelHtml}</td>
        <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">${this.sanitize(e.device_type || 'desktop')}</td>
        <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-dim);">${this.sanitize(e.session_id ? e.session_id.slice(-8) : '-')}</td>
      `;

      tbody.appendChild(tr);
    });

    if (pagEl) {
      if (totalPages <= 1) {
        pagEl.innerHTML = `<span class="pagination-info">Menampilkan ${total} dari ${total} aktivitas</span>`;
        return;
      }

      let pageButtonsHtml = '';
      const maxButtons = 7;
      let startPage = Math.max(1, this.tableCurrentPage - Math.floor(maxButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);
      if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageButtonsHtml += `
          <button type="button" class="pagination-btn ${i === this.tableCurrentPage ? 'active' : ''}" data-tablepage="${i}" aria-label="Halaman ${i}">
            ${i}
          </button>
        `;
      }

      pagEl.innerHTML = `
        <span class="pagination-info">Menampilkan ${startIdx + 1}-${endIdx} dari ${total} aktivitas (Halaman ${this.tableCurrentPage}/${totalPages})</span>
        <div class="pagination-controls">
          <button type="button" class="pagination-btn" id="table-prev-btn" ${this.tableCurrentPage === 1 ? 'disabled' : ''} aria-label="Halaman Sebelumnya">
            Prev
          </button>
          ${pageButtonsHtml}
          <button type="button" class="pagination-btn" id="table-next-btn" ${this.tableCurrentPage === totalPages ? 'disabled' : ''} aria-label="Halaman Selanjutnya">
            Next
          </button>
        </div>
      `;

      const prevBtn = pagEl.querySelector('#table-prev-btn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (this.tableCurrentPage > 1) {
            this.tableCurrentPage--;
            this.renderActivityTable();
          }
        });
      }

      const nextBtn = pagEl.querySelector('#table-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (this.tableCurrentPage < totalPages) {
            this.tableCurrentPage++;
            this.renderActivityTable();
          }
        });
      }

      pagEl.querySelectorAll('.pagination-btn[data-tablepage]').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.getAttribute('data-tablepage'), 10);
          if (page && page !== this.tableCurrentPage) {
            this.tableCurrentPage = page;
            this.renderActivityTable();
          }
        });
      });
    }
  }

  sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  exportCSV() {
    if (this.filteredEvents.length === 0) return;

    const sanitizeCsvCell = (val) => {
      let str = String(val || '');
      // Neutralize Excel/Sheets formula execution triggers (=, +, -, @, TAB)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ["ID", "Waktu_UTC", "Tipe_Event", "Target", "Label", "Perangkat", "Resolusi", "Referrer", "Sesi_ID"];
    const rows = this.filteredEvents.map((e, idx) => [
      idx + 1,
      sanitizeCsvCell(e.created_at),
      sanitizeCsvCell(e.event_type),
      sanitizeCsvCell(e.event_target),
      sanitizeCsvCell(e.event_label),
      sanitizeCsvCell(e.device_type),
      sanitizeCsvCell(e.screen_resolution),
      sanitizeCsvCell(e.referrer),
      sanitizeCsvCell(e.session_id)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJSON() {
    if (this.filteredEvents.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.filteredEvents, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `telemetry_export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // 7. SMOOTH SCROLLING & INERTIA WHEEL ENGINE (Fluid 60-120fps)
  // =========================================================================
  initInertiaSmoothWheel() {
    let currentY = window.scrollY || window.pageYOffset;
    let targetY = currentY;
    let isRunning = false;
    const ease = 0.095;

    function updateWheelPhysics() {
      const diff = targetY - currentY;
      
      if (Math.abs(diff) > 0.5) {
        currentY += diff * ease;
        window.scrollTo(0, Math.round(currentY * 10) / 10);
        requestAnimationFrame(updateWheelPhysics);
      } else {
        currentY = targetY;
        window.scrollTo(0, targetY);
        isRunning = false;
      }
    }

    window.addEventListener('wheel', (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const isScrollableChild = path.some(el => {
        if (!el || el === window || el === document || el === document.body || el === document.documentElement) return false;
        if (el.classList && (
          el.classList.contains('ai-model-auto-list') ||
          el.classList.contains('table-responsive') ||
          el.classList.contains('modal-body') ||
          el.classList.contains('terminal-body') ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'DIALOG'
        )) {
          return true;
        }
        try {
          const style = window.getComputedStyle(el);
          const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowX === 'auto' || style.overflowX === 'scroll');
          if (isScrollable && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)) {
            return true;
          }
        } catch (_) {}
        return false;
      });

      if (isScrollableChild) {
        targetY = window.scrollY || window.pageYOffset;
        currentY = targetY;
        return;
      }

      if (e.ctrlKey || e.shiftKey || e.altKey) return;

      if (Math.abs(e.deltaY) < 15 && e.deltaMode === 0) {
        targetY = window.scrollY || window.pageYOffset;
        currentY = targetY;
        return;
      }

      e.preventDefault();

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 35;
      if (e.deltaMode === 2) delta *= 750;

      targetY = Math.min(Math.max(0, targetY + delta * 1.1), maxScroll);

      if (!isRunning) {
        isRunning = true;
        currentY = window.scrollY || window.pageYOffset;
        requestAnimationFrame(updateWheelPhysics);
      }
    }, { passive: false });

    window.addEventListener('scroll', () => {
      if (!isRunning) {
        currentY = window.scrollY || window.pageYOffset;
        targetY = currentY;
      }
    }, { passive: true });
  }

  smoothScrollTo(targetY, duration = 800) {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animationLoop(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + (distance * easedProgress));

      if (progress < 1) {
        window.requestAnimationFrame(animationLoop);
      }
    }

    window.requestAnimationFrame(animationLoop);
  }

  initBackToTopButton() {
    const floatingBtn = document.getElementById('floating-back-to-top');
    if (!floatingBtn) return;

    floatingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.smoothScrollTo(0, 850);
    });

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY || window.pageYOffset;
      if (currentScroll > 300) {
        floatingBtn.classList.add('visible');
      } else {
        floatingBtn.classList.remove('visible');
      }
    }, { passive: true });
  }

  // =========================================================================
  // 8. EVENT LISTENERS & QUICK ACTIONS
  // =========================================================================
  initEventListeners() {
    // Time Range Select
    const rangeSelect = document.getElementById('dash-time-range');
    if (rangeSelect) {
      rangeSelect.addEventListener('change', (e) => {
        this.activeRange = e.target.value;
        this.filterAndRender();
      });
    }

    // Ping Test Button
    const pingBtn = document.getElementById('dash-ping-btn');
    if (pingBtn) {
      pingBtn.addEventListener('click', async () => {
        pingBtn.disabled = true;
        pingBtn.innerHTML = '<span>Mengirim...</span>';
        
        try {
          const config = this.getSupabaseConfig();
          const url = config.url;
          const key = config.anonKey;

          const res = await fetch(`${url}/rest/v1/portfolio_telemetry`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              event_type: 'link_click',
              event_target: 'ping_test',
              event_label: 'Sinyal Uji Ping Admin Dashboard',
              device_type: 'desktop',
              screen_resolution: `${window.screen.width}x${window.screen.height}`,
              referrer: 'Admin Portal',
              session_id: 'sess_admin_ping',
              created_at: new Date().toISOString()
            })
          });

          if (res.ok) {
            pingBtn.innerHTML = '<span style="color:var(--accent-emerald);">Terkirim</span>';
            setTimeout(() => {
              this.loadDashboardData();
              pingBtn.disabled = false;
              pingBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg><span>Uji Ping</span>';
            }, 1000);
          } else {
            throw new Error('Gagal');
          }
        } catch (err) {
          pingBtn.disabled = false;
          pingBtn.innerHTML = '<span style="color:var(--accent-rose);">Gagal</span>';
          setTimeout(() => {
            pingBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg><span>Uji Ping</span>';
          }, 2000);
        }
      });
    }

    // Change PIN Modal
    const changePinBtn = document.getElementById('dash-changepin-btn');
    const changePinModal = document.getElementById('changepin-modal');
    const changePinClose = document.getElementById('changepin-close-btn');
    const changePinForm = document.getElementById('changepin-form');

    if (changePinBtn && changePinModal) {
      changePinBtn.addEventListener('click', () => {
        changePinModal.classList.add('is-open');
        const pinInput = document.getElementById('new-pin-input');
        if (pinInput) pinInput.focus();
      });
    }
    if (changePinClose && changePinModal) {
      changePinClose.addEventListener('click', () => changePinModal.classList.remove('is-open'));
    }
    if (changePinModal) {
      changePinModal.addEventListener('click', (e) => {
        if (e.target === changePinModal) changePinModal.classList.remove('is-open');
      });
    }
    if (changePinForm) {
      changePinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPin = document.getElementById('new-pin-input').value.trim();
        if (newPin.length < 4) return;
        const newHash = await this.hashPin(newPin);
        localStorage.setItem('dash_custom_pin_hash', newHash);
        changePinModal.classList.remove('is-open');
        alert('Master PIN berhasil diperbarui.');
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('dash-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Export Buttons
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportCSV());

    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportJSON());

    // Search and Table Filter
    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.tableCurrentPage = 1;
        this.renderActivityTable();
      });
    }

    const typeFilter = document.getElementById('table-type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.selectedEventType = e.target.value;
        this.tableCurrentPage = 1;
        this.renderActivityTable();
      });
    }

    // Config Modal
    const configBtn = document.getElementById('dash-config-btn');
    const configModal = document.getElementById('config-modal');
    const configCloseBtn = document.getElementById('config-close-btn');
    const configForm = document.getElementById('config-form');

    if (configBtn && configModal) {
      configBtn.addEventListener('click', () => {
        const config = this.getSupabaseConfig();
        const urlInput = document.getElementById('supabase-url-input');
        const keyInput = document.getElementById('supabase-key-input');
        if (urlInput) urlInput.value = this.cleanKey(config.url) || '';
        if (keyInput) keyInput.value = this.cleanKey(config.anonKey) || '';
        configModal.classList.add('is-open');
      });
    }

    if (configCloseBtn && configModal) {
      configCloseBtn.addEventListener('click', () => configModal.classList.remove('is-open'));
    }

    if (configModal) {
      configModal.addEventListener('click', (e) => {
        if (e.target === configModal) configModal.classList.remove('is-open');
      });
    }

    if (configForm) {
      configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const urlInput = document.getElementById('supabase-url-input');
        const keyInput = document.getElementById('supabase-key-input');
        const rawUrl = this.cleanKey(urlInput?.value);
        const rawKey = this.cleanKey(keyInput?.value);

        if (!rawUrl || !rawKey) {
          alert('Harap masukkan URL dan Anon API Key Supabase yang valid.');
          return;
        }

        const cleanConfig = {
          url: rawUrl.startsWith('http') ? rawUrl.replace(/\/+$/, '') : `https://${rawUrl.replace(/\/+$/, '')}`,
          anonKey: rawKey
        };

        localStorage.setItem(CONFIG_KEY, JSON.stringify(cleanConfig));
        this.supabaseConfig = cleanConfig;
        configModal.classList.remove('is-open');

        const syncStatusEl = document.getElementById('sync-status');
        if (syncStatusEl) syncStatusEl.textContent = 'Menyambungkan ke Cloud...';
        await this.loadDashboardData();
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new DashboardApp();
  app.init();
});
