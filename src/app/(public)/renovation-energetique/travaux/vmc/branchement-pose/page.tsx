/**
 * Page : /renovation-energetique/travaux/vmc/branchement-pose
 *
 * @kw-primary    branchement vmc
 * @kw-volume     600
 * @kw-kd         0
 * @kw-cpc        0.85
 * @intent        commercial
 * @cluster       reno-energetique-vmc-branchement-pose
 * @ahrefs-source bloc1
 * @snapshot      2026-05-06
 * @backlog-item  Sprint1-20-80-vmc-branchement-pose
 *
 * KW cibles validés Ahrefs Bloc 1 v3 (2026-05-04, country=fr) :
 * - "branchement vmc"     → 600 vol, KD 0 ⭐⭐⭐ PIVOT (quelleenergie #2, page-mine #56)
 * - "pose vmc"            → 500 vol, KD 0 ⭐⭐⭐ (effy #1)
 * - "schema branchement vmc" → 200 vol, KD 0
 * - "branchement vmc simple flux" → 150 vol, KD 0
 * - "raccordement vmc"    → 100 vol, KD 0 (variant)
 * - Famille cumulée pivot : ~1 600 vol/mois (KD 0 partout)
 *
 * Easy win : OUI MEGA — KD 0 partout. Page-mine #56 quelleenergie.fr/branchement-vmc :
 * 943 traffic/mo. Atout SA : schéma technique NF C 15-100 + checklist sécurité +
 * RGE Qualibat 8721 + Qualifelec.
 *
 * Anti-cannibalisation :
 *   - /vmc/installation = process global devis + étapes + prix (intent commercial)
 *   - Cette page = focus TECHNIQUE pose + raccordement électrique :
 *     schémas mono-phase, sections câbles, NF C 15-100 vol humides, fixation caisson
 *     en combles, raccordement gaines à bouches, mise en service débits.
 *   - Audience : artisans curieux, bricoleurs avertis, propriétaires qui veulent
 *     vérifier leur installation par un pro Qualifelec.
 *
 * YMYL : sécurité électrique (NF C 15-100) + ventilation conformité (DTU 68.3).
 * Page how-to + Schema HowTo activé.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Calculator, CheckCircle2, Plug, Wind, Zap } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc/branchement-pose'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Branchement et pose VMC 2026 : schéma, sécurité, sections'
const DESCRIPTION =
  'Branchement VMC 2026 : schéma raccordement mono-phase, NF C 15-100 volumes humides, section câble 2,5 mm², DDR 30 mA, pose caisson combles, raccordement gaines. Guide pro RGE Qualibat 8721.'

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
  'Branchement VMC = raccordement électrique du caisson moteur au tableau divisionnaire (mono-phase 230 V).',
  'Section câble 2,5 mm² (cuivre rigide H07 V-U), protection disjoncteur 16 A + DDR 30 mA dédié SDB/cuisine.',
  'NF C 15-100 (norme électrique) : caisson HORS volumes humides 0/1/2 (au-dessus baignoire/douche interdit).',
  'Pose caisson : combles isolés OU local technique. Pose horizontale (sortie air en bas) ou suspendue.',
  'Gaines : Ø 80-160 mm isolées (laine minérale ép. ≥ 25 mm) si en combles non chauffés. Pente continue 2-5 %.',
  'Mise en service obligatoire : mesure débits aux bouches (anémomètre), équilibrage circuit, formation utilisateur.',
  'Coût pose pro : 600-1 200 € (simple flux), 1 200-2 000 € (double flux). Toujours par RGE Qualibat 8721 + Qualifelec si zone humide.',
]

const ETAPES_BRANCHEMENT = [
  {
    name: 'Préparation tableau électrique',
    text: 'Repérer une place libre sur le tableau divisionnaire (1 module 18 mm). Couper l’alimentation générale. Vérifier la présence d’un DDR 30 mA dédié pour les pièces humides (SDB, cuisine, WC) — obligatoire NF C 15-100 article 559.',
  },
  {
    name: 'Pose disjoncteur 16 A',
    text: 'Installer un disjoncteur unipolaire 16 A type C en aval du DDR 30 mA. Connexion : phase entrée = sortie DDR, sortie disjoncteur = vers caisson VMC. Couple de serrage 1,2-1,5 N·m.',
  },
  {
    name: 'Tirage câble 2,5 mm²',
    text: 'Câble H07 V-U cuivre rigide 3G2,5 (phase + neutre + terre). Passage en moulure ou gaine ICTA Ø 16-20 mm. Longueur max sans rallonge : 30 m. Au-delà, prévoir 4 mm² pour limiter chute de tension.',
  },
  {
    name: 'Raccordement caisson',
    text: 'Bornes du caisson (généralement 3 bornes : phase + neutre + terre). Respecter polarité indiquée sur l’étiquette constructeur. Serrage couple 0,8-1,2 N·m. Vérifier continuité terre (ohmmètre, < 1 Ω).',
  },
  {
    name: 'Pose interrupteur grand débit (option)',
    text: 'Pour VMC double débit : interrupteur 2 positions (petit/grand débit) en cuisine ou SDB. Câble 1,5 mm² 3G entre interrupteur et caisson. Branchement sur bornes "boost" du caisson.',
  },
  {
    name: 'Test isolement',
    text: 'Mégohmmètre 500 V continu : isolement entre conducteurs actifs et terre ≥ 0,5 MΩ (NF C 15-100 art. 612). Si défaut, vérifier câble et connexions.',
  },
  {
    name: 'Mise sous tension',
    text: 'Réenclencher disjoncteur principal puis disjoncteur VMC. Vérifier démarrage caisson (LED témoin si présente). Mesurer tension d’entrée (230 V ± 10 %, voltmètre RMS).',
  },
  {
    name: 'Mesure débits aux bouches',
    text: 'Anémomètre à fil chaud ou cône de mesure : vérifier débits réglementaires (15-30 m³/h SDB, 30 m³/h cuisine, 15 m³/h WC selon arrêté 24/03/1982). Équilibrer si besoin via vis sur bouches.',
  },
  {
    name: 'Étiquetage tableau',
    text: 'Étiquette claire : "VMC 16 A" sur disjoncteur. Important pour entretien futur et sécurité (coupure rapide si fuite eau caisson).',
  },
]

const SECTION_CABLES = [
  {
    longueur: '< 15 m',
    section: '1,5 mm²',
    chute_max: '~2,5 V',
    detail: 'Suffisant pour caisson basse conso (< 30 W). Vérifier puissance constructeur.',
  },
  {
    longueur: '15-30 m',
    section: '2,5 mm²',
    chute_max: '~3 V',
    detail: 'Standard recommandé. Marge sécurité pour caissons jusqu’à 100 W.',
  },
  {
    longueur: '30-50 m',
    section: '4 mm²',
    chute_max: '~3 V',
    detail: 'Pour grandes maisons ou caissons puissants (VMC double flux thermo).',
  },
  {
    longueur: '> 50 m',
    section: '6 mm²',
    chute_max: '~3 V',
    detail:
      'Cas rare. Vérifier emplacement caisson (caisson maison entière mauvaise idée si > 50 m).',
  },
]

const POSE_CAISSON = [
  {
    emplacement: 'Combles isolés (chauffés)',
    avantages: 'Bruit éloigné, gaines courtes, accès maintenance',
    contraintes: 'Trappe d’accès ≥ 60×60 cm, charpente solide, plancher porteur',
    fixation:
      'Suspension par 4 points (sangles caoutchouc anti-vibration), à 30 cm minimum du plancher pour éviter ponts thermiques.',
  },
  {
    emplacement: 'Combles non chauffés',
    avantages: 'Espace dispo, accès facile',
    contraintes:
      'OBLIGATOIREMENT gaines isolées (laine minérale ép. ≥ 25 mm, classe M0 incombustible). Caisson dans coffrage isolé (R ≥ 1).',
    fixation: 'Idem combles chauffés + isolation thermique du caisson lui-même.',
  },
  {
    emplacement: 'Local technique (chaufferie, buanderie)',
    avantages: 'Maintenance aisée, intégration tableau électrique',
    contraintes: 'Volume libre 80×80×80 cm autour caisson, ventilation locale OK',
    fixation: 'Mural sur supports anti-vibration ou plafond suspendu.',
  },
  {
    emplacement: 'Faux plafond couloir',
    avantages: 'Discret, aucun encombrement habitable',
    contraintes: 'Hauteur faux plafond ≥ 30 cm, trappe technique 50×50 cm minimum',
    fixation: 'Caissons plats spécifiques (Aldes EasyHOME Compact, Atlantic Hygrocosy Plat).',
  },
  {
    emplacement: 'INTERDIT — chambres, séjour',
    avantages: '—',
    contraintes: 'Bruit < 30 dB(A) impossible à garantir, vibrations parquet',
    fixation: 'Ne JAMAIS poser caisson en pièce de vie.',
  },
]

const NFC_15_100_VOLUMES = [
  {
    volume: 'Volume 0',
    desc: 'Intérieur baignoire/douche',
    vmc: 'INTERDIT (aucun appareil sauf TBTS 12 V)',
  },
  {
    volume: 'Volume 1',
    desc: 'Au-dessus baignoire/douche, jusqu’à 2,25 m',
    vmc: 'Interdit en pratique (caisson trop volumineux pour cette zone)',
  },
  {
    volume: 'Volume 2',
    desc: '60 cm autour volume 1 + 3 m haut',
    vmc: 'Possible si caisson IPX4 minimum + DDR 30 mA + classe II',
  },
  {
    volume: 'Hors volume',
    desc: 'Reste de la pièce',
    vmc: 'OK : caisson IP21 minimum suffisant. Standard pour pose normale.',
  },
]

const faqs = [
  {
    question: 'Quelle section de câble pour brancher une VMC ?',
    answer:
      'En 2026, pour une VMC standard (caisson 30-100 W) : câble cuivre rigide 2,5 mm² (3G2,5 H07 V-U) sur une longueur jusqu’à 30 m. Au-delà, passer à 4 mm² pour limiter la chute de tension à 3 V. Pour des micro-VMC (extracteur SDB seul, 5-30 W), 1,5 mm² suffit jusqu’à 15 m. Protection obligatoire : disjoncteur 16 A + différentiel 30 mA dédié pièces humides (NF C 15-100 art. 559). Toute installation doit être réalisée par un électricien qualifié Qualifelec ou un chauffagiste RGE Qualibat 8721 (sinon perte garantie + non-conformité).',
  },
  {
    question: 'Où poser le caisson VMC ?',
    answer:
      'Emplacements autorisés (NF DTU 68.3) : (1) combles isolés ou non isolés (ces derniers nécessitent gaines isolées laine minérale ≥ 25 mm) ; (2) local technique (chaufferie, buanderie, garage chauffé) ; (3) faux plafond couloir (avec caisson plat type Aldes EasyHOME Compact ou Atlantic Hygrocosy Plat). INTERDIT : chambres, séjour, salle de bain (bruit + humidité). Fixation par 4 points avec suspension anti-vibration (sangles caoutchouc) pour éviter transmission bruit dans la structure. Volume libre minimal autour du caisson : 80×80×80 cm pour maintenance.',
  },
  {
    question: 'Quelle norme pour brancher une VMC en salle de bain ?',
    answer:
      'NF C 15-100 — norme électrique résidentielle. Pour zone SDB, le caisson VMC doit IMPÉRATIVEMENT être HORS volume 0 (intérieur baignoire/douche) et hors volume 1 (au-dessus, jusqu’à 2,25 m). Volume 2 (60 cm autour volume 1) toléré si caisson IPX4 + alimentation TBTS 25 V max + classe II. Hors volume (reste de la pièce) : caisson IP21 standard suffit. Protection obligatoire : DDR 30 mA dédié SDB. Mieux : poser caisson en combles ou local technique, raccorder par gaine vers SDB (pas d’appareil électrique en SDB).',
  },
  {
    question: 'Comment équilibrer une VMC après pose ?',
    answer:
      'Étape obligatoire après mise en service. Procédure : (1) Mettre VMC en grand débit (boost) ; (2) Mesurer le débit à chaque bouche avec un anémomètre à fil chaud ou un cône de mesure raccordé à un débit-mètre ; (3) Comparer aux débits réglementaires (arrêté 24/03/1982) : 15 m³/h en SDB seule, 30 m³/h SDB+WC, 30 m³/h cuisine continue, 15 m³/h WC ; (4) Ajuster via vis de réglage sur les bouches (rotation pour ouvrir/fermer la section de passage) ; (5) Re-mesurer jusqu’à atteindre les débits cibles. Coût équilibrage par pro : 80-150 €. Sans équilibrage : VMC inefficace + non-conformité réglementaire.',
  },
  {
    question: 'Quel est le coût d’un branchement et pose VMC par un pro ?',
    answer:
      'En 2026, coûts pose seule (matériel non inclus) : (1) VMC simple flux autoréglable : 400-700 € (1-2 h) ; (2) VMC simple flux hygroréglable : 600-1 000 € (2-4 h, avec entrées d’air) ; (3) VMC double flux : 1 200-2 000 € (1-2 jours, 4 réseaux gaines) ; (4) VMC double flux thermodynamique : 1 800-2 500 € (1-2 jours + raccordement PAC). Inclus dans le devis : tirage câbles, pose caisson, raccordement bouches, mise en service avec mesure débits, équilibrage, formation utilisateur. Toujours exiger artisan RGE Qualibat 8721 + Qualifelec si zone humide.',
  },
  {
    question: 'Peut-on brancher une VMC soi-même ?',
    answer:
      'Techniquement OUI pour un bricoleur averti, mais DÉCONSEILLÉ. Risques : (1) Non-conformité NF C 15-100 = sinistre non couvert par assurance habitation ; (2) Perte des aides CEE Coup de pouce + TVA 5,5 % (réservées installations RGE) ; (3) Perte garantie matériel constructeur (souvent conditionnée à pose par pro) ; (4) Risque électrique en zone humide (DDR 30 mA, classe IP) ; (5) Risque débits non conformes = ventilation inefficace = moisissures. Pour économies : faites-vous assister par un proche électricien certifié Qualifelec qui valide votre travail. Coût autodiagnostic + validation pro : 100-200 € (visite contrôle).',
  },
  {
    question: 'Quelle puissance électrique consomme une VMC ?',
    answer:
      'En continu (24/7) : (1) VMC simple flux autoréglable : 30-80 W (caisson AC standard) ; (2) VMC simple flux hygroréglable EC : 8-30 W (moteur basse conso) ; (3) VMC double flux : 50-150 W (2 ventilateurs : insufflation + extraction) ; (4) VMC double flux thermodynamique : 200-500 W (PAC en plus). Conso annuelle : 50-150 kWh/an pour simple flux EC, 300-700 kWh/an pour DF thermo. Coût élec annuel : 12-180 € selon technologie. Modèles EC (commutation électronique) divisent la conso par 3-4 vs AC standard — privilégier en rénovation.',
  },
]

const sources = [
  {
    label: 'Légifrance — Arrêté du 24 mars 1982 modifié (aération logements)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000852525',
  },
  {
    label: 'AFNOR — NF C 15-100 (électricité résidentielle, volumes humides)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — NF DTU 68.3 (mise en œuvre VMC simple/double flux)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'CSTB — Avis techniques VMC simple/double flux',
    url: 'https://www.cstb.fr',
  },
  {
    label: 'Qualifelec — Annuaire électriciens qualifiés',
    url: 'https://www.qualifelec.fr',
  },
  {
    label: 'France Rénov’ — Aides VMC (CEE Coup de pouce)',
    url: 'https://france-renov.gouv.fr/aides/cee',
  },
]

const relatedPages = [
  {
    label: 'Installation VMC : étapes, prix, checklist',
    href: '/renovation-energetique/travaux/vmc/installation',
    description: 'Process global devis → mise en service. 1-4 jours selon type',
  },
  {
    label: 'Hub VMC : 4 types comparés',
    href: '/renovation-energetique/travaux/vmc',
    description: 'Autoréglable, hygroréglable, double flux + prix',
  },
  {
    label: 'VMC simple flux',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
    description: 'Fonctionnement, débits, entrée de gamme 500-1 200 €',
  },
  {
    label: 'VMC hygroréglable type B',
    href: '/renovation-energetique/travaux/vmc/hygroreglable/type-b',
    description: 'Modulation totale entrées + bouches',
  },
  {
    label: 'VMC double flux thermodynamique',
    href: '/renovation-energetique/travaux/vmc/double-flux-thermodynamique',
    description: 'PAC intégrée, COP 3-4,5, MPR 2 500 €',
  },
  {
    label: 'Trouver un électricien Qualifelec',
    href: '/services/electricien',
    description: 'Pour pose volume humide NF C 15-100',
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
    section: 'Travaux — VMC — Branchement et pose',
    keywords: [
      'branchement vmc',
      'pose vmc',
      'schema branchement vmc',
      'branchement vmc simple flux',
      'raccordement vmc',
      'NF C 15-100 vmc',
      'section cable vmc',
      'qualifelec vmc',
      'mise en service vmc',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Branchement et pose', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(ETAPES_BRANCHEMENT, {
    name: 'Brancher une VMC simple flux selon NF C 15-100',
    description:
      '9 étapes pour brancher un caisson VMC au tableau divisionnaire, en respectant la norme NF C 15-100 (DDR 30 mA, section 2,5 mm²) et le DTU 68.3 (équilibrage débits).',
    totalTime: 'PT4H',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
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
              { label: 'VMC', href: '/renovation-energetique/travaux/vmc' },
              { label: 'Branchement et pose' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Plug className="w-3.5 h-3.5" aria-hidden />
              NF C 15-100 — DDR 30 mA + 2,5 mm² obligatoires
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Branchement et pose VMC 2026 : schéma, sécurité, sections
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>branchement d’une VMC</strong> demande un câble cuivre 2,5 mm² raccordé au
              tableau électrique via un disjoncteur 16 A et un <strong>différentiel 30 mA</strong>{' '}
              dédié pièces humides (NF C 15-100). Le caisson se pose en combles ou local technique
              avec gaines isolées et fixation anti-vibration. Voici le schéma complet, les sections
              câbles, les volumes humides et les 9 étapes pour une mise en service conforme.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="schema-branchement">Schéma de branchement VMC mono-phase 230 V</h2>
            <p>
              <Zap className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Schéma type pour une VMC simple flux (caisson 30-80 W) raccordée à un tableau
              divisionnaire avec différentiel dédié pièces humides :
            </p>
            <pre className="bg-sand-100 text-sand-900 text-xs overflow-x-auto p-4 rounded-lg my-4 leading-relaxed">{`Tableau divisionnaire
┌──────────────────────────┐
│  Disjoncteur principal   │
│         (40 A)           │
└────────────┬─────────────┘
             │
        DDR 30 mA
       (pièces humides)
             │
   ┌─────────┴─────────┐
   │                   │
Disj. 16 A         (autres
(VMC C16)         circuits SDB)
   │
   │  Câble 2,5 mm²
   │  H07 V-U cuivre
   │  3G2,5 (Ph + N + T)
   │  ≤ 30 m
   ▼
 Caisson VMC
 (combles/local technique)
 Bornes : Ph / N / Terre
 IP21 mini hors volume
 IPX4 mini en volume 2`}</pre>

            <h2 id="sections">Section câble selon longueur et puissance</h2>
            <div className="not-prose overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-sand-100">
                  <tr>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      Longueur câble
                    </th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">Section</th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      Chute tension max
                    </th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      Cas d’usage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SECTION_CABLES.map((c) => (
                    <tr key={c.section}>
                      <td className="p-3 border border-sand-200 font-medium">{c.longueur}</td>
                      <td className="p-3 border border-sand-200 font-semibold text-primary-800">
                        {c.section}
                      </td>
                      <td className="p-3 border border-sand-200">{c.chute_max}</td>
                      <td className="p-3 border border-sand-200 text-sand-600 text-xs">
                        {c.detail}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="9-etapes">9 étapes du branchement (norme NF C 15-100)</h2>
            <ol className="not-prose list-none space-y-3 my-6">
              {ETAPES_BRANCHEMENT.map((e, i) => (
                <li key={e.name} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-700 text-white text-xs mr-2 font-bold">
                      {i + 1}
                    </span>
                    {e.name}
                  </p>
                  <p className="text-sand-700 m-0 text-sm leading-relaxed pl-8">{e.text}</p>
                </li>
              ))}
            </ol>

            <h2 id="volumes-humides">NF C 15-100 — Volumes humides (SDB, cuisine)</h2>
            <p>
              Le caisson VMC doit être placé HORS volumes 0 et 1 (au-dessus baignoire/douche).
              Volume 2 toléré si IPX4 minimum.
            </p>
            <div className="not-prose overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-sand-100">
                  <tr>
                    <th className="text-left p-3 border border-sand-200 font-semibold">Volume</th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      Description
                    </th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      VMC autorisée ?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {NFC_15_100_VOLUMES.map((v) => (
                    <tr key={v.volume}>
                      <td className="p-3 border border-sand-200 font-medium">{v.volume}</td>
                      <td className="p-3 border border-sand-200 text-sand-700">{v.desc}</td>
                      <td className="p-3 border border-sand-200 text-primary-800">{v.vmc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="pose-caisson">Où et comment poser le caisson VMC</h2>
            <div className="not-prose space-y-4 my-6">
              {POSE_CAISSON.map((p) => (
                <div key={p.emplacement} className="bg-white border border-sand-200 rounded-xl p-5">
                  <p className="font-semibold text-sand-900 m-0 mb-2">
                    <Wind className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                    {p.emplacement}
                  </p>
                  <ul className="text-sm text-sand-700 m-0 space-y-1 list-none p-0">
                    <li>
                      <CheckCircle2
                        className="inline w-3.5 h-3.5 text-primary-700 mr-1"
                        aria-hidden
                      />
                      <strong>Avantages</strong> : {p.avantages}
                    </li>
                    <li>
                      <Zap className="inline w-3.5 h-3.5 text-primary-700 mr-1" aria-hidden />
                      <strong>Contraintes</strong> : {p.contraintes}
                    </li>
                    <li>
                      <Award className="inline w-3.5 h-3.5 text-primary-700 mr-1" aria-hidden />
                      <strong>Fixation</strong> : {p.fixation}
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            <h2 id="cta">Trouvez un Qualifelec ou RGE Qualibat 8721</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis branchement + pose VMC en 30 secondes</strong> — comparez 2-3
                électriciens Qualifelec ou chauffagistes RGE Qualibat 8721 selon zone humide ou non.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mes devis pose VMC <ArrowRight className="w-4 h-4" aria-hidden />
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
