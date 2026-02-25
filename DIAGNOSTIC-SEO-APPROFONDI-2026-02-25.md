# DIAGNOSTIC SEO APPROFONDI — Ce que Google veut, ce qu'on a, ce qu'on doit faire

**Date :** 25 février 2026
**Approche :** Analyse vue-Google (ce que Googlebot indexe réellement), pas vue-développeur

---

## PARTIE 1 — CE QUE GOOGLE VOIT QUAND IL CRAWLE VOS PAGES

### 1.1 La page qui ranke le mieux : `/services/[service]/[location]`

C'est **LA** page critique. C'est elle qui capte 69% des requêtes GSC (`[métier] + [ville]`). Voici exactement ce que Googlebot indexe :

**Structure HTML rendue (server-side) :**

```
<script type="application/ld+json"> → Service + Breadcrumb + FAQ + ItemList schemas
<nav> → Breadcrumb: Services > Plombier > Margency
<h1> → "Plombier à Margency — Artisans vérifiés" (1 parmi 5 variantes)

[CLIENT COMPONENT — ServiceLocationPageClient]
  → Hero section avec H1 + compteur + filtres
  → Grille de cartes artisans (nom, ville, spécialité, étoiles)
  → Pagination

[SERVER COMPONENT — SeoContent]
  <h2> "Trouver un plombier à Margency"
  <p>  Intro unique (1 parmi 15 templates × données commune) — ~80-120 mots
  <h3> "Tarifs et prix d'un plombier à Margency"
  <p>  Note tarifaire localisée — ~60 mots
  <h3> "Conseils pour vos travaux à Margency"
  <ul>  3-5 conseils contextuels — ~80 mots
  <h3> "Contexte local : [climat]"
  <p>  Conseil climatique unique — ~60 mots
  <h3> "Zones d'intervention à Margency"
  <p>  + liens vers quartiers
  <p>  Conclusion — ~40 mots

[SERVER COMPONENT — Data-Driven Sections (si CommuneData disponible)]
  <h2> "Contexte socio-économique de Margency"  + stat cards
  <h2> "Marché immobilier à Margency"  + prix/m², transactions
  <h2> "Marché artisanal à Margency"  + nb entreprises BTP, RGE
  <h2> "Performance énergétique à Margency"  + DPE, passoires
  <h2> "Climat et saisonnalité à Margency"  + jours gel, précipitations
  <h2> "Demande locale en plombier à Margency"
  <h2> "Réglementation et normes — plombier à Margency"

[SERVER COMPONENT — TradeSections]
  <h2> Prix détaillés (grille tasks + prix × multiplicateur régional)
  <h2> Certifications
  <h2> Urgence (si applicable)

[SERVER COMPONENT — FaqAndBlogSection]
  6 FAQ en accordéon (2 trade + 4 localisées)
  Liens vers articles blog liés

[SERVER COMPONENT — CrossLinks]
  6 services liés × liens
  12 villes proches × liens
  10 villes du département × liens
```

### 1.2 Le calcul réel de mots uniques

| Section | Mots | Unicité |
|---------|------|---------|
| H1 | 5-8 | Template (5 variantes hash) |
| SeoContent intro | 80-120 | **Haute** (15 templates × données commune) |
| SeoContent pricing | 50-70 | **Haute** (5 templates × prix localisé) |
| SeoContent tips | 60-100 | **Moyenne** (données climat/taille ville) |
| SeoContent climat | 50-70 | **Haute** (5 templates × 6 zones climat × service) |
| SeoContent quartiers | 30-50 | **Moyenne** |
| SeoContent conclusion | 30-50 | **Moyenne** |
| Data-driven socio-éco | 60-100 | **Très haute** (données INSEE réelles) |
| Data-driven immobilier | 50-80 | **Très haute** (prix m² réels) |
| Data-driven artisanal | 40-60 | **Très haute** (nb SIRENE réels) |
| Data-driven énergie | 40-60 | **Très haute** (DPE réels) |
| Data-driven climat | 40-60 | **Très haute** (jours gel réels) |
| Data-driven demande | 40-60 | **Haute** |
| Data-driven réglementation | 40-60 | **Moyenne** |
| Trade tasks + prix | 80-120 | **Moyenne** (même trade content) |
| FAQ (6 items) | 200-300 | **Haute** (2 trade + 4 localisées) |
| **TOTAL sans data-driven** | **~600-900** | |
| **TOTAL avec data-driven** | **~1 000-1 500** | |

**Verdict contenu :** Si la table `commune_data` est peuplée, les pages font 1 000-1 500 mots avec un taux d'unicité de 70-80%. C'est **au-dessus du seuil thin content**. Sans commune_data, on tombe à 600-900 mots — encore acceptable mais fragile.

### 1.3 Le problème n'est PAS le contenu. Le problème est LE SIGNAL.

Comparons avec ce que Google classe en page 1 pour "plombier paris" :

| Critère | Concurrent page 1 | ServicesArtisans |
|---------|-------------------|------------------|
| **Domain Authority** | DA 40-80 (PagesJaunes, 118000, Yelp) | DA ~0-5 (domaine neuf) |
| **Backlinks** | 10 000+ referring domains | ~0 |
| **Âge du domaine** | 10-20 ans | Mois |
| **Avis Google** | Intégration GBP native | Aucun |
| **Contenu** | 200-500 mots, souvent thin | 1 000-1 500 mots, riche |
| **Données structurées** | Variable, souvent basique | 14 schemas JSON-LD |
| **Maillage interne** | Fort (millions de pages) | Fort (1,5M potentielles) |

**La qualité technique et le contenu sont supérieurs aux concurrents. Mais Google ne classe pas sur le contenu seul — il classe sur la CONFIANCE. Et la confiance se mesure en backlinks, ancienneté du domaine et signaux de légitimité.**

C'est exactement ce que vos données GSC montrent :
- Les requêtes où vous rankez (dératisation, géomètre, solier) sont des **niches à faible compétition**
- Les requêtes où vous ne rankez pas (plombier paris, électricien lyon) sont des **requêtes à haute compétition**
- Google vous **teste** sur les micro-niches avant de vous accorder sa confiance sur les termes principaux

---

## PARTIE 2 — LE CONTENT-INTENT GAP (ce qui manque vraiment)

### 2.1 Les 5 requêtes page 1 : diagnostic chirurgical

#### Requête 1 : `pose moquette margency` (pos 7.3, 10 imp)

**Intent utilisateur :** Trouver quelqu'un pour poser de la moquette chez moi à Margency.
**Page servie :** `/services/solier/margency`
**H1 rendu :** "Solier-moquettiste à Margency — Artisans vérifiés"

**Problème EXACT :**
1. L'utilisateur tape "pose moquette" — le H1 dit "solier-moquettiste". **Zéro match lexical avec la requête.**
2. La meta description ne contient pas "pose moquette" non plus.
3. Le contenu parle de "solier" partout, jamais de "pose de moquette".
4. Google fait le lien sémantique (c'est pour ça que ça ranke en pos 7) mais **le CTR est nul** car le snippet SERP ne montre pas les mots cherchés en gras.

**Ce que Google VEUT voir :**
- H1 : "Pose de moquette à Margency"
- Paragraphe d'intro mentionnant "pose moquette", "moquette", "revêtement de sol"
- FAQ : "Combien coûte la pose de moquette à Margency ?"
- Le mot "solier-moquettiste" peut apparaître en explication, pas en H1.

#### Requête 2 : `pose de crédence gargenville` (pos 9.5, 18 imp)

**Intent :** Trouver quelqu'un pour poser une crédence de cuisine.
**Page servie :** `/services/carreleur/gargenville`
**H1 :** "Carreleur à Gargenville — Devis Gratuit"

**Problème EXACT :** Identique. "Crédence" n'apparaît nulle part. Google fait le lien sémantique (carreleur → crédence) mais le snippet ne match pas la requête.

**Ce que Google VEUT voir :**
- Au minimum, une FAQ ou un paragraphe mentionnant "pose de crédence" comme prestation du carreleur
- Idéalement, les commonTasks du trade-content devraient inclure "Pose de crédence de cuisine"

#### Requête 3 : `géomètre devis guyancourt` (pos 4.0, 3 imp)

**Page servie :** `/devis/geometre/guyancourt` ou `/services/geometre/guyancourt`
**Verdict :** Bon match. "Géomètre" + "devis" + "Guyancourt" sont tous dans le title et le contenu. Position 4 = Google valide le match. Juste pas assez d'impressions pour générer des clics (3 impressions = requête très niche).

#### Requête 4 : `services artisans` (pos 1.5, 2 imp)

**Page servie :** Homepage
**Verdict :** Match parfait sur le nom de marque. Position 1-2 = normal. 2 impressions = personne ne cherche cette marque (encore).

#### Requête 5 : `devis géomètre guyancourt` (pos 4.0, 2 imp)

Même que #3, variante syntaxique.

### 2.2 Le pattern révélé

**Google vous donne du trafic sur les requêtes où :**
1. La compétition est faible (dératisation dans des petites villes, géomètre)
2. OU le match lexical est exact (services artisans = nom de marque)

**Google vous REFUSE du trafic sur les requêtes où :**
1. La compétition est forte (plombier, électricien dans les grandes villes)
2. OU le match lexical est partiel (pose moquette ≠ solier-moquettiste)

**Conclusion :** Le site doit **parler la langue de l'utilisateur, pas la langue du métier**. Un utilisateur ne tape jamais "solier-moquettiste" — il tape "pose moquette". Un utilisateur ne tape jamais "carreleur" quand il veut une crédence — il tape "pose crédence".

### 2.3 Les requêtes que Google vous MONTRE mais ne vous DONNE PAS

Ce sont les requêtes en page 2-3 (pos 10-30). C'est là que le ROI est le plus élevé.

| Requête | Pos. | Imp. | Intent réel | Ce qui manque sur la page |
|---------|------|------|-------------|--------------------------|
| `dératisation ermont` | 22.5 | 12 | Trouver un dératiseur | Trade content enrichi |
| `devis alarme` | 21.7 | 14 | Devis système d'alarme | Trade content alarme-securite = absent |
| `prix deratisation` | 34.9 | 14 | Savoir combien ça coûte | Page tarifs existe mais contenu minimal |
| `jardinage à domicile nantes` | 29.9 | 13 | Jardinier à domicile | "jardinage à domicile" absent du lexique |
| `vitrier vernon` | 18.2 | 8 | Trouver un vitrier | Bonne page, juste besoin d'autorité |
| `déménageur colomiers` | 26.3 | 11 | Trouver un déménageur | Trade content minimal |
| `cuisiniste bayonne` | 28.4 | 7 | Trouver un cuisiniste | Bon trade content, besoin d'autorité |
| `serrurier halluin` | 16.5 | 6 | Trouver un serrurier | Bonne page, bonne position |
| `plombier morbihan` | 32.1 | 15 | Plombier dans le département | Page `/departements/morbihan/plombier` existe ? |

---

## PARTIE 3 — ANALYSE E-E-A-T (ce que les Quality Raters voient)

### 3.1 Score E-E-A-T actuel

| Pilier | Score | Ce qui fonctionne | Ce qui casse |
|--------|-------|-------------------|-------------|
| **Experience** | 6/10 | Données SIREN gouvernementales, processus de vérification documenté | Aucun témoignage réel, aucune photo réelle, aucun avis vérifié |
| **Expertise** | 6/10 | 125 articles blog avec auteurs nommés, FAQ techniques, guides métier | Auteurs non vérifiables, pas de page auteur, pas de credentials |
| **Authority** | **3/10** | — | **Société non immatriculée**, pas de SIRET, pas d'adresse physique, 0 backlinks, 0 mentions presse |
| **Trust** | 7/10 | RGPD complet, médiation documentée, politique avis transparente, "pas de revente de données" | Mentions légales disent "en cours de développement", médiateur non encore nommé |
| **GLOBAL** | **5.5/10** | | |

### 3.2 Le signal TUEUR : le statut pré-lancement

Dans `mentions-legales/page.tsx` :

```html
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
  Site en cours de développement. Informations légales complètes
  seront publiées lors de l'immatriculation.
</div>
```

Dans `src/lib/config/company-identity.ts` :
```typescript
status: 'pre-launch'
legalName: null
siret: null
rcs: null
address: null
```

**Ce que cela signifie pour Google :** Le site s'identifie lui-même comme non-officiel. Même si la politique de confidentialité est impeccable, le signal numéro un de confiance (l'identité légale du propriétaire) est **absent**.

Pour un site YMYL-adjacent (Your Money Your Life — les artisans interviennent chez vous, questions de sécurité, d'assurance, de garantie), **c'est un frein majeur** au ranking.

### 3.3 Le schema Organization confirme le problème

```json
{
  "@type": "Organization",
  "name": "ServicesArtisans",
  "url": "https://servicesartisans.fr",
  "contactPoint": {
    "email": "contact@servicesartisans.fr"
  }
  // PAS de SIRET, PAS d'adresse, PAS de fondateur
}
```

Google Rich Results peut extraire ces données. Un schema Organization sans adresse physique = un signal faible.

---

## PARTIE 4 — TOPOLOGIE DU MAILLAGE INTERNE (où le PageRank coule)

### 4.1 Flow de liens depuis la homepage

```
Homepage
├── Header mega-menu → 8 catégories services (links)
├── Header → 30+ villes majeures (via géolocalisation/dropdown)
├── Hero → CTA /services, /devis
├── PopularServicesLinks → 15 services historiques × link
├── PopularCitiesLinks → 20 villes top × link
├── PopularServiceCityLinks → ~30 combos service×ville × link
├── GeographicSection → 18 régions × link
├── Footer → 8 services + 10 villes + 4 outils + 10 pages légales
└── Environ 120-150 liens sortants au total
```

### 4.2 Flow de liens depuis service+ville (page critique)

```
/services/plombier/margency
├── Breadcrumb → / > /services > /services/plombier > current (3 liens)
├── Provider cards → /services/plombier/margency/[publicId] (N artisans)
├── SeoContent → /villes/margency/[quartier] (jusqu'à 10 liens quartiers)
├── TradeSections → /devis/plombier, /urgence/plombier (2 liens)
├── CrossLinks:
│   ├── 6 services liés → /services/[related]/margency
│   ├── 12 villes proches → /services/plombier/[nearby]
│   └── 10 villes du département → /services/plombier/[dept-ville]
├── FaqAndBlogSection → 2-4 articles blog liés
├── Header + Footer (global)
└── Environ 50-80 liens contextuels + 120 liens navigation
```

### 4.3 Les pages SOUS-ALIMENTÉES en liens

| Page | Liens entrants (hors nav) | Problème |
|------|--------------------------|----------|
| `/tarifs/[service]` | ~2 (depuis service+ville TradeSections + footer) | **Critique** — ces pages devraient recevoir des liens depuis chaque page service+ville |
| `/urgence/[service]` | ~2 (depuis TradeSections si emergencyInfo) | **Haute** — pas de lien depuis les pages non-urgence |
| `/devis/[service]/[location]` | ~0 depuis les pages service+ville | **Critique** — ces pages existent mais sont quasi-orphelines |
| `/avis/[service]/[ville]` | ~0 | **Critique** — aucun lien contextuel vers les pages avis localisées |
| `/problemes/[probleme]` | Liens depuis le hub `/problemes` uniquement | **Haute** — pas de maillage depuis les pages service |

### 4.4 Les pages SUR-ALIMENTÉES en liens

| Page | Liens entrants | Observation |
|------|---------------|-------------|
| Homepage | Tous les liens "Accueil" breadcrumb + header logo | Normal |
| `/services` | Tous les breadcrumbs service | Normal |
| `/services/[service]` (hubs) | Header + breadcrumbs + cross-links | Bien — ce sont les pages piliers |
| `/services/plombier/paris` | Cross-links de toutes les villes proches | **Excessif** vs petites villes |

---

## PARTIE 5 — SIGNAUX D'INDEXATION (canonical, noindex, ISR)

### 5.1 Ce qui se passe quand Google visite une petite ville pour la première fois

1. Googlebot request `/services/plombier/margency`
2. Next.js ISR : page non en cache → **génération à la volée** (~2-5s)
3. Page servie avec `Cache-Control: s-maxage=60, stale-while-revalidate`
4. **Googlebot reçoit une page COMPLÈTE** (pas de loading state) — c'est du SSR
5. La page inclut toutes les données (providers DB + commune data + location content)

**Verdict :** Pas de problème d'indexation ISR. Les pages sont servies complètes au premier hit.

### 5.2 Canonical URLs

Chaque page service+ville a un canonical explicite :
```html
<link rel="canonical" href="https://servicesartisans.fr/services/plombier/margency" />
```

**Pas de problème de canonical.** Pas de trailing slash, pas de paramètres, pas de duplicats.

### 5.3 Noindex conditionnel

```typescript
// Si service ou ville non trouvés → noindex
if (!serviceName || !locationName) {
  return { title: 'Non trouvé', robots: { index: false, follow: false } }
}
```

Le noindex est **bien implémenté** — seules les pages invalides sont noindexées.

Les providers ont un champ `noindex` en base mais les pages providers ne sont pas le sujet ici.

### 5.4 Risque de cannibalisation

| Paire de pages | Risque | Analyse |
|---------------|--------|---------|
| `/services/plombier/paris` vs `/devis/plombier/paris` | **Modéré** | Intent différent (trouver vs demander devis) mais titre similaire |
| `/services/plombier/paris` vs `/tarifs/plombier` | **Faible** | Intent clairement différent (trouver vs combien ça coûte) |
| `/services/solier/margency` vs `/services/poseur-de-parquet/margency` | **Élevé** | L'utilisateur cherchant "pose moquette" peut atterrir sur l'une ou l'autre |
| `/services/desinsectisation/[ville]` vs `/services/deratisation/[ville]` | **Modéré** | Utilisateurs confondent souvent les deux |

---

## PARTIE 6 — CE QUE GOOGLE VEUT (le verdict)

### 6.1 Les 3 signaux que Google attend MAINTENANT

**Signal 1 : Pertinence lexicale** (match requête ↔ contenu)

Google teste votre site sur des micro-niches. Quand un utilisateur tape "pose moquette margency", Google s'attend à trouver ces mots DANS la page — pas un synonyme technique. Les 5 positions page 1 prouvent que Google VEUT vous classer. Mais il ne peut pas améliorer votre CTR si votre snippet ne match pas la requête.

**Signal 2 : Profondeur de contenu sur les requêtes testées**

Vos pages dératisation font 200+ requêtes mais positions 30-50. Google vous montre le potentiel mais attend un signal de qualité pour monter. Le trade-content dératisation/désinsectisation est trop court. Les pages tarifs dératisation sont trop fines.

**Signal 3 : Identité légale vérifiable**

Pour un site qui recommande des artisans (YMYL-adjacent), Google attend un SIRET, une adresse physique, un fondateur identifiable. Le statut "en cours de développement" dans les mentions légales est un frein objectif.

### 6.2 Les 3 signaux que Google n'attend PAS maintenant

**PAS de backlinks massifs** — Google n'attend pas ça d'un site neuf. Il teste d'abord la qualité intrinsèque.

**PAS de position 1 sur "plombier paris"** — Ce terme est réservé aux domaines de 10+ ans. Google ne vous testera pas là-dessus avant d'avoir validé votre fiabilité sur les petites niches.

**PAS plus de pages** — Vous avez 1,5M de pages potentielles. Google n'a pas besoin de plus de pages. Il a besoin de MEILLEURES pages sur les URLs qu'il teste déjà.

---

## PARTIE 7 — CE QU'ON DOIT FAIRE (plan chirurgical)

### PHASE 1 : Semaine 1 — Capitaliser sur ce qui ranke déjà

#### Action 1.1 : Patch lexical sur les H1 et titles des pages en page 1-2

**Fichier :** `src/app/(public)/services/[service]/[location]/page.tsx`

Le système de H1 utilise 5 templates hash-basés. Aucun ne contient les termes naturels de l'utilisateur.

**Solution :** Ajouter un mapping `serviceSlug → termes naturels[]` et injecter le terme naturel le plus courant dans les templates de title et H1.

Exemples concrets :
| Service | Slug | Termes naturels à injecter |
|---------|------|---------------------------|
| Solier-moquettiste | `solier` | "pose moquette", "pose parquet", "revêtement de sol" |
| Carreleur | `carreleur` | "pose carrelage", "pose crédence", "faïence" |
| Jardinier | `jardinier` | "jardinage à domicile", "entretien jardin", "tonte pelouse" |
| Dératisation | `deratisation` | "dératiseur", "traitement rats", "traitement souris" |
| Désinsectisation | `desinsectisation` | "traitement cafards", "traitement punaises de lit", "désinsectiseur" |
| Alarme sécurité | `alarme-securite` | "installation alarme", "pose alarme", "système sécurité" |

**Impact attendu :** Les 5 requêtes page 1 devraient voir un CTR passer de 0% à 5-10% en 2-4 semaines. Les requêtes page 2-3 devraient monter de 1-3 positions.

#### Action 1.2 : Enrichir commonTasks dans trade-content.ts

**Fichier :** `src/lib/data/trade-content.ts`

Les `commonTasks` de chaque métier apparaissent sur les pages tarifs ET dans le contenu des pages service+ville. Ajouter les termes que les utilisateurs tapent réellement :

Pour `carreleur` → ajouter : "Pose de crédence de cuisine", "Pose de faïence murale"
Pour `solier` → ajouter : "Pose de moquette", "Pose de revêtement vinyle"
Pour `jardinier` → ajouter : "Jardinage à domicile", "Tonte de pelouse"
Pour `deratisation` → ajouter : "Traitement des rats", "Traitement des souris", "Dératisation copropriété"

**Impact :** Ces termes seront indexés sur TOUTES les pages service+ville de ces métiers (46 × 13 680 combinaisons).

#### Action 1.3 : Ajouter les pages GSC performantes au sitemap

**Fichier :** `src/lib/seo/sitemap-manifest.ts` + `src/app/sitemap.ts`

Créer un sitemap additionnel "GSC boost" contenant :
- Les ~50 combos service×ville qui ont des impressions GSC
- Les pages `/tarifs/[service]` (déjà dans le sitemap statique — vérifier)
- Les pages `/devis/[service]` (déjà dans le sitemap statique — vérifier)

**PAS besoin d'augmenter SITEMAP_TOP_CITIES à 200.** Juste ajouter les villes qui performent déjà. Signal ciblé, pas dilution.

### PHASE 2 : Semaine 2-3 — Combler les gaps critiques

#### Action 2.1 : Créer trade-content pour les 10 métiers manquants

**Ordre de priorité (par impact GSC + volume de recherche) :**

1. `peintre-en-batiment` — **SERVICE HISTORIQUE SANS CONTENU** → critique
2. `isolation-thermique` — 12 requêtes GSC, fort volume national
3. `alarme-securite` — 20 requêtes GSC, "devis alarme" en page 2
4. `pompe-a-chaleur` — fort volume national (MaPrimeRénov')
5. `panneaux-solaires` — fort volume national
6. `salle-de-bain` — fort volume naturel
7. `architecte-interieur` — 12 requêtes GSC
8. `renovation-energetique` — fort volume national
9. `poseur-de-parquet` — chevauche avec solier
10. `borne-recharge` — niche en croissance

Pour chaque métier, le trade-content doit inclure :
- `priceRange` : fourchette réaliste
- `commonTasks` : **8-10 prestations en langage utilisateur** (pas en jargon)
- `tips` : 5 conseils pratiques
- `faq` : **8 FAQ réalistes** (basées sur les requêtes GSC quand disponibles)
- `emergencyInfo` : si applicable
- `certifications` : 3-4 qualifications (RGE pour énergie, Qualifelec, etc.)
- `averageResponseTime`

#### Action 2.2 : Maillage tarifs ↔ services

**Dans chaque page `/services/[service]/[location]`**, ajouter un lien contextuel vers `/tarifs/[service]` dans le SeoContent (section pricing note).

**Dans chaque page `/tarifs/[service]`**, ajouter des liens vers les 10 villes les plus recherchées de ce métier (pas les 6 plus grosses villes, les villes avec des impressions GSC).

#### Action 2.3 : Enrichir les pages tarifs à 800+ mots

Les pages tarifs avec trade-content minimal font 300-400 mots. Les pages sans trade-content retournent 404.

Solution : Une fois les trade-content créés (action 2.1), les pages tarifs se remplissent automatiquement. Mais ajouter un paragraphe rédactionnel de 150-200 mots par métier dans le template tarifs pour passer le seuil de 800 mots.

### PHASE 3 : Mois 2-3 — Construire l'autorité

#### Action 3.1 : Immatriculer la société

C'est le **levier SEO le plus puissant** non-technique. Dès que le SIRET existe :
- Remplir company-identity.ts
- Supprimer le banner "en cours de développement"
- Ajouter le SIRET dans le schema Organization
- Ajouter l'adresse physique

#### Action 3.2 : Premiers backlinks

Pas besoin de 1 000 backlinks. 5-10 backlinks de qualité suffisent :
- Inscription sur les annuaires d'entreprises (societe.com, infogreffe, verif.com)
- Inscription Chambre des Métiers et de l'Artisanat
- 2-3 articles dans la presse BTP locale
- Profil Google Business

#### Action 3.3 : Monitoring GSC hebdomadaire

Mettre en place un suivi automatisé :
- Lundi : extraire les requêtes avec impressions > 5 et position < 30
- Identifier les pages correspondantes
- Vérifier que le H1/title contient les termes de la requête
- Si non → patch lexical ciblé
- Republier via ISR revalidation

---

## RÉSUMÉ EXÉCUTIF EN 3 PHRASES

1. **Google vous teste sur des micro-niches** — 5 requêtes en page 1 prouvent que le domaine n'est pas pénalisé. Le site est en phase d'évaluation, pas en phase de sanction.

2. **Le blocker #1 est le match lexical** — vos pages parlent le langage du métier ("solier-moquettiste") pas celui de l'utilisateur ("pose moquette"). Corriger ça débloque le CTR sur les requêtes déjà acquises.

3. **Le blocker #2 est l'identité légale** — un site YMYL-adjacent sans SIRET ne passera jamais le seuil de confiance de Google. L'immatriculation est un prérequis pour scaler.

---

**Préparé par :** Claude (analyse approfondie)
**Date :** 25 février 2026
**Fichiers analysés :** 30+ fichiers source, ~800 requêtes GSC, 3 749+ pages
