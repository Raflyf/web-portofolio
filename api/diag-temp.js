export default async function handler(req, res) {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const out = { host: url.replace(/https:\/\//, '').split('.')[0], tables: {} };
  if (!url || !key) return res.status(200).json({ err: 'no config' });

  const probe = async (t) => {
    try {
      const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      const body = await r.text();
      return { status: r.status, msg: body.slice(0, 150) };
    } catch (e) { return { status: 0, msg: String(e.message).slice(0, 100) }; }
  };

  for (const t of ['messages','summaries','corrections','ai_memories','portfolio_telemetry','rate_limits','admin_auth_config','corpus_bank','search_cache','analysis_jobs']) {
    out.tables[t] = await probe(t);
  }
  return res.status(200).json(out);
}
