# V1 Architecture Backup (Pre-Stitch Liquid Glass Migration)

Direktori ini berisi snapshot kode sumber antarmuka V1 (arsitektur sebelum migrasi ke tema Liquid Glass Apple visionOS / iOS Stitch):

## Berkas Tersimpan
1. `App.jsx`: Routing V1, Lenis smooth scroll, progress bar, dan navbar floating awal.
2. `Home.jsx`: Komposisi landing page V1 sebelum integrasi backdrop caustics 3D dan liquid glass styling.
3. `Dashboard.jsx`: Dashboard telemetri V1 dengan tema kontras orisinal.
4. `index.css`: Utilitas CSS orisinal sebelum adopsi sistem desain Stitch Liquid Glass.

## Prosedur Pemulihan (Rollback)
Jika diperlukan pengembalian ke antarmuka V1:
1. Salin kembali berkas dari `backup_v1/` ke folder tujuan di `src/`:
   - `backup_v1/App.jsx` -> `src/App.jsx`
   - `backup_v1/Home.jsx` -> `src/pages/Home.jsx`
   - `backup_v1/Dashboard.jsx` -> `src/pages/Dashboard.jsx`
   - `backup_v1/index.css` -> `src/index.css`
2. Jalankan `npm run build` untuk memvalidasi bundle.
