import { Metadata } from 'next'
import Link from 'next/link'
import { Search, FileText, Users, CheckCircle, ArrowRight, Shield, Star, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Comment ça marche - ServicesArtisans',
  description: 'Découvrez comment trouver un artisan qualifié en 3 étapes simples. Service gratuit et sans engagement.',
}

const steps = [
  {
    number: '1',
    icon: Search,
    title: 'Décrivez votre projet',
    description: 'Remplissez notre formulaire en quelques minutes. Précisez le type de travaux, votre localisation et vos disponibilités.',
    details: [
      'Formulaire simple et rapide',
      'Tous types de travaux acceptés',
      'Précisez votre budget si vous le souhaitez',
    ],
  },
  {
    number: '2',
    icon: Users,
    title: 'Recevez des devis',
    description: 'Nous transmettons votre demande aux artisans qualifiés de votre région. Vous recevez jusqu\'à 3 devis détaillés.',
    details: [
      'Jusqu\'à 3 devis gratuits',
      'Artisans vérifiés et assurés',
      'Réponse sous 24-48h',
    ],
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Choisissez votre artisan',
    description: 'Comparez les devis, consultez les avis clients et sélectionnez l\'artisan qui correspond à vos attentes.',
    details: [
      'Comparaison facile des offres',
      'Avis clients vérifiés',
      'Aucun engagement',
    ],
  },
]

const guarantees = [
  {
    icon: Shield,
    title: 'Artisans vérifiés',
    description: 'Nous vérifions l\'identité, les assurances et les qualifications de chaque artisan.',
  },
  {
    icon: Star,
    title: '100% gratuit',
    description: 'Notre service est entièrement gratuit pour les particuliers. Pas de frais cachés.',
  },
  {
    icon: Clock,
    title: 'Réponse rapide',
    description: 'Recevez vos devis sous 24 à 48 heures maximum.',
  },
  {
    icon: CheckCircle,
    title: 'Sans engagement',
    description: 'Vous êtes libre d\'accepter ou de refuser les devis reçus.',
  },
]

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Comment ça marche ?
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Trouvez un artisan qualifié en 3 étapes simples.
            Service 100% gratuit et sans engagement.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 1
              return (
                <div
                  key={step.number}
                  className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
                >
                  {/* Image/Icon */}
                  <div className="flex-1 w-full">
                    <div className={`bg-gradient-to-br ${index === 0 ? 'from-blue-500 to-blue-700' : index === 1 ? 'from-green-500 to-green-700' : 'from-purple-500 to-purple-700'} rounded-2xl p-12 text-white text-center`}>
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-12 h-12" />
                      </div>
                      <div className="text-6xl font-bold opacity-50">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                        {step.number}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos garanties
            </h2>
            <p className="text-xl text-gray-600">
              Un service de qualité pour tous vos projets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {guarantees.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à trouver votre artisan ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Demandez vos devis gratuits en quelques clics
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
