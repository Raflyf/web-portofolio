# Portofolio Profesional & AI Developer Lab — Rafly Firmansyah

Landing page portofolio profesional dan *Developer Lab* interaktif untuk **Rafly Firmansyah** — Sarjana Komputer (S1 Informatika, Universitas Bina Sarana Informatika), Analis Program Terstandar BNSP, dan Software Engineer yang berfokus pada riset *Natural Language Processing* (NLP), *Machine Learning*, arsitektur backend, dan rekayasa web modern.

Aplikasi ini dibangun dengan **React 19**, **Vite**, **Tailwind CSS v4**, **Framer Motion**, dan **Lenis Scroll**, didukung **Vercel Serverless Functions** serta **Supabase PostgreSQL**. Desainnya menekankan aksesibilitas WCAG 2.2 AA, efisiensi bundle melalui *lazy-loading* dan *code-splitting*, serta arsitektur keamanan *fail-closed* dengan *Row Level Security* (RLS).

---

## Fitur Utama

### Terminal AI
- **Routing Multi-Provider:** Failover otomatis antar penyedia model AI dengan rotasi kunci, pemantauan latensi, dan *fallback* berjenjang saat terjadi antrean atau limitasi.
- **Ground-Truth Portfolio:** Pertanyaan seputar proyek, riset, pendidikan, dan sertifikasi dijawab dari basis data lokal terverifikasi — cepat dan bebas halusinasi.
- **Pencarian Web Real-Time:** Kueri wawasan umum dan berita terkini didukung penelusuran langsung dengan penyaringan dan peringkat relevansi.
- **Memori Berkelanjutan:** Menyimpan wawasan baru dan koreksi pengguna secara terstruktur, dengan konteks terpisah per sesi pengunjung.
- **Keamanan Gateway:** Isolasi kunci API di sisi server, proteksi SSRF, pembatasan laju kueri, sanitasi masukan, dan CORS *allowlist*.

### Dashboard Admin
- **Autentikasi Berlapis:** Proteksi Master PIN dengan hashing kriptografis, penguncian *brute-force*, dan token sesi yang kedaluwarsa otomatis.
- **Data Privat:** Telemetri dan memori hanya dapat dibaca melalui fungsi serverless terverifikasi — akses publik ke tabel dinonaktifkan sepenuhnya via RLS.
- **Visualisasi Analitik:** Statistik kunjungan, tipe perangkat, interaksi kueri, dan riwayat perintah dalam grafik interaktif.
- **Ekspor Log Terproteksi:** Unduh log aktivitas dalam format JSON/CSV dengan sanitasi karakter untuk mencegah *formula injection*.

### Desain & Performa
- **Liquid Glass Design System** yang konsisten di tema gelap dan terang.
- **Aksesibilitas WCAG 2.2 AA:** kontras memadai, navigasi keyboard penuh, dan atribut ARIA pada elemen interaktif.
- **Animasi & Scroll Mulus:** reveal berbasis kompositor dan *smooth scrolling* tanpa mengorbankan performa.
- **Semantik SEO:** Schema.org JSON-LD, OpenGraph, dan favicon multi-resolusi.

---

## Struktur Proyek

```text
.
├── index.html        # Titik masuk aplikasi (meta SEO, OpenGraph, JSON-LD)
├── src/              # Sumber aplikasi React (halaman, komponen, konteks, utilitas)
├── api/              # Fungsi serverless (gateway AI, autentikasi, data privat)
├── database/         # Skema dan migrasi Supabase
├── public/           # Aset statis (favicon, gambar, dokumen)
└── vercel.json       # Routing SPA, header keamanan, dan batas runtime
```

---

## Menjalankan Secara Lokal

**Prasyarat:** Node.js 18+ dan npm.

```bash
# 1. Kloning repositori
git clone https://github.com/Raflyf/web-portofolio.git
cd web-portofolio

# 2. Instal dependensi
npm install

# 3. Konfigurasi environment
cp .env.example .env.local
# Sesuaikan nilai variabel sesuai kebutuhan

# 4. Jalankan server pengembangan
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

**Build produksi:**

```bash
npm run build
npm run preview
```

---

## Konfigurasi Environment

### Variabel Client (Prefix `VITE_`)

| Nama | Deskripsi |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL endpoint Supabase untuk telemetri. |
| `VITE_SUPABASE_ANON_KEY` | Kunci publik Supabase dengan izin RLS terbatas (INSERT saja). |

### Variabel Server

| Nama | Deskripsi |
| :--- | :--- |
| `SUPABASE_URL` | URL endpoint Supabase untuk fungsi serverless. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Kunci privat utama** — hanya digunakan fungsi serverless. Dilarang diekspos ke client. |
| `ALLOWED_ORIGIN` | Domain resmi yang diizinkan dalam kebijakan CORS. |

> Variabel tambahan untuk integrasi AI dan konfigurasi internal didokumentasikan di `.env.example`.

---

## Lisensi

Proyek ini didistribusikan di bawah lisensi [MIT License](https://opensource.org/licenses/MIT).

Hak cipta © 2026 **Rafly Firmansyah**. Seluruh hak dilindungi undang-undang.
