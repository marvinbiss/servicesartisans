'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'

export function DevisClientActions({ token }: { token: string }) {
  const router = useRouter()
  const [pending, setPending] = useState<'accepte' | 'refuse' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmRefuse, setConfirmRefuse] = useState(false)

  const respond = async (action: 'accepte' | 'refuse') => {
    setError(null)
    setPending(action)
    try {
      const res = await fetch(`/api/devis/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data?.error ?? 'Action impossible')
        return
      }
      router.refresh()
    } catch {
      setError('Erreur de connexion')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-6 space-y-4">
      <p className="text-center text-charcoal-700 font-medium">
        Souhaitez-vous accepter ce devis ?
      </p>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => respond('accepte')}
          disabled={pending !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {pending === 'accepte' ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-4 h-4" aria-hidden="true" />
          )}
          Accepter le devis
        </button>
        {confirmRefuse ? (
          <button
            type="button"
            onClick={() => respond('refuse')}
            disabled={pending !== null}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            {pending === 'refuse' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <X className="w-4 h-4" aria-hidden="true" />
            )}
            Confirmer le refus
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRefuse(true)}
            disabled={pending !== null}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-charcoal-600 border border-sand-300 rounded-lg hover:bg-sand-50 disabled:opacity-50"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Refuser
          </button>
        )}
      </div>
    </div>
  )
}
