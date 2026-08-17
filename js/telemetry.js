/**
 * ============================================================================
 * RAFLY FIRMANSYAH - ASYNC TELEMETRY & ANALYTICS CLIENT (v6.0.0)
 * Privacy-First, Zero-PII, Dual-Storage (Supabase REST + Local Cache)
 * ============================================================================
 */

const STORAGE_KEY = 'portfolio_telemetry_events';
const CONFIG_KEY = 'portfolio_supabase_config';
const SESSION_KEY = 'portfolio_session_token';
const MAX_LOCAL_EVENTS = 1000;

class TelemetryEngine {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.supabaseConfig = this.loadSupabaseConfig();
    this.deviceType = this.detectDeviceType();
    this.screenRes = `${window.screen.width}x${window.screen.height}`;
    this.initialized = false;
  }

  getOrCreateSessionId() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'sess_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  loadSupabaseConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        url: parsed.url || 'https://rphyzcqwpkxtzllvymss.supabase.co',
        anonKey: parsed.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU'
      };
    } catch {
      return {
        url: 'https://rphyzcqwpkxtzllvymss.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU'
      };
    }
  }

  detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 768 && width <= 1024)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua) || width < 768) {
      return 'mobile';
    }
    return 'desktop';
  }

  async logEvent(eventType, eventTarget, eventLabel = '') {
    let referrerHost = 'Direct / Bookmark';
    if (document.referrer) {
      try {
        referrerHost = new URL(document.referrer, window.location.origin).hostname || 'Direct / Bookmark';
      } catch {
        referrerHost = 'External Domain';
      }
    }

    // Enforce strict bounds to comply with Supabase RLS and DB schema
    const payload = {
      event_type: (eventType || 'unknown').toString().substring(0, 50),
      event_target: (eventTarget || 'unknown').toString().substring(0, 140),
      event_label: (eventLabel || eventTarget || '').toString().substring(0, 240),
      device_type: (this.deviceType || 'desktop').toString().substring(0, 20),
      screen_resolution: (this.screenRes || '1920x1080').toString().substring(0, 30),
      referrer: (referrerHost || 'Direct / Bookmark').toString().substring(0, 240),
      session_id: (this.sessionId || 'sess_default').toString().substring(0, 60),
      created_at: new Date().toISOString()
    };

    // 1. Always store in local high-speed circular cache instantly
    this.storeLocally(payload);

    // 2. If Supabase is configured, sync asynchronously via REST API
    if (this.supabaseConfig && this.supabaseConfig.url && this.supabaseConfig.anonKey) {
      this.syncToSupabase(payload).catch(err => {
        console.debug('[Telemetry] Supabase sync deferred:', err.message);
      });
    }
  }

  storeLocally(payload) {
    try {
      const existing = this.getLocalEvents();
      existing.unshift(payload);
      if (existing.length > MAX_LOCAL_EVENTS) {
        existing.length = MAX_LOCAL_EVENTS;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.debug('[Telemetry] LocalStorage quota exceeded', e);
    }
  }

  getLocalEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async syncToSupabase(payload) {
    if (!this.supabaseConfig || !this.supabaseConfig.url || !this.supabaseConfig.anonKey) return;
    const endpoint = `${this.supabaseConfig.url.replace(/\/$/, '')}/rest/v1/portfolio_telemetry`;
    const res = await fetch(endpoint, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.supabaseConfig.anonKey,
        'Authorization': `Bearer ${this.supabaseConfig.anonKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Supabase API responded with status ${res.status}`);
    }
  }

  // Automatic Comprehensive Listener Attachments
  init() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Track Page View
    const pagePath = window.location.pathname || '/';
    this.logEvent('page_view', pagePath, `Kunjungan Halaman: ${document.title}`);

    // 2. Track Clicks on All Interactive Elements
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [role="button"]');
      if (!target) return;

      // WhatsApp links
      if (target.href && target.href.includes('wa.me')) {
        this.logEvent('link_click', 'whatsapp', 'Klik Tombol Chat WhatsApp');
        return;
      }

      // GitHub Profile / Repos
      if (target.href && target.href.includes('github.com')) {
        const repo = target.href.replace('https://github.com/Raflyf/', '').replace(/\/$/, '');
        this.logEvent('link_click', repo ? `github_${repo}` : 'github_profile', `Klik Tautan GitHub (${repo || 'Profil Utama'})`);
        return;
      }

      // PDF / Cert Preview in tab
      if (target.href && target.href.includes('preview.html')) {
        const urlObj = new URL(target.href, window.location.origin);
        const title = urlObj.searchParams.get('title') || 'Dokumen Sertifikat';
        this.logEvent('cert_view', title, `Buka Pratinjau Sertifikat: ${title}`);
        return;
      }

      // Copy Email Button
      if (target.id === 'copy-email-btn' || target.closest('#copy-email-btn')) {
        this.logEvent('link_click', 'copy_email', 'Salin Alamat Email');
        return;
      }

      // Spotlight Project Detail
      if (target.id === 'btn-spotlight-detail') {
        this.logEvent('project_view', 'openplagiarismchecker', 'Lihat Detail Spotlight: OpenPlagiarismChecker');
        return;
      }

      // Project Card & Detail Buttons
      if (target.classList.contains('btn-project-detail') || target.closest('.project-card')) {
        const title = target.closest('.project-card')?.querySelector('.project-card__title')?.textContent || 'Detail Proyek';
        this.logEvent('project_view', title, `Lihat Detail Proyek: ${title}`);
        return;
      }

      // Certificate View Modal
      if (target.classList.contains('btn-cert-view')) {
        const title = target.closest('.certificate-card')?.querySelector('.cert-card__title')?.textContent || 'Sertifikat';
        this.logEvent('cert_view', title, `Buka Detail Kredensial: ${title}`);
        return;
      }

      // Terminal Chips
      if (target.classList.contains('terminal-chip')) {
        const cmd = target.getAttribute('data-cmd') || target.textContent.trim();
        this.logEvent('terminal_cmd', cmd, `Pintasan Chip: $ ${cmd}`);
        return;
      }

      // Terminal Open/Pop-up Buttons
      if (target.id === 'terminal-pop-btn' || target.id === 'floating-terminal-btn' || target.closest('#floating-terminal-btn')) {
        this.logEvent('terminal_open', 'terminal_modal', 'Buka Jendela Terminal AI Modal');
        return;
      }

      // Back to Top
      if (target.id === 'back-to-top' || target.id === 'floating-back-to-top' || target.closest('#floating-back-to-top')) {
        this.logEvent('nav_click', 'back_to_top', 'Gulir Kembali ke Atas Halaman');
        return;
      }

      // Navigation Menu Links
      if (target.classList.contains('nav-link')) {
        const href = target.getAttribute('href') || '#';
        this.logEvent('nav_click', href, `Navigasi Menu: ${target.textContent.trim()}`);
        return;
      }

      // Certificate Filter Tabs
      if (target.hasAttribute('data-filter-cert')) {
        const filter = target.getAttribute('data-filter-cert');
        this.logEvent('cert_filter', filter, `Filter Sertifikat: ${target.textContent.trim()}`);
        return;
      }

      // Theme Toggle Button
      if (target.id === 'theme-toggle' || target.closest('#theme-toggle')) {
        this.logEvent('theme_toggle', 'mode_switch', 'Ubah Mode Tema Tampilan');
        return;
      }
    }, { passive: true });

    // 3. Track Dropdown Changes (Model & Reasoning Mode)
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'terminal-model-select') {
        const chosen = e.target.value;
        const text = e.target.options[e.target.selectedIndex]?.text || chosen;
        this.logEvent('model_select', chosen, `Pilihan Model: ${text}`);
      } else if (e.target && e.target.id === 'terminal-effort-select') {
        const chosen = e.target.value;
        const text = e.target.options[e.target.selectedIndex]?.text || chosen;
        this.logEvent('model_select', `effort_${chosen}`, `Mode Reasoning: ${text}`);
      }
    });

    // 4. Track Form Submissions
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'contact-form') {
        this.logEvent('contact_submit', 'contact_form', 'Kirim Formulir Pesan Kontak');
      } else if (e.target && e.target.id === 'terminal-form') {
        const inputEl = document.getElementById('terminal-input');
        const val = inputEl ? inputEl.value.trim() : '';
        if (val) {
          this.logEvent('terminal_cmd', val.substring(0, 50), `Kueri Terminal: ${val.substring(0, 100)}`);
        }
      }
    });
  }
}

// Global Singleton Export
export const telemetry = new TelemetryEngine();
export default telemetry;
