# BASELINE-AUDIT.md — Dossier d'Audit PRÉ-EXÉCUTION Migration noindex RGE-only

**Date** : 2026-04-19
**Script cible** : `scripts/noindex-non-rge.ts`
**Mutation estimée** : ~920K rows (Phase 2) + ~50K rows (Phase 3)
**Durée exécution** : 3-8 minutes (batch 5K, direct Postgres connection, statement_timeout=0)

---

## 1. Queries Read-Only — Exécution dans Supabase SQL Editor

**Instruction** : copier chaque query ci-dessous, exécuter séquentiellement dans Supabase SQL editor, noter les résultats. Aucune query n'est exécutée ici — l'utilisateur les copie-colle lui-même.

### Query 1 — Count total providers par statut

```sql
SELECT
  count(*) FILTER (WHERE is_active = true AND noindex = false) AS indexables_now,
  count(*) FILTER (WHERE is_active = true AND noindex = true)  AS noindex_now,
  count(*) FILTER (WHERE is_active = false) AS inactive_deleted,
  count(*) AS total_providers,
  round(100.0 * count(*) FILTER (WHERE is_active = true AND noindex = false)
       / nullif(count(*) FILTER (WHERE is_active = true), 0), 2) AS pct_indexable_of_active
FROM providers;
```

**Interprétation** : `indexables_now` = rows actuellement en index ; `noindex_now` = rows déjà noindex ; `inactive_deleted` = déjà noindex via migration 330. Attendu post-migration : `indexables_now` ≈ 50K, `noindex_now` ≈ 920K.

### Query 2 — Breakdown RGE expiration

```sql
SELECT
  count(*) FILTER (WHERE is_active = true AND rge_valid_until IS NULL) AS no_rge_data,
  count(*) FILTER (WHERE is_active = true AND rge_valid_until <= now()) AS rge_expired_or_equal_today,
  count(*) FILTER (WHERE is_active = true AND rge_valid_until > now() AND rge_valid_until <= now() + interval '30 days') AS rge_expiring_next_30d,
  count(*) FILTER (WHERE is_active = true AND rge_valid_until > now() + interval '30 days') AS rge_valid_beyond_30d,
  count(*) FILTER (WHERE is_active = true AND rge_valid_until > now()) AS rge_actifs_total
FROM providers;
```

### Query 3 — RGE synchronisé récemment

```sql
SELECT
  count(*) FILTER (WHERE is_active = true AND rge_last_synced_at IS NULL) AS never_synced,
  count(*) FILTER (WHERE is_active = true AND rge_last_synced_at <= now() - interval '90 days') AS synced_over_90d_ago,
  count(*) FILTER (WHERE is_active = true AND rge_last_synced_at > now() - interval '90 days' AND rge_last_synced_at <= now() - interval '7 days') AS synced_7_to_90d_ago,
  count(*) FILTER (WHERE is_active = true AND rge_last_synced_at > now() - interval '7 days') AS synced_last_7d,
  max(rge_last_synced_at) AS max_sync_timestamp
FROM providers;
```

### Query 4 — Distribution organismes RGE

```sql
SELECT
  organisme,
  count(*) AS artisans_count
FROM providers, unnest(rge_organismes) AS organisme
WHERE is_active = true AND rge_valid_until > now()
GROUP BY organisme
ORDER BY artisans_count DESC
LIMIT 10;
```

### Query 5 — Sample 20 rows cible noindex Phase 2

```sql
SELECT
  id, name, is_active, noindex, rge_valid_until, claimed_at, created_at, address_city
FROM providers
WHERE is_active = true
  AND noindex = false
  AND (rge_valid_until IS NULL OR rge_valid_until <= now())
  AND claimed_at IS NULL
ORDER BY random()
LIMIT 20;
```

**RED FLAG** : si `claimed_at IS NOT NULL` dans ce sample → logique Phase 2 cassée.

### Query 6 — Sample 20 RGE actifs

```sql
SELECT
  id, name, is_active, noindex, rge_valid_until, rge_organismes, claimed_at, created_at, address_city
FROM providers
WHERE is_active = true
  AND rge_valid_until > now()
ORDER BY random()
LIMIT 20;
```

### Query 7 — Intersection RGE + claimed

```sql
SELECT count(*) AS overlap_rge_and_claimed
FROM providers
WHERE is_active = true AND rge_valid_until > now() AND claimed_at IS NOT NULL;
```

### Query 8 — Claimed sans RGE

```sql
SELECT count(*) AS claimed_no_rge
FROM providers
WHERE is_active = true
  AND claimed_at IS NOT NULL
  AND (rge_valid_until IS NULL OR rge_valid_until <= now());
```

### Query 9 — Age distribution providers cible noindex

```sql
SELECT
  date_trunc('month', created_at)::date AS creation_month,
  count(*) AS providers_created
FROM providers
WHERE is_active = true
  AND noindex = false
  AND (rge_valid_until IS NULL OR rge_valid_until <= now())
  AND claimed_at IS NULL
GROUP BY date_trunc('month', created_at)
ORDER BY creation_month DESC
LIMIT 12;
```

### Query 10 — Matrix 2×2×2×2 finale

```sql
SELECT
  is_active,
  noindex,
  (claimed_at IS NOT NULL) AS is_claimed,
  (rge_valid_until > now()) AS rge_active,
  count(*) AS row_count
FROM providers
GROUP BY is_active, noindex, (claimed_at IS NOT NULL), (rge_valid_until > now())
ORDER BY row_count DESC;
```

---

## 2. Expected Counts — Baseline référence

| Métrique                   | Attendu  | Source                       |
| -------------------------- | -------- | ---------------------------- |
| Total providers            | 970 326  | Master plan v1.2             |
| RGE actifs (Phase 3 index) | 50 332   | Master plan v1.2 "Tier A"    |
| Claimed (Phase 3 index)    | ~15-20   | Master plan v1.2 "Tier B"    |
| Total index cible          | ~50 347  | 50 332 + overlap négligeable |
| Noindex cible Phase 2      | ~919 979 | 970 326 - 50 347             |
| % noindex cible            | 94,8 %   |                              |

---

## 3. Edge Cases à tester

### EC1 — Artisan RGE expirant AUJOURD'HUI

```sql
SELECT count(*) FROM providers
WHERE is_active = true AND rge_valid_until::date = CURRENT_DATE;
```

**Impact** : bug timezone F1 déjà identifié (script patché `< CURRENT_DATE` / `>= CURRENT_DATE`).

### EC2 — Claimed sans RGE

```sql
SELECT id, name, claimed_at, rge_valid_until FROM providers
WHERE is_active = true AND claimed_at IS NOT NULL
ORDER BY claimed_at DESC LIMIT 10;
```

Phase 3 doit les re-flipper noindex=false via critère `claimed_at IS NOT NULL`.

### EC3 — RGE avec claim pending/rejected

```sql
SELECT p.id, p.name, p.rge_valid_until, pc.status
FROM providers p
LEFT JOIN provider_claims pc ON p.id = pc.provider_id
WHERE p.is_active = true
  AND p.rge_valid_until > now()
  AND pc.status IN ('pending', 'rejected')
LIMIT 10;
```

Claims pending ne comptent pas (claimed_at reste NULL jusqu'à approval).

### EC4 — Soft-deleted

```sql
SELECT count(*) FROM providers WHERE is_active = false;
SELECT count(*) FROM providers WHERE is_active = false AND noindex = false;
```

Le deuxième count doit être 0 (migration 330 backfill).

### EC5 — RGE expirant dans 30 jours

```sql
SELECT count(*), max(rge_valid_until) FROM providers
WHERE is_active = true
  AND rge_valid_until > now()
  AND rge_valid_until <= now() + interval '30 days';
```

**RED FLAG** monitoring — cron ADEME quotidien doit re-évaluer.

### EC6 — NULLs colonnes critiques

```sql
SELECT
  count(*) FILTER (WHERE name IS NULL) AS null_names,
  count(*) FILTER (WHERE is_active IS NULL) AS null_is_active,
  count(*) FILTER (WHERE claimed_at IS NULL) AS null_claimed_at,
  count(*) FILTER (WHERE rge_valid_until IS NULL) AS null_rge_valid_until
FROM providers;
```

`null_is_active` doit être 0.

### EC7 — Doublons SIRET

```sql
SELECT siret, count(*) FROM providers
WHERE is_active = true AND siret IS NOT NULL
GROUP BY siret HAVING count(*) > 1 LIMIT 10;
```

---

## 4. Red Flags — Seuils d'alerte

| Query | Métrique                | Borne min      | Borne max | Action si hors bornes                      |
| ----- | ----------------------- | -------------- | --------- | ------------------------------------------ |
| Q1    | total_providers         | 950 000        | 990 000   | STOP, investiguer DB health                |
| Q1    | indexables_now          | 0              | 100 000   | > 100K = script partiellement exécuté      |
| Q2    | rge_actifs_total        | 40 000         | 60 000    | < 40K = sync ADEME incomplet               |
| Q2    | rge_expiring_next_30d   | 0              | 5 000     | > 5K = créer alert cron monitoring         |
| Q3    | synced_last_7d          | 40K si cron OK | —         | 0 = sync jamais exécuté (OK pré-migration) |
| Q4    | top organisme count     | 5 000          | 30 000    | hors bornes = data quality suspect         |
| Q5    | rows                    | 20             | 20        | < 20 = cible Phase 2 trop réduite          |
| Q7    | overlap_rge_and_claimed | 0              | 100       | > 100 = vérifier join logic                |
| Q8    | claimed_no_rge          | 0              | 500       | > 500 = affecte cible Phase 3              |
| Q10   | count total cellules    | 970K           | 980K      | hors = data inconsistente                  |

---

## 5. Checklist Pré-Exécution (30 min)

### Données

- [ ] Q1 exécutée, `total_providers` noté dans runbook
- [ ] Q2 exécutée, `rge_actifs_total` 40-60K confirmé
- [ ] Q3 exécutée, timestamp sync récent
- [ ] Q10 exécutée, aucune anomalie 16 cellules
- [ ] RED FLAGS documentés (ou "0 RED FLAGS")

### Script

- [ ] Patches A1-A5 appliqués dans `scripts/noindex-non-rge.ts`
- [ ] Patches B1+B2 downstream appliqués et pushés en prod
- [ ] Migration snapshot `providers_noindex_snapshot` appliquée en prod
- [ ] Script `scripts/revert-noindex-non-rge.ts` présent et testé dry-run

### Infra

- [ ] `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_DB_PASSWORD` prêts
- [ ] Test connexion directe Postgres : `nc -zv db.<ref>.supabase.co 5432`
- [ ] Fenêtre d'exécution planifiée en heures creuses (2-4h UTC = 4-6h Paris)
- [ ] User disponible 1h complète sans coupure (pas mobile Termius pendant exec)

### Post-migration

- [ ] Q1 re-exécutée : `indexables_now` ≈ 50K, `noindex_now` ≈ 920K
- [ ] Q9 age distribution cohérente
- [ ] GSC sitemap submit + IndexNow batch lancés

---

## 6. Monitoring Post-Migration (Semaine 1)

| Jour  | Métrique                          | Alerte                           |
| ----- | --------------------------------- | -------------------------------- |
| J+1   | GSC coverage ~50K pages indexées  | >100K ou <40K = indexing issue   |
| J+2-3 | Crawl rate GSC                    | Chute brutale = low crawl demand |
| J+3   | `site:servicesartisans.fr` Google | Ahrefs snapshot baseline         |
| J+7   | Trafic + keywords Ahrefs          | Perte -20% acceptable 1er mois   |
| J+14  | RGE expiring 30j (Q2)             | Baseline pour cron ADEME         |

---

## 7. Timing Estimé

| Phase                             | Durée         |
| --------------------------------- | ------------- |
| Queries 1-10 exécution            | 5-10 min      |
| RED FLAG review + doc             | 10-15 min     |
| Checklist validation              | 5-10 min      |
| Script exécution (Phase 2 + 3)    | 3-8 min       |
| Post-migration queries            | 5-10 min      |
| **Total pré-exec (queries only)** | **25-35 min** |

---

## 8. Fichiers Sources Référence

| Fichier                                                 | Rôle                        |
| ------------------------------------------------------- | --------------------------- |
| `scripts/noindex-non-rge.ts`                            | Script exécutable Phase 2/3 |
| `supabase/migrations/380_rge_ademe_integration.sql`     | Schema RGE                  |
| `supabase/migrations/315_add_noindex_column.sql`        | Schema noindex              |
| `supabase/migrations/330_fix_noindex_default.sql`       | Backfill migration          |
| `docs/ahrefs-audit-2026-04/MASTER-PLAN-00-SYNTHESIS.md` | Master plan v1.2            |
| `src/lib/supabase.ts`                                   | Consommateurs noindex       |

---

**Status** : prêt à exécuter dans Supabase SQL editor dès validation des 4 autres agents.
