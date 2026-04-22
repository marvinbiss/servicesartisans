import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle,
  Euro,
  ChevronDown,
  ChevronRight,
  MapPin,
  Users,
  Thermometer,
  Building2,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes, getVilleBySlug, getNearbyCities } from '@/lib/data/france'
import { getCommuneBySlug, formatNumber, formatEuro } from '@/lib/data/commune-data'
import { getServiceImageForContext } from '@/lib/data/images'
import { relatedServices } from '@/lib/constants/navigation'
import { getProblemsByService } from '@/lib/data/problems'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import InContentLinks from '@/components/seo/InContentLinks'
import VerticalCrossLinks from '@/components/seo/VerticalCrossLinks'
import DeepPageLinks from '@/components/seo/DeepPageLinks'
import MoneyPageBoost from '@/components/seo/MoneyPageBoost'
import DevisForm from '@/components/DevisForm'
import DevisSidebar from '@/components/conversion/DevisSidebar'
import {
  hasProvidersByServiceAndLocation,
  getProvidersByServiceAndLocation,
  getProvidersByServiceAndDepartment,
} from '@/lib/supabase'
import { shouldNoindex } from '@/lib/seo/pruning'
import FallbackProviders from '@/components/seo/FallbackProviders'
import {
  getDeptPreposition,
  getDeptArticle,
  getRegionPreposition,
  getRegionArticle,
} from '@/lib/geo-strings'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import IntentNavBar from '@/components/seo/IntentNavBar'
import TrustPromiseBanner from '@/components/conversion/TrustPromiseBanner'
import RisquesGeoBlock from '@/components/seo/RisquesGeoBlock'
import PrimesCEEBlock from '@/components/seo/PrimesCEEBlock'
import BarometrePrixBlock from '@/components/seo/BarometrePrixBlock'
import ContexteDPEBlock from '@/components/seo/ContexteDPEBlock'
import CalendrierSaisonnierBlock from '@/components/seo/CalendrierSaisonnierBlock'
import CommuneContextBlock from '@/components/seo/CommuneContextBlock'
import ProblemesCourantsBlock from '@/components/seo/ProblemesCourantsBlock'
import ComparatifsBlock from '@/components/seo/ComparatifsBlock'
import MaillageInterneBlock from '@/components/seo/MaillageInterneBlock'
import {
  generateFAQSchema as generateFAQSchemaEnriched,
  generateHowToSchema,
  generateSpeakableSchema,
  generateAggregateRatingSchema,
} from '@/lib/seo/schema-enrichment'
import ReviewsDeptBlock from '@/components/seo/ReviewsDeptBlock'
import DevisCounterBlock from '@/components/seo/DevisCounterBlock'
import FreshnessSignal from '@/components/seo/FreshnessSignal'
import GlossaireTooltips from '@/components/seo/GlossaireTooltips'
import UserQuestionBlock from '@/components/seo/UserQuestionBlock'
import PhotoGalleryBlock from '@/components/seo/PhotoGalleryBlock'
import AEOAnswerBlock from '@/components/seo/AEOAnswerBlock'
import { getReviewStatsByDept, getTopReviewsByDept } from '@/lib/supabase'
import { getDynamicLastModified } from '@/lib/seo/dynamic-lastmod'

export const revalidate = 86400

// ---------------------------------------------------------------------------
// Static params: top 50 cities x 46 services = 2300 pages
// ---------------------------------------------------------------------------

const tradeSlugs = getTradesSlugs()

function parsePopulation(pop: string): number {
  return parseInt(pop.replace(/\s/g, ''), 10) || 0
}

const TOP_CITIES_COUNT = 10
const topCities = [...villes]
  .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
  .slice(0, TOP_CITIES_COUNT)

export function generateStaticParams() {
  const params: { service: string; location: string }[] = []
  for (const service of tradeSlugs) {
    for (const ville of topCities) {
      params.push({ service, location: ville.slug })
    }
  }
  return params
}

export const dynamicParams = true

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClimatLabel(zone: string | null): string {
  const labels: Record<string, string> = {
    oceanique: 'Climat océanique',
    'semi-oceanique': 'Climat semi-océanique',
    continental: 'Climat continental',
    mediterraneen: 'Climat méditerranéen',
    montagnard: 'Climat montagnard',
  }
  return zone ? (labels[zone] ?? zone) : 'Climat tempéré'
}

function getSeasonalTip(zone: string | null, serviceName: string): string {
  if (zone === 'mediterraneen') {
    return `À noter : le climat méditerranéen favorise les travaux extérieurs quasiment toute l'année. La demande de ${serviceName.toLowerCase()} peut être plus forte en été avec l'afflux de résidents saisonniers.`
  }
  if (zone === 'montagnard') {
    return `En zone de montagne, les conditions hivernales peuvent limiter certains travaux extérieurs et augmenter les délais d'intervention. Prévoyez vos travaux de ${serviceName.toLowerCase()} en amont.`
  }
  if (zone === 'continental') {
    return `Avec un climat continental, les écarts de température sont importants. Les travaux de ${serviceName.toLowerCase()} liés au chauffage et à l'isolation sont particulièrement pertinents.`
  }
  if (zone === 'oceanique' || zone === 'semi-oceanique') {
    return `Le climat océanique implique une humidité fréquente. Les interventions de ${serviceName.toLowerCase()} liées à l'étanchéité et à la ventilation sont courantes.`
  }
  return `Les conditions climatiques locales peuvent influencer le type et la fréquence des interventions de ${serviceName.toLowerCase()}.`
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

function truncateTitle(title: string, maxLen = 41): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; location: string }>
}): Promise<Metadata> {
  const { service, location } = await params
  const trade = tradeContent[service]
  const villeData = getVilleBySlug(location)
  if (!trade || !villeData) notFound()

  const tradeLower = trade.name.toLowerCase()
  const multiplier = getRegionalMultiplier(villeData.region, villeData.departementCode)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const dept = villeData.departement

  // Sprint 2 CTR — fail-open review prefix
  const reviewStats = await getReviewStatsByDept(service, dept).catch(() => null)
  const hasReviewProof = !!(reviewStats && reviewStats.review_count >= 5)
  const reviewPrefix =
    hasReviewProof && reviewStats ? `${reviewStats.avg_rating.toFixed(1)}★ · ` : ''
  const descReviewSnippet =
    hasReviewProof && reviewStats
      ? ` Note ${reviewStats.avg_rating.toFixed(1)}/5 sur ${reviewStats.review_count} avis clients.`
      : ''

  const titleHash = Math.abs(hashCode(`devis-loc-title-${service}-${location}`))
  const titleTemplates = [
    `${reviewPrefix}Devis ${tradeLower} ${villeData.name} 2026 — Gratuit 24h`,
    `${reviewPrefix}Devis ${tradeLower} ${villeData.name} 2026 — 3 offres`,
    `${reviewPrefix}Devis ${tradeLower} ${villeData.name} : comparez 2026`,
    `${reviewPrefix}Devis ${tradeLower} à ${villeData.name} — Réponse 24h`,
    `${reviewPrefix}Devis ${tradeLower} ${villeData.name} 2026 — 3 pros`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`devis-loc-desc-${service}-${location}`))
  const descTemplates = [
    `Devis ${tradeLower} à ${villeData.name} : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. Comparez jusqu'à 3 artisans référencés. 100 % gratuit, sans engagement.${descReviewSnippet}`,
    `Demandez un devis ${tradeLower} à ${villeData.name} (${dept}). Prix local : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. Réponse rapide.${descReviewSnippet}`,
    `${trade.name} à ${villeData.name} : obtenez un devis gratuit et comparez les artisans vérifiés. De ${minPrice} à ${maxPrice} ${trade.priceRange.unit}.${descReviewSnippet}`,
    `Devis ${tradeLower} ${villeData.name} : comparez les prix (${minPrice}–${maxPrice} ${trade.priceRange.unit}) et choisissez un artisan de confiance. Gratuit.${descReviewSnippet}`,
    `Besoin d'un ${tradeLower} à ${villeData.name} ? Devis gratuit d'artisans vérifiés ${getDeptPreposition(dept)}.${descReviewSnippet}`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImageForContext(service, location)
  const canonicalUrl = `${SITE_URL}/devis/${service}/${location}`

  // Gate indexation on provider availability (HCU anti-thin). Fail-open during build.
  const hasProviders = await hasProvidersByServiceAndLocation(service, location)
  // hasUniqueData: trade content (pricing, FAQ) and villeData (commune context) are real unique data
  const noindex = shouldNoindex(`/devis/${service}/${location}`, {
    providerCount: hasProviders ? 1 : 0,
    hasUniqueData: !!(trade && villeData),
  })

  return {
    title,
    description,
    alternates: getAlternates(`/devis/${service}/${location}`),
    robots: { index: !noindex, follow: true },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: serviceImage.src,
          width: 800,
          height: 600,
          alt: `Devis ${trade.name} à ${villeData.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function DevisServiceLocationPage({
  params,
}: {
  params: Promise<{ service: string; location: string }>
}) {
  const { service, location } = await params

  const trade = tradeContent[service]
  const villeData = getVilleBySlug(location)
  if (!trade || !villeData) notFound()

  const commune = await getCommuneBySlug(location)

  // Fetch providers for showcase — fallback to département if city has 0
  let providers = await getProvidersByServiceAndLocation(service, location, { limit: 6 }).catch(
    () => [] as Awaited<ReturnType<typeof getProvidersByServiceAndLocation>>
  )
  let isFallback = false
  if (providers.length === 0) {
    providers = await getProvidersByServiceAndDepartment(service, villeData.departement, {
      limit: 6,
    })
    isFallback = providers.length > 0
  }

  const multiplier = getRegionalMultiplier(villeData.region, villeData.departementCode)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const tradeLower = trade.name.toLowerCase()

  // Count recent devis requests for freshness signal
  let recentDevisCount = 0
  if (!(process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const supabase = createAdminClient()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { count } = await supabase
        .from('devis_requests')
        .select('*', { count: 'exact', head: true })
        .ilike('city', villeData.name)
        .ilike('service_name', trade.name)
        .gte('created_at', thirtyDaysAgo.toISOString())
      recentDevisCount = count ?? 0
    } catch {
      recentDevisCount = 0
    }
  }

  // Social proof: department reviews
  const [reviewStats, topReviews, dynamicLastMod] = await Promise.all([
    getReviewStatsByDept(service, villeData.departement).catch(() => null),
    getTopReviewsByDept(service, villeData.departement).catch(() => []),
    getDynamicLastModified(service, villeData.departementCode).catch(() => null),
  ])

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Devis', url: '/devis' },
    { name: `Devis ${tradeLower}`, url: `/devis/${service}` },
    { name: villeData.name, url: `/devis/${service}/${location}` },
  ])

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Devis ${trade.name} à ${villeData.name}`,
    description: `Demandez un devis gratuit pour ${tradeLower} à ${villeData.name} (${villeData.departement}). Prix : ${minPrice}–${maxPrice} ${trade.priceRange.unit}.`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'City',
      name: villeData.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: villeData.region,
      },
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: commune?.nb_entreprises_artisanales ?? undefined,
    },
  }

  // Schema enrichment — HowTo, enriched FAQ, Speakable
  const howToSchema = generateHowToSchema({
    serviceName: trade.name,
    locationName: villeData.name,
    url: `${SITE_URL}/devis/${service}/${location}`,
    description: `Comment décrire votre projet de ${tradeLower} à ${villeData.name} pour obtenir un devis précis et gratuit.`,
    totalTime: 'PT5M',
  })

  const enrichedFaqItems = trade.faq.slice(0, 5).map((f) => ({
    question: f.q.replace(/\?$/, '') + ` à ${villeData.name} ?`,
    answer: f.a,
  }))
  const enrichedFaqSchema = generateFAQSchemaEnriched(enrichedFaqItems)

  const speakableSchema = generateSpeakableSchema({
    url: `${SITE_URL}/devis/${service}/${location}`,
    title: `Devis ${tradeLower} à ${villeData.name}`,
    cssSelectors: ['.speakable-summary', '.speakable-faq'],
  })

  // Related city links
  const nearbyCities = getNearbyCities(location, 6)

  // Related services
  const relatedSlugs = relatedServices[service] || []
  const otherTrades =
    relatedSlugs.length > 0
      ? relatedSlugs.slice(0, 6).filter((s) => tradeContent[s])
      : tradeSlugs.filter((s) => s !== service).slice(0, 6)

  // H1 variation
  const h1Text = (() => {
    const h1Hash = Math.abs(hashCode(`devis-loc-h1-${service}-${location}`))
    const h1Templates = [
      `Devis ${tradeLower} à ${villeData.name}`,
      `Devis ${tradeLower} gratuit à ${villeData.name}`,
      `${trade.name} à ${villeData.name} — Devis gratuit`,
      `Devis ${tradeLower} : artisans à ${villeData.name}`,
      `${trade.name} à ${villeData.name} : devis gratuit`,
    ]
    return h1Templates[h1Hash % h1Templates.length]
  })()

  // Sidebar FAQ with localized questions
  const sidebarFaq = trade.faq.slice(0, 3).map((f) => ({
    question: f.q.replace(/\?$/, '') + ` à ${villeData.name} ?`,
    answer: f.a,
  }))

  // ---------------------------------------------------------------------------
  // Editorial content: 3 sections x 8 variantes = 512 unique combinations
  // Hash includes BOTH service AND location for per-city uniqueness
  // ---------------------------------------------------------------------------

  const editorialSeed1 = Math.abs(hashCode(`devis-editorial-${service}-${location}-describe`))
  const editorialSeed2 = Math.abs(hashCode(`devis-editorial-${service}-${location}-checklist`))
  const editorialSeed3 = Math.abs(hashCode(`devis-editorial-${service}-${location}-tarifs`))

  // Section 1: "Comment bien décrire votre projet ?" (~150 mots)
  const describeProjectVariants = [
    {
      intro: `Un devis précis commence par une description claire de votre besoin. Plus vous êtes détaillé, plus les artisans ${tradeLower}s à ${villeData.name} pourront vous proposer un tarif juste.`,
      tips: [
        `Décrivez la nature exacte des travaux : s'agit-il d'une réparation, d'une installation neuve, d'un remplacement ou d'un entretien ?`,
        `Précisez la surface concernée (en m²) ou le nombre d'éléments à traiter : les artisans à ${villeData.name} ont besoin de ces données pour calibrer leur devis.`,
        `Joignez des photos si possible : un cliché de la zone concernée permet au ${tradeLower} d'évaluer la complexité avant même de se déplacer.`,
        `Indiquez vos contraintes de calendrier : travaux urgents, date limite, créneaux de disponibilité. En ${villeData.region}, la demande peut être saisonnière.`,
        `Mentionnez l'accès au chantier : étage, stationnement, accès camion. Ces détails évitent les mauvaises surprises sur le devis final.`,
      ],
    },
    {
      intro: `Pour obtenir un devis ${tradeLower} fiable à ${villeData.name}, la qualité de votre description fait toute la différence. Les professionnels ${getDeptArticle(villeData.departement)} apprécient les demandes bien structurées.`,
      tips: [
        `Identifiez le problème ou le besoin principal : fuite, panne, rénovation, mise aux normes ? Un diagnostic précis permet un chiffrage précis.`,
        `Listez les matériaux souhaités si vous avez une préférence (marque, gamme, coloris). Sinon, demandez des alternatives avec les écarts de prix.`,
        `Indiquez l'ancienneté du bâtiment : les immeubles anciens de ${villeData.name} peuvent nécessiter des adaptations spécifiques qui impactent le devis.`,
        `Précisez si le logement est occupé pendant les travaux : cela peut modifier la durée et l'organisation du chantier.`,
        `Signalez tout travail connexe nécessaire : un ${tradeLower} qui voit l'ensemble du chantier peut proposer un tarif groupé plus avantageux.`,
      ],
    },
    {
      intro: `Remplir une demande de devis ${tradeLower} ne prend que quelques minutes, mais un formulaire bien complété vous fera gagner du temps et de l'argent. Voici comment optimiser votre demande à ${villeData.name}.`,
      tips: [
        `Commencez par le type d'intervention : dépannage ponctuel, rénovation partielle ou chantier complet ? Chaque cas implique des compétences et des budgets différents.`,
        `Décrivez l'état actuel : ce qui fonctionne encore, ce qui est cassé, ce qui doit être remplacé. Les artisans de ${villeData.name} ajusteront leur proposition en conséquence.`,
        `Mentionnez le budget approximatif que vous envisagez : cela aide le professionnel à proposer des solutions adaptées à votre enveloppe.`,
        `Précisez si des diagnostics préalables existent (DPE, diagnostic amiante, audit énergétique). Ces documents accélèrent l'élaboration du devis.`,
        `Indiquez si vous avez déjà reçu d'autres devis : la transparence permet aux artisans locaux de vous faire une offre compétitive.`,
      ],
    },
    {
      intro: `Les ${tradeLower}s à ${villeData.name} reçoivent chaque semaine des dizaines de demandes. Pour que la vôtre sorte du lot et obtienne une réponse rapide, structurez-la avec méthode.`,
      tips: [
        `Séparez clairement les travaux urgents des améliorations souhaitées : cela permet au ${tradeLower} de prioriser et de vous proposer un phasage réaliste.`,
        `Indiquez le type de bâtiment : maison individuelle, appartement en copropriété, local commercial. Les contraintes techniques et réglementaires diffèrent à ${villeData.name} selon le cas.`,
        `Mentionnez les travaux déjà réalisés récemment : un ${tradeLower} expérimenté ${getDeptArticle(villeData.departement)} saura adapter son intervention au chantier existant.`,
        `Si votre projet concerne une copropriété, précisez si le syndic doit valider les travaux : cela impacte les délais et la planification.`,
        `Décrivez vos attentes en termes de finition : standard, milieu de gamme ou haut de gamme. Le ${tradeLower} ajustera ses recommandations de matériaux en conséquence.`,
      ],
    },
    {
      intro: `À ${villeData.name}, les artisans ${tradeLower}s privilégient les demandes de devis précises. Un descriptif complet dès le départ évite les allers-retours et accélère le chiffrage.`,
      tips: [
        `Prenez des mesures avant de rédiger votre demande : longueur, largeur, hauteur sous plafond. Ces données sont indispensables pour un devis fiable à ${villeData.name}.`,
        `Décrivez l'environnement du chantier : y a-t-il des contraintes d'humidité, de poussière ou de bruit ? ${getRegionPreposition(villeData.region)}, les normes de voisinage peuvent influencer les horaires d'intervention.`,
        `Précisez si une dépose de l'existant est nécessaire : retirer un ancien équipement représente un coût et un temps de travail que le ${tradeLower} doit intégrer.`,
        `Indiquez si le logement est raccordé au réseau d'assainissement collectif ou individuel : cela peut modifier la nature des travaux.`,
        `Mentionnez tout permis ou autorisation déjà obtenu : déclaration de travaux, accord de copropriété, validation ABF si secteur protégé à ${villeData.name}.`,
      ],
    },
    {
      intro: `Votre demande de devis ${tradeLower} à ${villeData.name} est votre premier contact avec l'artisan. Soignez-la pour recevoir une proposition juste et sans mauvaise surprise.`,
      tips: [
        `Commencez par expliquer le contexte : pourquoi ces travaux maintenant ? Panne, projet de vente, rénovation énergétique, mise en conformité ? La motivation guide la réponse du ${tradeLower}.`,
        `Listez les pièces ou zones concernées avec leur superficie : un ${tradeLower} à ${villeData.name} ne chiffrera pas de la même manière 10 m² et 50 m².`,
        `Indiquez si vous souhaitez un devis pour la fourniture seule, la pose seule ou fourniture + pose : cette distinction impacte fortement le montant final.`,
        `Précisez votre disponibilité pour un éventuel rendez-vous sur place : les ${tradeLower}s ${getDeptArticle(villeData.departement)} préfèrent souvent voir le chantier avant de chiffrer.`,
        `Mentionnez si le chantier est accessible aux personnes à mobilité réduite ou si des aménagements PMR sont requis : cela peut influencer les choix techniques.`,
      ],
    },
    {
      intro: `Les ${tradeLower}s à ${villeData.name} apprécient les clients qui savent ce qu'ils veulent. Voici comment formuler une demande de devis claire et efficace pour ${villeData.departement}.`,
      tips: [
        `Distinguez ce qui relève de l'entretien courant et ce qui nécessite une vraie intervention : un simple réglage et une rénovation complète n'ont pas le même budget.`,
        `Photographiez les éléments existants sous plusieurs angles : plaque signalétique, références, état général. Cela fait gagner un temps précieux au ${tradeLower}.`,
        `Indiquez si d'autres corps de métier doivent intervenir en parallèle : une coordination ${tradeLower} + autre artisan peut réduire les coûts à ${villeData.name}.`,
        `Précisez la date souhaitée de fin de travaux : certains ${tradeLower}s à ${villeData.name} ont des carnets de commandes chargés et planifient 3 à 6 semaines à l'avance.`,
        `Mentionnez les labels ou certifications que vous exigez (RGE, Qualibat, etc.) : cela filtre les artisans éligibles et peut conditionner l'accès à certaines aides.`,
      ],
    },
    {
      intro: `Obtenir un devis de ${tradeLower} à ${villeData.name} ne demande que quelques clics. Mais la richesse des informations fournies détermine la précision du chiffrage que vous recevrez.`,
      tips: [
        `Indiquez la nature du sol, des murs ou du support existant : béton, placo, bois, carrelage. Le ${tradeLower} adaptera ses techniques et ses tarifs en conséquence.`,
        `Précisez si le chantier se situe en zone inondable ou en secteur classé : à ${villeData.name}, certains quartiers ont des réglementations spécifiques.`,
        `Mentionnez vos préférences écologiques : matériaux biosourcés, recyclés, faible empreinte carbone. Les ${tradeLower}s ${getDeptArticle(villeData.departement)} proposent de plus en plus d'alternatives durables.`,
        `Indiquez si vous avez un plan, un croquis ou un devis précédent à partager : tout document existant accélère l'analyse du ${tradeLower}.`,
        `Décrivez les résultats que vous attendez en termes de performance : isolation phonique, thermique, étanchéité, esthétique. Plus c'est précis, plus le devis sera juste.`,
      ],
    },
  ]

  // Section 2: "Ce qu'il faut savoir avant de demander un devis" (~150 mots)
  const checklistVariants = [
    {
      intro: `Avant de solliciter des devis de ${tradeLower} à ${villeData.name}, quelques vérifications préalables vous permettront de comparer les offres sur de bonnes bases.`,
      items: [
        `Vérifiez que l'artisan possède une assurance responsabilité civile professionnelle et une garantie décennale valides : c'est une obligation légale pour les travaux de ${tradeLower}.`,
        `Demandez un devis écrit et détaillé : le devis doit mentionner la TVA applicable, les fournitures, la main-d'œuvre et les délais. Un devis de ${tradeLower} sans ces mentions n'a aucune valeur juridique.`,
        `Comparez au moins 2 à 3 devis : à ${villeData.name}, les tarifs peuvent varier de 20 à 40 % d'un ${tradeLower} à l'autre pour la même prestation.`,
        `Vérifiez le numéro SIRET de l'artisan sur societe.com ou le site de l'INSEE. Un ${tradeLower} sérieux à ${villeData.name} fournit cette information sans hésiter.`,
        `Consultez les avis clients vérifiés : ils vous renseignent sur la ponctualité, la propreté du chantier et le respect du devis initial.`,
      ],
    },
    {
      intro: `Un devis n'est pas qu'un simple prix : c'est un document contractuel qui vous protège. Voici les points essentiels à vérifier avant de choisir votre ${tradeLower} à ${villeData.name}.`,
      items: [
        `Exigez la mention « Devis gratuit et sans engagement » : certains ${tradeLower}s facturent le déplacement pour établir un devis, surtout en zone rurale autour de ${villeData.name}.`,
        `Le devis doit détailler chaque poste séparément : fournitures, main-d'œuvre, frais de déplacement, enlèvement des gravats. Méfiez-vous des devis « tout compris » sans détail.`,
        `Vérifiez les délais annoncés : un bon ${tradeLower} à ${villeData.name} s'engage sur un planning réaliste, avec une date de début et une durée estimée.`,
        `Renseignez-vous sur les aides financières : certains travaux de ${tradeLower} à ${villeData.name} peuvent bénéficier de MaPrimeRénov', de l'éco-PTZ ou des aides locales ${getDeptArticle(villeData.departement)}.`,
        `Ne versez jamais plus de 30 % d'acompte à la signature : c'est un seuil raisonnable qui protège les deux parties. Le solde se règle à la réception des travaux.`,
      ],
    },
    {
      intro: `La préparation en amont est la clé d'un chantier réussi. Avant de contacter un ${tradeLower} à ${villeData.name}, assurez-vous d'avoir les bons réflexes.`,
      items: [
        `Faites un état des lieux précis de la situation actuelle : prenez des mesures, des photos et notez les références des équipements existants.`,
        `Renseignez-vous sur les réglementations locales : à ${villeData.name}, certains travaux nécessitent une déclaration préalable ou un permis de construire selon le PLU.`,
        `Préparez l'accès au chantier : dégagez la zone de travail, protégez les meubles et prévoyez un espace de stockage pour les matériaux. Un chantier bien préparé réduit la facture.`,
        `Anticipez les travaux connexes : si vous faites intervenir un ${tradeLower}, c'est peut-être le moment d'en profiter pour régler d'autres points (mise aux normes, isolation, etc.).`,
        `Définissez vos priorités : si votre budget est limité, indiquez-le clairement. Un ${tradeLower} honnête à ${villeData.name} saura vous proposer des solutions par étapes.`,
      ],
    },
    {
      intro: `Choisir un ${tradeLower} à ${villeData.name} ne se résume pas à comparer des prix. Voici les critères à vérifier pour éviter les déconvenues sur votre chantier ${getDeptArticle(villeData.departement)}.`,
      items: [
        `Vérifiez l'ancienneté de l'entreprise : un ${tradeLower} établi depuis plusieurs années à ${villeData.name} a généralement fait ses preuves auprès des habitants.`,
        `Demandez des références de chantiers similaires au vôtre dans le ${villeData.departementCode} : un professionnel sérieux pourra vous montrer des réalisations comparables.`,
        `Assurez-vous que le devis précise les normes respectées (NF, DTU, RE2020) : c'est la garantie que les travaux seront conformes à la réglementation en vigueur.`,
        `Vérifiez les conditions de paiement : un échéancier clair avec des étapes de validation protège aussi bien le client que l'artisan.`,
        `Renseignez-vous sur le service après-vente : un bon ${tradeLower} à ${villeData.name} garantit son travail et reste joignable après la fin du chantier.`,
      ],
    },
    {
      intro: `À ${villeData.name}, la demande de ${tradeLower} est soutenue. Pour faire le bon choix parmi les artisans disponibles ${getDeptArticle(villeData.departement)}, adoptez une méthode rigoureuse.`,
      items: [
        `Demandez systématiquement une attestation d'assurance en cours de validité : un sinistre sur un chantier non assuré peut coûter très cher.`,
        `Vérifiez que le ${tradeLower} est bien inscrit au Répertoire des Métiers ou au Registre du Commerce. À ${villeData.name}, vous pouvez vérifier sur le site de la CMA locale.`,
        `Méfiez-vous des devis trop bas : à ${villeData.name}, un prix anormalement bas cache souvent du travail non déclaré ou des matériaux de mauvaise qualité.`,
        `Exigez un planning détaillé avec les dates de début, de fin et les étapes intermédiaires. Un ${tradeLower} organisé planifie chaque phase.`,
        `Négociez les conditions de réception des travaux : une visite contradictoire permet de lister les éventuelles réserves avant le paiement du solde.`,
      ],
    },
    {
      intro: `Demander un devis de ${tradeLower} à ${villeData.name} est gratuit et sans engagement. Mais pour en tirer le maximum, préparez votre projet en amont avec ces conseils pratiques.`,
      items: [
        `Identifiez précisément la qualification nécessaire : tous les ${tradeLower}s ne proposent pas les mêmes spécialités. ${getRegionPreposition(villeData.region)}, les artisans qualifiés RGE sont particulièrement recherchés.`,
        `Renseignez-vous sur les délais moyens dans le ${villeData.departementCode} : en période de forte activité, les artisans à ${villeData.name} peuvent avoir 4 à 8 semaines de délai.`,
        `Vérifiez si votre assurance habitation couvre une partie des travaux : dégâts des eaux, tempêtes, bris de glace. Cela peut réduire significativement votre reste à charge.`,
        `Demandez si le ${tradeLower} sous-traite une partie des travaux : vous avez le droit de savoir qui intervient réellement sur votre chantier à ${villeData.name}.`,
        `Conservez tous les documents : devis signé, factures, attestations, PV de réception. Ils seront indispensables en cas de litige ou pour la garantie décennale.`,
      ],
    },
    {
      intro: `Les habitants de ${villeData.name} qui obtiennent les meilleurs devis de ${tradeLower} sont ceux qui posent les bonnes questions. Voici la checklist des points à aborder avec chaque artisan.`,
      items: [
        `Demandez le taux de TVA applicable : selon la nature des travaux et l'ancienneté du logement à ${villeData.name}, la TVA varie de 5,5 % à 20 %. Un taux réduit peut représenter une économie substantielle.`,
        `Interrogez le ${tradeLower} sur sa gestion des déchets de chantier : à ${villeData.name}, l'évacuation des gravats en déchetterie est soumise à des règles strictes et a un coût.`,
        `Demandez si le prix inclut les finitions : jointage, nettoyage, peinture de raccord. Un devis qui omet ces postes vous réserve des surprises en fin de chantier.`,
        `Vérifiez les modalités d'annulation : un devis signé engage les deux parties. Lisez les conditions générales avant de signer.`,
        `Renseignez-vous sur les labels de qualité du ${tradeLower} : Qualibat, RGE, Qualifelec. Ces certifications sont vérifiables en ligne et témoignent d'un engagement professionnel.`,
      ],
    },
    {
      intro: `Vous êtes sur le point de demander un devis de ${tradeLower} à ${villeData.name}. Pour que cette démarche aboutisse à un chantier serein, voici les fondamentaux à ne pas négliger.`,
      items: [
        `Privilégiez les artisans qui se déplacent gratuitement pour évaluer le chantier : à ${villeData.name}, la plupart des ${tradeLower}s sérieux offrent cette visite préalable.`,
        `Vérifiez que le devis mentionne une date de validité : un devis sans date d'expiration peut devenir caduc si les prix des matériaux évoluent.`,
        `Demandez une garantie de prix ferme : évitez les clauses de révision de prix qui permettent au ${tradeLower} d'augmenter la facture en cours de chantier.`,
        `Informez-vous sur les recours possibles : en cas de litige avec un ${tradeLower} à ${villeData.name}, vous pouvez saisir le médiateur de la consommation ou la DDPP ${getDeptArticle(villeData.departement)}.`,
        `Gardez en tête que le moins-disant n'est pas toujours le meilleur choix : à ${villeData.name}, la qualité de la pose et le respect des délais ont autant de valeur que le prix.`,
      ],
    },
  ]

  // Section 3: "Tarifs indicatifs" (~100 mots)
  const tarifsVariants = [
    {
      text: `À ${villeData.name} (${villeData.departementCode}), les tarifs de ${tradeLower} se situent entre ${minPrice} et ${maxPrice} ${trade.priceRange.unit} en moyenne. Ce prix varie selon la complexité de l'intervention, les matériaux utilisés et l'urgence de la demande. ${getRegionPreposition(villeData.region)}, ${multiplier > 1.0 ? `les tarifs sont en moyenne ${Math.round((multiplier - 1) * 100)} % supérieurs à la moyenne nationale, en raison du coût de la vie et de la forte demande` : multiplier < 1.0 ? `les tarifs sont en moyenne ${Math.round((1 - multiplier) * 100)} % inférieurs à la moyenne nationale, ce qui avantage les particuliers` : `les tarifs sont proches de la moyenne nationale`}. Pour obtenir le meilleur rapport qualité-prix, comparez systématiquement plusieurs devis d'artisans locaux vérifiés.`,
    },
    {
      text: `Le budget moyen pour un ${tradeLower} à ${villeData.name} oscille entre ${minPrice} et ${maxPrice} ${trade.priceRange.unit}, fournitures et main-d'œuvre incluses selon la prestation. Ces chiffres sont ajustés au marché local ${getDeptArticle(villeData.departement)}. Les interventions d'urgence (nuit, week-end, jours fériés) entraînent généralement une majoration de 30 à 80 %. Conseil : demandez toujours un devis détaillé avant le début des travaux. Un devis gratuit ne vous engage à rien et vous permet de comparer sereinement les offres des ${tradeLower}s à ${villeData.name}.`,
    },
    {
      text: `Fourchette de prix constatée à ${villeData.name} pour un ${tradeLower} : de ${minPrice} à ${maxPrice} ${trade.priceRange.unit}. Cette estimation intègre les spécificités tarifaires ${getRegionArticle(villeData.region)} et ${getDeptArticle(villeData.departement)}. Les facteurs qui influencent le prix final sont la nature des travaux, la difficulté d'accès, le choix des matériaux et la période d'intervention. Pour un chiffrage précis et adapté à votre situation, remplissez le formulaire ci-dessus : vous recevrez un devis gratuit et personnalisé de ${tradeLower}s référencés à ${villeData.name}.`,
    },
    {
      text: `Les tarifs de ${tradeLower} à ${villeData.name} varient de ${minPrice} à ${maxPrice} ${trade.priceRange.unit} selon nos données locales. ${getDeptPreposition(villeData.departement)}, le coût de la main-d'œuvre artisanale reflète le niveau de vie et la concurrence entre professionnels. Un devis bas de gamme peut cacher des matériaux médiocres ou un artisan non assuré. À ${villeData.name}, privilégiez les ${tradeLower}s qui détaillent chaque ligne de leur devis : c'est le meilleur indicateur de transparence.`,
    },
    {
      text: `Combien coûte un ${tradeLower} à ${villeData.name} ? Comptez entre ${minPrice} et ${maxPrice} ${trade.priceRange.unit} pour une intervention standard. Ce tarif inclut généralement le déplacement, la main-d'œuvre et les fournitures courantes. Attention : les travaux nécessitant des matériaux spécifiques ou une intervention en hauteur sont facturés en supplément. ${getRegionPreposition(villeData.region)}, certaines périodes de l'année (printemps, automne) concentrent la demande et peuvent allonger les délais mais pas les prix.`,
    },
    {
      text: `Prix ${tradeLower} à ${villeData.name} : entre ${minPrice} et ${maxPrice} ${trade.priceRange.unit}. Ces tarifs sont basés sur les devis constatés ${getDeptArticle(villeData.departement)} et actualisés régulièrement. Le prix final dépend de trois facteurs : la surface ou le volume de travaux, la gamme de matériaux choisie et les contraintes d'accès au chantier. À ${villeData.name}, un devis gratuit vous permet de comparer sans risque : aucun engagement tant que vous n'avez pas signé.`,
    },
    {
      text: `En moyenne, les habitants de ${villeData.name} dépensent entre ${minPrice} et ${maxPrice} ${trade.priceRange.unit} pour un ${tradeLower}. ${multiplier > 1.0 ? `Le marché local ${getDeptArticle(villeData.departement)} est légèrement au-dessus de la moyenne nationale (+${Math.round((multiplier - 1) * 100)} %), ce qui s'explique par une demande élevée et un coût de la vie supérieur.` : multiplier < 1.0 ? `Les prix ${getDeptArticle(villeData.departement)} sont inférieurs de ${Math.round((1 - multiplier) * 100)} % à la moyenne nationale, un avantage pour les propriétaires locaux.` : `Les prix sont alignés sur la moyenne nationale.`} Pour maîtriser votre budget, demandez plusieurs devis et vérifiez que chaque poste est détaillé.`,
    },
    {
      text: `À ${villeData.name}, le prix d'une prestation de ${tradeLower} se situe dans une fourchette de ${minPrice} à ${maxPrice} ${trade.priceRange.unit}. Ce tarif varie en fonction de la technicité requise, de l'accessibilité du chantier et du choix des matériaux. Les artisans locaux ${getDeptArticle(villeData.departement)} peuvent appliquer des tarifs différents pour un même type de travaux : d'où l'importance de comparer au moins 2 à 3 devis avant de vous engager. N'oubliez pas : un devis signé vous protège juridiquement en cas de litige.`,
    },
  ]

  const editorialDescribe = describeProjectVariants[editorialSeed1 % describeProjectVariants.length]
  const editorialChecklist = checklistVariants[editorialSeed2 % checklistVariants.length]
  const editorialTarifs = tarifsVariants[editorialSeed3 % tarifsVariants.length]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          breadcrumbSchema,
          serviceSchema,
          howToSchema,
          ...(enrichedFaqSchema ? [enrichedFaqSchema] : []),
          speakableSchema,
          ...(reviewStats && reviewStats.avg_rating > 0 && reviewStats.review_count > 0
            ? [
                generateAggregateRatingSchema({
                  serviceName: trade.name,
                  villeName: villeData.name,
                  avgRating: reviewStats.avg_rating,
                  reviewCount: reviewStats.review_count,
                  serviceSlug: service,
                  villeSlug: location,
                }),
              ].filter(Boolean)
            : []),
        ]}
      />

      {/* ─── HERO MINIMAL ────────────────────────────────── */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <Breadcrumb
            items={[
              { label: 'Devis', href: '/devis' },
              { label: `Devis ${tradeLower}`, href: `/devis/${service}` },
              { label: villeData.name },
            ]}
            className="mb-4 text-charcoal-400"
          />
          <h1 className="font-heading text-3xl font-bold text-charcoal-900 tracking-tight">
            {h1Text}
          </h1>
          <p className="speakable-summary text-charcoal-500 mt-2 max-w-xl">
            Devis gratuit de {tradeLower}s à {villeData.name} ({villeData.departement}). Prix local
            : {minPrice} à {maxPrice} {trade.priceRange.unit}.
          </p>
          {/* Inline trust signals */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 bg-sand-50 px-3 py-1.5 rounded-full border border-sand-200">
              <Euro className="w-3.5 h-3.5 text-primary-400" />
              <span>
                {minPrice} – {maxPrice} {trade.priceRange.unit}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 bg-sand-50 px-3 py-1.5 rounded-full border border-sand-200">
              <MapPin className="w-3.5 h-3.5 text-primary-400" />
              <span>
                {villeData.name} ({villeData.departementCode})
              </span>
            </div>
            {commune?.nb_entreprises_artisanales && (
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500 bg-sand-50 px-3 py-1.5 rounded-full border border-sand-200">
                <Users className="w-3.5 h-3.5 text-primary-400" />
                <span>{formatNumber(commune.nb_entreprises_artisanales)} artisans locaux</span>
              </div>
            )}
            {recentDevisCount >= 120 && (
              <div className="flex items-center gap-1.5 text-xs text-accent-700 bg-accent-50 px-3 py-1.5 rounded-full border border-accent-100">
                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" />
                <span>
                  {recentDevisCount} devis demandé{recentDevisCount > 1 ? 's' : ''} ce mois-ci
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <IntentNavBar
        serviceSlug={service}
        villeSlug={location}
        currentIntent="devis"
        serviceName={trade.name}
        villeName={villeData.name}
      />

      {/* ─── TRUST PROMISE BANNER ────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <TrustPromiseBanner variant="full" />
      </div>

      {/* ─── SPLIT LAYOUT: Form (60%) + Sidebar (40%) ────── */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* LEFT: Formulaire pré-rempli */}
            <div id="formulaire">
              <DevisForm
                prefilledService={service}
                prefilledCity={villeData.name}
                prefilledCityPostal={villeData.codePostal}
                minimalMode
              />
            </div>

            {/* RIGHT: Sidebar de réassurance */}
            <div className="hidden lg:block lg:sticky lg:top-20">
              <DevisSidebar
                serviceName={trade.name}
                faqItems={sidebarFaq}
                priceRange={{ min: minPrice, max: maxPrice, unit: trade.priceRange.unit }}
              />
            </div>
          </div>

          {/* Mobile: réassurance sous le formulaire */}
          <div className="lg:hidden mt-8">
            <details className="group">
              <summary className="flex items-center justify-center gap-2 cursor-pointer py-3 px-6 bg-white rounded-xl border border-sand-200 shadow-soft text-sm font-semibold text-charcoal-700 [&::-webkit-details-marker]:hidden">
                <span>Pourquoi nous faire confiance ?</span>
                <ChevronRight className="w-4 h-4 text-charcoal-400 group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <div className="mt-4">
                <DevisSidebar
                  serviceName={trade.name}
                  faqItems={sidebarFaq}
                  priceRange={{ min: minPrice, max: maxPrice, unit: trade.priceRange.unit }}
                />
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL SECTION 1: Comment bien décrire votre projet ─── */}
      <section className="py-12 bg-white border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-4">
            Comment bien décrire votre projet de {tradeLower} ?
          </h2>
          <p className="text-charcoal-600 text-sm leading-relaxed mb-6">
            {editorialDescribe.intro}
          </p>
          <div className="space-y-3">
            {editorialDescribe.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-sand-50 rounded-xl border border-sand-300 p-4"
              >
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">{i + 1}</span>
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL SECTION 2: Ce qu'il faut savoir avant de demander un devis ─── */}
      <section className="py-12 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-4">
            Ce qu&apos;il faut savoir avant de demander un devis {tradeLower} à {villeData.name}
          </h2>
          <p className="text-charcoal-600 text-sm leading-relaxed mb-6">
            {editorialChecklist.intro}
          </p>
          <div className="space-y-3">
            {editorialChecklist.items.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-sand-300 p-4"
              >
                <CheckCircle className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                <p className="text-charcoal-700 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL SECTION 3: Tarifs indicatifs ─── */}
      <section className="py-12 bg-white border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-4">
            Tarifs indicatifs {tradeLower} à {villeData.name}
          </h2>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
            <p className="text-charcoal-700 text-sm leading-relaxed">{editorialTarifs.text}</p>
          </div>
          <div className="mt-4 text-center">
            <a
              href="#formulaire"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors text-sm"
            >
              Obtenir mon devis gratuit
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Tarifs + prestations courantes ──────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-2">
              Tarif indicatif à {villeData.name}
            </h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-primary-500">
                {minPrice} — {maxPrice}
              </span>
              <span className="text-charcoal-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Prix moyen constaté à {villeData.name} et ses alentours, main-d'œuvre incluse
            </p>
            {multiplier !== 1.0 && (
              <p className="text-xs text-charcoal-400 mt-2">
                {multiplier > 1.0
                  ? `Les tarifs ${getRegionPreposition(villeData.region)} sont en moyenne ${Math.round((multiplier - 1) * 100)} % supérieurs à la moyenne nationale`
                  : `Les tarifs ${getRegionPreposition(villeData.region)} sont en moyenne ${Math.round((1 - multiplier) * 100)} % inférieurs à la moyenne nationale`}
              </p>
            )}
          </div>

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Prestations courantes à {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.commonTasks.map((task, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-sand-50 rounded-xl border border-sand-300 p-5 hover:bg-primary-50 hover:border-primary-200 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Euro className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-charcoal-800">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Facteurs locaux ─────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Facteurs locaux à {villeData.name}
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Plusieurs facteurs locaux influencent le coût d'un {tradeLower} à {villeData.name}.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <LocalFactorCard
              icon={<Euro className="w-5 h-5 text-primary-500" />}
              title="Pouvoir d'achat local"
              value={commune?.revenu_median ? `${formatNumber(commune.revenu_median)} €/an` : null}
              description={
                commune?.revenu_median
                  ? `Le revenu médian à ${villeData.name} est de ${formatNumber(commune.revenu_median)} € par an, ce qui influence le positionnement tarifaire des artisans locaux.`
                  : `Le pouvoir d'achat local à ${villeData.name} influence le niveau des tarifs pratiqués par les artisans.`
              }
            />
            <LocalFactorCard
              icon={<Users className="w-5 h-5 text-secondary-600" />}
              title="Concurrence locale"
              value={
                commune?.nb_entreprises_artisanales
                  ? `${formatNumber(commune.nb_entreprises_artisanales)} entreprises`
                  : null
              }
              description={
                commune?.nb_entreprises_artisanales
                  ? commune.nb_entreprises_artisanales > 500
                    ? `Avec ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales, ${villeData.name} bénéficie d'une forte concurrence, ce qui peut maintenir les prix compétitifs.`
                    : `${villeData.name} compte ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales. Une concurrence modérée peut impliquer des tarifs légèrement plus élevés.`
                  : `Le nombre d'artisans disponibles à ${villeData.name} influence directement les tarifs pratiqués.`
              }
            />
            <LocalFactorCard
              icon={<Thermometer className="w-5 h-5 text-accent-600" />}
              title="Conditions climatiques"
              value={getClimatLabel(commune?.climat_zone ?? null)}
              description={getSeasonalTip(commune?.climat_zone ?? null, trade.name)}
            />
            <LocalFactorCard
              icon={<Building2 className="w-5 h-5 text-purple-600" />}
              title="Type de logement"
              value={commune?.part_maisons_pct ? `${commune.part_maisons_pct} % de maisons` : null}
              description={
                commune?.part_maisons_pct
                  ? commune.part_maisons_pct > 50
                    ? `À ${villeData.name}, ${commune.part_maisons_pct} % des logements sont des maisons individuelles. Les interventions sur maisons (toiture, façade, jardin) sont fréquentes.`
                    : `À ${villeData.name}, les appartements sont majoritaires (${100 - commune.part_maisons_pct} %). Les travaux en copropriété peuvent impliquer des contraintes spécifiques.`
                  : `La répartition entre maisons et appartements à ${villeData.name} influence les types de travaux demandés.`
              }
            />
          </div>
        </div>
      </section>

      {/* ─── Contexte local pour votre devis ─────────────── */}
      {commune && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
              Contexte local pour votre devis à {villeData.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {(commune.nb_artisans_btp != null || commune.nb_entreprises_artisanales != null) && (
                <div className="bg-sand-50 rounded-xl border border-sand-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary-500" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">Tissu artisanal</h3>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {commune.nb_artisans_btp != null
                      ? `${formatNumber(commune.nb_artisans_btp)} artisans BTP référencés à ${villeData.name}, ce qui favorise la concurrence et des devis compétitifs.`
                      : `${formatNumber(commune.nb_entreprises_artisanales ?? 0)} entreprises artisanales à ${villeData.name}, ce qui favorise la concurrence et des devis compétitifs.`}
                  </p>
                </div>
              )}

              {commune.nb_artisans_rge != null && (
                <div className="bg-sand-50 rounded-xl border border-sand-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-accent-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">
                      Artisans RGE certifiés
                    </h3>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {formatNumber(commune.nb_artisans_rge)} artisans RGE certifiés à{' '}
                    {villeData.name} pour les travaux éligibles aux aides à la rénovation
                    énergétique.
                  </p>
                </div>
              )}

              {commune.revenu_median != null && (
                <div className="bg-sand-50 rounded-xl border border-sand-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Euro className="w-5 h-5 text-secondary-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">Budget des ménages</h3>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    Le revenu médian à {villeData.name} est de {formatEuro(commune.revenu_median)}
                    /an, ce qui contextualise le budget moyen des ménages pour les travaux.
                  </p>
                </div>
              )}

              {commune.prix_m2_moyen != null && (
                <div className="bg-sand-50 rounded-xl border border-sand-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">Prix immobilier</h3>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    Le prix au m² de {formatEuro(commune.prix_m2_moyen)} à {villeData.name} permet
                    d'estimer le budget travaux proportionnel à la valeur du bien.
                  </p>
                </div>
              )}

              {commune.pct_passoires_dpe != null && (
                <div className="bg-sand-50 rounded-xl border border-sand-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Thermometer className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">
                      Passoires thermiques
                    </h3>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {commune.pct_passoires_dpe}&nbsp;% de passoires thermiques (DPE F ou G) à{' '}
                    {villeData.name} — forte demande en rénovation énergétique.
                  </p>
                </div>
              )}

              {(commune.jours_gel_annuels != null || commune.climat_zone != null) && (
                <div className="bg-sand-50 rounded-xl border border-sand-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Thermometer className="w-5 h-5 text-sky-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">Contexte climatique</h3>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {getClimatLabel(commune.climat_zone ?? null)}
                    {commune.jours_gel_annuels != null &&
                      ` avec ${commune.jours_gel_annuels} jours de gel par an`}
                    {' — '}un facteur à prendre en compte pour planifier vos travaux de {tradeLower}
                    .
                  </p>
                </div>
              )}

              {commune.part_maisons_pct != null && (
                <div className="bg-sand-50 rounded-xl border border-sand-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">
                      Type de bâti dominant
                    </h3>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {commune.part_maisons_pct > 50
                      ? `${commune.part_maisons_pct} % de maisons individuelles à ${villeData.name} — les travaux de toiture, façade et jardin sont fréquents.`
                      : `${100 - commune.part_maisons_pct} % d'appartements à ${villeData.name} — les travaux en copropriété et de rénovation intérieure prédominent.`}
                  </p>
                </div>
              )}
            </div>

            {/* Bon à savoir */}
            {((commune.revenu_median != null && commune.revenu_median < 28000) ||
              (commune.pct_passoires_dpe != null && commune.pct_passoires_dpe > 20) ||
              (commune.jours_gel_annuels != null && commune.jours_gel_annuels > 30)) && (
              <div className="mt-8 bg-primary-50 rounded-xl border border-primary-200 p-6">
                <h3 className="font-semibold text-primary-700 text-sm mb-3">Bon à savoir</h3>
                <ul className="space-y-2 text-sm text-primary-700">
                  {commune.revenu_median != null && commune.revenu_median < 22000 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>
                        Avec un revenu médian de {formatEuro(commune.revenu_median)}/an, de nombreux
                        ménages à {villeData.name} peuvent être éligibles à{' '}
                        <strong>MaPrimeRénov' Bleu</strong> (barème le plus avantageux).
                      </span>
                    </li>
                  )}
                  {commune.revenu_median != null &&
                    commune.revenu_median >= 22000 &&
                    commune.revenu_median < 28000 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span>
                          Avec un revenu médian de {formatEuro(commune.revenu_median)}/an, de
                          nombreux ménages à {villeData.name} peuvent être éligibles à{' '}
                          <strong>MaPrimeRénov' Jaune</strong> (barème avantageux).
                        </span>
                      </li>
                    )}
                  {commune.pct_passoires_dpe != null && commune.pct_passoires_dpe > 20 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>
                        Avec {commune.pct_passoires_dpe}&nbsp;% de passoires thermiques, la
                        rénovation énergétique est une <strong>urgence</strong> à {villeData.name}.
                        Les aides de l'État sont renforcées pour ces logements.
                      </span>
                    </li>
                  )}
                  {commune.jours_gel_annuels != null && commune.jours_gel_annuels > 30 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>
                        Avec {commune.jours_gel_annuels} jours de gel par an, l'
                        <strong>isolation</strong> est une priorité à {villeData.name} pour réduire
                        la facture de chauffage.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Conseils ────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Conseils pour choisir un {tradeLower} à {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-sand-50 rounded-xl border border-sand-300 p-5"
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

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="speakable-faq py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — Devis {trade.name} à {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.faq.slice(0, 5).map((item, i) => (
              <details
                key={i}
                open={i === 0}
                className="bg-white rounded-xl border border-sand-300 group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">
                    {item.q.replace(/\?$/, '')} à {villeData.name}&nbsp;?
                  </h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Trouver un {tradeLower} à {villeData.name}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Comparez les profils et obtenez un devis gratuit auprès de professionnels référencés à{' '}
            {villeData.name}.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#formulaire"
              className="inline-flex items-center gap-2 bg-white text-primary-500 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg"
            >
              Obtenir mon devis gratuit
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              href={`/services/${service}/${location}`}
              className="inline-flex items-center gap-2 bg-primary-300 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-200 transition-colors text-lg border border-primary-300"
            >
              Voir les {tradeLower}s à {villeData.name}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Related cities ──────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Devis {tradeLower} dans d'autres villes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
            {nearbyCities.map((v) => (
              <Link
                key={v.slug}
                href={`/devis/${service}/${v.slug}`}
                className="bg-sand-50 hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                  Devis {tradeLower} à {v.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Related services ────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Autres devis artisans à {villeData.name}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              if (!t) return null
              const m = getRegionalMultiplier(villeData.region, villeData.departementCode)
              return (
                <Link
                  key={slug}
                  href={`/devis/${slug}/${location}`}
                  className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    Devis {t.name.toLowerCase()} à {villeData.name}
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">
                    {Math.round(t.priceRange.min * m)} — {Math.round(t.priceRange.max * m)}{' '}
                    {t.priceRange.unit}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Services complémentaires ────────────────────── */}
      {(() => {
        const complementary = otherTrades
          .filter((s) => s !== service && tradeContent[s])
          .slice(0, 4)
        if (complementary.length === 0) return null
        return (
          <section className="py-12 bg-sand-50 border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-2">
                Services complémentaires à {villeData.name}
              </h2>
              <p className="text-sm text-charcoal-500 mb-4">
                Ces services sont souvent demandés avec {tradeLower}.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {complementary.map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  const m = getRegionalMultiplier(villeData.region, villeData.departementCode)
                  return (
                    <div
                      key={slug}
                      className="bg-white rounded-xl border border-sand-300 p-4 space-y-2.5"
                    >
                      <div className="font-semibold text-charcoal-900 text-sm">{t.name}</div>
                      <div className="text-xs text-charcoal-500">
                        {Math.round(t.priceRange.min * m)}–{Math.round(t.priceRange.max * m)}{' '}
                        {t.priceRange.unit}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/services/${slug}/${location}`}
                          className="inline-flex items-center px-2.5 py-1 bg-sand-50 hover:bg-primary-50 text-charcoal-600 hover:text-primary-600 rounded-lg text-xs font-medium border border-sand-300 hover:border-primary-200 transition-all"
                        >
                          Artisans
                        </Link>
                        <Link
                          href={`/devis/${slug}/${location}`}
                          className="inline-flex items-center px-2.5 py-1 bg-sand-50 hover:bg-secondary-50 text-charcoal-600 hover:text-secondary-700 rounded-lg text-xs font-medium border border-sand-300 hover:border-secondary-200 transition-all"
                        >
                          Devis
                        </Link>
                        <Link
                          href={`/tarifs/${slug}/${location}`}
                          className="inline-flex items-center px-2.5 py-1 bg-sand-50 hover:bg-accent-50 text-charcoal-600 hover:text-accent-700 rounded-lg text-xs font-medium border border-sand-300 hover:border-accent-200 transition-all"
                        >
                          Tarifs
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ─── Problèmes courants ──────────────────────────── */}
      {(() => {
        const problems = getProblemsByService(service).slice(0, 4)
        if (problems.length === 0) return null
        return (
          <section className="py-12 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4">
                Problèmes courants
              </h2>
              <div className="flex flex-wrap gap-3">
                {problems.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/problemes/${p.slug}/${location}`}
                    className="px-4 py-2.5 bg-sand-50 hover:bg-orange-50 text-charcoal-700 hover:text-orange-800 rounded-lg text-sm font-medium border border-sand-300 hover:border-orange-200 transition-all"
                  >
                    {p.name} à {villeData.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ─── Cross-intent navigation ─────────────────────── */}
      <section className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
            Comparer les options
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/avis/${service}/${location}`}
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100 hover:border-primary-200 transition-colors"
            >
              Avis {tradeLower} à {villeData.name}
            </Link>
            <Link
              href={`/tarifs/${service}/${location}`}
              className="px-4 py-2 bg-accent-50 text-accent-700 rounded-lg text-sm font-medium border border-accent-100 hover:border-accent-200 transition-colors"
            >
              Tarifs {tradeLower} à {villeData.name}
            </Link>
            <Link
              href={`/urgence/${service}/${location}`}
              className="px-4 py-2 bg-red-50 text-red-800 rounded-lg text-sm font-medium border border-red-100 hover:border-red-200 transition-colors"
            >
              Urgence {tradeLower} à {villeData.name}
            </Link>
            <Link
              href={`/services/${service}/${location}`}
              className="px-4 py-2 bg-sand-50 text-charcoal-800 rounded-lg text-sm font-medium border border-sand-300 hover:border-sand-400 transition-colors"
            >
              {trade.name} à {villeData.name}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Voir aussi ──────────────────────────────────── */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Ce service</h3>
              <div className="space-y-2">
                <Link
                  href={`/devis/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Devis {tradeLower} en France
                </Link>
                <Link
                  href={`/tarifs/${service}/${location}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Tarifs {tradeLower} à {villeData.name}
                </Link>
                <Link
                  href={`/services/${service}/${location}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} à {villeData.name}
                </Link>
                <Link
                  href={`/services/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} — tous les artisans
                </Link>
                <Link
                  href={`/avis/${service}/${location}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Avis {tradeLower} à {villeData.name}
                </Link>
                <Link
                  href={`/urgence/${service}/${location}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} urgence à {villeData.name}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Cette ville</h3>
              <div className="space-y-2">
                <Link
                  href={`/villes/${location}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Artisans à {villeData.name}
                </Link>
                {otherTrades.slice(0, 5).map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  return (
                    <Link
                      key={slug}
                      href={`/devis/${slug}/${location}`}
                      className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                    >
                      Devis {t.name.toLowerCase()} à {villeData.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link
                  href="/devis"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Demander un devis
                </Link>
                <Link
                  href="/tarifs"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Guide complet des tarifs
                </Link>
                <Link
                  href="/comment-ca-marche"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Comment ça marche
                </Link>
                <Link
                  href="/faq"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Editorial credibility ───────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">Transparence tarifaire</h3>
            <p className="text-xs text-sand-500 leading-relaxed">
              Les prix affichés pour {villeData.name} sont des fourchettes indicatives ajustées en
              fonction des données régionales ({villeData.region}). Ils varient selon la complexité
              du chantier, les matériaux et l'urgence. Seul un devis personnalisé fait foi.{' '}
              {SITE_NAME} est un annuaire indépendant.
            </p>
          </div>
        </div>
      </section>

      {/* Artisans disponibles — fallback to département if no local providers */}
      {isFallback ? (
        <FallbackProviders
          providers={providers}
          departmentName={villeData.departement}
          serviceName={trade.name}
          serviceSlug={service}
          villeSlug={location}
          villeName={villeData.name}
        />
      ) : providers.length > 0 ? (
        <LocalProviderShowcase
          providers={providers}
          serviceName={trade.name}
          cityName={villeData.name}
          max={3}
        />
      ) : null}

      {/* ─── Enrichment blocks (pSEO layer) ──────────────── */}
      <ProblemesCourantsBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        villeSlug={location}
        climatZone={commune?.climat_zone ?? null}
      />

      {commune && (
        <RisquesGeoBlock
          communeData={commune}
          serviceName={trade.name}
          villeName={villeData.name}
        />
      )}

      {commune && (
        <ContexteDPEBlock
          communeData={commune}
          serviceName={trade.name}
          villeName={villeData.name}
        />
      )}

      <BarometrePrixBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        regionName={villeData.region}
        revenuMedian={commune?.revenu_median}
        prixM2Moyen={commune?.prix_m2_moyen}
        densite={commune?.densite_population}
      />

      <CalendrierSaisonnierBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        climatZone={commune?.climat_zone ?? null}
        joursGelAnnuels={commune?.jours_gel_annuels}
        precipitationAnnuelle={commune?.precipitation_annuelle}
        temperatureMoyenneHiver={commune?.temperature_moyenne_hiver}
        temperatureMoyenneEte={commune?.temperature_moyenne_ete}
        moisTravauxExtDebut={commune?.mois_travaux_ext_debut}
        moisTravauxExtFin={commune?.mois_travaux_ext_fin}
        altitudeMoyenne={commune?.altitude_moyenne}
      />

      <CommuneContextBlock
        communeData={commune}
        serviceName={trade.name}
        villeName={villeData.name}
      />

      <ComparatifsBlock serviceSlug={service} serviceName={trade.name} />

      {commune && (
        <PrimesCEEBlock
          serviceSlug={service}
          serviceName={trade.name}
          villeName={villeData.name}
          communeData={commune}
        />
      )}

      <MaillageInterneBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeSlug={location}
        villeName={villeData.name}
        departementName={villeData.departement}
        regionName={villeData.region}
        currentIntent="devis"
      />

      {/* --- Vague 3: social proof, freshness, UGC, AEO --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AEOAnswerBlock
          serviceSlug={service}
          serviceName={trade.name}
          villeName={villeData.name}
          departmentName={villeData.departement}
          providerCount={providers.length}
          avgRating={reviewStats?.avg_rating ?? null}
          priceRange={{ min: minPrice, max: maxPrice }}
          communePopulation={commune?.population ?? null}
        />

        <ReviewsDeptBlock
          serviceSlug={service}
          serviceName={trade.name}
          departmentName={villeData.departement}
          stats={reviewStats}
          reviews={topReviews}
        />

        <DevisCounterBlock
          count={recentDevisCount}
          serviceName={trade.name}
          departmentName={villeData.departement}
        />

        <GlossaireTooltips serviceSlug={service} />

        <PhotoGalleryBlock
          serviceName={trade.name}
          villeName={villeData.name}
          departmentName={villeData.departement}
          providerCount={providers.length}
        />

        <UserQuestionBlock
          serviceSlug={service}
          serviceName={trade.name}
          villeName={villeData.name}
          villeSlug={location}
        />

        <FreshnessSignal lastModified={dynamicLastMod} />
      </div>
      {/* --- end Vague 3 --- */}

      <InContentLinks
        serviceSlug={service}
        serviceName={trade.name}
        villeSlug={location}
        villeName={villeData.name}
        currentIntent="devis"
        departementCode={villeData.departementCode}
        region={villeData.region}
      />

      <VerticalCrossLinks
        currentService={service}
        villeSlug={location}
        villeName={villeData.name}
        intent="devis"
      />

      <CrossIntentLinks
        service={service}
        serviceName={trade.name}
        ville={location}
        villeName={villeData.name}
        currentIntent="devis"
      />

      <DeepPageLinks
        currentService={service}
        currentVille={location}
        currentIntent="devis"
        skipCrossIntent
      />

      {/* CTA final — rappel devis */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-charcoal-900 to-charcoal-800 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Votre devis {tradeLower} à {villeData.name} — Gratuit et sans engagement
            </h2>
            <p className="text-sand-400 text-lg mb-8 max-w-2xl mx-auto">
              Remplissez le formulaire en 2 minutes et recevez des devis personnalisés d'artisans
              vérifiés.
            </p>
            <a
              href="#formulaire"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200"
            >
              Remplir le formulaire
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <MoneyPageBoost currentService={service} currentVille={location} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-component: Local factor card
// ---------------------------------------------------------------------------

function LocalFactorCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string | null
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-sand-200 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-charcoal-900 text-sm">{title}</h3>
          {value && <p className="text-xs text-primary-500 font-medium">{value}</p>}
        </div>
      </div>
      <p className="text-charcoal-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
