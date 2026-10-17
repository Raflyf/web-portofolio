/**
 * ============================================================================
 * AI MULTI-PROVIDER ENGINE — SINKRONISASI LENGKAP DARI PROYEK CHATBOT
 * ============================================================================
 * Arsitektur failover cerdas 8-Tier dengan Balapan Model (Staggered Model Racing),
 * Rotasi Key Round-Robin, Circuit Breaker Adaptif (TPM vs TPD), Prompt Caching,
 * Streaming SSE Dua-Fase, dan Sanitasi Think Tokens.
 *
 * TIER HIERARCHY (Chatbot SOTA Matrix):
 *   Tier 1: DreamPrompting  (groq/qwen/qwen3.6-27b -> groq/openai/gpt-oss-120b)
 *   Tier 2: Cloudflare AI   (@cf/qwen/qwen3.8-27b -> nemotron-3-120b-a12b | Scout Vision)
 *   Tier 3: OpenCode Free   (muse-spark-1.3 -> mimo-v2.6-flash-free via 4-Tool Fingerprint)
 *   Tier 4: OpenRouter      (nvidia/nemotron-3-ultra-550b-a55b:free -> ling-3.0-flash)
 *   Tier 5: NVIDIA NIM      (google/diffusiongemma-26b-a4b-it -> meta/llama-3.2-11b-vision)
 *   Tier 6: Groq Cloud API  (qwen/qwen3.8-27b -> openai/gpt-oss-120b)
 *   Tier 7: Google Gemini   (gemini-3.8-flash -> gemini-flash-lite-latest -> gemini-3.6-flash)
 *   Tier 8: Dahl Global     (DeepSeek-V4-Flash-0731 -> zai-org/GLM-5.3-Flash)
 *
 * FITUR UTAMA:
 *   - Balapan Model dalam Tier: Model utama & cadangan diluncurkan bersamaan (stagger 400ms);
 *     jawaban tercepat menang via Promise.any, model kalah langsung dibatalkan (AbortController).
 *   - Rotasi Kunci Round-Robin: Beban terbagi merata lintas key; tidak ada key yang habis duluan.
 *   - Deteksi Limit Presisi: Membedakan rate limit per menit (60s) vs limit harian TPD (00:00 UTC).
 *   - Pelacakan Latensi EWMA: Model cepat dipromosikan ke depan secara dinamis.
 * ============================================================================
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Helpers Pembacaan Environment
// ---------------------------------------------------------------------------
const cleanStr = (name) => {
  const val = process.env[name];
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
};

const csv = (name) => {
  const raw = process.env[name] || '';
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim().replace(/^["']|["']$/g, '').trim())
    .filter(Boolean);
};

const num = (name, fallback) => {
  const v = Number(cleanStr(name));
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

const numAllowZero = (name, fallback) => {
  const raw = cleanStr(name);
  if (!raw) return fallback;
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
};

// ---------------------------------------------------------------------------
// Konfigurasi Gateway & Pool Kunci
// ---------------------------------------------------------------------------
export const AI_CONFIG = {
  pools: {
    dreamprompting: csv('DREAMPROMPTING_KEYS'),
    cloudflare: csv('CLOUDFLARE_KEYS'),
    opencode: csv('OPENCODE_KEYS').length > 0 ? csv('OPENCODE_KEYS') : ['public'],
    openrouter: csv('OPENROUTER_KEYS'),
    nvidia: csv('NVIDIA_KEYS'),
    groq: csv('GROQ_KEYS'),
    gemini: csv('GEMINI_KEYS'),
    dahl: csv('DAHL_KEYS'),
  },
  cloudflareAccountId: cleanStr('CLOUDFLARE_ACCOUNT_ID'),
  dahlUrl: cleanStr('DAHL_BASE_URL') || cleanStr('DAHL_PROXY_URL') || 'https://inference.dahl.global/v1',
  raceModels: numAllowZero('RACE_MODELS', 1),
  raceStaggerMs: num('RACE_STAGGER_MS', 400),
  connectTimeoutMs: num('CONNECT_TIMEOUT_MS', 3000),
  chainDeadlineMs: num('CHAIN_DEADLINE_MS', 45000),
  firstTokenTimeoutMs: num('FIRST_TOKEN_TIMEOUT_MS', 5500),
  streamIdleTimeoutMs: num('STREAM_IDLE_TIMEOUT_MS', 30000),
  visionFirstTokenMs: num('VISION_FIRST_TOKEN_MS', 12000),
  visionConnectTimeoutMs: num('VISION_CONNECT_TIMEOUT_MS', 8000),
  timeoutMs: num('REQUEST_TIMEOUT_MS', 60000),
  maxOutputTokens: num('MAX_OUTPUT_TOKENS', 2500),
  maxTokensLimit: num('MAX_TOKENS_LIMIT', 8000),
  slowModelMs: num('SLOW_MODEL_MS', 12000),
  cacheTtlMs: num('CACHE_TTL_MS', 300000),
};

// ---------------------------------------------------------------------------
// Katalog Model Resmi SOTA (Identik dengan Chatbot v0.93)
// ---------------------------------------------------------------------------
export const AI_MODELS = {
  // Tier 1: DreamPrompting (100 RPM, rolling free tier)
  dpPrimary: 'groq/qwen/qwen3.6-27b',
  dpBackup: ['groq/openai/gpt-oss-120b'],

  // Tier 2: Cloudflare Workers AI
  cfPrimary: '@cf/qwen/qwen3.8-27b',
  cfBackup: ['@cf/nvidia/nemotron-3-120b-a12b'],
  cfVision: [
    '@cf/meta/llama-4-scout-17b-16e-instruct',
    '@cf/meta/llama-3.2-11b-vision-instruct',
    '@cf/qwen/qwen3.8-27b',
  ],

  // Tier 3: OpenCode Free (langsung ke opencode.ai)
  opencodePrimary: 'muse-spark-1.3-contributor-free',
  opencodeBackup: ['mimo-v2.6-flash-free'],

  // Tier 4: OpenRouter (free tier)
  orPrimary: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  orBackup: ['inclusionai/ling-3.0-flash-sante:free'],

  // Tier 5: NVIDIA NIM (1.000 free credits / key)
  nvidiaPrimary: 'google/diffusiongemma-26b-a4b-it',
  nvidiaBackup: ['meta/llama-3.2-11b-vision-instruct'],

  // Tier 6: Groq Cloud API (LPU Ultra-Fast Inference)
  groqPrimary: 'qwen/qwen3.8-27b',
  groqBackup: ['openai/gpt-oss-120b'],

  // Tier 7: Google Gemini API (1M Konteks)
  geminiPrimary: 'gemini-3.8-flash',
  geminiBackup: ['gemini-flash-lite-latest', 'gemini-3.6-flash'],

  // Tier 8: Dahl Global (Saldo 1 Miliar Token)
  dahlPrimary: 'deepseek-ai/DeepSeek-V4-Flash-0731',
  dahlBackup: ['zai-org/GLM-5.3-Flash'],

  // Rantai Vision Eksplisit (diurutkan berdasarkan bukti uji akurasi baca OCR)
  visionChain: [
    { kind: 'groq', model: 'qwen/qwen3.8-27b' },
    { kind: 'cloudflare', model: '@cf/meta/llama-4-scout-17b-16e-instruct' },
    { kind: 'cloudflare', model: '@cf/qwen/qwen3.8-27b' },
    { kind: 'gemini', model: 'gemini-flash-lite-latest' },
    { kind: 'gemini', model: 'gemini-3.6-flash' },
    { kind: 'nvidia', model: 'meta/llama-3.2-11b-vision-instruct' },
  ],
};

// Parameter inferensi standar (F5 konsistensi output)
const BASE_GEN = {
  temperature: 0.45,
  presence_penalty: 0.0,
  frequency_penalty: 0.15,
};

const BASE_GEN_TIGHT = {
  ...BASE_GEN,
  maxTokens: 1024,
};

// ---------------------------------------------------------------------------
// Health Management: Circuit Breaker, Rotasi & Latensi
// ---------------------------------------------------------------------------
const keyCooldownMap = new Map(); // `${kind}:${keyHash}` -> timestamp
const keyRotationIndexMap = new Map(); // kind -> number
const modelCooldownMap = new Map(); // `${kind}:${model}` -> timestamp
const modelLatencyMap = new Map(); // `${kind}:${model}` -> number (EWMA)

function keyHash(key) {
  if (!key) return 'anonymous';
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 12);
}

function redactSecret(sec) {
  if (!sec || typeof sec !== 'string') return 'none';
  if (sec.length <= 8) return '***';
  return sec.slice(0, 4) + '...' + sec.slice(-4);
}

function redactUrl(url) {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/([?&](?:key|api_key|token|access_token)=)[^&]+/gi, '$1[REDACTED]');
}

function msUntilDailyResetUtc() {
  const nowMs = Date.now();
  const dayMs = 86400000;
  const nextReset = (Math.floor(nowMs / dayMs) + 1) * dayMs;
  return Math.max(60000, nextReset + 5 * 60000 - nowMs);
}

export function getOrderedKeys(kind, keys) {
  if (!keys || keys.length <= 1) return keys || [];
  const now = Date.now();
  const healthy = [];
  const cooling = [];

  for (const k of keys) {
    const kh = `${kind}:${keyHash(k)}`;
    const cd = keyCooldownMap.get(kh) || 0;
    if (now < cd) cooling.push(k);
    else healthy.push(k);
  }

  const pool = healthy.length > 0 ? healthy : cooling;
  if (pool.length <= 1) return pool;

  // Round-robin index: maju satu posisi tiap pemanggilan
  const start = (keyRotationIndexMap.get(kind) ?? 0) % pool.length;
  keyRotationIndexMap.set(kind, start + 1);

  return [...pool.slice(start), ...pool.slice(0, start)];
}

function recordKeySuccess(kind, key, model) {
  keyCooldownMap.delete(`${kind}:${keyHash(key)}`);
  modelCooldownMap.delete(`${kind}:${model}`);
}

function recordKeyFailure(kind, key, err) {
  const kh = `${kind}:${keyHash(key)}`;
  const msg = err instanceof Error ? err.message : String(err);

  // 1. Kuota atau saldo habis
  if (/insufficient_quota|Insufficient wallet balance|insufficient balance|exceeded your current quota/i.test(msg)) {
    keyCooldownMap.set(kh, Date.now() + 6 * 60 * 60000);
    return;
  }

  // 2. Kapasitas concurrency penuh (sementara, 2 menit)
  if (/concurrency capacity|Paid accounts are admitted first|at capacity|overloaded/i.test(msg)) {
    keyCooldownMap.set(kh, Date.now() + 2 * 60000);
    return;
  }

  // 3. Kuota Neuron Cloudflare habis (reset 00:00 UTC)
  if (kind === 'cloudflare' && /neurons|daily free allocation|4006|workers paid/i.test(msg)) {
    const cd = Date.now() + msUntilDailyResetUtc();
    for (const other of AI_CONFIG.pools.cloudflare) {
      keyCooldownMap.set(`cloudflare:${keyHash(other)}`, cd);
    }
    return;
  }

  // 4. Rate Limit (429): Bedakan per-hari vs per-menit
  const is429 = msg.includes('429') || msg.includes('RATE_LIMITED') || (err && err.status === 429);
  if (is429) {
    const errBody = (err && (err.fullBody || err.body || '')) || msg;
    const isDaily = /\b(?:tokens?|requests?)\s+per\s+day\b|\bTPD\b|\bRPD\b|daily\s+(?:quota|limit|allocation)|kuota\s+harian|batas\s+harian/i.test(errBody);
    const isMinute = /\b(?:tokens?|requests?)\s+per\s+minute\b|\bTPM\b|\bRPM\b|try\s+again\s+in/i.test(errBody);

    if (isDaily && !isMinute) {
      keyCooldownMap.set(kh, Date.now() + msUntilDailyResetUtc());
      return;
    }

    if (kind === 'dreamprompting') {
      const isDailyDream = /daily|quota|token/i.test(msg);
      const cd = Date.now() + (isDailyDream ? 24 * 60 * 60000 + 5 * 60000 : 60000);
      for (const other of AI_CONFIG.pools.dreamprompting) {
        keyCooldownMap.set(`dreamprompting:${keyHash(other)}`, cd);
      }
      return;
    }

    // Default rate limit per-menit: 60 detik
    keyCooldownMap.set(kh, Date.now() + 60000);
    return;
  }

  // 5. Auth / Izin Kunci Ditolak (401 / 403 / CreditsError)
  if (msg.includes('401') || msg.includes('403') || msg.includes('CreditsError')) {
    keyCooldownMap.set(kh, Date.now() + 5 * 60000);
    return;
  }

  // 6. Timeout koneksi atau model hang
  if (msg.includes('TIMEOUT') || msg.includes('NO_FIRST_TOKEN')) {
    keyCooldownMap.set(kh, Date.now() + 2 * 60000);
    return;
  }

  // Kesalahan umum: istirahatkan 30 detik
  keyCooldownMap.set(kh, Date.now() + 30000);
}

function isModelCoolingDown(kind, model) {
  const cd = modelCooldownMap.get(`${kind}:${model}`) || 0;
  return Date.now() < cd;
}

function recordModelFailure(kind, model, durationMs = 20000) {
  modelCooldownMap.set(`${kind}:${model}`, Date.now() + durationMs);
}

function recordModelLatency(kind, model, ms) {
  const id = `${kind}:${model}`;
  const prev = modelLatencyMap.get(id);
  modelLatencyMap.set(id, prev === undefined ? ms : Math.round(prev * 0.7 + ms * 0.3));
}

function isModelSlow(kind, model) {
  const lat = modelLatencyMap.get(`${kind}:${model}`);
  return lat !== undefined && lat > AI_CONFIG.slowModelMs;
}

function orderModelsByLatency(kind, models) {
  const fast = models.filter((m) => !isModelSlow(kind, m));
  const slow = models.filter((m) => isModelSlow(kind, m));
  return [...fast, ...slow];
}

// ---------------------------------------------------------------------------
// Pembersihan Token & Output
// ---------------------------------------------------------------------------
function cleanModelOutput(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
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

/**
 * Pangkas riwayat pesan secara adaptif agar tetap muat di batas ITPM (misal Groq).
 * Mempertahankan minimal 4 pesan terakhir dan memotong konteks tambahan dari belakang.
 */
export function trimMessagesToTokenBudget(messages, maxBudgetTokens = 8000) {
  if (!messages || messages.length === 0) return messages;

  const estimateTokens = (msgs) => {
    let chars = 0;
    for (const m of msgs) {
      if (typeof m.content === 'string') {
        chars += m.content.length;
      } else if (Array.isArray(m.content)) {
        for (const part of m.content) {
          if (part && part.type === 'text') chars += part.text.length;
          else if (part && part.type === 'image_url') chars += 13200; // ~4000 token
        }
      }
    }
    return Math.ceil(chars / 3.3);
  };

  let totalTokens = estimateTokens(messages);
  if (totalTokens <= maxBudgetTokens) return messages;

  const out = messages.slice();
  const systemMsg = out[0];
  const lastMsg = out[out.length - 1];

  const MIN_HISTORY_TURNS = 4;
  if (out.length > 2) {
    const history = out.slice(1, -1);
    while (history.length > MIN_HISTORY_TURNS && totalTokens > maxBudgetTokens) {
      history.shift();
      totalTokens = estimateTokens([systemMsg, ...history, lastMsg]);
    }
    out.length = 0;
    out.push(systemMsg, ...history, lastMsg);
  }

  if (totalTokens > maxBudgetTokens) {
    const last = out[out.length - 1];
    if (last && typeof last.content === 'string') {
      const systemChars = typeof systemMsg.content === 'string' ? systemMsg.content.length : 0;
      const otherChars = out.slice(1, -1).reduce((a, m) => a + (typeof m.content === 'string' ? m.content.length : 0), 0);
      const MARKER = '\n\n[...konteks dipangkas agar muat batas token provider...]';
      const budgetChars = Math.floor(maxBudgetTokens * 3.3) - systemChars - otherChars - MARKER.length;
      if (budgetChars > 200 && last.content.length > budgetChars) {
        const head = last.content.slice(0, budgetChars);
        const cut = Math.max(head.lastIndexOf('\n'), head.lastIndexOf('. '), head.lastIndexOf(' '));
        const kept = cut > budgetChars * 0.6 ? head.slice(0, cut) : head;
        out[out.length - 1] = { ...last, content: kept + MARKER };
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Streaming SSE Engine Dua-Fase
// ---------------------------------------------------------------------------
const ERR_NO_FIRST_TOKEN = 'NO_FIRST_TOKEN';
const ERR_STREAM_IDLE = 'STREAM_IDLE_TIMEOUT';

async function streamSse(url, headers, body, limits, extractDelta, extractUsage, signal) {
  const controller = new AbortController();
  let phaseTimeout = null;
  const abortWith = (code) => {
    if (!phaseTimeout) phaseTimeout = code;
    controller.abort();
  };

  // Dengarkan sinyal pembatalan luar (misal saat balapan model lain menang duluan)
  if (signal) {
    if (signal.aborted) throw new Error('RACE_ABORTED');
    signal.addEventListener('abort', () => abortWith('RACE_ABORTED'), { once: true });
  }

  let firstTimer = setTimeout(() => abortWith(ERR_NO_FIRST_TOKEN), limits.firstTokenMs);
  const totalTimer = setTimeout(() => abortWith('THINKING_TIMEOUT'), limits.totalMs);
  let idleTimer;

  let streaming = false;
  let text = '';
  let usage;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (res.status === 429) {
      let errBody = '';
      try { errBody = await res.text(); } catch {}
      const err = new Error(`RATE_LIMITED:${errBody.slice(0, 150)}`);
      err.status = 429;
      err.fullBody = errBody;
      throw err;
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      const err = new Error(`PROVIDER_${res.status}:${errBody.slice(0, 300)}`);
      err.status = res.status;
      err.fullBody = errBody;
      throw err;
    }

    if (!res.body) throw new Error('NO_STREAM_BODY');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;

        let json;
        try {
          json = JSON.parse(payload);
        } catch {
          continue;
        }

        const u = extractUsage ? extractUsage(json) : undefined;
        if (u) usage = u;

        const delta = extractDelta(json);
        const hasText = typeof delta.text === 'string' && delta.text.length > 0;
        if (!hasText && !delta.active) continue;

        if (!streaming) {
          streaming = true;
          if (firstTimer) {
            clearTimeout(firstTimer);
            firstTimer = null;
          }
        }

        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => abortWith(ERR_STREAM_IDLE), limits.idleMs);

        if (hasText && delta.text) text += delta.text;
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      const lastLine = buffer.trim();
      if (lastLine.startsWith('data:')) {
        const payload = lastLine.slice(5).trim();
        if (payload && payload !== '[DONE]') {
          try {
            const json = JSON.parse(payload);
            const delta = extractDelta(json);
            if (typeof delta.text === 'string' && delta.text.length > 0) text += delta.text;
          } catch {}
        }
      }
    }

    const cleaned = cleanModelOutput(text.trim());
    if (!cleaned) throw new Error('EMPTY_RESPONSE');
    return { text: cleaned, tokens: usage };
  } catch (err) {
    if (phaseTimeout) throw new Error(phaseTimeout);
    throw err;
  } finally {
    if (firstTimer) clearTimeout(firstTimer);
    if (idleTimer) clearTimeout(idleTimer);
    clearTimeout(totalTimer);
  }
}

function openAiDelta(json) {
  const delta = json?.choices?.[0]?.delta;
  if (!delta) return {};
  const out = {};
  if (typeof delta.content === 'string' && delta.content.length > 0) out.text = delta.content;
  const reasoning = delta.reasoning ?? delta.reasoning_content ?? delta.thinking;
  if (typeof reasoning === 'string' && reasoning.length > 0) out.active = true;
  if (delta.role) out.active = true;
  return out;
}

function openAiUsage(json) {
  const u = json?.usage ?? json?.x_groq?.usage;
  if (!u) return undefined;
  const prompt = Number(u.prompt_tokens) || 0;
  const completion = Number(u.completion_tokens) || 0;
  const total = Number(u.total_tokens) || 0;
  if (prompt === 0 && completion === 0 && total === 0) return undefined;
  return { prompt, completion, total };
}

// ---------------------------------------------------------------------------
// Adapters Provider
// ---------------------------------------------------------------------------

// 1. Adapter OpenAI-Compatible (DreamPrompting, OpenRouter, NVIDIA NIM, Groq, Dahl)
async function openAiChat(baseUrl, key, model, messages, maxTokensOverride, extraBody = {}, totalTimeoutMs = AI_CONFIG.timeoutMs, signal) {
  const hasImage = messagesContainImage(messages);
  const connectMs = hasImage ? AI_CONFIG.visionConnectTimeoutMs : AI_CONFIG.connectTimeoutMs;

  // Prompt Caching untuk pesan sistem statis
  let idxSystem = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'system') { idxSystem = i; break; }
  }
  const messagesWithCache = messages.map((m, i) => {
    if (i !== idxSystem || typeof m.content !== 'string') return m;
    return {
      role: m.role,
      content: [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }],
    };
  });

  const body = {
    model,
    messages: messagesWithCache,
    max_tokens: maxTokensOverride ?? AI_CONFIG.maxOutputTokens,
    ...BASE_GEN,
    ...extraBody,
    stream: true,
    stream_options: { include_usage: true },
  };

  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    Accept: 'text/event-stream',
  };

  try {
    const promptChars = messages.reduce((acc, m) => {
      if (typeof m.content === 'string') return acc + m.content.length;
      if (Array.isArray(m.content)) {
        return acc + m.content.reduce((a, p) => a + (p?.type === 'text' && typeof p.text === 'string' ? p.text.length : 0), 0);
      }
      return acc;
    }, 0);
    const promptTokens = Math.ceil(promptChars / 4);
    const adaptiveFirstTokenMs = AI_CONFIG.firstTokenTimeoutMs + (promptTokens > 3000 ? Math.min(6000, Math.floor((promptTokens - 3000) / 4)) : 0);
    const firstTokenMs = hasImage ? AI_CONFIG.visionFirstTokenMs : Math.min(connectMs + 6000, adaptiveFirstTokenMs);

    return await streamSse(`${baseUrl}/chat/completions`, headers, body, {
      firstTokenMs,
      idleMs: AI_CONFIG.streamIdleTimeoutMs,
      totalMs: totalTimeoutMs,
    }, openAiDelta, openAiUsage, signal);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    // Non-streaming fallback jika provider menolak SSE (misal Dahl HTTP 405)
    if (msg.startsWith('PROVIDER_405') || msg.includes('NO_STREAM_BODY')) {
      const ctrl = new AbortController();
      if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
      const timer = setTimeout(() => ctrl.abort(), totalTimeoutMs);
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { ...headers, Accept: 'application/json' },
          body: JSON.stringify({ ...body, stream: false, stream_options: undefined }),
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const t = await res.text().catch(() => '');
          throw new Error(`HTTP_${res.status}: ${t.slice(0, 200)}`);
        }
        const data = await res.json();
        const rawText = data?.choices?.[0]?.message?.content?.trim() ?? '';
        const text = cleanModelOutput(rawText);
        if (!text) throw new Error('EMPTY_RESPONSE');
        const tokens = data?.usage ? {
          prompt: Number(data.usage.prompt_tokens) || 0,
          completion: Number(data.usage.completion_tokens) || 0,
          total: Number(data.usage.total_tokens) || 0,
        } : undefined;
        return { text, tokens };
      } finally {
        clearTimeout(timer);
      }
    }
    throw e;
  }
}

// 2. Adapter Cloudflare Workers AI
const cfKeyAccountCache = new Map();

async function resolveCloudflareKey(rawKey) {
  if (rawKey.includes(':')) {
    const idx = rawKey.indexOf(':');
    return {
      accountId: rawKey.slice(0, idx).trim(),
      token: rawKey.slice(idx + 1).trim(),
    };
  }

  const token = rawKey.trim();
  if (AI_CONFIG.cloudflareAccountId) {
    return { accountId: AI_CONFIG.cloudflareAccountId, token };
  }

  const cachedAcc = cfKeyAccountCache.get(token);
  if (cachedAcc) return { accountId: cachedAcc, token };

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/accounts', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(AI_CONFIG.connectTimeoutMs),
    });
    if (res.ok) {
      const data = await res.json();
      const accId = data.result?.[0]?.id;
      if (accId) {
        cfKeyAccountCache.set(token, accId);
        return { accountId: accId, token };
      }
    }
  } catch {}

  return { accountId: '', token };
}

async function cloudflareChat(rawKey, model, messages, totalTimeoutMs = AI_CONFIG.timeoutMs, signal) {
  const { accountId, token } = await resolveCloudflareKey(rawKey);
  if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID_MISSING');

  // Payload byte array untuk model vision native (Llama 3.2 Vision / LLaVA)
  if (model.includes('vision') || model.includes('llava')) {
    let prompt = '';
    let imageBytes = [];
    for (const m of messages) {
      if (typeof m.content === 'string') {
        prompt += (prompt ? '\n' : '') + m.content;
      } else if (Array.isArray(m.content)) {
        for (const p of m.content) {
          if (p.type === 'text') prompt += (prompt ? '\n' : '') + p.text;
          else if (p.type === 'image_url') {
            const match = p.image_url.url.match(/^data:(.+);base64,(.+)$/);
            if (match && match[2]) imageBytes = Array.from(Buffer.from(match[2], 'base64'));
          }
        }
      }
    }
    if (imageBytes.length === 0) throw new Error('NO_IMAGE_DATA_FOR_VISION');

    const ctrl = new AbortController();
    if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
    const timer = setTimeout(() => ctrl.abort(), totalTimeoutMs);
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || 'Jelaskan gambar ini.', image: imageBytes }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`CF_HTTP_${res.status}`);
      const data = await res.json();
      const rawText = (data.result?.response ?? data.result?.description)?.trim() ?? '';
      const text = cleanModelOutput(rawText);
      if (!text) throw new Error('EMPTY_RESPONSE');
      const tokens = data.result?.usage ? {
        prompt: Number(data.result.usage.prompt_tokens) || 0,
        completion: Number(data.result.usage.completion_tokens) || 0,
        total: Number(data.result.usage.total_tokens) || 0,
      } : undefined;
      return { text, tokens };
    } finally {
      clearTimeout(timer);
    }
  }

  // Model standar via endpoint OpenAI-compatible /ai/v1
  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`;
  return await openAiChat(baseUrl, token, model, messages, undefined, { chat_template_kwargs: { enable_thinking: false } }, totalTimeoutMs, signal);
}

// 3. Adapter OpenCode Free (muse-spark-1.3 & mimo-v2.6)
const OPENCODE_BASE = 'https://opencode.ai/zen/v1';
const OPENCODE_UA = 'opencode/1.18.31';
const OPENCODE_FINGERPRINT_TOOLS = ['bash', 'glob', 'grep', 'read'];

let opencodeSessionCache = null;
let opencodeSessionAt = 0;

function opencodeSession() {
  const now = Date.now();
  if (opencodeSessionCache && now - opencodeSessionAt < 30 * 60000) {
    return opencodeSessionCache;
  }
  const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const bytes = crypto.randomBytes(14);
  let rnd = '';
  for (let i = 0; i < 14; i++) rnd += B62[bytes[i] % 62];
  const t = Array.from({ length: 6 }, (_, i) =>
    Number((BigInt(now) * 0x1000n >> BigInt(40 - 8 * i)) & 0xffn).toString(16).padStart(2, '0')).join('');
  opencodeSessionCache = `ses_${t}${rnd}`;
  opencodeSessionAt = now;
  return opencodeSessionCache;
}

function opencodeRequestId() {
  const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const bytes = crypto.randomBytes(14);
  let rnd = '';
  for (let i = 0; i < 14; i++) rnd += B62[bytes[i] % 62];
  const now = Date.now();
  const t = Array.from({ length: 6 }, (_, i) =>
    Number((BigInt(now) * 0x1000n >> BigInt(40 - 8 * i)) & 0xffn).toString(16).padStart(2, '0')).join('');
  return `msg_${t}${rnd}`;
}

async function opencodeChat(_key, model, msgs, timeoutMs = AI_CONFIG.timeoutMs, signal) {
  const controller = new AbortController();
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const pakaiResponses = /^muse[-_]?spark/i.test(model);
    const url = pakaiResponses ? `${OPENCODE_BASE}/responses` : `${OPENCODE_BASE}/chat/completions`;

    let body;
    if (pakaiResponses) {
      const input = msgs.map((m) => ({
        type: 'message',
        role: m.role,
        content: [{ type: m.role === 'assistant' ? 'output_text' : 'input_text', text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
      }));
      body = {
        model,
        input,
        tools: OPENCODE_FINGERPRINT_TOOLS.map((name) => ({
          type: 'function',
          name,
          description: 'Unavailable fingerprint tool.',
          parameters: { type: 'object', properties: {} },
        })),
        tool_choice: 'auto',
        stream: true,
        store: false,
        reasoning: { effort: 'low' },
      };
    } else {
      body = {
        model,
        messages: msgs,
        tools: OPENCODE_FINGERPRINT_TOOLS.map((name) => ({
          type: 'function',
          function: { name, description: 'Unavailable tool.', parameters: { type: 'object', properties: {} } },
        })),
        tool_choice: 'none',
        stream: true,
        stream_options: { include_usage: true },
        chat_template_kwargs: { enable_thinking: false },
        reasoning_effort: 'none',
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer public',
        'User-Agent': OPENCODE_UA,
        'x-opencode-client': 'desktop',
        'x-opencode-session': opencodeSession(),
        'x-opencode-request': opencodeRequestId(),
        'x-opencode-project': 'global',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const teks = await res.text().catch(() => '');
      throw new Error(`PROVIDER_${res.status}:${teks.slice(0, 300)}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('NO_STREAM_BODY');
    const dec = new TextDecoder();
    let buf = '';
    let out = '';
    let usageAsli;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const baris = buf.split('\n');
      buf = baris.pop() || '';
      for (const l of baris) {
        if (!l.startsWith('data:')) continue;
        const d = l.slice(5).trim();
        if (!d || d === '[DONE]') continue;
        try {
          const j = JSON.parse(d);
          const dariChoices = j.choices?.[0]?.delta?.content || '';
          const dariDelta = typeof j.delta === 'string' ? j.delta : (typeof j.delta === 'object' && j.delta?.content ? j.delta.content : '');
          out += dariChoices || dariDelta;

          if (j.usage && typeof j.usage.total_tokens === 'number') {
            usageAsli = {
              prompt: Number(j.usage.prompt_tokens) || 0,
              completion: Number(j.usage.completion_tokens) || 0,
              total: Number(j.usage.total_tokens) || 0,
            };
          }
          const ru = j.response?.usage;
          if (ru && typeof ru.total_tokens === 'number') {
            usageAsli = {
              prompt: Number(ru.input_tokens) || 0,
              completion: Number(ru.output_tokens) || 0,
              total: Number(ru.total_tokens) || 0,
            };
          }
        } catch {}
      }
    }

    reader.cancel().catch(() => {});
    const text = cleanModelOutput(out.trim());
    if (!text) throw new Error('EMPTY_REPLY');
    return { text, tokens: usageAsli ?? { prompt: 0, completion: 0, total: 0 } };
  } finally {
    clearTimeout(timer);
  }
}

// 4. Adapter Google Gemini
export function geminiThinkingConfig(model) {
  if (model.includes('flash-lite')) return { thinkingConfig: { thinkingLevel: 'low' } };
  return { thinkingConfig: { thinkingBudget: 0 } };
}

function geminiDelta(json) {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!parts) return {};
  const out = {};
  for (const p of parts) {
    if (typeof p.text === 'string' && p.text.length > 0) {
      if (p.thought) out.active = true;
      else out.text = (out.text ?? '') + p.text;
    }
  }
  return out;
}

function geminiUsage(json) {
  const u = json?.usageMetadata;
  if (!u) return undefined;
  return {
    prompt: Number(u.promptTokenCount) || 0,
    completion: Number(u.candidatesTokenCount) || 0,
    total: Number(u.totalTokenCount) || 0,
  };
}

async function geminiChat(key, model, messages, totalTimeoutMs = AI_CONFIG.timeoutMs, signal) {
  const hasImage = messagesContainImage(messages);
  const connectMs = hasImage ? AI_CONFIG.visionConnectTimeoutMs : AI_CONFIG.connectTimeoutMs;

  const contents = [];
  for (const m of messages) {
    if (m.role === 'system') continue;
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts = (typeof m.content === 'string' ? [{ type: 'text', text: m.content }] : m.content).map((p) => {
      if (p.type === 'image_url') {
        const match = p.image_url.url.match(/^data:(.+);base64,(.+)$/);
        if (!match) throw new Error('BAD_IMAGE');
        return { inlineData: { mimeType: match[1], data: match[2] } };
      }
      return { text: p.text || '' };
    });

    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts.push(...parts);
    } else {
      contents.push({ role, parts });
    }
  }

  while (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Halo' }] });
  }

  const system = messages.find((m) => m.role === 'system');
  const body = {
    contents,
    generationConfig: {
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      temperature: BASE_GEN.temperature,
      ...geminiThinkingConfig(model),
    },
  };

  if (system) {
    const sysText = typeof system.content === 'string'
      ? system.content
      : Array.isArray(system.content)
        ? system.content.map((p) => (typeof p === 'string' ? p : p?.text || '')).join('\n')
        : String(system.content || '');
    body.systemInstruction = { parts: [{ text: sysText }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
  return await streamSse(
    url,
    { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body,
    {
      firstTokenMs: hasImage ? AI_CONFIG.visionFirstTokenMs : Math.min(connectMs, AI_CONFIG.firstTokenTimeoutMs),
      idleMs: AI_CONFIG.streamIdleTimeoutMs,
      totalMs: totalTimeoutMs,
    },
    geminiDelta,
    geminiUsage,
    signal
  );
}

// ---------------------------------------------------------------------------
// Rantai Tier SOTA (Chatbot Port)
// ---------------------------------------------------------------------------
export function buildChain() {
  return [
    // --- TIER 1: DreamPrompting (100 RPM, rolling free tier) ---
    {
      kind: 'dreamprompting',
      keys: AI_CONFIG.pools.dreamprompting,
      models: [AI_MODELS.dpPrimary, ...AI_MODELS.dpBackup],
      maxPromptTokens: 0,
      run: (k, m, msgs, t, signal) => {
        const dpMsgs = trimMessagesToTokenBudget(msgs, 12000);
        return openAiChat('https://dreamprompting.com/api/v1', k, m, dpMsgs, BASE_GEN_TIGHT.maxTokens, {
          reasoning_effort: 'none',
          reasoning: { effort: 'none' },
          ...BASE_GEN,
        }, t, signal);
      },
    },
    // --- TIER 2: Cloudflare Workers AI ---
    {
      kind: 'cloudflare',
      keys: AI_CONFIG.pools.cloudflare,
      models: [AI_MODELS.cfPrimary, ...AI_MODELS.cfBackup],
      maxPromptTokens: 0,
      run: (k, m, msgs, t, signal) => cloudflareChat(k, m, msgs, t, signal),
    },
    // --- TIER 3: OpenCode Free (muse-spark-1.3 & mimo-v2.6) ---
    {
      kind: 'opencode',
      keys: AI_CONFIG.pools.opencode,
      models: [AI_MODELS.opencodePrimary, ...AI_MODELS.opencodeBackup],
      maxPromptTokens: 0,
      run: (k, m, msgs, t, signal) => opencodeChat(k, m, msgs, t, signal),
    },
    // --- TIER 4: OpenRouter (free models) ---
    {
      kind: 'openrouter',
      keys: AI_CONFIG.pools.openrouter,
      models: [AI_MODELS.orPrimary, ...AI_MODELS.orBackup],
      maxPromptTokens: 0,
      run: (k, m, msgs, t, signal) =>
        openAiChat('https://openrouter.ai/api/v1', k, m, msgs, undefined, {
          reasoning: { effort: 'none' },
          reasoning_effort: 'none',
          ...BASE_GEN,
        }, t, signal),
    },
    // --- TIER 5: NVIDIA NIM (1.000 free credits / key) ---
    {
      kind: 'nvidia',
      keys: AI_CONFIG.pools.nvidia,
      models: [AI_MODELS.nvidiaPrimary, ...AI_MODELS.nvidiaBackup],
      maxPromptTokens: 0,
      run: (k, m, msgs, t, signal) => {
        const extraReasoning = m.includes('diffusiongemma')
          ? { reasoning_effort: 'none', chat_template_kwargs: { enable_thinking: false } }
          : { chat_template_kwargs: { enable_thinking: false } };
        return openAiChat('https://integrate.api.nvidia.com/v1', k, m, msgs, undefined, {
          ...extraReasoning,
          ...BASE_GEN,
        }, t, signal);
      },
    },
    // --- TIER 6: Groq Cloud API (LPU Ultra-Fast Inference) ---
    {
      kind: 'groq',
      keys: AI_CONFIG.pools.groq,
      models: [AI_MODELS.groqPrimary, ...AI_MODELS.groqBackup],
      maxPromptTokens: 7000,
      run: (k, m, msgs, t, signal) => {
        const groqMsgs = trimMessagesToTokenBudget(msgs, 7000);
        const extraReasoning = m.includes('gpt-oss') ? { reasoning_effort: 'low' } : { reasoning_effort: 'none' };
        return openAiChat('https://api.groq.com/openai/v1', k, m, groqMsgs, BASE_GEN_TIGHT.maxTokens, {
          ...extraReasoning,
          ...BASE_GEN,
          frequency_penalty: 0.3,
        }, t, signal);
      },
    },
    // --- TIER 7: Google Gemini API (1M Konteks) ---
    {
      kind: 'gemini',
      keys: AI_CONFIG.pools.gemini,
      models: [AI_MODELS.geminiPrimary, ...AI_MODELS.geminiBackup],
      maxPromptTokens: 0,
      run: (k, m, msgs, t, signal) => geminiChat(k, m, msgs, t, signal),
    },
    // --- TIER 8: Dahl Global (Saldo 1 Miliar Token) ---
    {
      kind: 'dahl',
      keys: AI_CONFIG.pools.dahl,
      models: [AI_MODELS.dahlPrimary, ...AI_MODELS.dahlBackup],
      maxPromptTokens: 0,
      run: (k, m, msgs, t, signal) =>
        openAiChat(AI_CONFIG.dahlUrl, k, m, msgs, BASE_GEN_TIGHT.maxTokens, {
          reasoning_effort: 'none',
          chat_template_kwargs: { enable_thinking: false },
          ...BASE_GEN,
        }, t, signal),
    },
  ];
}

// ---------------------------------------------------------------------------
// Balapan Model dalam Satu Tier (Staggered Model Racing)
// ---------------------------------------------------------------------------
async function balapanModelDalamTier(step, models, messages, deadline, allowCoolingPass) {
  const controller = new AbortController();
  const percobaan = [];

  const jalankanSatu = async (model, delayMs) => {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    if (controller.signal.aborted) throw new Error('RACE_ABORTED');
    if (!allowCoolingPass && isModelCoolingDown(step.kind, model)) {
      throw new Error('MODEL_COOLING');
    }

    const candidateKeys = getOrderedKeys(step.kind, step.keys);
    let lastErr = new Error('NO_KEY');

    for (const key of candidateKeys) {
      if (controller.signal.aborted) throw new Error('RACE_ABORTED');
      const remainingMs = deadline - Date.now();
      if (remainingMs < 1500) throw new Error('CHAIN_DEADLINE');

      const attemptStart = Date.now();
      try {
        const result = await step.run(key, model, messages, Math.min(remainingMs, AI_CONFIG.timeoutMs), controller.signal);
        if (controller.signal.aborted) throw new Error('RACE_ABORTED');

        recordKeySuccess(step.kind, key, model);
        recordModelLatency(step.kind, model, Date.now() - attemptStart);

        return { text: result.text, tokens: result.tokens, model, provider: step.kind };
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
        if (lastErr.message === 'RACE_ABORTED') throw lastErr;
        recordKeyFailure(step.kind, key, e);

        const m = lastErr.message;
        if (m.includes('404') || m.includes('ModelError') || m.includes('400') || m.includes('401') || m.includes('403')) {
          recordModelFailure(step.kind, model, 15 * 60000);
          throw lastErr;
        }
      }
    }
    throw lastErr;
  };

  for (let i = 0; i < models.length; i++) {
    percobaan.push(jalankanSatu(models[i], i === 0 ? 0 : AI_CONFIG.raceStaggerMs * i));
  }

  try {
    const pemenang = await Promise.any(percobaan);
    // Batalkan model lain yang masih berjalan agar tidak membakar token/kuota!
    controller.abort();
    return pemenang;
  } catch (err) {
    controller.abort();
    throw new Error('ALL_MODELS_IN_TIER_FAILED');
  }
}

// ---------------------------------------------------------------------------
// Eksekusi Rantai AI dengan Failover & Model Racing
// ---------------------------------------------------------------------------
export async function aiChat(messages, opts = {}) {
  const { vision = false, totalTimeoutMs = 50000, model: requestedModel } = opts;
  const deadline = Date.now() + totalTimeoutMs;
  const errors = [];
  const chain = buildChain();

  // 1. Rantai Vision Khusus vs Teks
  let stepsToRun = [];
  if (vision) {
    const byKind = new Map(chain.map((s) => [s.kind, s]));
    for (const v of AI_MODELS.visionChain) {
      const base = byKind.get(v.kind);
      if (!base || base.keys.length === 0) continue;
      stepsToRun.push({ ...base, models: [v.model] });
    }
  } else {
    // Mode Spesifik / Prioritas Model Pengguna
    if (requestedModel && requestedModel !== 'auto') {
      const q = requestedModel.toLowerCase().trim();
      let matched = chain.find((s) => s.kind.toLowerCase() === q);
      if (!matched) {
        matched = chain.find((s) => s.models.some((m) => m.toLowerCase().includes(q)));
      }
      if (matched && matched.keys.length > 0) {
        // Taruh tier yang cocok di paling depan, sisanya mengikuti sebagai fallback
        stepsToRun = [matched, ...chain.filter((s) => s !== matched && s.keys.length > 0)];
      } else {
        stepsToRun = chain.filter((s) => s.keys.length > 0);
      }
    } else {
      stepsToRun = chain.filter((s) => s.keys.length > 0);
    }
  }

  // 2. Loop Failover dengan Dua Pass (Pass 1: patuhi cooldown; Pass 2: best-effort)
  for (const allowCoolingPass of [false, true]) {
    for (const step of stepsToRun) {
      if (Date.now() >= deadline - 1500) break;

      const models = vision ? step.models : orderModelsByLatency(step.kind, step.models);

      // --- BALAPAN MODEL DALAM TIER (Bila raceModels aktif, teks, & model > 1) ---
      if (AI_CONFIG.raceModels > 0 && !vision && models.length > 1) {
        const eligible = models.filter((m) => allowCoolingPass || !isModelCoolingDown(step.kind, m));
        if (eligible.length > 0) {
          try {
            const menang = await balapanModelDalamTier(step, eligible, messages, deadline, allowCoolingPass);
            return {
              text: menang.text,
              via: `${step.kind}:${menang.model}`,
              tokens: menang.tokens,
              provider: step.kind,
              model: menang.model,
            };
          } catch (raceErr) {
            errors.push(`${step.kind}:race ${raceErr.message}`);
            // Gagal balapan -> lanjut ke tier berikutnya
            continue;
          }
        }
      }

      // --- JALUR SEKUENSIAL / TUNGGAL ---
      for (const model of models) {
        if (!allowCoolingPass && isModelCoolingDown(step.kind, model)) continue;

        const candidateKeys = getOrderedKeys(step.kind, step.keys);
        for (let ki = 0; ki < candidateKeys.length; ki++) {
          if (Date.now() >= deadline - 1500) break;
          const key = candidateKeys[ki];
          const attemptStart = Date.now();
          const remainingMs = deadline - Date.now();

          try {
            const res = await step.run(key, model, messages, Math.min(remainingMs, AI_CONFIG.timeoutMs));
            recordKeySuccess(step.kind, key, model);
            recordModelLatency(step.kind, model, Date.now() - attemptStart);

            return {
              text: res.text,
              via: `${step.kind}:${model}`,
              tokens: res.tokens,
              provider: step.kind,
              model,
            };
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${step.kind}:${model}#${ki + 1} ${msg.slice(0, 80)}`);
            recordKeyFailure(step.kind, key, e);

            // Jika error adalah model tidak ditemukan / format buruk, pindah model
            if (msg.includes('404') || msg.includes('ModelError') || msg.includes('EMPTY_RESPONSE')) {
              recordModelFailure(step.kind, model, 60000);
              break;
            }
          }
        }
      }
    }
  }

  const finalError = new Error('ALL_PROVIDERS_FAILED');
  finalError.details = errors.slice(-15);
  throw finalError;
}

// ---------------------------------------------------------------------------
// Status Provider & Telemetri
// ---------------------------------------------------------------------------
export function providerStatus() {
  const p = AI_CONFIG.pools;
  return {
    dreamprompting: p.dreamprompting.length,
    cloudflare: p.cloudflare.length,
    opencode: p.opencode.length,
    openrouter: p.openrouter.length,
    nvidia: p.nvidia.length,
    groq: p.groq.length,
    gemini: p.gemini.length,
    dahl: p.dahl.length,
    total:
      p.dreamprompting.length +
      p.cloudflare.length +
      p.opencode.length +
      p.openrouter.length +
      p.nvidia.length +
      p.groq.length +
      p.gemini.length +
      p.dahl.length,
  };
}
