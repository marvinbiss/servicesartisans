import Link from 'next/link'
import { ChevronRight, Download, Mail, Calendar, ExternalLink, FileText, Image } from 'lucide-react'

const communiques = [
  {
    date: '2024-01-15',
    titre: 'ServicesArtisans franchit le cap des 100 000 utilisateurs',
    resume: 'La plateforme de mise en relation entre particuliers et artisans célèbre une étape majeure de son développement.',
    lien: '#',
  },
  {
    date: '2023-12-01',
    titre: 'Levée de fonds : ServicesArtisans lève 5 millions d\'euros',
    resume: 'Cette levée de fonds permettra d\'accélérer le développement de la plateforme et de s\'étendre à de nouvelles régions.',
    lien: '#',
  },
  {
    date: '2023-10-15',
    titre: 'Lancement de l\'application mobile ServicesArtisans',
    resume: 'Les utilisateurs peuvent désormais trouver un artisan et gérer leurs demandes directement depuis leur smartphone.',
    lien: '#',
  },
  {
    date: '2023-09-01',
    titre: 'Partenariat avec la Fédération Française du Bâtiment',
    resume: 'ServicesArtisans et la FFB s\'associent pour promouvoir les artisans qualifiés et certifiés.',
    lien: '#',
  },
]

const retombesPresse = [
  {
    media: 'Les Échos',
    date: '2024-01-10',
    titre: 'ServicesArtisans, la plateforme qui révolutionne la mise en relation artisans-particuliers',
    lien: '#',
  },
  {
    media: 'BFM Business',
    date: '2023-12-05',
    titre: 'Interview : le CEO de ServicesArtisans présente sa vision du marché',
    lien: '#',
  },
  {
    media: 'Le Figaro',
    date: '2023-11-20',
    titre: 'Rénovation énergétique : les startups qui facilitent la vie des Français',
    lien: '#',
  },
  {
    media: 'Capital',
    date: '2023-10-08',
    titre: 'Ces plateformes qui transforment le secteur du BTP',
    lien: '#',
  },
]

const chiffres = [
  { valeur: '100 000+', label: 'Utilisateurs actifs' },
  { valeur: '2 500+', label: 'Artisans partenaires' },
  { valeur: '50 000+', label: 'Devis réalisés' },
  { valeur: '4.7/5', label: 'Note moyenne' },
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
            {chiffres.map((chiffre) => (
              <div key={chiffre.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{chiffre.valeur}</div>
                <p className="text-gray-500 mt-1">{chiffre.label}</p>
              </div>
            ))}
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
                  <p className="text-gray-600 mb-4">{communique.resume}</p>
                  <a
                    href={communique.lien}
                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le communiqué (PDF)
                  </a>
                </div>
              ))}
            </div>

            {/* Retombées presse */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">
              Ils parlent de nous
            </h2>
            <div className="space-y-4">
              {retombesPresse.map((article) => (
                <a
                  key={article.titre}
                  href={article.lien}
                  className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {article.media}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(article.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{article.titre}</h3>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact presse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact presse</h3>
              <p className="text-gray-600 mb-4">
                Pour toute demande d'information ou d'interview, contactez notre équipe communication :
              </p>
              <a
                href="mailto:presse@servicesartisans.fr"
                className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
              >
                <Mail className="w-4 h-4" />
                presse@servicesartisans.fr
              </a>
            </div>

            {/* Kit presse */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Kit presse</h3>
              <p className="text-gray-600 mb-4">
                Téléchargez notre kit presse contenant logos, photos et informations sur l'entreprise.
              </p>
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Image className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Logos</p>
                    <p className="text-sm text-gray-500">PNG, SVG</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Image className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Photos</p>
                    <p className="text-sm text-gray-500">Haute résolution</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Dossier de presse</p>
                    <p className="text-sm text-gray-500">PDF</p>
                  </div>
                </a>
              </div>
            </div>

            {/* À propos */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">À propos de ServicesArtisans</h3>
              <p className="text-blue-100 text-sm mb-4">
                Fondée en 2020, ServicesArtisans est la plateforme leader de mise en relation
                entre particuliers et artisans en France. Notre mission : faciliter l'accès
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
          </div>
        </div>
      </div>
    </div>
  )
}
