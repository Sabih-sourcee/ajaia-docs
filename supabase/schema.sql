-- Ajaia Docs schema
-- Run this in the Supabase SQL editor (or via `psql`) before seed.sql.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  owner_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shares (
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (document_id, user_id)
);

create index if not exists documents_owner_id_idx on documents(owner_id);
create index if not exists shares_user_id_idx on shares(user_id);

-- Keep updated_at fresh on every content/title change.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists documents_set_updated_at on documents;
create trigger documents_set_updated_at
  before update on documents
  for each row
  execute function set_updated_at();

-- Auth is mocked at the application layer (see README), so Row Level
-- Security is intentionally left off and access control is enforced in
-- the Next.js API routes instead (see lib/access.ts).
