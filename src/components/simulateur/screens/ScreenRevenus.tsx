'use client'

import ScreenTitle from './ScreenTitle'
import { getRevenusCards, type RevenuCard } from '@/lib/simulateur/anah-thresholds'
import type { CategorieAnah } from '@/lib/simulateur/types'

interface Props {
  foyer: number
  idf: boolean
  value?: CategorieAnah
  onSelect: (categorie: CategorieAnah, rfrMilieu: number) => void
}

export default function ScreenRevenus({ foyer, idf, value, onSelect }: Props) {
  const cards = getRevenusCards(foyer, idf)

  return (
    <div>
      <ScreenTitle subtitle="Revenu fiscal de référence annuel de votre foyer">
        Dans quelle tranche vous situez-vous ?
      </ScreenTitle>
      <div className="space-y-3">
        {cards.map((card: RevenuCard) => (
          <button
            key={card.categorie}
            type="button"
            onClick={() => onSelect(card.categorie, card.rfrMilieu)}
            className={`w-full rounded-xl border-2 p-4 text-left transition ${
              value === card.categorie
                ? `${card.borderColor} ${card.bgColor} ring-2 ring-opacity-40`
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold ${card.color}`}>{card.label}</p>
                <p className="text-xs text-charcoal-500">{card.description}</p>
              </div>
              <span className={`text-sm font-semibold ${card.color}`}>{card.seuilLabel}</span>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-charcoal-400">
        Votre RFR figure sur votre avis d&apos;imposition, page 1
      </p>
    </div>
  )
}
