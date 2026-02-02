'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📧</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Vérifiez votre email
        </h3>
        <p className="text-gray-600">
          Un lien de confirmation a été envoyé à <strong>{formData.email}</strong>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email professionnel
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="vous@entreprise.fr"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="8 caractères minimum"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Au moins 8 caractères
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmer le mot de passe
        </label>
        <Input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="••••••••"
          required
        />
      </div>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
          className="rounded border-gray-300 mt-1"
        />
        <span className="text-sm text-gray-600">
          J'accepte les{' '}
          <a href="/cgv" className="text-blue-600 underline">
            conditions générales d'utilisation
          </a>{' '}
          et la{' '}
          <a href="/confidentialite" className="text-blue-600 underline">
            politique de confidentialité
          </a>
        </span>
      </label>

      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? 'Création...' : 'Créer mon compte'}
      </Button>
    </form>
  )
}
