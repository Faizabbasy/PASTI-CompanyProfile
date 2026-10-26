-- 0001 — CMS key/value store.
--
-- Every CMS module (users, sessions, rate-limit counters, audit log, page
-- singletons, collections and their revision snapshots) already reads and
-- writes through ONE storage interface, `cmsStorage()` — keys such as
-- `pages:about`, `collections:testimonials:tst-…`, `audit:…`. This table is
-- that store in Postgres: same keys, same serialized values, so no module
-- logic changes. Concurrent edits are serialized per record by advisory
-- locks in server/utils/cms/storage.ts (409 on stale revisions stays exact).
--
-- Lives in its own schema `cms`, which is NOT exposed through the Supabase
-- Data API: anon / authenticated get no privileges and RLS is enabled with
-- no policies. Only the server's direct connection (database owner) reads
-- or writes it.

create schema if not exists cms;

create table if not exists cms.kv (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- Prefix scans (getKeys('collections:testimonials')) use the primary key
-- index with text_pattern_ops semantics via starts_with / range queries.
create index if not exists kv_key_prefix_idx on cms.kv (key text_pattern_ops);

alter table cms.kv enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema cms from anon';
    execute 'revoke all on all tables in schema cms from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on schema cms from authenticated';
    execute 'revoke all on all tables in schema cms from authenticated';
  end if;
end $$;

revoke all on schema cms from public;
revoke all on all tables in schema cms from public;
