/**
 * /artisans-rge — hub racine annuaire artisans RGE par ville (RE-06).
 *
 * @kw-primary    artisan rge
 * @kw-volume     2000
 * @kw-kd         15
 * @kw-cpc        3.50
 * @cluster       RE-06 (hub artisans RGE)
 * @ahrefs-source docs/ahrefs-audit-2026-04/MASTER-PLAN-03-CONTENT.md:RE-06
 * @backlog-item  RE-06-hub-artisans-rge
 * @snapshot      2026-05-04 (Ahrefs renovation keywords)
 *
 * Hub ville-first : complète /rge (service-first). Cible les ~500 pages
 * /artisans-rge/[ville] existantes (sitemap rge-city) qui étaient orphelines
 * de hub — 8 liens internes pointaient vers ce 404 (audit 2026-06-05).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, MapPin, BadgeEuro, FileCheck2, ExternalLink, Wrench } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getItemListSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { villes } from '@/lib/data/france'
import { getRgeNationalStats } from '@/lib/rge/guide-stats'
import { buildFaqJsonLd, MAIN_RGE_SERVICES, type RgeFaqItem } from '@/lib/rge/pseo-content'

const ART_RGE_AUTHOR = authors['sophie-martin']
const ART_RGE_REVIEWER = getReviewerForAuthor(ART_RGE_AUTHOR)

// ISR — même cadence que /artisans-rge/[ville] (sync ADEME hebdo).
export const revalidate = 86400

const PAGE_PATH = '/artisans-rge'
const TOP_VILLES_COUNT = 60

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}${PAGE_PATH}`
  const title = 'Artisan RGE : annuaire des artisans certifiés par ville (2026)'
  const description =
    "Trouvez un artisan RGE certifié près de chez vous : pompe à chaleur, isolation, solaire. Éligible MaPrimeRénov', CEE, TVA 5,5 %. Données officielles ADEME."

  return {
    title,
    description,
    alternates: getAlternates(PAGE_PATH),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url,
      siteName: 'ServicesArtisans',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

const FAQ_ITEMS: RgeFaqItem[] = [
  {
    question: "Qu'est-ce qu'un artisan RGE ?",
    answer:
      "RGE signifie « Reconnu Garant de l'Environnement ». C'est une mention délivrée par des organismes accrédités (Qualibat, Qualit'EnR, Qualifelec…) aux entreprises qualifiées pour les travaux de rénovation énergétique. Faire appel à un artisan RGE est obligatoire pour bénéficier de MaPrimeRénov', des primes CEE, de l'Éco-PTZ et de la TVA à 5,5 %.",
  },
  {
    question: 'Comment vérifier la certification RGE d’un artisan ?',
    answer:
      'Chaque fiche artisan de cet annuaire affiche ses qualifications RGE en cours de validité, issues du registre officiel ADEME (data.gouv.fr), synchronisé chaque semaine. Vous pouvez aussi vérifier un SIRET directement sur notre outil de vérification ou sur france-renov.gouv.fr.',
  },
  {
    question: 'Quelles aides exigent un artisan RGE ?',
    answer:
      "MaPrimeRénov' (jusqu'à 11 000 € selon revenus et travaux), les primes CEE, l'Éco-PTZ (jusqu'à 50 000 € à taux zéro) et la TVA réduite à 5,5 % exigent tous que les travaux soient réalisés par une entreprise RGE du domaine concerné.",
  },
  {
    question: 'Le label RGE est-il une garantie de qualité ?',
    answer:
      "La mention RGE atteste d'une qualification technique vérifiée et d'audits de chantier périodiques. Elle ne remplace pas la comparaison de plusieurs devis ni la vérification des assurances (décennale). Croisez toujours qualification RGE, avis clients et devis détaillés.",
  },
]

export default async function ArtisansRgeHubPage() {
  const stats = await getRgeNationalStats()
  const topVilles = villes.slice(0, TOP_VILLES_COUNT)

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Artisans', href: '/artisans' },
    { label: 'Artisans RGE' },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans', url: '/artisans' },
    { name: 'Artisans RGE', url: PAGE_PATH },
  ])

  const collectionSchema = {
    ...getCollectionPageSchema({
      name: 'Artisans RGE certifiés — annuaire par ville',
      description:
        'Annuaire des artisans RGE certifiés en France, par ville. Qualifications vérifiées via le registre officiel ADEME (data.gouv.fr).',
      url: PAGE_PATH,
      itemCount: topVilles.length,
      parts: topVilles.slice(0, 20).map((v) => ({
        url: `${PAGE_PATH}/${v.slug}`,
        name: `Artisans RGE à ${v.name}`,
      })),
    }),
    ...(ART_RGE_AUTHOR && {
      author: {
        '@type': 'Person',
        name: ART_RGE_AUTHOR.name,
        jobTitle: ART_RGE_AUTHOR.role,
        url: `${SITE_URL}/equipe/${ART_RGE_AUTHOR.slug}`,
      },
    }),
    ...(ART_RGE_REVIEWER && { reviewedBy: getReviewedByPersonSchema(ART_RGE_REVIEWER) }),
  }

  const itemListSchema = getItemListSchema({
    name: 'Artisans RGE par ville',
    description: 'Top villes françaises par nombre d’artisans RGE certifiés.',
    url: PAGE_PATH,
    items: topVilles.slice(0, 20).map((v, i) => ({
      name: `Artisans RGE à ${v.name}`,
      url: `${PAGE_PATH}/${v.slug}`,
      position: i + 1,
    })),
  })

  const faqSchema = buildFaqJsonLd(FAQ_ITEMS)

  const totalLabel =
    stats.totalActive > 0 ? stats.totalActive.toLocaleString('fr-FR') : 'plus de 45 000'

  const tldrBullets = [
    `${totalLabel} artisans RGE actifs référencés en France, certifications vérifiées via le registre officiel ADEME.`,
    "Label RGE = condition obligatoire pour MaPrimeRénov', primes CEE, Éco-PTZ et TVA à 5,5 %.",
    'Annuaire par ville : pompe à chaleur, isolation, panneaux solaires, chauffage bois.',
    'Synchronisation hebdomadaire avec data.gouv.fr — seules les qualifications en cours de validité sont affichées.',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema,
          collectionSchema,
          itemListSchema as Record<string, unknown>,
          faqSchema as Record<string, unknown>,
        ]}
      />

      <div className="bg-gradient-to-b from-primary-50 to-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 text-accent-800 px-3 py-1 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Source : Registre RGE ADEME — data.gouv.fr
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900">
              Artisans RGE&nbsp;: trouvez un professionnel certifié près de chez vous
            </h1>
            <p className="mt-4 text-lg text-charcoal-600">
              {totalLabel} artisans certifiés «&nbsp;Reconnu Garant de l&apos;Environnement&nbsp;»
              référencés en France. Qualifications officielles ADEME, condition indispensable pour
              MaPrimeRénov&apos;, les primes CEE, l&apos;Éco-PTZ et la TVA à 5,5&nbsp;%.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <TldrBlock bullets={tldrBullets} />

        <EnBrefBox summary="Le label RGE conditionne l'accès à toutes les aides publiques de rénovation énergétique. Cet annuaire recense les artisans dont la certification est en cours de validité, par ville et par spécialité, à partir du registre officiel ADEME mis à jour chaque semaine." />

        {/* Top villes */}
        <section className="mt-10" aria-labelledby="villes-heading">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h2 id="villes-heading" className="text-2xl font-bold text-charcoal-900">
              Artisans RGE par ville
            </h2>
          </div>
          <p className="text-charcoal-600 mb-6">
            Sélectionnez votre ville pour consulter la liste des artisans RGE actifs, leurs
            qualifications (QualiPAC, Qualibat, QualiSol…) et les aides mobilisables localement.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {topVilles.map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/artisans-rge/${v.slug}`}
                  className="flex items-center gap-2 rounded-lg border border-sand-200 px-3 py-2.5 text-sm text-charcoal-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-sand-400 shrink-0" />
                  Artisans RGE à {v.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Spécialités */}
        <section className="mt-12" aria-labelledby="services-heading">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-primary-600" />
            <h2 id="services-heading" className="text-2xl font-bold text-charcoal-900">
              Artisans RGE par spécialité
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MAIN_RGE_SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/rge/${s.slug}`}
                className="rounded-xl border border-sand-200 p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="font-semibold text-charcoal-900">{s.label}</div>
                <div className="text-sm text-charcoal-500 mt-1">
                  Artisans RGE {s.label.toLowerCase()} par ville et département
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm text-charcoal-500">
            Voir aussi le{' '}
            <Link href="/rge" className="text-primary-600 underline underline-offset-2">
              hub RGE complet
            </Link>{' '}
            et le{' '}
            <Link href="/rge/glossaire" className="text-primary-600 underline underline-offset-2">
              glossaire RGE
            </Link>
            .
          </p>
        </section>

        {/* Pourquoi RGE */}
        <section className="mt-12" aria-labelledby="pourquoi-heading">
          <div className="flex items-center gap-2 mb-4">
            <BadgeEuro className="w-5 h-5 text-primary-600" />
            <h2 id="pourquoi-heading" className="text-2xl font-bold text-charcoal-900">
              Pourquoi choisir un artisan RGE&nbsp;?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "MaPrimeRénov'",
                desc: "Jusqu'à 11 000 € d'aide selon revenus et travaux — versée uniquement si l'entreprise est RGE du domaine concerné.",
              },
              {
                title: 'Primes CEE',
                desc: "Les certificats d'économies d'énergie (prime énergie) exigent une attestation RGE pour la quasi-totalité des travaux.",
              },
              {
                title: 'Éco-PTZ',
                desc: "Prêt à taux zéro jusqu'à 50 000 € pour financer la rénovation — conditionné à la qualification RGE.",
              },
              {
                title: 'TVA à 5,5 %',
                desc: 'Taux réduit sur les travaux de rénovation énergétique réalisés par un professionnel qualifié.',
              },
            ].map((b) => (
              <div key={b.title} className="rounded-xl border border-sand-200 p-5">
                <div className="font-semibold text-charcoal-900">{b.title}</div>
                <p className="text-sm text-charcoal-600 mt-1.5">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Calculer mes aides
            </Link>
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 rounded-lg border border-sand-300 px-4 py-2.5 text-sm font-semibold text-charcoal-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              Vérifier un artisan (SIRET)
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-charcoal-900 mb-6">
            Questions fréquentes sur les artisans RGE
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-sand-200 p-5 open:bg-sand-50"
              >
                <summary className="cursor-pointer font-semibold text-charcoal-900 list-none">
                  {item.question}
                </summary>
                <p className="mt-3 text-charcoal-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Sources */}
        <section className="mt-12 rounded-xl border border-sand-200 bg-sand-50 p-5 text-sm text-charcoal-600">
          <h2 className="font-semibold text-charcoal-900 mb-2">Sources officielles</h2>
          <ul className="space-y-1.5">
            <li>
              <a
                href="https://data.ademe.fr/datasets/liste-des-entreprises-rge-2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2"
              >
                Registre RGE ADEME — data.gouv.fr (Licence Etalab 2.0)
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://france-renov.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2"
              >
                France Rénov&apos; — service public de la rénovation de l&apos;habitat
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
          {ART_RGE_AUTHOR && (
            <p className="mt-3 text-xs text-charcoal-500">
              Rédigé par{' '}
              <Link
                href={`/equipe/${ART_RGE_AUTHOR.slug}`}
                className="underline underline-offset-2"
              >
                {ART_RGE_AUTHOR.name}
              </Link>
              {ART_RGE_REVIEWER && (
                <>
                  {' '}
                  — relu par{' '}
                  <Link
                    href={`/equipe/${ART_RGE_REVIEWER.slug}`}
                    className="underline underline-offset-2"
                  >
                    {ART_RGE_REVIEWER.name}
                  </Link>
                </>
              )}
              . Données synchronisées chaque semaine avec le registre ADEME.
            </p>
          )}
        </section>
      </div>
    </>
  )
}
