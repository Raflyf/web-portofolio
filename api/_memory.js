/**
 * ============================================================================
 * SERVER-SIDE MEMORY & HISTORY — port dari proyek chatbot (src/memory.ts + db.ts)
 * ============================================================================
 * Yang dibawa dari chatbot:
 *   - messages   : riwayat percakapan penuh per-sesi (server-side, bukan hanya client)
 *   - summaries  : ringkasan konteks per-sesi (distilasi tiap 8 pesan)
 *   - corrections: koreksi pengguna yang harus diingat
 *   - getContext : 24 pesan terakhir + ringkasan + koreksi
 *
 * Adaptasi untuk AI agent portofolio:
 *   - platform = 'web' (chatbot: telegram/whatsapp/web)
 *   - chat_id  = sessionId pengunjung
 *   - Tanpa tabel riddle/reminder (khusus chatbot)
 * ============================================================================
 */

const SUPABASE_DEFAULT_URL = 'https://rphyzcqwpkxtzllvymss.supabase.co';

function sb() {
  const url = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) return null;
  return { url, key };
}

async function sbFetch(path, init = {}) {
  const c = sb();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: c.key,
        Authorization: `Bearer ${c.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
        ...(init.headers || {}),
      },
    });
    return res;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Simpan pesan (port dari saveMessage di db.ts bot)
// ---------------------------------------------------------------------------
export async function saveMessage({ sessionId, role, content, via = null, tokens = null, latencyMs = null }) {
  if (!sessionId || !content) return false;
  const body = {
    platform: 'web',
    chat_id: String(sessionId).slice(0, 128),
    role: role === 'assistant' ? 'assistant' : 'user',
    content: String(content).slice(0, 20000),
    via: via || null,
  };
  if (tokens) {
    if (typeof tokens.prompt === 'number') body.prompt_tokens = tokens.prompt;
    if (typeof tokens.completion === 'number') body.completion_tokens = tokens.completion;
    if (typeof tokens.total === 'number') body.total_tokens = tokens.total;
  }
  if (latencyMs != null) body.latency_ms = Math.round(latencyMs);

  const res = await sbFetch('messages', { method: 'POST', body: JSON.stringify(body) });
  return Boolean(res && res.ok);
}

// ---------------------------------------------------------------------------
// Ambil konteks (port dari getContext di memory.ts bot)
// ---------------------------------------------------------------------------
const CONTEXT_LIMIT = 24;

export async function getContext(sessionId, limit = CONTEXT_LIMIT) {
  if (!sessionId) return { messages: [], summary: '', corrections: [] };
  const chatId = encodeURIComponent(String(sessionId).slice(0, 128));

  const [msgRes, sumRes, corRes] = await Promise.all([
    sbFetch(
      `messages?chat_id=eq.${chatId}&platform=eq.web&select=role,content,via,created_at&order=created_at.desc&limit=${limit}`,
      { headers: { Prefer: 'return=representation' } },
    ),
    sbFetch(`summaries?chat_id=eq.${chatId}&select=summary,updated_at&limit=1`, {
      headers: { Prefer: 'return=representation' },
    }),
    sbFetch(`corrections?chat_id=eq.${chatId}&select=correction,created_at&order=created_at.desc&limit=5`, {
      headers: { Prefer: 'return=representation' },
    }),
  ]);

  const out = { messages: [], summary: '', corrections: [] };

  if (msgRes && msgRes.ok) {
    const rows = await msgRes.json().catch(() => []);
    if (Array.isArray(rows)) {
      out.messages = rows
        .reverse()
        .filter((r) => r && (r.role === 'user' || r.role === 'assistant') && typeof r.content === 'string')
        .map((r) => ({ role: r.role, content: r.content }));
    }
  }
  if (sumRes && sumRes.ok) {
    const rows = await sumRes.json().catch(() => []);
    if (Array.isArray(rows) && rows[0] && rows[0].summary) out.summary = String(rows[0].summary);
  }
  if (corRes && corRes.ok) {
    const rows = await corRes.json().catch(() => []);
    if (Array.isArray(rows)) out.corrections = rows.map((r) => String(r.correction || '')).filter(Boolean);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Simpan ringkasan (upsert per chat_id)
// ---------------------------------------------------------------------------
export async function saveSummary(sessionId, summary) {
  if (!sessionId || !summary) return false;
  const body = {
    chat_id: String(sessionId).slice(0, 128),
    summary: String(summary).slice(0, 4000),
    updated_at: new Date().toISOString(),
  };
  const res = await sbFetch('summaries', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(body),
  });
  return Boolean(res && res.ok);
}

// ---------------------------------------------------------------------------
// Simpan koreksi pengguna
// ---------------------------------------------------------------------------
export async function saveCorrection(sessionId, correction) {
  if (!sessionId || !correction) return false;
  const body = {
    chat_id: String(sessionId).slice(0, 128),
    correction: String(correction).slice(0, 1000),
  };
  const res = await sbFetch('corrections', { method: 'POST', body: JSON.stringify(body) });
  return Boolean(res && res.ok);
}

// ---------------------------------------------------------------------------
// Hitung jumlah pesan sesi (untuk pemicu distilasi tiap 8 pesan)
// ---------------------------------------------------------------------------
export async function countMessages(sessionId) {
  if (!sessionId) return 0;
  const chatId = encodeURIComponent(String(sessionId).slice(0, 128));
  const res = await sbFetch(`messages?chat_id=eq.${chatId}&platform=eq.web&select=id`, {
    headers: { Prefer: 'count=exact', Range: '0-0' },
  });
  if (!res) return 0;
  const cr = res.headers.get('content-range') || '';
  const m = /\/(\d+)$/.exec(cr);
  return m ? Number(m[1]) : 0;
}

// ---------------------------------------------------------------------------
// Ambil item memori jangka-panjang (ai_memories — sudah ada di portfolio)
// ---------------------------------------------------------------------------
export async function fetchMemories(limit = 25) {
  const res = await sbFetch(`ai_memories?select=fact_text,created_at&order=created_at.desc&limit=${limit}`, {
    headers: { Prefer: 'return=representation' },
  });
  if (!res || !res.ok) return [];
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) ? rows.map((r) => String(r.fact_text || '')).filter(Boolean) : [];
}

// ---------------------------------------------------------------------------
// Simpan memori jangka-panjang
// ---------------------------------------------------------------------------
export async function saveMemory(factText, sessionId = null) {
  if (!factText) return false;
  const body = {
    fact_text: String(factText).slice(0, 1000),
    session_id: sessionId ? String(sessionId).slice(0, 128) : null,
  };
  const res = await sbFetch('ai_memories', { method: 'POST', body: JSON.stringify(body) });
  return Boolean(res && res.ok);
}

// ---------------------------------------------------------------------------
// Bersihkan perintah reset sesi (port dari isResetCommand bot)
// ---------------------------------------------------------------------------
export function isResetCommand(text) {
  const t = String(text || '').trim().toLowerCase();
  return t === '/reset' || t === '/clear' || t === '/new' || t === 'reset percakapan' || t === 'mulai baru';
}
