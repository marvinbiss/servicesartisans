import type { Metadata } from 'next'
import Link from 'next/link'
import { Construction, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'cloison-placo-prix-pose-m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'
const AUTHOR_SLUG = 'thomas-bernard'

export const revalidate = 86400

const TITLE = 'Cloison placo : prix au m², pose 2026'
const DESCRIPTION =
  'Cloison placo 2026 : prix 40-90 € TTC/m² posée (plaques, rails, isolation, finition), DTU 25.41, hydrofuge, ignifuge, plaquiste Qualibat.'

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
  'Prix 2026 TTC/m² posée (fourniture + pose) : cloison simple BA13 standard 40-55 €, hydrofuge BA13H 50-65 €, haute isolation acoustique 70-90 €.',
  'Composition : rails métal + plaques placo 12,5 mm des deux côtés + laine minérale 45-100 mm + joints + bandes + enduit + sous-couche.',
  'DTU 25.41 (plaques plâtre) et DTU 25.42 (cloisons maçonnées) : hauteur max 3-5 m selon type, entraxe montants 60 cm maxi.',
  'Types de placo : standard BA13 (sec), BA13H hydrofuge (salle de bain), BA13F feu (chaudière, garage), BA13-PV phonique.',
  'Installation plaquiste Qualibat 4131 (cloisons sèches). Garanties : parfait achèvement 1 an + décennale 10 ans (tenue structure).',
]

const faqs = [
  {
    question: 'Quel prix au m² pour poser une cloison placo en 2026 ?',
    answer:
      'Prix 2026 TTC/m² fourniture + pose (hauteur 2,50 m standard) : (1) CLOISON SIMPLE BA13 + rails + laine 45 mm + joints/bandes (pas peinture) : 40-55 €/m² — séparation chambre/couloir classique ; (2) CLOISON BA13H HYDROFUGE (salle de bain, cuisine) + isolation 45 mm : 50-65 €/m² — résistance humidité 2-3x supérieure ; (3) CLOISON BA13F FEU coupe-feu 30-60 min (garage, chaudière, cage escalier) + laine roche : 55-75 €/m² — norme habitation 90 min garage attenant ; (4) CLOISON ACOUSTIQUE HAUTE PERF PHONIQUE (studio, chambres enfants, chambre parentale) : 70-90 €/m² — Rw 45-60 dB, double ossature désolidarisée + laine dense 100 mm ; (5) CLOISON ALVÉOLAIRE PRÊTE À L’EMPLOI (rénovation rapide, Pregy, Fermacell) : 35-50 €/m² — solution bricoleur ; (6) CONTRE-CLOISON ISOLANTE MUR EXTÉRIEUR (doublage intérieur) : +15-25 €/m² isolation laine 100 mm. Répartition coût typique (cloison BA13 50 €/m² posée) : plaques BA13 8-12 €/m², rails + vis 6-10 €/m², isolation laine minérale 45 mm 5-8 €/m², joints + bandes 4-7 €/m², pose 20-30 €/m². Finitions EN SUS : sous-couche + 2 couches peinture acrylique 12-20 €/m², carrelage faïence SDB 60-120 €/m². Frais cachés : protection sol 2-5 €/m², évacuation déchets 100-250 €.',
  },
  {
    question: 'Quel type de placo choisir selon la pièce ?',
    answer:
      'Guide placo 2026 par usage : (1) CHAMBRE, SALON, COULOIR : BA13 standard couleur gris — sec, économique. Hauteur maxi 2,70 m entraxe 60 cm rails (3 m avec entraxe 40 cm) ; (2) SALLE DE BAIN, CUISINE, BUANDERIE, WC : BA13H HYDROFUGE couleur verte — protection humidité, taux absorption <5 % (vs 20-30 % BA13 standard). OBLIGATOIRE zones d’éclaboussure autour douche/baignoire/évier, sinon moisissures 2-3 ans ; (3) GARAGE ATTENANT, CHAUDIÈRE, CAGE ESCALIER : BA13F FEU couleur rose — résistance 30-60 min norme habitation. OBLIGATOIRE art. 10 arrêté 31 janvier 1986 (habitation individuelle) ; (4) STUDIO ENREGISTREMENT, CHAMBRE ENFANTS, APPARTEMENT CONTIGU : BA13-PV PHONIQUE couleur bleue — densité supérieure (12-16 kg/m² vs 8 standard), combiné à ossature désolidarisée + laine dense atteint Rw 55-60 dB ; (5) POSE MULTIPLE (locaux techniques, IGH, ERP) : BA13-MAR MARINE protection humidité + FEU ; (6) PANNEAUX FIBRE-GYPSE FERMACELL OU AQUAPANEL (ciment) : alternatives plus robustes +20-30 % prix vs placo standard, durabilité supérieure, tenue charge 30 kg/fixation (vs 15 kg placo). Combinaisons possibles (BA13 + BA13H + BA13F) dans même cloison selon local adjacent.',
  },
  {
    question: 'Quelles sont les règles DTU pour une cloison placo ?',
    answer:
      'DTU 25.41 (plâtrerie plaques de plâtre, novembre 2012 + amendements 2019) : (1) SUPPORT sol béton ou chape plane (±3 mm sur 2 m règle), sec (humidité <3 %), propre ; (2) ENTRAXE MONTANTS M48 ou M70 rails métalliques : 60 cm maximum standard (40 cm renforcé pour hauteurs >2,70 m ou supports lourds) ; (3) HAUTEUR MAXI : 2,70 m avec M48 entraxe 60 cm ; 3,50 m avec M70 entraxe 60 cm ; 4,50 m avec M100 entraxe 40 cm (si plus haut : cloison double ossature technique) ; (4) PLAQUES BA13 (12,5 mm épaisseur standard) : BA15 (15 mm) pour locaux humides + coupe-feu, BA18/25 rares ; (5) VISSAGE : vis TTPC (tête trompette pointe piquante charnière) galvanisées, entraxe 25-30 cm bord plaque, 15 mm retrait bord plaque ; (6) BANDES DE JOINTS : papier micro-perforé 50 mm + enduit mi-dur 2 passes + ponçage grain 180 ; (7) JOUES/RELAIS (rails verticaux entre plaques) : entraxe 50 cm maxi + vis double ; (8) ISOLATION ACOUSTIQUE/THERMIQUE : laine minérale 45-100 mm (densité 12-25 kg/m³ standard) glissée dans rails avant pose 2e plaque. Non-respect DTU = décennale compromise, assurance habitation peut refuser sinistre, artisan engagé responsabilité contractuelle.',
  },
  {
    question: 'Abattre ou créer une cloison : quelles démarches ?',
    answer:
      'Démarches selon cas (art. R421-1 à R421-17 Code urba.) : (1) CRÉER OU ABATTRE CLOISON NON PORTEUSE dans logement privé : AUCUNE FORMALITÉ URBANISME — bricolage libre ; (2) EN COPROPRIÉTÉ : certains règlements (copro standing) exigent information SYNDIC préalable, surtout si cloison sépare appartement/palier ; (3) MUR PORTEUR (cloison supportant étage ou toiture) : INTERVENTION MAÇON + INGÉNIEUR STRUCTURE + IPN (poutrelle acier) remplacement. Coût 2 000-8 000 € selon ouverture + étude structure 800-2 500 €. NE JAMAIS toucher mur porteur sans pro + étude ; (4) APPARTEMENT COPROPRIÉTÉ : abattre mur porteur = AG copropriété unanimité (art. 26 loi 10 juillet 1965 si modifie charge) + architecte + assurance dommages ouvrage ; (5) INTÉRIEUR ISOLATION mur extérieur (contre-cloison) : pas de formalité ; (6) CLOISON DANS COMBLES (surface habitable >1,80 m sous plafond créée) : peut bascul surface taxable + déclaration cadastrale H1 art. 1406 CGI ; (7) POINT ÉLECTRIQUE dans cloison neuve : gaine ICTA + règles NF C 15-100 (prises, interrupteurs, disjoncteur différentiel 30 mA) ; (8) PLOMBERIE dans cloison : réservation + goulotte + carte eau chaude/froide accessible. Si fuite = obligation intervention rapide sinon sinistre.',
  },
  {
    question: 'Quel entretien et durée de vie d’une cloison placo ?',
    answer:
      'Durabilité + entretien : (1) DURÉE VIE CLOISON PLACO : 30-50 ans si bien posée + ambiance normale — conforme durée vie logement ; (2) ZONES D’USURE : (a) angles et bords exposés chocs (aspirateur, meubles) : reprises enduit + peinture tous 5-15 ans selon trafic ; (b) salle de bain : remplacement BA13H tous 20-30 ans si humidité mal gérée ; (c) garage/chaudière : BA13F tient 40-60 ans si feu non déclaré ; (3) SINISTRES FRÉQUENTS : (a) PERCEMENTS pose tableaux/meubles : reboucher mastic fibres + enduit + peinture 10-30 €/trou ; (b) FUITE EAU (baignoire mal étanchéifiée, canalisation percée) : remplacement zone humide OBLIGATOIRE (séchage incomplet = mousse dans isolation + plaque gonflée) ; (c) FISSURES MICRO dans joints (bâtiment bouge normalement, tassement) : ouvrir joint + enduit élastomère + bande papier ; (d) HUMIDITÉ CONDENSATION murs mal ventilés : installer VMC + dévoiler placo, traiter + reposer ; (4) FIXATIONS : (a) chevilles MOLLY ou légères 15 kg max pour tableaux ; (b) charges lourdes (TV mural, meuble suspendu) : FIXATION DIRECTE rails métalliques ou préciser POSE RENFORCÉE contreplaqué 18 mm dans cloison dès conception ; (5) PEINTURE : renouvellement 7-15 ans selon pièce (cuisine/SDB plus fréquent vs chambre) ; (6) FIN DE VIE : déchèterie ou recyclage — placo = sulfate de calcium recyclable 95 %.',
  },
]

const sources = [
  {
    label: 'DTU 25.41 — Plaques de plâtre',
    url: 'https://www.cstb.fr',
  },
  { label: 'DTU 25.42 — Cloisons maçonnées', url: 'https://www.cstb.fr' },
  { label: 'Arrêté 31 janvier 1986 — Sécurité', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Qualibat 4131 — Cloisons sèches', url: 'https://www.qualibat.com' },
  { label: 'NF C 15-100 — Installation élec', url: 'https://www.afnor.org' },
]

const relatedGuides = [
  { label: 'Ouverture mur porteur prix', href: '/guides/ouverture-mur-porteur-prix' },
  {
    label: 'Isolation phonique mur appartement',
    href: '/guides/isolation-phonique-mur-appartement',
  },
  { label: 'Prix peinture appartement 50m²', href: '/guides/prix-peinture-appartement-50m2' },
  { label: 'Prix rénovation maison 100m²', href: '/guides/prix-renovation-maison-100m2' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Gros œuvre',
    keywords: [
      'cloison placo prix m2',
      'placo BA13 BA13H BA13F',
      'DTU 25.41',
      'plaquiste Qualibat',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Cloison placo', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Cloison placo' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Construction className="w-3.5 h-3.5" aria-hidden />
              Gros œuvre · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Cloison placo : prix au m² 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une cloison placo coûte 40-90 € TTC/m² posée selon le type (standard, hydrofuge,
              ignifuge, phonique). Voici les prix 2026, les DTU 25.41, les types BA13 et les règles
              d’installation.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix cloisons placo 2026 posées au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type cloison</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/m²</th>
                    <th className="p-3 border-b border-sand-200">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['BA13 standard', '40-55 €', 'Chambre, couloir'],
                    ['BA13H hydrofuge', '50-65 €', 'Salle de bain, cuisine'],
                    ['BA13F feu', '55-75 €', 'Garage, chaudière'],
                    ['Acoustique haute perf', '70-90 €', 'Studio, chambres enfants'],
                    ['Contre-cloison isolante', '55-80 €', 'Doublage mur ext. isolé'],
                  ].map(([t, p, u]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
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
              href="/services/platrier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un plaquiste <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
