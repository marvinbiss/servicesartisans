'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Star,
  Ban,
  CheckCircle,
  Trash2,
  Briefcase,
  Clock,
  Euro,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { SubscriptionBadge } from '@/components/admin/StatusBadge'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'

interface ArtisanProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  siret: string | null
  description: string | null
  services: string[]
  zones: string[]
  address: string | null
  city: string | null
  postal_code: string | null
  hourly_rate: number | null
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  rating: number | null
  reviews_count: number
  subscription_plan: 'gratuit' | 'pro' | 'premium'
  created_at: string
  updated_at: string | null
  stats?: {
    bookings_total: number
    bookings_completed: number
    quotes_received: number
    quotes_responded: number
    response_rate: number
  }
}

export default function AdminArtisanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const artisanId = params.id as string

  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [verifyModal, setVerifyModal] = useState(false)
  const [suspendModal, setSuspendModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    fetchArtisan()
  }, [artisanId])

  const fetchArtisan = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/providers/${artisanId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('[Detail] Fetched artisan:', data.provider)
        setArtisan(data.provider)
      } else {
        router.push('/admin/artisans')
      }
    } catch (error) {
      console.error('Failed to fetch artisan:', error)
      router.push('/admin/artisans')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    try {
      const response = await fetch(`/api/admin/providers/${artisanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: true }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setVerifyModal(false)
        await fetchArtisan()
      } else {
        console.error('Verify failed:', data.error)
        alert(`Erreur: ${data.error || 'Vérification échouée'}`)
      }
    } catch (error) {
      console.error('Verify failed:', error)
      alert('Erreur de connexion')
    }
  }

  const handleSuspend = async () => {
    try {
      const response = await fetch(`/api/admin/providers/${artisanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !artisan?.is_active }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuspendModal(false)
        await fetchArtisan()
      } else {
        console.error('Suspend failed:', data.error)
        alert(`Erreur: ${data.error || 'Action échouée'}`)
      }
    } catch (error) {
      console.error('Suspend failed:', error)
      alert('Erreur de connexion')
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/providers/${artisanId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/admin/artisans')
      } else {
        console.error('Delete failed:', data.error)
        alert(`Erreur: ${data.error || 'Suppression échouée'}`)
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Erreur de connexion')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!artisan) {
    return null
  }

  const getStatusBadge = () => {
    if (!artisan.is_active) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Suspendu</span>
    }
    if (!artisan.is_verified) {
      return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">En attente de vérification</span>
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Vérifié</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/artisans')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {artisan.company_name || artisan.full_name || 'Sans nom'}
                </h1>
                {artisan.is_featured && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                    Mis en avant
                  </span>
                )}
              </div>
              <p className="text-gray-500 mt-1">{artisan.email}</p>
              <div className="flex items-center gap-3 mt-3">
                {getStatusBadge()}
                <SubscriptionBadge plan={artisan.subscription_plan} />
                {artisan.rating && artisan.reviews_count > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{artisan.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({artisan.reviews_count} avis)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/services/artisan/${artisanId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" />
                Voir page publique
              </a>
              <button
                onClick={() => router.push(`/admin/artisans/${artisanId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{artisan.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-gray-900">{artisan.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="text-gray-900">
                      {[artisan.address, artisan.postal_code, artisan.city].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">SIRET</p>
                    <p className="text-gray-900 font-mono">{artisan.siret || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {artisan.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{artisan.description}</p>
              </div>
            )}

            {/* Services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-400" />
                Services proposés
              </h2>
              {artisan.services && artisan.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {artisan.services.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun service défini</p>
              )}
            </div>

            {/* Zones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                Zones d&apos;intervention
              </h2>
              {artisan.zones && artisan.zones.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {artisan.zones.map((zone) => (
                    <span
                      key={zone}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune zone définie</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Réservations</span>
                  <span className="font-semibold text-gray-900">
                    {artisan.stats?.bookings_total || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Complétées</span>
                  <span className="font-semibold text-green-600">
                    {artisan.stats?.bookings_completed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Devis reçus</span>
                  <span className="font-semibold text-gray-900">
                    {artisan.stats?.quotes_received || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Taux de réponse</span>
                  <span className="font-semibold text-blue-600">
                    {artisan.stats?.response_rate || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Euro className="w-5 h-5 text-gray-400" />
                Tarification
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {artisan.hourly_rate ? `${artisan.hourly_rate}€/h` : 'Non défini'}
              </p>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique</h2>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Inscrit le {formatDate(artisan.created_at)}
                </p>
                {artisan.updated_at && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    Modifié le {formatDate(artisan.updated_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {!artisan.is_verified && (
                  <button
                    onClick={() => setVerifyModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Shield className="w-4 h-4" />
                    Vérifier l&apos;artisan
                  </button>
                )}
                <button
                  onClick={() => setSuspendModal(true)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                    artisan.is_active
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {artisan.is_active ? (
                    <>
                      <Ban className="w-4 h-4" />
                      Suspendre
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Réactiver
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verify Modal */}
      <ConfirmationModal
        isOpen={verifyModal}
        onClose={() => setVerifyModal(false)}
        onConfirm={handleVerify}
        title="Vérifier l'artisan"
        message={`Confirmez-vous la vérification de ${artisan.company_name || artisan.full_name} ? Le badge vérifié sera affiché sur son profil.`}
        confirmText="Vérifier"
        variant="success"
      />

      {/* Suspend Modal */}
      <ConfirmationModal
        isOpen={suspendModal}
        onClose={() => setSuspendModal(false)}
        onConfirm={handleSuspend}
        title={artisan.is_active ? "Suspendre l'artisan" : "Réactiver l'artisan"}
        message={
          artisan.is_active
            ? `Êtes-vous sûr de vouloir suspendre ${artisan.company_name || artisan.full_name} ? Son profil ne sera plus visible.`
            : `Voulez-vous réactiver le compte de ${artisan.company_name || artisan.full_name} ?`
        }
        confirmText={artisan.is_active ? 'Suspendre' : 'Réactiver'}
        variant={artisan.is_active ? 'warning' : 'success'}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'artisan"
        message={`Êtes-vous sûr de vouloir supprimer ${artisan.company_name || artisan.full_name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        requireConfirmation="SUPPRIMER"
      />
    </div>
  )
}
