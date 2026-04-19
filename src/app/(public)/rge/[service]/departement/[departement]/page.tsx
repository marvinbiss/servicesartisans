import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Breadcrumb from '@/components/Breadcrumb'
import ProviderList from '@/components/ProviderList'
import JsonLd from '@/components/JsonLd'
import { getServiceBySlug } from '@/lib/supabase'
import { departements, getDepartementBySlug, getVillesByDepartement } from '@/lib/data/france'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getItemListSchema } from '@/lib/seo/jsonld'
import { getArtisanUrl } from '@/lib/utils'
import {
  getRgeProvidersByServiceAndDepartement,
  getRgeCountByServiceAndDepartementStrict,
  isRgeAllowedService,
  RGE_QUALIFICATION_LABELS,
  RGE_ALLOWED_SERVICES,
} from '@/lib/rge/service-city-listings'
import { getDeptPreposition, getDeptArticle } from '@/lib/geo-strings'

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

function truncateTitle(title: string, maxLen = 58): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, departement: deptSlug } = await params

  if (!isRgeAllowedService(serviceSlug)) return {}
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return {}

  const service = await getServiceBySlug(serviceSlug).catch(() => null)
  const serviceName = service?.name || serviceSlug

  // Vague 1.1 — stratégie 410 fail-open : count=0 confirmé → noindex dans les
  // metadata ; erreur transitoire → on reste indexable (ISR corrige).
  const countStrict = await getRgeCountByServiceAndDepartementStrict(serviceSlug, dept.name)
  const isNoindex = countStrict.ok && countStrict.count === 0

  const title = truncateTitle(`${serviceName} RGE ${dept.name} (${dept.code}) — MaPrimeRénov’`)
  const rawDesc = `Artisans ${serviceName.toLowerCase()} certifiés RGE ${getDeptPreposition(dept.name)} (${dept.code}). Éligibles MaPrimeRénov’, CEE et TVA 5,5 %. Données ADEME.`
  const description = rawDesc.length <= 158 ? rawDesc : rawDesc.slice(0, 155) + '…'

  const path = `/rge/${serviceSlug}/departement/${deptSlug}`

  return {
    title,
    description,
    alternates: getAlternates(`${path}`),
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
    name: `${serviceName} RGE ${getDeptPreposition(dept.name)}`,
    description: `Artisans ${serviceName.toLowerCase()} certifiés RGE ${getDeptPreposition(dept.name)} (${dept.code})`,
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
    name: `${serviceName} RGE ${getDeptPreposition(dept.name)}`,
    url: pageUrl,
    about: {
      '@type': 'Service',
      name: `${serviceName} certifié RGE`,
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
            {serviceName} certifié RGE dans le {dept.name} ({dept.code})
          </h1>
          <p className="mt-3 text-charcoal-600">
            {count > 0 ? (
              <>
                <strong>{count.toLocaleString('fr-FR')}</strong> {serviceName.toLowerCase()} RGE{' '}
                {count > 1 ? 'actifs' : 'actif'} référencés {getDeptPreposition(dept.name)}
              </>
            ) : (
              <>
                Annuaire des {serviceName.toLowerCase()} RGE {getDeptArticle(dept.name)}
              </>
            )}
          </p>
        </header>

        <section className="mb-8 text-charcoal-700 leading-relaxed space-y-4">
          <p>
            {qualif ? (
              <>
                Les artisans {serviceName.toLowerCase()} certifiés RGE {getDeptArticle(dept.name)}{' '}
                détiennent le label <strong>{qualif.label}</strong> délivré par {qualif.organisme},
                garantissant leur compétence pour {qualif.specifics}.
              </>
            ) : (
              <>
                Les artisans {serviceName.toLowerCase()} certifiés RGE (Reconnu Garant de
                l’Environnement) {getDeptArticle(dept.name)} répondent aux critères
                d’éco-conditionnalité fixés par l’État.
              </>
            )}{' '}
            Cette qualification est indispensable pour bénéficier des aides publiques à la
            rénovation énergétique&nbsp;: MaPrimeRénov’, Certificats d’Économies d’Énergie (CEE),
            éco-prêt à taux zéro et TVA réduite à 5,5&nbsp;%.
          </p>
          <p>
            Le département {getDeptArticle(dept.name)} compte {dept.population} habitants. Son
            chef-lieu est <strong>{dept.chefLieu}</strong>, qui concentre historiquement une part
            importante du tissu artisanal RGE local. Tous les professionnels listés ci-dessous ont
            une qualification vérifiée et toujours active, sourcée directement depuis le registre
            officiel ADEME / France Rénov’.
          </p>
        </section>

        <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <strong className="font-semibold">Source officielle&nbsp;:</strong> Données sourcées
          depuis{' '}
          <a
            href="https://data.ademe.fr/datasets/liste-des-entreprises-rge-2"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-emerald-700"
          >
            data.ademe.fr
          </a>{' '}
          — Licence Etalab 2.0.{' '}
          <Link href="/rge/sources" className="underline hover:text-emerald-700">
            Méthodologie complète
          </Link>
          .
        </section>

        <section className="mb-12">
          {count === 0 ? (
            <div className="rounded-lg border border-sand-300 bg-sand-50 p-8 text-center">
              <p className="text-charcoal-700">
                Aucun {serviceName.toLowerCase()} RGE actif actuellement référencé{' '}
                {getDeptPreposition(dept.name)}.
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
                  tous les {serviceName.toLowerCase()} {getDeptArticle(dept.name)}
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
              Affinez votre recherche en ciblant directement la commune où vos travaux seront
              réalisés.
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
            Autres métiers RGE dans le {dept.name}
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
                  Vue d’ensemble, guides et qualifications
                </div>
              </Link>
            </li>
            <li>
              <Link
                href={`/departements/${deptSlug}`}
                className="block rounded-lg border border-sand-300 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition"
              >
                <div className="font-semibold text-charcoal-900">
                  Tous les artisans {getDeptArticle(dept.name)}
                </div>
                <div className="text-sm text-charcoal-500">Annuaire complet du département</div>
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
                  Montants et conditions par opération
                </div>
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
