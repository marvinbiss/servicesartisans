'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ChevronLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Clock,
  Euro,
  Image,
} from 'lucide-react'

interface ArtisanData {
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
  rating: number | null
  reviews_count: number
  availability: {
    monday?: { start: string; end: string }
    tuesday?: { start: string; end: string }
    wednesday?: { start: string; end: string }
    thursday?: { start: string; end: string }
    friday?: { start: string; end: string }
    saturday?: { start: string; end: string }
    sunday?: { start: string; end: string }
  } | null
  profile_image: string | null
  created_at: string
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

export default function EditArtisanPage() {
  const router = useRouter()
  const params = useParams()
  const artisanId = params.id as string

  const [artisan, setArtisan] = useState<ArtisanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    company_name: '',
    phone: '',
    siret: '',
    description: '',
    services: [] as string[],
    zones: [] as string[],
    address: '',
    city: '',
    postal_code: '',
    hourly_rate: '',
    is_verified: false,
    is_featured: false,
    availability: {} as Record<string, { start: string; end: string }>,
  })

  const [successMessage, setSuccessMessage] = useState('')

  // Input states for services and zones
  const [newService, setNewService] = useState('')
  const [newZone, setNewZone] = useState('')

  useEffect(() => {
    fetchArtisan()
  }, [artisanId])

  const fetchArtisan = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/providers/${artisanId}`)
      if (response.ok) {
        const data = await response.json()
        setArtisan(data.provider)
        setFormData({
          email: data.provider.email || '',
          full_name: data.provider.full_name || '',
          company_name: data.provider.company_name || '',
          phone: data.provider.phone || '',
          siret: data.provider.siret || '',
          description: data.provider.description || '',
          services: data.provider.services || [],
          zones: data.provider.zones || [],
          address: data.provider.address || '',
          city: data.provider.city || '',
          postal_code: data.provider.postal_code || '',
          hourly_rate: data.provider.hourly_rate?.toString() || '',
          is_verified: data.provider.is_verified || false,
          is_featured: data.provider.is_featured || false,
          availability: data.provider.availability || {},
        })
      } else {
        setError('Artisan non trouvé')
      }
    } catch (err) {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccessMessage('')

      const response = await fetch(`/api/admin/providers/${artisanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage('Artisan mis à jour avec succès!')
        // Refresh data to show updated values
        await fetchArtisan()
        // Optionally redirect after a short delay
        setTimeout(() => {
          router.push(`/admin/artisans/${artisanId}`)
        }, 1500)
      } else {
        setError(data.error || data.message || 'Erreur de sauvegarde')
      }
    } catch (err) {
      console.error('Save error:', err)
      setError('Erreur de sauvegarde - vérifiez la connexion')
    } finally {
      setSaving(false)
    }
  }

  const addService = () => {
    if (newService && !formData.services.includes(newService)) {
      setFormData({ ...formData, services: [...formData.services, newService] })
      setNewService('')
    }
  }

  const removeService = (service: string) => {
    setFormData({ ...formData, services: formData.services.filter(s => s !== service) })
  }

  const addZone = () => {
    if (newZone && !formData.zones.includes(newZone)) {
      setFormData({ ...formData, zones: [...formData.zones, newZone] })
      setNewZone('')
    }
  }

  const removeZone = (zone: string) => {
    setFormData({ ...formData, zones: formData.zones.filter(z => z !== zone) })
  }

  const updateAvailability = (day: string, field: 'start' | 'end', value: string) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [field]: value,
        },
      },
    })
  }

  const toggleDayAvailability = (day: string) => {
    if (formData.availability[day]) {
      const { [day]: _, ...rest } = formData.availability
      setFormData({ ...formData, availability: rest })
    } else {
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          [day]: { start: '09:00', end: '18:00' },
        },
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !artisan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/artisans')}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/admin/artisans')}
              className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour à la liste
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;artisan</h1>
            <p className="text-gray-500 mt-1">{artisan?.email}</p>
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

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Personal & Company Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Informations générales
            </h2>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              Adresse
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              Services proposés
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {service}
                  <button
                    onClick={() => removeService(service)}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                placeholder="Ajouter un service..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addService}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Zones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              Zones d&apos;intervention
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.zones.map((zone) => (
                <span
                  key={zone}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {zone}
                  <button
                    onClick={() => removeZone(zone)}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addZone())}
                placeholder="Ajouter une zone (ex: Paris 75000)..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addZone}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Pricing & Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-gray-400" />
              Tarif et statut
            </h2>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux horaire (€)
                  </label>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vérifié
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_verified: !formData.is_verified })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.is_verified ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.is_verified ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mis en avant
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.is_featured ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.is_featured ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
              {artisan && (
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-600">
                      Note: {artisan.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {artisan.reviews_count} avis
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Disponibilités
            </h2>
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-28">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!formData.availability[key]}
                        onChange={() => toggleDayAvailability(key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  </div>
                  {formData.availability[key] && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={formData.availability[key]?.start || '09:00'}
                        onChange={(e) => updateAvailability(key, 'start', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">à</span>
                      <input
                        type="time"
                        value={formData.availability[key]?.end || '18:00'}
                        onChange={(e) => updateAvailability(key, 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
