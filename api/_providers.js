/**
 * ============================================================================
 * AI PROVIDER POOL — port dari proyek chatbot (projek_no_name/src/providers.ts)
 * ============================================================================
 * Rantai provider & model SAMA PERSIS dengan chatbot:
 *   Tier 1: xKiro Gateway   (qwen3.8-max:free -> 3.6-max-preview -> 3.7-max)
 *   Tier 2: Cloudflare AI   (@cf/qwen/qwen3.8-27b -> nemotron-3-120b -> gpt-oss-20b)
 *   Tier 3: Groq Cloud      (qwen/qwen3.8-27b -> openai/gpt-oss-120b)
 *   Tier 4: OpenRouter      (nex-n2.5-mini:free -> ling-3.0-flash-fin:free)
 *   Tier 5: Dahl Global     (DeepSeek-V4-Flash-0731, proxy worker)
 *   Tier 6: Google Gemini   (gemini-3.8-flash -> gemini-3.1-flash-lite)
 *
 * Fitur dari bot yang dibawa:
 *   - Rotasi key per-pool + cooldown saat 429 (keyHealth)
 *   - Pelacakan latensi model; model lambat diturunkan prioritasnya
 *   - Streaming SSE dengan guard token-pertama ADAPTIF (prompt besar = lebih longgar)
 *   - Non-streaming fallback untuk provider tanpa SSE (mis. Dahl HTTP 405)
 *   - Pembersihan <think> dari output
 *
 * Perbedaan dari bot (adaptasi AI agent, bukan chat bot):
 *   - Tidak ada kata "bot" di prompt/identitas; persona = AI agent asisten portofolio
 *   - System prompt dibangun oleh pemanggil (api/chat.js), modul ini murni transport
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Config (env) — sama dengan env.ts bot
// ---------------------------------------------------------------------------
const csv = (name) =>
  (process.env[name] || '')
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const num = (name, fallback) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

export const AI_CONFIG = {
  pools: {
    xkiro: csv('XKIRO_KEYS'),
    cloudflare: csv('CLOUDFLARE_KEYS'),
    groq: csv('GROQ_KEYS'),
    openrouter: csv('OPENROUTER_KEYS'),
    dahl: csv('DAHL_KEYS'),
    gemini: csv('GEMINI_KEYS'),
  },
  dahlUrl:
    (process.env.DAHL_PROXY_URL || '').trim() ||
    (process.env.DAHL_BASE_URL || '').trim() ||
    'https://inference.dahl.global/v1',
  connectTimeoutMs: num('CONNECT_TIMEOUT_MS', 6000),
  firstTokenTimeoutMs: num('FIRST_TOKEN_TIMEOUT_MS', 5500),
  streamIdleTimeoutMs: num('STREAM_IDLE_TIMEOUT_MS', 20000),
  visionFirstTokenMs: num('VISION_FIRST_TOKEN_MS', 15000),
  visionConnectTimeoutMs: num('VISION_CONNECT_TIMEOUT_MS', 8000),
  timeoutMs: num('REQUEST_TIMEOUT_MS', 45000),
  maxOutputTokens: num('MAX_OUTPUT_TOKENS', 2048),
  slowModelMs: num('SLOW_MODEL_MS', 6000),
  cacheTtlMs: num('CACHE_TTL_MS', 300000),
};

// ---------------------------------------------------------------------------
// Model katalog — SAMA dengan env.ts bot
// ---------------------------------------------------------------------------
export const AI_MODELS = {
  // DIUJI & DIPERBARUI 25 Sep (katalog Cohere baru di xKiro):
  // Command A+ menang telak pada benchmark nyata — 10/10 sukses, rata-rata 430ms
  // (vs Qwen 3.8 Max 3849ms), vision akurat (4/4 angka tabel, 2x lebih cepat dari
  // Qwen VL Plus), dan patuh pada persona/aturan sistem.
  // Qwen tetap dipertahankan sebagai backup (sudah terbukti andal sejak awal).
  xkiroPrimary: 'cohere/command-a-plus',
  xkiroBackup: ['cohere/command-a', 'qwen/qwen3.8-max:free', 'qwen/qwen3.6-max-preview:free', 'qwen/qwen3.7-max:free'],
  cfPrimary: '@cf/qwen/qwen3.8-27b',
  cfBackup: ['@cf/nvidia/nemotron-3-120b-a12b', '@cf/openai/gpt-oss-20b'],
  groqPrimary: 'qwen/qwen3.8-27b',
  groqBackup: ['openai/gpt-oss-120b'],
  // DIROMBAK 25 Sep: model lama (nex-n2.5-mini:free, ling-3.0-flash-fin:free) sudah
  // TIDAK ADA di katalog OpenRouter (dicek live: HTTP 404). Diganti dengan model
  // :free yang TERVERIFIKASI aktif saat ini (uji live 25 Sep):
  //   nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free  -> 597ms  "Hi! How can I help"
  //   nvidia/nemotron-3-ultra-550b-a55b:free              -> 663ms
  //   google/gemma-4-26b-a4b-it:free                      -> 1035ms
  //   google/gemma-4-31b-it:free                          -> 1268ms
  orPrimary: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  orBackup: [
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
  ],
  dahlPrimary: 'deepseek-ai/DeepSeek-V4-Flash-0731',
  dahlBackup: [],
  geminiPrimary: 'gemini-3.8-flash',
  geminiBackup: ['gemini-3.1-flash-lite'],
  // Rantai vision eksplisit (urutan dihormati mutlak, sama dengan bot)
  // Vision: Command A Vision ditambahkan di posisi 2 — terukur 4/4 akurat untuk
  // OCR tabel angka (2557ms), jauh lebih cepat dari Qwen VL Plus (4828ms) dan
  // menutup kelemahan model Cloudflare yang lemah baca digit halus.
  visionChain: [
    { kind: 'groq', model: 'qwen/qwen3.8-27b' },
    { kind: 'xkiro', model: 'cohere/command-a-vision' },
    { kind: 'cloudflare', model: '@cf/qwen/qwen3.8-27b' },
    { kind: 'gemini', model: 'gemini-3.1-flash-lite' },
    { kind: 'gemini', model: 'gemini-2.5-flash' },
    { kind: 'gemini', model: 'gemini-3.6-flash' },
    { kind: 'xkiro', model: 'qwen/qwen3.8-max:free' },
    { kind: 'xkiro', model: 'qwen/qwen3-vl-plus:free' },
    { kind: 'xkiro', model: 'qwen/qwen3.5-omni-flash:free' },
  ],
};

// ---------------------------------------------------------------------------
// Kesehatan key & latensi model (dari bot: keyHealth, modelLatency)
// ---------------------------------------------------------------------------
const keyCooldown = new Map(); // key -> timestamp bebas cooldown
const keySuccess = new Map();
const keyFailure = new Map();
const modelLatency = new Map(); // "kind:model" -> rata-rata ms
const modelCooldown = new Map(); // "kind:model" -> sampai kapan

// ---------------------------------------------------------------------------
// ROUND-ROBIN key rotation (permintaan user 25 Sep).
// Setiap pool punya indeks rotasi sendiri; request berikutnya mulai dari key
// BERIKUTNYA, sehingga beban terbagi rata ke seluruh key (bukan selalu key #1
// yang dipakai sampai kuotanya habis). Key yang sedang cooldown dilewati.
// ---------------------------------------------------------------------------
const rrIndex = new Map(); // kind -> index rotasi berikutnya

export function getOrderedKeys(kind, keys) {
  const now = Date.now();
  const n = keys.length;
  if (n === 0) return [];
  const start = (rrIndex.get(kind) || 0) % n;
  const out = [];
  // Susun berputar dari `start`: start, start+1, ..., n-1, 0, 1, ...
  for (let i = 0; i < n; i++) {
    const k = keys[(start + i) % n];
    if (!(keyCooldown.get(k) > now)) out.push(k);
  }
  // Bila semua key cooldown, tetap pakai urutan berputar penuh (best effort)
  if (out.length === 0) {
    for (let i = 0; i < n; i++) out.push(keys[(start + i) % n]);
  }
  // Majukan indeks rotasi global pool ini
  rrIndex.set(kind, (start + 1) % n);
  return out;
}

/** Majukan rotasi ke key berikutnya (dipakai setelah sukses agar merata). */
export function advanceRoundRobin(kind, keyCount) {
  const cur = rrIndex.get(kind) || 0;
  rrIndex.set(kind, (cur + 1) % Math.max(1, keyCount));
}

function markKeySuccess(key) {
  keySuccess.set(key, (keySuccess.get(key) || 0) + 1);
}
function markKeyFailure(key, cooldownMs = 60000) {
  keyFailure.set(key, (keyFailure.get(key) || 0) + 1);
  keyCooldown.set(key, Date.now() + cooldownMs);
}
function modelKey(kind, model) {
  return `${kind}:${model}`;
}
function isModelCooling(kind, model) {
  return (modelCooldown.get(modelKey(kind, model)) || 0) > Date.now();
}
function markModelFailure(kind, model, ms = 20000) {
  modelCooldown.set(modelKey(kind, model), Date.now() + ms);
}
function markModelLatency(kind, model, ms) {
  const k = modelKey(kind, model);
  const prev = modelLatency.get(k) || ms;
  modelLatency.set(k, Math.round(prev * 0.7 + ms * 0.3));
}
function orderModelsByLatency(kind, models) {
  return [...models].sort((a, b) => {
    const la = modelLatency.get(modelKey(kind, a)) || 3000;
    const lb = modelLatency.get(modelKey(kind, b)) || 3000;
    return la - lb;
  });
}

// ---------------------------------------------------------------------------
// Streaming SSE (port dari streamSse di bot)
// ---------------------------------------------------------------------------
const ERR_NO_FIRST_TOKEN = 'NO_FIRST_TOKEN';
const ERR_STREAM_IDLE = 'STREAM_IDLE_TIMEOUT';

function extractDelta(json) {
  const ch = json?.choices?.[0];
  if (!ch) return { text: '', active: false };
  const d = ch.delta || {};
  const text = typeof d.content === 'string' ? d.content : '';
  const reasoning = typeof d.reasoning === 'string' ? d.reasoning : (typeof d.reasoning_content === 'string' ? d.reasoning_content : '');
  return { text, active: Boolean(text) || Boolean(reasoning) };
}

function extractUsage(json) {
  const u = json?.usage;
  if (!u) return undefined;
  return {
    prompt: Number(u.prompt_tokens) || 0,
    completion: Number(u.completion_tokens) || 0,
    total: Number(u.total_tokens) || 0,
  };
}

async function streamSse(url, headers, body, limits) {
  const ctrl = new AbortController();
  const started = Date.now();
  let firstTokenAt = 0;
  let lastActivity = Date.now();
  let full = '';
  let usage;

  const totalTimer = setTimeout(() => ctrl.abort(new Error('TOTAL_TIMEOUT')), limits.totalMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      const err = new Error(`HTTP_${res.status}: ${txt.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let json;
        try {
          json = JSON.parse(payload);
        } catch {
          continue;
        }
        const d = extractDelta(json);
        if (d.active) {
          lastActivity = Date.now();
          if (!firstTokenAt) firstTokenAt = Date.now() - started;
        }
        if (d.text) full += d.text;
        const u = extractUsage(json);
        if (u) usage = u;

        // Guard: token pertama tidak pernah datang
        if (!firstTokenAt && Date.now() - started > limits.firstTokenMs) {
          throw new Error(ERR_NO_FIRST_TOKEN);
        }
        // Guard: stream menggantung
        if (Date.now() - lastActivity > limits.idleMs) {
          throw new Error(ERR_STREAM_IDLE);
        }
      }
    }
  } finally {
    clearTimeout(totalTimer);
  }

  const text = cleanModelOutput(full);
  if (!text) throw new Error('EMPTY_RESPONSE');
  return { text, tokens: usage, firstTokenAt };
}

function cleanModelOutput(text) {
  if (!text) return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Adapter: OpenAI-compatible (xKiro, Groq, OpenRouter, Dahl)
// ---------------------------------------------------------------------------
async function openAiChat(baseUrl, key, model, messages, opts = {}) {
  const { maxTokens, extraBody, totalTimeoutMs = AI_CONFIG.timeoutMs, connectTimeoutMs } = opts;
  const hasImage = messagesContainImage(messages);
  const connectMs = connectTimeoutMs ?? (hasImage ? AI_CONFIG.visionConnectTimeoutMs : AI_CONFIG.connectTimeoutMs);

  const body = {
    model,
    messages,
    max_tokens: maxTokens ?? AI_CONFIG.maxOutputTokens,
    stream: true,
    stream_options: { include_usage: true },
    ...extraBody,
  };

  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    Accept: 'text/event-stream',
  };

  // Guard token-pertama ADAPTIF (dari bot): prompt besar butuh prefill lebih lama
  const promptChars = messages.reduce((acc, m) => {
    if (typeof m.content === 'string') return acc + m.content.length;
    if (Array.isArray(m.content)) {
      return acc + m.content.reduce((a, p) => a + (p?.type === 'text' && typeof p.text === 'string' ? p.text.length : 0), 0);
    }
    return acc;
  }, 0);
  const promptTokens = Math.ceil(promptChars / 4);
  const adaptiveFirstTokenMs =
    AI_CONFIG.firstTokenTimeoutMs + (promptTokens > 3000 ? Math.min(6000, Math.floor((promptTokens - 3000) / 4)) : 0);
  const firstTokenMs = hasImage ? AI_CONFIG.visionFirstTokenMs : Math.min(connectMs + 6000, adaptiveFirstTokenMs);

  try {
    const r = await streamSse(`${baseUrl}/chat/completions`, headers, body, {
      firstTokenMs,
      idleMs: AI_CONFIG.streamIdleTimeoutMs,
      totalMs: totalTimeoutMs,
    });
    return { text: r.text, tokens: r.tokens };
  } catch (e) {
    // Fallback non-streaming (mis. Dahl HTTP 405 saat SSE)
    const msg = e?.message || '';
    if (msg.startsWith('HTTP_405') || msg.includes('NO_STREAM_BODY')) {
      const r = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { ...headers, Accept: 'application/json' },
        body: JSON.stringify({ ...body, stream: undefined, stream_options: undefined }),
      });
      if (!r.ok) throw new Error(`HTTP_${r.status}`);
      const data = await r.json();
      const raw = data?.choices?.[0]?.message?.content?.trim() || '';
      const text = cleanModelOutput(raw);
      if (!text) throw new Error('EMPTY_RESPONSE');
      const u = data?.usage;
      return {
        text,
        tokens: u
          ? {
              prompt: Number(u.prompt_tokens) || 0,
              completion: Number(u.completion_tokens) || 0,
              total: Number(u.total_tokens) || 0,
            }
          : undefined,
      };
    }
    throw e;
  }
}

function messagesContainImage(messages) {
  for (const m of messages) {
    if (Array.isArray(m.content)) {
      for (const p of m.content) {
        if (p && p.type === 'image_url') return true;
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Adapter: Cloudflare Workers AI (OpenAI-compat /ai/v1 + native /ai/run)
// ---------------------------------------------------------------------------
async function cloudflareChat(rawKey, model, messages, opts = {}) {
  // Key Cloudflare bisa berformat "accountId:token" atau hanya token
  let accountId = '';
  let token = rawKey;
  if (rawKey.includes(':')) {
    const i = rawKey.indexOf(':');
    accountId = rawKey.slice(0, i).trim();
    token = rawKey.slice(i + 1).trim();
  } else if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    accountId = process.env.CLOUDFLARE_ACCOUNT_ID.trim();
  }
  if (!accountId) throw new Error('CF_NO_ACCOUNT_ID');

  return openAiChat(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`, token, model, messages, {
    ...opts,
    extraBody: { ...(opts.extraBody || {}) },
  });
}

// ---------------------------------------------------------------------------
// Adapter: Google Gemini (native generateContent)
// ---------------------------------------------------------------------------
async function geminiChat(key, model, messages, opts = {}) {
  const { maxTokens, totalTimeoutMs = AI_CONFIG.timeoutMs } = opts;

  // Konversi format OpenAI -> Gemini
  const sysParts = [];
  const contents = [];
  for (const m of messages) {
    const textParts = [];
    if (typeof m.content === 'string') {
      textParts.push({ text: m.content });
    } else if (Array.isArray(m.content)) {
      for (const p of m.content) {
        if (p.type === 'text') textParts.push({ text: p.text });
        else if (p.type === 'image_url') {
          const url = p.image_url?.url || '';
          const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(url);
          if (match) {
            textParts.push({ inline_data: { mime_type: match[1], data: match[2] } });
          }
        }
      }
    }
    if (m.role === 'system') {
      sysParts.push(...textParts.map((t) => t.text || '').filter(Boolean));
    } else {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: textParts,
      });
    }
  }

  const body = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens ?? AI_CONFIG.maxOutputTokens,
      temperature: 0.6,
    },
  };
  if (sysParts.length) {
    body.systemInstruction = { parts: [{ text: sysParts.join('\n\n') }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${key}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), totalTimeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      const err = new Error(`HTTP_${res.status}: ${t.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const raw = parts.map((p) => p.text || '').join('');
    const text = cleanModelOutput(raw);
    if (!text) throw new Error('EMPTY_RESPONSE');
    const um = data?.usageMetadata;
    return {
      text,
      tokens: um
        ? {
            prompt: um.promptTokenCount || 0,
            completion: um.candidatesTokenCount || 0,
            total: um.totalTokenCount || 0,
          }
        : undefined,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Rantai tier (port dari steps() di bot)
// ---------------------------------------------------------------------------
export function buildChain() {
  return [
    {
      kind: 'xkiro',
      keys: AI_CONFIG.pools.xkiro,
      models: [AI_MODELS.xkiroPrimary, ...AI_MODELS.xkiroBackup],
      run: (k, m, msgs, opts) =>
        openAiChat('https://api.xkiro.com/v1', k, m, msgs, {
          ...opts,
          // PENTING (temuan uji 25 Sep): `reasoning: { effort: 'minimal' }` membuat
          // model Cohere membakar SELURUH anggaran token di penalaran internal lalu
          // mengembalikan content KOSONG dengan finish_reason 'length' — terukur
          // 6 dari 9 request gagal (max_tokens 500 habis tanpa satu kata pun output).
          // `effort: 'none'` menghentikan itu: 3/3 sukses, output 460-628 token normal.
          extraBody: { reasoning: { effort: 'none' }, ...(opts?.extraBody || {}) },
        }),
    },
    {
      kind: 'cloudflare',
      keys: AI_CONFIG.pools.cloudflare,
      models: [AI_MODELS.cfPrimary, ...AI_MODELS.cfBackup],
      run: (k, m, msgs, opts) => cloudflareChat(k, m, msgs, opts),
    },
    {
      kind: 'groq',
      keys: AI_CONFIG.pools.groq,
      models: [AI_MODELS.groqPrimary, ...AI_MODELS.groqBackup],
      run: (k, m, msgs, opts) =>
        openAiChat('https://api.groq.com/openai/v1', k, m, msgs, {
          ...opts,
          maxTokens: Math.min(opts?.maxTokens ?? AI_CONFIG.maxOutputTokens, 1024),
          extraBody: { reasoning_effort: 'none', frequency_penalty: 0.3, ...(opts?.extraBody || {}) },
        }),
    },
    {
      kind: 'openrouter',
      keys: AI_CONFIG.pools.openrouter,
      models: [AI_MODELS.orPrimary, ...AI_MODELS.orBackup],
      run: (k, m, msgs, opts) =>
        openAiChat('https://openrouter.ai/api/v1', k, m, msgs, {
          ...opts,
          extraBody: { reasoning: { effort: 'none' }, ...(opts?.extraBody || {}) },
        }),
    },
    {
      kind: 'dahl',
      keys: AI_CONFIG.pools.dahl,
      models: [AI_MODELS.dahlPrimary, ...AI_MODELS.dahlBackup],
      run: (k, m, msgs, opts) =>
        openAiChat(AI_CONFIG.dahlUrl, k, m, msgs, {
          ...opts,
          extraBody: { reasoning_effort: 'none', ...(opts?.extraBody || {}) },
        }),
    },
    {
      kind: 'gemini',
      keys: AI_CONFIG.pools.gemini,
      models: [AI_MODELS.geminiPrimary, ...AI_MODELS.geminiBackup],
      run: (k, m, msgs, opts) => geminiChat(k, m, msgs, opts),
    },
  ];
}

// ---------------------------------------------------------------------------
// Chat dengan failover (port dari chat() di bot)
// ---------------------------------------------------------------------------
export async function aiChat(messages, opts = {}) {
  const { vision = false, totalTimeoutMs = 50000 } = opts;
  const chain = buildChain();
  const deadline = Date.now() + totalTimeoutMs;
  const errors = [];

  // Urutan step: vision pakai rantai eksplisit, teks pakai tier
  const steps = [];
  if (vision) {
    const byKind = new Map(chain.map((s) => [s.kind, s]));
    for (const entry of AI_MODELS.visionChain) {
      const base = byKind.get(entry.kind);
      if (!base || base.keys.length === 0) continue;
      steps.push({ ...base, models: [entry.model] });
    }
  } else {
    for (const s of chain) {
      if (s.keys.length === 0) continue;
      steps.push(s);
    }
  }

  for (const step of steps) {
    if (Date.now() > deadline - 2000) break;
    // ROUND-ROBIN: urutan key dirotasi per step sehingga beban terbagi rata
    // ke seluruh key pool (permintaan user 25 Sep). getOrderedKeys() juga
    // memajukan indeks rotasi global pool untuk request berikutnya.
    const keys = getOrderedKeys(step.kind, step.keys);
    const models = orderModelsByLatency(step.kind, step.models).filter((m) => !isModelCooling(step.kind, m));

    for (const model of models) {
      // Untuk model ini: coba SEMUA key secara round-robin.
      // 429/402 = kuota KEY habis -> lanjut key berikutnya (bukan pindah model).
      // 400/404/EMPTY = masalah MODEL -> hentikan model ini, pindah model.
      for (let ki = 0; ki < keys.length; ki++) {
        if (Date.now() > deadline - 2000) break;
        const key = keys[ki];
        const remaining = deadline - Date.now();
        const t0 = Date.now();
        try {
          const r = await step.run(key, model, messages, {
            maxTokens: AI_CONFIG.maxOutputTokens,
            totalTimeoutMs: Math.max(4000, Math.min(remaining - 500, AI_CONFIG.timeoutMs)),
          });
          markKeySuccess(key);
          markModelLatency(step.kind, model, Date.now() - t0);
          return { text: r.text, via: `${step.kind}:${model}`, tokens: r.tokens, provider: step.kind, model };
        } catch (e) {
          const msg = e?.message || String(e);
          errors.push(`${step.kind}:${model}#${ki + 1} ${msg.slice(0, 70)}`);
          const status = e?.status || 0;
          if (status === 429 || status === 402) {
            markKeyFailure(key, 15 * 60 * 1000);
            continue; // KEY ini habis -> key berikutnya (round-robin)
          }
          if (status === 401 || status === 403) {
            markKeyFailure(key, 60 * 60 * 1000);
            continue; // KEY invalid -> key berikutnya
          }
          if (msg.includes('EMPTY_RESPONSE') || status === 400 || status === 404) {
            markModelFailure(step.kind, model, 60000);
            break; // MODEL bermasalah -> pindah model
          }
          // Timeout / network: coba key berikutnya untuk model yang sama
          markKeyFailure(key, 30000);
        }
      }
    }
  }

  const err = new Error('ALL_PROVIDERS_FAILED');
  err.details = errors.slice(-12);
  throw err;
}

export function providerStatus() {
  const p = AI_CONFIG.pools;
  return {
    xkiro: p.xkiro.length,
    cloudflare: p.cloudflare.length,
    groq: p.groq.length,
    openrouter: p.openrouter.length,
    dahl: p.dahl.length,
    gemini: p.gemini.length,
    total: p.xkiro.length + p.cloudflare.length + p.groq.length + p.openrouter.length + p.dahl.length + p.gemini.length,
  };
}
