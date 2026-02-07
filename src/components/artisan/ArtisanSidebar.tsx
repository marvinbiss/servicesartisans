'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, CheckCircle, Zap, Clock, Shield, FileCheck, Award, Lock } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'
import { QuoteRequestModal } from './QuoteRequestModal'

interface ArtisanSidebarProps {
  artisan: LegacyArtisan
}

export function ArtisanSidebar({ artisan }: ArtisanSidebarProps) {
  const [showPhone, setShowPhone] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  const handleCall = () => {
    if (artisan.phone) {
      window.location.href = `tel:${artisan.phone.replace(/\s/g, '')}`
    }
  }

  const handleEmail = () => {
    if (artisan.email) {
      window.location.href = `mailto:${artisan.email}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24"
    >
      {/* Status */}
      {artisan.accepts_new_clients !== false && (
        <div className="flex items-center gap-2 text-green-600 mb-4 pb-4 border-b border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Accepte de nouveaux clients</span>
        </div>
      )}

      {/* Price */}
      {artisan.hourly_rate && (
        <div className="mb-6">
          <div className="text-sm text-gray-500">A partir de</div>
          <div className="text-3xl font-bold text-gray-900">
            {artisan.hourly_rate}€<span className="text-lg text-gray-500 font-normal">/heure</span>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="space-y-3 mb-6" role="group" aria-label="Actions de contact">
        {artisan.phone && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => showPhone ? handleCall() : setShowPhone(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={showPhone ? `Appeler ${artisan.phone}` : 'Afficher le numero de telephone'}
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            {showPhone ? artisan.phone : 'Afficher le telephone'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQuoteModal(true)}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Ouvrir le formulaire de demande de devis gratuit"
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          Demander un devis gratuit
        </motion.button>

        {/* Quote Request Modal */}
        <QuoteRequestModal
          artisan={artisan}
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
        />

        {artisan.email && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmail}
            className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`Envoyer un email a ${artisan.email}`}
          >
            <Mail className="w-5 h-5" aria-hidden="true" />
            Envoyer un email
          </motion.button>
        )}
      </div>

      {/* Quick info */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>Repond en {artisan.response_time || '< 2h'}</span>
        </div>
        {artisan.response_rate && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Taux de reponse : {artisan.response_rate}%</span>
          </div>
        )}
        {artisan.emergency_available && (
          <div className="flex items-center gap-3 text-sm text-red-600">
            <Zap className="w-4 h-4" />
            <span className="font-medium">Urgences 24h/24</span>
          </div>
        )}
      </div>

      {/* Trust badges */}
      <div className="space-y-2 mb-6 pb-6 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Verifications</h4>
        {artisan.is_verified && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Identite verifiee (SIRET)</span>
          </div>
        )}
        {artisan.insurance && artisan.insurance.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileCheck className="w-4 h-4 text-green-500" />
            <span>Assurance verifiee</span>
          </div>
        )}
        {artisan.certifications && artisan.certifications.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4 text-purple-500" />
            <span>{artisan.certifications.length} certification(s)</span>
          </div>
        )}
      </div>

      {/* Escrow Notice */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 text-sm">Protection Escrow</p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Pour les projets de +500€, securisez votre paiement. Les fonds sont bloques jusqu'a validation des travaux.
            </p>
          </div>
        </div>
      </div>

      {/* SIRET */}
      {artisan.siret && (
        <div className="pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            SIRET: {artisan.siret}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Mobile CTA bar
export function ArtisanMobileCTA({ artisan }: ArtisanSidebarProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  const handleCall = () => {
    if (artisan.phone) {
      window.location.href = `tel:${artisan.phone.replace(/\s/g, '')}`
    }
  }

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50 safe-area-bottom"
        role="group"
        aria-label="Actions rapides"
      >
        <div className="flex gap-3">
          {artisan.phone && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCall}
              className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Appeler l'artisan au ${artisan.phone}`}
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
              Appeler
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQuoteModal(true)}
            className="flex-1 py-3.5 px-4 rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Demander un devis gratuit"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Devis gratuit
          </motion.button>
        </div>
      </motion.div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        artisan={artisan}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </>
  )
}
