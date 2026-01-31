'use client'

import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, Bell, ChevronRight, Clock, CheckCircle, AlertCircle, Home, Search, Wrench } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

const demandesDevis = [
  { id: 1, service: 'Plombier', ville: 'Paris 15e', date: '2024-01-20', status: 'en_attente', devisRecus: 2 },
  { id: 2, service: 'Électricien', ville: 'Paris 11e', date: '2024-01-18', status: 'termine', devisRecus: 3 },
  { id: 3, service: 'Peintre', ville: 'Boulogne', date: '2024-01-15', status: 'en_cours', devisRecus: 1 },
]

const notifications = [
  { id: 1, text: 'Nouveau devis reçu de Martin Plomberie', time: '2h', unread: true },
  { id: 2, text: 'Votre demande de devis a été envoyée', time: '1j', unread: false },
]

export default function EspaceClientPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: 'Mon espace' }]} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon espace</h1>
              <p className="text-gray-600">Bienvenue, Jean Dupont</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/recherche"
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </Link>
              <Link
                href="/devis"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Nouvelle demande
              </Link>
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
                href="/espace-client"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
              >
                <FileText className="w-5 h-5" />
                Mes demandes
              </Link>
              <Link
                href="/espace-client/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">2</span>
              </Link>
              <Link
                href="/espace-client/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Star className="w-5 h-5" />
                Mes avis
              </Link>
              <Link
                href="/espace-client/parametres"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </Link>
              <LogoutButton />
            </nav>

            {/* Liens vers le site - Maillage interne */}
            <QuickSiteLinks className="mt-4" />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h2>
                <button className="text-sm text-blue-600 hover:underline">
                  Tout marquer comme lu
                </button>
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      notif.unread ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {notif.unread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                      <span className={notif.unread ? 'text-gray-900' : 'text-gray-600'}>
                        {notif.text}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demandes de devis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Mes demandes de devis
              </h2>
              <div className="space-y-4">
                {demandesDevis.map((demande) => (
                  <div
                    key={demande.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {demande.service} - {demande.ville}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(demande.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span>{demande.devisRecus} devis reçus</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            demande.status === 'en_attente'
                              ? 'bg-yellow-100 text-yellow-700'
                              : demande.status === 'en_cours'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {demande.status === 'en_attente' && (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              En attente
                            </span>
                          )}
                          {demande.status === 'en_cours' && 'En cours'}
                          {demande.status === 'termine' && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Terminé
                            </span>
                          )}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
