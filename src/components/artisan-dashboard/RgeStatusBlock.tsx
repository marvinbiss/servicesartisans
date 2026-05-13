import useSWR from 'swr'
import { ShieldCheck, AlertTriangle, XCircle, Info, ExternalLink, Calendar } from 'lucide-react'

type RgeQualification = {
  code?: string | null
  domaine?: string | null
  organisme?: string | null
  sous_domaine?: string | null
  date_debut?: string | null
  date_fin?: string | null
}

type RgeStatus = 'none' | 'expired' | 'expiring_soon' | 'active'

type RgePayload = {
  hasRge: boolean
  status: RgeStatus
  rgeValidUntil: string | null
  daysUntilExpiry: number | null
  qualifications: RgeQualification[]
  lastSyncedAt: string | null
  sourceUrl: string | null
}

const fetcher = (url: string): Promise<RgePayload> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Erreur ${r.status}`)
    return r.json()
  })

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RgeStatusBlock() {
  const { data, error, isLoading } = useSWR<RgePayload>('/api/artisan/rge', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300_000, // 5 min (RGE sync hebdo, pas besoin plus fréquent)
    dedupingInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl border border-sand-300 p-6"
        aria-busy="true"
        aria-label="Chargement du statut RGE"
      >
        <div className="w-32 h-5 rounded bg-sand-200 animate-pulse mb-4" />
        <div className="h-4 w-48 rounded bg-sand-200 animate-pulse" />
      </div>
    )
  }

  if (error || !data) return null

  // Pas RGE — proposer la certification
  if (!data.hasRge) {
    return (
      <div className="bg-white rounded-xl border border-sand-300 p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-charcoal-400" aria-hidden />
          Qualification RGE
        </h2>
        <div className="bg-sand-50 border border-sand-200 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-charcoal-500 shrink-0 mt-0.5" aria-hidden />
          <div className="text-sm">
            <p className="font-medium text-charcoal-900">Aucune qualification RGE détectée</p>
            <p className="text-charcoal-600 mt-1">
              Une qualification RGE (Reconnu Garant de l&apos;Environnement) vous rend éligible aux
              aides MaPrimeRénov&apos; et CEE — un levier majeur de demandes.
            </p>
            <a
              href="https://www.france-renov.gouv.fr/devenir-rge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-primary-600 hover:underline text-sm font-medium"
            >
              Comment devenir RGE <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Expiré
  if (data.status === 'expired') {
    return (
      <div className="bg-white rounded-xl border border-red-300 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-4">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-sm flex-1">
            <p className="font-bold text-red-900">Votre qualification RGE est expirée</p>
            <p className="text-red-800 mt-1">
              Expirée le {formatDate(data.rgeValidUntil)} ·{' '}
              {data.daysUntilExpiry != null ? `${Math.abs(data.daysUntilExpiry)} jours` : ''} de
              retard
            </p>
            <p className="text-red-700 mt-2 text-xs">
              Vous n&apos;apparaissez plus sur les pages /rge/* et n&apos;êtes plus éligible aux
              demandes MaPrimeRénov&apos; / CEE. Contactez votre organisme certificateur
              {data.qualifications[0]?.organisme
                ? ` (${data.qualifications[0].organisme})`
                : ''}{' '}
              pour renouveler.
            </p>
          </div>
        </div>
        <RgeQualificationsList
          qualifications={data.qualifications}
          lastSyncedAt={data.lastSyncedAt}
        />
      </div>
    )
  }

  // Expire bientôt (< 30 jours)
  if (data.status === 'expiring_soon') {
    return (
      <div className="bg-white rounded-xl border border-amber-300 p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-sm flex-1">
            <p className="font-bold text-amber-900">
              Votre RGE expire dans {data.daysUntilExpiry} jour
              {(data.daysUntilExpiry ?? 0) > 1 ? 's' : ''}
            </p>
            <p className="text-amber-800 mt-1">
              Expiration le {formatDate(data.rgeValidUntil)}. Lancez le renouvellement dès
              maintenant pour rester éligible aux aides publiques et visible sur les pages RGE.
            </p>
          </div>
        </div>
        <RgeQualificationsList
          qualifications={data.qualifications}
          lastSyncedAt={data.lastSyncedAt}
        />
      </div>
    )
  }

  // Actif
  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" aria-hidden />
          Qualification RGE
        </h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600" aria-hidden />
          Active
        </span>
      </div>

      {data.rgeValidUntil && (
        <div className="flex items-center gap-2 text-sm text-charcoal-600 mb-4">
          <Calendar className="w-4 h-4 text-charcoal-400" aria-hidden />
          Valide jusqu&apos;au{' '}
          <strong className="text-charcoal-900">{formatDate(data.rgeValidUntil)}</strong>
          {data.daysUntilExpiry != null && data.daysUntilExpiry > 0 && (
            <span className="text-charcoal-500">({data.daysUntilExpiry} jours)</span>
          )}
        </div>
      )}

      <RgeQualificationsList
        qualifications={data.qualifications}
        lastSyncedAt={data.lastSyncedAt}
      />
    </div>
  )
}

function RgeQualificationsList({
  qualifications,
  lastSyncedAt,
}: {
  qualifications: RgeQualification[]
  lastSyncedAt: string | null
}) {
  if (qualifications.length === 0) return null

  const top = qualifications.slice(0, 4)
  const more = qualifications.length - top.length

  return (
    <div>
      <ul className="space-y-2">
        {top.map((q, i) => (
          <li
            key={`${q.code}-${i}`}
            className="flex items-start gap-3 p-3 bg-sand-50 rounded-lg text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-charcoal-900">
                {q.code || 'Qualification RGE'}
                {q.domaine && <span className="text-charcoal-500 font-normal"> · {q.domaine}</span>}
              </div>
              <div className="text-xs text-charcoal-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {q.organisme && <span>Organisme : {q.organisme}</span>}
                {q.date_fin && <span>Jusqu&apos;au {formatDate(q.date_fin)}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <p className="text-xs text-charcoal-500 mt-2">
          + {more} autre{more > 1 ? 's' : ''} qualification{more > 1 ? 's' : ''}
        </p>
      )}
      {lastSyncedAt && (
        <p className="text-xs text-charcoal-400 mt-3 flex items-center gap-1.5">
          <Info className="w-3 h-3" aria-hidden />
          Données synchronisées depuis l&apos;annuaire officiel ADEME ({formatDate(lastSyncedAt)})
        </p>
      )}
    </div>
  )
}
