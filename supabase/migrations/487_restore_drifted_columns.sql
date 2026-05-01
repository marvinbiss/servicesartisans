-- Migration 487 : Restore 45 colonnes manquantes (drift hors-Git accumulé)
-- Total : 11 tables × N colonnes = 45 ADD COLUMN IF NOT EXISTS
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Audit `scripts/audit-schema-drift.mjs` (commit `46b154d39`, rewriten en
-- `d72747e1f` pour utiliser PostgREST OpenAPI service_role) a découvert
-- 45 colonnes référencées dans le code TypeScript mais absentes en prod.
-- Causes accumulées : DROP COLUMN manuels via Supabase dashboard + migrations
-- committées non appliquées + renames hors-Git. 4e incident structurel
-- documenté en mémoire `servicesartisans-schema-drift-audit-2026-05-01.md`.
--
-- DECISION
-- --------
-- Mirror exact des migrations 474, 483, 486 : ADD COLUMN IF NOT EXISTS
-- idempotent, types alignés avec les TS interfaces TypeScript existantes
-- (single source of truth applicative), nullable par défaut pour ne pas
-- bloquer l'INSERT existant. Pas de FK ajouté ici (risque de violation
-- si données orphelines), à ajouter dans une mig séparée si requis.
--
-- IMPACT IMMÉDIAT
-- ---------------
-- - bookings.{client_name, client_email, client_phone, artisan_id, slot_id} :
--   débloque les 9 routes API booking (artisan dashboard, admin, cancel,
--   reschedule, client list). Actuellement 500 silencieux à chaque appel.
-- - audit_logs.{metadata, resource_type, resource_id, new_value} :
--   débloque admin-stats-service. Logs admin auparavant invisibles.
-- - cee_dossiers.{kwhc_estime, prime_estimee_eur, devis_id, delegataire_id,
--   justificatifs} + cee_dossier_events.{from_status, to_status, actor_type}
--   + cee_operations.{non_cumulable_avec, public_cible} :
--   débloque la brique mandataire CEE (cron cee-relance, dispatcher,
--   qualify, justificatifs, espace-artisan/cee). Actuellement le cron
--   `cee-dossier-transitions` log error 1×/h, vraisemblablement lié.
-- - prospection_contacts.{bloctel_listed, consent_proof, bloctel_checked_at} :
--   RGPD-critique pour message-queue + bloctel.ts. Conformité.
-- - providers.{bio, faq, services_offered, service_prices, opening_hours,
--   phone_secondary, intervention_radius_km, accepts_new_clients, free_quote,
--   available_24h, team_size, specialty_slug} : restaure l'espace artisan
--   profil (artisan-profile-service.ts).
-- - messages.{read_at, message_type, file_url, file_name, file_size}
--   + conversations.{quote_id, unread_count} : restaure le chat
--   (chat-service.ts, messages-service.ts).
-- - services.{category, sort_order} : restaure search/suggestions (recherche
--   par catégorie) + admin-crud-service.listServices/getServiceById.
-- - provider_removal_requests.requester_siret : RGPD provider removal flow.
--
-- IDEMPOTENT
-- ----------
-- - ADD COLUMN IF NOT EXISTS : no-op si la colonne existe déjà.
-- - Aucun DEFAULT hors `false`/`true`/`'{}'`/`'[]'` pour ne pas réécrire les
--   lignes existantes.
-- - Pas de NOT NULL → tout est nullable, le code applicatif gère déjà les `null`.
-- - Reload PostgREST schema en fin pour propager le cache (≤10 min).
--
-- ROLLBACK
-- --------
-- DROP COLUMN public.<table>.<col>; pour chacune. Idempotent dans l'autre sens.
-- Voir `supabase/migrations/rollback/487_*.sql` (à créer si requis).

-- ----------------------------------------------------------------------------
-- bookings : 5 cols (client_*, artisan_id, slot_id)
-- ----------------------------------------------------------------------------
-- Types inférés depuis `src/lib/services/bookings-service.ts` BookingRow,
-- BookingForCancel, BookingForReschedule. Tous nullable (cas client anonyme,
-- slot direct sans availability_slots).
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS client_name        TEXT,
  ADD COLUMN IF NOT EXISTS client_email       TEXT,
  ADD COLUMN IF NOT EXISTS client_phone       TEXT,
  ADD COLUMN IF NOT EXISTS artisan_id         UUID,
  ADD COLUMN IF NOT EXISTS slot_id            UUID;

-- ----------------------------------------------------------------------------
-- audit_logs : 4 cols (admin logging)
-- ----------------------------------------------------------------------------
-- Types alignés avec CLAUDE.md projet ("audit_logs: user_id, action,
-- resource_type, resource_id, old_value, new_value, metadata"). resource_id
-- TEXT (pas UUID) car certains resources sont identifiés par slug/code.
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS resource_type      TEXT,
  ADD COLUMN IF NOT EXISTS resource_id        TEXT,
  ADD COLUMN IF NOT EXISTS new_value          JSONB,
  ADD COLUMN IF NOT EXISTS metadata           JSONB DEFAULT '{}'::jsonb;

-- ----------------------------------------------------------------------------
-- cee_dossiers : 5 cols (mandataire CEE)
-- ----------------------------------------------------------------------------
-- Types depuis `src/lib/cee/dossier-types.ts` CeeDossier interface.
-- justificatifs JSONB[] avec default '[]' pour ne pas casser INSERT existants.
ALTER TABLE public.cee_dossiers
  ADD COLUMN IF NOT EXISTS devis_id           UUID,
  ADD COLUMN IF NOT EXISTS delegataire_id     UUID,
  ADD COLUMN IF NOT EXISTS kwhc_estime        NUMERIC,
  ADD COLUMN IF NOT EXISTS prime_estimee_eur  NUMERIC,
  ADD COLUMN IF NOT EXISTS justificatifs      JSONB DEFAULT '[]'::jsonb;

-- ----------------------------------------------------------------------------
-- cee_dossier_events : 3 cols (audit trail mandataire)
-- ----------------------------------------------------------------------------
-- Types depuis CeeDossierEvent interface. from_status/to_status nullable
-- (events qui ne sont pas des status_change).
ALTER TABLE public.cee_dossier_events
  ADD COLUMN IF NOT EXISTS from_status        TEXT,
  ADD COLUMN IF NOT EXISTS to_status          TEXT,
  ADD COLUMN IF NOT EXISTS actor_type         TEXT;

-- ----------------------------------------------------------------------------
-- cee_operations : 2 cols (catalogue CEE enrichi)
-- ----------------------------------------------------------------------------
-- public_cible : "tous", "particuliers", "tertiaire" — TEXT plus simple
-- qu'un enum (peut évoluer avec arrêtés).
-- non_cumulable_avec : TEXT[] de codes opération CEE incompatibles.
ALTER TABLE public.cee_operations
  ADD COLUMN IF NOT EXISTS public_cible       TEXT,
  ADD COLUMN IF NOT EXISTS non_cumulable_avec TEXT[] DEFAULT '{}';

-- ----------------------------------------------------------------------------
-- prospection_contacts : 3 cols (RGPD bloctel)
-- ----------------------------------------------------------------------------
-- bloctel_listed : true si numéro inscrit Bloctel → opt-out automatique.
-- consent_proof : trace consentement (date, source, IP, etc.) RGPD.
-- bloctel_checked_at : dernière vérification Bloctel (≤ 90j typiquement).
ALTER TABLE public.prospection_contacts
  ADD COLUMN IF NOT EXISTS bloctel_listed     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bloctel_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_proof      JSONB;

-- ----------------------------------------------------------------------------
-- providers : 12 cols (espace artisan profile)
-- ----------------------------------------------------------------------------
-- Types depuis `src/lib/services/artisan-profile-service.ts` ProviderProfileRow.
-- bio : description longue (markdown), faq : Q&A array, services_offered :
-- list de services, service_prices : tarif par service, opening_hours :
-- 7j × créneaux, intervention_radius_km : rayon en km, team_size : effectif.
-- specialty_slug : doublon de specialty pour slug-friendly (ville+slug index).
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS bio                       TEXT,
  ADD COLUMN IF NOT EXISTS faq                       JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_offered          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_prices            JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS opening_hours             JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS phone_secondary           TEXT,
  ADD COLUMN IF NOT EXISTS intervention_radius_km    INTEGER,
  ADD COLUMN IF NOT EXISTS accepts_new_clients       BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS free_quote                BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS available_24h             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS team_size                 INTEGER,
  ADD COLUMN IF NOT EXISTS specialty_slug            TEXT;

-- ----------------------------------------------------------------------------
-- messages : 5 cols (chat enrichi)
-- ----------------------------------------------------------------------------
-- read_at : timestamp lecture pour read-receipts.
-- message_type : 'text' (default) | 'file' | 'image' | 'system'.
-- file_url, file_name, file_size : metadata pièce jointe.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS message_type       TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS file_url           TEXT,
  ADD COLUMN IF NOT EXISTS file_name          TEXT,
  ADD COLUMN IF NOT EXISTS file_size          BIGINT;

-- ----------------------------------------------------------------------------
-- conversations : 2 cols (chat metadata)
-- ----------------------------------------------------------------------------
-- quote_id : conversation rattachée à un devis (UI link back).
-- unread_count : compteur dénormalisé pour badge UI sans count(*) coûteux.
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS quote_id           UUID,
  ADD COLUMN IF NOT EXISTS unread_count       INTEGER DEFAULT 0;

-- ----------------------------------------------------------------------------
-- services : 2 cols (category, sort_order)
-- ----------------------------------------------------------------------------
-- `sort_order` a été créé en mig 311 (`ALTER TABLE services ADD COLUMN IF
-- NOT EXISTS sort_order integer DEFAULT 0`) puis droppé hors-Git à un moment
-- inconnu. L'audit OpenAPI confirme l'absence en prod. Re-ADD avec DEFAULT 0
-- pour que les inserts existants ne cassent pas.
-- `category` : TEXT nullable, utilisé par admin-crud-service + suggestions.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category           TEXT,
  ADD COLUMN IF NOT EXISTS sort_order         INTEGER DEFAULT 0;

-- ----------------------------------------------------------------------------
-- provider_removal_requests : 1 col (RGPD)
-- ----------------------------------------------------------------------------
-- requester_siret : SIRET fournis par le demandeur de suppression de fiche.
-- Permet de croiser avec providers.siret pour vérifier la légitimité.
ALTER TABLE public.provider_removal_requests
  ADD COLUMN IF NOT EXISTS requester_siret    TEXT;

-- ----------------------------------------------------------------------------
-- Reload PostgREST schema cache (sinon les SELECT continuent à 42703 ~10min)
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
