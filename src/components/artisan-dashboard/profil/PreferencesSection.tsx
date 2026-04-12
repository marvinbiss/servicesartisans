'use client'

import { Settings2 } from 'lucide-react'
import { SectionCard } from './SectionCard'

interface PreferencesSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

export function PreferencesSection({ provider, onSaved }: PreferencesSectionProps) {
  void provider
  void onSaved

  return (
    <SectionCard
      title="Préférences"
      icon={Settings2}
      onSave={() => {}}
      saving={false}
      isDirty={false}
      error={null}
      success={null}
    >
      <p className="text-sm text-charcoal-500">Cette section sera bientôt disponible.</p>
    </SectionCard>
  )
}
