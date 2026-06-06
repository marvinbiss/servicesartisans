'use client'

/**
 * NouveauDossierForm — formulaire multi-étapes de création de dossier CEE (V3).
 *
 * Étapes :
 *   1. Client (identité, contact, adresse + commune INSEE, foyer, revenus)
 *   2. Chantier (type logement, surface, année, énergie remplacée)
 *   3. Fiche CEE + devis (opération, paramètres techniques, montants, dates)
 *   4. Aperçu estimation (prime, commission) + soumission
 *
 * API : POST /api/cee/dossiers (DossierClientInputSchema) → redirect
 * /espace-artisan/cee/[id]. La prime et la commission affichées ici sont
 * INDICATIVES : le snapshot opposable est recalculé côté serveur (bareme.ts)
 * puis au dépôt délégataire.
 *
 * Commune INSEE : résolue via api-adresse.data.gouv.fr (getCommunesByCodePostal)
 * — la FK cee_dossiers.client_commune_insee exige un code du référentiel.
 *
 * WCAG 2.1 AA : labels, aria-describedby sur erreurs, aria-live sur messages.
 * Light-only, zéro dark:*.
 */

import { useState, useId, useEffect } from 'react'
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
import { getCommunesByCodePostal } from '@/lib/api/adresse'

// ── Types locaux ────────────────────────────────────────────────────────────

interface RgeQualification {
  code?: string
  date_fin?: string
}

interface NouveauDossierFormProps {
  rgeQualifications: RgeQualification[]
  isCertified: boolean
  /** Taux de commission effectif du partner (cee_artisan_partners), en %. */
  commissionRate: number
}

interface ClientData {
  nom: string
  prenom: string
  email: string
  phone: string
  adresse: string
  codePostal: string
  communeInsee: string
  communeName: string
  foyerPersonnes: string
  revenusCategorie: '' | 'tres_modeste' | 'modeste' | 'intermediaire' | 'superieur'
}

interface ChantierData {
  typeLogement: 'maison' | 'appartement' | ''
  surface: string
  anneeConstruction: string
  energieRemplacee: string
}

interface FicheData {
  operationCode: string
  parametresTechniques: Record<string, string>
  montantHt: string
  montantTtc: string
  dateDevis: string
  dateChantierPrevue: string
}

interface CommuneOption {
  insee: string
  name: string
}

type StepId = 'client' | 'chantier' | 'fiche' | 'apercu'

const STEPS: Array<{ id: StepId; label: string; icon: typeof User }> = [
  { id: 'client', label: 'Client', icon: User },
  { id: 'chantier', label: 'Chantier', icon: Home },
  { id: 'fiche', label: 'Fiche CEE', icon: Zap },
  { id: 'apercu', label: 'Aperçu', icon: Eye },
]

const REVENUS_OPTIONS: Array<{ value: ClientData['revenusCategorie']; label: string }> = [
  { value: 'tres_modeste', label: 'Très modeste (plafonds ANAH bleu)' },
  { value: 'modeste', label: 'Modeste (plafonds ANAH jaune)' },
  { value: 'intermediaire', label: 'Intermédiaire (plafonds ANAH violet)' },
  { value: 'superieur', label: 'Supérieur (plafonds ANAH rose)' },
]

// ── Operations CEE disponibles par qualification ─────────────────────────────
// Codes alignés sur src/lib/cee/forfaits-cee-2026.ts (source Légifrance) et le
// seed cee_operations_ref (mig 543).

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
      code: 'BAR-TH-129',
      label: 'Pompe à chaleur air/air',
      params: [{ key: 'cop', label: 'COP', unit: '' }],
    },
  ],
  Qualibat: [
    {
      code: 'BAR-EN-101',
      label: 'Isolation combles ou toitures',
      params: [{ key: 'resistance', label: 'Résistance thermique R (m².K/W)', unit: 'm².K/W' }],
    },
    {
      code: 'BAR-EN-102',
      label: 'Isolation des murs',
      params: [
        { key: 'resistance', label: 'Résistance thermique R (m².K/W)', unit: 'm².K/W' },
        { key: 'classe_ite', label: 'Classe ITE', unit: '' },
      ],
    },
    {
      code: 'BAR-EN-103',
      label: 'Isolation d’un plancher',
      params: [{ key: 'resistance', label: 'Résistance thermique R (m².K/W)', unit: 'm².K/W' }],
    },
  ],
  QualiBois: [
    {
      code: 'BAR-TH-112',
      label: 'Appareil de chauffage au bois — insert / poêle',
      params: [{ key: 'rendement', label: 'Rendement (%)', unit: '%' }],
    },
  ],
  Qualifelec: [
    {
      code: 'BAR-TH-148',
      label: 'Chauffe-eau thermodynamique',
      params: [{ key: 'cop', label: 'COP', unit: '' }],
    },
  ],
}

/** Opérations dont le forfait indicatif est exprimé par m² (parité bareme.ts). */
const PER_M2_OPS = new Set(['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'])

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

/**
 * Estimation indicative — mêmes bases que le seed cee_forfaits (mig 543) :
 * zone H1 ×1,2 / H2 ×1,0 / H3 ×0,8 ; précarité (très modeste + modeste) ×1,5 ;
 * forfait par m² pour les BAR-EN. La commission suit la colonne générée DB :
 * montant HT × taux partner.
 */
function estimatePrime(args: {
  operationCode: string
  surface: number
  revenusCategorie: ClientData['revenusCategorie']
  zoneClimatique: string | null
  montantHt: number
  commissionRate: number
}): { kwhc: number; prime: number; commission: number } | null {
  const FORFAITS: Record<string, { kwhc_base: number; prime_base: number }> = {
    'BAR-TH-171': { kwhc_base: 30000, prime_base: 800 },
    'BAR-TH-129': { kwhc_base: 18000, prime_base: 450 },
    'BAR-EN-101': { kwhc_base: 1500, prime_base: 12 },
    'BAR-EN-102': { kwhc_base: 2500, prime_base: 20 },
    'BAR-EN-103': { kwhc_base: 1200, prime_base: 10 },
    'BAR-TH-112': { kwhc_base: 15000, prime_base: 600 },
    'BAR-TH-148': { kwhc_base: 20000, prime_base: 700 },
  }

  const forfait = FORFAITS[args.operationCode]
  if (!forfait) return null

  const zoneMultiplier =
    args.zoneClimatique === 'H1' ? 1.2 : args.zoneClimatique === 'H2' ? 1.0 : 0.8
  const precarite = args.revenusCategorie === 'tres_modeste' || args.revenusCategorie === 'modeste'
  const precariteMultiplier = precarite ? 1.5 : 1.0
  const surfaceMultiplier = PER_M2_OPS.has(args.operationCode) ? args.surface : 1

  const kwhc = Math.round(
    forfait.kwhc_base * zoneMultiplier * (PER_M2_OPS.has(args.operationCode) ? args.surface : 1)
  )
  const prime = Math.round(
    forfait.prime_base * zoneMultiplier * precariteMultiplier * surfaceMultiplier
  )
  const commission =
    args.montantHt > 0 ? Math.round((args.montantHt * args.commissionRate) / 100) : 0

  return { kwhc, prime, commission }
}

function formatEuros(v: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── Composant principal ──────────────────────────────────────────────────────

export default function NouveauDossierForm({
  rgeQualifications,
  isCertified,
  commissionRate,
}: NouveauDossierFormProps) {
  const router = useRouter()
  const formId = useId()

  const [step, setStep] = useState<StepId>('client')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [clientData, setClientData] = useState<ClientData>({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    adresse: '',
    codePostal: '',
    communeInsee: '',
    communeName: '',
    foyerPersonnes: '',
    revenusCategorie: '',
  })
  const [clientErrors, setClientErrors] = useState<Partial<Record<keyof ClientData, string>>>({})

  const [communes, setCommunes] = useState<CommuneOption[]>([])
  const [communesLoading, setCommunesLoading] = useState(false)

  const [chantierData, setChantierData] = useState<ChantierData>({
    typeLogement: '',
    surface: '',
    anneeConstruction: '',
    energieRemplacee: '',
  })
  const [chantierErrors, setChantierErrors] = useState<Partial<Record<keyof ChantierData, string>>>(
    {}
  )

  const [ficheData, setFicheData] = useState<FicheData>({
    operationCode: '',
    parametresTechniques: {},
    montantHt: '',
    montantTtc: '',
    dateDevis: todayIso(),
    dateChantierPrevue: '',
  })
  const [ficheErrors, setFicheErrors] = useState<Partial<Record<string, string>>>({})

  // Zone climatique auto déduite du CP
  const zoneClimatique =
    clientData.codePostal.length >= 5
      ? (postalCodeToClimateZone(clientData.codePostal) ?? null)
      : null

  // Communes du code postal (api-adresse — la FK DB exige un code INSEE valide)
  useEffect(() => {
    let cancelled = false
    if (!/^\d{5}$/.test(clientData.codePostal)) {
      setCommunes([])
      return
    }
    setCommunesLoading(true)
    getCommunesByCodePostal(clientData.codePostal)
      .then((suggestions) => {
        if (cancelled) return
        const options = suggestions.map((s) => ({ insee: s.citycode, name: s.city || s.name }))
        setCommunes(options)
        // Auto-sélection si une seule commune
        if (options.length === 1) {
          setClientData((p) => ({
            ...p,
            communeInsee: options[0].insee,
            communeName: options[0].name,
          }))
        }
      })
      .catch(() => {
        if (!cancelled) setCommunes([])
      })
      .finally(() => {
        if (!cancelled) setCommunesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientData.codePostal])

  // Opérations disponibles selon les qualifications artisan
  const availableOps = useMemo_ops(rgeQualifications)

  // Estimation CEE
  const estimation = ficheData.operationCode
    ? estimatePrime({
        operationCode: ficheData.operationCode,
        surface: parseFloat(chantierData.surface) || 0,
        revenusCategorie: clientData.revenusCategorie,
        zoneClimatique,
        montantHt: parseFloat(ficheData.montantHt) || 0,
        commissionRate,
      })
    : null

  // ── Validation par étape ─────────────────────────────────────────────────

  function validateClient(): boolean {
    const errors: Partial<Record<keyof ClientData, string>> = {}
    if (!clientData.nom.trim()) errors.nom = 'Le nom est requis.'
    if (!clientData.prenom.trim()) errors.prenom = 'Le prénom est requis.'
    if (!clientData.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(clientData.email))
      errors.email = 'Adresse email invalide.'
    if (
      !clientData.phone.trim() ||
      !/^(\+33|0)[1-9]\d{8}$/.test(clientData.phone.replace(/[\s.-]/g, ''))
    )
      errors.phone = 'Numéro de téléphone invalide.'
    if (clientData.adresse.trim().length < 5) errors.adresse = 'L’adresse est requise.'
    if (!clientData.codePostal.trim() || !/^\d{5}$/.test(clientData.codePostal))
      errors.codePostal = 'Code postal invalide (5 chiffres).'
    if (!clientData.communeInsee) errors.communeInsee = 'Veuillez sélectionner la commune.'
    const foyer = parseInt(clientData.foyerPersonnes, 10)
    if (!clientData.foyerPersonnes || isNaN(foyer) || foyer < 1 || foyer > 12)
      errors.foyerPersonnes = 'Nombre de personnes invalide (1 à 12).'
    if (!clientData.revenusCategorie)
      errors.revenusCategorie = 'La catégorie de revenus est requise.'
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
    const ht = parseFloat(ficheData.montantHt)
    if (!ficheData.montantHt || isNaN(ht) || ht <= 0)
      errors.montantHt = 'Montant HT du devis invalide.'
    const ttc = parseFloat(ficheData.montantTtc)
    if (!ficheData.montantTtc || isNaN(ttc) || ttc <= 0)
      errors.montantTtc = 'Montant TTC du devis invalide.'
    if (!errors.montantHt && !errors.montantTtc && ttc < ht)
      errors.montantTtc = 'Le montant TTC doit être supérieur ou égal au HT.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ficheData.dateDevis))
      errors.dateDevis = 'Date du devis requise.'
    if (ficheData.dateChantierPrevue && !/^\d{4}-\d{2}-\d{2}$/.test(ficheData.dateChantierPrevue))
      errors.dateChantierPrevue = 'Date prévisionnelle invalide.'
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
      const op = availableOps.find((o) => o.code === ficheData.operationCode)
      // type_travaux porte le libellé + les paramètres techniques (pas de
      // colonne dédiée — les justificatifs portent le détail réglementaire)
      const paramsSummary = Object.entries(ficheData.parametresTechniques)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')
      const typeTravaux = [op?.label ?? ficheData.operationCode, paramsSummary]
        .filter(Boolean)
        .join(' — ')
        .slice(0, 200)

      const body = {
        operation_code: ficheData.operationCode,
        client: {
          nom: clientData.nom.trim(),
          prenom: clientData.prenom.trim(),
          email: clientData.email.trim(),
          telephone: clientData.phone.trim() || null,
          adresse: clientData.adresse.trim(),
          code_postal: clientData.codePostal,
          commune_insee: clientData.communeInsee,
        },
        foyer_personnes: parseInt(clientData.foyerPersonnes, 10),
        revenus_categorie: clientData.revenusCategorie,
        type_travaux: typeTravaux,
        surface_m2: parseFloat(chantierData.surface) || null,
        annee_construction: parseInt(chantierData.anneeConstruction, 10) || null,
        energie_remplacee: chantierData.energieRemplacee || null,
        montant_ht_eur: parseFloat(ficheData.montantHt),
        montant_ttc_eur: parseFloat(ficheData.montantTtc),
        date_devis: ficheData.dateDevis,
        date_chantier_prevue: ficheData.dateChantierPrevue || null,
      }

      const res = await fetch('/api/cee/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = (await res.json().catch(() => ({}))) as {
        success?: boolean
        data?: { id?: string }
        error?: { code?: string; message?: string }
      }

      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message ?? `Erreur serveur (${res.status})`)
      }

      if (!payload.data?.id) throw new Error('Réponse serveur invalide.')
      router.push(`/espace-artisan/cee/${payload.data.id}`)
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
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:translate-y-0"
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nom" id="client-nom" required error={clientErrors.nom}>
                  <input
                    id="client-nom"
                    type="text"
                    autoComplete="family-name"
                    value={clientData.nom}
                    onChange={(e) => setClientData((p) => ({ ...p, nom: e.target.value }))}
                    aria-describedby={clientErrors.nom ? 'client-nom-error' : undefined}
                    aria-invalid={!!clientErrors.nom}
                    className={inputCx(!!clientErrors.nom)}
                    placeholder="Dupont"
                  />
                </FormField>

                <FormField label="Prénom" id="client-prenom" required error={clientErrors.prenom}>
                  <input
                    id="client-prenom"
                    type="text"
                    autoComplete="given-name"
                    value={clientData.prenom}
                    onChange={(e) => setClientData((p) => ({ ...p, prenom: e.target.value }))}
                    aria-describedby={clientErrors.prenom ? 'client-prenom-error' : undefined}
                    aria-invalid={!!clientErrors.prenom}
                    className={inputCx(!!clientErrors.prenom)}
                    placeholder="Jean"
                  />
                </FormField>
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
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
                      setClientData((p) => ({
                        ...p,
                        codePostal: e.target.value.replace(/\D/g, ''),
                        communeInsee: '',
                        communeName: '',
                      }))
                    }
                    aria-describedby={clientErrors.codePostal ? 'client-cp-error' : undefined}
                    aria-invalid={!!clientErrors.codePostal}
                    className={inputCx(!!clientErrors.codePostal)}
                    placeholder="75011"
                  />
                </FormField>

                <FormField
                  label="Commune"
                  id="client-commune"
                  required
                  error={clientErrors.communeInsee}
                  hint={communesLoading ? 'Recherche des communes…' : undefined}
                >
                  <select
                    id="client-commune"
                    value={clientData.communeInsee}
                    onChange={(e) => {
                      const opt = communes.find((c) => c.insee === e.target.value)
                      setClientData((p) => ({
                        ...p,
                        communeInsee: e.target.value,
                        communeName: opt?.name ?? '',
                      }))
                    }}
                    disabled={communes.length === 0}
                    aria-invalid={!!clientErrors.communeInsee}
                    className={inputCx(!!clientErrors.communeInsee)}
                  >
                    <option value="">
                      {communes.length === 0 ? 'Saisir le code postal…' : 'Sélectionner…'}
                    </option>
                    {communes.map((c) => (
                      <option key={c.insee} value={c.insee}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Personnes au foyer"
                  id="client-foyer"
                  required
                  error={clientErrors.foyerPersonnes}
                >
                  <input
                    id="client-foyer"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={12}
                    value={clientData.foyerPersonnes}
                    onChange={(e) =>
                      setClientData((p) => ({ ...p, foyerPersonnes: e.target.value }))
                    }
                    aria-invalid={!!clientErrors.foyerPersonnes}
                    className={inputCx(!!clientErrors.foyerPersonnes)}
                    placeholder="4"
                  />
                </FormField>

                <FormField
                  label="Catégorie de revenus"
                  id="client-revenus"
                  required
                  error={clientErrors.revenusCategorie}
                  hint="Selon le revenu fiscal de référence du ménage (plafonds ANAH)"
                >
                  <select
                    id="client-revenus"
                    value={clientData.revenusCategorie}
                    onChange={(e) =>
                      setClientData((p) => ({
                        ...p,
                        revenusCategorie: e.target.value as ClientData['revenusCategorie'],
                      }))
                    }
                    aria-invalid={!!clientErrors.revenusCategorie}
                    className={inputCx(!!clientErrors.revenusCategorie)}
                  >
                    <option value="">Sélectionner…</option>
                    {REVENUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
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

              <FormField
                label="Énergie remplacée"
                id="chantier-energie"
                hint="Optionnel — pour les remplacements de chauffage"
              >
                <select
                  id="chantier-energie"
                  value={chantierData.energieRemplacee}
                  onChange={(e) =>
                    setChantierData((p) => ({ ...p, energieRemplacee: e.target.value }))
                  }
                  className={inputCx(false)}
                >
                  <option value="">Aucune / non applicable</option>
                  <option value="fioul">Fioul</option>
                  <option value="gaz">Gaz</option>
                  <option value="electrique">Électrique</option>
                  <option value="charbon">Charbon</option>
                  <option value="bois">Bois</option>
                </select>
              </FormField>
            </div>
          </fieldset>
        )}

        {/* ─ Étape 3 : Fiche CEE + devis ─────────────────────────────── */}
        {step === 'fiche' && (
          <fieldset>
            <legend className="mb-5 text-lg font-semibold text-charcoal-900">
              Fiche CEE, devis et paramètres techniques
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
                      setFicheData((p) => ({
                        ...p,
                        operationCode: e.target.value,
                        parametresTechniques: {},
                      }))
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Montant du devis HT (€)"
                    id="fiche-ht"
                    required
                    error={ficheErrors.montantHt}
                  >
                    <input
                      id="fiche-ht"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={ficheData.montantHt}
                      onChange={(e) => setFicheData((p) => ({ ...p, montantHt: e.target.value }))}
                      aria-invalid={!!ficheErrors.montantHt}
                      className={inputCx(!!ficheErrors.montantHt)}
                      placeholder="8500"
                    />
                  </FormField>

                  <FormField
                    label="Montant du devis TTC (€)"
                    id="fiche-ttc"
                    required
                    error={ficheErrors.montantTtc}
                  >
                    <input
                      id="fiche-ttc"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={ficheData.montantTtc}
                      onChange={(e) => setFicheData((p) => ({ ...p, montantTtc: e.target.value }))}
                      aria-invalid={!!ficheErrors.montantTtc}
                      className={inputCx(!!ficheErrors.montantTtc)}
                      placeholder="8967.50"
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Date du devis"
                    id="fiche-date-devis"
                    required
                    error={ficheErrors.dateDevis}
                  >
                    <input
                      id="fiche-date-devis"
                      type="date"
                      value={ficheData.dateDevis}
                      onChange={(e) => setFicheData((p) => ({ ...p, dateDevis: e.target.value }))}
                      aria-invalid={!!ficheErrors.dateDevis}
                      className={inputCx(!!ficheErrors.dateDevis)}
                    />
                  </FormField>

                  <FormField
                    label="Début de chantier prévu"
                    id="fiche-date-chantier"
                    error={ficheErrors.dateChantierPrevue}
                    hint="Optionnel"
                  >
                    <input
                      id="fiche-date-chantier"
                      type="date"
                      value={ficheData.dateChantierPrevue}
                      onChange={(e) =>
                        setFicheData((p) => ({ ...p, dateChantierPrevue: e.target.value }))
                      }
                      aria-invalid={!!ficheErrors.dateChantierPrevue}
                      className={inputCx(!!ficheErrors.dateChantierPrevue)}
                    />
                  </FormField>
                </div>
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
                <RecapItem label="Nom" value={`${clientData.prenom} ${clientData.nom}`.trim()} />
                <RecapItem label="Email" value={clientData.email} />
                <RecapItem label="Téléphone" value={clientData.phone} />
                <RecapItem
                  label="Adresse"
                  value={`${clientData.adresse}, ${clientData.codePostal} ${clientData.communeName}`}
                />
                <RecapItem label="Foyer" value={`${clientData.foyerPersonnes} personne(s)`} />
                <RecapItem
                  label="Revenus"
                  value={
                    REVENUS_OPTIONS.find((o) => o.value === clientData.revenusCategorie)?.label ??
                    '—'
                  }
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
                <RecapItem label="Énergie remplacée" value={chantierData.energieRemplacee || '—'} />
              </RecapSection>
            </div>

            <RecapSection title="Fiche CEE et devis">
              <RecapItem label="Opération" value={ficheData.operationCode} />
              {Object.entries(ficheData.parametresTechniques).map(([k, v]) => (
                <RecapItem key={k} label={k} value={v} />
              ))}
              <RecapItem
                label="Devis HT"
                value={ficheData.montantHt ? formatEuros(parseFloat(ficheData.montantHt)) : '—'}
              />
              <RecapItem
                label="Devis TTC"
                value={ficheData.montantTtc ? formatEuros(parseFloat(ficheData.montantTtc)) : '—'}
              />
              <RecapItem label="Date devis" value={ficheData.dateDevis} />
              <RecapItem label="Chantier prévu" value={ficheData.dateChantierPrevue || '—'} />
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
                  indicative ({commissionRate} % du devis HT), versée après validation PNCEE. Le
                  montant définitif est calculé au dépôt.
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
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 active:translate-y-0"
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
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:translate-y-0"
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
