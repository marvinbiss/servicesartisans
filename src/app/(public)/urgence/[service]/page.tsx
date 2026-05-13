import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Phone, Clock, Shield, CheckCircle, ArrowRight, AlertTriangle, MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getHowToSchema,
  getUrgencyHubServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import { getAuthorForServiceSlug } from '@/lib/data/service-author'
import { getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, PHONE_TEL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { PlatformPhoneLabel } from '@/components/ui/PlatformPhoneLabel'
import { tradeContent } from '@/lib/data/trade-content'
import { isUrgenceRgeCompatible } from '@/lib/seo/pivot-rge-removed-services'
import { hashCode } from '@/lib/seo/location-content'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import { villes, services } from '@/lib/data/france'
import { getServiceImage } from '@/lib/data/images'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import dynamic from 'next/dynamic'

const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})

const UrgencyCountdown = dynamic(() => import('@/components/UrgencyCountdown'), { ssr: false })

export const revalidate = 86400 // ISR 24h

// All services are available for emergency pages
const emergencySlugs = Object.keys(tradeContent)

// Emergency-specific display data
const emergencyMeta: Record<
  string,
  { gradient: string; lightBg: string; lightText: string; problems: string[] }
> = {
  plombier: {
    gradient: 'from-primary-500 to-primary-700',
    lightBg: 'bg-primary-50',
    lightText: 'text-primary-600',
    problems: [
      "Fuite d'eau importante",
      'Canalisation bouchée',
      'Dégât des eaux',
      'Chauffe-eau en panne',
      'WC bouché',
      'Rupture de tuyau',
    ],
  },
  electricien: {
    gradient: 'from-amber-600 to-amber-800',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    problems: [
      'Panne de courant',
      'Court-circuit',
      'Tableau électrique défaillant',
      'Prise qui chauffe',
      'Odeur de brûlé électrique',
      'Fil dénudé dangereux',
    ],
  },
  // Pivot full RGE 2026-05-03 : serrurier/vitrier retirés (commodity hors RGE,
  // gated par isUrgenceRgeCompatible — middleware retournerait 410).
  chauffagiste: {
    gradient: 'from-red-600 to-red-800',
    lightBg: 'bg-red-50',
    lightText: 'text-red-700',
    problems: [
      'Panne de chauffage',
      'Fuite de gaz',
      'Chaudière en panne',
      'Radiateur qui fuit',
      "Ballon d'eau chaude HS",
      'Problème de thermostat',
    ],
  },
  couvreur: {
    gradient: 'from-orange-600 to-orange-800',
    lightBg: 'bg-orange-50',
    lightText: 'text-orange-700',
    problems: [
      'Fuite de toiture urgente',
      'Toiture arrachée par le vent',
      'Infiltration après tempête',
      'Tuiles cassées après grêle',
      'Gouttière arrachée',
      "Bâche d'urgence à poser",
    ],
  },
  climaticien: {
    gradient: 'from-primary-600 to-primary-800',
    lightBg: 'bg-primary-50',
    lightText: 'text-primary-700',
    problems: [
      'Panne de climatisation',
      'Climatisation qui ne refroidit plus',
      'Fuite de fluide frigorigène',
      'Unité extérieure en panne',
      'Bruit anormal',
      'Climatisation en panne pendant la canicule',
    ],
  },
}

export function generateStaticParams() {
  return emergencySlugs.map((service) => ({ service }))
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

  const titleHash = Math.abs(hashCode(`urgence-title-${service}`))
  // Sprint 2 — variants gradués + first-fitting via title-selector partagé.
  const titleTemplates = [
    `${trade.name} urgence — Intervention rapide`,
    `${trade.name} d'urgence — Soir & week-end`,
    `Urgence ${tradeLower} — Dépannage rapide`,
    `${trade.name} urgence — Devis gratuit`,
    `Dépannage ${tradeLower} urgent — 24h/24`,
    `${trade.name} urgence 24h/24`,
    `Urgence ${tradeLower}`,
  ]
  // Tier 1 2026-05-04 — maxLen 41 → 60 (Google SERP desktop limite).
  const title = selectFittingTitle(titleTemplates, titleHash, 60)

  const descHash = Math.abs(hashCode(`urgence-desc-${service}`))
  const descTemplates = [
    `Besoin d'un ${tradeLower} en urgence ? Disponible selon les artisans de votre secteur partout en France. ${trade.averageResponseTime}. Artisans référencés.`,
    `${trade.name} urgence : dépannage rapide jour et nuit. ${trade.averageResponseTime}. Devis gratuit, artisans vérifiés SIREN.`,
    `Urgence ${tradeLower} ? Trouvez un professionnel disponible dans votre secteur. Intervention rapide, artisans RGE certifiés SIREN, devis gratuit.`,
    `Dépannage ${tradeLower} en urgence, y compris le week-end. Artisans référencés par SIREN, intervention sous ${trade.averageResponseTime}. Gratuit.`,
    `${trade.name} d'urgence soir & week-end : artisans disponibles partout en France. Devis rapide, intervention ${trade.averageResponseTime}.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]
  const serviceImage = getServiceImage(service)

  // Pivot full RGE 2026-05-03 (revert partiel) : on garde l'urgence
  // indexable uniquement pour les trades qu'un artisan RGE peut prendre
  // (cf. URGENCE_RGE_COMPATIBLE_SLUGS). Hors whitelist → noindex+follow
  // pour préserver le maillage interne vers /services/[s].
  const isRgeCompatible = isUrgenceRgeCompatible(service)
  return {
    title,
    description,
    alternates: getAlternates(`/urgence/${service}`),
    robots: isRgeCompatible ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/urgence/${service}`,
      type: 'website',
      images: [{ url: serviceImage.src, width: 800, height: 600, alt: `${trade.name} urgence` }],
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

export default async function UrgenceServicePage({
  params,
}: {
  params: Promise<{ service: string }>
}) {
  const { service } = await params

  const cmsPage = await getPageContent(service + '-urgence', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">
              {cmsPage.title}
            </h1>
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

  const meta = emergencyMeta[service] || emergencyMeta.plombier
  const otherEmergencies = emergencySlugs.filter((s) => s !== service)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Urgence', url: '/urgence' },
    { name: `${trade.name} urgence`, url: `/urgence/${service}` },
  ])

  const tradeLowerFaq = trade.name.toLowerCase()
  const emergencyFaqItems = [
    {
      question: `Combien coûte un ${tradeLowerFaq} en urgence la nuit ?`,
      answer: `Les interventions d'urgence de nuit (après 20h) sont majorées de 50 à 100% par rapport aux tarifs de journée. Pour un ${tradeLowerFaq}, comptez environ ${Math.round((trade.priceRange?.min || 60) * 1.5)} à ${Math.round((trade.priceRange?.max || 90) * 2)} €/h en urgence nocturne. Demandez toujours un devis avant intervention.`,
    },
    {
      question: `Quel est le délai d'intervention d'un ${tradeLowerFaq} en urgence ?`,
      answer: `${trade.averageResponseTime}. Les artisans d'urgence pouvant intervenir le soir et le week-end. Le délai varie selon votre localisation et la disponibilité des professionnels.`,
    },
    {
      question: `Que faire en attendant le ${tradeLowerFaq} d'urgence ?`,
      answer: `En attendant l'arrivée du professionnel : sécurisez la zone, coupez l'arrivée d'eau ou le disjoncteur si nécessaire, et ne tentez pas de réparation vous-même. Protégez vos biens des dégâts éventuels.`,
    },
    {
      question: `Un ${tradeLowerFaq} d'urgence est-il assuré ?`,
      answer: `Tout ${tradeLowerFaq} professionnel doit disposer d'une assurance responsabilité civile professionnelle (RC Pro). Pour les travaux de bâtiment concernés par la loi Spinetta (art. 1792 du Code civil), une garantie décennale est également obligatoire. Exigez les attestations d'assurance avant le début des travaux, même en urgence.`,
    },
  ]

  const allFaqItems = [
    ...emergencyFaqItems.map((f) => ({ question: f.question, answer: f.answer })),
    ...trade.faq.map((f) => ({ question: f.q, answer: f.a })),
  ]

  const faqSchema = getFAQSchema(allFaqItems)

  const tradeLowerHowTo = trade.name.toLowerCase()
  const howToSchema = getHowToSchema(
    [
      {
        name: 'Sécuriser la zone',
        text: `En cas d'urgence ${tradeLowerHowTo}, commencez par sécuriser la zone : coupez l'arrivée d'eau, le disjoncteur ou le gaz selon la situation. Éloignez les personnes et les objets de valeur.`,
      },
      {
        name: 'Évaluer la gravité',
        text: `Déterminez s'il s'agit d'une urgence vitale (fuite de gaz, risque d'électrocution) nécessitant les pompiers (18 ou 112), ou d'une urgence technique nécessitant un ${tradeLowerHowTo}.`,
      },
      {
        name: `Contacter un ${tradeLowerHowTo} d'urgence`,
        text: `Recherchez un ${tradeLowerHowTo} d'urgence disponible dans votre secteur. Privilégiez les artisans RGE certifiés avec un SIRET vérifié. Décrivez précisément le problème pour obtenir un diagnostic rapide.`,
      },
      {
        name: 'Demander un devis avant intervention',
        text: `Même en urgence, exigez un devis écrit ou une estimation tarifaire avant le début des travaux. Vérifiez les majorations éventuelles (nuit, week-end, jours fériés).`,
      },
      {
        name: 'Conserver les justificatifs',
        text: `Gardez la facture détaillée et les photos des dégâts pour votre assurance. En cas de dégât des eaux ou de sinistre, déclarez à votre assureur dans les 5 jours ouvrés.`,
      },
    ],
    {
      name: `Comment gérer une urgence ${tradeLowerHowTo}`,
      description: `Les étapes essentielles pour réagir efficacement face à une urgence ${tradeLowerHowTo} : sécurisation, contact professionnel et démarches.`,
    }
  )

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${trade.name} urgence par ville`,
    description: `Trouvez un ${trade.name.toLowerCase()} d'urgence dans votre ville. ${trade.averageResponseTime}. Artisans référencés disponibles soir et week-end.`,
    url: `${SITE_URL}/urgence/${service}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: topCities.map((ville, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${trade.name} urgence à ${ville.name}`,
        url: `${SITE_URL}/urgence/${service}/${ville.slug}`,
      })),
    },
  }

  // Related services for cross-linking
  const relatedServices = services.filter((s) => s.slug !== service).slice(0, 3)

  const URG_S_AUTHOR = getAuthorForServiceSlug(service)
  const URG_S_REVIEWER = getReviewerForAuthor(URG_S_AUTHOR)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/urgence/${service}#article`,
    headline: `${trade.name} urgence — intervention rapide 24h/7j`,
    description: `Service d'urgence ${trade.name.toLowerCase()} disponible 7j/7 en France. ${trade.averageResponseTime}. Soir, week-end, jours fériés.`,
    image: `${SITE_URL}/opengraph-image`,
    url: `${SITE_URL}/urgence/${service}`,
    mainEntityOfPage: `${SITE_URL}/urgence/${service}`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Urgence dépannage',
    keywords: [
      `${trade.name} urgence`,
      `dépannage ${trade.name.toLowerCase()}`,
      'intervention 24h/7j',
      'soir week-end',
      'jours fériés',
      'France',
    ].join(', '),
    about: [
      { '@type': 'Service', name: `${trade.name} urgence` },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Thing', name: 'Dépannage urgent' },
    ],
    ...spreadCitationsForTopics(`${trade.name} urgence dépannage`),
    datePublished: '2026-01-15T08:00:00+02:00',
    dateModified: monthlyAnchorIso(),
    author: {
      '@type': 'Person',
      name: URG_S_AUTHOR.name,
      jobTitle: URG_S_AUTHOR.role,
      url: `${SITE_URL}/equipe/${URG_S_AUTHOR.slug}`,
      ...(URG_S_AUTHOR.methodology &&
        URG_S_AUTHOR.methodology.length > 0 && { skills: URG_S_AUTHOR.methodology }),
    },
    ...(URG_S_REVIEWER && { reviewedBy: getReviewedByPersonSchema(URG_S_REVIEWER) }),
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
    `Service ${tradeLowerHowTo} d'urgence disponible 7j/7 en France`,
    `Délai moyen d'intervention : ${trade.averageResponseTime}`,
    trade.emergencyInfo
      ? `Conseil d'urgence : ${trade.emergencyInfo.length > 110 ? trade.emergencyInfo.slice(0, 110) + '…' : trade.emergencyInfo}`
      : `Avant tout : couper l'eau / l'électricité / le gaz selon la situation`,
    `Tarifs : majoration 30-100 % selon créneau (nuit, week-end, jour férié) — devis avant intervention obligatoire`,
  ]

  const tldrBullets: string[] = [
    `${trade.name} urgence — intervention 24h/7j en France, soir et week-end. ${trade.averageResponseTime}.`,
    `Étapes immédiates : sécuriser la zone (couper eau / élec / gaz), photos pour assurance, contacter un ${tradeLowerHowTo} référencé SIREN.`,
    `Tarifs : majoration habituelle 30-100 % selon créneau. Exiger un devis écrit même en urgence et conserver la facture pour l'assurance.`,
    `Notre rôle : mise en relation rapide avec un ${tradeLowerHowTo} référencé près de chez vous, sans engagement.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          breadcrumbSchema,
          articleSchema,
          faqSchema,
          howToSchema,
          collectionPageSchema,
          getUrgencyHubServiceSchema({
            serviceName: trade.name,
            serviceSlug: service,
            description:
              trade.emergencyInfo ||
              `Service d'urgence ${trade.name} disponible 7j/7 en France. Intervention rapide, devis gratuit.`,
            url: `${SITE_URL}/urgence/${service}`,
          }),
        ]}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[{ label: 'Urgence', href: '/urgence' }, { label: `${trade.name} urgence` }]}
          />
        </div>
      </div>

      {/* Hero */}
      <section
        className={`relative bg-gradient-to-br ${meta.gradient} text-white py-16 md:py-20 overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -trancharcoal-x-1/2 -trancharcoal-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-[150px] animate-pulse" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-semibold">Disponible soir et week-end</span>
            </div>
          </div>
          <h1
            className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight"
            data-speakable="true"
          >
            {(() => {
              const h1Hash = Math.abs(hashCode(`urgence-h1-${service}`))
              const h1Templates = [
                `${trade.name} urgence`,
                `Urgence ${trade.name.toLowerCase()} soir & week-end`,
                `Dépannage ${trade.name.toLowerCase()} urgent`,
                `${trade.name} d'urgence — y compris le week-end`,
                `${trade.name} urgence : intervention rapide`,
              ]
              return h1Templates[h1Hash % h1Templates.length]
            })()}
            <br />
            <span className="opacity-80">Intervention rapide 24h/7j.</span>
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mb-8">{trade.emergencyInfo}</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex flex-col items-center sm:items-start">
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-3 bg-white text-charcoal-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Phone className="w-6 h-6" />
                Appeler l'assistance
              </a>
              <PlatformPhoneLabel variant="badge" className="mt-2" />
            </div>
            <Link
              href={`/services/${service}`}
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Intervention rapide — Devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{trade.averageResponseTime}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Artisans référencés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Devis gratuit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Countdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UrgencyCountdown serviceName={trade.name} />
      </div>

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

      {/* Problems */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">
              Urgences {trade.name.toLowerCase()} les plus courantes
            </h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Les {trade.name.toLowerCase()}s d'urgence référencés interviennent rapidement pour
              tous ces problèmes.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {meta.problems.map((problem) => (
              <div
                key={problem}
                className={`flex items-center gap-3 ${meta.lightBg} ${meta.lightText} px-5 py-4 rounded-xl`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{problem}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-charcoal-900 mb-3 text-center">
            Tarifs {trade.name.toLowerCase()} urgence
          </h2>
          <p className="text-charcoal-600 max-w-2xl mx-auto text-center mb-10">
            Prix indicatifs pour les interventions d'urgence. Tarif horaire standard :{' '}
            {trade.priceRange.min} à {trade.priceRange.max} {trade.priceRange.unit}. Les majorations
            d'urgence varient de +50% à +100%.
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {trade.commonTasks.slice(0, 8).map((task, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-sand-300 p-4"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700 text-sm">{task}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold"
            >
              Guide complet des tarifs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Certifications */}
      {trade.certifications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">
              Certifications à vérifier
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {trade.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Urgence par ville */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">
            {trade.name} urgence par ville
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topCities.map((ville) => (
              <Link
                key={ville.slug}
                href={`/urgence/${service}/${ville.slug}`}
                className="bg-white hover:bg-red-50 border border-sand-300 hover:border-red-300 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sand-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                    <MapPin className="w-5 h-5 text-charcoal-600 group-hover:text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal-900 group-hover:text-red-600 transition-colors text-sm">
                      {trade.name} à {ville.name}
                    </div>
                    <div className="text-xs text-charcoal-500">Urgence soir & week-end</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/villes"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm"
            >
              Voir {trade.name.toLowerCase()} urgence dans toutes les villes ({villes.length}){' '}
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
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Questions fréquentes — {trade.name} urgence
          </h2>
          <div className="space-y-4">
            {allFaqItems.map((item, i) => (
              <details key={i} className="bg-sand-50 rounded-xl border border-sand-300 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">
                    {item.question}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-charcoal-400 flex-shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-charcoal-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Conseils pratiques
          </h2>
          <div className="space-y-4">
            {trade.tips.slice(0, 3).map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-300 p-5"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-sm">{i + 1}</span>
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other emergencies */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Autres urgences</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {otherEmergencies.slice(0, 4).map((slug) => {
              const t = tradeContent[slug]
              return (
                <Link
                  key={slug}
                  href={`/urgence/${slug}`}
                  className="bg-sand-50 hover:bg-red-50 border border-sand-300 hover:border-red-300 rounded-xl p-4 transition-all group text-center"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-red-600 transition-colors text-sm">
                    {t.name} urgence
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">{t.averageResponseTime}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Voir aussi */}
      <section className="py-12 bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Services associés</h3>
              <div className="space-y-2">
                <Link
                  href={`/services/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} — page principale
                </Link>
                <Link
                  href={`/tarifs/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Tarifs {trade.name.toLowerCase()}
                </Link>
                {relatedServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">{trade.name} par ville</h3>
              <div className="space-y-2">
                {topCities.slice(0, 3).map((v) => (
                  <Link
                    key={v.slug}
                    href={`/urgence/${service}/${v.slug}`}
                    className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                  >
                    {trade.name} à {v.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link
                  href="/urgence"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Toutes les urgences
                </Link>
                <Link
                  href="/comment-ca-marche"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Comment ça marche
                </Link>
                <Link
                  href="/tarifs"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Guide des tarifs
                </Link>
                <Link
                  href="/faq"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  FAQ
                </Link>
                <Link
                  href="/notre-processus-de-verification"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Processus de vérification
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL CREDIBILITY ──────────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-50 rounded-2xl border border-charcoal-200 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">Information importante</h3>
            <p className="text-xs text-charcoal-900 leading-relaxed">
              Les délais d'intervention sont des estimations basées sur la disponibilité habituelle
              des artisans et peuvent varier. ServicesArtisans est un annuaire — nous mettons en
              relation mais ne réalisons pas les interventions. En cas d'urgence vitale, appelez le
              18 (pompiers) ou le 112.
            </p>
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
              Comment nous référençons les artisans
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

      {/* Final CTA */}
      <section className={`bg-gradient-to-br ${meta.gradient} text-white py-16 overflow-hidden`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un {trade.name.toLowerCase()} en urgence ?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Les {trade.name.toLowerCase()}s référencés sur ServicesArtisans sont disponibles selon
            leurs horaires, y compris parfois les jours fériés.
          </p>
          <div className="flex flex-col items-center">
            <a
              href={PHONE_TEL}
              className="inline-flex items-center justify-center gap-3 bg-white text-charcoal-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Phone className="w-6 h-6" />
              Appeler l'assistance
            </a>
            <PlatformPhoneLabel variant="badge" className="mt-2" />
          </div>
        </div>
      </section>

      <StickyMobileCTA serviceSlug={service} ctaText="Appeler un artisan en urgence" />

      <ExitIntentPopup />
    </div>
  )
}
