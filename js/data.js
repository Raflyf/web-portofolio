/**
 * ============================================================================
 * RAFLY FIRMANSYAH - CENTRAL DATA STORE
 * Projects from GitHub (@Raflyf) & Authentic Certificates Registry
 * ============================================================================
 */

export const DEVELOPER_PROFILE = {
  name: "Rafly Firmansyah",
  handle: "@Raflyf",
  title: "Software Developer & AI/ML Engineer",
  institution: "Universitas Bina Sarana Informatika (UBSI), Sukabumi",
  gpa: "3.93 / 4.00",
  location: "Cianjur / Sukabumi, Indonesia",
  status: "Available for projects & AI/ML collaborations",
  bio: "Mahasiswa Informatika di Universitas Bina Sarana Informatika (IPK 3.93/4.00) dan Pengembang Perangkat Lunak dengan minat mendalam pada riset kecerdasan buatan (NLP, Machine Learning, dan Computer Vision), arsitektur jaringan komputer, serta rekayasa sistem web modern yang beretika privasi.",
  github: "https://github.com/Raflyf",
  email: "raflyfirmansyah02@gmail.com",
  whatsapp: "089913333223",
  whatsappUrl: "https://wa.me/6289913333223",
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
 * Complete Authentic Certificates Registry of Rafly Firmansyah
 * Linked directly to original PDF documents in certificates/
 */
export const CERTIFICATES_DATA = [
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
    description: "Pelatihan resmi standardisasi digital presence, optimasi Google Business profile, integrasi platform e-commerce, dan strategi visibilitas digital.",
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
    description: "Dasar-dasar logika pemrograman JavaScript, manipulasi DOM interaktif, penanganan event peramban, dan asynchronous JavaScript.",
    skillsGained: ["JavaScript Fundamentals", "DOM Manipulation", "Event Handling", "Async JS"]
  }
];

export const TIMELINE_DATA = [
  {
    period: "2022 — Sekarang",
    title: "Mahasiswa S1 Informatika (IPK 3.93/4.00)",
    institution: "Universitas Bina Sarana Informatika (UBSI), Kampus Sukabumi",
    description: "Fokus mendalami kecerdasan buatan, Machine Learning, Computer Vision, pemrograman Python, arsitektur basis data, dan rekayasa perangkat lunak."
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
];
