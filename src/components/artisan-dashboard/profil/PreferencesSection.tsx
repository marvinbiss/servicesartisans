'use client'

import { Settings2 } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { TagListField } from './TagListField'
import { useProviderForm } from './useProviderForm'

interface PreferencesSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

const FIELDS = ['languages', 'emergency_available'] as const

const LANGUAGE_SUGGESTIONS = ['Français', 'Anglais', 'Espagnol', 'Portugais', 'Arabe', 'Italien']

export function PreferencesSection({ provider, onSaved }: PreferencesSectionProps) {
  const { formData, setField, isDirty, saving, error, success, handleSave } = useProviderForm(
    provider,
    FIELDS
  )

  const onSave = async () => {
    const updated = await handleSave()
    if (updated) onSaved(updated)
  }

  const languages = (formData.languages as string[]) || []
  const emergencyAvailable = formData.emergency_available === true

  return (
    <SectionCard
      title="Préférences"
      icon={Settings2}
      onSave={onSave}
      saving={saving}
      isDirty={isDirty}
      error={error}
      success={success}
    >
      <div className="space-y-8">
        <TagListField
          id="prefs-languages"
          label="Langues parlées"
          values={languages}
          max={10}
          maxLength={50}
          placeholder="Ex: Anglais"
          suggestions={LANGUAGE_SUGGESTIONS}
          onChange={(values) => setField('languages', values)}
        />
        <div className="flex items-center justify-between">
          <div>
            <label
              htmlFor="prefs-emergency"
              className="text-sm font-medium text-charcoal-700 block"
            >
              Interventions d&apos;urgence
            </label>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Vous acceptez les demandes urgentes (dépannage rapide).
            </p>
          </div>
          <button
            id="prefs-emergency"
            type="button"
            role="switch"
            aria-checked={emergencyAvailable}
            onClick={() => setField('emergency_available', !emergencyAvailable)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emergencyAvailable ? 'bg-primary-500' : 'bg-sand-400'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emergencyAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </SectionCard>
  )
}
