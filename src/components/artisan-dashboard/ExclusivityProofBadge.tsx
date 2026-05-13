'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Copy, Check, AlertTriangle } from 'lucide-react'

type Proof = {
  assignmentId: string
  leadId: string
  providerId: string
  assignedAt: string
  status: string
  isExclusiveActive: boolean
  exclusivityProofHash: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; proof: Proof }
  | { status: 'error'; message: string }

type Props = {
  assignmentId: string
}

/**
 * Shows the artisan the DB-backed proof that this lead was NOT shared.
 * Visible on lead detail page. The hash is a SHA256 fingerprint of
 * (lead_id, provider_id, assigned_at) that can be cited in any dispute.
 */
export default function ExclusivityProofBadge({ assignmentId }: Props) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/artisan/leads/${assignmentId}/exclusivity-proof`)
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          if (!cancelled) {
            setState({ status: 'error', message: body.error ?? 'Erreur de chargement' })
          }
          return
        }
        const data = (await res.json()) as { proof: Proof }
        if (!cancelled) setState({ status: 'ready', proof: data.proof })
      } catch {
        if (!cancelled) {
          setState({ status: 'error', message: 'Erreur reseau' })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [assignmentId])

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="rounded-xl border border-sand-200 bg-white p-4 text-sm text-charcoal-500">
        Verification de l&apos;exclusivite...
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Preuve d&apos;exclusivite indisponible : {state.message}</span>
      </div>
    )
  }

  const { proof } = state
  const exclusive = proof.isExclusiveActive

  return (
    <div
      className={`rounded-xl border p-4 ${
        exclusive ? 'border-accent-200 bg-accent-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          className={`w-5 h-5 shrink-0 mt-0.5 ${exclusive ? 'text-accent-700' : 'text-amber-700'}`}
        />
        <div className="flex-1 min-w-0">
          <p className={`font-bold mb-1 ${exclusive ? 'text-accent-900' : 'text-amber-900'}`}>
            {exclusive ? 'Lead exclusif — envoye uniquement a vous' : 'Lead non exclusif'}
          </p>
          <p className={`text-sm mb-3 ${exclusive ? 'text-accent-800' : 'text-amber-800'}`}>
            {exclusive
              ? `Assignation le ${new Date(proof.assignedAt).toLocaleString('fr-FR')}. Aucun autre artisan de ServicesArtisans n'a recu ce lead.`
              : 'Une autre assignation active existe. Contactez le support.'}
          </p>
          <div className="text-xs font-mono text-charcoal-600 bg-white rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <span className="truncate">{proof.exclusivityProofHash}</span>
            <button
              type="button"
              onClick={() => copy(proof.exclusivityProofHash)}
              aria-label="Copier la preuve"
              className="shrink-0 text-charcoal-500 hover:text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              {copied ? (
                <Check className="w-4 h-4 text-accent-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-charcoal-500 mt-2">
            Preuve SHA256 verifiable : lead_id + provider_id + assigned_at. En cas de litige
            (DGCCRF, Trustpilot, client), citez ce hash.
          </p>
        </div>
      </div>
    </div>
  )
}
