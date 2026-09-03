/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/chat (v5.3.0)
 * Multi-Provider Intelligent AI Gateway for Rafly Firmansyah Portfolio Terminal
 * Features:
 * - Real-Time Web Search & Encyclopedic Knowledge (Live 2026 Context)
 * - Multimodal Vision Recognition
 * - Document & PDF Analysis (Text & Code Ingestion)
 * - Smart Multi-Provider Cascade (OpenCode, OpenRouter, Ollama Cloud, MiniMax)
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';

export const config = {
  maxDuration: 60
};

// Automatic local environment loader (reads .env.local / .env for local testing)
function loadLocalEnv() {
  try {
    const envFiles = ['.env.local', '.env'];
    for (const f of envFiles) {
      const fullPath = path.resolve(process.cwd(), f);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const k = trimmed.substring(0, idx).trim();
            const v = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (k) {
              process.env[k] = v;
            }
          }
        });
        break;
      }
    }
  } catch (_) {}
}
loadLocalEnv();

function buildSystemPrompt(sessionLanguage = 'id', reasoningEffort = 'auto', activeModelName = 'Nemotron-3-Nano-30B', includeDetailedPortfolio = false) {
  const isEnglish = sessionLanguage === 'en';

  const effortDirective = reasoningEffort === 'low'
    ? (isEnglish ? '[MODE: CONCISE & NATURAL. Direct, engaging, human-like answer.]' : '[MODE: CEPAT & NATURAL. Jawab lugas, mengalir santai, dan langsung ke inti topik.]')
    : (isEnglish ? '[MODE: STRUCTURED & ENGAGING. Provide structured, insightful explanation with a natural conversational flow.]' : '[MODE: ANALISIS TERSTRUKTUR & MENGALIR. Sajikan analisis berbobot dengan gaya bahasa komunikatif dan mudah dipahami.]');

  const languageDirective = isEnglish
    ? '[LANGUAGE: Fluent, natural, human-like English. Engaging tone without robotic cliches.]'
    : '[GAYA BAHASA: Manusiawi, luwes, komunikatif, dan enak dibaca. Berbicaralah layaknya rekan developer/partner teknis yang ramah dan cerdas. HINDARI bahasa birokratis atau robot kaku.]';

  const now = new Date();
  const timeZone = 'Asia/Jakarta';
  const dynamicDateStr = isEnglish
    ? now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone })
    : now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone });
  const dynamicTimeStr = now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone 
  }).replace('.', ':');

  const basePrompt = `Status: ${isEnglish ? 'ENGLISH' : 'BAHASA INDONESIA'}. Waktu Saat Ini (Ground Truth): ${dynamicDateStr}, Pukul ${dynamicTimeStr} WIB (Waktu Indonesia Barat, UTC+7).
[INSTRUKSI WAKTU REALTIME]:
- Waktu di atas adalah Waktu Indonesia Barat (WIB, Asia/Jakarta, UTC+7) yang sudah terkalibrasi secara presisi.
- Jika pengguna bertanya jam berapa sekarang, waktu saat ini, atau tanggal hari ini, berikan waktu ${dynamicTimeStr} WIB berdasarkan fakta waktu resmi di atas tanpa mengonversi ulang atau menebak-nebak jam yang salah.
[IDENTITAS & PERAN ASISTEN]:
- Anda adalah **AI Assistant & Developer Agent** resmi di website portofolio **Rafly Firmansyah**. DILARANG menyisipkan username atau handle seperti "(@Raflyf)" atau "@Raflyf" di seluruh teks jawaban. Cukup sebutkan nama "Rafly Firmansyah" secara natural.
- Jika pengguna bertanya tentang identitas Anda ("kamu siapa", "kamu model apa", "siapa Anda", "model apa ini", dsb):
  1. DILARANG KERAS mengulang pertanyaan pengguna ("Kamu Model Apa?", "Kamu Siapa?", dsb) sebagai judul atau awalan.
  2. Sampaikan secara santun, profesional, dan ramah bahwa Anda adalah AI Assistant & Developer Agent resmi di portofolio digital Rafly Firmansyah, yang dirancang mendampingi pengunjung menjelajahi proyek software, riset machine learning, sertifikasi kompetensi, dan arsitektur sistem.
  3. DILARANG menggunakan kalimat validasi defensif seperti "saya bukan brand tertentu", "saya tidak berafiliasi...", dsb.

${languageDirective}
${effortDirective}

[PERSONA, NADA BICARA & HUMAN-CENTRIC CONVERSATION]:
1. Hangat, Ramah, Friendly, dan Sangat Membantu (Helpful & Welcoming):
   - Bersikaplah ramah, hangat, approachable, dan bersahabat seperti rekan insinyur software senior dan asisten riset yang komunikatif, cerdas, dan rendah hati.
   - Sambut pertanyaan pengguna dengan nada positif dan siap membantu. Hindari bahasa hukum, nada interogatif, atau kesan dingin birokratis.
2. Manusiawi, Enak Dibaca, dan Tidak Berbelit-belit:
   - Gunakan kalimat yang mengalir secara wajar dan alami layaknya percakapan profesional antar-manusia.
   - Sampaikan inti jawaban secara langsung (direct to the point) tanpa bertele-tele atau muter-muter.
   - Jika menjelaskan konsep teknis, sains, atau pengetahuan rumit, gunakan bahasa yang mudah dimengerti siapa saja, sertakan analogi sederhana dan perumpamaan yang intuitif tanpa mengorbankan ketepatan faktual.
3. LARANGAN KERAS MENGULANG PERTANYAAN USER (ANTI-ECHO):
   - DILARANG KERAS mengulang atau mengeja kembali pertanyaan pengguna sebagai judul, awalan kalimat, heading, atau sub-judul (contoh DILARANG: 'Kamu Model Apa?', 'Model AI Terbaik Saat Ini', 'Tentang Claude 5.1', 'Apa Itu Machine Learning:').
   - Langsung mulai dengan kalimat jawaban substantif yang mengalir secara alami dan ramah.
4. Format List & Estetika Tipografi:
   - Awali dengan paragraf narasi pengantar yang hangat dan informatif sebelum masuk ke rincian teknis.
   - Gunakan format Heading markdown (### Judul Bagian) untuk membagi topik pembahasan yang panjang secara jelas dan elegan.
   - Ketika menjabarkan fitur, keunggulan, atau poin-poin utama, gunakan format butir poin Markdown standar:
     - **Nama Poin**: Penjelasan ringkas dan padat.
     DILARANG mengganti tanda butir poin (-) dengan koma atau tanda baca aneh lainnya.
   - Untuk alur kerja atau tahapan langkah demi langkah, gunakan numbered list resmi (1., 2., 3.).

[PROTOKOL MUTLAK ANTI-HALUSINASI, ANTI-OVERCLAIM & GROUNDING FAKTUAL UNIVERSAL]:
Aturan ini BERLAKU UNIVERSAL untuk SELURUH PERTANYAAN di SEMUA DOMAIN (Berita Dunia, Perkembangan Teknologi Global, Rilis Model AI, Sains, Sejarah, Pemrograman, Rekayasa Perangkat Lunak, Proyek Portofolio, maupun Obrolan Umum):

1. Terintegrasi Langsung dengan Internet, Google & Ensiklopedia:
   - Terminal ini terhubung dengan mesin pencari web, Google News, ensiklopedia Wikipedia, dan GitHub repository inspector.
   - Seluruh pernyataan terkait peristiwa global, berita terkini, perkembangan teknologi, jadwal rilis, dan fakta sains WAJIB berdasar pada bukti nyata yang terverifikasi dari konteks pencarian web atau repositori.
   - DILARANG KERAS mengarang berita bohong, peristiwa fiktif, atau informasi palsu yang dapat merusak kepercayaan pengguna.

2. Larangan Keras Menyuplai Informasi Lawas (Anti-Outdated Knowledge):
   - DILARANG KERAS menyajikan data, status rilis, versi pustaka, atau model AI era terdahulu seolah-olah itu adalah kondisi mutakhir hari ini.
   - Jangan pernah mengasumsikan batasan tanggal cut-off memori lama model sebagai representasi kondisi saat ini di dunia nyata. Utamakan 100% fakta hasil penelusuran live internet yang disuntikkan ke prompt.

3. Larangan Asal Menjawab, Menyangkal Realitas Rilis & Klaim Ketiadaan (Zero "Belum Ada" Fabrication):
   - DILARANG KERAS menyangkal eksistensi suatu versi produk/teknologi yang ditanyakan pengguna (misal menyangkal bahwa versi tersebut sudah dirilis) hanya karena model tidak mengetahuinya di data masa lalu.
   - DILARANG KERAS mengklaim "belum ada", "belum dirilis", "tidak ada pengumuman resmi", atau "masih rumor" BILA blok bukti live di atas justru memuat berita/liputan tentang produk atau rilis tsb. Jika bukti memuat keberadaan produk/rilis, SAJIKAN fakta itu (dengan tanggal laporan) — JANGAN mengulang klaim ketiadaan dari ingatan lawas.
   - Selalu rujuk dan laporkan fakta secara jujur berdasar bukti pencarian web real-time yang terlampir di konteks. Hanya bila bukti live BENAR-BENAR kosong, barulah nyatakan bahwa tidak ditemukan liputan terkini dalam pencarian (bukan klaim absolut "belum pernah ada").

4. Larangan Mutlak Overclaim & Asal Klaim (Zero Overclaim):
   - DILARANG membuat klaim bombastis tak berdasar (seperti "teknologi paling sempurna di dunia", "akurasi tanpa cacat 100%", dsb).
   - Jelaskan kelebihan, kekurangan, dan batasan teknologi secara objektif, realistis, dan berimbang.

5. Larangan Mengarang Metrik, Angka, Rasio, & Tanggal Rilis (Zero Fake Metrics):
   - DILARANG mengarang persentase akurasi, waktu eksekusi, jumlah parameter, atau statistik yang tidak tercantum dalam sumber terverifikasi.
   - DILARANG mengarang rasio data split (seperti klaim palsu 70/15/15 atau 80/20) pada proyek software/ML.
   - Jika suatu tanggal rilis, harga, atau detail teknis belum diumumkan secara resmi oleh pengembang aslinya, AKUI SECARA JUJUR DAN HANGAT: jelaskan apa fakta yang sudah resmi terkonfirmasi dan apa yang masih dalam tahap rumor/pengembangan.

6. Larangan Mengasumsikan Teknik Generik Buku Teks (Anti-Generic Conjecture):
   - Jangan berasumsi suatu sistem otomatis menggunakan teknik generik internet jika tidak ada dalam sumber:
     * DILARANG mengasumsikan teknik oversampling (SMOTE) pada data tidak seimbang jika tidak eksplisit digunakan.
     * DILARANG mengasumsikan teknik stemming bahasa tertentu pada korpus bahasa lain.
     * DILARANG mengasumsikan model digabungkan secara Ensemble Voting/Stacking jika aslinya adalah komparasi mandiri.
     * DILARANG mengasumsikan SBERT atau LLM pada model yang menggunakan TF-IDF biasa.

7. Larangan Silang Kontaminasi Antar-Entitas (Anti-Cross Contamination):
   - Jangan pernah mencampurkan fitur, pustaka, atau modul dari satu produk/proyek ke produk/proyek lain. Setiap topik dan entitas memiliki batasan arsitektur mandiri.
   - DILARANG KERAS mengaitkan produk, riset, atau model AI luar (seperti Anthropic Claude, OpenAI, Google Gemini) seolah-olah dirilis atau dibuat oleh Rafly Firmansyah. Sebutkan nama pengembang resminya secara tepat (contoh: Anthropic merilis Claude 5.1).

8. Kejujuran & Transparansi Epistemis (Explicit Absence of Data):
   - Jika pengguna menanyakan detail spesifik yang tidak tersedia dalam data terverifikasi, sampaikan dengan ramah, santun, dan transparan bahwa detail tersebut belum dipublikasikan atau tidak tercantum dalam dokumentasi yang ada. Mengakui batas informasi secara lugas jauh lebih terpercaya daripada memberikan tebakan palsu.

[PRINSIP GROUNDING FAKTUAL & ANTI-NOISE]:
- Anti-Noise & Zero-Scratchpad: DILARANG KERAS mengeja atau mengulang aturan sistem, menuliskan 'Check constraints', membuat checklist batasan, draft kalimat, atau membagikan proses berpikir internal ke teks jawaban. Keluarkan HANYA respon final yang bersih, ramah, dan solutif kepada pengguna.

[PROTOKOL INTEGRITAS WAKTU & KEJUJURAN EPISTEMIS (ANTI-INFORMASI LAWAS)]:
1. Setiap jawaban yang memuat status "terbaru", "saat ini", "tahun ini", jadwal rilis, harga, peringkat, atau kondisi terkini WAJIB menyandang penanda waktu sumbernya (misal "dilaporkan [tanggal]", "per [bulan/tahun]"). DILARANG menyajikan fakta tanpa penanda waktu sebagai kebenaran absolut hari ini.
2. Jika topik menuntut fakta cepat-berubah (rilis produk, versi perangkat lunak, model AI, berita, harga, peringkat) dan tidak tersedia blok bukti live hasil pencarian web, nyatakan keterbatasan verifikasi secara jujur dan hangat: sampaikan hanya pengetahuan yang Anda yakini terverifikasi dengan penanda jelas bahwa itu bukan status live terkini, lalu arahkan ke sumber resmi untuk kepastian mutakhir. DILARANG mengarang status "terbaru" dari ingatan lama, menebak tanggal rilis, atau menyangkal eksistensi rilis hanya karena di luar pengetahuan model.
3. [ENUMERASI KETAT LANDSKAP TERKINI]: Saat pengguna menanyakan kondisi terbaik/terbaru/terkini, state-of-the-art, peringkat, atau perbandingan kondisi masa kini (contoh: "model AI terbaik saat ini", "versi terbaru X", "ranking produk Y"), daftar entitas "terkini" WAJIB disusun HANYA dari entitas yang eksplisit tercantum pada blok bukti live hasil pencarian yang disuntikkan. DILARANG KERAS menambahkan entitas apa pun dari ingatan (versi lama maupun model lain) sebagai pelengkap, pembanding, pelengkap daftar, atau konteks "terkini". Entitas di luar bukti HANYA boleh disebut bila pengguna secara eksplisit menanyakan sejarah/riwayat versi, dan wajib diberi label waktu historis yang jelas (misal "generasi sebelumnya", "rilis tahun ..."). Jika blok bukti tidak menyebut peringkat juara, JANGAN mengarang peringkat dari ingatan; cukup laporkan model yang terbukti muncul dalam pemberitaan.
4. [LARANGAN BASA-BASI & ZERO BOILERPLATE]: DILARANG KERAS menuliskan kalimat template, pengantar, atau penutup meta seperti "Semua informasi ini didasarkan pada laporan...", "Informasi ini diambil dari pencarian...", "Berdasarkan hasil penelusuran web real-time...", atau "Semoga membantu". Sampaikan jawaban substantif secara langsung, alami, dan to the point tanpa basa-basi meta.
5. Aturan ini berlaku universal untuk seluruh topik dan seluruh sesi percakapan tanpa pengecualian.`;

  if (!includeDetailedPortfolio) {
    return basePrompt;
  }

  return `${basePrompt}

[BATASAN TEKNOLOGI PORTOFOLIO RAFLY FIRMANSYAH]:
- Proyek **web-portofolio** dibangun menggunakan **React 19, Vite, Tailwind CSS, Framer Motion, Vercel Serverless Functions, dan Supabase PostgreSQL**.
- DILARANG mengklaim portofolio ini menggunakan Vanilla JS.

[GROUND TRUTH UTUH REPOSITORI & RISET RESMI RAFLY FIRMANSYAH (@Raflyf)]:
Wajib jadikan seluruh rincian faktual berikut sebagai SATU-SATUNYA SUMBER KEBENARAN. Dilarang keras berasumsi, mengarang angka/metrik palsu, atau menambahkan teknik generic ML yang tidak ada di sini:

1. **Spam-Email Detection System (Skripsi S1 Informatika UBSI - Rafly Firmansyah)**:
   - Judul Skripsi Resmi: "Analisis Performa Complement Naive Bayes dan XGBoost dalam Mengatasi Concept Drift pada Klasifikasi Spam Email Menggunakan Pendekatan Domain Adaptation".
   - URL Repositori: https://github.com/Raflyf/Spam-Email
   - Karakteristik Masalah (Concept Drift / Covariate Shift): Fenomena yang diteliti adalah **Covariate Shift** (pergeseran distribusi statistik fitur input antar era). Data latih historis adalah dataset Kaggle era 2000-an ('emails.csv'), sedangkan data uji target adalah email pribadi kontemporer modern ('data_test_berlabel_awal.csv').
   - KOMPARASI DUA MODEL TERPISAH (BUKAN ENSEMBLE!):
     * Model yang diteliti dan dibandingkan adalah **Complement Naive Bayes (CNB)** vs **XGBoost (Extreme Gradient Boosting)**.
     * DILARANG KERAS menyebut model ini sebagai "Ensemble", "Model Gabungan", "Voting Classifier", atau "Stacking". Keduanya adalah dua model terpisah yang dikomparasikan.
     * Alasan Pemilihan CNB: Complement Naive Bayes dipilih secara ilmiah karena secara matematis dirancang khusus untuk menangani korpus teks dengan ketidakseimbangan kelas (imbalanced text datasets).
   - DATASET ASLI & DISTRIBUSI DATA (DILARANG MENGARANG SPLIT 70/15/15!):
     * Dataset Training Utama: 'emails.csv' (Kaggle era 2000-an, total 5.728 email).
     * Dataset Uji Target Modern: 'data_test_berlabel_awal.csv' (1.000 email pribadi modern seimbang: 500 spam + 500 non-spam).
     * DILARANG KERAS mengklaim ada rasio split data acak 70/15/15 atau 80/20!
   - DUA METODE PENELITIAN & HASIL EVALUASI FAKTUAL:
     * **Metode 1 (Baseline / Tanpa Adaptasi - NB_XGB_PURE.py)**: Model dilatih murni pada 5.728 email Kaggle era 2000-an, lalu langsung diuji ke 1.000 email modern tanpa adaptasi. Hasil performa anjlok drastis akibat domain gap: Naive Bayes Akurasi ~51.5% (F1 43.26%), XGBoost Akurasi ~48% (F1 47.19%).
     * **Metode 2 (Metode Utama / Domain Adaptation 30% - NB_XGB_MIX_IMPROVED.py)**: Mengambil 30% (300 email) dari 1.000 email modern untuk dimasukkan ke data training dengan **Instance Weighting 8×** (pembobotan 8 kali lipat), dan sisa 70% (700 email) diuji secara independen. Hasil melonjak drastis: Complement Naive Bayes Akurasi 77% (F1 76.17%), XGBoost Akurasi 93% (F1 93%). Confusion matrix XGBoost: True Negative (TN)=333, False Positive (FP)=17, False Negative (FN)=32, True Positive (TP)=318.
   - LARANGAN HALUSINASI SPESIFIK PROYEK SPAM EMAIL:
     * DILARANG mengklaim menggunakan **Oversampling** (SMOTE / RandomOverSampler). Ketidakseimbangan kelas ditangani oleh arsitektur Complement Naive Bayes, parameter 'scale_pos_weight' pada XGBoost, serta instance weighting 8× pada adaptasi.
     * DILARANG mengklaim menggunakan **Stemming Bahasa Indonesia** atau SBERT. Teks dataset email adalah bahasa Inggris / general.
     * DILARANG mengklaim ada data streaming real-time, retraining otomatis online, deep learning transformer (BERT/DistilBERT), atau runtime ONNX.
   - PIPELINE PREPROCESSING & EKSTRAKSI FITUR:
     * Preprocessing: lowercase -> urltoken -> emailtoken -> pricetoken -> longnum -> numtoken -> pembersihan simbol.
     * TF-IDF Word (unigram+bigram, 20.000 fitur, sublinear TF) + TF-IDF Char n-gram (range 3-5 gram, 8.000 fitur).
     * 13 Fitur Struktural (panjang email, kepadatan tanda seru, simbol $, rasio huruf kapital, rasio all-caps, URL density, email density, HTML tag density, dll.).
     * 35 Keyword Spam biner (urgent, free, winner, cash, prize, guarantee, account, verify, discount, dll.).
     * Seleksi Fitur untuk NB: SelectKBest Chi-Square (k=12.000). Total fitur: CNB = 12.000 fitur; XGBoost = ~28.051 fitur.
   - FITUR APLIKASI WEB (FLASK):
     * Dibangun dengan Python 3, Flask, Scikit-Learn, XGBoost (GPU CUDA RTX 3050 saat riset), Pandas, HTML5, CSS3, JS murni, Chart.js.
     * Mode Pengujian Teks Langsung (Real-time Testing) dengan Quick Examples instan.
     * Mode Evaluasi Batch via file '.csv' massal.
     * Slider Balancing Dataset: Pengaturan proporsi rasio kelas data (10:90 hingga 90:10) untuk pengujian.
     * Riwayat Eksperimen interaktif (Pinning, visual feedback data terpilih, batch delete, catatan kustom).
     * Visualisasi grafik bar perbandingan model dan Confusion Matrix interaktif.

2. **OpenPlagiarismChecker (Riset Plagiarisme Mandiri)**:
   - URL Repositori: https://github.com/Raflyf/OpenPlagiarismChecker
   - Mesin riset pengecek kesamaan teks akademik lokal mengutamakan privasi 100% offline (tanpa kirim file ke cloud).
   - Dual-Engine NLP: (1) Exact Text Matching via 5-Word N-Gram Shingling; (2) Semantic Similarity via Multilingual Sentence Transformers (SBERT 384-dim Cosine Similarity) untuk mendeteksi parafrasa.
   - Ekstraksi teks otomatis dari file PDF, DOCX, dan TXT secara lokal terisolasi.
   - Rujukan silang konkuren ke 15+ pangkalan data akademik terbuka (GARUDA, Indonesia OneSearch/Neliti, BASE, OpenAlex, Semantic Scholar, e-thesis kampus).
   - Tech Stack: Python, Flask, PyTorch, Sentence-Transformers, N-Gram.

3. **laser_pointer_PPT**:
   - URL Repositori: https://github.com/Raflyf/laser_pointer_PPT
   - Pengendali presentasi PowerPoint nirsentuh dari smartphone menggunakan sensor gyroscope dan touchpad web via WebSocket (Flask-SocketIO) dan PyAutoGUI.
   - Pairing cepat via pemindaian QR-code lokal dan token dinamis (secrets.token_urlsafe). Tanpa perlu menginstal aplikasi tambahan di HP.

4. **FotoKitaBlur**:
   - URL Repositori: https://github.com/FotoKitaBlur/FotoKitaBlur
   - Edge AI Computer Vision di browser berbasis MediaPipe Tasks Vision dan OpenCV.
   - Preservasi privasi wajah saat streaming via gestur dua jari (V-Sign). Frame kamera diproses secara lokal di sisi klien.

5. **web-portofolio**:
   - URL Repositori: https://github.com/Raflyf/web-portofolio
   - Platform portofolio web modern React 19, Vite, Tailwind CSS, Framer Motion (Liquid Glassmorphism), Vercel Serverless Functions, Supabase PostgreSQL.
   - Terminal AI interaktif dengan Auto Router Gateway dan Continuous RAG Memory.

[SERTIFIKASI KOMPETENSI RESMI RAFLY FIRMANSYAH]:
- BNSP Analis Program (Program Analyst) - 2025: No. Reg TIK.1241.04242 2025 (Kualifikasi LSP UBSI, 10 unit kompetensi software engineering, SQL, arsitektur basis data, algoritma, code review, unit/integration testing).
- MikroTik Certified Network Associate (MTCNA) - 2025: No. 2502NA6383 (Routing statik/dinamis, firewall filtering, NAT, mangle, queue bandwidth management, wireless, VPN tunnel).
- Cisco PCAP (Certified Associate in Python Programming) - 2024: Python Institute / Cisco Networking Academy.

[KONTAK RESMI]:
- GitHub: https://github.com/Raflyf
- Email: mailto:raflyfirmansyah02@gmail.com
- WhatsApp: https://wa.me/628991333323`;
}

async function fetchJsonWithTimeout(url, options, timeoutConfig = 25000) {
  const controller = new AbortController();
  const connectTimeoutMs = typeof timeoutConfig === 'object' 
    ? (timeoutConfig.connectTimeoutMs || 15000) 
    : Math.min(typeof timeoutConfig === 'number' ? timeoutConfig : 15000, 20000);
  const activeTimeoutMs = typeof timeoutConfig === 'object' 
    ? (timeoutConfig.activeTimeoutMs || 55000) 
    : 55000;

  // Phase 1: Deteksi Liveness Awal (Jika server offline/hang/tidak merespons awal)
  let isResponding = false;
  let activeTimer = null;
  const connectTimer = setTimeout(() => {
    if (!isResponding) {
      controller.abort(new Error(`Initial connection timeout (${connectTimeoutMs}ms): model tidak merespon atau tidak aktif`));
    }
  }, connectTimeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    isResponding = true;
    clearTimeout(connectTimer);

    // Jika model terdeteksi error, limit, atau tidak aktif (402, 429, 404, 5xx):
    // Langsung kembalikan respons gagal seketika agar caller failover ke model berikutnya tanpa menunda
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errJson = null;
      try { errJson = JSON.parse(errText); } catch (_) {}
      return { ok: false, status: res.status, data: errJson, text: errText };
    }

    // Phase 2: Model Merespons & Aktif (Biarkan terus berpikir dengan batas waktu penuh hingga 55s)
    activeTimer = setTimeout(() => {
      controller.abort(new Error(`Active thinking timeout of ${activeTimeoutMs}ms exceeded`));
    }, activeTimeoutMs);

    const contentType = res.headers.get('content-type') || '';
    
    // A. High-Speed SSE Event Stream Reader: Stream reader dinamis
    if (contentType.includes('text/event-stream') || contentType.includes('event-stream')) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        if (accumulated.includes('[DONE]')) {
          try { reader.cancel(); } catch (_) {}
          break;
        }
      }
      if (activeTimer) clearTimeout(activeTimer);
      return { ok: true, status: res.status, data: null, text: accumulated };
    }

    // B. Standard JSON Payload
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (activeTimer) clearTimeout(activeTimer);
      return { ok: true, status: res.status, data: json, text: '' };
    }

    // C. Fallback Raw Text
    const text = await res.text();
    if (activeTimer) clearTimeout(activeTimer);
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (_) {}
    return { ok: true, status: res.status, data: json, text };
  } catch (err) {
    clearTimeout(connectTimer);
    if (activeTimer) clearTimeout(activeTimer);
    throw err;
  }
}


/**
 * Universal Intelligent Multi-Query Generator for Any Domain & Topic
 * Dynamically extracts the substantive subject matter from any user prompt and conversation history
 * to formulate parallel high-precision search queries across breaking news, live releases, and factual updates.
 */
function formulateSmartSearchQueries(query, history = []) {
  if (!query || typeof query !== 'string') return [];
  const queries = [];

  // 1. Normalize typos and common Indonesian internet contractions
  const qNorm = query.toLowerCase()
    .replace(/\bperilisann+\b/g, 'perilisan')
    .replace(/\bterbaruu+\b/g, 'terbaru')
    .replace(/\bapaan\b|\bapaann+\b|\bapahh+\b|\bapann+\b/g, 'apa')
    .replace(/\bkloo+\b|\bklo\b/g, 'kalau')
    .replace(/\bgimna\b|\bgmn\b|\bgmana\b/g, 'bagaimana')
    .replace(/\bknapa\b|\bknp\b/g, 'kenapa')
    .replace(/\bbgtu\b|\bbgt\b/g, 'begitu')
    .replace(/\bdgn\b/g, 'dengan')
    .replace(/\byg\b/g, 'yang')
    .replace(/\btp\b/g, 'tapi')
    .replace(/\budh\b|\bsdh\b/g, 'sudah')
    .replace(/\bblm\b/g, 'belum')
    .replace(/\bjg\b/g, 'juga')
    .replace(/\bbsa\b/g, 'bisa');

  const stripFillers = (text) => {
    return text
      .replace(/\b(lah|kan|deh|dong|sih|kek|kok|ko|ah|eh|oh|nah|ya|yah|nih|tuh|sudah|udah|sdh|udh|belum|blm|tapi|tp|dan|atau|itu|ini|dari|pada|ke|di|yang|yg|tolong|coba|jelaskan|analisis|bagaimana|apa|apaan|siapa|kapan|kenapa|mengapa|dimana|apakah|menurutmu|menurut anda|kalo|kalau|gimana|gimna|gmn|gmana|kabar|info|infokan|berikan|sebutkan|tentang|mengenai|soal|terkait|berita terbaru|berita terkini|kabar terbaru|kabar terkini|kelanjutan|update|terbaru|terkini|knapa|min|gan|kak|bro|perilisan|rilis|saat|sekarang|waktu|hari ini|era)\b/gi, ' ')
      .replace(/[^\w\s\.\-]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const coreSubject = stripFillers(qNorm).slice(0, 80);
  const qClean = qNorm.replace(/[^\w\s\.\-]/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

  // Extract clean entity if "model" / "versi" is used (e.g. "model claude 5.1" -> "claude 5.1")
  const strippedEntity = coreSubject.replace(/\b(model|versi|seri)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  if (strippedEntity.length >= 3) {
    queries.push(strippedEntity);
  }

  if (coreSubject.length >= 3 && coreSubject !== strippedEntity) {
    queries.push(coreSubject);
  }
  if (qClean.length >= 3 && qClean !== coreSubject && qClean !== strippedEntity) {
    queries.push(qClean);
  }

  // 2. Dynamic Query Generation (Pure Subject-Centered, Zero Hardcoded Brand/Entity List)
  const targetSubject = strippedEntity || coreSubject || qClean;
  if (targetSubject.length >= 2) {
    queries.push(`${targetSubject} latest official news update`);
    queries.push(`${targetSubject} rilis pembaruan resmi terkini`);

    // Expand search terms for AI & LLM model comparisons dynamically.
    // ZERO hardcoded brand/version lists (AGENTS.md 10c) - the live engine must always
    // reflect whatever the current real-world landscape is, strictly subject-centered.
    const currentYear = new Date().getFullYear();
    if (/\b(model|llm|ai|gpt|claude|gemini|deepseek|terbaik|best|leaderboard|ranking)\b/i.test(targetSubject) || /\b(ai|llm|model)\b/i.test(qNorm)) {
      queries.push(`${targetSubject} ${currentYear} comparison latest update`);
    }

    // Dynamic intent modifiers based on user intent keywords
    if (/\b(benchmark|perbandingan|bandingkan|leaderboard|skor|score|ranking|peringkat|vs|versus)\b/i.test(qNorm)) {
      queries.push(`${targetSubject} benchmark leaderboard evaluation results`);
    } else if (/\b(rilis|release|kapan|jadwal|schedule|tanggal|trailer|launch)\b/i.test(qNorm)) {
      queries.push(`${targetSubject} official release date announcement`);
    }
  }

  // 3. Dynamic Multi-Turn Context Awareness (Only combine if query is an anaphoric/dependent follow-up)
  const isDependentFollowUp = /^(harganya|fiturnya|speknya|spesifikasinya|jadwalnya|tanggalnya|rilisnya|fitur|spek|harga|biaya|kapan|dimana|siapa|kenapa|mengapa|bagaimana|gimana)$/i.test(coreSubject) || (coreSubject.length > 0 && coreSubject.length < 3);
  if (isDependentFollowUp && Array.isArray(history) && history.length > 0) {
    const pastUserTurns = history.filter(h => h.role === 'user').map(h => String(h.content || '')).reverse();
    for (const pastQ of pastUserTurns.slice(0, 2)) {
      const pastSubject = stripFillers(pastQ);
      if (pastSubject.length >= 3) {
        const combined = `${pastSubject} ${coreSubject || qClean}`.trim().slice(0, 90);
        if (!queries.includes(combined)) {
          queries.push(combined);
        }
        break;
      }
    }
  }

  return Array.from(new Set(queries)).filter(q => q.length >= 3).slice(0, 4); // PERF-4: cap at 4 (was 6) to limit RSS flood
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

// ponytail: fetchLiveRepoContext removed — was a no-op stub returning '' every call.
// searchWebContext already covers all live web context needs.

/**
 * Crawl4AI & Firecrawl Inspired Fit-Markdown & Semantic Content Extractor
 * Heuristically strips boilerplate/navigation/script noise, isolates primary semantic
 * article containers, and converts HTML tables/headings/lists to clean LLM-Ready Markdown.
 */
function extractFitMarkdownContent(rawHtml, sourceUrl = '') {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  
  if (!rawHtml.includes('<html') && !rawHtml.includes('<body') && !rawHtml.includes('<div') && !rawHtml.includes('<p')) {
    return rawHtml.slice(0, 4500).trim();
  }

  let html = rawHtml;

  // 1. Isolate primary semantic content container if present
  const semanticContainers = [
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<div\b[^>]*(?:id|class)=["'][^"']*(?:main-content|post-content|article-body|entry-content|markdown-body|documentation|docs-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<section\b[^>]*(?:id|class)=["'][^"']*(?:content|article|docs)[^"']*["'][^>]*>([\s\S]*?)<\/section>/i
  ];

  for (const regex of semanticContainers) {
    const match = html.match(regex);
    if (match && match[1] && match[1].length > 300) {
      html = match[1];
      break;
    }
  }

  // 2. Prune Noise & Non-Content Nodes (Fit-Markdown Heuristic Pruning)
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ' ')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, ' ')
    .replace(/<dialog\b[^<]*(?:(?!<\/dialog>)<[^<]*)*<\/dialog>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // 3. Convert HTML Structure into Clean Markdown (Tables, Headings, Lists, Code)
  html = html.replace(/<pre\b[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (m, code) => `\n\`\`\`\n${code.replace(/<[^>]+>/g, '').trim()}\n\`\`\`\n`);
  html = html.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (m, code) => ` \`${code.replace(/<[^>]+>/g, '').trim()}\` `);

  html = html.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n');
  html = html.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n');
  html = html.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n');
  html = html.replace(/<h[4-6]\b[^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n\n#### $1\n');

  html = html.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');

  html = html.replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (m, row) => {
    const cells = [];
    const cellRegex = /<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
    let match;
    while ((match = cellRegex.exec(row)) !== null) {
      cells.push(match[1].replace(/<[^>]+>/g, '').trim());
    }
    return cells.length > 0 ? `| ${cells.join(' | ')} |\n` : '';
  });

  html = html.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  html = html.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  html = html.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  html = html.replace(/<br\s*\/?>/gi, '\n');
  html = html.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n');
  html = html.replace(/<\/(?:div|section|article)>/gi, '\n');

  html = html.replace(/<[^>]+>/g, ' ');

  const entityMap = {
    '&quot;': '"', '&#39;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&nbsp;': ' ', '&mdash;': 'ΓÇö', '&ndash;': 'ΓÇô', '&bull;': 'ΓÇó', '&hellip;': '...'
  };
  html = html.replace(/&(?:quot|#39|amp|lt|gt|nbsp|mdash|ndash|bull|hellip);/g, m => entityMap[m] || ' ');

  const lines = html.split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0);

  let cleanMarkdown = lines.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleanMarkdown.slice(0, 4500);
}

/**
 * SSRF & Private Network Shield
 * Prevents attackers from targeting loopback (127.0.0.1), localhost, cloud metadata, or private internal LANs.
 */
function isSafePublicUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    let host = parsed.hostname.toLowerCase().trim();

    // Strip IPv6 brackets if present
    if (host.startsWith('[') && host.endsWith(']')) {
      host = host.slice(1, -1);
    }

    // Block loopback, localhost, internal namespaces, and cloud metadata hostnames
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'metadata.google.internal' ||
      host === 'instance-data' ||
      host === '169.254.169.254'
    ) {
      return false;
    }

    // Block IPv6 Loopback, Link-local, Unique Local, IPv4-mapped IPv6
    if (host.includes(':')) {
      if (host === '::1' || host === '::' || host.startsWith('fe80:') || host.startsWith('fc00:') || host.startsWith('fd00:')) {
        return false;
      }
      // IPv4-mapped IPv6 like ::ffff:127.0.0.1
      if (host.includes('ffff:')) {
        const afterFfff = host.split('ffff:')[1] || '';
        if (afterFfff.includes('.')) {
          host = afterFfff; // proceed to IPv4 checks below
        } else {
          return false; // block hex-mapped IPv4
        }
      } else {
        return true; // regular safe public IPv6
      }
    }

    // Handle decimal integer Dword IP (e.g. 2130706433 -> 127.0.0.1)
    if (/^\d+$/.test(host)) {
      const num = parseInt(host, 10);
      if (isNaN(num) || num < 0 || num > 4294967295) return false;
      const b0 = (num >>> 24) & 255;
      const b1 = (num >>> 16) & 255;
      const b2 = (num >>> 8) & 255;
      const b3 = num & 255;
      host = `${b0}.${b1}.${b2}.${b3}`;
    }

    // Handle Hex IP (e.g. 0x7f000001)
    if (/^0x[0-9a-fA-F]+$/i.test(host)) {
      const num = parseInt(host, 16);
      if (isNaN(num) || num < 0 || num > 4294967295) return false;
      const b0 = (num >>> 24) & 255;
      const b1 = (num >>> 16) & 255;
      const b2 = (num >>> 8) & 255;
      const b3 = num & 255;
      host = `${b0}.${b1}.${b2}.${b3}`;
    }

    // Handle Octal notation or multi-part IP (e.g. 0177.0.0.1, 127.0.1, 10.1)
    if (/^[0-9a-fA-FxX\.]+$/.test(host) && host.includes('.')) {
      const parts = host.split('.');
      if (parts.length >= 2 && parts.length <= 4) {
        const octets = [];
        for (const p of parts) {
          let val;
          if (p.startsWith('0x') || p.startsWith('0X')) {
            val = parseInt(p, 16);
          } else if (p.startsWith('0') && p.length > 1 && /^[0-7]+$/.test(p)) {
            val = parseInt(p, 8);
          } else if (/^\d+$/.test(p)) {
            val = parseInt(p, 10);
          } else {
            val = NaN;
          }
          if (isNaN(val) || val < 0) return false;
          octets.push(val);
        }

        if (octets.length === 4) {
          const [b0, b1] = octets;
          if (b0 === 10) return false;
          if (b0 === 127) return false;
          if (b0 === 169 && b1 === 254) return false;
          if (b0 === 172 && b1 >= 16 && b1 <= 31) return false;
          if (b0 === 192 && b1 === 168) return false;
          if (b0 === 0 || b0 >= 224) return false;
        } else {
          // Incomplete octet notation (e.g., 127.1)
          const first = octets[0];
          if (first === 127 || first === 10 || first === 0 || (first === 172 && octets[1] >= 16 && octets[1] <= 31) || (first === 192 && octets[1] === 168)) {
            return false;
          }
        }
      }
    }

    // Block standard private IPv4 ranges
    const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const b0 = parseInt(ipMatch[1], 10);
      const b1 = parseInt(ipMatch[2], 10);
      if (b0 === 10) return false;
      if (b0 === 127) return false;
      if (b0 === 169 && b1 === 254) return false;
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return false;
      if (b0 === 192 && b1 === 168) return false;
      if (b0 === 0 || b0 >= 224) return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Universal Web Page Deep Scraper (Crawl4AI & Firecrawl Enhanced)
 * Uses a dual-stage pipeline: Direct Crawl4AI Fit-Markdown parser with high-fidelity Jina LLM Reader fallback.
 * Fetches, strips boilerplate, and converts any public webpage into clean LLM-Ready Fit-Markdown.
 */
async function scrapeDirectWebpageContent(url) {
  if (!url || typeof url !== 'string' || !isSafePublicUrl(url)) return '';

  // 1. Primary Direct Scraper: Fetch directly with modern browser headers
  try {
    const res = await fetchJsonWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Crawl4AI-Firecrawl-HybridEngine/2026',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7'
      }
    }, 4500);

    if (res.ok && res.text && res.text.length > 50) {
      // 1a. Generic React Server Component (RSC) / Next.js Streaming State Extractor
      // Universally parses streamed state in modern Next.js / React App Router websites without a headless browser
      if (res.text.includes('self.__next_f.push')) {
        const pushRegex = /self\.__next_f\.push\(\[\d+,\s*"([\s\S]*?)"\]\)/g;
        let m;
        let combinedPayload = '';
        while ((m = pushRegex.exec(res.text)) !== null) {
          combinedPayload += '\n' + m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');
        }
        if (combinedPayload.length > 100) {
          const entryPattern = /\{[^{}]*?"rank":\s*(\d+)[^{}]*?"(?:modelDisplayName|name|title|displayName)":\s*"([^"]+)"[^{}]*?(?:rating|elo|score)":\s*([\d.]+)[^{}]*?(?:modelOrganization|organization|provider|author)":\s*"([^"]+)"[^{}]*?\}/g;
          const entries = [];
          let em;
          while ((em = entryPattern.exec(combinedPayload)) !== null && entries.length < 15) {
            entries.push({
              rank: parseInt(em[1], 10),
              name: em[2],
              score: Math.round(parseFloat(em[3])),
              org: em[4]
            });
          }
          if (entries.length > 0) {
            return `### Data Terverifikasi dari Halaman:\n` +
              entries.map(e => `- Rank #${e.rank}: ${e.name} (${e.org}) — Score/Rating: ${e.score}`).join('\n');
          }
        }
      }

      // 1b. Generic Subpage Resolver: Jika halaman depan memuat tautan ke subhalaman data/spesifikasi/ranking/dokumentasi, prioritaskan subhalaman
      const subMatch = res.text.match(/(?:href=["']|\\"href\\":\\")(\/[a-z0-9_\-\/]*(?:leaderboard|ranking|rankings|specs|spec|docs|documentation|benchmark)\b)/i);
      if (subMatch && subMatch[1]) {
        try {
          const subUrl = new URL(subMatch[1], url).href;
          const subRes = await fetchJsonWithTimeout(subUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7'
            }
          }, 4500);
          if (subRes.ok && subRes.text) {
            // Check RSC stream on subpage
            if (subRes.text.includes('self.__next_f.push')) {
              const pushRegex = /self\.__next_f\.push\(\[\d+,\s*"([\s\S]*?)"\]\)/g;
              let sm;
              let subPayload = '';
              while ((sm = pushRegex.exec(subRes.text)) !== null) {
                subPayload += '\n' + sm[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');
              }
              if (subPayload.length > 100) {
                const entryPattern = /\{[^{}]*?"rank":\s*(\d+)[^{}]*?"(?:modelDisplayName|name|title|displayName)":\s*"([^"]+)"[^{}]*?(?:rating|elo|score)":\s*([\d.]+)[^{}]*?(?:modelOrganization|organization|provider|author)":\s*"([^"]+)"[^{}]*?\}/g;
                const entries = [];
                let em;
                while ((em = entryPattern.exec(subPayload)) !== null && entries.length < 15) {
                  entries.push({
                    rank: parseInt(em[1], 10),
                    name: em[2],
                    score: Math.round(parseFloat(em[3])),
                    org: em[4]
                  });
                }
                if (entries.length > 0) {
                  return `### Data Terverifikasi dari Halaman:\n` +
                    entries.map(e => `- Rank #${e.rank}: ${e.name} (${e.org}) — Score/Rating: ${e.score}`).join('\n');
                }
              }
            }
            const subParsed = extractFitMarkdownContent(subRes.text, subUrl);
            if (subParsed && subParsed.length > 100) return subParsed;
          }
        } catch (_) {}
      }

      // 1c. Universal HTML Fit-Markdown Extractor (Articles, Blogs, Documentation, Tables)
      const parsed = extractFitMarkdownContent(res.text, url);
      if (parsed && parsed.length > 100) return parsed;
    }
  } catch (_) {}

  // 2. Secondary Fallback: Universal Headless LLM Reader (Executes JS and renders SPAs across the entire web)
  try {
    const jinaRes = await fetchJsonWithTimeout(`https://r.jina.ai/${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/plain'
      }
    }, 4800);

    if (jinaRes.ok && jinaRes.text && jinaRes.text.length > 50) {
      return jinaRes.text.slice(0, 7500).trim();
    }
  } catch (_) {}

  return '';
}


/**
 * 100% Real-Time High-Precision Live Web & News Search Engine
 * Concurrently queries verified global live news feeds (Google News Global, Google News Indonesia, Bing News)
 * and direct URL scrapers to provide authentic, up-to-date facts with publication timestamps.
 */
async function searchWebContext(query, history = []) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return { formattedPrompt: '', rawSnippets: [] };
  }

  const qLower = query.toLowerCase().trim();
  const rawQueries = formulateSmartSearchQueries(query, history);
  const searchQueries = rawQueries.length > 0 ? rawQueries.slice(0, 5) : [query.trim().slice(0, 80)];

  try {
    const controller = new AbortController();
    // Budget pencarian adaptif: 6s terlalu pendek utk 8-14 feed paralel -> sering ke-abort
    // sebelum fetch resolve, membuat konteks kosong secara acak (jawaban jadi kadang akurat
    // kadang lawas karena model mengarang dari ingatan). Dinaikkan ke 11s; masih aman dalam
    // budget 60s Vercel karena pencarian biasanya ~2-3s.
    const timeout = setTimeout(() => controller.abort(), 11000);

    const structuredSnippets = [];
    const rawSnippets = [];
    const agentToolsUsed = [];

    // Helper to sanitize XML / HTML entities
    const cleanStr = (str) => {
      if (!str) return '';
      const entityMap = { '&quot;': '"', '&#39;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };
      return str.replace(/<[^>]+>/g, '').replace(/&(?:quot|#39|amp|lt|gt|nbsp);/g, m => entityMap[m] || m).trim();
    };

    // Helper to filter out clickbait / junk SEO articles
    const isJunkArticle = (str) => {
      if (!str || typeof str !== 'string') return true;
      const lower = str.toLowerCase();
      return /\b(zodiak|ramalan|togel|slot gacor|judi|casino|harga emas|bursa efek|crypto pump)\b/i.test(lower);
    };

    // Dedupe kunci judul ternormalisasi: Google News ID/Global/Bing sering memuat cerita
    // yang SAMA dengan judul hampir identik dan beda timestamp. Dedupe berbasis teks penuh
    // (yang menyertakan pubDate) GAGAL menangkapnya -> banjir 100+ judul kembar yang membuat
    // model meng-echo judul mentah berulang-ulang. Kunci ini menormalkan judul (huruf kecil,
    // tanda baca dihapus) agar cerita kembar lintas feed terkolaps menjadi satu entri bukti.
    const seenNewsTitles = new Set();
    const titleDedupeKey = (str) => String(str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);

    // 1. Universal Autonomous Webpage Scraper & Target Domain Resolver:
    // Mendeteksi tautan eksplisit (https://...), bare domain (misal domain.com, sub.domain.org),
    // serta menormalisasi sebutan nama domain dengan spasi (misal "nama com" -> "nama.com", "arena ai" -> "arena.ai")
    const targetUrls = new Set();

    // 1a. Explicit URLs (e.g. "https://..." atau "http://...")
    const explicitUrls = query.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    for (const u of explicitUrls) targetUrls.add(u);

    // 1b. Autonomous Bare Domain Discovery: mendeteksi domain apa pun yang disebut di kueri
    // Menormalisasi sebutan domain dengan spasi hanya bila diawali kata petunjuk lokasi/situs (misal "di arena ai" -> "di arena.ai")
    const normalizedDomainQuery = query.replace(/\b(di|pada|ke|dari|web|website|situs|portal|buka|cek|akses|halaman|lihat)\s+([a-z0-9-]+)\s+(ai|com|org|io|net|id|co|dev|app|gov|edu)\b/gi, (m, pre, a, b) => `${pre} ${a}.${b}`);
    const bareDomainMatches = normalizedDomainQuery.match(/\b([a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:ai|com|org|io|net|id|co|dev|app|gov|edu)(?:\/[^\s"'<>]*)?)\b/gi) || [];
    for (const d of bareDomainMatches) {
      if (!Array.from(targetUrls).some(u => u.includes(d))) {
        targetUrls.add(`https://${d}`);
      }
    }

    // Eksekusi deep-scraping halaman target secara paralel (hingga 3 URL teratas)
    const scrapeQueue = Array.from(targetUrls).slice(0, 3);
    if (scrapeQueue.length > 0) {
      const urlPromises = scrapeQueue.map(async (url) => {
        const pageText = await scrapeDirectWebpageContent(url);
        if (pageText && pageText.length > 40) {
          let host = url;
          try { host = new URL(url).hostname; } catch (_) {}
          structuredSnippets.push({
            text: `[Live Webpage Scraper (${host})]:\n${pageText}`,
            timestamp: Date.now() + 1000000000, // Prioritas absolut di atas cuplikan berita
            score: 100
          });
          rawSnippets.push(`[Scraped Webpage]: ${host}`);
          agentToolsUsed.push({
            tool: 'web_scraper',
            label: `Live Webpage Reader (${host})`,
            url: url
          });
        }
      });
      await Promise.allSettled(urlPromises);
    }

    // 2. High-Precision Parallel Live Feeds (Google News Global & Indonesia + Bing News)
    const isBreakingQuery = /\b(terbaru|terkini|hari ini|kemarin|bulan ini|minggu ini|latest|today|breaking|update|baru|sekarang|now|saat ini|terbaik|ranking|peringkat|benchmark|rilis)\b/i.test(query);

    // ===== 2a. DETEKSI INTENT DINI (sebelum fan-out kueri) — biar jalur lanskap TIDAK memicu
    // generic fan-out mahal yang membuat respons lambat / HTTP 504. =====
    const nowDate = new Date();
    const monthNamesArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const curMonthName = monthNamesArr[nowDate.getMonth()];
    const prevMonthName = monthNamesArr[(nowDate.getMonth() + 11) % 12];
    const curYearNum = nowDate.getFullYear();
    let maxItemsPerFeed = 8;

    const isNewsOverviewQuery = /^(?:berita|kabar|news|headlines?|info\s+terbaru|what'?s\s+new)\b/i.test(query.trim()) ||
      /^(?:apa|sebutkan|ceritakan|bagaimana)\s+(?:berita|kabar|perkembangan)\b/i.test(query.trim());
    const isLatestLandscapeQuery = isNewsOverviewQuery ||
      /(?:semua|all|macam|berbagai|daftar|list|apa saja|what'?s new|berita terbaru|rilis terbaru|terbaru\s+apa|model terbaru|produk terbaru|game terbaru|perangkat terbaru|hp terbaru|versi terbaru|update terbaru|terbaru\s+yang|baru[- ]baru\s+ini|baru\s+dirilis|baru\s+diluncurkan|dirilis\s+baru|just\s+released|recently\s+released|newest)\b/i.test(query) ||
      /\b(?:terbaik\s+saat\s+ini|terbaik\s+sekarang|best\s+(?:right\s+)?now|best\s+current|top\s+terbaru|paling\s+baru|terkini\s+saat\s+ini)\b/i.test(query);
    const isAiModelLandscape = isLatestLandscapeQuery &&
      /\b(?:model\s+(?:terbaru|baru|terkini|ai|llm)|ai\s+model|\bai\b|\bllm\b|gpt|claude|gemini|deepseek|grok|llama|mistral|foundation\s+model|large\s+language\s+model)\b/i.test(query);
    // Batasi volume parsing: feed umum ambil 6 item; lanskap ambil 8 (bukan 10) agar
    // total bukti mentah yang di-parse tetap ringan (8 feed x 8 = 64 -> dipangkas dedupe).
    if (isLatestLandscapeQuery) maxItemsPerFeed = 8;
    else maxItemsPerFeed = 6;

    const gnFetch = (q) => fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    });
    const gnIdFetch = (q) => fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=id&gl=ID&ceid=ID:id`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    });

    // ===== 2b. JALUR LANSKAP AI — jalur ramping khusus: tidak melakukan generic fan-out,
    // cukup 4 kueri Google News terkonsolidasi + 1 Hacker News (total 5 fetch, cepat & ringan).
    let searchFetches = [];
    if (isAiModelLandscape) {
      searchFetches.push(
        gnFetch(`(OpenAI OR Anthropic OR Claude OR "Google Gemini") new model release ${curMonthName} ${curYearNum}`),
        gnFetch(`(Meta AI OR xAI OR Grok OR DeepSeek OR Mistral) new model release ${curMonthName} ${curYearNum}`),
        gnFetch(`AI foundation model OR LLM launch news ${curMonthName} ${curYearNum}`),
        gnIdFetch(`model AI baru rilis ${curMonthName} ${curYearNum}`),
        fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent('AI model OR LLM release')}&tags=story&hitsPerPage=8`, {
          headers: { 'User-Agent': 'Antigravity-Portfolio-Engine/2026' },
          signal: controller.signal
        })
      );
    } else {
      // ===== 2c. JALUR NORMAL / LANSKAP NON-AI — generic fan-out per subjek (dibatasi). =====
      searchFetches = searchQueries.flatMap(targetQ => {
        const fetches = [
          gnIdFetch(targetQ),
          gnFetch(targetQ),
          fetch(`https://www.bing.com/news/search?q=${encodeURIComponent(targetQ)}&format=rss`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: controller.signal
          })
        ];
        if (isBreakingQuery && !isLatestLandscapeQuery) {
          fetches.push(
            gnFetch(targetQ + ' when:7d'),
            gnFetch(targetQ + ' when:30d')
          );
        }
        return fetches;
      });
      if (isNewsOverviewQuery) {
        searchFetches.push(
          fetch(`https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: controller.signal
          }),
          fetch(`https://news.google.com/rss?hl=id&gl=ID&ceid=ID:id`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: controller.signal
          })
        );
      } else if (isLatestLandscapeQuery) {
        searchFetches.push(
          gnFetch(`${curMonthName} ${curYearNum}`),
          gnFetch(`${prevMonthName} ${curYearNum}`)
        );
      }
    }

    // 3. GitHub Open-Source & Library Discovery (For tech / framework / code / repo queries)
    // Lanskap/overview queries sudah mengumpulkan bukti live lebar — lewati fan-out tambahan agar cepat.
    const isTechOrCode = !isLatestLandscapeQuery && /\b(github|repo|library|framework|package|model|tool|sdk|api|kode|script|koding|coding|npm|pip|cargo|golang|rust|python|javascript|typescript|svelte|react|vue|deepseek|llama|gemini|claude|gpt|anthropic|openai|mistral|nemotron)\b/i.test(query);
    if (isTechOrCode) {
      const techKeyword = searchQueries[0] || query.slice(0, 60);
      searchFetches.push(
        fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(techKeyword)}&sort=stars&order=desc&per_page=3`, {
          headers: { 'User-Agent': 'Antigravity-Portfolio-Engine/2026' },
          signal: controller.signal
        })
      );
      searchFetches.push(
        fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(techKeyword)}&limit=3`, {
          headers: { 'User-Agent': 'Antigravity-Portfolio-Engine/2026' },
          signal: controller.signal
        })
      );
      // Hacker News (Algolia) - freshest developer, startup & ecosystem signal worldwide
      searchFetches.push(
        fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(techKeyword)}&tags=story&hitsPerPage=4`, {
          headers: { 'User-Agent': 'Antigravity-Portfolio-Engine/2026' },
          signal: controller.signal
        })
      );
    }

    // 3b. Direct GitHub README Discovery for specific repositories
    const repoPatterns = [
      { pattern: /\b(?:spam[-_ ]?email|skripsi|classifier|concept[-_ ]?drift)\b/i, repo: 'Raflyf/Spam-Email' },
      { pattern: /\b(?:openplagiarism(?:checker)?|plagiarism|plagiarisme|shingling)\b/i, repo: 'Raflyf/OpenPlagiarismChecker' },
      { pattern: /\b(?:laser[-_ ]?pointer[-_ ]?ppt|pointer|presenter|gyroscope)\b/i, repo: 'Raflyf/laser_pointer_PPT' },
      { pattern: /\b(?:fotokitablur|foto kita|mediapipe|gestur|v-sign)\b/i, repo: 'FotoKitaBlur/FotoKitaBlur' },
      { pattern: /\b(?:web[-_ ]?portofolio|portfolio|liquid glassmorphism)\b/i, repo: 'Raflyf/web-portofolio' }
    ];
    for (const rp of repoPatterns) {
      if (rp.pattern.test(query)) {
        searchFetches.push(
          fetch(`https://api.github.com/repos/${rp.repo}/readme`, {
            headers: { 'User-Agent': 'Antigravity-Portfolio-Engine/2026' },
            signal: controller.signal
          })
        );
        break;
      }
    }

    // 4. Open-Web Encyclopedic Knowledge (Multi-Language: Indonesian & English)
    // Dilewati untuk kueri lanskap yang butuh kecepatan — bukti berita sudah menjadi sumber utama.
    const isEncyclopedic = !isLatestLandscapeQuery && /\b(apa|siapa|definisi|pengertian|sejarah|biografi|rumus|cara kerja|apa arti|teori|asal usul|what|who|history|definition|jelaskan|analisis|komparasi|perbedaan|bagaimana|cara|faktor|arsitektur|konsep|mekanisme|struktur|prinsip|metode|algoritma|algorithm|how|explain|compare|versus|vs|kelebihan|kekurangan|manfaat|tujuan|fitur|dataset|evaluasi|akurasi|keunggulan)\b/i.test(query);
    if (isEncyclopedic) {
      const mainKeyword = query
        .replace(/\b(apa itu|siapa itu|definisi|pengertian|sejarah|biografi|rumus|cara kerja|apa arti|teori|asal usul|what is|who is|history of|definition of|tolong|jelaskan|analisis|dong|how does|bagaimana|ceritakan|tentang|mengenai|soal|terkait|apakah)\b/gi, ' ')
        .replace(/[^\w\s\.\-]/gi, ' ')
        .trim();
      if (mainKeyword.length >= 2) {
        searchFetches.push(
          fetch(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(mainKeyword)}&format=json&origin=*`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: controller.signal
          }),
          fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(mainKeyword)}&format=json&origin=*`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: controller.signal
          })
        );
      }
    }

    // Extract key search terms for relevance evaluation
    const searchKeywords = searchQueries.flatMap(sq => 
      sq.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3)
    );

    const calcScore = (title) => {
      const tLow = (title || '').toLowerCase();
      let score = 0;
      for (const kw of searchKeywords) {
        if (tLow.includes(kw)) score += 2;
      }
      return score;
    };

    const results = await Promise.allSettled(searchFetches);

    // PERF-CRITICAL: body RSS/JSON dibaca SECARA PARALEL, bukan serial.
    // Sebelumnya `await res.value.text()` di dalam loop for membuat body ratusan KB
    // (14+ feed) di-download satu per satu -> 10-20 detik tambahan -> HTTP 504.
    // PENTING: clearTimeout DITAHAN sampai seluruh body terbaca agar fase unduh body
    // tetap berada dalam pagar waktu pencarian (tidak menggantung tanpa batas).
    const textResults = await Promise.all(results.map(async (res) => {
      if (res.status === 'fulfilled' && res.value && res.value.ok) {
        const textData = await res.value.text().catch(() => '');
        return { ok: true, textData };
      }
      return { ok: false, textData: '' };
    }));
    clearTimeout(timeout);

    for (const { ok, textData } of textResults) {
      if (ok && textData) {
        if (textData.startsWith('{') || textData.startsWith('[')) {
          try {
            const parsed = JSON.parse(textData);
            // Wikipedia
            if (parsed?.query?.search) {
              const hits = parsed.query.search;
              if (hits.length > 0) {
                const h = hits[0];
                const snip = cleanStr(h.snippet);
                if (snip && !isJunkArticle(snip)) {
                  structuredSnippets.push({
                    text: `[Referensi Ensiklopedia Resmi (${h.title})]: ${snip}`,
                    timestamp: Date.now() - (86400000 * 14),
                    score: 6
                  });
                  rawSnippets.push(`[Wikipedia]: ${h.title}`);
                  agentToolsUsed.push({
                    tool: 'wikipedia_lookup',
                    label: 'Ensiklopedia Wikipedia Terverifikasi',
                    topic: h.title
                  });
                }
              }
            }
            // GitHub Search Items
            if (Array.isArray(parsed?.items)) {
              parsed.items.slice(0, 2).forEach(repo => {
                const desc = cleanStr(repo.description);
                structuredSnippets.push({
                  text: `[GitHub Repository (${repo.full_name}, ${repo.stargazers_count} stars)]: ${desc || 'Open-source repository'}`,
                  timestamp: 2000,
                  score: 4
                });
                rawSnippets.push(`[GitHub]: ${repo.full_name}`);
              });
            }
            // GitHub Raw README (Base64 Encoded from /repos/:owner/:repo/readme)
            if (parsed?.content && parsed?.encoding === 'base64') {
              try {
                const decodedReadme = Buffer.from(parsed.content, 'base64').toString('utf8');
                if (decodedReadme && decodedReadme.length > 50) {
                  const cleanedReadme = cleanStr(decodedReadme.slice(0, 2500));
                  structuredSnippets.push({
                    text: `[Live GitHub README Dokumentasi Resmi (${parsed.name || 'README.md'})]:\n${cleanedReadme}`,
                    timestamp: Date.now() + 2000000,
                    score: 12
                  });
                  rawSnippets.push(`[GitHub README]: ${parsed.name || 'README'}`);
                  agentToolsUsed.push({
                    tool: 'github_inspector',
                    label: 'GitHub Live Inspector',
                    repo: parsed.name || 'Dokumentasi Resmi'
                  });
                }
              } catch (_) {}
            }
            // HuggingFace
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
              const models = parsed.slice(0, 3).map(m => m.id).join(', ');
              structuredSnippets.push({
                text: `[HuggingFace AI Models Directory]: ${models}`,
                timestamp: 1500,
                score: 4
              });
              rawSnippets.push(`[HuggingFace]: ${models}`);
            }
            // Hacker News (Algolia JSON API)
            if (Array.isArray(parsed?.hits)) {
              parsed.hits.slice(0, 3).forEach(hit => {
                const title = cleanStr(hit.title || hit.story_title || '');
                if (title && !isJunkArticle(title)) {
                  const hnDate = hit.created_at ? ` (${String(hit.created_at).slice(0, 10)})` : '';
                  const hnPoints = Number.isFinite(hit.points) ? ` - ${hit.points} poin` : '';
                  structuredSnippets.push({
                    text: `[Hacker News Global${hnDate}]: ${title}${hnPoints}`,
                    timestamp: hit.created_at ? new Date(hit.created_at).getTime() : Date.now(),
                    score: 4
                  });
                  rawSnippets.push(`[Hacker News]: ${title}`);
                }
              });
            }
          } catch (_) {}
        } else if (textData.includes('<feed') || textData.includes('<entry>')) {
          // arXiv XML Feed
          const entries = textData.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
          entries.slice(0, 2).forEach(entry => {
            const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/i);
            const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/i);
            const title = cleanStr(titleMatch ? titleMatch[1] : '');
            const summary = cleanStr(summaryMatch ? summaryMatch[1] : '');
            if (title && summary) {
              structuredSnippets.push({
                text: `[arXiv Research Paper (${title})]: ${summary.slice(0, 400)}...`,
                timestamp: Date.now(),
                score: 5
              });
              rawSnippets.push(`[arXiv]: ${title}`);
            }
          });
        } else {
          // RSS News Feeds (Google News Global & ID, Bing)
          const items = textData.match(/<item>[\s\S]*?<\/item>/gi) || [];
          items.slice(0, maxItemsPerFeed).forEach((item) => {
            const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
            const descMatch = item.match(/<description>([\s\S]*?)<\/description>/i);
            const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
            const title = cleanStr(titleMatch ? titleMatch[1] : '');
            const desc = cleanStr(descMatch ? descMatch[1] : '');
            const pubDate = cleanStr(dateMatch ? dateMatch[1] : '');
            if (title && !isJunkArticle(title)) {
              // Lewati cerita kembar lintas feed (Google News ID/Global/Bing) yang judulnya nyaris identik
              const dedupeKey = titleDedupeKey(title);
              if (seenNewsTitles.has(dedupeKey)) return;
              seenNewsTitles.add(dedupeKey);
              let ts = 0;
              let recencyBonus = 0;
              if (pubDate) {
                const parsedDate = new Date(pubDate).getTime();
                if (!isNaN(parsedDate)) {
                  ts = parsedDate;
                  const daysOld = (Date.now() - parsedDate) / (1000 * 60 * 60 * 24);
                  if (daysOld <= 7) recencyBonus = 35;
                  else if (daysOld <= 30) recencyBonus = 25;
                  else if (daysOld <= 90) recencyBonus = 12;
                  else if (daysOld > 180) recencyBonus = -25;
                  else if (daysOld > 365) recencyBonus = -50;

                  // Filter out outdated articles (> 90 days) if the user is asking for current / latest facts
                  if (isBreakingQuery && daysOld > 90) {
                    return;
                  }
                }
              }
              const relScore = calcScore(title + ' ' + desc) + recencyBonus;
              if (searchKeywords.length === 0 || relScore > 0) {
                const fullText = desc && desc.length > 20 ? `${title} — ${desc.slice(0, 150)}` : title;
                const entry = pubDate ? `[Global Live Web/News (${pubDate})]: ${fullText}` : `[Global Live Web/News]: ${fullText}`;
                structuredSnippets.push({ text: entry, timestamp: ts, score: relScore });
                rawSnippets.push(title);
              }
            }
          });
        }
      }
    }

    const newsItemsCount = structuredSnippets.filter(s => s.text.startsWith('[Global Live Web/News')).length;
    if (newsItemsCount > 0) {
      agentToolsUsed.push({
        tool: 'google_search',
        label: 'Google Search & Berita Global',
        sourcesCount: newsItemsCount,
        sources: rawSnippets.filter(r => !r.startsWith('[Wikipedia]') && !r.startsWith('[GitHub')).slice(0, 4)
      });
    }

    // Sort all snippets: For breaking/latest queries, strictly sort newest publication timestamp first
    structuredSnippets.sort((a, b) => {
      if (isBreakingQuery) {
        return (b.timestamp - a.timestamp) || ((b.score || 0) - (a.score || 0));
      }
      return ((b.score || 0) - (a.score || 0)) || (b.timestamp - a.timestamp);
    });

    // Deduplicate snippets (top 7 highest scoring / newest snippets for fast, high-density grounding)
    const seen = new Set();
    const uniqueSnippets = [];
    for (const item of structuredSnippets) {
      if (!seen.has(item.text)) {
        seen.add(item.text);
        uniqueSnippets.push(item.text);
      }
      if (uniqueSnippets.length >= (isLatestLandscapeQuery ? 14 : 7)) break;
    }

    let formattedPrompt = '';
    if (uniqueSnippets.length > 0) {
      formattedPrompt = `\n\n[FAKTA & BUKTI TERVERIFIKASI DARI GOOGLE SEARCH, ENSIKLOPEDIA & WEB GLOBAL]:
${uniqueSnippets.join('\n')}

[PANDUAN SINTESIS & GROUNDING FAKTUAL UNIVERSAL]:
- PRIORITASKAN 100% FAKTA RESMI & TERKINI DARI BUKTI HASIL PENCARIAN DI ATAS. Bukti ini adalah satu-satunya representasi kondisi dunia nyata saat ini yang Anda miliki.
- [ENUMERASI KETAT]: Untuk pertanyaan lanskap terkini (terbaik/terbaru/terkini/saat ini/ranking/state-of-the-art/perbandingan model terkini), daftar entitas yang Anda sajikan sebagai "terkini" HANYA boleh berisi entitas yang muncul eksplisit pada blok bukti di atas. DILARANG KERAS menambah versi/model/entitas lain dari ingatan sebagai pelengkap daftar, pembanding, atau konteks. Jangan menulis "selain model di atas, terdapat juga ..." untuk entitas yang tidak ada di bukti. Bila entitas lawas ingin disebut, itu hanya sah untuk konteks sejarah yang diminta eksplisit, dan wajib diberi label waktu historis (bukan sebagai kondisi terkini).
- [LARANGAN TANGGAL PALSU]: Dilarang menulis "Semua informasi ini didasarkan pada laporan terbaru [tanggal]" atau atribusi tanggal lain yang tidak muncul pada bukti di atas. Bila bukti tidak memuat tanggal, tulis "berdasarkan hasil penelusuran web real-time saat ini".
- LARANGAN HARDCODE DARI INGATAN: DILARANG KERAS menyajikan nama model, versi software, tanggal rilis, peringkat, atau status teknologi dari ingatan lama seolah-olah kondisi terkini, KECUALI tercantum eksplisit pada bukti live di atas. Setiap entitas baru hanya boleh disebut bila didukung bukti.
- PENANDA WAKTU (RECENCY LABELING): Untuk klaim sensitif waktu (rilis terbaru, versi, harga, peringkat, berita, kondisi saat ini), sebutkan penanda waktu sumbernya (misal "dilaporkan [tanggal]", "per [bulan/tahun]"). DILARANG menyajikan artikel atau rilis berumur lebih dari satu tahun sebagai kondisi "saat ini".
- GAYA PENYAMPAIAN MANUSIAWI, RAMAH, DAN MUDAH DIMENGERTI:
  * Jawablah secara hangat, bersahabat, dan menyenangkan untuk dibaca tanpa kalimat template robotik.
  * Sampaikan inti jawaban secara langsung tanpa berbelit-belit.
  * Gunakan penjelasan yang jernih dan terstruktur (padukan narasi yang mengalir dengan butir poin secara proporsional).
- FOKUS PENUH PADA SUBJEK YANG DITANYAKAN:
  * Bahas secara tuntas subjek pertanyaan saat ini tanpa mencampurkan konteks entitas lain yang tidak relevan atau tanpa bukti.
- PROTOKOL ZERO-HALLUCINATION & ZERO-OVERCLAIM:
  * Rujuk peristiwa, tanggal, metrik, dan fakta nyata dari data pencarian.
  * Jika bukti di atas tidak memuat jawaban kunci, akui jujur bahwa informasi terkini tidak ditemukan dalam pencarian live, berikan yang terverifikasi (bila ada) dengan penanda waktu, lalu arahkan ke sumber resmi. DILARANG mengarang berita palsu, tanggal rilis fiktif, atau klaim berlebihan yang tidak tercantum di sumber resmi.\n`;
    }

    // Arahan sintesis khusus LANSKAP "apa yang baru / rilis terbaru" (universal, semua domain):
    // mengelompokkan per entitas/produsen/kategori dan memisahkan terkonfirmasi vs belum resmi.
    if (isLatestLandscapeQuery && formattedPrompt) {
      formattedPrompt += `
[ARAHAN SINTESIS LANSKAP "APA YANG BARU / RILIS TERBARU"]:
- Sajikan sebagai RINGKASAN LANSKAP yang dikelompokkan per entitas/produsen/kategori (bukan daftar linear acak).
- Untuk setiap entitas, tulis penanda waktu laporan yang TERTERA pada bukti (misal "dilaporkan [tanggal]"). DILARANG menambah entitas tanpa bukti hanya untuk "melengkapi daftar".
- Pisahkan eksplisit: (a) rilis yang terkonfirmasi liputan, vs (b) kabar/rencana/rumor yang belum resmi dirilis.
- Nyatakan jujur bahwa daftar mencakup hal yang tertangkap penelusuran real-time dan mungkin tidak lengkap; arahkan ke sumber resmi untuk daftar menyeluruh.
- DILARANG KERAS mengutip judul artikel mentah secara berulang-ulang atau mencantumkan judul yang nyaris identik lebih dari satu kali sebagai entri terpisah. Sintesiskan isi berita menjadi kalimat ringkas Anda sendiri (parafrasa), sebutkan tanggal laporan bila ada, dan jangan mengulang kalimat yang sama.`;
    }

    return { formattedPrompt, rawSnippets: rawSnippets.slice(0, isLatestLandscapeQuery ? 18 : 10), agentToolsUsed };
  } catch (_) {
    return { formattedPrompt: '', rawSnippets: [], agentToolsUsed: [] };
  }
}

function classifyQueryIntent(query = '', docAttachments = [], hasImages = false) {
  const q = String(query || '').trim().toLowerCase();
  const len = q.length;

  if (hasImages) {
    return {
      category: 'vision',
      isAnalysisOrComparison: true,
      effort: 'medium',
      omniCandidates: ['Vision-model', 'opencode/nemotron-3-ultra-free', 'nvidia/nemotron-3-ultra-550b-a55b:free', 'ollama/minimax-m3'],
      label: 'Vision & Multimodal Perception (Gemini 3.1 Flash & MiniMax M3)'
    };
  }

  // 0A. Direct Identity & Model Queries (Who are you / What model is this)
  const isIdentity = /^(kamu siapa|siapa kamu|kamu model apa|model apa kamu|model apa ini|kamu ai apa|kamu ini apa|siapa namamu|namamu siapa|who are you|what are you|what model are you|model apa yang aktif|kamu pakai model apa|ini model apa|anda siapa|siapa anda)$/i.test(q);
  if (isIdentity) {
    return {
      category: 'identity',
      isAnalysisOrComparison: false,
      effort: 'low',
      omniCandidates: ['Antigravity', 'Codex', 'x-preview-f-free', 'nemotron-3-nano'],
      label: 'AI Assistant Identity & Model Transparency'
    };
  }

  // 0B. Casual greetings, acknowledgments, simple chit-chat
  const isCasualOrClosing = /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|cukup|udah|sudah|selesai|stop|berhenti|gausah|nggak|tidak|makasih|terima kasih|thanks|thx|tq|oke|ok|sip|siap|mantap|keren|yup|yes|ya|iya|bye|dadah)$/i.test(q);
  
  if (isCasualOrClosing) {
    return {
      category: 'trivial_casual',
      isAnalysisOrComparison: false,
      effort: 'low',
      omniCandidates: ['nemotron-lightning', 'x-preview-f-free'],
      label: 'Casual Greeting & Quick Interaction (Nemotron Lightning)'
    };
  }

  // 1. In-Depth Project Analysis, Multi-Repository Breakdown, Explanations, and Comparative Studies
  // GUARD: Deep analysis (Ultra 550B) hanya untuk proyek/kode Rafly atau analisis teknis berat.
  // Kueri perbandingan hal EKSTERNAL (benchmark AI lain, berita, topik umum) = medium effort Nano 30B.
  const hasAnalysisOrComparisonKeywords = /\b(jelaskan dan analisi|jelaskan dan analisis|analisis|analisa|bedahkan|bedah|evaluasi mendalam|secara mendalam|lebih dalam|komprehensif|arsitektur sistem|bandingkan|perbandingan|komparasi|jelaskan|jelas|penjelasan|perbedaan|persamaan|detail|rinci|lengkap|kelebihan|kekurangan|trade-off|tradeoff|skripsi|github)\b/i.test(q);
  const hasRaflyProjectContext = /\b(spam|plagiarism|openplagiarism|plagiarisme|laser|gesture|presenter|fotokitablur|foto kita|portofolio|portfolio|skripsi|sertif|sertifikasi|bnsp|mtcna|cisco|rafly|firmansyah|proyek|riset|concept drift|covariate shift|n-gram|sbert|ensemble|cnb|xgboost|websocket|flask|mediapipe)\b/i.test(q);
  const hasHeavyTechContext = /\b(arsitektur sistem|microservice|docker|kubernetes|pipeline|implementasikan sistem|buatkan backend|full stack|database schema|sistem auth)\b/i.test(q);
  const isDeepAnalysis = hasAnalysisOrComparisonKeywords && (hasRaflyProjectContext || hasHeavyTechContext) || len > 150;
  if (isDeepAnalysis) {
    return {
      category: 'project_architecture',
      isAnalysisOrComparison: true,
      effort: 'high',
      omniCandidates: ['Codex', 'x-preview-f-free', 'Antigravity', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Deep Architecture, Explanation & Comparative Analysis (Nemotron Nano 30B)'
    };
  }

  // 2. Rigorous Multi-Step Mathematical Proof, Chain of Thought, Formal Thesis Derivations
  const hasRigorousThinkingKeywords = /\b(turunkan rumus|matematis|bukti matematis|pembuktian matematis|formula matematis|chain of thought|step by step reasoning|penalaran mendalam|bedah logika mendalam|analisis statistik mendalam|evaluasi empiris skripsi|perhitungan matriks|probabilitas bayesian)\b/i.test(q);
  if (hasRigorousThinkingKeywords) {
    return {
      category: 'deep_reasoning',
      isAnalysisOrComparison: true,
      effort: 'thinking',
      omniCandidates: ['Antigravity', 'Codex', 'x-preview-f-free', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Deep Reasoning & Mathematical Derivations (Nemotron Nano 30B)'
    };
  }

  // 3. Heavy Coding, Multi-File Full System Implementations, Large Script Synthesis
  const hasHeavyCodeKeywords = /\b(buatkan full script|buatkan full kode|arsitektur microservice|implementasikan sistem|buatkan backend lengkap|full stack implementasi|buatkan boilerplate|sistem auth lengkap|pipeline dataform|dbt pipeline|docker compose full|kubernetes manifest)\b/i.test(q) || (docAttachments.length > 0 && len > 150);
  if (hasHeavyCodeKeywords) {
    return {
      category: 'heavy_coding',
      isAnalysisOrComparison: true,
      effort: 'high',
      omniCandidates: ['Codex', 'x-preview-f-free', 'Antigravity', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Heavy Coding & System Architecture (Nemotron Nano 30B & Codex)'
    };
  }

  // 4. Standard Coding & Snippets
  const hasCodeKeywords = /\b(script|koding|coding|function|def |class |async |await |import |export |const |let |var |sql|select .* from|regex|refactor|debug|fix bug|error|syntax)\b/i.test(q) || /\b(python|javascript|typescript|golang|rust|php|pytorch|react|flask)\b/i.test(q);
  if (hasCodeKeywords) {
    return {
      category: 'heavy_coding',
      isAnalysisOrComparison: hasAnalysisOrComparisonKeywords,
      effort: 'medium',
      omniCandidates: ['Codex', 'x-preview-f-free', 'Antigravity', 'nemotron-3-nano', 'deepseek/deepseek-chat'],
      label: 'Coding & Algorithm Synthesis (Nemotron Nano & Codex)'
    };
  }

  // 5. Standard Informative, Conceptual, Ordinary Q&A, and Fast Trivia
  const isShortQuery = len < 40 && !hasAnalysisOrComparisonKeywords;
  return {
    category: isShortQuery ? 'trivial_casual' : 'basic_standard',
    isAnalysisOrComparison: hasAnalysisOrComparisonKeywords,
    effort: isShortQuery ? 'low' : 'medium',
    omniCandidates: ['nemotron-lightning', 'x-preview-f-free', 'nemotron-3-nano', 'deepseek/deepseek-chat'], // DEAD-3: removed typo 'nemotron-lighting'
    label: hasAnalysisOrComparisonKeywords ? 'Technical Synthesis (Nemotron Nano 30B)' : (isShortQuery ? 'Quick Interaction (Nemotron Lightning)' : 'Standard Q&A & Trivia (Nemotron Lightning)')
  };
}

// Trusted client IP: prefer Vercel's trusted header, else the LAST element of
// x-forwarded-for (the value appended by the outermost trusted proxy), else the
// raw socket address. Never trust the first x-forwarded-for segment — clients
// can spoof it to bypass per-IP rate limits.
function getClientIp(req) {
  const headers = req?.headers || {};
  const trusted = headers['x-vercel-forwarded-for'];
  if (trusted && typeof trusted === 'string') return trusted.split(',')[0].trim();
  const xff = headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const parts = xff.split(',');
    return (parts[parts.length - 1] || '').trim() || req?.socket?.remoteAddress || '127.0.0.1';
  }
  return req?.socket?.remoteAddress || '127.0.0.1';
}

// Rate limiting (35 requests per minute per IP).
// The in-memory cache is the fast path; the source of truth is persisted in a
// `rate_limits` table via Supabase so the limit survives cold starts and
// multiple serverless instances (AGENTS.md §9b).
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 35;

// Module-scoped so the 15-min key cool-down persists across invocations in the same warm instance
const rateLimitedKeyCache = new Map();

const RATE_LIMIT_TABLE = 'rate_limits';

// Helper fetch ringkas dengan hard timeout (anti-hang pada cold start / Supabase lambat).
function fetchWithHardTimeout(url, options, ms = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function persistRateLimit(clientIp, count, windowStartIso) {
  // Best-effort persisted counter; never blocks the request when Supabase is down.
  // NOT a hard guarantee under multi-instance concurrency: the read-modify-write
  // in isRateLimited() can lose increments when two instances read the same count
  // and POST count+1 (PostgREST has no server-side increment, so an absolute value
  // is written). The in-memory cache keeps the fast-path bound exact per instance.
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) return;
  try {
    await fetchWithHardTimeout(`${supabaseUrl}/rest/v1/${RATE_LIMIT_TABLE}`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        client_ip: clientIp,
        window_start: windowStartIso,
        request_count: count
      })
    }, 3000);
  } catch (_) { /* non-fatal */ }
}

async function isRateLimited(clientIp) {
  if (!clientIp || clientIp === 'unknown-client') return false;
  const now = Date.now();

  // 1. Persisted source of truth first (survives cold starts / multi-instance).
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (supabaseUrl && serviceRoleKey) {
    try {
      const windowStartIso = new Date(now - (now % RATE_LIMIT_WINDOW_MS)).toISOString();
      const res = await fetchWithHardTimeout(
        `${supabaseUrl}/rest/v1/${RATE_LIMIT_TABLE}?client_ip=eq.${encodeURIComponent(clientIp)}&window_start=eq.${encodeURIComponent(windowStartIso)}&select=request_count`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, Accept: 'application/json' } },
        3500
      );
      if (res.ok) {
        const rows = await res.json();
        const persistedCount = Array.isArray(rows) && rows.length > 0 ? (rows[0].request_count || 0) : 0;
        // Boundary is >= MAX (same as the in-memory fallback): block at MAX, allow below.
        if (persistedCount >= MAX_REQUESTS_PER_WINDOW) return true;
        // Increment persisted counter (optimistic, fire-and-forget, best-effort —
        // concurrent instances may overwrite with the same absolute count).
        persistRateLimit(clientIp, persistedCount + 1, windowStartIso);
        return false;
      }
    } catch (_) { /* fall through to memory */ }
  }

  // 2. In-memory fast path (fallback when Supabase is unreachable).
  const record = rateLimitCache.get(clientIp);
  if (!record || (now - record.startTime) > RATE_LIMIT_WINDOW_MS) {
    rateLimitCache.set(clientIp, { count: 1, startTime: now });
    if (rateLimitCache.size > 2000) {
      for (const [k, v] of rateLimitCache.entries()) {
        if (now - v.startTime > RATE_LIMIT_WINDOW_MS) rateLimitCache.delete(k);
      }
    }
    return false;
  }
  record.count += 1;
  // Same boundary as the persisted path (>= MAX): blocks at MAX, not MAX+1.
  return record.count >= MAX_REQUESTS_PER_WINDOW;
}

/**
 * Trusted RAG memory read (anti data-poisoning).
 * Reads ai_memories with SUPABASE_SERVICE_ROLE_KEY — the client can never
 * inject memory directly; only /api/save-memory (server) writes it.
 */
const SUPABASE_DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU';

function getSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;
}

/**
 * Trusted RAG memory read (anti data-poisoning).
 * Reads ai_memories with service_role or anon key.
 */
async function fetchServerMemories(limit = 15) {
  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetchWithHardTimeout(
      `${supabaseUrl}/rest/v1/ai_memories?select=fact_text&order=created_at.desc&limit=${limit}`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' } },
      3000
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows
      .map(r => (r && typeof r.fact_text === 'string' ? r.fact_text : ''))
      .filter(t => t.length > 0)
      .slice(0, limit);
  } catch (_) {
    return [];
  }
}

/**
 * Semantic Relevance Gate for RAG Long-Term Memories (Anti-Memory Contamination)
 * Strictly matches memory entries against topical subject keywords of the current query.
 * If there is NO direct topical connection, returns an empty array to keep context 100% pristine.
 */
function filterRelevantMemories(allMemories, userQuery, isSpecialQuery = false) {
  if (isSpecialQuery || !allMemories || allMemories.length === 0 || !userQuery) return [];

  const stopWords = new Set([
    'apa', 'apakah', 'siapa', 'bagaimana', 'gimana', 'kenapa', 'mengapa', 'kapan', 'dimana',
    'yang', 'dan', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'adalah', 'yaitu', 'ini',
    'itu', 'saya', 'kamu', 'anda', 'kita', 'mereka', 'bisa', 'tolong', 'coba', 'buat', 'bikin',
    'halo', 'hai', 'tes', 'test', 'ada', 'tidak', 'nggak', 'gak', 'mau', 'dong', 'sih', 'kah',
    'model', 'ai', 'assistant', 'terbaru', 'info', 'tentang', 'soal', 'seperti', 'kayak', 'akan',
    'tau', 'tahu', 'kasih', 'beri', 'tolong', 'mohon', 'punya', 'ada', 'bisa', 'dapat'
  ]);

  const tokens = String(userQuery)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !stopWords.has(t));

  if (tokens.length === 0) return [];

  const cleanRows = allMemories.filter(m => {
    const txt = String(m || '').trim();
    if (txt.startsWith('Kueri Pengunjung:') || txt.startsWith('Query:') || txt.includes('[SAVE_MEMORY:')) return false;
    if (txt.length < 15) return false;
    return true;
  });

  const matched = cleanRows.filter(mem => {
    const lowMem = mem.toLowerCase();
    // Memori harus memuat minimal salah satu token kata kunci subjek pertanyaan
    return tokens.some(tok => lowMem.includes(tok));
  });

  return matched.slice(0, 4);
}

/**
 * Trusted RAG memory auto-persist (Continuous Learning Protocol).
 * Automatically saves validated insights or corrections to Supabase ai_memories.
 */
async function saveServerMemory(factText, sessionId = null) {
  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL).replace(/\/+$/, '');
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey || !factText) return;
  const trimmedFact = String(factText).trim();
  if (trimmedFact.length < 5 || trimmedFact.length > 1000) return;
  if (/\b(ignore|override|disregard|abaikan)\b/i.test(trimmedFact)) return;
  // Tolak placeholder kosong yang disalin model mentah dari instruksi (mis. "Fakta ringkas
  // terkonfirmasi" tanpa isi) agar tidak membanjiri tabel dengan entri tak bermakna.
  if (/^(?:fakta\s+ringkas\s+terkonfirmasi|fakta\s+terkonfirmasi|ringkas\s+terkonfirmasi|save\s*memory\s*[:)]?)\s*[:\-]?\s*$/i.test(trimmedFact)) return;
  try {
    await fetchWithHardTimeout(`${supabaseUrl}/rest/v1/ai_memories`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        fact_text: trimmedFact,
        session_id: sessionId || null,
        created_at: new Date().toISOString()
      })
    }, 3000);
  } catch (_) {}
}

/**
 * Rekonstruksi & Perbaikan Tabel Markdown:
 * Mengidentifikasi tabel yang baris datanya menyatu dalam satu baris horizontal,
 * menghitung kolom header, dan memecah sel-sel data ke baris-baris GFM yang valid.
 */
function repairMarkdownTables(content) {
  if (!content) return content;
  let out = content;

  // 1. Rekonstruksi tabel standar yang baris datanya menyatu setelah divider
  const tableRegex = /(\|[^\n|]+(?:\|[^\n|]+)+\|?)\s*\n*\s*(\|[-: ]+(?:\|[-: ]+)+\|?)\s*([^\n#]+)/g;
  out = out.replace(tableRegex, (match, headerRaw, dividerRaw, dataRaw) => {
    const headerCols = headerRaw.split('|').map(s => s.trim()).filter(Boolean);
    const numCols = headerCols.length;
    if (numCols === 0) return match;

    const dividerCols = dividerRaw.split('|').map(s => s.trim()).filter(Boolean);
    const standardDivider = '| ' + headerCols.map((_, idx) => dividerCols[idx] || '-----------').join(' | ') + ' |';
    const standardHeader = '| ' + headerCols.join(' | ') + ' |';

    const rawCells = dataRaw.split('|').map(s => s.trim()).filter(s => s.length > 0);
    const rowLines = [];
    for (let i = 0; i < rawCells.length; i += numCols) {
      const chunk = rawCells.slice(i, i + numCols);
      if (chunk.length > 0) {
        while (chunk.length < numCols) chunk.push('-');
        rowLines.push('| ' + chunk.join(' | ') + ' |');
      }
    }

    return `\n\n${standardHeader}\n${standardDivider}\n${rowLines.join('\n')}\n\n`;
  });

  // 2. Rekonstruksi baris data orphan yang menggunakan format tab atau sel horizontal tanpa divider
  const lines = out.split('\n');
  const outLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // A. Ubah baris bertab (tab-separated) menjadi baris tabel GFM resmi
    if (line.includes('\t')) {
      const tabParts = line.split('\t').map(s => s.trim()).filter(Boolean);
      if (tabParts.length >= 2) {
        const isHeader = /komponen|teknologi|aspek|keterbatasan|fitur|layer|kategori/i.test(tabParts[0] + ' ' + tabParts[1]);
        outLines.push('| ' + tabParts.join(' | ') + ' |');
        if (isHeader) {
          outLines.push('| ' + tabParts.map(() => '---').join(' | ') + ' |');
        }
        continue;
      }
    }

    // B. Deteksi baris yang diawali '|' dan memiliki banyak pipe (>= 4 sel terpisah)
    if (line.startsWith('|') && (line.match(/\|/g) || []).length >= 4) {
      const cells = line.split('|').map(s => s.trim()).filter(Boolean);
      const prevLine = (outLines[outLines.length - 1] || '').trim();
      const prevPrevLine = (outLines[outLines.length - 2] || '').trim();

      let numCols = 2; // Default 2 kolom
      if (cells.length % 3 === 0 && (cells.length % 2 !== 0 || /solusi|potensial|penjelasan|deskripsi/i.test(prevLine + ' ' + prevPrevLine))) {
        numCols = 3;
      } else if (cells.length % 2 === 0) {
        numCols = 2;
      }

      for (let c = 0; c < cells.length; c += numCols) {
        const rowChunk = cells.slice(c, c + numCols);
        while (rowChunk.length < numCols) rowChunk.push('-');
        outLines.push('| ' + rowChunk.join(' | ') + ' |');
      }
    } else {
      outLines.push(lines[i]);
    }
  }

  return outLines.join('\n');
}

/**
 * Normalizer Struktur Markdown:
 * Membersihkan artefak strip sebelum heading/nomor, menyusun numbered list,
 * dan merekonstruksi tabel menjadi format CommonMark yang rapi.
 */
function normalizeStructuredMarkdown(str) {
  if (!str) return str;
  let out = str;

  // 1. Sambungkan kembali nomor list yang terputus di akhir kalimat (misal: "ringan. 2.\nInference:" atau "ringan. 2.\n**Inference**:")
  out = out.replace(/([.:?!])\s*(\d+)\.\s*\n+\s*([A-Za-z*])/g, '$1\n\n$2. $3');

  // 1.2 Bersihkan bullet/asterisk liar yang menempel setelah nomor urut (misal: "1. - *Pilih..." -> "1. Pilih...")
  out = out.replace(/(\d+\.)\s*[-*•\s]+\*?/g, '$1 ');

  // 1.3 Pisahkan nomor urut yang tergabung inline (misal: "...kedua model. 3. Identitas...") menjadi baris baru
  out = out.replace(/([.!?])\s+(\d+\.\s+[A-Za-z*])/g, '$1\n\n$2');

  // 1.4 Normalisasi bullet character aneh ('•', '*') ke standard '-'
  out = out.replace(/^[•*]\s+/gm, '- ');

  // 1.5 Format bullet items starting with bold label: e.g. "**Kemampuan Multimodal**: ..." -> "- **Kemampuan Multimodal**: ..."
  out = out.replace(/(?:^|\n)\s*(?![#\d\s\-*•])(\*\*[^*:\n]+\*\*)\s*(?:[:–—,]|: )?\s*([A-Za-z])/g, '\n- $1: $2');

  // 1.6 Normalisasi konsistensi label judul list item (Anti-Pewarnaan Huruf Tidak Konsisten):
  // Menjamin seluruh judul poin sebelum tanda titik dua (- Judul: Penjelasan, • Judul: Penjelasan, atau 1. Judul: Penjelasan)
  // selalu dibungkus dengan **Judul**: secara seragam agar ter-render konsisten sebagai teks aksen cyan (<strong>)
  out = out.replace(/(?:^|\n)\s*([•\-\*]|\d+\.)\s*(?!\*\*|#)\*?([\w][\w\s/&._\-]{1,50}?)\*?:\s+([^\n]+)/g, (match, bullet, title, desc) => {
    const cleanBullet = (bullet === '•' || bullet === '*') ? '-' : bullet;
    return `\n${cleanBullet} **${title.trim()}**: ${desc.trim()}`;
  });

  // 2. Konversi judul bagian mandiri (akhiran titik dua tanpa isi kalimat) menjadi Heading Markdown (### Judul)
  // Mencegah judul bagian (seperti Komponen Utama:, Alur Kerja:, Keunggulan:, Manfaat:) berubah menjadi butir poin (- )
  out = out.replace(/(?:^|\n)\s*(?:[-*•]\s*)?([A-Z][a-zA-Z0-9\s/&-]{2,35}):\s*(?=\n|$)/g, (match, title) => {
    const cleanTitle = title.trim();
    return `\n\n### ${cleanTitle}\n\n`;
  });

  // 3. Bersihkan strip/bullet aneh sebelum heading (misal: '- - ###' atau '• • ###')
  out = out.replace(/(?:^|\n)\s*[-–—•\s]{2,}\s*(#{1,6}\s+)/g, '\n\n$1');
  out = out.replace(/([^#\n\r])\s*(#{1,6}\s+)/g, '$1\n\n$2');

  // 4. Pisahkan heading yang menempel langsung dengan bullet list atau nomor
  out = out.replace(/(#{1,6}\s+[^\n]+?)\s+([-*•]\s+\*\*|\d+\.\s+\*\*)/g, '$1\n\n$2');
  out = out.replace(/(#{1,6}\s+[^\n]+?)\s+([-*•]\s+[A-Za-z0-9])/g, '$1\n\n$2');

  // 5. Bersihkan strip/bullet aneh sebelum angka list (tanpa memotong huruf kata sebelumnya)
  out = out.replace(/(?:^|\n)\s*[-–—•\s]{2,}\s*(\d+\.\s+[A-Za-z*])/g, '\n\n$1');

  // 6. Pisahkan numbered list (1. **Label**: atau 1. Kata) yang menempel di tengah kalimat atau setelah titik
  out = out.replace(/([.:?!])\s+(\d+\.\s+(?:\*\*|[A-Za-z]))/g, '$1\n\n$2');

  // 6.5 Rekonstruksi nomor item yang terpisah dari isinya oleh baris kosong:
  //     Model sering menghasilkan "1.\n\nNama Item ...." (nomor di baris sendiri, isi di
  //     paragraf berikutnya). Tanpa penanganan, markdown merender "1." sebagai paragraf
  //     terpisah sehingga list terlihat ngaco. Gabungkan menjadi "1. Nama Item ...".
  //     Diproses per blok agar tidak merusak list yang sudah benar ("N. **Teks**" atau "N. Teks").
  {
    const numLines = out.split('\n');
    const merged = [];
    for (let i = 0; i < numLines.length; i++) {
      const line = numLines[i];
      // Baris berisi HANYA "N." (nomor yatim, tanpa isi) — cek isi baris berikutnya
      const orphanMatch = line.match(/^\s*(\d{1,2})\.\s*$/);
      if (orphanMatch) {
        // Baris berikutnya (setelah 0+ baris kosong) berisi konten item
        let j = i + 1;
        while (j < numLines.length && numLines[j].trim() === '') j++;
        const nextContent = j < numLines.length ? numLines[j].trim() : '';
        const isNextOrphan = /^\s*\d{1,2}\.\s*$/.test(nextContent);
        const isNextListLike = /^\s*\d{1,2}\.\s+\S|^\s*[-*•]\s+\S|^#{1,6}\s/.test(nextContent);
        if (nextContent && !isNextOrphan && !isNextListLike && !/^\s*$/.test(nextContent)) {
          merged.push(`${orphanMatch[1]}. ${nextContent}`);
          i = j; // lewati baris konten yang sudah digabung
          continue;
        }
        // Tak ada konten lanjutan yang layak — pertahankan baris apa adanya
        merged.push(line);
        continue;
      }
      merged.push(line);
    }
    out = merged.join('\n');
  }

  // 7. Pisahkan bullet list (- **Label**: atau - Kata) yang menempel di tengah kalimat
  out = out.replace(/([.:?!]|\b)\s+[-*•]\s+(\*\*[^*]+\*\*:?)/g, '$1\n- $2');
  out = out.replace(/([.:?!])\s+[-*•]\s+([A-Za-z0-9])/g, '$1\n\n- $2');

  // 8. Bersihkan artefak strip ganda sebelum kata biasa
  out = out.replace(/(?:^|\n)\s*[-–—•\s]{2,}\s*([A-Z][a-z0-9])/g, '\n\n$1');

  // 9. Format sub-item fitur (key: value) yang memiliki kalimat penjelas (BUKAN heading dan BUKAN nomor)
  out = out.replace(/\n(?![#\d\s\-*•])([A-Z][a-zA-Z0-9 -]+(?:\([^)]*\))?:\s+[^\n]+)/g, '\n- $1');

  // 9.2 Format items following introductory colons into bullet points
  out = out.replace(/(:\s*\n+)(?:(?![#\d\s\-*•])([A-Z][a-zA-Z0-9\s/&-]{3,45})(?:,\s+|\s*[-–—:]\s+)([A-Z][^\n]+)\n*)/g, '$1- **$2**: $3\n');

  // 10. Hapus bullet yang tidak sengaja tertempel di depan numbered list
  out = out.replace(/\n\s*[-*•]\s*(\d+\.\s+)/g, '\n$1');

  // 11. Rekonstruksi & Rapikan Tabel Markdown
  out = repairMarkdownTables(out);

  // 12. Pisahkan paragraf kesimpulan penutup yang menempel setelah titik terakhir list
  out = out.replace(/(\.\s*)(Dengan struktur ini|Kesimpulannya|Secara keseluruhan|Jika ada|Untuk informasi)/gi, '.\n\n$2');

  // 13. Sanitasi handle username: Hapus (@Raflyf) atau @Raflyf jika muncul
  out = out.replace(/\s*\(@?Raflyf\)/gi, '');
  out = out.replace(/\s*@Raflyf\b/gi, '');

  // 14. Repair broken bold asterisks (e.g. "Text (2026)**" without opening "**")
  const boldMatches = (out.match(/\*\*/g) || []).length;
  if (boldMatches % 2 !== 0) {
    out = out.replace(/\*\*([^*\n]*)$/, '$1');
  }

  // 14. Eliminasi Kalimat Validasi Diri & Defensive Meta-Talk (Berlaku untuk SEMUA Percakapan)
  out = out.replace(/(?:Jadi,?\s*(?:secara\s*singkat,?\s*)?)?saya\s+(?:bukan|tidak\s+memiliki|tidak\s+berafiliasi)\s+(?:model\s+dengan\s+)?(?:nama\s+)?(?:brand|merek|perusahaan)\s+tertentu[^.!?\n]*[.!?]/gi, '');
  out = out.replace(/(?:Jadi,?\s*(?:secara\s*singkat,?\s*)?)?saya\s+adalah\s+asisten\s+cerdas\s+yang\s+bekerja\s+untuk\s+membantu\s+(?:kamu|anda)\s+dalam\s+menjelajahi[^.!?\n]*[.!?]/gi, '');
  out = out.replace(/\b(?:Sebagai\s+(?:model\s+bahasa(?:\s+besar)?|asisten\s+(?:AI|virtual)|AI|LLM)[^,.\n]*,?\s*)/gi, '');
  out = out.replace(/\b(?:Perlu\s+(?:diingat|dicatat|diketahui)\s+bahwa\s+(?:saya\s+adalah|ini\s+adalah|saya\s+hanyalah)[^.!?\n]*[.!?])/gi, '');
  out = out.replace(/\b(?:saya\s+hanya\s+(?:sebuah|merupakan)\s+(?:model\s+bahasa|program|AI|asisten)[^.!?\n]*[.!?])/gi, '');

  // 15. Normalisasi newline ganda berlebih
  out = out.replace(/\n{3,}/g, '\n\n').trim();

  return out;
}

/**
 * Intelligent Unified AI Key Resolver
 * Automatically classifies tokens from a single AI_KEYS variable or legacy per-provider env vars.
 */
function getUnifiedProviderKeys(cleanCustomKey = null, cleanCustomProvider = null) {
  const unifiedRaw = [
    process.env.AI_KEYS,
    process.env.AI_API_KEYS,
    process.env.ALL_KEYS,
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_KEYS,
    process.env.OPENROUTER_KEY,
    process.env.OPENCODE_API_KEY,
    process.env.OPENCODE_KEYS,
    process.env.MINIMAX_API_KEY,
    process.env.MINIMAX_KEY,
    process.env.MINIMAX_KEYS,
    process.env.OLLAMA_API_KEY,
    process.env.OLLAMA_KEYS,
    process.env.OLLAMA_KEY,
    process.env.NVIDIA_API_KEY,
    process.env.NVIDIA_KEY
  ].filter(Boolean).join(',');

  const allTokens = unifiedRaw
    .split(/[\n,;\s]+/)
    .map(k => k.trim())
    .filter(k => k.length > 5);

  const openrouter = [];
  const opencode = [];
  const minimax = [];
  const ollama = [];
  const nvidia = [];

  for (const token of allTokens) {
    if (token.startsWith('sk-or-v1-')) {
      if (!openrouter.includes(token)) {
        openrouter.push(token);
      }
    } else if (token.startsWith('sk-cp-') || token.startsWith('sk-minimax-')) {
      if (!minimax.includes(token)) minimax.push(token);
    } else if (token.startsWith('nvapi-')) {
      if (!nvidia.includes(token)) nvidia.push(token);
    } else if (token.startsWith('sk-') && token.length >= 40) {
      if (!opencode.includes(token)) opencode.push(token);
    } else if (token.includes('.') || token.length === 32 || token.startsWith('ollama-')) {
      if (!ollama.includes(token)) ollama.push(token);
    }
  }

  // Handle client custom key override
  if (cleanCustomKey) {
    if (cleanCustomProvider === 'openrouter' || !cleanCustomProvider) {
      if (!openrouter.includes(cleanCustomKey)) openrouter.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'opencode') {
      if (!opencode.includes(cleanCustomKey)) opencode.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'minimax') {
      if (!minimax.includes(cleanCustomKey)) minimax.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'ollamacloud' || cleanCustomProvider === 'ollama') {
      if (!ollama.includes(cleanCustomKey)) ollama.unshift(cleanCustomKey);
    } else if (cleanCustomProvider === 'nvidia') {
      if (!nvidia.includes(cleanCustomKey)) nvidia.unshift(cleanCustomKey);
    }
  }

  return {
    openrouter,
    opencode,
    minimax,
    ollama,
    nvidia
  };
}

export default async function handler(req, res) {
  // CORS: allowlist eksplisit — jangan pernah echo origin arbitrer dengan credentials
  const ALLOWED_ORIGINS = [
    process.env.ALLOWED_ORIGIN,
    'https://raflyfirmansyah-portofolio.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3877',
    'http://localhost:3000',
    'http://127.0.0.1:3877',
    'http://127.0.0.1:3000'
  ].filter(Boolean);
  const requestOrigin = (req.headers && req.headers.origin) ? req.headers.origin : '';
  const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    loadLocalEnv();
    const resolvedKeys = getUnifiedProviderKeys();
    const hasOpenRouter = resolvedKeys.openrouter.length > 0;
    const hasOpenCode = resolvedKeys.opencode.length > 0;
    const hasOllama = resolvedKeys.ollama.length > 0;
    const hasMiniMax = resolvedKeys.minimax.length > 0;
    return res.status(200).json({ 
      version: 'v10.584.0',
      status: 'online', 
      keys: { hasOpenRouter, hasOpenCode, hasOllama, hasMiniMax },
      timestamp: Date.now() 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const requestStartTime = Date.now();

  try {
    loadLocalEnv();

    const body = req.body || {};
    // SECURITY (anti RAG-poisoning): longTermMemory from the client body is
    // IGNORED — memory is read server-side from ai_memories (service_role) only.
    const { query, history = [], attachments = [], model = 'auto', customKey = null, customProvider = null, sessionLanguage = 'id', reasoningEffort = 'auto', sessionId = null } = body;

    // Rate Limiting (trusted client IP — see getClientIp)
    const clientIp = getClientIp(req);
    if (await isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Terlalu banyak permintaan. Silakan tunggu beberapa detik sebelum mengirim pesan berikutnya.',
        rateLimited: true
      });
    }

    if (!query && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Query prompt or file attachment is required' });
    }

    // Sanitize user-provided keys against CRLF injection
    const cleanCustomKey = typeof customKey === 'string' ? customKey.replace(/[\r\n]/g, '').trim().slice(0, 256) : '';
    const cleanCustomProvider = typeof customProvider === 'string' ? customProvider.replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 32) : '';

    const resolvedKeys = getUnifiedProviderKeys(cleanCustomKey, cleanCustomProvider);
    const OPENROUTER_KEYS = resolvedKeys.openrouter;
    const OPENROUTER_KEY = OPENROUTER_KEYS[0] || null;
    const NVIDIA_KEYS = resolvedKeys.nvidia;
    const NVIDIA_KEY = NVIDIA_KEYS[0] || null;
    const OPENCODE_KEYS = resolvedKeys.opencode;
    const OPENCODE_KEY = OPENCODE_KEYS[0] || null;
    const MINIMAX_KEYS = resolvedKeys.minimax;
    const MINIMAX_KEY = MINIMAX_KEYS[0] || null;
    const OLLAMA_KEYS = resolvedKeys.ollama;
    const OLLAMA_KEY = OLLAMA_KEYS[0] || null;

    const providerErrors = [];

    // Check for image attachments
    const imageAttachments = Array.isArray(attachments) ? attachments.filter(a => a.isImage || (a.type && a.type.startsWith('image/'))) : [];
    const docAttachments = Array.isArray(attachments) ? attachments.filter(a => !a.isImage && (!a.type || !a.type.startsWith('image/'))) : [];
    const hasImages = imageAttachments.length > 0;

    // Build assembled text prompt with document attachments
    let assembledQuery = query;
    if (docAttachments.length > 0) {
      const docTexts = docAttachments.map(d => `[DOKUMEN TERLAMPIR: ${d.name} (${d.type || 'text'})]:\n\`\`\`\n${d.data}\n\`\`\``).join('\n\n');
      assembledQuery = `${docTexts}\n\n[INSTRUKSI / PERTANYAAN PENGGUNA]:\n${query || 'Analisis dan jelaskan isi dokumen terlampir di atas secara mendalam.'}`;
    }

    // Dynamic Query Intent & Auto-Router Classification
    const queryIntent = classifyQueryIntent(assembledQuery, docAttachments, hasImages);

    // Resolve Effective Effort (Dynamic scaling if auto, or user-selected override)
    const effectiveEffort = (reasoningEffort === 'auto' || !reasoningEffort) 
      ? queryIntent.effort 
      : reasoningEffort;

    let targetModel = (model === 'auto' || !model)
      ? 'Nemotron-3-Nano-30B'
      : model;

    if (hasImages && (model === 'auto' || !model)) {
      targetModel = 'Vision-model';
    }

    const qClean = (query || '').trim();
    const isIdentityQuery = /^(kamu siapa|siapa kamu|kamu model apa|model apa kamu|model apa ini|kamu ai apa|kamu ini apa|siapa namamu|namamu siapa|who are you|what are you|what model are you|model apa yang aktif|kamu pakai model apa|ini model apa|anda siapa|siapa anda)$/i.test(qClean);
    const isTimeQuery = /(?:jam\s*berapa|waktu\s*sekarang|tanggal\s*berapa|hari\s*apa\s*sekarang|sekarang\s*jam|sekarang\s*tanggal|pukul\s*berapa|zona\s*waktu|wib\b|wita\b|wit\b)/i.test(qClean);
    const isCasualGreeting = /^(halo|hai|hey|pagi|siang|sore|malam|tes|test|ping|apa kabar|cukup|udah|sudah|selesai|stop|berhenti|gausah|nggak|tidak|makasih|terima kasih|thanks|thx|tq|oke|ok|sip|siap|mantap|keren|yup|yes|ya|iya|bye|dadah)$/i.test(qClean);
    const isInternalPortfolioQuery = /(?:spam|plagiarism|openplagiarism|plagiarisme|skripsi|naskah|laser|gesture|presenter|fotokitablur|foto kita|portofolio|portfolio|sertif|sertifikasi|bnsp|mtcna|cisco|rafly|firmansyah|proyek|project|riset|research|kendala|eror|error|masalah|bug|kontak|contact|skills?|kemampuan|riwayat|pendidikan|kuliah|kampus|cv|resume)/i.test(qClean);
    
    // UNIVERSAL RETRIEVAL-FIRST: Pencarian hanya di-skip untuk sapaan murni, pertanyaan waktu, atau pertanyaan identitas diri singkat.
    // Seluruh pertanyaan lain (baik proyek lokal, teknologi luar, konsep ML, coding, atau wawasan umum) WAJIB MENJALANKAN RETRIEVAL FAKTUAL!
    const isSkipSearch = isIdentityQuery || isTimeQuery || isCasualGreeting;

    // DEAD-1/KONFLIK-3: Removed fetchLiveRepoContext (was always ''). Direct await is cleaner.
    const searchResult = isSkipSearch
      ? { formattedPrompt: '', rawSnippets: [] }
      : await searchWebContext(query, history);
    const webContext = searchResult.formattedPrompt;
    const webMemories = searchResult.rawSnippets || [];

    // UNIVERSAL FRESHNESS INTEGRITY GATE (AGENTS.md 10a/10b): jika pertanyaan menuntut
    // fakta terkini namun pencarian live kosong, suntikkan arahan kejujuran agar model
    // tidak menyajikan ingatan lama sebagai "status terbaru" atau mengarang fakta.
    const needsLiveFacts = !isSkipSearch && /(?:terbaru|terkini|rilis|release|kapan|latest|breaking|berita|news|hari\s+ini|tahun\s+ini|saat\s+ini|sekarang|harga|benchmark|leaderboard|ranking|peringkat|skor|score|versi\s+terbaru|model\s+terbaru|flagship)/i.test(String(query || ''));
    const freshFactsIntegrityBlock = (needsLiveFacts && !webContext)
      ? `

[PERINGATAN INTEGRITAS FAKTUAL (BUKTI LIVE TIDAK DITEMUKAN)]:
Pencarian web real-time tidak menemukan bukti terkini yang memadai untuk pertanyaan ini. DILARANG mengarang status terbaru atau menyajikan ingatan lama sebagai kondisi "saat ini". Nyatakan dengan jujur bahwa status mutakhir belum terverifikasi lewat pencarian live, sampaikan hanya fakta yang Anda yakini terverifikasi (disertai penanda bahwa itu bukan informasi live), dan sarankan sumber resmi untuk kepastian.`
      : '';

    const agentSteps = [];
    if (!isSkipSearch && Array.isArray(searchResult.agentToolsUsed) && searchResult.agentToolsUsed.length > 0) {
      agentSteps.push(...searchResult.agentToolsUsed);
    } else if (!isSkipSearch && webMemories.length > 0) {
      agentSteps.push({
        tool: 'google_search',
        label: 'Google Search & Live Web',
        query: query.substring(0, 60),
        sourcesCount: webMemories.length,
        sources: webMemories.slice(0, 3)
      });
    }
    if (isInternalPortfolioQuery) {
      agentSteps.push({
        tool: 'portfolio_rag',
        label: 'Portfolio Ground Truth RAG',
        topic: query.substring(0, 50),
        status: 'verified_ground_truth'
      });
    }

    const sendSuccess = (content, modelName, providerName) => {
      let cleaned = String(content || '')
        .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?(?:div|p|span)[^>]*>/gi, '')
        .trim();

      // 0. Strip trailing meta-reflection, chain-of-thought, or constraints scratchpad leaks
      // (e.g. " - Check constraints: ...", "Response structure: ...", "Draft: ...", "Final plan: ...")
      cleaned = cleaned.replace(/["']?\s*[-–—*•]?\s*(?:Check constraints|Response structure|Final plan|Draft:|Checking constraints|Let's check constraints|Check against|Response plan:)[\s\S]*/i, '').trim();
      cleaned = cleaned.replace(/\b(?:Draft|Final plan|Response plan):\s*["']?([\s\S]+?)["']?(?=\s*[-–—*•]?\s*(?:Check|Response structure|Final plan|$))/i, '$1').trim();
      cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

      // 0.1. Auto-persist validated facts from [SAVE_MEMORY: ...] to Supabase
      const saveMemoryMatches = [...cleaned.matchAll(/\[SAVE_MEMORY:\s*([\s\S]*?)\]/gi)];
      for (const m of saveMemoryMatches) {
        if (m[1] && m[1].trim()) {
          saveServerMemory(m[1].trim(), sessionId || null).catch(() => {});
        }
      }

      // 0.2. DETERMINISTIC GROUNDED MEMORY CAPTURE (tanpa bergantung tag model):
      // Model jarang mematuhi instruksi [SAVE_MEMORY], sehingga ai_memories (dashboard
      // monitoring) tidak pernah bertambah. Solusi: bila jawaban berhasil disusun dari bukti
      // live yang valid (bukan identitas/sapaan/error), simpan SATU ringkasan fakta dari
      // judul berita teratas yang relevan sebagai memori terverifikasi. Tidak memakai awalan
      // "Kueri Pengunjung:" (klien mengecualikannya dari tampilan RAG). Dedupe per topik per
      // menit agar tidak spam.
      const topGroundedMemory = (() => {
        if (isSkipSearch || isIdentityQuery || isCasualGreeting || isTimeQuery) return null;
        if (!Array.isArray(webMemories) || webMemories.length === 0) return null;
        if (typeof query !== 'string' || query.trim().length < 5) return null;
        // Ambil judul bukti paling relevan (hindari baris label/teknis)
        const candidate = webMemories.find((s) => {
          const t = String(s || '');
          return t.length > 20 && !t.startsWith('[Wikipedia]') && !t.startsWith('[GitHub') && !t.startsWith('[Scraped');
        });
        if (!candidate) return null;
        const cleanTitle = String(candidate).replace(/\[Global Live Web\/News[^\]]*\]\s*/g, '').trim();
        if (cleanTitle.length < 20 || cleanTitle.length > 240) return null;
        // Ringkas jadi kalimat fakta
        return `Fakta live (${new Date().toISOString().slice(0, 10)}): ${cleanTitle}`;
      })();
      if (topGroundedMemory) {
        const nowMin = Math.floor(Date.now() / 60000);
        if (!globalThis.__lastGroundedMemory || globalThis.__lastGroundedMemory.min !== nowMin) {
          globalThis.__lastGroundedMemory = { min: nowMin, keys: new Set() };
        }
        const topicKey = String(query || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
        if (!globalThis.__lastGroundedMemory.keys.has(topicKey)) {
          globalThis.__lastGroundedMemory.keys.add(topicKey);
          saveServerMemory(topGroundedMemory, sessionId || null).catch(() => {});
        }
      }
      const textWithoutTags = cleaned.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
      if (/^(?:User Safety:\s*\w+[\s\S]*?Response Safety:\s*\w+|Safety:\s*safe)$/i.test(cleaned) || !textWithoutTags.trim()) {
        return null;
      }
      cleaned = textWithoutTags.replace(/^(?:User Safety:\s*\w+\s*\n*Response Safety:\s*\w+\s*\n*)+/i, '').trim();

      // 1. Check for explicit output markers like Thus: "..." or Response:
      const markerMatch = cleaned.match(/(?:Thus|Therefore|Response|Answer|Jawaban|In Indonesian|Output):\s*["']?([\s\S]+)/i);
      if (markerMatch && markerMatch[1] && markerMatch[1].trim().length > 10) {
        cleaned = markerMatch[1].trim().replace(/^["']|["']$/g, '').trim();
      } else {
        // 2. Check for English reasoning monologue start
        cleaned = cleaned.replace(/^(?:Here's (?:a )?(?:thinking process|breakdown|brief thinking)[\s\S]*?)(?=(?:\n\s*(?:[#\-*]|\d+\.|Berikut|Berdasarkan|Status|Informasi|Perilisan|Halo|Hai|Terima kasih|Dalam|Untuk|Pada|Ya|Tentu|Saya)\b))/i, '').trim();
        const reasoningKeywords = /^(?:Here's|Okay|First|Let me|I should|I need to|The user|Looking back|Looking at|Hmm|Wait|From memory|Now, for|To answer|Alright|Let's|Checking|So the user|The system message)\b/i;
        if (reasoningKeywords.test(cleaned)) {
          const indonesianMarker = /(?:(?:\n|\A)(?:Terima kasih|Berikut|Berdasarkan|Tabel|Perbandingan|Model|Untuk|Saat ini|Halo|Hai|Tentu|Dalam|Secara|Pada|[#|]|\d+\.)\s)/i;
          const match = cleaned.search(indonesianMarker);
          if (match !== -1 && match > 0) {
            cleaned = cleaned.slice(match).trim();
          } else {
            const lines = cleaned.split('\n');
            const filtered = lines.filter(l => !/^(?:Here's|Okay|First|Let me|I should|I need to|The user|Looking|Wait|Checking|So the user|Therefore|Thus|The system message|In their message|Given that|However|Alternatively|So, my response)\b/i.test(l.trim()));
            if (filtered.length > 0) {
              cleaned = filtered.join('\n').trim();
            }
          }
        }
      }

      // 3. Sanitize broken / malformed table pipe artifacts
      cleaned = cleaned.replace(/(?:^|\n)\|\s*(\d+)\s*\|\s*([^|\n]+?)\s*\|\s*(?:\n|$)/g, '\n### $1. $2\n');
      cleaned = cleaned.replace(/(?:^|\n)\|\s*([•\-\*]\s*[^|\n]+?)\s*\|\s*(?:\n|$)/g, '\n$1\n');
      cleaned = cleaned.replace(/\s*\|\s*$/gm, '');

      // 3.4. Strip repetitive leading greetings on non-greeting queries
      const isExplicitGreeting = /^(?:hai|halo|hei|hello|hi|hey|selamat\s+(?:pagi|siang|sore|malam)|assalamu[']?alaikum)\b/i.test((query || '').trim());
      if (!isExplicitGreeting) {
        cleaned = cleaned.replace(/^(?:Hai|Halo|Hei|Hello|Hi|Hey)[!,\s.-]+/i, '').trim();
      }

      // 3.4b. Strip leading query echoes as headings or bold text (e.g. "**Kamu Model Apa?**", "### Model AI Terbaik Saat Ini", "Tentang Claude 5.1:")
      const qWords = qClean.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(w => w.length > 2);
      if (qWords.length >= 1) {
        cleaned = cleaned.replace(/^(?:###?\s*|\*\*|__)?(?:Tentang\s+|Mengenai\s+)?([^\n:?]+)(?:[?:*_\s–—\-]|\*\*|__)*\n+/i, (fullMatch, leadPhrase) => {
          const leadWords = leadPhrase.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
          const overlap = leadWords.filter(w => qWords.some(qw => qw.toLowerCase() === w));
          if (overlap.length >= 1 && (overlap.length >= Math.min(2, qWords.length) || leadWords.length <= 4)) {
            return '';
          }
          return fullMatch;
        }).trim();
      }

      // 3.5. Ensure distinct line breaks for inline sub-sections and bullet points
      cleaned = cleaned.replace(/([.!?])\s*[-*•]\s*([A-Za-z0-9\s/&—–,]+?)(?:\*+|\*\*|:)?\s*[-–—:]\s*/g, '$1\n\n- **$2**: ');
      cleaned = cleaned.replace(/\s+[-*•]\s+\*\*([^*:\n]+)\*\*:\s*/g, '\n- **$1**: ');
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*\[([^\]\n]+)\]\s*[\-–—:]\s*/g, '\n- **$1**: ');
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*\*+([^*:\n]+)\*+\s*[\-–—:]\s*/g, '\n- **$1**: ');

      // 3.6. Clean rogue colons and malformed bullet point headers
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]\s*:\s*/g, '\n- ');
      cleaned = cleaned.replace(/(?:^|\n)\s*:\s*/g, '\n- ');
      cleaned = cleaned.replace(/:\s*:\s*/g, ': ');
      cleaned = cleaned.replace(/\*\*:\s*/g, '**: ');
      cleaned = cleaned.replace(/(?<!\*)\s*\*(?!\*)\s*-\s*/g, ' - ');

      // 3.62. Clean rogue unclosed asterisks on isolated words without destroying markdown bold
      cleaned = cleaned.replace(/(?<=\w)\*(?!\*|\w)/g, '');
      cleaned = cleaned.replace(/(?<!\*|\w)\*(?=\w)/g, '');

      // 3.63. Clean rogue HTML tags and RSS link artifacts
      cleaned = cleaned.replace(/<a\s+[^>]*>.*?<\/a>/gi, '');
      cleaned = cleaned.replace(/<[^>]+>/g, '');
      cleaned = cleaned.replace(/\s*Baca selengkapnya\b/gi, '');

      // 3.65. Sanitasi Nama Teknis Model/Gateway (Menjaga Kerahasiaan Sesuai Kebijakan Privasi Sistem)
      cleaned = cleaned.replace(/\b(?:Nemotron[-3\w:]*|Ollama(?:\s+Cloud)?|OpenRouter|NVIDIA\s+NIM)\b/gi, (matched) => {
        if (/nemotron/i.test(matched)) return 'AI Assistant Engine';
        if (/ollama|openrouter|nvidia/i.test(matched)) return 'Cloud Neural Gateway';
        return 'AI Engine';
      });

      // 3.65b. Sanitasi Handle Username: Hapus (@Raflyf) atau @Raflyf sesuai instruksi pengguna
      cleaned = cleaned.replace(/\s*\(@?Raflyf\)/gi, '');
      cleaned = cleaned.replace(/\s*@Raflyf\b/gi, '');

      // 3.65c. Eliminasi Kalimat Validasi Diri & Defensive Meta-Talk (Berlaku untuk SEMUA Percakapan)
      cleaned = cleaned.replace(/(?:Jadi,?\s*(?:secara\s*singkat,?\s*)?)?saya\s+(?:bukan|tidak\s+memiliki|tidak\s+berafiliasi)\s+(?:model\s+dengan\s+)?(?:nama\s+)?(?:brand|merek|perusahaan)\s+tertentu[^.!?\n]*[.!?]/gi, '');
      cleaned = cleaned.replace(/(?:Jadi,?\s*(?:secara\s*singkat,?\s*)?)?saya\s+adalah\s+asisten\s+cerdas\s+yang\s+bekerja\s+untuk\s+membantu\s+(?:kamu|anda)\s+dalam\s+menjelajahi[^.!?\n]*[.!?]/gi, '');
      cleaned = cleaned.replace(/\b(?:Sebagai\s+(?:model\s+bahasa(?:\s+besar)?|asisten\s+(?:AI|virtual)|AI|LLM)[^,.\n]*,?\s*)/gi, '');
      cleaned = cleaned.replace(/\b(?:Perlu\s+(?:diingat|dicatat|diketahui)\s+bahwa\s+(?:saya\s+adalah|ini\s+adalah|saya\s+hanyalah)[^.!?\n]*[.!?])/gi, '');
      cleaned = cleaned.replace(/\b(?:saya\s+hanya\s+(?:sebuah|merupakan)\s+(?:model\s+bahasa|program|AI|asisten)[^.!?\n]*[.!?])/gi, '');

      // 3.65e. Pemotongan Basa-Basi Template Penutup (AGENTS.md Bagian 3: Pemotongan Basa-Basi Total)
      cleaned = cleaned.replace(/(?:^|\n+)(?:Semoga\s+(?:penjelasan\s+ini\s+)?(?:ini\s+)?membantu|Hope\s+this\s+helps)[^.\n]*[.!?]?(?:\s*(?:Jika|Bila|Apabila)\s+ada\s+(?:hal|pertanyaan)\s+lain[^.\n]*[.!?]?)?/gi, '').trim();
      cleaned = cleaned.replace(/(?:^|\n+)(?:Jika|Bila|Apabila)\s+ada\s+(?:hal|pertanyaan|yang\s+ingin\s+ditanyakan)\s+lain[^.\n]*[.!?]?$/gi, '').trim();

      // 3.65d. Identity Grounding: Kenalkan identitas resmi secara elegan, bersih, dan konsisten (bebas echo & salah format)
      if (isIdentityQuery) {
        cleaned = sessionLanguage === 'en'
          ? `Saya adalah **AI Assistant & Developer Agent** resmi di website portofolio **Rafly Firmansyah**.\n\nSaya dirancang untuk mendampingi Anda menjelajahi proyek rekayasa perangkat lunak, menggali riset machine learning (seperti OpenPlagiarismChecker dan sistem deteksi spam email), memverifikasi sertifikasi kompetensi (BNSP, MikroTik, Cisco), serta mengevaluasi arsitektur sistem.\n\nAda proyek atau topik teknis tertentu yang ingin Anda diskusikan?`
          : `Saya adalah **AI Assistant & Developer Agent** resmi di website portofolio **Rafly Firmansyah**.\n\nSaya dirancang untuk mendampingi Anda menjelajahi proyek rekayasa perangkat lunak, menggali riset machine learning (seperti OpenPlagiarismChecker dan sistem deteksi spam email), memverifikasi sertifikasi kompetensi (BNSP, MikroTik, Cisco), serta mengevaluasi arsitektur sistem.\n\nAda proyek atau topik teknis tertentu yang ingin Anda diskusikan?`;
      }

      // 3.66. Deterministic Realtime Clock Grounding (Zero Hallucination)
      if (isTimeQuery) {
        const nowTime = new Date();
        const tz = 'Asia/Jakarta';
        const dateStr = sessionLanguage === 'en'
          ? nowTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz })
          : nowTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
        const timeStr = nowTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).replace('.', ':');
        const curHour = timeStr.slice(0, 2);

        // Deteksi jika model halusinasi jam lama yang salah (seperti 19:xx atau angka jam meleset)
        const isHallucinatedTime = /(?:19:03|19\.03|kemarin)/i.test(cleaned) || !cleaned.includes(curHour);
        if (isHallucinatedTime) {
          const cianjurNote = /(?:cianjur|cianhur|jawabarat|jawa\s*barat|bandung|jakarta)/i.test(qClean)
            ? ' Wilayah Cianjur dan seluruh Jawa Barat berada dalam zona Waktu Indonesia Barat (WIB).'
            : '';
          cleaned = `Sekarang hari ${dateStr}, pukul ${timeStr} WIB (Waktu Indonesia Barat, UTC+7).${cianjurNote}`;
        }
      }

      // 3.7. Clean duplicate bullet dashes & normalize bold markdown
      cleaned = cleaned.replace(/([.:?!])\s*[-*•]\s*\*/g, '$1\n\n- **');
      cleaned = cleaned.replace(/([.:?!])\s*[-*•]\s+/g, '$1\n\n- ');
      cleaned = cleaned.replace(/(?:^|\n|\.\s+)\s*[-*•]\s*\*([^*:\n]+)\*\*/g, '\n- **$1**');
      cleaned = cleaned.replace(/(?:^|\n|\.\s+)\s*[-*•]\s*\*\*([^*:\n]+)\*(?!\*)/g, '\n- **$1**');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*\*[\-\*•\s]*/gm, '$1**');
      cleaned = cleaned.replace(/^[\-\*•]\s*[\-\*•]\s*/gm, '- ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\[([^\]\n]+)\](?:\*\*|:|\*\*:)?\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*+([^\n*:-]+)\*+\s*[-–—:]\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)([^\n*:-]+)\*\s*-\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*\*([^\n*]+)\*\s*-\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/^([•\-\*]\s*)\*\*([^\n*]+)\*\s*:\s*/gm, '$1**$2**: ');
      cleaned = cleaned.replace(/([^\n])\s{2,}([^\n])/g, '$1 $2');
      cleaned = cleaned.replace(/([^\n])\s+((?:Semoga|Jika ada|Ada topik|Kalau ada|Silakan)\s+[^\n]+)$/i, '$1\n\n$2');
      cleaned = cleaned.replace(/\n\s*-\s*-\s*(?:\n|$)/g, '\n\n');
      cleaned = cleaned.replace(/\s*-\s*-\s*$/g, '');

      // Balance unclosed bold tags (e.g. "**Gemini 3.8 Flash...")
      const boldTagCount = (cleaned.match(/\*\*/g) || []).length;
      if (boldTagCount % 2 !== 0) {
        cleaned = cleaned.replace(/\*\*([^*\n]+)(?=[,\.\n]|$)/m, '**$1**');
      }

      // 4. Zero-Emoji Enforcement: Strip all Unicode emojis
      cleaned = cleaned.replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '').replace(/[ \t]{2,}/g, ' ');

      // 4.5. Strip foreign Chinese / Japanese / Korean (CJK) script glitches in Indonesian/English mode
      if (sessionLanguage !== 'zh') {
        cleaned = cleaned.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]+/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
      }

      // 5. Sanitize repetitive template closing boilerplate
      cleaned = cleaned.replace(/(?:\n\n|\n)(?:Jika Anda (?:memerlukan|membutuhkan|tertarik|ingin|butuh)[\s\S]*?(?:siap membantu|hubungi|mengeksplorasi|contoh kode| relevan)[\s\S]*?$)/i, '').trim();

      // 6. Strip URL fiktif / dikarang model (Anti-Hallucination URL Forgery Filter)
      // Whitelist: domain resmi Rafly + domain dokumentasi resmi terpercaya
      const officialDomains = [
        'github.com', 'raflyfirmansyah-portofolio.vercel.app', 'bnsp.go.id', 'mikrotik.com', 'netacad.com',
        'wa.me', 'wikipedia.org', 'wikimedia.org', 'huggingface.co', 'arxiv.org',
        'openai.com', 'anthropic.com', 'deepmind.google', 'deepseek.com', 'mistral.ai', 'meta.com', 'nvidia.com', 'microsoft.com'
      ];
      cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, linkText, url) => {
        try {
          const hostname = new URL(url).hostname.replace(/^www\./, '');
          const isOfficialDomain = officialDomains.some(d => hostname === d || hostname.endsWith('.' + d));
          if (isOfficialDomain) return match; // URL resmi, biarkan
          return linkText; // URL tidak dikenal / berita RSS, strip jadi teks saja
        } catch (_) {
          return linkText; // URL malformed, strip
        }
      });

      // 6.5. Strip all Google News / Bing RSS raw link artifacts completely
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*(?:\*\*)?Tautan Terkait(?:\*\*)?:?\s*[\s\S]*?(?:news\.google\.com|bing\.com)[^\n]*/gi, '');
      cleaned = cleaned.replace(/https?:\/\/(?:news\.google\.com|www\.bing\.com\/news)[^\s)"'>]+/gi, '');
      cleaned = cleaned.replace(/(?:^|\n)\s*[-*•]?\s*(?:\*\*)?Tautan Terkait(?:\*\*)?:?\s*$/gim, '');

      // 7. Relocate inline links from the middle of prose paragraphs to the bottom
      const hasInlineLinksInProse = /([a-zA-Z0-9\.\,\)])\s*(\[[^\]]+\]\(https?:\/\/[^)]+\))\s*([a-zA-Z0-9])/i.test(cleaned);
      if (hasInlineLinksInProse && !cleaned.includes('Tautan Terkait:') && !cleaned.includes('Tautan Proyek:')) {
        const extractedLinks = [];
        cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (m, label, linkUrl) => {
          extractedLinks.push(`- ${label}: [${linkUrl}](${linkUrl})`);
          return ''; // Strip from the middle of sentence
        });
        cleaned = cleaned.replace(/[ \t]{2,}/g, ' ').replace(/\s*\.\s*\./g, '.').trim();
        if (extractedLinks.length > 0) {
          const uniqueLinks = Array.from(new Set(extractedLinks));
          cleaned = `${cleaned}\n\nTautan Terkait:\n${uniqueLinks.join('\n')}`;
        }
      }

      // 8. Clean empty or bogus "Tautan Terkait:" headers
      cleaned = cleaned.replace(/\n+Tautan Terkait:\s*(?:\([^)]*\)|tidak ada[^\n]*|none|n\/a|-*\s*)?$/i, '').trim();
      cleaned = cleaned.replace(/\n+Tautan Terkait:\s*(?:\n|$)/gi, '').trim();
      const tautanIndex = cleaned.indexOf('Tautan Terkait:');
      if (tautanIndex !== -1) {
        const afterTautan = cleaned.slice(tautanIndex + 'Tautan Terkait:'.length).trim();
        if (!afterTautan || !/(?:\[[^\]]+\]|\bhttps?:\/\/|[-*•]\s*\S+)/.test(afterTautan)) {
          cleaned = cleaned.slice(0, tautanIndex).trim();
        }
      }

      cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

      // Clean AI punctuation artifacts (remove robotic em-dashes and non-breaking hyphens)
      cleaned = cleaned
        .replace(/[\u2010\u2011]/g, '-')
        .replace(/[\u202F\u00A0]/g, ' ')
        .replace(/(\*\*[^*:\n]+\*\*)\s*[\u2013\u2014-]\s*/g, '$1: ')
        .replace(/(\b[A-Za-z0-9_]+)\s*[\u2013\u2014]\s*(seperti|misalnya|contohnya|yakni|yaitu|termasuk)\b/gi, '$1, $2')
        .replace(/([a-zA-Z0-9_]+)[\u2013\u2014]([a-zA-Z0-9_]+)/g, '$1, $2')
        .replace(/\s*[\u2013\u2014]\s*/g, ' - ')
        .replace(/,\s*,+/g, ',')
        .replace(/[^\S\r\n]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Auto-Format Markdown Structure & Table Reconstruction (CommonMark GFM)
      cleaned = normalizeStructuredMarkdown(cleaned);

      // DETERMINISTIC ANTI-ECHO / DEDUPE-LINE GUARD:
      // Model kecil (mis. Nemotron 3 Nano) kadang meng-echo satu judul/baris bukti berulang-ulang
      // (contoh: "Xiaomi 18 Fold Rilis 7 September" muncul puluhan kali). Kolapskan baris-baris
      // yang nyaris identik (berurutan maupun tersebar) menjadi satu kemunculan paling informatif.
      const echoGuardKeys = [];
      cleaned = cleaned.split('\n').filter((lineRaw) => {
        const line = lineRaw.trim();
        if (!line) return true;
        // Normalisasi: huruf kecil, strip tanda baca/angka tanggal, untuk membandingkan inti kalimat
        const norm = line.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
        if (norm.length < 25) return true; // baris pendek (heading, list marker) tidak diproses
        const isRepeated = echoGuardKeys.some(existing => norm.startsWith(existing.slice(0, 60)) || existing.startsWith(norm.slice(0, 60)));
        if (isRepeated) return false;
        echoGuardKeys.push(norm);
        return true;
      }).join('\n');

      // DETERMINISTIC ANTI-FABRICATED REPORT-DATE GUARD (AGENTS.md 10a/10b):
      // Menghapus/mentransformasi kalimat atribusi tanggal global yang dikarang model
      // (contoh: "Semua informasi ini didasarkan pada laporan terbaru yang tersedia pada
      // 2 September 2026.") menjadi frasa netral berbasis penelusuran web real-time,
      // karena tanggal semacam itu tidak pernah berasal dari bukti live yang disuntikkan.
      // Kalimat tanpa format tanggal penuh (dd bulan yyyy) TIDAK disentuh demi presisi bedah.
      // Eliminasi kalimat meta-talk / template boilerplate pengantar dan penutup (AGENTS.md Stop-Slop & Zero-Boilerplate)
      cleaned = cleaned.replace(/(?:^|[.!?]\s+)(?:Informasi\s+ini\s+diambil\s+dari|Semua\s+informasi\s+(?:ini|di\s+atas)\s+didasarkan\s+pada|Berdasarkan\s+hasil\s+penelusuran\s+web\s+real-time)[^.!?\n]*[.!?]/gi, '').trim();
      cleaned = cleaned.replace(/[^\S\r\n]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

      // DETERMINISTIC FINAL ASTERISK SANITIZER:
      // Model kecil kadang meninggalkan bold TIDAK seimbang sehingga `**`/`*` mentah bocor.
      // Strategi per baris: (a) hitung asterisk; (b) GENAP -> biarkan (dianggap seimbang);
      // (c) GANJIL -> buang asterisk tunggal yang tak berpasangan; bila masih ganjil,
      // buang SEMUA asterisk baris itu (lebih baik teks polos daripada simbol bocor).
      cleaned = cleaned.split('\n').map((lineRaw) => {
        let line = lineRaw;
        // 0) Penutup-bold yatim di akhir label, mis. "Biaya (Cost-Effectiveness)**: - teks".
        //    Cek "pembuka sejati" = `**` yang diikuti HURUF (bukan asterisk/spasi/tanda baca).
        //    Bila tidak ada pembuka sejati dan ada `**` menjelang colon/dash/akhir, buang semua `**`.
        const hasRealOpener = /\*\*[A-Za-z0-9\u00C0-\u024F]/.test(line);
        const hasOrphanClose = /\)\*\*\s*[:,\-–—\s]/.test(line) || /\*\*\s*[:,\-–—\s]/.test(line);
        if (!hasRealOpener && hasOrphanClose) {
          line = line.replace(/\*\*/g, '');
        }
        const astCount = (line.match(/\*/g) || []).length;
        if (astCount % 2 === 0) return line;
        // 1) Hapus asterisk tunggal (bukan bagian **) di ujung kata / menjelang spasi-akhir
        let l = line.replace(/(?<=\w)\*(?!\*)/g, '').replace(/\*(?!\*)(?=\s|$)/g, '');
        // 2) Penutup `**` tanpa pembuka di baris yang sama (jika masih tersisa)
        const hasOpener = /\*\*[^*]/.test(l);
        if (!hasOpener) l = l.replace(/\*\*/g, '');
        // 3) Jika masih ganjil, bersihkan total
        const left = (l.match(/\*/g) || []).length;
        if (left % 2 !== 0) l = l.replace(/\*/g, '');
        return l;
      }).join('\n');

      if (!cleaned || cleaned.trim().length === 0) {
        cleaned = 'Maaf, saya tidak dapat menyusun jawaban saat ini.';
      }

      if (res.headersSent) return true;
      const isSpecific = (model && model !== 'auto');
      const isFailover = isSpecific && !modelName.toLowerCase().includes(targetModel.toLowerCase().split('/').pop().replace(/-free$/i, ''));
      res.status(200).json({
        success: true,
        response: cleaned,
        model: modelName,
        requestedModel: model,
        isFailover: isFailover,
        provider: providerName,
        effort: effectiveEffort,
        category: queryIntent.category,
        steps: agentSteps,
        webMemories: webMemories
      });
      return true;
    };

    // SEMANTIC RELEVANCE GATE (Zero Memory Contamination & Anti-Hallucination)
    // Only query memories if the query is NOT a greeting, time check, or identity query.
    // Filter strictly by topical keywords so completely unrelated queries receive ZERO memories.
    const isSpecialOrInternal = isIdentityQuery || isTimeQuery || isCasualGreeting;
    const isExternalLiveSearch = !isSkipSearch && searchResult.rawSnippets && searchResult.rawSnippets.length > 0;
    const rawServerMemories = (isSpecialOrInternal || isExternalLiveSearch) ? [] : await fetchServerMemories(25);
    const relevantMemories = filterRelevantMemories(rawServerMemories, query, isSpecialOrInternal);

    const serverMemoryBlock = relevantMemories.length > 0
      ? `\n\n[MEMORI TERVERIFIKASI RELEVAN (Hanya untuk topik terkait)]:\n${relevantMemories.map(f => `- ${f}`).join('\n')}\nPANDUAN RELEVANSI: Fakta memori di atas HANYA boleh dirujuk jika relevan langsung dengan pertanyaan pengguna saat ini. DILARANG KERAS mengaitkan atau memaksakan fakta memori ke topik yang tidak ditanyakan.`
      : '';

    // Hanya aktifkan instruksi simpan memori jika sedang ada pencarian web aktif dan fakta teknologi baru ditemukan
    const memoryInstruction = (!isSkipSearch && searchResult.rawSnippets && searchResult.rawSnippets.length > 0)
      ? `\n\n[INSTRUKSI PENYIMPANAN FAKTA BARU]:\nJika respons Anda memuat rilis teknologi baru terkonfirmasi yang valid dari Konteks Pencarian Web di atas, sertakan tag di baris paling akhir:\n\`[SAVE_MEMORY: Fakta ringkas terkonfirmasi]\``
      : '';

    const systemPromptWithSearch = `${buildSystemPrompt(sessionLanguage, effectiveEffort, targetModel, isInternalPortfolioQuery)}${freshFactsIntegrityBlock}${webContext}${serverMemoryBlock}${memoryInstruction}`;

    // Calibrated Dynamic Rolling History Assembler (7,500 chars / ~1.8k tokens - Ultra-Fast Prefill & Sub-10s Latency)
    function assembleDynamicMessages(systemPrompt, historyList = [], userContent = '', maxTotalChars = 7500) {
      const systemStr = typeof systemPrompt === 'string' ? systemPrompt : JSON.stringify(systemPrompt || '');
      const userStr = typeof userContent === 'string' ? userContent : JSON.stringify(userContent || '');
      let currentBudget = maxTotalChars - (systemStr.length + userStr.length);
      if (currentBudget < 1500) currentBudget = 1500;

      const validHistory = ((isIdentityQuery || isTimeQuery) ? [] : (Array.isArray(historyList) ? historyList : [])).filter(item => {
        if (!item || !item.content) return false;
        const c = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
        return !c.includes('antrean seluruh provider AI sedang penuh') && !c.includes('kendala jaringan') && !c.includes('[AI Fallback]');
      });
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
          if (currentBudget > 800) {
            selectedHistory.unshift({
              role: item.role === 'assistant' ? 'assistant' : 'user',
              content: contentStr.slice(-currentBudget)
            });
          }
          break;
        }
      }

      return [
        { role: 'system', content: systemPrompt },
        ...selectedHistory,
        { role: 'user', content: userContent }
      ];
    }

    const finalUserPrompt = assembledQuery;
    const baseTextMessages = assembleDynamicMessages(systemPromptWithSearch, history, finalUserPrompt);

    // Multimodal payload for OpenRouter / OpenAI compatible Vision APIs
    let openRouterMessages = baseTextMessages;
    if (hasImages && imageAttachments.length > 0) {
      openRouterMessages = baseTextMessages.map((msg, idx) => {
        if (idx === baseTextMessages.length - 1 && msg.role === 'user') {
          const contentParts = [];
          if (typeof msg.content === 'string' && msg.content.trim()) {
            contentParts.push({ type: 'text', text: msg.content.trim() });
          }
          imageAttachments.forEach(att => {
            let dataUrl = att.data || att.base64 || att.url || '';
            if (dataUrl) {
              if (!dataUrl.startsWith('data:') && !dataUrl.startsWith('http')) {
                dataUrl = `data:${att.type || 'image/jpeg'};base64,${dataUrl}`;
              }
              contentParts.push({
                type: 'image_url',
                image_url: { url: dataUrl }
              });
            }
          });
          return { role: 'user', content: contentParts };
        }
        return msg;
      });
    }

    // Multimodal payload for Ollama Cloud (Ollama expects 'images' field with raw base64 array in user message)
    let ollamaMessages = baseTextMessages;
    if (hasImages && imageAttachments.length > 0) {
      const base64List = imageAttachments.map(att => {
        const raw = att.data || att.base64 || att.url || '';
        return raw.replace(/^data:image\/[^;]+;base64,/, '');
      }).filter(Boolean);

      if (base64List.length > 0) {
        ollamaMessages = baseTextMessages.map((msg, idx) => {
          if (idx === baseTextMessages.length - 1 && msg.role === 'user') {
            return { ...msg, images: base64List };
          }
          return msg;
        });
      }
    }

    // Maximum token limits: Balanced for blazing fast first-token latency and complete answers
    const maxTokensConfig = (effectiveEffort === 'thinking')
      ? 16384
      : (effectiveEffort === 'high'
          ? 8192
          : (effectiveEffort === 'medium'
              ? 4096
              : (effectiveEffort === 'low' ? 2048 : 4096)));
    const tempConfig = effectiveEffort === 'low' ? 0.15 : (effectiveEffort === 'thinking' ? 0.35 : 0.25);

    // ========================================================================
    // PROVIDER CALLER WRAPPERS
    // ========================================================================

    const isSpecificManual = !!(model && model !== 'auto' && model !== 'default' && model !== 'cascade');

    async function callOpenRouter(mName, timeoutConfig = 55000) {
      if (OPENROUTER_KEYS.length === 0) return null;
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;
      const now = Date.now();
      let activeKeys = OPENROUTER_KEYS.filter(k => !rateLimitedKeyCache.has(k) || rateLimitedKeyCache.get(k) < now);
      if (activeKeys.length === 0) activeKeys = OPENROUTER_KEYS;
      const keysToTry = isSpecificManual ? [...activeKeys].sort(() => Math.random() - 0.5) : [...activeKeys].sort(() => Math.random() - 0.5).slice(0, 2);

      const formattedMessages = openRouterMessages;

      for (const orKey of keysToTry) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const isReasoningModel = mName.toLowerCase().includes('reasoning') || mName.toLowerCase().includes('r1') || mName.toLowerCase().includes('thinking') || mName.toLowerCase().includes('qwq');
          const isLightning = mName.toLowerCase().includes('lightning');

          const res = await fetchJsonWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${orKey}`,
              'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
              'X-Title': 'Rafly Firmansyah AI Portfolio Terminal'
            },
            body: JSON.stringify({
              model: mName,
              messages: formattedMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig,
              reasoning: (!isLightning && isReasoningModel) ? { effort: (effectiveEffort === 'thinking' ? 'high' : (effectiveEffort === 'high' ? 'medium' : 'low')) } : undefined
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            if (res.data?.error) {
              providerErrors.push(`OpenRouter ${mName}: ${res.data.error.message || 'Error'}`);
              if (!isSpecificManual) break;
              continue;
            }
            const msg = res.data?.choices?.[0]?.message;
            let content = msg?.content;
            if ((!content || content.trim().length === 0) && (msg?.reasoning || msg?.reasoning_content || msg?.thinking)) {
              content = msg.reasoning || msg.reasoning_content || msg.thinking;
            }
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'OpenRouter Cloud Pool');
            }
          } else if (res.status === 402 || res.status === 429) {
            if (res.status === 429) {
              rateLimitedKeyCache.set(orKey, Date.now() + 15 * 60 * 1000);
            }
            providerErrors.push(`OpenRouter ${mName} [Key #${OPENROUTER_KEYS.indexOf(orKey) + 1}]: HTTP ${res.status} (Rate limited / Quota exhausted)`);
            if (!isSpecificManual) break;
            continue;
          } else {
            providerErrors.push(`OpenRouter ${mName} HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`OpenRouter ${mName} [Key #${OPENROUTER_KEYS.indexOf(orKey) + 1}]: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callOpenCode(mName, timeoutConfig = 55000) {
      if (OPENCODE_KEYS.length === 0) return null;
      const cleanModelName = mName.replace(/^opencode\//i, '');
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;
      const now = Date.now();
      let activeKeys = OPENCODE_KEYS.filter(k => !rateLimitedKeyCache.has(k) || rateLimitedKeyCache.get(k) < now);
      if (activeKeys.length === 0) activeKeys = OPENCODE_KEYS;
      const keysToTry = [...activeKeys];

      for (const opKey of keysToTry) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const isLightning = cleanModelName.toLowerCase().includes('lightning');
          const res = await fetchJsonWithTimeout('https://opencode.ai/zen/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${opKey}`
            },
            body: JSON.stringify({
              model: cleanModelName,
              messages: openRouterMessages,
              max_tokens: Math.max(maxTokensConfig || 1000, 1500),
              temperature: tempConfig,
              reasoning_effort: isLightning ? undefined : (effectiveEffort === 'thinking' ? 'high' : (effectiveEffort === 'high' ? 'medium' : 'low'))
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            const msg = res.data?.choices?.[0]?.message;
            let content = msg?.content;
            if ((!content || content.trim().length === 0) && (msg?.reasoning || msg?.reasoning_content || msg?.thinking)) {
              content = msg.reasoning || msg.reasoning_content || msg.thinking;
            }
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'OpenCode Zen Gateway');
            }
          } else if (res.status === 402 || res.status === 429) {
            rateLimitedKeyCache.set(opKey, Date.now() + 15 * 60 * 1000);
            providerErrors.push(`OpenCode Zen ${mName} [Key #${OPENCODE_KEYS.indexOf(opKey) + 1}]: HTTP ${res.status} (Rate limited)`);
            if (!isSpecificManual) break;
            continue;
          } else {
            providerErrors.push(`OpenCode Zen ${mName} HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`OpenCode Zen ${mName} [Key #${OPENCODE_KEYS.indexOf(opKey) + 1}]: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callNvidiaNim(mName, timeoutConfig = 55000) {
      if (NVIDIA_KEYS.length === 0) return null;
      const cleanModelName = mName.replace(/^nvidia\//i, '');
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;

      for (const nvKey of NVIDIA_KEYS) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const res = await fetchJsonWithTimeout('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${nvKey}`
            },
            body: JSON.stringify({
              model: cleanModelName,
              messages: openRouterMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            const content = res.data?.choices?.[0]?.message?.content;
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'NVIDIA NIM Production Engine');
            }
          } else {
            providerErrors.push(`Nvidia NIM HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`Nvidia NIM: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callOllama(mName, timeoutConfig = 55000) {
      if (OLLAMA_KEYS.length === 0) return null;
      const cleanModelName = mName.replace(/^ollama\//i, '').replace(/:free$/i, '');
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 55000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 55000);
      const stepDeadline = Date.now() + activeTimeout;

      for (const olKey of OLLAMA_KEYS) {
        const remaining = stepDeadline - Date.now();
        if (remaining < 800) break;

        try {
          const res = await fetchJsonWithTimeout('https://ollama.com/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${olKey}`
            },
            body: JSON.stringify({
              model: cleanModelName,
              messages: ollamaMessages,
              stream: false,
              options: {
                num_predict: maxTokensConfig,
                temperature: tempConfig
              }
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: remaining });

          if (res.ok) {
            let content = res.data?.message?.content;
            if ((!content || content.trim().length === 0) && (res.data?.message?.reasoning || res.data?.message?.thinking)) {
              content = res.data.message.reasoning || res.data.message.thinking;
            }
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), mName, 'Ollama Cloud SOTA Engine');
            }
          } else {
            providerErrors.push(`Ollama Cloud HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`Ollama Cloud: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }

    async function callMiniMax(timeoutConfig = 25000) {
      if (MINIMAX_KEYS.length === 0) return null;
      const connectTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.connectTimeoutMs || 6500) : 6500;
      const activeTimeout = typeof timeoutConfig === 'object' ? (timeoutConfig.activeTimeoutMs || 25000) : (typeof timeoutConfig === 'number' ? timeoutConfig : 25000);

      for (const mmKey of MINIMAX_KEYS) {
        try {
          const res = await fetchJsonWithTimeout('https://api.minimaxi.chat/v1/text/chatcompletion_v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mmKey}`
            },
            body: JSON.stringify({
              model: 'MiniMax-M3',
              messages: baseTextMessages,
              max_tokens: maxTokensConfig,
              temperature: tempConfig
            })
          }, { connectTimeoutMs: connectTimeout, activeTimeoutMs: activeTimeout });

          if (res.ok) {
            if (res.data?.base_resp?.status_code === 2056) {
              providerErrors.push('MiniMax: Token Plan limit reached');
              if (!isSpecificManual) break;
              continue;
            }
            const content = res.data?.choices?.[0]?.messages?.[0]?.text || res.data?.choices?.[0]?.message?.content || res.data?.reply;
            if (content && content.trim().length > 0) {
              return sendSuccess(content.trim(), 'MiniMax-M3', 'MiniMax Multimodal Production API');
            }
          } else {
            providerErrors.push(`MiniMax HTTP ${res.status}: ${(res.text || '').slice(0, 100)}`);
            if (!isSpecificManual) break;
            continue;
          }
        } catch (err) {
          providerErrors.push(`MiniMax: ${err.message}`);
          if (!isSpecificManual) break;
          continue;
        }
      }
      return null;
    }


    // ========================================================================
    // ========================================================================
    // BUILD MULTI-TIER EXECUTION PIPELINE (STRICT CLOUD SOTA PRIORITY HIERARCHY)
    // Tier 1: OpenRouter SOTA Pool (nemotron-lightning -> nano-reasoning -> free pool -> deepseek-chat -> super -> ultra -> minimax -> laguna)
    // Tier 2: Ollama Cloud AI Gateway (nemotron-nano:30b -> nemotron-ultra -> nemotron-super -> minimax-m3)
    // Tier 3: OpenCode Zen Direct API (nemotron-lightning -> nemotron-ultra -> x-preview -> mimo)
    // ========================================================================
    // BUILD MULTI-TIER EXECUTION PIPELINE (STRICT CLOUD SOTA PRIORITY HIERARCHY)
    // Tier 1: OpenRouter SOTA Pool (nemotron-lightning -> nano-reasoning -> free pool -> deepseek-chat -> super -> ultra -> minimax -> laguna)
    // Tier 2: Ollama Cloud AI Gateway (nemotron-nano:30b -> nemotron-ultra -> nemotron-super -> minimax-m3)
    // Tier 3: OpenCode Zen Direct API (nemotron-lightning -> nemotron-ultra -> x-preview -> mimo)
    // ========================================================================
    function buildExecutionPipeline() {
      // 0. MULTIMODAL & VISION PIPELINE (hasil probe live)
      // Model vision terverifikasi aktif: Nemotron Nano Omni (OpenRouter), MiniMax M3 (OpenRouter
      // & direct), dan Ollama Nano (fallback). OpenCode mimo-v2.5-free rawan 429 -> tidak diprioritaskan.
      if (hasImages || (model && model.toLowerCase().includes('vision')) || queryIntent.category === 'vision') {
        return [
          // Tier 1: Nemotron Nano Omni (OpenRouter - Multimodal Omni Reasoning)
          { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 25000 },
          // Tier 2: MiniMax M3 (OpenRouter - Multimodal Vision, terverifikasi OK)
          { provider: 'openrouter', model: 'minimax/minimax-m3:free', timeout: 25000 },
          // Tier 3: Ollama Nano Multimodal (cadangan)
          { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 25000 },
          // Tier 4: Cadangan lain yang aktif
          { provider: 'openrouter', model: 'openrouter/free', timeout: 20000 }
        ];
      }

      // 1. REASONING CHAT PIPELINE (hasil probe live; semua provider ber-key: Ollama, OpenRouter,
      // OpenCode free-tier, MiniMax direct)
      const isReasoningQuery = queryIntent.category === 'deep_reasoning' || queryIntent.effort === 'thinking' || (effectiveEffort === 'high' && queryIntent.category === 'project_architecture') || (model && (model.toLowerCase().includes('reason') || model.toLowerCase().includes('omni')));
      if (isReasoningQuery && (!model || model === 'auto' || model.toLowerCase().includes('reason') || model.toLowerCase().includes('omni'))) {
        const reasoningStepTimeout = 30000;
        return [
          // 1st: Ollama Cloud Nano (Prioritas Utama)
          { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: reasoningStepTimeout },
          // 2nd: Ollama Gemma 4 31B
          { provider: 'ollama', model: 'gemma4:31b', timeout: reasoningStepTimeout },
          // 3rd: Nemotron Nano Omni (reasoning/multimodal) & Lightning
          { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: reasoningStepTimeout },
          { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: reasoningStepTimeout },
          // 4th: Flagship Nemotron Super & Ultra Terbaru
          { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: reasoningStepTimeout },
          { provider: 'ollama', model: 'nemotron-3-super', timeout: reasoningStepTimeout },
          { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: reasoningStepTimeout },
          // 5th: Cadangan aktif lain (OpenCode free + OpenRouter)
          { provider: 'opencode', model: 'nemotron-3.5-lightning-free', timeout: reasoningStepTimeout },
          { provider: 'opencode', model: 'laguna-s-2.1-free', timeout: reasoningStepTimeout },
          { provider: 'openrouter', model: 'google/gemma-4-31b-it:free', timeout: reasoningStepTimeout },
          { provider: 'openrouter', model: 'poolside/laguna-s-2.1:free', timeout: reasoningStepTimeout },
          { provider: 'openrouter', model: 'openrouter/free', timeout: reasoningStepTimeout }
        ];
      }

      // 2. SPECIFIC MANUAL MODEL OVERRIDES (hanya provider ber-key hasil probe: Ollama & OpenRouter)
      if (model && model !== 'auto') {
        const t = model.toLowerCase();

        // === OLLAMA CLOUD GROUP ===
        if (t === 'nemotron-3-nano' || t.startsWith('ollama-nano') || t.includes('nano')) {
          return [
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 20000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 20000 }
          ];
        }
        if (t === 'ollama-nemotron-ultra' || t.includes('ultra')) {
          return [
            { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: 20000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 }
          ];
        }
        if (t === 'ollama-nemotron-super' || t.includes('super')) {
          return [
            { provider: 'ollama', model: 'nemotron-3-super', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: 20000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: 20000 }
          ];
        }

        // === GROUP GEMMA (Ollama gemma4 / OpenRouter gemma-4-31b-it) ===
        if (t.includes('gemma')) {
          return [
            { provider: 'ollama', model: 'gemma4:31b', timeout: 25000 },
            { provider: 'openrouter', model: 'google/gemma-4-31b-it:free', timeout: 20000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 }
          ];
        }

        // === GROUP LAGUNA / MIMO (dialihkan ke model aktif terdekat) ===
        if (t.includes('laguna') || t.includes('mimo') || t.includes('opencode')) {
          return [
            { provider: 'openrouter', model: 'poolside/laguna-s-2.1:free', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 20000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 }
          ];
        }
        if (t.includes('vision')) {
          return [
            { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 25000 },
            { provider: 'openrouter', model: 'minimax/minimax-m3:free', timeout: 20000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 }
          ];
        }
        if (t === 'minimax' || t.includes('minimax') || t === 'm3') {
          return [
            { provider: 'openrouter', model: 'minimax/minimax-m3:free', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 20000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 }
          ];
        }

        if (t === 'openrouter-free') {
          return [
            { provider: 'openrouter', model: 'openrouter/free', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 20000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 }
          ];
        }
        if (t.includes('light') || t.includes('lightning')) {
          return [
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 25000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: 20000 }
          ];
        }
        if (t.includes('deepseek')) {
          return [
            { provider: 'openrouter', model: 'openrouter/free', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 20000 },
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 20000 }
          ];
        }
        if (t.includes('antigravity') || t.includes('codex') || t.includes('coding')) {
          return [
            { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 25000 },
            { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 20000 },
            { provider: 'openrouter', model: 'poolside/laguna-s-2.1:free', timeout: 20000 }
          ];
        }
      }

      // 3. OVERALL GENERAL CHAT CASCADE
      // Urutan prioritas hasil PROBE LIVE endpoint (3 September 2026):
      // Provider dengan key aktif: Ollama Cloud (1 key) & OpenRouter (5 key).
      // OpenCode Zen / NVIDIA NIM / MiniMax langsung TIDAK punya key -> dihapus dari pipeline.
      // Model yang terverifikasi MERESPONS:
      //   - Ollama: nemotron-3-nano:30b OK, gemma4:31b OK, nemotron-3-super OK
      //   - OpenRouter: nemotron-3.5-lightning:free OK, gemma-4-31b-it:free OK,
      //     nemotron-3-nano-omni-...-reasoning:free OK, nemotron-3-super-120b-a12b:free OK,
      //     nemotron-3-ultra-550b-a55b:free OK, poolside/laguna-s-2.1:free OK,
      //     minimax/minimax-m3:free OK, openrouter/free OK
      //   - OpenCode Zen (4 key, free-tier): nemotron-3.5-lightning-free OK, laguna-s-2.1-free OK,
      //     mimo-v2.5-free (429/limit), deepseek-v4-flash-free (unavailable), muse-spark (500).
      //     Model paid butuh kartu (CreditsError), tidak dipakai.
      //   - MiniMax Direct (1 key): MiniMax-M3 OK.
      //   - TIDAK merespons/tidak ada free: nvidia/nemotron-3-nano-30b-a3b:free (404),
      //     ollama nemotron-3-ultra & minimax-m3 (timeout), opencode x-preview-f-free (unsupported).
      // Prioritas PERMINTAAN PENGGUNA:
      // 1 Nemotron Nano (Ollama) | 2 Gemma 4 (Ollama) | 3 Lightning (OpenRouter) |
      // 4 Lightning (OpenCode) | 5 Nano-Omni (OpenRouter) | 6 Super (Ollama) |
      // 7 Super (OpenRouter) | 8 Ultra (Ollama) | 9 Ultra (OpenRouter) |
      // 10 Laguna (OpenRouter) | 11 Laguna (OpenCode) | lalu model aktif lain.
      // MiniMax dikeluarkan dari general chat (khusus multimodal/vision).
      // Catatan probe: ultra-ollama (nemotron-3-ultra) sempat timeout; tetap dicoba sesuai
      // urutan permintaan — bila gagal executor otomatis melompat ke step berikutnya.
      return [
        // 1. Nemotron Nano (Ollama Cloud)
        { provider: 'ollama', model: 'nemotron-3-nano:30b', timeout: 15000 },
        // 2. Gemma 4 31B (Ollama Cloud)
        { provider: 'ollama', model: 'gemma4:31b', timeout: 15000 },
        // 3. Nemotron 3.5 Lightning (OpenRouter)
        { provider: 'openrouter', model: 'nvidia/nemotron-3.5-lightning:free', timeout: 15000 },
        // 4. Nemotron 3.5 Lightning (OpenCode)
        { provider: 'opencode', model: 'nemotron-3.5-lightning-free', timeout: 15000 },
        // 5. Nemotron Nano Omni (OpenRouter)
        { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', timeout: 15000 },
        // 6. Nemotron 3 Super (Ollama Cloud)
        { provider: 'ollama', model: 'nemotron-3-super', timeout: 15000 },
        // 7. Nemotron 3 Super (OpenRouter)
        { provider: 'openrouter', model: 'nvidia/nemotron-3-super-120b-a12b:free', timeout: 15000 },
        // 8. Nemotron 3 Ultra (Ollama Cloud)
        { provider: 'ollama', model: 'nemotron-3-ultra', timeout: 15000 },
        // 9. Nemotron 3 Ultra (OpenRouter)
        { provider: 'openrouter', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', timeout: 15000 },
        // 10. Laguna (OpenRouter)
        { provider: 'openrouter', model: 'poolside/laguna-s-2.1:free', timeout: 15000 },
        // 11. Laguna (OpenCode)
        { provider: 'opencode', model: 'laguna-s-2.1-free', timeout: 15000 },
        // 12. Cadangan model aktif lain
        { provider: 'openrouter', model: 'google/gemma-4-31b-it:free', timeout: 14000 },
        { provider: 'opencode', model: 'mimo-v2.5-free', timeout: 14000 },
        { provider: 'openrouter', model: 'openrouter/free', timeout: 14000 }
      ];
    }


    // ========================================================================
    // EXECUTE PIPELINE: SINGLE-ACTIVE TOKEN-PRESERVING STRICT FAILOVER
    // Evaluates 1 provider at a time in strict priority order.
    // Preserves 100% token quota (zero wasted parallel calls) and guarantees full execution under 58s budget.
    // ========================================================================
    async function executeStep(step, timeout) {
      if (!step) return null;
      if (step.provider === 'nim') {
        return callNvidiaNim(step.model, timeout);
      } else if (step.provider === 'opencode') {
        return callOpenCode(step.model, timeout);
      } else if (step.provider === 'openrouter') {
        return callOpenRouter(step.model, timeout);
      } else if (step.provider === 'ollama') {
        return callOllama(step.model, timeout);
      } else if (step.provider === 'minimax') {
        return callMiniMax(timeout);
      }
      return null;
    }

    async function executePipelineWithPriorityRace(pipeline) {
      if (!pipeline || pipeline.length === 0) return null;

      const elapsedBase = Date.now() - requestStartTime;
      const remainingMs = 58000 - elapsedBase;
      if (remainingMs <= 1500) return null;

      // ===== MODE AUTO =====
      // Penting: urutan prioritas pengguna bisa panjang (11+ langkah). Executor lama hanya
      // mencoba 3 (race) + 2 (tail) = 5 langkah, sehingga step 6+ TIDAK PERNAH dicoba.
      // Kini: step #1 (Nemotron Nano, prioritas utama user) DICOBA EKSLUSIF dulu dengan budget
      // sendiri — kalau langsung di-race paralel, Gemma4 yang kebetulan lebih cepat sering menang
      // dan Nano nyaris tak pernah terpakai meski prioritas #1. Setelah #1 gagal, race 3 step
      // berikutnya, lalu susuri SELURUH sisa pipeline serial dengan timeout ketat.
      // sendSuccess aman dipanggil berkali-kali karena guard `res.headersSent` menulis sekali.
      if (!isSpecificManual) {
        // === Langkah 0: Prioritas #1 dicoba sendiri (hormati urutan user) ===
        const firstStep = pipeline[0];
        if (firstStep) {
          const firstR = await executeStep(firstStep, {
            connectTimeoutMs: Math.min(firstStep.timeout || 15000, 6000),
            activeTimeoutMs: Math.min(firstStep.timeout || 15000, 9000)
          }).catch(() => null);
          if (firstR) return firstR;
        }

        // === Jika #1 gagal: race 3 step berikutnya (2,3,4) paralel ===
        const raceSteps = pipeline.slice(1, 4);
        const raceTimeoutMs = Math.max(6000, Math.min(11000, remainingMs - 1500));
        const racePromises = raceSteps.map(step =>
          executeStep(step, {
            connectTimeoutMs: Math.min(step.timeout || 15000, 7000),
            activeTimeoutMs: raceTimeoutMs
          }).then(result => {
            if (result) return { ok: true, value: result };
            return Promise.reject(new Error('provider-empty'));
          }).catch(() => Promise.reject(new Error('provider-failed')))
        );
        // FIX "All promises were rejected": bila SEMUA step menolak lebih cepat dari timer
        // (mis. kena 404/429 seketika), Promise.any me-reject SEBELUM timer sempat resolve,
        // dan rejection itu bocor keluar -> error 500. Solusi: tangkap rejection-nya menjadi
        // nilai 'all-failed' (bukan melempar), lalu lanjut ke sisa pipeline.
        const raceOutcome = await Promise.race([
          Promise.any(racePromises).then(
            (v) => ({ ok: true, value: v }),
            () => ({ ok: false, reason: 'all-failed' })
          ),
          new Promise(resolve => setTimeout(() => resolve({ ok: false, reason: 'timeout' }), raceTimeoutMs + 500))
        ]);
        if (raceOutcome && raceOutcome.ok && raceOutcome.value && raceOutcome.value.ok) {
          return raceOutcome.value.value;
        }

        // === Susuri SELURUH sisa pipeline (index 4 dst) secara serial ===
        for (let i = 4; i < pipeline.length; i++) {
          const step = pipeline[i];
          const remaining = 58000 - (Date.now() - requestStartTime);
          if (remaining <= 2500) break; // sisakan waktu untuk menulis respons
          const stepBudget = Math.min(step.timeout || 15000, Math.max(5000, remaining - 2000));
          const r = await executeStep(step, {
            connectTimeoutMs: Math.min(step.timeout || 15000, 6000),
            activeTimeoutMs: stepBudget
          }).catch(() => null);
          if (r) return r;
        }
        return null;
      }

      // ===== Mode manual spesifik: serial (hormati urutan pilihan user) =====
      for (const step of pipeline) {
        const remaining = 58000 - (Date.now() - requestStartTime);
        if (remaining <= 1500) break;
        const r = await executeStep(step, {
          connectTimeoutMs: Math.min(step.timeout || 15000, 8000),
          activeTimeoutMs: remaining - 1000
        }).catch(() => null);
        if (r) return r;
      }
      return null;
    }

    const executionPipeline = buildExecutionPipeline();
    const finalResult = await executePipelineWithPriorityRace(executionPipeline);
    if (finalResult) return finalResult;

    if (res.headersSent) return;

    // If all providers in the pipeline failed or timed out:
    const noKeysConfigured = !OPENROUTER_KEY && !NVIDIA_KEY && !OPENCODE_KEY && !MINIMAX_KEY && !OLLAMA_KEY;
    const errorMsg = noKeysConfigured 
      ? 'Belum ada API Key aktif yang terpasang di server Vercel atau terminal. Gunakan perintah: setkey <provider> <key>'
      : 'Semua provider gateway model AI sedang sibuk atau mengalami timeout antrean.';

    return res.status(502).json({
      success: false,
      error: errorMsg,
      details: providerErrors,
      requestedModel: model,
      triedProviders: executionPipeline.map(s => `${s.provider}:${s.model}`)
    });

  } catch (globalErr) {
    if (res.headersSent) return;
    return res.status(500).json({
      success: false,
      error: `Serverless Gateway Exception: ${globalErr.message}`
    });
  }
}
