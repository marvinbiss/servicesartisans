'use client'

import type { StepperState, StepperDispatch } from '../Stepper'

interface Props {
  state: StepperState
  dispatch: StepperDispatch
  onSubmit: () => void | Promise<void>
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEL_FR = /^(?:\+33|0)[1-9](?:\d{8})$/

export default function Step5Contact({ state, dispatch, onSubmit }: Props) {
  const c = state.contact

  function onFinish(e: React.FormEvent) {
    e.preventDefault()
    if (!c.prenom.trim()) {
      dispatch({ type: 'SET_ERROR', value: 'Prénom requis.' })
      return
    }
    if (!c.nom.trim()) {
      dispatch({ type: 'SET_ERROR', value: 'Nom requis.' })
      return
    }
    if (!EMAIL_RE.test(c.email)) {
      dispatch({ type: 'SET_ERROR', value: 'Adresse email invalide.' })
      return
    }
    if (!TEL_FR.test(c.telephone.replace(/\s/g, ''))) {
      dispatch({ type: 'SET_ERROR', value: 'Téléphone invalide (format FR).' })
      return
    }
    if (!c.consentRgpd) {
      dispatch({
        type: 'SET_ERROR',
        value: 'Le consentement RGPD est obligatoire.',
      })
      return
    }
    if (!c.consentMajorite) {
      dispatch({
        type: 'SET_ERROR',
        value: 'Vous devez certifier être majeur(e) et titulaire ou mandaté(e) pour le logement.',
      })
      return
    }
    void onSubmit()
  }

  return (
    <form onSubmit={onFinish} className="space-y-5" noValidate>
      <h3 className="text-lg font-semibold text-slate-900">Étape 5 — Vos coordonnées</h3>
      <p className="text-sm text-slate-600">
        Pour recevoir votre estimation détaillée et être mis en relation avec un artisan RGE
        qualifié.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prenom" className="mb-1 block text-sm font-medium text-slate-800">
            Prénom
          </label>
          <input
            id="prenom"
            type="text"
            autoComplete="given-name"
            value={c.prenom}
            onChange={(e) => dispatch({ type: 'SET_CONTACT', patch: { prenom: e.target.value } })}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="nom" className="mb-1 block text-sm font-medium text-slate-800">
            Nom
          </label>
          <input
            id="nom"
            type="text"
            autoComplete="family-name"
            value={c.nom}
            onChange={(e) => dispatch({ type: 'SET_CONTACT', patch: { nom: e.target.value } })}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={c.email}
          onChange={(e) => dispatch({ type: 'SET_CONTACT', patch: { email: e.target.value } })}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="telephone" className="mb-1 block text-sm font-medium text-slate-800">
          Téléphone
        </label>
        <input
          id="telephone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="06 12 34 56 78"
          value={c.telephone}
          onChange={(e) => dispatch({ type: 'SET_CONTACT', patch: { telephone: e.target.value } })}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
          required
        />
      </div>

      <fieldset className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
        <legend className="px-1 text-xs font-semibold text-slate-700">Consentements</legend>
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={c.consentRgpd}
            onChange={(e) =>
              dispatch({
                type: 'SET_CONTACT',
                patch: { consentRgpd: e.target.checked },
              })
            }
            className="mt-1 h-4 w-4"
            required
          />
          <span>
            J&apos;accepte le traitement de mes données pour recevoir mon estimation et être
            recontacté(e) par un artisan RGE partenaire (obligatoire).
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={c.consentMajorite}
            onChange={(e) =>
              dispatch({
                type: 'SET_CONTACT',
                patch: { consentMajorite: e.target.checked },
              })
            }
            className="mt-1 h-4 w-4"
            required
          />
          <span>
            Je certifie être majeur(e) et titulaire ou mandaté(e) pour le logement concerné.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={c.consentDemarchage}
            onChange={(e) =>
              dispatch({
                type: 'SET_CONTACT',
                patch: { consentDemarchage: e.target.checked },
              })
            }
            className="mt-1 h-4 w-4"
          />
          <span>
            J&apos;accepte de recevoir des offres commerciales de ServicesArtisans (optionnel).
          </span>
        </label>
      </fieldset>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => dispatch({ type: 'PREV' })}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          disabled={state.submitting}
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={state.submitting}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
        >
          {state.submitting ? 'Envoi…' : 'Obtenir mon estimation'}
        </button>
      </div>
    </form>
  )
}
