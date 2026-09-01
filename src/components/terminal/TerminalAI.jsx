import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, TerminalSquare, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TerminalAI({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: '* INTERACTIVE DEVELOPER LAB / TERMINAL SIMULATOR (v5.2.0)\n* Initialization Sequence: Complete\n* Engine: OpenCode AI Gateway\n* Status: Online\n\nSelamat datang. Silakan ketik perintah atau pertanyaan Anda terkait portofolio.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          model: 'auto',
          history: messages.filter(m => m.role !== 'system')
        })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      let finalResponse = data.response || "Maaf, terjadi kesalahan atau antrean penuh.";
      // Clean memory tags
      finalResponse = finalResponse.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();

      setMessages(prev => [...prev, { role: 'ai', content: finalResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ Gagal terhubung ke API Gateway lokal. Jika Anda menjalankan secara lokal dengan Vite, pastikan `/api/chat` tersedia atau Vercel Dev dijalankan.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl font-mono text-sm relative">
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-zinc-400 font-semibold flex items-center gap-2">
            <TerminalSquare className="w-4 h-4" />
            rafly@portfolio-lab:~
          </span>
        </div>
        
        {onClose && (
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Terminal Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col w-full mb-1">
            <div className={cn(
              "font-mono text-sm break-words flex gap-3",
              msg.role === 'user' 
                ? "text-emerald-400" 
                : (msg.role === 'system' ? "text-cyan-400" : "text-zinc-300")
            )}>
              <span className="shrink-0 opacity-70">
                {msg.role === 'user' ? 'guest@user:~$ ' : (msg.role === 'system' ? '[SYSTEM] ' : 'AI> ')}
              </span>
              <div className="prose prose-invert prose-sm max-w-none [&>p]:last:mb-0 [&>p]:first:mt-0 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col w-full mb-1 animate-pulse">
            <div className="font-mono text-sm break-words flex gap-3 text-zinc-400">
              <span className="shrink-0 opacity-70">AI> </span>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-green-400 font-bold">$&gt;</div>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ketik perintah atau pertanyaan Anda di sini..."
            className="w-full bg-black/50 border border-white/10 rounded-full py-3 pl-12 pr-14 text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-50 disabled:bg-white/20 disabled:text-white/50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
