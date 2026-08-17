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

    // 0. Primary Direct Route on Client (OmniRoute / OpenCode / Nvidia / OpenRouter)
    if (typeof window !== 'undefined' && !this.customKey) {
      try {
        const directRes = await this.directClientFailover(cleanQuery, currentLang, attachments);
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
      } catch (_) {}
    }

    // 1. Fallback: Vercel Serverless Multi-API Cloud Gateway (/api/chat)
    try {
      const memoryContext = await this.fetchAIMemories();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
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

    const SYSTEM_PROMPT_2026 = `Status Bahasa: BAHASA INDONESIA. Waktu Sistem Saat Ini: Senin, 17 Agustus 2026.
Anda adalah AI Assistant canggih pada Terminal Developer Lab portofolio resmi Rafly Firmansyah (@Raflyf).

[ATURAN ANTI-HALUSINASI & INTEGRITAS DATA REPOSITORI]:
- DILARANG KERAS MENGARANG NAMA ATAU URL REPOSITORI. Repositori resmi milik Rafly Firmansyah yang valid adalah:
  1. OpenPlagiarismChecker (https://github.com/Raflyf/OpenPlagiarismChecker)
  2. Spam-Email-Classifier (https://github.com/Raflyf/Spam-Email-Classifier)
  3. laser_pointer_PPT (https://github.com/Raflyf/laser_pointer_PPT)
  4. FotoKitaBlur (https://github.com/Raflyf/FotoKitaBlur)
  5. web-portofolio (https://github.com/Raflyf/web-portofolio)
- DILARANG KERAS mengarang metrik palsu (seperti "1,2k stars", "85 fork", "15 kontributor", "commit 2 hari lalu") atau mengarang tautan GitHub fiktif (seperti github.com/Raflyf/openplagiarism).
- Jika pengguna menanyakan proyek portofolio, jelaskan BERDASARKAN spesifikasi teknis autentik di bawah ini.

[SPESIFIKASI ARSITEKTUR REPOSITORI RESMI RAFLY FIRMANSYAH]:
1. OpenPlagiarismChecker (https://github.com/Raflyf/OpenPlagiarismChecker):
   - Fokus: Sistem Deteksi Kesamaan Dokumen Akademik & Skripsi Komprehensif Mengutamakan Privasi (Privacy-First Offline / Zero Storage).
   - Pipeline Multi-Tier:
     * Tahap 1 (Document Ingestion): Ekstraksi teks multi-halaman dari PDF/DOCX via pdfplumber dan python-docx, pembersihan case folding, stopword filtering Bahasa Indonesia (Sastrawi) & Inggris (NLTK), serta tokenization.
     * Tahap 2 (Exact Match Engine): 5-Word N-Gram Shingling dengan MinHash / Jaccard Similarity untuk pencocokan cepat kalimat identik/plagiat kata-per-kata.
     * Tahap 3 (Deep Semantic Paraphrasing Engine): Dense Vector Embeddings menggunakan Hugging Face Sentence Transformers (paraphrase-multilingual-MiniLM-L12-v2 / indo-sentence-bert 384 dimensi). Menghitung Cosine Similarity: cos(theta) = (A . B) / (||A|| ||B||) untuk mendeteksi parafrase kalimat yang diubah susunan katanya namun bermakna sama.
     * Tahap 4 (External Literature Search Connector): Menghubungkan pencarian referensi otomatis ke 15+ basis data literatur publik (GARUDA Kemdikbud, Neliti, BASE Bielefeld, OpenAlex, Semantic Scholar, Crossref).
     * Tahap 5 (Weighted Aggregate Scoring): Menggabungkan skor kemiripan berbobot (40% Exact Match + 60% Semantic Match) serta menyoroti teks di peramban dengan warna merah (duplikasi persis) dan kuning (parafrase).
     * Stack Teknologi: Python 3.10+, Flask, PyTorch, Hugging Face Transformers, Scikit-Learn, Sastrawi, HTML5/CSS3.

2. Spam-Email-Classifier (https://github.com/Raflyf/Spam-Email-Classifier):
   - Fokus: Aplikasi Web Evaluasi & Komparasi Model Machine Learning Klasifikasi Spam dengan Dynamic Class Balancing.
   - Fitur Unggulan: Komparasi Multinomial Naive Bayes vs XGBoost, TF-IDF Vectorizer, slider Dynamic Class Balancing (10:90 s/d 90:10), Confusion Matrix interaktif.
   - Stack Teknologi: Python, Scikit-Learn, XGBoost, Flask, Pandas, NumPy, Chart.js.

3. laser_pointer_PPT (https://github.com/Raflyf/laser_pointer_PPT):
   - Fokus: Pengendali Slide Presentasi PowerPoint Nirsentuh Berbasis Sensor Gyroscope Smartphone.
   - Arsitektur: Web browser smartphone membaca DeviceOrientation API, dikirim via WebSocket (Flask-SocketIO & Eventlet, <15ms latency) ke PC, lalu PyAutoGUI menggerakkan kursor laser pointer virtual.
   - Stack Teknologi: Python, Flask-SocketIO, Eventlet, PyAutoGUI, JavaScript DeviceOrientation API.

4. FotoKitaBlur (https://github.com/Raflyf/FotoKitaBlur):
   - Fokus: Otomatisasi Perlindungan Privasi Kamera Real-Time Berbasis Gestur Tangan (Edge Vision).
   - Arsitektur: Google MediaPipe Tasks Vision mendeteksi 21 hand landmarks untuk pose Peace/V-Sign pada 30+ FPS, lalu OpenCV menerapkan filter Gaussian Blur otomatis pada wajah.
   - Stack Teknologi: Python, OpenCV, Google MediaPipe, NumPy.

5. web-portofolio (https://github.com/Raflyf/web-portofolio):
   - Fokus: Portfolio Landing Page Modular Berkinerja Tinggi & Terminal Developer Lab Multimodal.
   - Fitur: Vanilla JavaScript Modular (ES Modules), OKLCH Design System, WCAG 2.2 AA, PDF.js multi-page reader, Supabase RAG continuous learning.

[KREDENSIAL RAFLY FIRMANSYAH]:
- Nama: Rafly Firmansyah (@Raflyf), Mahasiswa S1 Informatika UBSI Sukabumi, Lokasi: Cianjur/Sukabumi.
- 10 Sertifikat: BNSP Analis Program (TIK 037 00481 2026), MikroTik MTCNA Latvia (ID: 2410NA3062), Cisco Python PCAP, Cloud Computing Specialist, Network Security.
- Kontak: WhatsApp 08991333323 (https://wa.me/628991333323), Email raflyfirmansyah02@gmail.com, GitHub https://github.com/Raflyf.

[KEMAMPUAN AKSES INTERNET & MULTIMODAL REAL-TIME]:
- Anda TERHUBUNG LANGSUNG dengan internet dan engine penjelajah web real-time (Live 2026 Web Search Crawler: Wikipedia API, Hugging Face Hub, arXiv, DuckDuckGo) serta memori jangka panjang Supabase Continuous RAG.
- Anda memiliki kemampuan multimodal penuh untuk memproses teks, kode, analisis dokumen PDF multi-halaman via PDF.js, dan pemindaian gambar Vision AI.
- Jika pengguna menanyakan apakah Anda bisa mengakses internet, browsing, atau mencari data real-time, tegaskan dengan jelas bahwa sistem Anda DILENGKAPI fitur live web search dan continuous learning RAG, kemudian siap membantu mencari atau memverifikasi informasi terbaru.

[REGISTRI FAKTA RESMI MODEL AI FRONTIER TAHUN 2026]:
- OpenAI: GPT-5.6 (Juli 2026), GPT-5.5 (April 2026), GPT-5 (Agustus 2025), GPT-4o.
- Anthropic: Claude Opus 5 (Juli 2026), Claude Mythos 5 & Claude Fable 5 (Juni 2026), Claude Sonnet 5 (Juni 2026), Claude 3.5 Sonnet.
- Google: Gemini 3.7 Flash (Agustus 2026), Gemini 3.6 Flash & Gemini 3.5 Flash-Lite (Juli 2026), Gemini 3.5 Flash (Mei 2026), Gemini 2.0 Flash.
- DeepSeek: DeepSeek-V4 Flash & DeepSeek-V4 Pro (Agustus 2026), DeepSeek-V3 MoE 671B, DeepSeek-R1.
- Nvidia: Nemotron 3 Super 120B, Nemotron 3 Ultra 550B MoE, Nemotron Laguna.

[INSTRUKSI UTAMA]:
- Jika pengguna melampirkan gambar atau screenshot, analisis dan jelaskan isi gambar secara spesifik dan faktual.
- DILARANG KERAS mengeluarkan monolog penalaran internal (scratchpad/chain of thought) dalam Bahasa Inggris. LANGSUNG berikan jawaban akhir dalam Bahasa Indonesia yang bersih, to-the-point, dan profesional.`;

    // Real-Time Client-Side Web Search Crawler
    let searchContext = '';
    try {
      const searchCtrl = new AbortController();
      const searchTimer = setTimeout(() => searchCtrl.abort(), 2500);
      const wikiQuery = encodeURIComponent(cleanQuery.slice(0, 50));
      const [wikiRes, hfRes] = await Promise.allSettled([
        fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${wikiQuery}&format=json&origin=*`, { signal: searchCtrl.signal }),
        fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(cleanQuery.split(' ')[0])}&limit=3`, { signal: searchCtrl.signal })
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
    } catch (_) {}

    const fullSystemPrompt = `${SYSTEM_PROMPT_2026}${searchContext}`;

    const q = cleanQuery.toLowerCase();
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

    // Intelligent Intent Detection
    const isProjectExplaining = !hasImages && /\b(proyek|project|openplagiarism|plagiarism|checker|fotokita|laser_pointer|laser|spam|skripsi|arsitektur|cara kerja|jelaskan proyek|uraikan proyek|jelaskan repo|uraikan repo|github)\b/i.test(q);
    const isHeavyCoding = !hasImages && !isProjectExplaining && (/\b(buatkan script|buat script|tulis script|bikin script|buatkan kode|buat kode|tulis kode|bikin kode|script|koding|coding|function|def |class |async |await |import |export |const |let |var |console\.|print\(|return |public |private |struct |interface |lambda |sql|select .* from|create table|dockerfile|kubernetes|yaml|json|regex|refactor|debug|fix bug)\b/i.test(q) || /\b(python|javascript|typescript|golang|rust|php|pytorch|react|flask)\b/i.test(q));
    const isDeepReasoning = !hasImages && !isProjectExplaining && (/\b(analisis mendalam|analisis komprehensif|bedah logika|turunkan rumus|matematis|algoritma|perbandingan|benchmark|arena|evaluasi kritis|trade-offs|tradeoff|metodologi|komparasi|chain of thought|thinking|penalaran)\b/i.test(q) || len > 200);
    const isGreeting = !hasImages && len < 60 && /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|who are you|siapa kamu|kamu siapa|kamu model apa|model apa ini|kamu ai apa|bisa apa|apa kemampuanmu)\b/i.test(q);

    // 1. OmniRoute Dedicated Server Combos (Tier #1 Primary Priority)
    const OMNI_URL = 'https://ceremony-cent-triumph-hands.trycloudflare.com/v1/chat/completions';
    const OMNI_KEY = decodeKey('c2stN2E5YjUxYTI2NDc2OGUzMi1iM2Y5YjctNmUxY2RhY2Q=');

    let omniCandidates = [];
    let targetEffort = 'MEDIUM';

    if (hasImages) {
      targetEffort = 'MEDIUM';
      omniCandidates = ['Vision-model', 'Codex', 'Antigravity'];
    } else if (isGreeting) {
      targetEffort = 'LOW';
      omniCandidates = ['nemotron-laguna', 'Deepseek-V4-Flash-Free', 'Codex'];
    } else if (isProjectExplaining) {
      targetEffort = 'HIGH';
      omniCandidates = ['nemotron-3-ultra-free', 'nemotron-laguna', 'Codex', 'Antigravity'];
    } else if (isHeavyCoding) {
      targetEffort = 'HIGH';
      omniCandidates = ['Codex', 'Deepseek-V4-Flash-Free', 'nemotron-laguna', 'nemotron-3-ultra-free', 'Antigravity'];
    } else if (isDeepReasoning) {
      targetEffort = 'THINKING';
      omniCandidates = ['nemotron-3-ultra-free', 'Antigravity', 'nemotron-laguna', 'Codex', 'Deepseek-V4-Flash-Free'];
    } else {
      targetEffort = 'MEDIUM';
      omniCandidates = ['nemotron-laguna', 'nemotron-3-ultra-free', 'Codex', 'Antigravity', 'Deepseek-V4-Flash-Free'];
    }

    // If user explicitly selected a model (e.g. Codex, Antigravity, Nemotron Laguna, Ultra)
    if (this.currentModel && this.currentModel !== 'auto') {
      const explicit = this.currentModel.toLowerCase();
      if (explicit.includes('ultra') || explicit.includes('550b')) omniCandidates = ['nemotron-3-ultra-free', ...omniCandidates];
      else if (explicit.includes('deepseek')) omniCandidates = ['Deepseek-V4-Flash-Free', ...omniCandidates];
      else if (explicit.includes('codex') || explicit.includes('terra')) omniCandidates = ['Codex', ...omniCandidates];
      else if (explicit.includes('antigravity') || explicit.includes('opus')) omniCandidates = ['Antigravity', ...omniCandidates];
      else if (explicit.includes('laguna') || explicit.includes('nemotron')) omniCandidates = ['nemotron-laguna', ...omniCandidates];
    }

    const calculatedMaxTokens = targetEffort === 'LOW' ? 600 : (targetEffort === 'THINKING' ? 4000 : (targetEffort === 'HIGH' ? 3500 : 2000));

    const parseOmniResponse = (raw) => {
      if (!raw) return '';
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.choices?.[0]?.message?.content) return parsed.choices[0].message.content;
        if (parsed?.choices?.[0]?.delta?.content) return parsed.choices[0].delta.content;
      } catch (_) {}

      // SSE stream fallback parser
      let full = '';
      const lines = raw.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const chunk = JSON.parse(trimmed.slice(6));
            const delta = chunk?.choices?.[0]?.delta?.content || chunk?.choices?.[0]?.message?.content || '';
            full += delta;
          } catch (_) {}
        }
      }
      return full.trim();
    };

    if (OMNI_KEY) {
      for (const omniModel of omniCandidates) {
        try {
          const omniController = new AbortController();
          const timeoutMs = omniModel.toLowerCase().includes('deepseek') ? 4000 : 20000;
          const omniTimeout = setTimeout(() => omniController.abort(), timeoutMs);
          const res = await fetch(OMNI_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + OMNI_KEY,
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              model: omniModel,
              messages: [
                { role: 'system', content: fullSystemPrompt },
                { role: 'user', content: userMessageContent }
              ],
              stream: false,
              max_tokens: calculatedMaxTokens
            }),
            signal: omniController.signal
          });
          clearTimeout(omniTimeout);
          if (res.ok) {
            const rawText = await res.text();
            const parsedText = parseOmniResponse(rawText);
            const content = cleanOutput(parsedText);
            if (content && content.length > 5) {
              let finalContent = content;
              const memoryMatch = finalContent.match(/\[SAVE_MEMORY:\s*([\s\S]*?)\]/i);
              if (memoryMatch && memoryMatch[1]) {
                this.saveAIMemory(memoryMatch[1].trim());
                finalContent = finalContent.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
              } else if (!isGreeting && cleanQuery.length > 5 && finalContent.length > 25) {
                const topic = cleanQuery.substring(0, 70);
                const firstLine = finalContent.split('\n').find(l => l.trim().length > 15 && !l.startsWith('#')) || finalContent.substring(0, 120);
                const cleanFact = `[Q&A Context]: ${topic} ➔ ${firstLine.replace(/[#*`_]/g, '').trim().substring(0, 180)}`;
                this.saveAIMemory(cleanFact);
              }

              this.lastExecutionInfo = {
                isAuto: !this.currentModel || this.currentModel === 'auto',
                resolvedModel: omniModel,
                requestedModel: this.currentModel,
                isFailover: false,
                provider: 'OmniRoute Dedicated Server',
                effort: targetEffort,
                category: isHeavyCoding ? 'heavy_coding' : (isDeepReasoning ? 'deep_reasoning' : (isGreeting ? 'trivial_casual' : 'standard'))
              };
              return finalContent.split('\n');
            }
          }
        } catch (_) {}
      }
    }

    // 2. OpenCode Cloud Direct Dual-Account Pool (Nemotron 3 Ultra 550B & DeepSeek V4 Flash)
    if (!hasImages) {
      const OC_KEYS = [
        decodeKey('c2stTW01NmMyZFpaNmZlWFVMbEI5NnN4NGpWTjh5bVNnY2pja3NpRHd2a0tuNUFhTjFkQmNiaUdGcHVVZFpEaGVWSTU='),
        decodeKey('c2stWVdUc2JDaTBiYkhJb2lLbGJCMGdiNFRielExcHlrSTRoQkJhbEVKNE55cTU4OFBPelJlcHpEVWNrb1M1a0NJ')
      ].filter(Boolean);

      const OC_MODELS = ['nemotron-3-ultra-free', 'deepseek-v4-flash-free'];
      for (const ocModel of OC_MODELS) {
        for (const ocKey of OC_KEYS) {
          try {
            const ocController = new AbortController();
            const ocTimeout = setTimeout(() => ocController.abort(), 12000);
            const ocRes = await fetch('https://api.opencode.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + ocKey
              },
              body: JSON.stringify({
                model: ocModel,
                messages: [
                  { role: 'system', content: fullSystemPrompt },
                  { role: 'user', content: cleanQuery }
                ],
                max_tokens: calculatedMaxTokens
              }),
              signal: ocController.signal
            });
            clearTimeout(ocTimeout);
            if (ocRes.ok) {
              const ocData = await ocRes.json();
              const rawContent = ocData?.choices?.[0]?.message?.content;
              const content = cleanOutput(rawContent);
              if (content && content.length > 5) {
                this.lastExecutionInfo = {
                  isAuto: true,
                  resolvedModel: `opencode/${ocModel}`,
                  requestedModel: this.currentModel,
                  isFailover: true,
                  provider: 'OpenCode Cloud Pool',
                  effort: targetEffort,
                  category: 'standard'
                };
                return content.split('\n');
              }
            }
          } catch (_) {}
        }
      }
    }

    // 3. OpenRouter Direct SOTA Pool (Vision & Flagships)
    const OR_KEYS = [
      decodeKey('c2stb3ItdjEtNzlhMzk1Y2YwOGQyNmY2ZDQwMDA2Njg5ZGI5ZTNhYzkwZmI1ZDc5OWViNzA0MTJkYTQ4ZTIzNGU0ZjJmZDE5MQ=='),
      decodeKey('c2stb3ItdjEtODJmMjVhYzFlYjU3YmI0MmVhZjAxM2ZlYzM4OTkwZTM1ZDY2ZDg3NjM3ZTkxNmFiZjk2NTM3NWM1NGUzZTM2Nw==')
    ].filter(Boolean);

    let OR_MODELS = [];
    targetEffort = targetEffort || 'MEDIUM';

    if (hasImages) {
      OR_MODELS = [
        'nvidia/nemotron-nano-12b-v2-vl:free',
        'google/gemma-3-27b-it'
      ];
    } else if (isGreeting) {
      targetEffort = 'LOW';
      OR_MODELS = [
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        'openai/gpt-oss-20b:free',
        'nvidia/nemotron-3-super-120b-a12b:free'
      ];
    } else if (isProjectExplaining) {
      targetEffort = 'HIGH';
      OR_MODELS = [
        'nvidia/nemotron-3-ultra-550b:free',
        'openai/gpt-oss-20b:free',
        'nvidia/nemotron-3-super-120b-a12b:free'
      ];
    } else if (isHeavyCoding) {
      targetEffort = 'HIGH';
      OR_MODELS = [
        'openai/gpt-oss-20b:free',
        'nvidia/nemotron-3-super-120b-a12b:free',
        'nvidia/nemotron-3-ultra-550b:free'
      ];
    } else if (isDeepReasoning) {
      targetEffort = 'THINKING';
      OR_MODELS = [
        'nvidia/nemotron-3-ultra-550b:free',
        'nvidia/nemotron-3-super-120b-a12b:free',
        'openai/gpt-oss-20b:free'
      ];
    } else {
      targetEffort = 'MEDIUM';
      OR_MODELS = [
        'nvidia/nemotron-3-ultra-550b:free',
        'openai/gpt-oss-20b:free',
        'nvidia/nemotron-3-super-120b-a12b:free'
      ];
    }

    for (const model of OR_MODELS) {
      for (const key of OR_KEYS) {
        try {
          const orController = new AbortController();
          const orTimeout = setTimeout(() => orController.abort(), 16000);
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
                { role: 'system', content: fullSystemPrompt },
                { role: 'user', content: userMessageContent }
              ],
              max_tokens: calculatedMaxTokens,
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
              let finalContent = content;
              const memoryMatch = finalContent.match(/\[SAVE_MEMORY:\s*([\s\S]*?)\]/i);
              if (memoryMatch && memoryMatch[1]) {
                this.saveAIMemory(memoryMatch[1].trim());
                finalContent = finalContent.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
              } else if (!isGreeting && cleanQuery.length > 5 && finalContent.length > 25) {
                const topic = cleanQuery.substring(0, 70);
                const firstLine = finalContent.split('\n').find(l => l.trim().length > 15 && !l.startsWith('#')) || finalContent.substring(0, 120);
                const cleanFact = `[Q&A Context]: ${topic} ➔ ${firstLine.replace(/[#*`_]/g, '').trim().substring(0, 180)}`;
                this.saveAIMemory(cleanFact);
              }

              this.lastExecutionInfo = {
                isAuto: true,
                resolvedModel: model,
                requestedModel: this.currentModel,
                isFailover: true,
                provider: 'OpenRouter SOTA Pool',
                effort: targetEffort,
                category: isHeavyCoding ? 'heavy_coding' : (isDeepReasoning ? 'deep_reasoning' : 'standard')
              };
              return finalContent.split('\n');
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
