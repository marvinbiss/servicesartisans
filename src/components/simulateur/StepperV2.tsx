'use client'

import { useEffect, useReducer, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { capture, EVENT } from '@/lib/analytics/posthog'
import { deduceSimulationParams, type Objectif, type SurfaceTranche } from '@/lib/simulateur/deduction'
import { deptFromCodePostal } from '@/lib/simulateur/zones'
import type { Anciennete, CategorieAnah, SautsDpe } from '@/lib/simulateur/types'

import ScreenTransition from './screens/ScreenTransition'
import ScreenLogement from './screens/ScreenLogement'
import ScreenCodePostal from './screens/ScreenCodePostal'
import ScreenEligibilite from './screens/ScreenEligibilite'
import ScreenFoyer from './screens/ScreenFoyer'
import ScreenRevenus from './screens/ScreenRevenus'
import ScreenObjectif from './screens/ScreenObjectif'
import ScreenDpe from './screens/ScreenDpe'
import ScreenEquipement from './screens/ScreenEquipement'
import ScreenUrgence from './screens/ScreenUrgence'
import ScreenAgeChaudiere from './screens/ScreenAgeChaudiere'
import ScreenTeaser from './screens/ScreenTeaser'
import ScreenContact from './screens/ScreenContact'

// ---------- Types ----------

type ScreenId =
  | 'logement'
  | 'code_postal'
  | 'eligibilite'
  | 'foyer'
  | 'revenus'
  | 'objectif'
  | 'urgence'
  | 'dpe'
  | 'equipement'
  | 'age_chaudiere'
  | 'teaser'
  | 'contact'

interface State {
  screen: ScreenId
  typeLogement?: 'maison' | 'appartement'
  codePostal: string
  idf: boolean
  surfaceTranche?: SurfaceTranche
  residencePrincipale?: boolean
  anciennete?: Anciennete
  foyer?: number
  revenuCategorie?: CategorieAnah
  rfrMilieu?: number
  objectif?: Objectif
  sautsDpe?: SautsDpe
  equipementActuel?: 'gaz' | 'fioul' | 'elec' | 'autre'
  urgenceProjet?: 'urgent_panne' | 'sous_3_mois' | 'sous_6_mois' | 'je_me_renseigne'
  ageChaudiere?: 'moins_5_ans' | '5_10_ans' | '10_15_ans' | 'plus_15_ans' | 'en_panne'
  prenom: string
  telephone: string
  email: string
  consentRgpd: boolean
  consentMajorite: boolean
  consentDemarchage: boolean
  direction: 1 | -1
  submitting: boolean
  error?: string
}

const INITIAL_STATE: State = {
  screen: 'logement',
  codePostal: '',
  idf: false,
  prenom: '',
  telephone: '',
  email: '',
  consentRgpd: false,
  consentMajorite: false,
  consentDemarchage: false,
  direction: 1,
  submitting: false,
}

type Action =
  | { type: 'SET'; field: string; value: unknown }
  | { type: 'NEXT_SCREEN' }
  | { type: 'PREV_SCREEN' }
  | { type: 'GOTO'; screen: ScreenId }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_ERROR'; value?: string }
  | { type: 'HYDRATE'; value: State }

// ---------- Navigation ----------

const SCREEN_ORDER: ScreenId[] = [
  'logement',
  'code_postal',
  'eligibilite',
  'foyer',
  'revenus',
  'objectif',
  'urgence',
  'dpe',
  'equipement',
  'age_chaudiere',
  'teaser',
  'contact',
]

/**
 * Navigation conditionnelle :
 * - 'urgence' : toujours montré après objectif
 * - 'dpe' : seulement si objectif === 'renovation_complete' (parcours accompagné)
 * - 'equipement' : seulement si objectif === 'chauffage'
 * - 'age_chaudiere' : seulement si objectif === 'chauffage' (après equipement)
 */
function nextScreen(state: State): ScreenId {
  const idx = SCREEN_ORDER.indexOf(state.screen)
  if (state.screen === 'objectif') return 'urgence'
  if (state.screen === 'urgence') {
    if (state.objectif === 'chauffage') return 'equipement'
    if (state.objectif === 'renovation_complete') return 'dpe'
    return 'teaser'
  }
  if (state.screen === 'dpe') return 'teaser'
  if (state.screen === 'equipement') return 'age_chaudiere'
  if (state.screen === 'age_chaudiere') return 'teaser'
  return SCREEN_ORDER[Math.min(idx + 1, SCREEN_ORDER.length - 1)]
}

function prevScreen(state: State): ScreenId {
  const idx = SCREEN_ORDER.indexOf(state.screen)
  if (state.screen === 'teaser') {
    if (state.objectif === 'chauffage') return 'age_chaudiere'
    if (state.objectif === 'renovation_complete') return 'dpe'
    return 'urgence'
  }
  if (state.screen === 'age_chaudiere') return 'equipement'
  if (state.screen === 'dpe') return 'urgence'
  if (state.screen === 'equipement') return 'urgence'
  if (state.screen === 'urgence') return 'objectif'
  return SCREEN_ORDER[Math.max(idx - 1, 0)]
}

function screenIndex(screen: ScreenId, objectif?: Objectif): { current: number; total: number } {
  const order = SCREEN_ORDER.filter((s) => {
    if (s === 'equipement') return objectif === 'chauffage'
    if (s === 'age_chaudiere') return objectif === 'chauffage'
    if (s === 'dpe') return objectif === 'renovation_complete'
    return true
  })
  return { current: order.indexOf(screen) + 1, total: order.length }
}

// ---------- Reducer ----------

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET': {
      const next = { ...state, [action.field]: action.value, error: undefined }
      if (action.field === 'codePostal') {
        const cp = action.value as string
        if (/^\d{5}$/.test(cp)) {
          const dept = deptFromCodePostal(cp)
          const IDF = new Set(['75', '77', '78', '91', '92', '93', '94', '95'])
          next.idf = IDF.has(dept)
        }
      }
      return next
    }
    case 'NEXT_SCREEN':
      return { ...state, screen: nextScreen(state), direction: 1, error: undefined }
    case 'PREV_SCREEN':
      return { ...state, screen: prevScreen(state), direction: -1, error: undefined }
    case 'GOTO':
      return { ...state, screen: action.screen, error: undefined }
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value }
    case 'SET_ERROR':
      return { ...state, error: action.value }
    case 'HYDRATE':
      return { ...action.value, submitting: false, error: undefined }
    default:
      return state
  }
}

// ---------- Persistence ----------

const LS_KEY = 'simulateur-draft-v2'
const TTL_MS = 24 * 60 * 60_000

function loadState(): State | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt: number; state: State }
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      window.localStorage.removeItem(LS_KEY)
      return null
    }
    return parsed.state
  } catch {
    return null
  }
}

function saveState(state: State) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify({ savedAt: Date.now(), state }))
  } catch { /* quota */ }
}

// ---------- Component ----------

export default function StepperV2() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const router = useRouter()
  const hydratedRef = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Hydrate
  useEffect(() => {
    const loaded = loadState()
    if (loaded) dispatch({ type: 'HYDRATE', value: loaded })
    hydratedRef.current = true
    capture(EVENT.SIMULATEUR_STARTED, { version: 'v2', resumed: Boolean(loaded) })
  }, [])

  // Persist
  useEffect(() => {
    if (!hydratedRef.current) return
    saveState(state)
  }, [state])

  // Scroll + track
  useEffect(() => {
    if (!hydratedRef.current) return
    const el = sectionRef.current
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }
    capture(EVENT.SIMULATEUR_STEP_COMPLETED, { screen: state.screen, version: 'v2' })
  }, [state.screen])

  // Auto-advance helper (300ms delay for visual feedback)
  const autoAdvance = useCallback(
    (field: string, value: unknown) => {
      dispatch({ type: 'SET', field, value })
      setTimeout(() => dispatch({ type: 'NEXT_SCREEN' }), 300)
    },
    []
  )

  // Build estimate payload for teaser
  const estimatePayload = useMemo(() => {
    if (!state.objectif || !state.surfaceTranche || !state.revenuCategorie) return null
    const deduced = deduceSimulationParams({
      objectif: state.objectif,
      surfaceTranche: state.surfaceTranche,
      residencePrincipale: state.residencePrincipale ?? true,
      equipementActuel: state.equipementActuel,
    })
    return {
      situation: {
        typeLogement: state.typeLogement ?? 'maison',
        residencePrincipale: state.residencePrincipale ?? true,
        anciennete: state.anciennete ?? 'plus_15_ans' as const,
        surface: deduced.surface,
        codePostal: state.codePostal || '75001',
        foyer: state.foyer ?? 1,
        rfr: state.rfrMilieu ?? 20000,
      },
      projet: {
        parcours: deduced.parcours,
        gestes: deduced.gestes,
        sautsDpe: state.sautsDpe ?? deduced.sautsDpe,
        coupDePouce: deduced.coupDePouce,
        equipementActuel: deduced.equipementActuel,
      },
      budget: { budgetHt: deduced.budgetHt },
    }
  }, [
    state.objectif,
    state.surfaceTranche,
    state.revenuCategorie,
    state.residencePrincipale,
    state.anciennete,
    state.equipementActuel,
    state.sautsDpe,
    state.typeLogement,
    state.codePostal,
    state.foyer,
    state.rfrMilieu,
  ])

  // Submit
  async function handleSubmit() {
    if (!estimatePayload) return
    dispatch({ type: 'SET_SUBMITTING', value: true })

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const payload = {
      ...estimatePayload,
      coordonnees: {
        prenom: state.prenom,
        nom: '',
        email: state.email,
        telephone: state.telephone,
        consentRgpd: state.consentRgpd,
        consentMajorite: state.consentMajorite,
        consentDemarchage: state.consentDemarchage,
      },
      attribution: {
        utm_source: params?.get('utm_source') || undefined,
        utm_medium: params?.get('utm_medium') || undefined,
        utm_campaign: params?.get('utm_campaign') || undefined,
        utm_term: params?.get('utm_term') || undefined,
        utm_content: params?.get('utm_content') || undefined,
        referrer: typeof document !== 'undefined' ? document.referrer?.slice(0, 500) || undefined : undefined,
      },
      scoring: {
        urgenceProjet: state.urgenceProjet || undefined,
        ageChaudiere: state.ageChaudiere || undefined,
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
        dispatch({
          type: 'SET_ERROR',
          value: typeof (err as { error?: unknown }).error === 'string'
            ? (err as { error: string }).error
            : 'Erreur lors de la soumission',
        })
        dispatch({ type: 'SET_SUBMITTING', value: false })
        return
      }
      const { publicId } = (await res.json()) as { publicId: string }
      if (typeof window !== 'undefined') window.localStorage.removeItem(LS_KEY)
      capture(EVENT.SIMULATEUR_SUBMITTED, {
        version: 'v2',
        objectif: state.objectif,
        code_postal: state.codePostal,
      })
      router.push(`/simulateur-aides-renovation/resultat/${publicId}`)
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        value: err instanceof Error ? err.message : 'Erreur réseau. Réessayez.',
      })
      dispatch({ type: 'SET_SUBMITTING', value: false })
    }
  }

  const { current, total } = screenIndex(state.screen, state.objectif)
  const progressPct = Math.round((current / total) * 100)
  const showBack = state.screen !== 'logement'

  return (
    <section
      ref={sectionRef}
      aria-labelledby="stepper-v2-title"
      className="mx-auto max-w-lg scroll-mt-16"
    >
      <h2 id="stepper-v2-title" className="sr-only">
        Simulateur d&apos;aides en {total} étapes
      </h2>

      {/* Progress bar */}
      {state.screen !== 'teaser' && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span>{current}/{total}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {/* Screens */}
      <ScreenTransition screenKey={state.screen} direction={state.direction}>
        {state.screen === 'logement' && (
          <ScreenLogement
            typeLogement={state.typeLogement}
            surfaceTranche={state.surfaceTranche}
            onChangeType={(v) => dispatch({ type: 'SET', field: 'typeLogement', value: v })}
            onChangeSurface={(v) => dispatch({ type: 'SET', field: 'surfaceTranche', value: v })}
            onComplete={() => dispatch({ type: 'NEXT_SCREEN' })}
          />
        )}
        {state.screen === 'code_postal' && (
          <ScreenCodePostal
            value={state.codePostal}
            onChange={(v) => dispatch({ type: 'SET', field: 'codePostal', value: v })}
            onNext={() => dispatch({ type: 'NEXT_SCREEN' })}
            detectedCity={
              /^\d{5}$/.test(state.codePostal)
                ? `${state.idf ? 'Île-de-France' : 'Hors Île-de-France'} — ${deptFromCodePostal(state.codePostal)}`
                : undefined
            }
          />
        )}
        {state.screen === 'eligibilite' && (
          <ScreenEligibilite
            residencePrincipale={state.residencePrincipale}
            anciennete={state.anciennete}
            onChangeResidence={(v) => dispatch({ type: 'SET', field: 'residencePrincipale', value: v })}
            onChangeAnciennete={(v) => dispatch({ type: 'SET', field: 'anciennete', value: v })}
            onComplete={() => dispatch({ type: 'NEXT_SCREEN' })}
          />
        )}
        {state.screen === 'foyer' && (
          <ScreenFoyer
            value={state.foyer}
            onSelect={(v) => autoAdvance('foyer', v)}
          />
        )}
        {state.screen === 'revenus' && (
          <ScreenRevenus
            foyer={state.foyer ?? 1}
            idf={state.idf}
            value={state.revenuCategorie}
            onSelect={(cat, rfr) => {
              dispatch({ type: 'SET', field: 'revenuCategorie', value: cat })
              dispatch({ type: 'SET', field: 'rfrMilieu', value: rfr })
              setTimeout(() => dispatch({ type: 'NEXT_SCREEN' }), 300)
            }}
          />
        )}
        {state.screen === 'objectif' && (
          <ScreenObjectif
            value={state.objectif}
            onSelect={(v) => autoAdvance('objectif', v)}
          />
        )}
        {state.screen === 'dpe' && (
          <ScreenDpe
            value={state.sautsDpe}
            onSelect={(v) => autoAdvance('sautsDpe', v)}
          />
        )}
        {state.screen === 'urgence' && (
          <ScreenUrgence
            value={state.urgenceProjet}
            onSelect={(v) => autoAdvance('urgenceProjet', v)}
          />
        )}
        {state.screen === 'equipement' && (
          <ScreenEquipement
            value={state.equipementActuel}
            onSelect={(v) => autoAdvance('equipementActuel', v)}
          />
        )}
        {state.screen === 'age_chaudiere' && (
          <ScreenAgeChaudiere
            value={state.ageChaudiere}
            onSelect={(v) => autoAdvance('ageChaudiere', v)}
          />
        )}
        {state.screen === 'teaser' && estimatePayload && (
          <ScreenTeaser
            estimatePayload={estimatePayload}
            equipementActuel={state.equipementActuel}
            parcours={estimatePayload.projet && typeof estimatePayload.projet === 'object' ? (estimatePayload.projet as Record<string, unknown>).parcours as string : undefined}
            budgetHt={estimatePayload.budget && typeof estimatePayload.budget === 'object' ? (estimatePayload.budget as Record<string, unknown>).budgetHt as number : undefined}
            onNext={() => dispatch({ type: 'NEXT_SCREEN' })}
          />
        )}
        {state.screen === 'contact' && (
          <ScreenContact
            prenom={state.prenom}
            telephone={state.telephone}
            email={state.email}
            consentRgpd={state.consentRgpd}
            consentMajorite={state.consentMajorite}
            consentDemarchage={state.consentDemarchage}
            submitting={state.submitting}
            onChangePrenom={(v) => dispatch({ type: 'SET', field: 'prenom', value: v })}
            onChangeTelephone={(v) => dispatch({ type: 'SET', field: 'telephone', value: v })}
            onChangeEmail={(v) => dispatch({ type: 'SET', field: 'email', value: v })}
            onChangeConsent={(rgpd, majorite) => {
              dispatch({ type: 'SET', field: 'consentRgpd', value: rgpd })
              dispatch({ type: 'SET', field: 'consentMajorite', value: majorite })
            }}
            onChangeDemarchage={(v) => dispatch({ type: 'SET', field: 'consentDemarchage', value: v })}
            onSubmit={handleSubmit}
          />
        )}
      </ScreenTransition>

      {/* Back button */}
      {showBack && state.screen !== 'teaser' && state.screen !== 'contact' && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => dispatch({ type: 'PREV_SCREEN' })}
            className="text-sm text-charcoal-500 underline hover:text-charcoal-700"
          >
            Retour
          </button>
        </div>
      )}
    </section>
  )
}
