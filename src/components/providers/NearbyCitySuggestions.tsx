'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { villesLight, type Ville } from '@/lib/data/france-light'

type Props = {
  serviceSlug: string
  serviceName: string
  currentCitySlug: string
  currentDepartmentCode?: string | null
}

function parsePopulation(p: string): number {
  return parseInt(p.replace(/\s/g, ''), 10) || 0
}

function pickNearby(current: string, deptCode: string | null | undefined): Ville[] {
  const others = villesLight.filter((v) => v.slug !== current)
  // 1) Same département, top 6 by population
  if (deptCode) {
    const inDept = others
      .filter((v) => v.departementCode === deptCode)
      .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
      .slice(0, 6)
    if (inDept.length >= 3) return inDept
  }
  // 2) Fallback: top 6 by population (national)
  return [...others]
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
    .slice(0, 6)
}

export function NearbyCitySuggestions({
  serviceSlug,
  serviceName,
  currentCitySlug,
  currentDepartmentCode,
}: Props) {
  const cities = useMemo(
    () => pickNearby(currentCitySlug, currentDepartmentCode),
    [currentCitySlug, currentDepartmentCode]
  )

  if (cities.length === 0) return null

  return (
    <section
      aria-labelledby="nearby-cities-heading"
      className="mx-4 mt-4 mb-3 bg-white border border-sand-300 rounded-2xl px-4 py-4"
    >
      <h2
        id="nearby-cities-heading"
        className="text-sm font-bold text-charcoal-900 mb-2 flex items-center gap-2"
      >
        <MapPin className="w-4 h-4 text-primary-500" aria-hidden="true" />
        {serviceName} dans d&apos;autres villes
      </h2>
      <ul className="flex flex-wrap gap-2">
        {cities.map((v) => (
          <li key={v.slug}>
            <Link
              href={`/services/${serviceSlug}/${v.slug}`}
              className="inline-flex items-center px-3 py-1.5 bg-sand-50 hover:bg-primary-50 text-charcoal-800 hover:text-primary-700 text-xs font-medium rounded-full border border-sand-300 hover:border-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              {v.name}
              <span className="ml-1 text-charcoal-400 text-2xs">({v.departementCode})</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
