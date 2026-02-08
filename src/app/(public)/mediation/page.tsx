import { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, Users, Scale, Clock, Mail, ArrowRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { companyIdentity } from '@/lib/config/company-identity'

export const metadata: Metadata = {
  title: 'Médiation et résolution des litiges - ServicesArtisans',
  description: 'Processus de médiation de ServicesArtisans : réclamation, médiation interne et externe, délais de traitement. Résolution amiable des litiges.',
  alternates: {
    canonical: 'https://servicesartisans.fr/mediation',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

const steps = [
  {
    icon: MessageCircle,
    title: 'Processus de réclamation',
    content: [
      'Si vous rencontrez un problème avec une prestation effectuée par un artisan référencé sur la plateforme, la première étape consiste à nous adresser une réclamation écrite.',
      'Vous pouvez nous contacter par email à ' + companyIdentity.supportEmail + ' en décrivant la situation, la prestation concernée et le résultat souhaité. Nous accusons réception de chaque réclamation.',
    ],
  },
  {
    icon: Users,
    title: 'Médiation interne',
    content: [
      'À la réception de votre réclamation, notre équipe prend contact avec les deux parties (client et artisan) pour comprendre la situation et tenter de trouver une solution amiable.',
      'Cette étape vise à faciliter le dialogue entre le client et l\'artisan. Nous ne sommes pas un tribunal et n\'avons pas le pouvoir d\'imposer une solution, mais nous accompagnons les parties dans la recherche d\'un accord.',
    ],
  },
  {
    icon: Scale,
    title: 'Médiation externe',
    content: [
      'Si la médiation interne n\'aboutit pas à une solution satisfaisante, vous pouvez faire appel à un médiateur de la consommation conformément aux dispositions du Code de la consommation (articles L.611-1 et suivants).',
      'Le recours au médiateur de la consommation est gratuit pour le consommateur. Les coordonnées du médiateur compétent seront communiquées lors de l\'immatriculation de la société, conformément à l\'obligation légale.',
    ],
  },
  {
    icon: Clock,
    title: 'Délais de traitement',
    content: [
      'Nous nous efforçons d\'accuser réception de chaque réclamation dans un délai de 48 heures ouvrées.',
      'Le processus de médiation interne vise à proposer une solution dans un délai raisonnable après réception de l\'ensemble des éléments nécessaires. Ce délai dépend de la complexité du dossier et de la réactivité des parties.',
    ],
  },
]

export default function MediationPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Médiation', url: '/mediation' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Médiation et résolution des litiges
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            En cas de litige, {companyIdentity.name} met en place un processus
            de médiation pour faciliter la résolution amiable des différends.
          </p>
        </div>
      </section>

      {/* Étapes */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Étape {index + 1}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  {step.content.map((paragraph, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact pour les réclamations
            </h2>
            <div className="space-y-2 text-gray-600 mb-6">
              <p>
                Pour toute réclamation : <strong>{companyIdentity.supportEmail}</strong>
              </p>
              <p>
                Pour toute autre question : <strong>{companyIdentity.email}</strong>
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Page de contact
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
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
      </section>
    </div>
  )
}
