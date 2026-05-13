'use client'

import { useState } from 'react'
import type { StepperState, StepperDispatch } from '../Stepper'

interface Props {
  state: StepperState
  dispatch: StepperDispatch
}

const IDF_DEPTS = new Set(['75', '77', '78', '91', '92', '93', '94', '95'])

function deptFromCp(cp?: string): string | null {
  if (!cp || cp.length !== 5) return null
  return cp.startsWith('97') ? cp.slice(0, 3) : cp.slice(0, 2)
}

export default function Step2Revenus({ state, dispatch }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  const dept = deptFromCp(state.situation.codePostal)
  const idf = dept !== null && IDF_DEPTS.has(dept)

  function onNext(e: React.FormEvent) {
    e.preventDefault()
    if (!state.revenus.rfr || state.revenus.rfr <= 0) {
      dispatch({ type: 'SET_ERROR', value: 'Revenu fiscal de référence requis.' })
      return
    }
    dispatch({ type: 'NEXT' })
  }

  return (
    <form onSubmit={onNext} className="space-y-5" noValidate>
      <h3 className="text-lg font-semibold text-charcoal-900">Étape 2 — Vos revenus</h3>
      <p className="text-sm text-charcoal-600">
        Zone détectée : <strong>{idf ? 'Île-de-France' : 'Hors Île-de-France'}</strong>
      </p>

      <div>
        <label htmlFor="rfr" className="mb-1 block text-sm font-medium text-charcoal-800">
          Revenu fiscal de référence (RFR) du foyer (€)
        </label>
        <input
          id="rfr"
          type="number"
          min={0}
          inputMode="numeric"
          value={state.revenus.rfr ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_REVENUS',
              patch: { rfr: e.target.value ? Number(e.target.value) : undefined },
            })
          }
          className="w-full rounded-md border border-charcoal-300 p-2 text-sm"
          aria-describedby="rfr-help"
        />
        <button
          type="button"
          onClick={() => setShowTooltip((v) => !v)}
          className="mt-1 text-xs text-accent-700 underline hover:text-accent-800"
          aria-expanded={showTooltip}
        >
          Où trouver mon RFR ?
        </button>
        {showTooltip ? (
          <p id="rfr-help" className="mt-2 rounded-md bg-charcoal-50 p-3 text-xs text-charcoal-700">
            Votre RFR figure sur votre dernier avis d&apos;imposition sur le revenu, page 1, en haut
            à droite. Il correspond à la somme des revenus nets du foyer fiscal après abattements.
          </p>
        ) : null}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'PREV' })}
          className="rounded-md border border-charcoal-300 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
        >
          Retour
        </button>
        <button
          type="submit"
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          Étape suivante
        </button>
      </div>
    </form>
  )
}
