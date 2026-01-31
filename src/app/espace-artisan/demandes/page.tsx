'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Euro, ArrowLeft, Filter, Calendar, MapPin, ChevronRight, Eye, Send, ExternalLink, Search } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

const demandes = [
  {
    id: 1,
    client: 'Jean D.',
    service: 'Réparation fuite',
    description: 'Fuite sous l\'évier de la cuisine, urgente',
    ville: 'Paris 15e',
    date: '2024-01-20',
    budget: '150-300€',
    status: 'nouveau',
  },
  {
    id: 2,
    client: 'Marie L.',
    service: 'Installation chauffe-eau',
    description: 'Remplacement d\'un chauffe-eau de 200L',
    ville: 'Paris 11e',
    date: '2024-01-19',
    budget: '500-800€',
    status: 'devis_envoye',
  },
  {
    id: 3,
    client: 'Pierre M.',
    service: 'Débouchage canalisation',
    description: 'Canalisation bouchée dans la salle de bain',
    ville: 'Boulogne',
    date: '2024-01-18',
    budget: '100-200€',
    status: 'accepte',
  },
  {
    id: 4,
    client: 'Sophie B.',
    service: 'Installation robinet',
    description: 'Poser un nouveau robinet mitigeur',
    ville: 'Neuilly',
    date: '2024-01-17',
    budget: '80-150€',
    status: 'refuse',
  },
  {
    id: 5,
    client: 'Lucas R.',
    service: 'Recherche de fuite',
    description: 'Suspicion de fuite dans les murs, besoin diagnostic',
    ville: 'Paris 16e',
    date: '2024-01-16',
    budget: '200-400€',
    status: 'nouveau',
  },
]

const statusConfig = {
  nouveau: { label: 'Nouveau', color: 'bg-red-100 text-red-700' },
  devis_envoye: { label: 'Devis envoyé', color: 'bg-yellow-100 text-yellow-700' },
  accepte: { label: 'Accepté', color: 'bg-green-100 text-green-700' },
  refuse: { label: 'Refusé', color: 'bg-gray-100 text-gray-700' },
}

export default function DemandesArtisanPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDemande, setSelectedDemande] = useState<typeof demandes[0] | null>(null)

  const filteredDemandes = filterStatus === 'all'
    ? demandes
    : demandes.filter(d => d.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[
            { label: 'Espace Artisan', href: '/espace-artisan' },
            { label: 'Demandes' }
          ]} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/espace-artisan" className="text-white/80 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Demandes de devis</h1>
              <p className="text-blue-100">Gérez vos demandes entrantes</p>
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TrendingUp className="w-5 h-5" />
                Tableau de bord
              </Link>
              <Link
                href="/espace-artisan/demandes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
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

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Toutes ({demandes.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('nouveau')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === 'nouveau' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Nouvelles ({demandes.filter(d => d.status === 'nouveau').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('devis_envoye')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === 'devis_envoye' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Devis envoyés ({demandes.filter(d => d.status === 'devis_envoye').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('accepte')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === 'accepte' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Acceptées ({demandes.filter(d => d.status === 'accepte').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Demandes list */}
            <div className="space-y-4">
              {filteredDemandes.map((demande) => (
                <div
                  key={demande.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{demande.service}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[demande.status as keyof typeof statusConfig].color}`}>
                          {statusConfig[demande.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{demande.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{demande.client}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {demande.ville}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(demande.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="font-medium text-blue-600">
                          Budget : {demande.budget}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {demande.status === 'nouveau' && (
                        <>
                          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            <Send className="w-4 h-4" />
                            Envoyer devis
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {demande.status === 'devis_envoye' && (
                        <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          Contacter
                        </button>
                      )}
                      {demande.status === 'accepte' && (
                        <span className="text-green-600 font-medium">Mission confirmée</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDemandes.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Aucune demande</h3>
                <p className="text-gray-500">Aucune demande ne correspond à ce filtre.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
