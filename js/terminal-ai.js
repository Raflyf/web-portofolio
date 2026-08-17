/**
 * ============================================================================
 * TERMINAL AI ASSISTANT & KNOWLEDGE ENGINE (v4.8.0)
 * Hybrid Client-Side Engine for Developer Lab Simulator
 * Features:
 * 1. Hugging Face 24/7 Dedicated Cloud OmniRoute Gateway
 * 2. Vercel Serverless Multi-API Cloud Gateway (/api/chat)
 * 3. In-Browser Sub-15ms Exact & Semantic Pattern Engine for Offline Resilience
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
    keywords: ['presiden', 'wapres', 'wakil presiden', 'prabowo', 'gibran', 'kabinet merah putih', 'indonesia 2026', 'pemilu 2024'],
    respond: () => [
      "[INFORMASI RESMI PEMERINTAHAN INDONESIA 2024 - 2026]",
      "----------------------------------------------------------------",
      "• Presiden RI ke-8       : Jenderal TNI (Purn.) Prabowo Subianto (2024 - 2029)",
      "• Wakil Presiden RI ke-14 : Gibran Rakabuming Raka (2024 - 2029)",
      "• Nama Kabinet           : Kabinet Merah Putih",
      "• Pelantikan Resmi       : 20 Oktober 2024 di Gedung MPR/DPR RI Jakarta",
      "• Pemilu Presiden        : Telah selesai pada 14 Februari 2024 (Menang satu putaran ~58,59%)",
      "• Status 2026            : Menjalankan program strategis hilirisasi, IKN, dan kemandirian digital."
    ]
  },
  {
    keywords: ['ikn', 'nusantara', 'ibu kota nusantara', 'istana garuda'],
    respond: () => [
      "[PROYEK STRATEGIS NASIONAL: Ibu Kota Nusantara (IKN)]",
      "----------------------------------------------------------------",
      "• Lokasi         : Penajam Paser Utara & Kutai Kartanegara, Kalimantan Timur",
      "• Milestone      : Upacara HUT RI ke-79 perdana diselenggarakan 17 Agustus 2024 di IKN",
      "• Ikon Bangunan  : Istana Garuda & Istana Negara karya I Nyoman Nuarta",
      "• Konsep         : Smart Forest City ramah lingkungan & energi terbarukan."
    ]
  },
  {
    keywords: ['whoosh', 'kereta cepat', 'kcic', 'kcjb'],
    respond: () => [
      "[TRANSPORTASI MODERN: Kereta Cepat Jakarta-Bandung (Whoosh)]",
      "----------------------------------------------------------------",
      "• Rute Operasi   : Stasiun Halim (Jakarta) ➔ Stasiun Tegalluar Summarecon (Bandung)",
      "• Kecepatan Max  : 350 km/jam (Waktu tempuh ~30-45 menit)",
      "• Status 2026    : Operasional komersial penuh dan kajian rute lanjutan Surabaya."
    ]
  },
  {
    keywords: ['trump', 'donald trump', 'presiden as', 'pemilu as', 'amerika serikat'],
    respond: () => [
      "[GEOPOLITIK GLOBAL: Pemilihan Presiden Amerika Serikat 2024 - 2026]",
      "----------------------------------------------------------------",
      "• Presiden AS ke-47 : Donald Trump (Partai Republik)",
      "• Wakil Presiden AS : JD Vance",
      "• Hasil Pemilu      : Menang pada 5 November 2024 mengalahkan Kamala Harris (Demokrat)",
      "• Pelantikan Resmi  : 20 Januari 2025 di Washington D.C."
    ]
  },
  {
    keywords: ['olimpiade paris', 'veddriq', 'rizki juniansyah', 'emas olimpiade'],
    respond: () => [
      "[PRESTASI OLAHRAGA DUNIA: Olimpiade Paris 2024]",
      "----------------------------------------------------------------",
      "Indonesia mengukir sejarah dengan membawa pulang 2 Medali Emas:",
      "  1. Veddriq Leonardo  : Medali Emas Panjat Tebing Speed Putra (Catatan waktu 4.75 detik)",
      "  2. Rizki Juniansyah   : Medali Emas Angkat Besi Kelas 73 kg (Rekor Clean & Jerk 199 kg)",
      "  3. Gregoria Mariska T : Medali Perunggu Bulu Tangkis Tunggal Putri",
      "Klasemen Akhir       : Peringkat 39 Dunia."
    ]
  },
  {
    keywords: ['model ai', 'ai terbaru', 'model ai terbaru', 'ai 2026', 'frontier ai', 'llm terbaru'],
    respond: () => [
      "[KATALOG & REVOLUSI MODEL AI FRONTIER TERBARU 2025 - 2026]",
      "----------------------------------------------------------------",
      "Berikut adalah generasi model AI teranyar dan tercanggih di dunia:",
      "",
      "1. Zhipu AI / THUDM :",
      "   • GLM-5.3 & GLM-4.5 : Model penalaran logika & agentic tool-use terdepan.",
      "   • CogVideoX-5B      : Model video generatif open weights sinematik.",
      "",
      "2. Alibaba Cloud / Tongyi Lab :",
      "   • Qwen 3 & Qwen 3.8 : Generasi arsitektur penalaran terpadu matematika & bahasa.",
      "   • Qwen 2.5 Coder 32B : Juara #1 coding benchmark open source.",
      "   • Qwen 2.5 VL 72B   : Multimodal Vision teratas untuk bagan, dokumen & spasial.",
      "",
      "3. Moonshot AI :",
      "   • Kimi k3 & Kimi k2.7 : Model Deep Reasoning dengan konteks 2M+ token untuk riset kode.",
      "",
      "4. DeepSeek AI :",
      "   • DeepSeek V3 (MoE 671B MLA) & DeepSeek R1 (Large-Scale RL Reasoning CoT).",
      "",
      "5. xAI (Elon Musk) :",
      "   • Grok 3 & Grok 2   : Dilatih pada klaster superkomputer Colossus (100k+ Nvidia GPUs).",
      "",
      "6. Anthropic & OpenAI :",
      "   • Claude 3.7 Sonnet (Hybrid Reasoning) & Claude 3.5 Sonnet.",
      "   • OpenAI o1, o3, o3-mini & GPT-4.5 Orion.",
      "",
      "7. Google DeepMind :",
      "   • Gemini 2.0 / 2.5 Flash, Gemma 3 Vision Multimodal, dan Veo 2 Video."
    ]
  },
  {
    keywords: ['glm', 'glm 5', 'glm 5.3', 'glm 4.5', 'zhipu'],
    respond: () => [
      "[ZHIPU AI / THUDM: GLM-5.3 & GLM-4.5]",
      "----------------------------------------------------------------",
      "• Spesialisasi : Frontier Multimodal, Agentic Workflows, & Penalaran Logika.",
      "• Arsitektur   : MoE generasi baru dengan efisiensi inferensi tinggi.",
      "• Fitur Kunci  : Dukungan ekosistem CogVideoX (video) dan GLM-4-Voice (suara real-time)."
    ]
  },
  {
    keywords: ['qwen 3', 'qwen 3.8', 'qwen 2.5 coder', 'alibaba cloud', 'tongyi'],
    respond: () => [
      "[ALIBABA CLOUD: Qwen 3, Qwen 3.8 & Qwen 2.5 Coder]",
      "----------------------------------------------------------------",
      "• Qwen 3 & Qwen 3.8  : Penalaran terpadu matematika, koding, dan bahasa multibahasa.",
      "• Qwen 2.5 Coder 32B : Model koding open source nomor 1 di dunia.",
      "• Qwen 2.5 VL 72B    : Multimodal Vision teratas untuk analisis citra dan dokumen teknis."
    ]
  },
  {
    keywords: ['kimi', 'kimi k3', 'kimi k2.7', 'moonshot'],
    respond: () => [
      "[MOONSHOT AI: Kimi k3 & Kimi k2.7]",
      "----------------------------------------------------------------",
      "• Spesialisasi : Deep Reasoning Chain-of-Thought & Konteks Ekstrem Panjang.",
      "• Context Window: 2.000.000+ Token (mampu memproses ratusan berkas kode & dokumen sekaligus).",
      "• Fokus Riset  : Analisis literatur ilmiah, sintesis data masif, dan koding kompleks."
    ]
  },
  {
    keywords: ['deepseek', 'deepseek v3', 'deepseek r1', 'reasoning', 'moe 671b'],
    respond: () => [
      "[FRONTIER AI REVOLUTION: DeepSeek V3 & DeepSeek R1]",
      "----------------------------------------------------------------",
      "• DeepSeek V3 : Model MoE 671B (37B active) dengan Multi-Head Latent Attention (MLA)",
      "• DeepSeek R1 : Model Reasoning Chain-of-Thought berskala besar via Reinforcement Learning",
      "• Keunggulan  : Efisiensi pelatihan ekstrem FP8 dan performa setara model tertutup teratas",
      "• Integrasi   : Tersedia di terminal lab portofolio ini."
    ]
  },
  {
    keywords: ['timnas', 'shin tae yong', 'kualifikasi piala dunia', 'timnas indonesia'],
    respond: () => [
      "[SEPAK BOLA NASIONAL: Timnas Indonesia 2024 - 2026]",
      "----------------------------------------------------------------",
      "• Milestone      : Menembus Putaran ke-3 Kualifikasi Piala Dunia 2026 Zona Asia (Grup C)",
      "• Prestasi Asia  : Lolos ke Babak 16 Besar Piala Asia AFC 2023 (digelar awal 2024)",
      "• Pelatih Utama  : Shin Tae-yong (Korsel) dengan perpanjangan kontrak resmi."
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const res = await fetch('/api/chat', {
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
          history: this.conversationHistory.slice(-6)
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.response) {
        // Record conversation turn for dynamic context
        this.conversationHistory.push({ role: 'user', content: cleanQuery });
        this.conversationHistory.push({ role: 'assistant', content: data.response });
        if (this.conversationHistory.length > 10) {
          this.conversationHistory = this.conversationHistory.slice(-10);
        }

        const isAuto = !this.currentModel || this.currentModel === 'auto';
        const resolvedModel = data.model || 'deepseek/deepseek-chat';
        const provider = data.provider || 'Gateway';

        this.lastExecutionInfo = {
          isAuto,
          resolvedModel,
          provider
        };

        // Log resolved model execution (tracks what model was used in Auto mode)
        if (telemetry) {
          const target = isAuto ? `auto:${resolvedModel}` : (this.currentModel || resolvedModel);
          const label = isAuto ? `[Auto ➔ ${resolvedModel} via ${provider}] ${cleanQuery.substring(0, 60)}` : `[${this.currentModel} via ${provider}] ${cleanQuery.substring(0, 60)}`;
          telemetry.logEvent('ai_query_resolved', target, label);
        }

        return data.response.split('\n');
      }

      // Check for high-priority local semantic knowledge match first
      const semanticMatch = this.checkSemanticMatch(cleanQuery);
      if (semanticMatch) {
        if (telemetry) {
          telemetry.logEvent('ai_query_resolved', 'auto:local_semantic', `[Auto ➔ Local Semantic Engine] ${cleanQuery.substring(0, 60)}`);
        }
        return semanticMatch;
      }

      // Dynamic Backend Error Display
      if (data && !data.success) {
        const errorLines = [
          `[ERROR GATEWAY: ${data.error || 'Kegagalan Pemrosesan Model AI'}]`,
          `----------------------------------------------------------------`,
          `Model Aktif : ${data.model || this.currentModel}`,
          `Status HTTP : ${res.status} ${res.statusText || ''}`
        ];

        if (Array.isArray(data.details) && data.details.length > 0) {
          errorLines.push(`Rincian Provider Kegagalan:`);
          data.details.forEach(d => errorLines.push(`  - ${d}`));
        } else if (data.message) {
          errorLines.push(`Pesan Sistem : ${data.message}`);
        }

        errorLines.push("");
        errorLines.push("Anda dapat beralih ke model AI lain pada menu dropdown di atas atau mengulangi perintah.");
        return errorLines;
      }
    } catch (netErr) {
      if (netErr.name === 'AbortError') {
        return [
          `[TIMEOUT / 2 Menit]: Permintaan ke model AI melebihi batas waktu 2 menit.`,
          `Model sedang memproses komputasi berat. Silakan coba kembali atau pilih model lain.`
        ];
      }

      const semanticMatch = this.checkSemanticMatch(cleanQuery);
      if (semanticMatch) {
        return semanticMatch;
      }

      return [
        `[CLIENT NETWORK ERROR]: Gagal terhubung ke endpoint /api/chat (${netErr.message}).`,
        `Pastikan koneksi internet stabil atau nonaktifkan pemblokir skrip.`
      ];
    }

    // 2. Secondary Fallback: Hugging Face Gradio Cloud Space (if no attachments)
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    if (!hasAttachments) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

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
