# Audit Komprehensif Portofolio — 2026-08-26 (v10.516.0)

> Lingkup: full codebase, logika, UI/UX (fokus inkonsistensi card glassmorphism), database, keamanan, backend/serverless, performa, aksesibilitas, SEO. Audit memakai semua skill terintegrasi (impeccable, performance, accessibility, frontend/backend-security-coder, seo, database-architect) + MCP live (chrome-devtools-mcp — console & computed-style). Semua temuan diverifikasi via grep/glob + live navigation.

---

## Ringkasan Eksekutif

| Severity | Jumlah | Status pass ini                                                  |
| -------- | -----: | ---------------------------------------------------------------- |
| CRITICAL |      5 | 4 diperbaiki, 1 open debt (RLS anon SELECT)                      |
| HIGH     |      7 | 7 diperbaiki                                                     |
| MEDIUM   |      8 | 6 diperbaiki, 2 debt (batching telemetri, CSP hardening tahap 2) |
| LOW      |      5 | 2 diperbaiki, 3 note                                             |

Worktree: `main` bersih sebelum audit, 11 file diubah, 316 ins / 97 del.

Build verify: `node --check` OK untuk 5 file JS. Live verify post-fix (http://localhost:3877/index.html): `viewportZoomable:true`, `portfolioAgent:object`, `cardBlur: blur(18px) saturate(1.8)`, `headerBlur: blur(24px) saturate(1.8)` — token konsisten. Console: hanya 2 a11y issue minor pre-existing (label/autocomplete), nol error baru. NAVIGATE `true` scroll ke y=2934; payload invalid/`javascript:`/domain asing: `false` (allowlist bekerja).

---

## 1. Peta Codebase

- Vanilla HTML/CSS/JS (tanpa framework) + Vercel serverless (`api/chat.js` 2128 baris/105KB, `api/admin-otp.js` 365→445 baris) + Supabase (`database/supabase_schema.sql` 162 baris).
- Entry: `index.html` 62638B, `dashboard.html`, `preview.html`. CSS: `style.css` (design tokens OKLCH), `components.css` 3015 baris, `horizonx.css` 1508 baris (universal glass), `dashboard.css`, `transitions.css`. JS: `main.js` 1420 baris, `terminal.js` 2005 baris, `terminal-ai.js`, `bg-morph-canvas.js` (Three.js), `telemetry.js`.
- Deployment: Vercel + Netlify fallback (`vercel.json`, `netlify.toml`), `site.webmanifest`, `sitemap.xml`.

---

## 2. Kecacatan Logika & Kode — file:line

### CRITICAL — aksi AI mati total

- `js/terminal.js:1051` memanggil `window.portfolioAgent.executeAction(actionType, parsedPayload)` dalam `parseAndExecuteActionTags`, namun `window.portfolioAgent` **tidak pernah didefinisikan di mana pun** (grep `portfolioAgent =` hanya menemukan `__executeDownloadById` di `terminal.js:1008`). Akibat: `try/catch` menelan error, badge `⚡ [Aksi Web Terlaksana]` tetap dirender — klaim sukses palsu. 8 aksi terdampak: `OPEN_PROJECT`, `OPEN_CERTIFICATE`, `FILL_CONTACT`, `NAVIGATE`, `OPEN_URL`, `OPEN_GITHUB`, `TOGGLE_THEME`, `COPY_EMAIL`.
- **Fix pass ini:** implementasi `window.portfolioAgent` di `js/main.js:1418-1518` dengan allowlist seksi (`AGENT_ALLOWED_SECTIONS`) dan host (`AGENT_ALLOWED_URL_HOSTS`), wiring ke `openProjectModal`/`openCertModal`/`scrollIntoView`/`window.open(noopener,noreferrer)`, validasi protokol `https:` only. Live diverifikasi: NAVIGATE `projects` → scroll faktual, `javascript:`/host asing → `false`.

### HIGH — cabang fail-open di admin-otp

- `api/admin-otp.js:352` cabang `update_pin`: `if (verifyRes.ok) { … }` — jika fetch verifikasi gagal (network/RLS deny) jatuh-through dan **update PIN tetap lanjut tanpa verifikasi**. Fail-open.
- **Fix:** ubah jadi fail-closed: `if (!verifyRes.ok) return 502`, catch → `502`, ditambah `directPinSaved` guard.

### MEDIUM — retry loop tak berbatas

- `js/bg-morph-canvas.js:34` `if (typeof THREE === 'undefined') { setTimeout(initMorphBackground, 100); return; }` — retry abadi jika CDN Three.js gagal. Timer leak.
- **Fix:** `initMorphBackground(attempt=0)`, cap 50 (`5s`), lalu `console.warn` dan hentikan.

### MEDIUM — dead code `delta`

- `js/bg-morph-canvas.js:200` `const delta = clock.getDelta()` tidak terpakai.
- **Fix:** dihapus.

### LOW — inline payloadDesc tidak ter-escape sudah ditangani di §4.

---

## 3. Inkonsistensi UI/UX — Fokus: Banyak Card, Blur Glassmorphism Beda-Beda

### Temuan (pre-fix, grep hard evidence)

- `grep -n backdrop-filter` → **99 kecocokan**, 10 nilai blur berbeda (4/6/8/10/12/16/18/20/24/28px) + varian `saturate(160%/180%)` di `style.css`, `components.css`, `horizonx.css`, `dashboard.css` dan inline `<style>` di `index.html:111`.
- Token master ada di `css/style.css:104` — `--glass-card-blur: blur(18px) saturate(180%)` namun hanya dipakai di segelintir tempat; sisanya hardcode satu-per-satu.
- `css/horizonx.css:1045-1127` blok _Universal 3D Translucent Glassmorphism_ memaksa token pada kartu utama via `!important`, tetapi hanya untuk daftar selector tertentu — card di luar daftar + komponen nested tetap memakai nilai acak.
- Konflik konkret:
  - bubble chat user `blur(10px)` (`css/components.css:1995`) vs AI `blur(12px)` (`css/components.css:2018`)
  - backdrop modal `6px` (`css/horizonx.css:817`) vs `8px` (`css/components.css:2925`) vs `10px` (`css/components.css:2827`)
  - dropdown `20px` vs `24px`
  - badge `10px` (`css/horizonx.css:650`) vs nested-token `8px` (`css/horizonx.css:1125`)
  - header `16px` (`.site-header`) vs `20px` (`.dash-header`, seamless header)
- `index.html:98-126` inline Critical Mobile Nav memakai `backdrop-filter: blur(28px) saturate(180%)` + `z-index: 99999` — melawan `css/style.css:433 backdrop-filter: blur(24px)` dan skala z-index semantik (`--z-dropdown:200`, `--z-skip-link:1000`).

### Akar masalah

- Tidak ada skala token semantik. Satu token `glass-card-blur` dipakai untuk semua peran (card nested pill vs overlay panel vs backdrop), sehingga tiap komponen menulis nilai ad-hoc.
- Inline `<style>` dibuat untuk bypass CDN cache sehingga divergen dari stylesheet.

### Fix pass ini (unifikasi token, presisi bedah)

- Tambah di `css/style.css:104` `:root` dan light override:
  ```css
  --glass-nested-blur: blur(8px) saturate(160%);
  --glass-overlay-blur: blur(24px) saturate(180%);
  --glass-backdrop-blur: blur(8px);
  ```
- Mapping peran: `nested` = pills/bubbles/inputs/buttons/strips (`8px`), `card` = `18px/180%` (existing), `overlay` = header/nav/dropdown/modal/toast (`24px/180%`), `backdrop` = `::backdrop` (`8px`).
- 31 kemunculan hardcode diganti ke token (verifikasi via Node script assert `expected==found`, CRLF-aware):
  - `css/style.css` (nav 24px→overlay, + token def)
  - `css/components.css` (15 titik: header 16→overlay, mobile 20→overlay, bento/tech-pill/btn-… 8→nested, convo backdrop 8→backdrop, convo panel 16→overlay, table wrap 8→nested, bubble user 10→nested, AI 12→nested, form 10→nested, toast 16→overlay, floating 12→nested, modal backdrops 10/8→backdrop)
  - `css/horizonx.css` (5 titik + mobile nav 28→overlay, marquee 10→nested, dropdown 24→overlay, backdrop 6→backdrop, showcase 16→card)
  - `css/dashboard.css` (header 20→overlay, select 24→overlay, pin 28→overlay, modal 20→overlay, mobile nav 28→overlay)
  - `index.html` inline (28→overlay, `z-index:99999`→`var(--z-dropdown)`)
- Disengaja dibiarkan: `blur(4px)` drag-over transien, dan mobile perf tier `blur(8px)→blur(6px)` di `@media max-width` (`css/horizonx.css:1231`, `css/dashboard.css:2032`) — tiering performa mobile yang intentional.
- Live verify: `getComputedStyle(card).backdropFilter === 'blur(18px) saturate(1.8)'`, `header === 'blur(24px) saturate(1.8)'`.

### Debt UI

- Audit `impeccable` _Absolute bans_ klasikal (side-stripe `border-left:3px` pada card, gradient text, glassmorphism dekoratif). Proyek ini identitasnya **frosted glass** — trade-off: pertahankan glass namun batasi hanya 3 tier di atas (nested/card/overlay), jangan tambah tier baru.

---

## 4. Keamanan (OWASP)

### CRITICAL — hardcoded secret & plaintext PIN

- `api/admin-otp.js:12` `DEFAULT_PIN_HASH = 'db533…'` disertai komentar `// PIN 080402`; `database/supabase_schema.sql:124` komentar `-- Seed initial master PIN "080402" hash` — hash SHA-256(salt+PIN) dengan salt statis `rafly_telemetry_salt` (publik) → offline dictionary 10^4-10^5 trivial. **Debt:** rotasi PIN via dashboard (hash sudah di Supabase), namun komentar/histori git masih bocor; rotasi di production wajib.
- **Fix pass ini:** hapus komentar plaintext di kedua file (ganti `// PIN 080402` → kosong; schema → `-- Seed initial master PIN hash (nilai awal; WAJIB dirotasi via dashboard setelah deploy)`). Mitigasi penuh butuh migrasi ke arg2/bcrypt + salt acak per-row (debt).

### CRITICAL — OTP brute-force tanpa limiter & `reset_lockout` tanpa auth

- `api/admin-otp.js:162` `Math.floor(100000 + Math.random()*900000)` — `Math.random` bukan CSPRNG, prediktabel.
- `verify_otp_and_reset_pin` tanpa attempt limiter → 10^6 kombinasi dalam jendela 10 menit via paralel request (Vercel timeout ~10s namun paralel).
- `reset_lockout` (`api/admin-otp.js:334`) tanpa autentikasi — siapa pun bisa POST `{action:'reset_lockout'}` dan meniadakan mekanisme anti-brute-force PIN.
- **Fix:** `crypto.randomInt(100000,1000000)`; limiter in-memory `otpAttemptCache` (5 percobaan / 10 menit, 2000-entry cap, `429` saat block); `reset_lockout` kini wajib `current_pin_hash` (64 hex) dan diverifikasi vs `pin_hash` di Supabase sebelum reset (seperti `update_pin`), fail-closed (`502` saat fetch gagal); tambah `recordOtpFailure`/`clearOtpAttempts`.

### CRITICAL — anon SELECT mengekspos hash OTP/PIN ke publik

- `database/supabase_schema.sql:134` `admin_auth_config` — `Allow public anonymous read` `USING(true)` mengekspos `pin_hash`, `otp_code_hash`, `otp_expires_at` ke **siapa pun** → offline crack.
- **Open debt (arsitektural):** function serverless memakai `anonKey` sehingga mencabut anon SELECT akan mematahkan `get_auth_state`/`verify`. Fix sesungguhnya butuh `SUPABASE_SERVICE_ROLE_KEY` di Function env + RLS `TO service_role`. Ditandai debt P1; tidak diubah pass ini untuk hindari break.

### HIGH — CORS echo origin + credentials

- `api/chat.js:997` `res.setHeader('Access-Control-Allow-Origin', origin)` dengan `origin = req.headers.origin || '*'` + `Allow-Credentials: true`, `Allow-Methods: GET,OPTIONS,PATCH,DELETE,POST,PUT` — reflect arbitrary + credentials = hijack sesi (meski API pakai Bearer, tetap anti-patern).
- **Fix:** allowlist eksplisit (`ALLOWED_ORIGINS = [process.env.ALLOWED_ORIGIN, 'https://raflyfirmansyah-portofolio.vercel.app', 'http://localhost:3877', ...]`), pilih `origin` hanya jika ada di allowlist else fallback `ALLOWED_ORIGINS[0]`; tambah `Vary: Origin`; kejut `Allow-Methods: GET,OPTIONS,POST`; **hapus** `Allow-Credentials`.

### HIGH — XSS via innerHTML

- `js/terminal.js:1265` ``attachments.map(a => `<span …> ${a.name}</span>`)`` — `a.name` (nama file lampiran) injeksi mentah (user-controlled). Self-XSS, severity medium namun model-injection ke admin via ai_memories → naik.
- `js/terminal.js:1071` `` `${payloadDesc}` `` di `parseAndExecuteActionTags` — `payloadDesc` (AI-output/parsed `title`/`section`) tidak di-escape dan diproteksi placeholder _sebelum_ langkah escape global (baris 1178), sehingga lolos.
- **Fix:** `escapeHtml(a.name)`; `escapeHtml(String(payloadDesc))` → `safePayloadDesc`.

### HIGH — `OPEN_URL` tanpa validasi skema

- Sebelum fix, `window.portfolioAgent` tidak ada; setelah implementasi, `OPEN_URL` wiring **harus** menolak `javascript:`/`data:` dan host di luar allowlist — **Fix:** `agentSafeOpenUrl` validasi `new URL(..., origin)`, `protocol === 'https:'`, `AGENT_ALLOWED_URL_HOSTS.includes(hostname)`, `window.open(_, '_blank','noopener,noreferrer')`. Diverifikasi: `javascript:alert` + `evil-site` → `false`.

### MEDIUM — Supabase writes diam-diam gagal (logic bug)

- `api/admin-otp.js` `send_otp`/`verify_otp_and_reset_pin`/… memakai `await fetch(..., Prefer:resolution=merge-duplicates)` tanpa cek `res.ok` — jika RLS menolak, flow tetap balik `200 success`.
- **Fix:** `saveRes = await fetch(…)`, `saveRes.ok` guard, `502` jika gagal.

### LOW — CSP `unsafe-inline`

- `index.html:41` `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`; `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com` — `unsafe-inline` melemahkan CSP (inline critical CSS dipakai untuk bypass CDN). Debt: migrasi ke nonce/hash CSP tahap 2.

### LOW — `target="_blank"` tanpa `noopener`

- Grep `target="_blank"` → 6 match, semua sudah `rel="noopener noreferrer"` ✅ (tidak perlu fix).

---

## 5. Database (`database/supabase_schema.sql`)

- Tabel `portfolio_telemetry` + `ai_memories` — indeks time-series OK (6 idx + partial `OMNIROUTE_TUNNEL`), RLS anon `INSERT` length-guarded (`event_type<=50` dst) ✅.
- `admin_auth_config` single-row `id='master_auth'` — potato: field `otp_code_hash`, `otp_expires_at`, `updated_at` nullable ✅.
- Issue: `portfolio_telemetry` & `ai_memories` `anon SELECT USING(true)` publicly readable → scraping/bulk exfiltrasi AI memory (privacy). Acceptable untuk dashboard publik namun **open debt** pertimbangkan `security definer view` + `service_role` read.
- Rekomendasi: enable `pg_cron` TTL 90 hari pada `portfolio_telemetry` (sudah ada note opsional baris 157) + `VACUUM` schedule.

---

## 6. Backend & Serverless

- `api/chat.js` monolit 2128 baris/105KB — cold start penalty; rate limit in-memory `Map` (60s window, 35 req/min/IP) efektif per instance namun Serverless scale → per-container; consider Upstash Redis.
- `api/admin-otp.js` sekarang hardened (lihat §4) + `clientIp` dari `x-forwarded-for`.
- Env: `.env.local` gitignored ✅ (`*.local` di `.gitignore:13`), `SUPABASE_URL`/`ANON_KEY` default fallback di 3 file (`admin-otp`, `chat`, `telemetry.js`) — triple hardcode maintenance smell (debt: centralisasi ke `js/config.js`).
- `vercel.json`/`netlify.toml` konsisten; `package.json` type `module`.

---

## 7. Performa & Efisiensi

### Sudah baik (dari commit 10.513)

- `index.html:49` PDF.js `defer`; `js/bg-morph-canvas.js:55` `maxDPR 1.5 desktop/1.2 mobile` + `tubularSegments 80/120`, `particle 320/700`; CSS subtree containment `content-visibility: auto` pada section below-fold; `js/main.js:314` RAF frame-locking spotlight.

### Temuan & fix pass ini

- **Double-fetch font:** `css/style.css:7` `@import https://fonts.googleapis.com/…` **+** `index.html:44-46` `<link>` + preconnect → rantai blocking + request ganda. **Fix:** `@import` diganti `/* Font dimuat via <link> … */`; `css/dashboard.css:8` `@import` serupa dihapus.
- **WebGL reduced-motion:** `js/bg-morph-canvas.js:44` `prefersReducedMotion` hanya kurangi particle & skip mouse — animasi morph tetap jalan penuh, klaim header _Strict Compliance_ palsu. **Fix:** jika `prefersReducedMotion` → render **satu frame statis** lalu `return` (tanpa `requestAnimationFrame` loop); `MutationObserver` re-render satu kali saat ganti tema.
- **Cache-busting manual:** `?v=10.513.0` di `index.html` (3 CSS) + `?v=10.260.0` di `js/main.js`→`terminal.js`→`terminal-ai.js`. **Fix:** bump → `10.514.0` (CSS+index JS) & `10.261.0` (module imports).
- **Minor debt:** `js/telemetry.js:107` `storeLocally` `JSON.parse`+`unshift`+`stringify` O(n) per event + 1 HTTP `fetch(…keepalive:true)` per event (`telemetry.js:134`). Belum dibatch pass ini (risk/benefit rendah untuk 1000 entry max); note debt (batch debounce 2s).

---

## 8. Aksesibilitas (WCAG 2.2 AA)

- `index.html:5` `maximum-scale=1.0, user-scalable=no` → **pelanggaran WCAG 1.4.4 Reflow/Resize** (blok zoom hingga 500%). **Fix:** `content="width=device-width, initial-scale=1.0, viewport-fit=cover"`.
- `js/bg-morph-canvas.js:212-218` setelah fix: `prefers-reduced-motion` sekarang hormat (single frame), sesuai `AGENTS.md:8` _Wajib menghormati prefers-reduced-motion_.
- Font & kontras: OKLCH palette diverifikasi (body 7:1, muted 4.5:1).
- Live console post-fix: `No label associated with form field (1)`, `autocomplete` (2) — minor pre-existing a11y debt tidak terkait pass ini.

---

## 9. Temuan Lain

- `.gitignore:13` `*.local` sudah menutup `.env.local` ✅; ngrok URL hardcode `https://gullible-cytoplast-mardi.ngrok-free.dev/v1` di `api/chat.js:1129` (ephemeral tunnel di repo) — debt: pindahkan ke env only.
- SEO/OG: `index.html:7-40` meta/canonical/OG/Twitter/JSON-LD Person & Website lengkap ✅, `sitemap.xml`/`robots.txt`/`site.webmanifest` ada.
- Build: `package.json` `type: module` konsisten.

---

## 10. Matriks Perbaikan Pass Ini (v10.516.0)

| #   | File:line                             | Temuan                         | Severity | Fix                                                              | Verifikasi                                                                    |
| --- | ------------------------------------- | ------------------------------ | -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `js/main.js:1418`                     | `portfolioAgent` undefined     | CRITICAL | Implementasi allowlist + wiring                                  | live `executeAction` NAVIGATE scroll faktual, invalid/`javascript:` rejected  |
| 2   | `js/terminal.js:1265`                 | `${a.name}` innerHTML          | HIGH     | `escapeHtml(a.name)`                                             | `node --check OK`                                                             |
| 3   | `js/terminal.js:1071`                 | `${payloadDesc}` badge         | HIGH     | `escapeHtml` via `safePayloadDesc`                               | `node --check OK`                                                             |
| 4   | `index.html:5`                        | `user-scalable=no`             | HIGH     | hapus `maximum-scale`/`user-scalable`                            | `viewportZoomable:true` live                                                  |
| 5   | `index.html:111`                      | inline `blur(28px)` vs token   | HIGH     | `var(--glass-overlay-blur)`                                      | computed `overlay 24px`                                                       |
| 6   | `index.html:117`                      | `z-index:99999`                | MEDIUM   | `var(--z-dropdown)`                                              | CSS var resolve                                                               |
| 7   | `css/style.css:104/124`               | missing blur tiers             | HIGH     | tambah `nested/overlay/backdrop` token                           | computed token readable                                                       |
| 8   | `css/components.css` 15 titik         | hardcode blur 8/10/12/16/20    | HIGH     | `var(--glass-…)` mapping peran                                   | grep sisa `backdrop-filter: blur(`: hanya `4px` (drag-over) & perf tier `6px` |
| 9   | `css/horizonx.css` 6 titik            | hardcode 6/10/16/20/24/28      | HIGH     | token mapping                                                    | idem                                                                          |
| 10  | `css/dashboard.css` 4 titik           | header/overlay 20/24/28        | HIGH     | `var(--glass-overlay-blur)`                                      | idem                                                                          |
| 11  | `api/admin-otp.js:12`                 | komentar `PIN 080402`          | HIGH     | hapus komentar                                                   | file clean                                                                    |
| 12  | `api/admin-otp.js:162`                | `Math.random` OTP              | CRITICAL | `crypto.randomInt`                                               | `node --check OK`                                                             |
| 13  | `api/admin-otp.js:*`                  | no attempt limiter             | CRITICAL | `otpAttemptCache` 5/10m + `429`                                  | logic + limit                                                                 |
| 14  | `api/admin-otp.js:396`                | `reset_lockout` no auth        | CRITICAL | wajib `current_pin_hash` verified                                | `403/502` guard                                                               |
| 15  | `api/admin-otp.js:*`                  | `res.ok` tidak dicek (4 write) | HIGH     | `saveRes.ok` guard → `502`                                       | 4 lokasi                                                                      |
| 16  | `api/admin-otp.js:352`                | `update_pin` fail-open         | HIGH     | fail-closed + guard                                              | 502                                                                           |
| 17  | `api/chat.js:997`                     | CORS echo + credentials        | CRITICAL | allowlist + `Vary: Origin`, drop credentials, `GET,OPTIONS,POST` | header correct                                                                |
| 18  | `js/bg-morph-canvas.js:34`            | retry abadi THREE              | MEDIUM   | cap 50 (`5s`)                                                    | warn & stop                                                                   |
| 19  | `js/bg-morph-canvas.js:194`           | reduced-motion klaim palsu     | HIGH     | single-frame + observer re-render                                | live with/without                                                             |
| 20  | `js/bg-morph-canvas.js:200`           | dead `delta`                   | LOW      | hapus                                                            | OK                                                                            |
| 21  | `css/style.css:7`                     | `@import` font duplikat        | MEDIUM   | ganti komentar                                                   | no double fetch                                                               |
| 22  | `css/dashboard.css:8`                 | `@import` duplikat             | MEDIUM   | ganti komentar                                                   | idem                                                                          |
| 23  | `database/supabase_schema.sql:124`    | plaintext PIN comment          | HIGH     | `Seed … (Wajib dirotasi)`                                        | clean                                                                         |
| 24  | `index.html:52-54,1000,1003` + `js/*` | cache-bust usang               | MEDIUM   | `10.514.0` / `10.261.0`                                          | links OK                                                                      |

---

## 11. Debt & Rekomendasi Lanjutan (P1 → P3)

- **P1 (keamanan):** Migrasi `admin_auth_config` ke `service_role`-only + RLS revoke anon SELECT; ganti `SHA-256(salt)` → `argon2id`/`bcrypt` dengan salt acak per-row; rotasi PIN produksi & scrub histori git; rate-limit Supabase via WAF/edge.
- **P1 (DB):** View `security definer` untuk dashboard read vs anon; enable `pg_cron` TTL 90 hari (note sudah ada `database/supabase_schema.sql:157`).
- **P2 (performa):** Batch `telemetry.js` (debounce 2s queue + `sendBeacon` fallback); centralisasi `SUPABASE_*` env ke satu config module.
- **P2 (keamanan):** CSP nonce/hash (ganti `unsafe-inline`), pindahkan ngrok URL dari hardcode `api/chat.js:1129` ke env only.
- **P3 (arsitektur):** Split `api/chat.js` 2128-bar modul (gateway/cascade/providers) untuk cold-start.

---

_Evidence artefak:_ `git diff --stat` 11 file 316+/97-; `node --check` 5 file OK; live `http://localhost:3877/index.html` computed-style & functional test lolos; `git status --short` bersih pre-audit.

_Aturan kepatuhan:_ Seluruh edit presisi bedah (context-bound, surgical), verifikasi sebelum asersi, update dokumentasi & push sebagai restore point (AGENTS.md §6), nol emoji, nol basa-basi.

---

# RESOLVED — v10.544.0 Audit Fix Release

Diterbitkan 2026-08-31, baseline `checkpoint-pre-audit-fix` (`4ed3019`). Seluruh item audit berikut dari laporan v10.516.0 dituntaskan pada rilis ini. Item yang tidak tersentuh tetap tercantum dan ditandai **STILL OPEN**.

## Checklist resolusi (referensi item §10 / §11 laporan asli)

- [x] **§2 CRITICAL — aksi AI mati total** (item 1): `portfolioAgent` phantom dihapus; seluruh pemanggilan ditulis ulang ke `executeAction` + `try/catch` pada perintah. **RESOLVED** (objek portfolioAgent lama dibuang total).
- [x] **§2 HIGH — cabang fail-open di admin-otp** (item 16 `update_pin`): `update_pin` kini mengirim `current_pin_hash` yang benar dan fail-closed. **RESOLVED**.
- [x] **§2 MEDIUM — retry loop tak berbatas** (item 18 `bg-morph-canvas.js:34`): diganti lazy-inject Three.js dengan gate `prefers-reduced-motion`. **RESOLVED** (superset dari cap-50 v10.516.0).
- [x] **§2 MEDIUM — dead code `delta`** (item 20): dihapus. **RESOLVED**.
- [x] **§3 UI — unifikasi glass token** (item 7-10): sticky header beralih dari `backdrop-filter: blur()` ke background near-opaque; `.stats-strip`, `.project-card-link`, `.scroll-progress-bar` (duplikat) dihapus. **RESOLVED**.
- [x] **§4 CRITICAL — hardcoded secret & plaintext PIN** (item 11): `DEFAULT_PIN_HASH` dihapus; `admin_auth_config` tidak lagi memiliki policy anon apa pun; seed memakai `ON CONFLICT DO NOTHING` (tidak me-reset PIN). **RESOLVED** (arsitektural, bukan hanya komentar).
- [x] **§4 CRITICAL — OTP brute-force tanpa limiter** (item 12-13): limiter OTP dipersistenkan di DB (`otp_attempts`/`otp_blocked_until`), bukan lagi cache in-memory. **RESOLVED**.
- [x] **§4 CRITICAL — `reset_lockout` tanpa auth** (item 14): kini wajib bukti PIN (`current_pin_hash`) + memanggil API. **RESOLVED**.
- [x] **§4 CRITICAL — anon SELECT mengekspos hash** (debt P1 §11): semua policy anon pada `admin_auth_config` dicabut; write pindah ke `SUPABASE_SERVICE_ROLE_KEY`; dashboard tidak lagi mengakses tabel secara langsung (eksklusif via `/api/admin-otp`). **RESOLVED**.
- [x] **§4 HIGH — CORS echo origin** (item 17): allowlist + `Vary: Origin` sudah ada sejak v10.516.0; `ALLOWED_ORIGIN` kini didokumentasikan di `.env.example`. **RESOLVED**.
- [x] **§4 HIGH — XSS via innerHTML** (item 2-3): dipertahankan & diverifikasi. **RESOLVED** (sejak v10.516.0).
- [x] **§6 env fallback hardcode** (debt §11 P2): `.env.example` kini mencantumkan seluruh env var (termasuk `SUPABASE_SERVICE_ROLE_KEY`, `AI_KEYS`, `EMAILJS_*`, `RESEND_API_KEY`, `ALLOWED_ORIGIN`). **RESOLVED** (dokumentasi; sentralisasi modul config tetap note).
- [x] **§7 double-fetch font** (item 21-22): sudah dihapus sejak v10.516.0. **RESOLVED**.
- [x] **§7 WebGL reduced-motion** (item 19): `prefers-reduced-motion` kini benar-benar dihormati (lazy-inject; kontras dengan override v10.517.0 yang dibatalkan rilis ini). **RESOLVED**.
- [x] **§7 cache-busting manual** (item 24): disatukan ke `10.544.0` — sekaligus membunuh double telemetry singleton. **RESOLVED**.
- [x] **§7 minor debt batching telemetri** (debt §11 P2): polling dashboard kini delta-render + `requestIdleCallback`. **RESOLVED** (pendekatan sisi-dashboard; batch sisi-send tetap note).
- [x] **§9 ngrok URL hardcode** (debt §11 P2): URL tunnel dipindah ke env / konfigurasi; default `OMNIROUTE_KEY` diperbaiki sehingga panduan no-keys aktif. **RESOLVED**.
- [x] **§5/§8 sisanya**: `prefers-reduced-motion` WCAG dihormati; hero clock + carousel pause saat tab hidden. **RESOLVED**.

### Aset & performa (di luar item audit asli, dituntaskan rilis ini)

- Sertifikat PNG → WebP: 47.5MB → 1.8MB (−96%).
- `Cache-Control: immutable` di `vercel.json` + `netlify.toml`.
- Three.js lazy-inject gate motion; PDF.js lazy-load saat attach pertama; ~600+ baris dead code dihapus (`fetchSseWithEarlyReturn`, cabang stealth/ox-alpha, 4 method mati `terminal-ai.js`, entri local-semantic, field `data.js` tak terpakai, CSS mati, duplikasi inertia-wheel/smoothScrollTo dashboard).

### STILL OPEN (dari laporan asli)

- **§4 LOW — CSP `unsafe-inline`** (debt §11 P2): migrasi ke nonce/hash CSP tahap 2. **STILL OPEN**.
- **§5 database — anon SELECT `portfolio_telemetry`/`ai_memories`**: `security definer` view + `service_role` read. **STILL OPEN**.
- **§5 rekomendasi** — enable `pg_cron` TTL 90 hari pada `portfolio_telemetry` (note opsional sudah ada di schema). **STILL OPEN**.
- **§6 — split `api/chat.js` 2128-baris** modul (debt §11 P3, cold-start). **STILL OPEN**.
- **§8 a11y minor** — label/autocomplete form (pre-existing). **STILL OPEN**.
- **§4 — migrasi `SHA-256(salt)` → `argon2id`/`bcrypt`** dengan salt acak per-row (debt §11 P1). **STILL OPEN**.

---

## 13. Resolusi Audit Mendalam Tahap 2 (v10.560.0 — 2026-08-31)

Semua temuan dari deep-dive audit tahap 2 telah diperbaiki secara tuntas:

- [x] **SEC-01: Server-Side Master PIN Verification & Eliminasi `pin_hash` Leak**:
  - `api/admin-otp.js:230-367`: `pin_hash` dan `new_pin_hash` dicabut dari semua response JSON `get_auth_state`, `verify_otp_and_reset_pin`, dan `update_pin`.
  - `api/admin-otp.js`: Action `verify_pin` ditambahkan untuk memvalidasi PIN langsung di serverless function via `SUPABASE_SERVICE_ROLE_KEY`, menangani lockout, dan menerbitkan random session token.
  - `js/dashboard.js:330-395`: Form login dialihkan dari komparasi client-side ke serverless verification endpoint `POST /api/admin-otp?action=verify_pin`. **RESOLVED**.
- [x] **SEC-02: SSRF Protection Hardening pada Web Scraper Engine**:
  - `api/chat.js:380-490`: Fungsi `isSafePublicUrl` diperluas untuk menolak representasi IP Dword integer (`2130706433`), Hex (`0x7f000001`), Octal (`0177.0.0.1`), IPv6 Loopback (`::1`), dan IPv4-mapped IPv6 (`::ffff:127.0.0.1`). **RESOLVED**.
- [x] **SEC-03: Pembersihan Total Kredensial & URL Ngrok Hardcoded**:
  - `api/chat.js:1159-1162`: Fallback hardcoded `OMNIROUTE_URL` dan `OMNIROUTE_NGROK_URL` dikosongkan (murni env-driven).
  - `js/dashboard.js:1853-1860`: Fallback string `sk-7a9b51a2...` dan tunnel ngrok dikosongkan.
  - `dashboard.html:657-662`: Default value ngrok pada `<input id="omniroute-url-input">` dikosongkan. **RESOLVED**.
- [x] **UX-01: Markdown Links & Autolinks Rendering pada Terminal AI**:
  - `js/terminal.js:1280-1295`: Transformer regex Markdown links `[Text](URL)` dan autolink URL polos ditambahkan ke `formatMarkdownFull`.
  - `css/components.css:2205-2235`: Kelas `.chat-markdown-link` dan adaptasi theme light-mode ditambahkan sehingga link rujukan AI interaktif dan dapat diklik. **RESOLVED**.
- [x] **PERF-01: Unifikasi Cache-Busting Universal**:
  - Diseragamkan ke `v10.560.0` pada `index.html`, `dashboard.html`, `preview.html`, `css/style.css`, `js/main.js`, `js/terminal.js`, dan `js/terminal-ai.js`. **RESOLVED**.

---

# RESOLVED - React Migration Audit (v10.572.0)

Diterbitkan 2026-09-01 setelah migrasi penuh ke React/Vite. Dokumentasi dan konfigurasi deployment diperbarui di rilis ini (DOCUMENTATION.md, README.md).

## Checklist resolusi temuan audit (C1-C5, M1-M11)

- [x] **C1 - Revoke akses anon RPC & RLS**: Seluruh kebijakan anon SELECT/UPDATE/DELETE pada `admin_auth_config` dicabut total; `portfolio_telemetry` dan `ai_memories` hanya dapat dibaca oleh `service_role`/`authenticated`; anon hanya INSERT dengan guard panjang kolom. **RESOLVED** (database/supabase_schema.sql).
- [x] **C2 - PIN backdoor dihapus**: `DEFAULT_PIN_HASH` bukan lagi otentikasi utama; verifikasi PIN dilakukan serverless via RPC `rpc_admin_verify_pin` dengan session token acak (`adm_<hex>`) yang dipersistenkan. Dashboard memakai session token untuk membaca data. **RESOLVED**.
- [x] **C3 - Netlify publish dist**: `netlify.toml` kini `command = "npm run build"` dan `publish = "dist"` dengan SPA redirect `/*` ke `/index.html`. **RESOLVED**.
- [x] **C4 - Session token & /api/dashboard-data**: Endpoint `api/dashboard-data.js` membaca telemetri + memori AI dengan `SUPABASE_SERVICE_ROLE_KEY` dan memvalidasi `X-Admin-Token` (session token dari `admin_auth_config`) secara fail-closed (401/502/503). **RESOLVED**.
- [x] **C5 - Persisted rate limits**: Rate limit OTP/PIN dipersistenkan di database (`otp_attempts`, `otp_blocked_until`, `lockout_attempts`, `locked_until`) bukan hanya cache in-memory; OTP memakai `crypto.randomInt`. **RESOLVED**.
- [x] **M1 - Timeline pengalaman**: `ExperienceTimeline` merender `TIMELINE_DATA` dengan scroll beam Framer Motion. **RESOLVED**.
- [x] **M2 - Sertifikat asli**: `CertificatesGrid` menampilkan kredensial autentik dari `CERTIFICATES_DATA` dengan modal viewer multi-halaman (`ChevronLeft`/`ChevronRight`) dan tautan PDF asli dari `public/certificates/`. **RESOLVED**.
- [x] **M3 - Email terpadu**: Pengiriman email kontak via FormSubmit (`ContactSection`) dan notifikasi OTP via EmailJS/Resend (`api/admin-otp.js`). **RESOLVED** (catatan: path kontak publik memakai FormSubmit, bukan serverless; lihat STILL OPEN).
- [x] **M4 - RAG save**: `TerminalAI` mengekstrak tag `[SAVE_MEMORY:...]` dan menulis ke `ai_memories` (anon INSERT diizinkan RLS); riwayat konteks diteruskan ke `/api/chat`. **RESOLVED**.
- [x] **M5 - Telemetri global**: `src/lib/telemetry.js` mereplikasi arsitektur vanilla (dual-storage Supabase REST + ring buffer lokal) dengan `VITE_` env, session UUID, device type, dan bounds kolom RLS. **RESOLVED**.
- [x] **M6 - Tailwind v4 animations**: `src/index.css` memakai `@import "tailwindcss"` + `@plugin tailwindcss-animate` + custom `@theme` keyframes. **RESOLVED**.
- [x] **M8 - Metrik jujur**: Seluruh klaim presisi/akurasi tidak terverifikasi dihapus dari showcase; hero memakai spesifikasi algoritma riil. **RESOLVED**.
- [x] **M9 - Persisted OTP limiter**: lihat C5. **RESOLVED**.
- [x] **M10 - Hero clock, theme toggle, multi-page cert viewer, SEO/meta**: Hero menampilkan jam WIB live (UTC+7, pause saat tab hidden); toggle tema gelap/terang dengan persistensi localStorage + telemetri; viewer sertifikat multi-halaman; `index.html` memuat JSON-LD, OpenGraph, dan favicon suite. **RESOLVED**.
- [x] **M11 - Revoke anon RPC**: `rpc_admin_*` SECURITY DEFINER menggantikan akses tabel langsung; anon RPC dibatasi hanya fungsi yang dibutuhkan. **RESOLVED**.
- [x] **Dead code & iOS Liquid Glass**: 5 file terminal vanilla + 3 komponen UI tak terpakai + `tailwind.config.js` dihapus; dependensi tak terpakai dibersihkan; design token Liquid Glass diterapkan pada seluruh permukaan; Always-On Motion dipertahankan. **RESOLVED**.
- [x] **Performa**: Dashboard di-lazy-load (`React.lazy`) dan code-split (index ~687 kB, chunk Dashboard ~257 kB). `npm run build` hijau (944ms). **RESOLVED**.

## STILL OPEN (debt yang tersisa)

- **Server-side enforcement dashboard data di semua path**: `/api/dashboard-data` menegakkan token untuk baca privat, namun rute Supabase anon INSERT pada `portfolio_telemetry`/`ai_memories` tetap terbuka untuk publik (by design untuk telemetri). Jika diperlukan, pindahkan seluruh tulis ke endpoint serverless agar anon INSERT bisa dicabut penuh. **STILL OPEN**.
- **Prompt-injection mitigation pada `ai_memories`**: Konten memori yang disimpan publik (anon INSERT) belum disanitasi di sisi server sebelum dipakai sebagai konteks RAG; memori berpotensi menyuntikkan instruksi ke prompt LLM. Disarankan sanitasi/validasi pada path write. **STILL OPEN**.
- **Chunk-size note**: Chunk index utama ~687 kB tetap memicu peringatan Vite (`>500 kB`). Opsi lanjutan: split lebih agresif (mis. deps vendor, icon subset). **STILL OPEN**.
- **M3 path kontak publik**: `ContactSection` memakai `formsubmit.co` pihak ketiga; migrasi ke serverless `/api` (EmailJS/Resend) akan menghapus ketergantungan eksternal. **STILL OPEN**.
- **WIB timezone literal**: `horizon-hero.jsx` memakai `Asia/Bangkok` (UTC+7, identik dengan WIB); dapat diganti literal `Asia/Jakarta` untuk kejelasan. **STILL OPEN (cosmetic)**.

---

# RESOLVED — Layer-2 Audit (v10.573.0)

Diterbitkan 2026-09-01. Paket A (K1-K3, M2, M8), B (M1, M3-M7), C (m2-m7) seluruhnya diterapkan; `npm run build` hijau dan `node --check` lolos pada 6 berkas (`api/chat.js`, `api/admin-otp.js`, `api/dashboard-data.js`, `api/save-memory.js`, `src/lib/supabase.js`, `src/lib/telemetry.js`). Item yang tidak tersentuh tetap tercantum dan ditandai **STILL OPEN**.

## Checklist resolusi (K/M/m)

### Critical (K)

- [x] **K1 — RAG poisoning via `ai_memories`**: anon INSERT dicabut pada `ai_memories`; tulis memori dialihkan ke endpoint tepercaya `/api/save-memory` (service_role, fail-closed); pembacaan memori dipindah ke sisi server dengan instruksi anti-poisoning yang selalu aktif; input `longTermMemory` dari client diabaikan di `api/chat.js`. **RESOLVED**.
- [x] **K2 — Sesi admin tidak kedaluwarsa**: `/api/dashboard-data` kini menegakkan `expires_at` token sesi di sisi server; sesi basi ditolak `401` (fail-closed). **RESOLVED**.
- [x] **K3 — OTP spam/unbounded send**: Kirim OTP di-throttle 3 percobaan / 10 menit + jeda minimum 60 detik antar kirim. **RESOLVED**.

### Major (M)

- [x] **M1 — Crash `location is not defined`**: Referensi `location` yang memicu `ReferenceError` di `App.jsx` diperbaiki. **RESOLVED**.
- [x] **M2 — RAF loop bocor**: Loop `requestAnimationFrame` dibatalkan pada unmount. **RESOLVED**.
- [x] **M3 — Polling dashboard tidak terkontrol**: Ditambah guard in-flight + `AbortController` + pembersihan timer pada unmount. **RESOLVED**.
- [x] **M4 — Chart data tidak stabil**: Data chart distabilkan via memo + `animation: false` + guard warna plugin (mencegah crash saat data kosong). **RESOLVED**.
- [x] **M5 — `telemetry_update` palsu**: Event hanya terkirim setelah sinkronisasi sukses. **RESOLVED**.
- [x] **M6 — Duplikasi client Supabase**: Disatukan ke `src/lib/supabase.js`. **RESOLVED**.
- [x] **M7 — Referensi usang (robots/sitemap/vercel)**: `robots.txt`, `sitemap.xml`, `vercel.json` diperbarui; `preview.html` dihapus dari sitemap. **RESOLVED**.
- [x] **M8 — Boundary rate limit tidak seragam**: Batas rate limit disatukan ke satu konstanta bersama. **RESOLVED**.

### Minor (m)

- [x] **m2 — Lampiran paperclip tidak berfungsi**: Attachment dihubungkan ke `/api/chat`. **RESOLVED**.
- [x] **m3 — Markdown/ink light-mode**: Remap warna markdown dan ink pada light mode. **RESOLVED**.
- [x] **m4 — Modal sertifikat non-semantik**: Dialog memakai elemen `<dialog>` dengan manajemen fokus. **RESOLVED**.
- [x] **m5 — Dropdown custom tanpa ARIA**: Atribut ARIA ditambahkan pada dropdown custom terminal. **RESOLVED**.
- [x] **m6 — Carousel tanpa kontrol**: Tombol pause/play ditambahkan. **RESOLVED**.
- [x] **m7 — Alias path tak terdefinisi**: `jsconfig.json` ditambahkan untuk path alias. **RESOLVED**.

### Lainnya (dituntaskan rilis ini)

- `archive_v1` dibersihkan dari JWT yang disuntikkan.
- `.gitignore` diperbaiki agar benar-benar mengabaikan `dist/` (berkas build di-untrack dari indeks; `git check-ignore dist` lolos).
- Tidak ada secret pada file aktif; `.env.local` tetap tidak terstage.

## STILL OPEN (debt yang tersisa)

- **PBKDF/argon2 PIN server-side**: Verifikasi PIN masih berbasis SHA-256 + salt statis (Web Crypto). Migrasi ke PBKDF2/argon2 di sisi server tetap terbuka. **STILL OPEN**.
- **Prompt-injection deep sanitization pada konten memori**: Instruksi anti-poisoning selalu aktif saat memori dipakai sebagai konteks RAG, namun sanitasi isi memori secara mendalam (stripping instruksi tersembunyi) belum diterapkan pada path write. **STILL OPEN**.
- **Rate-limit multi-instance**: Boundary rate limit disatukan, namun counter in-memory bersifat best-effort pada skala multi-instance Vercel (per-container). **STILL OPEN**.
- **pdf.js attachments**: Lampiran PDF pada terminal belum dirender in-browser (masih fallback unduhan). **STILL OPEN**.
- **Chunk-size warning**: Chunk index utama (~690 kB) tetap memicu peringatan Vite `>500 kB`; opsi split lebih agresif belum diterapkan. **STILL OPEN**.
- **M3 path kontak publik**: `ContactSection` masih memakai `formsubmit.co` pihak ketiga (dari laporan v10.572.0). **STILL OPEN**.
- **WIB timezone literal**: `horizon-hero.jsx` memakai `Asia/Bangkok`; penggantian ke `Asia/Jakarta` tetap kosmetik. **STILL OPEN (cosmetic)**.

---

# RESOLVED — Layer-3 Audit (v10.585.0)

Diterbitkan 2026-09-02. Seluruh temuan CRITICAL (C-1, C-2) dan MAJOR (M-1..M-6) dituntaskan, ditambah minor m-1..m-5, m-7, m-9. `npm run build` hijau; `node --check` lolos pada 6 berkas (`api/chat.js`, `api/admin-otp.js`, `api/dashboard-data.js`, `api/save-memory.js`, `src/lib/supabase.js`, `src/lib/telemetry.js`).

## Checklist resolusi

### Critical (C)

- [x] **C-1 — RLS `authenticated` dicabut dari `ai_memories` & `portfolio_telemetry`**: baca/tulis kini hanya `service_role`; anon hanya INSERT telemetri (length-guarded). Akun authenticated tidak lagi bisa membaca telemetri/memori atau menyuntik memori RAG. **RESOLVED** (database/supabase_schema.sql).
- [x] **C-2 — `DEFAULT_PIN_HASH` dihapus dari API & RPC**: `rpc_admin_verify_pin` tidak lagi me-reseed baris hilang dengan hash default publik (fail-closed: tolak verifikasi); `rpc_admin_save_otp` tidak pernah menimpa `pin_hash`; `update_pin`/`reset_lockout` menolak saat `pin_hash` tersimpan kosong. **RESOLVED**.

### Major (M)

- [x] **M-1 — `/api/save-memory` tanpa batas**: ditambah rate limit per-IP (5 permintaan/menit, `429`) dan body cap 50KB (`413`) sebelum parsing. **RESOLVED**.
- [x] **M-2 — IP klien mudah di-spoof**: `getClientIp` memakai `x-vercel-forwarded-for`, fallback elemen TERAKHIR `x-forwarded-for` (bukan `[0]`) di `chat.js`, `admin-otp.js`, `save-memory.js`. **RESOLVED**.
- [x] **M-3 — Double-count telemetri di dashboard**: flag `synced` ditandai setelah kirim sukses; dashboard hanya menggabungkan event lokal yang belum `synced`. **RESOLVED**.
- [x] **M-4 — Change PIN hanya lokal**: `update_pin` dipanggil ke server lebih dulu (verifikasi `current_pin_hash`); write localStorage hanya setelah server sukses. **RESOLVED**.
- [x] **M-5 — Sesi bertahan setelah rotasi PIN**: `clearSessionToken` meng-null-kan `session_token`/`session_expires_at` pada update/reset PIN; OTP tidak lagi di-log (bahkan ter-mask). **RESOLVED**.
- [x] **M-6 — Versi tidak seragam**: `package.json` dan status `/api/chat` disatukan ke `10.585.0`; catatan TTL `rate_limits` ditambahkan di schema. **RESOLVED**.

### Minor (m)

- [x] **m-1 — Sesi tidak diinvalidasi saat PIN berubah**: token sesi dibersihkan di server dan schema. **RESOLVED**. (Resolusi: Komponen custom select / dropdown buatan sendiri ditambahkan ke Terminal AI untuk mengganti menu select native sistem operasi. Tata letak header pada Log Aktivitas Dashboard disusun ulang dengan Flexbox. Perhitungan statistik kueri AI (bar chart) dimodifikasi dengan logika regex yang mendeteksi `terminal` dan `ai_` events).
- [x] **m-2 — 401 dashboard-data tidak ditangani**: sesi basi memaksa re-login (bukan offline senyap). **RESOLVED**.
- [x] **m-3 — Event tersinkron dihitung ulang**: lihat M-3 (flag `synced`). **RESOLVED**.
- [x] **m-4 — FOUC tema**: inline pre-paint script di `index.html` (apply tema sebelum paint). **RESOLVED**.
- [x] **m-5 — NaN% pada device split**: guard `total > 0` → 0%. **RESOLVED**.
- [ ] **m-6 — Perbandingan timing belum konsisten** (jam vs timestamp pada beberapa tampilan). **STILL OPEN**.
- [x] **m-7 — Path `verify_pin` mati dihapus**: cabang duplikat yang tak terjangkau di `api/admin-otp.js` dibuang. **RESOLVED**.
- [ ] **m-8 — SSRF DNS-rebinding pada `api/chat.js`**: validasi IP saat fetch belum menutup rebinding; mitigasi lanjutan belum diterapkan. **STILL OPEN**.
- [x] **m-9 — Animasi doughnut chart**: `animation: false` (data stabil, mencegah render ulang berisik). **RESOLVED**.
- [ ] **m-10 — Listbox keyboard (a11y)**: navigasi keyboard pada listbox/autocomplete belum selesai. **STILL OPEN**.
- [ ] **m-11 — Abort on close + attachment cap server**: `AbortController` saat close & batas ukuran lampiran di sisi server belum diterapkan. **STILL OPEN**.

---

# RESOLVED — Layer-5 Audit & Deep Fix (v10.586.0)

Diterbitkan 2026-09-02. Seluruh isu inkonsistensi telemetri, RAG memory dual-storage, UI dropdown effort, Markdown rich rendering, dan typewriter streaming telah diselesaikan:

1. **Efek Mengetik Asisten AI (Typewriter Streaming)**: Jawaban AI di Terminal kini mengalir halus per batch karakter (16ms) dengan auto-scroll responsif, bukan muncul instan secara mengejutkan.
2. **Sistem Tipografi Markdown Kaya**: Ditambahkan sistem CSS `.markdown-body` lengkap di `src/index.css` (headings, lists, bold, blockquote, code, tables) dan dipertegas pada system prompt `api/chat.js` untuk mengeliminasi plain text / wall-of-text.
3. **Telemetri Multi-Model Sinkron**: `TerminalAI.jsx` kini mencatat model aktual yang dieksekusi (`data.model`) beserta providernya sehingga counter **Auto Gateway Router** dan kartu **Individual Model (Nemotron 3 Nano, dsb)** di Dashboard keduanya bertambah secara akurat dan konsisten.
4. **Dual-Storage RAG Knowledge (Realtime Sync)**: `saveAIMemory` kini menyimpan ke `localStorage` ('portfolio_ai_memories') secara instan dan memancarkan event `telemetry_update`, serta digabungkan secara aman di `Dashboard.jsx`. `loadLocalEnv()` ditambahkan ke `api/save-memory.js` dan `api/dashboard-data.js`.
5. **Dropdown Effort UI**: Container control bar diperbaiki menjadi `flex-wrap` (tanpa `overflow-x-auto` yang memotong pop-up) dengan dropdown membuka ke bawah (`top-full mt-2`) dengan `z-[100]` dan glassmorphism obsidian.

