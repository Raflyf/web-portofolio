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
    this.currentAbortController = null;
    this.isAborted = false;
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
   * Main Ask method: Routes multimodal attachments and queries to cloud gateway
   */
  async ask(query, attachments = []) {
    const cleanQuery = query.trim();
    if (!cleanQuery && (!attachments || attachments.length === 0)) {
      return ["Silakan masukkan pertanyaan, perintah, atau unggah dokumen/gambar."];
    }

    this.isAborted = false;
    this.currentAbortController = new AbortController();

    // Log AI Consultation Telemetry
    if (telemetry) {
      telemetry.logEvent('ai_query', this.currentModel || 'auto', cleanQuery.substring(0, 100));
    }

    const currentLang = this.detectOrUpdateLanguage(cleanQuery);

    // 0. Primary Direct Route on Client (OmniRoute / OpenCode / Nvidia / OpenRouter)
    if (typeof window !== 'undefined' && !this.customKey) {
      try {
        const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
        if (this.isAborted) return { isAborted: true };

        if (directRes && directRes.length > 0) {
          // Record conversation turn for dynamic context
          this.conversationHistory.push({ role: 'user', content: cleanQuery });
          this.conversationHistory.push({ role: 'assistant', content: directRes.join('\n') });
          if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
          }

          if (telemetry && this.lastExecutionInfo) {
            const isAuto = this.lastExecutionInfo.isAuto;
            const resolvedModel = this.lastExecutionInfo.resolvedModel;
            const provider = this.lastExecutionInfo.provider;
            const target = isAuto ? `auto:${resolvedModel}` : (this.currentModel || resolvedModel);
            const label = isAuto ? `[Auto ➔ ${resolvedModel} via ${provider}] ${cleanQuery.substring(0, 60)}` : `[${this.currentModel} via ${provider}] ${cleanQuery.substring(0, 60)}`;
            telemetry.logEvent('ai_query_resolved', target, label);
          }
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
          history: this.conversationHistory.slice(-6),
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

[PANDUAN GAYA KOMUNIKASI & SMART PACING ANTI-TRUNCATION]:
1. BAHASA ALAMI, MENGALIR & MUDAH DIPAHAMI (HUMAN-CENTRIC EXPLANATION):
   - Gunakan Bahasa Indonesia yang luwes, bersahabat, dan berbobot layaknya Principal Software Architect / Tech Mentor senior.
   - Tuliskan penjelasan secara runtut dan utuh agar mudah dicerna tanpa basa-basi pembuka/penutup template.
2. KONTROL PANJANG & KELENGKAPAN TUNTAS (SMART PACING - ZERO TRUNCATION):
   - Rangkum penjelasan dalam 4–5 bagian utama yang terstruktur, padat, dan proporsional (target 400–700 kata).
   - LARANGAN CODE-DUMP: Dilarang keras menulis blok kode/skrip/SQL panjang (seperti model Prisma, komponen React penuh, atau endpoint API berbaris-baris) dalam dokumen rencana (plan) atau PRD. Gantilah dengan penjelasan ringkas alur kerja, konsep skema, dan prinsip arsitektural.
   - Hindari daftar sub-checklist hari-ke-hari yang terlalu panjang dan memboroskan token.
   - PASTIKAN seluruh poin selesai tuntas hingga penutup sebelum batas token.
3. MENJAWAB SESUAI CAKUPAN PERTANYAAN (UMUM VS SPESIFIK):
   - Pertanyaan UMUM (contoh: PRD portofolio profesional, dashboard monitoring pengunjung): Berikan panduan dan rencana UMUM yang terstruktur dan aplikatif untuk proyek apa pun.
   - Pertanyaan SPESIFIK tentang Rafly Firmansyah / proyek resmi di web ini: Jawab berdasarkan data autentik portofolio secara presisi.
4. PENANGANAN PERMINTAAN FILE (DOWNLOAD / FORMAT .MD / .TXT / .PDF):
   - Jika pengguna meminta "berikan dalam bentuk file .md", "buatkan file .md", "unduh file", atau "kirim file":
     1. Jelaskan secara jujur dan lugas bahwa sebagai AI di terminal browser, sistem tidak memiliki akses langsung untuk membuat/menulis berkas ke harddisk pengguna secara otomatis.
     2. DILARANG KERAS mengulang atau menyalin kembali seluruh teks panjang dokumen yang sudah dibahas sebelumnya (hemat token).
     3. Berikan panduan ringkas 3 langkah bagaimana pengguna dapat menyimpannya secara manual (Copy teks sebelumnya -> Buka VS Code/Notepad -> Simpan sebagai file .md).

[DATA REPOSITORI RESMI RAFLY FIRMANSYAH (DIGUNAKAN JIKA DITANYA SPESIFIK)]:
- Repositori:
  1. OpenPlagiarismChecker (https://github.com/Raflyf/OpenPlagiarismChecker): Deteksi plagiat teks akademik offline + semantic SBERT MiniLM-L12 + 15 DB Jurnal.
  2. Spam-Email-Classifier (https://github.com/Raflyf/Spam-Email-Classifier): Komparasi ML Naive Bayes vs XGBoost + Dynamic Class Balancing.
  3. laser_pointer_PPT (https://github.com/Raflyf/laser_pointer_PPT): Remote laser pointer via Gyroscope smartphone WebSocket (<15ms) + PyAutoGUI.
  4. FotoKitaBlur (https://github.com/Raflyf/FotoKitaBlur): Edge Vision privasi wajah otomatis berbasis pose Peace/V-Sign MediaPipe 30+ FPS + OpenCV.
  5. web-portofolio (https://github.com/Raflyf/web-portofolio): Portfolio Landing Page Modular Vanilla JS + Supabase Continuous RAG.
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
    const isFileExportQuery = !hasImages && /\b(dalam file|bentuk \.md|bentuk file|jadikan file|download file|unduh file|kirim file|simpan file|save file|bikin file|buat file|jadikan \.md|jadikan \.txt|jadikan \.pdf|format \.md|format file|file \.md)\b/i.test(q);
    const isPlanningOrSystemDesign = !hasImages && !isFileExportQuery && /\b(plan|prd|product requirement|rancang|buatkan sistem|buatkan web|arsitektur sistem|halaman admin|monitoring|dashboard|telemetri|roadmap|strategi|panduan lengkap|desain sistem|spesifikasi|langkah-langkah|alur kerja|workflow|blueprint)\b/i.test(q);
    const isProjectExplaining = !hasImages && !isFileExportQuery && !isPlanningOrSystemDesign && /\b(proyek|project|openplagiarism|plagiarism|checker|fotokita|laser_pointer|laser|spam|skripsi|arsitektur|cara kerja|jelaskan proyek|uraikan proyek|jelaskan repo|uraikan repo|github)\b/i.test(q);
    const isHeavyCoding = !hasImages && !isFileExportQuery && !isPlanningOrSystemDesign && !isProjectExplaining && (/\b(buatkan script|buat script|tulis script|bikin script|buatkan kode|buat kode|tulis kode|bikin kode|script|koding|coding|function|def |class |async |await |import |export |const |let |var |console\.|print\(|return |public |private |struct |interface |lambda |sql|select .* from|create table|dockerfile|kubernetes|yaml|json|regex|refactor|debug|fix bug)\b/i.test(q) || /\b(python|javascript|typescript|golang|rust|php|pytorch|react|flask)\b/i.test(q));
    const isDeepReasoning = !hasImages && !isFileExportQuery && !isPlanningOrSystemDesign && !isProjectExplaining && (/\b(analisis|analisis mendalam|analisis komprehensif|bedah logika|turunkan rumus|matematis|algoritma|perbandingan|benchmark|arena|evaluasi kritis|trade-offs|tradeoff|metodologi|komparasi|chain of thought|thinking|penalaran|kenapa|mengapa|bagaimana cara|jelaskan detail|jelaskan komprehensif)\b/i.test(q) || len > 70);
    const isGreeting = !hasImages && len < 60 && /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|who are you|siapa kamu|kamu siapa|kamu model apa|model apa ini|kamu ai apa|bisa apa|apa kemampuanmu)\b/i.test(q);

    // Resolve Effort: Priority to UI Dropdown Selection if not 'auto'
    const explicitEffort = (this.reasoningEffort && this.reasoningEffort !== 'auto') ? this.reasoningEffort.toUpperCase() : null;
    let targetEffort = explicitEffort || (hasImages ? 'HIGH' : (isFileExportQuery || isGreeting ? 'LOW' : (isPlanningOrSystemDesign || isDeepReasoning ? 'THINKING' : (isProjectExplaining || isHeavyCoding ? 'HIGH' : 'MEDIUM'))));

    // Real-Time Client-Side Web Search Crawler (Filtered)
    let searchContext = '';
    try {
      const stopWords = /^(saya|aku|kamu|anda|ingin|tolong|coba|bisa|minta|mohon|mau|apakah|apa|kenapa|mengapa|bagaimana|gimana|kapan|dimana|adalah|untuk|pada|di|ke|dari|dengan|kalo|jika|buat|buatkan|tampilkan|jelaskan|uraikan|proyek|project|tentang|soal|yg|yang|ada|ini|itu|dan|atau|web|porto|portofolio|github|nya)\b/gi;
      const searchKeywords = cleanQuery.replace(stopWords, '').replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (searchKeywords.length >= 3 && !isProjectExplaining) {
        const searchCtrl = new AbortController();
        const searchTimer = setTimeout(() => searchCtrl.abort(), 2500);
        const firstTerm = searchKeywords.split(' ')[0];
        const [wikiRes, hfRes] = await Promise.allSettled([
          fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchKeywords.slice(0, 40))}&format=json&origin=*`, { signal: searchCtrl.signal }),
          fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(firstTerm)}&limit=3`, { signal: searchCtrl.signal })
        ]);
        clearTimeout(searchTimer);

        const snippets = [];
        if (wikiRes.status === 'fulfilled' && wikiRes.value.ok) {
          const wikiData = await wikiRes.value.json().catch(() => null);
          const hits = wikiData?.query?.search || [];
          if (hits.length > 0) {
            const s = hits[0].snippet.replace(/<[^>]+>/g, '').trim();
            if (s.length > 10) snippets.push(`[Wikipedia]: ${s}`);
          }
        }
        if (hfRes.status === 'fulfilled' && hfRes.value.ok) {
          const hfData = await hfRes.value.json().catch(() => null);
          if (Array.isArray(hfData) && hfData.length > 0) {
            const names = hfData.slice(0, 3).map(m => m.id).join(', ');
            snippets.push(`[Hugging Face Models]: ${names}`);
          }
        }
        if (snippets.length > 0) {
          searchContext = `\n\n[HASIL PENCARIAN REAL-TIME 2026]:\n${snippets.join('\n')}`;
          snippets.forEach(s => {
            if (s && s.length > 15) {
              this.saveAIMemory(s);
            }
          });
        }
      }
    } catch (_) {}

    let longTermMemory = '';
    try {
      longTermMemory = await this.fetchAIMemories();
    } catch (_) {}

    let livePageContext = '';
    try {
      livePageContext = this.buildLivePageInspectionContext(cleanQuery);
    } catch (_) {}

    const fullSystemPrompt = `${SYSTEM_PROMPT_2026}${livePageContext}${searchContext}${longTermMemory}

[INSTRUKSI MEMORI JANGKA PANJANG (ANTI DATA POISONING)]
Jika pengguna memberikan fakta baru yang valid dan penting (seperti spesifikasi baru, koreksi data, atau informasi relevan), sertakan tag berikut di baris paling bawah:
\`[SAVE_MEMORY: tuliskan fakta singkat yang tervalidasi di sini]\``;

    const effortTokensMap = {
      'LOW': 2500,
      'MEDIUM': 4500,
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
      omniCandidates = [this.currentModel, 'nemotron-laguna', 'nemotron-3-ultra-free', 'nemotron-super-free'];
    } else {
      omniCandidates = ['nemotron-laguna', 'nemotron-3-ultra-free', 'nemotron-super-free', 'Codex', 'Antigravity'];
    }

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
            messages: [
              { role: 'system', content: fullSystemPrompt },
              { role: 'user', content: userMessageContent }
            ],
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
        const nimTimeout = setTimeout(() => nimController.abort(), 30000);
        const nimRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + NVIDIA_DIRECT_KEY
          },
          body: JSON.stringify({
            model: nimModel,
            messages: [
              { role: 'system', content: fullSystemPrompt },
              { role: 'user', content: userMessageContent }
            ],
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
          const orTimeout = setTimeout(() => orController.abort(), 35000);
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
              messages: [
                { role: 'system', content: fullSystemPrompt },
                { role: 'user', content: userMessageContent }
              ],
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
              messages: [
                { role: 'system', content: fullSystemPrompt },
                { role: 'user', content: userMessageContent }
              ],
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
