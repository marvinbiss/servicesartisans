'use client'

import type { StepperState, StepperDispatch } from '../Stepper'

interface Props {
  state: StepperState
  dispatch: StepperDispatch
}

const GESTES: { id: string; label: string }[] = [
  { id: 'PAC_AIREAU', label: 'Pompe à chaleur air/eau' },
  { id: 'PAC_GEOTHERMIE', label: 'Pompe à chaleur géothermique' },
  { id: 'CET', label: 'Chauffe-eau thermodynamique' },
  { id: 'CESI', label: 'Chauffe-eau solaire individuel' },
  { id: 'SSC', label: 'Système solaire combiné' },
  { id: 'BIOMASSE', label: 'Chaudière biomasse' },
  { id: 'POELE_GRANULES', label: 'Poêle à granulés' },
  { id: 'POELE_BUCHES', label: 'Poêle à bûches' },
  { id: 'VMC_SF', label: 'VMC simple flux' },
  { id: 'VMC_2FLUX', label: 'VMC double flux' },
  { id: 'AUDIT_ENERGETIQUE', label: 'Audit énergétique' },
  { id: 'ISOLATION_MURS', label: 'Isolation des murs' },
  { id: 'ISOLATION_TOITURE', label: 'Isolation de la toiture' },
  { id: 'ISOLATION_PLANCHER', label: 'Isolation du plancher' },
  { id: 'MENUISERIES', label: 'Menuiseries (fenêtres)' },
]

const EQUIPEMENTS: {
  id: StepperState['projet']['equipementActuel']
  label: string
}[] = [
  { id: 'gaz', label: 'Gaz' },
  { id: 'fioul', label: 'Fioul' },
  { id: 'charbon', label: 'Charbon' },
  { id: 'elec', label: 'Électrique' },
  { id: 'bois', label: 'Bois' },
  { id: 'autre', label: 'Autre' },
]

const ISOLATION = new Set(['ISOLATION_MURS', 'ISOLATION_TOITURE', 'ISOLATION_PLANCHER'])

// Gestes d'isolation encore éligibles au parcours geste MPR en 2026 avec
// un forfait €/m² — cf. MPR_GESTE_NEEDS_SURFACE dans baremes/2026-01.ts.
// Supprimés parcours geste 2026 (non inclus ici) : ITE, ITI, ISOLATION_MURS,
// ISO_PLANCHERS_BAS, ISOLATION_PLANCHER, BIOMASSE.
const NEEDS_SURFACE = new Set(['ISO_TOITURE_RAMPANTS', 'ISO_TOITURE_TERRASSE', 'ISOLATION_TOITURE'])

const SURFACE_LABELS: Record<string, string> = {
  ISOLATION_TOITURE: 'Surface de toiture à isoler',
  ISO_TOITURE_RAMPANTS: 'Surface de rampants de toiture',
  ISO_TOITURE_TERRASSE: 'Surface de toiture terrasse',
}

export default function Step3Projet({ state, dispatch }: Props) {
  const p = state.projet

  function toggleGeste(id: string) {
    const next = p.gestes.includes(id) ? p.gestes.filter((g) => g !== id) : [...p.gestes, id]
    dispatch({ type: 'SET_PROJET', patch: { gestes: next } })
  }

  function onNext(e: React.FormEvent) {
    e.preventDefault()
    if (!p.parcours) {
      dispatch({ type: 'SET_ERROR', value: 'Sélectionnez un parcours.' })
      return
    }
    if (p.gestes.length < 1) {
      dispatch({ type: 'SET_ERROR', value: 'Sélectionnez au moins un geste.' })
      return
    }
    if (p.parcours === 'accompagne') {
      const isoCount = p.gestes.filter((g) => ISOLATION.has(g)).length
      if (isoCount < 2) {
        dispatch({
          type: 'SET_ERROR',
          value: 'Parcours accompagné : au moins 2 gestes d’isolation requis.',
        })
        return
      }
      if (p.coupDePouce && state.situation.residencePrincipale === false) {
        dispatch({
          type: 'SET_ERROR',
          value: 'Le Coup de Pouce Rénovation d’ampleur est réservé à la résidence principale.',
        })
        return
      }
    }
    if (!p.equipementActuel) {
      dispatch({ type: 'SET_ERROR', value: 'Sélectionnez l’équipement actuel.' })
      return
    }
    // Validation surfaces isolation : si un geste NEEDS_SURFACE est coché,
    // une valeur numérique entre 1 et 1000 m² doit être renseignée.
    const surfacesMissing = p.gestes.filter(
      (g) =>
        NEEDS_SURFACE.has(g) &&
        (p.surfacesIsolation_m2?.[g] === undefined ||
          p.surfacesIsolation_m2[g] === null ||
          !Number.isFinite(p.surfacesIsolation_m2[g]) ||
          (p.surfacesIsolation_m2[g] as number) < 1 ||
          (p.surfacesIsolation_m2[g] as number) > 1000)
    )
    if (surfacesMissing.length > 0) {
      dispatch({
        type: 'SET_ERROR',
        value: 'Renseignez une surface (1 à 1 000 m²) pour chaque geste d’isolation sélectionné.',
      })
      return
    }
    dispatch({ type: 'NEXT' })
  }

  function updateSurface(geste: string, value: string) {
    const parsed = value === '' ? undefined : Number.parseInt(value, 10)
    const next = { ...(p.surfacesIsolation_m2 ?? {}) }
    if (parsed === undefined || Number.isNaN(parsed)) {
      delete next[geste]
    } else {
      next[geste] = parsed
    }
    dispatch({ type: 'SET_PROJET', patch: { surfacesIsolation_m2: next } })
  }

  return (
    <form onSubmit={onNext} className="space-y-5" noValidate>
      <h3 className="text-lg font-semibold text-slate-900">Étape 3 — Votre projet</h3>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-slate-800">Type de parcours</legend>
        <div className="flex gap-3">
          {(
            [
              { v: 'geste' as const, l: 'Geste par geste' },
              { v: 'accompagne' as const, l: 'Rénovation d’ampleur (accompagnée)' },
            ] as const
          ).map(({ v, l }) => (
            <label
              key={v}
              className={`flex-1 cursor-pointer rounded-md border p-3 text-sm ${
                p.parcours === v
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                type="radio"
                name="parcours"
                checked={p.parcours === v}
                onChange={() => dispatch({ type: 'SET_PROJET', patch: { parcours: v } })}
                className="sr-only"
              />
              {l}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-slate-800">Gestes à réaliser</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GESTES.map((g) => {
            const checked = p.gestes.includes(g.id)
            return (
              <label
                key={g.id}
                className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm ${
                  checked ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGeste(g.id)}
                  className="h-4 w-4"
                />
                {g.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      {p.gestes.some((g) => NEEDS_SURFACE.has(g)) ? (
        <fieldset className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <legend className="px-1 text-sm font-medium text-amber-900">Surface à isoler (m²)</legend>
          <p className="mb-3 text-xs text-amber-800">
            Pour chaque geste d'isolation, indiquez la surface concernée (entre 1 et 1 000 m²).
            Cette valeur sert au calcul €/m² MaPrimeRénov'.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {p.gestes
              .filter((g) => NEEDS_SURFACE.has(g))
              .map((g) => {
                const fieldId = `surface-${g}`
                const current = p.surfacesIsolation_m2?.[g]
                return (
                  <div key={g}>
                    <label
                      htmlFor={fieldId}
                      className="mb-1 block text-xs font-medium text-amber-900"
                    >
                      {SURFACE_LABELS[g] ?? g}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={fieldId}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={1000}
                        step={1}
                        value={current ?? ''}
                        onChange={(e) => updateSurface(g, e.target.value)}
                        placeholder="Ex : 80"
                        className="w-full rounded-md border border-amber-300 bg-white p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        aria-describedby={`${fieldId}-unit`}
                      />
                      <span id={`${fieldId}-unit`} className="text-xs text-amber-900">
                        m²
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </fieldset>
      ) : null}

      {p.parcours === 'accompagne' ? (
        <div>
          <label htmlFor="sautsDpe" className="mb-1 block text-sm font-medium text-slate-800">
            Sauts de classe DPE visés
          </label>
          <select
            id="sautsDpe"
            value={p.sautsDpe ?? ''}
            onChange={(e) =>
              dispatch({
                type: 'SET_PROJET',
                patch: {
                  sautsDpe: e.target.value ? (Number(e.target.value) as 2 | 3 | 4) : undefined,
                },
              })
            }
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            <option value="">Sélectionner…</option>
            <option value={2}>2 classes</option>
            <option value={3}>3 classes</option>
            <option value={4}>4 classes ou plus</option>
          </select>
        </div>
      ) : null}

      <label className="flex items-start gap-2 text-sm text-slate-800">
        <input
          type="checkbox"
          checked={p.coupDePouce}
          onChange={(e) =>
            dispatch({
              type: 'SET_PROJET',
              patch: { coupDePouce: e.target.checked },
            })
          }
          className="mt-1 h-4 w-4"
        />
        <span>Je souhaite bénéficier du Coup de Pouce</span>
      </label>

      <div>
        <label htmlFor="equipementActuel" className="mb-1 block text-sm font-medium text-slate-800">
          Équipement de chauffage actuel
        </label>
        <select
          id="equipementActuel"
          value={p.equipementActuel ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_PROJET',
              patch: {
                equipementActuel: (e.target.value ||
                  undefined) as StepperState['projet']['equipementActuel'],
              },
            })
          }
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        >
          <option value="">Sélectionner…</option>
          {EQUIPEMENTS.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.label}
            </option>
          ))}
        </select>
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
