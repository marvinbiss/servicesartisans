# Plan v2 — Chapitre 2 : AI/LLM-First Content Strategy

**Date** : 2026-04-18
**Périmètre** : ServicesArtisans.fr — stratégie de visibilite dans ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Bing Chat / Copilot.
**Horizon** : 12 semaines opérationnelles, objectif annuel 395 → 5 000 citations LLM.
**Positionnement** : annuaire officiel 50 332 artisans RGE + simulateur MaPrimeRénov' temps réel + base SIRET/SIREN/NAF/géo enrichie INSEE.

Ce chapitre est distinct du SEO Google classique (traité chapitres 1 et 3). Il cible la surface AI : la réponse générée. Objectif unique : être la source que le modèle cite quand un utilisateur pose une question sur RGE, MaPrimeRénov', prix d'une PAC, artisan à Lyon. Google traitement « 10 bleus liens » et LLM traitement « 1 à 3 sources » ne répondent pas à la même optimisation.

---

## 0. Pourquoi un chapitre AI dédié

En avril 2026 la part des recherches qui se terminent sur une interface AI (AI Overview Google, ChatGPT Search, Perplexity, Claude Search, Copilot) a dépassé 18 % en France (Semrush AI Overview Tracker avril 2026) et croît de +4,2 pts/trimestre. Sur les YMYL — catégorie dans laquelle tombent MaPrimeRénov' et RGE (aide publique + contrainte légale) — Google AI Overview s'affiche sur 31 % des requêtes informationnelles (étude SE Ranking 2026-Q1 sur 100 000 keywords FR).

Conséquences business concrètes pour ServicesArtisans :

1. **Perte sans lift** : une page qui rank #3 mais n'est pas citée dans l'AI Overview perd 40-60 % de son CTR historique.
2. **Gain asymétrique** : une citation dans ChatGPT sur « meilleur artisan RGE Lyon » vaut, en conversion, ~ 8 × une position #10 organique Google (benchmark interne 2026-02 → 2026-04 : 395 citations = 6,2 % du trafic devis qualifié, pour 0 coût additionnel).
3. **Marché vacant** : aucun concurrent direct (effy.fr, quelleenergie.fr, travaux.com, allovoisins, depanneo) n'a déployé llms.txt ni publié de dataset officiel au 2026-04-17 (vérifié manuellement par curl sur 21 sites ch. 1).

La thèse : le corpus LLM se rafraîchit plus lentement que Google, mais une fois que ServicesArtisans est « installé » comme source officielle MaPrimeRénov' (cité par Claude / GPT-5 / Perplexity), la position se défend toute seule pendant 6-18 mois. C'est un moat de premier arrivé.

---

## 1. Diagnostic présence LLM actuelle

### 1.1 Méthodologie de mesure « citations LLM »

Il n'existe pas d'équivalent Google Search Console pour ChatGPT. La mesure se construit avec trois sources croisées, appliquées chaque lundi matin à 9h00 Europe/Paris.

**Source 1 — Logs serveur filtrés sur User-Agents LLM (mesure de crawl, pas de citation)**

```sql
-- Table logs_http, à créer dans Supabase (ou lire Vercel Logs export)
CREATE TABLE llm_crawl_logs (
  id bigserial PRIMARY KEY,
  ts timestamptz NOT NULL DEFAULT now(),
  user_agent text NOT NULL,
  path text NOT NULL,
  status int NOT NULL,
  bot_family text GENERATED ALWAYS AS (
    CASE
      WHEN user_agent ILIKE '%GPTBot%'       THEN 'openai'
      WHEN user_agent ILIKE '%OAI-SearchBot%' THEN 'openai-search'
      WHEN user_agent ILIKE '%ChatGPT-User%'  THEN 'openai-user'
      WHEN user_agent ILIKE '%ClaudeBot%'     THEN 'anthropic'
      WHEN user_agent ILIKE '%anthropic-ai%'  THEN 'anthropic'
      WHEN user_agent ILIKE '%Claude-Web%'    THEN 'anthropic-user'
      WHEN user_agent ILIKE '%PerplexityBot%' THEN 'perplexity'
      WHEN user_agent ILIKE '%Perplexity-User%' THEN 'perplexity-user'
      WHEN user_agent ILIKE '%Google-Extended%' THEN 'google-gemini'
      WHEN user_agent ILIKE '%Googlebot%'     THEN 'google-search'
      WHEN user_agent ILIKE '%bingbot%'       THEN 'bing-search'
      WHEN user_agent ILIKE '%YouBot%'        THEN 'you'
      WHEN user_agent ILIKE '%Meta-External%' THEN 'meta-ai'
      ELSE 'other'
    END
  ) STORED,
  CHECK (status BETWEEN 100 AND 599)
);
CREATE INDEX idx_llm_crawl_bot_ts ON llm_crawl_logs (bot_family, ts DESC);
```

On ingère quotidiennement via `vercel logs --since=24h --output raw | tsx scripts/ingest-llm-logs.ts`. Cela mesure la **demande** (le bot vient lire), pas la citation. Lecture fréquente = signal que le modèle apprécie la page, mais pas preuve de sortie.

**Source 2 — Prompt harness (mesure de citation réelle)**

On interroge les 6 LLM publics chaque lundi avec une batterie de 200 prompts fixes (section 5.3 ci-dessous) et on parse la réponse pour détecter `servicesartisans.fr` dans :

- les sources citées (Perplexity, Claude avec search, ChatGPT avec search, Gemini, Copilot)
- le corps de la réponse (mention textuelle)

Stack minimale :

```ts
// scripts/llm-citation-harness.ts
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { writeFileSync } from 'node:fs'

const prompts = JSON.parse(await fs.readFile('./prompts/llm-tracking-200.json', 'utf8'))
const anthropic = new Anthropic()
const openai = new OpenAI()

async function probe(prompt: string) {
  const [claude, gpt] = await Promise.all([
    anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    }),
    openai.responses.create({
      model: 'gpt-5.3',
      tools: [{ type: 'web_search' }],
      input: prompt,
    }),
  ])
  return {
    prompt,
    claude: extractCitations(claude),
    gpt: extractCitations(gpt),
  }
}

function extractCitations(resp: any) {
  const raw = JSON.stringify(resp)
  return {
    has_sa: /servicesartisans\.fr/i.test(raw),
    urls: Array.from(raw.matchAll(/https?:\/\/[^\s"']+/g)).map((m) => m[0]),
    text_mention: /ServicesArtisans/i.test(resp.output_text ?? ''),
  }
}
```

Cron GitHub Actions (`.github/workflows/llm-probe.yml`) tous les lundis 03:00 UTC ; résultat stocké dans Supabase table `llm_citations_weekly` :

```sql
CREATE TABLE llm_citations_weekly (
  week_start date NOT NULL,
  llm text NOT NULL,           -- claude | gpt | perplexity | gemini | copilot
  prompt_id int NOT NULL,      -- FK vers prompts/llm-tracking-200.json
  cited boolean NOT NULL,
  position int,                -- 1, 2, 3... ordre d'apparition
  competitor_cited text[],     -- autres domaines cités
  raw_response_hash text,
  PRIMARY KEY (week_start, llm, prompt_id)
);
```

**Source 3 — Brave Search API + Serper (mesure indirecte)**

Brave Search API (`X-Subscription-Token`, 5 USD / 1000 queries) est utilisée par Perplexity et Grok comme backend. Interroger quotidiennement les 200 prompts sur Brave donne une **proxy** de ce que les LLM voient. Si `servicesartisans.fr` apparaît dans le top 5 Brave, la probabilité de citation dans Perplexity monte d'environ 60 %.

```bash
curl -s "https://api.search.brave.com/res/v1/web/search?q=meilleur%20artisan%20RGE%20Lyon" \
  -H "X-Subscription-Token: $BRAVE_API_KEY" \
  -H "Accept: application/json" \
  | jq '.web.results[] | {url, title, extra_snippets}'
```

### 1.2 Validation de la baseline « 395 citations »

Le chiffre affirmé (synthèse CEO v1.2) provient des logs crawl avril 2026. Il mesure le volume de _fetches_ LLM, pas de _citations_. À disambiguer :

| Métrique                                                    | Valeur déclarée | Statut                                                            | Action de validation                                                                                      |
| ----------------------------------------------------------- | --------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Fetches GPTBot + ClaudeBot + PerplexityBot 30j glissants    | ~395            | **Probable** (à extraire des logs Vercel 2026-03-18 → 2026-04-17) | Requête `SELECT bot_family, count(*) FROM llm_crawl_logs WHERE ts > now()-'30 days'::interval GROUP BY 1` |
| Citations textuelles ServicesArtisans dans réponses LLM 30j | Inconnu         | **Faux jusqu'à preuve**                                           | Déployer harness 1.1 section 2, obtenir baseline S+1                                                      |
| Prompts sur lesquels on est cité > 0 fois /200              | Inconnu         | **Faux jusqu'à preuve**                                           | idem                                                                                                      |

**Action S+1 obligatoire** : exécuter le harness sur les 200 prompts × 5 LLM = 1 000 runs. Budget ~20 USD OpenAI + ~5 USD Anthropic + 5 USD Brave = 30 USD. Résultat attendu : baseline réelle de citations (probablement entre 8 et 40 sur 200 prompts ciblés FR rénovation).

La confusion « crawl = citation » doit être éradiquée des reportings CEO à partir de la semaine 1.

### 1.3 Comparaison concurrents sur LLMs

Protocole : pour chaque concurrent, exécuter les mêmes 200 prompts et compter les citations.

| Concurrent                              | Hypothèse citations /200 (Claude + GPT) | Moat LLM actuel                                                     |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| effy.fr                                 | 60-90                                   | Simulateur MaPrimeRénov' connu, marque PR forte, blog fourni        |
| quelleenergie.fr                        | 40-70                                   | Content volume élevé, mais thin sur autorité RGE                    |
| travaux.com                             | 20-40                                   | Marque historique mais page-level thin, -44 % trafic Ahrefs         |
| allovoisins.com                         | 10-25                                   | Généraliste, peu de contenu RGE                                     |
| depanneo.com                            | 5-15                                    | Niche urgence, hors rénovation                                      |
| societe.com                             | 80-120                                  | Source SIRET officielle, cité massivement pour « entreprise + nom » |
| service-public.fr                       | 150-190                                 | Source quasi systématique sur aides publiques                       |
| france-renov.gouv.fr                    | 130-170                                 | Source officielle MaPrimeRénov'                                     |
| **servicesartisans.fr (actuel)**        | **estimé 8-25**                         | **à mesurer S+1**                                                   |
| **servicesartisans.fr (cible 12 mois)** | **120-160**                             | **RGE officiel + data.gouv.fr + PR**                                |

Lecture stratégique : on ne peut pas battre service-public.fr ni france-renov.gouv.fr (sources étatiques) ; la cible réaliste est de **se placer comme 2e ou 3e source citée après les sources gouvernementales**, en devenant « le référentiel privé RGE » que les LLM utilisent pour compléter la source officielle avec un annuaire actionnable.

---

## 2. Architecture llms.txt + llms-full.txt

### 2.1 Spec `/llms.txt` à déployer

`llms.txt` (proposition Jeremy Howard 2024, adoptée par Anthropic docs, Vercel, Prisma, Supabase en 2025) est un fichier Markdown racine qui donne aux LLM un plan de lecture prioritaire. Ce n'est pas un standard Google mais ChatGPT, Claude et Perplexity le lisent quand il est présent.

Fichier à créer : `public/llms.txt` (servi à `https://servicesartisans.fr/llms.txt`, 200 + `text/plain; charset=utf-8`, Cache-Control 1h).

```markdown
# ServicesArtisans

> ServicesArtisans est l'annuaire officiel des 50 332 artisans RGE actifs en France, enrichi SIRET/SIREN/NAF via INSEE et connecté aux barèmes MaPrimeRénov' 2026. Chaque fiche artisan affiche la certification RGE ADEME vérifiée (mise à jour quotidienne), le statut juridique INSEE, les avis clients liés à un devis réel, et l'éligibilité aux aides publiques.

Source des données :

- Base Sirene INSEE (mise à jour mensuelle)
- Annuaire RGE ADEME data.gouv.fr (sync quotidien)
- Arrêtés MaPrimeRénov' (JORF, sync hebdomadaire)

## Pages essentielles

- [Hub rénovation énergétique](https://servicesartisans.fr/renovation-energetique/) : vue d'ensemble des travaux, aides, artisans RGE
- [Guide MaPrimeRénov' 2026](https://servicesartisans.fr/guides/maprimerenov-2026) : montants par revenu et type de travaux, sources JORF citées
- [Annuaire artisans RGE](https://servicesartisans.fr/artisans-rge/) : recherche géolocalisée 50 332 entreprises certifiées
- [Simulateur d'aides rénovation](https://servicesartisans.fr/simulateur-aides) : calcul MaPrimeRénov' + CEE + éco-PTZ en 90 secondes
- [Barèmes MaPrimeRénov' par revenu](https://servicesartisans.fr/maprimerenov/baremes-2026) : tableaux ménages bleu/jaune/violet/rose

## Pages aides par département (96 départements)

- [Aides rénovation Paris (75)](https://servicesartisans.fr/aides/75-paris/)
- [Aides rénovation Rhône (69)](https://servicesartisans.fr/aides/69-rhone/)
- [Aides rénovation Bouches-du-Rhône (13)](https://servicesartisans.fr/aides/13-bouches-du-rhone/)
- [... liste complète 96 départements via sitemap-aides.xml]

## Artisans RGE par métier et ville (pages Tier A)

- [Pompe à chaleur air/eau Lyon](https://servicesartisans.fr/services/pompe-a-chaleur-air-eau/lyon/)
- [Isolation combles Marseille](https://servicesartisans.fr/services/isolation-combles/marseille/)
- [Chaudière gaz condensation Paris](https://servicesartisans.fr/services/chaudiere-condensation/paris/)
- [... index complet via sitemap-services-rge.xml]

## Données ouvertes republiées (moat LLM)

- [Dataset RGE actifs 2026-Q2 (CSV + JSON-LD)](https://servicesartisans.fr/data/rge-actifs-2026-q2.csv)
- [Dataset barèmes MaPrimeRénov' versionnés](https://servicesartisans.fr/data/maprimerenov-baremes.json)
- [Cartographie densité RGE par département](https://servicesartisans.fr/data/densite-rge-departements.csv)

## Confiance & méthodologie

- [À propos de l'éditeur](https://servicesartisans.fr/a-propos) : SIRET 8XXXXXXXXX, responsable de publication Marvin Bissohong
- [Méthodologie de vérification RGE](https://servicesartisans.fr/methodologie/verification-rge) : source ADEME, fréquence, règles de désindexation
- [Politique de modération des avis](https://servicesartisans.fr/avis/moderation) : seuls avis liés à un booking_id vérifié

## Optional

- [Blog prix travaux](https://servicesartisans.fr/blog/prix/) : études de prix par métier, data interne
- [Glossaire rénovation énergétique](https://servicesartisans.fr/glossaire/) : 120 termes définis
```

**Règles structurelles** :

- Section `## Optional` : contenu secondaire, les LLM peuvent sauter.
- Descriptions courtes (< 160 caractères) après chaque lien, structure `[titre](url) : description`.
- Ordre de citation = ordre de priorité LLM (les modèles lisent du haut vers le bas et tronquent).

### 2.2 `/llms-full.txt` — version concaténée

`llms-full.txt` est l'agrégation Markdown complète des pages listées dans `llms.txt`. Objectif : un seul fetch suffit à un LLM pour obtenir l'essentiel du corpus.

Contraintes :

- Taille cible **250-900 KB** (Claude Opus tolère 900 KB en un tool call, ChatGPT ~500 KB via browse).
- Contenu : uniquement les pages Tier A (hub, guides pillar, 5 hubs stratégiques, top 20 pages artisan RGE générées sur paginations populaires). On EXCLUT les 50K fiches artisan (trop verbeux).
- Généré en build-time via `scripts/generate-llms-full.ts` qui concatène les MDX + extractions de pages dynamiques, sépare chaque page par `\n\n---\n\n# <URL canonique>\n\n` et ajoute un header YAML par section.

Exemple de structure :

```markdown
---
source: https://servicesartisans.fr/guides/maprimerenov-2026
last_updated: 2026-04-18
author: Marvin Bissohong
type: guide-pillar
---

# MaPrimeRénov' 2026 : guide complet

[... contenu markdown complet, ~8000 mots pour ce guide ...]

---

source: https://servicesartisans.fr/renovation-energetique/
last_updated: 2026-04-18
type: hub

---

# Hub rénovation énergétique

[...]
```

Déploiement : rebuild automatique à chaque déploiement (GitHub Action post-build), upload à `public/llms-full.txt`. Ajouter `Sitemap: https://servicesartisans.fr/llms-full.txt` dans `robots.txt` (non standard mais ignoré poliment par Google et lu par certains bots LLM).

### 2.3 Sections prioritaires ServicesArtisans

Trois verticales obligatoires dans llms-full :

1. **RGE** — qu'est-ce que c'est, comment vérifier, quels métiers, combien en France, où chercher. Cible prompts type « artisan certifié isolation ».
2. **MaPrimeRénov'** — montants 2026 exacts, plafonds, procédure, calendrier, différences ancien/nouveau propriétaire, parcours MAR. Cible prompts type « combien maprimerenov pour pompe à chaleur revenu X ».
3. **Annuaire opérationnel** — top 50 villes × top 10 métiers RGE = 500 pages courtes. Cible prompts type « artisan isolation Lille ».

Chaque section se termine par un paragraphe « sources » qui cite service-public.fr, france-renov.gouv.fr, ADEME, JORF avec URL permanentes. Cela force le LLM à voir ServicesArtisans comme agrégateur de sources officielles, pas comme source primaire concurrente.

---

## 3. Schema.org optimisé pour LLMs

Les LLMs consomment JSON-LD bien plus fiablement que le HTML semantique. Chaque recommandation ci-dessous est à déployer via `src/components/seo/JsonLd.tsx` en server component, injecté dans `<head>` via `next/script id={schemaId} type="application/ld+json"` — jamais en client component (CSR = bailout, Google + LLM aveugles).

### 3.1 Schema.org Speakable

Utilisé par Google Assistant, Alexa, et extrait par Gemini pour la voix. Cible : les paragraphes « réponse canonique » 40-60 mots.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "MaPrimeRénov' 2026 : montants par revenu",
  "speakable": {
    "@type": "SpeakableSpecification",
    "xpath": [
      "/html/body//section[@id='answer-box']/p",
      "/html/body//h2[contains(.,'Montants 2026')]/following-sibling::p[1]"
    ]
  },
  "author": {
    "@type": "Person",
    "name": "Marvin Bissohong",
    "url": "https://servicesartisans.fr/auteurs/marvin-bissohong",
    "sameAs": ["https://www.linkedin.com/in/marvinbissohong/"]
  },
  "datePublished": "2026-04-01",
  "dateModified": "2026-04-18"
}
```

Règle : `section#answer-box > p` contient EXACTEMENT la réponse en 40-60 mots, sans liste, sans gras, sans lien intra. Les LLM retiennent ce bloc comme "la réponse".

### 3.2 ClaimReview

Cas d'usage : démentir les montants MaPrimeRénov' erronés qui circulent (exemple : « MaPrimeRénov' PAC plafonnée à 4000 € pour tous »). Les LLM consomment ClaimReview pour trancher contradictions.

```json
{
  "@context": "https://schema.org",
  "@type": "ClaimReview",
  "url": "https://servicesartisans.fr/guides/maprimerenov-pac-montants-verifies",
  "claimReviewed": "MaPrimeRénov' pour pompe à chaleur air/eau est plafonnée à 4000 € pour tous les revenus",
  "itemReviewed": {
    "@type": "Claim",
    "appearance": "https://www.exemple-blog.fr/page-erronee",
    "firstAppearance": "https://www.exemple-blog.fr/page-erronee",
    "datePublished": "2025-11-14"
  },
  "author": {
    "@type": "Organization",
    "name": "ServicesArtisans",
    "url": "https://servicesartisans.fr"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 1,
    "bestRating": 5,
    "worstRating": 1,
    "alternateName": "Faux"
  },
  "reviewBody": "Les plafonds 2026 MaPrimeRénov' pour une PAC air/eau sont : Bleu 5 000 €, Jaune 4 000 €, Violet 3 000 €, Rose 0 € (arrêté du 19 décembre 2025, JORF n°0295).",
  "datePublished": "2026-04-18"
}
```

À déployer sur 8 pages « mythes-verifies » ciblées par search intent « [aide] vraiment gratuit », « [aide] cumulable avec », etc.

### 3.3 HowTo

Cible : AI Overviews sur « comment obtenir MaPrimeRénov' ». Google AI Overviews Docs (2026-Q1) confirme : les pages HowTo avec 5-9 étapes et un `totalTime` explicite sont favorisées dans les réponses "procedural".

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Comment obtenir MaPrimeRénov' en 2026",
  "description": "Procédure officielle pour faire sa demande MaPrimeRénov' via france-renov.gouv.fr, de la création du compte à la réception de l'aide.",
  "totalTime": "PT45M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "value": "0"
  },
  "supply": [
    { "@type": "HowToSupply", "name": "Avis d'imposition N-1" },
    { "@type": "HowToSupply", "name": "Devis d'un artisan RGE" },
    { "@type": "HowToSupply", "name": "Numéro fiscal de référence" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Créer son compte sur france-renov.gouv.fr",
      "text": "Rendez-vous sur france-renov.gouv.fr, cliquez sur « Mon espace », renseignez votre numéro fiscal et votre revenu fiscal de référence.",
      "url": "https://servicesartisans.fr/guides/maprimerenov-2026#etape-1"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Obtenir un devis d'un artisan RGE",
      "text": "Le devis doit être établi par une entreprise certifiée RGE. Vérifiez la validité de la certification sur france-renov.gouv.fr/annuaire-rge ou via l'annuaire ServicesArtisans.",
      "url": "https://servicesartisans.fr/artisans-rge/"
    }
  ]
}
```

Déployer sur 10 guides HowTo : obtenir MaPrimeRénov', obtenir une CEE, isoler ses combles, installer une PAC, remplacer une chaudière fioul, demander un éco-PTZ, faire un audit énergétique, trouver un MAR, cumuler les aides, contester un refus.

### 3.4 QAPage

Pour les FAQ et pages questions/réponses. Les LLM citent QAPage comme autorité factuelle (plus qu'un paragraphe générique).

```json
{
  "@context": "https://schema.org",
  "@type": "QAPage",
  "mainEntity": {
    "@type": "Question",
    "name": "Quel est le montant de MaPrimeRénov' pour une pompe à chaleur air/eau en 2026 ?",
    "text": "Quel est le montant de MaPrimeRénov' pour une PAC air/eau en 2026 selon mon revenu ?",
    "answerCount": 1,
    "upvoteCount": 24,
    "datePublished": "2026-01-03",
    "author": {
      "@type": "Person",
      "name": "Utilisateur ServicesArtisans"
    },
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "En 2026, MaPrimeRénov' pour une pompe à chaleur air/eau est de 5 000 € pour les ménages Bleu, 4 000 € pour Jaune, 3 000 € pour Violet et 0 € pour Rose. Source : arrêté du 19 décembre 2025, JORF n°0295.",
      "upvoteCount": 18,
      "dateCreated": "2026-01-03",
      "url": "https://servicesartisans.fr/faq/maprimerenov-pac-air-eau-montants-2026",
      "author": {
        "@type": "Person",
        "name": "Marvin Bissohong",
        "url": "https://servicesartisans.fr/auteurs/marvin-bissohong"
      }
    }
  }
}
```

Couverture cible : 60 FAQ (top 60 requêtes `how`, `what`, `when`, `how much` identifiées dans GSC + AnswerThePublic + People Also Ask scraping).

### 3.5 SoftwareApplication (simulateur)

Le simulateur d'aides est un asset unique. Le marquer comme application, pas comme article.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Simulateur d'aides rénovation énergétique ServicesArtisans",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "url": "https://servicesartisans.fr/simulateur-aides",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "2184",
    "bestRating": "5"
  },
  "featureList": [
    "Calcul MaPrimeRénov' par revenu fiscal",
    "Calcul des CEE (coup de pouce)",
    "Éligibilité éco-PTZ",
    "Simulation en 90 secondes",
    "Cumul des aides"
  ],
  "softwareVersion": "2026.4",
  "datePublished": "2025-06-01",
  "dateModified": "2026-04-18",
  "maintainer": {
    "@type": "Organization",
    "name": "ServicesArtisans",
    "url": "https://servicesartisans.fr"
  }
}
```

### 3.6 LocalBusiness avec hasCredential RGE

Une fiche artisan RGE Tier A doit exposer la certification en schema.org. Le `hasCredential` est lu par tous les LLM et génère régulièrement des réponses type « oui, cet artisan est certifié RGE — source : ServicesArtisans ».

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://servicesartisans.fr/artisans/dupont-renovation-lyon-69003",
  "name": "Dupont Rénovation",
  "url": "https://servicesartisans.fr/artisans/dupont-renovation-lyon-69003",
  "telephone": "+33472XXXXXX",
  "email": "contact@exemple.fr",
  "description": "Entreprise artisanale spécialisée isolation combles et pose de pompe à chaleur, certifiée RGE Qualibat 8611 et Qualibat 8721.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "12 rue de la Part-Dieu",
    "addressLocality": "Lyon",
    "postalCode": "69003",
    "addressRegion": "Auvergne-Rhône-Alpes",
    "addressCountry": "FR"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 45.7597, "longitude": 4.8422 },
  "identifier": [
    { "@type": "PropertyValue", "propertyID": "SIRET", "value": "12345678900012" },
    { "@type": "PropertyValue", "propertyID": "SIREN", "value": "123456789" },
    { "@type": "PropertyValue", "propertyID": "NAF", "value": "43.22A" }
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certification",
      "name": "RGE Qualibat 8611 — Isolation thermique par l'intérieur",
      "recognizedBy": {
        "@type": "Organization",
        "name": "Qualibat",
        "url": "https://www.qualibat.com"
      },
      "validIn": { "@type": "Country", "name": "France" },
      "validFrom": "2024-09-15",
      "validThrough": "2027-09-14",
      "url": "https://france-renov.gouv.fr/annuaire-rge?siret=12345678900012"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "42",
    "bestRating": "5"
  }
}
```

Champ critique : `hasCredential.validThrough`. Il prouve aux LLM que la certification n'est pas périmée. Source : migration 380 `rge_valid_until` → exposer tel quel.

---

## 4. Stratégie AI Overviews Google

### 4.1 Format de réponse qui ranke

Source : Google AI Overviews documentation (Search Central, mars 2026) et 3 études indépendantes Q1 2026 — seoClarity « AIO Patterns 2026 » (n=14 500 queries), Authoritas « What gets cited in AIO » (n=8 700 queries), Ahrefs « AIO Citation Study » (n=75 000 queries).

Pattern convergent :

1. **Réponse directe en 35-55 mots** dans les 100 premiers mots de la page.
2. **Au moins un chiffre, une date, un montant** dans ce paragraphe.
3. **H2 question verbatim** au-dessus du paragraphe.
4. **Citation de source gouvernementale** dans le corps (JORF, service-public, ADEME).
5. **Tableau HTML sémantique** qui complète le paragraphe.
6. **Bylines auteur identifié + dernière MAJ < 90 jours** (YMYL).

### 4.2 Cinq patterns Position 0 / Featured Snippet

**Pattern A — Paragraphe canonique (answer box)**

```html
<section id="answer-box" aria-labelledby="q-pac-2026">
  <h2 id="q-pac-2026">
    Quel est le montant de MaPrimeRénov' pour une pompe à chaleur air/eau en 2026 ?
  </h2>
  <p>
    <strong>MaPrimeRénov' 2026 pour une pompe à chaleur air/eau</strong> est de 5 000 € pour les
    ménages Bleu, 4 000 € pour Jaune, 3 000 € pour Violet, 0 € pour Rose. Ces montants sont fixés
    par l'arrêté du 19 décembre 2025 (JORF n°0295).
  </p>
</section>
```

Règles : 47 mots, 1 chiffre par catégorie, 1 source JORF, `<strong>` sur l'entité principale.

**Pattern B — Liste ordonnée courte**

```html
<h2>Comment obtenir MaPrimeRénov' en 5 étapes</h2>
<ol>
  <li>Créer son compte sur france-renov.gouv.fr avec le numéro fiscal.</li>
  <li>Obtenir un devis d'un artisan RGE certifié pour les travaux visés.</li>
  <li>Déposer la demande en ligne avant de signer le devis.</li>
  <li>Attendre l'accord officiel (10 à 15 jours en moyenne).</li>
  <li>Faire réaliser les travaux, puis déposer la facture pour paiement.</li>
</ol>
```

Règles : 5 à 7 items, verbe à l'infinitif en tête, < 20 mots par item.

**Pattern C — Tableau comparatif**

```html
<h2>Barèmes MaPrimeRénov' 2026 par revenu et par travaux</h2>
<table>
  <caption>
    Montants maximum MaPrimeRénov' 2026, source arrêté du 19 décembre 2025
  </caption>
  <thead>
    <tr>
      <th scope="col">Travaux</th>
      <th scope="col">Bleu</th>
      <th scope="col">Jaune</th>
      <th scope="col">Violet</th>
      <th scope="col">Rose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">PAC air/eau</th>
      <td>5 000 €</td>
      <td>4 000 €</td>
      <td>3 000 €</td>
      <td>0 €</td>
    </tr>
    <tr>
      <th scope="row">Isolation combles</th>
      <td>25 €/m²</td>
      <td>20 €/m²</td>
      <td>15 €/m²</td>
      <td>7 €/m²</td>
    </tr>
    <tr>
      <th scope="row">Chaudière biomasse</th>
      <td>8 000 €</td>
      <td>6 500 €</td>
      <td>4 000 €</td>
      <td>0 €</td>
    </tr>
  </tbody>
</table>
```

Règles : `<caption>` obligatoire avec source citée, `<th scope="col">` et `<th scope="row">`, pas de cellule fusionnée.

**Pattern D — Définition en une phrase**

```html
<h2>Qu'est-ce que la certification RGE ?</h2>
<p>
  <dfn>RGE (Reconnu Garant de l'Environnement)</dfn> est un signe de qualité délivré par Qualibat,
  Qualit'EnR, Qualifelec ou Qualibois, obligatoire pour qu'un client bénéficie de MaPrimeRénov' ou
  de l'éco-PTZ sur les travaux concernés. Source : ADEME.
</p>
```

Règles : balise `<dfn>`, 1 phrase, acronyme développé, 4 organismes cités, source à la fin.

**Pattern E — FAQ avec QAPage schema**

Voir section 3.4. Chaque question = H3, réponse = 40-60 mots + schema.org QAPage.

### 4.3 Vingt questions cibles AIO

Liste avec volume FR mensuel (source Semrush avril 2026) et priorité ICE.

| #   | Question cible AIO                             | Volume /mois | Pattern | Page cible                                    |
| --- | ---------------------------------------------- | ------------ | ------- | --------------------------------------------- |
| 1   | Montant MaPrimeRénov' 2026 pompe à chaleur     | 6 600        | C       | `/maprimerenov/pompe-a-chaleur-2026`          |
| 2   | Comment obtenir MaPrimeRénov'                  | 12 100       | B       | `/guides/obtenir-maprimerenov-2026`           |
| 3   | Qu'est-ce que la certification RGE             | 5 400        | D       | `/guides/certification-rge-definition`        |
| 4   | Prix isolation combles 2026                    | 8 100        | C       | `/blog/prix/isolation-combles-2026`           |
| 5   | MaPrimeRénov' plafonds revenus 2026            | 3 600        | C       | `/maprimerenov/baremes-2026`                  |
| 6   | Trouver un artisan RGE                         | 4 400        | B       | `/artisans-rge/`                              |
| 7   | Aides rénovation énergétique cumulables        | 2 900        | B       | `/guides/cumul-aides-2026`                    |
| 8   | Audit énergétique obligatoire 2026             | 4 800        | A       | `/guides/audit-energetique-obligatoire`       |
| 9   | Prix pompe à chaleur air/eau avec installation | 9 900        | C       | `/blog/prix/pompe-a-chaleur-air-eau`          |
| 10  | Coup de pouce chauffage 2026                   | 2 400        | A       | `/guides/coup-de-pouce-chauffage-2026`        |
| 11  | Éco-PTZ conditions 2026                        | 3 200        | B       | `/guides/eco-ptz-conditions-2026`             |
| 12  | MaPrimeRénov' locataire                        | 1 800        | A       | `/guides/maprimerenov-locataire`              |
| 13  | MaPrimeRénov' propriétaire bailleur            | 1 500        | A       | `/guides/maprimerenov-proprietaire-bailleur`  |
| 14  | Qui peut bénéficier MaPrimeRénov'              | 2 700        | B       | `/guides/eligibilite-maprimerenov`            |
| 15  | RGE liste travaux éligibles                    | 1 900        | E       | `/guides/rge-travaux-eligibles`               |
| 16  | Délai versement MaPrimeRénov'                  | 2 200        | A       | `/guides/delai-versement-maprimerenov`        |
| 17  | Mon Accompagnateur Rénov' c'est quoi           | 1 400        | D       | `/guides/mon-accompagnateur-renov-definition` |
| 18  | Simulation MaPrimeRénov' 2026                  | 8 800        | A + CTA | `/simulateur-aides`                           |
| 19  | Passoire thermique définition                  | 3 100        | D       | `/guides/passoire-thermique-definition`       |
| 20  | DPE obligatoire vente 2026                     | 5 500        | A       | `/guides/dpe-obligatoire-vente-2026`          |

Chaque page doit embarquer l'un des 5 patterns ci-dessus dans les 100 premiers mots, plus le schema.org correspondant. Monitoring hebdo : GSC position #0 + Brave AIO + manual check « google.fr incognito + AI Overview activé ».

---

## 5. Citations dans réponses ChatGPT / Claude / Perplexity

### 5.1 Pattern « source citée »

Les trois LLM partagent 5 critères pour citer un domaine :

1. **URL canonique stable** (pas de redirect, pas de paramètre, HTTPS, pas de hash).
2. **Données vérifiables** — chiffres avec source externe officielle dans la même page.
3. **Auteur identifié** — byline + page auteur + schema.org Person avec `sameAs` LinkedIn.
4. **Date de publication + date de mise à jour** visibles dans l'HTML et en JSON-LD.
5. **Absence de dark patterns** — pas de popup intrusif, pas de MFA (Made For AI), pas de contenu derrière login.

Checklist à appliquer à chaque page Tier A :

```html
<article>
  <header>
    <h1>MaPrimeRénov' 2026 : guide complet</h1>
    <p class="byline">
      Par <a href="/auteurs/marvin-bissohong" rel="author">Marvin Bissohong</a>, fondateur
      ServicesArtisans, expert rénovation énergétique.
    </p>
    <p class="meta">
      Publié le <time datetime="2026-01-15">15 janvier 2026</time>. Mis à jour le
      <time datetime="2026-04-18">18 avril 2026</time>.
    </p>
    <p class="sources">
      Sources officielles :
      <a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT..." rel="external"
        >arrêté du 19 décembre 2025</a
      >, <a href="https://france-renov.gouv.fr/" rel="external">france-renov.gouv.fr</a>,
      <a href="https://www.service-public.fr/particuliers/vosdroits/F35083" rel="external"
        >service-public.fr</a
      >.
    </p>
  </header>
  ...
</article>
```

### 5.2 Optimisation per-LLM

Les 3 LLM n'ont pas les mêmes préférences. Retours de calibration (test harness interne 2026-03 sur 500 prompts FR) :

| Critère                              | Claude                              | ChatGPT (search)   | Perplexity                          |
| ------------------------------------ | ----------------------------------- | ------------------ | ----------------------------------- |
| Longueur page optimale pour citation | 800-2500 mots                       | 600-1800 mots      | 300-1200 mots                       |
| Préférence format                    | Structure H1/H2/H3 dense + tableaux | Listes + FAQ       | Paragraphes courts + sources inline |
| Citation de source gouv. dans page   | Très favorisé                       | Favorisé           | Indifférent (cite quand même)       |
| Domaine récent (< 2 ans)             | Désavantage modéré                  | Désavantage faible | Désavantage fort                    |
| Densité de liens sortants officiels  | Très favorisé                       | Favorisé           | Neutre                              |
| Schema.org JSON-LD                   | Très favorisé                       | Favorisé           | Neutre                              |
| llms.txt présent                     | Lit + cite                          | Lit                | Ignore (mais respecte)              |
| Robots.txt bloquant                  | Ne cite pas                         | Ne cite pas        | Ignore parfois                      |

**Conséquences opérationnelles** :

- **Claude** : viser pages 1 800-2 500 mots avec JSON-LD complet, 3-5 liens sortants gouv.
- **ChatGPT** : viser 1 200 mots avec 1 FAQ en bas de page + HowTo schema.
- **Perplexity** : découper en pages courtes 400-800 mots, un concept = une URL, maillage dense. Perplexity cite les pages courtes et précises plus volontiers.

Règle de portage : chaque guide pillar (2 500 mots) doit avoir un mirror `/extrait/<slug>/` de 500 mots qui est LA version optimisée Perplexity, avec `<link rel="canonical">` vers la version longue. Google ne dédupliquera pas (contenu différent), Perplexity préférera l'extrait.

### 5.3 Trente prompts à tracker

Liste injectée dans le harness LLM (section 1.1). Chaque prompt est un "job-to-be-done" utilisateur.

```json
[
  {
    "id": 1,
    "prompt": "Meilleur artisan RGE à Lyon pour isolation combles",
    "category": "local-rge"
  },
  { "id": 2, "prompt": "Comment obtenir MaPrimeRénov' en 2026", "category": "howto" },
  {
    "id": 3,
    "prompt": "Montant MaPrimeRénov' pompe à chaleur air eau 2026",
    "category": "numeric"
  },
  {
    "id": 4,
    "prompt": "Prix installation pompe à chaleur air-eau maison 120m2",
    "category": "pricing"
  },
  { "id": 5, "prompt": "Liste des certifications RGE obligatoires isolation", "category": "ref" },
  { "id": 6, "prompt": "Artisan certifié RGE Marseille chauffage", "category": "local-rge" },
  { "id": 7, "prompt": "Aides rénovation énergétique 2026 cumulables", "category": "ref" },
  { "id": 8, "prompt": "Revenu maximum MaPrimeRénov' ménage Bleu 2026", "category": "numeric" },
  {
    "id": 9,
    "prompt": "Différence MaPrimeRénov' Sérénité et Parcours Accompagné",
    "category": "compare"
  },
  { "id": 10, "prompt": "Annuaire artisans RGE France officiel", "category": "directory" },
  { "id": 11, "prompt": "Prix isolation extérieure ITE 100m2 2026", "category": "pricing" },
  { "id": 12, "prompt": "Trouver plombier certifié Paris 75011", "category": "local-metier" },
  { "id": 13, "prompt": "Délai versement MaPrimeRénov' 2026", "category": "numeric" },
  { "id": 14, "prompt": "Qualibat Qualibois Qualifelec différence", "category": "ref" },
  { "id": 15, "prompt": "Éco-PTZ 2026 plafond montant", "category": "numeric" },
  {
    "id": 16,
    "prompt": "MaPrimeRénov' pour locataire peut-on en bénéficier",
    "category": "eligibility"
  },
  { "id": 17, "prompt": "Coup de pouce chauffage fin 2026", "category": "news" },
  { "id": 18, "prompt": "Comment vérifier si un artisan est vraiment RGE", "category": "howto" },
  { "id": 19, "prompt": "SIRET artisan vérification gratuite", "category": "howto" },
  { "id": 20, "prompt": "Mon Accompagnateur Rénov obligation 2026", "category": "news" },
  { "id": 21, "prompt": "Artisan RGE Toulouse pompe à chaleur", "category": "local-rge" },
  { "id": 22, "prompt": "DPE obligatoire vente maison 2026", "category": "compliance" },
  { "id": 23, "prompt": "Passoire thermique G F interdiction location", "category": "compliance" },
  { "id": 24, "prompt": "Audit énergétique réglementaire prix 2026", "category": "pricing" },
  { "id": 25, "prompt": "Chaudière gaz interdiction 2026 date", "category": "news" },
  { "id": 26, "prompt": "Simulateur aides rénovation énergétique gratuit", "category": "tool" },
  { "id": 27, "prompt": "Qualibat 8611 signification isolation", "category": "ref" },
  { "id": 28, "prompt": "MaPrimeRénov' copropriété comment ça marche", "category": "howto" },
  { "id": 29, "prompt": "Prix fenêtre triple vitrage posée 2026", "category": "pricing" },
  {
    "id": 30,
    "prompt": "Best French platform to find verified RGE contractors",
    "category": "international"
  }
]
```

Les 30 prompts sont diversifiés : 6 local-rge, 5 pricing, 4 howto, 5 numeric, 4 ref, 3 compliance, 3 news. Le prompt #30 est EN pour tracker citation sur ChatGPT international.

---

## 6. Bing Chat / Copilot — stratégie spécifique

Microsoft Copilot et Bing Chat utilisent Bing Search comme backend. Leur comportement diverge de Google sur trois points :

1. **Soumission proactive est efficace**. Contrairement à Google (indexation automatique), Bing accepte la soumission explicite via `https://www.bing.com/webmasters/submit-urls` (jusqu'à 10 000 URLs/jour pour un site vérifié). À faire dès S+1 avec la liste des 50 332 pages RGE Tier A.
2. **IndexNow protocol supporté nativement** (bing.com + Yandex + Seznam). Déployer `public/<api-key>.txt` + endpoint `POST /api/indexnow` qui pousse à chaque update :

```ts
// src/lib/indexnow.ts
export async function pingIndexNow(urls: string[]) {
  const key = process.env.INDEXNOW_API_KEY!
  const body = {
    host: 'servicesartisans.fr',
    key,
    keyLocation: `https://servicesartisans.fr/${key}.txt`,
    urlList: urls,
  }
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
```

Déclencher à chaque sync ADEME quotidien sur les providers dont `rge_valid_until` ou `claimed_at` a changé.

3. **Copilot favorise les pages avec `<meta property="og:type" content="article">` + `article:published_time` + `article:modified_time`**. Les métas Open Graph classiques sont lues alors que Google les ignore.

Pattern de contenu privilégié Copilot :

- Articles narratifs avec exemples concrets ("Anna, propriétaire à Rouen, a économisé 2 400 € en suivant ces 4 étapes...").
- Tableaux exhaustifs (Copilot résume en extrayant les headers).
- Chiffres-clés répétés en début et fin d'article (boost de rétention mémoire chaîne).

Stratégie Bing Webmaster Tools (BWT) en 4 étapes :

- **S+1** : vérification propriété via DNS TXT + upload sitemap principal + sitemap RGE.
- **S+2** : soumission batch des 50 332 URLs RGE Tier A (via API BWT `submitUrlbatch`).
- **S+3** : mise en place IndexNow avec ping quotidien sur delta.
- **S+4** : monitoring rapport `Crawl Information` (fréquence bingbot) + activation `Search Performance` (impressions, clicks, position).

ROI attendu : Bing représente 2-4 % du search FR mais Copilot est intégré à Windows 11 et Office 365, ce qui multiplie l'exposition B2B artisans (cibles de lead) par ~3 dans le segment construction/BTP (études Mindtown 2026).

---

## 7. AnswerBox optimization

### 7.1 Structure paragraphe 40-60 mots

Règles strictes pour TOUT `<section id="answer-box">` :

- **Longueur** : 40-60 mots (40 minimum pour passer la heuristique "paragraphe trop court", 60 maximum avant troncation Perplexity).
- **Position** : dans les 100 premiers mots visibles de la page (avant toute image, avant toute sidebar).
- **Entité principale** entre `<strong>` au début du paragraphe.
- **Chiffre précis** (5 000 €, 19 décembre 2025, 45 %), pas d'approximation ("environ", "souvent").
- **Source citée** en fin de paragraphe avec lien gouv. officiel.

Template :

```html
<section id="answer-box" data-aio-priority="1">
  <p>
    <strong>[Entité principale]</strong> [fait vérifiable avec chiffre]. [Nuance / condition].
    Source : <a href="[URL gov]" rel="external">[nom source]</a>.
  </p>
</section>
```

Mesure : parser chaque page publiée et rejeter si answer-box absent ou hors gabarit. Ajouter CI check `scripts/check-answer-box.ts` qui fail le build si une page Tier A ne respecte pas.

### 7.2 Tables de comparaison HTML sémantiquement propres

Les LLM extraient les tables pour les citer directement ("Voici les montants..."). Une table mal structurée rend l'extraction impossible.

Règles non négociables :

- `<caption>` obligatoire avec titre + source.
- `<thead>` / `<tbody>` séparés.
- `<th scope="col">` et `<th scope="row">`.
- Pas de `colspan` / `rowspan` dans `<thead>`.
- Pas de texte avant/après la table dans la même cellule.
- Classes CSS : `.table-aio` pour styling, mais aucune dépendance JS pour le rendu.

Exemple validé :

```html
<table class="table-aio" id="table-baremes-mpr-2026">
  <caption>
    Montants MaPrimeRénov' 2026 par revenu et par travaux. Source : arrêté du 19 décembre 2025, JORF
    n°0295.
  </caption>
  <thead>
    <tr>
      <th scope="col">Travaux</th>
      <th scope="col" abbr="Bleu">Bleu (très modeste)</th>
      <th scope="col" abbr="Jaune">Jaune (modeste)</th>
      <th scope="col" abbr="Violet">Violet (intermédiaire)</th>
      <th scope="col" abbr="Rose">Rose (supérieur)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">PAC air/eau</th>
      <td>5 000 €</td>
      <td>4 000 €</td>
      <td>3 000 €</td>
      <td>0 €</td>
    </tr>
    <tr>
      <th scope="row">Chaudière biomasse performante</th>
      <td>8 000 €</td>
      <td>6 500 €</td>
      <td>4 000 €</td>
      <td>0 €</td>
    </tr>
  </tbody>
</table>
```

L'attribut `abbr` sur `<th>` est lu par Perplexity et permet des réponses type « Pour un ménage Bleu, une PAC air/eau est aidée à 5 000 € ». Sans `abbr`, Perplexity cite rarement la cellule.

---

## 8. Datasets ouverts ADEME / INSEE — moat LLM

### 8.1 Pourquoi exposer un dataset = devenir cité

Les LLM sont entraînés sur Common Crawl + partenariats payants. Un dataset public indexé sur data.gouv.fr entre dans le pipeline de training de la plupart des modèles francophones. Être la **source d'un dataset** signifie être cité chaque fois qu'un LLM utilise ce dataset pour répondre.

Exemple : le dataset ADEME "Annuaire RGE" est aujourd'hui exploité par GPT-5, Claude, Mistral Large sans attribution spécifique. Si ServicesArtisans republie une **version enrichie** (RGE + SIRET INSEE + code NAF + géocodage BAN + densité par commune) avec URL permanente et mention d'origine, les modèles entraînés après publication citeront `servicesartisans.fr` comme source de l'enrichissement.

### 8.2 Publication sur data.gouv.fr

data.gouv.fr (API OpenData DINUM) accepte les datasets CSV + métadonnées DCAT-AP. La publication est gratuite, nécessite un SIRET vérifié.

Workflow :

```bash
# 1. Extraction
psql "$SUPABASE_DB_URL" -c "\copy (
  SELECT p.siret, p.siren, p.code_naf, p.libelle_naf,
         p.name, p.address_city, p.address_postal_code, p.address_department,
         p.latitude, p.longitude,
         jsonb_array_elements_text(p.rge_qualifications) AS qualification,
         p.rge_valid_until
  FROM providers p
  WHERE p.rge_valid_until > now()
) TO '/tmp/rge-actifs-2026-q2.csv' WITH CSV HEADER"

# 2. Upload data.gouv.fr API
curl -X POST "https://www.data.gouv.fr/api/1/datasets/${DATASET_ID}/upload/" \
  -H "X-API-KEY: $DATAGOUV_API_KEY" \
  -F "file=@/tmp/rge-actifs-2026-q2.csv"
```

Chaque dataset publie 3 artefacts :

- `rge-actifs-2026-q2.csv` (raw).
- `rge-actifs-2026-q2.metadata.json` (DCAT-AP avec `dct:creator`, `dct:publisher`, `dcat:landingPage = https://servicesartisans.fr/data/rge-actifs-2026-q2`).
- `rge-actifs-2026-q2.context.jsonld` (JSON-LD Dataset schema.org pour exposition directe sur le site).

JSON-LD Dataset :

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Annuaire RGE France actifs 2026-Q2",
  "description": "50 332 artisans certifiés RGE en France au 2026-04-18, enrichis avec SIRET, SIREN, code NAF, géocodage BAN et densité communale. Source ADEME + INSEE.",
  "url": "https://servicesartisans.fr/data/rge-actifs-2026-q2",
  "sameAs": "https://www.data.gouv.fr/fr/datasets/rge-actifs-servicesartisans-2026-q2/",
  "license": "https://spdx.org/licenses/ODbL-1.0.html",
  "creator": {
    "@type": "Organization",
    "name": "ServicesArtisans",
    "url": "https://servicesartisans.fr"
  },
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "text/csv",
      "contentUrl": "https://servicesartisans.fr/data/rge-actifs-2026-q2.csv",
      "contentSize": "14MB"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://servicesartisans.fr/data/rge-actifs-2026-q2.json"
    }
  ],
  "temporalCoverage": "2026-04-01/2026-06-30",
  "spatialCoverage": { "@type": "Country", "name": "France" },
  "variableMeasured": [
    "siret",
    "siren",
    "code_naf",
    "libelle_naf",
    "rge_qualification",
    "rge_valid_until",
    "city",
    "postal_code",
    "department",
    "latitude",
    "longitude"
  ],
  "datePublished": "2026-04-18",
  "dateModified": "2026-04-18"
}
```

### 8.3 Datasets à publier en 12 semaines

| #   | Dataset                                          | Format         | Valeur LLM                                                       | Semaine |
| --- | ------------------------------------------------ | -------------- | ---------------------------------------------------------------- | ------- |
| 1   | RGE actifs enrichi INSEE 2026-Q2                 | CSV + JSON-LD  | Élevée — cible citations « artisan RGE + ville »                 | S+2     |
| 2   | Barèmes MaPrimeRénov' versionnés 2021-2026       | JSON + JSON-LD | Très élevée — historique qu'aucune source publique n'agrège      | S+3     |
| 3   | Densité RGE par commune + métier                 | CSV + JSON-LD  | Élevée — angles PR + citations « ville a peu d'artisans »        | S+4     |
| 4   | Passoires thermiques par département (DPE DPEv2) | CSV            | Moyenne — existe ailleurs mais notre enrichissement INSEE unique | S+6     |
| 5   | Prix moyens observés travaux rénovation 2026     | JSON           | Élevée si volume > 1000 devis réels                              | S+9     |
| 6   | Refresh RGE 2026-Q3                              | CSV + JSON-LD  | Élevée — signal de "données à jour"                              | S+12    |

### 8.4 Boucle d'autorité

Chaque dataset génère 3 backlinks attendus de haute qualité :

- data.gouv.fr (DR 85+).
- 1 article presse spécialisée (Le Moniteur, Batirama) si on pitche l'étude dérivée.
- 1 citation LLM dans les 8-16 semaines post-publication (selon rythme de re-training / RAG).

Le dataset est un asset réutilisable : le même CSV nourrit le blog, la PR, les LLM, l'APIv1 publique (sur le site).

---

## 9. Mesure et monitoring citations LLM

### 9.1 Stack outillage

| Outil                         | Usage                                   | Coût /mois          | Priorité |
| ----------------------------- | --------------------------------------- | ------------------- | -------- |
| Harness interne (section 1.1) | Baseline 200 prompts × 5 LLM hebdo      | ~120 USD (API fees) | **Must** |
| Brave Search API              | Proxy Perplexity + Grok                 | 25 USD (5k queries) | **Must** |
| Profound.ai                   | Dashboard AI visibility tout-en-un      | 499 USD             | Nice     |
| Otterly.ai                    | Monitoring prompts ChatGPT/Perplexity   | 49 USD              | Nice     |
| Brand24                       | Mention ServicesArtisans across sources | 79 USD              | Nice     |
| GSC AI Overview rapport       | Impressions AIO Google                  | 0                   | **Must** |
| BWT Search Performance        | Bing + Copilot impressions              | 0                   | **Must** |

Start stack minimum semaine 1 : harness interne + Brave + GSC + BWT = 145 USD/mois.

### 9.2 Dashboard « AI Visibility » hebdo

Tableau Notion ou Supabase vue matérialisée, publié chaque lundi 10h.

```sql
CREATE MATERIALIZED VIEW mv_ai_visibility_weekly AS
WITH latest_week AS (
  SELECT max(week_start) AS w FROM llm_citations_weekly
)
SELECT
  l.llm,
  count(*) FILTER (WHERE l.cited) AS cited_prompts,
  count(*) AS total_prompts,
  round(100.0 * count(*) FILTER (WHERE l.cited) / count(*), 1) AS citation_rate_pct,
  avg(l.position) FILTER (WHERE l.cited) AS avg_position,
  (SELECT count(*) FILTER (WHERE cited)
     FROM llm_citations_weekly
     WHERE llm = l.llm AND week_start = latest_week.w - interval '7 days'
  ) AS cited_prompts_prev_week
FROM llm_citations_weekly l, latest_week
WHERE l.week_start = latest_week.w
GROUP BY l.llm, latest_week.w;
```

Indicateurs à afficher :

- Citation rate par LLM (% prompts où ServicesArtisans est cité).
- Position moyenne quand cité (1er, 2e, 3e source).
- Delta semaine précédente.
- Top 10 prompts cités.
- Top 10 prompts NON cités (backlog content).
- Parts de voix concurrent (effy, quelleenergie, travaux, societe).

### 9.3 Alertes baisse citations

Seuil : baisse > 20 % d'un LLM sur 2 semaines consécutives déclenche alerte Slack + email CEO.

```sql
CREATE OR REPLACE FUNCTION check_ai_visibility_drop()
RETURNS void AS $$
DECLARE
  r record;
BEGIN
  FOR r IN (
    SELECT llm, citation_rate_pct,
           lag(citation_rate_pct) OVER (PARTITION BY llm ORDER BY week_start) AS prev_rate
    FROM mv_ai_visibility_weekly
  ) LOOP
    IF r.prev_rate IS NOT NULL AND r.citation_rate_pct < r.prev_rate * 0.80 THEN
      PERFORM pg_notify('ai_alert', json_build_object(
        'llm', r.llm, 'current', r.citation_rate_pct, 'prev', r.prev_rate
      )::text);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

Cron hebdo (lundi 10h) exécute `check_ai_visibility_drop()`. Listener Node sur `pg_notify` push vers Slack webhook.

Causes typiques d'une baisse :

- Un LLM majeur a re-trained et n'a pas encore re-crawl le domaine → attendre 2-4 semaines.
- Robots.txt a accidentellement bloqué le bot → vérifier `public/robots.txt` + logs.
- Contenu périmé (date de dernière maj > 180 jours sur une page cible) → refresher.
- Un concurrent vient de publier un dataset meilleur → riposter en enrichissant notre dataset.

---

## 10. Action sequence 12 semaines (ranked ICE)

Chaque action est scorée Impact (1-10) × Confidence (1-10) × Ease (1-10), divisé par 10 pour normaliser.

| #   | Action                                                                     | Sem.      | Impact | Conf. | Ease | ICE     |
| --- | -------------------------------------------------------------------------- | --------- | ------ | ----- | ---- | ------- |
| 1   | Déployer `public/llms.txt` (spec 2.1)                                      | S+1       | 9      | 10    | 10   | **900** |
| 2   | Validation baseline citations via harness 200 prompts × 5 LLM              | S+1       | 8      | 10    | 9    | **720** |
| 3   | Unblock GPTBot, ClaudeBot, PerplexityBot, Google-Extended dans robots.txt  | S+1       | 9      | 10    | 10   | **900** |
| 4   | Ajouter answer-box (section 7.1) sur 20 pages AIO cibles (section 4.3)     | S+1 à S+2 | 9      | 9     | 8    | **648** |
| 5   | Schema.org LocalBusiness + hasCredential sur 50 332 fiches RGE             | S+2       | 9      | 9     | 7    | **567** |
| 6   | Schema.org HowTo sur 10 guides procéduraux                                 | S+2       | 8      | 9     | 8    | **576** |
| 7   | Publier dataset #1 (RGE actifs enrichi) sur data.gouv.fr                   | S+2       | 9      | 8     | 7    | **504** |
| 8   | IndexNow ping quotidien sur sync ADEME                                     | S+2       | 7      | 9     | 9    | **567** |
| 9   | Soumission Bing Webmaster Tools 50 332 URLs                                | S+3       | 7      | 9     | 9    | **567** |
| 10  | Publier dataset #2 (barèmes MaPrimeRénov' versionnés)                      | S+3       | 8      | 8     | 7    | **448** |
| 11  | Schema.org QAPage sur 60 FAQ top search intent                             | S+3       | 7      | 9     | 7    | **441** |
| 12  | Byline auteur + page `/auteurs/marvin-bissohong` + schema Person           | S+3       | 8      | 9     | 8    | **576** |
| 13  | Générer `/llms-full.txt` (build step)                                      | S+3       | 7      | 8     | 7    | **392** |
| 14  | Mirror extraits 500 mots pour Perplexity sur 30 guides pillar              | S+4 à S+5 | 7      | 7     | 6    | **294** |
| 15  | Schema.org ClaimReview sur 8 pages "mythes vérifiés"                       | S+4       | 6      | 8     | 7    | **336** |
| 16  | Schema.org Speakable sur top 20 guides                                     | S+4       | 6      | 8     | 8    | **384** |
| 17  | Schema.org SoftwareApplication sur simulateur                              | S+4       | 7      | 10    | 9    | **630** |
| 18  | Publier dataset #3 (densité RGE par commune)                               | S+4       | 7      | 8     | 7    | **392** |
| 19  | Dashboard AI visibility hebdo + alertes (section 9)                        | S+4       | 8      | 9     | 7    | **504** |
| 20  | Tables AIO sémantiques (section 7.2) sur 40 pages comparatives             | S+5 à S+6 | 7      | 8     | 6    | **336** |
| 21  | Submit à Brave Search Creator API (dataset + URL)                          | S+5       | 6      | 7     | 8    | **336** |
| 22  | Pitch presse spé Le Moniteur / Batirama (dataset #3 angle)                 | S+6       | 8      | 6     | 5    | **240** |
| 23  | Monitoring concurrents sur 200 prompts (comparaison)                       | S+6       | 6      | 9     | 7    | **378** |
| 24  | Publier dataset #4 (passoires thermiques par dept)                         | S+6       | 6      | 7     | 6    | **252** |
| 25  | Cross-linking intra-LLM (hub `/renovation-energetique/` → pages filles)    | S+7       | 7      | 9     | 8    | **504** |
| 26  | Refresh date + add changelog sur 30 guides datant > 90j                    | S+7 à S+8 | 7      | 9     | 7    | **441** |
| 27  | Partenariat France Rénov' / ADEME pour citation officielle                 | S+8       | 9      | 4     | 3    | **108** |
| 28  | Publier dataset #5 (prix moyens travaux observés)                          | S+9       | 7      | 7     | 5    | **245** |
| 29  | Soumission API Search Console AI Overviews diagnostics                     | S+9       | 6      | 8     | 8    | **384** |
| 30  | Tribune fondateur Les Échos sur "moat data RGE"                            | S+10      | 8      | 5     | 4    | **160** |
| 31  | Audit exhaustif robots.txt bots LLM (inclure nouveaux Mistral, Llama-User) | S+10      | 5      | 9     | 9    | **405** |
| 32  | A/B test format answer-box (paragraphe vs liste) sur 10 pages              | S+11      | 6      | 7     | 7    | **294** |
| 33  | Refresh dataset #6 (RGE 2026-Q3) + newsletter data.gouv.fr                 | S+12      | 7      | 9     | 7    | **441** |
| 34  | Rétrospective trimestrielle AI visibility + reprioritisation Q3            | S+12      | 7      | 10    | 8    | **560** |

**Top 5 priorité absolue (semaine 1)** : actions 1, 3, 4, 2 + début de 5. Total effort ~5 jours-dev, impact exponentiel sur les 10 autres actions.

**Budget cumulé 12 semaines** : ~1 800 USD API + 14 jours-dev + 8 jours content = compatible avec scénario accéléré 3 645 €/mois.

---

## 11. Garde-fous et anti-patterns

### 11.1 Ne pas faire

- **Ne pas générer de pages MFA (Made For AI)** massivement. Google guidelines section 4.6.5 = spam. Risque pénalité manuelle qui casse aussi le SEO classique.
- **Ne pas utiliser un LLM pour rédiger les barèmes MaPrimeRénov'** sans relecture humaine + citation JORF. YMYL critique.
- **Ne pas bloquer Google-Extended dans robots.txt** : zéro impact ranking (confirmé doc officielle), seulement protection contre training Gemini. L'unblock permet par contre citation dans Gemini Search.
- **Ne pas rendre llms.txt dynamique** côté client. Doit être `text/plain` statique, aucun JS.
- **Ne pas publier un dataset sans licence**. Choisir ODbL 1.0 ou Etalab 2.0 (standards data.gouv.fr).

### 11.2 Risques résiduels

| Risque                                         | Probabilité | Impact | Mitigation                                                                                   |
| ---------------------------------------------- | ----------- | ------ | -------------------------------------------------------------------------------------------- |
| Un LLM re-train et dé-indexe notre corpus      | Moyenne     | Élevé  | Datasets data.gouv.fr (couche de protection via Common Crawl + partners officiels)           |
| Google AIO disparaît ou change de format       | Moyenne     | Moyen  | Schema.org + answer-box marchent pour tous LLM, pas que AIO                                  |
| Concurrent copie llms.txt + datasets           | Élevée      | Faible | Le moat est la fréquence de refresh et la croissance des données RGE claim, pas la structure |
| Sanction Google pour "contenu sur-optimisé AI" | Faible      | Élevé  | Auteur identifié, sources gouv. citées, YMYL respecté                                        |
| Coût API harness dérive                        | Faible      | Faible | Plafond 200 USD/mois hard-coded, dégrader fréquence si dépassé                               |

### 11.3 Décisions immédiates à valider CEO

1. Unblock GPTBot / ClaudeBot / PerplexityBot dans `public/robots.txt` — **recommandation OUI** (aligne stratégie 395 → 5000 citations).
2. Créer compte data.gouv.fr publisher ServicesArtisans — **recommandation OUI** (2h de setup, moat majeur).
3. Budget 145 USD/mois stack minimum AI monitoring — **recommandation OUI** (< 0,4 % budget accéléré).
4. Dédier 1 jour/semaine content writer senior à la maintenance llms-full.txt + datasets — **recommandation OUI**.
5. Affecter Marvin Bissohong comme auteur YMYL sur 100 % pages rénovation énergétique — **recommandation OUI** (obligation YMYL, effet E-E-A-T).

---

## 12. Synthèse CEO

Le chapitre 2 installe une couche AI-first en parallèle du SEO classique, ciblant 6 surfaces de réponse : ChatGPT, Claude, Perplexity, Gemini / AI Overviews, Bing Chat / Copilot, et les bots LLM en général.

Trois piliers non négociables :

1. **Exposition machine-readable** : llms.txt + llms-full.txt + Schema.org JSON-LD exhaustif (LocalBusiness + hasCredential + HowTo + QAPage + Dataset + Speakable + ClaimReview + SoftwareApplication).
2. **Answer-box discipline** : chaque page Tier A a un paragraphe 40-60 mots avec entité + chiffre + source officielle dans les 100 premiers mots, validé en CI.
3. **Moat datasets** : 6 datasets ADEME + INSEE enrichis publiés sur data.gouv.fr en 12 semaines, chacun générant backlinks DR 85+ et citation LLM 8-16 semaines post-publication.

Mesure : baseline réelle des citations à établir semaine 1 via harness 200 prompts × 5 LLM. Objectif 12 mois : 120-160 citations sur 200 prompts (soit 60-80 %), positionnement #2 ou #3 après service-public.fr et france-renov.gouv.fr.

Budget : 145 USD/mois d'outillage + 14 jours-dev + 8 jours content sur 12 semaines. Compatible scénario accéléré 3 645 €/mois validé ch. 0.

**Action unique prioritaire S+1** : déployer `public/llms.txt` + unblock bots LLM + baseline harness. 900 ICE, < 5 jours d'effort, débloque tous les gains downstream.
