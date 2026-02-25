# PLAN D'EXÉCUTION 14 JOURS — Fichier par fichier

**Date :** 25 février 2026
**Objectif :** Transformer les impressions GSC existantes en clics, sans attendre l'autorité.

---

## CORRECTION DU DIAGNOSTIC INITIAL

### Erreur corrigée : "10 services sans trade-content"

C'était **faux**. Les 46 services ont TOUS du trade-content riche dans `src/lib/data/trade-content.ts` :
- 36 services avec clés non-quotées (plombier, electricien, etc.) — 5-8 commonTasks, 5-8 FAQ
- 10 services avec clés quotées ('peintre-en-batiment', etc.) — idem

**Conséquence :** Le plan ne nécessite PAS de créer du trade-content. Le travail est :
1. Patch lexical (langage utilisateur dans H1/title)
2. Ajout de termes naturels dans commonTasks existants
3. Sitemap aligné GSC
4. Nettoyage signal pré-lancement

### Maillage tarifs/devis/avis

Déjà présent dans `CrossLinks.tsx` (lignes 131-141). Chaque page `/services/[service]/[location]` a des liens vers :
- `/devis/[service]/[location]`
- `/avis/[service]/[location]`
- `/tarifs/[service]/[location]`

**Conséquence :** Pas besoin de créer ces liens. Focus sur les vrais gaps.

---

## LES 20 CHANGEMENTS, DANS L'ORDRE EXACT

### JOUR 1 — Patch lexical H1 et title (le plus gros levier CTR)

---

#### Changement #1 : Créer le mapping termes naturels

**Fichier :** `src/lib/seo/natural-terms.ts` (nouveau)

**Pourquoi :** Les H1 utilisent `service.name` (ex: "Solier-moquettiste"), pas ce que l'utilisateur tape. Ce mapping lie chaque serviceSlug à ses termes de recherche naturels.

```typescript
/**
 * Termes de recherche naturels par service.
 * Utilisés dans les H1 et titles pour améliorer le match
 * entre la requête utilisateur et le snippet SERP.
 *
 * Source : GSC queries + volume de recherche Google.
 */
export const SERVICE_NATURAL_TERMS: Record<string, {
  /** Terme principal utilisé en H1 alternatif */
  primary: string
  /** Termes secondaires injectés dans le contenu */
  secondary: string[]
}> = {
  // Services avec mismatch lexical identifié via GSC
  solier: {
    primary: 'Pose de revêtement de sol',
    secondary: ['pose moquette', 'pose parquet', 'revêtement de sol', 'sol PVC', 'sol vinyle'],
  },
  carreleur: {
    primary: 'Pose de carrelage',
    secondary: ['pose crédence', 'carrelage cuisine', 'faïence salle de bain', 'carrelage mural'],
  },
  jardinier: {
    primary: 'Jardinage et entretien de jardin',
    secondary: ['jardinage à domicile', 'tonte pelouse', 'entretien jardin', 'taille haie', 'élagage'],
  },
  deratisation: {
    primary: 'Dératisation',
    secondary: ['dératiseur', 'traitement rats', 'traitement souris', 'dératisation copropriété'],
  },
  desinsectisation: {
    primary: 'Désinsectisation',
    secondary: ['traitement cafards', 'traitement punaises de lit', 'désinsectiseur', 'traitement fourmis'],
  },
  'alarme-securite': {
    primary: 'Installation alarme et sécurité',
    secondary: ['pose alarme', 'système alarme', 'installation vidéosurveillance', 'devis alarme'],
  },

  // Services où le nom de métier ≠ action recherchée
  climaticien: {
    primary: 'Installation climatisation',
    secondary: ['pose climatisation', 'clim réversible', 'installation clim', 'entretien climatisation'],
  },
  'pompe-a-chaleur': {
    primary: 'Installation pompe à chaleur',
    secondary: ['pose PAC', 'PAC air eau', 'remplacement chaudière fioul', 'pompe chaleur prix'],
  },
  'panneaux-solaires': {
    primary: 'Installation panneaux solaires',
    secondary: ['pose panneaux solaires', 'photovoltaïque', 'autoconsommation solaire'],
  },
  'borne-recharge': {
    primary: 'Installation borne de recharge',
    secondary: ['borne recharge voiture électrique', 'wallbox', 'borne IRVE'],
  },
  'isolation-thermique': {
    primary: 'Travaux d\'isolation thermique',
    secondary: ['isolation combles', 'isolation murs', 'ITE', 'isolation extérieure'],
  },
  'renovation-energetique': {
    primary: 'Rénovation énergétique',
    secondary: ['audit énergétique', 'rénovation globale', 'MaPrimeRénov'],
  },
  demenageur: {
    primary: 'Déménagement',
    secondary: ['déménageur professionnel', 'devis déménagement', 'entreprise déménagement'],
  },
  diagnostiqueur: {
    primary: 'Diagnostic immobilier',
    secondary: ['DPE', 'diagnostic amiante', 'diagnostic électrique', 'diagnostic vente'],
  },
  geometre: {
    primary: 'Géomètre-expert',
    secondary: ['bornage terrain', 'arpentage', 'plan topographique', 'division parcelle'],
  },
  'poseur-de-parquet': {
    primary: 'Pose de parquet',
    secondary: ['parquet flottant', 'parquet massif', 'ponçage parquet', 'vitrification'],
  },
  'salle-de-bain': {
    primary: 'Rénovation salle de bain',
    secondary: ['douche italienne', 'remplacement baignoire', 'aménagement salle de bain'],
  },
  'architecte-interieur': {
    primary: 'Architecture d\'intérieur',
    secondary: ['décoration intérieure', 'aménagement appartement', 'agencement intérieur'],
  },
  nettoyage: {
    primary: 'Nettoyage professionnel',
    secondary: ['nettoyage fin de chantier', 'nettoyage copropriété', 'nettoyage vitres'],
  },
  facadier: {
    primary: 'Ravalement de façade',
    secondary: ['ravalement façade', 'peinture façade', 'ITE façade', 'nettoyage façade'],
  },
  cuisiniste: {
    primary: 'Cuisine sur mesure',
    secondary: ['installation cuisine', 'pose cuisine', 'aménagement cuisine', 'cuisine équipée'],
  },
  pisciniste: {
    primary: 'Construction et entretien piscine',
    secondary: ['piscine coque', 'piscine béton', 'rénovation piscine', 'entretien piscine'],
  },

  // Services où le nom est déjà clair — pas besoin de primary alternatif
  plombier: {
    primary: 'Plombier',
    secondary: ['plomberie', 'fuite eau', 'débouchage', 'chauffe-eau', 'robinetterie'],
  },
  electricien: {
    primary: 'Électricien',
    secondary: ['installation électrique', 'mise aux normes', 'tableau électrique', 'prise électrique'],
  },
  serrurier: {
    primary: 'Serrurier',
    secondary: ['ouverture porte', 'changement serrure', 'blindage porte', 'dépannage serrure'],
  },
  chauffagiste: {
    primary: 'Chauffagiste',
    secondary: ['installation chaudière', 'entretien chaudière', 'radiateur', 'plancher chauffant'],
  },
  couvreur: {
    primary: 'Couvreur',
    secondary: ['réparation toiture', 'fuite toiture', 'remplacement tuiles', 'toiture neuve'],
  },
  menuisier: {
    primary: 'Menuisier',
    secondary: ['pose fenêtres', 'porte sur mesure', 'escalier bois', 'agencement sur mesure'],
  },
  macon: {
    primary: 'Maçon',
    secondary: ['construction mur', 'fondations', 'extension maison', 'ouverture mur porteur'],
  },
  vitrier: {
    primary: 'Vitrier',
    secondary: ['remplacement vitre', 'double vitrage', 'miroir sur mesure', 'crédence verre'],
  },
}
```

---

#### Changement #2 : Injecter les termes naturels dans les H1

**Fichier :** `src/app/(public)/services/[service]/[location]/page.tsx`
**Lignes :** 364-373

**Avant :**
```typescript
const h1Templates = [
  `${service.name} à ${location.name}`,
  `${service.name} à ${location.name} — Artisans vérifiés`,
  `Trouvez un ${service.name.toLowerCase()} à ${location.name}`,
  `${service.name} à ${location.name} : pros référencés`,
  `Les meilleurs ${service.name.toLowerCase()}s à ${location.name}`,
]
```

**Après :**
```typescript
import { SERVICE_NATURAL_TERMS } from '@/lib/seo/natural-terms'

// ...

const naturalTerms = SERVICE_NATURAL_TERMS[serviceSlug]
const primaryTerm = naturalTerms?.primary || service.name
const svcLower = service.name.toLowerCase()
const primaryLower = primaryTerm.toLowerCase()
// Only use natural term variant if it differs from the service name
const useNatural = primaryLower !== svcLower

const h1Templates = useNatural
  ? [
      `${primaryTerm} à ${location.name}`,
      `${primaryTerm} à ${location.name} — Artisans vérifiés`,
      `${service.name} à ${location.name}`,
      `${primaryTerm} à ${location.name} : pros référencés`,
      `Trouvez un ${svcLower} à ${location.name}`,
    ]
  : [
      `${service.name} à ${location.name}`,
      `${service.name} à ${location.name} — Artisans vérifiés`,
      `Trouvez un ${svcLower} à ${location.name}`,
      `${service.name} à ${location.name} : pros référencés`,
      `Les meilleurs ${svcLower}s à ${location.name}`,
    ]
```

**Résultat :** La page `/services/solier/margency` aura H1 = "Pose de revêtement de sol à Margency" au lieu de "Solier-moquettiste à Margency". Google peut maintenant mettre en gras "pose" et "sol" dans le snippet pour la requête "pose moquette margency".

---

#### Changement #3 : Injecter les termes naturels dans les titles

**Fichier :** `src/app/(public)/services/[service]/[location]/page.tsx`
**Lignes :** 135-149 (dans generateMetadata)

Même logique : si le service a un `primary` naturel différent du nom métier, l'utiliser dans 2-3 des 5 templates de title.

**Exemple résultat pour solier × margency :**
- Avant : `Solier-moquettiste à Margency — Devis Gratuit`
- Après : `Pose revêtement de sol à Margency — Devis Gratuit`

---

#### Changement #4 : Injecter les termes secondaires dans les meta descriptions

**Fichier :** `src/app/(public)/services/[service]/[location]/page.tsx`
**Lignes :** 156-170 (dans generateMetadata)

Ajouter 1 terme secondaire dans 2-3 des templates de description.

**Exemple :** `Comparez les solier-moquettistes à Margency → pose moquette, pose parquet, sol PVC. Devis gratuit.`

---

### JOUR 2 — Enrichir les commonTasks avec les termes GSC

---

#### Changement #5 : Ajouter "Pose de crédence" au carreleur

**Fichier :** `src/lib/data/trade-content.ts`
**Ligne :** ~455 (dans commonTasks du carreleur)

**Ajouter :**
```typescript
'Pose de crédence de cuisine (carrelage/faïence) : 40 à 80 €/m²',
```

**Pourquoi :** GSC montre des impressions pour "pose de crédence gargenville" matchant la page carreleur. Le mot "crédence" n'existe pas dans le trade-content carreleur.

---

#### Changement #6 : Ajouter une FAQ crédence au carreleur

**Fichier :** `src/lib/data/trade-content.ts`
**Après la dernière FAQ du carreleur (~ligne 495)**

```typescript
{
  q: 'Quel artisan pour poser une crédence de cuisine ?',
  a: 'Un carreleur est le professionnel le mieux qualifié pour poser une crédence en carrelage ou en faïence. Pour une crédence en verre, faites appel à un miroitier ou un vitrier. Le coût de pose d\'une crédence en carrelage est de 40 à 80 €/m², et de 150 à 400 €/m² pour une crédence en verre laqué.',
},
```

---

#### Changement #7 : Ajouter "Jardinage à domicile" au jardinier

**Fichier :** `src/lib/data/trade-content.ts`
**Ligne :** ~658 (dans commonTasks du jardinier)

**Ajouter :**
```typescript
'Jardinage à domicile (service à la personne) : 30 à 50 €/h avant crédit d\'impôt',
```

**Pourquoi :** GSC montre "jardinage à domicile nantes" (pos 29.9, 13 imp). Le terme "jardinage à domicile" n'apparaît que dans les tips, pas dans les commonTasks qui sont plus visibles dans le HTML.

---

#### Changement #8 : Ajouter les synonymes courants au solier

**Fichier :** `src/lib/data/trade-content.ts`
**Dans les commonTasks du solier (~lignes 925-931)**

Le solier a déjà "Pose de moquette : 10 à 25 €/m²" — c'est bien. Mais le H1 "Solier-moquettiste" est le vrai problème (réglé par le changement #2).

Vérifier que les FAQ du solier mentionnent bien "moquette", "pose moquette", "revêtement de sol" — elles ne le font PAS directement. Ajouter une FAQ :

```typescript
{
  q: 'Combien coûte la pose de moquette dans un appartement ?',
  a: 'La pose de moquette par un solier-moquettiste coûte de 10 à 25 €/m² (pose seule) selon la qualité de la moquette et la complexité du chantier. Pour un appartement de 60 m², comptez 600 à 1 500 € pose seule. La dépose de l\'ancien revêtement ajoute 5 à 10 €/m². Prévoyez 5 % de moquette supplémentaire pour les coupes.',
},
```

---

### JOUR 3 — Sitemap aligné GSC

---

#### Changement #9 : Ajouter une liste de villes GSC au sitemap manifest

**Fichier :** `src/lib/seo/sitemap-manifest.ts`
**Après SITEMAP_TOP_CITIES (ligne 48)**

```typescript
/**
 * Villes qui ont déjà des impressions GSC et ne sont pas dans le top 40.
 * Ajoutées au sitemap pour envoyer un signal explicite à Google
 * sur les URLs qu'il a déjà commencé à tester.
 *
 * Source : GSC Performance Report, filtre impressions > 3, position < 30
 * Mis à jour manuellement chaque semaine.
 */
export const GSC_BOOST_CITIES: string[] = [
  'margency',
  'gargenville',
  'guyancourt',
  'halluin',
  'ermont',
  'vernon',
  'colomiers',
  'bayonne',
  // Ajouter les villes qui apparaissent dans GSC au fil des semaines
]
```

---

#### Changement #10 : Intégrer les villes GSC dans le sitemap service-cities

**Fichier :** `src/app/sitemap.ts`
**Dans la génération des URLs service-cities**

Modifier la logique pour inclure les villes GSC en plus des top N par population. Les villes GSC sont probablement DÉJÀ dans les 13 680 villes mais n'étaient pas sélectionnées car en dehors du top 40.

```typescript
import { GSC_BOOST_CITIES } from '@/lib/seo/sitemap-manifest'
import { villes } from '@/lib/data/france'

// Combine top N cities + GSC boost cities (deduplicated)
const topCities = villes.slice(0, SITEMAP_TOP_CITIES)
const boostCities = GSC_BOOST_CITIES
  .map(slug => villes.find(v => v.slug === slug))
  .filter(Boolean)
  .filter(v => !topCities.some(tc => tc.slug === v!.slug))

const sitemapCities = [...topCities, ...boostCities]
```

**Impact :** Au lieu de 40 villes × 46 services = 1 840 URLs, on aura (40 + ~8) × 46 = ~2 208 URLs. Toujours bien sous les limites.

---

### JOUR 4 — Nettoyage signal pré-lancement

---

#### Changement #11 : Neutraliser le message pré-lancement

**Fichier :** `src/app/(public)/mentions-legales/page.tsx`
**Lignes :** 96-107

**Avant :**
```html
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
  Le site ServicesArtisans est en cours de développement.
  Les informations légales complètes seront publiées lors de l'immatriculation.
</div>
```

**Après :**
```html
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
  ServicesArtisans est un annuaire d'artisans vérifiés par SIREN.
  Les mentions légales seront complétées prochainement avec les
  informations d'immatriculation de la société éditrice.
</div>
```

**Pourquoi :** "En cours de développement" signale que le site n'est pas opérationnel. "Sera complété prochainement" est neutre et factuel.

---

#### Changement #12 : Neutraliser la médiation

**Fichier :** `src/app/(public)/mediation/page.tsx`
**Ligne :** ~61

**Avant :** "Les coordonnées du médiateur compétent seront communiquées lors de l'immatriculation de la société"
**Après :** "Le médiateur compétent sera désigné conformément aux obligations légales. En attendant, toute réclamation peut être adressée à contact@servicesartisans.fr"

---

### JOUR 5-6 — Enrichir le contenu SeoContent avec les termes naturels

---

#### Changement #13 : Injecter les termes secondaires dans la section SeoContent

**Fichier :** `src/app/(public)/services/[service]/[location]/_components/SeoContent.tsx`

Ajouter un paragraphe sous le H2 "Trouver un {service} à {ville}" qui mentionne les termes secondaires :

```tsx
{naturalTerms && naturalTerms.secondary.length > 0 && (
  <p className="text-sm text-gray-500 italic">
    Prestations courantes : {naturalTerms.secondary.slice(0, 4).join(', ')}.
  </p>
)}
```

**Pourquoi :** Google Title Link peut réécrire le title à partir du contenu on-page. Si les termes naturels sont dans le body, Google a plus de matière pour construire un snippet pertinent.

---

#### Changement #14 : Passer les termes naturels en prop à SeoContent

**Fichier :** `src/app/(public)/services/[service]/[location]/page.tsx`

Importer `SERVICE_NATURAL_TERMS` et passer `naturalTerms` en prop à `<SeoContent>`.

---

### JOUR 7 — Vérification build + tests

---

#### Changement #15 : npm run build

**Commande :** `npm run build`

Vérifier que le build passe (3 749+ pages). Les changements #1-14 ne doivent casser aucune page.

---

#### Changement #16 : npx vitest run

**Commande :** `npx vitest run`

Les tests existants ne devraient pas être affectés car les changements sont additifs (nouveau fichier, nouvelles props optionnelles).

---

### JOUR 8-10 — Boucle GSC semaine 1

---

#### Changement #17 : Exporter les données GSC et mapper les requêtes

**Action manuelle (pas de code)**

1. Exporter GSC : Pages → Requêtes → Filtre impressions > 3, position < 30
2. Pour chaque requête, identifier la page qui ranke
3. Vérifier : le H1 et le title contiennent-ils les mots de la requête ?
4. Si non → identifier le patch lexical nécessaire
5. Ajouter les nouvelles villes détectées dans `GSC_BOOST_CITIES`

---

#### Changement #18 : Mettre à jour GSC_BOOST_CITIES avec les nouvelles villes

**Fichier :** `src/lib/seo/sitemap-manifest.ts`

Ajouter les villes découvertes dans l'export GSC de la semaine.

---

### JOUR 11-13 — Enrichissements ciblés sur les clusters GSC

---

#### Changement #19 : Ajouter les termes naturels manquants découverts dans GSC

**Fichier :** `src/lib/seo/natural-terms.ts`

Chaque export GSC révélera des termes que les utilisateurs tapent mais qui ne sont pas dans le mapping. Les ajouter au fur et à mesure.

**Exemples prévisibles :**
- "dératiseur prix" → ajouter "prix dératisation" dans secondary
- "tonte pelouse tarif" → ajouter "tarif tonte pelouse" dans secondary
- "installation clim prix" → ajouter "prix climatisation" dans secondary

---

#### Changement #20 : Ajouter des FAQ spécifiques aux requêtes GSC montantes

**Fichier :** `src/lib/data/trade-content.ts`

Pour les services qui montrent du trafic GSC croissant, ajouter 1-2 FAQ ciblant les exact-match queries.

**Exemples :**
- Si GSC montre "prix dératisation appartement" → ajouter FAQ dans deratisation :
  `q: 'Combien coûte une dératisation d'appartement ?'`
- Si GSC montre "devis alarme maison" → ajouter FAQ dans alarme-securite :
  `q: 'Combien coûte l'installation d'une alarme dans une maison ?'`

---

### JOUR 14 — Build final + push

---

- `npm run build` — vérifier que tout compile
- `npx vitest run` — vérifier que les tests passent
- Commit + push de tous les changements
- Vérifier dans GSC que les pages modifiées sont re-crawlées (URL Inspection)

---

## RÈGLES DE PATCH GSC (process récurrent)

### Fréquence : chaque lundi

### Étape 1 : Export
```
GSC → Performance → Pages
Filtre : impressions > 3, position < 30, CTR < 5%
Export CSV
```

### Étape 2 : Analyse
Pour chaque ligne :
1. Quelle page ranke ? (colonne "Page")
2. Quelle requête ? (colonne "Requête")
3. Le H1 contient-il les mots de la requête ? (oui/non)
4. Le title contient-il les mots de la requête ? (oui/non)
5. Les commonTasks mentionnent-ils le terme ? (oui/non)
6. Les FAQ mentionnent-elles le terme ? (oui/non)

### Étape 3 : Action
- Si H1/title mismatch → vérifier/ajouter dans `natural-terms.ts`
- Si commonTasks manque → ajouter la task dans `trade-content.ts`
- Si FAQ manque → ajouter 1 FAQ ciblée dans `trade-content.ts`
- Si ville pas dans sitemap → ajouter dans `GSC_BOOST_CITIES`

### Étape 4 : Deploy
- `npm run build` → push → vérifier URL Inspection dans GSC

---

## RÉCAPITULATIF DES FICHIERS MODIFIÉS

| # | Fichier | Type | Changements |
|---|---------|------|-------------|
| 1 | `src/lib/seo/natural-terms.ts` | **Nouveau** | Mapping serviceSlug → termes naturels |
| 2 | `src/app/(public)/services/[service]/[location]/page.tsx` | Modifié | Import natural-terms, H1/title/desc avec termes naturels |
| 3 | `src/lib/data/trade-content.ts` | Modifié | +3 commonTasks, +2 FAQ (carreleur, jardinier, solier) |
| 4 | `src/lib/seo/sitemap-manifest.ts` | Modifié | +GSC_BOOST_CITIES array |
| 5 | `src/app/sitemap.ts` | Modifié | Inclure GSC boost cities dans le sitemap |
| 6 | `src/app/(public)/mentions-legales/page.tsx` | Modifié | Formulation neutre (pas "en cours de développement") |
| 7 | `src/app/(public)/mediation/page.tsx` | Modifié | Formulation neutre pour le médiateur |
| 8 | `src/app/(public)/services/[service]/[location]/_components/SeoContent.tsx` | Modifié | Affichage termes secondaires |

**Total : 1 fichier nouveau + 7 fichiers modifiés.**

---

## KPI DE SUIVI (à 14 jours)

| Métrique | Baseline J0 | Cible J14 | Cible J30 |
|----------|-------------|-----------|-----------|
| Pages avec impressions > 0 | ~100 | ~120 | ~150 |
| Requêtes avec CTR > 0% | ~5 | ~10 | ~20 |
| Clics/jour | 0-2 | 2-5 | 5-15 |
| Requêtes en pos < 10 | ~5 | ~8 | ~15 |
| Requêtes en pos 10-20 | ~30 | ~40 | ~50 |

---

**Ce plan est intentionnellement minimaliste.** 20 changements concrets dans 8 fichiers. Pas d'over-engineering. Pas de refactoring inutile. Chaque changement est traçable à un signal GSC réel.
