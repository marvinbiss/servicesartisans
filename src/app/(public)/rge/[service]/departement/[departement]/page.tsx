import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Breadcrumb from '@/components/Breadcrumb'
import ProviderList from '@/components/ProviderList'
import JsonLd from '@/components/JsonLd'
import { getServiceBySlug } from '@/lib/supabase'
import { departements, getDepartementBySlug, getVillesByDepartement } from '@/lib/data/france'
import { SITE_URL } from '@/lib/seo/config'
import { getBreadcrumbSchema, getItemListSchema } from '@/lib/seo/jsonld'
import { getArtisanUrl } from '@/lib/utils'
import {
  getRgeProvidersByServiceAndDepartement,
  isRgeAllowedService,
  RGE_QUALIFICATION_LABELS,
  RGE_ALLOWED_SERVICES,
} from '@/lib/rge/service-city-listings'

// ISR : revalidation quotidienne
export const revalidate = 86400
export const dynamicParams = true

// Top 4 services × tous les départements = 404 pages pré-rendues au build.
// Le reste passe par ISR on-demand au premier hit.
const PRERENDER_SERVICES: readonly string[] = [
  'pompe-a-chaleur',
  'isolation-thermique',
  'chauffagiste',
  'renovation-energetique',
]

export function generateStaticParams() {
  return PRERENDER_SERVICES.flatMap((service) =>
    departements.map((d) => ({ service, departement: d.slug }))
  )
}

interface PageProps {
  params: Promise<{ service: string; departement: string }>
}

function truncateTitle(title: string, maxLen = 60): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, departement: deptSlug } = await params

  if (!isRgeAllowedService(serviceSlug)) return {}
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return {}

  const service = await getServiceBySlug(serviceSlug).catch(() => null)
  const serviceName = service?.name || serviceSlug

  const { count } = await getRgeProvidersByServiceAndDepartement(serviceSlug, dept.name, {
    limit: 1,
  })
  const isNoindex = count === 0

  const title = truncateTitle(
    `${serviceName} RGE ${dept.name} (${dept.code}) \u2014 MaPrimeR\u00e9nov\u2019`
  )
  const description = truncateTitle(
    `Artisans ${serviceName.toLowerCase()} certifi\u00e9s RGE dans le ${dept.name} (${dept.code}). \u00c9ligibles MaPrimeR\u00e9nov\u2019, CEE et TVA 5,5 %. Donn\u00e9es ADEME.`,
    158
  )

  const path = `/rge/${serviceSlug}/departement/${deptSlug}`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
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
  }
}

export default async function RgeServiceDepartementPage({ params }: PageProps) {
  const { service: serviceSlug, departement: deptSlug } = await params

  if (!isRgeAllowedService(serviceSlug)) notFound()
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) notFound()

  const service = await getServiceBySlug(serviceSlug).catch(() => null)
  const serviceName = service?.name || serviceSlug
  const qualif = RGE_QUALIFICATION_LABELS[serviceSlug]

  const { providers, count } = await getRgeProvidersByServiceAndDepartement(
    serviceSlug,
    dept.name,
    { limit: 50 }
  )

  const path = `/rge/${serviceSlug}/departement/${deptSlug}`
  const pageUrl = `${SITE_URL}${path}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: serviceName, url: `/rge/${serviceSlug}` },
    { name: dept.name, url: path },
  ])

  const itemListSchema = getItemListSchema({
    name: `${serviceName} RGE dans le ${dept.name}`,
    description: `Artisans ${serviceName.toLowerCase()} certifi\u00e9s RGE dans le d\u00e9partement ${dept.name} (${dept.code})`,
    url: path,
    items: providers.slice(0, 10).map((p, idx) => ({
      name: p.name,
      url: getArtisanUrl(p),
      position: idx + 1,
      rating: p.rating_average,
      reviewCount: p.review_count,
    })),
  })

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${serviceName} RGE dans le ${dept.name}`,
    url: pageUrl,
    about: {
      '@type': 'Service',
      name: `${serviceName} certifi\u00e9 RGE`,
      areaServed: {
        '@type': 'AdministrativeArea',
        name: dept.name,
        identifier: dept.code,
      },
      provider: {
        '@type': 'Organization',
        name: 'ServicesArtisans',
        url: SITE_URL,
      },
    },
  }

  // Cross-linking : villes principales du département pour ce service
  const topVilles = getVillesByDepartement(dept.code).slice(0, 12)

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={collectionSchema} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Artisans RGE', href: '/rge' },
            { label: serviceName, href: `/rge/${serviceSlug}` },
            { label: `${dept.name} (${dept.code})` },
          ]}
          className="mb-6"
        />

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal-900 font-jakarta">
            {serviceName} certifi&eacute; RGE dans le {dept.name} ({dept.code})
          </h1>
          <p className="mt-3 text-charcoal-600">
            {count > 0 ? (
              <>
                <strong>{count.toLocaleString('fr-FR')}</strong> {serviceName.toLowerCase()} RGE{' '}
                {count > 1 ? 'actifs' : 'actif'} r&eacute;f&eacute;renc&eacute;s dans le
                d&eacute;partement {dept.name}
              </>
            ) : (
              <>
                Annuaire des {serviceName.toLowerCase()} RGE du d&eacute;partement {dept.name}
              </>
            )}
          </p>
        </header>

        <section className="mb-8 text-charcoal-700 leading-relaxed space-y-4">
          <p>
            {qualif ? (
              <>
                Les artisans {serviceName.toLowerCase()} certifi&eacute;s RGE du {dept.name}{' '}
                d&eacute;tiennent le label <strong>{qualif.label}</strong> d&eacute;livr&eacute; par{' '}
                {qualif.organisme}, garantissant leur comp&eacute;tence pour {qualif.specifics}.
              </>
            ) : (
              <>
                Les artisans {serviceName.toLowerCase()} certifi&eacute;s RGE (Reconnu Garant de
                l&rsquo;Environnement) du {dept.name} r&eacute;pondent aux crit&egrave;res
                d&rsquo;&eacute;co-conditionnalit&eacute; fix&eacute;s par l&rsquo;&Eacute;tat.
              </>
            )}{' '}
            Cette qualification est indispensable pour b&eacute;n&eacute;ficier des aides publiques
            &agrave; la r&eacute;novation &eacute;nerg&eacute;tique&nbsp;:
            MaPrimeR&eacute;nov&rsquo;, Certificats d&rsquo;&Eacute;conomies d&rsquo;&Eacute;nergie
            (CEE), &eacute;co-pr&ecirc;t &agrave; taux z&eacute;ro et TVA r&eacute;duite &agrave;
            5,5&nbsp;%.
          </p>
          <p>
            Le d&eacute;partement du {dept.name} compte {dept.population} habitants. Son chef-lieu
            est <strong>{dept.chefLieu}</strong>, qui concentre historiquement une part importante
            du tissu artisanal RGE local. Tous les professionnels list&eacute;s ci-dessous ont une
            qualification v&eacute;rifi&eacute;e et toujours active, sourc&eacute;e directement
            depuis le registre officiel ADEME / France R&eacute;nov&rsquo;.
          </p>
        </section>

        <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong className="font-semibold">Source officielle&nbsp;:</strong> Donn&eacute;es
          sourc&eacute;es depuis{' '}
          <a
            href="https://data.ademe.fr/datasets/liste-des-entreprises-rge-2"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-emerald-700"
          >
            data.ademe.fr
          </a>{' '}
          &mdash; Licence Etalab 2.0.{' '}
          <Link href="/rge/sources" className="underline hover:text-emerald-700">
            M&eacute;thodologie compl&egrave;te
          </Link>
          .
        </section>

        <section className="mb-12">
          {count === 0 ? (
            <div className="rounded-lg border border-sand-300 bg-sand-50 p-8 text-center">
              <p className="text-charcoal-700">
                Aucun {serviceName.toLowerCase()} RGE actif actuellement
                r&eacute;f&eacute;renc&eacute; dans le d&eacute;partement {dept.name}.
              </p>
              <p className="mt-2 text-sm text-charcoal-500">
                Consultez{' '}
                <Link href={`/rge/${serviceSlug}`} className="text-clay-500 underline">
                  tous les {serviceName.toLowerCase()} RGE de France
                </Link>{' '}
                ou{' '}
                <Link
                  href={`/departements/${deptSlug}/${serviceSlug}`}
                  className="text-clay-500 underline"
                >
                  tous les {serviceName.toLowerCase()} du {dept.name}
                </Link>
                .
              </p>
            </div>
          ) : (
            <ProviderList providers={providers} totalCount={count} />
          )}
        </section>

        {topVilles.length > 0 && (
          <section aria-labelledby="top-villes" className="mb-12">
            <h2 id="top-villes" className="text-xl font-bold text-charcoal-900 font-jakarta mb-4">
              {serviceName} RGE par ville dans le {dept.name}
            </h2>
            <p className="text-sm text-charcoal-600 mb-4">
              Affinez votre recherche en ciblant directement la commune o&ugrave; vos travaux seront
              r&eacute;alis&eacute;s.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {topVilles.map((v) => (
                <Link
                  key={v.slug}
                  href={`/rge/${serviceSlug}/${v.slug}`}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-sand-300 hover:border-emerald-400 hover:bg-emerald-50 transition text-sm text-charcoal-700 hover:text-emerald-700"
                >
                  <span className="truncate font-medium">{v.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="other-services" className="mb-12">
          <h2 id="other-services" className="text-xl font-bold text-charcoal-900 font-jakarta mb-4">
            Autres m&eacute;tiers RGE dans le {dept.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {RGE_ALLOWED_SERVICES.filter((s) => s !== serviceSlug).map((s) => {
              const otherLabel = RGE_QUALIFICATION_LABELS[s]
              return (
                <Link
                  key={s}
                  href={`/rge/${s}/departement/${deptSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-sand-300 text-xs font-medium text-charcoal-700 hover:border-emerald-400 hover:text-emerald-700 transition"
                >
                  {otherLabel?.label ?? s}
                </Link>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="cross-links" className="mb-12">
          <h2 id="cross-links" className="text-xl font-bold text-charcoal-900 font-jakarta mb-4">
            Aller plus loin
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            <li>
              <Link
                href={`/rge/${serviceSlug}`}
                className="block rounded-lg border border-sand-300 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition"
              >
                <div className="font-semibold text-charcoal-900">
                  Hub national {serviceName} RGE
                </div>
                <div className="text-sm text-charcoal-500">
                  Vue d&rsquo;ensemble, guides et qualifications
                </div>
              </Link>
            </li>
            <li>
              <Link
                href={`/departements/${deptSlug}`}
                className="block rounded-lg border border-sand-300 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition"
              >
                <div className="font-semibold text-charcoal-900">
                  Tous les artisans du {dept.name}
                </div>
                <div className="text-sm text-charcoal-500">
                  Annuaire complet du d&eacute;partement
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/rge/qualifications"
                className="block rounded-lg border border-sand-300 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition"
              >
                <div className="font-semibold text-charcoal-900">
                  Comprendre les qualifications RGE
                </div>
                <div className="text-sm text-charcoal-500">
                  QualiPAC, QualiSol, QualiBois, Qualifelec, QualiPV
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/cee/guides"
                className="block rounded-lg border border-sand-300 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition"
              >
                <div className="font-semibold text-charcoal-900">Guides primes CEE 2026</div>
                <div className="text-sm text-charcoal-500">
                  Montants et conditions par op&eacute;ration
                </div>
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
