import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Search, ArrowRight, Users, Star, Shield } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getOrganizationSchema } from '@/lib/seo/jsonld'
import { REVALIDATE } from '@/lib/cache'

// ISR: Revalidate every 24 hours
export const revalidate = REVALIDATE.locations

export const metadata: Metadata = {
  title: 'Artisans par ville - Trouvez un artisan près de chez vous',
  description: 'Trouvez un artisan qualifié dans votre ville. Plus de 35 000 villes couvertes en France. Paris, Lyon, Marseille, Toulouse, Bordeaux et toutes les villes de France.',
  openGraph: {
    title: 'Artisans par ville en France',
    description: 'Plus de 35 000 villes couvertes. Trouvez un artisan qualifié près de chez vous.',
  },
}

const regions = [
  {
    name: 'Île-de-France',
    villes: [
      { name: 'Paris', slug: 'paris', population: '2 161 000' },
      { name: 'Boulogne-Billancourt', slug: 'boulogne-billancourt', population: '121 000' },
      { name: 'Saint-Denis', slug: 'saint-denis', population: '113 000' },
      { name: 'Argenteuil', slug: 'argenteuil', population: '110 000' },
      { name: 'Montreuil', slug: 'montreuil', population: '109 000' },
      { name: 'Nanterre', slug: 'nanterre', population: '96 000' },
      { name: 'Vitry-sur-Seine', slug: 'vitry-sur-seine', population: '94 000' },
      { name: 'Créteil', slug: 'creteil', population: '92 000' },
      { name: 'Versailles', slug: 'versailles', population: '85 000' },
      { name: 'Colombes', slug: 'colombes', population: '85 000' },
    ]
  },
  {
    name: 'Auvergne-Rhône-Alpes',
    villes: [
      { name: 'Lyon', slug: 'lyon', population: '522 000' },
      { name: 'Grenoble', slug: 'grenoble', population: '158 000' },
      { name: 'Saint-Étienne', slug: 'saint-etienne', population: '172 000' },
      { name: 'Villeurbanne', slug: 'villeurbanne', population: '152 000' },
      { name: 'Clermont-Ferrand', slug: 'clermont-ferrand', population: '147 000' },
      { name: 'Annecy', slug: 'annecy', population: '130 000' },
      { name: 'Vénissieux', slug: 'venissieux', population: '66 000' },
      { name: 'Valence', slug: 'valence', population: '64 000' },
    ]
  },
  {
    name: 'Provence-Alpes-Côte d\'Azur',
    villes: [
      { name: 'Marseille', slug: 'marseille', population: '870 000' },
      { name: 'Nice', slug: 'nice', population: '342 000' },
      { name: 'Toulon', slug: 'toulon', population: '178 000' },
      { name: 'Aix-en-Provence', slug: 'aix-en-provence', population: '147 000' },
      { name: 'Avignon', slug: 'avignon', population: '91 000' },
      { name: 'Antibes', slug: 'antibes', population: '74 000' },
      { name: 'Cannes', slug: 'cannes', population: '74 000' },
      { name: 'La Seyne-sur-Mer', slug: 'la-seyne-sur-mer', population: '65 000' },
    ]
  },
  {
    name: 'Occitanie',
    villes: [
      { name: 'Toulouse', slug: 'toulouse', population: '493 000' },
      { name: 'Montpellier', slug: 'montpellier', population: '295 000' },
      { name: 'Nîmes', slug: 'nimes', population: '151 000' },
      { name: 'Perpignan', slug: 'perpignan', population: '121 000' },
      { name: 'Béziers', slug: 'beziers', population: '78 000' },
      { name: 'Narbonne', slug: 'narbonne', population: '55 000' },
      { name: 'Carcassonne', slug: 'carcassonne', population: '46 000' },
      { name: 'Albi', slug: 'albi', population: '49 000' },
    ]
  },
  {
    name: 'Nouvelle-Aquitaine',
    villes: [
      { name: 'Bordeaux', slug: 'bordeaux', population: '260 000' },
      { name: 'Limoges', slug: 'limoges', population: '132 000' },
      { name: 'Poitiers', slug: 'poitiers', population: '89 000' },
      { name: 'La Rochelle', slug: 'la-rochelle', population: '79 000' },
      { name: 'Pau', slug: 'pau', population: '77 000' },
      { name: 'Mérignac', slug: 'merignac', population: '74 000' },
      { name: 'Pessac', slug: 'pessac', population: '65 000' },
      { name: 'Angoulême', slug: 'angouleme', population: '42 000' },
    ]
  },
  {
    name: 'Hauts-de-France',
    villes: [
      { name: 'Lille', slug: 'lille', population: '236 000' },
      { name: 'Amiens', slug: 'amiens', population: '134 000' },
      { name: 'Roubaix', slug: 'roubaix', population: '98 000' },
      { name: 'Tourcoing', slug: 'tourcoing', population: '98 000' },
      { name: 'Dunkerque', slug: 'dunkerque', population: '87 000' },
      { name: 'Villeneuve-d\'Ascq', slug: 'villeneuve-dascq', population: '62 000' },
      { name: 'Calais', slug: 'calais', population: '68 000' },
      { name: 'Beauvais', slug: 'beauvais', population: '56 000' },
    ]
  },
  {
    name: 'Grand Est',
    villes: [
      { name: 'Strasbourg', slug: 'strasbourg', population: '287 000' },
      { name: 'Reims', slug: 'reims', population: '182 000' },
      { name: 'Metz', slug: 'metz', population: '118 000' },
      { name: 'Mulhouse', slug: 'mulhouse', population: '109 000' },
      { name: 'Nancy', slug: 'nancy', population: '105 000' },
      { name: 'Colmar', slug: 'colmar', population: '70 000' },
      { name: 'Troyes', slug: 'troyes', population: '61 000' },
      { name: 'Charleville-Mézières', slug: 'charleville-mezieres', population: '46 000' },
    ]
  },
  {
    name: 'Pays de la Loire',
    villes: [
      { name: 'Nantes', slug: 'nantes', population: '320 000' },
      { name: 'Angers', slug: 'angers', population: '157 000' },
      { name: 'Le Mans', slug: 'le-mans', population: '144 000' },
      { name: 'Saint-Nazaire', slug: 'saint-nazaire', population: '72 000' },
      { name: 'La Roche-sur-Yon', slug: 'la-roche-sur-yon', population: '57 000' },
      { name: 'Cholet', slug: 'cholet', population: '54 000' },
    ]
  },
  {
    name: 'Bretagne',
    villes: [
      { name: 'Rennes', slug: 'rennes', population: '222 000' },
      { name: 'Brest', slug: 'brest', population: '139 000' },
      { name: 'Quimper', slug: 'quimper', population: '63 000' },
      { name: 'Lorient', slug: 'lorient', population: '57 000' },
      { name: 'Vannes', slug: 'vannes', population: '54 000' },
      { name: 'Saint-Brieuc', slug: 'saint-brieuc', population: '45 000' },
    ]
  },
  {
    name: 'Normandie',
    villes: [
      { name: 'Le Havre', slug: 'le-havre', population: '170 000' },
      { name: 'Rouen', slug: 'rouen', population: '113 000' },
      { name: 'Caen', slug: 'caen', population: '106 000' },
      { name: 'Cherbourg', slug: 'cherbourg', population: '79 000' },
      { name: 'Évreux', slug: 'evreux', population: '47 000' },
      { name: 'Dieppe', slug: 'dieppe', population: '29 000' },
    ]
  },
]

export default function VillesPage() {
  // JSON-LD structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Villes', url: '/villes' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Artisans par ville
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Plus de 35 000 villes couvertes en France.
            Trouvez un artisan qualifié près de chez vous.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une ville..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-300"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Villes par région */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {regions.map((region) => (
            <div key={region.name} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                {region.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {region.villes.map((ville) => (
                  <Link
                    key={ville.slug}
                    href={`/services/plombier/${ville.slug}`}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {ville.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ville.population} hab.
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Votre ville n'est pas listée ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Nous couvrons plus de 35 000 communes en France
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Rechercher ma ville
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
