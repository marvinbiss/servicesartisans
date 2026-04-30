import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'dtu-plomberie-normes'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'DTU plomberie 2026 : normes et pose'
const DESCRIPTION =
  'DTU plomberie : NF DTU 60.1 (eau), 60.11 (cuivre), 65.10 (chauffage). Diamètres, distances, obligations installateur, responsabilité décennale.'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'NF DTU 60.1 P1-1-1 : tronc commun de la plomberie — canalisations eau, pression, matériaux admis (cuivre, PER, multicouche, PVC, PEHD).',
  'NF DTU 60.11 : dimensionnement et pose des canalisations cuivre. Diamètres mini par usage (ø10 robinet, ø12 colonne, ø14-16 distribution).',
  'NF DTU 65.10 : canalisations chauffage eau chaude, matériaux, isolation obligatoire (classe 3 minimum en vide sanitaire).',
  'Installation en conformité = condition pour activer garantie décennale (art. 1792 Code civil) en cas de dégât des eaux.',
  'Pression eau : 3 bars maximum en habitat (réducteur obligatoire au-delà), pression mini 1,5 bar. Tests étanchéité obligatoires (10 bar pendant 1h pour distribution).',
]

const faqs = [
  {
    question: 'Quels sont les DTU plomberie principaux ?',
    answer:
      "5 DTU de référence : (1) NF DTU 60.1 P1-1-1 : tronc commun, canalisations eau potable — matériaux admis, dimensionnement débits, pression ; (2) NF DTU 60.11 : cuivre spécifique (dimensionnement, pose, cintrage) ; (3) NF DTU 60.31 / 60.32 / 60.33 : canalisations PVC / PVC pression ; (4) NF DTU 60.5 : canalisations cuivre écoulement ; (5) NF DTU 65.10 : canalisations chauffage eau chaude. Publiés par CSTB, révisés environ tous les 5 ans. À consulter lors d'une installation neuve ou rénovation lourde — la conformité DTU est exigée par les assureurs décennaux.",
  },
  {
    question: 'Quels diamètres de canalisations selon l’usage ?',
    answer:
      "NF DTU 60.11 cuivre (référence courante) : (1) robinets isolés (lavabo, évier) : ø10 mm minimum ; (2) douche simple : ø12 mm ; (3) baignoire : ø14 mm ; (4) colonnes montantes 1-2 logements : ø14-16 mm ; (5) nourrice distribution (8-10 piquages) : ø22-25 mm ; (6) arrivée générale logement : ø20-25 mm. PER multicouche : diamètres similaires (ø12, ø16, ø20, ø25, ø32). Règle d'or : perte de charge < 0,1 bar pour chaque mètre linéaire, débit mini 6 L/min par robinet.",
  },
  {
    question: 'Quelles sont les obligations d’isolation des canalisations ?',
    answer:
      "NF DTU 65.10 + RE2020 : isolation thermique OBLIGATOIRE pour (1) canalisations ECS (eau chaude sanitaire) en volume non chauffé — classe 3 mini (épaisseur 19 mm pour ø15-22 mm, 25 mm pour ø28-35 mm) ; (2) canalisations chauffage en vide sanitaire ou combles — classe 4 recommandée (jusqu'à 25 mm d'épaisseur) ; (3) protection antigel obligatoire pour canalisations extérieures ou en local non chauffé sous 0°C. Matériaux : mousse polyéthylène, élastomère, laine minérale manchonnée. Non-respect = déperdition 20-35 % + non-conformité DTU + refus garantie décennale si dégât.",
  },
  {
    question: 'Quelle pression maximale dans une installation domestique ?',
    answer:
      "Normes NF DTU + CCH art. R1321-58 : pression maxi 3 bars en habitat. Au-delà (souvent 4-8 bars au compteur selon réseau), installation d'un réducteur de pression OBLIGATOIRE en tête d'installation (50-150 €). Pression mini : 1,5 bar pour fonctionnement normal équipements (chaudière, chauffe-eau, lave-linge). Test d'étanchéité après travaux : 10 bars pendant 1 h pour réseau distribution (perte <0,3 bar tolérée), 6 bars pour évacuation. Tests consignés sur PV de mise en service — exigé par assureur dommage-ouvrage. Coût test 150-300 €.",
  },
  {
    question: 'DTU plomberie vs garantie décennale : quel lien ?',
    answer:
      "Lien direct : les DTU constituent les « règles de l'art » opposables en cas de sinistre (art. 1792 Code civil). En cas de dégât des eaux, fuite, infiltration : l'expert d'assurance vérifie la conformité DTU avant d'actionner la décennale. Non-conformité majeure (ø insuffisant, matériau non admis, pression non régulée) = refus garantie par l'assureur + responsabilité personnelle de l'artisan + obligation de reprise à ses frais + dommages-intérêts. C'est pourquoi un pro sérieux archive systématiquement photos d'installation, fiches techniques produits, PV d'étanchéité — ces pièces prouvent la conformité en cas de litige.",
  },
]

const sources = [
  { label: 'CSTB — DTU plomberie', url: 'https://www.cstb.fr' },
  {
    label: 'AFNOR — NF DTU 60.1',
    url: 'https://www.boutique.afnor.org/fr-fr/norme/nf-dtu-601/norme-dtu-601/fa144824',
  },
  {
    label: 'Code Construction — art. R1321-58',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006909068',
  },
  {
    label: 'Art. 1792 Code civil — Décennale',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038814715',
  },
]

const relatedGuides = [
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
  { label: 'Garantie parfait achèvement', href: '/guides/garantie-parfait-achevement' },
  { label: 'Fuite d’eau : que faire', href: '/guides/fuite-eau-que-faire' },
  { label: 'Odeur de canalisation', href: '/guides/odeur-canalisation-remede' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Réglementation',
    keywords: [
      'DTU plomberie',
      'normes plomberie',
      'NF DTU 60.11 cuivre',
      'NF DTU 65.10 chauffage',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'DTU plomberie', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'DTU plomberie' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              DTU plomberie 2026 : normes, diamètres, pose
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les DTU plomberie définissent les règles de l’art opposables en cas de litige. Voici
              les 5 DTU principaux, les diamètres obligatoires par usage, les pressions admises et
              l’interaction directe avec la garantie décennale de votre installation.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 5 DTU plomberie de référence</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Réf. DTU</th>
                    <th className="p-3 border-b border-sand-200">Portée</th>
                    <th className="p-3 border-b border-sand-200">Matériaux</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['60.1 P1-1-1', 'Tronc commun canalisations eau', 'Tous'],
                    ['60.11', 'Dimensionnement / pose cuivre', 'Cuivre'],
                    ['60.31 / 60.32 / 60.33', 'PVC pression', 'PVC'],
                    ['60.5', 'Cuivre écoulement', 'Cuivre'],
                    ['65.10', 'Chauffage eau chaude', 'Tous'],
                  ].map(([d, p, m]) => (
                    <tr key={d} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{d}</td>
                      <td className="p-3">{p}</td>
                      <td className="p-3">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Exiger PV d’étanchéité + fiches techniques.</strong> Sans preuve conformité
                DTU = assureur refuse la décennale en cas de dégât. Coût test 150-300 €. Risque sans
                test : 3-15 k€ de dégâts non remboursés par l’assurance.
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
              href="/services/plombier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un plombier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
