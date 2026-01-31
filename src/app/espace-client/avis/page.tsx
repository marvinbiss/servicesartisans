'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

const avisPublies = [
  {
    id: 1,
    artisan: 'Martin Plomberie',
    service: 'Réparation fuite',
    date: '2024-01-15',
    note: 5,
    commentaire: 'Excellent travail ! Intervention rapide et efficace. Le plombier était très professionnel et a résolu mon problème en moins d\'une heure. Je recommande vivement.',
  },
  {
    id: 2,
    artisan: 'Électricité Plus',
    service: 'Installation tableau électrique',
    date: '2024-01-10',
    note: 4,
    commentaire: 'Bon travail dans l\'ensemble. L\'électricien connaissait bien son métier. Seul bémol : un léger retard le jour de l\'intervention.',
  },
]

const avisEnAttente = [
  {
    id: 3,
    artisan: 'Peinture Pro',
    service: 'Peinture salon',
    date: '2024-01-18',
  },
]

export default function AvisClientPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedAvis, setSelectedAvis] = useState<typeof avisEnAttente[0] | null>(null)
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')

  const handleSubmitAvis = (e: React.FormEvent) => {
    e.preventDefault()
    setShowModal(false)
    setNote(5)
    setCommentaire('')
  }

  const openModal = (avis: typeof avisEnAttente[0]) => {
    setSelectedAvis(avis)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb
            items={[
              { label: 'Mon espace', href: '/espace-client' },
              { label: 'Mes avis' }
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/espace-client" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes avis</h1>
                <p className="text-gray-600">Gérez vos avis sur les artisans</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              <Link
                href="/espace-client"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
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
            <QuickSiteLinks />
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* En attente */}
            {avisEnAttente.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Avis en attente ({avisEnAttente.length})
                </h2>
                <div className="space-y-4">
                  {avisEnAttente.map((avis) => (
                    <div
                      key={avis.id}
                      className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{avis.artisan}</h3>
                          <p className="text-sm text-gray-600">{avis.service}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Intervention le {new Date(avis.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => openModal(avis)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                        >
                          Laisser un avis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis publiés */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Avis publiés ({avisPublies.length})
              </h2>
              <div className="space-y-4">
                {avisPublies.map((avis) => (
                  <div
                    key={avis.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{avis.artisan}</h3>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < avis.note ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{avis.service}</p>
                        <p className="text-gray-700">{avis.commentaire}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Publié le {new Date(avis.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedAvis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Laisser un avis pour {selectedAvis.artisan}
            </h2>
            <p className="text-gray-600 mb-6">
              Service : {selectedAvis.service}
            </p>

            <form onSubmit={handleSubmitAvis} className="space-y-6">
              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre note
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNote(value)}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          value <= note ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre commentaire
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre expérience avec cet artisan..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Publier l'avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
