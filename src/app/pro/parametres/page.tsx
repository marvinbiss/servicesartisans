'use client'

import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Smartphone,
  Mail,
  Key,
  Trash2,
  Download,
  Moon,
  Sun,
} from 'lucide-react'

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'new_lead',
    label: 'Nouveaux leads',
    description: 'Recevez une notification pour chaque nouvelle demande',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'new_booking',
    label: 'Nouvelles réservations',
    description: 'Soyez notifié des réservations confirmées',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'new_message',
    label: 'Nouveaux messages',
    description: 'Notification à chaque nouveau message client',
    email: false,
    push: true,
    sms: false,
  },
  {
    id: 'new_review',
    label: 'Nouveaux avis',
    description: 'Soyez alerté quand un client laisse un avis',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'reminders',
    label: 'Rappels',
    description: 'Rappels de rendez-vous à venir',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'marketing',
    label: 'Actualités et conseils',
    description: 'Conseils pour développer votre activité',
    email: true,
    push: false,
    sms: false,
  },
]

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences'

export default function ProParametresPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [notifications, setNotifications] = useState(notificationSettings)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState('fr')
  const [timezone, setTimezone] = useState('Europe/Paris')

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'preferences', label: 'Préférences', icon: Globe },
  ]

  const toggleNotification = (id: string, channel: 'email' | 'push' | 'sms') => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, [channel]: !n[channel] } : n
      )
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500">Gérez vos préférences et votre compte</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Informations du profil</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Changer la photo
                    </button>
                    <p className="text-sm text-slate-500 mt-1">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      defaultValue="Jean"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                    <input
                      type="text"
                      defaultValue="Dupont"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="jean.dupont@email.com"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      defaultValue="06 12 34 56 78"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Notifications</h2>
              <div className="space-y-6">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 text-sm text-slate-500 font-medium border-b border-slate-200 pb-4">
                  <div className="col-span-1">Type</div>
                  <div className="text-center">
                    <Mail className="w-4 h-4 mx-auto mb-1" />
                    Email
                  </div>
                  <div className="text-center">
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    Push
                  </div>
                  <div className="text-center">
                    <Bell className="w-4 h-4 mx-auto mb-1" />
                    SMS
                  </div>
                </div>

                {/* Settings */}
                {notifications.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="font-medium text-slate-900">{setting.label}</div>
                      <div className="text-sm text-slate-500">{setting.description}</div>
                    </div>
                    {(['email', 'push', 'sms'] as const).map((channel) => (
                      <div key={channel} className="flex justify-center">
                        <button
                          onClick={() => toggleNotification(setting.id, channel)}
                          className={`w-10 h-6 rounded-full transition-colors ${
                            setting[channel] ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              setting[channel] ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Mot de passe</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="pt-4">
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                      Mettre à jour
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Authentification à deux facteurs</h2>
                <p className="text-slate-500 mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  <Key className="w-5 h-5" />
                  Activer 2FA
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4">Zone de danger</h2>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors">
                  <Trash2 className="w-5 h-5" />
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Moyen de paiement</h2>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">•••• •••• •••• 4242</div>
                    <div className="text-sm text-slate-500">Expire 12/25</div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Modifier</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Historique des factures</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Voir tout
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { date: '1 janv. 2024', amount: '49€', status: 'Payé' },
                    { date: '1 déc. 2023', amount: '49€', status: 'Payé' },
                    { date: '1 nov. 2023', amount: '49€', status: 'Payé' },
                  ].map((invoice, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <div className="font-medium text-slate-900">Facture - {invoice.date}</div>
                        <div className="text-sm text-slate-500">{invoice.amount}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-green-600">{invoice.status}</span>
                        <button className="p-2 hover:bg-slate-200 rounded-lg">
                          <Download className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Préférences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Langue</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fuseau horaire</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Thème</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'light', label: 'Clair', icon: Sun },
                      { id: 'dark', label: 'Sombre', icon: Moon },
                      { id: 'system', label: 'Système', icon: Smartphone },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as typeof theme)}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          theme === t.id
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <t.icon className="w-5 h-5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
