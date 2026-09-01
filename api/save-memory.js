/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/save-memory (v1.0.0)
 * Trusted RAG memory write path.
 * The browser NEVER inserts into ai_memories directly (anon INSERT is revoked
 * to prevent RAG poisoning). This endpoint validates + sanitizes the fact and
 * writes with SUPABASE_SERVICE_ROLE_KEY.
 * ============================================================================
 */

const SUPABASE_DEFAULT_URL = 'https://rphyzcqwpkxtzllvymss.supabase.co';

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://raflyfirmansyah-portofolio.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method tidak diizinkan.' });

  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!serviceRoleKey) {
    return res.status(503).json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY belum disetel.' });
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch (_) {
    return res.status(400).json({ success: false, message: 'Payload tidak valid.' });
  }

  const factText = String(body.fact_text || '').trim();
  const sessionId = String(body.session_id || '').trim();

  // Hard bounds mirror the schema RLS guard: fact_text <= 1000, session_id <= 64.
  if (!factText || factText.length > 1000) {
    return res.status(400).json({ success: false, message: 'Fakta memori harus 1-1000 karakter.' });
  }
  if (sessionId.length > 64) {
    return res.status(400).json({ success: false, message: 'session_id terlalu panjang.' });
  }

  // Light content guard: refuse obvious instruction-injection markers.
  const poisoned = /\b(ignore|override|disregard|jangan (ikuti|pedulikan)|abaikan)\b/i.test(factText);
  if (poisoned) {
    return res.status(400).json({ success: false, message: 'Konten memori mengandung pola yang tidak diizinkan.' });
  }

  try {
    const resSave = await fetch(`${supabaseUrl}/rest/v1/ai_memories`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        fact_text: factText,
        session_id: sessionId || null,
        created_at: new Date().toISOString()
      })
    });
    if (resSave.ok) {
      return res.status(200).json({ success: true });
    }
    return res.status(502).json({ success: false, message: 'Gagal menyimpan memori.' });
  } catch (err) {
    return res.status(502).json({ success: false, message: 'Gagal menyimpan memori.' });
  }
}
