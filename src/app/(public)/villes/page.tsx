import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_URL } from '@/lib/seo/config'
import { villes } from '@/lib/data/france'

export const metadata: Metadata = {
  title: 'Artisans par ville - Trouvez un professionnel près de chez vous',
  description: 'Trouvez les meilleurs artisans dans votre ville. Plus de 140 villes couvertes en France. Plombiers, électriciens, serruriers et plus. Devis gratuits.',
  alternates: { canonical: `${SITE_URL}/villes` },
}

// Group villes by region
const villesByRegion = villes.reduce((acc, ville) => {
  if (!acc[ville.region]) acc[ville.region] = []
  acc[ville.region].push(ville)
  return acc
}, {} as Record<string, typeof villes>)

export default function VillesIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Villes' }]} />
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Artisans par ville</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Trouvez un artisan qualifié dans votre ville. Plus de 140 villes couvertes dans toute la France.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.entries(villesByRegion).map(([region, regionVilles]) => (
          <section key={region} className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{region}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {regionVilles.map((ville) => (
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
          </section>
        ))}

        <section className="bg-blue-600 rounded-2xl p-8 text-center text-white mt-8">
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
