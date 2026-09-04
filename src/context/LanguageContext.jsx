import React, { createContext, useContext, useState, useEffect } from 'react';
import { telemetry } from '../lib/telemetry';

export const DICTIONARY = {
  id: {
    nav: {
      about: 'Tentang',
      skills: 'Keahlian',
      projects: 'Proyek',
      certificates: 'Sertifikat',
      timeline: 'Riwayat',
      lab: 'Lab AI',
      contact: 'Kontak',
      dashboard: 'Dashboard',
      dashboardFull: 'Dashboard Observabilitas',
      themeToggle: 'Ubah Mode Tema',
      lightMode: 'Mode Terang',
      darkMode: 'Mode Gelap',
      backToTop: 'Kembali ke Atas',
      openTerminal: 'Buka Terminal AI',
      onlineStatus: 'Online',
      returnTopTitle: 'Kembali ke Paling Atas',
      switchLanguage: 'Ganti Bahasa',
    },
    hero: {
      badge: 'Portofolio Pribadi & Developer Lab',
      tagline: 'Fokus mengembangkan aplikasi web modern dan sistem kecerdasan buatan yang praktis, aman, serta menghormati privasi pengguna.',
      exploreBtn: 'Jelajahi Karya',
      terminalBtn: 'Uji Terminal AI Lab',
      terminalHeader: 'rafly@node-ubsi-s1: ~/research-deck',
      pauseAuto: 'Jeda putar otomatis',
      resumeAuto: 'Lanjutkan putar otomatis',
      prevProject: 'Proyek Sebelumnya',
      nextProject: 'Proyek Berikutnya',
      specLabel: 'Spesifikasi',
    },
    about: {
      badge: 'Profil & Visi',
      title: 'Dedikasi pada Rekayasa Perangkat Lunak & Riset Terbuka',
      subtitle: 'Membangun sistem cerdas dan aplikasi web dengan kode yang bersih, terstruktur, dan mengutamakan privasi data.',
      bioP1: 'Saya adalah seorang pengembang perangkat lunak dan mahasiswa Program Sarjana (S1) Informatika di Universitas Bina Sarana Informatika (UBSI) yang mendalami bidang Kecerdasan Buatan (NLP, Machine Learning, Computer Vision) serta Arsitektur Jaringan Komputer & Web Modern.',
      bioP2: 'Melalui proyek riset seperti OpenPlagiarismChecker, saya mengembangkan alternatif mesin pemeriksa dokumen akademik yang menggabungkan pencocokan eksak N-Gram Shingling dan embedding semantik Sentence Transformers tanpa kompromi privasi data. Di bidang klasifikasi, saya merancang evaluasi model Complement Naive Bayes vs XGBoost serta metode Domain Adaptation untuk mengatasi Concept Drift pada email spam modern.',
      pillarAiTitle: 'AI & NLP Research',
      pillarAiDesc: 'Pengolahan bahasa alami, deteksi parafrasa semantik, embedding transformer, dan komparasi algoritma ML.',
      pillarNetTitle: 'Network & Systems',
      pillarNetDesc: 'Konfigurasi MikroTik RouterOS v7 (MTCNA), routing statis/dinamis, firewall filtering, dan manajemen bandwidth.',
      pillarVisionTitle: 'Computer Vision',
      pillarVisionDesc: 'Deteksi gesture tangan dan landmark wajah via MediaPipe Tasks Vision & OpenCV di peramban secara real-time.',
      pillarFullstackTitle: 'Full-Stack & Security',
      pillarFullstackDesc: 'Pengembangan server Flask/PHP, interaksi real-time WebSockets, proteksi OWASP, dan frontend WCAG 2.2 AA.',
    },
    skills: {
      badge: 'Matriks Keahlian',
      title: 'Teknologi & Lingkup Rekayasa',
      subtitle: 'Arsitektur piranti lunak, kerangka kerja AI/ML, dan pustaka yang rutin digunakan dalam implementasi nyata.',
      catMl: 'Machine Learning & NLP Engineering',
      catNet: 'Network & Infrastructure',
      catFullstack: 'Backend & Full-Stack Systems',
      catVision: 'Vision, Interactive & Realtime Tools',
    },
    projects: {
      badge: 'Karya Terpilih',
      title: 'Portofolio Riset & Proyek GitHub',
      subtitle: 'Implementasi terbuka dengan penekanan pada akurasi komputasi, benchmark empiris, dan kejelasan arsitektur.',
      tabAll: 'Semua Proyek',
      tabAi: 'AI & Machine Learning',
      tabTools: 'Vision & Tools',
      tabWeb: 'Web Systems',
      viewRepo: 'Kunjungi Repositori',
      githubRepo: 'GitHub Repository',
      liveDemo: 'Live Demo',
      standaloneApp: 'Standalone App',
      indexedDbs: 'Basis Data Riset Terindeks:',
      stars: 'Stars',
    },
    certificates: {
      badge: 'Validasi Kredensial',
      title: 'Sertifikasi Resmi & Penghargaan',
      subtitle: 'Lisensi profesional dan transkrip akademik yang divalidasi oleh lembaga tersertifikasi (BNSP, MikroTik, Cisco, dll).',
      tabAll: 'Semua Sertifikat',
      tabAi: 'AI & Python',
      tabSecurity: 'Jaringan & Keamanan',
      tabWeb: 'Web & BNSP',
      tabCloud: 'Cloud Computing',
      viewPdf: 'Lihat Dokumen PDF',
      previewTitle: 'Pratinjau sertifikat',
      close: 'Tutup Pratinjau',
      prevPage: 'Halaman Sebelumnya',
      nextPage: 'Halaman Berikutnya',
      page: 'Halaman',
      of: 'dari',
      credentialId: 'No. Kredensial',
      verify: 'Verifikasi Resmi',
      skillsTitle: 'Kompetensi Teruji',
    },
    timeline: {
      badge: 'Rekam Jejak',
      title: 'Pengalaman Akademik & Profesional',
      subtitle: 'Perjalanan pengembangan karir, mulai dari edukasi formal, sertifikasi intensif, hingga simulasi kerja praktikal.',
    },
    lab: {
      badge: 'CLI & AI Assistant',
      title: 'Terminal Developer Lab & AI',
      subtitle: 'Eksplorasi profil, riset AI/ML, dan kompetensi melalui konsol perintah atau tanyakan langsung dengan bahasa alami bebas.',
      welcome: 'Selamat datang. Silakan ketik perintah atau pertanyaan Anda terkait portofolio.',
      inputPlaceholder: 'Ketik perintah atau tanyakan sesuatu...',
    },
    contact: {
      badge: 'Terhubung',
      title: 'Mari Memulai Kolaborasi Baru',
      subtitle: 'Terbuka untuk kolaborasi riset kecerdasan buatan, rekayasa perangkat lunak, maupun peluang profesional.',
      emailDirect: 'Alamat Email Langsung',
      copyEmail: 'Salin Alamat Email',
      copied: 'Tersalin',
      whatsappDirect: 'WhatsApp Messenger',
      openWhatsapp: 'Mulai Obrolan WhatsApp',
      formName: 'Nama Lengkap',
      formNamePlaceholder: 'Nama Anda',
      formEmail: 'Alamat Email',
      formEmailPlaceholder: 'nama@domain.com',
      formMessage: 'Pesan atau Pertanyaan',
      formMessagePlaceholder: 'Tuliskan detail kolaborasi, proyek, atau pertanyaan Anda...',
      sendBtn: 'Kirim Pesan Sekarang',
      sending: 'Mengirimkan Pesan...',
      successMsg: 'Pesan berhasil terkirim. Terima kasih telah menghubungi saya, saya akan segera merespons.',
      errorRequired: 'Harap lengkapi semua kolom nama, email, dan pesan dengan benar.',
      errorEmail: 'Format alamat email tidak valid. Harap periksa kembali.',
      errorRateLimit: 'Mohon menunggu beberapa detik sebelum mengirimkan pesan kembali demi mencegah spam.',
      securityBadge: 'Dilindungi Honeypot Anti-Spam & Enkripsi SSL',
    },
    footer: {
      available: 'Tersedia untuk kolaborasi',
      rights: 'Seluruh hak cipta dilindungi.',
    },
    storyline: {
      hero: 'Overview',
      about: 'Profil',
      skills: 'Keahlian',
      projects: 'Karya',
      certificates: 'Sertifikat',
      timeline: 'Riwayat',
      lab: 'AI Lab',
      contact: 'Kontak',
      scrollTo: 'Scroll ke bagian',
    },
    dashboard: {
      auth: {
        restricted: 'Restricted Security Zone',
        gatewayTitle: 'Observability Gateway',
        gatewayDesc: 'Masukkan Master PIN keamanan untuk membuka akses metrik telemetri Supabase Cloud.',
        pinPlaceholder: '••••••',
        openPanel: 'Buka Panel Observabilitas',
        forgotPin: 'Lupa Master PIN? Pulihkan via Email OTP',
        otpDesc: 'Kirim kode 6-digit OTP pemulihan ke email administrator terdaftar:',
        sendOtp: 'Kirim OTP Pemulihan',
        sendingOtp: 'Mengirim OTP...',
        otpPlaceholder: 'Kode OTP 6-Digit',
        newPinPlaceholder: 'Master PIN Baru (6+ Angka)',
        resetPin: 'Reset PIN & Simpan',
        verifying: 'Memverifikasi...',
        backToLogin: '← Kembali ke Layar Masuk',
        lockout: 'Menunggu {sec} detik sebelum dapat mencoba lagi...',
        dbSecurity: 'Supabase Cloud REST API & Web Crypto SHA-256',
      },
      header: {
        title: 'Admin Observability',
        live: 'Supabase Live',
        cached: 'Local Cache',
        testPing: 'Uji Ping',
        testPingTitle: 'Kirim event tes langsung ke Supabase',
        changePin: 'Ubah PIN',
        changePinTitle: 'Ubah Master PIN',
        refresh: 'Segarkan',
        refreshTitle: 'Segarkan Data',
        logout: 'Keluar',
        logoutTitle: 'Keluar dari Admin',
        switchTheme: 'Ubah Mode Tema',
        switchLang: 'Ganti Bahasa',
      },
      kpi: {
        title: 'Ringkasan Metrik Kunci (KPI Telemetry)',
        views: 'Total Tayangan Halaman',
        visitors: 'Pengunjung Unik (IP Hash)',
        clicks: 'Interaksi Klik Tombol / Tautan',
        aiQueries: 'Query AI Diselesaikan',
        conversions: 'Konversi Kontak / Inquiry',
      },
      ranges: {
        today: 'Hari Ini',
        '7d': '7 Hari',
        '14d': '14 Hari',
        '30d': '30 Hari',
        all: 'Semua',
      },
      charts: {
        trafficTitle: 'Tren Trafik Kunjungan & Interaksi',
        devicesTitle: 'Rasio Perangkat Pengunjung',
        topProjectsTitle: 'Peringkat Proyek Terpopuler',
        topCertsTitle: 'Peringkat Sertifikat Dilihat',
        topReferrersTitle: 'Sumber Rujukan Pengunjung',
        eventsDistTitle: 'Distribusi Tipe Event Telemetri',
        trafficSub: 'Grafik histori page view dan click events berdasar rentang waktu',
        devicesSub: 'Komparasi distribusi akses Mobile, Desktop, dan Tablet',
        topProjectsSub: 'Proyek dengan intensitas klik dan kunjungan repo tertinggi',
        topCertsSub: 'Kredensial dengan tayangan pratinjau dan unduhan dokumen terbanyak',
        topReferrersSub: 'Asal domain lalu lintas pengunjung yang mengarah ke portofolio',
        eventsDistSub: 'Proporsi ragam interaksi telemetri yang tercatat di Supabase',
      },
      models: {
        title: 'Matriks Model AI & Monitoring Inferensi',
        subtitle: 'Status kesehatan, latensi rata-rata, dan statistik eksekusi router multi-tier.',
        searchPlaceholder: 'Cari model atau penyedia...',
        totalInferences: 'Total Inferensi',
        lastUsed: 'Terakhir Digunakan',
        never: 'Belum Ada',
        statusActive: 'Siap Pakai',
        statusReserve: 'Cadangan',
      },
      rag: {
        title: 'Penjelajah Memori RAG Jangka Panjang',
        subtitle: 'Riwayat pengetahuan kontekstual dan rekaman percakapan terindeks Supabase.',
        searchPlaceholder: 'Cari memori atau pertanyaan...',
        totalMemories: 'Total Memori Terindeks',
        roleUser: 'Pengguna',
        roleAssistant: 'Asisten AI',
        empty: 'Belum ada memori percakapan terindeks pada rentang ini.',
        page: 'Halaman',
        prev: 'Sebelumnya',
        next: 'Berikutnya',
      },
      table: {
        title: 'Aliran Aktivitas Telemetri Real-Time',
        subtitle: 'Audit trail forensik lengkap setiap interaksi pengunjung.',
        searchPlaceholder: 'Cari event, target, atau metadata...',
        exportCsv: 'Ekspor CSV',
        exportJson: 'Ekspor JSON',
        allTypes: 'Semua Tipe Event',
        colTime: 'Waktu',
        colType: 'Tipe Event',
        colTarget: 'Target / Rincian',
        colMeta: 'Metadata / Perangkat',
        colIp: 'IP & Lokasi',
        page: 'Halaman',
        prev: 'Sebelumnya',
        next: 'Berikutnya',
        empty: 'Tidak ada catatan event yang sesuai dengan filter pencarian.',
      },
      modals: {
        changePinTitle: 'Ubah Master PIN Dashboard',
        currentPin: 'Master PIN Saat Ini',
        newPin: 'Master PIN Baru (Min 6 Digit)',
        confirmPin: 'Konfirmasi Master PIN Baru',
        cancel: 'Batal',
        savePin: 'Simpan PIN Baru',
      },
      backToTop: 'Kembali ke Atas Dashboard',
    }
  },
  en: {
    nav: {
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      certificates: 'Certificates',
      timeline: 'Experience',
      lab: 'AI Lab',
      contact: 'Contact',
      dashboard: 'Dashboard',
      dashboardFull: 'Observability Dashboard',
      themeToggle: 'Toggle Theme Mode',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      backToTop: 'Back to Top',
      openTerminal: 'Open AI Terminal',
      onlineStatus: 'Online',
      returnTopTitle: 'Return to Top',
      switchLanguage: 'Switch Language',
    },
    hero: {
      badge: 'Personal Portfolio & Developer Lab',
      tagline: 'Focusing on engineering modern web applications and practical, secure, privacy-first artificial intelligence systems.',
      exploreBtn: 'Explore Works',
      terminalBtn: 'Try AI Lab Terminal',
      terminalHeader: 'rafly@node-ubsi-s1: ~/research-deck',
      pauseAuto: 'Pause auto-slide',
      resumeAuto: 'Resume auto-slide',
      prevProject: 'Previous Project',
      nextProject: 'Next Project',
      specLabel: 'Spec',
    },
    about: {
      badge: 'Profile & Vision',
      title: 'Dedication to Software Engineering & Open Research',
      subtitle: 'Building intelligent systems and web applications with clean, structured architecture and privacy-first engineering.',
      bioP1: 'I am a software developer and undergraduate student of Informatics Engineering (B.Sc) at Bina Sarana Informatika University (UBSI), specializing in Artificial Intelligence (NLP, Machine Learning, Computer Vision) as well as Computer Network Architecture & Modern Web Systems.',
      bioP2: 'Through research initiatives such as OpenPlagiarismChecker, I engineer privacy-preserving academic document similarity engines combining exact 5-word N-Gram Shingling with semantic Sentence Transformers embeddings. In machine learning classification, I designed comparative evaluations between Complement Naive Bayes and XGBoost alongside Domain Adaptation techniques to resolve Concept Drift in contemporary email datasets.',
      pillarAiTitle: 'AI & NLP Research',
      pillarAiDesc: 'Natural language processing, semantic paraphrase detection, transformer embeddings, and ML algorithm benchmarks.',
      pillarNetTitle: 'Network & Systems',
      pillarNetDesc: 'MikroTik RouterOS v7 configuration (MTCNA), static/dynamic routing, firewall filtering, and bandwidth queuing.',
      pillarVisionTitle: 'Computer Vision',
      pillarVisionDesc: 'Real-time in-browser hand gesture and facial landmark tracking via MediaPipe Tasks Vision & OpenCV.',
      pillarFullstackTitle: 'Full-Stack & Security',
      pillarFullstackDesc: 'Flask/PHP server development, real-time WebSockets, OWASP security hardening, and WCAG 2.2 AA accessible frontends.',
    },
    skills: {
      badge: 'Skill Matrix',
      title: 'Technology & Engineering Stack',
      subtitle: 'Software architectures, AI/ML frameworks, and libraries actively utilized in production implementations.',
      catMl: 'Machine Learning & NLP Engineering',
      catNet: 'Network & Infrastructure',
      catFullstack: 'Backend & Full-Stack Systems',
      catVision: 'Vision, Interactive & Realtime Tools',
    },
    projects: {
      badge: 'Featured Works',
      title: 'Research Portfolio & GitHub Projects',
      subtitle: 'Open-source implementations emphasizing computational accuracy, empirical benchmarks, and architectural clarity.',
      tabAll: 'All Projects',
      tabAi: 'AI & Machine Learning',
      tabTools: 'Vision & Tools',
      tabWeb: 'Web Systems',
      viewRepo: 'View Repository',
      githubRepo: 'GitHub Repository',
      liveDemo: 'Live Demo',
      standaloneApp: 'Standalone App',
      indexedDbs: 'Indexed Research Repositories:',
      stars: 'Stars',
    },
    certificates: {
      badge: 'Credential Verification',
      title: 'Official Certifications & Credentials',
      subtitle: 'Professional licenses and academic transcripts verified by accredited institutions (BNSP, MikroTik, Cisco, etc).',
      tabAll: 'All Certificates',
      tabAi: 'AI & Python',
      tabSecurity: 'Network & Security',
      tabWeb: 'Web & BNSP',
      tabCloud: 'Cloud Computing',
      viewPdf: 'View PDF Document',
      previewTitle: 'Certificate preview',
      close: 'Close Preview',
      prevPage: 'Previous Page',
      nextPage: 'Next Page',
      page: 'Page',
      of: 'of',
      credentialId: 'Credential ID',
      verify: 'Official Verification',
      skillsTitle: 'Verified Competencies',
    },
    timeline: {
      badge: 'Track Record',
      title: 'Academic & Professional Experience',
      subtitle: 'Career development journey, spanning formal education, accredited certifications, and practical workplace simulations.',
    },
    lab: {
      badge: 'CLI & AI Assistant',
      title: 'Terminal Developer Lab & AI',
      subtitle: 'Explore profile, AI/ML research, and core competencies via interactive CLI commands or free-form natural queries.',
      welcome: 'Welcome. Please enter a command or query regarding the portfolio and research.',
      inputPlaceholder: 'Type a command or ask a question...',
    },
    contact: {
      badge: 'Get In Touch',
      title: 'Initiate Collaboration or Inquiry',
      subtitle: 'Open for AI/ML research collaborations, software engineering initiatives, and professional opportunities.',
      emailDirect: 'Direct Email Address',
      copyEmail: 'Copy Email Address',
      copied: 'Copied',
      whatsappDirect: 'WhatsApp Messenger',
      openWhatsapp: 'Start WhatsApp Chat',
      formName: 'Full Name',
      formNamePlaceholder: 'Your Name',
      formEmail: 'Email Address',
      formEmailPlaceholder: 'name@domain.com',
      formMessage: 'Message or Inquiry',
      formMessagePlaceholder: 'Describe your project, collaboration details, or inquiry...',
      sendBtn: 'Send Message Now',
      sending: 'Sending Message...',
      successMsg: 'Message sent successfully. Thank you for reaching out, I will reply shortly.',
      errorRequired: 'Please fill in all required fields (name, email, and message).',
      errorEmail: 'Invalid email address format. Please verify and try again.',
      errorRateLimit: 'Please wait a few seconds before sending another message to prevent spam.',
      securityBadge: 'Protected by Anti-Spam Honeypot & SSL Encryption',
    },
    footer: {
      available: 'Available for collaboration',
      rights: 'All rights reserved.',
    },
    storyline: {
      hero: 'Overview',
      about: 'Profile',
      skills: 'Skills',
      projects: 'Projects',
      certificates: 'Certificates',
      timeline: 'Experience',
      lab: 'AI Lab',
      contact: 'Contact',
      scrollTo: 'Scroll to',
    },
    dashboard: {
      auth: {
        restricted: 'Restricted Security Zone',
        gatewayTitle: 'Observability Gateway',
        gatewayDesc: 'Enter Master Security PIN to access Supabase Cloud telemetry and observability metrics.',
        pinPlaceholder: '••••••',
        openPanel: 'Open Observability Panel',
        forgotPin: 'Forgot Master PIN? Recover via Email OTP',
        otpDesc: 'Send a 6-digit recovery OTP to registered administrator email:',
        sendOtp: 'Send Recovery OTP',
        sendingOtp: 'Sending OTP...',
        otpPlaceholder: '6-Digit OTP Code',
        newPinPlaceholder: 'New Master PIN (6+ Digits)',
        resetPin: 'Reset PIN & Save',
        verifying: 'Verifying...',
        backToLogin: '← Back to Login Screen',
        lockout: 'Waiting {sec} seconds before trying again...',
        dbSecurity: 'Supabase Cloud REST API & Web Crypto SHA-256',
      },
      header: {
        title: 'Admin Observability',
        live: 'Supabase Live',
        cached: 'Local Cache',
        testPing: 'Ping Test',
        testPingTitle: 'Send live test event to Supabase',
        changePin: 'Change PIN',
        changePinTitle: 'Change Master PIN',
        refresh: 'Refresh',
        refreshTitle: 'Refresh Data',
        logout: 'Logout',
        logoutTitle: 'Logout from Admin',
        switchTheme: 'Toggle Theme Mode',
        switchLang: 'Switch Language',
      },
      kpi: {
        title: 'Key Metrics Summary (Telemetry KPIs)',
        views: 'Total Page Views',
        visitors: 'Unique Visitors (IP Hash)',
        clicks: 'Button & Link Clicks',
        aiQueries: 'AI Queries Resolved',
        conversions: 'Contact Inquiries',
      },
      ranges: {
        today: 'Today',
        '7d': '7 Days',
        '14d': '14 Days',
        '30d': '30 Days',
        all: 'All Time',
      },
      charts: {
        trafficTitle: 'Traffic Velocity & Interaction Trends',
        devicesTitle: 'Visitor Device Distribution',
        topProjectsTitle: 'Most Popular Projects',
        topCertsTitle: 'Top Viewed Certificates',
        topReferrersTitle: 'Traffic Referrers',
        eventsDistTitle: 'Telemetry Event Distribution',
        trafficSub: 'Historical view and click activity trajectory over selected timeframe',
        devicesSub: 'Access distribution ratio across Mobile, Desktop, and Tablet clients',
        topProjectsSub: 'Projects ranked by repository clicks and exploration volume',
        topCertsSub: 'Credentials ranked by modal previews and PDF document access',
        topReferrersSub: 'Inbound referral domains funneling visitors to portfolio',
        eventsDistSub: 'Distribution breakdown of discrete telemetry interactions logged',
      },
      models: {
        title: 'AI Model Matrix & Inference Monitoring',
        subtitle: 'Health status, average latency, and multi-tier router execution statistics.',
        searchPlaceholder: 'Search model or provider...',
        totalInferences: 'Total Inferences',
        lastUsed: 'Last Used',
        never: 'Never',
        statusActive: 'Active',
        statusReserve: 'Standby',
      },
      rag: {
        title: 'Long-Term Continuous RAG Memory Explorer',
        subtitle: 'Contextual knowledge history and conversation sessions indexed in Supabase.',
        searchPlaceholder: 'Search memory or query...',
        totalMemories: 'Total Indexed Memories',
        roleUser: 'User',
        roleAssistant: 'AI Assistant',
        empty: 'No indexed conversation memories found in this timeframe.',
        page: 'Page',
        prev: 'Previous',
        next: 'Next',
      },
      table: {
        title: 'Real-Time Telemetry Activity Stream',
        subtitle: 'Complete forensic audit trail of every visitor interaction.',
        searchPlaceholder: 'Search event, target, or metadata...',
        exportCsv: 'Export CSV',
        exportJson: 'Export JSON',
        allTypes: 'All Event Types',
        colTime: 'Timestamp',
        colType: 'Event Type',
        colTarget: 'Target / Details',
        colMeta: 'Metadata / Device',
        colIp: 'IP & Location',
        page: 'Page',
        prev: 'Previous',
        next: 'Next',
        empty: 'No activity records match the selected query and filters.',
      },
      modals: {
        changePinTitle: 'Change Dashboard Master PIN',
        currentPin: 'Current Master PIN',
        newPin: 'New Master PIN (Min 6 Digits)',
        confirmPin: 'Confirm New Master PIN',
        cancel: 'Cancel',
        savePin: 'Save New PIN',
      },
      backToTop: 'Back to Top',
    }
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'id';
    const saved = localStorage.getItem('portfolio_lang');
    return saved === 'en' || saved === 'id' ? saved : 'id';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    localStorage.setItem('portfolio_lang', language);
  }, [language]);

  const setLanguage = (lang) => {
    if (lang !== 'id' && lang !== 'en') return;
    setLanguageState(lang);
    telemetry.logEvent('language_toggle', lang, `Ganti Bahasa ke ${lang.toUpperCase()}`);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  };

  const t = (path, params = {}) => {
    const keys = path.split('.');
    let cur = DICTIONARY[language] || DICTIONARY.id;
    for (const key of keys) {
      if (cur && typeof cur === 'object' && key in cur) {
        cur = cur[key];
      } else {
        // Fallback to Indonesian if missing in current language
        let fallback = DICTIONARY.id;
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            return path;
          }
        }
        cur = fallback;
        break;
      }
    }

    if (typeof cur === 'string') {
      return cur.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
    }
    return cur;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
