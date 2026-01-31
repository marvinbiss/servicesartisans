'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wrench, Zap, Key, Flame, PaintBucket, Home, Hammer, HardHat,
  MapPin, Phone, Mail, User, FileText, CheckCircle, ArrowRight, ArrowLeft
} from 'lucide-react'

const services = [
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

  const handleServiceSelect = (slug: string) => {
    setFormData({ ...formData, service: slug })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulation d'envoi
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Demande envoyée !
          </h1>
          <p className="text-gray-600 mb-8">
            Votre demande de devis a bien été envoyée. Vous recevrez jusqu'à 3 devis d'artisans qualifiés sous 24h.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Demandez un devis gratuit
          </h1>
          <p className="text-xl text-blue-100">
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
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quel type d'artisan recherchez-vous ?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.map((service) => {
                  const Icon = service.icon
                  return (
                    <button
                      key={service.slug}
                      type="button"
                      onClick={() => handleServiceSelect(service.slug)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.service === service.slug
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                        formData.service === service.slug ? 'bg-blue-200' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          formData.service === service.slug ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className={`font-medium ${
                        formData.service === service.slug ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {service.name}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => formData.service && setStep(2)}
                  disabled={!formData.service}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Projet */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Décrivez votre projet
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgence du projet
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {urgencyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: option.value })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.urgency === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Décrivez vos travaux
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez votre besoin en détail..."
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.codePostal}
                        onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                        placeholder="75001"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      placeholder="Paris"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Coordonnées */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Vos coordonnées
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean.dupont@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800">
                    <strong>Gratuit et sans engagement.</strong> Vos informations sont protégées et ne seront transmises qu'aux artisans sélectionnés.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Recevoir mes devis
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
