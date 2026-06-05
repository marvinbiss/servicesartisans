/**
 * /renovation-energetique/travaux/isolation/sol/cave-plafond — Levier A3.
 *
 * @kw-primary    isolation cave plafond
 * @kw-volume     200
 * @kw-kd         1
 * @kw-cpc        0.26
 * @cluster       7
 * @ahrefs-source local snapshot 2026-05-04 (docs/audit-ahrefs-2026-05-03)
 *
 * KW cibles snapshot 2026-05-04 :
 * - "isolation cave plafond"      → 200 vol, KD 1 (Effy rank #1 pos 1)
 * - "isolation cave humide"       → 100 vol (Sonergia rank #3)
 * - "isolation sous-sol humide"   → 100 vol (Sonergia rank #1)
 * - "isolation sous sol"          → 900 vol (Sonergia rank #4)
 *
 * Concurrent #1 : Effy domine "isolation cave plafond" pos 1 — KD 1 facile.
 * SA peut viser top 3 avec page solide + maillage hub /sol.
 *
 * Aides 2026 : CEE BAR-EN-103 + MaPrimeRénov' + Coup de pouce + éco-PTZ
 * + TVA 5,5 %. Cas spécifique humidité = traitement préalable obligatoire.
 *
 * Label RGE : Qualibat 7131 (ITI — plafond cave par dessous) ou 5232
 * (mousse PU si cave irrégulière ou avec gaines).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Building, AlertTriangle, Droplets } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/isolation/sol/cave-plafond'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Isolation cave plafond 2026 : techniques, prix, aides'
const DESCRIPTION =
  'Isolation cave plafond 2026 : par dessous au plafond de la cave 25-55 €/m² posé. Cas humide : diagnostic préalable. Aides MPR + CEE BAR-EN-103 (R ≥ 3 m².K/W).'

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
  'Cave / sous-sol non chauffé sous logement = cas <strong>le plus rentable</strong> du plancher bas. Cave est accessible debout, pose en plafond depuis dessous.',
  '<strong>Prix 25-55 €/m² posé</strong> selon matériau (PIR, laine de roche, mousse projetée).',
  'CEE BAR-EN-103 opérationnel : R ≥ 3 m².K/W, plancher sur sous-sol non chauffé, RGE obligatoire.',
  'MaPrimeRénov’ par geste + Coup de pouce + éco-PTZ + TVA 5,5 % cumulables.',
  '<strong>Cave humide</strong> = diagnostic préalable obligatoire. Sans traitement humidité, l’isolation pourrit en 2-3 ans.',
  'Bénéfice immédiat : sols qui passent de 12 °C à 18-19 °C. Sensation pieds froids éliminée.',
]

const TECHNIQUES = [
  {
    technique: 'Panneaux PIR/PUR rigides en plafond cave',
    prix: '30-55 €/m² posé',
    epaisseur: '80-120 mm',
    detail:
      'Panneaux rigides collés + chevillés en plafond. R 4-5,5 m².K/W. Rapide (200-400 m²/jour). Hauteur perdue 9-13 cm. Résistant à l’humidité (cellules fermées). Idéal cave saine.',
    materiaux: 'PIR/PUR (Recticel, Soprema, Knauf), laine de bois rigide possible',
  },
  {
    technique: 'Laine de roche + plaque BA13 sur ossature',
    prix: '25-50 €/m² posé',
    epaisseur: '160-200 mm',
    detail:
      'Suspentes + ossature métallique + laine de roche + plaque BA13. R 5-6 m².K/W. Classement feu A1 (incombustible). Hauteur perdue 18-22 cm. Finition propre.',
    materiaux: 'Rockwool, Knauf TerraVac, suspentes acoustiques',
  },
  {
    technique: 'Mousse polyuréthane projetée',
    prix: '35-65 €/m² posé',
    epaisseur: '80-120 mm projetés',
    detail:
      'Si plafond cave irrégulier ou présence gaines apparentes. Mousse adhère partout. Étanchéité air automatique. Hauteur perdue 8-12 cm. Qualibat 5232.',
    materiaux: 'Mousse PU expansée à cellules fermées (résistante humidité)',
  },
]

const PROFILS = [
  {
    cas: 'Cave saine, hauteur ≥ 1,80 m (accessible debout)',
    recommandation: 'Panneaux PIR 100 mm en plafond',
    justification:
      'Cas idéal — 30-55 €/m² posé. R ≈ 4,5 m².K/W. Pose 1-2 jours pour cave 50 m². ROI 3-5 ans. Aucune gêne dans le logement, travail dans la cave uniquement.',
  },
  {
    cas: 'Cave humide (taches, condensation, odeur)',
    recommandation: 'Diagnostic humidité préalable + drainage si besoin',
    justification:
      'Étapes obligatoires : (1) diagnostic 200-500 €, (2) traitement cause (drainage périphérique, cuvelage, ventilation), (3) une fois cave saine : isolation avec frein-vapeur + matériau résistant humidité (PIR/PUR ou mousse PU). Délai total 2-6 semaines.',
  },
  {
    cas: 'Cave avec gaines / canalisations / câbles apparents',
    recommandation: 'Mousse polyuréthane projetée',
    justification:
      'Mousse adhère sur tout : gaines, prises, canalisations. Étanchéité air automatique. Pose 1 jour. 35-65 €/m². Repérer en amont les gaines à laisser accessibles.',
  },
  {
    cas: 'Cave basse (1,40-1,80 m)',
    recommandation: 'Panneaux PIR fins (60-80 mm) ou mousse projetée',
    justification:
      'Hauteur résiduelle critique. Mousse PU 80 mm = perte 8-12 cm. Panneaux PIR 60 mm = perte 7-9 cm. R 3-3,5 m².K/W (juste au seuil BAR-EN-103).',
  },
  {
    cas: 'Cave avec sécurité incendie renforcée requise',
    recommandation: 'Laine de roche A1 + plaque BA13',
    justification:
      'Classement feu A1 (incombustible) — sécurité maximale. 25-50 €/m² posé. Hauteur perdue 18-22 cm. Préféré si stockage matières inflammables, copropriété avec règlement strict.',
  },
]

const PRIX_DETAIL = [
  {
    poste: 'PIR/PUR 100 mm en plafond cave',
    prix: '30-55 €/m² posé',
    note: 'R ≈ 4,5 m².K/W. Inclut panneaux + collage + chevillage. Résistant humidité.',
  },
  {
    poste: 'Laine de roche 200 mm + BA13',
    prix: '25-50 €/m² posé',
    note: 'R ≈ 5,5 m².K/W. Classement feu A1.',
  },
  {
    poste: 'Mousse PU projetée 100 mm',
    prix: '40-65 €/m² posé',
    note: 'R ≈ 4,5 m².K/W. Étanchéité air bonus. Idéal plafond irrégulier.',
  },
  {
    poste: 'Diagnostic humidité cave',
    prix: '200-500 €',
    note: 'Recommandé si traces, odeur, condensation. Identifie cause + plan traitement.',
  },
  {
    poste: 'Drainage périphérique cave',
    prix: '30-100 €/ml',
    note: 'Si remontées capillaires. Linéaire mur extérieur cave + regard de visite.',
  },
  {
    poste: 'Cuvelage étanchéité cave',
    prix: '80-150 €/m²',
    note: 'Cas humidité grave. Mortier ou résine étanche sur murs cave.',
  },
]

const faqs = [
  {
    question: 'Pourquoi isoler le plafond de la cave plutôt que le sol du logement ?',
    answer:
      'Trois raisons majeures : (1) <strong>Coût</strong> : 25-55 €/m² par dessous vs 60-110 €/m² par dessus (chape isolante). (2) <strong>Aucune gêne dans le logement</strong> : pas de déménagement, pas de meubles à protéger, le travail se fait dans la cave. (3) <strong>Pas de hauteur perdue</strong> dans le logement (la perte est dans la cave, qui est moins critique). (4) <strong>Éligible BAR-EN-103</strong> qui cible « plancher sur sous-sol non chauffé ».',
  },
  {
    question: 'Quelle hauteur de cave est nécessaire ?',
    answer:
      'Idéalement <strong>≥ 1,80 m</strong> (cave accessible debout pour l’artisan). Possible jusqu’à <strong>1,40 m</strong> (artisan debout courbé, panneaux fins ou mousse projetée). En dessous de 1,40 m : difficile, mousse projetée par robot téléguidé éventuellement. Mesurer aussi <strong>la hauteur sous solives</strong> (poutres / IPN du plancher) car l’isolant se pose sous celles-ci. Hauteur résiduelle après isolation = hauteur cave initiale - épaisseur isolant - éventuel BA13.',
  },
  {
    question: 'Comment savoir si ma cave est humide ?',
    answer:
      '<strong>Signes visibles</strong> : (1) <strong>Taches</strong> sur murs ou plafond (auréoles, salpêtre, moisissures noires), (2) <strong>Condensation</strong> visible sur tuyauterie ou parois, (3) <strong>Odeur</strong> de moisi caractéristique, (4) <strong>Murs froids et humides</strong> au toucher, (5) <strong>Hygrométrie ≥ 70 %</strong> (mesurable avec hygromètre 10-30 €). Si un seul signe : diagnostic humidité par professionnel <strong>obligatoire</strong> avant isolation. Coût 200-500 €. Identifie remontées capillaires, infiltrations latérales, condensation, et propose plan de traitement.',
  },
  {
    question: 'Que faire si ma cave est humide avant isolation ?',
    answer:
      '<strong>Traiter la cause d’abord</strong>. (1) <strong>Remontées capillaires</strong> (eau du sol qui monte par capillarité dans murs) : drainage périphérique 30-100 €/ml ou injection de résine 50-120 €/ml. (2) <strong>Infiltrations latérales</strong> (mur extérieur cave non étanche) : cuvelage ou enduit étanche 80-150 €/m². (3) <strong>Condensation</strong> (air humide qui se condense sur surfaces froides) : <strong>ventilation mécanique</strong> de la cave (VMC ou simple bouche). Une fois cave saine + sèche depuis ≥ 1 mois : isolation avec <strong>frein-vapeur</strong> intégré et matériau résistant humidité (PIR/PUR ou mousse PU).',
  },
  {
    question: 'Combien coûte l’isolation d’une cave de 50 m² ?',
    answer:
      'Pour <strong>cave 50 m²</strong> : (1) <strong>PIR 100 mm</strong> : 30-55 €/m² × 50 = <strong>1 500-2 750 €</strong>. (2) <strong>Laine de roche + BA13</strong> : 25-50 €/m² × 50 = <strong>1 250-2 500 €</strong>. (3) <strong>Mousse PU projetée 100 mm</strong> : 40-65 €/m² × 50 = <strong>2 000-3 250 €</strong>. <strong>Aides à déduire</strong> : MaPrimeRénov’ par geste (forfait selon revenus), CEE BAR-EN-103 (~3-8 €/m² typique soit 150-400 € pour 50 m²), Coup de pouce CEE majoré modestes. <strong>Reste à charge</strong> typique pour ménage très modeste (Bleu) : 30-50 % du devis.',
  },
  {
    question: 'L’isolation de la cave a-t-elle un impact sur la cave elle-même ?',
    answer:
      'Effets secondaires <strong>positifs</strong> : (1) la cave reste légèrement plus chaude en hiver (chaleur du logement transitait avant par le plancher, désormais bloquée — la cave ne descend plus en dessous de 8-10 °C en hiver), (2) plus de protection contre le gel pour bouteilles / réserves stockées. Effets <strong>négatifs potentiels</strong> : (1) si la cave est <strong>mal ventilée</strong>, l’humidité peut s’accumuler (l’isolation isole aussi du logement qui auparavant ventilait indirectement la cave). <strong>Solution</strong> : conserver / améliorer la ventilation cave (grilles d’aération obligatoires si prévu construction, sinon ajouter une bouche).',
  },
  {
    question: 'Quel artisan RGE pour isoler le plafond d’une cave ?',
    answer:
      'Selon technique : <strong>Qualibat 7131</strong> (isolation thermique par l’intérieur — couvre plancher bas par dessous via panneaux + plaques) pour <strong>panneaux rigides ou laine + BA13</strong>. <strong>Qualibat 5232</strong> (application de mousse polyuréthane projetée) pour la <strong>mousse projetée</strong>. Vérification gratuite sur <a href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a>. Sans Qualibat valide à la date du devis : pas d’aide MPR, pas de CEE, pas de TVA 5,5 %.',
  },
  {
    question: 'ROI : combien d’années pour rentabiliser ?',
    answer:
      '<strong>3 à 5 ans</strong> typique — <strong>le ROI le plus court de tout le plancher bas</strong> grâce au prix au m² faible (25-55 €/m²) et à l’éligibilité MPR/CEE qui couvre 30-50 % du devis. Économie facture chauffage : <strong>5-10 % typique</strong>. Sur facture annuelle 2 500 € (gaz/fioul), gain 125-250 €/an. <strong>Bénéfice secondaire majeur</strong> : confort thermique au sol (sols qui passent de 12 °C à 18-19 °C). ROI plus court en zone H1 (Nord/Est) qu’en H3 (Méditerranée).',
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
  { label: 'ADEME — Guide humidité dans les caves', url: 'https://www.ademe.fr' },
  { label: 'Anah — MaPrimeRénov’ par geste', url: 'https://www.anah.gouv.fr' },
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
    label: 'Isolation vide-sanitaire',
    href: '/renovation-energetique/travaux/isolation/sol/vide-sanitaire',
    description: 'VS bas / accessible — panneaux ou mousse projetée',
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
    section: 'Isolation cave plafond',
    keywords: [
      'isolation cave plafond',
      'isolation cave humide',
      'isolation sous-sol',
      'isolation sous-sol humide',
      'plancher bas cave',
      'cee bar-en-103',
      'qualibat 7131',
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
    { name: 'Cave plafond', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides isolation cave plafond 2026 (CEE BAR-EN-103)',
    description:
      'Isolation du plafond de cave / sous-sol non chauffé éligible à MaPrimeRénov’ par geste, CEE BAR-EN-103, Coup de pouce isolation, éco-PTZ et TVA 5,5 %. R minimum 3 m².K/W. Forfait CEE H1 1 600, H2 1 300, H3 900 kWhc/m² maison. Installation par RGE Qualibat 7131 (panneaux/laine) ou 5232 (mousse PU) obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique isolation cave plafond',
    audience: 'Propriétaires occupants',
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
              { label: 'Cave plafond' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Building className="w-3.5 h-3.5" aria-hidden />
              Cave plafond 2026 — CEE BAR-EN-103
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation cave plafond 2026 : techniques, prix, aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Isoler le <strong>plafond de la cave par dessous</strong> est{' '}
              <strong>la solution la plus rentable</strong> du plancher bas. Cave accessible debout
              = pose en plafond depuis dessous. <strong>25-55 €/m² posé</strong> selon matériau
              (PIR, laine de roche, mousse PU). <strong>Aucune gêne dans le logement</strong>. Aides
              2026 cumulables : MaPrimeRénov’ + CEE BAR-EN-103 (R ≥ 3 m².K/W) + Coup de pouce + TVA
              5,5 %.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="techniques">Les 3 techniques d’isolation cave plafond</h2>
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

            <h2 id="profil">Quelle technique selon votre cave</h2>
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
              <Droplets className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Cave humide : traiter avant d’isoler</p>
                <p className="m-0">
                  Isoler une cave humide sans diagnostic = pourriture des solives bois et
                  moisissures sous l’isolant en 2-3 ans. Étapes : (1){' '}
                  <strong>diagnostic humidité</strong> (200-500 €), (2) <strong>traitement</strong>{' '}
                  (drainage périphérique, cuvelage, ventilation), (3) une fois cave sèche depuis ≥ 1
                  mois : <strong>isolation avec frein-vapeur</strong> + matériau résistant (PIR/PUR
                  ou mousse PU).
                </p>
              </div>
            </div>

            <div className="not-prose border-2 border-sand-300 bg-sand-100 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-charcoal-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-charcoal-900">
                <p className="font-semibold m-0 mb-1">Maintenir la ventilation de la cave</p>
                <p className="m-0">
                  Une fois le plafond isolé, la cave perd la chaleur résiduelle qu’elle recevait du
                  logement par le plancher. Sans <strong>ventilation correcte</strong>, l’humidité
                  peut s’accumuler. Vérifier les <strong>grilles d’aération</strong> ou ajouter une
                  bouche VMC simple flux côté cave.
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
                <strong>Éco-PTZ</strong> jusqu’à 30 000 €.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur fourniture + pose par RGE Qualibat.
              </li>
            </ul>

            <h2 id="cta">Devis isolation cave plafond</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis cave plafond en 30 secondes</strong> — artisans certifiés Qualibat
                7131 (ITI) ou 5232 (mousse PU) pour ouvrir droit à MPR + CEE BAR-EN-103.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis cave plafond <ArrowRight className="w-4 h-4" aria-hidden />
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
