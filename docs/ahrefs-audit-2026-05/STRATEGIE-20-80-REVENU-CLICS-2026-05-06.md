# Stratégie 20/80 — Revenu × Clics niche Rénovation Énergétique

**Date** : 2026-05-06
**Cible** : 8 sem effort = ~430 K vol/mo accessible + ~1 350 leads/mo + DR +5-10
**Périmètre** : pivot reno (RGE/CEE/MPR/DPE/aides)
**Doc parent** : `STRATEGIE-100-PERCENT-COVERAGE-RENO-2026-05-06.md`

---

## 1. Principe — pourquoi clics ≠ revenu

Tous les clics ne valent pas la même chose. Hiérarchie intent → conversion :

| Intent                  | Conversion lead | Exemple KW                               | Volume Bloc 1 |
| ----------------------- | --------------- | ---------------------------------------- | ------------: |
| **Transactional ULTRA** | 5-15 %          | "devis pompe a chaleur"                  |           700 |
| **Commercial achat**    | 1-5 %           | "prix pompe a chaleur air eau" 2400 KD 1 |          high |
| **Commercial info-buy** | 0.5-2 %         | "installation vmc" 1800 KD 0             |          high |
| **Info pure**           | 0.1-1 %         | "vmc salle de bain" 9700 KD 0            |     very high |
| **Branded/corporate**   | varies          | "ServicesArtisans"                       |           n/a |

Lead exclusif SA (memory) : 30-80 €/lead selon métier.
Conversion site → lead via `/api/devis` ou `/simulateur-aides` (3 canaux Pipedrive).

→ **Le revenu vient des pages prix/installation/devis, pas des pages info**.

---

## 2. Pareto Bloc 1 — 38 KW cash cows

KW intent commercial KD ≤ 5 vol ≥ 400 : **38 KW = 43 050 vol/mo**

Top 15 cash cows :

| KW                                |   Vol |  KD | Page candidate SA                      |
| --------------------------------- | ----: | --: | -------------------------------------- |
| pompe à chaleur prix              | 4 700 |   1 | ✅ /pompe-a-chaleur (recheck)          |
| installation pompe a chaleur      | 3 300 |   1 | 🆕 /pompe-a-chaleur/installation       |
| installation pompe à chaleur      | 3 000 |   1 | (canonical 1 seule URL)                |
| prix dpe                          | 2 700 |   6 | ✅ blog WIP `prix-dpe-2026`            |
| prix pompe a chaleur air eau      | 2 400 |   1 | ✅ /pac/air-eau-prix                   |
| installation vmc                  | 1 800 |   0 | 🆕 /vmc/installation (+ devis CTA)     |
| pompe a chaleur prix              | 1 700 |   2 | ✅                                     |
| prix pompe a chaleur air air      | 1 600 |   0 | ✅ /pac/air-air-prix                   |
| isolation exterieur prix          | 1 600 |   3 | ✅ /isolation/exterieure-ite (recheck) |
| pompe a chaleur air air prix      | 1 500 |   0 | ✅                                     |
| prix chaudiere gaz                | 1 200 |   1 | 🆕 /chauffage/chaudiere-gaz/prix       |
| audit énergétique tarif           | 1 000 |   2 | ✅ /audit-energetique (recheck)        |
| combien coûte une pompe à chaleur | 1 000 |   1 | 🆕 sub /pompe-a-chaleur/cout           |
| installation poele a granule      | 1 000 |   0 | 🆕 /poele-granules/installation        |
| chaudière à gaz : prix            |   900 |   0 | (canonical)                            |

**Conversion estimée** :

- 43 050 vol × 5 % CTR moyen (top 5 ranking visé) = ~2 150 visites/mo niche commerciale
- × 5 % conversion lead = ~110 leads/mo niche commerciale
- × 50 €/lead moyen = **~5 500 €/mo revenu direct dès SA top 5**

À cela s'ajoute le trafic info (clics/j) qui amplifie DR + CTA simulateur (2-3 % conversion vers /api/simulateur/submit ou /api/devis).

---

## 3. Le 20/80 — 5 sprints sur 8 semaines

### Stratégie : ratio "1 page commercial = 1 page info"

Pour chaque cluster, livrer 1 page **prix/installation/devis** (cash cow) + 1 page **info/comment** (trafic). Le maillage interne route le trafic info vers la page prix qui convertit.

### Sprint 1 (sem 1-3) — VMC complet

**Objectif** : capturer 150 K vol/mo cluster VMC (KD avg 0.7 quasi-libre). Hub déjà existe.

| Livrable                                                                          |   Vol pivot | Type                |  Effort |
| --------------------------------------------------------------------------------- | ----------: | ------------------- | ------: |
| Re-cibler hub `/vmc/` head term "vmc"                                             | 48 000 KD 7 | info                |  1 jour |
| `/vmc/installation/` (page-mine effy.fr #1)                                       |  1 800 KD 0 | **commercial** ⭐   | 2 jours |
| `/vmc/double-flux-thermodynamique/`                                               |  1 800 KD 0 | info                | 2 jours |
| `/vmc/hygroreglable/type-b/`                                                      |  1 700 KD 0 | info                | 2 jours |
| `/vmc/thermodynamique/`                                                           |    500 KD 0 | info                |  1 jour |
| `/vmc/branchement-pose/`                                                          |  1 100 KD 0 | how-to + commercial | 2 jours |
| Audit + recheck rank `/vmc/simple-flux` (15K KD 2) et `/hygroreglable` (14K KD 1) |      29 000 | recalibration       | 2 jours |

**Livrables** : 6 nouvelles pages + 2 audits + 1 hub recalibration.
**Cash cow Sprint 1** : `/vmc/installation` (1 800 vol intent install = ~5-10 leads/mo).
**Vol cible** : ~85 K vol/mo accessible (head + variants), reste 65 K déjà couvert.

### Sprint 2 (sem 3-5) — Audit + Rewrite cluster PAC mal-rankées

**Objectif** : libérer ~120 K vol/mo "à libérer" sur pages existantes hors top 50.

| Action                                                                |  Pages | Vol cumul "bloqué" |
| --------------------------------------------------------------------- | -----: | -----------------: |
| Audit rank 50 pages `/renovation-energetique/travaux/` via Ahrefs API |     50 |                  — |
| Rewrite top 30 mal-rankées (KW couvert mais pos > 30)                 |     30 |             ~120 K |
| Maillage interne renforcé hub ↔ sub ↔ pages-mines locales             | matrix |    trafic indirect |

**Cash cow Sprint 2** : enrich `/pac/air-eau-prix` (KW "pompe à chaleur prix" 4 700 KD 1) avec CTA devis local + comparatif marques + ROI 10 ans.

**Effort** : 3 sem (10j audit + 10j rewrite + 1j maillage).

### Sprint 3 (sem 5-6) — Cluster orphelin Ballon thermo + DPE classes

**Objectif** : ouvrir niches absentes 100 % (= effort × résultat max).

#### Ballon thermodynamique (1 hub + 2 sub)

| Livrable                                                        |      Vol pivot | Type              |
| --------------------------------------------------------------- | -------------: | ----------------- |
| `/renovation-energetique/travaux/ballon-thermodynamique/` (hub) |    18 000 KD 6 | info              |
| `/ballon-thermodynamique/prix/`                                 |       700 KD 0 | **commercial** ⭐ |
| `/ballon-thermodynamique/installation/`                         | ~300 estimated | **commercial** ⭐ |

#### DPE classes (1 hub + 7 sub)

| Livrable                                           |          Vol pivot | Type |
| -------------------------------------------------- | -----------------: | ---- |
| `/diagnostic/dpe/classes/` (hub recap A-G)         |                  — | info |
| `/diagnostic/dpe/classes/{a,b,c,d,e,f,g}/` (7 sub) | 5 100 cumul KD 0-1 | info |

**Effort** : 5 jours (Ballon thermo) + 5 jours (DPE classes) = 2 sem.

### Sprint 4 (sem 7) — PAC long-tail + sub-niches

**Objectif** : 80 K vol/mo PAC sous-niches KD ≤ 5 ABSENTES.

| Livrable                                       |   Vol |  KD |
| ---------------------------------------------- | ----: | --: |
| `/pompe-a-chaleur/installation/`               | 3 300 |   1 |
| `/pompe-a-chaleur/fonctionnement/`             | 2 500 |   3 |
| `/pompe-a-chaleur/cout-total/` (combien coûte) | 1 000 |   1 |
| `/pompe-a-chaleur/eau-eau/`                    | 1 700 |   0 |
| `/pompe-a-chaleur/puissance/`                  |   350 |   0 |
| `/pompe-a-chaleur/depannage/`                  |   450 |   0 |
| `/pompe-a-chaleur/marques/{daikin,mitsubishi}` | 4 300 | 0-3 |

**Effort** : 1 sem (7 sub-pages, KD bas).

### Sprint 5 (sem 8) — Indice Rénovation™ + outreach

**Objectif** : démarrer le levier DR (sans ça les sprints précédents plafonnent à pos 20-30).

| Livrable                                                               | Effort | Impact                      |
| ---------------------------------------------------------------------- | -----: | --------------------------- |
| Page `/barometre/renovation-energetique-2026` (data ADEME + DPE + RGE) |     3j | Schema Dataset CC-BY 4.0    |
| Endpoint API `/api/v1/barometre/renovation/embed.html`                 |     1j | embed iframe partageable    |
| Outreach kit (12 médias régionaux ciblés)                              |     2j | 3-5 médias relayent attendu |
| Communiqué presse "Indice Rénovation 2026 SA"                          |     1j | viralisation                |

**Effort** : 1 sem.
**Cible** : 5+ embeds Tier 2 + 1-2 backlinks Tier 1 → DR 0,6 → 2-4 dès M+1.

---

## 4. Récapitulatif chiffré 8 sem

### Volume + revenu

|      Sprint      |             Pages |              Vol cumul gagné |       Leads/mo cible |    € /mo cible |
| :--------------: | ----------------: | ---------------------------: | -------------------: | -------------: |
|      S1 VMC      |                 9 |                         85 K |                30-50 |     1.5-2.5 K€ |
|  S2 PAC rewrite  |          30 audit |                 120 K libéré |                40-80 |         2-4 K€ |
|  S3 Ballon+DPE   |                10 |                         25 K |                 5-10 |     0.3-0.5 K€ |
| S4 PAC long-tail |                 7 |                         80 K |                25-50 |     1.3-2.5 K€ |
|  S5 Indice + PR  | 1 page + outreach |                     DR boost |        trafic +5-15% |       indirect |
| **TOTAL 8 sem**  | **~57 livrables** | **~310 K vol/mo accessible** | **100-190 leads/mo** | **5-10 K€/mo** |

### Trajectoire clics/j

| Période                         |     Clics/j P50 | Cumul leads/mo |       € /mo |
| ------------------------------- | --------------: | -------------: | ----------: |
| Today (2026-05-06)              |             350 |          ~5-10 |      <500 € |
| M+1 (Sprint 1-2 finis)          |         600-900 |          30-60 |    1.5-3 K€ |
| M+2 (Sprint 3-4 finis)          |     1 000-1 500 |         70-130 |  3.5-6.5 K€ |
| **M+3 (Sprint 5 + indexation)** | **1 500-2 500** |    **100-190** | **5-10 K€** |

### Comparatif vs 100 % complet

| Stratégie                    | Pages | Effort    | Vol gagné | Revenu M+3  | ROI temps  |
| ---------------------------- | ----: | --------- | --------: | ----------- | ---------- |
| 20/80 ciblé revenu           |    57 | 8 sem     |     310 K | 5-10 K€/mo  | ⭐⭐⭐⭐⭐ |
| P-100 complet (cf. doc 100%) |   200 | 12-16 sem |     816 K | 8-15 K€/mo  | ⭐⭐⭐⭐   |
| P-1000 (V2 fused)            |  600+ | 12 mois   |     1.3 M | 30-50 K€/mo | ⭐⭐⭐     |

→ Le 20/80 fait **53 % du résultat P-100 en 50 % du temps + ratio revenu meilleur** (focus commercial).

---

## 5. Pattern technique par page

Chaque cash cow page suit ce pattern (réplique des 5 pages B4-B8 livrées) :

```typescript
/**
 * Page : /[slug]
 * @kw-primary <kw>
 * @kw-volume <vol>
 * @kw-kd <kd>
 * @kw-cpc <cpc>  ← AJOUT pour pareto revenu
 * @intent commercial | info | transactional  ← AJOUT
 * @cluster <cluster>
 * @ahrefs-source api-live | bloc1
 * @snapshot YYYY-MM-DD
 */

// Composants obligatoires :
;-TldrBlock - // CTR booster snippet bait
  FlagshipFaq - // FAQ Schema → PAA
  FlagshipSources - // E-E-A-T (sources gov, légifrance, ADEME)
  FlagshipAuthorCard - // E-E-A-T auteur identifié
  JsonLd - // FAQSchema + GovernmentService + Service
  LastUpdated - // signal fraîcheur
  // Pages COMMERCIAL ajoutent :
  DevisCTA - // bouton "demander devis exclusif" → /devis
  SimulateurAideBox - // CTA simulateur si éligible MPR
  ArtisansLocauxList - // top 5 RGE local (depuis /api/v1/rge/search)
  PrixComparatif // tableau marques/configs (intent achat)
```

### Maillage interne — cascade revenue

```
Hub /vmc/ (info, vol 48K)
  ↓ link
Sub /vmc/installation (commercial, vol 1.8K KD 0)
  ↓ DevisCTA
/api/devis  →  Pipedrive  →  artisan RGE local  →  €
```

L'utilisateur arrive sur le hub info (haut volume, intent recherche), descend vers la page prix/installation (mid intent) et finit sur le CTA devis (intent transactionnel = €).

---

## 6. KPI suivi 8 sem

### Quotidien (auto via cron + memory)

- Clics/j GSC SA total
- Devis posted via `/api/devis` (Pipedrive `source = "servicesartisans.fr"`)
- Soumissions simulateur `/api/simulateur/submit` (Pipedrive `source = "simulateur-aides"`)
- Callback simulateur `/api/simulateur/callback`

### Hebdo

- Position GSC sur 15 cash cows (vmc/installation, pac/air-eau, prix-dpe, etc.)
- Index status nouvelles pages (couverture)
- CTR moyen pages cash cow (target ≥ 3 %)

### Sprint-end gate

| Sprint fin | Gate go/no-go                                               |
| :--------: | ----------------------------------------------------------- |
|     S1     | +30 % clics cluster VMC à J+15                              |
|     S2     | +50 K vol "libéré" sur pages rewritées (re-pull Ahrefs API) |
|     S3     | DPE classes indexées + 1ère impression GSC à J+10           |
|     S4     | 5+ leads PAC posted via `/api/devis`                        |
|     S5     | 5+ embeds baromètre live + 1+ Tier 1 média mentionne        |

Si gate raté → freeze sprint suivant + audit cause + plan B.

---

## 7. Prérequis tech avant Sprint 1

### Vérifications

- [ ] tsc clean (✅ déjà fait 2026-05-06)
- [ ] vitest > 99 % pass (⚠️ 2 timeout audit-near-duplicates → fix testTimeout 30s)
- [ ] Build local OK (⏳ à lancer)
- [ ] Lint OK (⏳ à lancer)
- [ ] Fiches auteurs `/equipe/{marc-lefebvre, claire-dubois, sophie-martin, jean-pierre-duval}` existent

### Composants à utiliser

- `<DevisCTA />` existant ? → grep `/components/devis/`
- `<SimulateurAideBox />` existant ? → grep `/components/simulateur/`
- `<ArtisansLocauxList />` à créer ou existant ?
- `<PrixComparatif />` à créer (pattern reusable PAC/VMC/Iso)

### Quotas

- Ahrefs : 707 K U dispo (largement OK)
- Anthropic Tier 1 : 50 RPM Haiku, 10K output TPM (cf. memory limits)

---

## 8. Décisions à prendre maintenant

- [ ] **GO Sprint 1 VMC** demain matin (commit WIP en cours d'abord) ?
- [ ] **Pull Ahrefs API live** sur les 30 pages PAC à audit Sprint 2 (~5-10K U) avant Sprint 2 ?
- [ ] **Composant `<DevisCTA />` réutilisable** : créer module commun avant S1 (1j effort) ?
- [ ] **Auteur cluster VMC** : `marc-lefebvre` cohérent (déjà /vmc/salle-de-bain, /solaire/autoconsommation) ?
- [ ] **Indice Rénovation™** : J0 = data dump ADEME + design template ; commencer dès Sprint 1 en parallèle ?

---

## 9. Conclusion

**LE 20/80 c'est** :

1. **38 KW commerciaux** (intent prix/installation/devis) KD ≤ 5 = 43 K vol/mo, **conversion 5 %** vs 0.5 % info
2. **Cluster VMC complet** + **PAC long-tail** + **Cluster orphelin Ballon thermo** + **DPE classes** = 310 K vol/mo en 8 sem
3. **Indice Rénovation™** comme catalyseur DR (1 livrable = 50 % du gain DR potentiel)

**Résultat 8 sem** :

- ~57 livrables (pages + audits + outreach)
- ~310 K vol/mo accessible (38 % du top 200, 24 % du gap niche complet)
- ~100-190 leads/mo
- ~5-10 K€/mo revenu direct
- DR 0,6 → 2-4 (boost via indice + outreach)

**Le pattern** : 1 page commercial + 1 page info par cluster, maillage cascade hub → sub-prix → DevisCTA → Pipedrive.

---

_Stratégie 20/80 composée le 2026-05-06 sur la base : Bloc 1 KW (200 lignes), Bloc 1 pages-mines (503 URLs), V2 fused roadmap, ULTRA DOMINATION v2 gates, memory 3 canaux Pipedrive, 970K SIRET supply._
