import Link from 'next/link'
import { ChevronRight, Building, Users, TrendingUp, HeartHandshake, Mail, Phone, CheckCircle } from 'lucide-react'

const partenaires = [
  {
    categorie: 'Fournisseurs',
    description: 'Nos partenaires fournisseurs nous permettent de proposer des tarifs compétitifs',
    logos: ['Leroy Merlin', 'Point P', 'Cedeo', 'Rexel'],
  },
  {
    categorie: 'Assurances',
    description: 'Des partenaires de confiance pour protéger vos travaux',
    logos: ['AXA', 'Allianz', 'MAIF', 'Groupama'],
  },
  {
    categorie: 'Formations',
    description: 'Des organismes de formation pour nos artisans',
    logos: ['AFPA', 'Compagnons du Devoir', 'FFB', 'CAPEB'],
  },
]

const avantages = [
  {
    icon: Users,
    titre: 'Visibilité accrue',
    description: 'Accédez à une communauté de plus de 100 000 utilisateurs actifs chaque mois.',
  },
  {
    icon: TrendingUp,
    titre: 'Croissance garantie',
    description: 'Nos partenaires constatent en moyenne +40% de leads qualifiés.',
  },
  {
    icon: HeartHandshake,
    titre: 'Accompagnement dédié',
    description: 'Un interlocuteur unique pour gérer votre partenariat au quotidien.',
  },
  {
    icon: Building,
    titre: 'Image de marque',
    description: 'Associez votre marque à une plateforme de confiance reconnue.',
  },
]

const typesPartenariat = [
  {
    titre: 'Partenariat Commercial',
    description: 'Devenez fournisseur référencé et proposez vos produits à nos artisans partenaires.',
    avantages: [
      'Visibilité sur notre marketplace',
      'Accès à notre réseau d\'artisans',
      'Programme de remises exclusives',
      'Co-marketing et événements',
    ],
  },
  {
    titre: 'Partenariat Institutionnel',
    description: 'Collaborez avec nous pour promouvoir les métiers de l\'artisanat.',
    avantages: [
      'Actions de communication conjointes',
      'Participation à des événements',
      'Études et publications',
      'Formations certifiantes',
    ],
  },
  {
    titre: 'Partenariat Technologique',
    description: 'Intégrez vos solutions à notre plateforme pour enrichir notre offre.',
    avantages: [
      'API et intégrations',
      'Co-développement de fonctionnalités',
      'Accès à nos données anonymisées',
      'Support technique dédié',
    ],
  },
]

export default function PartenairesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Partenaires</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Nos partenaires
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            ServicesArtisans s'entoure des meilleurs partenaires pour offrir un service de qualité
            à nos utilisateurs et artisans.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Partenaires actuels */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Ils nous font confiance
          </h2>
          {partenaires.map((cat) => (
            <div key={cat.categorie} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{cat.categorie}</h3>
              <p className="text-gray-600 mb-4">{cat.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cat.logos.map((logo) => (
                  <div
                    key={logo}
                    className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center h-24"
                  >
                    <span className="text-gray-400 font-semibold">{logo}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Avantages */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Pourquoi devenir partenaire ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {avantages.map((avantage) => {
              const Icon = avantage.icon
              return (
                <div key={avantage.titre} className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{avantage.titre}</h3>
                  <p className="text-gray-600 text-sm">{avantage.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Types de partenariat */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Types de partenariat
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {typesPartenariat.map((type) => (
              <div key={type.titre} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{type.titre}</h3>
                <p className="text-gray-600 mb-4">{type.description}</p>
                <ul className="space-y-2">
                  {type.avantages.map((avantage, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {avantage}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Devenez partenaire
            </h2>
            <p className="text-blue-100 mb-8">
              Vous souhaitez rejoindre notre réseau de partenaires ? Contactez notre équipe dédiée
              pour discuter des opportunités de collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:partenaires@servicesartisans.fr"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <Mail className="w-5 h-5" />
                partenaires@servicesartisans.fr
              </a>
              <a
                href="tel:+33123456789"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                <Phone className="w-5 h-5" />
                01 23 45 67 89
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
