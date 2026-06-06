'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Loader2,
  Building2,
  Phone,
  MapPin,
  FileText,
  Euro,
  Award,
  Clock,
  Settings2,
  Camera,
  HelpCircle,
} from 'lucide-react'
import { IdentiteSection } from '@/components/artisan-dashboard/profil/IdentiteSection'
import { ContactSection } from '@/components/artisan-dashboard/profil/ContactSection'
import { LocalisationSection } from '@/components/artisan-dashboard/profil/LocalisationSection'
import { PresentationSection } from '@/components/artisan-dashboard/profil/PresentationSection'
import { ServicesTarifsSection } from '@/components/artisan-dashboard/profil/ServicesTarifsSection'
import { QualificationsSection } from '@/components/artisan-dashboard/profil/QualificationsSection'
import { DisponibiliteSection } from '@/components/artisan-dashboard/profil/DisponibiliteSection'
import { PreferencesSection } from '@/components/artisan-dashboard/profil/PreferencesSection'
import { FaqSection } from '@/components/artisan-dashboard/profil/FaqSection'
import { AvatarSection } from '@/components/artisan-dashboard/profil/AvatarSection'

type TabId =
  | 'identite'
  | 'contact'
  | 'localisation'
  | 'presentation'
  | 'services'
  | 'qualifications'
  | 'disponibilite'
  | 'faq'
  | 'preferences'
  | 'avatar'

const TABS = [
  { id: 'identite' as const, label: 'Identité', icon: Building2 },
  { id: 'contact' as const, label: 'Contact', icon: Phone },
  { id: 'localisation' as const, label: 'Localisation', icon: MapPin },
  { id: 'presentation' as const, label: 'Présentation', icon: FileText },
  { id: 'services' as const, label: 'Services & Tarifs', icon: Euro },
  { id: 'qualifications' as const, label: 'Qualifications', icon: Award },
  { id: 'disponibilite' as const, label: 'Disponibilité', icon: Clock },
  { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
  { id: 'preferences' as const, label: 'Préférences', icon: Settings2 },
  { id: 'avatar' as const, label: 'Photo de profil', icon: Camera },
]

export default function ProfilArtisanPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const validTabs = useMemo(() => TABS.map((t) => t.id), [])
  const initialTab =
    tabParam && validTabs.includes(tabParam as TabId) ? (tabParam as TabId) : 'identite'

  const [provider, setProvider] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  useEffect(() => {
    fetch('/api/artisan/provider')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/connexion?redirect=/espace-artisan/profil'
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        if (data.error) throw new Error(data.error)
        setProvider(data.provider)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const handleSaved = (updated: Record<string, unknown>) => {
    setProvider(updated)
  }

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex: number | null = null
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      newIndex = (index + 1) % TABS.length
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      newIndex = (index - 1 + TABS.length) % TABS.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      newIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      newIndex = TABS.length - 1
    }
    if (newIndex !== null) {
      setActiveTab(TABS[newIndex].id)
      const tabEl = document.getElementById(`tab-${TABS[newIndex].id}`)
      tabEl?.focus()
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-charcoal-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  // No provider found
  if (error || !provider) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="font-semibold mb-2">Profil introuvable</h2>
            <p className="text-sm">
              {error || 'Aucun profil artisan associé à votre compte. Contactez le support.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">Mon profil public</h1>
          <p className="text-primary-100">Gérez les informations visibles sur votre page artisan</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tab navigation */}
          <div className="lg:col-span-1">
            <nav
              className="bg-white rounded-xl shadow-sm p-4 space-y-1"
              aria-label="Sections du profil"
              role="tablist"
              aria-orientation="vertical"
            >
              {TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-500 font-medium'
                      : 'text-charcoal-600 hover:bg-sand-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div id="main-content" className="lg:col-span-3">
            <main
              className="w-full"
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {activeTab === 'identite' && (
                <IdentiteSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'contact' && (
                <ContactSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'localisation' && (
                <LocalisationSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'presentation' && (
                <PresentationSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'services' && (
                <ServicesTarifsSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'qualifications' && (
                <QualificationsSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'disponibilite' && (
                <DisponibiliteSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'faq' && <FaqSection provider={provider} onSaved={handleSaved} />}
              {activeTab === 'preferences' && (
                <PreferencesSection provider={provider} onSaved={handleSaved} />
              )}
              {activeTab === 'avatar' && (
                <AvatarSection provider={provider} onSaved={handleSaved} />
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
