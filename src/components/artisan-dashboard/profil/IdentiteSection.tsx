'use client'

import { Building2 } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { useProviderForm } from './useProviderForm'

interface IdentiteSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

const FIELDS = ['name', 'legal_form', 'siret', 'creation_date', 'team_size'] as const

export function IdentiteSection({ provider, onSaved }: IdentiteSectionProps) {
  const { formData, setField, isDirty, saving, error, success, handleSave } = useProviderForm(provider, FIELDS)

  const isVerified = Boolean(provider.is_verified)

  const onSave = async () => {
    const updated = await handleSave()
    if (updated) onSaved(updated)
  }

  return (
    <SectionCard
      title="Identité"
      icon={Building2}
      onSave={onSave}
      saving={saving}
      isDirty={isDirty}
      error={error}
      success={success}
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="identite-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l&apos;entreprise *
            </label>
            <input
              id="identite-name"
              type="text"
              value={(formData.name as string) || ''}
              onChange={(e) => setField('name', e.target.value)}
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="identite-legal-form" className="block text-sm font-medium text-gray-700 mb-2">
              Forme juridique
            </label>
            <input
              id="identite-legal-form"
              type="text"
              value={(formData.legal_form as string) || ''}
              onChange={(e) => setField('legal_form', e.target.value)}
              maxLength={100}
              placeholder="Ex: SARL, SAS, Auto-entrepreneur..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="identite-siret" className="block text-sm font-medium text-gray-700 mb-2">
              N&deg; SIRET
              {isVerified && (
                <span className="ml-2 text-xs text-green-600 font-normal">(vérifié - non modifiable)</span>
              )}
            </label>
            <input
              id="identite-siret"
              type="text"
              value={(formData.siret as string) || ''}
              onChange={(e) => setField('siret', e.target.value.replace(/\D/g, '').slice(0, 14))}
              maxLength={14}
              readOnly={isVerified}
              aria-describedby="siret-help"
              aria-readonly={isVerified}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <p id="siret-help" className="text-xs text-gray-500 mt-1">
              {isVerified ? '14 chiffres — SIRET vérifié, non modifiable' : '14 chiffres'}
            </p>
          </div>
          <div>
            <label htmlFor="identite-creation-date" className="block text-sm font-medium text-gray-700 mb-2">
              Date de création
            </label>
            <input
              id="identite-creation-date"
              type="date"
              value={(formData.creation_date as string) || ''}
              onChange={(e) => setField('creation_date', e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="identite-team-size" className="block text-sm font-medium text-gray-700 mb-2">
              Taille de l&apos;équipe
            </label>
            <input
              id="identite-team-size"
              type="number"
              value={formData.team_size != null ? Number(formData.team_size) : ''}
              onChange={(e) => setField('team_size', e.target.value ? parseInt(e.target.value, 10) : null)}
              min={1}
              max={1000}
              placeholder="Ex : 3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Nombre de personnes dans votre entreprise</p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
