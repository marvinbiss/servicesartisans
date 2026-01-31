'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Mail, Phone, MapPin, Building, FileText,
  CheckCircle, ArrowRight, ArrowLeft, Star, Users, TrendingUp
} from 'lucide-react'

const services = [
  'Plombier', 'Électricien', 'Serrurier', 'Chauffagiste',
  'Peintre', 'Couvreur', 'Menuisier', 'Maçon',
  'Carreleur', 'Plaquiste', 'Climaticien', 'Autre'
]

const benefits = [
  { icon: Users, title: 'Nouveaux clients', description: 'Recevez des demandes de devis qualifiées' },
  { icon: Star, title: 'Visibilité', description: 'Apparaissez dans les recherches locales' },
  { icon: TrendingUp, title: 'Croissance', description: 'Développez votre activité' },
]

export default function InscriptionArtisanPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Étape 1 - Entreprise
    entreprise: '',
    siret: '',
    metier: '',
    autreMetier: '',
    // Étape 2 - Contact
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    // Étape 3 - Localisation
    adresse: '',
    codePostal: '',
    ville: '',
    rayonIntervention: '30',
    // Étape 4 - Description
    description: '',
    experience: '',
    certifications: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
            Inscription reçue !
          </h1>
          <p className="text-gray-600 mb-8">
            Merci pour votre inscription. Notre équipe va vérifier vos informations et
            vous recevrez un email de confirmation sous 24-48h.
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Rejoignez le réseau ServicesArtisans
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Inscription gratuite. Recevez des demandes de devis qualifiées et
                développez votre activité.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon
                  return (
                    <div key={benefit.title} className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="font-semibold">{benefit.title}</div>
                      <div className="text-sm text-blue-200">{benefit.description}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-2xl p-6 text-gray-900">
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step >= s
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step > s ? '✓' : s}
                    </div>
                    {s < 4 && (
                      <div className={`w-8 h-1 mx-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Étape 1 - Entreprise */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Votre entreprise</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l'entreprise *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.entreprise}
                          onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Mon Entreprise"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro SIRET *
                      </label>
                      <input
                        type="text"
                        value={formData.siret}
                        onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="123 456 789 00012"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Métier principal *
                      </label>
                      <select
                        value={formData.metier}
                        onChange={(e) => setFormData({ ...formData, metier: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionnez votre métier</option>
                        {services.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    {formData.metier === 'Autre' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Précisez votre métier *
                        </label>
                        <input
                          type="text"
                          value={formData.autreMetier}
                          onChange={(e) => setFormData({ ...formData, autreMetier: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 2 - Contact */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Vos coordonnées</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                        <input
                          type="text"
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 3 - Localisation */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Zone d'intervention</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.adresse}
                          onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                        <input
                          type="text"
                          value={formData.codePostal}
                          onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                        <input
                          type="text"
                          value={formData.ville}
                          onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rayon d'intervention (km)
                      </label>
                      <select
                        value={formData.rayonIntervention}
                        onChange={(e) => setFormData({ ...formData, rayonIntervention: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="10">10 km</option>
                        <option value="20">20 km</option>
                        <option value="30">30 km</option>
                        <option value="50">50 km</option>
                        <option value="100">100 km</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Étape 4 - Description */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Présentez-vous</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description de votre activité
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Décrivez vos services, spécialités..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Années d'expérience
                      </label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 15 ans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certifications / Labels
                      </label>
                      <input
                        type="text"
                        value={formData.certifications}
                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="RGE, Qualibat, etc."
                      />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                      En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6 pt-6 border-t">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Retour
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Continuer
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Finaliser l'inscription
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Ils nous font confiance
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Pierre M.', job: 'Plombier à Lyon', text: 'Grâce à ServicesArtisans, j\'ai doublé mon chiffre d\'affaires en un an.' },
              { name: 'Sophie L.', job: 'Électricienne à Paris', text: 'Une vraie mine d\'or pour trouver de nouveaux clients qualifiés.' },
              { name: 'Marc D.', job: 'Menuisier à Bordeaux', text: 'Le meilleur investissement pour mon entreprise. Je recommande !' },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{t.text}"</p>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-500">{t.job}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
