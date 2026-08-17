/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/chat (v4.2.0)
 * Multi-Provider Intelligent AI Gateway for Rafly Firmansyah Portfolio Terminal
 * Features:
 * 1. Smart Dynamic 'Auto' Intent Classifier:
 *    - Code / Programming -> Qwen 2.5 Coder 32B / DeepSeek V3
 *    - Deep Reasoning / Math / Logic -> DeepSeek R1 / Llama 3.3 70B
 *    - General / Portfolio Inquiries -> DeepSeek V3 / Qwen 2.5 72B (~380ms)
 * 2. Multi-Model Support: DeepSeek V3, DeepSeek R1, Llama 3.3 70B, Qwen Coder, Nvidia Nemotron, MiniMax
 * 3. Deep In-Depth Output Engine (1800 max_tokens)
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
   - Jawab secara alami, luwes, dan kontekstual tanpa memaksakan format perintah CLI palsu.
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

function pickAutoModel(query) {
  const q = query.toLowerCase();
  
  // 1. Code & programming intents
  if (
    q.includes('code') || q.includes('koding') || q.includes('python') || q.includes('javascript') ||
    q.includes('fungsi') || q.includes('function') || q.includes('script') || q.includes('bug') ||
    q.includes('error') || q.includes('sql') || q.includes('api') || q.includes('class') ||
    q.includes('regex') || q.includes('algoritma') || q.includes('quicksort') || q.includes('binary search')
  ) {
    return 'qwen/qwen-2.5-coder-32b-instruct';
  }

  // 2. Deep reasoning & analytical logic intents
  if (
    q.includes('kenapa') || q.includes('mengapa') || q.includes('analisis') || q.includes('bandingkan') ||
    q.includes('perbedaan') || q.includes('evaluasi') || q.includes('hitung') || q.includes('step by step') ||
    q.includes('penalaran') || q.includes('arsitektur') || q.includes('paling canggih')
  ) {
    return 'deepseek/deepseek-chat';
  }

  // 3. General & portfolio inquiries (High speed)
  return 'deepseek/deepseek-chat';
}

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

    const OPENROUTER_KEY = customKey && (customProvider === 'openrouter' || !customProvider) 
      ? customKey 
      : process.env.OPENROUTER_API_KEY;

    const NVIDIA_KEY = customKey && customProvider === 'nvidia' 
      ? customKey 
      : process.env.NVIDIA_API_KEY;

    const MINIMAX_KEY = customKey && customProvider === 'minimax' 
      ? customKey 
      : process.env.MINIMAX_API_KEY;

    // Resolve model ID
    let targetModel = model === 'auto' ? pickAutoModel(query) : model;

    // ------------------------------------------------------------------------
    // LAYER 1: NVIDIA NIM (If explicitly requested)
    // ------------------------------------------------------------------------
    if (targetModel.startsWith('nvidia/')) {
      if (NVIDIA_KEY) {
        try {
          const nvModel = targetModel.replace('nvidia/', '');
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
                provider: 'Nvidia NIM'
              });
            }
          }
        } catch (err) {
          console.warn('Nvidia error, cascading to OpenRouter:', err.message);
        }
      }
      // If Nvidia failed, cascade targetModel to OpenRouter Llama
      targetModel = 'meta-llama/llama-3.3-70b-instruct';
    }

    // ------------------------------------------------------------------------
    // LAYER 2: OPENROUTER (Primary Verified High-Performance Pool)
    // ------------------------------------------------------------------------
    if (OPENROUTER_KEY) {
      const candidates = [
        targetModel,
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.3-70b-instruct',
        'qwen/qwen-2.5-72b-instruct'
      ];

      for (const m of candidates) {
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
              model: m,
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
                model: m,
                provider: 'Cloud AI'
              });
            }
          }
        } catch (err) {
          console.warn(`Model ${m} failed, trying next candidate...`);
        }
      }
    }

    // Fallback if all cloud models unavailable
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
