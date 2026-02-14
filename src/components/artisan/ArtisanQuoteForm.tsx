'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, User, Mail, Phone, MapPin, Send,
  CheckCircle, Loader2, ArrowRight, ArrowLeft, Shield, Clock,
} from 'lucide-react'
import { Artisan, getDisplayName } from './types'
import { submitLead } from '@/app/actions/lead'

interface ArtisanQuoteFormProps {
  artisan: Artisan
}

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  description: string
  urgency: 'normal' | 'urgent' | 'flexible'
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  description: '',
  urgency: 'normal',
}

export function ArtisanQuoteForm({ artisan }: ArtisanQuoteFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const displayName = getDisplayName(artisan)

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.description.trim()) {
      newErrors.description = 'Décrivez votre besoin'
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description trop courte (min 20 caractères)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Votre nom est requis'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Votre email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Votre téléphone est requis'
    } else if (!/^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return

    setIsSubmitting(true)
    setServerError(null)

    try {
      const fd = new window.FormData()
      fd.set('providerId', artisan.id)
      fd.set('serviceName', artisan.specialty || 'Service')
      fd.set('name', formData.name)
      fd.set('email', formData.email)
      fd.set('phone', formData.phone.replace(/\s/g, ''))
      fd.set('postalCode', artisan.postal_code || '')
      fd.set('city', artisan.city || '')
      fd.set('description', formData.description)
      fd.set('urgency', formData.urgency)

      const result = await submitLead({ success: false }, fd)

      if (result.success) {
        setIsSuccess(true)
      } else {
        setServerError(result.error || 'Erreur lors de l\'envoi')
      }
    } catch {
      setServerError('Erreur de connexion. Réessayez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setIsSuccess(false)
    setServerError(null)
    setErrors({})
    setStep(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-green-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Demande de devis gratuit</h2>
            <p className="text-green-100 text-sm mt-1">
              Recevez un devis personnalisé de {displayName}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
            <Clock className="w-4 h-4 text-white" aria-hidden="true" />
            <span className="text-white text-xs font-medium">Réponse en &lt; 2h</span>
          </div>
        </div>

        {/* Step indicator */}
        {!isSuccess && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 1 ? 'bg-white text-green-700' : 'bg-white/30 text-white'
              }`}>
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-sm ${step === 1 ? 'text-white font-medium' : 'text-green-200'}`}>
                Description
              </span>
            </div>
            <div className="w-8 h-0.5 bg-white/30" />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 2 ? 'bg-white text-green-700' : 'bg-white/30 text-white'
              }`}>
                2
              </div>
              <span className={`text-sm ${step === 2 ? 'text-white font-medium' : 'text-green-200'}`}>
                Contact
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-6"
              role="status"
              aria-live="polite"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Demande envoyée !
              </h3>
              <p className="text-gray-600 mb-6">
                {displayName} vous répondra dans les meilleurs délais.
              </p>
              <button
                onClick={handleReset}
                className="text-green-600 hover:text-green-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              >
                Envoyer une autre demande
              </button>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form
                onSubmit={(e) => { e.preventDefault(); handleContinue() }}
                className="space-y-4"
                noValidate
              >
                {/* Description */}
                <div>
                  <label htmlFor="inline-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Décrivez votre projet <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only">(requis)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <textarea
                      id="inline-description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Décrivez les travaux souhaités, le contexte, les contraintes éventuelles..."
                      rows={4}
                      aria-required="true"
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? 'inline-desc-error' : 'inline-desc-hint'}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none`}
                    />
                  </div>
                  {errors.description ? (
                    <p id="inline-desc-error" className="mt-1 text-sm text-red-600" role="alert">{errors.description}</p>
                  ) : (
                    <p id="inline-desc-hint" className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/500 caractères
                    </p>
                  )}
                </div>

                {/* Urgency */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-1.5">
                    Délai souhaité
                  </legend>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Délai souhaité">
                    {[
                      { value: 'urgent', label: 'Urgent', sublabel: '< 48h' },
                      { value: 'normal', label: 'Normal', sublabel: '1-2 sem' },
                      { value: 'flexible', label: 'Flexible', sublabel: 'Pas pressé' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={formData.urgency === option.value}
                        onClick={() => handleChange('urgency', option.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                          formData.urgency === option.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.sublabel}</div>
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Continue button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Continuer
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {serverError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
                    {serverError}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="inline-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Votre nom <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only">(requis)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="inline-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Jean Dupont"
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'inline-name-error' : undefined}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
                    />
                  </div>
                  {errors.name && (
                    <p id="inline-name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="inline-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Votre email <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only">(requis)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="inline-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="jean@email.com"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'inline-email-error' : undefined}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
                    />
                  </div>
                  {errors.email && (
                    <p id="inline-email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="inline-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Votre téléphone <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only">(requis)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="inline-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="06 12 34 56 78"
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'inline-phone-error' : undefined}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
                    />
                  </div>
                  {errors.phone && (
                    <p id="inline-phone-error" className="mt-1 text-sm text-red-600" role="alert">{errors.phone}</p>
                  )}
                </div>

                {/* Address (optional) */}
                <div>
                  <label htmlFor="inline-address" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresse d&apos;intervention
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="inline-address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="12 rue de la Paix, 75001 Paris"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrors({}) }}
                    className="py-3.5 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium flex items-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Retour
                  </button>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" aria-hidden="true" />
                        <span>Envoyer ma demande</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Privacy + trust */}
                <div className="flex items-start gap-2 pt-2">
                  <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p className="text-xs text-gray-500">
                    Gratuit et sans engagement. Vos données sont protégées conformément à notre politique de confidentialité.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
