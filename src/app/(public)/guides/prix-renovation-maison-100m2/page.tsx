import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, AlertTriangle, Home, Calculator } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-renovation-maison-100m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Prix rénovation maison 100 m² 2026'
const DESCRIPTION =
  'Budget rénovation maison 100 m² 2026 : rafraîchissement 300-600 €/m², moyenne 700-1 200 €/m², complète 1 200-2 500 €/m². Prix par poste, aides.'

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
  'Rafraîchissement (peinture, sols, petite plomberie) : 30 000 à 60 000 € pour 100 m².',
  'Rénovation moyenne (cuisine + SDB + électricité partielle) : 70 000 à 120 000 €.',
  'Rénovation complète (tout corps d’état, isolation, chauffage) : 120 000 à 250 000 €.',
  'Prix au m² en 2026 (référence FFB/CAPEB) : 300-2 500 €/m² selon niveau.',
  'Aides mobilisables jusqu’à 35 000 € (MaPrimeRénov’ + CEE + éco-PTZ + TVA 5,5 %).',
]

const faqs = [
  {
    question: 'Quel budget pour rénover 100 m² entièrement ?',
    answer:
      "Pour une rénovation complète tous corps d'état (démolition, gros œuvre, isolation, électricité, plomberie, chauffage, cuisine, salle de bain, sols, peintures), comptez 1 200 à 2 500 €/m² en 2026, soit 120 000 à 250 000 € pour 100 m². Le prix varie selon l'état initial (maison des années 70 à remettre aux normes vs bâti en bon état à moderniser), les matériaux (entrée de gamme vs haut de gamme), la région (Île-de-France et PACA +15-25 % vs moyenne nationale) et le niveau de performance énergétique visé.",
  },
  {
    question: 'Quelle part pour la main-d’œuvre ?',
    answer:
      "En rénovation, la main-d'œuvre représente 50 à 65 % du budget total, fournitures 35 à 50 %. Sur une rénovation complète 100 m² à 150 000 €, compter 80 000-95 000 € de main-d'œuvre et 55 000-70 000 € de matériaux. Ratio atypique pour un projet : si la main-d'œuvre tombe <40 %, vérifiez la qualité des matériaux annoncés (probablement sous-estimés).",
  },
  {
    question: 'La TVA à 5,5 % s’applique-t-elle à toute la rénovation ?',
    answer:
      "Non. La TVA à 5,5 % concerne uniquement les travaux d'amélioration de la qualité énergétique dans des logements de plus de 2 ans (isolation, PAC, chaudière biomasse, fenêtres éligibles, régulation, audit énergétique). La TVA à 10 % s'applique aux autres travaux d'amélioration, d'entretien et de transformation dans un logement de plus de 2 ans. La TVA à 20 % s'applique au neuf et aux constructions neuves. Le devis doit ventiler les travaux par taux de TVA applicable.",
  },
  {
    question: 'Combien d’aides publiques peut-on cumuler ?',
    answer:
      "Pour un ménage aux revenus modestes (barème bleu), le cumul peut atteindre 35 000-40 000 € : MaPrimeRénov' Parcours accompagné (jusqu'à 70 % du coût, plafond 70 000 €), CEE « Coup de pouce », éco-PTZ jusqu'à 50 000 €, TVA 5,5 % (économie indirecte). Le Parcours accompagné (obligatoire au-dessus de 2 gestes performants) est piloté par un Accompagnateur Rénov' agréé qui vérifie la cohérence du projet et le parcours administratif.",
  },
  {
    question: 'Vaut-il mieux confier à un seul artisan ou à plusieurs corps de métier ?',
    answer:
      "Deux modèles coexistent. (1) Entreprise générale du bâtiment (EGB) ou artisan tous corps d'état : coordination simplifiée, un seul interlocuteur, prix majoré de 10-20 % pour la coordination. (2) Lots séparés (maçon + électricien + plombier + etc.) : prix plus compétitifs mais coordination par vous-même, délais potentiellement plus longs. Au-delà de 5 corps de métier, l'EGB ou la maîtrise d'œuvre (MOE) devient rentable et évite les malfaçons à l'interface entre lots.",
  },
  {
    question: 'Peut-on faire certains travaux soi-même ?',
    answer:
      'Oui sur les finitions : peintures intérieures, revêtements de sol stratifiés, meubles de cuisine en kit, pose de pare-vapeur, démolition légère de cloisons non porteuses. Économie possible : 15-25 % du budget total. À bannir : électricité (mise en danger, décennale inexistante), plomberie gaz (illégal sans PG), isolation pour dossier RGE (perte des aides), gros œuvre structurel (responsabilité décennale + risque effondrement).',
  },
  {
    question: 'Combien de temps dure un chantier de rénovation 100 m² ?',
    answer:
      "Rafraîchissement : 3-6 semaines. Rénovation moyenne : 2-4 mois. Rénovation complète tous corps d'état : 5-9 mois selon ampleur, disponibilité des entreprises, aléas (amiante, plomb, surprises gros œuvre). Prévoyez une marge de 20-30 % sur le planning initial : c'est la norme en rénovation.",
  },
  {
    question: 'Faut-il établir un plan de financement avant devis ?',
    answer:
      "Oui. Calculez votre capacité d'apport + prêt travaux + aides mobilisables AVANT les devis. Cela cadre le niveau de rénovation visé et évite de lancer un chantier non finançable. Faites simuler un éco-PTZ (banque) et MaPrimeRénov' (simulateur officiel) avant d'envoyer les demandes de devis — vous gagnez du temps et de la précision.",
  },
]

const sources = [
  { label: 'Baromètre FFB 2026 — Prix de la construction', url: 'https://www.ffbatiment.fr' },
  { label: 'CAPEB — Indices régionaux prix bâtiment', url: 'https://www.capeb.fr' },
  { label: 'ADEME — Coûts rénovation énergétique 2026', url: 'https://agir.ademe.fr' },
  { label: 'France Rénov’ — Barèmes MaPrimeRénov’ 2026', url: 'https://france-renov.gouv.fr' },
  {
    label: 'Insee — Indices des prix dans la construction',
    url: 'https://www.insee.fr/fr/statistiques/serie/010534998',
  },
]

const relatedGuides = [
  { label: 'Budget rénovation : combien coûtent vos travaux', href: '/guides/budget-renovation' },
  {
    label: 'Rénovation énergétique : guide complet',
    href: '/guides/renovation-energetique-complete',
  },
  { label: 'Extension de maison', href: '/guides/extension-maison' },
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Budget & Prix travaux',
    keywords: [
      'prix rénovation maison',
      'budget rénovation 100m2',
      'prix m2 rénovation',
      'coût travaux',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix rénovation maison 100 m²', url: `/guides/${SLUG}` },
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
              { label: 'Prix rénovation maison 100 m²' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Budget &amp; Prix · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prix rénovation maison 100 m² en 2026 : budget par niveau
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              « Combien coûte la rénovation d’une maison de 100 m² ? » — la réponse dépend surtout
              du niveau de rénovation visé, bien plus que de la surface. Voici les trois fourchettes
              de référence 2026 (rafraîchissement, rénovation moyenne, rénovation complète), le
              détail par poste, et les aides qui peuvent couvrir jusqu’à 35 000 € du budget.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 3 niveaux de rénovation et leur prix au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Niveau</th>
                    <th className="p-3 border-b border-sand-200">Ce qui est inclus</th>
                    <th className="p-3 border-b border-sand-200">Prix au m² TTC</th>
                    <th className="p-3 border-b border-sand-200">Total 100 m²</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Rafraîchissement</td>
                    <td className="p-3">
                      Peintures, sols stratifiés, petite plomberie, dépannages
                    </td>
                    <td className="p-3">300 à 600 €</td>
                    <td className="p-3 font-semibold">30 000 à 60 000 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Rénovation moyenne</td>
                    <td className="p-3">
                      Cuisine + salle de bain + électricité partielle + isolation ciblée
                    </td>
                    <td className="p-3">700 à 1 200 €</td>
                    <td className="p-3 font-semibold">70 000 à 120 000 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Rénovation complète</td>
                    <td className="p-3">
                      Tous corps d’état, isolation complète, chauffage, menuiseries
                    </td>
                    <td className="p-3">1 200 à 2 500 €</td>
                    <td className="p-3 font-semibold">120 000 à 250 000 €</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Rénovation lourde</td>
                    <td className="p-3">
                      Structure (murs porteurs, planchers, toiture), fondations, extension
                    </td>
                    <td className="p-3">2 500 à 4 000 €+</td>
                    <td className="p-3 font-semibold">250 000 à 400 000 €+</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Sources : Baromètre FFB 2026, CAPEB, indices Insee construction. Fourchettes hors
                TVA réduite et hors aides.
              </p>
            </div>

            <h2>Détail par poste (rénovation moyenne 100 m²)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200">Budget indicatif TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Démolition, dépose, évacuation', '3 000 à 6 000 €'],
                    ['Électricité (remise aux normes partielle)', '6 000 à 12 000 €'],
                    ['Plomberie + sanitaires', '6 000 à 15 000 €'],
                    ['Chauffage (remplacement générateur)', '8 000 à 15 000 €'],
                    ['Isolation combles ou murs (ciblée)', '4 000 à 12 000 €'],
                    ['Menuiseries intérieures', '3 000 à 8 000 €'],
                    ['Cuisine équipée', '6 000 à 20 000 €'],
                    ['Salle de bain', '5 000 à 15 000 €'],
                    ['Revêtements sols (50 m²)', '3 000 à 10 000 €'],
                    ['Peintures et finitions (200 m² de parois)', '4 000 à 9 000 €'],
                  ].map(([p, b]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Les aides qui réduisent le budget en 2026</h2>
            <ul>
              <li>
                <strong>MaPrimeRénov’ par geste</strong> : jusqu’à 5 000 € par geste selon revenus
                (PAC, isolation, fenêtres, etc.). Cumulable avec CEE.
              </li>
              <li>
                <strong>MaPrimeRénov’ Parcours accompagné</strong> : jusqu’à 70 000 € de travaux
                aidés, gain énergétique ≥35 % requis. Accompagnateur Rénov’ obligatoire.
              </li>
              <li>
                <strong>CEE / Coup de pouce</strong> : 2 000 à 5 000 € supplémentaires selon revenus
                et chantier.
              </li>
              <li>
                <strong>Éco-PTZ</strong> : prêt à taux zéro jusqu’à 50 000 € remboursable sur 20 ans
                pour rénovation d’ampleur.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur travaux énergétiques (chantier artisan RGE).
              </li>
              <li>
                <strong>Aides locales</strong> : région, département, intercommunalité. À vérifier
                auprès de France Rénov’.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Règle 2026.</strong> MaPrimeRénov’ Parcours accompagné exige désormais un
                Accompagnateur Rénov’ agréé dès 2 gestes performants. Ne signez pas de devis sans
                avoir validé le dossier côté Mon Accompagnateur Rénov’ — sinon l’aide peut être
                refusée rétroactivement.
              </p>
            </div>

            <h2>Exemple chiffré : maison 100 m² années 70, rénovation moyenne</h2>
            <ul>
              <li>Isolation combles + murs extérieurs par l’intérieur : 18 000 €</li>
              <li>PAC air-eau remplaçant chaudière fioul : 14 000 €</li>
              <li>Remplacement fenêtres double vitrage : 12 000 €</li>
              <li>Remise aux normes électricité : 8 000 €</li>
              <li>Cuisine neuve : 10 000 €</li>
              <li>Salle de bain refaite : 8 000 €</li>
              <li>Sols + peintures : 12 000 €</li>
              <li>
                <strong>Total TTC :</strong> 82 000 €
              </li>
              <li>
                <strong>Aides mobilisées :</strong> 28 500 € (MaPrimeRénov’ + CEE revenus
                intermédiaires)
              </li>
              <li>
                <strong>Reste à charge :</strong> 53 500 €
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Obtenir 3 devis personnalisés
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Décrivez votre projet, recevez jusqu’à 3 devis d’artisans RGE vérifiés sous
                    24-48 h, comparables ligne par ligne.
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
            <Link href="/devis" className="inline-flex items-center gap-1 hover:text-primary-700">
              Demander un devis <Home className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
