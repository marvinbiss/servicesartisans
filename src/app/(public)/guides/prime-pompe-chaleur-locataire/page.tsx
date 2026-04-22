import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Leaf, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prime-pompe-chaleur-locataire'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Prime PAC locataire 2026 : qui touche'
const DESCRIPTION =
  'Prime PAC locataire 2026 : seul le propriétaire peut toucher MaPrimeRénov’ + CEE. Règles, exceptions, montage tripartite, logements sociaux.'

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
  'MaPrimeRénov’ : réservée aux propriétaires (occupants ou bailleurs) — jamais au locataire directement.',
  'CEE / Coup de pouce : la prime peut bénéficier au locataire si c’est lui qui signe et paye les travaux avec accord écrit du propriétaire.',
  'Propriétaire bailleur : MaPrimeRénov’ « bailleurs » jusqu’à 3 logements, plafond 28 000 €/logement pour parcours accompagné.',
  'En copropriété : MaPrimeRénov’ Copropriétés via le syndic, pour parties communes.',
  'Locataire motivé : négociez avec le bailleur un accord tripartite — tous en sortent gagnants.',
]

const faqs = [
  {
    question: 'Un locataire peut-il toucher MaPrimeRénov’ ?',
    answer:
      "Non. MaPrimeRénov' est réservée aux propriétaires : propriétaires occupants, propriétaires bailleurs, copropriétés via le syndic. Le locataire n'est pas éligible, même s'il paye lui-même les travaux, même s'il a l'accord du bailleur. Si un commercial laisse entendre le contraire, c'est une fraude. La seule aide publique accessible directement au locataire pour un chauffage est, sous conditions, la prime CEE Coup de pouce.",
  },
  {
    question: 'Le locataire peut-il toucher le Coup de pouce Chauffage ?',
    answer:
      "Oui, mais sous conditions strictes. Le locataire doit : (1) obtenir l'accord écrit du propriétaire autorisant les travaux (article 7 e) loi du 6 juillet 1989) ; (2) payer directement le chantier ; (3) signer la convention CEE à son nom avec le signataire choisi ; (4) recevoir lui-même la prime. En pratique, peu de locataires investissent sur un logement qu'ils louent : la négociation avec le bailleur est presque toujours nécessaire.",
  },
  {
    question: 'Comment négocier l’installation avec le bailleur ?',
    answer:
      "Le bailleur a intérêt à la rénovation : valorisation du bien, conformité aux obligations énergétiques (interdictions locatives F et G entre 2025-2034), baisse des charges si attirant mieux-entretenu. Proposez-lui : MaPrimeRénov' Bailleurs (jusqu'à 5 000 € PAC air-eau) + CEE Coup de pouce (jusqu'à 5 000 €) = couverture 60-80 % du chantier. Contre-partie locataire possible : engagement de rester X années, acceptation du travail pendant occupation.",
  },
  {
    question: 'Qu’est-ce que MaPrimeRénov’ Bailleurs ?',
    answer:
      "Depuis 2021, MaPrimeRénov' est ouverte aux propriétaires bailleurs pour leur résidence locative. Plafonds : jusqu'à 3 logements par bailleur, 28 000 € de travaux/logement pour un parcours accompagné, ou cumul des aides par geste. Contrepartie obligatoire : maintien en location 5 ans minimum à un loyer respectant les plafonds, non-augmentation excessive du loyer, information du locataire.",
  },
  {
    question: 'Logement social et pompe à chaleur : quelles aides ?',
    answer:
      "Les bailleurs sociaux (OPH, ESH, SEM) bénéficient d'aides spécifiques : Fonds chaleur (ADEME), FEDER, prêts PAM/PAHL de la Caisse des Dépôts, subventions régionales. MaPrimeRénov' classique n'est pas leur canal principal. Si vous êtes locataire en HLM, demandez au bailleur social son plan stratégique patrimoine (PSP) : il contient les rénovations programmées. Déposer une demande d'intervention via le service client du bailleur est la bonne approche.",
  },
  {
    question: 'Qui peut faire valider l’accord propriétaire-locataire ?',
    answer:
      "Un simple échange écrit (e-mail daté, lettre RAR) suffit juridiquement. Le contenu doit préciser : description des travaux, entreprise retenue (SIRET, RGE), plan de financement, durée, impact sur l'occupation, devenir de l'installation à la fin du bail. Pour une PAC, il est recommandé de mentionner que l'installation reste attachée au logement (accessoire), sauf clause contraire. En cas de doute, une consultation ADIL gratuite (ADIL = Agences Départementales d'Information sur le Logement) sécurise le montage.",
  },
]

const sources = [
  {
    label: 'Loi n° 89-462 du 6 juillet 1989 (article 7)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000509310',
  },
  { label: 'France Rénov’ — MaPrimeRénov’ Bailleurs', url: 'https://france-renov.gouv.fr' },
  { label: 'ANIL/ADIL — Information logement', url: 'https://www.anil.org' },
  { label: 'ADEME — Fonds chaleur', url: 'https://agir.ademe.fr' },
]

const relatedGuides = [
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Coup de pouce Chauffage 2026', href: '/guides/coup-de-pouce-chauffage-2026' },
  { label: 'Prix PAC air-eau installée', href: '/guides/prix-pompe-chaleur-air-eau-installee' },
  { label: 'MaPrimeRénov’ copropriété', href: '/guides/maprimerenov-copropriete' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Aides & Location',
    keywords: [
      'prime PAC locataire',
      'MaPrimeRénov locataire',
      'aide PAC bailleur',
      'rénovation logement loué',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prime PAC locataire', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prime PAC locataire' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Leaf className="w-3.5 h-3.5" aria-hidden />
              Aides &amp; Location · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prime pompe à chaleur pour un locataire : qui touche, qui paye
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              MaPrimeRénov’ reste réservée aux propriétaires. Mais un locataire a tout de même
              plusieurs leviers pour installer une pompe à chaleur avec le maximum d’aides&nbsp;:
              montage tripartite avec le bailleur, prime CEE locataire directe ou aide spécifique en
              logement social. Voici les règles précises et les montages à proposer à votre
              propriétaire.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qui touche quelle aide en 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Aide</th>
                    <th className="p-3 border-b border-sand-200">Propriétaire occupant</th>
                    <th className="p-3 border-b border-sand-200">Propriétaire bailleur</th>
                    <th className="p-3 border-b border-sand-200">Locataire</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {[
                    ['MaPrimeRénov’ par geste', 'Oui', 'Oui (bailleurs)', 'Non'],
                    ['MaPrimeRénov’ Parcours accompagné', 'Oui', 'Oui', 'Non'],
                    ['CEE / Coup de pouce', 'Oui', 'Oui', 'Oui (avec accord bailleur)'],
                    ['Éco-PTZ', 'Oui', 'Oui', 'Non'],
                    ['TVA 5,5 %', 'Oui', 'Oui', 'Oui'],
                    ['Aide ANAH « Habiter Mieux »', 'Oui (sous conditions)', 'Oui', 'Non'],
                  ].map(([a, po, pb, l]) => (
                    <tr key={a} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{a}</td>
                      <td className="p-3">{po}</td>
                      <td className="p-3">{pb}</td>
                      <td className="p-3">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Le montage gagnant-gagnant bailleur-locataire</h2>
            <p>Face à un bailleur indécis, un argumentaire structuré est souvent efficace&nbsp;:</p>
            <ul>
              <li>
                <strong>Pour le bailleur.</strong> MaPrimeRénov’ Bailleurs + Coup de pouce CEE
                couvrent jusqu’à 10 000 € sur PAC à 14 000 €. Plus-value bien entre +3-8 %, sortie
                du risque classe F/G (interdit à la location en 2025-2034).
              </li>
              <li>
                <strong>Pour le locataire.</strong> Baisse des charges de 30-60 % (fioul remplacé
                par PAC), confort supérieur été/hiver, prolongement probable du bail.
              </li>
              <li>
                <strong>Contrepartie possible.</strong> Engagement sur durée (3-5 ans), acceptation
                du chantier en occupation, participation symbolique aux frais non couverts.
              </li>
            </ul>

            <h2>Les aides spécifiques du propriétaire bailleur</h2>
            <ul>
              <li>
                <strong>MaPrimeRénov’ Bailleurs par geste</strong> : mêmes barèmes que PO, 3
                logements maximum par bailleur, engagement de location 6 ans.
              </li>
              <li>
                <strong>MaPrimeRénov’ Parcours accompagné bailleurs</strong> : jusqu’à 63 % des
                travaux sur 28 000 € plafond, gain énergétique ≥ 35 %.
              </li>
              <li>
                <strong>Dispositif Loc’Avantages</strong> (ex-Cosse) : réduction d’impôt 15-65 % du
                loyer en échange d’une location abordable.
              </li>
              <li>
                <strong>Exonération de taxe foncière</strong> (délibération commune), 50 à 100 %
                pendant 3-5 ans pour logement à haute performance énergétique.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Interdictions locatives 2025-2034.</strong> Depuis le 1ᵉʳ janvier 2025, les
                logements classés G au DPE ne peuvent plus être remis en location. Interdiction
                étendue à la classe F en 2028, puis E en 2034. Un bailleur qui refuse toute
                rénovation énergétique s’expose à une impossibilité de louer sous quelques années.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                Trouver un artisan RGE pour proposer un devis au bailleur
              </p>
              <p className="text-sm md:text-base text-sand-700 mb-3">
                Un devis concret (SIRET, RGE, simulation aides) est le meilleur argument pour
                convaincre. Lancez 3 devis et transmettez-les à votre propriétaire.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
              >
                Obtenir 3 devis PAC <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
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
            <Link href="/devis" className="inline-flex items-center gap-1 hover:text-primary-700">
              Demander un devis <Euro className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
