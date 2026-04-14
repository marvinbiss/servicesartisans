'use client'

import { useEffect, useRef, useState } from 'react'
import type { StepperState, StepperDispatch } from '../Stepper'

interface Props {
  state: StepperState
  dispatch: StepperDispatch
}

interface EstimateResponse {
  mprTotal: number
  ceeFourchetteBas: number
  ceeFourchetteHaut: number
  cdpEstimationBas: number
  cdpEstimationHaut: number
  resteAChargeBas: number
  resteAChargeHaut: number
  ecretementPct: number
  exclusion?: string
}

function fmtEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function Step4Budget({ state, dispatch }: Props) {
  const [loading, setLoading] = useState(false)
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null)
  const [estError, setEstError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  function canFetch(): boolean {
    return Boolean(
      state.budget.budgetHt &&
      state.budget.budgetHt >= 1000 &&
      state.projet.parcours &&
      state.projet.gestes.length > 0 &&
      state.projet.equipementActuel &&
      state.situation.typeLogement &&
      state.situation.residencePrincipale !== undefined &&
      state.situation.anciennete &&
      state.situation.surface &&
      state.situation.codePostal &&
      state.situation.foyer &&
      state.revenus.rfr
    )
  }

  // Debounced live estimate
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!canFetch()) {
      setEstimate(null)
      return
    }
    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setLoading(true)
      setEstError(null)
      try {
        const res = await fetch('/api/simulateur/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            situation: {
              typeLogement: state.situation.typeLogement,
              residencePrincipale: state.situation.residencePrincipale,
              anciennete: state.situation.anciennete,
              surface: state.situation.surface,
              codePostal: state.situation.codePostal,
              foyer: state.situation.foyer,
              rfr: state.revenus.rfr,
            },
            projet: {
              parcours: state.projet.parcours,
              gestes: state.projet.gestes,
              sautsDpe: state.projet.sautsDpe,
              coupDePouce: state.projet.coupDePouce,
              equipementActuel: state.projet.equipementActuel,
            },
            budget: { budgetHt: state.budget.budgetHt },
          }),
        })
        if (!res.ok) {
          setEstError('Calcul impossible avec ces données.')
          setEstimate(null)
          return
        }
        const data = (await res.json()) as EstimateResponse
        setEstimate(data)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setEstError('Erreur réseau.')
        }
      } finally {
        setLoading(false)
      }
    }, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.budget.budgetHt,
    state.projet.parcours,
    state.projet.gestes,
    state.projet.coupDePouce,
    state.projet.sautsDpe,
    state.projet.equipementActuel,
    state.revenus.rfr,
  ])

  function onNext(e: React.FormEvent) {
    e.preventDefault()
    if (!state.budget.budgetHt || state.budget.budgetHt < 1000) {
      dispatch({ type: 'SET_ERROR', value: 'Budget minimum 1 000 € HT.' })
      return
    }
    dispatch({ type: 'NEXT' })
  }

  return (
    <form onSubmit={onNext} className="space-y-5" noValidate>
      <h3 className="text-lg font-semibold text-slate-900">Étape 4 — Budget</h3>

      <div>
        <label htmlFor="budgetHt" className="mb-1 block text-sm font-medium text-slate-800">
          Budget estimé des travaux (HT, en €)
        </label>
        <input
          id="budgetHt"
          type="number"
          min={1000}
          inputMode="numeric"
          value={state.budget.budgetHt ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_BUDGET',
              patch: {
                budgetHt: e.target.value ? Number(e.target.value) : undefined,
              },
            })
          }
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      <div
        aria-live="polite"
        className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm"
      >
        {loading ? (
          <p className="text-slate-600">Calcul en cours…</p>
        ) : estError ? (
          <p className="text-amber-700">{estError}</p>
        ) : estimate ? (
          estimate.exclusion ? (
            <p className="text-amber-800">{estimate.exclusion}</p>
          ) : (
            <div className="space-y-1 text-slate-800">
              <p className="font-semibold text-emerald-800">Estimation indicative</p>
              <p>MaPrimeRénov&apos; : {fmtEur(estimate.mprTotal)}</p>
              <p>
                CEE : {fmtEur(estimate.ceeFourchetteBas)} – {fmtEur(estimate.ceeFourchetteHaut)}
              </p>
              {estimate.cdpEstimationHaut > 0 ? (
                <p>
                  Coup de Pouce : {fmtEur(estimate.cdpEstimationBas)} –{' '}
                  {fmtEur(estimate.cdpEstimationHaut)}
                </p>
              ) : null}
              <p className="mt-2 font-semibold">
                Reste à charge estimé : {fmtEur(estimate.resteAChargeBas)} –{' '}
                {fmtEur(estimate.resteAChargeHaut)}
              </p>
            </div>
          )
        ) : (
          <p className="text-slate-500">
            Saisissez un budget pour voir votre estimation en direct.
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'PREV' })}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Retour
        </button>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Étape suivante
        </button>
      </div>
    </form>
  )
}
