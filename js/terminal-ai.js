/**
 * ============================================================================
 * RAFLY FIRMANSYAH - TERMINAL DEVELOPER LAB AI ENGINE
 * Multi-API Cascade (DeepSeek/OpenRouter, Groq, Gemini, Ollama)
 * With High-Precision In-Browser Semantic Fallback Engine
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA, TIMELINE_DATA } from './data.js';

// ============================================================================
// 1. SYSTEM GROUNDING KNOWLEDGE
// ============================================================================
const SYSTEM_GROUNDING_PROMPT = `
Anda adalah AI Assistant interaktif pada Terminal Developer Lab di website portofolio profesional Rafly Firmansyah (@Raflyf).
Tugas Anda adalah menjawab pertanyaan pengunjung terminal dengan ramah, lugas, profesional, akurat, dan berbasis data nyata (tanpa halusinasi dan tanpa overclaim).

DATA RESMI PROFIL RAFLY FIRMANSYAH:
- Nama Lengkap: Rafly Firmansyah
- Gelar/Pendidikan: Mahasiswa Program Sarjana (S1) Informatika di Universitas Bina Sarana Informatika (UBSI), Kampus Sukabumi
- Lokasi: Cianjur / Sukabumi, Jawa Barat, Indonesia
- Minat & Fokus: Kecerdasan Buatan (NLP, Machine Learning, Computer Vision), Jaringan Komputer MikroTik, dan Rekayasa Perangkat Lunak Modern
- Status: Terbuka untuk proyek rekayasa perangkat lunak, riset AI/ML, dan kolaborasi profesional
- Kontak Resmi:
  * WhatsApp: 08991333323 (https://wa.me/628991333323)
  * Email: raflyfirmansyah02@gmail.com
  * GitHub: https://github.com/Raflyf
  * Portofolio: https://raflyfirmansyah-portofolio.vercel.app/

PROYEK UNGGULAN GITHUB:
1. OpenPlagiarismChecker:
   - Deskripsi: Mesin pemeriksa kesamaan teks akademik lokal mengutamakan privasi.
   - Arsitektur: 5-word N-Gram Shingling (Exact matching) + Multilingual Sentence Transformers (Semantic paraphrasing).
   - Indeks: 15+ basis data literatur publik (GARUDA, Indonesia OneSearch, Neliti, BASE, OpenAlex, Semantic Scholar).
   - Stack: Python, Flask, PyTorch, Sentence-Transformers, N-Gram, Web Scraping.
2. Spam-Email Detection System:
   - Deskripsi: Aplikasi web evaluasi dan klasifikasi email spam berbasis Machine Learning.
   - Arsitektur: Komparasi performa Naive Bayes vs XGBoost dengan tuning proporsi kelas dataset fleksibel (10:90 hingga 90:10) dan visualisasi Confusion Matrix.
   - Stack: Python, Scikit-Learn, XGBoost, Flask, Pandas, Chart.js.
3. laser_pointer_PPT:
   - Deskripsi: Pengendali presentasi PowerPoint nirsentuh dari smartphone menggunakan sensor gyroscope dan touchpad web via WebSocket.
   - Stack: Python, Flask-SocketIO, PyAutoGUI, WebSockets, DeviceOrientation API.
4. FotoKitaBlur:
   - Deskripsi: Sistem deteksi gestur tangan realtime berbasis browser (MediaPipe Tasks Vision + OpenCV) untuk privasi kamera (blur otomatis saat V-Sign).
   - Stack: JavaScript, MediaPipe Tasks Vision, OpenCV, WebRTC.
5. Bespoke Web Portfolio:
   - Deskripsi: Platform portofolio web rekayasa performa tinggi berarsitektur modular Vanilla JS, sistem desain OKLCH, kepatuhan aksesibilitas WCAG 2.2 AA, dan panel telemetri admin.

KUMPULAN SERTIFIKASI & KOMPETENSI AUTENTIK (10 SERTIFIKAT):
1. BNSP: Sertifikat Kompetensi Analis Program (Program Analyst) — Badan Nasional Sertifikasi Profesi & LSP UBSI (10 Unit Kompetensi terstandarisasi industri: Skalabilitas, SQL, Basis Data, Algoritma, Dokumentasi Kode, Debugging, Profiling, Code Review, Unit Testing, Integration Testing).
2. MikroTik: MTCNA (MikroTik Certified Network Associate) — Mikrotikls SIA (Riga, Latvia).
3. Cisco & OpenEDG: PCAP (Programming Essentials in Python).
4. FTI UBSI: Seminar Cloud Computing and Blockchain.
5. FTI UBSI: IT Bootcamp Software Development & Network Security.
6. FTI UBSI: Seminar How to be a Cloud Computing Specialist.
7. Kominfo RI: Google Profil Bisnis & E-Commerce (Digital Entrepreneurship Academy).
8. UBSI HIMASI: Workshop Slicing UI with Tailwind CSS.
9. Harisenin.com: Simulasi Kerja (SiM-K) Full-Stack Web Developer.
10. Harisenin.com: Coding Camp Introduction to JavaScript for Beginners.

PANDUAN MENJAWAB:
- Jawablah dalam format terminal yang bersih (tanpa markup berlebihan).
- Gunakan Bahasa Indonesia yang sopan dan percaya diri, atau sesuaikan dengan bahasa pertanyaan pengunjung.
- Dilarang menggunakan emoji sama sekali.
- Jika pengunjung menanyakan hal di luar profil Rafly, jawab secara singkat dan arahkan kembali ke eksplorasi portofolio.
`;

// ============================================================================
// 2. LOCAL IN-BROWSER SEMANTIC KNOWLEDGE ENGINE (100% Offline & Infinite Quota)
// ============================================================================
const SEMANTIC_PATTERNS = [
  {
    category: 'profile',
    keywords: ['siapa', 'biodata', 'profil', 'tentang', 'about', 'nama', 'background', 'kuliah', 'kampus', 'ubsi', 'lulusan', 'jurusan', 'mahasiswa'],
    respond: () => [
      "[PROFIL PENGEMBANG]",
      "----------------------------------------------------------------",
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
      "[RISET: OPENPLAGIARISMCHECKER]",
      "----------------------------------------------------------------",
      "OpenPlagiarismChecker adalah mesin pemeriksa kesamaan teks akademik lokal mandiri yang mengutamakan privasi data.",
      "",
      "Keunggulan Arsitektur:",
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
      "[RISET: SPAM-EMAIL CLASSIFIER]",
      "----------------------------------------------------------------",
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
      "[PROYEK: LASER_POINTER_PPT]",
      "----------------------------------------------------------------",
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
      "[PROYEK: FOTOKITABLUR]",
      "----------------------------------------------------------------",
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
      "[KREDENSIAL & SERTIFIKASI RESMI TERVERIFIKASI]",
      "----------------------------------------------------------------",
      "Rafly Firmansyah memiliki 10 sertifikasi kompetensi autentik:",
      "",
      "1. BNSP (Badan Nasional Sertifikasi Profesi):",
      "   - Sertifikat Kompetensi Pengembang Perangkat Lunak (Kualifikasi: Analis Program).",
      "   - Memvalidasi 10 Unit Kompetensi (Skalabilitas, SQL, Algoritma, Debugging, Code Review, Testing, dll).",
      "",
      "2. MTCNA (Mikrotikls SIA - Latvia):",
      "   - MikroTik Certified Network Associate (Credential: 2502NA6383).",
      "",
      "3. Cisco Networking Academy & OpenEDG Python Institute:",
      "   - PCAP: Programming Essentials in Python.",
      "",
      "4. Sertifikasi Lainnya:",
      "   - IT Bootcamp Network Security (FTI UBSI).",
      "   - Seminar Cloud Computing & Blockchain (FTI UBSI).",
      "   - Google Profil Bisnis & E-Commerce (Kominfo RI).",
      "   - Full-Stack Web SiM-K & JavaScript (Harisenin).",
      "",
      "Dokumen resmi dapat dilihat di bagian 'Kredensial Resmi' pada halaman web ini."
    ]
  },
  {
    category: 'skills',
    keywords: ['skill', 'keahlian', 'kemampuan', 'stack', 'teknologi', 'bahasa', 'framework', 'python', 'javascript', 'backend', 'frontend'],
    respond: () => [
      "[PETA KEAHLIAN & TEKNOLOGI]",
      "----------------------------------------------------------------",
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
      "[SALURAN KOMUNIKASI RESMI]",
      "----------------------------------------------------------------",
      `Nama     : ${DEVELOPER_PROFILE.name}`,
      `WhatsApp : ${DEVELOPER_PROFILE.whatsapp} (${DEVELOPER_PROFILE.whatsappUrl})`,
      `Email    : ${DEVELOPER_PROFILE.email}`,
      `GitHub   : ${DEVELOPER_PROFILE.github}`,
      `Website  : https://raflyfirmansyah-portofolio.vercel.app/`,
      "",
      "Silakan hubungi melalui WhatsApp atau formulir di bagian bawah halaman untuk diskusi kolaborasi."
    ]
  },
  {
    category: 'greeting',
    keywords: ['halo', 'hai', 'hello', 'hi', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'tes', 'ping'],
    respond: () => [
      "[SISTEM TERMINAL AKTIF]",
      "----------------------------------------------------------------",
      "Halo. Saya adalah asisten AI interaktif untuk portofolio Rafly Firmansyah.",
      "Anda dapat menanyakan hal apapun terkait riwayat akademik, riset skripsi, sertifikasi BNSP/MikroTik, atau keahlian teknis Rafly.",
      "",
      "Contoh pertanyaan:",
      "- 'Ceritakan tentang riset OpenPlagiarismChecker'",
      "- 'Apa saja unit kompetensi sertifikat BNSP Rafly?'",
      "- 'Bagaimana cara menghubungi Rafly via WhatsApp?'"
    ]
  }
];

// ============================================================================
// 3. MULTI-API CASCADE POOL CONFIGURATION
// ============================================================================
class TerminalAIEngine {
  constructor() {
    this.customKeys = {
      openrouter: localStorage.getItem('ai_key_openrouter') || '',
      groq: localStorage.getItem('ai_key_groq') || '',
      gemini: localStorage.getItem('ai_key_gemini') || '',
      deepseek: localStorage.getItem('ai_key_deepseek') || ''
    };
    this.status = 'Ready (Multi-Engine Active)';
  }

  setKey(provider, key) {
    const prov = provider.toLowerCase().trim();
    if (this.customKeys.hasOwnProperty(prov)) {
      this.customKeys[prov] = key.trim();
      localStorage.setItem(`ai_key_${prov}`, key.trim());
      return `API Key untuk [${prov}] berhasil disimpan di localStorage lokal peramban Anda.`;
    }
    return `Provider '${prov}' tidak dikenal. Pilihan: openrouter, groq, gemini, deepseek`;
  }

  getStatus() {
    return {
      status: this.status,
      configuredProviders: Object.entries(this.customKeys)
        .filter(([_, k]) => Boolean(k))
        .map(([p]) => p),
      fallbackEngine: 'Local Semantic Knowledge Engine (Active)'
    };
  }

  /**
   * Main Query Function: Cascades through Cloud APIs, then Local Engine
   */
  async ask(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return ["Silakan masukkan pertanyaan atau perintah."];

    // Check Local Semantic Engine first for rapid exact matches
    const semanticMatch = this.checkSemanticMatch(cleanQuery);

    // If custom API keys or cloud providers are configured, try calling them
    const cloudResponse = await this.tryCloudCascade(cleanQuery);
    if (cloudResponse && cloudResponse.length > 0) {
      return cloudResponse;
    }

    // Default High-Precision Semantic Knowledge Fallback
    if (semanticMatch) {
      return semanticMatch;
    }

    // Intelligent Synthesis Fallback for generic questions
    return this.generateSmartSynthesis(cleanQuery);
  }

  /**
   * Match user query against semantic pattern knowledge base
   */
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

  /**
   * Cascade through available Cloud AI endpoints with strict timeout
   */
  async tryCloudCascade(query) {
    // 1. Check if Ollama is running locally on developer machine
    try {
      const ollamaRes = await this.callOllama(query);
      if (ollamaRes) return ollamaRes;
    } catch (_) {}

    // 2. Check OpenRouter / DeepSeek
    if (this.customKeys.openrouter || this.customKeys.deepseek) {
      try {
        const key = this.customKeys.openrouter || this.customKeys.deepseek;
        const res = await this.callOpenRouter(query, key);
        if (res) return res;
      } catch (_) {}
    }

    // 3. Check Groq API
    if (this.customKeys.groq) {
      try {
        const res = await this.callGroq(query, this.customKeys.groq);
        if (res) return res;
      } catch (_) {}
    }

    // 4. Check Gemini API
    if (this.customKeys.gemini) {
      try {
        const res = await this.callGemini(query, this.customKeys.gemini);
        if (res) return res;
      } catch (_) {}
    }

    return null;
  }

  async callOllama(query) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const res = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:latest',
        messages: [
          { role: 'system', content: SYSTEM_GROUNDING_PROMPT },
          { role: 'user', content: query }
        ],
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        return [
          "[AI AGENT: OLLAMA LOCAL ENGINE]",
          "----------------------------------------------------------------",
          ...text.split('\n')
        ];
      }
    }
    return null;
  }

  async callOpenRouter(query, apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
        'X-Title': 'Rafly Firmansyah Portfolio Terminal'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free',
        messages: [
          { role: 'system', content: SYSTEM_GROUNDING_PROMPT },
          { role: 'user', content: query }
        ],
        max_tokens: 350
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        return [
          "[AI AGENT: DEEPSEEK CLOUD]",
          "----------------------------------------------------------------",
          ...text.split('\n')
        ];
      }
    }
    return null;
  }

  async callGroq(query, apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_GROUNDING_PROMPT },
          { role: 'user', content: query }
        ],
        max_tokens: 350
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        return [
          "[AI AGENT: GROQ ENGINE]",
          "----------------------------------------------------------------",
          ...text.split('\n')
        ];
      }
    }
    return null;
  }

  async callGemini(query, apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${SYSTEM_GROUNDING_PROMPT}\n\nPertanyaan Pengunjung: ${query}` }
            ]
          }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return [
          "[AI AGENT: GEMINI FLASH]",
          "----------------------------------------------------------------",
          ...text.split('\n')
        ];
      }
    }
    return null;
  }

  /**
   * Smart general synthesis when no pattern or API responds
   */
  generateSmartSynthesis(query) {
    return [
      "[ASISTEN TERMINAL PORTOFOLIO]",
      "----------------------------------------------------------------",
      `Pertanyaan: "${query}"`,
      "",
      "Informasi Terkait Portofolio Rafly Firmansyah:",
      "- Mahasiswa S1 Informatika Universitas Bina Sarana Informatika (UBSI Sukabumi).",
      "- Pemilik Sertifikasi Kompetensi BNSP Analis Program & MikroTik MTCNA.",
      "- Pengembang OpenPlagiarismChecker (Riset NLP) & Spam-Email Detection (ML).",
      "",
      "Anda dapat mencoba pertanyaan spesifik seperti:",
      "1. 'Apa itu OpenPlagiarismChecker?'",
      "2. 'Sertifikat apa saja yang dimiliki Rafly?'",
      "3. 'Bagaimana cara menghubungi Rafly via WhatsApp?'",
      "Atau gunakan perintah CLI standar seperti 'skills', 'projects', 'certifs', 'benchmarks', 'clear'."
    ];
  }
}

export const terminalAI = new TerminalAIEngine();
