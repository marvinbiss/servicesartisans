'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, CheckCircle, Zap, Clock, Shield } from 'lucide-react'
import { Artisan } from './types'

interface ArtisanSidebarProps {
  artisan: Artisan
}

export function ArtisanSidebar({ artisan }: ArtisanSidebarProps) {
  const [showPhone, setShowPhone] = useState(false)

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
      <div className="space-y-3 mb-6">
        {artisan.phone && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => showPhone ? handleCall() : setShowPhone(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
          >
            <Phone className="w-5 h-5" />
            {showPhone ? artisan.phone : 'Afficher le telephone'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-shadow"
        >
          <MessageCircle className="w-5 h-5" />
          Demander un devis gratuit
        </motion.button>

        {artisan.email && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmail}
            className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5" />
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
      <div className="space-y-2">
        {artisan.is_verified && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            <span>SIRET verifie</span>
          </div>
        )}
        {artisan.insurance && artisan.insurance.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>{artisan.insurance[0]}</span>
          </div>
        )}
      </div>

      {/* SIRET */}
      {artisan.siret && (
        <div className="mt-6 pt-4 border-t border-gray-100">
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
  const handleCall = () => {
    if (artisan.phone) {
      window.location.href = `tel:${artisan.phone.replace(/\s/g, '')}`
    }
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50 safe-area-bottom"
    >
      <div className="flex gap-3">
        {artisan.phone && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCall}
            className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Appeler
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3.5 px-4 rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Devis gratuit
        </motion.button>
      </div>
    </motion.div>
  )
}
