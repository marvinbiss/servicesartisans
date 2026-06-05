import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle,
  Euro,
  Shield,
  Clock,
  ChevronDown,
  Phone,
  Star,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { getBreadcrumbSchema, getFAQSchema, getAvisHubSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { hashCode } from '@/lib/seo/location-content'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { villes } from '@/lib/data/france'
import { getValidCitySlugsForService } from '@/lib/seo/valid-combos'
import { getServiceImage } from '@/lib/data/images'
import { relatedServices } from '@/lib/constants/navigation'
import { BAROMETRE_METIERS } from '@/lib/barometre/constants'
import { departements } from '@/lib/data/france'
import dynamic from 'next/dynamic'

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})

export const revalidate = 86400 // 24h

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL
const tradeSlugs = getTradesSlugs()

export function generateStaticParams() {
  return tradeSlugs.map((service) => ({ service }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>
}): Promise<Metadata> {
  const { service } = await params
  const trade = tradeContent[service]
  if (!trade) return {}

  const tradeLower = trade.name.toLowerCase()

  // Fetch stats to enrich title with real rating data
  const stats = await getServiceStats(service)

  // selectFittingTitle : variants ordonnés du plus ambitieux au plus court.
  // maxLen = 46 char raw : +19 char brand suffix = ≤ 65 char rendu.
  let title: string
  const titleHash = Math.abs(hashCode(`avis-title-${service}`))
  if (stats.totalReviews > 0 && stats.avgRating > 0) {
    const titleTemplates = [
      `${stats.avgRating}★ Avis ${trade.name} RGE — ${stats.totalReviews} avis`,
      `Avis ${trade.name} RGE : ${stats.avgRating}/5 — ${stats.totalReviews} clients`,
      `${trade.name} RGE : ${stats.avgRating}★ (${stats.totalReviews} avis) 2026`,
      `Avis ${trade.name} RGE ${stats.avgRating}/5 — 2026`,
    ]
    title = selectFittingTitle(titleTemplates, titleHash, 46)
  } else {
    const titleTemplates = [
      `Avis ${trade.name} RGE 2026 — Témoignages vérifiés`,
      `Avis ${trade.name} RGE 2026 — Pros certifiés`,
      `${trade.name} RGE : avis et recommandations 2026`,
      `Avis ${trade.name} RGE 2026`,
    ]
    title = selectFittingTitle(titleTemplates, titleHash, 46)
  }

  const ratingSnippet =
    stats.totalReviews > 0 && stats.avgRating > 0
      ? `Note moyenne ${stats.avgRating}/5 sur ${stats.totalReviews} avis vérifiés. `
      : ''
  const descHash = Math.abs(hashCode(`avis-desc-${service}`))
  const descTemplates = [
    `${ratingSnippet}Avis ${tradeLower}s RGE certifiés. Comparez les profils, certifications RGE vérifiées ADEME et tarifs ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}.`,
    `${ratingSnippet}Avis ${tradeLower} RGE : tarifs ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}, certification RGE vérifiée ADEME et retours clients vérifiés.`,
    `${ratingSnippet}${trade.name} RGE de confiance : avis vérifiés, certification ADEME, prix ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}. Comparaison gratuite.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImage(service)

  return {
    title,
    description,
    alternates: getAlternates(`/avis/${service}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/avis/${service}`,
      type: 'website',
      images: [
        {
          url: serviceImage.src,
          width: 800,
          height: 600,
          alt: `Avis ${trade.name}`,
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

interface ServiceAvisProvider {
  id: string
  name: string
  slug: string
  stable_id: string
  address_city: string | null
  rating_average: number | null
  review_count: number | null
  is_verified: boolean
  specialty: string | null
}

interface ServiceAvisReview {
  id: string
  rating: number
  content: string | null
  author_name: string | null
  created_at: string
  provider_id: string
}

async function getServiceStats(serviceSlug: string) {
  if (IS_BUILD)
    return {
      providers: [] as ServiceAvisProvider[],
      reviews: [] as ServiceAvisReview[],
      totalReviews: 0,
      avgRating: 0,
    }

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) {
    return {
      providers: [] as ServiceAvisProvider[],
      reviews: [] as ServiceAvisReview[],
      totalReviews: 0,
      avgRating: 0,
    }
  }

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // RGE-only filter: only RGE-certified, currently valid providers
    const todayIso = new Date().toISOString().split('T')[0]

    // Get top RGE providers for this specific service by specialty
    const { data: providers } = await supabase
      .from('providers')
      .select(
        'id, user_id, name, slug, stable_id, address_city, rating_average, review_count, is_verified, specialty'
      )
      .eq('is_active', true)
      .in('specialty', specialties)
      .gt('review_count', 0)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', todayIso)
      .order('rating_average', { ascending: false, nullsFirst: false })
      .order('review_count', { ascending: false })
      .limit(6)

    if (!providers || providers.length === 0) {
      return {
        providers: [] as ServiceAvisProvider[],
        reviews: [] as ServiceAvisReview[],
        totalReviews: 0,
        avgRating: 0,
      }
    }

    const topProviders = providers

    const totalReviews = topProviders.reduce((sum, p) => sum + (p.review_count || 0), 0)
    const ratedProviders = topProviders.filter((p) => p.rating_average && p.rating_average > 0)
    const avgRating =
      ratedProviders.length > 0
        ? ratedProviders.reduce((sum, p) => sum + (p.rating_average || 0), 0) /
          ratedProviders.length
        : 0

    // Fetch recent reviews for these providers
    // reviews.provider_id references providers.id directly
    const providerIds = topProviders.map((p) => p.id).filter((pid): pid is string => !!pid)
    let reviews: ServiceAvisReview[] = []
    if (providerIds.length > 0) {
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, rating, content, author_name, created_at, provider_id')
        .in('provider_id', providerIds)
        .eq('status', 'published')
        .not('content', 'is', null)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (reviewData) reviews = reviewData as ServiceAvisReview[]
    }

    return {
      providers: topProviders as ServiceAvisProvider[],
      reviews,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
    }
  } catch {
    return {
      providers: [] as ServiceAvisProvider[],
      reviews: [] as ServiceAvisReview[],
      totalReviews: 0,
      avgRating: 0,
    }
  }
}

export default async function AvisServicePage({
  params,
}: {
  params: Promise<{ service: string }>
}) {
  const { service } = await params

  const trade = tradeContent[service]
  if (!trade) notFound()

  const tradeLower = trade.name.toLowerCase()

  const serviceStats = await getServiceStats(service)

  // 2026-05-06 — single source of truth via mat-view RGE-aware. Avant pivot
  // full RGE, ce hub listait `villes.slice(0, 20)` sans filtre → ~28K combos
  // /avis/[s]/[v] cassés. Cf. lib/seo/valid-combos.ts.
  const validCitySlugs = await getValidCitySlugsForService(service, { limit: 20 })
  const topCities = validCitySlugs
    .map((slug) => villes.find((v) => v.slug === slug))
    .filter((v): v is (typeof villes)[number] => Boolean(v))

  // JSON-LD schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Avis', url: '/avis' },
    { name: `Avis ${tradeLower}`, url: `/avis/${service}` },
  ])

  // Merge trade FAQ + review-specific FAQ
  const reviewFaqItems = [
    {
      question: `Comment choisir un bon ${tradeLower} RGE ?`,
      answer: `Pour choisir un bon ${tradeLower} RGE, vérifiez sa certification RGE (validée ADEME via france-renov.gouv.fr) et ses qualifications complémentaires (${trade.certifications.length > 0 ? trade.certifications.slice(0, 3).join(', ') : 'assurance décennale, RC pro'}), comparez les avis clients et demandez plusieurs devis. Les tarifs habituels vont de ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}.`,
    },
    {
      question: `Combien coûte un ${tradeLower} RGE ?`,
      answer: `Les tarifs d’un ${tradeLower} RGE varient généralement de ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}, selon la complexité de l’intervention et votre région. La certification RGE ouvre l’accès à MaPrimeRénov’ et aux CEE. Demandez plusieurs devis pour comparer.`,
    },
    {
      question: `Quelles certifications vérifier pour un ${tradeLower} RGE ?`,
      answer:
        trade.certifications.length > 0
          ? `Pour un ${tradeLower} RGE, vérifiez d’abord la certification RGE en cours de validité (ADEME), puis les qualifications spécifiques : ${trade.certifications.join(', ')}. Vérifiez également l’assurance décennale et la responsabilité civile professionnelle.`
          : `Vérifiez la certification RGE en cours de validité (ADEME) ainsi que l’assurance décennale et la responsabilité civile professionnelle. Un ${tradeLower} RGE sérieux fournit ces documents sans difficulté.`,
    },
  ]

  const tradeFaqItems = trade.faq
    .slice()
    .sort((a, b) => {
      const ha = Math.abs(hashCode(`faq-sort-${service}-${a.q}`))
      const hb = Math.abs(hashCode(`faq-sort-${service}-${b.q}`))
      return ha - hb
    })
    .slice(0, 3)

  const allFaqItems = [
    ...tradeFaqItems.map((f) => ({ question: f.q, answer: f.a })),
    ...reviewFaqItems,
  ]

  const faqSchema = getFAQSchema(allFaqItems)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Avis ${trade.name} RGE — comment bien choisir un ${tradeLower} certifié`,
    description: `Avis et recommandations pour bien choisir votre ${tradeLower} RGE certifié. Tarifs ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}, certification RGE vérifiée ADEME, critères de sélection.`,
    articleSection: 'Avis artisans RGE',
    image: `${SITE_URL}/opengraph-image`,
    url: `${SITE_URL}/avis/${service}`,
    mainEntityOfPage: `${SITE_URL}/avis/${service}`,
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
    serviceStats.totalReviews > 0
      ? `Note moyenne ${serviceStats.avgRating.toFixed(1)}/5 sur ${serviceStats.totalReviews} avis vérifiés d'artisans RGE certifiés en France`
      : `Avis et critères de choix pour ${tradeLower} RGE : certification ADEME, qualifications, tarifs, fiabilité`,
    `Tarifs nationaux : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}`,
    trade.certifications.length > 0
      ? `Certifications à vérifier : RGE (ADEME) + ${trade.certifications.slice(0, 3).join(', ')}`
      : `Certification RGE (ADEME) + assurance décennale + RC pro obligatoires`,
    serviceStats.providers.length > 0
      ? `${serviceStats.providers.length} ${tradeLower}${serviceStats.providers.length > 1 ? 's' : ''} RGE dans le top national`
      : `Délai de réponse moyen : ${trade.averageResponseTime}`,
  ]

  const tldrBullets: string[] = [
    `Avis ${tradeLower} RGE certifié${serviceStats.totalReviews > 0 ? ` — ${serviceStats.avgRating.toFixed(1)}/5 sur ${serviceStats.totalReviews} avis vérifiés` : ' — recommandations clients vérifiées'}, tarifs ${trade.priceRange.min}-${trade.priceRange.max} ${trade.priceRange.unit}.`,
    `Critères clés : certification RGE en cours de validité (ADEME), qualifications complémentaires (${trade.certifications.length > 0 ? trade.certifications.slice(0, 2).join(', ') : 'décennale + RC pro'}), transparence devis, ponctualité, qualité des finitions.`,
    `Méthode : comparer 2-3 devis détaillés, demander photos de réalisations, vérifier la certification RGE et le SIREN actif, lire les avis avec commentaires longs (plus fiables).`,
    `Notre rôle : mise en relation gratuite avec un ${tradeLower} RGE certifié près de chez vous, devis sous 24 h, sans engagement.`,
  ]

  const serviceSchema = getAvisHubSchema({
    serviceName: trade.name,
    serviceSlug: service,
    description: `Consultez les avis et recommandations pour choisir un ${tradeLower} RGE certifié de confiance. ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}. Artisans RGE certifiés ADEME.`,
    url: `${SITE_URL}/avis/${service}`,
    ratingValue: serviceStats.avgRating,
    reviewCount: serviceStats.totalReviews,
    reviews: serviceStats.reviews.slice(0, 3).map((r) => ({
      authorName: r.author_name || 'Client vérifié',
      rating: r.rating,
      comment: r.content,
      datePublished: r.created_at?.split('T')[0] || '',
    })),
  })

  /* Removed: replaced by getAvisHubSchema `${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}`,
    ...(serviceStats.totalReviews > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: serviceStats.avgRating,
        reviewCount: serviceStats.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
      review: serviceStats.reviews.slice(0, 3).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.client_name || 'Client vérifié' },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        reviewBody: r.comment,
        datePublished: r.created_at?.split('T')[0],
      })),
  */

  // ---------------------------------------------------------------------------
  // Editorial content (~300+ words, hash-varied per service)
  // ---------------------------------------------------------------------------
  const h = (seed: string) => Math.abs(hashCode(`avis-editorial-${service}-${seed}`))

  const introVariants = [
    `Choisir un ${tradeLower} RGE certifié est une étape déterminante pour la réussite de vos travaux et l'accès aux aides (MaPrimeRénov', CEE). Les avis clients constituent aujourd'hui le premier réflexe des particuliers avant de contacter un professionnel. En consultant les retours d'expérience d'autres clients, vous pouvez évaluer la qualité du travail, le respect des délais et la transparence tarifaire de chaque artisan. Sur ServicesArtisans, chaque profil est vérifié via les données SIREN officielles et la certification RGE est validée auprès de l'ADEME (france-renov.gouv.fr), ce qui garantit l'authenticité des témoignages et l'éligibilité aux aides. Que vous ayez besoin d'une intervention ponctuelle ou d'un chantier complet, les retours d'expérience vous aident à identifier les artisans RGE les plus fiables de votre région. Ne laissez pas le hasard décider : comparez les profils, lisez les commentaires détaillés et faites un choix éclairé.`,
    `Trouver un ${tradeLower} RGE fiable n'est pas toujours simple, surtout quand il s'agit de travaux importants ouvrant droit à MaPrimeRénov'. Les avis vérifiés jouent un rôle essentiel : ils vous permettent de comparer objectivement les professionnels certifiés avant de faire votre choix. Un artisan RGE bien noté par ses clients précédents inspire confiance. Sur notre plateforme, les profils sont référencés à partir des registres officiels (SIREN, certification RGE vérifiée ADEME), et les avis reflètent des interventions réelles. Consultez les retours clients pour faire un choix éclairé. Chaque témoignage vous apporte des informations concrètes sur la qualité de service, les tarifs pratiqués et le professionnalisme de l'artisan. C'est le meilleur moyen de trouver un prestataire RGE à la hauteur de vos attentes.`,
    `Les avis clients sont devenus un critère incontournable pour sélectionner un ${tradeLower} RGE. Avant d'engager un professionnel certifié, prendre le temps de lire les témoignages d'autres particuliers permet d'éviter les mauvaises surprises. Qualité des finitions, ponctualité, respect du devis initial : autant d'éléments que seuls les retours d'expérience peuvent révéler. ServicesArtisans référence les artisans via les données SIREN officielles et la certification RGE vérifiée ADEME, puis recueille des avis authentiques pour vous aider dans votre décision. En France, le secteur du bâtiment compte des centaines de milliers de professionnels : les avis clients sont votre meilleur filtre pour distinguer les artisans RGE sérieux des autres.`,
  ]

  const analysisVariants = [
    `Les clients qui recherchent un ${tradeLower} accordent une attention particulière à trois critères : la qualité du travail réalisé, le rapport qualité-prix et la communication tout au long du chantier. Les artisans les mieux notés se distinguent généralement par leur capacité à fournir un devis détaillé, à respecter les délais annoncés et à assurer un suivi après intervention. La note moyenne et le nombre d'avis sont des indicateurs fiables pour évaluer la constance d'un professionnel. Un artisan qui maintient une excellente note sur plusieurs dizaines d'interventions offre une garantie de sérieux bien supérieure à un professionnel avec seulement deux ou trois avis, même très positifs. Prenez aussi le temps de lire les commentaires les plus longs : ils contiennent souvent les détails les plus utiles.`,
    `D'après les retours clients analysés, les facteurs de satisfaction pour un ${tradeLower} sont principalement la propreté du chantier, la clarté des explications techniques et le respect du budget initial. Les professionnels qui obtiennent les meilleures notes sont ceux qui communiquent régulièrement sur l'avancement des travaux et qui proposent des solutions adaptées aux contraintes de chaque projet. Le volume d'avis est aussi un signal important : un artisan avec de nombreux retours positifs offre plus de garanties. Portez une attention particulière aux avis qui mentionnent le suivi après travaux et la gestion des imprévus : c'est souvent là que se révèle le vrai professionnalisme d'un artisan.`,
    `L'analyse des avis clients pour les ${tradeLower}s révèle des tendances claires. Les particuliers valorisent avant tout la fiabilité : un professionnel qui se présente à l'heure, qui respecte son devis et qui livre un travail soigné. La réactivité en cas de problème après intervention est également un critère différenciant. Les artisans qui accumulent des avis positifs dans la durée démontrent une constance de service qui rassure les futurs clients. Attention toutefois aux notes parfaites sans commentaire : un artisan avec une note de 4.5/5 accompagnée de retours détaillés est souvent un meilleur choix qu'un profil 5/5 sans explication.`,
  ]

  const conseilVariants = [
    `Pour choisir votre ${tradeLower}, commencez par comparer les notes et le nombre d'avis de plusieurs professionnels. Privilégiez les artisans ayant au moins 5 avis avec une note supérieure à 4/5. Vérifiez systématiquement que le professionnel dispose d'une assurance décennale et d'une responsabilité civile professionnelle. Demandez toujours un devis écrit détaillé avant le début des travaux, et n'hésitez pas à solliciter des photos de réalisations précédentes. Un bon artisan n'hésitera jamais à fournir ces éléments. Méfiez-vous des tarifs anormalement bas qui cachent souvent des prestations incomplètes ou des matériaux de moindre qualité.`,
    `Avant de faire appel à un ${tradeLower}, adoptez une démarche méthodique. Lisez attentivement les avis récents, car ils reflètent le niveau de service actuel du professionnel. Comparez au minimum trois devis pour la même prestation. Vérifiez les certifications spécifiques au métier et assurez-vous que l'artisan est bien immatriculé au registre des métiers. Enfin, privilégiez un professionnel qui prend le temps de se déplacer pour évaluer votre besoin avant d'établir son devis. Un devis réalisé après visite est toujours plus fiable qu'un tarif annoncé par téléphone.`,
    `Pour sélectionner le bon ${tradeLower}, fiez-vous aux avis les plus détaillés plutôt qu'aux seules notes. Les retours qui décrivent précisément les travaux réalisés sont les plus utiles. Vérifiez que l'artisan est enregistré au répertoire SIREN et qu'il possède les assurances obligatoires. Demandez plusieurs devis et comparez non seulement les prix, mais aussi le détail des prestations incluses. Un professionnel sérieux vous fournira un planning prévisionnel et un descriptif précis des matériaux utilisés. Enfin, conservez toujours une trace écrite de tous les échanges avec votre artisan.`,
  ]

  const editorialIntro = introVariants[h('intro') % introVariants.length]
  const editorialAnalysis = analysisVariants[h('analysis') % analysisVariants.length]
  const editorialConseil = conseilVariants[h('conseil') % conseilVariants.length]

  // Related services
  const relatedSlugs = relatedServices[service] || []
  const otherTrades =
    relatedSlugs.length > 0
      ? relatedSlugs.slice(0, 4).filter((s) => tradeContent[s])
      : tradeSlugs.filter((s) => s !== service).slice(0, 4)

  // Hash-selected tips (3)
  const sortedTips = [...trade.tips].sort((a, b) => {
    const ha = Math.abs(hashCode(`tip-sort-${service}-${a}`))
    const hb = Math.abs(hashCode(`tip-sort-${service}-${b}`))
    return ha - hb
  })
  const selectedTips = sortedTips.slice(0, 3)

  // Review criteria
  const reviewCriteria = [
    {
      icon: Shield,
      title: 'Qualifications et certifications',
      description:
        trade.certifications.length > 0
          ? `Vérifiez que votre ${tradeLower} possède les certifications suivantes : ${trade.certifications.join(', ')}. L’assurance décennale et la RC pro sont obligatoires.`
          : `Vérifiez que votre ${tradeLower} dispose d’une assurance décennale et d’une responsabilité civile professionnelle. Ces garanties sont obligatoires pour tout artisan du bâtiment.`,
    },
    {
      icon: Euro,
      title: 'Transparence des tarifs',
      description: `Un bon ${tradeLower} fournit un devis détaillé avant intervention. Prix habituels : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}.`,
    },
    {
      icon: Clock,
      title: 'Réactivité et ponctualité',
      description: `Vérifiez le délai de réponse habituel. ${trade.averageResponseTime}.`,
    },
    {
      icon: CheckCircle,
      title: 'Qualité des finitions',
      description: `Examinez les photos avant/après dans les avis clients. Un ${tradeLower} soigneux est un gage de sérieux et de durabilité des travaux.`,
    },
    {
      icon: Phone,
      title: 'Service après-intervention',
      description: `Un artisan sérieux assure un suivi et reste joignable après les travaux. Vérifiez ce point dans les avis clients.`,
    },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, articleSchema, faqSchema, ...serviceSchema]} />

      {/* Hero */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%)',
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
            items={[{ label: 'Avis', href: '/avis' }, { label: `Avis ${tradeLower}` }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <div className="text-center">
            <h1
              className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
              data-speakable="true"
            >
              {(() => {
                const h1Hash = Math.abs(hashCode(`avis-h1-${service}`))
                const h1Templates = [
                  `Avis ${tradeLower} RGE — Comment bien choisir un certifié`,
                  `Avis ${tradeLower} RGE : conseils pour bien choisir`,
                  `Avis ${tradeLower} RGE : comparez les professionnels certifiés`,
                  `${trade.name} RGE : avis vérifiés et recommandations`,
                  `${trade.name} RGE de confiance : avis vérifiés`,
                ]
                return h1Templates[h1Hash % h1Templates.length]
              })()}
            </h1>
            <p className="text-xl text-charcoal-400 max-w-3xl mx-auto mb-4">
              Consultez les avis et recommandations pour bien choisir votre {tradeLower} RGE
              certifié. Certification RGE vérifiée ADEME. Prix indicatif : {trade.priceRange.min} à{' '}
              {trade.priceRange.max} {trade.priceRange.unit}.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Euro className="w-4 h-4 text-amber-400" />
                <span>
                  {trade.priceRange.min} – {trade.priceRange.max} {trade.priceRange.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Avis vérifiés</span>
              </div>
              {serviceStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">
                    {serviceStats.avgRating.toFixed(1)}/5 — {serviceStats.totalReviews} avis
                  </span>
                </div>
              )}
            </div>
            <div className="mt-8">
              <Link
                href={`/devis/${service}`}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-lg"
              >
                <ArrowRight className="w-5 h-5" />
                Comparer les artisans RGE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Article byline + En bref — E-E-A-T DOM signals + FS Position 0 capture */}
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

      {/* Editorial content — SEO (~300+ words unique per service) */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-4">
              Pourquoi consulter les avis avant de choisir un {tradeLower} RGE ?
            </h2>
            <p className="text-charcoal-700 leading-relaxed mb-6">{editorialIntro}</p>

            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-3 mt-8">
              Ce que les clients regardent chez un {tradeLower} RGE
            </h2>
            <p className="text-charcoal-700 leading-relaxed mb-6">{editorialAnalysis}</p>

            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-3 mt-8">
              Nos conseils pour bien choisir votre {tradeLower} RGE certifié
            </h2>
            <p className="text-charcoal-700 leading-relaxed">{editorialConseil}</p>
          </div>
        </div>
      </section>

      {/* Review criteria */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Ce qu'il faut vérifier
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Les critères essentiels pour choisir un {tradeLower} de confiance.
          </p>
          <div className="space-y-4">
            {reviewCriteria.map((criterion) => {
              const Icon = criterion.icon
              return (
                <div
                  key={criterion.title}
                  className="flex items-start gap-4 bg-sand-50 rounded-xl border border-sand-300 p-5 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                      {criterion.title}
                    </h3>
                    <p className="text-charcoal-600 text-sm leading-relaxed">
                      {criterion.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TOP ARTISANS ─────────────────────────────── */}
      {serviceStats.providers.length > 0 && (
        <section className="py-12 bg-sand-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
              {trade.name}s RGE les mieux notés en France
            </h2>
            <p className="text-charcoal-900 text-center mb-8 max-w-lg mx-auto">
              Classement basé sur les avis clients vérifiés. Tous certifiés RGE (vérifié ADEME).
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceStats.providers.map((provider, i) => (
                <div key={provider.id} className="bg-white border border-sand-300 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 font-bold text-sm">
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-charcoal-900 text-sm">
                          {provider.name}
                        </div>
                        <div className="text-xs text-charcoal-500">
                          {provider.address_city || 'France'}
                        </div>
                      </div>
                    </div>
                    {i < 3 && (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0
                            ? 'bg-amber-100 text-amber-700'
                            : i === 1
                              ? 'bg-sand-100 text-charcoal-600'
                              : 'bg-orange-50 text-orange-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                    )}
                  </div>
                  {provider.rating_average && provider.rating_average > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(provider.rating_average ?? 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-sand-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-charcoal-900">
                        {provider.rating_average.toFixed(1)}
                      </span>
                      <span className="text-xs text-charcoal-500">
                        ({provider.review_count} avis)
                      </span>
                    </div>
                  )}
                  {provider.is_verified && (
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                      <CheckCircle className="w-3 h-3" />
                      SIREN vérifié
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── DERNIERS AVIS CLIENTS ────────────────────── */}
      {serviceStats.reviews.length > 0 && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
              Derniers avis clients — {trade.name}
            </h2>
            <p className="text-charcoal-900 text-center mb-8">
              Retours d'expérience vérifiés de clients.
            </p>
            <div className="space-y-4">
              {serviceStats.reviews.map((review) => (
                <div key={review.id} className="bg-sand-50 rounded-xl border border-sand-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal-900 text-sm">
                        {review.author_name || 'Client vérifié'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Vérifié
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-sand-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.content && (
                    <p className="text-charcoal-700 text-sm leading-relaxed">
                      {review.content.length > 300
                        ? review.content.slice(0, 300) + '…'
                        : review.content}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-charcoal-400">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing expectations */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Tarifs indicatifs {tradeLower}
          </h2>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 text-center mb-8">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-primary-500">
                {trade.priceRange.min} — {trade.priceRange.max}
              </span>
              <span className="text-charcoal-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Prix moyen constaté en France métropolitaine, main-d'&oelig;uvre incluse
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {trade.commonTasks.slice(0, 6).map((task, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-sand-300 p-4"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Euro className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-charcoal-800 text-sm">{task}</span>
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
              Certifications à vérifier
            </h2>
            <p className="text-charcoal-600 text-center mb-8">
              Vérifiez que votre {tradeLower} possède les certifications adaptées à votre projet.
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

      {/* Tips */}
      <section className={`py-16 ${trade.certifications.length > 0 ? 'bg-sand-50' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Conseils pour choisir un {tradeLower}
          </h2>
          <div className="space-y-4">
            {selectedTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-300 p-5"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top cities */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Avis {tradeLower} RGE par ville
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {topCities.map((ville) => (
              <Link
                key={ville.slug}
                href={`/avis/${service}/${ville.slug}`}
                className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                  Avis {tradeLower} RGE à {ville.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/villes"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm"
            >
              Voir les avis {tradeLower} RGE dans toutes les villes ({villes.length})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TL;DR pré-FAQ — capture FS Position 0 / AI Overviews */}
      <section className="py-8 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — Avis {trade.name} RGE
          </h2>
          <div className="space-y-4">
            {allFaqItems.map((item, i) => (
              <details key={i} className="bg-sand-50 rounded-xl border border-sand-300 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">
                    {item.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Prêt à trouver votre {tradeLower} RGE certifié&nbsp;?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Demandez un devis gratuit et comparez les artisans RGE certifiés près de chez vous.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/devis/${service}`}
              className="inline-flex items-center gap-2 bg-white text-primary-500 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg"
            >
              Obtenir mon devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/services/${service}`}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors text-lg border border-primary-300"
            >
              Trouver un {tradeLower} RGE certifié
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Avis pour d'autres métiers
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              if (!t) return null
              return (
                <Link
                  key={slug}
                  href={`/avis/${slug}`}
                  className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    Avis {t.name.toLowerCase()}
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

      {/* Voir aussi */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Ce service</h3>
              <div className="space-y-2">
                <Link
                  href={`/services/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} — tous les artisans
                </Link>
                <Link
                  href={`/devis/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Devis {tradeLower}
                </Link>
                <Link
                  href={`/tarifs/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Tarifs {tradeLower}
                </Link>
                {trade.emergencyInfo && (
                  <Link
                    href={`/urgence/${service}`}
                    className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                  >
                    {trade.name} urgence
                  </Link>
                )}
                {topCities.slice(0, 3).map((v) => (
                  <Link
                    key={v.slug}
                    href={`/avis/${service}/${v.slug}`}
                    className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                  >
                    Avis {tradeLower} à {v.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Avis associés</h3>
              <div className="space-y-2">
                {otherTrades.slice(0, 4).map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  return (
                    <Link
                      key={slug}
                      href={`/avis/${slug}`}
                      className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                    >
                      Avis {t.name.toLowerCase()}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link
                  href="/avis"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Tous les avis artisans
                </Link>
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

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
            Confiance &amp; Sécurité
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/notre-processus-de-verification"
              className="text-primary-500 hover:text-primary-800"
            >
              Comment nous référençons les artisans RGE
            </Link>
            <Link href="/politique-avis" className="text-primary-500 hover:text-primary-800">
              Notre politique des avis
            </Link>
            <Link href="/mediation" className="text-primary-500 hover:text-primary-800">
              Service de médiation
            </Link>
          </nav>
        </div>
      </section>

      {/* Barometre cross-link */}
      {BAROMETRE_METIERS.some((m) => m.slug === service) && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4">
              Baromètre {trade.name}
            </h2>
            <p className="text-charcoal-600 text-sm mb-6">
              Consultez les statistiques détaillées des {trade.name.toLowerCase()}s en France :
              nombre d'artisans, note moyenne, taux de vérification par département.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/barometre/tarifs/${service}`}
                className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-primary-100 hover:border-primary-200"
              >
                <Star className="w-4 h-4" />
                Statistiques {trade.name.toLowerCase()} en France
              </Link>
              {departements.slice(0, 5).map((dept) => (
                <Link
                  key={dept.slug}
                  href={`/departements/${dept.slug}/${service}`}
                  className="inline-flex items-center gap-1.5 text-sm text-charcoal-600 hover:text-primary-500 bg-sand-50 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors border border-sand-300 hover:border-primary-200"
                >
                  {trade.name} dans le {dept.code}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Editorial credibility */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-50 rounded-2xl border border-charcoal-200 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">
              Transparence éditoriale
            </h3>
            <p className="text-xs text-charcoal-900 leading-relaxed">
              Les informations présentées sur cette page sont indicatives et destinées à vous aider
              dans le choix d'un artisan RGE certifié. La certification RGE est vérifiée auprès de
              l'ADEME (france-renov.gouv.fr). Les prix affichés sont des fourchettes basées sur des
              moyennes constatées en France. Seul un devis personnalisé fait foi. ServicesArtisans
              est un annuaire indépendant d'artisans RGE.
            </p>
          </div>
        </div>
      </section>

      <StickyMobileCTA serviceSlug={service} />
      <ExitIntentPopup />
    </div>
  )
}
