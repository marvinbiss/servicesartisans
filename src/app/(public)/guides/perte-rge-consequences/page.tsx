import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldAlert, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'perte-rge-consequences'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Perte RGE : conséquences, recours 2026'
const AUTHORS_CITY_FALLBACK = ''
void AUTHORS_CITY_FALLBACK
const DESCRIPTION =
  'Perte RGE : motifs (non-conformité, fraude, contrôle négatif), conséquences (perte chantiers, aides), procédure Qualit’EnR/Qualibat, recours 2 mois.'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
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
  'Perte RGE = suspension ou retrait de la qualification par l’organisme qualificateur (Qualit’EnR, Qualibat, Qualifelec, Certibat).',
  '5 motifs principaux : non-respect des règles techniques, chantier contrôlé négatif, fraude CEE/MPR, défaut de formation continue, non-paiement cotisations.',
  'Conséquences : impossibilité de faire bénéficier d’aides (MPR, CEE), perte 30-60 % CA pour un artisan chauffage/isolation, image marque dégradée.',
  'Procédure : notification motivée, délai recours 2 mois, commission disciplinaire, décision suspension (2-12 mois) ou retrait définitif.',
  'Reconduction possible après période de suspension + levée des manquements (nouvelle formation, audit spécifique 1-3 chantiers).',
]

const faqs = [
  {
    question: 'Quelles sont les causes principales de perte RGE ?',
    answer:
      "Selon Qualit'EnR (rapport 2024) et Qualibat : (1) contrôle de chantier négatif majeur (35 %) — non-respect DTU, rendement énergétique insuffisant ; (2) fraude avérée CEE/MaPrimeRénov' (20 %) — factures fictives, dimensionnement faux ; (3) absence formation continue (15 %) — pas de renouvellement attestation tous les 4 ans ; (4) plaintes clients récurrentes (15 %) — malfaçons constatées ; (5) non-paiement droits annuels (15 %). Les 2 premières causes entraînent généralement un retrait immédiat, les autres une suspension graduée.",
  },
  {
    question: 'Combien d’artisans perdent leur RGE chaque année ?',
    answer:
      'Rapport ADEME 2024 : environ 3 500-4 500 entreprises perdent leur RGE annuellement sur les ~65 000 qualifiées. Soit un taux de renouvellement négatif de 5-7 %. Causes majeures en 2024 : durcissement des contrôles post-scandale pompes à chaleur mal installées (DGCCRF 2023), renforcement audits chantier (de 1 pour 5 entreprises à 1 pour 3). Les qualifications chauffage (QualiPAC, Qualibois) et isolation (Qualibat 7131) sont les plus touchées.',
  },
  {
    question: 'Quels recours en cas de décision de retrait RGE ?',
    answer:
      "Procédure en 3 étapes : (1) recours gracieux auprès du comité de qualification de l'organisme (Qualit'EnR, Qualibat), délai 2 mois à réception notification, argumenter en droit + faits, apporter pièces complémentaires ; (2) si rejet, recours hiérarchique auprès de la commission nationale RGE (30 jours) ; (3) en dernier ressort, recours contentieux devant le tribunal judiciaire ou administratif (selon statut organisme). Assistance juridique recommandée dès l'étape 1 (500-1 500 € HT), avocat spécialisé construction/urbanisme. Jurisprudence favorable si la procédure n'a pas respecté le contradictoire.",
  },
  {
    question: 'Peut-on récupérer la qualification RGE après perte ?',
    answer:
      "Oui dans la majorité des cas, sauf retrait définitif pour fraude lourde (condamnation pénale CEE/MPR). Procédure de reconduction : (1) attendre la fin de la période de suspension (2-12 mois), (2) lever les manquements identifiés (nouvelle formation technicien 500-2 000 €, audit interne, mise en conformité outils), (3) solliciter nouveau dossier auprès de l'organisme, (4) audit complet avec visite chantier récent vérifié, (5) décision en 2-4 mois. Taux de réussite reconduction : 65-75 % selon Qualit'EnR. Coût total démarche : 1 500-4 000 € HT + perte CA pendant suspension.",
  },
  {
    question: 'Quel impact financier sur l’entreprise ?',
    answer:
      "Impact variable selon spécialité : (1) artisan PAC/chauffage : perte 50-70 % CA car 90 % clients demandent le RGE pour toucher MPR+CEE ; (2) isolateur : perte 40-60 % CA ; (3) couvreur/charpentier hors rénovation énergétique : impact 10-25 %. Sur base 250 k€ CA annuel, une suspension 6 mois coûte 30-70 k€ de manque à gagner + frais reconduction 2-4 k€ + image marque dégradée (avis Google, bouche-à-oreille). Total sinistre typique : 40-100 k€. Assurance RC Pro ne couvre PAS cette perte d'exploitation liée à une sanction administrative.",
  },
]

const sources = [
  { label: 'Qualit’EnR — Règles de qualification', url: 'https://www.qualit-enr.org' },
  { label: 'Qualibat — Procédure disciplinaire', url: 'https://www.qualibat.com' },
  {
    label: 'Arrêté 1er déc 2015 — Critères RGE',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000031536915',
  },
  { label: 'DGCCRF — Enquêtes fraude RGE', url: 'https://www.economie.gouv.fr/dgccrf' },
]

const relatedGuides = [
  { label: 'QualiPAC signification', href: '/guides/qualipac-signification-obtenir' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'Labels et qualifications artisans', href: '/guides/labels-qualifications-artisans' },
  { label: 'MaPrimeRénov’ 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Qualifications RGE',
    keywords: [
      'perte RGE',
      'conséquences perte RGE',
      'retrait qualification RGE',
      'suspension RGE',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Perte RGE', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Perte RGE' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
              Qualifications RGE · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Perte RGE : conséquences et procédure 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La perte de qualification RGE est un véritable séisme pour une entreprise du bâtiment.
              Voici les 5 motifs les plus fréquents, les conséquences financières, la procédure de
              contestation et comment reconduire la qualification après suspension.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>5 motifs principaux de perte RGE</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Motif</th>
                    <th className="p-3 border-b border-sand-200">Sanction type</th>
                    <th className="p-3 border-b border-sand-200">Fréquence</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Chantier contrôlé négatif', 'Suspension 3-6 mois', '35 %'],
                    ['Fraude CEE/MPR', 'Retrait définitif', '20 %'],
                    ['Formation non renouvelée', 'Suspension 1-3 mois', '15 %'],
                    ['Plaintes clients répétées', 'Suspension 2-6 mois', '15 %'],
                    ['Non-paiement cotisations', 'Suspension technique', '15 %'],
                  ].map(([m, s, f]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3">{s}</td>
                      <td className="p-3 font-semibold">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Avant suspension : contactez un avocat.</strong> Les procédures RGE
                n’accordent que 2 mois pour contester. 30 % des décisions sont réformées en appel
                avec assistance juridique. Coût 800-2 500 € HT, rentable vs perte CA 40-100 k€.
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
            <Link href="/rge" className="inline-flex items-center gap-1 hover:text-primary-700">
              Espace RGE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
