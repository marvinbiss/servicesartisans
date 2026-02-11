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
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

      <div className="p-6">
        {/* Status */}
        {artisan.accepts_new_clients !== false && (
          <div className="flex items-center gap-2 text-green-600 mb-4 pb-4 border-b border-gray-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-medium">Accepte de nouveaux clients</span>
          </div>
        )}

        {/* Price */}
        {artisan.hourly_rate && (
          <div className="mb-6">
            <div className="text-sm text-slate-500">&Agrave; partir de</div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {artisan.hourly_rate}&euro;<span className="text-lg text-slate-400 font-normal">/heure</span>
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
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={showPhone ? `Appeler ${artisan.phone}` : 'Afficher le num\u00e9ro de t\u00e9l\u00e9phone'}
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
              {showPhone ? artisan.phone : 'Afficher le t\u00e9l\u00e9phone'}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQuoteModal(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-slate-700 font-medium flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label={`Envoyer un email \u00e0 ${artisan.email}`}
            >
              <Mail className="w-5 h-5 text-slate-400" aria-hidden="true" />
              Envoyer un email
            </motion.button>
          )}
        </div>

        {/* Quick info */}
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span>R&eacute;pond en {artisan.response_time || '< 2h'}</span>
          </div>
          {artisan.response_rate && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              </div>
              <span>Taux de r&eacute;ponse : {artisan.response_rate}%</span>
            </div>
          )}
          {artisan.emergency_available && (
            <div className="flex items-center gap-3 text-sm text-red-600">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="font-medium">Urgences 24h/24</span>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="space-y-2.5 mb-6 pb-6 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">V&eacute;rifications</h4>
          {artisan.is_verified && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Identit&eacute; v&eacute;rifi&eacute;e (SIRET)</span>
            </div>
          )}
          {artisan.insurance && artisan.insurance.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <FileCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Assurance v&eacute;rifi&eacute;e</span>
            </div>
          )}
          {artisan.certifications && artisan.certifications.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>{artisan.certifications.length} certification(s)</span>
            </div>
          )}
        </div>

        {/* Escrow Notice */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">Protection Escrow</p>
              <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                Pour les projets de +500&euro;, s&eacute;curisez votre paiement. Les fonds sont bloqu&eacute;s jusqu&apos;&agrave; validation des travaux.
              </p>
            </div>
          </div>
        </div>

        {/* SIRET */}
        {artisan.siret && (
          <div className="pt-4 border-t border-gray-100">
            <div className="text-xs text-slate-400 font-mono">
              SIRET : {artisan.siret}
            </div>
          </div>
        )}
      </div>
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
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 md:hidden z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        role="group"
        aria-label="Actions rapides"
      >
        {/* Price hint */}
        {artisan.hourly_rate && (
          <div className="flex items-baseline gap-1 mb-2.5">
            <span className="text-lg font-bold text-gray-900">{artisan.hourly_rate}&euro;</span>
            <span className="text-sm text-slate-500">/heure</span>
          </div>
        )}
        <div className="flex gap-3">
          {artisan.phone && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCall}
              className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Appeler l'artisan au ${artisan.phone}`}
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
              Appeler
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQuoteModal(true)}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
