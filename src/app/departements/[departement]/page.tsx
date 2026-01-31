import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ChevronRight, ArrowRight, Users } from 'lucide-react'

const departementsData: Record<string, {
  code: string
  name: string
  region: string
  regionSlug: string
  prefecture: string
  population: string
  cities: { name: string; slug: string; population: string }[]
}> = {
  'paris-75': {
    code: '75',
    name: 'Paris',
    region: 'Île-de-France',
    regionSlug: 'ile-de-france',
    prefecture: 'Paris',
    population: '2 161 000',
    cities: [
      { name: 'Paris 1er', slug: 'paris-1er', population: '16 000' },
      { name: 'Paris 2e', slug: 'paris-2e', population: '21 000' },
      { name: 'Paris 3e', slug: 'paris-3e', population: '34 000' },
      { name: 'Paris 4e', slug: 'paris-4e', population: '28 000' },
      { name: 'Paris 5e', slug: 'paris-5e', population: '58 000' },
      { name: 'Paris 6e', slug: 'paris-6e', population: '41 000' },
      { name: 'Paris 7e', slug: 'paris-7e', population: '51 000' },
      { name: 'Paris 8e', slug: 'paris-8e', population: '36 000' },
      { name: 'Paris 9e', slug: 'paris-9e', population: '60 000' },
      { name: 'Paris 10e', slug: 'paris-10e', population: '90 000' },
      { name: 'Paris 11e', slug: 'paris-11e', population: '146 000' },
      { name: 'Paris 12e', slug: 'paris-12e', population: '142 000' },
      { name: 'Paris 13e', slug: 'paris-13e', population: '182 000' },
      { name: 'Paris 14e', slug: 'paris-14e', population: '136 000' },
      { name: 'Paris 15e', slug: 'paris-15e', population: '233 000' },
      { name: 'Paris 16e', slug: 'paris-16e', population: '166 000' },
      { name: 'Paris 17e', slug: 'paris-17e', population: '167 000' },
      { name: 'Paris 18e', slug: 'paris-18e', population: '195 000' },
      { name: 'Paris 19e', slug: 'paris-19e', population: '187 000' },
      { name: 'Paris 20e', slug: 'paris-20e', population: '195 000' },
    ],
  },
  'rhone-69': {
    code: '69',
    name: 'Rhône',
    region: 'Auvergne-Rhône-Alpes',
    regionSlug: 'auvergne-rhone-alpes',
    prefecture: 'Lyon',
    population: '1 876 000',
    cities: [
      { name: 'Lyon', slug: 'lyon', population: '522 000' },
      { name: 'Villeurbanne', slug: 'villeurbanne', population: '152 000' },
      { name: 'Vénissieux', slug: 'venissieux', population: '66 000' },
      { name: 'Saint-Priest', slug: 'saint-priest', population: '47 000' },
      { name: 'Caluire-et-Cuire', slug: 'caluire-et-cuire', population: '43 000' },
      { name: 'Bron', slug: 'bron', population: '42 000' },
      { name: 'Villefranche-sur-Saône', slug: 'villefranche-sur-saone', population: '37 000' },
      { name: 'Vaulx-en-Velin', slug: 'vaulx-en-velin', population: '52 000' },
    ],
  },
  'bouches-du-rhone-13': {
    code: '13',
    name: 'Bouches-du-Rhône',
    region: 'PACA',
    regionSlug: 'provence-alpes-cote-azur',
    prefecture: 'Marseille',
    population: '2 043 000',
    cities: [
      { name: 'Marseille', slug: 'marseille', population: '870 000' },
      { name: 'Aix-en-Provence', slug: 'aix-en-provence', population: '147 000' },
      { name: 'Arles', slug: 'arles', population: '52 000' },
      { name: 'Martigues', slug: 'martigues', population: '49 000' },
      { name: 'Aubagne', slug: 'aubagne', population: '47 000' },
      { name: 'Istres', slug: 'istres', population: '44 000' },
      { name: 'Salon-de-Provence', slug: 'salon-de-provence', population: '45 000' },
    ],
  },
  'haute-garonne-31': {
    code: '31',
    name: 'Haute-Garonne',
    region: 'Occitanie',
    regionSlug: 'occitanie',
    prefecture: 'Toulouse',
    population: '1 400 000',
    cities: [
      { name: 'Toulouse', slug: 'toulouse', population: '493 000' },
      { name: 'Colomiers', slug: 'colomiers', population: '40 000' },
      { name: 'Tournefeuille', slug: 'tournefeuille', population: '28 000' },
      { name: 'Muret', slug: 'muret', population: '26 000' },
      { name: 'Blagnac', slug: 'blagnac', population: '25 000' },
      { name: 'Plaisance-du-Touch', slug: 'plaisance-du-touch', population: '20 000' },
    ],
  },
  'gironde-33': {
    code: '33',
    name: 'Gironde',
    region: 'Nouvelle-Aquitaine',
    regionSlug: 'nouvelle-aquitaine',
    prefecture: 'Bordeaux',
    population: '1 623 000',
    cities: [
      { name: 'Bordeaux', slug: 'bordeaux', population: '260 000' },
      { name: 'Mérignac', slug: 'merignac', population: '74 000' },
      { name: 'Pessac', slug: 'pessac', population: '65 000' },
      { name: 'Talence', slug: 'talence', population: '43 000' },
      { name: 'Villenave-d\'Ornon', slug: 'villenave-dornon', population: '37 000' },
      { name: 'Saint-Médard-en-Jalles', slug: 'saint-medard-en-jalles', population: '32 000' },
    ],
  },
  'nord-59': {
    code: '59',
    name: 'Nord',
    region: 'Hauts-de-France',
    regionSlug: 'hauts-de-france',
    prefecture: 'Lille',
    population: '2 608 000',
    cities: [
      { name: 'Lille', slug: 'lille', population: '236 000' },
      { name: 'Roubaix', slug: 'roubaix', population: '98 000' },
      { name: 'Tourcoing', slug: 'tourcoing', population: '98 000' },
      { name: 'Dunkerque', slug: 'dunkerque', population: '87 000' },
      { name: 'Villeneuve-d\'Ascq', slug: 'villeneuve-dascq', population: '62 000' },
      { name: 'Valenciennes', slug: 'valenciennes', population: '43 000' },
      { name: 'Douai', slug: 'douai', population: '39 000' },
    ],
  },
  'alpes-maritimes-06': {
    code: '06',
    name: 'Alpes-Maritimes',
    region: 'PACA',
    regionSlug: 'provence-alpes-cote-azur',
    prefecture: 'Nice',
    population: '1 083 000',
    cities: [
      { name: 'Nice', slug: 'nice', population: '342 000' },
      { name: 'Antibes', slug: 'antibes', population: '74 000' },
      { name: 'Cannes', slug: 'cannes', population: '74 000' },
      { name: 'Grasse', slug: 'grasse', population: '51 000' },
      { name: 'Cagnes-sur-Mer', slug: 'cagnes-sur-mer', population: '50 000' },
      { name: 'Le Cannet', slug: 'le-cannet', population: '41 000' },
    ],
  },
}

const services = [
  { name: 'Plombier', slug: 'plombier' },
  { name: 'Électricien', slug: 'electricien' },
  { name: 'Serrurier', slug: 'serrurier' },
  { name: 'Chauffagiste', slug: 'chauffagiste' },
  { name: 'Peintre', slug: 'peintre-en-batiment' },
  { name: 'Couvreur', slug: 'couvreur' },
  { name: 'Menuisier', slug: 'menuisier' },
  { name: 'Maçon', slug: 'macon' },
]

interface PageProps {
  params: Promise<{ departement: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { departement: deptSlug } = await params
  const dept = departementsData[deptSlug]

  if (!dept) {
    return { title: 'Département non trouvé' }
  }

  return {
    title: `Artisans en ${dept.name} (${dept.code}) - Trouvez un professionnel`,
    description: `Trouvez un artisan qualifié dans le ${dept.name} (${dept.code}). Plombiers, électriciens, serruriers et plus. Devis gratuits.`,
  }
}

export default async function DepartementPage({ params }: PageProps) {
  const { departement: deptSlug } = await params
  const dept = departementsData[deptSlug]

  if (!dept) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Accueil</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/departements" className="text-gray-500 hover:text-gray-700">Départements</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{dept.name} ({dept.code})</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {dept.code}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{dept.name}</h1>
              <p className="text-blue-200">
                <Link href={`/regions/${dept.regionSlug}`} className="hover:text-white">
                  {dept.region}
                </Link>
              </p>
            </div>
          </div>
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Préfecture : {dept.prefecture}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{dept.population} habitants</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Trouver un artisan dans le {dept.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}/${dept.cities[0]?.slug || 'france'}`}
                className="bg-gray-50 hover:bg-blue-50 rounded-lg p-4 text-center transition-colors group"
              >
                <span className="font-medium text-gray-900 group-hover:text-blue-600">
                  {service.name}
                </span>
                <span className="block text-sm text-gray-500">
                  dans le {dept.code}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Villes */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Principales villes du {dept.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dept.cities.map((city) => (
              <Link
                key={city.slug}
                href={`/services/plombier/${city.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {city.name}
                    </div>
                    <div className="text-sm text-gray-500">{city.population} hab.</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d'un artisan dans le {dept.name} ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Recevez jusqu'à 3 devis gratuits de professionnels qualifiés
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Demander un devis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
