'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { getSafeRedirectPath } from '@/lib/safe-redirect'

/**
 * Page UI 2FA post-signin (Plan C — C-1).
 *
 * Le cookie `sa_2fa_pending` est HttpOnly donc invisible côté client.
 * On laisse le serveur en juger : si POST /verify-pending renvoie 401
 * "Session 2FA expirée", on redirige vers /connexion.
 *
 * Le toggle « code de secours » accepte le format `XXXXXXXX-XXXXXXXX`
 * (17 caractères) — détecté côté serveur dans `twoFactorAuth.verifyCode`.
 */
export default function Verifier2FAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')

  const [code, setCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/2fa/verify-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data = await response.json()

      if (response.status === 401 && data?.error?.message?.includes('Session 2FA expirée')) {
        router.push('/connexion?error=2fa_pending_expired')
        return
      }

      if (!response.ok) {
        setError(data?.error?.message || 'Code incorrect')
        return
      }

      const safe = getSafeRedirectPath(next, '')
      router.push(safe || '/espace-artisan')
      router.refresh()
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vérification en deux étapes</h1>
          <p className="text-charcoal-400">
            {useBackupCode
              ? 'Saisissez l’un de vos codes de secours.'
              : 'Saisissez le code à 6 chiffres généré par votre application d’authentification.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-sand-500 mb-2" htmlFor="2fa-code">
              {useBackupCode ? 'Code de secours' : 'Code TOTP'}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500" />
              <input
                id="2fa-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                inputMode={useBackupCode ? 'text' : 'numeric'}
                autoComplete="one-time-code"
                pattern={useBackupCode ? '[A-Fa-f0-9]{8}-[A-Fa-f0-9]{8}' : '[0-9]{6}'}
                maxLength={useBackupCode ? 17 : 6}
                className="w-full pl-10 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white placeholder-charcoal-500 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all tracking-widest text-center"
                placeholder={useBackupCode ? 'XXXXXXXX-XXXXXXXX' : '••••••'}
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length === 0}
            className="w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-primary-500/30"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Vérifier
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setUseBackupCode((v) => !v)
              setCode('')
              setError(null)
            }}
            className="w-full text-sm text-primary-300 hover:text-primary-200 underline-offset-2 hover:underline"
          >
            {useBackupCode
              ? 'Utiliser plutôt un code TOTP'
              : 'Je n’ai pas accès à mon application — utiliser un code de secours'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-charcoal-400">
          <Link href="/connexion" className="text-primary-300 hover:text-primary-200">
            Annuler et revenir à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
