'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { lineTotalHt, formatEUR } from '@/lib/devis'

export type DraftLine = {
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  tva_rate: number
}

export const emptyLine = (): DraftLine => ({
  designation: '',
  quantite: 1,
  unite: 'u',
  prix_unitaire_ht: 0,
  tva_rate: 20,
})

const TVA_RATES = [0, 5.5, 10, 20] as const

type Props = {
  lines: DraftLine[]
  onChange: (lines: DraftLine[]) => void
}

export function DevisLignesEditor({ lines, onChange }: Props) {
  const update = (i: number, patch: Partial<DraftLine>) => {
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i))
  const add = () => onChange([...lines, emptyLine()])

  const num = (v: string): number => {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) && n >= 0 ? n : 0
  }

  return (
    <div className="space-y-3">
      <div className="hidden md:grid grid-cols-[24px_1fr_88px_72px_120px_88px_110px_40px] gap-2 px-2 text-xs font-medium text-charcoal-400 uppercase tracking-wide">
        <span />
        <span>Désignation</span>
        <span>Qté</span>
        <span>Unité</span>
        <span>Prix u. HT</span>
        <span>TVA</span>
        <span className="text-right">Total HT</span>
        <span />
      </div>

      {lines.map((line, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-[24px_1fr_88px_72px_120px_88px_110px_40px] gap-2 items-center bg-white border border-sand-200 rounded-lg p-2"
        >
          <GripVertical
            className="hidden md:block w-4 h-4 text-charcoal-300 mx-auto"
            aria-hidden="true"
          />
          <input
            type="text"
            value={line.designation}
            onChange={(e) => update(i, { designation: e.target.value })}
            placeholder="Prestation, fourniture…"
            aria-label={`Désignation ligne ${i + 1}`}
            className="px-2 py-1.5 text-sm border border-sand-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={line.quantite}
            onChange={(e) => update(i, { quantite: num(e.target.value) })}
            aria-label={`Quantité ligne ${i + 1}`}
            className="px-2 py-1.5 text-sm border border-sand-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="text"
            value={line.unite}
            onChange={(e) => update(i, { unite: e.target.value })}
            aria-label={`Unité ligne ${i + 1}`}
            className="px-2 py-1.5 text-sm border border-sand-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={line.prix_unitaire_ht}
            onChange={(e) => update(i, { prix_unitaire_ht: num(e.target.value) })}
            aria-label={`Prix unitaire HT ligne ${i + 1}`}
            className="px-2 py-1.5 text-sm border border-sand-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={line.tva_rate}
            onChange={(e) => update(i, { tva_rate: Number(e.target.value) })}
            aria-label={`Taux de TVA ligne ${i + 1}`}
            className="px-2 py-1.5 text-sm border border-sand-200 rounded-md bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {TVA_RATES.map((r) => (
              <option key={r} value={r}>
                {r} %
              </option>
            ))}
          </select>
          <span className="text-sm font-medium text-charcoal-700 md:text-right tabular-nums">
            {formatEUR(lineTotalHt(line))}
          </span>
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={lines.length <= 1}
            aria-label={`Supprimer la ligne ${i + 1}`}
            className="p-1.5 text-charcoal-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed mx-auto"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 px-2 py-1.5"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Ajouter une ligne
      </button>
    </div>
  )
}
