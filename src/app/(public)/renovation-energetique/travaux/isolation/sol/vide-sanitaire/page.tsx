/**
 * /renovation-energetique/travaux/isolation/sol/vide-sanitaire — Levier A1.
 *
 * @kw-primary    isolation vide sanitaire
 * @kw-volume     1000
 * @kw-kd         2
 * @kw-cpc        0.72
 * @cluster       7
 * @ahrefs-source local snapshot 2026-05-04 (docs/audit-ahrefs-2026-05-03)
 *
 * KW cibles snapshot 2026-05-04 :
 * - "isolation vide sanitaire"        → 1 000 vol (Hellio rank #28)
 * - "comment ventiler un vide sanitaire" → 300 vol (QuelleEnergie #1)
 * - "vide sanitaire" générique        → 4 100 vol (trop large, hors scope)
 *
 * Sub-page du hub /isolation/sol — focus exclusif technique vide-sanitaire.
 * Anti-cannibalisation : hub /sol couvre les 4 types de plancher
 * (VS, cave, garage, passage), cette sub-page = deep-dive VS uniquement.
 *
 * Aides 2026 (rappel YMYL) :
 *   - CEE BAR-EN-103 (R ≥ 3 m².K/W, plancher sur VS) — éligible.
 *   - MaPrimeRénov' isolation plancher bas par geste.
 *   - Coup de pouce isolation, éco-PTZ, TVA 5,5 %.
 *
 * Label RGE : Qualibat 7131 (ITI — plancher bas par dessous) ou 5232
 * (mousse PU projetée, idéale pour VS bas).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Home, AlertTriangle } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/isolation/sol/vide-sanitaire'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Isolation vide-sanitaire 2026 : techniques, prix, aides'
const DESCRIPTION =
  'Isolation vide-sanitaire 2026 : par dessous 25-50 €/m² (VS ≥ 60 cm), mousse polyuréthane projetée 35-70 €/m² (VS bas). Aides MPR + CEE BAR-EN-103, R ≥ 3 m².K/W.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
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
  'Vide-sanitaire = espace vide ≥ 20 cm sous le plancher bas, ventilé par grilles. Présent sur 30-40 % des maisons individuelles France.',
  '<strong>2 techniques</strong> selon hauteur : panneaux rigides en plafond (VS ≥ 60 cm accessible) 25-50 €/m², mousse polyuréthane projetée (VS bas 30-60 cm) 35-70 €/m².',
  'CEE BAR-EN-103 opérationnel : R ≥ 3 m².K/W, plancher sur vide-sanitaire, RGE obligatoire. Forfait kWhc/m² maison H1 1 600, H2 1 300, H3 900.',
  'MaPrimeRénov’ + Coup de pouce isolation cumulables + éco-PTZ + TVA 5,5 %.',
  '<strong>Conserver la ventilation</strong> du vide-sanitaire (grilles d’aération) : isoler ne doit pas étouffer le VS, sinon humidité + moisissures.',
  'Sensation pieds froids éliminée dès le premier hiver. ROI typique 3-5 ans.',
]

const TECHNIQUES = [
  {
    technique: 'Panneaux rigides en plafond (VS ≥ 60 cm)',
    prix: '25-50 €/m² posé',
    epaisseur: '100-160 mm PIR/PUR ou 160-200 mm laine minérale',
    detail:
      'Quand le VS est accessible (hauteur sous solives ≥ 60 cm) : pose collée + chevillage de panneaux PIR/PUR rigides ou laine de roche en plafond. R 4-6 m².K/W typique. Travail dans le VS uniquement, aucune gêne dans le logement. Conformité DTU 25.41 (plâtrerie sèche).',
    materiaux: 'PIR/PUR (Recticel, Soprema), laine de roche (Rockwool), laine de bois rigide',
  },
  {
    technique: 'Mousse polyuréthane projetée (VS bas 30-60 cm)',
    prix: '35-70 €/m² posé',
    epaisseur: '80-120 mm projetés',
    detail:
      'Solution incontournable quand le VS est trop bas pour panneaux. Robot ou lance projette la mousse à cellules fermées sur la sous-face du plancher. Étanchéité air automatique + adhésion totale (formes irrégulières, gaines, câbles). R 4-5 m².K/W. Délai 1 jour pour 100-200 m². Qualibat 5232.',
    materiaux: 'Mousse PU expansée à cellules fermées (Icynene, BASF Elastopir, Soprema)',
  },
  {
    technique: 'Isolation par dessus (rare — refait à neuf)',
    prix: '60-110 €/m² posé',
    epaisseur: '60-120 mm + chape',
    detail:
      'Cas extrême : VS totalement inaccessible (< 30 cm) ET dalle plancher à refaire. On dépose le plancher, isole par dessus, refait dalle ou chape. Hauteur perdue 8-15 cm. Hors scope BAR-EN-103 si VS conservé. À éviter sauf nécessité absolue.',
    materiaux: 'PIR/PUR sous chape ciment ou chape sèche Fermacell',
  },
]

const PROFILS = [
  {
    cas: 'Vide-sanitaire ≥ 60 cm hauteur, accessible par trappe',
    recommandation: 'Panneaux rigides PIR/PUR en plafond',
    justification:
      'Cas idéal : 25-50 €/m² posé, R ≥ 3 m².K/W facilement atteint avec 100 mm PIR. Travail dans le VS uniquement, aucune gêne dans le logement. ROI 3-5 ans. Éligible BAR-EN-103 + MPR.',
  },
  {
    cas: 'Vide-sanitaire bas (30-60 cm), accessible',
    recommandation: 'Mousse polyuréthane projetée',
    justification:
      'Hauteur insuffisante pour panneaux. Mousse projetée par lance ou robot. 35-70 €/m². R 4-5 m².K/W. Étanchéité air bonus + adhésion totale. Pose 1 jour pour maison standard.',
  },
  {
    cas: 'Vide-sanitaire très bas (< 30 cm) ou inaccessible',
    recommandation: 'Mousse projetée par robot téléguidé OU isolation par dessus',
    justification:
      'Quelques sociétés spécialisées disposent de robots téléguidés capables de projeter la mousse dans les VS très bas. Sinon, isolation par dessus en rénovation lourde (60-110 €/m², perte hauteur 8-15 cm).',
  },
  {
    cas: 'VS humide ou condensation au plafond',
    recommandation: 'Diagnostic humidité préalable + drainage',
    justification:
      'Isoler un VS humide sans traitement = pourriture des solives bois et moisissures sous l’isolant. Étapes : diagnostic (200-500 €), drainage périphérique si besoin, ventilation grilles à vérifier, puis isolation avec frein-vapeur.',
  },
  {
    cas: 'VS avec gaines / câbles / canalisations apparentes',
    recommandation: 'Mousse polyuréthane projetée (englobe les gaines)',
    justification:
      'Mousse adhère partout : gaines, prises, canalisations. Solution simple. Attention : repérer en amont les gaines à laisser accessibles (eau chaude, électricité).',
  },
]

const PRIX_DETAIL = [
  {
    poste: 'PIR/PUR rigide 100 mm en plafond VS',
    prix: '30-55 €/m² posé',
    note: 'R ≈ 4,5 m².K/W (PIR λ 0,022). Inclut panneaux + collage + chevillage.',
  },
  {
    poste: 'Laine de roche 200 mm en plafond VS',
    prix: '25-45 €/m² posé',
    note: 'R ≈ 5,5 m².K/W. Plus volumineuse mais classement feu A1.',
  },
  {
    poste: 'Mousse polyuréthane projetée 80 mm',
    prix: '35-55 €/m² posé',
    note: 'R ≈ 3,6-4 m².K/W. Idéal VS 40-60 cm.',
  },
  {
    poste: 'Mousse polyuréthane projetée 120 mm',
    prix: '50-70 €/m² posé',
    note: 'R ≈ 5,5 m².K/W. Performance maximale, pour zones froides H1.',
  },
  {
    poste: 'Diagnostic humidité VS',
    prix: '200-500 €',
    note: 'Recommandé si traces humidité, condensation ou odeur. Identifie cause + plan de traitement.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’un vide-sanitaire et à quoi sert-il ?',
    answer:
      'Un <strong>vide-sanitaire (VS)</strong> est un espace vide aménagé entre le sol naturel et le plancher bas du logement, généralement <strong>20 à 100 cm de hauteur</strong>. Sa fonction : (1) <strong>protection contre l’humidité du sol</strong> (évite remontées capillaires), (2) <strong>aération</strong> du dessous du plancher (grilles d’aération obligatoires NF DTU 13.11/13.12), (3) <strong>passage des gaines et canalisations</strong>. Présent sur 30-40 % des maisons individuelles France, surtout dans les régions à nappe phréatique élevée ou terrains argileux.',
  },
  {
    question: 'Quel R minimum pour MaPrimeRénov’ et CEE BAR-EN-103 ?',
    answer:
      '<strong>R ≥ 3 m².K/W</strong> pour la CEE BAR-EN-103 (Isolation plancher bas — plancher sur sous-sol non chauffé / vide-sanitaire / passage ouvert). Source officielle : <a href="https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20mod%20A29-2.pdf" rel="noopener noreferrer" target="_blank">fiche DGEC vA29-2</a> (entrée 01/01/2025). En pratique : <strong>100 mm PIR/PUR</strong> ou <strong>160-200 mm laine minérale</strong> en plafond VS. Mousse projetée 80-120 mm. Sans atteinte du seuil R ≥ 3 : pas d’aide. Le devis doit indiquer matériau + ACERMI + R atteint.',
  },
  {
    question: 'Faut-il boucher les grilles d’aération du vide-sanitaire ?',
    answer:
      '<strong>Non, jamais.</strong> Les grilles d’aération du VS sont <strong>obligatoires</strong> (NF DTU 13.11 et 13.12). Elles évacuent l’humidité naturelle du sol et préviennent moisissures + pourriture des solives bois du plancher. Boucher les grilles après isolation = condensation garantie + dégradation à long terme. Si l’isolant est posé en plafond du VS (pas au sol du VS), la ventilation reste effective. <strong>Vérifier l’état des grilles</strong> avant chantier (nettoyage si encrassées, remplacement si cassées).',
  },
  {
    question: 'Mousse polyuréthane projetée : avantages et inconvénients ?',
    answer:
      '<strong>Avantages</strong> : (1) <strong>étanchéité air automatique</strong> (pas de pont thermique), (2) <strong>adhésion totale</strong> (formes irrégulières, gaines, câbles), (3) <strong>R 4-6 m².K/W avec 80-120 mm</strong>, (4) pose rapide (200-500 m²/jour). <strong>Inconvénients</strong> : (1) <strong>prix supérieur</strong> aux panneaux (35-70 vs 25-50 €/m²), (2) <strong>matériau pétrochimique</strong> (impact carbone vs biosourcés), (3) <strong>réaction au feu</strong> à vérifier (classement E sans protection — protection BA13 si exposition risque incendie selon réglementation locale). À comparer avec laine de roche biosourcée pour usage long terme.',
  },
  {
    question: 'Combien coûte l’isolation d’un vide-sanitaire ?',
    answer:
      'Pour <strong>maison 100 m² au sol</strong> : (1) <strong>panneaux PIR 100 mm</strong> (VS accessible) : 30-55 €/m² × 100 = 3 000-5 500 €. (2) <strong>Mousse PU projetée 100 mm</strong> (VS bas) : 40-70 €/m² × 100 = 4 000-7 000 €. <strong>Aides à déduire</strong> : MaPrimeRénov’ par geste isolation plancher (forfait selon revenus), CEE BAR-EN-103 (~3-8 €/m² typique, soit 300-800 €), Coup de pouce CEE majoré ménages modestes. <strong>Reste à charge</strong> typique pour ménage très modeste (Bleu) : 30-50 % du devis.',
  },
  {
    question: 'Mon vide-sanitaire est inondable / proche d’une nappe phréatique : que faire ?',
    answer:
      'Cas spécifique : <strong>diagnostic indispensable</strong> par une entreprise d’étanchéité (200-500 €). Solutions selon gravité : (1) <strong>drainage périphérique</strong> (collecte eaux pluviales + nappe), 30-100 €/ml. (2) <strong>Cuvelage</strong> (étanchéité béton du VS) en cas de remontées chroniques, 80-150 €/m². (3) Une fois VS sain : isolation avec <strong>frein-vapeur</strong> intégré et <strong>matériau résistant à l’humidité</strong> (PIR/PUR ou mousse PU plutôt que laine sensible eau). Ne jamais isoler un VS inondable sans traitement préalable.',
  },
  {
    question: 'Quel artisan RGE pour isoler un vide-sanitaire ?',
    answer:
      'Selon la technique : <strong>Qualibat 7131</strong> (isolation thermique par l’intérieur — couvre plancher bas par dessous via panneaux + plaques) pour les <strong>panneaux rigides</strong>. <strong>Qualibat 5232</strong> (application de mousse polyuréthane projetée — mention spécifique application mousse PU) pour la <strong>mousse projetée</strong>. Vérification gratuite sur <a href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a>. Sans Qualibat valide : pas d’aide MPR ni CEE.',
  },
  {
    question: 'Combien d’économies sur la facture chauffage ?',
    answer:
      'Isolation VS bien réalisée : <strong>-5 à -10 % de la facture chauffage</strong> + sensation pieds froids éliminée. Sur facture annuelle 2 500 € (gaz/fioul) : économie 125-250 €/an. ROI 3-7 ans selon zone climatique (rapide en zone H1, plus long en H3). Le confort thermique est <strong>perceptible dès le premier hiver</strong> : sols qui passent de 12 °C à 18-19 °C. Cumul avec isolation toiture + murs : effet synergique jusqu’à -45 % au total.',
  },
]

const sources = [
  {
    label: 'DGEC — Fiche BAR-EN-103 vA29-2 (PDF)',
    url: 'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20mod%20A29-2.pdf',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ plancher bas',
    url: 'https://france-renov.gouv.fr',
  },
  { label: 'ADEME — Guide isolation thermique', url: 'https://www.ademe.fr' },
  { label: 'CSTB — DTU 13.11 / 13.12 (vides sanitaires)', url: 'https://www.cstb.fr' },
  { label: 'Qualibat — Mentions 7131 (ITI) / 5232 (mousse PU)', url: 'https://www.qualibat.com' },
  {
    label: 'ACERMI — Certification matériaux isolants',
    url: 'https://www.acermi.com',
  },
]

const relatedPages = [
  {
    label: 'Hub Isolation plancher bas',
    href: '/renovation-energetique/travaux/isolation/sol',
    description: 'VS + cave + garage + passage couvert',
  },
  {
    label: 'Isolation cave / sous-sol non chauffé',
    href: '/renovation-energetique/travaux/isolation/sol/cave-plafond',
    description: 'Plafond cave par dessous — solution la plus rentable',
  },
  {
    label: 'Isolation sol garage attenant',
    href: '/renovation-energetique/travaux/isolation/sol/garage',
    description: 'Garage en pavillon — pose en plafond + bonus acoustique',
  },
  {
    label: 'Aides MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes par revenus + saut DPE',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation MPR + CEE personnalisée',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Isolation vide-sanitaire',
    keywords: [
      'isolation vide sanitaire',
      'vide sanitaire',
      'isolation plancher bas vide sanitaire',
      'mousse polyurethane projetee',
      'cee bar-en-103',
      'qualibat 5232',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    {
      name: 'Plancher bas',
      url: '/renovation-energetique/travaux/isolation/sol',
    },
    { name: 'Vide-sanitaire', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides isolation vide-sanitaire 2026 (CEE BAR-EN-103)',
    description:
      'Isolation du plancher bas sur vide-sanitaire éligible à MaPrimeRénov’ par geste, CEE BAR-EN-103, Coup de pouce isolation, éco-PTZ et TVA 5,5 %. R minimum 3 m².K/W. Forfait CEE H1 1 600, H2 1 300, H3 900 kWhc/m² maison individuelle. Installation par RGE Qualibat 7131 (panneaux) ou 5232 (mousse PU) obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique isolation vide-sanitaire',
    audience: 'Propriétaires occupants, bailleurs',
    sameAs: [
      'https://france-renov.gouv.fr',
      'https://www.anah.gouv.fr',
      'https://www.service-public.fr',
      'https://www.legifrance.gouv.fr',
    ],
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' },
              { label: 'Plancher bas', href: '/renovation-energetique/travaux/isolation/sol' },
              { label: 'Vide-sanitaire' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Vide-sanitaire 2026 — CEE BAR-EN-103
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation vide-sanitaire 2026 : techniques, prix, aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>vide-sanitaire (VS)</strong> est un espace vide ventilé sous le plancher
              bas, présent sur 30-40 % des maisons individuelles France.{' '}
              <strong>Deux techniques</strong> selon hauteur :{' '}
              <strong>panneaux rigides en plafond</strong> (VS ≥ 60 cm) 25-50 €/m²,{' '}
              <strong>mousse polyuréthane projetée</strong> (VS bas 30-60 cm) 35-70 €/m².{' '}
              <strong>Aides cumulables 2026</strong> : MaPrimeRénov’ + CEE BAR-EN-103 (R ≥ 3 m².K/W)
              + Coup de pouce + TVA 5,5 %.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="techniques">Les 3 techniques selon la hauteur du VS</h2>
            <div className="not-prose grid gap-3 my-6">
              {TECHNIQUES.map((t) => (
                <div key={t.technique} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.technique}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">épaisseur {t.epaisseur}</p>
                  <p className="text-sm text-sand-700 m-0 mb-2">{t.detail}</p>
                  <p className="text-xs text-primary-600 font-medium m-0 italic">
                    Matériaux : {t.materiaux}
                  </p>
                </div>
              ))}
            </div>

            <h2 id="profil">Quelle technique selon votre vide-sanitaire</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Cas</th>
                    <th className="p-3 border-b border-sand-200">Recommandation</th>
                    <th className="p-3 border-b border-sand-200">Pourquoi</th>
                  </tr>
                </thead>
                <tbody>
                  {PROFILS.map((r) => (
                    <tr key={r.cas} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.cas}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.recommandation}</td>
                      <td className="p-3 text-sand-600">{r.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="prix">Prix posé 2026 — détail</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                    <th className="p-3 border-b border-sand-200">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_DETAIL.map((p) => (
                    <tr key={p.poste} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.poste}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Conserver la ventilation du vide-sanitaire</p>
                <p className="m-0">
                  Les <strong>grilles d’aération</strong> du VS sont obligatoires (NF DTU 13.11 /
                  13.12). Boucher les grilles après isolation = condensation + pourriture des
                  solives bois. L’isolant se pose <strong>en plafond du VS</strong> (sous le
                  plancher), jamais au sol du VS. La ventilation naturelle reste effective.
                </p>
              </div>
            </div>

            <h2 id="aides">Aides 2026 — CEE BAR-EN-103</h2>
            <p>
              Toutes cumulables si artisan <strong>RGE Qualibat 7131 ou 5232</strong> et matériau
              certifié <strong>ACERMI</strong> :
            </p>
            <ul>
              <li>
                <strong>CEE BAR-EN-103</strong> : R ≥ 3 m².K/W. Forfait kWhc/m² maison H1 1 600, H2
                1 300, H3 900. Source DGEC vA29-2.
              </li>
              <li>
                <strong>MaPrimeRénov’</strong> par geste isolation plancher bas — forfait selon
                revenus, voir{' '}
                <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">
                  france-renov.gouv.fr
                </a>
                .
              </li>
              <li>
                <strong>Coup de pouce isolation</strong> : majoration ménages modestes / très
                modestes.
              </li>
              <li>
                <strong>Éco-PTZ</strong> : jusqu’à 30 000 € (par geste) ou 50 000 € (rénovation
                d’ampleur).
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur fourniture + pose par RGE Qualibat.
              </li>
            </ul>

            <h2 id="cta">Devis isolation vide-sanitaire</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis vide-sanitaire en 30 secondes</strong> — artisans certifiés Qualibat
                7131 (ITI) ou 5232 (mousse PU) pour ouvrir droit à MPR + CEE BAR-EN-103.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis vide-sanitaire <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <FlagshipFaq items={faqs} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block bg-white border border-sand-200 hover:border-primary-300 rounded-xl p-4 transition"
                >
                  <p className="font-semibold text-sand-900 m-0 mb-1 inline-flex items-center gap-1">
                    {p.label} <ArrowRight className="w-3.5 h-3.5 text-primary-700" aria-hidden />
                  </p>
                  <p className="text-sm text-sand-600 m-0">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <FlagshipSources sources={sources} />
          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
        </div>
      </div>
    </>
  )
}
