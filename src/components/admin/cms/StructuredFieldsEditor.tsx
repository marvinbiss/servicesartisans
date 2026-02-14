'use client'

import { Plus, Trash2 } from 'lucide-react'
import type {
  ServiceStructuredData,
  HomepageStructuredData,
  FaqStructuredData,
} from '@/types/cms'

interface StructuredFieldsEditorProps {
  value: Record<string, unknown>
  pageType: string
  onChange: (data: Record<string, unknown>) => void
}

export function StructuredFieldsEditor({ value, pageType, onChange }: StructuredFieldsEditorProps) {
  const update = (key: string, val: unknown) => {
    onChange({ ...value, [key]: val })
  }

  switch (pageType) {
    case 'service':
      return <ServiceFields data={value as unknown as ServiceStructuredData} update={update} />
    case 'faq':
      return <FaqFields data={value as unknown as FaqStructuredData} update={update} />
    case 'homepage':
      return <HomepageFields data={value as unknown as HomepageStructuredData} update={update} />
    default:
      return (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          Aucun champ structuré disponible pour le type de page &laquo;{pageType}&raquo;.
        </div>
      )
  }
}

/* ------------------------------------------------------------------ */
/* Section header                                                      */
/* ------------------------------------------------------------------ */

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Service fields                                                      */
/* ------------------------------------------------------------------ */

interface ServiceFieldsProps {
  data: ServiceStructuredData
  update: (key: string, value: unknown) => void
}

function ServiceFields({ data, update }: ServiceFieldsProps) {
  const priceRange = data.priceRange || { min: 0, max: 0, unit: 'EUR' }
  const commonTasks = data.commonTasks || []
  const tips = data.tips || []
  const faq = data.faq || []
  const certifications = data.certifications || []

  return (
    <div className="space-y-8">
      {/* Price range */}
      <div>
        <SectionHeader title="Fourchette de prix" description="Prix minimum et maximum du service" />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                update('priceRange', { ...priceRange, min: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="0"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                update('priceRange', { ...priceRange, max: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="0"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Unité</label>
            <input
              type="text"
              value={priceRange.unit}
              onChange={(e) =>
                update('priceRange', { ...priceRange, unit: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="EUR"
            />
          </div>
        </div>
      </div>

      {/* Common tasks */}
      <div>
        <SectionHeader title="Tâches courantes" description="Prestations avec fourchette de prix" />
        <div className="space-y-2">
          {commonTasks.map((task, index) => (
            <div key={index} className="flex items-start gap-2">
              <input
                type="text"
                value={task.name}
                onChange={(e) => {
                  const updated = [...commonTasks]
                  updated[index] = { ...task, name: e.target.value }
                  update('commonTasks', updated)
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Nom de la tâche"
              />
              <input
                type="number"
                value={task.priceMin}
                onChange={(e) => {
                  const updated = [...commonTasks]
                  updated[index] = { ...task, priceMin: Number(e.target.value) }
                  update('commonTasks', updated)
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Min"
                min={0}
              />
              <input
                type="number"
                value={task.priceMax}
                onChange={(e) => {
                  const updated = [...commonTasks]
                  updated[index] = { ...task, priceMax: Number(e.target.value) }
                  update('commonTasks', updated)
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Max"
                min={0}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = commonTasks.filter((_, i) => i !== index)
                  update('commonTasks', updated)
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            update('commonTasks', [...commonTasks, { name: '', priceMin: 0, priceMax: 0 }])
          }
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une tâche
        </button>
      </div>

      {/* Tips */}
      <div>
        <SectionHeader title="Conseils" description="Conseils utiles pour les clients" />
        <div className="space-y-2">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={tip}
                onChange={(e) => {
                  const updated = [...tips]
                  updated[index] = e.target.value
                  update('tips', updated)
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Conseil..."
              />
              <button
                type="button"
                onClick={() => {
                  const updated = tips.filter((_, i) => i !== index)
                  update('tips', updated)
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update('tips', [...tips, ''])}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un conseil
        </button>
      </div>

      {/* FAQ */}
      <div>
        <SectionHeader title="FAQ" description="Questions fréquemment posées" />
        <div className="space-y-3">
          {faq.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...faq]
                    updated[index] = { ...item, question: e.target.value }
                    update('faq', updated)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  placeholder="Question"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = faq.filter((_, i) => i !== index)
                    update('faq', updated)
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const updated = [...faq]
                  updated[index] = { ...item, answer: e.target.value }
                  update('faq', updated)
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none bg-white"
                placeholder="Réponse"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update('faq', [...faq, { question: '', answer: '' }])}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une question
        </button>
      </div>

      {/* Certifications */}
      <div>
        <SectionHeader title="Certifications" description="Labels et certifications du prestataire" />
        <div className="flex flex-wrap gap-2 mb-2">
          {certifications.map((cert, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
            >
              {cert}
              <button
                type="button"
                onClick={() => {
                  const updated = certifications.filter((_, i) => i !== index)
                  update('certifications', updated)
                }}
                className="text-blue-400 hover:text-blue-700 ml-0.5"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            id="cert-input"
            placeholder="Nouvelle certification..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const input = e.target as HTMLInputElement
                const value = input.value.trim()
                if (value && !certifications.includes(value)) {
                  update('certifications', [...certifications, value])
                  input.value = ''
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('cert-input') as HTMLInputElement
              const value = input?.value.trim()
              if (value && !certifications.includes(value)) {
                update('certifications', [...certifications, value])
                input.value = ''
              }
            }}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* FAQ fields                                                          */
/* ------------------------------------------------------------------ */

interface FaqFieldsProps {
  data: FaqStructuredData
  update: (key: string, value: unknown) => void
}

function FaqFields({ data, update }: FaqFieldsProps) {
  const categoryName = data.categoryName || ''
  const items = data.items || []

  return (
    <div className="space-y-6">
      {/* Category name */}
      <div>
        <SectionHeader title="Nom de la catégorie" />
        <input
          type="text"
          value={categoryName}
          onChange={(e) => update('categoryName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Ex: Questions générales, Tarification..."
        />
      </div>

      {/* Q&A items */}
      <div>
        <SectionHeader title="Questions / Réponses" />
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...items]
                    updated[index] = { ...item, question: e.target.value }
                    update('items', updated)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  placeholder="Question"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = items.filter((_, i) => i !== index)
                    update('items', updated)
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const updated = [...items]
                  updated[index] = { ...item, answer: e.target.value }
                  update('items', updated)
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y bg-white"
                placeholder="Réponse (texte enrichi supporté)"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update('items', [...items, { question: '', answer: '' }])}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une question
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Homepage fields                                                     */
/* ------------------------------------------------------------------ */

interface HomepageFieldsProps {
  data: HomepageStructuredData
  update: (key: string, value: unknown) => void
}

function HomepageFields({ data, update }: HomepageFieldsProps) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Section Hero"
        description="Contenu principal affiché en haut de la page d'accueil"
      />

      <div>
        <label className="block text-xs text-gray-500 mb-1">Titre Hero</label>
        <input
          type="text"
          value={data.heroTitle || ''}
          onChange={(e) => update('heroTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Titre principal de la page d'accueil"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Sous-titre Hero</label>
        <textarea
          value={data.heroSubtitle || ''}
          onChange={(e) => update('heroSubtitle', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          placeholder="Sous-titre ou accroche"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Texte du bouton CTA</label>
          <input
            type="text"
            value={data.heroCtaText || ''}
            onChange={(e) => update('heroCtaText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Ex: Demander un devis"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL du bouton CTA</label>
          <input
            type="text"
            value={data.heroCtaUrl || ''}
            onChange={(e) => update('heroCtaUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="/devis"
          />
        </div>
      </div>
    </div>
  )
}
