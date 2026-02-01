import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, ArrowRight, Shield, Star, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'
import { popularRegions } from '@/lib/constants/navigation'

const regionsData: Record<string, {
  name: string
  description: string
  departments: { name: string; code: string; slug: string; cities: { name: string; slug: string }[] }[]
}> = {
  'ile-de-france': {
    name: 'Île-de-France',
    description: 'Première région économique de France, l\'Île-de-France concentre une forte demande en services artisanaux.',
    departments: [
      { name: 'Paris', code: '75', slug: 'paris-75', cities: [{ name: 'Paris', slug: 'paris' }] },
      { name: 'Seine-et-Marne', code: '77', slug: 'seine-et-marne-77', cities: [{ name: 'Meaux', slug: 'meaux' }, { name: 'Melun', slug: 'melun' }, { name: 'Chelles', slug: 'chelles' }] },
      { name: 'Yvelines', code: '78', slug: 'yvelines-78', cities: [{ name: 'Versailles', slug: 'versailles' }, { name: 'Saint-Germain-en-Laye', slug: 'saint-germain-en-laye' }] },
      { name: 'Essonne', code: '91', slug: 'essonne-91', cities: [{ name: 'Évry', slug: 'evry' }, { name: 'Corbeil-Essonnes', slug: 'corbeil-essonnes' }] },
      { name: 'Hauts-de-Seine', code: '92', slug: 'hauts-de-seine-92', cities: [{ name: 'Boulogne-Billancourt', slug: 'boulogne-billancourt' }, { name: 'Nanterre', slug: 'nanterre' }] },
      { name: 'Seine-Saint-Denis', code: '93', slug: 'seine-saint-denis-93', cities: [{ name: 'Saint-Denis', slug: 'saint-denis' }, { name: 'Montreuil', slug: 'montreuil' }] },
      { name: 'Val-de-Marne', code: '94', slug: 'val-de-marne-94', cities: [{ name: 'Créteil', slug: 'creteil' }, { name: 'Vitry-sur-Seine', slug: 'vitry-sur-seine' }] },
      { name: 'Val-d\'Oise', code: '95', slug: 'val-doise-95', cities: [{ name: 'Argenteuil', slug: 'argenteuil' }, { name: 'Cergy', slug: 'cergy' }] },
    ],
  },
  'auvergne-rhone-alpes': {
    name: 'Auvergne-Rhône-Alpes',
    description: 'Deuxième région de France, l\'Auvergne-Rhône-Alpes offre un dynamisme économique important.',
    departments: [
      { name: 'Rhône', code: '69', slug: 'rhone-69', cities: [{ name: 'Lyon', slug: 'lyon' }, { name: 'Villeurbanne', slug: 'villeurbanne' }] },
      { name: 'Isère', code: '38', slug: 'isere-38', cities: [{ name: 'Grenoble', slug: 'grenoble' }] },
      { name: 'Loire', code: '42', slug: 'loire-42', cities: [{ name: 'Saint-Étienne', slug: 'saint-etienne' }] },
      { name: 'Haute-Savoie', code: '74', slug: 'haute-savoie-74', cities: [{ name: 'Annecy', slug: 'annecy' }] },
      { name: 'Savoie', code: '73', slug: 'savoie-73', cities: [{ name: 'Chambéry', slug: 'chambery' }] },
      { name: 'Ain', code: '01', slug: 'ain-01', cities: [{ name: 'Bourg-en-Bresse', slug: 'bourg-en-bresse' }] },
      { name: 'Drôme', code: '26', slug: 'drome-26', cities: [{ name: 'Valence', slug: 'valence' }] },
      { name: 'Puy-de-Dôme', code: '63', slug: 'puy-de-dome-63', cities: [{ name: 'Clermont-Ferrand', slug: 'clermont-ferrand' }] },
    ],
  },
  'provence-alpes-cote-azur': {
    name: 'Provence-Alpes-Côte d\'Azur',
    description: 'Région touristique par excellence, la PACA bénéficie d\'un réseau dense d\'artisans qualifiés.',
    departments: [
      { name: 'Bouches-du-Rhône', code: '13', slug: 'bouches-du-rhone-13', cities: [{ name: 'Marseille', slug: 'marseille' }, { name: 'Aix-en-Provence', slug: 'aix-en-provence' }] },
      { name: 'Alpes-Maritimes', code: '06', slug: 'alpes-maritimes-06', cities: [{ name: 'Nice', slug: 'nice' }, { name: 'Cannes', slug: 'cannes' }] },
      { name: 'Var', code: '83', slug: 'var-83', cities: [{ name: 'Toulon', slug: 'toulon' }] },
      { name: 'Vaucluse', code: '84', slug: 'vaucluse-84', cities: [{ name: 'Avignon', slug: 'avignon' }] },
    ],
  },
  'occitanie': {
    name: 'Occitanie',
    description: 'La plus grande région de France métropolitaine offre une diversité de services artisanaux.',
    departments: [
      { name: 'Haute-Garonne', code: '31', slug: 'haute-garonne-31', cities: [{ name: 'Toulouse', slug: 'toulouse' }] },
      { name: 'Hérault', code: '34', slug: 'herault-34', cities: [{ name: 'Montpellier', slug: 'montpellier' }] },
      { name: 'Gard', code: '30', slug: 'gard-30', cities: [{ name: 'Nîmes', slug: 'nimes' }] },
      { name: 'Pyrénées-Orientales', code: '66', slug: 'pyrenees-orientales-66', cities: [{ name: 'Perpignan', slug: 'perpignan' }] },
    ],
  },
  'nouvelle-aquitaine': {
    name: 'Nouvelle-Aquitaine',
    description: 'Plus grande région de France, la Nouvelle-Aquitaine dispose d\'un réseau d\'artisans étendu.',
    departments: [
      { name: 'Gironde', code: '33', slug: 'gironde-33', cities: [{ name: 'Bordeaux', slug: 'bordeaux' }] },
      { name: 'Haute-Vienne', code: '87', slug: 'haute-vienne-87', cities: [{ name: 'Limoges', slug: 'limoges' }] },
      { name: 'Charente-Maritime', code: '17', slug: 'charente-maritime-17', cities: [{ name: 'La Rochelle', slug: 'la-rochelle' }] },
      { name: 'Pyrénées-Atlantiques', code: '64', slug: 'pyrenees-atlantiques-64', cities: [{ name: 'Pau', slug: 'pau' }, { name: 'Bayonne', slug: 'bayonne' }] },
    ],
  },
  'hauts-de-france': {
    name: 'Hauts-de-France',
    description: 'Région dynamique du nord de la France avec un tissu artisanal dense.',
    departments: [
      { name: 'Nord', code: '59', slug: 'nord-59', cities: [{ name: 'Lille', slug: 'lille' }, { name: 'Roubaix', slug: 'roubaix' }] },
      { name: 'Pas-de-Calais', code: '62', slug: 'pas-de-calais-62', cities: [{ name: 'Calais', slug: 'calais' }] },
      { name: 'Somme', code: '80', slug: 'somme-80', cities: [{ name: 'Amiens', slug: 'amiens' }] },
      { name: 'Oise', code: '60', slug: 'oise-60', cities: [{ name: 'Beauvais', slug: 'beauvais' }] },
    ],
  },
  'grand-est': {
    name: 'Grand Est',
    description: 'Carrefour européen, le Grand Est bénéficie d\'artisans aux savoir-faire reconnus.',
    departments: [
      { name: 'Bas-Rhin', code: '67', slug: 'bas-rhin-67', cities: [{ name: 'Strasbourg', slug: 'strasbourg' }] },
      { name: 'Moselle', code: '57', slug: 'moselle-57', cities: [{ name: 'Metz', slug: 'metz' }] },
      { name: 'Haut-Rhin', code: '68', slug: 'haut-rhin-68', cities: [{ name: 'Mulhouse', slug: 'mulhouse' }, { name: 'Colmar', slug: 'colmar' }] },
      { name: 'Marne', code: '51', slug: 'marne-51', cities: [{ name: 'Reims', slug: 'reims' }] },
      { name: 'Meurthe-et-Moselle', code: '54', slug: 'meurthe-et-moselle-54', cities: [{ name: 'Nancy', slug: 'nancy' }] },
    ],
  },
  'pays-de-la-loire': {
    name: 'Pays de la Loire',
    description: 'Région atlantique dynamique avec un fort tissu artisanal.',
    departments: [
      { name: 'Loire-Atlantique', code: '44', slug: 'loire-atlantique-44', cities: [{ name: 'Nantes', slug: 'nantes' }, { name: 'Saint-Nazaire', slug: 'saint-nazaire' }] },
      { name: 'Maine-et-Loire', code: '49', slug: 'maine-et-loire-49', cities: [{ name: 'Angers', slug: 'angers' }] },
      { name: 'Sarthe', code: '72', slug: 'sarthe-72', cities: [{ name: 'Le Mans', slug: 'le-mans' }] },
      { name: 'Vendée', code: '85', slug: 'vendee-85', cities: [{ name: 'La Roche-sur-Yon', slug: 'la-roche-sur-yon' }] },
    ],
  },
  'bretagne': {
    name: 'Bretagne',
    description: 'Région à l\'identité forte avec des artisans attachés à la qualité.',
    departments: [
      { name: 'Ille-et-Vilaine', code: '35', slug: 'ille-et-vilaine-35', cities: [{ name: 'Rennes', slug: 'rennes' }] },
      { name: 'Finistère', code: '29', slug: 'finistere-29', cities: [{ name: 'Brest', slug: 'brest' }, { name: 'Quimper', slug: 'quimper' }] },
      { name: 'Morbihan', code: '56', slug: 'morbihan-56', cities: [{ name: 'Vannes', slug: 'vannes' }, { name: 'Lorient', slug: 'lorient' }] },
      { name: 'Côtes-d\'Armor', code: '22', slug: 'cotes-darmor-22', cities: [{ name: 'Saint-Brieuc', slug: 'saint-brieuc' }] },
    ],
  },
  'normandie': {
    name: 'Normandie',
    description: 'Région historique avec un patrimoine bâti important nécessitant des artisans qualifiés.',
    departments: [
      { name: 'Seine-Maritime', code: '76', slug: 'seine-maritime-76', cities: [{ name: 'Le Havre', slug: 'le-havre' }, { name: 'Rouen', slug: 'rouen' }] },
      { name: 'Calvados', code: '14', slug: 'calvados-14', cities: [{ name: 'Caen', slug: 'caen' }] },
      { name: 'Manche', code: '50', slug: 'manche-50', cities: [{ name: 'Cherbourg', slug: 'cherbourg' }] },
      { name: 'Eure', code: '27', slug: 'eure-27', cities: [{ name: 'Évreux', slug: 'evreux' }] },
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
]

interface PageProps {
  params: Promise<{ region: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = regionsData[regionSlug]

  if (!region) {
    return { title: 'Région non trouvée' }
  }

  return {
    title: `Artisans en ${region.name} - Trouvez un professionnel`,
    description: `Trouvez un artisan qualifié en ${region.name}. Plombiers, électriciens, serruriers et plus. Devis gratuits.`,
  }
}

export default async function RegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params
  const region = regionsData[regionSlug]

  if (!region) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Régions', href: '/regions' },
              { label: region.name },
            ]}
          />
        </div>
      </div>

      {/* Hero - Premium Branding */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">{region.name}</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl">
            {region.description}
          </p>

          {/* Premium badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Artisans vérifiés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Avis clients authentiques</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Devis sous 24h</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{region.departments.length} départements</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services rapides */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <span className="text-gray-600 font-medium py-2">Recherche rapide :</span>
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors"
              >
                {service.name} en {region.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Départements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Départements de la région {region.name}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {region.departments.map((dept) => (
              <Link
                key={dept.code}
                href={`/departements/${dept.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {dept.name}
                    </h3>
                    <span className="text-sm text-gray-500">Département {dept.code}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {dept.cities.slice(0, 3).map((city) => (
                    <span key={city.slug} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {city.name}
                    </span>
                  ))}
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
            Besoin d&apos;un artisan en {region.name} ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Recevez jusqu&apos;à 3 devis gratuits de professionnels qualifiés
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

      {/* Voir aussi - Related Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Voir aussi</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Services populaires */}
            <div>
              <PopularServicesLinks showTitle={true} limit={6} />
            </div>

            {/* Autres régions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Autres régions</h3>
              <div className="space-y-2">
                {popularRegions
                  .filter(r => r.slug !== regionSlug)
                  .slice(0, 5)
                  .map((r) => (
                    <Link
                      key={r.slug}
                      href={`/regions/${r.slug}`}
                      className="block text-gray-600 hover:text-blue-600 text-sm py-1 transition-colors"
                    >
                      Artisans en {r.name}
                    </Link>
                  ))}
              </div>
              <Link
                href="/regions"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
              >
                Toutes les régions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Villes populaires */}
            <div>
              <PopularCitiesLinks showTitle={true} limit={6} />
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Footer */}
    </div>
  )
}
