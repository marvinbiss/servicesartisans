import { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare, Shield, UserCheck, Trash2, Calculator, ArrowRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { companyIdentity } from '@/lib/config/company-identity'

export const metadata: Metadata = {
  title: 'Politique de gestion des avis - ServicesArtisans',
  description: 'Notre politique de gestion des avis : qui peut publier un avis, processus de modération, droit de réponse des artisans et calcul des notes sur ServicesArtisans.',
  alternates: {
    canonical: 'https://servicesartisans.fr/politique-avis',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

const sections = [
  {
    icon: UserCheck,
    title: 'Qui peut laisser un avis',
    content: [
      'Seuls les utilisateurs ayant fait appel à un artisan via la plateforme peuvent déposer un avis. Cette restriction vise à garantir que les avis publiés correspondent à des expériences réelles.',
      'Pour publier un avis, l\'utilisateur doit disposer d\'un compte vérifié et avoir une demande de devis ou une prestation associée à l\'artisan concerné.',
    ],
  },
  {
    icon: Shield,
    title: 'Processus de modération',
    content: [
      'Chaque avis déposé est soumis à un processus de modération avant publication. La modération vise à vérifier que l\'avis respecte nos conditions d\'utilisation : absence d\'injures, de propos discriminatoires, de données personnelles de tiers, ou de contenu sans rapport avec la prestation.',
      'Un avis négatif n\'est pas supprimé s\'il respecte les conditions d\'utilisation. La modération ne porte pas sur la véracité subjective de l\'expérience rapportée, mais sur le respect des règles de publication.',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Droit de réponse des artisans',
    content: [
      'Chaque artisan dispose d\'un droit de réponse publique à tout avis le concernant. Cette réponse est visible sous l\'avis original et permet à l\'artisan d\'apporter son point de vue ou des précisions.',
      'La réponse de l\'artisan est soumise aux mêmes règles de modération que les avis des clients.',
    ],
  },
  {
    icon: Trash2,
    title: 'Suppression d\'avis',
    content: [
      'Un avis peut être supprimé uniquement s\'il enfreint nos conditions d\'utilisation : contenu injurieux, diffamatoire, discriminatoire, contenant des données personnelles de tiers, ou manifestement sans rapport avec une prestation réelle.',
      'Un artisan ou un utilisateur peut demander la suppression d\'un avis en nous contactant à l\'adresse suivante : ' + companyIdentity.email + '. Chaque demande est examinée individuellement.',
    ],
  },
  {
    icon: Calculator,
    title: 'Calcul des notes',
    content: [
      'La note affichée sur le profil d\'un artisan correspond à la moyenne arithmétique des notes attribuées par les clients dans leurs avis publiés.',
      'Tous les avis publiés ont le même poids dans le calcul. Il n\'y a pas de pondération par ancienneté ou par type de prestation. La note est recalculée à chaque nouvel avis publié.',
    ],
  },
]

export default function PolitiqueAvisPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Politique de gestion des avis', url: '/politique-avis' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Politique de gestion des avis
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Transparence sur la manière dont les avis sont collectés, modérés
            et publiés sur {companyIdentity.name}.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.title} className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.content.map((paragraph, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Signalement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Signaler un avis
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Si vous estimez qu'un avis ne respecte pas nos conditions d'utilisation,
            vous pouvez le signaler par email à <strong>{companyIdentity.email}</strong>.
            Chaque signalement est examiné dans un délai raisonnable.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Nous contacter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Pages associées
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/notre-processus-de-verification"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Notre processus de vérification
              </h3>
              <p className="text-gray-600 text-sm">
                Comment nous vérifions les artisans avant leur référencement sur la plateforme.
              </p>
            </Link>
            <Link
              href="/mediation"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Médiation et résolution des litiges
              </h3>
              <p className="text-gray-600 text-sm">
                En cas de litige, découvrez notre processus de médiation.
              </p>
            </Link>
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
              href="/mentions-legales"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group"
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
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow group"
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
      </section>
    </div>
  )
}
