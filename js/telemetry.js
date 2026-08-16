/**
 * ============================================================================
 * RAFLY FIRMANSYAH - ASYNC TELEMETRY & ANALYTICS CLIENT
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
        anonKey: parsed.anonKey || ''
      };
    } catch {
      return {
        url: 'https://rphyzcqwpkxtzllvymss.supabase.co',
        anonKey: ''
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
    const payload = {
      event_type: eventType,
      event_target: eventTarget,
      event_label: eventLabel || eventTarget,
      device_type: this.deviceType,
      screen_resolution: this.screenRes,
      referrer: document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'Direct / Bookmark',
      session_id: this.sessionId,
      created_at: new Date().toISOString()
    };

    // 1. Always store in local high-speed circular cache
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
    const endpoint = `${this.supabaseConfig.url.replace(/\/$/, '')}/rest/v1/portfolio_telemetry`;
    const res = await fetch(endpoint, {
      method: 'POST',
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

  // Automatic Listener Attachments
  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Track Page View
    const pagePath = window.location.pathname || '/';
    this.logEvent('page_view', pagePath, `Kunjungan Halaman ${document.title}`);

    // Track Clicks on Interactive Elements
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;

      // WhatsApp links
      if (target.href && target.href.includes('wa.me')) {
        this.logEvent('link_click', 'whatsapp', 'Klik Tombol Chat WhatsApp');
        return;
      }

      // GitHub Profile / Repos
      if (target.href && target.href.includes('github.com')) {
        const repo = target.href.replace('https://github.com/Raflyf/', '').replace(/\/$/, '');
        this.logEvent('link_click', 'github', `Klik Tautan GitHub (${repo || 'Profile'})`);
        return;
      }

      // PDF / Cert Buttons
      if (target.href && target.href.includes('preview.html')) {
        const urlObj = new URL(target.href, window.location.origin);
        const title = urlObj.searchParams.get('title') || 'Dokumen Sertifikat';
        this.logEvent('cert_view', title, `Buka Pratinjau Sertifikat: ${title}`);
        return;
      }

      // Copy Email Button
      if (target.id === 'copy-email-btn') {
        this.logEvent('link_click', 'copy_email', 'Salin Alamat Email');
        return;
      }

      // Project Modals
      if (target.matches('[data-project-id]') || target.closest('[data-project-id]')) {
        const el = target.matches('[data-project-id]') ? target : target.closest('[data-project-id]');
        const pid = el.getAttribute('data-project-id');
        this.logEvent('link_click', `project_${pid}`, `Lihat Detail Proyek: ${pid}`);
        return;
      }
    }, { passive: true });
  }
}

// Global Singleton Export
export const telemetry = new TelemetryEngine();
export default telemetry;
