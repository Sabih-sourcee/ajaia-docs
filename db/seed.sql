-- Seed data for Ajaia Docs. Run after schema.sql.
-- Uses fixed UUIDs so the app's mock "Sign in as" dropdown and any docs
-- referencing these users stay stable across reseeds.

insert into users (id, name, email) values
  ('11111111-1111-1111-1111-111111111111', 'Alice', 'alice@ajaia.dev'),
  ('22222222-2222-2222-2222-222222222222', 'Bob', 'bob@ajaia.dev'),
  ('33333333-3333-3333-3333-333333333333', 'Carol', 'carol@ajaia.dev')
on conflict (id) do nothing;

insert into documents (id, title, content, owner_id) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Welcome to Ajaia Docs',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Welcome to Ajaia Docs"}]},{"type":"paragraph","content":[{"type":"text","text":"This document is owned by Alice and shared with Bob. Try editing it!"}]}]}'::jsonb,
    '11111111-1111-1111-1111-111111111111'
  )
on conflict (id) do nothing;

insert into shares (document_id, user_id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222')
on conflict do nothing;
