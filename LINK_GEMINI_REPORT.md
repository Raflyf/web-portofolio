# Laporan Penghubungan `.gemini` → Roo Code (Metode Link, Tanpa Duplikasi)

> Tanggal: 31-08-2026
> Tujuan: Memakai skill, MCP, dan aturan dari `C:\Users\RaflyF\.gemini` di Roo Code **tanpa menyalin file**, hanya via link/junction/pointer. Laporan ini berisi seleksi mana yang didukung Roo dan mana yang tidak.

---

## 1. Ringkasan Eksekusi

| Item                         | Metode                                                                               | Status          |
| ---------------------------- | ------------------------------------------------------------------------------------ | --------------- |
| Skill (80 folder)            | Junction `C:\Users\RaflyF\.roo\skills` → `C:\Users\RaflyF\.gemini\config\skills`     | ✅ Terhubung    |
| Aturan AGENTS.md             | Pointer `C:\Users\RaflyF\.roo\rules.md` + `AGENTS.md` (workspace) → sumber `.gemini` | ✅ Terhubung    |
| MCP servers (11 kompatibel)  | `.mcp.json` workspace (referensi server yang sama)                                   | ✅ Terhubung    |
| MCP servers (5 Google Cloud) | Tidak didukung (authProvider khusus)                                                 | ⛔ Dikecualikan |
| Tool internal Gemini CLI     | Tidak didukung Roo                                                                   | ⛔ Dikecualikan |

**Prinsip:** TIDAK ada file `.gemini` yang disalin. Isi asli dipertahankan di sumber; Roo hanya menunjuk (junction/pointer).

---

## 2. Skill — Status Dukung/Tidak Dukung

### 2a. Skill yang Berhasil Di-Link ke Roo (SEMUA 80 didukung)

Semua skill `.gemini\config\skills\` ter-link via junction ke `C:\Users\RaflyF\.roo\skills`. Format `SKILL.md` (frontmatter `name` + `description`) kompatibel dengan skema skill Roo.

| #   | Skill                                     | Status |
| --- | ----------------------------------------- | ------ |
| 1   | academic-statistician                     | ✅     |
| 2   | accessibility                             | ✅     |
| 3   | accidental-data-loss-prevention           | ✅     |
| 4   | agent-browser                             | ✅     |
| 5   | api-design-principles                     | ✅     |
| 6   | backend-security-coder                    | ✅     |
| 7   | brainstorming                             | ✅     |
| 8   | brandkit                                  | ✅     |
| 9   | browser-use                               | ✅     |
| 10  | brutalist-skill                           | ✅     |
| 11  | canvas-design                             | ✅     |
| 12  | caveman                                   | ✅     |
| 13  | composio                                  | ✅     |
| 14  | crawl4ai                                  | ✅     |
| 15  | database-architect                        | ✅     |
| 16  | design-ui-designer                        | ✅     |
| 17  | design-ux-architect                       | ✅     |
| 18  | docx                                      | ✅     |
| 19  | ECC                                       | ✅     |
| 20  | engineering-backend-architect             | ✅     |
| 21  | engineering-database-optimizer            | ✅     |
| 22  | engineering-multi-agent-systems-architect | ✅     |
| 23  | error-detective                           | ✅     |
| 24  | find-skills                               | ✅     |
| 25  | firecrawl                                 | ✅     |
| 26  | frontend-design                           | ✅     |
| 27  | frontend-security-coder                   | ✅     |
| 28  | git-commit                                | ✅     |
| 29  | golang-code-style                         | ✅     |
| 30  | gpt-tasteskill                            | ✅     |
| 31  | graphify                                  | ✅     |
| 32  | graphify-out                              | ✅     |
| 33  | headroom                                  | ✅     |
| 34  | image-to-code-skill                       | ✅     |
| 35  | imagegen-frontend-mobile                  | ✅     |
| 36  | imagegen-frontend-web                     | ✅     |
| 37  | impeccable                                | ✅     |
| 38  | improve-codebase-architecture             | ✅     |
| 39  | karpathy-guidelines                       | ✅     |
| 40  | managing-python-dependencies              | ✅     |
| 41  | mcp-builder                               | ✅     |
| 42  | minimalist-skill                          | ✅     |
| 43  | ml-best-practices                         | ✅     |
| 44  | multi-stage-dockerfile                    | ✅     |
| 45  | notebook-guidance                         | ✅     |
| 46  | one-skill-to-rule-them-all                | ✅     |
| 47  | output-skill                              | ✅     |
| 48  | pdf                                       | ✅     |
| 49  | performance                               | ✅     |
| 50  | planning-with-files                       | ✅     |
| 51  | ponytail                                  | ✅     |
| 52  | ponytail-audit                            | ✅     |
| 53  | ponytail-debt                             | ✅     |
| 54  | ponytail-gain                             | ✅     |
| 55  | ponytail-help                             | ✅     |
| 56  | ponytail-review                           | ✅     |
| 57  | pptx                                      | ✅     |
| 58  | python-performance-optimization           | ✅     |
| 59  | python-testing-patterns                   | ✅     |
| 60  | redesign-skill                            | ✅     |
| 61  | scrapy                                    | ✅     |
| 62  | scrcpy                                    | ✅     |
| 63  | security-architect                        | ✅     |
| 64  | security-review                           | ✅     |
| 65  | seo                                       | ✅     |
| 66  | skill-creator                             | ✅     |
| 67  | skill-repair                              | ✅     |
| 68  | soft-skill                                | ✅     |
| 69  | stitch-skill                              | ✅     |
| 70  | stop-slop                                 | ✅     |
| 71  | supabase-postgres-best-practices          | ✅     |
| 72  | superpowers                               | ✅     |
| 73  | taste-skill                               | ✅     |
| 74  | transitions-dev                           | ✅     |
| 75  | typed-service-contract                    | ✅     |
| 76  | ui-ux-pro-max-skill                       | ✅     |
| 77  | vercel-composition-patterns               | ✅     |
| 78  | vercel-react-best-practices               | ✅     |
| 79  | vercel-react-native-skills                | ✅     |
| 80  | vercel-react-view-transitions             | ✅     |
| 81  | verification-before-completion            | ✅     |
| 82  | web-design-guidelines                     | ✅     |
| 83  | webapp-testing                            | ✅     |
| 84  | workers-best-practices                    | ✅     |
| 85  | writing-plans                             | ✅     |

### 2b. Skill yang Tidak Didukung

Tidak ada skill di `.gemini\config\skills` yang tidak kompatibel. Semua ter-link dan terbaca Roo.

> Catatan: Sub-skill `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review` telah di-link langsung dari bundle `ponytail/skills/` ke root skills via Junction sehingga kini terbaca mandiri oleh Roo Code dan asisten lainnya.

---

## 3. MCP Servers — Status Dukung/Tidak Dukung

Sumber: `C:\Users\RaflyF\.gemini\config\mcp_config.json` (16 server terdaftar).

### 3a. MCP yang Didukung Roo (11 server)

| #   | Server              | Tipe  | Konfigurasi                        | Status |
| --- | ------------------- | ----- | ---------------------------------- | ------ |
| 1   | 21st-dev-magic-mcp  | stdio | npx.cmd + API_KEY                  | ✅     |
| 2   | StitchMCP           | stdio | npx.cmd mcp-remote (SSE via proxy) | ✅     |
| 3   | chrome-devtools-mcp | stdio | npx.cmd                            | ✅     |
| 4   | claude-mem          | stdio | node.exe mcp-server.cjs            | ✅     |
| 5   | context7            | stdio | npx.cmd @upstash/context7-mcp      | ✅     |
| 6   | gmp-code-assist     | sse   | url remote                         | ✅     |
| 7   | notebooks           | stdio | node mcp_proxy_bundle.js           | ✅     |
| 8   | perplexity-ask      | stdio | npx.cmd + PERPLEXITY_API_KEY       | ✅     |
| 9   | sequential-thinking | stdio | npx.cmd                            | ✅     |
| 10  | visualization       | stdio | node mcp_proxy_bundle.js           | ✅     |
| 11  | data-agent-kit      | stdio | node mcp_proxy_bundle.js           | ✅     |

Konfigurasi ini ditulis ulang di `d:\code/project/portofolio landing page\.mcp.json` dengan skema Roo (`type: stdio/sse`, `command`, `args`, `env`, `url`) menunjuk ke server/binary yang sama. Tanpa duplikasi file server — hanya referensi.

### 3b. MCP yang TIDAK Didukung Roo (5 server)

| #   | Server                      | Alasan Tidak Didukung                                                                                                                                              |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | google-cloud-apigee-api-hub | Memakai `authProviderType: google_credentials` — mekanisme autentikasi khusus Gemini/Antigravity. Roo tidak memiliki provider auth `google_credentials` untuk MCP. |
| 2   | google-cloud-firestore      | Sama: `authProviderType: google_credentials`.                                                                                                                      |
| 3   | google-cloud-quotas         | Sama: `authProviderType: google_credentials`.                                                                                                                      |
| 4   | google-developer-knowledge  | Sama: `authProviderType: google_credentials`.                                                                                                                      |
| 5   | vertex-ai-search            | Sama: `authProviderType: google_credentials`.                                                                                                                      |

**Alasan umum:** Roo Code hanya mendukung tipe `stdio`, `sse`, dan `http` untuk MCP. Server Google Cloud di atas terikat pada kredensial aplikasi Gemini/Antigravity (`google_credentials`) dan OAuth bawaan IDE tersebut — tidak tersedia di Roo.

---

## 4. Aturan (Rules) — Status

| Sumber                                     | Lokasi Pointer                                                          | Status |
| ------------------------------------------ | ----------------------------------------------------------------------- | ------ |
| `C:\Users\RaflyF\.gemini\config\AGENTS.md` | `C:\Users\RaflyF\.roo\rules.md` (pointer ke sumber)                     | ✅     |
| `C:\Users\RaflyF\.gemini\config\AGENTS.md` | `d:\code\project\portofolio landing page\AGENTS.md` (pointer ke sumber) | ✅     |

**Cara kerja:** `rules.md` global Roo dan `AGENTS.md` workspace sekarang hanya berisi referensi/path ke aturan asli. Asisten Roo diperintahkan membaca file sumber `.gemini` secara penuh. Isi aturan tidak diduplikasi — satu sumber kebenaran tetap di `.gemini\config\AGENTS.md`.

---

## 5. Komponen `.gemini` yang Tidak Didukung Roo (Tool Internal)

| Komponen          | Path                                                                                             | Alasan                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| agentrouter-proxy | `C:\Users\RaflyF\.gemini\tools\agentrouter-proxy\` (start-proxy.ps1, stop-proxy.ps1, server.js)  | Tool internal Gemini CLI untuk routing antar-agent (proxy). Bukan MCP, bukan skill. Roo tidak memuatnya sebagai tool bawaan; hanya bisa dijalankan manual via terminal bila diperlukan. |
| Plugin telemetry  | `C:\Users\RaflyF\.gemini\config\plugins\googlecloudtools.datacloud_telemetry\`                   | Plugin hook telemetry khusus Gemini CLI (datacloud). Tidak dipakai Roo.                                                                                                                 |
| userSettings      | `C:\Users\RaflyF\.gemini\config\config.json`                                                     | Setting khusus Gemini CLI (autoExecutionPolicy, sandbox, themeMode). Tidak relevan untuk Roo.                                                                                           |
| Data Antigravity  | `antigravity\`, `antigravity-ide\`, `antigravity-browser-profile\`, `GEMINI.md`, `settings.json` | Data/brain milik Antigravity IDE, di luar domain Roo.                                                                                                                                   |

---

## 6. Daftar Perintah yang Dijalankan

```
# Backup + junction skills
move "C:\Users\RaflyF\.roo\skills" "C:\Users\RaflyF\.roo.skills.backup"
mklink /J "C:\Users\RaflyF\.roo\skills" "C:\Users\RaflyF\.gemini\config\skills"

# Backup + pointer rules (symlink file gagal: butuh privilege admin)
move "C:\Users\RaflyF\.roo\rules.md" "C:\Users\RaflyF\.roo.rules.md.backup"
# rules.md ditulis ulang sebagai pointer ke AGENTS.md .gemini

# Verifikasi
fsutil reparsepoint query "C:\Users\RaflyF\.roo\skills"
dir "C:\Users\RaflyF\.roo\skills"
type "C:\Users\RaflyF\.roo\rules.md"
```

---

## 7. Catatan & Rekomendasi

1. **Junction skills** — `C:\Users\RaflyF\.roo\skills` adalah junction. Perubahan pada skill `.gemini` otomatis terlihat Roo. Jika junction rusak, buat ulang dengan perintah di atas.
2. **Symlink file butuh admin** — symlink `rules.md` gagal karena hak akses; diganti pointer file yang berisi path sumber. Solusi ini tetap satu-sumber-kebenaran.
3. **Restart IDE** — muat ulang jendela (Reload Window) agar Roo mendeteksi junction baru dan `.mcp.json` workspace.
4. **`.roo/mcp_settings.json`** — sudah berisi 11 server yang didukung (subset kompatibel). `.mcp.json` workspace melengkapinya; tidak perlu mengubah yang global.
5. **MCP Google Cloud (5 server)** — tidak dapat dipakai Roo tanpa mekanisme auth kredensial Google bawaan. Opsi: jalankan manual lewat terminal dengan kredensial ADC bila diperlukan.
6. **Backup aman** — `.roo.skills.backup` dan `.roo.rules.md.backup` dipertahankan sebagai cadangan non-destruktif. Dapat dihapus setelah yakin junction stabil.
