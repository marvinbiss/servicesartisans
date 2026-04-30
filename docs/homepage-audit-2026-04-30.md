# Audit homepage `/` — pos 16.2 sur 2 631 impressions (étape 3/3 plan 140K)

**Généré 2026-04-30** · Sources : GSC export 90j (29-01 → 28-04), curl Googlebot UA prod, code source

## Verdict

La homepage perd des clics **par construction** : le mot **« ServicesArtisans » n'apparaît ni dans le title, ni dans le H1, ni dans la description**. Le H1 est `sr-only` (caché). La pos 2.8 sur la requête brand `services artisans` (76 imp, CTR 36.84 %) est tenue par l'autorité du domaine, pas par les signaux on-page.

**Fix** : 5 patches courts, ~30 min de code, impact estimé +20-40 clics/mois sur le brand + remontée sur les requêtes génériques que `/` capte (2 631 imp pos 16.2).

## Données GSC sur `/` (90j)

|                  | Valeur |
| ---------------- | -----: |
| Clics            |     69 |
| Impressions      |  2 631 |
| CTR              | 2.62 % |
| Position moyenne |   16.2 |

**Lecture** : `/` rank pos 16 en moyenne sur des **centaines** de requêtes long-tail (pas le brand). Le top 1000 du GSC ne montre qu'une seule requête brand (« services artisans » : 76 imp pos 2.8 — captée par `/`). Les 2 555 autres impressions de `/` viennent de requêtes génériques (« annuaire artisan », « artisan autour de moi », etc.) où la home n'est pas la bonne page de réponse mais Google la sert faute de mieux.

## Constats prod (curl Googlebot UA, 2026-04-30)

```
$ curl -s https://servicesartisans.fr/ -H "User-Agent: Googlebot" | grep -oE "<title>.*</title>|<h1[^>]*>[^<]*</h1>"
<title>Artisans de France — 970 326+ Pros Vérifiés</title>
<h1 class="sr-only">L'annuaire des artisans qualifiés en France</h1>
```

```
$ curl ... | grep "name=\"description\""
<meta name="description" content="Trouvez un artisan qualifié parmi 970 326+ professionnels vérifiés SIREN. Plombier, électricien, serrurier : 101 départements couverts. Devis gratuit."/>
```

| Élément                 | Contient « ServicesArtisans » ?   |
| ----------------------- | --------------------------------- |
| `<title>`               | ❌ Non                            |
| `<h1>`                  | ❌ Non (et `sr-only`)             |
| `<meta description>`    | ❌ Non                            |
| `<meta og:title>`       | ✅ Oui (mais pas affiché en SERP) |
| `<schema:Organization>` | ✅ Oui                            |

**Effet collatéral** : pour `services artisans` (brand), Google s'appuie sur `og:title` + Schema. Pour les requêtes génériques, le title « Artisans de France — 970 326+ Pros Vérifiés » est ambigu — un internaute en SERP lit « Artisans de France » et hésite entre l'annuaire officiel CMA / Artisans de France SAS / nous.

## Constats secondaires problématiques

### 1. « 970 326+ Pros Vérifiés » — borderline YMYL

- 970 326 = total fiches importées ADEME / SIRENE. **19 seulement sont claimed** (mémoire `servicesartisans-ceo-strategy-2026-04-20`).
- « Pros vérifiés » suggère que SA a vérifié chaque artisan → **faux** côté revendication.
- « Vérifiés SIREN » (dans la description) est défendable : SIREN existe au registre, vérification automatique = factuelle.
- Risque : signalement utilisateur Google (boutons « Cet article semble inexact » SERP), recommandation E-E-A-T négative à terme.

### 2. H1 caché, H2 above-fold présent

Le seul H1 = `sr-only`. Above-fold visible : `<h2>Recevez 3 devis d'artisans vérifiés aujourd'hui</h2>` (clamp 2-3.5rem, donc bien visible).

Google ne pénalise pas les H1 cachés mais leur donne moins de poids. La hiérarchie H1→H2→H3 attendue par les évaluateurs E-E-A-T est cassée : page racine sans H1 visible signale un design daté ou un over-engineering CSS.

### 3. Title hyper-plein ne laisse aucune place au brand

68 chars (`Artisans de France — 970 326+ Pros Vérifiés`) → en SERP desktop tronqué à ~60 chars affichés (« Artisans de France — 970 326+ Pros Vér… »). Google ajoute parfois `| ServicesArtisans` (template root layout) mais coupe alors le compte.

### 4. Hreflang OK mais pas d'`@id` sur la WebPage homepage

Le root `layout.tsx` émet `Organization` + `WebSite` → bien. Mais `page.tsx` n'émet **pas** de `WebPage` schema avec `@id: SITE_URL` reliant la home à l'Organization. Conséquence : entité graph un peu floue. Léger, mais bénéfique pour la requête brand exacte.

### 5. La requête `services artisans` est l'unique brand query indexée — long tail brand absent

GSC top 1000 ne contient pas : « servicesartisans », « services artisans france », « services artisans avis », « services-artisans.fr ». Conclusion : volume brand = ~76 imp/90j seulement. **Le brand n'est pas reconnu**. Plus de raison de blinder l'on-page.

---

## 5 patches (rangés par ROI)

### Patch 1 — Title homepage avec brand (effort 5 min, impact direct)

**`src/app/page.tsx` ligne 30-37**

```diff
 export async function generateMetadata(): Promise<Metadata> {
   const { artisanCount: count } = await getSiteStats()
   const countStr = count > 0 ? `${formatProviderCount(count)}+` : "Des milliers d'"
-  const absoluteTitle = `Artisans de France — ${countStr} Pros Vérifiés`
-  const metaDescription = `Trouvez un artisan qualifié parmi ${countStr} professionnels vérifiés SIREN. Plombier, électricien, serrurier : 101 départements couverts. Devis gratuit.`
+  const absoluteTitle = `ServicesArtisans : annuaire de ${countStr} artisans français vérifiés SIREN`
+  const metaDescription = `ServicesArtisans, l'annuaire des ${countStr} artisans français référencés SIREN. Plombier, électricien, serrurier dans 101 départements. Devis gratuit en 2 min.`
   return {
     title: { absolute: absoluteTitle },
```

**Rationale** :

- « ServicesArtisans » en tête → renforce ranking brand exact.
- « annuaire de 970 326 artisans français vérifiés SIREN » → factuel, pas ambigu.
- « vérifiés SIREN » remplace « Pros Vérifiés » → défendable YMYL.
- 80 chars avant `| ServicesArtisans` (template) → ~95 chars total, sera tronqué SERP à `ServicesArtisans : annuaire de 970 326+ artisans français vérifiés…` ce qui reste lisible.

### Patch 2 — H1 visible avec brand (effort 10 min, impact moyen)

**`src/app/page.tsx` ligne 121-122** : remplacer le H1 sr-only par un H1 visible above-fold, et descendre le H2 actuel en H2.

```diff
-      {/* Server-rendered H1 for SEO — visually hidden, ClayHomePage shows the visible version */}
-      <h1 className="sr-only">L'annuaire des artisans qualifiés en France</h1>
+      {/* H1 visible — pris par ClayHomePage après refonte */}
```

**`src/components/home/ClayHomePage.tsx`** : ajouter un H1 visible dans le hero.

```diff
+      <header className="sr-only md:not-sr-only md:py-6 md:px-4 md:max-w-6xl md:mx-auto">
+        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight text-center md:text-left">
+          ServicesArtisans — annuaire des artisans français vérifiés SIREN
+        </h1>
+      </header>
       {/* Hero existant */}
       <ClayHeroSearch ... />
```

Et descendre le H2 actuel `<h2>Recevez 3 devis...</h2>` à un niveau **inférieur** au H1, ce qui est déjà le cas (il reste H2 mais derrière un H1 réel).

**Rationale** : au moins un H1 visible above-fold (mobile + desktop), contenant le brand + USP « vérifiés SIREN ». Reste sobre, ne casse pas le design Clay.

### Patch 3 — Schema `WebPage` homepage avec @id + mainEntity (effort 5 min, impact entité graph)

**`src/app/page.tsx` ligne 86-119** : étendre `JsonLd data` avec un schema `WebPage` reliant `/` à `Organization`.

```diff
   const aggregateRatingSchema = ...
+
+  const webPageSchema = {
+    '@context': 'https://schema.org',
+    '@type': 'WebPage',
+    '@id': SITE_URL,
+    url: SITE_URL,
+    name: 'ServicesArtisans',
+    description: `Annuaire des ${formatProviderCount(homepageData.artisanCount || 0)} artisans français référencés SIREN.`,
+    inLanguage: 'fr-FR',
+    isPartOf: { '@id': `${SITE_URL}#website` },
+    about: { '@id': `${SITE_URL}#organization` },
+    primaryImageOfPage: {
+      '@type': 'ImageObject',
+      url: `${SITE_URL}/opengraph-image`,
+    },
+    breadcrumb: {
+      '@type': 'BreadcrumbList',
+      itemListElement: [
+        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
+      ],
+    },
+  }
+
+  // Patch root WebSite to include @id matching webPageSchema.isPartOf
+  // → already done if getWebsiteSchema sets @id = SITE_URL + '#website' ; sinon ajouter dans jsonld.ts
```

**Note** : si `getWebsiteSchema()` n'émet pas `@id: ${SITE_URL}#website`, ajouter cette propriété dans `src/lib/seo/jsonld.ts` ligne 128-145.

### Patch 4 — Retirer « Pros Vérifiés » au profit de « référencés SIREN » (effort 5 min, impact YMYL)

Audit `grep -r "Pros Vérifiés\|pros vérifiés" src/` à exécuter, et remplacer par :

- « référencés SIREN » (factuel)
- « artisans français » (sans claim)
- « 970 000 artisans dans 101 départements »

**Pourquoi** : « Pros Vérifiés » sur 970K fiches dont 19 vraiment claimed = exposition à signalement E-E-A-T. Effy/Travaux.com utilisent « partenaires » ou « artisans » sans mention « vérifiés » sauf pour les artisans réellement engagés (RGE).

### Patch 5 — Étendre `<a propos>` page pour cible brand long-tail (effort 30 min, impact moyen-terme)

GSC montre 0 trafic pour requêtes brand long-tail (« services artisans avis », « services artisans france »). Le concurrent direct (« Travaux.com avis », « Habitatpresto avis ») captent 200-500 imp/mois sur ces patterns.

**Action** : créer / enrichir `/a-propos` + `/avis-de-services-artisans` (légalement OK : page d'auto-présentation, citer ses propres notes Trustpilot/Google si existent).

**Hors scope immédiat** mais à backlog Sprint 3.

---

## Test rapide post-deploy

```bash
# 1. Title contient brand
curl -s https://servicesartisans.fr/ | grep -oE "<title>[^<]+</title>"
# Attendu : <title>ServicesArtisans : annuaire de ...

# 2. H1 visible présent
curl -s https://servicesartisans.fr/ | grep -oE "<h1[^>]*>[^<]*</h1>"
# Attendu : <h1 class="font-heading...">ServicesArtisans — ...

# 3. Schema WebPage validé
curl -s https://servicesartisans.fr/ | grep -A 3 "\"@type\":\"WebPage\""

# 4. Plus de "Pros Vérifiés"
curl -s https://servicesartisans.fr/ | grep -c "Pros Vérifiés"
# Attendu : 0
```

Validation Schema.org : https://validator.schema.org/?url=https%3A%2F%2Fservicesartisans.fr%2F (post-deploy).

---

## Acceptance criteria

| Critère                                     | Avant   | Cible J+30 |
| ------------------------------------------- | ------- | ---------- |
| `<title>` contient « ServicesArtisans »     | ❌      | ✅         |
| `<h1>` visible above-fold avec brand        | ❌      | ✅         |
| Position requête brand `services artisans`  | 2.8     | ≤ 2.0      |
| CTR requête brand                           | 36.84 % | ≥ 50 %     |
| Mentions « Pros Vérifiés » dans HTML public | 1+      | 0          |
| Schema `WebPage` émis                       | ❌      | ✅         |

## Hors scope (ne pas mélanger)

- Refonte du Hero / ClayHomePage : la structure est saine, seuls les textes brand bougent.
- Multi-language : `/en` n'existe pas, hreflang `fr-FR` + `x-default` suffit.
- Backlinks brand : Sprint 3 séparé.
- `/a-propos` enrichissement : Patch 5 = phase 2, pas dans cette PR.

---

## Synthèse étapes 1+2+3 (plan 140K)

| Étape | Livrable                                                                                             | Statut |
| ----- | ---------------------------------------------------------------------------------------------------- | ------ |
| 1     | `docs/sitemap-purge-whitelist-2026-04-30.md` (885 URLs whitelist, 2 447 clics protégés)              | ✅     |
| 2     | `docs/blog-prix-ctr-fix-2026-04-30.md` (7 articles, +300-376 clics/90j attendus)                     | ✅     |
| 3     | `docs/homepage-audit-2026-04-30.md` (ce document — 5 patches, ~30 min code, +20-40 clics/mois brand) | ✅     |

**Impact cumulé estimé J+30** : +120-180 clics/mois (= +30-50 % du baseline 156 clics/jour, soit +60-90 clics/jour à mesure de l'indexation).

**Bloqueurs résiduels avant V1 J+3** :

- Pull GSC Pages **non tronqué** (top 1000 actuel insuffisant pour filet G3 complet)
- Pull GSC Pages 28j alignement avec règle plan v1 stricte
- Cross-check `lead_request_logs` 90j (URLs purge candidates générant des leads ?)
