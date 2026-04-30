import type { Metadata } from 'next'
import Link from 'next/link'
import { SunDim, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'velux-installation-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'
const AUTHOR_SLUG = 'thomas-bernard'

export const revalidate = 86400

const TITLE = 'Velux : prix, pose, aides 2026'
const DESCRIPTION =
  'Velux 2026 : 900-2 500 € TTC posé par fenêtre de toit, TVA 10 % RP >2 ans, déclaration préalable mairie, DTU 43.4, pose couvreur.'

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
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix 2026 TTC posé par fenêtre de toit 78×98 cm : bois vernis 900-1 400 €, PU blanc 1 000-1 600 €, motorisé 1 400-2 200 €, solaire 1 600-2 500 €.',
  'Déclaration préalable obligatoire mairie (art. R421-17 Code urba.) car modifie aspect extérieur. Zone ABF = avis conforme.',
  'TVA 10 % résidence principale >2 ans. TVA 5,5 % si couplé isolation combles dans bouquet rénovation énergétique.',
  'Aides : pas d’aide directe pour Velux seul. Couplé isolation combles = MaPrimeRénov 15-75 €/m² + CEE 10-20 €/m² + éco-PTZ.',
  'Pose obligatoire couvreur qualifié. Marques leaders : Velux (60 % marché), Fakro, Roto. Garantie fabricant 10-20 ans.',
]

const faqs = [
  {
    question: 'Quel prix pour poser un Velux en 2026 ?',
    answer:
      'Prix 2026 TTC fourniture + pose par fenêtre de toit (dimension standard 78×98 cm MK04) : (1) FENÊTRE BOIS VERNIS (GZL standard) : 900-1 400 € — chambre, grenier aménagé ; (2) FENÊTRE POLYURÉTHANE BLANCHE (GLL entretien réduit) : 1 000-1 600 € — salle de bain, cuisine (anti-humidité) ; (3) FENÊTRE MOTORISÉE FILAIRE (GGL INTEGRA) : 1 400-2 200 € — accessible seulement à distance (hauteur plafond >3 m) ; (4) FENÊTRE SOLAIRE MOTORISÉE (GGU INTEGRA SOLAR) : 1 600-2 500 € — pas de câblage, autonome ; (5) FENÊTRE VÉGÉTALE (toiture plate) : 1 800-3 500 € ; (6) VERRIÈRE DE TOIT 3-4 fenêtres assemblées : 6 000-12 000 €. Dimensions courantes surcoût : CK02 (55×78 cm) -15 %, MK08 (78×140 cm) +25 %, PK08 (94×140 cm) +40 %, UK10 (134×160 cm) +60 %. Frais cachés : raccord étanchéité EDW/EDZ 80-200 € par fenêtre, store occultant intérieur 80-200 €, volet roulant extérieur 300-600 €.',
  },
  {
    question: 'Faut-il une autorisation pour poser un Velux ?',
    answer:
      'OUI quasi-systématiquement (art. R421-17 Code urba.) : (1) Création NOUVEAU Velux dans toiture existante = modification aspect extérieur = DÉCLARATION PRÉALABLE DE TRAVAUX obligatoire en mairie ; (2) Remplacement Velux existant par modèle identique (même dimensions, même position) : AUCUNE formalité ; (3) Zone ABF 500 m monument historique ou site classé : DP + AVIS CONFORME ABF (peut imposer dimensions, couleur, forme) ; (4) Lotissement avec cahier charges : respecter harmonisation (souvent dimensions imposées, nombre max Velux par pan de toit) ; (5) PLU spécifique : certaines communes limitent (quota m² max Velux/pan, distance mini entre Velux 1-2 m, distance faîtage 1-1,5 m, distance gouttière 0,30-0,80 m) ; (6) Copropriété : autorisation AG obligatoire (modification partie commune toiture, art. 25 loi 10 juillet 1965) — parfois unanimité si cahier charges strict. Dossier : Cerfa 13703 + plan masse + coupe + photos + DP matériaux + croquis. Délai instruction 1 mois (2 mois ABF). Non-respect = amende 6 000 €, retrait ou démolition (art. L480-4).',
  },
  {
    question: 'Quelles aides pour installer un Velux ?',
    answer:
      'Velux SEUL = aucune aide directe MaPrimeRénov’ (décret 2022-1649 exclut fenêtres isolées hors bouquet rénovation énergétique globale). MAIS couplé à isolation combles (rampants + plancher) = aides cumulables : (1) MaPrimeRénov’ isolation rampants toiture 15-75 €/m² selon ressources (bleu 75 €, jaune 60 €, violet 40 €, rose 15 €) — plafond 100 m² ; (2) CEE Coup de pouce isolation : 10-20 €/m² tous ménages ; (3) TVA 5,5 % art. 278-0 bis A CGI résidence principale >2 ans si isolation couplée ; (4) Éco-PTZ : jusqu’à 30 000 € bouquet 3+ travaux rénovation ; (5) Aides locales : région Grand Est 300-800 €, Occitanie 400-1 000 €. Velux seul = TVA 10 % art. 279-0 bis CGI résidence principale >2 ans (pas 5,5 % car non bouquet). Total ménage bleu isolation combles 80 m² + 3 Velux : 6 000 MPR + 1 600 CEE + 600 TVA avantage = 8 200 € aides pour ~12 000 € travaux = reste à charge 3 800 €.',
  },
  {
    question: 'Quelles sont les règles de pose d’un Velux ?',
    answer:
      'Respect DTU 43.4 (couverture zinc) ou DTU 40.29 (pose fenêtre de toit) : (1) INCLINAISON TOITURE compatible : 15-90° pour Velux standard (pentes <15° requiert dispositif EDJ surélévation + DTU spécifique) ; (2) DISTANCE FAÎTAGE : minimum 60 cm (pour circulation couvreur + étanchéité tuilerie) ; (3) DISTANCE GOUTTIÈRE/ÉGOUT : minimum 30 cm (pour raccordement chevron + étanchéité) ; (4) DISTANCE ENTRE Velux voisins : minimum 50 cm largeur × 10 cm hauteur (pour raccord EDW combiné ou EDZ individuel) ; (5) LITEAUX ET CHEVRONS : découpe chevron maximum 1 chevron (si >1 = pose PANNE) = renfort structural obligatoire charpentier ; (6) ÉTANCHÉITÉ : raccord EDW (multi-pente ou ardoise), EDZ (tuiles plates), EDJ (pente <20°), EDN (ardoise) — adapté matériau couverture ; (7) ISOLATION INTÉRIEURE : BDX (caisson polystyrène) obligatoire pour performance thermique ; (8) ÉLECTRICITÉ si motorisé : câblage 230 V par électricien habilitation BR jusqu’à point commutation fenêtre. Non-respect DTU = décennale annulée, fuites assurance habitation refuse, Velux garantie constructeur refusée.',
  },
  {
    question: 'Quel modèle Velux choisir selon la pièce ?',
    answer:
      'Guide choix 2026 par usage : (1) CHAMBRE / BUREAU : BOIS VERNIS naturel GZL (chaleur visuelle, acoustique), UK04 ou MK06 dimensions courantes ; (2) SALLE DE BAIN / CUISINE : POLYURÉTHANE BLANC GLL (entretien réduit, résistance humidité, hygiène), dimension CK04 suffit ; (3) CHAMBRE HAUTEUR >2,50 m plafond : MOTORISÉE FILAIRE GGL INTEGRA (pilotage télécommande + smartphone), option capteur pluie auto-fermeture ; (4) GRENIER AMÉNAGÉ sans câblage : SOLAIRE GGU INTEGRA SOLAR (panneau intégré + batterie lithium, autonome) ; (5) COMBLES NON ISOLÉS AMÉNAGÉS : Velux + volet roulant extérieur VELUX SSL (-40 à -70 % chaleur été) ; (6) ESPACE OUVERT SOUS COMBLES : Velux CABRIO (ouverture pivotante + balcon intégré), 2 500-4 500 € ; (7) TOITURE PLATE : Velux CVP (fenêtre coupole plate, éclairage zénithal). Vitrage : standard 3G (triple vitrage, Uw 1,0), acoustique 4G (réduction 48 dB), sécurité 61 (anti-effraction P2A). Télécommande + store occultant recommandés (+200-400 €) pour confort été.',
  },
]

const sources = [
  {
    label: 'DTU 40.29 — Pose fenêtre toit',
    url: 'https://www.cstb.fr',
  },
  { label: 'Art. R421-17 Code urba. — DP', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. 1792 Code civil — Décennale', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Qualibat 3111 — Couverture', url: 'https://www.qualibat.com' },
  { label: 'France Rénov — Fenêtres aides', url: 'https://france-renov.gouv.fr' },
]

const relatedGuides = [
  { label: 'Isolation combles', href: '/guides/isolation-combles' },
  { label: 'Aménagement combles perdus prix', href: '/guides/amenagement-combles-perdus-prix' },
  { label: 'Rénovation toiture', href: '/guides/renovation-toiture' },
  { label: 'Surélévation toiture prix', href: '/guides/surelevation-toiture-prix' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Toiture',
    keywords: [
      'Velux prix pose',
      'fenêtre de toit prix',
      'déclaration préalable Velux',
      'DTU 40.29',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Velux fenêtre de toit', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Velux fenêtre de toit' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <SunDim className="w-3.5 h-3.5" aria-hidden />
              Toiture · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Velux : prix et pose 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un Velux standard 78×98 cm coûte 900-2 500 € TTC posé selon le modèle (bois, PU,
              motorisé, solaire). Voici les prix 2026, la déclaration préalable, les aides couplées
              isolation et le DTU 40.29.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix Velux 2026 posés (dimension standard 78×98)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Modèle</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Pièce recommandée</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bois vernis (GZL)', '900-1 400 €', 'Chambre, bureau'],
                    ['PU blanc (GLL)', '1 000-1 600 €', 'Salle de bain, cuisine'],
                    ['Motorisé filaire (GGL INTEGRA)', '1 400-2 200 €', 'Hauteur >3 m'],
                    ['Solaire (GGU INTEGRA SOLAR)', '1 600-2 500 €', 'Sans câblage possible'],
                    ['CABRIO balcon', '2 500-4 500 €', 'Combles aménagés'],
                  ].map(([m, p, u]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              href="/services/couvreur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un couvreur <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
