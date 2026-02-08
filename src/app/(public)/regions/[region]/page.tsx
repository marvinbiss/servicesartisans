import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, ArrowRight, Shield, Star, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_URL } from '@/lib/seo/config'
import { regions, getRegionBySlug } from '@/lib/data/france'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ region: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) return { title: 'Région non trouvée' }

  return {
    title: `Artisans en ${region.name} - Trouvez un professionnel | ServicesArtisans`,
    description: `Trouvez un artisan qualifié en ${region.name}. Plombiers, électriciens, serruriers et plus. Devis gratuits.`,
    alternates: { canonical: `${SITE_URL}/regions/${regionSlug}` },
  }
}

const quickServices = [
  { name: 'Plombier', slug: 'plombier' },
  { name: 'Électricien', slug: 'electricien' },
  { name: 'Serrurier', slug: 'serrurier' },
  { name: 'Chauffagiste', slug: 'chauffagiste' },
  { name: 'Peintre', slug: 'peintre-en-batiment' },
  { name: 'Couvreur', slug: 'couvreur' },
]

export default async function RegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Régions', href: '/regions' }, { label: region.name }]} />
        </div>
      </div>

      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"><MapPin className="w-8 h-8" /></div>
            <h1 className="text-4xl font-bold">{region.name}</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl">{region.description}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full"><Shield className="w-4 h-4" /><span className="text-sm font-medium">Artisans vérifiés</span></div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full"><Star className="w-4 h-4" /><span className="text-sm font-medium">Avis authentiques</span></div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full"><Clock className="w-4 h-4" /><span className="text-sm font-medium">Devis sous 24h</span></div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full"><Users className="w-4 h-4" /><span className="text-sm font-medium">{region.departments.length} départements</span></div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <span className="text-gray-600 font-medium py-2">Recherche rapide :</span>
            {quickServices.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`} className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors">
                {service.name} en {region.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Départements de la région {region.name}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {region.departments.map((dept) => (
              <Link key={dept.code} href={`/departements/${dept.slug}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{dept.name}</h3>
                    <span className="text-sm text-gray-500">Département {dept.code}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {dept.cities.slice(0, 3).map((city) => (
                    <span key={city.slug} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{city.name}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Besoin d&apos;un artisan en {region.name} ?</h2>
          <p className="text-xl text-blue-100 mb-8">Recevez jusqu&apos;à 3 devis gratuits de professionnels qualifiés</p>
          <Link href="/services" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Voir les services <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PopularServicesLinks showTitle={true} limit={6} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Autres régions</h3>
              <div className="space-y-2">
                {regions.filter(r => r.slug !== regionSlug).slice(0, 5).map((r) => (
                  <Link key={r.slug} href={`/regions/${r.slug}`} className="block text-gray-600 hover:text-blue-600 text-sm py-1 transition-colors">
                    Artisans en {r.name}
                  </Link>
                ))}
              </div>
              <Link href="/regions" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Toutes les régions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <PopularCitiesLinks showTitle={true} limit={6} />
          </div>
        </div>
      </section>
    </div>
  )
}
