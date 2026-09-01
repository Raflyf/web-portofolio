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

-- Dashboard telemetry is PRIVATE: only the serverless function (service_role)
-- and authenticated sessions may read it. Anonymous visitors may ONLY insert.
CREATE POLICY "Allow service role read telemetry"
ON public.portfolio_telemetry
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Allow authenticated read telemetry"
ON public.portfolio_telemetry
FOR SELECT
TO authenticated
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

-- RAG memory is PRIVATE: only service_role (serverless function) and
-- authenticated sessions may read. Anonymous INSERT remains for the public
-- terminal's memory-save path.
CREATE POLICY "Allow service role read memory"
ON public.ai_memories
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Allow authenticated read memory"
ON public.ai_memories
FOR SELECT
TO authenticated
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
    session_token TEXT,
    session_expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom baru tersedia jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.admin_auth_config ADD COLUMN IF NOT EXISTS otp_attempts INT DEFAULT 0;
ALTER TABLE public.admin_auth_config ADD COLUMN IF NOT EXISTS otp_blocked_until TIMESTAMPTZ;
ALTER TABLE public.admin_auth_config ADD COLUMN IF NOT EXISTS session_token TEXT;
ALTER TABLE public.admin_auth_config ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMPTZ;

-- Seed initial master PIN hash (nilai awal; WAJIB dirotasi via dashboard setelah deploy)
-- M10: DO NOTHING — re-running the schema must NEVER overwrite a PIN the owner already set.
INSERT INTO public.admin_auth_config (id, pin_hash, lockout_attempts, locked_until)
VALUES ('master_auth', 'db533e5fe9b399627eb386c19c967aa171dbc121a43fda2fa583c0a731aba78c', 0, NULL)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.admin_auth_config ENABLE ROW LEVEL SECURITY;

-- C4 (SECURITY): NO anon policies on admin_auth_config at all.
-- The table stores pin_hash + otp_code_hash, so direct anon SELECT is revoked (P1 debt).
-- To allow secure serverless operations without leaking hashes, we use PostgreSQL
-- SECURITY DEFINER functions below.

-- ============================================================================
-- 7. ADMIN SECURITY RPC FUNCTIONS (SECURITY DEFINER)
-- Operasi PIN & OTP aman langsung di database engine (Anon-safe via RPC)
-- ============================================================================

-- 7.1. Verifikasi PIN Master
CREATE OR REPLACE FUNCTION public.rpc_admin_verify_pin(p_pin_hash text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row record;
    v_new_attempts int;
    v_locked_until timestamptz;
BEGIN
    SELECT * INTO v_row FROM public.admin_auth_config WHERE id = 'master_auth';
    
    IF v_row IS NULL THEN
        INSERT INTO public.admin_auth_config (id, pin_hash, lockout_attempts)
        VALUES ('master_auth', 'db533e5fe9b399627eb386c19c967aa171dbc121a43fda2fa583c0a731aba78c', 0)
        RETURNING * INTO v_row;
    END IF;

    -- 1. JIKA PIN COCOK: Langsung izinkan masuk, bersihkan semua hitungan gagal & status lockout
    IF v_row.pin_hash = p_pin_hash THEN
        UPDATE public.admin_auth_config
        SET lockout_attempts = 0, locked_until = NULL, updated_at = now()
        WHERE id = 'master_auth';

        RETURN json_build_object(
            'success', true,
            'verified', true,
            'message', 'Verifikasi Master PIN berhasil.'
        );
    END IF;

    -- 2. JIKA PIN SALAH DAN SEDANG TERKUNCI: Tolak dengan status terkunci
    IF v_row.locked_until IS NOT NULL AND v_row.locked_until > now() THEN
        RETURN json_build_object(
            'success', false,
            'verified', false,
            'is_locked', true,
            'locked_until', v_row.locked_until,
            'message', 'Akses terkunci sementara karena melebihi batas percobaan PIN. Gunakan OTP recovery.'
        );
    END IF;

    -- 3. JIKA PIN SALAH DAN BELUM TERKUNCI: Tambah hitungan percobaan gagal
    v_new_attempts := COALESCE(v_row.lockout_attempts, 0) + 1;
    IF v_new_attempts >= 5 THEN
        v_locked_until := now() + interval '15 minutes';
    ELSE
        v_locked_until := NULL;
    END IF;

    UPDATE public.admin_auth_config
    SET lockout_attempts = v_new_attempts, locked_until = v_locked_until, updated_at = now()
    WHERE id = 'master_auth';

    RETURN json_build_object(
        'success', false,
        'verified', false,
        'is_locked', (v_locked_until IS NOT NULL),
        'lockout_attempts', v_new_attempts,
        'remaining_attempts', GREATEST(0, 5 - v_new_attempts),
        'locked_until', v_locked_until,
        'message', CASE 
            WHEN v_locked_until IS NOT NULL THEN 'Batas 5 kali percobaan PIN terlampaui. Sistem dikunci 15 menit. Silakan gunakan pemulihan OTP.'
            ELSE 'Master PIN salah. Sisa percobaan: ' || (5 - v_new_attempts) || ' kali.'
        END
    );
END;
$$;

-- 7.2. Simpan Hash OTP ke Database
CREATE OR REPLACE FUNCTION public.rpc_admin_save_otp(p_otp_hash text, p_expires_at timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.admin_auth_config (id, pin_hash, otp_code_hash, otp_expires_at, otp_attempts, otp_blocked_until, updated_at)
    VALUES ('master_auth', 'db533e5fe9b399627eb386c19c967aa171dbc121a43fda2fa583c0a731aba78c', p_otp_hash, p_expires_at, 0, NULL, now())
    ON CONFLICT (id) DO UPDATE
    SET otp_code_hash = p_otp_hash,
        otp_expires_at = p_expires_at,
        otp_attempts = 0,
        otp_blocked_until = NULL,
        updated_at = now();

    RETURN json_build_object('success', true);
END;
$$;

-- 7.3. Verifikasi OTP dan Reset Master PIN
CREATE OR REPLACE FUNCTION public.rpc_admin_verify_otp_and_reset_pin(p_otp_hash text, p_new_pin_hash text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row record;
    v_now timestamptz := now();
BEGIN
    SELECT * INTO v_row FROM public.admin_auth_config WHERE id = 'master_auth';

    IF v_row IS NULL OR v_row.otp_code_hash IS NULL OR v_row.otp_expires_at IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Tidak ada permintaan OTP aktif. Silakan minta kode OTP baru.');
    END IF;

    IF v_row.otp_blocked_until IS NOT NULL AND v_row.otp_blocked_until > v_now THEN
        RETURN json_build_object('success', false, 'message', 'Percobaan verifikasi OTP terkunci sementara. Coba lagi dalam beberapa menit.');
    END IF;

    IF v_row.otp_expires_at < v_now THEN
        RETURN json_build_object('success', false, 'message', 'Kode OTP telah kedaluwarsa (melebihi 10 menit). Silakan minta kode baru.');
    END IF;

    IF v_row.otp_code_hash = p_otp_hash THEN
        UPDATE public.admin_auth_config
        SET pin_hash = p_new_pin_hash,
            otp_code_hash = NULL,
            otp_expires_at = NULL,
            otp_attempts = 0,
            otp_blocked_until = NULL,
            lockout_attempts = 0,
            locked_until = NULL,
            updated_at = v_now
        WHERE id = 'master_auth';

        RETURN json_build_object('success', true, 'message', 'Master PIN berhasil direset.');
    ELSE
        UPDATE public.admin_auth_config
        SET otp_attempts = COALESCE(otp_attempts, 0) + 1,
            otp_blocked_until = CASE WHEN COALESCE(otp_attempts, 0) + 1 >= 5 THEN v_now + interval '10 minutes' ELSE NULL END,
            updated_at = v_now
        WHERE id = 'master_auth';

        RETURN json_build_object('success', false, 'message', 'Kode OTP tidak cocok.');
    END IF;
END;
$$;

-- 7.4. Update Master PIN
CREATE OR REPLACE FUNCTION public.rpc_admin_update_pin(p_current_pin_hash text, p_new_pin_hash text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row record;
BEGIN
    SELECT * INTO v_row FROM public.admin_auth_config WHERE id = 'master_auth';

    IF v_row IS NOT NULL AND v_row.pin_hash IS NOT NULL AND v_row.pin_hash <> p_current_pin_hash THEN
        RETURN json_build_object('success', false, 'message', 'PIN lama tidak cocok.');
    END IF;

    UPDATE public.admin_auth_config
    SET pin_hash = p_new_pin_hash,
        lockout_attempts = 0,
        locked_until = NULL,
        updated_at = now()
    WHERE id = 'master_auth';

    RETURN json_build_object('success', true, 'message', 'Master PIN berhasil diperbarui.');
END;
$$;

-- 7.5. Reset Lockout
CREATE OR REPLACE FUNCTION public.rpc_admin_reset_lockout(p_current_pin_hash text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row record;
BEGIN
    SELECT * INTO v_row FROM public.admin_auth_config WHERE id = 'master_auth';

    IF v_row IS NOT NULL AND v_row.pin_hash IS NOT NULL AND v_row.pin_hash <> p_current_pin_hash THEN
        RETURN json_build_object('success', false, 'message', 'Pembuktian Master PIN tidak valid.');
    END IF;

    UPDATE public.admin_auth_config
    SET lockout_attempts = 0,
        locked_until = NULL,
        updated_at = now()
    WHERE id = 'master_auth';

    RETURN json_build_object('success', true, 'message', 'Status lockout berhasil di-reset.');
END;
$$;

-- ============================================================================
-- RPC EXECUTION GRANTS (STRICT FAIL-CLOSED, per AGENTS.md §9b)
-- ----------------------------------------------------------------------------
-- SECURITY CRITICAL: the OTP / PIN-mutation RPCs (save_otp, update_pin,
-- reset_lockout, verify_otp_and_reset_pin) MUST NOT be callable by anon or
-- authenticated roles. An anon caller could otherwise plant their own OTP
-- hash and reset the master PIN (privilege escalation). Only service_role
-- (used by the /api/admin-otp serverless function) may execute them.
--
-- rpc_admin_verify_pin stays callable by anon/authenticated because the
-- login endpoint uses it; it only compares a hash against the stored hash
-- and returns success/lockout — it never reveals the stored hash.
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.rpc_admin_verify_pin(text) TO anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.rpc_admin_save_otp(text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_save_otp(text, timestamptz) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rpc_admin_verify_otp_and_reset_pin(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_verify_otp_and_reset_pin(text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rpc_admin_update_pin(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_update_pin(text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rpc_admin_reset_lockout(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_reset_lockout(text) TO service_role;

-- ============================================================================
-- 8. PERSISTED RATE LIMITING (AGENTS.md §9b)
-- Serverless rate limits must survive cold starts and multiple instances.
-- /api/chat persists per-IP rolling counters here (service_role writes only).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
    client_ip TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (client_ip, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role may read/write the rate-limit counters.
CREATE POLICY "Allow service role all rate_limits" ON public.rate_limits
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
ON public.rate_limits (window_start DESC);

-- ============================================================================
-- 9. PARTIAL INDEX: Optimize OMNIROUTE_TUNNEL lookup in ai_memories
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_memories_omniroute
ON public.ai_memories (created_at DESC)
WHERE fact_text LIKE '%[OMNIROUTE_TUNNEL%';

-- ============================================================================
-- 9. MAINTENANCE NOTE (pg_cron TTL — Optional but Recommended)
-- ============================================================================
-- To prevent unbounded growth of portfolio_telemetry, schedule a cleanup job:
-- SELECT cron.schedule('telemetry-cleanup', '0 3 * * 0', $$
--   DELETE FROM public.portfolio_telemetry WHERE created_at < NOW() - INTERVAL '90 days';
-- $$);



