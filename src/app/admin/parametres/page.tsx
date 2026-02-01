'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Users,
  Mail,
  Bell,
  Shield,
  Globe,
  Save,
  AlertTriangle,
} from 'lucide-react'

export default function AdminParametresPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    siteName: 'Services Artisans',
    contactEmail: 'contact@servicesartisans.fr',
    supportEmail: 'support@servicesartisans.fr',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      // Simulated save
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Paramètres enregistrés')
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    {
      title: 'Général',
      icon: Globe,
      fields: [
        {
          label: 'Nom du site',
          key: 'siteName',
          type: 'text',
          description: 'Le nom affiché sur le site',
        },
        {
          label: 'Email de contact',
          key: 'contactEmail',
          type: 'email',
          description: 'Email principal de contact',
        },
        {
          label: 'Email support',
          key: 'supportEmail',
          type: 'email',
          description: 'Email pour le support client',
        },
      ],
    },
    {
      title: 'Inscriptions',
      icon: Users,
      fields: [
        {
          label: 'Inscriptions activées',
          key: 'registrationEnabled',
          type: 'toggle',
          description: 'Permettre aux nouveaux utilisateurs de s\'inscrire',
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      fields: [
        {
          label: 'Notifications email',
          key: 'emailNotifications',
          type: 'toggle',
          description: 'Envoyer des notifications par email',
        },
        {
          label: 'Notifications SMS',
          key: 'smsNotifications',
          type: 'toggle',
          description: 'Envoyer des notifications par SMS (nécessite Twilio)',
        },
      ],
    },
    {
      title: 'Maintenance',
      icon: AlertTriangle,
      fields: [
        {
          label: 'Mode maintenance',
          key: 'maintenanceMode',
          type: 'toggle',
          description: 'Activer le mode maintenance (site inaccessible aux utilisateurs)',
          warning: true,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-500 mt-1">Configuration de la plateforme</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/parametres/admins')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Administrateurs</p>
              <p className="text-sm text-gray-500">Gérer les rôles admin</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/parametres/emails')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Templates Email</p>
              <p className="text-sm text-gray-500">Personnaliser les emails</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/audit')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left"
          >
            <div className="p-2 bg-violet-100 rounded-lg">
              <Settings className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Logs d&apos;audit</p>
              <p className="text-sm text-gray-500">Historique des actions</p>
            </div>
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                </div>
                <div className="p-6 space-y-6">
                  {section.fields.map((field) => (
                    <div key={field.key} className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="block font-medium text-gray-900">{field.label}</label>
                        <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                      </div>
                      <div className="ml-4">
                        {field.type === 'toggle' ? (
                          <button
                            onClick={() => setSettings({
                              ...settings,
                              [field.key]: !settings[field.key as keyof typeof settings],
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings[field.key as keyof typeof settings]
                                ? ('warning' in field && field.warning) ? 'bg-red-600' : 'bg-blue-600'
                                : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                settings[field.key as keyof typeof settings] ? 'translate-x-6' : ''
                              }`}
                            />
                          </button>
                        ) : (
                          <input
                            type={field.type}
                            value={settings[field.key as keyof typeof settings] as string}
                            onChange={(e) => setSettings({
                              ...settings,
                              [field.key]: e.target.value,
                            })}
                            className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-900">Zone de danger</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">Réinitialiser les statistiques</p>
                <p className="text-sm text-gray-500 mt-1">
                  Remettre à zéro toutes les statistiques de la plateforme. Cette action est irréversible.
                </p>
              </div>
              <button
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
