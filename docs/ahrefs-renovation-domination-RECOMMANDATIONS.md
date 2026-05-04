# Ahrefs — Données complémentaires pour dominer la niche Rénovation Énergétique / CEE / MaPrimeRénov'

**Date** : 2026-05-04
**Contexte** : SA cible la niche RGE/CEE/MaPrimeRénov' (volume potentiel 300-500K req/mois). Le dataset Ahrefs existant (`docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv`) compare SA vs Pages Jaunes / Travaux.com / IZI by EDF, **sans les vrais leaders niche** (Effy DR 72, Heero DR 58, Sonergia DR 49).

**Quota Ahrefs disponible** : ~691 000 unités jusqu'au 18/05/2026 (plan Advanced 1M/mois).

---

## ✅ Déjà extrait (zéro coût)

Le script `scripts/analyze_renovation_keywords_from_existing.py` filtre le content-gap existant (75K rows) sur RGE/CEE/MPR.

**Output** : `docs/ahrefs-renovation-keywords-extracted-2026-05-04.{json,md}` — 42 keywords actionnables. Top 5 quick wins KD 0 :

| KW                       | Vol   | KD  | Concurrent rank |
| ------------------------ | ----- | --- | --------------- |
| menuiserie autour de moi | 2 500 | 0   | travaux.com #2  |
| entretien vmc            | 2 400 | 0   | travaux.com #2  |
| menuiserie bois          | 3 700 | 4   | pagesjaunes #3  |
| nettoyage vmc            | 1 400 | 0   | travaux.com #2  |
| qualifelec               | 3 300 | 0   | izi-by-edf #9   |

⚠️ Ce résultat = FLOOR (les vrais leaders RGE/CEE absents du dataset).

---

## 🎯 6 blocs à pull (ordre par ROI)

### Bloc 1 — Concurrent gap niche RGE/CEE (priorité absolue)

**Pourquoi** : aucun des leaders niche n'est dans le dataset actuel. C'est le levier #1.

**Cibles** : `effy.fr`, `heero.fr`, `sonergia.fr`, `quelleenergie.fr`, `france-renov.gouv.fr`, `economiedenergie.fr`, `monexpert-renovation-energie.fr`, `prime-energie.eu`, `calculeo.fr`, `selectra.info`.

**Endpoints** :

- `/v3/site-explorer/top-pages` × 10 concurrents (top 200 pages traffic)
- `/v3/site-explorer/organic-keywords` × 10 (filtre position 1-20)
- `/v3/site-explorer/content-gap` (3-way Effy + Heero + Sonergia vs SA)

**Coût estimé** : ~45 000 unités

**Commande type** :

```bash
TOKEN=$(cat /c/Users/USER/.secrets/ahrefs.env | tr -d '\r\n ')

# Top pages Effy
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.ahrefs.com/v3/site-explorer/top-pages?target=effy.fr&country=fr&limit=200&select=url,traffic,keywords,top_keyword,top_keyword_volume,top_keyword_position" \
  > tmp/ahrefs-effy-top-pages.json

# Content gap 3-way
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.ahrefs.com/v3/site-explorer/content-gap?targets=effy.fr,heero.fr,sonergia.fr&against=servicesartisans.fr&country=fr&limit=1000&volume_min=100" \
  > tmp/ahrefs-content-gap-niche.json
```

**Output attendu** : top 200-500 KW high-vol où concurrents niche rankent et SA absente = pages-mines à créer pour Sprint 3.

---

### Bloc 2 — Backlinks intersect niche (DR 0.6 → 8-15 booster)

**Pourquoi** : ULTRA DOMINATION v2 gate P3.3 demande 3+ backlinks Tier 1 M+3. SA DR 0.6 vs Effy DR 72 vs Sonergia DR 49 = 1000x écart. Seul levier : prospecter les domaines qui linkent **plusieurs** leaders simultanément (= topical authority RGE/CEE).

**Endpoints** :

- `/v3/site-explorer/refdomains` × 5 leaders (filtre `dr>=30 dofollow=1`)
- `/v3/site-explorer/backlinks` (top 100 par leader)
- `/v3/site-explorer/anchors` × 5 leaders (topics ancres = brief outreach)
- `/v3/site-explorer/broken-backlinks` (effy.fr, heero.fr) → page de remplacement

**Coût estimé** : ~28 000 unités

**Output attendu** :

- Liste 200-500 domaines intersect 2+ leaders triés DR + topical relevance
- Pour chaque domaine : email contact, sujet ancre type, page-mine SA à proposer

---

### Bloc 3 — Long-tail keywords explorer (Sprint 3 fuel)

**Pourquoi** : alimenter les 100 flagship pages Sprint 3 keyword-first.

**Seeds** (15 termes) :

1. maprimerenov
2. cee certificat
3. rge qualibat
4. pompe à chaleur prix
5. isolation comble prix
6. audit énergétique
7. passoire thermique
8. dpe location
9. mon accompagnateur rénov
10. coup de pouce chauffage
11. eco ptz
12. tva 5.5 rénovation
13. anah 2026
14. rénovation globale
15. chaudière condensation prime

**Endpoints** :

- `/v3/keywords-explorer/matching-terms` × 15 seeds (limit 200 chacun) → 3 000 KW long tail
- `/v3/keywords-explorer/related-terms` × 15 seeds (also-rank-for) → clusters cachés
- `/v3/keywords-explorer/questions` × 15 seeds → feed FAQ/blog
- `/v3/serp-overview` top 100 sur 50 KW pillar → SERP features (PAA, snippets, sitelinks)

**Coût estimé** : ~32 000 unités

**Output attendu** : 1 000-2 000 KW priorisés vol/KD/intent + mapping → page existante / page à créer / blog post.

---

### Bloc 4 — Local SEO RGE par ville × service

**Pourquoi** : valider quelles combos `[service-rge]/[ville]` ont du vol réel. Aujourd'hui beaucoup de pages indexées avec vol 0 (cf. memory `seo-diagnosis-2026-04-18`).

**Cibles** :

- Top 100 villes France × 11 services RGE = 1 100 combos
- Filtrer vol >= 30/mois → garder en sitemap, vol < 10 → noindex

**Endpoints** :

- `/v3/keywords-explorer/overview` (batch 100 par requête)
- `/v3/serp-overview` Local Pack sur top 50 combos vol > 100

**Coût estimé** : ~12 000 unités

**Output attendu** : décision binaire indexation par combo + identification des villes où Local Pack domine vs SEO classique → arbitrage Google Business Profile.

---

### Bloc 5 — SERP features tracking (CTR booster)

**Pourquoi** : composants `TldrBlock`, `EnBrefBox`, `SnippetBaitSummary` déjà codés (cf. memory `seo-10agents-synthesis`) mais pas câblés. Identifier où le snippet bait paye.

**Endpoints** :

- `/v3/serp-overview` sur top 200 KW pillar SA (filtre `featured_snippet|paa_count|sitelinks`)
- `/v3/keywords-explorer/overview` filter `paa_count > 5` sur seed RGE/CEE/MPR

**Coût estimé** : ~7 000 unités

**Output attendu** : 50-100 KW prioritaires pour rewrite snippet bait + Schema.org HowTo/FAQ ciblé.

---

### Bloc 6 — Authority signals (E-E-A-T proxy, audit only)

**Pourquoi** : baseline mesurable du gap E-E-A-T vs leaders. Pas une action immédiate, mais un KPI à tracker.

**Endpoints** :

- `/v3/site-explorer/refdomains` filtre `tld:.gouv.fr,.edu,wikipedia.org` × 5 leaders + SA
- `/v3/site-explorer/organic-keywords` filtre `serp_features=knowledge_panel` × 5 leaders + SA

**Coût estimé** : ~3 000 unités

**Output attendu** : tableau comparatif "trust links count" et "knowledge panel presence" pour mesurer l'écart authority.

---

## 💰 Budget total estimé

| Bloc                     | Unités      | % quota dispo |
| ------------------------ | ----------- | ------------- |
| 1 — Concurrent gap niche | 45 000      | 6.5%          |
| 2 — Backlinks intersect  | 28 000      | 4.0%          |
| 3 — Keywords long tail   | 32 000      | 4.6%          |
| 4 — Local SEO villes     | 12 000      | 1.7%          |
| 5 — SERP features        | 7 000       | 1.0%          |
| 6 — Authority signals    | 3 000       | 0.4%          |
| **TOTAL**                | **127 000** | **18.4%**     |

Budget après pull : 691K - 127K = **~564K unités restantes** jusqu'au 18/05.

---

## 📋 Ordre d'exécution recommandé

1. **Bloc 1** (concurrent gap niche) — révèle pages-mines, base de tout le reste
2. **Bloc 2** (backlinks intersect) — débloque DR 0.6 → 8-15 (gate ULTRA P3.3)
3. **Bloc 3** (keywords long tail) — alimente Sprint 3 flagship 100 pages
4. **Bloc 4** (local SEO villes) — purge sitemap + kill villes vol 0
5. **Bloc 5** (SERP features) — quick wins CTR pages déjà indexées
6. **Bloc 6** (authority) — baseline E-E-A-T (audit, pas action)

---

## 🚧 État actuel — ce qui est PRÊT vs ce qui MANQUE

### Prêt à utiliser

- ✅ Token Ahrefs valide (`~/.secrets/ahrefs.env`, expire 2027-04-29)
- ✅ Quota dispo : ~691K unités jusqu'au 18/05
- ✅ 42 quick wins déjà extraits du dataset existant (`docs/ahrefs-renovation-keywords-extracted-2026-05-04.md`)
- ✅ Scripts Python existants pour parser les résultats (`docs/ahrefs-audit-2026-04/_*.py`)

### Manque (à créer si Marvin OK lance)

- ⏳ 6 scripts `scripts/ahrefs-renovation-domination/0[1-6]-*.{ts,py}` (un par bloc)
- ⏳ Wrapper unique `scripts/run-ahrefs-domination.sh` pour orchestrer + tracker quota consommé
- ⏳ Parsers JSON → Markdown actionable par bloc

**Estimation effort dev** : 2-3h pour scripter les 6 blocs + parsers.

---

## ⚠️ Garde-fous

1. **Ne JAMAIS** copier le token dans `.env*` ni le repo (CLAUDE.md règle).
2. **Vérifier quota** avant chaque pull : `curl -H "Authorization: Bearer $TOKEN" https://api.ahrefs.com/v3/subscription-info/limits-and-usage`
3. **Cache sur disque** chaque réponse JSON brute (`tmp/ahrefs-*.json`) pour pouvoir re-parser sans re-pull.
4. **Reset quota** : 18 du mois — si pull >500K ce mois, attendre 18/05.
5. **Rate limit Ahrefs API** : 60 req/min max. Sleep 1-2s entre appels.

---

## 🎯 Décision attendue de Marvin

- [ ] **Option A** : Lancer Bloc 1 immédiatement (45K unités, ~30 min de scripting + ~5 min de pull)
- [ ] **Option B** : Lancer les 6 blocs séquentiellement (127K unités, ~3-4h total)
- [ ] **Option C** : Construire les 6 scripts mais ne pas pull (préparer l'infra, tu lances quand prêt)
- [ ] **Option D** : Attendre — exploiter d'abord les 42 KW déjà extraits

**Recommandation** : Option C puis A. Construire l'infra ce soir, lancer Bloc 1 demain matin pour avoir la liste pages-mines RGE/CEE en main avant la prochaine itération Sprint 3.
