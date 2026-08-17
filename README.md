# Portofolio Profesional & AI Developer Lab — Rafly Firmansyah

Landing page portofolio profesional dan *Developer Lab* interaktif untuk **Rafly Firmansyah** ([@Raflyf](https://github.com/Raflyf)) — Mahasiswa S1 Informatika (UBSI) & Software Developer berfokus pada riset NLP, Computer Vision, Machine Learning, dan arsitektur web modern.

Dibangun dengan **HTML5 Semantik**, **Modern Vanilla CSS (OKLCH + Motion Tokens)**, **Modular JavaScript (ES6+ Modules)**, dan **Vercel Serverless Gateway**. Tanpa dependensi framework berat, berorientasi performa tinggi (Skor Lighthouse 100/100), aksesibilitas **WCAG 2.2 AA**, serta perlindungan keamanan tingkat *Enterprise*.

---

## Fitur Utama & Arsitektur Sistem

### 1. AI Developer Lab & Multi-Provider Cascade Gateway
- **OmniRoute Dedicated Server Combos (Tier #1 Priority):** Integrasi langsung ke kluster model terverifikasi berkecepatan tinggi:
  - `nemotron-laguna`: Nemotron 3 Ultra 550B MoE Pool (96 akun aktif) untuk riset arsitektur proyek dan sintesis teknis.
  - `Codex`: GPT-5.6 Terra / Codex untuk penalaran pemrograman dan pembuatan skrip.
  - `Antigravity`: Claude Opus 4.6 Thinking / Sonnet 4.5 untuk penalaran logika analitis mendalam (*Extended Chain-of-Thought*).
  - `Vision-model`: MiniMax M3 Vision untuk analisis gambar dan *optical perception*.
  - `Deepseek-V4-Flash-Free`: Model fallback resilien dengan proteksi *fast circuit-breaker* 3.5 detik.
- **Waktu Sistem Realtime Dinamis:** Seluruh instruksi sistem AI mengonsumsi tanggal, hari, bulan, tahun, dan waktu WIB secara dinamis mengikuti jam aktual peramban pengguna (bebas *hardcode*).
- **Ekspansi Kuota Output Penuh (Hingga 8.192 Tokens):** Menghilangkan masalah teks terpotong (*zero truncation*) pada mode *Thinking CoT* dan *Deep Research* dengan batas komputasi hingga 8.192 tokens.
- **Multimodal Vision & Ingesti Dokumen:** Analisis gambar dan dokumen multi-format (PDF hingga 100 halaman via `PDF.js`, teks, koding, CSV) dengan dukungan *Drag & Drop* langsung ke area terminal.
- **Mode Penalaran Bertingkat (*Reasoning Effort*):** Pilihan eksekusi `Auto (Balanced Depth)`, `Thinking CoT (Deep Chain-of-Thought)`, `High (Deep Research)`, `Medium (Standard)`, dan `Low (Fast Response)`.
- **Penguncian Bahasa Sesi (*Session Language Lock*):** Mengunci bahasa seluruh percakapan berdasarkan bahasa masukan pertama (Bahasa Indonesia / English) secara konsisten.
- **Vercel Serverless Gateway (`api/chat.js`):** Menjaga kerahasiaan API Key dengan *Serverless Functions*, pembatasan muatan DOS, dan standar CORS W3C.

### 2. Engine Interaksi Web Langsung Berbasis AI Agent (`window.portfolioAgent`)
- **Kontrol DOM Otomatis Berbasis Perintah AI:** Memungkinkan asisten AI dan terminal berinteraksi langsung dengan antarmuka web peramban pengguna secara nyata:
  - `Membuka Modal Proyek`: Membuka jendela dialog detail spesifikasi arsitektur proyek (`[ACTION:OPEN_PROJECT:openplagiarism]`).
  - `Membuka Kredensial Sertifikat`: Membuka modal kredensial dan penampil dokumen sertifikasi resmi (`[ACTION:OPEN_CERTIFICATE:bnsp]`).
  - `Pengisian Otomatis Form Kontak & Diskusi`: Mengisi kolom nama, email, dan pesan pada formulir `#contact-form` serta mengarahkan layar dengan efek sorotan cincin emerald (`[ACTION:FILL_CONTACT:name=...&email=...&message=...]`).
  - `Navigasi Halaman Presisi`: Menjalankan *smooth scroll* dinamis ke bagian mana pun di situs web (`#projects`, `#skills`, `#certificates`, `#about`, `#contact`, `#timeline`, `#benchmarks`).
  - `Kontrol Tautan Eksternal & Tema`: Membuka profil/repositori GitHub resmi, mengubah mode tema tampilan (gelap/terang), dan menyalin email dengan 1 perintah.
- **Badge Indikator Aksi Web (`.chat-action-badge`):** Memberikan konfirmasi visual instan pada balon percakapan terminal ketika sebuah aksi DOM berhasil dieksekusi.

### 3. Optimasi Responsif & Mobile Viewport Maximizer
- **Tampilan Full-Height Imersif di HP (`< 768px`):** Modal terminal pada perangkat mobile menggunakan `100dvh` dengan `flex: 1` penuh pada `.terminal-body` untuk memberikan ruang vertikal maksimal pada area percakapan chat.
- **Pintasan Perintah Geser Horizontal:** Bilah pintasan (`.terminal-chips-bar`) disusun dalam 1 baris geser horizontal ramping (*horizontal scroll*) dengan scrollbar tersembunyi.
- **Input Form Adaptif:** Memangkas padding dan menyembunyikan label prompt pada layar sempit (`< 480px`) agar kotak ketik mendapatkan lebar penuh.
- **Cache-Busting Universal pada Rantai Impor Modul:** Menggunakan parameter versi dinamis pada seluruh impor ES Module (`index.html` -> `main.js` -> `terminal.js` -> `terminal-ai.js` -> `data.js` & `telemetry.js`) untuk menjamin peramban selalu memuat versi logika terbaru seketika tanpa tertahan cache CDN.

### 3. Panel Admin Monitoring & Telemetri Analitik (`dashboard.html`)
- **Autentikasi Kriptografis SHA-256:** Gateway penguncian Master PIN dengan algoritma *Web Crypto SHA-256 + Salt* serta proteksi *brute-force lockout*.
- **Visualisasi Data Real-Time (Chart.js):** 5 Kartu KPI Bento, Grafik Tren Kunjungan Harian, Heatmap Kategori Interaksi, Rasio Distribusi Perangkat, Leaderboard Perintah Terminal CLI, dan Leaderboard Sertifikat terpopuler.
- **Backend Supabase PostgreSQL:** Skema database time-series dengan *Row Level Security (RLS)* terisolasi, proteksi panjang kolom, dan *Composite Indexes* berkecepatan tinggi.
- **Ekspor Data Kebal Injeksi:** Fitur unduh log aktivitas ke CSV (dilengkapi sanitasi *CSV Formula Injection*) dan JSON.

### 4. Arsitektur UI/UX & Fisika Gerak (*Micro-Physics*)
- **Inertia Smooth-Scroll Engine:** Peredam inersia roda tetikus (*wheel damper* 60–120fps) dengan kurva fisika kubik `easeInOutCubic`.
- **Dialog Modal Pop-Up Global:** Tombol aksi mengambang (*Floating Action Button / FAB*) untuk mengakses Terminal AI dari bagian mana pun di situs dengan *backdrop blur* dan *body scroll locking* otomatis.
- **Sistem Warna OKLCH:** Kontras adaptif mode gelap (*Deep Obsidian*) dan terang (*Crisp Slate*) dengan rasio kontras WCAG 2.2 AA (≥ 7:1 untuk teks utama).
- **Pratinjau Sertifikat Mandiri (`preview.html`):** Penampil grafis dokumen resolusi tinggi multi-halaman yang kebal cegatan download otomatis.

### 5. Optimalisasi SEO & Identitas Google Search
- **Schema.org JSON-LD:** Pemasangan struktur data `@type: "WebSite"` dan `og:site_name` resmi ("Rafly Firmansyah") untuk eliminasi badge nama domain pihak ketiga.
- **Suite Favicon Multi-Platform:** Menyediakan `favicon.svg`, `favicon.ico`, `favicon-48x48.png` (standar wajib crawler Googlebot-Favicon), `favicon-192x192.png`, `apple-touch-icon.png`, dan `site.webmanifest`.

---

## Struktur Repositori

```
.
├── index.html                   # Halaman utama portofolio & markup semantik
├── dashboard.html               # Panel Admin Monitoring & Telemetri Analitik
├── preview.html                 # Penampil dokumen sertifikat multi-halaman
├── favicon.svg                  # Logo favicon vektor monokrom emerald
├── favicon.ico                  # Favicon multi-resolusi legacy
├── site.webmanifest             # Web App Manifest & ikon PWA
├── robots.txt                   # Panduan perayapan search engine
├── sitemap.xml                  # Peta situs resmi
├── api/
│   └── chat.js                  # Vercel Serverless Multi-API Gateway (AI Router)
├── css/
│   ├── style.css                # Sistem desain dasar, variabel OKLCH, tipografi
│   ├── components.css           # Styling komponen (Navbar, Hero, Cards, Modal, Terminal Mobile)
│   ├── dashboard.css            # Styling visual panel admin analitik
│   └── transitions.css          # Motion tokens standar transitions-dev
├── js/
│   ├── data.js                  # Data terpusat (Proyek GitHub, Sertifikat, Timeline)
│   ├── main.js                  # Controller utama halaman depan & event handlers
│   ├── terminal.js              # Controller emulator CLI & antarmuka input/output
│   ├── terminal-ai.js           # Client penghubung AI, OmniRoute dispatcher & failover
│   ├── telemetry.js             # Client tracker telemetri asinkron non-blocking
│   └── dashboard.js             # Controller analitik admin & visualisasi Chart.js
├── certificates/
│   ├── *.pdf                    # Dokumen PDF autentik sertifikat
│   └── images/                  # Grafis halaman sertifikat resolusi tinggi
├── database/
│   └── supabase_schema.sql      # Skema DDL tabel, indeks komposit & RLS Supabase
├── assets/                      # Ikon PNG multi-ukuran dan aset statis
├── .github/
│   └── workflows/
│       └── deploy.yml           # Otomasi deployment CI/CD ke GitHub Pages
├── vercel.json                  # Konfigurasi deployment & header keamanan Vercel
├── netlify.toml                 # Konfigurasi deployment Netlify
├── DOCUMENTATION.md             # Dokumentasi teknis arsitektur, audit & changelog lengkap
├── Jalankan_Lokal.bat           # Launcher server lokal 1-klik Windows
└── README.md                    # Panduan ringkas proyek
```

---

## Panduan Menjalankan Secara Lokal

Karena proyek ini menggunakan modul JavaScript ES6 murni, jalankan menggunakan web server lokal:

### Opsi 1: Menggunakan Script 1-Klik (Windows)
Cukup klik dua kali berkas `Jalankan_Lokal.bat`.

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

## Pengaturan Environment Variables (Vercel)

Untuk mengaktifkan Multi-Model AI Gateway dan Telemetri Analitik secara penuh di lingkungan produksi, tambahkan variabel lingkungan berikut pada dashboard Vercel (**Project Settings -> Environment Variables**):

| Nama Variabel | Penyedia / Deskripsi |
|---|---|
| `OMNIROUTE_URL` | URL Cloudflare Tunnel / Server Lokal OmniRoute |
| `OMNIROUTE_KEY` | API Key Autentikasi OmniRoute Dedicated Server |
| `OPENROUTER_API_KEY` | Kunci Utama OpenRouter AI Gateway (DeepSeek, Llama 3.3, Gemma, Nemotron) |
| `OPENROUTER_API_KEYS` | Kumpulan Multi-Key OpenRouter (pisahkan dengan koma untuk rotasi otomatis) |
| `OPENCODE_API_KEY` | Kunci Utama OpenCode Cloud (DeepSeek V4 Flash & Nemotron Ultra) |
| `OPENCODE_API_KEYS` | Kumpulan Multi-Account OpenCode (pisahkan dengan koma) |
| `NVIDIA_API_KEY` | Nvidia NIM Engine (Nemotron Ultra 70B, Llama 3.2 Vision) |
| `MINIMAX_API_KEY` | MiniMax AI (MiniMax-01 M3 Vision) |
| `OLLAMA_CLOUD_API_KEY` | Ollama Cloud (Kimi K2.7 Coder, Gemma 31B) |
| `SUPABASE_URL` | Supabase Project REST Endpoint (Continuous RAG & Telemetry) |
| `SUPABASE_ANON_KEY` | Supabase Anonymous Client Key dengan RLS Policy |


---

## Lisensi & Hak Cipta

Dirilis di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).  
Dikembangkan dengan standar rekayasa perangkat lunak modern oleh **Rafly Firmansyah**.
