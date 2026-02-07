import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ChevronRight, ArrowRight, Users, Building, Shield, Star, Clock, Wrench, Zap, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous, Square, Wind, Blocks } from 'lucide-react'
import { departements, getDepartementBySlug, getVillesByDepartement, services } from '@/lib/data/france'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous, Square, Wind, Blocks
}

export function generateStaticParams() {
  return departements.map((dept) => ({
    departement: dept.slug,
  }))
}

interface PageProps {
  params: Promise<{ departement: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)

  if (!dept) {
    return { title: 'Département non trouvé | ServicesArtisans' }
  }

  return {
    title: `Artisans en ${dept.name} (${dept.code}) - Plombier, Électricien, Serrurier | ServicesArtisans`,
    description: `Trouvez les meilleurs artisans dans le ${dept.name} (${dept.code}). ${dept.description} Plombiers, électriciens, serruriers et plus. Devis gratuits sous 24h.`,
    alternates: {
      canonical: `https://servicesartisans.fr/departements/${deptSlug}`,
    },
    openGraph: {
      title: `Artisans en ${dept.name} | ServicesArtisans`,
      description: dept.description,
    },
  }
}

export const revalidate = 86400

export default async function DepartementPage({ params }: PageProps) {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)

  if (!dept) notFound()

  const villesDuDepartement = getVillesByDepartement(dept.code)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Accueil</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/departements" className="text-gray-500 hover:text-gray-700">Départements</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{dept.name} ({dept.code})</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {dept.code}
            </div>
            <div>
              <h1 className="text-4xl font-bold">Artisans en {dept.name}</h1>
              <p className="text-blue-200 text-lg mt-1">{dept.region}</p>
            </div>
          </div>

          <p className="text-xl text-blue-100 max-w-3xl mt-4">{dept.description}</p>

          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              <span>Chef-lieu : {dept.chefLieu}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{dept.population} habitants</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Artisans vérifiés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Avis clients authentiques</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Devis sous 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trouver un artisan dans le {dept.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {services.slice(0, 12).map((service) => {
              const IconComponent = iconMap[service.icon] || Wrench
              const citySlug = villesDuDepartement[0]?.slug || dept.chefLieu.toLowerCase().replace(/\s+/g, '-')
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}/${citySlug}`}
                  className="bg-white hover:bg-blue-50 rounded-xl p-4 text-center transition-all duration-300 group border border-gray-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 block">
                    {service.name}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">dans le {dept.code}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Villes */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Principales villes du {dept.name}
          </h2>

          {villesDuDepartement.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {villesDuDepartement.map((ville) => (
                <Link
                  key={ville.slug}
                  href={`/villes/${ville.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {ville.name}
                      </div>
                      <div className="text-sm text-gray-500">{ville.population} hab.</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dept.villes.map((villeName) => (
                <div key={villeName} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="font-medium text-gray-900">{villeName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Autres départements de la région */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Autres départements en {dept.region}
          </h2>
          <div className="flex flex-wrap gap-3">
            {departements
              .filter(d => d.region === dept.region && d.slug !== dept.slug)
              .slice(0, 8)
              .map((d) => (
                <Link
                  key={d.slug}
                  href={`/departements/${d.slug}`}
                  className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  {d.name} ({d.code})
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d&apos;un artisan dans le {dept.name} ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Décrivez votre projet et recevez jusqu&apos;à 5 devis gratuits d&apos;artisans qualifiés près de chez vous.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
