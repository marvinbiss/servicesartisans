import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Scale,
  Flame,
  DoorOpen,
  PaintBucket,
  TreePine,
  Building2,
  ShieldCheck,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import RelatedHubs from '@/components/seo/RelatedHubs'
import dynamic from 'next/dynamic'

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})
import { comparisons } from '@/lib/data/comparisons'

export const revalidate = false

export const metadata: Metadata = {
  title: 'Comparatifs Travaux 2026 : 30 Guides',
  description:
    '30 comparatifs détaillés pour vos travaux : pompe à chaleur, isolation, menuiserie, revêtements. Prix 2026, avantages et verdict pour chaque solution.',
  alternates: getAlternates('/comparaison'),
  openGraph: {
    title: 'Comparatifs Travaux 2026 : 30 Guides pour Bien Choisir',
    description:
      '30 comparatifs détaillés pour vos travaux : pompe à chaleur, isolation, menuiserie, revêtements. Prix 2026, avantages et verdict.',
    url: `${SITE_URL}/comparaison`,
    type: 'website',
  },
}

const categories = [
  {
    name: 'Chauffage / Énergie',
    icon: Flame,
    color: 'bg-orange-100 text-orange-700',
    iconBg: 'bg-orange-50',
  },
  {
    name: 'Menuiserie',
    icon: DoorOpen,
    color: 'bg-amber-100 text-amber-700',
    iconBg: 'bg-amber-50',
  },
  {
    name: 'Revêtements',
    icon: PaintBucket,
    color: 'bg-violet-100 text-violet-700',
    iconBg: 'bg-violet-50',
  },
  {
    name: 'Extérieur',
    icon: TreePine,
    color: 'bg-green-100 text-green-700',
    iconBg: 'bg-green-50',
  },
  {
    name: 'Structure',
    icon: Building2,
    color: 'bg-primary-100 text-primary-600',
    iconBg: 'bg-primary-50',
  },
  {
    name: 'Isolation',
    icon: ShieldCheck,
    color: 'bg-cyan-100 text-cyan-700',
    iconBg: 'bg-cyan-50',
  },
]

export default function ComparaisonPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Comparatifs', url: '/comparaison' },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <div className="min-h-screen bg-sand-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={[{ label: 'Comparatifs' }]} />
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-b from-primary-50 to-sand-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-primary-500" />
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal-900 font-heading">
                Comparatifs Travaux
              </h1>
            </div>
            <p className="text-lg text-charcoal-600 max-w-2xl">
              {
                "30 comparatifs détaillés pour vous aider à choisir la solution adaptée à vos travaux. Prix 2026, avantages, inconvénients et verdict d'experts."
              }
            </p>
            <div className="mt-6">
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                Comparer les artisans
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Comparisons by category */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {categories.map((category) => {
            const categoryComparisons = comparisons.filter((c) => c.category === category.name)
            if (categoryComparisons.length === 0) return null
            const Icon = category.icon

            return (
              <section key={category.name} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.iconBg}`}
                  >
                    <Icon className="w-5 h-5 text-charcoal-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-charcoal-900">{category.name}</h2>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${category.color}`}
                  >
                    {categoryComparisons.length} comparatif
                    {categoryComparisons.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {categoryComparisons.map((comparison) => (
                    <Link
                      key={comparison.slug}
                      href={`/comparaison/${comparison.slug}`}
                      className="group bg-white rounded-xl border border-sand-300 p-6 hover:shadow-lg hover:border-primary-200 transition-all"
                    >
                      <h3 className="text-lg font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-2">
                        {comparison.title}
                      </h3>
                      <p className="text-charcoal-600 text-sm mb-3 line-clamp-2">
                        {comparison.metaDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-charcoal-500">
                          {comparison.options.length} options comparées
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 group-hover:gap-2 transition-all">
                          Voir le comparatif <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* CTA */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              {"Besoin d'un artisan pour vos travaux ?"}
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              {
                'Trouvez des professionnels qualifiés près de chez vous et demandez un devis gratuit.'
              }
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-3.5 rounded-xl font-bold hover:bg-primary-50 transition-colors"
            >
              Obtenir mon devis gratuit
            </Link>
          </div>
        </div>
      </div>

      <RelatedHubs currentPath="/comparaison" />

      {/* Conversion — Sticky mobile CTA + Exit intent (desktop) */}
      <StickyMobileCTA ctaText="Demander un devis gratuit" />
      <ExitIntentPopup />
    </>
  )
}
