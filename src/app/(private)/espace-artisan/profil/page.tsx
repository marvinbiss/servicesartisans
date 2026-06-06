'use client'

/**
 * « Ma fiche » — éditeur de la fiche publique (refonte 2026-06-06).
 * Les 10 anciens onglets sont regroupés en 2 groupes (Identité & contact,
 * Activité & présentation) + 2 onglets absorbés : Portfolio (ex-page
 * /portfolio) et Avis (ex-page /avis-recus). Les anciens ?tab= (identite,
 * contact, avatar, …) restent valides via TAB_ALIASES — ProfileCompleteness
 * et les anciens deep-links continuent de fonctionner.
 */

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Contact, FileText, Camera, Star } from 'lucide-react'
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
import { PortfolioTab } from '@/components/artisan-dashboard/profil/PortfolioTab'
import { AvisTab } from '@/components/artisan-dashboard/profil/AvisTab'

type TabId = 'identite' | 'activite' | 'portfolio' | 'avis'

const TABS = [
  { id: 'identite' as const, label: 'Identité & contact', icon: Contact },
  { id: 'activite' as const, label: 'Activité & présentation', icon: FileText },
  { id: 'portfolio' as const, label: 'Portfolio', icon: Camera },
  { id: 'avis' as const, label: 'Avis', icon: Star },
]

// Anciens ?tab= (10 sections pré-refonte) → nouveau groupe. Les deep-links de
// ProfileCompleteness (?tab=avatar, ?tab=presentation, …) restent valides.
const TAB_ALIASES: Record<string, TabId> = {
  identite: 'identite',
  contact: 'identite',
  localisation: 'identite',
  avatar: 'identite',
  presentation: 'activite',
  services: 'activite',
  qualifications: 'activite',
  disponibilite: 'activite',
  faq: 'activite',
  preferences: 'activite',
  activite: 'activite',
  portfolio: 'portfolio',
  avis: 'avis',
}

function resolveTab(param: string | null): TabId {
  return (param && TAB_ALIASES[param]) || 'identite'
}

export default function ProfilArtisanPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [provider, setProvider] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>(() => resolveTab(tabParam))

  // Navigation client-side vers /profil?tab=… alors qu'on est déjà sur la page
  // (ex. redirect de /portfolio) : resynchroniser l'onglet actif.
  useEffect(() => {
    setActiveTab(resolveTab(tabParam))
  }, [tabParam])

  const selectTab = (id: TabId) => {
    setActiveTab(id)
    window.history.replaceState(null, '', `/espace-artisan/profil?tab=${id}`)
  }

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
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      newIndex = (index + 1) % TABS.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
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
      selectTab(TABS[newIndex].id)
      document.getElementById(`tab-${TABS[newIndex].id}`)?.focus()
    }
  }

  // Les groupes d'édition dépendent du provider ; Portfolio et Avis sont
  // autonomes (self-fetching) et ne doivent pas attendre ce chargement.
  const editorPanel = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-charcoal-600">Chargement du profil...</p>
          </div>
        </div>
      )
    }
    if (error || !provider) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h2 className="font-semibold mb-2">Profil introuvable</h2>
          <p className="text-sm">
            {error || 'Aucun profil artisan associé à votre compte. Contactez le support.'}
          </p>
        </div>
      )
    }
    if (activeTab === 'identite') {
      return (
        <div className="space-y-8">
          <AvatarSection provider={provider} onSaved={handleSaved} />
          <IdentiteSection provider={provider} onSaved={handleSaved} />
          <ContactSection provider={provider} onSaved={handleSaved} />
          <LocalisationSection provider={provider} onSaved={handleSaved} />
        </div>
      )
    }
    return (
      <div className="space-y-8">
        <PresentationSection provider={provider} onSaved={handleSaved} />
        <ServicesTarifsSection provider={provider} onSaved={handleSaved} />
        <QualificationsSection provider={provider} onSaved={handleSaved} />
        <DisponibiliteSection provider={provider} onSaved={handleSaved} />
        <FaqSection provider={provider} onSaved={handleSaved} />
        <PreferencesSection provider={provider} onSaved={handleSaved} />
      </div>
    )
  }, [activeTab, loading, error, provider])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-charcoal-900">Ma fiche</h1>
        <p className="text-charcoal-600">
          Gérez les informations, photos et avis visibles sur votre page publique
        </p>
      </div>

      <nav
        className="flex flex-wrap gap-1 bg-white rounded-xl shadow-sm p-1.5"
        aria-label="Sections de la fiche"
        role="tablist"
        aria-orientation="horizontal"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, index)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
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

      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {(activeTab === 'identite' || activeTab === 'activite') && editorPanel}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'avis' && <AvisTab />}
      </div>
    </div>
  )
}
