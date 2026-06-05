'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Edit3, AlertTriangle, Loader2 } from 'lucide-react'
import { useAdminFetch, adminMutate } from '@/hooks/admin/useAdminFetch'
import { ErrorBanner } from '@/components/admin/ErrorBanner'

type DraftStatus =
  | 'pending'
  | 'generating'
  | 'judged_pass'
  | 'judged_fail'
  | 'published'
  | 'archived'

type DraftItem = {
  provider_id: string
  draft_text: string | null
  word_count: number | null
  prompt_version: string | null
  rubric_version: string | null
  model_used: string | null
  tokens_input: number | null
  tokens_output: number | null
  cost_estimate_usd: number | null
  judge_score: number | null
  judge_breakdown: Record<string, number> | null
  status: DraftStatus
  rejection_reason: string | null
  hallucination_flags: Array<{ dimension: string; message: string }> | null
  attempts: number
  generated_at: string | null
  judged_at: string | null
  published_at: string | null
  provider: {
    id: string
    name: string | null
    slug: string | null
    address_city: string | null
    description: string | null
  } | null
}

type ListResponse = {
  success: boolean
  data: { items: DraftItem[]; total: number; page: number; limit: number }
}

const STATUS_LABEL: Record<DraftStatus | 'all', string> = {
  all: 'Tous',
  pending: 'En attente',
  generating: 'Génération',
  judged_pass: 'À publier',
  judged_fail: 'Rejetés',
  published: 'Publiés',
  archived: 'Archivés',
}

const STATUS_COLOR: Record<DraftStatus, string> = {
  pending: 'bg-sand-100 text-charcoal-700',
  generating: 'bg-sand-200 text-charcoal-700',
  judged_pass: 'bg-accent-100 text-accent-700',
  judged_fail: 'bg-rose-100 text-rose-700',
  published: 'bg-indigo-100 text-indigo-700',
  archived: 'bg-sand-200 text-charcoal-600',
}

export default function AdminDescriptionsPage() {
  const [status, setStatus] = useState<DraftStatus | 'all'>('judged_pass')
  const [minScore, setMinScore] = useState<number>(7.5)
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const url = `/api/admin/descriptions?status=${status}&minScore=${minScore}&page=${page}&limit=20`
  const { data, isLoading, error, mutate } = useAdminFetch<ListResponse>(url)

  const items = useMemo(() => data?.data?.items ?? [], [data])
  const total = data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 20))

  const summary = useMemo(() => {
    const pass = items.filter((i) => i.status === 'judged_pass').length
    const fail = items.filter((i) => i.status === 'judged_fail').length
    const published = items.filter((i) => i.status === 'published').length
    return { pass, fail, published }
  }, [items])

  const act = async (
    providerId: string,
    action: 'publish' | 'reject' | 'edit',
    extra?: { draft_text?: string; rejection_reason?: string }
  ) => {
    setActionError(null)
    setBusy(providerId)
    try {
      await adminMutate(`/api/admin/descriptions/${providerId}`, {
        method: 'PATCH',
        body: { action, ...extra },
      })
      setEditing(null)
      await mutate()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-charcoal-900">Descriptions RGE — modération</h1>
        <p className="text-sm text-charcoal-600">
          Pipeline v1 · prompt + rubric + model versionnés ·{' '}
          <span className="font-medium">seuil publication ≥ 7.5</span>
        </p>
      </header>

      {actionError && <ErrorBanner message={actionError} />}
      {error && <ErrorBanner message="Erreur de chargement des drafts" />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-sand-200 bg-white shadow-sm">
          {(['judged_pass', 'judged_fail', 'published', 'all'] as (DraftStatus | 'all')[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s)
                  setPage(1)
                }}
                className={`px-3 py-2 text-sm font-medium ${
                  status === s ? 'bg-accent-600 text-white' : 'text-charcoal-700 hover:bg-sand-50'
                } first:rounded-l-md last:rounded-r-md`}
              >
                {STATUS_LABEL[s]}
              </button>
            )
          )}
        </div>

        <label className="text-sm text-charcoal-700 flex items-center gap-2">
          Score min
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={minScore}
            onChange={(e) => {
              setMinScore(Number(e.target.value))
              setPage(1)
            }}
            className="w-20 rounded-md border border-sand-300 px-2 py-1 text-sm"
          />
        </label>

        <div className="ml-auto text-sm text-charcoal-600">
          total <span className="font-semibold">{total}</span> · page {page}/{totalPages} · vue
          passés <span className="font-medium">{summary.pass}</span> · rejetés{' '}
          <span className="font-medium">{summary.fail}</span> · publiés{' '}
          <span className="font-medium">{summary.published}</span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-charcoal-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> chargement…
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-16 text-charcoal-500 border border-dashed border-sand-200 rounded-lg">
          Aucun draft dans cette vue.
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => {
          const isEditingThis = editing?.id === item.provider_id
          const isBusy = busy === item.provider_id
          const hasHallucination = item.hallucination_flags && item.hallucination_flags.length > 0
          return (
            <article
              key={item.provider_id}
              className="bg-white rounded-lg border border-sand-200 shadow-sm p-4 space-y-3"
            >
              <header className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-charcoal-900">
                    {item.provider?.name ?? '(provider supprimé)'}
                    <span className="ml-2 text-sm text-charcoal-500">
                      {item.provider?.address_city ?? ''}
                    </span>
                  </h2>
                  <div className="text-xs text-charcoal-500 space-x-3">
                    <span className={`px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status]}`}>
                      {item.status}
                    </span>
                    <span>
                      score <b>{item.judge_score?.toFixed(1) ?? '—'}</b>
                    </span>
                    <span>mots {item.word_count ?? '—'}</span>
                    <span>{item.model_used}</span>
                    <span>
                      tok in/out {item.tokens_input ?? 0}/{item.tokens_output ?? 0}
                    </span>
                    <span>coût ${item.cost_estimate_usd?.toFixed(4) ?? '0.0000'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {item.status === 'judged_pass' && (
                    <>
                      <button
                        onClick={() => act(item.provider_id, 'publish')}
                        disabled={isBusy || hasHallucination === true}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent-600 text-white text-sm font-medium hover:bg-accent-700 disabled:opacity-40"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Publier
                      </button>
                      <button
                        onClick={() => act(item.provider_id, 'reject')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 disabled:opacity-40"
                      >
                        <XCircle className="w-4 h-4" /> Rejeter
                      </button>
                    </>
                  )}
                  {(item.status === 'judged_pass' || item.status === 'judged_fail') && (
                    <button
                      onClick={() =>
                        setEditing(
                          isEditingThis
                            ? null
                            : { id: item.provider_id, text: item.draft_text ?? '' }
                        )
                      }
                      disabled={isBusy}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-sand-50 text-charcoal-700 text-sm font-medium hover:bg-sand-100 disabled:opacity-40"
                    >
                      <Edit3 className="w-4 h-4" />
                      {isEditingThis ? 'Annuler' : 'Éditer'}
                    </button>
                  )}
                </div>
              </header>

              {hasHallucination && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4" /> Hallucinations détectées
                  </div>
                  <ul className="list-disc pl-5 mt-1">
                    {item.hallucination_flags?.map((f, i) => (
                      <li key={i}>
                        <code>{f.dimension}</code> — {f.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-900 text-sm">
                  <span className="font-medium">Raison rejet :</span> {item.rejection_reason}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-charcoal-500 mb-1">Description live</div>
                  <div className="p-3 bg-sand-50 rounded-md text-sm text-charcoal-700 max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {item.provider?.description ?? <em>(vide)</em>}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-charcoal-500 mb-1">Draft</div>
                  {isEditingThis ? (
                    <>
                      <textarea
                        value={editing.text}
                        onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                        className="w-full h-64 p-3 border border-sand-300 rounded-md text-sm"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() =>
                            act(item.provider_id, 'edit', { draft_text: editing.text })
                          }
                          disabled={isBusy || editing.text.trim().length < 50}
                          className="px-3 py-1.5 rounded-md bg-accent-600 text-white text-sm font-medium disabled:opacity-40"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-accent-50 rounded-md text-sm text-charcoal-900 max-h-64 overflow-y-auto whitespace-pre-wrap">
                      {item.draft_text ?? <em>(pas encore généré)</em>}
                    </div>
                  )}
                </div>
              </div>

              {item.judge_breakdown && (
                <div className="text-xs text-charcoal-500 flex flex-wrap gap-2">
                  {Object.entries(item.judge_breakdown).map(([k, v]) => (
                    <span key={k} className="px-1.5 py-0.5 bg-sand-100 rounded">
                      {k.replace('dim', '').replace('_', '/')}: <b>{Number(v).toFixed(1)}</b>
                    </span>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <div className="flex justify-center gap-2 pt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-md border border-sand-200 text-sm disabled:opacity-40"
        >
          Précédent
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-md border border-sand-200 text-sm disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}
