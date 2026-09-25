/**
 * Endpoint diagnosa sementara: cek isi tabel memory (HAPUS setelah selesai).
 */
export default async function handler(req, res) {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const session = String(req.query.session || '').slice(0, 128);
  const out = { hasUrl: !!url, hasKey: !!key, keyLen: key.length, session };

  if (!url || !key) return res.status(200).json(out);

  try {
    // Cek tabel messages
    const r1 = await fetch(`${url}/rest/v1/messages?select=id,chat_id,role,content,created_at&order=created_at.desc&limit=10`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    out.messagesStatus = r1.status;
    const t1 = await r1.text();
    out.messagesBody = t1.slice(0, 800);

    // Cek tabel summaries
    const r2 = await fetch(`${url}/rest/v1/summaries?select=chat_id,summary&limit=5`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    out.summariesStatus = r2.status;
    out.summariesBody = (await r2.text()).slice(0, 400);

    // Cek tabel corrections
    const r3 = await fetch(`${url}/rest/v1/corrections?select=id,chat_id,correction&limit=5`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    out.correctionsStatus = r3.status;
    out.correctionsBody = (await r3.text()).slice(0, 400);

    // Coba INSERT test
    const r4 = await fetch(`${url}/rest/v1/messages`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ platform: 'web', chat_id: 'diag_probe', role: 'user', content: 'diag test' }),
    });
    out.insertStatus = r4.status;
    out.insertBody = (await r4.text()).slice(0, 400);
  } catch (e) {
    out.error = String(e.message).slice(0, 300);
  }
  return res.status(200).json(out);
}
