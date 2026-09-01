# Portofolio Profesional & AI Developer Lab — Rafly Firmansyah

Landing page portofolio profesional dan _Developer Lab_ interaktif untuk **Rafly Firmansyah** ([@Raflyf](https://github.com/Raflyf)) — Mahasiswa S1 Informatika (UBSI), Analis Program Terstandar BNSP, dan Software Developer yang berfokus pada riset _Natural Language Processing_ (NLP), _Computer Vision_, _Machine Learning_, dan arsitektur web modern.

Dibangun dengan **React 19** + **Vite**, **Tailwind CSS v4**, **React Router**, **Chart.js**, **Lenis**, **Framer Motion**, dan **ReactMarkdown**, dengan backend **Vercel Serverless Gateway** dan **Supabase PostgreSQL**. Dirancang untuk performa tinggi (Dashboard di-lazy-load dan di-code-split), aksesibilitas **WCAG 2.2 AA**, serta keamanan data komprehensif (RLS privat, sesi token admin, fail-closed serverless).

> Versi vanilla HTML/CSS/JS dari situs ini diarsipkan di direktori [`archive_v1/`](archive_v1/) sebagai referensi sejarah; versi produksi aktif adalah React.

---

## Showcase Proyek Unggulan

Situs web ini menyajikan dokumentasi mendalam, demonstrasi interaktif, dan arsitektur teknis dari proyek-proyek unggulan yang dikembangkan:

1. **OpenPlagiarismChecker**
   - Sistem deteksi kemiripan dokumen akademik berbasis _Dual-Engine_: _Exact Match_ (5-Gram Shingling) dan _Semantic Similarity_ (SBERT / Sentence-Transformers).
   - Dilengkapi _layout-aware PDF extractor_, pencarian vektor cepat berbasis FAISS, serta privasi penuh (_zero external data transmission_).

2. **Spam-Email Classifier & Evaluator**
   - Platform riset komparasi algoritma _Complement Naive Bayes_ (CNB) dan _XGBoost_ dalam menangani fenomena _Concept Drift_ pada email modern.
   - Fitur _Dynamic Class Balancing_ dengan rasio adaptif serta visualisasi metrik evaluasi (_Confusion Matrix_, _Precision_, _Recall_, _F1-Score_).

3. **laser_pointer_PPT (Remote Presenter)**
   - Sistem kendali presentasi jarak jauh yang mengubah sensor _gyroscope_ dan _accelerometer_ smartphone menjadi virtual laser pointer dan slide navigator via WebSocket real-time.

4. **FotoKitaBlur (Privacy Face & Gesture Obfuscation)**
   - Aplikasi perlindungan privasi visual yang mendeteksi wajah serta gesture _V-sign_ (peace sign) secara otomatis menggunakan MediaPipe dan OpenCV untuk mencegah pencurian biometrik sidik jari.

5. **Web Portofolio & AI Developer Lab**
   - Landing page React modern dengan terminal interaktif, engine RAG memori jangka panjang via Supabase PostgreSQL, dan dashboard telemetri real-time.

---

## Fitur Utama & Arsitektur Sistem

### 1. Terminal Developer Lab & AI Assistant Gateway

- **Multi-Model AI Gateway:** Terintegrasi dengan berbagai penyedia API model AI publik gratis (_Free Tier API Pool_) melalui mekanisme _smart failover cascade_ yang tangguh dan otomatis.
- **Dynamic Intent & Adaptive Effort:** Sistem secara cerdas mengklasifikasikan kompleksitas pertanyaan pengguna dan menyesuaikan kedalaman penalaran (_Reasoning Effort_: Low, Medium, High, Thinking CoT) serta anggaran token komputasi secara dinamis.
- **RAG & Real-Time Context:** Menggabungkan pencarian web real-time, pembacaan repositori GitHub resmi secara live, dan memori jangka panjang (_Long-Term Memory_) berbasis Supabase PostgreSQL.
- **Multimodal & Ingesti Dokumen:** Mendukung analisis visual gambar serta ekstraksi dokumen teks dan PDF multi-halaman langsung melalui antarmuka terminal.
- **Serverless Security Shield (`api/chat.js`):** Isolasi kunci API di sisi server dengan proteksi SSRF (_Server-Side Request Forgery_), pembatasan laju kueri (_Rate Limiting_), sanitasi masukan, dan pemenuhan standar CORS allowlist.

### 2. Panel Admin Monitoring & Telemetri Analitik (`/dashboard`)

- **Autentikasi Kriptografis SHA-256 + Session Token:** Proteksi akses panel monitoring dengan verifikasi Master PIN _Web Crypto SHA-256 + Salt_, _brute-force lockout_, dan token sesi acak yang divalidasi serverless.
- **Visualisasi Real-Time (Chart.js):** Dashboard interaktif menyajikan tren kunjungan, distribusi perangkat, kategori interaksi, leaderboard perintah CLI, dan metrik resolusi gateway AI.
- **Baca Privat via `/api/dashboard-data`:** Telemetri dan memori AI dibaca hanya melalui endpoint serverless dengan `SUPABASE_SERVICE_ROLE_KEY` dan token sesi — tidak ada akses Supabase langsung dari browser (RLS privat, anon SELECT dicabut).
- **Supabase Time-Series Backend:** Penyimpanan log aktivitas asinkron dengan _Row Level Security_ (RLS) dan indeks komposit berkecepatan tinggi.
- **Ekspor Data Aman:** Fitur ekspor berkas log aktivitas ke format CSV (dengan proteksi _CSV Formula Injection_) dan JSON.

### 3. Sistem Desain, Aksesibilitas, & Performa

- **iOS Liquid Glass Design System:** Token material kaca (glass background, blur, border specular, shadow) diterapkan konsisten pada seluruh permukaan (dark/light/mobile) di `src/index.css`.
- **Always-On Motion:** Animasi scroll reveal, marquee, parallax, dan transisi Framer Motion tetap aktif penuh; Lenis menyediakan _momentum inertia smooth wheel_.
- **Responsive & Mobile Viewport:** Penyesuaian viewport dinamis (`100dvh`) dan tata letak adaptif untuk perangkat seluler.
- **Code-Splitting:** Dashboard (Chart.js) di-lazy-load dengan `React.lazy` sehingga bundle landing tetap ringan (index ~687 kB, chunk Dashboard ~257 kB).
- **SEO Semantik & Favicon Suite:** Struktur data Schema.org JSON-LD lengkap, meta tag OpenGraph, serta paket favicon multi-resolusi untuk crawler mesin pencari.

---

## Struktur Repositori

```
.
├── index.html                   # Entry point Vite (SEO meta, JSON-LD, CSP, favicon)
├── src/
│   ├── main.jsx                 # React root + TerminalProvider
│   ├── App.jsx                  # Router, navbar, Lenis, FAB, theme toggle
│   ├── index.css                # Tailwind v4 + design tokens Liquid Glass
│   ├── data.js                  # Data repositori proyek, sertifikasi, timeline
│   ├── lib/
│   │   ├── telemetry.js         # Client telemetri asinkron (VITE_ env vars)
│   │   └── utils.js             # Util (cn, dsb.)
│   ├── context/
│   │   └── TerminalContext.jsx  # State global terminal AI
│   ├── pages/
│   │   ├── Home.jsx             # Landing page (semua section)
│   │   └── Dashboard.jsx        # Admin observability (lazy-loaded)
│   └── components/
│       ├── layout/Footer.jsx
│       ├── sections/            # About, Skills, Projects, Certificates, Timeline, Contact
│       ├── terminal/TerminalAI.jsx
│       └── ui/                  # HorizonHero, ScrollStoryline
├── api/
│   ├── chat.js                  # Vercel Serverless Multi-Provider AI Gateway
│   ├── admin-otp.js             # Serverless PIN/OTP auth (RPC + service role)
│   └── dashboard-data.js        # Serverless read telemetry privat (session token)
├── database/
│   └── supabase_schema.sql      # Skema DDL + RLS + SECURITY DEFINER RPC
├── public/                      # Favicons, og-cover, site.webmanifest, certificates/
├── archive_v1/                  # Arsitektur vanilla HTML/CSS/JS (referensi sejarah)
├── .github/workflows/deploy.yml # CI/CD GitHub Pages
├── vercel.json                  # Rewrites SPA, headers keamanan, maxDuration
├── netlify.toml                 # Build `npm run build`, publish `dist`
├── .env.example                 # Template variabel lingkungan (client + server)
├── DOCUMENTATION.md             # Riwayat arsitektur & changelog lengkap
├── Jalankan_Lokal.bat           # Skrip launcher server lokal Windows
└── README.md                    # Dokumentasi utama repositori
```

---

## Panduan Menjalankan Secara Lokal

Proyek ini adalah aplikasi React (Vite). Jalankan dengan Node.js:

```bash
# Install dependencies
npm install

# Development server (hot reload) — http://localhost:5173
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Opsi: Menguji Serverless API bersama Vite

```bash
# Menjalankan frontend + Serverless Functions API (Vercel)
npx vercel dev
```

---

## Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env.local` untuk pengembangan lokal (file ini tidak pernah di-commit, dilindungi `.gitignore`).

### Variabel Client (prefix `VITE_` — masuk ke bundle browser)

| Nama Variabel            | Deskripsi                                                                   |
| ------------------------ | --------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Endpoint REST project Supabase (telemetri & RAG)                            |
| `VITE_SUPABASE_ANON_KEY` | Anonymous client key Supabase (RLS membatasi hanya INSERT telemetri/memori) |

### Variabel Server (hanya di Vercel / Netlify dashboard, jangan pernah di client)

| Nama Variabel                                                                               | Deskripsi                                                                                                                                 |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`                                                                              | Endpoint REST project Supabase (serverless)                                                                                               |
| `SUPABASE_ANON_KEY`                                                                         | Anonymous key untuk operasi RPC publik serverless                                                                                         |
| `SUPABASE_SERVICE_ROLE_KEY`                                                                 | **WAJIB** — service role key untuk baca privat telemetri/memori dan tulis `admin_auth_config` (OTP/PIN). Jangan pernah diekspos ke client |
| `AI_KEYS`                                                                                   | (Opsional) Daftar kunci API terpadu; server mengklasifikasikan otomatis per provider (OpenRouter, OpenCode, Ollama, NVIDIA, MiniMax)      |
| `OPENROUTER_API_KEYS`                                                                       | Kumpulan kunci OpenRouter (dipisahkan koma untuk rotasi)                                                                                  |
| `OPENCODE_API_KEYS`                                                                         | Kumpulan kunci OpenCode cadangan                                                                                                          |
| `OLLAMA_CLOUD_API_KEY`                                                                      | Kunci Ollama Cloud                                                                                                                        |
| `NVIDIA_API_KEYS`                                                                           | Kumpulan kunci NVIDIA NIM                                                                                                                 |
| `MINIMAX_API_KEY`                                                                           | Kunci MiniMax                                                                                                                             |
| `EMAILJS_SERVICE_ID` / `EMAILJS_TEMPLATE_ID` / `EMAILJS_PUBLIC_KEY` / `EMAILJS_PRIVATE_KEY` | EmailJS untuk notifikasi OTP                                                                                                              |
| `RESEND_API_KEY`                                                                            | Kunci API Resend (alternatif pengiriman email OTP)                                                                                        |
| `ALLOWED_ORIGIN`                                                                            | Origin resmi yang diizinkan pada CORS allowlist (contoh `https://raflyfirmansyah-portofolio.vercel.app`)                                  |

---

## Lisensi & Hak Cipta

Proyek ini dirilis di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).
Dikembangkan secara mandiri oleh **Rafly Firmansyah**.
