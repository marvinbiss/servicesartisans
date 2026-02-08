import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Building, Users, ArrowRight, Shield, Star, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_URL } from '@/lib/seo/config'
import { departements, getDepartementBySlug, getVillesByDepartement, services } from '@/lib/data/france'
import { slugify } from '@/lib/utils'
import { PopularServicesLinks } from '@/components/InternalLinks'

export function generateStaticParams() {
  return departements.map((dept) => ({ departement: dept.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ departement: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return { title: 'Département non trouvé' }

  return {
    title: `Artisans en ${dept.name} (${dept.code}) - Devis gratuit | ServicesArtisans`,
    description: `Trouvez les meilleurs artisans dans le ${dept.name} (${dept.code}). ${dept.description} Plombiers, électriciens, serruriers et plus.`,
    alternates: { canonical: `${SITE_URL}/departements/${deptSlug}` },
  }
}

export default async function DepartementPage({ params }: PageProps) {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) notFound()

  const villesDuDepartement = getVillesByDepartement(dept.code)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Départements', href: '/departements' }, { label: `${dept.name} (${dept.code})` }]} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">{dept.code}</div>
            <div>
              <h1 className="text-4xl font-bold">Artisans en {dept.name}</h1>
              <p className="text-blue-200 text-lg mt-1">{dept.region}</p>
            </div>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mt-4">{dept.description}</p>
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2"><Building className="w-5 h-5" /><span>Chef-lieu : {dept.chefLieu}</span></div>
            <div className="flex items-center gap-2"><Users className="w-5 h-5" /><span>{dept.population} habitants</span></div>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full"><Shield className="w-4 h-4" /><span className="text-sm font-medium">Artisans vérifiés</span></div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full"><Star className="w-4 h-4" /><span className="text-sm font-medium">Avis authentiques</span></div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full"><Clock className="w-4 h-4" /><span className="text-sm font-medium">Devis sous 24h</span></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trouver un artisan dans le {dept.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.slice(0, 10).map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}/${villesDuDepartement[0]?.slug || slugify(dept.chefLieu)}`} className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all group border border-gray-100">
                <span className="font-medium text-gray-900 group-hover:text-blue-600 block">{service.name}</span>
                <span className="block text-xs text-gray-500 mt-1">dans le {dept.code}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Principales villes du {dept.name}</h2>
          {villesDuDepartement.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {villesDuDepartement.map((ville) => (
                <Link key={ville.slug} href={`/villes/${ville.slug}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{ville.name}</div>
                      <div className="text-sm text-gray-500">{ville.population} hab.</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dept.villes.map((villeName) => (
                <span key={villeName} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700">{villeName}</span>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Autres départements en {dept.region}</h2>
          <div className="flex flex-wrap gap-3">
            {departements.filter(d => d.region === dept.region && d.slug !== dept.slug).slice(0, 8).map((d) => (
              <Link key={d.slug} href={`/departements/${d.slug}`} className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                {d.name} ({d.code})
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-blue-600 rounded-2xl p-8 text-center text-white mb-16">
          <h2 className="text-2xl font-bold mb-4">Besoin d&apos;un artisan dans le {dept.name} ?</h2>
          <p className="text-blue-100 mb-6">Décrivez votre projet et recevez des devis gratuits d&apos;artisans qualifiés.</p>
          <Link href="/services" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Voir les services <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section>
          <PopularServicesLinks showTitle={true} limit={8} />
        </section>
      </div>
    </div>
  )
}
