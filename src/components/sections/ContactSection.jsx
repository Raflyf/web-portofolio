import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Copy, Check, Send, AlertCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { DEVELOPER_PROFILE } from '../../data';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
    _honeypot: ''
  });
  const [status, setStatus] = useState({ type: '', message: '', waUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(DEVELOPER_PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status.message) {
      setStatus({ type: '', message: '', waUrl: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot anti-spam verification
    if (formState._honeypot) {
      return;
    }

    const { name, email, message } = formState;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({
        type: 'error',
        message: 'Harap lengkapi semua kolom nama, email, dan pesan dengan benar.'
      });
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setStatus({
        type: 'error',
        message: 'Format alamat email tidak valid. Harap periksa kembali.'
      });
      return;
    }

    // Rate limiting check via localStorage
    const lastSubmit = localStorage.getItem('portfolio_last_submit');
    const now = Date.now();
    if (lastSubmit && (now - parseInt(lastSubmit, 10)) < 30000) {
      const remainingSec = Math.ceil((30000 - (now - parseInt(lastSubmit, 10))) / 1000);
      setStatus({
        type: 'error',
        message: `Mohon menunggu ${remainingSec} detik sebelum mengirimkan pesan kembali demi mencegah spam.`
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        _subject: `Pesan Portofolio Baru dari ${name.trim()} (${email.trim()})`,
        _template: 'table',
        _captcha: 'false'
      };

      const response = await fetch(`https://formsubmit.co/ajax/${DEVELOPER_PROFILE.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok || data.success === 'true' || data.success === true) {
        localStorage.setItem('portfolio_last_submit', Date.now().toString());
        const waText = encodeURIComponent(`Halo Rafly, saya ${name.trim()} (${email.trim()}). Pesan: ${message.trim()}`);
        const waUrl = `${DEVELOPER_PROFILE.whatsappUrl}?text=${waText}`;

        setStatus({
          type: 'success',
          message: 'Pesan Anda berhasil dikirim ke kotak masuk email! Anda juga dapat melanjutkan komunikasi langsung melalui WhatsApp.',
          waUrl
        });

        setFormState({ name: '', email: '', message: '', _honeypot: '' });
      } else {
        throw new Error(data.message || 'Gagal mengirimkan pesan');
      }
    } catch (err) {
      // Fallback message with direct WA backup
      const waText = encodeURIComponent(`Halo Rafly, saya ${name.trim()} (${email.trim()}). Pesan: ${message.trim()}`);
      const waUrl = `${DEVELOPER_PROFILE.whatsappUrl}?text=${waText}`;
      setStatus({
        type: 'error',
        message: 'Pengiriman formulir email mengalami kendala jaringan. Anda dapat mengirimkan pesan secara instan via WhatsApp berikut.',
        waUrl
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 mb-16"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Terhubung</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
          Hubungi & Diskusikan Peluang
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          Terbuka untuk diskusi proyek rekayasa perangkat lunak, kolaborasi riset model AI/ML, dan peluang profesional.
        </p>
      </motion.div>

      {/* Grid Layout: Contact Cards & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Action Cards */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 space-y-4"
        >
          {/* Email Direct Copy Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                Respon Cepat
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Langsung</span>
              <p className="text-base sm:text-lg font-bold text-white font-mono mt-0.5 group-hover:text-cyan-300 transition-colors break-all">
                {DEVELOPER_PROFILE.email}
              </p>
            </div>
            <button
              onClick={handleCopyEmail}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Salin Alamat Email</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Direct Chat Card */}
          <a
            href={DEVELOPER_PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all duration-300 group block"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                WhatsApp Chat
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pesan Instan</span>
              <p className="text-base sm:text-lg font-bold text-white font-mono mt-0.5 group-hover:text-emerald-300 transition-colors">
                {DEVELOPER_PROFILE.whatsapp}
              </p>
            </div>
            <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all">
              <span>Buka Chat WhatsApp</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </a>

          {/* GitHub Profile Card */}
          <a
            href={DEVELOPER_PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all duration-300 group block"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Github className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400/80 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                Repositori Publik
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Profil Developer</span>
              <p className="text-base sm:text-lg font-bold text-white font-mono mt-0.5 group-hover:text-indigo-300 transition-colors">
                github.com/Raflyf
              </p>
            </div>
            <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all">
              <span>Kunjungi Profil GitHub</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </a>

        </motion.div>

        {/* Right Column: Contact Form with FormSubmit */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 p-8 sm:p-10 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Kirimkan Pesan Langsung
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
            Formulir akan dikirimkan secara langsung ke kotak masuk email saya melalui integrasi API aman.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Honeypot Spam Protection Field */}
            <input 
              type="text" 
              name="_honeypot" 
              value={formState._honeypot} 
              onChange={handleChange} 
              className="hidden" 
              tabIndex={-1} 
              autoComplete="off" 
            />

            <div className="space-y-2">
              <label htmlFor="form-name" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Nama Lengkap
              </label>
              <input
                id="form-name"
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Masukkan nama Anda..."
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:bg-white/10 text-white placeholder-zinc-500 text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="form-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Alamat Email
              </label>
              <input
                id="form-email"
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="nama@instansi.com..."
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:bg-white/10 text-white placeholder-zinc-500 text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="form-message" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Pesan atau Diskusi Proyek
              </label>
              <textarea
                id="form-message"
                name="message"
                value={formState.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tuliskan detail pertanyaan atau tawaran kolaborasi riset/proyek..."
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:bg-white/10 text-white placeholder-zinc-500 text-sm outline-none transition-all resize-none"
              />
            </div>

            {/* Status Alert Banner */}
            <AnimatePresence>
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm flex flex-col gap-2 ${
                    status.type === 'success' 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' 
                      : 'bg-red-500/15 border-red-500/40 text-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {status.type === 'success' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{status.message}</span>
                  </div>

                  {status.waUrl && (
                    <a 
                      href={status.waUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-white underline underline-offset-4 hover:text-cyan-300 transition-colors ml-7 text-xs"
                    >
                      Buka Pesan di WhatsApp &rarr;
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-300 hover:from-cyan-300 hover:to-indigo-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirimkan Pesan...</span>
                </>
              ) : (
                <>
                  <span>Kirim Pesan Sekarang</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
