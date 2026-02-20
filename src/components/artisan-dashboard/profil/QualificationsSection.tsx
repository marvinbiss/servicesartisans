'use client'

import { Award } from 'lucide-react'
import { SectionCard } from './SectionCard'

interface QualificationsSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

export function QualificationsSection({ provider, onSaved }: QualificationsSectionProps) {
  void provider
  void onSaved

  return (
    <SectionCard
      title="Qualifications"
      icon={Award}
      onSave={() => {}}
      saving={false}
      isDirty={false}
      error={null}
      success={null}
    >
      <p className="text-sm text-gray-500">
        Cette section sera bient&ocirc;t disponible.
      </p>
    </SectionCard>
  )
}
