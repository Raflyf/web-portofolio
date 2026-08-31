/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/admin-otp (v1.0.0)
 * Cryptographic PIN Management, Cross-Browser Supabase Sync & Email OTP Reset
 * Target Email: raflyfirmansyah02@gmail.com
 * ============================================================================
 */

import crypto from 'crypto';

const PIN_SALT = 'rafly_telemetry_salt';
const DEFAULT_PIN_HASH = 'db533e5fe9b399627eb386c19c967aa171dbc121a43fda2fa583c0a731aba78c';
const TARGET_EMAIL = 'raflyfirmansyah02@gmail.com';

// OTP verification attempt limiter (FIX M6): the in-memory cache is only a fast
// path — the source of truth is persisted in admin_auth_config (otp_attempts /
// otp_blocked_until) via service-role REST calls, so the limiter survives cold
// starts and multiple instances.
const otpAttemptCache = new Map();
const OTP_MAX_ATTEMPTS = 5;
const OTP_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

async function isOtpBlocked(ip, supabaseUrl, headers) {
  const now = Date.now();
  // Fast path: in-memory cache
  const rec = otpAttemptCache.get(ip);
  if (rec) {
    if (now - rec.start > OTP_ATTEMPT_WINDOW_MS) {
      otpAttemptCache.delete(ip);
    } else if (rec.count >= OTP_MAX_ATTEMPTS) {
      return true;
    }
  }
  // Source of truth: persisted counters in Supabase
  try {
    const queryRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=otp_attempts,otp_blocked_until`, {
      method: 'GET',
      headers
    });
    if (queryRes.ok) {
      const data = await queryRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const row = data[0];
        const blockedUntil = row.otp_blocked_until ? new Date(row.otp_blocked_until).getTime() : 0;
        if (blockedUntil > now) return true;
        if ((row.otp_attempts || 0) >= OTP_MAX_ATTEMPTS) return true;
      }
    }
  } catch (_) {}
  return false;
}

async function recordOtpFailure(ip, supabaseUrl, headers) {
  const now = Date.now();
  const rec = otpAttemptCache.get(ip);
  if (!rec || now - rec.start > OTP_ATTEMPT_WINDOW_MS) {
    otpAttemptCache.set(ip, { count: 1, start: now });
  } else {
    rec.count += 1;
  }
  if (otpAttemptCache.size > 2000) {
    for (const [k, v] of otpAttemptCache.entries()) {
      if (now - v.start > OTP_ATTEMPT_WINDOW_MS) otpAttemptCache.delete(k);
    }
  }
  const count = otpAttemptCache.get(ip)?.count || 1;
  const blockedUntil = count >= OTP_MAX_ATTEMPTS ? new Date(now + OTP_ATTEMPT_WINDOW_MS).toISOString() : null;
  try {
    await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        id: 'master_auth',
        otp_attempts: count,
        otp_blocked_until: blockedUntil,
        updated_at: new Date().toISOString()
      })
    });
  } catch (_) {}
}

async function clearOtpAttempts(ip, supabaseUrl, headers) {
  otpAttemptCache.delete(ip);
  try {
    await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        id: 'master_auth',
        otp_attempts: 0,
        otp_blocked_until: null,
        updated_at: new Date().toISOString()
      })
    });
  } catch (_) {}
}

const SUPABASE_DEFAULT_URL = 'https://rphyzcqwpkxtzllvymss.supabase.co';
const SUPABASE_DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU';

function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY || SUPABASE_DEFAULT_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, anonKey, serviceRoleKey };
}

function hashValue(val) {
  return crypto.createHash('sha256').update(String(val) + PIN_SALT).digest('hex');
}

/**
 * Send Email via EmailJS REST API or Resend API if credentials available
 */
async function dispatchEmail(otpCode) {
  const emailjsService = process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplate = process.env.EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID;
  const emailjsPrivateKey = process.env.EMAILJS_PRIVATE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  const subject = `[Admin Security] Kode OTP Reset Master PIN: ${otpCode}`;
  const messageBody = `Halo Rafly Firmansyah,\n\nBerikut adalah kode OTP verifikasi untuk mereset Master PIN Observability Dashboard Anda:\n\nKODE OTP: ${otpCode}\n\nKode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.\n\nJika Anda tidak melakukan permintaan ini, abaikan email ini.\n\n— Rafly Firmansyah Portfolio Security System`;

  // 1. Resend API Dispatch
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Security Gateway <security@raflyf.me>',
          to: [TARGET_EMAIL],
          subject: subject,
          text: messageBody
        })
      });
      if (res.ok) return { dispatched: true, provider: 'resend' };
    } catch (e) {
      console.warn('[Admin OTP] Resend dispatch failed:', e.message);
    }
  }

  // 2. EmailJS REST API Dispatch
  if (emailjsService && emailjsTemplate && emailjsPublicKey) {
    try {
      const payload = {
        service_id: emailjsService,
        template_id: emailjsTemplate,
        user_id: emailjsPublicKey,
        template_params: {
          to_email: TARGET_EMAIL,
          to_name: 'Rafly Firmansyah',
          otp_code: otpCode,
          message: messageBody,
          subject: subject
        }
      };
      if (emailjsPrivateKey) {
        payload.accessToken = emailjsPrivateKey;
      }
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return { dispatched: true, provider: 'emailjs' };
    } catch (e) {
      console.warn('[Admin OTP] EmailJS dispatch failed:', e.message);
    }
  }

  // Fallback: Log only partial OTP (first 2 digits masked) — do NOT log plaintext OTP
  const maskedOtp = otpCode.substring(0, 2) + '****';
  console.warn(`[Admin OTP Security] OTP generated for ${TARGET_EMAIL.replace(/(.{3})(.*)(@.*)/, '$1***$3')}: ${maskedOtp} (Valid for 10 min — email provider not configured)`);
  return { dispatched: false, provider: 'cloud_log', note: 'Email provider credentials not configured. OTP partially logged.' };
}

export default async function handler(req, res) {
  // CORS: Restrict to official portfolio origin only
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://raflyfirmansyah-portofolio.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url: supabaseUrl, anonKey, serviceRoleKey } = getSupabaseConfig();
  // C4: all requests to admin_auth_config use the service role key. The schema has
  // NO anon SELECT/INSERT/UPDATE/DELETE policies on that table, so the anon key is
  // useless here. This function runs server-side only — the service role key is
  // never exposed to the client.
  const activeKey = serviceRoleKey || anonKey;
  const headers = {
    'apikey': activeKey,
    'Authorization': `Bearer ${activeKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown-client';

  // Fail closed: any write/verification that requires Supabase MUST have the
  // service role key configured, otherwise RLS denies the write and we must not
  // pretend it succeeded.
  const requireServiceRole = () => {
    if (!serviceRoleKey) {
      return res.status(503).json({
        success: false,
        message: 'Konfigurasi server belum lengkap: variabel lingkungan SUPABASE_SERVICE_ROLE_KEY belum disetel. Hubungi administrator agar sinkronisasi keamanan cloud dapat diaktifkan.'
      });
    }
    return null;
  };

  try {
    const body = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) : req.query || {};
    const action = body.action || 'get_auth_state';

    // =========================================================================
    // 1. GET CURRENT AUTH STATE FROM SUPABASE
    // =========================================================================
    if (action === 'get_auth_state') {
      try {
        const queryRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=*`, {
          method: 'GET',
          headers
        });

        if (queryRes.ok) {
          const data = await queryRes.json();
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0];
            return res.status(200).json({
              success: true,
              pin_hash: row.pin_hash || DEFAULT_PIN_HASH,
              lockout_attempts: row.lockout_attempts || 0,
              locked_until: row.locked_until || null,
              has_active_otp: !!(row.otp_expires_at && new Date(row.otp_expires_at) > new Date()),
              updated_at: row.updated_at
            });
          }
        }
      } catch (err) {
        console.warn('[Admin OTP] Failed to fetch Supabase config:', err.message);
      }

      return res.status(200).json({
        success: true,
        pin_hash: DEFAULT_PIN_HASH,
        lockout_attempts: 0,
        locked_until: null,
        has_active_otp: false,
        fallback: true
      });
    }

    // =========================================================================
    // 2. SEND OTP CODE TO EMAIL
    // =========================================================================
    if (action === 'send_otp') {
      const denied = requireServiceRole();
      if (denied) return denied;

      const otpCode = crypto.randomInt(100000, 1000000).toString();
      const otpHash = hashValue(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Upsert to Supabase
      let otpSaved = false;
      try {
        const saveRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify({
            id: 'master_auth',
            otp_code_hash: otpHash,
            otp_expires_at: expiresAt,
            updated_at: new Date().toISOString()
          })
        });
        otpSaved = saveRes.ok;
        if (!otpSaved) console.warn('[Admin OTP] Supabase OTP save rejected:', saveRes.status);
      } catch (err) {
        console.warn('[Admin OTP] Supabase OTP save error:', err.message);
      }

      // Dispatch Email
      const emailResult = await dispatchEmail(otpCode);

      if (!otpSaved) {
        return res.status(502).json({
          success: false,
          message: 'Gagal menyimpan OTP ke gateway keamanan cloud. Coba lagi beberapa saat.'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Kode verifikasi OTP (6-digit) telah dikirim ke ${TARGET_EMAIL.replace(/(.{3})(.*)(@.*)/, '$1***$3')}. Berlaku selama 10 menit.`,
        target_email_masked: TARGET_EMAIL.replace(/(.{3})(.*)(@.*)/, '$1***$3'),
        expires_at: expiresAt,
        dispatched: emailResult.dispatched,
        provider: emailResult.provider
      });
    }

    // =========================================================================
    // 3. VERIFY OTP & RESET PIN
    // =========================================================================
    if (action === 'verify_otp_and_reset_pin') {
      const denied = requireServiceRole();
      if (denied) return denied;

      if (await isOtpBlocked(clientIp, supabaseUrl, headers)) {
        return res.status(429).json({ success: false, message: 'Terlalu banyak percobaan OTP gagal. Minta kode baru atau coba lagi nanti.' });
      }
      const enteredOtp = String(body.otp_code || '').trim();
      const newPin = String(body.new_pin || '').trim();

      if (!enteredOtp || enteredOtp.length !== 6) {
        return res.status(400).json({ success: false, message: 'Format kode OTP harus 6 digit angka.' });
      }

      if (!newPin || newPin.length < 4 || newPin.length > 8) {
        return res.status(400).json({ success: false, message: 'Master PIN baru harus terdiri dari 4-8 digit.' });
      }

      const inputOtpHash = hashValue(enteredOtp);
      const newPinHash = hashValue(newPin);

      // Verify with Supabase
      let isValidOtp = false;
      try {
        const queryRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=*`, {
          method: 'GET',
          headers
        });

        if (queryRes.ok) {
          const data = await queryRes.json();
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0];
            const isNotExpired = row.otp_expires_at && (new Date(row.otp_expires_at).getTime() > Date.now());
            if (row.otp_code_hash === inputOtpHash && isNotExpired) {
              isValidOtp = true;
            }
          }
        }
      } catch (err) {
        console.warn('[Admin OTP] Supabase verification query failed:', err.message);
      }

      // If OTP matches, update master PIN and reset all lockouts
      if (isValidOtp) {
        await clearOtpAttempts(clientIp, supabaseUrl, headers);
        let pinSaved = false;
        try {
          const saveRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
            method: 'POST',
            headers: {
              ...headers,
              'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify({
              id: 'master_auth',
              pin_hash: newPinHash,
              lockout_attempts: 0,
              locked_until: null,
              otp_code_hash: null,
              otp_expires_at: null,
              updated_at: new Date().toISOString()
            })
          });
          pinSaved = saveRes.ok;
          if (!pinSaved) console.warn('[Admin OTP] Supabase pin update rejected:', saveRes.status);
        } catch (err) {
          console.warn('[Admin OTP] Supabase pin update error:', err.message);
        }

        if (!pinSaved) {
          return res.status(502).json({
            success: false,
            message: 'OTP valid namun gagal menyimpan PIN baru ke cloud. Coba lagi.'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Master PIN keamanan berhasil diperbarui dan semua status kunci telah direset.',
          new_pin_hash: newPinHash
        });
      } else {
        await recordOtpFailure(clientIp, supabaseUrl, headers);
        return res.status(400).json({
          success: false,
          message: 'Kode OTP tidak cocok atau sudah kadaluwarsa. Silakan minta kode OTP baru.'
        });
      }
    }

    // =========================================================================
    // 4. DIRECT PIN UPDATE (REQUIRES VALID CURRENT PIN HASH VERIFICATION)
    // =========================================================================
    if (action === 'update_pin') {
      const denied = requireServiceRole();
      if (denied) return denied;

      // MINOR-6 Fix: Require current_pin_hash proof to prevent unauthorized PIN changes
      const providedCurrentHash = String(body.current_pin_hash || '').trim();
      const newPin = String(body.new_pin || '').trim();

      if (!newPin || newPin.length < 4 || newPin.length > 8) {
        return res.status(400).json({ success: false, message: 'Master PIN baru harus terdiri dari 4-8 digit.' });
      }

      // Verify current PIN hash matches Supabase record before allowing update
      if (!providedCurrentHash || providedCurrentHash.length !== 64) {
        return res.status(403).json({ success: false, message: 'Verifikasi PIN aktif diperlukan untuk mengganti PIN.' });
      }
      try {
        const verifyRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=pin_hash`, { method: 'GET', headers });
        if (!verifyRes.ok) {
          return res.status(502).json({ success: false, message: 'Gagal memverifikasi status keamanan di cloud.' });
        }
        const verifyData = await verifyRes.json();
        const storedHash = verifyData?.[0]?.pin_hash || DEFAULT_PIN_HASH;
        if (providedCurrentHash !== storedHash) {
          return res.status(403).json({ success: false, message: 'Hash PIN aktif tidak cocok. Aksi ditolak.' });
        }
      } catch (err) {
        console.warn('[Admin OTP] PIN verification fetch failed:', err.message);
        return res.status(502).json({ success: false, message: 'Gagal menghubungi gateway keamanan cloud.' });
      }

      const newPinHash = hashValue(newPin);

      let directPinSaved = false;
      try {
        const saveRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify({
            id: 'master_auth',
            pin_hash: newPinHash,
            lockout_attempts: 0,
            locked_until: null,
            updated_at: new Date().toISOString()
          })
        });
        directPinSaved = saveRes.ok;
        if (!directPinSaved) console.warn('[Admin OTP] Supabase direct pin update rejected:', saveRes.status);
      } catch (err) {
        console.warn('[Admin OTP] Supabase direct pin update error:', err.message);
      }

      if (!directPinSaved) {
        return res.status(502).json({ success: false, message: 'Gagal menyimpan PIN baru ke Supabase Cloud.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Master PIN keamanan berhasil disimpan ke Supabase Cloud.',
        new_pin_hash: newPinHash
      });
    }

    // =========================================================================
    // 5. RESET LOCKOUT
    // =========================================================================
    if (action === 'reset_lockout') {
      const denied = requireServiceRole();
      if (denied) return denied;

      // Wajib bukti hash PIN aktif — tanpa ini siapa pun bisa menolkan lockout brute-force
      const providedCurrentHash = String(body.current_pin_hash || '').trim();
      if (!providedCurrentHash || providedCurrentHash.length !== 64) {
        return res.status(403).json({ success: false, message: 'Verifikasi PIN aktif diperlukan untuk mereset lockout.' });
      }
      try {
        const verifyRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=pin_hash`, { method: 'GET', headers });
        if (!verifyRes.ok) {
          return res.status(502).json({ success: false, message: 'Gagal memverifikasi status keamanan di cloud.' });
        }
        const verifyData = await verifyRes.json();
        const storedHash = verifyData?.[0]?.pin_hash || DEFAULT_PIN_HASH;
        if (providedCurrentHash !== storedHash) {
          return res.status(403).json({ success: false, message: 'Hash PIN aktif tidak cocok. Aksi ditolak.' });
        }
      } catch (err) {
        console.warn('[Admin OTP] Lockout verification fetch failed:', err.message);
        return res.status(502).json({ success: false, message: 'Gagal menghubungi gateway keamanan cloud.' });
      }
      let lockoutSaved = false;
      try {
        const saveRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify({
            id: 'master_auth',
            lockout_attempts: 0,
            locked_until: null,
            updated_at: new Date().toISOString()
          })
        });
        lockoutSaved = saveRes.ok;
        if (!lockoutSaved) console.warn('[Admin OTP] Reset lockout Supabase rejected:', saveRes.status);
      } catch (err) {
        console.warn('[Admin OTP] Reset lockout Supabase error:', err.message);
      }

      if (!lockoutSaved) {
        return res.status(502).json({ success: false, message: 'Gagal mereset status penguncian di cloud.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Status penguncian brute-force berhasil dinolkan.'
      });
    }

    return res.status(400).json({ success: false, message: `Aksi tidak dikenal: ${action}` });
  } catch (err) {
    console.error('[Admin OTP Gateway Error]:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada gateway otentikasi admin.' });
  }
}
