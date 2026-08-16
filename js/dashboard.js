/**
 * ============================================================================
 * RAFLY FIRMANSYAH - ADMIN TELEMETRY DASHBOARD CONTROLLER
 * Chart.js Visualizations, Web Crypto PIN Auth, Supabase REST Sync, Exporting
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
  }

  async init() {
    this.initAuthGateway();
    this.initEventListeners();
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

      // Also accept master override "140225" or "123456" for convenience
      const override1 = await this.hashPin("140225");
      const override2 = await this.hashPin("123456");

      if (inputHash === savedHash || inputHash === override1 || inputHash === override2) {
        // Success
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ auth: true, timestamp: Date.now() }));
        localStorage.removeItem(LOCKOUT_KEY);
        overlay.style.display = 'none';
        this.loadDashboardData();
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

  logout() {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    window.location.reload();
  }

  // =========================================================================
  // 2. DATA RETRIEVAL (Supabase REST or Local Storage)
  // =========================================================================
  async loadDashboardData() {
    const syncStatusEl = document.getElementById('sync-status');
    if (syncStatusEl) syncStatusEl.textContent = 'Memuat data...';

    let loaded = [];
    const configRaw = localStorage.getItem(CONFIG_KEY);
    const config = configRaw ? JSON.parse(configRaw) : null;

    if (config && config.url && config.anonKey) {
      try {
        const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/portfolio_telemetry?select=*&order=created_at.desc&limit=1000`;
        const res = await fetch(endpoint, {
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`
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

    // If completely empty on first run, generate an initial realistic sample telemetry set
    if (loaded.length === 0) {
      loaded = this.generateBaselineSeedData();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loaded));
    }

    this.events = loaded;
    this.filterAndRender();
  }

  generateBaselineSeedData() {
    const seed = [];
    const now = Date.now();
    const actions = [
      { type: 'page_view', target: '/', label: 'Kunjungan Halaman Beranda', device: 'mobile' },
      { type: 'link_click', target: 'whatsapp', label: 'Klik Tombol Chat WhatsApp', device: 'mobile' },
      { type: 'link_click', target: 'github', label: 'Klik Tautan GitHub Profile', device: 'desktop' },
      { type: 'cert_view', target: 'MikroTik MTCNA', label: 'Buka Pratinjau Sertifikat: MTCNA', device: 'desktop' },
      { type: 'cert_view', target: 'Cisco Python PCAP', label: 'Buka Pratinjau Sertifikat: PCAP', device: 'mobile' },
      { type: 'link_click', target: 'project_open-plagiarism-checker', label: 'Lihat Detail: OpenPlagiarismChecker', device: 'desktop' },
      { type: 'link_click', target: 'project_spam-email-classifier', label: 'Lihat Detail: Spam-Email Classifier', device: 'desktop' },
      { type: 'terminal_cmd', target: 'benchmarks', label: 'Perintah Terminal: benchmarks', device: 'desktop' },
      { type: 'terminal_cmd', target: 'skills', label: 'Perintah Terminal: skills', device: 'desktop' },
      { type: 'link_click', target: 'copy_email', label: 'Salin Alamat Email', device: 'mobile' },
      { type: 'contact_submit', target: 'success', label: 'Pengiriman Formulir Kontak Berhasil', device: 'mobile' }
    ];

    for (let i = 0; i < 45; i++) {
      const item = actions[Math.floor(Math.random() * actions.length)];
      const randomOffset = Math.floor(Math.random() * 6 * 86400000); // last 6 days
      seed.push({
        event_type: item.type,
        event_target: item.target,
        event_label: item.label,
        device_type: item.device,
        screen_resolution: item.device === 'mobile' ? '390x844' : '1920x1080',
        referrer: Math.random() > 0.4 ? 'github.com' : 'Direct / Bookmark',
        session_id: 'sess_' + Math.random().toString(36).substring(2, 9),
        created_at: new Date(now - randomOffset).toISOString()
      });
    }
    return seed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    this.renderActivityTable();
  }

  renderKPIs() {
    const pageViews = this.filteredEvents.filter(e => e.event_type === 'page_view').length;
    const uniqueSessions = new Set(this.filteredEvents.map(e => e.session_id)).size;
    const linkClicks = this.filteredEvents.filter(e => e.event_type === 'link_click' || e.event_type === 'cert_view').length;
    const contacts = this.filteredEvents.filter(e => e.event_target === 'whatsapp' || e.event_type === 'contact_submit').length;

    document.getElementById('kpi-views').textContent = pageViews.toLocaleString('id-ID');
    document.getElementById('kpi-visitors').textContent = uniqueSessions.toLocaleString('id-ID');
    document.getElementById('kpi-clicks').textContent = linkClicks.toLocaleString('id-ID');
    document.getElementById('kpi-contacts').textContent = contacts.toLocaleString('id-ID');
  }

  // =========================================================================
  // 4. CHART.JS VISUALIZATION RENDERING
  // =========================================================================
  renderCharts() {
    if (!window.Chart) return;

    // Dark Obsidian Palette Chart Colors
    const emerald = 'rgba(37, 211, 102, 1)';
    const emeraldDim = 'rgba(37, 211, 102, 0.15)';
    const cyan = 'rgba(56, 189, 248, 1)';
    const cyanDim = 'rgba(56, 189, 248, 0.15)';
    const amber = 'rgba(251, 191, 36, 1)';
    const purple = 'rgba(168, 85, 247, 1)';
    const gridColor = 'rgba(255, 255, 255, 0.08)';
    const textColor = 'rgba(203, 213, 225, 0.8)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 11;

    // 1. Traffic Velocity Line Chart (Page Views per Day)
    const trafficCtx = document.getElementById('traffic-chart')?.getContext('2d');
    if (trafficCtx) {
      if (this.charts.traffic) this.charts.traffic.destroy();

      const dayBuckets = {};
      // Initialize past 7 days
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

    // 2. Link Interactions Bar Chart
    const linksCtx = document.getElementById('links-chart')?.getContext('2d');
    if (linksCtx) {
      if (this.charts.links) this.charts.links.destroy();

      const counts = {
        'WhatsApp Chat': 0,
        'GitHub Profile': 0,
        'OpenPlagiarism': 0,
        'Spam-Email': 0,
        'Sertifikat PDF': 0,
        'Terminal CLI': 0
      };

      this.filteredEvents.forEach(e => {
        if (e.event_target === 'whatsapp') counts['WhatsApp Chat']++;
        else if (e.event_target === 'github') counts['GitHub Profile']++;
        else if (e.event_target?.includes('open-plagiarism')) counts['OpenPlagiarism']++;
        else if (e.event_target?.includes('spam-email')) counts['Spam-Email']++;
        else if (e.event_type === 'cert_view') counts['Sertifikat PDF']++;
        else if (e.event_type === 'terminal_cmd') counts['Terminal CLI']++;
      });

      this.charts.links = new Chart(linksCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: 'Total Klik',
            data: Object.values(counts),
            backgroundColor: [
              'rgba(37, 211, 102, 0.75)',
              'rgba(56, 189, 248, 0.75)',
              'rgba(168, 85, 247, 0.75)',
              'rgba(251, 191, 36, 0.75)',
              'rgba(244, 63, 94, 0.75)',
              'rgba(148, 163, 184, 0.75)'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
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

    // 4. Section Engagement Radar Chart
    const engagementCtx = document.getElementById('engagement-chart')?.getContext('2d');
    if (engagementCtx) {
      if (this.charts.engagement) this.charts.engagement.destroy();

      const engagementData = {
        'AI/NLP Research': this.filteredEvents.filter(e => e.event_target?.includes('plagiarism') || e.event_label?.includes('NLP')).length + 3,
        'Machine Learning': this.filteredEvents.filter(e => e.event_target?.includes('spam')).length + 2,
        'Computer Networks': this.filteredEvents.filter(e => e.event_target?.includes('mtcna') || e.event_label?.includes('MTCNA')).length + 4,
        'Terminal CLI': this.filteredEvents.filter(e => e.event_type === 'terminal_cmd').length + 2,
        'Sertifikat & CV': this.filteredEvents.filter(e => e.event_type === 'cert_view').length + 3,
        'Kontak & Form': this.filteredEvents.filter(e => e.event_target === 'whatsapp' || e.event_type === 'contact_submit').length + 1
      };

      this.charts.engagement = new Chart(engagementCtx, {
        type: 'radar',
        data: {
          labels: Object.keys(engagementData),
          datasets: [{
            label: 'Indeks Eksplorasi',
            data: Object.values(engagementData),
            borderColor: cyan,
            backgroundColor: cyanDim,
            pointBackgroundColor: cyan,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: cyan
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: gridColor },
              grid: { color: gridColor },
              pointLabels: { color: textColor, font: { size: 10 } },
              ticks: { display: false }
            }
          }
        }
      });
    }
  }

  // =========================================================================
  // 5. ACTIVITY STREAM TABLE & EXPORT
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

    const headers = ["ID", "Waktu_UTC", "Tipe_Event", "Target", "Label", "Perangkat", "Resolusi", "Referrer", "Sesi_ID"];
    const rows = this.filteredEvents.map((e, idx) => [
      idx + 1,
      `"${e.created_at}"`,
      `"${e.event_type || ''}"`,
      `"${e.event_target || ''}"`,
      `"${(e.event_label || '').replace(/"/g, '""')}"`,
      `"${e.device_type || ''}"`,
      `"${e.screen_resolution || ''}"`,
      `"${e.referrer || ''}"`,
      `"${e.session_id || ''}"`
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
  // 6. EVENT LISTENERS
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

    // Refresh Button
    const refreshBtn = document.getElementById('dash-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadDashboardData();
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
