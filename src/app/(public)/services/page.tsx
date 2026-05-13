import { Metadata } from 'next'
import Link from 'next/link'
import {
  Wrench,
  Zap,
  Flame,
  PaintBucket,
  Home,
  Hammer,
  HardHat,
  Droplets,
  Wind,
  Thermometer,
  ArrowRight,
  Award,
  MapPin,
  Axe,
  Shield,
  Building,
  Paintbrush,
  Bath,
  Sun,
  Snowflake,
  Leaf,
  PlugZap,
  Factory,
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import TldrBlock from '@/components/flagship/TldrBlock'
import EnBrefBox from '@/components/seo/EnBrefBox'
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

const validServiceSlugs = new Set(staticServicesList.map((s) => s.slug))

export const revalidate = REVALIDATE.services

export const metadata: Metadata = {
  title: 'Tous les Métiers RGE Artisans 2026',
  description: `${staticServicesList.length} métiers RGE du bâtiment : pompe à chaleur, isolation, chauffagiste, peintre, couvreur, plombier, électricien. Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC), devis gratuit.`,
  alternates: getAlternates('/services'),
  openGraph: {
    title: 'Tous les Métiers RGE Artisans 2026 — Devis Gratuit 24h',
    description: `${staticServicesList.length} métiers RGE du bâtiment. Artisans RGE certifiés dans 101 départements. Trouvez un professionnel certifié RGE, devis gratuit éligible MaPrimeRénov' & CEE.`,
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
    description: `${staticServicesList.length} métiers RGE du bâtiment : plombier, électricien, chauffagiste, couvreur, pompe à chaleur, isolation. Artisans certifiés ADEME, devis gratuit.`,
  },
}

type ServiceCategoryColor = 'primary' | 'accent' | 'secondary' | 'sand'

interface ServiceItem {
  name: string
  slug: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

interface ServiceCategory {
  category: string
  icon: React.ComponentType<{ className?: string }>
  color: ServiceCategoryColor
  services: ServiceItem[]
}

const allServices: ServiceCategory[] = [
  {
    category: 'Énergie & Rénovation',
    icon: Leaf,
    color: 'accent',
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
    category: 'Plomberie & Chauffage',
    icon: Droplets,
    color: 'primary',
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
    color: 'secondary',
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
    category: 'Gros œuvre & Maçonnerie',
    icon: HardHat,
    color: 'sand',
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
    category: 'Menuiserie & Finitions',
    icon: Hammer,
    color: 'primary',
    services: [
      {
        name: 'Menuisier',
        slug: 'menuisier',
        icon: Hammer,
        description: 'Fenêtres, portes, escaliers, placards',
      },
      {
        name: 'Peintre en bâtiment',
        slug: 'peintre-en-batiment',
        icon: PaintBucket,
        description: 'Peinture intérieure et extérieure',
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
    category: 'Diagnostics & Expertises',
    icon: ClipboardCheck,
    color: 'accent',
    services: [
      {
        name: 'Diagnostiqueur',
        slug: 'diagnostiqueur',
        icon: ClipboardCheck,
        description: 'DPE, amiante, plomb, électricité',
      },
    ],
  },
]

const colorTokens: Record<
  ServiceCategoryColor,
  { tile: string; icon: string; chip: string; ring: string }
> = {
  primary: {
    tile: 'bg-primary-50',
    icon: 'text-primary-500',
    chip: 'bg-primary-500/10 text-primary-700 border-primary-200',
    ring: 'group-hover:border-primary-300',
  },
  accent: {
    tile: 'bg-accent-50',
    icon: 'text-accent-600',
    chip: 'bg-accent-500/10 text-accent-700 border-accent-200',
    ring: 'group-hover:border-accent-300',
  },
  secondary: {
    tile: 'bg-secondary-50',
    icon: 'text-secondary-600',
    chip: 'bg-secondary-500/10 text-secondary-800 border-secondary-200',
    ring: 'group-hover:border-secondary-300',
  },
  sand: {
    tile: 'bg-sand-100',
    icon: 'text-charcoal-700',
    chip: 'bg-sand-200 text-charcoal-700 border-sand-300',
    ring: 'group-hover:border-charcoal-300',
  },
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

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
  ])

  const organizationSchema = getOrganizationSchema()

  const allServiceItems = allServices.flatMap((category) =>
    category.services.filter((s) => validServiceSlugs.has(s.slug))
  )
  const itemListSchema = getItemListSchema({
    name: 'Tous les métiers RGE artisans',
    description: `${allServiceItems.length} métiers RGE du bâtiment : pompe à chaleur, isolation, chauffagiste, peintre, couvreur, plombier, électricien, menuisier. Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC) dans 101 départements.`,
    url: '/services',
    items: allServiceItems.map((s, index) => ({
      name: s.name,
      url: `/services/${s.slug}`,
      position: index + 1,
    })),
  })

  const faqSchema = getFAQSchema([
    {
      question: 'Comment trouver un artisan RGE certifié pour mes travaux ?',
      answer: `Sélectionnez votre métier parmi les ${allServiceItems.length} corps de métier RGE de l'annuaire, puis votre ville ou département. Chaque artisan affiché est RGE certifié (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) — qualifications synchronisées hebdomadairement avec la base officielle ADEME france-renov.gouv.fr — et son SIRET est vérifié auprès de l'INSEE.`,
    },
    {
      question: 'Les artisans sont-ils vraiment RGE certifiés ?',
      answer:
        "Oui. Pivot full RGE 2026-05-05 : ServicesArtisans n'affiche publiquement que des artisans RGE certifiés. Chaque fiche artisan est liée à un SIRET actif vérifié auprès de l'INSEE (base Sirene) ET à une qualification RGE valide (QualiPAC, QualiBois, Qualibat, Qualifelec, Qualit'EnR) issue de la base officielle ADEME france-renov.gouv.fr — synchronisée chaque semaine. Les fiches avec SIRET inactif, en cessation, ou avec qualification RGE expirée sont automatiquement masquées.",
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
      <JsonLd data={[breadcrumbSchema, organizationSchema, itemListSchema, faqSchema]} />

      {/* HERO — épuré façon Hellio/Effy */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-500/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
          </div>

          <div className="relative px-6 md:px-12 lg:px-16 py-16 md:py-24">
            <div className="mb-6">
              <Breadcrumb
                items={[{ label: 'Services' }]}
                className="text-charcoal-300 [&_a]:text-charcoal-300 [&_a:hover]:text-primary-300"
              />
            </div>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-sm font-medium text-white/90 mb-6">
                <Award className="w-4 h-4 text-secondary-400" aria-hidden="true" />
                {staticServicesList.length} métiers RGE référencés
              </span>

              <h1
                data-speakable="true"
                className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6"
              >
                Tous les métiers du bâtiment,
                <br className="hidden md:block" />{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-secondary-400">
                  100 % artisans RGE certifiés.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-charcoal-200 leading-relaxed max-w-2xl mb-10">
                Plombier, chauffagiste, couvreur, isolation, pompe à chaleur, panneaux solaires —
                tous nos artisans sont qualifiés Qualibat, Qualifelec, QualiPAC ou Qualit&apos;EnR.
                Devis gratuit éligible MaPrimeRénov&apos; et CEE.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/devis"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-cta hover:shadow-cta-hover transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900 focus-visible:ring-primary-300"
                >
                  Obtenir mon devis gratuit
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
                <Link
                  href="#metiers"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Voir les {allServiceItems.length} métiers
                </Link>
              </div>
            </div>

            {/* Stats bento */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { value: '49 000+', label: 'Artisans RGE actifs' },
                { value: '101', label: 'Départements couverts' },
                { value: '24 h', label: 'Délai moyen devis' },
                { value: '100 %', label: 'SIREN vérifiés INSEE' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-5"
                >
                  <div className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    {s.value}
                  </div>
                  <div className="text-sm text-charcoal-300 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GeoPageCTA + GeographicNavigation */}
      <section className="bg-sand-50 border-b border-sand-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GeoPageCTA
            title="Trouvez votre artisan RGE en 2 minutes"
            subtitle="Devis gratuit et sans engagement d'artisans RGE certifiés"
          />
        </div>
      </section>

      <section className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <GeographicNavigation />
        </div>
      </section>

      {/* TldrBlock + EnBrefBox */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <TldrBlock
            title="L'essentiel des services artisans RGE 2026"
            bullets={[
              `${staticServicesList.length} métiers RGE du bâtiment couverts (pompe à chaleur, isolation, chauffagiste, etc.)`,
              "Annuaire 100% artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) — sync ADEME hebdomadaire",
              "Devis gratuit sous 24h, sans engagement, lead exclusif (1 demande = 1 artisan), éligible MaPrimeRénov' & CEE",
              'Couverture nationale : 101 départements, 35 000+ communes',
            ]}
          />
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
          <EnBrefBox
            title="Annuaire artisans RGE en bref"
            summary={`Le 1er annuaire 100% artisans RGE certifiés en France : ${staticServicesList.length} métiers RGE couverts (Qualibat, Qualifelec, QualiPAC, Qualit'EnR), sync hebdomadaire ADEME pour les qualifications + SIREN officiel. Devis gratuit sous 24h, sans engagement, lead exclusif, éligible MaPrimeRénov' & CEE.`}
            keyPoints={[
              `${staticServicesList.length} corps de métier RGE référencés`,
              `Qualifications RGE synchronisées chaque semaine avec la base ADEME`,
              `Vérification SIREN automatisée à l'inscription`,
              `Lead exclusif : 1 demande de devis = 1 artisan choisi`,
            ]}
          />
        </div>
      </section>

      {/* CATALOGUE — bento par catégorie, blocs aérés */}
      <section id="metiers" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-primary-500 tracking-[0.18em] uppercase mb-3">
              Catalogue
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Quel métier pour vos travaux&nbsp;?
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              {allServiceItems.length} corps de métier RGE certifiés, organisés par grandes
              familles. Cliquez sur un métier pour voir les artisans dans votre ville.
            </p>
          </div>

          <div className="space-y-14 md:space-y-20">
            {allServices.map((category) => {
              const CategoryIcon = category.icon
              const tokens = colorTokens[category.color]

              return (
                <div key={category.category}>
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={`w-14 h-14 rounded-2xl ${tokens.tile} flex items-center justify-center shadow-sm`}
                      aria-hidden="true"
                    >
                      <CategoryIcon className={`w-7 h-7 ${tokens.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-charcoal-900">
                        {category.category}
                      </h3>
                      <p className="text-sm text-charcoal-500">
                        {category.services.length} métiers disponibles
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.services.map((service) => {
                      const Icon = service.icon
                      const hasPage = validServiceSlugs.has(service.slug)
                      const cardBase =
                        'group relative rounded-3xl bg-white border border-sand-200 p-6 transition-all duration-300'

                      if (hasPage) {
                        return (
                          <Link
                            key={service.slug}
                            href={`/services/${service.slug}`}
                            className={`${cardBase} hover:shadow-card-hover hover:-translate-y-0.5 ${tokens.ring}`}
                            aria-label={`Voir les artisans RGE certifiés ${service.name}`}
                          >
                            <div
                              className={`w-12 h-12 rounded-2xl ${tokens.tile} flex items-center justify-center mb-5`}
                              aria-hidden="true"
                            >
                              <Icon className={`w-6 h-6 ${tokens.icon}`} />
                            </div>
                            <h4 className="font-heading text-lg font-bold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-2">
                              {service.name}
                            </h4>
                            <p className="text-sm text-charcoal-500 leading-relaxed">
                              {service.description}
                            </p>
                            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 group-hover:gap-2.5 transition-all">
                              Voir les artisans
                              <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </div>
                          </Link>
                        )
                      }

                      return (
                        <div
                          key={service.slug}
                          className={`${cardBase} opacity-70`}
                          aria-label={`${service.name} — bientôt disponible`}
                        >
                          <span
                            className={`absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tokens.chip}`}
                          >
                            Bientôt
                          </span>
                          <div
                            className={`w-12 h-12 rounded-2xl ${tokens.tile} flex items-center justify-center mb-5`}
                            aria-hidden="true"
                          >
                            <Icon className={`w-6 h-6 ${tokens.icon}`} />
                          </div>
                          <h4 className="font-heading text-lg font-bold text-charcoal-900 mb-2">
                            {service.name}
                          </h4>
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
          </div>
        </div>
      </section>

      {/* ENGAGEMENTS — gros bloc accent comme Hellio */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-accent-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true">
            <div className="absolute inset-0 bg-hero-pattern" />
          </div>
          <div className="relative grid lg:grid-cols-12 gap-10 px-6 md:px-12 lg:px-16 py-16 md:py-20">
            <div className="lg:col-span-5">
              <span className="inline-block text-xs font-bold text-accent-200 tracking-[0.18em] uppercase mb-3">
                Nos engagements
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Pourquoi choisir un artisan RGE certifié&nbsp;?
              </h2>
              <p className="mt-5 text-accent-100/90 leading-relaxed text-lg">
                La mention RGE est délivrée par des organismes accrédités COFRAC. Elle conditionne
                l&apos;accès aux aides publiques et garantit le sérieux technique de l&apos;artisan.
              </p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Aides MaPrimeRénov' débloquées",
                  desc: 'La qualification RGE active à la signature du devis ouvre droit à toutes les aides Anah.',
                },
                {
                  title: 'Primes CEE versées',
                  desc: 'Effy, Sonergia, TotalEnergies, EDF — primes calculées et versées par les délégataires obligés.',
                },
                {
                  title: 'TVA à 5,5 %',
                  desc: 'Taux réduit appliqué directement sur la facture pour les travaux énergétiques éligibles.',
                },
                {
                  title: 'Éco-PTZ jusqu’à 50 000 €',
                  desc: 'Prêt à taux zéro pour la rénovation globale, conditionné au recours à un artisan RGE.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/15 p-6"
                >
                  <CheckCircle2 className="w-6 h-6 text-secondary-300 mb-3" aria-hidden="true" />
                  <div className="font-heading font-bold text-lg mb-1.5">{item.title}</div>
                  <p className="text-sm text-accent-100/80 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAILLAGE INTERNE — villes + ressources */}
      <section className="bg-white border-t border-sand-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <span className="inline-block text-xs font-bold text-primary-500 tracking-[0.18em] uppercase mb-3">
                Maillage géographique
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900 mb-4">
                Trouvez un artisan par ville.
              </h2>
              <p className="text-charcoal-600 leading-relaxed mb-6">
                Couverture nationale&nbsp;: 35 000+ communes, 101 départements. Cliquez sur une
                grande ville pour découvrir les artisans RGE disponibles.
              </p>
              <Link
                href="/villes"
                className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold transition-colors"
              >
                Voir toutes les villes <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-sand-50 border border-sand-200 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5 text-charcoal-700">
                  <MapPin className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  <span className="text-sm font-semibold">Top villes</span>
                </div>
                <PopularCitiesLinks showTitle={false} limit={10} />
              </div>
            </div>
          </div>

          <div className="mt-14 pt-12 border-t border-sand-200">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-charcoal-900 mb-8">
              Explorer également
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  href: '/carte-artisans',
                  title: 'Carte des artisans',
                  desc: 'Visualisez la couverture nationale dans les 101 départements.',
                },
                {
                  href: '/avant-apres',
                  title: 'Avant / Après travaux',
                  desc: '12 transformations de rénovation avec budgets et durées.',
                },
                {
                  href: '/badge-artisan',
                  title: 'Badge Artisan Vérifié',
                  desc: 'Générez votre badge de certification gratuit pour votre site.',
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-3xl bg-white border border-sand-200 p-6 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300"
                >
                  <h3 className="font-heading font-bold text-lg text-charcoal-900 group-hover:text-primary-500 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-charcoal-500 leading-relaxed">{card.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 group-hover:gap-2.5 transition-all">
                    Découvrir <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-primary-500 via-primary-500 to-primary-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-400/15 blur-3xl" />
          </div>
          <div className="relative px-6 md:px-12 lg:px-20 py-16 md:py-20 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-medium text-white mb-5">
                <Sparkles className="w-4 h-4 text-secondary-300" aria-hidden="true" />
                Devis gratuit en 30 secondes
              </span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
                Vous ne trouvez pas votre métier&nbsp;?
              </h2>
              <p className="text-lg text-primary-50/95 leading-relaxed max-w-xl">
                Décrivez votre projet&nbsp;: nous orienterons votre demande vers l&apos;artisan RGE
                certifié le plus pertinent dans votre secteur.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white text-primary-700 font-bold shadow-cta hover:bg-sand-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500 focus-visible:ring-white"
              >
                Demander un devis
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-secondary-500 hover:bg-secondary-400 text-charcoal-900 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500 focus-visible:ring-secondary-300"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
