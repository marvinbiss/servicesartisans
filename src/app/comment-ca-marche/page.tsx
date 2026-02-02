import { Metadata } from 'next'
import Link from 'next/link'
import { Search, Users, CheckCircle, ArrowRight, Shield, Star, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

export const metadata: Metadata = {
  title: 'Comment ca marche - ServicesArtisans',
  description: 'Decouvrez comment trouver un artisan qualifie en 3 etapes simples. Service gratuit et sans engagement.',
}

const steps = [
  {
    number: '1',
    icon: Search,
    title: 'Decrivez votre projet',
    description: 'Remplissez notre formulaire en quelques minutes. Precisez le type de travaux, votre localisation et vos disponibilites.',
    details: [
      'Formulaire simple et rapide',
      'Tous types de travaux acceptes',
      'Precisez votre budget si vous le souhaitez',
    ],
  },
  {
    number: '2',
    icon: Users,
    title: 'Recevez des devis',
    description: 'Nous transmettons votre demande aux artisans qualifies de votre region. Vous recevez jusqu\'a 3 devis detailles.',
    details: [
      'Jusqu\'a 3 devis gratuits',
      'Artisans verifies et assures',
      'Reponse sous 24-48h',
    ],
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Choisissez votre artisan',
    description: 'Comparez les devis, consultez les avis clients et selectionnez l\'artisan qui correspond a vos attentes.',
    details: [
      'Comparaison facile des offres',
      'Avis clients verifies',
      'Aucun engagement',
    ],
  },
]

const guarantees = [
  {
    icon: Shield,
    title: 'Artisans verifies',
    description: 'Nous verifions l\'identite, les assurances et les qualifications de chaque artisan.',
  },
  {
    icon: Star,
    title: '100% gratuit',
    description: 'Notre service est entierement gratuit pour les particuliers. Pas de frais caches.',
  },
  {
    icon: Clock,
    title: 'Reponse rapide',
    description: 'Recevez vos devis sous 24 a 48 heures maximum.',
  },
  {
    icon: CheckCircle,
    title: 'Sans engagement',
    description: 'Vous etes libre d\'accepter ou de refuser les devis recus.',
  },
]

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[{ label: 'Comment ca marche' }]}
            className="mb-6 text-blue-100 [&_a]:text-blue-200 [&_a:hover]:text-white [&_svg]:text-blue-300"
          />
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Comment ca marche ?
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Trouvez un artisan qualifie en 3 etapes simples.
              Service 100% gratuit et sans engagement.
            </p>
          </div>
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
              Un service de qualite pour tous vos projets
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

      {/* Contextual Links */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            En savoir plus
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/faq"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Questions frequentes</h3>
              <p className="text-gray-600 text-sm mb-3">
                Trouvez les reponses a vos questions sur notre service.
              </p>
              <span className="text-blue-600 text-sm font-medium inline-flex items-center gap-1">
                Voir la FAQ <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              href="/inscription"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Creer un compte</h3>
              <p className="text-gray-600 text-sm mb-3">
                Inscrivez-vous gratuitement pour profiter de tous nos services.
              </p>
              <span className="text-blue-600 text-sm font-medium inline-flex items-center gap-1">
                S'inscrire <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              href="/contact"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Nous contacter</h3>
              <p className="text-gray-600 text-sm mb-3">
                Une question ? Notre equipe est la pour vous aider.
              </p>
              <span className="text-blue-600 text-sm font-medium inline-flex items-center gap-1">
                Contact <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pret a trouver votre artisan ?
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

      {/* Related Links Section */}
      <section className="bg-gray-50 py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Trouvez un artisan pres de chez vous
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PopularServicesLinks />
            <PopularCitiesLinks />
          </div>
        </div>
      </section>
    </div>
  )
}
