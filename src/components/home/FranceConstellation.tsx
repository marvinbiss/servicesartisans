import { cityMarkers } from '@/lib/data/map-coverage'

/**
 * Constellation de France — signature visuelle ServicesArtisans.
 * 110 villes réelles (lat/lng) projetées en SVG server-rendered, zéro JS client.
 *
 * Les rayons des points sont pondérés par les estimations de map-coverage
 * (proportionnelles à la population) : pondération VISUELLE uniquement.
 * Aucun chiffre par ville n'est affiché — les compteurs réels (DB) vivent
 * dans la colonne texte de la section registre.
 */

const MIN_LNG = -5.2
const MAX_LNG = 9.7
const MIN_LAT = 41.2
const MAX_LAT = 51.3
const W = 600
// Projection équirectangulaire corrigée cos(latitude moyenne ~46.2°)
const COS_MID_LAT = Math.cos((46.2 * Math.PI) / 180)
const H = Math.round(((MAX_LAT - MIN_LAT) / ((MAX_LNG - MIN_LNG) * COS_MID_LAT)) * W)

const TOP_LABELS = new Set(['paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'lille'])

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * W,
    y: ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * H,
  }
}

function radius(count: number): number {
  return Math.min(13, Math.max(2.5, Math.sqrt(count) / 14))
}

export function FranceConstellation() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Carte de France de la couverture ServicesArtisans : 110 villes principales couvertes par des artisans RGE certifiés"
    >
      {cityMarkers.map((city, i) => {
        const { x, y } = project(city.lat, city.lng)
        const r = radius(city.providerCount)
        const labeled = TOP_LABELS.has(city.slug)
        return (
          <g
            key={city.slug}
            className="constellation-dot"
            style={{ animationDelay: `${(i % 24) * 60}ms` }}
          >
            {labeled && <circle cx={x} cy={y} r={r + 6} className="fill-primary-500/10" />}
            <circle
              cx={x}
              cy={y}
              r={r}
              className={labeled ? 'fill-primary-500' : 'fill-primary-400/70'}
            >
              <title>{city.name}</title>
            </circle>
            {labeled && (
              <text
                x={x + r + 7}
                y={y + 4}
                className="fill-charcoal-500 text-[13px] font-medium"
                style={{ fontFamily: 'inherit' }}
              >
                {city.name}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
