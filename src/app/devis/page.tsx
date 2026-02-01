'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import {
  Wrench, Zap, Key, Flame, PaintBucket, Home, Hammer, HardHat,
  MapPin, Phone, Mail, User, FileText, CheckCircle, ArrowRight, ArrowLeft,
  Loader2, AlertCircle, Sparkles
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'
import { MetierAutocomplete } from '@/components/ui/MetierAutocomplete'
import { VilleAutocomplete } from '@/components/ui/VilleAutocomplete'

const servicesGrid = [
  { name: 'Plombier', slug: 'plombier', icon: Wrench },
  { name: 'Électricien', slug: 'electricien', icon: Zap },
  { name: 'Serrurier', slug: 'serrurier', icon: Key },
  { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame },
  { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket },
  { name: 'Couvreur', slug: 'couvreur', icon: Home },
  { name: 'Menuisier', slug: 'menuisier', icon: Hammer },
  { name: 'Maçon', slug: 'macon', icon: HardHat },
]

const urgencyOptions = [
  { value: 'urgent', label: 'Urgent (sous 24h)', color: 'red' },
  { value: 'semaine', label: 'Cette semaine', color: 'orange' },
  { value: 'mois', label: 'Ce mois-ci', color: 'blue' },
  { value: 'flexible', label: 'Flexible', color: 'green' },
]

export default function DevisPage() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    service: '',
    urgency: '',
    description: '',
    codePostal: '',
    ville: '',
    nom: '',
    email: '',
    telephone: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Optimized form field updater
  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Smooth step navigation
  const goToStep = useCallback((newStep: number) => {
    setDirection(newStep > step ? 'forward' : 'back')
    startTransition(() => {
      setStep(newStep)
    })
  }, [step])

  const handleServiceSelect = useCallback((slug: string) => {
    updateField('service', slug)
  }, [updateField])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la demande')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 text-center animate-[scaleIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-[bounce_1s_ease-in-out]">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Félicitations</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Demande envoyée !
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Votre demande de devis a bien été envoyée. Vous recevrez jusqu'à <strong className="text-gray-900">3 devis d'artisans qualifiés</strong> sous 24h.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Retour à l'accueil
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  // Step animation classes
  const stepAnimationClass = direction === 'forward'
    ? 'animate-[slideInRight_0.4s_cubic-bezier(0.16,1,0.3,1)]'
    : 'animate-[slideInLeft_0.4s_cubic-bezier(0.16,1,0.3,1)]'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[{ label: 'Demander un devis' }]}
            className="mb-6 text-blue-100 [&_a]:text-blue-200 [&_a:hover]:text-white [&_svg]:text-blue-300"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Demandez un devis gratuit
          </h1>
          <p className="text-xl text-blue-100 text-center">
            Recevez jusqu'à 3 devis d'artisans qualifiés près de chez vous
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                <span className={`ml-2 hidden sm:block ${step >= s ? 'text-gray-900' : 'text-gray-500'}`}>
                  {s === 1 ? 'Service' : s === 2 ? 'Projet' : 'Coordonnées'}
                </span>
                {s < 3 && (
                  <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Service */}
          {step === 1 && (
            <div className={`bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_12px_40px_-4px_rgba(0,0,0,0.08)] p-6 md:p-8 ${stepAnimationClass}`}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quel type d'artisan recherchez-vous ?
              </h2>

              {/* Autocomplete Search - World-class UX */}
              <div className="mb-6">
                <MetierAutocomplete
                  value={formData.service}
                  onSelect={(service) => {
                    updateField('service', service.slug)
                  }}
                  onClear={() => updateField('service', '')}
                  placeholder="Rechercher un metier (plombier, electricien...)"
                  showAllOnFocus={true}
                  maxSuggestions={10}
                />
              </div>

              {/* Quick selection grid for popular services */}
              <div className="border-t pt-6">
                <p className="text-sm text-gray-500 mb-4">Ou selectionnez directement :</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {servicesGrid.map((service, index) => {
                    const Icon = service.icon
                    const isSelected = formData.service === service.slug
                    return (
                      <button
                        key={service.slug}
                        type="button"
                        onClick={() => handleServiceSelect(service.slug)}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform hover:scale-[1.02] active:scale-[0.98] ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1.5 transition-all duration-300 ${
                          isSelected ? 'bg-blue-600 scale-110' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 transition-colors duration-300 ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className={`text-sm font-medium transition-colors duration-300 ${
                          isSelected ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {service.name}
                        </div>
                        {isSelected && (
                          <div className="mt-1 flex justify-center">
                            <CheckCircle className="w-4 h-4 text-blue-600 animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => formData.service && goToStep(2)}
                  disabled={!formData.service}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Projet */}
          {step === 2 && (
            <div className={`bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_12px_40px_-4px_rgba(0,0,0,0.08)] p-6 md:p-8 ${stepAnimationClass}`}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Décrivez votre projet
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Urgence du projet
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {urgencyOptions.map((option) => {
                      const isSelected = formData.urgency === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField('urgency', option.value)}
                          className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform hover:scale-[1.02] active:scale-[0.98] ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md shadow-blue-500/10'
                              : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                          {isSelected && <CheckCircle className="w-4 h-4 inline-block ml-2 animate-[scaleIn_0.3s_ease-out]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Décrivez vos travaux
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Décrivez votre besoin en détail..."
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville ou code postal
                  </label>
                  <VilleAutocomplete
                    value={formData.ville}
                    onSelect={(ville, codePostal) => {
                      updateField('ville', ville)
                      updateField('codePostal', codePostal)
                    }}
                    onClear={() => {
                      updateField('ville', '')
                      updateField('codePostal', '')
                    }}
                    showGeolocation={true}
                    placeholder="Rechercher votre ville..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Coordonnées */}
          {step === 3 && (
            <div className={`bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_12px_40px_-4px_rgba(0,0,0,0.08)] p-6 md:p-8 ${stepAnimationClass}`}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Vos coordonnées
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-[shake_0.5s_ease-in-out]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => updateField('nom', e.target.value)}
                      placeholder="Jean Dupont"
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="jean.dupont@email.com"
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => updateField('telephone', e.target.value)}
                      placeholder="06 12 34 56 78"
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mt-6 border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Gratuit et sans engagement.</strong> Vos informations sont protégées et ne seront transmises qu'aux artisans sélectionnés.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] animate-[buttonShine_3s_infinite]" />
                      Recevoir mes devis
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Contextual Links */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vous ne trouvez pas votre service ?
          </h3>
          <p className="text-gray-600 mb-4">
            Consultez notre liste complète de services ou découvrez les artisans disponibles dans les principales villes de France.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Tous nos services <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/comment-ca-marche"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Comment ça marche ? <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Questions fréquentes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Related Links Section */}
      <section className="bg-gray-100 py-12 mt-8">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Trouvez un artisan près de chez vous
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PopularServicesLinks />
            <PopularCitiesLinks />
          </div>
        </div>
      </section>
    </div>
  )
}
