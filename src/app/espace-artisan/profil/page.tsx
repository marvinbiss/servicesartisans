'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Euro, ArrowLeft, Camera, MapPin, Phone, Mail, Globe, Clock, Shield, Award, Plus, X, ExternalLink, Search, Loader2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

interface Profile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  siret: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  description: string | null
  services: string[] | null
  zones: string[] | null
  is_verified: boolean
  subscription_plan: string
}

export default function ProfilArtisanPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [_profile, setProfile] = useState<Profile | null>(null)

  const [formData, setFormData] = useState({
    entreprise: '',
    siret: '',
    nom: '',
    email: '',
    telephone: '',
    mobile: '',
    adresse: '',
    codePostal: '',
    ville: '',
    siteWeb: '',
    description: '',
  })

  const [horaires, setHoraires] = useState({
    lundi: { ouvert: true, debut: '08:00', fin: '18:00' },
    mardi: { ouvert: true, debut: '08:00', fin: '18:00' },
    mercredi: { ouvert: true, debut: '08:00', fin: '18:00' },
    jeudi: { ouvert: true, debut: '08:00', fin: '18:00' },
    vendredi: { ouvert: true, debut: '08:00', fin: '18:00' },
    samedi: { ouvert: true, debut: '09:00', fin: '12:00' },
    dimanche: { ouvert: false, debut: '', fin: '' },
  })

  const [services, setServices] = useState<string[]>([])
  const [zones, setZones] = useState<string[]>([])
  const [newService, setNewService] = useState('')
  const [newZone, setNewZone] = useState('')

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/artisan/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      const p = data.profile as Profile
      setProfile(p)
      setFormData({
        entreprise: p.company_name || '',
        siret: p.siret || '',
        nom: p.full_name || '',
        email: p.email || '',
        telephone: p.phone || '',
        mobile: '',
        adresse: p.address || '',
        codePostal: p.postal_code || '',
        ville: p.city || '',
        siteWeb: '',
        description: p.description || '',
      })
      setServices(p.services || [])
      setZones(p.zones || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const response = await fetch('/api/artisan/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.entreprise,
          siret: formData.siret,
          full_name: formData.nom,
          phone: formData.telephone,
          address: formData.adresse,
          city: formData.ville,
          postal_code: formData.codePostal,
          description: formData.description,
          services,
          zones,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      setSuccess('Profil mis à jour avec succès')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()])
      setNewService('')
    }
  }

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const addZone = () => {
    if (newZone.trim()) {
      setZones([...zones, newZone.trim()])
      setNewZone('')
    }
  }

  const removeZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[
            { label: 'Espace Artisan', href: '/espace-artisan' },
            { label: 'Mon profil' }
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
              <h1 className="text-2xl font-bold">Mon profil</h1>
              <p className="text-blue-100">Gérez les informations de votre entreprise</p>
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5" />
                Demandes
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
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

            {/* Certifications */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Certifications
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Profil vérifié</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Assurance RC Pro</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Garantie décennale</span>
                </div>
              </div>
            </div>

            {/* Voir mon profil public */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <Link
                href="/services/artisan/martin-plomberie-paris"
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
          <div className="lg:col-span-3 space-y-8">
            {/* Photo */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo de profil</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">MP</span>
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Ajoutez une photo de profil professionnelle pour inspirer confiance.
                  </p>
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    Changer la photo
                  </button>
                </div>
              </div>
            </div>

            {/* Informations entreprise */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Informations entreprise</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.entreprise}
                      onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      N° SIRET
                    </label>
                    <input
                      type="text"
                      value={formData.siret}
                      onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Site web
                    </label>
                    <input
                      type="text"
                      value={formData.siteWeb}
                      onChange={(e) => setFormData({ ...formData, siteWeb: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Téléphone fixe
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.codePostal}
                      onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Décrivez votre entreprise et vos services pour attirer plus de clients.
                  </p>
                </div>
              </div>

              {/* Services */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Services proposés</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {services.map((service, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Ajouter un service"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addService}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Zones d'intervention */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Zones d'intervention</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {zones.map((zone, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      {zone}
                      <button
                        type="button"
                        onClick={() => removeZone(index)}
                        className="hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    placeholder="Ajouter une zone (ex: Paris 75)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addZone}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Horaires */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horaires d'ouverture
                </h2>
                <div className="space-y-3">
                  {Object.entries(horaires).map(([jour, data]) => (
                    <div key={jour} className="flex items-center gap-4">
                      <span className="w-24 text-gray-700 capitalize">{jour}</span>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={data.ouvert}
                          onChange={(e) =>
                            setHoraires({
                              ...horaires,
                              [jour]: { ...data, ouvert: e.target.checked },
                            })
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Ouvert</span>
                      </label>
                      {data.ouvert && (
                        <>
                          <input
                            type="time"
                            value={data.debut}
                            onChange={(e) =>
                              setHoraires({
                                ...horaires,
                                [jour]: { ...data, debut: e.target.value },
                              })
                            }
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-500">à</span>
                          <input
                            type="time"
                            value={data.fin}
                            onChange={(e) =>
                              setHoraires({
                                ...horaires,
                                [jour]: { ...data, fin: e.target.value },
                              })
                            }
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error/Success messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
