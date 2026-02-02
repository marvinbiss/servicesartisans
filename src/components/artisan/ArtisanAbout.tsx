'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, ChevronDown, Globe, Building2, Users, Calendar } from 'lucide-react'
import { Artisan, getDisplayName } from './types'

interface ArtisanAboutProps {
  artisan: Artisan
}

export function ArtisanAbout({ artisan }: ArtisanAboutProps) {
  const [expanded, setExpanded] = useState(false)
  const displayName = getDisplayName(artisan)

  const description = artisan.description || `${displayName} est un professionnel qualifie specialise en ${artisan.specialty} a ${artisan.city}.`
  const isLong = description.length > 300

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        A propos
      </h2>

      {/* Description */}
      <div className="relative">
        <div
          id="about-description"
          aria-expanded={isLong ? expanded : undefined}
          className={`text-gray-600 leading-relaxed ${!expanded && isLong ? 'line-clamp-4' : ''}`}
        >
          {description}
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls="about-description"
            className="mt-2 text-blue-600 font-medium text-sm flex items-center gap-1 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {expanded ? 'Voir moins' : 'Voir plus'}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Company info */}
      {(artisan.legal_form || artisan.employee_count || artisan.creation_date || artisan.website) && (
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
          {artisan.legal_form && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Forme juridique</div>
                <div className="font-medium text-gray-900">{artisan.legal_form}</div>
              </div>
            </div>
          )}

          {artisan.employee_count && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Employes</div>
                <div className="font-medium text-gray-900">{artisan.employee_count}</div>
              </div>
            </div>
          )}

          {artisan.creation_date && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Creation</div>
                <div className="font-medium text-gray-900">
                  {new Date(artisan.creation_date).getFullYear()}
                </div>
              </div>
            </div>
          )}

          {artisan.website && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Site web</div>
                <a
                  href={artisan.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline truncate block max-w-[150px]"
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
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Langues parlees</h3>
          <div className="flex flex-wrap gap-2">
            {artisan.languages.map((lang, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
