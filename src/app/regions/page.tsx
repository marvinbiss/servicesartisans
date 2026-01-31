import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Artisans par région - Toutes les régions de France',
  description: 'Trouvez un artisan qualifié dans votre région. Toutes les régions de France métropolitaine et DOM-TOM couvertes.',
}

const regions = [
  {
    name: 'Île-de-France',
    slug: 'ile-de-france',
    departments: ['Paris (75)', 'Seine-et-Marne (77)', 'Yvelines (78)', 'Essonne (91)', 'Hauts-de-Seine (92)', 'Seine-Saint-Denis (93)', 'Val-de-Marne (94)', 'Val-d\'Oise (95)'],
    population: '12,2 millions',
    artisans: '45 000+',
  },
  {
    name: 'Auvergne-Rhône-Alpes',
    slug: 'auvergne-rhone-alpes',
    departments: ['Ain (01)', 'Allier (03)', 'Ardèche (07)', 'Cantal (15)', 'Drôme (26)', 'Isère (38)', 'Loire (42)', 'Haute-Loire (43)', 'Puy-de-Dôme (63)', 'Rhône (69)', 'Savoie (73)', 'Haute-Savoie (74)'],
    population: '8,0 millions',
    artisans: '28 000+',
  },
  {
    name: 'Nouvelle-Aquitaine',
    slug: 'nouvelle-aquitaine',
    departments: ['Charente (16)', 'Charente-Maritime (17)', 'Corrèze (19)', 'Creuse (23)', 'Dordogne (24)', 'Gironde (33)', 'Landes (40)', 'Lot-et-Garonne (47)', 'Pyrénées-Atlantiques (64)', 'Deux-Sèvres (79)', 'Vienne (86)', 'Haute-Vienne (87)'],
    population: '6,0 millions',
    artisans: '22 000+',
  },
  {
    name: 'Occitanie',
    slug: 'occitanie',
    departments: ['Ariège (09)', 'Aude (11)', 'Aveyron (12)', 'Gard (30)', 'Haute-Garonne (31)', 'Gers (32)', 'Hérault (34)', 'Lot (46)', 'Lozère (48)', 'Hautes-Pyrénées (65)', 'Pyrénées-Orientales (66)', 'Tarn (81)', 'Tarn-et-Garonne (82)'],
    population: '5,9 millions',
    artisans: '21 000+',
  },
  {
    name: 'Hauts-de-France',
    slug: 'hauts-de-france',
    departments: ['Aisne (02)', 'Nord (59)', 'Oise (60)', 'Pas-de-Calais (62)', 'Somme (80)'],
    population: '6,0 millions',
    artisans: '18 000+',
  },
  {
    name: 'Provence-Alpes-Côte d\'Azur',
    slug: 'provence-alpes-cote-azur',
    departments: ['Alpes-de-Haute-Provence (04)', 'Hautes-Alpes (05)', 'Alpes-Maritimes (06)', 'Bouches-du-Rhône (13)', 'Var (83)', 'Vaucluse (84)'],
    population: '5,1 millions',
    artisans: '19 000+',
  },
  {
    name: 'Grand Est',
    slug: 'grand-est',
    departments: ['Ardennes (08)', 'Aube (10)', 'Marne (51)', 'Haute-Marne (52)', 'Meurthe-et-Moselle (54)', 'Meuse (55)', 'Moselle (57)', 'Bas-Rhin (67)', 'Haut-Rhin (68)', 'Vosges (88)'],
    population: '5,6 millions',
    artisans: '17 000+',
  },
  {
    name: 'Pays de la Loire',
    slug: 'pays-de-la-loire',
    departments: ['Loire-Atlantique (44)', 'Maine-et-Loire (49)', 'Mayenne (53)', 'Sarthe (72)', 'Vendée (85)'],
    population: '3,8 millions',
    artisans: '14 000+',
  },
  {
    name: 'Bretagne',
    slug: 'bretagne',
    departments: ['Côtes-d\'Armor (22)', 'Finistère (29)', 'Ille-et-Vilaine (35)', 'Morbihan (56)'],
    population: '3,4 millions',
    artisans: '12 000+',
  },
  {
    name: 'Normandie',
    slug: 'normandie',
    departments: ['Calvados (14)', 'Eure (27)', 'Manche (50)', 'Orne (61)', 'Seine-Maritime (76)'],
    population: '3,3 millions',
    artisans: '11 000+',
  },
  {
    name: 'Bourgogne-Franche-Comté',
    slug: 'bourgogne-franche-comte',
    departments: ['Côte-d\'Or (21)', 'Doubs (25)', 'Jura (39)', 'Nièvre (58)', 'Haute-Saône (70)', 'Saône-et-Loire (71)', 'Yonne (89)', 'Territoire de Belfort (90)'],
    population: '2,8 millions',
    artisans: '9 000+',
  },
  {
    name: 'Centre-Val de Loire',
    slug: 'centre-val-de-loire',
    departments: ['Cher (18)', 'Eure-et-Loir (28)', 'Indre (36)', 'Indre-et-Loire (37)', 'Loir-et-Cher (41)', 'Loiret (45)'],
    population: '2,6 millions',
    artisans: '8 500+',
  },
  {
    name: 'Corse',
    slug: 'corse',
    departments: ['Corse-du-Sud (2A)', 'Haute-Corse (2B)'],
    population: '340 000',
    artisans: '2 500+',
  },
]

const domTom = [
  { name: 'Guadeloupe', slug: 'guadeloupe', code: '971' },
  { name: 'Martinique', slug: 'martinique', code: '972' },
  { name: 'Guyane', slug: 'guyane', code: '973' },
  { name: 'La Réunion', slug: 'la-reunion', code: '974' },
  { name: 'Mayotte', slug: 'mayotte', code: '976' },
]

export default function RegionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Artisans par région
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Trouvez un artisan qualifié dans votre région.
            Toute la France métropolitaine et les DOM-TOM couverts.
          </p>
        </div>
      </section>

      {/* Régions métropolitaines */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            France métropolitaine
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {region.name}
                    </h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                  <span>{region.population} hab.</span>
                  <span className="text-blue-600 font-medium">{region.artisans} artisans</span>
                </div>
                <div className="text-sm text-gray-500">
                  {region.departments.length} départements
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DOM-TOM */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Outre-mer
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {domTom.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition-colors group text-center"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {region.name}
                </div>
                <div className="text-sm text-gray-500">({region.code})</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
