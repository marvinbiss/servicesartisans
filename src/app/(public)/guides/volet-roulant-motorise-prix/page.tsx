import type { Metadata } from 'next'
import Link from 'next/link'
import { Blinds, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'volet-roulant-motorise-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'
const AUTHOR_SLUG = 'marc-lefebvre'

export const revalidate = 86400

const TITLE = 'Volet roulant motorisé : prix 2026'
const DESCRIPTION =
  'Volet roulant motorisé 2026 : prix 550-1 400 € TTC/baie, alu/PVC, filaire/radio/solaire, TVA 10 %, CEE couplé isolation, électricien qualifié.'

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
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix 2026 TTC posé par fenêtre : 550-900 € PVC standard, 700-1 100 € alu, 900-1 400 € baie vitrée 2,4 m.',
  'Technologies : filaire (moins cher, interrupteur mural) / radio (télécommande, domotique) / solaire (panneau intégré, 0 câblage).',
  'TVA 10 % résidence principale >2 ans (art. 279-0 bis CGI). Pas d’aide directe — cumulable CEE si couplé isolation.',
  'Pose monobloc (rénovation, caisson extérieur) / bloc-baie (neuf, caisson intégré) / sous-coffre (encastré isolé).',
  'Installation moteur = électricien qualifié (NF C 15-100) + poseur menuiserie. Garantie décennale + biennale (art. 1792).',
]

const faqs = [
  {
    question: 'Quel prix pour poser un volet roulant motorisé en 2026 ?',
    answer:
      'Prix 2026 TTC posé selon dimension, matériau, motorisation : (1) PVC standard 120×120 cm filaire (fenêtre classique) : 550-750 € — milieu gamme ; (2) PVC radio 120×120 cm : 650-900 € — télécommande + centralisation ; (3) Alu laqué 120×120 cm radio : 750-1 100 € — haut de gamme durable ; (4) Baie vitrée alu 240×215 cm : 900-1 400 € ; (5) Volet solaire PVC 120×120 cm : 700-950 € (surcoût 100-200 € vs filaire mais 0 câblage = économie pose électricité 150-300 €) ; (6) Volet roulant en applique rénovation (caisson ext. visible) = -15-25 % vs intégré ; (7) Bloc-baie neuf (caisson pré-intégré menuiserie) = +10-15 % menuiserie standard. Tarif pose seule (moteur + SAV) : 80-200 € par volet.',
  },
  {
    question: 'Volet filaire, radio ou solaire : que choisir ?',
    answer:
      'Comparatif 3 technologies : (1) FILAIRE — moins cher (+0 €), interrupteur mural fixe, fiable, mais nécessite câblage 230 V → mur (gaine + saignée 80-200 €/pièce en rénovation), pas compatible centralisation plus de 4 volets ; (2) RADIO (868 MHz Somfy RTS/io, Bubendorff) — +100-150 €/volet vs filaire, télécommande individuelle + centralisation (1 clic = tous volets), compatible domotique (Tahoma, Google Home, Alexa), câblage simple (alim moteur uniquement), récepteur interne : idéal rénovation + pilotage intelligent ; (3) SOLAIRE — +100-200 €/volet vs filaire, 0 câblage (panneau intégré + batterie lithium 5-7 ans), pertinent en rénovation difficile (pas de saignée) ou exposition sud/est suffisante, mais remplacement batterie 80-150 € après 5-7 ans. Règle : neuf = filaire ou radio intégré ; rénovation simple = radio ; rénovation lourde/isolement = solaire.',
  },
  {
    question: 'Existe-t-il des aides pour les volets roulants en 2026 ?',
    answer:
      'Aides limitées — les volets seuls ne sont PAS éligibles MaPrimeRénov’ (décret 2022-1649 exclut volets hors bouquet travaux). MAIS : (1) TVA 10 % automatique art. 279-0 bis CGI en résidence principale >2 ans (pas 5,5 % car non considéré amélioration énergétique seule) ; (2) CEE : volets isolants (Uw ≤1,3 W/m²K couplé fenêtre) peuvent entrer dans un bouquet rénovation ouvrant CEE 50-150 €/fenêtre ; (3) Éco-PTZ : inclus dans bouquet 2-3 travaux réno (isolation + fenêtres + volets) jusqu’à 30 000 € ; (4) Aides locales : certaines communes/régions (Bretagne, Pays de Loire) versent 100-300 € dans rénovation globale ; (5) Crédit d’impôt volet électrique PMR : 25 % art. 200 quater A CGI pour personnes handicapées/seniors >65 ans sans condition ressources, plafonné 5 000 € sur 5 ans. Total aide ménage standard : 0-200 € = reste à charge 700-1 400 €/volet.',
  },
  {
    question: 'Quel type de pose choisir en rénovation ou neuf ?',
    answer:
      '3 types selon chantier : (1) MONOBLOC APPLIQUE — caisson extérieur visible au-dessus fenêtre, pose en rénovation sans toucher maçonnerie, 550-900 € TTC PVC, mais caisson visible esthétique + pont thermique + Uw dégradé ; (2) MONOBLOC RÉNOVATION (dit "sous-linteau" ou "sous-coffre") — caisson caché dans linteau existant (si épaisseur ≥25 cm), 650-1 000 €, esthétique intérieure préservée ; (3) BLOC-BAIE (neuf + isolation extérieure) — caisson pré-intégré à la menuiserie ou coffre encastré sous ITE, meilleure performance thermique (Uw ≤1,3 W/m²K global), 900-1 400 € mais seulement en neuf ou rénovation lourde. En rénovation classique, recommandé = sous-coffre si linteau le permet, sinon applique. Jamais en applique si copropriété avec règlement interdisant modification façade : vote AG unanimité.',
  },
  {
    question: 'Quelles garanties et entretien pour un volet motorisé ?',
    answer:
      'Garanties légales (pose par pro) : (1) Garantie de parfait achèvement 1 an (art. 1792-6) — désordres signalés à la réception ; (2) Garantie biennale 2 ans (art. 1792-3) — éléments d’équipement dissociables = MOTEUR, télécommande, lame. Moteur Somfy, Bubendorff, Simu : 5-7 ans fabricant souvent ; (3) Garantie décennale 10 ans (art. 1792) — éléments indissociables (caisson intégré, coulisses). (4) Entretien conseillé : vérif annuelle coulisses (graissage silicone), nettoyage lames (eau savonneuse), contrôle fin de course (ajustement bout de course moteur), changement batterie solaire tous 5-7 ans. (5) Non-garanti : usure lames sable/vent littoral, dégâts tempête (assurance habitation), erreur manœuvre (forcer en charge). Conserver facture + certificat moteur (numéro série) pour activer garantie fabricant SAV.',
  },
]

const sources = [
  {
    label: 'Art. 279-0 bis CGI — TVA 10 %',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Art. 1792 Code civil — Décennale', url: 'https://www.legifrance.gouv.fr' },
  { label: 'NF C 15-100 — Installation électrique', url: 'https://www.afnor.org' },
  { label: 'ADEME — Confort été volets', url: 'https://www.ademe.fr' },
  { label: 'France Rénov — Fenêtres volets', url: 'https://france-renov.gouv.fr' },
]

const relatedGuides = [
  {
    label: 'Prix changement fenêtres double vitrage',
    href: '/guides/prix-changement-fenetres-double-vitrage',
  },
  { label: 'Remplacement fenêtres aides 2026', href: '/guides/remplacement-fenetres-aides-2026' },
  { label: 'Rénovation fenêtres', href: '/guides/renovation-fenetres' },
  { label: 'Prix électricien heure 2026', href: '/guides/prix-electricien-heure-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Menuiserie',
    keywords: [
      'volet roulant motorisé prix',
      'volet solaire filaire radio',
      'pose volet roulant',
      'volet roulant aides',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Volet roulant motorisé', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Volet roulant motorisé' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Blinds className="w-3.5 h-3.5" aria-hidden />
              Menuiserie · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Volet roulant motorisé : prix et pose 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un volet roulant motorisé coûte 550-1 400 € TTC posé par fenêtre selon le matériau
              (PVC/alu), la motorisation (filaire/radio/solaire) et le type de pose. Voici les prix
              2026, les aides et les garanties.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix volets roulants motorisés posés 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PVC filaire 120×120', '550-750 €', 'Fenêtre standard'],
                    ['PVC radio 120×120', '650-900 €', 'Télécommande + domotique'],
                    ['Alu radio 120×120', '750-1 100 €', 'Haut de gamme durable'],
                    ['Baie alu 240×215', '900-1 400 €', 'Baie vitrée salon'],
                    ['Solaire PVC 120×120', '700-950 €', 'Rénovation sans câblage'],
                  ].map(([c, p, u]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
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
              href="/services/menuisier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un menuisier poseur <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
