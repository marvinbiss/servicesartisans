'use client'

/**
 * Plan C — C-2 : enrollment + recovery codes UI (P1 CVSS 7.2).
 *
 * Composant unique pour gérer le flow 2FA côté UI :
 *   loading → idle → setup-codes → setup-qr → enabled
 *                                           ↓
 *                                  disabling | regenerating
 *
 * API consommée : `/api/auth/2fa` (déjà câblée).
 *   GET                       → status { enabled, backup_codes_remaining, last_used }
 *   POST { action: 'setup' }  → { qrCodeUrl, backupCodes[] }
 *   POST { action: 'verify', code } → activation finale
 *   POST { action: 'disable', code } → désactivation
 *   POST { action: 'regenerate_backup', code } → nouveaux codes
 *
 * Sécurité :
 *   - Les backup codes ne sont JAMAIS re-récupérables côté API. Affichés une
 *     seule fois post-setup. Le composant force l'utilisateur à confirmer
 *     "J'ai sauvegardé" avant d'autoriser la phase verify.
 *   - Cooldown 24h entre transitions (mig 514) — message d'erreur explicite
 *     si l'API renvoie `TwoFactorChangeCooldownError`.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  ShieldCheck,
  ShieldOff,
  AlertCircle,
  Loader2,
  Download,
  KeyRound,
  RotateCcw,
  ArrowRight,
} from 'lucide-react'

type TwoFactorStatus = {
  enabled: boolean
  verified: boolean
  backup_codes_remaining: number
  last_used?: string | null
  created_at?: string | null
}

type Phase =
  | 'loading'
  | 'idle'
  | 'setup-codes'
  | 'setup-qr'
  | 'enabled'
  | 'disabling'
  | 'regenerating'
  | 'show-new-codes'

function downloadCodesAsTxt(codes: string[]) {
  const text = [
    'ServicesArtisans — Codes de secours 2FA',
    `Générés le ${new Date().toLocaleString('fr-FR')}`,
    '',
    'IMPORTANT : conservez ces codes hors-ligne. Chaque code ne peut être utilisé qu’une seule fois.',
    '',
    ...codes,
  ].join('\n')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `servicesartisans-2fa-codes-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function TwoFactorSettings() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/2fa', { method: 'GET' })
      const json = await res.json()
      if (res.status === 401) {
        window.location.href = '/connexion?redirect=/espace-artisan/securite/2fa'
        return
      }
      const next = json?.status as TwoFactorStatus | undefined
      if (next) {
        setStatus(next)
        setPhase(next.enabled && next.verified ? 'enabled' : 'idle')
      } else {
        setStatus({ enabled: false, verified: false, backup_codes_remaining: 0 })
        setPhase('idle')
      }
    } catch {
      setError('Impossible de charger le statut 2FA')
      setPhase('idle')
    }
  }, [])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  const startSetup = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json?.error?.message || json?.message || 'Erreur lors du setup 2FA')
        return
      }
      setQrCodeUrl(json.qrCodeUrl)
      setBackupCodes(json.backupCodes || [])
      setPhase('setup-codes')
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setSubmitting(false)
    }
  }

  const submitVerify = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', code: code.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json?.error?.message || json?.message || 'Code incorrect')
        return
      }
      setCode('')
      setBackupCodes([])
      setQrCodeUrl(null)
      await refreshStatus()
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setSubmitting(false)
    }
  }

  const submitDisable = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', code: code.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json?.error?.message || json?.message || 'Désactivation impossible')
        return
      }
      setCode('')
      await refreshStatus()
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setSubmitting(false)
    }
  }

  const submitRegenerate = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate_backup', code: code.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json?.error?.message || json?.message || 'Régénération impossible')
        return
      }
      setBackupCodes(json.backupCodes || [])
      setCode('')
      setPhase('show-new-codes')
      await refreshStatus()
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'loading') {
    return (
      <div className="flex items-center gap-3 text-charcoal-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Chargement du statut 2FA…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-4">
        {status?.enabled ? (
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-600" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <ShieldOff className="w-6 h-6 text-amber-600" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold">Vérification en deux étapes (2FA)</h2>
          <p className="text-sm text-charcoal-500">
            {status?.enabled
              ? `2FA active. Codes de secours restants : ${status.backup_codes_remaining}.`
              : 'Ajoutez une couche de sécurité supplémentaire en exigeant un code TOTP à chaque connexion.'}
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {phase === 'idle' && (
        <button
          type="button"
          disabled={submitting}
          onClick={startSetup}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          Activer la 2FA
        </button>
      )}

      {phase === 'setup-codes' && (
        <section className="space-y-4 border border-amber-300 bg-amber-50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-900">
            Codes de secours — sauvegardez-les MAINTENANT
          </h3>
          <p className="text-sm text-amber-900">
            Ces 10 codes vous permettront de vous connecter si vous perdez votre application
            d’authentification. Ils ne seront PLUS jamais affichés.
          </p>
          <ul
            className="grid grid-cols-2 gap-2 font-mono text-sm bg-white p-4 rounded-lg border border-amber-200"
            data-testid="backup-codes-list"
          >
            {backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadCodesAsTxt(backupCodes)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 rounded-lg hover:bg-amber-100"
            >
              <Download className="w-4 h-4" /> Télécharger en .txt
            </button>
            <button
              type="button"
              onClick={() => setPhase('setup-qr')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              J’ai sauvegardé, continuer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {phase === 'setup-qr' && qrCodeUrl && (
        <section className="space-y-4">
          <h3 className="font-semibold">Scannez le QR code avec votre application</h3>
          <p className="text-sm text-charcoal-500">
            Google Authenticator, 1Password, Authy, Bitwarden — toute application TOTP standard
            fonctionne.
          </p>
          {/* qrCodeUrl est un data URI image/png généré côté serveur (qrcode lib) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="QR code 2FA"
            width={192}
            height={192}
            className="w-48 h-48 border rounded-lg"
          />
          <div>
            <label htmlFor="totp-verify" className="block text-sm font-medium mb-1">
              Code à 6 chiffres
            </label>
            <div className="relative max-w-xs">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                id="totp-verify"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                className="w-full pl-9 pr-3 py-2 border border-charcoal-300 rounded-lg tracking-widest text-center font-mono"
                placeholder="123456"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={submitting || code.length !== 6}
            onClick={submitVerify}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Activer la 2FA
          </button>
        </section>
      )}

      {phase === 'enabled' && (
        <section className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="border border-charcoal-200 rounded-lg p-4">
              <div className="text-charcoal-500">Codes de secours restants</div>
              <div className="text-2xl font-semibold">{status?.backup_codes_remaining ?? 0}</div>
            </div>
            <div className="border border-charcoal-200 rounded-lg p-4">
              <div className="text-charcoal-500">Dernière utilisation</div>
              <div className="text-base">
                {status?.last_used ? new Date(status.last_used).toLocaleString('fr-FR') : '—'}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setError(null)
                setCode('')
                setPhase('regenerating')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-charcoal-300 rounded-lg hover:bg-charcoal-50"
            >
              <RotateCcw className="w-4 h-4" /> Régénérer les codes de secours
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setCode('')
                setPhase('disabling')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              <ShieldOff className="w-4 h-4" /> Désactiver la 2FA
            </button>
          </div>
        </section>
      )}

      {(phase === 'disabling' || phase === 'regenerating') && (
        <section className="space-y-4 border border-charcoal-200 rounded-xl p-5">
          <h3 className="font-semibold">
            {phase === 'disabling' ? 'Confirmez la désactivation' : 'Confirmez la régénération'}
          </h3>
          <p className="text-sm text-charcoal-500">
            Saisissez un code TOTP valide (ou un code de secours <code>XXXXXXXX-XXXXXXXX</code>).
          </p>
          <div className="relative max-w-xs">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={20}
              className="w-full pl-9 pr-3 py-2 border border-charcoal-300 rounded-lg tracking-widest text-center font-mono"
              placeholder="123456"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setPhase('enabled')
                setCode('')
                setError(null)
              }}
              className="px-4 py-2 border border-charcoal-300 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={submitting || code.length < 6}
              onClick={phase === 'disabling' ? submitDisable : submitRegenerate}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-60 ${
                phase === 'disabling'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {phase === 'disabling' ? 'Désactiver' : 'Régénérer'}
            </button>
          </div>
        </section>
      )}

      {phase === 'show-new-codes' && (
        <section className="space-y-4 border border-amber-300 bg-amber-50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-900">Nouveaux codes de secours</h3>
          <p className="text-sm text-amber-900">
            Vos anciens codes ne fonctionnent plus. Sauvegardez ces nouveaux codes dès maintenant.
          </p>
          <ul
            className="grid grid-cols-2 gap-2 font-mono text-sm bg-white p-4 rounded-lg border border-amber-200"
            data-testid="new-backup-codes-list"
          >
            {backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadCodesAsTxt(backupCodes)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 rounded-lg hover:bg-amber-100"
            >
              <Download className="w-4 h-4" /> Télécharger en .txt
            </button>
            <button
              type="button"
              onClick={() => {
                setBackupCodes([])
                setPhase('enabled')
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              J’ai sauvegardé
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
