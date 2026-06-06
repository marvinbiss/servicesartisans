'use client'

import { Clock } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { useProviderForm } from './useProviderForm'
import { OpeningHoursEditor, DEFAULT_OPENING_HOURS } from '../OpeningHoursEditor'
import { AvailabilityManager } from '../AvailabilityManager'

interface DisponibiliteSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

interface OpeningHoursValue {
  lundi: { ouvert: boolean; debut: string; fin: string }
  mardi: { ouvert: boolean; debut: string; fin: string }
  mercredi: { ouvert: boolean; debut: string; fin: string }
  jeudi: { ouvert: boolean; debut: string; fin: string }
  vendredi: { ouvert: boolean; debut: string; fin: string }
  samedi: { ouvert: boolean; debut: string; fin: string }
  dimanche: { ouvert: boolean; debut: string; fin: string }
}

const FIELDS = ['opening_hours', 'available_24h', 'accepts_new_clients'] as const

export function DisponibiliteSection({ provider, onSaved }: DisponibiliteSectionProps) {
  const { formData, setField, isDirty, saving, error, success, handleSave } = useProviderForm(
    provider,
    FIELDS
  )

  const onSave = async () => {
    const updated = await handleSave()
    if (updated) onSaved(updated)
  }

  // opening_hours a un DEFAUT '{}'::jsonb en DB : un objet vide (ou partiel)
  // est truthy mais l'éditeur lit chaque jour (.ouvert) — merger jour par jour
  // sur les défauts évite le crash.
  const rawHours = formData.opening_hours as Partial<OpeningHoursValue> | null | undefined
  const hasStoredHours =
    rawHours != null && typeof rawHours === 'object' && Object.keys(rawHours).length > 0
  const isUsingDefaults = !hasStoredHours
  const openingHours = Object.fromEntries(
    Object.entries(DEFAULT_OPENING_HOURS).map(([day, fallback]) => [
      day,
      rawHours?.[day as keyof OpeningHoursValue] ?? fallback,
    ])
  ) as OpeningHoursValue
  const available24h = Boolean(formData.available_24h)
  const acceptsNewClients = formData.accepts_new_clients !== false

  return (
    <SectionCard
      title="Disponibilité"
      icon={Clock}
      onSave={onSave}
      saving={saving}
      isDirty={isDirty}
      error={error}
      success={success}
    >
      <div className="space-y-8">
        {/* Opening hours editor */}
        <OpeningHoursEditor
          value={openingHours}
          onChange={(val) => setField('opening_hours', val)}
          showDefaultsHint={isUsingDefaults && !isDirty}
        />

        {/* Toggle switches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="dispo-24h" className="text-sm font-medium text-charcoal-700">
              Disponible 24h/24
            </label>
            <button
              id="dispo-24h"
              type="button"
              role="switch"
              aria-checked={available24h}
              onClick={() => setField('available_24h', !available24h)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                available24h ? 'bg-primary-500' : 'bg-sand-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  available24h ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="dispo-new-clients" className="text-sm font-medium text-charcoal-700">
              Accepte de nouveaux clients
            </label>
            <button
              id="dispo-new-clients"
              type="button"
              role="switch"
              aria-checked={acceptsNewClients}
              onClick={() => setField('accepts_new_clients', !acceptsNewClients)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                acceptsNewClients ? 'bg-primary-500' : 'bg-sand-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  acceptsNewClients ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-sand-300 pt-6">
          <AvailabilityManager />
        </div>
      </div>
    </SectionCard>
  )
}
