/**
 * ============================================================================
 * TERMINAL AI ASSISTANT & LOCAL SEMANTIC KNOWLEDGE ENGINE (v4.5.0)
 * Hybrid Client-Side Engine for Developer Lab Simulator
 * Features:
 * 1. Native OmniRoute Local AI Gateway Bridge (Opencode, Ollama Cloud, Minimax M3, Nemotron)
 * 2. Vercel Serverless Multi-API Cloud Gateway Fallback (/api/chat)
 * 3. In-Browser Sub-15ms Exact & Semantic Pattern Engine for Offline Resilience
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js';

// ============================================================================
// 1. IN-BROWSER SEMANTIC KNOWLEDGE BASE (100% Offline Standalone Fallback)
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
    this.customKey = localStorage.getItem('ai_custom_key') || '';
    this.customProvider = localStorage.getItem('ai_custom_provider') || 'openrouter';
  }

  setModel(modelName) {
    const m = modelName.trim();
    if (!m) return;
    this.currentModel = m;
    localStorage.setItem('ai_selected_model', m);
  }

  setKey(providerOrKey, key) {
    if (!key) {
      this.customKey = providerOrKey.trim();
      this.customProvider = 'openrouter';
      localStorage.setItem('ai_custom_key', this.customKey);
      localStorage.setItem('ai_custom_provider', 'openrouter');
      return ["API Key pribadi Anda berhasil disimpan di peramban lokal (localStorage)."];
    }

    const prov = providerOrKey.toLowerCase().trim();
    this.customProvider = prov;
    this.customKey = key.trim();
    localStorage.setItem('ai_custom_provider', prov);
    localStorage.setItem('ai_custom_key', this.customKey);
    return [`API Key untuk provider [${prov}] berhasil disimpan di peramban lokal Anda.`];
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
      `Custom Key Status    : ${this.customKey ? `Terpasang (${this.customProvider.toUpperCase()})` : 'Default Server Gateway'}`,
      `OmniRoute Bridge     : Aktif (http://localhost:20128/v1/chat/completions)`,
      `Cloud Gateway        : Vercel Serverless Multi-API Gateway (/api/chat)`,
      `Fallback Engine      : In-Browser Semantic Knowledge Engine (Active & Ready)`
    ];
  }

  /**
   * OmniRoute Local AI Gateway Bridge (Opencode, Ollama Cloud, Nemotron, Minimax)
   */
  async tryOmniRoute(query, model) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const targetModel = model.startsWith('oc/') || model.startsWith('ollamacloud/') || model.startsWith('minimax/') || model.startsWith('nvidia/')
        ? model
        : (model === 'auto' ? 'oc/deepseek-v4-flash-free' : model);

      const res = await fetch('http://localhost:20128/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: query }],
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (res.ok) {
        const textRaw = await res.text();
        let content = '';
        try {
          const j = JSON.parse(textRaw);
          content = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text;
        } catch (_) {
          // SSE fallback parser
          const lines = textRaw.split('\n');
          for (const l of lines) {
            if (l.startsWith('data: ') && l !== 'data: [DONE]') {
              try {
                const pj = JSON.parse(l.slice(6));
                const chunk = pj.choices?.[0]?.delta?.content || pj.choices?.[0]?.text;
                if (chunk) content += chunk;
              } catch (_) {}
            }
          }
        }

        if (content && content.trim()) {
          return content.trim().split('\n');
        }
      }
    } catch (_) {
      // OmniRoute not active on client device
    }
    return null;
  }

  /**
   * Main Ask method: First checks Local OmniRoute, then HF Cloud Gateway, then Vercel Serverless, then Local Semantic
   */
  async ask(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return ["Silakan masukkan pertanyaan atau perintah."];

    // 1. Try local OmniRoute (when running on laptop)
    try {
      const omniRes = await this.tryOmniRoute(cleanQuery, this.currentModel);
      if (omniRes && omniRes.length > 0) {
        return omniRes;
      }
    } catch (_) {}

    // 2. Try Hugging Face Dedicated Cloud OmniRoute Gateway (24/7 Online)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const base = 'https://rflyyyf-omniroute-gateway.hf.space';
      const hfPost = await fetch(`${base}/gradio_api/call/chat_fn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [cleanQuery, []] }),
        signal: controller.signal
      });

      if (hfPost.ok) {
        const postData = await hfPost.json();
        if (postData?.event_id) {
          const eventRes = await fetch(`${base}/gradio_api/call/chat_fn/${postData.event_id}`, {
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (eventRes.ok) {
            const rawEvent = await eventRes.text();
            const lines = rawEvent.split('\n');
            for (const l of lines) {
              if (l.startsWith('data: ')) {
                try {
                  const arr = JSON.parse(l.slice(6));
                  if (Array.isArray(arr) && arr.length > 0) {
                    const text = arr[0];
                    if (text && typeof text === 'string') {
                      return text.trim().split('\n');
                    }
                  }
                } catch (_) {}
              }
            }
          }
        }
      }
      clearTimeout(timeout);
    } catch (_) {}

    // 3. Try Vercel Serverless Function /api/chat with generous 30s timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanQuery,
          model: this.currentModel,
          customKey: this.customKey,
          customProvider: this.customProvider
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.response) {
          return data.response.split('\n');
        }
      }
    } catch (_) {
      // Network timeout / offline -> fall back to local semantic engine
    }

    // 4. High-Precision In-Browser Semantic Engine Fallback
    const semanticMatch = this.checkSemanticMatch(cleanQuery);
    if (semanticMatch) {
      return semanticMatch;
    }

    // 5. Generic friendly response if completely offline
    return [
      "Maaf, saat ini koneksi ke model AI sedang mengalami kendala jaringan.",
      "Anda dapat mengulangi pertanyaan Anda kembali, atau menggunakan perintah CLI seperti 'skills', 'projects', 'certifs', 'benchmarks', 'contact'."
    ];
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
