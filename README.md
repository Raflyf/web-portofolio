# Portofolio Profesional & AI Developer Lab — Rafly Firmansyah

Landing page portofolio profesional dan *Developer Lab* interaktif untuk **Rafly Firmansyah** ([@Raflyf](https://github.com/Raflyf)) — Mahasiswa S1 Informatika (UBSI) & Software Developer berfokus pada riset NLP, Computer Vision, Machine Learning, dan arsitektur web modern.

Dibangun dengan **HTML5 Semantik**, **Modern Vanilla CSS (OKLCH + Motion Tokens)**, **Modular JavaScript (ES6+)**, dan **Vercel Serverless Gateway**. Tanpa dependensi framework berat, berorientasi performa tinggi (Skor Lighthouse 100/100), aksesibilitas **WCAG 2.2 AA**, serta perlindungan keamanan tingkat *Enterprise*.

---

## Fitur Utama & Arsitektur Sistem

### 1. AI Developer Lab & Multi-Model Cascade Gateway
- **Multi-Model AI Intelligence:** Integrasi model AI terkemuka dunia dengan *cascade failover* otomatis (DeepSeek V3 671B MoE, DeepSeek V4 Flash, Meta Llama 3.3 70B, Qwen 2.5 Coder 32B, Nvidia Nemotron Ultra 70B, MiniMax-01, Ollama Cloud Kimi K2.7 Coder / Gemma 31B, serta Hermes 3 405B).
- **Vision Multimodal & Ingesti Dokumen:** Analisis gambar dan dokumen multi-format (PDF hingga 100 halaman via `PDF.js`, teks, koding, CSV) dengan dukungan *Drag & Drop* langsung ke area terminal.
- **Mode Penalaran Bertingkat (*Reasoning & Effort*):** Pilihan eksekusi `⚡ Auto`, `⚡ Low (Fast)`, `⚖️ Medium`, `🔬 High (Deep Research)`, dan `🧬 Thinking CoT (Deep Chain-of-Thought)`.
- **Penguncian Bahasa Sesi (*Session Language Lock*):** Mengunci bahasa seluruh percakapan berdasarkan bahasa masukan pertama (Bahasa Indonesia / English) secara konsisten.
- **Vercel Serverless Gateway (`api/chat.js`):** Menjaga kerahasiaan API Key dengan *Serverless Functions* berdurasi eksekusi hingga 120 detik, pembatasan muatan DOS, dan standar CORS W3C.

### 2. Panel Admin Monitoring & Telemetri Analitik (`dashboard.html`)
- **Autentikasi Kriptografis SHA-256:** Gateway penguncian Master PIN dengan algoritma *Web Crypto SHA-256 + Salt* serta proteksi *brute-force lockout*.
- **Visualisasi Data Real-Time (Chart.js):** 5 Kartu KPI Bento, Grafik Tren Kunjungan Harian, Heatmap Kategori Interaksi, Rasio Distribusi Perangkat, Leaderboard Perintah Terminal CLI, dan Leaderboard Sertifikat terpopuler.
- **Backend Supabase PostgreSQL:** Skema database time-series dengan *Row Level Security (RLS)* terisolasi, proteksi panjang kolom, dan *Composite Indexes* berkecepatan tinggi.
- **Ekspor Data Kebal Injeksi:** Fitur unduh log aktivitas ke CSV (dilengkapi sanitasi *CSV Formula Injection*) dan JSON.

### 3. Arsitektur UI/UX & Fisika Gerak (*Micro-Physics*)
- **Inertia Smooth-Scroll Engine:** Peredam inersia roda tetikus (*wheel damper* 60–120fps) dengan kurva fisika kubik `easeInOutCubic`.
- **Dialog Modal Pop-Up Global:** Tombol aksi mengambang (*Floating Action Button / FAB*) untuk mengakses Terminal AI dari bagian mana pun di situs dengan *backdrop blur* dan *body scroll locking* otomatis.
- **Sistem Warna OKLCH:** Kontras adaptif mode gelap (*Deep Obsidian*) dan terang (*Crisp Slate*) dengan rasio kontras WCAG 2.2 AA (≥ 7:1 untuk teks utama).
- **Pratinjau Sertifikat Mandiri (`preview.html`):** Penampil grafis dokumen resolusi tinggi multi-halaman yang kebal cegatan download otomatis.

### 4. Optimalisasi SEO & Identitas Google Search
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
│   ├── components.css           # Styling komponen (Navbar, Hero, Cards, Modal, Terminal)
│   ├── dashboard.css            # Styling visual panel admin analitik
│   └── transitions.css          # Motion tokens standar transitions-dev
├── js/
│   ├── data.js                  # Data terpusat (Proyek GitHub, Sertifikat, Timeline)
│   ├── main.js                  # Controller utama halaman depan & event handlers
│   ├── terminal.js              # Controller emulator CLI & antarmuka input/output
│   ├── terminal-ai.js           # Client penghubung AI & streaming typewriter engine
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
├── DOCUMENTATION.md             # Dokumentasi teknis arsitektur, audit & changelog
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

Untuk mengaktifkan Multi-Model AI Gateway secara penuh di lingkungan produksi, tambahkan variabel lingkungan berikut pada dashboard Vercel Anda (**Project Settings -> Environment Variables**):

| Nama Variabel | Penyedia / Deskripsi |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter (DeepSeek V3, DeepSeek R1, Llama 3.3, Qwen Coder, Hermes 3) |
| `NVIDIA_API_KEY` | Nvidia NIM (Nemotron Ultra 70B, Llama 3.2 Vision) |
| `OPENCODE_API_KEY` | OpenCode Zen (DeepSeek V4 Flash) |
| `MINIMAX_API_KEY` | MiniMax AI (MiniMax-01 M3) |
| `OLLAMA_CLOUD_API_KEY` | Ollama Cloud (Kimi K2.7 Coder, Gemma 31B) |

---

## Lisensi & Hak Cipta

Dirilis di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).  
Dikembangkan dengan standar rekayasa perangkat lunak modern oleh **Rafly Firmansyah**.
