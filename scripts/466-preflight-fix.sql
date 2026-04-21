-- Preflight cleanup for migration 466 (UNIQUE providers email/siret)
-- =============================================================================
-- Stratégie : on garde le provider le plus "riche" (revendiqué > vérifié > actif
-- > plus ancien id) et on NULL-out le champ en conflit sur les autres.
-- Aucune suppression de ligne — l'entité reste pour les références externes
-- (reviews, leads, etc.) mais perd la clé conflictuelle.
--
-- Exécution :
--   psql $SUPABASE_DB_URL -f scripts/466-preflight-fix.sql
-- ou copier-coller dans le SQL editor Supabase (splitter les statements,
-- cf rule feedback_supabase_sql_editor_quirks).
--
-- Idempotent : si déjà nettoyé, aucun UPDATE n'a d'effet.

BEGIN;

-- Dump des doublons avant cleanup (pour audit)
DO $$
DECLARE
  dup_email_groups INT;
  dup_siret_groups INT;
BEGIN
  SELECT COUNT(*) INTO dup_email_groups
  FROM (
    SELECT email FROM providers
    WHERE email IS NOT NULL AND email <> ''
    GROUP BY email HAVING COUNT(*) > 1
  ) AS e;

  SELECT COUNT(*) INTO dup_siret_groups
  FROM (
    SELECT siret FROM providers
    WHERE siret IS NOT NULL AND siret <> ''
    GROUP BY siret HAVING COUNT(*) > 1
  ) AS s;

  RAISE NOTICE 'Before cleanup: % duplicate-email group(s), % duplicate-siret group(s)',
    dup_email_groups, dup_siret_groups;
END;
$$ LANGUAGE plpgsql;

-- NULL out les emails dupliqués sauf la "meilleure" ligne de chaque groupe.
-- Ranking : claimed_at NOT NULL (desc), is_verified (desc), is_active (desc), id asc
WITH ranked AS (
  SELECT
    id,
    email,
    ROW_NUMBER() OVER (
      PARTITION BY email
      ORDER BY
        (claimed_at IS NOT NULL) DESC,
        is_verified DESC NULLS LAST,
        is_active DESC NULLS LAST,
        id ASC
    ) AS rn
  FROM providers
  WHERE email IS NOT NULL AND email <> ''
)
UPDATE providers p
SET email = NULL
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

-- Même logique pour siret
WITH ranked AS (
  SELECT
    id,
    siret,
    ROW_NUMBER() OVER (
      PARTITION BY siret
      ORDER BY
        (claimed_at IS NOT NULL) DESC,
        is_verified DESC NULLS LAST,
        is_active DESC NULLS LAST,
        id ASC
    ) AS rn
  FROM providers
  WHERE siret IS NOT NULL AND siret <> ''
)
UPDATE providers p
SET siret = NULL
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

-- Vérification finale
DO $$
DECLARE
  remaining_email INT;
  remaining_siret INT;
BEGIN
  SELECT COUNT(*) INTO remaining_email FROM (
    SELECT email FROM providers
    WHERE email IS NOT NULL AND email <> ''
    GROUP BY email HAVING COUNT(*) > 1
  ) AS e;
  SELECT COUNT(*) INTO remaining_siret FROM (
    SELECT siret FROM providers
    WHERE siret IS NOT NULL AND siret <> ''
    GROUP BY siret HAVING COUNT(*) > 1
  ) AS s;
  IF remaining_email > 0 OR remaining_siret > 0 THEN
    RAISE EXCEPTION 'Cleanup incomplete : % email / % siret groups remain', remaining_email, remaining_siret;
  END IF;
  RAISE NOTICE 'Cleanup OK. Ready to apply migration 466.';
END;
$$ LANGUAGE plpgsql;

COMMIT;
