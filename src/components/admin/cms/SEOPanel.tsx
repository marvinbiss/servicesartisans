'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

interface SEOPanelProps {
  seoTitle: string
  onSeoTitleChange: (value: string) => void
  seoDescription: string
  onSeoDescriptionChange: (value: string) => void
}

export function SEOPanel({
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
}: SEOPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const titleLength = seoTitle.length
  const descriptionLength = seoDescription.length
  // Google recommended display length (soft warning)
  const titleMax = 60
  const descriptionMax = 160
  // Note: HTML maxLength is set to 70/170 (hard limit matching DB CHECK + Zod schema)
  // Users are warned at 60/160 but can enter up to 70/170

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">Référencement (SEO)</span>
          {!seoTitle && !seoDescription && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Non renseigné
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-6">
          {/* Meta title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">
                Titre meta
              </label>
              <span
                className={`text-xs ${
                  titleLength > titleMax ? 'text-red-600 font-medium' : 'text-gray-400'
                }`}
              >
                {titleLength}/{titleMax}
              </span>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder="Titre pour les moteurs de recherche"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              maxLength={70}
            />
            {titleLength > titleMax && (
              <p className="mt-1 text-xs text-red-600">
                Le titre dépasse la limite recommandée de {titleMax} caractères.
              </p>
            )}
          </div>

          {/* Meta description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">
                Meta description
              </label>
              <span
                className={`text-xs ${
                  descriptionLength > descriptionMax ? 'text-red-600 font-medium' : 'text-gray-400'
                }`}
              >
                {descriptionLength}/{descriptionMax}
              </span>
            </div>
            <textarea
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              placeholder="Description pour les moteurs de recherche"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              maxLength={170}
            />
            {descriptionLength > descriptionMax && (
              <p className="mt-1 text-xs text-red-600">
                La description dépasse la limite recommandée de {descriptionMax} caractères.
              </p>
            )}
          </div>

          {/* Google SERP preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aperçu Google
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="max-w-[600px]">
                {/* Title */}
                <h3 className="text-xl leading-6 text-[#1a0dab] font-normal truncate">
                  {seoTitle || 'Titre de la page'}
                </h3>
                {/* URL */}
                <p className="text-sm text-[#006621] mt-1 truncate">
                  servicesartisans.com &rsaquo; page
                </p>
                {/* Description */}
                <p className="text-sm text-[#545454] mt-0.5 line-clamp-2">
                  {seoDescription || 'La description de la page apparaîtra ici dans les résultats de recherche Google.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
