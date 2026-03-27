import { villes, regions, departements, services as allServices } from '@/lib/data/france'
import HeaderClient from './HeaderClient'

/**
 * Server component wrapper for Header.
 * Computes data counts server-side so that the 25K-line france.ts
 * data file is NOT included in the client JS bundle.
 */
export default function Header({ artisanCount = 0 }: { artisanCount?: number }) {
  return (
    <HeaderClient
      artisanCount={artisanCount}
      allServicesCount={allServices.length}
      villesCount={villes.length}
      regionsCount={regions.length}
      departementsCount={departements.length}
    />
  )
}
