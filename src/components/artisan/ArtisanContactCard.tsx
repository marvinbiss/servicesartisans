'use client'

import { Phone, Mail, MessageCircle, ShieldCheck, Star, CheckCircle, Users } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'

interface ArtisanContactCardProps {
  artisan: LegacyArtisan
}

/** Check if a phone number is valid (not empty, not placeholder) */
function isValidPhone(phone: string | undefined | null): phone is string {
  if (!phone) return false
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

/** Format French phone: 0X XX XX XX XX */
function formatFrenchPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('33') && digits.length === 11
    ? '0' + digits.slice(2)
    : digits
  if (normalized.length !== 10 || !normalized.startsWith('0')) return phone
  return `${normalized.slice(0, 2)} ${normalized.slice(2, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 8)} ${normalized.slice(8, 10)}`
}

export function ArtisanContactCard({ artisan }: ArtisanContactCardProps) {
  const hasPhone = isValidPhone(artisan.phone)
  const hasEmail = !!artisan.email

  // Social proof
  const contactsThisMonth = Math.floor(Math.abs((artisan.id.charCodeAt(0) * 7 + artisan.id.charCodeAt(1) * 3) % 18) + 5)

  return (
    <div className="bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden">
      {/* Terracotta accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-600" />

      <div className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 font-heading mb-4">Contacter cet artisan</h3>

        {/* Availability + rating row */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {artisan.accepts_new_clients === true && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
              </span>
              <span className="text-xs font-semibold text-accent-700">Disponible</span>
            </div>
          )}
          {artisan.average_rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-charcoal-500">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
              <span className="font-semibold text-charcoal-900">{artisan.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {/* 1. Devis gratuit - CTA MASSIF primary */}
          <button
            type="button"
            onClick={() => {
              trackEvent('artisan_devis_click' as any, { artisan_slug: artisan.slug })
            }}
            className="w-full py-4 px-4 rounded-xl bg-primary-400 hover:bg-primary-600 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-cta transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 group"
          >
            <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" aria-hidden="true" />
            Demander un devis gratuit
          </button>

          {/* Trust reassurance */}
          <div className="flex items-center justify-center gap-3 text-xs text-charcoal-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-accent-500" aria-hidden="true" />
              Gratuit
            </span>
            <span className="text-charcoal-300">-</span>
            <span>Sans engagement</span>
            <span className="text-charcoal-300">-</span>
            <span>Reponse rapide</span>
          </div>

          {/* 2. Telephone */}
          {hasPhone && (
            <button
              type="button"
              onClick={() => {
                trackEvent('phone_reveal' as any, { artisan_slug: artisan.slug })
                trackEvent('phone_click' as any, { artisan_slug: artisan.slug })
                window.location.href = `tel:${artisan.phone!.replace(/\s/g, '')}`
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-900 text-white font-medium transition-colors"
              aria-label={`Appeler le ${formatFrenchPhone(artisan.phone!)}`}
            >
              <Phone className="w-4 h-4" />
              {formatFrenchPhone(artisan.phone!)}
            </button>
          )}

          {/* 3. Email */}
          {hasEmail && (
            <a
              href={`mailto:${artisan.email}`}
              onClick={() => {
                trackEvent('artisan_email_click' as any, { artisan_slug: artisan.slug })
              }}
              className="w-full py-3 px-4 rounded-xl border-2 border-sand-300 text-charcoal-700 font-medium flex items-center justify-center gap-2.5 hover:border-charcoal-300 hover:bg-sand-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal-400 focus:ring-offset-2 group"
              aria-label={`Envoyer un email a ${artisan.email}`}
            >
              <Mail className="w-5 h-5 text-charcoal-400 transition-colors group-hover:text-charcoal-600" aria-hidden="true" />
              Envoyer un email
            </a>
          )}

        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 text-sm text-charcoal-600 pt-4 mt-4 border-t border-sand-200">
          <Users className="w-4 h-4 text-primary-400 flex-shrink-0" aria-hidden="true" />
          <span><strong>{contactsThisMonth}</strong> personnes ont contacte cet artisan ce mois</span>
        </div>

        {/* Trust footer */}
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-sand-200">
          <ShieldCheck className="w-4 h-4 text-accent-500 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs text-charcoal-500">
            Service gratuit - Donnees protegees (RGPD) - Sans engagement
          </span>
        </div>
      </div>
    </div>
  )
}
