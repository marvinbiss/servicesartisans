# Landing Pages Attack Plan — Action #5 (Sprint C)

**Date** : 2026-05-03
**Source** : `paid_intelligence_2026-05.csv` (534 pages payantes auditées chez Effy, Engie HomeServices, Travaux.com)
**Méthode** : reverse-engineering des LPs sur lesquelles les concurrents posent leur budget Google Ads → reproduire en organique pour SA.

## Pourquoi cette action

Les pages payantes des concurrents sont **les pages où ils placent le plus d'argent sur Google Ads**. Elles convertissent le mieux en intent transactionnel (devis, simulateur, demande d'aide). Reproduire la même structure éditoriale en organique permet à SA de capturer ce trafic **sans coût publicitaire** — pattern Effy démontré : ~50% du trafic Effy vient en organique de pages anciennement-LP indexées.

## Volume capturable

| Bucket                                | LP  | KW paid cumulés                |
| ------------------------------------- | --- | ------------------------------ |
| Total LP attaquables (intent + dédup) | 36  | ~3 600                         |
| **Top 30 attack**                     | 30  | **3 333**                      |
| Si capture organique 30% top 10       | —   | **~1 000 KW activés sans CPC** |

**Effet à M+3** (8 LP livrées en organique, ranking pos 5-15) : **+8-15K clics/mois** ajoutés, sans surcoût ad.

## Distribution des LP top 30

### Par batch d'attaque (sequencing 3 semaines)

| Batch | Sem   | LP    | Cluster prioritaire                                                                                      |
| ----- | ----- | ----- | -------------------------------------------------------------------------------------------------------- |
| 1     | sem 1 | 9 LP  | aides-cee (7) + simulateur (2) — intent racine, gros budget concurrent                                   |
| 2     | sem 2 | 6 LP  | isolation (gros volume + KD faible audit Action #7)                                                      |
| 3     | sem 3 | 15 LP | verticales énergie (PAC 5 + chauffe-eau 2 + poêle 2 + clim 2 + chauffage 1 + fenetres 2 + adoucisseur 1) |

### Par cluster

| Cluster         | LP top 30 | Route SA cible                              | Status                |
| --------------- | --------- | ------------------------------------------- | --------------------- |
| aides-cee       | 7         | `/lp/aides-renovation-2026`                 | ❌ à créer            |
| isolation       | 6         | `/lp/isolation-thermique-aides`             | ❌ à créer            |
| pompe-a-chaleur | 5         | `/lp/pompe-a-chaleur-aides`                 | ❌ à créer            |
| simulateur      | 2         | `/simulateur-aides-renovation`              | ✅ existant — booster |
| poele           | 2         | `/lp/poele-a-granules-aides`                | ❌ à créer            |
| chauffe-eau     | 2         | `/lp/chauffe-eau-thermodynamique-prime-cee` | ❌ à créer            |
| climatisation   | 2         | `/lp/climatisation-aides`                   | ❌ à créer            |
| fenetres        | 2         | `/lp/fenetres-double-vitrage-prime`         | ❌ à créer            |
| chauffage       | 1         | `/lp/chaudiere-aides-renovation`            | ❌ à créer            |
| adoucisseur-eau | 1         | `/lp/adoucisseur-eau`                       | ❌ à créer            |

→ **9 nouvelles LP à créer** (1 existante à booster).

## Patterns d'URL gagnants (concurrents)

Top 5 patterns par budget paid :

| Rank | Concurrent  | Pattern                            | nLP | KW paid cumulés |
| ---- | ----------- | ---------------------------------- | --- | --------------- |
| 1    | **effy**    | `/parcours/1/travaux-aides`        | 3   | 666             |
| 2    | effy        | `/lp/generique/aides`              | 1   | 507             |
| 3    | effy        | `/guide/aides-renovation`          | 1   | 483             |
| 4    | effy        | `/lp/isolation/isolation-des-murs` | 1   | 425             |
| 5    | **engiehs** | `/particulier/landing/{topic}`     | 2   | 382             |

**Structure dominante** :

- **Effy** : 2 patterns coexistent
  - `/lp/{cluster}/{detail}-newform` (LP modernes)
  - `/travaux-energetique/{cluster}/{detail}` (long-form SEO ancré)
- **Engie HomeServices** : `/particulier/landing/{topic}` (LP simples + funnel devis intégré)
- **Effy parcours** : `/parcours/1/travaux-aides?theme={cluster}` (funnel pré-segmenté par cluster)

> 🎯 **Application SA** : structure recommandée `/lp/{cluster}-aides` ou `/lp/{cluster}-prime-cee` (humain, KW-rich) avec funnel CTA → `/simulateur-aides-renovation`. Ne pas reproduire `-newform` (jargon interne Effy).

## Top 10 LP à créer immédiatement

| Rank | Cluster         | Batch | Route SA cible                            | H1 cible                                                              | KW paid concurrent                   |
| ---- | --------------- | ----- | ----------------------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| 1    | aides-cee       | 1     | `/lp/aides-renovation-2026`               | Toutes les aides à la rénovation énergétique en 2026                  | 507 (Effy `prime-cee`)               |
| 2    | aides-cee       | 1     | (idem rank 1)                             | (idem)                                                                | 483 (Effy `guide/aides-renovation`)  |
| 3    | isolation       | 2     | `/lp/isolation-thermique-aides`           | Isolation thermique : jusqu'à 75 € / m² d'aides en 2026               | 425 (Effy ITE)                       |
| 4    | climatisation   | 3     | `/lp/climatisation-aides`                 | Installer une climatisation réversible en 2026 : aides + artisans RGE | 393 (Effy parcours `theme=clim`)     |
| 5    | simulateur      | 1     | `/simulateur-aides-renovation` (existant) | Simulateur aides rénovation 2026 — 3 minutes                          | 243 (Effy parcours)                  |
| 6    | pompe-a-chaleur | 3     | `/lp/pompe-a-chaleur-aides`               | Installer une pompe à chaleur en 2026 — jusqu'à 5 000 € d'aides       | 206 (Engie installation PAC air-eau) |
| 7    | chauffage       | 3     | `/lp/chaudiere-aides-renovation`          | Changer sa chaudière en 2026 : aides + artisans RGE                   | 176 (Engie chaudière gaz)            |
| 8    | aides-cee       | 1     | (idem rank 1)                             | (idem)                                                                | 172 (Effy `prime-effy-lp`)           |
| 9    | isolation       | 2     | `/lp/isolation-thermique-aides`           | (idem rank 3)                                                         | 129 (Effy isolation combles 1€)      |
| 10   | isolation       | 2     | (idem rank 3)                             | (idem)                                                                | 108 (Effy moisissure mur)            |

> 📊 **Concentration** : **70% du budget paid concurrent** se concentre sur 3 clusters (aides-cee, isolation, simulateur). Si SA livre les 3 LP racines en sem 1+2, **on tape là où les concurrents brûlent le plus de cash**.

## Spec éditoriale par LP (template SA)

Chaque LP doit suivre **la même structure** pour mutualiser le développement et garder une cohérence E-E-A-T :

```
H1 : <KW racine + bénéfice + année>
Hero : <CTA simulateur + photo artisan RGE + Trustpilot/avis>
Section 1 : "Quelles aides en 2026 ?" (tableau MaPrimeRénov + CEE + TVA réduite + éco-PTZ)
Section 2 : "Notre méthode artisan RGE certifié" (process 4 étapes + vérification france-renov.gouv.fr)
Section 3 : "Combien ça coûte vraiment ?" (tableau prix par technologie + ROI moyen)
Section 4 : "Témoignages clients" (3-5 avis vérifiés + score Trustpilot global)
Section 5 : FAQ (5-7 Q&R structured Schema FAQPage)
Footer-CTA : 2 CTAs (simulateur 3 min + numéro de tél)
Schema.org : Service + GovernmentService (aides) + FinancialProduct (prime CEE) + LocalBusiness
```

**Longueur cible** : 1 200-1 800 mots (pas plus, intent transactionnel = pas long-form blog).
**Above-the-fold** : H1 + bénéfice chiffré + CTA simulateur visible <600px.

## Prérequis

| Asset                                                        | Status                                     | Note                                                    |
| ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------- |
| Simulateur aides rénovation V1                               | ✅ Live `/simulateur-aides-renovation`     | URL existante = ancrage CTA universel                   |
| Pillar `/rge` (49K artisans)                                 | ✅ Action #3 livré                         | Lien preuve E-E-A-T sur chaque LP                       |
| Pillar `/cee` (24 ops)                                       | ✅ Action #9 title rewrite livré           | Lien preuve montants CEE                                |
| Schéma `Service` + `GovernmentService` réutilisable          | ⚠️ À factoriser dans `src/lib/seo/schema/` | Composant `LpSchemaBlock` pour économiser dev           |
| Composant `LpHeroSimulator` (CTA + photo + score Trustpilot) | ❌ À coder                                 | Mutualisable sur 9 LP                                   |
| Cron lastmod sur `/lp/*`                                     | ❌ À étendre                               | Inclure routes LP dans `src/lib/seo/lastmod-queries.ts` |

## Sprint LP — sequencing recommandé

### Sem 1 (Batch 1 — aides + simulateur, ~1.5j-dev)

- [ ] **`/lp/aides-renovation-2026`** — capture intent racine (4 sources Effy = 1 070 KW paid)
- [ ] **Boost `/simulateur-aides-renovation`** : ajouter section "Pourquoi notre simulateur" + Trustpilot above-the-fold (capture 273 KW Effy parcours)
- [ ] Intégrer `LpHeroSimulator` réutilisable
- [ ] Schema `GovernmentService` factorisé

### Sem 2 (Batch 2 — isolation, ~1j-dev)

- [ ] **`/lp/isolation-thermique-aides`** — capture 6 LP isolation (697 KW paid)
- [ ] Sections H2 : ITE (425 KW), isolation combles 1€ (129 KW), moisissure mur (108 KW)
- [ ] CTA simulateur scopé `theme=isolation`

### Sem 3 (Batch 3 — verticales énergie, ~3j-dev)

8 LP en parallèle (mutualisable via template `<LpVerticalePage cluster="...">`) :

- [ ] `/lp/pompe-a-chaleur-aides` (5 LP capturées, 329 KW paid)
- [ ] `/lp/chauffe-eau-thermodynamique-prime-cee` (2 LP, 31 KW)
- [ ] `/lp/poele-a-granules-aides` (2 LP, 30 KW)
- [ ] `/lp/climatisation-aides` (2 LP, 409 KW — premium)
- [ ] `/lp/fenetres-double-vitrage-prime` (2 LP, 45 KW)
- [ ] `/lp/chaudiere-aides-renovation` (1 LP, 176 KW)
- [ ] `/lp/adoucisseur-eau` (1 LP, 37 KW — niche mais LTV élevé)

## KPIs de succès (J+30 / J+60)

| Métrique                             | J+30 | J+60 | J+90        |
| ------------------------------------ | ---- | ---- | ----------- |
| LP indexées (sur 9 créées + 1 boost) | 6    | 9    | 10          |
| LP rankant top 10 sur ≥1 KW racine   | 2    | 5    | 7           |
| Trafic organique LP cumulé / jour    | 50   | 200  | **500-900** |
| Conversion simulateur (taux LP)      | ≥4%  | ≥6%  | ≥8%         |
| **MQL générés via LP / mois**        | 30   | 150  | **400+**    |

> ⚠️ Les LP ranquent plus vite que les pillars (intent transactionnel + structure parfaite). Si pas de top 20 à J+30 → vérifier indexation manuelle GSC + audit content quality.

## Maintenance & itération

- **Re-pull** `paid_intelligence_*.csv` post-cycle Ahrefs : **2026-05-18** (post reset)
- **Mesurer** taux de conversion LP × cluster J+30 : décider quels clusters scaler en sem 4-5
- **Si top 10 capturé** sur 3 LP racines aides → étendre à 5-7 LPs additionnelles (volets-roulants, ANAH, éco-PTZ)
- **Si conversion <4%** → A/B test Hero (CTA tel vs simulateur)

## Re-run

```bash
npx tsx scripts/analyze-lp-paid-intelligence.ts
# → idempotent, regenère lp_blueprints_top30.csv + lp_pattern_distribution.csv
```

## Liens connexes

- Action #7 (KW gap) : `docs/audit-ahrefs-2026-05-03/C_gap/KW_GAP_ATTACK_PLAN.md` — overlap KW racine entre KW gap et LP intent
- Action #6 (striking distance) : `docs/audit-ahrefs-2026-05-03/E_site/STRIKING_DISTANCE_PLAN.md` — pages existantes à booster, complémentaires aux LP
- Action #10 (backlinks) : `docs/audit-ahrefs-2026-05-03/D_backlinks/OUTREACH_BACKLINKS_PLAYBOOK.md` — pitch LP `/lp/aides-renovation-2026` aux Tier 1 Press post-livraison
