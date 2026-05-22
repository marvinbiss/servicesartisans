# Gates Sprint 1-5

Suivi quotidien des objectifs Sprint 1-5 stratégie 20/80 rénovation
(memory `servicesartisans-strategie-20-80-revenu-2026-05-06.md`).

Chaque gate écrit un JSON `tmp/gate-s{1..5}-{ISO}.json` au format :

```json
{
  "gate": "S1",
  "metric": "vmc_cluster_clicks_30d",
  "current": 0,
  "baseline": 360,
  "delta_pct": 0,
  "target_pct": 30,
  "passed": false,
  "checked_at": "2026-05-22T12:34:56.789Z",
  "notes": "..."
}
```

Exit code : `0` = PASS, `1` = FAIL data, `2` = FAIL infra.

## Liste des gates

| ID  | Script                       | Métrique                                         | Source de vérité                                          |
| --- | ---------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| S1  | `sprint1-vmc-clicks.ts`      | Clics 30j cluster `/renovation-energetique/vmc/` | CSV GSC paste manuel (`tmp/gsc-vmc-export.csv`)           |
| S2  | `sprint2-pac-rewrite-vol.ts` | Volume cumulé top 20 cluster PAC                 | CSV Ahrefs Organic Keywords (`tmp/ahrefs-pac-rerank.csv`) |
| S3  | `sprint3-dpe-indexed.ts`     | 8 pages DPE (hub + classes A→G) indexables       | HTTP GET avec User-Agent Googlebot                        |
| S4  | `sprint4-pac-leads.ts`       | Leads PAC 30j (`devis_requests`)                 | Supabase service_role                                     |
| S5  | `sprint5-embeds-tier1.ts`    | Refdomains DR≥50 baromètre + outreach `live`     | Ahrefs API + `docs/outreach/sprint5-tracking.md`          |

## Variables d'environnement

### Communes

- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (gate S4) — lecture `.env.local`

### Spécifiques

| Var                    | Gate | Défaut                                                              |
| ---------------------- | ---- | ------------------------------------------------------------------- |
| `GSC_VMC_CSV`          | S1   | `tmp/gsc-vmc-export.csv`                                            |
| `GSC_VMC_BASELINE`     | S1   | `12` (clics/jour → 360 sur 30j)                                     |
| `AHREFS_PAC_CSV`       | S2   | `tmp/ahrefs-pac-rerank.csv`                                         |
| `PAC_VOL_TARGET`       | S2   | `50000`                                                             |
| `PAC_POS_MAX`          | S2   | `20`                                                                |
| `DPE_BASE_URL`         | S3   | `https://servicesartisans.fr`                                       |
| `PAC_LEADS_TARGET`     | S4   | `100`                                                               |
| `AHREFS_API_TOKEN`     | S5   | fallback `~/.secrets/ahrefs.env` (cf. CLAUDE.md)                    |
| `SPRINT5_TARGET_URL`   | S5   | `https://servicesartisans.fr/barometre/renovation-energetique-2026` |
| `SPRINT5_TRACKING_MD`  | S5   | `docs/outreach/sprint5-tracking.md`                                 |
| `SPRINT5_TIER1_TARGET` | S5   | `1`                                                                 |
| `SPRINT5_LIVE_TARGET`  | S5   | `3`                                                                 |

## Usage

### Gate individuel

```bash
npx tsx scripts/gates/sprint1-vmc-clicks.ts
npx tsx scripts/gates/sprint3-dpe-indexed.ts
```

### Tous les gates (recommandé)

```bash
npx tsx scripts/gates/run-all-gates.ts
```

Produit `tmp/gates-status-{ISO}.json` avec le récap, exit `0` si tous PASS.

## Cron daily

Pattern recommandé (Vercel cron — `vercel.json` `crons` array, cf. `/api/cron/healthcheck`) :

- Cible : un endpoint API `/api/cron/gates-daily` (à créer) qui spawn les gates et upload les
  résultats en DB (table `seo_gate_runs`, mig à créer).
- Schedule : `0 7 * * *` (07h UTC = 09h Paris l'été, après la mise à jour quotidienne GSC).
- En attendant l'endpoint, exécution manuelle quotidienne via `run-all-gates.ts`.

Les gates qui dépendent de paste manuel (S1, S2) doivent rester côté script local — GSC ne peut
pas être pull depuis le runtime Vercel (rate limit + auth OAuth).

## Lecture des résultats

```bash
# Dernier run de chaque gate
ls tmp/gate-s1-*.json | sort | tail -1 | xargs cat | jq .

# Récap global le plus récent
ls tmp/gates-status-*.json | sort | tail -1 | xargs cat | jq '{overall_passed, passed, failed}'
```

## Anti-régression

- Les gates ne mockent JAMAIS leurs sources. Si une source est down (Ahrefs API, Supabase,
  CSV manquant), le gate **FAIL loudly** plutôt que de retourner `current: 0` silencieux.
- Aucune écriture en DB depuis ces scripts — read-only.
- Pas de credentials en clair : `.env.local` (Supabase) + `~/.secrets/ahrefs.env` (Ahrefs).
