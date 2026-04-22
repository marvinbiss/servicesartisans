import type { Metadata } from 'next'
import Link from 'next/link'
import { Droplet, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'infiltration-eau-toiture-diagnostic'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Infiltration toiture : diagnostic 2026'
const DESCRIPTION =
  'Infiltration toiture : diagnostic origine (tuile cassée, faîtage, solin, cheminée), coût réparation, assurance, responsabilité locataire/propriétaire.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(`/guides/${SLUG}`),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  '7 causes classiques : tuile cassée, faîtage fissuré, solin cheminée, gouttière bouchée, velux, zinguerie, noue.',
  'Diagnostic couvreur : 150-400 € (visuel) à 400-900 € (test étanchéité à l’eau).',
  'Petite réparation : 200-600 € (remplacement tuile, solin). Rénovation partielle : 1 500-4 500 €.',
  'Assurance habitation dégât des eaux couvre les conséquences (plafond, parquet). Pas toujours la réparation.',
  'Ne pas attendre : 1 goutte au plafond = 100 L d’eau dans la charpente, risque effondrement si ancien.',
]

const faqs = [
  {
    question: 'Comment localiser une infiltration de toiture ?',
    answer:
      "L'eau circule rarement verticalement : la tache au plafond apparaît souvent loin de la fuite réelle. Méthode pro : inspection couvreur depuis combles (si accessible) avec lampe, puis inspection toiture avec échelle/nacelle. Tests complémentaires : (1) arrosage ciblé par section (test progressif à l'eau), (2) caméra thermique pour repérer zones humides, (3) fumigène pour chemins d'eau. Coût diagnostic complet : 150-900 € selon difficulté.",
  },
  {
    question: 'Quels sont les prix moyens de réparation ?',
    answer:
      'Remplacement tuile cassée isolée : 150-280 €. Réfection faîtage sur 5 m : 300-700 €. Solin de cheminée refait (mortier + bande zinc) : 400-800 €. Étanchéité velux ou châssis : 180-450 €. Nettoyage + remplacement gouttière alu : 40-80 €/ml. Zinguerie neuve (noue zinc) : 150-250 €/ml. Rénovation partielle toiture 20-50 m² : 2 500-8 000 € selon complexité. Couverture complète 100 m² neuve : 15-35 k€.',
  },
  {
    question: 'L’assurance habitation paie-t-elle ?',
    answer:
      'Garantie dégât des eaux MRH classique : couvre les conséquences (plafond, meubles, peinture intérieure, éventuels voisins du dessous). Elle ne couvre PAS la réparation de la cause (tuile cassée, solin défectueux) car considérée comme entretien. Exception : en cas de tempête reconnue (vents >100 km/h, arrêté CatNat) = prise en charge complète. Franchise : 150-300 € classique, 380 € CatNat. Toujours faire constater par expert assureur avant travaux.',
  },
  {
    question: 'Locataire ou propriétaire : qui paie ?',
    answer:
      "Décret 87-712 : le locataire entretient (nettoyage gouttières 1×/an, remplacement tuile cassée si accessible). Le propriétaire finance les grosses réparations et le gros entretien (remplacement faîtage, solin, zinguerie, charpente, couverture). Un locataire qui signale une fuite sans que le bailleur intervienne peut engager des démarches (mise en demeure, réduction de loyer après jugement). L'assurance propriétaire non-occupant couvre sa responsabilité.",
  },
  {
    question: 'Peut-on réparer soi-même une petite fuite ?',
    answer:
      'Déconseillé sauf expertise : travail en hauteur = accidents graves (chute = 1re cause de décès BTP). Si vous persistez : (1) jamais par vent ou pluie, (2) chaussures anti-dérapantes + harnais (70-150 € location), (3) remplacement tuile faîtière ou cassée : 10-30 € matière + 1-2h. À faire réparer par pro : soudure zinc (expertise), cheminée (risque monoxyde), charpente (structure). Devis obligatoire pour assurance.',
  },
]

const sources = [
  { label: 'NF DTU 40.1 et suivants — Couvertures', url: 'https://www.cstb.fr' },
  { label: 'Service-public.fr — Obligations locataire', url: 'https://www.service-public.fr' },
  { label: 'ANIL — Recours dégât des eaux', url: 'https://www.anil.org' },
  { label: 'Qualibat 3161/3171 — Couverture', url: 'https://www.qualibat.com' },
]

const relatedGuides = [
  { label: 'Rénovation toiture', href: '/guides/renovation-toiture' },
  { label: 'Fuite d’eau que faire', href: '/guides/fuite-eau-que-faire' },
  { label: 'Humidité mur intérieur', href: '/guides/humidite-mur-interieur-solution' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Problèmes maison',
    keywords: [
      'infiltration toiture',
      'fuite toiture',
      'diagnostic infiltration toit',
      'réparation couverture',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Infiltration toiture', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Infiltration toiture' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              Problèmes maison · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Infiltration eau toiture : diagnostic et réparations
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tache au plafond, chevron pourri, humidité persistante ? L’origine exacte d’une
              infiltration est rarement celle qu’on croit. Voici la méthode de diagnostic
              professionnelle et les coûts réels 2026.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>7 sources fréquentes d’infiltration</h2>
            <ol>
              <li>
                <strong>Tuile cassée, glissée ou fêlée</strong> (45 % des cas).
              </li>
              <li>
                <strong>Faîtage fissuré</strong> (joints mortier vieillis).
              </li>
              <li>
                <strong>Solin de cheminée dégradé</strong> (bande zinc + mortier).
              </li>
              <li>
                <strong>Gouttière bouchée</strong> ou débordante.
              </li>
              <li>
                <strong>Velux / châssis de toit</strong> (joint périmétrique).
              </li>
              <li>
                <strong>Noue zinc percée</strong> ou mal soudée.
              </li>
              <li>
                <strong>Condensation dans combles</strong> (pas toujours infiltration).
              </li>
            </ol>
            <h2>Checklist diagnostic</h2>
            <ul>
              <li>Accéder aux combles avec lampe frontale + perche</li>
              <li>Photographier toute trace sur charpente, isolant, plafond</li>
              <li>Noter corrélation pluie/vent/direction : signe fort</li>
              <li>Inspection extérieure au télescope depuis jardin</li>
              <li>Accès toiture (couvreur, nacelle) pour vérification tuiles</li>
              <li>Test à l’eau ciblé zone par zone si besoin</li>
            </ul>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Ne jamais ignorer une infiltration.</strong> L’humidité pourrit la charpente
                (champignons mérule, insectes) : remplacement chevron à partir de 800 € par pièce,
                reprise entraîts/arbalétriers 3 000-12 000 €. Intervenir dans les 30 jours max.
              </p>
            </div>
          </article>
          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />
          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/services/couvreur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un couvreur <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
