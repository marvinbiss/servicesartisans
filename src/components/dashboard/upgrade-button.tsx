'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface UpgradeButtonProps {
  planId: string
  className?: string
}

export function UpgradeButton({ planId, className }: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async () => {
    if (planId === 'free') return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Impossible de démarrer le paiement. Veuillez réessayer.')
      }
    } catch (err) {
      console.error('Upgrade error:', err)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleUpgrade}
        disabled={isLoading || planId === 'free'}
        className={className}
      >
        {planId === 'free' ? 'Plan gratuit' : isLoading ? 'Chargement...' : 'Choisir ce plan'}
      </Button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
