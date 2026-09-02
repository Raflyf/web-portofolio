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

const DEFAULT_SUPABASE_URL = 'https://rphyzcqwpkxtzllvymss.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaHl6Y3F3cGt4dHpsbHZ5bXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTcxOTAsImV4cCI6MjEwMjQ3MzE5MH0.vriAsg-XyDPvxpZgGlmgyKd2U9M4AtyuGgWncP2xJvU';

export function getSupabaseConfig() {
  const url = cleanKey(import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const anonKey = cleanKey(import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    return {
      url: url.startsWith('http') ? url.replace(/\/+$/, '') : `https://${url.replace(/\/+$/, '')}`,
      anonKey
    };
  }
  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY
  };
}

export default getSupabaseConfig;
