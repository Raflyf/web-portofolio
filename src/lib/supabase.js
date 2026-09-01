/**
 * ============================================================================
 * RAFLY FIRMANSYAH - SHARED SUPABASE CLIENT CONFIG (React Port)
 * Single source of truth for the Supabase REST credentials consumed by both
 * the telemetry client and the admin dashboard.
 * FAIL-CLOSED: no hardcoded fallback. Returns null unless VITE_ env vars exist.
 * ============================================================================
 */

function cleanKey(val) {
  if (!val) return '';
  return String(val)
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/;+$/, '')
    .trim();
}

export function getSupabaseConfig() {
  const url = cleanKey(import.meta.env.VITE_SUPABASE_URL);
  const anonKey = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (url && anonKey) {
    return {
      url: url.startsWith('http') ? url.replace(/\/+$/, '') : `https://${url.replace(/\/+$/, '')}`,
      anonKey
    };
  }
  return null;
}

export default getSupabaseConfig;
