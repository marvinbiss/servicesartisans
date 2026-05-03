import {
  Clock,
  Wrench,
  Zap,
  Flame,
  Wind,
  HardHat,
  Home,
  Hammer,
  PaintBucket,
  Leaf,
  Snowflake,
  type LucideIcon,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────

export interface ServiceItem {
  name: string
  slug: string
  icon: LucideIcon
  description: string
  urgent?: boolean
}

export interface ServiceCategory {
  category: string
  color: string
  icon: LucideIcon
  services: ServiceItem[]
}

export interface CityMenuItem {
  name: string
  slug: string
  population: string
}
export interface RegionCities {
  region: string
  cities: CityMenuItem[]
}
export interface PopularCity {
  name: string
  slug: string
}
export interface MetroRegion {
  slug: string
  name: string
  departments: { name: string; code: string; slug: string }[]
}
export interface DomTomRegion {
  slug: string
  name: string
  departments?: { name: string; code: string; slug: string }[]
}

export type MenuType = 'services' | 'villes' | 'regions' | 'plus' | null
export type MobileAccordion = 'services' | 'villes' | 'regions' | null

// ── Constants ──────────────────────────────────────────

// Pivot full RGE 2026-05-03 : repositionnement « 100% artisans RGE certifiés ».
// - Catégorie "Urgences 24h/24" reconfigurée : restreinte aux trades qu'un
//   artisan RGE peut prendre (plombier, chauffagiste, electricien, couvreur,
//   climaticien — cf. URGENCE_RGE_COMPATIBLE_SLUGS). Serrurier supprimé.
// - Métiers commodity sans qualif RGE retirés du catalogue : serrurier,
//   carreleur, cuisiniste, vitrier (cf. PIVOT_RGE_REMOVED_SLUGS dans
//   src/lib/seo/pivot-rge-removed-services.ts).
// - "Rénovation énergétique" promu en tête (catégorie phare = flux MaPrimeRénov + CEE).
// - Pivot pure-play BTP énergétique 2026-05-02 : "Extérieur" (jardinier) retirée,
//   "Aménagement" (nettoyage) retirée.
export const serviceCategories: ServiceCategory[] = [
  {
    category: 'Rénovation énergétique',
    color: 'green',
    icon: Leaf,
    services: [
      {
        name: 'Pompe à chaleur',
        slug: 'pompe-a-chaleur',
        icon: Snowflake,
        description: 'Air-eau, géothermique — RGE QualiPAC',
      },
      {
        name: 'Isolation thermique',
        slug: 'isolation-thermique',
        icon: Home,
        description: 'Combles, murs, ITE — RGE Qualibat',
      },
      {
        name: 'Chauffagiste',
        slug: 'chauffagiste',
        icon: Flame,
        description: 'Chaudière biomasse, PAC — RGE',
      },
      {
        name: 'Climaticien',
        slug: 'climaticien',
        icon: Wind,
        description: 'Installation, entretien — RGE QualiPAC',
      },
    ],
  },
  {
    category: 'Urgences RGE 24h/24',
    color: 'red',
    icon: Clock,
    services: [
      {
        name: 'Plombier',
        slug: 'plombier',
        icon: Wrench,
        description: 'Fuite, dégât des eaux, chauffe-eau',
        urgent: true,
      },
      {
        name: 'Chauffagiste',
        slug: 'chauffagiste',
        icon: Flame,
        description: 'Panne chaudière/PAC, fuite gaz',
        urgent: true,
      },
      {
        name: 'Électricien',
        slug: 'electricien',
        icon: Zap,
        description: 'Coupure, court-circuit',
        urgent: true,
      },
      {
        name: 'Couvreur',
        slug: 'couvreur',
        icon: Home,
        description: 'Fuite toiture, tempête',
        urgent: true,
      },
    ],
  },
  {
    category: 'Bâtiment',
    color: 'blue',
    icon: HardHat,
    services: [
      { name: 'Maçon', slug: 'macon', icon: HardHat, description: 'Construction, rénovation' },
      {
        name: 'Menuisier',
        slug: 'menuisier',
        icon: Hammer,
        description: 'Fenêtres, portes — RGE',
      },
      {
        name: 'Peintre',
        slug: 'peintre-en-batiment',
        icon: PaintBucket,
        description: 'Peinture int. et ext.',
      },
    ],
  },
]

// ── Helpers ─────────────────────────────────────────────

export function getCategoryColors(color: string) {
  const map: Record<string, { text: string; hoverBg: string; iconBg: string; border: string }> = {
    red: {
      text: 'text-red-700',
      hoverBg: 'hover:bg-red-50',
      iconBg: 'bg-red-100',
      border: 'border-red-200',
    },
    orange: {
      text: 'text-orange-700',
      hoverBg: 'hover:bg-orange-50',
      iconBg: 'bg-orange-100',
      border: 'border-orange-200',
    },
    blue: {
      text: 'text-primary-600',
      hoverBg: 'hover:bg-primary-50',
      iconBg: 'bg-primary-100',
      border: 'border-primary-200',
    },
    green: {
      text: 'text-green-700',
      hoverBg: 'hover:bg-green-50',
      iconBg: 'bg-green-100',
      border: 'border-green-200',
    },
    pink: {
      text: 'text-pink-700',
      hoverBg: 'hover:bg-pink-50',
      iconBg: 'bg-pink-100',
      border: 'border-pink-200',
    },
    emerald: {
      text: 'text-emerald-700',
      hoverBg: 'hover:bg-emerald-50',
      iconBg: 'bg-emerald-100',
      border: 'border-emerald-200',
    },
  }
  return map[color] || map.blue
}

export async function getLocationFromCoords(lon: number, lat: number): Promise<string | null> {
  try {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`
    const response = await fetch(url)
    if (!response.ok) return null
    const data = await response.json()
    return data.features?.[0]?.properties?.city || null
  } catch {
    return null
  }
}
