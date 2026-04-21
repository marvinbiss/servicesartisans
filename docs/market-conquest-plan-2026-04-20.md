# Plan de conquête brutal — `/services/[s]/[v]` template surgery

**Date** : 2026-04-20
**Auteur** : CEO mode — data-first, kill criterion, zéro refactor prospectif
**Budget** : 30 jours calendaires, ~80h exec
**Kill criterion global** : 50% des top 40 pages rank 21-50 gagnent ≥10 positions à J+30 OR pivot complet (authority/backlinks).

---

## 0. Diagnostic factuel (ce qui est vrai, pas ce qu'on espère)

### Ce qui FONCTIONNE déjà (validé live)

- SSR `/services/plombier/marseille` : 4337 mots rendus, H1 présent, 269 `<a href>`, 132 liens `/services/` internes
- Template : 30+ blocs enrichis, 9 schemas JSON-LD (LocalBusiness, Service, ItemList, FAQPage, AggregateRating, Speakable, Breadcrumb, OfferCatalog)
- Intent-aware titles + H1 + meta-desc, review prefix ≥5 avis, Sprint 2 CTR cascade pushé
- Reviews flywheel bridge (commit 2556b731), dispatch RGE-aware (migrations 461+462)

### Ce qui BLOQUE (confirmé par data)

| Blocage                                                                                                                                   | Mesure                            | Impact                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **communeData NULL 100%** sur prix_m2_moyen/revenu_median/gentile/description/pct_passoires_dpe/nb_maprimerenov pour les 40 villes cibles | 40/40 villes                      | BarometrePrixBlock + LocalInsightsBlock + ContexteDPEBlock + PrimesCEEBlock rendent **fallback générique** → Google déduplique 188 pages en ~8 classes |
| **0 avis** sur les 40 combos service+dept ciblés                                                                                          | 0/40 ≥5 avis                      | Title/desc prefix social proof jamais déclenché → CTR plafonné                                                                                         |
| **Backlinks : 78% spam (50/64)**                                                                                                          | 14 liens propres dont ~3 topiques | Pas d'autorité domaine → on rank à DR ~20 contre concurrents DR 60-85                                                                                  |
| **Providers absents** sur 8/20 top villes (Orléans, Besançon, Nîmes, Mâcon, Caussade, Castelsarrasin, La Ciotat, Darnetal)                | 8/40 = 20%                        | Fallback département → pas de matière locale → near-duplicate                                                                                          |
| **climat_zone NULL** sur Cholet, Poitiers, Orléans, Ajaccio, Montauban                                                                    | 5/40                              | CalendrierSaisonnierBlock masqué → perte enrichissement unique                                                                                         |
| **Ahrefs voit 8712 pages orphan+no-H1+no-outgoing**                                                                                       | snapshot pré-fix                  | Signal d'historique : Google a indexé broken, cascade lente à se rétablir                                                                              |

### Concurrence (top 10 par traffic)

| Concurrent              | DR  | Traffic | Pages | Commons | Traffic/page |
| ----------------------- | --- | ------- | ----- | ------- | ------------ |
| societe.com             | 86  | 580K    | 156K  | 11      | 3.7          |
| allovoisins.com         | 72  | 387K    | 14K   | 23      | 27.6         |
| travaux.com             | 74  | 280K    | 13K   | 71      | 21.0         |
| mesdepanneurs.fr        | 60  | 183K    | 2K    | 7       | 77.4         |
| obat.fr                 | 76  | 103K    | 3K    | 16      | 31.6         |
| yoojo.fr                | 61  | 80K     | 865   | 5       | 92.5         |
| depanneo.com            | 62  | 60K     | 4.7K  | 35      | 12.9         |
| **servicesartisans.fr** | ~20 | ~15K\*  | 970K  | —       | **0.015**    |

_\* estimation GSC : 350 clics/j × 30 ≈ 10-15K/mois_

**Ratio traffic/pages** = notre métrique catastrophique. On a x10 plus de pages que travaux.com pour x20 moins de traffic. **Cause probable** : dilution + near-duplicate + DR trop bas pour défendre 970K pages.

---

## 1. Thèse centrale (falsifiable)

**H1** : Google rank 45 sur `/services/plombier/marseille` parce que :

- **(A)** Near-duplicate : les 188 pages `/services/[s]/[v]` rendent du contenu 80% identique quand `communeData` fallback (100% du top 40)
- **(B)** Authority : DR ~20 vs concurrents top 10 à DR 60-86
- **(C)** CTR : 0.3% sur rank 45 = Google reçoit 0 signal positif → pas de promotion

**Lever attack order** (ROI décroissant, effort croissant) :

1. **(A)** Enrichir 40 villes → blocs uniques → Google re-crawl et promeut rank 20-25 (effort 10h, ROI ~600 clics/mois)
2. **(C)** CTR Sprint 2 déjà lancé, mesure J+8 = aujourd'hui ou J+2
3. **(B)** Backlinks 10 guest posts + disavow 50 spam (effort 30h, ROI ~6-12 mois)

---

## 2. Plan 30 jours — séquencé et measurable

### VAGUE A — Data enrichment (J+0 → J+7) 🔴 priorité absolue

**Objectif** : peupler 40 villes × 10 champs `communes` pour débloquer 6 blocs.

**Champs cibles + sources (gratuites, officielles)** :

| Champ                                                                                        | Source                                                            | Méthode                                                                           |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `prix_m2_moyen` + `prix_m2_maison` + `prix_m2_appartement`                                   | DVF (data.gouv.fr)                                                | Already scripted (voir migration 310 + scripts/enrich-commune-dvf.ts si existant) |
| `revenu_median`                                                                              | INSEE FILOSOFI                                                    | api.insee.fr ou dataset annuel                                                    |
| `gentile`                                                                                    | Wikipedia API                                                     | extract infobox "Gentilé" via wikidata/wiki REST                                  |
| `description`                                                                                | Wikipedia API                                                     | first 2 paragraphs summary                                                        |
| `pct_passoires_dpe` + `nb_dpe_total`                                                         | ADEME (api.ademe.fr)                                              | dataset DPE public                                                                |
| `nb_maprimerenov_annuel`                                                                     | France Rénov opendata                                             |                                                                                   |
| `risque_argile` + `zone_sismique` + `risque_inondation`                                      | Géorisques                                                        | georisques.gouv.fr API                                                            |
| `climat_zone` + `jours_gel_annuels` + `precipitation_annuelle` + `temperature_moyenne_hiver` | Météo-France                                                      | climat normales 1991-2020                                                         |
| `nb_artisans_btp`                                                                            | Sirene                                                            | api.insee.fr/entreprises/sirene/V3 — compter SIRET section F                      |
| `nb_artisans_rge`                                                                            | déjà peuplé (47/47 OK vu table providers + migration RGE 380-381) | cascade sur communes.nb_artisans_rge                                              |

**Script bootstrap** : `scripts/enrich-communes-top40.ts` — batch par source, écriture idempotente. Relancable.

**Kill criterion A** : 40/40 villes avec ≥16/18 champs peuplés à J+7. Sinon : pivoter vers (B).

### VAGUE B — Desindexation zombies + providers gap (J+7 → J+14)

**Sous-vague B.1 — Noindex 148 pages zombie** :

- Pages /services/[s]/[v] avec (impressions < 3 sur 90j) **ET** (providers locaux = 0) **ET** (pas de commune enrichie)
- Estimation : 148 pages sur 188 actives
- Mécanisme : champ providers.noindex ou server-side pruning déjà en place (shouldNoindex fn ligne 286)
- IndexNow ping les 148 URLs en noindex pour accélérer drop
- **Objectif** : concentrer PageRank sur les 40 indexables enrichies

**Sous-vague B.2 — Providers import 8 villes vides** :

- Orléans, Besançon, Nîmes, Mâcon, Caussade, Castelsarrasin, La Ciotat, Darnetal → 0 providers
- Option 1 : script SIRENE import BTP local (SIRET + nom + ville + spécialité, PAS téléphone → politique "no phone DB")
- Option 2 : laisser en noindex et oublier ces villes
- **Décision** : Option 1 pour 4 villes top (Orléans, Besançon, Nîmes, La Ciotat — rank < 35), Option 2 pour les 4 autres

**Kill criterion B** : 148 URLs zombies indexables → noindex en GSC à J+14. Sitemap shrink 188 → 40.

### VAGUE C — CTR measure + title refinement (J+8 → J+10)

Sprint 2 CTR cascade a été pushé 2026-04-18. J+8 = aujourd'hui.

**Action immédiate** :

- Pull GSC 7 derniers jours vs 7 jours précédents pour les 18 templates pSEO rewrite
- Cible : CTR +30% minimum sur rank stable
- Si rank bouge pas mais CTR bouge = review prefix fonctionne
- Si aucun signal = flush review prefix, essayer variant avec "Agréé SIREN" + artisan count

**Kill criterion C** : CTR médian ≥+20% à J+10, sinon rollback Sprint 2 variants + tester autre.

### VAGUE D — Reviews seed (J+10 → J+25)

**Problème détecté** : table `reviews` n'a pas `service_slug`. Il faut d'abord check le schéma réel puis adapter le script d'audit.

**Action** :

1. Inspecter structure reviews DB (quelle clé lie review → service ? probablement via provider_id → providers.service)
2. Seed ciblé 40 combos prioritaires :
   - 5 avis minimum × 40 combos = 200 reviews à acquérir
   - Via cron invitations déjà actif (migration 454+455) + relance manuelle portfolio
3. Mesure J+25 : combien de combos dépassent seuil ≥5 avis

**Kill criterion D** : 15/40 combos ≥5 avis à J+25, sinon allonger 30j.

### VAGUE E — Authority (J+0 → J+30, background)

**Sous-vague E.1 — Disavow spam** :

- Parse ahrefs-backlinks.csv : 50 spam domains identifiés (primeseo.xyz, seoagency.sale, itxoft-reliable-seo, bye.fyi, quero.party, creativeposts.top, runningwebsites.net, pagesearch.net, etc.)
- Générer disavow.txt GSC ready (script \_generate_disavow.py déjà présent — vérifier dernière version)
- Upload GSC disavow tool → propagation 2-4 semaines

**Sous-vague E.2 — 10 guest posts / link bait** :

- Cible : DR 30-60 FR, thématiques BTP/rénovation/artisanat
- Angles :
  - « Baromètre prix travaux 2026 France » (données DVF + notre DB artisans) → outreach presse régionale
  - « Observatoire RGE : cartographie des certifiés France » (notre intégration ADEME 49K fiches) → outreach journaux spécialisés rénovation
  - « Transparence des tarifs artisans » (étude sur nos 970K fiches) → outreach presse conso
- Process : 1 pitch/sem × 4 sem = 4 mails, 1-2 acceptations attendues → scale à 10 sur 30j

**Kill criterion E** : +3 backlinks DR≥30 à J+30, disavow uploadé J+7.

---

## 3. Script d'exécution — scripts à livrer

```
scripts/
├── enrich-communes-top40.ts              [VAGUE A] — batch DVF+INSEE+Wikipedia+ADEME+Géorisques+Météo
├── noindex-zombies-services.ts           [VAGUE B.1] — update providers/communes flag + IndexNow ping
├── import-sirene-providers.ts            [VAGUE B.2] — pour 4 villes vides priorisées
├── measure-sprint2-ctr-cascade.ts        [VAGUE C] — pull GSC + diff 7d vs 7d
├── audit-reviews-schema.ts               [VAGUE D.0] — reverse-engineer schema reviews
├── seed-reviews-flywheel.ts              [VAGUE D] — cron d'invitations ciblées
├── generate-disavow-2026-04.ts           [VAGUE E.1] — parse ahrefs + GSC disavow format
└── guest-post-outreach-list.ts           [VAGUE E.2] — scrap concurrents backlinks pour cibles
```

---

## 4. ROI attendu (hypothèses P50)

| Levier                                | Gain clics/mois             | Confiance | Timeframe                   |
| ------------------------------------- | --------------------------- | --------- | --------------------------- |
| (A) communeData → blocs uniques       | +400-800                    | 65%       | J+14 (Google recrawl cycle) |
| (B.1) Noindex 148 zombies             | +200-400 (concentration PR) | 50%       | J+21                        |
| (B.2) 4 villes providers              | +100-200                    | 55%       | J+21                        |
| (C) Sprint 2 CTR                      | +150-300                    | 70%       | J+10 (déjà pushé)           |
| (D) Reviews seed → social proof title | +150-400                    | 60%       | J+30                        |
| (E) Backlinks +3 DR≥30                | +50-100                     | 35%       | J+30-90                     |

**Total P50 attendu J+30** : +1 050 à +2 200 clics/mois (baseline 350/j = 10 500/mois → potentiel 11 550 → 12 700/mois).
**P90 (tous leviers OK + cascade sur /tarifs, /avis, /rge même pattern)** : +3 500 à +5 000 clics/mois.

**Objectif ambitieux publiquement commité** : **×2 de trafic à J+60** (350 → 700 clics/j).

---

## 5. Qu'est-ce qu'on arrête de faire

- ❌ **Plus de nouveaux blocs** dans le template `/services/[s]/[v]` — on a déjà 30+, on enrichit la DATA
- ❌ **Plus de sprints flagship 28 pages** avant que le template de masse soit validé
- ❌ **Plus de refactor maillage** avant d'avoir prouvé que la data unique fait bouger le rank
- ❌ **Plus de scripts audit pour auditer** — on exécute ou on kill

---

## 6. Check-list J+7 (go/no-go)

À J+7, on décide :

- [ ] 40/40 villes enrichies ≥16/18 champs ? → continue
- [ ] 148 URLs zombies noindex ? → continue
- [ ] Disavow uploadé ? → continue
- [ ] Sprint 2 CTR mesure +20% ? → continue
- [ ] Sinon → **pivot** : le problème est authority (B), shift budget vers backlinks + arrêt enrichissement

---

## 7. Memory anchor

Ce plan remplace la mémoire `servicesartisans-rank2150-attack-2026-04-20.md` (plan template surgery écarté après diagnostic live : le template est déjà enrichi, le bloqueur est la data + authority, pas le HTML).
