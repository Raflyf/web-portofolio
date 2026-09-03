import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Loader2, X, Clock, Plus, ChevronDown, Copy, Download, Paperclip, User, Cpu, Maximize2, Check, Trash2, Radio, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTerminal } from '../../context/TerminalContext.jsx';
import { DEVELOPER_PROFILE, CERTIFICATES_DATA } from '../../data';
import { telemetry } from '../../lib/telemetry';

const COMMAND_REGISTRY = {
  about: () => [
    "--- ABOUT ME ---",
    "Rafly Firmansyah",
    "Software Engineer, AI Researcher & Web Developer",
    "Fokus pada Web Performance, AI Integration, dan Data Engineering."
  ],
  skills: () => [
    "--- TECH SKILLS ---",
    "Frontend: React, Vue, TailwindCSS, Framer Motion",
    "Backend: Node.js, Python, Express",
    "Database: PostgreSQL, MongoDB, Supabase",
    "AI/ML: PyTorch, LangChain, OpenAI, DeepSeek, Ollama"
  ],
  projects: () => [
    "--- OPEN SOURCE PROJECTS ---",
    "1. Terminal AI Gateway - Smart LLM Router",
    "2. Skripsi AI Plagiarism Checker",
    "3. Next.js Dashboard Analytics",
    "Cek selengkapnya di GitHub: https://github.com/Raflyf"
  ],
  certifs: () => [
    "--- CREDENTIALS ---",
    ...CERTIFICATES_DATA.map(cert => `- ${cert.title} (${cert.date}) — ${cert.issuer}`)
  ],
  benchmarks: () => [
    "--- AI BENCHMARKS ---",
    "Nemotron 3 Nano (Ollama): Latensi ~3s, Logika Menengah",
    "OpenCode x-preview-f-free: Latensi ~1s, Coding Expert",
    "DeepSeek R1 Free: Latensi ~4s, Deep Reasoning"
  ],
  models: () => [
    "[KATALOG MODEL AI MODERN (PRIORITAS)]",
    "----------------------------------------------------------------",
    "1. PRIORITAS UTAMA:",
    "   - nemotron-3-nano:30b (Ollama Cloud | Sub-5s Fast Conversational - PRIORITAS #1)",
    "   - lightning (OpenRouter | Nemotron 3.5 Lightning Berkecepatan Tinggi - PRIORITAS #2)",
    "   - nemotron-3-nano-omni (OpenRouter | Model multimodal & penalaran CoT 30B - PRIORITAS #3)",
    "",
    "2. OPENROUTER CLOUD SOTA POOL:",
    "   - deepseek-chat (DeepSeek V3 | Fast Analytical)",
    "   - openrouter/free (Universal SOTA Auto Router)",
    "   - super-120b (Nemotron 3 Super 120B | Teroptimasi latensi rendah)",
    "   - ultra-550b (Nemotron 3 Ultra 550B | MoE 550B parameter penuh)",
    "   - minimax (MiniMax M3 Free | Multimodal vision & text)",
    "   - cohere (Cohere North Mini Code | Penalaran logika kode)",
    "",
    "3. OLLAMA CLOUD SOTA HUB:",
    "   - ultra (Nemotron 3 Ultra | Frontier reasoning)",
    "   - super (Nemotron 3 Super | 120B CoT Reasoning)",
    "   - minimax (MiniMax M3 | Multimodal)",
    "",
    "4. OPENCODE ZEN DIRECT MODELS:",
    "   - opencode-lightning (Nemotron 3.5 Lightning)",
    "   - opencode-ultra (Nemotron 3 Ultra Free)",
    "   - laguna / opencode-laguna (Poolside Laguna S 2.1 Free)",
    "   - mimo / opencode-mimo (Mimo v2.5 Free Multimodal)",
    "",
    "Perintah Penggantian: Ketik 'model <nama>' (contoh: model nano / model laguna / model auto)."
  ],
  'ai-status': () => [
    "--- AI ENGINE STATUS ---",
    "Engine: Smart Cascade Auto Router",
    "Latency: Normal (< 5s)",
    "Status: ONLINE"
  ],
  contact: () => [
    "--- CONTACT ---",
    `Email: ${DEVELOPER_PROFILE.email}`,
    "GitHub: github.com/Raflyf"
  ],
  clear: () => []
};

// Persist an explicit fact taught by the AI to Supabase ai_memories (Dual-Storage & Realtime Telemetry Sync)
function saveAIMemory(factText, sessionId) {
  if (!factText) return;
  const trimmedFact = String(factText).trim().substring(0, 1000);
  const sid = (sessionId || 'sess_anon').substring(0, 64);

  // 1. Dual-Storage: Save to local storage memory cache instantly
  try {
    const STORAGE_MEM_KEY = 'portfolio_ai_memories';
    const existingRaw = localStorage.getItem(STORAGE_MEM_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const newEntry = {
      id: 'mem_' + Date.now(),
      fact_text: trimmedFact,
      session_id: sid,
      type: 'Continuous RAG Knowledge',
      created_at: new Date().toISOString()
    };
    if (!existing.some(e => e.fact_text === trimmedFact)) {
      existing.unshift(newEntry);
      localStorage.setItem(STORAGE_MEM_KEY, JSON.stringify(existing.slice(0, 200)));
      window.dispatchEvent(new Event('telemetry_update'));
    }
  } catch {}

  // 2. Asynchronously sync to serverless endpoint
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 10000);
    fetch('/api/save-memory', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fact_text: trimmedFact,
        session_id: sid
      }),
      signal: ctrl.signal
    }).catch(() => {});
  } catch {}
}

const CustomSelectEffort = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const options = [
    { value: 'auto', label: 'Auto (Balanced)' },
    { value: 'thinking', label: 'Thinking CoT (Deep)' },
    { value: 'high', label: 'High (Research)' },
    { value: 'medium', label: 'Medium (Standard)' },
    { value: 'low', label: 'Low (Fast)' }
  ];
  
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 liquid-glass-inset rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer outline-none border border-zinc-300 dark:border-white/10 ${
          isOpen 
            ? 'border-cyan-400 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
            : 'hover:border-cyan-400/50 text-zinc-800 dark:text-zinc-200'
        }`}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-cyan-600 dark:text-cyan-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
      </button>
      
      {isOpen && (
        <div 
          role="listbox"
          data-lenis-prevent="true"
          className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl liquid-glass border border-zinc-200 dark:border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_20px_rgba(6,182,212,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(6,182,212,0.15)] z-100 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
        >
          <div className="px-3.5 py-1.5 text-[10px] font-mono text-cyan-700 dark:text-cyan-400/80 uppercase tracking-wider border-b border-zinc-200/50 dark:border-white/5 font-semibold">
            Reasoning Effort
          </div>
          <div 
            data-lenis-prevent="true"
            className="py-1 max-h-72 overflow-y-auto overscroll-contain divide-y divide-zinc-200/50 dark:divide-white/5 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  value === opt.value 
                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold' 
                    : 'text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Rekonstruksi & Perbaikan Tabel Markdown:
 * Mengidentifikasi tabel yang baris datanya menyatu dalam satu baris horizontal,
 * menghitung kolom header, dan memecah sel-sel data ke baris-baris GFM yang valid.
 */
function repairMarkdownTables(content) {
  if (!content) return content;
  let out = content;

  // 1. Rekonstruksi tabel standar yang baris datanya menyatu setelah divider
  const tableRegex = /(\|[^\n|]+(?:\|[^\n|]+)+\|?)\s*\n*\s*(\|[-: ]+(?:\|[-: ]+)+\|?)\s*([^\n#]+)/g;
  out = out.replace(tableRegex, (match, headerRaw, dividerRaw, dataRaw) => {
    const headerCols = headerRaw.split('|').map(s => s.trim()).filter(Boolean);
    const numCols = headerCols.length;
    if (numCols === 0) return match;

    const dividerCols = dividerRaw.split('|').map(s => s.trim()).filter(Boolean);
    const standardDivider = '| ' + headerCols.map((_, idx) => dividerCols[idx] || '-----------').join(' | ') + ' |';
    const standardHeader = '| ' + headerCols.join(' | ') + ' |';

    const rawCells = dataRaw.split('|').map(s => s.trim()).filter(s => s.length > 0);
    const rowLines = [];
    for (let i = 0; i < rawCells.length; i += numCols) {
      const chunk = rawCells.slice(i, i + numCols);
      if (chunk.length > 0) {
        while (chunk.length < numCols) chunk.push('-');
        rowLines.push('| ' + chunk.join(' | ') + ' |');
      }
    }

    return `\n\n${standardHeader}\n${standardDivider}\n${rowLines.join('\n')}\n\n`;
  });

  // 2. Rekonstruksi baris data orphan yang menggunakan format tab atau sel horizontal tanpa divider
  const lines = out.split('\n');
  const outLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // A. Ubah baris bertab (tab-separated) menjadi baris tabel GFM resmi
    if (line.includes('\t')) {
      const tabParts = line.split('\t').map(s => s.trim()).filter(Boolean);
      if (tabParts.length >= 2) {
        const isHeader = /komponen|teknologi|aspek|keterbatasan|fitur|layer|kategori/i.test(tabParts[0] + ' ' + tabParts[1]);
        outLines.push('| ' + tabParts.join(' | ') + ' |');
        if (isHeader) {
          outLines.push('| ' + tabParts.map(() => '---').join(' | ') + ' |');
        }
        continue;
      }
    }

    // B. Deteksi baris yang diawali '|' dan memiliki banyak pipe (>= 4 sel terpisah)
    if (line.startsWith('|') && (line.match(/\|/g) || []).length >= 4) {
      const cells = line.split('|').map(s => s.trim()).filter(Boolean);
      const prevLine = (outLines[outLines.length - 1] || '').trim();
      const prevPrevLine = (outLines[outLines.length - 2] || '').trim();

      let numCols = 2; // Default 2 kolom
      if (cells.length % 3 === 0 && (cells.length % 2 !== 0 || /solusi|potensial|penjelasan|deskripsi/i.test(prevLine + ' ' + prevPrevLine))) {
        numCols = 3;
      } else if (cells.length % 2 === 0) {
        numCols = 2;
      }

      for (let c = 0; c < cells.length; c += numCols) {
        const rowChunk = cells.slice(c, c + numCols);
        while (rowChunk.length < numCols) rowChunk.push('-');
        outLines.push('| ' + rowChunk.join(' | ') + ' |');
      }
    } else {
      outLines.push(lines[i]);
    }
  }

  return outLines.join('\n');
}

/**
 * Normalizer Struktur Markdown:
 * Membersihkan artefak strip sebelum heading/nomor, menyusun numbered list,
 * dan merekonstruksi tabel menjadi format CommonMark yang rapi.
 */
function normalizeStructuredMarkdown(str) {
  if (!str) return str;
  let out = str;

  // 1. Sambungkan kembali nomor list yang terputus di akhir kalimat (misal: "ringan. 2.\nInference:" atau "ringan. 2.\n**Inference**:")
  out = out.replace(/([.:?!])\s*(\d+)\.\s*\n+\s*([A-Za-z*])/g, '$1\n\n$2. $3');
  out = out.replace(/(?:^|\n)\s*(\d+)\.\s*\n+\s*([A-Za-z*])/g, '\n$1. $2');

  // 2. Konversi judul bagian mandiri (akhiran titik dua tanpa isi kalimat) menjadi Heading Markdown (### Judul)
  // Mencegah judul bagian (seperti Komponen Utama:, Alur Kerja:, Keunggulan:, Manfaat:) berubah menjadi butir poin (- )
  out = out.replace(/(?:^|\n)\s*(?:[-*•]\s*)?([A-Z][a-zA-Z0-9\s/&-]{2,35}):\s*(?=\n|$)/g, (match, title) => {
    const cleanTitle = title.trim();
    return `\n\n### ${cleanTitle}\n\n`;
  });

  // 3. Bersihkan strip/bullet aneh sebelum heading (misal: '- - ###' atau '• • ###')
  out = out.replace(/(?:^|\n)\s*[-–—•\s]{2,}\s*(#{1,6}\s+)/g, '\n\n$1');
  out = out.replace(/([^#\n\r])\s*(#{1,6}\s+)/g, '$1\n\n$2');

  // 4. Pisahkan heading yang menempel langsung dengan bullet list atau nomor
  out = out.replace(/(#{1,6}\s+[^\n]+?)\s+([-*•]\s+\*\*|\d+\.\s+\*\*)/g, '$1\n\n$2');
  out = out.replace(/(#{1,6}\s+[^\n]+?)\s+([-*•]\s+[A-Za-z0-9])/g, '$1\n\n$2');

  // 5. Bersihkan strip/bullet aneh sebelum angka list (tanpa memotong huruf kata sebelumnya)
  out = out.replace(/(?:^|\n)\s*[-–—•\s]{2,}\s*(\d+\.\s+[A-Za-z*])/g, '\n\n$1');

  // 6. Pisahkan numbered list (1. **Label**: atau 1. Kata) yang menempel di tengah kalimat atau setelah titik
  out = out.replace(/([.:?!])\s+(\d+\.\s+(?:\*\*|[A-Za-z]))/g, '$1\n\n$2');

  // 7. Pisahkan bullet list (- **Label**: atau - Kata) yang menempel di tengah kalimat
  out = out.replace(/([.:?!]|\b)\s+[-*•]\s+(\*\*[^*]+\*\*:?)/g, '$1\n- $2');
  out = out.replace(/([.:?!])\s+[-*•]\s+([A-Za-z0-9])/g, '$1\n\n- $2');

  // 8. Bersihkan artefak strip ganda sebelum kata biasa
  out = out.replace(/(?:^|\n)\s*[-–—•\s]{2,}\s*([A-Z][a-z0-9])/g, '\n\n$1');

  // 9. Format sub-item fitur (key: value) yang memiliki kalimat penjelas (BUKAN heading dan BUKAN nomor)
  out = out.replace(/\n(?![#\d\s\-*•])([A-Z][a-zA-Z0-9 -]+(?:\([^)]*\))?:\s+[^\n]+)/g, '\n- $1');

  // 10. Hapus bullet yang tidak sengaja tertempel di depan numbered list
  out = out.replace(/\n\s*[-*•]\s*(\d+\.\s+)/g, '\n$1');

  // 11. Rekonstruksi & Rapikan Tabel Markdown
  out = repairMarkdownTables(out);

  // 12. Pisahkan paragraf kesimpulan penutup yang menempel setelah titik terakhir list
  out = out.replace(/(\.\s*)(Dengan struktur ini|Kesimpulannya|Secara keseluruhan|Jika ada|Untuk informasi)/gi, '.\n\n$2');

  // 13. Sanitasi handle username: Hapus (@Raflyf) atau @Raflyf jika muncul
  out = out.replace(/\s*\(@?Raflyf\)/gi, '');
  out = out.replace(/\s*@Raflyf\b/gi, '');

  // 14. Eliminasi Kalimat Validasi Diri & Defensive Meta-Talk (Berlaku untuk SEMUA Percakapan)
  out = out.replace(/(?:Jadi,?\s*(?:secara\s*singkat,?\s*)?)?saya\s+(?:bukan|tidak\s+memiliki|tidak\s+berafiliasi)\s+(?:model\s+dengan\s+)?(?:nama\s+)?(?:brand|merek|perusahaan)\s+tertentu[^.!?\n]*[.!?]/gi, '');
  out = out.replace(/(?:Jadi,?\s*(?:secara\s*singkat,?\s*)?)?saya\s+adalah\s+asisten\s+cerdas\s+yang\s+bekerja\s+untuk\s+membantu\s+(?:kamu|anda)\s+dalam\s+menjelajahi[^.!?\n]*[.!?]/gi, '');
  out = out.replace(/\b(?:Sebagai\s+(?:model\s+bahasa(?:\s+besar)?|asisten\s+(?:AI|virtual)|AI|LLM)[^,.\n]*,?\s*)/gi, '');
  out = out.replace(/\b(?:Perlu\s+(?:diingat|dicatat|diketahui)\s+bahwa\s+(?:saya\s+adalah|ini\s+adalah|saya\s+hanyalah)[^.!?\n]*[.!?])/gi, '');
  out = out.replace(/\b(?:saya\s+hanya\s+(?:sebuah|merupakan)\s+(?:model\s+bahasa|program|AI|asisten)[^.!?\n]*[.!?])/gi, '');

  // 15. Normalisasi newline ganda berlebih
  out = out.replace(/\n{3,}/g, '\n\n').trim();

  return out;
}

export default function TerminalAI({ onClose } = {}) {
  const { 
    isTerminalPopupOpen, setIsTerminalPopupOpen,
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    historyList, setHistoryList,
    effort, setEffort,
    getCurrentTime, initialMsg
  } = useTerminal();
  
  const VALID_MODELS = ['auto', 'nano', 'lightning', 'omni', 'super', 'ultra', 'minimax', 'cohere', 'deepseek', 'free', 'codex', 'antigravity', 'vision', 'laguna', 'opencode-laguna', 'mimo', 'opencode-mimo'];

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('idle'); // 'idle' | 'request' | 'thinking'
  const phaseTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, []);

  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_selected_model');
      if (saved && VALID_MODELS.includes(saved)) {
        return saved;
      }
      localStorage.setItem('ai_selected_model', 'auto');
      return 'auto';
    } catch {
      return 'auto';
    }
  });
  const scrollRef = useRef(null);

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // FIX M4: file attachment support (paperclip button was dead UI).
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [attachError, setAttachError] = useState('');

  // Terminal Command History Navigation (ArrowUp / ArrowDown like Bash / PowerShell)
  const [commandHistory, setCommandHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('terminal_cmd_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const draftInputRef = useRef('');

  useEffect(() => {
    try {
      localStorage.setItem('terminal_cmd_history', JSON.stringify(commandHistory.slice(-50)));
    } catch {}
  }, [commandHistory]);

  const availableCommands = Object.keys(COMMAND_REGISTRY).filter(cmd => cmd.startsWith(slashFilter));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showHistoryModal) {
          setShowHistoryModal(false);
        } else if (isTerminalPopupOpen) {
          setIsTerminalPopupOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTerminalPopupOpen, showHistoryModal, setIsTerminalPopupOpen]);

  const handleNewChat = () => {
    if (messages.length > 1) {
      setHistoryList(prev => [{ id: Date.now(), messages: [...messages], timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
    }
    setMessages([initialMsg]);
    setShowHistoryModal(false);
  };

  const handleDeleteHistoryItem = (id, e) => {
    if (e) e.stopPropagation();
    setHistoryList(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('terminal_history_list', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    setHistoryList([]);
    localStorage.removeItem('terminal_history_list');
  };

  const sendMessage = async (text) => {
    // FIX M4: allow sending when only attachments are present (server accepts
    // attachments-only requests).
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    
    let userQuery = text.trim();
    const isSlash = userQuery.startsWith('/');
    const cmdNormalized = isSlash ? userQuery.substring(1).toLowerCase() : userQuery.toLowerCase();
    
    if (userQuery) {
      setCommandHistory(prev => {
        const filtered = prev.filter(c => c !== userQuery);
        return [...filtered, userQuery].slice(-50);
      });
    }
    setHistoryIndex(-1);
    draftInputRef.current = '';
    setInput('');
    setShowSlashMenu(false);

    if (COMMAND_REGISTRY[cmdNormalized]) {
       if (cmdNormalized === 'clear') {
         setMessages([{ role: 'system', content: 'Console cleared.', time: getCurrentTime() }]);
         return;
       }
       setMessages(prev => [
         ...prev, 
         { role: 'user', content: userQuery, time: getCurrentTime() },
         { role: 'ai', content: COMMAND_REGISTRY[cmdNormalized]().join('\n\n'), time: getCurrentTime(), isStatic: true }
       ]);
       return;
    }

    // Command ganti model HANYA dieksekusi jika:
    // 1. Pengguna mengetik persis 'model' (reset ke auto)
    // 2. ATAU pengguna mengetik persis 2 token: 'model <valid_model>' (misal: 'model nano', 'model deepseek')
    // Jika kalimat mengandung lebih dari 2 kata (contoh: "model apa kamu", "model apa yang dipakai"), itu pertanyaan chat biasa!
    const cmdTokens = cmdNormalized.trim().split(/\s+/);
    if (cmdTokens[0] === 'model' && (cmdTokens.length === 1 || (cmdTokens.length === 2 && VALID_MODELS.includes(cmdTokens[1])))) {
      const chosen = cmdTokens[1] || 'auto';
      const finalModel = VALID_MODELS.includes(chosen) ? chosen : 'auto';
      localStorage.setItem('ai_selected_model', finalModel);
      setSelectedModel(finalModel);
      telemetry.logEvent('model_select', finalModel, `Pilihan Model: ${finalModel}`);

      setMessages(prev => [
        ...prev, 
        { role: 'user', content: userQuery, time: getCurrentTime() },
        { role: 'system', content: `[AI Model Manager] Model aktif berhasil diubah ke: ${finalModel.toUpperCase()}`, time: getCurrentTime() }
      ]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: userQuery, time: getCurrentTime() }]);
    setLoadingPhase('request');
    setIsLoading(true);

    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = setTimeout(() => {
      setLoadingPhase('thinking');
    }, 1400);

    try {
      // FIX M4: forward attachments ({name,type,data}; images carry a data URL
      // plus isImage:true — matches /api/chat consumption). _bytes is client-only.
      const payloadAttachments = Array.isArray(attachments) 
        ? attachments.map(({ _bytes, ...att }) => att) 
        : [];
      const rawChosen = selectedModel || localStorage.getItem('ai_selected_model') || 'auto';
      const currentChosenModel = VALID_MODELS.includes(rawChosen) ? rawChosen : 'auto';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          model: currentChosenModel,
          reasoningEffort: effort,
          history: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
          attachments: payloadAttachments
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorDetail = data?.error || data?.message || `HTTP ${res.status} Error Gateway`;
        throw new Error(errorDetail);
      }
      
      // Clear consumed attachments on success (keep them on error so retry is easy).
      setAttachments([]);
      setAttachError('');
      
      let finalResponse = data?.response || "Maaf, terjadi kesalahan atau antrean penuh.";
      // Save continuous RAG memories (explicit facts the model wants to persist)
      const memoryRegex = /\[SAVE_MEMORY:\s*([\s\S]*?)\]/gi;
      const rawResponse = data.response || "";
      let memoryMatch;
      while ((memoryMatch = memoryRegex.exec(rawResponse)) !== null) {
        if (memoryMatch[1] && memoryMatch[1].trim()) {
          saveAIMemory(memoryMatch[1].trim(), telemetry.sessionId || 'unknown');
        }
      }
      // Strip internal scratchpad, chain-of-thought, or constraints reflection leaks
      finalResponse = finalResponse
        .replace(/["']?\s*[-–—*•]?\s*(?:Check constraints|Response structure|Final plan|Draft:|Checking constraints|Let's check constraints|Check against|Response plan:)[\s\S]*/i, '')
        .replace(/\b(?:Draft|Final plan|Response plan):\s*["']?([\s\S]+?)["']?(?=\s*[-–—*•]?\s*(?:Check|Response structure|Final plan|$))/i, '$1')
        .replace(/^["']|["']$/g, '')
        .trim();

      // Clean memory tags & AI punctuation artifacts (remove robotic em-dashes and non-breaking hyphens)
      finalResponse = finalResponse.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
      finalResponse = finalResponse
        .replace(/[\u2010\u2011]/g, '-')
        .replace(/[\u202F\u00A0]/g, ' ')
        .replace(/(\b[A-Za-z0-9_]+)\s*[\u2013\u2014]\s*(seperti|misalnya|contohnya|yakni|yaitu|termasuk)\b/gi, '$1, $2')
        .replace(/([a-zA-Z0-9_]+)[\u2013\u2014]([a-zA-Z0-9_]+)/g, '$1, $2')
        .replace(/\s*[\u2013\u2014]\s*/g, ', ')
        .replace(/,\s*,+/g, ',')
        .replace(/[^\S\r\n]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Auto-Format Markdown Structure & Table Reconstruction (CommonMark GFM)
      finalResponse = normalizeStructuredMarkdown(finalResponse);

      // Telemetry Chat Logging (Kueri dicatat ke telemetry event, bukan ke basis data RAG)
      telemetry.logEvent('ai_query_sent', currentChosenModel, userQuery.slice(0, 100));

      // Format model name & provider for message header
      const actualModel = data.model || currentChosenModel || 'nemotron-3-nano:30b';
      const providerName = data.provider || (actualModel.includes('nano') ? 'Ollama Cloud SOTA Engine' : 'AI Gateway');
      const isAuto = !currentChosenModel || currentChosenModel === 'auto';
      const headerModelName = isAuto
        ? `Auto Router -> ${actualModel.toUpperCase().replace(/^NVIDIA\//i, '')}`
        : actualModel.toUpperCase();

      // Log accurate multi-model event to telemetry with auto prefix for smart cascade routing
      const targetModel = isAuto ? `auto:${actualModel}` : actualModel;
      const routeLabel = isAuto
        ? `[Auto Router -> ${actualModel}] [${providerName}] effort:${effort}`
        : `[Direct -> ${actualModel}] [${providerName}] effort:${effort}`;
      telemetry.logEvent('ai_chat', targetModel, routeLabel);

      // Typewriter Effect Streaming
      const aiMsgId = Date.now();
      const newAiMsg = {
        id: aiMsgId,
        role: 'ai',
        content: '',
        modelName: headerModelName,
        providerName: `(${providerName})`,
        effort: effort,
        time: getCurrentTime(),
        isTyping: true
      };

      setMessages(prev => [...prev, newAiMsg]);

      // Stream characters at high speed with auto-scroll
      let charIndex = 0;
      const totalLen = finalResponse.length;
      const chunkSize = Math.max(2, Math.ceil(totalLen / 80)); // Smooth 1-2s total duration
      
      const typeTimer = setInterval(() => {
        charIndex += chunkSize;
        if (charIndex >= totalLen) {
          clearInterval(typeTimer);
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: finalResponse, isTyping: false } : m));
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        } else {
          const partial = finalResponse.substring(0, charIndex);
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: partial } : m));
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 16);

    } catch (err) {
      const errMsg = err?.message && err.message !== 'API Error' 
        ? `⚠️ ${err.message}` 
        : '⚠️ Gagal terhubung ke API Gateway. Pastikan koneksi atau server dev aktif.';
      setMessages(prev => [...prev, { role: 'ai', content: errMsg, time: getCurrentTime() }]);
    } finally {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      setLoadingPhase('idle');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (historyIndex !== -1) {
      setHistoryIndex(-1);
    }
    
    if (val.startsWith('/')) {
      const filter = val.substring(1).toLowerCase();
      setSlashFilter(filter);
      setShowSlashMenu(true);
      setSlashSelectedIndex(0);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e) => {
    // 1. Navigasi menu slash command bila aktif
    if (showSlashMenu && availableCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev + 1) % availableCommands.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev - 1 + availableCommands.length) % availableCommands.length);
        return;
      } else if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const chosen = availableCommands[slashSelectedIndex];
        if (chosen) {
           sendMessage(`/${chosen}`);
        }
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }

    // 2. Navigasi riwayat perintah (ArrowUp / ArrowDown ala Terminal & PowerShell)
    if (!showSlashMenu && commandHistory.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex === -1) {
          draftInputRef.current = input; // simpan draf sebelum menavigasi riwayat
          const nextIdx = commandHistory.length - 1;
          setHistoryIndex(nextIdx);
          setInput(commandHistory[nextIdx]);
        } else if (historyIndex > 0) {
          const nextIdx = historyIndex - 1;
          setHistoryIndex(nextIdx);
          setInput(commandHistory[nextIdx]);
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIndex !== -1) {
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) {
            const nextIdx = historyIndex + 1;
            setHistoryIndex(nextIdx);
            setInput(commandHistory[nextIdx]);
          } else {
            // Sudah di perintah paling baru, kembalikan ke draf ketikan awal
            setHistoryIndex(-1);
            setInput(draftInputRef.current);
          }
        }
      }
    }
  };

  const handleShortcutClick = (cmd) => {
    sendMessage(cmd);
  };

  // FIX M4: paperclip handler — read text/code files as text and images as
  // base64 data URLs, cap total size, show friendly message for PDFs.
  const MAX_ATTACHMENT_BYTES = 12 * 1024 * 1024;
  const MAX_ATTACHMENTS = 5;

  const readAttachmentFile = (file) => new Promise((resolve) => {
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      if (isImage) {
        resolve({ name: file.name, type: file.type || 'image/jpeg', data: reader.result, isImage: true });
      } else {
        resolve({ name: file.name, type: file.type || 'text/plain', data: String(reader.result || '') });
      }
    };
    reader.onerror = () => resolve(null);
    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setAttachError('');

    // PDFs would need pdf.js (not installed) — friendly message instead.
    if (files.some(f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name))) {
      setAttachError('Lampiran PDF belum didukung. Silakan lampirkan file teks/kode atau gambar.');
      return;
    }

    const currentBytes = attachments.reduce((s, a) => s + (a._bytes || 0), 0);
    const totalBytes = currentBytes + files.reduce((s, f) => s + f.size, 0);
    if (totalBytes > MAX_ATTACHMENT_BYTES) {
      setAttachError('Total ukuran lampiran melebihi batas 12MB.');
      return;
    }

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setAttachError(`Maksimal ${MAX_ATTACHMENTS} lampiran per pesan.`);
      return;
    }

    const next = [...attachments];
    for (const file of files) {
      const att = await readAttachmentFile(file);
      if (att) next.push({ ...att, _bytes: file.size });
    }
    setAttachments(next);
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
    setAttachError('');
  };

  const handleDownload = (content) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "response.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const terminalContent = (
    <div 
      className={cn(
        isTerminalPopupOpen ? "fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xl glass-backdrop-in p-2 sm:p-4" : "relative w-full"
      )}
      onClick={(e) => {
        if (isTerminalPopupOpen && e.target === e.currentTarget) {
          setIsTerminalPopupOpen(false);
        }
      }}
    >
      <div className={cn(
        "w-full max-w-5xl mx-auto flex flex-col overflow-hidden liquid-glass-strong font-mono text-sm relative transition-all duration-300",
        isTerminalPopupOpen ? "h-[94vh] sm:h-[92vh] shadow-[0_0_50px_rgba(34,211,238,0.15)] glass-spring-in" : "h-150 sm:h-175"
      )}>
        
        {/* Terminal App Header */}
        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-400 uppercase">
              Terminal Developer Lab & AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-2">
             {isTerminalPopupOpen ? (
               <button onClick={() => { setIsTerminalPopupOpen(false); if (onClose) onClose(); }} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition" title="Tutup Modal" aria-label="Tutup Modal">
                 <X className="w-4 h-4" />
               </button>
             ) : (
               <button onClick={() => setIsTerminalPopupOpen(true)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition" title="Buka Pop-up Jendela Terminal" aria-label="Buka Pop-up">
                 <Maximize2 className="w-3.5 h-3.5" />
               </button>
             )}
          </div>
        </div>
  
        {/* Control Bar (Riwayat, Baru, Pop-up) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-1.5 border-b border-zinc-200 dark:border-white/10 liquid-glass-inset gap-2 shrink-0 relative z-20">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-zinc-700 dark:text-zinc-400 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
              rafly@portfolio-lab:~ (bash / AI Engine)
            </span>
          </div>
          
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs text-zinc-700 dark:text-zinc-400 font-medium w-full sm:w-auto">
            <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-[11px] shrink-0 cursor-pointer">
              <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Riwayat
            </button>
            <button onClick={handleNewChat} className="flex items-center gap-1 hover:text-emerald-950 dark:hover:text-white transition px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 text-[11px] shrink-0 cursor-pointer">
              <Plus className="w-3 h-3" /> Baru
            </button>
            
            <div className="hidden sm:block h-3.5 w-px bg-zinc-300 dark:bg-white/20 mx-0.5"></div>
            
            <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 shrink-0 text-[11px]" title={`Model AI Aktif: ${selectedModel.toUpperCase()}`}>
              <span className="text-zinc-600 dark:text-zinc-400">Model:</span> 
              <span className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase">
                {selectedModel === 'auto' ? 'AUTO ROUTER' : selectedModel}
              </span>
            </div>

            <div className="hidden sm:block h-3.5 w-px bg-zinc-300 dark:bg-white/20 mx-0.5"></div>

            <div className="flex items-center gap-1 shrink-0" title="Pilih Reasoning Effort & Thinking Mode">
              <span className="text-zinc-600 dark:text-zinc-400 text-[11px] hidden xs:inline">Effort:</span>
              <CustomSelectEffort value={effort} onChange={(val) => setEffort(val)} />
            </div>
          </div>
        </div>

      {/* Shortcut Bar */}
      <div className="flex items-center gap-1.5 px-3 py-1 border-b border-zinc-200 dark:border-white/5 bg-slate-100/70 dark:bg-slate-900/40 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
        <span className="text-[10px] text-zinc-500 font-medium mr-1">Pintasan:</span>
        {["skills", "projects", "certifs", "benchmarks", "models", "ai-status", "about", "contact"].map(cmd => (
          <button 
            key={cmd}
            onClick={() => handleShortcutClick(`/${cmd}`)}
            className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-white/5 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 text-zinc-700 dark:text-zinc-400 hover:text-cyan-700 dark:hover:text-cyan-300 border border-zinc-200 dark:border-transparent hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            {cmd}
          </button>
        ))}
        <button 
          onClick={() => setMessages([{ role: 'system', content: 'Console cleared.', time: getCurrentTime() }])}
          className="text-[10px] px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-200 dark:border-transparent hover:border-red-300 dark:hover:border-red-500/30 transition-all ml-auto shrink-0 cursor-pointer shadow-2xs"
        >
          clear
        </button>
      </div>

      {/* Terminal Body (Messages) */}
      <div ref={scrollRef} data-lenis-prevent="true" className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-3.5 sm:p-5 space-y-4 scroll-smooth bg-black/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex flex-col w-full mb-2", msg.role === 'user' ? "items-end" : "items-start")}>
            
            {msg.role === 'user' ? (
              // User Bubble
              <div className="flex flex-col items-end max-w-[90%] sm:max-w-3/4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">{msg.time || getCurrentTime()}</span>
                  <span className="text-xs font-semibold text-emerald-400">You (Pengunjung)</span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <User className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-2xl rounded-tr-sm px-4 py-3 text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-[13px] sm:text-sm">
                  {msg.content}
                </div>
              </div>
            ) : msg.role === 'system' ? (
              // System Message
              <div className="w-full flex justify-center my-2">
                <span className="text-xs text-zinc-500 font-medium border border-white/10 px-3 py-1 rounded-full bg-white/5">
                  {msg.content}
                </span>
              </div>
            ) : (
              // AI Bubble
              <div className="flex flex-col items-start w-full max-w-[95%] sm:max-w-[85%]">
                <div className="flex flex-wrap items-center gap-2 mb-2 w-full">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shrink-0">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-cyan-400">
                    {msg.modelName || (msg.isStatic ? "System Engine" : "Auto Router -> NEMOTRON 3 NANO")}
                    {!msg.isStatic && <span className="text-zinc-500 mx-1 uppercase">[Effort: {msg.effort || effort}]</span>}
                  </span>
                  {!msg.isStatic && <span className="hidden lg:inline text-[10px] text-zinc-500">{msg.providerName || "(Ollama Cloud SOTA Engine)"}</span>}
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium sm:ml-2">{msg.time || getCurrentTime()}</span>
                  
                  <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> <span className="hidden sm:inline">Salin</span>
                    </button>
                    <button 
                      onClick={() => handleDownload(msg.content)}
                      className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10 transition cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> <span className="hidden sm:inline">Unduh .md</span>
                    </button>
                  </div>
                </div>
                
                <div className="w-full liquid-glass rounded-2xl rounded-tl-sm px-4 py-4 sm:px-6 text-zinc-200">
                  <div className="markdown-body max-w-none leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.isTyping && (
                      <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 align-middle" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start w-full my-2">
             <div className="flex items-center gap-2.5 w-full">
                {loadingPhase === 'request' ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                      <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] uppercase tracking-wider font-mono">API Request</span>
                      <span className="animate-pulse">Menghubungkan ke API Gateway & mencari data...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shrink-0">
                      <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] uppercase tracking-wider font-mono">Thinking</span>
                      <span className="animate-pulse">Model merespons (OK), sedang berpikir & menyusun respons...</span>
                    </div>
                  </>
                )}
             </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div 
          className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-xl glass-backdrop-in p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHistoryModal(false);
            }
          }}
        >
          <div className="w-full max-w-2xl liquid-glass-strong rounded-2xl overflow-hidden font-mono glass-spring-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400" /> Riwayat Percakapan</h3>
              <div className="flex items-center gap-2">
                {historyList.length > 0 && (
                  <button 
                    onClick={handleClearAllHistory}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua</span>
                  </button>
                )}
                <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer">
                  <X className="w-4 h-4 text-zinc-400 hover:text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[60vh] no-scrollbar space-y-3 p-6 pt-0">
               <div className="p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition group relative">
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-cyan-400 font-medium group-hover:text-cyan-300 text-sm">Sesi Aktif</span>
                   <span className="text-[10px] text-zinc-500">Sekarang</span>
                 </div>
               <p className="text-xs text-zinc-400 truncate">
                 {messages.find(m => m.role === 'user')?.content.substring(0, 45) || "Belum ada interaksi..."}
               </p>
             </div>
             {historyList.map((hist, idx) => (
               <div key={hist.id} onClick={() => {
                 setMessages(hist.messages);
                 setShowHistoryModal(false);
               }} className="p-4 bg-white/2 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition group flex items-center justify-between">
                 <div className="flex-1 min-w-0 pr-3">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-zinc-300 font-medium group-hover:text-white text-sm">Sesi Terdahulu {historyList.length - idx}</span>
                     <span className="text-[10px] text-zinc-500">{new Date(hist.id).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <p className="text-xs text-zinc-500 truncate">
                     {hist.messages.find(m => m.role === 'user')?.content.substring(0, 45) || "Belum ada interaksi..."}
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={(e) => handleDeleteHistoryItem(hist.id, e)}
                   title="Hapus sesi ini"
                   className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30 transition opacity-80 group-hover:opacity-100 cursor-pointer shrink-0"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               </div>
             ))}

             {historyList.length === 0 && (
               <div className="text-center py-10 mt-6 border border-dashed border-white/10 rounded-xl bg-white/2">
                  <p className="text-sm text-zinc-500">Belum ada riwayat sesi terdahulu tersimpan.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    )}

      {/* Terminal Input Area */}
      <div className="p-2 sm:p-2.5 px-3 sm:px-4 liquid-glass-inset border-t border-white/10 relative z-10 shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          {/* FIX M4: attachment chips row */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attachments.map((att, idx) => (
                <span
                  key={`${att.name}-${idx}`}
                  className="inline-flex items-center gap-1.5 max-w-47.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300"
                >
                  <span className="truncate">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    aria-label={`Hapus lampiran ${att.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {attachError && (
            <p className="text-[10px] font-medium text-rose-400" role="alert">{attachError}</p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full relative">
            <span className="hidden sm:block text-cyan-400 font-semibold text-xs whitespace-nowrap pl-1">rafly@Lab:~$</span>
            <div className="flex-1 relative flex items-center w-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Lampirkan file"
                title="Lampirkan file (teks/kode/gambar)"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="text/*,image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ketik perintah atau tanya sesuatu... (misal: 'buatkan ringkasan')"
                className="w-full liquid-glass-inset border border-indigo-500/30 text-white rounded-xl py-2 sm:py-2.5 pl-8.5 pr-11 sm:pr-12 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 placeholder-zinc-500 transition-all text-xs sm:text-sm"
                disabled={isLoading}
              />
              
              {showSlashMenu && availableCommands.length > 0 && (
                <div data-lenis-prevent="true" className="absolute bottom-full mb-2 left-0 w-64 max-h-48 overflow-y-auto overscroll-contain no-scrollbar bg-white dark:bg-slate-800 border border-zinc-300 dark:border-indigo-500/30 rounded-xl shadow-2xl z-50 py-1">
                  {availableCommands.map((cmd, idx) => (
                    <div 
                      key={cmd} 
                      onClick={() => sendMessage(`/${cmd}`)}
                      className={cn(
                        "px-4 py-2 text-sm cursor-pointer transition-colors",
                        idx === slashSelectedIndex ? "bg-indigo-50 dark:bg-indigo-500/30 text-indigo-700 dark:text-white font-semibold" : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                      )}
                    >
                      /{cmd}
                    </div>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="absolute right-1.5 p-1.5 sm:p-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>
          <p className="text-center text-[8.5px] sm:text-[9px] text-zinc-500/80 mt-0.5">
            Catatan: Jawaban dihasilkan otomatis oleh AI Model. Harap verifikasi informasi penting secara mandiri.
          </p>
        </form>
      </div>
    </div>
    </div>
  );

  if (isTerminalPopupOpen) {
    return createPortal(terminalContent, document.body);
  }

  return terminalContent;
}
