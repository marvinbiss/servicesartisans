'use client'

import { useState, useEffect } from 'react'
import { Trash2, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'

interface RemovalRequestButtonProps {
  providerId: string
  providerName: string
  hasSiret: boolean
}

export function RemovalRequestButton({
  providerId,
  providerName,
  hasSiret,
}: RemovalRequestButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [siret, setSiret] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  const formatSiret = (value: string) => {
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

  const isFormValid = siret.length === 14 && requesterName.trim().length >= 2 && email.includes('@')

  const handleSubmit = async () => {
    if (siret.length !== 14) {
      setError('Le SIRET doit contenir exactement 14 chiffres')
      return
    }
    if (requesterName.trim().length < 2) {
      setError('Veuillez entrer votre nom complet')
      return
    }
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/artisan/removal-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          siret,
          requesterName: requesterName.trim(),
          requesterEmail: email.trim().toLowerCase(),
          reason: reason.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la soumission')
        return
      }

      setSuccess(true)
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasSiret) return null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-charcoal-400 hover:text-red-500 underline underline-offset-2 transition-colors"
      >
        Vous êtes cet artisan ? Demander la suppression de cette fiche
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isLoading && setShowModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => !isLoading && setShowModal(false)}
              className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal-400 hover:text-charcoal-600 rounded-lg hover:bg-sand-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">Demande enregistrée</h3>
                <p className="text-charcoal-600 mb-4">
                  Votre demande de suppression pour <strong>{providerName}</strong> a bien été prise
                  en compte.
                </p>
                <p className="text-sm text-charcoal-500 mb-6">
                  La fiche a été immédiatement retirée de l&apos;indexation Google. Un
                  administrateur traitera votre demande sous 72 heures conformément au RGPD.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-sand-100 text-charcoal-700 px-6 py-2.5 rounded-xl font-medium hover:bg-sand-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal-900">Demander la suppression</h3>
                    <p className="text-sm text-charcoal-500">{providerName}</p>
                  </div>
                </div>

                <p className="text-sm text-charcoal-600 mb-4">
                  Conformément au RGPD (Art. 21), vous pouvez demander la suppression de cette
                  fiche. Votre SIRET (14 chiffres) est requis pour vérifier votre identité.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={requesterName}
                      onChange={(e) => {
                        setRequesterName(e.target.value)
                        setError(null)
                      }}
                      placeholder="Jean Dupont"
                      className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Email <span className="text-red-500">*</span>
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
                      className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      SIRET <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formatSiret(siret)}
                      onChange={(e) => handleSiretChange(e.target.value)}
                      placeholder="XXX XXX XXX XXXXX"
                      className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg tracking-wider font-mono"
                      maxLength={17}
                      inputMode="numeric"
                      disabled={isLoading}
                    />
                    <p className="mt-1 text-xs text-charcoal-500">
                      14 chiffres — visible sur votre extrait Kbis
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Motif <span className="text-charcoal-400 font-normal">(optionnel)</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Entreprise fermée, ne souhaite pas apparaître..."
                      rows={3}
                      maxLength={2000}
                      className="w-full px-3 py-2.5 border border-sand-400 rounded-xl text-charcoal-900 placeholder-charcoal-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                      disabled={isLoading}
                    />
                  </div>
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
                    onClick={handleSubmit}
                    disabled={isLoading || !isFormValid}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Demander la suppression'
                    )}
                  </button>
                </div>

                <p className="mt-4 text-xs text-charcoal-400 text-center">
                  La fiche sera immédiatement retirée de Google. Traitement définitif sous 72h (RGPD
                  Art. 21).
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
