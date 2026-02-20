'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, Shield } from 'lucide-react'
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
        {artisan.accepts_new_clients === true && (
          <div className="flex items-center gap-2 text-green-600 mb-4 pb-4 border-b border-gray-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-medium">Accepte de nouveaux clients</span>
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
              aria-label={showPhone ? `Appeler ${artisan.phone}` : 'Afficher le numéro de téléphone'}
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
              {showPhone ? artisan.phone : 'Afficher le téléphone'}
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
              aria-label={`Envoyer un email à ${artisan.email}`}
            >
              <Mail className="w-5 h-5 text-slate-400" aria-hidden="true" />
              Envoyer un email
            </motion.button>
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
  const [showPhone, setShowPhone] = useState(false)

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
        className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 md:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        role="group"
        aria-label="Actions rapides"
      >
        <div className="flex gap-3">
          {artisan.phone && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { if (showPhone) handleCall(); else setShowPhone(true) }}
              className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-0"
              aria-label={showPhone ? `Appeler l'artisan au ${artisan.phone}` : 'Afficher le numéro de téléphone'}
            >
              <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate text-sm">{showPhone ? artisan.phone : 'Voir le numéro'}</span>
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
