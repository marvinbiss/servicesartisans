# Trigger `sync_provider_noindex` — Design & Feasibility

**Date** : 2026-04-19
**Owner** : Marvin Bissohong (CEO)
**Statut** : Design locked — prêt pour déploiement post-migration one-shot
**Contexte** : après la migration `scripts/noindex-non-rge.ts` (~920 K providers flippés en `noindex=true`), ce trigger + son cron complémentaire garantissent que l'état `noindex` reste cohérent pour toujours, sans intervention manuelle.

---

## 0. Pourquoi ce trigger existe

La migration one-shot passe ~919 K fiches non-RGE non-revendiquées en `noindex=true` et conserve ~50 K fiches RGE actives ou revendiquées en `noindex=false`.

**Problème sans trigger** :

1. Cron ADEME hebdomadaire (`/api/cron/rge-sync`) matche un nouveau SIRET RGE → pose `rge_valid_until > CURRENT_DATE` mais **ne touche pas `noindex`**. Le provider reste désindexé à vie malgré sa certification active.
2. Artisan revendique sa fiche (`claimed_at = now()`) → `noindex` reste à `true` si la fiche était non-RGE pré-claim. Revendication sans effet SEO.
3. Qualification RGE expirée + renouvelée : `rge_valid_until` avance → aucun flip automatique.
4. Artisan désactive son compte (`is_active = false`) → fiche reste indexable.

**Solution** : trigger Postgres `BEFORE INSERT OR UPDATE OF rge_valid_until, rge_qualifications, claimed_at, is_active` qui calcule `NEW.noindex`. Complément : cron quotidien pour l'expiration temporelle (aucun UPDATE n'est émis quand `rge_valid_until` passe naturellement dans le passé).

---

## 1. Spec du trigger

### 1.1 Nom et signature

- **Fonction** : `public.sync_provider_noindex()` — `RETURNS TRIGGER` — `LANGUAGE plpgsql`
- **Trigger** : `trg_providers_sync_noindex` — `BEFORE INSERT OR UPDATE OF rge_valid_until, rge_qualifications, claimed_at, is_active ON public.providers` — `FOR EACH ROW`

### 1.2 Pourquoi BEFORE et pas AFTER

`BEFORE` est obligatoire : on modifie `NEW.noindex` et on retourne la ligne modifiée. Un `AFTER` ne permettrait pas de muter la ligne écrite — il faudrait un second `UPDATE` réentrant, casserait les règles Postgres (récursion) et spammerait `updated_at`.

### 1.3 Règle métier (source de vérité unique)

Un provider est **indexable** (`noindex = false`) si et seulement si :

```
is_active = true
AND (
  rge_valid_until > CURRENT_DATE
  OR claimed_at IS NOT NULL
)
```

Miroir exact du script `scripts/noindex-non-rge.ts` Phase 2/3 (conditions inversées).

### 1.4 Anti-flapping

Google considère un `<lastmod>` qui bouge sans contenu changé comme du spam. On **ne touche à `NEW.noindex` que si la valeur cible diffère de `OLD.noindex`**. Le trigger générique `trigger_providers_updated_at` bumpe `updated_at` sur chaque `UPDATE` — si on ne change pas `noindex` et que l'UPDATE ne concerne qu'une colonne tracée, aucun bump supplémentaire causé par notre fonction.

### 1.5 Colonnes tracées

- `rge_valid_until` — bascule RGE actif/expiré
- `rge_qualifications` — garde-fou si sync ADEME incohérente
- `claimed_at` — revendication artisan
- `is_active` — désactivation admin / soft-delete

`rge_organismes`, `rge_source_url` non tracés (aucun impact).

### 1.6 Ordre relatif aux triggers existants

Postgres exécute les triggers `BEFORE` par ordre alphabétique. Notre trigger `trg_providers_sync_noindex` passe avant `trigger_providers_updated_at` (ordre `trg_* < trigger_*`).

---

## 2. Migration SQL complète

Fichier cible : `supabase/migrations/456_sync_provider_noindex_trigger.sql` (à confirmer au merge, `455` déjà pris par lead exclusivity).

**Règles Supabase SQL editor respectées** :

- Aucun `$$` nu. Délimiteur nommé `$sync_noindex$`.
- Aucun préfixe `refresh_*`.
- Multi-statements séparés par `;` (rejouables indépendamment).
- 100 % idempotent.

```sql
-- =============================================================================
-- Migration 456 — Trigger sync_provider_noindex
-- =============================================================================
-- Automatise la règle noindex post-migration RGE-only (scripts/noindex-non-rge.ts).
--
-- Règle unique : noindex = false SSI is_active = true
--                              AND (rge_valid_until > CURRENT_DATE
--                                   OR claimed_at IS NOT NULL)
--
-- Déclenche : BEFORE INSERT, BEFORE UPDATE OF rge_valid_until, rge_qualifications,
--            claimed_at, is_active.
--
-- Anti-flapping : ne modifie NEW.noindex que si la valeur cible diffère.
--
-- Limite connue : l'expiration temporelle (CURRENT_DATE avance, aucune colonne
-- ne change) N'EST PAS couverte par ce trigger. Un cron quotidien
-- /api/cron/noindex-sweep couvre ce cas (voir section 4).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Fonction
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_provider_noindex()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $sync_noindex$
DECLARE
  v_should_index BOOLEAN;
  v_target_noindex BOOLEAN;
BEGIN
  v_should_index := (
    NEW.is_active = true
    AND (
      (NEW.rge_valid_until IS NOT NULL AND NEW.rge_valid_until > CURRENT_DATE)
      OR NEW.claimed_at IS NOT NULL
    )
  );

  v_target_noindex := NOT v_should_index;

  IF NEW.noindex IS DISTINCT FROM v_target_noindex THEN
    NEW.noindex := v_target_noindex;
  END IF;

  RETURN NEW;
END;
$sync_noindex$;

COMMENT ON FUNCTION public.sync_provider_noindex() IS
  'Maintient providers.noindex cohérent avec la règle RGE-only. noindex=false SSI is_active ET (rge_valid_until>CURRENT_DATE OU claimed_at NOT NULL). Miroir SQL de scripts/noindex-non-rge.ts. Complément requis : cron /api/cron/noindex-sweep quotidien.';

-- -----------------------------------------------------------------------------
-- 2. Trigger (idempotent)
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_providers_sync_noindex ON public.providers;

CREATE TRIGGER trg_providers_sync_noindex
  BEFORE INSERT OR UPDATE OF
    rge_valid_until,
    rge_qualifications,
    claimed_at,
    is_active
  ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_provider_noindex();

COMMENT ON TRIGGER trg_providers_sync_noindex ON public.providers IS
  'BEFORE trigger : recalcule noindex à partir de is_active, rge_valid_until, claimed_at. Nommé trg_* pour passer avant trigger_providers_updated_at (ordre alphabétique Postgres).';

-- -----------------------------------------------------------------------------
-- 3. Backfill one-shot (safety net)
-- -----------------------------------------------------------------------------
-- Au moment d'appliquer cette migration, noindex-non-rge.ts a déjà tourné.
-- Ce bloc couvre les 0-200 providers créés PENDANT l'exécution du script.

DO $migrate_noindex$
DECLARE
  rows_flipped INTEGER;
  total_flipped INTEGER := 0;
  batch_size INTEGER := 5000;
BEGIN
  LOOP
    UPDATE public.providers p
    SET noindex = true
    WHERE p.id IN (
      SELECT id FROM public.providers
      WHERE noindex = false
        AND NOT (
          is_active = true
          AND (
            (rge_valid_until IS NOT NULL AND rge_valid_until > CURRENT_DATE)
            OR claimed_at IS NOT NULL
          )
        )
      LIMIT batch_size
    );
    GET DIAGNOSTICS rows_flipped = ROW_COUNT;
    total_flipped := total_flipped + rows_flipped;
    EXIT WHEN rows_flipped = 0;
    PERFORM pg_sleep(0.1);
  END LOOP;

  RAISE NOTICE 'Migration 456 backfill → noindex: flip-true total %', total_flipped;

  total_flipped := 0;
  LOOP
    UPDATE public.providers p
    SET noindex = false
    WHERE p.id IN (
      SELECT id FROM public.providers
      WHERE noindex = true
        AND is_active = true
        AND (
          (rge_valid_until IS NOT NULL AND rge_valid_until > CURRENT_DATE)
          OR claimed_at IS NOT NULL
        )
      LIMIT batch_size
    );
    GET DIAGNOSTICS rows_flipped = ROW_COUNT;
    total_flipped := total_flipped + rows_flipped;
    EXIT WHEN rows_flipped = 0;
    PERFORM pg_sleep(0.1);
  END LOOP;

  RAISE NOTICE 'Migration 456 backfill → noindex: flip-false total %', total_flipped;
END;
$migrate_noindex$;
```

**Checklist Supabase SQL editor** :

1. Coller bloc 1 (fonction) → Run → check `CREATE FUNCTION`.
2. Coller bloc 2 (trigger) → Run → check `CREATE TRIGGER`.
3. Coller bloc 3 (DO backfill) → Run → check les `NOTICE` (0-500 flips attendus).

---

## 3. Tests attendus

### Cas 1 — INSERT RGE actif → noindex=false

```sql
INSERT INTO providers (id, name, slug, siret, is_active, rge_valid_until)
VALUES (gen_random_uuid(), 'Test RGE Actif', 'test-rge-actif-456', '12345678901234', true, CURRENT_DATE + INTERVAL '90 days')
RETURNING id, noindex;
-- ATTENDU : noindex = false
```

### Cas 2 — UPDATE rge_valid_until à NULL → noindex=true

```sql
UPDATE providers SET rge_valid_until = NULL WHERE slug = 'test-rge-actif-456' RETURNING noindex;
-- ATTENDU : noindex = true
```

### Cas 3 — UPDATE claimed_at=now() sur provider sans RGE → noindex=false

```sql
UPDATE providers SET claimed_at = now() WHERE slug = 'test-rge-actif-456' RETURNING noindex;
-- ATTENDU : noindex = false
```

### Cas 4 — Expiration temporelle (non couverte par trigger)

Les triggers Postgres ne se déclenchent que sur DML. Le simple écoulement du temps n'est pas un événement. **Le cron de section 4 couvre ce cas.**

### Cas 5 — UPDATE qui ne change pas la valeur finale

```sql
-- RGE actif, prolongement 30 jours → reste noindex=false
UPDATE providers SET rge_valid_until = rge_valid_until + INTERVAL '30 days' WHERE slug = 'test-no-flap-456';
-- Le trigger sync_provider_noindex n'a pas ré-écrit noindex (IS DISTINCT FROM = false)
```

### Cas 6 — is_active=false → noindex=true même si RGE actif

```sql
UPDATE providers SET is_active = false WHERE slug = 'test-no-flap-456' RETURNING noindex;
-- ATTENDU : noindex = true
```

### Cleanup

```sql
DELETE FROM providers WHERE slug LIKE 'test-%-456';
```

---

## 4. Cron complémentaire — `/api/cron/noindex-sweep`

### 4.1 Raison d'être

Trigger Postgres ne couvre pas l'expiration temporelle (cas 4). Un artisan dont RGE expire le 2026-12-31 n'aura aucun UPDATE émis au passage 2027-01-01.

### 4.2 Design

- **Endpoint** : `src/app/api/cron/noindex-sweep/route.ts`
- **Fréquence** : `0 3 * * *` UTC (1×/jour)
- **Durée** : 10-60 sec
- **Auth** : `Authorization: Bearer ${CRON_SECRET}`
- **Monitoring** : `Sentry.withMonitor` + heartbeat

### 4.3 Logique (pseudo-code TS)

```ts
export const maxDuration = 60

export async function GET(request: Request) {
  // auth CRON_SECRET ...
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  // Flip vers true les expirations
  const { data: expired } = await supabase
    .from('providers')
    .update({ noindex: true })
    .eq('is_active', true)
    .eq('noindex', false)
    .is('claimed_at', null)
    .or(`rge_valid_until.is.null,rge_valid_until.lte.${today}`)
    .select('id', { count: 'exact', head: true })

  // Flip vers false : recovery si admin a mis noindex=true manuellement sur RGE actif
  const { data: recovered } = await supabase
    .from('providers')
    .update({ noindex: false })
    .eq('is_active', true)
    .eq('noindex', true)
    .or(`rge_valid_until.gt.${today},claimed_at.not.is.null`)
    .select('id', { count: 'exact', head: true })

  return NextResponse.json({ expired: expired?.length, recovered: recovered?.length })
}
```

### 4.4 Coût Supabase

- Volume : ~20-100 rows flippées/jour
- Compute : < 1 sec CPU DB/run → < 30 sec/mois. Négligeable (budget Pro : 5760 CPU-hours/mois).

### 4.5 Ajout dans `vercel.json`

```json
{
  "path": "/api/cron/noindex-sweep",
  "schedule": "0 3 * * *"
}
```

### 4.6 Pourquoi 1×/jour

Google recrawle une fiche désindexée au mieux 1-7 jours après flip. Décalage 12-24h invisible SEO. Hourly = 8760 runs/an gaspillés.

---

## 5. Feasibility studies bonus

### 5.1 Supabase branches dev

Compte **est Pro** (confirmé via `docs/runbook-incident.md:63` "Supabase Pro : snapshot quotidien 7j"). Branches disponibles. Jamais utilisées sur ce projet (grep `supabase branch` → 0 résultat).

**Reco** : **Option A (branche Supabase)** via dashboard. Applique migration 456, teste les 6 cas, merge si OK. Inaugure l'usage des branches.

**Option B (fallback)** : table copy partielle `providers_test_noindex AS SELECT * FROM providers LIMIT 5000`. Moins propre mais testable sans dashboard.

### 5.2 Rate limit IndexNow post-migration

Situation :

- ~50 K pages indexables post-migration (RGE + hubs)
- Cron actuel : 2500 URLs/jour, rotation 3j
- **Pages providers individuelles PAS dans cron IndexNow actuel**

**Script one-shot** `scripts/indexnow-bootstrap-rge.ts` : 50 K URLs / batch 10 K / POST espacés 30 sec = 5 min. Gratuit, risque 429 faible.

**Intégration daily** : section "providers RGE rotated" dans cron indexnow-submit → 50 K / 30 jours = 1 670 URLs/jour, tient dans MAX_URLS_PER_DAY=2500 si réduction rotation devis/tarifs à 50 %.

### 5.3 Log wrapper bash

```bash
mkdir -p logs && LOG="logs/migration-noindex-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG") 2>&1
echo "[$(date -u +%FT%TZ)] START migration noindex RGE-only"
# Lancer ici les étapes
echo "[$(date -u +%FT%TZ)] END"
```

---

## 6. Plan de déploiement

1. **J0** : Exécuter `scripts/noindex-non-rge.ts` (~5-10 min)
2. **J0 + 15 min** : Appliquer migration 456 via Supabase SQL editor (3 blocs)
3. **J0 + 30 min** : Exécuter 6 cas de test section 3
4. **J0 + 1h** : Ajouter cron `noindex-sweep` dans vercel.json + créer route. Deploy.
5. **J1** : Lancer `scripts/indexnow-bootstrap-rge.ts` (50 K URLs)
6. **J+7** : Vérifier GSC Coverage sur 50 K fiches RGE
7. **J+30** : Cron sweep OK × 30 runs. Désactiver flags dev.

---

## 7. Risques & rollback

| Risque                                              | Mitigation                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| Trigger cassé empêche tout UPDATE providers         | Tests 1-6 pré-deploy. Rollback : `DROP TRIGGER trg_providers_sync_noindex` |
| Cron `noindex-sweep` crashe                         | Sentry monitor + heartbeat. Retard max 1 jour sur expirations              |
| Admin force manuellement noindex=true sur RGE actif | Cron recovery re-flip. Solution future : colonne `noindex_manual_override` |
| Migration ADEME nuit → 165K UPDATE × trigger        | O(1) par row, <10 sec ajoutés au run. Acceptable                           |

### Rollback

```sql
DROP TRIGGER IF EXISTS trg_providers_sync_noindex ON public.providers;
DROP FUNCTION IF EXISTS public.sync_provider_noindex();
-- Données noindex déjà flippées restent. Relancer noindex-non-rge.ts si besoin de revert état pré-migration.
```

### Références

- `scripts/noindex-non-rge.ts` — logique Phase 2/3 one-shot
- `supabase/migrations/380_rge_ademe_integration.sql` — colonnes RGE
- `supabase/migrations/315_add_noindex_column.sql` + `330_fix_noindex_default.sql`
- `supabase/migrations/455_lead_exclusivity_enforcement.sql` — pattern trigger BEFORE existant
- `src/lib/rge/sync.ts` — orchestrateur ADEME
- `src/app/api/cron/indexnow-submit/route.ts` — pattern cron Vercel
- `vercel.json` — config cron
- `docs/ahrefs-audit-2026-04/MASTER-PLAN-00-SYNTHESIS.md` §13.6
- `CLAUDE.md` — règles Supabase SQL editor
