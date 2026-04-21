# Audit Base de Données Supabase — ServicesArtisans 2026-04-21

**Verdict : 4.5/10 — CRITIQUE**

## Top 10 problèmes

1. **Collisions migrations** — Doublets `365_newsletter_subscribers.sql` + `365_provider_claims_claimant_columns.sql`, `330_fix_noindex_default.sql` + `330_massive_naf_specialty_mapping.sql`. État prod divergent. 🔴 **CORRUPTION POTENTIELLE**.

2. **RLS désactivée sur 145 tables / 217** — `prospection_messages`, `prospection_contacts`, `prospection_campaigns`, etc. Clé `anon` lit/insère leads, emails artisans, messages clients. **GDPR violation massive**.

3. **`is_admin()` SECURITY DEFINER sans `SET search_path`** — `001_base_schema.sql` + `307_fix_is_admin_grants.sql` half-patched + `302_critical_security_fixes.sql` `format()` restant dangereux. Privilege escalation.

4. **`providers.email` + `providers.siret` non UNIQUE** — 970K providers, doublons possibles, spam cron x50, confusion identité.

5. **112 contraintes `ON DELETE CASCADE`** — supprimer provider = perdre lead_assignments + reviews + audit_logs. Aucun archivage pré-delete.

6. **PostgREST max-rows 1000 vs sitemap attend 25K** — avant `457_provider_sitemap_rpc.sql`, 25 requêtes au lieu d'une. Sitemap RGE 94% URLs manquantes.

7. **`format()` non audité sur tous appels** — `302_critical_security_fixes.sql:42-44`, `455_lead_exclusivity_enforcement.sql:72`. `%I`/`%s` échappés OK, mais audit complet absent.

8. **Variables PL/pgSQL mélangées `v_*`** — `363_fix_dispatch_location.sql`. Pas de linter `SET search_path` + préfixe `_` (cf memory Supabase auto-RLS).

9. **Audit_logs FK sur `auth.users` pas `profiles`** — orphans possibles si Supabase nettoie auth.users.

10. **RGE sync stale 14j+** — `/api/cron/sitemap-health:51-60` log mais pas de circuit-breaker. Google crawl providers obsolètes → soft 404.

## Migrations suspectes

| Migration | Verdict                        |
| --------- | ------------------------------ |
| 330 (×2)  | 🔴 collision                   |
| 365 (×2)  | 🔴 collision                   |
| 302/303   | 🟡 partiel                     |
| 361-363   | 🟠 dispatch complexe peu testé |
| 385-389   | 🟠 RGE bulk sans backoff       |
| 414-417   | 🟢 reviews RLS OK              |
| 455       | 🟢 lead exclusivity OK         |
| 457       | 🟢 sitemap RPC OK              |

## Quick Wins 24h

1. **Renommer collisions** — `365_a_*`, `365_b_*` + audit drift prod via `SELECT migration FROM schema_migrations ORDER BY version`.
2. **UNIQUE constraints** providers — migration 465 idempotente : `ALTER TABLE providers ADD CONSTRAINT uniq_email UNIQUE (email) WHERE email IS NOT NULL;` + idem siret.
3. **Enable RLS sur 145 tables** — script audit + `ALTER ... ENABLE RLS; CREATE POLICY deny_all FOR SELECT USING (FALSE);` + allowlist.

Coût non-adressé estimé : **€50K/an** (support churn + SEO loss + risque GDPR).
