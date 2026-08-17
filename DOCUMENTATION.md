# Dokumentasi Arsitektur & Rekayasa Portofolio Rafly Firmansyah

Dokumen ini mencatat keputusan arsitektur konseptual, sistem desain, standar aksesibilitas, dan audit keamanan untuk landing page portofolio **Rafly Firmansyah** ([@Raflyf](https://github.com/Raflyf)).

---

## 1. Filosofi Desain & Anti-AI Slop

Proyek ini dibangun dengan komitmen terhadap estetika *Cyber-Editorial* dan presisi tinggi:
- **Warna OKLCH:** Menggunakan ruang warna perseptual OKLCH untuk menjaga konsistensi kontras di seluruh spektrum terang dan gelap.
  - Dark Mode: Canvas *Deep Obsidian* (`oklch(0.13 0.015 255)`), Card Surface (`oklch(0.17 0.018 255)`), Aksen *Emerald Hyperlink* (`oklch(0.74 0.18 160)`).
  - Light Mode: Canvas *Crisp Slate* (`oklch(0.98 0.005 240)`), Card Surface (`oklch(1 0 0)`), Aksen *Emerald* (`oklch(0.48 0.16 160)`).
- **Tipografi Berkarakter:** Menggantikan pasangan font generik dengan *Plus Jakarta Sans* (Heading & Body) dan *JetBrains Mono* (Tech code & stats).
- **Eliminasi AI Slop:** Dilarang menggunakan gradien ungu pada latar putih, sudut membulat berlebihan (>16px pada kartu), border ghost dengan drop shadow buram, serta tata letak kartu identik berulang tanpa ritme spasial.

---

## 2. Standar Aksesibilitas (WCAG 2.2 AA)

- **Rasio Kontras:**
  - Body Text: `oklch(0.85 0.01 255)` pada `oklch(0.13 0.015 255)` menghasilkan rasio > 7:1 (Lolos standar AA & AAA).
  - Muted Text: `oklch(0.72 0.015 255)` menghasilkan rasio > 4.5:1 (Lolos standar AA).
- **Keyboard Navigation:** Seluruh elemen interaktif memiliki outline `:focus-visible` kontras tinggi (2px solid emerald, outline-offset 3px).
- **Landmarks & Skip Link:** Dilengkapi elemen `<header>`, `<nav>`, `<main id="main-content">`, `<section>`, `<footer>`, serta tombol *Skip Link* tersembunyi untuk navigasi screen reader.
- **Dialog Modal:** Menggunakan elemen HTML5 `<dialog>` standar dengan backdrop filter, trap fokus, dan listener tombol `Escape`.
- **Prefers-Reduced-Motion:** Seluruh durasi animasi diringkas menjadi 0.01ms saat pengguna mengaktifkan preferensi peredam gerakan pada sistem operasi.

---

## 3. Keamanan Frontend (OWASP & Content Security Policy)

1. **Pencegahan XSS:**
   - Semua rendering data proyek dan sertifikat menggunakan pembuatan DOM murni (`createElement`, `textContent`) tanpa `innerHTML` yang memuat input tidak terpercaya.
2. **Content Security Policy (CSP):**
   - Diterapkan via meta tag HTTP-Equiv untuk membatasi eksekusi sumber skrip dan memitigasi injeksi berbahaya.
3. **External Links Isolation:**
   - Seluruh link eksternal (`target="_blank"`) dilengkapi atribut keamanan `rel="noopener noreferrer"`.
4. **Anti-Spam Form Protection:**
   - Dilengkapi honeypot hidden field untuk mendeteksi pengisian bot otomatis pada formulir kontak.

---

## 4. Struktur Data Modular (Proyek & Sertifikat)

- File `js/data.js` menyimpan data terpusat:
  - `DEVELOPER_PROFILE`: Metadata pengembang, bio, dan link sosial.
  - `PROJECTS_DATA`: 5 proyek unggulan GitHub (`OpenPlagiarismChecker`, `Spam-Email`, `laser_pointer_PPT`, `FotoKitaBlur`, `web-portofolio`).
  - `CERTIFICATES_DATA`: Struktur sertifikasi modular dengan ID kredensial, issuer, kategori, dan deskripsi kompetensi.
  - `TIMELINE_DATA`: Riwayat milestone dan pengalaman riset.
- File `js/terminal.js`: Terminal emulator interaktif mandiri yang merespons perintah `help`, `skills`, `projects`, `certifs`, `benchmarks`, `about`, `whoami`, `contact`, dan `clear`.

---

## 5. Konfigurasi Deployment Hosting Gratis

Proyek ini telah dikonfigurasi untuk 1-click zero-config deployment di berbagai penyedia hosting statis gratis:
1. **GitHub Pages:** Dilengkapi GitHub Actions CI/CD workflow di `.github/workflows/deploy.yml` yang otomatis men-deploy setiap push ke branch `main`.
2. **Vercel:** Dilengkapi `vercel.json` dengan konfigurasi security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
3. **Netlify:** Dilengkapi `netlify.toml` dengan publish directory `.` dan security headers.
4. **Cloudflare Pages:** Siap langsung dihubungkan ke repositori GitHub tanpa build command.

---

## 6. Riwayat Perubahan Konseptual

| Versi | Tanggal | Ringkasan Perubahan |
|---|---|---|
| **1.0.0** | 2026-08-16 | Inisialisasi awal arsitektur portofolio, sistem desain OKLCH, integrasi repositori GitHub riil, terminal lab interaktif, sistem sertifikat modular, dan konfigurasi multi-hosting gratis. |
| **1.0.1** | 2026-08-16 | Penambahan skrip otomatis 1-klik lokal `Jalankan_Lokal.bat` untuk Windows. |
| **1.0.2** | 2026-08-16 | Integrasi data sertifikat autentik, pembaruan kontak resmi (WhatsApp & Email), dan penyempurnaan metadata pengembang. |
| **1.0.3** | 2026-08-16 | Integrasi penuh 9 sertifikasi autentik (MikroTik MTCNA, Cisco Python PCAP, Kominfo DEA, FTI UBSI, Harisenin), riwayat organisasi & magang CV, serta pencapaian akademik IPK 3.93 UBSI. |
| **1.0.4** | 2026-08-16 | Restrukturisasi arsip berkas sertifikat dan CV ke direktori `certificates/` dengan tombol penampil dokumen PDF langsung pada modal viewer. |
| **1.0.5** | 2026-08-16 | Standardisasi nama penuh Rafly Firmansyah pada logo navigasi, pembersihan tag badge footer, pembaruan hak cipta profesional, dan penghapusan tombol unduh CV publik. |
| **1.1.0** | 2026-08-16 | Audit menyeluruh UI/UX, implementasi navigasi smooth scrolling dengan scroll-padding-top, indikator progress bar gulir, animasi scroll reveal intersection, riwayat perintah dan pintasan chip pada Terminal Lab, serta validasi regex dan efek shake pada formulir kontak. |
| **1.1.1** | 2026-08-16 | Engine kustom Cubic Smooth-Scroll (`easeInOutCubic` 60-120fps), tombol melayang neon emerald Back-to-Top interaktif, dan panduan aktivasi 1-klik GitHub Pages Actions di tab Settings. |
| **1.2.0** | 2026-08-16 | Engine Inertia Smooth Mouse Wheel (peredam inersia 60-120fps untuk scroll mouse fisik) dan penerapan query string cache-busting otomatis untuk mencegah browser memuat skrip lama dari cache. |
| **1.3.0** | 2026-08-16 | Integrasi pengiriman formulir riil ke Gmail (`raflyfirmansyah02@gmail.com`) via FormSubmit AJAX, tombol Salin Email 1-klik dengan notifikasi Toast mengambang, opsi Dual-Delivery ke WhatsApp Web, dan banner OpenGraph resolusi tinggi. |
| **1.3.1** | 2026-08-16 | Penghapusan pratinjau bingkai PDF tersemat di dalam modal sertifikat demi tampilan modal yang lebih ringkas, cepat, dan fokus pada tombol aksi pembuka PDF resmi. |
| **1.3.2** | 2026-08-16 | Pemasangan bundel Taste-Skill (Anti-Slop Frontend), penyaringan teks overclaim via Stop-Slop, perampingan tombol aksi hero, penegakan aturan nol emoji, dan sinkronisasi hierarki batasan skill pada konfigurasi global AGENTS.md. |
| **1.4.0** | 2026-08-16 | Optimasi engine scroll inersia cross-browser (penghapusan hard bailout prefers-reduced-motion) dan penyelarasan riwayat commit git ke identitas resmi Rafly Firmansyah (`raflyfirmansyah02@gmail.com`). |
| **2.0.0** | 2026-08-16 | Transformasi total UI/UX Anti-Slop: Layout Asimetris Split 60/40 pada Hero dengan Developer Telemetry Card, Matriks Keahlian 12-Kolom Bento Grid dengan visualisasi pipeline NLP, Spotlight Showcase 2-kolom untuk OpenPlagiarismChecker, dan kartu sertifikat modular dengan tombol salin nomor ID kredensial. |
| **2.1.0** | 2026-08-16 | Integrasi eksplisit kualifikasi akademik Program Sarjana (S1) Informatika UBSI di seluruh antarmuka dan metadata, serta peluncuran standalone viewer `preview.html` untuk pratinjau dokumen sertifikat PDF di tab peramban baru tanpa memicu download otomatis. |
| **2.2.0** | 2026-08-16 | Penghapusan menyeluruh pencantuman angka IPK dari seluruh antarmuka (Hero metrics ribbon, telemetry card, about bio, structured metadata, timeline milestones, dan terminal simulator) demi fokus pada kualifikasi rekayasa, riset AI/ML, dan kompetensi teknis terverifikasi. |
| **2.3.0** | 2026-08-16 | Perbaikan tuntas navigasi mobile (menu hamburger dropdown blur & tombol GitHub responsif), render pratinjau sertifikat berbasis grafis ultra-resolusi kebal cegatan download IDM, serta dukungan pratinjau multi-halaman berurutan untuk dokumen yang memiliki lampiran transkrip/materi. |
| **2.4.0** | 2026-08-16 | Penguatan redundansi aturan navigasi mobile pada style.css dan components.css, penambahan mekanisme auto-close klik luar/Escape, serta bumping string cache-busting v2.4.0 untuk memaksa pembaruan instan pada peramban mobile. |
| **2.5.0** | 2026-08-17 | Pembaruan nomor kontak resmi WhatsApp menjadi `08991333323` di seluruh repositori (data store, kartu kontak, template tautan, dan terminal), serta desain ulang tombol aksi WhatsApp pada status pengiriman formulir dengan visualisasi tombol hijau resmi (#25D366), ikon vektor, efek hover glow, dan keterbacaan tinggi. |
| **2.6.0** | 2026-08-17 | Penggantian entri proyek showcase dari repositori privat `Wp2` menjadi repositori publik `web-portofolio` (Bespoke Web Portfolio) dengan deskripsi teknis arsitektur modular, kepatuhan WCAG 2.2 AA, dan sistem desain OKLCH. |
| **3.0.0** | 2026-08-17 | Peluncuran sistem Admin Monitoring & Telemetri Analitik: gateway autentikasi SHA-256 Master PIN (`dashboard.html`), 4 kartu Bento KPI, 4 grafik visual Chart.js (Tren Kunjungan, Heatmap Klik Tautan, Rasio Perangkat, dan Matriks Eksplorasi Radar), ekspor data CSV/JSON, skema DDL Supabase RLS (`database/supabase_schema.sql`), dan pelacakan event asinkron non-blocking (`js/telemetry.js`). |
| **3.1.0** | 2026-08-17 | Desain ulang menyeluruh Dashboard Telemetri: Perombakan grafik radar menjadi Matriks Intelijen 3-Kolom (Rasio Perangkat Doughnut, Leaderboard Perintah Terminal Lab CLI terpopuler dengan progress bar, dan Leaderboard Sertifikat paling diminati), penambahan kartu KPI ke-5 (Rasio Interaktivitas), ekspansi grafik batang 9 kategori interaksi, tool Uji Ping real-time, modal pembaruan Master PIN SHA-256 mandiri, serta perbaikan CSP dan event tracker modal proyek. |
| **3.2.0** | 2026-08-17 | Penerapan engine peredam inersia 60-120fps smooth scrolling pada dashboard admin, tombol melayang Back-to-Top neon emerald, anti-cache 3s polling engine (`cache: 'no-store'` & timestamp unik `_t`), serta unifikasi normalisasi nama sertifikat. |
| **3.3.0** | 2026-08-17 | Penambahan Sertifikat Kompetensi Nasional resmi dari Badan Nasional Sertifikasi Profesi (BNSP) bidang Pengembang Perangkat Lunak kualifikasi Analis Program (Program Analyst) lengkap dengan 10 unit kompetensi terstandarisasi, render grafis multi-halaman beresolusi tinggi (Depan & Lampiran Unit Kompetensi), integrasi penampil `preview.html`, dan pengenalan normalisasi telemetri dashboard. |
| **3.4.0** | 2026-08-17 | Integrasi AI Assistant interaktif pada Terminal Developer Lab (`js/terminal-ai.js`): Arsitektur Multi-API Cascade dengan failover otomatis ke In-Browser Local Semantic Knowledge Engine. |
| **3.5.0** | 2026-08-17 | Implementasi Vercel Serverless Multi-API Gateway (`/api/chat.js`) untuk perlindungan kunci rahasia di sisi server (Environment Variables). Mendukung *Multi-Provider Cascade* (OpenRouter DeepSeek/Llama, Nvidia NIM, MiniMax), seleksi model dinamis (`$ model <name>`), serta dukungan input API key pribadi bagi pengunjung (`$ setkey <key>`) yang tersimpan aman di peramban lokal. |
| **3.8.0** | 2026-08-17 | Implementasi *Token-by-Token Streaming Typewriter Engine* pada Terminal Lab ala ChatGPT/Claude: jawaban muncul bertahap per kata/token dengan kursor kedip terminal neon emerald (`▋`), cadence cepat dan dinamis (12ms/token), auto-scroll real-time, perpanjangan batas timeout 30s, dan eliminasi total template statis kaku. |
| **4.0.0** | 2026-08-17 | Rilis Mayor AI Developer Lab: Penambahan komponen Dropdown Selektor Model interaktif di header terminal (DeepSeek V3, DeepSeek R1 Reasoning, Meta Llama 3.3 70B, Qwen 2.5 72B, Nvidia Nemotron 70B Ultra, Opencode Flash, MiniMax-01 M3), ekspansi kapasitas token jawaban hingga 1.800 tokens untuk jawaban mendalam & komprehensif, serta sinkronisasi dinamis ke *localStorage*. |
| **4.8.0** | 2026-08-17 | Pembersihan kode proxy lokal & migrasi 100% ke Cloud Gateway (Hugging Face ZeroGPU OmniRoute & Vercel Multi-API Gateway), pelebaran dimensi kartu terminal (`1020px`) dan tinggi responsif (`clamp(380px, 54vh, 580px)`), penambahan banner petunjuk permanen di header yang tidak terhapus saat perintah `clear`, serta penambahan tombol interaktif **Kirim** pada baris input terminal. |
| **5.0.0** | 2026-08-17 | Restrukturisasi lengkap katalog model pada Dropdown Terminal: Kategori OpenCode (DeepSeek V4 Flash), Nvidia NIM (Nemotron 70B Ultra, Llama 3.3), MiniMax AI (MiniMax-01 / M3), Ollama Cloud (Kimi K2.7 Code, Gemma 31B), serta Flagship Cloud (Meta Llama 3.3 70B, Mistral Large 2, Qwen Coder, Qwen 2.5 72B, Llama 3.1 8B) dengan *failover cascade* otomatis. |
