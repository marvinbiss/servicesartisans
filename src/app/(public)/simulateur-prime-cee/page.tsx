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
  title: 'Simulateur Prime CEE Gratuit — Estimez votre Aide Énergie | ServicesArtisans',
  description:
    'Calculez gratuitement le montant de votre prime CEE (Certificats d’\u00c9conomies d’\u00c9nergie). Estimation instantanée par type de travaux et code postal.',
  alternates: getAlternates('/simulateur-prime-cee'),
  openGraph: {
    locale: 'fr_FR',
    title: 'Simulateur Prime CEE Gratuit — Estimez votre Aide Énergie | ServicesArtisans',
    description:
      'Calculez gratuitement le montant de votre prime CEE (Certificats d’\u00c9conomies d’\u00c9nergie). Estimation instantanée par type de travaux et code postal.',
    url: PAGE_URL,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulateur Prime CEE Gratuit — Estimez votre Aide Énergie | ServicesArtisans',
    description:
      'Calculez gratuitement le montant de votre prime CEE (Certificats d’\u00c9conomies d’\u00c9nergie). Estimation instantanée par type de travaux et code postal.',
  },
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Qu’est-ce que la prime CEE\u00a0?',
    answer:
      'La prime CEE (Certificats d’\u00c9conomies d’\u00c9nergie) est une aide financière versée par les fournisseurs d’\u00e9nergie pour encourager les travaux de rénovation énergétique. Cré\u00e9 par la loi POPE de 2005, ce dispositif oblige les vendeurs d’\u00e9nergie (EDF, Engie, TotalEnergies…) à financer des économies d’\u00e9nergie chez les particuliers et les entreprises.',
  },
  {
    question: 'Comment est calculé le montant de la prime CEE\u00a0?',
    answer:
      'Le montant dépend de plusieurs critères : le type de travaux (fiche d’opération standardisée), votre zone climatique (H1, H2 ou H3), la surface ou la puissance concernée, et vos revenus fiscaux (barème classique ou précarité énergétique). Le cours du kWhc au moment de la signature du devis influence également le montant final.',
  },
  {
    question: 'Qui peut bénéficier de la prime CEE\u00a0?',
    answer:
      'Tous les ménages français peuvent bénéficier de la prime CEE, sans condition de revenus pour le barème classique. Les ménages aux revenus modestes (selon les seuils de l’Anah) accèdent au barème précarité énergétique, avec des primes environ deux fois supérieures. Le logement doit avoir plus de 2 ans et les travaux doivent être réalisés par un artisan RGE.',
  },
  {
    question: 'Quels travaux sont éligibles aux CEE\u00a0?',
    answer:
      'Les principales catégories de travaux éligibles sont : l’isolation (combles, murs, planchers, fenêtres), le chauffage (pompe à chaleur, chaudière biomasse, poêle à bois), la ventilation (VMC double flux), la régulation (thermostat programmable) et la production d’eau chaude sanitaire (chauffe-eau thermodynamique ou solaire). Chaque opération est définie par une fiche standardisée du ministère.',
  },
  {
    question: 'La prime CEE est-elle cumulable avec MaPrimeRénov’\u00a0?',
    answer:
      'Oui, la prime CEE est cumulable avec MaPrimeRénov’, la TVA réduite à 5,5\u00a0% et l’\u00e9co-prêt à taux zéro (jusqu’\u00e0 50\u00a0000\u00a0\u20ac). La seule limite est que le total des aides ne doit pas dépasser 100\u00a0% du coût TTC des travaux. Pour en profiter, l’artisan doit être certifié RGE à la date de signature du devis.',
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
            Questions fréquentes sur la prime CEE
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
