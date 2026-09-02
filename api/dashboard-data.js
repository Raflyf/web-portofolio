/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/dashboard-data (v1.0.0)
 * Secure read endpoint for the admin dashboard.
 * - Requires a valid admin session token (set on PIN login by /api/admin-otp).
 * - Reads telemetry + AI memories using SUPABASE_SERVICE_ROLE_KEY (never anon).
 * - FAIL-CLOSED: no service role key or invalid token => 401/503.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';

const SUPABASE_DEFAULT_URL = 'https://rphyzcqwpkxtzllvymss.supabase.co';

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

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://raflyfirmansyah-portofolio.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // FAIL-CLOSED: service role key is mandatory for reading private telemetry.
  if (!serviceRoleKey) {
    return res.status(503).json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY belum disetel.' });
  }

  // Auth: the session token returned by /api/admin-otp on successful PIN login.
  const token = String(req.headers['x-admin-token'] || '').trim()
    || String((req.headers.authorization || '').replace(/^Bearer\s+/i, '')).trim();

  if (!token) {
    return res.status(401).json({ success: false, message: 'Sesi admin tidak ditemukan. Silakan login ulang.' });
  }

  const serviceHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    // 1. Validate session token against admin_auth_config (service_role read).
    const authRes = await fetch(
      `${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=session_token,session_expires_at,lockout_attempts`,
      { headers: serviceHeaders }
    );
    if (!authRes.ok) {
      return res.status(502).json({ success: false, message: 'Gagal memverifikasi sesi.' });
    }
    const authRows = await authRes.json();
    const row = Array.isArray(authRows) ? authRows[0] : null;
    if (!row || !row.session_token || row.session_token !== token) {
      return res.status(401).json({ success: false, message: 'Token sesi tidak valid.' });
    }
    // FAIL-CLOSED expiry: a session without a valid future expiry is rejected.
    const expiresAt = row.session_expires_at ? new Date(row.session_expires_at).getTime() : 0;
    if (!expiresAt || expiresAt < Date.now()) {
      return res.status(401).json({ success: false, message: 'Sesi admin telah kedaluwarsa. Silakan login ulang.' });
    }

    // Helper: High-Speed Paginated Batch Fetch for 100% complete row extraction
    async function fetchAllRows(endpoint) {
      let all = [];
      let offset = 0;
      const batchSize = 2500;
      while (true) {
        try {
          const res = await fetch(`${endpoint}&offset=${offset}&limit=${batchSize}`, {
            headers: {
              ...serviceHeaders,
              'Range-Unit': 'items',
              'Range': `${offset}-${offset + batchSize - 1}`
            }
          });
          if (!res.ok) break;
          const rows = await res.json();
          if (!Array.isArray(rows) || rows.length === 0) break;
          all = all.concat(rows);
          if (rows.length < batchSize) break;
          offset += batchSize;
        } catch (_) {
          break;
        }
      }
      return all;
    }

    // 2. Fetch ALL telemetry & AI memories in PARALLEL with service role.
    const [events, memories] = await Promise.all([
      fetchAllRows(
        `${supabaseUrl}/rest/v1/portfolio_telemetry?select=id,event_type,event_target,event_label,device_type,screen_resolution,referrer,session_id,created_at&order=created_at.desc`
      ),
      fetchAllRows(
        `${supabaseUrl}/rest/v1/ai_memories?select=*&order=created_at.desc`
      )
    ]);

    res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=30');
    return res.status(200).json({ success: true, events, memories });
  } catch (err) {
    return res.status(502).json({ success: false, message: 'Gagal mengambil data dashboard.' });
  }
}
