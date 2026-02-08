import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_URL } from '@/lib/seo/config'
import { departements } from '@/lib/data/france'

export const metadata: Metadata = {
  title: 'Artisans par département - Trouvez un professionnel | ServicesArtisans',
  description: 'Trouvez les meilleurs artisans dans votre département. 96 départements couverts. Plombiers, électriciens, serruriers et plus. Devis gratuits.',
  alternates: { canonical: `${SITE_URL}/departements` },
}

const deptsByRegion = departements.reduce((acc, dept) => {
  if (!acc[dept.region]) acc[dept.region] = []
  acc[dept.region].push(dept)
  return acc
}, {} as Record<string, typeof departements>)

export default function DepartementsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Départements' }]} />
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Artisans par département</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Trouvez un artisan qualifié dans votre département. 96 départements couverts dans toute la France.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.entries(deptsByRegion).map(([region, regionDepts]) => (
          <section key={region} className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{region}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {regionDepts.map((dept) => (
                <Link
                  key={dept.slug}
                  href={`/departements/${dept.slug}`}
                  className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {dept.code}
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">{dept.name}</span>
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
