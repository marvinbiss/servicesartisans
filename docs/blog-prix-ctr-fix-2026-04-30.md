# Blog `prix-*` — Fix CTR (étape 2/3 plan 140K)

**Généré 2026-04-30** · Source : GSC export 90j (29-01 → 28-04) · 7 articles concernés

## Le problème en chiffres

| URL                                                   | Pos |   Imp 90j |        CTR | Clics 90j | CTR attendu pos 6-9 |          Manque à gagner |
| ----------------------------------------------------- | --: | --------: | ---------: | --------: | ------------------: | -----------------------: |
| `/blog/prix-electricien-2026-tarifs-travaux`          | 7.1 |     1 754 |     0.11 % |         2 |               4-5 % |         **+70-86 clics** |
| `/blog/prix-installation-electrique-neuve-2026`       | 6.4 |     1 625 |     0.12 % |         2 |               4-5 % |                   +63-79 |
| `/blog/prix-plombier-2026-tarifs-horaires`            | 6.4 |     1 386 |     0.22 % |         3 |               4-5 % |                   +52-66 |
| `/blog/prix-menuisier-2026-tarifs-travaux`            | 6.1 |     1 002 |     0.30 % |         3 |               4-5 % |                   +37-47 |
| `/blog/prix-macon-2026-gros-oeuvre-renovation`        | 6.1 |       699 |     0.29 % |         2 |               4-5 % |                   +26-33 |
| `/blog/chauffage-pompe-chaleur-vs-chaudiere-gaz-2026` | 5.2 |       633 |     0.47 % |         3 |               5-6 % |                   +29-35 |
| `/blog/prix-cuisiniste-2026-pose-cuisine`             | 6.4 |       631 |     0.32 % |         2 |               4-5 % |                   +23-30 |
| **Total**                                             |   – | **7 730** | **0.23 %** |    **17** |           **4-5 %** | **+300-376 clics / 90j** |

**Soit ~125 clics/mois supplémentaires** — sans backlinks, sans contenu, sans nouvelle URL.

## Diagnostic des causes (par ordre d'impact)

### 1. SERP saturée par rich features → "pos 7" est en réalité pos 12-15 visible

Ces requêtes (« prix plombier 2026 », « prix électricien 2026 ») génèrent en SERP : Featured Snippet table + People Also Ask (×4) + carrousel images + 2-3 résultats vidéos. La position 7 organique tombe sous le pli desktop. **Stratégie** : être candidat au Featured Snippet (table 4 colonnes en H2#1, prix en gras) et capter les PAA (4 H3 question-réponse explicites courtes).

### 2. Title pas assez cliquable face aux concurrents

Concurrence en SERP : « Prix Plombier 2026 : Tarif horaire moyen + Devis Gratuit | Travaux.com », « Combien coûte un plombier en 2026 ? Le guide complet ». Notre title actuel : « Prix Plombier 2026 : Tarifs Dépannage, Réparation et Devis Gratuit » → trop long (66 chars), 3 mots-clés concaténés sans crochet [], aucune accroche.

### 3. metaDescription vague + tronquée

> "Combien coûte un plombier en 2026 ? Tarifs dépannage, réparation, installation. Comparez les prix et demandez un devis gratuit immédiat." (134 chars OK, mais zéro chiffre = aucune raison de cliquer plutôt que le rich snippet visible).

Concurrents donnent : « Tarif horaire 45-95 €/h en 2026, dépannage urgent dès 90 €. Comparez 12 plombiers près de chez vous, devis gratuit en 2 min. ».

### 4. Pas de Schema `Service` ou `Product` avec `priceRange`

Audit `src/lib/seo/blog-schema.ts` : émet uniquement `Article` + `Speakable` + (FAQ + HowTo via page). Aucun schéma `Service` / `Product` / `Offer`. Or "Extraits de produits" déjà actifs sur le site (725 clics 143 K imp d'après GSC) → **opportunité énorme** : Google peut afficher la fourchette de prix directement dans le snippet.

### 5. CTR desktop 0.52 % vs mobile 2.71 %

Cf. analyse globale GSC. Les pages prix sont consultées massivement desktop (intent recherche budget = pos professionnelle). Si la version desktop affiche un above-fold non promotionnel (juste un H1 + image), Google peut juger le contenu peu cliquable. À investiguer côté layout `[slug]/page.tsx`.

---

## Plan d'action (rangé par effort/impact)

### Action 1 — Réécriture title + meta (effort 30 min, impact immédiat)

#### Patch `src/lib/data/blog/existing-articles.ts`

**`prix-electricien-2026-tarifs-travaux`** (ligne 920) :

```diff
-    metaTitle: 'Prix Électricien 2026 : Tarif Horaire 40-85€/h + Mise aux Normes',
-    metaDescription:
-      'Prix électricien 2026 : tarif horaire 40-85€, mise aux normes 80-150€/m², dépannage 90-200€. Tarifs détaillés par région et devis gratuit en 2 min.',
+    metaTitle: 'Prix d\'un électricien en 2026 : 40-85 €/h + 12 prestations chiffrées',
+    metaDescription:
+      'Tarif horaire 40-85 €/h, mise aux normes 80-150 €/m², dépannage 90-200 €, tableau électrique 800-2 000 €. Comparatif 2026, 12 prestations + devis gratuit en 2 min.',
```

**`prix-plombier-2026-tarifs-horaires`** (ligne 578) :

```diff
-    metaTitle: 'Prix Plombier 2026 : Tarifs Dépannage, Réparation et Devis Gratuit',
-    metaDescription:
-      'Combien coûte un plombier en 2026 ? Tarifs dépannage, réparation, installation. Comparez les prix et demandez un devis gratuit immédiat.',
+    metaTitle: 'Prix d\'un plombier en 2026 : tarif horaire 45-95 €/h + 14 dépannages',
+    metaDescription:
+      'Plombier 2026 : 45-95 €/h, fuite urgente 90-180 €, débouchage 120-280 €, chauffe-eau 800-2 200 €. Tarifs réels par région + devis gratuit en 2 min.',
```

**`chauffage-pompe-chaleur-vs-chaudiere-gaz-2026`** (ligne 1273) :

```diff
-    metaTitle: 'PAC vs Chaudière Gaz 2026 : le vrai comparatif',
-    metaDescription:
-      'Pompe à chaleur vs chaudière gaz 2026 : coût, conso, aides. PAC 8 000-16 000€ vs gaz 2 500-8 000€. Quel retour sur investissement ?',
+    metaTitle: 'PAC ou chaudière gaz en 2026 ? Comparatif coût, conso et aides',
+    metaDescription:
+      'PAC 8 000-16 000 € (5 000 € MaPrimeRénov\') vs chaudière gaz 2 500-8 000 €. Conso, retour sur investissement, aides 2026. Le vrai comparatif chiffré.',
```

#### Patch `src/lib/data/blog/batch-prix.ts`

**`prix-menuisier-2026-tarifs-travaux`** (ligne 369) :

```diff
-    metaTitle: 'Prix Menuisier 2026 : 35-70€/h — Tarifs détaillés',
-    metaDescription:
-      'Tarifs menuisier 2026 : fenêtres 300-1 200€, escalier 2 000-8 000€, dressing sur mesure 1 500-5 000€. Prix réels + devis gratuit.',
+    metaTitle: 'Prix d\'un menuisier en 2026 : 35-70 €/h + 11 prestations',
+    metaDescription:
+      'Menuisier 2026 : pose fenêtre 300-1 200 €, porte intérieure 250-900 €, escalier sur mesure 2 000-8 000 €, dressing 1 500-5 000 €. Prix réels + devis gratuit.',
```

**`prix-macon-2026-gros-oeuvre-renovation`** (ligne 648) :

```diff
-    metaTitle: 'Prix Maçon 2026 : 40-85€/h — Gros œuvre et réno',
-    metaDescription:
-      'Tarifs maçon 2026 : fondations 100-200€/ml, mur parpaing 50-100€/m², dalle béton 60-120€/m². Prix réels par prestation.',
+    metaTitle: 'Prix d\'un maçon en 2026 : 40-85 €/h + gros œuvre, dalle, mur',
+    metaDescription:
+      'Maçon 2026 : fondations 100-200 €/ml, mur parpaing 50-100 €/m², dalle béton 60-120 €/m², ouverture mur porteur 1 800-4 000 €. 14 prix + devis gratuit.',
```

**`prix-cuisiniste-2026-pose-cuisine`** (ligne 1237) :

```diff
-    metaTitle: 'Prix Cuisine Équipée 2026 : 3 000-40 000€',
-    metaDescription:
-      'Prix cuisine 2026 : entrée de gamme 3 000-6 000€, milieu 6 000-15 000€, haut de gamme 15 000€+. Tarifs pose + fourniture détaillés.',
+    metaTitle: 'Prix d\'une cuisine équipée en 2026 : 3 000-40 000 € (pose + fourniture)',
+    metaDescription:
+      'Cuisine 2026 : entrée de gamme 3 000-6 000 €, milieu 6 000-15 000 €, haut de gamme 15 000 €+. Détail pose, plan de travail, électroménager. Devis 2 min.',
```

**`prix-installation-electrique-neuve-2026`** (ligne 1988) :

```diff
-    metaTitle: 'Prix Électricité Neuve 2026 : 80-150€/m²',
-    metaDescription:
-      'Prix installation électrique 2026 : neuf 8 000-15 000€ (100m²), mise aux normes 80-150€/m², domotique 1 000-20 000€. Devis gratuit.',
+    metaTitle: 'Prix installation électrique neuve en 2026 : 80-150 €/m² tout compris',
+    metaDescription:
+      'Installation électrique 2026 : 8 000-15 000 € pour 100 m² (neuf), 80-150 €/m² (mise aux normes), 1 000-20 000 € (domotique), conformité NF C 15-100. Devis gratuit.',
```

#### Règles d'écriture appliquées (à respecter pour les futurs articles `prix-*`)

1. **Title structure** : `Prix d'un {métier} en {année} : {fourchette horaire} + {hook quanti}` — 60-65 chars max, **« en 2026 »** plutôt que « 2026 :», fourchette numérique en clair.
2. **Description structure** : 3-4 chiffres concrets séparés par virgule, pas de phrase journalistique. Termine par un **CTA quantifié** (« devis en 2 min », « 14 prix »).
3. **Pas de mot vide** : retirer « comparez », « comprendre », « guide » de title/desc — Google a déjà ça en SERP feature.
4. **N'utilise pas le brand** dans le metaTitle : Google l'ajoute automatiquement (« — ServicesArtisans ») et ça gaspille 18 chars.

### Action 2 — Schema `Service` + `Offer` avec priceRange (effort 1-2 h, impact 2-3 semaines)

**Pourquoi** : déclenche le rich result « Extraits de produits » que GSC montre déjà actif (725 clics 143 K imp pos 35.6) sur d'autres pages. Sur ces 7 articles à pos 5-7 desktop, le rich snippet ferait passer le CTR de 0.2 % à 2-3 %.

#### Nouveau fichier `src/lib/seo/blog-product-schema.ts`

```ts
import { SITE_URL } from '@/lib/seo/config'

type PriceServiceConfig = {
  /** Service name e.g. "Plombier", "Électricien" */
  serviceName: string
  /** Service slug to link aux artisans : doit matcher /services/[slug] */
  serviceSlug: string
  /** Min price in EUR (hourly or first prestation) */
  priceMin: number
  /** Max price in EUR (premium or full package) */
  priceMax: number
  /** Unit description : "tarif horaire", "intervention", "installation complète" */
  unitDescription: string
  /** Article URL slug */
  articleSlug: string
}

/**
 * Maps article slugs to Service+Offer schema config.
 * Adding a slug here triggers rich product snippet eligibility.
 */
const PRICE_ARTICLE_CONFIG: Record<string, PriceServiceConfig> = {
  'prix-plombier-2026-tarifs-horaires': {
    serviceName: 'Plombier',
    serviceSlug: 'plombier',
    priceMin: 45,
    priceMax: 95,
    unitDescription: 'tarif horaire HT en France 2026',
    articleSlug: 'prix-plombier-2026-tarifs-horaires',
  },
  'prix-electricien-2026-tarifs-travaux': {
    serviceName: 'Électricien',
    serviceSlug: 'electricien',
    priceMin: 40,
    priceMax: 85,
    unitDescription: 'tarif horaire HT en France 2026',
    articleSlug: 'prix-electricien-2026-tarifs-travaux',
  },
  'prix-installation-electrique-neuve-2026': {
    serviceName: 'Installation électrique neuve',
    serviceSlug: 'electricien',
    priceMin: 80,
    priceMax: 150,
    unitDescription: 'prix au m² (logement 100 m², norme NF C 15-100)',
    articleSlug: 'prix-installation-electrique-neuve-2026',
  },
  'prix-menuisier-2026-tarifs-travaux': {
    serviceName: 'Menuisier',
    serviceSlug: 'menuisier',
    priceMin: 35,
    priceMax: 70,
    unitDescription: 'tarif horaire HT en France 2026',
    articleSlug: 'prix-menuisier-2026-tarifs-travaux',
  },
  'prix-macon-2026-gros-oeuvre-renovation': {
    serviceName: 'Maçon',
    serviceSlug: 'macon',
    priceMin: 40,
    priceMax: 85,
    unitDescription: 'tarif horaire HT en France 2026',
    articleSlug: 'prix-macon-2026-gros-oeuvre-renovation',
  },
  'prix-cuisiniste-2026-pose-cuisine': {
    serviceName: 'Cuisiniste',
    serviceSlug: 'cuisiniste',
    priceMin: 3000,
    priceMax: 40000,
    unitDescription: 'cuisine équipée complète (pose + fourniture)',
    articleSlug: 'prix-cuisiniste-2026-pose-cuisine',
  },
  'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026': {
    serviceName: 'Pompe à chaleur air-eau',
    serviceSlug: 'pompe-a-chaleur',
    priceMin: 8000,
    priceMax: 16000,
    unitDescription: 'installation complète (équipement + pose, hors aides)',
    articleSlug: 'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026',
  },
}

export function getServicePriceSchema(slug: string): Record<string, unknown> | null {
  const cfg = PRICE_ARTICLE_CONFIG[slug]
  if (!cfg) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/blog/${slug}#service`,
    name: cfg.serviceName,
    serviceType: cfg.serviceName,
    areaServed: { '@type': 'Country', name: 'France' },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
    },
    url: `${SITE_URL}/services/${cfg.serviceSlug}`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: cfg.priceMin,
      highPrice: cfg.priceMax,
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'EUR',
        minPrice: cfg.priceMin,
        maxPrice: cfg.priceMax,
        description: cfg.unitDescription,
      },
      offerCount: 14,
      availability: 'https://schema.org/InStock',
      eligibleRegion: { '@type': 'Country', name: 'France' },
    },
    isRelatedTo: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/services/${cfg.serviceSlug}`,
    },
  }
}
```

#### Patch `src/app/(public)/blog/[slug]/page.tsx`

```diff
 import { getBlogArticleSchema } from '@/lib/seo/blog-schema'
+import { getServicePriceSchema } from '@/lib/seo/blog-product-schema'
 ...
   const allSchemas = [
     breadcrumbSchema,
     ...schemas,
     speakableSchema,
     ...(faqSchema ? [faqSchema] : []),
     ...(howToSchema ? [howToSchema] : []),
+    ...((): Record<string, unknown>[] => {
+      const s = getServicePriceSchema(slug)
+      return s ? [s] : []
+    })(),
   ]
```

### Action 3 — Bloc « En bref » price snippet en haut d'article (effort 1 h, impact CTR PAA)

Sur les articles `prix-*`, **avant** le premier H2, injecter un bloc `EnBrefBox` (composant déjà existant `src/components/seo/EnBrefBox.tsx`) avec une mini-table 3 lignes : tarif horaire / 1ère prestation / fourchette projet complet. Ça maximise les chances d'être copié dans le Featured Snippet.

Implémentation : ajouter un champ optionnel `priceSnippet` dans le type `BlogArticle` et le rendre dans `[slug]/page.tsx` avant `parsedBlocks`.

### Action 4 — Investiguer le CTR desktop 0.52 % (effort 2-3 h, impact global)

Hors-scope blog `prix-*` mais affecte **toutes** les pages. Hypothèses à valider :

- Layout above-fold trop léger en desktop (1080×800)
- Featured snippet absorbé par concurrent → on est en pos 7 visuelle réelle
- Schema vu par mobile crawler ≠ desktop crawler (uncommon mais possible)

Test rapide : ouvrir 5 SERP « prix plombier 2026 » en desktop incognito + screenshots, comparer titres affichés vs concurrents Travaux.com / Habitatpresto / IZI by EDF.

---

## Acceptance criteria

| Critère                                         | Avant  | Cible J+30                | Mesure         |
| ----------------------------------------------- | ------ | ------------------------- | -------------- |
| CTR moyen 7 articles                            | 0.23 % | **≥ 1.5 %**               | GSC export 28j |
| Clics 7 articles / 28j                          | ~6     | **≥ 80**                  | GSC            |
| Rich result « Extraits de produits » sur 7 URLs | 0/7    | **≥ 4/7**                 | GSC apparence  |
| Position moyenne                                | 6.4    | ≥ 6.4 (pas de régression) | GSC            |

## Étapes opérationnelles

1. **Maintenant** : appliquer les 7 patchs `metaTitle`/`metaDescription` (Action 1, 30 min).
2. **+1 h** : créer `blog-product-schema.ts` + patcher `[slug]/page.tsx` (Action 2).
3. **+2 h** : injecter `EnBrefBox` price snippet sur les 7 (Action 3).
4. **Build + test** : `npm run build` + `npx vitest run` → vérifier qu'aucun test SEO casse.
5. **Deploy** : push branche `chore/blog-prix-ctr-fix-2026-04-30`, PR, merge.
6. **+24 h après deploy** : valider via Schema.org Validator + Rich Results Test sur les 7 URLs.
7. **+7-14 j** : Google recrawl → premières remontées CTR.
8. **+28-35 j** : mesure définitive et bascule de la cible.

## Hors-scope (à ne pas mélanger)

- Refonte du contenu des articles : 800-1500 mots restent valides, le pb est metadata + schema.
- Backlinks : nécessaire mais hors de cette PR (Sprint 3 backlinks).
- Refonte du layout `[slug]` : à traiter dans Action 4 (audit séparé).
- Les 8e+ articles `prix-*` : appliquer la même règle d'écriture title/meta progressivement.
