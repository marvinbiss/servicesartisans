'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { Artisan, getDisplayName } from './types'

interface ArtisanQuoteFormProps {
  artisan: Artisan
}

interface FormData {
  description: string
  urgence: string
  nom: string
  telephone: string
  email: string
}

interface FormErrors {
  description?: string
  nom?: string
  telephone?: string
  email?: string
}

const PHONE_REGEX = /^(0[1-9]\d{8}|\+33[1-9]\d{8}|0033[1-9]\d{8})$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ArtisanQuoteForm({ artisan }: ArtisanQuoteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    description: '',
    urgence: 'Ce mois-ci',
    nom: '',
    telephone: '',
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const displayName = getDisplayName(artisan)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!formData.description.trim()) {
      errs.description = 'Veuillez décrire votre projet'
    }
    if (!formData.nom.trim()) {
      errs.nom = 'Veuillez indiquer votre nom'
    }
    const cleanPhone = formData.telephone.replace(/\s+/g, '')
    if (!cleanPhone) {
      errs.telephone = 'Veuillez indiquer votre téléphone'
    } else if (!PHONE_REGEX.test(cleanPhone)) {
      errs.telephone = 'Numéro de téléphone invalide'
    }
    if (!formData.email.trim()) {
      errs.email = 'Veuillez indiquer votre email'
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = 'Adresse email invalide'
    }
    return errs
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)

    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: artisan.specialty || 'artisan',
          urgency: formData.urgence,
          description: formData.description.trim(),
          nom: formData.nom.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.replace(/\s+/g, ''),
          ville: artisan.city || '',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Une erreur est survenue')
      }

      setSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const inputClasses = (field: keyof FormErrors) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
      errors[field]
        ? 'border-red-400 bg-red-50'
        : 'border-sand-200 bg-white hover:border-primary-300'
    }`

  return (
    <div className="bg-white rounded-2xl shadow-soft border-2 border-primary-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-400 to-primary-600 px-6 py-5">
        <h2 className="font-heading text-xl font-bold text-white">
          Demander un devis gratuit
        </h2>
        <p className="text-primary-100 text-sm mt-1">
          Recevez jusqu'à 3 devis de professionnels qualifiés
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
              </motion.div>
              <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-2">
                Votre demande a été envoyée !
              </h3>
              <p className="text-charcoal-600 text-sm">
                Vous recevrez jusqu'à 3 devis sous 24h
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              noValidate
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Description */}
              <div>
                <label htmlFor="devis-description" className="block text-sm font-medium text-charcoal-700 mb-1">
                  Description du projet
                </label>
                <textarea
                  id="devis-description"
                  rows={3}
                  placeholder="Décrivez votre besoin en quelques mots..."
                  value={formData.description}
                  onChange={e => updateField('description', e.target.value)}
                  className={inputClasses('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Urgence */}
              <div>
                <label htmlFor="devis-urgence" className="block text-sm font-medium text-charcoal-700 mb-1">
                  Urgence
                </label>
                <select
                  id="devis-urgence"
                  value={formData.urgence}
                  onChange={e => updateField('urgence', e.target.value)}
                  className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2.5 text-sm text-charcoal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 hover:border-primary-300"
                >
                  <option value="Pas urgent">Pas urgent</option>
                  <option value="Ce mois-ci">Ce mois-ci</option>
                  <option value="Cette semaine">Cette semaine</option>
                  <option value="Urgent (sous 24h)">Urgent (sous 24h)</option>
                </select>
              </div>

              {/* Nom + Téléphone on same row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="devis-nom" className="block text-sm font-medium text-charcoal-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    id="devis-nom"
                    type="text"
                    placeholder="Votre nom"
                    value={formData.nom}
                    onChange={e => updateField('nom', e.target.value)}
                    className={inputClasses('nom')}
                  />
                  {errors.nom && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />
                      {errors.nom}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="devis-telephone" className="block text-sm font-medium text-charcoal-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    id="devis-telephone"
                    type="tel"
                    placeholder="06 XX XX XX XX"
                    value={formData.telephone}
                    onChange={e => updateField('telephone', e.target.value)}
                    className={inputClasses('telephone')}
                  />
                  {errors.telephone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />
                      {errors.telephone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="devis-email" className="block text-sm font-medium text-charcoal-700 mb-1">
                  Email
                </label>
                <input
                  id="devis-email"
                  type="email"
                  placeholder="votre@email.fr"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  className={inputClasses('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {submitError}
                </div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-cta hover:from-primary-500 hover:to-primary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={`Demander un devis gratuit à ${displayName}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  <>
                    <Send className="w-5 h-5" aria-hidden="true" />
                    Recevoir mes devis gratuits
                  </>
                )}
              </motion.button>

              {/* Trust footer */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <Shield className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" aria-hidden="true" />
                <p className="text-xs text-charcoal-500">
                  Gratuit · Sans engagement · Réponse sous 24h
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
