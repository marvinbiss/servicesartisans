import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle,
  Euro,
  Shield,
  ChevronDown,
  TrendingUp,
  Clock,
  MapPin,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getSpeakableSchema,
  getHowToSchema,
  getServicePricingSchema,
  getDetailedPricingSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import { authors as personAuthors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { hashCode } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getDefaultAuthor } from '@/lib/data/team'
import { villes } from '@/lib/data/france'
import { getServiceImage } from '@/lib/data/images'
import { getPageContent } from '@/lib/cms'
import { getDynamicLastModifiedByService } from '@/lib/seo/dynamic-lastmod'
import { CmsContent } from '@/components/CmsContent'
import { SpeakableAnswerBox } from '@/components/SpeakableAnswerBox'
import PriceTableHTML from '@/components/seo/PriceTableHTML'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'
import TopCitiesGrid from '@/components/seo/TopCitiesGrid'
import ServiceQuestions from '@/components/seo/ServiceQuestions'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'
import dynamic from 'next/dynamic'
import { getPublishedDate } from '@/lib/seo/published-dates'

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})

const tradeSlugs = getTradesSlugs()

const REGIONAL_PRICING = [
  { region: 'Île-de-France', multiplier: 1.25, label: 'Paris et banlieue' },
  { region: 'PACA', multiplier: 1.1, label: "Côte d'Azur et Provence" },
  { region: 'Auvergne-Rhône-Alpes', multiplier: 1.1, label: 'Lyon, Grenoble, Annecy' },
  { region: 'Occitanie', multiplier: 1.05, label: 'Toulouse, Montpellier' },
  { region: 'Nouvelle-Aquitaine', multiplier: 1.0, label: 'Bordeaux, Limoges' },
  { region: 'Hauts-de-France', multiplier: 0.95, label: 'Lille, Amiens' },
  { region: 'Grand Est', multiplier: 0.95, label: 'Strasbourg, Metz' },
  { region: 'Bretagne', multiplier: 1.0, label: 'Rennes, Brest' },
]

export function generateStaticParams() {
  return tradeSlugs.map((service) => ({ service }))
}

export const dynamicParams = true
export const revalidate = 86400

/** Truncate title to maxLen chars on a word boundary, preserving trailing '?' */
function truncateTitle(title: string, maxLen = 41): string {
  if (title.length <= maxLen) return title
  const endsWithQuestion = title.trimEnd().endsWith('?')
  const truncated = title.slice(0, maxLen - (endsWithQuestion ? 2 : 1)).replace(/\s+\S*$/, '')
  return endsWithQuestion ? truncated + ' ?' : truncated + '…'
}

const PUBLISHED_DATE = getPublishedDate('/tarifs/[service]')

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>
}): Promise<Metadata> {
  const { service } = await params
  const trade = tradeContent[service]
  if (!trade) return {}

  // SEO overrides for high-impression pages (GSC CTR optimization)
  // Format: question + 2026 + CTA. Covers top high-volume services from GSC.
  const metaOverrides: Record<string, { title: string; description: string }> = {
    electricien: {
      title: 'Combien coûte un électricien en 2026 ? Grille + Devis Gratuit',
      description:
        'Grille tarifaire complète électricien 2026 : prix installation, rénovation, dépannage. Estimez votre budget et obtenez un devis gratuit.',
    },
    plombier: {
      title: 'Combien coûte un plombier en 2026 ? Prix + Devis Gratuit',
      description:
        'Tous les tarifs plombier 2026 : intervention urgente, installation sanitaire, chauffe-eau. Comparez et recevez un devis gratuit sans engagement.',
    },
    chauffagiste: {
      title: 'Tarif chauffagiste 2026 : combien ça coûte ? + Devis Gratuit',
      description:
        'Prix chauffagiste 2026 : installation chaudière, entretien, dépannage. Comparez les devis gratuits et choisissez un artisan RGE certifié (Qualibat, QualiPAC).',
    },
    menuisier: {
      title: 'Combien coûte un menuisier en 2026 ? Prix + Devis Gratuit',
      description:
        'Tarifs menuisier 2026 : portes, fenêtres, escaliers, agencement. Grille complète + devis gratuit sans engagement en 2 min.',
    },
    'peintre-en-batiment': {
      title: 'Prix peintre en bâtiment 2026 : tarif au m² + Devis Gratuit',
      description:
        'Tarifs peintre 2026 : prix au m², rafraîchissement, rénovation complète. Comparez les devis gratuits et obtenez un résultat impeccable.',
    },
    couvreur: {
      title: 'Combien coûte un couvreur en 2026 ? Prix + Devis Gratuit',
      description:
        'Tarifs couvreur 2026 : réfection toiture, isolation, démoussage. Comparez les devis gratuits et choisissez un artisan RGE certifié (Qualibat) et assuré.',
    },
    macon: {
      title: 'Tarif maçon 2026 : prix au m² + prestations + Devis Gratuit',
      description:
        'Prix maçon 2026 : gros œuvre, extension, rénovation. Grille tarifaire complète par prestation + devis gratuit en 2 min.',
    },
    'pompe-a-chaleur': {
      title: 'Prix pompe à chaleur 2026 : aides + tarifs + Devis Gratuit',
      description:
        'Coût pompe à chaleur 2026 : air-eau, air-air, géothermie. Aides CEE + MaPrimeRénov calculées. Devis gratuit chez artisan RGE.',
    },
  }

  if (metaOverrides[service]) {
    const override = metaOverrides[service]
    const serviceImage = getServiceImage(service)
    return {
      title: override.title,
      description: override.description,
      alternates: getAlternates(`/tarifs/${service}`),
      openGraph: {
        ...getOgDefaults(),
        locale: 'fr_FR',
        title: override.title,
        description: override.description,
        url: `${SITE_URL}/tarifs/${service}`,
        type: 'website',
        siteName: 'ServicesArtisans',
        images: [{ url: serviceImage.src, width: 800, height: 600, alt: `Tarifs ${trade.name}` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: override.title,
        description: override.description,
      },
    }
  }

  const tradeLower = trade.name.toLowerCase()

  const priceMin = trade.priceRange.min
  const priceMax = trade.priceRange.max
  const unit = trade.priceRange.unit

  const titleHash = Math.abs(hashCode(`tarif-title-${service}`))
  const titleTemplates = [
    `Combien coûte un ${tradeLower} en 2026 ? ${priceMin}–${priceMax}${unit}`,
    `Prix ${trade.name} 2026 : combien prévoir ? ${priceMin}–${priceMax}${unit}`,
    `Quel est le tarif d'un ${tradeLower} en 2026 ? Grille complète`,
    `${trade.name} : quel budget en 2026 ? ${priceMin}–${priceMax}${unit}`,
    `Tarif ${tradeLower} 2026 : combien ça coûte vraiment ?`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`tarif-desc-${service}`))
  const descTemplates = [
    `Tarifs ${tradeLower} 2026 : ${priceMin} à ${priceMax} ${unit}. Prix par prestation, écarts régionaux et devis gratuit en 2 min.`,
    `Prix ${tradeLower} en 2026 : de ${priceMin} à ${priceMax} ${unit}. Grille tarifaire complète + comparatif par région. Devis gratuit.`,
    `Combien coûte un ${tradeLower} en 2026 ? ${priceMin}–${priceMax} ${unit}. Barème détaillé et devis sans engagement.`,
    `${trade.name} : ${priceMin} à ${priceMax} ${unit} en 2026. Comparez les prix par prestation et obtenez un devis gratuit.`,
    `Tarifs ${tradeLower} 2026 : ${priceMin}–${priceMax} ${unit}. Prix par intervention, variations régionales. Devis gratuit en ligne.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImage(service)

  return {
    title,
    description,
    alternates: getAlternates(`/tarifs/${service}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/tarifs/${service}`,
      type: 'website',
      siteName: 'ServicesArtisans',
      images: [{ url: serviceImage.src, width: 800, height: 600, alt: `Tarifs ${trade.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

const topCities = villes.slice(0, 20)

export default async function TarifsServicePage({
  params,
}: {
  params: Promise<{ service: string }>
}) {
  const { service } = await params

  const cmsPage = await getPageContent(service + '-tarifs', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeroH1 size="article">{cmsPage.title}</PageHeroH1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <CmsContent html={cmsPage.content_html} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  const trade = tradeContent[service]
  if (!trade) notFound()

  const lastModified = await getDynamicLastModifiedByService(service)

  const author = getDefaultAuthor()
  // Tier 3 2026-05-04 — bascule Person claire-dubois (prix/baromètres) si
  // disponible, fallback sur l'équipe éditoriale historique. reviewedBy =
  // sophie-martin via cross-review map.
  const richAuthor = personAuthors['claire-dubois']
  const richReviewer = getReviewerForAuthor(richAuthor)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Tarifs artisans', url: '/tarifs' },
    { name: `Tarifs ${trade.name.toLowerCase()}`, url: `/tarifs/${service}` },
  ])

  const faqSchema = getFAQSchema(trade.faq.map((f) => ({ question: f.q, answer: f.a })))

  const tradeLower = trade.name.toLowerCase()

  const serviceSchema = getServicePricingSchema({
    serviceName: trade.name,
    serviceSlug: service,
    description: `Guide des tarifs ${tradeLower} 2026. Prix horaire, tarifs par prestation et variations régionales.`,
    lowPrice: trade.priceRange.min,
    highPrice: trade.priceRange.max,
    priceCurrency: 'EUR',
    priceUnit: trade.priceRange.unit,
    offerCount: trade.commonTasks.length,
    url: `${SITE_URL}/tarifs/${service}`,
  })

  const pricingItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tarifs ${trade.name} en France`,
    description: `Liste des prestations et prix indicatifs pour ${trade.name}`,
    numberOfItems: trade.commonTasks.length,
    itemListElement: trade.commonTasks.map((task, i) => {
      const parts = task.split(':')
      const name = parts[0].trim()
      return {
        '@type': 'ListItem',
        position: i + 1,
        name,
        url: `${SITE_URL}/tarifs/${service}`,
      }
    }),
  }

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Tarifs ${trade.name} par ville`,
    description: `Guide des tarifs ${trade.name.toLowerCase()} 2026 par ville. Prix horaire : ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}.`,
    url: `${SITE_URL}/tarifs/${service}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: topCities.map((ville, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `Tarifs ${trade.name.toLowerCase()} à ${ville.name}`,
        url: `${SITE_URL}/services/${service}/${ville.slug}`,
      })),
    },
  }

  const speakableSchema = getSpeakableSchema({
    url: `${SITE_URL}/tarifs/${service}`,
    title: `Tarifs ${trade.name.toLowerCase()} en France`,
  })

  const tradeLowerHowTo = trade.name.toLowerCase()
  const howToSchema = getHowToSchema(
    [
      {
        name: 'Comparer les tarifs moyens',
        text: `Consultez notre grille tarifaire pour connaître les prix moyens d'un ${tradeLowerHowTo} en France : ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}.`,
      },
      {
        name: 'Vérifier les qualifications',
        text: `Assurez-vous que le ${tradeLowerHowTo} possède un numéro SIRET valide et les certifications requises${trade.certifications.length > 0 ? ` (${trade.certifications[0]})` : ''}.`,
      },
      {
        name: 'Demander plusieurs devis',
        text: `Comparez au moins 3 devis détaillés de ${tradeLowerHowTo}s différents. Vérifiez que chaque devis inclut le détail des fournitures, la main-d'œuvre et les éventuels frais de déplacement.`,
      },
      {
        name: 'Choisir le meilleur rapport qualité-prix',
        text: `Ne choisissez pas uniquement le moins cher. Privilégiez un ${tradeLowerHowTo} avec de bons avis clients, une assurance décennale à jour et un devis clair et détaillé.`,
      },
    ],
    {
      name: `Comment trouver un ${tradeLowerHowTo} au meilleur prix`,
      description: `Guide étape par étape pour comparer les tarifs et choisir un ${tradeLowerHowTo} qualifié au meilleur rapport qualité-prix en France.`,
    }
  )

  // Schema détaillé avec PriceSpecification par prestation
  const parsedTasks = trade.commonTasks
    .map((task) => {
      const parts = task.split(':')
      const name = parts[0].trim()
      // Extraire les prix min/max du texte (ex: "80 à 250 €")
      const priceMatch = task.match(/(\d[\d\s]*)\s*(?:à|–|-)\s*(\d[\d\s]*)\s*€/)
      if (priceMatch) {
        return {
          name,
          lowPrice: parseInt(priceMatch[1].replace(/\s/g, ''), 10),
          highPrice: parseInt(priceMatch[2].replace(/\s/g, ''), 10),
          unit: 'intervention',
        }
      }
      return null
    })
    .filter(
      (t): t is { name: string; lowPrice: number; highPrice: number; unit: string } => t !== null
    )

  const detailedPricingSchema =
    parsedTasks.length > 0
      ? getDetailedPricingSchema({
          serviceName: trade.name,
          serviceSlug: service,
          description: `Tarifs détaillés ${tradeLower} 2026 : ${parsedTasks.length} prestations avec prix indicatifs.`,
          url: `${SITE_URL}/tarifs/${service}`,
          tasks: parsedTasks,
          overallLowPrice: trade.priceRange.min,
          overallHighPrice: trade.priceRange.max,
          priceUnit: trade.priceRange.unit,
        })
      : null

  const otherTrades = tradeSlugs.filter((s) => s !== service).slice(0, 4)

  const dateModifiedIso = monthlyAnchorIso()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/tarifs/${service}#article`,
    headline: truncateTitle(`Tarifs ${tradeLower} 2026 — Prix en France`, 110),
    description: `Guide tarif ${tradeLower} 2026 : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}, ${parsedTasks.length || trade.commonTasks.length} prestations, multiplicateur régional, méthodologie chiffrée.`,
    url: `${SITE_URL}/tarifs/${service}`,
    datePublished: PUBLISHED_DATE,
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Tarifs artisans',
    keywords: [
      `tarif ${tradeLower}`,
      `prix ${tradeLower}`,
      'France',
      'fourchette tarifs',
      'multiplicateur régional',
      'méthodologie',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Service', name: trade.name },
      { '@type': 'Thing', name: `Tarifs ${tradeLower}` },
      { '@type': 'Country', name: 'France' },
    ],
    ...spreadCitationsForTopics(`tarifs ${tradeLower} ${trade.name}`),
    image: getServiceImage(service).src,
    author: richAuthor
      ? {
          '@type': 'Person',
          name: richAuthor.name,
          jobTitle: richAuthor.role,
          url: `${SITE_URL}/equipe/${richAuthor.slug}`,
          ...(richAuthor.methodology &&
            richAuthor.methodology.length > 0 && { skills: richAuthor.methodology }),
        }
      : {
          '@type': 'Person',
          name: author.name,
          jobTitle: author.role,
          url: `${SITE_URL}/a-propos#${author.slug ?? 'equipe'}`,
        },
    ...(richReviewer && { reviewedBy: getReviewedByPersonSchema(richReviewer) }),
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/tarifs/${service}` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `Prix ${tradeLower} : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit} (${new Date().getFullYear()})`,
    `${trade.commonTasks.length} prestations détaillées avec fourchettes`,
    `Multiplicateur régional : Île-de-France ×1,25 — Hauts-de-France ×0,95`,
    `Tarifs vérifiés par ${author.name}, ${author.role.toLowerCase()}`,
  ]

  const tldrBullets = [
    `Tarif ${tradeLower} en France : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit} en ${new Date().getFullYear()}, fourchette indicative incluant main-d'œuvre.`,
    `Prix ajusté selon la région : Paris/IdF +25 %, PACA/Auvergne-Rhône-Alpes +10 %, Hauts-de-France/Grand Est −5 %.`,
    `${trade.commonTasks.length} prestations isolées disponibles avec leurs fourchettes propres (intervention, ${trade.priceRange.unit}).`,
    `Comparer 3 devis détaillés (matériaux, MO, déplacement) avant signature ; vérifier SIRET + assurance décennale.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          articleSchema,
          breadcrumbSchema,
          faqSchema,
          serviceSchema,
          pricingItemListSchema,
          collectionPageSchema,
          speakableSchema,
          howToSchema,
          detailedPricingSchema,
        ]}
      />

      {/* Hero */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(61,139,104,0.08) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[
              { label: 'Tarifs artisans', href: '/tarifs' },
              { label: `Tarifs ${trade.name.toLowerCase()}` },
            ]}
            className="mb-6 text-sand-400 [&_a]:text-sand-400 [[&_a:hover]:text-white_a:hover]:text-white [&_svg]:text-sand-600"
          />
          <div className="text-center">
            <h1
              data-speakable="true"
              className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
            >
              {(() => {
                const h1Hash = Math.abs(hashCode(`tarif-h1-${service}`))
                const tradeLower = trade.name.toLowerCase()
                const h1Templates = [
                  `Tarifs ${tradeLower} en France — Guide 2026`,
                  `Prix ${tradeLower} en 2026 : tarif horaire et devis`,
                  `${trade.name} : tarifs et prix en France (2026)`,
                  `Tarifs ${tradeLower} 2026 : prix et coûts`,
                  `${trade.name} : prix et tarifs en 2026`,
                ]
                return h1Templates[h1Hash % h1Templates.length]
              })()}
            </h1>
            <p className="text-xl text-sand-400 max-w-3xl mx-auto mb-4">
              Guide complet des prix {trade.name.toLowerCase()} en France. Tarif horaire :{' '}
              {trade.priceRange.min} à {trade.priceRange.max} {trade.priceRange.unit}.
            </p>
            <LastUpdated
              label="Tarifs vérifiés et mis à jour le"
              date={lastModified}
              className="justify-center text-sand-500 mb-4"
            />
            <p className="text-sm text-sand-500">
              Tarifs vérifiés par{' '}
              <Link href="/a-propos" className="underline hover:text-white transition-colors">
                {author.name}
              </Link>
              , {author.role.toLowerCase()}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Euro className="w-4 h-4 text-secondary-400" />
                <span>Prix actualisés 2026</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <TrendingUp className="w-4 h-4 text-secondary-400" />
                <span>{trade.commonTasks.length} prestations détaillées</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Clock className="w-4 h-4 text-secondary-400" />
                <span>{trade.averageResponseTime}</span>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href={`/devis/${service}`}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-lg"
              >
                <ArrowRight className="w-5 h-5" />
                Obtenir un devis personnalisé
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Byline + En bref — E-E-A-T DOM signal post-hero */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ArticleMeta
            author={author.name}
            authorHref="/a-propos"
            datePublished={PUBLISHED_DATE}
            dateModified={dateModifiedIso}
            className="mb-6"
          />
          <EnBrefBox keyPoints={enBrefPoints} />
        </div>
      </section>

      {/* TL;DR — featured-snippet bait + speakable (cssSelector [data-speakable]) */}
      <section className="py-8 bg-sand-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* Snippet-bait: reponse directe + tableau pour Featured Snippet Google (Position 0) */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="snippet-answer" data-speakable="true">
            <p className="text-base text-charcoal-700 leading-relaxed mb-6">
              Le <strong>prix {tradeLower}</strong> en France est de{' '}
              <strong>
                {trade.priceRange.min} à {trade.priceRange.max} {trade.priceRange.unit}
              </strong>{' '}
              en 2026. Ce tarif inclut la main-d&apos;œuvre et varie selon la région, la complexité
              de l&apos;intervention et l&apos;urgence. Voici le détail des tarifs par prestation :
            </p>
          </div>
          <PriceTableHTML
            tasks={trade.commonTasks}
            serviceName={trade.name}
            serviceSlug={service}
            unit={trade.priceRange.unit}
          />
        </div>
      </section>

      <section className="py-6 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GeoPageCTA
            title="Besoin d'un devis pour votre projet ?"
            subtitle={`Comparez les tarifs de ${trade.name.toLowerCase()}s vérifiés près de chez vous`}
            service={service}
          />
        </div>
      </section>

      {/* Price range */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-2">Tarif horaire moyen</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-heading text-5xl font-bold text-primary-500">
                {trade.priceRange.min} — {trade.priceRange.max}
              </span>
              <span className="text-charcoal-600 text-lg">{trade.priceRange.unit} TTC</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Prix moyen constaté en France métropolitaine, main-d&apos;œuvre incluse, TTC
            </p>
          </div>

          <SpeakableAnswerBox
            answer={`Tarifs ${trade.name} en France : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}. ${trade.commonTasks
              .slice(0, 3)
              .map((t) => t.split(':')[0].trim())
              .join('. ')}. Prix constatés auprès d'artisans RGE certifiés de notre annuaire.`}
          />

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Détail des prestations courantes
          </h2>
        </div>
      </section>

      {/* Questions fréquentes — PAA optimisé */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-xl font-heading font-semibold text-charcoal-900">
            Combien coûte un {trade.name.toLowerCase()} en France ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed">
            Le tarif horaire moyen d'un {trade.name.toLowerCase()} en France se situe entre{' '}
            {trade.priceRange.min} et {trade.priceRange.max} {trade.priceRange.unit}. Ce prix varie
            selon la région, la complexité de l'intervention et les matériaux nécessaires. En
            Île-de-France, comptez une majoration de 20 à 25 % par rapport à la moyenne nationale.
          </p>

          <h2 className="text-xl font-heading font-semibold text-charcoal-900">
            Comment choisir son {trade.name.toLowerCase()} ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed">
            Pour bien choisir votre {trade.name.toLowerCase()}, vérifiez son numéro SIRET sur le
            site de l'INSEE, demandez une copie de son assurance décennale et comparez au moins 3
            devis détaillés. Privilégiez les artisans certifiés
            {trade.certifications.length > 0 ? ` (${trade.certifications[0]})` : ''} et consultez
            les avis clients en ligne.
          </p>

          <h2 className="text-xl font-heading font-semibold text-charcoal-900">
            Quels sont les tarifs moyens d'un {trade.name.toLowerCase()} ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed">
            Les tarifs d'un {trade.name.toLowerCase()} dépendent du type de prestation. Pour les
            interventions courantes :{' '}
            {trade.commonTasks
              .slice(0, 2)
              .map((t) => t.split(':')[0].trim().toLowerCase())
              .join(', ')}
            . Le tarif horaire de base est de {trade.priceRange.min} à {trade.priceRange.max}{' '}
            {trade.priceRange.unit}, hors fournitures et déplacement.
          </p>
        </div>
      </section>

      {/* Regional pricing */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Variation des tarifs par région
          </h3>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Les prix {trade.name.toLowerCase()} varient selon la région. Voici une estimation
            ajustée.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REGIONAL_PRICING.map((r) => {
              const adjustedMin = Math.round(trade.priceRange.min * r.multiplier)
              const adjustedMax = Math.round(trade.priceRange.max * r.multiplier)
              const accentColor =
                r.multiplier > 1.0
                  ? 'border-secondary-200 bg-secondary-50'
                  : r.multiplier < 1.0
                    ? 'border-accent-200 bg-accent-50'
                    : 'border-sand-300 bg-sand-50'
              const badgeColor =
                r.multiplier > 1.0
                  ? 'bg-secondary-100 text-secondary-700'
                  : r.multiplier < 1.0
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-sand-200 text-charcoal-600'
              const sign = r.multiplier > 1.0 ? '+' : r.multiplier < 1.0 ? '' : ''
              const pct = Math.round((r.multiplier - 1) * 100)
              return (
                <div key={r.region} className={`rounded-xl border shadow-sm p-4 ${accentColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-charcoal-500 flex-shrink-0" />
                    <span className="font-semibold text-charcoal-900 text-sm">{r.region}</span>
                  </div>
                  <p className="text-xs text-charcoal-500 mb-3">{r.label}</p>
                  <div className="text-lg font-bold text-charcoal-900">
                    {adjustedMin} — {adjustedMax}{' '}
                    <span className="text-sm font-normal text-charcoal-500">
                      {trade.priceRange.unit} TTC
                    </span>
                  </div>
                  <span
                    className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}
                  >
                    {pct === 0 ? 'Moyenne nationale' : `${sign}${pct} % vs moyenne`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Conseils */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Conseils pour choisir un {trade.name.toLowerCase()}
          </h2>
          <div className="space-y-4">
            {trade.tips.slice(0, 4).map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-300 p-5"
              >
                <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-secondary-600" />
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      {trade.certifications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
              Certifications et qualifications
            </h2>
            <p className="text-charcoal-600 text-center mb-8">
              Vérifiez que votre {trade.name.toLowerCase()} possède les certifications adaptées à
              votre projet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {trade.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-3 rounded-xl text-sm font-medium"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — {trade.name}
          </h2>
          <div className="space-y-4">
            {trade.faq.slice(0, 5).map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-sand-300 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">{item.q}</h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Questions détaillées — inbound links vers le cluster /questions
          (dé-orphelinage : PR contextuel depuis le hub tarifs). */}
      <ServiceQuestions serviceSlug={service} serviceName={trade.name} />

      {/* Top 20 villes — maillage interne SEO */}
      <TopCitiesGrid
        serviceSlug={service}
        serviceName={trade.name}
        intent="tarifs"
        className="bg-white"
      />

      {/* Urgence */}
      {trade.emergencyInfo && (
        <section className="py-16 bg-red-50 border-y border-red-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-4">
              {trade.name} en urgence ?
            </h2>
            <p className="text-charcoal-700 mb-6 max-w-2xl mx-auto text-sm leading-relaxed">
              {trade.emergencyInfo}
            </p>
            <Link
              href={`/urgence/${service}`}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              {trade.name} urgence 24h/24
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Other trades */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Tarifs d'autres corps de métier
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              return (
                <Link
                  key={slug}
                  href={`/tarifs/${slug}`}
                  className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">
                    {t.priceRange.min} — {t.priceRange.max} {t.priceRange.unit}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Obtenez un devis précis pour votre projet
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Les prix varient selon votre situation. Demandez un devis gratuit à un{' '}
            {trade.name.toLowerCase()} référencé.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/devis/${service}`}
              className="inline-flex items-center gap-2 bg-white text-primary-500 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg"
            >
              Obtenir mon prix exact
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/services/${service}`}
              className="inline-flex items-center gap-2 bg-primary-300 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-200 transition-colors text-lg border border-primary-300"
            >
              Trouver un {trade.name.toLowerCase()}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">Méthodologie tarifaire</h3>
            <p className="text-xs text-sand-500 leading-relaxed">
              Les prix affichés sont des fourchettes indicatives basées sur des moyennes constatées
              en France. Ils varient selon la région, la complexité du chantier, les matériaux et
              l'urgence. Seul un devis personnalisé fait foi. ServicesArtisans est un annuaire
              indépendant.
            </p>
          </div>
        </div>
      </section>

      {/* Voir aussi — single nav bar */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <nav className="flex flex-wrap gap-2">
            <Link
              href={`/services/${service}`}
              className="text-sm text-charcoal-700 hover:text-primary-500 bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {trade.name} — annuaire
            </Link>
            <Link
              href={`/devis/${service}`}
              className="text-sm text-charcoal-700 hover:text-primary-500 bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Devis {trade.name.toLowerCase()}
            </Link>
            {trade.emergencyInfo && (
              <Link
                href={`/urgence/${service}`}
                className="text-sm text-charcoal-700 hover:text-primary-500 bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Urgence {trade.name.toLowerCase()}
              </Link>
            )}
            <Link
              href="/tarifs"
              className="text-sm text-charcoal-700 hover:text-primary-500 bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Guide tarifs
            </Link>
          </nav>
        </div>
      </section>

      {/* Trust */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
            Confiance &amp; Sécurité
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/notre-processus-de-verification"
              className="text-primary-500 hover:text-primary-700"
            >
              Comment nous référençons les artisans
            </Link>
            <Link href="/politique-avis" className="text-primary-500 hover:text-primary-700">
              Notre politique des avis
            </Link>
            <Link href="/mediation" className="text-primary-500 hover:text-primary-700">
              Service de médiation
            </Link>
          </nav>
        </div>
      </section>

      <StickyMobileCTA serviceSlug={service} ctaText="Comparer les prix gratuitement" />
      <ExitIntentPopup />
    </div>
  )
}
