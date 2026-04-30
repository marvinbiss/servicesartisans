import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'devis-facture-mentions-obligatoires'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Devis et facture : mentions 2026'
const DESCRIPTION =
  'Devis travaux >150 € obligatoire. Facture >1 500 € obligatoire. Mentions art. R111-3 Code conso + art. 289 CGI. Sanctions absence. Modèles.'

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
  'Devis obligatoire dès 150 € TTC (art. R111-3 Code consommation) ou à simple demande du client. Gratuit, sauf mention contraire écrite.',
  'Facture obligatoire dès 25 € si demandée, systématique dès 1 500 € TTC (art. 289 CGI + L441-9 Code commerce).',
  '12 mentions essentielles sur devis : identités, SIRET, RC pro, date, détail prestations, quantités, prix unitaires, TVA, délais, signatures.',
  'Facture = 15 mentions : en plus du devis, n° facture chronologique, date livraison, conditions paiement, pénalités retard, IB recouvrement 40 €.',
  'Sanctions absence : amende 75 000 € (personne morale), 1 500 € sanction CCRF simple, refus de paiement légitime par le client.',
]

const faqs = [
  {
    question: 'Un devis est-il toujours obligatoire ?',
    answer:
      'Pas toujours, mais dans 3 cas OUI : (1) Montant travaux ≥150 € TTC (art. R111-3 Code consommation) — obligatoire avant toute intervention ; (2) À simple demande écrite du client, quel que soit le montant ; (3) Travaux de rénovation énergétique avec aides (MPR, CEE, TVA 5,5 %) — obligatoire pour le montage du dossier quelle que soit la somme. Hors ces cas : devis recommandé pour traçabilité mais non obligatoire (ex : dépannage <150 € sans demande écrite). Le devis est GRATUIT sauf mention écrite contraire avec préavis ≥48 h (art. L111-1 Code consommation) — « devis payant 80 € » facturable si accepté par écrit avant visite.',
  },
  {
    question: 'Quelles sont les 12 mentions obligatoires d’un devis ?',
    answer:
      "Art. R111-3 Code consommation + arrêté 2 mars 1990 : (1) Date de rédaction ; (2) Identité + adresse + SIRET entreprise ; (3) Identité + adresse client ; (4) Adresse du chantier si différente ; (5) Descriptif détaillé prestations (matériaux, main-d'œuvre, quantités) ; (6) Prix unitaires HT et TTC ; (7) Taux et montant TVA (5,5, 10 ou 20 %) ; (8) Total HT, total TTC ; (9) Date de début et durée prévisionnelle des travaux ; (10) Modalités de paiement (acompte, échéances, solde) ; (11) Durée de validité du devis (typique 30-90 j) ; (12) Mention « bon pour accord » manuscrite + signature du client à l'acceptation. Mention additionnelle si démarchage : 14 jours rétractation.",
  },
  {
    question: 'Quelles sont les mentions obligatoires d’une facture ?',
    answer:
      "Art. 289 CGI + L441-9 Code commerce — 15 mentions cumulatives : (1) Date d'émission ; (2) Numéro unique chronologique ; (3) Identité + SIRET prestataire ; (4) N° TVA intracommunautaire si concerné ; (5) Identité client complète ; (6) Date de livraison / fin travaux ; (7) Désignation précise des travaux réalisés ; (8) Quantités et prix unitaire HT ; (9) Réduction/remise éventuelle ; (10) Taux TVA et montant ; (11) Total HT, TVA, TTC ; (12) Conditions de paiement (délais, modalités) ; (13) Pénalités de retard (taux légal ou contractuel) ; (14) Indemnité forfaitaire recouvrement 40 € (art. D441-5 Code commerce) ; (15) Mention « facture acquittée » si payée comptant. Mention RGE obligatoire si travaux énergétiques (Qualibat, QualiPAC + n°).",
  },
  {
    question: 'Quelles sanctions pour un devis ou une facture non conforme ?',
    answer:
      "Niveaux de sanctions cumulables : (1) DGCCRF : amende administrative 3 000 € (personne physique), 15 000 € (personne morale) pour manquement mentions obligatoires, jusqu'à 75 000 € récidive ; (2) Client : peut refuser le paiement tant que la facture n'est pas conforme (art. 1219 Code civil, exception d'inexécution) ; (3) Fiscal : redressement TVA + majoration 40 % si non-conformité masquée ; (4) Civil : nullité du contrat possible pour dol si mentions trompeuses ; (5) Pénal : si fraude caractérisée (faux et usage de faux art. 441-1 Code pénal) — 3 ans prison + 45 000 € amende. Défense client : LRAR demandant correction sous 15 j, puis refus paiement, puis signalement DGCCRF.",
  },
  {
    question: 'Peut-on contester un devis signé mais incorrect ?',
    answer:
      'Oui dans plusieurs cas. (1) Démarchage à domicile : 14 jours de rétractation de plein droit (art. L221-18 Code conso), LRAR simple avec formulaire joint au devis ; (2) Mentions obligatoires manquantes (SIRET, décennale, détail prestations) : annulation possible tribunal + dommages-intérêts ; (3) Prix final différent du devis signé >10 % : refus du différentiel sauf modification acceptée par LRAR contradictoire ; (4) Vice du consentement (dol, erreur, violence) : nullité à tout moment pendant 5 ans (art. 1130 Code civil) — nécessite preuves ; (5) Travaux non conformes au descriptif : refus réception + droit à reprise + dommages. Conseil : ne JAMAIS signer un devis flou ou oral. Exiger tout par écrit + signature + date + conservation copie.',
  },
]

const sources = [
  {
    label: 'Art. R111-3 Code consommation — Devis',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032225941',
  },
  {
    label: 'Art. 289 CGI — Facturation',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044989926',
  },
  {
    label: 'Art. L441-9 Code commerce — Facturation',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Service-public.fr — Mentions devis', url: 'https://www.service-public.fr' },
  { label: 'DGCCRF — Règles devis facture', url: 'https://www.economie.gouv.fr/dgccrf' },
]

const relatedGuides = [
  { label: 'Devis travaux : guide', href: '/guides/devis-travaux' },
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
  { label: 'Faux devis détecter signaler', href: '/guides/faux-devis-detecter-signaler' },
  { label: 'Refuser un devis signé', href: '/guides/refuser-devis-artisan-signe' },
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
      'mentions obligatoires devis',
      'mentions obligatoires facture',
      'devis conforme 2026',
      'art R111-3 Code consommation',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Mentions obligatoires', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Mentions obligatoires' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <FileText className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Devis et facture 2026 : mentions obligatoires
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un devis ou une facture non conforme peut être refusé par le client et sanctionné par
              la DGCCRF. Voici les 12 mentions d’un devis valide, les 15 mentions d’une facture
              légale et les sanctions en cas d’omission jusqu’à 75 000 €.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Seuils devis et facture 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Montant TTC</th>
                    <th className="p-3 border-b border-sand-200">Devis obligatoire</th>
                    <th className="p-3 border-b border-sand-200">Facture obligatoire</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['< 25 €', 'Non (sauf demande)', 'Non (sauf demande)'],
                    ['25 - 150 €', 'Non (sauf demande)', 'Si demande client'],
                    ['150 - 1 500 €', 'OUI', 'Si demande client'],
                    ['> 1 500 €', 'OUI', 'OUI systématique'],
                    ['Travaux RGE/MPR/CEE', 'OUI tous montants', 'OUI tous montants'],
                  ].map(([m, d, f]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3 font-semibold">{d}</td>
                      <td className="p-3">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Devis oral = pas de devis.</strong> Un engagement verbal n’est pas opposable
                en tribunal. Exiger TOUJOURS un devis écrit signé avant tout versement d’acompte ou
                début de travaux. Même en urgence : photo SMS du devis signé suffit comme preuve.
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
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              Autres guides <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
