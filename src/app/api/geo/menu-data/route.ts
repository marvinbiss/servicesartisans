import { NextResponse } from 'next/server'
import { villes, regions } from '@/lib/data/france'

// This route is server-only — france.ts never reaches the client bundle via Header.tsx

const megaMenuRegions = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  "Provence-Alpes-Côte d'Azur",
  'Occitanie',
  'Nouvelle-Aquitaine',
  'Hauts-de-France',
  'Grand Est',
  'Pays de la Loire',
  'Bretagne',
  'Normandie',
]

function parsePopulation(pop: string): number {
  return parseInt(pop.replace(/\s/g, ''), 10) || 0
}

function formatPop(pop: string): string {
  const n = parsePopulation(pop)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return `${Math.round(n / 1000)}K`
}

const citiesByRegion = megaMenuRegions.map((regionName) => {
  const regionVilles = villes
    .filter((v) => v.region === regionName)
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
    .slice(0, 4)
  return {
    region: regionName === "Provence-Alpes-Côte d'Azur" ? 'PACA' : regionName,
    cities: regionVilles.map((v) => ({
      name: v.name,
      slug: v.slug,
      population: formatPop(v.population),
    })),
  }
})

const popularCities = [...villes]
  .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
  .slice(0, 12)
  .map((v) => ({ name: v.name, slug: v.slug }))

const metroRegions = regions.slice(0, 13).map((r) => ({
  slug: r.slug,
  name: r.name,
  departments: r.departments.map((d) => ({ name: d.name, code: d.code, slug: d.slug })),
}))

const domTomRegions = regions.slice(13).map((r) => ({
  slug: r.slug,
  name: r.name,
  departments: r.departments.map((d) => ({ name: d.name, code: d.code, slug: d.slug })),
}))

const payload = { citiesByRegion, popularCities, metroRegions, domTomRegions }

export async function GET() {
  return NextResponse.json(payload, {
    headers: {
      // Cache for 24 h at CDN edge, stale-while-revalidate for 7 days
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
