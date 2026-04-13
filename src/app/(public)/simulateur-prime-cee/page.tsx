import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import CeeCTA from '@/components/cee/CeeCTA'
import CeeSimulator from '@/components/cee/CeeSimulator'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { services } from '@/lib/data/france-light'

export const revalidate = 86400

const PAGE_PATH = '/simulateur-prime-cee'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: 'Simulateur Prime CEE Gratuit \u2014 Estimez votre Aide \u00c9nergie | ServicesArtisans',
  description:
    'Calculez gratuitement le montant de votre prime CEE (Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie). Estimation instantan\u00e9e par type de travaux et code postal.',
  alternates: getAlternates('/simulateur-prime-cee'),
  openGraph: {
    locale: 'fr_FR',
    title: 'Simulateur Prime CEE Gratuit \u2014 Estimez votre Aide \u00c9nergie | ServicesArtisans',
    description:
      'Calculez gratuitement le montant de votre prime CEE (Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie). Estimation instantan\u00e9e par type de travaux et code postal.',
    url: PAGE_URL,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulateur Prime CEE Gratuit \u2014 Estimez votre Aide \u00c9nergie | ServicesArtisans',
    description:
      'Calculez gratuitement le montant de votre prime CEE (Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie). Estimation instantan\u00e9e par type de travaux et code postal.',
  },
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Qu\u2019est-ce que la prime CEE\u00a0?',
    answer:
      'La prime CEE (Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie) est une aide financi\u00e8re vers\u00e9e par les fournisseurs d\u2019\u00e9nergie pour encourager les travaux de r\u00e9novation \u00e9nerg\u00e9tique. Cr\u00e9\u00e9 par la loi POPE de 2005, ce dispositif oblige les vendeurs d\u2019\u00e9nergie (EDF, Engie, TotalEnergies\u2026) \u00e0 financer des \u00e9conomies d\u2019\u00e9nergie chez les particuliers et les entreprises.',
  },
  {
    question: 'Comment est calcul\u00e9 le montant de la prime CEE\u00a0?',
    answer:
      'Le montant d\u00e9pend de plusieurs crit\u00e8res : le type de travaux (fiche d\u2019op\u00e9ration standardis\u00e9e), votre zone climatique (H1, H2 ou H3), la surface ou la puissance concern\u00e9e, et vos revenus fiscaux (bar\u00e8me classique ou pr\u00e9carit\u00e9 \u00e9nerg\u00e9tique). Le cours du kWhc au moment de la signature du devis influence \u00e9galement le montant final.',
  },
  {
    question: 'Qui peut b\u00e9n\u00e9ficier de la prime CEE\u00a0?',
    answer:
      'Tous les m\u00e9nages fran\u00e7ais peuvent b\u00e9n\u00e9ficier de la prime CEE, sans condition de revenus pour le bar\u00e8me classique. Les m\u00e9nages aux revenus modestes (selon les seuils de l\u2019Anah) acc\u00e8dent au bar\u00e8me pr\u00e9carit\u00e9 \u00e9nerg\u00e9tique, avec des primes environ deux fois sup\u00e9rieures. Le logement doit avoir plus de 2 ans et les travaux doivent \u00eatre r\u00e9alis\u00e9s par un artisan RGE.',
  },
  {
    question: 'Quels travaux sont \u00e9ligibles aux CEE\u00a0?',
    answer:
      'Les principales cat\u00e9gories de travaux \u00e9ligibles sont : l\u2019isolation (combles, murs, planchers, fen\u00eatres), le chauffage (pompe \u00e0 chaleur, chaudi\u00e8re biomasse, po\u00eale \u00e0 bois), la ventilation (VMC double flux), la r\u00e9gulation (thermostat programmable) et la production d\u2019eau chaude sanitaire (chauffe-eau thermodynamique ou solaire). Chaque op\u00e9ration est d\u00e9finie par une fiche standardis\u00e9e du minist\u00e8re.',
  },
  {
    question: 'La prime CEE est-elle cumulable avec MaPrimeR\u00e9nov\u2019\u00a0?',
    answer:
      'Oui, la prime CEE est cumulable avec MaPrimeR\u00e9nov\u2019, la TVA r\u00e9duite \u00e0 5,5\u00a0% et l\u2019\u00e9co-pr\u00eat \u00e0 taux z\u00e9ro (jusqu\u2019\u00e0 50\u00a0000\u00a0\u20ac). La seule limite est que le total des aides ne doit pas d\u00e9passer 100\u00a0% du co\u00fbt TTC des travaux. Pour en profiter, l\u2019artisan doit \u00eatre certifi\u00e9 RGE \u00e0 la date de signature du devis.',
  },
]

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default function SimulateurPrimeCeePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'CEE', url: '/cee' },
    { name: 'Simulateur prime CEE', url: PAGE_PATH },
  ])

  const faqSchema = getFAQSchema(FAQ)

  // Projection minimale pour le client component
  const serviceOptions = services.map((s) => ({ slug: s.slug, name: s.name }))

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'CEE', href: '/cee' },
          { label: 'Simulateur prime CEE' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-charcoal-900 leading-tight mb-4">
            Simulateur de prime CEE
          </h1>
          <p className="text-lg md:text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
            Estimez gratuitement le montant de votre prime Certificats d’Économies d’Énergie en 30
            secondes
          </p>
        </div>
      </section>

      {/* Formulaire (Client Component) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <CeeSimulator services={serviceOptions} />
      </section>

      {/* FAQ */}
      <section className="bg-sand-50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-8 text-center">
            Questions fr\u00e9quentes sur la prime CEE
          </h2>
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-sand-200 bg-white shadow-soft"
              >
                <summary className="cursor-pointer select-none px-6 py-4 font-heading font-semibold text-charcoal-900 hover:text-emerald-700 transition-colors">
                  {item.question}
                </summary>
                <div className="px-6 pb-5 text-sm text-charcoal-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bas de page */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <CeeCTA variant="inline" />
      </section>
    </>
  )
}
