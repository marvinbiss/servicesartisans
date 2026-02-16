'use client'

import { useState } from 'react'
import { Award, Plus, X } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { useProviderForm } from './useProviderForm'

interface QualificationsSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

const MAX_CERTIFICATIONS = 20
const MAX_INSURANCE = 10

const FIELDS = ['certifications', 'insurance'] as const

const CERTIFICATION_SUGGESTIONS = [
  'RGE', 'Qualibat', 'Qualifelec', 'QualiPAC', 'QualiSol', 'Qualigaz', 'APSAD',
]

const INSURANCE_SUGGESTIONS = [
  'Garantie décennale', 'RC Professionnelle', 'Multirisque Pro',
]

export function QualificationsSection({ provider, onSaved }: QualificationsSectionProps) {
  const { formData, setField, isDirty, saving, error, success, handleSave } = useProviderForm(provider, FIELDS)
  const [newCertification, setNewCertification] = useState('')
  const [newInsurance, setNewInsurance] = useState('')

  const onSave = async () => {
    const updated = await handleSave()
    if (updated) onSaved(updated)
  }

  const certifications = (formData.certifications as string[]) || []
  const insurance = (formData.insurance as string[]) || []

  const addCertification = (value?: string) => {
    const trimmed = (value || newCertification).trim()
    if (!trimmed || certifications.length >= MAX_CERTIFICATIONS) return
    // Case-insensitive duplicate check
    if (certifications.some(c => c.toLowerCase() === trimmed.toLowerCase())) return
    setField('certifications', [...certifications, trimmed])
    setNewCertification('')
  }

  const removeCertification = (index: number) => {
    setField('certifications', certifications.filter((_, i) => i !== index))
  }

  const addInsurance = (value?: string) => {
    const trimmed = (value || newInsurance).trim()
    if (!trimmed || insurance.length >= MAX_INSURANCE) return
    // Case-insensitive duplicate check
    if (insurance.some(ins => ins.toLowerCase() === trimmed.toLowerCase())) return
    setField('insurance', [...insurance, trimmed])
    setNewInsurance('')
  }

  const removeInsurance = (index: number) => {
    setField('insurance', insurance.filter((_, i) => i !== index))
  }

  const certsAtMax = certifications.length >= MAX_CERTIFICATIONS
  const insAtMax = insurance.length >= MAX_INSURANCE

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
        {/* Certifications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="qualif-cert-new" className="block text-sm font-medium text-gray-700">
              Certifications
            </label>
            <span className="text-xs text-gray-400">{certifications.length}/{MAX_CERTIFICATIONS}</span>
          </div>

          {/* Suggestion pills - hidden when at max */}
          {!certsAtMax && (
            <div className="flex flex-wrap gap-2 mb-3">
              {CERTIFICATION_SUGGESTIONS.filter(s => !certifications.some(c => c.toLowerCase() === s.toLowerCase())).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addCertification(suggestion)}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Current certifications */}
          <div className="flex flex-wrap gap-2 mb-3">
            {certifications.map((cert, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {cert}
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="hover:text-green-900"
                  aria-label={`Supprimer ${cert}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              id="qualif-cert-new"
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCertification() } }}
              placeholder={certsAtMax ? 'Limite atteinte' : 'Ajouter une certification'}
              maxLength={100}
              disabled={certsAtMax}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <button
              type="button"
              onClick={() => addCertification()}
              disabled={certsAtMax}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              aria-label="Ajouter une certification"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {certsAtMax && (
            <p className="text-xs text-secondary-600 mt-1">Limite de {MAX_CERTIFICATIONS} certifications atteinte.</p>
          )}
        </div>

        {/* Insurance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="qualif-ins-new" className="block text-sm font-medium text-gray-700">
              Assurances
            </label>
            <span className="text-xs text-gray-400">{insurance.length}/{MAX_INSURANCE}</span>
          </div>

          {/* Suggestion pills - hidden when at max */}
          {!insAtMax && (
            <div className="flex flex-wrap gap-2 mb-3">
              {INSURANCE_SUGGESTIONS.filter(s => !insurance.some(ins => ins.toLowerCase() === s.toLowerCase())).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addInsurance(suggestion)}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Current insurance */}
          <div className="flex flex-wrap gap-2 mb-3">
            {insurance.map((ins, index) => (
              <span
                key={index}
                className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {ins}
                <button
                  type="button"
                  onClick={() => removeInsurance(index)}
                  className="hover:text-secondary-900"
                  aria-label={`Supprimer ${ins}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              id="qualif-ins-new"
              type="text"
              value={newInsurance}
              onChange={(e) => setNewInsurance(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInsurance() } }}
              placeholder={insAtMax ? 'Limite atteinte' : 'Ajouter une assurance'}
              maxLength={100}
              disabled={insAtMax}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <button
              type="button"
              onClick={() => addInsurance()}
              disabled={insAtMax}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              aria-label="Ajouter une assurance"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {insAtMax && (
            <p className="text-xs text-secondary-600 mt-1">Limite de {MAX_INSURANCE} assurances atteinte.</p>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
