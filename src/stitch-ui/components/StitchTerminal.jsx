import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { CornerDownLeft, Terminal as TerminalIcon } from 'lucide-react';
import { telemetry } from '../../lib/telemetry';

export default function StitchTerminal() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('shell');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    {
      cmd: 'whoami',
      output: language === 'id' 
        ? 'Rafly Firmansyah — Software Developer & Peneliti AI/ML.\nFokus: Sentence Embeddings, Algoritma N-Gram Shingling, Arsitektur Jaringan MikroTik, dan Agen AI Multimodal.'
        : 'Rafly Firmansyah — AI Systems Engineer & Informatics Researcher.\nFocus: Sentence embeddings, N-Gram shingling algorithms, MikroTik network architectures, and multimodal AI agents.'
    },
    {
      cmd: 'cat /proc/benchmark-status',
      type: 'benchmark',
      metrics: [
        { label: 'Sentence-BERT S1 Plagiarism Inference Latency', value: '18.4ms (p95 batch=1)', percent: '92%' },
        { label: 'Whisper Audio Transcription Sub-Second Runtime', value: '~480ms turnaround', percent: '88%' },
        { label: 'XGBoost vs Complement Naive Bayes Accuracy (Thesis)', value: '98.83% ROC-AUC', percent: '98%' }
      ]
    }
  ]);

  const screenRef = useRef(null);

  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTop = screenRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (rawCmd) => {
    const trimmed = (rawCmd || '').trim();
    if (!trimmed) return;
    setInputVal('');

    telemetry.logEvent('terminal_command', 'stitch_console', `Perintah: ${trimmed}`);

    if (trimmed === 'clear') {
      setHistory([]);
      return;
    }

    let out = '';
    switch (trimmed.toLowerCase()) {
      case 'help':
        out = 'Available commands: whoami, projects, skills, research, benchmarks, contact, clear';
        break;
      case 'projects':
        out = '1. OpenPlagiarismChecker (NLP SBERT + N-Gram, 98.4% Precision)\n2. Spam-Email Detection System (CNB vs XGBoost S1 Thesis)\n3. FreeAiBot (Multimodal 24/7 AI Agent on WhatsApp & Telegram)\n4. laser_pointer_PPT (Gyroscope Presentation Controller)\n5. FotoKitaBlur (MediaPipe Gesture & Privacy Tool)';
        break;
      case 'skills':
        out = 'ML & NLP: PyTorch, Transformers, Prompt Engineering, Scikit-Learn, MediaPipe\nBackend: Python Flask, Node.js, FastAPI, Supabase PostgreSQL RAG\nNetwork: MikroTik RouterOS v7 (MTCNA Certified), Linux, WebSockets\nFrontend: React 19, Tailwind CSS, Framer Motion';
        break;
      case 'research':
        out = 'Undergraduate Thesis (UBSI): "Komparasi Algoritma Complement Naive Bayes dan XGBoost Berbasis Domain Adaptation untuk Deteksi Email Spam". Accuracy: 98.83%.';
        break;
      case 'benchmarks':
        setHistory(prev => [
          ...prev,
          {
            cmd: trimmed,
            type: 'benchmark',
            metrics: [
              { label: 'Local SBERT MiniLM Semantic Embeddings', value: '18.4ms / doc', percent: '94%' },
              { label: 'Whisper Voice Inference Stream', value: '~480ms sub-second', percent: '90%' },
              { label: 'Supabase Vector Similarity Cosine Lookup', value: '< 12ms', percent: '96%' }
            ]
          }
        ]);
        return;
      case 'whoami':
        out = 'Rafly Firmansyah — Informatics Undergraduate (UBSI) & Applied AI Developer.';
        break;
      case 'contact':
        out = 'Email: raflyfirmansyah02@gmail.com\nGitHub: https://github.com/Raflyf\nWhatsApp: +62 899-1333-323';
        break;
      default:
        out = `Command not recognized: "${trimmed}". Type "help" for a list of available commands.`;
    }

    setHistory(prev => [...prev, { cmd: trimmed, output: out }]);
  };

  return (
    <section className="flex flex-col gap-4" id="interactive-lab">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.9)]" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300">
            {language === 'id' ? 'Lingkungan Runtime Interaktif' : 'Interactive Runtime Environment'}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="text-cyan-300 font-medium">KERNEL: 6.8.0-NEURAL</span>
          <span className="hidden sm:inline text-emerald-400">STATE: ONLINE</span>
        </div>
      </div>

      {/* visionOS Liquid Console Box */}
      <div className="w-full rounded-2xl stitch-glass overflow-hidden flex flex-col font-mono text-xs border border-white/[0.18]">
        {/* Chrome Bar with Liquid Refraction Highlight */}
        <div className="px-4 py-3 bg-white/[0.04] border-b border-white/[0.1] flex items-center justify-between select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400/80 shadow-[0_0_6px_rgba(248,113,113,0.5)] inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.5)] inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.5)] inline-block" />
            <span className="ml-3 text-slate-300 text-[11px] hidden sm:inline">rafly@workstation: ~/neural-lab</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setActiveTab('shell')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${activeTab === 'shell' ? 'bg-white/[0.15] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              main.sh
            </button>
            <button 
              onClick={() => setActiveTab('benchmark')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${activeTab === 'benchmark' ? 'bg-white/[0.15] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              benchmarks.json
            </button>
            <button 
              onClick={() => setActiveTab('env')}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${activeTab === 'env' ? 'bg-white/[0.15] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              specs.env
            </button>
          </div>
        </div>

        {/* Tab Content 1: Shell */}
        {activeTab === 'shell' && (
          <>
            <div 
              ref={screenRef}
              className="p-5 sm:p-6 min-h-[260px] max-h-[380px] overflow-y-auto flex flex-col gap-4 text-slate-200 leading-relaxed font-mono bg-black/25"
            >
              <div className="text-slate-400 leading-normal pb-2 border-b border-white/5">
                Rafly Firmansyah Lab Session [v2.4.0-liquid]<br />
                {language === 'id' 
                  ? 'Ketik "help" untuk melihat perintah atau klik tombol cepat di bawah.' 
                  : 'Type "help" to list commands or select quick tags below.'}
              </div>

              {history.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-cyan-400 font-semibold">visitor@guest:~$</span>
                    <span className="text-slate-100">{item.cmd}</span>
                  </div>

                  {item.type === 'benchmark' ? (
                    <div className="pl-4 py-1 border-l border-cyan-400/40 flex flex-col gap-2.5 text-slate-300">
                      {item.metrics.map((m, mi) => (
                        <div key={mi} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[11px]">
                            <span>{m.label}</span>
                            <span className="text-cyan-300 font-mono font-medium">{m.value}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(0,242,254,0.6)]" 
                              style={{ width: m.percent }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-4 py-1 text-slate-200 border-l border-cyan-400/40 whitespace-pre-line">
                      {item.output}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Console Input Bar */}
            <div className="p-3 bg-white/[0.03] border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                <span className="text-[10px] text-slate-400 mr-1 uppercase">Commands:</span>
                {['projects', 'skills', 'research', 'benchmarks', 'contact', 'clear'].map(c => (
                  <button
                    key={c}
                    onClick={() => handleCommand(c)}
                    className="px-2 py-1 rounded-md stitch-capsule text-[11px] text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.12] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <span className="text-cyan-400 select-none font-bold">❯</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommand(inputVal)}
                  placeholder={language === 'id' ? "Ketik perintah ('projects', 'help')..." : "Type command ('projects', 'help')..."}
                  className="bg-transparent text-slate-100 focus:outline-none w-full placeholder:text-slate-500 font-mono text-xs"
                />
                <button
                  onClick={() => handleCommand(inputVal)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Eksekusi"
                >
                  <CornerDownLeft className="w-3.5 h-3.5 text-cyan-300" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Tab Content 2: Benchmarks */}
        {activeTab === 'benchmark' && (
          <div className="p-6 bg-black/25 flex flex-col gap-4 font-mono text-xs">
            <span className="text-slate-400">// EMPIRICAL EVALUATION SUITE</span>
            <pre className="text-cyan-300/90 leading-relaxed overflow-x-auto p-4 rounded-xl bg-black/40 border border-white/10">
{JSON.stringify({
  "framework": "PyTorch 2.4 + HuggingFace Transformers",
  "models": {
    "sentence_transformers": {
      "checkpoint": "all-MiniLM-L6-v2",
      "embedding_dim": 384,
      "p95_latency_ms": 18.4,
      "cosine_precision_at_k": 0.94
    },
    "audio_asr": {
      "engine": "OpenAI Whisper Turbo",
      "p95_latency_ms": 480,
      "multimodal_format": ["ogg", "wav", "mp3"]
    },
    "classifiers": {
      "thesis_model": "Complement Naive Bayes + XGBoost",
      "dataset_domain": "Enron + PU Corpus Academic Email",
      "f1_score": 0.9883,
      "roc_auc": 0.9912
    }
  }
}, null, 2)}
            </pre>
          </div>
        )}

        {/* Tab Content 3: Environment Specs */}
        {activeTab === 'env' && (
          <div className="p-6 bg-black/25 flex flex-col gap-3 font-mono text-xs text-slate-300">
            <span className="text-slate-400">// LOCAL WORKSTATION & RUNTIME MATRIX</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-white/10">
              <div><span className="text-slate-400">OS_TARGET:</span> Linux Ubuntu / Windows 11 WSL2</div>
              <div><span className="text-slate-400">ROUTEROS:</span> MikroTik v7.18 (MTCNA Verified)</div>
              <div><span className="text-slate-400">INFERENCE_DEVICE:</span> NVIDIA CUDA 12.x / TensorRT</div>
              <div><span className="text-slate-400">DATABASE:</span> Supabase PostgreSQL + pgvector</div>
              <div><span className="text-slate-400">EDGE_RUNTIME:</span> Vercel Serverless Functions</div>
              <div><span className="text-slate-400">NODE_ENV:</span> ES2024 / Vite 8 / Tailwind v4</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
