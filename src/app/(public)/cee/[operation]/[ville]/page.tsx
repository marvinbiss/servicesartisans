import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Breadcrumb from '@/components/Breadcrumb'
import ProviderList from '@/components/ProviderList'
import JsonLd from '@/components/JsonLd'
import { villes as staticVilles, getVilleBySlug } from '@/lib/data/france'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getItemListSchema } from '@/lib/seo/jsonld'
import { getArtisanUrl } from '@/lib/utils'
import { SITEMAP_CITY_COUNT_TIER2 } from '@/lib/seo/sitemap-config'
import {
  getCeeOperationByCode,
  getCeeOperations,
  isValidCeeOperationCode,
  CEE_DOMAINE_LABELS,
  type CeeOperation,
} from '@/lib/cee/catalogue'
import {
  getCeeProvidersByOperationAndCity,
  getCeeProviderCountByOperationAndCity,
  getCeeTopCitiesByOperation,
} from '@/lib/cee/listings'
import {
  buildCeeOperationCityParagraphs,
  buildCeeOperationCityFaq,
  buildCeeFaqJsonLd,
} from '@/lib/cee/pseo-content'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  type RgeAllowedService,
} from '@/lib/rge/service-city-listings'

// ISR quotidien — le catalogue bouge rarement, les providers RGE sont
// resynchronisés hebdo côté ADEME.
export const revalidate = 86400
export const dynamicParams = true

const VALID_OP = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/
const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/

/**
 * generateStaticParams — 19 opérations × top 500 villes (Tier 2).
 * Les opérations actives sont résolues à la volée pour rester alignées
 * avec la DB (ajout/retrait d'une fiche DGEC → re-build couvre les nouvelles).
 */
export async function generateStaticParams(): Promise<Array<{ operation: string; ville: string }>> {
  const operations = await getCeeOperations().catch(() => [])
  // Fallback hardcodé si DB down au build — on pré-rend les codes du seed
  // migration 383 pour que l'ISR on-demand puisse prendre le relais.
  // Fiches abrogées retirées : BAR-TH-106 (01/01/2024 → BAR-TH-171),
  // BAR-TH-160 (01/08/2025), BAR-TH-164 (→ BAR-TH-174). Ajouts : BAR-TH-172,
  // 174, 175, 177.
  const codes: string[] =
    operations.length > 0
      ? operations.map((op) => op.code)
      : [
          'BAR-EN-101',
          'BAR-EN-102',
          'BAR-EN-103',
          'BAR-EN-104',
          'BAR-EN-108',
          'BAR-TH-112',
          'BAR-TH-113',
          'BAR-TH-125',
          'BAR-TH-127',
          'BAR-TH-129',
          'BAR-TH-143',
          'BAR-TH-148',
          'BAR-TH-159',
          'BAR-TH-161',
          'BAR-TH-171',
          'BAR-TH-172',
          'BAR-TH-173',
          'BAR-TH-174',
          'BAR-TH-175',
          'BAR-TH-177',
          'BAR-SE-104',
        ]

  const topCities = staticVilles.slice(0, SITEMAP_CITY_COUNT_TIER2)
  return codes.flatMap((operation) => topCities.map((v) => ({ operation, ville: v.slug })))
}

interface PageProps {
  params: Promise<{ operation: string; ville: string }>
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { operation: opCode, ville: villeSlug } = await params

  if (!VALID_OP.test(opCode) || !VALID_SLUG.test(villeSlug)) notFound()
  if (!isValidCeeOperationCode(opCode)) notFound()

  const [operation, ville] = await Promise.all([
    getCeeOperationByCode(opCode),
    Promise.resolve(getVilleBySlug(villeSlug)),
  ])
  if (!ville) notFound()

  // Fail-open : si DB down ou op inconnue, on rend quand même un shell
  // (ISR corrigera). Dans ce cas on noindex et on affiche le fallback.
  const opName = operation?.nom ?? `Prime CEE ${opCode}`
  const villeName = ville.name

  const providerCount = await getCeeProviderCountByOperationAndCity(opCode, villeSlug)
  const isNoindex = providerCount === 0 || !operation

  const title = truncate(`Prime CEE ${opName} \u00e0 ${villeName} \u2014 artisans RGE`, 60)
  const description = truncate(
    `${opName} \u00e0 ${villeName} : artisans RGE qualifi\u00e9s, prime CEE mobilisable, cumul MaPrimeR\u00e9nov\u2019 et TVA 5,5 %. V\u00e9rification ADEME.`,
    158
  )
  const path = `/cee/${opCode}/${villeSlug}`

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

export default async function CeeOperationCityPage({ params }: PageProps) {
  const { operation: opCode, ville: villeSlug } = await params

  if (!VALID_OP.test(opCode) || !VALID_SLUG.test(villeSlug)) notFound()
  if (!isValidCeeOperationCode(opCode)) notFound()

  const ville = getVilleBySlug(villeSlug)
  if (!ville) notFound()

  const operation: CeeOperation | null = await getCeeOperationByCode(opCode)
  const villeName = ville.name
  const path = `/cee/${opCode}/${villeSlug}`

  // Fail-open strict : si operation null, on rend un shell explicatif neutre.
  // Metadata aura d\u00e9j\u00e0 pos\u00e9 un noindex.
  if (!operation) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 font-jakarta mb-4">
            Prime CEE {opCode} &agrave; {villeName}
          </h1>
          <p className="text-gray-700">
            Cette op&eacute;ration CEE n&rsquo;est pas actuellement disponible dans notre catalogue.
            Consultez le{' '}
            <Link href="/cee" className="text-emerald-700 underline">
              hub des primes CEE
            </Link>{' '}
            pour d&eacute;couvrir les 19 op&eacute;rations r&eacute;sidentielles couvertes.
          </p>
        </div>
      </main>
    )
  }

  const providers = await getCeeProvidersByOperationAndCity(opCode, villeSlug, { limit: 50 })
  const count = providers.length

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: operation.nom, url: `/cee/${opCode}` },
    { name: villeName, url: path },
  ])

  const itemListSchema =
    count > 0
      ? getItemListSchema({
          name: `${operation.nom} \u00e0 ${villeName}`,
          description: `Artisans RGE qualifi\u00e9s pour ${operation.nom.toLowerCase()} \u00e0 ${villeName}`,
          url: path,
          items: providers.slice(0, 10).map((p, idx) => ({
            name: p.name,
            url: getArtisanUrl(p),
            position: idx + 1,
            rating: p.rating_average ?? undefined,
            reviewCount: p.review_count ?? undefined,
          })),
        })
      : null

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Prime CEE ${operation.nom} \u00e0 ${villeName}`,
    url: `${SITE_URL}${path}`,
    about: {
      '@type': 'Service',
      name: `${operation.nom} (CEE ${operation.code})`,
      areaServed: { '@type': 'City', name: villeName },
      provider: {
        '@type': 'Organization',
        name: 'ServicesArtisans',
        url: SITE_URL,
      },
    },
  }

  const enrichedParagraphs = buildCeeOperationCityParagraphs(operation, ville)
  const faqItems = buildCeeOperationCityFaq(operation, ville, count)
  const faqSchema = buildCeeFaqJsonLd(faqItems)

  // Cross-linking villes : top autres villes pour la m\u00eame op\u00e9ration
  const topCities = await getCeeTopCitiesByOperation(opCode)
  const otherCities = topCities.filter((c) => c.slug !== villeSlug).slice(0, 5)

  // Cross-linking op\u00e9rations du m\u00eame domaine
  const allOps = await getCeeOperations()
  const sameDomainOps = allOps
    .filter((op) => op.domaine === operation.domaine && op.code !== operation.code)
    .slice(0, 3)

  const domaineLabel = CEE_DOMAINE_LABELS[operation.domaine]?.label || operation.domaine

  const rgeServices: RgeAllowedService[] = (operation.services_slugs ?? []).filter(
    (slug): slug is RgeAllowedService => (RGE_ALLOWED_SERVICES as readonly string[]).includes(slug)
  )

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      {itemListSchema && <JsonLd data={itemListSchema} />}
      <JsonLd data={collectionSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Primes CEE', href: '/cee' },
            { label: operation.nom, href: `/cee/${opCode}` },
            { label: villeName },
          ]}
          className="mb-6"
        />

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-3">
            <span className="text-xs font-semibold text-emerald-800">
              Fiche officielle DGEC {operation.code}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-jakarta">
            {operation.nom} : artisans RGE certifi&eacute;s &agrave; {villeName}
          </h1>
          <p className="mt-3 text-gray-600">
            {count > 0 ? (
              <>
                {count} artisan{count > 1 ? 's' : ''} RGE qualifi&eacute;{count > 1 ? 's' : ''} pour
                cette op&eacute;ration CEE &agrave; {villeName}
              </>
            ) : (
              <>
                Catalogue national de l&rsquo;op&eacute;ration CEE {operation.code} &agrave;{' '}
                {villeName}
              </>
            )}
          </p>
        </header>

        <section className="mb-8 text-gray-700 leading-relaxed space-y-4">
          {enrichedParagraphs.map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
          ))}
        </section>

        <section className="mb-10">
          {count === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-700 mb-3">
                Aucun artisan RGE qualifi&eacute; pour la fiche {operation.code} n&rsquo;est
                actuellement r&eacute;f&eacute;renc&eacute; &agrave; {villeName}.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Link
                  href="/devis"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                >
                  Demander un devis gratuit
                </Link>
                <Link
                  href="/cee"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Voir toutes les primes CEE
                </Link>
              </div>
            </div>
          ) : (
            <ProviderList providers={providers} totalCount={count} />
          )}
        </section>

        {/* Comprendre cette prime CEE */}
        <section className="mb-12 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-jakarta mb-4">
            Comprendre la prime CEE {operation.code}
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="font-semibold text-gray-900">Domaine</dt>
              <dd className="text-gray-700">{domaineLabel}</dd>
            </div>
            {operation.sous_domaine && (
              <div>
                <dt className="font-semibold text-gray-900">Sous-domaine</dt>
                <dd className="text-gray-700">{operation.sous_domaine.replace(/_/g, ' ')}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-gray-900">Qualifications RGE requises</dt>
              <dd className="text-gray-700">
                {operation.rge_qualifications_requises.join(', ') || 'Qualibat RGE'}
              </dd>
            </div>
            {operation.unite_mesure && (
              <div>
                <dt className="font-semibold text-gray-900">Unit&eacute; de mesure</dt>
                <dd className="text-gray-700">{operation.unite_mesure}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-gray-900">&Eacute;ligibilit&eacute;</dt>
              <dd className="text-gray-700">
                {operation.classique_eligible && 'Tous m\u00e9nages'}
                {operation.classique_eligible && operation.precarite_eligible && ' + '}
                {operation.precarite_eligible && 'Bonifi\u00e9 pr\u00e9carit\u00e9'}
              </dd>
            </div>
            {operation.coup_de_pouce && (
              <div>
                <dt className="font-semibold text-gray-900">Coup de pouce</dt>
                <dd className="text-emerald-700 font-semibold">
                  Oui{operation.coup_de_pouce_charte ? ` (${operation.coup_de_pouce_charte})` : ''}
                </dd>
              </div>
            )}
          </dl>
          {operation.url_fiche_officielle && (
            <p className="mt-5 text-sm">
              <a
                href={operation.url_fiche_officielle}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold underline hover:text-emerald-900"
              >
                Consulter la fiche officielle DGEC {operation.code} &rarr;
              </a>
            </p>
          )}
        </section>

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section aria-labelledby="faq" className="mb-12">
            <h2 id="faq" className="text-xl md:text-2xl font-bold text-gray-900 font-jakarta mb-6">
              Questions fr&eacute;quentes &mdash; {operation.nom} &agrave; {villeName}
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-gray-200 bg-white p-5 open:border-emerald-300 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-start justify-between gap-4">
                    <span>{item.question}</span>
                    <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">
                      +
                    </span>
                  </summary>
                  <p
                    className="mt-3 text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Cross-linking m\u00e9tiers RGE */}
        {rgeServices.length > 0 && (
          <section aria-labelledby="rge-services" className="mb-12">
            <h2 id="rge-services" className="text-xl font-bold text-gray-900 font-jakarta mb-4">
              M&eacute;tiers RGE qualifi&eacute;s &agrave; {villeName}
            </h2>
            <p className="text-sm text-gray-600 mb-4 max-w-3xl">
              Explorer l&rsquo;annuaire des artisans RGE par m&eacute;tier &agrave; {villeName}
              &nbsp;:
            </p>
            <div className="flex flex-wrap gap-2">
              {rgeServices.map((slug) => {
                const meta = RGE_QUALIFICATION_LABELS[slug]
                return (
                  <Link
                    key={slug}
                    href={`/rge/${slug}/${villeSlug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100 transition"
                  >
                    <span className="font-semibold capitalize">{slug.replace(/-/g, ' ')}</span>
                    {meta && (
                      <span className="text-xs text-emerald-600">&middot; {meta.label}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Cross-linking villes */}
        {otherCities.length > 0 && (
          <section aria-labelledby="other-cities" className="mb-12">
            <h2 id="other-cities" className="text-xl font-bold text-gray-900 font-jakarta mb-4">
              {operation.nom} dans d&rsquo;autres villes
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cee/${opCode}/${c.slug}`}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-linking op\u00e9rations */}
        {sameDomainOps.length > 0 && (
          <section aria-labelledby="same-domain" className="mb-12">
            <h2 id="same-domain" className="text-xl font-bold text-gray-900 font-jakarta mb-4">
              Autres primes CEE du domaine {domaineLabel.toLowerCase()}
            </h2>
            <ul className="grid gap-3 md:grid-cols-3">
              {sameDomainOps.map((op) => (
                <li key={op.code}>
                  <Link
                    href={`/cee/${op.code}/${villeSlug}`}
                    className="block rounded-lg border border-gray-200 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition"
                  >
                    <div className="text-xs font-semibold text-emerald-700">{op.code}</div>
                    <div className="font-semibold text-gray-900 mt-1">{op.nom}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900 font-jakarta mb-2">
            Pr&ecirc;t &agrave; lancer votre projet &agrave; {villeName}&nbsp;?
          </h2>
          <p className="text-gray-600 text-sm mb-4 max-w-2xl mx-auto">
            Demandez un devis gratuit aupr&egrave;s d&rsquo;un artisan RGE qualifi&eacute; pour la
            fiche {operation.code}. Devis sans engagement, primes CEE et MaPrimeR&eacute;nov&rsquo;
            calcul&eacute;es automatiquement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
            >
              Voir toutes les primes CEE
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
