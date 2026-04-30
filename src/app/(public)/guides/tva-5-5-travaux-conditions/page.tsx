import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'tva-5-5-travaux-conditions'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'TVA 5,5 % travaux : conditions 2026'
const DESCRIPTION =
  'TVA 5,5 % : logement >2 ans + rénovation énergétique performante. Attestation simplifiée Cerfa 13948, travaux éligibles, pièces fiches. Erreur = redressement.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Art. 278-0 bis A CGI : TVA 5,5 % sur rénovation énergétique performante dans logement >2 ans. Différent de TVA 10 % (rénovation standard).',
  'Travaux éligibles : isolation thermique murs/toitures/planchers, fenêtres ≤ seuil U, PAC air-eau/eau-eau, chaudière biomasse, VMC double flux.',
  'Seuils techniques stricts : isolation R≥3,7 m²K/W combles, Uw≤1,3 W/m²K fenêtres, ETAS≥111 % PAC haute température.',
  'Attestation simplifiée Cerfa 1301-SD OU 1301-G-SD à remplir par le client + conservation 5 ans pour contrôle fiscal.',
  'Erreur courante : mélanger travaux éligibles (isolation) et non éligibles (peinture) sur même facture → redressement fiscal obligatoire.',
]

const faqs = [
  {
    question: 'Qui peut bénéficier de la TVA 5,5 % ?',
    answer:
      "Conditions cumulatives (art. 278-0 bis A CGI) : (1) Logement achevé depuis plus de 2 ans à la date de début des travaux (date d'achèvement sur déclaration fiscale ou DAACT) ; (2) Usage résidentiel (résidence principale ou secondaire — les locaux pros sont exclus) ; (3) Travaux de rénovation énergétique performante listés à l'annexe IV du CGI ; (4) Entreprise qualifiée RGE si travaux énergétiques (QualiPAC, Qualibat, Qualifelec selon métier) ; (5) Attestation simplifiée Cerfa 1301-SD pour travaux standards, Cerfa 1301-G-SD pour travaux gros œuvre, remise par le client à l'entreprise AVANT facturation. Bailleurs sociaux et propriétaires occupants éligibles. Locataires : possible si propriétaire donne mandat écrit.",
  },
  {
    question: 'Quels travaux sont éligibles à la TVA 5,5 % ?',
    answer:
      "Liste officielle annexe IV CGI (exhaustive) : (1) Isolation thermique des murs extérieurs/intérieurs (R≥3,7 m²K/W), toitures (R≥7 m²K/W combles, R≥6 m²K/W toitures terrasses), planchers bas (R≥3 m²K/W) ; (2) Fenêtres / portes-fenêtres / portes d'entrée (Uw ≤1,3 W/m²K, Uw-0,9 W/m²K pour parois vitrées) ; (3) PAC air-eau (ETAS ≥126 % basse température ou 111 % haute température), PAC eau-eau, PAC géothermique ; (4) Chaudière biomasse (rendement ≥87 %) ; (5) VMC double flux (rendement ≥70 %). Les travaux induits connexes sont éligibles : habillage intérieur ITE, reprise carrelage autour du plancher chauffant, etc. Peinture, plomberie pure, électricité standard = TVA 10 % ou 20 %.",
  },
  {
    question: 'Comment remplir l’attestation simplifiée ?',
    answer:
      "Cerfa 1301-SD (modèle simplifié, travaux <30 000 €) en 4 parties : (1) identité client + adresse bien, (2) ancienneté >2 ans cochée (propriétaire engage responsabilité), (3) liste travaux énergétiques performante effectués (fournir descriptif devis), (4) signature datée + mention manuscrite « bon pour attestation ». Pour travaux >30 000 € : Cerfa 1301-G-SD (modèle normal), mêmes champs + plan des travaux en annexe. L'original reste chez l'entreprise (conservée 5 ans), une copie au client. Absence d'attestation = l'entreprise DOIT facturer TVA 20 %. Fausse déclaration = remboursement différentiel + amende fiscale.",
  },
  {
    question: 'Peut-on cumuler TVA 5,5 % avec MaPrimeRénov’ et CEE ?',
    answer:
      "OUI, cumul intégral autorisé. Exemple concret pour PAC air-eau 15 000 € TTC : (1) TVA 5,5 % (économie vs 20 % = 2 175 €) ; (2) MaPrimeRénov' 4 000-11 000 € selon revenus ; (3) Coup de pouce CEE 4 000-5 500 € ; (4) Éco-PTZ jusqu'à 50 000 € pour financer le reste à charge ; (5) Aides locales éventuelles. Total aides cumulables pouvant atteindre 70-90 % du coût initial. Seule obligation : même entreprise RGE pour toutes les aides (cohérence dossier). Les aides sont déduites APRÈS application TVA 5,5 %, donc impact cumulé maximal.",
  },
  {
    question: 'Quelles sanctions en cas d’erreur TVA ?',
    answer:
      "L'entreprise engage sa responsabilité. En cas de contrôle fiscal (2-3 ans après travaux en moyenne) : (1) si TVA appliquée à tort (travaux non éligibles facturés 5,5 % au lieu de 10 ou 20 %) : redressement du différentiel + majoration 10-40 % + intérêts moratoires 0,2 %/mois à charge de l'entreprise ; (2) mais si fausse déclaration du client sur ancienneté ou usage : le client est solidairement redevable. Jurisprudence 2022 (CE n°448432) : en cas de fausse attestation, l'administration peut se retourner directement contre le client. Conservation PV 5 ans obligatoire de part et d'autre. En cas de doute : consulter expert comptable 150-300 €, bien moins cher qu'un redressement 3 000-15 000 €.",
  },
]

const sources = [
  {
    label: 'Art. 278-0 bis A CGI — TVA 5,5 %',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039682007',
  },
  {
    label: 'Annexe IV CGI — Liste travaux',
    url: 'https://bofip.impots.gouv.fr',
  },
  {
    label: 'Cerfa 1301-SD — Attestation simplifiée',
    url: 'https://www.service-public.fr/particuliers/vosdroits/R35069',
  },
  { label: 'BOFIP — TVA travaux', url: 'https://bofip.impots.gouv.fr' },
]

const relatedGuides = [
  { label: 'Aides rénovation énergétique 2026', href: '/guides/aides-renovation-2026' },
  { label: 'MaPrimeRénov’ 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Éco-PTZ 2026', href: '/guides/eco-pret-taux-zero-2026' },
  { label: 'Acompte artisan', href: '/guides/acompte-artisan-legal-maximum' },
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
      'TVA 5,5 % travaux',
      'TVA réduite rénovation',
      'attestation simplifiée Cerfa 1301-SD',
      'TVA 5,5 conditions',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'TVA 5,5 %', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'TVA 5,5 %' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Calculator className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              TVA 5,5 % travaux : conditions 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La TVA à 5,5 % est l’avantage fiscal le plus méconnu de la rénovation énergétique.
              Voici les conditions strictes (logement &gt;2 ans, travaux performants, attestation
              simplifiée), la liste officielle des gestes éligibles et les pièges qui peuvent coûter
              un redressement fiscal.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Taux TVA applicables aux travaux</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Taux</th>
                    <th className="p-3 border-b border-sand-200">Cas d’application</th>
                    <th className="p-3 border-b border-sand-200">Condition clé</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['5,5 %', 'Rénovation énergétique performante', 'Logement >2 ans + RGE'],
                    ['10 %', 'Rénovation standard', 'Logement >2 ans, travaux non énergétiques'],
                    ['20 %', 'Construction neuve / gros œuvre', '<2 ans ou neuf'],
                  ].map(([t, c, k]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3">{c}</td>
                      <td className="p-3">{k}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Ne mélangez pas taux sur la même facture.</strong> Si isolation (5,5 %) +
                peinture (10 %) sur 1 chantier : 2 factures distinctes OU ventilation claire ligne
                par ligne. Sinon redressement fiscal automatique 10-40 % + intérêts moratoires.
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
              Artisans RGE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
