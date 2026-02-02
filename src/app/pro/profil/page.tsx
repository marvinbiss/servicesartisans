'use client'

import { useState } from 'react'
import {
  User,
  Camera,
  Clock,
  Briefcase,
  Star,
  CheckCircle2,
  Plus,
  X,
  Save,
  Eye,
  Edit3,
  Award,
  Shield,
} from 'lucide-react'

interface ArtisanProfile {
  name: string
  businessName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  description: string
  services: string[]
  workingHours: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
  certifications: string[]
  yearsExperience: number
  website?: string
  socialMedia: {
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  responseTime: string
  verified: boolean
  rating: number
  reviewCount: number
}

// Mock profile data
const mockProfile: ArtisanProfile = {
  name: 'Jean Dupont',
  businessName: 'Dupont Plomberie',
  email: 'jean.dupont@email.com',
  phone: '06 12 34 56 78',
  address: '123 Rue de la Plomberie',
  city: 'Paris',
  postalCode: '75015',
  description:
    'Plombier professionnel avec plus de 15 ans d\'expérience. Spécialisé dans les dépannages urgents, les rénovations de salle de bain et l\'installation de systèmes de chauffage. Intervention rapide sur Paris et proche banlieue.',
  services: [
    'Réparation de fuites',
    'Débouchage canalisation',
    'Installation sanitaire',
    'Rénovation salle de bain',
    'Installation chauffe-eau',
    'Dépannage urgent',
  ],
  workingHours: {
    lundi: { open: '08:00', close: '18:00', closed: false },
    mardi: { open: '08:00', close: '18:00', closed: false },
    mercredi: { open: '08:00', close: '18:00', closed: false },
    jeudi: { open: '08:00', close: '18:00', closed: false },
    vendredi: { open: '08:00', close: '18:00', closed: false },
    samedi: { open: '09:00', close: '14:00', closed: false },
    dimanche: { open: '', close: '', closed: true },
  },
  certifications: ['RGE QualiPAC', 'Qualibat', 'Artisan de confiance'],
  yearsExperience: 15,
  website: 'www.dupont-plomberie.fr',
  socialMedia: {
    facebook: 'dupont.plomberie',
    instagram: 'dupont_plomberie',
  },
  responseTime: '1h',
  verified: true,
  rating: 4.8,
  reviewCount: 47,
}

export default function ProProfilePage() {
  const [profile, setProfile] = useState(mockProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'hours' | 'certifications'>('info')
  const [newService, setNewService] = useState('')

  const handleAddService = () => {
    if (newService.trim() && !profile.services.includes(newService.trim())) {
      setProfile({
        ...profile,
        services: [...profile.services, newService.trim()],
      })
      setNewService('')
    }
  }

  const handleRemoveService = (service: string) => {
    setProfile({
      ...profile,
      services: profile.services.filter((s) => s !== service),
    })
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-500">
            Gérez les informations de votre profil professionnel
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
            <Eye className="w-5 h-5" />
            Voir mon profil public
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              isEditing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            ) : (
              <>
                <Edit3 className="w-5 h-5" />
                Modifier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          {isEditing && (
            <button className="absolute right-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <Camera className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <User className="w-12 h-12 text-slate-400" />
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
              {profile.verified && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Name & Stats */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.businessName}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{profile.rating}</span>
                    <span className="text-yellow-600">({profile.reviewCount})</span>
                  </div>
                  {profile.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <Shield className="w-3 h-3" />
                      Vérifié
                    </span>
                  )}
                </div>
              </div>
              <p className="text-slate-500 mt-1">
                {profile.name} • {profile.yearsExperience} ans d'expérience
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {profile.services.length}
                </div>
                <div className="text-xs text-slate-500">Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {profile.responseTime}
                </div>
                <div className="text-xs text-slate-500">Réponse</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'info', label: 'Informations', icon: User },
          { key: 'services', label: 'Services', icon: Briefcase },
          { key: 'hours', label: 'Horaires', icon: Clock },
          { key: 'certifications', label: 'Certifications', icon: Award },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) =>
                    setProfile({ ...profile, businessName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom du responsable
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={profile.postalCode}
                  onChange={(e) =>
                    setProfile({ ...profile, postalCode: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={profile.description}
                onChange={(e) =>
                  setProfile({ ...profile, description: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
              />
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.services.map((service) => (
                <span
                  key={service}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg"
                >
                  {service}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveService(service)}
                      className="hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
                  placeholder="Ajouter un service..."
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddService}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-3">
            {Object.entries(profile.workingHours).map(([day, hours]) => (
              <div
                key={day}
                className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
              >
                <span className="w-24 font-medium text-slate-700 capitalize">
                  {day}
                </span>
                {hours.closed ? (
                  <span className="text-slate-500">Fermé</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hours.open}
                      disabled={!isEditing}
                      className="px-3 py-2 bg-white rounded-lg border border-slate-200 disabled:opacity-60"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="time"
                      value={hours.close}
                      disabled={!isEditing}
                      className="px-3 py-2 bg-white rounded-lg border border-slate-200 disabled:opacity-60"
                    />
                  </div>
                )}
                {isEditing && (
                  <label className="flex items-center gap-2 ml-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-sm text-slate-600">Fermé</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <Award className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-green-800">{cert}</span>
                  {isEditing && (
                    <button className="ml-auto text-green-600 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                  <Plus className="w-5 h-5" />
                  Ajouter une certification
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
