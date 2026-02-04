'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, ArrowLeft,
  User, Mail, Phone, Lock, Bell, Shield, Trash2, Download,
  Globe, Palette
} from 'lucide-react'
import usePushNotifications from '@/hooks/usePushNotifications'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

interface NotificationPreferences {
  email_booking_confirmation: boolean
  email_booking_reminder: boolean
  email_booking_cancellation: boolean
  email_marketing: boolean
  push_enabled: boolean
  push_booking_updates: boolean
  push_messages: boolean
  push_promotions: boolean
  sms_enabled: boolean
  sms_reminders: boolean
}

interface PrivacyPreferences {
  profile_visible: boolean
  show_reviews: boolean
  allow_messages: boolean
}

interface DisplayPreferences {
  language: string
  theme: 'light' | 'dark' | 'system'
  compact_mode: boolean
}

export default function ParametresClientPage() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
  })

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_booking_confirmation: true,
    email_booking_reminder: true,
    email_booking_cancellation: true,
    email_marketing: false,
    push_enabled: false,
    push_booking_updates: true,
    push_messages: true,
    push_promotions: false,
    sms_enabled: false,
    sms_reminders: false,
  })

  const [privacy, setPrivacy] = useState<PrivacyPreferences>({
    profile_visible: true,
    show_reviews: true,
    allow_messages: true,
  })

  const [display, setDisplay] = useState<DisplayPreferences>({
    language: 'fr',
    theme: 'system',
    compact_mode: false,
  })

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'display' | 'data'>('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deletionStatus, setDeletionStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const pushNotifications = usePushNotifications(userId)

  useEffect(() => {
    loadUserData()
    loadDeletionStatus()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          if (data.preferences.notifications) setNotifications(data.preferences.notifications)
          if (data.preferences.privacy) setPrivacy(data.preferences.privacy)
          if (data.preferences.display) setDisplay(data.preferences.display)
        }
        if (data.userId) setUserId(data.userId)
      }

      // Load profile data
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.profile) {
          setFormData({
            prenom: profileData.profile.first_name || '',
            nom: profileData.profile.last_name || '',
            email: profileData.profile.email || '',
            telephone: profileData.profile.phone || '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDeletionStatus = async () => {
    try {
      const response = await fetch('/api/gdpr/delete')
      if (response.ok) {
        const data = await response.json()
        setDeletionStatus(data.deletionRequest)
      }
    } catch (error) {
      console.error('Failed to load deletion status:', error)
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { notifications, privacy, display },
        }),
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePushToggle = async () => {
    if (notifications.push_enabled) {
      await pushNotifications.unsubscribe()
      setNotifications({ ...notifications, push_enabled: false })
    } else {
      const success = await pushNotifications.subscribe()
      if (success) {
        setNotifications({ ...notifications, push_enabled: true })
      }
    }
  }

  const requestDataExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' }),
      })

      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const requestAccountDeletion = async () => {
    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deleteReason,
          password: deletePassword,
          confirmText: deleteConfirmText,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDeletionStatus(data)
        setShowDeleteModal(false)
        setDeleteConfirmText('')
        setDeletePassword('')
        setDeleteReason('')
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Failed to request deletion:', error)
    }
  }

  const cancelDeletion = async () => {
    try {
      const response = await fetch('/api/gdpr/delete', { method: 'DELETE' })
      if (response.ok) {
        setDeletionStatus(null)
      }
    } catch (error) {
      console.error('Failed to cancel deletion:', error)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialite', icon: Shield },
    { id: 'display', label: 'Affichage', icon: Palette },
    { id: 'data', label: 'Mes donnees', icon: Download },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb
            items={[
              { label: 'Espace Client', href: '/espace-client' },
              { label: 'Paramètres' }
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/espace-client/mes-demandes" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
                <p className="text-gray-600">Gerez vos informations et preferences</p>
              </div>
            </div>
            {saveSuccess && (
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Enregistre
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
              <hr className="my-2" />
              <Link
                href="/espace-client/mes-demandes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5" />
                Mes demandes
              </Link>
              <LogoutButton />
            </nav>
            <QuickSiteLinks />
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informations personnelles
                      </h2>
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Prenom
                            </label>
                            <input
                              type="text"
                              value={formData.prenom}
                              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nom
                            </label>
                            <input
                              type="text"
                              value={formData.nom}
                              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
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
                            <Phone className="w-4 h-4 inline mr-2" />
                            Telephone
                          </label>
                          <input
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                      </form>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Mot de passe
                      </h2>
                      <form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="********"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nouveau mot de passe
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="********"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirmer le mot de passe
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="********"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Modifier le mot de passe
                        </button>
                      </form>
                    </div>
                  </>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Notifications par email
                      </h2>
                      <div className="space-y-4">
                        <ToggleSetting
                          label="Confirmation de reservation"
                          description="Recevez un email de confirmation pour chaque reservation"
                          checked={notifications.email_booking_confirmation}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, email_booking_confirmation: checked })
                          }
                        />
                        <ToggleSetting
                          label="Rappels de rendez-vous"
                          description="Rappel 24h avant votre rendez-vous"
                          checked={notifications.email_booking_reminder}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, email_booking_reminder: checked })
                          }
                        />
                        <ToggleSetting
                          label="Annulations"
                          description="Notifications en cas d'annulation"
                          checked={notifications.email_booking_cancellation}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, email_booking_cancellation: checked })
                          }
                        />
                        <ToggleSetting
                          label="Offres et actualites"
                          description="Promotions et nouveautes des artisans"
                          checked={notifications.email_marketing}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, email_marketing: checked })
                          }
                        />
                      </div>
                    </div>

                    <hr />

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Notifications push
                      </h2>
                      {!pushNotifications.isSupported ? (
                        <p className="text-sm text-gray-500">
                          Les notifications push ne sont pas supportees par votre navigateur.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          <ToggleSetting
                            label="Activer les notifications push"
                            description="Recevez des notifications en temps reel"
                            checked={notifications.push_enabled}
                            onChange={handlePushToggle}
                            loading={pushNotifications.isLoading}
                          />
                          {notifications.push_enabled && (
                            <>
                              <ToggleSetting
                                label="Mises a jour de reservation"
                                description="Confirmations, modifications et rappels"
                                checked={notifications.push_booking_updates}
                                onChange={(checked) =>
                                  setNotifications({ ...notifications, push_booking_updates: checked })
                                }
                              />
                              <ToggleSetting
                                label="Messages"
                                description="Nouveaux messages des artisans"
                                checked={notifications.push_messages}
                                onChange={(checked) =>
                                  setNotifications({ ...notifications, push_messages: checked })
                                }
                              />
                              <ToggleSetting
                                label="Promotions"
                                description="Offres speciales et reductions"
                                checked={notifications.push_promotions}
                                onChange={(checked) =>
                                  setNotifications({ ...notifications, push_promotions: checked })
                                }
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <hr />

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Notifications SMS
                      </h2>
                      <div className="space-y-4">
                        <ToggleSetting
                          label="Activer les SMS"
                          description="Recevez des rappels par SMS"
                          checked={notifications.sms_enabled}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, sms_enabled: checked })
                          }
                        />
                        {notifications.sms_enabled && (
                          <ToggleSetting
                            label="Rappels de rendez-vous"
                            description="SMS de rappel 2h avant le rendez-vous"
                            checked={notifications.sms_reminders}
                            onChange={(checked) =>
                              setNotifications({ ...notifications, sms_reminders: checked })
                            }
                          />
                        )}
                      </div>
                    </div>

                    <button
                      onClick={savePreferences}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Parametres de confidentialite
                    </h2>
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Profil visible"
                        description="Les artisans peuvent voir votre profil"
                        checked={privacy.profile_visible}
                        onChange={(checked) =>
                          setPrivacy({ ...privacy, profile_visible: checked })
                        }
                      />
                      <ToggleSetting
                        label="Afficher mes avis"
                        description="Vos avis sont visibles publiquement"
                        checked={privacy.show_reviews}
                        onChange={(checked) =>
                          setPrivacy({ ...privacy, show_reviews: checked })
                        }
                      />
                      <ToggleSetting
                        label="Autoriser les messages"
                        description="Les artisans peuvent vous envoyer des messages"
                        checked={privacy.allow_messages}
                        onChange={(checked) =>
                          setPrivacy({ ...privacy, allow_messages: checked })
                        }
                      />
                    </div>

                    <button
                      onClick={savePreferences}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}

                {/* Display Tab */}
                {activeTab === 'display' && (
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Preferences d'affichage
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Langue
                      </label>
                      <select
                        value={display.language}
                        onChange={(e) =>
                          setDisplay({ ...display, language: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fr">Francais</option>
                        <option value="en">English</option>
                        <option value="es">Espanol</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['light', 'dark', 'system'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setDisplay({ ...display, theme })}
                            className={`rounded-lg border-2 p-4 text-center transition-all ${
                              display.theme === theme
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">
                              {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
                            </div>
                            <div className="text-sm font-medium">
                              {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Systeme'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <ToggleSetting
                      label="Mode compact"
                      description="Affichage plus condense des listes"
                      checked={display.compact_mode}
                      onChange={(checked) =>
                        setDisplay({ ...display, compact_mode: checked })
                      }
                    />

                    <button
                      onClick={savePreferences}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}

                {/* Data Tab (GDPR) */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exporter mes donnees
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Telechargez une copie de toutes vos donnees personnelles conformement au RGPD.
                        Le fichier contient votre profil, vos reservations, avis et messages.
                      </p>
                      <button
                        onClick={requestDataExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isExporting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Export en cours...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Telecharger mes donnees
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
                      <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Supprimer mon compte
                      </h2>
                      <p className="text-gray-600 mb-4">
                        La suppression de votre compte est irreversible. Toutes vos donnees seront
                        definitivement effacees apres un delai de 30 jours, pendant lequel vous
                        pouvez annuler votre demande.
                      </p>

                      {deletionStatus?.status === 'scheduled' ? (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                          <p className="text-sm text-red-700 mb-3">
                            Votre compte est programme pour suppression le{' '}
                            <strong>
                              {new Date(deletionStatus.scheduled_deletion_at).toLocaleDateString('fr-FR')}
                            </strong>.
                          </p>
                          <button
                            onClick={cancelDeletion}
                            className="rounded-lg bg-white border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            Annuler la suppression
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-2 text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer mon compte
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer votre compte
            </h2>
            <p className="text-gray-600 mb-6">
              Cette action est irreversible. Votre compte sera supprime dans 30 jours,
              vous pouvez annuler pendant cette periode.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pourquoi nous quittez-vous ? (optionnel)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  rows={2}
                  placeholder="Votre retour nous aide a nous ameliorer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Votre mot de passe
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="********"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tapez <strong>SUPPRIMER MON COMPTE</strong> pour confirmer
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={requestAccountDeletion}
                disabled={deleteConfirmText !== 'SUPPRIMER MON COMPTE' || !deletePassword}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  checked,
  onChange,
  loading,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  loading?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={loading}
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-disabled:opacity-50"></div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </label>
    </div>
  )
}
