import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ShieldCheck,
  FileCheck2,
  Percent,
  MapPin,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Euro,
  Wrench,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  isRgeAllowedService,
  type RgeAllowedService,
} from '@/lib/rge/service-city-listings'
import { departements } from '@/lib/data/france'
import { getRgeServiceStats } from '@/lib/rge/guide-stats'
import { getRgeLastSyncDate } from '@/lib/rge/last-sync'
import { logger } from '@/lib/logger'
import LastUpdated from '@/components/seo/LastUpdated'
import { getRgeServiceHubContent } from '@/lib/rge/service-hub-content'
import { getRgeGuidesForService, getCeeGuidesForService } from '@/lib/rge/service-guides-map'

// ISR — révalidation quotidienne. Les stats RGE par service suivent le rythme
// de la sync ADEME hebdomadaire, 24h est le bon compromis crawl/fraîcheur.
export const revalidate = 86400

export function generateStaticParams() {
  return RGE_ALLOWED_SERVICES.map((service) => ({ service }))
}

interface PageProps {
  params: Promise<{ service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service } = await params
  if (!isRgeAllowedService(service)) return {}

  const content = getRgeServiceHubContent(service)
  const url = `${SITE_URL}/rge/${service}`

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: getAlternates(`/rge/${service}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title: content.metaTitle,
      description: content.metaDescription,
      url,
      siteName: 'ServicesArtisans',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
    },
  }
}

export default async function RgeServiceHubPage({ params }: PageProps) {
  const { service } = await params

  if (!isRgeAllowedService(service)) {
    notFound()
  }

  const serviceSlug: RgeAllowedService = service
  const content = getRgeServiceHubContent(serviceSlug)
  const label = RGE_QUALIFICATION_LABELS[serviceSlug]

  // Fail-open strict : DB down ou IS_BUILD → stats vides, page reste rendue
  // Stats service + dernière sync ADEME en parallèle. Fail-open sur les deux.
  const [stats, lastSyncDate] = await Promise.all([
    getRgeServiceStats(serviceSlug).catch((err: unknown) => {
      logger.error('rge_service_hub.service_stats_error', err as Error, {
        route: 'rge/[service]',
        service: serviceSlug,
      })
      return { total: 0, topCities: [] }
    }),
    getRgeLastSyncDate().catch((err: unknown) => {
      logger.error('rge_service_hub.last_sync_error', err as Error, {
        route: 'rge/[service]',
        service: serviceSlug,
      })
      return null
    }),
  ])

  const total = stats.total || 0
  const topCities = stats.topCities.slice(0, 12)
  const hasStats = total > 0

  // Cross-linking éditorial vers les guides RGE qualif et CEE débloquées.
  // Mappings purs synchrones, no-op si aucune correspondance (service sans
  // guide dédié — pas d'encart affiché).
  const rgeGuideLinks = getRgeGuidesForService(serviceSlug)
  const ceeGuideLinks = getCeeGuidesForService(serviceSlug)

  const pagePath = `/rge/${serviceSlug}`

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Artisans RGE', href: '/rge' },
    { label: content.h1 },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: content.h1, url: pagePath },
  ])

  const collectionSchema = getCollectionPageSchema({
    name: content.h1,
    description: content.lede,
    url: pagePath,
    itemCount: total,
  })

  const faqSchema = getFAQSchema(content.faq, {
    pageUrl: `${SITE_URL}${pagePath}`,
    name: `FAQ — ${content.h1}`,
    includeSpeakable: true,
  })

  // ItemList Schema.org — indexe les 12 top villes pour ce service RGE.
  // Aide Google à émettre un carrousel SERP sur les requêtes parentes (ex :
  // "artisan RGE pompe à chaleur"). Les ListItem pointent vers des URLs
  // (type URL), Google choisit la présentation appropriée.
  const itemListSchema =
    topCities.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: content.h1,
          description: content.lede,
          url: `${SITE_URL}${pagePath}`,
          numberOfItems: topCities.length,
          itemListElement: topCities.map((city, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${content.h1} à ${city.name}`,
            url: `${SITE_URL}/rge/${serviceSlug}/${city.slug}`,
          })),
        }
      : null

  const jsonLdItems: Record<string, unknown>[] = [breadcrumbSchema, collectionSchema]
  if (itemListSchema) jsonLdItems.push(itemListSchema as Record<string, unknown>)
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              {label ? `${label.label} — ${label.organisme}` : 'Mention RGE officielle'}
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5"
          >
            {content.h1}
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl leading-relaxed">
            {hasStats ? (
              <>
                <strong className="text-white">
                  {total.toLocaleString('fr-FR')} artisans RGE actifs
                </strong>{' '}
                — {content.lede}
              </>
            ) : (
              content.lede
            )}
          </p>
          {/* Freshness signal — MAX(providers.rge_last_synced_at) ; fail-open. */}
          <LastUpdated
            label="Données ADEME synchronisées le"
            date={lastSyncDate}
            className="mt-5 text-emerald-100/90"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Vérifier un artisan
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              Demander un devis gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Bloc stats contextualisées */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {hasStats ? total.toLocaleString('fr-FR') : '—'}
            </div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Artisans RGE actifs recensés en France pour ce métier, qualification en cours de
              validité au référentiel ADEME.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {label?.label ?? 'RGE'}
            </div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Qualification de référence pour ce métier, délivrée par{' '}
              {label?.organisme ?? 'un organisme accrédité COFRAC'}.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {content.aides.length}
            </div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Dispositifs d&apos;aides publiques mobilisables sur ce type de travaux, cumulables
              sous conditions.
            </div>
          </div>
        </div>
      </section>

      {/* Guides RGE qualif — cross-linking éditorial vers /rge/qualifications/[slug] */}
      {rgeGuideLinks.length > 0 && (
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-b border-emerald-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Guides qualifications RGE
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
              Comprendre les qualifications RGE {label?.label ?? ''} en détail
            </h2>
            <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
              Périmètre exact, organisme certificateur, travaux couverts et primes débloquées : nos
              guides éditoriaux décryptent chaque qualification RGE reconnue pour ce métier.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rgeGuideLinks.map((g) => (
                <Link
                  key={g.slug}
                  href={`/rge/qualifications/${g.slug}`}
                  className="group block p-6 bg-white rounded-2xl border border-emerald-100 hover:border-emerald-400 hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      className="w-5 h-5 text-emerald-700 mt-1 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                          {g.name}
                        </h3>
                        <span className="text-xs font-semibold text-emerald-700">
                          {g.organisme}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal-600 mt-1.5 leading-relaxed line-clamp-3">
                        {g.lede}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:text-emerald-900">
                        Lire le guide
                        <ArrowRight
                          className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Primes CEE débloquées — cross-linking éditorial vers /cee/[code]/guide */}
      {ceeGuideLinks.length > 0 && (
        <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50/40 border-b border-primary-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-5 h-5 text-primary-600" aria-hidden="true" />
              <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                Primes CEE débloquées
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
              Primes CEE mobilisables pour ce métier
            </h2>
            <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
              Chaque opération CEE standardisée ci-dessous est éligible aux primes versées par les
              délégataires obligés (Effy, Sonergia, TotalEnergies, EDF) dès lors que les travaux
              sont réalisés par un artisan RGE qualifié. Cliquez pour accéder au guide détaillé.
            </p>
            <div className="flex flex-wrap gap-2">
              {ceeGuideLinks.map((c) => (
                <Link
                  key={c.code}
                  href={`/cee/${c.code.toLowerCase()}/guide`}
                  className="group inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition px-3 py-2 text-sm"
                >
                  <span className="font-mono font-bold text-primary-800 text-xs">{c.code}</span>
                  <span className="text-charcoal-700">{c.label}</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-primary-500 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
            <p className="text-xs text-charcoal-900 mt-5 leading-relaxed max-w-3xl">
              Les primes CEE sont cumulables avec MaPrimeRénov’. Le montant exact dépend de vos
              revenus, de la zone climatique et du délégataire choisi.
            </p>
          </div>
        </section>
      )}

      {/* Description longue (contenu unique éditorial) */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Comprendre la mention {label?.label ?? 'RGE'} pour ce métier
          </h2>
          <div className="space-y-5 text-charcoal-700 leading-relaxed">
            {content.description.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Travaux couverts */}
      <section className="bg-emerald-50/40 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
            Travaux couverts par la qualification
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-10 leading-relaxed">
            Les interventions typiques pour lesquelles ces artisans sont qualifiés et éligibles aux
            aides publiques.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {content.travaux.map((t, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-charcoal-200">
                <div className="flex items-start gap-3">
                  <Wrench
                    className="w-5 h-5 text-emerald-700 mt-1 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-heading font-bold text-charcoal-900 text-lg">{t.label}</h3>
                    <p className="text-sm text-charcoal-600 mt-1.5 leading-relaxed">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aides publiques */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
            Aides publiques mobilisables
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-10 leading-relaxed">
            Les dispositifs d&apos;aides cumulables pour ces travaux lorsqu&apos;ils sont réalisés
            par un artisan RGE. Montants indicatifs au 1er janvier 2026.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {content.aides.map((a, idx) => (
              <div key={idx} className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <div className="flex items-start gap-3">
                  <Euro
                    className="w-5 h-5 text-emerald-700 mt-1 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-charcoal-900">{a.label}</h3>
                      {a.montant !== '—' && (
                        <span className="text-sm font-bold text-emerald-700">{a.montant}</span>
                      )}
                    </div>
                    <p className="text-sm text-charcoal-600 mt-1.5 leading-relaxed">{a.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top villes — cross-link vers /rge/[service]/[ville] */}
      {topCities.length > 0 && (
        <section className="bg-sand-50 border-y border-charcoal-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
              Trouvez un artisan RGE près de chez vous
            </h2>
            <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
              Classement des villes françaises par nombre d&apos;artisans RGE actifs pour ce métier.
              Cliquez sur une ville pour accéder à l&apos;annuaire local.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/rge/${serviceSlug}/${city.slug}`}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition truncate">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-charcoal-900 tabular-nums ml-2">
                    {city.count.toLocaleString('fr-FR')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top départements — cross-link vers /rge/[service]/departement/[dept] */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
            Chercher par département
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
            Accédez à l’annuaire {label?.label ?? 'RGE'} de chaque département français pour couvrir
            les zones rurales et les communes où la densité d’artisans qualifiés est plus faible
            qu’en centre-ville.
          </p>
          <div className="flex flex-wrap gap-2">
            {departements.map((d) => (
              <Link
                key={d.slug}
                href={`/rge/${serviceSlug}/departement/${d.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sand-50 hover:bg-emerald-50 border border-charcoal-200 hover:border-emerald-300 rounded-full text-xs font-medium text-charcoal-700 hover:text-emerald-700 transition"
              >
                <span className="tabular-nums text-charcoal-400">{d.code}</span>
                <span>{d.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bénéfices rapide */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-start gap-3">
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">MaPrimeRénov&apos;</div>
              <div className="text-sm text-charcoal-600">
                Aide directe de l&apos;Anah, réservée aux travaux réalisés par un artisan RGE actif.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">Primes CEE</div>
              <div className="text-sm text-charcoal-600">
                Versées par les délégataires obligés (Effy, Sonergia, TotalEnergies, EDF).
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Percent className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold text-charcoal-900">TVA à 5,5 %</div>
              <div className="text-sm text-charcoal-600">
                Taux réduit sur la main-d&apos;œuvre et les matériaux des travaux énergétiques.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ contextualisée */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
          Questions fréquentes
        </h2>
        <p className="text-charcoal-600 mb-10 leading-relaxed">
          Tout ce qu&apos;il faut savoir avant de signer un devis avec un artisan RGE pour ce type
          de travaux.
        </p>
        <div className="space-y-4">
          {content.faq.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-300 transition p-6"
            >
              <summary className="font-heading font-bold text-lg text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-emerald-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-charcoal-700 mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-linking vers autres services RGE */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-6">
            Autres métiers énergétiques couverts par la mention RGE
          </h2>
          <div className="flex flex-wrap gap-2">
            {RGE_ALLOWED_SERVICES.filter((s) => s !== serviceSlug).map((s) => {
              const otherLabel = RGE_QUALIFICATION_LABELS[s]
              return (
                <Link
                  key={s}
                  href={`/rge/${s}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:border-emerald-400 hover:text-emerald-700 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  {otherLabel?.label ?? s}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTAs finaux */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">
            Prêt à lancer vos travaux avec un artisan RGE ?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Vérifiez la qualification d&apos;un artisan, demandez un devis gratuit et sans
            engagement, ou approfondissez le sujet avec nos guides éditoriaux.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Vérifier un artisan
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Retour au hub RGE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
