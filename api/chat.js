/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION: /api/chat (v5.2.0)
 * Multi-Provider Intelligent AI Gateway for Rafly Firmansyah Portfolio Terminal
 * Features:
 * - 🌐 Real-Time Web Search & Encyclopedic Knowledge (Live 2026 Context)
 * - 🖼️ Multimodal Vision Recognition (Qwen 2 VL 72B Vision)
 * - 📄 Document & PDF Analysis (Text & Code Ingestion)
 * - ⚡ Smart Multi-Provider Cascade (OpenCode, Nvidia NIM, MiniMax, Ollama Cloud, OpenRouter)
 * ============================================================================
 */

const SYSTEM_PROMPT = `
Anda adalah AI Assistant canggih, cerdas, berpengetahuan luas, dan interaktif pada Terminal Developer Lab di portofolio resmi Rafly Firmansyah (@Raflyf).

WAKTU & KAPABILITAS AKTIF:
1. Waktu Sekarang: Tahun 2026.
2. Akses Real-Time & Multimodal: Anda DILENGKAPI modul pencarian web real-time, pembaca dokumen PDF/teks/koding, serta penglihatan komputer multimodal (Vision AI) untuk menganalisis gambar.
3. DILARANG MUTLAK menyisipkan batasan kuno fiktif seperti "cutoff 2024" atau "tidak bisa melihat gambar/mengakses internet". Anda sepenuhnya terhubung dan mampu menganalisis input multimodal.

PEDOMAN UTAMA PENJAWABAN:
1. Jawaban Mendalam, Lengkap & Komprehensif:
   - Berikan penjelasan yang MENDALAM, TERSTRUKTUR, dan DETAIL untuk konsep teknis, sains, coding, arsitektur, gambar terlampir, maupun dokumen PDF yang diunggah.
   - Gunakan penjelasan langkah demi langkah (step-by-step) dan sertakan blok kode/analisis tabel jika relevan.
2. Menjawab Bebas Segala Topik:
   - Anda bebas menjawab segala pertanyaan umum, sains, berita, maupun teknis dengan bahasa alami yang luwes.
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

/**
 * Real-Time Web & Encyclopedic Knowledge Searcher
 */
async function searchWebContext(query) {
  const qLower = query.toLowerCase();
  // Check if query seeks real-time / current facts
  const needsSearch = (
    qLower.includes('siapa') || qLower.includes('apa itu') || qLower.includes('kapan') ||
    qLower.includes('terbaru') || qLower.includes('berita') || qLower.includes('presiden') ||
    qLower.includes('tahun') || qLower.includes('2025') || qLower.includes('2026') ||
    qLower.includes('definisi') || qLower.includes('sejarah') || qLower.includes('update')
  );

  if (!needsSearch) return '';

  try {
    const cleanSearchQuery = query.replace(/[^\w\s]/gi, ' ').trim().slice(0, 80);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearchQuery)}&format=json&origin=*`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const hits = data?.query?.search || [];
      if (hits.length > 0) {
        const snippets = hits.slice(0, 2).map(h => `- ${h.title}: ${h.snippet.replace(/<[^>]+>/g, '')}`).join('\n');
        return `\n\n[KONTEKS INFORMASI PENCARIAN REAL-TIME 2026]:\n${snippets}\n`;
      }
    }
  } catch (_) {}
  return '';
}

function pickAutoModel(query, hasImages = false) {
  if (hasImages) {
    return 'qwen/qwen-2-vl-72b-instruct';
  }

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

  // 3. General & portfolio inquiries
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
    const { 
      query = '', 
      model = 'auto', 
      customKey = '', 
      customProvider = '',
      attachments = [] 
    } = req.body || {};

    if (!query && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Query prompt or file attachment is required' });
    }

    const OPENROUTER_KEY = customKey && (customProvider === 'openrouter' || !customProvider) 
      ? customKey 
      : process.env.OPENROUTER_API_KEY;

    const NVIDIA_KEY = customKey && customProvider === 'nvidia' 
      ? customKey 
      : process.env.NVIDIA_API_KEY;

    const OPENCODE_KEY = customKey && customProvider === 'opencode' 
      ? customKey 
      : process.env.OPENCODE_API_KEY;

    const MINIMAX_KEY = customKey && customProvider === 'minimax' 
      ? customKey 
      : process.env.MINIMAX_API_KEY;

    // Check for image attachments
    const imageAttachments = Array.isArray(attachments) ? attachments.filter(a => a.isImage || (a.type && a.type.startsWith('image/'))) : [];
    const docAttachments = Array.isArray(attachments) ? attachments.filter(a => !a.isImage && (!a.type || !a.type.startsWith('image/'))) : [];
    const hasImages = imageAttachments.length > 0;

    // Retrieve real-time search context if text query warrants it
    const webContext = await searchWebContext(query);

    // Build assembled text prompt with document attachments
    let assembledQuery = query;
    if (docAttachments.length > 0) {
      const docTexts = docAttachments.map(d => `[DOKUMEN TERLAMPIR: ${d.name} (${d.type || 'text'})]:\n\`\`\`\n${d.data}\n\`\`\``).join('\n\n');
      assembledQuery = `${docTexts}\n\n[INSTRUKSI / PERTANYAAN PENGGUNA]:\n${query || 'Analisis dan jelaskan isi dokumen terlampir di atas secara mendalam.'}`;
    }

    let targetModel = model === 'auto' ? pickAutoModel(query, hasImages) : model;
    if (hasImages && targetModel === 'auto') {
      targetModel = 'qwen/qwen-2-vl-72b-instruct';
    }

    const systemPromptWithSearch = `${SYSTEM_PROMPT}${webContext}`;

    // ========================================================================
    // 1. MULTIMODAL VISION ROUTE (If images are attached)
    // ========================================================================
    if (hasImages) {
      const userContent = [
        { type: 'text', text: assembledQuery || 'Deskripsikan dan analisis gambar ini secara komprehensif dan mendalam.' }
      ];

      for (const img of imageAttachments) {
        const imgUrl = img.data.startsWith('data:') ? img.data : `data:${img.type || 'image/jpeg'};base64,${img.data}`;
        userContent.push({
          type: 'image_url',
          image_url: { url: imgUrl }
        });
      }

      // If user selected Nvidia Vision specifically
      if (targetModel.includes('nvidia') && NVIDIA_KEY) {
        try {
          const nvResp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${NVIDIA_KEY}`
            },
            body: JSON.stringify({
              model: 'meta/llama-3.2-11b-vision-instruct',
              messages: [
                { role: 'system', content: systemPromptWithSearch },
                { role: 'user', content: userContent }
              ],
              max_tokens: 1800
            })
          });

          if (nvResp.ok) {
            const nvData = await nvResp.json();
            const nvText = nvData?.choices?.[0]?.message?.content;
            if (nvText) {
              return res.status(200).json({
                success: true,
                response: nvText,
                model: 'nvidia/meta/llama-3.2-11b-vision-instruct',
                provider: 'Nvidia NIM Vision'
              });
            }
          }
        } catch (err) {
          console.warn('Nvidia vision error, cascading to OpenRouter vision:', err.message);
        }
      }

      // OpenRouter Multimodal Vision Cascade (Gemma 3, Gemini 2.5 Flash, Qwen 2 VL)
      if (OPENROUTER_KEY) {
        const visionModels = [
          targetModel.includes('vision') || targetModel.includes('vl') || targetModel.includes('gemma') || targetModel.includes('gemini') ? targetModel : 'google/gemma-3-27b-it',
          'google/gemma-3-27b-it',
          'google/gemma-3-12b-it',
          'google/gemini-2.5-flash',
          'qwen/qwen-2-vl-72b-instruct'
        ];

        for (const vm of visionModels) {
          try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'HTTP-Referer': 'https://raflyfirmansyah-portofolio.vercel.app/',
                'X-Title': 'Rafly Firmansyah AI Vision Lab'
              },
              body: JSON.stringify({
                model: vm,
                messages: [
                  { role: 'system', content: systemPromptWithSearch },
                  { role: 'user', content: userContent }
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
                  model: vm,
                  provider: 'Vision Multimodal Engine'
                });
              }
            }
          } catch (err) {
            console.warn(`Vision model ${vm} failed, trying next...`);
          }
        }
      }
    }

    // ========================================================================
    // 2. OPENCODE GATEWAY
    // ========================================================================
    if (targetModel.includes('opencode') || targetModel.includes('deepseek-v4') || targetModel.startsWith('oc/')) {
      if (OPENCODE_KEY) {
        try {
          const response = await fetch('https://api.opencode.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENCODE_KEY}`
            },
            body: JSON.stringify({
              model: 'deepseek-v4-flash-free',
              messages: [
                { role: 'system', content: systemPromptWithSearch },
                { role: 'user', content: assembledQuery }
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
                model: 'deepseek-v4-flash-free',
                provider: 'OpenCode Gateway'
              });
            }
          }
        } catch (err) {
          console.warn('OpenCode failed, cascading to OpenRouter:', err.message);
        }
      }
      targetModel = 'deepseek/deepseek-chat';
    }

    // ========================================================================
    // 3. NVIDIA NIM GATEWAY
    // ========================================================================
    if (targetModel.startsWith('nvidia/')) {
      if (NVIDIA_KEY) {
        try {
          let nvModel = targetModel.replace('nvidia/', '');
          if (nvModel.includes('nemotron')) {
            nvModel = 'nvidia/llama-3.1-nemotron-70b-instruct';
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
                { role: 'system', content: systemPromptWithSearch },
                { role: 'user', content: assembledQuery }
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
          console.warn('Nvidia failed, cascading to OpenRouter:', err.message);
        }
      }
      targetModel = 'meta-llama/llama-3.3-70b-instruct';
    }

    // ========================================================================
    // 4. MINIMAX GATEWAY
    // ========================================================================
    if (targetModel.startsWith('minimax/')) {
      if (MINIMAX_KEY) {
        try {
          const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MINIMAX_KEY}`
            },
            body: JSON.stringify({
              model: 'minimax-01',
              messages: [
                { sender_type: 'USER', sender_name: 'User', text: `${systemPromptWithSearch}\n\n${assembledQuery}` }
              ]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const content = data?.reply || data?.choices?.[0]?.message?.text;
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
          console.warn('MiniMax failed, cascading to OpenRouter:', err.message);
        }
      }
      targetModel = 'qwen/qwen-2.5-72b-instruct';
    }

    // ========================================================================
    // 5. OPENROUTER 24/7 VERIFIED CLOUD POOL
    // ========================================================================
    if (OPENROUTER_KEY) {
      let orModel = targetModel;
      if (orModel.startsWith('ollamacloud/')) {
        orModel = orModel.includes('code') ? 'qwen/qwen-2.5-coder-32b-instruct' : 'meta-llama/llama-3.3-70b-instruct';
      }

      const candidates = [
        orModel,
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.3-70b-instruct',
        'mistralai/mistral-large-2407',
        'qwen/qwen-2.5-coder-32b-instruct',
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
                { role: 'system', content: systemPromptWithSearch },
                { role: 'user', content: assembledQuery }
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
                provider: 'Cloud Multi-AI Gateway'
              });
            }
          }
        } catch (err) {
          console.warn(`Candidate ${m} failed, attempting next...`);
        }
      }
    }

    // Fallback if completely offline
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
