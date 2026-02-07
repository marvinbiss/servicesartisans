import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'ServicesArtisans - Trouvez les meilleurs artisans pres de chez vous',
  description:
    'Trouvez et comparez les meilleurs artisans de votre region. Plombiers, electriciens, menuisiers et plus. Devis gratuits.',
  alternates: { canonical: 'https://servicesartisans.fr' },
  openGraph: {
    title: 'ServicesArtisans - Trouvez les meilleurs artisans pres de chez vous',
    description:
      'Trouvez et comparez les meilleurs artisans de votre region. Devis gratuits.',
    type: 'website',
    url: 'https://servicesartisans.fr',
  },
}

const trades = [
  { name: 'Plombier', slug: 'plombier' },
  { name: 'Electricien', slug: 'electricien' },
  { name: 'Serrurier', slug: 'serrurier' },
  { name: 'Chauffagiste', slug: 'chauffagiste' },
  { name: 'Peintre en batiment', slug: 'peintre-en-batiment' },
  { name: 'Menuisier', slug: 'menuisier' },
  { name: 'Carreleur', slug: 'carreleur' },
  { name: 'Macon', slug: 'macon' },
  { name: 'Couvreur', slug: 'couvreur' },
  { name: 'Jardinier', slug: 'jardinier' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={[getOrganizationSchema(), getWebsiteSchema()]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Trouvez les meilleurs artisans pres de chez vous
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Comparez les avis, les tarifs et obtenez des devis gratuits
            aupres d&apos;artisans verifies.
          </p>
          <Link
            href="/services"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Voir tous les services
          </Link>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Nos services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trades.map((trade) => (
              <Link
                key={trade.slug}
                href={`/services/${trade.slug}`}
                className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors text-center"
              >
                {trade.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">
            Comment ca marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Recherchez', desc: 'Choisissez un service et votre ville.' },
              { step: '2', title: 'Comparez', desc: 'Consultez les profils et les avis.' },
              { step: '3', title: 'Contactez', desc: 'Demandez un devis gratuit.' },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA artisan */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Vous etes artisan ?
          </h2>
          <p className="text-blue-100 mb-8">
            Rejoignez notre reseau et developpez votre activite.
          </p>
          <Link
            href="/inscription-artisan"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Inscrire mon entreprise
          </Link>
        </div>
      </section>
    </div>
  )
}
