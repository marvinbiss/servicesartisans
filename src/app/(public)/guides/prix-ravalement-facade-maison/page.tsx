import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Home, Calculator, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-ravalement-facade-maison'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Prix ravalement façade maison 2026'
const DESCRIPTION =
  'Prix ravalement façade maison 2026 : 40-100 €/m² (nettoyage, enduit, bardage). Obligation légale 10 ans, aides ITE, exemple chiffré maison 100 m².'

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
  'Ravalement simple (nettoyage + peinture) : 40 à 70 €/m² TTC.',
  'Ravalement avec reprise enduit : 70 à 100 €/m²  TTC.',
  'Ravalement + ITE (isolation par l’extérieur) : 150 à 250 €/m², éligible MaPrimeRénov’.',
  'Maison 100 m² (≈120 m² façade) : 4 800 à 12 000 € ravalement simple, 18 000 à 30 000 € avec ITE.',
  'Obligation ravalement tous les 10 ans dans certaines communes (art. L132-1 Code construction).',
]

const faqs = [
  {
    question: 'Le ravalement est-il obligatoire ?',
    answer:
      "Oui, dans les communes qui l'imposent par arrêté municipal, tous les 10 ans maximum (art. L132-1 du Code de la construction). La liste concerne surtout les grandes villes, mais aussi de nombreuses communes de 5 000-50 000 habitants. Renseignez-vous en mairie. En copropriété, c'est à l'assemblée générale de décider ou de s'y conformer à réception d'une mise en demeure de la mairie. Sanction : amende administrative, mise en demeure, exécution d'office aux frais du propriétaire.",
  },
  {
    question: 'Quel type de ravalement pour quel résultat ?',
    answer:
      "Ravalement simple (nettoyage haute pression + peinture) : convient façade en bon état, simple rafraîchissement, tient 8-12 ans. Ravalement avec reprise enduit : petits défauts (fissures superficielles), régularité restaurée, tient 15-20 ans. Ravalement avec ITE : transformation complète, gain énergétique majeur (R jusqu'à 7 en mur), tient 30+ ans. Choix selon état + budget + projet thermique global.",
  },
  {
    question: 'Faut-il une déclaration préalable pour un ravalement ?',
    answer:
      "Oui, dans la plupart des cas. Déclaration préalable de travaux (DP) à déposer en mairie si : (1) modification de l'aspect extérieur (couleur, matériau), (2) commune avec règlement particulier (ZPPAUP, secteur sauvegardé, SPR). Un simple ravalement à l'identique sans changement de teinte peut être dispensé de DP, mais vérifiez toujours en mairie : 30 % des communes l'exigent. Non-déclaration = amende 1 200 € + remise en état.",
  },
  {
    question: 'Ravalement + ITE : est-ce éligible à MaPrimeRénov’ ?',
    answer:
      "Oui. L'ITE (Isolation Thermique par l'Extérieur) est éligible MaPrimeRénov' avec R ≥ 3,7 m²·K/W et artisan RGE Qualibat 7131 ou 7132. Aide : 30 à 75 €/m² selon revenus, plafonnée à 100 m² d'ITE. CEE Coup de pouce cumulable. Le ravalement seul n'est pas éligible aux aides énergétiques, mais la TVA 10 % s'applique si le logement a plus de 2 ans.",
  },
  {
    question: 'Quelle période pour ravaler ?',
    answer:
      "Idéalement printemps (avril-juin) ou début automne (septembre). Conditions à respecter : températures >5 °C le jour, >0 °C la nuit (pour enduits et peintures), pas de pluie prévue dans les 24-72 h selon produits. Hiver rigoureux ou été caniculaire : difficultés d'application + qualité compromise. Un ravalement mal posé en mauvaise saison peut cloquer ou se décoller sous 1-2 ans.",
  },
  {
    question: 'Combien de temps dure un ravalement ?',
    answer:
      'Maison 100 m² façade standard (120 m²) : installation échafaudage 1-2 jours, nettoyage 1-2 jours, traitement support + enduit 3-7 jours selon séchage, finitions + démontage 2-3 jours. Total : 2-3 semaines pour ravalement simple, 3-5 semaines avec reprise importante, 5-8 semaines avec ITE. La météo peut rallonger de 30-50 %.',
  },
]

const sources = [
  {
    label: 'Code construction — art. L132-1 (obligation ravalement)',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'France Rénov’ — MaPrimeRénov’ ITE 2026', url: 'https://france-renov.gouv.fr' },
  { label: 'Qualibat — qualifications façadier 7131/7132', url: 'https://www.qualibat.com' },
  { label: 'DTU 59.1 — Ravalement façades', url: 'https://boutique.afnor.org' },
]

const relatedGuides = [
  { label: 'Isolation ITE vs ITI 2026', href: '/guides/isolation-ite-iti-rge-aides-2026' },
  { label: 'Déclaration préalable travaux', href: '/guides/declaration-prealable-travaux' },
  { label: 'Rénovation énergétique complète', href: '/guides/renovation-energetique-complete' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & Extérieur',
    keywords: ['prix ravalement façade', 'ravalement maison', 'ITE prix', 'façade peinture prix'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix ravalement façade', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prix ravalement façade' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Extérieur
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix ravalement façade maison en 2026 : la grille complète
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Ravaler la façade d’une maison de 100 m² coûte entre 4 800 € (nettoyage + peinture) et
              30 000 € (avec ITE complète) en 2026. La technique choisie dépend autant de l’état
              initial que de votre projet énergétique. Voici la grille par technique, les
              obligations administratives à ne pas manquer, et les aides mobilisables quand le
              ravalement s’accompagne d’une isolation.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille 2026 par technique (maison 100 m², ≈120 m² façade)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Technique</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC /m²</th>
                    <th className="p-3 border-b border-sand-200">Total 120 m²</th>
                    <th className="p-3 border-b border-sand-200">Durabilité</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      'Nettoyage haute pression + peinture',
                      '40 à 55 €',
                      '4 800 à 6 600 €',
                      '8-12 ans',
                    ],
                    ['Hydrofuge + peinture minérale', '50 à 75 €', '6 000 à 9 000 €', '12-18 ans'],
                    ['Reprise enduit + peinture', '70 à 100 €', '8 400 à 12 000 €', '15-20 ans'],
                    [
                      'Enduit monocouche (façade entière)',
                      '80 à 120 €',
                      '9 600 à 14 400 €',
                      '20-30 ans',
                    ],
                    ['Bardage bois / composite', '110 à 180 €', '13 200 à 21 600 €', '25-35 ans'],
                    ['ITE + enduit de finition', '150 à 220 €', '18 000 à 26 400 €', '30+ ans'],
                    ['ITE + bardage bois', '180 à 260 €', '21 600 à 31 200 €', '30+ ans'],
                  ].map(([t, p, s, d]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3">{p}</td>
                      <td className="p-3 font-semibold">{s}</td>
                      <td className="p-3 text-sand-600">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes 2026, échafaudage inclus. Écarts ±25 % selon hauteur, accessibilité,
                région.
              </p>
            </div>

            <h2>Détail par poste (ravalement avec reprise enduit)</h2>
            <ul>
              <li>Échafaudage (location 3-4 semaines) : 1 200-2 500 €</li>
              <li>Nettoyage haute pression (120 m²) : 600-1 200 €</li>
              <li>Piquage zones dégradées + réparations : 800-2 000 €</li>
              <li>Enduit minéral ou organique (2 couches) : 2 500-4 500 €</li>
              <li>Peinture ou finition couleur : 1 500-2 500 €</li>
              <li>Protections (menuiseries, terrasses) + nettoyage fin : 500-1 000 €</li>
              <li>Traitement algues et mousses : 300-600 €</li>
            </ul>

            <h2>Quand le ravalement + ITE devient rentable</h2>
            <p>
              Profiter d’un ravalement obligatoire pour faire une ITE peut transformer une dépense
              pure en investissement rentable. Exemple&nbsp;:
            </p>
            <ul>
              <li>Ravalement simple obligatoire : 9 000 € (dépense non récupérable)</li>
              <li>Ravalement + ITE complète : 22 000 € (surcoût 13 000 €)</li>
              <li>Aides MaPrimeRénov’ + CEE (revenus intermédiaires, 100 m² ITE) : 6 500 €</li>
              <li>Surcoût net après aides : 6 500 €</li>
              <li>Économies de chauffage : 400-800 €/an</li>
              <li>Amortissement : 8-16 ans selon situation</li>
              <li>Plus-value à la revente : +3-5 % du prix du bien</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention démarchages.</strong> Le ravalement obligatoire est une niche de
                fraude fréquente : faux courriers officiels, devis gonflés, travaux inutiles
                facturés. Tout courrier de « rappel d’obligation » envoyé par une entreprise privée
                est illégal. Seule la mairie peut vous mettre en demeure. Comparez toujours 3 devis.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    3 devis façadiers vérifiés
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Façadiers et entreprises Qualibat vérifiés, simulation ITE + MaPrimeRénov’ en
                    option.
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
              href="/services/facadier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un façadier <Home className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
