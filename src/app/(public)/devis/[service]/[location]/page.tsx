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
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes, getVilleBySlug, getNearbyCities } from '@/lib/data/france'
import { getCommuneBySlug, formatNumber, formatEuro } from '@/lib/data/commune-data'
import { getServiceImage } from '@/lib/data/images'
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
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import IntentNavBar from '@/components/seo/IntentNavBar'

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

function truncateTitle(title: string, maxLen = 60): string {
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
  const multiplier = getRegionalMultiplier(villeData.region)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const dept = villeData.departement

  const titleHash = Math.abs(hashCode(`devis-loc-title-${service}-${location}`))
  const titleTemplates = [
    `Devis ${tradeLower} ${villeData.name} — Gratuit`,
    `Devis ${tradeLower} ${villeData.name} 2026`,
    `Devis ${tradeLower} ${villeData.name} : comparez`,
    `Devis ${tradeLower} à ${villeData.name} — Gratuit`,
    `Devis ${tradeLower} ${villeData.name} : 3 offres`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`devis-loc-desc-${service}-${location}`))
  const descTemplates = [
    `Devis ${tradeLower} à ${villeData.name} : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. Comparez jusqu'à 3 artisans référencés. 100 % gratuit, sans engagement.`,
    `Demandez un devis ${tradeLower} à ${villeData.name} (${dept}). Prix local : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. Réponse rapide.`,
    `${trade.name} à ${villeData.name} : obtenez un devis gratuit et comparez les artisans vérifiés. De ${minPrice} à ${maxPrice} ${trade.priceRange.unit}.`,
    `Devis ${tradeLower} ${villeData.name} : comparez les prix (${minPrice}–${maxPrice} ${trade.priceRange.unit}) et choisissez le meilleur artisan. Gratuit.`,
    `Besoin d'un ${tradeLower} à ${villeData.name} ? Devis gratuit d'artisans vérifiés dans le ${dept}.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImage(service)
  const canonicalUrl = `${SITE_URL}/devis/${service}/${location}`

  // Gate indexation on provider availability (HCU anti-thin). Fail-open during build.
  const hasProviders = await hasProvidersByServiceAndLocation(service, location)
  const noindex = shouldNoindex(`/devis/${service}/${location}`, {
    providerCount: hasProviders ? 1 : 0,
    hasUniqueData: true,
  })

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: !noindex, follow: true },
    openGraph: {
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
    isFallback = true
  }

  const multiplier = getRegionalMultiplier(villeData.region)
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

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Devis', url: '/devis' },
    { name: `Devis ${tradeLower}`, url: `/devis/${service}` },
    { name: villeData.name, url: `/devis/${service}/${location}` },
  ])

  const faqSchema = getFAQSchema(
    trade.faq.slice(0, 5).map((f) => ({
      question: f.q.replace(/\?$/, '') + ` à ${villeData.name} ?`,
      answer: f.a,
    }))
  )

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
  // Editorial content: 3 sections x 3 variantes = 27 unique combinations
  // ---------------------------------------------------------------------------

  const editorialSeed1 = Math.abs(hashCode(`devis-editorial-${service}-describe`))
  const editorialSeed2 = Math.abs(hashCode(`devis-editorial-${service}-checklist`))
  const editorialSeed3 = Math.abs(hashCode(`devis-editorial-${service}-tarifs`))

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
      intro: `Pour obtenir un devis ${tradeLower} fiable à ${villeData.name}, la qualité de votre description fait toute la différence. Les professionnels du ${villeData.departement} apprécient les demandes bien structurées.`,
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
        `Renseignez-vous sur les aides financières : certains travaux de ${tradeLower} à ${villeData.name} peuvent bénéficier de MaPrimeRénov', de l'éco-PTZ ou des aides locales du ${villeData.departement}.`,
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
  ]

  // Section 3: "Tarifs indicatifs" (~100 mots)
  const tarifsVariants = [
    {
      text: `À ${villeData.name} (${villeData.departementCode}), les tarifs de ${tradeLower} se situent entre ${minPrice} et ${maxPrice} ${trade.priceRange.unit} en moyenne. Ce prix varie selon la complexité de l'intervention, les matériaux utilisés et l'urgence de la demande. En ${villeData.region}, ${multiplier > 1.0 ? `les tarifs sont en moyenne ${Math.round((multiplier - 1) * 100)} % supérieurs à la moyenne nationale, en raison du coût de la vie et de la forte demande` : multiplier < 1.0 ? `les tarifs sont en moyenne ${Math.round((1 - multiplier) * 100)} % inférieurs à la moyenne nationale, ce qui avantage les particuliers` : `les tarifs sont proches de la moyenne nationale`}. Pour obtenir le meilleur rapport qualité-prix, comparez systématiquement plusieurs devis d'artisans locaux vérifiés.`,
    },
    {
      text: `Le budget moyen pour un ${tradeLower} à ${villeData.name} oscille entre ${minPrice} et ${maxPrice} ${trade.priceRange.unit}, fournitures et main-d'œuvre incluses selon la prestation. Ces chiffres sont ajustés au marché local du ${villeData.departement}. Les interventions d'urgence (nuit, week-end, jours fériés) entraînent généralement une majoration de 30 à 80 %. Conseil : demandez toujours un devis détaillé avant le début des travaux. Un devis gratuit ne vous engage à rien et vous permet de comparer sereinement les offres des ${tradeLower}s à ${villeData.name}.`,
    },
    {
      text: `Fourchette de prix constatée à ${villeData.name} pour un ${tradeLower} : de ${minPrice} à ${maxPrice} ${trade.priceRange.unit}. Cette estimation intègre les spécificités tarifaires de la région ${villeData.region} et du département ${villeData.departement}. Les facteurs qui influencent le prix final sont la nature des travaux, la difficulté d'accès, le choix des matériaux et la période d'intervention. Pour un chiffrage précis et adapté à votre situation, remplissez le formulaire ci-dessus : vous recevrez un devis gratuit et personnalisé de ${tradeLower}s référencés à ${villeData.name}.`,
    },
  ]

  const editorialDescribe = describeProjectVariants[editorialSeed1 % describeProjectVariants.length]
  const editorialChecklist = checklistVariants[editorialSeed2 % checklistVariants.length]
  const editorialTarifs = tarifsVariants[editorialSeed3 % tarifsVariants.length]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, faqSchema, serviceSchema]} />

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
          <p className="text-charcoal-500 mt-2 max-w-xl">
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
                  ? `Les tarifs en ${villeData.region} sont en moyenne ${Math.round((multiplier - 1) * 100)} % supérieurs à la moyenne nationale`
                  : `Les tarifs en ${villeData.region} sont en moyenne ${Math.round((1 - multiplier) * 100)} % inférieurs à la moyenne nationale`}
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
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — Devis {trade.name} à {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.faq.slice(0, 5).map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-sand-300 group">
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
              const m = getRegionalMultiplier(villeData.region)
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
                  const m = getRegionalMultiplier(villeData.region)
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
            Voir aussi
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
