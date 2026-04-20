# Service Intents Playbook — splitting `/services/[service]/[ville]`

**Date** : 2026-04-20
**Code** : `src/lib/seo/service-intents.ts`, `src/components/seo/UrgencyBlock.tsx`, `src/components/seo/ServiceIntentReroute.tsx`, `src/app/(public)/services/[service]/[location]/page.tsx`
**Tests** : `__tests__/lib/seo/service-intents.test.ts` (23), `__tests__/components/seo/intent-routing.test.tsx` (8) — 31 tests verts
**Commit** : voir `git log -- src/lib/seo/service-intents.ts`

---

## Problème résolu

Le template `/services/[service]/[ville]` servait **la même grille éditoriale à TOUS les services**, quel que soit l'intent de recherche :

- `MiniSimulateurInline` (simulateur MaPrimeRénov') above-the-fold
- `PrimesCEEBlock` (CEE / aides énergétiques)
- `ContexteDPEBlock` (DPE de la commune)
- `CalendrierSaisonnierBlock` (meilleur mois pour travaux ITE)

Conséquence : sur `/services/plombier/paris` (intent **URGENCE dépannage**), l'utilisateur recevait un registre éditorial **rénovation énergétique** hors-sujet. Google voit 2 intents sur une même URL = signal thin = déclassement (pattern People-first guidelines §4.6.5/4.6.6 — travaux.com −18% en 2025).

Les audits Ahrefs (`MASTER-PLAN-03-CONTENT`, `KEYWORDS-ANALYSIS`) confirment : `/services/plombier/paris` est un **Core Directory TYPE C**, pas un pillar rénovation. Le pillar RGE vit sur ses propres URLs (`/services/chauffagiste/paris`, `/renovation-energetique/`, etc.).

## Solution — taxonomie intent + rendu conditionnel

### 1. Classification des services (`service-intents.ts`)

| Intent               | Services                                                                                                                                                                    | Registre éditorial                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **URGENCE**          | plombier, serrurier, electricien, vitrier, ramoneur, desinsectisation, deratisation, ascensoriste                                                                           | 24h/24, dépannage, devis 2h, CTA rappel. Pas d'aides, pas de YMYL.                  |
| **RÉNOVATION**       | chauffagiste, pompe-a-chaleur, panneaux-solaires, isolation-thermique, renovation-energetique, climaticien, borne-recharge, diagnostiqueur, etancheiste, zingueur, facadier | RGE, MaPrimeRénov', CEE, E-E-A-T YMYL, baromètre prix, calendrier saisonnier        |
| **TRAVAUX** (défaut) | tous les autres (peintre, menuisier, maçon, carreleur, jardinier, paysagiste, déco, cuisiniste, domoticien, …)                                                              | Devis gratuit, artisans vérifiés SIREN, photos avant/après, pas d'angle énergétique |

**Invariant testé** : aucun slug n'appartient simultanément à URGENCE et RÉNOVATION.

### 2. Title + H1 + Meta description intent-aware

Chaque intent a son propre bundle de variants générés dans le même module :

- `getIntentTitleVariants(intent, ctx)` — variants SEO title
- `getIntentH1Variants(intent, ctx)` — variants H1 SSR
- `getIntentMetaDescription(intent, ctx)` — description OG/Twitter/meta

**Signature CTR par intent** (invariants testés) :

| Intent     | Title template                               | Signal obligatoire                          |
| ---------- | -------------------------------------------- | ------------------------------------------- |
| urgence    | `Plombier Paris 24h/24 · Intervention 2026`  | `24h\|dépannage\|urgence\|rapide`           |
| renovation | `Chauffagiste RGE Lyon · MaPrimeRénov' 2026` | `RGE\|MaPrimeRénov'\|CEE\|aides\|certifiés` |
| travaux    | `Peintre Toulouse 2026 — Devis Gratuit`      | **Aucun** signal urgence ni rénovation      |

Le prefix CTR (`4.8★ (128 avis) · `) de Sprint 2 reste injecté sur tous les intents via `reviewPrefix`.

### 3. Rendu conditionnel (`page.tsx`)

```tsx
const pageIntent = getServiceIntent(serviceSlug)
const renderRenovationBlocks = shouldRenderRenovationBlocks(pageIntent) // true si 'renovation'
const renderUrgencyBlock = shouldRenderUrgencyBlock(pageIntent)         // true si 'urgence'

{renderUrgencyBlock && <UrgencyBlock ... />}
{renderRenovationBlocks && <MiniSimulateurInline ... />}
{renderRenovationBlocks && <ContexteDPEBlock ... />}
{renderRenovationBlocks && <CalendrierSaisonnierBlock ... />}
{renderRenovationBlocks && <PrimesCEEBlock ... />}
```

### 4. Cross-intent reroute (`ServiceIntentReroute.tsx`)

Rendu en pied de page (après `MaillageInterneBlock`). 1 lien `<a href>` contextuel vers un sibling d'intent DIFFÉRENT. Capte le volume adjacent sans polluer le registre courant.

| Source page                  | Reroute cible (intent différent) |
| ---------------------------- | -------------------------------- |
| plombier (urgence)           | → chauffagiste (renovation)      |
| electricien (urgence)        | → borne-recharge (renovation)    |
| ramoneur (urgence)           | → chauffagiste (renovation)      |
| chauffagiste (renovation)    | → plombier (urgence)             |
| climaticien (renovation)     | → electricien (urgence)          |
| pompe-a-chaleur (renovation) | → plombier (urgence)             |

**Invariant testé** : aucun reroute ne pointe vers un target de même intent.

### 5. UrgencyBlock (`UrgencyBlock.tsx`)

Bloc visuel dédié pour les services URGENCE. Remplace le mini-simulateur aides (off-intent). 4 signaux above-the-fold :

1. Délai moyen d'intervention (depuis `trade.averageResponseTime`, fallback "Sous 2h")
2. Compteur artisans disponibles (SSR depuis `providerCount`)
3. Badge 24h/24 · 7j/7
4. CTA `Être rappelé en < 15 min` → ancre `#callback-request`

100% SSR, zéro JS client — Googlebot voit le signal urgence dans le HTML.

## Qu'est-ce que ça change concrètement pour `/services/plombier/paris`

**Avant** :

- Title : `Plombier Paris 2026 — Devis Gratuit`
- H1 : `Plombier à Paris`
- Above-the-fold : ImmediateAnswerBlock + DemandIndicator + GeoPageCTA + **MiniSimulateur aides (hors-sujet)**
- pSEO : DPE + Calendrier + **PrimesCEE (hors-sujet)** + Baromètre + Maillage
- Meta : générique `Trouvez un plombier à Paris…`

**Après** :

- Title : `Plombier Paris 24h/24 · Intervention 2026` (signal urgence explicite)
- H1 : `Plombier à Paris — intervention 24h/24`
- Above-the-fold : ImmediateAnswerBlock + DemandIndicator + GeoPageCTA + **UrgencyBlock** (délai, compteur, CTA rappel)
- pSEO : RisquesGeo + Baromètre + CommuneContext + Comparatifs + Maillage (blocs rénovation masqués)
- Meta : `42 artisans vérifiés à Paris · Dépannage plombier 24h/24, intervention sous 2h, devis gratuit 2026…`
- Footer : `ServiceIntentReroute` → lien vers `/services/chauffagiste/paris` pour capter le volume rénovation adjacent

## Qu'est-ce que ça change pour `/services/chauffagiste/paris`

**Avant** : même template que plombier, difficile de signaler le pillar RGE au moteur.

**Après** :

- Title : `Chauffagiste RGE Paris · MaPrimeRénov' 2026`
- H1 : `Chauffagiste RGE à Paris — artisans certifiés`
- Above-the-fold : MiniSimulateur aides (maintenant dans son vrai registre)
- pSEO : DPE + Calendrier + PrimesCEE affichés (pertinents)
- Footer : reroute → `/services/plombier/paris` pour capter la fuite/panne

## Tests

```bash
npx vitest run __tests__/lib/seo/service-intents __tests__/components/seo/intent-routing
# Test Files  2 passed (2)
# Tests       31 passed (31)
```

Couverture :

- Classification (4 tests) + invariant disjonction (1 test)
- Block gating (2 tests)
- Title variants par intent (4 tests)
- H1 variants par intent (3 tests)
- Meta descriptions par intent (4 tests)
- Cross-intent reroute (6 tests)
- UrgencyBlock rendering (4 tests)
- ServiceIntentReroute rendering (4 tests)

## Roadmap

**Phase 2** (non livré) :

- Appliquer le même split à `/villes/[ville]` (intent global ville — métropole = rénovation, petite ville = travaux classiques)
- Dashboard GSC → promoter automatiquement un service de TRAVAUX vers RÉNOVATION si > 10% des impressions viennent de requêtes RGE/aides
- A/B test CTR sur 30 jours post-déploiement — mesurer le lift par intent
