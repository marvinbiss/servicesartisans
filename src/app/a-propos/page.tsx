import { Metadata } from 'next'
import Link from 'next/link'
import { Users, Shield, Star, MapPin, Award, Heart, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'À propos - ServicesArtisans',
  description: 'Découvrez ServicesArtisans, la plateforme de référence pour trouver des artisans qualifiés en France. Notre mission : connecter les particuliers avec les meilleurs professionnels.',
}

const stats = [
  { value: '120 000+', label: 'Artisans référencés', icon: Users },
  { value: '35 000+', label: 'Villes couvertes', icon: MapPin },
  { value: '500 000+', label: 'Devis envoyés', icon: Star },
  { value: '98%', label: 'Clients satisfaits', icon: Heart },
]

const values = [
  {
    icon: Shield,
    title: 'Confiance',
    description: 'Nous vérifions chaque artisan pour vous garantir des professionnels sérieux et qualifiés.',
  },
  {
    icon: Star,
    title: 'Qualité',
    description: 'Nous sélectionnons les meilleurs artisans grâce aux avis vérifiés de nos utilisateurs.',
  },
  {
    icon: Users,
    title: 'Proximité',
    description: 'Nous vous connectons avec des artisans locaux pour un service rapide et personnalisé.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Nous nous engageons à offrir la meilleure expérience pour trouver votre artisan.',
  },
]

const team = [
  { name: 'Marie Dupont', role: 'Fondatrice & CEO', image: '👩‍💼' },
  { name: 'Pierre Martin', role: 'Directeur Technique', image: '👨‍💻' },
  { name: 'Sophie Bernard', role: 'Responsable Artisans', image: '👩‍🔧' },
  { name: 'Lucas Petit', role: 'Responsable Clients', image: '👨‍💼' },
]

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            À propos de ServicesArtisans
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Depuis 2020, nous connectons les particuliers avec les meilleurs artisans de France.
            Notre mission : rendre la recherche d'un professionnel simple, rapide et fiable.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600 mt-1">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notre histoire
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  ServicesArtisans est né d'un constat simple : trouver un artisan de confiance
                  était trop compliqué. Entre les recherches interminables, les devis peu clairs
                  et les mauvaises surprises, les particuliers méritaient mieux.
                </p>
                <p>
                  En 2020, nous avons créé cette plateforme avec une ambition : devenir le
                  réflexe de tous les Français pour leurs travaux. Aujourd'hui, nous sommes
                  fiers de connecter chaque jour des milliers de personnes avec des artisans
                  qualifiés et vérifiés.
                </p>
                <p>
                  Notre équipe travaille sans relâche pour améliorer l'expérience de nos
                  utilisateurs et accompagner les artisans dans le développement de leur activité.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Notre mission</h3>
              <p className="text-blue-100 text-lg mb-6">
                Faciliter la mise en relation entre particuliers et artisans pour que
                chaque projet de travaux soit une réussite.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Simplifier la recherche d'artisans</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Garantir des professionnels de qualité</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Accompagner les artisans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ces principes guident chacune de nos actions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* L'équipe */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Notre équipe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des passionnés au service des artisans et des particuliers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">
                  {member.image}
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Rejoignez l'aventure ServicesArtisans
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Que vous soyez particulier ou artisan, nous sommes là pour vous
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/devis"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Demander un devis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/inscription-artisan"
              className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
            >
              Devenir artisan partenaire
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
