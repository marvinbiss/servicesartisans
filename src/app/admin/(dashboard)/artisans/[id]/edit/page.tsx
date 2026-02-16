'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'
import { Toast } from '@/components/admin/Toast'

interface ArtisanData {
  id: string
  user_id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  siret: string | null
  siren: string | null
  description: string | null
  services: string[]
  zones: string[]
  address: string | null
  city: string | null
  postal_code: string | null
  department: string | null
  region: string | null
  hourly_rate: number | null
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  rating: number | null
  reviews_count: number
  website: string | null
  legal_form: string | null
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
  updated_at: string | null
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    company_name: '',
    phone: '',
    siret: '',
    description: '',
    website: '',
    services: [] as string[],
    zones: [] as string[],
    address: '',
    city: '',
    postal_code: '',
    department: '',
    region: '',
    hourly_rate: '',
    is_verified: false,
    is_featured: false,
    availability: {} as Record<string, { start: string; end: string }>,
  })

  // Track if form has changes
  const [hasChanges, setHasChanges] = useState(false)

  // Inline field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Input states for services and zones
  const [newService, setNewService] = useState('')
  const [newZone, setNewZone] = useState('')

  // Field validation
  function validateField(name: string, value: string): string | null {
    switch (name) {
      case 'full_name':
        return !value.trim() ? 'Le nom est requis' : null
      case 'phone':
        return value && !/^(\+33|0)[1-9][\d\s.-]{7,13}$/.test(value.replace(/\s/g, ''))
          ? 'Numéro de téléphone invalide' : null
      case 'siret':
        return value && !/^\d{14}$/.test(value.replace(/\s/g, ''))
          ? 'Le SIRET doit contenir 14 chiffres' : null
      case 'postal_code':
        return value && !/^\d{5}$/.test(value)
          ? 'Le code postal doit contenir 5 chiffres' : null
      case 'website':
        if (!value) return null
        try { new URL(value); return null } catch { return 'URL invalide' }
      case 'hourly_rate':
        const rate = Number(value)
        return value && (isNaN(rate) || rate < 0 || rate > 9999)
          ? 'Le tarif doit être entre 0 et 9999' : null
      default:
        return null
    }
  }

  function handleBlur(name: string, value: string) {
    const error = validateField(name, value)
    setFieldErrors(prev => {
      if (error) return { ...prev, [name]: error }
      const { [name]: _, ...rest } = prev
      return rest
    })
  }

  function clearFieldError(name: string) {
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const { [name]: _, ...rest } = prev
        return rest
      })
    }
  }

  const fetchArtisan = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/providers/${artisanId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.provider) {
          setArtisan(data.provider)
          setFormData({
            email: data.provider.email || '',
            full_name: data.provider.full_name || '',
            company_name: data.provider.company_name || '',
            phone: data.provider.phone || '',
            siret: data.provider.siret || '',
            description: data.provider.description || '',
            website: data.provider.website || '',
            services: data.provider.services || [],
            zones: data.provider.zones || [],
            address: data.provider.address || '',
            city: data.provider.city || '',
            postal_code: data.provider.postal_code || '',
            department: data.provider.department || '',
            region: data.provider.region || '',
            hourly_rate: data.provider.hourly_rate?.toString() || '',
            is_verified: data.provider.is_verified || false,
            is_featured: data.provider.is_featured || false,
            availability: data.provider.availability || {},
          })
          setHasChanges(false)
        } else {
          setToast({ message: 'Artisan non trouvé', type: 'error' })
        }
      } else {
        setToast({ message: 'Erreur lors du chargement', type: 'error' })
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setToast({ message: 'Erreur de connexion', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [artisanId])

  useEffect(() => {
    fetchArtisan()
  }, [fetchArtisan])

  // Track form changes
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (saving) return

    // Validate all fields before saving
    const fieldsToValidate: [string, string][] = [
      ['full_name', formData.full_name],
      ['phone', formData.phone],
      ['siret', formData.siret],
      ['postal_code', formData.postal_code],
      ['website', formData.website],
      ['hourly_rate', formData.hourly_rate],
    ]
    const errors: Record<string, string> = {}
    for (const [name, value] of fieldsToValidate) {
      const error = validateField(name, value)
      if (error) errors[name] = error
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setToast({ message: 'Veuillez corriger les erreurs dans le formulaire', type: 'error' })
      return
    }

    try {
      setSaving(true)

      // Prepare data for API
      const payload = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      }

      const response = await fetch(`/api/admin/providers/${artisanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setToast({ message: 'Artisan mis \u00e0 jour avec succ\u00e8s !', type: 'success' })
        setHasChanges(false)

        // Redirect after a short delay with full page reload to clear cache
        setTimeout(() => {
          window.location.href = `/admin/artisans/${artisanId}`
        }, 1500)
      } else {
        const errorMsg = data.error || data.message || 'Erreur de sauvegarde'
        setToast({ message: errorMsg, type: 'error' })
      }
    } catch (err) {
      console.error('Save exception:', err)
      setToast({ message: 'Erreur de connexion au serveur', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      updateFormData({ services: [...formData.services, newService.trim()] })
      setNewService('')
    }
  }

  const removeService = (service: string) => {
    updateFormData({ services: formData.services.filter(s => s !== service) })
  }

  const addZone = () => {
    if (newZone.trim() && !formData.zones.includes(newZone.trim())) {
      updateFormData({ zones: [...formData.zones, newZone.trim()] })
      setNewZone('')
    }
  }

  const removeZone = (zone: string) => {
    updateFormData({ zones: formData.zones.filter(z => z !== zone) })
  }

  const updateAvailability = (day: string, field: 'start' | 'end', value: string) => {
    updateFormData({
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
      updateFormData({ availability: rest })
    } else {
      updateFormData({
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
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
          <p className="text-gray-500 mt-4">Chargement de l&apos;artisan...</p>
        </div>
      </div>
    )
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Artisan non trouvé</h2>
          <p className="text-gray-500 mb-4">L&apos;artisan demandé n&apos;existe pas ou a été supprimé.</p>
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
      {/* Toast notification */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

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
            <p className="text-gray-500 mt-1">{artisan.company_name || artisan.full_name}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>

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
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => { updateFormData({ full_name: e.target.value }); clearFieldError('full_name') }}
                    onBlur={(e) => handleBlur('full_name', e.target.value)}
                    placeholder="Jean Dupont"
                    maxLength={200}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${fieldErrors.full_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  />
                  {fieldErrors.full_name && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;entreprise
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => updateFormData({ company_name: e.target.value })}
                    placeholder="Entreprise Dupont SARL"
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    placeholder="contact@entreprise.fr"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => { updateFormData({ phone: e.target.value }); clearFieldError('phone') }}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    placeholder="01 23 45 67 89"
                    maxLength={20}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${fieldErrors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET
                  </label>
                  <input
                    id="siret"
                    type="text"
                    value={formData.siret}
                    onChange={(e) => { updateFormData({ siret: e.target.value }); clearFieldError('siret') }}
                    onBlur={(e) => handleBlur('siret', e.target.value)}
                    placeholder="12345678901234"
                    maxLength={14}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 font-mono ${fieldErrors.siret ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  />
                  {fieldErrors.siret && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.siret}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => { updateFormData({ website: e.target.value }); clearFieldError('website') }}
                    onBlur={(e) => handleBlur('website', e.target.value)}
                    placeholder="https://www.entreprise.fr"
                    maxLength={2048}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${fieldErrors.website ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  />
                  {fieldErrors.website && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.website}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez l'entreprise, ses services, son expertise..."
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse complète
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  placeholder="123 rue de la République"
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    id="postal_code"
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => { updateFormData({ postal_code: e.target.value }); clearFieldError('postal_code') }}
                    onBlur={(e) => handleBlur('postal_code', e.target.value)}
                    placeholder="75001"
                    maxLength={10}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${fieldErrors.postal_code ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  />
                  {fieldErrors.postal_code && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.postal_code}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="Paris"
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Département
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => updateFormData({ department: e.target.value })}
                    placeholder="75"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              {formData.services.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun service défini</p>
              ) : (
                formData.services.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {service}
                    <button
                      onClick={() => removeService(service)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                placeholder="Ajouter un service (ex: Plomberie, Électricité...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addService}
                disabled={!newService.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {formData.zones.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune zone définie</p>
              ) : (
                formData.zones.map((zone) => (
                  <span
                    key={zone}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {zone}
                    <button
                      onClick={() => removeZone(zone)}
                      className="ml-1 hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addZone())}
                placeholder="Ajouter une zone (ex: Paris 75000, Île-de-France...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addZone}
                disabled={!newZone.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-1">
                    Taux horaire (€)
                  </label>
                  <input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => { updateFormData({ hourly_rate: e.target.value }); clearFieldError('hourly_rate') }}
                    onBlur={(e) => handleBlur('hourly_rate', e.target.value)}
                    placeholder="50"
                    min={0}
                    max={9999}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${fieldErrors.hourly_rate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  />
                  {fieldErrors.hourly_rate && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.hourly_rate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vérifié
                  </label>
                  <button
                    type="button"
                    onClick={() => updateFormData({ is_verified: !formData.is_verified })}
                    role="switch"
                    aria-checked={formData.is_verified}
                    aria-label="Vérifié"
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      formData.is_verified ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform shadow ${
                        formData.is_verified ? 'translate-x-7' : ''
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mis en avant
                  </label>
                  <button
                    type="button"
                    onClick={() => updateFormData({ is_featured: !formData.is_featured })}
                    role="switch"
                    aria-checked={formData.is_featured}
                    aria-label="Mis en avant"
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      formData.is_featured ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform shadow ${
                        formData.is_featured ? 'translate-x-7' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
              {artisan && (
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-600">
                      Note: {artisan.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {artisan.reviews_count} avis
                  </div>
                  {artisan.updated_at && (
                    <div className="text-sm text-gray-400">
                      Dernière modification: {new Date(artisan.updated_at).toLocaleDateString('fr-FR')}
                    </div>
                  )}
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
                  <div className="w-32">
                    <label className="flex items-center gap-2 cursor-pointer">
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
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">à</span>
                      <input
                        type="time"
                        value={formData.availability[key]?.end || '18:00'}
                        onChange={(e) => updateAvailability(key, 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky save button for mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
