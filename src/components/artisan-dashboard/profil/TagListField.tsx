'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

/**
 * Éditeur de liste de tags (chips + input d'ajout) — partagé par les champs
 * TEXT[] mig 306 : certifications, insurance, payment_methods, languages.
 * Même pattern UI que la liste services_offered de ServicesTarifsSection.
 */
interface TagListFieldProps {
  id: string
  label: string
  values: string[]
  max: number
  maxLength?: number
  placeholder: string
  helpText?: string
  suggestions?: string[]
  onChange: (values: string[]) => void
}

export function TagListField({
  id,
  label,
  values,
  max,
  maxLength = 100,
  placeholder,
  helpText,
  suggestions,
  onChange,
}: TagListFieldProps) {
  const [draft, setDraft] = useState('')
  const atMax = values.length >= max

  const add = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed || atMax) return
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return
    onChange([...values, trimmed])
    setDraft('')
  }

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  const remainingSuggestions = (suggestions ?? []).filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-charcoal-700">
          {label}
        </label>
        <span className="text-xs text-charcoal-400">
          {values.length}/{max}
        </span>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {values.map((value, index) => (
            <span
              key={value}
              className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {value}
              <button
                type="button"
                onClick={() => remove(index)}
                className="hover:text-primary-800"
                aria-label={`Supprimer ${value}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
            }
          }}
          placeholder={atMax ? 'Limite atteinte' : placeholder}
          maxLength={maxLength}
          disabled={atMax}
          className="flex-1 px-4 py-2 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 disabled:bg-sand-100 disabled:text-charcoal-400"
        />
        <button
          type="button"
          onClick={() => add(draft)}
          disabled={atMax}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          aria-label={`Ajouter — ${label}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {!atMax && remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-sand-300 text-charcoal-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {helpText && <p className="text-xs text-charcoal-400 mt-1.5">{helpText}</p>}
    </div>
  )
}
