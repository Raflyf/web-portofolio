import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Copy, Check, Send, AlertCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { DEVELOPER_PROFILE } from '../../data.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { telemetry } from '../../lib/telemetry.js';

export default function ContactPortal() {
  const { language, t } = useLanguage();
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

    if (formState._honeypot) {
      return;
    }

    const { name, email, message } = formState;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({
        type: 'error',
        message: t('contact.errorRequired')
      });
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setStatus({
        type: 'error',
        message: t('contact.errorEmail')
      });
      return;
    }

    const lastSubmit = localStorage.getItem('portfolio_last_submit');
    const now = Date.now();
    if (lastSubmit && (now - parseInt(lastSubmit, 10)) < 30000) {
      const remainingSec = Math.ceil((30000 - (now - parseInt(lastSubmit, 10))) / 1000);
      setStatus({
        type: 'error',
        message: language === 'id' 
          ? `Mohon menunggu ${remainingSec} detik sebelum mengirimkan pesan kembali demi mencegah spam.`
          : `Please wait ${remainingSec} seconds before sending another message to prevent spam.`
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
        telemetry.logEvent('contact_submit', 'contact_form', 'Kirim Formulir Pesan Kontak V2');

        const waGreeting = language === 'id' ? 'Halo Rafly, saya' : 'Hello Rafly, I am';
        const waText = encodeURIComponent(`${waGreeting} ${name.trim()} (${email.trim()}). ${language === 'id' ? 'Pesan:' : 'Message:'} ${message.trim()}`);
        const waUrl = `${DEVELOPER_PROFILE.whatsappUrl}?text=${waText}`;

        setStatus({
          type: 'success',
          message: t('contact.successMsg'),
          waUrl
        });

        setFormState({ name: '', email: '', message: '', _honeypot: '' });
      } else {
        throw new Error(data.message || 'Gagal mengirimkan pesan');
      }
    } catch {
      const waGreeting = language === 'id' ? 'Halo Rafly, saya' : 'Hello Rafly, I am';
      const waText = encodeURIComponent(`${waGreeting} ${name.trim()} (${email.trim()}). ${language === 'id' ? 'Pesan:' : 'Message:'} ${message.trim()}`);
      const waUrl = `${DEVELOPER_PROFILE.whatsappUrl}?text=${waText}`;
      setStatus({
        type: 'error',
        message: language === 'id'
          ? 'Pengiriman formulir email mengalami kendala jaringan. Anda dapat mengirimkan pesan langsung via WhatsApp.'
          : 'Email submission encountered a network issue. You can message directly via WhatsApp.',
        waUrl
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto py-24">
      <div className="v2-glow-spot top-1/2 right-10 bg-cyan-600/10" />

      {/* Header */}
      <div className="space-y-4 mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full v2-glass-pill text-xs font-semibold uppercase tracking-wider text-cyan-400 v2-font-mono">
          <span>07 / {t('contact.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight v2-font-display">
          {t('contact.title')}
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg">
          {t('contact.subtitle')}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Communication Channels */}
        <div className="lg:col-span-5 space-y-4">
          {/* Email Card */}
          <div className="v2-glass-card p-6 rounded-3xl space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl v2-glass-pill flex items-center justify-center text-cyan-400">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Primary Email
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                {t('contact.emailDirect')}
              </span>
              <p className="text-sm sm:text-base font-bold text-white font-mono mt-1 group-hover:text-cyan-300 transition-colors break-all">
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
                  <span className="text-emerald-300">{language === 'id' ? 'Tersalin ke Clipboard!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>{t('contact.copyEmail')}</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Card */}
          <a
            href={DEVELOPER_PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => telemetry.logEvent('link_click', 'whatsapp', 'Klik Chat WhatsApp V2')}
            className="v2-glass-card v2-glass-card-interactive p-6 rounded-3xl space-y-4 block group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl v2-glass-pill flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Instant Chat
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                {t('contact.whatsappDirect')}
              </span>
              <p className="text-sm sm:text-base font-bold text-white font-mono mt-1 group-hover:text-emerald-300 transition-colors">
                {DEVELOPER_PROFILE.whatsapp}
              </p>
            </div>
            <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/25 transition-all">
              <span>{t('contact.openWhatsapp')}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </a>

          {/* GitHub Card */}
          <a
            href={DEVELOPER_PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => telemetry.logEvent('link_click', 'github', 'Klik Profil GitHub V2')}
            className="v2-glass-card v2-glass-card-interactive p-6 rounded-3xl space-y-4 block group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl v2-glass-pill flex items-center justify-center text-indigo-400">
                <GithubIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                Public Repos
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                GitHub Profile
              </span>
              <p className="text-sm sm:text-base font-bold text-white font-mono mt-1 group-hover:text-indigo-300 transition-colors">
                github.com/Raflyf
              </p>
            </div>
            <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-500/25 transition-all">
              <span>{language === 'id' ? 'Buka Repositori GitHub' : 'Open GitHub Repositories'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </a>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-7 v2-glass-card p-8 sm:p-10 rounded-3xl relative overflow-hidden">
          <h3 className="text-xl sm:text-2xl font-bold text-white v2-font-display mb-2">
            {language === 'id' ? 'Kirimkan Pesan Terenkripsi' : 'Send Encrypted Dispatch'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed">
            {language === 'id'
              ? 'Formulir ini dikirim langsung ke kotak masuk pengembang dengan perlindungan honeypot anti-spam.'
              : 'Directly forwarded to the developer inbox with honeypot anti-spam protection.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot hidden input */}
            <input
              type="text"
              name="_honeypot"
              value={formState._honeypot}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300" htmlFor="v2-name">
                  {t('contact.nameLabel')} <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="v2-name"
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder={language === 'id' ? 'Nama lengkap Anda' : 'Your full name'}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-300" htmlFor="v2-email">
                  {t('contact.emailLabel')} <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="v2-email"
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300" htmlFor="v2-message">
                {t('contact.msgLabel')} <span className="text-cyan-400">*</span>
              </label>
              <textarea
                id="v2-message"
                name="message"
                rows={5}
                value={formState.message}
                onChange={handleChange}
                placeholder={language === 'id' ? 'Tuliskan kebutuhan proyek atau diskusi teknis...' : 'Write your project scope or technical inquiry...'}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none"
              />
            </div>

            {/* Status Feedback */}
            <AnimatePresence>
              {status.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-2xl text-xs sm:text-sm border flex items-start gap-3 ${
                    status.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p>{status.message}</p>
                    {status.waUrl && (
                      <a
                        href={status.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Kirim via WhatsApp Sekarang</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('contact.sendBtn')}</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
