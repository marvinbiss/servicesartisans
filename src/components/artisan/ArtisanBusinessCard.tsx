'use client'

import { Shield, CheckCircle, ExternalLink, Phone, Building2, Calendar, Users, Hash, Scale, Briefcase } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanBusinessCardProps {
  artisan: LegacyArtisan
}

/** Format SIRET: XXX XXX XXX XXXXX */
function formatSiret(siret: string): string {
  const digits = siret.replace(/\s/g, '')
  if (digits.length !== 14) return siret
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 14)}`
}

/** Format French phone: 0X XX XX XX XX */
function formatFrenchPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Handle +33 prefix
  const normalized = digits.startsWith('33') && digits.length === 11
    ? '0' + digits.slice(2)
    : digits
  if (normalized.length !== 10 || !normalized.startsWith('0')) return phone
  return `${normalized.slice(0, 2)} ${normalized.slice(2, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 8)} ${normalized.slice(8, 10)}`
}

/** Check if a phone number is valid (not empty, not placeholder) */
function isValidPhone(phone: string | undefined | null): phone is string {
  if (!phone) return false
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

/** Format creation date to French locale */
function formatCreationDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Calculate years since creation */
function getYearsSinceCreation(dateStr: string): number | null {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  } catch {
    return null
  }
}

export function ArtisanBusinessCard({ artisan }: ArtisanBusinessCardProps) {
  const hasSiret = !!artisan.siret
  const hasAnyData = hasSiret || artisan.legal_form || artisan.creation_date || artisan.employee_count || isValidPhone(artisan.phone) || artisan.email || artisan.website

  if (!hasAnyData) return null

  const yearsSinceCreation = artisan.creation_date ? getYearsSinceCreation(artisan.creation_date) : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with verification badge */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-primary-50/30 to-slate-50 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm shadow-primary-500/20">
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-heading">Fiche entreprise</h3>
              <p className="text-sm text-slate-500">
                Donn&eacute;es v&eacute;rifi&eacute;es par l&apos;API gouvernementale
              </p>
            </div>
          </div>
          {hasSiret && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              V&eacute;rifi&eacute;e
            </span>
          )}
        </div>
      </div>

      {/* Content: structured data grid */}
      <div className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {artisan.siret && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors hover:bg-slate-100/80">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Hash className="w-4 h-4 text-primary-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">SIRET</dt>
                <dd className="mt-0.5 text-sm font-semibold text-gray-900 font-mono tracking-wide">
                  {formatSiret(artisan.siret)}
                </dd>
              </div>
            </div>
          )}

          {artisan.legal_form && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors hover:bg-slate-100/80">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Scale className="w-4 h-4 text-purple-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Forme juridique</dt>
                <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                  {artisan.legal_form}
                </dd>
              </div>
            </div>
          )}

          {artisan.creation_date && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors hover:bg-slate-100/80">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Calendar className="w-4 h-4 text-secondary-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date de cr&eacute;ation</dt>
                <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                  {formatCreationDate(artisan.creation_date)}
                  {yearsSinceCreation !== null && yearsSinceCreation > 0 && (
                    <span className="ml-1.5 text-xs font-medium text-slate-400">
                      ({yearsSinceCreation} {yearsSinceCreation === 1 ? 'an' : 'ans'})
                    </span>
                  )}
                </dd>
              </div>
            </div>
          )}

          {artisan.employee_count != null && artisan.employee_count > 0 && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 transition-colors hover:bg-slate-100/80">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Users className="w-4 h-4 text-green-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Effectif</dt>
                <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                  {artisan.employee_count} {artisan.employee_count === 1 ? 'personne' : 'personnes'}
                </dd>
              </div>
            </div>
          )}
        </dl>

        {/* Contact actions row */}
        {(isValidPhone(artisan.phone) || artisan.email || artisan.website) && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              {isValidPhone(artisan.phone) && (
                <a
                  href={`tel:${artisan.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-all duration-200 shadow-sm shadow-primary-500/20 hover:shadow-md hover:shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label={`Appeler le ${formatFrenchPhone(artisan.phone)}`}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {formatFrenchPhone(artisan.phone)}
                </a>
              )}

              {artisan.email && (
                <a
                  href={`mailto:${artisan.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  aria-label={`Envoyer un email à ${artisan.email}`}
                >
                  <Briefcase className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span className="truncate max-w-[200px]">{artisan.email}</span>
                </a>
              )}

              {artisan.website && (
                <a
                  href={artisan.website.startsWith('http') ? artisan.website : `https://${artisan.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-primary-600 hover:text-primary-700 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span className="truncate max-w-[180px]">
                    {artisan.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
