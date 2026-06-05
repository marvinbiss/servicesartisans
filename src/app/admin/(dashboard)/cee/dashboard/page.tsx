/**
 * Admin — Dashboard CEE Mandataire
 * ----------------------------------------------------------------------------
 * KPIs temps reel pour piloter le business mandataire CEE.
 * Server Component : toutes les requetes Supabase sont executees cote serveur
 * via service_role (bypass RLS).
 *
 * Auth : `requirePermission('settings', 'read')`.
 */

import { redirect } from 'next/navigation'
import { BarChart3, Zap, Euro, TrendingUp, AlertTriangle, Trophy } from 'lucide-react'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { CeeKpiCard } from '@/components/admin/cee/CeeKpiCard'
import { CeeFunnelChart } from '@/components/admin/cee/CeeFunnelChart'
import { CeeStatusTable, type CeeDossierRow } from '@/components/admin/cee/CeeStatusTable'
import type { CeeDossierStatus } from '@/lib/cee/dossier-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formatte un nombre avec separateur de milliers FR. */
function fmtNum(n: number): string {
  return n.toLocaleString('fr-FR')
}

/** Formatte un montant en euros. */
function fmtEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

// Couleurs du funnel (hexa pour style inline)
const FUNNEL_COLORS: Record<string, string> = {
  brouillon: '#a8a29e', // sand-400
  engagement_signe: '#60a5fa', // primary-400
  travaux_en_cours: '#f59e0b', // amber-500
  depose_delegataire: '#0ea5e9', // sky-500
  valide: '#10b981', // accent-500
}

// Statuts qui comptent comme "en cours" pour le taux de conversion
const ENGAGED_STATUSES: CeeDossierStatus[] = [
  'engagement_signe',
  'travaux_en_cours',
  'travaux_acheves',
  'ah_signee',
  'depose_delegataire',
  'depose_pncee',
  'valide',
]

const CONVERSION_POOL: CeeDossierStatus[] = ['brouillon', ...ENGAGED_STATUSES]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminCeeDashboardPage() {
  const auth = await requirePermission('settings', 'read')
  if (!auth.success) {
    redirect('/admin/connexion')
  }

  const supabase = createAdminClient()

  // -------------------------------------------------------------------------
  // Requetes en parallele (performant, pas de N+1)
  // -------------------------------------------------------------------------
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const [allDossiersRes, recentDossiersRes, stagnantRes, recentTableRes] = await Promise.all([
    // a+b+c+e+f : on recupère tout en une seule requete et on agrège en JS
    supabase.from('cee_dossiers').select('status, kwhc_estime, prime_estimee_eur, operation_code'),

    // d : dossiers crees cette semaine
    supabase
      .from('cee_dossiers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),

    // g : dossiers stagnants (brouillon > 3 jours)
    supabase
      .from('cee_dossiers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'brouillon')
      .lt('created_at', threeDaysAgo),

    // Tableau dossiers recents (20 derniers) avec nom artisan via join
    supabase
      .from('cee_dossiers')
      .select('id, operation_code, status, kwhc_estime, created_at, provider:provider_id(name)')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  // Log errors but don't crash
  if (allDossiersRes.error) {
    logger.error('CEE dashboard: allDossiers query error', {
      message: allDossiersRes.error.message,
    })
  }
  if (recentDossiersRes.error) {
    logger.error('CEE dashboard: recentDossiers query error', {
      message: recentDossiersRes.error.message,
    })
  }
  if (stagnantRes.error) {
    logger.error('CEE dashboard: stagnant query error', {
      message: stagnantRes.error.message,
    })
  }
  if (recentTableRes.error) {
    logger.error('CEE dashboard: recentTable query error', {
      message: recentTableRes.error.message,
    })
  }

  const allDossiers = allDossiersRes.data ?? []

  // -------------------------------------------------------------------------
  // Aggregations en JS (1 seule query DB, O(n) en memoire)
  // -------------------------------------------------------------------------

  // a. Compteurs par statut
  const countByStatus: Record<string, number> = {}
  // b. kWhc par statut
  const kwhcByStatus: Record<string, number> = {}
  // c. Prime par statut
  const primeByStatus: Record<string, number> = {}
  // f. Top operations
  const opCounts: Record<string, number> = {}

  for (const d of allDossiers) {
    const s = d.status as string
    countByStatus[s] = (countByStatus[s] ?? 0) + 1
    kwhcByStatus[s] =
      (kwhcByStatus[s] ?? 0) + (typeof d.kwhc_estime === 'number' ? d.kwhc_estime : 0)
    primeByStatus[s] =
      (primeByStatus[s] ?? 0) + (typeof d.prime_estimee_eur === 'number' ? d.prime_estimee_eur : 0)
    const op = d.operation_code as string
    opCounts[op] = (opCounts[op] ?? 0) + 1
  }

  const totalDossiers = allDossiers.length
  const totalKwhcQualifie = ENGAGED_STATUSES.reduce((acc, s) => acc + (kwhcByStatus[s] ?? 0), 0)
  const totalPrimeEstimee = Object.values(primeByStatus).reduce((acc, v) => acc + v, 0)

  // e. Taux de conversion brouillon -> engagement+
  const poolCount = CONVERSION_POOL.reduce((acc, s) => acc + (countByStatus[s] ?? 0), 0)
  const engagedCount = ENGAGED_STATUSES.reduce((acc, s) => acc + (countByStatus[s] ?? 0), 0)
  const conversionRate = poolCount > 0 ? Math.round((engagedCount / poolCount) * 100) : 0

  // d. Dossiers cette semaine
  const weekCount = recentDossiersRes.count ?? 0

  // g. Stagnants
  const stagnantCount = stagnantRes.count ?? 0

  // f. Top 5 operations
  const topOperations = Object.entries(opCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Funnel steps
  const funnelSteps = [
    {
      label: 'Brouillon',
      count: countByStatus['brouillon'] ?? 0,
      color: FUNNEL_COLORS['brouillon'],
    },
    {
      label: 'Engagement signé',
      count: countByStatus['engagement_signe'] ?? 0,
      color: FUNNEL_COLORS['engagement_signe'],
    },
    {
      label: 'Travaux en cours',
      count: countByStatus['travaux_en_cours'] ?? 0,
      color: FUNNEL_COLORS['travaux_en_cours'],
    },
    {
      label: 'Déposé délégataire',
      count: countByStatus['depose_delegataire'] ?? 0,
      color: FUNNEL_COLORS['depose_delegataire'],
    },
    {
      label: 'Validé',
      count: countByStatus['valide'] ?? 0,
      color: FUNNEL_COLORS['valide'],
    },
  ]

  // Tableau dossiers recents
  const recentRows: CeeDossierRow[] = (recentTableRes.data ?? []).map((row) => ({
    id: row.id as string,
    operation_code: row.operation_code as string,
    provider_name: (row.provider as { name?: string } | null)?.name ?? null,
    status: row.status as CeeDossierStatus,
    kwhc_estime: typeof row.kwhc_estime === 'number' ? row.kwhc_estime : null,
    created_at: row.created_at as string,
  }))

  const hasError =
    allDossiersRes.error || recentDossiersRes.error || stagnantRes.error || recentTableRes.error

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-sand-200 rounded-lg">
            <BarChart3 className="w-6 h-6 text-charcoal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">
              Dashboard CEE — Tableau de bord mandataire
            </h1>
            <p className="text-sm text-charcoal-500 mt-0.5">
              KPIs temps réel du pipeline de dossiers CEE.
            </p>
          </div>
        </div>

        {hasError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Certaines données n&apos;ont pas pu être chargées. Les KPIs affichés peuvent être
            incomplets.
          </div>
        )}

        {/* Row 1 — KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CeeKpiCard
            icon={BarChart3}
            label="Dossiers total"
            value={fmtNum(totalDossiers)}
            variation={
              weekCount > 0 ? { text: `+${weekCount} cette semaine`, positive: true } : undefined
            }
          />
          <CeeKpiCard icon={Zap} label="kWhc total qualifié" value={fmtNum(totalKwhcQualifie)} />
          <CeeKpiCard icon={Euro} label="Prime totale estimée" value={fmtEur(totalPrimeEstimee)} />
          <CeeKpiCard
            icon={TrendingUp}
            label="Taux de conversion"
            value={`${conversionRate}%`}
            variation={
              conversionRate > 0
                ? {
                    text: `${engagedCount}/${poolCount} dossiers engagés`,
                    positive: conversionRate >= 30,
                  }
                : undefined
            }
          />
        </div>

        {/* Row 2 — Funnel + Alerte stagnants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <CeeFunnelChart steps={funnelSteps} />
          </div>
          <div className="bg-white border border-sand-200 shadow-sm rounded-xl p-5 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${stagnantCount > 0 ? 'bg-amber-100' : 'bg-accent-100'}`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${stagnantCount > 0 ? 'text-amber-600' : 'text-accent-600'}`}
                />
              </div>
              <span className="text-sm text-charcoal-500">Dossiers stagnants</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-900">{fmtNum(stagnantCount)}</p>
            <p className="text-xs text-charcoal-500 mt-1">
              Brouillons créés il y a plus de 3 jours sans progression
            </p>
          </div>
        </div>

        {/* Row 3 — Top operations + Tableau recents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top operations */}
          <div className="bg-white border border-sand-200 shadow-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-charcoal-700">Top 5 opérations</h3>
            </div>
            {topOperations.length === 0 && (
              <p className="text-sm text-charcoal-400">Aucune donnée</p>
            )}
            <div className="space-y-3">
              {topOperations.map(([code, count], i) => (
                <div key={code} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-400 w-4">{i + 1}.</span>
                    <span className="text-sm font-medium text-charcoal-900">{code}</span>
                  </div>
                  <span className="text-sm tabular-nums font-semibold text-charcoal-700">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau dossiers recents */}
          <div className="lg:col-span-2">
            <CeeStatusTable rows={recentRows} />
          </div>
        </div>
      </div>
    </div>
  )
}
