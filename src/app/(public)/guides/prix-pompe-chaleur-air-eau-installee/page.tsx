import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Leaf, Calculator, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-pompe-chaleur-air-eau-installee'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Prix PAC air-eau installée 2026'
const DESCRIPTION =
  'Prix PAC air-eau installée 2026 : 10 000-18 000 € TTC hors aides selon puissance et modèle. MaPrimeRénov’ + CEE jusqu’à 9 000 €. Grille complète.'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix moyen TTC posé en 2026 : 10 000 à 18 000 € selon puissance et modèle.',
  'PAC 8-10 kW (maison 100-130 m² RT 2012) : 11 000-14 000 € TTC posé.',
  'PAC 12-14 kW (maison 150-180 m² mal isolée) : 14 000-18 000 € TTC posé.',
  'Aides 2026 : jusqu’à 5 000 € MaPrimeRénov’ + 4 000 € Coup de pouce CEE = 9 000 € cumul.',
  'Impératif RGE QualiPAC valide à la date de signature pour accéder aux aides.',
]

const faqs = [
  {
    question: 'Quel est le vrai prix d’une PAC air-eau posée en 2026 ?',
    answer:
      "10 000 à 18 000 € TTC pour l'ensemble : unité extérieure, unité intérieure (hydraulique), installation, mise en service, garanties. Entrée de gamme marques chinoises 10-12 000 €, milieu de gamme (Daikin, Mitsubishi, Atlantic, Viessmann) 13-16 000 €, haut de gamme (Viessmann, Stiebel Eltron, Nibe) 16-22 000 €. Écart entre devis : typiquement 10-20 % à configuration équivalente.",
  },
  {
    question: 'Pourquoi les prix varient autant ?',
    answer:
      "Quatre facteurs principaux. (1) Puissance thermique (kW) : dépend du bilan déperditions (G) de la maison. (2) COP (coefficient de performance) : plus il est élevé, plus la PAC consomme moins d'électricité. (3) Configuration hydraulique : remplacement d'une chaudière avec adaptation du réseau radiateurs existants vs création d'un plancher chauffant neuf. (4) Adaptation électrique : un tableau à reprendre ajoute 500-1 500 €.",
  },
  {
    question: 'Quelles aides en 2026 pour une PAC air-eau ?',
    answer:
      "MaPrimeRénov' par geste : 2 000 à 5 000 € selon revenus (barème bleu/jaune/violet/rose). Coup de pouce CEE chauffage : 2 500 à 4 000 €. Cumul jusqu'à 9 000 € pour ménages modestes. TVA à 5,5 % si chantier confié à un artisan RGE QualiPAC (économie ~15 % vs TVA 20 %). Éco-PTZ possible jusqu'à 15 000 € pour compléter.",
  },
  {
    question: 'Faut-il obligatoirement passer par un artisan RGE ?',
    answer:
      "Oui pour bénéficier des aides publiques et de la TVA 5,5 %. L'artisan doit être titulaire de la qualification RGE QualiPAC en cours de validité à la date de signature du devis. Vérifiez sur france-renov.gouv.fr/annuaire-rge. Sans RGE, aucune aide, TVA à 20 %, écart de coût net pouvant dépasser 9 000 €.",
  },
  {
    question: 'Quelle est la durée de vie d’une PAC air-eau ?',
    answer:
      "15 à 20 ans pour les modèles professionnels correctement entretenus. L'entretien annuel est obligatoire (décret 2020-912) : vérification circuit frigorifique, électrique, nettoyage unité extérieure. Coût entretien 150-250 €/an. Une panne majeure (compresseur) après 12-15 ans peut coûter 2 000-4 000 € : à peser contre un remplacement complet.",
  },
  {
    question: 'La PAC fonctionne-t-elle quand il gèle ?',
    answer:
      "Oui, jusqu'à -15 à -25 °C selon modèles. À très basse température, le COP chute (de ~3,5 à 7 °C à ~2,0 à -10 °C), d'où la consommation électrique qui augmente en pointe de froid. Un appoint électrique ou bois est recommandé en zones H1 très froides (est, montagne). Les PAC « grand froid » spécialisées couvrent -25 °C sans appoint.",
  },
]

const sources = [
  { label: 'ADEME — Guide pompes à chaleur 2026', url: 'https://agir.ademe.fr' },
  { label: 'France Rénov’ — Barèmes MaPrimeRénov’ PAC 2026', url: 'https://france-renov.gouv.fr' },
  {
    label: 'AFPAC — Association française pour les pompes à chaleur',
    url: 'https://www.afpac.org',
  },
  { label: 'Qualit’EnR — Annuaire QualiPAC', url: 'https://www.qualit-enr.org' },
]

const relatedGuides = [
  { label: 'Pompe à chaleur : guide complet', href: '/guides/pompe-a-chaleur' },
  {
    label: 'PAC 2026 : aides CEE + MaPrimeRénov’',
    href: '/guides/pompe-a-chaleur-cee-maprimerenov-2026',
  },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & Rénovation énergétique',
    keywords: [
      'prix pompe à chaleur air-eau',
      'PAC air-eau prix',
      'PAC installée',
      'prix PAC 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix PAC air-eau installée', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prix PAC air-eau installée' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Rénovation énergétique
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prix d’une pompe à chaleur air-eau installée en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, une PAC air-eau installée coûte entre 10 000 et 18 000 € TTC hors aides, tout
              compris (équipement, pose, mise en service, garanties). Avec les aides MaPrimeRénov’
              et CEE, le reste à charge peut descendre à 3 000-9 000 € pour un ménage éligible.
              Voici la grille 2026 par puissance, les facteurs qui font varier les devis et le piège
              du « prix à 1 € » à éviter.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille de prix 2026 PAC air-eau installée</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Puissance</th>
                    <th className="p-3 border-b border-sand-200">Maison type</th>
                    <th className="p-3 border-b border-sand-200">Fourchette TTC posée</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {[
                    ['6-8 kW', 'Maison 80-100 m² bien isolée RT 2012', '9 500 à 12 500 €'],
                    ['8-10 kW', 'Maison 100-130 m² RT 2012', '11 000 à 14 000 €'],
                    ['10-12 kW', 'Maison 130-160 m² moyennement isolée', '12 500 à 16 000 €'],
                    ['12-14 kW', 'Maison 150-180 m² peu isolée', '14 000 à 18 000 €'],
                    ['14-16 kW', 'Maison 180-220 m² ou mal isolée', '16 000 à 22 000 €'],
                  ].map(([kw, m, p]) => (
                    <tr key={kw} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{kw}</td>
                      <td className="p-3">{m}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes moyennes nationales 2026, hors aides et hors cas particuliers
                (adaptation plancher chauffant neuf, relève chaudière pour multi-énergie).
              </p>
            </div>

            <h2>Ce qu’un devis PAC complet doit inclure</h2>
            <ul>
              <li>Bilan thermique préalable (G, déperditions, puissance cible)</li>
              <li>Unité extérieure et module hydraulique intérieur (marque, modèle, COP, SCOP)</li>
              <li>Raccordement hydraulique + frigorifique + électrique</li>
              <li>Mise en service + paramétrage régulation</li>
              <li>Dépose ancienne chaudière + évacuation</li>
              <li>Garantie fabricant (5-7 ans) + décennale artisan</li>
              <li>Numéro QualiPAC RGE + organisme certificateur</li>
            </ul>

            <h2>Aides 2026 — cumul jusqu’à 9 000 €</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">Coup de pouce CEE</th>
                    <th className="p-3 border-b border-sand-200">Cumul</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Très modestes (bleu)', '5 000 €', '4 000 €', '9 000 €'],
                    ['Modestes (jaune)', '4 000 €', '4 000 €', '8 000 €'],
                    ['Intermédiaires (violet)', '3 000 €', '3 000 €', '6 000 €'],
                    ['Supérieurs (rose)', '2 000 €', '2 500 €', '4 500 €'],
                  ].map(([p, m, c, t]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3">{p}</td>
                      <td className="p-3">{m}</td>
                      <td className="p-3">{c}</td>
                      <td className="p-3 font-semibold">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Montants indicatifs 2026 PAC air-eau ≥ 4 kW. Vérifier sur france-renov.gouv.fr selon
                votre situation.
              </p>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Méfiance devant le « PAC à 1 € ».</strong> Le Coup de pouce CEE a été
                sensiblement réduit depuis 2024 : plus aucune « PAC à 1 € » légitime n’existe en
                2026. Toute offre « à 1 € » aujourd’hui masque soit une sous-performance (COP &lt;
                3,0), soit un reste à charge caché, soit une fraude aux aides.
              </p>
            </div>

            <h2>3 facteurs qui peuvent faire dérailler le devis</h2>
            <ul>
              <li>
                <strong>Plancher chauffant neuf à créer.</strong> +3 000-8 000 € selon surface.
                Alternative : PAC haute température compatible radiateurs existants (+5-10 %).
              </li>
              <li>
                <strong>Refonte tableau électrique.</strong> Une PAC peut imposer un renforcement de
                l’abonnement (9→12 kVA) et un disjoncteur dédié. 500-1 500 €.
              </li>
              <li>
                <strong>Emplacement unité extérieure contraint.</strong> Copropriété avec règlement,
                voisinage, acoustique : études et travaux supplémentaires possibles.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Devis PAC : 3 artisans QualiPAC vérifiés
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Comparez 3 devis d’installateurs PAC RGE QualiPAC, avec bilan thermique inclus
                    et simulation MaPrimeRénov’.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Demander mes 3 devis PAC <ArrowRight className="w-4 h-4" aria-hidden />
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
              href="/artisans-rge"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE vérifiés <Leaf className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
