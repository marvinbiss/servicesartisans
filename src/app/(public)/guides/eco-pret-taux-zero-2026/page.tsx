import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'eco-pret-taux-zero-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Éco-PTZ 2026 : éco-prêt à taux zéro pour la rénovation énergétique'
const DESCRIPTION =
  'Éco-prêt à taux zéro 2026 : prêt jusqu’à 50 000 € sans intérêt pour rénovation énergétique. Conditions, plafonds par geste, banques, cumul avec MaPrimeRénov’.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Éco-PTZ : prêt sans intérêts (0 %) distribué par 13 banques partenaires, financé par l’État.',
  'Plafonds 2026 : 15 000 € pour un geste, 25 000 € pour 2 gestes, 50 000 € pour rénovation globale (gain ≥35 %).',
  'Éco-PTZ « Copropriétés » jusqu’à 50 000 € par logement pour travaux collectifs.',
  'Durée max : 20 ans (parcours ampleur), 15 ans (gestes), 10 ans (Performance énergétique DPE).',
  'Cumul MaPrimeRénov’ + CEE : oui, sans limitation. Revenus non pris en compte pour l’octroi.',
]

const faqs = [
  {
    question: 'Qu’est-ce que l’éco-PTZ ?',
    answer:
      "L'éco-prêt à taux zéro est un prêt bancaire sans intérêts financé par l'État français. Il finance jusqu'à 50 000 € de travaux de rénovation énergétique dans un logement résidentiel achevé depuis plus de 2 ans. Contrairement à MaPrimeRénov' qui est une aide, l'éco-PTZ est un prêt remboursable, mais sans coût d'intérêts — c'est l'État qui prend en charge les intérêts auprès de la banque via le crédit d'impôt.",
  },
  {
    question: 'Qui peut bénéficier de l’éco-PTZ ?',
    answer:
      "Conditions : (1) propriétaire occupant ou bailleur d'une résidence principale achevée depuis >2 ans ; (2) pas de plafond de revenus ; (3) acceptation du dossier par une banque partenaire ; (4) travaux réalisés par une entreprise RGE ; (5) travaux respectant les critères techniques fixés par arrêté. Le prêt est accordé par la banque selon sa propre analyse de solvabilité, comme un prêt classique.",
  },
  {
    question: 'Quelles banques distribuent l’éco-PTZ ?',
    answer:
      "Toutes les grandes banques françaises partenaires de la SGFGAS : BNP Paribas, Société Générale, Crédit Agricole, LCL, Banque Populaire, Caisse d'Épargne, Crédit Mutuel, CIC, La Banque Postale, HSBC, Crédit du Nord, Banque Populaire Caisse d'Épargne, Casden. Chaque banque a ses propres conditions d'octroi et peut refuser selon votre profil. Comparez 2-3 offres pour obtenir la meilleure durée.",
  },
  {
    question: 'Peut-on cumuler éco-PTZ et MaPrimeRénov’ ?',
    answer:
      "Oui, sans restriction. L'éco-PTZ finance le coût total des travaux (y compris la part couverte par MaPrimeRénov'). Concrètement : signature devis 30 000 €, MaPrimeRénov' 10 000 €, éco-PTZ 20 000 € sur 15 ans. L'emprunteur ne débourse rien à l'acompte et rembourse ensuite 20 000 € sur 15 ans sans intérêts. C'est le dispositif le plus puissant pour un ménage intermédiaire ne disposant pas de trésorerie.",
  },
  {
    question: 'Quelle est la durée de remboursement ?',
    answer:
      "Elle dépend du type de travaux. Action unique ou 2 actions : 15 ans maximum. Performance énergétique globale (rénovation lourde avec gain ≥35 %, réalisée par un bureau d'études) : 20 ans maximum. Rénovation DPE (F → D au minimum) : 20 ans maximum. Copropriétés : 20 ans maximum. Vous pouvez choisir une durée plus courte pour minimiser le montant financé.",
  },
  {
    question: 'Que se passe-t-il si on ne réalise pas les travaux dans les délais ?',
    answer:
      "Le bénéficiaire a 3 ans à compter de l'émission de l'offre de prêt pour réaliser les travaux. Si les délais ne sont pas respectés ou si les travaux ne sont pas conformes (pas RGE, factures non probantes), la banque peut réclamer le remboursement anticipé avec les intérêts. Le respect des conditions est vérifié sur la base des factures justificatives à remettre en fin de travaux.",
  },
]

const sources = [
  {
    label: 'Service-public.fr — Éco-PTZ',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F19905',
  },
  {
    label: 'SGFGAS — Société de Gestion des Financements et de la Garantie',
    url: 'https://www.sgfgas.fr',
  },
  {
    label: 'Décret n° 2022-454 du 30 mars 2022 — Éco-PTZ copropriétés',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'France Rénov’ — Éco-PTZ', url: 'https://france-renov.gouv.fr' },
]

const relatedGuides = [
  { label: 'Aides rénovation énergétique 2026', href: '/guides/aides-renovation-2026' },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  {
    label: 'Aide isolation maison propriétaire',
    href: '/guides/aide-isolation-maison-proprietaire',
  },
  { label: 'Prix rénovation maison 100 m²', href: '/guides/prix-renovation-maison-100m2' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Aides & Financement',
    keywords: ['éco-PTZ', 'éco-prêt taux zéro', 'prêt rénovation énergétique', 'banque éco-PTZ'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Éco-PTZ 2026', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Éco-PTZ 2026' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Aides &amp; Financement · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Éco-PTZ 2026 : éco-prêt à taux zéro pour rénovation énergétique
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’éco-prêt à taux zéro reste en 2026 le plus puissant levier pour financer la part
              non-subventionnée d’une rénovation énergétique&nbsp;: jusqu’à 50 000 € remboursables
              sur 20 ans, sans intérêts, sans condition de revenus, cumulable avec MaPrimeRénov’ et
              CEE. Voici les plafonds, conditions et banques partenaires.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Plafonds 2026 selon nature des travaux</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Nature</th>
                    <th className="p-3 border-b border-sand-200">Plafond</th>
                    <th className="p-3 border-b border-sand-200">Durée max</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1 action (ex: isolation combles)', '15 000 €', '15 ans'],
                    ['2 actions (ex: isolation + chauffage)', '25 000 €', '15 ans'],
                    ['3+ actions (bouquet)', '30 000 €', '15 ans'],
                    ['Rénovation globale (gain ≥35 %)', '50 000 €', '20 ans'],
                    ['Copropriétés', '50 000 € / logement', '20 ans'],
                    ['Rénovation DPE (F→D ou mieux)', '50 000 €', '20 ans'],
                    ['Assainissement non-collectif', '10 000 €', '15 ans'],
                  ].map(([n, p, d]) => (
                    <tr key={n} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{n}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Travaux éligibles — les 7 catégories</h2>
            <ul>
              <li>
                <strong>Isolation thermique performante</strong> de toitures, murs extérieurs,
                planchers bas.
              </li>
              <li>
                <strong>Remplacement fenêtres</strong> et parois vitrées donnant sur l’extérieur.
              </li>
              <li>
                <strong>Installation, régulation ou remplacement</strong> du système de chauffage ou
                de production d’eau chaude sanitaire performant.
              </li>
              <li>
                <strong>Installation chauffage ou ECS à partir d’énergies renouvelables</strong>
                (PAC, biomasse, solaire).
              </li>
              <li>
                <strong>Réhabilitation d’un système d’assainissement non collectif</strong> à bon
                fonctionnement environnemental.
              </li>
              <li>
                <strong>Rénovation énergétique globale</strong> d’une maison individuelle avec gain
                ≥35 % (bouquet de travaux).
              </li>
              <li>
                <strong>Rénovation DPE</strong> permettant d’atteindre au moins D au DPE.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Banque non obligée.</strong> Contrairement à MaPrimeRénov’ qui est une aide
                publique directe, l’éco-PTZ reste un prêt bancaire : la banque peut refuser votre
                dossier selon votre solvabilité (salaires, charges, endettement max 35 %). Négociez
                en parallèle d’un projet global si la situation financière est tendue.
              </p>
            </div>

            <h2>Procédure pour obtenir l’éco-PTZ</h2>
            <ol>
              <li>
                <strong>Obtention des devis.</strong> 3 devis signés par artisans RGE pour les
                gestes envisagés, mentionnant les caractéristiques techniques requises.
              </li>
              <li>
                <strong>Constitution du dossier.</strong> Formulaire éco-PTZ (type emprunteur + type
                entreprise), devis, justificatifs identité et propriété.
              </li>
              <li>
                <strong>Demande à la banque.</strong> Remise du dossier complet, étude de
                solvabilité classique. La banque peut demander d’autres garanties.
              </li>
              <li>
                <strong>Signature de l’offre de prêt.</strong> Délai de réflexion de 10 jours (Code
                consommation).
              </li>
              <li>
                <strong>Réalisation des travaux.</strong> Sous 3 ans après l’offre, par l’entreprise
                RGE retenue.
              </li>
              <li>
                <strong>Transmission des factures.</strong> Justificatifs à la banque pour déblocage
                final des fonds.
              </li>
            </ol>

            <h2>Cumul optimal 2026 : trois dispositifs</h2>
            <p>Configuration idéale pour une rénovation de 30 000 €, ménage intermédiaire&nbsp;:</p>
            <ul>
              <li>MaPrimeRénov’ Parcours accompagné (30 %) : 9 000 €</li>
              <li>CEE Coup de pouce + bonifications : 3 500 €</li>
              <li>Éco-PTZ pour le solde : 17 500 € remboursables sur 15 ans (~97 €/mois)</li>
              <li>Apport personnel : 0 €</li>
            </ul>
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
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Simuler mes aides <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
