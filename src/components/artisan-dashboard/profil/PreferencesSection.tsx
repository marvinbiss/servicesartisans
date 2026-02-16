'use client'

import { useState } from 'react'
import { Settings2, Plus, X } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { useProviderForm } from './useProviderForm'

interface PreferencesSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

const FIELDS = ['payment_methods', 'languages'] as const

const PAYMENT_OPTIONS = [
  'Espèces',
  'Chèque',
  'Carte bancaire',
  'Virement bancaire',
  'PayPal',
]

export function PreferencesSection({ provider, onSaved }: PreferencesSectionProps) {
  const { formData, setField, isDirty, saving, error, success, handleSave } = useProviderForm(provider, FIELDS)
  const [newLanguage, setNewLanguage] = useState('')

  const onSave = async () => {
    const updated = await handleSave()
    if (updated) onSaved(updated)
  }

  const paymentMethods = (formData.payment_methods as string[]) || []
  const languages = (formData.languages as string[]) || []

  const togglePayment = (method: string) => {
    if (paymentMethods.includes(method)) {
      setField('payment_methods', paymentMethods.filter(m => m !== method))
    } else {
      setField('payment_methods', [...paymentMethods, method])
    }
  }

  const addLanguage = () => {
    const trimmed = newLanguage.trim()
    if (trimmed && !languages.includes(trimmed) && languages.length < 10) {
      setField('languages', [...languages, trimmed])
      setNewLanguage('')
    }
  }

  const removeLanguage = (index: number) => {
    setField('languages', languages.filter((_, i) => i !== index))
  }

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
        {/* Payment methods */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-3">Modes de paiement acceptés</span>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((method) => (
              <label key={method} htmlFor={`pref-payment-${method}`} className="flex items-center gap-3 cursor-pointer">
                <input
                  id={`pref-payment-${method}`}
                  type="checkbox"
                  checked={paymentMethods.includes(method)}
                  onChange={() => togglePayment(method)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label htmlFor="pref-lang-new" className="block text-sm font-medium text-gray-700 mb-2">
            Langues parlées
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {languages.map((lang, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {lang}
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="hover:text-blue-900"
                  aria-label={`Supprimer ${lang}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {languages.length === 0 && (
              <span className="text-sm text-gray-400 italic">Aucune langue ajoutée</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              id="pref-lang-new"
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
              placeholder="Ex: Français, Anglais, Arabe..."
              maxLength={50}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addLanguage}
              disabled={languages.length >= 10}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
