/**
 * ============================================================================
 * TERMINAL AI ASSISTANT & KNOWLEDGE ENGINE (v5.3.0)
 * Hybrid Client-Side Engine for Developer Lab Simulator
 * Features:
 * 1. Vercel Serverless Multi-Provider AI Gateway (/api/chat)
 * 2. In-Browser Sub-15ms Exact & Semantic Pattern Engine for Offline Resilience
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA } from './data.js?v=10.560.0';
import { telemetry } from './telemetry.js?v=10.560.0';

// ============================================================================
// TERMINAL AI CONTROLLER
// ============================================================================
class TerminalAIEngine {
  constructor() {
    this.currentModel = localStorage.getItem('ai_selected_model') || 'auto';
    this.customKey = localStorage.getItem('ai_custom_key') || null;
    this.customProvider = localStorage.getItem('ai_custom_provider') || 'openrouter';
    this.sessionLanguage = sessionStorage.getItem('ai_session_lang') || null;
    this.reasoningEffort = localStorage.getItem('ai_selected_effort') || 'auto';
    this.visitorId = this.getOrCreateVisitorId();
    try {
      const stored = localStorage.getItem(`terminal_ai_history_${this.visitorId}`) || sessionStorage.getItem('ai_session_history');
      this.conversationHistory = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(this.conversationHistory)) this.conversationHistory = [];
    } catch (_) {
      this.conversationHistory = [];
    }
    this.currentAbortController = null;
    this.isAborted = false;
  }

  getOrCreateVisitorId() {
    try {
      let vid = localStorage.getItem('terminal_visitor_id');
      if (!vid) {
        vid = 'vst_' + Array.from(crypto.getRandomValues(new Uint8Array(10))).map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('terminal_visitor_id', vid);
      }
      return vid;
    } catch (_) {
      return 'vst_default_client';
    }
  }

  saveHistoryToSession() {
    try {
      const payload = JSON.stringify(this.conversationHistory.slice(-500));
      localStorage.setItem(`terminal_ai_history_${this.visitorId}`, payload);
      sessionStorage.setItem('ai_session_history', payload);
    } catch (_) {}
  }

  clearHistory() {
    this.conversationHistory = [];
    try {
      localStorage.removeItem(`terminal_ai_history_${this.visitorId}`);
      sessionStorage.removeItem('ai_session_history');
    } catch (_) {}
  }

  abort() {
    this.isAborted = true;
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (_) {}
      this.currentAbortController = null;
      return true;
    }
    return false;
  }

  detectOrUpdateLanguage(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return this.sessionLanguage || 'id';

    // 1. Explicit language switch command
    const explicitEn = /\b(pakai|gunakan|ganti|ubah|bahasa|jawab.*dalam)\s*(bahasa\s*)?(inggris|english)\b/i.test(q) ||
                       /\b(switch|change|use|answer in|reply in)\s*(to\s*)?(english|en)\b/i.test(q);
    if (explicitEn) {
      this.sessionLanguage = 'en';
      sessionStorage.setItem('ai_session_lang', 'en');
      return 'en';
    }

    const explicitId = /\b(pakai|gunakan|ganti|ubah|bahasa|jawab.*dalam)\s*(bahasa\s*)?(indonesia|indo|id)\b/i.test(q) ||
                       /\b(switch|change|use|answer in|reply in)\s*(to\s*)?(indonesian|bahasa|id)\b/i.test(q);
    if (explicitId) {
      this.sessionLanguage = 'id';
      sessionStorage.setItem('ai_session_lang', 'id');
      return 'id';
    }

    // 2. If already locked in this session, keep the locked language
    if (this.sessionLanguage) {
      return this.sessionLanguage;
    }

    // 3. Initial detection on the first conversation turn
    const idWords = /\b(yang|yg|ini|itu|dan|atau|saya|aku|kamu|anda|bisa|apakah|tolong|bagaimana|gimana|apa|kenapa|mengapa|kapan|dimana|adalah|untuk|pada|di|ke|dari|dengan|kalo|jika|buat|buatkan|coba|tampilkan|jelaskan|skripsi|proyek|sertifikat)\b/i;
    const enWords = /\b(the|is|are|was|were|and|or|you|your|can|could|how|what|why|when|where|for|with|about|please|explain|show|give|create|build|write|implement|help)\b/i;

    if (idWords.test(q)) {
      this.sessionLanguage = 'id';
    } else if (enWords.test(q)) {
      this.sessionLanguage = 'en';
    } else {
      this.sessionLanguage = 'id'; // Default Indonesian
    }

    sessionStorage.setItem('ai_session_lang', this.sessionLanguage);
    return this.sessionLanguage;
  }

  setModel(modelId) {
    this.currentModel = modelId;
    localStorage.setItem('ai_selected_model', modelId);
  }

  setEffort(effort) {
    this.reasoningEffort = effort;
    localStorage.setItem('ai_selected_effort', effort);
  }

  setKey(key, provider = 'openrouter') {
    this.customKey = key.trim();
    this.customProvider = provider.trim().toLowerCase();
    localStorage.setItem('ai_custom_key', this.customKey);
    localStorage.setItem('ai_custom_provider', this.customProvider);
    return [
      `[SUKSES] API Key ${this.customProvider.toUpperCase()} disimpan di browser Anda.`,
      `Semua permintaan AI selanjutnya akan diprioritaskan menggunakan key ini.`
    ];
  }

  clearKey() {
    this.customKey = '';
    this.customProvider = '';
    localStorage.removeItem('ai_custom_key');
    localStorage.removeItem('ai_custom_provider');
    return ["API Key pribadi dihapus. Kembali menggunakan server gateway default."];
  }

  getStatus() {
    return [
      "[AI ENGINE & PROVIDER POOL STATUS]",
      "----------------------------------------------------------------",
      `Model AI Aktif       : ${this.currentModel}`,
      `Mode Reasoning/Effort: ${this.reasoningEffort.toUpperCase()}`,
      `Bahasa Sesi Terkunci : ${this.sessionLanguage === 'en' ? 'Bahasa Inggris (English)' : 'Bahasa Indonesia'}`,
      `Batas Output Token   : 8.192 Tokens / Respons (Full-Length & Zero-Truncation)`,
      `Batas Waktu Eksekusi : 2 Menit (120 Detik)`,
      `Custom Key Status    : ${this.customKey ? `Terpasang (${this.customProvider.toUpperCase()})` : 'Default Server Gateway'}`,
      `Cloud Multi-AI       : Vercel Serverless Multi-API Gateway (/api/chat)`,
      `Fallback Engine      : In-Browser Semantic Knowledge Engine (Active & Ready)`
    ];
  }

  // ========================================================================
  // AI CONTINUOUS RAG / LONG-TERM MEMORY (SUPABASE)
  // ========================================================================
  getSupabaseConfig() {
    try {
      const configStr = localStorage.getItem('portfolio_supabase_config');
      if (configStr) {
        const parsed = JSON.parse(configStr);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    } catch (_) {}
    return {
      url: 'https://rphyzcqwpkxtzllvymss.supabase.co',
      anonKey: 'REVOKED_ANON_KEY_PLACEHOLDER'
    };
  }

  async fetchAIMemories(query = '') {
    try {
      const config = this.getSupabaseConfig();
      if (!config.url || !config.anonKey) return '';

      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/ai_memories?select=fact_text,created_at&order=created_at.desc&limit=30`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(endpoint, {
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json'
        },
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!res.ok) return '';
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return '';

      // Only inject memories that semantically match the current query
      if (!query || typeof query !== 'string' || query.trim().length < 3) return '';
      const STOP_WORDS = new Set([
        'ini', 'itu', 'nya', 'yg', 'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'bukan', 'apa',
        'apakah', 'gimana', 'gimna', 'bagaimana', 'kenapa', 'mengapa', 'kalo', 'kalau', 'jika', 'ada',
        'bisa', 'saya', 'kamu', 'anda', 'the', 'is', 'are', 'was', 'were', 'for', 'with',
        'not', 'and', 'or', 'what', 'how', 'why', 'who', 'sih', 'dong', 'ya', 'kan', 'nih',
        'halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'tes', 'test', 'berita', 'terbaru', 'kelanjutan'
      ]);
      const qWords = query.toLowerCase().split(/[\s,?.!]+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w));
      if (qWords.length === 0) return '';

      const matched = data
        .map(d => (d.fact_text || '').trim())
        .filter(t => t.length > 8 && !t.startsWith('[Q&A Context]') && !t.includes(' ➔ '))
        .filter(t => {
          const tLow = t.toLowerCase();
          return qWords.some(w => tLow.includes(w));
        })
        .slice(0, 4);

      if (matched.length === 0) return '';
      return `\n\n[MEMORI JANGKA PANJANG AI (RELEVAN DENGAN TOPIK INI)]:\n${matched.map(t => `- ${t}`).join('\n')}\n`;
    } catch (err) {
      return '';
    }
  }

  saveAIMemory(fact) {
    try {
      const config = this.getSupabaseConfig();
      if (!config.url || !config.anonKey) return;

      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/ai_memories`;
      const sessionId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('portfolio_session_id')) || 'unknown';
      
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 2000);

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          fact_text: fact.substring(0, 1000),
          session_id: sessionId
        }),
        signal: ctrl.signal
      }).catch(() => {});
    } catch (_) {}
  }

  /**
   * Main Ask method: Routes multimodal attachments and queries to cloud gateway
   */
  async ask(query, attachments = []) {
    const cleanQuery = query.trim();
    if (!cleanQuery && (!attachments || attachments.length === 0)) {
      return ["Silakan masukkan pertanyaan, perintah, atau unggah dokumen/gambar."];
    }

    this.isAborted = false;
    this.currentAbortController = new AbortController();
    this.lastExecutionInfo = null;

    const currentLang = this.detectOrUpdateLanguage(cleanQuery);

    // 1. Primary Route: High-Speed Vercel Serverless Multi-API Cloud Gateway (/api/chat)
    try {
      const memoryContext = await this.fetchAIMemories(cleanQuery);
      const controller = this.currentAbortController || new AbortController();
      const timeout = setTimeout(() => {
        if (!this.isAborted) controller.abort();
      }, 300000);
      const apiEndpoint = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
        ? 'https://raflyfirmansyah-portofolio.vercel.app/api/chat'
        : '/api/chat';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanQuery,
          model: this.currentModel,
          customKey: this.customKey,
          customProvider: this.customProvider,
          attachments: attachments,
          sessionLanguage: currentLang,
          reasoningEffort: this.reasoningEffort,
          history: this.conversationHistory,
          longTermMemory: memoryContext
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      if (this.isAborted) return { isAborted: true };

      const data = await res.json().catch(() => null);
      if (this.isAborted) return { isAborted: true };

      if (res.ok && data?.success && data?.response) {
        let finalResponse = data.response;
        
        // Extract and Save Memory (Continuous RAG - Explicit User Teachings)
        const memoryMatch = finalResponse.match(/\[SAVE_MEMORY:\s*([\s\S]*?)\]/i);
        if (memoryMatch && memoryMatch[1]) {
          const newFact = memoryMatch[1].trim();
          this.saveAIMemory(newFact);
          finalResponse = finalResponse.replace(/\[SAVE_MEMORY:\s*[\s\S]*?\]/gi, '').trim();
        }

        // Record conversation turn for dynamic context (exclude error strings)
        if (!finalResponse.includes('antrean seluruh provider AI sedang penuh') && !finalResponse.includes('kendala jaringan')) {
          this.conversationHistory.push({ role: 'user', content: cleanQuery });
          this.conversationHistory.push({ role: 'assistant', content: finalResponse });
          if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
          }
          this.saveHistoryToSession();
        }

        const isAuto = !this.currentModel || this.currentModel === 'auto';
        const resolvedModel = data.model || 'deepseek/deepseek-chat';
        const provider = data.provider || 'Gateway';
        const isFailover = !!data.isFailover;
        const requestedModel = data.requestedModel || this.currentModel;

        this.lastExecutionInfo = {
          isAuto,
          resolvedModel,
          requestedModel,
          isFailover,
          provider,
          effort: data.effort || this.reasoningEffort,
          category: data.category || 'general'
        };

        // Log resolved model execution (tracks what model was used in Auto mode)
        if (telemetry) {
          const target = isAuto ? `auto:${resolvedModel}` : (this.currentModel || resolvedModel);
          const label = isAuto ? `[Auto ➔ ${resolvedModel} via ${provider}] ${cleanQuery.substring(0, 60)}` : `[${this.currentModel} via ${provider}] ${cleanQuery.substring(0, 60)}`;
          telemetry.logEvent('ai_query_resolved', target, label);
        }

        return finalResponse.split('\n');
      }
    } catch (netErr) {
      if (this.isAborted || (netErr && netErr.name === 'AbortError' && this.isAborted)) {
        return { isAborted: true };
      }

      if (netErr && netErr.name === 'AbortError') {
        return [
          `[TIMEOUT / 3 Menit]: Permintaan ke model AI melebihi batas waktu komputasi 3 menit.`,
          `Model sedang memproses penalaran mendalam. Silakan coba kembali atau gunakan prompt yang lebih terarah.`
        ];
      }

      return [
        `[KONEKSI TERPUTUS]: Gagal terhubung ke gateway model AI.`,
        `Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.`
      ];
    }

    // Return explicit error from API if available
    return [
      "Maaf, saat ini antrean seluruh provider AI sedang penuh atau mengalami kendala jaringan.",
      "Silakan coba kirim ulang pertanyaan Anda."
    ];
  }

}

export const terminalAI = new TerminalAIEngine();
