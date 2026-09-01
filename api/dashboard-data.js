/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/dashboard-data (v1.0.0)
 * Secure read endpoint for the admin dashboard.
 * - Requires a valid admin session token (set on PIN login by /api/admin-otp).
 * - Reads telemetry + AI memories using SUPABASE_SERVICE_ROLE_KEY (never anon).
 * - FAIL-CLOSED: no service role key or invalid token => 401/503.
 * ============================================================================
 */

const SUPABASE_DEFAULT_URL = 'https://rphyzcqwpkxtzllvymss.supabase.co';

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

    // 2. Fetch telemetry (up to 5000 rows) with service role.
    const evRes = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_telemetry?select=id,event_type,event_target,event_label,device_type,screen_resolution,referrer,session_id,created_at&order=created_at.desc&limit=5000`,
      { headers: serviceHeaders }
    );
    const events = evRes.ok ? await evRes.json() : [];

    // 3. Fetch AI memories (up to 200) with service role.
    const memRes = await fetch(
      `${supabaseUrl}/rest/v1/ai_memories?select=*&order=created_at.desc&limit=200`,
      { headers: serviceHeaders }
    );
    const memories = memRes.ok ? await memRes.json() : [];

    return res.status(200).json({ success: true, events, memories });
  } catch (err) {
    return res.status(502).json({ success: false, message: 'Gagal mengambil data dashboard.' });
  }
}
