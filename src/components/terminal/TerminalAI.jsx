import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, TerminalSquare, Loader2, X, Clock, Plus, ChevronDown, Copy, Download, Paperclip, User, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TerminalAI({ onClose }) {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const [activeModel, setActiveModel] = useState('NEMOTRON 3 NANO:30B');
  const [activeEffort, setActiveEffort] = useState('Auto (Balanced)');

  const [messages, setMessages] = useState([
    { 
      role: 'system', 
      content: '* INTERACTIVE DEVELOPER LAB / TERMINAL SIMULATOR (v5.2.0)\n* Initialization Sequence: Complete\n* Engine: OpenCode AI Gateway\n* Status: Online\n\nSelamat datang. Silakan ketik perintah atau pertanyaan Anda terkait portofolio.',
      time: getCurrentTime()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    const userQuery = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery, time: getCurrentTime() }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          model: 'auto',
          history: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      let finalResponse = data.response || "Maaf, terjadi kesalahan atau antrean penuh.";
      // Clean memory tags
      finalResponse = finalResponse.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();

      setMessages(prev => [...prev, { role: 'ai', content: finalResponse, time: getCurrentTime() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ Gagal terhubung ke API Gateway lokal. Jika Anda menjalankan secara lokal dengan Vite, pastikan `/api/chat` tersedia atau Vercel Dev dijalankan.', time: getCurrentTime() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleShortcutClick = (cmd) => {
    sendMessage(cmd);
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

  return (
    <div className="w-full max-w-5xl mx-auto h-[600px] sm:h-[700px] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl font-mono text-sm relative">
      
      {/* Terminal App Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-950/80 shrink-0">
        <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Terminal Developer Lab & AI Assistant
        </span>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-zinc-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
            rafly@portfolio-lab:~ (bash / AI Engine)
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-400 font-medium overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button className="flex items-center gap-1.5 hover:text-white transition px-2 py-1 rounded bg-white/5 border border-white/10 shrink-0">
            <Clock className="w-3.5 h-3.5" /> Riwayat
          </button>
          <button onClick={() => setMessages([])} className="flex items-center gap-1.5 hover:text-white transition px-2 py-1 rounded bg-white/5 border border-white/10 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Baru
          </button>
          
          <div className="hidden sm:block h-4 w-[1px] bg-white/20 mx-1"></div>
          
          <div className="relative flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition shrink-0">
            Model: 
            <select 
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer appearance-none pr-5 z-10 relative"
            >
              <option value="NEMOTRON 3 NANO:30B" className="bg-slate-900">NEMOTRON 3 NANO</option>
              <option value="GPT-4o Mini" className="bg-slate-900">GPT-4o Mini</option>
              <option value="Claude 3.5 Haiku" className="bg-slate-900">Claude 3.5 Haiku</option>
              <option value="Llama 3 8B" className="bg-slate-900">Llama 3 8B</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 pointer-events-none text-zinc-500" />
          </div>
          
          <div className="relative flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition shrink-0">
            Effort: 
            <select 
              value={activeEffort}
              onChange={(e) => setActiveEffort(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer appearance-none pr-5 z-10 relative"
            >
              <option value="Auto (Balanced)" className="bg-slate-900">Auto</option>
              <option value="Low (Fast)" className="bg-slate-900">Low</option>
              <option value="High (Detailed)" className="bg-slate-900">High</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 pointer-events-none text-zinc-500" />
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth bg-black/20">
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
                    Auto Router <span className="text-zinc-500 mx-1">{"->"}</span> {activeModel} <span className="text-zinc-500 mx-1">[Effort: {activeEffort.split(' ')[0]}]</span>
                  </span>
                  <span className="hidden lg:inline text-[10px] text-zinc-500">(Ollama Cloud SOTA Engine)</span>
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium sm:ml-2">{msg.time || getCurrentTime()}</span>
                  
                  <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10 transition"
                    >
                      <Copy className="w-3 h-3" /> <span className="hidden sm:inline">Salin</span>
                    </button>
                    <button 
                      onClick={() => handleDownload(msg.content)}
                      className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10 transition"
                    >
                      <Download className="w-3 h-3" /> <span className="hidden sm:inline">Unduh .md</span>
                    </button>
                  </div>
                </div>
                
                <div className="w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm px-4 py-4 sm:px-6 shadow-xl text-zinc-200">
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none [&>p]:last:mb-0 [&>p]:first:mt-0 leading-relaxed prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-a:text-cyan-400 prose-code:text-cyan-200 prose-code:bg-cyan-500/10 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
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
                <span className="text-xs font-semibold text-cyan-400 animate-pulse">Menyusun respons ({activeModel})...</span>
             </div>
          </div>
        )}
      </div>

      {/* Terminal Input Area */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-white/10 relative z-10 shrink-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full relative">
            <span className="hidden sm:block text-cyan-400 font-semibold text-sm whitespace-nowrap pl-2">rafly@Lab:~$</span>
            <div className="flex-1 relative flex items-center w-full">
              <button type="button" className="absolute left-3 text-zinc-500 hover:text-zinc-300 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik perintah atau tanya sesuatu... (misal: 'buatkan ringkasan')"
                className="w-full bg-slate-900 border border-indigo-500/30 text-white rounded-xl py-3 sm:py-3.5 pl-10 pr-12 sm:pr-14 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 placeholder-zinc-500 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
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
  );
}
