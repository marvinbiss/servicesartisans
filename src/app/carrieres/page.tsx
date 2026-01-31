'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, MapPin, Clock, Euro, Users, Heart, Zap, Coffee, Briefcase, ArrowRight } from 'lucide-react'

const offres = [
  {
    id: 1,
    titre: 'Développeur Full Stack',
    equipe: 'Tech',
    lieu: 'Paris / Remote',
    type: 'CDI',
    description: 'Rejoignez notre équipe technique pour développer de nouvelles fonctionnalités sur notre plateforme Next.js/React.',
    competences: ['React/Next.js', 'Node.js', 'PostgreSQL', 'TypeScript'],
  },
  {
    id: 2,
    titre: 'Product Manager',
    equipe: 'Produit',
    lieu: 'Paris',
    type: 'CDI',
    description: 'Définissez la roadmap produit et travaillez avec les équipes tech et design pour améliorer l\'expérience utilisateur.',
    competences: ['Product Management', 'Agile/Scrum', 'Analytics', 'UX'],
  },
  {
    id: 3,
    titre: 'Responsable Commercial B2B',
    equipe: 'Commercial',
    lieu: 'Paris / Lyon',
    type: 'CDI',
    description: 'Développez notre réseau d\'artisans partenaires et négociez des partenariats stratégiques.',
    competences: ['Vente B2B', 'Négociation', 'CRM', 'Secteur BTP'],
  },
  {
    id: 4,
    titre: 'Customer Success Manager',
    equipe: 'Support',
    lieu: 'Paris',
    type: 'CDI',
    description: 'Accompagnez nos artisans partenaires dans leur utilisation de la plateforme et maximisez leur satisfaction.',
    competences: ['Relation client', 'Onboarding', 'Support', 'Analyse'],
  },
  {
    id: 5,
    titre: 'UX/UI Designer',
    equipe: 'Design',
    lieu: 'Paris / Remote',
    type: 'CDI',
    description: 'Créez des interfaces utilisateur intuitives et contribuez à l\'amélioration continue de notre design system.',
    competences: ['Figma', 'Design System', 'User Research', 'Prototypage'],
  },
  {
    id: 6,
    titre: 'Data Analyst',
    equipe: 'Data',
    lieu: 'Paris',
    type: 'CDI',
    description: 'Analysez les données de la plateforme pour identifier des opportunités de croissance et d\'optimisation.',
    competences: ['SQL', 'Python', 'Data Viz', 'A/B Testing'],
  },
]

const avantages = [
  {
    icon: Euro,
    titre: 'Salaire compétitif',
    description: 'Rémunération attractive + participation aux bénéfices',
  },
  {
    icon: Heart,
    titre: 'Mutuelle premium',
    description: 'Couverture santé complète prise en charge à 100%',
  },
  {
    icon: Coffee,
    titre: 'Télétravail flexible',
    description: 'Jusqu\'à 3 jours de remote par semaine',
  },
  {
    icon: Zap,
    titre: 'Formation continue',
    description: 'Budget formation annuel pour développer vos compétences',
  },
  {
    icon: Users,
    titre: 'Équipe soudée',
    description: 'Team buildings, afterworks et événements réguliers',
  },
  {
    icon: Briefcase,
    titre: 'RTT & congés',
    description: '25 jours de congés + 10 RTT par an',
  },
]

const valeurs = [
  {
    titre: 'Excellence',
    description: 'Nous visons l\'excellence dans tout ce que nous faisons, pour nos utilisateurs comme pour nos artisans partenaires.',
  },
  {
    titre: 'Transparence',
    description: 'La confiance se construit sur la transparence. Nous communiquons ouvertement en interne comme en externe.',
  },
  {
    titre: 'Innovation',
    description: 'Nous repoussons les limites pour créer des solutions innovantes qui simplifient la vie de nos utilisateurs.',
  },
  {
    titre: 'Impact',
    description: 'Chaque membre de l\'équipe a un impact direct sur le succès de l\'entreprise et la satisfaction de nos clients.',
  },
]

export default function CarrieresPage() {
  const [selectedEquipe, setSelectedEquipe] = useState('Toutes')
  const equipes = ['Toutes', 'Tech', 'Produit', 'Commercial', 'Support', 'Design', 'Data']

  const filteredOffres = selectedEquipe === 'Toutes'
    ? offres
    : offres.filter(o => o.equipe === selectedEquipe)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Carrières</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Rejoignez l'aventure ServicesArtisans
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mb-8">
            Nous construisons la plateforme qui révolutionne la mise en relation entre
            particuliers et artisans. Rejoignez une équipe passionnée et contribuez à notre mission.
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <p className="text-blue-200">Collaborateurs</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">15+</div>
              <p className="text-blue-200">Nationalités</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.8</div>
              <p className="text-blue-200">Note Glassdoor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Valeurs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Nos valeurs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valeurs.map((valeur) => (
              <div key={valeur.titre} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{valeur.titre}</h3>
                <p className="text-gray-600">{valeur.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Avantages */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Pourquoi nous rejoindre ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avantages.map((avantage) => {
              const Icon = avantage.icon
              return (
                <div key={avantage.titre} className="bg-white rounded-xl shadow-sm p-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{avantage.titre}</h3>
                    <p className="text-gray-600 text-sm">{avantage.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Offres */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Nos offres d'emploi ({offres.length})
          </h2>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-8">
            {equipes.map((equipe) => (
              <button
                key={equipe}
                onClick={() => setSelectedEquipe(equipe)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedEquipe === equipe
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {equipe}
              </button>
            ))}
          </div>

          {/* Liste des offres */}
          <div className="space-y-4">
            {filteredOffres.map((offre) => (
              <div
                key={offre.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{offre.titre}</h3>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">
                        {offre.equipe}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{offre.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {offre.lieu}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {offre.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {offre.competences.map((comp) => (
                        <span
                          key={comp}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a
                    href={`mailto:careers@servicesartisans.fr?subject=Candidature: ${offre.titre}&body=Bonjour,%0A%0AJe souhaite postuler au poste de ${offre.titre} (${offre.equipe}).%0A%0AMerci de trouver ci-joint mon CV et ma lettre de motivation.%0A%0ACordialement`}
                    className="flex-shrink-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Postuler
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredOffres.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">Aucune offre dans cette catégorie pour le moment.</p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Vous ne trouvez pas le poste idéal ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Envoyez-nous une candidature spontanée ! Nous sommes toujours à la recherche
            de talents motivés pour rejoindre notre équipe.
          </p>
          <a
            href="mailto:careers@servicesartisans.fr"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Candidature spontanée
            <ArrowRight className="w-5 h-5" />
          </a>
        </section>
      </div>
    </div>
  )
}
