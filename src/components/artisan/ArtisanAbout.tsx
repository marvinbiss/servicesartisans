'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, ChevronDown, Shield, Award, CheckCircle } from 'lucide-react'
import { Artisan } from './types'

interface ArtisanAboutProps {
  artisan: Artisan
}

export function ArtisanAbout({ artisan }: ArtisanAboutProps) {
  const [expanded, setExpanded] = useState(false)

  const description = artisan.description || ''
  const isLong = description.length > 300

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden"
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-0">
        <h2 className="text-xl font-semibold text-gray-900 font-heading mb-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <User className="w-4.5 h-4.5 text-primary-600" />
          </div>
          &Agrave; propos
        </h2>
      </div>

      {/* Description */}
      {description ? (
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
              className="mt-2 text-primary-600 font-medium text-sm flex items-center gap-1 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded transition-colors"
            >
              {expanded ? 'Voir moins' : 'Voir plus'}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          )}
        </div>
      ) : null}

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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-sm border border-purple-200 font-medium"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200 font-medium"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {ins}
              </span>
            ))}
          </div>
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
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-slate-700 text-sm font-medium"
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
