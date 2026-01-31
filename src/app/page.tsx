import Link from 'next/link'
import { Metadata } from 'next'
import { Search, MapPin, Star, Shield, ArrowRight, Clock, CheckCircle, Wrench, Zap, Award, Users, TrendingUp, ChevronRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import { REVALIDATE } from '@/lib/cache'

// ISR: Revalidate homepage every hour
export const revalidate = REVALIDATE.services

export const metadata: Metadata = {
  title: 'ServicesArtisans - Trouvez les meilleurs artisans pres de chez vous',
  description: 'Trouvez et comparez les meilleurs artisans de votre region. Plombiers, electriciens, serruriers et plus. Devis gratuits et avis verifies sur plus de 35 000 villes.',
  openGraph: {
    title: 'ServicesArtisans - Trouvez les meilleurs artisans pres de chez vous',
    description: 'Plus de 120 000 artisans verifies. Comparez les avis et obtenez des devis gratuits.',
    type: 'website',
  },
}

// Services populaires
const popularServices = [
  { name: 'Plombier', slug: 'plombier', icon: Wrench, color: 'from-blue-500 to-blue-600' },
  { name: 'Electricien', slug: 'electricien', icon: Zap, color: 'from-amber-500 to-amber-600' },
  { name: 'Serrurier', slug: 'serrurier', icon: Shield, color: 'from-green-500 to-green-600' },
  { name: 'Chauffagiste', slug: 'chauffagiste', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  { name: 'Menuisier', slug: 'menuisier', icon: Award, color: 'from-amber-600 to-amber-700' },
  { name: 'Peintre', slug: 'peintre-en-batiment', icon: Star, color: 'from-purple-500 to-purple-600' },
  { name: 'Couvreur', slug: 'couvreur', icon: Shield, color: 'from-slate-600 to-slate-700' },
  { name: 'Macon', slug: 'macon', icon: Wrench, color: 'from-red-500 to-red-600' },
]

const popularCities = [
  { name: 'Paris', slug: 'paris' },
  { name: 'Lyon', slug: 'lyon' },
  { name: 'Marseille', slug: 'marseille' },
  { name: 'Toulouse', slug: 'toulouse' },
  { name: 'Bordeaux', slug: 'bordeaux' },
  { name: 'Nantes', slug: 'nantes' },
  { name: 'Nice', slug: 'nice' },
  { name: 'Lille', slug: 'lille' },
]

const testimonials = [
  {
    name: 'Marie L.',
    city: 'Paris',
    rating: 5,
    text: 'Excellent service ! J\'ai trouve un plombier en moins de 2h pour une urgence. Tres professionnel.',
    service: 'Plomberie',
  },
  {
    name: 'Pierre D.',
    city: 'Lyon',
    rating: 5,
    text: 'La plateforme est tres facile a utiliser. Les avis sont fiables et m\'ont aide a choisir.',
    service: 'Electricite',
  },
  {
    name: 'Sophie M.',
    city: 'Bordeaux',
    rating: 5,
    text: 'Enfin une plateforme serieuse pour trouver des artisans de confiance. Je recommande !',
    service: 'Menuiserie',
  },
]

export default function HomePage() {
  const organizationSchema = getOrganizationSchema()
  const websiteSchema = getWebsiteSchema()

  return (
    <div className="min-h-screen">
      <JsonLd data={[organizationSchema, websiteSchema]} />

      {/* Hero Section - Premium Design */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-100">+2 500 artisans disponibles maintenant</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              L'excellence artisanale
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                a portee de clic
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Trouvez, comparez et reservez les meilleurs artisans pres de chez vous en quelques clics.
            </p>

            {/* Search Form - Premium */}
            <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 max-w-3xl mx-auto">
              <form action="/recherche" className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Quel service recherchez-vous ?"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Ville ou code postal"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                >
                  Rechercher
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Popular searches */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="text-slate-400 text-sm">Recherches populaires :</span>
              {['Plombier Paris', 'Electricien Lyon', 'Serrurier urgence'].map((term) => (
                <Link
                  key={term}
                  href={`/recherche?q=${encodeURIComponent(term)}`}
                  className="text-sm text-blue-300 hover:text-blue-200 hover:underline"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '120 000+', label: 'Artisans verifies', icon: Users },
              { value: '500 000+', label: 'Reservations', icon: CheckCircle },
              { value: '4.8/5', label: 'Note moyenne', icon: Star },
              { value: '< 2h', label: 'Temps de reponse', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tous les services du batiment
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Trouvez l'artisan qu'il vous faut parmi nos 50 categories de services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {popularServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{service.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  Voir les artisans
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Voir tous les services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comment ca marche ?
            </h2>
            <p className="text-xl text-slate-600">
              Reservez un artisan en 3 etapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '1',
                title: 'Recherchez',
                description: 'Entrez le service recherche et votre localisation pour trouver les artisans disponibles.',
                icon: Search,
              },
              {
                step: '2',
                title: 'Comparez',
                description: 'Consultez les profils, les avis clients et les disponibilites pour faire votre choix.',
                icon: Star,
              },
              {
                step: '3',
                title: 'Reservez',
                description: 'Selectionnez un creneau et confirmez votre reservation en quelques clics.',
                icon: CheckCircle,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-1/2" />
                )}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/recherche"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
            >
              Trouver un artisan
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-slate-300">
              Plus de 500 000 clients satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-5 h-5 ${j < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
                <p className="text-lg text-slate-200 mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.city}</div>
                  </div>
                  <span className="text-sm text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                    {testimonial.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Artisans dans les grandes villes
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {popularCities.map((city) => (
              <Link
                key={city.slug}
                href={`/recherche?location=${city.slug}`}
                className="px-6 py-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-slate-700 font-medium transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Vous etes artisan ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez notre reseau de plus de 120 000 artisans et developpez votre activite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inscription-artisan"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-xl"
            >
              Inscrire mon entreprise
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tarifs-artisans"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
