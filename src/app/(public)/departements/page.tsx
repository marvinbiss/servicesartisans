import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, MapPin, Users, ChevronRight, Map } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { departements, regions, villes, services } from '@/lib/data/france'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { getProviderCount, formatProviderCount } from '@/lib/data/stats'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Artisans par Département',
  description:
    "Annuaire d'artisans référencés dans les 101 départements français. Trouvez un professionnel qualifié près de chez vous. Devis gratuits, sans engagement.",
  alternates: getAlternates(`/departements`),
  openGraph: {
    title: 'Artisans par Département — 101 Départements',
    description:
      "Annuaire d'artisans référencés dans les 101 départements français. Trouvez un professionnel qualifié près de chez vous.",
    url: `${SITE_URL}/departements`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Artisans par département',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisans par Département — 101 Départements',
    description:
      "Annuaire d'artisans référencés dans les 101 départements français. Trouvez un professionnel qualifié près de chez vous.",
  },
}

const deptsByRegion = departements.reduce(
  (acc, dept) => {
    if (!acc[dept.region]) acc[dept.region] = []
    acc[dept.region].push(dept)
    return acc
  },
  {} as Record<string, typeof departements>
)

// Sort regions alphabetically
const sortedRegions = Object.entries(deptsByRegion).sort((a, b) => a[0].localeCompare(b[0]))

export default async function DepartementsIndexPage() {
  const [cmsPage, artisanCount] = await Promise.all([
    getPageContent('departements', 'static'),
    getProviderCount(),
  ])

  // JSON-LD : breadcrumb + CollectionPage + FAQ (cible rich snippet "People
  // also ask" sur requêtes "artisans département france").
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Départements', url: '/departements' },
  ])
  const collectionPageSchema = getCollectionPageSchema({
    name: `Artisans par département — 101 départements français`,
    description: `Annuaire de ${formatProviderCount(artisanCount)} artisans référencés dans les 101 départements métropolitains et d'outre-mer.`,
    url: '/departements',
    itemCount: departements.length,
  })
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Annuaire artisans par département — 101 départements français',
    description: `Annuaire de ${formatProviderCount(artisanCount)} artisans référencés dans les 101 départements métropolitains et d'outre-mer. Recherche par région, métier et département.`,
    image: `${SITE_URL}/opengraph-image`,
    url: `${SITE_URL}/departements`,
    mainEntityOfPage: `${SITE_URL}/departements`,
    inLanguage: 'fr-FR',
    datePublished: '2026-01-15T08:00:00+02:00',
    dateModified: monthlyAnchorIso(),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints: string[] = [
    `${departements.length} départements couverts (96 métropolitains + 5 DROM)`,
    `${formatProviderCount(artisanCount)} artisans référencés en France`,
    `${regions.length} régions · ${services.length} corps de métier`,
    `Vérification SIRET INSEE + qualifications RGE ADEME synchronisées quotidiennement`,
  ]

  const tldrBullets: string[] = [
    `${departements.length} départements français couverts (métropole + DROM 971/972/973/974/976) — annuaire de ${formatProviderCount(artisanCount)} artisans référencés.`,
    `Sélectionner un département → page dédiée listant les artisans par métier (plombier, électricien, chauffagiste, menuisier...) avec coordonnées + certifications RGE + avis vérifiés.`,
    `Sources : SIRENE INSEE (vérification SIRET), ADEME (qualifications RGE), data.gouv.fr (DVF, Géorisques, Météo-France) — synchronisation quotidienne.`,
    `Notre rôle : mise en relation gratuite avec un artisan vérifié, devis sous 24 h, sans engagement.`,
  ]

  const faqSchema = getFAQSchema([
    {
      question: 'Comment trouver un artisan dans mon département ?',
      answer: `Sélectionnez votre département dans la liste ci-dessus (classement par région). La page départementale liste les artisans par métier (plombier, électricien, chauffagiste, menuisier...) avec leurs coordonnées, certifications RGE et avis vérifiés. ${SITE_NAME} synchronise quotidiennement les bases SIRENE et ADEME pour garantir l'exactitude des données.`,
    },
    {
      question: "Combien d'artisans sont référencés sur ServicesArtisans ?",
      answer: `${formatProviderCount(artisanCount)} artisans actifs sont référencés dans les 101 départements français métropolitains et d'outre-mer. Toutes les entreprises sont vérifiées via leur numéro SIRET à l'INSEE et, pour celles certifiées RGE, via la base officielle de l'ADEME (france-renov.gouv.fr).`,
    },
    {
      question: 'Les artisans sont-ils certifiés RGE ?',
      answer: `Environ 50 000 artisans référencés sont certifiés RGE (Reconnu Garant de l'Environnement). Cette certification est obligatoire pour bénéficier de MaPrimeRénov', des primes CEE et de la TVA réduite 5,5 % sur les travaux d'économies d'énergie. Filtrez par département + métier + RGE pour trouver un artisan éligible aux aides.`,
    },
    {
      question: "Les départements d'outre-mer sont-ils couverts ?",
      answer: `Oui, les 5 DROM (Guadeloupe 971, Martinique 972, Guyane 973, La Réunion 974, Mayotte 976) sont couverts avec un annuaire d'artisans locaux. Les barèmes d'aides (MaPrimeRénov', CEE) sont adaptés aux spécificités ultramarines : zones climatiques C1/C2/C3 distinctes, plafonds de ressources majorés.`,
    },
  ])

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={[
            breadcrumbSchema,
            articleSchema,
            collectionPageSchema,
            ...(faqSchema ? [faqSchema] : []),
          ]}
        />
        <section className="bg-white border-b border-sand-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">{cmsPage.title}</h1>
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

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          breadcrumbSchema,
          articleSchema,
          collectionPageSchema,
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,139,104,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.12) 0%, transparent 50%)',
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
              items={[{ label: 'Départements' }]}
              className="text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-primary-400 [&_svg]:text-charcoal-600"
            />
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 backdrop-blur-sm rounded-full border border-accent-400/25 mb-6">
              <Map className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-accent-200">Départements</span>
              <span className="w-1 h-1 rounded-full bg-accent-400/50" />
              <span className="text-sm font-medium text-white/90">
                Couverture nationale complète
              </span>
            </div>

            <h1
              className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold mb-6 tracking-[-0.025em] leading-[1.08]"
              data-speakable="true"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-300 to-primary-300">
                {departements.length}
              </span>{' '}
              départements couverts
            </h1>
            <p className="text-lg md:text-xl text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
              {artisanCount > 0
                ? `${formatProviderCount(artisanCount)} artisans référencés`
                : "Des milliers d'artisans référencés"}{' '}
              dans tous les départements français. Recherche gratuite, devis sans engagement.
            </p>
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10">
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <Building2 className="w-5 h-5 text-accent-400" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">{departements.length}</div>
                <div className="text-xs text-charcoal-400">Départements</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <MapPin className="w-5 h-5 text-primary-400" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">{regions.length}</div>
                <div className="text-xs text-charcoal-400">Régions</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <Users className="w-5 h-5 text-accent-300" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">
                  {artisanCount > 0 ? formatProviderCount(artisanCount) : '—'}
                </div>
                <div className="text-xs text-charcoal-400">Artisans référencés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Article byline + En bref — E-E-A-T DOM signals + FS Position 0 ── */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ArticleMeta
            author={SITE_NAME}
            datePublished="2026-01-15"
            dateModified={monthlyAnchorIso().slice(0, 10)}
            className="mb-5"
          />
          <EnBrefBox keyPoints={enBrefPoints} />
        </div>
      </section>

      {/* ─── DEPARTMENTS BY REGION ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-charcoal-900 mb-3 tracking-tight">
            Tous les départements par région
          </h2>
          <p className="text-charcoal-500 max-w-lg mx-auto">
            Sélectionnez un département pour accéder aux artisans de votre secteur.
          </p>
        </div>

        {sortedRegions.map(([region, regionDepts]) => (
          <section key={region} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-accent-600" />
              </div>
              <h3 className="font-heading text-lg font-bold text-charcoal-900 tracking-tight">
                {region}
              </h3>
              <span className="text-sm text-charcoal-500 font-medium">
                ({regionDepts.length} départements)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {regionDepts.map((dept) => (
                <Link
                  key={dept.slug}
                  href={`/departements/${dept.slug}`}
                  className="flex items-center gap-3 bg-white rounded-2xl border border-sand-300 p-4 hover:border-primary-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl flex items-center justify-center text-accent-700 font-bold text-sm flex-shrink-0 group-hover:from-primary-50 group-hover:to-primary-100 group-hover:text-primary-600 transition-colors">
                    {dept.code}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-charcoal-800 group-hover:text-primary-400 transition-colors block truncate">
                      {dept.name}
                    </span>
                    <span className="text-xs text-charcoal-500">{dept.population} hab.</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ─── TL;DR pré-CTA — capture FS Position 0 / AI Overviews ──── */}
      <section className="bg-white border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

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
            {/* Regions */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Par région
              </h3>
              <div className="space-y-2">
                {regions.slice(0, 8).map((r) => (
                  <Link
                    key={r.slug}
                    href={`/regions/${r.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Artisans en {r.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/regions"
                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3"
              >
                Toutes les régions <ArrowRight className="w-4 h-4" />
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
