'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ChevronLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Ban,
  CheckCircle,
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string | null
  is_admin: boolean
  is_banned: boolean
  user_type: 'client' | 'artisan'
  is_verified: boolean
  subscription_plan: 'gratuit' | 'pro' | 'premium'
  subscription_status: string | null
  stripe_customer_id: string | null
  created_at: string
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [banning, setBanning] = useState(false)
  const [error, setError] = useState('')

  // Form state — only fields that actually exist in profiles or auth metadata
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    user_type: 'client' as 'client' | 'artisan',
    subscription_plan: 'gratuit' as 'gratuit' | 'pro' | 'premium',
  })

  useEffect(() => {
    fetchUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setFormData({
          full_name: data.user.full_name || '',
          phone: data.user.phone || '',
          user_type: data.user.user_type || 'client',
          subscription_plan: data.user.subscription_plan || 'gratuit',
        })
      } else {
        setError('Utilisateur non trouvé')
      }
    } catch {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/admin/utilisateurs/${userId}`)
      } else {
        const data = await response.json()
        setError(data.error?.message || data.error || 'Erreur de sauvegarde')
      }
    } catch {
      setError('Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleBanToggle = async () => {
    if (!user) return
    try {
      setBanning(true)
      setError('')
      const action = user.is_banned ? 'unban' : 'ban'
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        await fetchUser()
      } else {
        const data = await response.json()
        setError(data.error?.message || data.error || 'Action échouée')
      }
    } catch {
      setError('Erreur lors de la modification du statut')
    } finally {
      setBanning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/utilisateurs')}
            className="text-blue-600 hover:underline"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push(`/admin/utilisateurs/${userId}`)}
              className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au profil
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;utilisateur</h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Informations personnelles
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">L&apos;email ne peut pas être modifié ici</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              Paramètres du compte
            </h2>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d&apos;utilisateur
                  </label>
                  <select
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value as 'client' | 'artisan' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="client">Client</option>
                    <option value="artisan">Artisan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email confirmé
                  </label>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      user?.is_verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user?.is_verified ? 'Confirmé' : 'Non confirmé'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Abonnement
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <div className="flex items-center gap-4">
                  {(['gratuit', 'pro', 'premium'] as const).map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setFormData({ ...formData, subscription_plan: plan })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.subscription_plan === plan
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: Les changements de plan ici ne modifient pas automatiquement l&apos;abonnement Stripe.
                  Utilisez la page Paiements pour les modifications Stripe.
                </p>
              </div>
              {user?.stripe_customer_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Client Stripe
                  </label>
                  <p className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                    {user.stripe_customer_id}
                  </p>
                </div>
              )}
              {user?.subscription_status && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut Stripe
                  </label>
                  <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    {user.subscription_status}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ban / Unban */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              Accès au compte
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Statut actuel :{' '}
                  <span className={user?.is_banned ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                    {user?.is_banned ? 'Banni' : 'Actif'}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {user?.is_banned
                    ? 'Cet utilisateur ne peut pas se connecter.'
                    : 'Bannir empêche toute connexion via Supabase Auth.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleBanToggle}
                disabled={banning}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  user?.is_banned
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {user?.is_banned ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {banning ? 'En cours...' : 'Débannir'}
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    {banning ? 'En cours...' : 'Bannir'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
