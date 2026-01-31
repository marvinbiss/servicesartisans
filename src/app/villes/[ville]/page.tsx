import Link from 'next/link'
import { MapPin, Users, Building, ChevronRight, Star, Phone, ArrowRight } from 'lucide-react'

const villesData: Record<string, {
  name: string
  region: string
  departement: string
  population: string
  description: string
  codePostal: string
  quartiers: string[]
}> = {
  'paris': {
    name: 'Paris',
    region: 'Île-de-France',
    departement: 'Paris (75)',
    population: '2 161 000',
    codePostal: '75000',
    description: 'Capitale de la France, Paris est le centre économique et culturel du pays. Nos artisans interviennent dans tous les arrondissements parisiens.',
    quartiers: ['1er arr.', '2e arr.', '3e arr.', '4e arr.', '5e arr.', '6e arr.', '7e arr.', '8e arr.', '9e arr.', '10e arr.', '11e arr.', '12e arr.', '13e arr.', '14e arr.', '15e arr.', '16e arr.', '17e arr.', '18e arr.', '19e arr.', '20e arr.'],
  },
  'marseille': {
    name: 'Marseille',
    region: 'Provence-Alpes-Côte d\'Azur',
    departement: 'Bouches-du-Rhône (13)',
    population: '870 000',
    codePostal: '13000',
    description: 'Deuxième ville de France, Marseille est un port méditerranéen dynamique. Trouvez des artisans qualifiés dans tous les quartiers marseillais.',
    quartiers: ['Vieux-Port', 'Le Panier', 'La Joliette', 'Castellane', 'La Canebière', 'Prado', 'Bonneveine', 'Les Calanques'],
  },
  'lyon': {
    name: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    departement: 'Rhône (69)',
    population: '522 000',
    codePostal: '69000',
    description: 'Troisième ville de France, Lyon est renommée pour sa gastronomie et son patrimoine. Nos artisans couvrent tous les arrondissements lyonnais.',
    quartiers: ['Presqu\'île', 'Vieux Lyon', 'Part-Dieu', 'Confluence', 'Croix-Rousse', 'Gerland', 'Villeurbanne'],
  },
  'toulouse': {
    name: 'Toulouse',
    region: 'Occitanie',
    departement: 'Haute-Garonne (31)',
    population: '493 000',
    codePostal: '31000',
    description: 'La ville rose, capitale de l\'aéronautique, offre un cadre de vie exceptionnel. Trouvez votre artisan à Toulouse et sa métropole.',
    quartiers: ['Capitole', 'Saint-Cyprien', 'Carmes', 'Les Minimes', 'Saint-Michel', 'Rangueil', 'Blagnac'],
  },
  'nice': {
    name: 'Nice',
    region: 'Provence-Alpes-Côte d\'Azur',
    departement: 'Alpes-Maritimes (06)',
    population: '342 000',
    codePostal: '06000',
    description: 'Capitale de la Côte d\'Azur, Nice bénéficie d\'un climat méditerranéen idéal. Nos artisans interviennent sur toute la métropole niçoise.',
    quartiers: ['Vieux Nice', 'Promenade des Anglais', 'Cimiez', 'Port', 'Libération', 'Saint-Roch'],
  },
  'nantes': {
    name: 'Nantes',
    region: 'Pays de la Loire',
    departement: 'Loire-Atlantique (44)',
    population: '318 000',
    codePostal: '44000',
    description: 'Ville dynamique de l\'Ouest, Nantes est connue pour sa créativité. Découvrez nos artisans qualifiés dans la métropole nantaise.',
    quartiers: ['Centre-ville', 'Île de Nantes', 'Doulon', 'Erdre', 'Chantenay', 'Saint-Herblain'],
  },
}

const services = [
  { slug: 'plombier', name: 'Plombier', icon: '🔧' },
  { slug: 'electricien', name: 'Électricien', icon: '⚡' },
  { slug: 'serrurier', name: 'Serrurier', icon: '🔑' },
  { slug: 'chauffagiste', name: 'Chauffagiste', icon: '🔥' },
  { slug: 'peintre', name: 'Peintre', icon: '🎨' },
  { slug: 'menuisier', name: 'Menuisier', icon: '🪚' },
]

const artisansExemple = [
  { name: 'Martin Plomberie', note: 4.9, avis: 127, metier: 'Plombier' },
  { name: 'Élec Express', note: 4.8, avis: 89, metier: 'Électricien' },
  { name: 'Serrures & Clés', note: 4.7, avis: 56, metier: 'Serrurier' },
]

export default function VillePage({ params }: { params: { ville: string } }) {
  const ville = villesData[params.ville]

  if (!ville) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ville non trouvée</h1>
          <Link href="/villes" className="text-blue-600 hover:underline">
            Voir toutes les villes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/villes" className="hover:text-white">Villes</Link>
            <ChevronRight className="w-4 h-4" />
            <span>{ville.name}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Artisans à {ville.name}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            {ville.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-blue-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{ville.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              <span>{ville.departement}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{ville.population} habitants</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trouver un artisan à {ville.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}/${params.ville}`}
                className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow group"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">à {ville.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Top artisans */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Artisans les mieux notés à {ville.name}
            </h2>
            <Link href={`/services/plombier/${params.ville}`} className="text-blue-600 hover:underline">
              Voir tous
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {artisansExemple.map((artisan, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {artisan.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{artisan.name}</h3>
                    <p className="text-sm text-gray-500">{artisan.metier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(artisan.note) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900">{artisan.note}</span>
                  <span className="text-gray-500">({artisan.avis} avis)</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contacter
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quartiers */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quartiers desservis à {ville.name}
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap gap-2">
              {ville.quartiers.map((quartier) => (
                <span
                  key={quartier}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
                >
                  {quartier}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un artisan à {ville.name} ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Décrivez votre projet et recevez jusqu'à 5 devis gratuits d'artisans qualifiés près de chez vous.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  )
}
