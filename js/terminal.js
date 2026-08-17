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

  // Handle file attachment button click
  if (attachBtn && fileInput) {
    attachBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      files.forEach(file => {
        const reader = new FileReader();
        const isImg = file.type.startsWith('image/');

        if (isImg) {
          reader.onload = (event) => {
            attachedFiles.push({
              name: file.name,
              type: file.type,
              size: file.size,
              isImage: true,
              data: event.target.result // Base64 data URL
            });
            renderFileTray();
          };
          reader.readAsDataURL(file);
        } else {
          // Read document/text/code
          reader.onload = (event) => {
            attachedFiles.push({
              name: file.name,
              type: file.type || 'text/plain',
              size: file.size,
              isImage: false,
              data: event.target.result // Text content
            });
            renderFileTray();
          };
          reader.readAsText(file);
        }
      });

      // Reset file input value so user can upload same file again if needed
      fileInput.value = '';
    });
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
      lineEl.textContent = text;
    }

    terminalBody.appendChild(lineEl);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return lineEl;
  }

  /**
   * Snappy Token/Word Typewriter Streamer
   */
  async function streamOutputLines(lines) {
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      if (!lineText) {
        appendLine("");
        continue;
      }

      const tokens = lineText.split(/(\s+)/);
      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-line';
      terminalBody.appendChild(lineEl);

      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'terminal-stream-cursor';
      cursorSpan.textContent = '▋';
      lineEl.appendChild(cursorSpan);

      for (let j = 0; j < tokens.length; j++) {
        const token = tokens[j];
        cursorSpan.insertAdjacentText('beforebegin', token);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        if (token.trim().length > 0) {
          await new Promise(r => setTimeout(r, 12));
        }
      }

      cursorSpan.remove();
      terminalBody.scrollTop = terminalBody.scrollHeight;
      await new Promise(r => setTimeout(r, 20));
    }
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
}
