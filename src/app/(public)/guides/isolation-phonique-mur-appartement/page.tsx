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

const SLUG = 'isolation-phonique-mur-appartement'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Isolation phonique mur appart : prix 2026'
const DESCRIPTION =
  'Isolation phonique mur appartement : contre-cloison masse-ressort-masse, plaques acoustiques, liège, budget 80-180 €/m² TTC. Solutions efficaces 2026.'

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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Principe clé : loi masse-ressort-masse. 2 parois lourdes + absorbant entre = meilleur affaiblissement.',
  'Contre-cloison acoustique pro : 80-180 €/m² posée. Affaiblissement +15-25 dB (-80 % perception).',
  'Panneaux collés décoratifs : 25-60 €/m² mais affaiblissement modeste +3-8 dB (pas de miracle <50 €/m²).',
  'Sources sonores : bruit aérien (voix, musique), bruit impact (pas, chaises), bruit équipement (plomberie).',
  'Diagnostic acoustique par BE : 250-600 €, mesure Rw dB, identifie pont phonique exact.',
]

const faqs = [
  {
    question: 'Combien coûte une isolation phonique de mur ?',
    answer:
      "Contre-cloison acoustique professionnelle avec ossature désolidarisée + laine minérale haute densité + 2 plaques BA13 Phonic : 80-180 €/m² TTC posée. Performance visée : +20 dB d'affaiblissement (division perception par 4). Option premium : double ossature indépendante + plaques Fermacell = 150-280 €/m². Solution économique DIY : plaques polystyrène acoustique 20-50 €/m² fourniture seule mais performance limitée à +3-8 dB. Ne croyez pas aux « mousses miracles » 30 €/m² : marketing.",
  },
  {
    question: 'La mousse alvéolaire fait-elle office d’isolant phonique ?',
    answer:
      "Non. La mousse alvéolaire (type boîte d'oeufs, mousse « studio ») absorbe la réverbération DANS la pièce (effet echo) mais laisse passer l'énergie sonore vers la pièce voisine. C'est un traitement acoustique intérieur, pas une isolation. Différence : absorption (Rw interne) ≠ transmission (Rw entre pièces). Pour bloquer le bruit vers voisin : masse + ressort + masse. La mousse sert pour studios, home cinéma, où le but est de stopper la réverbération interne.",
  },
  {
    question: 'Peut-on isoler phoniquement sans perdre trop de surface ?',
    answer:
      "Compromis : contre-cloison légère 7-8 cm d'épaisseur totale = -8 cm surface habitable, +15-18 dB. Contre-cloison standard 10-12 cm = -12 cm, +20-25 dB. Solution minimale sans perte : plaque acoustique collée 2-3 cm = +3-8 dB (faible). Solution maximale sans limite : double cloison indépendante 20 cm = +30-40 dB (studio enregistrement). Choix selon usage : chambre enfant qui pleure = 15 dB suffisant, télétravail = 20-25 dB idéal.",
  },
  {
    question: 'Les plaques Placoplatre Phonique suffisent-elles ?',
    answer:
      'BA13 Phonique (plaque plâtre renforcée densité +30 %) apporte +3-5 dB vs BA13 standard. Seule (simplement vissée sur cloison existante) : effet limité. Vraiment efficace en configuration masse-ressort-masse : ossature désolidarisée + laine minérale 45-70 kg/m³ + BA13 Phonique = combo recommandé. Variantes : Fermacell (+2 dB vs Placo), Placo Duo (2 couches pré-assemblées, +8 dB). Avantage Placo Phonique : même prix que BA13 standard +10 %, donc upgrade logique.',
  },
  {
    question: 'Quelles aides pour une isolation phonique ?',
    answer:
      "Aides principales : (1) Éco-PTZ pour bouquet travaux si isolation thermique associée, (2) TVA 5,5 % sur pose par artisan RGE si logement >2 ans, (3) aides locales (région Île-de-France, Grand Lyon) parfois 500-1 500 € sur travaux acoustique face à aéroport/autoroute, (4) en copro : plan pluriannuel travaux (PPT) peut financer collectivement l'isolation phonique des planchers. MaPrimeRénov' ne finance PAS l'isolation phonique seule — uniquement thermique.",
  },
]

const sources = [
  {
    label: 'Arrêté 30 juin 1999 — Performances acoustiques',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'CSTB — Guide acoustique du bâtiment', url: 'https://www.cstb.fr' },
  { label: 'Qualitel — Label Acoustique', url: 'https://www.qualitel.org' },
  { label: 'Ademe — Bruit et confort acoustique', url: 'https://agirpourlatransition.ademe.fr' },
]

const relatedGuides = [
  { label: 'Isolation thermique', href: '/guides/isolation-thermique' },
  { label: 'Isolation combles', href: '/guides/isolation-combles' },
  { label: 'Pont thermique maison traitement', href: '/guides/pont-thermique-maison-traitement' },
  { label: 'Travaux en copropriété', href: '/guides/travaux-copropriete' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Problèmes maison',
    keywords: [
      'isolation phonique mur',
      'insonoriser mur appartement',
      'bruit voisin mur',
      'masse-ressort-masse',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Isolation phonique mur appartement', url: `/guides/${SLUG}` },
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
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Isolation phonique mur appartement' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Problèmes maison · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Isolation phonique mur appartement : solutions 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Bruit de voisinage insoutenable ? Le vrai pouvoir d’un mur phoniquement isolé se
              mesure en dB d’affaiblissement. Voici les techniques validées, les budgets réels, et
              les pièges marketing à éviter.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Affaiblissement dB vs perception</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Gain dB</th>
                    <th className="p-3 border-b border-sand-200">Perception</th>
                    <th className="p-3 border-b border-sand-200">Solution</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['+3 dB', 'Perceptible', 'Plaques collées 25 €/m²'],
                    ['+10 dB', 'Divisé par 2', 'Panneaux liège 50 €/m²'],
                    ['+15 dB', 'Divisé par 3', 'Placo Phonic + laine'],
                    ['+20 dB', '/4 (très calme)', 'Masse-ressort-masse'],
                    ['+30 dB', 'Studio', 'Double ossature indép.'],
                  ].map(([g, p, s]) => (
                    <tr key={g} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{g}</td>
                      <td className="p-3">{p}</td>
                      <td className="p-3">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>Le bon combo pour mur mitoyen</h2>
            <ul>
              <li>
                <strong>Ossature métallique M48 désolidarisée</strong> du mur existant (visser sur
                bande résiliente).
              </li>
              <li>
                <strong>Laine minérale acoustique</strong> 45 mm, densité ≥70 kg/m³ (ne pas
                comprimer).
              </li>
              <li>
                <strong>2 plaques BA13</strong> (1 standard + 1 Phonique) croisées en décalé.
              </li>
              <li>
                <strong>Joint mastic acoustique</strong> au pourtour (plafond, sol, murs
                perpendiculaires).
              </li>
              <li>
                <strong>Pas de traversées non traitées</strong> (prises = points faibles, boîtes
                acoustiques).
              </li>
            </ul>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Mur mitoyen en copropriété.</strong> Généralement partie commune à
                jouissance privative. Travaux intérieurs ne nécessitent PAS de vote AG tant qu’il
                n’y a pas modification structurelle. Notifier syndic par courrier avec plan +
                entreprise retenue avant chantier.
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
              href="/services/platrier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un plâtrier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
