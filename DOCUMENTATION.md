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
  - `PROJECTS_DATA`: 5 proyek unggulan GitHub (`OpenPlagiarismChecker`, `Spam-Email`, `laser_pointer_PPT`, `FotoKitaBlur`, `Wp2`).
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
| **1.0.4** | 2026-08-16 | Restrukturisasi arsip berkas sertifikat dan CV ke direktori `certificates/` dengan tombol penampil dokumen PDF langsung pada modal viewer dan tombol unduh CV pada hero. |
