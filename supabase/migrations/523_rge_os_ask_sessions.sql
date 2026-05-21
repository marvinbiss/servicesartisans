-- ============================================================================
-- MIGRATION 523: AnswerEngine multi-turn sessions (Ralph 34)
-- ============================================================================
-- Contexte : Ralph 19 (`56f4050a3`) + Ralph 28 (`66153deb9`) délivrent
-- `/api/v1/ask` et `/api/v1/ask/stream` en single-shot. Manque la
-- persistance multi-turn pour les clients (chat UIs web, CLI sessions,
-- bots d'intégration) qui doivent conserver le contexte conversationnel
-- sans re-pousser l'historique à chaque tour.
--
-- Tables :
--   - rge_os_ask_sessions  : sessions anonymes (UUID + public_key 32-char),
--     TTL 30 jours, soft-delete via deleted_at, cap 50 messages/session.
--   - rge_os_ask_messages  : turns (role user/assistant + content + classif
--     + citations JSONB + trace JSONB). Append-only.
--
-- Sécurité :
--   - RLS service_role-only. L'accès end-user passe TOUJOURS par l'API
--     (`public_key` gate, comparaison timing-safe côté handler).
--   - Pas d'index sur public_key (clé pas adressable hors id+pubkey couple,
--     timing-safe compare empêche l'usage en lookup index de toute façon).
--   - IP / user-agent capturés UNIQUEMENT au premier turn (ip_first /
--     user_agent_first), pas par message → pas de profilage par turn.
--
-- Trigger : `rge_os_ask_session_bump_activity` met à jour last_activity_at
-- et incrémente message_count à chaque insert dans rge_os_ask_messages.
-- search_path PINNÉ `public, pg_catalog` (CVE-2018-1058 hardening per CLAUDE.md).

create table if not exists public.rge_os_ask_sessions (
  id uuid primary key default gen_random_uuid(),
  public_key text not null,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  message_count int not null default 0,
  deleted_at timestamptz,
  ip_first text,
  user_agent_first text
);

create index if not exists rge_os_ask_sessions_active_idx
  on public.rge_os_ask_sessions(expires_at)
  where deleted_at is null;

create table if not exists public.rge_os_ask_messages (
  id bigserial primary key,
  session_id uuid not null references public.rge_os_ask_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  classification text,
  citations jsonb,
  trace jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rge_os_ask_messages_session_id_idx
  on public.rge_os_ask_messages(session_id, created_at);

alter table public.rge_os_ask_sessions enable row level security;
alter table public.rge_os_ask_messages enable row level security;

drop policy if exists "rge_os_ask_sessions_service_role_all" on public.rge_os_ask_sessions;
create policy "rge_os_ask_sessions_service_role_all" on public.rge_os_ask_sessions
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

drop policy if exists "rge_os_ask_messages_service_role_all" on public.rge_os_ask_messages;
create policy "rge_os_ask_messages_service_role_all" on public.rge_os_ask_messages
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

-- last_activity_at + message_count trigger — search_path pinné (CVE-2018-1058).
create or replace function public.rge_os_ask_session_bump_activity()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $body$
begin
  update public.rge_os_ask_sessions
    set last_activity_at = now(),
        message_count = message_count + 1
    where id = new.session_id;
  return new;
end;
$body$;

drop trigger if exists rge_os_ask_session_bump_activity_trg on public.rge_os_ask_messages;
create trigger rge_os_ask_session_bump_activity_trg
  after insert on public.rge_os_ask_messages
  for each row execute procedure public.rge_os_ask_session_bump_activity();

comment on table public.rge_os_ask_sessions is
  'AnswerEngine multi-turn sessions (Ralph 34). Anonymous, public_key-gated, 30j TTL, RLS service_role only.';
comment on table public.rge_os_ask_messages is
  'AnswerEngine turns. role IN (user, assistant). Append-only via API.';
comment on function public.rge_os_ask_session_bump_activity is
  'Trigger bump last_activity_at + message_count on rge_os_ask_messages insert. search_path pinned (CVE-2018-1058).';
