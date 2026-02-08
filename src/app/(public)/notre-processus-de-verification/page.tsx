import { Metadata } from 'next'
import Link from 'next/link'
import { FileCheck, Shield, Lock, Eye, AlertTriangle, ArrowRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { companyIdentity } from '@/lib/config/company-identity'

export const metadata: Metadata = {
  title: 'Notre processus de vérification des artisans - ServicesArtisans',
  description: 'Découvrez comment ServicesArtisans vérifie chaque artisan : contrôle SIRET via l\'API SIRENE, assurance RC professionnelle, garantie décennale et suivi continu.',
  alternates: {
    canonical: 'https://servicesartisans.fr/notre-processus-de-verification',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

const verificationSteps = [
  {
    icon: FileCheck,
    title: 'Vérification SIRET via l\'API SIRENE',
    description: 'Chaque artisan souhaitant être référencé doit fournir son numéro SIRET. Nous vérifions l\'existence et l\'activité de l\'entreprise auprès de l\'API SIRENE de l\'INSEE, le répertoire officiel des entreprises françaises. Cette vérification permet de confirmer que l\'entreprise est bien immatriculée et en activité.',
  },
  {
    icon: Shield,
    title: 'Assurance RC professionnelle',
    description: 'Nous demandons à chaque artisan de fournir une attestation d\'assurance responsabilité civile professionnelle en cours de validité. Cette assurance couvre les dommages pouvant survenir dans le cadre de l\'exercice professionnel de l\'artisan.',
  },
  {
    icon: Lock,
    title: 'Garantie décennale',
    description: 'Pour les artisans exerçant dans les métiers du bâtiment concernés par la loi Spinetta, nous vérifions la souscription à une assurance garantie décennale. Cette garantie couvre les dommages compromettant la solidité de l\'ouvrage pendant dix ans après la réception des travaux.',
  },
  {
    icon: Eye,
    title: 'Suivi continu',
    description: 'La vérification ne s\'arrête pas à l\'inscription. Nous effectuons des contrôles périodiques pour nous assurer que les documents restent à jour (validité des assurances, activité SIRET). Un artisan dont les documents expirent sans renouvellement voit son profil désactivé.',
  },
  {
    icon: AlertTriangle,
    title: 'Signalement',
    description: 'Si vous constatez un problème avec un artisan référencé sur la plateforme, vous pouvez nous le signaler. Chaque signalement est examiné et peut entraîner la suspension ou le retrait du profil de l\'artisan concerné.',
  },
]

export default function NotreProcessusDeVerificationPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Notre processus de vérification', url: '/notre-processus-de-verification' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Notre processus de vérification des artisans
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Chaque artisan référencé sur {companyIdentity.name} passe par un processus
            de vérification structuré. Voici les étapes que nous suivons.
          </p>
        </div>
      </section>

      {/* Étapes de vérification */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Les étapes de notre processus
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un processus en plusieurs étapes pour s'assurer de la fiabilité
              des artisans référencés sur la plateforme.
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {verificationSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-start gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Étape {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ce que cela signifie pour vous */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ce que cela signifie pour vous
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                En tant qu'utilisateur de la plateforme, vous savez que chaque artisan affiché
                a fait l'objet de vérifications documentaires. Cela ne constitue pas une garantie
                absolue de la qualité des prestations, mais un premier filtre vérifiable.
              </p>
              <p>
                Si une prestation ne correspond pas à vos attentes, vous disposez de plusieurs recours :
                signaler l'artisan, laisser un avis sur la plateforme, ou faire appel à notre
                processus de médiation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signaler un problème */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Signaler un problème
            </h2>
            <p className="text-gray-600 mb-6">
              Vous avez constaté un problème avec un artisan référencé ?
              Contactez-nous à <strong>{companyIdentity.email}</strong> ou
              via notre page de contact. Chaque signalement est examiné avec attention.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Nous contacter
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              En savoir plus
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/a-propos"
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  À propos de {companyIdentity.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  Découvrez notre mission, notre technologie et nos engagements.
                </p>
              </Link>
              <Link
                href="/politique-avis"
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Politique de gestion des avis
                </h3>
                <p className="text-gray-600 text-sm">
                  Comment les avis sont collectés, modérés et publiés sur la plateforme.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
