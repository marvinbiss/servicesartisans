'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

interface AdminProviderActionsProps {
  providerId: string
  isActive: boolean
}

export function AdminProviderActions({ providerId, isActive }: AdminProviderActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const toggleActive = async () => {
    setIsLoading(true)
    try {
      await fetch(`/api/admin/providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProvider = async () => {
    if (!confirm('Supprimer cet artisan ?')) return

    setIsLoading(true)
    try {
      await fetch(`/api/admin/providers/${providerId}`, {
        method: 'DELETE',
      })
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleActive}
        disabled={isLoading}
      >
        {isActive ? 'Désactiver' : 'Activer'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteProvider}
        disabled={isLoading}
        className="text-red-600"
      >
        Supprimer
      </Button>
    </div>
  )
}
