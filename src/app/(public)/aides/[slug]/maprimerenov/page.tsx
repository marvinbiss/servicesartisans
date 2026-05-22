import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  Calculator,
  FileCheck2,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Thermometer,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import RelatedAides from '@/components/aides/RelatedAides'
import { getCumulableAides } from '@/lib/aides/aides-catalog'
import {
  CLIMATE_ZONE_IMPACT,
  CLIMATE_ZONE_LABELS,
  deptToClimateZone,
} from '@/lib/aides/climate-zones'
import { getDepartementBySlug, departements } from '@/lib/data/france'
import { getDeptPreposition } from '@/lib/geo-strings'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getHowToSchema,
  getPlaceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

export const revalidate = 86400
export const dynamicParams = true
const CONTENT_UPDATED_AT = '2026-04-29'

// Sprint 3 territorial 2026-05-04 — pre-render TOUS les départements (96+).
// Avant : 20 dépts pré-rendus, 76 en cold-start ISR (TTFB >2s sur premier hit).
// Après : tous les dépts français (incluant outre-mer) pré-rendus au build.
// Cible audit STRATEGIE-RENOVATION-ENERGETIQUE.md ligne 238 : "96 pages
// /aides/[dept]/maprimerenov". On utilise `departements` source de vérité
// pour ne pas drift si la liste évolue (ajout/retrait dept).
export function generateStaticParams() {
  return departements.map((d) => ({ slug: d.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// default 46 char raw : +19 char brand suffix (root layout) = ≤ 65 char rendu.
function truncate(s: string, max = 46): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: deptSlug } = await params
  if (!/^[a-z0-9-]+$/.test(deptSlug)) return { robots: { index: false, follow: false } }
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return { robots: { index: false, follow: false } }

  const path = `/aides/${deptSlug}/maprimerenov`
  const title = truncate(`MaPrimeRénov' ${dept.name} (${dept.code}) 2026 — artisans RGE`)
  const description = `MaPrimeRénov' ${getDeptPreposition(dept.name)} : barèmes 2026, parcours geste et accompagné, artisans RGE vérifiés ADEME, simulateur officiel d'éligibilité.`

  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: 'ServicesArtisans',
      type: 'website',
    },
  }
}

export default async function MprDeptPage({ params }: PageProps) {
  const { slug: deptSlug } = await params
  // Security M1 — durcir le format avant lookup (defense in depth :
  // getDepartementBySlug a déjà une allowlist, mais valider le shape évite
  // un slug malformé d'atterrir dans un Schema.org JSON-LD.
  if (!/^[a-z0-9-]+$/.test(deptSlug)) notFound()
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) notFound()

  const path = `/aides/${dept.slug}/maprimerenov`
  const zone = deptToClimateZone(dept.code)
  const zoneLabel = CLIMATE_ZONE_LABELS[zone]
  const zoneImpact = CLIMATE_ZONE_IMPACT[zone]

  // Breadcrumb harmonisé : pointe vers le hub /aides + page nationale
  // /aides/maprimerenov, en plus du nom du département. La cohérence entre
  // hub national et déclinaisons départementales évite la cannibalisation
  // SEO entre clusters.
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: "MaPrimeRénov'", url: '/aides/maprimerenov' },
    { name: dept.name, url: path },
  ])

  const mprSchema = getGovernmentServiceSchema({
    name: `MaPrimeRénov' ${dept.name} ${dept.code}`,
    description: `MaPrimeRénov' ${getDeptPreposition(dept.name)} (${dept.code}) : aide Anah pour la rénovation énergétique en ${dept.region}. Barèmes 2026, artisan RGE obligatoire, cumul CEE + TVA 5,5 %.`,
    url: `${SITE_URL}${path}`,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: `Propriétaires occupants et bailleurs de logements achevés depuis +15 ans ${getDeptPreposition(dept.name)}`,
    temporalCoverage: '2026-01-01/2026-12-31',
    sameAs: [
      'https://www.anah.gouv.fr/',
      'https://france-renov.gouv.fr/aides/maprimerenov',
      'https://www.maprimerenov.gouv.fr/',
    ],
  })

  const mprProductSchema = getFinancialProductSchema({
    name: `MaPrimeRénov' — ${dept.name}`,
    description: `Aide Anah versée aux ménages ${getDeptPreposition(dept.name)} pour les travaux d'économies d'énergie. Montant selon catégorie de revenus (bleu, jaune, violet, rose) et type de travaux. Artisan RGE obligatoire à la signature du devis.`,
    url: `${SITE_URL}${path}`,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Aide versée directement par l'Anah, sans frais pour le bénéficiaire.",
  })

  const placeSchema = getPlaceSchema({
    slug: dept.slug,
    name: dept.name,
    region: dept.region,
  })

  const faqs = [
    {
      question: `Qui peut bénéficier de MaPrimeRénov' ${getDeptPreposition(dept.name)} ?`,
      answer: `Tous les propriétaires ${getDeptPreposition(dept.name)} d'un logement achevé depuis plus de 15 ans (ou 2 ans pour le changement de chauffage) et occupé en résidence principale. Les propriétaires bailleurs y ont également droit avec engagement de plafonnement du loyer. Les 4 catégories de revenus (bleu, jaune, violet, rose) déterminent le montant de l'aide — les plafonds sont les mêmes sur tout le territoire métropolitain, mais les délais de versement varient selon la charge des dossiers locaux.`,
    },
    {
      question: `Zone climatique ${dept.code} : quel impact sur les primes CEE ?`,
      answer: `${dept.name} est en zone climatique ${zoneLabel}. ${zoneImpact} La prime MaPrimeRénov' elle-même n'est pas modulée par la zone climatique — ce sont les primes CEE (certificats d'économies d'énergie) cumulables qui varient selon H1/H2/H3.`,
    },
    {
      question: `Comment trouver un artisan RGE ${getDeptPreposition(dept.name)} ?`,
      answer: `ServicesArtisans synchronise quotidiennement la base ADEME des artisans RGE actifs en France. Filtrez par métier (chauffagiste, isolation, menuiserie), consultez la qualification exacte (Qualibat, QualiPAC, QualiBois, Qualit'EnR) et sa date d'expiration. Vérifiez systématiquement sur france-renov.gouv.fr avant signature du devis : la qualification doit être active à la date de signature.`,
    },
  ]

  const faqSchema = getFAQSchema(faqs, {
    pageUrl: `${SITE_URL}${path}`,
    name: `FAQ — MaPrimeRénov' ${dept.name}`,
    includeSpeakable: true,
  })

  const howToSchema = getHowToSchema(
    [
      {
        name: 'Vérifier éligibilité',
        text: `Vérifier que le logement est situé ${getDeptPreposition(dept.name)}, achevé depuis plus de 15 ans et occupé en résidence principale. Identifier la catégorie de revenus (bleu, jaune, violet, rose) via le simulateur officiel.`,
      },
      {
        name: 'Choisir un artisan RGE',
        text: `Sélectionner un artisan certifié RGE actif à la date de signature du devis. Vérifier la qualification exacte (Qualibat, QualiPAC, QualiBois) sur france-renov.gouv.fr.`,
      },
      {
        name: 'Demander 3 devis',
        text: `Comparer 3 devis d'artisans RGE pour les mêmes travaux. Chaque devis doit mentionner le numéro de qualification RGE et sa date de validité.`,
      },
      {
        name: 'Créer compte MaPrimeRénov',
        text: `Créer un compte sur maprimerenov.gouv.fr, déposer le dossier AVANT signature du devis avec RIB, avis d'imposition et devis choisi.`,
      },
      {
        name: 'Attendre accord Anah',
        text: `L'Anah instruit le dossier en 2 à 8 semaines selon la charge locale. Le courrier d'accord indique le montant prévisionnel de la prime.`,
      },
      {
        name: 'Signer devis et réaliser travaux',
        text: `Signer le devis APRÈS réception de l'accord Anah. L'artisan RGE réalise les travaux selon les critères techniques de l'aide.`,
      },
      {
        name: 'Demander paiement',
        text: `À la fin des travaux, déposer la facture sur maprimerenov.gouv.fr. Versement par virement sous 2 à 4 mois. Cumul possible avec primes CEE, TVA 5,5 % et éco-PTZ.`,
      },
    ],
    {
      name: `Obtenir MaPrimeRénov' ${getDeptPreposition(dept.name)}`,
      description: `Parcours officiel pour demander MaPrimeRénov' ${getDeptPreposition(dept.name)} (${dept.code}) en 2026 : éligibilité, devis RGE, dossier Anah, travaux et versement.`,
      totalTime: 'P90D',
    }
  )

  const topVilles = (dept.villes || []).slice(0, 3)
  const cumulables = getCumulableAides('maprimerenov')

  // Sprint ULTRA YMYL — Article+Speakable + byline Person.
  const author = authors['claire-dubois']
  const reviewer = getReviewerForAuthor(author)
  const reviewedIso = `${CONTENT_UPDATED_AT}T00:00:00+02:00`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}${path}#article`,
    url: `${SITE_URL}${path}`,
    headline: `MaPrimeRénov' ${dept.name} (${dept.code}) — barèmes & démarche 2026`,
    description: `MaPrimeRénov' ${getDeptPreposition(dept.name)} ${dept.name} (${dept.code}) : barèmes 2026, conditions de revenus, démarche sur maprimerenov.gouv.fr et cumul avec CEE.`,
    image: [`${SITE_URL}/og-aides-maprimerenov.jpg`, `${SITE_URL}/og-default.jpg`],
    datePublished: '2026-01-01T00:00:00+02:00',
    dateModified: reviewedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Aides à la rénovation énergétique',
    keywords: [
      "MaPrimeRénov'",
      dept.name,
      `département ${dept.code}`,
      'aide rénovation',
      'CEE',
      'éco-PTZ',
      'TVA 5,5%',
      'RGE',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: "MaPrimeRénov'" },
      { '@type': 'AdministrativeArea', name: dept.name },
      { '@type': 'Thing', name: 'Anah — Agence nationale de l’habitat' },
      ...cumulables.slice(0, 3).map((c) => ({ '@type': 'Thing', name: c.name })),
    ],
    ...spreadCitationsForTopics(
      `MaPrimeRénov ${dept.name} CEE éco-PTZ TVA RGE ${cumulables.map((c) => c.name).join(' ')}`
    ),
    author: {
      '@type': 'Person',
      name: author.name,
      jobTitle: author.role,
      url: `${SITE_URL}/equipe/${author.slug}`,
      ...(author.methodology && author.methodology.length > 0 && { skills: author.methodology }),
    },
    ...(reviewer && { reviewedBy: getReviewedByPersonSchema(reviewer) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}${path}`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const tldrBullets: string[] = [
    `MaPrimeRénov' ${getDeptPreposition(dept.name)} ${dept.name} (${dept.code}) — aide nationale Anah, barèmes identiques sur tout le territoire.`,
    `4 catégories de revenus (bleu, jaune, violet, rose) déterminent le montant — vérification via simulateur officiel maprimerenov.gouv.fr.`,
    `Cumulable avec primes CEE, TVA 5,5 % et éco-PTZ. Zone climatique ${zoneLabel.split('—')[0].trim()} impacte les CEE associés.`,
    `Artisan RGE obligatoire à la signature du devis (Qualibat, QualiPAC, QualiBois, Qualit'EnR). Vérification quotidienne base ADEME.`,
  ]

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema,
    mprSchema,
    mprProductSchema,
    articleSchema as Record<string, unknown>,
  ]
  if (placeSchema) jsonLdItems.push(placeSchema as Record<string, unknown>)
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)
  if (howToSchema) jsonLdItems.push(howToSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: "MaPrimeRénov'", href: '/aides/maprimerenov' },
          { label: dept.name },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`MaPrimeRénov' ${getDeptPreposition(dept.name)} ${dept.name} (${dept.code}) — aide nationale Anah pour rénover votre logement. Barèmes 2026 identiques sur tout le territoire, parcours geste & accompagné, artisans RGE vérifiés ADEME.`}
          keyPoints={[
            `4 catégories de revenus (bleu, jaune, violet, rose)`,
            'Cumul possible avec primes CEE + TVA 5,5 % + éco-PTZ',
            `Zone climatique ${zoneLabel.split('—')[0].trim()} (impact CEE associés)`,
            'Artisan RGE obligatoire — vérification quotidienne ADEME',
          ]}
        />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <MapPin className="w-4 h-4 text-accent-300" aria-hidden="true" />
            <span className="text-sm font-medium text-accent-100">
              {dept.region} — {zoneLabel.split('—')[0].trim()}
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            MaPrimeRénov&apos; {getDeptPreposition(dept.name)}{' '}
            <span className="text-accent-200">({dept.code})</span>
          </h1>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            Aide officielle de l&apos;Anah pour rénover votre logement en {dept.region}. Barèmes
            2026, artisans RGE vérifiés via l&apos;API ADEME, cumul avec primes CEE et TVA 5,5 %
            automatique.
          </p>
          <p className="mt-4 text-sm text-accent-100/80">
            Auteur : <span className="font-medium text-white">{author.name}</span>
            {' · '}
            Mis à jour le{' '}
            <time dateTime={CONTENT_UPDATED_AT} className="font-medium">
              {new Date(reviewedIso).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Europe/Paris',
              })}
            </time>
          </p>
          <LastUpdated
            label="Barèmes vérifiés le"
            date={CONTENT_UPDATED_AT}
            className="mt-4 text-accent-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              Devis gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Simulateur CTA inline */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <SimulateurCTA variant="banner" />
        </div>
      </section>

      {/* Parcours MaPrimeRénov' */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Les 2 parcours MaPrimeRénov&apos; 2026
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900">
                  Parcours par geste
                </h3>
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed mb-3">
                Pour 1 ou 2 travaux isolés : isolation combles, fenêtres, pompe à chaleur, poêle
                granulés. Demande autonome en ligne sur maprimerenov.gouv.fr.
              </p>
              <div className="text-sm font-semibold text-accent-700 mb-3">
                Plafond 30 000 € / logement
              </div>
              <Link
                href="/guides/maprimerenov-2026"
                className="inline-flex items-center gap-1 text-sm text-accent-700 font-medium hover:text-accent-800"
              >
                Voir le guide détaillé
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900">
                  Parcours accompagné
                </h3>
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed mb-3">
                Obligatoire dès 2 gestes d&apos;isolation + changement de chauffage OU pour un saut
                d&apos;au moins 2 classes DPE. Accompagnement MAR obligatoire.
              </p>
              <div className="text-sm font-semibold text-accent-700 mb-3">
                Plafond 70 000 € / logement
              </div>
              <Link
                href="/guides/maprimerenov-parcours-accompagne"
                className="inline-flex items-center gap-1 text-sm text-accent-700 font-medium hover:text-accent-800"
              >
                Voir le parcours accompagné
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Zone climatique */}
      <section className="bg-accent-50/40 py-12 border-y border-accent-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-600 text-white flex items-center justify-center">
              <Thermometer className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-charcoal-900 mb-2">
                Zone climatique {zone} — impact sur les primes CEE
              </h2>
              <p className="text-charcoal-700 leading-relaxed">{zoneImpact}</p>
              <Link
                href="/aides/cee"
                className="mt-3 inline-flex items-center gap-1 text-sm text-accent-700 font-medium hover:text-accent-800"
              >
                Voir les primes CEE 2026
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Villes principales + artisans RGE */}
      {topVilles.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
              Artisans RGE {getDeptPreposition(dept.name)}
            </h2>
            <p className="text-charcoal-600 leading-relaxed mb-6">
              Retrouvez les artisans RGE dans les principales villes du département ({dept.chefLieu}{' '}
              et autres). Qualifications vérifiées quotidiennement via l&apos;API ADEME.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topVilles.map((ville) => (
                <Link
                  key={ville}
                  // Code-reviewer P1.2 — NFD normalization couvre tous les
                  // diacritiques (ÿ, ñ, õ, etc.) sans risque d'oubli, contrairement
                  // au remplacement chaîne par chaîne qui ratait L'Haÿ-les-Roses.
                  href={`/rge/renovation-energetique/${ville
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[̀-ͯ]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')}`}
                  className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-accent-300 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-5 h-5 text-accent-700" aria-hidden="true" />
                    <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-accent-700 transition">
                      Artisans RGE {ville}
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal-600">
                    Chauffagistes, couvreurs, menuisiers et maçons RGE à {ville}.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TL;DR pré-FAQ — capture FS sur "MaPrimeRénov [dept]" */}
      <section className="bg-white py-10 border-t border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="sr-only">L’essentiel MaPrimeRénov’ {dept.name}</h2>
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-charcoal-50 py-12 border-t border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Questions fréquentes — MaPrimeRénov&apos; {dept.name}
          </h2>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-charcoal-200 bg-white p-5 open:border-accent-300"
              >
                <summary className="cursor-pointer font-heading font-bold text-charcoal-900 list-none flex justify-between items-start gap-4">
                  <span>{item.question}</span>
                  <ArrowRight
                    className="w-5 h-5 rotate-90 group-open:rotate-[-90deg] transition flex-shrink-0 text-charcoal-400"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-charcoal-700 leading-relaxed text-sm">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Aides cumulables — harmonisation hub /aides */}
      <RelatedAides title="Aides cumulables avec MaPrimeRénov'" aides={cumulables} />

      {/* Trust signal */}
      <section className="bg-white py-8 border-t border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-700" aria-hidden="true" />
              Sources officielles Anah et France Rénov&apos;
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-700" aria-hidden="true" />
              Annuaire artisans RGE synchronisé ADEME
            </div>
          </div>
          {/* Tier 1 2026-05-04 : YmylDisclaimer maintenant injecté par
              src/app/(public)/aides/layout.tsx (footer commun cluster aides). */}
        </div>
      </section>
    </>
  )
}
