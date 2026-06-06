'use client'

import Link from 'next/link'
import useSWR from 'swr'
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

type Severity = 'p0' | 'p1' | 'p2'

type NextAction = {
  id: string
  severity: Severity
  icon: LucideIcon
  title: string
  detail: string
  href: string
  ctaLabel: string
}

type RgePayload = {
  hasRge: boolean
  status: 'none' | 'expired' | 'expiring_soon' | 'active'
  daysUntilExpiry: number | null
}

type ReputationPayload = {
  reviews: { pendingResponse: number }
  invitations: { nextScheduledAt: string | null }
}

type FunnelPayload = {
  counts: { pending: number; assigned: number }
  rates: { responseRate: number | null }
}

type StatsPayload = {
  stats?: {
    pendingDemandesCount?: number
    unreadMessages?: number
    portfolioPhotoCount?: number
  }
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Erreur ${r.status}`)
  return r.json() as Promise<T>
}

const SEVERITY_STYLES: Record<
  Severity,
  { wrap: string; badge: string; icon: string; cta: string }
> = {
  p0: {
    wrap: 'bg-red-50 border-red-200 hover:border-red-300',
    badge: 'bg-red-100 text-red-800',
    icon: 'text-red-600',
    cta: 'text-red-700 hover:text-red-900',
  },
  p1: {
    wrap: 'bg-amber-50 border-amber-200 hover:border-amber-300',
    badge: 'bg-amber-100 text-amber-800',
    icon: 'text-amber-600',
    cta: 'text-amber-800 hover:text-amber-900',
  },
  p2: {
    wrap: 'bg-sand-50 border-sand-200 hover:border-sand-300',
    badge: 'bg-sand-200 text-charcoal-700',
    icon: 'text-charcoal-500',
    cta: 'text-primary-600 hover:text-primary-700',
  },
}

const SEVERITY_ORDER: Record<Severity, number> = { p0: 0, p1: 1, p2: 2 }

export default function NextActionsBlock() {
  const { data: rge } = useSWR<RgePayload>('/api/artisan/rge', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300_000,
    dedupingInterval: 60_000,
  })
  const { data: rep } = useSWR<ReputationPayload>('/api/artisan/reputation', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60_000,
    dedupingInterval: 10_000,
  })
  const { data: funnel } = useSWR<FunnelPayload>('/api/artisan/funnel?days=30', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 120_000,
    dedupingInterval: 30_000,
  })
  const { data: stats } = useSWR<StatsPayload>('/api/artisan/stats', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30_000,
    dedupingInterval: 5_000,
  })

  const actions = buildActions({ rge, rep, funnel, stats })

  // Rien à afficher tant qu'aucune source n'a répondu
  const isLoading = !rge && !rep && !funnel && !stats
  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl border border-sand-300 p-6"
        aria-busy="true"
        aria-label="Chargement des actions prioritaires"
      >
        <div className="w-48 h-5 rounded bg-sand-200 animate-pulse mb-4" />
        <div className="space-y-2">
          <div className="h-14 rounded-lg bg-sand-100 animate-pulse" />
          <div className="h-14 rounded-lg bg-sand-100 animate-pulse" />
        </div>
      </div>
    )
  }

  // Inbox zero — aucune action prioritaire
  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-sand-300 p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-green-600" aria-hidden />À faire aujourd&apos;hui
        </h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-green-900">
            <p className="font-medium">Tout est à jour — inbox zero.</p>
            <p className="text-green-800/90 mt-0.5 text-xs">
              Vous êtes visible, vos leads sont traités, votre profil est complet. Continuez comme
              ça.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary-500" aria-hidden />À faire en priorité
        </h2>
        <span className="text-xs text-charcoal-500 tabular-nums">
          {actions.length} action{actions.length > 1 ? 's' : ''}
        </span>
      </div>

      <ul className="space-y-2" aria-label="Actions prioritaires">
        {actions.slice(0, 5).map((action) => {
          const styles = SEVERITY_STYLES[action.severity]
          const Icon = action.icon
          return (
            <li key={action.id}>
              <Link
                href={action.href}
                className={`flex items-start gap-3 p-3 rounded-lg border ${styles.wrap} focus-visible:ring-2 focus-visible:ring-primary-400 transition-colors group`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${styles.icon}`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-charcoal-900 text-sm">{action.title}</p>
                    <span
                      className={`text-2xs uppercase font-semibold px-1.5 py-0.5 rounded ${styles.badge}`}
                    >
                      {action.severity === 'p0'
                        ? 'Urgent'
                        : action.severity === 'p1'
                          ? 'Important'
                          : 'Recommandé'}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-0.5">{action.detail}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 self-center ${styles.cta}`}
                >
                  {action.ctaLabel}
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {actions.length > 5 && (
        <p className="text-xs text-charcoal-500 mt-3">
          + {actions.length - 5} autre{actions.length - 5 > 1 ? 's' : ''} action
          {actions.length - 5 > 1 ? 's' : ''} moins prioritaire
          {actions.length - 5 > 1 ? 's' : ''}.
        </p>
      )}
    </div>
  )
}

function buildActions(args: {
  rge?: RgePayload
  rep?: ReputationPayload
  funnel?: FunnelPayload
  stats?: StatsPayload
}): NextAction[] {
  const { rge, rep, funnel, stats } = args
  const out: NextAction[] = []

  // ─── P0 — cliff revenue / pénalité dispatch immédiate ────────────────────
  if (rge?.status === 'expired') {
    out.push({
      id: 'rge-expired',
      severity: 'p0',
      icon: ShieldAlert,
      title: 'Votre qualification RGE est expirée',
      detail: "Vous ne figurez plus sur les pages RGE et n'êtes plus éligible MaPrimeRénov' / CEE.",
      href: '/espace-artisan/profil',
      ctaLabel: 'Gérer',
    })
  }

  const pendingLeads = stats?.stats?.pendingDemandesCount ?? funnel?.counts?.pending ?? 0
  if (pendingLeads > 0) {
    out.push({
      id: 'pending-leads',
      severity: 'p0',
      icon: AlertOctagon,
      title: `${pendingLeads} demande${pendingLeads > 1 ? 's' : ''} non consultée${
        pendingLeads > 1 ? 's' : ''
      }`,
      detail:
        "Consulter sous 24h maintient votre priorité dans l'attribution des nouvelles demandes.",
      href: '/espace-artisan/demandes?filter=pending',
      ctaLabel: 'Voir',
    })
  }

  // ─── P1 — impact métier direct, fenêtre 7-30j ───────────────────────────
  if (rge?.status === 'expiring_soon' && rge.daysUntilExpiry != null) {
    out.push({
      id: 'rge-expiring',
      severity: 'p1',
      icon: AlertTriangle,
      title: `RGE expire dans ${rge.daysUntilExpiry} jour${rge.daysUntilExpiry > 1 ? 's' : ''}`,
      detail: 'Lancez le renouvellement maintenant pour rester visible sur les pages RGE.',
      href: '/espace-artisan/profil',
      ctaLabel: 'Renouveler',
    })
  }

  const pendingResponse = rep?.reviews?.pendingResponse ?? 0
  if (pendingResponse > 0) {
    out.push({
      id: 'reviews-unresponded',
      severity: 'p1',
      icon: MessageCircle,
      title: `${pendingResponse} avis en attente de votre réponse`,
      detail:
        'Répondre à vos avis améliore votre conversion et votre positionnement dans les résultats.',
      href: '/espace-artisan/profil?tab=avis',
      ctaLabel: 'Répondre',
    })
  }

  const responseRate = funnel?.rates?.responseRate
  const assignedCount = funnel?.counts?.assigned ?? 0
  if (responseRate != null && responseRate < 50 && assignedCount >= 3) {
    out.push({
      id: 'response-rate-low',
      severity: 'p1',
      icon: Clock,
      title: `Taux de réponse à ${responseRate}% sur 30 jours`,
      detail:
        'Nous priorisons les artisans qui consultent vite. Sous 50%, le volume de leads diminue.',
      href: '/espace-artisan/demandes',
      ctaLabel: 'Voir',
    })
  }

  // ─── P2 — optimisation conversion, fenêtre lente ────────────────────────
  if (rge && !rge.hasRge) {
    out.push({
      id: 'become-rge',
      severity: 'p2',
      icon: Sparkles,
      title: "Devenez Reconnu Garant de l'Environnement (RGE)",
      detail:
        "Les artisans RGE captent les demandes MaPrimeRénov' / CEE — un levier majeur de volume.",
      href: '/espace-artisan/profil',
      ctaLabel: 'Démarrer',
    })
  }

  const photoCount = stats?.stats?.portfolioPhotoCount ?? 0
  if (photoCount < 3) {
    out.push({
      id: 'portfolio-thin',
      severity: 'p2',
      icon: Sparkles,
      title:
        photoCount === 0
          ? 'Ajoutez des photos à votre profil'
          : `Seulement ${photoCount} photo${photoCount > 1 ? 's' : ''} sur votre profil`,
      detail:
        "Les profils avec au moins 3 photos reçoivent significativement plus d'appels et de demandes.",
      href: '/espace-artisan/profil?tab=portfolio',
      ctaLabel: 'Ajouter',
    })
  }

  return out.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}
