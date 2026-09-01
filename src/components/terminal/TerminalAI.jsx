import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, TerminalSquare, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TerminalAI({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Sistem Terminal Interaktif [Versi 6.0 — React Engine]\n\nSaya adalah asisten AI Portofolio Rafly Firmansyah. Ada yang bisa saya bantu terkait proyek, sertifikasi, atau riset ML?' }
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
          <div key={idx} className={cn("flex flex-col max-w-[90%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
            <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
              {msg.role === 'user' ? 'Guest_User' : (msg.role === 'system' ? 'System' : 'AI Assistant')}
            </div>
            <div className={cn(
              "px-4 py-3 rounded-2xl border backdrop-blur-sm",
              msg.role === 'user' 
                ? "bg-white/10 border-white/10 text-white rounded-tr-sm"
                : (msg.role === 'system' 
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-200" 
                    : "bg-black/40 border-white/5 text-zinc-300 rounded-tl-sm")
            )}>
              <div className="prose prose-invert prose-sm max-w-none break-words [&>p]:last:mb-0 [&>p]:first:mt-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col max-w-[85%] mr-auto items-start animate-pulse">
            <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">AI Assistant</div>
            <div className="px-4 py-3 rounded-2xl border border-white/5 bg-black/40 text-zinc-400 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
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
