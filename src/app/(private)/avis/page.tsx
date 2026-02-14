import Link from 'next/link'
import { Metadata } from 'next'
import { Star, Quote, ThumbsUp, Calendar, MapPin, CheckCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

export const metadata: Metadata = {
  title: 'Avis Clients Authentiques - Témoignages',
  description: 'Découvrez les avis authentiques de nos clients sur nos artisans qualifiés.',
}

const avisRecents = [
  {
    id: 1,
    client: 'Jean D.',
    ville: 'Paris 15e',
    villeSlug: 'paris',
    artisan: 'Martin Plomberie',
    service: 'Plombier',
    serviceSlug: 'plombier',
    note: 5,
    date: '2024-01-20',
    commentaire: 'Intervention rapide et efficace pour une fuite sous l\'évier. Le plombier était très professionnel et a résolu le problème en moins d\'une heure. Je recommande vivement !',
    verifie: true,
  },
  {
    id: 2,
    client: 'Marie L.',
    ville: 'Lyon 3e',
    villeSlug: 'lyon',
    artisan: 'Électricité Plus',
    service: 'Électricien',
    serviceSlug: 'electricien',
    note: 5,
    date: '2024-01-19',
    commentaire: 'Excellent travail pour la rénovation complète de mon tableau électrique. Travail soigné, explications claires et prix conforme au devis.',
    verifie: true,
  },
  {
    id: 3,
    client: 'Pierre M.',
    ville: 'Marseille',
    villeSlug: 'marseille',
    artisan: 'Serrures Express',
    service: 'Serrurier',
    serviceSlug: 'serrurier',
    note: 4,
    date: '2024-01-18',
    commentaire: 'Intervention rapide suite à une porte claquée. Serrurier compétent et honnête. Seul bémol : tarif un peu élevé pour un dimanche.',
    verifie: true,
  },
  {
    id: 4,
    client: 'Sophie B.',
    ville: 'Toulouse',
    villeSlug: 'toulouse',
    artisan: 'Chauffage Pro',
    service: 'Chauffagiste',
    serviceSlug: 'chauffagiste',
    note: 5,
    date: '2024-01-17',
    commentaire: 'Entretien annuel de ma chaudière réalisé avec soin. Le technicien a pris le temps de m\'expliquer les points à surveiller. Très satisfaite !',
    verifie: true,
  },
  {
    id: 5,
    client: 'Lucas R.',
    ville: 'Bordeaux',
    villeSlug: 'bordeaux',
    artisan: 'Peinture Design',
    service: 'Peintre',
    serviceSlug: 'peintre-en-batiment',
    note: 5,
    date: '2024-01-16',
    commentaire: 'Travail impeccable pour la peinture de mon salon. Finitions parfaites, chantier laissé propre. Je ferai appel à eux pour les autres pièces.',
    verifie: true,
  },
  {
    id: 6,
    client: 'Emma T.',
    ville: 'Nice',
    villeSlug: 'nice',
    artisan: 'Menuiserie Artisanale',
    service: 'Menuisier',
    serviceSlug: 'menuisier',
    note: 5,
    date: '2024-01-15',
    commentaire: 'Fabrication sur mesure d\'une bibliothèque. Le résultat est magnifique, exactement ce que je voulais. Artisan passionné et méticuleux.',
    verifie: true,
  },
]

const stats = {
  totalAvis: 0,
  noteMoyenne: 0,
  artisansVerifies: 0,
  clientsSatisfaits: 0,
}

const breadcrumbItems = [
  { label: 'Avis clients' }
]

export default function AvisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Breadcrumb items={breadcrumbItems} className="mb-4 text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_svg]:text-blue-300 [&>span]:text-white" />
          <h1 className="text-4xl font-bold mb-4">
            Avis clients authentiques
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Découvrez les retours d'expérience de nos clients. Tous nos avis sont authentiques
            et recueillis après chaque intervention.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{stats.totalAvis.toLocaleString()}</div>
              <p className="text-gray-500 mt-1">Avis authentiques</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 flex items-center justify-center gap-2">
                {stats.noteMoyenne}
                <Star className="w-8 h-8 text-yellow-400 fill-current" />
              </div>
              <p className="text-gray-500 mt-1">Note moyenne</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{stats.artisansVerifies.toLocaleString()}</div>
              <p className="text-gray-500 mt-1">Artisans référencés</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{stats.clientsSatisfaits}%</div>
              <p className="text-gray-500 mt-1">Clients satisfaits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les services</option>
            <option value="plombier">Plombier</option>
            <option value="electricien">Électricien</option>
            <option value="serrurier">Serrurier</option>
            <option value="chauffagiste">Chauffagiste</option>
            <option value="peintre">Peintre</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Toutes les villes</option>
            <option value="paris">Paris</option>
            <option value="lyon">Lyon</option>
            <option value="marseille">Marseille</option>
            <option value="toulouse">Toulouse</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles et +</option>
            <option value="3">3 étoiles et +</option>
          </select>
        </div>

        {/* Avis list */}
        <div className="space-y-6">
          {avisRecents.map((avis) => (
            <div key={avis.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {avis.client.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{avis.client}</span>
                      {avis.verifie && (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Link href={`/villes/${avis.villeSlug}`} className="flex items-center gap-1 hover:text-blue-600">
                        <MapPin className="w-3 h-3" />
                        {avis.ville}
                      </Link>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(avis.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < avis.note ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <Link
                  href={`/services/${avis.serviceSlug}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {avis.service}
                </Link>
                <span className="text-gray-400 mx-2">-</span>
                <span className="text-sm text-gray-600">{avis.artisan}</span>
              </div>

              <div className="relative">
                <Quote className="absolute -left-2 -top-2 w-8 h-8 text-gray-100" />
                <p className="text-gray-700 pl-6">{avis.commentaire}</p>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Utile</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-8">
          <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Charger plus d'avis
          </button>
        </div>

        {/* Related links */}
        <section className="mt-16 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Explorer par service ou ville</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PopularServicesLinks />
            <PopularCitiesLinks />
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Vous avez fait appel à un artisan ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Partagez votre expérience et aidez d'autres utilisateurs à trouver le bon professionnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/espace-client/avis"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Laisser un avis
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Trouver un artisan
            </Link>
          </div>
        </div>
      </div>

      {/* Footer links */}
    </div>
  )
}
