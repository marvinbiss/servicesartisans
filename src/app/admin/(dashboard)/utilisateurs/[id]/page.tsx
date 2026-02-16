'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Save,
  Ban,
  CheckCircle,
  Trash2,
  User,
  CreditCard,
  Star,
  FileText,
} from 'lucide-react'
import { SubscriptionBadge, UserStatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  user_type: 'client' | 'artisan'
  company_name: string | null
  siret: string | null
  description: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  is_verified: boolean
  is_banned: boolean
  ban_reason: string | null
  subscription_plan: 'gratuit' | 'pro' | 'premium'
  subscription_status: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string | null
  stats?: {
    bookings: number
    reviews: number
  }
}

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})

  // Modal states
  const [banModal, setBanModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setFormData(data.user)
      } else {
        router.push('/admin/utilisateurs')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      router.push('/admin/utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditMode(false)
      }
    } catch (error) {
      console.error('Failed to save user:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBan = async () => {
    try {
      const action = user?.is_banned ? 'unban' : 'ban'
      await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: banReason }),
      })
      setBanModal(false)
      setBanReason('')
      fetchUser()
    } catch (error) {
      console.error('Ban action failed:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      router.push('/admin/utilisateurs')
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const getUserStatus = (): string => {
    if (!user) return 'pending'
    if (user.is_banned) return 'banned'
    if (!user.is_verified) return 'pending'
    return 'active'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/utilisateurs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.full_name || 'Sans nom'}
              </h1>
              <p className="text-gray-500 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <UserStatusBadge status={getUserStatus()} />
                <SubscriptionBadge plan={user.subscription_plan} />
                <span className="text-sm text-gray-500 capitalize">{user.user_type}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {editMode ? (
                <>
                  <button
                    onClick={() => {
                      setFormData(user)
                      setEditMode(false)
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Modifier
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-gray-900">
                    <User className="w-4 h-4 text-gray-400" />
                    {user.full_name || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {user.phone || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de compte
                </label>
                {editMode ? (
                  <select
                    value={formData.user_type || 'client'}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value as 'client' | 'artisan' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="client">Client</option>
                    <option value="artisan">Artisan</option>
                  </select>
                ) : (
                  <p className="capitalize text-gray-900">{user.user_type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations artisan */}
          {(user.user_type === 'artisan' || editMode) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;entreprise
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="flex items-center gap-2 text-gray-900">
                      <Building className="w-4 h-4 text-gray-400" />
                      {user.company_name || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.siret || ''}
                      onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user.siret || '-'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  {editMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Adresse"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="Code postal"
                        value={formData.postal_code || ''}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="Ville"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {[user.address, user.postal_code, user.city].filter(Boolean).join(', ') || '-'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  ) : (
                    <p className="text-gray-900">{user.description || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Abonnement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Abonnement</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                {editMode ? (
                  <select
                    value={formData.subscription_plan || 'gratuit'}
                    onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value as 'gratuit' | 'pro' | 'premium' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="gratuit">Gratuit</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <SubscriptionBadge plan={user.subscription_plan} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <p className="text-gray-900">{user.subscription_status || 'Actif'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe ID</label>
                <p className="text-gray-500 text-sm font-mono">
                  {user.stripe_customer_id || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          {user.stats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-2xl font-bold text-gray-900">{user.stats.bookings}</p>
                  <p className="text-sm text-gray-500">Réservations</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-secondary-500" />
                  <p className="text-2xl font-bold text-gray-900">{user.stats.reviews}</p>
                  <p className="text-sm text-gray-500">Avis donnés</p>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique</h2>

            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                Inscrit le {formatDate(user.created_at)}
              </p>
              {user.updated_at && (
                <p className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4" />
                  Dernière modification le {formatDate(user.updated_at)}
                </p>
              )}
              {user.is_banned && user.ban_reason && (
                <p className="flex items-center gap-2 text-red-600">
                  <Ban className="w-4 h-4" />
                  Raison du ban: {user.ban_reason}
                </p>
              )}
            </div>
          </div>

          {/* Actions dangereuses */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Zone de danger</h2>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setBanModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  user.is_banned
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {user.is_banned ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Débannir
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Bannir
                  </>
                )}
              </button>

              <button
                onClick={() => setDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      <ConfirmationModal
        isOpen={banModal}
        onClose={() => {
          setBanModal(false)
          setBanReason('')
        }}
        onConfirm={handleBan}
        title={user.is_banned ? 'Débannir utilisateur' : 'Bannir utilisateur'}
        message={
          user.is_banned
            ? `Êtes-vous sûr de vouloir débannir ${user.full_name || user.email} ?`
            : `Êtes-vous sûr de vouloir bannir ${user.full_name || user.email} ? L'utilisateur ne pourra plus accéder à la plateforme.`
        }
        confirmText={user.is_banned ? 'Débannir' : 'Bannir'}
        variant={user.is_banned ? 'success' : 'danger'}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer le compte"
        message={`Êtes-vous sûr de vouloir supprimer le compte de ${user.full_name || user.email} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        requireConfirmation="SUPPRIMER"
      />
    </div>
  )
}
