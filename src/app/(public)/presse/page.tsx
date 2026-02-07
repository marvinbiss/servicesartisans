import Link from 'next/link'
import { ChevronRight, Mail, Calendar, FileText, Newspaper, Building, Users, TrendingUp, Award } from 'lucide-react'

const communiques = [
  {
    date: '2024-01-15',
    titre: 'ServicesArtisans franchit le cap des 100 000 utilisateurs',
    resume: 'La plateforme de mise en relation entre particuliers et artisans célèbre une étape majeure de son développement. Depuis son lancement, ServicesArtisans a permis de connecter des milliers de Français avec des artisans qualifiés pour leurs projets de rénovation et de dépannage.',
  },
  {
    date: '2023-12-01',
    titre: 'Levée de fonds : ServicesArtisans lève 5 millions d\'euros',
    resume: 'Cette levée de fonds permettra d\'accélérer le développement de la plateforme et de s\'étendre à de nouvelles régions. L\'objectif est de doubler le nombre d\'artisans partenaires d\'ici fin 2024.',
  },
  {
    date: '2023-10-15',
    titre: 'Lancement de l\'application mobile ServicesArtisans',
    resume: 'Les utilisateurs peuvent désormais trouver un artisan et gérer leurs demandes directement depuis leur smartphone. L\'application est disponible sur iOS et Android.',
  },
  {
    date: '2023-09-01',
    titre: 'Partenariat avec la Fédération Française du Bâtiment',
    resume: 'ServicesArtisans et la FFB s\'associent pour promouvoir les artisans qualifiés et certifiés. Ce partenariat garantit aux utilisateurs l\'accès à des professionnels reconnus.',
  },
]

const retombesPresse = [
  {
    media: 'Les Échos',
    date: '2024-01-10',
    titre: 'ServicesArtisans, la plateforme qui révolutionne la mise en relation artisans-particuliers',
    extrait: 'Une nouvelle génération de plateformes facilite l\'accès aux artisans qualifiés...',
  },
  {
    media: 'BFM Business',
    date: '2023-12-05',
    titre: 'Interview : le CEO de ServicesArtisans présente sa vision du marché',
    extrait: 'Le secteur de la rénovation connaît une transformation digitale majeure...',
  },
  {
    media: 'Le Figaro',
    date: '2023-11-20',
    titre: 'Rénovation énergétique : les startups qui facilitent la vie des Français',
    extrait: 'Face à la complexité des démarches, des solutions innovantes émergent...',
  },
  {
    media: 'Capital',
    date: '2023-10-08',
    titre: 'Ces plateformes qui transforment le secteur du BTP',
    extrait: 'La digitalisation du secteur du bâtiment s\'accélère avec de nouveaux acteurs...',
  },
]

const chiffres = [
  { valeur: '100 000+', label: 'Utilisateurs actifs', icon: Users },
  { valeur: '2 500+', label: 'Artisans partenaires', icon: Building },
  { valeur: '50 000+', label: 'Devis réalisés', icon: FileText },
  { valeur: '4.7/5', label: 'Note moyenne', icon: Award },
]

export default function PressePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Presse</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Espace presse
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Retrouvez toutes les actualités de ServicesArtisans, nos communiqués de presse
            et les ressources pour les journalistes.
          </p>
        </div>
      </div>

      {/* Chiffres clés */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Chiffres clés</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {chiffres.map((chiffre) => {
              const Icon = chiffre.icon
              return (
                <div key={chiffre.label} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{chiffre.valeur}</div>
                  <p className="text-gray-500 mt-1">{chiffre.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Communiqués */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Communiqués de presse
            </h2>
            <div className="space-y-6">
              {communiques.map((communique) => (
                <div key={communique.titre} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(communique.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {communique.titre}
                  </h3>
                  <p className="text-gray-600">{communique.resume}</p>
                </div>
              ))}
            </div>

            {/* Retombées presse */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">
              Ils parlent de nous
            </h2>
            <div className="space-y-4">
              {retombesPresse.map((article) => (
                <div
                  key={article.titre}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {article.media}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(article.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{article.titre}</h3>
                  <p className="text-gray-600 text-sm italic">&quot;{article.extrait}&quot;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact presse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                Contact presse
              </h3>
              <p className="text-gray-600 mb-4">
                Pour toute demande d&apos;information, d&apos;interview ou de ressources média, contactez notre équipe communication :
              </p>
              <a
                href="mailto:presse@servicesartisans.fr"
                className="flex items-center gap-2 text-blue-600 font-medium hover:underline mb-4"
              >
                <Mail className="w-4 h-4" />
                presse@servicesartisans.fr
              </a>
              <Link
                href="/contact"
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Nous contacter
              </Link>
            </div>

            {/* Kit presse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Kit presse</h3>
              <p className="text-gray-600 mb-4">
                Pour obtenir notre kit presse (logos, photos, informations), contactez-nous directement.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Logos en haute résolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Photos de l&apos;équipe</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Dossier de presse complet</span>
                </div>
              </div>
              <a
                href="mailto:presse@servicesartisans.fr?subject=Demande kit presse"
                className="block w-full text-center border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors mt-4"
              >
                Demander le kit presse
              </a>
            </div>

            {/* À propos */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">À propos de ServicesArtisans</h3>
              <p className="text-blue-100 text-sm mb-4">
                Fondée en 2020, ServicesArtisans est la plateforme leader de mise en relation
                entre particuliers et artisans en France. Notre mission : faciliter l&apos;accès
                à des professionnels qualifiés et vérifiés.
              </p>
              <Link
                href="/a-propos"
                className="text-white font-medium hover:underline flex items-center gap-1"
              >
                En savoir plus
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Liens utiles */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Liens utiles</h3>
              <div className="space-y-2">
                <Link
                  href="/comment-ca-marche"
                  className="block text-gray-600 hover:text-blue-600 py-1"
                >
                  Comment ça marche ?
                </Link>
                <Link
                  href="/services"
                  className="block text-gray-600 hover:text-blue-600 py-1"
                >
                  Nos services
                </Link>
                <Link
                  href="/inscription-artisan"
                  className="block text-gray-600 hover:text-blue-600 py-1"
                >
                  Devenir artisan partenaire
                </Link>
                <Link
                  href="/faq"
                  className="block text-gray-600 hover:text-blue-600 py-1"
                >
                  Questions fréquentes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
