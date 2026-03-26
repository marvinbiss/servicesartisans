'use client'

import { useState } from 'react'
import { Button, Input, Textarea } from '@/components/ui'

interface QuoteFormProps {
  providerId: string
  serviceSlug: string
  onSuccess?: () => void
}

export function QuoteForm({ providerId: _providerId, serviceSlug, onSuccess }: QuoteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    description: '',
    urgency: 'mois',
    city: '',
    postal_code: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceSlug,
          urgency: formData.urgency,
          description: formData.description,
          nom: formData.client_name,
          email: formData.client_email,
          telephone: formData.client_phone,
          ville: formData.city,
          codePostal: formData.postal_code,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Erreur lors de l\'envoi')
      }

      setIsSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-600 font-medium">Demande envoyée !</p>
        <p className="text-sm text-gray-500 mt-1">
          L'artisan vous contactera dans les meilleurs délais.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSuccess(false)}
          className="mt-3"
        >
          Nouvelle demande
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <Input
        placeholder="Votre nom *"
        value={formData.client_name}
        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
        required
      />

      <Input
        type="tel"
        inputMode="tel"
        placeholder="Téléphone *"
        value={formData.client_phone}
        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
        required
      />

      <Input
        type="email"
        inputMode="email"
        placeholder="Email *"
        value={formData.client_email}
        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
        required
      />

      <Textarea
        placeholder="Décrivez votre besoin *"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        required
      />

      <select
        value={formData.urgency}
        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="mois">Normal (ce mois-ci)</option>
        <option value="semaine">Cette semaine</option>
        <option value="urgent">Urgent (sous 48h)</option>
      </select>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Ville"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
        <Input
          placeholder="Code postal"
          value={formData.postal_code}
          onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
          maxLength={5}
        />
      </div>

      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? 'Envoi...' : 'Envoyer ma demande'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        En soumettant, vous acceptez d'être contacté par l'artisan.
      </p>
    </form>
  )
}
