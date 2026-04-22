import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, ShowerHead, Calculator } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-renovation-salle-bain-4m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Prix rénovation salle de bain 4 m² 2026'
const DESCRIPTION =
  'Budget SDB 4 m² 2026 : rafraîchissement 2 500-5 000 €, complète 6 000-12 000 €, haut de gamme 12 000-20 000 €. Détail par poste et aides.'

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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Rafraîchissement (peinture + sanitaires remplacés) : 2 500 à 5 000 €.',
  'Rénovation complète (dépose + plomberie + carrelage + mobilier) : 6 000 à 12 000 €.',
  'Haut de gamme (douche italienne design, marbre, robinetterie premium) : 12 000 à 20 000 €.',
  'Adaptation PMR (handicap/autonomie) : surcoût 1 500-3 500 €, aides ANAH possibles.',
  'Durée typique d’un chantier 4 m² : 2 à 4 semaines selon complexité.',
]

const faqs = [
  {
    question: 'Quel budget réel pour une salle de bain 4 m² ?',
    answer:
      'Budget médian constaté 2026 : 7 000-9 000 € pour une rénovation complète (dépose, plomberie, carrelage sol+mur, douche italienne + WC suspendu + meuble vasque + robinetterie standard, peinture plafond). Rafraîchissement uniquement : 3 000-4 500 €. Haut de gamme (douche design, carrelage effet pierre, meuble sur mesure, robinetterie thermostatique) : 12 000-20 000 €. Surface supérieure (6-8 m²) : +30-50 %.',
  },
  {
    question: 'Quelle part pour la main-d’œuvre ?',
    answer:
      "Sur une rénovation complète, main-d'œuvre 50-60 %, fournitures 40-50 %. Pour 8 000 € TTC : 4 500-5 000 € main-d'œuvre, 3 000-3 500 € fournitures. Ratio atypique : si main-d'œuvre descend sous 40 %, vérifiez si dépose, plomberie cachée et finitions sont bien comprises. Si elle monte à 70 %, vérifiez la qualité des sanitaires (probablement entrée de gamme masquée).",
  },
  {
    question: 'Douche à l’italienne : surcoût ?',
    answer:
      "Douche à l'italienne (receveur extra-plat ou plancher étanche avec pente) : +1 500-3 500 € vs douche classique. Demande étanchéité stricte (SPEC + natte d'étanchéité sous carrelage), pente calculée (1-2 %), évacuation adaptée (siphon de sol Ø 40-50 mm). Pose par un carreleur expérimenté uniquement. Performance et esthétique supérieures, mais faute d'étanchéité fréquentes chez les amateurs.",
  },
  {
    question: 'Quelles aides pour rénover une salle de bain ?',
    answer:
      "Rénovation standard : TVA 10 % (logement >2 ans). Adaptation PMR/senior/handicap : MaPrimeAdapt' (jusqu'à 70 % du coût selon revenus, maximum 22 000 €) + CAF/caisses retraite. Rénovation énergétique (remplacement chauffe-eau par chauffe-eau thermodynamique) : MaPrimeRénov' CET + CEE jusqu'à 1 500 €. Aides locales variables : vérifiez en mairie et auprès de France Rénov'.",
  },
  {
    question: 'Vaut-il mieux appeler une entreprise tous corps d’état ou plusieurs artisans ?',
    answer:
      "Pour 4 m², l'entreprise tous corps d'état est presque toujours le bon choix : 1 interlocuteur, coordination facilitée, délai maîtrisé, prix comparable au regroupement de 4 artisans une fois ajouté le coût coordination. Les artisans indépendants en chaîne (plombier puis carreleur puis peintre) conviennent pour rénovations légères ou si vous coordonnez vous-même, mais délais allongés de 30-50 %.",
  },
  {
    question: 'Combien de temps dure une rénovation de salle de bain ?',
    answer:
      'Rénovation complète 4 m² : 2-3 semaines. Jour 1-2 : dépose + évacuation. Jour 3-5 : plomberie + électricité + petits travaux maçonnerie. Jour 6-8 : pose carrelage sol + mur. Jour 9-10 : pose sanitaires + meuble + robinetterie. Jour 11-13 : finitions + joints + peinture. Jour 14-15 : nettoyage + mise en service + réception. Rafraîchissement simple : 1 semaine.',
  },
]

const sources = [
  { label: 'CAPEB — Prix travaux salle de bain 2026', url: 'https://www.capeb.fr' },
  { label: 'ANAH — MaPrimeAdapt’ 2026', url: 'https://www.anah.gouv.fr' },
  { label: 'DTU 43.1 — Étanchéité sol salles d’eau', url: 'https://boutique.afnor.org' },
  { label: 'ADEME — Chauffe-eau thermodynamique', url: 'https://agir.ademe.fr' },
]

const relatedGuides = [
  { label: 'Rénovation salle de bain : étapes et prix', href: '/guides/renovation-salle-de-bain' },
  { label: 'Prix pose carrelage au m²', href: '/guides/prix-carrelage-pose-m2' },
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
  { label: 'Comment demander un devis de travaux', href: '/guides/comment-faire-devis-travaux' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & Rénovation',
    keywords: [
      'prix rénovation salle de bain',
      'rénovation SDB 4m2',
      'douche italienne prix',
      'budget SDB',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix rénovation SDB 4 m²', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prix rénovation SDB 4 m²' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Rénovation
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prix rénovation salle de bain 4 m² en 2026 : budget complet
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Rénover une salle de bain de 4 m² coûte entre 2 500 € (rafraîchissement léger) et 20
              000 € (haut de gamme) en 2026, tous corps d’état. Le budget médian pour une rénovation
              complète sans fioriture oscille entre 7 000 et 9 000 €. Voici le détail par poste, les
              surcoûts à anticiper (douche italienne, adaptation handicap) et les aides existantes.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille 2026 par niveau de rénovation</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Niveau</th>
                    <th className="p-3 border-b border-sand-200">Inclus</th>
                    <th className="p-3 border-b border-sand-200">Budget TTC</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {[
                    [
                      'Rafraîchissement',
                      'Sanitaires remplacés, peinture, joints, robinetterie',
                      '2 500 à 5 000 €',
                    ],
                    [
                      'Rénovation partielle',
                      'Douche ou baignoire refaite, carrelage partiel',
                      '4 500 à 7 500 €',
                    ],
                    [
                      'Rénovation complète',
                      'Dépose totale, plomberie, carrelage sol+mur, mobilier',
                      '6 000 à 12 000 €',
                    ],
                    [
                      'Haut de gamme',
                      'Douche italienne, robinetterie premium, matériaux design',
                      '12 000 à 20 000 €',
                    ],
                    [
                      'PMR / adapt. senior',
                      'Douche sécurisée, barres, siège, porte élargie',
                      'Surcoût 1 500 à 3 500 €',
                    ],
                  ].map(([n, i, b]) => (
                    <tr key={n} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{n}</td>
                      <td className="p-3">{i}</td>
                      <td className="p-3">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Détail par poste — rénovation complète 4 m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200">Budget TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Dépose + évacuation (1 jour)', '300 à 600 €'],
                    ['Plomberie neuve (arrivées + évacuations)', '800 à 1 800 €'],
                    ['Électricité (éclairage, prise, VMC)', '400 à 900 €'],
                    ['Étanchéité SPEC + préparation support', '300 à 600 €'],
                    ['Carrelage sol (4 m²) + mur (18 m²)', '1 500 à 3 200 €'],
                    ['Douche italienne ou cabine', '800 à 2 500 €'],
                    ['WC (suspendu ou au sol)', '400 à 1 200 €'],
                    ['Meuble vasque + vasque + robinetterie', '600 à 1 800 €'],
                    ['Peinture + faïence finale + joints', '400 à 800 €'],
                    ['Nettoyage + mise en service', '150 à 300 €'],
                  ].map(([p, b]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Ce qui peut faire varier le prix ±30 %</h2>
            <ul>
              <li>
                <strong>Qualité des sanitaires.</strong> Entre une vasque basique à 80 € et une
                vasque haut de gamme à 600 €, l’écart se cumule sur 5-6 produits.
              </li>
              <li>
                <strong>Accessibilité du chantier.</strong> Étage sans ascenseur, emplacement,
                évacuation gravats : +500-1 500 €.
              </li>
              <li>
                <strong>Reprise plomberie cachée.</strong> Tuyaux vétustes à changer dans le mur
                (plomb, cuivre oxydé) : +600-1 500 €.
              </li>
              <li>
                <strong>Choix de carrelage et format.</strong> Grand format ou motif : +15-35 % sur
                poste carrelage.
              </li>
              <li>
                <strong>Normes électriques</strong>. Remise aux normes circuits : +400-1 000 €.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    3 devis rénovation SDB
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Entreprises tous corps d’état ou artisans spécialisés, vérifiés et assurés.
                    Comparaison ligne par ligne.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Demander mes devis <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
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
              Trouver un plombier <ShowerHead className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
