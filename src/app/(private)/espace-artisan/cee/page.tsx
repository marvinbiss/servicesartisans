/**
 * /espace-artisan/cee — Dashboard CEE artisan (V3 artisan-first).
 *
 * V3 enrichissement :
 *   - KPI cards en haut : draft | soumis | validés | commissions cumulées
 *   - Alert si certification expirée ou RGE invalide
 *   - Filtres status + recherche client
 *   - Empty state + CTA "Créer un dossier"
 *   - Liste dossiers via DossierListCard (réutilisé)
 *
 * Server Component — Auth + résolution provider + fetch parallèle.
 * UI light-only, zéro dark:*.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Info,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  Euro,
  ShieldAlert,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/server'
import { listCeeDossiersForProviderV3, type CeeDossierV3Row } from '@/lib/cee/dossiers-v3'
import type { CeeDossierV3Status } from '@/lib/cee/dossier-transitions'
import { extractScoreFromMetadata } from '@/lib/cee/scoring'
import { logger } from '@/lib/logger'
import CeeDashboardFilters from '@/components/cee-artisan/CeeDashboardFilters'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Mes dossiers CEE — Espace artisan',
  robots: { index: false, follow: false },
}

function formatEuros(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Statuts V3 considérés "en cours" (post-soumission, pré-validation) */
const SUBMITTED_STATUSES: CeeDossierV3Status[] = [
  'submitted_by_artisan',
  'qa_pending',
  'qa_approved',
  'qa_rejected',
  'deposited',
]
/** Statuts V3 considérés "validés" (PNCEE OK ou versement effectué) */
const VALIDATED_STATUSES: CeeDossierV3Status[] = [
  'validated_pncee',
  'paid_client',
  'commission_due',
  'commission_paid',
]

export default async function EspaceArtisanCeePage() {
  const supabase = await createClient()

  // --- Auth ---------------------------------------------------------------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/connexion?redirect=/espace-artisan/cee')
  }

  // --- Résolution artisan -------------------------------------------------
  const { data: provider } = await supabase
    .from('providers')
    .select('id, name, is_rge, rge_qualifications')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) {
    return (
      <div className="min-h-screen bg-sand-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-red-700">Accès réservé</h1>
            <p className="mt-2 text-sm text-red-600">
              Aucun profil artisan n'est associé à votre compte.
            </p>
            <Link
              href="/espace-artisan"
              className="mt-4 inline-block rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              Retour à l'espace artisan
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const providerRow = provider as {
    id: string
    name: string | null
    is_rge: boolean | null
    rge_qualifications: Array<{ date_fin?: string; code?: string }> | null
  }

  // --- Vérification RGE expirée -------------------------------------------
  const today = new Date()
  const rgeExpired =
    Array.isArray(providerRow.rge_qualifications) &&
    providerRow.rge_qualifications.length > 0 &&
    providerRow.rge_qualifications.every((q) => {
      if (!q.date_fin) return false
      return new Date(q.date_fin) < today
    })
  const rgeInvalid = !providerRow.is_rge

  // --- Fetch dossiers + commissions en parallèle --------------------------
  let dossiers: CeeDossierV3Row[] = []
  let loadError = false
  let commissionsTotal = 0

  try {
    const [raw, commResult] = await Promise.all([
      listCeeDossiersForProviderV3(supabase, providerRow.id),
      supabase
        .from('cee_commissions')
        .select('amount_cts, status, cee_artisan_partners!inner(provider_id)')
        .eq('cee_artisan_partners.provider_id', providerRow.id),
    ])

    dossiers = raw.sort((a, b) => {
      const scoreA = extractScoreFromMetadata(a.metadata).score
      const scoreB = extractScoreFromMetadata(b.metadata).score
      return scoreB - scoreA
    })

    if (commResult.data) {
      for (const c of commResult.data) {
        const amountCts = (c as { amount_cts: number }).amount_cts ?? 0
        commissionsTotal += amountCts / 100
      }
    }
  } catch (error) {
    loadError = true
    logger.warn('espace-artisan-cee-dashboard failed', {
      action: 'espace-artisan-cee-dashboard',
      providerId: providerRow.id,
      error: error instanceof Error ? error.message : 'unknown',
    })
  }

  // --- KPIs (V3 status enum — cf. dossier-transitions.ts / migration 433) ---
  const draftCount = dossiers.filter((d) => d.status === 'draft').length
  const submittedCount = dossiers.filter((d) => SUBMITTED_STATUSES.includes(d.status)).length
  const paidCount = dossiers.filter((d) => VALIDATED_STATUSES.includes(d.status)).length

  const kpiCards = [
    {
      label: 'Brouillons',
      value: String(draftCount),
      icon: FileText,
      color: 'bg-sand-100 text-charcoal-700',
      iconColor: 'text-charcoal-500',
    },
    {
      label: 'En cours',
      value: String(submittedCount),
      icon: Clock,
      color: 'bg-primary-50 text-primary-700',
      iconColor: 'text-primary-500',
    },
    {
      label: 'Validés',
      value: String(paidCount),
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-800',
      iconColor: 'text-green-600',
    },
    {
      label: 'Commissions cumulées',
      value: formatEuros(commissionsTotal),
      icon: Euro,
      color: 'bg-secondary-50 text-charcoal-800',
      iconColor: 'text-secondary-500',
    },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Dossiers CEE' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Mes dossiers CEE</h1>
              <p className="mt-1 text-primary-100">
                Certificats d'Économies d'Énergie — programme SA Energy
              </p>
            </div>
            {/* RGE invalide/expiré : un dossier CEE déposé sans qualif RGE
                valide est rejeté par l'obligé. On désactive donc la création
                à la source (parité avec le guard server-side de cee/nouveau). */}
            {rgeInvalid || rgeExpired ? (
              <span
                aria-disabled="true"
                title={
                  rgeExpired
                    ? 'Renouvelez votre qualification RGE pour créer un dossier'
                    : 'Une qualification RGE valide est requise pour créer un dossier'
                }
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white/60 px-5 py-2.5 text-sm font-semibold text-primary-600/60 shadow-md"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Créer un dossier
              </span>
            ) : (
              <Link
                href="/espace-artisan/cee/nouveau"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-md motion-safe:transition-all motion-safe:hover:-translate-y-0.5 hover:bg-sand-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 motion-safe:active:translate-y-0"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Créer un dossier
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Alerts RGE */}
        {(rgeInvalid || rgeExpired) && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {rgeExpired ? 'Certification RGE expirée' : 'Certification RGE invalide'}
              </p>
              <p className="mt-1 text-sm text-red-700">
                {rgeExpired
                  ? 'Votre qualification RGE est expirée. Renouvelez-la pour pouvoir soumettre de nouveaux dossiers.'
                  : 'Votre profil ne dispose pas de qualification RGE valide. Contactez votre organisme certificateur.'}
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className={`rounded-xl border border-sand-300 bg-white p-5 ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    {card.label}
                  </p>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} aria-hidden="true" />
                </div>
                <p className="mt-2 text-2xl font-bold">{card.value}</p>
              </div>
            )
          })}
        </section>

        {/* Liste dossiers */}
        <section aria-label="Liste des dossiers CEE" data-testid="cee-dossier-list-section">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-charcoal-900">
              {dossiers.length > 0
                ? `${dossiers.length} dossier${dossiers.length > 1 ? 's' : ''}`
                : 'Dossiers'}
            </h2>
          </div>

          {/* Filtres client — Client Component isolé */}
          <CeeDashboardFilters dossiers={dossiers} />
        </section>

        {loadError && (
          <div
            role="alert"
            data-testid="cee-dossier-list-error"
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-red-800">
              Impossible de charger les dossiers
            </h2>
            <p className="mt-1 text-sm text-red-700">
              Réessayez dans quelques instants. Si le problème persiste, contactez notre support.
            </p>
          </div>
        )}

        {!loadError && dossiers.length === 0 && (
          <div className="rounded-xl border border-dashed border-sand-400 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <FileText className="h-7 w-7 text-primary-500" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-charcoal-900">
              Aucun dossier CEE pour le moment
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-charcoal-500">
              Créez votre premier dossier pour commencer à valoriser vos chantiers éligibles CEE. SA
              Energy s'occupe du montage complet.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/espace-artisan/cee/nouveau"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md motion-safe:transition-all motion-safe:hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 motion-safe:active:translate-y-0"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Créer un dossier
              </Link>
              <div className="inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-600">
                <Info className="h-4 w-4" aria-hidden="true" />
                Commission versée après validation PNCEE
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
