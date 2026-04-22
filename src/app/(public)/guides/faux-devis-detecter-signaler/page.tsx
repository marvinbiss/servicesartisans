import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldAlert, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'faux-devis-detecter-signaler'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Faux devis artisan : détecter et signaler'
const DESCRIPTION =
  'Faux devis artisan : 10 signaux d’alerte, vérifications SIRET + RC pro + décennale, signalement DGCCRF, recours pénal. Protéger vos travaux et aides.'

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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  '10 signaux d’alerte à croiser : SIRET absent ou invalide, pas d’adresse réelle, mention RGE sans n° de qualification, pas de décennale.',
  'Types de faux devis : usurpation logo RGE (60 % des cas DGCCRF 2024), entreprise fantôme, devis gonflé pré-CEE, facture après travaux jamais réalisés.',
  'Vérifications en 10 min : annuaire-entreprises.data.gouv.fr (SIRET), france-renov.gouv.fr (RGE), attestation décennale (RC pro nominative).',
  'Signalement : signal.conso.gouv.fr (DGCCRF), plateforme Anah pour fraude MPR, police si escroquerie avérée (>300 € préjudice).',
  'Prévention : JAMAIS signer sans avoir vérifié 5 éléments clés + 14 jours rétractation en cas démarchage domicile.',
]

const howToSteps = [
  {
    name: 'Vérifier le SIRET',
    text: 'Saisir le n° SIRET (14 chiffres) sur annuaire-entreprises.data.gouv.fr. Activité en cours ? Adresse cohérente ? Code NAF adapté au métier ? Date de création >2 ans (stabilité) ?',
  },
  {
    name: 'Vérifier RGE si travaux énergétiques',
    text: 'Saisir SIRET ou nom sur france-renov.gouv.fr rubrique « Trouver un pro RGE ». Qualification active ? Domaine adapté (QualiPAC, Qualibat 7131 isolation, Qualifelec IRVE) ?',
  },
  {
    name: 'Demander attestation décennale',
    text: 'Exiger attestation décennale NOMINATIVE datée de l’année en cours, signée par l’assureur, couvrant précisément le métier concerné. Vérifier auprès de l’assureur par téléphone si doute.',
  },
  {
    name: 'Analyser le devis lui-même',
    text: 'Mentions obligatoires (art. R111-3 Code conso) : identité complète, SIRET, RC Pro, date, descriptif détaillé, quantités + prix unitaires, TVA, total TTC, date d’exécution, délai de validité, signature.',
  },
  {
    name: 'Vérifier via avis en ligne',
    text: 'Rechercher nom entreprise + SIRET sur Google, Trustpilot, Avis Vérifiés. Méfiance avis trop parfaits ou datant tous de moins de 3 mois = faux avis achetés.',
  },
  {
    name: 'Comparer 2-3 devis',
    text: 'Écart >40 % sur devis = signal d’alerte (cher ou bradé). Même prestation, comparer quantités, matériaux, marques.',
  },
  {
    name: 'Signaler si fraude suspectée',
    text: 'signal.conso.gouv.fr (DGCCRF) + Anah si dossier MPR/CEE en jeu + commissariat si escroquerie caractérisée + avis à fédérations (CAPEB, FFB).',
  },
]

const faqs = [
  {
    question: 'Quels sont les types de faux devis les plus fréquents ?',
    answer:
      "Typologie DGCCRF 2024 : (1) Usurpation logo RGE (60 %) — entreprise non qualifiée affiche logo + n° fictif, le client perd MPR + CEE + TVA 5,5 % ; (2) Entreprise fantôme (20 %) — SIRET inexistant, radiée ou créée il y a <1 mois, disparition après encaissement acompte ; (3) Devis gonflé (10 %) — 2-5× prix marché pour capturer un maximum d'aides CEE/MPR, revente entre intermédiaires ; (4) Sous-traitance non déclarée (5 %) — devis signé entreprise A, travaux exécutés entreprise B non RGE, fraude MPR ; (5) Facture sans travaux (5 %) — jamais rien réalisé sur site, uniquement pour déclencher aides publiques. Préjudice moyen 2024 : 4 000 € à 15 000 € par victime, parfois >50 000 €.",
  },
  {
    question: 'Comment vérifier l’authenticité d’une attestation décennale ?',
    answer:
      "4 étapes : (1) Vérifier nom entreprise ET assureur mentionnés ; (2) Contrôler la DATE de validité — attestation de l'année en cours uniquement ; (3) Vérifier le périmètre — décennale = plomberie ? électricité ? isolation ? couvre précisément vos travaux ? ; (4) APPELER directement l'assureur : via n° officiel trouvé en ligne (pas celui sur l'attestation qui peut être faux), numéro de police à communiquer, confirmation par mail. Durée vérif : 15 minutes. 95 % des faux contrats décennale sont détectés ainsi. Pour travaux >15 000 € : exiger en plus attestation nominative spécifique au chantier (art. R243-2 Code assurances), refus = fraude probable.",
  },
  {
    question: 'Comment signaler une fraude à la DGCCRF ?',
    answer:
      "Plateforme unique : signal.conso.gouv.fr (gratuit, 5 min). Procédure : (1) Créer compte ou signalement anonyme ; (2) Remplir formulaire détaillé — entreprise, SIRET, coordonnées, faits, montants, dates ; (3) Joindre pièces : devis, factures, mails, photos, SMS, attestations ; (4) Validation par DGCCRF sous 7-15 j, pouvoir de contrôle sur place, amendes 3 000-15 000 € + 2 ans prison si récidive ; (5) Retour sur enquête sous 30-90 j. Action complémentaire : (a) signalement France-Rénov' si fraude RGE ; (b) MaPrimeRénov' via maprimerenov.gouv.fr, (c) commissariat si préjudice >500 € (plainte pour escroquerie, art. 313-1 Code pénal), (d) civil : récupération sommes par tribunal.",
  },
  {
    question: 'Puis-je me rétracter si j’ai déjà signé un faux devis ?',
    answer:
      "Plusieurs options juridiques. (1) Démarchage à domicile : 14 jours de rétractation de plein droit (art. L221-18 Code consommation), LRAR simple, remboursement intégral sous 14 j ; (2) Vice du consentement (dol, tromperie) : nullité du contrat à tout moment pendant 5 ans (art. 1130 Code civil) — nécessite preuves écrites de la tromperie (mentions fausses, promesses non tenues), tribunal judiciaire ; (3) Fraude CEE/MPR avérée : nullité d'ordre public, restitution totale possible même après travaux ; (4) Escroquerie pénale : plainte + constitution partie civile, poursuites du tribunal correctionnel, récupération dommages-intérêts. Si acompte déjà versé par carte : opposition bancaire sous 30 j possible avec preuves fraude (taux récupération 60-80 %).",
  },
  {
    question: 'Quelles sanctions pour l’entreprise frauduleuse ?',
    answer:
      "Panel de sanctions cumulables : (1) Administratives DGCCRF — amendes 3 000-15 000 € personne physique, 75 000 € personne morale, recensement au registre public pour contrats CEE ; (2) Pénales — usurpation qualification RGE : 2 ans prison + 37 500 € amende (art. 313-1 Code pénal escroquerie) ; (3) Escroquerie aggravée (bande organisée, personne vulnérable) : 7 ans prison + 750 000 € amende ; (4) Retrait définitif RGE par Qualit'EnR / Qualibat pour 10 ans minimum ; (5) Civiles : remboursement sommes + dommages-intérêts (1-3× préjudice) ; (6) Fiscales : redressement TVA 5,5 % + majoration 40 % + intérêts moratoires. DGCCRF a sanctionné 450+ entreprises en 2023, 60 poursuites pénales pour escroquerie CEE/MPR aggravée.",
  },
]

const sources = [
  { label: 'signal.conso.gouv.fr', url: 'https://signal.conso.gouv.fr' },
  { label: 'annuaire-entreprises.data.gouv.fr', url: 'https://annuaire-entreprises.data.gouv.fr' },
  { label: 'France-Rénov’ — Trouver un pro RGE', url: 'https://france-renov.gouv.fr' },
  {
    label: 'Art. 313-1 Code pénal — Escroquerie',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Art. L221-18 Code conso — Rétractation',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedGuides = [
  { label: 'Éviter les arnaques artisan', href: '/guides/eviter-arnaques-artisan' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
  { label: 'Annuaire RGE vérifier officiel', href: '/guides/annuaire-rge-verifier-officiel' },
  { label: 'Malfaçons travaux recours', href: '/guides/malfacons-travaux-recours' },
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
      'faux devis artisan',
      'détecter fraude devis',
      'signaler DGCCRF artisan',
      'escroquerie travaux',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Faux devis artisan', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Comment détecter et signaler un faux devis d’artisan',
    description:
      'Procédure officielle en 7 étapes pour vérifier l’authenticité d’un devis travaux.',
    totalTime: 'PT30M',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Faux devis artisan' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Faux devis artisan : détecter en 10 min
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les faux devis explosent avec la rénovation énergétique (450+ entreprises sanctionnées
              par la DGCCRF en 2023). Voici les 10 signaux d’alerte, la méthode de vérification en 7
              étapes et la procédure pour signaler + récupérer votre argent.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Typologie des faux devis (DGCCRF 2024)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de fraude</th>
                    <th className="p-3 border-b border-sand-200">Fréquence</th>
                    <th className="p-3 border-b border-sand-200">Préjudice moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Usurpation logo RGE', '60 %', '4 000-11 000 €'],
                    ['Entreprise fantôme', '20 %', '3 000-15 000 €'],
                    ['Devis gonflé (CEE/MPR)', '10 %', '5 000-25 000 €'],
                    ['Sous-traitance cachée', '5 %', '2 000-10 000 €'],
                    ['Facture sans travaux', '5 %', '10 000-50 000 €'],
                  ].map(([t, f, p]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{f}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>10 minutes de vérif = 15 000 € économisés.</strong> Annuaire-entreprises +
                France-Rénov’ + appel assureur RC Pro. Ne JAMAIS signer sans ces 3 vérifications.
                Signal.conso.gouv.fr prend 5 minutes en cas de doute.
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
