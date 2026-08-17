/**
 * ============================================================================
 * INTERACTIVE DEVELOPER LAB / TERMINAL SIMULATOR
 * CLI Playground & Natural Language AI Assistant for Rafly Firmansyah Portfolio
 * With Multi-API Cascade (DeepSeek, Groq, Gemini, Ollama) & Local Semantic Fallback
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

  if (!terminalBody || !terminalForm || !terminalInput) return;

  const history = [];
  let historyIndex = -1;

  const COMMAND_REGISTRY = {
    help: () => [
      "Perintah CLI yang tersedia:",
      "  about        - Ringkasan profil dan fokus riset",
      "  skills       - Matriks keterampilan teknis",
      "  projects     - Daftar proyek GitHub open-source",
      "  certifs      - Daftar sertifikat & kredensial terverifikasi (10 Sertifikat)",
      "  benchmarks   - Metrik pengujian model riset ML/AI",
      "  aistatus     - Status engine AI & provider aktif",
      "  setkey       - Simpan API key (contoh: setkey openrouter <key>)",
      "  telemetry    - Portal monitoring analitik & trafik admin",
      "  contact      - Informasi kontak resmi",
      "  whoami       - Status sesi saat ini",
      "  clear        - Membersihkan layar terminal",
      "",
      "TIPS: Anda juga bisa bertanya bebas dalam bahasa alami tanpa keyword!",
      "Contoh: 'jelaskan arsitektur OpenPlagiarismChecker' atau 'apa saja unit BNSP?'"
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
    aistatus: () => {
      const status = terminalAI.getStatus();
      return [
        "[AI ENGINE & PROVIDER POOL STATUS]",
        "----------------------------------------------------------------",
        `System Status        : ${status.status}`,
        `Configured Providers : ${status.configuredProviders.length > 0 ? status.configuredProviders.join(', ') : 'Default Public Cloud & Local Engine'}`,
        `Local Fallback Engine: ${status.fallbackEngine}`,
        "",
        "Anda dapat menyimpan API Key pribadi menggunakan perintah:",
        "  $ setkey openrouter <api-key>",
        "  $ setkey groq <api-key>",
        "  $ setkey gemini <api-key>",
        "  $ setkey deepseek <api-key>"
      ];
    },
    clear: () => {
      terminalBody.innerHTML = '';
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

  async function executeCommand(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    history.push(trimmed);
    historyIndex = history.length;

    appendLine('', true, trimmed);
    terminalInput.value = '';

    const cmdLower = trimmed.toLowerCase();

    // Check built-in CLI commands
    if (COMMAND_REGISTRY[cmdLower]) {
      telemetry.logEvent('terminal_cmd', cmdLower, `Perintah Terminal: ${cmdLower}`);
      const outputLines = COMMAND_REGISTRY[cmdLower]();
      outputLines.forEach(line => appendLine(line));
      appendLine("");
      return;
    }

    // Check setkey command: setkey <provider> <key>
    if (cmdLower.startsWith('setkey ')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 3) {
        const provider = parts[1];
        const key = parts.slice(2).join(' ');
        const msg = terminalAI.setKey(provider, key);
        appendLine(msg);
      } else {
        appendLine("Format perintah salah. Contoh: setkey openrouter sk-or-v1-...");
      }
      appendLine("");
      return;
    }

    // Process via AI Engine (Multi-API Cascade with Local Semantic Fallback)
    telemetry.logEvent('terminal_ai_query', trimmed.slice(0, 40), `Pertanyaan AI: ${trimmed}`);

    const thinkingLine = appendLine("[AI Assistant] Menganalisis respon...", false, '', true);

    try {
      const responses = await terminalAI.ask(trimmed);
      if (thinkingLine && thinkingLine.parentNode) {
        thinkingLine.remove();
      }

      responses.forEach(line => appendLine(line));
    } catch (err) {
      if (thinkingLine && thinkingLine.parentNode) {
        thinkingLine.remove();
      }
      appendLine(`[AI Fallback] ${err.message || 'Terjadi kendala jaringan. Mengalihkan ke data lokal.'}`);
    }

    appendLine("");
  }

  // Initial welcome message
  appendLine("Sistem Terminal Interaktif Portofolio [Versi 3.4.0 — AI Powered]");
  appendLine("Ketik perintah CLI ('help', 'skills') atau tanyakan apapun dengan bahasa alami.");
  appendLine("");

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
