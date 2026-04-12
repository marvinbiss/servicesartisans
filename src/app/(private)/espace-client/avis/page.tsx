'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ArrowLeft, Edit2, Trash2, Loader2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import ClientSidebar from '@/components/client/ClientSidebar'
import { logger } from '@/lib/logger'

interface AvisPublie {
  id: string
  artisan: string
  provider_id: string
  service: string | null
  date: string
  note: number
  commentaire: string
  reponse?: string
}

interface AvisEnAttente {
  id: string
  artisan: string
  provider_id: string
  service: string | null
  date: string
  booking_id: string
}

export default function AvisClientPage() {
  const [avisPublies, setAvisPublies] = useState<AvisPublie[]>([])
  const [avisEnAttente, setAvisEnAttente] = useState<AvisEnAttente[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAvis, setSelectedAvis] = useState<AvisEnAttente | null>(null)
  const [editingAvis, setEditingAvis] = useState<AvisPublie | null>(null)
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvis()
  }, [])

  const fetchAvis = async () => {
    try {
      const response = await fetch('/api/client/avis')
      if (response.ok) {
        const data = await response.json()
        setAvisPublies(data.avisPublies || [])
        setAvisEnAttente(data.avisEnAttente || [])
      }
    } catch (error) {
      logger.error('Error fetching avis', error)
      setError('Impossible de charger vos avis. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAvis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAvis && !editingAvis) return

    setSubmitting(true)
    try {
      if (editingAvis) {
        // Update existing review
        const response = await fetch('/api/client/avis', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_id: editingAvis.id,
            rating: note,
            content: commentaire,
          }),
        })

        if (response.ok) {
          await fetchAvis()
          setShowModal(false)
          setEditingAvis(null)
        }
      } else if (selectedAvis) {
        // Create new review
        const response = await fetch('/api/client/avis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: selectedAvis.provider_id,
            booking_id: selectedAvis.booking_id,
            rating: note,
            content: commentaire,
          }),
        })

        if (response.ok) {
          await fetchAvis()
          setShowModal(false)
          setSelectedAvis(null)
        }
      }
    } catch (err) {
      logger.error('Error submitting avis', err)
      setError("Erreur lors de l'envoi de votre avis")
    } finally {
      setSubmitting(false)
      setNote(5)
      setCommentaire('')
    }
  }

  const handleDeleteAvis = async (avisId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return

    try {
      const response = await fetch(`/api/client/avis?id=${avisId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAvis()
      }
    } catch (err) {
      logger.error('Error deleting avis', err)
      setError("Erreur lors de la suppression de l'avis")
    }
  }

  const openModal = (avis: AvisEnAttente) => {
    setSelectedAvis(avis)
    setEditingAvis(null)
    setNote(5)
    setCommentaire('')
    setShowModal(true)
  }

  const openEditModal = (avis: AvisPublie) => {
    setEditingAvis(avis)
    setSelectedAvis(null)
    setNote(avis.note)
    setCommentaire(avis.commentaire)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb
            items={[{ label: 'Mon espace', href: '/espace-client' }, { label: 'Mes avis' }]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/espace-client" className="text-charcoal-600 hover:text-charcoal-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-900">Mes avis</h1>
                <p className="text-charcoal-600">Gérez vos avis sur les artisans</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <ClientSidebar activePage="avis-donnes" />

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* En attente */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 font-medium ml-4"
                >
                  ✕
                </button>
              </div>
            )}
            {avisEnAttente.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-charcoal-900 mb-4">
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
                          <h3 className="font-medium text-charcoal-900">{avis.artisan}</h3>
                          <p className="text-sm text-charcoal-600">{avis.service}</p>
                          <p className="text-sm text-charcoal-500 mt-1">
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
              <h2 className="text-lg font-semibold text-charcoal-900 mb-4">
                Avis publiés ({avisPublies.length})
              </h2>
              {avisPublies.length === 0 ? (
                <p className="text-charcoal-500 text-center py-8">
                  Vous n'avez pas encore publié d'avis.
                </p>
              ) : (
                <div className="space-y-4">
                  {avisPublies.map((avis) => (
                    <div key={avis.id} className="border border-sand-300 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-charcoal-900">{avis.artisan}</h3>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < avis.note ? 'text-yellow-400 fill-current' : 'text-sand-500'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-charcoal-600 mb-2">{avis.service}</p>
                          <p className="text-charcoal-700">{avis.commentaire}</p>
                          {avis.reponse && (
                            <div className="mt-3 bg-sand-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-charcoal-700 mb-1">
                                Réponse de l'artisan :
                              </p>
                              <p className="text-sm text-charcoal-600">{avis.reponse}</p>
                            </div>
                          )}
                          <p className="text-sm text-charcoal-500 mt-2">
                            Publié le {new Date(avis.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(avis)}
                            className="p-2 text-charcoal-400 hover:text-primary-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAvis(avis.id)}
                            className="p-2 text-charcoal-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (selectedAvis || editingAvis) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">
              {editingAvis
                ? 'Modifier votre avis'
                : `Laisser un avis pour ${selectedAvis?.artisan}`}
            </h2>
            <p className="text-charcoal-600 mb-6">
              Service : {editingAvis?.service || selectedAvis?.service}
            </p>

            <form onSubmit={handleSubmitAvis} className="space-y-6">
              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
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
                          value <= note ? 'text-yellow-400 fill-current' : 'text-sand-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Votre commentaire
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400"
                  placeholder="Décrivez votre expérience avec cet artisan..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedAvis(null)
                    setEditingAvis(null)
                  }}
                  className="flex-1 px-4 py-3 border border-sand-400 rounded-lg font-medium hover:bg-sand-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingAvis ? 'Mettre à jour' : "Publier l'avis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
