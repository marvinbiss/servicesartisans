'use client'

import Link from 'next/link'
import { Phone, Mail, ExternalLink, FileText, Shield, Star } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

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
  const hasWebsite = !!artisan.website

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header accent */}
      <div className="h-1 bg-blue-600" />

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 font-heading mb-4">Contacter cet artisan</h3>

        {/* Availability + rating row */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {artisan.accepts_new_clients === true && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-semibold text-green-700">Disponible</span>
            </div>
          )}
          {artisan.average_rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
              <span className="font-semibold text-gray-900">{artisan.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {/* Primary CTA: Demander un devis */}
          <Link
            href="#devis"
            className="w-full py-3.5 px-4 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center gap-2.5 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
          >
            <FileText className="w-5 h-5 transition-transform" aria-hidden="true" />
            Demander un devis gratuit
          </Link>

          {hasPhone && (
            <a
              href={`tel:${artisan.phone!.replace(/\s/g, '')}`}
              className="w-full py-3.5 px-4 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center gap-2.5 shadow-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
              aria-label={`Appeler le ${formatFrenchPhone(artisan.phone!)}`}
            >
              <Phone className="w-5 h-5 transition-transform" aria-hidden="true" />
              <span>Appeler</span>
              <span className="text-blue-200 font-normal">&middot;</span>
              <span className="text-blue-100 font-normal text-sm">{formatFrenchPhone(artisan.phone!)}</span>
            </a>
          )}

          {hasEmail && (
            <a
              href={`mailto:${artisan.email}`}
              className="w-full py-3 px-4 rounded-full border-2 border-gray-200 text-slate-700 font-medium flex items-center justify-center gap-2.5 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group"
              aria-label={`Envoyer un email à ${artisan.email}`}
            >
              <Mail className="w-5 h-5 text-slate-400 transition-colors group-hover:text-slate-600" aria-hidden="true" />
              Envoyer un email
            </a>
          )}

          {hasWebsite && (
            <a
              href={artisan.website!.startsWith('http') ? artisan.website! : `https://${artisan.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-full border-2 border-gray-200 text-slate-700 font-medium flex items-center justify-center gap-2.5 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group"
              aria-label="Voir le site web de l'artisan"
            >
              <ExternalLink className="w-5 h-5 text-slate-400 transition-colors group-hover:text-slate-600" aria-hidden="true" />
              Voir le site web
            </a>
          )}
        </div>

        {/* Trust footer */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Vos donn&eacute;es sont prot&eacute;g&eacute;es et ne seront jamais partag&eacute;es</span>
          </div>
        </div>
      </div>
    </div>
  )
}
