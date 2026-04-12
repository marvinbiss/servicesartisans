import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Breadcrumb from '@/components/Breadcrumb'
import ProviderList from '@/components/ProviderList'
import { getServiceBySlug, getLocationBySlug } from '@/lib/supabase'
import { villes as staticVilles } from '@/lib/data/france'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getItemListSchema } from '@/lib/seo/jsonld'
import { getArtisanUrl } from '@/lib/utils'
import {
  getRgeProvidersByServiceAndCity,
  isRgeAllowedService,
  RGE_QUALIFICATION_LABELS,
} from '@/lib/rge/service-city-listings'
import { getRgeServiceStats } from '@/lib/rge/guide-stats'
import {
  buildServiceCityParagraphs,
  buildServiceCityFaq,
  buildFaqJsonLd,
} from '@/lib/rge/pseo-content'
import { getVilleBySlug } from '@/lib/data/france'

// ISR : revalidation quotidienne (comme les autres routes pSEO géo)
export const revalidate = 86400
export const dynamicParams = true

// Slug guard (comme services/[service]/[location])
const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/

// Top 8 services énergétiques pré-rendus (subset de l'allowlist) × top 20 villes
// = 160 pages statiques au build ; le reste passe par ISR on-demand.
const PRERENDER_SERVICES: string[] = [
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'chauffagiste',
  'electricien',
  'renovation-energetique',
  'menuisier',
  'couvreur',
]
const PRERENDER_CITIES_COUNT = 20

export function generateStaticParams() {
  const topCities = staticVilles.slice(0, PRERENDER_CITIES_COUNT)
  return PRERENDER_SERVICES.flatMap((service) => topCities.map((v) => ({ service, ville: v.slug })))
}

interface PageProps {
  params: Promise<{ service: string; ville: string }>
}

/** Tronque un title à ~60 chars pour Google */
function truncateTitle(title: string, maxLen = 60): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

/** Contenu de l'intro métier-spécifique (100-150 mots) */
function buildIntroParagraph(serviceName: string, villeName: string, serviceSlug: string): string {
  const qualif = RGE_QUALIFICATION_LABELS[serviceSlug]
  const labelPart = qualif
    ? `Les artisans ${serviceName.toLowerCase()} certifi\u00e9s RGE \u00e0 ${villeName} d\u00e9tiennent le label ${qualif.label} (d\u00e9livr\u00e9 par ${qualif.organisme}), garantissant leur comp\u00e9tence pour ${qualif.specifics}.`
    : `Les artisans ${serviceName.toLowerCase()} certifi\u00e9s RGE (Reconnu Garant de l\u2019Environnement) \u00e0 ${villeName} r\u00e9pondent aux crit\u00e8res officiels d\u2019\u00e9co-conditionnalit\u00e9 fix\u00e9s par l\u2019\u00c9tat.`
  return `${labelPart} Cette certification est indispensable pour b\u00e9n\u00e9ficier des aides publiques \u00e0 la r\u00e9novation \u00e9nerg\u00e9tique : MaPrimeR\u00e9nov\u2019, Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie (CEE), \u00e9co-pr\u00eat \u00e0 taux z\u00e9ro et TVA r\u00e9duite \u00e0 5,5 %. Sans artisan RGE, aucune de ces aides n\u2019est mobilisable. Tous les professionnels list\u00e9s ci-dessous \u00e0 ${villeName} ont une qualification v\u00e9rifi\u00e9e et toujours active, sourc\u00e9e directement depuis le registre officiel ADEME / France R\u00e9nov\u2019.`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, ville: villeSlug } = await params

  if (!VALID_SLUG.test(serviceSlug) || !VALID_SLUG.test(villeSlug)) {
    notFound()
  }
  if (!isRgeAllowedService(serviceSlug)) {
    notFound()
  }

  const [service, location] = await Promise.all([
    getServiceBySlug(serviceSlug).catch(() => null),
    getLocationBySlug(villeSlug),
  ])
  if (!location) notFound()

  const serviceName = service?.name || serviceSlug
  const villeName = location.name

  // Count RGE providers to decide noindex
  const { count } = await getRgeProvidersByServiceAndCity(serviceSlug, villeSlug, { limit: 1 })
  const isNoindex = count === 0

  const rawTitle = `${serviceName} RGE \u00e0 ${villeName} \u2014 Certifi\u00e9 MaPrimeR\u00e9nov\u2019`
  const title = truncateTitle(rawTitle)

  const description = truncateTitle(
    `Artisans ${serviceName.toLowerCase()} certifi\u00e9s RGE \u00e0 ${villeName}. \u00c9ligibles MaPrimeR\u00e9nov\u2019, CEE et TVA 5,5 %. Qualifications v\u00e9rifi\u00e9es ADEME \u00e0 jour.`,
    158
  )

  const path = `/rge/${serviceSlug}/${villeSlug}`

  return {
    title,
    description,
    robots: isNoindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          'max-snippet': -1 as const,
          'max-image-preview': 'large' as const,
          'max-video-preview': -1 as const,
        },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_FR',
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: getAlternates(path),
  }
}

export default async function RgeServiceCityPage({ params }: PageProps) {
  const { service: serviceSlug, ville: villeSlug } = await params

  if (!VALID_SLUG.test(serviceSlug) || !VALID_SLUG.test(villeSlug)) {
    notFound()
  }
  if (!isRgeAllowedService(serviceSlug)) {
    notFound()
  }

  const [service, location] = await Promise.all([
    getServiceBySlug(serviceSlug).catch(() => null),
    getLocationBySlug(villeSlug),
  ])
  if (!location) notFound()

  const serviceName = service?.name || serviceSlug
  const villeName = location.name

  const { providers, count } = await getRgeProvidersByServiceAndCity(serviceSlug, villeSlug, {
    limit: 50,
  })

  const path = `/rge/${serviceSlug}/${villeSlug}`
  const pageUrl = `${SITE_URL}${path}`

  // JSON-LD BreadcrumbList
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: serviceName, url: `/rge/${serviceSlug}` },
    { name: villeName, url: path },
  ])

  // JSON-LD ItemList (top 10 providers pour éviter un payload lourd)
  const itemListSchema = getItemListSchema({
    name: `${serviceName} RGE \u00e0 ${villeName}`,
    description: `Artisans ${serviceName.toLowerCase()} certifi\u00e9s RGE \u00e0 ${villeName}`,
    url: path,
    items: providers.slice(0, 10).map((p, idx) => ({
      name: p.name,
      url: getArtisanUrl(p),
      position: idx + 1,
      rating: p.rating_average,
      reviewCount: p.review_count,
    })),
  })

  // Collection LocalBusiness (schema.org ItemList ne porte pas areaServed)
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${serviceName} RGE \u00e0 ${villeName}`,
    url: pageUrl,
    about: {
      '@type': 'Service',
      name: `${serviceName} certifi\u00e9 RGE`,
      areaServed: { '@type': 'City', name: villeName },
      provider: {
        '@type': 'Organization',
        name: 'ServicesArtisans',
        url: SITE_URL,
      },
    },
  }

  const intro = buildIntroParagraph(serviceName, villeName, serviceSlug)
  const qualif = RGE_QUALIFICATION_LABELS[serviceSlug]
  const hasGuide = [
    'pompe-a-chaleur',
    'panneaux-solaires',
    'isolation-thermique',
    'renovation-energetique',
  ].includes(serviceSlug)

  // Content enrichi (2-3 paragraphes spécifiques service x ville)
  const villeData = getVilleBySlug(villeSlug)
  const enrichedParagraphs = villeData
    ? buildServiceCityParagraphs(serviceSlug, serviceName, villeData, count)
    : []

  // FAQ contextualisée service + ville
  const faqItems = villeData ? buildServiceCityFaq(serviceSlug, serviceName, villeData, count) : []
  const faqSchema = faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null

  // Cross-linking villes : top cities du service (exclut la ville courante)
  const serviceStats = isRgeAllowedService(serviceSlug)
    ? await getRgeServiceStats(serviceSlug)
    : { total: 0, topCities: [] }
  const otherCities = serviceStats.topCities.filter((c) => c.slug !== villeSlug).slice(0, 5)

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Artisans RGE', href: '/rge' },
            { label: serviceName, href: `/rge/${serviceSlug}` },
            { label: villeName },
          ]}
          className="mb-6"
        />

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal-900 font-jakarta">
            {serviceName} certifié RGE à {villeName}
          </h1>
          <p className="mt-3 text-charcoal-600">
            {count} {serviceName.toLowerCase()} RGE {count > 1 ? 'actifs' : 'actif'} à {villeName}
          </p>
        </header>

        <section className="mb-8 text-charcoal-700 leading-relaxed space-y-4">
          <p>{intro}</p>
          {enrichedParagraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>

        <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong className="font-semibold">Source officielle&nbsp;:</strong> Les données de
          certification RGE affichées sont sourcées depuis{' '}
          <a
            href="https://data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700"
          >
            data.gouv.fr
          </a>{' '}
          — ADEME / France Rénov’ (Licence Etalab 2.0).
          {qualif && (
            <>
              {' '}
              Qualification de référence pour ce métier&nbsp;: <strong>{qualif.label}</strong> (
              {qualif.organisme}).
            </>
          )}
        </section>

        <section className="mb-12">
          {count === 0 ? (
            <div className="rounded-lg border border-sand-300 bg-sand-50 p-8 text-center">
              <p className="text-charcoal-700">
                Aucun {serviceName.toLowerCase()} RGE actif actuellement référencé à {villeName}.
              </p>
              <p className="mt-2 text-sm text-charcoal-500">
                Consultez{' '}
                <Link
                  href={`/services/${serviceSlug}/${villeSlug}`}
                  className="text-clay-500 underline"
                >
                  tous les {serviceName.toLowerCase()} à {villeName}
                </Link>{' '}
                ou{' '}
                <Link href={`/artisans-rge/${villeSlug}`} className="text-clay-500 underline">
                  tous les artisans RGE à {villeName}
                </Link>
                .
              </p>
            </div>
          ) : (
            <ProviderList providers={providers} totalCount={count} />
          )}
        </section>

        <section aria-labelledby="cross-links" className="mb-12">
          <h2 id="cross-links" className="text-xl font-bold text-charcoal-900 font-jakarta mb-4">
            Aller plus loin
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            <li>
              <Link
                href={`/artisans-rge/${villeSlug}`}
                className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition"
              >
                <div className="font-semibold text-charcoal-900">
                  Tous les artisans RGE à {villeName}
                </div>
                <div className="text-sm text-charcoal-500">Tous métiers énergétiques confondus</div>
              </Link>
            </li>
            <li>
              <Link
                href={`/services/${serviceSlug}/${villeSlug}`}
                className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition"
              >
                <div className="font-semibold text-charcoal-900">
                  Tous les {serviceName.toLowerCase()} à {villeName}
                </div>
                <div className="text-sm text-charcoal-500">
                  RGE ou non, l’annuaire complet du métier
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/guides/artisan-rge"
                className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition"
              >
                <div className="font-semibold text-charcoal-900">
                  Guide&nbsp;: comprendre la certification RGE
                </div>
                <div className="text-sm text-charcoal-500">Aides, labels, vérification</div>
              </Link>
            </li>
            {hasGuide && (
              <li>
                <Link
                  href={`/guides/${serviceSlug}`}
                  className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition"
                >
                  <div className="font-semibold text-charcoal-900">
                    Guide métier&nbsp;: {serviceName.toLowerCase()}
                  </div>
                  <div className="text-sm text-charcoal-500">Prix, aides, bonnes pratiques</div>
                </Link>
              </li>
            )}
          </ul>
        </section>

        {otherCities.length > 0 && (
          <section aria-labelledby="other-cities" className="mb-12">
            <h2 id="other-cities" className="text-xl font-bold text-charcoal-900 font-jakarta mb-2">
              {serviceName} RGE dans d’autres villes
            </h2>
            <p className="text-sm text-charcoal-500 mb-4">
              Les villes o&ugrave; les {serviceName.toLowerCase()} RGE sont les plus nombreux.
            </p>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/rge/${serviceSlug}/${c.slug}`}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-sand-300 text-sm text-charcoal-700 hover:border-emerald-400 hover:text-emerald-700 transition"
                >
                  {serviceName} RGE à {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {faqItems.length > 0 && (
          <section aria-labelledby="faq" className="mb-12">
            <h2
              id="faq"
              className="text-xl md:text-2xl font-bold text-charcoal-900 font-jakarta mb-6"
            >
              Questions fréquentes : {serviceName.toLowerCase()} RGE à {villeName}
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-sand-300 bg-white p-5 open:border-emerald-300 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                    <span>{item.question}</span>
                    <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-charcoal-600 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
