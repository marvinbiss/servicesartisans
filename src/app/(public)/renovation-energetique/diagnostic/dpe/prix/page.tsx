/**
 * Page : /renovation-energetique/diagnostic/dpe/prix
 *
 * @kw-primary    prix dpe
 * @kw-volume     2700
 * @kw-kd         6
 * @kw-cpc        TBD
 * @intent        commercial
 * @cluster       dpe
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster dpe)
 * @backlog-item  Sprint-pseo-dpe-prix-2026-05-22
 * @author        claire-dubois
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04, country=fr) :
 * - "prix dpe"                       2 700 vol, KD 6  ⭐ PIVOT rang absent
 * - "dpe prix"                       2 400 vol, KD 6
 * - "tarif dpe"                      ~ 800 vol, KD 4
 * - "prix dpe maison"                ~ 400 vol, KD 4
 * - "prix dpe appartement"           ~ 350 vol, KD 4
 * - "dpe location prix"              ~ 200 vol, KD 3
 * - Famille cumulée prix DPE : ~ 6 900 vol/mois (head + variants)
 *
 * Easy win : OUI (KD ≤ 6 sur tous KW). Page PRIX dédiée (focus commercial) vs hub
 * /diagnostic/dpe (focus définition/obligations/classes).
 *
 * Anti-cannibalisation :
 *   - /diagnostic/dpe              = hub PRODUIT (classes A-G, méthode 3CL, validité)
 *   - /diagnostic/dpe/location     = sous-page focus location (KD 2, vol 6800)
 *   - /diagnostic/dpe/validite     = sous-page validité 10 ans
 *   - /diagnostic/dpe/classes/*    = pages classes E/F/G (passoires)
 *   - Cette page                   = sous-page PRIX (tarifs, négociation, comparatif)
 *
 * YMYL high : décision d’achat/vente immobilière, opposabilité DPE (responsabilité
 * diagnostiqueur). Cite : Légifrance L271-4 CCH, ADEME, Ministère Transition
 * Écologique, COFRAC, Annuaire diagnostiqueurs gouv.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  ShieldCheck,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Prix DPE 2026 : 100-250 € selon surface + comparatif'
const DESCRIPTION =
  'Prix DPE 2026 : appartement 90-180 €, maison 150-250 € TTC. Validité 10 ans, méthode 3CL-2021 opposable. Aide non, sauf MaPrimeAdapt’. Comparatif 3 diagnostiqueurs avant signature.'

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
  'Prix moyen 2026 d’un DPE : 100-250 € TTC selon surface, type de bien, région.',
  'Appartement < 80 m² : 90-150 € TTC.',
  'Appartement 80-120 m² : 120-180 € TTC.',
  'Maison < 100 m² : 130-200 € TTC.',
  'Maison 100-200 m² : 150-250 € TTC.',
  'Maison > 200 m² : 200-350 € TTC (variations selon complexité).',
  'Aucune aide directe pour le DPE seul. MaPrimeAdapt’ couvre les diagnostics combinés autonomie.',
]

const PRIX_SURFACE = [
  {
    bien: 'Appartement < 80 m²',
    prix: '90 - 150 €',
    duree: '1-1,5 h',
    note: 'Studio, T1, T2. Pas de chaudière individuelle dans la plupart des cas.',
  },
  {
    bien: 'Appartement 80-120 m²',
    prix: '120 - 180 €',
    duree: '1,5-2 h',
    note: 'T3, T4. Présence d’un système chauffage individuel à diagnostiquer en plus.',
  },
  {
    bien: 'Maison < 100 m²',
    prix: '130 - 200 €',
    duree: '2-3 h',
    note: 'Maison de ville, pavillon de petite taille. Chauffage + ECS individuels.',
  },
  {
    bien: 'Maison 100-200 m²',
    prix: '150 - 250 €',
    duree: '2,5-3,5 h',
    note: 'Maison standard 3-5 pièces avec combles + sous-sol éventuel.',
  },
  {
    bien: 'Maison > 200 m²',
    prix: '200 - 350 €',
    duree: '3-5 h',
    note: 'Grande maison, propriété ancienne. Tarif au cas par cas selon complexité.',
  },
  {
    bien: 'Immeuble entier (collectif)',
    prix: '600 - 2 000 €',
    duree: '0,5-2 j',
    note: 'DPE collectif obligatoire au 1er janvier 2024 (sauf < 50 lots déjà rendu obligatoire).',
  },
]

const FACTEURS_PRIX = [
  {
    label: 'Surface habitable',
    impact: '+ 50-150 € pour grande surface',
    detail:
      'Le temps de visite et de relevé augmente avec la surface. Maison > 200 m² = 3-5 h vs 1-1,5 h pour un studio. Tarif au cas par cas au-delà de 200 m².',
  },
  {
    label: 'Type de bien (appartement vs maison)',
    impact: '+ 30-50 %',
    detail:
      'Maison = plus de parois extérieures à relever, charpente, sous-sol, terrasse. Appartement en immeuble = parois communes simplifiées. Tarif maison ~ 30-50 % plus élevé à surface égale.',
  },
  {
    label: 'Région',
    impact: '+ 10-20 % en IDF',
    detail:
      'Île-de-France, PACA, métropoles : +10-20 % vs province. Plus de demande + coût main-d’œuvre diagnostiqueur élevé. Régions rurales : tarif plancher.',
  },
  {
    label: 'Pack de diagnostics (DDT)',
    impact: '- 20-30 %',
    detail:
      'En cas de vente, le DPE est généralement intégré au Dossier de Diagnostic Technique (DDT) avec : amiante, plomb, gaz, électricité, état parasitaire, ERP. Tarif pack 350-600 € TTC pour maison standard.',
  },
  {
    label: 'Urgence de réalisation',
    impact: '+ 30-50 €',
    detail:
      'DPE sous 48 h ouvré = supplément 30-50 € en moyenne. Délai standard 5-10 jours ouvrés. Anticiper : commander le DPE 2 semaines avant signature compromis.',
  },
  {
    label: 'Mise à jour DPE existant (rare)',
    impact: '50-80 %',
    detail:
      'Recalcul si travaux importants (isolation + chauffage) sans nouvelle visite complète. Pratique non standard, tarification au cas par cas. Préférable de refaire un DPE complet (validité 10 ans à neuf).',
  },
]

const PIEGES_TARIF = [
  {
    title: 'DPE « low cost » < 80 €',
    impact: 'Qualité douteuse',
    desc: 'Un DPE professionnel nécessite ~ 1,5-3 h de visite + 1-2 h de saisie logiciel + opposabilité juridique. En dessous de 80 € : risque diagnostiqueur non certifié, méthode 3CL incomplète, défaut de visite physique (cas DGCCRF 2024-2025).',
  },
  {
    title: 'Diagnostiqueur non certifié COFRAC',
    impact: 'DPE non opposable',
    desc: 'Depuis le 1er juillet 2021, le DPE est opposable juridiquement. Vérifier la certification COFRAC valide à la date du DPE sur le site officiel <a href="https://diagnostiqueurs.application.developpement-durable.gouv.fr" target="_blank" rel="noopener noreferrer">diagnostiqueurs.application.developpement-durable.gouv.fr</a>. Sans certif COFRAC = DPE nul.',
  },
  {
    title: 'Absence d’attestation d’assurance professionnelle',
    impact: 'Recours impossible',
    desc: 'En cas d’erreur DPE (mauvaise classe attribuée), le diagnostiqueur engage sa responsabilité civile professionnelle. Sans attestation d’assurance valide à la date du DPE = recours quasi impossible. À exiger en plus de la certification COFRAC.',
  },
  {
    title: 'Visite virtuelle (sans déplacement)',
    impact: 'DPE non valide',
    desc: 'Le DPE nécessite une visite physique obligatoire (relevés, photos justificatives, mesures). Toute proposition « DPE à distance » via photos client = non conforme à la méthode 3CL-2021 = nul juridiquement.',
  },
  {
    title: 'Pas de photos justificatives',
    impact: 'Opposabilité fragilisée',
    desc: 'Photos obligatoires des éléments diagnostiqués (isolation, équipements chauffage, fenêtres). Sans photos justificatives = en cas de litige juridique, opposabilité fragilisée. Exiger DPE avec photos annexées au rapport.',
  },
  {
    title: 'Pack DDT vs DPE seul',
    impact: 'Économie 30-50 %',
    desc: 'En cas de vente, mieux vaut commander le pack DDT complet (DPE + amiante + plomb + gaz + électricité + état parasitaire + ERP) que les diagnostics un à un. Économie 30-50 % vs unitaire. Si seulement location : DPE + état des risques + ERP suffisent.',
  },
]

const faqs = [
  {
    question: 'Combien coûte précisément un DPE en 2026 ?',
    answer:
      'Entre <strong>100 et 250 € TTC</strong> selon surface et type de bien : <strong>appartement < 80 m²</strong> = 90-150 €, <strong>appartement 80-120 m²</strong> = 120-180 €, <strong>maison < 100 m²</strong> = 130-200 €, <strong>maison 100-200 m²</strong> = 150-250 €, <strong>maison > 200 m²</strong> = 200-350 € (au cas par cas). Variations +10-20 % en Île-de-France, PACA, métropoles. Pour une vente, privilégier le pack DDT complet : ~ 350-600 € (DPE + amiante + plomb + gaz + électricité + ERP).',
  },
  {
    question: 'Existe-t-il une aide pour payer le DPE ?',
    answer:
      'Non, pas d’aide directe pour le DPE seul. Exception : <strong>MaPrimeAdapt’</strong> (depuis 2026) prend en charge certains diagnostics combinés à un projet d’adaptation autonomie. Le DPE seul reste à la charge du vendeur (en cas de vente) ou du bailleur (en cas de location), conformément à L271-4 du Code de la construction et de l’habitation. Pour la rénovation énergétique, c’est l’<strong>audit énergétique</strong> qui est aidé (jusqu’à 500 € ANAH dans le cadre du Parcours accompagné MPR).',
  },
  {
    question: 'Comment choisir un diagnostiqueur certifié ?',
    answer:
      'Trois vérifications obligatoires : (1) <strong>Certification COFRAC valide</strong> à la date du DPE sur <a href="https://diagnostiqueurs.application.developpement-durable.gouv.fr" target="_blank" rel="noopener noreferrer">diagnostiqueurs.application.developpement-durable.gouv.fr</a> (annuaire officiel Ministère). (2) <strong>Attestation d’assurance professionnelle</strong> RC Pro à exiger en copie. (3) <strong>Visite physique</strong> obligatoire (toute proposition « à distance » = nul). Comparer 3 devis avant signature : écart 30-50 % typique entre diagnostiqueurs locaux.',
  },
  {
    question: 'Le DPE est-il opposable juridiquement ?',
    answer:
      'OUI depuis le <strong>1er juillet 2021</strong> (loi ELAN). Le diagnostiqueur engage sa <strong>responsabilité civile professionnelle</strong> en cas d’erreur de classement. L’acheteur ou le locataire peut engager un recours en cas de DPE erroné (passoire vendue comme classe D par exemple). En cas de litige avéré : indemnisation possible via assurance RC Pro du diagnostiqueur. C’est pourquoi vérifier la certification COFRAC + attestation d’assurance est critique.',
  },
  {
    question: 'Combien de temps dure une visite DPE ?',
    answer:
      '<strong>Appartement</strong> < 80 m² : 1-1,5 h. <strong>Appartement</strong> 80-120 m² : 1,5-2 h. <strong>Maison</strong> < 100 m² : 2-3 h. <strong>Maison</strong> 100-200 m² : 2,5-3,5 h. <strong>Maison</strong> > 200 m² : 3-5 h. La visite est obligatoire et inclut : relevé surface, mesures isolation parois, équipements chauffage/ECS, ventilation, exposition, photos justificatives. Rapport final remis sous 5-10 jours ouvrés (48 h en urgence avec supplément).',
  },
  {
    question: 'Quelle est la validité du DPE ?',
    answer:
      'DPE réalisé après le 1er juillet 2021 = <strong>validité 10 ans</strong>. DPE entre 1er janvier 2013 et 30 juin 2021 = validité jusqu’au 31 décembre 2024 (toujours valable en transition). DPE avant 2013 = non valable, doit être refait. <strong>Exception</strong> : si travaux importants modifient la performance énergétique (isolation + chauffage), un nouveau DPE est recommandé pour valoriser l’investissement, sans obligation légale.',
  },
  {
    question: 'Faut-il privilégier le pack DDT ou commander le DPE seul ?',
    answer:
      'En cas de <strong>vente</strong> : pack DDT complet (DPE + amiante + plomb + gaz + électricité + état parasitaire + ERP) = ~ 350-600 € TTC pour maison standard, économie 30-50 % vs diagnostics unitaires. En cas de <strong>location</strong> : DPE + état des risques (ERP) + diagnostic gaz/élec si > 15 ans + état surface chrome (amiante avant 1997) = ~ 200-350 € TTC. Le DPE seul n’a de sens que pour anticiper une rénovation énergétique sans transaction immobilière imminente.',
  },
  {
    question: 'Que faire en cas de DPE contesté (mauvaise classe) ?',
    answer:
      'Cinq étapes : (1) Demander le <strong>rapport DPE complet</strong> avec photos justificatives au diagnostiqueur. (2) Demander une <strong>contre-expertise</strong> par un autre diagnostiqueur COFRAC (~ 200-300 €). (3) En cas d’écart > 1 classe : engager un <strong>recours amiable</strong> auprès du diagnostiqueur initial (assurance RC Pro). (4) Saisir la <strong>DGCCRF</strong> via SignalConso.gouv.fr. (5) En dernier recours : <strong>action en justice</strong> civile pour responsabilité civile professionnelle (délai de prescription 10 ans).',
  },
]

const sources = [
  {
    label: 'Ministère Transition Écologique — Annuaire diagnostiqueurs',
    url: 'https://diagnostiqueurs.application.developpement-durable.gouv.fr',
  },
  {
    label: 'Légifrance — L271-4 Code construction et habitation (DPE obligatoire)',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'ADEME — Diagnostic Performance Énergétique',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'Service-Public.fr — DPE obligatoire',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16096',
  },
  {
    label: 'COFRAC — Comité français accréditation',
    url: 'https://www.cofrac.fr',
  },
  {
    label: 'France Rénov’ — Diagnostic logement',
    url: 'https://france-renov.gouv.fr/renovation/diagnostic',
  },
  {
    label: 'Légifrance — Loi ELAN 2018 (opposabilité DPE)',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Légifrance — Loi Climat Résilience 2021 (calendrier passoires)',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'DPE — hub 2026',
    href: '/renovation-energetique/diagnostic/dpe',
    description: 'Classes A-G, méthode 3CL, validité',
  },
  {
    label: 'DPE location — interdiction 2025-2034',
    href: '/renovation-energetique/diagnostic/dpe/location',
    description: 'Calendrier interdiction passoires',
  },
  {
    label: 'DPE validité — 10 ans depuis juillet 2021',
    href: '/renovation-energetique/diagnostic/dpe/validite',
    description: 'Quand refaire le DPE',
  },
  {
    label: 'Classes DPE A à G',
    href: '/renovation-energetique/diagnostic/dpe/classes',
    description: 'Conso et émissions par classe',
  },
  {
    label: 'Audit énergétique — différence DPE',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Audit obligatoire vente F/G',
  },
  {
    label: 'Audit énergétique — prix 2026',
    href: '/renovation-energetique/diagnostic/audit-energetique/prix',
    description: '500-1 500 € + aide ANAH 500 €',
  },
  {
    label: 'Passoires thermiques — interdiction',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Loi Climat 2021 + travaux',
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
    section: 'Diagnostic — DPE — Prix',
    keywords: [
      'prix dpe',
      'dpe prix',
      'tarif dpe',
      'prix dpe maison',
      'prix dpe appartement',
      'dpe location prix',
      'dpe 2026 prix',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Prix', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Diagnostic de Performance Énergétique (DPE) 2026',
    description:
      'Réalisation d’un DPE opposable juridiquement (méthode 3CL-2021, validité 10 ans) par un diagnostiqueur certifié COFRAC. Prix 100-250 € TTC selon surface.',
    category: 'Diagnostic immobilier obligatoire',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, serviceSchema].filter(
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
              { label: 'Prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
              DPE &middot; Prix 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix DPE 2026 : 100-250 € selon surface
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, le <strong>prix d’un DPE</strong> est de <strong>100-250 € TTC</strong> selon
              surface et type de bien (appartement vs maison). En cas de vente, le pack DDT complet
              (DPE + amiante + plomb + gaz + électricité + ERP) est plus avantageux à 350-600 € TTC.
              Validité 10 ans, méthode 3CL-2021 opposable juridiquement depuis 1er juillet 2021.
              Voici la grille de prix par surface et la checklist du diagnostiqueur certifié.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix-surface">Prix par surface et type de bien</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Bien</th>
                    <th className="p-3 border-b border-sand-200">Prix DPE</th>
                    <th className="p-3 border-b border-sand-200">Durée visite</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_SURFACE.map((row) => (
                    <tr key={row.bien} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.bien}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes nationales 2026 TTC. Variations +10-20 % en Île-de-France, PACA et
                grandes métropoles. Sources : Annuaire diagnostiqueurs Ministère Transition
                Écologique, baromètre prix diagnostic immobilier 2026.
              </p>
            </div>

            <h2 id="pack-ddt">Pack DDT vs DPE seul</h2>
            <p>
              En cas de vente immobilière, le DPE seul n’a de sens que pour anticiper une
              rénovation. La plupart des vendeurs commandent le{' '}
              <strong>Dossier de Diagnostic Technique (DDT)</strong> complet, qui inclut tous les
              diagnostics obligatoires :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 p-5">
              <ul className="m-0 space-y-2 text-sm text-sand-700">
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>DPE</strong> (Performance énergétique) — validité 10 ans
                </li>
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Amiante</strong> (construction avant 1er juillet 1997) — validité
                  illimitée si négatif
                </li>
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Plomb (CREP)</strong> (logement avant 1949) — validité 1 an vente / 6 ans
                  location
                </li>
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Gaz</strong> (installation &gt; 15 ans) — validité 3 ans
                </li>
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Électricité</strong> (installation &gt; 15 ans) — validité 3 ans vente / 6
                  ans location
                </li>
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>État parasitaire (termites)</strong> (zones à risque) — validité 6 mois
                </li>
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>État des Risques et Pollutions (ERP)</strong> — validité 6 mois
                </li>
                <li>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Audit énergétique</strong> en plus si maison F, G ou E (depuis 2025)
                </li>
              </ul>
              <p className="text-xs text-sand-500 mt-3 mb-0">
                Pack DDT complet maison 100-150 m² : ~ 400-600 € TTC vs ~ 700-1 000 € en unitaire =
                économie 30-50 %. Sources : Service-Public.fr, Légifrance L271-4 CCH.
              </p>
            </div>

            <h2 id="facteurs-prix">6 facteurs qui font varier le prix DPE</h2>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_PRIX.map((f) => (
                <div key={f.label} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sand-900 m-0">{f.label}</p>
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {f.impact}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{f.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="pieges">6 pièges à éviter sur un devis DPE</h2>
            <div className="not-prose grid gap-3 my-6">
              {PIEGES_TARIF.map((piege) => (
                <div
                  key={piege.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{piege.title}</p>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {piege.impact}
                      </span>
                    </div>
                    <p
                      className="text-sm text-sand-700 m-0 mt-1"
                      dangerouslySetInnerHTML={{ __html: piege.desc }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides DPE 2026 : (presque) aucune</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>DPE seul</strong> : aucune aide. Coût à charge intégrale du propriétaire
                vendeur ou bailleur (L271-4 CCH).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeAdapt’</strong> (depuis 2026) : prise en charge partielle des
                diagnostics combinés à un projet d’adaptation autonomie (~ 30-50 % selon revenus).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Audit énergétique</strong> (à distinguer du DPE) : aide ANAH jusqu’à 500 €
                dans le cadre MPR Parcours accompagné (projets &gt; 5 000 € avec saut 2 classes
                DPE).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Chèque énergie</strong> (revenus très modestes) : peut être utilisé pour
                régler un DPE chez certains diagnostiqueurs partenaires (rare).
              </li>
            </ul>

            <h2 id="comparer-devis">Comment comparer 3 devis DPE</h2>
            <p>
              L’écart entre 3 devis à configuration équivalente atteint 30-50 % en DPE. Voici les 5
              points à vérifier sur chaque devis :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Certification COFRAC</strong> valide à la date du DPE (numéro vérifiable sur
                diagnostiqueurs.application.developpement-durable.gouv.fr)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Attestation d’assurance professionnelle RC Pro</strong> à exiger en copie
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Visite physique obligatoire</strong> (refuser tout DPE « à distance »)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Photos justificatives</strong> annexées au rapport final
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total TTC, mode paiement, délai de remise rapport</strong> (5-10 jours
                ouvrés standard)
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Anticiper la rénovation après DPE
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Si votre DPE classe F, G ou E : interdiction location 2025-2034 (loi Climat).
                    Notre simulateur estime vos aides MaPrimeRénov’ + CEE pour passer en classe C ou
                    D : ROI 4-12 ans après aides.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/renovation-energetique/passoires-thermiques"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Passoires thermiques <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
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
                    className="flex items-start justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sand-900 m-0">{g.label}</p>
                      <p className="text-xs text-sand-600 mt-1 mb-0">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
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
              href="/renovation-energetique/diagnostic"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Diagnostic logement <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
