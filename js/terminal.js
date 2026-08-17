/**
 * ============================================================================
 * INTERACTIVE DEVELOPER LAB / TERMINAL SIMULATOR (v5.2.0)
 * CLI Playground, Multimodal Vision AI & Natural Language Assistant
 * Supports:
 * - 🌐 Real-Time Web Search (Live 2026 Encyclopedic Knowledge)
 * - 🖼️ Image Vision Recognition & Analysis
 * - 📄 PDF, Code, & Document Text Ingestion
 * - ⚡ 14+ Verified Flagship & OpenCode/Nvidia/MiniMax/Ollama Models
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js?v=10.33.0';
import { telemetry } from './telemetry.js?v=10.33.0';
import { terminalAI } from './terminal-ai.js?v=10.33.0';

export function initTerminal() {
  const terminalBody = document.getElementById('terminal-body');
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  const chipButtons = document.querySelectorAll('.terminal-chip');
  const modelSelect = document.getElementById('terminal-model-select');
  const submitBtn = document.getElementById('terminal-submit-btn');
  const stopBtn = document.getElementById('terminal-stop-btn');
  const attachBtn = document.getElementById('terminal-attach-btn');
  const fileInput = document.getElementById('terminal-file-input');
  const fileTray = document.getElementById('terminal-file-tray');

  if (!terminalBody || !terminalForm || !terminalInput) return;

  const history = [];
  let historyIndex = -1;
  let isGenerating = false;
  let attachedFiles = [];
  let lastSubmittedPrompt = '';
  let activeThinkingLine = null;

  const effortSelect = document.getElementById('terminal-effort-select');

  // Cancel/Stop button listener (Instantly abort AI thinking & restore prompt for revision)
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (!isGenerating) return;
      terminalAI.abort();
      isGenerating = false;

      if (activeThinkingLine && activeThinkingLine.parentNode) {
        activeThinkingLine.remove();
        activeThinkingLine = null;
      }

      stopBtn.style.display = 'none';
      if (submitBtn) {
        submitBtn.style.display = 'inline-flex';
        submitBtn.disabled = false;
      }
      if (attachBtn) attachBtn.disabled = false;
      terminalInput.disabled = false;

      // Restore previously submitted prompt back into input for quick editing
      terminalInput.value = lastSubmittedPrompt || '';
      terminalInput.focus();
      if (terminalInput.setSelectionRange) {
        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
      }

      const aiContainer = createAIBubbleContainer('System Controller');
      appendLine('⚡ [Permintaan Dibatalkan]: Anda dapat mengulangi atau merevisi pertanyaan di kotak input.', false, '', false, aiContainer);
    });
  }

  // Pure Intelligent Auto-Routing as permanent default
  terminalAI.setModel('auto');

  // Restore saved effort & thinking mode selection
  if (effortSelect) {
    const savedEffort = localStorage.getItem('ai_selected_effort') || 'auto';
    effortSelect.value = savedEffort;
    terminalAI.setEffort(savedEffort);

    effortSelect.addEventListener('change', () => {
      const chosen = effortSelect.value;
      const effortText = effortSelect.options[effortSelect.selectedIndex]?.text || chosen;
      terminalAI.setEffort(chosen);
      localStorage.setItem('ai_selected_effort', chosen);
      appendLine(`[Mode AI] Effort diatur ke: ${effortText}`);
      appendLine("");
    });
  }

  function renderWelcomeMessage() {
    const existing = document.getElementById('terminal-welcome-banner');
    if (existing) existing.remove();

    const welcomeBox = document.createElement('div');
    welcomeBox.id = 'terminal-welcome-banner';
    welcomeBox.className = 'terminal-welcome-banner';
    welcomeBox.innerHTML = `
      <div class="terminal-line">Sistem Terminal Interaktif Portofolio [Versi 5.2.0 — Multimodal & Real-Time AI Engine]</div>
      <div class="terminal-line" style="margin-bottom:8px;">Pilih Model AI atau tanyakan apapun secara bebas. Anda juga dapat melampirkan gambar/PDF!</div>
    `;
    terminalBody.appendChild(welcomeBox);
  }

  function renderFileTray() {
    if (!fileTray) return;
    if (attachedFiles.length === 0) {
      fileTray.style.display = 'none';
      fileTray.innerHTML = '';
      return;
    }

    fileTray.style.display = 'flex';
    fileTray.innerHTML = '';

    attachedFiles.forEach((file, index) => {
      const badge = document.createElement('div');
      badge.className = 'terminal-file-badge';

      const icon = file.isImage ? '🖼️' : '📄';
      const sizeKb = (file.size / 1024).toFixed(1);

      badge.innerHTML = `
        <span>${icon}</span>
        <span class="terminal-file-name" title="${file.name}">${file.name}</span>
        <span style="font-size:0.75rem;opacity:0.7;">(${sizeKb} KB)</span>
        <button type="button" class="terminal-file-remove" data-idx="${index}" aria-label="Hapus file ${file.name}">&times;</button>
      `;

      fileTray.appendChild(badge);
    });

    // Remove file handler
    fileTray.querySelectorAll('.terminal-file-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        if (!isNaN(idx)) {
          attachedFiles.splice(idx, 1);
          renderFileTray();
        }
      });
    });
  }

  async function processIncomingFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    for (const file of files) {
      const isImg = file.type.startsWith('image/');
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

      if (isImg) {
        const reader = new FileReader();
        reader.onload = (event) => {
          attachedFiles.push({
            name: file.name,
            type: file.type || 'image/jpeg',
            size: file.size,
            isImage: true,
            data: event.target.result // Base64 data URL
          });
          renderFileTray();
        };
        reader.readAsDataURL(file);
      } else if (isPdf) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          let extractedText = '';

          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            const maxPages = Math.min(pdf.numPages, 100);
            for (let i = 1; i <= maxPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              if (pageText.trim()) {
                extractedText += `--- Halaman ${i} dari ${pdf.numPages} ---\n${pageText}\n\n`;
              }
            }
          }

          if (extractedText.trim().length > 30) {
            attachedFiles.push({
              name: `${file.name} (${pdf?.numPages || 1} Hal)`,
              type: 'application/pdf',
              size: file.size,
              isImage: false,
              data: extractedText.trim()
            });
            renderFileTray();
          } else if (window.pdfjsLib) {
            // Render first page as image for scanned / graphic PDFs
            const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

            attachedFiles.push({
              name: file.name,
              type: 'image/jpeg',
              size: file.size,
              isImage: true,
              data: dataUrl
            });
            renderFileTray();
          } else {
            attachedFiles.push({
              name: file.name,
              type: 'text/plain',
              size: file.size,
              isImage: false,
              data: `[Dokumen PDF: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`
            });
            renderFileTray();
          }
        } catch (pdfErr) {
          console.warn('PDF.js error:', pdfErr);
          const textReader = new FileReader();
          textReader.onload = () => {
            attachedFiles.push({
              name: file.name,
              type: 'text/plain',
              size: file.size,
              isImage: false,
              data: `[Dokumen PDF: ${file.name}]`
            });
            renderFileTray();
          };
          textReader.readAsText(file);
        }
      } else {
        // Read text/code/json/csv/markdown
        const textReader = new FileReader();
        textReader.onload = (event) => {
          attachedFiles.push({
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            isImage: false,
            data: event.target.result
          });
          renderFileTray();
        };
        textReader.readAsText(file);
      }
    }
  }

  // Handle file attachment button click
  if (attachBtn && fileInput) {
    attachBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      processIncomingFiles(e.target.files);
      fileInput.value = '';
    });
  }

  // Handle Drag & Drop on Terminal Card
  const terminalCard = document.querySelector('.terminal-card');
  if (terminalCard) {
    ['dragenter', 'dragover'].forEach(eventName => {
      terminalCard.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        terminalCard.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'dragend'].forEach(eventName => {
      terminalCard.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        terminalCard.classList.remove('drag-over');
      }, false);
    });

    terminalCard.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      terminalCard.classList.remove('drag-over');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        processIncomingFiles(dt.files);
      }
    }, false);
  }

  const COMMAND_REGISTRY = {
    help: () => [
      "Perintah CLI yang tersedia:",
      "  about        - Ringkasan profil dan fokus riset",
      "  skills       - Matriks keterampilan teknis",
      "  projects     - Daftar proyek GitHub open-source",
      "  certifs      - Daftar sertifikat & kredensial terverifikasi (10 Sertifikat)",
      "  benchmarks   - Metrik pengujian model riset ML/AI",
      "  aistatus     - Status engine AI & provider aktif",
      "  setkey       - Masukkan API key pribadi Anda di browser ini",
      "  clearkey     - Hapus API key pribadi dari browser",
      "  telemetry    - Portal monitoring analitik & trafik admin",
      "  contact      - Informasi kontak resmi",
      "  whoami       - Status sesi saat ini",
      "  clear        - Membersihkan riwayat layar terminal",
      "",
      "FITUR BARU v5.2:",
      "  - Lampirkan Gambar / Dokumen / PDF dengan tombol klip [📎] di samping kolom input!",
      "  - Pencarian Web Real-Time 2026 otomatis untuk pertanyaan informasi terkini.",
      "  - Tanyakan apapun secara bebas & mendalam dengan bahasa alami."
    ],
    telemetry: () => {
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
      return [
        "[PORTAL TELEMETRI & ANALITIK]",
        "Mengarahkan ke panel monitoring: dashboard.html",
        "Memerlukan Master PIN keamanan..."
      ];
    },
    admin: () => {
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
      return [
        "[ADMIN GATEWAY]",
        "Membuka portal analitik: dashboard.html"
      ];
    },
    about: () => [
      `[PROFIL]  ${DEVELOPER_PROFILE.name} (${DEVELOPER_PROFILE.handle})`,
      `[PROGRAM] ${DEVELOPER_PROFILE.degree}`,
      `[KAMPUS]  ${DEVELOPER_PROFILE.institution}`,
      `[STATUS]  ${DEVELOPER_PROFILE.status}`,
      `[BIO]     ${DEVELOPER_PROFILE.bio}`
    ],
    skills: () => [
      "[AI / ML]       Python, PyTorch, Scikit-Learn, XGBoost, Sentence-Transformers, NLP, N-Gram",
      "[VISION]        MediaPipe Vision, OpenCV, Image Processing, Edge Inference",
      "[BACKEND]       Flask, Flask-SocketIO, REST APIs, WebSockets, PHP, MySQL, Supabase",
      "[FRONTEND]      Vanilla JavaScript (ES6+), Modern HTML5/CSS3, OKLCH, Chart.js",
      "[NETWORKING]    MikroTik RouterOS (MTCNA), Network Security, Routing, Firewall"
    ],
    projects: () => {
      const lines = ["PROYEK UNGGULAN GITHUB:"];
      PROJECTS_DATA.forEach((p, idx) => {
        lines.push(`  ${idx + 1}. [${p.title}] (${p.categoryLabel}) - Stars: ${p.stars}`);
        lines.push(`     -> ${p.description}`);
        lines.push(`     -> Repo: ${p.githubUrl}`);
      });
      return lines;
    },
    certifs: () => {
      const lines = ["KREDENSIAL & SERTIFIKASI TERVERIFIKASI (10 SERTIFIKAT):"];
      CERTIFICATES_DATA.forEach((c, idx) => {
        lines.push(`  ${idx + 1}. ${c.title} (${c.issuer} - ${c.date})`);
        lines.push(`     -> ID: ${c.credentialId}`);
      });
      return lines;
    },
    benchmarks: () => [
      "[BENCHMARK HASIL RISET MODEL]",
      "----------------------------------------------------------------",
      "1. OpenPlagiarismChecker:",
      "   - Exact Matching Engine : 5-Word N-Gram Shingling (Fast Retrieval)",
      "   - Semantic Paraphrasing : Multilingual Sentence Transformers",
      "   - Indexed Academic Corp : 15+ Repositories (GARUDA, IOS, BASE)",
      "",
      "2. Spam-Email Classifier:",
      "   - Naive Bayes vs XGBoost Real-time Comparison",
      "   - Dynamic Class Balancing Support (10:90 to 90:10 Ratio Tuning)",
      "   - Confusion Matrix & F1-Score Instant Evaluation"
    ],
    contact: () => [
      `Nama     : ${DEVELOPER_PROFILE.name}`,
      `Email    : ${DEVELOPER_PROFILE.email}`,
      `WhatsApp : ${DEVELOPER_PROFILE.whatsapp} (${DEVELOPER_PROFILE.whatsappUrl})`,
      `GitHub   : ${DEVELOPER_PROFILE.github}`,
      `Kampus   : ${DEVELOPER_PROFILE.institution}`
    ],
    whoami: () => [
      "visitor@portfolio-client: guest (read-only privilege level)"
    ],
    github: () => {
      if (typeof window !== 'undefined' && window.portfolioAgent) {
        window.portfolioAgent.openUrl(DEVELOPER_PROFILE.github);
      }
      return [
        "[AKSI WEB]: Membuka profil GitHub resmi Rafly Firmansyah...",
        `-> Tautan: ${DEVELOPER_PROFILE.github}`
      ];
    },
    theme: () => {
      if (typeof window !== 'undefined' && window.portfolioAgent) {
        const res = window.portfolioAgent.toggleTheme();
        return [res.message || "Tema berhasil diubah."];
      }
      return ["Gagal mengubah tema."];
    },
    copyemail: () => {
      if (typeof window !== 'undefined' && window.portfolioAgent) {
        const res = window.portfolioAgent.copyEmail();
        return [res.message || "Email berhasil disalin ke clipboard."];
      }
      return ["Email: raflyfirmansyah02@gmail.com"];
    },
    aistatus: () => terminalAI.getStatus(),
    clearkey: () => terminalAI.clearKey(),
    clear: () => {
      terminalBody.innerHTML = '';
      renderWelcomeMessage();
      return [];
    }
  };

  /**
   * Terminal Markdown Parser & Sanitizer + AI Web Action Dispatcher
   * Converts Markdown asterisks, headings, lists, tables, code blocks,
   * and executes [ACTION:TYPE:payload] UI commands directly on the web page.
   */
  function parseAndExecuteActionTags(rawText) {
    if (!rawText) return rawText;

    const actionRegex = /\[ACTION:([A-Z_]+)(?::([\s\S]*?))?\]/gi;
    return rawText.replace(actionRegex, (fullMatch, type, payload) => {
      const actionType = type.toUpperCase().trim();
      let parsedPayload = (payload || '').trim();

      if (parsedPayload.includes('&') || parsedPayload.includes('=')) {
        const obj = {};
        parsedPayload.split('&').forEach(part => {
          const [k, ...v] = part.split('=');
          if (k) obj[decodeURIComponent(k.trim())] = decodeURIComponent(v.join('=').trim());
        });
        parsedPayload = obj;
      }

      if (typeof window !== 'undefined' && window.portfolioAgent) {
        try {
          window.portfolioAgent.executeAction(actionType, parsedPayload);
        } catch (_) {}
      }

      const labelMap = {
        OPEN_PROJECT: 'Membuka Detail Proyek',
        OPEN_CERTIFICATE: 'Membuka Kredensial Sertifikat',
        FILL_CONTACT: 'Mengisi Form Pesan & Diskusi',
        NAVIGATE: 'Navigasi Bagian Halaman',
        OPEN_URL: 'Membuka Tautan Eksternal',
        OPEN_GITHUB: 'Membuka Repositori GitHub',
        TOGGLE_THEME: 'Mengganti Tema Tampilan',
        COPY_EMAIL: 'Menyalin Alamat Email'
      };

      const label = labelMap[actionType] || `Aksi Web: ${actionType}`;
      const payloadDesc = typeof parsedPayload === 'object' 
        ? (parsedPayload.title || parsedPayload.name || parsedPayload.section || 'Terkonfirmasi')
        : parsedPayload;

      return `\n<div class="chat-action-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> <span>⚡ [Aksi Web Terlaksana]: ${label}${payloadDesc ? ` (${payloadDesc})` : ''}</span></div>\n`;
    });
  }

  function formatMarkdownFull(text) {
    if (!text) return '';

    // 0. Parse & execute AI Action Directives
    let content = parseAndExecuteActionTags(text);

    // 1. Normalize line endings
    content = content.replace(/\r\n/g, '\n');

    // 2. Protect Code blocks
    const codeBlocks = [];
    content = content.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `§§CODE_BLOCK_${codeBlocks.length}§§`;
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const langLabel = (lang || 'CODE').toUpperCase();
      codeBlocks.push(`
        <div class="terminal-code-box">
          <div style="background:rgba(255,255,255,0.04);padding:4px 10px;font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono);border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;">
            <span>${langLabel}</span>
          </div>
          <pre style="margin:0;padding:10px;overflow-x:auto;font-family:var(--font-mono);font-size:0.85rem;line-height:1.5;color:#e2e8f0;"><code>${escapedCode}</code></pre>
        </div>
      `);
      return placeholder;
    });

    // 3. Protect Markdown Tables
    const tableBlocks = [];
    content = content.replace(/((?:^[ \t]*\|[^\n]+\|[ \t]*\n?)+)/gm, (tableMatch) => {
      const rawLines = tableMatch.trim().split('\n').map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|'));
      if (rawLines.length < 2) return tableMatch;

      if (!rawLines[1].includes('---') && !rawLines[1].includes(':---')) {
        return tableMatch;
      }

      const parseRow = (rowStr) => {
        return rowStr.slice(1, -1).split('|').map(c => c.trim());
      };

      const headers = parseRow(rawLines[0]);
      const bodyRows = rawLines.slice(2).map(parseRow);

      const placeholder = `§§TABLE_BLOCK_${tableBlocks.length}§§`;
      const formatCell = (c) => {
        return c
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-heading);font-weight:700;">$1</strong>')
          .replace(/`([^`]+)`/g, '<code style="background:var(--badge-bg);color:var(--accent-emerald);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em;">$1</code>');
      };

      const tableHtml = `
<div class="terminal-table-wrapper">
  <table class="terminal-table">
    <thead>
      <tr>
        ${headers.map(h => `<th>${formatCell(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${bodyRows.map((cols) => `
        <tr>
          ${cols.map(c => `<td>${formatCell(c)}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>`;

      tableBlocks.push(tableHtml);
      return placeholder;
    });

    // 4. Process lines for Typography & Headings
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
      let l = line.trim();
      if (!l) return '<div style="height:0.35rem;"></div>';
      if (l.startsWith('§§CODE_BLOCK_') || l.startsWith('§§TABLE_BLOCK_')) return l;

      // Horizontal Rule
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(l)) {
        return '<hr class="terminal-hr" />';
      }

      // Headings (H1 to H4)
      if (l.startsWith('#### ')) {
        return `<div style="color:var(--accent-emerald);font-weight:700;font-size:0.95rem;margin-top:10px;margin-bottom:4px;display:flex;align-items:center;gap:6px;"><span style="color:var(--accent-emerald);opacity:0.8;">▸</span> ${l.slice(5)}</div>`;
      }
      if (l.startsWith('### ')) {
        return `<div style="color:var(--accent-emerald);font-weight:700;font-size:1.02rem;margin-top:12px;margin-bottom:6px;border-left:3px solid var(--accent-emerald);padding-left:8px;">${l.slice(4)}</div>`;
      }
      if (l.startsWith('## ')) {
        return `<div style="color:var(--accent-emerald);font-weight:800;font-size:1.1rem;margin-top:14px;margin-bottom:6px;border-left:3px solid var(--accent-emerald);padding-left:8px;">${l.slice(3)}</div>`;
      }
      if (l.startsWith('# ')) {
        return `<div style="color:var(--accent-emerald);font-weight:800;font-size:1.2rem;margin-top:16px;margin-bottom:8px;">${l.slice(2)}</div>`;
      }

      // Blockquote
      if (l.startsWith('&gt; ') || l.startsWith('> ')) {
        const quoteText = l.replace(/^(&gt;|>)\s*/, '');
        return `<blockquote style="border-left:3px solid var(--accent-emerald);padding:4px 10px;margin:6px 0;background:rgba(16,185,129,0.05);color:var(--text-muted);border-radius:0 4px 4px 0;">${quoteText}</blockquote>`;
      }

      // Lists
      if (/^[-*•]\s+/.test(l)) {
        const itemText = l.replace(/^[-*•]\s+/, '');
        return `<div style="display:flex;align-items:flex-start;gap:8px;margin:3px 0;"><span style="color:var(--accent-emerald);font-weight:bold;line-height:1.4;">•</span><span style="flex:1;">${itemText}</span></div>`;
      }
      if (/^\d+\.\s+/.test(l)) {
        const match = l.match(/^(\d+)\.\s+(.*)/);
        return `<div style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;"><span style="color:var(--accent-emerald);font-weight:700;background:rgba(16,185,129,0.1);padding:0px 5px;border-radius:3px;font-size:0.8rem;font-family:var(--font-mono);">${match[1]}.</span><span style="flex:1;">${match[2]}</span></div>`;
      }

      return `<div style="margin:2px 0;line-height:1.6;">${l}</div>`;
    });

    content = processedLines.join('\n');

    // Inline styling (Bold, Italic, Code)
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-heading);font-weight:700;">$1</strong>')
      .replace(/__(.*?)__/g, '<strong style="color:var(--text-heading);font-weight:700;">$1</strong>')
      .replace(/\*([^\*]+)\*/g, '<em style="color:var(--text-body);">$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--badge-bg);color:var(--accent-emerald);padding:2px 6px;border-radius:4px;border:1px solid var(--border-subtle);font-family:var(--font-mono);font-size:0.85em;font-weight:600;">$1</code>');

    // Restore Code and Table blocks
    codeBlocks.forEach((cb, idx) => {
      content = content.replace(`§§CODE_BLOCK_${idx}§§`, cb);
    });
    tableBlocks.forEach((tb, idx) => {
      content = content.replace(`§§TABLE_BLOCK_${idx}§§`, tb);
    });

    return content;
  }

  function formatMarkdownText(raw) {
    return formatMarkdownFull(raw);
  }

  function appendUserBubble(userText, attachments = []) {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg chat-msg--user';

    let attachHtml = '';
    if (attachments.length > 0) {
      const items = attachments.map(a => `<span class="chat-attach-badge">${a.isImage ? '🖼️' : '📄'} ${a.name}</span>`).join(' ');
      attachHtml = `<div class="chat-msg__attachments">${items}</div>`;
    }

    msgEl.innerHTML = `
      <div class="chat-msg__bubble">
        <div class="chat-msg__meta">
          <span class="chat-msg__author">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>You (Pengunjung)</span>
          </span>
          <span class="chat-msg__time">${time}</span>
        </div>
        <div class="chat-msg__text">${formatMarkdownText(userText || '[Lampiran Dokumen/Gambar]')}</div>
        ${attachHtml}
      </div>
    `;

    terminalBody.appendChild(msgEl);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return msgEl;
  }

  function createAIBubbleContainer(modelDisplayName = '') {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg chat-msg--ai';

    let currentModelName = modelDisplayName;
    if (!currentModelName && modelSelect) {
      const optText = modelSelect.options[modelSelect.selectedIndex]?.text || 'Auto Router';
      currentModelName = optText.split('(')[0].trim();
    }
    if (!currentModelName) currentModelName = 'AI Assistant';

    msgEl.innerHTML = `
      <div class="chat-msg__bubble">
        <div class="chat-msg__meta">
          <span class="chat-msg__author chat-msg__author--ai">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
            <span>${currentModelName}</span>
          </span>
          <span class="chat-msg__time">${time}</span>
        </div>
        <div class="chat-msg__content"></div>
      </div>
    `;

    terminalBody.appendChild(msgEl);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return msgEl.querySelector('.chat-msg__content');
  }

  function appendLine(text, isPrompt = false, userCmd = '', isThinking = false, targetContainer = null) {
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal-line';
    if (isThinking) lineEl.classList.add('terminal-thinking-line');

    if (isPrompt) {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'terminal-prompt';
      promptSpan.textContent = 'rafly@lab:~$';
      lineEl.appendChild(promptSpan);

      const cmdText = document.createTextNode(' ' + userCmd);
      lineEl.appendChild(cmdText);
    } else {
      lineEl.innerHTML = formatMarkdownText(text);
    }

    const container = targetContainer || terminalBody;
    container.appendChild(lineEl);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return lineEl;
  }

  /**
   * Snappy Adaptive Token/Word Streamer with Full-Fledged Markdown & Table Rendering
   */
  async function streamOutputLines(lines, targetContainer = null) {
    const container = targetContainer || terminalBody;
    const fullText = Array.isArray(lines) ? lines.join('\n') : String(lines);

    const totalLines = lines.length;
    // Adaptive speed: faster chunking for long/deep analytical answers
    const tokenDelay = totalLines > 15 ? 1 : 2;

    for (let i = 0; i < totalLines; i++) {
      const lineText = lines[i];
      if (!lineText) {
        const spacer = document.createElement('div');
        spacer.style.height = '0.35rem';
        container.appendChild(spacer);
        continue;
      }

      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-line';
      container.appendChild(lineEl);

      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'terminal-stream-cursor';
      cursorSpan.textContent = '▋';
      lineEl.appendChild(cursorSpan);

      const tokens = lineText.split(/(\s+)/);
      const chunkSize = Math.max(1, Math.min(3, Math.ceil(tokens.length / 30)));

      for (let j = 0; j < tokens.length; j += chunkSize) {
        const chunk = tokens.slice(j, j + chunkSize).join('');
        cursorSpan.insertAdjacentText('beforebegin', chunk);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        if (chunk.trim().length > 0) {
          await new Promise(r => setTimeout(r, tokenDelay));
        }
      }

      cursorSpan.remove();
      lineEl.innerHTML = formatMarkdownFull(lineText);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      await new Promise(r => setTimeout(r, 2));
    }

    // Convert complete accumulated text into pristine structured Markdown HTML (Tables, Headings, Lists)
    container.innerHTML = formatMarkdownFull(fullText);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function getDynamicThinkingMessage(effort, attachments, query, model) {
    const hasAttachments = attachments && attachments.length > 0;
    if (hasAttachments) {
      const hasImage = attachments.some(a => a.isImage || (a.type && a.type.startsWith('image/')));
      const hasPdf = attachments.some(a => (a.name && a.name.endsWith('.pdf')) || (a.type && a.type.includes('pdf')));
      if (hasImage && hasPdf) {
        return "Menganalisis berkas gambar multimodal dan mengekstrak dokumen PDF terlampir...";
      }
      if (hasImage) {
        return "Menganalisis fitur visual citra dan konteks spasial multimodal...";
      }
      if (hasPdf) {
        return "Mengekstrak dan membaca dokumen PDF multi-halaman via PDF.js engine...";
      }
      return "Membaca dan memproses berkas dokumen terlampir...";
    }

    const qLower = (query || '').toLowerCase();
    const isAuto = !model || model === 'auto';
    const effortMode = effort || 'auto';

    if (effortMode === 'thinking') {
      return "Mengaktifkan Deep Chain-of-Thought (Penalaran logika multi-langkah mendalam)...";
    }

    if (effortMode === 'high') {
      return "Menjalankan Deep Research & penelusuran fakta internet komprehensif...";
    }

    if (effortMode === 'low') {
      return "Memproses inferensi cepat (Ultra-Fast Response Mode)...";
    }

    if (effortMode === 'medium') {
      return "Menganalisis konteks dan menyusun jawaban terstruktur...";
    }

    // Auto Effort Adaptive Mode
    if (isAuto) {
      if (
        qLower.includes('code') || qLower.includes('koding') || qLower.includes('python') ||
        qLower.includes('javascript') || qLower.includes('fungsi') || qLower.includes('error') ||
        qLower.includes('bug') || qLower.includes('sql') || qLower.includes('algoritma')
      ) {
        return "Merutekan ke spesialis koding & menyusun sintaks program...";
      }
      if (
        qLower.includes('presiden') || qLower.includes('menteri') || qLower.includes('pemilu') ||
        qLower.includes('berita') || qLower.includes('terbaru') || qLower.includes('2026') ||
        qLower.includes('2025') || qLower.includes('siapa') || qLower.includes('kapan')
      ) {
        return "Menelusuri fakta internet real-time 2026 & merangkai analisis mutakhir...";
      }
      if (
        qLower.includes('rafly') || qLower.includes('skripsi') || qLower.includes('plagiarism') ||
        qLower.includes('proyek') || qLower.includes('sertifikat') || qLower.includes('bnsp')
      ) {
        return "Membaca basis data repositori riset & portofolio resmi...";
      }
      return "Menyesuaikan model AI paling optimal & menyusun jawaban...";
    }

    return "Menghubungkan ke model AI dan menyusun jawaban mendalam...";
  }

  async function executeCommand(rawInput) {
    if (isGenerating) return;
    const trimmed = rawInput.trim();
    const currentAttachments = [...attachedFiles];

    if (!trimmed && currentAttachments.length === 0) return;

    // Auto-hide initial welcome banner on first question/command
    const welcomeBanner = document.getElementById('terminal-welcome-banner');
    if (welcomeBanner && trimmed.toLowerCase() !== 'clear') {
      welcomeBanner.remove();
    }

    if (trimmed) {
      history.push(trimmed);
      historyIndex = history.length;
    }

    // Display user question as a right-aligned highlighted chat bubble (WhatsApp style)
    const promptBubble = appendUserBubble(trimmed, currentAttachments);
    terminalInput.value = '';

    // Auto-scroll newly asked question smoothly
    if (promptBubble) {
      const targetTop = promptBubble.offsetTop - terminalBody.offsetTop;
      terminalBody.scrollTo({
        top: Math.max(0, targetTop - 8),
        behavior: 'smooth'
      });
    }

    // Clear attached files tray
    attachedFiles = [];
    renderFileTray();

    const cmdLower = trimmed.toLowerCase();

    // Built-in single keyword CLI commands (e.g. skills, projects, clear)
    if (currentAttachments.length === 0 && COMMAND_REGISTRY[cmdLower]) {
      telemetry.logEvent('terminal_cmd', cmdLower, `Perintah Terminal: ${cmdLower}`);
      const aiContainer = createAIBubbleContainer('System Engine');
      const outputLines = COMMAND_REGISTRY[cmdLower]();
      outputLines.forEach(line => appendLine(line, false, '', false, aiContainer));
      return;
    }

    // Direct Web Agent Command Triggers
    if (currentAttachments.length === 0 && window.portfolioAgent) {
      if (/^(buka\s+github|open\s+github|github\s+rafly|link\s+github)$/i.test(cmdLower)) {
        const aiContainer = createAIBubbleContainer('Web Interaction Agent');
        window.portfolioAgent.openUrl(DEVELOPER_PROFILE.github);
        appendLine(`⚡ [Aksi Web Terlaksana]: Membuka profil GitHub resmi Rafly Firmansyah (https://github.com/Raflyf)`, false, '', false, aiContainer);
        return;
      }
      if (/^(ganti\s+tema|ubah\s+tema|toggle\s+theme|mode\s+gelap|mode\s+terang)$/i.test(cmdLower)) {
        const aiContainer = createAIBubbleContainer('Web Interaction Agent');
        const res = window.portfolioAgent.toggleTheme();
        appendLine(`⚡ [Aksi Web Terlaksana]: ${res.message}`, false, '', false, aiContainer);
        return;
      }
      if (/^(salin\s+email|copy\s+email)$/i.test(cmdLower)) {
        const aiContainer = createAIBubbleContainer('Web Interaction Agent');
        const res = window.portfolioAgent.copyEmail();
        appendLine(`⚡ [Aksi Web Terlaksana]: ${res.message}`, false, '', false, aiContainer);
        return;
      }
      const openProjMatch = cmdLower.match(/^(?:buka|open|lihat|tampilkan)\s+(?:proyek|project|repo)\s+(.+)$/i);
      if (openProjMatch && openProjMatch[1]) {
        const aiContainer = createAIBubbleContainer('Web Interaction Agent');
        const res = window.portfolioAgent.openProject(openProjMatch[1]);
        appendLine(`⚡ [Aksi Web Terlaksana]: ${res.message}`, false, '', false, aiContainer);
        return;
      }
      const openCertMatch = cmdLower.match(/^(?:buka|open|lihat|tampilkan)\s+(?:sertifikat|sertif|cert|kredensial)\s+(.+)$/i);
      if (openCertMatch && openCertMatch[1]) {
        const aiContainer = createAIBubbleContainer('Web Interaction Agent');
        const res = window.portfolioAgent.openCertificate(openCertMatch[1]);
        appendLine(`⚡ [Aksi Web Terlaksana]: ${res.message}`, false, '', false, aiContainer);
        return;
      }
    }

    // Command: setkey <key> or setkey <provider> <key>
    if (cmdLower.startsWith('setkey ')) {
      const parts = trimmed.split(/\s+/);
      let output;
      if (parts.length === 2) {
        output = terminalAI.setKey(parts[1]);
      } else if (parts.length >= 3) {
        output = terminalAI.setKey(parts[1], parts.slice(2).join(' '));
      } else {
        output = ["Format: setkey <api-key> atau setkey <provider> <api-key>"];
      }
      const aiContainer = createAIBubbleContainer('Security Key Manager');
      output.forEach(line => appendLine(line, false, '', false, aiContainer));
      return;
    }

    // Process via Multimodal AI Engine with Snappy Streaming Output
    lastSubmittedPrompt = trimmed;
    isGenerating = true;
    terminalInput.disabled = true;
    if (submitBtn) {
      submitBtn.style.display = 'none';
      submitBtn.disabled = true;
    }
    if (stopBtn) {
      stopBtn.style.display = 'inline-flex';
    }
    if (attachBtn) attachBtn.disabled = true;

    telemetry.logEvent('terminal_ai_query', (trimmed || 'multimodal_file').slice(0, 40), `Query AI: ${trimmed}`);

    // Dynamic Thinking Message based on effort mode, attachments, and query intent
    const thinkingMsg = getDynamicThinkingMessage(
      terminalAI.reasoningEffort,
      currentAttachments,
      trimmed,
      terminalAI.currentModel
    );

    const aiContainer = createAIBubbleContainer();
    activeThinkingLine = appendLine(thinkingMsg, false, '', true, aiContainer);

    try {
      const responses = await terminalAI.ask(trimmed, currentAttachments);
      if (activeThinkingLine && activeThinkingLine.parentNode) {
        activeThinkingLine.remove();
        activeThinkingLine = null;
      }

      if (responses && responses.isAborted) {
        return;
      }

      // Update AI Bubble Header with accurately resolved model & provider
      if (aiContainer) {
        const bubbleEl = aiContainer.closest('.chat-msg__bubble');
        const authorEl = bubbleEl ? bubbleEl.querySelector('.chat-msg__author--ai span') : null;
        if (authorEl && terminalAI.lastExecutionInfo) {
          const info = terminalAI.lastExecutionInfo;
          const cleanModel = info.resolvedModel.split('/').pop().replace(/-/g, ' ').toUpperCase();
          const cleanReq = (info.requestedModel || '').split('/').pop().replace(/-/g, ' ').toUpperCase();
          const effortLabel = info.effort ? ` [Effort: ${info.effort.toUpperCase()}]` : '';

          if (info.isAuto) {
            authorEl.textContent = `Auto Router ➔ ${cleanModel}${effortLabel} (${info.provider})`;
          } else if (info.isFailover) {
            authorEl.textContent = `${cleanReq} ➔ Fallback: ${cleanModel}${effortLabel}`;
          } else {
            authorEl.textContent = `${cleanModel}${effortLabel} (${info.provider})`;
          }
        }
      }

      if (Array.isArray(responses)) {
        await streamOutputLines(responses, aiContainer);
      }
    } catch (err) {
      if (activeThinkingLine && activeThinkingLine.parentNode) {
        activeThinkingLine.remove();
        activeThinkingLine = null;
      }
      if (terminalAI.isAborted) {
        return;
      }
      appendLine(`[AI Fallback] Terjadi kendala respon. Mengalihkan ke database lokal.`, false, '', false, aiContainer);
    } finally {
      isGenerating = false;
      terminalInput.disabled = false;
      if (stopBtn) stopBtn.style.display = 'none';
      if (submitBtn) {
        submitBtn.style.display = 'inline-flex';
        submitBtn.disabled = false;
      }
      if (attachBtn) attachBtn.disabled = false;
      if (!isMobileDevice() && terminalInput) {
        terminalInput.focus();
      }
    }
  }

  // Initial welcome message
  renderWelcomeMessage();

  // Form submit listener
  terminalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    executeCommand(terminalInput.value);
  });

  // History & Tab completion key handlers
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        terminalInput.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        terminalInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = terminalInput.value.trim().toLowerCase();
      if (!current) return;
      const match = Object.keys(COMMAND_REGISTRY).find(c => c.startsWith(current));
      if (match) {
        terminalInput.value = match;
      }
    }
  });

  function isMobileDevice() {
    return window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  // Chip shortcut click listeners
  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        executeCommand(cmd);
        if (!isMobileDevice() && terminalInput) {
          terminalInput.focus();
        }
      }
    });
  });

  // =========================================================================
  // Pop-up Modal & Floating Instant Terminal Action
  // =========================================================================
  const terminalModal = document.getElementById('terminal-modal');
  const terminalModalSlot = document.getElementById('terminal-modal-slot');
  const terminalInpageSlot = document.getElementById('terminal-inpage-slot');
  const floatingTerminalBtn = document.getElementById('floating-terminal-btn');
  const terminalPopBtn = document.getElementById('terminal-pop-btn');
  const terminalModalClose = document.getElementById('terminal-modal-close');

  function openTerminalModal() {
    if (!terminalModal || !terminalModalSlot || !terminalCard) return;
    try {
      if (terminalCard.parentNode !== terminalModalSlot) {
        terminalModalSlot.appendChild(terminalCard);
      }
      if (!terminalModal.open) {
        if (typeof terminalModal.showModal === 'function') {
          terminalModal.showModal();
        } else {
          terminalModal.setAttribute('open', '');
        }
      }
    } catch (err) {
      console.warn('showModal fallback:', err);
      terminalModal.setAttribute('open', '');
    }

    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    if (terminalPopBtn) terminalPopBtn.style.display = 'none';

    setTimeout(() => {
      // On mobile devices, never auto-focus input to avoid triggering the on-screen keyboard
      if (!isMobileDevice() && terminalInput) {
        terminalInput.focus();
      } else if (terminalInput) {
        terminalInput.blur();
      }
      if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 60);
  }

  function closeTerminalModal() {
    if (!terminalModal || !terminalInpageSlot || !terminalCard) return;
    try {
      if (terminalCard.parentNode !== terminalInpageSlot) {
        terminalInpageSlot.appendChild(terminalCard);
      }
      if (terminalModal.open) {
        if (typeof terminalModal.close === 'function') {
          terminalModal.close();
        } else {
          terminalModal.removeAttribute('open');
        }
      }
    } catch (err) {
      terminalModal.removeAttribute('open');
    }

    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    if (terminalPopBtn) terminalPopBtn.style.display = 'inline-flex';

    setTimeout(() => {
      if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 40);
  }

  if (floatingTerminalBtn) {
    floatingTerminalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openTerminalModal();
    });
  }

  if (terminalPopBtn) {
    terminalPopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openTerminalModal();
    });
  }

  if (terminalModalClose) {
    terminalModalClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeTerminalModal();
    });
  }

  // Prevent clicks inside terminal card or dropdowns from closing the modal
  if (terminalCard) {
    terminalCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (modelSelect) {
    ['click', 'mousedown', 'mouseup', 'change'].forEach(evt => {
      modelSelect.addEventListener(evt, (e) => {
        e.stopPropagation();
      });
    });
  }

  if (effortSelect) {
    ['click', 'mousedown', 'mouseup', 'change'].forEach(evt => {
      effortSelect.addEventListener(evt, (e) => {
        e.stopPropagation();
      });
    });
  }

  if (terminalModal) {
    // Native dialog close event sync
    terminalModal.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      if (terminalInpageSlot && terminalCard && terminalCard.parentNode !== terminalInpageSlot) {
        terminalInpageSlot.appendChild(terminalCard);
      }
      if (terminalPopBtn) terminalPopBtn.style.display = 'inline-flex';
    });

    // Native cancel event (ESC key)
    terminalModal.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeTerminalModal();
    });

    // Outer backdrop click
    terminalModal.addEventListener('click', (e) => {
      if (e.target !== terminalModal) return;

      const rect = terminalModal.getBoundingClientRect();
      const isOutside = (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );

      if (isOutside) {
        closeTerminalModal();
      }
    });
  }
}
