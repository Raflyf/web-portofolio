-- ============================================================================
-- RAFLY FIRMANSYAH PORTFOLIO TELEMETRY & MONITORING DATABASE SCHEMA
-- Target Backend: Supabase (PostgreSQL 15+)
-- Features: Strict Row Level Security (RLS), Fast Time-Series Indexing, Zero PII
-- ============================================================================

-- 1. Create Telemetry Events Table
CREATE TABLE IF NOT EXISTS public.portfolio_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_type TEXT NOT NULL,          -- 'page_view', 'link_click', 'cert_view', 'terminal_cmd', 'contact_submit'
    event_target TEXT NOT NULL,        -- 'whatsapp', 'github', 'openplagiarismchecker', 'mikrotik_cert', etc.
    event_label TEXT,                  -- Human-readable description
    device_type TEXT DEFAULT 'desktop',-- 'desktop', 'mobile', 'tablet'
    screen_resolution TEXT,            -- e.g. '1920x1080', '390x844'
    referrer TEXT,                     -- Document referrer domain
    session_id TEXT NOT NULL           -- Anonymized UUID session token
);

-- 2. Performance Indexing for High-Speed Aggregations
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.portfolio_telemetry (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON public.portfolio_telemetry (event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_target ON public.portfolio_telemetry (event_target);
CREATE INDEX IF NOT EXISTS idx_telemetry_session_id ON public.portfolio_telemetry (session_id);
-- Composite indexes for time-series filtering
CREATE INDEX IF NOT EXISTS idx_telemetry_type_created ON public.portfolio_telemetry (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_target_created ON public.portfolio_telemetry (event_target, created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_telemetry ENABLE ROW LEVEL SECURITY;

-- 4. Public Anonymous Role Policies
-- Allow visitors to INSERT telemetry events (Append-only with strict column length guards)
CREATE POLICY "Allow public anonymous insert"
ON public.portfolio_telemetry
FOR INSERT
TO anon
WITH CHECK (
    char_length(event_type) <= 50 AND
    char_length(event_target) <= 150 AND
    (event_label IS NULL OR char_length(event_label) <= 255) AND
    (device_type IS NULL OR char_length(device_type) <= 20) AND
    (screen_resolution IS NULL OR char_length(screen_resolution) <= 30) AND
    (referrer IS NULL OR char_length(referrer) <= 255) AND
    char_length(session_id) <= 64
);

-- Allow reading telemetry data for the dashboard
CREATE POLICY "Allow public anonymous read telemetry"
ON public.portfolio_telemetry
FOR SELECT
TO anon
USING (true);

-- Prohibit UPDATE and DELETE completely for public client (Immutable Event Log)
CREATE POLICY "Deny public update"
ON public.portfolio_telemetry
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny public delete"
ON public.portfolio_telemetry
FOR DELETE
TO anon
USING (false);

-- ============================================================================
-- 5. AI MEMORY (Continuous RAG / Long-Term Knowledge)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    fact_text TEXT NOT NULL,
    session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_memories_created_at ON public.ai_memories (created_at DESC);

ALTER TABLE public.ai_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anonymous insert memory"
ON public.ai_memories
FOR INSERT
TO anon
WITH CHECK (
    char_length(fact_text) <= 1000 AND
    (session_id IS NULL OR char_length(session_id) <= 64)
);

CREATE POLICY "Allow public anonymous read memory"
ON public.ai_memories
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Deny public update memory"
ON public.ai_memories
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny public delete memory"
ON public.ai_memories
FOR DELETE
TO anon
USING (false);

-- ============================================================================
-- 6. ADMIN SECURITY & CLOUD PIN AUTHENTICATION (Cross-Browser Sync & OTP Reset)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_auth_config (
    id TEXT PRIMARY KEY DEFAULT 'master_auth',
    pin_hash TEXT NOT NULL,
    lockout_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    otp_code_hash TEXT,
    otp_expires_at TIMESTAMPTZ,
    otp_attempts INT DEFAULT 0,
    otp_blocked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial master PIN hash (nilai awal; WAJIB dirotasi via dashboard setelah deploy)
-- M10: DO NOTHING — re-running the schema must NEVER overwrite a PIN the owner already set.
INSERT INTO public.admin_auth_config (id, pin_hash, lockout_attempts, locked_until)
VALUES ('master_auth', 'db533e5fe9b399627eb386c19c967aa171dbc121a43fda2fa583c0a731aba78c', 0, NULL)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.admin_auth_config ENABLE ROW LEVEL SECURITY;

-- C4 (SECURITY): NO anon policies on admin_auth_config at all.
-- The table stores pin_hash + otp_code_hash, so anon SELECT is revoked (P1 debt).
-- The ONLY way to read or mutate this table is via the /api/admin-otp serverless
-- function, which authenticates with SUPABASE_SERVICE_ROLE_KEY (server-side only,
-- never exposed to the client). No anon INSERT/UPDATE/DELETE policies exist.

-- ============================================================================
-- 7. PARTIAL INDEX: Optimize OMNIROUTE_TUNNEL lookup in ai_memories
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_memories_omniroute
ON public.ai_memories (created_at DESC)
WHERE fact_text LIKE '%[OMNIROUTE_TUNNEL%';

-- ============================================================================
-- 8. MAINTENANCE NOTE (pg_cron TTL — Optional but Recommended)
-- ============================================================================
-- To prevent unbounded growth of portfolio_telemetry, schedule a cleanup job:
-- SELECT cron.schedule('telemetry-cleanup', '0 3 * * 0', $$
--   DELETE FROM public.portfolio_telemetry WHERE created_at < NOW() - INTERVAL '90 days';
-- $$);
-- Requires pg_cron extension enabled in Supabase: Extensions > pg_cron


