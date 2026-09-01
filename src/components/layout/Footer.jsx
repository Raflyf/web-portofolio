import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, ExternalLink, Heart, Zap } from 'lucide-react';

const socialLinks = [
  {
    icon: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
    label: 'GitHub',
    href: 'https://github.com/Raflyf',
    color: 'hover:text-white hover:border-white/40',
  },
  {
    icon: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/raflyf',
    color: 'hover:text-blue-400 hover:border-blue-400/40',
  },
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:raflyfirmansyah@gmail.com',
    color: 'hover:text-cyan-400 hover:border-cyan-400/40',
  },
];

const quickLinks = [
  { label: 'Tentang', href: '/#about' },
  { label: 'Keahlian', href: '/#skills' },
  { label: 'Proyek', href: '/#projects' },
  { label: 'Sertifikat', href: '/#certificates' },
  { label: 'Riwayat', href: '/#timeline' },
  { label: 'Lab AI', href: '/#lab' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full mt-0 border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl">
      {/* Glow divider top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Brand Block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500/30 to-indigo-500/30 border border-cyan-400/50 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <span className="text-xs font-bold text-white tracking-tight">RF</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight leading-snug">
                  Rafly Firmansyah
                </p>
                <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  Tersedia untuk peluang baru
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-zinc-400 transition-all duration-200 ${color} hover:bg-white/10 hover:scale-105`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Nav */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Navigasi</p>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />
                  {label}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Actions & Dashboard CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Akses Khusus</p>

            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all group"
            >
              <Shield className="w-4 h-4" />
              <span>Observability Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-500/70" />
            &copy; {year} Rafly Firmansyah. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-xs text-zinc-600 flex items-center gap-1.5">
            Dibuat dengan
            <Heart className="w-3 h-3 text-rose-500/80 fill-rose-500/60" />
            menggunakan React &amp; Framer Motion
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
