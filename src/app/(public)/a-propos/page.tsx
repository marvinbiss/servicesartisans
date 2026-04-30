import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Search, Lock, Eye, ArrowRight, Database, Users } from 'lucide-react'
import { pageImages, BLUR_PLACEHOLDER } from '@/lib/data/images'
import Breadcrumb from '@/components/Breadcrumb'
import { createAdminClient } from '@/lib/supabase/admin'
import JsonLd from '@/components/JsonLd'
import { getOrganizationSchema, getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { companyIdentity } from '@/lib/config/company-identity'
import { getPageContent } from '@/lib/cms'
import { teamMembers, getAllAuthors } from '@/lib/data/team'
import { CmsContent } from '@/components/CmsContent'
import dynamic from 'next/dynamic'
const GeoPageCTA = dynamic(() => import('@/components/conversion/GeoPageCTA'), { ssr: false })

export const metadata: Metadata = {
  title: "À propos — Annuaire d'artisans gratuit",
  description:
    "ServicesArtisans référence des milliers d'artisans grâce aux données ouvertes du gouvernement. Annuaire gratuit, transparent et fiable pour trouver un artisan.",
  alternates: getAlternates('/a-propos'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: "À propos — Annuaire d'artisans en France",
    description:
      "ServicesArtisans référence des milliers d'artisans grâce aux données ouvertes du gouvernement. Annuaire gratuit, transparent et fiable.",
    url: `${SITE_URL}/a-propos`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Annuaire des artisans en France',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "À propos — Annuaire d'artisans en France",
    description:
      "ServicesArtisans référence des milliers d'artisans grâce aux données ouvertes du gouvernement.",
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 3600

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

// Fallback stats used when DB is unavailable during static generation
const FALLBACK_STATS = { artisanCount: 0, reviewCount: 0, cityCount: 0 }

async function getStats() {
  if (IS_BUILD) return FALLBACK_STATS
  try {
    const supabase = createAdminClient()

    // Try materialized view first (single query ~5ms vs 3 queries O(n))
    try {
      const { data: stats, error } = await Promise.race([
        supabase
          .from('mv_provider_stats')
          .select('active_count, unique_cities, total_reviews, providers_with_reviews')
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('getStats MV timeout')), 6_000)
        ),
      ])

      if (!error && stats) {
        return {
          artisanCount: stats.active_count || FALLBACK_STATS.artisanCount,
          reviewCount: stats.total_reviews || FALLBACK_STATS.reviewCount,
          cityCount: stats.unique_cities || FALLBACK_STATS.cityCount,
        }
      }
    } catch {
      // MV not available — fall through to legacy queries
    }

    // Fallback: legacy 3-query approach if MV doesn't exist yet
    const result = await Promise.race([
      Promise.all([
        supabase
          .from('providers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('providers')
          .select('review_count')
          .eq('is_active', true)
          .gt('review_count', 0),
        supabase.from('providers').select('address_city').eq('is_active', true),
      ]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('getStats timeout')), 6_000)
      ),
    ])

    const [{ count: artisanCount }, { data: providerStats }, { data: cities }] = result

    const totalReviews = providerStats?.reduce((sum, p) => sum + (p.review_count || 0), 0) || 0
    const uniqueCities = new Set(cities?.map((c) => c.address_city).filter(Boolean)).size

    return {
      artisanCount: artisanCount || FALLBACK_STATS.artisanCount,
      reviewCount: totalReviews || FALLBACK_STATS.reviewCount,
      cityCount: uniqueCities || FALLBACK_STATS.cityCount,
    }
  } catch {
    return FALLBACK_STATS
  }
}

const verificationSteps = [
  {
    icon: Database,
    title: 'Données SIREN officielles',
    description:
      "Chaque artisan provient de l'API Annuaire des Entreprises du gouvernement. Numéro SIREN, activité et adresse sont issus des données publiques officielles.",
  },
  {
    icon: Shield,
    title: 'Assurance RC professionnelle',
    description:
      "Nous demandons une attestation d'assurance responsabilité civile professionnelle en cours de validité.",
  },
  {
    icon: Lock,
    title: 'Garantie décennale',
    description:
      'Pour les métiers du bâtiment concernés, la garantie décennale est contrôlée avant toute mise en ligne.',
  },
  {
    icon: Eye,
    title: 'Avis authentiques',
    description:
      'Seuls les clients ayant fait appel à un artisan via la plateforme peuvent laisser un avis.',
  },
]

const commitments = [
  {
    title: 'Zéro information inventée',
    description:
      'Toutes les données proviennent des registres officiels SIREN. Aucun profil inventé sur la plateforme.',
  },
  {
    title: 'Données protégées',
    description: (
      <>
        Conformité RGPD, données hébergées en Europe, DPO joignable à{' '}
        <a href="mailto:dpo@servicesartisans.fr" className="text-primary-500 hover:underline">
          dpo@servicesartisans.fr
        </a>
        .
      </>
    ),
  },
  {
    title: 'Transparence tarifaire',
    description:
      'Service entièrement gratuit pour tous les utilisateurs, particuliers comme artisans.',
  },
  {
    title: 'Pas de revente de données',
    description: 'Vos données personnelles ne sont jamais vendues à des tiers. Jamais.',
  },
]

export default async function AProposPage() {
  const cmsPage = await getPageContent('a-propos', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'À propos', url: '/a-propos' },
          ])}
        />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'À propos' }]} className="mb-4" />
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">{cmsPage.title}</h1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <CmsContent html={cmsPage.content_html} />
            </div>
          </div>
        </section>
        {/* Notre équipe — E-E-A-T (also in CMS branch) */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-charcoal-900 mb-2">Notre équipe</h2>
            <p className="text-charcoal-600 mb-8">
              Les experts derrière nos contenus et notre plateforme.
            </p>

            {/* Équipe éditoriale collective */}
            {(() => {
              const editorial = teamMembers[0]
              return (
                <div className="bg-sand-50 rounded-xl shadow-sm p-8 border border-sand-200 mb-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-900">{editorial.name}</h3>
                      <p className="text-sm text-primary-500 mb-2">{editorial.role}</p>
                      <p className="text-charcoal-700 leading-relaxed">{editorial.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {editorial.expertise.map((e) => (
                          <span
                            key={e}
                            className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full font-medium"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Auteurs individuels */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getAllAuthors().map((author) => {
                const initials = author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                return (
                  <Link
                    key={author.slug}
                    href={`/equipe/${author.slug}`}
                    className="group bg-sand-50 rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md hover:border-primary-300 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-heading font-bold text-xl shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                          {author.name}
                        </h3>
                        <p className="text-sm text-primary-500">{author.role}</p>
                      </div>
                    </div>
                    <p className="text-charcoal-600 text-sm leading-relaxed mb-3 line-clamp-2">
                      {author.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {author.expertise.slice(0, 3).map((exp) => (
                        <span
                          key={exp}
                          className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-charcoal-400">
                      {author.yearsExperience} ans d&apos;expérience
                    </p>
                  </Link>
                )
              })}
            </div>

            {/* Lien vers la page équipe complète */}
            <div className="text-center mt-8">
              <Link
                href="/equipe"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Voir l&apos;équipe complète
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
        <GeoPageCTA variant="sticky-only" />
      </div>
    )
  }

  const stats = await getStats()
  const hasArtisans = stats.artisanCount > 0

  const orgSchema = getOrganizationSchema()
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'À propos', url: '/a-propos' },
  ])

  const faqSchema = getFAQSchema([
    {
      question: 'Qui est ServicesArtisans ?',
      answer: `${companyIdentity.legalName} édite la plateforme ServicesArtisans, annuaire national d'artisans du bâtiment fondé sur les données ouvertes SIRENE (INSEE) et la base ADEME france-renov.gouv.fr. Notre objectif : offrir aux particuliers un annuaire 100 % gratuit, transparent et vérifiable.`,
    },
    {
      question: "L'utilisation du service est-elle payante ?",
      answer:
        "Non, le service est 100 % gratuit pour les particuliers : consultation de l'annuaire, demande de devis, consultation des avis. Les artisans peuvent revendiquer leur fiche gratuitement ; certaines options (mise en avant, accès à l'espace Pro) peuvent être payantes côté professionnel.",
    },
    {
      question: 'Comment les artisans sont-ils collectés ?',
      answer:
        "Les artisans sont référencés à partir des données publiques SIRENE (INSEE) avec le code NAF bâtiment puis enrichis avec les qualifications RGE officielles (synchronisation hebdomadaire avec la base ADEME). Les fiches en cessation d'activité sont automatiquement masquées.",
    },
    {
      question: 'Les leads sont-ils exclusifs ?',
      answer:
        "Oui. C'est un engagement non-négociable : 1 demande de devis = 1 artisan, jamais partagé. C'est ce qui différencie ServicesArtisans des plateformes comme Travaux.com ou Habitatpresto où votre demande est envoyée à 3-5 artisans simultanément.",
    },
    {
      question: 'Comment signaler une erreur ou une fiche suspecte ?',
      answer:
        "Chaque fiche artisan comporte un lien de signalement. Vous pouvez également contacter notre équipe via /contact. Nous traitons les signalements sous 48 h ouvrées, avec suspension immédiate de la fiche en cas de doute sérieux sur l'identité ou les qualifications.",
    },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[orgSchema, breadcrumbSchema, faqSchema]} />

      {/* Hero */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(232,107,75,0.06) 0%, transparent 50%)',
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
            items={[{ label: 'À propos' }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <div className="text-center">
            <h1
              data-speakable="true"
              className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
            >
              À propos de ServicesArtisans
            </h1>
            <p className="text-xl text-charcoal-400 max-w-3xl mx-auto">
              ServicesArtisans est l&apos;annuaire gratuit des artisans en France, construit à
              partir des données ouvertes du gouvernement.
              {stats.artisanCount > 0
                ? ` ${stats.artisanCount.toLocaleString('fr-FR')}+ professionnels référencés,`
                : ' Des milliers de professionnels référencés,'}{' '}
              accessibles gratuitement.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & valeurs — server-rendered for SEO */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-charcoal-900 mb-6">Notre mission</h2>
          <div className="prose prose-lg text-charcoal-700 max-w-none space-y-4">
            <p>
              ServicesArtisans a pour mission de faciliter la mise en relation entre particuliers et
              artisans qualifiés partout en France. Notre annuaire référence des milliers de
              professionnels du bâtiment, de la rénovation et des services, en s&apos;appuyant
              exclusivement sur les données officielles du registre SIREN via l&apos;API Annuaire
              des Entreprises du gouvernement.
            </p>
            <p>
              Nous croyons que trouver un artisan de confiance ne devrait pas être compliqué.
              C&apos;est pourquoi notre plateforme est entièrement gratuite, aussi bien pour les
              particuliers que pour les artisans. Pas de commissions cachées, pas de revente de
              données personnelles.
            </p>
            <p>
              Chaque professionnel référencé sur ServicesArtisans est issu des registres officiels.
              Nous vérifions les numéros SIRET, demandons les attestations d&apos;assurance RC
              professionnelle et de garantie décennale pour les métiers du bâtiment, et ne publions
              que des avis authentiques de clients ayant réellement fait appel à un artisan via la
              plateforme.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-charcoal-900 mt-12 mb-6">Nos valeurs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-sand-50 rounded-xl p-6 border border-sand-200">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Transparence</h3>
              <p className="text-charcoal-600 text-sm">
                Toutes nos données proviennent de sources publiques officielles. Aucune information
                n&apos;est inventée ou embellie.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-6 border border-sand-200">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Gratuité</h3>
              <p className="text-charcoal-600 text-sm">
                La recherche d&apos;artisans, les demandes de devis et l&apos;inscription sont 100 %
                gratuites pour tous les utilisateurs.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-6 border border-sand-200">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                Protection des données
              </h3>
              <p className="text-charcoal-600 text-sm">
                Conformité RGPD, hébergement en Europe, aucune revente de données personnelles.
                Votre vie privée est respectée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment nous référençons les artisans */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">
              Comment nous référençons les artisans
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Chaque artisan référencé sur la plateforme passe par un processus de vérification en
              plusieurs étapes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {verificationSteps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="text-center">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-2">{step.title}</h3>
                  <p className="text-charcoal-600 text-sm">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Notre technologie + modèle économique */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Technologie */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={pageImages.about[0].src}
                  alt={pageImages.about[0].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Notre technologie</h2>
                <div className="space-y-4 text-charcoal-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-500 text-xs font-bold">1</span>
                    </div>
                    <p>
                      Données artisans issues de l'<strong>API Annuaire des Entreprises</strong> du
                      gouvernement (données ouvertes SIREN).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-500 text-xs font-bold">2</span>
                    </div>
                    <p>
                      Plateforme construite avec <strong>Next.js</strong> pour des performances
                      optimales et un référencement naturel de qualité.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-500 text-xs font-bold">3</span>
                    </div>
                    <p>
                      Données hébergées en Europe via <strong>Supabase</strong> (PostgreSQL).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-500 text-xs font-bold">4</span>
                    </div>
                    <p>
                      Paiements sécurisés via <strong>Stripe</strong>, certifié PCI-DSS.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-500 text-xs font-bold">5</span>
                    </div>
                    <p>
                      Monitoring et gestion des erreurs via <strong>Sentry</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modèle économique */}
            <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl overflow-hidden text-white">
              <div className="relative h-48 w-full">
                <Image
                  src={pageImages.about[1].src}
                  alt={pageImages.about[1].alt}
                  fill
                  className="object-cover opacity-40"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-500/60 to-primary-600/90" />
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Notre modèle économique</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-primary-100 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Gratuit pour les particuliers</p>
                      <p className="text-primary-100 text-sm">
                        Recherche d'artisans, demandes de devis, comparaison : tout est gratuit.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-primary-100 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Gratuit pour les artisans</p>
                      <p className="text-primary-100 text-sm">
                        Les artisans peuvent créer leur profil et recevoir des demandes de devis
                        gratuitement.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-primary-100 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Aucune revente de données</p>
                      <p className="text-primary-100 text-sm">
                        Vos données personnelles ne sont jamais vendues à des tiers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres ou état de lancement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {hasArtisans ? (
            <>
              <h2 className="text-3xl font-bold text-charcoal-900 mb-8">L'annuaire en chiffres</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-primary-500">
                    {stats.artisanCount.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-charcoal-600 mt-1">Artisans référencés</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-500">{stats.cityCount}</div>
                  <div className="text-charcoal-600 mt-1">Villes couvertes</div>
                </div>
                {stats.reviewCount > 0 && (
                  <div>
                    <div className="text-3xl font-bold text-primary-500">
                      {stats.reviewCount.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-charcoal-600 mt-1">Avis authentiques</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="bg-primary-50 border border-primary-200 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-charcoal-900 mb-3">
                  Annuaire en cours de constitution
                </h2>
                <p className="text-charcoal-600 mb-6">
                  Nous importons les données de l'API Annuaire des Entreprises pour constituer le
                  plus grand répertoire d'artisans de France. Les premiers professionnels référencés
                  seront bientôt accessibles.
                </p>
                <Link
                  href="/inscription-artisan"
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Devenir artisan partenaire
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Nos engagements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">Nos engagements</h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Des engagements concrets et vérifiables.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {commitments.map((commitment) => (
              <div
                key={commitment.title}
                className="bg-white rounded-xl shadow-sm p-6 border border-sand-200"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2">{commitment.title}</h3>
                <p className="text-charcoal-600 text-sm">{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* En savoir plus sur nos engagements */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">
              En savoir plus sur nos engagements
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/notre-processus-de-verification"
                className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Processus de vérification
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Détails sur la vérification SIRET, assurances et suivi continu des artisans.
                </p>
              </Link>
              <Link
                href="/politique-avis"
                className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Politique d'avis
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Notre politique de collecte, modération et publication des avis clients.
                </p>
              </Link>
              <Link
                href="/mediation"
                className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Résolution des litiges
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Processus de réclamation et médiation en cas de différend.
                </p>
              </Link>
              <Link
                href="/mentions-legales"
                className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Mentions légales
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Informations juridiques, éditeur et hébergeur du site.
                </p>
              </Link>
              <Link
                href="/contact"
                className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Contact
                </h3>
                <p className="text-charcoal-600 text-sm">Une question ? Contactez notre équipe.</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notre équipe — E-E-A-T */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">Notre équipe</h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Les experts derrière nos contenus et notre plateforme.
            </p>
          </div>

          {/* Équipe éditoriale collective */}
          {(() => {
            const editorial = teamMembers[0]
            return (
              <div className="bg-sand-50 rounded-xl shadow-sm p-8 mb-10 max-w-4xl mx-auto border border-sand-200">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal-900">{editorial.name}</h3>
                    <p className="text-sm text-primary-500 mb-2">{editorial.role}</p>
                    <p className="text-charcoal-700 leading-relaxed">{editorial.bio}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {editorial.expertise.map((e) => (
                        <span
                          key={e}
                          className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full font-medium"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Auteurs individuels */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {getAllAuthors().map((author) => {
              const initials = author.name
                .split(' ')
                .map((n) => n[0])
                .join('')
              return (
                <Link
                  key={author.slug}
                  href={`/equipe/${author.slug}`}
                  className="group bg-white rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md hover:border-primary-300 transition-all"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-heading font-bold text-xl shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                        {author.name}
                      </h3>
                      <p className="text-sm text-primary-500">{author.role}</p>
                    </div>
                  </div>
                  <p className="text-charcoal-600 text-sm leading-relaxed mb-3 line-clamp-2">
                    {author.bio}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {author.expertise.slice(0, 3).map((exp) => (
                      <span
                        key={exp}
                        className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-charcoal-400">
                    {author.yearsExperience} ans d&apos;expérience
                  </p>
                </Link>
              )
            })}
          </div>

          {/* Lien vers la page équipe complète */}
          <div className="text-center mt-10">
            <Link
              href="/equipe"
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Voir l&apos;équipe complète
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Une question ?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Contactez-nous à{' '}
            <a href={`mailto:${companyIdentity.email}`} className="text-white hover:underline">
              <strong>{companyIdentity.email}</strong>
            </a>{' '}
            ou via notre page de contact.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      <GeoPageCTA variant="sticky-only" />
    </div>
  )
}
