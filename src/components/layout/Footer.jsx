import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { DEVELOPER_PROFILE } from '../../data';
import { telemetry } from '../../lib/telemetry';

const socialLinks = [
  {
    icon: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
    label: 'GitHub',
    href: 'https://github.com/Raflyf',
    color: 'hover:text-white hover:border-white/40',
  },
  {
    icon: Mail,
    label: 'Email',
    href: `mailto:${DEVELOPER_PROFILE.email}`,
    color: 'hover:text-cyan-400 hover:border-cyan-400/40',
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full mt-10 liquid-glass-nav">
      {/* Glow divider top */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand Block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center md:items-start space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500/30 to-indigo-500/30 border border-cyan-400/50 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <span className="text-xs font-bold text-white tracking-tight">RF</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight leading-snug">
                  Rafly Firmansyah
                </p>
                <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  Tersedia untuk kolaborasi
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            {socialLinks.map(({ icon: Icon, label, href, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                onClick={() => telemetry.logEvent('link_click', label.toLowerCase(), `Klik Tautan Footer: ${label}`)}
                className={`w-9 h-9 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-zinc-400 transition-all duration-200 ${color} hover:bg-white/10 hover:scale-105`}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </motion.div>

        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 pt-6 border-t border-white/5 flex justify-center"
        >
          <p className="text-xs text-zinc-500 font-mono text-center">
            &copy; {year} Rafly Firmansyah. Seluruh hak cipta dilindungi.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
