import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, ArrowRight, Building2, HelpCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getFAQSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'

const REG_AUTHOR = authors['sophie-martin']
const REG_REVIEWER = getReviewerForAuthor(REG_AUTHOR)
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import {
  regions,
  getRegionBySlug,
  services as allServices,
  getVillesByDepartement,
  parsePopulation,
} from '@/lib/data/france'
import { getProviderCountByRegion, formatProviderCount } from '@/lib/data/stats'
import { getRegionImage } from '@/lib/data/images'
import { generateRegionContent, hashCode } from '@/lib/seo/location-content'
import { getRegionPreposition, getRegionArticle } from '@/lib/geo-strings'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ region: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) return { title: 'Région non trouvée' }

  const metaContent = generateRegionContent(region)
  const deptCount = region.departments.length
  const cityCount = region.departments.reduce(
    (acc, d) => acc + getVillesByDepartement(d.code).length,
    0
  )
  const artisanCount = await getProviderCountByRegion(region.name)

  const titleHash = Math.abs(hashCode(`title-region-${region.slug}`))
  const countPrefix = artisanCount >= 100 ? `${formatProviderCount(artisanCount)} ` : ''
  const titleTemplates = [
    `${countPrefix}Artisans ${region.name} 2026 — Devis gratuit 24h`,
    `Artisan ${region.name} 2026 — ${deptCount} dép., ${cityCount} villes`,
    `${region.name} 2026 : ${countPrefix || 'artisans RGE certifiés'} — Devis`,
    `Artisans ${getRegionPreposition(region.name)} 2026 — Comparez ${countPrefix}`,
    `${region.name} 2026 — Annuaire ${countPrefix}artisans RGE certifiés`,
    `Artisans ${region.name} 2026`,
    `Artisans ${region.name}`,
  ]
  // maxLen 46 raw : +19 char brand suffix = ≤ 65 char rendu (Google SERP cutoff).
  const title = selectFittingTitle(titleTemplates, titleHash, 46)

  const descHash = Math.abs(hashCode(`desc-region-${region.slug}`))
  const artisanStr = artisanCount > 0 ? `${formatProviderCount(artisanCount)} artisans, ` : ''
  const descTemplates = [
    `Trouvez un artisan ${getRegionPreposition(region.name)}. ${artisanStr}${deptCount} départements, ${cityCount} villes. Devis gratuits.`,
    `${region.name} : ${artisanStr}annuaire d'artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC). ${metaContent.profile.geoLabel}, ${metaContent.profile.climateLabel.toLowerCase()}. Comparez les devis.`,
    `Artisans ${getRegionPreposition(region.name)} : ${cityCount} villes couvertes, ${allServices.length} corps de métier. ${artisanStr}${metaContent.profile.economyLabel}. Devis gratuit.`,
    `Tous les artisans ${getRegionArticle(region.name)}. ${artisanStr}${deptCount} départements, ${metaContent.profile.geoLabel.toLowerCase()}. Comparez gratuitement.`,
    `${region.name} — ${deptCount} dép., ${cityCount} villes${artisanCount > 0 ? `, ${formatProviderCount(artisanCount)} artisans` : ''}. ${metaContent.profile.climateLabel}. Devis gratuits en ligne.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const regionImage = getRegionImage(regionSlug)

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: getAlternates(`/regions/${regionSlug}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/regions/${regionSlug}`,
      images: [
        {
          url: regionImage.src,
          width: 1200,
          height: 630,
          alt: `Artisans ${getRegionPreposition(region.name)}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [regionImage.src],
    },
  }
}

export default async function RegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) notFound()

  const deptCount = region.departments.length
  const deptCitiesMap = Object.fromEntries(
    region.departments.map((dept) => [dept.code, getVillesByDepartement(dept.code)])
  )
  const allCities = region.departments
    .flatMap((dept) => deptCitiesMap[dept.code])
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
  const cityCount = allCities.length
  const content = generateRegionContent(region, cityCount)
  const regionArtisanCount = await getProviderCountByRegion(region.name)

  // Top 12 villes (population) — focal point keyword × city
  const topCities = allCities.slice(0, 12)

  // Voisines : 3-4 régions limitrophes (filtre simple : autre que celle-ci)
  const otherRegions = regions.filter((r) => r.slug !== regionSlug).slice(0, 6)

  // ── JSON-LD structured data — preserved in full ───────────────────────
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Régions', url: '/regions' },
    { name: region.name, url: `/regions/${regionSlug}` },
  ])
  const collectionSchema = getCollectionPageSchema({
    name: `Artisans ${getRegionPreposition(region.name)}`,
    description: `Trouvez un artisan RGE certifié ${getRegionPreposition(region.name)}. ${deptCount} départements, ${cityCount} villes couvertes.`,
    url: `/regions/${regionSlug}`,
    itemCount: cityCount,
  })

  const faqSchema = getFAQSchema(content.faqItems)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/regions/${regionSlug}#article`,
    headline: `Artisans ${getRegionPreposition(region.name)} — annuaire régional`,
    description: `Annuaire d'artisans ${getRegionPreposition(region.name)} : ${deptCount} départements, ${cityCount} villes, ${allServices.length} corps de métier. Profil régional, climat, économie locale.`,
    image: `${SITE_URL}/opengraph-image`,
    url: `${SITE_URL}/regions/${regionSlug}`,
    mainEntityOfPage: `${SITE_URL}/regions/${regionSlug}`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Annuaire territorial',
    keywords: [
      `artisans ${region.name}`,
      region.name,
      'annuaire régional',
      `${deptCount} départements`,
      `${cityCount} villes`,
      'France',
    ].join(', '),
    about: [
      { '@type': 'AdministrativeArea', name: region.name },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Thing', name: 'Annuaire artisans région' },
    ],
    datePublished: '2026-01-15T08:00:00+02:00',
    dateModified: monthlyAnchorIso(),
    author: REG_AUTHOR
      ? {
          '@type': 'Person',
          name: REG_AUTHOR.name,
          jobTitle: REG_AUTHOR.role,
          url: `${SITE_URL}/equipe/${REG_AUTHOR.slug}`,
          ...(REG_AUTHOR.methodology &&
            REG_AUTHOR.methodology.length > 0 && { skills: REG_AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(REG_REVIEWER && { reviewedBy: getReviewedByPersonSchema(REG_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints: string[] = [
    regionArtisanCount > 0
      ? `${formatProviderCount(regionArtisanCount)} artisan${regionArtisanCount > 1 ? 's' : ''} RGE référencé${regionArtisanCount > 1 ? 's' : ''} ${getRegionPreposition(region.name)}`
      : `${allServices.length} corps de métier disponibles ${getRegionPreposition(region.name)}`,
    `${deptCount} département${deptCount > 1 ? 's' : ''} · ${cityCount} ville${cityCount > 1 ? 's' : ''} couvertes`,
    `Profil : ${content.profile.climateLabel}, ${content.profile.geoLabel.toLowerCase()}`,
    `Devis gratuit en 24 h, sans engagement`,
  ]

  const tldrBullets: string[] = [
    `Annuaire d'artisans RGE ${getRegionArticle(region.name)} — ${deptCount} départements, ${cityCount} villes.`,
    `Profil régional : ${content.profile.climateLabel.toLowerCase()}, ${content.profile.geoLabel.toLowerCase()}.`,
    `Notre rôle : mise en relation gratuite avec un artisan RGE certifié, devis sous 24 h, sans engagement.`,
  ]

  // H1 keyword-first
  const h1Hash = Math.abs(hashCode(`h1-region-${region.slug}`))
  const h1Templates = [
    `Artisans RGE ${getRegionPreposition(region.name)}`,
    `Artisans RGE ${getRegionPreposition(region.name)} : annuaire par ville`,
    `${region.name} : artisans RGE par département`,
    `Artisans RGE certifiés ${getRegionPreposition(region.name)}`,
    `Tous les artisans RGE ${getRegionArticle(region.name)}`,
  ]
  const h1Text = h1Templates[h1Hash % h1Templates.length]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, articleSchema, collectionSchema, faqSchema]} />

      {/* Breadcrumb + Hero compact */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Régions', href: '/regions' }, { label: region.name }]} />
        </div>
      </div>

      <section className="bg-charcoal-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
          >
            {h1Text}
          </h1>
          <p className="mt-4 text-lg text-charcoal-300 max-w-2xl leading-relaxed">
            {content.profile.climateLabel}, {content.profile.geoLabel.toLowerCase()}.{' '}
            {allServices.length} corps de métier dans {deptCount} départements.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-charcoal-300">
            {regionArtisanCount > 0 && (
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" aria-hidden="true" />
                {formatProviderCount(regionArtisanCount)} artisan
                {regionArtisanCount > 1 ? 's' : ''} RGE
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Building2 className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
              {deptCount} département{deptCount > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
              {cityCount} ville{cityCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Article byline + En bref */}
        <section>
          <ArticleMeta
            author={SITE_NAME}
            datePublished="2026-01-15"
            dateModified={monthlyAnchorIso().slice(0, 10)}
            className="mb-4"
          />
          <EnBrefBox keyPoints={enBrefPoints} />
        </section>

        {/* CTA principal — gardé above-fold pour la conversion */}
        <GeoPageCTA
          title={`Besoin d'un artisan RGE ${getRegionPreposition(region.name)} ?`}
          subtitle="Devis gratuit et sans engagement d'artisans RGE certifiés"
        />

        {/* Top 12 villes — listing keyword-first */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-5 tracking-tight">
            Principales villes {getRegionArticle(region.name)}
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="list">
            {topCities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/villes/${city.slug}`}
                  className="block bg-white rounded-xl border border-sand-200 hover:border-primary-200 hover:shadow-card-hover px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
                >
                  <span className="block font-semibold text-charcoal-900 text-sm truncate">
                    Artisans {city.name}
                  </span>
                  <span className="block text-xs text-charcoal-500 mt-0.5">
                    {city.population} hab.
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Départements — listing simple */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-5 tracking-tight">
            Départements de la région {region.name}
          </h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
            {region.departments.map((dept) => (
              <li key={dept.code}>
                <Link
                  href={`/departements/${dept.slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl border border-sand-200 hover:border-primary-200 hover:shadow-card-hover px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
                >
                  <span className="w-10 h-10 bg-sand-100 rounded-lg flex items-center justify-center text-charcoal-700 font-bold text-sm flex-shrink-0">
                    {dept.code}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-charcoal-900 text-sm truncate">
                      {dept.name}
                    </span>
                    <span className="block text-xs text-charcoal-500">
                      {deptCitiesMap[dept.code].length} ville
                      {deptCitiesMap[dept.code].length > 1 ? 's' : ''}
                    </span>
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-charcoal-300 flex-shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* TL;DR pré-FAQ */}
        <section className="max-w-3xl">
          <TldrBlock bullets={tldrBullets} />
        </section>

        {/* FAQ — 4-5 questions max (Schema FAQPage déjà émis) */}
        {content.faqItems.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0" aria-hidden="true" />
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
                Questions fréquentes
              </h2>
            </div>
            <div className="space-y-3">
              {content.faqItems.slice(0, 5).map((faq, i) => (
                <details
                  key={i}
                  open={i === 0}
                  className="group bg-white rounded-xl border border-sand-200 p-5"
                >
                  <summary className="cursor-pointer list-none font-semibold text-charcoal-900">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm text-charcoal-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Voir aussi — autres régions (max 6) */}
        <section>
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 tracking-tight">
            Autres régions
          </h2>
          <ul className="flex flex-wrap gap-2" role="list">
            {otherRegions.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/regions/${r.slug}`}
                  className="inline-flex items-center gap-2 bg-white border border-sand-200 hover:border-primary-200 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* CTA final */}
      <section className="bg-charcoal-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            Besoin d'un artisan RGE {getRegionPreposition(region.name)} ?
          </h2>
          <p className="text-charcoal-400 mb-6 max-w-lg mx-auto">
            Devis gratuit et sans engagement d'artisans RGE certifiés.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-cta transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
          >
            Obtenir mon devis gratuit
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <GeoPageCTA variant="sticky-only" />
    </div>
  )
}
