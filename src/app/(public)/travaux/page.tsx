import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Calculator,
  ClipboardList,
  Compass,
  Home,
  Hammer,
  Layers,
  ShieldCheck,
  Wrench,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import EnBrefBox from '@/components/seo/EnBrefBox'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getPublishedDate } from '@/lib/seo/published-dates'

export const dynamic = 'force-static'
export const revalidate = 86400

const PATH = '/travaux'
const HUB_TITLE = 'Travaux de rénovation 2026 : entreprise, prix, artisans RGE'
const HUB_DESCRIPTION =
  'Hub travaux 2026 : trouver une entreprise de rénovation, refaire toiture / isolation / fenêtres, prix au m², artisans RGE certifiés ADEME France Rénov’.'
const REVIEW_DATE = '2026-04-29'
const PUBLISHED_DATE = getPublishedDate('/travaux')

const AUTHOR = authors['sophie-martin']

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Comment choisir une entreprise de rénovation fiable en 2026 ?',
    answer:
      "Trois critères incontournables : (1) certification RGE en cours de validité (Reconnu Garant de l'Environnement, vérifiable sur france-renov.gouv.fr ou notre annuaire) — obligatoire pour mobiliser MaPrimeRénov’ et la prime CEE ; (2) assurance décennale active dont l'attestation doit être annexée au devis ; (3) ancienneté du SIRET (au moins 3-5 ans actifs) et présence d'avis vérifiés. Demandez systématiquement 3 devis détaillés ligne par ligne (matériaux + main-d'œuvre, marque/référence des équipements). Méfiez-vous du démarchage téléphonique non sollicité, interdit depuis le 1er mars 2023 dans le secteur de la rénovation énergétique.",
  },
  {
    question: 'Combien coûte une rénovation complète d’une maison de 100 m² en 2026 ?',
    answer:
      'Une rénovation lourde (isolation extérieure, changement chauffage, menuiseries, ventilation, électricité partielle) coûte entre 60 000 et 120 000 € TTC pour une maison de 100 m² en 2026. Une rénovation énergétique seule sans gros œuvre se situe entre 35 000 et 65 000 € TTC. Une rénovation totale d’une passoire thermique (gain ≥ 4 classes DPE) peut atteindre 130 000 à 180 000 € TTC mais ouvre droit à MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 € pour un ménage très modeste, plus prime CEE bonifiée et éco-PTZ jusqu’à 50 000 €.',
  },
  {
    question: 'Faut-il un architecte ou un maître d’œuvre pour rénover ?',
    answer:
      'L’architecte est obligatoire pour toute construction ou rénovation lourde dépassant 150 m² de surface de plancher (loi du 3 janvier 1977). En deçà, il reste recommandé pour : modifications structurelles (murs porteurs, ouvertures), changement de destination (grange en habitation), permis de construire complexes. Le maître d’œuvre, lui, n’a aucun monopole légal mais offre un suivi de chantier coordonné (planning, comparatif devis, réception travaux). Comptez 8-12 % du montant des travaux pour un architecte, 5-9 % pour un maître d’œuvre. Pour une rénovation énergétique « simple » menée par 1 à 3 artisans, vous pouvez piloter sans intermédiaire.',
  },
  {
    question: 'Refaire une toiture : quel prix et quelles aides en 2026 ?',
    answer:
      'Le prix d’une réfection complète de toiture en 2026 se situe entre 110 et 280 € TTC le m² selon le matériau (tuiles terre cuite 150-200 €, ardoise naturelle 220-280 €, bac acier 100-140 €) et la complexité (charpente, demi-niveau, lucarnes). Sur une toiture de 120 m², comptez donc 13 000 à 33 000 € TTC. Les aides disponibles : prime CEE BAR-EN-103 si l’opération inclut isolation des rampants, MaPrimeRénov’ si gain énergétique attesté, TVA à 5,5 % automatique avec un artisan RGE qualifié couvreur (Qualibat 3811 ou 3815). Le simple ravalement de couverture (sans isolation) n’ouvre pas droit aux aides énergétiques.',
  },
  {
    question: 'Quels travaux nécessitent obligatoirement un artisan RGE ?',
    answer:
      'L’obligation RGE concerne quasiment toutes les opérations de rénovation énergétique éligibles à MaPrimeRénov’, à la prime CEE ou à l’éco-PTZ : isolation (combles, murs, planchers bas), chauffage (pompes à chaleur, chaudières biomasse, poêles à granulés), ventilation (VMC double flux), eau chaude sanitaire (chauffe-eau thermodynamique, solaire), audit énergétique. Sans RGE valide à la signature du devis, aucune aide ne sera versée. La qualification doit être délivrée par un organisme COFRAC (Qualibat, Qualit’EnR, Qualifelec, Certibat, OPQIBI) et correspondre au métier exact de l’opération.',
  },
]

export const metadata: Metadata = {
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  alternates: getAlternates(PATH),
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: `${HUB_TITLE} — ${SITE_NAME}`,
    description: HUB_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
  },
}

const tldrBullets = [
  'Rénovation 100 m² : 35 000-65 000 € (énergétique seule), 60 000-120 000 € (lourde)',
  'Refaire toiture : 110-280 € TTC le m² selon matériau (tuiles, ardoise, bac acier)',
  'Architecte obligatoire au-delà de 150 m² de surface de plancher (loi 1977)',
  'RGE obligatoire pour MaPrimeRénov’ + CEE + éco-PTZ + TVA 5,5 %',
]

const enBrefPoints = [
  '49 000+ artisans RGE actifs vérifiés ADEME France Rénov’',
  '12 aides 2026 cumulables : MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %, ANAH',
  'Architecte obligatoire au-delà de 150 m² ; recommandé en deçà selon complexité',
  'Sources : ADEME, France Rénov’, FFB, baromètre Opinion Way prix travaux',
]

type TravauxCluster = {
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const TRAVAUX_HUBS: TravauxCluster[] = [
  {
    href: '/services/macon',
    title: 'Maçon : devis + artisans RGE',
    description: 'Murs porteurs, fondations, ouvertures, gros œuvre. Annuaire vérifié ADEME.',
    icon: Hammer,
  },
  {
    href: '/services/couvreur',
    title: 'Couvreur : refaire ma toiture',
    description: 'Réfection toiture, zinguerie, charpente, désamiantage couverture.',
    icon: Home,
  },
  {
    href: '/services/electricien',
    title: 'Électricien : mise aux normes NF C 15-100',
    description: 'Mise en sécurité, tableau, prises, IRVE bornes recharge.',
    icon: Wrench,
  },
  {
    href: '/services/plombier',
    title: 'Plombier : sanitaires + chauffage',
    description: 'Salle de bain, sanitaires, fuites, dépannage 7j/7.',
    icon: Wrench,
  },
  {
    href: '/services/chauffagiste',
    title: 'Chauffagiste : PAC, chaudière, radiateurs',
    description: 'Pompe à chaleur, chaudière biomasse, plancher chauffant, entretien.',
    icon: Wrench,
  },
  {
    href: '/services/menuisier',
    title: 'Menuisier : fenêtres + portes + parquet',
    description: 'Double-vitrage, portes-fenêtres, parquet massif, agencement.',
    icon: Layers,
  },
]

const TRAVAUX_GUIDES: TravauxCluster[] = [
  {
    href: '/guides/renovation-energetique-complete',
    title: 'Rénovation énergétique complète : guide 2026',
    description: 'Bouquet de travaux type, ordre des opérations, aides cumulables.',
    icon: Compass,
  },
  {
    href: '/guides/budget-renovation',
    title: 'Budget rénovation : grilles 2026',
    description: 'Coût TTC moyen par poste : isolation, chauffage, menuiseries, salle de bain.',
    icon: Calculator,
  },
  {
    href: '/guides/prix-renovation-maison-100m2',
    title: 'Prix rénovation maison 100 m²',
    description: 'Fourchettes 2026 selon ampleur (rafraîchissement, lourde, totale passoire).',
    icon: Calculator,
  },
  {
    href: '/guides/renovation-toiture',
    title: 'Refaire sa toiture : prix + aides',
    description: 'Tuiles, ardoise, bac acier — prix au m² + CEE + RGE couvreur.',
    icon: Home,
  },
  {
    href: '/guides/renovation-fenetres',
    title: 'Changer ses fenêtres en 2026',
    description: 'Double / triple vitrage, prime CEE BAR-EN-104, choix matériau.',
    icon: Layers,
  },
  {
    href: '/guides/renovation-salle-de-bain',
    title: 'Rénover sa salle de bain',
    description: 'Devis poste par poste, MaPrimeAdapt’ pour PMR, délais chantier.',
    icon: Wrench,
  },
  {
    href: '/guides/renovation-cuisine',
    title: 'Rénover sa cuisine en 2026',
    description: 'Budget par configuration, ordre travaux, gros œuvre vs plug-and-play.',
    icon: Building2,
  },
  {
    href: '/guides/aides-renovation-2026',
    title: 'Toutes les aides à la rénovation 2026',
    description: 'Catalogue 12 aides nationales + locales, cumul max, conditions RGE.',
    icon: ClipboardList,
  },
  {
    href: '/guides/passoire-thermique-renovation',
    title: 'Sortir d’une passoire thermique',
    description: 'Calendrier loi Climat & Résilience (G/F/E), bouquet travaux type.',
    icon: ShieldCheck,
  },
]

export default function TravauxHubPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Travaux de rénovation', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: HUB_TITLE,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: TRAVAUX_HUBS.length + TRAVAUX_GUIDES.length,
    itemListElement: [...TRAVAUX_HUBS, ...TRAVAUX_GUIDES].map((g, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${SITE_URL}${g.href}`,
      name: g.title,
    })),
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${PATH}#webpage`,
    url: `${SITE_URL}${PATH}`,
    name: HUB_TITLE,
    description: HUB_DESCRIPTION,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    breadcrumb: breadcrumbSchema,
    primaryImageOfPage: { '@id': `${SITE_URL}/opengraph-image` },
    dateModified: REVIEW_DATE,
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : undefined,
    publisher: { '@id': `${SITE_URL}#organization` },
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: HUB_TITLE,
    description: HUB_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    datePublished: PUBLISHED_DATE,
    dateModified: REVIEW_DATE,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: `${SITE_URL}/opengraph-image`,
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          url: `${SITE_URL}/equipe/${AUTHOR.slug}`,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${PATH}` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: `${SITE_URL}${PATH}`,
    name: 'FAQ — Travaux de rénovation 2026',
    includeSpeakable: true,
  })

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema as Record<string, unknown>,
    articleSchema as Record<string, unknown>,
    webPageSchema as Record<string, unknown>,
    itemListSchema as Record<string, unknown>,
  ]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Travaux de rénovation' }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Hammer className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">Hub travaux 2026</span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            {HUB_TITLE}
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            {HUB_DESCRIPTION}
          </p>
          <LastUpdated
            label="Hub vérifié le"
            date={REVIEW_DATE}
            className="mt-4 text-emerald-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Devis travaux gratuit
            </Link>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides
            </Link>
          </div>
        </div>
      </section>

      {/* En bref + TLDR + author */}
      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <ArticleMeta
            author={AUTHOR?.name ?? 'Équipe éditoriale ServicesArtisans'}
            authorHref={AUTHOR ? `/equipe/${AUTHOR.slug}` : '/a-propos'}
            datePublished={PUBLISHED_DATE}
            dateModified={REVIEW_DATE}
          />
          <EnBrefBox keyPoints={enBrefPoints} />
          <TldrBlock title="L’essentiel des travaux 2026" bullets={tldrBullets} />
        </div>
      </section>

      {/* Choisir entreprise rénovation — capture KW racine "entreprise rénovation" */}
      <section
        id="choisir-entreprise"
        aria-labelledby="entreprise-heading"
        className="bg-white py-12"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="entreprise-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Choisir une entreprise de rénovation fiable en 2026
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            Trois critères incontournables pour sélectionner une entreprise de rénovation crédible :
            certification RGE active, assurance décennale en règle, et SIRET vérifié de plus de 3-5
            ans. Notre annuaire ServicesArtisans synchronise quotidiennement la base ADEME France
            Rénov’ pour vous donner uniquement des artisans dont la qualification est en cours de
            validité.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-charcoal-100 bg-white p-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-charcoal-900 mb-1">RGE en cours</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Qualibat, Qualit’EnR, Qualifelec, Certibat, OPQIBI : qualification active à la
                signature du devis.
              </p>
            </div>
            <div className="rounded-xl border border-charcoal-100 bg-white p-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-charcoal-900 mb-1">Décennale + RC Pro</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Attestation d’assurance décennale annexée au devis, valide pour le métier réalisé.
              </p>
            </div>
            <div className="rounded-xl border border-charcoal-100 bg-white p-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              </div>
              <h3 className="font-heading font-bold text-charcoal-900 mb-1">SIRET 3+ ans</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Vérification active sur l’API INSEE Sirene, ancienneté affichée sur la fiche
                artisan.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800 transition"
            >
              Annuaire 49 000+ artisans RGE certifiés
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Métiers travaux */}
      <section
        id="metiers"
        aria-labelledby="metiers-heading"
        className="bg-emerald-50/60 py-12 border-y border-emerald-100"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="metiers-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Trouver l’artisan adapté à vos travaux
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRAVAUX_HUBS.map((t) => {
              const Icon = t.icon
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition mb-2">
                    {t.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-3">{t.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-700 font-medium">
                    Voir les artisans
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Guides travaux */}
      <section id="guides" aria-labelledby="guides-heading" className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="guides-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Guides travaux : prix, étapes, aides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRAVAUX_GUIDES.map((g) => {
              const Icon = g.icon
              return (
                <Link
                  key={g.href}
                  href={g.href}
                  className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition mb-2">
                    {g.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-3">{g.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-700 font-medium">
                    Lire le guide
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA simulateur + RGE */}
      <section className="bg-emerald-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Vos travaux pas à pas : simulateur + 3 devis RGE en 24-48h
          </h2>
          <p className="text-emerald-50/90 leading-relaxed mb-6 max-w-2xl mx-auto">
            Simulez le bouquet d’aides applicable à votre projet en 3 minutes, puis recevez 3 devis
            d’artisans certifiés RGE de votre région. Lead exclusif (1 demande = 1 artisan, jamais
            partagé).
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides en 3 min
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Devis travaux gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="bg-white py-12 border-t border-charcoal-100"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="faq-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((q) => (
              <details
                key={q.question}
                className="group rounded-xl border border-charcoal-100 bg-white p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-charcoal-900 group-open:text-emerald-700">
                  {q.question}
                </summary>
                <p className="mt-3 text-sm text-charcoal-700 leading-relaxed">{q.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-sand-50 py-10 border-t border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-xl font-extrabold text-charcoal-900">
              Notre méthodologie
            </h2>
          </div>
          <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
            Hub rédigé par {AUTHOR?.name ?? 'la rédaction ServicesArtisans'} (
            {AUTHOR?.role ?? 'rédacteur spécialisé'}). Méthodologie publiée :
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-charcoal-700">
            {(AUTHOR?.methodology ?? []).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charcoal-500">
            Détail complet sur{' '}
            <Link href="/methodologie" className="underline hover:text-emerald-700">
              /methodologie
            </Link>{' '}
            · Sources officielles : ADEME, France Rénov’, FFB, baromètre Opinion Way prix travaux.
          </p>
        </div>
      </section>
    </>
  )
}
