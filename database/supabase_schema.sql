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

