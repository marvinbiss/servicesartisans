'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, ChevronDown, Globe, Building2, Users, Calendar, Shield, Award, CheckCircle, FileCheck } from 'lucide-react'
import { Artisan, getDisplayName } from './types'

// Map legal form codes to readable labels
const LEGAL_FORMS: Record<string, string> = {
  '1000': 'Entrepreneur individuel',
  '5410': 'SARL',
  '5499': 'SARL',
  '5498': 'SARL unipersonnelle',
  '5710': 'SAS',
  '5720': 'SASU',
  '5599': 'SA',
  '5505': 'SA',
  '6540': 'SCM',
  '9220': 'Association',
  '9210': 'Association',
}

function getLegalFormLabel(code: string): string {
  return LEGAL_FORMS[code] || (code.length <= 10 ? code : code)
}

interface ArtisanAboutProps {
  artisan: Artisan
}

export function ArtisanAbout({ artisan }: ArtisanAboutProps) {
  const [expanded, setExpanded] = useState(false)
  const displayName = getDisplayName(artisan)

  const description = artisan.description || `${displayName} est un professionnel qualifi\u00e9 sp\u00e9cialis\u00e9 en ${artisan.specialty} \u00e0 ${artisan.city}.`
  const isLong = description.length > 300

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-0">
        <h2 className="text-xl font-semibold text-gray-900 font-heading mb-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <User className="w-4.5 h-4.5 text-blue-600" />
          </div>
          &Agrave; propos
        </h2>
      </div>

      {/* Description */}
      <div className="px-6">
        <div className="relative">
          <div
            id="about-description"
            aria-expanded={isLong ? expanded : undefined}
            className={`text-slate-600 leading-relaxed text-[0.95rem] ${!expanded && isLong ? 'line-clamp-4' : ''}`}
          >
            {description}
          </div>
          {isLong && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls="about-description"
            className="mt-2 text-blue-600 font-medium text-sm flex items-center gap-1 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
          >
            {expanded ? 'Voir moins' : 'Voir plus'}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Trust & Safety Section */}
      <div className="mx-6 mt-6 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Confiance &amp; S&eacute;curit&eacute;
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Identity Verification */}
          {artisan.is_verified && (
            <div className="p-3.5 rounded-xl border bg-green-50/80 border-green-200 transition-all duration-200 hover:bg-green-50 hover:shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Identit&eacute; v&eacute;rifi&eacute;e</p>
                  <p className="text-xs text-slate-500">SIRET contr&ocirc;l&eacute;</p>
                </div>
              </div>
            </div>
          )}

          {/* Insurance */}
          {artisan.insurance && artisan.insurance.length > 0 && (
            <div className="p-3.5 rounded-xl border bg-green-50/80 border-green-200 transition-all duration-200 hover:bg-green-50 hover:shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Assurance</p>
                  <p className="text-xs text-slate-500">{artisan.insurance[0]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Certifications */}
          {artisan.certifications && artisan.certifications.length > 0 && (
            <div className="p-3.5 rounded-xl border bg-green-50/80 border-green-200 transition-all duration-200 hover:bg-green-50 hover:shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Certifications</p>
                  <p className="text-xs text-slate-500">{artisan.certifications.length} certification(s)</p>
                </div>
              </div>
            </div>
          )}

          {/* Escrow Available */}
          <div className="p-3.5 rounded-xl border bg-blue-50/80 border-blue-200 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Paiement s&eacute;curis&eacute;</p>
                <p className="text-xs text-slate-500">Protection Escrow</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications List */}
      {artisan.certifications && artisan.certifications.length > 0 && (
        <div className="mx-6 mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            Certifications &amp; Qualifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {artisan.certifications.map((cert, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-sm border border-purple-200 font-medium transition-colors hover:bg-purple-100"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insurance List */}
      {artisan.insurance && artisan.insurance.length > 0 && (
        <div className="mx-6 mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            Assurances
          </h3>
          <div className="flex flex-wrap gap-2">
            {artisan.insurance.map((ins, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200 font-medium transition-colors hover:bg-green-100"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {ins}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Company info */}
      {(artisan.legal_form || artisan.employee_count || artisan.creation_date || artisan.website) && (
        <div className="mx-6 mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
          {artisan.legal_form && (
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center transition-colors group-hover:bg-gray-100">
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Forme juridique</div>
                <div className="font-medium text-gray-900 text-sm">{getLegalFormLabel(artisan.legal_form)}</div>
              </div>
            </div>
          )}

          {artisan.employee_count && (
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center transition-colors group-hover:bg-gray-100">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Employ&eacute;s</div>
                <div className="font-medium text-gray-900 text-sm">{artisan.employee_count}</div>
              </div>
            </div>
          )}

          {artisan.creation_date && (
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center transition-colors group-hover:bg-gray-100">
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Cr&eacute;ation</div>
                <div className="font-medium text-gray-900 text-sm">
                  {new Date(artisan.creation_date).getFullYear()}
                </div>
              </div>
            </div>
          )}

          {artisan.website && (
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center transition-colors group-hover:bg-gray-100">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Site web</div>
                <a
                  href={artisan.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline truncate block max-w-[150px] text-sm transition-colors"
                >
                  {artisan.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Languages */}
      {artisan.languages && artisan.languages.length > 0 && (
        <div className="mx-6 mt-6 pt-6 border-t border-gray-100 pb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Langues parl&eacute;es</h3>
          <div className="flex flex-wrap gap-2">
            {artisan.languages.map((lang, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-slate-700 text-sm font-medium transition-colors hover:bg-gray-100"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom padding when no languages section */}
      {(!artisan.languages || artisan.languages.length === 0) && (
        <div className="pb-6" />
      )}
    </motion.div>
  )
}
