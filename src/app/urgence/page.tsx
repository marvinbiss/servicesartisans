'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Clock, MapPin, AlertTriangle, Shield, Star, Zap } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

const urgences = [
  {
    service: 'Plombier urgence',
    slug: 'plombier',
    icon: '🔧',
    description: 'Fuite d\'eau, canalisation bouchée, panne chauffe-eau',
    tel: '01 89 16 78 91',
    telLink: '+33189167891',
    disponibilite: '24h/24 - 7j/7',
  },
  {
    service: 'Électricien urgence',
    slug: 'electricien',
    icon: '⚡',
    description: 'Panne électrique, court-circuit, tableau qui disjoncte',
    tel: '01 89 16 78 92',
    telLink: '+33189167892',
    disponibilite: '24h/24 - 7j/7',
  },
  {
    service: 'Serrurier urgence',
    slug: 'serrurier',
    icon: '🔑',
    description: 'Porte claquée, serrure cassée, effraction',
    tel: '01 89 16 78 93',
    telLink: '+33189167893',
    disponibilite: '24h/24 - 7j/7',
  },
  {
    service: 'Chauffagiste urgence',
    slug: 'chauffagiste',
    icon: '🔥',
    description: 'Panne de chauffage, fuite de gaz, chaudière en panne',
    tel: '01 89 16 78 94',
    telLink: '+33189167894',
    disponibilite: '24h/24 - 7j/7',
  },
  {
    service: 'Vitrier urgence',
    slug: 'vitrier',
    icon: '🪟',
    description: 'Vitre cassée, fenêtre brisée, sécurisation',
    tel: '01 89 16 78 95',
    telLink: '+33189167895',
    disponibilite: '24h/24 - 7j/7',
  },
]

const conseils = [
  {
    titre: 'En cas de fuite d\'eau',
    conseils: [
      'Coupez l\'arrivée d\'eau au compteur',
      'Coupez l\'électricité si l\'eau touche des prises',
      'Épongez l\'eau pour limiter les dégâts',
      'Appelez un plombier d\'urgence',
    ],
  },
  {
    titre: 'En cas de panne électrique',
    conseils: [
      'Vérifiez le disjoncteur général',
      'Débranchez les appareils suspects',
      'N\'essayez pas de réparer vous-même',
      'Appelez un électricien qualifié',
    ],
  },
  {
    titre: 'En cas de porte claquée',
    conseils: [
      'Ne forcez pas la serrure',
      'Vérifiez les autres accès possibles',
      'Faites appel à un serrurier agréé',
      'Demandez un devis avant intervention',
    ],
  },
]

const villesUrgence = [
  { name: 'Paris', slug: 'paris' },
  { name: 'Marseille', slug: 'marseille' },
  { name: 'Lyon', slug: 'lyon' },
  { name: 'Toulouse', slug: 'toulouse' },
  { name: 'Nice', slug: 'nice' },
  { name: 'Nantes', slug: 'nantes' },
  { name: 'Bordeaux', slug: 'bordeaux' },
  { name: 'Lille', slug: 'lille' },
  { name: 'Strasbourg', slug: 'strasbourg' },
  { name: 'Montpellier', slug: 'montpellier' },
  { name: 'Rennes', slug: 'rennes' },
  { name: 'Le Havre', slug: 'le-havre' },
]

export default function UrgencePage() {
  const [selectedVille, setSelectedVille] = useState('')

  const breadcrumbItems = [
    { label: 'Urgences' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Breadcrumb items={breadcrumbItems} className="mb-4 text-red-200 [&_a]:text-red-200 [&_a:hover]:text-white [&_svg]:text-red-300 [&>span]:text-white" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Artisans d'urgence</h1>
              <p className="text-red-100">Intervention rapide 24h/24 - 7j/7</p>
            </div>
          </div>
          <p className="text-xl text-red-100 max-w-3xl mb-8">
            Une urgence ? Nos artisans qualifiés interviennent rapidement à votre domicile,
            de jour comme de nuit, week-ends et jours fériés compris.
          </p>

          {/* Search */}
          <div className="bg-white rounded-xl p-4 md:p-6 max-w-2xl">
            <h2 className="text-gray-900 font-semibold mb-4">Trouvez un artisan d'urgence</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={selectedVille}
                  onChange={(e) => setSelectedVille(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                >
                  <option value="">Sélectionnez votre ville</option>
                  <option value="paris">Paris</option>
                  <option value="marseille">Marseille</option>
                  <option value="lyon">Lyon</option>
                  <option value="toulouse">Toulouse</option>
                  <option value="nice">Nice</option>
                  <option value="nantes">Nantes</option>
                </select>
              </div>
              <a
                href="tel:+33189167890"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                01 89 16 78 90
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services urgence */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Services d'urgence disponibles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {urgences.map((urgence) => (
              <div
                key={urgence.service}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{urgence.icon}</span>
                  <Link href={`/services/${urgence.slug}`} className="font-semibold text-gray-900 hover:text-red-600 transition-colors">
                    {urgence.service}
                  </Link>
                </div>
                <p className="text-gray-600 mb-4">{urgence.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{urgence.disponibilite}</span>
                </div>
                <a
                  href={`tel:${urgence.telLink}`}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {urgence.tel}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Garanties */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-8 text-center">Nos garanties</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Intervention rapide</h3>
                <p className="text-blue-100 text-sm">30 min en moyenne</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Artisans vérifiés</h3>
                <p className="text-blue-100 text-sm">Assurés et qualifiés</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">Devis transparent</h3>
                <p className="text-blue-100 text-sm">Prix annoncé respecté</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">24h/24 - 7j/7</h3>
                <p className="text-blue-100 text-sm">Même les jours fériés</p>
              </div>
            </div>
          </div>
        </section>

        {/* Conseils */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Que faire en cas d'urgence ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {conseils.map((conseil) => (
              <div key={conseil.titre} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  {conseil.titre}
                </h3>
                <ol className="space-y-2">
                  {conseil.conseils.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600">
                      <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Villes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Nos artisans d'urgence par ville
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {villesUrgence.map((ville) => (
                <Link
                  key={ville.slug}
                  href={`/villes/${ville.slug}`}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {ville.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Related links */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <PopularServicesLinks />
              <PopularCitiesLinks />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un artisan en urgence ?
          </h2>
          <p className="text-red-100 mb-8 max-w-2xl mx-auto">
            Nos professionnels sont disponibles 24h/24 pour intervenir rapidement chez vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/devis"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-800 transition-colors"
            >
              Voir tous les services
            </Link>
          </div>
        </section>
      </div>

      {/* Footer links */}
    </div>
  )
}
