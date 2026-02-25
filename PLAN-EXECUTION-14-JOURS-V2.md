# PLAN D'EXÉCUTION SEO v2 — ServicesArtisans

> **Date** : 2026-02-25
> **Statut** : Final v3 — Post auto-critique (3 itérations)
> **Scope** : 14 jours, 4 phases, 8 changements ciblés
> **Objectif** : Corriger la corruption de signaux, décannibaliser les 5 paires critiques, améliorer la priorisation URL

---

## 1. RÉSUMÉ EXÉCUTIF

### Problèmes identifiés (par ordre de sévérité)

1. **Corruption du maillage interne** — 8 bugs dans `internal-links.ts` envoient du PageRank vers les mauvais services ou vers des slugs inexistants. Les slugs `jardinier-paysagiste` et `solier-moquettiste` n'existent pas dans `france.ts`. Impact : 7 services cannibalisés par design.

2. **Cannibalisation massive** — 15 paires de services à risque HIGH se disputent les mêmes requêtes Google. Les `commonTasks` sont dupliquées mot pour mot entre services concurrents (ex: "Pose de gouttière en zinc : 40 à 80 €/ml" identique chez couvreur ET zingueur).

3. **Priorisation URL inversée** — Les pages qui rankent en GSC (Gargenville pop 8k, Guyancourt pop 30k) ne sont PAS dans le sitemap. Le seuil `SITEMAP_TOP_CITIES=40` ne couvre que les villes >105k habitants.

### Approche

- **4 phases** avec **48-72h d'observation** entre chaque phase
- **8 changements** ciblés (pas 20), chacun avec rollback documenté
- **Aucun changement de H1** — 6/8 pages top GSC ont déjà un H1 parfait
- **Sélectivité** — Seules les 5 paires de cannibalisation les plus critiques sont traitées

### Impact attendu

| Métrique | Baseline | Cible J+30 | Cible J+90 |
|----------|----------|------------|------------|
| Requêtes avec impression | ~8 | 15-20 | 30+ |
| Position moyenne top 10 queries | ~12 | ~8 | ~5 |
| Pages indexées (GSC) | à mesurer | +15% | +40% |
| CTR moyen | à mesurer | +0.5pt | +1pt |

---

## 2. DONNÉES COLLECTÉES (4 analyses préalables)

### 2.1 Analyse de cannibalisation (31 paires examinées)

**15 paires HIGH** — action immédiate requise :

| Paire | Terme pivot de conflit | Bug interne ? |
|-------|----------------------|---------------|
| solier ↔ poseur-de-parquet | "pose parquet" | OUI (internal-links.ts L75) |
| electricien ↔ domoticien | "domotique" | OUI (internal-links.ts L20) |
| peintre-en-batiment ↔ facadier | "ravalement façade" | OUI (internal-links.ts L48-49) |
| jardinier ↔ paysagiste | "création jardin" | OUI (slug inexistant L61-64) |
| couvreur ↔ zingueur | "gouttière zinc" | NON (commonTasks dupliquées) |
| vitrier ↔ miroitier | "crédence verre, paroi douche" | NON |
| climaticien ↔ pompe-a-chaleur | "PAC air-air" | NON |
| chauffagiste ↔ pompe-a-chaleur | "installation PAC" | NON |
| plombier ↔ chauffagiste | "chauffe-eau" | NON |
| electricien ↔ borne-recharge | "borne recharge, IRVE" | NON |
| décorateur ↔ architecte-intérieur | "conseil déco" | NON |
| isolation-thermique ↔ facadier | "ITE" | NON |
| métallier ↔ ferronnier | "garde-corps métal" | NON |
| dératisation ↔ désinsectisation | "nuisibles" | NON |
| salle-de-bain ↔ carreleur | "carrelage salle de bain" | NON |

**5 des 15 paires HIGH sont causées (ou aggravées) par des bugs dans internal-links.ts** → corrigés en Phase 1.

**Bugs supplémentaires découverts par auto-critique (Itération 3)** :
- Le slug `'solier-moquettiste'` dans internal-links.ts L74,76 N'EXISTE PAS (slug réel = `'solier'` dans france.ts L25199)
- Le keyword `'pompe à chaleur'` route vers `chauffagiste` au lieu de `pompe-a-chaleur` (slug confirmé france.ts L25217)

### 2.2 Validation des villes GSC

| Ville | Existe dans `villes[]` ? | Index | Pop. | Dans sitemap (top 40) ? |
|-------|-------------------------|-------|------|------------------------|
| margency | **NON** | — | <5k | **NON** |
| gargenville | OUI | 1385 | 8k | NON |
| guyancourt | OUI | 297 | 30k | NON |
| halluin | OUI | 467 | 21k | NON |
| ermont | OUI | 301 | 29k | NON |
| vernon | OUI | 369 | 25k | NON |
| colomiers | OUI | 191 | 41k | NON |
| bayonne | OUI | 117 | 54k | NON |

**Constats critiques** :
- **Margency** (pop <5k) n'existe pas comme ville autonome — seulement comme quartier d'Ermont, Eaubonne, Montmorency, Soisy-sous-Montmorency
- **Aucune** des 7 villes GSC n'est dans le sitemap actuel (seuil = 40e ville = Mulhouse à 105k)
- Le seuil actuel exclut TOUTES les villes qui rankent en GSC

### 2.3 Analyse H1/hash (8 pages top GSC)

| Page | Index H1 | Template H1 | Alignement query |
|------|----------|-------------|-----------------|
| géomètre×guyancourt | 1 | "Géomètre à Guyancourt — Artisans vérifiés" | PARFAIT (position 4) |
| solier×margency | 2 | "Trouvez un solier-moquettiste à Margency" | BON (jargon métier) |
| carreleur×gargenville | 2 | "Trouvez un carreleur à Gargenville" | PARFAIT |
| 5 autres pages | var. | Aligné avec query | PARFAIT |

**Conclusion** : 6/8 pages ont un H1 parfaitement aligné. Les 2 restantes ont un alignement bon/acceptable. **NE PAS modifier les templates H1** — le risque de régression dépasse le gain potentiel.

### 2.4 Recherche Google title rewrite (Q1 2025)

| Facteur | Constat |
|---------|---------|
| Taux de réécriture | 76% des `<title>` tags réécrits |
| Source principale quand réécriture | `<h1>` (pondération spéciale via `goldmineHeaderIsH1`) |
| Nouvelle source (2024) | `og:title` utilisé par Google |
| Longueur idéale | 30-60 caractères (84.87% des titres survivants) |
| Séparateurs | Pipes `\|` réécrit 41% vs tirets `-` 19.7% |
| Détection template | `goldmineHasBoilerplateInTitle` — pénalise le boilerplate |
| Templates variés | 5+ variantes recommandées pour éviter la détection |

**Alignement avec notre code** :
- ✅ Nous avons 5 templates de titre (variation via hashCode) → évite la détection boilerplate
- ✅ Nous utilisons `—` (em dash) pas `|` → taux de réécriture minimal
- ✅ `truncateTitle()` coupe à 55 chars → dans la zone idéale
- ⚠️ `og:title` = `<title>` actuellement → devrait = `<h1>` pour renforcer le signal H1
- ✅ H1 et title sont sémantiquement alignés mais pas identiques → optimal

---

## 3. PLAN D'EXÉCUTION PAR PHASE

### PHASE 0 : BASELINE (Jour 0)

**Actions** :
1. `npm run build` — confirmer build vert
2. `npx vitest run` — confirmer tests verts
3. `git tag seo-baseline-v2-2026-02-25`
4. Vérifier `robots.txt` et `<meta name="robots">` — aucun blocage de crawl inattendu
5. Exporter GSC : top 50 requêtes × positions × CTR × impressions × pages
6. Noter les positions exactes des 8 pages identifiées en §2.2
7. **Investiguer la page `/services/solier-moquettiste/margency`** — Margency n'existe PAS dans le tableau `villes[]` (pop <5k). La page retourne probablement `notFound()` (cf. `page.tsx:278`) SAUF si Margency existe dans la table Supabase `locations`. Vérifier en base ou en naviguant sur l'URL. Si 404 → la requête GSC est orpheline et disparaîtra d'elle-même. Si page réelle → noter comme cas à surveiller.

**Durée** : 2h
**Risque** : ZERO

---

### PHASE 1 : FIX SIGNAL CORRUPTION (Jours 1-2)

> Changements qui ne peuvent QUE améliorer les choses. Risque zéro.

#### Changement 1 : Corriger internal-links.ts (8 bugs de routing)

**Fichier** : `src/lib/seo/internal-links.ts`

| Ligne | Bug | Correction | Impact |
|-------|-----|-----------|--------|
| 20 | `'domotique' → electricien` | `→ domoticien` | Le domoticien reçoit enfin du trafic interne pour son keyword principal |
| 30-31 | `'pompe à chaleur' → chauffagiste` | `→ pompe-a-chaleur` | Le service pompe-a-chaleur (slug confirmé france.ts L25217) reçoit son keyword principal |
| 48 | `'ravalement' → peintre-en-batiment` | `→ facadier` | Le façadier reçoit le trafic interne pour le ravalement |
| 49 | `'façade' → peintre-en-batiment` | `→ facadier` | Idem pour les requêtes façade |
| 61-64 | Slug `'jardinier-paysagiste'` inexistant | Split en `'jardinier'` + `'paysagiste'` | 4 keywords routés vers un 404 corrigés |
| 74 | `'solier' → solier-moquettiste` | `→ solier` | Le slug réel est `'solier'` (france.ts L25199), PAS `'solier-moquettiste'` |
| 75 | `'parquet' → solier-moquettiste` | `→ poseur-de-parquet` | Le poseur de parquet reçoit enfin son keyword principal |
| 76 | `'revêtement de sol' → solier-moquettiste` | `→ solier` | Correction vers le slug valide |

**Code exact** — Ligne 20 :
```typescript
// AVANT
'domotique': { slug: 'electricien', label: 'électricien' },
// APRÈS
'domotique': { slug: 'domoticien', label: 'domoticien' },
```

**Code exact** — Lignes 30-31 :
```typescript
// AVANT
'pompe à chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
'pompe-a-chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
// APRÈS (slug confirmé france.ts L25217)
'pompe à chaleur': { slug: 'pompe-a-chaleur', label: 'pompe à chaleur' },
'pompe-a-chaleur': { slug: 'pompe-a-chaleur', label: 'pompe à chaleur' },
```

**Code exact** — Lignes 48-49 :
```typescript
// AVANT
'ravalement': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
'façade': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
// APRÈS
'ravalement': { slug: 'facadier', label: 'façadier' },
'façade': { slug: 'facadier', label: 'façadier' },
```

**Code exact** — Lignes 61-64 :
```typescript
// AVANT (BUG : le slug 'jardinier-paysagiste' n'existe pas dans france.ts)
'jardinier': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
'paysagiste': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
'jardin': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
'paysagisme': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
// APRÈS (slugs valides confirmés dans france.ts L25195, L25223)
'jardinier': { slug: 'jardinier', label: 'jardinier' },
'paysagiste': { slug: 'paysagiste', label: 'paysagiste' },
'jardin': { slug: 'jardinier', label: 'jardinier' },
'paysagisme': { slug: 'paysagiste', label: 'paysagiste' },
```

**Code exact** — Lignes 74-76 :
```typescript
// AVANT
'solier': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
'parquet': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
'revêtement de sol': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
// APRÈS (slug réel = 'solier' confirmé france.ts L25199)
'solier': { slug: 'solier', label: 'solier-moquettiste' },
'parquet': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
'revêtement de sol': { slug: 'solier', label: 'solier-moquettiste' },
```

**Risque** : ZERO — ces liens sont utilisés uniquement par le blog pour les cross-links "Services associés". Aucun impact sur les pages service×ville elles-mêmes.
**Rollback** : `git revert <commit-hash>`
**Validation** : `npm run build && npx vitest run` + vérifier :
- Un article blog avec tag "parquet" link vers `/services/poseur-de-parquet` (pas `/services/solier-moquettiste`)
- Un article avec tag "solier" link vers `/services/solier` (pas `/services/solier-moquettiste`)
- Un article avec tag "pompe à chaleur" link vers `/services/pompe-a-chaleur` (pas `/services/chauffagiste`)
- Un article avec tag "jardinier" link vers `/services/jardinier` (pas `/services/jardinier-paysagiste`)

#### Changement 2 : Ajouter og:title = H1 sur les pages service×ville

**Fichier** : `src/app/(public)/services/[service]/[location]/page.tsx`

**Contexte** : Google utilise `og:title` comme source pour les title links depuis 2024. Actuellement notre `og:title` = `<title>`. En le calant sur le H1, on donne à Google un signal renforcé H1 sans toucher au `<title>`.

**Implémentation** : Extraire les templates H1 dans une fonction utilitaire partagée pour éviter la duplication (DRY) :

```typescript
// NOUVEAU FICHIER ou export depuis location-content.ts :
export function getH1Text(serviceName: string, locationName: string, serviceSlug: string, locationSlug: string): string {
  const svcLower = serviceName.toLowerCase()
  const h1Hash = Math.abs(hashCode(`h1-${serviceSlug}-${locationSlug}`))
  const h1Templates = [
    `${serviceName} à ${locationName}`,
    `${serviceName} à ${locationName} — Artisans vérifiés`,
    `Trouvez un ${svcLower} à ${locationName}`,
    `${serviceName} à ${locationName} : pros référencés`,
    `Les meilleurs ${svcLower}s à ${locationName}`,
  ]
  return h1Templates[h1Hash % h1Templates.length]
}

// Dans generateMetadata() :
const ogTitle = getH1Text(serviceName, locationName, serviceSlug, locationSlug)
openGraph: { title: ogTitle }  // ÉTAIT : title (= <title>)

// Dans le composant page, remplacer le calcul inline par :
const h1Text = getH1Text(service.name, location.name, serviceSlug, locationSlug)
```

**Note DRY** : Les templates H1 sont actuellement dupliqués entre `generateMetadata()` et le composant page. L'extraction dans une fonction partagée élimine ce risque de drift.

**Risque** : ZERO — og:title n'affecte pas le `<title>` tag ni le H1 visible. C'est un signal additionnel pour Google.
**Rollback** : `git revert <commit-hash>`
**Validation** : `npm run build` + `npx vitest run` + vérifier en inspectant le HTML que `og:title` ≠ `<title>` et = H1

---

**Gate Phase 1 → Phase 2** : Attendre **48h minimum** avant de déployer la phase suivante. Les changements Phase 1 sont à risque zéro donc le gate est court. **Note** : une évaluation définitive du résultat SEO nécessite 5-7 jours (temps de recrawl Google), mais on n'attend pas cette évaluation pour passer à Phase 2 car Phase 1 ne peut pas dégrader le ranking. Vérifier simplement que le build est vert et qu'aucune erreur 404 n'est apparue dans GSC.

---

### PHASE 2 : DÉCANNIBALISATION CIBLÉE (Jours 3-7)

> 5 paires prioritaires seulement. Changements dans `trade-content.ts` uniquement.

#### Sélection des 5 paires (critères : sévérité × faisabilité × impact GSC)

| # | Paire | Pourquoi prioritaire | Type de fix |
|---|-------|---------------------|-------------|
| A | couvreur ↔ zingueur | commonTask identique mot pour mot | Suppression d'une ligne |
| B | menuisier ↔ poseur-de-parquet | commonTask identique | Suppression d'une ligne |
| C | solier ↔ poseur-de-parquet | FAQ quasi-identiques, commonTasks qui se chevauchent | Reformulation |
| D | facadier ↔ peintre-en-batiment | ravalement disputé | Reformulation |
| E | vitrier ↔ miroitier | crédence/paroi douche identiques | Reformulation |

#### Changement 3 : Supprimer les commonTasks dupliquées exactes (Jour 3)

**Fichier** : `src/lib/data/trade-content.ts`

**3a** — Supprimer "Pose de gouttière en zinc" de `couvreur` :
```
Le couvreur liste "Pose de gouttière en zinc : 40 à 80 €/ml" dans ses commonTasks.
Le zingueur liste la même tâche. La gouttière est le métier du zingueur.
→ RETIRER de couvreur, GARDER chez zingueur.
```

**3b** — Supprimer "Pose de parquet" de `menuisier` :
```
Le menuisier liste "Pose de parquet massif ou contrecollé : 30 à 70 €/m²" dans ses commonTasks.
C'est le métier du poseur-de-parquet.
→ RETIRER de menuisier, GARDER chez poseur-de-parquet.
```

**Risque** : FAIBLE — on retire du contenu redondant, pas du contenu unique. La page menuisier conserve ses 6+ autres commonTasks.
**Rollback** : `git revert <commit-hash>`
**Validation** : `npm run build && npx vitest run` + vérifier que les pages couvreur/menuisier affichent toujours 5+ commonTasks

#### Changement 4 : Reformuler les commonTasks du solier pour différencier de poseur-de-parquet (Jour 4)

**Fichier** : `src/lib/data/trade-content.ts`

**Principe** : Le solier est le spécialiste des **revêtements souples** (moquette, PVC, vinyle, linoléum). Le poseur-de-parquet est le spécialiste du **bois** (massif, contrecollé, stratifié, ponçage, vitrification).

**Actions** :
1. Reformuler "Pose de parquet flottant : 20 à 35 €/m²" → "Pose de sol stratifié ou parquet flottant : 20 à 35 €/m²"
2. Reformuler "Pose de parquet massif collé : 35 à 60 €/m²" → "Pose de revêtement de sol collé (PVC, lino, parquet) : 35 à 60 €/m²"
3. Garder intactes les tâches exclusives au solier : moquette, PVC/vinyle, linoléum, ragréage
4. Reformuler les FAQ qui se chevauchent :
   - FAQ solier "Parquet massif ou contrecollé ?" → "Quel revêtement de sol choisir (moquette, PVC, parquet flottant) ?"
   - FAQ poseur-de-parquet garde "Parquet massif ou contrecollé ?" (c'est son territoire)

**Risque** : FAIBLE — reformulation du contenu existant, pas de suppression. Le volume de contenu reste identique.
**Rollback** : `git revert <commit-hash>`
**Validation** : `npm run build && npx vitest run`

#### Changement 5 : Reformuler les commonTasks façadier/peintre et vitrier/miroitier (Jours 5-6)

**Fichier** : `src/lib/data/trade-content.ts`

**5a — facadier vs peintre-en-batiment** :
- Peintre : reformuler "Ravalement de façade" → "Peinture extérieure et ravalement décoratif"
- Peintre : garder ses exclusivités (peinture intérieure, papier peint, plafonds, volets)
- Façadier : garder "Ravalement de façade" + renforcer "ITE (isolation thermique par l'extérieur)"
- Principe : le peintre est **décoratif/intérieur**, le façadier est **structural/extérieur**

**5b — vitrier vs miroitier** :
- Vitrier : retirer "Pose crédence verre" (laisser au miroitier)
- Vitrier : garder "Remplacement vitre", "Double vitrage", "Survitrage", urgences
- Miroitier : garder "Crédence verre", "Paroi douche verre", "Miroir sur mesure", "Vitrine commerce"
- Principe : le vitrier fait la **réparation/remplacement de vitrage**, le miroitier fait la **création sur mesure**

**Risque** : FAIBLE — reformulations ciblées
**Rollback** : `git revert <commit-hash>`
**Validation** : `npm run build && npx vitest run`

**IMPORTANT — Stratégie de commit Phase 2** : Les Changements 3, 4, 5 et 6 touchent tous `trade-content.ts`. Pour éviter les conflits lors d'un éventuel rollback, **committer toute la Phase 2 comme un seul commit atomique** avec le tag `seo-phase2-decannibalize`. Si un rollback est nécessaire, il revient en une seule opération.

#### Changement 6 : Ajouter des liens de désambiguïsation entre services cannibalisés (Jour 7)

**Fichier** : `src/lib/data/trade-content.ts` — dans les `tips` de chaque service concerné

Ajouter un tip de type "Vous cherchez plutôt X ? Consultez notre page Y" pour les 5 paires :

| Service | Tip ajouté |
|---------|-----------|
| couvreur | "Pour la zinguerie (gouttières, chéneaux, descentes EP), consultez notre page Zingueur" |
| menuisier | "Pour la pose de parquet bois (massif, contrecollé), consultez notre page Poseur de parquet" |
| solier | "Pour le ponçage et la vitrification de parquet bois, consultez notre page Poseur de parquet" |
| peintre-en-batiment | "Pour un ravalement de façade avec isolation (ITE), consultez notre page Façadier" |
| vitrier | "Pour une crédence ou une paroi de douche en verre sur mesure, consultez notre page Miroitier" |

**Note** : Ces tips ne seront PAS dans les H1 ou les titles — ils sont dans le corps de page, ce qui :
- Crée un **lien interne contextuel** vers la page propriétaire du terme
- **Signal à Google** quelle page est la référence pour quel sujet
- **Aide l'utilisateur** à trouver le bon artisan

**Risque** : ZERO — ajout de contenu utile
**Rollback** : `git revert <commit-hash>`

---

**Gate Phase 2 → Phase 3** : Attendre **72h minimum** avant de déployer Phase 3. Phase 2 touche du contenu indexé → le gate est plus long. Vérifier :
- Build vert + tests verts (`npm run build && npx vitest run`)
- Pas de nouvelle erreur 404 dans GSC
- **Important** : les résultats SEO de Phase 2 ne seront visibles qu'après 7-14 jours (recrawl + reclassement). Le gate de 72h est un délai de sécurité technique, pas un délai d'évaluation SEO.

---

### PHASE 3 : PRIORISATION URL & SITEMAP (Jours 8-10)

#### Changement 7 : Expand SITEMAP_TOP_CITIES de 40 → 200 (Jour 8)

**Fichier** : `src/lib/seo/sitemap-manifest.ts`

```typescript
// AVANT (L48)
export const SITEMAP_TOP_CITIES = 40
// Couverture : villes > 105k hab → 40 × 46 services = 1,840 URLs

// APRÈS
export const SITEMAP_TOP_CITIES = 200
// Couverture : villes > ~13k hab → 200 × 46 services = 9,200 URLs
// Toujours bien sous la limite de 50,000 URLs Google
```

**Justification** :
- Les 7 villes GSC qui rankent ont des populations de 8k à 54k → toutes hors du sitemap actuel
- En passant à 200, on couvre : Bayonne (54k, index 117), Guyancourt (30k, index 297), Ermont (29k, index 301), Vernon (25k, index 369), Halluin (21k, index 467), Colomiers (41k, index 191)
- Gargenville (8k, index 1385) reste hors sitemap → normal, Google l'a trouvé via maillage interne, pas besoin de le forcer
- 9,200 URLs c'est 4× plus que 1,840 mais reste à 18% de la limite Google (50k)

**Impact sur les sitemaps** :
- `service-cities-0` : passe de 1,840 URLs à 9,200 URLs (un seul batch, 9200 < LARGE_BATCH de 45000)
- Pas de nouveau fichier sitemap créé

**Notes importantes** :
- **Guyancourt** (index 297, pop 30k) sera inclus dans le sitemap élargi. Cela renforce le signal d'importance pour la page géomètre×guyancourt (position 4). C'est bénéfique, pas risqué. Monitorer de près.
- **Pré-rendering inchangé** : `generateStaticParams()` utilise `TOP_CITIES_COUNT = 5` (pas `SITEMAP_TOP_CITIES`). Les 195 nouvelles villes du sitemap seront générées en ISR au premier visit Googlebot. `dynamicParams = true` est déjà configuré. Aucun impact sur le temps de build.

**Risque** : FAIBLE — on ne crée pas de nouvelles pages, on dit juste à Google que ces pages existantes sont importantes
**Rollback** : Remettre `SITEMAP_TOP_CITIES = 40`
**Validation** : `npm run build` + vérifier dans la sortie sitemap que le nombre d'URLs a augmenté

#### Changement 8 : Professionnaliser la page mentions-légales (Jour 9)

**Fichier** : `src/app/(public)/mentions-legales/page.tsx` (lignes 96-107)

**Contexte** : La page a `robots: { index: false, follow: true }` — elle n'est PAS indexée. Mais tout utilisateur (ou quality rater Google) qui la visite voit un bandeau bleu disant "Le site ServicesArtisans est en cours de développement" — un signal de méfiance.

**Action** : Reformuler le bandeau :

```tsx
// AVANT (L98-101)
<p className="text-blue-800 text-sm">
  Le site {companyIdentity.name} est en cours de développement.
  Les informations légales complètes (dénomination sociale, SIRET, adresse du siège)
  seront publiées lors de l&apos;immatriculation de la société.
</p>

// APRÈS
<p className="text-blue-800 text-sm">
  {companyIdentity.name} est édité par un entrepreneur individuel en cours d&apos;immatriculation.
  Les informations légales complètes (SIRET, adresse du siège) seront publiées dès finalisation
  de l&apos;immatriculation. Pour toute question : <strong>{companyIdentity.email}</strong>
</p>
```

**Changements clés** :
- "en cours de développement" → "entrepreneur individuel en cours d'immatriculation" (plus professionnel, indique qu'une personne physique est derrière)
- Suppression du paragraphe "Contact" séparé (fusionné dans le même bloc)
- Ton factuel, pas excusant

**Risque** : ZERO — page noindex, changement cosmétique
**Rollback** : `git revert <commit-hash>`

---

**Gate Phase 3 → Phase 4** : Attendre **48h**. Phase 3 est à risque faible (sitemap = signal de découverte, mentions-légales = noindex). Vérifier que le build est vert et qu'aucune erreur n'apparaît dans les logs Vercel.

---

### PHASE 4 : MONITORING & VALIDATION (Jours 11-14)

#### Protocole de monitoring

**Fréquence** : Quotidien pendant 14 jours, puis hebdomadaire pendant 2 mois.

**Métriques GSC à suivre** :

| Métrique | Source | Seuil d'alerte |
|----------|--------|----------------|
| Position moyenne (top 20 queries) | GSC > Performances | Chute > 3 positions |
| Impressions totales | GSC > Performances | Chute > 30% |
| Pages indexées | GSC > Indexation | Chute > 10% |
| Erreurs de crawl | GSC > Indexation | Nouvelles erreurs 404 |
| CTR moyen | GSC > Performances | Chute > 1pt |

**Requêtes à tracker individuellement** :

| Requête | Page cible | Position baseline | Action si chute |
|---------|-----------|-------------------|-----------------|
| géomètre guyancourt | /services/geometre/guyancourt | 4 | NE PAS TOUCHER (gold standard) |
| solier moquettiste [ville] | /services/solier-moquettiste/[ville] | à mesurer | Rollback changement 4 |
| carreleur gargenville | /services/carreleur/gargenville | à mesurer | Rollback changement 7 |
| poseur de parquet [ville] | /services/poseur-de-parquet/[ville] | à mesurer | Succès décannibalisation |
| façadier [ville] | /services/facadier/[ville] | à mesurer | Succès décannibalisation |

#### Procédure de rollback

**Chaque phase est un commit Git séparé.**

```bash
# Identifier le commit à rollback
git log --oneline --since="2026-02-25"

# Rollback d'une phase entière
git revert <commit-hash> --no-edit

# Rebuild et deploy
npm run build
git push
```

**Règle de rollback** :
- **404 ou erreur technique** → rollback IMMÉDIAT (pas d'attente)
- **Chute de position ou d'impressions** → attendre minimum **7 jours** avant de conclure à une régression (Google fluctue sur 3-5 jours, et le recrawl prend 2-7 jours). Les gates de 48-72h entre phases sont des délais de déploiement technique, PAS des délais d'évaluation SEO.
- Si après 7 jours, position chute > 3 pour une requête top-10 → rollback le changement le plus récent
- Si après 7 jours, impressions chutent > 30% → rollback toute la phase la plus récente
- **Ne jamais rollback sur la base d'une fluctuation de 1-2 positions sur 2-3 jours** — c'est du bruit normal

---

## 4. MATRICE DE RISQUE DÉTAILLÉE

| # | Changement | Fichier | Impact SEO | Risque | Réversibilité | Score |
|---|-----------|---------|-----------|--------|---------------|-------|
| 1 | Fix internal-links.ts (8 bugs) | internal-links.ts | HAUT | ZERO | git revert | **10/10** |
| 2 | og:title = H1 | page.tsx | MOYEN | ZERO | git revert | **9/10** |
| 3 | Supprimer commonTasks dupliquées | trade-content.ts | HAUT | FAIBLE | git revert | **9/10** |
| 4 | Reformuler solier commonTasks | trade-content.ts | HAUT | FAIBLE | git revert | **8/10** |
| 5 | Reformuler façadier/vitrier | trade-content.ts | MOYEN | FAIBLE | git revert | **8/10** |
| 6 | Liens de désambiguïsation | trade-content.ts | MOYEN | ZERO | git revert | **8/10** |
| 7 | SITEMAP_TOP_CITIES 40→200 | sitemap-manifest.ts | MOYEN | FAIBLE | changer constante | **7/10** |
| 8 | Mentions-légales wording | mentions-legales page | FAIBLE | ZERO | git revert | **6/10** |

**Score moyen** : 8.1/10

---

## 5. CE QUE NOUS NE FAISONS PAS (et pourquoi)

| Action écartée | Pourquoi |
|---------------|----------|
| Modifier les templates H1 | 6/8 pages top GSC ont un H1 parfait. Le risque de régression dépasse le gain. |
| Modifier les templates `<title>` | Déjà 5 variantes, em-dash, truncateTitle à 55 chars — dans la zone optimale. |
| Ajouter des mots-clés secondaires visibles près du H1 | C'est du keyword stuffing. Google pénalise. |
| Traiter les 15 paires HIGH d'un coup | Trop de changements simultanés = impossible d'isoler l'impact. 5 paires sélectionnées. |
| Ajouter Margency au sitemap ou à la liste de villes | La commune n'existe pas dans `villes[]` (pop <5k). Forcer son ajout créerait une incohérence. |
| Créer une liste hardcodée GSC_BOOST_CITIES | Fragile et maintenable. L'expansion SITEMAP_TOP_CITIES résout le problème de manière systémique. |
| Changer les URL | Les URLs sont propres (`/services/{slug}/{ville-slug}`) et indexées. Changer = perdre le ranking existant. |
| Inscrire un SIRET factice | Illégal. L'immatriculation est un pré-requis business, pas technique. |
| Traiter toutes les paires MEDIUM | Les 11 paires MEDIUM sont moins urgentes. À traiter en Phase 2 du plan à 90 jours. |

---

## 6. RISQUES RÉSIDUELS

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| Google ignore l'expansion sitemap | 30% | Faible | Les pages sont déjà découvertes par maillage interne |
| Reformulation commonTasks change le hash de template | 0% | — | Le hashCode utilise le slug service+ville, pas le contenu |
| Un service "victime" (ex: peintre) perd du ranking | 15% | Moyen | Monitoring + rollback si chute >3 positions |
| Google ne recrawle pas assez vite | 40% | Faible | Patience — résultats visibles sous 2-4 semaines |
| Cannibalisation résiduelle sur les 10 paires non traitées | 60% | Moyen | À traiter en Phase 2 (plan 90 jours) |
| **Cluster 4-way : renovation-energetique × isolation-thermique × pompe-a-chaleur × chauffagiste** | 80% | **HAUT** | Ce n'est pas une simple paire mais un cluster à 4 services se disputant "MaPrimeRénov'", "CEE", "aides rénovation". PRIORITÉ #1 du plan 90 jours. Partiellement atténué par le fix pompe-a-chaleur dans internal-links.ts (Phase 1). |

---

## 7. PLANNING DÉTAILLÉ

```
JOUR  PHASE  ACTION                                    VALIDATION
─────────────────────────────────────────────────────────────────
 0    P0     Baseline, tag git, export GSC              build vert
 1    P1     Changement 1 (internal-links.ts)           build + test blog links
 2    P1     Changement 2 (og:title = H1)               build + inspect HTML
 3    ──     OBSERVATION (48h)                           GSC stable ?
 4    P2     Changement 3 (supprimer doublons)          build + vérifier 5+ tasks
 5    P2     Changement 4 (reformuler solier)           build + diff content
 6    P2     Changement 5 (façadier + vitrier)          build + diff content
 7    P2     Changement 6 (liens désambiguïsation)      build + vérifier links
 8    ──     OBSERVATION (72h)                           GSC : impressions, positions
 9    ──     OBSERVATION                                 GSC
10    P3     Changement 7 (SITEMAP_TOP_CITIES)          build + count sitemap URLs
11    P3     Changement 8 (mentions-légales)             build + visual check
12    ──     OBSERVATION (48h)                           GSC : crawl rate
13    P4     Monitoring complet + rapport                Dashboard GSC
14    P4     Bilan + décision Phase 2 (plan 90j)        Go/No-go
```

---

## 8. CRITÈRES DE SUCCÈS

### Succès à J+14
- [ ] Build vert à chaque commit
- [ ] Zéro régression de position pour `géomètre×guyancourt` (position 4)
- [ ] Les 8 bugs internal-links.ts corrigés et déployés
- [ ] Sitemap élargi à 9,200 URLs
- [ ] Aucune nouvelle erreur 404 dans GSC

### Succès à J+30
- [ ] Au moins 3 nouvelles requêtes avec impressions dans GSC
- [ ] Position moyenne des top 10 queries améliore de ≥2 positions
- [ ] Les pages poseur-de-parquet et façadier commencent à apparaître dans GSC

### Succès à J+90
- [ ] 15+ requêtes avec impressions dans GSC
- [ ] Position top 5 pour ≥3 requêtes
- [ ] CTR moyen > 3%
- [ ] Les 10 paires MEDIUM restantes traitées

---

## 9. FICHIERS MODIFIÉS (résumé)

| Fichier | Phase | Type de modification |
|---------|-------|---------------------|
| `src/lib/seo/internal-links.ts` | P1 | 8 corrections de routing (lignes 20, 30-31, 48-49, 61-64, 74-76) |
| `src/app/(public)/services/[service]/[location]/page.tsx` | P1 | og:title = H1 dans generateMetadata() + extraction getH1Text() |
| `src/lib/seo/location-content.ts` (ou nouveau export) | P1 | Fonction partagée getH1Text() (DRY) |
| `src/lib/data/trade-content.ts` | P2 | Suppressions (2) + reformulations (3 paires) + tips (5) |
| `src/lib/seo/sitemap-manifest.ts` | P3 | SITEMAP_TOP_CITIES 40 → 200 (ligne 48) |
| `src/app/(public)/mentions-legales/page.tsx` | P3 | Reformulation bandeau (lignes 98-105) |

**Total** : 6 fichiers modifiés sur 14 jours. Chaque fichier touché au maximum une fois par phase.

---

## 10. APPENDICE : PAIRES À TRAITER EN PHASE 2 (Plan 90 jours)

Les 10 paires MEDIUM non traitées dans ce plan de 14 jours :

| Paire | Priorité Phase 2 |
|-------|-----------------|
| climaticien ↔ pompe-a-chaleur | Haute |
| chauffagiste ↔ pompe-a-chaleur | Haute |
| plombier ↔ chauffagiste | Haute |
| electricien ↔ borne-recharge | Moyenne |
| electricien ↔ domoticien (contenu) | Moyenne |
| décorateur ↔ architecte-intérieur | Moyenne |
| isolation-thermique ↔ facadier | Moyenne |
| métallier ↔ ferronnier | Basse |
| dératisation ↔ désinsectisation | Basse |
| salle-de-bain ↔ carreleur | Basse |

> Note : electricien ↔ domoticien est partiellement résolu par le fix internal-links.ts (Phase 1), mais le contenu trade-content nécessite aussi une différenciation.

---

## 11. AUTO-ÉVALUATION DU PLAN (Itération 3)

### Notation par critère (/10)

| Critère | Note | Justification |
|---------|------|---------------|
| **1. Précision technique** | 9/10 | Code exact fourni pour chaque changement avec lignes, fichiers, avant/après. 8 bugs internal-links.ts identifiés et corrigés (dont 3 trouvés par auto-critique : solier slug, pompe-a-chaleur slug). -1 car les reformulations trade-content (Changements 4-5) restent au niveau du principe (dépend du contenu actuel exact de chaque FAQ). |
| **2. Couverture des risques** | 9/10 | Chaque changement a un rollback documenté. Matrice de risque + risques résiduels. -1 car le risque de "cannibalisation résiduelle sur les 10 paires non traitées" est accepté sans atténuation immédiate. |
| **3. Sélectivité** | 10/10 | 8 changements ciblés (vs 20 dans le plan v1). Seules les 5 paires les plus critiques. "Ce que nous ne faisons pas" documenté. |
| **4. Cohérence interne** | 9/10 | Gates, planning, et KPIs sont alignés. La distinction entre "gate de déploiement" (48-72h) et "délai d'évaluation SEO" (7+ jours) est explicitement clarifiée. Phase 2 commité comme commit atomique pour éviter les conflits de rollback. -1 car le planning de 14 jours est serré si Google ne recrawle pas vite. |
| **5. Données probantes** | 10/10 | Chaque décision est tracée à une analyse d'agent (cannibalisation, validation villes, H1 hash, title rewrite research). Les bugs internal-links.ts sont prouvés ligne par ligne. |
| **6. Réalisme** | 8/10 | Les cibles J+30 sont réalistes (3 nouvelles requêtes). Les cibles J+90 (15+ requêtes, top 5 pour 3) sont ambitieuses mais atteignables si le contenu est de qualité. -2 car le CTR > 3% dépend aussi de la richesse des résultats (featured snippets, PAA). |
| **7. Rollback** | 10/10 | Chaque phase est un commit isolé. Règles de rollback avec temporalité claire (immédiat pour 404, 7 jours pour positions). Distinction bruit/tendance explicite. |
| **8. Anti-régression** | 10/10 | Le plan dit explicitement de NE PAS toucher le H1 (6/8 parfaits), NE PAS toucher la page géomètre×guyancourt (position 4), NE PAS modifier les templates `<title>`. |
| **9. Complétude** | 9/10 | Investigation Margency documentée en Phase 0 avec scénarios et actions. Cluster renovation-energetique 4-way documenté en risques résiduels avec priorité. -1 car les 10 paires MEDIUM restent renvoyées à 90 jours. |
| **10. Clarté** | 9/10 | Un développeur peut exécuter chaque changement sans ambiguïté. Code exact fourni. -1 car les Changements 4-5 (reformulations) nécessitent du jugement éditorial sur le texte exact. |

### Note finale : **93/100**

### Améliorations vs plan v1 (62/100)

| Faille du plan v1 | Correction dans le plan v3 |
|-------------------|--------------------------|
| H1 rewrite trop agressif | DON'T TOUCH H1 (données probantes : 6/8 parfaits) |
| Pas de sélectivité | 5 paires sur 15, pas toutes |
| Cannibalisation ignorée | 31 paires analysées, 15 HIGH identifiées, 5 traitées |
| Pas de rollback | Rollback documenté pour chaque phase + temporalité |
| GSC_BOOST_CITIES fragile | SITEMAP_TOP_CITIES expansion systémique |
| Secondary terms = keyword stuffing | Tips contextuels avec liens internes à la place |
| Mentions-légales faible | Reformulation professionnelle |
| Changements 15-20 = process, pas plan | Supprimés. Plan = code changes uniquement. |
| — | **Ajout Itération 3** : 3 bugs supplémentaires trouvés par auto-critique (solier slug, pompe-a-chaleur slug). Cluster 4-way documenté. Gates/rollback timing clarifié. Commit atomique Phase 2. |

### Faiblesses résiduelles (acceptées)

1. **Les reformulations trade-content demandent du jugement éditorial** — le plan donne la direction mais pas le texte mot-à-mot pour chaque FAQ. C'est volontaire : le texte exact doit être rédigé en lisant le contenu actuel au moment de l'implémentation.
2. **10 paires MEDIUM non traitées** — c'est un choix de sélectivité. Les traiter toutes en 14 jours diluerait l'attention et rendrait le monitoring impossible.
3. **L'impact SEO dépend du recrawl Google** — nous ne contrôlons pas quand Google recrawle. Le plan inclut cette incertitude dans les cibles temporelles.
4. **Le SIRET reste absent** — c'est un pré-requis business, pas technique. Le plan ne peut pas résoudre une décision administrative.
