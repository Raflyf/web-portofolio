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
  }

  async init() {
    this.initAuthGateway();
    this.initEventListeners();
    this.initInertiaSmoothWheel();
    this.initBackToTopButton();
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
    // Real-time live background polling every 3 seconds
    this.pollInterval = setInterval(() => {
      this.loadDashboardData(true);
    }, 3000);
  }

  logout() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    window.location.reload();
  }

  // =========================================================================
  // 2. DATA RETRIEVAL (Anti-Cache Supabase REST & Local Storage)
  // =========================================================================
  async loadDashboardData(isBackground = false) {
    const syncStatusEl = document.getElementById('sync-status');
    if (syncStatusEl && !isBackground) syncStatusEl.textContent = 'Memuat data...';

    let loaded = [];
    const configRaw = localStorage.getItem(CONFIG_KEY);
    const parsedConfig = configRaw ? JSON.parse(configRaw) : {};
    const config = {
      url: parsedConfig.url || 'https://rphyzcqwpkxtzllvymss.supabase.co',
      anonKey: parsedConfig.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU'
    };

    if (config && config.url && config.anonKey) {
      try {
        const timestamp = Date.now();
        const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/portfolio_telemetry?select=*&order=created_at.desc&limit=1000&_t=${timestamp}`;
        const res = await fetch(endpoint, {
          cache: 'no-store',
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          loaded = await res.json();
          if (syncStatusEl) syncStatusEl.textContent = 'Cloud Supabase Terhubung';
        }
      } catch (err) {
        console.warn('Gagal memuat Supabase, beralih ke cache lokal:', err);
      }
    }

    if (!loaded || loaded.length === 0) {
      // Fallback to local storage cache
      const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      loaded = localRaw ? JSON.parse(localRaw) : [];
      if (syncStatusEl) syncStatusEl.textContent = 'Penyimpanan Lokal Aktif';
    }

    this.events = loaded;
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
    const tag = isAuto ? '⚡ Auto: ' : '';

    if (combined.includes('deepseek-r1') || combined.includes('thinking') || combined.includes('reasoning')) return `${tag}DeepSeek R1 (Thinking CoT)`;
    if (combined.includes('deepseek-chat') || combined.includes('deepseek-v3') || combined.includes('deepseek')) return `${tag}DeepSeek V3 (671B MoE)`;
    if (combined.includes('qwen') || combined.includes('coder') || combined.includes('koding')) return `${tag}Qwen 2.5 Coder (32B)`;
    if (combined.includes('llama-3.3') || combined.includes('llama 3.3')) return `${tag}Meta Llama 3.3 (70B)`;
    if (combined.includes('nemotron') || combined.includes('nvidia')) return `${tag}Nvidia Nemotron (70B Ultra)`;
    if (combined.includes('gemma') || combined.includes('vision') || combined.includes('gemini')) return `${tag}Google Gemma 3 (27B Vision)`;
    if (combined.includes('minimax')) return `${tag}MiniMax-01 (456B MoE)`;
    if (combined.includes('ollama') || combined.includes('kimi')) return `${tag}Ollama Cloud Kimi K2.7`;
    if (combined.includes('local_semantic') || combined.includes('semantic engine')) return '⚡ Auto: Local Semantic Fallback';

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
    // 1. AI Model & Topic Intelligence
    const aiListEl = document.getElementById('ai-ranked-list');
    if (aiListEl) {
      const counts = {};
      this.filteredEvents.filter(e => e.event_type === 'ai_query' || e.event_type === 'ai_query_resolved' || e.event_type === 'model_select' || e.event_type === 'terminal_cmd').forEach(e => {
        const unified = this.normalizeAIQuery(e.event_target, e.event_label);
        counts[unified] = (counts[unified] || 0) + 1;
      });

      if (Object.keys(counts).length === 0) {
        counts['⚡ Auto: DeepSeek V3 (671B MoE)'] = 0;
        counts['⚡ Auto: Meta Llama 3.3 (70B)'] = 0;
        counts['DeepSeek R1 (Thinking CoT)'] = 0;
        counts['Qwen 2.5 Coder (32B)'] = 0;
      }

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const maxVal = Math.max(1, ...sorted.map(c => c[1]));

      aiListEl.innerHTML = sorted.map(([name, count]) => {
        const pct = Math.round((count / maxVal) * 100);
        return `
          <div class="ranked-item">
            <div class="ranked-item-header">
              <span class="ranked-item-name" style="max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.sanitize(name)}">🤖 ${this.sanitize(name)}</span>
              <span class="ranked-item-count">${count}x</span>
            </div>
            <div class="ranked-progress-bg">
              <div class="ranked-progress-fill" style="width:${pct}%;background-color:var(--accent-cyan);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Project Exploration Leaderboard
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

      projectListEl.innerHTML = sorted.map(([name, count]) => {
        const pct = Math.round((count / maxVal) * 100);
        return `
          <div class="ranked-item">
            <div class="ranked-item-header">
              <span class="ranked-item-name" style="max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.sanitize(name)}">📁 ${this.sanitize(name)}</span>
              <span class="ranked-item-count">${count}x</span>
            </div>
            <div class="ranked-progress-bg">
              <div class="ranked-progress-fill" style="width:${pct}%;background-color:oklch(0.80 0.18 280);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Certificate Views Leaderboard (Consolidated)
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

      certListEl.innerHTML = sortedCerts.map(([title, count]) => {
        const pct = Math.round((count / maxCert) * 100);
        return `
          <div class="ranked-item">
            <div class="ranked-item-header">
              <span class="ranked-item-name" style="max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.sanitize(title)}">📜 ${this.sanitize(title)}</span>
              <span class="ranked-item-count">${count}x</span>
            </div>
            <div class="ranked-progress-bg">
              <div class="ranked-progress-fill" style="width:${pct}%;background-color:var(--accent-emerald);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Traffic Acquisition & Referrer Leaderboard
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

      refListEl.innerHTML = sortedRefs.map(([source, count]) => {
        const pct = Math.round((count / maxRef) * 100);
        return `
          <div class="ranked-item">
            <div class="ranked-item-header">
              <span class="ranked-item-name" style="max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.sanitize(source)}">🌐 ${this.sanitize(source)}</span>
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
  // 6. ACTIVITY STREAM TABLE & EXPORT
  // =========================================================================
  renderActivityTable() {
    const tbody = document.getElementById('activity-table-body');
    if (!tbody) return;

    let displayList = this.filteredEvents;

    if (this.selectedEventType !== 'all') {
      displayList = displayList.filter(e => e.event_type === this.selectedEventType);
    }

    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      displayList = displayList.filter(e => 
        (e.event_label && e.event_label.toLowerCase().includes(q)) ||
        (e.event_target && e.event_target.toLowerCase().includes(q)) ||
        (e.session_id && e.session_id.toLowerCase().includes(q))
      );
    }

    tbody.innerHTML = '';

    if (displayList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-dim);">Tidak ada rekaman aktivitas yang sesuai filter.</td></tr>`;
      return;
    }

    // Render top 50 recent events
    displayList.slice(0, 50).forEach(e => {
      const tr = document.createElement('tr');

      const dateObj = new Date(e.created_at);
      const timeStr = dateObj.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });

      tr.innerHTML = `
        <td style="font-family:var(--font-mono);font-size:0.775rem;white-space:nowrap;">${this.sanitize(timeStr)}</td>
        <td><span class="event-type-badge ${this.sanitize(e.event_type)}">${this.sanitize(e.event_type)}</span></td>
        <td><strong>${this.sanitize(e.event_label || e.event_target)}</strong></td>
        <td><span style="text-transform:capitalize;font-size:0.8rem;">${this.sanitize(e.device_type || 'desktop')}</span></td>
        <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-dim);">${this.sanitize(e.session_id ? e.session_id.substring(0, 12) + '...' : '-')}</td>
      `;

      tbody.appendChild(tr);
    });
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
        if (!el || !el.classList) return false;
        return (
          el.classList.contains('table-responsive') ||
          el.tagName === 'TEXTAREA'
        );
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
        floatingBtn.classList.add('is-visible');
      } else {
        floatingBtn.classList.remove('is-visible');
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
          const configRaw = localStorage.getItem(CONFIG_KEY);
          const parsedConfig = configRaw ? JSON.parse(configRaw) : {};
          const url = parsedConfig.url || 'https://rphyzcqwpkxtzllvymss.supabase.co';
          const key = parsedConfig.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU';

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
            pingBtn.innerHTML = '<span style="color:var(--accent-emerald);">Terkirim ✓</span>';
            setTimeout(() => {
              this.loadDashboardData();
              pingBtn.disabled = false;
              pingBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span>Uji Ping</span>';
            }, 1000);
          } else {
            throw new Error('Gagal');
          }
        } catch (err) {
          pingBtn.disabled = false;
          pingBtn.innerHTML = '<span style="color:var(--accent-rose);">Gagal ✗</span>';
        }
      });
    }

    // Change PIN Modal
    const changePinBtn = document.getElementById('dash-changepin-btn');
    const changePinModal = document.getElementById('changepin-modal');
    const changePinClose = document.getElementById('changepin-close-btn');
    const changePinForm = document.getElementById('changepin-form');

    if (changePinBtn && changePinModal) {
      changePinBtn.addEventListener('click', () => changePinModal.classList.add('is-open'));
    }
    if (changePinClose && changePinModal) {
      changePinClose.addEventListener('click', () => changePinModal.classList.remove('is-open'));
    }
    if (changePinForm) {
      changePinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPin = document.getElementById('new-pin-input').value.trim();
        if (newPin.length < 4) return;
        const newHash = await this.hashPin(newPin);
        localStorage.setItem('dash_custom_pin_hash', newHash);
        changePinModal.classList.remove('is-open');
        alert('Master PIN berhasil diperbarui!');
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
        this.renderActivityTable();
      });
    }

    const typeFilter = document.getElementById('table-type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        this.selectedEventType = e.target.value;
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
        const current = localStorage.getItem(CONFIG_KEY);
        if (current) {
          try {
            const parsed = JSON.parse(current);
            document.getElementById('supabase-url-input').value = parsed.url || '';
            document.getElementById('supabase-key-input').value = parsed.anonKey || '';
          } catch (e) {}
        }
        configModal.classList.add('is-open');
      });
    }

    if (configCloseBtn && configModal) {
      configCloseBtn.addEventListener('click', () => configModal.classList.remove('is-open'));
    }

    if (configForm) {
      configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('supabase-url-input').value.trim();
        const anonKey = document.getElementById('supabase-key-input').value.trim();

        localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, anonKey }));
        configModal.classList.remove('is-open');
        this.loadDashboardData();
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new DashboardApp();
  app.init();
});
