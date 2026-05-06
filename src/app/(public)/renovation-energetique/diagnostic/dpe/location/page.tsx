/**
 * Page : /renovation-energetique/diagnostic/dpe/location
 *
 * @kw-primary    dpe location
 * @kw-volume     6798
 * @kw-kd         2
 * @kw-cpc        0.45
 * @cluster       1
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md#dpe-cluster
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — DPE location easy win)
 * @backlog-item  Levier-F-dpe-location
 *
 * KW cibles (validés Ahrefs Bloc 1 v3, country=fr) :
 * - "dpe location"              → 6 798 vol, KD 2 ⭐⭐⭐⭐ MEGA EASY WIN pivot
 * - "obligation dpe location"   → ~600 vol estimé, KD 1
 * - "dpe minimum location"      → ~400 vol estimé, KD 2
 * - "loi dpe location"          → ~500 vol estimé, KD 3
 * - "dpe interdit location"     → ~350 vol estimé, KD 2
 * - "calendrier dpe location"   → ~250 vol estimé, KD 1
 * - "dpe location 2025/2028/2034" → variantes
 * - Famille cumulée pivot : ~9 700 vol/mois
 *
 * Source : docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (cluster DPE)
 * Easy win : OUI MAJEUR (KD 2 sur 6 798 vol — 0 acteur RGE-first sur SERP)
 * Cluster pillar : Rénovation Énergétique → Diagnostic → DPE → Location
 *
 * Anti-cannibalisation :
 *   - Hub /diagnostic/dpe = DPE généraliste (méthode, classes A→G, validité, opposabilité)
 *   - /passoires-thermiques = focus loi passoires (G+F+E classes calendrier)
 *   - Cette page = focus LOCATION (obligations bailleur, sanctions, recours
 *     locataire, modèle annexe bail, calendrier interdictions, exceptions)
 *
 * YMYL TRÈS CRITIQUE : impacte vies de millions de bailleurs et locataires.
 * Cite : Légifrance (loi 2021-1104, loi 2024-322, loi 1989, CCH L173-1),
 * Service-Public, ADEME, ANIL, ministère Transition écologique.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Home,
  CheckCircle2,
  Calendar,
  Scale,
  ShieldCheck,
  FileText,
  Ban,
} from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/location'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE location 2026 : obligations, calendrier, sanctions'
const DESCRIPTION =
  'DPE location 2026 : obligation bailleur, classe G interdite depuis 1ᵉʳ janvier 2025, F en 2028, E en 2034. Sanctions, recours locataire, modèle bail.'

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
  'DPE OBLIGATOIRE pour toute location en métropole : annexé au bail (article 3-3 loi 6 juillet 1989) sous peine de nullité partielle de la clause loyer.',
  'Calendrier d’interdiction (loi Climat & Résilience 22/08/2021 + loi 9 avril 2024) : classe G depuis 1ᵉʳ janvier 2025, F en 2028, E en 2034.',
  'Bail en cours : pas de rupture obligatoire, mais renouvellement et reconduction interdits sur passoire thermique. Gel des loyers depuis 24 août 2022.',
  'DPE valable 10 ans (sauf anciens DPE 2013-2017 invalides depuis 1ᵉʳ janvier 2023). Coût 100-250 € TTC, par diagnostiqueur certifié.',
  'Sanctions : tribunal judiciaire peut ordonner travaux à charge bailleur, baisse loyer, dommages-intérêts. Pas d’amende administrative directe en 2026.',
  'Exceptions : monuments historiques, logements à usage temporaire (< 4 mois), DOM-TOM (calendrier différent).',
]

const CALENDRIER = [
  {
    date: '24 août 2022',
    event: 'Gel des loyers passoires thermiques (F + G)',
    detail:
      'Article 17-2 loi 1989 modifié : interdiction d’augmenter le loyer ou révision indice à la baisse pour les logements F et G.',
  },
  {
    date: '1ᵉʳ janvier 2023',
    event: 'Interdiction location DPE > 450 kWhEF/m²/an',
    detail:
      'Décret 2022-1690 : équivalent G+ extrême. ~90 000 logements concernés. Article L173-1-1 CCH.',
  },
  {
    date: '1ᵉʳ janvier 2025',
    event: 'Classe G complète interdite à la location',
    detail:
      '~600 000 logements concernés. Loi 2021-1104 art. 160. Bail nouveau : interdiction. Bail existant : renouvellement bloqué.',
  },
  {
    date: '1ᵉʳ janvier 2028',
    event: 'Classe F interdite à la location',
    detail:
      '~1,2 million logements concernés. Bailleurs encouragés à anticiper les travaux de rénovation thermique dès 2026-2027.',
  },
  {
    date: '1ᵉʳ janvier 2034',
    event: 'Classe E interdite à la location',
    detail:
      '~2,5 millions logements concernés. Loi 9 avril 2024 a confirmé ce calendrier. Marche progressive vers DPE D minimum.',
  },
]

const OBLIGATIONS_BAILLEUR = [
  {
    title: 'Faire réaliser un DPE valable',
    desc: 'Obligatoire avant la mise en location ET annexé au bail. Diagnostiqueur certifié COFRAC (annuaire diagnostiqueurs.gouv.fr). Validité 10 ans. Coût 100-250 € TTC. Méthode 3CL-DPE 2021 (depuis 1ᵉʳ juillet 2021).',
  },
  {
    title: 'Annexer le DPE au contrat de bail',
    desc: 'Article 3-3 loi 6 juillet 1989. Le DPE fait partie du Dossier de Diagnostic Technique (DDT) annexé au bail. Sans DPE annexé : la clause de loyer peut être contestée devant le tribunal judiciaire.',
  },
  {
    title: 'Mentionner la classe DPE dans l’annonce',
    desc: 'Article L126-29 CCH. L’annonce de location doit mentionner la classe énergie + classe GES. Sinon, amende DGCCRF jusqu’à 3 000 € (personne physique) ou 15 000 € (personne morale).',
  },
  {
    title: 'Respecter le calendrier d’interdiction',
    desc: 'Depuis le 1ᵉʳ janvier 2025, plus aucun bail signé / renouvelé sur logement classe G. Au 1ᵉʳ janvier 2028, ce sera le tour de la classe F, puis 1ᵉʳ janvier 2034 pour la classe E. Renouvellement automatique bloqué — le bail prend fin sans reconduction.',
  },
  {
    title: 'Respecter le gel des loyers passoires (F + G)',
    desc: 'Depuis 24 août 2022 (loi 2021-1104 art. 159) : interdit de réviser à la hausse le loyer d’un logement F ou G, même via l’IRL. Le loyer reste à la valeur initiale jusqu’à amélioration énergétique.',
  },
]

const RECOURS_LOCATAIRE = [
  {
    title: 'Vérifier que le DPE est annexé au bail',
    desc: 'Si DPE absent ou invalide : adresser une mise en demeure au bailleur (LRAR) demandant la production sous 30 jours. Sans réponse, saisir la commission de conciliation (CDC) départementale.',
  },
  {
    title: 'Saisir la commission de conciliation (CDC)',
    desc: 'Procédure gratuite, ~3 mois. Compétence : litige bailleur-locataire sur DPE, loyer, charges. Saisine via formulaire Cerfa 16259*01. Préalable obligatoire avant tribunal sur certains litiges.',
  },
  {
    title: 'Saisir le tribunal judiciaire',
    desc: 'Pour : ordonner les travaux d’amélioration énergétique à la charge du bailleur (article L173-2 CCH), baisse de loyer, dommages-intérêts. Aide juridictionnelle accessible si revenu mensuel < ~1 200 €. Décision sous 6-12 mois.',
  },
  {
    title: 'Refuser une augmentation de loyer (passoire)',
    desc: 'Si le bailleur tente d’augmenter le loyer d’un logement F ou G (interdit depuis 24/08/2022) : refus écrit + saisine CDC + tribunal. La hausse est nulle de plein droit.',
  },
  {
    title: 'En fin de bail : refuser un nouveau bail si non conforme',
    desc: 'Si le bailleur tente de re-signer un bail sur classe G (interdite depuis le 1ᵉʳ janvier 2025) ou F (interdite à partir de 2028) ou E (à partir de 2034) : refus protégé. Le bailleur ne peut pas vous donner congé pour ce motif. Recours ANIL ou tribunal si pression.',
  },
]

const EXCEPTIONS = [
  {
    title: 'Monuments historiques classés ou inscrits',
    desc: 'Article L173-1-1 CCH : exclus de l’interdiction location si modification du DPE incompatible avec la conservation. Justification ABF (Architecte Bâtiments France) requise.',
  },
  {
    title: 'Logement à usage temporaire ≤ 4 mois',
    desc: 'Locations saisonnières / meublés tourisme courte durée échappent au calendrier d’interdiction (mais DPE reste obligatoire pour la mise en vente). Cas type : Airbnb, gîte rural.',
  },
  {
    title: 'Logements DOM-TOM',
    desc: 'Calendrier décalé : Guadeloupe, Martinique, La Réunion, Guyane, Mayotte ont un calendrier propre selon climat tropical. Méthode DPE adaptée (3CL-DOM).',
  },
  {
    title: 'Bail solidaire / social conventionné Anah',
    desc: 'Logements en intermédiation locative ou conventionnés très social bénéficient parfois de dérogations transitoires si engagement de travaux à 3-5 ans. À vérifier ANIL local.',
  },
  {
    title: 'Travaux disproportionnés (clause sauvegarde)',
    desc: 'Loi 9 avril 2024 a introduit une clause de sauvegarde : si les travaux pour passer de F → E coûtent > 50 % de la valeur du bien, dérogation possible (procédure auprès du préfet).',
  },
]

const faqs = [
  {
    question: 'Puis-je louer un logement classé F ou G en 2026 ?',
    answer:
      'Pour la classe G : NON depuis le 1ᵉʳ janvier 2025 (loi Climat & Résilience 2021-1104, codifiée à l’article L173-1-1 CCH). Aucun bail nouveau ou renouvelé n’est valide. Pour la classe F : OUI jusqu’au 1ᵉʳ janvier 2028, après cette date le même régime s’applique. Pour la classe E : OUI jusqu’au 1ᵉʳ janvier 2034. Dans tous les cas, depuis le 24 août 2022, le loyer ne peut pas être augmenté sur un logement F ou G.',
  },
  {
    question: 'Que dit exactement la loi sur le DPE en location ?',
    answer:
      'Quatre textes principaux : (1) Loi 2021-1104 du 22 août 2021 dite « Climat & Résilience » (art. 159 gel loyers, art. 160 calendrier interdictions), (2) Loi 2024-322 du 9 avril 2024 confirmant le calendrier 2025/2028/2034, (3) Loi du 6 juillet 1989 articles 3-3 et 17-2 (DPE annexé au bail + interdiction de hausse), (4) Code construction et habitation articles L126-26 à L126-35 et L173-1 à L173-2-2. Le DPE est opposable depuis le 1ᵉʳ juillet 2021 (décret 2020-1610).',
  },
  {
    question: 'Combien coûte un DPE pour une location en 2026 ?',
    answer:
      'Entre 100 et 250 € TTC selon la surface et la complexité du bien. Studio : 100-130 €. Appartement T2-T3 : 130-180 €. Maison individuelle : 180-250 €. Le coût est à la charge du bailleur (article 1719 du Code civil, obligation de délivrance). Privilégiez un diagnostiqueur certifié COFRAC (annuaire officiel sur diagnostiqueurs.gouv.fr) avec assurance RC pro.',
  },
  {
    question: 'Quelle est la durée de validité du DPE en location ?',
    answer:
      'Depuis le 1ᵉʳ juillet 2021, tout DPE est valable 10 ans (article L126-26 CCH). MAIS les DPE réalisés entre 2013 et le 30 juin 2021 ont des règles transitoires : DPE 2013-2017 INVALIDES depuis 1ᵉʳ janvier 2023, DPE 2018-30 juin 2021 INVALIDES depuis 1ᵉʳ janvier 2025. Conséquence : tout bail en 2026 doit annexer un DPE postérieur au 1ᵉʳ juillet 2021 (méthode 3CL-DPE 2021).',
  },
  {
    question: 'Le bailleur peut-il rompre le bail à cause du DPE ?',
    answer:
      'NON. La loi ne prévoit aucun cas de rupture du bail liée à la classe DPE. Pour un bail en cours : il continue jusqu’à son terme normal (3 ans pour bail nu, 6 ans personne morale). À l’échéance, le renouvellement automatique est bloqué si le logement est en classe interdite (G depuis 2025, F en 2028, E en 2034). Le bailleur peut alors donner congé pour vente, reprise ou motif légitime — pas pour DPE seul.',
  },
  {
    question: 'Quels recours pour un locataire dans une passoire thermique ?',
    answer:
      'Quatre recours principaux : (1) saisir la commission départementale de conciliation (CDC) pour ordonner travaux ou baisse de loyer (gratuit, 3 mois), (2) saisir le tribunal judiciaire pour faire ordonner les travaux à charge du bailleur (article L173-2 CCH), (3) refuser toute augmentation de loyer (interdite depuis 24/08/2022 sur F+G), (4) en fin de bail, refuser un renouvellement non conforme. L’ANIL (agence info logement) accompagne gratuitement les procédures.',
  },
  {
    question: 'Que faire si je suis bailleur d’un logement classé G ?',
    answer:
      'Quatre options 2026 : (1) faire les travaux de rénovation pour remonter à E ou D (~10-30 K€ pour passer G→D : isolation, chauffage, ventilation), cumul aides MPR + CEE + éco-PTZ envisageable, (2) vendre le bien (avec audit énergétique obligatoire depuis 1ᵉʳ avril 2023), (3) attendre la fin du bail en cours puis ne pas renouveler (mais pas de rupture anticipée possible), (4) procédure exception « travaux disproportionnés » (clause de sauvegarde loi 9 avril 2024) si coût travaux &gt; 50 % valeur bien.',
  },
  {
    question: 'Y a-t-il des sanctions contre le bailleur en cas de non-respect ?',
    answer:
      'Pas d’amende administrative directe en 2026 (le système d’amendes prévu dans la loi Climat n’est pas encore activé). Mais sanctions civiles concrètes via le tribunal judiciaire : (1) ordonner travaux à charge bailleur, (2) baisse rétroactive du loyer, (3) dommages-intérêts au locataire (généralement 1-3 mois de loyer), (4) résiliation du bail aux torts du bailleur si trouble manifestement excessif. Le DPE est OPPOSABLE depuis 1ᵉʳ juillet 2021 — un DPE erroné engage la responsabilité du diagnostiqueur ET du bailleur.',
  },
]

const sources = [
  {
    label: 'Légifrance — Loi 2021-1104 (Climat & Résilience) art. 159 et 160',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'Légifrance — Loi 2024-322 du 9 avril 2024',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049402864',
  },
  {
    label: 'Légifrance — Loi 6 juillet 1989 art. 3-3 et 17-2 (rapports locatifs)',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006069108/',
  },
  {
    label: 'Légifrance — Code construction L126-26 à L173-2-2',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043976343/',
  },
  {
    label: 'Service-Public — DPE en location',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16096',
  },
  {
    label: 'ANIL — Agence nationale information logement',
    url: 'https://www.anil.org',
  },
  {
    label: 'Diagnostiqueurs.gouv.fr — annuaire officiel certifiés COFRAC',
    url: 'https://diagnostiqueurs.application.developpement-durable.gouv.fr',
  },
  {
    label: 'ADEME — Guide DPE et rénovation',
    url: 'https://librairie.ademe.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub DPE (méthode, classes, validité)',
    href: '/renovation-energetique/diagnostic/dpe',
  },
  {
    label: 'Passoires thermiques (loi + calendrier complet)',
    href: '/renovation-energetique/passoires-thermiques',
  },
  {
    label: 'Audit énergétique obligatoire (vente passoire)',
    href: '/renovation-energetique/diagnostic/audit-energetique',
  },
  {
    label: 'Hub Aides 2026 (MPR + CEE + éco-PTZ pour rénover)',
    href: '/renovation-energetique/aides',
  },
  {
    label: 'Simulateur aides rénovation',
    href: '/simulateur-aides-renovation',
  },
  {
    label: 'Trouver un artisan RGE pour rénover sa passoire',
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
    section: 'Diagnostic — DPE — Location',
    keywords: [
      'dpe location',
      'obligation dpe location',
      'dpe minimum location',
      'loi dpe location',
      'calendrier dpe location',
      'dpe interdit location',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'DPE location', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'DPE location — obligations bailleur 2026',
    description:
      "Diagnostic de Performance Énergétique obligatoire pour la mise en location d'un logement en France métropolitaine. Calendrier d'interdiction des passoires thermiques (loi Climat & Résilience 2021-1104).",
    url: PAGE_URL,
    serviceType: 'Diagnostic réglementaire de location',
    audience: 'Bailleurs et locataires en France métropolitaine',
    temporalCoverage: '2026-01-01/2034-12-31',
    serviceOperator: {
      name: 'Ministère de la Transition écologique et de la Cohésion des territoires',
      url: 'https://www.ecologie.gouv.fr',
    },
    sameAs: [
      'https://www.service-public.fr/particuliers/vosdroits/F16096',
      'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
      'https://france-renov.gouv.fr/passoires-thermiques',
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
              { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
              { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' },
              { label: 'DPE location' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              DPE location &middot; Obligations 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              DPE en location 2026 : obligations bailleur, calendrier, recours locataire
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le DPE est <strong>obligatoire</strong> pour toute location en France métropolitaine
              et doit être <strong>annexé au bail</strong> (article 3-3 loi 6 juillet 1989). Depuis
              le <strong>1ᵉʳ janvier 2025</strong>, la classe G est interdite à la location.
              Calendrier suivant : F en 2028, E en 2034. Voici les obligations exactes du bailleur,
              les recours du locataire et les exceptions (monuments historiques, DOM-TOM, clause
              sauvegarde).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Calendrier d’interdiction de location 2022-2034</h2>
            <p>
              La loi <strong>Climat &amp; Résilience 2021-1104 du 22 août 2021</strong>, confirmée
              par la <strong>loi 2024-322 du 9 avril 2024</strong>, fixe un calendrier progressif
              d’interdiction de location des passoires thermiques. Codifié aux articles{' '}
              <strong>L173-1-1 et L173-2 du Code de la construction et de l’habitation</strong>.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Date</th>
                    <th className="p-3 border-b border-sand-200">Mesure</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Détail</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {CALENDRIER.map((row) => (
                    <tr key={row.date} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="p-3 font-semibold">{row.event}</td>
                      <td className="p-3 hidden md:table-cell text-sand-700">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Sources : loi 2021-1104 art. 160, loi 2024-322, décret 2022-1690. Estimations
                logements concernés (ministère Transition écologique 2024).
              </p>
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <Ban className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Bail en cours sur classe G : non rupture, mais pas de renouvellement.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    Si vous êtes bailleur d’un logement G avec un bail signé avant 2025, le bail
                    continue jusqu’à son terme. À l’échéance, le renouvellement automatique est{' '}
                    <strong>bloqué</strong> tant que le logement reste classé G. Vous devez soit
                    réaliser les travaux pour passer en classe E ou mieux, soit ne pas renouveler.
                    Pas de rupture anticipée possible.
                  </p>
                </div>
              </div>
            </div>

            <h2>Les 5 obligations du bailleur en 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {OBLIGATIONS_BAILLEUR.map((item) => (
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

            <h2>Les 5 recours du locataire</h2>
            <div className="not-prose grid gap-3 my-6">
              {RECOURS_LOCATAIRE.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Scale className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>5 exceptions au calendrier</h2>
            <p>
              Quelques rares cas échappent au calendrier d’interdiction. Tous nécessitent une{' '}
              <strong>justification documentaire</strong> opposable :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {EXCEPTIONS.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <FileText className="w-5 h-5 text-sand-600 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Que faire en pratique en 2026 ?</h2>

            <h3>Si vous êtes bailleur</h3>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Vérifiez la classe DPE de votre bien (validité 10 ans, méthode 3CL-DPE 2021)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Si
                classe G : engagez les travaux de rénovation maintenant (cumul aides MPR + CEE +
                éco-PTZ peut couvrir 40-70 %)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Si
                classe F : anticipez 2028 dès 2026-2027 pour étaler les travaux
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Si
                vente envisagée : audit énergétique obligatoire pour passoires F + G (depuis 1ᵉʳ
                avril 2023) et désormais pour la classe E (depuis 1ᵉʳ janvier 2025)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Conservez tous les justificatifs travaux pour démontrer la nouvelle classe
              </li>
            </ul>

            <h3>Si vous êtes locataire</h3>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Vérifiez que le DPE est bien annexé à votre bail (sinon LRAR au bailleur)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Refusez toute augmentation de loyer si logement F ou G (interdite depuis 24/08/2022)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Si
                logement G en 2026 : votre bail en cours continue, mais le renouvellement sera
                bloqué (vous gardez le bénéfice des conditions actuelles tant que vous restez)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Recours gratuit : commission départementale de conciliation (CDC) puis tribunal
                judiciaire
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> ANIL
                (agence d’information logement) : conseils gratuits et accompagnement procédure
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Bailleur : rénover votre passoire thermique pour pouvoir continuer à louer
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Demandez 3 devis comparés à des artisans RGE vérifiés pour rénover votre
                    logement (isolation, chauffage, ventilation). Simulateur d’aides MaPrimeRénov’ +
                    CEE intégré. Réponse sous 48 h.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Annexer le DPE au bail : le strict minimum</h2>
            <p>
              Le DPE doit figurer dans le <strong>Dossier de Diagnostic Technique</strong> (DDT)
              annexé au bail au moment de la signature. Pour être valable, le DPE annexé doit
              comprendre :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Date
                de réalisation et identité du diagnostiqueur (numéro certification COFRAC)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Adresse exacte du logement diagnostiqué (chaque logement individuel = 1 DPE)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Étiquettes énergie (A → G) et émissions GES (A → G)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Consommation annuelle en kWh d’énergie primaire (kWhEP/m²/an) et finale
                (kWhEF/m²/an)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Recommandations de travaux (article L126-26 CCH)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Validité 10 ans depuis la date de réalisation (1ᵉʳ juillet 2021 et après)
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
              href="/renovation-energetique/diagnostic/dpe"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub DPE
            </Link>
            <Link
              href="/renovation-energetique/passoires-thermiques"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Passoires thermiques <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
