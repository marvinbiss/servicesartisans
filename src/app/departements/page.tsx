import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Search, Shield, Users, Star, Sparkles, Building2, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, GeographicNavigation, PopularCitiesLinks } from '@/components/InternalLinks'

export const metadata: Metadata = {
  title: 'Artisans par département - Tous les départements de France',
  description: 'Trouvez un artisan qualifié dans votre département. 101 départements français couverts.',
}

const departments = [
  { code: '01', name: 'Ain', region: 'Auvergne-Rhône-Alpes', slug: 'ain-01' },
  { code: '02', name: 'Aisne', region: 'Hauts-de-France', slug: 'aisne-02' },
  { code: '03', name: 'Allier', region: 'Auvergne-Rhône-Alpes', slug: 'allier-03' },
  { code: '04', name: 'Alpes-de-Haute-Provence', region: 'PACA', slug: 'alpes-de-haute-provence-04' },
  { code: '05', name: 'Hautes-Alpes', region: 'PACA', slug: 'hautes-alpes-05' },
  { code: '06', name: 'Alpes-Maritimes', region: 'PACA', slug: 'alpes-maritimes-06' },
  { code: '07', name: 'Ardèche', region: 'Auvergne-Rhône-Alpes', slug: 'ardeche-07' },
  { code: '08', name: 'Ardennes', region: 'Grand Est', slug: 'ardennes-08' },
  { code: '09', name: 'Ariège', region: 'Occitanie', slug: 'ariege-09' },
  { code: '10', name: 'Aube', region: 'Grand Est', slug: 'aube-10' },
  { code: '11', name: 'Aude', region: 'Occitanie', slug: 'aude-11' },
  { code: '12', name: 'Aveyron', region: 'Occitanie', slug: 'aveyron-12' },
  { code: '13', name: 'Bouches-du-Rhône', region: 'PACA', slug: 'bouches-du-rhone-13' },
  { code: '14', name: 'Calvados', region: 'Normandie', slug: 'calvados-14' },
  { code: '15', name: 'Cantal', region: 'Auvergne-Rhône-Alpes', slug: 'cantal-15' },
  { code: '16', name: 'Charente', region: 'Nouvelle-Aquitaine', slug: 'charente-16' },
  { code: '17', name: 'Charente-Maritime', region: 'Nouvelle-Aquitaine', slug: 'charente-maritime-17' },
  { code: '18', name: 'Cher', region: 'Centre-Val de Loire', slug: 'cher-18' },
  { code: '19', name: 'Corrèze', region: 'Nouvelle-Aquitaine', slug: 'correze-19' },
  { code: '2A', name: 'Corse-du-Sud', region: 'Corse', slug: 'corse-du-sud-2a' },
  { code: '2B', name: 'Haute-Corse', region: 'Corse', slug: 'haute-corse-2b' },
  { code: '21', name: 'Côte-d\'Or', region: 'Bourgogne-Franche-Comté', slug: 'cote-dor-21' },
  { code: '22', name: 'Côtes-d\'Armor', region: 'Bretagne', slug: 'cotes-darmor-22' },
  { code: '23', name: 'Creuse', region: 'Nouvelle-Aquitaine', slug: 'creuse-23' },
  { code: '24', name: 'Dordogne', region: 'Nouvelle-Aquitaine', slug: 'dordogne-24' },
  { code: '25', name: 'Doubs', region: 'Bourgogne-Franche-Comté', slug: 'doubs-25' },
  { code: '26', name: 'Drôme', region: 'Auvergne-Rhône-Alpes', slug: 'drome-26' },
  { code: '27', name: 'Eure', region: 'Normandie', slug: 'eure-27' },
  { code: '28', name: 'Eure-et-Loir', region: 'Centre-Val de Loire', slug: 'eure-et-loir-28' },
  { code: '29', name: 'Finistère', region: 'Bretagne', slug: 'finistere-29' },
  { code: '30', name: 'Gard', region: 'Occitanie', slug: 'gard-30' },
  { code: '31', name: 'Haute-Garonne', region: 'Occitanie', slug: 'haute-garonne-31' },
  { code: '32', name: 'Gers', region: 'Occitanie', slug: 'gers-32' },
  { code: '33', name: 'Gironde', region: 'Nouvelle-Aquitaine', slug: 'gironde-33' },
  { code: '34', name: 'Hérault', region: 'Occitanie', slug: 'herault-34' },
  { code: '35', name: 'Ille-et-Vilaine', region: 'Bretagne', slug: 'ille-et-vilaine-35' },
  { code: '36', name: 'Indre', region: 'Centre-Val de Loire', slug: 'indre-36' },
  { code: '37', name: 'Indre-et-Loire', region: 'Centre-Val de Loire', slug: 'indre-et-loire-37' },
  { code: '38', name: 'Isère', region: 'Auvergne-Rhône-Alpes', slug: 'isere-38' },
  { code: '39', name: 'Jura', region: 'Bourgogne-Franche-Comté', slug: 'jura-39' },
  { code: '40', name: 'Landes', region: 'Nouvelle-Aquitaine', slug: 'landes-40' },
  { code: '41', name: 'Loir-et-Cher', region: 'Centre-Val de Loire', slug: 'loir-et-cher-41' },
  { code: '42', name: 'Loire', region: 'Auvergne-Rhône-Alpes', slug: 'loire-42' },
  { code: '43', name: 'Haute-Loire', region: 'Auvergne-Rhône-Alpes', slug: 'haute-loire-43' },
  { code: '44', name: 'Loire-Atlantique', region: 'Pays de la Loire', slug: 'loire-atlantique-44' },
  { code: '45', name: 'Loiret', region: 'Centre-Val de Loire', slug: 'loiret-45' },
  { code: '46', name: 'Lot', region: 'Occitanie', slug: 'lot-46' },
  { code: '47', name: 'Lot-et-Garonne', region: 'Nouvelle-Aquitaine', slug: 'lot-et-garonne-47' },
  { code: '48', name: 'Lozère', region: 'Occitanie', slug: 'lozere-48' },
  { code: '49', name: 'Maine-et-Loire', region: 'Pays de la Loire', slug: 'maine-et-loire-49' },
  { code: '50', name: 'Manche', region: 'Normandie', slug: 'manche-50' },
  { code: '51', name: 'Marne', region: 'Grand Est', slug: 'marne-51' },
  { code: '52', name: 'Haute-Marne', region: 'Grand Est', slug: 'haute-marne-52' },
  { code: '53', name: 'Mayenne', region: 'Pays de la Loire', slug: 'mayenne-53' },
  { code: '54', name: 'Meurthe-et-Moselle', region: 'Grand Est', slug: 'meurthe-et-moselle-54' },
  { code: '55', name: 'Meuse', region: 'Grand Est', slug: 'meuse-55' },
  { code: '56', name: 'Morbihan', region: 'Bretagne', slug: 'morbihan-56' },
  { code: '57', name: 'Moselle', region: 'Grand Est', slug: 'moselle-57' },
  { code: '58', name: 'Nièvre', region: 'Bourgogne-Franche-Comté', slug: 'nievre-58' },
  { code: '59', name: 'Nord', region: 'Hauts-de-France', slug: 'nord-59' },
  { code: '60', name: 'Oise', region: 'Hauts-de-France', slug: 'oise-60' },
  { code: '61', name: 'Orne', region: 'Normandie', slug: 'orne-61' },
  { code: '62', name: 'Pas-de-Calais', region: 'Hauts-de-France', slug: 'pas-de-calais-62' },
  { code: '63', name: 'Puy-de-Dôme', region: 'Auvergne-Rhône-Alpes', slug: 'puy-de-dome-63' },
  { code: '64', name: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine', slug: 'pyrenees-atlantiques-64' },
  { code: '65', name: 'Hautes-Pyrénées', region: 'Occitanie', slug: 'hautes-pyrenees-65' },
  { code: '66', name: 'Pyrénées-Orientales', region: 'Occitanie', slug: 'pyrenees-orientales-66' },
  { code: '67', name: 'Bas-Rhin', region: 'Grand Est', slug: 'bas-rhin-67' },
  { code: '68', name: 'Haut-Rhin', region: 'Grand Est', slug: 'haut-rhin-68' },
  { code: '69', name: 'Rhône', region: 'Auvergne-Rhône-Alpes', slug: 'rhone-69' },
  { code: '70', name: 'Haute-Saône', region: 'Bourgogne-Franche-Comté', slug: 'haute-saone-70' },
  { code: '71', name: 'Saône-et-Loire', region: 'Bourgogne-Franche-Comté', slug: 'saone-et-loire-71' },
  { code: '72', name: 'Sarthe', region: 'Pays de la Loire', slug: 'sarthe-72' },
  { code: '73', name: 'Savoie', region: 'Auvergne-Rhône-Alpes', slug: 'savoie-73' },
  { code: '74', name: 'Haute-Savoie', region: 'Auvergne-Rhône-Alpes', slug: 'haute-savoie-74' },
  { code: '75', name: 'Paris', region: 'Île-de-France', slug: 'paris-75' },
  { code: '76', name: 'Seine-Maritime', region: 'Normandie', slug: 'seine-maritime-76' },
  { code: '77', name: 'Seine-et-Marne', region: 'Île-de-France', slug: 'seine-et-marne-77' },
  { code: '78', name: 'Yvelines', region: 'Île-de-France', slug: 'yvelines-78' },
  { code: '79', name: 'Deux-Sèvres', region: 'Nouvelle-Aquitaine', slug: 'deux-sevres-79' },
  { code: '80', name: 'Somme', region: 'Hauts-de-France', slug: 'somme-80' },
  { code: '81', name: 'Tarn', region: 'Occitanie', slug: 'tarn-81' },
  { code: '82', name: 'Tarn-et-Garonne', region: 'Occitanie', slug: 'tarn-et-garonne-82' },
  { code: '83', name: 'Var', region: 'PACA', slug: 'var-83' },
  { code: '84', name: 'Vaucluse', region: 'PACA', slug: 'vaucluse-84' },
  { code: '85', name: 'Vendée', region: 'Pays de la Loire', slug: 'vendee-85' },
  { code: '86', name: 'Vienne', region: 'Nouvelle-Aquitaine', slug: 'vienne-86' },
  { code: '87', name: 'Haute-Vienne', region: 'Nouvelle-Aquitaine', slug: 'haute-vienne-87' },
  { code: '88', name: 'Vosges', region: 'Grand Est', slug: 'vosges-88' },
  { code: '89', name: 'Yonne', region: 'Bourgogne-Franche-Comté', slug: 'yonne-89' },
  { code: '90', name: 'Territoire de Belfort', region: 'Bourgogne-Franche-Comté', slug: 'territoire-de-belfort-90' },
  { code: '91', name: 'Essonne', region: 'Île-de-France', slug: 'essonne-91' },
  { code: '92', name: 'Hauts-de-Seine', region: 'Île-de-France', slug: 'hauts-de-seine-92' },
  { code: '93', name: 'Seine-Saint-Denis', region: 'Île-de-France', slug: 'seine-saint-denis-93' },
  { code: '94', name: 'Val-de-Marne', region: 'Île-de-France', slug: 'val-de-marne-94' },
  { code: '95', name: 'Val-d\'Oise', region: 'Île-de-France', slug: 'val-doise-95' },
  { code: '971', name: 'Guadeloupe', region: 'DOM-TOM', slug: 'guadeloupe-971' },
  { code: '972', name: 'Martinique', region: 'DOM-TOM', slug: 'martinique-972' },
  { code: '973', name: 'Guyane', region: 'DOM-TOM', slug: 'guyane-973' },
  { code: '974', name: 'La Réunion', region: 'DOM-TOM', slug: 'la-reunion-974' },
  { code: '976', name: 'Mayotte', region: 'DOM-TOM', slug: 'mayotte-976' },
]

export default function DepartementsPage() {
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
            <span className="text-sm font-medium text-white/90">101 départements couverts</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Artisans par{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              département
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Trouvez un artisan qualifié dans votre département.
            Tous les départements français sont couverts.
          </p>

          {/* Premium Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-2">
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un département (nom ou numéro)..."
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25">
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">120 000+ artisans</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">4.8/5 satisfaction</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300">100% vérifiés</span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb + Navigation */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Départements' }]} className="mb-4" />
          <GeographicNavigation />
        </div>
      </section>

      {/* Liste départements */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tous les départements</h2>
                <p className="text-sm text-gray-500">Métropole et outre-mer</p>
              </div>
            </div>
            <Link
              href="/regions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Building2 className="w-4 h-4" />
              Voir par région
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {departments.map((dept) => (
              <Link
                key={dept.code}
                href={`/departements/${dept.slug}`}
                className="group relative bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                    <span className="text-sm font-bold text-blue-600">{dept.code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                      {dept.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{dept.region}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Maillage interne: Services et Villes */}
          <div className="mt-16 pt-12 border-t border-gray-200 grid md:grid-cols-2 gap-12">
            <PopularServicesLinks showTitle={true} limit={8} />
            <PopularCitiesLinks showTitle={true} limit={10} />
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
            <span className="text-sm font-medium text-amber-300">Devis gratuit et sans engagement</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trouvez un artisan dans votre département
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
            Recevez jusqu'à 3 devis de professionnels vérifiés en quelques minutes.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            Demander un devis
            <Sparkles className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
