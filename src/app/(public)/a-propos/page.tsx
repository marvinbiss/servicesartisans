import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Search, CreditCard, FileCheck, Lock, Eye, ArrowRight } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import JsonLd from '@/components/JsonLd'
import { getOrganizationSchema, getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { companyIdentity } from '@/lib/config/company-identity'

export const metadata: Metadata = {
  title: 'À propos - ServicesArtisans',
  description: 'Découvrez ServicesArtisans : comment nous vérifions les artisans, notre technologie, notre modèle économique. Transparence totale.',
  alternates: {
    canonical: 'https://servicesartisans.fr/a-propos',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

export const revalidate = 3600

async function getStats() {
  try {
    const supabase = createAdminClient()
    const [
      { count: artisanCount },
      { data: providerStats },
      { data: cities }
    ] = await Promise.all([
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('providers').select('review_count').eq('is_active', true).gt('review_count', 0),
      supabase.from('providers').select('address_city').eq('is_active', true)
    ])

    const totalReviews = providerStats?.reduce((sum, p) => sum + (p.review_count || 0), 0) || 0
    const uniqueCities = new Set(cities?.map(c => c.address_city).filter(Boolean)).size

    return {
      artisanCount: artisanCount || 0,
      reviewCount: totalReviews,
      cityCount: uniqueCities
    }
  } catch {
    return { artisanCount: 0, reviewCount: 0, cityCount: 0 }
  }
}

const verificationSteps = [
  {
    icon: FileCheck,
    title: 'Vérification SIRET',
    description: 'Chaque artisan est vérifié via l\'API SIRENE de l\'INSEE pour confirmer l\'existence et l\'activité de son entreprise.',
  },
  {
    icon: Shield,
    title: 'Assurance RC professionnelle',
    description: 'Nous demandons une attestation d\'assurance responsabilité civile professionnelle en cours de validité.',
  },
  {
    icon: Lock,
    title: 'Garantie décennale',
    description: 'Pour les métiers du bâtiment concernés, la garantie décennale est vérifiée avant toute mise en ligne.',
  },
  {
    icon: Eye,
    title: 'Avis vérifiés',
    description: 'Seuls les clients ayant fait appel à un artisan via la plateforme peuvent laisser un avis.',
  },
]

const commitments = [
  {
    title: 'Zéro information inventée',
    description: 'Aucun faux avis, aucune fausse statistique, aucun faux profil d\'artisan sur la plateforme.',
  },
  {
    title: 'Données protégées',
    description: 'Conformité RGPD, données hébergées en Europe, DPO joignable à dpo@servicesartisans.fr.',
  },
  {
    title: 'Transparence tarifaire',
    description: 'Service gratuit pour les particuliers. Tarifs artisans publics sur notre page dédiée.',
  },
  {
    title: 'Pas de revente de données',
    description: 'Vos données personnelles ne sont jamais vendues à des tiers. Jamais.',
  },
]

export default async function AProposPage() {
  const stats = await getStats()
  const hasArtisans = stats.artisanCount > 0

  const orgSchema = getOrganizationSchema()
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'À propos', url: '/a-propos' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[orgSchema, breadcrumbSchema]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            À propos de {companyIdentity.name}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Nous construisons une plateforme qui connecte les particuliers
            avec des artisans qualifiés en France. Voici comment nous travaillons.
          </p>
        </div>
      </section>

      {/* Comment nous vérifions les artisans */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment nous vérifions les artisans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chaque artisan référencé sur la plateforme passe par un processus
              de vérification en plusieurs étapes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {verificationSteps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
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
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre technologie</h2>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <p>Plateforme construite avec <strong>Next.js</strong> pour des performances optimales et un référencement naturel de qualité.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <p>Données hébergées en Europe via <strong>Supabase</strong> (PostgreSQL).</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <p>Paiements sécurisés via <strong>Stripe</strong>, certifié PCI-DSS.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">4</span>
                  </div>
                  <p>Monitoring et gestion des erreurs via <strong>Sentry</strong>.</p>
                </div>
              </div>
            </div>

            {/* Modèle économique */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Notre modèle économique</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Gratuit pour les particuliers</p>
                    <p className="text-blue-100 text-sm">Recherche d'artisans, demandes de devis, comparaison : tout est gratuit.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Abonnements pour les artisans</p>
                    <p className="text-blue-100 text-sm">Les artisans s'abonnent pour recevoir des demandes de devis qualifiées.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Aucune revente de données</p>
                    <p className="text-blue-100 text-sm">Vos données personnelles ne sont jamais vendues. Notre seul revenu provient des abonnements artisans.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-400/30">
                <Link
                  href="/tarifs-artisans"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:underline"
                >
                  Voir les tarifs artisans
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                La plateforme en chiffres
              </h2>
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.artisanCount.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-gray-600 mt-1">Artisans référencés</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.cityCount}
                  </div>
                  <div className="text-gray-600 mt-1">Villes couvertes</div>
                </div>
                {stats.reviewCount > 0 && (
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.reviewCount.toLocaleString('fr-FR')}
                    </div>
                    <div className="text-gray-600 mt-1">Avis vérifiés</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Plateforme en phase de lancement
                </h2>
                <p className="text-gray-600 mb-6">
                  Nous préparons l'ouverture de {companyIdentity.name}. Les premiers artisans
                  vérifiés seront bientôt disponibles.
                </p>
                <Link
                  href="/inscription-artisan"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos engagements
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des engagements concrets et vérifiables.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {commitments.map((commitment) => (
              <div key={commitment.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{commitment.title}</h3>
                <p className="text-gray-600 text-sm">{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* En savoir plus sur nos engagements */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              En savoir plus sur nos engagements
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/notre-processus-de-verification"
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Processus de vérification
                </h3>
                <p className="text-gray-600 text-sm">
                  Détails sur la vérification SIRET, assurances et suivi continu des artisans.
                </p>
              </Link>
              <Link
                href="/politique-avis"
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Politique d'avis
                </h3>
                <p className="text-gray-600 text-sm">
                  Notre politique de collecte, modération et publication des avis clients.
                </p>
              </Link>
              <Link
                href="/mediation"
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Résolution des litiges
                </h3>
                <p className="text-gray-600 text-sm">
                  Processus de réclamation et médiation en cas de différend.
                </p>
              </Link>
              <Link
                href="/mentions-legales"
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Mentions légales
                </h3>
                <p className="text-gray-600 text-sm">
                  Informations juridiques, éditeur et hébergeur du site.
                </p>
              </Link>
              <Link
                href="/contact"
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Contact
                </h3>
                <p className="text-gray-600 text-sm">
                  Une question ? Contactez notre équipe.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Une question ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contactez-nous à <strong>{companyIdentity.email}</strong> ou via notre page de contact.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
