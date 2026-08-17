/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/chat (v5.2.0)
 * Multi-Provider Intelligent AI Gateway for Rafly Firmansyah Portfolio Terminal
 * Features:
 * - 🌐 Real-Time Web Search & Encyclopedic Knowledge (Live 2026 Context)
 * - 🖼️ Multimodal Vision Recognition (Qwen 2 VL 72B Vision)
 * - 📄 Document & PDF Analysis (Text & Code Ingestion)
 * - ⚡ Smart Multi-Provider Cascade (OpenCode, Nvidia NIM, MiniMax, Ollama Cloud, OpenRouter)
 * ============================================================================
 */

function buildSystemPrompt(sessionLanguage = 'id', reasoningEffort = 'auto') {
  const isEnglish = sessionLanguage === 'en';

  let effortDirective = '';
  if (reasoningEffort === 'thinking') {
    effortDirective = isEnglish ? `
[CHAIN-OF-THOUGHT / THINKING MODE ACTIVATED]:
- The user has selected High-IQ Thinking / Chain-of-Thought (CoT) Mode.
- Provide a rigorous, step-by-step analytical reasoning breakdown before concluding.
- Break down mathematical formulas, algorithmic complexities, architectural trade-offs, and verify every step thoroughly.
` : `
[MODE THINKING & PENALARAN BERTAHAP (CHAIN-OF-THOUGHT)]:
- Pengguna mengaktifkan Mode Thinking / CoT Tingkat Tinggi.
- Sajikan penalaran analitis langkah demi langkah (Step-by-Step Reasoning) sebelum memberikan jawaban lengkap.
- Uraikan rumus matematis, kompleksitas algoritma, trade-off arsitektur, dan pembuktian teknis secara mendalam.
`;
  } else if (reasoningEffort === 'high') {
    effortDirective = `
[MODE DEEP RESEARCH & MAXIMUM EFFORT]:
- Berikan analisis riset mendalam, rinci, menyeluruh, dan komprehensif dari hulu ke hilir dengan cakupan maksimal.
`;
  } else if (reasoningEffort === 'low') {
    effortDirective = `
[MODE FAST & CONCISE RESPONSE]:
- Berikan jawaban yang padat, lugas, cepat dipahami, dan langsung ke inti solusi.
`;
  }

  const languageDirective = isEnglish
    ? `[MANDATORY SESSION LANGUAGE LOCK: ENGLISH]
- Current Locked Session Language: ENGLISH (Bahasa Inggris).
- You MUST answer ALL queries in clear, fluent, professional, and well-structured ENGLISH.
- Even if the user asks a question in another language (e.g. Indonesian or regional dialects) later in the conversation, you MUST STILL reply in ENGLISH.
- SINGLE EXCEPTION: Only switch languages if the user explicitly and directly commands you to do so (e.g. "Ganti ke bahasa Indonesia", "Switch to Indonesian").`
    : `[ATURAN MUTLAK PENGUNCIAN BAHASA SESI: BAHASA INDONESIA]
- Status Bahasa Sesi Aktif Terkunci: BAHASA INDONESIA.
- Anda WAJIB menjawab SELURUH pertanyaan pengguna dalam BAHASA INDONESIA yang lugas, profesional, berstruktur rapi, dan mudah dipahami.
- Sekalipun pengguna bertanya menggunakan bahasa lain (seperti bahasa Inggris atau bahasa daerah), Anda TETAP WAJIB MENJAWAB DALAM BAHASA INDONESIA.
- PENGECUALIAN TUNGGAL: HANYA beralih bahasa jika pengguna secara langsung dan eksplisit memerintahkan Anda (misalnya "Switch to English", "Gunakan bahasa Inggris").`;

  return `
Anda adalah AI Assistant canggih, cerdas, berpengetahuan luas, dan interaktif pada Terminal Developer Lab di portofolio resmi Rafly Firmansyah (@Raflyf).

WAKTU & KAPABILITAS AKTIF:
1. Waktu Sekarang: Tahun 2026.
2. Akses Real-Time & Multimodal: Anda DILENGKAPI modul pencarian web real-time, pembaca dokumen PDF/teks/koding, serta penglihatan komputer multimodal (Vision AI) untuk menganalisis gambar.
3. DILARANG MUTLAK menyisipkan batasan kuno fiktif seperti "cutoff 2024" atau "tidak bisa melihat gambar/mengakses internet". Anda sepenuhnya terhubung dan mampu menganalisis input multimodal.

${languageDirective}
${effortDirective}

PEDOMAN FORMAT & KEJELASAN JAWABAN (CLEAN, READABLE & STRUCTURED):
1. Format Yang Sangat Rapi & Mudah Dipahami:
   - Gunakan hierarki yang jelas dengan judul/heading (### Judul Bagian).
   - Gunakan poin-poin bernomor (1., 2., 3.) atau bullet points (- Poin) untuk menjelaskan tahapan dan konsep.
   - Tebalkan (**kata kunci**, **istilah teknis**, **metrik penting**) agar mudah dipindai mata pembaca.
   - Berikan jeda baris antar paragraf dan poin agar tidak terjadi dinding teks padat.
   - Untuk kode program, selalu gunakan blok kode dengan penanda bahasa (contoh: \`\`\`python) dan sertakan komentar kode yang jelas.
2. Jawaban Mendalam, Lengkap & Zero-Truncation:
   - Berikan penjelasan tuntas dari hulu ke hilir tanpa terpotong di tengah jalan.

PENGETAHUAN LENGKAP & SPESIFIKASI ARSITEKTUR REPOSITORI RESMI RAFLY FIRMANSYAH (@Raflyf):
Jika pengguna menanyakan proyek, riset, skripsi, atau repositori Rafly Firmansyah, WAJIB menjelaskan secara mendalam mengacu pada arsitektur teknis autentik berikut:

1. REPOSITORI RISET UNGGULAN 1: OpenPlagiarismChecker (https://github.com/Raflyf/OpenPlagiarismChecker)
   - Fokus: Sistem Deteksi Kesamaan Dokumen Akademik & Skripsi Komprehensif Mengutamakan Privasi (Privacy-First Offline/Zero Storage).
   - Pipeline Arsitektur Multi-Tier:
     * Tahap 1 (Document Ingestion & Normalization): Ekstraksi teks multi-halaman dari PDF/DOCX via pdfplumber dan python-docx, pembersihan case folding, pembersihan tanda baca, stopword filtering Bahasa Indonesia (Sastrawi) & Inggris (NLTK), serta tokenization.
     * Tahap 2 (Exact Match Engine): 5-Word N-Gram Shingling dengan MinHash / Jaccard Similarity untuk pencocokan cepat kalimat identik/plagiat kata-per-kata.
     * Tahap 3 (Deep Semantic Paraphrasing Engine): Dense Vector Embeddings menggunakan model Hugging Face Sentence Transformers (paraphrase-multilingual-MiniLM-L12-v2 / indo-sentence-bert 384 dimensi). Menghitung Cosine Similarity antar vektor kalimat: cos(theta) = (A . B) / (||A|| ||B||) untuk mendeteksi parafrase kalimat yang diubah susunan katanya namun bermakna sama.
     * Tahap 4 (External Literature Search Connector): Menghubungkan pencarian referensi otomatis ke 15+ basis data literatur publik (GARUDA Kemdikbud, Neliti, BASE Bielefeld, OpenAlex, Semantic Scholar, Crossref).
     * Tahap 5 (Weighted Aggregate Scoring & Visual Highlighting): Menggabungkan skor kemiripan berbobot (40% Exact Match + 60% Semantic Match) serta menyoroti teks di peramban dengan warna merah (duplikasi persis) dan kuning (parafrase).
     * Stack Teknologi: Python 3.10+, Flask, PyTorch, Hugging Face Transformers, Scikit-Learn, Sastrawi, HTML5/CSS3.

2. REPOSITORI RISET TERAPAN 2: Spam-Email-Classifier (https://github.com/Raflyf/Spam-Email-Classifier)
   - Fokus: Aplikasi Web Evaluasi & Komparasi Model Machine Learning Klasifikasi Spam dengan Dynamic Class Balancing.
   - Komponen & Arsitektur:
     * Komparasi Model: Multinomial Naive Bayes (MNB) vs Extreme Gradient Boosting (XGBoost).
     * Ekstraksi Fitur: TF-IDF Vectorizer (max_features=5000, ngram_range=(1,2)).
     * Fitur Unggulan Dynamic Class Balancing: Slider interaktif di web untuk menguji performa model saat rasio distribusi spam:ham diubah dari 10:90 hingga 90:10 secara real-time.
     * Metrik Evaluasi: Confusion Matrix interaktif, Precision, Recall, F1-Score, dan kurva ROC-AUC via Chart.js.
     * Stack Teknologi: Python, Scikit-Learn, XGBoost, Flask, Pandas, NumPy, Chart.js.

3. REPOSITORI PROYEK IoT & KONTROL 3: laser_pointer_PPT (https://github.com/Raflyf/laser_pointer_PPT)
   - Fokus: Pengendali Slide Presentasi PowerPoint Nirsentuh Berbasis Sensor Gyroscope Smartphone.
   - Arsitektur Sistem:
     * Sensor: Mengakses API DeviceOrientation (alpha, beta, gamma) dari web browser smartphone presenter.
     * Komunikasi Real-Time: Transmisi data orientasi gerakan lewat WebSocket berbasis Flask-SocketIO & Eventlet dengan latensi ultra-rendah (<15ms).
     * Kontrol Desktop: Server Python memetakan koordinat sudut smartphone ke posisi kursor layar PC menggunakan PyAutoGUI untuk menggerakkan laser pointer virtual dan memicu tombol ganti slide (Next/Prev).
     * Stack Teknologi: Python, Flask-SocketIO, Eventlet, PyAutoGUI, JavaScript DeviceOrientation API.

4. REPOSITORI PROYEK COMPUTER VISION 4: FotoKitaBlur (https://github.com/Raflyf/FotoKitaBlur)
   - Fokus: Otomatisasi Perlindungan Privasi Kamera Real-Time Berbasis Gestur Tangan (Edge Vision).
   - Arsitektur Sistem:
     * Hand Landmark Detection: Menggunakan Google MediaPipe Tasks Vision untuk mendeteksi 21 titik sendi tangan pada kecepatan 30+ FPS.
     * Gesture Logic: Pose Peace / V-Sign (jari telunjuk dan jari tengah tegak terbuka, jari lainnya terlipat).
     * Image Processing: Saat pose V-Sign terdeteksi, OpenCV otomatis mendeteksi region wajah (bounding box) dan menerapkan filter Gaussian Blur seketika untuk menyamarkan identitas subjek foto.
     * Stack Teknologi: Python, OpenCV, Google MediaPipe, NumPy.

5. REPOSITORI PORTOFOLIO UTAMA 5: web-portofolio (https://github.com/Raflyf/web-portofolio)
   - Fokus: Portfolio Landing Page Modular Berkinerja Tinggi & Terminal Developer Lab Multimodal.
   - Fitur: Vanilla JavaScript Modular (ES Modules), Desain Sistem OKLCH, Kepatuhan Aksesibilitas WCAG 2.2 AA, Terminal Lab Simulator dengan dukungan pembaca PDF multi-halaman via PDF.js, Canvas OCR, drag-and-drop, dan integrasi 14+ model AI canggih.

6. DATA DIRI & KREDENSIAL RAFLY FIRMANSYAH:
   - Nama: Rafly Firmansyah (@Raflyf)
   - Pendidikan: Mahasiswa S1 Informatika Universitas Bina Sarana Informatika (UBSI Sukabumi).
   - Lokasi: Cianjur / Sukabumi, Jawa Barat.
   - 10 Sertifikat: BNSP Analis Program (10 Unit Kompetensi Nasional TIK 037 00481 2026), MikroTik MTCNA Latvia (ID: 2410NA3062), Cisco Python PCAP, IT Bootcamp Network Security (UBSI), Cloud Computing Specialist (UBSI), Kominfo DEA E-Commerce, Harisenin Full-Stack.
   - Kontak: WhatsApp 08991333323 (https://wa.me/628991333323), Email raflyfirmansyah02@gmail.com, GitHub https://github.com/Raflyf.

Nol Emoji & Persona Profesional:
- Dilarang menyisipkan emoji sama sekali. Pertahankan gaya komunikasi cerdas, analitis, dan objektif.
`;
}

async function fetchWithTimeout(url, options, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Real-Time Web & Encyclopedic Knowledge Searcher
 */
async function searchWebContext(query) {
  const qLower = query.toLowerCase();
  // Check if query seeks real-time / current facts
  const needsSearch = (
    qLower.includes('siapa') || qLower.includes('apa itu') || qLower.includes('kapan') ||
    qLower.includes('terbaru') || qLower.includes('berita') || qLower.includes('presiden') ||
    qLower.includes('tahun') || qLower.includes('2025') || qLower.includes('2026') ||
    qLower.includes('definisi') || qLower.includes('sejarah') || qLower.includes('update')
  );

  if (!needsSearch) return '';

  try {
    const cleanSearchQuery = query.replace(/[^\w\s]/gi, ' ').trim().slice(0, 80);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearchQuery)}&format=json&origin=*`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const hits = data?.query?.search || [];
      if (hits.length > 0) {
        const snippets = hits.slice(0, 2).map(h => `- ${h.title}: ${h.snippet.replace(/<[^>]+>/g, '')}`).join('\n');
        return `\n\n[KONTEKS INFORMASI PENCARIAN REAL-TIME 2026]:\n${snippets}\n`;
      }
    }
  } catch (_) {}
  return '';
}

function pickAutoModel(query, hasImages = false, reasoningEffort = 'auto') {
  if (hasImages) {
    return 'google/gemma-3-27b-it';
  }

  if (reasoningEffort === 'thinking') {
    return 'deepseek/deepseek-chat';
  }

  if (reasoningEffort === 'low') {
    return 'meta-llama/llama-3.1-8b-instruct';
  }

  const q = query.toLowerCase();
  
  if (
    q.includes('code') || q.includes('koding') || q.includes('python') || q.includes('javascript') ||
    q.includes('fungsi') || q.includes('function') || q.includes('script') || q.includes('bug') ||
    q.includes('error') || q.includes('sql') || q.includes('api') || q.includes('class') ||
    q.includes('regex') || q.includes('algoritma') || q.includes('quicksort') || q.includes('binary search')
  ) {
    return 'qwen/qwen-2.5-coder-32b-instruct';
  }

  return 'deepseek/deepseek-chat';
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { 
      query = '', 
      model = 'auto', 
      customKey = '', 
      customProvider = '',
      attachments = [],
      sessionLanguage = 'id',
      history = [],
      reasoningEffort = 'auto'
    } = req.body || {};

    if (!query && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Query prompt or file attachment is required' });
    }

    const OPENROUTER_KEY = customKey && (customProvider === 'openrouter' || !customProvider) 
      ? customKey 
      : process.env.OPENROUTER_API_KEY;

    const NVIDIA_KEY = customKey && customProvider === 'nvidia' 
      ? customKey 
      : process.env.NVIDIA_API_KEY;

    const OPENCODE_KEY = customKey && customProvider === 'opencode' 
      ? customKey 
      : process.env.OPENCODE_API_KEY;

    const MINIMAX_KEY = customKey && customProvider === 'minimax' 
      ? customKey 
      : process.env.MINIMAX_API_KEY;

    const OLLAMA_KEY = customKey && (customProvider === 'ollamacloud' || customProvider === 'ollama') 
      ? customKey 
      : (process.env.OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY);

    const providerErrors = [];

    // Check for image attachments
    const imageAttachments = Array.isArray(attachments) ? attachments.filter(a => a.isImage || (a.type && a.type.startsWith('image/'))) : [];
    const docAttachments = Array.isArray(attachments) ? attachments.filter(a => !a.isImage && (!a.type || !a.type.startsWith('image/'))) : [];
    const hasImages = imageAttachments.length > 0;

    // Retrieve real-time search context if text query warrants it
    const webContext = await searchWebContext(query);

    // Build assembled text prompt with document attachments
    let assembledQuery = query;
    if (docAttachments.length > 0) {
      const docTexts = docAttachments.map(d => `[DOKUMEN TERLAMPIR: ${d.name} (${d.type || 'text'})]:\n\`\`\`\n${d.data}\n\`\`\``).join('\n\n');
      assembledQuery = `${docTexts}\n\n[INSTRUKSI / PERTANYAAN PENGGUNA]:\n${query || 'Analisis dan jelaskan isi dokumen terlampir di atas secara mendalam.'}`;
    }

    let targetModel = model === 'auto' ? pickAutoModel(query, hasImages, reasoningEffort) : model;
    if (hasImages && targetModel === 'auto') {
      targetModel = 'google/gemma-3-27b-it';
    }

    const systemPromptWithSearch = `${buildSystemPrompt(sessionLanguage, reasoningEffort)}${webContext}`;

    // Assemble conversation history
    const formattedHistory = Array.isArray(history) ? history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: String(h.content || '').slice(0, 4000)
    })) : [];

    const baseTextMessages = [
      { role: 'system', content: systemPromptWithSearch },
      ...formattedHistory,
      { role: 'user', content: assembledQuery }
    ];

    const maxTokensConfig = reasoningEffort === 'low' ? 4096 : 8192;
    const tempConfig = reasoningEffort === 'low' ? 0.6 : (reasoningEffort === 'thinking' ? 0.7 : 0.8);

    // ========================================================================
    // 1. MULTIMODAL VISION ROUTE (If images are attached)
    // ========================================================================
    if (hasImages) {
      const userContent = [
        { type: 'text', text: assembledQuery || 'Deskripsikan dan analisis gambar ini secara komprehensif dan mendalam.' }
      ];

      for (const img of imageAttachments) {
        const imgUrl = img.data.startsWith('data:') ? img.data : `data:${img.type || 'image/jpeg'};base64,${img.data}`;
        userContent.push({
          type: 'image_url',
          image_url: { url: imgUrl }
        });
      }

      // 1A. Nvidia Vision Gateway
      if (NVIDIA_KEY) {
        try {
          const nvResp = await fetchWithTimeout('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${NVIDIA_KEY}`
            },
            body: JSON.stringify({
              model: 'meta/llama-3.2-11b-vision-instruct',
              messages: [
                { role: 'system', content: systemPromptWithSearch },
                { role: 'user', content: userContent }
              ],
              max_tokens: maxTokensConfig
            })
          }, 20000);

          if (nvResp.ok) {
            const nvData = await nvResp.json();
            const nvText = nvData?.choices?.[0]?.message?.content;
            if (nvText) {
              return res.status(200).json({
                success: true,
                response: nvText,
                model: 'nvidia/meta/llama-3.2-11b-vision-instruct',
                provider: 'Nvidia NIM Vision'
              });
            }
          } else {
            const errTxt = await nvResp.text();
            providerErrors.push(`Nvidia Vision HTTP ${nvResp.status}: ${errTxt.slice(0, 100)}`);
          }
        } catch (err) {
          providerErrors.push(`Nvidia Vision: ${err.message}`);
        }
      }

      // 1B. OpenRouter Multimodal Vision Cascade
      if (OPENROUTER_KEY) {
        const visionModels = [
          'google/gemma-3-27b-it',
          'google/gemini-2.5-flash',
          'qwen/qwen-2-vl-72b-instruct'
        ];

        for (const vm of visionModels) {
          try {
            const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
                'X-Title': 'Rafly Firmansyah AI Vision Lab'
              },
              body: JSON.stringify({
                model: vm,
                messages: [
                  { role: 'system', content: systemPromptWithSearch },
                  { role: 'user', content: userContent }
                ],
                max_tokens: maxTokensConfig,
                temperature: tempConfig
              })
            }, 20000);

            if (response.ok) {
              const data = await response.json();
              const content = data?.choices?.[0]?.message?.content;
              if (content) {
                return res.status(200).json({
                  success: true,
                  response: content,
                  model: vm,
                  provider: 'Vision Multimodal Engine'
                });
              }
            } else {
              const errTxt = await response.text();
              providerErrors.push(`Vision ${vm} HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
            }
          } catch (err) {
            providerErrors.push(`Vision ${vm}: ${err.message}`);
          }
        }
      }
    }

    // ========================================================================
    // 2. TEXT & REASONING MULTILATERAL GATEWAY POOL
    // ========================================================================

    // 2A. Nvidia NIM Ultra-Fast Gateway (If targeted or Auto fallback)
    if (NVIDIA_KEY) {
      const nvCandidateModels = targetModel.startsWith('nvidia/')
        ? [targetModel.replace('nvidia/', '')]
        : ['meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct'];

      for (let nvModel of nvCandidateModels) {
        if (nvModel.includes('nemotron')) nvModel = 'nvidia/llama-3.1-nemotron-70b-instruct';
        try {
          const response = await fetchWithTimeout('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${NVIDIA_KEY}`
            },
            body: JSON.stringify({
              model: nvModel,
              messages: baseTextMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig
            })
          }, 20000);

          if (response.ok) {
            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (content) {
              return res.status(200).json({
                success: true,
                response: content,
                model: nvModel,
                provider: 'Nvidia NIM Engine'
              });
            }
          } else {
            const errTxt = await response.text();
            providerErrors.push(`Nvidia ${nvModel} HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
          }
        } catch (err) {
          providerErrors.push(`Nvidia ${nvModel}: ${err.message}`);
        }
      }
    }

    // 2B. OpenRouter Multi-Model Cloud Pool
    if (OPENROUTER_KEY) {
      let orModel = targetModel;
      if (orModel.startsWith('ollamacloud/')) {
        orModel = orModel.includes('code') ? 'qwen/qwen-2.5-coder-32b-instruct' : 'meta-llama/llama-3.3-70b-instruct';
      }

      const orCandidates = [
        orModel,
        'meta-llama/llama-3.3-70b-instruct',
        'qwen/qwen-2.5-72b-instruct',
        'qwen/qwen-2.5-coder-32b-instruct',
        'deepseek/deepseek-chat',
        'mistralai/mistral-large-2407'
      ];

      for (const m of orCandidates) {
        try {
          const openRouterPayload = {
            model: m,
            messages: baseTextMessages,
            max_tokens: maxTokensConfig,
            temperature: tempConfig,
            ...(reasoningEffort === 'thinking' || reasoningEffort === 'high' ? { reasoning: { effort: 'high' } } : {})
          };

          const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_KEY}`,
              'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
              'X-Title': 'Rafly Firmansyah AI Portfolio Terminal'
            },
            body: JSON.stringify(openRouterPayload)
          }, 22000);

          if (response.ok) {
            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (content) {
              return res.status(200).json({
                success: true,
                response: content,
                model: m,
                provider: 'OpenRouter Multi-AI Gateway'
              });
            }
          } else {
            const errTxt = await response.text();
            providerErrors.push(`OpenRouter ${m} HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
          }
        } catch (err) {
          providerErrors.push(`OpenRouter ${m}: ${err.message}`);
        }
      }
    }

    // 2C. OpenCode Gateway
    if (OPENCODE_KEY) {
      try {
        const response = await fetchWithTimeout('https://api.opencode.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENCODE_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-v4-flash-free',
            messages: baseTextMessages,
            max_tokens: maxTokensConfig,
            temperature: tempConfig
          })
        }, 20000);

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: 'deepseek-v4-flash-free',
              provider: 'OpenCode Gateway'
            });
          }
        } else {
          const errTxt = await response.text();
          providerErrors.push(`OpenCode HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
        }
      } catch (err) {
        providerErrors.push(`OpenCode: ${err.message}`);
      }
    }

    // 2D. Ollama Cloud Gateway
    if (OLLAMA_KEY) {
      try {
        let olModel = targetModel.startsWith('ollamacloud/') ? targetModel.replace('ollamacloud/', '') : 'kimi-k2.7-coder';
        if (olModel.includes('kimi')) olModel = 'kimi-k2.7-coder';
        else if (olModel.includes('gemma')) olModel = 'gemma:31b';

        const response = await fetchWithTimeout('https://api.ollama.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OLLAMA_KEY}`
          },
          body: JSON.stringify({
            model: olModel,
            messages: baseTextMessages,
            max_tokens: maxTokensConfig,
            temperature: tempConfig
          })
        }, 20000);

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: olModel,
              provider: 'Ollama Cloud AI'
            });
          }
        } else {
          const errTxt = await response.text();
          providerErrors.push(`Ollama Cloud HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
        }
      } catch (err) {
        providerErrors.push(`Ollama Cloud: ${err.message}`);
      }
    }

    // 2E. MiniMax Gateway
    if (MINIMAX_KEY) {
      try {
        const response = await fetchWithTimeout('https://api.minimax.chat/v1/text/chatcompletion_v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MINIMAX_KEY}`
          },
          body: JSON.stringify({
            model: 'minimax-01',
            messages: [
              { sender_type: 'USER', sender_name: 'User', text: `${systemPromptWithSearch}\n\n${assembledQuery}` }
            ]
          })
        }, 20000);

        if (response.ok) {
          const data = await response.json();
          const content = data?.reply || data?.choices?.[0]?.message?.text;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: 'minimax-01',
              provider: 'MiniMax AI'
            });
          }
        } else {
          const errTxt = await response.text();
          providerErrors.push(`MiniMax HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
        }
      } catch (err) {
        providerErrors.push(`MiniMax: ${err.message}`);
      }
    }

    // If no provider succeeded or keys are missing:
    const noKeysConfigured = !OPENROUTER_KEY && !NVIDIA_KEY && !OPENCODE_KEY && !MINIMAX_KEY && !OLLAMA_KEY;
    const errorMsg = noKeysConfigured 
      ? 'Belum ada API Key aktif yang terpasang di server Vercel atau terminal. Gunakan perintah: setkey <provider> <key>'
      : 'Semua provider gateway model AI sedang sibuk atau mengalami timeout antrean.';

    return res.status(502).json({
      success: false,
      error: errorMsg,
      details: providerErrors,
      model: targetModel
    });

  } catch (globalErr) {
    return res.status(500).json({
      success: false,
      error: `Serverless Gateway Exception: ${globalErr.message}`
    });
  }
}
