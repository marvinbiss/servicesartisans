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

const SLUG = 'surelevation-toiture-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Surélévation toiture : prix 2026 + PLU'
const DESCRIPTION =
  'Surélévation maison : 2 000-3 500 €/m² TTC (bois, béton, métal). Permis, PLU, étude structure, architecte obligatoire >150 m².'

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
  'Prix moyen 2026 : 2 000-3 500 €/m² TTC pour surélévation ossature bois (technique la plus courante).',
  'Surélévation béton ou parpaings : 2 800-4 500 €/m² TTC, plus lourd, plus long, parfois fondations à renforcer.',
  'PC obligatoire (permis de construire) dans la plupart des cas. Architecte obligatoire si surface totale >150 m².',
  'Faisabilité PLU : vérifier hauteur max, emprise au sol, coefficient d’occupation (COS supprimé ALUR mais PLU persistent).',
  'Durée totale 9-18 mois incluant PC (3 mois), étude structure (6 sem.), construction (3-5 mois).',
]

const faqs = [
  {
    question: 'Combien coûte une surélévation au m² ?',
    answer:
      "Fourchette 2026 : 2 000-3 500 €/m² TTC pour surélévation bois (la plus fréquente), 2 800-4 500 €/m² TTC béton/parpaings. Pour 40 m² habitables : 80-180 k€ TTC selon complexité. Détail : étude structure 2-4 k€, architecte+MO 8-12 % du montant, gros œuvre 40-55 %, second œuvre 20-30 %, plomberie+électricité 8-12 %, finitions 10-15 %, taxe d'aménagement 3-6 k€. Forfait global inclus si entreprise générale : +10-15 %.",
  },
  {
    question: 'Ma maison peut-elle être surélevée ?',
    answer:
      "Critères structurels : (1) fondations dimensionnées pour une charge supplémentaire (étude structure obligatoire), (2) murs porteurs capables de reprendre l'étage (épaisseur, matériau, état), (3) terrain stable (pas de glissement ou de remblais récents). Critères urbanisme : (1) PLU autorisant la hauteur cible (souvent 7-12 m au faîtage), (2) emprise et COS/CES respectés, (3) pas de servitude d'aspect (secteur ABF, lotissement). 70-80 % des maisons individuelles sont techniquement surélévables, mais seulement 50 % passent le filtre PLU.",
  },
  {
    question: 'Bois ou béton : quel matériau choisir ?',
    answer:
      'Ossature bois (85 % des surélévations en France) : léger (~60 kg/m² vs 350 kg/m² béton), pas de fondations supplémentaires, chantier sec rapide 2-4 mois, excellente performance thermique (R=5-6 facile). Contre : coût matériaux plus élevé, finitions spécifiques, vulnérabilité feu à traiter. Béton/parpaings : cohérence esthétique avec existant, durabilité. Contre : lourd, chantier 4-7 mois, fondations à vérifier/renforcer (surcoût 8-15 k€), prix plus élevé 30-40 % au total.',
  },
  {
    question: 'Dois-je avoir un permis de construire ?',
    answer:
      "Oui dans 90 % des cas. Déclaration préalable (DP) uniquement si la surface de plancher créée est ≤20 m² (40 m² en zone U avec PLU). Au-delà : permis de construire obligatoire (2-3 mois d'instruction). Architecte obligatoire si la surface totale post-travaux dépasse 150 m² de SHAB (art. L431-3 Code urba). Taxe d'aménagement due sur la surface créée. Éventuel avis ABF en secteur patrimonial (+2-4 mois). Budget démarches : 2-6 k€ hors honoraires archi.",
  },
  {
    question: 'Combien de temps prend une surélévation ?',
    answer:
      'Planning type : (1) avant-projet + faisabilité structure 2 mois, (2) dépôt PC et instruction 3-4 mois, (3) délai recours tiers 2 mois, (4) consultation entreprises + signature 1-2 mois, (5) commande matériaux + préfabrication (bois) 6-10 semaines, (6) chantier proprement dit 3-5 mois, (7) finitions + réception 1 mois. Total 12-18 mois du projet à la livraison. Surélévation bois préfabriquée : on peut réduire à 9-12 mois avec entreprise spécialisée.',
  },
  {
    question: 'Quelles aides pour une surélévation ?',
    answer:
      "Pas d'aide directe type MaPrimeRénov' (c'est une extension, pas une rénovation énergétique seule). Aides potentielles : (1) TVA 10 % au lieu de 20 % si maison >2 ans (logement adjoint au logement existant), (2) MaPrimeRénov' sur la partie isolation de la toiture existante si refaite à neuf, (3) crédits locaux (région, département) parfois, (4) éco-PTZ si performance globale DPE améliorée ≥35 %. La surélévation seule ne donne pas droit à MPR.",
  },
]

const sources = [
  {
    label: 'Article L431-3 Code urba — Architecte obligatoire',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'DTU 31.2 — Construction ossature bois', url: 'https://www.cstb.fr' },
  { label: 'ADEME — Construction bois', url: 'https://agirpourlatransition.ademe.fr' },
  { label: 'Service-public.fr — Permis de construire', url: 'https://www.service-public.fr' },
]

const relatedGuides = [
  { label: 'Aménagement combles perdus prix', href: '/guides/amenagement-combles-perdus-prix' },
  { label: 'Extension maison', href: '/guides/extension-maison' },
  { label: 'Ouverture mur porteur prix', href: '/guides/ouverture-mur-porteur-prix' },
  { label: 'Permis de construire', href: '/guides/permis-construire' },
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
    keywords: [
      'surélévation toiture prix',
      'surélévation maison',
      'ajouter étage',
      'rehausse ossature bois',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Surélévation toiture prix', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Surélévation toiture prix' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Travaux spécialisés · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Surélévation toiture : prix 2026 et faisabilité
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Ajouter un étage complet à votre maison permet de gagner 60-100 m² habitables sans
              empiéter sur le jardin. C’est la solution la plus coûteuse au m² mais souvent la plus
              rentable sur terrain de ville. Voici le prix réel 2026 et les conditions techniques et
              réglementaires.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Comparatif matériaux — bois vs béton</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Ossature bois</th>
                    <th className="p-3 border-b border-sand-200">Béton / parpaings</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Prix moyen €/m² TTC', '2 000-3 500 €', '2 800-4 500 €'],
                    ['Poids (kg/m²)', '60-90', '300-400'],
                    ['Renfort fondations', 'Rarement', 'Souvent'],
                    ['Durée chantier 60 m²', '2-4 mois', '4-7 mois'],
                    ['Isolation intégrée', 'Oui (R≥5)', 'À ajouter'],
                    ['Résistance feu', 'À traiter', 'Native'],
                    ['Durabilité', '60-80 ans', '100+ ans'],
                  ].map(([c, b, be]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{b}</td>
                      <td className="p-3">{be}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Checklist faisabilité avant devis</h2>
            <ol>
              <li>Consulter le PLU de la commune (hauteur max, emprise, COS/CES).</li>
              <li>Vérifier servitudes du titre de propriété.</li>
              <li>Rapport de sol géotechnique (utile pour dimensionner fondations).</li>
              <li>Étude structure : capacité portante murs existants + fondations.</li>
              <li>Diagnostic amiante/plomb si toiture avant 1997.</li>
              <li>Consultation ABF si secteur protégé.</li>
              <li>Accord voisins (pour les accès, les servitudes de vue).</li>
            </ol>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Architecte obligatoire si &gt;150 m² au total.</strong>
                La surface habitable totale (existant + surélévation) est celle qui compte. Maison
                120 m² + surélévation 50 m² = 170 m² donc architecte. Honoraires 8-12 % du montant
                des travaux.
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
              href="/services/charpentier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un charpentier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
