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

WAKTU AKTIF & ENSIKLOPEDIA PERISTIWA DUNIA NYATA LENGKAP (2024 - 2026):
1. Waktu Sistem Saat Ini: Tahun 2026 (Abad ke-21).

2. Kepemimpinan, Pemerintahan & Kebijakan Republik Indonesia (2024 - 2026):
   - Pemilihan Umum 14 Februari 2024: Pilpres & Pileg serentak di seluruh Indonesia. Pasangan Prabowo Subianto & Gibran Rakabuming Raka memenangkan Pilpres satu putaran (~58,59% suara).
   - Pelantikan Resmi: 20 Oktober 2024 di Gedung MPR/DPR RI, Jakarta.
   - Presiden RI ke-8: Jenderal TNI (Purn.) Prabowo Subianto (Masa bakti: 2024 - 2029).
   - Wakil Presiden RI ke-14: Gibran Rakabuming Raka (Masa bakti: 2024 - 2029).
   - Nama Kabinet: Kabinet Merah Putih (terdiri dari kementerian koordinator dan kementerian teknis).
   - Restrukturisasi Kementerian Utama:
     * Transformasi Kominfo menjadi Komdigi (Kementerian Komunikasi dan Digital).
     * Pemisahan Kemendikbudristek menjadi Kemendikdasmen (Pendidikan Dasar dan Menengah), Kemdiktisaintek (Pendidikan Tinggi, Sains, dan Teknologi), dan Kementerian Kebudayaan.
   - Presiden ke-7 Joko Widodo telah purnatugas pada 20 Oktober 2024 setelah menyelesaikan 2 periode masa jabatan (2014-2024).
   - Pilkada Serentak: Digelar 27 November 2024 di 37 Provinsi dan 508 Kabupaten/Kota di seluruh Indonesia.
   - Ibu Kota Nusantara (IKN): Peringatan HUT RI ke-79 perdana diselenggarakan di IKN (17 Agustus 2024). Istana Garuda dan Istana Negara telah diresmikan, dan pembangunan infrastruktur yudikatif/legislatif berlanjut bertahap.
   - Transportasi & Infrastruktur: Kereta Cepat Jakarta-Bandung (Whoosh) beroperasi komersial penuh, LRT Jabodebek terintegrasi, dan pembangunan MRT Jakarta Fase 2 terus berjalan.

3. Peristiwa Geopolitik & Pemimpin Global Utama (2024 - 2026):
   - Pemilihan Presiden Amerika Serikat 2024 (5 November 2024): Dimenangkan oleh Donald Trump (Partai Republik) mengalahkan Kamala Harris (Partai Demokrat). Donald Trump dilantik sebagai Presiden ke-47 AS pada Januari 2025 bersama Wakil Presiden JD Vance.
   - Inggris Raya: Pemilu Juli 2024 dimenangkan oleh Partai Buruh, Keir Starmer dilantik menjadi Perdana Menteri Inggris menggantikan Rishi Sunak.
   - Jepang: Shigeru Ishiba terpilih sebagai Perdana Menteri Jepang (Oktober 2024).
   - Meksiko: Claudia Sheinbaum resmi dilantik sebagai Presiden Wanita pertama dalam sejarah Meksiko (Oktober 2024).
   - Blok BRICS: Perluasan keanggotaan dengan bergabungnya Arab Saudi, Uni Emirat Arab, Mesir, Iran, dan Ethiopia.

4. Revolusi & Katalog Lengkap Model AI Frontier Teranyar (2025 - 2026):
   Jika ditanya mengenai model AI terbaru atau perkembangan AI terkini, WAJIB menguraikan model-model terdepan berikut:
   - Google DeepMind:
     * Gemini 3.7 Flash & Gemini 3.5 Flash: Model multimodal frontier terbaru dengan kapabilitas Hybrid Reasoning (Thinking Tokens), latensi sub-detik, dan efisiensi komputasi ekstrem.
     * Gemini 3.0 Pro & Gemini 2.5 / 2.0 Flash: Pemrosesan multimodal terpadu teks, audio, video, dan kode secara real-time.
     * Gemma 3 & Gemma 2 (27B/12B/4B): Model open weights multimodal vision teratas.
     * Veo 2 / Veo 3 & Imagen 3: Generasi video sinematik 4K dan sintesis visual fotorealistik.
   - OpenAI:
     * GPT-5 series / GPT-5.6 (Sol, Terra, Luna): Generasi model multi-tier OpenAI dengan varian adaptif untuk penalaran komputasi tinggi, efisiensi agen, dan pemrosesan multimodal instan.
     * OpenAI o3, o4, o3-mini, dan o1 (Strawberry): Model penalaran mendalam (*deep reasoning*) berbasis Reinforcement Learning dan alokasi waktu berpikir (*thinking tokens / inference-time compute*) untuk matematika, sains, dan koding kompleks.
     * GPT-4.5 (Orion) & GPT-4o: Model multimodal terpadu teks, visi, dan audio real-time berlatensi instan.
     * Sora 2: Model generasi video dunia nyata berkualitas tinggi.
   - Anthropic:
     * Claude 3.7 Sonnet (Hybrid Reasoning with Extended Thinking) & Claude 3.7 Opus: Model nomor 1 dunia dalam penalaran kode mandiri, Computer Use, dan arsitektur agen otonom.
     * Claude 3.5 Sonnet & Claude 3.5 Haiku: Model cepat, presisi, dan andal untuk koding dan analisis berkas.
   - Zhipu AI / THUDM:
     * GLM-5.3 & GLM-5 / GLM-4.5: Frontier penalaran logika, agentic workflows, & multimodal bahasa Mandarin-Inggris-Indonesia.
     * CogVideoX-5B & GLM-4-Voice: Ekosistem AI video generatif dan percakapan suara real-time end-to-end.
   - Alibaba Cloud / Tongyi Lab:
     * Qwen 3 & Qwen 3.8: Arsitektur penalaran terpadu matematika, koding, dan bahasa multibahasa.
     * Qwen 2.5-Max & Qwen 2.5 Coder (32B): Model spesialis koding nomor 1 open source di dunia.
     * Qwen 2.5 VL (Vision-Language 72B): SOTA dalam pemahaman citra, bagan, dokumen teknis, dan video.
   - Moonshot AI:
     * Kimi k3 & Kimi k2.7 / k1.5: Pelopor Deep Reasoning Chain-of-Thought dengan context window ultra-panjang (2.000.000+ hingga 10.000.000 token) untuk riset akademik dan koding masif.
   - DeepSeek AI:
     * DeepSeek V4 Flash & DeepSeek V4: Generasi frontier terbaru DeepSeek dengan arsitektur MoE generasi ke-4, inferensi waktu nyata ultra-cepat, dan efisiensi penalaran tingkat tinggi.
     * DeepSeek R1 & R2: Model reasoning murni berbasis Reinforcement Learning berskala besar yang menyaingi model tertutup o1/o3 pada komputasi terbuka.
     * DeepSeek V3 & V3.5: Model MoE 671B (37B active) dengan arsitektur Multi-Head Latent Attention (MLA) dan FP8 precision.
   - xAI (Elon Musk):
     * Grok 3, Grok 3.5 & Grok 2: Dilatih pada superkomputer Colossus (100.000+ hingga 200.000 GPU Nvidia) dengan akses data real-time dan penalaran sains tingkat tinggi.
   - Meta AI:
     * Llama 4 (Scout/Maverick preview) & Llama 3.3 (70B Instruct): Standar baru efisiensi open-source AI global.
   - Mistral AI:
     * Mistral Large 3 / Large 2 (123B), Codestral 25B, Pixtral Large (124B Vision), dan Mistral Small 24B: Fondasi AI berkinerja tinggi dari Eropa.
   - MiniMax AI & ByteDance:
     * MiniMax-01 (456B MoE, 4M token context) & Hailuo AI Video.
     * Doubao 1.5 Pro & Jimeng Video AI.
   - Akselerator Hardware AI:
     * Nvidia Blackwell B200 / GB200 NVL72, AMD Instinct MI300X/MI325X, dan Apple Silicon M4/M3 Max.

5. Sains, Antariksa & Eksplorasi (2024 - 2026):
   - SpaceX Starship: Rangkaian uji terbang terintegrasi IFT-3, IFT-4, dan IFT-5 (Oktober 2024: sukses menangkap booster raksasa Super Heavy kembali ke menara peluncur Mechazilla di Starbase Texas).
   - Eksplorasi Bulan: Pendaratan wahana pendarat swasta pertama Odysseus (Intuitive Machines) di kutub selatan bulan (Februari 2024), SLIM Jepang (Januari 2024), dan persiapan Misi Artemis II NASA.
   - Teleskop James Webb (JWST): Konfirmasi penemuan galaksi tertua JADES-GS-z14-0 pada redshift z=14.32 (terbentuk 290 juta tahun pasca Big Bang).

6. Pesta Olahraga Dunia & Prestasi Indonesia (2024 - 2026):
   - Olimpiade Paris 2024 (26 Juli - 11 Agustus 2024):
     * Indonesia mengukir sejarah dengan meraih 2 Medali Emas lewat Veddriq Leonardo (Panjat Tebing Speed Putra - 4.75 detik) dan Rizki Juniansyah (Angkat Besi 73kg Putra - rekor Clean & Jerk 199kg).
     * Gregoria Mariska Tunjung meraih Medali Perunggu Bulu Tangkis Tunggal Putri.
     * Indonesia finis di peringkat 39 dunia.
   - Sepak Bola:
     * Timnas Indonesia: Lolos ke Putaran ke-3 Kualifikasi Piala Dunia 2026 Zona Asia (sejarah pertama kali) serta menembus Babak 16 Besar Piala Asia AFC 2023 di bawah asuhan Shin Tae-yong.
     * UEFA Euro 2024: Spanyol keluar sebagai Juara Eropa usai menaklukkan Inggris 2-1 di Berlin (Lamine Yamal dinobatkan sebagai pemain muda terbaik).
     * Copa America 2024: Argentina meraih gelar juara usai mengalahkan Kolombia 1-0.
     * Ballon d'Or 2024: Dimenangkan oleh Rodri (Manchester City & Timnas Spanyol) untuk kategori pria dan Aitana Bonmati untuk kategori wanita.

7. ATURAN INTEGRITAS PENGETAHUAN:
   - DILARANG menyatakan bahwa peristiwa 2024 belum berlangsung atau info belum resmi.
   - Jawab seluruh pertanyaan pengguna dengan perspektif faktual tahun 2026.

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
 * Real-Time Autonomous Web & Encyclopedic Knowledge Searcher (Multi-Provider)
 */
async function searchWebContext(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 3) return '';

  const qLower = query.toLowerCase().trim();
  if (['clear', 'help', 'skills', 'projects', 'certifs', 'benchmarks', 'cls', 'about'].includes(qLower)) {
    return '';
  }

  try {
    const cleanSearchQuery = query.replace(/[^\w\s]/gi, ' ').trim().slice(0, 100);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Multi-source concurrent live internet search
    const [googleNewsRes, wikiIdRes, wikiEnRes] = await Promise.allSettled([
      fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(cleanSearchQuery)}&hl=id&gl=ID&ceid=ID:id`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      }),
      fetch(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearchQuery)}&format=json&origin=*`, { signal: controller.signal }),
      fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearchQuery)}&format=json&origin=*`, { signal: controller.signal })
    ]);

    clearTimeout(timeout);

    let snippets = [];

    // 1. Parse Google News Live Articles (Real-time Breaking News & Tech updates 2026)
    if (googleNewsRes.status === 'fulfilled' && googleNewsRes.value.ok) {
      const xml = await googleNewsRes.value.text().catch(() => '');
      if (xml) {
        const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
        items.slice(0, 5).forEach((item) => {
          const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
          const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
          const cleanTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim() : '';
          if (cleanTitle) {
            snippets.push(`[Live Web / Berita Terkini (${dateMatch ? dateMatch[1] : '2026'})]: ${cleanTitle}`);
          }
        });
      }
    }

    // 2. Parse Indonesian Wikipedia
    if (wikiIdRes.status === 'fulfilled' && wikiIdRes.value.ok) {
      const wikiData = await wikiIdRes.value.json().catch(() => null);
      const hits = wikiData?.query?.search || [];
      if (hits.length > 0) {
        hits.slice(0, 2).forEach(h => {
          const cleanSnippet = h.snippet.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
          if (cleanSnippet) {
            snippets.push(`[Wikipedia ID - ${h.title}]: ${cleanSnippet}`);
          }
        });
      }
    }

    // 3. Parse English Wikipedia (Fallback / Global Tech)
    if (snippets.length < 4 && wikiEnRes.status === 'fulfilled' && wikiEnRes.value.ok) {
      const wikiData = await wikiEnRes.value.json().catch(() => null);
      const hits = wikiData?.query?.search || [];
      if (hits.length > 0) {
        hits.slice(0, 2).forEach(h => {
          const cleanSnippet = h.snippet.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
          if (cleanSnippet) {
            snippets.push(`[Wikipedia EN - ${h.title}]: ${cleanSnippet}`);
          }
        });
      }
    }

    if (snippets.length > 0) {
      return `\n\n[HASIL PENCARIAN INTERNET REAL-TIME & LIVE WEB DATA 2026]:\n${snippets.join('\n')}\n(PENTING: Gunakan hasil pencarian internet live di atas untuk menjawab secara akurat, faktual, dan mutakhir.)\n`;
    }
  } catch (_) {}
  return '';
}

function pickAutoModel(query, hasImages = false, reasoningEffort = 'auto') {
  if (hasImages) {
    return 'google/gemma-3-27b-it';
  }

  if (reasoningEffort === 'thinking') {
    return 'opencode/deepseek-v4-flash-free';
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

  return 'opencode/deepseek-v4-flash-free';
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
      reasoningEffort = 'auto'
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

    const OPENCODE_KEY = (customKey && customProvider === 'opencode') 
      ? customKey 
      : process.env.OPENCODE_API_KEY;

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
    const tempConfig = reasoningEffort === 'low' ? 0.6 : (reasoningEffort === 'thinking' ? 0.7 : 0.8);

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
                return res.status(200).json({
                  success: true,
                  response: content,
                  model: vm,
                  provider: 'OpenRouter Vision'
                });
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
    }

    // ========================================================================
    // 2. TEXT & REASONING MULTILATERAL GATEWAY POOL
    // ========================================================================

    // 2A. OpenRouter Multi-Model Cloud Pool (Prioritizing SOTA 70B & 671B Flagship Models)
    if (OPENROUTER_KEY) {
      let orModel = targetModel;
      if (orModel.startsWith('opencode/')) {
        orModel = 'deepseek/deepseek-chat';
      } else if (orModel.startsWith('ollamacloud/')) {
        orModel = orModel.includes('code') ? 'qwen/qwen-2.5-coder-32b-instruct' : 'meta-llama/llama-3.3-70b-instruct';
      }

      const orCandidates = [
        'deepseek/deepseek-chat:free',
        'deepseek/deepseek-r1:free',
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.3-70b-instruct:free',
        'qwen/qwen-2.5-coder-32b-instruct:free',
        'google/gemini-2.0-flash-exp:free',
        orModel,
        `${orModel}:free`,
        'meta-llama/llama-3.3-70b-instruct'
      ].filter((v, i, a) => v && a.indexOf(v) === i && !v.startsWith('opencode/'));

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

    // 2B. OpenCode Gateway (If explicitly targeted)
    const isTargetingOpenCode = targetModel.startsWith('opencode/') || targetModel.includes('deepseek-v4');
    if (OPENCODE_KEY && isTargetingOpenCode) {
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
              provider: 'OpenCode DeepSeek V4 Flash'
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
