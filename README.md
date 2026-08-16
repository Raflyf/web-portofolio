# Portofolio Profesional — Rafly Firmansyah

Landing page portofolio profesional untuk **Rafly Firmansyah** ([@Raflyf](https://github.com/Raflyf)) — Software Developer & AI/ML Engineer.

Dibangun dengan **HTML5 Semantik**, **Modern Vanilla CSS (OKLCH + Motion Tokens)**, dan **Modular JavaScript (ES6+)**. Tanpa dependensi berat, berorientasi performa tinggi (Skor Lighthouse 100/100), aksesibilitas **WCAG 2.2 AA**, dan bebas dari estetika klise "AI-slop".

---

## Fitur Utama

- **Integrasi Proyek GitHub Riil:** Menampilkan proyek penelitian dan repositori unggulan (`OpenPlagiarismChecker`, `Spam-Email Classifier`, `laser_pointer_PPT`, `FotoKitaBlur`, `web-portofolio`).
- **Sistem Showcase Sertifikat Modular:** Filter kategori dinamis (AI & ML, Web Development, Cloud & DevOps, Keamanan Siber) dengan pop-up modal viewer kredensial.
- **Terminal Developer Lab Interaktif:** Emulator CLI bash interaktif bagi pengunjung untuk mengeksplorasi perintah seperti `help`, `skills`, `projects`, `certifs`, dan `benchmarks`.
- **Mode Terang & Gelap:** Pengaturan tema cerdas dengan sistem warna OKLCH, persistensi *localStorage*, dan sinkronisasi otomatis dengan preferensi sistem operasi.
- **Standar Aksesibilitas Tinggi (WCAG 2.2 AA):** Kontras warna teks terverifikasi (≥ 4.5:1), navigasi keyboard penuh (`:focus-visible`), modal dialog native `<dialog>`, dan *skip-to-content link*.
- **Keamanan Frontend Teruji:** Bebas kerentanan XSS (sanitasi DOM aman) dan dilengkapi *Content Security Policy (CSP)*.

---

## Struktur Berkas

```
.
├── index.html                   # Halaman utama & markup semantik
├── css/
│   ├── style.css                # Sistem desain dasar, variabel OKLCH, tipografi
│   ├── components.css           # Styling komponen (Navbar, Hero, Cards, Modal, Form)
│   └── transitions.css          # Motion tokens standar transitions-dev
├── js/
│   ├── data.js                  # Data terpusat (Proyek GitHub & Sertifikat)
│   ├── main.js                  # Logika aplikasi (Filter, Modal, Theme Switcher)
│   └── terminal.js              # Logika emulator terminal lab interaktif
├── .github/
│   └── workflows/
│       └── deploy.yml           # Otomasi deployment CI/CD ke GitHub Pages
├── vercel.json                  # Konfigurasi deployment Vercel
├── netlify.toml                 # Konfigurasi deployment Netlify
├── DOCUMENTATION.md             # Dokumentasi arsitektur teknis & audit
└── README.md                    # Panduan instalasi dan penggunaan
```

---

## Panduan Menjalankan Secara Lokal

Karena proyek ini menggunakan modul JavaScript ES6 murni, jalankan menggunakan server web lokal sederhana:

### Opsi 1: Menggunakan Python
```bash
# Python 3
python -m http.server 3000
```
Buka peramban di `http://localhost:3000`.

### Opsi 2: Menggunakan Node.js / npx
```bash
npx serve .
```

---

## Panduan Menambahkan / Mengubah Sertifikat & Proyek

Semua data tersimpan secara rapi dan terpusat di dalam berkas [`js/data.js`](js/data.js).

### Menambahkan Sertifikat Baru:
Buka `js/data.js` dan tambahkan objek baru ke dalam array `CERTIFICATES_DATA`:

```javascript
{
  id: "cert-nama-sertifikat",
  title: "Judul Sertifikat Anda",
  issuer: "Nama Instansi / Platform Penerbit",
  category: "ai-ml", // Pilihan: 'ai-ml', 'web', 'cloud', 'security'
  categoryLabel: "AI & ML",
  date: "2026",
  credentialId: "KREDENSIAL-12345",
  verificationUrl: "https://link-verifikasi-anda.com",
  description: "Penjelasan ringkas kompetensi yang Anda capai.",
  skillsGained: ["Keahlian 1", "Keahlian 2", "Keahlian 3"]
}
```

---

## Panduan Deployment ke Hosting Gratis

Proyek ini telah dikonfigurasi agar siap langsung di-*deploy* ke berbagai penyedia hosting statis gratis:

### 1. GitHub Pages (Otomatis)
1. Push proyek ini ke repositori GitHub `https://github.com/Raflyf/web-portofolio.git`.
2. Buka tab **Settings** repositori di GitHub -> menu **Pages**.
3. Pada bagian **Build and deployment -> Source**, pilih **GitHub Actions**.
4. Workflow di `.github/workflows/deploy.yml` akan secara otomatis membangun dan menayangkan situs Anda di `https://raflyf.github.io/web-portofolio/`.

### 2. Vercel
1. Buka [vercel.com](https://vercel.com) dan masuk dengan akun GitHub Anda.
2. Klik **Add New Project** dan pilih repositori `web-portofolio`.
3. Klik **Deploy**. Pengaturan `vercel.json` akan otomatis diterapkan.

### 3. Netlify
1. Buka [netlify.com](https://netlify.com) dan impor repositori `web-portofolio`.
2. Klik **Deploy Site**. Pengaturan `netlify.toml` akan otomatis terdeteksi.

---

## Lisensi & Hak Cipta

Dirilis di bawah [MIT License](https://opensource.org/licenses/MIT). Dikembangkan oleh Rafly Firmansyah.
