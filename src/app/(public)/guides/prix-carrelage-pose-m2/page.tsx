import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Home, Calculator } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-carrelage-pose-m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Prix pose carrelage au m² 2026'
const DESCRIPTION =
  'Prix pose carrelage au m² 2026 : 30-80 €/m² pose simple, 50-120 €/m² motif complexe. Fourniture + pose + préparation. Grille par type et format.'

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
  'Pose simple droite : 30 à 50 €/m² TTC. Pose diagonale : 45 à 70 €/m². Motifs complexes : 60 à 120 €/m².',
  'Fourniture carrelage : 15 € (entrée gamme) à 120 €/m² (pierre naturelle, grand format).',
  'Total moyen posé TTC : 60 à 150 €/m² selon qualité et pose.',
  'Préparation support (ragréage, étanchéité SDB) : +10 à 25 €/m².',
  'Pour 20 m² salle de bain : 1 500 à 3 500 €. Pour 50 m² cuisine + séjour : 3 500 à 7 500 €.',
]

const faqs = [
  {
    question: 'Quel est le prix moyen pose carrelage au m² ?',
    answer:
      "En 2026, la pose seule (main-d'œuvre + colle + joints) coûte 30 à 50 €/m² TTC pour une pose droite standard. Pose diagonale : +30-50 %. Grand format (>60×60 cm) : +15-25 % pour manipulation. Pose en chevron ou motifs complexes : +60-100 %. En ajoutant le prix du carrelage (15-120 €/m² selon gamme) et la préparation du support, le total posé oscille entre 60 et 150 €/m².",
  },
  {
    question: 'Quelle différence entre pose droite et pose diagonale ?',
    answer:
      "Pose droite : carreaux alignés parallèlement aux murs, pose la plus simple, chute ~5-8 %. Pose diagonale : carreaux à 45°, plus esthétique, nécessite plus de découpes, chute 12-15 %, +30-50 % de main-d'œuvre. Pose en décalé (demi-carreau) : visuellement originale, chute 8-12 %, +15-25 %. Opus romain / chevron / motif : très esthétique, chute jusqu'à 20 %, +60-100 % de main-d'œuvre.",
  },
  {
    question: 'Quel type de carrelage pour quel usage ?',
    answer:
      'Sol pièces humides (SDB, cuisine) : grès cérame classe PEI IV-V, antidérapant R10-R11. Sol pièces à vivre : grès cérame PEI III-IV minimum. Sol terrasse extérieure : grès cérame 2 cm ou pierre naturelle antigel. Mur SDB/cuisine : faïence ou grès cérame faible épaisseur. Mur plus tendance : pierre naturelle, mosaïque, carreaux de ciment. Attention classe UPEC pour les pièces sollicitées (U=usure, P=poinçonnement, E=eau, C=chimie).',
  },
  {
    question: 'Faut-il prévoir un ragréage avant la pose ?',
    answer:
      "Le carrelage exige un support plan à 5 mm près sur 2 m. Ragréage léger (3-5 mm) : 10-15 €/m². Ragréage fort (5-20 mm) : 15-25 €/m². Sur dalle neuve : souvent pas nécessaire. Sur ancien carrelage : possible en primaire d'accrochage spécifique, sinon dépose (20-40 €/m²). Sur parquet : primaire + ragréage spécifique. Un artisan qui ne chiffre pas le ragréage dans un devis rénovation est à questionner.",
  },
  {
    question: 'Pose par un carreleur pro vs auto-entrepreneur : écart ?',
    answer:
      "Carreleur entreprise structurée avec décennale solide : 40-55 €/m² pose droite. Carreleur auto-entrepreneur : 30-45 €/m². Différence : la décennale du micro-entrepreneur couvre son activité mais sa capacité à indemniser est limitée par ses revenus. Pour un carrelage standard, pas d'enjeu. Pour un chantier >50 m² ou haut de gamme (pierre naturelle 5 m² à 150 €/m²), privilégiez l'entreprise avec références solides.",
  },
  {
    question: 'Quel délai pour poser 30 m² de carrelage ?',
    answer:
      'Préparation support (1 jour), ragréage + séchage (1-2 jours selon épaisseur), pose (2-3 jours selon complexité), séchage colle (24-48 h avant joints), joints + nettoyage (1 jour). Total : 5-8 jours calendaires pour 30 m² carrelage sol standard. Grand format ou motifs : +20-50 %. Avant remise en service des pièces : 48 h après jointoiement.',
  },
]

const sources = [
  { label: 'DTU 52.2 — Pose collée carrelage', url: 'https://boutique.afnor.org' },
  { label: 'CSTB — Classements UPEC', url: 'https://evaluation.cstb.fr' },
  { label: 'CAPEB — Prix travaux carrelage 2026', url: 'https://www.capeb.fr' },
  { label: 'Union Nationale du Carrelage', url: 'https://www.unecb.fr' },
]

const relatedGuides = [
  { label: 'Rénovation salle de bain', href: '/guides/renovation-salle-de-bain' },
  { label: 'Rénovation cuisine', href: '/guides/renovation-cuisine' },
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
    section: 'Prix & Revêtements',
    keywords: ['prix pose carrelage', 'pose carrelage m2', 'tarif carreleur', 'prix carrelage'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix pose carrelage au m²', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prix pose carrelage m²' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Revêtements
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix pose carrelage au m² en 2026 : la grille complète
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Poser du carrelage coûte entre 30 et 120 €/m² TTC en 2026 selon la complexité, hors
              fourniture. Ajoutez 15 à 120 €/m² pour le carrelage lui-même, et 10-25 €/m² pour la
              préparation du support, et vous obtenez 60 à 150 €/m² posé. Voici la grille complète
              par type de pose et format, et les points qui peuvent faire dérailler un devis trop
              beau pour être vrai.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix pose au m² selon type et difficulté</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de pose</th>
                    <th className="p-3 border-b border-sand-200">Complexité</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC /m²</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pose droite', 'Simple', '30 à 50 €'],
                    ['Pose décalée (demi-carreau)', 'Moyenne', '35 à 60 €'],
                    ['Pose diagonale (45°)', 'Moyenne', '45 à 70 €'],
                    ['Pose opus romain', 'Complexe', '60 à 90 €'],
                    ['Pose en chevron', 'Complexe', '70 à 100 €'],
                    ['Motifs / mosaïques sur mesure', 'Très complexe', '80 à 120 € et +'],
                    ['Grand format (>60×60)', 'Moyenne supplément', '+15-25 %'],
                    ['Pose murale SDB avec étanchéité', 'Moyenne', '45 à 75 €'],
                  ].map(([t, c, p]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3">{c}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes 2026, pose seule (main-d’œuvre + colle + joints), hors carrelage et hors
                préparation.
              </p>
            </div>

            <h2>Prix fourniture carrelage au m²</h2>
            <ul>
              <li>
                <strong>Grès cérame premier prix</strong> : 15-25 €/m² (grands magasins)
              </li>
              <li>
                <strong>Grès cérame milieu gamme</strong> : 25-50 €/m² (marques connues, format
                standard)
              </li>
              <li>
                <strong>Grès cérame effet bois/pierre/béton</strong> : 35-80 €/m²
              </li>
              <li>
                <strong>Grès cérame grand format</strong> (80×80 et +) : 50-120 €/m²
              </li>
              <li>
                <strong>Pierre naturelle</strong> (travertin, ardoise) : 60-150 €/m²
              </li>
              <li>
                <strong>Carreaux de ciment</strong> (authentiques) : 80-180 €/m²
              </li>
              <li>
                <strong>Mosaïque</strong> (verre, céramique, marbre) : 40-200 €/m²
              </li>
            </ul>

            <h2>Postes qui font gonfler la facture</h2>
            <ul>
              <li>
                <strong>Dépose ancien revêtement.</strong> 15-40 €/m² selon difficulté (carrelage
                collé à la colle, lino collé, parquet).
              </li>
              <li>
                <strong>Ragréage support.</strong> 10-25 €/m² selon épaisseur.
              </li>
              <li>
                <strong>Étanchéité SPEC</strong> (salles de bain) : 15-30 €/m² en plus de la pose.
              </li>
              <li>
                <strong>Plinthes.</strong> 15-25 €/ml posées.
              </li>
              <li>
                <strong>Chute matériaux.</strong> Comptez +5-8 % pose droite, +10-15 % diagonale,
                jusqu’à 20 % motifs.
              </li>
              <li>
                <strong>Transport / monte-charge.</strong> 100-400 € si étage sans ascenseur ou
                grande quantité.
              </li>
            </ul>

            <h2>Exemple chiffré — salle de bain 6 m² sol + 20 m² murs</h2>
            <ul>
              <li>Dépose ancien carrelage (26 m²) : 400-700 €</li>
              <li>Étanchéité SPEC zones critiques : 150-250 €</li>
              <li>Fourniture carrelage grès cérame milieu gamme : 900-1 500 €</li>
              <li>Pose droite (sol 6 m² + mur 20 m²) : 780-1 560 €</li>
              <li>Joints + colle + finitions : 200-350 €</li>
              <li>
                <strong>Total TTC :</strong> 2 430 à 4 360 €
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    3 devis carreleur comparés
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Demandez un devis carrelage à des artisans vérifiés près de chez vous : SIRET
                    actif, décennale couvrant l’activité, avis clients réels.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Demander un devis carrelage <ArrowRight className="w-4 h-4" aria-hidden />
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
            <Link href="/devis" className="inline-flex items-center gap-1 hover:text-primary-700">
              Demander un devis <Home className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
