import { Metadata } from 'next'
import Link from 'next/link'
import {
  Phone,
  Zap,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
  Star,
  CheckCircle,
  AlertTriangle,
  Wrench,
  ChevronRight,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'

const URG_AUTHOR = authors['sophie-martin']
const URG_REVIEWER = getReviewerForAuthor(URG_AUTHOR)
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { SITE_URL, PHONE_TEL, getAlternates } from '@/lib/seo/config'
import { safeJsonStringify } from '@/lib/seo/safe-json'
import { PlatformPhoneLabel } from '@/components/ui/PlatformPhoneLabel'
import { villes, services } from '@/lib/data/france'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import dynamic from 'next/dynamic'
import { getPublishedDate } from '@/lib/seo/published-dates'

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})

export const revalidate = 86400

const PUBLISHED_DATE = getPublishedDate('/urgence')

export const metadata: Metadata = {
  // Pivot full RGE 2026-05-03 (revert partiel) : hub /urgence reste
  // indexable, périmètre restreint aux trades qu'un artisan RGE peut
  // prendre (plombier, chauffagiste, electricien, couvreur, climaticien).
  // Les sous-pages hors whitelist sont noindex (cf. URGENCE_RGE_COMPATIBLE_SLUGS).
  title: 'Artisan RGE en urgence : plomberie, chauffage, électricité',
  description:
    'Plombier, chauffagiste, électricien, couvreur, climaticien : artisans RGE certifiés disponibles en urgence. Dépannage soir et week-end. Devis gratuit, SIREN vérifié.',
  alternates: getAlternates(`/urgence`),
  openGraph: {
    locale: 'fr_FR',
    title: 'Artisan RGE en urgence — Plomberie, chauffage, électricité',
    description:
      'Plombier, chauffagiste, électricien, couvreur, climaticien RGE certifiés en urgence. Dépannage soir et week-end. Devis gratuit.',
    url: `${SITE_URL}/urgence`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Urgence artisan RGE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisan RGE en urgence — Plomberie, chauffage, électricité',
    description:
      'Plombier, chauffagiste, électricien, couvreur, climaticien RGE en urgence. Devis gratuit.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const urgencyServices = [
  {
    name: 'Plombier urgence',
    slug: 'plombier',
    icon: Wrench,
    color: 'blue',
    bgGradient: 'from-primary-400 to-primary-500',
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
    description:
      "Intervention rapide pour toutes urgences de plomberie : fuites d'eau, dégâts des eaux, canalisations bouchées. Nos plombiers interviennent rapidement, selon disponibilité.",
    responseTime: 'Intervention rapide',
  },
  {
    name: 'Électricien urgence',
    slug: 'electricien',
    icon: Zap,
    color: 'amber',
    bgGradient: 'from-amber-500 to-amber-600',
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
    description:
      'Dépannage électrique en urgence, soir & week-end. Nos électriciens qualifiés interviennent rapidement pour sécuriser votre installation électrique.',
    responseTime: 'Intervention rapide',
  },
  // Pivot full RGE 2026-05-03 : carte 'Serrurier urgence' retirée (slug
  // serrurier commodity hors RGE — page /urgence reste centrée sur les 3
  // urgences RGE-canonical : plombier, electricien, chauffagiste).
  {
    name: 'Chauffagiste urgence',
    slug: 'chauffagiste',
    icon: AlertTriangle,
    color: 'red',
    bgGradient: 'from-red-500 to-red-600',
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
    description:
      'Dépannage chauffage en urgence : chaudière en panne, fuite de gaz, radiateurs défaillants. Intervention rapide par des chauffagistes qualifiés.',
    responseTime: 'Intervention rapide',
  },
]

const topEmergencyCities = villes.slice(0, 12)

const emergencySteps = [
  {
    step: 1,
    title: 'Décrivez votre urgence',
    description: 'Appelez-nous ou remplissez le formulaire avec les détails de votre problème.',
  },
  {
    step: 2,
    title: 'Mise en relation',
    description: 'Nous vous mettons en relation avec un artisan disponible dans votre secteur.',
  },
  {
    step: 3,
    title: 'Intervention rapide',
    description: "L'artisan intervient, résout le problème et vous fournit un devis détaillé.",
  },
]

export default async function UrgencePage() {
  const cmsPage = await getPageContent('urgence', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Urgence', url: '/urgence' },
          ])}
        />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'Urgence' }]} className="mb-4" />
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

  const dateModifiedIso = monthlyAnchorIso()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/urgence#article`,
    headline: `Artisan Urgence — Dépannage rapide ${new Date().getFullYear()}`,
    description: `Plombier, électricien, serrurier, chauffagiste en urgence. Intervention rapide soir & week-end dans ${villes.length}+ villes, devis transparent.`,
    url: `${SITE_URL}/urgence`,
    datePublished: PUBLISHED_DATE,
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Urgence dépannage',
    keywords: [
      'artisan urgence',
      'dépannage rapide',
      'plombier urgence',
      'électricien urgence',
      'serrurier urgence',
      'chauffagiste urgence',
      'soir week-end',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Dépannage urgent bâtiment' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Thing', name: 'Intervention rapide artisans' },
    ],
    image: `${SITE_URL}/opengraph-image`,
    author: URG_AUTHOR
      ? {
          '@type': 'Person',
          name: URG_AUTHOR.name,
          jobTitle: URG_AUTHOR.role,
          url: `${SITE_URL}/equipe/${URG_AUTHOR.slug}`,
          ...(URG_AUTHOR.methodology &&
            URG_AUTHOR.methodology.length > 0 && { skills: URG_AUTHOR.methodology }),
        }
      : {
          '@type': 'Organization',
          name: 'Équipe éditoriale ServicesArtisans',
          url: `${SITE_URL}/a-propos`,
          '@id': `${SITE_URL}#organization`,
        },
    ...(URG_REVIEWER && { reviewedBy: getReviewedByPersonSchema(URG_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/urgence` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `4 métiers urgence : plombier, électricien, serrurier, chauffagiste`,
    `Disponible soir & week-end, intervention rapide selon dispo locale`,
    `${villes.length}+ villes couvertes en France`,
    `Devis transparent — fuir les arnaques au tarif "express"`,
  ]

  const tldrBullets = [
    `Une urgence est une situation à risque immédiat (fuite d'eau, court-circuit, porte claquée nuit, fuite gaz). Pour la sécurité — pompiers 18, gaz 0 800 47 33 33, dépannage 112.`,
    `Notre service met en relation 4 corps de métier d'urgence avec des artisans vérifiés SIREN dans ${villes.length}+ villes, soir et week-end.`,
    `Toujours demander un devis écrit AVANT intervention non vitale. Refuser les "tarifs express" verbaux > 200 €/h sans détail.`,
    `Vérifier en arrivant : carte pro, SIRET, assurance décennale. Conserver tickets, photos, devis : indispensable pour assurance habitation.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={articleSchema} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Urgence soir & week-end' }]} />
        </div>
      </div>

      {/* Hero — Dark Emergency */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-charcoal-900 text-white py-20 overflow-hidden">
        {/* Animated pulse background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500 rounded-full blur-[150px] animate-pulse" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-red-500/30 backdrop-blur-sm border border-red-400/30 px-4 py-2 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-sm font-semibold text-red-100">
                Disponible soir et week-end
              </span>
            </div>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Urgence artisan ?<br />
            <span className="text-red-300">Intervention rapide 24h/7j.</span>
          </h1>
          <p className="text-xl text-red-100/80 max-w-2xl mb-10">
            Plombier, électricien, serrurier, chauffagiste — un artisan référencé intervient chez
            vous rapidement, jour et nuit, selon disponibilité.
          </p>

          {/* Emergency CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="flex flex-col items-center sm:items-start">
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-3 bg-red-500 hover:bg-red-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 hover:shadow-red-400/40 transition-all"
              >
                <Phone className="w-6 h-6" />
                Appeler l'assistance
              </a>
              <PlatformPhoneLabel variant="badge" className="mt-2" />
            </div>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Obtenir mon devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/80">Artisans référencés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/80">Intervention rapide</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/80">Disponible soir et week-end</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/80">Devis gratuit</span>
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

      {/* Emergency Services Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Services d'urgence
            </div>
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">Quel type d'urgence ?</h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Sélectionnez votre type de problème pour être mis en relation avec un artisan
              spécialisé disponible dans votre secteur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {urgencyServices.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.slug}
                  className="bg-white rounded-2xl border border-sand-300 overflow-hidden hover:shadow-xl hover:border-sand-400 transition-all group"
                >
                  <div className={`bg-gradient-to-r ${service.bgGradient} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{service.name}</h3>
                          <span className="text-sm opacity-80">
                            Temps de réponse : {service.responseTime}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Soir & week-end</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-charcoal-600 text-sm mb-4">{service.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {service.problems.map((problem) => (
                        <div
                          key={problem}
                          className={`flex items-center gap-2 text-sm ${service.lightBg} ${service.lightText} px-3 py-2 rounded-lg`}
                        >
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{problem}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/urgence/${service.slug}`}
                        className={`inline-flex items-center gap-2 font-semibold ${service.lightText} hover:underline`}
                      >
                        {service.name} soir & week-end
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-700"
                      >
                        Voir les tarifs
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How Emergency Works */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-500 rounded-full text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              En 3 étapes
            </div>
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">Comment ça marche ?</h2>
            <p className="text-charcoal-600 max-w-xl mx-auto">
              Un processus simple et rapide pour résoudre votre urgence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {emergencySteps.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 mb-2">{step.title}</h3>
                <p className="text-charcoal-600 text-sm">{step.description}</p>
                {step.step < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-red-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Emergency */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              Couverture nationale
            </div>
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">
              Urgence artisan dans votre ville
            </h2>
            <p className="text-charcoal-600 max-w-xl mx-auto">
              Nos artisans d'urgence interviennent dans plus de 140 villes en France.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {topEmergencyCities.map((ville) => (
              <Link
                key={ville.slug}
                href={`/villes/${ville.slug}`}
                className="bg-sand-50 hover:bg-red-50 border border-sand-300 hover:border-red-300 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal-900 group-hover:text-red-600 transition-colors">
                      {ville.name}
                    </div>
                    <div className="text-xs text-charcoal-500">{ville.departementCode}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/villes"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
            >
              Voir toutes les villes couvertes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Services by City — Internal Links */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-8">
            Services d'urgence par ville
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topEmergencyCities.slice(0, 6).map((ville) => (
              <div key={ville.slug} className="bg-white rounded-xl border border-sand-300 p-5">
                <h3 className="font-semibold text-charcoal-900 mb-3">Urgence à {ville.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {urgencyServices.map((service) => (
                    <Link
                      key={`${service.slug}-${ville.slug}`}
                      href={`/urgence/${service.slug}/${ville.slug}`}
                      className="text-sm text-charcoal-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-sand-200"
                    >
                      {service.name.split(' ')[0]} à {ville.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/villes/${ville.slug}`}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium mt-3"
                >
                  Tous les artisans <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">
              Pourquoi choisir ServicesArtisans ?
            </h2>
            <p className="text-charcoal-600 max-w-xl mx-auto">
              Des garanties concrètes pour votre tranquillité d'esprit.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-sand-50 rounded-2xl">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-charcoal-900 mb-2">Artisans référencés</h3>
              <p className="text-sm text-charcoal-600">
                Identité, SIRET et assurance contrôlés avant toute mise en relation.
              </p>
            </div>
            <div className="text-center p-6 bg-sand-50 rounded-2xl">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-bold text-charcoal-900 mb-2">Avis authentiques</h3>
              <p className="text-sm text-charcoal-600">
                Tous les avis sont authentiques et publiés par de vrais clients.
              </p>
            </div>
            <div className="text-center p-6 bg-sand-50 rounded-2xl">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="font-bold text-charcoal-900 mb-2">Devis gratuit</h3>
              <p className="text-sm text-charcoal-600">
                Recevez un devis détaillé avant toute intervention, sans engagement.
              </p>
            </div>
            <div className="text-center p-6 bg-sand-50 rounded-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="font-bold text-charcoal-900 mb-2">Intervention rapide</h3>
              <p className="text-sm text-charcoal-600">
                Un artisan disponible intervient chez vous rapidement, selon disponibilité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-charcoal-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Une urgence ? Ne perdez pas de temps.
          </h2>
          <p className="text-xl text-red-100/80 mb-8">
            Nos artisans référencés sont disponibles selon leurs horaires, y compris parfois les
            jours fériés pour intervenir rapidement chez vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex flex-col items-center">
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-3 bg-red-500 hover:bg-red-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 transition-all"
              >
                <Phone className="w-6 h-6" />
                Appeler l'assistance
              </a>
              <PlatformPhoneLabel variant="badge" className="mt-2" />
            </div>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Voir tous les services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section A0: Urgence par métier — all services hub link list */}
      {/* Garantit un inlink pour chaque /urgence/[service] page
          (sinon métiers hors top-4 restent orphans dans Ahrefs). */}
      <section className="py-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Tous les métiers en dépannage d'urgence
          </h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <Link
                key={`urg-all-${s.slug}`}
                href={`/urgence/${s.slug}`}
                className="text-sm text-charcoal-700 hover:text-red-600 bg-sand-50 hover:bg-red-50 border border-sand-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Urgence {s.name.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section A: Urgence par métier et ville — Service×City matrix */}
      <section className="py-12 border-t bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8">
            Urgence par métier et ville
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 8).map((service) => (
              <div key={service.slug}>
                <h3 className="font-semibold text-charcoal-900 mb-3">
                  Urgence {service.name.toLowerCase()}
                </h3>
                <div className="space-y-1.5">
                  {villes.slice(0, 6).map((ville) => (
                    <Link
                      key={ville.slug}
                      href={`/urgence/${service.slug}/${ville.slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" /> {ville.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section B: Cross-intent "Voir aussi" */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8">Voir aussi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Devis */}
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Demander un devis</h3>
              <div className="space-y-1.5">
                {services.slice(0, 10).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/devis/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" /> Devis {s.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            {/* Avis */}
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Avis clients</h3>
              <div className="space-y-1.5">
                {services.slice(0, 10).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/avis/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" /> Avis {s.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            {/* Tarifs */}
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Tarifs artisans</h3>
              <div className="space-y-1.5">
                {services.slice(0, 10).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/tarifs/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" /> Tarifs {s.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Navigation</h3>
              <div className="space-y-1.5">
                <Link
                  href="/services"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Tous les services
                </Link>
                <Link
                  href="/villes"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Toutes les villes
                </Link>
                <Link
                  href="/departements"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Tous les départements
                </Link>
                <Link
                  href="/regions"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Toutes les régions
                </Link>
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Blog
                </Link>
                <Link
                  href="/devis"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Demander un devis
                </Link>
                <Link
                  href="/tarifs"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Tarifs artisans
                </Link>
                <Link
                  href="/avis"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-red-600 py-1 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" /> Avis clients
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

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonStringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                name: 'Urgence artisan soir & week-end',
                description:
                  'Plombier, électricien, serrurier disponibles selon les artisans de votre secteur partout en France.',
                url: `${SITE_URL}/urgence`,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
                  { '@type': 'ListItem', position: 2, name: 'Urgence soir & week-end' },
                ],
              },
              ...urgencyServices.map((s) => ({
                '@type': 'Service',
                name: s.name,
                description: s.description,
                provider: {
                  '@type': 'Organization',
                  name: 'ServicesArtisans',
                  url: SITE_URL,
                },
                areaServed: {
                  '@type': 'Country',
                  name: 'France',
                },
                availableChannel: {
                  '@type': 'ServiceChannel',
                  serviceUrl: `${SITE_URL}/services/${s.slug}`,
                  availableLanguage: 'French',
                },
                hoursAvailable: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ],
                  opens: '00:00',
                  closes: '23:59',
                },
              })),
              {
                '@type': 'FAQPage',
                '@id': `${SITE_URL}/urgence#faq`,
                url: `${SITE_URL}/urgence`,
                name: 'FAQ — Urgence artisan soir & week-end',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: "Combien coûte une intervention d'urgence ?",
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "Les tarifs d'urgence incluent un forfait de déplacement (50-90 € en journée, 90-180 € en soirée/nuit/week-end) auquel s'ajoute le temps d'intervention (60-120 €/h). Une ouverture de porte simple coûte 80-200 € en journée, jusqu'à 400 € la nuit. Exigez toujours un devis signé AVANT intervention pour les interventions non-vitales.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: "Quel est le délai d'intervention réel ?",
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "Les délais d'intervention varient selon la disponibilité locale, l'heure et le type d'urgence : comptez typiquement 30 minutes à 2 heures pour une urgence plomberie/serrurerie en semaine et en zone urbaine, 1 à 4 heures la nuit ou le week-end. En zone rurale, le délai peut être plus long.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Dois-je payer le déplacement si je refuse le devis ?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "Oui. En urgence, un forfait de déplacement (variable selon l'artisan et l'heure) est généralement facturé même si vous refusez le devis. Demandez le montant à l'avance par téléphone et préférez les artisans qui annoncent clairement leur barème.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Mon assurance habitation couvre-t-elle l’intervention ?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "Pour un dégât des eaux, fuite ou sinistre couvert, votre assurance multirisque habitation peut prendre en charge l'intervention (franchise éventuelle). Appelez votre assureur AVANT d'appeler un artisan : il peut mobiliser un réseau agréé et garantir le remboursement. Conservez facture + photos.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Quand appeler le 18 ou le 112 plutôt qu’un artisan ?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "Composez le 18 (pompiers) ou le 112 pour toute urgence vitale ou risque immédiat : fuite de gaz avérée, incendie, odeur de brûlé prononcée, personne bloquée, inondation importante. Pour les urgences non-vitales (serrure cassée, fuite maîtrisée, panne de courant localisée), un artisan d'astreinte est adapté.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      <StickyMobileCTA />
      <ExitIntentPopup />
    </div>
  )
}
