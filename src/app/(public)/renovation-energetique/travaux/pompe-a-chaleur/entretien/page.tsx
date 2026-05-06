/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/entretien
 *
 * @kw-primary    prix entretien pompe a chaleur
 * @kw-volume     500
 * @kw-kd         1
 * @kw-cpc        0.68
 * @cluster       2
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3)
 * @backlog-item  Levier-C-pac-entretien
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "prix entretien pompe a chaleur"          →  500 vol, KD 1 (Travaux.com #9)
 * - "tarif entretien pompe a chaleur air-eau" →  400 vol, KD 0 (Travaux.com #3)
 * - "entretien pompe a chaleur autour de moi" →  400 vol, KD 0 (Travaux.com #5)
 * - "contrat entretien pompe a chaleur"       →  ~250 vol estimé, KD 1
 * - "entretien obligatoire pompe a chaleur"   →  ~150 vol estimé, intent légal
 * - Famille cumulée pivot : ~1 700 vol/mois
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 *          (snapshot Ahrefs Bloc 1 v3 2026-05-04)
 * Easy win : OUI (KD 0-1 sur 4 KW pivots, intent post-install récurrent)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Entretien
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur = comparatif 3 types + prix (intent achat)
 *   - /air-eau-prix, /air-air-prix, /geothermie = sous-pages prix par type
 *   - Cette page = POST-INSTALLATION récurrent (intent légal + tarif annuel),
 *     pas de chevauchement « prix d'achat ».
 *
 * YMYL : page légale/sécurité (décret 2020-912 + F-Gas UE 517/2014).
 * Cite Légifrance + ADEME + AFPAC + Code de l'environnement.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ClipboardCheck,
  Euro,
  FileText,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/entretien'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Entretien PAC 2026 : prix & obligation légale'
const DESCRIPTION =
  'Entretien pompe à chaleur 2026 : obligatoire tous les 2 ans (décret 2020-912). Prix contrat 150-300 €/an. Que vérifie le pro ?'

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
  'Entretien obligatoire tous les 2 ans pour les PAC de 4 à 70 kW (décret 2020-912 codifié au Code de l’environnement R224-59-2).',
  'Prix d’un contrat annuel 2026 : 150 à 300 € TTC selon marque et niveau (visite + main-d’œuvre + petites pièces).',
  'Intervention ponctuelle hors contrat : 200 à 400 € TTC. Dépannage : 80-150 €/h HT + déplacement 30-80 €.',
  'Contrôle d’étanchéité fluide frigorigène : annuel si charge ≥ 2 tCO2-eq, par technicien attestation fluides catégorie I (Règlement UE 517/2014).',
  'Sans entretien attesté : garantie fabricant + assurance habitation peuvent être refusées en cas de sinistre.',
]

const QUI_PEUT = [
  {
    title: 'Attestation de capacité fluides catégorie I',
    desc: 'Obligatoire pour intervenir sur le circuit frigorifique (Règlement UE 517/2014 + Décret 2015-1790). À demander avant signature du contrat.',
    must: 'Obligatoire',
  },
  {
    title: 'Label RGE QualiPAC',
    desc: 'Pas requis pour l’entretien (uniquement pour l’installation et l’accès aux aides MPR/CEE). Mais bon indicateur de sérieux pour la maintenance.',
    must: 'Recommandé',
  },
  {
    title: 'Mention « entreprise détenant l’attestation 517/2014 »',
    desc: 'Cherchez ce libellé sur le devis ou le contrat. Sans cette attestation, l’intervention sur le compresseur est illégale.',
    must: 'Obligatoire',
  },
  {
    title: 'Constructeur ou installateur d’origine',
    desc: 'Avantages : pièces détachées garanties, base technique du modèle. Inconvénient : prix souvent +20 à 40 % vs un chauffagiste local indépendant.',
    must: 'Optionnel',
  },
]

const CHECKLIST_ENTRETIEN = [
  'Contrôle visuel unité extérieure (corrosion, givre persistant, vibrations anormales)',
  'Vérification de la charge en fluide frigorigène (R32, R290, R410A selon modèle)',
  'Test d’étanchéité du circuit frigorifique (obligatoire annuel si ≥ 2 tCO2-eq)',
  'Nettoyage du condenseur, de l’évaporateur et des filtres à air',
  'Contrôle des sécurités électriques (haute pression, basse pression, dégivrage)',
  'Vérification du COP/SCOP réel mesuré vs spécifications constructeur',
  'Test du circuit hydraulique (pression, vase d’expansion, pompe de circulation)',
  'Mise à jour du logiciel de régulation et calibration des sondes',
  'Remise d’une attestation d’entretien sous 15 jours (article R224-59-3 Code env.)',
]

const PRIX_CONTRATS = [
  {
    type: 'Contrat « basique »',
    price: '150 - 200 € / an TTC',
    inclusions: 'Visite annuelle, main-dœuvre, petites pièces (filtres, joints).',
    notInclude: 'Pièces de rechange majeures (compresseur, carte électronique).',
  },
  {
    type: 'Contrat « confort »',
    price: '200 - 300 € / an TTC',
    inclusions: 'Visite + dépannages illimités sur l’année + remplacement pièces d’usure.',
    notInclude: 'Compresseur, échangeurs (couverts par garantie fabricant 5-10 ans).',
  },
  {
    type: 'Contrat « tout inclus »',
    price: '300 - 450 € / an TTC',
    inclusions: 'Visite + dépannages + remplacement pièces majeures sauf compresseur.',
    notInclude:
      'Compresseur (garantie fabricant uniquement). Plafonnement annuel sur certains contrats.',
  },
  {
    type: 'Intervention ponctuelle',
    price: '200 - 400 € TTC / visite',
    inclusions: 'Visite biennale réglementaire seule, sans engagement.',
    notInclude: 'Aucune couverture dépannage. Dépannage facturé en sus 80-150 €/h HT.',
  },
]

const RISQUES_NON_ENTRETIEN = [
  {
    title: 'Garantie fabricant suspendue',
    desc: 'La majorité des constructeurs (Daikin, Atlantic, Mitsubishi, Bosch) conditionnent leurs garanties (5 à 10 ans) à un entretien annuel attesté. En cas de panne sans attestation, la garantie tombe.',
  },
  {
    title: 'Refus d’indemnisation assurance habitation',
    desc: 'Une fuite de fluide frigorigène ou un sinistre électrique sans entretien réglementaire peut conduire l’assureur à invoquer la « négligence » et refuser la prise en charge.',
  },
  {
    title: 'Surconsommation 15-25 % par an',
    desc: 'Un échangeur encrassé, un fluide en charge insuffisante ou une régulation déréglée font chuter le COP. Sur 10 ans, le surcoût électricité dépasse souvent 1 500 €.',
  },
  {
    title: 'Risque environnemental (F-Gas)',
    desc: 'Les fluides R410A, R32 ont un PRG élevé. Une fuite non détectée à temps coûte cher et est sanctionnée si l’unité dépasse 5 tCO2-eq sans contrôle annuel (article R543-79-1 Code env.).',
  },
]

const faqs = [
  {
    question: 'L’entretien d’une pompe à chaleur est-il vraiment obligatoire ?',
    answer:
      'Oui, depuis le décret 2020-912 du 28 juillet 2020 (codifié aux articles R224-59-1 à R224-59-7 du Code de l’environnement). L’entretien est obligatoire tous les 2 ans pour toute PAC de puissance thermique nominale comprise entre 4 et 70 kW. Une attestation doit être remise au commanditaire dans les 15 jours suivant la visite. Pour les PAC contenant ≥ 2 tCO2-eq de fluide frigorigène, un contrôle d’étanchéité annuel s’ajoute (Règlement UE 517/2014).',
  },
  {
    question: 'Combien coûte précisément un entretien de PAC en 2026 ?',
    answer:
      'Comptez 150 à 300 € TTC pour un contrat annuel selon la marque et le niveau de service. Une intervention ponctuelle (visite biennale réglementaire seule) coûte 200 à 400 € TTC. Le dépannage hors contrat est facturé 80 à 150 € HT/h plus 30 à 80 € de déplacement. Pour une PAC air-air, le tarif est généralement de 100 à 180 € TTC, plus bas qu’une PAC air-eau (circuit hydraulique en plus).',
  },
  {
    question: 'Qui peut entretenir une pompe à chaleur ?',
    answer:
      'Le professionnel doit détenir l’attestation de capacité fluides frigorigènes de catégorie I (Règlement européen 517/2014 + Décret 2015-1790 du 28 décembre 2015). Cette attestation autorise toute intervention sur le circuit frigorifique. Le label RGE QualiPAC n’est pas obligatoire pour l’entretien (il l’est pour l’installation initiale et l’accès aux aides MaPrimeRénov’/CEE), mais reste un bon indicateur de sérieux.',
  },
  {
    question: 'Que vérifie un technicien lors d’un entretien PAC ?',
    answer:
      'Le technicien vérifie : la charge en fluide frigorigène, l’étanchéité du circuit, l’état du compresseur, le nettoyage du condenseur et de l’évaporateur, les filtres à air, les sécurités électriques, le COP/SCOP réel, le circuit hydraulique (pour PAC air-eau), la régulation et les sondes. Il remet ensuite une attestation d’entretien obligatoire sous 15 jours, à conserver pour justifier auprès de l’assurance habitation et préserver la garantie fabricant.',
  },
  {
    question: 'Que se passe-t-il si je ne fais pas l’entretien obligatoire ?',
    answer:
      'Trois conséquences principales : (1) la garantie fabricant peut être suspendue (la plupart des constructeurs l’exigent contractuellement), (2) l’assurance habitation peut refuser une indemnisation en cas de sinistre lié à la PAC, (3) en cas de fuite de fluide non détectée, des sanctions environnementales s’appliquent si l’unité dépasse 5 tCO2-eq de charge (article R543-79-1 du Code de l’environnement). Le décret 2020-912 ne prévoit pas d’amende directe mais l’obligation est opposable au propriétaire en cas de litige.',
  },
  {
    question: 'Le contrat d’entretien est-il vraiment plus avantageux ?',
    answer:
      'Si la PAC tourne sans incident, l’intervention ponctuelle biennale coûte moins cher que 2 années de contrat (~200-400 € vs 300-600 €). Le contrat devient avantageux dès qu’un dépannage survient (souvent 200-400 € hors contrat). Pour les PAC > 5 ans hors garantie fabricant, le contrat « confort » avec dépannages illimités est généralement rentable. Comparez bien les exclusions (compresseur, carte électronique) et le plafond annuel d’intervention.',
  },
  {
    question: 'Puis-je entretenir moi-même ma pompe à chaleur ?',
    answer:
      'Vous pouvez réaliser le nettoyage des filtres à air et l’entretien extérieur (dégivrage, nettoyage du capot, retrait feuilles mortes autour de l’unité). En revanche, toute intervention sur le circuit frigorifique (compresseur, fluide, échangeurs internes) est strictement réservée à un professionnel détenant l’attestation fluides catégorie I (Règlement UE 517/2014). Sans cette attestation, l’intervention est illégale et la responsabilité civile/pénale est engagée.',
  },
  {
    question: 'Comment trouver un professionnel pour l’entretien de ma PAC ?',
    answer:
      'Vérifiez sur l’annuaire QualifelEnR (qualit-enr.org) ou France Rénov’ (france-renov.gouv.fr) que l’artisan détient bien une qualification valide. Demandez systématiquement le numéro d’attestation fluides catégorie I avant signature du contrat. Comparez 2-3 contrats : prix annuel TTC, exclusions, plafond annuel, délais d’intervention en cas de panne (4h, 24h, 48h selon contrat).',
  },
]

const sources = [
  {
    label: 'Légifrance — Décret 2020-912 entretien des PAC',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042159532',
  },
  {
    label: 'Légifrance — Code de l’environnement R224-59-1 à R224-59-7',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000042169486/',
  },
  {
    label: 'Règlement UE 517/2014 — F-Gas (gaz à effet de serre fluorés)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32014R0517',
  },
  {
    label: 'Décret 2015-1790 — attestations fluides frigorigènes catégories I-IV',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000031735745',
  },
  {
    label: 'AFPAC — Association française pour les pompes à chaleur',
    url: 'https://www.afpac.org',
  },
  { label: 'Qualit’EnR — Annuaire QualiPAC officiel', url: 'https://www.qualit-enr.org' },
  {
    label: 'ADEME — Guide entretien équipements de chauffage',
    url: 'https://librairie.ademe.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur (3 types comparés)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Prix PAC air-eau 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
  },
  {
    label: 'Prix PAC air-air 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
  },
  {
    label: 'Prix géothermie 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/geothermie',
  },
  {
    label: 'Trouver un chauffagiste RGE QualiPAC',
    href: '/rge/chauffagiste',
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
    section: 'Travaux — PAC — Entretien',
    keywords: [
      'entretien pompe à chaleur',
      'prix entretien PAC',
      'contrat entretien PAC',
      'entretien obligatoire PAC',
      'tarif entretien pompe à chaleur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Entretien PAC', url: PAGE_PATH },
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
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Entretien PAC' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" aria-hidden />
              Entretien PAC &middot; Obligation légale 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Entretien d’une pompe à chaleur en 2026 : obligation, prix, checklist
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Depuis le <strong>décret 2020-912</strong>, l’entretien d’une pompe à chaleur de 4 à
              70 kW est <strong>obligatoire tous les 2 ans</strong>. Comptez{' '}
              <strong>150 à 300 € TTC par an</strong> pour un contrat, ou 200-400 € pour une visite
              ponctuelle. Sans attestation d’entretien, garantie fabricant et assurance peuvent être
              suspendues. Voici qui peut intervenir, ce qui doit être vérifié et comment comparer 3
              contrats.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Le cadre légal en 2 minutes</h2>
            <p>
              L’entretien des PAC est régi par <strong>deux textes principaux</strong> :
            </p>
            <ul>
              <li>
                <strong>Décret 2020-912 du 28 juillet 2020</strong> : entretien obligatoire tous les
                2 ans pour toute PAC de 4 à 70 kW thermique. Codifié aux articles{' '}
                <strong>R224-59-1 à R224-59-7</strong> du Code de l’environnement. Une attestation
                d’entretien doit être remise au commanditaire dans les 15 jours suivants.
              </li>
              <li>
                <strong>Règlement UE 517/2014 (« F-Gas »)</strong> + Décret 2015-1790 : contrôle
                d’étanchéité <strong>annuel</strong> obligatoire si la charge de fluide frigorigène
                dépasse <strong>5 tCO2-eq</strong>, par un technicien titulaire de l’
                <strong>attestation de capacité fluides catégorie I</strong>.
              </li>
            </ul>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Sans entretien attesté = garantie fabricant et assurance habitation menacées.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    Conservez chaque attestation d’entretien : elle est exigée par la majorité des
                    constructeurs (Daikin, Atlantic, Bosch…) pour faire jouer la garantie 5-10 ans
                    et par les assureurs habitation en cas de sinistre lié à la PAC.
                  </p>
                </div>
              </div>
            </div>

            <h2>Qui peut entretenir une PAC légalement ?</h2>
            <p>
              Toute intervention sur le <strong>circuit frigorifique</strong> exige l’attestation de
              capacité fluides catégorie I (Règlement UE 517/2014). Sans cette attestation,
              l’intervention est illégale et la responsabilité civile + pénale est engagée.
            </p>
            <div className="not-prose grid gap-3 my-6">
              {QUI_PEUT.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          item.must === 'Obligatoire'
                            ? 'text-red-800 bg-red-50'
                            : item.must === 'Recommandé'
                              ? 'text-amber-800 bg-amber-50'
                              : 'text-sand-700 bg-sand-100'
                        }`}
                      >
                        {item.must}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>La checklist d’une visite d’entretien sérieuse</h2>
            <p>
              Une visite d’entretien complète dure 1 h 30 à 2 h 30. Voici les{' '}
              <strong>9 points</strong> qui doivent être vérifiés et figurer sur l’attestation
              remise dans les 15 jours :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <ul className="space-y-2 m-0 p-0">
                {CHECKLIST_ENTRETIEN.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sand-800 text-sm">
                    <ClipboardCheck
                      className="w-4 h-4 text-primary-700 shrink-0 mt-1"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h2>Prix d’un contrat d’entretien en 2026</h2>
            <p>
              Quatre formules dominent le marché. Le <strong>contrat « confort »</strong> est
              généralement le meilleur compromis pour une PAC hors garantie fabricant :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Formule</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Inclus</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">
                      Non inclus
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_CONTRATS.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.price}
                      </td>
                      <td className="p-3 hidden md:table-cell">{row.inclusions}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.notInclude}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes nationales 2026 PAC air-eau résidentielle 6-14 kW. PAC air-air : tarifs
                100 à 180 € / an TTC (pas de circuit hydraulique). PAC géothermique : tarifs 250 à
                450 € / an TTC.
              </p>
            </div>

            <h2>4 risques bien réels du « pas d’entretien »</h2>
            <div className="not-prose grid gap-3 my-6">
              {RISQUES_NON_ENTRETIEN.map((risk) => (
                <div
                  key={risk.title}
                  className="bg-white border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{risk.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{risk.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un chauffagiste pour l’entretien de votre PAC
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Demandez 3 devis comparés à des chauffagistes RGE QualiPAC vérifiés (attestation
                    fluides catégorie I + assurance décennale). Réponse sous 48 h.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/chauffagiste"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire chauffagistes RGE <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Comment comparer 3 contrats efficacement</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Attestation fluides catégorie I</strong> : exigez le numéro avant signature
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Périmètre des dépannages</strong> : illimités ? plafonnés ? exclus le
                week-end ?
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Délai garanti</strong> en cas de panne (4 h en hiver, 24 h, 48 h)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Pièces incluses</strong> : filtres, joints OK ; attention au compresseur
                souvent exclu
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Tacite reconduction</strong> : conditions de résiliation, préavis (1 à 3
                mois en général)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Modèle d’attestation</strong> remis : doit citer le décret 2020-912 et
                R224-59-3
              </li>
            </ul>

            <h2>Et l’entretien d’une PAC air-air, c’est différent ?</h2>
            <p>
              L’entretien d’une PAC air-air (climatisation réversible) suit le{' '}
              <strong>même décret 2020-912</strong> dès lors que la puissance dépasse 4 kW. La
              différence : pas de circuit hydraulique, donc visite plus rapide (1 h en moyenne) et
              tarif moindre (<strong>100 à 180 € / an TTC</strong>). Le contrôle d’étanchéité reste
              obligatoire si la charge de fluide dépasse 2 tCO2-eq. Pensez aussi au nettoyage
              régulier des filtres intérieurs (tous les 2-3 mois) que vous pouvez faire vous-même.
            </p>

            <h2>Économies sur la facture après entretien</h2>
            <p>
              Un entretien annuel rigoureux maintient le COP de la PAC à son niveau optimal et évite
              la dérive de 15 à 25 % de surconsommation observée sur les unités mal entretenues. Sur
              10 ans :
            </p>
            <ul>
              <li>
                <Euro className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Coût total
                contrat : ~2 000 € (10 × 200 €)
              </li>
              <li>
                <Euro className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Économie
                consommation évitée : ~1 500 € (sur facture électricité PAC)
              </li>
              <li>
                <FileText className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Garantie
                fabricant préservée : pas de remplacement compresseur prématuré (3 000-5 000 €
                évités)
              </li>
            </ul>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedPages.map((g) => (
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

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Pompe à chaleur
            </Link>
            <Link
              href="/rge/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes RGE QualiPAC <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
