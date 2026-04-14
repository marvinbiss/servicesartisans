'use client'

import { useEffect, useReducer, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Step1Situation from './steps/Step1Situation'
import Step2Revenus from './steps/Step2Revenus'
import Step3Projet from './steps/Step3Projet'
import Step4Budget from './steps/Step4Budget'
import Step5Contact from './steps/Step5Contact'

// ------------------ State ------------------

export interface StepperState {
  step: 1 | 2 | 3 | 4 | 5
  situation: {
    typeLogement?: 'maison' | 'appartement'
    residencePrincipale?: boolean
    anciennete?: 'moins_2_ans' | '2_a_15_ans' | 'plus_15_ans'
    surface?: number
    codePostal?: string
    foyer?: number
  }
  revenus: {
    rfr?: number
  }
  projet: {
    parcours?: 'geste' | 'accompagne'
    gestes: string[]
    sautsDpe?: 2 | 3 | 4
    coupDePouce: boolean
    equipementActuel?: 'gaz' | 'fioul' | 'charbon' | 'elec' | 'bois' | 'autre'
  }
  budget: {
    budgetHt?: number
  }
  contact: {
    prenom: string
    nom: string
    email: string
    telephone: string
    consentRgpd: boolean
    consentMajorite: boolean
    consentDemarchage: boolean
  }
  submitting: boolean
  error?: string
}

const INITIAL_STATE: StepperState = {
  step: 1,
  situation: {},
  revenus: {},
  projet: { gestes: [], coupDePouce: false },
  budget: {},
  contact: {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    consentRgpd: false,
    consentMajorite: false,
    consentDemarchage: false,
  },
  submitting: false,
}

type Action =
  | { type: 'SET_SITUATION'; patch: Partial<StepperState['situation']> }
  | { type: 'SET_REVENUS'; patch: Partial<StepperState['revenus']> }
  | { type: 'SET_PROJET'; patch: Partial<StepperState['projet']> }
  | { type: 'SET_BUDGET'; patch: Partial<StepperState['budget']> }
  | { type: 'SET_CONTACT'; patch: Partial<StepperState['contact']> }
  | { type: 'GOTO'; step: StepperState['step'] }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_ERROR'; value?: string }
  | { type: 'HYDRATE'; value: StepperState }
  | { type: 'RESET' }

function reducer(state: StepperState, action: Action): StepperState {
  switch (action.type) {
    case 'SET_SITUATION':
      return { ...state, situation: { ...state.situation, ...action.patch } }
    case 'SET_REVENUS':
      return { ...state, revenus: { ...state.revenus, ...action.patch } }
    case 'SET_PROJET':
      return { ...state, projet: { ...state.projet, ...action.patch } }
    case 'SET_BUDGET':
      return { ...state, budget: { ...state.budget, ...action.patch } }
    case 'SET_CONTACT':
      return { ...state, contact: { ...state.contact, ...action.patch } }
    case 'GOTO':
      return { ...state, step: action.step, error: undefined }
    case 'NEXT':
      return {
        ...state,
        step: Math.min(5, state.step + 1) as StepperState['step'],
        error: undefined,
      }
    case 'PREV':
      return {
        ...state,
        step: Math.max(1, state.step - 1) as StepperState['step'],
        error: undefined,
      }
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value }
    case 'SET_ERROR':
      return { ...state, error: action.value }
    case 'HYDRATE':
      return action.value
    case 'RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

// ------------------ Persistence ------------------

const LS_KEY = 'simulateur-draft-v1'
const TTL_MS = 24 * 60 * 60_000

interface PersistedShape {
  savedAt: number
  state: StepperState
}

function load(): StepperState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedShape
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      window.localStorage.removeItem(LS_KEY)
      return null
    }
    return { ...parsed.state, submitting: false, error: undefined }
  } catch {
    return null
  }
}

function save(state: StepperState) {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistedShape = { savedAt: Date.now(), state }
    window.localStorage.setItem(LS_KEY, JSON.stringify(payload))
  } catch {
    // quota / privacy mode — best-effort
  }
}

// ------------------ Component ------------------

const STEP_LABELS = ['Situation', 'Revenus', 'Projet', 'Budget', 'Coordonnées'] as const

export default function Stepper() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const router = useRouter()
  const hydratedRef = useRef(false)

  // Hydrate from localStorage once
  useEffect(() => {
    const loaded = load()
    if (loaded) dispatch({ type: 'HYDRATE', value: loaded })
    hydratedRef.current = true
  }, [])

  // Persist on changes after hydrate
  useEffect(() => {
    if (!hydratedRef.current) return
    save(state)
  }, [state])

  async function handleSubmit() {
    dispatch({ type: 'SET_SUBMITTING', value: true })
    dispatch({ type: 'SET_ERROR', value: undefined })

    const payload = {
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
      coordonnees: {
        prenom: state.contact.prenom,
        nom: state.contact.nom,
        email: state.contact.email,
        telephone: state.contact.telephone,
        consentRgpd: state.contact.consentRgpd,
        consentMajorite: state.contact.consentMajorite,
        consentDemarchage: state.contact.consentDemarchage,
      },
    }

    try {
      const res = await fetch('/api/simulateur/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg =
          typeof (err as { error?: unknown }).error === 'string'
            ? (err as { error: string }).error
            : 'Erreur lors de la soumission'
        dispatch({ type: 'SET_ERROR', value: msg })
        dispatch({ type: 'SET_SUBMITTING', value: false })
        return
      }
      const { publicId } = (await res.json()) as { publicId: string }
      // Clear draft on success
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LS_KEY)
      }
      router.push(`/simulateur-aides-renovation/resultat/${publicId}`)
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        value: err instanceof Error ? err.message : 'Erreur réseau. Réessayez.',
      })
      dispatch({ type: 'SET_SUBMITTING', value: false })
    }
  }

  const progressPct = Math.round((state.step / 5) * 100)

  return (
    <section
      aria-labelledby="stepper-title"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 id="stepper-title" className="sr-only">
        Formulaire en 5 étapes
      </h2>

      {/* Progress */}
      <div className="mb-6">
        <div
          role="progressbar"
          aria-valuenow={state.step}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-label={`Étape ${state.step} sur 5`}
          className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {STEP_LABELS.map((label, idx) => {
            const n = (idx + 1) as StepperState['step']
            const done = state.step > n
            const current = state.step === n
            return (
              <li
                key={label}
                className={
                  current
                    ? 'font-semibold text-emerald-700'
                    : done
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                }
                aria-current={current ? 'step' : undefined}
              >
                {n}. {label}
              </li>
            )
          })}
        </ol>
      </div>

      {state.error ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {state.error}
        </div>
      ) : null}

      {state.step === 1 ? <Step1Situation state={state} dispatch={dispatch} /> : null}
      {state.step === 2 ? <Step2Revenus state={state} dispatch={dispatch} /> : null}
      {state.step === 3 ? <Step3Projet state={state} dispatch={dispatch} /> : null}
      {state.step === 4 ? <Step4Budget state={state} dispatch={dispatch} /> : null}
      {state.step === 5 ? (
        <Step5Contact state={state} dispatch={dispatch} onSubmit={handleSubmit} />
      ) : null}
    </section>
  )
}

export type StepperDispatch = React.Dispatch<Action>
