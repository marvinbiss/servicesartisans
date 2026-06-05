import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getFAQSchema } from '@/lib/seo/jsonld'
import { calendrierTravaux } from '@/lib/data/calendrier-travaux'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Snowflake,
  Flower2,
  Sun,
  Leaf,
} from 'lucide-react'
import RelatedHubs from '@/components/seo/RelatedHubs'

const PAGE_URL = `${SITE_URL}/calendrier-travaux`

export const metadata: Metadata = {
  title: 'Calendrier Travaux 2026 : Mois par Mois',
  description:
    'Calendrier saisonnier des travaux : quels travaux faire chaque mois, lesquels éviter. Conseils pratiques pour planifier.',
  alternates: getAlternates('/calendrier-travaux'),
  openGraph: {
    title: 'Calendrier des travaux : quand faire quoi ?',
    description:
      'Guide mois par mois pour planifier vos travaux au bon moment. Travaux recommandés, à éviter et conseils saisonniers.',
    url: PAGE_URL,
    type: 'website',
    siteName: SITE_NAME,
  },
}

export const revalidate = false

const breadcrumbItems = [{ label: 'Calendrier des travaux' }]

const seasonInfo: Record<
  string,
  { icon: typeof Sun; bgClass: string; textClass: string; label: string; months: string[] }
> = {
  hiver: {
    icon: Snowflake,
    bgClass: 'bg-sand-200',
    textClass: 'text-charcoal-600',
    label: 'Hiver',
    months: ['Janvier', 'Février', 'Décembre'],
  },
  printemps: {
    icon: Flower2,
    bgClass: 'bg-green-100',
    textClass: 'text-green-600',
    label: 'Printemps',
    months: ['Mars', 'Avril', 'Mai'],
  },
  ete: {
    icon: Sun,
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-600',
    label: 'Été',
    months: ['Juin', 'Juillet', 'Août'],
  },
  automne: {
    icon: Leaf,
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-600',
    label: 'Automne',
    months: ['Septembre', 'Octobre', 'Novembre'],
  },
}

const monthOrder = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export default function CalendrierTravauxPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Calendrier des travaux' },
    ],
  }

  const faqSchema = getFAQSchema([
    {
      question: 'Quel est le meilleur mois pour faire ses travaux ?',
      answer:
        "Le printemps (mars-mai) et le début d'automne (septembre-octobre) sont les périodes idéales pour la plupart des travaux : températures douces, humidité maîtrisée, disponibilité des artisans raisonnable.",
    },
    {
      question: 'Quand refaire sa toiture ou son ravalement ?',
      answer:
        'Toiture et ravalement de façade se réalisent idéalement entre avril et octobre, avec une préférence pour mai-juin et septembre-octobre.',
    },
    {
      question: 'Quels travaux d’hiver privilégier ?',
      answer:
        "L'hiver (décembre-février) est parfait pour les travaux d'intérieur : peinture, pose de parquet, rénovation cuisine/salle de bain, plâtrerie, électricité, plomberie.",
    },
    {
      question: 'Combien de temps à l’avance faut-il contacter un artisan ?',
      answer:
        "Prévoyez 1 à 2 mois d'avance pour des travaux de 1-2 semaines, 3 à 6 mois pour une rénovation complète ou toiture.",
    },
  ])

  const sortedCalendrier = [...calendrierTravaux].sort(
    (a, b) => monthOrder.indexOf(a.mois) - monthOrder.indexOf(b.mois)
  )

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema]} />

      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            Guide saisonnier
          </div>
          <h1
            data-speakable="true"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-charcoal-900 mb-6 font-heading leading-tight"
          >
            {'Calendrier des travaux : quand faire quoi ?'}
          </h1>
          <p className="text-lg md:text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            Chaque saison a ses travaux. Ce guide synthétique vous aide à planifier au bon moment :
            travaux recommandés, à éviter et météo type pour chaque mois.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(seasonInfo).map(([key, info]) => {
              const Icon = info.icon
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-sand-200 p-4"
                >
                  <div
                    className={`w-10 h-10 ${info.bgClass} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${info.textClass}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal-900">{info.label}</div>
                    <div className="text-xs text-charcoal-500">{info.months.join(', ')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 font-heading">
            Calendrier mois par mois
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCalendrier.map((mois) => {
              const topRecommended = mois.travauxRecommandes.slice(0, 2)
              const topAvoid = mois.travauxAEviter.slice(0, 2)
              return (
                <article
                  key={mois.slug}
                  className="bg-white rounded-2xl border border-sand-200 p-5 shadow-sm"
                >
                  <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-3">
                    {mois.mois}
                  </h3>
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> À faire
                    </div>
                    <ul className="space-y-1">
                      {topRecommended.map((t, i) => (
                        <li key={i} className="text-sm text-charcoal-700">
                          <Link
                            href={`/services/${t.service}`}
                            className="hover:text-primary-500 hover:underline"
                          >
                            {t.titre}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-1.5">
                      <XCircle className="w-3.5 h-3.5" /> À éviter
                    </div>
                    <ul className="space-y-1">
                      {topAvoid.map((item, i) => (
                        <li key={i} className="text-sm text-charcoal-600">
                          {item.split('(')[0].trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              {'Prêt à lancer vos travaux ?'}
            </h2>
            <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
              Trouvez un artisan RGE certifié près de chez vous et demandez un devis gratuit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 bg-white text-amber-700 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                Trouver un artisan
              </Link>
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-amber-400 transition-colors border border-amber-400"
              >
                Obtenir mon devis gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <RelatedHubs currentPath="/calendrier-travaux" />
    </>
  )
}
