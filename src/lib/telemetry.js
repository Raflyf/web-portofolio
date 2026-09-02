/**
 * ============================================================================
 * RAFLY FIRMANSYAH - ASYNC TELEMETRY & ANALYTICS CLIENT (React Port)
 * Privacy-First, Zero-PII, Dual-Storage (Supabase REST + Local Ring Buffer)
 * Mirrors archive_v1/js/telemetry.js but uses VITE_ env vars (no hardcoded keys)
 * ============================================================================
 */

import { getSupabaseConfig } from './supabase';

const STORAGE_KEY = 'portfolio_telemetry_events';
const SESSION_KEY = 'portfolio_session_token';
const MAX_LOCAL_EVENTS = 1000;

class TelemetryEngine {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.supabaseConfig = getSupabaseConfig();
    this.deviceType = this.detectDeviceType();
    this.screenRes = (typeof window !== 'undefined' && window.screen)
      ? `${window.screen.width}x${window.screen.height}`
      : '1920x1080';
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
    } catch {
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
    } catch {
      return 'desktop';
    }
  }

  logEvent(eventType, eventTarget, eventLabel = '') {
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
      event_target: (eventTarget || 'unknown').toString().substring(0, 150),
      event_label: (eventLabel || eventTarget || '').toString().substring(0, 255),
      device_type: (this.deviceType || 'desktop').toString().substring(0, 20),
      screen_resolution: (this.screenRes || '1920x1080').toString().substring(0, 30),
      referrer: (referrerHost || 'Direct / Bookmark').toString().substring(0, 255),
      session_id: (this.sessionId || 'sess_default').toString().substring(0, 64),
      created_at: new Date().toISOString()
    };

    // 1. Always store in local high-speed circular cache instantly
    //    (offline fallback — does NOT emit the live update signal)
    this.storeLocally(payload);

    // 2. If Supabase is configured, sync asynchronously via REST API.
    //    FIX M5: the live 'telemetry_update' event is dispatched only AFTER the
    //    server write succeeds, so the dashboard never mixes unsent local
    //    events with confirmed server events.
    if (this.supabaseConfig && this.supabaseConfig.url && this.supabaseConfig.anonKey) {
      this.syncToSupabase(payload)
        .then(() => window.dispatchEvent(new Event('telemetry_update')))
        .catch(() => {});
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
    } catch {}
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
    // FIX M3: mark the local copy as synced so the dashboard only merges events
    // that are NOT yet confirmed in the server (prevents double counting).
    payload.synced = true;
    this.markSynced(payload);
  }

  // FIX M3: update the local ring buffer in place (best-effort) so synced events
  // are not re-counted on the next dashboard poll.
  markSynced(payload) {
    try {
      const existing = this.getLocalEvents();
      let changed = false;
      const next = existing.map((e) => {
        if (!e.synced && e.created_at === payload.created_at) {
          changed = true;
          return { ...e, synced: true };
        }
        return e;
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch {}
  }

  // Auto-sync any offline events that were buffered in localStorage back to Supabase Cloud
  async flushUnsyncedEvents() {
    if (!this.supabaseConfig || !this.supabaseConfig.url || !this.supabaseConfig.anonKey) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    try {
      const localEvents = this.getLocalEvents();
      // Filter strictly genuine unsynced events (buffered within the last 7 days)
      const now = Date.now();
      const unsynced = localEvents.filter(e => {
        if (e.synced) return false;
        const evTime = new Date(e.created_at || 0).getTime();
        return (now - evTime) < 7 * 24 * 60 * 60 * 1000;
      });

      if (unsynced.length === 0) return;

      // Clean payloads to strictly match Supabase table schema
      const cleanPayloads = unsynced.map(e => ({
        event_type: (e.event_type || 'unknown').toString().substring(0, 50),
        event_target: (e.event_target || 'unknown').toString().substring(0, 150),
        event_label: (e.event_label || e.event_target || '').toString().substring(0, 255),
        device_type: (e.device_type || 'desktop').toString().substring(0, 20),
        screen_resolution: (e.screen_resolution || '1920x1080').toString().substring(0, 30),
        referrer: (e.referrer || 'Direct / Bookmark').toString().substring(0, 255),
        session_id: (e.session_id || 'sess_default').toString().substring(0, 64),
        created_at: e.created_at
      }));

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
        body: JSON.stringify(cleanPayloads)
      });

      if (res.ok) {
        const flushedSet = new Set(unsynced.map(e => e.created_at));
        const updated = localEvents.map(e => {
          if (flushedSet.has(e.created_at)) {
            return { ...e, synced: true };
          }
          return e;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('telemetry_update'));
        }
      }
    } catch {
      // Best-effort silent catch
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

    // Flush any unsynced offline events immediately and listen for online reconnection
    this.flushUnsyncedEvents();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.flushUnsyncedEvents());
    }
  }
}

// Global Singleton Export
export const telemetry = new TelemetryEngine();
export default telemetry;
