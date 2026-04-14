# Security Audit — Migrations CEE 424-432 (PR1)

**Date** : 2026-04-14
**Auditeur** : team-lead (sec-auditor failed idle sans output)
**Status** : **PARTIEL** — audit interrompu context limit. À reprendre.

---

## Verdict : `PASS_AVEC_CORRECTIONS` → corrections livrées dans `433_cee_security_patches.sql`

9 findings identifiés. Migration patch 433 couvre C1/H1/H2/H3/M1/M2/M3.
Reste : L1/L2 (cosmetic) + 4 items "à auditer" (GRANT refs publics, SECURITY DEFINER ✅ vide, injection jsonb, deny anon systematic).

---

## Findings

### CRITICAL

**C1. `cee_mandats` sans policy artisan** — `428:146-151`

- Seule policy : `cee_mandats_admin_all`. Aucune policy artisan self_read.
- Impact : un artisan ne peut pas lire ses propres mandats signés. UX cassée pour espace-artisan/cee.
- Fix : ajouter
  ```sql
  CREATE POLICY cee_mandats_artisan_self_read ON public.cee_mandats
    FOR SELECT TO authenticated
    USING (lead_id IN (
      SELECT id FROM public.cee_leads WHERE artisan_id IN (
        SELECT id FROM public.providers WHERE user_id = auth.uid()
      )
    ));
  ```

### HIGH

**H1. Admin bypass trigger status transition** — `431:145`

- `IF NOT allowed AND (auth.jwt() ->> 'role') <> 'admin'` → admin peut forcer transition illégale.
- Viole règle §1.1 du plan V3 : "Zéro dossier CEE soumis sans QA passée" — responsabilité solidaire CA Paris 2024.
- Fix : retirer la clause OR. Si admin doit forcer, passer par RPC SECURITY DEFINER auditée.

**H2. `cee_dossier_events` pas append-only** — `431:279-295`

- Policy `admin_all` permet UPDATE/DELETE sur audit trail. Un admin compromis peut effacer traces.
- Fix : remplacer `cee_dossier_events_admin_all` par `admin_read_only` (FOR SELECT) + trigger `BEFORE UPDATE OR DELETE` qui RAISE EXCEPTION sauf via fonction SECURITY DEFINER dédiée.

**H3. `mv_cee_partners_tam` expose PII sans filtre** — `430:104-140`

- MV contient email, phone, siret de tous les providers. Les MV Postgres **ne respectent pas RLS**. Si exposée via PostgREST ou policy parent, fuite garantie.
- Fix : soit revoke SELECT au rôle `authenticated`/`anon` (laisser service_role only), soit materialiser en table + RLS + populate via RPC admin.
- Check : `GRANT SELECT ON public.mv_cee_partners_tam TO service_role;` + `REVOKE ALL ON public.mv_cee_partners_tam FROM authenticated, anon, public;`

### MEDIUM

**M1. `mv_cee_dossiers_stats` agrégats cross-tenant exposés** — `431:300-316`

- Si PostgREST expose la MV, un artisan peut voir partner_id d'autres partenaires.
- Fix : REVOKE comme H3, ou ajouter RPC avec filtre `partner_id IN (SELECT id FROM cee_artisan_partners WHERE user_id = auth.uid())`.

**M2. `email_outbox_cee` pas de purge dead-letter** — `429:36-63`

- PII dans `payload jsonb` conservée indéfiniment après `status='dead'`.
- Fix : cron hebdo DELETE WHERE status='dead' AND dead_letter_at < now() - interval '30 days'.

**M3. `cee_dossiers.expires_at` pas de cron purge** — `431:85`

- Default 10 ans OK (R.221-1). Mais aucun trigger/cron pour delete après expiration. Accumulation PII.
- Fix : cron mensuel DELETE WHERE expires_at < now(). Idem `cee_leads` (3 ans), `cee_simulator_events` (90j).

### LOW

**L1. `cee_simulator_events.ip_hash` pas de commentaire format** — `429:20` (HOWTO nuit à l'implem).
**L2. IBAN encryption key pas documentée** — `430:64` commentaire dit `CEE_IBAN_KEY` mais env var non créée.

### INFO

**I1. Ordre d'application critique** : 425 (enums) AVANT 428/430/431. 424 AVANT 426/428/431. 430 AVANT 431. Numérique OK mais à documenter dans README.

---

## Checklist 12 points

| #   | Point                          | Status                         |
| --- | ------------------------------ | ------------------------------ |
| 1   | RLS couverture toutes tables   | ⚠️ `cee_mandats` gap artisan   |
| 2   | Cross-tenant leakage           | ⚠️ MV TAM + stats (H3, M1)     |
| 3   | PII chiffrement bytea pgcrypto | ✅                             |
| 4   | RGPD expires_at + purge        | ⚠️ purge cron absente (M2, M3) |
| 5   | Trigger transition status      | ⚠️ admin bypass (H1)           |
| 6   | CHECK regex bypass             | ✅                             |
| 7   | Idempotence                    | ✅                             |
| 8   | Seed PII                       | ✅ (pas de seed)               |
| 9   | GRANT/REVOKE explicite         | ❌ manquant sur MV (H3)        |
| 10  | DLQ email_outbox limit         | ✅ attempts<=5                 |
| 11  | FK tardive documentée          | ✅ (428.3)                     |
| 12  | Rollback cee_market_prices     | ⚠️ à vérifier post-apply       |

---

## TL;DR

Verdict **PASS_AVEC_CORRECTIONS**. 1 CRITICAL (mandats RLS artisan), 3 HIGH (admin bypass transition, audit trail mutable, MV TAM PII), 3 MEDIUM (purges RGPD, agrégats MV), 2 LOW. Aucun blocker schéma. À corriger dans migration 433 patch avant apply prod.

**Reste à auditer** (non fait, context limit) :

- Policy deny anon vérifiée sur chaque table (spot-check OK, systematic check manquant)
- SECURITY DEFINER functions : aucune créée → OK
- GRANT details sur forfaits/refs : à trancher (public read pour simulateur anon ?)
- Injection SQL via payload jsonb : revue manuelle pending
