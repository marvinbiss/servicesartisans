import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight, Users, Star, Shield, Sparkles, Building2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, GeographicNavigation } from '@/components/InternalLinks'

export const metadata: Metadata = {
  title: 'Artisans par région - Toutes les régions de France',
  description: 'Trouvez un artisan qualifié dans votre région. Toutes les régions de France métropolitaine et DOM-TOM couvertes.',
  alternates: {
    canonical: 'https://servicesartisans.fr/regions',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

const regions = [
  {
    name: 'Île-de-France',
    slug: 'ile-de-france',
    departments: ['Paris (75)', 'Seine-et-Marne (77)', 'Yvelines (78)', 'Essonne (91)', 'Hauts-de-Seine (92)', 'Seine-Saint-Denis (93)', 'Val-de-Marne (94)', 'Val-d\'Oise (95)'],
    population: '12,2 millions',
  },
  {
    name: 'Auvergne-Rhône-Alpes',
    slug: 'auvergne-rhone-alpes',
    departments: ['Ain (01)', 'Allier (03)', 'Ardèche (07)', 'Cantal (15)', 'Drôme (26)', 'Isère (38)', 'Loire (42)', 'Haute-Loire (43)', 'Puy-de-Dôme (63)', 'Rhône (69)', 'Savoie (73)', 'Haute-Savoie (74)'],
    population: '8,0 millions',
  },
  {
    name: 'Nouvelle-Aquitaine',
    slug: 'nouvelle-aquitaine',
    departments: ['Charente (16)', 'Charente-Maritime (17)', 'Corrèze (19)', 'Creuse (23)', 'Dordogne (24)', 'Gironde (33)', 'Landes (40)', 'Lot-et-Garonne (47)', 'Pyrénées-Atlantiques (64)', 'Deux-Sèvres (79)', 'Vienne (86)', 'Haute-Vienne (87)'],
    population: '6,0 millions',
  },
  {
    name: 'Occitanie',
    slug: 'occitanie',
    departments: ['Ariège (09)', 'Aude (11)', 'Aveyron (12)', 'Gard (30)', 'Haute-Garonne (31)', 'Gers (32)', 'Hérault (34)', 'Lot (46)', 'Lozère (48)', 'Hautes-Pyrénées (65)', 'Pyrénées-Orientales (66)', 'Tarn (81)', 'Tarn-et-Garonne (82)'],
    population: '5,9 millions',
  },
  {
    name: 'Hauts-de-France',
    slug: 'hauts-de-france',
    departments: ['Aisne (02)', 'Nord (59)', 'Oise (60)', 'Pas-de-Calais (62)', 'Somme (80)'],
    population: '6,0 millions',
  },
  {
    name: 'Provence-Alpes-Côte d\'Azur',
    slug: 'provence-alpes-cote-azur',
    departments: ['Alpes-de-Haute-Provence (04)', 'Hautes-Alpes (05)', 'Alpes-Maritimes (06)', 'Bouches-du-Rhône (13)', 'Var (83)', 'Vaucluse (84)'],
    population: '5,1 millions',
  },
  {
    name: 'Grand Est',
    slug: 'grand-est',
    departments: ['Ardennes (08)', 'Aube (10)', 'Marne (51)', 'Haute-Marne (52)', 'Meurthe-et-Moselle (54)', 'Meuse (55)', 'Moselle (57)', 'Bas-Rhin (67)', 'Haut-Rhin (68)', 'Vosges (88)'],
    population: '5,6 millions',
  },
  {
    name: 'Pays de la Loire',
    slug: 'pays-de-la-loire',
    departments: ['Loire-Atlantique (44)', 'Maine-et-Loire (49)', 'Mayenne (53)', 'Sarthe (72)', 'Vendée (85)'],
    population: '3,8 millions',
  },
  {
    name: 'Bretagne',
    slug: 'bretagne',
    departments: ['Côtes-d\'Armor (22)', 'Finistère (29)', 'Ille-et-Vilaine (35)', 'Morbihan (56)'],
    population: '3,4 millions',
  },
  {
    name: 'Normandie',
    slug: 'normandie',
    departments: ['Calvados (14)', 'Eure (27)', 'Manche (50)', 'Orne (61)', 'Seine-Maritime (76)'],
    population: '3,3 millions',
  },
  {
    name: 'Bourgogne-Franche-Comté',
    slug: 'bourgogne-franche-comte',
    departments: ['Côte-d\'Or (21)', 'Doubs (25)', 'Jura (39)', 'Nièvre (58)', 'Haute-Saône (70)', 'Saône-et-Loire (71)', 'Yonne (89)', 'Territoire de Belfort (90)'],
    population: '2,8 millions',
  },
  {
    name: 'Centre-Val de Loire',
    slug: 'centre-val-de-loire',
    departments: ['Cher (18)', 'Eure-et-Loir (28)', 'Indre (36)', 'Indre-et-Loire (37)', 'Loir-et-Cher (41)', 'Loiret (45)'],
    population: '2,6 millions',
  },
  {
    name: 'Corse',
    slug: 'corse',
    departments: ['Corse-du-Sud (2A)', 'Haute-Corse (2B)'],
    population: '340 000',
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
      {/* Premium Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">13 régions métropolitaines + DOM-TOM</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Artisans par{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              région
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Trouvez un artisan qualifié dans votre région.
            Toute la France métropolitaine et les DOM-TOM couverts.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">Artisans vérifiés</span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb + Navigation */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Régions' }]} className="mb-4" />
          <GeographicNavigation />
        </div>
      </section>

      {/* Régions métropolitaines */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">France métropolitaine</h2>
              <p className="text-sm text-gray-500">13 régions, 101 départements</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {region.name}
                      </h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      {region.population}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600">
                      <Sparkles className="w-4 h-4" />
                      Artisans disponibles
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {region.departments.length} départements
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Lien vers départements */}
          <div className="mt-8 text-center">
            <Link
              href="/departements"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-medium transition-colors"
            >
              <Building2 className="w-5 h-5" />
              Voir tous les départements
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Services populaires - Maillage interne */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <PopularServicesLinks showTitle={true} limit={8} />
          </div>
        </div>
      </section>

      {/* DOM-TOM */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Outre-mer</h2>
              <p className="text-sm text-gray-500">5 départements et régions d'outre-mer</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {domTom.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="group relative bg-white rounded-xl border border-gray-100 p-5 hover:border-amber-200 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 transition-colors">
                    <span className="text-sm font-bold text-amber-600">{region.code}</span>
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {region.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Couverture nationale</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Besoin d'un artisan rapidement ?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
            Obtenez jusqu'à 3 devis gratuits en quelques clics.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
