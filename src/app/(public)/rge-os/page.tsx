/**
 * @kw-primary registre rge / api rge ademe
 * @kw-volume positionnement marque — KW long-tail vol < 100/mo
 * @kw-kd low
 * @kw-cpc n/a
 * @kw-intent informational + developer-acquisition
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @ahrefs-date 2026-05-04
 * @notes Page positionnement marque "RGE-OS". Hub discoverability vers
 *   /developpeurs/api-catalog (Ralph 33), /api-explorer (Ralph 36),
 *   /schema-explorer (Ralph 38), /asyncapi-explorer (Ralph 41), /try
 *   (Ralph 40). Source données : ADEME via data.gouv.fr (Etalab 2.0),
 *   enrichissement SA exposé en CC-BY 4.0. KW vol faible volontairement —
 *   l'objectif est PR/HN/data.gouv referrals, pas search organic volume.
 */
import type { Metadata } from 'next'
import Link from 'next/link'

import { getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { safeJsonStringify } from '@/lib/seo/safe-json'

const PAGE_PATH = '/rge-os'
const PAGE_TITLE = 'RGE-OS — Première API publique ouverte du registre RGE ADEME'
const PAGE_DESCRIPTION =
  'RGE-OS expose le registre national RGE ADEME via une API publique CC-BY 4.0 : artisans certifiés normalisés, 14 endpoints (REST, GraphQL, SPARQL, MCP, Webhooks), SDK TypeScript et Python, spécifications OpenAPI 3.1 et AsyncAPI 3.0.0. Conformité Etalab 2.0.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    type: 'website',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `https://servicesartisans.fr${PAGE_PATH}`,
    siteName: 'ServicesArtisans',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
}

export const dynamic = 'force-static'
export const revalidate = 3600

type Pillar = { id: number; name: string; short: string }

const PILLARS: ReadonlyArray<Pillar> = [
  {
    id: 1,
    name: 'Knowledge Graph SPARQL',
    short: 'Endpoint SPARQL 1.1 sur le graphe RDF du registre RGE.',
  },
  {
    id: 2,
    name: 'GraphQL-as-RPC',
    short: 'GraphQL endpoint pour requêtes typées et économes en bande passante.',
  },
  { id: 3, name: 'SDK TypeScript', short: 'Client TypeScript zero-dépendance, packagé pour npm.' },
  { id: 4, name: 'MCP Server', short: 'Model Context Protocol JSON-RPC 2.0 pour agents IA.' },
  {
    id: 5,
    name: 'OpenAPI 3.1 Spec',
    short: 'Spécification machine-lisible + 5 explorers HTML browsables.',
  },
  { id: 6, name: 'HuggingFace Dataset', short: 'Dataset versionné publié sous licence CC-BY 4.0.' },
  {
    id: 7,
    name: 'Benchmarks publics',
    short: 'Métriques de couverture et fraîcheur publiées régulièrement.',
  },
  {
    id: 8,
    name: 'Webhooks signés HMAC',
    short: 'Subscribe / unsubscribe + signature HMAC-SHA256 + fenêtre anti-replay 5 min.',
  },
  {
    id: 9,
    name: 'CLI sa-rge-os',
    short: 'Outil ligne de commande zero-dépendance pour scripting.',
  },
  {
    id: 10,
    name: 'Widget Embed',
    short: 'Composant JavaScript embeddable pour sites partenaires.',
  },
  {
    id: 11,
    name: 'LLM stores submission',
    short: 'Soumission proactive auprès des éditeurs LLM (HuggingFace, Anthropic, Mistral).',
  },
  {
    id: 12,
    name: 'Wikidata sync',
    short: 'Synchronisation Wikidata avec items et propriétés ouvertes.',
  },
  {
    id: 13,
    name: 'Wikipedia citations',
    short: 'Articles cités via API REST + structure JSON-LD.',
  },
  {
    id: 14,
    name: 'Transparence IA',
    short: 'Page /transparence-ia + audit RGPD AI Act + provenance traçable.',
  },
] as const

type UseCase = { audience: string; description: string }

const USE_CASES: ReadonlyArray<UseCase> = [
  {
    audience: 'Mairies et collectivités',
    description:
      "Vérifier l'éligibilité RGE d'un artisan avant attribution d'un marché public ou d'un appel d'offres dématérialisé.",
  },
  {
    audience: 'CRM bâtiment et SaaS B2B',
    description:
      'Enrichir les fiches partenaires avec les qualifications RGE temps réel sans scraping fragile.',
  },
  {
    audience: 'Comparateurs énergétiques',
    description:
      'Filtrer les artisans par qualification précise (Qualibat 5911, Qualifelec IRVE, RGE Solaire) et par zone géographique INSEE.',
  },
  {
    audience: 'Plateformes mandataire CEE',
    description:
      'Auto-valider le statut RGE des installateurs avant dépôt de dossier auprès des obligés (Sonergia, Hellio, Total).',
  },
  {
    audience: 'Chercheurs et data scientists',
    description:
      'Datasets CC-BY 4.0 pour études sur la transition énergétique, la rénovation des passoires thermiques, la couverture territoriale.',
  },
  {
    audience: 'Agents IA et assistants conversationnels',
    description:
      'MCP server natif pour Claude, ChatGPT, Mistral et autres LLMs. Réponses sourcées, citations vérifiables.',
  },
] as const

type Faq = { q: string; a: string }

const FAQS: ReadonlyArray<Faq> = [
  {
    q: 'Quelle est la source des données ?',
    a: "Registre national RGE de l'ADEME, accessible sur data.gouv.fr sous licence Etalab 2.0. RGE-OS enrichit, normalise, indexe et expose ces données via API publique sous licence CC-BY 4.0. Aucune donnée propriétaire injectée.",
  },
  {
    q: "L'API est-elle gratuite ?",
    a: 'Les endpoints publics (rge/lookup, rge/search, aides/*) sont gratuits, sans authentification. Rate-limit 60 requêtes par minute et par IP par défaut. Un tier dédié pour les intégrateurs à fort volume est disponible sur demande à data@servicesartisans.fr.',
  },
  {
    q: 'Comment citer les données ?',
    a: 'Mention obligatoire « Source : ADEME — Registre national RGE, agrégé par ServicesArtisans » et lien vers /rge-os. Conformément à la licence CC-BY 4.0 et à la licence Etalab 2.0 amont.',
  },
  {
    q: 'Quelle fraîcheur des données ?',
    a: "Synchronisation hebdomadaire automatique depuis l'ADEME. Snapshot daté visible sur la page /barometre/rge. Cron critique sous monitoring Sentry.",
  },
  {
    q: 'Quels formats sont supportés ?',
    a: 'JSON (REST + GraphQL), RDF/Turtle et JSON-LD (SPARQL + ontologie OWL), Server-Sent Events (streaming), HTML (widget embed). Spec OpenAPI 3.1 et AsyncAPI 3.0.0 disponibles en JSON et YAML.',
  },
  {
    q: 'Le code est-il open source ?',
    a: "Les SDKs TypeScript et Python sont publiés en licence MIT. Les spécifications OpenAPI 3.1, AsyncAPI 3.0.0 et l'ontologie OWL sont sous licence CC-BY 4.0. Le code serveur Next.js reste propriétaire.",
  },
] as const

export default function RgeOsPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Accueil', url: 'https://servicesartisans.fr/' },
    { name: 'RGE-OS', url: `https://servicesartisans.fr${PAGE_PATH}` },
  ])

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'RGE-OS — Registre national RGE enrichi',
    description:
      "Dataset agrégé du registre national RGE de l'ADEME, enrichi par ServicesArtisans (normalisation des qualifications, indexation géographique INSEE, validité des qualifications). Exposé via API publique 14 endpoints sous licence CC-BY 4.0.",
    url: `https://servicesartisans.fr${PAGE_PATH}`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://servicesartisans.fr/api/v1/rge/search',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/sparql-results+json',
        contentUrl: 'https://servicesartisans.fr/api/v1/kg/sparql',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://servicesartisans.fr/api/v1/openapi/json',
      },
    ],
    sourceOrganization: {
      '@type': 'Organization',
      name: 'ADEME — Agence de la transition écologique',
      url: 'https://data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/',
    },
    keywords: ['RGE', 'rénovation énergétique', 'open data', 'ADEME', 'CC-BY 4.0', 'API publique'],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RGE-OS',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    url: `https://servicesartisans.fr${PAGE_PATH}`,
    sameAs: [
      'https://servicesartisans.fr/developpeurs/api-catalog',
      'https://servicesartisans.fr/api/v1/openapi/json',
      'https://servicesartisans.fr/api/v1/asyncapi/json',
    ],
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `https://servicesartisans.fr${PAGE_PATH}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr',
    },
    hasPart: PILLARS.map((p) => ({
      '@type': 'TechArticle',
      name: p.name,
      description: p.short,
      position: p.id,
    })),
  }

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(collectionSchema) }}
      />

      <nav
        aria-label="Fil d'Ariane"
        className="mx-auto max-w-6xl px-4 pt-4 text-sm text-charcoal-600 sm:px-6"
      >
        <Link href="/" className="hover:underline">
          Accueil
        </Link>
        {' / '}
        <span aria-current="page">RGE-OS</span>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-700">
          RGE-OS — version 1.0
        </p>
        <h1 className="mt-2 text-4xl font-bold text-charcoal-900 sm:text-5xl">
          Première API publique ouverte du registre national RGE ADEME
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-charcoal-700">
          Artisans certifiés RGE normalisés. 14 endpoints REST, GraphQL, SPARQL, MCP, Webhooks. SDK
          TypeScript et Python. Spécifications OpenAPI 3.1 et AsyncAPI 3.0.0. Licence CC-BY 4.0.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/developpeurs/api-catalog"
            className="rounded bg-accent-600 px-4 py-2 text-sm font-medium text-white"
          >
            Catalogue API
          </Link>
          <Link
            href="/developpeurs/try"
            className="rounded border border-charcoal-300 bg-white px-4 py-2 text-sm font-medium text-charcoal-900"
          >
            Essayer maintenant
          </Link>
          <Link
            href="/api/v1/openapi/json"
            className="rounded border border-charcoal-300 bg-white px-4 py-2 text-sm font-medium text-charcoal-900"
          >
            OpenAPI 3.1
          </Link>
        </div>
        <p className="mt-4 text-xs text-charcoal-500">
          Source : Registre national RGE ADEME (data.gouv.fr) sous licence Etalab 2.0 ;
          enrichissement ServicesArtisans publié en CC-BY 4.0.
        </p>
      </section>

      <section aria-labelledby="pillars" className="border-t border-charcoal-200 bg-charcoal-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 id="pillars" className="text-3xl font-bold text-charcoal-900">
            14 piliers RGE-OS
          </h2>
          <p className="mt-2 max-w-3xl text-base text-charcoal-700">
            Couverture verticale complète, du graphe de connaissance RDF à la signature HMAC des
            webhooks, en passant par Model Context Protocol pour les agents IA et l&apos;embed
            JavaScript pour les sites partenaires.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.id} className="rounded-lg border border-charcoal-200 bg-white p-4">
                <p className="font-mono text-xs text-charcoal-500">
                  Pilier {p.id.toString().padStart(2, '0')}
                </p>
                <h3 className="mt-1 text-base font-semibold text-charcoal-900">{p.name}</h3>
                <p className="mt-1 text-sm text-charcoal-700">{p.short}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="use-cases" className="border-t border-charcoal-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 id="use-cases" className="text-3xl font-bold text-charcoal-900">
            Pour qui
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {USE_CASES.map((u) => (
              <li key={u.audience} className="rounded-lg border border-charcoal-200 p-4">
                <h3 className="text-base font-semibold text-charcoal-900">{u.audience}</h3>
                <p className="mt-1 text-sm text-charcoal-700">{u.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="quickstart" className="border-t border-charcoal-200 bg-charcoal-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 id="quickstart" className="text-3xl font-bold text-charcoal-900">
            Démarrer en trente secondes
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal-600">
                curl
              </h3>
              <pre className="mt-2 overflow-x-auto rounded bg-charcoal-900 p-3 font-mono text-xs text-white">
                {`curl 'https://servicesartisans.fr/api/v1/rge/search?qualification=qualibat-5911&department=75'`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal-600">
                TypeScript
              </h3>
              <pre className="mt-2 overflow-x-auto rounded bg-charcoal-900 p-3 font-mono text-xs text-white">
                {`import { Client } from '@servicesartisans/sa-rge-sdk'
const sa = new Client()
const r = await sa.rgeSearch({ qualification: 'qualibat-5911', department: '75' })`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal-600">
                Python
              </h3>
              <pre className="mt-2 overflow-x-auto rounded bg-charcoal-900 p-3 font-mono text-xs text-white">
                {`from sa_rge_sdk import Client
sa = Client()
r = sa.rge_search(qualification='qualibat-5911', department='75')`}
              </pre>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/developpeurs/api-explorer" className="text-sm text-accent-700 underline">
              Explorer chaque endpoint
            </Link>
            <Link
              href="/developpeurs/schema-explorer"
              className="text-sm text-accent-700 underline"
            >
              Voir les schemas
            </Link>
            <Link
              href="/developpeurs/asyncapi-explorer"
              className="text-sm text-accent-700 underline"
            >
              Webhooks AsyncAPI
            </Link>
            <Link href="/developpeurs/api-catalog" className="text-sm text-accent-700 underline">
              Catalogue complet
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-charcoal-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 id="faq" className="text-3xl font-bold text-charcoal-900">
            Questions fréquentes
          </h2>
          <dl className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-lg border border-charcoal-200 p-4">
                <dt className="text-base font-semibold text-charcoal-900">{f.q}</dt>
                <dd className="mt-2 text-sm text-charcoal-700">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-charcoal-200 bg-charcoal-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-sm text-charcoal-600">
            Maintenu par <strong>ServicesArtisans</strong> — Marvin Bissohong, fondateur tech.
            Dernière mise à jour : 2026-05-21.
          </p>
          <p className="mt-2 text-xs text-charcoal-500">
            Contact intégrateur :{' '}
            <a href="mailto:data@servicesartisans.fr" className="text-accent-700 underline">
              data@servicesartisans.fr
            </a>
            . Issues et roadmap publics.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/developpeurs"
              className="rounded bg-accent-600 px-4 py-2 text-sm font-medium text-white"
            >
              Espace développeurs
            </Link>
            <Link
              href="/transparence-ia"
              className="rounded border border-charcoal-300 bg-white px-4 py-2 text-sm font-medium text-charcoal-900"
            >
              Transparence IA
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
