/**
 * ============================================================================
 * TERMINAL AI ASSISTANT & KNOWLEDGE ENGINE (v5.3.0)
 * Hybrid Client-Side Engine for Developer Lab Simulator
 * Features:
 * 1. Vercel Serverless Multi-Provider AI Gateway (/api/chat)
 * 2. In-Browser Sub-15ms Exact & Semantic Pattern Engine for Offline Resilience
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js?v=10.100.0';
import { telemetry } from './telemetry.js?v=10.100.0';

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
    keywords: ['spam', 'email', 'complement naive bayes', 'naive bayes', 'cnb', 'xgboost', 'klasifikasi', 'imbalanced', 'concept drift', 'domain adaptation', 'f1-score'],
    respond: () => [
      "[RISET TERAPAN: Spam-Email Classifier & Evaluator]",
      "----------------------------------------------------------------",
      "Aplikasi web klasifikasi dan komparasi performa model Machine Learning:",
      "  - Komparasi Algoritma  : Complement Naive Bayes (CNB) vs XGBoost",
      "  - Domain Adaptation    : Penanganan fenomena Concept Drift pada dataset email modern",
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
    this.visitorId = this.getOrCreateVisitorId();
    try {
      const stored = localStorage.getItem(`terminal_ai_history_${this.visitorId}`) || sessionStorage.getItem('ai_session_history');
      this.conversationHistory = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(this.conversationHistory)) this.conversationHistory = [];
    } catch (_) {
      this.conversationHistory = [];
    }
    this.currentAbortController = null;
    this.isAborted = false;
  }

  getOrCreateVisitorId() {
    try {
      let vid = localStorage.getItem('terminal_visitor_id');
      if (!vid) {
        vid = 'vst_' + Array.from(crypto.getRandomValues(new Uint8Array(10))).map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('terminal_visitor_id', vid);
      }
      return vid;
    } catch (_) {
      return 'vst_default_client';
    }
  }

  saveHistoryToSession() {
    try {
      const payload = JSON.stringify(this.conversationHistory.slice(-500));
      localStorage.setItem(`terminal_ai_history_${this.visitorId}`, payload);
      sessionStorage.setItem('ai_session_history', payload);
    } catch (_) {}
  }

  clearHistory() {
    this.conversationHistory = [];
    try {
      localStorage.removeItem(`terminal_ai_history_${this.visitorId}`);
      sessionStorage.removeItem('ai_session_history');
    } catch (_) {}
  }

  abort() {
    this.isAborted = true;
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (_) {}
      this.currentAbortController = null;
      return true;
    }
    return false;
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
  }

  setEffort(effort) {
    this.reasoningEffort = effort;
    localStorage.setItem('ai_selected_effort', effort);
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
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json'
        },
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!res.ok) return '';
      const data = await res.json();
      if (!data || data.length === 0) return '';
      
      const facts = data
        .map(d => (d.fact_text || '').trim())
        .filter(t => t.length > 5 && !t.startsWith('[Q&A Context]') && !t.includes(' ➔ '))
        .slice(0, 8)
        .map(t => `- ${t}`)
        .join('\n');

      if (!facts) return '';
      return `\n\n[MEMORI JANGKA PANJANG AI (FAKTA YANG TELAH DIPELAJARI DARI PENGGUNA)]:\n${facts}\n(Gunakan fakta di atas sebagai wawasan tambahan jika relevan dengan pertanyaan saat ini.)`;
    } catch (err) {
      return '';
    }
  }

  saveAIMemory(fact) {
    try {
      const config = this.getSupabaseConfig();
      if (!config.url || !config.anonKey) return;

      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/ai_memories`;
      const sessionId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('portfolio_session_id')) || 'unknown';
      
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 2000);

      fetch(endpoint, {
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
        }),
        signal: ctrl.signal
      }).catch(() => {});
    } catch (_) {}
  }

  /**
   * Real-time Page & Portfolio Live Inspector
   * Reads and explores projects, authentic certificates, GitHub repositories, and live page state
   * to ensure 100% accurate responses without opening external tabs.
   */
  buildLivePageInspectionContext(query = '') {
    try {
      const q = (query || '').toLowerCase();
      // Only match queries specifically asking about Rafly / this specific portfolio / authentic project names
      const isSpecificPortfolioQuery = /\b(rafly|web ini|porto ini|portofolio ini|website ini|sertifikat kamu|sertifikat rafly|proyek kamu|proyek rafly|repo kamu|openplagiarism|spam-email|fotokita|laser_pointer|bnsp|mikrotik|mtcna|kontak kamu|wa kamu|email kamu)\b/i.test(q) || (/\b(sertifikat|sertif|kredensial|ijazah)\b/i.test(q) && !/\b(cara|tutorial|buat|desain|template|bikin|plan|prd)\b/i.test(q));

      if (!isSpecificPortfolioQuery) return '';

      const projectsOverview = (typeof PROJECTS_DATA !== 'undefined' && Array.isArray(PROJECTS_DATA)) 
        ? PROJECTS_DATA.map((p, i) => 
            `${i+1}. ${p.title} (${p.categoryLabel || p.category}):\n   - Deskripsi: ${p.description}\n   - Fitur Utama: ${p.keyFeatures ? p.keyFeatures.join(', ') : '-'}\n   - Tech Stack: ${p.techStack ? p.techStack.join(', ') : '-'}\n   - GitHub Repo: ${p.githubUrl || '-'}${p.demoUrl ? `\n   - Live Demo: ${p.demoUrl}` : ''}`
          ).join('\n')
        : '';

      const certsOverview = (typeof CERTIFICATES_DATA !== 'undefined' && Array.isArray(CERTIFICATES_DATA))
        ? CERTIFICATES_DATA.map((c, i) => 
            `${i+1}. ${c.title} (${c.issuer} - ${c.date || c.year || 'Terverifikasi'}):\n   - Credential ID / No: ${c.credentialId || '-'}\n   - File PDF: ${c.pdfUrl || '-'}\n   - Ringkasan: ${c.description || '-'}\n   - Kompetensi: ${c.competencies ? c.competencies.join(', ') : '-'}`
          ).join('\n')
        : '';

      const devProfile = typeof DEVELOPER_PROFILE !== 'undefined' ? DEVELOPER_PROFILE : {};
      const currentUrl = (typeof window !== 'undefined' && window.location) ? window.location.href : 'https://raflyfirmansyah-portofolio.vercel.app/';

      return `\n\n[INSPEKSI LIVE WEB PORTOFOLIO & REPOSITORI GITHUB RAFLY FIRMANSYAH]:
- URL Halaman: ${currentUrl}
- Profil Pengembang: ${devProfile.name || 'Rafly Firmansyah'} (${devProfile.handle || '@Raflyf'}), ${devProfile.degree || 'S1 Informatika'} di ${devProfile.institution || 'UBSI Sukabumi'}.
- Kontak: WA ${devProfile.whatsapp || '08991333323'} (${devProfile.whatsappUrl || 'https://wa.me/628991333323'}), Email ${devProfile.email || 'raflyfirmansyah02@gmail.com'}, GitHub ${devProfile.github || 'https://github.com/Raflyf'}.

[DAFTAR SELURUH PROYEK & REPOSITORI RESMI DI WEB PORTOFOLIO]:
${projectsOverview}

[DAFTAR LENGKAP SERTIFIKAT & KREDENSIAL TERVERIFIKASI DI WEB PORTOFOLIO]:
${certsOverview}
(CATATAN SISTEM: Anda memiliki akses inspeksi live penuh ke seluruh data proyek, sertifikat, dan repositori di atas. Jawab pertanyaan pengunjung secara akurat dan berbasis data autentik di atas. DILARANG memicu perintah membuka URL kecuali pengunjung secara eksplisit meminta untuk membuka halaman/link.)`;
    } catch (_) {
      return '';
    }
  }



  /**
   * Crawl4AI & Firecrawl Inspired Fit-Markdown & Semantic Content Extractor
   */
  extractFitMarkdownContent(rawHtml, sourceUrl = '') {
    if (!rawHtml || typeof rawHtml !== 'string') return '';
    if (!rawHtml.includes('<html') && !rawHtml.includes('<body') && !rawHtml.includes('<div') && !rawHtml.includes('<p')) {
      return rawHtml.slice(0, 4500).trim();
    }

    let html = rawHtml;

    // 1. Semantic Container Isolation
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

    // 2. Prune Noise & Non-Content Nodes (Fit-Markdown Heuristic)
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

    // 3. Convert HTML Structure into Clean Markdown
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

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      html = doc.body.textContent || html;
    } catch (_) {}

    const lines = html.split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .filter(line => line.length > 0);

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 4500);
  }

  clearHistory() {
    this.conversationHistory = [];
    try {
      sessionStorage.removeItem('ai_session_history');
    } catch (_) {}
  }

  /**
   * Main Ask method: Routes multimodal attachments and queries to cloud gateway
   */
  async ask(query, attachments = []) {
    const cleanQuery = query.trim();
    if (!cleanQuery && (!attachments || attachments.length === 0)) {
      return ["Silakan masukkan pertanyaan, perintah, atau unggah dokumen/gambar."];
    }

    this.isAborted = false;
    this.currentAbortController = new AbortController();

    const currentLang = this.detectOrUpdateLanguage(cleanQuery);

    // 0. User Custom Key (if explicitly set via terminal `setkey` command)
    if (this.customApiKey) {
      try {
        const customRes = await this.directClientCustomKey(cleanQuery, currentLang, attachments);
        if (this.isAborted) return { isAborted: true };
        if (customRes && customRes.length > 0) {
          this.conversationHistory.push({ role: 'user', content: cleanQuery });
          this.conversationHistory.push({ role: 'assistant', content: customRes.join('\n') });
          if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
          }
          this.saveHistoryToSession();
          return customRes;
        }
      } catch (_) {
        if (this.isAborted) return { isAborted: true };
      }
    }

    // 1. Primary Route: High-Speed Vercel Serverless Multi-API Cloud Gateway (/api/chat)
    try {
      const memoryContext = await this.fetchAIMemories();
      const controller = this.currentAbortController || new AbortController();
      const timeout = setTimeout(() => {
        if (!this.isAborted) controller.abort();
      }, 120000);
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
          history: this.conversationHistory,
          longTermMemory: memoryContext
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      if (this.isAborted) return { isAborted: true };

      const data = await res.json().catch(() => null);
      if (this.isAborted) return { isAborted: true };

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
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
        this.saveHistoryToSession();

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
    } catch (netErr) {
      if (this.isAborted || (netErr && netErr.name === 'AbortError' && this.isAborted)) {
        return { isAborted: true };
      }

      if (netErr && netErr.name === 'AbortError') {
        return [
          `[TIMEOUT / 2 Menit]: Permintaan ke model AI melebihi batas waktu 2 menit.`,
          `Model sedang memproses komputasi berat. Silakan coba kembali atau pilih model lain.`
        ];
      }

      // Direct Client Failover on Network / CORS Error
      const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
      if (this.isAborted) return { isAborted: true };
      if (directRes) {
        return directRes;
      }
    }

    // 2. Direct Client Failover fallback
    const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
    if (directRes) {
      return directRes;
    }

    // 3. High-Precision In-Browser Semantic Engine Fallback (Emergency Offline Mode)
    const semanticMatch = this.checkSemanticMatch(cleanQuery);
    if (semanticMatch) {
      this.lastExecutionInfo = {
        isAuto: true,
        resolvedModel: 'Local Pattern Engine',
        requestedModel: this.currentModel,
        isFailover: true,
        provider: 'In-Browser Offline Mode',
        effort: 'OFFLINE',
        category: 'offline_fallback'
      };
      if (telemetry) {
        telemetry.logEvent('ai_query_resolved', 'auto:local_semantic', `[Auto ➔ Local Semantic Engine] ${cleanQuery.substring(0, 60)}`);
      }
      return [
        "[OFFLINE RESILIENCE: Local Pattern Engine]",
        "Koneksi gateway cloud sedang tidak terjangkau. Menampilkan ringkasan basis data lokal:",
        "",
        ...semanticMatch
      ];
    }

    // 4. Generic friendly response if completely offline
    return [
      "Maaf, saat ini koneksi ke seluruh gateway model AI sedang mengalami kendala jaringan.",
      "Anda dapat mengulangi pertanyaan Anda kembali, atau menggunakan perintah CLI seperti 'skills', 'projects', 'certifs', 'benchmarks', 'contact'."
    ];
  }

  /**
   * Direct Client-Side Execution for Custom API Keys (provided via `setkey` command)
   */
  async directClientCustomKey(cleanQuery, currentLang, attachments = []) {
    if (!this.customApiKey) return null;

    const userKey = this.customApiKey;
    const userProvider = (this.customApiProvider || 'openrouter').toLowerCase();

    if (userProvider === 'openrouter' || userProvider === 'auto' || !this.customApiProvider) {
      try {
        const customCtrl = new AbortController();
        const customTimer = setTimeout(() => customCtrl.abort(), 20000);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userKey,
            'HTTP-Referer': (typeof window !== 'undefined' ? window.location.href : 'https://raflyf.github.io/web-portofolio/'),
            'X-Title': 'Rafly Portfolio Lab'
          },
          body: JSON.stringify({
            model: (this.currentModel && this.currentModel !== 'auto') ? this.currentModel : 'nvidia/nemotron-3-nano-30b-a3b:free',
            messages: [
              { role: 'system', content: 'Kamu adalah asisten AI teknis profesional. Jawab selalu dalam Bahasa Indonesia.' },
              ...this.conversationHistory.slice(-10),
              { role: 'user', content: cleanQuery }
            ],
            max_tokens: 4096,
            temperature: 0.25
          }),
          signal: customCtrl.signal
        });
        clearTimeout(customTimer);

        if (res.ok) {
          const json = await res.json().catch(() => null);
          const content = json?.choices?.[0]?.message?.content;
          if (content && content.trim().length > 5) {
            this.lastExecutionInfo = {
              isAuto: false,
              resolvedModel: this.currentModel || 'Custom OpenRouter Model',
              requestedModel: this.currentModel,
              isFailover: false,
              provider: 'User Custom OpenRouter Key',
              effort: this.reasoningEffort || 'AUTO',
              category: 'custom'
            };
            return content.trim().split('\n');
          }
        }
      } catch (_) {}
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
