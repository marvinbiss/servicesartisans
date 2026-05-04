import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight, Users, Building2, ChevronRight, Globe } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { regions, departements, villes, services, getVillesByDepartement } from '@/lib/data/france'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { getPublishedDate } from '@/lib/seo/published-dates'

export const revalidate = 86400

const PUBLISHED_DATE = getPublishedDate('/regions')

export const metadata: Metadata = {
  title: 'Artisans par Région — 18 Régions',
  description:
    'Explorez les artisans référencés dans les 18 régions de France. Tous les corps de métier du bâtiment. Recherche gratuite, devis sans engagement.',
  alternates: getAlternates(`/regions`),
  openGraph: {
    title: 'Artisans par Région — 18 Régions',
    description:
      'Explorez les artisans référencés dans les 18 régions de France. Tous les corps de métier du bâtiment.',
    url: `${SITE_URL}/regions`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Artisans par région',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisans par Région — 18 Régions',
    description:
      'Explorez les artisans référencés dans les 18 régions de France. Tous les corps de métier du bâtiment.',
  },
}

export default async function RegionsIndexPage() {
  const cmsPage = await getPageContent('regions', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b border-sand-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">
              {cmsPage.title}
            </h1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <CmsContent html={cmsPage.content_html} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  const totalDepartments = regions.reduce((acc, r) => acc + r.departments.length, 0)

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Artisans par région en France',
    description: "Annuaire d'artisans référencés dans les 18 régions françaises.",
    url: `${SITE_URL}/regions`,
    numberOfItems: regions.length,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Régions' },
      ],
    },
  }

  const faqSchema = getFAQSchema([
    {
      question: 'Combien de régions sont couvertes ?',
      answer: `L'annuaire couvre les ${regions.length} régions de France, soit ${totalDepartments} départements et ${villes.length} villes. Chaque région dispose d'une page dédiée listant ses départements, villes principales et corps de métier disponibles.`,
    },
    {
      question: 'Les DOM-TOM sont-ils inclus ?',
      answer:
        "Oui. Les cinq régions d'outre-mer (Guadeloupe, Martinique, Guyane, La Réunion, Mayotte) sont intégrées à l'annuaire, avec les départements et artisans référencés localement. La couverture est cependant moins dense qu'en métropole en raison du nombre plus limité d'artisans ayant rejoint notre réseau.",
    },
    {
      question: 'Quelle région compte le plus d’artisans ?',
      answer:
        "L'Île-de-France, Auvergne-Rhône-Alpes et Provence-Alpes-Côte d'Azur sont les trois régions les plus densément couvertes en volume d'artisans référencés. Ces régions concentrent à la fois la plus forte demande de rénovation et les plus grands bassins d'emploi BTP.",
    },
    {
      question: 'Peut-on comparer les prix entre régions ?',
      answer:
        'Oui. Notre baromètre régional (/barometre/regions) publie un indice de prix (base 100 = moyenne nationale) par région et par corps de métier, actualisé trimestriellement à partir des devis signés de notre réseau. Les données sont publiées sous licence Creative Commons BY 4.0.',
    },
    {
      question: 'Comment un artisan peut-il référencer sa région ?',
      answer:
        "Un artisan ayant un SIRET actif peut revendiquer sa fiche ou ajouter son entreprise depuis /devenir-partenaire. Nous vérifions l'identité (SIREN INSEE), les qualifications RGE (via france-renov.gouv.fr) et la zone d'intervention déclarée. La fiche est ensuite visible dans toutes les villes couvertes par le rayon d'intervention.",
    },
  ])

  const dateModifiedIso = monthlyAnchorIso()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/regions#article`,
    headline: `${regions.length} régions de France — Annuaire artisans 2026`,
    description: `Annuaire artisans dans ${regions.length} régions, ${totalDepartments} départements et ${villes.length} villes. Données SIREN officielles, baromètre régional CC-BY 4.0.`,
    url: `${SITE_URL}/regions`,
    datePublished: PUBLISHED_DATE,
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Annuaire territorial',
    keywords: [
      'régions France',
      'annuaire artisans',
      'SIREN',
      'baromètre régional',
      `${regions.length} régions`,
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Country', name: 'France' },
      { '@type': 'Thing', name: 'Régions françaises' },
      { '@type': 'Thing', name: 'Annuaire artisans' },
    ],
    image: `${SITE_URL}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: 'Équipe éditoriale ServicesArtisans',
      url: `${SITE_URL}/a-propos`,
      '@id': `${SITE_URL}#organization`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/regions` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${regions.length} régions couvertes (métropole + 5 DOM)`,
    `${totalDepartments} départements, ${villes.length}+ villes`,
    `Identité vérifiée via SIREN INSEE + qualifications RGE`,
    `Baromètre régional indices prix CC-BY 4.0 trimestriel`,
  ]

  const tldrBullets = [
    `${regions.length} régions de France couvertes : ${totalDepartments} départements et ${villes.length}+ communes accessibles via leurs URLs canoniques.`,
    `DOM-TOM inclus (Guadeloupe, Martinique, Guyane, La Réunion, Mayotte) avec densité moindre qu'en métropole.`,
    `Île-de-France, Auvergne-Rhône-Alpes et PACA concentrent la plus forte densité d'artisans référencés.`,
    `Baromètre régional disponible sur /barometre/regions — indices de prix par métier et région, mis à jour trimestriellement.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[articleSchema, collectionPageSchema, faqSchema]} />

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,139,104,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.10) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          <div className="mb-10">
            <Breadcrumb
              items={[{ label: 'Régions' }]}
              className="text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-primary-400 [&_svg]:text-charcoal-600"
            />
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 backdrop-blur-sm rounded-full border border-accent-400/25 mb-6">
              <Globe className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-accent-200">Régions</span>
              <span className="w-1 h-1 rounded-full bg-accent-400/50" />
              <span className="text-sm font-medium text-white/90">
                France métropolitaine et outre-mer
              </span>
            </div>

            <h1
              data-speakable="true"
              className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold mb-6 tracking-[-0.025em] leading-[1.08]"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-300 to-primary-300">
                {regions.length} régions
              </span>
              , un réseau national
            </h1>
            <p className="text-lg md:text-xl text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
              Des artisans référencés via les données SIREN dans toutes les régions de France.
              Explorez l'annuaire des artisans du bâtiment.
            </p>
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10">
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <Globe className="w-5 h-5 text-accent-400" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">{regions.length}</div>
                <div className="text-xs text-charcoal-400">Régions</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <Building2 className="w-5 h-5 text-primary-400" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">{totalDepartments}</div>
                <div className="text-xs text-charcoal-400">Départements</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <Users className="w-5 h-5 text-accent-300" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">SIREN</div>
                <div className="text-xs text-charcoal-400">Données officielles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Byline + En bref + TL;DR — E-E-A-T DOM signal post-hero */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <ArticleMeta
            author="Équipe éditoriale ServicesArtisans"
            authorHref="/a-propos"
            datePublished={PUBLISHED_DATE}
            dateModified={dateModifiedIso}
          />
          <EnBrefBox keyPoints={enBrefPoints} />
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* ─── REGIONS GRID ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-charcoal-900 mb-3 tracking-tight">
            Choisissez votre région
          </h2>
          <p className="text-charcoal-500 max-w-lg mx-auto">
            Chaque région dispose d'artisans qualifiés pour tous vos projets de travaux.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {regions.map((region) => {
            const deptCount = region.departments.length
            const cityCount = region.departments.reduce(
              (acc, d) => acc + getVillesByDepartement(d.code).length,
              0
            )

            return (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="bg-white rounded-2xl border border-sand-300 p-6 shadow-soft hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-charcoal-900 group-hover:text-primary-400 transition-colors tracking-tight">
                      {region.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-sand-100 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-charcoal-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <p className="text-sm text-charcoal-500 mb-4 line-clamp-2 leading-relaxed">
                  {region.description}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-charcoal-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>
                      {deptCount} département{deptCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-charcoal-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {cityCount} ville{cityCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Preview cities */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-sand-200">
                  {region.departments
                    .flatMap((d) => getVillesByDepartement(d.code))
                    .slice(0, 4)
                    .map((city) => (
                      <span
                        key={city.slug}
                        className="text-xs bg-sand-200 text-charcoal-700 px-2.5 py-1 rounded-full group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors"
                      >
                        {city.name}
                      </span>
                    ))}
                  {cityCount > 4 && (
                    <span className="text-xs text-charcoal-400 px-2 py-1">+{cityCount - 4}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(232,107,75,0.12) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
            Besoin d'un artisan ?
          </h2>
          <p className="text-charcoal-400 mb-8 max-w-lg mx-auto">
            Décrivez votre projet et recevez des devis gratuits de professionnels référencés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-primary-400 text-white font-semibold px-8 py-3.5 rounded-xl shadow-cta hover:bg-primary-500 hover:-translate-y-0.5 transition-all duration-300"
            >
              Obtenir mon devis gratuit
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-charcoal-300 hover:text-white font-medium transition-colors"
            >
              Voir les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO INTERNAL LINKS ─────────────────────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-semibold text-charcoal-900 mb-8 tracking-tight">
            Explorer également
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Departements */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Départements populaires
              </h3>
              <div className="space-y-2">
                {departements.slice(0, 8).map((d) => (
                  <Link
                    key={d.slug}
                    href={`/departements/${d.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {d.name} ({d.code})
                  </Link>
                ))}
              </div>
              <Link
                href="/departements"
                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3"
              >
                Tous les départements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Villes */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Grandes villes
              </h3>
              <div className="space-y-2">
                {villes.slice(0, 12).map((v) => (
                  <Link
                    key={v.slug}
                    href={`/villes/${v.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Artisans à {v.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/villes"
                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3"
              >
                Toutes les villes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Services populaires
              </h3>
              <div className="space-y-2">
                {services.slice(0, 8).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3"
              >
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion: Sticky mobile CTA + Exit intent */}
      <GeoPageCTA variant="sticky-only" />
    </div>
  )
}
