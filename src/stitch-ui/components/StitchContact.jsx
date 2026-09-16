import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Mail, MessageSquare, Check, ArrowUpRight } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { telemetry } from '../../lib/telemetry';

export default function StitchContact() {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('raflyfirmansyah02@gmail.com');
    setCopied(true);
    telemetry.logEvent('email_copy', 'stitch_contact', 'Salin Alamat Email dari Kontak');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="rounded-2xl stitch-glass p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/[0.2] shadow-2xl" id="contact">
      <div className="flex flex-col gap-3 text-center md:text-left max-w-xl">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-medium">
          {language === 'id' ? 'Komunikasi Langsung' : 'Direct Inquiries'}
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight">
          {language === 'id' ? 'Mari mendiskusikan solusi teknis.' : "Let's discuss technical problems."}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {language === 'id'
            ? 'Baik Anda sedang mengeksplorasi riset kecerdasan buatan, pipeline embedding kustom, arsitektur jaringan MikroTik, maupun rekayasa fullstack produksi, silakan terhubung secara langsung.'
            : 'Whether you are exploring applied machine learning research, custom embedding pipelines, MikroTik network architecture, or production fullstack engineering, reach out directly.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
        {/* Copy Email Button */}
        <button 
          onClick={handleCopyEmail}
          className="w-full sm:w-auto px-5 py-3 rounded-full stitch-btn-primary font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Mail className="w-4 h-4" />}
          <span>{copied ? (language === 'id' ? 'Email Berhasil Disalin!' : 'Email Copied!') : 'raflyfirmansyah02@gmail.com'}</span>
        </button>

        {/* External Glass Links */}
        <div className="flex items-center gap-2">
          <a 
            href="https://github.com/Raflyf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => telemetry.logEvent('link_click', 'stitch_github_contact', 'Buka Profil GitHub Kontak')}
            className="p-3 rounded-full stitch-btn-glass text-slate-200 hover:text-white transition-all"
            title="GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a 
            href="https://wa.me/628991333323"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => telemetry.logEvent('link_click', 'stitch_whatsapp_contact', 'Buka WhatsApp Kontak')}
            className="p-3 rounded-full stitch-btn-glass text-slate-200 hover:text-white transition-all"
            title="WhatsApp"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </a>
        </div>
      </div>
    </section>
  );
}
