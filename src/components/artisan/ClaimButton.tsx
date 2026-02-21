'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'

interface ClaimButtonProps {
  providerId: string
  providerName: string
  hasSiret: boolean
}

export function ClaimButton({ providerId, providerName, hasSiret }: ClaimButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [siret, setSiret] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Format SIRET with spaces for display (XXX XXX XXX XXXXX)
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

  const handleClaim = async () => {
    if (siret.length !== 14) {
      setError('Le SIRET doit contenir exactement 14 chiffres')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/artisan/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, siret }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Not logged in — redirect to login with return URL
          router.push(`/connexion?redirect=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        setError(data.error || 'Erreur lors de la revendication')
        return
      }

      setSuccess(true)
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasSiret) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Vous êtes cet artisan ?</p>
            <p className="text-sm text-amber-700 mt-1">
              Cette fiche ne peut pas encore être revendiquée automatiquement.
              Contactez-nous à{' '}
              <a href="mailto:support@servicesartisans.fr" className="underline font-medium">
                support@servicesartisans.fr
              </a>{' '}
              avec une copie de votre extrait Kbis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
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
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Close button */}
            <button
              onClick={() => !isLoading && setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              // Success state
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Demande envoyée !
                </h3>
                <p className="text-gray-600 mb-6">
                  Votre demande de revendication pour <strong>{providerName}</strong> a été soumise.
                  Un administrateur la validera sous 24 à 48 heures.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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
                    <h3 className="text-lg font-bold text-gray-900">
                      Revendiquer cette fiche
                    </h3>
                    <p className="text-sm text-gray-500">{providerName}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Pour vérifier que vous êtes bien le propriétaire de cette entreprise,
                  veuillez entrer votre numéro SIRET (14 chiffres).
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Numéro SIRET
                  </label>
                  <input
                    type="text"
                    value={formatSiret(siret)}
                    onChange={(e) => handleSiretChange(e.target.value)}
                    placeholder="XXX XXX XXX XXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg tracking-wider font-mono"
                    maxLength={17}
                    disabled={isLoading}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Votre SIRET figure sur votre extrait Kbis ou sur{' '}
                    <a
                      href="https://www.societe.com"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      societe.com
                    </a>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleClaim}
                    disabled={isLoading || siret.length !== 14}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Envoyer ma demande'
                    )}
                  </button>
                </div>

                <p className="mt-4 text-xs text-gray-400 text-center">
                  Un administrateur vérifiera et validera votre demande sous 24 à 48h.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
