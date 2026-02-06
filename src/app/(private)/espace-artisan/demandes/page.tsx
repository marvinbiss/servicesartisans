'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Euro, ArrowLeft, Filter, Calendar, MapPin, ChevronRight, Eye, Send, ExternalLink, Search, Loader2, X, Phone, Mail } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

interface Demande {
  id: string
  client_id: string | null
  client_name: string
  client_email: string
  client_phone: string
  service_name: string
  description: string
  city: string | null
  postal_code: string
  created_at: string
  budget: string | null
  status: string
  urgency: string
}

interface Stats {
  total: number
  nouveau: number
  devis_envoye: number
  accepte: number
  refuse: number
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Nouveau', color: 'bg-red-100 text-red-700' },
  sent: { label: 'Devis envoyé', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Accepté', color: 'bg-green-100 text-green-700' },
  refused: { label: 'Refusé', color: 'bg-gray-100 text-gray-700' },
  completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-700' },
}

export default function DemandesArtisanPage() {
  const [loading, setLoading] = useState(true)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDevisModal, setShowDevisModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [devisForm, setDevisForm] = useState({
    amount: '',
    description: '',
    validity_days: 30,
  })

  useEffect(() => {
    fetchDemandes()
  }, [filterStatus])

  const fetchDemandes = async () => {
    try {
      setLoading(true)
      const url = filterStatus === 'all'
        ? '/api/artisan/demandes'
        : `/api/artisan/demandes?status=${filterStatus}`
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setDemandes(data.demandes || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching demandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDevisModal = (demande: Demande) => {
    setSelectedDemande(demande)
    setDevisForm({ amount: '', description: '', validity_days: 30 })
    setShowDevisModal(true)
  }

  const openDetailModal = (demande: Demande) => {
    setSelectedDemande(demande)
    setShowDetailModal(true)
  }

  const handleSendDevis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDemande || !devisForm.amount) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/artisan/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devis_request_id: selectedDemande.id,
          amount: parseFloat(devisForm.amount),
          description: devisForm.description,
          validity_days: devisForm.validity_days,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowDevisModal(false)
        setSelectedDemande(null)
        await fetchDemandes()
        alert('Devis envoyé avec succès!')
      } else {
        alert(data.error || 'Erreur lors de l\'envoi du devis')
      }
    } catch (error) {
      console.error('Error sending devis:', error)
      alert('Erreur lors de l\'envoi du devis')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContact = (demande: Demande) => {
    // Navigate to messages with this client
    window.location.href = `/espace-artisan/messages?with=${demande.client_id || ''}`
  }

  const filteredDemandes = demandes

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
                {stats?.nouveau ? (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.nouveau}</span>
                ) : null}
              </Link>
              <Link
                href="/espace-artisan/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
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
                href="/services/plombier/paris/martin-plomberie-paris"
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
                    Toutes ({stats?.total || 0})
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Nouvelles ({stats?.nouveau || 0})
                  </button>
                  <button
                    onClick={() => setFilterStatus('sent')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Devis envoyés ({stats?.devis_envoye || 0})
                  </button>
                  <button
                    onClick={() => setFilterStatus('accepted')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === 'accepted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Acceptées ({stats?.accepte || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* Demandes list */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Chargement des demandes...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDemandes.map((demande) => {
                  const statusInfo = statusConfig[demande.status] || { label: demande.status, color: 'bg-gray-100 text-gray-700' }
                  return (
                    <div
                      key={demande.id}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{demande.service_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            {demande.urgency === 'urgent' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                Urgent
                              </span>
                            )}
                            {demande.urgency === 'tres_urgent' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Très urgent
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{demande.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{demande.client_name}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {demande.city || demande.postal_code}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            {demande.budget && (
                              <span className="font-medium text-blue-600">
                                Budget : {demande.budget}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {demande.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openDevisModal(demande)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                              >
                                <Send className="w-4 h-4" />
                                Envoyer devis
                              </button>
                              <button
                                onClick={() => openDetailModal(demande)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {demande.status === 'sent' && (
                            <button
                              onClick={() => handleContact(demande)}
                              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Contacter
                            </button>
                          )}
                          {demande.status === 'accepted' && (
                            <span className="text-green-600 font-medium">Mission confirmée</span>
                          )}
                          {demande.status === 'completed' && (
                            <span className="text-blue-600 font-medium">Terminée</span>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!loading && filteredDemandes.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Aucune demande</h3>
                <p className="text-gray-500">Aucune demande ne correspond à ce filtre.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Envoyer Devis */}
      {showDevisModal && selectedDemande && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Envoyer un devis
              </h2>
              <button
                onClick={() => setShowDevisModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">{selectedDemande.service_name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedDemande.description}</p>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{selectedDemande.client_name}</span> - {selectedDemande.city || selectedDemande.postal_code}
              </div>
            </div>

            <form onSubmit={handleSendDevis} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant du devis (EUR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={devisForm.amount}
                  onChange={(e) => setDevisForm({ ...devisForm, amount: e.target.value })}
                  placeholder="Ex: 250.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Détails du devis
                </label>
                <textarea
                  value={devisForm.description}
                  onChange={(e) => setDevisForm({ ...devisForm, description: e.target.value })}
                  rows={3}
                  placeholder="Détaillez les prestations incluses..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validité du devis
                </label>
                <select
                  value={devisForm.validity_days}
                  onChange={(e) => setDevisForm({ ...devisForm, validity_days: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7 jours</option>
                  <option value={15}>15 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={60}>60 jours</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDevisModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Envoyer le devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedDemande && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Détails de la demande
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{selectedDemande.service_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedDemande.status]?.color || 'bg-gray-100'}`}>
                  {statusConfig[selectedDemande.status]?.label || selectedDemande.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{selectedDemande.description || 'Non précisé'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Contact client</h4>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{selectedDemande.client_name}</p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selectedDemande.client_email}`} className="text-blue-600 hover:underline">
                      {selectedDemande.client_email}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${selectedDemande.client_phone}`} className="text-blue-600 hover:underline">
                      {selectedDemande.client_phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {selectedDemande.city || selectedDemande.postal_code}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500">Budget estimé</span>
                  <p className="font-medium text-gray-900">{selectedDemande.budget || 'Non précisé'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500">Date de demande</span>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedDemande.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                {selectedDemande.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      openDevisModal(selectedDemande)
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer un devis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
