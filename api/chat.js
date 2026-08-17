/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/chat
 * Multi-Provider AI Gateway for Rafly Firmansyah Portfolio Terminal
 * Supports 5 Cascade Providers:
 * 1. OpenRouter (DeepSeek V3 / R1 / Llama 3.3 / Qwen)
 * 2. Nvidia NIM (Llama 3.3 70B / DeepSeek R1)
 * 3. MiniMax AI (abab6.5s-chat / minimax-text)
 * 4. Opencode AI Gateway
 * 5. Ollama Cloud / Web Hub
 * + In-Browser Local Semantic Knowledge Engine Fail-Safe
 * ============================================================================
 */

const SYSTEM_PROMPT = `
Anda adalah AI Assistant cerdas dan interaktif yang terpasang pada Terminal Developer Lab di website portofolio profesional Rafly Firmansyah (@Raflyf).

ATURAN PERILAKU:
1. FOKUS UTAMA & IDENTITAS:
   - Anda merepresentasikan profil profesional dan riset Rafly Firmansyah.
   - Anda mengetahui seluruh latar belakang akademik, proyek riset skripsi, 10 sertifikasi kompetensi (BNSP Analis Program, MikroTik MTCNA, Cisco Python PCAP, dll), keahlian teknologi, dan kontak resmi Rafly.
2. PERTANYAAN UMUM / DI LUAR PORTOFOLIO:
   - Pengunjung DIPERBOLEHKAN menanyakan hal apapun di luar portofolio (misal: pertanyaan coding, logika algoritma, sains, matematika, teknologi umum, atau percakapan santai).
   - Jawab pertanyaan umum mereka dengan cerdas, ramah, dan akurat.
   - Jika relevan atau memungkinkan, kaitkan secara elegan dengan keahlian, riset, atau proyek Rafly di portofolio ini.
3. GAYA BAHASA & FORMAT:
   - Gunakan gaya respons terminal yang rapi, ringkas, dan jelas (bullet points / numbered list jika diperlukan).
   - Gunakan Bahasa Indonesia yang sopan dan profesional (atau sesuaikan dengan bahasa yang digunakan pengunjung).
   - DILARANG MENGGUNAKAN EMOJI SAMA SEKALI.

DATA RESMI RAFLY FIRMANSYAH:
- Nama Lengkap: Rafly Firmansyah (@Raflyf)
- Pendidikan: Mahasiswa Program Sarjana (S1) Informatika di Universitas Bina Sarana Informatika (UBSI), Kampus Sukabumi
- Domisili: Cianjur / Sukabumi, Jawa Barat, Indonesia
- Minat Riset: Kecerdasan Buatan (NLP & Machine Learning, Computer Vision), Jaringan Komputer MikroTik, dan Rekayasa Perangkat Lunak Modern
- Status: Terbuka untuk proyek software engineering, riset AI/ML, dan kolaborasi profesional
- Kontak Resmi:
  * WhatsApp: 08991333323 (https://wa.me/628991333323)
  * Email: raflyfirmansyah02@gmail.com
  * GitHub: https://github.com/Raflyf
  * Portofolio: https://raflyfirmansyah-portofolio.vercel.app/

PROYEK UNGGULAN GITHUB:
1. OpenPlagiarismChecker:
   - Mesin pemeriksa kesamaan teks akademik lokal mengutamakan privasi.
   - Arsitektur: 5-Word N-Gram Shingling (Exact Match) + Multilingual Sentence Transformers (Semantic Paraphrasing).
   - Indeks: 15+ basis data literatur publik (GARUDA, Indonesia OneSearch, Neliti, BASE, OpenAlex, Semantic Scholar).
   - Stack: Python, Flask, PyTorch, Sentence-Transformers, N-Gram, Web Scraping.
2. Spam-Email Detection System:
   - Aplikasi web evaluasi dan klasifikasi email spam berbasis Machine Learning.
   - Arsitektur: Komparasi performa Naive Bayes vs XGBoost dengan tuning proporsi kelas dataset fleksibel (10:90 hingga 90:10) dan visualisasi Confusion Matrix.
   - Stack: Python, Scikit-Learn, XGBoost, Flask, Pandas, Chart.js.
3. laser_pointer_PPT:
   - Pengendali presentasi PowerPoint nirsentuh dari smartphone menggunakan sensor gyroscope dan touchpad web via WebSocket.
   - Stack: Python, Flask-SocketIO, PyAutoGUI, WebSockets, JavaScript DeviceOrientation.
4. FotoKitaBlur:
   - Sistem deteksi gestur tangan realtime berbasis browser (MediaPipe Tasks Vision + OpenCV) untuk privasi kamera (blur otomatis saat V-Sign).
   - Stack: JavaScript, MediaPipe Tasks Vision, OpenCV, WebRTC.
5. Bespoke Web Portfolio:
   - Platform portofolio web rekayasa performa tinggi berarsitektur modular Vanilla JS, sistem desain OKLCH, kepatuhan aksesibilitas WCAG 2.2 AA, dan panel telemetri admin.

10 SERTIFIKASI & KOMPETENSI RESMI:
1. BNSP (Badan Nasional Sertifikasi Profesi) & LSP UBSI: Sertifikat Kompetensi Pengembang Perangkat Lunak (Kualifikasi: Analis Program) — Memvalidasi 10 Unit Kompetensi: Skalabilitas, SQL, Basis Data, Algoritma, Dokumentasi Kode, Debugging, Profiling, Code Review, Unit Testing, Integration Testing.
2. MikroTik (Riga, Latvia): MTCNA (MikroTik Certified Network Associate - Credential: 2502NA6383).
3. Cisco Networking Academy & OpenEDG: PCAP (Programming Essentials in Python).
4. FTI UBSI: Seminar Cloud Computing and Blockchain.
5. FTI UBSI: IT Bootcamp Software Development & Network Security.
6. FTI UBSI: Seminar How to be a Cloud Computing Specialist.
7. Kominfo RI: Google Profil Bisnis & E-Commerce (Digital Entrepreneurship Academy).
8. UBSI HIMASI: Workshop Slicing UI with Tailwind CSS.
9. Harisenin.com: Simulasi Kerja (SiM-K) Full-Stack Web Developer.
10. Harisenin.com: Coding Camp Introduction to JavaScript for Beginners.
`;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query, model = 'auto', customKey = '', customProvider = '' } = req.body || {};

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query prompt is required' });
    }

    // Provider API Keys from Server Environment (Fallback to user provided key)
    const OPENROUTER_KEY = customKey && (customProvider === 'openrouter' || !customProvider) 
      ? customKey 
      : process.env.OPENROUTER_API_KEY;

    const NVIDIA_KEY = customKey && customProvider === 'nvidia' 
      ? customKey 
      : process.env.NVIDIA_API_KEY;

    const MINIMAX_KEY = customKey && customProvider === 'minimax' 
      ? customKey 
      : process.env.MINIMAX_API_KEY;

    const OPENCODE_KEY = customKey && customProvider === 'opencode' 
      ? customKey 
      : process.env.OPENCODE_API_KEY;

    const OLLAMA_KEY = customKey && customProvider === 'ollama' 
      ? customKey 
      : process.env.OLLAMA_API_KEY;

    // Determine target model ID
    let selectedModel = 'deepseek/deepseek-chat';
    if (model === 'r1' || model === 'deepseek-r1') {
      selectedModel = 'deepseek/deepseek-r1';
    } else if (model === 'llama' || model === 'llama3' || model === 'llama-3.3') {
      selectedModel = 'meta-llama/llama-3.3-70b-instruct';
    } else if (model === 'qwen' || model === 'qwen-2.5') {
      selectedModel = 'qwen/qwen-2.5-72b-instruct';
    } else if (model === 'minimax') {
      selectedModel = 'minimax/minimax-01';
    } else if (model !== 'auto' && model.includes('/')) {
      selectedModel = model;
    }

    // ========================================================================
    // CASCADE LAYER 1: OpenRouter (DeepSeek / Llama / Qwen)
    // ========================================================================
    if (OPENROUTER_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
            'X-Title': 'Rafly Firmansyah AI Portfolio Terminal'
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query }
            ],
            max_tokens: 450,
            temperature: 0.6
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: selectedModel,
              provider: 'OpenRouter Cloud AI'
            });
          }
        }
      } catch (err) {
        console.warn('OpenRouter API error:', err.message);
      }
    }

    // ========================================================================
    // CASCADE LAYER 2: Nvidia NIM (Llama 3.3 / DeepSeek R1)
    // ========================================================================
    if (NVIDIA_KEY) {
      try {
        const nvModel = selectedModel.includes('r1') 
          ? 'deepseek-ai/deepseek-r1' 
          : 'meta/llama-3.3-70b-instruct';

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NVIDIA_KEY}`
          },
          body: JSON.stringify({
            model: nvModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query }
            ],
            max_tokens: 450,
            temperature: 0.6
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: nvModel,
              provider: 'Nvidia NIM Engine'
            });
          }
        }
      } catch (err) {
        console.warn('Nvidia NIM API error:', err.message);
      }
    }

    // ========================================================================
    // CASCADE LAYER 3: Opencode Gateway
    // ========================================================================
    if (OPENCODE_KEY) {
      try {
        const response = await fetch('https://api.opencode.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENCODE_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-v3',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query }
            ],
            max_tokens: 450
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: 'deepseek-v3',
              provider: 'Opencode AI'
            });
          }
        }
      } catch (err) {
        console.warn('Opencode API error:', err.message);
      }
    }

    // ========================================================================
    // CASCADE LAYER 4: MiniMax AI
    // ========================================================================
    if (MINIMAX_KEY) {
      try {
        const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MINIMAX_KEY}`
          },
          body: JSON.stringify({
            model: 'abab6.5s-chat',
            messages: [
              { sender_type: 'USER', sender_name: 'User', text: `${SYSTEM_PROMPT}\n\nPertanyaan: ${query}` }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.reply || data?.choices?.[0]?.message?.text || data?.choices?.[0]?.text;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: 'abab6.5s-chat',
              provider: 'MiniMax AI'
            });
          }
        }
      } catch (err) {
        console.warn('MiniMax API error:', err.message);
      }
    }

    // ========================================================================
    // CASCADE LAYER 5: Ollama Cloud Hub (if remote key provided)
    // ========================================================================
    if (OLLAMA_KEY) {
      try {
        const response = await fetch('https://ollama.com/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OLLAMA_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-r1',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query }
            ],
            stream: false
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.message?.content;
          if (content) {
            return res.status(200).json({
              success: true,
              response: content,
              model: 'deepseek-r1',
              provider: 'Ollama Cloud Hub'
            });
          }
        }
      } catch (err) {
        console.warn('Ollama Cloud error:', err.message);
      }
    }

    // If all cloud providers fail / limit, signal client to use Local Semantic Engine
    return res.status(200).json({
      success: false,
      fallbackToLocal: true,
      message: 'Cloud providers unavailable. Using In-Browser Semantic Engine.'
    });

  } catch (globalErr) {
    return res.status(500).json({
      success: false,
      fallbackToLocal: true,
      error: globalErr.message
    });
  }
}
