# Portofolio Profesional & AI Developer Lab — Rafly Firmansyah

Landing page portofolio profesional dan *Developer Lab* interaktif untuk **Rafly Firmansyah** ([@Raflyf](https://github.com/Raflyf)) — Sarjana Komputer (S1 Informatika, Universitas Bina Sarana Informatika), Analis Program Terstandar BNSP, dan Software Engineer yang berfokus pada riset *Natural Language Processing* (NLP), *Machine Learning*, arsitektur backend, dan rekayasa web modern.

Aplikasi ini dibangun menggunakan **React 19**, **Vite**, **Tailwind CSS v4**, **React Router**, **Chart.js**, **Lenis Scroll**, **Framer Motion**, dan **ReactMarkdown**, dengan backend **Vercel Serverless Functions** dan **Supabase PostgreSQL**. Dirancang dengan fokus pada aksesibilitas **WCAG 2.2 AA**, efisiensi bundle melalui *lazy-loading* dan *code-splitting*, serta arsitektur keamanan *fail-closed* dengan *Row Level Security* (RLS) privat.

Arsip implementasi awal berbasis vanilla HTML/CSS/JS tersimpan di direktori [`archive_v1/`](archive_v1/) sebagai rekam jejak historis; versi aktif yang berjalan di produksi sepenuhnya berbasis React.

---

## Showcase Proyek Rekayasa & Riset

Situs ini memuat dokumentasi arsitektur dan demonstrasi teknis dari proyek-proyek yang dikembangkan secara mandiri:

1. **Spam-Email Detection System (Riset Skripsi S1 Informatika UBSI)**
   - Judul Riset: *"Analisis Performa Complement Naive Bayes dan XGBoost dalam Mengatasi Concept Drift pada Klasifikasi Spam Email Menggunakan Pendekatan Domain Adaptation"*.
   - Fokus Masalah: Menginvestigasi fenomena *Covariate Shift* (pergeseran distribusi fitur teks email antar-era).
   - Arsitektur Model: Melakukan studi komparasi independen antara algoritma **Complement Naive Bayes (CNB)** dan **XGBoost** (keduanya dianalisis secara terpisah, bukan model ensemble atau voting). CNB dipilih karena karakteristik matematisnya yang stabil pada korpus teks dengan ketidakseimbangan kelas (*imbalanced data*).
   - Dataset: Data latih bersumber dari dataset publik era 2000-an (*emails.csv*, 5.728 sampel), dievaluasi terhadap korpus target email pribadi kontemporer (*data_test_berlabel_awal.csv*, 100 sampel).
   - Repositori: [GitHub - Raflyf/Spam-Email](https://github.com/Raflyf/Spam-Email)

2. **OpenPlagiarismChecker**
   - Sistem pemeriksa kemiripan dokumen akademik berbasis pendekatan ganda (*Dual-Engine*): pencocokan leksikal eksak (*5-Gram Shingling*) dan kedekatan semantik (*Sentence-BERT / SBERT*).
   - Dilengkapi modul *layout-aware PDF extractor* dan pencarian vektor lokal berbasis FAISS.
   - Beroperasi secara lokal/offline tanpa pengiriman data naskah ke server pihak ketiga guna menjaga kerahasiaan dokumen.
   - Repositori: [GitHub - Raflyf/OpenPlagiarismChecker](https://github.com/Raflyf/OpenPlagiarismChecker)

3. **laser_pointer_PPT (IoT Presentation Controller)**
   - Sistem kendali presentasi jarak jauh tanpa kontak fisik (*touchless controller*) yang memanfaatkan sensor *gyroscope* dan *accelerometer* smartphone sebagai pengendali kursor laser virtual dan perpindahan slide melalui koneksi WebSocket dua arah berlatensi rendah.
   - Repositori: [GitHub - Raflyf/laser_pointer_PPT](https://github.com/Raflyf/laser_pointer_PPT)

4. **FotoKitaBlur (Edge AI Privacy Protector)**
   - Aplikasi perlindungan privasi citra visual di peramban menggunakan MediaPipe dan OpenCV.
   - Mendeteksi wajah secara otomatis untuk pengaburan (*blur*) serta mengenali gestur tangan *V-sign* (*peace sign*) untuk mengaburkan ujung jari guna mencegah potensi ekstraksi pola sidik jari dari foto publik.
   - Repositori: [GitHub - Raflyf/FotoKitaBlur](https://github.com/Raflyf/FotoKitaBlur)

5. **Web Portofolio & AI Developer Lab (Repositori Ini)**
   - Antarmuka web interaktif yang mengintegrasikan terminal asisten AI, dashboard observabilitas analitik, dan sistem memori terverifikasi.

---

## Fitur & Arsitektur Sistem

### 1. Terminal AI & Smart Gateway (`api/chat.js`)

- **Multi-Provider Failover Gateway:** Terintegrasi dengan berbagai penyedia API model AI publik (Ollama Cloud, OpenRouter, OpenCode, MiniMax, NVIDIA NIM) dengan mekanisme *priority race* dan *failover cascade* otomatis saat terjadi antrean atau limitasi.
- **Surgical Portfolio Ground-Truth Router:** Kueri mengenai proyek, riset skripsi, riwayat pendidikan, dan lisensi sertifikasi (BNSP Analis Program 2025, MikroTik MTCNA 2025, Cisco PCAP 2024) dipetakan langsung ke basis data lokal terverifikasi (*0ms bypass*), mengeliminasi latensi pencarian eksternal dan mencegah halusinasi data.
- **Dynamic Multi-Stage Pipeline Progress Indicator:** Antarmuka terminal menampilkan status pemrosesan dinamis yang mencerminkan fase backend yang sedang berjalan (*Query Parser*, *Portfolio RAG*, *Live Web Search*, *Scraping & Rerank*, *API Gateway*, *Thinking / Deep Reasoning*, hingga *Synthesis*).
- **Pemisahan Waktu Respon Koneksi & Waktu Berpikir:** 
  - `connectTimeoutMs` (7.5 detik) disesuaikan dengan rata-rata waktu respons awal (*handshake & headers*) server API.
  - `activeTimeoutMs` dialokasikan secara maksimal (hingga batas runtime serverless 55 detik) agar model AI memiliki waktu yang memadai untuk melakukan penalaran (*deep reasoning*) dan menghasilkan respon utuh.
- **Pencarian Web & Grounding Fakta Real-Time:** Menghubungkan kueri wawasan umum dan berita teknologi terkini ke Google News, ensiklopedia Wikipedia, dan *GitHub live repo inspector* dengan penyaringan metadata dan reranking BM25-lite.
- **Long-Term Memory RAG:** Mendukung penyimpanan wawasan baru dan koreksi pengguna ke tabel `ai_memories` Supabase PostgreSQL dengan penandaan kontekstual terstruktur.
- **Keamanan Gateway Serverless:** Isolasi kunci API di sisi server, pencegahan SSRF (*Server-Side Request Forgery*), pembatasan laju kueri (*Rate Limiting* berbasis IP tepercaya), sanitasi masukan teks, serta proteksi CORS *allowlist*.

### 2. Panel Admin Observabilitas & Monitoring (`/dashboard`)

- **Autentikasi Multi-Faktor:** Proteksi akses dashboard menggunakan verifikasi Master PIN dengan hashing *Web Crypto SHA-256 + Salt*, mekanisme penguncian *brute-force*, serta validasi token sesi serverless yang kedaluwarsa otomatis.
- **Arsitektur Pembacaan Data Privat (`/api/dashboard-data.js`):** Hak akses baca publik (*anon SELECT*) ke tabel telemetri dan memori dinonaktifkan via RLS. Seluruh data log dibaca secara privat melalui fungsi serverless menggunakan `SUPABASE_SERVICE_ROLE_KEY` setelah token sesi diverifikasi sah.
- **Visualisasi Analitik Real-Time:** Menampilkan grafik statistik kunjungan, tipe perangkat, sebaran kategori interaksi kueri, efisiensi resolusi provider AI, dan riwayat perintah CLI menggunakan Chart.js.
- **Ekspor Log Terproteksi:** Fitur unduh log aktivitas ke format JSON dan CSV yang dilengkapi sanitasi karakter awal guna mencegah celah *CSV Formula Injection*.

### 3. Sistem Desain, Aksesibilitas, & Optimasi Performa

- **Liquid Glass Design System:** Menerapkan token material kaca (latar belakang transparan, blur backdrop, batas spekular halus, dan drop shadow adaptif) secara konsisten di tema gelap (*dark mode*) dan terang (*light mode*).
- **Aksesibilitas Sesuai Standar WCAG 2.2 AA:** Memenuhi rasio kontras teks minimum 4.5:1, navigasi keyboard penuh dengan indikator fokus terlihat, serta atribut ARIA pada elemen interaktif.
- **Code-Splitting & Lazy Loading:** Modul dashboard analitik dan dependensi visualisasi Chart.js dipecah menjadi chunk terpisah melalui `React.lazy`, menjaga ukuran bundle awal landing page tetap efisien (~759 kB uncompressed / ~230 kB gzip).
- **Semantik SEO & Metadata:** Dilengkapi skema terstruktur Schema.org JSON-LD (*Person*, *ProfilePage*), OpenGraph meta tag, serta suite favicon multi-resolusi.

---

## Struktur Direktori

```text
.
├── index.html                   # Titik masuk Vite (meta SEO, OpenGraph, JSON-LD, favicon)
├── src/
│   ├── main.jsx                 # Inisialisasi React DOM & TerminalProvider
│   ├── App.jsx                  # Router, navigasi, inisialisasi Lenis, kontrol tema
│   ├── index.css                # Konfigurasi Tailwind v4 & token Liquid Glass
│   ├── data.js                  # Data kurasi portofolio, proyek, sertifikasi, dan riwayat
│   ├── lib/
│   │   ├── telemetry.js         # Pengiriman log aktivitas client asinkron
│   │   └── utils.js             # Fungsi utilitas (penggabungan kelas Tailwind, dsb.)
│   ├── context/
│   │   └── TerminalContext.jsx  # Manajemen state global antarmuka terminal AI
│   ├── pages/
│   │   ├── Home.jsx             # Halaman utama landing page
│   │   └── Dashboard.jsx        # Halaman panel pemantauan admin (lazy-loaded)
│   └── components/
│       ├── layout/Footer.jsx
│       ├── sections/            # Hero, About, Skills, Projects, Certificates, Timeline, Contact
│       ├── terminal/TerminalAI.jsx # Komponen antarmuka terminal & multi-stage pipeline loader
│       └── ui/                  # HorizonHero, ScrollStoryline, selektor interaktif
├── api/
│   ├── chat.js                  # Gateway AI serverless, failover cascade, web grounding & RAG
│   ├── admin-otp.js             # Autentikasi Master PIN/OTP serverless & manajemen token sesi
│   └── dashboard-data.js        # Endpoint pembacaan telemetri privat (service_role)
├── database/
│   └── supabase_schema.sql      # DDL skema database, aturan RLS privat & RPC SECURITY DEFINER
├── public/                      # Aset statis: favicon, gambar sertifikat, dokumen CV
├── archive_v1/                  # Berkas kode versi vanilla HTML/CSS/JS (arsip historis)
├── .github/workflows/deploy.yml # Pipeline deployment otomatis ke GitHub Pages
├── vercel.json                  # Konfigurasi routing SPA, header keamanan, dan maxDuration
├── netlify.toml                 # Konfigurasi build dan direktori publikasi Netlify
├── .env.example                 # Panduan variabel lingkungan lokal dan serverless
├── DOCUMENTATION.md             # Catatan teknis arsitektur dan riwayat versi lengkap
└── README.md                    # Dokumentasi utama proyek
```

---

## Panduan Menjalankan di Lingkungan Lokal

### Prasyarat
- Node.js (versi 18 LTS atau lebih baru)
- Pengelola paket `npm`

### Langkah Instalasi

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/Raflyf/web-portofolio.git
   cd web-portofolio
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Variabel Lingkungan:**
   Salin berkas template `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Sesuaikan nilai variabel sesuai kebutuhan lingkungan lokal Anda.

4. **Jalankan Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

5. **Uji Kompilasi Bundle Produksi:**
   ```bash
   npm run build
   npm run preview
   ```

---

## Konfigurasi Variabel Lingkungan

### 1. Variabel Sisi Client (Prefix `VITE_` — Terbaca di Bundle Peramban)

| Nama Variabel | Deskripsi Fungsional |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL endpoint REST proyek Supabase untuk telemetri log aktivitas. |
| `VITE_SUPABASE_ANON_KEY` | Kunci publik (*anon key*) Supabase dengan izin RLS terbatas hanya untuk operasi INSERT. |

### 2. Variabel Sisi Server (Konfigurasi di Dashboard Vercel / Netlify)

| Nama Variabel | Deskripsi Fungsional |
| :--- | :--- |
| `SUPABASE_URL` | URL endpoint REST Supabase untuk fungsi serverless. |
| `SUPABASE_ANON_KEY` | Kunci anon untuk validasi RPC publik di sisi server. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Kunci Privat Utama** — Digunakan eksklusif oleh fungsi serverless untuk membaca telemetri privat dan memverifikasi autentikasi admin. Dilarang diekspos ke client. |
| `AI_KEYS` | (Opsional) Kumpulan kunci API terpadu yang dipetakan otomatis per penyedia oleh sistem *key resolver*. |
| `OPENROUTER_API_KEYS` | Kumpulan kunci API OpenRouter untuk rotasi pool model publik. |
| `OPENCODE_API_KEYS` | Kumpulan kunci API OpenCode untuk model cadangan berkecepatan tinggi. |
| `OLLAMA_CLOUD_API_KEY` | Kunci akses API ke klaster Ollama Cloud. |
| `NVIDIA_API_KEYS` | Kumpulan kunci API NVIDIA NIM. |
| `MINIMAX_API_KEY` | Kunci akses API provider MiniMax. |
| `ALLOWED_ORIGIN` | Domain resmi yang diizinkan dalam kebijakan CORS (contoh: `https://raflyfirmansyah-portofolio.vercel.app`). |

---

## Lisensi

Proyek ini didistribusikan di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).  
Hak cipta © 2026 **Rafly Firmansyah**. Seluruh hak dilindungi undang-undang.
