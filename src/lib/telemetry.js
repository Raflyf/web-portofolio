/**
 * ============================================================================
 * RAFLY FIRMANSYAH - ASYNC TELEMETRY & ANALYTICS CLIENT (React Port)
 * Privacy-First, Zero-PII, Dual-Storage (Supabase REST + Local Ring Buffer)
 * Mirrors archive_v1/js/telemetry.js but uses VITE_ env vars (no hardcoded keys)
 * ============================================================================
 */

const STORAGE_KEY = 'portfolio_telemetry_events';
const SESSION_KEY = 'portfolio_session_token';
const MAX_LOCAL_EVENTS = 1000;

function cleanKey(val) {
  if (!val) return '';
  return String(val)
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/;+$/, '')
    .trim();
}

function getSupabaseConfig() {
  const url = cleanKey(import.meta.env.VITE_SUPABASE_URL);
  const anonKey = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (url && anonKey) {
    return {
      url: url.startsWith('http') ? url.replace(/\/+$/, '') : `https://${url.replace(/\/+$/, '')}`,
      anonKey
    };
  }
  return null;
}

class TelemetryEngine {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.supabaseConfig = getSupabaseConfig();
    this.deviceType = this.detectDeviceType();
    this.screenRes = `${window.screen.width}x${window.screen.height}`;
    this.initialized = false;
  }

  getOrCreateSessionId() {
    try {
      let sid = sessionStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid = 'sess_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
        sessionStorage.setItem(SESSION_KEY, sid);
      }
      return sid;
    } catch (_) {
      return 'sess_unknown';
    }
  }

  detectDeviceType() {
    try {
      const ua = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 768 && width <= 1024)) {
        return 'tablet';
      }
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua) || width < 768) {
        return 'mobile';
      }
      return 'desktop';
    } catch (_) {
      return 'desktop';
    }
  }

  logEvent(eventType, eventTarget, eventLabel = '') {
    let referrerHost = 'Direct / Bookmark';
    if (document.referrer) {
      try {
        referrerHost = new URL(document.referrer, window.location.origin).hostname || 'Direct / Bookmark';
      } catch (_) {
        referrerHost = 'External Domain';
      }
    }

    // Enforce strict bounds to comply with Supabase RLS and DB schema
    const payload = {
      event_type: (eventType || 'unknown').toString().substring(0, 50),
      event_target: (eventTarget || 'unknown').toString().substring(0, 150),
      event_label: (eventLabel || eventTarget || '').toString().substring(0, 255),
      device_type: (this.deviceType || 'desktop').toString().substring(0, 20),
      screen_resolution: (this.screenRes || '1920x1080').toString().substring(0, 30),
      referrer: (referrerHost || 'Direct / Bookmark').toString().substring(0, 255),
      session_id: (this.sessionId || 'sess_default').toString().substring(0, 64),
      created_at: new Date().toISOString()
    };

    // 1. Always store in local high-speed circular cache instantly
    this.storeLocally(payload);

    // 2. If Supabase is configured, sync asynchronously via REST API
    if (this.supabaseConfig && this.supabaseConfig.url && this.supabaseConfig.anonKey) {
      this.syncToSupabase(payload).catch(() => {});
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
      window.dispatchEvent(new Event('telemetry_update'));
    } catch (_) {}
  }

  getLocalEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
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

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Track Page View with human-readable target name
    const rawPath = window.location.pathname || '/';
    let pageTarget = 'Halaman Utama (Landing Page)';
    if (rawPath.includes('dashboard')) {
      pageTarget = 'Admin Dashboard & Telemetri';
    }
    this.logEvent('page_view', pageTarget, `Kunjungan Halaman: ${document.title || 'Portofolio'}`);
  }
}

// Global Singleton Export
export const telemetry = new TelemetryEngine();
export default telemetry;
