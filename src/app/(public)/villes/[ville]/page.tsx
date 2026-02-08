import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, Building, ArrowRight, Shield, Star, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_URL } from '@/lib/seo/config'
import { villes, getVilleBySlug, services } from '@/lib/data/france'
import { PopularServicesLinks } from '@/components/InternalLinks'

export function generateStaticParams() {
  return villes.map((ville) => ({ ville: ville.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ ville: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) return { title: 'Ville non trouvée' }

  return {
    title: `Artisans à ${ville.name} (${ville.departementCode}) - Devis gratuit | ServicesArtisans`,
    description: `Trouvez les meilleurs artisans à ${ville.name} (${ville.departementCode}). Plombiers, électriciens, serruriers et plus. Devis gratuit, artisans vérifiés.`,
    alternates: { canonical: `${SITE_URL}/villes/${villeSlug}` },
  }
}

export default async function VillePage({ params }: PageProps) {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Villes', href: '/villes' }, { label: ville.name }]} />
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Artisans à {ville.name}</h1>
          <p className="text-xl text-blue-100 max-w-3xl">{ville.description}</p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-blue-100">
            <div className="flex items-center gap-2"><MapPin className="w-5 h-5" /><span>{ville.region}</span></div>
            <div className="flex items-center gap-2"><Building className="w-5 h-5" /><span>{ville.departement}</span></div>
            <div className="flex items-center gap-2"><Users className="w-5 h-5" /><span>{ville.population} habitants</span></div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trouver un artisan à {ville.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.slice(0, 10).map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}/${villeSlug}`} className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all group border border-gray-100">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1">à {ville.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {ville.quartiers && ville.quartiers.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quartiers desservis à {ville.name}</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap gap-2">
                {ville.quartiers.map((quartier) => (
                  <span key={quartier} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">{quartier}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-blue-600 rounded-2xl p-8 text-center text-white mb-16">
          <h2 className="text-2xl font-bold mb-4">Besoin d&apos;un artisan à {ville.name} ?</h2>
          <p className="text-blue-100 mb-6">Décrivez votre projet et recevez des devis gratuits d&apos;artisans qualifiés.</p>
          <Link href="/services" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Voir les services <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Voir aussi</h2>
          <PopularServicesLinks showTitle={false} limit={8} />
        </section>
      </div>
    </div>
  )
}
