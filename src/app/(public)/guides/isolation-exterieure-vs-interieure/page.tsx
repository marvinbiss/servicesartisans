import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'isolation-exterieure-vs-interieure'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'ITE vs ITI 2026 : prix, perf, aides'
const DESCRIPTION =
  'ITE vs ITI : comparatif prix au m², performance thermique, ponts thermiques, surface perdue, aides 2026, contraintes copropriété et urbanisme.'

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
  'ITE (par l’extérieur) : 110-230 €/m² TTC posée. Supprime ponts thermiques. Idéal ravalement combiné.',
  'ITI (par l’intérieur) : 50-130 €/m² TTC posée. Moins cher, perd 5-10 cm de surface, ponts thermiques subsistent.',
  'ITE plus aidée : MaPrimeRénov’ jusqu’à 75 €/m² + CEE ~15-25 €/m². ITI : 15-25 €/m² MPR + 10-15 €/m² CEE.',
  'ITE contraintes : autorisation urbanisme (DP), ABF possible en secteur protégé, pas toujours possible en copro.',
  'ITI contraintes : perte surface habitable, dépose radiateurs/prises, dégagement fenêtres à retravailler.',
]

const faqs = [
  {
    question: 'Quelle est la différence de prix entre ITE et ITI ?',
    answer:
      "Prix moyens 2026 posés TTC : ITI 50-130 €/m² (laine de verre ou PSE sur ossature bois + placoplâtre). ITE 110-230 €/m² (PSE sous enduit ou bardage ventilé). L'écart vient de l'échafaudage, de la protection façade et de la finition. Mais ITE est nettement plus aidée : MaPrimeRénov' jusqu'à 75 €/m² (profil Bleu) vs 25 €/m² pour ITI. Le reste à charge effectif est souvent équivalent.",
  },
  {
    question: 'Laquelle est la plus performante thermiquement ?',
    answer:
      'ITE reste supérieure thermiquement car elle supprime les ponts thermiques structurels (liaisons murs/planchers, refends, poutres). Une ITE 16 cm PSE graphité atteint R≥4,7 m²·K/W (classe A+). Une ITI 14 cm équivalent atteint R=3,7-4 m²·K/W mais laisse les ponts thermiques (10-30 % de déperditions résiduelles). Pour un bâtiment classé E-G au DPE, ITE permet souvent de gagner 2 classes vs 1 classe pour ITI.',
  },
  {
    question: 'Peut-on faire une ITE en copropriété ?',
    answer:
      "Oui mais compliqué. Vote en AG en majorité absolue (art. 25 loi 1965). Travaux collectifs = MaPrimeRénov' Copropriétés (25-45 % selon performance). Contraintes : harmonisation de l'aspect extérieur (règlement copro), autorisation d'urbanisme (DP), parfois consentement ABF (zones protégées). Coût proportionné sur un immeuble 20 lots : 150 000 €, reste à charge 60-90 k€ après aides, soit 3-4 500 €/lot.",
  },
  {
    question: 'Peut-on combiner ITE et ITI ?',
    answer:
      "Oui pour traiter les contraintes : ITE sur façades visibles + ITI sur un pignon en limite de propriété (où l'ITE déborde sur le terrain voisin). Combinaison aussi utile en rénovation lourde d'un appartement en R+1 dans un pavillon où seuls les étages supérieurs peuvent recevoir ITE. Attention : bien dimensionner pour éviter les ponts thermiques aux jonctions — demander étude thermique bureau d'études.",
  },
  {
    question: 'Quelle épaisseur d’isolant pour atteindre la RE2020 ?',
    answer:
      "ITE : 16-20 cm de PSE graphité (R≥4,7) ou 14-16 cm de laine de roche rigide. ITI : 14-16 cm de laine de verre/roche ou 12 cm de PSE. Rénovation énergétique globale visant gain 35 % DPE : viser R≥4 m²·K/W minimum (crédits MaPrimeRénov' conditionnés à cette performance). RE2020 = 20 cm ITE ou 16 cm ITI très performante. En région froide (H1a, montagne), ajouter 2-4 cm.",
  },
  {
    question: 'Quelles autorisations d’urbanisme pour une ITE ?',
    answer:
      "Déclaration préalable de travaux (DP) obligatoire en général car modification de façade (art. R421-17 Code urba). Délai instruction 1 mois. Dans un site patrimonial remarquable (ancien ZPPAUP) ou abords monument historique : avis ABF obligatoire, délai jusqu'à 4 mois, possibilité de refus. Dans un lotissement avec règlement : vérifier autorisation. ITI : aucune formalité urbanisme (travaux intérieurs).",
  },
]

const sources = [
  { label: 'France Rénov’ — Isolation', url: 'https://france-renov.gouv.fr/aides/isolation' },
  {
    label: 'ADEME — Isolation des murs par l’extérieur',
    url: 'https://agirpourlatransition.ademe.fr',
  },
  { label: 'Qualibat 5911 — ITE', url: 'https://www.qualibat.com' },
  { label: 'Article R421-17 Code urbanisme — DP façade', url: 'https://www.legifrance.gouv.fr' },
]

const relatedGuides = [
  {
    label: 'Aide isolation maison propriétaire',
    href: '/guides/aide-isolation-maison-proprietaire',
  },
  { label: 'Prix isolation combles 100 m²', href: '/guides/prix-isolation-combles-100m2' },
  { label: 'MaPrimeRénov’ copropriété', href: '/guides/maprimerenov-copropriete' },
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
    section: 'Travaux spécialisés',
    keywords: ['ITE vs ITI', 'isolation extérieure', 'isolation intérieure', 'prix ITE'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'ITE vs ITI', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'ITE vs ITI' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Travaux spécialisés · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Isolation extérieure vs intérieure : comparatif détaillé 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              ITE ou ITI ? Pour une rénovation énergétique efficace, le choix entre isolation par
              l’extérieur et par l’intérieur dépend de votre budget, de la performance visée, des
              contraintes d’urbanisme et de la surface que vous pouvez accepter de perdre.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Comparatif point par point</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">ITE</th>
                    <th className="p-3 border-b border-sand-200">ITI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Prix m² posé TTC', '110-230 €', '50-130 €'],
                    ['Aide MaPrimeRénov’ (Bleu)', '75 €/m²', '25 €/m²'],
                    ['Ponts thermiques', 'Supprimés', 'Subsistants'],
                    ['Perte surface', 'Zéro', '5-10 cm/mur'],
                    ['Durée chantier 100 m²', '3-5 semaines', '2-3 semaines'],
                    ['Habitable pendant travaux', 'Oui', 'Non'],
                    ['Autorisation urbanisme', 'DP obligatoire', 'Aucune'],
                    ['Effet esthétique façade', 'Ravalement inclus', 'Aucun'],
                    ['Copropriété', 'Vote AG', 'Accord propriétaire'],
                  ].map(([c, ite, iti]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{ite}</td>
                      <td className="p-3">{iti}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Quand choisir ITE</h2>
            <ul>
              <li>Maison individuelle avec ravalement à refaire → combinaison rentable.</li>
              <li>Projet de rénovation énergétique globale (gain ≥35 % DPE).</li>
              <li>Pas de contrainte urbanisme (hors secteur ABF).</li>
              <li>Conservation surface habitable prioritaire.</li>
              <li>Immeuble en copropriété avec accord collectif (MPR Copro).</li>
            </ul>

            <h2>Quand choisir ITI</h2>
            <ul>
              <li>Budget serré ou travaux ciblés (1 à 3 pièces).</li>
              <li>Secteur protégé ABF refusant l’ITE.</li>
              <li>Logement occupé par un bailleur (ITE trop complexe).</li>
              <li>Rénovation d’un pignon seul (impossible en ITE).</li>
              <li>Projet d’aménagement intérieur incluant cloisons neuves.</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Pièges à éviter en ITI.</strong> Ponts thermiques non traités (murs de
                refend, dalles intermédiaires) = condensation, moisissures derrière l’isolant.
                Prévoir pare-vapeur hermétique, bandes de jonction à chaque angle, VMC hygro B ou
                double flux. Traiter systématiquement le pourtour des baies (linteaux, appuis).
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
              href="/services/isolation-thermique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un pro ITE/ITI <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
