'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Shield,
} from 'lucide-react'

interface SettingsData {
  profile: {
    id: string
    email: string
    full_name: string | null
    user_type: string
  } | null
  provider: {
    id: string
    name: string
    phone: string | null
    email: string | null
    is_active: boolean
    is_verified: boolean
  } | null
}

export default function ArtisanSettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/artisan/settings')
      const result = await res.json()
      if (res.ok) {
        setData(result)
        setName(result.provider?.name || result.profile?.full_name || '')
        setPhone(result.provider?.phone || '')
      } else if (res.status === 401) {
        window.location.href = '/connexion?redirect=/espace-artisan/parametres'
        return
      } else {
        setError(result.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/artisan/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      if (res.ok) {
        setSuccess('Paramètres enregistrés')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const result = await res.json()
        setError(result.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 text-sm text-gray-500">
          <Link href="/espace-artisan" className="hover:text-gray-900">Espace Artisan</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Paramètres</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Account status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" />
            Statut du compte
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Email :</span>{' '}
              <span className="text-gray-900">{data?.profile?.email || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Type :</span>{' '}
              <span className="text-gray-900 capitalize">{data?.profile?.user_type || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Compte actif :</span>{' '}
              {data?.provider?.is_active ? (
                <span className="text-green-600 font-medium">Oui</span>
              ) : (
                <span className="text-red-600 font-medium">Non</span>
              )}
            </div>
            <div>
              <span className="text-gray-500">Vérifié :</span>{' '}
              {data?.provider?.is_verified ? (
                <span className="text-green-600 font-medium">Oui</span>
              ) : (
                <span className="text-orange-600 font-medium">En attente</span>
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Informations
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom / Raison sociale
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="06 12 34 56 78"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
