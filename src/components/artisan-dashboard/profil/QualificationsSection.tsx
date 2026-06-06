'use client'

import { Award } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { TagListField } from './TagListField'
import { useProviderForm } from './useProviderForm'

interface QualificationsSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

const FIELDS = ['certifications', 'insurance'] as const

const INSURANCE_SUGGESTIONS = [
  'Garantie décennale',
  'Responsabilité civile professionnelle',
  'Garantie biennale',
]

export function QualificationsSection({ provider, onSaved }: QualificationsSectionProps) {
  const { formData, setField, isDirty, saving, error, success, handleSave } = useProviderForm(
    provider,
    FIELDS
  )

  const onSave = async () => {
    const updated = await handleSave()
    if (updated) onSaved(updated)
  }

  const certifications = (formData.certifications as string[]) || []
  const insurance = (formData.insurance as string[]) || []

  return (
    <SectionCard
      title="Qualifications"
      icon={Award}
      onSave={onSave}
      saving={saving}
      isDirty={isDirty}
      error={error}
      success={success}
    >
      <div className="space-y-8">
        <TagListField
          id="qualif-certifications"
          label="Certifications & labels"
          values={certifications}
          max={20}
          placeholder="Ex: Qualibat 5911, CIP Plomberie"
          helpText="Vos certifications RGE officielles (registre ADEME) sont affichées automatiquement et n'ont pas besoin d'être ressaisies ici."
          onChange={(values) => setField('certifications', values)}
        />
        <TagListField
          id="qualif-insurance"
          label="Assurances"
          values={insurance}
          max={10}
          placeholder="Ex: Garantie décennale"
          suggestions={INSURANCE_SUGGESTIONS}
          helpText="Affichées sur votre fiche publique dans le bloc « Garanties & informations pratiques »."
          onChange={(values) => setField('insurance', values)}
        />
      </div>
    </SectionCard>
  )
}
