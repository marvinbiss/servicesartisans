import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Search, Sparkles, ShieldCheck } from 'lucide-react'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { GeographicNavigation } from '@/components/InternalLinks'
import { GeographicSectionWrapper } from '@/components/home/GeographicSectionWrapper'
import { ClayHomePage } from '@/components/home/ClayHomePage'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { getSiteStats, getHomepageData, formatProviderCount } from '@/lib/data/stats'
import { getFAQSchema, getItemListSchema } from '@/lib/seo/jsonld'
import JsonLd from '@/components/JsonLd'
import { faqItems } from '@/lib/data/faq-data'
import { popularServices } from '@/lib/constants/navigation'
import { TOP_SERVICES, TOP_CITIES } from '@/lib/seo/top-pages'
import TrustBar from '@/components/conversion/TrustBar'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import dynamic from 'next/dynamic'

const SocialProofBanner = dynamic(() => import('@/components/SocialProofBanner'), { ssr: false })
const RecentSearches = dynamic(() => import('@/components/RecentSearches'), { ssr: false })
const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const { artisanCount: count } = await getSiteStats()
  const countStr = count > 0 ? `${formatProviderCount(count)}+` : "Des milliers d'"
  const absoluteTitle = `ServicesArtisans — Le 1er annuaire 100% artisans RGE certifiés`
  const metaDescription = `Le premier annuaire 100% artisans RGE certifiés en France : ${countStr} professionnels Qualibat, Qualifelec, QualiPAC pour vos travaux de rénovation énergétique. Éligibles MaPrimeRénov & CEE. Devis gratuit.`
  return {
    title: { absolute: absoluteTitle },
    description: metaDescription,
    alternates: getAlternates('/'),
    openGraph: {
      ...getOgDefaults(),
      title: absoluteTitle,
      description: metaDescription,
      type: 'website',
      url: SITE_URL,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'ServicesArtisans — Le 1er annuaire 100% artisans RGE certifiés',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle,
      description: metaDescription,
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default async function HomePage() {
  const [cmsPage, homepageData] = await Promise.all([
    getPageContent('homepage', 'homepage'),
    getHomepageData(),
  ])

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen">
        <h1 className="sr-only">
          {cmsPage.title ||
            'ServicesArtisans — le 1er annuaire 100% artisans RGE certifiés en France'}
        </h1>
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <CmsContent html={cmsPage.content_html} />
          </div>
        </section>
        <StickyMobileCTA ctaText="Devis gratuit en 30s" />
        <ExitIntentPopup />
      </div>
    )
  }

  const faqSchema = getFAQSchema(faqItems)
  const itemListSchema = getItemListSchema({
    name: 'Services artisans populaires en France',
    description: 'Les métiers du bâtiment les plus recherchés sur ServicesArtisans',
    url: '/services',
    items: popularServices.map((s, i) => ({
      name: s.name,
      url: `/services/${s.slug}`,
      position: i + 1,
    })),
  })
  const aggregateRatingSchema =
    homepageData.reviewCount > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'ServicesArtisans',
          url: SITE_URL,
          description: 'Le 1er annuaire 100% artisans RGE certifiés en France',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: homepageData.avgRating,
            reviewCount: homepageData.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : null
  const artisanCount = homepageData.artisanCount || 0
  const countStrSchema =
    artisanCount > 0 ? `${formatProviderCount(artisanCount)}+` : 'plusieurs milliers'
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': SITE_URL,
    url: SITE_URL,
    name: 'ServicesArtisans',
    description: `Le 1er annuaire 100% artisans RGE certifiés en France — ${countStrSchema} fiches qualifiées (Qualibat, Qualifelec, QualiPAC) éligibles MaPrimeRénov' et CEE.`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    about: { '@id': `${SITE_URL}#organization` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/opengraph-image`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL }],
    },
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[webPageSchema, faqSchema, itemListSchema, aggregateRatingSchema]} />

      {/* H1 visible above-fold — brand-first pour ranking exact match */}
      <header className="bg-white border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 py-5 md:py-6">
          <h1 className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 tracking-tight text-center md:text-left">
            ServicesArtisans — le 1<sup>er</sup> annuaire 100% artisans RGE certifiés
          </h1>
        </div>
      </header>

      <TrustBar />

      <ClayHomePage
        stats={homepageData}
        serviceCounts={homepageData.serviceCounts}
        topProviders={homepageData.topProviders}
        recentReviews={homepageData.recentReviews}
      />

      {/* RECENT SEARCHES + SOCIAL PROOF — bento clair */}
      <section className="bg-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-sand-50 border border-sand-200 p-6">
            <RecentSearches />
          </div>
          <div className="rounded-3xl bg-sand-50 border border-sand-200 p-6">
            <SocialProofBanner variant="card" />
          </div>
        </div>
      </section>

      {/* SIMULATEUR AIDES RÉNOVATION — bandeau dédié */}
      <section className="bg-sand-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SimulateurCTA variant="banner" />
        </div>
      </section>

      {/* SERVICE × VILLE MATRIX — bento aéré */}
      <section className="bg-white py-20 md:py-24 border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-bold tracking-[0.18em] uppercase mb-4">
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              Recherche rapide
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Trouvez un artisan RGE près de chez vous.
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Accès direct aux artisans RGE certifiés des grandes villes pour les métiers les plus
              demandés.
            </p>
          </div>

          <div className="rounded-3xl bg-sand-50 border border-sand-200 p-4 md:p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-charcoal-500 font-semibold text-xs uppercase tracking-wider border-b border-sand-300">
                    Métier
                  </th>
                  {TOP_CITIES.slice(0, 6).map((city) => (
                    <th
                      key={city.slug}
                      className="text-center py-3 px-2 text-charcoal-500 font-semibold text-xs uppercase tracking-wider border-b border-sand-300"
                    >
                      {city.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_SERVICES.map((service) => (
                  <tr key={service.slug} className="hover:bg-white transition-colors">
                    <td className="py-3 px-3 font-semibold text-charcoal-900 whitespace-nowrap border-b border-sand-200">
                      {service.name}
                    </td>
                    {TOP_CITIES.slice(0, 6).map((city, ci) => (
                      <td
                        key={city.slug}
                        className="py-3 px-2 text-center border-b border-sand-200"
                      >
                        <Link
                          href={`/services/${service.slug}/${city.slug}`}
                          className="text-primary-500 hover:text-primary-700 hover:underline transition-colors"
                        >
                          {ci % 3 === 0
                            ? `${service.name} ${city.name}`
                            : ci % 3 === 1
                              ? `à ${city.name}`
                              : city.name}
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TARIFS POPULAIRES — chips arrondis */}
      <section className="bg-sand-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold text-primary-500 tracking-[0.18em] uppercase mb-3">
              Tarifs par ville
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-3">
              Grilles tarifaires des métiers les plus demandés.
            </h2>
            <p className="text-charcoal-600 max-w-xl mx-auto">
              Tarifs moyens d&apos;artisans RGE certifiés, mis à jour chaque mois.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {TOP_SERVICES.slice(0, 6).map((service) =>
              TOP_CITIES.slice(0, 3).map((city) => (
                <Link
                  key={`tarif-${service.slug}-${city.slug}`}
                  href={`/services/${service.slug}/${city.slug}`}
                  className="flex items-center justify-center text-center px-4 py-3 text-sm text-charcoal-700 bg-white hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 rounded-2xl border border-sand-200 transition-colors"
                >
                  Tarif {service.name.toLowerCase()} {city.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* COUVERTURE NATIONALE */}
      <section className="bg-white py-20 border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GeographicSectionWrapper>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-accent-700 text-xs font-bold tracking-[0.18em] uppercase mb-4">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                Couverture nationale
              </span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-charcoal-900 mb-4">
                Artisans partout en France.
              </h2>
              <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
                Trouvez des professionnels RGE certifiés dans votre région, département ou ville.
              </p>
            </div>
            <GeographicNavigation />
          </GeographicSectionWrapper>
        </div>
      </section>

      {/* EXPLORER & RESSOURCES — chips */}
      <section className="bg-sand-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold text-primary-500 tracking-[0.18em] uppercase mb-3">
              Explorer
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-3">
              Préparer vos travaux.
            </h2>
            <p className="text-charcoal-600 max-w-xl mx-auto">
              Guides, tarifs, avis et outils pour bien choisir votre artisan.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { href: '/avis', label: 'Avis artisans' },
              { href: '/tarifs', label: 'Tarifs artisans' },
              { href: '/urgence', label: 'Urgence artisan' },
              { href: '/guides', label: 'Guides travaux' },
              { href: '/barometre', label: 'Baromètre prix' },
              { href: '/faq', label: 'FAQ' },
              { href: '/blog', label: 'Blog' },
              { href: '/carte-artisans', label: 'Carte des artisans' },
              { href: '/avant-apres', label: 'Avant / Après' },
              { href: '/badge-artisan', label: 'Badge Artisan' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-charcoal-700 bg-white hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 rounded-full border border-sand-200 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RÉNOVATION ÉNERGÉTIQUE — gros bento accent comme Hellio */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent-400/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-secondary-500/10 blur-3xl" />
          </div>

          <div className="relative px-6 md:px-12 lg:px-16 py-16 md:py-20">
            <div className="text-center mb-14 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-500/15 backdrop-blur-sm border border-secondary-400/30 text-sm font-medium text-secondary-200 mb-5">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Rénovation énergétique 2026
              </span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05] mb-5">
                Jusqu&apos;à 15 000 €
                <br className="hidden md:block" />{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-primary-300">
                  d&apos;aides pour vos travaux.
                </span>
              </h2>
              <p className="text-lg text-accent-100/95 leading-relaxed">
                Primes CEE, MaPrimeRénov&apos;, artisans RGE certifiés&nbsp;: tout pour financer
                votre rénovation énergétique.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/cee"
                className="group p-7 rounded-3xl bg-white/8 hover:bg-white/12 border border-white/15 backdrop-blur-sm transition-all hover:-translate-y-0.5"
              >
                <div className="text-xs font-semibold text-secondary-300 mb-2 uppercase tracking-wider">
                  19 opérations
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">Primes CEE 2026</h3>
                <p className="text-sm text-accent-100/85 leading-relaxed">
                  PAC, isolation, poêle, chaudière biomasse… Montants classiques et précarité par
                  opération.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-300 group-hover:gap-2.5 transition-all">
                  Voir le catalogue <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>

              <Link
                href="/cee/guides"
                className="group p-7 rounded-3xl bg-white/8 hover:bg-white/12 border border-white/15 backdrop-blur-sm transition-all hover:-translate-y-0.5"
              >
                <div className="text-xs font-semibold text-secondary-300 mb-2 uppercase tracking-wider">
                  10 guides détaillés
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">
                  Guides primes CEE
                </h3>
                <p className="text-sm text-accent-100/85 leading-relaxed">
                  Conditions techniques, cumul MaPrimeRénov&apos; et pièges à éviter, opération par
                  opération.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-300 group-hover:gap-2.5 transition-all">
                  Lire les guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>

              <Link
                href="/rge"
                className="group p-7 rounded-3xl bg-white/8 hover:bg-white/12 border border-white/15 backdrop-blur-sm transition-all hover:-translate-y-0.5"
              >
                <div className="text-xs font-semibold text-secondary-300 mb-2 uppercase tracking-wider">
                  Source ADEME
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">
                  Annuaire artisans RGE
                </h3>
                <p className="text-sm text-accent-100/85 leading-relaxed">
                  QualiPAC, QualiSol, QualiBois, Qualifelec, QualiPV — artisans RGE certifiés par
                  métier et par ville.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-300 group-hover:gap-2.5 transition-all">
                  Trouver un RGE <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>

              <Link
                href="/devenir-partenaire-cee"
                className="group p-7 rounded-3xl bg-gradient-to-br from-secondary-500/20 to-primary-500/15 hover:from-secondary-500/30 hover:to-primary-500/25 border border-secondary-400/40 backdrop-blur-sm transition-all hover:-translate-y-0.5 relative"
              >
                <span className="absolute top-4 right-4 px-2.5 py-0.5 bg-secondary-400 text-charcoal-900 text-2xs font-bold rounded-full uppercase tracking-wide">
                  Pro
                </span>
                <div className="text-xs font-semibold text-secondary-200 mb-2 uppercase tracking-wider">
                  Pour artisans BTP
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">
                  Devenir mandataire CEE
                </h3>
                <p className="text-sm text-secondary-100/90 leading-relaxed">
                  Touchez vos primes CEE 4× plus vite via Sonergia. Flux de chantiers RGE certifiés,
                  leads exclusifs.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-200 group-hover:gap-2.5 transition-all">
                  Devenir partenaire <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            </div>

            {/* Liens secondaires arrondis */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-12">
              {[
                { href: '/comparatif-primes-cee-2026', label: 'Comparatif primes CEE' },
                { href: '/leads-exclusifs-vs-partages', label: 'Leads exclusifs vs partagés' },
                { href: '/rge/qualifications', label: 'Qualifications RGE' },
                { href: '/rge/sources', label: 'Sources & méthodologie' },
                { href: '/ademe', label: 'Données ADEME' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-100 border border-white/20 bg-white/5 hover:bg-white/10 rounded-full transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL — bandeau primary */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-400/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
          </div>

          <div className="relative px-6 md:px-12 lg:px-20 py-16 md:py-20 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-medium text-white mb-5">
                <ShieldCheck className="w-4 h-4 text-secondary-300" aria-hidden="true" />
                Devis gratuit en 30 secondes
              </span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
                Prêt à lancer vos travaux&nbsp;?
              </h2>
              <p className="text-lg text-primary-50/95 leading-relaxed max-w-xl">
                Décrivez votre projet en 2 minutes, recevez un devis gratuit d&apos;un artisan RGE
                certifié de votre secteur. Lead exclusif, sans engagement.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-primary-700 font-bold shadow-cta hover:bg-sand-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500 focus-visible:ring-white"
              >
                Demander un devis
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-secondary-500 hover:bg-secondary-400 text-charcoal-900 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500 focus-visible:ring-secondary-300"
              >
                Voir les services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyMobileCTA ctaText="Devis gratuit en 30s" />
      <ExitIntentPopup />
    </div>
  )
}
