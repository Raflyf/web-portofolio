/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/chat (v3.9.0)
 * Multi-Provider AI Gateway for Rafly Firmansyah Portfolio Terminal
 * Supports: OpenRouter (DeepSeek V3 / R1 / Llama 3.3 / Qwen), Nvidia NIM (Nemotron 70B Ultra),
 * MiniMax (M3 / abab6.5s), Opencode Gateway (DeepSeek Flash)
 * Generates Deep, Comprehensive, In-Depth Responses (Up to 1800 tokens)
 * ============================================================================
 */

const SYSTEM_PROMPT = `
Anda adalah AI Assistant canggih, cerdas, berpengetahuan luas, dan interaktif pada Terminal Developer Lab di portofolio resmi Rafly Firmansyah (@Raflyf).

PEDOMAN UTAMA PENJAWABAN:
1. Jawaban Mendalam, Lengkap & Komprehensif:
   - Jika pengunjung menanyakan konsep teknis, sains, matematika, perbandingan arsitektur, coding, logika algoritma, esai, atau pertanyaan analitis, berikan penjelasan yang MENDALAM, TERSTRUKTUR, dan DETAIL (jangan memotong jawaban atau hanya memberi jawaban singkat/basic).
   - Gunakan penjelasan langkah demi langkah (step-by-step), sertakan blok kode contoh jika relevan, berikan perbandingan kelebihan/kekurangan, dan elaborasi konteksnya secara komprehensif seperti model AI unggulan (GPT-4, Claude 3.5, Gemini 2.0).
2. Menjawab Bebas Segala Topik:
   - Anda bebas dan mampu menjawab segala topik umum maupun teknis di luar portofolio.
   - JANGAN memaksakan format perintah CLI palsu (misal jangan menulis "Menjalankan perintah: date /t").
   - Jawab secara alami dan kontekstual.
3. Representasi Data Resmi Rafly Firmansyah:
   - Jika ditanya mengenai profil, riset, atau proyek Rafly, gunakan data autentik berikut secara presisi:
     * Nama: Rafly Firmansyah (@Raflyf), Mahasiswa S1 Informatika Universitas Bina Sarana Informatika (UBSI Sukabumi).
     * Lokasi: Cianjur / Sukabumi, Jawa Barat.
     * Riset 1: OpenPlagiarismChecker — Mesin pemeriksa kesamaan dokumen akademik mengutamakan privasi berbasis 5-Word N-Gram Shingling (Exact Match) dan Multilingual Sentence Transformers (Semantic Paraphrasing) merujuk 15+ basis data literatur publik (GARUDA, Neliti, BASE, OpenAlex, dll). Stack: Python, Flask, PyTorch.
     * Riset 2: Spam-Email Classifier — Web evaluasi spam real-time dengan perbandingan Naive Bayes vs XGBoost dan dynamic class balancing (10:90 - 90:10). Stack: Python, Scikit-Learn, XGBoost, Flask, Pandas, Chart.js.
     * Proyek 3: laser_pointer_PPT — Pengendali PowerPoint nirsentuh berbasis sensor gyroscope smartphone via WebSocket (Flask-SocketIO, PyAutoGUI).
     * Proyek 4: FotoKitaBlur — Deteksi gestur tangan realtime (MediaPipe Tasks Vision + OpenCV) untuk privasi kamera otomatis (blur saat V-Sign).
     * Proyek 5: Bespoke Web Portfolio — Portfolio Vanilla JS modular, OKLCH tokens, WCAG 2.2 AA compliant.
     * 10 Sertifikat: BNSP Analis Program (10 Unit Kompetensi Nasional), MikroTik MTCNA (Riga Latvia), Cisco Python PCAP, IT Bootcamp Network Security (UBSI), Cloud Computing Specialist (UBSI), Kominfo DEA E-Commerce, Harisenin Full-Stack.
     * Kontak: WhatsApp 08991333323 (https://wa.me/628991333323), Email raflyfirmansyah02@gmail.com, GitHub https://github.com/Raflyf.
4. Format:
   - Gunakan format teks Markdown yang bersih, rapi, dan mudah dibaca di terminal.
   - Dilarang menggunakan emoji sama sekali.
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
    const { query, model = 'deepseek/deepseek-chat', customKey = '', customProvider = '' } = req.body || {};

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query prompt is required' });
    }

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

    // ========================================================================
    // 1. ROUTING: NVIDIA NIM MODELS
    // ========================================================================
    if (model.startsWith('nvidia/') || model.startsWith('meta/llama-3.3') || model.startsWith('deepseek-ai/')) {
      if (NVIDIA_KEY) {
        try {
          let nvModel = model.replace('nvidia/', '');
          if (nvModel === 'llama-3.1-nemotron-70b-instruct') {
            nvModel = 'nvidia/llama-3.1-nemotron-70b-instruct';
          } else if (nvModel === 'deepseek-r1') {
            nvModel = 'deepseek-ai/deepseek-r1';
          }

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
              max_tokens: 1800,
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
    }

    // ========================================================================
    // 2. ROUTING: MINIMAX MODELS
    // ========================================================================
    if (model.startsWith('minimax/') || model === 'abab6.5s-chat') {
      if (MINIMAX_KEY) {
        try {
          const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MINIMAX_KEY}`
            },
            body: JSON.stringify({
              model: model.includes('01') ? 'minimax-01' : 'abab6.5s-chat',
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
                model: 'minimax-01',
                provider: 'MiniMax AI'
              });
            }
          }
        } catch (err) {
          console.warn('MiniMax API error:', err.message);
        }
      }
    }

    // ========================================================================
    // 3. ROUTING: OPENCODE GATEWAY
    // ========================================================================
    if (model.startsWith('opencode/')) {
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
              max_tokens: 1800
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
    }

    // ========================================================================
    // 4. PRIMARY & DEFAULT: OPENROUTER (DeepSeek V3 / R1 / Llama 3.3 / Qwen)
    // ========================================================================
    if (OPENROUTER_KEY) {
      try {
        let orModel = model;
        if (orModel === 'auto' || orModel.startsWith('opencode/')) {
          orModel = 'deepseek/deepseek-chat';
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
            'X-Title': 'Rafly Firmansyah AI Portfolio Terminal'
          },
          body: JSON.stringify({
            model: orModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query }
            ],
            max_tokens: 1800,
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
              model: orModel,
              provider: 'OpenRouter Cloud AI'
            });
          }
        }
      } catch (err) {
        console.warn('OpenRouter primary error:', err.message);
      }
    }

    // ========================================================================
    // 5. CASCADE FALLBACK: NVIDIA NIM (Llama 3.3 / DeepSeek R1)
    // ========================================================================
    if (NVIDIA_KEY) {
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NVIDIA_KEY}`
          },
          body: JSON.stringify({
            model: 'meta/llama-3.3-70b-instruct',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: query }
            ],
            max_tokens: 1800,
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
              model: 'meta/llama-3.3-70b-instruct',
              provider: 'Nvidia NIM Engine'
            });
          }
        }
      } catch (err) {
        console.warn('Nvidia NIM fallback error:', err.message);
      }
    }

    // Fallback to local semantic engine if all cloud APIs unreachable
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
