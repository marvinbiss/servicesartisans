# Audit Ahrefs SEO — Phase 0 Domination — 2026-05-03

**Statut** : Phase 0 livrée à 95% complétude — prêt pour décision stratégique Phase 1.
**Quota Ahrefs consommé** : ~95K unités sur 1M cycle (2026-05-18 reset).
**Plan stratégique référencé** : option A « Domination » 12 mois, cible 8K-12K clics/jour, DR 22-32, run-rate 1.17M€/an mandataire CEE + leads RGE.
**Mémoire associée** : `~/.claude/projects/C--Users-USER/memory/servicesartisans-phase0-audit-2026-05-03.md`

---

## Périmètre couvert

| Domaine cible                   | DR  | Trafic FR/mois | KW pullés        | Pages pullées       | RD pullés |
| ------------------------------- | --- | -------------- | ---------------- | ------------------- | --------- |
| **hellio.com**                  | 73  | 77 694         | 5 000            | 100                 | 200       |
| **sonergia.fr**                 | 49  | 16 545         | 5 000            | 100                 | 200       |
| **selectra.info**               | 78  | 415 506        | 5 000            | 100                 | 200       |
| **effy.fr**                     | 72  | 88 018         | 5 000 + 200 paid | —                   | 200       |
| **france-renov.gouv.fr**        | 85  | 155 200        | 5 000            | —                   | 200       |
| **travaux.com**                 | —   | 356 179        | —                | 200 paid            | —         |
| **engie-homeservices.fr**       | —   | 135 562        | —                | 134 paid            | —         |
| **servicesartisans.fr** (cible) | 0.6 | ~10 500        | 1 000            | 10 042 (Site Audit) | 74        |

---

## Inventaire complet des fichiers (4 MB total)

### 📊 CSV consolidés — niveau décision stratégique (à lire en premier)

| Fichier                               | Taille | Lignes | Description                                                        |
| ------------------------------------- | ------ | ------ | ------------------------------------------------------------------ |
| `competitor_intelligence_2026-05.csv` | 42K    | 300    | Top 100 pages × 3 concurrents (Hellio, Sonergia, Selectra)         |
| `keyword_opportunities_2026-05.csv`   | 42K    | 300    | Top 100 KW × 3 concurrents avec intent                             |
| `kw_universe_segment_2026-05.csv`     | 198K   | 1 370  | KW segment énergie agrégés (5 concurrents × 5K)                    |
| `striking_distance_2026-05.csv`       | 64K    | 589    | 3 buckets : quick wins, lookalike, blue ocean                      |
| `outreach_targets_2026-05.csv`        | 22K    | 393    | Refdomains classifiés Tier 1-4 + score priorité                    |
| `content_gap_global_2026-05.csv`      | 7.5K   | 91     | KW où ≥3 concurrents rankent, SA absent (vol≥100)                  |
| `paid_intelligence_2026-05.csv`       | 104K   | 534    | Paid pages des top spenders (Effy + Travaux + Engie-HS)            |
| `sa_lost_keywords_2026-05.csv`        | 76 B   | 0      | Constat : SA n'a pas d'historique Ahrefs avant 2026                |
| `site_audit_issues_2026-05.csv`       | 3.4K   | 38     | 38 issues actives Site Audit SA (4 errors, 9 warnings, 25 notices) |

### 🏭 Audit F — Supply RGE (Supabase prod, 2026-05-03)

| Fichier                                       | Lignes    | Description                                                         |
| --------------------------------------------- | --------- | ------------------------------------------------------------------- |
| `F_supply/F1_distribution.csv`                | 1         | 46 137 RGE actifs / 99.8% email / 1 claimed                         |
| `F_supply/F2_top5000_artisans.csv`            | **5 000** | **Liste outreach commercial prête (Lemlist/Hubspot import direct)** |
| `F_supply/F3_qualifications_by_code.csv`      | 80        | Top 80 codes qualif × organisme                                     |
| `F_supply/F3_qualifications_by_meta.csv`      | 6         | Catégories meta-domaine (62% efficacité énergétique)                |
| `F_supply/F3_qualifications_by_organisme.csv` | 12        | Qualibat 64% / Qualit'EnR 29% / Qualifelec 2.4%                     |
| `F_supply/F4_regions.csv`                     | 23        | Distribution régions (révèle bug data quality 62.6% INCONNU)        |
| `F_supply/supply_outreach_priority.sql`       | 96        | SQL de référence (déjà exécuté via TS)                              |

### 🔍 Données brutes JSON (raw API responses Ahrefs)

#### Per-concurrent (`A_competitors/{hellio,sonergia,selectra,effy,france_renov,travaux,engiehs}/`)

- `dr.json` — Domain Rating + Ahrefs rank
- `top_pages.json` — Top 100 pages par trafic
- `top_keywords.json` — Top 100 KW par trafic
- `top_keywords_1000.json` — Top 1 000 KW par trafic
- `kw_5000_byvolume.json` — Top 5 000 KW par volume (utilisé pour content gap)
- `refdomains.json` — Top 100 RD par DR
- `refdomains_200.json` — Top 200 RD par DR
- `paid_pages.json` — Pages avec trafic Ads (Effy/Travaux/EngieHS uniquement)

#### Site Audit SA (`E_site/`)

- `issues.json` — Liste exhaustive 173 issues définies (38 actives sur SA)
- `pages_hist.json` — Historique mensuel pages indexées 12 mois
- `broken_inbound.json` — Backlinks 4XX entrants (0 trouvés)
- `outgoing.json` — Linked domains (endpoint partiel)
- `orphan_pages.json` / `orphan_error.json` / `noindex_in_sitemap.json` / `broken_links.json` — Endpoints page-by-page non exposés v3 API (vides)

#### SA propre

- `sa_keywords_1000.json` — Top 1 000 KW SA actuels
- `sa_kw_diff.json` / `sa_kw_diff_6mo.json` — Diff 3/6 mois (vides, SA pas d'historique)

### 🛠️ Scripts utilitaires

- `process_pulls.py` — Script Python qui agrège content_gap + paid_intel + sa_lost depuis raw JSON

---

## Quick reference — Findings clés

### 1. Quadrant libre confirmé

Aucun acteur (Hellio, Sonergia, Effy, Selectra, France-Renov) ne combine simultanément :

- Catalogue artisan local profond
- Mandataire CEE intégré
- Data ouverte (data.gouv)
- E-E-A-T expert vérifiable

→ **C'est exactement la position SA peut occuper.**

### 2. Top 4 KW racine à attaquer prioritairement

| KW                      | Vol    | KD  | CPC | Concurrents | Best            |
| ----------------------- | ------ | --- | --- | ----------- | --------------- |
| **dpe location**        | 6 800  | 2   | 45€ | 4/5         | Sonergia #2     |
| **thermostat**          | 18 000 | 2   | 20€ | 3/5         | Sonergia #7     |
| **isolation interieur** | 3 600  | 4   | 68€ | 4/5         | France-Renov #4 |
| **dpe**                 | 89 000 | 55  | 67€ | 3/5         | Hellio #19      |

### 3. Pattern Effy paid à copier

- `/lp/generique/aides/prime-cee` (507 KW achetées) — landing page courte
- `/parcours/1/travaux-aides` (243 KW) — funnel direct
- → **Construire des `/lp/` versions des Pillars SA**

### 4. Supply EXISTE — 46 045 emails RGE prêts

- **0.43% conversion email = 200 claims = objectif Pilier 4.1 atteint**
- Top cluster : Qualit'EnR codes 41+43 = PAC + Chauffe-eau thermo (14 299 artisans, 31% supply)

### 5. Concurrent direct n°1 = Hellio (pas Effy)

- DR 73, 77K traf/mois, 72% segment-relevant
- Architecture 3 sous-domaines (`particulier.`, `copropriete.`, `faq.`)
- Top page : « plafond chèque énergie » 2 636 traf/mois (KD 31)
- **Vulnérabilité** : 0 mid-tier RD (40-69), tout est polarisé corporate hérité

### 6. Outreach Tier 3 institutionnel = pépite

- **data.gouv.fr** (DR 88, link 2/5 concurrents) — publier dataset RGE = backlink quasi-automatique
- **ecologie.gouv.fr** (DR 90) — étude RGE × climat = pickup Tier 1
- **beta.gouv.fr** (DR 85) — partenariat startup state

### 7. Site Audit SA — 4 erreurs critiques

| Pages | Issue                                                               |
| ----- | ------------------------------------------------------------------- |
| 484   | Orphan pages (sans liens internes entrants)                         |
| 386   | Noindex pages présentes dans sitemap (signal contradictoire Google) |
| 23    | Liens internes vers pages cassées                                   |
| 2     | Noindex pages reçoivent du trafic                                   |

### 8. Bug data quality détecté

- 62.6% des artisans RGE ont `address_region = INCONNU` (28 876 / 46 137)
- 5 régions avec codes département au lieu de noms (11, 24, 28, 44, 93)
- → Script de normalisation nécessaire avant scaling outreach régional

---

## Phase 1 — Roadmap immédiate

| #   | Action                                                       | Effort            | Impact attendu                    |
| --- | ------------------------------------------------------------ | ----------------- | --------------------------------- |
| 1   | Fix `address_region` normalisation                           | 1-2h              | Débloque outreach segmenté région |
| 2   | Dispatch RGE-first                                           | 1j code           | Cohérence claim "100% RGE"        |
| 3   | Pillar `/rge` upgrade + intégration 4 KW racine              | 5j                | Top 5 sous 90j                    |
| 4   | Dataset data.gouv RGE                                        | 2j                | Backlinks data.gouv automatique   |
| 5   | Versions `/lp/` landing pages des Pillars                    | 3j                | Funnel paid-style                 |
| 6   | Site Audit P0 quick wins (sitemap noindex + orphan + broken) | 1-2j              | -90% errors SA                    |
| 7   | Setup Lemlist/Hubspot avec import 5 000 contacts F.2         | 1j (commerciales) | 200 claims sous 60j               |

---

## Renouveler l'audit (commandes de référence)

```bash
# Re-pull metrics tous les 30j (cycle reset Ahrefs 18 du mois)
TOKEN=$(cat /c/Users/USER/.secrets/ahrefs.env | tr -d '\r\n ')
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.ahrefs.com/v3/subscription-info/limits-and-usage"

# Re-générer audit F (supply RGE) sur Supabase
npx tsx scripts/audit-supply-rge-2026-05.ts

# Re-générer agrégats (content gap + paid intel) depuis raw JSON
python3 docs/audit-ahrefs-2026-05-03/process_pulls.py
```

---

**Audit effectué par** : Claude Opus 4.7 (1M context)
**Date** : 2026-05-03
**Décision Marvin** : option A « Domination » 12 mois validée
