'use client'

import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Users, Eye, Euro, ChevronRight, Calendar, ExternalLink, Search } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

const stats = [
  { label: 'Vues du profil', value: '1 247', change: '+12%', icon: Eye },
  { label: 'Demandes reçues', value: '38', change: '+8%', icon: FileText },
  { label: 'Devis envoyés', value: '24', change: '+15%', icon: Euro },
  { label: 'Clients satisfaits', value: '18', change: '+5%', icon: Users },
]

const demandes = [
  { id: 1, client: 'Jean D.', service: 'Réparation fuite', ville: 'Paris 15e', date: '2024-01-20', budget: '150-300€', status: 'nouveau' },
  { id: 2, client: 'Marie L.', service: 'Installation chauffe-eau', ville: 'Paris 11e', date: '2024-01-19', budget: '500-800€', status: 'devis_envoye' },
  { id: 3, client: 'Pierre M.', service: 'Débouchage canalisation', ville: 'Boulogne', date: '2024-01-18', budget: '100-200€', status: 'accepte' },
]

export default function EspaceArtisanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Espace Artisan' }]} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Espace Artisan</h1>
              <p className="text-blue-100">Martin Plomberie - Paris</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Profil vérifié
              </span>
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Premium
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              <Link
                href="/espace-artisan"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
              >
                <TrendingUp className="w-5 h-5" />
                Tableau de bord
              </Link>
              <Link
                href="/espace-artisan/calendrier"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Calendar className="w-5 h-5" />
                Calendrier
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Pro</span>
              </Link>
              <Link
                href="/espace-artisan/demandes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5" />
                Demandes
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              </Link>
              <Link
                href="/espace-artisan/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">5</span>
              </Link>
              <Link
                href="/espace-artisan/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Star className="w-5 h-5" />
                Avis clients
              </Link>
              <Link
                href="/espace-artisan/profil"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Mon profil
              </Link>
              <Link
                href="/espace-artisan/abonnement"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Euro className="w-5 h-5" />
                Abonnement
              </Link>
              <LogoutButton />
            </nav>

            {/* Voir mon profil public */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <Link
                href="/services/artisan/martin-plomberie-paris"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Voir mon profil public
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-4">
              <QuickSiteLinks />
            </div>

            {/* Additional links */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Liens utiles</h4>
              <div className="space-y-2 text-sm">
                <Link href="/services" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1">
                  <Search className="w-4 h-4" />
                  Parcourir les services
                </Link>
                <Link href="/recherche" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1">
                  <Search className="w-4 h-4" />
                  Rechercher un artisan
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-8 h-8 text-blue-600" />
                      <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Dernières demandes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dernières demandes
                </h2>
                <Link href="/espace-artisan/demandes" className="text-blue-600 hover:underline text-sm">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-4">
                {demandes.map((demande) => (
                  <div
                    key={demande.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {demande.service}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{demande.client}</span>
                          <span>{demande.ville}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(demande.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          Budget : {demande.budget}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            demande.status === 'nouveau'
                              ? 'bg-red-100 text-red-700'
                              : demande.status === 'devis_envoye'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {demande.status === 'nouveau' && 'Nouveau'}
                          {demande.status === 'devis_envoye' && 'Devis envoyé'}
                          {demande.status === 'accepte' && 'Accepté'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade banner */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Passez à Premium</h3>
                  <p className="text-yellow-100">
                    Multipliez par 3 vos demandes de devis avec l'offre Premium
                  </p>
                </div>
                <Link
                  href="/tarifs-artisans"
                  className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Découvrir
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
