'use client'

import { useState, useEffect } from 'react'
import { Shield, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'
import { trackEvent, type BookingEvent } from '@/lib/analytics/tracking'
import { capture, EVENT } from '@/lib/analytics/posthog'

interface ClaimButtonProps {
  providerId: string
  providerName: string
  // hasSiret kept for caller compat but plus utilisé pour gate l'affichage
  // (cf. funnel claim 2026-05-05 — l'API accepte le claim même sans SIRET en
  // DB et flag manual_verification_required pour vérif admin via SIRENE).
  hasSiret?: boolean
}

export function ClaimButton({ providerId, providerName }: ClaimButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [siret, setSiret] = useState('')
  const [email, setEmail] = useState('')
  const [showOptional, setShowOptional] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Auto-open the claim modal when arriving from the cold-outreach
  // email (scripts/outreach-claim-campaign.ts deeplinks to
  // {profileUrl}?claim=1). Pre-fills the SIRET if the URL also carries
  // it. Removes the params from the URL so a refresh doesn't re-trigger.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const claimParam = url.searchParams.get('claim')
    if (claimParam !== '1') return
    const siretParam = url.searchParams.get('siret')
    if (siretParam) {
      const digits = siretParam.replace(/\D/g, '').slice(0, 14)
      if (digits.length === 9 || digits.length === 14) setSiret(digits)
    }
    setShowModal(true)
    trackEvent('claim_started' as BookingEvent, { providerId, providerName, source: 'outreach' })
    capture(EVENT.ARTISAN_CLAIM_STARTED, { providerId, providerName, source: 'outreach' })
    url.searchParams.delete('claim')
    url.searchParams.delete('siret')
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash)
    // intentionally fire-once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll & handle Escape when modal open
  useEffect(() => {
    if (!showModal) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) setShowModal(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showModal, isLoading])

  // Best-effort prefill from profile if user is logged in (non-blocking)
  useEffect(() => {
    if (!showModal || profileLoaded) return
    setProfileLoaded(true)
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (data.user.fullName && !fullName) setFullName(data.user.fullName)
          if (data.user.email && !email) setEmail(data.user.email)
          if (data.user.phone && !phone) setPhone(data.user.phone)
        }
      })
      .catch(() => {
        /* not logged in — that's fine */
      })
  }, [showModal, profileLoaded, fullName, email, phone])

  // Format SIREN/SIRET with spaces for display
  // SIREN: XXX XXX XXX — SIRET: XXX XXX XXX XXXXX
  const formatSirenSiret = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    const parts = []
    if (digits.length > 0) parts.push(digits.slice(0, 3))
    if (digits.length > 3) parts.push(digits.slice(3, 6))
    if (digits.length > 6) parts.push(digits.slice(6, 9))
    if (digits.length > 9) parts.push(digits.slice(9, 14))
    return parts.join(' ')
  }

  const handleSiretChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    setSiret(digits)
    setError(null)
  }

  const formatPhone = (value: string) => {
    return value.replace(/[^\d+]/g, '').slice(0, 15)
  }

  // Audit B/C #2 (2026-05-04) : claim 5 champs → 2 obligatoires (SIREN + email).
  // Cible : claim rate 0.002% (19/970K) → 0.05-0.2% = 485-1940 supply unlocks.
  // fullName/phone/position restent OPTIONNELS, accessibles via le toggle "Détails".
  const isFormValid = (siret.length === 9 || siret.length === 14) && email.includes('@')

  const handleClaim = async () => {
    if (siret.length !== 9 && siret.length !== 14) {
      setError('Entrez votre SIREN (9 chiffres) ou SIRET (14 chiffres)')
      return
    }
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/artisan/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          siret,
          email: email.trim().toLowerCase(),
          ...(fullName.trim() && { fullName: fullName.trim() }),
          ...(phone.replace(/\D/g, '').length >= 10 && {
            phone: phone.trim().replace(/[\s.\-()]/g, ''),
          }),
          ...(position.trim() && { position: position.trim() }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la revendication')
        return
      }

      trackEvent('claim_submitted' as BookingEvent, { providerId, providerName })
      capture(EVENT.ARTISAN_CLAIM_SUCCEEDED, { providerId, providerName })
      setSuccess(true)
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => {
          trackEvent('claim_started' as BookingEvent, { providerId, providerName })
          capture(EVENT.ARTISAN_CLAIM_STARTED, { providerId, providerName })
          setShowModal(true)
        }}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20"
      >
        <Shield className="w-5 h-5" />
        Vous êtes cet artisan ? Revendiquez cette fiche
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isLoading && setShowModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => !isLoading && setShowModal(false)}
              className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal-400 hover:text-charcoal-600 rounded-lg hover:bg-sand-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              // Success state
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">Demande envoyée !</h3>
                <p className="text-charcoal-600 mb-6">
                  Votre demande de revendication pour <strong>{providerName}</strong> a été soumise.
                  Un administrateur la validera rapidement.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-sand-100 text-charcoal-700 px-6 py-2.5 rounded-xl font-medium hover:bg-sand-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              // Form state
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal-900">Revendiquer cette fiche</h3>
                    <p className="text-sm text-charcoal-500">{providerName}</p>
                  </div>
                </div>

                <p className="text-sm text-charcoal-600 mb-4">
                  Pour revendiquer cette fiche, deux infos suffisent :
                  <strong> votre SIREN/SIRET</strong> et <strong>votre email pro</strong>. Nous vous
                  contactons sous 24h pour finaliser.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* SIREN / SIRET — obligatoire */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      SIREN ou SIRET <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formatSirenSiret(siret)}
                      onChange={(e) => handleSiretChange(e.target.value)}
                      placeholder="SIREN (9) ou SIRET (14 chiffres)"
                      className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg tracking-wider font-mono"
                      maxLength={17}
                      inputMode="numeric"
                      disabled={isLoading}
                    />
                    <p className="mt-1 text-xs text-charcoal-500">
                      Votre SIREN/SIRET figure sur votre extrait Kbis ou sur{' '}
                      <a
                        href="https://www.societe.com"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-amber-600 hover:underline"
                      >
                        societe.com
                      </a>
                    </p>
                  </div>

                  {/* Email — obligatoire */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Email professionnel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError(null)
                      }}
                      placeholder="jean@monentreprise.fr"
                      className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Toggle infos optionnelles — pour les artisans qui veulent
                      accélérer la validation en partageant directement leurs
                      coordonnées. Permet de garder l'option "claim minimal"
                      sans perdre le canal pour ceux qui sont prêts à donner +. */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowOptional((v) => !v)}
                      className="text-sm text-amber-700 hover:text-amber-800 font-medium underline-offset-2 hover:underline"
                      disabled={isLoading}
                    >
                      {showOptional
                        ? '− Masquer les infos optionnelles'
                        : '+ Ajouter mes coordonnées (facultatif, accélère la validation)'}
                    </button>
                  </div>

                  {showOptional && (
                    <div className="space-y-3 pt-2 border-t border-sand-200">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value)
                            setError(null)
                          }}
                          placeholder="Jean Dupont"
                          className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          inputMode="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(formatPhone(e.target.value))
                            setError(null)
                          }}
                          placeholder="06 12 34 56 78"
                          className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          Poste / Fonction
                        </label>
                        <input
                          type="text"
                          value={position}
                          onChange={(e) => {
                            setPosition(e.target.value)
                            setError(null)
                          }}
                          placeholder="Gérant, Artisan plombier, Chef d'entreprise..."
                          className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                    className="flex-1 bg-sand-100 text-charcoal-700 py-3 rounded-xl font-medium hover:bg-sand-300 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleClaim}
                    disabled={isLoading || !isFormValid}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Envoyer ma demande'
                    )}
                  </button>
                </div>

                <p className="mt-4 text-xs text-charcoal-400 text-center">
                  Un administrateur vérifiera et validera votre demande rapidement.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
