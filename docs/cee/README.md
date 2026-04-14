# Pivot Mandataire CEE — DDL 420 → 425

## Contenu
- `420_425_cee_mandataire.sql` — DDL complet (6 migrations, idempotent)
- `rollback_420_425.sql` — Rollback complet (ordre inverse)
- `smoke_tests_420_425.sql` — 20 requêtes de vérification post-migration

## Ordre d'exécution (obligatoire)
1. **420** — Référentiels temporels (`cee_operations_ref`, `cee_forfaits`, `cee_spot_prices`, `revenus_plafonds`, `zones_climatiques_ref`)
2. **421** — ENUMs (`cee_lead_status`, `categorie_revenus`, `zone_climatique`)
3. **422** — `devis` + colonnes CEE (FK vers 420)
4. **423** — `providers` + colonnes MAR + `mar_staging`
5. **424** — `cee_leads` + `cee_mandats` (FK tardive vers `devis.cee_lead_id`)
6. **425** — Observabilité (`cee_simulator_events`, `email_outbox_cee`, vues MV)

## Prérequis
- Postgres 15 (Supabase)
- Extension `pgcrypto` (créée par 425 — `digest()` utilisé dans `cee_leads.email_hash`)
  - **Important** : si vous exécutez 424 seul avant 425, ajoutez `CREATE EXTENSION IF NOT EXISTS pgcrypto;` en tête.
- Fonction `public.set_updated_at()` existante (trigger générique du projet)
- Tables existantes : `providers`, `devis`
- Rôle `authenticated` configuré avec JWT contenant `role` et `provider_id`

## Application
```bash
# Option A — Supabase CLI (recommandé en staging)
supabase db push

# Option B — SQL editor (prod) : splitter le fichier en 6 blocs BEGIN/COMMIT
```

## Post-migration
```bash
psql "$DB_URL" -f smoke_tests_420_425.sql  # doit renvoyer 20 OK
```

## Rollback
```bash
psql "$DB_URL" -f rollback_420_425.sql
```
**Attention** : le rollback supprime `cee_leads` et `cee_mandats` (perte de données).
À n'utiliser qu'en staging ou fenêtre de maintenance validée.

## Conventions appliquées
- Montants en **INTEGER centimes** (jamais NUMERIC)
- Timestamps **TIMESTAMPTZ** + indexés pour requêtes récentes
- Policies RLS : `{table}_{role}_{action}` (ex: `cee_leads_artisan_select_own`)
- Purge RGPD via `expires_at` (cron à programmer séparément)
- Pattern atomic swap disponible via `mar_staging`
