-- ============================================================================
-- MIGRASI: Sistem Memori & Riwayat AI Agent (25 Sep 2026)
-- ============================================================================
-- Menyalin sistem memori proyek chatbot ke portofolio:
--   messages    — riwayat percakapan server-side per sesi
--   summaries   — ringkasan konteks (distilasi otomatis tiap 8 pesan)
--   corrections — koreksi pengguna yang harus diingat agent
--
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → project PORTFOLIO (rphyzcqwpkxtzllvymss)
--   2. SQL Editor → New query → paste SELURUH isi file ini → Run
--   3. Aman dijalankan berulang (idempotent: IF NOT EXISTS / DROP POLICY IF EXISTS)
--
-- CATATAN: tabel `ai_memories` SUDAH ADA (dari schema portfolio sebelumnya),
-- jadi tidak dibuat ulang di sini — hanya dipakai.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. messages — riwayat percakapan server-side
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  platform text not null default 'web' check (platform in ('telegram', 'whatsapp', 'web', 'api')),
  chat_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  via text null,
  msg_id text null,
  processed_at timestamptz null,
  prompt_tokens integer null,
  completion_tokens integer null,
  total_tokens integer null,
  latency_ms integer null,
  created_at timestamptz not null default now()
);

-- Index utama: (platform, chat_id, created_at desc) menutupi SELURUH pola query
-- nyata (getContext, countMessages, reset — semuanya memfilter platform='web').
-- Dua index tambahan (messages_chat_idx & idx_messages_platform_msg_id) DIHAPUS
-- 25 Sep setelah ditandai "Unused Index" oleh Advisor:
--   - messages_chat_idx redundan (prefix-nya sudah tercakup index di bawah).
--   - idx_messages_platform_msg_id khusus dedupe msg_id Telegram/WhatsApp,
--     sedangkan alur web tidak pernah menulis msg_id.
create index if not exists messages_platform_chat_idx on public.messages (platform, chat_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 2. summaries — ringkasan konteks per sesi
-- ----------------------------------------------------------------------------
create table if not exists public.summaries (
  chat_id text primary key,
  summary text not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. corrections — koreksi pengguna yang diingat agent
-- ----------------------------------------------------------------------------
create table if not exists public.corrections (
  id bigint generated always as identity primary key,
  chat_id text not null,
  correction text not null,
  created_at timestamptz not null default now()
);
create index if not exists corrections_chat_idx on public.corrections (chat_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY — hanya service_role (serverless function) yang boleh akses
--    Anon/authenticated DILARANG total (cegah kebocoran riwayat & prompt poisoning)
-- ----------------------------------------------------------------------------
alter table public.messages enable row level security;
alter table public.summaries enable row level security;
alter table public.corrections enable row level security;

revoke all on table public.messages, public.summaries, public.corrections from anon, authenticated;
grant all on table public.messages, public.summaries, public.corrections to service_role;

drop policy if exists "Service Role Only messages" on public.messages;
create policy "Service Role Only messages" on public.messages
  for all to service_role using (true) with check (true);

drop policy if exists "Service Role Only summaries" on public.summaries;
create policy "Service Role Only summaries" on public.summaries
  for all to service_role using (true) with check (true);

drop policy if exists "Service Role Only corrections" on public.corrections;
create policy "Service Role Only corrections" on public.corrections
  for all to service_role using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 5. Bersihkan riwayat lama otomatis (opsional, jalan via pg_cron bila aktif)
--    Menghapus pesan lebih tua dari 90 hari agar tabel tidak membengkak.
--    Jalankan manual bila tidak pakai pg_cron:
--      delete from public.messages where created_at < now() - interval '90 days';
-- ----------------------------------------------------------------------------
-- create extension if not exists pg_cron;
-- select cron.schedule('cleanup-old-messages', '0 3 * * *',
--   $$delete from public.messages where created_at < now() - interval '90 days'$$);

-- ============================================================================
-- SELESAI. Verifikasi:
--   select count(*) from public.messages;
--   select count(*) from public.summaries;
--   select count(*) from public.corrections;
-- ============================================================================
