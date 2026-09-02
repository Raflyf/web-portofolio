import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, TerminalSquare, Loader2, X, Clock, Plus, ChevronDown, Copy, Download, Paperclip, User, Cpu, History, Maximize2, Minimize2, CheckCircle2, Check, Trash2 } from 'lucide-react';
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
    "",
    "Perintah Penggantian: Ketik 'model <nama>' (contoh: model nano / model lightning / model auto)."
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
  } catch (_) {}

  // 2. Asynchronously sync to serverless endpoint
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 4000);
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
  } catch (_) {}
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
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer outline-none ${
          isOpen 
            ? 'bg-cyan-500/15 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]' 
            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-zinc-200'
        }`}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-cyan-400' : 'text-zinc-400'}`} />
      </button>
      
      {isOpen && (
        <div 
          role="listbox"
          data-lenis-prevent="true"
          className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl bg-[#090d16] border border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(6,182,212,0.15)] z-[100] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3.5 py-1.5 text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider border-b border-white/5 font-semibold">
            Reasoning Effort
          </div>
          <div 
            data-lenis-prevent="true"
            className="py-1 max-h-72 overflow-y-auto overscroll-contain divide-y divide-white/5 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
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
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold' 
                    : 'text-zinc-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TerminalAI({ onClose }) {
  const { 
    isTerminalPopupOpen, setIsTerminalPopupOpen,
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    historyList, setHistoryList,
    effort, setEffort,
    getCurrentTime, initialMsg
  } = useTerminal();
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const scrollRef = useRef(null);

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // FIX M4: file attachment support (paperclip button was dead UI).
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [attachError, setAttachError] = useState('');

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

    if (cmdNormalized === 'model' || cmdNormalized.startsWith('model ')) {
      const chosen = cmdNormalized.split(' ')[1] || '';
      
      const validModels = ['auto', 'nano', 'lightning', 'omni', 'super', 'ultra', 'minimax', 'cohere', 'deepseek', 'free', 'codex', 'antigravity', 'vision'];
      
      // Jika kata setelah "model" adalah nama model yang valid, ubah model.
      // Jika kosong (hanya mengetik "model" saja), setel ke "auto".
      if (chosen === '' || validModels.includes(chosen)) {
        const finalModel = chosen === '' ? 'auto' : chosen;
        localStorage.setItem('ai_selected_model', finalModel);
        telemetry.logEvent('model_select', finalModel, `Pilihan Model: ${finalModel}`);

        setMessages(prev => [
          ...prev, 
          { role: 'user', content: userQuery, time: getCurrentTime() },
          { role: 'system', content: `[AI Model Manager] Model aktif berhasil diubah ke: ${finalModel.toUpperCase()}`, time: getCurrentTime() }
        ]);
        return;
      }
      
      // Jika kata setelah "model" bukan nama model (contoh: "model apa kamu"), biarkan proses chat berlanjut.
    }

    setMessages(prev => [...prev, { role: 'user', content: userQuery, time: getCurrentTime() }]);
    setIsLoading(true);

    try {
      // FIX M4: forward attachments ({name,type,data}; images carry a data URL
      // plus isImage:true — matches /api/chat consumption). _bytes is client-only.
      const payloadAttachments = Array.isArray(attachments) 
        ? attachments.map(({ _bytes, ...att }) => att) 
        : [];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          model: localStorage.getItem('ai_selected_model') || 'auto',
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
      // Clean memory tags
      finalResponse = finalResponse.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();

      // RAG Auto-Injection for Dashboard Logging (only queries >= 8 chars, not slash commands)
      if (userQuery.length >= 8 && !userQuery.startsWith('/')) {
        saveAIMemory(`Kueri Pengunjung: ${userQuery}`, telemetry.sessionId || 'unknown');
      }

      // Format model name & provider for message header
      const chosenModel = localStorage.getItem('ai_selected_model') || 'auto';
      const actualModel = data.model || chosenModel || 'nemotron-3-nano:30b';
      const providerName = data.provider || (actualModel.includes('nano') ? 'Ollama Cloud SOTA Engine' : 'AI Gateway');
      const headerModelName = chosenModel === 'auto'
        ? `Auto Router -> ${actualModel.toUpperCase().replace(/^NVIDIA\//i, '')}`
        : actualModel.toUpperCase();

      // Log accurate multi-model event to telemetry
      const routeLabel = chosenModel === 'auto'
        ? `[Auto Router -> ${actualModel}] [${providerName}] effort:${effort}`
        : `[Direct -> ${actualModel}] [${providerName}] effort:${effort}`;
      telemetry.logEvent('ai_chat', actualModel, routeLabel);

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
    if (showSlashMenu && availableCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev + 1) % availableCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev - 1 + availableCommands.length) % availableCommands.length);
      } else if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const chosen = availableCommands[slashSelectedIndex];
        if (chosen) {
           sendMessage(`/${chosen}`);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
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
        isTerminalPopupOpen ? "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl glass-backdrop-in p-4 sm:p-8" : "relative w-full"
      )}
      onClick={(e) => {
        if (isTerminalPopupOpen && e.target === e.currentTarget) {
          setIsTerminalPopupOpen(false);
        }
      }}
    >
      <div className={cn(
        "w-full max-w-5xl mx-auto flex flex-col overflow-hidden liquid-glass-strong font-mono text-sm relative transition-all duration-300",
        isTerminalPopupOpen ? "h-[85vh] shadow-[0_0_50px_rgba(34,211,238,0.15)] glass-spring-in" : "h-[600px] sm:h-[700px]"
      )}>
        
        {/* Terminal App Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Terminal Developer Lab & AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-2">
             {isTerminalPopupOpen ? (
               <button onClick={() => setIsTerminalPopupOpen(false)} className="text-zinc-500 hover:text-white transition" title="Tutup Modal" aria-label="Tutup Modal">
                 <X className="w-4 h-4" />
               </button>
             ) : (
               <button onClick={() => setIsTerminalPopupOpen(true)} className="text-zinc-500 hover:text-white transition" title="Buka Pop-up Jendela Terminal" aria-label="Buka Pop-up">
                 <Maximize2 className="w-3.5 h-3.5" />
               </button>
             )}
          </div>
        </div>
  
        {/* Control Bar (Riwayat, Baru, Pop-up) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-white/10 liquid-glass-inset gap-3 shrink-0 relative z-20">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-zinc-400 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
              rafly@portfolio-lab:~ (bash / AI Engine)
            </span>
          </div>
          
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs text-zinc-400 font-medium pb-1 sm:pb-0 w-full sm:w-auto">
            <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-1.5 hover:text-white transition px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0">
              <Clock className="w-3.5 h-3.5" /> Riwayat
            </button>
            <button onClick={handleNewChat} className="flex items-center gap-1.5 hover:text-white transition px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Plus className="w-3.5 h-3.5" /> Baru
            </button>
            
            <div className="hidden sm:block h-4 w-[1px] bg-white/20 mx-1"></div>
            
            <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0" title="Smart Cascade Auto Router">
              Model: 
              <span className="bg-cyan-500/20 text-cyan-400 font-bold px-2 py-0.5 rounded text-[10px]">AUTO ROUTER</span>
            </div>

            <div className="hidden sm:block h-4 w-[1px] bg-white/20 mx-1"></div>

            <div className="flex items-center gap-1.5 shrink-0" title="Pilih Reasoning Effort & Thinking Mode">
              <span className="text-zinc-400 text-xs hidden xs:inline">Effort:</span>
              <CustomSelectEffort value={effort} onChange={(val) => setEffort(val)} />
            </div>
          </div>
        </div>

      {/* Shortcut Bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-900/40 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
        <span className="text-[10px] sm:text-xs text-zinc-500 font-medium mr-1">Pintasan:</span>
        {["skills", "projects", "certifs", "benchmarks", "models", "ai-status", "about", "contact"].map(cmd => (
          <button 
            key={cmd}
            onClick={() => handleShortcutClick(`/${cmd}`)}
            className="text-[10px] sm:text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30 transition-all shrink-0"
          >
            {cmd}
          </button>
        ))}
        <button 
          onClick={() => setMessages([{ role: 'system', content: 'Console cleared.', time: getCurrentTime() }])}
          className="text-[10px] sm:text-xs px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all ml-auto shrink-0"
        >
          clear
        </button>
      </div>

      {/* Terminal Body (Messages) */}
      <div ref={scrollRef} data-lenis-prevent="true" className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-4 sm:p-6 space-y-6 scroll-smooth bg-black/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex flex-col w-full mb-2", msg.role === 'user' ? "items-end" : "items-start")}>
            
            {msg.role === 'user' ? (
              // User Bubble
              <div className="flex flex-col items-end max-w-[90%] sm:max-w-[75%]">
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
          <div className="flex flex-col items-start w-full">
             <div className="flex items-center gap-2 mb-1.5 w-full">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                </div>
                <span className="text-xs font-semibold text-cyan-400 animate-pulse">Menyusun respons via Auto Router...</span>
             </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xl glass-backdrop-in p-4"
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
               }} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition group flex items-center justify-between">
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
               <div className="text-center py-10 mt-6 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                  <p className="text-sm text-zinc-500">Belum ada riwayat sesi terdahulu tersimpan.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    )}

      {/* Terminal Input Area */}
      <div className="p-3 sm:p-4 liquid-glass-inset border-t border-white/10 relative z-10 shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {/* FIX M4: attachment chips row */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, idx) => (
                <span
                  key={`${att.name}-${idx}`}
                  className="inline-flex items-center gap-1.5 max-w-[190px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300"
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
            <span className="hidden sm:block text-cyan-400 font-semibold text-sm whitespace-nowrap pl-2">rafly@Lab:~$</span>
            <div className="flex-1 relative flex items-center w-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Lampirkan file"
                title="Lampirkan file (teks/kode/gambar)"
              >
                <Paperclip className="w-4 h-4" />
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
                className="w-full liquid-glass-inset border border-indigo-500/30 text-white rounded-xl py-3 sm:py-3.5 pl-10 pr-12 sm:pr-14 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 placeholder-zinc-500 transition-all text-sm"
                disabled={isLoading}
              />
              
              {showSlashMenu && availableCommands.length > 0 && (
                <div data-lenis-prevent="true" className="absolute bottom-full mb-2 left-0 w-64 max-h-48 overflow-y-auto overscroll-contain no-scrollbar bg-slate-800 border border-indigo-500/30 rounded-xl shadow-2xl z-50 py-1">
                  {availableCommands.map((cmd, idx) => (
                    <div 
                      key={cmd} 
                      onClick={() => sendMessage(`/${cmd}`)}
                      className={cn(
                        "px-4 py-2 text-sm cursor-pointer transition-colors",
                        idx === slashSelectedIndex ? "bg-indigo-500/30 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
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
                className="absolute right-2 p-2 sm:p-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
          <p className="text-center text-[9px] sm:text-[10px] text-zinc-500 mt-1">
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
