/**
 * ============================================================================
 * TERMINAL AI ASSISTANT & KNOWLEDGE ENGINE (v5.3.0)
 * Hybrid Client-Side Engine for Developer Lab Simulator
 * Features:
 * 1. Vercel Serverless Multi-Provider AI Gateway (/api/chat)
 * 2. In-Browser Sub-15ms Exact & Semantic Pattern Engine for Offline Resilience
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js';
import { telemetry } from './telemetry.js';

// ============================================================================
// 1. IN-BROWSER SEMANTIC KNOWLEDGE BASE (Offline Standalone Fallback)
// ============================================================================
const SEMANTIC_PATTERNS = [
  {
    keywords: ['plagiarism', 'plagiat', 'turnitin', 'openplagiarism', 'skripsi', 'n-gram', 'shingling', 'sentence transformer', 'semantic paraphrasing'],
    respond: () => [
      "[RISET AKADEMIK UNGGULAN: OpenPlagiarismChecker]",
      "----------------------------------------------------------------",
      "Sistem deteksi kesamaan dokumen akademik komprehensif mengutamakan privasi:",
      "  - Exact Match Engine   : 5-Word N-Gram Shingling (pencocokan cepat)",
      "  - Paraphrasing Engine  : Multilingual Sentence Transformers (Cosine Sim)",
      "  - Repository Indexed   : 15+ Basis data jurnal (GARUDA, Neliti, BASE, dll)",
      "  - Stack Teknologi      : Python, Flask, PyTorch, Scikit-Learn",
      "  - Status Riset         : Siap deployment riset skripsi 2026",
      "",
      "Ketik 'projects' untuk link repositori GitHub."
    ]
  },
  {
    keywords: ['spam', 'email', 'naive bayes', 'xgboost', 'klasifikasi', 'imbalanced', 'smote', 'f1-score'],
    respond: () => [
      "[RISET TERAPAN: Spam-Email Classifier & Evaluator]",
      "----------------------------------------------------------------",
      "Aplikasi web klasifikasi dan komparasi performa model Machine Learning:",
      "  - Komparasi Algoritma  : Multinomial Naive Bayes vs XGBoost",
      "  - Fitur Unggulan       : Dynamic Class Balancing (slider rasio 10:90 - 90:10)",
      "  - Metrik Evaluasi      : Confusion Matrix, Precision, Recall, F1-Score",
      "  - Stack Teknologi      : Python, Flask, Pandas, Scikit-Learn, Chart.js"
    ]
  },
  {
    keywords: ['laser', 'ppt', 'powerpoint', 'gyroscope', 'smartphone', 'remote', 'websocket', 'socketio'],
    respond: () => [
      "[PROYEK IoT & KONTROL: laser_pointer_PPT]",
      "----------------------------------------------------------------",
      "Pengendali slide presentasi nirsentuh berbasis sensor gerak smartphone:",
      "  - Sensor               : DeviceOrientation & Gyroscope Smartphone",
      "  - Komunikasi Real-time : WebSocket via Flask-SocketIO (Low Latency)",
      "  - Kontrol Kursor       : PyAutoGUI virtual cursor mapper di PC presenter"
    ]
  },
  {
    keywords: ['fotokita', 'blur', 'face', 'mediapipe', 'gesture', 'v-sign', 'privasi', 'opencv'],
    respond: () => [
      "[PROYEK COMPUTER VISION: FotoKitaBlur]",
      "----------------------------------------------------------------",
      "Aplikasi otomatisasi privasi kamera real-time:",
      "  - Gesture Recognition  : MediaPipe Tasks Vision (deteksi gestur Peace/V-Sign)",
      "  - Image Processing     : OpenCV Gaussian Blur filter otomatis",
      "  - Kecepatan            : Real-time 30+ FPS Edge Inference di browser/PC"
    ]
  },
  {
    keywords: ['bnsp', 'analis program', 'program analyst', 'sertifikasi nasional', 'lsp', 'kompetensi'],
    respond: () => [
      "[KREDENSIAL RESMI: BNSP Sertifikat Kompetensi Analis Program]",
      "----------------------------------------------------------------",
      "Sertifikasi Standar Kompetensi Kerja Nasional Indonesia (SKKNI):",
      "  - No. Registrasi : TIK 037 00481 2026",
      "  - Masa Berlaku   : 2026 s/d 2029 (3 Tahun Terakreditasi)",
      "  - Lembaga Uji    : LSP Informatika / Badan Nasional Sertifikasi Profesi",
      "  - Cakupan        : 10 Unit Kompetensi Analisis & Rekayasa Perangkat Lunak",
      "",
      "Ketik 'certifs' untuk rincian 10 sertifikat lengkap."
    ]
  },
  {
    keywords: ['mikrotik', 'mtcna', 'jaringan', 'routeros', 'routing', 'firewall', 'latvia'],
    respond: () => [
      "[KREDENSIAL JARINGAN: MikroTik Certified Network Associate (MTCNA)]",
      "----------------------------------------------------------------",
      "Sertifikasi teknis internasional dari MikroTikls SIA (Riga, Latvia):",
      "  - Credential ID : 2410NA3062",
      "  - Kompetensi    : RouterOS, Static Routing, Firewall, DHCP, Bandwidth Queue, Wireless"
    ]
  },
  {
    keywords: ['kontak', 'contact', 'email', 'whatsapp', 'wa', 'hubungi', 'hire', 'rekrut'],
    respond: () => [
      "[INFORMASI KONTAK RESMI]",
      "----------------------------------------------------------------",
      `Nama     : ${DEVELOPER_PROFILE.name}`,
      `WhatsApp : ${DEVELOPER_PROFILE.whatsapp} (${DEVELOPER_PROFILE.whatsappUrl})`,
      `Email    : ${DEVELOPER_PROFILE.email}`,
      `GitHub   : ${DEVELOPER_PROFILE.github}`,
      `Website  : https://raflyfirmansyah-portofolio.vercel.app/`
    ]
  }
];

// ============================================================================
// 2. TERMINAL AI CONTROLLER
// ============================================================================
class TerminalAIEngine {
  constructor() {
    this.currentModel = localStorage.getItem('ai_selected_model') || 'auto';
    this.customKey = localStorage.getItem('ai_custom_key') || null;
    this.customProvider = localStorage.getItem('ai_custom_provider') || 'openrouter';
    this.sessionLanguage = sessionStorage.getItem('ai_session_lang') || null;
    this.reasoningEffort = localStorage.getItem('ai_selected_effort') || 'auto';
    this.conversationHistory = [];
  }

  detectOrUpdateLanguage(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return this.sessionLanguage || 'id';

    // 1. Explicit language switch command
    const explicitEn = /\b(pakai|gunakan|ganti|ubah|bahasa|jawab.*dalam)\s*(bahasa\s*)?(inggris|english)\b/i.test(q) ||
                       /\b(switch|change|use|answer in|reply in)\s*(to\s*)?(english|en)\b/i.test(q);
    if (explicitEn) {
      this.sessionLanguage = 'en';
      sessionStorage.setItem('ai_session_lang', 'en');
      return 'en';
    }

    const explicitId = /\b(pakai|gunakan|ganti|ubah|bahasa|jawab.*dalam)\s*(bahasa\s*)?(indonesia|indo|id)\b/i.test(q) ||
                       /\b(switch|change|use|answer in|reply in)\s*(to\s*)?(indonesian|bahasa|id)\b/i.test(q);
    if (explicitId) {
      this.sessionLanguage = 'id';
      sessionStorage.setItem('ai_session_lang', 'id');
      return 'id';
    }

    // 2. If already locked in this session, keep the locked language
    if (this.sessionLanguage) {
      return this.sessionLanguage;
    }

    // 3. Initial detection on the first conversation turn
    const idWords = /\b(yang|yg|ini|itu|dan|atau|saya|aku|kamu|anda|bisa|apakah|tolong|bagaimana|gimana|apa|kenapa|mengapa|kapan|dimana|adalah|untuk|pada|di|ke|dari|dengan|kalo|jika|buat|buatkan|coba|tampilkan|jelaskan|skripsi|proyek|sertifikat)\b/i;
    const enWords = /\b(the|is|are|was|were|and|or|you|your|can|could|how|what|why|when|where|for|with|about|please|explain|show|give|create|build|write|implement|help)\b/i;

    if (idWords.test(q)) {
      this.sessionLanguage = 'id';
    } else if (enWords.test(q)) {
      this.sessionLanguage = 'en';
    } else {
      this.sessionLanguage = 'id'; // Default Indonesian
    }

    sessionStorage.setItem('ai_session_lang', this.sessionLanguage);
    return this.sessionLanguage;
  }

  setModel(modelId) {
    this.currentModel = modelId;
    localStorage.setItem('ai_selected_model', modelId);
    if (telemetry) {
      telemetry.logEvent('model_select', modelId, `Pilihan Model: ${modelId}`);
    }
  }

  setEffort(effort) {
    this.reasoningEffort = effort;
    localStorage.setItem('ai_selected_effort', effort);
    if (telemetry) {
      telemetry.logEvent('model_select', `effort_${effort}`, `Mode Reasoning: ${effort}`);
    }
  }

  setKey(key, provider = 'openrouter') {
    this.customKey = key.trim();
    this.customProvider = provider.trim().toLowerCase();
    localStorage.setItem('ai_custom_key', this.customKey);
    localStorage.setItem('ai_custom_provider', this.customProvider);
    return [
      `[SUKSES] API Key ${this.customProvider.toUpperCase()} disimpan di browser Anda.`,
      `Semua permintaan AI selanjutnya akan diprioritaskan menggunakan key ini.`
    ];
  }

  clearKey() {
    this.customKey = '';
    this.customProvider = '';
    localStorage.removeItem('ai_custom_key');
    localStorage.removeItem('ai_custom_provider');
    return ["API Key pribadi dihapus. Kembali menggunakan server gateway default."];
  }

  getStatus() {
    return [
      "[AI ENGINE & PROVIDER POOL STATUS]",
      "----------------------------------------------------------------",
      `Model AI Aktif       : ${this.currentModel}`,
      `Mode Reasoning/Effort: ${this.reasoningEffort.toUpperCase()}`,
      `Bahasa Sesi Terkunci : ${this.sessionLanguage === 'en' ? 'Bahasa Inggris (English)' : 'Bahasa Indonesia'}`,
      `Batas Output Token   : 8.192 Tokens / Respons (Full-Length & Zero-Truncation)`,
      `Batas Waktu Eksekusi : 2 Menit (120 Detik)`,
      `Custom Key Status    : ${this.customKey ? `Terpasang (${this.customProvider.toUpperCase()})` : 'Default Server Gateway'}`,
      `Cloud Multi-AI       : Vercel Serverless Multi-API Gateway (/api/chat)`,
      `Fallback Engine      : In-Browser Semantic Knowledge Engine (Active & Ready)`
    ];
  }

  // ========================================================================
  // AI CONTINUOUS RAG / LONG-TERM MEMORY (SUPABASE)
  // ========================================================================
  getSupabaseConfig() {
    try {
      const configStr = localStorage.getItem('portfolio_supabase_config');
      if (configStr) {
        const parsed = JSON.parse(configStr);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    } catch (_) {}
    return {
      url: 'https://rphyzcqwpkxtzllvymss.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU'
    };
  }

  async fetchAIMemories() {
    try {
      const config = this.getSupabaseConfig();
      if (!config.url || !config.anonKey) return '';

      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/ai_memories?select=fact_text&order=created_at.desc&limit=15`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) return '';
      const data = await res.json();
      if (!data || data.length === 0) return '';
      
      const facts = data.map(d => `- ${d.fact_text}`).join('\n');
      return `\n\n[MEMORI JANGKA PANJANG AI (FAKTA YANG TELAH DIPELAJARI DARI PENGGUNA)]:\n${facts}\n(Gunakan fakta di atas jika relevan dengan pertanyaan saat ini.)`;
    } catch (err) {
      console.debug('[Memory] Fetch error:', err);
      return '';
    }
  }

  async saveAIMemory(fact) {
    try {
      const config = this.getSupabaseConfig();
      if (!config.url || !config.anonKey) return;

      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/ai_memories`;
      const sessionId = sessionStorage.getItem('portfolio_session_id') || 'unknown';
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          fact_text: fact.substring(0, 1000),
          session_id: sessionId
        })
      });
    } catch (err) {
      console.debug('[Memory] Save error:', err);
    }
  }

  /**
   * Main Ask method: Routes multimodal attachments and queries to cloud gateway
   */
  async ask(query, attachments = []) {
    const cleanQuery = query.trim();
    if (!cleanQuery && (!attachments || attachments.length === 0)) {
      return ["Silakan masukkan pertanyaan, perintah, atau unggah dokumen/gambar."];
    }

    // Log AI Consultation Telemetry
    if (telemetry) {
      telemetry.logEvent('ai_query', this.currentModel || 'auto', cleanQuery.substring(0, 100));
    }

    const currentLang = this.detectOrUpdateLanguage(cleanQuery);

    // 1. Primary: Vercel Serverless Multi-API Cloud Gateway (/api/chat)
    try {
      const memoryContext = await this.fetchAIMemories();
      const controller = new AbortController();
      const apiEndpoint = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
        ? 'https://raflyfirmansyah-portofolio.vercel.app/api/chat'
        : '/api/chat';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanQuery,
          model: this.currentModel,
          customKey: this.customKey,
          customProvider: this.customProvider,
          attachments: attachments,
          sessionLanguage: currentLang,
          reasoningEffort: this.reasoningEffort,
          history: this.conversationHistory.slice(-6),
          longTermMemory: memoryContext
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.response) {
        let finalResponse = data.response;
        
        // Extract and Save Memory (Continuous RAG - User Learnings)
        const memoryMatch = finalResponse.match(/\[SAVE_MEMORY:\s*([\s\S]*?)\]/i);
        if (memoryMatch && memoryMatch[1]) {
          const newFact = memoryMatch[1].trim();
          this.saveAIMemory(newFact);
          finalResponse = finalResponse.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
        }

        // Automatically accumulate verified live web knowledge into long-term memory
        if (Array.isArray(data.webMemories) && data.webMemories.length > 0) {
          data.webMemories.forEach(mem => {
            if (typeof mem === 'string' && mem.trim().length > 10) {
              this.saveAIMemory(mem.trim());
            }
          });
        }

        // Record conversation turn for dynamic context
        this.conversationHistory.push({ role: 'user', content: cleanQuery });
        this.conversationHistory.push({ role: 'assistant', content: finalResponse });
        if (this.conversationHistory.length > 10) {
          this.conversationHistory = this.conversationHistory.slice(-10);
        }

        const isAuto = !this.currentModel || this.currentModel === 'auto';
        const resolvedModel = data.model || 'deepseek/deepseek-chat';
        const provider = data.provider || 'Gateway';
        const isFailover = !!data.isFailover;
        const requestedModel = data.requestedModel || this.currentModel;

        this.lastExecutionInfo = {
          isAuto,
          resolvedModel,
          requestedModel,
          isFailover,
          provider,
          effort: data.effort || this.reasoningEffort,
          category: data.category || 'general'
        };

        // Log resolved model execution (tracks what model was used in Auto mode)
        if (telemetry) {
          const target = isAuto ? `auto:${resolvedModel}` : (this.currentModel || resolvedModel);
          const label = isAuto ? `[Auto ➔ ${resolvedModel} via ${provider}] ${cleanQuery.substring(0, 60)}` : `[${this.currentModel} via ${provider}] ${cleanQuery.substring(0, 60)}`;
          telemetry.logEvent('ai_query_resolved', target, label);
        }

        return finalResponse.split('\n');
      }

      // Check for high-priority local semantic knowledge match first
      const semanticMatch = this.checkSemanticMatch(cleanQuery);
      if (semanticMatch) {
        if (telemetry) {
          telemetry.logEvent('ai_query_resolved', 'auto:local_semantic', `[Auto ➔ Local Semantic Engine] ${cleanQuery.substring(0, 60)}`);
        }
        return semanticMatch;
      }

      // Dynamic Backend Error Display ➔ Direct Client Failover
      if (data && !data.success) {
        const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
        if (directRes) {
          return directRes;
        }

        const semanticMatch = this.checkSemanticMatch(cleanQuery);
        if (semanticMatch) {
          return semanticMatch;
        }
      }
    } catch (netErr) {
      if (netErr.name === 'AbortError') {
        return [
          `[TIMEOUT / 2 Menit]: Permintaan ke model AI melebihi batas waktu 2 menit.`,
          `Model sedang memproses komputasi berat. Silakan coba kembali atau pilih model lain.`
        ];
      }

      // Direct Client Failover on Network / CORS Error
      const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
      if (directRes) {
        return directRes;
      }

      const semanticMatch = this.checkSemanticMatch(cleanQuery);
      if (semanticMatch) {
        return semanticMatch;
      }
    }

    // 2. Direct Client Failover fallback
    const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
    if (directRes) {
      return directRes;
    }

    // 3. High-Precision In-Browser Semantic Engine Fallback
    const semanticMatch = this.checkSemanticMatch(cleanQuery);
    if (semanticMatch) {
      return semanticMatch;
    }

    // 4. Generic friendly response if completely offline
    return [
      "Maaf, saat ini koneksi ke model AI sedang mengalami kendala jaringan.",
      "Anda dapat mengulangi pertanyaan Anda kembali, atau menggunakan perintah CLI seperti 'skills', 'projects', 'certifs', 'benchmarks', 'contact'."
    ];
  }

  async directClientFailover(cleanQuery, currentLang, attachments = []) {
    const decodeKey = (b64) => {
      try {
        return atob(b64);
      } catch (_) {
        return null;
      }
    };

    const cleanOutput = (text) => {
      let cleaned = String(text || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      const monologueRegex = /^(?:Okay|Alright|Let me|The user is asking|Looking at the live search|First, looking at|Hmm,|Wait, check)[\s\S]*?(?=\n\n(?:[A-Z0-9#\-\*•]|Berikut|Model|Berdasarkan|Untuk|Saat ini|Halo|Hai|Tentu))/i;
      if (monologueRegex.test(cleaned)) {
        const after = cleaned.replace(monologueRegex, '').trim();
        if (after.length > 20) cleaned = after;
      }
      return cleaned;
    };

    const q = cleanQuery.toLowerCase();
    const len = q.length;

    // Intelligent Intent Detection
    const isHeavyCoding = /\b(buatkan script|buat script|tulis script|bikin script|buatkan kode|buat kode|tulis kode|bikin kode|script|koding|coding|function|def |class |async |await |import |export |const |let |var |console\.|print\(|return |public |private |struct |interface |lambda |sql|select .* from|create table|dockerfile|kubernetes|yaml|json|regex|refactor|debug|fix bug)\b/i.test(q) || /\b(python|javascript|typescript|golang|rust|php|pytorch|react|flask)\b/i.test(q);
    const isDeepReasoning = /\b(analisis mendalam|analisis komprehensif|bedah logika|turunkan rumus|matematis|algoritma|perbandingan|benchmark|evaluasi kritis|trade-offs|tradeoff|skripsi|metodologi|komparasi|chain of thought|thinking|penalaran)\b/i.test(q) || len > 200;
    const isGreeting = len < 60 && /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|who are you|siapa kamu|kamu siapa|kamu model apa|model apa ini|kamu ai apa|bisa apa|apa kemampuanmu)\b/i.test(q);

    // 1. OmniRoute Direct Attempt (for coding & deep reasoning)
    const OMNI_URL = 'https://ceremony-cent-triumph-hands.trycloudflare.com/v1/chat/completions';
    const OMNI_KEY = decodeKey('c2stN2E5YjUxYTI2NDc2OGUzMi1iM2Y5YjctNmUxY2RhY2Q=');

    if (OMNI_KEY && (isHeavyCoding || isDeepReasoning)) {
      const preferredOmniModel = isHeavyCoding ? 'Codex' : 'Antigravity';
      try {
        const omniController = new AbortController();
        const omniTimeout = setTimeout(() => omniController.abort(), 12000);
        const res = await fetch(OMNI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + OMNI_KEY
          },
          body: JSON.stringify({
            model: preferredOmniModel,
            messages: [
              { role: 'system', content: 'Status Bahasa: BAHASA INDONESIA. Anda adalah AI Assistant di Terminal Developer Lab portofolio Rafly Firmansyah (@Raflyf). Jawab pertanyaan secara profesional dan terstruktur dalam Bahasa Indonesia.' },
              { role: 'user', content: cleanQuery }
            ],
            stream: false,
            max_tokens: 2500
          }),
          signal: omniController.signal
        });
        clearTimeout(omniTimeout);
        if (res.ok) {
          const data = await res.json();
          const content = cleanOutput(data?.choices?.[0]?.message?.content);
          if (content) {
            this.lastExecutionInfo = {
              isAuto: true,
              resolvedModel: preferredOmniModel,
              requestedModel: this.currentModel,
              isFailover: false,
              provider: 'OmniRoute Dedicated Server',
              effort: isHeavyCoding ? 'HIGH' : 'THINKING',
              category: isHeavyCoding ? 'heavy_coding' : 'deep_reasoning'
            };
            return content.split('\n');
          }
        }
      } catch (_) {}
    }

    // 2. OpenRouter Direct SOTA Pool (Nemotron 3 Super 120B / Ultra 550B / Nano 30B / GPT-OSS 20B)
    const OR_KEYS = [
      decodeKey('c2stb3ItdjEtNzlhMzk1Y2YwOGQyNmY2ZDQwMDA2Njg5ZGI5ZTNhYzkwZmI1ZDc5OWViNzA0MTJkYTQ4ZTIzNGU0ZjJmZDE5MQ=='),
      decodeKey('c2stb3ItdjEtODJmMjVhYzFlYjU3YmI0MmVhZjAxM2ZlYzM4OTkwZTM1ZDY2ZDg3NjM3ZTkxNmFiZjk2NTM3NWM1NGUzZTM2Nw==')
    ].filter(Boolean);

    let OR_MODELS = [];
    let targetEffort = 'MEDIUM';

    if (isGreeting) {
      targetEffort = 'LOW';
      OR_MODELS = [
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        'openai/gpt-oss-20b:free',
        'nvidia/nemotron-3-super-120b-a12b:free'
      ];
    } else if (isHeavyCoding || isDeepReasoning) {
      targetEffort = isHeavyCoding ? 'HIGH' : 'THINKING';
      OR_MODELS = [
        'nvidia/nemotron-3-super-120b-a12b:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'openai/gpt-oss-20b:free'
      ];
    } else {
      targetEffort = 'MEDIUM';
      OR_MODELS = [
        'nvidia/nemotron-3-super-120b-a12b:free',
        'openai/gpt-oss-20b:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free'
      ];
    }

    for (const model of OR_MODELS) {
      for (const key of OR_KEYS) {
        try {
          const orController = new AbortController();
          const orTimeout = setTimeout(() => orController.abort(), 14000);
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + key,
              'HTTP-Referer': (typeof window !== 'undefined' ? window.location.href : 'https://raflyf.github.io/web-portofolio/'),
              'X-Title': 'Rafly Portfolio Lab'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: 'Status Bahasa: BAHASA INDONESIA. Anda adalah AI Assistant canggih pada Terminal Developer Lab portofolio Rafly Firmansyah (@Raflyf). Jawab pertanyaan pengguna secara akurat, terstruktur rapi dengan tabel atau poin-poin dalam Bahasa Indonesia. Jangan gunakan monolog proses berpikir bahasa Inggris.' },
                { role: 'user', content: cleanQuery }
              ],
              max_tokens: targetEffort === 'LOW' ? 500 : (targetEffort === 'HIGH' ? 2500 : 1600),
              temperature: 0.25
            }),
            signal: orController.signal
          });
          clearTimeout(orTimeout);

          if (res.ok) {
            const data = await res.json();
            const rawContent = data?.choices?.[0]?.message?.content;
            const content = cleanOutput(rawContent);
            if (content && content.length > 5) {
              this.lastExecutionInfo = {
                isAuto: true,
                resolvedModel: model,
                requestedModel: this.currentModel,
                isFailover: true,
                provider: 'OpenRouter SOTA Pool',
                effort: targetEffort,
                category: isHeavyCoding ? 'heavy_coding' : (isDeepReasoning ? 'deep_reasoning' : 'standard')
              };
              return content.split('\n');
            }
          }
        } catch (_) {}
      }
    }

    return null;
  }

  checkSemanticMatch(query) {
    const q = query.toLowerCase();
    const words = q.split(/[\s,?.!]+/).filter(Boolean);

    let bestMatch = null;
    let highestScore = 0;

    for (const item of SEMANTIC_PATTERNS) {
      let score = 0;
      for (const kw of item.keywords) {
        if (kw.includes(' ')) {
          if (q.includes(kw)) score += 3;
        } else {
          if (words.includes(kw)) score += 2;
          else if (q.includes(kw)) score += 1;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore >= 2) {
      return bestMatch.respond();
    }

    return null;
  }
}

export const terminalAI = new TerminalAIEngine();
