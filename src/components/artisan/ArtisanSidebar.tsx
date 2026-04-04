'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, ShieldCheck, CheckCircle, Phone } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getDevisUrl(artisan: LegacyArtisan): string {
  const specialtySlug = artisan.specialty ? slugify(artisan.specialty) : 'artisan'
  const citySlug = artisan.city ? slugify(artisan.city) : ''
  return `/devis/${specialtySlug}/${citySlug}`
}

interface ArtisanSidebarProps {
  artisan: LegacyArtisan
}

export function ArtisanSidebar({ artisan }: ArtisanSidebarProps) {
  const [shouldPulse, setShouldPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShouldPulse(true)
      setTimeout(() => setShouldPulse(false), 600)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleEmail = () => {
    if (artisan.email) {
      trackEvent('artisan_email_click', {
        artisanId: artisan.id,
        artisanName: artisan.business_name || '',
        source: 'sidebar',
      })
      window.location.href = `mailto:${artisan.email}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
    >
      {/* Terracotta gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

      <div className="p-6">
        {/* Status - Disponible */}
        {artisan.accepts_new_clients === true && (
          <div className="flex items-center gap-2 text-accent-700 mb-4 pb-4 border-b border-sand-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500" />
            </span>
            <span className="text-sm font-semibold">Disponible - Accepte de nouveaux clients</span>
          </div>
        )}

        {/* CTA principal - MASSIF */}
        <div className="space-y-3 mb-5" role="group" aria-label="Actions de contact">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={shouldPulse ? {
              scale: [1, 1.03, 1],
              boxShadow: [
                '0 10px 25px rgba(232, 107, 75, 0.3)',
                '0 10px 35px rgba(232, 107, 75, 0.5)',
                '0 10px 25px rgba(232, 107, 75, 0.3)',
              ],
            } : {}}
            transition={shouldPulse ? { duration: 0.6, ease: 'easeInOut' } : {}}
            onClick={() => {
              trackEvent('artisan_devis_click', {
                artisanId: artisan.id,
                artisanName: artisan.business_name || '',
                source: 'sidebar_devis',
              })
              window.location.href = getDevisUrl(artisan)
            }}
            className="w-full py-4 px-5 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cta transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            aria-label="Obtenir mon devis gratuit"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Obtenir mon devis gratuit
          </motion.button>

          {/* Trust reassurance under CTA */}
          <div className="flex items-center justify-center gap-3 text-xs text-charcoal-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-accent-500" aria-hidden="true" />
              Gratuit
            </span>
            <span className="text-charcoal-300" aria-hidden="true">-</span>
            <span>Sans engagement</span>
            <span className="text-charcoal-300" aria-hidden="true">-</span>
            <span>Réponse rapide</span>
          </div>

          {artisan.email && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEmail}
              className="w-full py-3 px-4 rounded-xl border-2 border-sand-300 text-charcoal-700 font-medium flex items-center justify-center gap-2 hover:border-charcoal-300 hover:bg-sand-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:ring-offset-2"
              aria-label={`Envoyer un email à ${artisan.email}`}
            >
              <Mail className="w-5 h-5 text-charcoal-400" aria-hidden="true" />
              Envoyer un email
            </motion.button>
          )}

          {/* Platform phone — always available */}
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('phone_click', {
                artisanId: artisan.id,
                source: 'sidebar_platform_phone',
              })
            }}
            className="w-full py-3 px-4 rounded-xl border-2 border-accent-200 bg-accent-50 text-accent-700 font-medium flex items-center justify-center gap-2 hover:border-accent-300 hover:bg-accent-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
            aria-label="Appeler ServicesArtisans"
          >
            <Phone className="w-5 h-5 text-accent-500" />
            Appeler · {PHONE_NUMBER}
          </a>
        </div>

        {/* Trust badges */}
        <div className="space-y-2.5 mb-5 pb-5 border-b border-sand-200">
          <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Vérifications</h4>
          {artisan.is_verified && (
            <div className="flex items-center gap-2.5 text-sm text-charcoal-700">
              <ShieldCheck className="w-4 h-4 text-accent-500 flex-shrink-0" />
              <span>Identité vérifiée (SIREN)</span>
            </div>
          )}
        </div>

        {/* SIRET */}
        {artisan.siret && (
          <div className="pt-2">
            <div className="text-xs text-charcoal-400 font-mono">
              SIRET : {artisan.siret}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Mobile CTA bar -- Single dominant CTA, ALWAYS visible
export function ArtisanMobileCTA({ artisan }: ArtisanSidebarProps) {
  // Subtle pulse animation every 8 seconds
  const pulseVariants = {
    initial: { boxShadow: '0 0 0 0 rgba(232, 107, 75, 0)' },
    pulse: {
      boxShadow: [
        '0 0 0 0 rgba(232, 107, 75, 0.4)',
        '0 0 0 12px rgba(232, 107, 75, 0)',
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 6.5,
      },
    },
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sand-200 p-4 md:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      role="group"
      aria-label="Actions rapides"
    >
      <div className="flex flex-col items-center gap-2">
        {/* Primary row: Phone + Devis CTA */}
        <div className="flex gap-2 w-full">
          {/* Tap-to-call platform */}
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('phone_click', {
                artisanId: artisan.id,
                source: 'mobile_cta_platform_phone',
              })
            }}
            className="flex items-center justify-center w-12 h-12 bg-accent-500 hover:bg-accent-600 text-white rounded-xl shadow-sm active:scale-[0.96] transition-all touch-manipulation flex-shrink-0"
            aria-label="Appeler ServicesArtisans"
          >
            <Phone className="w-5 h-5" />
          </a>

          {/* Primary: Devis CTA - MASSIF */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            variants={pulseVariants}
            initial="initial"
            animate="pulse"
            onClick={() => {
              trackEvent('artisan_devis_click', {
                artisanId: artisan.id,
                artisanName: artisan.business_name || '',
                source: 'mobile_cta',
              })
              window.location.href = getDevisUrl(artisan)
            }}
            className="flex-1 py-4 px-6 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cta transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            aria-label="Obtenir mon devis gratuit"
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            Obtenir mon devis gratuit
          </motion.button>
        </div>

        {/* Trust line under CTA */}
        <div className="flex items-center gap-2 text-[11px] text-charcoal-500">
          <CheckCircle className="w-3 h-3 text-accent-500" aria-hidden="true" />
          <span>Gratuit - Sans engagement - Réponse rapide</span>
        </div>

      </div>
    </motion.div>
  )
}
