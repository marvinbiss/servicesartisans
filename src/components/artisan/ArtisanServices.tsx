'use client'

import { motion } from 'framer-motion'
import { Wrench, Clock, Euro, CheckCircle } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanServicesProps {
  artisan: LegacyArtisan
}

export function ArtisanServices({ artisan }: ArtisanServicesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-blue-600" aria-hidden="true" />
        Services et Tarifs
      </h2>

      {/* Services tags */}
      {artisan.services.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6" role="list" aria-label="Services proposés">
          {artisan.services.map((service, i) => (
            <span
              key={i}
              role="listitem"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium"
            >
              <CheckCircle className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
              {service}
            </span>
          ))}
        </div>
      )}

      {/* Pricing table */}
      {artisan.service_prices.length > 0 && (
        <div className="space-y-3" role="list" aria-label="Tarifs des services">
          {artisan.service_prices[0]?.price?.startsWith('À partir') && (
            <p className="text-xs text-gray-500 italic mb-2">* Tarifs indicatifs, le prix final dépend de la nature exacte de l'intervention. Demandez un devis pour un prix précis.</p>
          )}
          {artisan.service_prices.map((service, index) => (
            <motion.div
              key={index}
              role="listitem"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{service.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 ml-4">
                {service.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-500" aria-label={`Duree: ${service.duration}`}>
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>{service.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-lg font-bold text-blue-600 whitespace-nowrap" aria-label={`Prix: ${service.price} euros`}>
                  <Euro className="w-4 h-4" aria-hidden="true" />
                  <span>{service.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hourly rate */}
      {artisan.hourly_rate && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50">
            <span className="font-medium text-gray-900">Taux horaire</span>
            <span className="text-xl font-bold text-blue-600">{artisan.hourly_rate}€/h</span>
          </div>
        </div>
      )}

      {/* Payment methods */}
      {artisan.payment_methods && artisan.payment_methods.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Moyens de paiement acceptés</h3>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Moyens de paiement">
            {artisan.payment_methods.map((method, i) => (
              <span
                key={i}
                role="listitem"
                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-sm"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
