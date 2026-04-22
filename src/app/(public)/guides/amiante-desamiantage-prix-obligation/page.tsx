import type { Metadata } from 'next'
import Link from 'next/link'
import { HardHat, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'amiante-desamiantage-prix-obligation'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'
const AUTHOR_SLUG = 'sophie-martin'

export const revalidate = 86400

const TITLE = 'Amiante : désamiantage, prix 2026'
const DESCRIPTION =
  'Désamiantage 2026 : 30-80 €/m² sous-section 4, 80-200 €/m² sous-section 3 certifiée, DTA obligatoire pré-1997, sanctions 75 000 €. Devis gratuits.'

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
  'Amiante interdite en France depuis 1er janvier 1997 (décret 96-1133). Risque sanitaire élevé (cancers pleuraux, mésothéliomes).',
  'DIAGNOSTIC AMIANTE obligatoire avant travaux bâtiments pré-1997 (art. R1334-14 CSP). Vente immeuble bâti = DAPP annexé.',
  'Prix 2026 TTC/m² désamiantage : sous-section 4 travaux non-polluants 30-80 €/m², sous-section 3 (entreprise certifiée) 80-200 €/m².',
  'DTA (Dossier Technique Amiante) obligatoire immeubles construits avant 1997 avec >20 logements (art. R1334-15 CSP).',
  'Sanctions : amende 75 000 € + 2 ans prison art. L4741-1 Code travail pour exposition salariés sans précautions. Maître d’ouvrage responsable.',
]

const faqs = [
  {
    question: 'Quelles obligations pour l’amiante en 2026 ?',
    answer:
      'Cadre légal strict (Code santé publique + Code du travail + décret 2011-629) : (1) DIAGNOSTIC AMIANTE AVANT VENTE (DAPP — Diagnostic Amiante des Parties Privatives) : obligatoire immeuble construit avant 1er juillet 1997, annexé compromis/acte vente, durée validité illimitée si négatif ou 3 ans si positif ; (2) DIAGNOSTIC AMIANTE AVANT DÉMOLITION OU TRAVAUX (art. R1334-14 CSP) : obligatoire pour TOUTE PARTIE DU BÂTIMENT avant interventions (pose, perçage, arrachage) — 150-600 € selon surface ; (3) DOSSIER TECHNIQUE AMIANTE (DTA) : obligatoire bâtiments construits avant 1997 avec parties communes + > certains seuils (tertiaire, collectif >20 logements art. R1334-15). Contient cartographie amiante ; (4) DÉCLARATION PRÉALABLE TRAVAUX avec amiante à l’inspection travail (art. R4412-133 Code travail) ; (5) PROTECTION SALARIÉS : EPI (combinaison type 5 + masque P3 + gants) obligatoire ; (6) RETRAIT DES DÉCHETS par entreprise agréée vers CET classe 1 (décharge contrôlée matériaux dangereux) — bordereau BSD obligatoire, conservation 5 ans ; (7) RESPONSABILITÉ MAÎTRE OUVRAGE : obligation information entreprises + recherche amiante + financement mesures protection. Ignorance = aggravation responsabilité pénale.',
  },
  {
    question: 'Quel prix pour un diagnostic ou désamiantage en 2026 ?',
    answer:
      'Prix 2026 HT : (1) DIAGNOSTIC AMIANTE VENTE (DAPP appart/maison) : 80-180 € (partie privative), 500-1 500 € bâtiment tertiaire ; (2) DIAGNOSTIC AMIANTE AVANT TRAVAUX (DAAT) : 150-400 € intervention courante, 600-2 500 € si prélèvements multiples matériaux + labo ; (3) DTA IMMEUBLE COLLECTIF : 1 500-5 000 € selon surface ; (4) DÉSAMIANTAGE SOUS-SECTION 4 (matériaux non friables, interventions courtes durées, faible risque empoussièrement) : 30-80 € TTC/m² — exemples dalles vinyle amiante, colles, joint carreaux ; (5) DÉSAMIANTAGE SOUS-SECTION 3 (confinement, friable, entreprise certifiée AFNOR NF X 46-010) : 80-200 € TTC/m² — exemples flocage plafond, calorifugeage canalisations, toiture fibrociment ; (6) MESURE EMPOUSSIÈREMENT AVANT + APRÈS TRAVAUX : 200-500 € par mesure (laboratoire accrédité COFRAC) ; (7) ÉVACUATION DÉCHETS AMIANTE + CET classe 1 : 200-500 €/tonne (CET alès, Rousson, Chatuzange) ; (8) COMPLET (diagnostic + désamiantage 50 m² sous-section 3 + élimination + mesures) : 8 000-15 000 € pour appartement moyen. Frais cachés fréquents : échafaudage + bâchage confinement 1 500-4 000 €, durée immobilisation logement 5-15 jours si sous-section 3 = relogement temporaire.',
  },
  {
    question: 'Où trouver l’amiante dans ma maison ?',
    answer:
      'Matériaux fréquemment amiantés bâtiments 1945-1997 : (1) TOITURE ET BARDAGE : plaques fibrociment Eternit, ardoises artificielles amiante-ciment, canalisations évacuation (très fréquent garage et annexe) ; (2) FAUX-PLAFONDS ET CLOISONS : dalles minérales suspendus (bureau tertiaire), plaques fibragglo type Pro Rock sous sol ; (3) REVÊTEMENTS SOL : dalles vinyle-amiante type Gerflex 1950-1990 (très fréquent cuisines, salles de bain), colles bitumineuses sous parquet/carrelage ; (4) CALORIFUGEAGE CANALISATIONS : tresses + enduits isolants tuyauterie chauffage/ECS (chaufferies, caves) ; (5) FLOCAGE HORS BÂTIMENT : protection feu poutres métalliques (rare résidentiel, fréquent tertiaire) ; (6) ENDUITS + COLLES + JOINTS : colles carrelage avant 1997, joints porte/fenêtre coupe-feu, enduits plâtre amiantés (rare) ; (7) CHAUDIÈRES ET POÊLES : plaques isolantes intérieur chaudière fioul/mazout avant 1990, joints amiante brûleur ; (8) PARE-FLAMME CHEMINÉE + INSERT : plaques protection mur conduit ; (9) CUISINIÈRE OU RADIATEUR ANCIEN : panneau arrière amianté (rare). ATTENTION : simple présence amiante = PAS toujours dangereux (si matériau intact + non friable = risque faible). RISQUE = poussière fines libérées lors arrachage/percement/cassage. Si doute sur matériau d’un logement <1997, FAIRE DIAGNOSTIC AMIANTE AVANT tous travaux (même petits 600 € vs amende 75 000 €).',
  },
  {
    question: 'Qui peut désamianter et quelles certifications ?',
    answer:
      'Classification intervenants selon sous-section (art. R4412-114 à R4412-148 Code travail) : (1) SOUS-SECTION 3 (travaux de retrait ou d’encapsulage amiante friable ou haute densité amiante) : ENTREPRISE CERTIFIÉE QUALIBAT 1552 AMIANTE + AFNOR NF X 46-010 obligatoire. Salariés formés SS3 (5-10 jours formation), équipés EPI type 5 (combinaison) + masque ventilation assistée A2P3. 15 000-25 000 € formation pour entreprise candidate ; (2) SOUS-SECTION 4 (interventions sur matériaux sans retrait ou encapsulage — petites réparations, maintenance, interventions courtes durées) : ENTREPRISE FORMÉE SS4 (2-5 jours formation) sans certification Qualibat obligatoire mais recommandée, équipée combinaison + masque P3 ; (3) DIAGNOSTIQUEUR AMIANTE : certification organisme accrédité COFRAC (I.Cert, Bureau Veritas, Ginger CEBTP, etc.), obligation assurance RC pro (art. L271-4 CCH), formation 35h + examen ; (4) LABORATOIRE ANALYSE : accréditation COFRAC (CRAM, IRIS, MEDICAL DIAGNOSTIC) — obligation pour prélèvements ; (5) VIDANGEUR DÉCHETS : ENTREPRISE AGRÉÉE préfecture, transport matière dangereuse ADR (art. L541-8 Code env.), bordereau BSD obligatoire ; (6) AUTOCONSTRUCTION : LÉGALE pour PROPRIÉTAIRE INDIVIDUEL uniquement pour SES TRAVAUX PERSONNELS (pas artisan facturant). Masque P3 + combinaison + brumiseur + conteneurs étanches. Mais dangereux sans formation — déconseillé absolument.',
  },
  {
    question: 'Quels risques sanitaires et responsabilités liés à l’amiante ?',
    answer:
      'Dangers santé + responsabilités : (1) PATHOLOGIES RECONNUES : asbestose (fibrose pulmonaire, 10-30 ans latence), cancer pleural/péritonéal (mésothéliome — mortel 12-18 mois diagnostic, 50-70 % cas liés amiante), cancer du poumon (multiplicateur ×2-5 fumeurs exposés amiante). 2 000-4 000 morts/an France liées amiante historique. Maladies professionnelles reconnues tableau 30 régime général + tableau 47 régime agricole ; (2) RESPONSABILITÉ MAÎTRE D’OUVRAGE (propriétaire faisant faire travaux) : obligation information obligatoire entreprises sur présence amiante (ou absence) via DAAT avant chantier — art. R4412-97 Code travail. NON-INFORMATION = responsabilité pénale art. 121-3 Code pénal + civile art. 1240 Code civil ; (3) SANCTIONS PÉNALES : amende 75 000 € + 2 ans prison maître d’ouvrage + entrepreneur (art. L4741-1 Code travail) ; 45 000 € + 3 ans prison pour mise en danger autrui (art. 223-1 Code pénal) ; (4) RESPONSABILITÉ CIVILE ENTREPRENEURS : décennale annulée si travaux réalisés sans respecter règles amiante, assurance refuse sinistre ; (5) FONDS D’INDEMNISATION VICTIMES AMIANTE (FIVA) : mis en place loi 2000-1257, indemnise victimes exposées professionnellement. Préjudice moyen 30 000-100 000 €/victime (préjudice santé + économique + anxiété) ; (6) RECOURS ACQUÉREUR IMMOBILIER : vice caché art. 1641 Code civil si non-mention dans DAPP / DTA.',
  },
]

const sources = [
  {
    label: 'Décret 96-1133 — Interdiction amiante',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Art. R1334-14 à R1334-29 CSP', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. R4412-114 à R4412-148 CT', url: 'https://www.legifrance.gouv.fr' },
  { label: 'ANDEVA — Victimes amiante', url: 'https://andeva.fr' },
  { label: 'Qualibat 1552 — Désamiantage', url: 'https://www.qualibat.com' },
]

const relatedGuides = [
  { label: 'Diagnostics vente obligatoires', href: '/guides/diagnostics-vente-obligatoires' },
  { label: 'Diagnostics immobiliers', href: '/guides/diagnostics-immobiliers' },
  {
    label: 'Expertise bâtiment quand faire appel',
    href: '/guides/expertise-batiment-prix-quand-faire-appel',
  },
  { label: 'Rénovation toiture', href: '/guides/renovation-toiture' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Sécurité',
    keywords: [
      'désamiantage prix m2',
      'amiante diagnostic obligation',
      'DTA DAPP',
      'sous-section 3 4 amiante',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Amiante désamiantage', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Amiante désamiantage' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <HardHat className="w-3.5 h-3.5" aria-hidden />
              Sécurité · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Amiante : désamiantage et obligations 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le désamiantage coûte 30-200 € TTC/m² selon la sous-section (SS3/SS4) et la nature des
              matériaux. Voici les prix 2026, le DTA obligatoire, les diagnostics vente/avant
              travaux et les sanctions pénales.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix désamiantage 2026 au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type intervention</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/m²</th>
                    <th className="p-3 border-b border-sand-200">Exemples</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Diagnostic DAPP vente', '80-180 €', 'Partie privative'],
                    ['Diagnostic DAAT travaux', '150-400 €', 'Avant chantier'],
                    ['DTA immeuble collectif', '1 500-5 000 €', 'Copro >20 logements'],
                    ['SS4 non friable', '30-80 €/m²', 'Dalles vinyle, colles'],
                    ['SS3 friable Qualibat', '80-200 €/m²', 'Flocage, calorifugeage'],
                    ['Élimination CET classe 1', '200-500 €/t', 'Décharge contrôlée'],
                  ].map(([t, p, e]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{e}</td>
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
            <Link href="/contact" className="inline-flex items-center gap-1 hover:text-primary-700">
              Être accompagné <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
