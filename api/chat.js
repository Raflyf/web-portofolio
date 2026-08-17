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

function buildSystemPrompt(sessionLanguage = 'id') {
  const isEnglish = sessionLanguage === 'en';

  const languageDirective = isEnglish
    ? `[MANDATORY SESSION LANGUAGE LOCK: ENGLISH]
- Current Locked Session Language: ENGLISH (Bahasa Inggris).
- You MUST answer ALL queries in clear, fluent, professional, and well-structured ENGLISH.
- Even if the user asks a question in another language (e.g. Indonesian or regional dialects) later in the conversation, you MUST STILL reply in ENGLISH.
- SINGLE EXCEPTION: Only switch languages if the user explicitly and directly commands you to do so (e.g. "Ganti ke bahasa Indonesia", "Switch to Indonesian").`
    : `[ATURAN MUTLAK PENGUNCIAN BAHASA SESI: BAHASA INDONESIA]
- Status Bahasa Sesi Aktif Terkunci: BAHASA INDONESIA.
- Anda WAJIB menjawab SELURUH pertanyaan pengguna dalam BAHASA INDONESIA yang lugas, profesional, berstruktur rapi, dan mudah dipahami.
- Sekalipun pengguna bertanya menggunakan bahasa lain (seperti bahasa Inggris atau bahasa daerah), Anda TETAP WAJIB MENJAWAB DALAM BAHASA INDONESIA.
- PENGECUALIAN TUNGGAL: HANYA beralih bahasa jika pengguna secara langsung dan eksplisit memerintahkan Anda (misalnya "Switch to English", "Gunakan bahasa Inggris").`;

  return `
Anda adalah AI Assistant canggih, cerdas, berpengetahuan luas, dan interaktif pada Terminal Developer Lab di portofolio resmi Rafly Firmansyah (@Raflyf).

WAKTU & KAPABILITAS AKTIF:
1. Waktu Sekarang: Tahun 2026.
2. Akses Real-Time & Multimodal: Anda DILENGKAPI modul pencarian web real-time, pembaca dokumen PDF/teks/koding, serta penglihatan komputer multimodal (Vision AI) untuk menganalisis gambar.
3. DILARANG MUTLAK menyisipkan batasan kuno fiktif seperti "cutoff 2024" atau "tidak bisa melihat gambar/mengakses internet". Anda sepenuhnya terhubung dan mampu menganalisis input multimodal.

${languageDirective}

PEDOMAN FORMAT & KEJELASAN JAWABAN (CLEAN, READABLE & STRUCTURED):
1. Format Yang Sangat Rapi & Mudah Dipahami:
   - Gunakan hierarki yang jelas dengan judul/heading (### Judul Bagian).
   - Gunakan poin-poin bernomor (1., 2., 3.) atau bullet points (- Poin) untuk menjelaskan tahapan dan konsep.
   - Tebalkan (**kata kunci**, **istilah teknis**, **metrik penting**) agar mudah dipindai mata pembaca.
   - Berikan jeda baris antar paragraf dan poin agar tidak terjadi dinding teks padat.
   - Untuk kode program, selalu gunakan blok kode dengan penanda bahasa (contoh: \`\`\`python) dan sertakan komentar kode yang jelas.
2. Jawaban Mendalam, Lengkap & Zero-Truncation:
   - Berikan penjelasan tuntas dari hulu ke hilir tanpa terpotong di tengah jalan.
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
4. Nol Emoji & Persona Profesional:
   - Dilarang menyisipkan emoji sama sekali. Pertahankan gaya komunikasi cerdas, analitis, dan objektif.
`;
}

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
  // Priority 1: If multimodal images are attached, route to highest-IQ Vision Frontier model
  if (hasImages) {
    return 'google/gemma-3-27b-it';
  }

  const q = query.toLowerCase();
  
  // Priority 2: Code & Programming Specialist Intents
  if (
    q.includes('code') || q.includes('koding') || q.includes('python') || q.includes('javascript') ||
    q.includes('fungsi') || q.includes('function') || q.includes('script') || q.includes('bug') ||
    q.includes('error') || q.includes('sql') || q.includes('api') || q.includes('class') ||
    q.includes('regex') || q.includes('algoritma') || q.includes('quicksort') || q.includes('binary search')
  ) {
    return 'qwen/qwen-2.5-coder-32b-instruct';
  }

  // Priority 3: Deep Analytical Reasoning, Complex Synthesis, PDF Analysis & General IQ (DeepSeek V3 671B)
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
      attachments = [],
      sessionLanguage = 'id'
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

    const OLLAMA_KEY = customKey && (customProvider === 'ollamacloud' || customProvider === 'ollama') 
      ? customKey 
      : (process.env.OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY);

    const providerErrors = [];

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

    const systemPromptWithSearch = `${buildSystemPrompt(sessionLanguage)}${webContext}`;

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
              max_tokens: 8192
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
          } else {
            const errTxt = await nvResp.text();
            providerErrors.push(`Nvidia Vision HTTP ${nvResp.status}: ${errTxt.slice(0, 120)}`);
          }
        } catch (err) {
          providerErrors.push(`Nvidia Vision Exception: ${err.message}`);
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
                max_tokens: 8192,
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
            } else {
              const errTxt = await response.text();
              providerErrors.push(`Vision ${vm} HTTP ${response.status}: ${errTxt.slice(0, 120)}`);
            }
          } catch (err) {
            providerErrors.push(`Vision ${vm} Exception: ${err.message}`);
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
              max_tokens: 8192
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
          } else {
            const errTxt = await response.text();
            providerErrors.push(`OpenCode HTTP ${response.status}: ${errTxt.slice(0, 120)}`);
          }
        } catch (err) {
          providerErrors.push(`OpenCode Exception: ${err.message}`);
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
              max_tokens: 8192,
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
          } else {
            const errTxt = await response.text();
            providerErrors.push(`Nvidia ${nvModel} HTTP ${response.status}: ${errTxt.slice(0, 120)}`);
          }
        } catch (err) {
          providerErrors.push(`Nvidia Exception: ${err.message}`);
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
          } else {
            const errTxt = await response.text();
            providerErrors.push(`MiniMax HTTP ${response.status}: ${errTxt.slice(0, 120)}`);
          }
        } catch (err) {
          providerErrors.push(`MiniMax Exception: ${err.message}`);
        }
      }
      targetModel = 'qwen/qwen-2.5-72b-instruct';
    }

    // ========================================================================
    // 5. OLLAMA CLOUD GATEWAY
    // ========================================================================
    if (targetModel.startsWith('ollamacloud/')) {
      if (OLLAMA_KEY) {
        try {
          let olModel = targetModel.replace('ollamacloud/', '');
          if (olModel.includes('kimi')) olModel = 'kimi-k2.7-coder';
          else if (olModel.includes('gemma')) olModel = 'gemma:31b';

          const response = await fetch('https://api.ollama.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OLLAMA_KEY}`
            },
            body: JSON.stringify({
              model: olModel,
              messages: [
                { role: 'system', content: systemPromptWithSearch },
                { role: 'user', content: assembledQuery }
              ],
              max_tokens: 8192
            })
          });

          if (response.ok) {
            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (content) {
              return res.status(200).json({
                success: true,
                response: content,
                model: olModel,
                provider: 'Ollama Cloud AI'
              });
            }
          } else {
            const errTxt = await response.text();
            providerErrors.push(`Ollama Cloud HTTP ${response.status}: ${errTxt.slice(0, 120)}`);
          }
        } catch (err) {
          providerErrors.push(`Ollama Cloud Exception: ${err.message}`);
        }
      }
      targetModel = 'qwen/qwen-2.5-coder-32b-instruct';
    }

    // ========================================================================
    // 6. OPENROUTER 24/7 VERIFIED CLOUD POOL
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
              max_tokens: 8192,
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
          } else {
            const errTxt = await response.text();
            providerErrors.push(`OpenRouter ${m} HTTP ${response.status}: ${errTxt.slice(0, 120)}`);
          }
        } catch (err) {
          providerErrors.push(`OpenRouter ${m} Exception: ${err.message}`);
        }
      }
    }

    // Dynamic Failure Reporting
    return res.status(502).json({
      success: false,
      error: 'Semua provider model cloud mengalami kegagalan respon.',
      details: providerErrors,
      model: targetModel
    });

  } catch (globalErr) {
    return res.status(500).json({
      success: false,
      error: `Serverless Gateway Exception: ${globalErr.message}`
    });
  }
}
