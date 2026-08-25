/**
 * ============================================================================
 * RAFLY FIRMANSYAH - ADMIN OBSERVABILITY DASHBOARD CONTROLLER (v6.2.0)
 * HorizonX Deep Obsidian Glassmorphism Architecture & Dual-Theme Engine
 * Features:
 * - 🛡️ Web Crypto PIN Auth & Supabase Cloud-Synced Master Kredensial
 * - ✉️ Email OTP Recovery Engine (raflyfirmansyah02@gmail.com)
 * - 🌓 Dual-Theme Controller (Dark & Light Mode with Dynamic Chart.js)
 * - 📊 3D Glassmorphic Bento KPIs & Chart.js Multi-Metric Visualizations
 * - 🤖 Standalone Auto Router Banner & Dynamic Most-Used AI Model Ranking
 * - ⚡ OmniRoute Dual-Endpoint Host Probing & Live Traffic Deduplication
 * - 🌊 Kinetic Bidirectional Scroll Reveal (Optical De-Blur & Spring Curve)
 * - 🚀 Momentum Inertia Smooth Wheel Physics Engine (60-120fps fluid scroll)
 * - 📑 Compact Sliding Window Pagination (Eliminates Button Overflow)
 * ============================================================================
 */

// Default Hash for Master PIN "080402" (SHA-256 + Salt "rafly_telemetry_salt")
const PIN_SALT = "rafly_telemetry_salt";
const DEFAULT_PIN_HASH = "db533e5fe9b399627eb386c19c967aa171dbc121a43fda2fa583c0a731aba78c"; 
const SESSION_AUTH_KEY = "dash_admin_auth_session";
const LOCKOUT_KEY = "dash_admin_lockout_info";
const CONFIG_KEY = "portfolio_supabase_config";
const LOCAL_STORAGE_KEY = "portfolio_telemetry_events";

class DashboardApp {
  constructor() {
    this.events = [];
    this.analyticsRange = '7d';
    this.aiModelsRange = 'all';
    this.ragMemoriesRange = 'all';
    this.tableRange = '7d';
    this.charts = {};
    this.searchTerm = '';
    this.selectedEventType = 'all';
    this.pollInterval = null;
    this.supabaseConfig = this.getSupabaseConfig();
    this.memories = [];
    this.memoryCurrentPage = 1;
    this.memoryPageSize = 8;
    this.tableCurrentPage = 1;
    this.tablePageSize = 10;
    this.cloudPinHash = null;
    this.currentTheme = localStorage.getItem('portfolio_theme') || 'dark';
    this.scrollObserver = null;
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
    this.initThemeEngine();
    this.initAuthGateway();
    this.initOtpResetFlow();
    this.initCustomDropdowns();
    this.initEventListeners();
    this.initScrollReveal();
    this.initInertiaSmoothWheel();
    this.initBackToTopButton();
    this.checkOmniRouteRealtimeStatus();
  }

  // =========================================================================
  // 1. THEME CONTROLLER (Full HorizonX Dark & Light Synchronization)
  // =========================================================================
  initThemeEngine() {
    const root = document.documentElement;

    const applyTheme = (theme) => {
      this.currentTheme = theme;
      root.setAttribute('data-theme', theme);
      localStorage.setItem('portfolio_theme', theme);

      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        const sunIcon = btn.querySelector('.sun-icon');
        const moonIcon = btn.querySelector('.moon-icon');
        if (theme === 'light') {
          if (sunIcon) sunIcon.style.display = 'block';
          if (moonIcon) moonIcon.style.display = 'none';
        } else {
          if (sunIcon) sunIcon.style.display = 'none';
          if (moonIcon) moonIcon.style.display = 'block';
        }
      });

      // Re-render charts with updated theme colors
      if (Object.keys(this.charts).length > 0) {
        this.renderCharts();
      }
    };

    this.toggleTheme = () => {
      const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    };

    applyTheme(this.currentTheme);

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleTheme();
      });
    });
  }

  // =========================================================================
  // 2. KINETIC BIDIRECTIONAL SCROLL REVEAL (De-Blur & Spring Curve)
  // =========================================================================
  initScrollReveal() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    if ('IntersectionObserver' in window) {
      this.scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          } else {
            entry.target.classList.remove('is-revealed');
            // If element is above the viewport, mark it as reveal-from-top so it slides down when scrolling back up
            if (entry.boundingClientRect.top < 0) {
              entry.target.classList.add('reveal-from-top');
            } else {
              entry.target.classList.remove('reveal-from-top');
            }
          }
        });
      }, {
        rootMargin: '10px 0px -10px 0px',
        threshold: 0.08
      });

      this.refreshScrollReveal();
    } else {
      document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('is-revealed'));
    }
  }

  refreshScrollReveal() {
    if (!this.scrollObserver) return;
    const items = document.querySelectorAll(
      '.kpi-card, .chart-card, .intel-card, .omniroute-topology-card, .ai-models-matrix-card, .table-card, .dash-section-bar'
    );
    items.forEach(el => {
      el.classList.add('reveal-item');
      this.scrollObserver.observe(el);
    });
  }

  // =========================================================================
  // 3. CRYPTOGRAPHIC PIN AUTHENTICATION & SUPABASE CLOUD SYNC
  // =========================================================================
  async hashPin(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + PIN_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async fetchCloudPinHash() {
    // 1. Try Vercel Serverless Endpoint
    try {
      const res = await fetch('/api/admin-otp?action=get_auth_state', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.pin_hash) {
          this.cloudPinHash = data.pin_hash;
          localStorage.setItem('dash_custom_pin_hash', data.pin_hash);
          return data.pin_hash;
        }
      }
    } catch (_) {}

    // 2. Direct Supabase Fallback Query
    try {
      const config = this.getSupabaseConfig();
      if (config && config.url && config.anonKey) {
        const res = await fetch(`${config.url}/rest/v1/admin_auth_config?id=eq.master_auth&select=*`, {
          method: 'GET',
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0].pin_hash) {
            this.cloudPinHash = rows[0].pin_hash;
            localStorage.setItem('dash_custom_pin_hash', rows[0].pin_hash);
            return rows[0].pin_hash;
          }
        }
      }
    } catch (_) {}

    const localSaved = localStorage.getItem('dash_custom_pin_hash');
    this.cloudPinHash = localSaved || DEFAULT_PIN_HASH;
    return this.cloudPinHash;
  }

  initAuthGateway() {
    const overlay = document.getElementById('pin-gateway');
    const form = document.getElementById('pin-form');
    const input = document.getElementById('pin-input');
    const errorEl = document.getElementById('pin-error');
    const unlockLocalBtn = document.getElementById('pin-unlock-local-btn');
    const forgotBtn = document.getElementById('pin-forgot-btn');
    const otpModal = document.getElementById('otp-reset-modal');

    // Pre-fetch cloud PIN hash asynchronously
    this.fetchCloudPinHash();

    // Shared post-auth bootstrap: load data THEN refresh reveal observer
    const postAuthBootstrap = async () => {
      document.documentElement.classList.add('is-admin-authenticated');
      if (overlay) overlay.style.display = 'none';
      await this.loadDashboardData();
      this.startRealtimePolling();
      this.refreshScrollReveal();
    };

    // Check existing valid session (24-hour auto expiry)
    let session = null;
    try {
      const raw = localStorage.getItem(SESSION_AUTH_KEY) || sessionStorage.getItem(SESSION_AUTH_KEY);
      if (raw) session = JSON.parse(raw);
    } catch (_) {}

    if (session && session.auth && (Date.now() - session.timestamp < 24 * 60 * 60 * 1000)) {
      postAuthBootstrap();
      return;
    } else {
      document.documentElement.classList.remove('is-admin-authenticated');
      if (overlay) overlay.style.display = 'flex';
    }

    // Check initial lockout state
    const initialLockout = this.getLockoutInfo();
    if (initialLockout.lockedUntil && Date.now() < initialLockout.lockedUntil) {
      const remainingMin = Math.max(1, Math.ceil((initialLockout.lockedUntil - Date.now()) / 60000));
      if (errorEl) {
        errorEl.textContent = `Akses terkunci sementara. Coba lagi dalam ${remainingMin} menit.`;
        errorEl.style.display = 'block';
      }
      if (unlockLocalBtn) unlockLocalBtn.style.display = 'inline-flex';
    }

    // Reset local lockout button handler
    if (unlockLocalBtn) {
      unlockLocalBtn.addEventListener('click', () => {
        localStorage.removeItem(LOCKOUT_KEY);
        if (errorEl) errorEl.style.display = 'none';
        unlockLocalBtn.style.display = 'none';
        if (input) {
          input.value = '';
          input.focus();
        }
      });
    }

    // Forgot PIN handler -> Opens OTP Reset Modal
    if (forgotBtn && otpModal) {
      forgotBtn.addEventListener('click', () => {
        otpModal.classList.add('is-open');
        const sendBtn = document.getElementById('otp-send-code-btn');
        if (sendBtn) sendBtn.focus();
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enteredPin = input ? input.value.trim() : '';

        // Check brute-force lockout
        const lockout = this.getLockoutInfo();
        if (lockout.lockedUntil && Date.now() < lockout.lockedUntil) {
          const remainingMin = Math.max(1, Math.ceil((lockout.lockedUntil - Date.now()) / 60000));
          if (errorEl) {
            errorEl.textContent = `Akses terkunci sementara. Coba lagi dalam ${remainingMin} menit.`;
            errorEl.style.display = 'block';
          }
          if (unlockLocalBtn) unlockLocalBtn.style.display = 'inline-flex';
          return;
        }

        // Ensure latest cloud PIN hash is used
        const activePinHash = this.cloudPinHash || await this.fetchCloudPinHash();
        const inputHash = await this.hashPin(enteredPin);

        // Master PIN verification (checks Cloud PIN Hash, local custom hash, or default seed)
        const localHash = localStorage.getItem('dash_custom_pin_hash');
        const isMatch = (inputHash === activePinHash) || 
                        (localHash && inputHash === localHash) || 
                        (inputHash === DEFAULT_PIN_HASH);

        if (isMatch) {
          // Success: Save to both localStorage and sessionStorage (24-hour persistent admin session)
          const sessionPayload = JSON.stringify({ auth: true, timestamp: Date.now() });
          localStorage.setItem(SESSION_AUTH_KEY, sessionPayload);
          sessionStorage.setItem(SESSION_AUTH_KEY, sessionPayload);
          document.documentElement.classList.add('is-admin-authenticated');
          localStorage.removeItem(LOCKOUT_KEY);
          postAuthBootstrap();
        } else {
          // Failed attempt handling
          const attempts = (lockout.attempts || 0) + 1;
          let lockedUntil = null;
          if (attempts >= 5) {
            lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
            if (errorEl) errorEl.textContent = 'Terlalu banyak percobaan gagal. Akses dikunci 15 menit.';
            if (unlockLocalBtn) unlockLocalBtn.style.display = 'inline-flex';
          } else {
            if (errorEl) errorEl.textContent = `PIN Salah. Sisa percobaan: ${5 - attempts}`;
          }
          localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts, lockedUntil }));
          if (errorEl) errorEl.style.display = 'block';
          if (input) {
            input.value = '';
            input.focus();
          }
        }
      });
    }
  }

  // =========================================================================
  // 4. EMAIL OTP RESET FLOW CONTROLLER
  // =========================================================================
  initOtpResetFlow() {
    const otpModal = document.getElementById('otp-reset-modal');
    const closeBtn = document.getElementById('otp-reset-close-btn');
    const sendBtn = document.getElementById('otp-send-code-btn');
    const sendBtnText = document.getElementById('otp-send-btn-text');
    const sendStatus = document.getElementById('otp-send-status');
    const stepRequest = document.getElementById('otp-step-request');
    const verifyForm = document.getElementById('otp-verify-form');
    const otpCodeInput = document.getElementById('otp-code-input');
    const newPinInput = document.getElementById('otp-new-pin-input');
    const confirmPinInput = document.getElementById('otp-confirm-pin-input');
    const verifyError = document.getElementById('otp-verify-error');
    const resendBtn = document.getElementById('otp-resend-btn');
    const countdownSpan = document.getElementById('otp-countdown');
    const submitVerifyBtn = document.getElementById('otp-submit-btn');

    let countdownTimer = null;

    const closeModal = () => {
      if (otpModal) otpModal.classList.remove('is-open');
      if (countdownTimer) clearInterval(countdownTimer);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (otpModal) {
      otpModal.addEventListener('click', (e) => {
        if (e.target === otpModal) closeModal();
      });
    }

    const startCountdown = (duration = 60) => {
      if (countdownTimer) clearInterval(countdownTimer);
      let left = duration;
      if (resendBtn) resendBtn.disabled = true;
      if (countdownSpan) countdownSpan.textContent = String(left);

      countdownTimer = setInterval(() => {
        left--;
        if (countdownSpan) countdownSpan.textContent = String(left);
        if (left <= 0) {
          clearInterval(countdownTimer);
          if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Kirim Ulang Kode OTP';
          }
        }
      }, 1000);
    };

    const handleSendOtp = async () => {
      if (sendBtn) sendBtn.disabled = true;
      if (sendBtnText) sendBtnText.textContent = 'Mengirim kode ke raflyfirmansyah02@gmail.com...';
      if (sendStatus) {
        sendStatus.className = 'otp-status-message is-loading';
        sendStatus.textContent = 'Menghubungkan gateway keamanan & mengirim kode OTP...';
        sendStatus.style.display = 'block';
      }

      try {
        const res = await fetch('/api/admin-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_otp' })
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          if (sendStatus) {
            sendStatus.className = 'otp-status-message is-success';
            sendStatus.textContent = data.message || 'Kode OTP telah berhasil dikirimkan ke email Anda.';
          }
          if (stepRequest) stepRequest.style.display = 'none';
          if (verifyForm) verifyForm.style.display = 'block';
          if (otpCodeInput) otpCodeInput.focus();
          startCountdown(60);
        } else {
          throw new Error(data.message || 'Gagal mengirim OTP dari server.');
        }
      } catch (err) {
        if (sendStatus) {
          sendStatus.className = 'otp-status-message is-error';
          sendStatus.textContent = `Gagal mengirim OTP: ${err.message}. Silakan coba lagi.`;
        }
        if (sendBtn) sendBtn.disabled = false;
        if (sendBtnText) sendBtnText.textContent = 'Kirim Kode OTP ke Email';
      }
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSendOtp);
    if (resendBtn) resendBtn.addEventListener('click', handleSendOtp);

    if (verifyForm) {
      verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otpCode = otpCodeInput ? otpCodeInput.value.trim() : '';
        const newPin = newPinInput ? newPinInput.value.trim() : '';
        const confirmPin = confirmPinInput ? confirmPinInput.value.trim() : '';

        if (!otpCode || otpCode.length !== 6) {
          if (verifyError) {
            verifyError.textContent = 'Kode OTP harus 6 digit angka.';
            verifyError.style.display = 'block';
          }
          return;
        }

        if (!newPin || newPin.length < 4 || newPin.length > 8) {
          if (verifyError) {
            verifyError.textContent = 'Master PIN baru harus terdiri dari 4-8 digit.';
            verifyError.style.display = 'block';
          }
          return;
        }

        if (newPin !== confirmPin) {
          if (verifyError) {
            verifyError.textContent = 'Konfirmasi PIN tidak cocok.';
            verifyError.style.display = 'block';
          }
          return;
        }

        if (verifyError) verifyError.style.display = 'none';
        if (submitVerifyBtn) {
          submitVerifyBtn.disabled = true;
          submitVerifyBtn.textContent = 'Memverifikasi...';
        }

        try {
          const res = await fetch('/api/admin-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'verify_otp_and_reset_pin',
              otp_code: otpCode,
              new_pin: newPin
            })
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok && data.success) {
            // Update local memory & cache
            const newHash = data.new_pin_hash || await this.hashPin(newPin);
            this.cloudPinHash = newHash;
            localStorage.setItem('dash_custom_pin_hash', newHash);
            localStorage.removeItem(LOCKOUT_KEY);

            // Automatically grant session
            sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ auth: true, timestamp: Date.now() }));
            
            closeModal();
            const overlay = document.getElementById('pin-gateway');
            if (overlay) overlay.style.display = 'none';
            this.loadDashboardData();
            this.startRealtimePolling();
            this.refreshScrollReveal();
            alert('Master PIN berhasil direset! Anda langsung masuk ke Observability Dashboard.');
          } else {
            throw new Error(data.message || 'Kode OTP tidak valid atau kadaluwarsa.');
          }
        } catch (err) {
          if (verifyError) {
            verifyError.textContent = err.message;
            verifyError.style.display = 'block';
          }
        } finally {
          if (submitVerifyBtn) {
            submitVerifyBtn.disabled = false;
            submitVerifyBtn.textContent = 'Verifikasi & Simpan PIN Baru';
          }
        }
      });
    }
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
    if (this.pollInterval) clearInterval(this.pollInterval);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    localStorage.removeItem(SESSION_AUTH_KEY);
    document.documentElement.classList.remove('is-admin-authenticated');
    window.location.reload();
  }

  // =========================================================================
  // 5. DATA RETRIEVAL (Egress-Optimized Incremental Delta + Local Cache)
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

    // 2. Fetch remote Supabase events (poll latest 250 rows in background, or 5000 on full load)
    let remoteEvents = [];
    const config = this.getSupabaseConfig();
    let isSupabaseConnected = false;

    if (config && config.url && config.anonKey) {
      try {
        const fetchLimit = isBackground ? 30 : 5000; // Poin 3: hemat egress delta 30 baris
        const endpoint = `${config.url}/rest/v1/portfolio_telemetry?select=id,event_type,event_target,event_label,device_type,screen_resolution,referrer,session_id,created_at&order=created_at.desc&limit=${fetchLimit}`;

        const res = await fetch(endpoint, {
          headers: {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`,
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          const incoming = await res.json();
          if (Array.isArray(incoming)) {
            isSupabaseConnected = true;
            if (isBackground && this.events.length > 0) {
              remoteEvents = [...incoming, ...this.events];
            } else {
              remoteEvents = incoming;
            }
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local cache:', err);
      }
    }

    if (syncStatusEl) {
      syncStatusEl.textContent = isSupabaseConnected 
        ? 'Supabase Live' 
        : 'Supabase Offline';
      const syncDotEl = document.querySelector('.dash-status-dot');
      if (syncDotEl) {
        syncDotEl.style.backgroundColor = isSupabaseConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)';
        syncDotEl.style.boxShadow = isSupabaseConnected ? '0 0 8px var(--accent-emerald)' : '0 0 8px var(--accent-amber)';
      }
    }

    // 3. Intelligent Dual-Source Deduplication (Primary by ID, Secondary by Time Bucket)
    const allRawEvents = [...remoteEvents, ...localEvents];
    allRawEvents.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    const deduplicated = [];
    const seenIds = new Set();
    const seenSignatures = new Set();

    for (const e of allRawEvents) {
      if (!e) continue;
      if (e.id) {
        if (seenIds.has(e.id)) continue;
        seenIds.add(e.id);
      }
      const ts = new Date(e.created_at || 0).getTime();
      const timeBucket = Math.floor(ts / 2000);
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
    this.filterAndRender(isBackground);
  }

  startRealtimePolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.checkOmniRouteRealtimeStatus();

    let pollTick = 0;
    const runPoll = () => {
      // Egress Saver: Stop polling completely when tab is hidden/minimized
      if (document.hidden) return;

      this.loadDashboardData(true);
      pollTick++;
      if (pollTick % 2 === 0) {
        this.checkOmniRouteRealtimeStatus();
      }
      if (pollTick % 4 === 0) {
        this.fetchAIMemories(true);
      }
    };

    // Poin 2: Polling loop setiap 8 detik (hemat egress 62% saat tab aktif)
    this.pollInterval = setInterval(runPoll, 8000);

    // Immediately refresh data when user switches back to this tab
    if (!this._visibilityListenerAttached) {
      this._visibilityListenerAttached = true;
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.loadDashboardData(true);
          this.checkOmniRouteRealtimeStatus();
        }
      });
    }

    // Instant cross-tab sync: when an AI query runs in terminal tab, dashboard updates in 0ms!
    window.addEventListener('storage', (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        this.loadDashboardData(true);
      }
    });
  }

  // =========================================================================
  // 6. FILTERING & AGGREGATION (Kalender Lokal & Midnight 00:00 Reset)
  // =========================================================================
  filterByRange(items, range) {
    if (!Array.isArray(items) || !range || range === 'all') return items;
    
    let cutoff = 0;
    if (range === 'today') {
      // Reset otomatis jam 00:00:00 tengah malam hari ini (Local Calendar Midnight)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      cutoff = startOfToday.getTime();
    } else if (range === '7d') {
      const startOf7d = new Date();
      startOf7d.setDate(startOf7d.getDate() - 6);
      startOf7d.setHours(0, 0, 0, 0);
      cutoff = startOf7d.getTime();
    } else if (range === '14d') {
      const startOf14d = new Date();
      startOf14d.setDate(startOf14d.getDate() - 13);
      startOf14d.setHours(0, 0, 0, 0);
      cutoff = startOf14d.getTime();
    } else if (range === '30d') {
      const startOf30d = new Date();
      startOf30d.setDate(startOf30d.getDate() - 29);
      startOf30d.setHours(0, 0, 0, 0);
      cutoff = startOf30d.getTime();
    }

    if (cutoff === 0) return items;
    return items.filter(item => {
      const ts = new Date(item.created_at || 0).getTime();
      return ts >= cutoff;
    });
  }

  renderAnalyticsGroup() {
    const analyticsEvents = this.filterByRange(this.events, this.analyticsRange);
    this.renderKPIs(analyticsEvents);
    this.renderCharts(analyticsEvents);
    this.renderIntelligenceLists(analyticsEvents);
  }

  filterAndRender(isBackground = false) {
    this.renderAnalyticsGroup();
    this.renderAllAIModelsMatrix();
    this.renderAIMemoryList();
    this.renderActivityTable();
    if (!isBackground) {
      this.refreshScrollReveal();
    }
  }

  renderKPIs(events = this.filterByRange(this.events, this.analyticsRange)) {
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const uniqueSessions = new Set(events.map(e => e.session_id)).size || (pageViews > 0 ? 1 : 0);
    const linkClicks = events.filter(e => e.event_type === 'link_click' || e.event_type === 'cert_view' || e.event_type === 'project_view').length;
    const contacts = events.filter(e => e.event_target === 'whatsapp' || e.event_type === 'contact_submit').length;
    const interactivity = (events.length / Math.max(1, uniqueSessions)).toFixed(1);

    const vEl = document.getElementById('kpi-views');
    const uEl = document.getElementById('kpi-visitors');
    const cEl = document.getElementById('kpi-clicks');
    const ctEl = document.getElementById('kpi-contacts');
    const engEl = document.getElementById('kpi-engagement');

    if (vEl) vEl.textContent = pageViews.toLocaleString('id-ID');
    if (uEl) uEl.textContent = uniqueSessions.toLocaleString('id-ID');
    if (cEl) cEl.textContent = linkClicks.toLocaleString('id-ID');
    if (ctEl) ctEl.textContent = contacts.toLocaleString('id-ID');
    if (engEl) engEl.textContent = interactivity;
  }

  // =========================================================================
  // 7. CHART.JS VISUALIZATION RENDERING (HorizonX Adaptive Theme Engine)
  // =========================================================================
  renderCharts(events = this.filterByRange(this.events, this.analyticsRange)) {
    if (!window.Chart) return;

    const isDark = this.currentTheme !== 'light';
    const emerald = isDark ? 'rgba(16, 185, 129, 1)' : 'rgba(5, 150, 105, 1)';
    const emeraldDim = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.14)';
    const cyan = isDark ? 'rgba(6, 182, 212, 1)' : 'rgba(2, 132, 199, 1)';
    const cyanDim = isDark ? 'rgba(6, 182, 212, 0.18)' : 'rgba(2, 132, 199, 0.14)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)';
    const textColor = isDark ? 'rgba(203, 213, 225, 0.85)' : 'rgba(51, 65, 85, 0.9)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 11;

    const themeChanged = this.chartsTheme !== this.currentTheme;

    // 1. Traffic Velocity Line Chart
    const trafficCanvas = document.getElementById('traffic-chart');
    if (trafficCanvas) {
      let numDays = 7;
      if (this.analyticsRange === 'today') numDays = 1;
      else if (this.analyticsRange === '7d') numDays = 7;
      else if (this.analyticsRange === '14d') numDays = 14;
      else if (this.analyticsRange === '30d') numDays = 30;
      else if (this.analyticsRange === 'all') {
        if (events.length > 0) {
          const validTs = events.map(e => new Date(e.created_at || 0).getTime()).filter(t => t > 0);
          if (validTs.length > 0) {
            const earliest = Math.min(...validTs);
            const daysDiff = Math.ceil((Date.now() - earliest) / 86400000);
            numDays = Math.max(7, Math.min(60, daysDiff || 30));
          } else {
            numDays = 30;
          }
        } else {
          numDays = 30;
        }
      }
      const dayBuckets = {};
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        dayBuckets[key] = { views: 0, sessions: new Set() };
      }

      events.forEach(e => {
        const key = new Date(e.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (dayBuckets[key]) {
          if (e.event_type === 'page_view') dayBuckets[key].views++;
          dayBuckets[key].sessions.add(e.session_id);
        }
      });

      const labels = Object.keys(dayBuckets);
      const viewsData = labels.map(k => dayBuckets[k].views);
      const visitorsData = labels.map(k => dayBuckets[k].sessions.size);

      if (this.charts.traffic && !themeChanged) {
        this.charts.traffic.data.labels = labels;
        this.charts.traffic.data.datasets[0].data = viewsData;
        this.charts.traffic.data.datasets[1].data = visitorsData;
        this.charts.traffic.update('none');
      } else {
        if (this.charts.traffic) this.charts.traffic.destroy();
        const trafficCtx = trafficCanvas.getContext('2d');
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
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: emerald,
                pointBorderColor: isDark ? '#07090e' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              },
              {
                label: 'Pengunjung Unik',
                data: visitorsData,
                borderColor: cyan,
                backgroundColor: cyanDim,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: cyan,
                pointBorderColor: isDark ? '#07090e' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: false,
                  padding: 15,
                  color: textColor
                }
              },
              tooltip: {
                backgroundColor: isDark ? 'rgba(9, 14, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: textColor,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
              }
            },
            scales: {
              x: { grid: { color: gridColor, drawBorder: false }, ticks: { color: textColor } },
              y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: textColor, precision: 0 }, beginAtZero: true }
            }
          }
        });
      }
    }

    // 2. Link Clicks Bar Chart (9 Categories)
    const linksCanvas = document.getElementById('links-chart');
    if (linksCanvas) {
      const clickCats = {
        'WhatsApp': 0, 'GitHub': 0, 'Plagiarism': 0, 'Spam-Email': 0,
        'Laser PPT': 0, 'FotoKita': 0, 'Portfolio': 0, 'Sertifikat': 0, 'Terminal': 0
      };

      events.forEach(e => {
        const target = (e.event_target || '').toLowerCase();
        const type = (e.event_type || '').toLowerCase();
        if (target.includes('whatsapp') || target.includes('chat_wa')) clickCats['WhatsApp']++;
        else if (target.includes('github') || target.includes('repo')) clickCats['GitHub']++;
        else if (target.includes('plagiarism') || target.includes('checker')) clickCats['Plagiarism']++;
        else if (target.includes('spam') || target.includes('email')) clickCats['Spam-Email']++;
        else if (target.includes('laser') || target.includes('pointer')) clickCats['Laser PPT']++;
        else if (target.includes('fotokita') || target.includes('blur')) clickCats['FotoKita']++;
        else if (target.includes('portofolio') || target.includes('portfolio')) clickCats['Portfolio']++;
        else if (type === 'cert_view' || target.includes('cert')) clickCats['Sertifikat']++;
        else if (type === 'terminal_cmd' || target.includes('terminal')) clickCats['Terminal']++;
      });

      const barLabels = Object.keys(clickCats);
      const barData = Object.values(clickCats);
      const barPalette = [
        'rgba(16, 185, 129, 0.85)', 'rgba(6, 182, 212, 0.85)', 'rgba(168, 85, 247, 0.85)',
        'rgba(245, 158, 11, 0.85)', 'rgba(244, 63, 94, 0.85)', 'rgba(20, 184, 166, 0.85)',
        'rgba(99, 102, 241, 0.85)', 'rgba(225, 29, 72, 0.85)', 'rgba(148, 163, 184, 0.85)'
      ];

      if (this.charts.links && !themeChanged) {
        this.charts.links.data.labels = barLabels;
        this.charts.links.data.datasets[0].data = barData;
        this.charts.links.update('none');
      } else {
        if (this.charts.links) this.charts.links.destroy();
        const linksCtx = linksCanvas.getContext('2d');
        this.charts.links = new Chart(linksCtx, {
          type: 'bar',
          data: {
            labels: barLabels,
            datasets: [{
              label: 'Total Klik',
              data: barData,
              backgroundColor: barPalette,
              borderRadius: 6,
              borderSkipped: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: isDark ? 'rgba(9, 14, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: textColor,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: textColor, maxRotation: 25, minRotation: 25 } },
              y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: textColor, precision: 0 }, beginAtZero: true }
            }
          }
        });
      }
    }

    // 3. Platform & Device Ratio Doughnut Chart
    const devicesCanvas = document.getElementById('devices-chart');
    if (devicesCanvas) {
      const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
      events.forEach(e => {
        const type = (e.device_type || 'desktop').toLowerCase();
        if (type.includes('mobile')) deviceCounts.Mobile++;
        else if (type.includes('tablet')) deviceCounts.Tablet++;
        else deviceCounts.Desktop++;
      });

      const deviceData = [deviceCounts.Mobile, deviceCounts.Desktop, deviceCounts.Tablet];

      if (this.charts.devices && !themeChanged) {
        this.charts.devices.data.datasets[0].data = deviceData;
        this.charts.devices.update('none');
      } else {
        if (this.charts.devices) this.charts.devices.destroy();
        const devicesCtx = devicesCanvas.getContext('2d');
        this.charts.devices = new Chart(devicesCtx, {
          type: 'doughnut',
          data: {
            labels: ['Mobile', 'Desktop', 'Tablet'],
            datasets: [{
              data: deviceData,
              backgroundColor: [
                'rgba(16, 185, 129, 0.85)',
                'rgba(6, 182, 212, 0.85)',
                'rgba(245, 158, 11, 0.85)'
              ],
              borderColor: isDark ? '#090e17' : '#ffffff',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { position: 'bottom' } },
            cutout: '70%'
          }
        });
      }
    }

    this.chartsTheme = this.currentTheme;
  }

  // =========================================================================
  // 8. INTELLIGENCE LEADERBOARDS (HorizonX Unified Normalization)
  // =========================================================================
  sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  normalizeCertName(target = '', label = '') {
    const combined = `${target} ${label}`.toLowerCase();
    if (combined.includes('bnsp') || combined.includes('analis') || combined.includes('program')) return 'BNSP: Analis Program';
    if (combined.includes('mikrotik') || combined.includes('mtcna')) return 'MikroTik MTCNA (Latvia)';
    if (combined.includes('cisco') || combined.includes('pcap') || combined.includes('python')) return 'Cisco Python PCAP (OpenEDG)';
    if (combined.includes('kominfo') || combined.includes('dea') || combined.includes('commerce')) return 'Kominfo DEA E-Commerce';
    if (combined.includes('harisenin') || combined.includes('javascript') || combined.includes('js')) return 'Harisenin JavaScript Camp';
    if (combined.includes('seminar') && combined.includes('cloud')) return 'Seminar Cloud Specialist';
    if (combined.includes('workshop') && combined.includes('tailwind')) return 'Workshop Slicing Tailwind';
    if (combined.includes('blockchain')) return 'Seminar Cloud & Blockchain';
    return label || target || 'Sertifikat Profesional';
  }

  normalizeProjectName(target = '', label = '') {
    const combined = `${target} ${label}`.toLowerCase();
    if (combined.includes('plagiarism') || combined.includes('checker')) return 'OpenPlagiarismChecker (NLP)';
    if (combined.includes('spam') || combined.includes('email')) return 'Spam-Email-Classifier (ML)';
    if (combined.includes('laser') || combined.includes('pointer')) return 'Laser Pointer PPT (IoT/CV)';
    if (combined.includes('fotokita') || combined.includes('blur')) return 'FotoKitaBlur (MediaPipe)';
    if (combined.includes('ping') || combined.includes('test')) return 'ping_test';
    if (combined.includes('portofolio') || combined.includes('portfolio') || combined.includes('web')) return 'Web Portofolio (Vanilla Modern)';
    return target || label || 'Proyek Eksplorasi';
  }

  normalizeReferrer(ref = '') {
    const r = (ref || '').toLowerCase();
    if (r.includes('google')) return 'Google Search (Organik)';
    if (r.includes('github')) return 'GitHub (@Raflyf)';
    if (r.includes('vercel')) return 'vercel.com';
    if (r.includes('whatsapp') || r.includes('wa.me')) return 'WhatsApp Web / Mobile';
    if (r.includes('raflyfirmansyah-portofolio')) return 'raflyfirmansyah-portofolio.vercel.app';
    if (r.includes('admin') || r.includes('portal')) return 'Admin Portal';
    if (r.includes('direct') || r.includes('bookmark') || !r) return 'Direct / Bookmark';
    return ref;
  }

  renderIntelligenceLists(events = this.filterByRange(this.events, this.analyticsRange)) {
    // 1. Project Exploration Leaderboard
    const projectListEl = document.getElementById('project-ranked-list');
    if (projectListEl) {
      const counts = {};
      events.filter(e => e.event_type === 'project_view' || (e.event_type === 'link_click' && e.event_target && !e.event_target.includes('wa'))).forEach(e => {
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

    // 2. Certificate Views Leaderboard
    const certListEl = document.getElementById('cert-ranked-list');
    if (certListEl) {
      const certCounts = {};
      events.filter(e => e.event_type === 'cert_view').forEach(e => {
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
      events.forEach(e => {
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
  // 9. STANDALONE AUTO ROUTER BANNER & DYNAMIC MOST-USED MODEL RANKING
  // =========================================================================
  renderAllAIModelsMatrix() {
    const autoSlotEl = document.getElementById('ai-auto-router-slot');
    const gridEl = document.getElementById('ai-models-grid');
    const totalCountEl = document.getElementById('ai-matrix-total-count');

    const AUTO_MODEL = {
      id: 'auto-router',
      name: 'Auto Gateway Router',
      desc: 'Dynamic 4-Tier Cascade Failover (OmniRoute, OpenRouter, Ollama Cloud, OpenCode Zen)',
      provider: 'SMART CASCADE',
      badgeClass: 'badge-emerald',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>`,
      matcher: (s) => s.includes('auto') || s.includes('router') || s.includes('gateway')
    };

    const INDIVIDUAL_MODELS = [
      {
        id: 'nemotron-lightning',
        name: 'Nemotron 3.5 Lightning',
        desc: 'Model utama prioritas #1 (OmniRoute / OpenRouter / OpenCode) - Super kilat (~253ms) untuk percakapan umum, sapaan, dan Q&A',
        provider: 'OMNIROUTE / OPENROUTER',
        badgeClass: 'badge-emerald',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        matcher: (s) => s.includes('lightning') || s.includes('lighting') || s.includes('nemotron-lightning')
      },
      {
        id: 'nemotron-3-ultra',
        name: 'Nemotron 3 Ultra (550B MoE)',
        desc: 'Arsitektur MoE 550B kapasitas penuh untuk sintesis data komprehensif, konteks luas, dan penalaran teknis (OmniRoute / Ollama)',
        provider: 'OMNIROUTE / OLLAMA',
        badgeClass: 'badge-emerald',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path></svg>`,
        matcher: (s) => s.includes('nemotron-3-ultra') || s.includes('ultra-550b') || s.includes('ultra-free') || s.includes('ultra')
      },
      {
        id: 'codex',
        name: 'Codex (GPT-5.6 Terra)',
        desc: 'Spesialis rekayasa software tingkat tinggi, analisis codebase, debugging, dan sintesis arsitektur kode (codex/gpt-5.6-terra)',
        provider: 'OMNIROUTE',
        badgeClass: 'badge-emerald',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
        matcher: (s) => s.includes('codex') || s.includes('gpt-5') || s.includes('terra')
      },
      {
        id: 'antigravity',
        name: 'Antigravity (Claude Opus Thinking)',
        desc: 'Penalaran analitis mendalam (Deep CoT Reasoning), sintesis riset ilmiah skripsi, dan telaah dokumen komprehensif',
        provider: 'OMNIROUTE',
        badgeClass: 'badge-cyan',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path></svg>`,
        matcher: (s) => s.includes('antigravity') || s.includes('opus') || s.includes('claude')
      },
      {
        id: 'vision-model',
        name: 'Vision-model (MiniMax-M3 / mimo)',
        desc: 'Pemrosesan citra multimodal, OCR teks dokumen PDF/gambar, dan analisis visual resolusi tinggi (OmniRoute / MiniMax)',
        provider: 'MINIMAX / VISION',
        badgeClass: 'badge-cyan',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
        matcher: (s) => s.includes('vision') || s.includes('minimax') || s.includes('mimo')
      },
      {
        id: 'nemotron-nano',
        name: 'Nemotron 3 Nano (30B)',
        desc: 'Model penalaran andal untuk ekstraksi konteks scraping berita real-time dan RAG memori di OpenRouter & Ollama Cloud',
        provider: 'OPENROUTER / OLLAMA',
        badgeClass: 'badge-cyan',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        matcher: (s) => s.includes('nano-omni') || s.includes('nemotron-3-nano') || s.includes('nano:30b') || s.includes('nano-30b') || s.includes('30b')
      },
      {
        id: 'deepseek',
        name: 'DeepSeek Chat (V3)',
        desc: 'Frontier Intelligence untuk logika koding multi-bahasa, perbandingan berita, dan analisis data di OpenRouter pool',
        provider: 'OPENROUTER',
        badgeClass: 'badge-cyan',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
        matcher: (s) => s.includes('deepseek')
      },
      {
        id: 'openrouter-free',
        name: 'OpenRouter Free (Auto Pool)',
        desc: 'Dynamic SOTA Free router yang otomatis memilih model gratis terbaik dengan latensi terendah di OpenRouter',
        provider: 'OPENROUTER',
        badgeClass: 'badge-emerald',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        matcher: (s) => s.includes('openrouter/free') || s.includes('openrouter_free') || (s.includes('openrouter') && s.includes('free'))
      },
      {
        id: 'nemotron-super',
        name: 'Nemotron 3 Super (120B)',
        desc: 'Model penalaran dense 120B teroptimasi untuk latensi rendah (~271ms) dan penalaran logika terarah di OpenRouter & Ollama Cloud',
        provider: 'OPENROUTER / OLLAMA',
        badgeClass: 'badge-emerald',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        matcher: (s) => s.includes('super-120b') || s.includes('nemotron-3-super') || s.includes('super:120b') || s.includes('120b')
      },
      {
        id: 'x-preview',
        name: 'x-preview-f-free',
        desc: 'Engine preview eksperimental OpenCode untuk inferensi cepat dan evaluasi model baru berbasis prinsip YAGNI',
        provider: 'OMNIROUTE / OPENCODE',
        badgeClass: 'badge-emerald',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        matcher: (s) => s.includes('x-preview') || s.includes('preview-f')
      },
      {
        id: 'local-semantic',
        name: 'In-Browser Semantic Engine',
        desc: 'Engine pencarian pola sub-15ms lokal di peramban + Supabase Continuous RAG Memory saat offline',
        provider: 'LOCAL OFFLINE',
        badgeClass: 'badge-emerald',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
        matcher: (s) => s.includes('local_semantic') || s.includes('semantic engine') || s.includes('offline_rag')
      }
    ];

    let totalAIQueries = 0;
    let autoRouterCount = 0;
    const rawActiveModel = (localStorage.getItem('ai_selected_model') || '').toLowerCase().trim();
    const activeTerminalModel = rawActiveModel === 'auto' ? '' : rawActiveModel;
    const modelCounts = {};
    const modelLastUsed = {};
    INDIVIDUAL_MODELS.forEach(m => { 
      modelCounts[m.id] = 0; 
      modelLastUsed[m.id] = 0;
    });

    const eventPool = this.filterByRange(this.events, this.aiModelsRange);

    eventPool.forEach(e => {
      const type = (e.event_type || '').toLowerCase();
      const target = (e.event_target || '').toLowerCase();
      const label = (e.event_label || '').toLowerCase();
      const combined = `${target} ${label} ${type}`;
      const ts = new Date(e.created_at || 0).getTime();

      // Strictly isolate genuine AI query inference events (excluding general terminal commands like help/clear/etc.)
      const isAIEvent = type === 'ai_query_resolved' ||
                        type === 'ai_chat' ||
                        type === 'ai_query' ||
                        (type === 'terminal_cmd' && (target.startsWith('ai:') || target.startsWith('chat:') || target.startsWith('ask:')));

      if (isAIEvent) {
        totalAIQueries++;

        // Track Auto Gateway Router resolutions (explicit auto target or auto label prefix)
        const isAutoRouted = target.startsWith('auto') || label.includes('[auto') || label.includes('[Auto') || target === 'auto';
        if (isAutoRouted) {
          autoRouterCount++;
        }

        // Increment specific individual model counter
        let matchedIndividual = false;
        for (const m of INDIVIDUAL_MODELS) {
          if (m.matcher(combined)) {
            modelCounts[m.id]++;
            if (ts > modelLastUsed[m.id]) {
              modelLastUsed[m.id] = ts;
            }
            matchedIndividual = true;
            break;
          }
        }

        // Fallback for unknown AI model query to ensure total count consistency
        if (!matchedIndividual && !isAutoRouted) {
          autoRouterCount++;
        }
      }
    });

    if (totalCountEl) totalCountEl.textContent = `${totalAIQueries}x`;

    // 1. Render Fixed Standalone Full-Width Banner Card for Auto Gateway Router (Always fixed at top)
    if (autoSlotEl) {
      autoSlotEl.innerHTML = `
        <div class="ai-model-banner-card">
          <div class="ai-banner-left">
            <div class="ai-banner-top">
              <div class="ai-model-icon-tag" style="color:var(--accent-emerald-text);font-size:0.82rem;">
                ${AUTO_MODEL.icon}
                <span>${AUTO_MODEL.name}</span>
              </div>
              <span class="ai-model-status-pill ${AUTO_MODEL.badgeClass}">${AUTO_MODEL.provider}</span>
            </div>
            <div class="ai-banner-title">${AUTO_MODEL.name} (Smart Inference Cascades)</div>
            <div class="ai-banner-desc">${AUTO_MODEL.desc}</div>
          </div>
          <div class="ai-banner-right">
            <span class="ai-banner-count-label">Total Resolusi Router</span>
            <span class="ai-banner-count-num">${autoRouterCount}x</span>
          </div>
        </div>
      `;
    }

    // 2. Sort individual models dynamically (below the fixed Auto Banner):
    // Highest priority: most recently used timestamp (descending), then total execution count.
    const sortedModels = [...INDIVIDUAL_MODELS].map(m => {
      return {
        ...m,
        count: modelCounts[m.id] || 0,
        lastUsedAt: modelLastUsed[m.id] || 0
      };
    }).sort((a, b) => {
      if (b.lastUsedAt !== a.lastUsedAt) {
        return b.lastUsedAt - a.lastUsedAt;
      }
      return b.count - a.count;
    });

    // 3. Render Sorted Dynamic Grid (The latest used individual model lights up with active badge & glow)
    if (gridEl) {
      gridEl.innerHTML = sortedModels.map((m, idx) => {
        const isLatestUsed = (idx === 0) && (m.count > 0 || m.lastUsedAt > 0);
        const badge = isLatestUsed 
          ? `<span class="ai-model-active-badge"><span class="ai-active-pulse-dot"></span>TERBARU DIGUNAKAN</span>`
          : `<span class="ai-model-rank-badge">#${idx + 1}</span>`;
        const activeCardClass = isLatestUsed ? 'is-terminal-active' : '';

        return `
          <div class="ai-model-card ${activeCardClass}">
            <div class="ai-model-top">
              <div class="ai-model-icon-tag">
                ${m.icon}
                <span>${m.name.split(' ')[0]}</span>
              </div>
              <div class="ai-model-top-badges">
                ${badge}
                <span class="ai-model-status-pill ${m.badgeClass}">${m.provider}</span>
              </div>
            </div>
            <div class="ai-model-name">${this.sanitize(m.name)}</div>
            <div class="ai-model-desc">${this.sanitize(m.desc)}</div>
            <div class="ai-model-count-row">
              <span class="ai-model-count-label">Total Eksekusi</span>
              <span class="ai-model-count-num">${m.count}x</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // =========================================================================
  // 10. COMPACT SLIDING WINDOW PAGINATION BUILDER
  // =========================================================================
  renderPagination(currentPage, totalPages, type) {
    if (totalPages <= 1) return '';

    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    let html = `<div class="pagination-wrapper">`;
    
    // Prev button
    html += `<button type="button" class="pagination-btn pagination-nav" data-${type}-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Halaman Sebelumnya">&lsaquo;</button>`;
    
    rangeWithDots.forEach(p => {
      if (p === '...') {
        html += `<span class="pagination-ellipsis">&hellip;</span>`;
      } else {
        html += `<button type="button" class="pagination-btn ${p === currentPage ? 'active' : ''}" data-${type}-page="${p}">${p}</button>`;
      }
    });
    
    // Next button
    html += `<button type="button" class="pagination-btn pagination-nav" data-${type}-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Halaman Berikutnya">&rsaquo;</button>`;
    
    // Page Info
    html += `<span class="pagination-info">Hlm ${currentPage} / ${totalPages}</span>`;
    html += `</div>`;
    return html;
  }

  // =========================================================================
  // 11. AI LONG-TERM MEMORY EXPLORER (Supabase Continuous RAG)
  // =========================================================================
  async fetchAIMemories(isSilent = false) {
    const totalBadgeEl = document.getElementById('ai-memory-total-count');
    const listEl = document.getElementById('ai-memories-list');
    const config = this.getSupabaseConfig();
    if (!config || !config.url || !config.anonKey) {
      if (listEl && this.memories.length === 0) {
        listEl.innerHTML = `<div style="color:var(--text-dim);font-size:0.85rem;">Supabase belum terkonfigurasi.</div>`;
      }
      if (totalBadgeEl) totalBadgeEl.textContent = '0 Memori';
      return;
    }

    try {
      const res = await fetch(`${config.url}/rest/v1/ai_memories?select=*&order=created_at.desc&limit=200`, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.memories = data;
          this.renderAIMemoryList();
        }
      }
    } catch (_) {}
  }

  renderAIMemoryList() {
    const listEl = document.getElementById('ai-memories-list');
    const totalBadgeEl = document.getElementById('ai-memory-total-count');
    const paginationEl = document.getElementById('ai-memories-pagination');
    if (!listEl) return;

    if (this.memories.length === 0 && !this.isFetchingMemories) {
      this.isFetchingMemories = true;
      this.fetchAIMemories().finally(() => { this.isFetchingMemories = false; });
      return;
    }

    const filteredMemories = this.filterByRange(this.memories, this.ragMemoriesRange);
    const total = filteredMemories.length;
    if (totalBadgeEl) totalBadgeEl.textContent = `${total} Fakta Aktif`;

    if (total === 0) {
      listEl.innerHTML = `<div style="color:var(--text-dim);font-size:0.85rem;padding:0.5rem 0;">Tidak ada memori yang sesuai dengan rentang waktu filter.</div>`;
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(total / this.memoryPageSize);
    this.memoryCurrentPage = Math.min(this.memoryCurrentPage, totalPages) || 1;
    const start = (this.memoryCurrentPage - 1) * this.memoryPageSize;
    const pageItems = filteredMemories.slice(start, start + this.memoryPageSize);

    listEl.innerHTML = pageItems.map(m => {
      const timeStr = m.created_at ? new Date(m.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Baru saja';
      return `
        <div class="ai-model-card" style="padding:0.95rem;background-color:var(--surface-badge);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
            <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--accent-emerald-text);font-weight:700;">RAG KNOWLEDGE ITEM</span>
            <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);">${timeStr}</span>
          </div>
          <div style="font-size:0.85rem;color:var(--text-heading);line-height:1.45;">${this.sanitize(m.fact_text || '')}</div>
        </div>
      `;
    }).join('');

    if (paginationEl) {
      paginationEl.innerHTML = this.renderPagination(this.memoryCurrentPage, totalPages, 'mem');
      paginationEl.querySelectorAll('[data-mem-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetPage = Number(e.currentTarget.getAttribute('data-mem-page'));
          if (targetPage >= 1 && targetPage <= totalPages) {
            this.memoryCurrentPage = targetPage;
            this.renderAIMemoryList();
          }
        });
      });
    }
  }

  // =========================================================================
  // 12. REAL-TIME ACTIVITY STREAM TABLE
  // =========================================================================
  renderActivityTable() {
    const tbody = document.getElementById('activity-table-body');
    const paginationEl = document.getElementById('table-pagination');
    if (!tbody) return;

    let filtered = this.filterByRange(this.events, this.tableRange);

    if (this.selectedEventType !== 'all') {
      filtered = filtered.filter(e => e.event_type === this.selectedEventType);
    }

    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => {
        const target = (e.event_target || '').toLowerCase();
        const label = (e.event_label || '').toLowerCase();
        const sid = (e.session_id || '').toLowerCase();
        return target.includes(q) || label.includes(q) || sid.includes(q);
      });
    }

    const total = filtered.length;
    if (total === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:2rem;">Tidak ada data aktivitas yang sesuai dengan filter.</td></tr>`;
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(total / this.tablePageSize);
    this.tableCurrentPage = Math.min(this.tableCurrentPage, totalPages) || 1;
    const start = (this.tableCurrentPage - 1) * this.tablePageSize;
    const pageItems = filtered.slice(start, start + this.tablePageSize);

    tbody.innerHTML = pageItems.map(e => {
      const time = e.created_at ? new Date(e.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
      const typeClass = `type-${(e.event_type || 'default').replace('_', '-')}`;
      const sidShort = (e.session_id || 'sess').substring(0, 16);
      const targetText = e.event_label ? `${e.event_target} (${e.event_label})` : (e.event_target || '—');

      return `
        <tr>
          <td style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);">${time}</td>
          <td><span class="event-type-badge ${typeClass}">${this.sanitize(e.event_type || 'event')}</span></td>
          <td style="font-weight:600;color:var(--text-heading);">${this.sanitize(targetText)}</td>
          <td style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-dim);">${this.sanitize(e.device_type || 'desktop')}</td>
          <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-dim);">${this.sanitize(sidShort)}...</td>
        </tr>
      `;
    }).join('');

    if (paginationEl) {
      paginationEl.innerHTML = this.renderPagination(this.tableCurrentPage, totalPages, 'table');
      paginationEl.querySelectorAll('[data-table-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const targetPage = Number(e.currentTarget.getAttribute('data-table-page'));
          if (targetPage >= 1 && targetPage <= totalPages) {
            this.tableCurrentPage = targetPage;
            this.renderActivityTable();
          }
        });
      });
    }
  }

  // =========================================================================
  // 13. OMNIROUTE REALTIME HOST PROBING
  // =========================================================================
  async checkOmniRouteRealtimeStatus() {
    const dotEl = document.getElementById('omniroute-live-dot');
    const textEl = document.getElementById('omniroute-live-text');

    const headerDotEl = document.getElementById('header-omniroute-dot');
    const headerTextEl = document.getElementById('header-omniroute-text');

    let isOnline = false;
    let latencyText = '';
    let statusLabel = '';
    let headerStatusLabel = '';
    const secretKey = (typeof window !== 'undefined' ? localStorage.getItem('omniroute_secret_key') : null) || 'sk-7a9b51a264768e32-ca46a7-409c6979';

    // 1. Probe Primary Ngrok Tunnel
    const customTunnel = (typeof window !== 'undefined' ? localStorage.getItem('omniroute_custom_tunnel') : null) || 'https://gullible-cytoplast-mardi.ngrok-free.dev/v1';
    if (customTunnel) {
      try {
        const cleanTunnel = customTunnel.replace(/\/chat\/completions\/?$/, '').replace(/\/+$/, '');
        const probeUrl = cleanTunnel.includes('/models') ? cleanTunnel : (cleanTunnel.includes('/v1') ? `${cleanTunnel}/models` : `${cleanTunnel}/v1/models`);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1800);
        const t0 = performance.now();
        const res = await fetch(probeUrl, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${secretKey}`,
            'ngrok-skip-browser-warning': 'true', 
            'Accept': 'application/json' 
          },
          signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok || res.status === 200 || res.status === 401) {
          isOnline = true;
          const t1 = Math.round(performance.now() - t0);
          latencyText = `${t1}ms`;
          statusLabel = `HOST STATUS: NGROK ACTIVE (${latencyText})`;
          headerStatusLabel = `OMNIROUTE: NGROK (${latencyText})`;
        }
      } catch (_) {}
    }

    // 2. Probe Secondary Localhost Fallback (:20128) if Ngrok didn't respond
    if (!isOnline) {
      const localEndpoint = (typeof window !== 'undefined' ? localStorage.getItem('omniroute_secondary_endpoint') : null) || 'http://localhost:20128/v1';
      try {
        const cleanLocal = localEndpoint.replace(/\/chat\/completions\/?$/, '').replace(/\/+$/, '');
        const probeUrl = cleanLocal.includes('/models') ? cleanLocal : (cleanLocal.includes('/v1') ? `${cleanLocal}/models` : `${cleanLocal}/v1/models`);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1200);
        const t0 = performance.now();
        const res = await fetch(probeUrl, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${secretKey}`,
            'Accept': 'application/json' 
          },
          signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok || res.status === 200 || res.status === 401) {
          isOnline = true;
          const t1 = Math.round(performance.now() - t0);
          latencyText = `${t1}ms`;
          statusLabel = `HOST STATUS: LOCALHOST ACTIVE (${latencyText})`;
          headerStatusLabel = `OMNIROUTE: LOCALHOST (${latencyText})`;
        }
      } catch (_) {}
    }

    if (isOnline) {
      if (dotEl) {
        dotEl.style.backgroundColor = 'var(--accent-emerald)';
        dotEl.style.boxShadow = '0 0 8px var(--accent-emerald)';
      }
      if (textEl) textEl.textContent = statusLabel;

      if (headerDotEl) {
        headerDotEl.style.backgroundColor = 'var(--accent-emerald)';
        headerDotEl.style.boxShadow = '0 0 8px var(--accent-emerald)';
      }
      if (headerTextEl) headerTextEl.textContent = headerStatusLabel;
    } else {
      if (dotEl) {
        dotEl.style.backgroundColor = 'var(--accent-amber)';
        dotEl.style.boxShadow = '0 0 8px var(--accent-amber)';
      }
      if (textEl) textEl.textContent = 'HOST STATUS: STANDBY (NGROK OFFLINE)';

      if (headerDotEl) {
        headerDotEl.style.backgroundColor = 'var(--accent-amber)';
        headerDotEl.style.boxShadow = '0 0 8px var(--accent-amber)';
      }
      if (headerTextEl) headerTextEl.textContent = 'OMNIROUTE: STANDBY';
    }
  }

  // =========================================================================
  // 14. EVENT LISTENERS & MODAL DIALOG CONTROLLERS
  // =========================================================================
  initEventListeners() {
    // Mobile Nav Toggle Drawer (matching index.html)
    const mobileToggle = document.getElementById('dash-mobile-nav-toggle');
    const navMenu = document.getElementById('dash-nav-menu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
          navMenu.classList.remove('is-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }



    // Group 1: Analytics & Metrics Time Filter
    const analyticsFilter = document.getElementById('filter-group-analytics');
    if (analyticsFilter) {
      analyticsFilter.addEventListener('change', (e) => {
        this.analyticsRange = e.target.value;
        this.renderAnalyticsGroup();
      });
    }

    // Group 2: AI Models Matrix Time Filter
    const aiModelsFilter = document.getElementById('filter-group-ai-models');
    if (aiModelsFilter) {
      aiModelsFilter.addEventListener('change', (e) => {
        this.aiModelsRange = e.target.value;
        this.renderAllAIModelsMatrix();
      });
    }

    // Group 3: AI RAG Memories Time Filter
    const ragMemoriesFilter = document.getElementById('filter-group-rag-memories');
    if (ragMemoriesFilter) {
      ragMemoriesFilter.addEventListener('change', (e) => {
        this.ragMemoriesRange = e.target.value;
        this.memoryCurrentPage = 1;
        this.renderAIMemoryList();
      });
    }

    // Group 4: Activity Table Time Filter
    const tableFilter = document.getElementById('filter-group-table');
    if (tableFilter) {
      tableFilter.addEventListener('change', (e) => {
        this.tableRange = e.target.value;
        this.tableCurrentPage = 1;
        this.renderActivityTable();
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

          await fetch(`${url}/rest/v1/portfolio_telemetry`, {
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
              screen_resolution: `${window.innerWidth}x${window.innerHeight}`,
              referrer: 'Admin Portal',
              session_id: 'sess_admin_ping'
            })
          });

          pingBtn.innerHTML = '<span>Terkirim!</span>';
          setTimeout(() => {
            pingBtn.disabled = false;
            pingBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <span>Uji Ping</span>
            `;
            this.loadDashboardData();
          }, 1000);
        } catch (_) {
          pingBtn.disabled = false;
          pingBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>Uji Ping</span>
          `;
        }
      });
    }

    // Supabase Config Modal Trigger
    const supabasePill = document.getElementById('dash-supabase-pill');
    const configModal = document.getElementById('config-modal');
    const configClose = document.getElementById('config-close-btn');
    const configForm = document.getElementById('config-form');

    if (supabasePill && configModal) {
      supabasePill.addEventListener('click', () => configModal.classList.add('is-open'));
    }
    if (configClose && configModal) {
      configClose.addEventListener('click', () => configModal.classList.remove('is-open'));
    }
    if (configModal) {
      configModal.addEventListener('click', (e) => {
        if (e.target === configModal) configModal.classList.remove('is-open');
      });
    }
    if (configForm) {
      configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('supabase-url-input').value.trim();
        const key = document.getElementById('supabase-key-input').value.trim();
        localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, anonKey: key }));
        this.supabaseConfig = { url, anonKey: key };
        configModal.classList.remove('is-open');
        this.loadDashboardData();
      });
    }

    // OmniRoute Config Modal Trigger
    const headerOmniPill = document.getElementById('header-omniroute-pill');
    const liveOmniPill = document.getElementById('omniroute-live-pill');
    const omniModal = document.getElementById('omniroute-modal');
    const omniClose = document.getElementById('omniroute-close-btn');
    const omniForm = document.getElementById('omniroute-form');

    const openOmniModal = () => omniModal && omniModal.classList.add('is-open');
    if (headerOmniPill) headerOmniPill.addEventListener('click', openOmniModal);
    if (liveOmniPill) liveOmniPill.addEventListener('click', openOmniModal);
    if (omniClose && omniModal) {
      omniClose.addEventListener('click', () => omniModal.classList.remove('is-open'));
    }
    if (omniModal) {
      omniModal.addEventListener('click', (e) => {
        if (e.target === omniModal) omniModal.classList.remove('is-open');
      });
    }
    if (omniForm) {
      omniForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url1 = document.getElementById('omniroute-url-input').value.trim();
        const url2 = document.getElementById('omniroute-local-url-input').value.trim();
        const key = document.getElementById('omniroute-key-input').value.trim();
        localStorage.setItem('omniroute_custom_tunnel', url1);
        localStorage.setItem('omniroute_secondary_endpoint', url2);
        localStorage.setItem('omniroute_secret_key', key);
        omniModal.classList.remove('is-open');
        this.checkOmniRouteRealtimeStatus();
      });
    }

    // OmniRoute Host Preset Quick Fill Buttons
    const btnPresetNgrok = document.getElementById('preset-btn-ngrok');
    const btnPresetLocal = document.getElementById('preset-btn-local');
    const btnPresetSwap = document.getElementById('preset-btn-swap');

    if (btnPresetNgrok) {
      btnPresetNgrok.addEventListener('click', () => {
        const inp = document.getElementById('omniroute-url-input');
        if (inp) inp.value = 'https://gullible-cytoplast-mardi.ngrok-free.dev/v1';
      });
    }
    if (btnPresetLocal) {
      btnPresetLocal.addEventListener('click', () => {
        const inp = document.getElementById('omniroute-local-url-input');
        if (inp) inp.value = 'http://localhost:20128/v1';
      });
    }
    if (btnPresetSwap) {
      btnPresetSwap.addEventListener('click', () => {
        const inp1 = document.getElementById('omniroute-url-input');
        const inp2 = document.getElementById('omniroute-local-url-input');
        if (inp1 && inp2) {
          const temp = inp1.value;
          inp1.value = inp2.value;
          inp2.value = temp;
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
        if (newPin.length < 4 || newPin.length > 8) {
          alert('Master PIN harus terdiri dari 4-8 digit.');
          return;
        }
        const newHash = await this.hashPin(newPin);

        this.cloudPinHash = newHash;
        localStorage.setItem('dash_custom_pin_hash', newHash);
        localStorage.removeItem(LOCKOUT_KEY);

        try {
          await fetch('/api/admin-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_pin', new_pin: newPin, current_pin_hash: this.cloudPinHash || localStorage.getItem('dash_custom_pin_hash') })
          });
        } catch (_) {}

        try {
          const config = this.getSupabaseConfig();
          if (config && config.url && config.anonKey) {
            await fetch(`${config.url}/rest/v1/admin_auth_config`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': config.anonKey,
                'Authorization': `Bearer ${config.anonKey}`,
                'Prefer': 'resolution=merge-duplicates,return=minimal'
              },
              body: JSON.stringify({
                id: 'master_auth',
                pin_hash: newHash,
                lockout_attempts: 0,
                locked_until: null,
                updated_at: new Date().toISOString()
              })
            });
          }
        } catch (_) {}

        changePinModal.classList.remove('is-open');
        alert('Master PIN berhasil diperbarui dan disinkronkan ke Supabase Cloud.');
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
  }

  // =========================================================================
  // 15. CSV & JSON DATA EXPORTERS
  // =========================================================================
  exportCSV() {
    const data = this.filterByRange(this.events, this.tableRange);
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    const headers = ['created_at', 'event_type', 'event_target', 'event_label', 'device_type', 'session_id', 'referrer'];
    const rows = data.map(e => headers.map(h => `"${String(e[h] || '').replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rafly_portfolio_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJSON() {
    const data = this.filterByRange(this.events, this.tableRange);
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `rafly_portfolio_telemetry_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // 16. CUSTOM CUBIC SMOOTH-SCROLL ENGINE & INERTIA SMOOTH WHEEL
  // =========================================================================
  smoothScrollTo(targetY, duration = 1100) {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    
    if (Math.abs(distance) < 2) return;

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

  initInertiaSmoothWheel() {
    let currentY = window.scrollY || window.pageYOffset;
    let targetY = currentY;
    let isRunning = false;
    const ease = 0.095;

    const updateWheelPhysics = () => {
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
    };

    window.addEventListener('wheel', (e) => {
      // If modal is open, let native dialog scrolling take full control
      if (document.body.classList.contains('modal-open') || document.querySelector('.dash-modal.is-open')) {
        return;
      }

      const path = e.composedPath ? e.composedPath() : [];
      const isScrollableChild = path.some(el => {
        if (!el || !el.classList) return false;
        return (
          el.classList.contains('dash-modal-card') ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.classList.contains('table-responsive')
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

  initCustomDropdowns() {
    document.querySelectorAll('.dash-select').forEach(selectEl => {
      if (selectEl.classList.contains('has-custom-dropdown')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      wrapper.id = `custom-wrap-${selectEl.id || Math.random().toString(36).substr(2, 6)}`;

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      const labelSpan = document.createElement('span');
      labelSpan.className = 'custom-select-label';
      labelSpan.textContent = selectEl.options[selectEl.selectedIndex]?.text || 'Pilih';

      const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrowSvg.setAttribute('class', 'custom-select-arrow');
      arrowSvg.setAttribute('width', '11');
      arrowSvg.setAttribute('height', '11');
      arrowSvg.setAttribute('viewBox', '0 0 24 24');
      arrowSvg.setAttribute('fill', 'none');
      arrowSvg.setAttribute('stroke', 'currentColor');
      arrowSvg.setAttribute('stroke-width', '2.5');
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', '6 9 12 15 18 9');
      arrowSvg.appendChild(polyline);

      trigger.appendChild(labelSpan);
      trigger.appendChild(arrowSvg);

      const menu = document.createElement('div');
      menu.className = 'custom-select-menu';
      menu.setAttribute('role', 'listbox');

      const renderOptions = () => {
        menu.innerHTML = '';
        Array.from(selectEl.options).forEach(opt => {
          const optDiv = document.createElement('div');
          optDiv.className = `custom-select-option ${opt.selected ? 'is-selected' : ''}`;
          optDiv.setAttribute('role', 'option');
          optDiv.setAttribute('data-value', opt.value);
          optDiv.textContent = opt.text;

          optDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            selectEl.value = opt.value;
            labelSpan.textContent = opt.text;
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            
            menu.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('is-selected'));
            optDiv.classList.add('is-selected');

            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          });

          menu.appendChild(optDiv);
        });
      };

      renderOptions();

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        
        // Close other dropdowns
        document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
          if (w !== wrapper) {
            w.classList.remove('is-open');
            const trig = w.querySelector('.custom-select-trigger');
            if (trig) trig.setAttribute('aria-expanded', 'false');
          }
        });

        // Ensure parent bars/headers raise z-index above all cards
        document.querySelectorAll('.dash-section-bar, .table-header-row').forEach(p => {
          p.style.zIndex = (p.contains(wrapper) && isOpen) ? '9999' : '';
        });
      });

      // Synchronize back if select value changed programmatically
      selectEl.addEventListener('change', () => {
        labelSpan.textContent = selectEl.options[selectEl.selectedIndex]?.text || '';
        menu.querySelectorAll('.custom-select-option').forEach(o => {
          o.classList.toggle('is-selected', o.getAttribute('data-value') === selectEl.value);
        });
      });

      selectEl.classList.add('has-custom-dropdown');
      selectEl.parentNode.insertBefore(wrapper, selectEl);
      wrapper.appendChild(selectEl);
      wrapper.appendChild(trigger);
      wrapper.appendChild(menu);
    });

    // Global Click Outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
        w.classList.remove('is-open');
        const trig = w.querySelector('.custom-select-trigger');
        if (trig) trig.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.dash-section-bar, .table-header-row').forEach(p => {
        p.style.zIndex = '';
      });
    });
  }

  initBackToTopButton() {
    const btn = document.getElementById('floating-back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY || window.pageYOffset;
      if (currentScroll > 350) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.smoothScrollTo(0, 1150);
    });
  }
}

// Instantiate and initialize dashboard controller on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new DashboardApp();
  app.init();
});
