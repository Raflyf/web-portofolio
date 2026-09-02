/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/save-memory (v1.0.0)
 * Trusted RAG memory write path.
 * The browser NEVER inserts into ai_memories directly (anon INSERT is revoked
 * to prevent RAG poisoning). This endpoint validates + sanitizes the fact and
 * writes with SUPABASE_SERVICE_ROLE_KEY.
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

// Trusted client IP: prefer Vercel's trusted header, else the LAST element of
// x-forwarded-for (the value appended by the outermost trusted proxy), else the
// raw socket address. Never trust the first x-forwarded-for segment — clients
// can spoof it to bypass per-IP rate limits.
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

// In-memory per-IP limiter (max 5 posts/minute). Best-effort fast path;
// keeps the write path bounded against DB-write DoS on a single warm instance.
const memorySaveCache = new Map();
const SAVE_MAX_PER_WINDOW = 5;
const SAVE_WINDOW_MS = 60 * 1000;

function isSaveLimited(clientIp) {
  const now = Date.now();
  const rec = memorySaveCache.get(clientIp);
  if (!rec || (now - rec.start) > SAVE_WINDOW_MS) {
    memorySaveCache.set(clientIp, { count: 1, start: now });
    if (memorySaveCache.size > 2000) {
      for (const [k, v] of memorySaveCache.entries()) {
        if (now - v.start > SAVE_WINDOW_MS) memorySaveCache.delete(k);
      }
    }
    return false;
  }
  rec.count += 1;
  return rec.count > SAVE_MAX_PER_WINDOW;
}

const MAX_BODY_BYTES = 50 * 1024; // 50KB

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://raflyfirmansyah-portofolio.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method tidak diizinkan.' });

  // Body size cap before any parsing: reject oversized payloads (413).
  const contentLength = Number(req.headers['content-length']);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ success: false, message: 'Payload terlalu besar (maks 50KB).' });
  }

  // Per-IP rate limit before any DB write.
  const clientIp = getClientIp(req);
  if (isSaveLimited(clientIp)) {
    return res.status(429).json({ success: false, message: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const SUPABASE_DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;
  if (!supabaseKey) {
    return res.status(503).json({ success: false, message: 'Kunci otorisasi Supabase belum disetel.' });
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
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
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
