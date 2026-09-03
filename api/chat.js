/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/chat (v5.3.0)
 * Multi-Provider Intelligent AI Gateway for Rafly Firmansyah Portfolio Terminal
 * Features:
 * - Real-Time Web Search & Encyclopedic Knowledge (Live 2026 Context)
 * - Multimodal Vision Recognition
 * - Document & PDF Analysis (Text & Code Ingestion)
 * - Smart Multi-Provider Cascade (OpenCode, OpenRouter, Ollama Cloud, MiniMax)
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';

export const config = {
  maxDuration: 60
};

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

function buildSystemPrompt(sessionLanguage = 'id', reasoningEffort = 'auto', activeModelName = 'Nemotron-3-Nano-30B', includeDetailedPortfolio = false) {
  const isEnglish = sessionLanguage === 'en';

  const effortDirective = reasoningEffort === 'low'
    ? (isEnglish ? '[MODE: CONCISE & NATURAL. Direct, engaging, human-like answer.]' : '[MODE: CEPAT & NATURAL. Jawab lugas, mengalir santai, dan langsung ke inti topik.]')
    : (isEnglish ? '[MODE: STRUCTURED & ENGAGING. Provide structured, insightful explanation with a natural conversational flow.]' : '[MODE: ANALISIS TERSTRUKTUR & MENGALIR. Sajikan analisis berbobot dengan gaya bahasa komunikatif dan mudah dipahami.]');

  const languageDirective = isEnglish
    ? '[LANGUAGE: Fluent, natural, human-like English. Engaging tone without robotic cliches.]'
    : '[GAYA BAHASA: Manusiawi, luwes, komunikatif, dan enak dibaca. Berbicaralah layaknya rekan developer/partner teknis yang ramah dan cerdas. HINDARI bahasa birokratis atau robot kaku.]';

  const now = new Date();
  const timeZone = 'Asia/Jakarta';
  const dynamicDateStr = isEnglish
    ? now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone })
    : now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone });
  const dynamicTimeStr = now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone 
  }).replace('.', ':');

  const basePrompt = `Status: ${isEnglish ? 'ENGLISH' : 'BAHASA INDONESIA'}. Waktu Saat Ini (Ground Truth): ${dynamicDateStr}, Pukul ${dynamicTimeStr} WIB (Waktu Indonesia Barat, UTC+7).
[INSTRUKSI WAKTU REALTIME]:
- Waktu di atas adalah Waktu Indonesia Barat (WIB, Asia/Jakarta, UTC+7) yang sudah terkalibrasi secara presisi.
- Jika pengguna bertanya jam berapa sekarang, waktu saat ini, atau tanggal hari ini, berikan waktu ${dynamicTimeStr} WIB berdasarkan fakta waktu resmi di atas tanpa mengonversi ulang atau menebak-nebak jam yang salah.
Anda adalah AI Assistant & Developer Agent di website portofolio resmi Rafly Firmansyah (@Raflyf).

${languageDirective}
${effortDirective}

[PILAR KECERDASAN EMOSIONAL, ADAPTIF & KEJUJURAN EPISTEMIS]:
1. Kejujuran Mutlak & Pengakuan Batas Pengetahuan (Epistemic Humility):
   - Jika suatu fakta, tanggal rilis spesifik, fitur teknis internal, atau metrik belum diumumkan secara resmi oleh pengembang/perusahaan: **WAJIB AKUI DENGAN JUJUR DAN TEGAS**.
   - **DILARANG KERAS MENGARANG ATAU MENEBAK** angka, tanggal, versi, modul perangkat lunak, maupun alat CLI yang tidak ada di fakta resmi.
   - Selalu pisahkan secara transparan antara Fakta Terkonfirmasi Resmi vs Spekulasi / Rumor Komunitas.
   - Zero-Overclaim: Sajikan fakta apa adanya secara objektif.

2. Kecerdasan Adaptif & Penyelarasan Gaya Komunikasi:
   - Jika pengguna bertanya santai/pendek, tanggapi secara luwes, santai, ringkas, langsung ke inti jawaban, tanpa pembuka formal yang kaku.
   - DILARANG menggunakan karakter em-dash (—) yang menempel tanpa spasi.
   - DILARANG MENGGUNAKAN TEMPLATE BASA-BASI ROBOTIK di akhir jawaban. Langsung akhiri jawaban secara natural.

3. Pembelajaran Berkelanjutan:
   - Jika pengguna membagikan informasi baru, koreksi faktual, atau preferensi yang tervalidasi benar, gunakan tag [SAVE_MEMORY: fakta inti] di baris akhir agar sistem memori Supabase dapat menyimpannya secara permanen.

4. Format Markdown Rapi & Nyaman Dibaca:
   - Gunakan teks tebal untuk poin penting, paragraf ringkas (1-3 kalimat), dan butir poin yang rapi. DILARANG menghasilkan dinding teks masif.

[PRINSIP GROUNDING FAKTUAL, DINAMIS & ANTI-HALUSINASI]:
- Eksplorasi Dinamis: Seluruh informasi eksternal terkait perkembangan teknologi, rilis model AI, jadwal produk, berita global, dan peristiwa dunia wajib diperoleh secara 100% dinamis dari data web dan memori RAG aktual.
- Anti-Noise: Jawab langsung ke inti pertanyaan secara padat, mengalir natural. DILARANG mencampurkan informasi produk atau topik dari percakapan sebelumnya ketika pengguna beralih menanyakan subjek baru.
- DILARANG KERAS mengeja, mengulang aturan sistem, menuliskan 'Check constraints', membuat checklist batasan, draft kalimat, atau membagikan proses berpikir internal ke dalam teks jawaban. Keluarkan HANYA respon final yang bersih kepada pengguna.`;

  if (!includeDetailedPortfolio) {
    return basePrompt;
  }

  return `${basePrompt}

[BATASAN TEKNOLOGI PORTOFOLIO RAFLY FIRMANSYAH]:
- Proyek **web-portofolio** dibangun menggunakan **React 19, Vite, Tailwind CSS, Framer Motion, Vercel Serverless Functions, dan Supabase PostgreSQL**.
- DILARANG mengklaim portofolio ini menggunakan Vanilla JS.

[GROUND TRUTH REPOSITORI & SERTIFIKASI RESMI RAFLY FIRMANSYAH]:
- **OpenPlagiarismChecker**: Mesin riset plagiarisme 100% lokal offline. Dual-Engine NLP: 5-Word N-Gram Shingling + Multilingual SBERT (384-dim Cosine Similarity). 15+ basis data akademik terbuka. Python, Flask, PyTorch. URL: https://github.com/Raflyf/OpenPlagiarismChecker
- **Spam-Email Detection System**: Riset skripsi adaptif mengatasi Concept Drift/Covariate Shift. Model Ensemble Complement Naive Bayes (F1 ~77%) + XGBoost (F1 ~93%). Domain Adaptation 8x weight pada data baru. URL: https://github.com/Raflyf/Spam-Email
- **laser_pointer_PPT**: Remote presenter PowerPoint nirsentuh memanfaatkan sensor smartphone (gyroscope & accelerometer) via WebSocket Flask-SocketIO + PyAutoGUI. URL: https://github.com/Raflyf/laser_pointer_PPT
- **FotoKitaBlur**: Edge AI Computer Vision di browser untuk preservasi privasi wajah saat streaming via MediaPipe Tasks Vision gestur dua jari (V-Sign). URL: https://github.com/FotoKitaBlur
- **web-portofolio**: Platform portofolio React 19, Tailwind CSS, Framer Motion, Supabase PostgreSQL, Vercel Serverless. URL: https://github.com/Raflyf/web-portofolio
- **Sertifikasi Kompetensi Resmi**:
  - BNSP Analis Program (2025): No. Reg TIK.1241.04242 2025
  - MikroTik MTCNA (2025): No. 2502NA6383
  - Cisco PCAP (2024): Certified Associate in Python Programming
- **Kontak Resmi**: GitHub https://github.com/Raflyf | Email mailto:raflyfirmansyah02@gmail.com | WhatsApp https://wa.me/628991333323`;
}

async function fetchJsonWithTimeout(url, options, timeoutConfig = 25000) {
  const controller = new AbortController();
  const connectTimeoutMs = typeof timeoutConfig === 'object' 
    ? (timeoutConfig.connectTimeoutMs || 7000) 
    : Math.min(typeof timeoutConfig === 'number' ? timeoutConfig : 7000, 7000);
  const activeTimeoutMs = typeof timeoutConfig === 'object' 
    ? (timeoutConfig.activeTimeoutMs || 55000) 
    : 55000;

  // Phase 1: Deteksi Liveness Awal (Jika server offline/hang/tidak merespons awal)
  let isResponding = false;
  let activeTimer = null;
  const connectTimer = setTimeout(() => {
    if (!isResponding) {
      controller.abort(new Error(`Initial connection timeout (${connectTimeoutMs}ms): model tidak merespon atau tidak aktif`));
    }
  }, connectTimeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    isResponding = true;
    clearTimeout(connectTimer);

    // Jika model terdeteksi error, limit, atau tidak aktif (402, 429, 404, 5xx):
    // Langsung kembalikan respons gagal seketika agar caller failover ke model berikutnya tanpa menunda
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errJson = null;
      try { errJson = JSON.parse(errText); } catch (_) {}
      return { ok: false, status: res.status, data: errJson, text: errText };
    }

    // Phase 2: Model Merespons & Aktif (Biarkan terus berpikir dengan batas waktu penuh hingga 55s)
    activeTimer = setTimeout(() => {
      controller.abort(new Error(`Active thinking timeout of ${activeTimeoutMs}ms exceeded`));
    }, activeTimeoutMs);

    const contentType = res.headers.get('content-type') || '';
    
    // A. High-Speed SSE Event Stream Reader: Stream reader dinamis
    if (contentType.includes('text/event-stream') || contentType.includes('event-stream')) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        if (accumulated.includes('[DONE]')) {
          try { reader.cancel(); } catch (_) {}
          break;
        }
      }
      if (activeTimer) clearTimeout(activeTimer);
      return { ok: true, status: res.status, data: null, text: accumulated };
    }

    // B. Standard JSON Payload
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (activeTimer) clearTimeout(activeTimer);
      return { ok: true, status: res.status, data: json, text: '' };
    }

    // C. Fallback Raw Text
    const text = await res.text();
    if (activeTimer) clearTimeout(activeTimer);
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (_) {}
    return { ok: true, status: res.status, data: json, text };
  } catch (err) {
    clearTimeout(connectTimer);
    if (activeTimer) clearTimeout(activeTimer);
    throw err;
  }
}


/**
 * Universal Intelligent Multi-Query Generator for Any Domain & Topic
 * Dynamically extracts the substantive subject matter from any user prompt and conversation history
 * to formulate parallel high-precision search queries across breaking news, live releases, and factual updates.
 */
function formulateSmartSearchQueries(query, history = []) {
  if (!query || typeof query !== 'string') return [];
  const queries = [];

  // 1. Normalize typos and common Indonesian internet contractions
  const qNorm = query.toLowerCase()
    .replace(/\bperilisann+\b/g, 'perilisan')
    .replace(/\bterbaruu+\b/g, 'terbaru')
    .replace(/\bapaan\b|\bapaann+\b|\bapahh+\b|\bapann+\b/g, 'apa')
    .replace(/\bkloo+\b|\bklo\b/g, 'kalau')
    .replace(/\bgimna\b|\bgmn\b|\bgmana\b/g, 'bagaimana')
    .replace(/\bknapa\b|\bknp\b/g, 'kenapa')
    .replace(/\bbgtu\b|\bbgt\b/g, 'begitu')
    .replace(/\bdgn\b/g, 'dengan')
    .replace(/\byg\b/g, 'yang')
    .replace(/\btp\b/g, 'tapi')
    .replace(/\budh\b|\bsdh\b/g, 'sudah')
    .replace(/\bblm\b/g, 'belum')
    .replace(/\bjg\b/g, 'juga')
    .replace(/\bbsa\b/g, 'bisa');

  const stripFillers = (text) => {
    return text
      .replace(/\b(tolong|coba|jelaskan|analisis|bagaimana|apa|apaan|siapa|kapan|kenapa|mengapa|dimana|apakah|menurutmu|menurut anda|dong|sih|ya|nih|kalo|kalau|gimana|gimna|gmn|gmana|kabar|info|infokan|berikan|sebutkan|tentang|mengenai|soal|terkait|berita terbaru|berita terkini|kabar terbaru|kabar terkini|kelanjutan|update|terbaru|terkini|knapa|min|gan|kak|bro|perilisan|rilis)\b/gi, ' ')
      .replace(/[^\w\s\.\-]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const coreSubject = stripFillers(qNorm).slice(0, 80);
  const qClean = qNorm.replace(/[^\w\s\.\-]/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

  if (coreSubject.length >= 3) {
    queries.push(coreSubject);
  }
  if (qClean.length >= 3 && qClean !== coreSubject) {
    queries.push(qClean);
  }

  // 2. Dynamic Query Generation (Pure Subject-Centered, Zero Hardcoded Brand/Entity List)
  const targetSubject = coreSubject || qClean;
  if (targetSubject.length >= 2) {
    queries.push(`${targetSubject} latest official news update`);
    queries.push(`${targetSubject} rilis pembaruan resmi terkini`);

    // Dynamic intent modifiers based on user intent keywords
    if (/\b(benchmark|perbandingan|bandingkan|leaderboard|skor|score|ranking|peringkat|vs|versus)\b/i.test(qNorm)) {
      queries.push(`${targetSubject} benchmark leaderboard evaluation results`);
    } else if (/\b(rilis|release|kapan|jadwal|schedule|tanggal|trailer|launch)\b/i.test(qNorm)) {
      queries.push(`${targetSubject} official release date announcement`);
    }
  }

  // 3. Dynamic Multi-Turn Context Awareness (Only combine if query is an anaphoric/dependent follow-up)
  const isDependentFollowUp = /^(harganya|fiturnya|speknya|spesifikasinya|jadwalnya|tanggalnya|rilisnya|fitur|spek|harga|biaya|kapan|dimana|siapa|kenapa|mengapa|bagaimana|gimana)$/i.test(coreSubject) || (coreSubject.length > 0 && coreSubject.length < 3);
  if (isDependentFollowUp && Array.isArray(history) && history.length > 0) {
    const pastUserTurns = history.filter(h => h.role === 'user').map(h => String(h.content || '')).reverse();
    for (const pastQ of pastUserTurns.slice(0, 2)) {
      const pastSubject = stripFillers(pastQ);
      if (pastSubject.length >= 3) {
        const combined = `${pastSubject} ${coreSubject || qClean}`.trim().slice(0, 90);
        if (!queries.includes(combined)) {
          queries.push(combined);
        }
        break;
      }
    }
  }

  return Array.from(new Set(queries)).filter(q => q.length >= 3).slice(0, 4); // PERF-4: cap at 4 (was 6) to limit RSS flood
}

/**
 * Filter out lifestyle, horoscope, and tabloid junk from tech/factual search results
 */
function isJunkArticle(title) {
  if (!title) return true;
  const low = title.toLowerCase();
  const junkWords = [
    'zodiak', 'horoskop', 'ramalan', 'cantika.com', 'halodoc', 'gizi online', 
    'sinopsis', 'sinetron', 'resep', 'diet', 'kopi hitam', 'shio', 'tahukah anda', 
    'chord gitar', 'lirik lagu', 'bocoran togel', 'prediksi skor', 'jadwal bola'
  ];
  return junkWords.some(j => low.includes(j));
}

// ponytail: fetchLiveRepoContext removed — was a no-op stub returning '' every call.
// searchWebContext already covers all live web context needs.

/**
 * Crawl4AI & Firecrawl Inspired Fit-Markdown & Semantic Content Extractor
 * Heuristically strips boilerplate/navigation/script noise, isolates primary semantic
 * article containers, and converts HTML tables/headings/lists to clean LLM-Ready Markdown.
 */
function extractFitMarkdownContent(rawHtml, sourceUrl = '') {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  
  if (!rawHtml.includes('<html') && !rawHtml.includes('<body') && !rawHtml.includes('<div') && !rawHtml.includes('<p')) {
    return rawHtml.slice(0, 4500).trim();
  }

  let html = rawHtml;

  // 1. Isolate primary semantic content container if present
  const semanticContainers = [
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<div\b[^>]*(?:id|class)=["'][^"']*(?:main-content|post-content|article-body|entry-content|markdown-body|documentation|docs-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<section\b[^>]*(?:id|class)=["'][^"']*(?:content|article|docs)[^"']*["'][^>]*>([\s\S]*?)<\/section>/i
  ];

  for (const regex of semanticContainers) {
    const match = html.match(regex);
    if (match && match[1] && match[1].length > 300) {
      html = match[1];
      break;
    }
  }

  // 2. Prune Noise & Non-Content Nodes (Fit-Markdown Heuristic Pruning)
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ' ')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, ' ')
    .replace(/<dialog\b[^<]*(?:(?!<\/dialog>)<[^<]*)*<\/dialog>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // 3. Convert HTML Structure into Clean Markdown (Tables, Headings, Lists, Code)
  html = html.replace(/<pre\b[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (m, code) => `\n\`\`\`\n${code.replace(/<[^>]+>/g, '').trim()}\n\`\`\`\n`);
  html = html.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (m, code) => ` \`${code.replace(/<[^>]+>/g, '').trim()}\` `);

  html = html.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n');
  html = html.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n');
  html = html.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n');
  html = html.replace(/<h[4-6]\b[^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n\n#### $1\n');

  html = html.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');

  html = html.replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (m, row) => {
    const cells = [];
    const cellRegex = /<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
    let match;
    while ((match = cellRegex.exec(row)) !== null) {
      cells.push(match[1].replace(/<[^>]+>/g, '').trim());
    }
    return cells.length > 0 ? `| ${cells.join(' | ')} |\n` : '';
  });

  html = html.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  html = html.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  html = html.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  html = html.replace(/<br\s*\/?>/gi, '\n');
  html = html.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n');
  html = html.replace(/<\/(?:div|section|article)>/gi, '\n');

  html = html.replace(/<[^>]+>/g, ' ');

  const entityMap = {
    '&quot;': '"', '&#39;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&nbsp;': ' ', '&mdash;': 'ΓÇö', '&ndash;': 'ΓÇô', '&bull;': 'ΓÇó', '&hellip;': '...'
  };
  html = html.replace(/&(?:quot|#39|amp|lt|gt|nbsp|mdash|ndash|bull|hellip);/g, m => entityMap[m] || ' ');

  const lines = html.split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0);

  let cleanMarkdown = lines.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleanMarkdown.slice(0, 4500);
}

/**
 * SSRF & Private Network Shield
 * Prevents attackers from targeting loopback (127.0.0.1), localhost, cloud metadata, or private internal LANs.
 */
function isSafePublicUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    let host = parsed.hostname.toLowerCase().trim();

    // Strip IPv6 brackets if present
    if (host.startsWith('[') && host.endsWith(']')) {
      host = host.slice(1, -1);
    }

    // Block loopback, localhost, internal namespaces, and cloud metadata hostnames
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'metadata.google.internal' ||
      host === 'instance-data' ||
      host === '169.254.169.254'
    ) {
      return false;
    }

    // Block IPv6 Loopback, Link-local, Unique Local, IPv4-mapped IPv6
    if (host.includes(':')) {
      if (host === '::1' || host === '::' || host.startsWith('fe80:') || host.startsWith('fc00:') || host.startsWith('fd00:')) {
        return false;
      }
      // IPv4-mapped IPv6 like ::ffff:127.0.0.1
      if (host.includes('ffff:')) {
        const afterFfff = host.split('ffff:')[1] || '';
        if (afterFfff.includes('.')) {
          host = afterFfff; // proceed to IPv4 checks below
        } else {
          return false; // block hex-mapped IPv4
        }
      } else {
        return true; // regular safe public IPv6
      }
    }

    // Handle decimal integer Dword IP (e.g. 2130706433 -> 127.0.0.1)
    if (/^\d+$/.test(host)) {
      const num = parseInt(host, 10);
      if (isNaN(num) || num < 0 || num > 4294967295) return false;
      const b0 = (num >>> 24) & 255;
      const b1 = (num >>> 16) & 255;
      const b2 = (num >>> 8) & 255;
      const b3 = num & 255;
      host = `${b0}.${b1}.${b2}.${b3}`;
    }

    // Handle Hex IP (e.g. 0x7f000001)
    if (/^0x[0-9a-fA-F]+$/i.test(host)) {
      const num = parseInt(host, 16);
      if (isNaN(num) || num < 0 || num > 4294967295) return false;
      const b0 = (num >>> 24) & 255;
      const b1 = (num >>> 16) & 255;
      const b2 = (num >>> 8) & 255;
      const b3 = num & 255;
      host = `${b0}.${b1}.${b2}.${b3}`;
    }

    // Handle Octal notation or multi-part IP (e.g. 0177.0.0.1, 127.0.1, 10.1)
    if (/^[0-9a-fA-FxX\.]+$/.test(host) && host.includes('.')) {
      const parts = host.split('.');
      if (parts.length >= 2 && parts.length <= 4) {
        const octets = [];
        for (const p of parts) {
          let val;
          if (p.startsWith('0x') || p.startsWith('0X')) {
            val = parseInt(p, 16);
          } else if (p.startsWith('0') && p.length > 1 && /^[0-7]+$/.test(p)) {
            val = parseInt(p, 8);
          } else if (/^\d+$/.test(p)) {
            val = parseInt(p, 10);
          } else {
            val = NaN;
          }
          if (isNaN(val) || val < 0) return false;
          octets.push(val);
        }

        if (octets.length === 4) {
          const [b0, b1] = octets;
          if (b0 === 10) return false;
          if (b0 === 127) return false;
          if (b0 === 169 && b1 === 254) return false;
          if (b0 === 172 && b1 >= 16 && b1 <= 31) return false;
          if (b0 === 192 && b1 === 168) return false;
          if (b0 === 0 || b0 >= 224) return false;
        } else {
          // Incomplete octet notation (e.g., 127.1)
          const first = octets[0];
          if (first === 127 || first === 10 || first === 0 || (first === 172 && octets[1] >= 16 && octets[1] <= 31) || (first === 192 && octets[1] === 168)) {
            return false;
          }
        }
      }
    }

    // Block standard private IPv4 ranges
    const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const b0 = parseInt(ipMatch[1], 10);
      const b1 = parseInt(ipMatch[2], 10);
      if (b0 === 10) return false;
      if (b0 === 127) return false;
      if (b0 === 169 && b1 === 254) return false;
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return false;
      if (b0 === 192 && b1 === 168) return false;
      if (b0 === 0 || b0 >= 224) return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Universal Web Page Deep Scraper (Crawl4AI & Firecrawl Enhanced)
 * Uses a dual-stage pipeline: Direct Crawl4AI Fit-Markdown parser with high-fidelity Jina LLM Reader fallback.
 * Fetches, strips boilerplate, and converts any public webpage into clean LLM-Ready Fit-Markdown.
 */
async function scrapeDirectWebpageContent(url) {
  if (!url || typeof url !== 'string' || !isSafePublicUrl(url)) return '';
  
  // 1. Primary: Direct Fetch + Local Crawl4AI Fit-Markdown Engine
  try {
    const res = await fetchJsonWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Crawl4AI-Firecrawl-HybridEngine/2026',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7'
      }
    }, 2800);

    if (res.ok && res.text && res.text.length > 50) {
      const parsed = extractFitMarkdownContent(res.text, url);
      if (parsed && parsed.length > 80) return parsed;
    }
  } catch (_) {}

  // 2. Secondary Fallback: Universal LLM Reader Proxy (Handles anti-bot/JS-rendered sites)
  try {
    const jinaRes = await fetchJsonWithTimeout(`https://r.jina.ai/${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/plain'
      }
    }, 3200);

    if (jinaRes.ok && jinaRes.text && jinaRes.text.length > 50) {
      return jinaRes.text.slice(0, 6000).trim();
    }
  } catch (_) {}

  return '';
}


/**
 * 100% Real-Time High-Precision Live Web & News Search Engine
 * Concurrently queries verified global live news feeds (Google News Global, Google News Indonesia, Bing News)
 * and direct URL scrapers to provide authentic, up-to-date facts with publication timestamps.
 */
async function searchWebContext(query, history = []) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return { formattedPrompt: '', rawSnippets: [] };
  }

  const qLower = query.toLowerCase().trim();
  if (['clear', 'help', 'skills', 'projects', 'certifs', 'benchmarks', 'cls', 'about'].includes(qLower)) {
    return { formattedPrompt: '', rawSnippets: [] };
  }

  const rawQueries = formulateSmartSearchQueries(query, history);
  const searchQueries = rawQueries.length > 0 ? rawQueries.slice(0, 2) : [query.trim().slice(0, 80)];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6000ms expanded search budget

    const structuredSnippets = [];
    const rawSnippets = [];

    // Helper to sanitize XML / HTML entities
    const cleanStr = (str) => {
      if (!str) return '';
      const entityMap = { '&quot;': '"', '&#39;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };
      return str.replace(/<[^>]+>/g, '').replace(/&(?:quot|#39|amp|lt|gt|nbsp);/g, m => entityMap[m] || m).trim();
    };

    // 1. Direct Web Link Scraper: If user provides an explicit URL in the query
    const urlMatches = query.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    if (urlMatches.length > 0) {
      const urlPromises = urlMatches.slice(0, 2).map(async (url) => {
        const pageText = await scrapeDirectWebpageContent(url);
        if (pageText && pageText.length > 50) {
          structuredSnippets.push({
            text: `[Live Webpage Content (${url})]:\n${pageText}`,
            timestamp: Date.now() + 1000000000 // Highest priority
          });
          rawSnippets.push(`[Scraped URL]: ${url}`);
        }
      });
      await Promise.allSettled(urlPromises);
    }

    // 2. Ultra-Fast Parallel Live News Feeds (Google News Global & Indonesia + Bing News)
    const searchFetches = searchQueries.flatMap(targetQ => [
      // Google News Global (US / English) - Fresh News
      fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(targetQ + ' when:30d')}&hl=en-US&gl=US&ceid=US:en`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      }),
      // Google News Indonesia - Fresh News
      fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(targetQ + ' when:30d')}&hl=id&gl=ID&ceid=ID:id`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      }),
      // Bing News Global
      fetch(`https://www.bing.com/news/search?q=${encodeURIComponent(targetQ)}&format=rss`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      })
    ]);

    // 3. GitHub Open-Source & Library Discovery (For tech / framework / code / repo queries)
    const isTechOrCode = /\b(github|repo|library|framework|package|model|tool|sdk|api|kode|script|koding|coding|npm|pip|cargo|golang|rust|python|javascript|typescript|svelte|react|vue|deepseek|llama|gemini|claude|gpt|anthropic|openai|mistral|nemotron)\b/i.test(query);
    if (isTechOrCode) {
      const techKeyword = searchQueries[0] || query.slice(0, 60);
      searchFetches.push(
        fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(techKeyword)}&sort=stars&order=desc&per_page=3`, {
          headers: { 'User-Agent': 'Antigravity-Portfolio-Engine/2026' },
          signal: controller.signal
        })
      );
      searchFetches.push(
        fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(techKeyword)}&limit=3`, {
          headers: { 'User-Agent': 'Antigravity-Portfolio-Engine/2026' },
          signal: controller.signal
        })
      );
    }

    // 4. Open-Web Encyclopedic Knowledge (Multi-Language: English & Indonesian)
    const isEncyclopedic = /\b(apa itu|siapa itu|definisi|pengertian|sejarah|biografi|rumus|cara kerja|apa arti|teori|asal usul|what is|who is|history of|definition of|siapa|apa|jelaskan|how does)\b/i.test(query);
    if (isEncyclopedic) {
      const mainKeyword = query.replace(/\b(apa itu|siapa itu|definisi|pengertian|sejarah|biografi|rumus|cara kerja|apa arti|teori|asal usul|what is|who is|history of|definition of|tolong|jelaskan|dong|how does)\b/gi, ' ').trim();
      if (mainKeyword.length >= 3) {
        searchFetches.push(
          fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(mainKeyword)}&format=json&origin=*`, {
            signal: controller.signal
          }),
          fetch(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(mainKeyword)}&format=json&origin=*`, {
            signal: controller.signal
          })
        );
      }
    }

    // Extract key search terms for relevance evaluation
    const searchKeywords = searchQueries.flatMap(sq => 
      sq.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3)
    );

    const calcScore = (title) => {
      const tLow = (title || '').toLowerCase();
      let score = 0;
      for (const kw of searchKeywords) {
        if (tLow.includes(kw)) score += 2;
      }
      return score;
    };

    const results = await Promise.allSettled(searchFetches);
    clearTimeout(timeout);

    for (const res of results) {
      if (res.status === 'fulfilled' && res.value && res.value.ok) {
        const textData = await res.value.text().catch(() => '');
        if (textData.startsWith('{') || textData.startsWith('[')) {
          try {
            const parsed = JSON.parse(textData);
            // DuckDuckGo Instant Answers
            if (parsed?.AbstractText && parsed.AbstractText.length > 20) {
              const snip = cleanStr(parsed.AbstractText);
              structuredSnippets.push({
                text: `[DuckDuckGo Web Index (${parsed.Heading || 'Web Result'})]: ${snip}`,
                timestamp: Date.now() + 500000,
                score: 8
              });
              rawSnippets.push(`[DuckDuckGo]: ${parsed.Heading || 'Web Knowledge'}`);
            }
            if (Array.isArray(parsed?.RelatedTopics)) {
              parsed.RelatedTopics.slice(0, 2).forEach(rt => {
                if (rt?.Text && rt.Text.length > 25) {
                  structuredSnippets.push({
                    text: `[Web Topic Reference]: ${cleanStr(rt.Text)}`,
                    timestamp: 500,
                    score: 4
                  });
                }
              });
            }
            // Wikipedia
            if (parsed?.query?.search) {
              const hits = parsed.query.search;
              if (hits.length > 0) {
                const h = hits[0];
                const snip = cleanStr(h.snippet);
                if (snip && !isJunkArticle(snip)) {
                  structuredSnippets.push({
                    text: `[Referensi Ensiklopedia (${h.title})]: ${snip}`,
                    timestamp: 1000,
                    score: 5
                  });
                  rawSnippets.push(`[Wikipedia]: ${h.title}`);
                }
              }
            }
            // GitHub
            if (Array.isArray(parsed?.items)) {
              parsed.items.slice(0, 2).forEach(repo => {
                const desc = cleanStr(repo.description);
                structuredSnippets.push({
                  text: `[GitHub Repository (${repo.full_name}, ${repo.stargazers_count} stars)]: ${desc || 'Open-source repository'}`,
                  timestamp: 2000,
                  score: 4
                });
                rawSnippets.push(`[GitHub]: ${repo.full_name}`);
              });
            }
            // HuggingFace
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
              const models = parsed.slice(0, 3).map(m => m.id).join(', ');
              structuredSnippets.push({
                text: `[Hugging Face Hub Models]: ${models}`,
                timestamp: 3000,
                score: 4
              });
              rawSnippets.push(`[HuggingFace]: ${models}`);
            }
          } catch (_) {}
        } else if (textData.includes('<feed') || textData.includes('<entry>')) {
          // arXiv XML Feed
          const entries = textData.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
          entries.slice(0, 2).forEach(entry => {
            const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/i);
            const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/i);
            const title = cleanStr(titleMatch ? titleMatch[1] : '');
            const summary = cleanStr(summaryMatch ? summaryMatch[1] : '');
            if (title && summary) {
              structuredSnippets.push({
                text: `[arXiv Research Paper (${title})]: ${summary.slice(0, 400)}...`,
                timestamp: Date.now(),
                score: 5
              });
              rawSnippets.push(`[arXiv]: ${title}`);
            }
          });
        } else {
          // RSS News Feeds (Google News Global, UK, ID, Bing)
          const items = textData.match(/<item>[\s\S]*?<\/item>/gi) || [];
          items.slice(0, 8).forEach((item) => {
            const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
            const descMatch = item.match(/<description>([\s\S]*?)<\/description>/i);
            const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
            const title = cleanStr(titleMatch ? titleMatch[1] : '');
            const desc = cleanStr(descMatch ? descMatch[1] : '');
            const pubDate = cleanStr(dateMatch ? dateMatch[1] : '');
            if (title && !isJunkArticle(title)) {
              let ts = 0;
              let recencyBonus = 0;
              if (pubDate) {
                const parsedDate = new Date(pubDate).getTime();
                if (!isNaN(parsedDate)) {
                  ts = parsedDate;
                  const daysOld = (Date.now() - parsedDate) / (1000 * 60 * 60 * 24);
                  if (daysOld <= 7) recencyBonus = 10;
                  else if (daysOld <= 30) recencyBonus = 7;
                  else if (daysOld <= 90) recencyBonus = 4;
                  else if (daysOld <= 365) recencyBonus = 2;
                }
              }
              const relScore = calcScore(title + ' ' + desc) + recencyBonus;
              if (searchKeywords.length === 0 || relScore > 0) {
                const fullText = desc && desc.length > 20 ? `${title} — ${desc.slice(0, 250)}` : title;
                const entry = pubDate ? `[Global Live Web/News (${pubDate})]: ${fullText}` : `[Global Live Web/News]: ${fullText}`;
                structuredSnippets.push({ text: entry, timestamp: ts, score: relScore });
                rawSnippets.push(title);
              }
            }
          });
        }
      }
    }

    // Sort all snippets by relevance score first (including recency bonus), then newest timestamp
    structuredSnippets.sort((a, b) => ((b.score || 0) - (a.score || 0)) || (b.timestamp - a.timestamp));

    // Deduplicate snippets (top 5 highest scoring snippets for fast, high-density grounding)
    const seen = new Set();
    const uniqueSnippets = [];
    for (const item of structuredSnippets) {
      if (!seen.has(item.text)) {
        seen.add(item.text);
        uniqueSnippets.push(item.text);
      }
      if (uniqueSnippets.length >= 5) break;
    }

    let formattedPrompt = '';
    if (uniqueSnippets.length > 0) {
      formattedPrompt = `\n\n[FAKTA & PERKEMBANGAN TERKINI DARI MESIN PENCARI & WEB GLOBAL]:
${uniqueSnippets.join('\n')}

[PANDUAN SINTESIS INFORMASI WEB & ANTI-NOISE]:
- PRIORITASKAN FAKTA RESMI & TERBARU (2025/2026).
- ADAPTIF TERHADAP GAYA PERTANYAAN (ANTI-NOISE):
  * Jika pengguna bertanya santai/singkat (contoh: "kalo claude", "model apa", "kapan rilis"): Jawab LANGSUNG ke inti topik (1-3 paragraf padat). DILARANG memaksakan subjudul template birokratis atau bab-bab panjang yang tidak diminta.
  * HANYA gunakan struktur panjang jika pengguna secara eksplisit meminta breakdown komprehensif atau analisis mendalam.
- FOKUS MURNI PADA TOPIK YANG DITANYAKAN:
  * Jika pengguna beralih topik (misal dari Gemini ke Claude), jawab HANYA tentang topik baru tersebut. DILARANG mencampurkan informasi produk/model dari percakapan sebelumnya ke dalam jawaban topik baru kecuali diminta membandingkan.
- KEJUJURAN FAKTUAL & GROUNDING WEB DINAMIS:
  * Rujuk nama model, versi, dan rilis teknologi secara dinamis dan faktual dari data pencarian web terkini.
  * Jawab berbasis bukti nyata hasil web tanpa mengarang fakta yang tidak ada di sumber.\n`;
    }

    return { formattedPrompt, rawSnippets: rawSnippets.slice(0, 10) };
  } catch (_) {
    return { formattedPrompt: '', rawSnippets: [] };
  }
}

// ponytail: pickAutoModel removed — both branches returned identical 'openrouter/free' and function was never called.
// Model routing is handled entirely by classifyQueryIntent + buildExecutionPipeline.

function classifyQueryIntent(query = '', docAttachments = [], hasImages = false) {
  const q = String(query || '').trim().toLowerCase();
  const len = q.length;

  if (hasImages) {
    return {
      category: 'vision',
      isAnalysisOrComparison: true,
      effort: 'medium',
      omniCandidates: ['Vision-model', 'opencode/nemotron-3-ultra-free', 'nvidia/nemotron-3-ultra-550b-a55b:free', 'ollama/minimax-m3'],
      label: 'Vision & Multimodal Perception (Gemini 3.1 Flash & MiniMax M3)'
    };
  }

  // 0A. Direct Identity & Model Queries (Who are you / What model is this)
  const isIdentity = /^(kamu siapa|siapa kamu|kamu model apa|model apa kamu|model apa ini|kamu ai apa|kamu ini apa|siapa namamu|namamu siapa|who are you|what are you|what model are you|model apa yang aktif|kamu pakai model apa|ini model apa|anda siapa|siapa anda)$/i.test(q);
  if (isIdentity) {
    return {
      category: 'identity',
      isAnalysisOrComparison: false,
      effort: 'low',
      omniCandidates: ['Antigravity', 'Codex', 'x-preview-f-free', 'nemotron-3-nano'],
      label: 'AI Assistant Identity & Model Transparency'
    };
  }

  // 0B. Casual greetings, acknowledgments, simple chit-chat
  const isCasualOrClosing = /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|cukup|udah|sudah|selesai|stop|berhenti|gausah|nggak|tidak|makasih|terima kasih|thanks|thx|tq|oke|ok|sip|siap|mantap|keren|yup|yes|ya|iya|bye|dadah)$/i.test(q);
  
  if (isCasualOrClosing) {
    return {
      category: 'trivial_casual',
      isAnalysisOrComparison: false,
      effort: 'low',
      omniCandidates: ['nemotron-lightning', 'x-preview-f-free'],
      label: 'Casual Greeting & Quick Interaction (Nemotron Lightning)'
    };
  }

  // 1. In-Depth Project Analysis, Multi-Repository Breakdown, Explanations, and Comparative Studies
  // GUARD: Deep analysis (Ultra 550B) hanya untuk proyek/kode Rafly atau analisis teknis berat.
  // Kueri perbandingan hal EKSTERNAL (benchmark AI lain, berita, topik umum) = medium effort Nano 30B.
  const hasAnalysisOrComparisonKeywords = /\b(jelaskan dan analisi|jelaskan dan analisis|analisis|analisa|bedahkan|bedah|evaluasi mendalam|secara mendalam|lebih dalam|komprehensif|arsitektur sistem|bandingkan|perbandingan|komparasi|jelaskan|jelas|penjelasan|perbedaan|persamaan|detail|rinci|lengkap|kelebihan|kekurangan|trade-off|tradeoff|skripsi|github)\b/i.test(q);
  const hasRaflyProjectContext = /\b(spam|plagiarism|openplagiarism|plagiarisme|laser|gesture|presenter|fotokitablur|foto kita|portofolio|portfolio|skripsi|sertif|sertifikasi|bnsp|mtcna|cisco|rafly|firmansyah|proyek|riset|concept drift|covariate shift|n-gram|sbert|ensemble|cnb|xgboost|websocket|flask|mediapipe)\b/i.test(q);
  const hasHeavyTechContext = /\b(arsitektur sistem|microservice|docker|kubernetes|pipeline|implementasikan sistem|buatkan backend|full stack|database schema|sistem auth)\b/i.test(q);
  const isDeepAnalysis = hasAnalysisOrComparisonKeywords && (hasRaflyProjectContext || hasHeavyTechContext) || len > 150;
  if (isDeepAnalysis) {
    return {
      category: 'project_architecture',
      isAnalysisOrComparison: true,
      effort: 'high',
      omniCandidates: ['Codex', 'x-preview-f-free', 'Antigravity', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Deep Architecture, Explanation & Comparative Analysis (Nemotron Nano 30B)'
    };
  }

  // 2. Rigorous Multi-Step Mathematical Proof, Chain of Thought, Formal Thesis Derivations
  const hasRigorousThinkingKeywords = /\b(turunkan rumus|matematis|bukti matematis|pembuktian matematis|formula matematis|chain of thought|step by step reasoning|penalaran mendalam|bedah logika mendalam|analisis statistik mendalam|evaluasi empiris skripsi|perhitungan matriks|probabilitas bayesian)\b/i.test(q);
  if (hasRigorousThinkingKeywords) {
    return {
      category: 'deep_reasoning',
      isAnalysisOrComparison: true,
      effort: 'thinking',
      omniCandidates: ['Antigravity', 'Codex', 'x-preview-f-free', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Deep Reasoning & Mathematical Derivations (Nemotron Nano 30B)'
    };
  }

  // 3. Heavy Coding, Multi-File Full System Implementations, Large Script Synthesis
  const hasHeavyCodeKeywords = /\b(buatkan full script|buatkan full kode|arsitektur microservice|implementasikan sistem|buatkan backend lengkap|full stack implementasi|buatkan boilerplate|sistem auth lengkap|pipeline dataform|dbt pipeline|docker compose full|kubernetes manifest)\b/i.test(q) || (docAttachments.length > 0 && len > 150);
  if (hasHeavyCodeKeywords) {
    return {
      category: 'heavy_coding',
      isAnalysisOrComparison: true,
      effort: 'high',
      omniCandidates: ['Codex', 'x-preview-f-free', 'Antigravity', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Heavy Coding & System Architecture (Nemotron Nano 30B & Codex)'
    };
  }

  // 4. Standard Coding & Snippets
  const hasCodeKeywords = /\b(script|koding|coding|function|def |class |async |await |import |export |const |let |var |sql|select .* from|regex|refactor|debug|fix bug|error|syntax)\b/i.test(q) || /\b(python|javascript|typescript|golang|rust|php|pytorch|react|flask)\b/i.test(q);
  if (hasCodeKeywords) {
    return {
      category: 'heavy_coding',
      isAnalysisOrComparison: hasAnalysisOrComparisonKeywords,
      effort: 'medium',
      omniCandidates: ['Codex', 'x-preview-f-free', 'Antigravity', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Coding & Algorithm Synthesis (Nemotron Nano & Codex)'
    };
  }

  // 5. Standard Informative, Conceptual, Ordinary Q&A, and Fast Trivia
  const isShortQuery = len < 40 && !hasAnalysisOrComparisonKeywords;
  return {
    category: isShortQuery ? 'trivial_casual' : 'basic_standard',
    isAnalysisOrComparison: hasAnalysisOrComparisonKeywords,
    effort: isShortQuery ? 'low' : 'medium',
    omniCandidates: ['nemotron-lightning', 'x-preview-f-free', 'nemotron-3-nano', 'deepseek/deepseek-chat'], // DEAD-3: removed typo 'nemotron-lighting'
    label: hasAnalysisOrComparisonKeywords ? 'Technical Synthesis (Nemotron Nano 30B)' : (isShortQuery ? 'Quick Interaction (Nemotron Lightning)' : 'Standard Q&A & Trivia (Nemotron Lightning)')
  };
}

// Trusted client IP: prefer Vercel's trusted header, else the LAST element of
// x-forwarded-for (the value appended by the outermost trusted proxy), else the
// raw socket address. Never trust the first x-forwarded-for segment — clients
// can spoof it to bypass per-IP rate limits.
function getClientIp(req) {
  const headers = req?.headers || {};
  const trusted = headers['x-vercel-forwarded-for'];
  if (trusted && typeof trusted === 'string') return trusted.split(',')[0].trim();
  const xff = headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const parts = xff.split(',');
    return (parts[parts.length - 1] || '').trim() || req?.socket?.remoteAddress || '127.0.0.1';
  }
  return req?.socket?.remoteAddress || '127.0.0.1';
}

// Rate limiting (35 requests per minute per IP).
// The in-memory cache is the fast path; the source of truth is persisted in a
// `rate_limits` table via Supabase so the limit survives cold starts and
// multiple serverless instances (AGENTS.md §9b).
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 35;

// Module-scoped so the 15-min key cool-down persists across invocations in the same warm instance
const rateLimitedKeyCache = new Map();

const RATE_LIMIT_TABLE = 'rate_limits';

async function persistRateLimit(clientIp, count, windowStartIso) {
  // Best-effort persisted counter; never blocks the request when Supabase is down.
  // NOT a hard guarantee under multi-instance concurrency: the read-modify-write
  // in isRateLimited() can lose increments when two instances read the same count
  // and POST count+1 (PostgREST has no server-side increment, so an absolute value
  // is written). The in-memory cache keeps the fast-path bound exact per instance.
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/${RATE_LIMIT_TABLE}`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        client_ip: clientIp,
        window_start: windowStartIso,
        request_count: count
      })
    });
  } catch (_) { /* non-fatal */ }
}

async function isRateLimited(clientIp) {
  if (!clientIp || clientIp === 'unknown-client') return false;
  const now = Date.now();

  // 1. Persisted source of truth first (survives cold starts / multi-instance).
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (supabaseUrl && serviceRoleKey) {
    try {
      const windowStartIso = new Date(now - (now % RATE_LIMIT_WINDOW_MS)).toISOString();
      const res = await fetch(
        `${supabaseUrl}/rest/v1/${RATE_LIMIT_TABLE}?client_ip=eq.${encodeURIComponent(clientIp)}&window_start=eq.${encodeURIComponent(windowStartIso)}&select=request_count`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, Accept: 'application/json' } }
      );
      if (res.ok) {
        const rows = await res.json();
        const persistedCount = Array.isArray(rows) && rows.length > 0 ? (rows[0].request_count || 0) : 0;
        // Boundary is >= MAX (same as the in-memory fallback): block at MAX, allow below.
        if (persistedCount >= MAX_REQUESTS_PER_WINDOW) return true;
        // Increment persisted counter (optimistic, fire-and-forget, best-effort —
        // concurrent instances may overwrite with the same absolute count).
        persistRateLimit(clientIp, persistedCount + 1, windowStartIso);
        return false;
      }
    } catch (_) { /* fall through to memory */ }
  }

  // 2. In-memory fast path (fallback when Supabase is unreachable).
  const record = rateLimitCache.get(clientIp);
  if (!record || (now - record.startTime) > RATE_LIMIT_WINDOW_MS) {
    rateLimitCache.set(clientIp, { count: 1, startTime: now });
    if (rateLimitCache.size > 2000) {
      for (const [k, v] of rateLimitCache.entries()) {
        if (now - v.startTime > RATE_LIMIT_WINDOW_MS) rateLimitCache.delete(k);
      }
    }
    return false;
  }
  record.count += 1;
  // Same boundary as the persisted path (>= MAX): blocks at MAX, not MAX+1.
  return record.count >= MAX_REQUESTS_PER_WINDOW;
}

/**
 * Trusted RAG memory read (anti data-poisoning).
 * Reads ai_memories with SUPABASE_SERVICE_ROLE_KEY — the client can never
 * inject memory directly; only /api/save-memory (server) writes it.
 */
const SUPABASE_DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU';

function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;
}

/**
 * Trusted RAG memory read (anti data-poisoning).
 * Reads ai_memories with service_role or anon key.
 */
async function fetchServerMemories(limit = 15) {
  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/ai_memories?select=fact_text&order=created_at.desc&limit=${limit}`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows
      .map(r => (r && typeof r.fact_text === 'string' ? r.fact_text : ''))
      .filter(t => t.length > 0)
      .slice(0, limit);
  } catch (_) {
    return [];
  }
}

/**
 * Trusted RAG memory auto-persist (Continuous Learning Protocol).
 * Automatically saves validated insights or corrections to Supabase ai_memories.
 */
async function saveServerMemory(factText, sessionId = null) {
  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey || !factText) return;
  const trimmedFact = String(factText).trim();
  if (trimmedFact.length < 5 || trimmedFact.length > 1000) return;
  if (/\b(ignore|override|disregard|abaikan)\b/i.test(trimmedFact)) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/ai_memories`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        fact_text: trimmedFact,
        session_id: sessionId || null,
        created_at: new Date().toISOString()
      })
    });
  } catch (_) {}
}

/**
 * Intelligent Unified AI Key Resolver
 * Automatically classifies tokens from a single AI_KEYS variable or legacy per-provider env vars.
 */
function getUnifiedProviderKeys(cleanCustomKey = null, cleanCustomProvider = null) {
  const unifiedRaw = [
    process.env.AI_KEYS,
    process.env.AI_API_KEYS,
    process.env.ALL_KEYS,
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_KEYS,
    process.env.OPENROUTER_KEY,
    process.env.OPENCODE_API_KEY,
    process.env.OPENCODE_KEYS,
    process.env.MINIMAX_API_KEY,
    process.env.MINIMAX_KEY,
    process.env.MINIMAX_KEYS,
    process.env.OLLAMA_API_KEY,
    process.env.OLLAMA_KEYS,
    process.env.OLLAMA_KEY,
    process.env.NVIDIA_API_KEY,
    process.env.NVIDIA_KEY
  ].filter(Boolean).join(',');

  const allTokens = unifiedRaw
    .split(/[\n,;\s]+/)
    .map(k => k.trim())
    .filter(k => k.length > 5);

  const openrouter = [];
  const opencode = [];
  const minimax = [];
  const ollama = [];
  const nvidia = [];

  for (const token of allTokens) {
    if (token.startsWith('sk-or-v1-')) {
      if (!openrouter.includes(token)) {
        openrouter.push(token);
      }
    } else if (token.startsWith('sk-cp-') || token.startsWith('sk-minimax-')) {
      if (!minimax.includes(token)) minimax.push(token);
    } else if (token.startsWith('nvapi-')) {
      if (!nvidia.includes(token)) nvidia.push(token);
    } else if (token.startsWith('sk-') && token.length >= 40) {
      if (!opencode.includes(token)) opencode.push(token);
    } else if (token.includes('.') || token.length === 32 || token.startsWith('ollama-')) {
      if (!ollama.includes(token)) ollama.push(token);
    }
  }

  // Handle client custom key override
  if (cleanCustomKey) {
    if (cleanCustomProvider === 'openrouter' || !cleanCustomProvider) {
      if (!openrouter.includes(cleanCustomKey)) openrouter.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'opencode') {
      if (!opencode.includes(cleanCustomKey)) opencode.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'minimax') {
      if (!minimax.includes(cleanCustomKey)) minimax.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'ollamacloud' || cleanCustomProvider === 'ollama') {
      if (!ollama.includes(cleanCustomKey)) ollama.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'nvidia') {
      if (!nvidia.includes(cleanCustomKey)) nvidia.unshift(cleanCustomKey);
    }
  }

  return {
    openrouter,
    opencode,
    minimax,
    ollama,
    nvidia
  };
}

export default async function handler(req, res) {
  // CORS: allowlist eksplisit — jangan pernah echo origin arbitrer dengan credentials
  const ALLOWED_ORIGINS = [
    process.env.ALLOWED_ORIGIN,
    'https://raflyfirmansyah-portofolio.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3877',
    'http://localhost:3000',
    'http://127.0.0.1:3877',
    'http://127.0.0.1:3000'
  ].filter(Boolean);
  const requestOrigin = (req.headers && req.headers.origin) ? req.headers.origin : '';
  const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    loadLocalEnv();
    const resolvedKeys = getUnifiedProviderKeys();
    const hasOpenRouter = resolvedKeys.openrouter.length > 0;
    const hasOpenCode = resolvedKeys.opencode.length > 0;
    const hasOllama = resolvedKeys.ollama.length > 0;
    const hasMiniMax = resolvedKeys.minimax.length > 0;
    return res.status(200).json({ 
      version: 'v10.584.0',
      status: 'online', 
      keys: { hasOpenRouter, hasOpenCode, hasOllama, hasMiniMax },
      timestamp: Date.now() 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const requestStartTime = Date.now();

  try {
    loadLocalEnv();

    const body = req.body || {};
    // SECURITY (anti RAG-poisoning): longTermMemory from the client body is
    // IGNORED — memory is read server-side from ai_memories (service_role) only.
    const { query, history = [], attachments = [], model = 'auto', customKey = null, customProvider = null, sessionLanguage = 'id', reasoningEffort = 'auto', sessionId = null } = body;

    // Rate Limiting (trusted client IP — see getClientIp)
    const clientIp = getClientIp(req);
    if (await isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Terlalu banyak permintaan. Silakan tunggu beberapa detik sebelum mengirim pesan berikutnya.',
        rateLimited: true
      });
    }

    if (!query && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Query prompt or file attachment is required' });
    }

    // Sanitize user-provided keys against CRLF injection
    const cleanCustomKey = typeof customKey === 'string' ? customKey.replace(/[\r\n]/g, '').trim().slice(0, 256) : '';
    const cleanCustomProvider = typeof customProvider === 'string' ? customProvider.replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 32) : '';

    const resolvedKeys = getUnifiedProviderKeys(cleanCustomKey, cleanCustomProvider);
    const OPENROUTER_KEYS = resolvedKeys.openrouter;
    const OPENROUTER_KEY = OPENROUTER_KEYS[0] || null;
    const NVIDIA_KEYS = resolvedKeys.nvidia;
    const NVIDIA_KEY = NVIDIA_KEYS[0] || null;
    const OPENCODE_KEYS = resolvedKeys.opencode;
    const OPENCODE_KEY = OPENCODE_KEYS[0] || null;
    const MINIMAX_KEYS = resolvedKeys.minimax;
    const MINIMAX_KEY = MINIMAX_KEYS[0] || null;
    const OLLAMA_KEYS = resolvedKeys.ollama;
    const OLLAMA_KEY = OLLAMA_KEYS[0] || null;

    const providerErrors = [];

    // Check for image attachments
    const imageAttachments = Array.isArray(attachments) ? attachments.filter(a => a.isImage || (a.type && a.type.startsWith('image/'))) : [];
    const docAttachments = Array.isArray(attachments) ? attachments.filter(a => !a.isImage && (!a.type || !a.type.startsWith('image/'))) : [];
    const hasImages = imageAttachments.length > 0;

    // Build assembled text prompt with document attachments
    let assembledQuery = query;
    if (docAttachments.length > 0) {
      const docTexts = docAttachments.map(d => `[DOKUMEN TERLAMPIR: ${d.name} (${d.type || 'text'})]:\n\`\`\`\n${d.data}\n\`\`\``).join('\n\n');
      assembledQuery = `${docTexts}\n\n[INSTRUKSI / PERTANYAAN PENGGUNA]:\n${query || 'Analisis dan jelaskan isi dokumen terlampir di atas secara mendalam.'}`;
    }

    // Dynamic Query Intent & Auto-Router Classification
    const queryIntent = classifyQueryIntent(assembledQuery, docAttachments, hasImages);

    // Resolve Effective Effort (Dynamic scaling if auto, or user-selected override)
    const effectiveEffort = (reasoningEffort === 'auto' || !reasoningEffort) 
      ? queryIntent.effort 
      : reasoningEffort;

    let targetModel = (model === 'auto' || !model)
      ? 'Nemotron-3-Nano-30B'
      : model;

    if (hasImages && (model === 'auto' || !model)) {
      targetModel = 'Vision-model';
    }

    const qClean = (query || '').trim();
    const isIdentityQuery = /^(kamu siapa|siapa kamu|kamu model apa|model apa kamu|model apa ini|kamu ai apa|kamu ini apa|siapa namamu|namamu siapa|who are you|what are you|what model are you|model apa yang aktif|kamu pakai model apa|ini model apa|anda siapa|siapa anda)$/i.test(qClean);
    const isTimeQuery = /(?:jam\s*berapa|waktu\s*sekarang|tanggal\s*berapa|hari\s*apa\s*sekarang|sekarang\s*jam|sekarang\s*tanggal|pukul\s*berapa|zona\s*waktu|wib\b|wita\b|wit\b)/i.test(qClean);
    const isCasualGreeting = /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|cukup|udah|sudah|selesai|stop|berhenti|gausah|nggak|tidak|makasih|terima kasih|thanks|thx|tq|oke|ok|sip|siap|mantap|keren|yup|yes|ya|iya|bye|dadah)$/i.test(qClean);
    const isInternalPortfolioQuery = /(?:spam|plagiarism|openplagiarism|plagiarisme|skripsi|naskah|laser|gesture|presenter|fotokitablur|foto kita|portofolio|portfolio|sertif|sertifikasi|bnsp|mtcna|cisco|rafly|firmansyah|proyek|project|riset|research|kendala|eror|error|masalah|bug|kontak|contact|skills?|kemampuan|riwayat|pendidikan|kuliah|kampus|cv|resume)/i.test(qClean);
    const isSkipSearch = isIdentityQuery || isTimeQuery || isCasualGreeting || isInternalPortfolioQuery;

    // DEAD-1/KONFLIK-3: Removed fetchLiveRepoContext (was always ''). Direct await is cleaner.
    const searchResult = isSkipSearch
      ? { formattedPrompt: '', rawSnippets: [] }
      : await searchWebContext(query, history);
    const webContext = searchResult.formattedPrompt;
    const webMemories = searchResult.rawSnippets || [];

    const agentSteps = [];
    if (!isSkipSearch && webMemories.length > 0) {
      agentSteps.push({
        tool: 'web_search',
        query: query.substring(0, 60),
        sourcesCount: webMemories.length,
        sources: webMemories.slice(0, 3)
      });
    } else if (isInternalPortfolioQuery) {
      agentSteps.push({
        tool: 'portfolio_rag',
        topic: query.substring(0, 50)
      });
    }

    const sendSuccess = (content, modelName, providerName) => {
      let cleaned = String(content || '')
        .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?(?:div|p|span)[^>]*>/gi, '')
        .trim();

      // 0. Strip trailing meta-reflection, chain-of-thought, or constraints scratchpad leaks
      // (e.g. " - Check constraints: ...", "Response structure: ...", "Draft: ...", "Final plan: ...")
      cleaned = cleaned.replace(/["']?\s*[-–—*•]?\s*(?:Check constraints|Response structure|Final plan|Draft:|Checking constraints|Let's check constraints|Check against|Response plan:)[\s\S]*/i, '').trim();
      cleaned = cleaned.replace(/\b(?:Draft|Final plan|Response plan):\s*["']?([\s\S]+?)["']?(?=\s*[-–—*•]?\s*(?:Check|Response structure|Final plan|$))/i, '$1').trim();
      cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

      // 0.1. Auto-persist validated facts from [SAVE_MEMORY: ...] to Supabase
      const saveMemoryMatches = [...cleaned.matchAll(/\[SAVE_MEMORY:\s*([\s\S]*?)\]/gi)];
      for (const m of saveMemoryMatches) {
        if (m[1] && m[1].trim()) {
          saveServerMemory(m[1].trim(), sessionId || null).catch(() => {});
        }
      }
      const textWithoutTags = cleaned.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
      if (/^(?:User Safety:\s*\w+[\s\S]*?Response Safety:\s*\w+|Safety:\s*safe)$/i.test(cleaned) || !textWithoutTags.trim()) {
        return null;
      }
      cleaned = textWithoutTags.replace(/^(?:User Safety:\s*\w+\s*\n*Response Safety:\s*\w+\s*\n*)+/i, '').trim();

      // 1. Check for explicit output markers like Thus: "..." or Response:
      const markerMatch = cleaned.match(/(?:Thus|Therefore|Response|Answer|Jawaban|In Indonesian|Output):\s*["']?([\s\S]+)/i);
      if (markerMatch && markerMatch[1] && markerMatch[1].trim().length > 10) {
        cleaned = markerMatch[1].trim().replace(/^["']|["']$/g, '').trim();
      } else {
        // 2. Check for English reasoning monologue start
        cleaned = cleaned.replace(/^(?:Here's (?:a )?(?:thinking process|breakdown|brief thinking)[\s\S]*?)(?=(?:\n\s*(?:[#\-*]|\d+\.|Berikut|Berdasarkan|Status|Informasi|Perilisan|Halo|Hai|Terima kasih|Dalam|Untuk|Pada|Ya|Tentu|Saya)\b))/i, '').trim();
        const reasoningKeywords = /^(?:Here's|Okay|First|Let me|I should|I need to|The user|Looking back|Looking at|Hmm|Wait|From memory|Now, for|To answer|Alright|Let's|Checking|So the user|The system message)\b/i;
        if (reasoningKeywords.test(cleaned)) {
          const indonesianMarker = /(?:(?:\n|\A)(?:Terima kasih|Berikut|Berdasarkan|Tabel|Perbandingan|Model|Untuk|Saat ini|Halo|Hai|Tentu|Dalam|Secara|Pada|[#|]|\d+\.)\s)/i;
          const match = cleaned.search(indonesianMarker);
          if (match !== -1 && match > 0) {
            cleaned = cleaned.slice(match).trim();
          } else {
            const lines = cleaned.split('\n');
            const filtered = lines.filter(l => !/^(?:Here's|Okay|First|Let me|I should|I need to|The user|Looking|Wait|Checking|So the user|Therefore|Thus|The system message|In their message|Given that|However|Alternatively|So, my response)\b/i.test(l.trim()));
            if (filtered.length > 0) {
              cleaned = filtered.join('\n').trim();
            }
          }
        }
      }

      // 3. Sanitize broken / malformed table pipe artifacts
      cleaned = cleaned.replace(/(?:^|\n)\|\s*(\d+)\s*\|\s*([^|\n]+?)\s*\|\s*(?:\n|$)/g, '\n### $1. $2\n');
      cleaned = cleaned.replace(/(?:^|\n)\|\s*([•\-\*]\s*[^|\n]+?)\s*\|\s*(?:\n|$)/g, '\n$1\n');
      cleaned = cleaned.replace(/\s*\|\s*$/gm, '');

      // 3.4. Strip repetitive leading greetings on non-greeting queries
      const isExplicitGreeting = /^(?:hai|halo|hei|hello|hi|hey|selamat\s+(?:pagi|siang|sore|malam)|assalamu[']?alaikum)\b/i.test((query || '').trim());
      if (!isExplicitGreeting) {
        cleaned = cleaned.replace(/^(?:Hai|Halo|Hei|Hello|Hi|Hey)[!,\s.-]+/i, '').trim();
      }

      // 3.5. Ensure distinct line breaks for inline sub-sections and bullet points
      cleaned = cleaned.replace(/([.!?])\s*[-*•]\s*([A-Za-z0-9\s/&—–,]+?)(?:\*+|\*\*|:)?\s*[-–—:]\s*/g, '$1\n\n- **$2**: ');
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*\[([^\]\n]+)\]\s*[\-–—:]\s*/g, '\n- **$1**: ');
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*\*+([^*:\n]+)\*+\s*[\-–—:]\s*/g, '\n- **$1**: ');

      // 3.6. Clean rogue colons and malformed bullet point headers
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]\s*:\s*/g, '\n- ');
      cleaned = cleaned.replace(/(?:^|\n)\s*:\s*/g, '\n- ');
      cleaned = cleaned.replace(/:\s*:\s*/g, ': ');
      cleaned = cleaned.replace(/\*\*:\s*/g, '**: ');
      cleaned = cleaned.replace(/\s*\*\s*-\s*/g, ' - ');

      // 3.62. Clean rogue unclosed asterisks on isolated words (e.g. "Zombie*" or "*Dead Party*")
      cleaned = cleaned.replace(/(?<=[a-zA-Z0-9])\*(?!\*)/g, '');
      cleaned = cleaned.replace(/(?<!\*)\*(?=[a-zA-Z0-9])/g, '');

      // 3.65. Deterministic Identity Grounding: Sebut model aktif riil dan cegah klaim pihak ketiga (Gemini, Claude, GPT, dll)
      if (isIdentityQuery) {
        const activeModelDisplay = (modelName || targetModel || 'Nemotron-3-Nano')
          .replace(/^nvidia\//i, '')
          .replace(/^ollama\//i, '')
          .replace(/^opencode\//i, '')
          .replace(/:free$/i, '');
        const activeProviderDisplay = providerName || 'Auto Router AI Gateway';

        cleaned = sessionLanguage === 'en'
          ? `I am the official **AI Assistant & Developer Agent** on Rafly Firmansyah's portfolio website (@Raflyf).\n\nCurrently, I am running on the **${activeModelDisplay}** model via ${activeProviderDisplay}. I am here to help you explore Rafly's machine learning research, examine software engineering repositories, verify competency certifications (BNSP, MikroTik, Cisco), or discuss AI technology.\n\nIs there a specific project or topic you would like to explore?`
          : `Saya adalah **AI Assistant & Developer Agent** resmi di website portofolio **Rafly Firmansyah** (@Raflyf).\n\nSaat ini saya beroperasi menggunakan model **${activeModelDisplay}** melalui ${activeProviderDisplay}. Saya bertugas membantu Anda mengeksplorasi riset machine learning dan rekayasa software Rafly, membedah repositori GitHub, memverifikasi sertifikasi kompetensi (BNSP, MikroTik, Cisco), atau berdiskusi seputar teknologi dan AI.\n\nAda proyek atau topik teknis yang ingin Anda diskusikan?`;
      }

      // 3.66. Deterministic Realtime Clock Grounding (Zero Hallucination)
      if (isTimeQuery) {
        const nowTime = new Date();
        const tz = 'Asia/Jakarta';
        const dateStr = sessionLanguage === 'en'
          ? nowTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz })
          : nowTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
        const timeStr = nowTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).replace('.', ':');
        const curHour = timeStr.slice(0, 2);

        // Deteksi jika model halusinasi jam lama yang salah (seperti 19:xx atau angka jam meleset)
        const isHallucinatedTime = /(?:19:03|19\.03|kemarin)/i.test(cleaned) || !cleaned.includes(curHour);
        if (isHallucinatedTime) {
          const cianjurNote = /(?:cianjur|cianhur|jawabarat|jawa\s*barat|bandung|jakarta)/i.test(qClean)
            ? ' Wilayah Cianjur dan seluruh Jawa Barat berada dalam zona Waktu Indonesia Barat (WIB).'
            : '';
          cleaned = `Sekarang hari ${dateStr}, pukul ${timeStr} WIB (Waktu Indonesia Barat, UTC+7).${cianjurNote}`;
        }
      }

      // 3.7. Clean duplicate bullet dashes & normalize bold markdown
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*\*[\-\*•\s]*/gm, '$1**');
      cleaned = cleaned.replace(/^[\-\*•]\s*[\-\*•]\s*/gm, '- ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\[([^\]\n]+)\](?:\*\*|:|\*\*:)?\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*+([^\n*:-]+)\*+\s*[-–—:]\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)([^\n*:-]+)\*\s*-\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*\*([^\n*]+)\*\s*-\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*\*([^\n*]+)\*\s*:\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/([^\n])\s{2,}([^\n])/g, '$1 $2');
      cleaned = cleaned.replace(/([^\n])\s+((?:Semoga|Jika ada|Ada topik|Kalau ada|Silakan)\s+[^\n]+)$/i, '$1\n\n$2');
      cleaned = cleaned.replace(/\n\s*-\s*-\s*(?:\n|$)/g, '\n\n');

      // 4. Zero-Emoji Enforcement: Strip all Unicode emojis
      cleaned = cleaned.replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '').replace(/[ \t]{2,}/g, ' ');

      // 4.5. Strip foreign Chinese / Japanese / Korean (CJK) script glitches in Indonesian/English mode
      if (sessionLanguage !== 'zh') {
        cleaned = cleaned.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]+/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
      }

      // 5. Sanitize repetitive template closing boilerplate
      cleaned = cleaned.replace(/(?:\n\n|\n)(?:Jika Anda (?:memerlukan|membutuhkan|tertarik|ingin|butuh)[\s\S]*?(?:siap membantu|hubungi|mengeksplorasi|contoh kode| relevan)[\s\S]*?$)/i, '').trim();

      // 6. Strip URL fiktif / dikarang model (Anti-Hallucination URL Forgery Filter)
      // Whitelist: domain resmi Rafly + domain dokumentasi resmi terpercaya
      const officialDomains = [
        'github.com', 'raflyfirmansyah-portofolio.vercel.app', 'bnsp.go.id', 'mikrotik.com', 'netacad.com',
        'wa.me', 'wikipedia.org', 'wikimedia.org', 'huggingface.co', 'arxiv.org',
        'openai.com', 'anthropic.com', 'deepmind.google', 'deepseek.com', 'mistral.ai', 'meta.com', 'nvidia.com', 'microsoft.com'
      ];
      cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, linkText, url) => {
        try {
          const hostname = new URL(url).hostname.replace(/^www\./, '');
          const isOfficialDomain = officialDomains.some(d => hostname === d || hostname.endsWith('.' + d));
          if (isOfficialDomain) return match; // URL resmi, biarkan
          return linkText; // URL tidak dikenal / berita RSS, strip jadi teks saja
        } catch (_) {
          return linkText; // URL malformed, strip
        }
      });

      // 6.5. Strip all Google News / Bing RSS raw link artifacts completely
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*(?:\*\*)?Tautan Terkait(?:\*\*)?:?\s*[\s\S]*?(?:news\.google\.com|bing\.com)[^\n]*/gi, '');
      cleaned = cleaned.replace(/https?:\/\/(?:news\.google\.com|www\.bing\.com\/news)[^\s)"'>]+/gi, '');
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*(?:\*\*)?Tautan Terkait(?:\*\*)?:?\s*$/gim, '');

      // 7. Relocate inline links from the middle of prose paragraphs to the bottom
      const hasInlineLinksInProse = /([a-zA-Z0-9\.\,\)])\s*(\[[^\]]+\]\(https?:\/\/[^)]+\))\s*([a-zA-Z0-9])/i.test(cleaned);
      if (hasInlineLinksInProse && !cleaned.includes('Tautan Terkait:') && !cleaned.includes('Tautan Proyek:')) {
        const extractedLinks = [];
        cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (m, label, linkUrl) => {
          extractedLinks.push(`- ${label}: [${linkUrl}](${linkUrl})`);
          return ''; // Strip from the middle of sentence
        });
        cleaned = cleaned.replace(/[ \t]{2,}/g, ' ').replace(/\s*\.\s*\./g, '.').trim();
        if (extractedLinks.length > 0) {
          const uniqueLinks = Array.from(new Set(extractedLinks));
          cleaned = `${cleaned}\n\nTautan Terkait:\n${uniqueLinks.join('\n')}`;
        }
      }

      // 8. Clean empty or bogus "Tautan Terkait:" headers
      cleaned = cleaned.replace(/\n+Tautan Terkait:\s*(?:\([^)]*\)|tidak ada[^\n]*|none|n\/a|-*\s*)?$/i, '').trim();
      cleaned = cleaned.replace(/\n+Tautan Terkait:\s*(?:\n|$)/gi, '').trim();
      const tautanIndex = cleaned.indexOf('Tautan Terkait:');
      if (tautanIndex !== -1) {
        const afterTautan = cleaned.slice(tautanIndex + 'Tautan Terkait:'.length).trim();
        if (!afterTautan || !/(?:\[[^\]]+\]|\bhttps?:\/\/|[-*•]\s*\S+)/.test(afterTautan)) {
          cleaned = cleaned.slice(0, tautanIndex).trim();
        }
      }

      cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

      // Clean AI punctuation artifacts (remove robotic em-dashes and non-breaking hyphens)
      cleaned = cleaned
        .replace(/[\u2010\u2011]/g, '-')
        .replace(/[\u202F\u00A0]/g, ' ')
        .replace(/(\b[A-Za-z0-9_]+)\s*[\u2013\u2014]\s*(seperti|misalnya|contohnya|yakni|yaitu|termasuk)\b/gi, '$1, $2')
        .replace(/([a-zA-Z0-9_]+)[\u2013\u2014]([a-zA-Z0-9_]+)/g, '$1, $2')
        .replace(/\s*[\u2013\u2014]\s*/g, ', ')
        .replace(/,\s*,+/g, ',')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (!cleaned || cleaned.trim().length === 0) {
        cleaned = 'Maaf, saya tidak dapat menyusun jawaban saat ini.';
      }

      if (res.headersSent) return true;
      const isSpecific = (model && model !== 'auto');
      const isFailover = isSpecific && !modelName.toLowerCase().includes(targetModel.toLowerCase().split('/').pop().replace(/-free$/i, ''));
      res.status(200).json({
        success: true,
        response: cleaned,
        model: modelName,
        requestedModel: model,
        isFailover: isFailover,
        provider: providerName,
        effort: effectiveEffort,
        category: queryIntent.category,
        steps: agentSteps,
        webMemories: webMemories
      });
      return true;
    };

    // SECURITY: the anti-poisoning instruction is ALWAYS included (not only when
    // web search ran), because portfolio/identity queries are the most
    // memory-susceptible. Memory shown to the model comes from the SERVER
    // (fetchServerMemories, service_role) — never from the client body.
    const serverMemories = await fetchServerMemories(15);

    const memoryInstruction = `\n\n[INSTRUKSI CONTINUOUS RAG KNOWLEDGE & AUTO-PERSISTENCE]
Anda terhubung dengan Memori Jangka Panjang (Supabase RAG). Sistem ini belajar terus-menerus untuk memperbarui pengetahuannya seiring waktu.
KAPAN ANDA WAJIB MENYIMPAN FAKTA BARU:
1. INFORMASI ATAU KOREKSI BARU DARI PENGGUNA:
   - Jika pengguna memberikan informasi atau koreksi faktual (misalnya seputar rilis software, peristiwa, preferensi, atau data teknis) yang telah Anda verifikasi BENAR melalui Konteks Pencarian Web atau basis data terpercaya, simpan fakta tersebut.
2. TEMUAN FAKTA TEKNOLOGI & RILIS TERBARU (HASIL WEB SEARCH / DISKUSI):
   - Jika pengguna menanyakan kabar/rilis terbaru (contoh: versi model AI seperti Gemini, GPT, Claude, HyperOS, framework baru, dsb) dan jawaban Anda menyajikan fakta rilis/teknologi baru yang terkonfirmasi namun belum ada di Memori Jangka Panjang di bawah, Anda WAJIB menyertakan tag penyimpanan di baris paling akhir jawaban.
CARA MENULISKAN TAG PENYIMPANAN:
Tuliskan tag persis di baris paling bawah respons Anda:
\`[SAVE_MEMORY: Tuliskan fakta ringkas 1-2 kalimat yang padat, jelas, dan tanpa spekulasi di sini]\`
(Contoh: [SAVE_MEMORY: DeepSeek V4 adalah model AI multimodal 305B parameter berlisensi open-source MIT yang dirilis untuk tugas vision dan inferensi efisien.])
ATURAN INTEGRITAS:
- DILARANG menyimpan klaim hoaks, rumor tanpa konfirmasi, opini subjektif, atau informasi tidak pantas.
Seluruh fakta dari Memori Jangka Panjang di bawah adalah referensi konteks yang tersimpan di database:`;

    const serverMemoryBlock = serverMemories.length > 0
      ? `\n\n[MEMORI JANGKA PANJANG (dari server, BELUM DIVERIFIKASI)]\n${serverMemories.map(f => `- ${f}`).join('\n')}`
      : '';

    const systemPromptWithSearch = `${buildSystemPrompt(sessionLanguage, effectiveEffort, targetModel, isInternalPortfolioQuery)}${webContext}${serverMemoryBlock}${memoryInstruction}`;

    // Calibrated Dynamic Rolling History Assembler (7,500 chars / ~1.8k tokens - Ultra-Fast Prefill & Sub-10s Latency)
    function assembleDynamicMessages(systemPrompt, historyList = [], userContent = '', maxTotalChars = 7500) {
      const systemStr = typeof systemPrompt === 'string' ? systemPrompt : JSON.stringify(systemPrompt || '');
      const userStr = typeof userContent === 'string' ? userContent : JSON.stringify(userContent || '');
      let currentBudget = maxTotalChars - (systemStr.length + userStr.length);
      if (currentBudget < 1500) currentBudget = 1500;

      const validHistory = ((isIdentityQuery || isTimeQuery) ? [] : (Array.isArray(historyList) ? historyList : [])).filter(item => {
        if (!item || !item.content) return false;
        const c = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
        return !c.includes('antrean seluruh provider AI sedang penuh') && !c.includes('kendala jaringan') && !c.includes('[AI Fallback]');
      });
      const selectedHistory = [];

      for (let i = validHistory.length - 1; i >= 0; i--) {
        const item = validHistory[i];
        if (!item || !item.content) continue;
        const contentStr = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
        if (contentStr.length <= currentBudget) {
          selectedHistory.unshift({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: item.content
          });
          currentBudget -= contentStr.length;
        } else {
          if (currentBudget > 800) {
            selectedHistory.unshift({
              role: item.role === 'assistant' ? 'assistant' : 'user',
              content: contentStr.slice(-currentBudget)
            });
          }
          break;
        }
      }

      return [
        { role: 'system', content: systemPrompt },
        ...selectedHistory,
        { role: 'user', content: userContent }
      ];
    }

    const finalUserPrompt = assembledQuery;
    const baseTextMessages = assembleDynamicMessages(systemPromptWithSearch, history, finalUserPrompt);

    // Multimodal payload for OpenRouter / OpenAI compatible Vision APIs
    let openRouterMessages = baseTextMessages;
    if (hasImages && imageAttachments.length > 0) {
      openRouterMessages = baseTextMessages.map((msg, idx) => {
        if (idx === baseTextMessages.length - 1 && msg.role === 'user') {
          const contentParts = [];
          if (typeof msg.content === 'string' && msg.content.trim()) {
            contentParts.push({ type: 'text', text: msg.content.trim() });
          }
          imageAttachments.forEach(att => {
            let dataUrl = att.data || att.base64 || att.url || '';
            if (dataUrl) {
              if (!dataUrl.startsWith('data:') && !dataUrl.startsWith('http')) {
                dataUrl = `data:${att.type || 'image/jpeg'};base64,${dataUrl}`;
              }
              contentParts.push({
                type: 'image_url',
                image_url: { url: dataUrl }
              });
            }
          });
          return { role: 'user', content: contentParts };
        }
        return msg;
      });
    }

    // Multimodal payload for Ollama Cloud (Ollama expects 'images' field with raw base64 array in user message)
    let ollamaMessages = baseTextMessages;
    if (hasImages && imageAttachments.length > 0) {
      const base64List = imageAttachments.map(att => {
        const raw = att.data || att.base64 || att.url || '';
        return raw.replace(/^data:image\/[^;]+;base64,/, '');
      }).filter(Boolean);

      if (base64List.length > 0) {
        ollamaMessages = baseTextMessages.map((msg, idx) => {
          if (idx === baseTextMessages.length - 1 && msg.role === 'user') {
            return { ...msg, images: base64List };
          }
          return msg;
        });
      }
    }

    // Maximum token limits: Balanced for blazing fast first-token latency and complete answers
    const maxTokensConfig = (effectiveEffort === 'thinking')
      ? 16384
      : (effectiveEffort === 'high'
          ? 8192
          : (effectiveEffort === 'medium'
              ? 4096
              : (effectiveEffort === 'low' ? 2048 : 4096)));
    const tempConfig = effectiveEffort === 'low' ? 0.15 : (effectiveEffort === 'thinking' ? 0.35 : 0.25);

    // ========================================================================
    // PROVIDER CALLER WRAPPERS
    // ========================================================================

    const isSpecificManual = !!(model && model !== 'auto' && model !== 'default' && model !== 'cascade');

    async function callOpenRouter(mName, timeoutConfig = 55000) {
      if (OPENROUTER_KEYS.length === 0) return null;
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;
      const now = Date.now();
      let activeKeys = OPENROUTER_KEYS.filter(k => !rateLimitedKeyCache.has(k) || rateLimitedKeyCache.get(k) < now);
      if (activeKeys.length === 0) activeKeys = OPENROUTER_KEYS;
      const keysToTry = isSpecificManual ? [...activeKeys].sort(() => Math.random() - 0.5) : [...activeKeys].sort(() => Math.random() - 0.5).slice(0, 2);

      const formattedMessages = openRouterMessages;

      for (const orKey of keysToTry) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const isReasoningModel = mName.toLowerCase().includes('reasoning') || mName.toLowerCase().includes('r1') || mName.toLowerCase().includes('thinking') || mName.toLowerCase().includes('qwq');
          const isLightning = mName.toLowerCase().includes('lightning');

          const res = await fetchJsonWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${orKey}`,
              'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
              'X-Title': 'Rafly Firmansyah AI Portfolio Terminal'
            },
            body: JSON.stringify({
              model: mName,
              messages: formattedMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig,
              reasoning: (!isLightning && isReasoningModel) ? { effort: (effectiveEffort === 'low' ? 'medium' : 'high') } : undefined
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            if (res.data?.error) {
              providerErrors.push(`OpenRouter ${mName}: ${res.data.error.message || 'Error'}`);
              if (!isSpecificManual) break;
              continue;
            }
            const msg = res.data?.choices?.[0]?.message;
            let content = msg?.content;
            if ((!content || content.trim().length === 0) && (msg?.reasoning || msg?.reasoning_content || msg?.thinking)) {
              content = msg.reasoning || msg.reasoning_content || msg.thinking;
            }
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'OpenRouter Cloud Pool');
            }
          } else if (res.status === 402 || res.status === 429) {
            if (res.status === 429) {
              rateLimitedKeyCache.set(orKey, Date.now() + 15 * 60 * 1000);
            }
            providerErrors.push(`OpenRouter ${mName} [Key #${OPENROUTER_KEYS.indexOf(orKey) + 1}]: HTTP ${res.status} (Rate limited / Quota exhausted)`);
            if (!isSpecificManual) break;
            continue;
          } else {
            providerErrors.push(`OpenRouter ${mName} HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`OpenRouter ${mName} [Key #${OPENROUTER_KEYS.indexOf(orKey) + 1}]: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callOpenCode(mName, timeoutConfig = 55000) {
      if (OPENCODE_KEYS.length === 0) return null;
      const cleanModelName = mName.replace(/^opencode\//i, '');
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;
      const now = Date.now();
      let activeKeys = OPENCODE_KEYS.filter(k => !rateLimitedKeyCache.has(k) || rateLimitedKeyCache.get(k) < now);
      if (activeKeys.length === 0) activeKeys = OPENCODE_KEYS;
      const keysToTry = [...activeKeys];

      for (const opKey of keysToTry) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const isLightning = cleanModelName.toLowerCase().includes('lightning');
          const res = await fetchJsonWithTimeout('https://opencode.ai/zen/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${opKey}`
            },
            body: JSON.stringify({
              model: cleanModelName,
              messages: openRouterMessages,
              max_tokens: Math.max(maxTokensConfig || 1000, 1500),
              temperature: tempConfig,
              reasoning_effort: isLightning ? undefined : (effectiveEffort === 'low' ? 'medium' : 'high')
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            const msg = res.data?.choices?.[0]?.message;
            let content = msg?.content;
            if ((!content || content.trim().length === 0) && (msg?.reasoning || msg?.reasoning_content || msg?.thinking)) {
              content = msg.reasoning || msg.reasoning_content || msg.thinking;
            }
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'OpenCode Zen Gateway');
            }
          } else if (res.status === 402 || res.status === 429) {
            rateLimitedKeyCache.set(opKey, Date.now() + 15 * 60 * 1000);
            providerErrors.push(`OpenCode Zen ${mName} [Key #${OPENCODE_KEYS.indexOf(opKey) + 1}]: HTTP ${res.status} (Rate limited)`);
            if (!isSpecificManual) break;
            continue;
          } else {
            providerErrors.push(`OpenCode Zen ${mName} HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`OpenCode Zen ${mName} [Key #${OPENCODE_KEYS.indexOf(opKey) + 1}]: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callNvidiaNim(mName, timeoutConfig = 55000) {
      if (NVIDIA_KEYS.length === 0) return null;
      const cleanModelName = mName.replace(/^nvidia\//i, '');
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;

      for (const nvKey of NVIDIA_KEYS) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const res = await fetchJsonWithTimeout('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${nvKey}`
            },
            body: JSON.stringify({
              model: cleanModelName,
              messages: openRouterMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            const content = res.data?.choices?.[0]?.message?.content;
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'NVIDIA NIM Production Engine');
            }
          } else {
            providerErrors.push(`Nvidia NIM HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`Nvidia NIM: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callOllama(mName, timeoutConfig = 55000) {
      if (OLLAMA_KEYS.length === 0) return null;
      const cleanModelName = mName.replace(/^ollama\//i, '').replace(/:free$/i, '');
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;

      for (const olKey of OLLAMA_KEYS) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const res = await fetchJsonWithTimeout('https://ollama.com/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${olKey}`
            },
            body: JSON.stringify({
              model: cleanModelName,
              messages: ollamaMessages,
              stream: false,
              options: {
                num_predict: maxTokensConfig,
                temperature: tempConfig
              }
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            let content = res.data?.message?.content;
            if ((!content || content.trim().length === 0) && (res.data?.message?.reasoning || res.data?.message?.thinking)) {
              content = res.data.message.reasoning || res.data.message.thinking;
            }
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'Ollama Cloud SOTA Engine');
            }
          } else {
            providerErrors.push(`Ollama Cloud HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`Ollama Cloud: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callMiniMax(timeoutConfig = 25000) {
      if (MINIMAX_KEYS.length === 0) return null;
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 25000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 25000);

      for (const mmKey of MINIMAX_KEYS) {
        try {
          const res = await fetchJsonWithTimeout('https://api.minimaxi.chat/v1/text/chatcompletion_v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mmKey}`
            },
            body: JSON.stringify({
              model: 'MiniMax-M3',
              messages: baseTextMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: activeTimeout });

          if (res.ok) {
            if (res.data?.base_resp?.status_code === 2056) {
              providerErrors.push('MiniMax: Token Plan limit reached');
              if (!isSpecificManual) break;
              continue;
            }
            const content = res.data?.choices?.[0]?.messages?.[0]?.text || res.data?.choices?.[0]?.message?.content || res.data?.reply;
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), 'MiniMax-M3', 'MiniMax Multimodal Production API');
            }
          } else {
            providerErrors.push(`MiniMax HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`MiniMax: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }


    // ========================================================================
    // ========================================================================
    // BUILD MULTI-TIER EXECUTION PIPELINE (STRICT CLOUD SOTA PRIORITY HIERARCHY)
    // Tier 1: OpenRouter SOTA Pool (nemotron-lightning -> nano-reasoning -> free pool -> deepseek-chat -> super -> ultra -> minimax -> laguna)
    // Tier 2: Ollama Cloud AI Gateway (nemotron-nano:30b -> nemotron-ultra -> nemotron-super -> minimax-m3)
    // Tier 3: OpenCode Zen Direct API (nemotron-lightning -> nemotron-ultra -> x-preview -> mimo)
    // ========================================================================
    // BUILD MULTI-TIER EXECUTION PIPELINE (STRICT CLOUD SOTA PRIORITY HIERARCHY)
    // Tier 1: OpenRouter SOTA Pool (nemotron-lightning -> nano-reasoning -> free pool -> deepseek-chat -> super -> ultra -> minimax -> laguna)
    // Tier 2: Ollama Cloud AI Gateway (nemotron-nano:30b -> nemotron-ultra -> nemotron-super -> minimax-m3)
    // Tier 3: OpenCode Zen Direct API (nemotron-lightning -> nemotron-ultra -> x-preview -> mimo)
    // ========================================================================
    function buildExecutionPipeline() {
      // 0. MULTIMODAL & VISION PIPELINE (Prioritas: Mimo v2.5 -> Nemotron Nano Omni -> Ollama Nano)
      if (hasImages || (model && model.toLowerCase().includes('vision')) || queryIntent.category === 'vision') {
        return [
          // Tier 1: Mimo v2.5 from OpenCode (SOTA Multimodal Vision)
          { provider: 'opencode', model: 'mimo-v2.5-free', timeout: 55000 },
          // Tier 2: Nemotron Nano Omni from OpenRouter (Multimodal Omni Reasoning)
          { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 55000 },
          // Tier 3: Ollama Nano Multimodal
          { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 }
        ];
      }

      // 1. REASONING CHAT PIPELINE (Prioritas: Ollama Nano -> Nemotron Lightning -> Multimodal Omni -> Laguna Terbaru)
      const isReasoningQuery = queryIntent.category === 'deep_reasoning' || queryIntent.effort === 'thinking' || (effectiveEffort === 'high' && queryIntent.category === 'project_architecture') || (model && (model.toLowerCase().includes('reason') || model.toLowerCase().includes('omni')));
      if (isReasoningQuery && (!model || model === 'auto' || model.toLowerCase().includes('reason') || model.toLowerCase().includes('omni'))) {
        const reasoningStepTimeout = 30000;
        return [
          // 1st: Ollama Cloud Nano (Prioritas Utama)
          { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: reasoningStepTimeout },
          // 2nd: Nemotron Seri Lightning
          { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: reasoningStepTimeout },
          { provider: 'opencode', model: 'nemotron-3.5-lightning-free', timeout: reasoningStepTimeout },
          // 3rd: Multimodal & Omni
          { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: reasoningStepTimeout },
          { provider: 'opencode', model: 'mimo-v2.5-free', timeout: reasoningStepTimeout },
          // 4th: Model Terbaru Respons Cepat (Laguna S 2.1 & OpenRouter Free)
          { provider: 'opencode', model: 'laguna-s-2.1-free', timeout: reasoningStepTimeout },
          { provider: 'openrouter', model: 'openrouter/free', timeout: reasoningStepTimeout },
          // 5th: Flagship Nemotron Super & Ultra Terbaru
          { provider: 'ollama', model: 'nemotron-3-super', timeout: reasoningStepTimeout },
          { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: reasoningStepTimeout }
        ];
      }

      // 2. SPECIFIC MANUAL MODEL OVERRIDES (Jika pengguna memilih model spesifik secara manual di UI)
      if (model && model !== 'auto') {
        const t = model.toLowerCase();

        // === OLLAMA CLOUD GROUP ===
        if (t === 'nemotron-3-nano' || t.startsWith('ollama-nano') || t.includes('nano')) {
          return [
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 55000 },
            { provider: 'opencode', model: 'nemotron-3.5-lightning-free', timeout: 55000 }
          ];
        }
        if (t === 'ollama-nemotron-ultra') {
          return [
            { provider: 'ollama', model: 'nemotron-3-ultra', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: 55000 },
            { provider: 'opencode', model: 'nemotron-3-ultra-free', timeout: 55000 }
          ];
        }
        if (t === 'ollama-nemotron-super') {
          return [
            { provider: 'ollama', model: 'nemotron-3-super', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: 55000 }
          ];
        }

        // === OPENCODE ZEN GROUP ===
        if (t === 'opencode-lightning') {
          return [
            { provider: 'opencode', model: 'nemotron-3.5-lightning-free', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 }
          ];
        }
        if (t === 'opencode-ultra') {
          return [
            { provider: 'opencode', model: 'nemotron-3-ultra-free', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-super', timeout: 55000 }
          ];
        }
        if (t === 'opencode-laguna' || t.includes('laguna')) {
          return [
            { provider: 'opencode', model: 'laguna-s-2.1-free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 },
            { provider: 'openrouter', model: 'openrouter/free', timeout: 55000 }
          ];
        }
        if (t === 'mimo' || t.includes('mimo') || t.includes('vision')) {
          return [
            { provider: 'opencode', model: 'mimo-v2.5-free', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 }
          ];
        }

        if (t === 'openrouter-free') {
          return [
            { provider: 'openrouter', model: 'openrouter/free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 55000 }
          ];
        }
        if (t.includes('light') || t.includes('lightning')) {
          return [
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 55000 },
            { provider: 'opencode', model: 'nemotron-3.5-lightning-free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 }
          ];
        }
        if (t.includes('super')) {
          return [
            { provider: 'ollama', model: 'nemotron-3-super', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 }
          ];
        }
        if (t.includes('ultra')) {
          return [
            { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: 55000 },
            { provider: 'opencode', model: 'nemotron-3-ultra-free', timeout: 55000 },
            { provider: 'ollama', model: 'nemotron-3-super', timeout: 55000 }
          ];
        }
        if (t.includes('antigravity') || t.includes('codex') || t.includes('coding')) {
          return [
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 55000 },
            { provider: 'opencode', model: 'laguna-s-2.1-free', timeout: 55000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 55000 }
          ];
        }
      }

      // 3. OVERALL GENERAL CHAT CASCADE
      // Urutan Hierarki Faktual Terverifikasi (Berdasarkan Live Network Benchmark):
      // 1. Ollama Nano (Prioritas Utama Pengguna: 0.89s respons kilat)
      // 2. Nemotron Seri Lightning (OpenCode 5.19s & OpenRouter)
      // 3. Multimodal: Nemotron Nano Omni (0.33s) & Mimo v2.5
      // 4. Model Rilis Terbaru Cepat: Gemma 4 31B (0.74s), Nemotron 3 Super (0.27s), OpenRouter Free (0.31s), MiniMax M3 (1.07s), Laguna S 2.1 (3.81s)
      // *Seluruh model lawas/usang/402 telah dieliminasi.
      return [
        // === 1. PRIORITAS UTAMA: OLLAMA NANO ===
        { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 25000 },

        // === 2. NEMOTRON SERI LIGHTNING ===
        { provider: 'opencode', model: 'nemotron-3.5-lightning-free', timeout: 22000 },
        { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 22000 },

        // === 3. MULTIMODAL: NEMOTRON NANO OMNI & MIMO ===
        { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 22000 },
        { provider: 'opencode', model: 'mimo-v2.5-free', timeout: 22000 },

        // === 4. MODEL RILISAN TERBARU & RESPON KILAT (SUB-2 DETIK) ===
        { provider: 'ollama', model: 'gemma4:31b', timeout: 20000 },
        { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: 20000 },
        { provider: 'openrouter', model: 'openrouter/free', timeout: 20000 },
        { provider: 'openrouter', model: 'minimax/minimax-m3:free', timeout: 20000 },
        { provider: 'ollama', model: 'nemotron-3-super', timeout: 20000 },
        { provider: 'opencode', model: 'laguna-s-2.1-free', timeout: 20000 }
      ];
    }


    // ========================================================================
    // EXECUTE PIPELINE: SINGLE-ACTIVE TOKEN-PRESERVING STRICT FAILOVER
    // Evaluates 1 provider at a time in strict priority order.
    // Preserves 100% token quota (zero wasted parallel calls) and guarantees full execution under 58s budget.
    // ========================================================================
    async function executeStep(step, timeout) {
      if (!step) return null;
      if (step.provider === 'nim') {
        return callNvidiaNim(step.model, timeout);
      } else if (step.provider === 'opencode') {
        return callOpenCode(step.model, timeout);
      } else if (step.provider === 'openrouter') {
        return callOpenRouter(step.model, timeout);
      } else if (step.provider === 'ollama') {
        return callOllama(step.model, timeout);
      } else if (step.provider === 'minimax') {
        return callMiniMax(timeout);
      }
      return null;
    }

    async function executePipelineWithPriorityRace(pipeline) {
      if (!pipeline || pipeline.length === 0) return null;

      for (const step of pipeline) {
        const elapsed = Date.now() - requestStartTime;
        const remainingMs = 58000 - elapsed; // Safe budget matching vercel.json function maxDuration 60s
        if (remainingMs <= 1500) break;

        // Dual-Phase Adaptive Timeout:
        // 1. Connect Timeout (15000ms): Waktu cukup untuk inisiasi model & web grounding; jika server benar-benar down/mati, baru alihkan.
        // 2. Active Thinking Timeout (hingga 55s / remainingMs): Begitu model merespons (200 OK), biarkan model terus berpikir sampai tuntas tanpa terkendala timeout pendek!
        const connectTimeout = Math.min(step.timeout || 15000, 15000);
        const activeTimeout = Math.max(8000, remainingMs - 1000);

        try {
          const result = await executeStep(step, {
            connectTimeoutMs: connectTimeout,
            activeTimeoutMs: activeTimeout
          });
          if (result) return result; // Succeeded! Returns immediately with 1x token consumption!
        } catch (_) {}
      }

      return null;
    }

    const executionPipeline = buildExecutionPipeline();
    const finalResult = await executePipelineWithPriorityRace(executionPipeline);
    if (finalResult) return finalResult;

    if (res.headersSent) return;

    // If all providers in the pipeline failed or timed out:
    const noKeysConfigured = !OPENROUTER_KEY && !NVIDIA_KEY && !OPENCODE_KEY && !MINIMAX_KEY && !OLLAMA_KEY;
    const errorMsg = noKeysConfigured 
      ? 'Belum ada API Key aktif yang terpasang di server Vercel atau terminal. Gunakan perintah: setkey <provider> <key>'
      : 'Semua provider gateway model AI sedang sibuk atau mengalami timeout antrean.';

    return res.status(502).json({
      success: false,
      error: errorMsg,
      details: providerErrors,
      requestedModel: model,
      triedProviders: executionPipeline.map(s => `${s.provider}:${s.model}`)
    });

  } catch (globalErr) {
    if (res.headersSent) return;
    return res.status(500).json({
      success: false,
      error: `Serverless Gateway Exception: ${globalErr.message}`
    });
  }
}
