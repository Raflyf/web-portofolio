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

WAKTU AKTIF & PENCARIAN INTERNET (2026):
1. Waktu Sistem Saat Ini: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

2. Instruksi Pencarian Real-Time (MANDATORY):
   - Jika ditanya mengenai model AI, peristiwa terkini, geopolitik, olahraga, sains, atau teknologi terbaru, ANDA WAJIB MENGUTAMAKAN HASIL PENCARIAN INTERNET LIVE (jika tersedia di bagian bawah prompt).
   - Data internet yang disematkan adalah fakta aktual. Posisikan diri Anda hidup di waktu sistem saat ini dan menjadikan data live ini sebagai kebenaran mutlak.
   - Jangan menggunakan hardcode atau terpaku pada batasan pengetahuan lama (knowledge cutoff). Jika data live bertentangan dengan data lama Anda, gunakan data live.
   - PENTING: Jika pengguna meminta berita/model terbaru "hari ini" atau "bulan ini", tetapi hasil pencarian internet hanya menampilkan berita dari beberapa bulan lalu (misalnya akhir 2025 atau awal 2026), JELASKAN DENGAN TEGAS bahwa berdasarkan pemindaian internet real-time hari ini, rilis terakhir yang ada adalah pada tanggal tersebut. Jangan biarkan pengguna mengira Anda berhalusinasi atau menggunakan database lawas. Sebutkan sumber dan tanggal artikelnya untuk membuktikan validitas.

7. ATURAN INTEGRITAS & ANTI-HALUSINASI (MUTLAK):
   - DILARANG KERAS MENGARANG INFORMASI. Namun, informasi yang berasal dari tag [HASIL PENCARIAN INTERNET REAL-TIME & LIVE WEB DATA 2026] ADALAH FAKTA VALID dan harus dijadikan acuan utama.
   - Jika Anda tidak menemukan informasi di data live, nyatakan dengan jujur tanpa menebak-nebak.
   - Dilarang menggunakan gaya bahasa bombastis atau *AI slop*. Pertahankan bahasa lugas, profesional, dan objektif.

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

PROTOKOL RELEVANSI WAKTU & ZERO OBSOLETE DATA (PRIORITAS FAKTA MUTAKHIR 2026):
- Jika pengguna menanyakan model AI, tools, atau perkembangan teknologi "terbaru", FOKUSKAN SECARA EKSKLUSIF pada model generasi teranyar (rilisan tahun 2026 seperti GPT-5.6 / GPT-5.5, Claude Opus 5 / Opus 4.6, DeepSeek V4).
- DILARANG KERAS mencantumkan atau membuat tabel/daftar model-model lawas (seperti GPT-4, GPT-4.5, Claude Haiku 4.5 lama, dll) saat ditanya rilis terbaru, kecuali jika pengguna secara eksplisit meminta perbandingan historis. Jaga jawaban tetap tajam, segar, dan fokus pada yang paling baru.

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
 * Intelligent Query Rewriter for Context-Aware Search
 * Converts conversational follow-up questions into targeted factual search keywords.
 */
function formulateSmartSearchQuery(query, history = []) {
  if (!query || typeof query !== 'string') return '';

  const stopWords = /\b(coba|tolong|kamu|bisa|cari|carikan|informasi|informasinya|fakta|berita|tentang|mengenai|nya|apakah|bagaimana|apa|sih|dong|kan|bukannya|ya|di|pada|ke|dari|dan|atau|ini|itu|saat|waktu|tanggal|sekarang|hari ini|please|can|you|search|find|tell|me|about|the|what|is|are|today|now|latest|recent)\b/gi;
  let cleaned = query.replace(stopWords, ' ').replace(/[^\w\s\.\-]/gi, ' ').replace(/\s+/g, ' ').trim();

  // If query after removing stopwords is too short or empty (e.g. user just said "coba cari hari ini")
  if (cleaned.length < 3 && Array.isArray(history) && history.length > 0) {
    const pastUserQueries = history.filter(h => h.role === 'user').map(h => String(h.content || '')).reverse();
    for (const pastQ of pastUserQueries) {
      const pastClean = pastQ.replace(stopWords, ' ').replace(/[^\w\s\.\-]/gi, ' ').replace(/\s+/g, ' ').trim();
      if (pastClean.length >= 3) {
        cleaned = pastClean;
        break;
      }
    }
  }

  // Ensure high-relevance tech context if topic is AI/tech
  const qLow = (query + ' ' + cleaned).toLowerCase();
  if (qLow.includes('gpt') || qLow.includes('gemini') || qLow.includes('deepseek') || qLow.includes('claude') || qLow.includes('model') || qLow.includes('openai')) {
    if (!cleaned.toLowerCase().includes('ai') && !cleaned.toLowerCase().includes('model')) {
      cleaned += ' AI model';
    }
  }

  return cleaned.slice(0, 100).trim();
}

/**
 * Filter out lifestyle, horoscope, and tabloid junk from tech/factual search results
 */
function isJunkArticle(title) {
  if (!title) return true;
  const low = title.toLowerCase();
  const junkWords = [
    'zodiak', 'horoskop', 'ramalan', 'cantika.com', 'halodoc', 'gizi online', 
    'sinopsis', 'sinetron', 'resep', 'diet', 'kopi hitam', 'shio', 'tahukah anda', 
    'chord gitar', 'lirik lagu', 'bocoran togel', 'prediksi skor', 'jadwal bola'
  ];
  return junkWords.some(j => low.includes(j));
}

/**
 * Massive Real-Time Multi-Source Web & Encyclopedic Knowledge Engine
 * Aggregates Google News ID/EN, DuckDuckGo Abstract, and Wikipedia ID/EN concurrently.
 */
async function searchWebContext(query, history = []) {
  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return { formattedPrompt: '', rawSnippets: [] };
  }

  const qLower = query.toLowerCase().trim();
  if (['clear', 'help', 'skills', 'projects', 'certifs', 'benchmarks', 'cls', 'about'].includes(qLower)) {
    return { formattedPrompt: '', rawSnippets: [] };
  }

  const cleanSearchQuery = formulateSmartSearchQuery(query, history);
  if (!cleanSearchQuery || cleanSearchQuery.length < 2) {
    return { formattedPrompt: '', rawSnippets: [] };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);

    // 5-Source Concurrent Multi-Index Search (Targeting latest 1 year / 2026 releases)
    const [googleNewsEnRes, googleNewsIdRes, ddgRes, wikiIdRes, wikiEnRes] = await Promise.allSettled([
      // 1. Google News Global / US RSS (Latest Global Tech & AI Releases)
      fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(cleanSearchQuery + ' when:1y')}&hl=en-US&gl=US&ceid=US:en`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      }),
      // 2. Google News Indonesia RSS
      fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(cleanSearchQuery + ' when:1y')}&hl=id&gl=ID&ceid=ID:id`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      }),
      // 3. DuckDuckGo Instant Answer / Abstract
      fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(cleanSearchQuery)}&format=json&no_html=1&skip_disambig=1`, {
        signal: controller.signal
      }),
      // 4. Indonesian Wikipedia
      fetch(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearchQuery)}&format=json&origin=*`, {
        signal: controller.signal
      }),
      // 5. English Wikipedia
      fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearchQuery)}&format=json&origin=*`, {
        signal: controller.signal
      })
    ]);

    clearTimeout(timeout);

    let snippets = [];
    let rawSnippets = [];

    // Helper to sanitize XML / HTML entities
    const cleanStr = (str) => {
      if (!str) return '';
      return str.replace(/<[^>]+>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
    };

    // 1. Process Google News Global / US
    if (googleNewsEnRes.status === 'fulfilled' && googleNewsEnRes.value.ok) {
      const xml = await googleNewsEnRes.value.text().catch(() => '');
      if (xml) {
        const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
        items.slice(0, 5).forEach((item) => {
          const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
          const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
          const title = cleanStr(titleMatch ? titleMatch[1] : '');
          if (title && !isJunkArticle(title)) {
            const dateStr = dateMatch ? dateMatch[1] : '2026';
            // Prefer 2026 / recent items
            if (dateStr.includes('2026') || !dateStr.includes('2024')) {
              snippets.push(`[Live Global News (${dateStr})]: ${title}`);
              rawSnippets.push(`[Global News]: ${title}`);
            }
          }
        });
      }
    }

    // 2. Process Google News Indonesia
    if (googleNewsIdRes.status === 'fulfilled' && googleNewsIdRes.value.ok) {
      const xml = await googleNewsIdRes.value.text().catch(() => '');
      if (xml) {
        const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
        items.slice(0, 4).forEach((item) => {
          const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
          const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
          const title = cleanStr(titleMatch ? titleMatch[1] : '');
          if (title && !isJunkArticle(title)) {
            const dateStr = dateMatch ? dateMatch[1] : '2026';
            if (dateStr.includes('2026') || !dateStr.includes('2024')) {
              snippets.push(`[Live Berita Indonesia (${dateStr})]: ${title}`);
              rawSnippets.push(`[Berita ID]: ${title}`);
            }
          }
        });
      }
    }

    // 3. Process DuckDuckGo Abstract / Instant Answer
    if (ddgRes.status === 'fulfilled' && ddgRes.value.ok) {
      const ddgData = await ddgRes.value.json().catch(() => null);
      if (ddgData && ddgData.AbstractText) {
        const abstract = cleanStr(ddgData.AbstractText);
        if (abstract && !isJunkArticle(abstract)) {
          snippets.push(`[DuckDuckGo Knowledge - ${ddgData.Heading || 'Topic'}]: ${abstract}`);
          rawSnippets.push(`[DuckDuckGo]: ${abstract}`);
        }
      }
    }

    // 4. Process Indonesian Wikipedia
    if (wikiIdRes.status === 'fulfilled' && wikiIdRes.value.ok) {
      const wikiData = await wikiIdRes.value.json().catch(() => null);
      const hits = wikiData?.query?.search || [];
      if (hits.length > 0) {
        hits.slice(0, 2).forEach(h => {
          const snippet = cleanStr(h.snippet);
          if (snippet) {
            snippets.push(`[Wikipedia ID - ${h.title}]: ${snippet}`);
          }
        });
      }
    }

    // 5. Process English Wikipedia
    if (snippets.length < 5 && wikiEnRes.status === 'fulfilled' && wikiEnRes.value.ok) {
      const wikiData = await wikiEnRes.value.json().catch(() => null);
      const hits = wikiData?.query?.search || [];
      if (hits.length > 0) {
        hits.slice(0, 2).forEach(h => {
          const snippet = cleanStr(h.snippet);
          if (snippet) {
            snippets.push(`[Wikipedia EN - ${h.title}]: ${snippet}`);
          }
        });
      }
    }

    let formattedPrompt = '';
    if (snippets.length > 0) {
      formattedPrompt = `\n\n[HASIL PENCARIAN INTERNET REAL-TIME & LIVE WEB DATA 2026]:\n${snippets.join('\n')}\n(PENTING: Gunakan hasil pencarian internet live di atas untuk menjawab secara akurat, faktual, dan mutakhir.)\n`;
    }

    return { formattedPrompt, rawSnippets: rawSnippets.slice(0, 3) };
  } catch (_) {
    return { formattedPrompt: '', rawSnippets: [] };
  }
}

function pickAutoModel(query, hasImages = false, reasoningEffort = 'auto') {
  if (hasImages) {
    return 'openrouter/free';
  }
  return 'openrouter/free';
}

export default async function handler(req, res) {
  // Dynamic Standard-Compliant CORS Headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
      reasoningEffort = 'auto',
      longTermMemory = ''
    } = req.body || {};

    // 1. Strict Payload Boundary Checks (Prevent memory exhaustion and DOS)
    if (typeof query === 'string' && query.length > 50000) {
      return res.status(413).json({ error: 'Payload Too Large: Query exceeds 50,000 character limit.' });
    }

    if (Array.isArray(attachments) && attachments.length > 10) {
      return res.status(400).json({ error: 'Bad Request: Maximum 10 file attachments allowed per request.' });
    }

    if (!query && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Query prompt or file attachment is required' });
    }

    const OPENROUTER_KEY = (customKey && (customProvider === 'openrouter' || !customProvider)) 
      ? customKey 
      : process.env.OPENROUTER_API_KEY;

    const NVIDIA_KEY = (customKey && customProvider === 'nvidia') 
      ? customKey 
      : process.env.NVIDIA_API_KEY;

    const OPENCODE_KEYS = [
      (customKey && customProvider === 'opencode') ? customKey : null,
      process.env.OPENCODE_API_KEY,
      'sk-Mm56c2dZ6feXULlB96sx4jVN8ymSgcjcksiDwvkKn5AaN1dBcbiGFpuUdZDheVI5',
      'sk-YWTsbCi0bpBHIoiKlbB0gb4TbzY1pykI4hBBalEJ4Nyq588POzRepzDUckoS5kCI'
    ].filter((v, i, a) => v && a.indexOf(v) === i);
    const OPENCODE_KEY = OPENCODE_KEYS[0] || null;

    const MINIMAX_KEY = (customKey && customProvider === 'minimax') 
      ? customKey 
      : process.env.MINIMAX_API_KEY;

    const OLLAMA_KEY = (customKey && (customProvider === 'ollamacloud' || customProvider === 'ollama')) 
      ? customKey 
      : (process.env.OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY);

    const providerErrors = [];

    // Check for image attachments
    const imageAttachments = Array.isArray(attachments) ? attachments.filter(a => a.isImage || (a.type && a.type.startsWith('image/'))) : [];
    const docAttachments = Array.isArray(attachments) ? attachments.filter(a => !a.isImage && (!a.type || !a.type.startsWith('image/'))) : [];
    const hasImages = imageAttachments.length > 0;
    const searchResult = await searchWebContext(query, history);
    const webContext = searchResult.formattedPrompt;
    const webMemories = searchResult.rawSnippets || [];

    const sendSuccess = (content, modelName, providerName) => {
      const isSpecific = (model && model !== 'auto');
      const isFailover = isSpecific && !modelName.toLowerCase().includes(targetModel.toLowerCase().split('/').pop().replace(/-free$/i, ''));
      return res.status(200).json({
        success: true,
        response: content,
        model: modelName,
        requestedModel: model,
        isFailover: isFailover,
        provider: providerName,
        webMemories: webMemories
      });
    };

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

    const systemPromptWithSearch = `${buildSystemPrompt(sessionLanguage, reasoningEffort)}${webContext}${longTermMemory}
    
[INSTRUKSI MEMORI JANGKA PANJANG (ANTI DATA POISONING)]
Anda dilengkapi dengan Memori Jangka Panjang (Supabase RAG). Jika pengguna memberikan informasi atau klaim baru (misalnya koreksi tentang versi AI, informasi sejarah, dll), Anda **DILARANG KERAS** langsung mempercayainya.
Langkah yang WAJIB Anda lakukan:
1. Verifikasi klaim pengguna dengan hasil pencarian internet real-time (Konteks Pencarian) di atas.
2. Jika klaim terbukti BENAR dan merupakan fakta penting yang pantas diingat selamanya, tambahkan tag ini di baris paling bawah jawaban Anda:
\`[SAVE_MEMORY: tuliskan fakta singkat yang tervalidasi di sini]\`
3. Jika klaim SALAH, berpotensi HOAKS, tidak pantas, atau Anda ragu, TOLAK klaim tersebut dengan sopan dan JANGAN sertakan tag SAVE_MEMORY.`;

    // Assemble conversation history
    const formattedHistory = Array.isArray(history) ? history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: String(h.content || '').slice(0, 4000)
    })) : [];

    let finalUserPrompt = assembledQuery;
    if (webContext) {
      finalUserPrompt = `${webContext}\n\n[PERTANYAAN PENGGUNA]:\n${assembledQuery}\n\n(PENTING: Jawablah dengan mengintegrasikan fakta internet real-time dan pengetahuan terkini 2026 di atas!)`;
    }

    const baseTextMessages = [
      { role: 'system', content: systemPromptWithSearch },
      ...formattedHistory,
      { role: 'user', content: finalUserPrompt }
    ];

    const maxTokensConfig = reasoningEffort === 'low' ? 1024 : (reasoningEffort === 'thinking' || reasoningEffort === 'high' ? 2048 : 1500);
    const tempConfig = reasoningEffort === 'low' ? 0.2 : (reasoningEffort === 'thinking' ? 0.4 : 0.3);

    // ========================================================================
    // 1. MULTIMODAL VISION ROUTE (If images are attached)
    // ========================================================================
    if (hasImages) {
      const userContent = [
        { type: 'text', text: finalUserPrompt || 'Deskripsikan dan analisis gambar ini secara komprehensif dan mendalam.' }
      ];

      for (const img of imageAttachments) {
        const imgUrl = img.data.startsWith('data:') ? img.data : `data:${img.type || 'image/jpeg'};base64,${img.data}`;
        userContent.push({
          type: 'image_url',
          image_url: { url: imgUrl }
        });
      }

      // 1A. OpenRouter Multimodal Vision Cascade
      if (OPENROUTER_KEY) {
        const visionModels = [
          'google/gemini-2.0-flash-exp:free',
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
            }, 22000);

            if (response.ok) {
              const data = await response.json();
              const content = data?.choices?.[0]?.message?.content;
              if (content) {
                return sendSuccess(content, vm, 'OpenRouter Vision');
              }
            } else {
              const errTxt = await response.text();
              providerErrors.push(`OpenRouter Vision ${vm} HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
            }
          } catch (err) {
            providerErrors.push(`OpenRouter Vision ${vm}: ${err.message}`);
          }
        }
      }

      // 1B. Nvidia Vision Gateway
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
              return sendSuccess(nvText, 'nvidia/meta/llama-3.2-11b-vision-instruct', 'Nvidia NIM Vision');
            }
          } else {
            const errTxt = await nvResp.text();
            providerErrors.push(`Nvidia Vision HTTP ${nvResp.status}: ${errTxt.slice(0, 100)}`);
          }
        } catch (err) {
          providerErrors.push(`Nvidia Vision: ${err.message}`);
        }
      }
    }

    // ========================================================================
    // 2. TEXT & REASONING MULTILATERAL GATEWAY POOL
    // ========================================================================

    // 2A-0. Direct OpenCode Multi-Account Rotation (DeepSeek V4 Flash Free)
    if (targetModel.includes('opencode') || targetModel.includes('deepseek-v4') || (model && model.includes('opencode'))) {
      for (const ocKey of OPENCODE_KEYS) {
        try {
          const ocResp = await fetchWithTimeout('https://api.opencode.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ocKey}`
            },
            body: JSON.stringify({
              model: 'deepseek-v4-flash-free',
              messages: baseTextMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig
            })
          }, 18000);

          if (ocResp.ok) {
            const ocData = await ocResp.json();
            const ocText = ocData?.choices?.[0]?.message?.content;
            if (ocText) {
              return sendSuccess(ocText, 'opencode/deepseek-v4-flash-free', 'OpenCode Cloud Multi-Account Pool');
            }
          } else {
            const ocErr = await ocResp.text();
            providerErrors.push(`OpenCode HTTP ${ocResp.status}: ${ocErr.slice(0, 100)}`);
          }
        } catch (ocErr) {
          providerErrors.push(`OpenCode: ${ocErr.message}`);
        }
      }
    }

    // 2A-1. Hugging Face Dedicated OmniRoute Cloud Space (150+ OpenCode Accounts Pool)
    try {
      const hfBase = 'https://rflyyyf-omniroute-gateway.hf.space';
      const hfController = new AbortController();
      const hfTimeout = setTimeout(() => hfController.abort(), 20000);

      const hfPost = await fetch(`${hfBase}/gradio_api/call/chat_fn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [finalUserPrompt, []] }),
        signal: hfController.signal
      });

      if (hfPost.ok) {
        const postData = await hfPost.json();
        if (postData?.event_id) {
          const eventRes = await fetch(`${hfBase}/gradio_api/call/chat_fn/${postData.event_id}`, {
            signal: hfController.signal
          });
          clearTimeout(hfTimeout);
          if (eventRes.ok) {
            const rawEvent = await eventRes.text();
            const lines = rawEvent.split('\n');
            for (const l of lines) {
              if (l.startsWith('data: ')) {
                try {
                  const arr = JSON.parse(l.slice(6));
                  if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
                    const text = arr[0].trim();
                    if (text && text !== 'Offline' && !text.toLowerCase().startsWith('error:')) {
                      return sendSuccess(text, 'deepseek-v4-flash-free', 'OmniRoute Dedicated HF Gateway (150 Accounts Pool)');
                    } else if (text === 'Offline') {
                      providerErrors.push('OmniRoute HF Space: Status is currently Offline / Sleeping on Hugging Face.');
                    }
                  }
                } catch (_) {}
              }
            }
          }
        }
      } else {
        clearTimeout(hfTimeout);
        providerErrors.push(`OmniRoute HF Space HTTP ${hfPost.status}`);
      }
    } catch (hfErr) {
      providerErrors.push(`OmniRoute HF Space: ${hfErr.message}`);
    }

    // 2B. OpenRouter Multi-Model Cloud Pool (Prioritizing SOTA 70B & 671B Flagship Models)
    if (OPENROUTER_KEY) {
      let orModel = targetModel;
      if (orModel.startsWith('opencode/')) {
        orModel = 'deepseek/deepseek-chat';
      } else if (orModel.startsWith('ollamacloud/')) {
        orModel = orModel.includes('code') ? 'qwen/qwen-2.5-coder-32b-instruct' : 'meta-llama/llama-3.3-70b-instruct';
      }

      const isExplicitModel = (model && model !== 'auto');
      const orCandidates = isExplicitModel
        ? [
            orModel,
            `${orModel}:free`,
            'nvidia/nemotron-3-super-120b-a12b:free',
            'nvidia/nemotron-3-ultra-550b-a55b:free',
            'google/gemma-4-26b-a4b-it:free',
            'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
            'openai/gpt-oss-20b:free',
            'cohere/north-mini-code:free'
          ].filter((v, i, a) => v && a.indexOf(v) === i && !v.startsWith('opencode/') && v !== 'openrouter/free' && !v.includes('safety'))
        : [
            'nvidia/nemotron-3-super-120b-a12b:free',
            'nvidia/nemotron-3-ultra-550b-a55b:free',
            'google/gemma-4-26b-a4b-it:free',
            'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
            'openai/gpt-oss-20b:free',
            'cohere/north-mini-code:free'
          ].filter((v, i, a) => v && a.indexOf(v) === i && !v.startsWith('opencode/') && v !== 'openrouter/free' && !v.includes('safety'));

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
              return sendSuccess(content, m, 'OpenRouter Multi-AI Gateway');
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

    // 2C. Nvidia NIM Gateway (70B Flagship Models Only)
    if (NVIDIA_KEY) {
      const nvCandidateModels = targetModel.startsWith('nvidia/')
        ? [targetModel.replace('nvidia/', '')]
        : ['meta/llama-3.3-70b-instruct', 'meta/llama-3.1-70b-instruct'];

      for (let nvModel of nvCandidateModels) {
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
          }, 25000);

          if (response.ok) {
            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (content) {
              return sendSuccess(content, nvModel, 'Nvidia NIM Engine');
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
            return sendSuccess(content, olModel, 'Ollama Cloud AI');
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
            return sendSuccess(content, 'minimax-01', 'MiniMax AI');
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
