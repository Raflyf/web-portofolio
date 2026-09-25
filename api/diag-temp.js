export default async function handler(req, res) {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const out = { urlHost: url.replace(/https:\/\//, '').split('.')[0], hasKey: !!key };

  if (!url || !key) return res.status(200).json(out);

  try {
    // OpenAPI root: daftar SEMUA tabel yang terekspos PostgREST
    const r = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/openapi+json' },
    });
    out.openapiStatus = r.status;
    const spec = await r.json().catch(() => null);
    if (spec && spec.definitions) {
      out.tables = Object.keys(spec.definitions).sort();
    } else if (spec && spec.paths) {
      out.tables = Object.keys(spec.paths).map(p => p.replace('/', '')).sort();
    } else {
      out.specPreview = JSON.stringify(spec).slice(0, 300);
    }
  } catch (e) {
    out.error = String(e.message).slice(0, 200);
  }
  return res.status(200).json(out);
}
