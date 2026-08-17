/**
 * ============================================================================
 * RAFLY FIRMANSYAH - TERMINAL DEVELOPER LAB AI ENGINE (v3.7.0)
 * Dual-Engine Architecture:
 * 1. Cloud Serverless Multi-API Gateway (/api/chat) -> OpenRouter, Nvidia NIM, MiniMax, Opencode
 * 2. In-Browser Local Semantic Knowledge Engine -> 100% Offline & Infinite Quota
 * Supports: Visitor Custom API Keys & Dynamic Model Selection
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA, TIMELINE_DATA } from './data.js';

// ============================================================================
// 1. LOCAL IN-BROWSER SEMANTIC KNOWLEDGE BASE (Fail-Safe Instant Fallback)
// ============================================================================
const SEMANTIC_PATTERNS = [
  {
    category: 'profile',
    keywords: ['siapa', 'biodata', 'profil', 'tentang', 'about', 'nama', 'background', 'kuliah', 'kampus', 'ubsi', 'lulusan', 'jurusan', 'mahasiswa'],
    respond: () => [
      `Nama        : ${DEVELOPER_PROFILE.name} (${DEVELOPER_PROFILE.handle})`,
      `Pendidikan  : ${DEVELOPER_PROFILE.degree}`,
      `Institusi   : ${DEVELOPER_PROFILE.institution}`,
      `Domisili    : ${DEVELOPER_PROFILE.location}`,
      `Fokus Riset : NLP & Machine Learning, Computer Vision, dan Jaringan MikroTik`,
      `Status      : ${DEVELOPER_PROFILE.status}`,
      "",
      DEVELOPER_PROFILE.bio
    ]
  },
  {
    category: 'plagiarism',
    keywords: ['plagiat', 'plagiarism', 'openplagiarism', 'turnitin', 'skripsi', 'n-gram', 'shingling', 'transformer', 'similarity'],
    respond: () => [
      "OpenPlagiarismChecker adalah mesin pemeriksa kesamaan teks akademik lokal mandiri yang mengutamakan privasi data.",
      "",
      "Arsitektur:",
      "1. Exact Matching      : 5-Word N-Gram Shingling untuk pencocokan kata persis.",
      "2. Semantic Paraphrase : Multilingual Sentence Transformers untuk deteksi sinonim/parafrasa.",
      "3. Pangkalan Data Luas : Merujuk silang ke 15+ basis data literatur terbuka (GARUDA, Indonesia OneSearch, Neliti, BASE, OpenAlex, Semantic Scholar).",
      "4. Terisolasi Lokal    : Dokumen diproses di lingkungan lokal tanpa kebocoran data ke server pihak ketiga.",
      "",
      "Teknologi: Python, Flask, PyTorch, Sentence-Transformers, N-Gram, Web Scraping.",
      "Repositori: https://github.com/Raflyf/OpenPlagiarismChecker"
    ]
  },
  {
    category: 'spam',
    keywords: ['spam', 'email', 'classifier', 'klasifikasi', 'naive bayes', 'xgboost', 'confusion matrix', 'dataset'],
    respond: () => [
      "Aplikasi web riset evaluasi dan klasifikasi email spam berbasis Machine Learning.",
      "",
      "Fitur Utama:",
      "1. Perbandingan Real-time : Evaluasi performa algoritma Naive Bayes vs XGBoost secara langsung.",
      "2. Batch Evaluation       : Uji coba massal ribuan sampel dataset via unggah berkas .csv.",
      "3. Dynamic Class Tuning   : Pengaturan proporsi rasio kelas data dari 10:90 hingga 90:10.",
      "4. Metrik Visual          : Tampilan visual Confusion Matrix, Akurasi, Presisi, Recall, dan F1-Score.",
      "",
      "Teknologi: Python, Scikit-Learn, XGBoost, Flask, Pandas, Chart.js.",
      "Repositori: https://github.com/Raflyf/Spam-Email"
    ]
  },
  {
    category: 'laser_pointer',
    keywords: ['laser', 'pointer', 'ppt', 'powerpoint', 'presentasi', 'gyroscope', 'remote', 'touchpad', 'nirsentuh'],
    respond: () => [
      "Aplikasi pengubah smartphone menjadi laser pointer virtual dan remote touchpad untuk presentasi PowerPoint di laptop.",
      "",
      "Keunggulan:",
      "- Memanfaatkan sensor gyroscope browser (DeviceOrientation API) tanpa instalasi aplikasi di HP.",
      "- Transmisi ultra-low latency via WebSocket (Flask-SocketIO).",
      "- Sistem pairing instan dengan QR-Code lokal dan token keamanan dinamis.",
      "",
      "Teknologi: Python, Flask-SocketIO, PyAutoGUI, WebSockets, JavaScript.",
      "Repositori: https://github.com/Raflyf/laser_pointer_PPT"
    ]
  },
  {
    category: 'fotokita',
    keywords: ['fotokita', 'blur', 'mediapipe', 'gesture', 'gestur', 'kamera', 'privasi', 'opencv', 'v-sign'],
    respond: () => [
      "Sistem deteksi gestur tangan realtime berbasis browser menggunakan MediaPipe Tasks Vision dan OpenCV.",
      "",
      "Fitur:",
      "- Deteksi gestur dua jari (V-Sign) secara lokal di browser untuk penyamaran wajah otomatis (Privacy Filter).",
      "- Edge AI Inference murni di sisi klien (kamera tidak dikirim ke server).",
      "- Kamus gestur interaktif dan fallback mandiri script Python OpenCV.",
      "",
      "Teknologi: JavaScript, MediaPipe Tasks Vision, OpenCV, WebRTC.",
      "Repositori: https://github.com/Raflyf/FotoKitaBlur"
    ]
  },
  {
    category: 'certificates',
    keywords: ['sertif', 'sertifikat', 'certificate', 'kredensial', 'bnsp', 'mtcna', 'mikrotik', 'cisco', 'pcap', 'kompetensi', 'lisensi'],
    respond: () => [
      "Rafly Firmansyah memiliki 10 sertifikasi kompetensi autentik:",
      "",
      "1. BNSP (Badan Nasional Sertifikasi Profesi) & LSP UBSI:",
      "   - Sertifikat Kompetensi Pengembang Perangkat Lunak (Kualifikasi: Analis Program).",
      "   - Memvalidasi 10 Unit Kompetensi (Skalabilitas, SQL, Basis Data, Algoritma, Dokumentasi, Debugging, Profiling, Code Review, Testing).",
      "",
      "2. MikroTik (Riga, Latvia):",
      "   - MTCNA: MikroTik Certified Network Associate (ID: 2502NA6383).",
      "",
      "3. Cisco Networking Academy & OpenEDG:",
      "   - PCAP: Programming Essentials in Python.",
      "",
      "4. Sertifikasi Lainnya: IT Bootcamp Network Security (FTI UBSI), Cloud Computing (FTI UBSI), Google Profil Bisnis & E-Commerce (Kominfo), Full-Stack Web (Harisenin)."
    ]
  },
  {
    category: 'skills',
    keywords: ['skill', 'keahlian', 'kemampuan', 'stack', 'teknologi', 'bahasa', 'framework', 'python', 'javascript', 'backend', 'frontend'],
    respond: () => [
      "Peta Keahlian & Teknologi:",
      "1. AI & Machine Learning : Python 3, PyTorch, Scikit-Learn, XGBoost, Sentence-Transformers, NLP, N-Gram, Pandas, NumPy.",
      "2. Vision & Realtime     : MediaPipe Tasks Vision, OpenCV, Flask-SocketIO, WebSockets, PyAutoGUI.",
      "3. Jaringan & Keamanan   : MikroTik RouterOS (MTCNA Certified), Routing, Firewall Security, QoS Bandwidth, Tunnels.",
      "4. Backend & Web Systems : Python Flask, PHP 8 MVC, RESTful APIs, MySQL Database, Supabase RLS.",
      "5. Frontend & UI Engine  : Modern Vanilla JavaScript (ES6+), HTML5 Semantik, CSS3 OKLCH Design Tokens, Chart.js."
    ]
  },
  {
    category: 'contact',
    keywords: ['kontak', 'hubungi', 'contact', 'email', 'wa', 'whatsapp', 'nomor', 'telepon', 'pesan', 'hire', 'hire me', 'rekrut', 'jasa'],
    respond: () => [
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
      `Custom Key Status    : ${this.customKey ? `Terpasang (${this.customProvider.toUpperCase()})` : 'Default Server-Side Gateway'}`,
      `Fallback Engine      : In-Browser Semantic Knowledge Engine (Active & Ready)`
    ];
  }

  /**
   * Main Ask method: First tries serverless Cloud AI, then seamlessly falls back to Local Semantic Engine
   */
  async ask(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return ["Silakan masukkan pertanyaan atau perintah."];

    // Check Ollama locally if developer is on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const ollamaRes = await this.tryLocalOllama(cleanQuery);
        if (ollamaRes) return ollamaRes;
      } catch (_) {}
    }

    // Primary: Call Vercel Serverless Function /api/chat with generous 30s timeout
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

    // High-Precision In-Browser Semantic Engine Fallback for specific portfolio topics
    const semanticMatch = this.checkSemanticMatch(cleanQuery);
    if (semanticMatch) {
      return semanticMatch;
    }

    // Generic friendly response if completely offline or unreachable
    return [
      "Maaf, saat ini koneksi ke model AI cloud sedang mengalami kendala jaringan atau antrean tinggi.",
      "Anda dapat mengulangi pertanyaan Anda kembali, atau menggunakan perintah CLI seperti 'skills', 'projects', 'certifs', 'benchmarks', 'contact'."
    ];
  }

  async tryLocalOllama(query) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:latest',
        messages: [{ role: 'user', content: query }],
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        return content.split('\n');
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
