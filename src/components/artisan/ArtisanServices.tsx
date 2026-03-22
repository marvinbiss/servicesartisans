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
      className="bg-white rounded-2xl shadow-soft border border-sand-200 overflow-hidden"
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-xl font-semibold text-charcoal-900 font-heading flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5 text-primary-400" aria-hidden="true" />
          </div>
          Services et Tarifs
        </h2>
      </div>

      <div className="px-6 pb-6">
        {/* Services tags - sand-200 border chips */}
        {artisan.services.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 mt-4" role="list" aria-label="Services proposés">
            {artisan.services.map((service, i) => (
              <span
                key={i}
                role="listitem"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sand-50 text-charcoal-700 text-sm font-medium border border-sand-200"
              >
                <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" aria-hidden="true" />
                {service}
              </span>
            ))}
          </div>
        )}

        {/* Pricing table */}
        {artisan.service_prices.length > 0 ? (
          <div className="space-y-2.5 mt-4" role="list" aria-label="Tarifs des services">
            {artisan.service_prices[0]?.price?.startsWith('A partir') && (
              <p className="text-xs text-charcoal-400 italic mb-3">* Tarifs indicatifs, le prix final dépend de la nature exacte de l'intervention. Demandez un devis pour un prix précis.</p>
            )}
            {artisan.service_prices.map((service, index) => (
              <motion.div
                key={index}
                role="listitem"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-sand-50 border border-sand-200 group hover:border-primary-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-charcoal-900">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-charcoal-500 mt-0.5 leading-relaxed">{service.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-4">
                  {service.duration && (
                    <div className="hidden sm:flex items-center gap-1 text-sm text-charcoal-400" aria-label={`Durée : ${service.duration}`}>
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-lg font-bold text-primary-600 whitespace-nowrap bg-primary-50 px-3 py-1 rounded-lg" aria-label={`Prix : ${service.price} euros`}>
                    <Euro className="w-4 h-4" aria-hidden="true" />
                    <span>{service.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 text-center mt-4">
            <p className="text-charcoal-700 font-medium mb-2">Tarifs sur devis personnalisé</p>
            <p className="text-sm text-charcoal-500 mb-4">Cet artisan propose des tarifs adaptés à chaque projet. Demandez un devis gratuit pour connaître ses prix.</p>
            <a
              href="#devis"
              className="inline-flex items-center gap-2 bg-primary-400 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-cta"
            >
              Demander un devis gratuit
            </a>
          </div>
        )}

      </div>
    </motion.div>
  )
}
