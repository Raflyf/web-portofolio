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

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js';
import { telemetry } from './telemetry.js';
import { terminalAI } from './terminal-ai.js';

export function initTerminal() {
  const terminalBody = document.getElementById('terminal-body');
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  const chipButtons = document.querySelectorAll('.terminal-chip');
  const modelSelect = document.getElementById('terminal-model-select');
  const submitBtn = document.getElementById('terminal-submit-btn');
  const attachBtn = document.getElementById('terminal-attach-btn');
  const fileInput = document.getElementById('terminal-file-input');
  const fileTray = document.getElementById('terminal-file-tray');

  if (!terminalBody || !terminalForm || !terminalInput) return;

  const history = [];
  let historyIndex = -1;
  let isGenerating = false;
  let attachedFiles = [];

  // Restore saved model dropdown selection
  if (modelSelect) {
    const savedModel = localStorage.getItem('ai_selected_model') || 'auto';
    modelSelect.value = savedModel;

    modelSelect.addEventListener('change', () => {
      const chosen = modelSelect.value;
      const modelText = modelSelect.options[modelSelect.selectedIndex]?.text || chosen;
      terminalAI.setModel(chosen);
      appendLine(`[Model AI] Beralih ke: ${modelText}`);
      appendLine("");
    });
  }

  function renderWelcomeMessage() {
    appendLine("Sistem Terminal Interaktif Portofolio [Versi 5.2.0 — Multimodal & Real-Time AI Engine]");
    appendLine("Pilih Model AI atau tanyakan apapun secara bebas. Anda juga dapat melampirkan gambar/PDF!");
    appendLine("");
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
    aistatus: () => terminalAI.getStatus(),
    clearkey: () => terminalAI.clearKey(),
    clear: () => {
      terminalBody.innerHTML = '';
      renderWelcomeMessage();
      return [];
    }
  };

  /**
   * Terminal Markdown Parser & Sanitizer
   * Converts Markdown asterisks, headings, lists, and code blocks into styled terminal elements
   */
  let inCodeBlock = false;
  let codeBlockLang = '';

  function formatMarkdownText(raw) {
    if (!raw) return '';

    const trimmed = raw.trim();

    // Code block opening or closing fence: ```python, ```js, ```
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim().toUpperCase() || 'CODE';
        return `<div class="terminal-code-header"><span class="terminal-code-lang">${codeBlockLang}</span></div>`;
      } else {
        inCodeBlock = false;
        codeBlockLang = '';
        return `<div style="height:4px;border-bottom:1px solid var(--border-subtle);margin-bottom:6px;"></div>`;
      }
    }

    // Escape HTML first for XSS safety
    let escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Inside code block styling & safe syntax highlights (No style-tag self collision)
    if (inCodeBlock) {
      if (/^\s*(#|\/\/)/.test(raw)) {
        return `<div class="terminal-code-line"><span style="color:var(--text-muted);user-select:none;margin-right:10px;opacity:0.4;">&gt;</span><span style="color:#6ee7b7;font-style:italic;opacity:0.9;">${escaped}</span></div>`;
      }

      let codeHtml = escaped
        .replace(/(["'][^"']*?["'])/g, '§§STR_$1§§')
        .replace(/\b(def|class|import|from|return|if|elif|else|for|while|try|except|const|let|var|function|async|await)\b/g, '§§KW_$1§§');

      codeHtml = codeHtml
        .replace(/§§STR_(.*?)§§/g, '<span style="color:#fde047;">$1</span>')
        .replace(/§§KW_(.*?)§§/g, '<span style="color:#38bdf8;font-weight:700;">$1</span>');

      return `<div class="terminal-code-line"><span style="color:var(--text-muted);user-select:none;margin-right:10px;opacity:0.4;">&gt;</span>${codeHtml}</div>`;
    }

    // Headings (### Title, ## Title, # Title)
    escaped = escaped.replace(/^###\s+(.*$)/gim, '<strong style="color:var(--accent-emerald);font-weight:700;font-size:1.05em;display:block;margin-top:8px;margin-bottom:3px;border-left:3px solid var(--accent-emerald);padding-left:6px;">$1</strong>');
    escaped = escaped.replace(/^##\s+(.*$)/gim, '<strong style="color:var(--accent-emerald);font-weight:700;font-size:1.1em;display:block;margin-top:10px;margin-bottom:4px;border-left:3px solid var(--accent-emerald);padding-left:6px;">$1</strong>');
    escaped = escaped.replace(/^#\s+(.*$)/gim, '<strong style="color:var(--accent-emerald);font-weight:800;font-size:1.15em;display:block;margin-top:12px;margin-bottom:4px;">$1</strong>');

    // Bold (**text** or __text__)
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-heading);font-weight:700;">$1</strong>');
    escaped = escaped.replace(/__(.*?)__/g, '<strong style="color:var(--text-heading);font-weight:700;">$1</strong>');

    // Italic (*text* or _text_)
    escaped = escaped.replace(/\*([^\*]+)\*/g, '<em style="color:var(--text-body);">$1</em>');

    // Inline Code (`code`)
    escaped = escaped.replace(/`([^`]+)`/g, '<code style="background:var(--badge-bg);color:var(--accent-emerald);padding:2px 6px;border-radius:4px;border:1px solid var(--border-subtle);font-family:var(--font-mono);font-size:0.9em;font-weight:600;">$1</code>');

    // List bullets (- item or * item)
    escaped = escaped.replace(/^[-*]\s+(.*$)/gim, '<span style="color:var(--accent-emerald);margin-right:8px;font-weight:700;">&bull;</span>$1');

    // Numbered lists (1. item)
    escaped = escaped.replace(/^(\d+)\.\s+(.*$)/gim, '<span style="color:var(--accent-emerald);font-weight:700;margin-right:6px;background:rgba(16,185,129,0.1);padding:1px 5px;border-radius:3px;">$1.</span>$2');

    return escaped;
  }

  function appendLine(text, isPrompt = false, userCmd = '', isThinking = false) {
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

    terminalBody.appendChild(lineEl);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return lineEl;
  }

  /**
   * Snappy Token/Word Typewriter Streamer with Markdown Rendering
   */
  async function streamOutputLines(lines) {
    // Reset code block state before streaming response
    inCodeBlock = false;
    codeBlockLang = '';

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      if (!lineText) {
        appendLine("");
        continue;
      }

      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-line';
      terminalBody.appendChild(lineEl);

      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'terminal-stream-cursor';
      cursorSpan.textContent = '▋';
      lineEl.appendChild(cursorSpan);

      const tokens = lineText.split(/(\s+)/);

      for (let j = 0; j < tokens.length; j++) {
        const token = tokens[j];
        cursorSpan.insertAdjacentText('beforebegin', token);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        if (token.trim().length > 0) {
          await new Promise(r => setTimeout(r, 6));
        }
      }

      // Convert the line to formatted Markdown HTML
      cursorSpan.remove();
      lineEl.innerHTML = formatMarkdownText(lineText);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      await new Promise(r => setTimeout(r, 10));
    }
    inCodeBlock = false;
  }

  async function executeCommand(rawInput) {
    if (isGenerating) return;
    const trimmed = rawInput.trim();
    const currentAttachments = [...attachedFiles];

    if (!trimmed && currentAttachments.length === 0) return;

    if (trimmed) {
      history.push(trimmed);
      historyIndex = history.length;
    }

    // Display user line in terminal
    let displayPrompt = trimmed;
    if (currentAttachments.length > 0) {
      const attachNames = currentAttachments.map(a => `${a.isImage ? '🖼️' : '📄'} ${a.name}`).join(', ');
      displayPrompt = trimmed ? `${trimmed} [Lampiran: ${attachNames}]` : `[Menganalisis Lampiran: ${attachNames}]`;
    }

    appendLine('', true, displayPrompt);
    terminalInput.value = '';

    // Clear attached files tray
    attachedFiles = [];
    renderFileTray();

    const cmdLower = trimmed.toLowerCase();

    // Built-in single keyword commands (instant response if no files attached)
    if (currentAttachments.length === 0 && COMMAND_REGISTRY[cmdLower]) {
      telemetry.logEvent('terminal_cmd', cmdLower, `Perintah Terminal: ${cmdLower}`);
      const outputLines = COMMAND_REGISTRY[cmdLower]();
      outputLines.forEach(line => appendLine(line));
      appendLine("");
      return;
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
      output.forEach(line => appendLine(line));
      appendLine("");
      return;
    }

    // Process via Multimodal AI Engine with Snappy Streaming Output
    isGenerating = true;
    terminalInput.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    if (attachBtn) attachBtn.disabled = true;

    telemetry.logEvent('terminal_ai_query', (trimmed || 'multimodal_file').slice(0, 40), `Query AI: ${trimmed}`);

    const thinkingMsg = currentAttachments.length > 0 
      ? "[Multimodal AI] Membaca dan menganalisis dokumen/gambar terlampir..." 
      : "[AI Assistant] Menganalisis dan menyusun jawaban mendalam...";

    const thinkingLine = appendLine(thinkingMsg, false, '', true);

    try {
      const responses = await terminalAI.ask(trimmed, currentAttachments);
      if (thinkingLine && thinkingLine.parentNode) {
        thinkingLine.remove();
      }

      await streamOutputLines(responses);
    } catch (err) {
      if (thinkingLine && thinkingLine.parentNode) {
        thinkingLine.remove();
      }
      appendLine(`[AI Fallback] Terjadi kendala respon. Mengalihkan ke database lokal.`);
    } finally {
      isGenerating = false;
      terminalInput.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
      if (attachBtn) attachBtn.disabled = false;
      terminalInput.focus();
    }

    appendLine("");
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

  // Chip shortcut click listeners
  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        executeCommand(cmd);
        terminalInput.focus();
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
      if (terminalInput) terminalInput.focus();
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
