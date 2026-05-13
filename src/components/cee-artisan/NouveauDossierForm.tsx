'use client'

/**
 * NouveauDossierForm — formulaire multi-étapes de création de dossier CEE (V3).
 *
 * Étapes :
 *   1. Client (nom, email, téléphone, adresse, code postal)
 *   2. Chantier (type logement, surface, année construction, zone climatique auto)
 *   3. Fiche CEE (opération filtrée par qualifications artisan, paramètres techniques)
 *   4. Aperçu estimation (kWhc, prime, commission) + soumission
 *
 * API : POST /api/cee/dossiers → redirect /espace-artisan/cee/[id]
 *
 * WCAG 2.1 AA : labels, aria-describedby sur erreurs, aria-live sur messages.
 * 8 states implémentés pour tous les interactifs.
 * Light-only, zéro dark:*.
 */

import { useState, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  Home,
  Zap,
  Eye,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Info,
} from 'lucide-react'
import { postalCodeToClimateZone } from '@/lib/cee/climate-zones'

// ── Types locaux ────────────────────────────────────────────────────────────

interface RgeQualification {
  code?: string
  date_fin?: string
}

interface NouveauDossierFormProps {
  providerId: string
  providerName: string
  rgeQualifications: RgeQualification[]
  isCertified: boolean
}

interface ClientData {
  nom: string
  email: string
  phone: string
  adresse: string
  codePostal: string
}

interface ChantierData {
  typeLogement: 'maison' | 'appartement' | ''
  surface: string
  anneeConstruction: string
  precarite: boolean
}

interface FicheData {
  operationCode: string
  parametresTechniques: Record<string, string>
}

type StepId = 'client' | 'chantier' | 'fiche' | 'apercu'

const STEPS: Array<{ id: StepId; label: string; icon: typeof User }> = [
  { id: 'client', label: 'Client', icon: User },
  { id: 'chantier', label: 'Chantier', icon: Home },
  { id: 'fiche', label: 'Fiche CEE', icon: Zap },
  { id: 'apercu', label: 'Aperçu', icon: Eye },
]

// ── Operations CEE disponibles par qualification ─────────────────────────────

const CEE_OPERATIONS_BY_QUAL: Record<
  string,
  Array<{
    code: string
    label: string
    params: Array<{ key: string; label: string; unit: string }>
  }>
> = {
  QualiPAC: [
    {
      code: 'BAR-TH-171',
      label: 'Pompe à chaleur air/eau',
      params: [
        { key: 'etas', label: 'ETAS (%)', unit: '%' },
        { key: 'cop', label: 'COP', unit: '' },
      ],
    },
    {
      code: 'BAR-TH-159',
      label: 'Pompe à chaleur air/air',
      params: [{ key: 'cop', label: 'COP', unit: '' }],
    },
  ],
  Qualibat: [
    {
      code: 'BAR-EN-101',
      label: 'Isolation combles perdus',
      params: [{ key: 'resistance', label: 'Résistance thermique R (m².K/W)', unit: 'm².K/W' }],
    },
    {
      code: 'BAR-EN-102',
      label: 'Isolation plancher bas',
      params: [{ key: 'resistance', label: 'Résistance thermique R (m².K/W)', unit: 'm².K/W' }],
    },
    {
      code: 'BAR-EN-103',
      label: 'Isolation murs par l’extérieur',
      params: [
        { key: 'resistance', label: 'Résistance thermique R (m².K/W)', unit: 'm².K/W' },
        { key: 'classe_ite', label: 'Classe ITE', unit: '' },
      ],
    },
  ],
  QualiBois: [
    {
      code: 'BAR-TH-112',
      label: 'Appareil de chauffage au bois — insert',
      params: [{ key: 'rendement', label: 'Rendement (%)', unit: '%' }],
    },
  ],
  Qualifelec: [
    {
      code: 'BAR-TH-175',
      label: 'Chauffe-eau thermodynamique',
      params: [{ key: 'cop', label: 'COP', unit: '' }],
    },
  ],
}

// Mapping qualification code prefix → famille
function getQualFamille(code: string): string | null {
  if (code.startsWith('QualiPAC') || code === 'QualiPAC') return 'QualiPAC'
  if (code.startsWith('Qualibat')) return 'Qualibat'
  if (code.startsWith('QualiBois')) return 'QualiBois'
  if (code.startsWith('Qualifelec')) return 'Qualifelec'
  if (code.startsWith('QualiSol') || code.startsWith('QualiPV') || code.startsWith('Qualit'))
    return 'Qualibat'
  return null
}

// ── Helpers ────────────────────────────────────────────────────────────────

function estimatePrime(
  operationCode: string,
  surface: number,
  precarite: boolean,
  zoneClimatique: string | null
): { kwhc: number; prime: number; commission: number } | null {
  // Forfaits simplifiés (en production, appel à l'API /api/cee/estimate)
  const FORFAITS: Record<string, { kwhc_base: number; prime_base: number }> = {
    'BAR-TH-171': { kwhc_base: 30000, prime_base: 800 },
    'BAR-TH-159': { kwhc_base: 18000, prime_base: 450 },
    'BAR-EN-101': { kwhc_base: 1500, prime_base: 12 },
    'BAR-EN-102': { kwhc_base: 1200, prime_base: 10 },
    'BAR-EN-103': { kwhc_base: 2500, prime_base: 20 },
    'BAR-TH-112': { kwhc_base: 15000, prime_base: 600 },
    'BAR-TH-175': { kwhc_base: 20000, prime_base: 700 },
  }

  const forfait = FORFAITS[operationCode]
  if (!forfait) return null

  const zoneMultiplier = zoneClimatique === 'H1' ? 1.2 : zoneClimatique === 'H2' ? 1.0 : 0.8
  const precariteMultiplier = precarite ? 1.5 : 1.0
  const surfaceMultiplier = operationCode.startsWith('BAR-EN') ? surface / 50 : 1

  const kwhc = Math.round(
    forfait.kwhc_base * zoneMultiplier * precariteMultiplier * surfaceMultiplier
  )
  const prime = Math.round(
    forfait.prime_base * zoneMultiplier * precariteMultiplier * surfaceMultiplier
  )
  const commission = Math.round(prime * 0.3) // 30% commission artisan (indicatif)

  return { kwhc, prime, commission }
}

function formatEuros(v: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}

// ── Composant principal ──────────────────────────────────────────────────────

export default function NouveauDossierForm({
  providerId,
  rgeQualifications,
  isCertified,
}: NouveauDossierFormProps) {
  const router = useRouter()
  const formId = useId()

  const [step, setStep] = useState<StepId>('client')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [clientData, setClientData] = useState<ClientData>({
    nom: '',
    email: '',
    phone: '',
    adresse: '',
    codePostal: '',
  })
  const [clientErrors, setClientErrors] = useState<Partial<ClientData>>({})

  const [chantierData, setChantierData] = useState<ChantierData>({
    typeLogement: '',
    surface: '',
    anneeConstruction: '',
    precarite: false,
  })
  const [chantierErrors, setChantierErrors] = useState<Partial<Record<keyof ChantierData, string>>>(
    {}
  )

  const [ficheData, setFicheData] = useState<FicheData>({
    operationCode: '',
    parametresTechniques: {},
  })
  const [ficheErrors, setFicheErrors] = useState<Partial<Record<string, string>>>({})

  // Zone climatique auto déduite du CP
  const zoneClimatique =
    clientData.codePostal.length >= 5
      ? (postalCodeToClimateZone(clientData.codePostal) ?? null)
      : null

  // Opérations disponibles selon les qualifications artisan
  const availableOps = useMemo_ops(rgeQualifications)

  // Estimation CEE
  const estimation =
    ficheData.operationCode && chantierData.surface && chantierData.typeLogement
      ? estimatePrime(
          ficheData.operationCode,
          parseFloat(chantierData.surface) || 0,
          chantierData.precarite,
          zoneClimatique
        )
      : null

  // ── Validation par étape ─────────────────────────────────────────────────

  function validateClient(): boolean {
    const errors: Partial<ClientData> = {}
    if (!clientData.nom.trim()) errors.nom = 'Le nom est requis.'
    if (!clientData.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(clientData.email))
      errors.email = 'Adresse email invalide.'
    if (
      !clientData.phone.trim() ||
      !/^(\+33|0)[1-9][\d\s]{7,}$/.test(clientData.phone.replace(/\s/g, ''))
    )
      errors.phone = 'Numéro de téléphone invalide.'
    if (!clientData.adresse.trim()) errors.adresse = 'L’adresse est requise.'
    if (!clientData.codePostal.trim() || !/^\d{5}$/.test(clientData.codePostal))
      errors.codePostal = 'Code postal invalide (5 chiffres).'
    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  function validateChantier(): boolean {
    const errors: Partial<Record<keyof ChantierData, string>> = {}
    if (!chantierData.typeLogement) errors.typeLogement = 'Le type de logement est requis.'
    const s = parseFloat(chantierData.surface)
    if (!chantierData.surface || isNaN(s) || s < 9 || s > 10000)
      errors.surface = 'Surface invalide (entre 9 et 10 000 m²).'
    const yr = parseInt(chantierData.anneeConstruction, 10)
    if (!chantierData.anneeConstruction || isNaN(yr) || yr < 1900 || yr > new Date().getFullYear())
      errors.anneeConstruction = 'Année de construction invalide.'
    setChantierErrors(errors)
    return Object.keys(errors).length === 0
  }

  function validateFiche(): boolean {
    const errors: Partial<Record<string, string>> = {}
    if (!ficheData.operationCode) errors.operationCode = 'Veuillez sélectionner une opération CEE.'
    const op = availableOps.find((o) => o.code === ficheData.operationCode)
    if (op) {
      for (const param of op.params) {
        const val = ficheData.parametresTechniques[param.key]
        if (!val || !val.trim()) errors[param.key] = `${param.label} est requis.`
      }
    }
    setFicheErrors(errors)
    return Object.keys(errors).length === 0
  }

  function goToStep(target: StepId) {
    const order: StepId[] = ['client', 'chantier', 'fiche', 'apercu']
    const currentIdx = order.indexOf(step)
    const targetIdx = order.indexOf(target)
    if (targetIdx < currentIdx) {
      setStep(target)
      return
    }
    if (step === 'client' && !validateClient()) return
    if (step === 'chantier' && !validateChantier()) return
    if (step === 'fiche' && !validateFiche()) return
    setStep(target)
  }

  function nextStep() {
    const order: StepId[] = ['client', 'chantier', 'fiche', 'apercu']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) goToStep(order[idx + 1])
  }

  function prevStep() {
    const order: StepId[] = ['client', 'chantier', 'fiche', 'apercu']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  // ── Soumission ────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const body = {
        provider_id: providerId,
        operation_code: ficheData.operationCode,
        postal_code: clientData.codePostal,
        zone_climatique: zoneClimatique,
        precarite: chantierData.precarite,
        kwhc_estime: estimation?.kwhc ?? null,
        prime_estimee_eur: estimation?.prime ?? null,
        metadata: {
          _actor_type: 'artisan',
          client: {
            nom: clientData.nom,
            email: clientData.email,
            phone: clientData.phone,
            adresse: clientData.adresse,
          },
          chantier: {
            typeLogement: chantierData.typeLogement,
            surface: parseFloat(chantierData.surface) || null,
            anneeConstruction: parseInt(chantierData.anneeConstruction, 10) || null,
          },
          parametresTechniques: ficheData.parametresTechniques,
        },
      }

      const res = await fetch('/api/cee/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
        throw new Error(data.error ?? `Erreur serveur (${res.status})`)
      }

      const created = (await res.json()) as { id?: string }
      if (!created.id) throw new Error('Réponse serveur invalide.')
      router.push(`/espace-artisan/cee/${created.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setSubmitting(false)
    }
  }

  // ── Bloc blocage formation ────────────────────────────────────────────────

  if (!isCertified) {
    return (
      <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-amber-800">Formation obligatoire requise</h2>
        <p className="mt-2 text-sm text-amber-700">
          Vous devez compléter la formation CEE et obtenir votre certification (score ≥ 8/10) avant
          de pouvoir créer un dossier.
        </p>
        <Link
          href="/espace-artisan/cee/formation"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-trancharcoal-y-0.5 hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:trancharcoal-y-0"
        >
          Accéder à la formation
        </Link>
      </div>
    )
  }

  // ── Stepper header ────────────────────────────────────────────────────────

  const stepOrder: StepId[] = ['client', 'chantier', 'fiche', 'apercu']
  const currentIdx = stepOrder.indexOf(step)

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <nav aria-label="Étapes du formulaire" className="flex items-center justify-between">
        {STEPS.map(({ id, label, icon: Icon }, idx) => {
          const isActive = id === step
          const isDone = idx < currentIdx
          return (
            <div key={id} className="flex flex-1 flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => goToStep(id)}
                disabled={idx > currentIdx + 1}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Étape ${idx + 1} : ${label}${isDone ? ' (complétée)' : isActive ? ' (en cours)' : ''}`}
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
                  isDone
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : isActive
                      ? 'border-primary-500 bg-white text-primary-600 shadow-sm'
                      : 'border-sand-300 bg-white text-charcoal-400',
                  idx > currentIdx + 1 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                ].join(' ')}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <span
                className={`hidden text-xs sm:block font-medium ${
                  isActive ? 'text-primary-600' : isDone ? 'text-primary-400' : 'text-charcoal-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* Panneau actif */}
      <div id={formId} className="rounded-xl border border-sand-300 bg-white p-6">
        {/* ─ Étape 1 : Client ─────────────────────────────────────────── */}
        {step === 'client' && (
          <fieldset>
            <legend className="mb-5 text-lg font-semibold text-charcoal-900">
              Informations client
            </legend>
            <div className="space-y-4">
              <FormField label="Nom complet" id="client-nom" required error={clientErrors.nom}>
                <input
                  id="client-nom"
                  type="text"
                  autoComplete="name"
                  value={clientData.nom}
                  onChange={(e) => setClientData((p) => ({ ...p, nom: e.target.value }))}
                  aria-describedby={clientErrors.nom ? 'client-nom-error' : undefined}
                  aria-invalid={!!clientErrors.nom}
                  className={inputCx(!!clientErrors.nom)}
                  placeholder="Jean Dupont"
                />
              </FormField>

              <FormField
                label="Adresse email"
                id="client-email"
                required
                error={clientErrors.email}
              >
                <input
                  id="client-email"
                  type="email"
                  autoComplete="email"
                  value={clientData.email}
                  onChange={(e) => setClientData((p) => ({ ...p, email: e.target.value }))}
                  aria-describedby={clientErrors.email ? 'client-email-error' : undefined}
                  aria-invalid={!!clientErrors.email}
                  className={inputCx(!!clientErrors.email)}
                  placeholder="jean.dupont@email.fr"
                />
              </FormField>

              <FormField label="Téléphone" id="client-phone" required error={clientErrors.phone}>
                <input
                  id="client-phone"
                  type="tel"
                  autoComplete="tel"
                  value={clientData.phone}
                  onChange={(e) => setClientData((p) => ({ ...p, phone: e.target.value }))}
                  aria-describedby={clientErrors.phone ? 'client-phone-error' : undefined}
                  aria-invalid={!!clientErrors.phone}
                  className={inputCx(!!clientErrors.phone)}
                  placeholder="06 12 34 56 78"
                />
              </FormField>

              <FormField
                label="Adresse du chantier"
                id="client-adresse"
                required
                error={clientErrors.adresse}
              >
                <input
                  id="client-adresse"
                  type="text"
                  autoComplete="street-address"
                  value={clientData.adresse}
                  onChange={(e) => setClientData((p) => ({ ...p, adresse: e.target.value }))}
                  aria-describedby={clientErrors.adresse ? 'client-adresse-error' : undefined}
                  aria-invalid={!!clientErrors.adresse}
                  className={inputCx(!!clientErrors.adresse)}
                  placeholder="12 rue de la Paix"
                />
              </FormField>

              <FormField
                label="Code postal"
                id="client-cp"
                required
                error={clientErrors.codePostal}
                hint={zoneClimatique ? `Zone climatique détectée : ${zoneClimatique}` : undefined}
              >
                <input
                  id="client-cp"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="postal-code"
                  value={clientData.codePostal}
                  onChange={(e) =>
                    setClientData((p) => ({ ...p, codePostal: e.target.value.replace(/\D/g, '') }))
                  }
                  aria-describedby={clientErrors.codePostal ? 'client-cp-error' : undefined}
                  aria-invalid={!!clientErrors.codePostal}
                  className={inputCx(!!clientErrors.codePostal)}
                  placeholder="75011"
                />
              </FormField>
            </div>
          </fieldset>
        )}

        {/* ─ Étape 2 : Chantier ──────────────────────────────────────── */}
        {step === 'chantier' && (
          <fieldset>
            <legend className="mb-5 text-lg font-semibold text-charcoal-900">
              Informations chantier
            </legend>
            <div className="space-y-4">
              <FormField
                label="Type de logement"
                id="chantier-type"
                required
                error={chantierErrors.typeLogement}
              >
                <select
                  id="chantier-type"
                  value={chantierData.typeLogement}
                  onChange={(e) =>
                    setChantierData((p) => ({
                      ...p,
                      typeLogement: e.target.value as 'maison' | 'appartement' | '',
                    }))
                  }
                  aria-invalid={!!chantierErrors.typeLogement}
                  className={inputCx(!!chantierErrors.typeLogement)}
                >
                  <option value="">Sélectionner…</option>
                  <option value="maison">Maison individuelle</option>
                  <option value="appartement">Appartement</option>
                </select>
              </FormField>

              <FormField
                label="Surface habitable (m²)"
                id="chantier-surface"
                required
                error={chantierErrors.surface}
              >
                <input
                  id="chantier-surface"
                  type="number"
                  inputMode="decimal"
                  min={9}
                  max={10000}
                  value={chantierData.surface}
                  onChange={(e) => setChantierData((p) => ({ ...p, surface: e.target.value }))}
                  aria-invalid={!!chantierErrors.surface}
                  className={inputCx(!!chantierErrors.surface)}
                  placeholder="85"
                />
              </FormField>

              <FormField
                label="Année de construction"
                id="chantier-annee"
                required
                error={chantierErrors.anneeConstruction}
                hint="Doit être antérieure à 2 ans pour les fiches BAR-EN"
              >
                <input
                  id="chantier-annee"
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={chantierData.anneeConstruction}
                  onChange={(e) =>
                    setChantierData((p) => ({ ...p, anneeConstruction: e.target.value }))
                  }
                  aria-invalid={!!chantierErrors.anneeConstruction}
                  className={inputCx(!!chantierErrors.anneeConstruction)}
                  placeholder="1985"
                />
              </FormField>

              <div className="flex items-start gap-3">
                <input
                  id="chantier-precarite"
                  type="checkbox"
                  checked={chantierData.precarite}
                  onChange={(e) => setChantierData((p) => ({ ...p, precarite: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-sand-300 text-primary-500 focus:ring-2 focus:ring-primary-400 focus:ring-offset-1"
                />
                <label
                  htmlFor="chantier-precarite"
                  className="text-sm text-charcoal-700 cursor-pointer"
                >
                  Ménage en situation de précarité énergétique
                  <span className="ml-1 text-xs text-charcoal-500">(prime majorée × 1,5)</span>
                </label>
              </div>
            </div>
          </fieldset>
        )}

        {/* ─ Étape 3 : Fiche CEE ──────────────────────────────────────── */}
        {step === 'fiche' && (
          <fieldset>
            <legend className="mb-5 text-lg font-semibold text-charcoal-900">
              Fiche CEE et paramètres techniques
            </legend>
            {availableOps.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  Aucune opération CEE disponible pour vos qualifications RGE actuelles. Contactez
                  SA Energy pour vérifier votre profil.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <FormField
                  label="Opération CEE"
                  id="fiche-operation"
                  required
                  error={ficheErrors.operationCode}
                >
                  <select
                    id="fiche-operation"
                    value={ficheData.operationCode}
                    onChange={(e) =>
                      setFicheData({ operationCode: e.target.value, parametresTechniques: {} })
                    }
                    aria-invalid={!!ficheErrors.operationCode}
                    className={inputCx(!!ficheErrors.operationCode)}
                  >
                    <option value="">Sélectionner une opération…</option>
                    {availableOps.map((op) => (
                      <option key={op.code} value={op.code}>
                        {op.code} — {op.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                {ficheData.operationCode &&
                  (() => {
                    const op = availableOps.find((o) => o.code === ficheData.operationCode)
                    if (!op || op.params.length === 0) return null
                    return (
                      <div className="space-y-4 rounded-lg border border-sand-200 bg-sand-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                          Paramètres techniques — {op.code}
                        </p>
                        {op.params.map((param) => (
                          <FormField
                            key={param.key}
                            label={param.label}
                            id={`param-${param.key}`}
                            required
                            error={ficheErrors[param.key]}
                          >
                            <div className="flex gap-2">
                              <input
                                id={`param-${param.key}`}
                                type="number"
                                inputMode="decimal"
                                value={ficheData.parametresTechniques[param.key] ?? ''}
                                onChange={(e) =>
                                  setFicheData((p) => ({
                                    ...p,
                                    parametresTechniques: {
                                      ...p.parametresTechniques,
                                      [param.key]: e.target.value,
                                    },
                                  }))
                                }
                                aria-invalid={!!ficheErrors[param.key]}
                                className={`${inputCx(!!ficheErrors[param.key])} flex-1`}
                              />
                              {param.unit && (
                                <span className="inline-flex items-center rounded-lg border border-sand-300 bg-sand-100 px-3 text-sm text-charcoal-500">
                                  {param.unit}
                                </span>
                              )}
                            </div>
                          </FormField>
                        ))}
                      </div>
                    )
                  })()}
              </div>
            )}
          </fieldset>
        )}

        {/* ─ Étape 4 : Aperçu ──────────────────────────────────────────── */}
        {step === 'apercu' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-charcoal-900">Aperçu du dossier</h2>

            {/* Récap */}
            <div className="grid gap-4 sm:grid-cols-2">
              <RecapSection title="Client">
                <RecapItem label="Nom" value={clientData.nom} />
                <RecapItem label="Email" value={clientData.email} />
                <RecapItem label="Téléphone" value={clientData.phone} />
                <RecapItem
                  label="Adresse"
                  value={`${clientData.adresse}, ${clientData.codePostal}`}
                />
              </RecapSection>

              <RecapSection title="Chantier">
                <RecapItem
                  label="Type"
                  value={
                    chantierData.typeLogement === 'maison' ? 'Maison individuelle' : 'Appartement'
                  }
                />
                <RecapItem label="Surface" value={`${chantierData.surface} m²`} />
                <RecapItem label="Année construction" value={chantierData.anneeConstruction} />
                <RecapItem label="Zone climatique" value={zoneClimatique ?? '—'} />
                <RecapItem label="Précarité" value={chantierData.precarite ? 'Oui' : 'Non'} />
              </RecapSection>
            </div>

            <RecapSection title="Fiche CEE">
              <RecapItem label="Opération" value={ficheData.operationCode} />
              {Object.entries(ficheData.parametresTechniques).map(([k, v]) => (
                <RecapItem key={k} label={k} value={v} />
              ))}
            </RecapSection>

            {/* Estimation */}
            {estimation ? (
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary-600">
                  Estimation indicative (non contractuelle)
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-charcoal-900">
                      {estimation.kwhc.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-charcoal-500">kWhc cumac</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-charcoal-900">
                      {formatEuros(estimation.prime)}
                    </p>
                    <p className="text-xs text-charcoal-500">Prime CEE client</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatEuros(estimation.commission)}
                    </p>
                    <p className="text-xs text-charcoal-500">Votre commission*</p>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-xs text-charcoal-500">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />* Commission
                  indicative versée après validation PNCEE. Le montant définitif est calculé au
                  dépôt.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-4">
                <p className="text-sm text-charcoal-500">
                  Estimation non disponible pour cette configuration.
                </p>
              </div>
            )}

            {/* Erreur soumission */}
            {submitError && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {step !== 'client' ? (
          <button
            type="button"
            onClick={prevStep}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl border border-sand-300 bg-white px-5 py-2.5 text-sm font-medium text-charcoal-700 transition-all hover:bg-sand-50 hover:border-sand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Précédent
          </button>
        ) : (
          <div />
        )}

        {step !== 'apercu' ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-trancharcoal-y-0.5 hover:bg-primary-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 active:trancharcoal-y-0"
          >
            Suivant
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            aria-busy={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-trancharcoal-y-0.5 hover:bg-primary-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:trancharcoal-y-0"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Création en cours…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Créer le dossier
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Hook-like helper (pas de hook ici — juste useMemo inline) ─────────────────

function useMemo_ops(rgeQualifications: RgeQualification[]): Array<{
  code: string
  label: string
  params: Array<{ key: string; label: string; unit: string }>
}> {
  const today = new Date()
  const validFamilles = new Set<string>()

  for (const q of rgeQualifications) {
    if (!q.code) continue
    if (q.date_fin && new Date(q.date_fin) < today) continue
    const famille = getQualFamille(q.code)
    if (famille) validFamilles.add(famille)
  }

  // Si aucune qualification valide : afficher toutes les ops (dégradé bienveillant)
  if (validFamilles.size === 0) {
    return Object.values(CEE_OPERATIONS_BY_QUAL).flat()
  }

  const ops: Array<{
    code: string
    label: string
    params: Array<{ key: string; label: string; unit: string }>
  }> = []
  for (const famille of Array.from(validFamilles)) {
    const familleOps = CEE_OPERATIONS_BY_QUAL[famille]
    if (familleOps) ops.push(...familleOps)
  }
  return ops
}

// ── Sous-composants ────────────────────────────────────────────────────────

function inputCx(hasError: boolean): string {
  return [
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-charcoal-900',
    'placeholder-charcoal-400 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1',
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
      : 'border-sand-300 hover:border-sand-400 focus:border-primary-400',
  ].join(' ')
}

function FormField({
  label,
  id,
  required,
  error,
  hint,
  children,
}: {
  label: string
  id: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-charcoal-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-charcoal-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

function RecapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-sand-200 bg-sand-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
        {title}
      </p>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  )
}

function RecapItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="shrink-0 font-medium text-charcoal-600 min-w-[120px]">{label} :</dt>
      <dd className="text-charcoal-900 break-all">{value || '—'}</dd>
    </div>
  )
}
