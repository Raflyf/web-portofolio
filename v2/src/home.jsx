import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Terminal, ChevronLeft, ChevronRight, Play, Pause, Clock,
  Brain, Network, Eye, ShieldCheck, Cpu, Server, Star, ExternalLink,
  Mail, Copy, Check, Send, AlertCircle, ArrowUpRight, FileText, Award,
  Briefcase, GraduationCap, Calendar,
} from 'lucide-react';
import { useLanguage } from '../../src/context/LanguageContext.jsx';
import {
  getDeveloperProfile, getProjectsData, getCertificatesData, getTimelineData,
  DEVELOPER_PROFILE,
} from '../../src/data.js';
import { telemetry } from '../../src/lib/telemetry.js';
import { Reveal, RevealGroup } from './reveal.jsx';

const TerminalLab = React.lazy(() => import('../../src/components/terminal/TerminalAI.jsx'));

function SectionHead({ badge, title, subtitle }) {
  return (
    <Reveal className="text-center space-y-4 mb-12">
      <span className="chip eyebrow">{badge}</span>
      <h2 className="h2">{title}</h2>
      <p className="sub text-base sm:text-lg">{subtitle}</p>
    </Reveal>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const { language, t } = useLanguage();
  const projects = getProjectsData(language);
  const deck = projects.slice(0, 5);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      try {
        const s = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).format(new Date()).replace(/\./g, ':');
        setClock(`${language === 'id' ? 'WIB (UTC+7)' : 'UTC+7 (WIB)'} • ${s}`);
      } catch { /* clock is decorative */ }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [language]);

  useEffect(() => {
    if (paused || deck.length < 2) return;
    const id = setInterval(() => setSlide((p) => (p + 1) % deck.length), 5000);
    return () => clearInterval(id);
  }, [paused, deck.length]);

  const active = deck[slide] || deck[0];
  const go = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="hero" className="relative w-full min-h-[100dvh] flex items-center overflow-hidden pt-24 pb-20">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-7">
            <Reveal className="flex flex-wrap items-center gap-2.5">
              <span className="chip">
                <span className="dot-live" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wider">{t('hero.badge')}</span>
              </span>
              <span className="chip font-mono tabular-nums" aria-live="off">
                <Clock className="w-3.5 h-3.5 accent" aria-hidden="true" />
                <span className="text-[11px] font-semibold accent">{clock}</span>
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="font-bold leading-[1.02]" style={{ fontSize: 'clamp(2.75rem, 7vw, 5.25rem)', letterSpacing: '-0.03em', textWrap: 'balance' }}>
                Rafly<br />Firmansyah
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="max-w-xl text-base sm:text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>{t('hero.tagline')}</p>
            </Reveal>
            <Reveal delay={210} className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <button type="button" onClick={() => go('#projects')} className="btn-primary">
                <span>{t('hero.exploreBtn')}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => go('#lab')} className="btn-ghost">
                <Terminal className="w-4 h-4 accent" aria-hidden="true" />
                <span>{t('hero.terminalBtn')}</span>
              </button>
            </Reveal>
          </div>

          <Reveal delay={160} className="lg:col-span-5">
            <div className="glass-strong p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f43f5e' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--ok)' }} />
                  </div>
                  <div className="text-[11px] font-mono font-semibold truncate" style={{ color: 'var(--ok)' }}>{t('hero.terminalHeader')}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono chip">0{slide + 1} / 0{deck.length}</span>
                  <button type="button" onClick={() => setPaused((p) => !p)} className="inset w-7 h-7 inline-flex items-center justify-center !rounded-lg" title={paused ? t('hero.resumeAuto') : t('hero.pauseAuto')} aria-label={paused ? t('hero.resumeAuto') : t('hero.pauseAuto')} aria-pressed={paused}>
                    {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" onClick={() => setSlide((p) => (p === 0 ? deck.length - 1 : p - 1))} className="inset w-7 h-7 inline-flex items-center justify-center !rounded-lg" aria-label={t('hero.prevProject')}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setSlide((p) => (p + 1) % deck.length)} className="inset w-7 h-7 inline-flex items-center justify-center !rounded-lg" aria-label={t('hero.nextProject')}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {active && (
                <div key={active.id} className="space-y-3 min-h-40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip text-[11px] accent">{active.categoryLabel}</span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--faint)' }}>{(active.techStack || []).slice(0, 2).join(' & ')}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    <button type="button" onClick={() => go('#projects')} className="hover:underline underline-offset-4">{active.title}</button>
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{active.description}</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ABOUT ---------------- */
function About() {
  const { t } = useLanguage();
  const profile = getDeveloperProfile();
  const pillars = [
    { icon: Brain, title: 'AI & NLP Research', desc: t('about.pillarAiDesc') },
    { icon: Network, title: 'Network & Systems', desc: t('about.pillarNetDesc') },
    { icon: Eye, title: 'Computer Vision', desc: t('about.pillarVisionDesc') },
    { icon: ShieldCheck, title: 'Full-Stack & Security', desc: t('about.pillarFullstackDesc') },
  ];
  return (
    <section id="about" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <SectionHead badge={t('about.badge')} title={t('about.title')} subtitle={t('about.subtitle')} />
      <Reveal className="glass p-7 sm:p-9 space-y-4 max-w-4xl mx-auto">
        <p className="leading-relaxed" style={{ color: 'var(--muted)' }}>{t('about.bioP1')}</p>
        <p className="leading-relaxed" style={{ color: 'var(--muted)' }}>{t('about.bioP2')}</p>
        <p className="text-sm font-mono accent">{profile.degree} — {profile.institution}</p>
      </Reveal>
      <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 max-w-5xl mx-auto">
        {pillars.map((p) => (
          <div key={p.title} className="reveal glass card-lift p-6 flex gap-4">
            <span className="inset w-11 h-11 shrink-0 inline-flex items-center justify-center !rounded-xl">
              <p.icon className="w-5 h-5 accent" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-bold">{p.title}</span>
              <span className="block text-sm mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>{p.desc}</span>
            </span>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ---------------- SKILLS (satu marquee) ---------------- */
const MARQUEE_SKILLS = ['PyTorch Core', 'Prompt Engineering', 'Sentence-Transformers', 'IndoBERT & RoBERTa', 'NLP Cosine Metrics', 'Scikit-Learn ML', 'MediaPipe Tasks Vision', 'OpenCV Python', 'XGBoost & Naive Bayes', 'MikroTik RouterOS v7', 'Flask-SocketIO', 'Supabase Postgres RAG', 'RESTful APIs Architecture', 'Linux & Git Workflow'];
const SKILL_CATS = [
  { icon: Cpu, key: 'catMl', items: ['Python 3', 'PyTorch', 'Prompt Engineering', 'Sentence-Transformers', 'Scikit-Learn', 'XGBoost', 'N-Gram Shingling', 'Pandas', 'NumPy'], span: 'md:col-span-7' },
  { icon: Network, key: 'catNet', items: ['MikroTik RouterOS', 'MTCNA Certified', 'Static & Dynamic Routing', 'Firewall Filter Rules', 'Simple Queues (QoS)', 'VLAN & Tunnels'], span: 'md:col-span-5' },
  { icon: Server, key: 'catFullstack', items: ['React.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Supabase DB', 'Node.js API', 'Flask API'], span: 'md:col-span-5' },
  { icon: Eye, key: 'catVision', items: ['MediaPipe Tasks Vision', 'OpenCV Python', 'Flask-SocketIO', 'WebSockets', 'PyAutoGUI', 'DeviceOrientation API'], span: 'md:col-span-7' },
];

function Skills() {
  const { t } = useLanguage();
  return (
    <section id="skills" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <SectionHead badge={t('skills.badge')} title={t('skills.title')} subtitle={t('skills.subtitle')} />
      <Reveal className="marquee-mask overflow-hidden mb-10" aria-label={t('skills.title')}>
        <div className="marquee-track gap-3 py-1">
          {[...MARQUEE_SKILLS, ...MARQUEE_SKILLS].map((s, i) => (
            <span key={i} className="chip whitespace-nowrap" aria-hidden={i >= MARQUEE_SKILLS.length}>
              <span className="dot-live" style={{ width: 6, height: 6 }} />
              <span className="text-xs sm:text-sm font-medium">{s}</span>
            </span>
          ))}
        </div>
      </Reveal>
      <RevealGroup className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {SKILL_CATS.map((c) => (
          <div key={c.key} className={`reveal glass card-lift p-7 ${c.span}`}>
            <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
              <span className="inset w-10 h-10 inline-flex items-center justify-center !rounded-xl">
                <c.icon className="w-5 h-5 accent" aria-hidden="true" />
              </span>
              {t(`skills.${c.key}`)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {c.items.map((tech) => (
                <span key={tech} className="chip !rounded-[10px] text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>{tech}</span>
              ))}
            </div>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ---------------- PROJECTS ---------------- */
const GithubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

function useGithubStars() {
  const [map, setMap] = useState({});
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const cached = localStorage.getItem('portfolio_github_stars_v2');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (data && Date.now() - timestamp < 3 * 60 * 1000) {
            if (live) setMap(data);
            return;
          }
        }
      } catch { /* ignore corrupt cache */ }
      try {
        const res = await fetch('/api/github-stars');
        if (res.ok) {
          const json = await res.json();
          if (json?.stars && live) {
            setMap(json.stars);
            try { localStorage.setItem('portfolio_github_stars_v2', JSON.stringify({ data: json.stars, timestamp: Date.now() })); } catch { /* storage full */ }
            return;
          }
        }
      } catch { /* fall through to public API */ }
      try {
        const res = await fetch('https://api.github.com/users/Raflyf/repos?per_page=100', { headers: { Accept: 'application/vnd.github.v3+json' } });
        if (!res.ok) return;
        const repos = await res.json();
        if (Array.isArray(repos) && live) {
          const m = {};
          repos.forEach((r) => { if (r?.name) m[r.name.toLowerCase()] = r.stargazers_count || 0; });
          setMap(m);
        }
      } catch { /* offline: keep defaults */ }
    })();
    return () => { live = false; };
  }, []);
  return (project) => {
    if (!project?.githubUrl) return Number(project?.stars) || 0;
    const repo = project.githubUrl.replace(/\.git$/i, '').split('/').pop()?.toLowerCase();
    return (repo && typeof map[repo] === 'number') ? map[repo] : (Number(project.stars) || 0);
  };
}

function Projects() {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const projects = getProjectsData(language);
  const starsOf = useGithubStars();
  const tabs = [
    { id: 'all', label: t('projects.tabAll') },
    { id: 'ai-ml', label: t('projects.tabAi') },
    { id: 'tools', label: t('projects.tabTools') },
    { id: 'web', label: t('projects.tabWeb') },
  ];
  const filtered = projects.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'tools') return p.category === 'tools' || p.category === 'cv-tools';
    return p.category === filter;
  });
  const featured = filter === 'all' ? projects.find((p) => p.id === 'open-plagiarism-checker') : null;
  const list = featured ? filtered.filter((p) => p.id !== featured.id) : filtered;

  return (
    <section id="projects" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <SectionHead badge={t('projects.badge')} title={t('projects.title')} subtitle={t('projects.subtitle')} />
      <Reveal className="flex flex-wrap justify-center gap-2 mb-10" role="tablist" aria-label={t('projects.title')}>
        {tabs.map((tab) => (
          <button
            key={tab.id} type="button" role="tab" aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`chip !px-5 !py-2 text-xs sm:text-sm font-medium ${filter === tab.id ? 'accent' : ''}`}
            style={filter === tab.id ? { borderColor: 'var(--accent)' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </Reveal>

      {featured && (
        <Reveal className="glass-strong p-8 sm:p-10 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="chip text-xs font-semibold uppercase tracking-wider accent" style={{ borderColor: 'var(--accent)' }}>{featured.badge}</span>
                <span className="chip text-xs">{featured.categoryLabel}</span>
                <span className="chip text-xs font-semibold">
                  <Star className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{starsOf(featured)} {t('projects.stars')}</span>
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{featured.title}</h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--muted)' }}>{featured.description}</p>
              <ul className="space-y-2">
                {(featured.keyFeatures || []).slice(0, 3).map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>
                    <span className="dot-live" style={{ width: 6, height: 6 }} aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {(featured.techStack || []).map((tech) => (
                  <span key={tech} className="chip !rounded-lg text-xs" style={{ color: 'var(--muted)' }}>{tech}</span>
                ))}
              </div>
              <div className="pt-2">
                <a href={featured.githubUrl} target="_blank" rel="noopener noreferrer" onClick={() => telemetry.logEvent('link_click', 'github_openplagiarismchecker', 'Kunjungi Repositori: OpenPlagiarismChecker')} className="btn-ghost !py-2.5 !px-5 text-sm">
                  <GithubIcon />
                  {t('projects.viewRepo')}
                </a>
              </div>
            </div>
            <div className="lg:col-span-4 inset p-5 space-y-3">
              <div className="eyebrow !text-[11px]">{t('projects.indexedDbs')}</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono" style={{ color: 'var(--muted)' }}>
                {['GARUDA', 'OneSearch', 'Neliti', 'BASE (Bielefeld)', 'OpenAlex', 'Semantic Scholar'].map((db) => (
                  <span key={db} className="chip !rounded-lg justify-center">{db}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {list.map((p) => (
          <article key={p.id} className="reveal glass card-lift p-7 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="chip text-[11px] font-semibold accent">{p.categoryLabel}</span>
                  {p.badge && <span className="chip text-[10px] hidden sm:inline-flex">{p.badge}</span>}
                </div>
                <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--faint)' }}>
                  <Star className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{starsOf(p)}</span>
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{p.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {(p.techStack || []).map((tech) => (
                  <span key={tech} className="chip !rounded-md text-[11px]" style={{ color: 'var(--muted)' }}>{tech}</span>
                ))}
              </div>
            </div>
            <div className="pt-5 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
              <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" onClick={() => telemetry.logEvent('link_click', `github_${p.id}`, `Kunjungi Repositori: ${p.title}`)} className="inline-flex items-center gap-2 text-xs font-semibold hover:underline underline-offset-4">
                <GithubIcon />
                {t('projects.githubRepo')}
              </a>
              {p.demoUrl ? (
                <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" onClick={() => telemetry.logEvent('link_click', `demo_${p.id}`, `Buka Demo: ${p.title}`)} className="inline-flex items-center gap-1 text-xs font-semibold accent hover:underline underline-offset-4">
                  {t('projects.liveDemo')}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span className="text-[11px] font-mono" style={{ color: 'var(--faint)' }}>{t('projects.standaloneApp')}</span>
              )}
            </div>
          </article>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ---------------- CERTIFICATES ---------------- */
function Certificates() {
  const { language, t } = useLanguage();
  const certs = getCertificatesData(language);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const dialogRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  const cats = React.useMemo(() => {
    const seen = new Map();
    certs.forEach((c) => { if (c.category && !seen.has(c.category)) seen.set(c.category, c.categoryLabel || c.category); });
    return [...seen.entries()];
  }, [certs]);
  const labelFor = (id) => ({
    all: t('certificates.tabAll'), 'ai-ml': t('certificates.tabAi'), ai: t('certificates.tabAi'),
    security: t('certificates.tabSecurity'), network: t('certificates.tabSecurity'),
    web: t('certificates.tabWeb'), cloud: t('certificates.tabCloud'),
  }[id]);
  const list = filter === 'all' ? certs : certs.filter((c) => c.category === filter || (filter === 'security' && c.category === 'network'));

  const open = (cert, el) => {
    triggerRef.current = el || null;
    setOpenId(cert.id);
    telemetry.logEvent('cert_view', cert.id || cert.title, `Buka Detail Kredensial: ${cert.title}`);
  };
  useEffect(() => {
    const dlg = dialogRef.current;
    if (openId && dlg && !dlg.open) dlg.showModal();
    if (!openId && dlg?.open) dlg.close();
  }, [openId]);
  const close = () => {
    setOpenId(null);
    if (triggerRef.current?.focus) triggerRef.current.focus();
    triggerRef.current = null;
  };
  const active = certs.find((c) => c.id === openId);

  return (
    <section id="certificates" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <SectionHead badge={t('certificates.badge')} title={t('certificates.title')} subtitle={t('certificates.subtitle')} />
      <Reveal className="flex flex-wrap justify-center gap-2 mb-10" role="tablist" aria-label={t('certificates.title')}>
        <button type="button" role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')} className="chip !px-5 !py-2 text-xs sm:text-sm font-medium" style={filter === 'all' ? { borderColor: 'var(--accent)' } : undefined}>{t('certificates.tabAll')}</button>
        {cats.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)} className="chip !px-5 !py-2 text-xs sm:text-sm font-medium" style={filter === id ? { borderColor: 'var(--accent)' } : undefined}>
            {labelFor(id) || label}
          </button>
        ))}
      </Reveal>
      <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((c) => (
          <article key={c.id} className="reveal glass card-lift p-6 flex flex-col gap-3">
            <span className="inset w-10 h-10 inline-flex items-center justify-center !rounded-xl">
              <Award className="w-5 h-5 accent" aria-hidden="true" />
            </span>
            <h3 className="font-bold leading-snug">{c.title}</h3>
            <p className="text-xs" style={{ color: 'var(--faint)' }}>{c.issuer}{c.date ? ` — ${c.date}` : ''}</p>
            <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="chip text-[11px]">{c.categoryLabel || c.category}</span>
              <button type="button" onClick={(e) => open(c, e.currentTarget)} className="inline-flex items-center gap-1.5 text-xs font-semibold accent hover:underline underline-offset-4">
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                {t('certificates.viewPdf')}
              </button>
            </div>
          </article>
        ))}
      </RevealGroup>

      <dialog ref={dialogRef} onClose={close} aria-labelledby="v2-cert-title" className="glass-strong p-0 w-[min(92vw,40rem)]" style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}>
        {active && (
          <div className="p-7 space-y-4">
            <p className="eyebrow !text-[11px]">{t('certificates.previewTitle')}</p>
            <h3 id="v2-cert-title" className="text-xl font-bold">{active.title}</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{active.issuer}{active.date ? ` — ${active.date}` : ''}</p>
            {active.pdfUrl && (
              <a href={active.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2.5 !px-5 text-sm">
                <FileText className="w-4 h-4" aria-hidden="true" />
                {t('certificates.viewPdf')}
              </a>
            )}
            <div>
              <button type="button" onClick={close} className="btn-primary !py-2.5 !px-5 text-sm">{t('certificates.close')}</button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

/* ---------------- TIMELINE ---------------- */
function Timeline() {
  const { language, t } = useLanguage();
  const items = getTimelineData(language);
  return (
    <section id="timeline" className="relative px-4 sm:px-6 w-full max-w-4xl mx-auto pt-24">
      <SectionHead badge={t('timeline.badge')} title={t('timeline.title')} subtitle={t('timeline.subtitle')} />
      <div className="relative pl-8 sm:pl-0">
        <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2" style={{ background: 'var(--border)' }} aria-hidden="true" />
        <div className="space-y-8">
          {items.map((item, i) => {
            const left = i % 2 === 0;
            const edu = item.type === 'education';
            return (
              <Reveal key={`${item.title}-${i}`} className={`relative sm:grid sm:grid-cols-2 sm:gap-10 ${left ? '' : ''}`}>
                <span className="absolute left-8 sm:left-1/2 top-1 -translate-x-1/2 inset w-9 h-9 !rounded-full inline-flex items-center justify-center" aria-hidden="true" style={{ background: 'var(--bg)' }}>
                  {edu ? <GraduationCap className="w-4 h-4 accent" /> : <Briefcase className="w-4 h-4 accent" />}
                </span>
                <div className={`glass card-lift p-6 ml-8 sm:ml-0 ${left ? 'sm:col-start-1 sm:text-right' : 'sm:col-start-2'}`}>
                  <p className="text-[11px] font-mono font-semibold accent">{item.period}</p>
                  <h3 className="font-bold mt-1.5">{item.title}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--faint)' }}>{item.institution}</p>
                  <p className="text-sm mt-2.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- LAB ---------------- */
function Lab() {
  const { t } = useLanguage();
  useEffect(() => { telemetry.init(); }, []);
  return (
    <section id="lab" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24">
      <SectionHead badge={t('lab.badge')} title={t('lab.title')} subtitle={t('lab.subtitle')} />
      <Reveal>
        <React.Suspense fallback={<div className="glass p-10 text-center text-sm" style={{ color: 'var(--faint)' }} role="status">…</div>}>
          <TerminalLab />
        </React.Suspense>
      </Reveal>
    </section>
  );
}

/* ---------------- CONTACT ---------------- */
function Contact() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '', _honeypot: '' });
  const [status, setStatus] = useState({ type: '', message: '', waUrl: '' });
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(DEVELOPER_PROFILE.email); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form._honeypot) return;
    const { name, email, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', message: t('contact.errorRequired'), waUrl: '' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ type: 'error', message: t('contact.errorEmail'), waUrl: '' });
      return;
    }
    try {
      const last = localStorage.getItem('portfolio_last_submit');
      if (last && Date.now() - parseInt(last, 10) < 30000) {
        const s = Math.ceil((30000 - (Date.now() - parseInt(last, 10))) / 1000);
        setStatus({ type: 'error', message: language === 'id' ? `Mohon menunggu ${s} detik sebelum mengirimkan pesan kembali demi mencegah spam.` : `Please wait ${s} seconds before sending another message to prevent spam.`, waUrl: '' });
        return;
      }
    } catch { /* storage unavailable */ }
    setBusy(true);
    setStatus({ type: '', message: '', waUrl: '' });
    const wa = (n, em, m) => `${DEVELOPER_PROFILE.whatsappUrl}?text=${encodeURIComponent(`${language === 'id' ? 'Halo Rafly, saya' : 'Hello Rafly, I am'} ${n} (${em}). ${language === 'id' ? 'Pesan:' : 'Message:'} ${m}`)}`;
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${DEVELOPER_PROFILE.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), _subject: `Pesan Portofolio Baru dari ${name.trim()} (${email.trim()})`, _template: 'table', _captcha: 'false' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || data.success === 'true' || data.success === true) {
        try { localStorage.setItem('portfolio_last_submit', Date.now().toString()); } catch { /* ignore */ }
        telemetry.logEvent('contact_submit', 'contact_form', 'Kirim Formulir Pesan Kontak');
        setStatus({ type: 'success', message: t('contact.successMsg'), waUrl: wa(name.trim(), email.trim(), message.trim()) });
        setForm({ name: '', email: '', message: '', _honeypot: '' });
      } else {
        throw new Error(data.message || 'send-failed');
      }
    } catch {
      setStatus({
        type: 'error',
        message: language === 'id' ? 'Pengiriman formulir email mengalami kendala jaringan. Anda dapat mengirimkan pesan secara instan via WhatsApp berikut.' : 'Email form submission encountered a network issue. You can send your message directly via WhatsApp below.',
        waUrl: wa(name.trim(), email.trim(), message.trim()),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto pt-24 pb-24">
      <SectionHead badge={t('contact.badge')} title={t('contact.title')} subtitle={t('contact.subtitle')} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <RevealGroup className="lg:col-span-5 space-y-4">
          <div className="reveal glass card-lift p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inset w-10 h-10 inline-flex items-center justify-center !rounded-xl">
                <Mail className="w-5 h-5 accent" aria-hidden="true" />
              </span>
              <span className="chip text-[10px] font-mono uppercase">{language === 'id' ? 'Respon Cepat' : 'Fast Response'}</span>
            </div>
            <div>
              <span className="eyebrow !text-[11px]">{t('contact.emailDirect')}</span>
              <p className="text-sm sm:text-base font-bold font-mono mt-1 break-all">{DEVELOPER_PROFILE.email}</p>
            </div>
            <button type="button" onClick={copyEmail} className="btn-ghost w-full !py-2.5 text-xs">
              {copied ? <><Check className="w-3.5 h-3.5" aria-hidden="true" /><span>{language === 'id' ? 'Tersalin ke Clipboard!' : 'Copied to Clipboard!'}</span></> : <><Copy className="w-3.5 h-3.5" aria-hidden="true" /><span>{t('contact.copyEmail')}</span></>}
            </button>
          </div>
          <a href={DEVELOPER_PROFILE.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => telemetry.logEvent('link_click', 'whatsapp', 'Klik Tautan Kontak: WhatsApp')} className="reveal glass card-lift p-5 flex items-center justify-between gap-3">
            <span>
              <span className="eyebrow !text-[11px]">WhatsApp</span>
              <span className="block font-bold font-mono mt-1">{DEVELOPER_PROFILE.whatsapp}</span>
            </span>
            <ArrowUpRight className="w-5 h-5 accent shrink-0" aria-hidden="true" />
          </a>
        </RevealGroup>

        <Reveal className="lg:col-span-7 glass p-6 sm:p-8" delay={90}>
          <form onSubmit={submit} className="space-y-4" noValidate={false}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="v2-name" className="text-xs font-semibold">{t('contact.formName')}</label>
                <input id="v2-name" name="name" autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field" placeholder={t('contact.formNamePlaceholder')} required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="v2-email" className="text-xs font-semibold">{t('contact.formEmail')}</label>
                <input id="v2-email" name="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="field" placeholder={t('contact.formEmailPlaceholder')} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="v2-msg" className="text-xs font-semibold">{t('contact.formMessage')}</label>
              <textarea id="v2-msg" name="message" rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="field" placeholder={t('contact.formMessagePlaceholder')} required />
            </div>
            <input type="text" name="_honeypot" value={form._honeypot} onChange={(e) => setForm((f) => ({ ...f, _honeypot: e.target.value }))} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {status.message && (
              <p role={status.type === 'error' ? 'alert' : 'status'} className="text-sm flex items-start gap-2" style={{ color: status.type === 'error' ? '#f87171' : 'var(--ok)' }}>
                {status.type === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
                <span>{status.message}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{busy ? t('contact.sending') : t('contact.sendBtn')}</span>
              </button>
              {status.waUrl && (
                <a href={status.waUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <span>WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 w-full nav-shell">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-bold" style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)' }} aria-hidden="true">RF</span>
          <span>
            <span className="block text-sm font-bold">Rafly Firmansyah</span>
            <span className="text-[11px] font-mono flex items-center gap-1.5" style={{ color: 'var(--faint)' }}>
              <span className="dot-live" style={{ width: 6, height: 6 }} aria-hidden="true" />
              {t('footer.available')}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <a href="https://github.com/Raflyf" target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={() => telemetry.logEvent('link_click', 'github', 'Klik Tautan Footer: GitHub')} className="inset w-9 h-9 !rounded-xl inline-flex items-center justify-center hover:border-[var(--accent)]">
            <GithubIcon />
          </a>
          <a href={`mailto:${DEVELOPER_PROFILE.email}`} aria-label="Email" onClick={() => telemetry.logEvent('link_click', 'email', 'Klik Tautan Footer: Email')} className="inset w-9 h-9 !rounded-xl inline-flex items-center justify-center hover:border-[var(--accent)]">
            <Mail className="w-4 h-4" />
          </a>
        </div>
        <p className="text-[11px] font-mono" style={{ color: 'var(--faint)' }}>© {year} Rafly Firmansyah • v2</p>
      </div>
    </footer>
  );
}

export default function Home() {
  useEffect(() => { telemetry.init(); }, []);
  return (
    <main className="w-full relative z-10">
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Certificates />
      <Timeline />
      <Lab />
      <Contact />
      <Footer />
    </main>
  );
}
