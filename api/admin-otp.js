/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/admin-otp (v1.0.0)
 * Cryptographic PIN Management, Cross-Browser Supabase Sync & Email OTP Reset
 * Target Email: raflyfirmansyah02@gmail.com
 * ============================================================================
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Automatic local environment loader (reads .env.local / .env for local testing)
function loadLocalEnv() {
  try {
    const envFiles = ['.env.local', '.env'];
    for (const f of envFiles) {
      const fullPath = path.resolve(process.cwd(), f);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const k = trimmed.substring(0, idx).trim();
            const v = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (k) {
              process.env[k] = v;
            }
          }
        });
        break;
      }
    }
  } catch (_) {}
}
loadLocalEnv();

const PIN_SALT = 'rafly_telemetry_salt';
// NOTE: the seeded default PIN hash exists ONLY in the schema seed and is never
// accepted as a credential here (fail-closed). The constant was removed.
const TARGET_EMAIL = 'raflyfirmansyah02@gmail.com';

// OTP verification attempt limiter (FIX M6): the in-memory cache is only a fast
// path — the source of truth is persisted in admin_auth_config (otp_attempts /
// otp_blocked_until) via service-role REST calls, so the limiter survives cold
// starts and multiple instances.
const otpAttemptCache = new Map();
const OTP_MAX_ATTEMPTS = 5;
const OTP_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

// OTP send throttle (FIX M1): per-IP limiter on send_otp to prevent email spam.
// In-memory fast path, mirroring the otpAttemptCache pattern above.
const otpSendCache = new Map();
const OTP_SEND_MAX = 3;
const OTP_SEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_SEND_MIN_INTERVAL_MS = 60 * 1000; // 60 seconds between sends for the same IP

// Trusted client IP: prefer Vercel's trusted header, else the LAST element of
// x-forwarded-for (the value appended by the outermost trusted proxy), else the
// raw socket address. Never trust the first x-forwarded-for segment — clients
// can spoof it to bypass the OTP throttle.
function getClientIp(req) {
  const trusted = req.headers['x-vercel-forwarded-for'];
  if (trusted && typeof trusted === 'string') return trusted.split(',')[0].trim();
  const xff = req.headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const parts = xff.split(',');
    return (parts[parts.length - 1] || '').trim() || req.socket?.remoteAddress || 'unknown-client';
  }
  return req.socket?.remoteAddress || 'unknown-client';
}

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

// FIX M1: per-IP send throttle for send_otp. Returns null if allowed, otherwise
// an object { status, retryAfterSeconds, message } describing the block.
function checkOtpSendThrottle(ip) {
  const now = Date.now();
  const rec = otpSendCache.get(ip);
  if (rec && now - rec.start > OTP_SEND_WINDOW_MS) {
    otpSendCache.delete(ip);
  }
  const current = otpSendCache.get(ip);
  if (current) {
    // Enforce minimum 60s interval between sends for the same IP
    const elapsed = now - current.lastSendAt;
    if (elapsed < OTP_SEND_MIN_INTERVAL_MS) {
      const retryAfterSeconds = Math.ceil((OTP_SEND_MIN_INTERVAL_MS - elapsed) / 1000);
      return {
        status: 429,
        retryAfterSeconds,
        message: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfterSeconds} detik.`
      };
    }
    if (current.count >= OTP_SEND_MAX) {
      const retryAfterSeconds = Math.ceil((current.start + OTP_SEND_WINDOW_MS - now) / 1000);
      return {
        status: 429,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
        message: `Batas pengiriman OTP terlampaui (maks 3 per 10 menit). Coba lagi dalam ${Math.max(1, retryAfterSeconds)} detik.`
      };
    }
  }
  return null;
}

function recordOtpSend(ip) {
  const now = Date.now();
  const rec = otpSendCache.get(ip);
  if (!rec || now - rec.start > OTP_SEND_WINDOW_MS) {
    otpSendCache.set(ip, { count: 1, start: now, lastSendAt: now });
  } else {
    rec.count += 1;
    rec.lastSendAt = now;
  }
  // Bound the map size so it cannot grow unbounded
  if (otpSendCache.size > 2000) {
    for (const [k, v] of otpSendCache.entries()) {
      if (now - v.start > OTP_SEND_WINDOW_MS) otpSendCache.delete(k);
    }
  }
}

const SUPABASE_DEFAULT_URL = 'https://rphyzcqwpkxtzllvymss.supabase.co';

function getSupabaseConfig() {
  // FAIL-CLOSED: no hardcoded anon key fallback (a committed key is a leak).
  // Keys must come from environment variables.
  const url = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
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
  const resendFrom = process.env.RESEND_FROM || 'onboarding@resend.dev';

  const subject = `[Admin Security] Kode OTP Reset Master PIN: ${otpCode}`;
  const messageBody = `Halo Rafly Firmansyah,\n\nBerikut adalah kode OTP verifikasi untuk mereset Master PIN Observability Dashboard Anda:\n\nKODE OTP: ${otpCode}\n\nKode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.\n\nJika Anda tidak melakukan permintaan ini, abaikan email ini.\n\n— Rafly Firmansyah Portfolio Security System`;
  const htmlBody = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #0b0f19; color: #f1f5f9; border-radius: 12px; border: 1px solid #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6366f1; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Observability Security Gateway</h2>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Rafly Firmansyah Portfolio Dashboard</p>
  </div>
  <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 24px; text-align: center;">
    <p style="color: #cbd5e1; font-size: 14px; margin-top: 0;">Berikut adalah kode verifikasi OTP untuk mereset Master PIN Anda:</p>
    <div style="margin: 20px 0; padding: 14px; background: #1e1b4b; border: 1.5px dashed #6366f1; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #a5b4fc; font-family: monospace;">
      ${otpCode}
    </div>
    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Kode ini berlaku selama <strong>10 menit</strong>. Jangan berikan kode ini kepada siapapun.</p>
  </div>
  <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 24px;">Jika Anda tidak melakukan permintaan ini, abaikan pesan ini.</p>
</div>`;

  // 1. Resend API Dispatch (Direct REST API, zero dependency)
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Portfolio Security <${resendFrom}>`,
          to: [TARGET_EMAIL],
          subject: subject,
          text: messageBody,
          html: htmlBody
        })
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        return { dispatched: true, provider: 'resend', id: resData.id };
      } else {
        console.warn('[Admin OTP] Resend API error:', res.status, resData);
      }
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

  // Fallback: log only the target email — never log OTP digits (even masked).
  console.warn(`[Admin OTP Security] OTP generated for ${TARGET_EMAIL.replace(/(.{3})(.*)(@.*)/, '$1***$3')} (Valid for 10 min — email provider not configured)`);
  return { dispatched: false, provider: 'cloud_log', note: 'Email provider credentials not configured. OTP not logged.' };
}

// Invalidate any active admin session when the PIN changes (m-1): the session
// token must not survive a credential rotation.
async function clearSessionToken(supabaseUrl, headers) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        id: 'master_auth',
        session_token: null,
        session_expires_at: null,
        updated_at: new Date().toISOString()
      })
    });
  } catch (_) {}
}

async function storeSessionToken(supabaseUrl, headers, sessionToken) {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        id: 'master_auth',
        session_token: sessionToken,
        session_expires_at: expiresAt,
        lockout_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn('[Admin OTP] Failed to persist session token:', err.message);
  }
}

async function callRpc(supabaseUrl, headers, funcName, params = {}) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${funcName}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
    return { ok: false, status: res.status, text: await res.text() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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
  const activeKey = serviceRoleKey || anonKey;
  const headers = {
    'apikey': activeKey,
    'Authorization': `Bearer ${activeKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  const clientIp = getClientIp(req);

  const requireServiceRole = () => {
    if (!serviceRoleKey) {
      return res.status(503).json({
        success: false,
        message: 'Konfigurasi database belum lengkap. Jalankan skrip RPC di Supabase SQL Editor atau setel variabel lingkungan SUPABASE_SERVICE_ROLE_KEY.'
      });
    }
    return null;
  };

  try {
    let body = {};
    if (req.body) {
      if (typeof req.body === 'string') {
        try { body = JSON.parse(req.body); } catch (_) { body = {}; }
      } else if (typeof req.body === 'object') {
        body = req.body;
      }
    }
    const query = req.query || {};
    const params = { ...query, ...body };
    const action = params.action || 'get_auth_state';

    // =========================================================================
    // 1. GET CURRENT AUTH STATE FROM SUPABASE (Zero PIN Hash Exposure)
    // =========================================================================
    if (action === 'get_auth_state') {
      try {
        const queryRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=lockout_attempts,locked_until,otp_expires_at,updated_at`, {
          method: 'GET',
          headers
        });

        if (queryRes.ok) {
          const data = await queryRes.json();
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0];
            const isLocked = row.locked_until && (new Date(row.locked_until).getTime() > Date.now());
            return res.status(200).json({
              success: true,
              is_locked: !!isLocked,
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
        is_locked: false,
        lockout_attempts: 0,
        locked_until: null,
        has_active_otp: false,
        fallback: true
      });
    }

    // =========================================================================
    // 1B. VERIFY PIN SERVER-SIDE (Challenge-Response & Session Token Generation)
    // =========================================================================
    if (action === 'verify_pin') {
      const inputPin = String(params.pin || '').trim();
      const inputHash = String(params.pin_hash || (inputPin ? hashValue(inputPin) : '')).trim();

      if (!inputHash || inputHash.length !== 64) {
        return res.status(400).json({ success: false, verified: false, message: 'Format input PIN atau hash tidak valid.' });
      }

      // 1. Prioritaskan RPC SECURITY DEFINER (Bekerja mulus dengan Anon Key)
      const rpcResult = await callRpc(supabaseUrl, headers, 'rpc_admin_verify_pin', { p_pin_hash: inputHash });
      if (rpcResult.ok && rpcResult.data) {
        const d = rpcResult.data;
        if (d.success && d.verified) {
          const sessionToken = 'adm_' + crypto.randomBytes(32).toString('hex');
          // Persist token (best-effort) so dashboard-data can validate sessions.
          if (serviceRoleKey) {
            await storeSessionToken(supabaseUrl, headers, sessionToken);
          }
          return res.status(200).json({
            success: true,
            verified: true,
            session_token: sessionToken,
            message: d.message || 'Autentikasi Master PIN berhasil.'
          });
        } else if (d.is_locked) {
          return res.status(423).json({
            success: false,
            verified: false,
            is_locked: true,
            locked_until: d.locked_until,
            message: d.message || 'Akses terkunci sementara karena melebihi batas percobaan PIN. Gunakan OTP recovery.'
          });
        } else {
          return res.status(401).json({
            success: false,
            verified: false,
            lockout_attempts: d.lockout_attempts || 0,
            remaining_attempts: d.remaining_attempts !== undefined ? d.remaining_attempts : 0,
            is_locked: !!d.is_locked,
            locked_until: d.locked_until,
            message: d.message || 'Master PIN salah.'
          });
        }
      }

      // 2. Direct Table Fallback
      // FAIL-CLOSED: the stored hash comes ONLY from the database. If the row
      // is missing, login is refused — the seeded default is never accepted.
      let storedHash = '';
      let currentAttempts = 0;

      try {
        const queryRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=*`, {
          method: 'GET',
          headers
        });

        if (queryRes.ok) {
          const data = await queryRes.json();
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0];
            storedHash = row.pin_hash || '';
            currentAttempts = row.lockout_attempts || 0;

            // 1. Jika PIN cocok: Langsung loloskan dan reset lockout di database
            if (inputHash === storedHash) {
              try {
                await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
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
              } catch (_) {}

              const sessionToken = 'adm_' + crypto.randomBytes(32).toString('hex');
              if (serviceRoleKey) {
                await storeSessionToken(supabaseUrl, headers, sessionToken);
              }
              return res.status(200).json({
                success: true,
                verified: true,
                session_token: sessionToken,
                message: 'Autentikasi Master PIN berhasil.'
              });
            }

            // 2. Jika PIN salah dan status saat ini sedang terkunci
            if (row.locked_until && (new Date(row.locked_until).getTime() > Date.now())) {
              return res.status(423).json({
                success: false,
                verified: false,
                is_locked: true,
                locked_until: row.locked_until,
                message: 'Akses terkunci sementara karena melebihi batas percobaan PIN. Gunakan OTP recovery.'
              });
            }
          }
        }
      } catch (err) {
        console.warn('[Admin OTP] Supabase verify_pin fetch error:', err.message);
      }

      // m-7: duplicate match path removed — the direct-table match branch above
      // already returns with a stored session token, so this block was dead.
      const newAttempts = currentAttempts + 1;
      const willLock = newAttempts >= 5;
      const lockedUntil = willLock ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

      try {
        await fetch(`${supabaseUrl}/rest/v1/admin_auth_config`, {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify({
            id: 'master_auth',
            lockout_attempts: newAttempts,
            locked_until: lockedUntil,
            updated_at: new Date().toISOString()
          })
        });
      } catch (_) {}

      return res.status(401).json({
        success: false,
        verified: false,
        lockout_attempts: newAttempts,
        remaining_attempts: Math.max(0, 5 - newAttempts),
        is_locked: willLock,
        locked_until: lockedUntil,
        message: willLock
          ? 'Batas 5 kali percobaan PIN terlampaui. Sistem dikunci selama 15 menit. Silakan gunakan pemulihan OTP.'
          : `Master PIN salah. Sisa percobaan: ${Math.max(0, 5 - newAttempts)} kali.`
      });
    }

    // =========================================================================
    // 2. SEND OTP CODE TO EMAIL
    // =========================================================================
    if (action === 'send_otp') {
      // FIX M1: per-IP send throttle before generating/dispatching any OTP
      const throttle = checkOtpSendThrottle(clientIp);
      if (throttle) {
        return res.status(throttle.status).json({
          success: false,
          message: throttle.message,
          retry_after_seconds: throttle.retryAfterSeconds
        });
      }

      const otpCode = crypto.randomInt(100000, 1000000).toString();
      const otpHash = hashValue(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      let otpSaved = false;

      // 1. Prioritaskan RPC SECURITY DEFINER
      const rpcResult = await callRpc(supabaseUrl, headers, 'rpc_admin_save_otp', { p_otp_hash: otpHash, p_expires_at: expiresAt });
      if (rpcResult.ok && rpcResult.data?.success) {
        otpSaved = true;
      } else if (serviceRoleKey) {
        // 2. Direct Table Fallback jika service role tersedia
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
      }

      if (!otpSaved) {
        return res.status(503).json({
          success: false,
          message: 'Konfigurasi database belum lengkap. Jalankan skrip RPC di Supabase SQL Editor atau setel variabel lingkungan SUPABASE_SERVICE_ROLE_KEY.'
        });
      }

      // FIX M1: record the send (only after the OTP was persisted) so the
      // throttle window reflects actual dispatched attempts.
      recordOtpSend(clientIp);

      // Dispatch Email
      const emailResult = await dispatchEmail(otpCode);

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
      if (await isOtpBlocked(clientIp, supabaseUrl, headers)) {
        return res.status(429).json({ success: false, message: 'Terlalu banyak percobaan OTP gagal. Minta kode baru atau coba lagi nanti.' });
      }
      const enteredOtp = String(params.otp_code || '').trim();
      const newPin = String(params.new_pin || '').trim();

      if (!enteredOtp || enteredOtp.length !== 6) {
        return res.status(400).json({ success: false, message: 'Format kode OTP harus 6 digit angka.' });
      }

      if (!newPin || newPin.length < 4 || newPin.length > 8) {
        return res.status(400).json({ success: false, message: 'Master PIN baru harus terdiri dari 4-8 digit.' });
      }

      const inputOtpHash = hashValue(enteredOtp);
      const newPinHash = hashValue(newPin);

      // 1. Prioritaskan RPC SECURITY DEFINER
      const rpcResult = await callRpc(supabaseUrl, headers, 'rpc_admin_verify_otp_and_reset_pin', { p_otp_hash: inputOtpHash, p_new_pin_hash: newPinHash });
      if (rpcResult.ok && rpcResult.data) {
        const d = rpcResult.data;
        if (d.success) {
          await clearOtpAttempts(clientIp, supabaseUrl, headers);
          await clearSessionToken(supabaseUrl, headers); // m-1: invalidate sessions on PIN change
          return res.status(200).json({
            success: true,
            message: d.message || 'Master PIN keamanan berhasil diperbarui dan semua status kunci telah direset.'
          });
        } else {
          await recordOtpFailure(clientIp, supabaseUrl, headers);
          return res.status(400).json({
            success: false,
            message: d.message || 'Kode OTP tidak cocok atau sudah kadaluwarsa. Silakan minta kode OTP baru.'
          });
        }
      }

      // 2. Direct Table Fallback
      const denied = requireServiceRole();
      if (denied) return denied;

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
        } catch (err) {
          console.warn('[Admin OTP] Supabase pin update error:', err.message);
        }

        if (!pinSaved) {
          return res.status(502).json({
            success: false,
            message: 'OTP valid namun gagal menyimpan PIN baru ke cloud. Coba lagi.'
          });
        }

        await clearSessionToken(supabaseUrl, headers); // m-1: invalidate sessions on PIN change

        return res.status(200).json({
          success: true,
          message: 'Master PIN keamanan berhasil diperbarui dan semua status kunci telah direset.'
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
      const providedCurrentHash = String(params.current_pin_hash || '').trim();
      const newPin = String(params.new_pin || '').trim();

      if (!newPin || newPin.length < 4 || newPin.length > 8) {
        return res.status(400).json({ success: false, message: 'Master PIN baru harus terdiri dari 4-8 digit.' });
      }

      if (!providedCurrentHash || providedCurrentHash.length !== 64) {
        return res.status(403).json({ success: false, message: 'Verifikasi PIN aktif diperlukan untuk mengganti PIN.' });
      }

      const newPinHash = hashValue(newPin);

      // 1. Prioritaskan RPC SECURITY DEFINER
      const rpcResult = await callRpc(supabaseUrl, headers, 'rpc_admin_update_pin', { p_current_pin_hash: providedCurrentHash, p_new_pin_hash: newPinHash });
      if (rpcResult.ok && rpcResult.data) {
        const d = rpcResult.data;
        if (d.success) {
          await clearSessionToken(supabaseUrl, headers); // m-1: invalidate sessions on PIN change
          return res.status(200).json({
            success: true,
            message: d.message || 'Master PIN keamanan berhasil disimpan ke Supabase Cloud.'
          });
        } else {
          return res.status(403).json({
            success: false,
            message: d.message || 'PIN lama tidak cocok. Aksi ditolak.'
          });
        }
      }

      // 2. Direct Table Fallback
      const denied = requireServiceRole();
      if (denied) return denied;

      try {
        const verifyRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=pin_hash`, { method: 'GET', headers });
        if (!verifyRes.ok) {
          return res.status(502).json({ success: false, message: 'Gagal memverifikasi status keamanan di cloud.' });
        }
        const verifyData = await verifyRes.json();
        // FAIL-CLOSED: no default-hash fallback. If the stored hash is missing,
        // refuse the change — the seeded default must never be an accepted proof.
        const storedHash = verifyData?.[0]?.pin_hash || '';
        if (!storedHash || providedCurrentHash !== storedHash) {
          return res.status(403).json({ success: false, message: 'Hash PIN aktif tidak cocok. Aksi ditolak.' });
        }
      } catch (err) {
        console.warn('[Admin OTP] PIN verification fetch failed:', err.message);
        return res.status(502).json({ success: false, message: 'Gagal menghubungi gateway keamanan cloud.' });
      }

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
      } catch (err) {
        console.warn('[Admin OTP] Supabase direct pin update error:', err.message);
      }

      if (!directPinSaved) {
        return res.status(502).json({ success: false, message: 'Gagal menyimpan PIN baru ke Supabase Cloud.' });
      }

      await clearSessionToken(supabaseUrl, headers); // m-1: invalidate sessions on PIN change

      return res.status(200).json({
        success: true,
        message: 'Master PIN keamanan berhasil disimpan ke Supabase Cloud.'
      });
    }

    // =========================================================================
    // 5. RESET LOCKOUT
    // =========================================================================
    if (action === 'reset_lockout') {
      const providedCurrentHash = String(params.current_pin_hash || '').trim();
      if (!providedCurrentHash || providedCurrentHash.length !== 64) {
        return res.status(403).json({ success: false, message: 'Verifikasi PIN aktif diperlukan untuk mereset lockout.' });
      }

      // 1. Prioritaskan RPC SECURITY DEFINER
      const rpcResult = await callRpc(supabaseUrl, headers, 'rpc_admin_reset_lockout', { p_current_pin_hash: providedCurrentHash });
      if (rpcResult.ok && rpcResult.data) {
        const d = rpcResult.data;
        if (d.success) {
          return res.status(200).json({
            success: true,
            message: d.message || 'Status penguncian brute-force berhasil dinolkan.'
          });
        } else {
          return res.status(403).json({
            success: false,
            message: d.message || 'Pembuktian Master PIN tidak valid.'
          });
        }
      }

      // 2. Direct Table Fallback
      const denied = requireServiceRole();
      if (denied) return denied;

      try {
        const verifyRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=pin_hash`, { method: 'GET', headers });
        if (!verifyRes.ok) {
          return res.status(502).json({ success: false, message: 'Gagal memverifikasi status keamanan di cloud.' });
        }
        const verifyData = await verifyRes.json();
        // FAIL-CLOSED: no default-hash fallback.
        const storedHash = verifyData?.[0]?.pin_hash || '';
        if (!storedHash || providedCurrentHash !== storedHash) {
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
