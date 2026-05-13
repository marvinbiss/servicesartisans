'use client'

import type { StepperState, StepperDispatch } from '../Stepper'

interface Props {
  state: StepperState
  dispatch: StepperDispatch
}

const CP_RE = /^\d{5}$/

export default function Step1Situation({ state, dispatch }: Props) {
  const s = state.situation

  function validate(): string | null {
    if (!s.typeLogement) return 'Indiquez le type de logement.'
    if (s.residencePrincipale === undefined) return 'Indiquez si c’est votre résidence principale.'
    if (!s.anciennete) return 'Sélectionnez l’ancienneté du logement.'
    if (!s.surface || s.surface < 15 || s.surface > 500) return 'Surface entre 15 et 500 m².'
    if (!s.codePostal || !CP_RE.test(s.codePostal)) return 'Code postal à 5 chiffres.'
    if (!s.foyer || s.foyer < 1 || s.foyer > 10) return 'Taille du foyer entre 1 et 10.'
    return null
  }

  function onNext(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) {
      dispatch({ type: 'SET_ERROR', value: err })
      return
    }
    dispatch({ type: 'NEXT' })
  }

  return (
    <form onSubmit={onNext} className="space-y-5" noValidate>
      <h3 className="text-lg font-semibold text-charcoal-900">Étape 1 — Votre logement</h3>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-charcoal-800">
          Type de logement
        </legend>
        <div className="flex gap-3">
          {(['maison', 'appartement'] as const).map((v) => (
            <label
              key={v}
              className={`flex-1 cursor-pointer rounded-md border p-3 text-sm ${
                s.typeLogement === v
                  ? 'border-accent-600 bg-accent-50 text-accent-900'
                  : 'border-charcoal-300 hover:border-charcoal-400'
              }`}
            >
              <input
                type="radio"
                name="typeLogement"
                value={v}
                checked={s.typeLogement === v}
                onChange={() => dispatch({ type: 'SET_SITUATION', patch: { typeLogement: v } })}
                className="sr-only"
              />
              {v === 'maison' ? 'Maison individuelle' : 'Appartement'}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-charcoal-800">
          Résidence principale ?
        </legend>
        <div className="flex gap-3">
          {[
            { v: true, l: 'Oui' },
            { v: false, l: 'Non' },
          ].map(({ v, l }) => (
            <label
              key={String(v)}
              className={`flex-1 cursor-pointer rounded-md border p-3 text-sm ${
                s.residencePrincipale === v
                  ? 'border-accent-600 bg-accent-50 text-accent-900'
                  : 'border-charcoal-300 hover:border-charcoal-400'
              }`}
            >
              <input
                type="radio"
                name="residencePrincipale"
                checked={s.residencePrincipale === v}
                onChange={() =>
                  dispatch({
                    type: 'SET_SITUATION',
                    patch: { residencePrincipale: v },
                  })
                }
                className="sr-only"
              />
              {l}
            </label>
          ))}
        </div>
      </fieldset>

      {s.typeLogement === 'appartement' && (
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-charcoal-800">
            Logement en copropriété ?
          </legend>
          <div className="flex gap-3">
            {[
              { v: true, l: 'Oui' },
              { v: false, l: 'Non' },
            ].map(({ v, l }) => (
              <label
                key={`copro-${String(v)}`}
                className={`flex-1 cursor-pointer rounded-md border p-3 text-sm ${
                  s.copropriete === v
                    ? 'border-accent-600 bg-accent-50 text-accent-900'
                    : 'border-charcoal-300 hover:border-charcoal-400'
                }`}
              >
                <input
                  type="radio"
                  name="copropriete"
                  checked={s.copropriete === v}
                  onChange={() =>
                    dispatch({
                      type: 'SET_SITUATION',
                      patch: { copropriete: v },
                    })
                  }
                  className="sr-only"
                />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="anciennete" className="mb-1 block text-sm font-medium text-charcoal-800">
          Ancienneté du logement
        </label>
        <select
          id="anciennete"
          value={s.anciennete ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_SITUATION',
              patch: {
                anciennete: (e.target.value ||
                  undefined) as StepperState['situation']['anciennete'],
              },
            })
          }
          className="w-full rounded-md border border-charcoal-300 p-2 text-sm"
          required
        >
          <option value="">Sélectionner…</option>
          <option value="moins_2_ans">Moins de 2 ans</option>
          <option value="2_a_15_ans">Entre 2 et 15 ans</option>
          <option value="plus_15_ans">Plus de 15 ans</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="surface" className="mb-1 block text-sm font-medium text-charcoal-800">
            Surface habitable (m²)
          </label>
          <input
            id="surface"
            type="number"
            min={15}
            max={500}
            inputMode="numeric"
            value={s.surface ?? ''}
            onChange={(e) =>
              dispatch({
                type: 'SET_SITUATION',
                patch: {
                  surface: e.target.value ? Number(e.target.value) : undefined,
                },
              })
            }
            className="w-full rounded-md border border-charcoal-300 p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="codePostal" className="mb-1 block text-sm font-medium text-charcoal-800">
            Code postal
          </label>
          <input
            id="codePostal"
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            value={s.codePostal ?? ''}
            onChange={(e) =>
              dispatch({
                type: 'SET_SITUATION',
                patch: { codePostal: e.target.value.replace(/\D/g, '') },
              })
            }
            className="w-full rounded-md border border-charcoal-300 p-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="foyer" className="mb-1 block text-sm font-medium text-charcoal-800">
          Nombre de personnes dans le foyer
        </label>
        <select
          id="foyer"
          value={s.foyer ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_SITUATION',
              patch: { foyer: e.target.value ? Number(e.target.value) : undefined },
            })
          }
          className="w-full rounded-md border border-charcoal-300 p-2 text-sm"
        >
          <option value="">Sélectionner…</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n === 6 ? '6 ou plus' : n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
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
