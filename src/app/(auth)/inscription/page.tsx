'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

interface FormErrors {
  [key: string]: string
}

export default function InscriptionPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600']

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule'
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une minuscule'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins un chiffre'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (!acceptTerms) {
      newErrors.terms = 'Vous devez accepter les conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          acceptTerms: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.details?.fields) {
          setErrors(data.error.details.fields)
        } else {
          setGeneralError(data.error?.message || 'Une erreur est survenue')
        }
        return
      }

      setIsSubmitted(true)
    } catch (_error) {
      setGeneralError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Inscription réussie !
          </h1>
          <p className="text-gray-600 mb-8">
            Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
            Cliquez sur le lien pour activer votre compte.
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
          >
            Se connecter
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="flex flex-1">
        {/* Left - Image */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 items-center justify-center p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="max-w-md text-white text-center relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl font-bold">SA</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Rejoignez ServicesArtisans
            </h2>
            <p className="text-primary-100 text-lg mb-10">
              Créez votre compte gratuitement et trouvez les meilleurs artisans pour vos projets.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span>Demandes de devis gratuites et illimitées</span>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span>Artisans référencés et qualifiés</span>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span>Réservation en ligne simple et rapide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[{ label: 'Inscription' }]}
              className="mb-6 text-gray-400 [&_a]:text-gray-400 [&_a:hover]:text-white [&_svg]:text-gray-500"
            />

            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">SA</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  Services<span className="text-primary-400">Artisans</span>
                </span>
              </Link>
              <h1 className="text-3xl font-bold text-white mb-2">
                Créer un compte
              </h1>
              <p className="text-gray-400">
                Inscrivez-vous gratuitement
              </p>
            </div>

            {generalError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800 border ${errors.firstName ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                      placeholder="Jean"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-800 border ${errors.lastName ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="Dupont"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="8 caractères minimum"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-slate-700'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Force: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Très faible'}
                    </p>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded bg-slate-800 border-slate-700 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-400">
                  J'accepte les{' '}
                  <Link href="/cgv" className="text-primary-400 hover:underline">
                    conditions générales
                  </Link>{' '}
                  et la{' '}
                  <Link href="/confidentialite" className="text-primary-400 hover:underline">
                    politique de confidentialité
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="text-sm text-red-400">{errors.terms}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Déjà un compte ?{' '}
                <Link href="/connexion" className="text-primary-400 hover:text-primary-300 font-medium">
                  Se connecter
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Vous êtes artisan ?{' '}
              <Link href="/inscription-artisan" className="text-primary-400 hover:underline">
                Inscrivez votre entreprise
              </Link>
            </p>

            {/* Contextual Links */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-gray-400 text-sm mb-3">Liens utiles :</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link href="/comment-ca-marche" className="text-primary-400 hover:text-primary-300">
                  Comment ça marche ?
                </Link>
                <Link href="/faq" className="text-primary-400 hover:text-primary-300">
                  Questions fréquentes
                </Link>
                <Link href="/devis" className="text-primary-400 hover:text-primary-300">
                  Demander un devis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Links Section */}
      <section className="bg-slate-800/50 py-10 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-white mb-6">
            Découvrez nos services
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PopularServicesLinks className="[&_h3]:text-gray-300 [&_a]:bg-slate-700 [&_a]:text-gray-300 [&_a:hover]:bg-primary-600 [&_a:hover]:text-white" />
            <PopularCitiesLinks className="[&_h3]:text-gray-300 [&_a]:bg-slate-700 [&_a]:text-gray-300 [&_a:hover]:bg-primary-600 [&_a:hover]:text-white" />
          </div>
        </div>
      </section>
    </div>
  )
}
