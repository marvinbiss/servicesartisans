import type { Metadata } from 'next'
import Link from 'next/link'
import { Snowflake, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'classe-energie-f-interdite-2028'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Classe énergie F : interdite 2028'
const DESCRIPTION =
  'Logements F : interdiction location au 1er janvier 2028. Impact, dérogations, sanctions, travaux à faire, aides 2026 pour atteindre E ou D.'

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
  '1er janvier 2028 : interdiction de location pour tout logement F (331-450 kWhEP/m²/an).',
  '1,3 M de logements F loués en France. Concentration : Paris, Hauts-de-France, Normandie.',
  'Bail en cours : continue jusqu’à son terme ; pas de renouvellement ni nouveau bail après 2028.',
  'Propriétaires bailleurs concernés : 2 ans pour rénover (fin 2026 démarrage, fin 2027 livraison).',
  'Montée F → E coûte ~15-25 k€ TTC type isolation+fenêtres. F → D = 30-45 k€ (plus aidé).',
]

const faqs = [
  {
    question: 'Puis-je continuer à louer mon F après 2028 ?',
    answer:
      "Non pour un nouveau bail (primo-locataire ou remplacement). Oui pour un bail en cours (poursuite jusqu'à expiration). À l'échéance (3 ou 6 ans selon type de bail), le propriétaire devra soit rénover pour atteindre E minimum, soit libérer le logement. Le loyer ne peut plus être révisé à la hausse depuis 2023 pour les G et dès 2025 pour les F. Tacite reconduction : encore autorisée pour bail initial avant 2028, mais contestée en jurisprudence récente.",
  },
  {
    question: 'Quelles sanctions si je loue quand même ?',
    answer:
      "Art. L173-2 CCH : le locataire peut saisir le juge d'instance pour obtenir gratuitement la réalisation des travaux par le propriétaire (bailleur) + dommages-intérêts. Demande recevable tout au long du bail. Amende administrative possible DGCCRF jusqu'à 15 000 € en cas de récidive. Le bail peut aussi être considéré comme nul si conclu sciemment après l'interdiction. Sur-marché locatif tendu, les plaintes se multiplient.",
  },
  {
    question: 'Combien coûte monter un F en E ?',
    answer:
      'Travaux typiques pour remonter 1 classe DPE (F→E) : isolation combles ~4 000 €, isolation murs partiel (ITI murs Nord/Ouest) ~7-12 k€, remplacement 6 fenêtres DV ~8-12 k€, total ~19-28 k€ TTC. Aides 2026 profil Bleu-Jaune : MPR parcours accompagné 50-60 % = 10-17 k€ + CEE 4 k€ + TVA 5,5 %. Reste à charge réel 5-10 k€. Si investissement locatif, amortissable sur 8-10 ans via hausse loyer post-travaux + déficit foncier imputable.',
  },
  {
    question: 'Y a-t-il des exceptions prévues pour 2028 ?',
    answer:
      "Oui, décret 2024-1143 du 4 décembre 2024 : exemptions accordées pour (1) monuments historiques et logements situés aux abords (500 m ABF) si les travaux d'isolation dénaturent l'aspect patrimonial, (2) contraintes techniques majeures avérées (impossibilité d'isoler par l'intérieur sans perdre de surface habitable, impossibilité d'ITE faute de règles copro), (3) coût travaux >50 % de la valeur du bien. Dossier à déposer en Préfecture avec audit énergétique justifiant la dérogation.",
  },
  {
    question: 'Comment s’y prendre dès maintenant ?',
    answer:
      "Calendrier recommandé : mi-2026 audit énergétique + inscription « Mon Accompagnateur Rénov' » + dépôt MaPrimeRénov' en ligne. Fin 2026 : 3 devis RGE + Coup de pouce CEE. Début 2027 : signature devis, réservation aides. Printemps 2027 : début travaux (artisans complets 6 mois d'avance). Été 2027 : livraison. Automne 2027 : nouveau DPE validation classe E ou D. Objectif : être en règle début 2028. Attendre 2027 pour commencer = risque de pénurie d'artisans + hausse des prix.",
  },
  {
    question: 'Et en copropriété ?',
    answer:
      "Complexe : les parties communes (enveloppe) relèvent d'un vote AG. Difficile pour un propriétaire seul de faire isoler la façade sans majorité. Stratégie : lancer un projet collectif MaPrimeRénov' Copropriétés (25-45 % des travaux) + plan pluriannuel de travaux (PPT obligatoire 2024+). Un bailleur isolé peut au moins réaliser ITI sur son propre appartement pour compléter. Le DPE collectif obligatoire (2024-2026 selon taille immeuble) oblige souvent la copro à se poser la question.",
  },
]

const sources = [
  { label: 'Loi Climat Résilience — Art. L173-2 CCH', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Décret 2024-1143 — Exceptions rénovation', url: 'https://www.legifrance.gouv.fr' },
  {
    label: 'Service-public.fr — Interdiction location passoire',
    url: 'https://www.service-public.fr',
  },
  { label: 'ANIL — Conseil aux propriétaires', url: 'https://www.anil.org' },
]

const relatedGuides = [
  { label: 'DPE mauvais que faire', href: '/guides/dpe-mauvais-que-faire' },
  { label: 'Passoire thermique rénovation', href: '/guides/passoire-thermique-renovation' },
  { label: 'MaPrimeRénov’ parcours accompagné', href: '/guides/maprimerenov-parcours-accompagne' },
  { label: 'Éco-PTZ 2026', href: '/guides/eco-pret-taux-zero-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Rénovation énergétique',
    keywords: ['classe énergie F interdite', 'F interdit 2028', 'DPE F location', 'passoire F'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Classe F interdite 2028', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Classe F interdite 2028' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Snowflake className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Classe énergie F : interdite à la location au 1er janvier 2028
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Si vous louez un logement classé F au DPE (331-450 kWhEP/m²/an), vous avez jusqu’à fin
              2027 pour le rénover. Au 1er janvier 2028, la location d’un F sera interdite pour tout
              nouveau bail. Voici ce que cela implique concrètement.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Calendrier interdiction location (récapitulatif)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Classe</th>
                    <th className="p-3 border-b border-sand-200">Interdiction</th>
                    <th className="p-3 border-b border-sand-200">Logements concernés</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['G+', 'Déjà en cours depuis 2023', '~200 000'],
                    ['G', '1er janvier 2025', '~600 000 loués'],
                    ['F', '1er janvier 2028', '~1,3 M loués'],
                    ['E', '1er janvier 2034', '~2,6 M loués'],
                  ].map(([c, d, l]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3 font-semibold">{d}</td>
                      <td className="p-3">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Chiffrage travaux type F → E ou D</h2>
            <ul>
              <li>F → E (1 classe) : 15-25 k€ TTC (isolation + fenêtres, sans chauffage).</li>
              <li>F → D (2 classes) : 30-45 k€ TTC (isolation + fenêtres + chauffage).</li>
              <li>F → C (3 classes) : 50-75 k€ TTC (rénovation globale).</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention saturation marché 2027.</strong> Avec 1,3 M de logements F
                concernés, les plannings artisans seront saturés dès fin 2026. Commencer dès 2026 =
                choix large, prix négociés, aides complètes. Attendre 2027 = risques de pénurie,
                dépassements de délai, dérapages budgétaires.
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
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Simuler mes aides <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
