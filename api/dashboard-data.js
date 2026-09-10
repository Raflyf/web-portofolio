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
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || '';

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
    // Supports multi-device login (Laptop + Mobile) via JSON array of active sessions.
    const authRes = await fetch(
      `${supabaseUrl}/rest/v1/admin_auth_config?id=eq.master_auth&select=session_token,session_expires_at,lockout_attempts`,
      { headers: serviceHeaders }
    );
    if (!authRes.ok) {
      return res.status(502).json({ success: false, message: 'Gagal memverifikasi sesi.' });
    }
    const authRows = await authRes.json();
    const row = Array.isArray(authRows) ? authRows[0] : null;
    
    let isValidSession = false;
    if (row && row.session_token) {
      try {
        const tokenList = JSON.parse(row.session_token);
        if (Array.isArray(tokenList)) {
          const match = tokenList.find(t => t && t.token === token);
          if (match && Number(match.exp) > Date.now()) {
            isValidSession = true;
          }
        }
      } catch (_) {
        // Fallback for single-token legacy row format
        if (row.session_token === token) {
          const expiresAt = row.session_expires_at ? new Date(row.session_expires_at).getTime() : 0;
          if (expiresAt > Date.now()) {
            isValidSession = true;
          }
        }
      }
    }

    if (!isValidSession) {
      return res.status(401).json({ success: false, message: 'Sesi admin tidak valid atau telah kedaluwarsa. Silakan login ulang.' });
    }

    // Helper: High-Speed Paginated Batch Fetch with Safety Limit (Egress-Safe)
    async function fetchAllRows(endpoint, maxLimit = 10000) {
      let all = [];
      let offset = 0;
      const batchSize = 1000;
      while (all.length < maxLimit) {
        try {
          const res = await fetch(`${endpoint}&offset=${offset}&limit=${batchSize}`, {
            headers: {
              ...serviceHeaders,
              'Range-Unit': 'items',
              'Range': `${offset}-${offset + batchSize - 1}`,
              'Accept-Encoding': 'gzip, deflate'
            }
          });
          if (!res.ok) break;
          const rows = await res.json();
          if (!Array.isArray(rows) || rows.length === 0) break;
          all = all.concat(rows);
          if (rows.length < batchSize) break;
          offset += rows.length;
        } catch (_) {
          break;
        }
      }
      return all;
    }

    // Helper: newest created_at per table (2 tiny limit-1 queries).
    async function fetchServerMax() {
      let max = '';
      for (const table of ['portfolio_telemetry', 'ai_memories']) {
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/${table}?select=created_at&order=created_at.desc&limit=1`,
            { headers: { ...serviceHeaders, 'Accept-Encoding': 'gzip, deflate' } }
          );
          if (!res.ok) continue;
          const rows = await res.json();
          const ts = Array.isArray(rows) && rows[0] ? String(rows[0].created_at || '') : '';
          if (ts && (!max || ts > max)) max = ts;
        } catch (_) {}
      }
      return max;
    }

    const EVENTS_COLS = 'id,event_type,event_target,event_label,device_type,screen_resolution,referrer,session_id,created_at';
    const MEMORIES_COLS = 'id,fact_text,session_id,created_at';

    // Delta mode: ?since=ISO returns only newer rows + server_max.
    // Keeps the realtime cadence while transferring bytes instead of MBs.
    const sinceRaw = String((req.query && req.query.since) || '').trim();
    let sinceIso = '';
    if (sinceRaw) {
      const t = new Date(sinceRaw).getTime();
      if (Number.isFinite(t)) sinceIso = new Date(t).toISOString();
    }

    if (sinceIso) {
      const filter = `created_at=gt.${encodeURIComponent(sinceIso)}`;
      const [deltaEvents, deltaMemories, serverMax] = await Promise.all([
        fetchAllRows(
          `${supabaseUrl}/rest/v1/portfolio_telemetry?select=${EVENTS_COLS}&${filter}&order=created_at.asc`,
          2000
        ),
        fetchAllRows(
          `${supabaseUrl}/rest/v1/ai_memories?select=${MEMORIES_COLS}&${filter}&order=created_at.asc`,
          1000
        ),
        fetchServerMax()
      ]);
      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(200).json({
        success: true,
        incremental: true,
        events: deltaEvents,
        memories: deltaMemories,
        server_max: serverMax
      });
    }

    // 2. Full load (login / manual refresh): Bounded strictly to 90 days to eliminate egress bloat
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
    const cutoffFilter = `created_at=gte.${encodeURIComponent(ninetyDaysAgo)}`;

    const [events, memories, serverMax] = await Promise.all([
      fetchAllRows(
        `${supabaseUrl}/rest/v1/portfolio_telemetry?select=${EVENTS_COLS}&${cutoffFilter}&order=created_at.desc`,
        10000
      ),
      fetchAllRows(
        `${supabaseUrl}/rest/v1/ai_memories?select=${MEMORIES_COLS}&${cutoffFilter}&order=created_at.desc`,
        3000
      ),
      fetchServerMax()
    ]);

    res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
    return res.status(200).json({ success: true, incremental: false, events, memories, server_max: serverMax });
  } catch (err) {
    return res.status(502).json({ success: false, message: 'Gagal mengambil data dashboard.' });
  }
}
