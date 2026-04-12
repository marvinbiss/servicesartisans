/**
 * BarometrePrixBlock — Bloc baromètre des prix régionalisé pour un service.
 *
 * Affiche les 3-4 interventions principales du service avec prix ajustés
 * par l'indice régional, et la tendance (hausse/stable/baisse).
 *
 * Server Component — pas de 'use client'.
 */

import { TrendingUp, TrendingDown, Minus, Euro } from 'lucide-react'
import { servicePricings, regionalIndices } from '@/lib/data/barometre'
import type { InterventionPricing } from '@/lib/data/barometre'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BarometrePrixBlockProps {
  serviceSlug: string
  serviceName: string
  villeName: string
  regionName: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTrendIcon(tendance: 'hausse' | 'stable' | 'baisse'): React.ReactNode {
  switch (tendance) {
    case 'hausse':
      return <TrendingUp className="w-4 h-4 text-red-500" />
    case 'baisse':
      return <TrendingDown className="w-4 h-4 text-emerald-500" />
    default:
      return <Minus className="w-4 h-4 text-charcoal-400" />
  }
}

function getTrendLabel(tendance: 'hausse' | 'stable' | 'baisse', variation: number): string {
  const sign = variation > 0 ? '+' : ''
  switch (tendance) {
    case 'hausse':
      return `${sign}${variation}\u00A0% /an`
    case 'baisse':
      return `${sign}${variation}\u00A0% /an`
    default:
      return 'Stable'
  }
}

function getTrendColor(tendance: 'hausse' | 'stable' | 'baisse'): string {
  switch (tendance) {
    case 'hausse':
      return 'text-red-600'
    case 'baisse':
      return 'text-emerald-600'
    default:
      return 'text-charcoal-500'
  }
}

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(prix))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BarometrePrixBlock({
  serviceSlug,
  serviceName,
  villeName,
  regionName,
}: BarometrePrixBlockProps) {
  // Find service in barometre data
  const serviceData = servicePricings.find((sp) => sp.service === serviceSlug)
  if (!serviceData || serviceData.interventions.length === 0) return null

  // Find regional index (normalize for matching)
  const regionIndex = regionalIndices.find(
    (ri) =>
      ri.region.toLowerCase() === regionName.toLowerCase() ||
      ri.regionSlug === regionName.toLowerCase().replace(/\s+/g, '-')
  )
  const indexValue = regionIndex?.index ?? 100
  const multiplier = indexValue / 100

  // Take top 4 interventions
  const displayedInterventions = serviceData.interventions.slice(0, 4)

  return (
    <section className="py-6 bg-white rounded-xl border border-sand-200 p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Euro className="w-5 h-5 text-primary-600" />
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal-900">
          Tarifs {serviceName.toLowerCase()} à {villeName}
        </h3>
      </div>

      {regionIndex && (
        <p className="text-sm text-charcoal-500 mb-4 ml-12">
          Indice régional {regionIndex.region}
          {'\u00A0'}: <strong>{indexValue}</strong>/100
          {indexValue > 100 && ` (+${indexValue - 100}\u00A0% vs moyenne nationale)`}
          {indexValue < 100 && ` (${indexValue - 100}\u00A0% vs moyenne nationale)`}
          {regionIndex.tendance !== 'stable' && `, tendance ${regionIndex.tendance}`}
        </p>
      )}

      {/* Interventions table */}
      <div className="space-y-2">
        {displayedInterventions.map((intervention: InterventionPricing) => {
          const adjustedMin = Math.round(intervention.prixMin * multiplier)
          const adjustedMax = Math.round(intervention.prixMax * multiplier)

          return (
            <div
              key={intervention.name}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-sand-50 border border-sand-100"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal-900 truncate">
                  {intervention.name}
                </p>
                <p className="text-xs text-charcoal-400">par {intervention.unite}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-charcoal-900 whitespace-nowrap">
                  {formatPrix(adjustedMin)} - {formatPrix(adjustedMax)}
                  {'\u00A0'}€
                </span>
                <div
                  className="flex items-center gap-1"
                  title={getTrendLabel(intervention.tendance, intervention.variation)}
                >
                  {getTrendIcon(intervention.tendance)}
                  <span className={`text-xs font-medium ${getTrendColor(intervention.tendance)}`}>
                    {getTrendLabel(intervention.tendance, intervention.variation)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-charcoal-400 mt-3">
        Prix indicatifs TTC {new Date().getFullYear()}, ajustés selon l{"'"}indice régional. Source
        {'\u00A0'}: Baromètre ServicesArtisans.
      </p>
    </section>
  )
}
