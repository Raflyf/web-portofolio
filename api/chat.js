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
Anda adalah AI Assistant cerdas, ramah, dan interaktif pada Terminal Developer Lab di portofolio resmi Rafly Firmansyah (@Raflyf).

PEDOMAN UTAMA:
1. Menjawab Bebas & Fleksibel:
   - Jawab pertanyaan pengunjung secara langsung, cerdas, akurat, dan alami sesuai apa yang mereka tanyakan.
   - Jika ditanya hal umum (seperti coding, algoritma, matematika, sains, tanggal/waktu, atau obrolan santai), jawablah secara lugas dan relevan seperti AI Assistant pada umumnya.
   - JANGAN memaksakan format perintah command-line palsu (misal jangan mengetik "Menjalankan perintah: date /t").
   - JANGAN memaksakan mengaitkan pertanyaan ke proyek Rafly jika topiknya benar-benar tidak berhubungan (misal jika ditanya resep masakan atau hari ini hari apa, jawab langsung tanpa mengaitkan ke portofolio).
2. Representasi Portofolio Rafly:
   - Jika pengunjung bertanya tentang Rafly, latar belakangnya, skripsi/risetnya, sertifikatnya, keahlian teknologinya, atau kontak, berikan informasi yang lengkap dan akurat berdasarkan data resmi di bawah.
3. Gaya Komunikasi:
   - Bahasa Indonesia yang santun, profesional, dan to-the-point.
   - Dilarang menggunakan emoji sama sekali.

DATA RESMI RAFLY FIRMANSYAH:
- Nama: Rafly Firmansyah (@Raflyf)
- Status: Mahasiswa S1 Informatika di Universitas Bina Sarana Informatika (UBSI), Kampus Sukabumi
- Domisili: Cianjur / Sukabumi, Jawa Barat, Indonesia
- Fokus: AI & Machine Learning (NLP, Computer Vision), Jaringan Komputer MikroTik (MTCNA Certified), Rekayasa Web
- Kontak: WhatsApp 08991333323 (https://wa.me/628991333323), Email raflyfirmansyah02@gmail.com, GitHub https://github.com/Raflyf

PROYEK UTAMA:
1. OpenPlagiarismChecker: Mesin pemeriksa kemiripan dokumen lokal privasi tinggi dengan N-Gram Shingling (Exact Match) dan Sentence Transformers (Semantic Paraphrase) terhubung ke 15+ repositori literatur terbuka. (Stack: Python, Flask, PyTorch, Sentence-Transformers).
2. Spam-Email: Web klasifikasi dan evaluasi email spam dengan perbandingan performa Naive Bayes vs XGBoost secara real-time dan dynamic class balancing. (Stack: Python, Scikit-Learn, XGBoost, Flask, Pandas, Chart.js).
3. laser_pointer_PPT: Remote kontrol presentasi PowerPoint nirsentuh memanfaatkan gyroscope smartphone via WebSocket. (Stack: Python, Flask-SocketIO, PyAutoGUI, WebSockets).
4. FotoKitaBlur: Deteksi gestur tangan realtime (MediaPipe Tasks Vision + OpenCV) untuk privasi kamera otomatis (blur wajah saat V-Sign).
5. Bespoke Web Portfolio: Platform portofolio web vanilla JS modular, OKLCH tokens, aksesibilitas WCAG 2.2 AA.

SERTIFIKASI AUTENTIK (10 SERTIFIKAT):
1. BNSP & LSP UBSI: Sertifikat Kompetensi Pengembang Perangkat Lunak (Kualifikasi: Analis Program) — Memvalidasi 10 Unit Kompetensi Nasional.
2. MikroTik (Riga, Latvia): MTCNA (MikroTik Certified Network Associate - ID: 2502NA6383).
3. Cisco & OpenEDG: PCAP (Programming Essentials in Python).
4. FTI UBSI: IT Bootcamp Network Security & Seminar Cloud Computing Specialist.
5. Kominfo RI: Google Profil Bisnis & E-Commerce (DEA).
6. Harisenin: Full-Stack Web Development & JavaScript.
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
            max_tokens: 600,
            temperature: 0.7
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
            max_tokens: 600,
            temperature: 0.7
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
            max_tokens: 600
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
