# Portofolio Profesional & AI Developer Lab — Rafly Firmansyah

Landing page portofolio profesional dan *Developer Lab* interaktif untuk **Rafly Firmansyah** ([@Raflyf](https://github.com/Raflyf)) — Mahasiswa S1 Informatika (UBSI), Analis Program Terstandar BNSP, dan Software Developer yang berfokus pada riset *Natural Language Processing* (NLP), *Computer Vision*, *Machine Learning*, dan arsitektur web modern.

Dibangun dengan **HTML5 Semantik**, **Modern Vanilla CSS (OKLCH + Motion Tokens)**, **Modular JavaScript (ES6+ Modules)**, dan **Vercel Serverless Gateway**. Dirancang tanpa dependensi framework berat untuk mencapai performa tinggi (Skor Lighthouse 100/100), aksesibilitas **WCAG 2.2 AA**, serta keamanan data komprehensif.

---

## Showcase Proyek Unggulan

Situs web ini menyajikan dokumentasi mendalam, demonstrasi interaktif, dan arsitektur teknis dari proyek-proyek unggulan yang dikembangkan:

1. **OpenPlagiarismChecker**
   - Sistem deteksi kemiripan dokumen akademik berbasis *Dual-Engine*: *Exact Match* (5-Gram Shingling) dan *Semantic Similarity* (SBERT / Sentence-Transformers).
   - Dilengkapi *layout-aware PDF extractor*, pencarian vektor cepat berbasis FAISS, serta privasi penuh (*zero external data transmission*).

2. **Spam-Email Classifier & Evaluator**
   - Platform riset komparasi algoritma *Complement Naive Bayes* (CNB) dan *XGBoost* dalam menangani fenomena *Concept Drift* pada email modern.
   - Fitur *Dynamic Class Balancing* dengan rasio adaptif serta visualisasi metrik evaluasi (*Confusion Matrix*, *Precision*, *Recall*, *F1-Score*).

3. **laser_pointer_PPT (Remote Presenter)**
   - Sistem kendali presentasi jarak jauh yang mengubah sensor *gyroscope* dan *accelerometer* smartphone menjadi virtual laser pointer dan slide navigator via WebSocket real-time.

4. **FotoKitaBlur (Privacy Face & Gesture Obfuscation)**
   - Aplikasi perlindungan privasi visual yang mendeteksi wajah serta gesture *V-sign* (peace sign) secara otomatis menggunakan MediaPipe dan OpenCV untuk mencegah pencurian biometrik sidik jari.

5. **Web Portofolio & AI Developer Lab**
   - Landing page modular Vanilla JS (<50 KB) dengan terminal interaktif multi-sesi, engine RAG memori jangka panjang via Supabase PostgreSQL, dan dashboard telemetri real-time.

---

## Fitur Utama & Arsitektur Sistem

### 1. Terminal Developer Lab & AI Assistant Gateway
- **Multi-Model AI Gateway:** Terintegrasi dengan berbagai penyedia API model AI publik gratis (*Free Tier API Pool*) melalui mekanisme *smart failover cascade* yang tangguh dan otomatis.
- **Dynamic Intent & Adaptive Effort:** Sistem secara cerdas mengklasifikasikan kompleksitas pertanyaan pengguna dan menyesuaikan kedalaman penalaran (*Reasoning Effort*: Low, Medium, High, Thinking CoT) serta anggaran token komputasi secara dinamis.
- **RAG & Real-Time Context:** Menggabungkan pencarian web real-time, pembacaan repositori GitHub resmi secara live, dan memori jangka panjang (*Long-Term Memory*) berbasis Supabase PostgreSQL.
- **Multimodal & Ingesti Dokumen:** Mendukung analisis visual gambar serta ekstraksi dokumen teks dan PDF multi-halaman langsung melalui antarmuka terminal.
- **Session Language Lock:** Mengunci konsistensi bahasa respons (Bahasa Indonesia / Bahasa Inggris) sepanjang sesi percakapan aktif.
- **Serverless Security Shield (`api/chat.js`):** Isolasi kunci API di sisi server dengan proteksi SSRF (*Server-Side Request Forgery*), pembatasan laju kueri (*Rate Limiting* 35 req/menit), sanitasi masukan, dan pemenuhan standar CORS.

### 2. Engine Interaksi Web Langsung Berbasis AI Agent (`window.portfolioAgent`)
- **Kontrol DOM Otomatis Berbasis Perintah AI:** Asisten AI dapat berinteraksi langsung dengan antarmuka web pengguna:
  - `Membuka Modal Proyek`: Menampilkan spesifikasi arsitektur proyek terkait.
  - `Membuka Kredensial Sertifikat`: Menampilkan pratinjau dokumen sertifikasi resmi.
  - `Navigasi Presisi`: Melakukan *smooth scroll* dinamis ke bagian situs web yang dituju (`#projects`, `#skills`, `#certificates`, `#about`, `#contact`, `#benchmarks`).
  - `Pengisian Formulir Kontak`: Mengisi kolom formulir diskusi secara otomatis sesuai topik pembicaraan.

### 3. Panel Admin Monitoring & Telemetri Analitik (`dashboard.html`)
- **Autentikasi Kriptografis SHA-256:** Proteksi akses panel monitoring dengan verifikasi Master PIN *Web Crypto SHA-256 + Salt* dan *brute-force lockout*.
- **Visualisasi Real-Time (Chart.js):** Dashboard interaktif menyajikan tren kunjungan, distribusi perangkat, kategori interaksi, leaderboard perintah CLI, dan metrik resolusi gateway AI.
- **Supabase Time-Series Backend:** Penyimpanan log aktivitas asinkron dengan *Row Level Security* (RLS) dan indeks komposit berkecepatan tinggi.
- **Ekspor Data Aman:** Fitur ekspor berkas log aktivitas ke format CSV (dengan proteksi *CSV Formula Injection*) dan JSON.

### 4. Sistem Desain, Aksesibilitas, & Performa
- **Sistem Warna OKLCH:** Dukungan tema gelap (*Deep Obsidian*) dan terang (*Crisp Slate*) dengan rasio kontras tinggi sesuai standar WCAG 2.2 AA (≥ 7:1 untuk teks utama).
- **Responsive & Mobile Viewport:** Penyesuaian viewport dinamis (`100dvh`) pada modal terminal perangkat seluler dengan bilah pintasan horizontal yang ergonomis.
- **Inertia Smooth Scroll & Motion Tokens:** Transisi antarmuka yang halus dengan kurva fisika kubik `easeInOutCubic` yang menghormati preferensi *prefers-reduced-motion*.
- **SEO Semantik & Favicon Suite:** Struktur data Schema.org JSON-LD lengkap, meta tag OpenGraph, serta paket favicon multi-resolusi untuk crawler mesin pencari.

---

## Struktur Repositori

```
.
├── index.html                   # Halaman utama portofolio & markup semantik
├── dashboard.html               # Panel Admin Monitoring & Telemetri Analitik
├── preview.html                 # Penampil dokumen sertifikat resolusi tinggi
├── favicon.svg                  # Logo favicon vektor monokrom
├── favicon.ico                  # Favicon multi-resolusi
├── site.webmanifest             # Web App Manifest & ikon PWA
├── robots.txt                   # Panduan perayapan search engine
├── sitemap.xml                  # Peta situs XML resmi
├── api/
│   └── chat.js                  # Vercel Serverless Multi-Provider AI Gateway
├── css/
│   ├── style.css                # Sistem desain dasar, variabel OKLCH, tipografi
│   ├── components.css           # Komponen antarmuka (Navbar, Hero, Cards, Modal, Terminal)
│   ├── dashboard.css            # Desain antarmuka panel admin analitik
│   └── transitions.css          # Motion tokens dan kurva transisi
├── js/
│   ├── data.js                  # Data repositori proyek, sertifikasi, dan riwayat
│   ├── main.js                  # Controller utama interaksi DOM & event listeners
│   ├── terminal.js              # Controller emulator CLI terminal & parser perintah
│   ├── terminal-ai.js           # Client integrasi AI, routing klien & failover
│   ├── telemetry.js             # Client tracker telemetri asinkron non-blocking
│   └── dashboard.js             # Controller analitik admin & visualisasi Chart.js
├── certificates/
│   ├── *.pdf                    # Dokumen autentik sertifikat (BNSP, MikroTik, Cisco, dll.)
│   └── images/                  # Pratinjau grafis dokumen sertifikat
├── database/
│   └── supabase_schema.sql      # Skema DDL tabel analitik, indeks komposit & RLS Supabase
├── assets/                      # Aset gambar dan ikon statis
├── .github/
│   └── workflows/
│       └── deploy.yml           # Otomasi deployment CI/CD ke GitHub Pages
├── vercel.json                  # Konfigurasi deployment & header keamanan Vercel
├── netlify.toml                 # Konfigurasi deployment Netlify
├── DOCUMENTATION.md             # Riwayat arsitektur, catatan audit & changelog lengkap
├── Jalankan_Lokal.bat           # Skrip launcher server lokal Windows
└── README.md                    # Dokumentasi utama repositori
```

---

## Panduan Menjalankan Secara Lokal

Karena proyek ini menggunakan ES6 JavaScript Modules murni, jalankan menggunakan server web lokal:

### Opsi 1: Menggunakan Script Otomatis (Windows)
Jalankan berkas `Jalankan_Lokal.bat` dengan klik ganda.

### Opsi 2: Menggunakan Python
```bash
python -m http.server 3000
```
Buka peramban di `http://localhost:3000`.

### Opsi 3: Menggunakan Node.js / Vercel CLI (Direkomendasikan untuk uji Serverless API)
```bash
# Menjalankan frontend statis
npx serve .

# ATAU menjalankan lengkap bersama Serverless Functions API
npx vercel dev
```

---

## Konfigurasi Environment Variables (Vercel)

Untuk mengaktifkan fitur AI Gateway dan Telemetri Analitik secara penuh di lingkungan produksi, tambahkan variabel lingkungan berikut pada dashboard Vercel (**Project Settings -> Environment Variables**):
> **Audit Fix (v10.544.0):** `SUPABASE_SERVICE_ROLE_KEY` **wajib** diisi. Sejak rilis ini, seluruh penulisan tabel `admin_auth_config` (OTP & reset PIN) hanya dilakukan serverless function `/api/admin-otp` menggunakan service role key — tabel tidak lagi memiliki policy anon apa pun. Tanpa key ini, fitur OTP dan PIN-reset tidak berfungsi.

| Nama Variabel | Deskripsi |
|---|---|
| `OPENROUTER_API_KEY` | Kunci API gratisan utama untuk model AI cloud publik (OpenRouter) |
| `OPENROUTER_API_KEYS` | Kumpulan kunci API gratisan OpenRouter (dipisahkan koma untuk rotasi otomatis) |
| `OPENCODE_API_KEY` | Kunci API penyedia model cloud sekunder |
| `OPENCODE_API_KEYS` | Kumpulan kunci API sekunder cadangan |
| `NVIDIA_API_KEY` | Kunci API penyedia model evaluasi tambahan |
| `MINIMAX_API_KEY` | Kunci API penyedia model multimodal/vision |
| `OLLAMA_CLOUD_API_KEY` | Kunci API penyedia model inferensi cloud |
| `NVIDIA_API_KEYS` | Kumpulan kunci NVIDIA NIM cadangan |
| `AI_KEYS` | (Opsional) Daftar kunci API terpadu, dipisahkan koma/baris baru; server mengklasifikasikan otomatis per provider |
| `SUPABASE_SERVICE_ROLE_KEY` | **WAJIB** — service role key server-side untuk tulis `admin_auth_config` (OTP/PIN-reset). Jangan pernah diekspos ke client |
| `EMAILJS_SERVICE_ID` | Service ID EmailJS untuk notifikasi OTP |
| `EMAILJS_TEMPLATE_ID` | Template ID EmailJS untuk notifikasi OTP |
| `EMAILJS_PUBLIC_KEY` | Public key EmailJS untuk notifikasi OTP |
| `EMAILJS_PRIVATE_KEY` | Private key EmailJS untuk notifikasi OTP |
| `RESEND_API_KEY` | Kunci API Resend (alternatif pengiriman email OTP) |
| `ALLOWED_ORIGIN` | Origin resmi yang diizinkan pada CORS allowlist (contoh `https://raflyfirmansyah-portofolio.vercel.app`) |
| `SUPABASE_URL` | Endpoint REST project Supabase (RAG & Telemetri) |
| `SUPABASE_ANON_KEY` | Anonymous client key Supabase dengan kebijakan RLS |

---

## Lisensi & Hak Cipta

Proyek ini dirilis di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).  
Dikembangkan secara mandiri oleh **Rafly Firmansyah**.
