import { Metadata } from 'next'
import Link from 'next/link'
import {
  Wrench,
  Zap,
  Key,
  Flame,
  PaintBucket,
  Home,
  Hammer,
  HardHat,
  Droplets,
  Wind,
  Thermometer,
  TreeDeciduous,
  Sofa,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Award,
  MapPin,
  Axe,
  Shield,
  Building,
  Paintbrush,
  Maximize,
  Bath,
  Sun,
  Snowflake,
  Leaf,
  PlugZap,
  Factory,
  Trees,
  ShieldAlert,
  ClipboardCheck,
  Truck,
} from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import TldrBlock from '@/components/flagship/TldrBlock'
import {
  getOrganizationSchema,
  getBreadcrumbSchema,
  getItemListSchema,
  getFAQSchema,
} from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { REVALIDATE } from '@/lib/cache'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularCitiesLinks, GeographicNavigation } from '@/components/InternalLinks'
import { services as staticServicesList } from '@/lib/data/france'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'

// Set of valid service slugs that have dedicated pages
const validServiceSlugs = new Set(staticServicesList.map((s) => s.slug))

// ISR: Revalidate every hour
export const revalidate = REVALIDATE.services

export const metadata: Metadata = {
  title: 'Tous les Métiers Artisans 2026',
  description: `${staticServicesList.length} métiers du bâtiment : plombier, électricien, serrurier, chauffagiste, peintre, couvreur. Artisans vérifiés SIREN, devis gratuit.`,
  alternates: getAlternates('/services'),
  openGraph: {
    title: 'Tous les Métiers Artisans 2026 — Devis Gratuit 24h',
    description: `${staticServicesList.length} métiers du bâtiment. Artisans référencés dans 101 départements. Trouvez un professionnel qualifié, devis gratuit.`,
    url: `${SITE_URL}/services`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Tous les services artisans',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tous les Métiers Artisans 2026 — Devis Gratuit 24h',
    description: `${staticServicesList.length} métiers du bâtiment : plombier, électricien, serrurier, chauffagiste, peintre, couvreur. Artisans vérifiés SIREN, devis gratuit.`,
  },
}

const allServices = [
  {
    category: 'Plomberie & Chauffage',
    icon: Droplets,
    color: 'blue',
    services: [
      {
        name: 'Plombier',
        slug: 'plombier',
        icon: Wrench,
        description: 'Réparation fuites, installation sanitaire, débouchage',
      },
      {
        name: 'Chauffagiste',
        slug: 'chauffagiste',
        icon: Flame,
        description: 'Chaudière, pompe à chaleur, plancher chauffant',
      },
      {
        name: 'Climaticien',
        slug: 'climaticien',
        icon: Wind,
        description: 'Installation et entretien climatisation',
      },
      {
        name: 'Salle de bain',
        slug: 'salle-de-bain',
        icon: Bath,
        description: 'Création et rénovation de salles de bain',
      },
      {
        name: 'Ramoneur',
        slug: 'ramoneur',
        icon: Factory,
        description: 'Ramonage cheminées et conduits',
      },
    ],
  },
  {
    category: 'Électricité & Domotique',
    icon: Zap,
    color: 'amber',
    services: [
      {
        name: 'Électricien',
        slug: 'electricien',
        icon: Zap,
        description: 'Installation, mise aux normes, dépannage',
      },
      {
        name: 'Borne de recharge',
        slug: 'borne-recharge',
        icon: PlugZap,
        description: 'Installation bornes véhicules électriques',
      },
    ],
  },
  {
    category: 'Sécurité',
    icon: ShieldCheck,
    color: 'green',
    services: [
      {
        name: 'Serrurier',
        slug: 'serrurier',
        icon: Key,
        description: 'Ouverture de porte, changement serrure, blindage',
      },
      {
        name: 'Alarme et sécurité',
        slug: 'alarme-securite',
        icon: ShieldAlert,
        description: "Alarme, vidéosurveillance, contrôle d'accès",
      },
    ],
  },
  {
    category: 'Gros œuvre & Maçonnerie',
    icon: HardHat,
    color: 'orange',
    services: [
      {
        name: 'Maçon',
        slug: 'macon',
        icon: HardHat,
        description: 'Construction, rénovation, extension',
      },
      {
        name: 'Couvreur',
        slug: 'couvreur',
        icon: Home,
        description: 'Toiture, zinguerie, étanchéité',
      },
      {
        name: 'Charpentier',
        slug: 'charpentier',
        icon: Axe,
        description: 'Charpente bois, ossature',
      },
      {
        name: 'Façadier',
        slug: 'facadier',
        icon: Building,
        description: 'Ravalement, isolation extérieure',
      },
      {
        name: 'Étanchéiste',
        slug: 'etancheiste',
        icon: Shield,
        description: 'Étanchéité toiture, terrasse, fondations',
      },
      {
        name: 'Zingueur',
        slug: 'zingueur',
        icon: Droplets,
        description: 'Gouttières, chéneaux, descentes',
      },
    ],
  },
  {
    category: 'Menuiserie & Agencement',
    icon: Hammer,
    color: 'violet',
    services: [
      {
        name: 'Menuisier',
        slug: 'menuisier',
        icon: Hammer,
        description: 'Fenêtres, portes, escaliers, placards',
      },
      {
        name: 'Cuisiniste',
        slug: 'cuisiniste',
        icon: Sofa,
        description: 'Conception et pose de cuisines',
      },
    ],
  },
  {
    category: 'Finitions & Revêtements',
    icon: PaintBucket,
    color: 'pink',
    services: [
      {
        name: 'Peintre en bâtiment',
        slug: 'peintre-en-batiment',
        icon: PaintBucket,
        description: 'Peinture intérieure et extérieure',
      },
      {
        name: 'Carreleur',
        slug: 'carreleur',
        icon: Sparkles,
        description: 'Pose carrelage, faïence, mosaïque',
      },
      {
        name: 'Plâtrier',
        slug: 'platrier',
        icon: Paintbrush,
        description: 'Cloisons, plafonds, isolation',
      },
    ],
  },
  {
    category: 'Vitrerie',
    icon: Maximize,
    color: 'slate',
    services: [
      {
        name: 'Vitrier',
        slug: 'vitrier',
        icon: Maximize,
        description: 'Remplacement vitres, miroirs, double vitrage',
      },
    ],
  },
  {
    category: 'Énergie & Rénovation',
    icon: Leaf,
    color: 'emerald',
    services: [
      {
        name: 'Pompe à chaleur',
        slug: 'pompe-a-chaleur',
        icon: Thermometer,
        description: 'Installation et entretien PAC',
      },
      {
        name: 'Panneaux solaires',
        slug: 'panneaux-solaires',
        icon: Sun,
        description: 'Photovoltaïque et solaire thermique',
      },
      {
        name: 'Isolation thermique',
        slug: 'isolation-thermique',
        icon: Snowflake,
        description: 'ITE, ITI, combles, planchers',
      },
      {
        name: 'Rénovation énergétique',
        slug: 'renovation-energetique',
        icon: Leaf,
        description: "Audit, travaux globaux, aides MaPrimeRénov'",
      },
    ],
  },
  {
    category: 'Extérieur & Jardin',
    icon: TreeDeciduous,
    color: 'emerald',
    services: [
      {
        name: 'Jardinier',
        slug: 'jardinier',
        icon: TreeDeciduous,
        description: 'Création et entretien jardins',
      },
      {
        name: 'Paysagiste',
        slug: 'paysagiste',
        icon: Trees,
        description: 'Aménagement paysager, terrasses',
      },
    ],
  },
  {
    category: 'Diagnostics & Expertises',
    icon: ClipboardCheck,
    color: 'blue',
    services: [
      {
        name: 'Diagnostiqueur',
        slug: 'diagnostiqueur',
        icon: ClipboardCheck,
        description: 'DPE, amiante, plomb, électricité',
      },
    ],
  },
  {
    category: 'Hygiène',
    icon: Sparkles,
    color: 'orange',
    services: [
      {
        name: 'Nettoyage professionnel',
        slug: 'nettoyage',
        icon: Sparkles,
        description: 'Nettoyage professionnel, remise en état',
      },
    ],
  },
  {
    category: 'Déménagement & Transport',
    icon: Truck,
    color: 'slate',
    services: [
      {
        name: 'Déménageur',
        slug: 'demenageur',
        icon: Truck,
        description: 'Déménagement, transport de meubles',
      },
    ],
  },
]

const colorClasses: Record<string, { bg: string; icon: string; hover: string }> = {
  blue: { bg: 'bg-primary-50', icon: 'text-primary-500', hover: 'group-hover:bg-primary-100' },
  amber: {
    bg: 'bg-secondary-50',
    icon: 'text-secondary-600',
    hover: 'group-hover:bg-secondary-100',
  },
  green: { bg: 'bg-accent-50', icon: 'text-accent-600', hover: 'group-hover:bg-accent-100' },
  orange: { bg: 'bg-primary-50', icon: 'text-primary-400', hover: 'group-hover:bg-primary-100' },
  violet: { bg: 'bg-sand-100', icon: 'text-charcoal-600', hover: 'group-hover:bg-sand-200' },
  pink: { bg: 'bg-primary-50', icon: 'text-primary-300', hover: 'group-hover:bg-primary-100' },
  emerald: { bg: 'bg-accent-50', icon: 'text-accent-500', hover: 'group-hover:bg-accent-100' },
  slate: { bg: 'bg-sand-100', icon: 'text-charcoal-500', hover: 'group-hover:bg-sand-200' },
}

export default async function ServicesPage() {
  const cmsPage = await getPageContent('services', 'static')

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
          <div className="max-w-6xl mx-auto px-4">
            <CmsContent html={cmsPage.content_html} />
          </div>
        </section>
      </div>
    )
  }

  // JSON-LD structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
  ])

  const organizationSchema = getOrganizationSchema()

  // ItemList schema: flat list of all services with their URLs
  const allServiceItems = allServices.flatMap((category) =>
    category.services.filter((s) => validServiceSlugs.has(s.slug))
  )
  const itemListSchema = getItemListSchema({
    name: 'Tous les métiers artisans',
    description: `${allServiceItems.length} métiers du bâtiment : plombier, électricien, serrurier, chauffagiste, peintre, couvreur, menuisier. Artisans vérifiés SIREN dans 101 départements.`,
    url: '/services',
    items: allServiceItems.map((s, index) => ({
      name: s.name,
      url: `/services/${s.slug}`,
      position: index + 1,
    })),
  })

  const faqSchema = getFAQSchema([
    {
      question: 'Comment trouver un artisan qualifié pour mes travaux ?',
      answer: `Sélectionnez votre métier parmi les ${allServiceItems.length} corps de métier référencés, puis votre ville ou département. Chaque artisan est vérifié SIREN auprès de l'INSEE et sa qualification RGE (si applicable) est synchronisée hebdomadairement avec la base officielle ADEME france-renov.gouv.fr.`,
    },
    {
      question: 'Les artisans sont-ils vraiment vérifiés ?',
      answer:
        "Oui. Chaque fiche artisan est liée à un SIRET actif vérifié auprès de l'INSEE (base Sirene). Pour les travaux d'économie d'énergie, nous affichons également la qualification RGE (QualiPAC, QualiBois, Qualibat, Qualifelec) issue de la base officielle ADEME. Les fiches avec SIRET inactif ou en cessation sont automatiquement masquées.",
    },
    {
      question: 'Dois-je payer pour obtenir un devis ?',
      answer:
        'Non, la demande de devis est 100 % gratuite et sans engagement. Vous remplissez un formulaire précisant votre besoin (métier, ville, type de travaux, budget). Votre demande est transmise à un seul artisan : nous ne partageons jamais votre projet entre plusieurs professionnels.',
    },
    {
      question: 'Combien de temps pour recevoir une réponse ?',
      answer:
        "Nos artisans partenaires s'engagent à répondre sous 24 à 48 heures ouvrées. Pour les urgences (plomberie, électricité, serrurerie, vitrerie), utilisez la section dédiée : les artisans en garde répondent en moyenne en 30 minutes à 2 heures.",
    },
    {
      question: 'Que faire en cas de litige avec un artisan ?',
      answer:
        "En cas de désaccord avec un artisan, privilégiez d'abord la discussion écrite (mail recommandé) détaillant les points litigieux. Si le dialogue échoue, vous pouvez saisir gratuitement le médiateur de la consommation du bâtiment. Notre équipe peut vous orienter vers les recours adaptés et suspendre la fiche artisan si les faits sont avérés.",
    },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      {/* JSON-LD */}
      <JsonLd data={[breadcrumbSchema, organizationSchema, itemListSchema, faqSchema]} />

      {/* Premium Hero — Charcoal + Terracotta */}
      <section className="relative bg-gradient-hero text-white py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Award className="w-4 h-4 text-secondary-400" />
            <span className="text-sm font-medium text-white/90">
              {staticServicesList.length} métiers du bâtiment
            </span>
          </div>

          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            Tous nos{' '}
            <span className="bg-gradient-terra bg-clip-text text-transparent">services</span>{' '}
            artisans
          </h1>
          <p className="text-xl text-sand-300 max-w-2xl mx-auto mb-6">
            Trouvez le professionnel idéal pour tous vos travaux. Artisans référencés, devis
            gratuits.
          </p>

          {/* GeoPageCTA above the fold */}
          <div className="max-w-2xl mx-auto mb-10">
            <GeoPageCTA
              title="Trouvez votre artisan en 2 minutes"
              subtitle="Devis gratuit et sans engagement d'artisans vérifiés"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <TrendingUp className="w-5 h-5 text-primary-300" />
              <div className="text-left">
                <div className="text-2xl font-bold text-white">2h</div>
                <div className="text-xs text-sand-400">Temps de réponse</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb + Navigation */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Services' }]} className="mb-4" />
          <GeographicNavigation />
        </div>
      </section>

      {/* Sprint 10x — TldrBlock featured snippets / AI Overviews. */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <TldrBlock
            title="L'essentiel des services artisans 2026"
            bullets={[
              `${staticServicesList.length} métiers du bâtiment couverts (plombier, électricien, chauffagiste, etc.)`,
              'Artisans vérifiés SIREN officiel + sync ADEME pour qualifications RGE',
              'Devis gratuit sous 24h, sans engagement, lead exclusif (1 demande = 1 artisan)',
              'Couverture nationale : 101 départements, 35 000+ communes',
            ]}
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allServices.map((category) => {
            const CategoryIcon = category.icon
            const colors = colorClasses[category.color]

            return (
              <div key={category.category} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div
                    className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center shadow-sm`}
                  >
                    <CategoryIcon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
                      {category.category}
                    </h2>
                    <p className="text-sm text-charcoal-500">
                      {category.services.length} services disponibles
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {category.services.map((service) => {
                    const Icon = service.icon
                    const hasPage = validServiceSlugs.has(service.slug)

                    if (hasPage) {
                      return (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className="group relative bg-white rounded-2xl border border-sand-200 p-6 hover:border-primary-200 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sand-50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative">
                            <div
                              className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 ${colors.hover} transition-colors`}
                            >
                              <Icon className={`w-6 h-6 ${colors.icon}`} />
                            </div>
                            <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-2">
                              {service.name}
                            </h3>
                            <p className="text-sm text-charcoal-500 leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                          <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-charcoal-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                      )
                    }

                    return (
                      <div
                        key={service.slug}
                        className="relative bg-white rounded-2xl border border-sand-200 p-6 opacity-75"
                      >
                        <div className="absolute top-3 right-3 text-xs bg-sand-200 text-charcoal-500 px-2 py-1 rounded-full">
                          Bientôt
                        </div>
                        <div
                          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}
                        >
                          <Icon className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                        <h3 className="font-semibold text-charcoal-900 mb-2">{service.name}</h3>
                        <p className="text-sm text-charcoal-500 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Maillage interne: Villes populaires */}
          <div className="mt-16 pt-12 border-t border-sand-300">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 flex items-center gap-3 tracking-tight">
              <MapPin className="w-6 h-6 text-primary-400" />
              Trouvez un artisan par ville
            </h2>
            <PopularCitiesLinks showTitle={false} limit={10} />
          </div>

          {/* Liens contextuels : carte, réalisations, badge */}
          <div className="mt-12 pt-10 border-t border-sand-200">
            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-5 tracking-tight">
              Explorez aussi
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/carte-artisans"
                className="group bg-white rounded-2xl border border-sand-200 p-5 hover:border-primary-200 hover:shadow-card-hover transition-all"
              >
                <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-1">
                  Carte des artisans
                </h3>
                <p className="text-sm text-charcoal-500">
                  Visualisez la couverture nationale dans les 101 départements.
                </p>
              </Link>
              <Link
                href="/avant-apres"
                className="group bg-white rounded-2xl border border-sand-200 p-5 hover:border-primary-200 hover:shadow-card-hover transition-all"
              >
                <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-1">
                  Avant / Après travaux
                </h3>
                <p className="text-sm text-charcoal-500">
                  12 transformations de rénovation avec budgets et durées.
                </p>
              </Link>
              <Link
                href="/badge-artisan"
                className="group bg-white rounded-2xl border border-sand-200 p-5 hover:border-primary-200 hover:shadow-card-hover transition-all"
              >
                <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-1">
                  Badge Artisan Vérifié
                </h3>
                <p className="text-sm text-charcoal-500">
                  Générez votre badge de certification gratuit pour votre site.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 backdrop-blur-sm rounded-full border border-primary-400/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary-300" />
            <span className="text-sm font-medium text-primary-200">
              Devis gratuit en quelques clics
            </span>
          </div>

          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Vous ne trouvez pas votre métier ?
          </h2>
          <p className="text-xl text-sand-300 mb-10 max-w-xl mx-auto">
            Contactez-nous et nous vous aiderons à trouver le bon artisan pour votre projet.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-400 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
