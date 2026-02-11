import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Shield, Star, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { HeroSearch } from '@/components/search/HeroSearch'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, regions } from '@/lib/data/france'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

export const metadata: Metadata = {
  title: 'Rechercher un artisan — Trouvez le bon professionnel | ServicesArtisans',
  description: 'Recherchez un artisan qualifié près de chez vous. Comparez les avis, les tarifs et obtenez des devis gratuits. 350 000+ artisans référencés dans toute la France.',
  alternates: { canonical: `${SITE_URL}/recherche` },
}

export default function RecherchePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Rechercher un artisan' }]} />
        </div>
      </div>

      {/* Hero Search */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Rechercher un artisan
          </h1>
          <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto">
            Trouvez le professionnel idéal pour votre projet. Comparez les avis, les tarifs et demandez des devis gratuits.
          </p>
          <HeroSearch />
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/80">Artisans référencés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/80">Avis authentiques</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Clock className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-white/80">Devis sous 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Service */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Parcourir par service</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 text-center transition-all group"
              >
                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{service.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by City */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Rechercher par ville</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {villes.slice(0, 24).map((ville) => (
              <Link
                key={ville.slug}
                href={`/villes/${ville.slug}`}
                className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">{ville.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/villes" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
              Voir toutes les villes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Region */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Rechercher par région</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all group"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{region.name}</div>
                <div className="text-sm text-gray-500 mt-1">{region.departments.length} départements</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Besoin d&apos;un artisan rapidement ?</h2>
          <p className="text-xl text-blue-100 mb-8">Décrivez votre projet et recevez jusqu&apos;à 3 devis gratuits d&apos;artisans qualifiés.</p>
          <Link href="/services" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Voir les services <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* SEO Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <PopularServicesLinks showTitle={true} limit={8} />
            <PopularCitiesLinks showTitle={true} limit={8} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Pages utiles</h3>
              <div className="space-y-2">
                <Link href="/comment-ca-marche" className="block text-sm text-gray-600 hover:text-blue-600 py-1 transition-colors">Comment ça marche</Link>
                <Link href="/tarifs-artisans" className="block text-sm text-gray-600 hover:text-blue-600 py-1 transition-colors">Tarifs des artisans</Link>
                <Link href="/urgence" className="block text-sm text-gray-600 hover:text-blue-600 py-1 transition-colors">Urgence 24h/24</Link>
                <Link href="/faq" className="block text-sm text-gray-600 hover:text-blue-600 py-1 transition-colors">Questions fréquentes</Link>
                <Link href="/blog" className="block text-sm text-gray-600 hover:text-blue-600 py-1 transition-colors">Blog</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
