-- =============================================================
-- Audit DB orphelins post-pivot RGE (mig 489 + 490)
-- =============================================================
-- 2026-05-02 — À coller dans Supabase SQL editor (split par bloc).
--
-- Contexte : mig 490 a DELETE 120 271 providers Tier C. Les FK CASCADE ont
-- propagé. Les FK ON DELETE SET NULL ont laissé provider_id IS NULL.
-- Ce script CHIFFRE les résidus orphelins avant toute suppression.
-- AUCUN DELETE ici — read-only diagnostic.
--
-- 3 catégories vérifiées :
--   A. provider_id NULL hérité (FK SET NULL) → bookings, analytics_events,
--      lead_events. Storage non critique mais signal de garbage.
--   B. Données denormalisées sur specialty supprimée (16 métiers tués) →
--      lead_dispatches, leads anciens, audit_logs.
--   C. Tables sans FK directe mais avec specialty/service_slug texte.
-- =============================================================

-- ─── A1. Bookings orphelines (provider_id NULL après SET NULL) ─────────
SELECT 'bookings_orphan_provider_null' AS check_name, COUNT(*) AS n
FROM bookings
WHERE provider_id IS NULL;

-- ─── A2. Analytics events orphelins ─────────────────────────────────────
SELECT 'analytics_events_orphan_provider_null' AS check_name, COUNT(*) AS n
FROM analytics_events
WHERE provider_id IS NULL;

-- ─── A3. Lead events orphelins ──────────────────────────────────────────
SELECT 'lead_events_orphan_provider_null' AS check_name, COUNT(*) AS n
FROM lead_events
WHERE provider_id IS NULL;

-- ─── B1. Leads anciens avec specialty tuée (texte denormalisé) ──────────
-- Adapter le nom de colonne (`specialty`, `service`, `metier`) selon schéma réel.
SELECT 'leads_with_killed_specialty' AS check_name,
       service AS specialty,
       COUNT(*) AS n
FROM leads
WHERE service IN (
  'solier', 'terrassier', 'metallier', 'ferronnier', 'poseur-de-parquet',
  'miroitier', 'storiste', 'architecte-interieur', 'decorateur', 'domoticien',
  'pisciniste', 'antenniste', 'ascensoriste', 'geometre',
  'desinsectisation', 'deratisation'
)
GROUP BY service
ORDER BY n DESC;

-- ─── B2. Lead dispatches sur specialty tuée ─────────────────────────────
SELECT 'lead_dispatches_killed_specialty' AS check_name,
       service_slug,
       COUNT(*) AS n
FROM lead_provider_dispatches
WHERE service_slug IN (
  'solier', 'terrassier', 'metallier', 'ferronnier', 'poseur-de-parquet',
  'miroitier', 'storiste', 'architecte-interieur', 'decorateur', 'domoticien',
  'pisciniste', 'antenniste', 'ascensoriste', 'geometre',
  'desinsectisation', 'deratisation'
)
GROUP BY service_slug
ORDER BY n DESC;

-- ─── C1. Provider_views avec provider_id introuvable ────────────────────
-- (Anti-orphelin : FK CASCADE devrait avoir nettoyé, mais on vérifie.)
SELECT 'provider_views_with_dangling_id' AS check_name, COUNT(*) AS n
FROM provider_views pv
WHERE NOT EXISTS (SELECT 1 FROM providers p WHERE p.id = pv.provider_id);

-- ─── C2. Reviews avec provider_id introuvable ───────────────────────────
SELECT 'reviews_with_dangling_provider' AS check_name, COUNT(*) AS n
FROM reviews r
WHERE NOT EXISTS (SELECT 1 FROM providers p WHERE p.id = r.provider_id);

-- ─── C3. Provider_claims pending sur provider supprimé ──────────────────
SELECT 'claims_dangling_provider' AS check_name, COUNT(*) AS n
FROM provider_claims pc
WHERE NOT EXISTS (SELECT 1 FROM providers p WHERE p.id = pc.provider_id);

-- =============================================================
-- Lecture des résultats :
--   - n = 0 partout → DB propre, aucune action.
--   - A1-A3 > 0 → orphelins SET NULL (acceptable, pas critique).
--     Si volume gênant : DELETE ciblé après confirmation usage.
--   - B1-B2 > 0 → données mortes sur specialties tuées. Candidates
--     à archivage/suppression dans une migration dédiée.
--   - C1-C3 > 0 → BUG FK CASCADE manquée → escalade urgente.
-- =============================================================
