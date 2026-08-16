/**
 * ============================================================================
 * INTERACTIVE DEVELOPER LAB / TERMINAL SIMULATOR
 * Provides an interactive CLI playground for visitors to explore Rafly's profile
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js';

export function initTerminal() {
  const terminalBody = document.getElementById('terminal-body');
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');

  if (!terminalBody || !terminalForm || !terminalInput) return;

  const COMMAND_REGISTRY = {
    help: () => [
      "Perintah yang tersedia:",
      "  about        - Ringkasan profil dan fokus riset",
      "  skills       - Matriks keterampilan teknis",
      "  projects     - Daftar proyek GitHub open-source",
      "  certifs      - Daftar sertifikat & kredensial terverifikasi",
      "  benchmarks   - Metrik pengujian model ML / AI",
      "  contact      - Informasi kontak dan media sosial",
      "  whoami       - Status sesi saat ini",
      "  clear        - Membersihkan layar terminal"
    ],
    about: () => [
      `[PROFIL] ${DEVELOPER_PROFILE.name} (${DEVELOPER_PROFILE.handle})`,
      `[ROLE]   ${DEVELOPER_PROFILE.title}`,
      `[STATUS] ${DEVELOPER_PROFILE.status}`,
      `[BIO]    ${DEVELOPER_PROFILE.bio}`
    ],
    skills: () => [
      "[AI / ML]       Python, PyTorch, Scikit-Learn, XGBoost, Sentence-Transformers, NLP, N-Gram",
      "[VISION]        MediaPipe Vision, OpenCV, Image Processing, Edge Inference",
      "[BACKEND]       Flask, Flask-SocketIO, REST APIs, WebSockets, PHP, MySQL",
      "[FRONTEND]      Vanilla JavaScript (ES6+), Modern HTML5/CSS3, OKLCH, Chart.js",
      "[TOOLS & CLOUD] Git, GitHub Actions, Docker, Vercel, Linux"
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
      const lines = ["KREDENSIAL & SERTIFIKASI TERVERIFIKASI:"];
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
    clear: () => {
      terminalBody.innerHTML = '';
      return [];
    }
  };

  function appendLine(text, isPrompt = false, userCmd = '') {
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal-line';

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
  }

  // Initial welcome message
  appendLine("Sistem Terminal Interaktif Portofolio [Versi 2.4.0]");
  appendLine("Ketik 'help' untuk melihat daftar perintah yang tersedia.");
  appendLine("");

  terminalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawInput = terminalInput.value.trim();
    if (!rawInput) return;

    const cmd = rawInput.toLowerCase();
    appendLine('', true, rawInput);
    terminalInput.value = '';

    if (COMMAND_REGISTRY[cmd]) {
      const outputLines = COMMAND_REGISTRY[cmd]();
      outputLines.forEach(line => appendLine(line));
    } else {
      appendLine(`Perintah tidak dikenali: '${rawInput}'. Ketik 'help' untuk panduan.`);
    }
    appendLine("");
  });
}
