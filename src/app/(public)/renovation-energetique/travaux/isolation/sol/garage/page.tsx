/**
 * /renovation-energetique/travaux/isolation/sol/garage — Levier A2.
 *
 * @kw-primary    isolation sol garage
 * @kw-volume     200
 * @kw-kd         2
 * @kw-cpc        0.45
 * @cluster       7
 * @ahrefs-source local snapshot 2026-05-04 (docs/audit-ahrefs-2026-05-03)
 *
 * KW cibles snapshot 2026-05-04 :
 * - "isolation sol garage"        → 200 vol (Sonergia rank #2)
 * - "isolation sol garage sans chape" → 40 vol
 * - "isolation plafond garage"    → niche longue traîne
 *
 * Sub-page du hub /isolation/sol — focus exclusif garage attenant.
 *
 * Aides 2026 :
 *   - CEE BAR-EN-103 (R ≥ 3 m².K/W, plancher sur passage couvert /
 *     garage non chauffé) — éligible.
 *   - MaPrimeRénov' isolation plancher bas par geste.
 *   - Coup de pouce isolation, éco-PTZ, TVA 5,5 %.
 *
 * Label RGE : Qualibat 7131 (ITI — plafond garage par dessous) ou
 * 5232 (mousse PU si garage bas).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Car, AlertTriangle } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/isolation/sol/garage'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Isolation sol garage 2026 : techniques, prix, aides'
const DESCRIPTION =
  'Isolation sol garage 2026 : par dessous au plafond du garage 25-50 €/m² posé. Bonus acoustique. Aides MPR + CEE BAR-EN-103 (R ≥ 3 m².K/W).'

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
  'Garage attenant non chauffé = passage couvert au sens BAR-EN-103. Le plancher au-dessus est éligible aux aides plancher bas.',
  'Solution n°1 : <strong>isoler le plafond du garage par dessous</strong> avec PIR/PUR rigide ou laine de roche. <strong>25-50 €/m² posé</strong>. Aucune gêne dans le logement.',
  'Bonus <strong>acoustique</strong> : laine de roche réduit les bruits de moteur, portes claquées, marteau-piqueur.',
  '⚠ Vérifier <strong>hauteur résiduelle</strong> pour le véhicule après isolation (perte 8-12 cm typique). Adapter épaisseur si garage bas.',
  'Aides cumulables : CEE BAR-EN-103 (R ≥ 3 m².K/W) + MaPrimeRénov’ + Coup de pouce + TVA 5,5 %.',
  'Réaction au feu : préférer matériaux M0/M1 ou A1 (laine de roche) face au risque incendie véhicule.',
]

const TECHNIQUES = [
  {
    technique: 'Panneaux PIR/PUR rigides en plafond',
    prix: '30-55 €/m² posé',
    epaisseur: '80-120 mm',
    detail:
      'Panneaux rigides collés + chevillés en plafond du garage. R 4-5,5 m².K/W typique. Pose rapide (200-400 m²/jour). Hauteur perdue 10-13 cm. Finition apparente acceptable ou plaque BA13 en parement.',
    fire: 'Réaction au feu PIR : Euroclasse E sans protection, ou B-s2,d0 protected. Vérifier classement produit certifié.',
  },
  {
    technique: 'Laine de roche en plafond + plaque BA13',
    prix: '25-45 €/m² posé',
    epaisseur: '160-200 mm',
    detail:
      'Laine de roche entre suspentes + plaque BA13 en parement. R 5-6 m².K/W. Réaction au feu A1 (incombustible) — sécurité maximale en garage. Finition propre. Hauteur perdue 18-22 cm.',
    fire: 'Euroclasse A1 — incombustible. Idéal garage avec véhicule à moteur.',
  },
  {
    technique: 'Mousse polyuréthane projetée',
    prix: '35-65 €/m² posé',
    epaisseur: '80-120 mm projetés',
    detail:
      'Si plafond garage irrégulier ou présence gaines + canalisations apparentes. Mousse adhère partout. Étanchéité air automatique. Hauteur perdue 8-12 cm. Qualibat 5232.',
    fire: 'Réaction au feu PU : E sans protection. À protéger par plaque BA13 si réglementation locale impose.',
  },
]

const PROFILS = [
  {
    cas: 'Garage attenant standard hauteur 2,40-2,60 m',
    recommandation: 'Panneaux PIR 100 mm + finition légère',
    justification:
      '30-55 €/m² posé. R ≈ 4,5 m².K/W. Hauteur résiduelle 2,28-2,48 m largement suffisante pour SUV/break. Pose 1-2 jours pour garage 20 m². ROI 4-6 ans.',
  },
  {
    cas: 'Garage bas (hauteur < 2,30 m)',
    recommandation: 'Mousse polyuréthane projetée 80 mm',
    justification:
      'Hauteur perdue minimale (~9 cm) — préserve passage véhicule. R ≈ 3,6 m².K/W. Étanchéité air bonus. 35-65 €/m² posé. Vérifier hauteur SUV / 4×4 avant chantier.',
  },
  {
    cas: 'Garage avec véhicule à moteur thermique stocké',
    recommandation: 'Laine de roche A1 + plaque BA13',
    justification:
      'Sécurité incendie maximale (incombustible). 25-45 €/m². R 5-6 m².K/W. Hauteur perdue 18-22 cm. Finition BA13 nette (peinture compatible). Bonus acoustique pour bruits de moteur.',
  },
  {
    cas: 'Garage humide (condensation, infiltrations)',
    recommandation: 'Diagnostic humidité préalable + matériau résistant',
    justification:
      'Isoler un garage humide sans traitement = pourriture du plancher bois ou acier corrodé. Drainage / étanchéité avant isolation. Préférer PIR/PUR (résistant humidité) plutôt que laine sensible.',
  },
  {
    cas: 'Garage avec gaines / câbles / canalisations apparentes',
    recommandation: 'Mousse projetée (englobe les gaines)',
    justification:
      'Mousse adhère partout : gaines, prises, canalisations. Solution rapide. Repérer en amont les gaines à laisser accessibles (eau chaude, électricité, ventilation).',
  },
]

const PRIX_DETAIL = [
  {
    poste: 'PIR/PUR 100 mm en plafond garage',
    prix: '30-55 €/m² posé',
    note: 'R ≈ 4,5 m².K/W. Inclut panneaux + collage + chevillage. Finition apparente ou BA13 option.',
  },
  {
    poste: 'Laine de roche 200 mm + plaque BA13',
    prix: '25-45 €/m² posé',
    note: 'R ≈ 5,5 m².K/W. Classement feu A1 (sécurité incendie max).',
  },
  {
    poste: 'Mousse PU projetée 80 mm',
    prix: '35-55 €/m² posé',
    note: 'R ≈ 3,6 m².K/W. Idéal garage bas ou plafond irrégulier.',
  },
  {
    poste: 'Mousse PU projetée 120 mm + protection BA13',
    prix: '55-75 €/m² posé',
    note: 'R ≈ 5,5 m².K/W. Performance + sécurité feu (BA13 protège mousse).',
  },
  {
    poste: 'Diagnostic humidité garage',
    prix: '150-400 €',
    note: 'Recommandé si traces condensation, taches, odeur. Identifie cause + plan traitement.',
  },
]

const faqs = [
  {
    question: 'Le garage attenant est-il éligible à BAR-EN-103 ?',
    answer:
      '<strong>Oui, sous condition</strong>. La fiche DGEC <strong>BAR-EN-103</strong> cible « plancher sur sous-sol non chauffé, vide-sanitaire <strong>ou passage ouvert</strong> ». Un garage attenant <strong>non chauffé</strong> est assimilé à un passage ouvert (espace non chauffé sous le logement). R ≥ 3 m².K/W requis. Source : <a href="https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20mod%20A29-2.pdf" rel="noopener noreferrer" target="_blank">fiche DGEC vA29-2</a>. Si le garage est <strong>chauffé</strong> (rare), il devient une pièce du logement et n’est plus éligible BAR-EN-103.',
  },
  {
    question: 'Faut-il isoler le sol du garage ou le plafond ?',
    answer:
      '<strong>Le plafond du garage</strong> dans 95 % des cas. C’est l’<strong>élément qui sépare le logement chauffé du garage non chauffé</strong>. Isoler le sol du garage (béton sur terre-plein) est inutile thermiquement (pas de différence de température entre garage et terre). Exception : si le garage est <strong>chauffé</strong> (atelier hobby, salle home cinéma) — dans ce cas, isoler le sol béton fait sens, mais sortir du cadre BAR-EN-103.',
  },
  {
    question: 'Vais-je perdre de la hauteur sous plafond du garage ?',
    answer:
      'Oui : <strong>8 à 22 cm</strong> selon technique. (1) <strong>PIR/PUR 100 mm</strong> : 10-13 cm avec finition. (2) <strong>Laine de roche 200 mm + BA13</strong> : 18-22 cm. (3) <strong>Mousse PU projetée 80 mm</strong> : 8-12 cm. <strong>Vérifier la hauteur résiduelle</strong> avant chantier : SUV / 4×4 / véhicule utilitaire peuvent atteindre 2 m de haut. Si garage 2,30 m initial - 22 cm BA13 = 2,08 m → marge faible. Préférer mousse PU si hauteur critique.',
  },
  {
    question: 'Quel matériau choisir face au risque incendie ?',
    answer:
      '<strong>Laine de roche A1</strong> est le choix le plus sûr (incombustible — Euroclasse A1). PIR/PUR en mousse rigide : Euroclasse E sans protection, ou B-s2,d0 protected (PIR à haute densité). Mousse PU projetée : E sans protection. <strong>Recommandation</strong> : si véhicule à moteur thermique stocké, préférer laine de roche A1, ou systématiquement protéger PIR/PU par <strong>plaque BA13</strong> en parement. Vérifier réglementation locale (PLU, copropriété, assurance habitation peut exiger un classement minimal).',
  },
  {
    question: 'Combien coûte l’isolation d’un garage 20 m² ?',
    answer:
      'Pour <strong>garage 20 m²</strong> : (1) <strong>PIR 100 mm + finition</strong> : 30-55 €/m² × 20 = <strong>600-1 100 €</strong>. (2) <strong>Laine de roche 200 mm + BA13</strong> : 25-45 €/m² × 20 = <strong>500-900 €</strong>. (3) <strong>Mousse PU 100 mm</strong> : 40-65 €/m² × 20 = <strong>800-1 300 €</strong>. <strong>Aides à déduire</strong> : MaPrimeRénov’ par geste (forfait selon revenus), CEE BAR-EN-103 (~3-8 €/m² typique soit 60-160 € pour 20 m²), Coup de pouce ménages modestes. Reste à charge typique 30-50 % du devis.',
  },
  {
    question: 'L’isolation du plafond du garage améliore-t-elle aussi l’acoustique ?',
    answer:
      'Oui, <strong>significativement</strong> avec la <strong>laine de roche</strong> ou la fibre de bois (matériaux denses). Bruits réduits : <strong>moteur démarrage</strong>, <strong>portes claquées</strong>, <strong>marteau-piqueur</strong>, <strong>perceuses</strong>, <strong>rangement d’outils</strong>. Gain typique +10 à +18 dB sur bruits d’impact. PIR/PUR rigide : bonus acoustique faible (matériau léger, peu absorbant). Mousse PU projetée : bonus modéré. Pour acoustique optimale, combiner laine de roche 200 mm + suspentes anti-vibratiles + BA13 phonique.',
  },
  {
    question: 'Quel artisan RGE pour isoler le plafond du garage ?',
    answer:
      'Selon la technique : <strong>Qualibat 7131</strong> (isolation thermique par l’intérieur — couvre plancher bas par dessous via panneaux + plaques) pour les <strong>panneaux rigides ou laine + BA13</strong>. <strong>Qualibat 5232</strong> (application de mousse polyuréthane projetée — mention spécifique application mousse PU) pour la <strong>mousse projetée</strong>. Vérification gratuite sur <a href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a>. Sans Qualibat valide : pas d’aide MPR ni CEE.',
  },
  {
    question: 'ROI : combien d’années pour rentabiliser ?',
    answer:
      '<strong>4 à 7 ans</strong> typique selon zone climatique et combustible. Garage attenant ~ 6-10 % des déperditions du logement. Économie facture chauffage : <strong>4-8 % typique</strong>. Sur facture annuelle 2 500 € (gaz/fioul), gain 100-200 €/an. <strong>Bénéfice secondaire majeur</strong> : confort thermique au sol (sols qui passent de 12 °C à 18 °C) + réduction sensation pieds froids dans pièces au-dessus du garage. ROI plus court en zone H1 (Nord/Est) qu’en H3 (Méditerranée).',
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
  { label: 'CSTB — DTU 25.41 (plâtrerie sèche)', url: 'https://www.cstb.fr' },
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
    label: 'Isolation cave / sous-sol non chauffé',
    href: '/renovation-energetique/travaux/isolation/sol/cave-plafond',
    description: 'Plafond cave par dessous — solution la plus rentable',
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
    section: 'Isolation sol garage',
    keywords: [
      'isolation sol garage',
      'isolation plafond garage',
      'isolation sol garage sans chape',
      'cee bar-en-103',
      'qualibat 7131',
      'mousse polyurethane projetee',
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
    { name: 'Garage', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides isolation plafond garage 2026 (CEE BAR-EN-103)',
    description:
      'Isolation du plafond du garage attenant non chauffé éligible à MaPrimeRénov’ par geste, CEE BAR-EN-103, Coup de pouce isolation, éco-PTZ et TVA 5,5 %. R minimum 3 m².K/W. Forfait CEE H1 1 600, H2 1 300, H3 900 kWhc/m² maison. Installation par RGE Qualibat 7131 (panneaux/laine) ou 5232 (mousse PU) obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique isolation plafond garage',
    audience: 'Propriétaires occupants pavillonnaires',
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
              { label: 'Garage' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Car className="w-3.5 h-3.5" aria-hidden />
              Sol garage 2026 — CEE BAR-EN-103
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation sol garage 2026 : techniques, prix, aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Très fréquent en pavillon : un <strong>garage attenant non chauffé</strong> sous une
              partie habitable. Isoler le <strong>plafond du garage</strong> par dessous (PIR, laine
              de roche, mousse PU) : <strong>25-50 €/m² posé</strong>. Bonus{' '}
              <strong>acoustique</strong> avec laine de roche.{' '}
              <strong>Aides cumulables 2026</strong> : MaPrimeRénov’ + CEE BAR-EN-103 (R ≥ 3 m².K/W)
              + Coup de pouce + TVA 5,5 %.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="techniques">Les 3 techniques d’isolation du plafond garage</h2>
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
                  <p className="text-xs text-amber-700 font-medium m-0 italic">{t.fire}</p>
                </div>
              ))}
            </div>

            <h2 id="profil">Quelle technique selon votre garage</h2>
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
                <p className="font-semibold m-0 mb-1">
                  Vérifier la hauteur résiduelle pour le véhicule
                </p>
                <p className="m-0">
                  Perte typique : <strong>8-22 cm</strong> selon technique. SUV / 4×4 / utilitaires
                  peuvent atteindre 2 m de hauteur. Si garage 2,30 m → après laine + BA13 reste 2,08
                  m. Mesurer le véhicule avant chantier. Préférer <strong>mousse PU 80 mm</strong>{' '}
                  (perte 8-12 cm) si hauteur critique.
                </p>
              </div>
            </div>

            <h2 id="aides">Aides 2026 — CEE BAR-EN-103</h2>
            <p>
              Le garage attenant <strong>non chauffé</strong> est assimilé à un « passage ouvert »
              au sens BAR-EN-103. Aides cumulables :
            </p>
            <ul>
              <li>
                <strong>CEE BAR-EN-103</strong> — R ≥ 3 m².K/W, RGE obligatoire. Forfait kWhc/m²
                maison H1 1 600, H2 1 300, H3 900.
              </li>
              <li>
                <strong>MaPrimeRénov’</strong> par geste isolation plancher bas — forfait selon
                revenus.
              </li>
              <li>
                <strong>Coup de pouce isolation</strong> ménages modestes / très modestes.
              </li>
              <li>
                <strong>Éco-PTZ</strong> jusqu’à 30 000 €.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur fourniture + pose par RGE.
              </li>
            </ul>

            <h2 id="cta">Devis isolation sol garage</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis sol garage en 30 secondes</strong> — artisans certifiés Qualibat 7131
                (ITI) ou 5232 (mousse PU) pour ouvrir droit à MPR + CEE BAR-EN-103.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis sol garage <ArrowRight className="w-4 h-4" aria-hidden />
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
