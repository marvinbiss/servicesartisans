'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Trash2,
  Download,
} from 'lucide-react'
import usePushNotifications from '@/hooks/usePushNotifications'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'
import { logger } from '@/lib/logger'

interface NotificationPreferences {
  email_booking_confirmation: boolean
  email_booking_reminder: boolean
  email_marketing: boolean
  email_newsletter: boolean
  push_enabled: boolean
  push_booking_updates: boolean
  push_messages: boolean
  push_promotions: boolean
  sms_booking_reminder: boolean
  sms_marketing: boolean
}

interface PrivacyPreferences {
  profile_public: boolean
  show_online_status: boolean
  allow_reviews: boolean
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
    email_marketing: false,
    email_newsletter: false,
    push_enabled: false,
    push_booking_updates: true,
    push_messages: true,
    push_promotions: false,
    sms_booking_reminder: false,
    sms_marketing: false,
  })

  const [privacy, setPrivacy] = useState<PrivacyPreferences>({
    profile_public: true,
    show_online_status: true,
    allow_reviews: true,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const passwordSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'data'>(
    'profile'
  )
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deletionStatus, setDeletionStatus] = useState<{
    status: string
    scheduled_deletion_at?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushNotifications = usePushNotifications(userId)

  useEffect(() => {
    loadUserData()
    loadDeletionStatus()
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
      if (passwordSuccessTimerRef.current) clearTimeout(passwordSuccessTimerRef.current)
    }
  }, [])

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.userId) setUserId(data.userId)
        if (data.preferences) {
          const p = data.preferences
          setNotifications({
            email_booking_confirmation: p.email_booking_confirmation ?? true,
            email_booking_reminder: p.email_booking_reminder ?? true,
            email_marketing: p.email_marketing ?? false,
            email_newsletter: p.email_newsletter ?? false,
            push_enabled: p.push_enabled ?? false,
            push_booking_updates: p.push_booking_updates ?? true,
            push_messages: p.push_messages ?? true,
            push_promotions: p.push_promotions ?? false,
            sms_booking_reminder: p.sms_booking_reminder ?? false,
            sms_marketing: p.sms_marketing ?? false,
          })
          setPrivacy({
            profile_public: p.profile_public ?? true,
            show_online_status: p.show_online_status ?? true,
            allow_reviews: p.allow_reviews ?? true,
          })
        }
      }

      // Load profile data
      const profileResponse = await fetch('/api/client/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.profile) {
          const nameParts = (profileData.profile.full_name || '').split(' ')
          const prenom = nameParts[0] || ''
          const nom = nameParts.slice(1).join(' ')
          setFormData((prev) => ({
            ...prev,
            prenom,
            nom,
            email: profileData.profile.email || '',
            telephone: profileData.profile.phone_e164 || '',
          }))
        }
      }
    } catch (error) {
      logger.error('Failed to load user data', error)
      setErrorMessage('Impossible de charger vos données. Veuillez rafraîchir la page.')
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
      logger.error('Failed to load deletion status', error)
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications, privacy }),
      })

      if (response.ok) {
        setSaveSuccess(true)
        setErrorMessage(null)
        if (successTimerRef.current) clearTimeout(successTimerRef.current)
        successTimerRef.current = setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setErrorMessage("Impossible d'enregistrer les préférences. Veuillez réessayer.")
      }
    } catch (error) {
      logger.error('Failed to save preferences', error)
      setErrorMessage('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: [formData.prenom, formData.nom].filter(Boolean).join(' ').trim() || undefined,
          phone: formData.telephone?.replace(/[\s.\-()]/g, '') || undefined,
        }),
      })

      if (response.ok) {
        setSaveSuccess(true)
        setErrorMessage(null)
        if (successTimerRef.current) clearTimeout(successTimerRef.current)
        successTimerRef.current = setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setErrorMessage('Impossible de mettre à jour le profil. Veuillez réessayer.')
      }
    } catch (error) {
      logger.error('Failed to update profile', error)
      setErrorMessage('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!passwordData.currentPassword) {
      setPasswordError('Veuillez entrer votre mot de passe actuel.')
      return
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.')
      return
    }

    setPasswordSaving(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        setPasswordError('Le mot de passe actuel est incorrect.')
        setPasswordSaving(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        setPasswordError(
          error.message || 'Impossible de modifier le mot de passe. Veuillez réessayer.'
        )
      } else {
        setPasswordSuccess(true)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        if (passwordSuccessTimerRef.current) clearTimeout(passwordSuccessTimerRef.current)
        passwordSuccessTimerRef.current = setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch (error) {
      logger.error('Failed to update password', error)
      setPasswordError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setPasswordSaving(false)
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
      logger.error('Failed to export data', error)
      setErrorMessage("Impossible d'exporter vos données. Veuillez réessayer.")
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
      logger.error('Failed to request deletion', error)
      setErrorMessage('Impossible de soumettre la demande de suppression. Veuillez réessayer.')
    }
  }

  const cancelDeletion = async () => {
    try {
      const response = await fetch('/api/gdpr/delete', { method: 'DELETE' })
      if (response.ok) {
        setDeletionStatus(null)
      }
    } catch (error) {
      logger.error('Failed to cancel deletion', error)
      setErrorMessage("Impossible d'annuler la demande de suppression. Veuillez réessayer.")
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'data', label: 'Mes données', icon: Download },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb
            items={[{ label: 'Espace Client', href: '/espace-client' }, { label: 'Paramètres' }]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/espace-client/mes-demandes"
                className="text-charcoal-600 hover:text-charcoal-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-900">Paramètres</h1>
                <p className="text-charcoal-600">Gérez vos informations et préférences</p>
              </div>
            </div>
            {saveSuccess && (
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Enregistré
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar — horizontal tabs on mobile, vertical on desktop */}
          <div className="lg:col-span-1 space-y-4">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-charcoal-700 hover:bg-sand-50 border border-sand-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Desktop: vertical sidebar */}
            <nav className="hidden lg:block bg-white rounded-xl shadow-sm p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-500 font-medium'
                      : 'text-charcoal-700 hover:bg-sand-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
              <hr className="my-2" />
              <Link
                href="/espace-client/securite/2fa"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-charcoal-700 hover:bg-sand-50"
              >
                <Lock className="w-5 h-5" />
                Sécurité (2FA)
              </Link>
              <Link
                href="/espace-client/mes-demandes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-charcoal-700 hover:bg-sand-50"
              >
                <FileText className="w-5 h-5" />
                Mes demandes
              </Link>
              <LogoutButton />
            </nav>
            <div className="hidden lg:block">
              <QuickSiteLinks />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-500 hover:text-red-700 font-medium ml-4"
                >
                  ✕
                </button>
              </div>
            )}
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
                      <h2 className="text-lg font-semibold text-charcoal-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informations personnelles
                      </h2>
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">
                              Prénom
                            </label>
                            <input
                              type="text"
                              value={formData.prenom}
                              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                              className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">
                              Nom
                            </label>
                            <input
                              type="text"
                              value={formData.nom}
                              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                              className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full px-4 py-3 border border-sand-300 rounded-lg bg-sand-50 text-charcoal-500 cursor-not-allowed"
                          />
                          <p className="mt-1 text-xs text-charcoal-400">
                            Pour modifier votre email, contactez le support.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) =>
                              setFormData({ ...formData, telephone: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                      </form>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-lg font-semibold text-charcoal-900 mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Mot de passe
                      </h2>
                      <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                        {passwordError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                            {passwordError}
                          </div>
                        )}
                        {passwordSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                            Mot de passe modifié avec succès.
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-charcoal-700 mb-2">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400"
                            placeholder="********"
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">
                              Nouveau mot de passe
                            </label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                              }
                              className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400"
                              placeholder="********"
                              minLength={8}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">
                              Confirmer le mot de passe
                            </label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400"
                              placeholder="********"
                              minLength={8}
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={passwordSaving}
                          className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {passwordSaving ? 'Modification en cours...' : 'Modifier le mot de passe'}
                        </button>
                      </form>
                    </div>
                  </>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal-900 mb-4">
                        Notifications par email
                      </h2>
                      <div className="space-y-4">
                        <ToggleSetting
                          label="Confirmation de réservation"
                          description="Recevez un email de confirmation pour chaque réservation"
                          checked={notifications.email_booking_confirmation}
                          onChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              email_booking_confirmation: checked,
                            })
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
                          label="Offres et actualités"
                          description="Promotions et nouveautés des artisans"
                          checked={notifications.email_marketing}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, email_marketing: checked })
                          }
                        />
                        <ToggleSetting
                          label="Newsletter"
                          description="Recevez notre newsletter mensuelle"
                          checked={notifications.email_newsletter}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, email_newsletter: checked })
                          }
                        />
                      </div>
                    </div>

                    <hr />

                    <div>
                      <h2 className="text-lg font-semibold text-charcoal-900 mb-4">
                        Notifications push
                      </h2>
                      {!pushNotifications.isSupported ? (
                        <p className="text-sm text-charcoal-500">
                          Les notifications push ne sont pas supportées par votre navigateur.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          <ToggleSetting
                            label="Activer les notifications push"
                            description="Recevez des notifications en temps réel"
                            checked={notifications.push_enabled}
                            onChange={handlePushToggle}
                            loading={pushNotifications.isLoading}
                          />
                          {notifications.push_enabled && (
                            <>
                              <ToggleSetting
                                label="Mises à jour de réservation"
                                description="Confirmations, modifications et rappels"
                                checked={notifications.push_booking_updates}
                                onChange={(checked) =>
                                  setNotifications({
                                    ...notifications,
                                    push_booking_updates: checked,
                                  })
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
                                description="Offres spéciales et réductions"
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
                      <h2 className="text-lg font-semibold text-charcoal-900 mb-4">
                        Notifications SMS
                      </h2>
                      <div className="space-y-4">
                        <ToggleSetting
                          label="Rappels de rendez-vous"
                          description="SMS de rappel 2h avant le rendez-vous"
                          checked={notifications.sms_booking_reminder}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, sms_booking_reminder: checked })
                          }
                        />
                        <ToggleSetting
                          label="Offres par SMS"
                          description="Promotions et offres spéciales par SMS"
                          checked={notifications.sms_marketing}
                          onChange={(checked) =>
                            setNotifications({ ...notifications, sms_marketing: checked })
                          }
                        />
                      </div>
                    </div>

                    <button
                      onClick={savePreferences}
                      disabled={isSaving}
                      className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-4">
                      Paramètres de confidentialité
                    </h2>
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Profil public"
                        description="Les artisans peuvent voir votre profil"
                        checked={privacy.profile_public}
                        onChange={(checked) => setPrivacy({ ...privacy, profile_public: checked })}
                      />
                      <ToggleSetting
                        label="Statut en ligne visible"
                        description="Les artisans peuvent voir si vous êtes en ligne"
                        checked={privacy.show_online_status}
                        onChange={(checked) =>
                          setPrivacy({ ...privacy, show_online_status: checked })
                        }
                      />
                      <ToggleSetting
                        label="Autoriser les avis"
                        description="Les artisans peuvent déposer des avis sur vous"
                        checked={privacy.allow_reviews}
                        onChange={(checked) => setPrivacy({ ...privacy, allow_reviews: checked })}
                      />
                    </div>

                    <button
                      onClick={savePreferences}
                      disabled={isSaving}
                      className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}

                {/* Data Tab (GDPR) */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-lg font-semibold text-charcoal-900 mb-2 flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exporter mes données
                      </h2>
                      <p className="text-charcoal-600 mb-4">
                        Téléchargez une copie de toutes vos données personnelles conformément au
                        RGPD. Le fichier contient votre profil, vos réservations, avis et messages.
                      </p>
                      <button
                        onClick={requestDataExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                      >
                        {isExporting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Export en cours...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Télécharger mes données
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
                      <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Supprimer mon compte
                      </h2>
                      <p className="text-charcoal-600 mb-4">
                        La suppression de votre compte est irréversible. Toutes vos données seront
                        définitivement effacées après un délai de 30 jours, pendant lequel vous
                        pouvez annuler votre demande.
                      </p>

                      {deletionStatus?.status === 'scheduled' ? (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                          <p className="text-sm text-red-700 mb-3">
                            Votre compte est programmé pour suppression le{' '}
                            <strong>
                              {new Date(
                                deletionStatus.scheduled_deletion_at ?? ''
                              ).toLocaleDateString('fr-FR')}
                            </strong>
                            .
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
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Supprimer votre compte</h2>
            <p className="text-charcoal-600 mb-6">
              Cette action est irréversible. Votre compte sera supprimé dans 30 jours, vous pouvez
              annuler pendant cette période.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Pourquoi nous quittez-vous ? (optionnel)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full rounded-lg border border-sand-400 px-4 py-2"
                  rows={2}
                  placeholder="Votre retour nous aide à nous améliorer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Votre mot de passe
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-lg border border-sand-400 px-4 py-2"
                  placeholder="********"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Tapez <strong>SUPPRIMER MON COMPTE</strong> pour confirmer
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full rounded-lg border border-sand-400 px-4 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-sand-400 rounded-lg font-medium hover:bg-sand-50 transition-colors"
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
    <div className="flex items-center justify-between p-4 border border-sand-300 rounded-lg">
      <div>
        <div className="font-medium text-charcoal-900">{label}</div>
        <div className="text-sm text-charcoal-500">{description}</div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={loading}
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-sand-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:trancharcoal-x-full peer-disabled:opacity-50"></div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
          </div>
        )}
      </label>
    </div>
  )
}
