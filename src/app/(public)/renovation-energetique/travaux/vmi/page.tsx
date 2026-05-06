/**
 * Page : /renovation-energetique/travaux/vmi
 *
 * @kw-primary    vmi
 * @kw-volume     4600
 * @kw-kd         1
 * @kw-cpc        0.10
 * @cluster       6
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster ventilation insufflation)
 * @backlog-item  Levier-J-vmi
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "vmi"                4 600 vol, KD 1 ⭐⭐⭐ MEGA EASY pivot
 * - VMI = Ventilation Mécanique par Insufflation, opposé conceptuel de la VMC.
 * - Travaux.com positionné #10 (faible) — niche vraiment ouverte.
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MAJEUR (KD 1, 0 acteur RGE-first, pivot principal sans cluster déjà couvert)
 * Cluster pillar : Rénovation Énergétique → Travaux → Ventilation → VMI (insufflation)
 *
 * Anti-cannibalisation :
 *   - /travaux/vmc                 = ventilation par EXTRACTION (4 familles)
 *   - /travaux/vmc/simple-flux     = VMC simple flux (extraction)
 *   - /travaux/vmc/hygroreglable   = VMC hygro (extraction)
 *   - /travaux/vmc-double-flux     = VMC DF (extraction + insufflation hors combles)
 *   - /travaux/vmc/installation    = pose VMC
 *   - /travaux/vmc/entretien       = entretien VMC
 *   - Cette page = VMI = INSUFFLATION (air filtré + tempéré depuis combles)
 *     — métier ventilation mais technologie distincte. Souvent recommandé
 *     en rénovation maison ancienne quand VMC simple flux non praticable.
 *
 * YMYL medium : qualité air intérieur (ANSES), ventilation permanente Arrêté
 * 24/03/1982 modifié + Code construction R162. PAS éligible CEE BAR-TH-127
 * (qui cible la VMC double flux), donc pas d’aide MPR/CEE — point YMYL crucial.
 *
 * Cite : Arrêté 24/03/1982 modifié, Code construction R162, ANSES, ADEME guide
 * ventilation, normes NF DTU 68.3 (gaines), constructeurs Ventilairsec / Atlantic
 * Optima / Aldes Pulsiv'Air / Helios / Brink (information produit, pas
 * recommandation commerciale).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Wind,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Sparkles,
  Wrench,
  HardHat,
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

const PAGE_PATH = '/renovation-energetique/travaux/vmi'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'VMI 2026 : prix 3 500-7 000 €, fonctionnement, alternative VMC'
const DESCRIPTION =
  'VMI (Ventilation Mécanique par Insufflation) en 2026 : 3 500-7 000 € posée. Fonctionnement, comparatif VMC, avantages humidité, conditions. Pas d’aide MPR/CEE.'

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
  'VMI = Ventilation Mécanique par Insufflation : insuffle de l’air filtré et tempéré depuis les combles vers les pièces de vie. Inverse logique de la VMC (extraction).',
  'Prix moyen 2026 posé : 3 500-7 000 € selon surface et fabricant (Ventilairsec, Atlantic Optima, Aldes Pulsiv’Air, Helios, Brink). Pose 1-2 jours.',
  'Avantages : qualité air ↑ (filtration F7 anti-pollens / PM2.5), humidité ↓, simple en rénovation. Inconvénients : bruit modéré, dépendance électrique.',
  'PAS d’aide MaPrimeRénov’ ni CEE pour la VMI : seuls les BAR-TH-127 (VMC double flux) et BAR-TH-125 (VMC hygro B) sont éligibles. Point YMYL critique.',
  'Idéal en rénovation maison ancienne sans VMC praticable, ou en complément si humidité résiduelle malgré une VMC simple flux. À comparer avec une VMC double flux.',
  'Entretien : filtres tous les 6 mois (G4 ou F7), visite annuelle moteur. Coût annuel ~150-300 €. Durée de vie 15-20 ans (caisson + ventilateur).',
]

const VMI_VS_VMC = [
  {
    critere: 'Principe',
    vmi: 'Insuffle air neuf filtré (depuis les combles vers les pièces de vie)',
    vmc: 'Extrait air vicié (depuis cuisine / SdB / WC vers extérieur)',
  },
  {
    critere: 'Prix posé 2026',
    vmi: '3 500 - 7 000 €',
    vmc: 'Simple flux 800-1 500, hygro 1 200-2 200, double flux 4 000-7 000',
  },
  {
    critere: 'Filtration',
    vmi: 'OUI (G4 ou F7 anti-pollens, PM2.5)',
    vmc: 'Simple/hygro = NON. Double flux = OUI (filtres entrée + sortie)',
  },
  {
    critere: 'Récupération chaleur',
    vmi: 'PARTIELLE (air des combles préchauffé en hiver)',
    vmc: 'Simple/hygro = NON. Double flux = OUI 70-90 %',
  },
  {
    critere: 'Aide MaPrimeRénov’ / CEE',
    vmi: 'NON éligible',
    vmc: 'Hygro B = BAR-TH-125, double flux = BAR-TH-127',
  },
  {
    critere: 'Réno maison ancienne',
    vmi: '⭐ Très adaptée (gainage faible, peu invasive)',
    vmc: 'VMC simple/hygro souvent compliquée, double flux nécessite gainage lourd',
  },
  {
    critere: 'Bruit',
    vmi: '20-30 dB(A) au pulsoir',
    vmc: '15-30 dB(A) selon caisson',
  },
]

const QUAND_VMI = [
  {
    title: 'Maison ancienne sans gainage VMC praticable',
    desc: 'Bâtiment > 50 ans, plafonds pleins, conduits inexistants : la VMI évite les saignées lourdes nécessaires à une VMC simple flux ou double flux.',
  },
  {
    title: 'Humidité résiduelle malgré VMC simple flux',
    desc: 'Si un cas de moisissures persiste malgré une VMC SF ou hygro qui fonctionne, la VMI peut être ajoutée en complément pour mettre la maison en surpression et chasser l’humidité par les défauts d’étanchéité.',
  },
  {
    title: 'Air extérieur très pollué (axes, agglomérations)',
    desc: 'La filtration F7 de la VMI (anti-pollens, PM2.5) peut être un argument santé majeur en bord d’axe routier ou en agglomération. À combiner avec des bouches d’extraction côté SdB / cuisine.',
  },
  {
    title: 'Maison sur vide sanitaire avec radon',
    desc: 'En zone à fort potentiel radon (Bretagne, Massif central, Vosges), la mise en surpression d’une VMI peut limiter les remontées de radon depuis le vide sanitaire vers les pièces de vie.',
  },
]

const POSE_ETAPES = [
  {
    title: 'Diagnostic préalable',
    desc: 'Visite technique : combles ventilés ou non, espace caisson, traversées, présence isolation soufflée, accès tableau électrique. Audit obligatoire avant devis.',
  },
  {
    title: 'Pose caisson en combles',
    desc: 'Caisson VMI fixé en suspente, raccordé à un ventilateur central + filtre G4 ou F7. Alimentation 230 V depuis tableau (différentiel 30 mA). Niveau sonore < 30 dB(A).',
  },
  {
    title: 'Distribution gaines + diffuseurs',
    desc: 'Gaines isolées (DTU 68.3) vers les pièces de vie (séjour, chambres). Diffuseurs en plafond ou haut de cloison. Diamètre standard 125-160 mm. 1 diffuseur par 15-25 m².',
  },
  {
    title: 'Mise en service + équilibrage',
    desc: 'Mesure des débits par anémomètre, équilibrage par bouche, vérification dépression / surpression. Notice utilisateur remise. Garantie pose 2 ans + matériel 3-5 ans.',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Installateur référencé constructeur',
    must: 'Recommandé',
    desc: 'Préférer un artisan agréé Ventilairsec, Atlantic Optima, Aldes, Helios ou Brink. Garantit la formation produit et l’accès aux pièces détachées sur 10-15 ans.',
  },
  {
    title: 'Diagnostic combles + audit étanchéité air',
    must: 'Obligatoire',
    desc: 'Sans diagnostic préalable (combles, étanchéité, pollutions extérieures), la VMI peut être contre-productive. Exigez un rapport écrit et un audit étanchéité à l’air si possible.',
  },
  {
    title: 'Devis détaillé avec mesure débits cible',
    must: 'Obligatoire',
    desc: 'Le devis doit mentionner : débit total ciblé en m³/h, marque + référence du caisson, gaines isolées, diffuseurs, équilibrage. Pas de « forfait global » opaque.',
  },
  {
    title: 'Garantie pose 2 ans + matériel 3-5 ans',
    must: 'Recommandé',
    desc: 'La garantie pose minimale est de 2 ans (responsabilité civile décennale). La garantie matériel constructeur va de 3 à 5 ans. Au-delà, l’assurance habitation peut intervenir.',
  },
  {
    title: 'Assurance RC pro travail en hauteur',
    must: 'Obligatoire',
    desc: 'Pose en combles = travail en hauteur (Code travail R4323-58). Vérifier l’attestation RC pro à jour avant signature, mentionnant ventilation et travail en combles.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’une VMI ?',
    answer:
      'VMI signifie « Ventilation Mécanique par Insufflation ». À l’inverse de la VMC qui extrait l’air vicié des pièces humides, la VMI insuffle de l’air filtré et tempéré depuis les combles vers les pièces de vie (séjour, chambres). Elle met le logement en légère surpression. Le système comprend un caisson en combles, un ventilateur, un filtre G4 ou F7, des gaines isolées et des diffuseurs en plafond. Les principaux fabricants en 2026 sont Ventilairsec, Atlantic Optima, Aldes Pulsiv’Air, Helios et Brink.',
  },
  {
    question: 'Combien coûte une VMI installée en 2026 ?',
    answer:
      'Le prix posé 2026 d’une VMI varie de 3 500 à 7 000 € TTC pour une maison de 80 à 150 m². Cela inclut le caisson, le ventilateur, le filtre, 4 à 8 diffuseurs, les gaines isolées et l’équilibrage à la mise en service. Pour comparaison : VMC simple flux 800-1 500 €, VMC hygroréglable 1 200-2 200 €, VMC double flux 4 000-7 000 €. La VMI se situe au niveau de la double flux en prix, mais sans récupération de chaleur intégrale.',
  },
  {
    question: 'Y a-t-il une aide MaPrimeRénov’ ou CEE pour la VMI ?',
    answer:
      'NON. La VMI n’est PAS éligible à MaPrimeRénov’ ni aux CEE. Seules deux solutions ventilation sont conventionnées : (1) BAR-TH-127 « VMC double flux » et (2) BAR-TH-125 « VMC simple flux hygroréglable de type B ». La VMI n’étant pas dans la nomenclature CEE, aucune prime ne peut être obtenue. Seule la TVA 10 % s’applique en logement de plus de 2 ans avec un artisan. Si vous voulez bénéficier d’une aide, il faut s’orienter vers une VMC double flux.',
  },
  {
    question: 'VMI ou VMC double flux : que choisir en 2026 ?',
    answer:
      'Tout dépend du logement : (1) Maison ancienne sans gainage facile + budget limité = VMI plus simple à installer, mais aucune aide. (2) Logement neuf ou très bien isolé + budget OK + recherche de récupération de chaleur = VMC double flux, plus performante en hiver et éligible CEE BAR-TH-127. (3) Maison avec humidité résiduelle malgré une VMC simple flux = VMI en complément. La VMC double flux récupère 70-90 % de la chaleur de l’air extrait, la VMI préchauffe seulement l’air des combles (gain modeste).',
  },
  {
    question: 'La VMI fonctionne-t-elle dans une maison étanche RT 2012 / RE 2020 ?',
    answer:
      'OUI mais avec précaution. La VMI met le logement en SURPRESSION : si l’étanchéité à l’air est très bonne (RE 2020, BBC ou Effinergie), il faut prévoir des bouches d’extraction passives ou actives en cuisine / SdB / WC pour évacuer l’air vicié. Sinon le logement étouffe et l’humidité reste piégée. Dans une maison RT 2012 / RE 2020, la VMC double flux est en général la solution recommandée — la VMI s’y adapte mais avec une étude technique précise.',
  },
  {
    question: 'À quelle fréquence faut-il entretenir une VMI ?',
    answer:
      'Filtres G4 standard : tous les 6 mois. Filtres F7 (anti-pollens, PM2.5) : tous les 3 mois en zone urbaine, tous les 6 mois en zone rurale. Visite annuelle complète : nettoyage caisson, contrôle moteur, mesure débits, équilibrage. Coût annuel total : 150-300 €. Durée de vie typique du caisson 15-20 ans, ventilateur 8-12 ans. Filtres = 30-80 € la paire selon type.',
  },
  {
    question: 'La VMI est-elle bruyante ?',
    answer:
      'En 2026, les VMI modernes affichent un niveau sonore au pulsoir entre 20 et 30 dB(A), comparable à une VMC silencieuse. Le caisson en combles est généralement insonorisé. Le bruit perceptible dépend surtout de la qualité de pose : suspentes anti-vibratiles, gaines isolées, diffuseurs en cassettes. Mauvaise pose = sifflement net, risque de bruits aérauliques. Exigez un test acoustique à la mise en service.',
  },
  {
    question: 'La VMI peut-elle remplacer la VMC ?',
    answer:
      'Pas systématiquement. La VMC évacue activement l’humidité depuis les pièces humides (cuisine, SdB, WC) — c’est sa principale fonction. La VMI met le logement en surpression mais ne crée pas un flux d’extraction direct. Dans la plupart des configurations, la VMI vient EN COMPLÉMENT de bouches passives ou d’une VMC simple flux légère. Pour le neuf RT 2012 / RE 2020, la double flux reste la solution la plus performante. La VMI est principalement un outil de rénovation maison ancienne.',
  },
]

const sources = [
  {
    label: 'Légifrance — Arrêté du 24 mars 1982 modifié (ventilation logements)',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006063839/',
  },
  {
    label: 'Légifrance — Code construction et habitation art. R162-1 à R162-6',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000006176010/',
  },
  {
    label: 'ADEME — Guide ventilation des logements',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'ANSES — Qualité de l’air intérieur',
    url: 'https://www.anses.fr/fr/content/qualité-de-l’air-intérieur',
  },
  {
    label: 'France Rénov’ — Fiches CEE BAR-TH-125 / 127 (VMC éligibles)',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'AFNOR / DTU 68.3 — installation gaines de ventilation',
    url: 'https://www.boutique.afnor.org',
  },
]

const relatedPages = [
  {
    label: 'Hub VMC (4 familles, extraction)',
    href: '/renovation-energetique/travaux/vmc',
  },
  {
    label: 'VMC double flux (récup chaleur, éligible CEE)',
    href: '/renovation-energetique/travaux/vmc-double-flux',
  },
  {
    label: 'VMC simple flux hygroréglable',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
  },
  {
    label: 'Entretien VMC',
    href: '/renovation-energetique/travaux/vmc/entretien',
  },
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
  },
  {
    label: 'Trouver un installateur ventilation',
    href: '/rge/renovation-energetique',
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
    section: 'Travaux — Ventilation — VMI',
    keywords: [
      'vmi',
      'ventilation mécanique par insufflation',
      'prix vmi',
      'vmi vs vmc',
      'vmi maison ancienne',
      'ventilairsec atlantic aldes',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMI', url: PAGE_PATH },
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'VMI' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wind className="w-3.5 h-3.5" aria-hidden />
              Ventilation &middot; VMI (insufflation)
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMI en 2026 : prix 3 500-7 000 €, fonctionnement et alternative à la VMC
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>VMI</strong> (Ventilation Mécanique par Insufflation) est une solution
              ventilation qui <strong>insuffle</strong> de l’air filtré depuis les combles vers les
              pièces de vie — l’inverse logique de la VMC. Prix moyen 2026 :{' '}
              <strong>3 500 à 7 000 €</strong> posée.{' '}
              <strong>Pas d’aide MaPrimeRénov’ ni CEE</strong> (réservées aux VMC double flux et
              hygro B). Idéale en rénovation maison ancienne où le gainage VMC n’est pas praticable.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>VMI vs VMC : 7 différences à connaître</h2>
            <p>
              Le choix entre une VMI et une VMC dépend du logement, du budget et de votre objectif.
              Voici la comparaison technique 2026 :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">VMI</th>
                    <th className="p-3 border-b border-sand-200">VMC</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {VMI_VS_VMC.map((row) => (
                    <tr key={row.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.critere}</td>
                      <td className="p-3 text-sand-700">{row.vmi}</td>
                      <td className="p-3 text-sand-600">{row.vmc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Aucune aide MaPrimeRénov’ ni CEE pour la VMI
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    Seuls les BAR-TH-127 (VMC double flux) et BAR-TH-125 (VMC simple flux hygro B)
                    sont éligibles aux CEE et MPR. La VMI n’étant pas dans la nomenclature DGEC,
                    aucune prime n’est mobilisable. Si l’aide est un critère de décision majeur,
                    privilégier une VMC double flux malgré un coût équivalent.
                  </p>
                </div>
              </div>
            </div>

            <h2>4 cas où la VMI est pertinente</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUAND_VMI.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Pose VMI : 4 étapes en 1-2 jours</h2>
            <div className="not-prose grid gap-3 my-6">
              {POSE_ETAPES.map((item, i) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>5 critères pour choisir un installateur VMI</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUI_CHOISIR.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <HardHat className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          item.must === 'Obligatoire'
                            ? 'text-red-800 bg-red-50'
                            : 'text-amber-800 bg-amber-50'
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

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Wrench className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis VMI ou VMC en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 installateurs ventilation vous répondent sous 48 h. Audit combles inclus,
                    comparatif VMI / VMC double flux / VMC hygro B selon votre logement.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Simuler aides VMC <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Aide au calcul : votre budget VMI 2026</h2>
            <ul>
              <li>
                <Calculator className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>80 m²</strong> standard : VMI 3 500-4 500 €, 4 diffuseurs, gaines courtes.
              </li>
              <li>
                <Calculator className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>100 m²</strong> avec étage : VMI 4 500-5 500 €, 6 diffuseurs.
              </li>
              <li>
                <Calculator className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>150 m²</strong> + sous-pente : VMI 5 500-7 000 €, 8 diffuseurs + gaine
                longue.
              </li>
              <li>
                <Sparkles className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Filtre F7
                anti-pollens / PM2.5 : +200-400 € à la pose, ~30-80 €/an de remplacement.
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> TVA 10
                % automatique avec artisan dans logement &gt; 2 ans. Pas d’aide MPR/CEE.
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
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Travaux
            </Link>
            <Link
              href="/renovation-energetique/travaux/vmc"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Hub VMC <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
