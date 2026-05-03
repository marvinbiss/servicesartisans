'use client'

import { useState, useMemo, useCallback } from 'react'
import { Sparkles } from 'lucide-react'

/** Same subcategories used in DevisForm — kept in sync */
const serviceSubcategories: Record<string, string[]> = {
  plombier: [
    "Fuite d'eau",
    'Débouchage',
    'Chauffe-eau',
    'Robinetterie',
    'WC / Sanitaires',
    'Tuyauterie',
  ],
  electricien: [
    'Panne électrique',
    'Installation prise/interrupteur',
    'Tableau électrique',
    'Éclairage',
    'Mise aux normes',
    'Domotique',
  ],
  chauffagiste: [
    'Panne chaudière',
    'Entretien chaudière',
    'Radiateur',
    'Plancher chauffant',
    'Pompe à chaleur',
  ],
  peintre: [
    'Peinture intérieure',
    'Peinture extérieure',
    'Ravalement façade',
    'Papier peint',
    'Plafond',
  ],
  menuisier: ['Porte intérieure', 'Fenêtre', 'Escalier', 'Placard sur mesure', 'Parquet'],
  couvreur: ['Fuite toiture', 'Rénovation toiture', 'Gouttière', 'Isolation toiture', 'Démoussage'],
  macon: ['Mur / Cloison', 'Fondation', 'Terrasse', 'Extension', 'Démolition'],
  jardinier: ['Tonte pelouse', 'Taille haie', 'Élagage', 'Aménagement jardin', 'Clôture'],
}

interface SmartSuggestionsProps {
  /** Current service slug (e.g., "plombier") */
  service: string
  /** Current description text typed by the user */
  description: string
  /** Callback when user clicks a suggestion chip */
  onSelect: (suggestion: string) => void
}

/**
 * SmartSuggestions — Intelligent chip suggestions based on user input.
 *
 * As the user types in the project description, this component displays
 * matching subcategory chips from the existing serviceSubcategories data.
 *
 * AUTONOMOUS: does not modify DevisForm. Calls onSelect with the chosen text.
 */
export default function SmartSuggestions({
  service,
  description,
  onSelect,
}: SmartSuggestionsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const subcategories = useMemo(() => serviceSubcategories[service] || [], [service])

  const suggestions = useMemo(() => {
    if (!description || description.length < 2) {
      // Show all subcategories as quick-start suggestions when empty or very short
      return subcategories
    }

    const query = description.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

    return subcategories.filter((sub) => {
      if (dismissed.has(sub)) return false

      const normalizedSub = sub.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

      // Fuzzy match: check if any word in query matches any word in subcategory
      const queryWords = query.split(/\s+/).filter((w) => w.length >= 2)
      const subWords = normalizedSub.split(/[\s/]+/)

      // Direct inclusion match
      if (normalizedSub.includes(query)) return true
      if (query.includes(normalizedSub)) return true

      // Word-level matching
      return queryWords.some((qw) => subWords.some((sw) => sw.startsWith(qw) || qw.startsWith(sw)))
    })
  }, [description, subcategories, dismissed])

  const handleSelect = useCallback(
    (suggestion: string) => {
      onSelect(suggestion)
      setDismissed((prev) => new Set(prev).add(suggestion))
    },
    [onSelect]
  )

  // Don't render if no service or no matching suggestions
  if (!service || suggestions.length === 0) return null

  const isInitialState = !description || description.length < 2
  const label = isInitialState ? 'Suggestions rapides :' : 'Suggestions :'

  return (
    <div className="mt-2" role="group" aria-label="Suggestions de projet">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary-400" aria-hidden="true" />
        <span className="text-xs font-medium text-charcoal-400">{label}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.slice(0, 6).map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleSelect(suggestion)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-sand-100 hover:bg-primary-50 text-charcoal-600 hover:text-primary-600 border border-sand-200 hover:border-primary-200 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
