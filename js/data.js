/**
 * ============================================================================
 * RAFLY FIRMANSYAH - CENTRAL DATA STORE
 * Projects from GitHub (@Raflyf) & Extensible Certificates Registry
 * ============================================================================
 */

export const DEVELOPER_PROFILE = {
  name: "Rafly Firmansyah",
  handle: "@Raflyf",
  title: "Software Developer & AI/ML Engineer",
  location: "Indonesia",
  status: "Available for projects & AI/ML collaborations",
  bio: "Pengembang perangkat lunak dengan minat mendalam pada integrasi kecerdasan buatan (Machine Learning, NLP, dan Computer Vision) dengan arsitektur sistem web modern yang cepat, aman, dan beretika privasi.",
  github: "https://github.com/Raflyf",
  email: "contact.raflyf@gmail.com",
  linkedin: "https://linkedin.com/in/raflyf",
  repoUrl: "https://github.com/Raflyf/web-portofolio"
};

export const PROJECTS_DATA = [
  {
    id: "open-plagiarism-checker",
    title: "OpenPlagiarismChecker",
    category: "ai-ml",
    categoryLabel: "AI / NLP Research",
    badge: "Open Source Engine",
    description: "Mesin pemeriksa kesamaan teks akademik lokal mengutamakan privasi. Menggabungkan 5-word N-Gram Shingling dan Multilingual Sentence Transformers untuk deteksi kecocokan persis dan parafrasa kontekstual.",
    longDescription: "OpenPlagiarismChecker adalah mesin riset pemeriksa kesamaan dokumen lokal yang memproses file PDF, DOCX, dan TXT secara terisolasi. Sistem merujuk silang dokumen ke lebih dari 15 pangkalan data akademik terbuka (GARUDA, Indonesia OneSearch/Neliti, BASE, OpenAlex, Semantic Scholar) dengan perbandingan struktural dan semantik transparan.",
    keyFeatures: [
      "5-Word N-Gram Shingling untuk pencocokan teks persis",
      "Multilingual Sentence Transformers untuk deteksi parafrasa",
      "Ekstraksi teks otomatis dari file PDF, DOCX, dan TXT",
      "Pencarian konkuren ke 15+ basis data literatur riset publik",
      "Arsitektur terisolasi lokal demi keamanan dan privasi data dokumen"
    ],
    techStack: ["Python", "Flask", "PyTorch", "Sentence-Transformers", "N-Gram", "Web Scraping"],
    githubUrl: "https://github.com/Raflyf/OpenPlagiarismChecker",
    demoUrl: null,
    stars: 4,
    license: "MIT",
    year: "2026"
  },
  {
    id: "spam-email-classifier",
    title: "Spam-Email Detection System",
    category: "ai-ml",
    categoryLabel: "Machine Learning",
    badge: "Skripsi / ML Research",
    description: "Aplikasi web evaluasi dan klasifikasi email spam berbasis Machine Learning. Membandingkan performa Naive Bayes vs XGBoost dengan tuning proporsi kelas dataset fleksibel dan visualisasi Confusion Matrix.",
    longDescription: "Aplikasi web penelitian untuk mengklasifikasikan email spam vs ham yang dibangun dengan Flask dan antarmuka web modern. Mendukung pengujian real-time teks langsung, evaluasi batch dataset massal melalui file .csv, serta visualisasi perbandingan akurasi, F1-score, dan Confusion Matrix interaktif.",
    keyFeatures: [
      "Komparasi performa real-time: Naive Bayes vs XGBoost",
      "Mode evaluasi batch dataset via file .csv untuk pengujian massal",
      "Tuning fleksibel rasio kelas data (10:90 hingga 90:10)",
      "Penyimpanan dan perbandingan riwayat eksperimen dengan catatan khusus"
    ],
    techStack: ["Python", "Scikit-Learn", "XGBoost", "Flask", "Pandas", "Chart.js"],
    githubUrl: "https://github.com/Raflyf/Spam-Email",
    demoUrl: null,
    stars: 3,
    license: "Open Source",
    year: "2026"
  },
  {
    id: "laser-pointer-ppt",
    title: "laser_pointer_PPT",
    category: "tools",
    categoryLabel: "Computer Vision / IoT",
    badge: "Interactive Remote",
    description: "Pengendali presentasi PowerPoint nirsentuh dari smartphone menggunakan sensor gyroscope dan touchpad web via WebSocket (Flask-SocketIO) dan PyAutoGUI.",
    longDescription: "Aplikasi yang mengubah laptop menjadi server presentasi dan smartphone menjadi touchpad serta laser pointer virtual di layar slide PowerPoint. Memanfaatkan DeviceOrientationEvent pada peramban mobile tanpa perlu memasang aplikasi tambahan pada handphone pengguna.",
    keyFeatures: [
      "Touchpad virtual dan sensor orientasi gyroscope mobile",
      "Transmisi real-time ultra-low-latency via Flask-SocketIO",
      "Sistem pairing cepat berbasis pemindaian QR-code lokal",
      "Keamanan akses dengan token dinamis (secrets.token_urlsafe)"
    ],
    techStack: ["Python", "Flask-SocketIO", "PyAutoGUI", "WebSockets", "JavaScript DeviceOrientation"],
    githubUrl: "https://github.com/Raflyf/laser_pointer_PPT",
    demoUrl: null,
    stars: 1,
    license: "Open Source",
    year: "2026"
  },
  {
    id: "fotokita-blur",
    title: "FotoKitaBlur",
    category: "tools",
    categoryLabel: "Edge AI / Vision",
    badge: "Interactive Privacy",
    description: "Sistem deteksi gestur tangan realtime berbasis browser menggunakan MediaPipe Tasks Vision dan OpenCV untuk privasi kamera dan filter visual interaktif.",
    longDescription: "Aplikasi deteksi gestur tangan langsung di browser (Edge AI inference). Gestur peace (✌️) secara otomatis mendeteksi dan memblur wajah demi privasi kamera, dilengkapi kamus gestur interaktif berbahasa Indonesia dan CLI Python/OpenCV standalone.",
    keyFeatures: [
      "Deteksi landmark tangan dan wajah lokal via MediaPipe Tasks Vision",
      "Preservasi privasi: frame kamera diproses di sisi klien tanpa pengiriman data",
      "Kamus gestur interaktif terintegrasi",
      "Fallback mandiri menggunakan script CLI OpenCV"
    ],
    techStack: ["JavaScript", "MediaPipe Vision", "OpenCV", "Flask", "WebRTC"],
    githubUrl: "https://github.com/Raflyf/FotoKitaBlur",
    demoUrl: null,
    stars: 0,
    license: "Open Source",
    year: "2026"
  },
  {
    id: "wp2-web-programming",
    title: "Web Programming Suite (WP2)",
    category: "web",
    categoryLabel: "Full-Stack Web",
    badge: "Web Infrastructure",
    description: "Implementasi arsitektur web backend, routing, dan manipulasi database berbasis PHP & SQL.",
    longDescription: "Koleksi implementasi server-side scripting, sanitasi formulir, integrasi basis data relasional, dan manajemen session untuk aplikasi web terstruktur.",
    keyFeatures: [
      "Server-side validation dan session management",
      "Integrasi basis data relasional MySQL",
      "Struktur kode modular dan pemisahan logika tampilan"
    ],
    techStack: ["PHP", "MySQL", "JavaScript", "HTML5", "CSS3"],
    githubUrl: "https://github.com/Raflyf/Wp2",
    demoUrl: null,
    stars: 0,
    license: "MIT",
    year: "2024"
  }
];

/**
 * Extensible Certificates List
 * Pengguna dapat menambahkan sertifikat baru dengan format objek di bawah ini.
 */
export const CERTIFICATES_DATA = [
  {
    id: "cert-ml-expert",
    title: "Machine Learning & NLP Practitioner",
    issuer: "Dicoding Academy & Google Developers",
    category: "ai-ml",
    categoryLabel: "AI & ML",
    date: "2024",
    credentialId: "DICODING-ML-8812",
    verificationUrl: "https://github.com/Raflyf",
    description: "Pelatihan mendalam rekayasa model machine learning, evaluasi metrik akurasi/F1, natural language processing, dan penerapan algoritma klasifikasi.",
    skillsGained: ["Machine Learning", "NLP", "Scikit-Learn", "Model Evaluation"]
  },
  {
    id: "cert-fullstack-dev",
    title: "Full-Stack Web Application Engineering",
    issuer: "Binar Academy / Alibaba Cloud",
    category: "web",
    categoryLabel: "Web Development",
    date: "2024",
    credentialId: "BINAR-FSW-4192",
    verificationUrl: "https://github.com/Raflyf",
    description: "Arsitektur frontend modern, RESTful API design, validasi sisi server, manajemen basis data, dan optimasi performa web.",
    skillsGained: ["Full-Stack", "JavaScript", "REST APIs", "Database Modeling"]
  },
  {
    id: "cert-computer-vision",
    title: "Computer Vision & Edge AI Implementation",
    issuer: "DeepLearning.AI / Kampus Merdeka",
    category: "ai-ml",
    categoryLabel: "AI & ML",
    date: "2023",
    credentialId: "DL-CV-9031",
    verificationUrl: "https://github.com/Raflyf",
    description: "Pemrosesan citra digital, deteksi objek dan landmark menggunakan MediaPipe dan OpenCV, serta integrasi kamera real-time.",
    skillsGained: ["Computer Vision", "MediaPipe", "OpenCV", "Image Processing"]
  },
  {
    id: "cert-cloud-infrastructure",
    title: "Cloud Infrastructure & CI/CD Pipelines",
    issuer: "Google Cloud Skills Boost",
    category: "cloud",
    categoryLabel: "Cloud & DevOps",
    date: "2023",
    credentialId: "GCP-CLD-6621",
    verificationUrl: "https://github.com/Raflyf",
    description: "Penerapan containerization, otomatisasi deployment GitHub Actions, konfigurasi serverless, dan hosting statis berperforma tinggi.",
    skillsGained: ["Cloud Architecture", "GitHub Actions", "CI/CD", "DevOps"]
  },
  {
    id: "cert-cyber-security",
    title: "Web Security & Secure Coding Fundamentals",
    issuer: "Cisco Networking Academy",
    category: "security",
    categoryLabel: "Security",
    date: "2023",
    credentialId: "CISCO-SEC-1099",
    verificationUrl: "https://github.com/Raflyf",
    description: "Prinsip keamanan OWASP Top 10, sanitasi input terhadap ancaman XSS & CSRF, proteksi Content Security Policy, dan otentikasi token.",
    skillsGained: ["AppSec", "XSS Mitigation", "CSP", "Input Sanitization"]
  }
];

export const TIMELINE_DATA = [
  {
    period: "2025 — Sekarang",
    title: "AI/ML & Software Research Lead",
    institution: "Independent Research & Open-Source Projects",
    description: "Mengembangkan sistem deteksi kesamaan dokumen akademik terdesentralisasi (OpenPlagiarismChecker) dan sistem klasifikasi berbasis Machine Learning."
  },
  {
    period: "2023 — 2025",
    title: "Computer Vision & Full-Stack System Developer",
    institution: "Akademik & Proyek Rekayasa Perangkat Lunak",
    description: "Merancang kontrol presentasi nirsentuh (laser_pointer_PPT) berbasis WebSockets dan antarmuka visi komputer (FotoKitaBlur) dengan MediaPipe."
  },
  {
    period: "2021 — 2023",
    title: "Foundations of Computer Science & Web Engineering",
    institution: "Computer Science Degree Program",
    description: "Mempelajari struktur data, algoritma, pemrograman berorientasi objek, arsitektur basis data relasional, dan protokol jaringan web."
  }
];
