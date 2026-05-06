-- 507_cee_dossiers_idempotency_index.sql
-- Audit V1 + V2 (CEE I5) : double dossier draft = double commission Sonergia =
-- risque audit DGCCRF = pivot mandataire mort. Le code TS
-- (dossier-creation.ts:345) fait SELECT-then-INSERT non atomique. Sans
-- contrainte DB, 2 requêtes simultanées créent 2 drafts pour le même
-- (partner_id, email_hash, operation_code, jour). Le caller TS catch déjà
-- 23505 et retourne `status: 'existing'` idempotent — il ne manquait que
-- l'index unique partiel pour activer cette défense.
--
-- Ne couvre QUE status='draft'. Les autres statuts (signed, approved...)
-- doivent pouvoir cohabiter (réutilisation client/partner sur d'autres ops).

CREATE UNIQUE INDEX IF NOT EXISTS uniq_cee_dossiers_draft_idempotent
  ON public.cee_dossiers (
    partner_id,
    client_email_hash,
    operation_code,
    (date_trunc('day', created_at AT TIME ZONE 'Europe/Paris'))
  )
  WHERE status = 'draft';

COMMENT ON INDEX public.uniq_cee_dossiers_draft_idempotent IS
  'Race-safe idempotency : 1 seul draft par (partner, client, operation, jour Paris). Caller TS catch 23505 et retourne existing.';

-- Dispatcher CEE v2 (audit V1 P0-2) : findExistingBrouillon SELECT + createCeeDossier
-- INSERT non atomique. Garantir 1 seul brouillon par devis.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_cee_dossiers_brouillon_per_devis
  ON public.cee_dossiers (devis_id)
  WHERE status = 'brouillon';

COMMENT ON INDEX public.uniq_cee_dossiers_brouillon_per_devis IS
  'Race-safe : 1 seul brouillon par devis_id. dispatcher.ts catch 23505 via createCeeDossier fail-closed.';
