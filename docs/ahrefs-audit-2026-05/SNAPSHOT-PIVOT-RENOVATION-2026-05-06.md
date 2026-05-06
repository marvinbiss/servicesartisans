# Snapshot local — Pivot Rénovation Énergétique

**Date** : 2026-05-06
**Branche** : `main` (WIP non commité)
**Cycle** : Bloc 1 récap audits — sub-pages B4-B8 + Vague E blog + recalibration B6

---

## 1. État WIP

### 1.1. Pages flagship créées (5)

| Slug                                                           | Pivot KW                     | Vol/mo |  KD | Famille cumul | Auteur            | LOC |
| -------------------------------------------------------------- | ---------------------------- | -----: | --: | ------------: | ----------------- | --: |
| `/renovation-energetique/travaux/solaire/autoconsommation`     | autoconsommation solaire     |  2 400 |  14 |       ~22 490 | marc-lefebvre     | 784 |
| `/renovation-energetique/diagnostic/dpe/validite`              | validite dpe                 |  1 600 |  39 |        ~2 360 | sophie-martin     | 653 |
| `/renovation-energetique/travaux/pompe-a-chaleur/consommation` | consommation pompe a chaleur |  3 400 |   1 |        ~3 800 | jean-pierre-duval | 657 |
| `/renovation-energetique/travaux/vmc/salle-de-bain`            | vmc salle de bain            |  9 800 |   0 |       ~11 900 | marc-lefebvre     | 696 |
| `/cee/comparatif-primes-energie`                               | prime edf                    |  7 500 |   3 |       ~18 500 | claire-dubois     | 722 |

**Total LOC ajoutées** : 3 512 lignes
**Volume cumul accessible** : ~59 050 vol/mo (familles cumulées)

### 1.2. Recalibration page existante

`pompe-a-chaleur/entretien` :

- Pivot avant : `prix entretien pompe a chaleur` (500 vol KD 1)
- Pivot après : `entretien pompe a chaleur` (5 900 vol KD 1) ⭐⭐⭐⭐⭐
- Famille 1 700 → 7 450 vol/mo (×4.4)
- Source mise à jour : Ahrefs API live 2026-05-06 (vs CSV gap 2026-05-04)
- Title/description ré-écrits pour cibler racine

### 1.3. Article blog (Vague E)

`prix-dpe-2026` (Sprint 2 STRATEGIE-RENOVATION-ENERGETIQUE.md) :

- KW pivot : "prix dpe" 2 500 vol KD 6 ⭐⭐⭐⭐⭐
- Famille : ~4 680 vol/mo (KD 0-6)
- Vague E cumul : 1 750 → 6 430 vol/mo

### 1.4. Modifications hubs (anti-orphelinat)

| Hub                                                        | Lien ajouté                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `/renovation-energetique/travaux/solaire/page.tsx`         | → autoconsommation                                                  |
| `/renovation-energetique/diagnostic/dpe/page.tsx`          | → validite                                                          |
| `/renovation-energetique/travaux/pompe-a-chaleur/page.tsx` | → consommation                                                      |
| `/renovation-energetique/travaux/vmc/page.tsx`             | → salle-de-bain                                                     |
| `/cee/page.tsx`                                            | → comparatif-primes-energie (block 4-cards mis à jour 3→4 colonnes) |

### 1.5. Sitemap (`src/app/sitemap.ts`)

5/5 nouvelles URLs ajoutées au manuel sub-sitemap, avec :

- Commentaire bloc B4-B8 + KW pivots Ahrefs
- `lastModified: STATIC_DATE` (2026-05-06)
- `changeFrequency: 'monthly'`
- `priority: 0.85-0.90`

### 1.6. Volume cumul nouveau (session 2026-05-06)

```
Pages flagship       : 59 050 vol/mo
Recalibration B6 PAC : +5 750 vol/mo (uplift seul)
Blog prix-dpe-2026   : +4 680 vol/mo
─────────────────────────────────────
TOTAL session        : ~69 480 vol/mo accessibles
```

---

## 2. Validation

| Gate                                           | Résultat                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                             | ✅ clean                                                                         |
| `npx vitest run`                               | ⚠️ 5162/5166 pass — 2 timeouts `audit-near-duplicates.test.ts` (testTimeout 5s)  |
| Audit near-duplicates direct                   | ✅ 0 paire ≥0.85 sur 266 pages                                                   |
| Schema E-E-A-T                                 | ✅ 5/5 (TldrBlock + FlagshipFaq + FlagshipSources + FlagshipAuthorCard + JsonLd) |
| `noindex`                                      | ✅ aucune des 5 pages                                                            |
| Sitemap                                        | ✅ 5/5 URLs                                                                      |
| Maillage interne                               | ✅ 5/5 hubs parents linkent                                                      |
| Headers KW (`@kw-primary` + source + snapshot) | ✅ 5/5                                                                           |

---

## 3. Cluster reno-energetique — vue d'ensemble

| Section                                          |                                                          Pages |
| ------------------------------------------------ | -------------------------------------------------------------: |
| `/renovation-energetique/aides/*`                |                                                              9 |
| `/renovation-energetique/diagnostic/*`           |                                     6 (incl. dpe/validite WIP) |
| `/renovation-energetique/passoires-thermiques/*` |                                                              3 |
| `/renovation-energetique/travaux/*`              |        46 (incl. autoconso + consommation + salle-de-bain WIP) |
| `/renovation-energetique/page.tsx` (hub)         |                                                              1 |
| `/cee/*`                                         | 9 (incl. comparatif WIP, hors `[operation]` 21 ops dynamiques) |
| `/aides/*` (versant comparatif transverse)       |                                                             10 |
| **Total flagship**                               |                                                         **84** |

Bloc 1 leviers (récap audits Ahrefs 2026-05-04) :

- ✅ Livrés : A (plancher bas), B (hub Prime CEE), C (entretien PAC), D (Velux), E (nettoyage solaire), F (DPE location), G (toiture), H (entretien VMC), I+J+K+L+M (cluster réno 5 leviers), N (hub Électricité)
- 🔄 WIP ce session : B4-B8 (autoconso + dpe/validite + pac/consommation + vmc/SDB + comparatif primes)
- ⏳ Restant cluster Bloc 1 (depuis `ahrefs-bloc1-pages-mines-2026-05-04.md`) : variantes prix-pac-air-eau-9kw, dpe-classes-detail, ITE-prix-m2-2026, etc.

---

## 4. Risques

1. **Timeout vitest** (P2) — `audit-near-duplicates.test.ts` : testTimeout 5s trop court vu 266 pages × 5-grams Jaccard. Pas de régression réelle (script direct = 0 paire). Fix : `testTimeout: 30000`.
2. **Push lag** (P3) — règle SA "push manuel /3j". Dernier push 05/05. Deadline soft = 08/05.
3. **Pas encore lancé** : `npm run build`, `npm run lint`, audit-dept-code, audit-migration-search-path.
4. **Atomicité commit** — 9 fichiers modifiés + 5 nouvelles pages + 1 article blog. Choix : 1 commit groupé "B4-B8" OU 6 commits atomiques (5 sub-pages + 1 blog + 1 recalibration B6).
5. **Cohérence E-E-A-T** : pas vérifié si auteurs (`marc-lefebvre`, `claire-dubois`) ont fiches `/equipe/[slug]` à jour 2026-05-06.

---

## 5. Recommandations next step (priorisées)

### P0 — Avant tout commit

1. ⚠️ Fix `audit-near-duplicates.test.ts` testTimeout 5000→30000 (1 ligne, kill bruit CI).
2. ✅ `npm run build` local — règle CLAUDE.md "jamais de build cassé sur Vercel".
3. ✅ `npm run lint` (ESLint) — pas encore lancé ce session.
4. ✅ Vérifier `/equipe/marc-lefebvre`, `/equipe/claire-dubois`, `/equipe/sophie-martin`, `/equipe/jean-pierre-duval` — pages auteurs existent ?

### P1 — Commit

**Option A (préférée)** : 1 commit groupé

```
feat(seo): Bloc 1 récap audits — 5 sub-pages B4-B8 + Vague E prix-dpe + recalibration B6 PAC

- B4 autoconsommation solaire (~22 490 vol/mo, KD 14 pivot)
- B5 VMC salle de bain (~11 900 vol/mo, KD 0 mega easy)
- B6 PAC entretien recalibré (1 700→7 450 vol/mo)
- B7 DPE validité (~2 360 vol/mo)
- B8 PAC consommation (~3 800 vol/mo, KD 1)
- B16 CEE comparatif primes (~18 500 vol/mo, KD 3)
- Blog Vague E prix-dpe-2026 (~4 680 vol/mo)

Total : +69 480 vol/mo accessibles, snapshot Ahrefs API live 2026-05-06.
```

**Option B** : 6 commits atomiques (1 par page + 1 blog + 1 recalibration). Plus respect règle "1 commit = 1 changement" mais lourd.

→ **Reco : Option A** (cohérence thématique = un seul cycle d'audit, traçable).

### P2 — Post-commit

5. `git push` à J+3 (2026-05-08) — règle SA respect cadence Vercel/Google/GSC.
6. Mettre à jour memory `servicesartisans-ahrefs-bloc1-niche-cee-2026-05-04.md` avec les 5 nouvelles pages livrées.

### P3 — Roadmap continue

7. Continuer Bloc 1 pages-mines restantes (cf `docs/ahrefs-bloc1-pages-mines-2026-05-04.md`).
8. Sprint 3 plan (100 pages flagship 12 sem) : on est à ~5 ce sprint, ~30 ce mois cumul. Cible 350→2000 clics/j sur 12 sem.

---

## 6. Snapshot KPIs

| Métrique                    |                                                                                       Valeur |
| --------------------------- | -------------------------------------------------------------------------------------------: |
| Pages flagship cluster reno |                                                                                           84 |
| LOC ajoutées session        |                                                                                        3 512 |
| Vol/mo nouveau accessible   |                                                                                      ~69 480 |
| KW pivots couverts          |                                                                     5 nouveaux + 1 recalibré |
| Easy wins KD ≤5             | 4/5 (vmc-SDB KD 0, pac-conso KD 1, cee-comparatif KD 3, autoconso KD 14, dpe-validite KD 39) |
| Schema YMYL respecté        |                                                                                          5/5 |
| Cadence commits 8j          |                                                                                          290 |

---

_Généré : 2026-05-06 ~16:00 — sur la base de l'inventaire WIP + git diff + tsc clean._
