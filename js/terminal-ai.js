/**
 * ============================================================================
 * TERMINAL AI ASSISTANT & KNOWLEDGE ENGINE (v5.3.0)
 * Hybrid Client-Side Engine for Developer Lab Simulator
 * Features:
 * 1. Vercel Serverless Multi-Provider AI Gateway (/api/chat)
 * 2. In-Browser Sub-15ms Exact & Semantic Pattern Engine for Offline Resilience
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js?v=10.33.0';
import { telemetry } from './telemetry.js?v=10.33.0';

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

      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/ai_memories?select=fact_text&order=created_at.desc&limit=10`;
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
      
      const facts = data.map(d => `- ${d.fact_text}`).join('\n');
      return `\n\n[MEMORI JANGKA PANJANG AI (FAKTA YANG TELAH DIPELAJARI DARI PENGGUNA)]:\n${facts}\n(Gunakan fakta di atas jika relevan dengan pertanyaan saat ini.)`;
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
   * Real-Time GitHub Live Repository Document Fetcher (Client-side)
   * Fetches authentic README.md / documentation from GitHub raw endpoints dynamically.
   */
  async fetchLiveRepoContext(query = '') {
    if (!query || typeof query !== 'string') return '';
    const q = query.toLowerCase();

    const repoTargets = [];
    if (/\b(spam|email|klasifikasi email|cnb|complement|xgboost|concept drift|domain adaptation|skripsi|akurasi|confusion matrix)\b/i.test(q)) {
      repoTargets.push({
        name: 'Spam-Email-Classifier',
        urls: [
          'https://raw.githubusercontent.com/Raflyf/Spam-Email/main/docs/DOKUMENTASI_MODEL.md',
          'https://raw.githubusercontent.com/Raflyf/Spam-Email/main/README.md'
        ]
      });
    }
    if (/\b(openplagiarism|plagiarism|plagiat|sbert|n-gram|cektesis|shingling)\b/i.test(q)) {
      repoTargets.push({
        name: 'OpenPlagiarismChecker',
        urls: [
          'https://raw.githubusercontent.com/Raflyf/OpenPlagiarismChecker/main/README.md'
        ]
      });
    }
    if (/\b(laser|pointer|ppt|powerpoint|gyroscope|remotepresenter)\b/i.test(q)) {
      repoTargets.push({
        name: 'laser_pointer_PPT',
        urls: [
          'https://raw.githubusercontent.com/Raflyf/laser_pointer_PPT/main/README.md'
        ]
      });
    }
    if (/\b(fotokita|fotokitablur|blur|face|v-sign|peace sign|privasi wajah)\b/i.test(q)) {
      repoTargets.push({
        name: 'FotoKitaBlur',
        urls: [
          'https://raw.githubusercontent.com/Raflyf/FotoKitaBlur/main/README.md'
        ]
      });
    }
    if (/\b(web-portofolio|porto|website ini|web ini|terminal)\b/i.test(q)) {
      repoTargets.push({
        name: 'web-portofolio',
        urls: [
          'https://raw.githubusercontent.com/Raflyf/web-portofolio/main/README.md'
        ]
      });
    }

    if (repoTargets.length === 0) return '';

    try {
      const fetchPromises = repoTargets.flatMap(target => 
        target.urls.map(async (url) => {
          try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 2500);
            const res = await fetch(url, { signal: ctrl.signal });
            clearTimeout(timer);
            if (res.ok) {
              const text = await res.text();
              if (text && text.length > 50) {
                return `--- DOKUMEN REPOSITORI RESMI (${target.name} | ${url}) ---\n${text.substring(0, 4000)}`;
              }
            }
          } catch (_) {}
          return null;
        })
      );

      const results = await Promise.allSettled(fetchPromises);
      const validDocs = results
        .filter(r => r.status === 'fulfilled' && Boolean(r.value))
        .map(r => r.value);

      if (validDocs.length > 0) {
        return `\n\n[DOKUMENTASI REPOSITORI GITHUB LIVE (GROUND TRUTH TERVERIFIKASI)]:\n${validDocs.join('\n\n')}\n(PENTING: Seluruh informasi, arsitektur, dan angka metrik di atas diambil langsung secara live dari repositori GitHub resmi Rafly Firmansyah. Gunakan data autentik di atas sebagai sumber kebenaran tertinggi dan DILARANG KERAS berasumsi/berhalusinasi.)\n`;
      }
    } catch (_) {}

    return '';
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

    // 0. Primary Direct Route on Client (OmniRoute / OpenCode / Nvidia / OpenRouter)
    if (typeof window !== 'undefined' && !this.customKey) {
      try {
        const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
        if (this.isAborted) return { isAborted: true };

        if (directRes && directRes.length > 0) {
          // Record conversation turn for dynamic 128k context memory
          this.conversationHistory.push({ role: 'user', content: cleanQuery });
          this.conversationHistory.push({ role: 'assistant', content: directRes.join('\n') });
          if (this.conversationHistory.length > 500) {
            this.conversationHistory = this.conversationHistory.slice(-500);
          }
          this.saveHistoryToSession();
          return directRes;
        }
      } catch (_) {
        if (this.isAborted) return { isAborted: true };
      }
    }

    // 1. Fallback: Vercel Serverless Multi-API Cloud Gateway (/api/chat)
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
        } else if (cleanQuery.length > 5 && finalResponse.length > 25 && !/^(halo|hai|tes|ping)\b/i.test(cleanQuery)) {
          const topic = cleanQuery.substring(0, 70);
          const firstLine = finalResponse.split('\n').find(l => l.trim().length > 15 && !l.startsWith('#')) || finalResponse.substring(0, 120);
          const cleanFact = `[Q&A Context]: ${topic} ➔ ${firstLine.replace(/[#*`_]/g, '').trim().substring(0, 180)}`;
          this.saveAIMemory(cleanFact);
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
        if (this.conversationHistory.length > 500) {
          this.conversationHistory = this.conversationHistory.slice(-500);
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
        if (this.isAborted) return { isAborted: true };
        if (directRes) {
          return directRes;
        }

        const semanticMatch = this.checkSemanticMatch(cleanQuery);
        if (semanticMatch) {
          return semanticMatch;
        }
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
    const cleanOutput = (text) => {
      let cleaned = String(text || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      // 1. Check for explicit output markers like Thus: "..." or Response:
      const markerMatch = cleaned.match(/(?:Thus|Therefore|Response|Answer|Jawaban|In Indonesian|Output):\s*["']?([\s\S]+?)["']?$/i);
      if (markerMatch && markerMatch[1] && markerMatch[1].trim().length > 10) {
        return markerMatch[1].trim().replace(/^["']|["']$/g, '').trim();
      }

      // 2. Check for English reasoning monologue start
      const reasoningKeywords = /^(?:Okay|First|Let me|I should|I need to|The user|Looking back|Looking at|Hmm|Wait|From memory|Now, for|To answer|Alright|Let's|Checking|So the user|The system message)\b/i;
      if (reasoningKeywords.test(cleaned)) {
        // Look for Indonesian transition or Markdown
        const indonesianMarker = /(?:(?:\n|\A)(?:Terima kasih|Berikut|Berdasarkan|Tabel|Perbandingan|Model|Untuk|Saat ini|Halo|Hai|Tentu|Dalam|Secara|Pada|[#|]|\d+\.)\s)/i;
        const match = cleaned.search(indonesianMarker);
        if (match !== -1 && match > 0) {
          cleaned = cleaned.slice(match).trim();
        } else {
          // Filter out lines that look like English reasoning
          const lines = cleaned.split('\n');
          const filtered = lines.filter(l => !/^(?:Okay|First|Let me|I should|I need to|The user|Looking|Wait|Checking|So the user|Therefore|Thus|The system message|In their message|Given that|However|Alternatively|So, my response)\b/i.test(l.trim()));
          if (filtered.length > 0) {
            cleaned = filtered.join('\n').trim();
          }
        }
      }

      return cleaned.replace(/^["']|["']$/g, '').trim();
    };

    const now = new Date();
    const dynamicDateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const dynamicTimeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const currentYear = now.getFullYear();

    const SYSTEM_PROMPT_2026 = `Status Bahasa: BAHASA INDONESIA. Waktu Sistem: ${dynamicDateStr}, ${dynamicTimeStr} WIB.
Anda adalah AI Assistant canggih pada Terminal Developer Lab portofolio resmi Rafly Firmansyah (@Raflyf).

[ATURAN BAKU PERSONA, KATA GANTI & AKSES INFORMASI REAL-TIME]:
1. KATA GANTI WAJIB:
   - WAJIB MUTLAK menggunakan kata ganti orang pertama "saya".
   - DILARANG KERAS menggunakan kata "gue", "gua", "gw", atau slang sejenis.
   - Untuk menyapa pengguna, gunakan kata "Anda" atau "kamu" secara sopan, profesional, dan bersahabat.
2. KAPABILITAS AKSES INFORMASI & PENGETAHUAN TERKINI 2026:
   - Anda memiliki wawasan teknologi mutakhir, data tren komputasi, model AI, dan perkembangan industri hingga 2026.
   - DILARANG KERAS mengeluarkan tag fiktif seperti [ACTION:WEB_SEARCH:...], [ACTION:SEARCH:...], atau tool call serupa.
   - DILARANG KERAS menunda respon dengan sekadar berkata "Saya akan mencari..." lalu berhenti.
   - Jika pengguna menanyakan berita teknologi hari ini, rilis model AI mutakhir, atau topik terkini, Anda WAJIB LANGSUNG MENULISKAN DAFTAR BERITA & INOVASI TEKNOLOGI SECARA LENGKAP, DETAIL, DAN BERBOBOT dalam format poin/tabel yang rapi pada respon ini juga secara tuntas.
   - HANYA tag [ACTION:DOWNLOAD_FILE:nama_file.md] yang diperbolehkan ketika pengguna secara spesifik meminta unduh file.
3. KONTINUITAS SESI & MULTI-MODEL HANDOVER:
   - Seluruh riwayat percakapan sesi aktif disertakan secara lengkap (128k context window).
   - Sekalipun pengguna berganti model AI di tengah sesi (misal dari Nemotron ke Codex atau Antigravity), Anda sebagai model yang saat ini aktif WAJIB memahami 100% seluruh percakapan sebelumnya dan melanjutkan pembahasan, riset, atau kode secara mulus tanpa mengulang dari nol.
4. NOL EMOJI & TUNTAS:
   - Dilarang keras menyisipkan emoji dalam bentuk apa pun.
   - Pastikan jawaban selesai tuntas dan tidak terpotong.

[PANDUAN GAYA KOMUNIKASI & PERSONA PERCAKAPAN ALAMI (HELPFUL & CONVERSATIONAL)]:
1. BAHASA PERCAKAPAN NATURAL, RAMAH & MENGALIR:
   - Gunakan gaya bahasa percakapan sehari-hari yang luwes, hidup, ramah, dan sangat membantu (helpful & engaging) layaknya berdiskusi santai dengan rekan software engineer yang berwawasan luas.
   - DILARANG KERAS membuang silabus/format resume kaku secara mentah (seperti langsung menulis header 'Tech Stack Inti', 'Alur Kerja Singkat', 'Proyek ini merupakan bukti kompentensi...').
   - Saat menjelaskan proyek atau topik teknis:
     a. Mulai dengan penjelasan yang ramah dan menarik mengenai masalah nyata yang diselesaikan dan apa keunikannya.
     b. Ceritakan alur kerja dan teknologi yang digunakan secara mengalir, naratif, dan mudah dipahami oleh pembaca.
     c. Sorot fitur dan keunggulan utamanya (seperti privasi lokal, performa, atau kemudahan pakai) secara jujur dan objektif.
     d. Tutup dengan kalimat ramah atau penawaran bantuan jika pengunjung ingin berdiskusi lebih jauh atau mencoba proyek tersebut.
2. KONTROL PANJANG & KELENGKAPAN TUNTAS (SMART PACING - ZERO TRUNCATION):
   - Rangkum penjelasan dalam alur yang proporsional, padat, dan nyaman dibaca (target 300–600 kata).
   - LARANGAN CODE-DUMP: Dilarang keras menulis blok kode/skrip/SQL panjang dalam obrolan umum kecuali pengguna secara eksplisit memintanya ("tuliskan kodenya").
   - PASTIKAN seluruh penjelasan selesai tuntas hingga kalimat penutup tanpa terputus.
3. MENJAWAB SESUAI CAKUPAN PERTANYAAN (UMUM VS SPESIFIK):
   - Pertanyaan UMUM (contoh: cara membuat API, konsep RAG, machine learning): Jelaskan konsep secara umum yang aplikatif dan mudah dimengerti.
   - Pertanyaan SPESIFIK tentang Rafly Firmansyah / proyek resmi di web ini: Jawab berdasarkan data autentik portofolio secara presisi dengan gaya bercerita yang menarik.
4. PENANGANAN PERMINTAAN FILE (DOWNLOAD / FORMAT .MD / .TXT / .PDF):
   - Jika pengguna meminta "berikan dalam bentuk file .md", "buatkan file .md", atau "ingin download file":
     1. Sertakan tag aksi: [ACTION:DOWNLOAD_FILE:nama_file.md] di baris pertama jawaban Anda untuk memunculkan tombol unduh interaktif.
     2. Berikan pesan konfirmasi singkat dan ramah bahwa berkas telah disiapkan dan pengunjung dapat mengunduhnya.
     3. DILARANG KERAS mengulang atau menyalin kembali seluruh teks panjang dokumen sebelumnya secara mentah agar hemat token.

[DATA REPOSITORI RESMI RAFLY FIRMANSYAH & HASIL EMPIRIS RISET]:
1. Spam-Email-Classifier (Riset Skripsi ML - https://github.com/Raflyf/Spam-Email):
   - Judul Riset: "Analisis Performa Complement Naive Bayes dan XGBoost dalam Mengatasi Concept Drift pada Klasifikasi Spam Email Menggunakan Pendekatan Domain Adaptation"
   - Masalah Utama: Fenomena Concept Drift / Covariate Shift akibat perbedaan era data training (email historis Kaggle era 2000-an, 5.728 data) dengan data uji (email pribadi modern 2026, 2.500 data).
   - Hasil Evaluasi Empiris Metode 1 (Murni tanpa Domain Adaptation):
     * Complement Naive Bayes (CNB): Akurasi 51.50%, Presisi 53.58%, Recall 51.50%, F1-Score 43.26%
     * XGBoost: Akurasi 48.00%, Presisi 47.87%, Recall 48.00%, F1-Score 47.19%
     (Performa anjlok karena domain gap antara data email masa lalu vs email kontemporer).
   - Hasil Evaluasi Empiris Metode 2 (Dengan Domain Adaptation 30% instance weighting 8x):
     * Complement Naive Bayes (CNB): Akurasi 77.00%, Presisi 81.40%, Recall 77.00%, F1-Score 76.17%
     * XGBoost: Akurasi 93.00%, Presisi 93.08%, Recall 93.00%, F1-Score 93.00%
     (Peningkatan lonjakan +44.00% pada XGBoost dan naiknya CNB ke 77% membuktikan keampuhan Domain Adaptation dalam mengatasi Concept Drift).
   - Confusion Matrix XGBoost Metode 2: TN=333 (Non-Spam tepat), FP=17 (False Positive), FN=32 (Spam lolos), TP=318 (Spam terdeteksi tepat) dari 700 email uji.
   - ATURAN MUTLAK METRIK AKURASI: DILARANG KERAS mengarang metrik tebakan fiktif (seperti 96.2% atau 97.8%). Wajib gunakan angka empiris autentik di atas (CNB 77%, XGBoost 93%) jika ditanya hasil akurasi/metrik.

2. OpenPlagiarismChecker (https://github.com/Raflyf/OpenPlagiarismChecker):
   - Deteksi plagiarisme naskah akademik 100% offline lokal tanpa pengiriman data ke server luar (Zero Data Egress).
   - Dual Engine: 5-Word N-Gram Shingling (Exact Match) + Multilingual Sentence Transformers (SBERT paraphrase-multilingual-MiniLM-L12-v2, 384-dimensional vector embedding, Cosine Similarity untuk parafrasa).
   - Terintegrasi dengan 15+ basis data jurnal akademik publik (GARUDA, Indonesian Open Search / IOS, BASE, Semantic Scholar, Crossref, DOAJ).

3. laser_pointer_PPT (https://github.com/Raflyf/laser_pointer_PPT):
   - Pengendali presentasi PowerPoint nirsentuh berbasis sensor gyroscope dan accelerometer smartphone.
   - Transmisi real-time ultra-low latency (<15 ms) via WebSocket (Flask-SocketIO) + PyAutoGUI virtual cursor mapper di PC presenter.

4. FotoKitaBlur (https://github.com/FotoKitaBlur):
   - Edge Computer Vision privasi wajah otomatis 100% lokal berbasis deteksi gestur Peace Sign / V-Sign menggunakan MediaPipe Pose & Face Mesh (30+ FPS di CPU) + OpenCV Gaussian Blur.

5. web-portofolio (https://github.com/Raflyf/web-portofolio):
   - Portfolio Landing Page Modular Vanilla JS (<50 KB) + Supabase Continuous Learning RAG (pgvector) + Multi-Session Floating Terminal dengan Dynamic 128k Token Context Window.

- Kredensial: Rafly Firmansyah, S1 Informatika UBSI, BNSP Analis Program (TIK 037 00481 2026), MikroTik MTCNA Latvia (2410NA3062), Cisco PCAP. Kontak: WA 08991333323 (https://wa.me/628991333323), Email raflyfirmansyah02@gmail.com, GitHub https://github.com/Raflyf.
- Registri Model 2026: OpenAI (GPT-5.6, GPT-5.5, GPT-5, GPT-4o), Anthropic (Claude Opus 5, Claude Mythos 5, Claude Sonnet 5), Google (Gemini 3.7 Flash, Gemini 3.6 Flash), DeepSeek (DeepSeek-V4 Flash, DeepSeek-V3), Nvidia (Nemotron 3 Ultra 550B, Nemotron 3 Super 120B, Nemotron Laguna).
- Dilarang monolog internal bahasa Inggris. Nol emoji.`;

    const q = (cleanQuery || '').toLowerCase();
    const len = q.length;

    // Detect if image attachment exists
    const hasImages = Array.isArray(attachments) && attachments.some(a => a.isImage || a.type?.startsWith('image') || (a.base64 && a.base64.length > 50));

    // Construct Multimodal Payload
    const userMessageContent = hasImages ? [
      { type: 'text', text: cleanQuery || 'Analisis dan jelaskan isi gambar/dokumen ini secara mendalam.' },
      ...attachments.filter(a => a.isImage || a.type?.startsWith('image') || (a.base64 && a.base64.length > 50)).map(img => ({
        type: 'image_url',
        image_url: { url: img.base64.startsWith('data:') ? img.base64 : `data:${img.type || 'image/jpeg'};base64,${img.base64}` }
      }))
    ] : cleanQuery;

    // Intelligent Intent Detection & Automatic Effort Resolution
    const isCasualOrShort = !hasImages && (
      (len < 50 && /^(cukup|udah|sudah|selesai|stop|berhenti|gausah|nggak|tidak|makasih|terima kasih|thanks|thx|tq|oke|ok|sip|siap|mantap|keren|yup|yes|ya|iya|bye|dadah|good|nice|paham|mengerti)\b/i.test(q)) ||
      (len < 60 && /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|who are you|siapa kamu|kamu siapa|kamu model apa|model apa ini|kamu ai apa|bisa apa|apa kemampuanmu)\b/i.test(q)) ||
      (len <= 30 && !/[{}();=><\[\]]/.test(q) && !/\b(kode|script|koding|coding|bikin|buatkan|debug|error|fungsi|analisis|mengapa|kenapa|bagaimana|plan|prd|proyek)\b/i.test(q))
    );
    const isFileExportQuery = !hasImages && /\b(dalam file|bentuk \.md|bentuk file|jadikan file|download file|unduh file|kirim file|simpan file|save file|bikin file|buat file|jadikan \.md|jadikan \.txt|jadikan \.pdf|format \.md|format file|file \.md)\b/i.test(q);
    const isPlanningOrSystemDesign = !hasImages && !isFileExportQuery && !isCasualOrShort && /\b(plan|prd|product requirement|rancang|buatkan sistem|buatkan web|arsitektur sistem|halaman admin|monitoring|dashboard|telemetri|roadmap|strategi|panduan lengkap|desain sistem|spesifikasi|langkah-langkah|alur kerja|workflow|blueprint)\b/i.test(q);
    const isProjectExplaining = !hasImages && !isFileExportQuery && !isCasualOrShort && !isPlanningOrSystemDesign && /\b(proyek|project|openplagiarism|plagiarism|checker|fotokita|laser_pointer|laser|spam|skripsi|arsitektur|cara kerja|jelaskan proyek|uraikan proyek|jelaskan repo|uraikan repo|github)\b/i.test(q);
    const isHeavyCoding = !hasImages && !isFileExportQuery && !isCasualOrShort && !isPlanningOrSystemDesign && !isProjectExplaining && (/\b(buatkan script|buat script|tulis script|bikin script|buatkan kode|buat kode|tulis kode|bikin kode|script|koding|coding|function|def |class |async |await |import |export |const |let |var |console\.|print\(|return |public |private |struct |interface |lambda |sql|select .* from|create table|dockerfile|kubernetes|yaml|json|regex|refactor|debug|fix bug)\b/i.test(q) || /\b(python|javascript|typescript|golang|rust|php|pytorch|react|flask)\b/i.test(q));
    const isDeepReasoning = !hasImages && !isFileExportQuery && !isCasualOrShort && !isPlanningOrSystemDesign && !isProjectExplaining && (/\b(analisis|analisis mendalam|analisis komprehensif|bedah logika|turunkan rumus|matematis|algoritma|perbandingan|benchmark|arena|evaluasi kritis|trade-offs|tradeoff|metodologi|komparasi|chain of thought|thinking|penalaran|kenapa|mengapa|bagaimana cara|jelaskan detail|jelaskan komprehensif)\b/i.test(q) || len > 70);

    // Resolve Effort: Priority to UI Dropdown Selection if not 'auto'
    const explicitEffort = (this.reasoningEffort && this.reasoningEffort !== 'auto') ? this.reasoningEffort.toUpperCase() : null;
    let targetEffort = explicitEffort || (hasImages ? 'HIGH' : (isCasualOrShort || isFileExportQuery ? 'LOW' : (isPlanningOrSystemDesign || isDeepReasoning ? 'THINKING' : (isHeavyCoding ? 'HIGH' : 'MEDIUM'))));

    // Real-Time Client-Side Universal Web Search Crawler
    let searchContext = '';
    try {
      const snippets = [];

      // 1. Direct Web Page Scraper for any URL in the query
      const urlMatches = cleanQuery.match(/https?:\/\/[^\s"'<>]+/gi) || [];
      if (urlMatches.length > 0) {
        const urlPromises = urlMatches.slice(0, 2).map(async (u) => {
          try {
            const ctrl = new AbortController();
            const tm = setTimeout(() => ctrl.abort(), 3000);
            const res = await fetch(u, { signal: ctrl.signal });
            clearTimeout(tm);
            if (res.ok) {
              const text = await res.text();
              const clean = text
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              if (clean.length > 50) {
                snippets.push(`[Live Webpage Content (${u})]: ${clean.slice(0, 3000)}`);
              }
            }
          } catch (_) {}
        });
        await Promise.allSettled(urlPromises);
      }

      // 2. 100% Unrestricted Open Web Search Matrix (Wikipedia, OpenAlex, ArXiv, Hugging Face)
      const stopWords = /^(saya|aku|kamu|anda|ingin|tolong|coba|bisa|minta|mohon|mau|apakah|apa|kenapa|mengapa|bagaimana|gimana|kapan|dimana|adalah|untuk|pada|di|ke|dari|dengan|kalo|jika|buat|buatkan|tampilkan|jelaskan|uraikan|proyek|project|tentang|soal|yg|yang|ada|ini|itu|dan|atau|web|porto|portofolio|github|nya)\b/gi;
      const searchKeywords = cleanQuery.replace(stopWords, '').replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
      const shortProbe = searchKeywords.split(' ').slice(0, 8).join(' ');
      
      if (shortProbe.length >= 2) {
        const searchCtrl = new AbortController();
        const searchTimer = setTimeout(() => searchCtrl.abort(), 3000);
        const firstTerm = shortProbe.split(' ')[0];
        const searchPromises = [
          fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(shortProbe)}&format=json&origin=*`, { signal: searchCtrl.signal }),
          fetch(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(shortProbe)}&format=json&origin=*`, { signal: searchCtrl.signal }),
          fetch(`https://api.openalex.org/works?filter=fulltext.search:${encodeURIComponent(shortProbe)}&per_page=3`, { signal: searchCtrl.signal }),
          fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(firstTerm)}&limit=3`, { signal: searchCtrl.signal })
        ];

        const [wikiRes, wikiIdRes, openAlexRes, hfRes] = await Promise.allSettled(searchPromises);
        clearTimeout(searchTimer);

        for (const wRes of [wikiRes, wikiIdRes]) {
          if (wRes.status === 'fulfilled' && wRes.value.ok) {
            const wikiData = await wRes.value.json().catch(() => null);
            const hits = wikiData?.query?.search || [];
            if (hits.length > 0) {
              const s = hits[0].snippet.replace(/<[^>]+>/g, '').trim();
              if (s.length > 10) snippets.push(`[Wikipedia (${hits[0].title})]: ${s}`);
            }
          }
        }

        if (openAlexRes.status === 'fulfilled' && openAlexRes.value.ok) {
          const oaData = await openAlexRes.value.json().catch(() => null);
          const works = oaData?.results || [];
          works.slice(0, 2).forEach((w) => {
            const title = w.title || '';
            if (title) snippets.push(`[Open Web/Research Index (${title})]`);
          });
        }

        if (hfRes.status === 'fulfilled' && hfRes.value.ok) {
          const hfData = await hfRes.value.json().catch(() => null);
          if (Array.isArray(hfData) && hfData.length > 0) {
            const names = hfData.slice(0, 3).map(m => m.id).join(', ');
            snippets.push(`[Hugging Face Hub]: ${names}`);
          }
        }
      }

      if (snippets.length > 0) {
        searchContext = `\n\n[HASIL PENCARIAN & JELAJAH INTERNET TERBUKA REAL-TIME 2026 (UNRESTRICTED OPEN WEB GROUND TRUTH)]:\n${snippets.join('\n')}`;
        snippets.forEach(s => {
          if (s && s.length > 15) {
            this.saveAIMemory(s);
          }
        });
      }
    } catch (_) {}

    let longTermMemory = '';
    try {
      longTermMemory = await this.fetchAIMemories();
    } catch (_) {}

    let liveRepoContext = '';
    try {
      liveRepoContext = await this.fetchLiveRepoContext(cleanQuery);
    } catch (_) {}

    let livePageContext = '';
    try {
      livePageContext = this.buildLivePageInspectionContext(cleanQuery);
    } catch (_) {}

    const fullSystemPrompt = `${SYSTEM_PROMPT_2026}${liveRepoContext}${livePageContext}${searchContext}${longTermMemory}

[INSTRUKSI MEMORI JANGKA PANJANG (ANTI DATA POISONING)]
Jika pengguna memberikan fakta baru yang valid dan penting (seperti spesifikasi baru, koreksi data, atau informasi relevan), sertakan tag berikut di baris paling bawah:
\`[SAVE_MEMORY: tuliskan fakta singkat yang tervalidasi di sini]\``;

    const effortTokensMap = {
      'LOW': 4096,
      'MEDIUM': 8192,
      'HIGH': 8192,
      'THINKING': 8192
    };
    const calculatedMaxTokens = effortTokensMap[targetEffort] || 8192;

    // Helper: Safe JSON or SSE stream extractor
    const extractContentFromResponseText = (rawText) => {
      if (!rawText) return '';
      const trimmed = rawText.trim();
      if (trimmed.includes('data:')) {
        let assembled = '';
        const lines = trimmed.split('\n');
        for (const line of lines) {
          const l = line.trim();
          if (l.startsWith('data:') && !l.includes('[DONE]')) {
            try {
              const jsonStr = l.replace(/^data:\s*/, '');
              const json = JSON.parse(jsonStr);
              const delta = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || json.choices?.[0]?.text || '';
              assembled += delta;
            } catch (_) {}
          }
        }
        if (assembled.trim().length > 0) return assembled;
      }
      try {
        const json = JSON.parse(trimmed);
        return json.choices?.[0]?.message?.content || json.choices?.[0]?.delta?.content || json.choices?.[0]?.text || '';
      } catch (_) {
        return '';
      }
    };

    const dispatchSuccess = (rawContent, modelName, providerName) => {
      let finalContent = cleanOutput(rawContent);
      if (!finalContent || finalContent.length <= 5) return null;

      // Extract and Save Memory to Supabase Continuous RAG
      const memoryMatch = finalContent.match(/\[SAVE_MEMORY:\s*([\s\S]*?)\]/i);
      if (memoryMatch && memoryMatch[1]) {
        const newFact = memoryMatch[1].trim();
        this.saveAIMemory(newFact);
        finalContent = finalContent.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
      } else if (cleanQuery.length > 5 && finalContent.length > 25 && !/^(halo|hai|tes|ping)\b/i.test(cleanQuery)) {
        const topic = cleanQuery.substring(0, 70);
        const firstLine = finalContent.split('\n').find(l => l.trim().length > 15 && !l.startsWith('#')) || finalContent.substring(0, 120);
        const cleanFact = `[Q&A Context]: ${topic} ➔ ${firstLine.replace(/[#*`_]/g, '').trim().substring(0, 180)}`;
        this.saveAIMemory(cleanFact);
      }

      this.lastExecutionInfo = {
        isAuto: !this.currentModel || this.currentModel === 'auto',
        resolvedModel: modelName,
        requestedModel: this.currentModel,
        isFailover: providerName !== 'OmniRoute Dedicated Gateway',
        provider: providerName,
        effort: targetEffort,
        category: isProjectExplaining ? 'project_architecture' : (isDeepReasoning ? 'deep_reasoning' : 'general')
      };

      if (telemetry) {
        const target = (!this.currentModel || this.currentModel === 'auto') ? `auto:${modelName}` : (this.currentModel || modelName);
        const label = `[${providerName} ➔ ${modelName}] ${cleanQuery.substring(0, 60)}`;
        telemetry.logEvent('ai_query_resolved', target, label);
      }

      return finalContent.split('\n');
    };

    // 1. ABSOLUTE PRIORITY #1: Dedicated OmniRoute Gateway Pool (Nemotron Laguna 3 Ultra Priority)
    const OMNI_URL = 'https://ceremony-cent-triumph-hands.trycloudflare.com/v1/chat/completions';
    const OMNI_KEY = atob('c2stN2E5YjUxYTI2NDc2OGUzMi1iM2Y5YjctNmUxY2RhY2Q=');

    let omniCandidates = [];
    if (this.currentModel && this.currentModel !== 'auto') {
      omniCandidates = [this.currentModel, 'nemotron-laguna', 'Codex', 'Antigravity', 'Deepseek-V4-Flash-Free'];
    } else if (isHeavyCoding) {
      omniCandidates = ['Codex', 'Antigravity', 'Deepseek-V4-Flash-Free', 'nemotron-laguna'];
    } else if (isDeepReasoning) {
      omniCandidates = ['Antigravity', 'Deepseek-V4-Flash-Free', 'nemotron-laguna', 'Codex'];
    } else if (hasImages) {
      omniCandidates = ['Vision-model', 'Antigravity', 'Codex'];
    } else {
      // Basic / Standard Hierarchy: Nemotron -> DeepSeek V4 -> Codex -> Antigravity -> Vision
      omniCandidates = ['nemotron-laguna', 'Deepseek-V4-Flash-Free', 'Codex', 'Antigravity', 'Vision-model'];
    }

    // Assemble 128k Token Context Window (~480,000 chars) dynamically from full session history
    const systemStr = typeof fullSystemPrompt === 'string' ? fullSystemPrompt : JSON.stringify(fullSystemPrompt || '');
    const userStr = typeof userMessageContent === 'string' ? userMessageContent : JSON.stringify(userMessageContent || '');
    let currentBudget = 480000 - (systemStr.length + userStr.length);
    if (currentBudget < 10000) currentBudget = 10000;

    const validHistory = Array.isArray(this.conversationHistory) ? this.conversationHistory : [];
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
        if (currentBudget > 2000) {
          selectedHistory.unshift({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: contentStr.slice(-currentBudget)
          });
        }
        break;
      }
    }

    const fullMessagesPayload = [
      { role: 'system', content: fullSystemPrompt },
      ...selectedHistory,
      { role: 'user', content: userMessageContent }
    ];

    let isTunnelReachable = true;
    for (const omniModel of omniCandidates) {
      if (!isTunnelReachable) break;
      try {
        const omniController = new AbortController();
        const omniTimeout = setTimeout(() => omniController.abort(), 60000);

        const omniRes = await fetch(OMNI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OMNI_KEY}`
          },
          body: JSON.stringify({
            model: omniModel,
            messages: fullMessagesPayload,
            max_tokens: calculatedMaxTokens,
            temperature: 0.25,
            stream: false
          }),
          signal: omniController.signal
        });

        clearTimeout(omniTimeout);

        if (omniRes.ok) {
          const rawText = await omniRes.text();
          const content = extractContentFromResponseText(rawText);
          if (content && content.length > 5) {
            const resLines = dispatchSuccess(content, omniModel, 'OmniRoute Dedicated Gateway');
            if (resLines) return resLines;
          }
        } else {
          // If Cloudflare tunnel returns 502/503/521/522/524/530, server is offline
          if ([502, 503, 521, 522, 524, 530].includes(omniRes.status)) {
            isTunnelReachable = false;
            break;
          }
        }
      } catch (_) {
        // Network failure / DNS unreachable -> instantly cascade to cloud backups
        isTunnelReachable = false;
        break;
      }
    }

    // 2. Secondary Direct Route: Nvidia NIM API Direct (Nemotron 3 Ultra 550B & Super 120B)
    const NVIDIA_DIRECT_KEY = atob('bnZhcGktVTVBNVJZcjJuTDRudVdYUE5HZWZnSHdHbmxoLWFsY1lFenIxeVJxdE43Y3RIMVNiSTFGaUprMno1Z0NPQzE4dA==');
    const nimCandidateModels = ['nvidia/nemotron-3-ultra-550b-a55b', 'nvidia/nemotron-3-super-120b-a12b', 'meta/llama-3.3-70b-instruct'];
    for (const nimModel of nimCandidateModels) {
      try {
        const nimController = new AbortController();
        const nimTimeout = setTimeout(() => nimController.abort(), 45000);
        const nimRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + NVIDIA_DIRECT_KEY
          },
          body: JSON.stringify({
            model: nimModel,
            messages: fullMessagesPayload,
            max_tokens: calculatedMaxTokens,
            temperature: 0.25
          }),
          signal: nimController.signal
        });
        clearTimeout(nimTimeout);

        if (nimRes.ok) {
          const rawText = await nimRes.text();
          const content = extractContentFromResponseText(rawText);
          if (content && content.length > 5) {
            const resLines = dispatchSuccess(content, nimModel, 'Nvidia NIM Direct Gateway');
            if (resLines) return resLines;
          }
        }
      } catch (_) {}
    }

    // 3. Tertiary Direct Route: OpenRouter 3-Key Cloud Pool (Nemotron 3 Ultra & Super & Llama 3.3 70B)
    const OR_KEYS = [
      atob('c2stb3ItdjEtNzlhMzk1Y2YwOGQyNmY2ZDQwMDA2Njg5ZGI5ZTNhYzkwZmI1ZDc5OWViNzA0MTJkYTQ4ZTIzNGU0ZjJmZDE5MQ=='),
      atob('c2stb3ItdjEtODJmMjVhYzFlYjU3YmI0MmVhZjAxM2ZlYzM4OTkwZTM1ZDY2ZDg3NjM3ZTkxNmFiZjk2NTM3NWM1NGUzZTM2Nw=='),
      atob('c2stb3ItdjEtN2EzYzM5ODZjY2JjMGI2NDEyYjE2Yzc4Yzc2MmNkNzU2OTYwNDc0ODNhMjdiMTg4MTllZmI1OTk0NGY4ZWQ0Mw==')
    ];

    const orModelCandidates = (this.currentModel && this.currentModel !== 'auto')
      ? [this.currentModel, 'nvidia/nemotron-3-ultra-550b-a55b', 'nvidia/nemotron-3-super-120b-a12b', 'meta-llama/llama-3.3-70b-instruct']
      : ['nvidia/nemotron-3-ultra-550b-a55b', 'nvidia/nemotron-3-super-120b-a12b', 'meta-llama/llama-3.3-70b-instruct'];

    for (const orM of orModelCandidates) {
      for (const orKey of OR_KEYS) {
        try {
          const orController = new AbortController();
          const orTimeout = setTimeout(() => orController.abort(), 50000);
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + orKey,
              'HTTP-Referer': (typeof window !== 'undefined' ? window.location.href : 'https://raflyf.github.io/web-portofolio/'),
              'X-Title': 'Rafly Portfolio Lab'
            },
            body: JSON.stringify({
              model: orM,
              messages: fullMessagesPayload,
              max_tokens: calculatedMaxTokens,
              temperature: 0.25
            }),
            signal: orController.signal
          });
          clearTimeout(orTimeout);

          if (orRes.ok) {
            const rawText = await orRes.text();
            const content = extractContentFromResponseText(rawText);
            if (content && content.length > 5) {
              const resLines = dispatchSuccess(content, orM, 'OpenRouter 3-Key Cloud Pool');
              if (resLines) return resLines;
            }
          }
        } catch (_) {}
      }
    }

    // 4. Custom User Key (if provided via `setkey`)
    if (this.customApiKey) {
      const userKey = this.customApiKey;
      const userProvider = (this.customApiProvider || 'openrouter').toLowerCase();

      if (userProvider === 'openrouter' || userProvider === 'auto' || !this.customApiProvider) {
        try {
          const customCtrl = new AbortController();
          const customTimer = setTimeout(() => customCtrl.abort(), 15000);
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + userKey,
              'HTTP-Referer': (typeof window !== 'undefined' ? window.location.href : 'https://raflyf.github.io/web-portofolio/'),
              'X-Title': 'Rafly Portfolio Lab'
            },
            body: JSON.stringify({
              model: (this.currentModel && this.currentModel !== 'auto') ? this.currentModel : 'nvidia/nemotron-nano-9b',
              messages: fullMessagesPayload,
              max_tokens: calculatedMaxTokens,
              temperature: 0.25
            }),
            signal: customCtrl.signal
          });
          clearTimeout(customTimer);

          if (res.ok) {
            const rawText = await res.text();
            const content = cleanOutput(extractContentFromResponseText(rawText));
            if (content && content.length > 5) {
              this.lastExecutionInfo = {
                isAuto: false,
                resolvedModel: this.currentModel || 'Custom OpenRouter Model',
                requestedModel: this.currentModel,
                isFailover: false,
                provider: 'User Custom OpenRouter Key',
                effort: targetEffort,
                category: 'custom'
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
