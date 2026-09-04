/**
 * ============================================================================
 * RAFLY FIRMANSYAH - CENTRAL DATA STORE (BILINGUAL ID / EN)
 * Projects from GitHub (@Raflyf) & Authentic Certificates Registry
 * ============================================================================
 */

export const DEVELOPER_PROFILE_I18N = {
  id: {
    name: "Rafly Firmansyah",
    handle: "@Raflyf",
    title: "Software Developer & AI/ML Engineer",
    degree: "Program Sarjana (S1) Informatika",
    institution: "Universitas Bina Sarana Informatika (UBSI), Sukabumi",
    location: "Cianjur / Sukabumi, Indonesia",
    status: "Tersedia untuk proyek & kolaborasi AI/ML",
    bio: "Mahasiswa Program Sarjana (S1) Informatika di Universitas Bina Sarana Informatika (UBSI) dan Pengembang Perangkat Lunak dengan minat mendalam pada riset kecerdasan buatan (NLP, Machine Learning, dan Computer Vision), arsitektur jaringan komputer MikroTik, serta rekayasa sistem web modern yang beretika privasi.",
    github: "https://github.com/Raflyf",
    email: "raflyfirmansyah02@gmail.com",
    whatsapp: "08991333323",
    whatsappUrl: "https://wa.me/628991333323",
    repoUrl: "https://github.com/Raflyf/web-portofolio"
  },
  en: {
    name: "Rafly Firmansyah",
    handle: "@Raflyf",
    title: "Software Developer & AI/ML Engineer",
    degree: "Informatics Engineering (B.Sc)",
    institution: "Bina Sarana Informatika University (UBSI), Sukabumi",
    location: "Cianjur / Sukabumi, Indonesia",
    status: "Available for projects & AI/ML collaborations",
    bio: "Informatics undergraduate student at Bina Sarana Informatika University (UBSI) and Software Developer with deep interest in artificial intelligence research (NLP, Machine Learning, and Computer Vision), MikroTik network architecture, and modern privacy-first web systems engineering.",
    github: "https://github.com/Raflyf",
    email: "raflyfirmansyah02@gmail.com",
    whatsapp: "08991333323",
    whatsappUrl: "https://wa.me/628991333323",
    repoUrl: "https://github.com/Raflyf/web-portofolio"
  }
};

export const PROJECTS_DATA_I18N = {
  id: [
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
      stars: 4
    },
    {
      id: "spam-email-classifier",
      title: "Spam-Email Detection System",
      category: "ai-ml",
      categoryLabel: "Machine Learning",
      badge: "Skripsi / ML Research",
      description: "Aplikasi web evaluasi dan klasifikasi email spam berbasis Machine Learning. Membandingkan performa Complement Naive Bayes (CNB) vs XGBoost dengan penerapan Domain Adaptation untuk mengatasi fenomena Concept Drift pada dataset email modern.",
      longDescription: "Aplikasi web penelitian untuk mengklasifikasikan email spam vs ham yang dibangun dengan Flask dan antarmuka web modern. Mengkomparasikan Complement Naive Bayes (CNB) yang dirancang khusus untuk dataset teks tidak seimbang dengan XGBoost, dilengkapi metode Domain Adaptation untuk memitigasi Concept Drift, pengujian massal via file .csv, serta visualisasi Confusion Matrix interaktif.",
      keyFeatures: [
        "Komparasi performa: Complement Naive Bayes (CNB) vs XGBoost",
        "Penerapan Domain Adaptation dalam mengatasi fenomena Concept Drift",
        "Mode evaluasi batch dataset via file .csv untuk pengujian massal",
        "Tuning fleksibel rasio kelas data (10:90 hingga 90:10)",
        "Visualisasi interaktif Confusion Matrix, Precision, Recall, & F1-Score"
      ],
      techStack: ["Python", "Scikit-Learn", "XGBoost", "Flask", "Pandas", "Chart.js"],
      githubUrl: "https://github.com/Raflyf/Spam-Email",
      demoUrl: null,
      stars: 3
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
      stars: 2
    },
    {
      id: "fotokita-blur",
      title: "FotoKitaBlur",
      category: "tools",
      categoryLabel: "Edge AI / Vision",
      badge: "Interactive Privacy",
      description: "Sistem deteksi gestur tangan realtime berbasis browser menggunakan MediaPipe Tasks Vision dan OpenCV untuk privasi kamera dan filter visual interaktif.",
      longDescription: "Aplikasi deteksi gestur tangan langsung di browser (Edge AI inference). Gestur dua jari (V-Sign) secara otomatis mendeteksi dan menyamarkan wajah demi privasi kamera, dilengkapi kamus gestur interaktif dan modul mandiri Python OpenCV.",
      keyFeatures: [
        "Deteksi landmark tangan dan wajah lokal via MediaPipe Tasks Vision",
        "Preservasi privasi: frame kamera diproses di sisi klien tanpa pengiriman data",
        "Kamus gestur interaktif terintegrasi",
        "Fallback mandiri menggunakan script CLI OpenCV"
      ],
      techStack: ["JavaScript", "MediaPipe Vision", "OpenCV", "Flask", "WebRTC"],
      githubUrl: "https://github.com/Raflyf/FotoKitaBlur",
      demoUrl: null,
      stars: 2
    },
    {
      id: "web-portofolio",
      title: "Bespoke Web Portfolio & AI Platform",
      category: "web",
      categoryLabel: "Frontend & Systems",
      badge: "Live Production",
      description: "Platform portofolio web modern dan riset interaktif. Dibangun dengan React 19, Vite, Tailwind CSS, Framer Motion (Liquid Glassmorphism), Vercel Serverless Functions, dan Supabase Telemetry & RAG Memory.",
      longDescription: "Situs web portofolio profesional berarsitektur modern dengan integrasi AI interaktif. Menggabungkan frontend React 19 yang responsif, animasi fisik scrollytelling Framer Motion, Terminal AI interaktif berbasis Auto Router Gateway, backend serverless Node.js di Vercel, serta telemetri observabilitas dan memori percakapan real-time di Supabase PostgreSQL.",
      keyFeatures: [
        "Arsitektur modern: React 19, Vite, Tailwind CSS, dan Framer Motion",
        "Terminal AI interaktif dengan Auto Router Gateway & RAG Memory",
        "Backend serverless Vercel Node.js untuk pemrosesan inferensi & pencarian global",
        "Database Supabase PostgreSQL untuk telemetri pengunjung dan riwayat percakapan",
        "Desain Liquid Glassmorphism, Horizon Scrollytelling, dan kepatuhan WCAG 2.2 AA"
      ],
      techStack: ["React 19", "Vite", "Tailwind CSS", "Framer Motion", "Vercel Serverless", "Supabase PostgreSQL"],
      githubUrl: "https://github.com/Raflyf/web-portofolio",
      demoUrl: "https://raflyfirmansyah-portofolio.vercel.app/",
      stars: 2
    }
  ],
  en: [
    {
      id: "open-plagiarism-checker",
      title: "OpenPlagiarismChecker",
      category: "ai-ml",
      categoryLabel: "AI / NLP Research",
      badge: "Open Source Engine",
      description: "Privacy-first local academic document similarity engine. Combines 5-word N-Gram Shingling and Multilingual Sentence Transformers for exact string matching and contextual paraphrase detection.",
      longDescription: "OpenPlagiarismChecker is a local research engine for document similarity analysis processing PDF, DOCX, and TXT files in total isolation. The system cross-references submissions against 15+ open academic repositories (GARUDA, Neliti/OneSearch, BASE, OpenAlex, Semantic Scholar) with transparent structural and semantic scoring.",
      keyFeatures: [
        "5-Word N-Gram Shingling for deterministic exact-text overlap",
        "Multilingual Sentence Transformers for deep semantic paraphrase detection",
        "Automated text extraction from PDF, DOCX, and TXT formats",
        "Concurrent querying across 15+ open academic literature sources",
        "Isolated local execution guaranteeing zero document data leakage"
      ],
      techStack: ["Python", "Flask", "PyTorch", "Sentence-Transformers", "N-Gram", "Web Scraping"],
      githubUrl: "https://github.com/Raflyf/OpenPlagiarismChecker",
      demoUrl: null,
      stars: 4
    },
    {
      id: "spam-email-classifier",
      title: "Spam-Email Detection System",
      category: "ai-ml",
      categoryLabel: "Machine Learning",
      badge: "Thesis / ML Research",
      description: "Machine Learning email classification and evaluation web platform. Compares Complement Naive Bayes (CNB) against XGBoost with Domain Adaptation to resolve Concept Drift in modern email datasets.",
      longDescription: "Empirical research web application classifying spam vs ham emails built with Flask and modern web interfaces. Evaluates Complement Naive Bayes (tailored for imbalanced textual corpora) against gradient-boosted trees (XGBoost), featuring Domain Adaptation to mitigate Concept Drift, batch CSV evaluation, and interactive Confusion Matrix visualization.",
      keyFeatures: [
        "Performance benchmark: Complement Naive Bayes (CNB) vs XGBoost",
        "Domain Adaptation implementation to mitigate Concept Drift phenomena",
        "Batch dataset evaluation mode via .csv files for large-scale tests",
        "Configurable class distribution tuning (10:90 up to 90:10 ratios)",
        "Interactive Confusion Matrix, Precision, Recall, & F1-Score analytics"
      ],
      techStack: ["Python", "Scikit-Learn", "XGBoost", "Flask", "Pandas", "Chart.js"],
      githubUrl: "https://github.com/Raflyf/Spam-Email",
      demoUrl: null,
      stars: 3
    },
    {
      id: "laser-pointer-ppt",
      title: "laser_pointer_PPT",
      category: "tools",
      categoryLabel: "Computer Vision / IoT",
      badge: "Interactive Remote",
      description: "Contactless smartphone presentation remote controller using hardware gyroscope sensors and virtual touchpad via WebSockets (Flask-SocketIO) and PyAutoGUI.",
      longDescription: "Transforms a laptop into an interactive presentation server and any modern smartphone into a low-latency touchpad and virtual laser pointer for PowerPoint slides. Uses native browser DeviceOrientationEvent without requiring external client app installations.",
      keyFeatures: [
        "Virtual touchpad and mobile gyroscope orientation tracking",
        "Ultra-low-latency real-time transmission over Flask-SocketIO",
        "Rapid device pairing via local QR-code scanning",
        "Access security enforced by dynamic cryptographically strong tokens"
      ],
      techStack: ["Python", "Flask-SocketIO", "PyAutoGUI", "WebSockets", "JavaScript DeviceOrientation"],
      githubUrl: "https://github.com/Raflyf/laser_pointer_PPT",
      demoUrl: null,
      stars: 2
    },
    {
      id: "fotokita-blur",
      title: "FotoKitaBlur",
      category: "tools",
      categoryLabel: "Edge AI / Vision",
      badge: "Interactive Privacy",
      description: "Real-time browser-based hand gesture detection using MediaPipe Tasks Vision and OpenCV for camera privacy protection and interactive visual filters.",
      longDescription: "Client-side Edge AI computer vision application operating entirely within the browser. Recognizes 2-finger gestures (V-Sign) to instantly obscure facial identity for video privacy, featuring an interactive gesture dictionary and a standalone Python OpenCV CLI.",
      keyFeatures: [
        "Local hand landmark and face tracking via MediaPipe Tasks Vision",
        "Zero-leakage privacy: video frames processed locally without server upload",
        "Integrated interactive gesture dictionary",
        "Standalone fallback scripts powered by Python OpenCV"
      ],
      techStack: ["JavaScript", "MediaPipe Vision", "OpenCV", "Flask", "WebRTC"],
      githubUrl: "https://github.com/Raflyf/FotoKitaBlur",
      demoUrl: null,
      stars: 2
    },
    {
      id: "web-portofolio",
      title: "Bespoke Web Portfolio & AI Platform",
      category: "web",
      categoryLabel: "Frontend & Systems",
      badge: "Live Production",
      description: "Modern portfolio platform and interactive research lab built with React 19, Vite, Tailwind CSS, Framer Motion (Liquid Glassmorphism), Vercel Serverless, and Supabase Telemetry & RAG Memory.",
      longDescription: "High-performance bespoke portfolio web system with embedded AI intelligence. Combines responsive React 19 components, inertia physics scrollytelling via Lenis, interactive Terminal AI with Auto Router Gateway, Node.js serverless functions, and Supabase PostgreSQL for real-time observability telemetry.",
      keyFeatures: [
        "Cutting-edge architecture: React 19, Vite, Tailwind CSS, and Framer Motion",
        "Interactive Terminal AI with Auto Router Gateway & Continuous RAG Memory",
        "Vercel Node.js serverless endpoints for inference routing and global search",
        "Supabase PostgreSQL database for visitor telemetry and forensic audit logs",
        "Liquid Glassmorphism aesthetic, Horizon Scrollytelling, and WCAG 2.2 AA compliance"
      ],
      techStack: ["React 19", "Vite", "Tailwind CSS", "Framer Motion", "Vercel Serverless", "Supabase PostgreSQL"],
      githubUrl: "https://github.com/Raflyf/web-portofolio",
      demoUrl: "https://raflyfirmansyah-portofolio.vercel.app/",
      stars: 2
    }
  ]
};

export const CERTIFICATES_DATA_I18N = {
  id: [
    {
      id: "cert-bnsp-analis-program",
      title: "Sertifikat Kompetensi: Analis Program (Program Analyst)",
      issuer: "Badan Nasional Sertifikasi Profesi (BNSP)",
      institution: "LSP Universitas Bina Sarana Informatika (LSP UBSI)",
      instructor: "Firmansyah, M.Kom (Direktur) & Rachmat Hidayat, M.Kom",
      category: "web",
      categoryLabel: "Software Engineering / BNSP",
      date: "15 Sep 2025",
      credentialId: "62010 2514 0005487 2025",
      verificationUrl: "https://bnsp.go.id",
      pdfUrl: "certificates/bnsp-analis-program.pdf",
      images: [
        "certificates/images/bnsp-analis-program-1.webp",
        "certificates/images/bnsp-analis-program-2.webp"
      ],
      imageUrl: "certificates/images/bnsp-analis-program-1.webp",
      description: "Sertifikasi Kompetensi Nasional resmi dari Badan Nasional Sertifikasi Profesi (BNSP) bidang Pengembang Perangkat Lunak (Software Development) kualifikasi Analis Program (Program Analyst). Memvalidasi 10 unit kompetensi standar industri mencakup analisis skalabilitas perangkat lunak, SQL, akses basis data, implementasi algoritma pemrograman, dokumentasi kode, debugging, profiling, code review, pengujian unit, dan pengujian integrasi program.",
      skillsGained: [
        "Analisis Skalabilitas",
        "SQL & Database Access",
        "Algoritma Pemrograman",
        "Debugging & Profiling",
        "Code Review",
        "Unit & Integration Testing"
      ]
    },
    {
      id: "cert-mikrotik-mtcna",
      title: "MTCNA: MikroTik Certified Network Associate",
      issuer: "Mikrotikls SIA (Riga, Latvia)",
      institution: "MikroTik Academy / UBSI",
      category: "security",
      categoryLabel: "Network & Security",
      date: "14 Feb 2025",
      credentialId: "2502NA6383",
      verificationUrl: "https://mikrotik.com/certificates",
      pdfUrl: "certificates/mikrotik-mtcna-2025.pdf",
      images: ["certificates/images/mikrotik-mtcna-2025.webp"],
      imageUrl: "certificates/images/mikrotik-mtcna-2025.webp",
      description: "Sertifikasi internasional resmi MikroTik Network Associate yang memvalidasi kompetensi konfigurasi jaringan, routing, firewall security, bandwidth management, wireless networking, dan tunnel interface.",
      skillsGained: ["MikroTik RouterOS", "Network Routing", "Firewall & Security", "Bandwidth Queues", "Wireless & Tunnels"]
    },
    {
      id: "cert-python-pcap",
      title: "PCAP: Programming Essentials in Python",
      issuer: "Cisco Networking Academy & OpenEDG Python Institute",
      institution: "Universitas Bina Sarana Informatika (UBSI)",
      instructor: "Tommi Alfian Armawan Sandi",
      category: "ai-ml",
      categoryLabel: "Python & Programming",
      date: "22 Jan 2024",
      credentialId: "CISCO-OPENEDG-PCAP-2024",
      verificationUrl: "https://www.netacad.com",
      pdfUrl: "certificates/python-essentials-pcap-cisco.pdf",
      images: ["certificates/images/python-essentials-pcap-cisco.webp"],
      imageUrl: "certificates/images/python-essentials-pcap-cisco.webp",
      description: "Penguasaan konsep universal pemrograman, sintaks & semantik Python 3, manipulasi struktur data dan algoritma, penanganan eksepsi, pemrograman berorientasi objek (OOP), pemrosesan teks dan berkas biner, serta generator dan closures.",
      skillsGained: ["Python 3", "Data Structures", "Algorithms", "OOP", "File Processing", "Generators & Closures"]
    },
    {
      id: "cert-cloud-blockchain",
      title: "Seminar Cloud Computing and Blockchain",
      issuer: "Fakultas Teknik & Informatika, Universitas Bina Sarana Informatika (UBSI)",
      institution: "UBSI Kampus Sukabumi",
      instructor: "Jeffry Lukman (Speaker)",
      category: "cloud",
      categoryLabel: "Cloud & Blockchain",
      date: "17 Des 2024",
      credentialId: "UBSI-FTI-CC-BC-2024",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/seminar-cloud-computing-blockchain-ubsi.pdf",
      images: ["certificates/images/seminar-cloud-computing-blockchain-ubsi.webp"],
      imageUrl: "certificates/images/seminar-cloud-computing-blockchain-ubsi.webp",
      description: "Pemahaman arsitektur komputasi awan modern (Cloud Computing Infrastructure), desentralisasi sistem Blockchain, konsensus terdistribusi, dan implementasi teknologi awan pada skala industri.",
      skillsGained: ["Cloud Computing", "Blockchain Architecture", "Distributed Systems", "Cloud Infrastructure"]
    },
    {
      id: "cert-it-bootcamp-sec",
      title: "IT Bootcamp: Software Development & Network Security",
      issuer: "Fakultas Teknik & Informatika, Universitas Bina Sarana Informatika (UBSI)",
      institution: "Sentul Bogor & UBSI",
      instructor: "Tim Instruktur FTI UBSI",
      category: "security",
      categoryLabel: "Software Dev & Security",
      date: "7 Jun 2024",
      credentialId: "UBSI-BOOTCAMP-SDNS-2024",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/bootcamp-software-dev-network-security.pdf",
      images: ["certificates/images/bootcamp-software-dev-network-security.webp"],
      imageUrl: "certificates/images/bootcamp-software-dev-network-security.webp",
      description: "Pelatihan intensif (Workshop 2.5 jam, Project 7 jam, Presentasi 3 jam) mengenai rekayasa perangkat lunak terintegrasi, mitigasi kerentanan keamanan jaringan, serta penyusunan dan presentasi proyek teknis.",
      skillsGained: ["Software Development", "Network Security", "Project Execution", "Technical Presentation"]
    },
    {
      id: "cert-cloud-specialist",
      title: "Seminar How to be a Cloud Computing Specialist",
      issuer: "Fakultas Teknik & Informatika, Universitas Bina Sarana Informatika (UBSI)",
      institution: "UBSI Kampus Sukabumi",
      instructor: "Rendy Fransiskus Cundawan, ST (Speaker)",
      category: "cloud",
      categoryLabel: "Cloud Computing",
      date: "6 Des 2023",
      credentialId: "UBSI-FTI-CCS-2023",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/seminar-cloud-computing-specialist.pdf",
      images: ["certificates/images/seminar-cloud-computing-specialist.webp"],
      imageUrl: "certificates/images/seminar-cloud-computing-specialist.webp",
      description: "Pendalaman jalur spesialisasi komputasi awan, perencanaan infrastruktur server scalable, deployment aplikasi, serta standar kompetensi cloud engineer di industri.",
      skillsGained: ["Cloud Specialist Roadmap", "Server Infrastructure", "Scalability", "DevOps Fundamentals"]
    },
    {
      id: "cert-google-profil-bisnis",
      title: "Google Profil Bisnis dan E-Commerce",
      issuer: "Digital Entrepreneurship Academy - Kominfo Digital Talent Scholarship 2023",
      institution: "Kementerian Komunikasi dan Informatika RI (Kominfo)",
      instructor: "Hary Budiarto (Kepala Badan Litbang & SDM)",
      category: "web",
      categoryLabel: "Digital & E-Commerce",
      date: "6 Jul 2023",
      credentialId: "1966871850-43/DEA/BLSDM.Kominfo/2023",
      verificationUrl: "https://digitalent.kominfo.go.id",
      pdfUrl: "certificates/google-profil-bisnis-ecommerce-kominfo.pdf",
      images: [
        "certificates/images/google-profil-bisnis-ecommerce-kominfo-1.webp",
        "certificates/images/google-profil-bisnis-ecommerce-kominfo-2.webp"
      ],
      imageUrl: "certificates/images/google-profil-bisnis-ecommerce-kominfo-1.webp",
      description: "Pelatihan resmi standardisasi digital presence, optimasi Google Business profile, integrasi platform e-commerce, dan strategi visibilitas digital (Sertifikat & Transkrip Materi).",
      skillsGained: ["Digital Presence", "Google Business Profile", "E-Commerce Integration", "SEO Basics"]
    },
    {
      id: "cert-slicing-tailwind",
      title: "Workshop Slicing UI with Tailwind CSS",
      issuer: "HIMA-SI & Program Studi Ilmu Komputer UBSI",
      institution: "UBSI Kampus Sukabumi",
      instructor: "Yogi Firdaus, S.Kom (Speaker)",
      category: "web",
      categoryLabel: "Web Development",
      date: "10 Okt 2023",
      credentialId: "UBSI-HIMASI-TAILWIND-2023",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/workshop-slicing-ui-tailwind.pdf",
      images: ["certificates/images/workshop-slicing-ui-tailwind.webp"],
      imageUrl: "certificates/images/workshop-slicing-ui-tailwind.webp",
      description: "Praktek pembuatan antarmuka pengguna responsif (UI Slicing), implementasi utility-first CSS, standardisasi layout modern, dan transisi elemen antarmuka.",
      skillsGained: ["UI Slicing", "Tailwind CSS", "Responsive Layouts", "Modern Frontend"]
    },
    {
      id: "cert-simk-fullstack",
      title: "Simulasi Kerja (SiM-K) Full-Stack Web Developer",
      issuer: "Harisenin.com (Rise)",
      institution: "Harisenin.com",
      instructor: "Kezia Bernadeth Manege, S.E., M.Sc.",
      category: "web",
      categoryLabel: "Full-Stack Web",
      date: "2023",
      credentialId: "HARISENIN-SIMK-FSW-2023",
      verificationUrl: "https://harisenin.com",
      pdfUrl: "certificates/simulasi-kerja-fullstack-harisenin.pdf",
      images: ["certificates/images/simulasi-kerja-fullstack-harisenin.webp"],
      imageUrl: "certificates/images/simulasi-kerja-fullstack-harisenin.webp",
      description: "Simulasi kerja intensif peran Full-Stack Web Developer, arsitektur client-server, kolaborasi git workflow, dan implementasi endpoint API terstruktur.",
      skillsGained: ["Full-Stack Workflow", "Client-Server Architecture", "Git Collaboration", "Web APIs"]
    },
    {
      id: "cert-coding-camp-js",
      title: "Coding Camp: Introduction to Javascript for Beginners",
      issuer: "Harisenin.com (Rise)",
      institution: "Harisenin.com",
      instructor: "Kezia Bernadeth Manege, S.E., M.Sc.",
      category: "web",
      categoryLabel: "JavaScript",
      date: "2023",
      credentialId: "HARISENIN-CC-JS-2023",
      verificationUrl: "https://harisenin.com",
      pdfUrl: "certificates/coding-camp-javascript-harisenin.pdf",
      images: ["certificates/images/coding-camp-javascript-harisenin.webp"],
      imageUrl: "certificates/images/coding-camp-javascript-harisenin.webp",
      description: "Dasar-dasar logika pemrograman JavaScript, manipulasi DOM interaktif, penanganan event peramban, dan asynchronous JavaScript.",
      skillsGained: ["JavaScript Fundamentals", "DOM Manipulation", "Event Handling", "Async JS"]
    }
  ],
  en: [
    {
      id: "cert-bnsp-analis-program",
      title: "Competency Certificate: Program Analyst",
      issuer: "National Professional Certification Agency (BNSP)",
      institution: "LSP Bina Sarana Informatika University (LSP UBSI)",
      instructor: "Firmansyah, M.Kom (Director) & Rachmat Hidayat, M.Kom",
      category: "web",
      categoryLabel: "Software Engineering / BNSP",
      date: "15 Sep 2025",
      credentialId: "62010 2514 0005487 2025",
      verificationUrl: "https://bnsp.go.id",
      pdfUrl: "certificates/bnsp-analis-program.pdf",
      images: [
        "certificates/images/bnsp-analis-program-1.webp",
        "certificates/images/bnsp-analis-program-2.webp"
      ],
      imageUrl: "certificates/images/bnsp-analis-program-1.webp",
      description: "Official National Competency Certification from BNSP in Software Development qualification Program Analyst. Validates 10 industry standard units: software scalability analysis, SQL, database querying, programming algorithm implementation, technical documentation, debugging, profiling, code review, unit testing, and integration testing.",
      skillsGained: [
        "Scalability Analysis",
        "SQL & Database Access",
        "Programming Algorithms",
        "Debugging & Profiling",
        "Code Review",
        "Unit & Integration Testing"
      ]
    },
    {
      id: "cert-mikrotik-mtcna",
      title: "MTCNA: MikroTik Certified Network Associate",
      issuer: "Mikrotikls SIA (Riga, Latvia)",
      institution: "MikroTik Academy / UBSI",
      category: "security",
      categoryLabel: "Network & Security",
      date: "14 Feb 2025",
      credentialId: "2502NA6383",
      verificationUrl: "https://mikrotik.com/certificates",
      pdfUrl: "certificates/mikrotik-mtcna-2025.pdf",
      images: ["certificates/images/mikrotik-mtcna-2025.webp"],
      imageUrl: "certificates/images/mikrotik-mtcna-2025.webp",
      description: "Official international certification from MikroTik validating competencies in network routing, firewall security, bandwidth queue management, wireless administration, and tunnel interfaces.",
      skillsGained: ["MikroTik RouterOS", "Network Routing", "Firewall & Security", "Bandwidth Queues", "Wireless & Tunnels"]
    },
    {
      id: "cert-python-pcap",
      title: "PCAP: Programming Essentials in Python",
      issuer: "Cisco Networking Academy & OpenEDG Python Institute",
      institution: "Bina Sarana Informatika University (UBSI)",
      instructor: "Tommi Alfian Armawan Sandi",
      category: "ai-ml",
      categoryLabel: "Python & Programming",
      date: "22 Jan 2024",
      credentialId: "CISCO-OPENEDG-PCAP-2024",
      verificationUrl: "https://www.netacad.com",
      pdfUrl: "certificates/python-essentials-pcap-cisco.pdf",
      images: ["certificates/images/python-essentials-pcap-cisco.webp"],
      imageUrl: "certificates/images/python-essentials-pcap-cisco.webp",
      description: "Mastery of Python 3 syntax & semantics, data structures, algorithm design, exception handling, Object-Oriented Programming (OOP), file streams, generators, and closures.",
      skillsGained: ["Python 3", "Data Structures", "Algorithms", "OOP", "File Processing", "Generators & Closures"]
    },
    {
      id: "cert-cloud-blockchain",
      title: "Seminar Cloud Computing and Blockchain",
      issuer: "Faculty of Engineering & Informatics, UBSI",
      institution: "UBSI Sukabumi Campus",
      instructor: "Jeffry Lukman (Speaker)",
      category: "cloud",
      categoryLabel: "Cloud & Blockchain",
      date: "17 Dec 2024",
      credentialId: "UBSI-FTI-CC-BC-2024",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/seminar-cloud-computing-blockchain-ubsi.pdf",
      images: ["certificates/images/seminar-cloud-computing-blockchain-ubsi.webp"],
      imageUrl: "certificates/images/seminar-cloud-computing-blockchain-ubsi.webp",
      description: "Exploration of modern cloud infrastructure architectures, blockchain decentralization mechanisms, distributed consensus protocols, and enterprise cloud deployments.",
      skillsGained: ["Cloud Computing", "Blockchain Architecture", "Distributed Systems", "Cloud Infrastructure"]
    },
    {
      id: "cert-it-bootcamp-sec",
      title: "IT Bootcamp: Software Development & Network Security",
      issuer: "Faculty of Engineering & Informatics, UBSI",
      institution: "Sentul Bogor & UBSI",
      instructor: "FTI UBSI Instructor Team",
      category: "security",
      categoryLabel: "Software Dev & Security",
      date: "7 Jun 2024",
      credentialId: "UBSI-BOOTCAMP-SDNS-2024",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/bootcamp-software-dev-network-security.pdf",
      images: ["certificates/images/bootcamp-software-dev-network-security.webp"],
      imageUrl: "certificates/images/bootcamp-software-dev-network-security.webp",
      description: "Intensive training program covering end-to-end software development lifecycles, network vulnerability mitigation strategies, and practical technical project presentations.",
      skillsGained: ["Software Development", "Network Security", "Project Execution", "Technical Presentation"]
    },
    {
      id: "cert-cloud-specialist",
      title: "Seminar How to be a Cloud Computing Specialist",
      issuer: "Faculty of Engineering & Informatics, UBSI",
      institution: "UBSI Sukabumi Campus",
      instructor: "Rendy Fransiskus Cundawan, ST (Speaker)",
      category: "cloud",
      categoryLabel: "Cloud Computing",
      date: "6 Dec 2023",
      credentialId: "UBSI-FTI-CCS-2023",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/seminar-cloud-computing-specialist.pdf",
      images: ["certificates/images/seminar-cloud-computing-specialist.webp"],
      imageUrl: "certificates/images/seminar-cloud-computing-specialist.webp",
      description: "In-depth insights into cloud engineering specializations, scalable server infrastructure planning, modern application deployments, and industry qualification standards.",
      skillsGained: ["Cloud Specialist Roadmap", "Server Infrastructure", "Scalability", "DevOps Fundamentals"]
    },
    {
      id: "cert-google-profil-bisnis",
      title: "Google Business Profile and E-Commerce",
      issuer: "Digital Entrepreneurship Academy - Kominfo Digital Talent Scholarship 2023",
      institution: "Ministry of Communication and Information Technology RI (Kominfo)",
      instructor: "Hary Budiarto (Head of R&D and HR Agency)",
      category: "web",
      categoryLabel: "Digital & E-Commerce",
      date: "6 Jul 2023",
      credentialId: "1966871850-43/DEA/BLSDM.Kominfo/2023",
      verificationUrl: "https://digitalent.kominfo.go.id",
      pdfUrl: "certificates/google-profil-bisnis-ecommerce-kominfo.pdf",
      images: [
        "certificates/images/google-profil-bisnis-ecommerce-kominfo-1.webp",
        "certificates/images/google-profil-bisnis-ecommerce-kominfo-2.webp"
      ],
      imageUrl: "certificates/images/google-profil-bisnis-ecommerce-kominfo-1.webp",
      description: "Accredited training on standardized digital presence, Google Business optimization, e-commerce platform integrations, and organic search visibility strategies.",
      skillsGained: ["Digital Presence", "Google Business Profile", "E-Commerce Integration", "SEO Basics"]
    },
    {
      id: "cert-slicing-tailwind",
      title: "Workshop Slicing UI with Tailwind CSS",
      issuer: "HIMA-SI & Computer Science Department UBSI",
      institution: "UBSI Sukabumi Campus",
      instructor: "Yogi Firdaus, S.Kom (Speaker)",
      category: "web",
      categoryLabel: "Web Development",
      date: "10 Oct 2023",
      credentialId: "UBSI-HIMASI-TAILWIND-2023",
      verificationUrl: "https://www.bsi.ac.id",
      pdfUrl: "certificates/workshop-slicing-ui-tailwind.pdf",
      images: ["certificates/images/workshop-slicing-ui-tailwind.webp"],
      imageUrl: "certificates/images/workshop-slicing-ui-tailwind.webp",
      description: "Hands-on responsive interface creation (UI slicing), utility-first CSS implementation, modern layout architectures, and interactive micro-transitions.",
      skillsGained: ["UI Slicing", "Tailwind CSS", "Responsive Layouts", "Modern Frontend"]
    },
    {
      id: "cert-simk-fullstack",
      title: "Job Simulation (SiM-K) Full-Stack Web Developer",
      issuer: "Harisenin.com (Rise)",
      institution: "Harisenin.com",
      instructor: "Kezia Bernadeth Manege, S.E., M.Sc.",
      category: "web",
      categoryLabel: "Full-Stack Web",
      date: "2023",
      credentialId: "HARISENIN-SIMK-FSW-2023",
      verificationUrl: "https://harisenin.com",
      pdfUrl: "certificates/simulasi-kerja-fullstack-harisenin.pdf",
      images: ["certificates/images/simulasi-kerja-fullstack-harisenin.webp"],
      imageUrl: "certificates/images/simulasi-kerja-fullstack-harisenin.webp",
      description: "Intensive workplace simulation of full-stack developer roles, client-server architectures, collaborative Git branching models, and RESTful API endpoints.",
      skillsGained: ["Full-Stack Workflow", "Client-Server Architecture", "Git Collaboration", "Web APIs"]
    },
    {
      id: "cert-coding-camp-js",
      title: "Coding Camp: Introduction to Javascript for Beginners",
      issuer: "Harisenin.com (Rise)",
      institution: "Harisenin.com",
      instructor: "Kezia Bernadeth Manege, S.E., M.Sc.",
      category: "web",
      categoryLabel: "JavaScript",
      date: "2023",
      credentialId: "HARISENIN-CC-JS-2023",
      verificationUrl: "https://harisenin.com",
      pdfUrl: "certificates/coding-camp-javascript-harisenin.pdf",
      images: ["certificates/images/coding-camp-javascript-harisenin.webp"],
      imageUrl: "certificates/images/coding-camp-javascript-harisenin.webp",
      description: "Foundations of JavaScript programming logic, interactive DOM manipulation, event lifecycle handling, and asynchronous JavaScript patterns.",
      skillsGained: ["JavaScript Fundamentals", "DOM Manipulation", "Event Handling", "Async JS"]
    }
  ]
};

export const TIMELINE_DATA_I18N = {
  id: [
    {
      type: "education",
      period: "2022 — Sekarang",
      title: "Mahasiswa S1 Informatika",
      institution: "Universitas Bina Sarana Informatika (UBSI), Kampus Sukabumi",
      description: "Fokus mendalami kecerdasan buatan (NLP, Machine Learning, Computer Vision), arsitektur jaringan MikroTik (MTCNA), pemrograman Python, arsitektur basis data, dan rekayasa perangkat lunak."
    },
    {
      period: "Feb — Jun 2024",
      title: "Program Kampus Mengajar — Angkatan 7",
      institution: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek RI)",
      description: "Menyusun program kerja pelaksanaan kegiatan edukasi dan literasi digital selama 4 bulan, serta bertindak sebagai seksi dokumentasi media."
    },
    {
      period: "2023 — 2024",
      title: "Anggota Divisi Pendidikan — HIMAIF UBSI",
      institution: "Himpunan Mahasiswa Informatika (HIMAIF)",
      description: "Berpartisipasi merancang dan mengeksekusi kegiatan edukatif untuk mahasiswa informatika serta koordinasi seminar ke sekolah-sekolah."
    },
    {
      period: "Agu — Sep 2023",
      title: "Staf Magang Divisi Keuangan & Sistem",
      institution: "Dinas Kelautan, Perikanan, dan Peternakan",
      description: "Mengelola pembukuan kas data digital, riset alur keuangan instansi, dan sinkronisasi sistem administrasi pemerintahan."
    },
    {
      period: "2023 — Sekarang",
      title: "Freelance IT Support & System Optimization",
      institution: "Jasa Mandiri / Komunitas Lokal",
      description: "Melayani instalasi sistem operasi, pengecekan, perbaikan, dan optimasi performa perangkat keras/lunak komputer."
    }
  ],
  en: [
    {
      type: "education",
      period: "2022 — Present",
      title: "Undergraduate Student in Informatics Engineering",
      institution: "Bina Sarana Informatika University (UBSI), Sukabumi Campus",
      description: "Deepening research in Artificial Intelligence (NLP, Machine Learning, Computer Vision), MikroTik network architecture (MTCNA), Python systems programming, database architecture, and software engineering."
    },
    {
      period: "Feb — Jun 2024",
      title: "Kampus Mengajar Program — Batch 7",
      institution: "Ministry of Education, Culture, Research, and Technology (Kemendikbudristek RI)",
      description: "Formulated educational programs and digital literacy activities across 4 months, while managing technical media documentation."
    },
    {
      period: "2023 — 2024",
      title: "Education Division Member — HIMAIF UBSI",
      institution: "Informatics Student Association (HIMAIF)",
      description: "Participated in designing and executing educational workshops for informatics students and coordinating tech seminars for local schools."
    },
    {
      period: "Aug — Sep 2023",
      title: "Finance & Systems Division Intern",
      institution: "Department of Marine Fisheries and Livestock",
      description: "Managed digital bookkeeping workflows, audited administrative fund flow processes, and assisted local government administrative systems."
    },
    {
      period: "2023 — Present",
      title: "Freelance IT Support & System Optimization",
      institution: "Independent Services / Local Community",
      description: "Delivering operating system deployments, hardware diagnostics, repairs, and performance tuning for computing workstations."
    }
  ]
};

// Helper getter functions for localized data access
export const getDeveloperProfile = (lang = 'id') => DEVELOPER_PROFILE_I18N[lang] || DEVELOPER_PROFILE_I18N.id;
export const getProjectsData = (lang = 'id') => PROJECTS_DATA_I18N[lang] || PROJECTS_DATA_I18N.id;
export const getCertificatesData = (lang = 'id') => CERTIFICATES_DATA_I18N[lang] || CERTIFICATES_DATA_I18N.id;
export const getTimelineData = (lang = 'id') => TIMELINE_DATA_I18N[lang] || TIMELINE_DATA_I18N.id;

// Backwards-compatible default exports (defaults to Indonesian)
export const DEVELOPER_PROFILE = DEVELOPER_PROFILE_I18N.id;
export const PROJECTS_DATA = PROJECTS_DATA_I18N.id;
export const CERTIFICATES_DATA = CERTIFICATES_DATA_I18N.id;
export const TIMELINE_DATA = TIMELINE_DATA_I18N.id;
