import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight, Users } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_URL } from '@/lib/seo/config'
import { regions } from '@/lib/data/france'

export const metadata: Metadata = {
  title: 'Artisans par région - Trouvez un professionnel | ServicesArtisans',
  description: 'Trouvez les meilleurs artisans dans votre région. 18 régions couvertes en France métropolitaine et outre-mer. Devis gratuits.',
  alternates: { canonical: `${SITE_URL}/regions` },
}

export default function RegionsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Régions' }]} />
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Artisans par région</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Explorez les artisans qualifiés dans toutes les régions de France.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <Link
              key={region.slug}
              href={`/regions/${region.slug}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{region.name}</h2>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{region.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{region.departments.length} départements</span></div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{region.departments.reduce((acc, d) => acc + d.cities.length, 0)} villes</span></div>
              </div>
            </Link>
          ))}
        </div>

        <section className="bg-blue-600 rounded-2xl p-8 text-center text-white mt-12">
          <h2 className="text-2xl font-bold mb-4">Besoin d&apos;un artisan ?</h2>
          <p className="text-blue-100 mb-6">Décrivez votre projet et recevez des devis gratuits.</p>
          <Link href="/services" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Voir les services <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  )
}
