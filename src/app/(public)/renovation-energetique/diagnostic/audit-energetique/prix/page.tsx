/**
 * Page : /renovation-energetique/diagnostic/audit-energetique/prix
 *
 * @kw-primary    audit énergétique prix
 * @kw-volume     1100
 * @kw-kd         5
 * @kw-cpc        TBD
 * @intent        commercial
 * @cluster       audit_energetique
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster audit_energetique)
 * @backlog-item  Sprint-pseo-audit-energetique-prix-2026-05-22
 * @author        claire-dubois
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04 + API 2026-05-03, country=fr) :
 * - "audit énergétique prix"       ~1100 vol, KD 5  ⭐ PIVOT (incl. variants)
 * - "audit énergétique tarif"      1000 vol, KD 2  (rang absent, gap CSV #156)
 * - "prix audit énergétique"        500 vol, KD 4
 * - "audit énergétique coût"        300 vol, KD 3
 * - "audit énergétique aide"        180 vol, KD 4  (focus ANAH 500 €)
 * - "audit énergétique maison prix" 250 vol, KD 5
 * - Famille cumulée prix audit : ~ 3 300 vol/mois
 *
 * Easy win : OUI (KD ≤ 5 sur tous KW). Page PRIX dédiée vs hub /audit-energetique
 * (focus définition/obligations/scénarios). Aide ANAH 500 € à mettre en avant.
 *
 * Anti-cannibalisation :
 *   - /diagnostic/audit-energetique   = hub PRODUIT (définition, obligations, scénarios)
 *   - /guides/audit-energetique-prix-aides = guide existant (focus prix + aides)
 *   - Cette page                      = sous-page PRIX (par surface/type, parcours MPR)
 *
 * YMYL high : audit obligatoire pour MPR Parcours accompagné (> 5 000 € avec saut 2
 * classes DPE) + vente maison F/G/E depuis 2025. Cite : ANAH, France Rénov’, ADEME,
 * Légifrance L271-4 CCH, Loi Climat 2021, RGE Audit Énergétique.
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
  Scale,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getGovernmentServiceSchema,
  getServiceSchema,
} from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/diagnostic/audit-energetique/prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Audit énergétique prix 2026 : 500-1 500 € + aide 500 €'
const DESCRIPTION =
  'Audit énergétique prix 2026 : 500-1 200 € maison standard, 800-1 500 € grande maison. Aide ANAH 500 € (MPR Parcours accompagné). Obligatoire vente F/G/E + projets MPR > 5 000 €.'

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
  'Prix moyen 2026 d’un audit énergétique : 500-1 500 € TTC selon surface et type.',
  'Maison < 100 m² : 500-900 € TTC.',
  'Maison 100-200 m² : 600-1 200 € TTC.',
  'Maison > 200 m² : 900-1 500 € TTC.',
  'Aide ANAH jusqu’à 500 € (MaPrimeRénov’ Parcours accompagné, projets > 5 000 € avec saut 2 classes DPE).',
  'Obligatoire en vente maison F, G ou E (depuis 2025, loi Climat 2021).',
  'Distinct du DPE : audit propose 2 scénarios chiffrés de rénovation pour atteindre classe B-C.',
]

const PRIX_SURFACE = [
  {
    bien: 'Maison < 100 m²',
    prix: '500 - 900 €',
    duree: '3-4 h',
    note: 'Pavillon standard. Visite + relevés + 2 scénarios cible classe C-B.',
  },
  {
    bien: 'Maison 100-200 m²',
    prix: '600 - 1 200 €',
    duree: '4-5 h',
    note: 'Maison standard la plus courante. Configuration typique.',
  },
  {
    bien: 'Maison > 200 m²',
    prix: '900 - 1 500 €',
    duree: '5-7 h',
    note: 'Grande maison ou propriété ancienne. Tarification au cas par cas.',
  },
  {
    bien: 'Appartement (audit individuel rare)',
    prix: '400 - 800 €',
    duree: '2-3 h',
    note: 'Audit individuel rare en copro. Privilégier audit énergétique global immeuble.',
  },
  {
    bien: 'Immeuble entier (audit collectif)',
    prix: '3 000 - 12 000 €',
    duree: '1-3 j',
    note: 'Audit énergétique global obligatoire 2024 pour copro > 200 lots.',
  },
]

const AUDIT_VS_DPE = [
  {
    aspect: 'Objectif',
    dpe: 'Évaluer la performance énergétique (classe A-G)',
    audit: 'Proposer 2 scénarios de rénovation chiffrés pour atteindre classe B-C',
  },
  {
    aspect: 'Validité',
    dpe: '10 ans (loi ELAN 2018)',
    audit: '5 ans (avant déclenchement travaux)',
  },
  {
    aspect: 'Méthode',
    dpe: '3CL-2021 (opposable juridiquement)',
    audit: 'Méthode RGE Audit Énergétique (TH-C-E ex / 3CL renforcée)',
  },
  {
    aspect: 'Réalisateur',
    dpe: 'Diagnostiqueur certifié COFRAC',
    audit: 'Auditeur RGE Audit Énergétique agréé France Rénov’',
  },
  {
    aspect: 'Prix moyen',
    dpe: '100-250 €',
    audit: '500-1 500 €',
  },
  {
    aspect: 'Aide directe',
    dpe: 'Aucune',
    audit: 'ANAH 500 € (MPR Parcours accompagné)',
  },
  {
    aspect: 'Obligatoire',
    dpe: 'Vente + location (toujours)',
    audit: 'Vente maison F/G/E depuis 2025 + MPR Parcours accompagné',
  },
]

const FACTEURS_PRIX = [
  {
    label: 'Surface habitable',
    impact: '+ 100-300 € pour grande maison',
    detail:
      'Le temps de visite + relevé + calcul augmente avec la surface. Maison > 200 m² = 5-7 h vs 3-4 h pour < 100 m². Méthode TH-C-E ex / 3CL renforcée plus longue.',
  },
  {
    label: 'Complexité du bâti',
    impact: '+ 100-300 €',
    detail:
      'Maison ancienne (avant 1948) = parois mixtes (pierre, brique, pisé), planchers bois, charpente complexe. Maison récente (post-1975) = structure standard. Tarif +20-30 % pour bâti complexe.',
  },
  {
    label: 'Région',
    impact: '+ 10-20 % en IDF',
    detail:
      'Île-de-France, PACA, métropoles : tarifs auditeurs plus élevés. Régions rurales : tarif plancher. Auditeur déplacement facturé au-delà de 30 km.',
  },
  {
    label: 'Audit + DPE en pack',
    impact: '- 100-200 €',
    detail:
      'Si DPE non encore valide, certains auditeurs réalisent les deux en une visite. Tarif pack ~ 700-1 400 € vs 750-1 750 € en unitaire = économie 100-200 €.',
  },
  {
    label: 'Délai de remise rapport',
    impact: '+ 50-150 € urgence',
    detail:
      'Délai standard 2-3 semaines (calcul + scénarios + édition rapport). Urgence sous 7 jours = supplément 50-150 €. Anticiper en commandant l’audit 4-6 semaines avant signature MPR.',
  },
  {
    label: 'Type de scénarios calculés',
    impact: '+ 100-200 € pour 3-4 scénarios',
    detail:
      'Audit standard : 2 scénarios obligatoires (cible classe C ou B). Audit enrichi : 3-4 scénarios incluant phases intermédiaires, ROI détaillé, plan de financement. Recommandé pour projets > 30 000 €.',
  },
]

const PIEGES_DEVIS = [
  {
    title: 'Audit « low cost » < 400 €',
    impact: 'Qualité douteuse',
    desc: 'Un audit énergétique professionnel nécessite 3-5 h de visite + 4-8 h de calcul + scénarios + rapport. En dessous de 400 € : risque auditeur non RGE, méthode 3CL simplifiée, scénarios génériques non personnalisés.',
  },
  {
    title: 'Auditeur non RGE Audit Énergétique',
    impact: 'Aide ANAH refusée',
    desc: 'Pour bénéficier de l’aide ANAH 500 € (MPR Parcours accompagné) : auditeur certifié RGE Audit Énergétique agréé France Rénov’ obligatoire. Vérifier sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a> ou annuaire des auditeurs.',
  },
  {
    title: 'Audit confondu avec DPE',
    impact: 'Procédure erronée',
    desc: 'DPE et audit énergétique sont 2 documents distincts. Le DPE évalue la performance (classe A-G), l’audit propose des scénarios chiffrés de rénovation. Pour vente maison F/G/E : les DEUX sont obligatoires.',
  },
  {
    title: 'Scénarios non personnalisés',
    impact: 'Rapport inutile',
    desc: 'Un audit générique copié-collé sans visite physique = pas conforme à la méthode RGE Audit Énergétique. Exiger : photos justificatives, mesures isolation, mesure infiltrométrie (si pertinent), scénarios CHIFFRÉS avec marques et matériaux précis.',
  },
  {
    title: 'Pas de plan de financement aides',
    impact: 'Démarches compliquées',
    desc: 'Le rapport doit inclure le plan de financement aides : MaPrimeRénov’ par geste, Coup de pouce CEE, éco-PTZ, prime locale. Sans plan : démarches MPR Parcours accompagné rallongées de 4-8 semaines.',
  },
  {
    title: 'Délai de remise > 4 semaines',
    impact: 'Projet bloqué',
    desc: 'Délai standard 2-3 semaines. Au-delà de 4 semaines : retarde dépôt MPR Parcours accompagné, retarde signature devis travaux, peut faire perdre des barèmes saisonniers (changement périodique CEE).',
  },
]

const faqs = [
  {
    question: 'Combien coûte précisément un audit énergétique en 2026 ?',
    answer:
      'Entre <strong>500 et 1 500 € TTC</strong> selon surface et complexité : <strong>maison < 100 m²</strong> = 500-900 €, <strong>maison 100-200 m²</strong> = 600-1 200 €, <strong>maison > 200 m²</strong> = 900-1 500 €. Variations +10-20 % en Île-de-France et grandes métropoles. Avec l’aide ANAH 500 € (MPR Parcours accompagné), le reste à charge tombe à 0-1 000 €. Pour copropriété : audit énergétique collectif 3 000-12 000 € selon nombre de lots.',
  },
  {
    question: 'Quelle aide pour payer l’audit énergétique ?',
    answer:
      'Aide <strong>ANAH</strong> jusqu’à <strong>500 €</strong> dans le cadre de <strong>MaPrimeRénov’ Parcours accompagné</strong> (projets > 5 000 € avec saut de 2 classes DPE minimum). Conditions : auditeur RGE Audit Énergétique agréé France Rénov’, dossier MPR déposé AVANT signature audit. Pour les très modestes (Bleu) : aide intégrale 500 €. Pour les modestes (Jaune) : aide partielle 400 €. Au-delà : sans aide directe sur l’audit (les aides s’appliquent aux travaux).',
  },
  {
    question: 'Quand est-il obligatoire ?',
    answer:
      'Deux cas obligatoires : (1) <strong>Vente maison F, G ou E</strong> depuis 2025 (loi Climat 2021, art. L126-28-1 CCH) — annexé au compromis de vente. (2) <strong>MaPrimeRénov’ Parcours accompagné</strong> pour projets > 5 000 € avec saut 2 classes DPE — déposé AVANT signature devis travaux. Pour MPR par geste (≤ 5 000 € par geste) : audit non obligatoire, dossier simplifié.',
  },
  {
    question: 'Audit énergétique vs DPE : quelle différence ?',
    answer:
      'Le <strong>DPE</strong> évalue la performance énergétique du logement et attribue une classe A à G (validité 10 ans, méthode 3CL-2021, opposable juridiquement). Le <strong>audit énergétique</strong> va plus loin : il propose 2 scénarios chiffrés de rénovation (cible classe C ou B), liste les travaux à réaliser dans l’ordre optimal, chiffre le ROI et le plan d’aides MPR/CEE. Méthode RGE Audit Énergétique (3CL renforcée). Validité 5 ans avant déclenchement travaux. Réalisateur : auditeur RGE Audit Énergétique (et non simple diagnostiqueur DPE).',
  },
  {
    question: 'Comment choisir un auditeur RGE certifié ?',
    answer:
      'Trois vérifications obligatoires : (1) Certification <strong>RGE Audit Énergétique</strong> agréé France Rénov’ — vérifier sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a> annuaire des auditeurs ; (2) Attestation d’assurance professionnelle <strong>RC Pro</strong> à exiger ; (3) Visite physique <strong>obligatoire</strong> 3-7 h selon surface. Comparer 3 devis avant signature : écart 30-50 % typique entre auditeurs locaux.',
  },
  {
    question: 'Quel est le contenu d’un audit énergétique complet ?',
    answer:
      'Le rapport (30-80 pages selon complexité) doit contenir : (1) <strong>diagnostic du bâti</strong> (surface, isolation, équipements, ventilation), (2) <strong>classe DPE actuelle</strong> avec étiquette énergie + GES, (3) <strong>identification des travaux prioritaires</strong> dans l’ordre optimal (toit > murs > sol > menuiseries > chauffage > ventilation), (4) <strong>2 scénarios chiffrés</strong> de rénovation (cible classe C ou B), (5) <strong>plan de financement aides</strong> MPR/CEE/éco-PTZ, (6) <strong>photos justificatives</strong> + plans, (7) <strong>ROI</strong> calculé sur 25 ans.',
  },
  {
    question: 'Combien de temps dure un audit énergétique ?',
    answer:
      '<strong>Visite sur place</strong> : 3-7 h selon surface (3-4 h < 100 m², 4-5 h 100-200 m², 5-7 h > 200 m²). <strong>Calcul + scénarios + rapport</strong> : 4-8 h en bureau (méthode RGE Audit Énergétique TH-C-E ex / 3CL renforcée). <strong>Délai total remise rapport</strong> : 2-3 semaines après visite (urgence 7 jours = supplément 50-150 €). Anticiper : commander l’audit 4-6 semaines avant signature MPR Parcours accompagné.',
  },
  {
    question: 'Quelle est la validité d’un audit énergétique ?',
    answer:
      '<strong>5 ans</strong> avant déclenchement des travaux. Au-delà : refaire un audit (la performance du bâti et les barèmes d’aides évoluent). En cas de modifications majeures (chauffage remplacé, isolation refaite) : audit recommandé tous les 5 ans même sans obligation. Pour vente maison F/G/E : audit obligatoire à chaque transaction (sauf vendu < 5 ans après audit précédent et sans modification structurelle).',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Audit énergétique',
    url: 'https://france-renov.gouv.fr/renovation/diagnostic/audit-energetique',
  },
  {
    label: 'ANAH — MaPrimeRénov’ Parcours accompagné',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Audit énergétique',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'Légifrance — L126-28-1 CCH (audit obligatoire F/G/E)',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Loi Climat Résilience 2021',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Service-Public.fr — Audit énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16096',
  },
  {
    label: 'OPQIBI — Référentiel auditeur énergétique',
    url: 'https://www.opqibi.com',
  },
  {
    label: 'I.Cert — Référentiel audit énergétique RGE',
    url: 'https://www.icert.fr',
  },
]

const relatedPages = [
  {
    label: 'Audit énergétique — hub 2026',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Définition, obligations, scénarios',
  },
  {
    label: 'MaPrimeRénov’ Parcours accompagné',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Audit obligatoire + Mon Accompagnateur',
  },
  {
    label: 'DPE — hub 2026',
    href: '/renovation-energetique/diagnostic/dpe',
    description: 'Distinct de l’audit, classes A-G',
  },
  {
    label: 'DPE — prix 2026',
    href: '/renovation-energetique/diagnostic/dpe/prix',
    description: '100-250 € selon surface',
  },
  {
    label: 'Passoires thermiques — interdiction',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'F/G/E : interdiction location + audit vente',
  },
  {
    label: 'Aides MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes + parcours',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimer mes aides après audit',
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
    section: 'Diagnostic — Audit énergétique — Prix',
    keywords: [
      'audit énergétique prix',
      'audit énergétique tarif',
      'prix audit énergétique',
      'audit énergétique coût',
      'audit énergétique aide',
      'audit énergétique maison prix',
      'audit énergétique 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'Audit énergétique', url: '/renovation-energetique/diagnostic/audit-energetique' },
    { name: 'Prix', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Audit énergétique 2026',
    description:
      'Réalisation d’un audit énergétique par un auditeur RGE Audit Énergétique agréé France Rénov’. Méthode RGE Audit Énergétique (3CL renforcée). Prix 500-1 500 € TTC selon surface. Validité 5 ans.',
    category: 'Diagnostic — Audit énergétique RGE',
  })
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'Aide ANAH Audit énergétique 2026',
    description:
      'Aide ANAH jusqu’à 500 € pour la réalisation d’un audit énergétique dans le cadre de MaPrimeRénov’ Parcours accompagné (projets > 5 000 € avec saut 2 classes DPE) par un auditeur RGE Audit Énergétique.',
    url: PAGE_URL,
    serviceType: 'Aide financière à la rénovation énergétique',
    serviceOperator: {
      name: 'ANAH — Agence nationale de l’habitat',
      url: 'https://www.anah.gouv.fr',
    },
    audience: 'Propriétaires occupants et bailleurs — logement > 2 ans',
    sameAs: ['https://france-renov.gouv.fr/aides/maprimerenov', 'https://www.anah.gouv.fr'],
  })
  const schemas = [
    articleSchema,
    breadcrumbSchema,
    faqSchema,
    serviceSchema,
    govServiceSchema,
  ].filter((s): s is Record<string, unknown> => s !== null)

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
              {
                label: 'Audit énergétique',
                href: '/renovation-energetique/diagnostic/audit-energetique',
              },
              { label: 'Prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
              Audit énergétique &middot; Prix 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Audit énergétique prix 2026 et aide ANAH 500 €
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, un <strong>audit énergétique</strong> coûte <strong>500-1 500 € TTC</strong>{' '}
              selon surface et complexité. L’<strong>aide ANAH jusqu’à 500 €</strong> (MaPrimeRénov’
              Parcours accompagné) réduit le reste à charge à 0-1 000 €. Obligatoire pour la vente
              de maison F/G/E (depuis 2025) et pour MPR Parcours accompagné (projets &gt; 5 000 €
              avec saut 2 classes DPE). Voici la grille de prix par surface, le comparatif vs DPE et
              la checklist auditeur RGE.
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
                    <th className="p-3 border-b border-sand-200">Prix audit</th>
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
                Fourchettes nationales 2026 TTC, méthode RGE Audit Énergétique (TH-C-E ex / 3CL
                renforcée). Variations +10-20 % en Île-de-France, PACA et grandes métropoles.
                Sources : France Rénov’, baromètre auditeurs RGE 2026, OPQIBI.
              </p>
            </div>

            <h2 id="aide-anah">Aide ANAH 500 € (MPR Parcours accompagné)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 p-5">
              <p className="m-0 mb-3 text-sand-700">
                Dans le cadre de <strong>MaPrimeRénov’ Parcours accompagné</strong> (projets de
                rénovation &gt; 5 000 € avec saut de 2 classes DPE minimum), l’audit énergétique est
                <strong> obligatoire</strong> et bénéficie d’une aide ANAH :
              </p>
              <ul className="m-0 space-y-2 text-sm text-sand-700">
                <li>
                  <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Très modestes (Bleu)</strong> : aide ANAH <strong>500 €</strong> (taux 100
                  % dans la limite 500 €)
                </li>
                <li>
                  <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Modestes (Jaune)</strong> : aide ANAH <strong>400 €</strong> (taux 80 %
                  dans la limite 500 €)
                </li>
                <li>
                  <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Intermédiaires (Violet)</strong> : aide ANAH <strong>300 €</strong> (taux
                  60 %)
                </li>
                <li>
                  <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  <strong>Supérieurs (Rose)</strong> : aide ANAH <strong>150 €</strong> (taux 30 %)
                </li>
              </ul>
              <p className="text-xs text-sand-500 mt-3 mb-0">
                Conditions : auditeur certifié RGE Audit Énergétique agréé France Rénov’, dossier
                MPR déposé AVANT signature audit, projet de travaux &gt; 5 000 € avec saut de 2
                classes DPE minimum (par ex. F → D, E → C). Sources : ANAH, France Rénov’ 2026.
              </p>
            </div>

            <h2 id="audit-vs-dpe">Audit énergétique vs DPE : comparatif</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Aspect</th>
                    <th className="p-3 border-b border-sand-200">DPE</th>
                    <th className="p-3 border-b border-sand-200">Audit énergétique</th>
                  </tr>
                </thead>
                <tbody>
                  {AUDIT_VS_DPE.map((row) => (
                    <tr key={row.aspect} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">
                        <Scale className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                        {row.aspect}
                      </td>
                      <td className="p-3 text-sand-700">{row.dpe}</td>
                      <td className="p-3 text-sand-700">{row.audit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Le DPE et l’audit énergétique sont 2 documents distincts mais complémentaires. Pour
                vente maison F/G/E : les DEUX sont obligatoires. Sources : Légifrance L126-28-1 CCH,
                France Rénov’, ADEME.
              </p>
            </div>

            <h2 id="facteurs-prix">6 facteurs qui font varier le prix</h2>
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

            <h2 id="pieges">6 pièges sur un devis audit énergétique</h2>
            <div className="not-prose grid gap-3 my-6">
              {PIEGES_DEVIS.map((piege) => (
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

            <h2 id="checklist">Checklist auditeur RGE</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Certification RGE Audit Énergétique</strong> agréé France Rénov’ (vérifier
                annuaire officiel)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Attestation d’assurance professionnelle</strong> RC Pro à exiger en copie
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Visite physique obligatoire</strong> 3-7 h selon surface (refuser tout audit
                « à distance »)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>2 scénarios chiffrés minimum</strong> avec cible classe C ou B (méthode RGE
                Audit Énergétique TH-C-E ex / 3CL renforcée)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Plan de financement aides</strong> détaillé (MPR + CEE + éco-PTZ + aides
                locales)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Photos justificatives</strong> annexées au rapport final
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Délai de remise</strong> 2-3 semaines (refuser &gt; 4 semaines)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total TTC + remise rapport PDF + papier</strong> + soutien démarches MPR
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer mes aides MaPrimeRénov’ + audit
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur estime votre profil (revenus, surface, classe DPE) et liste les
                    aides MPR + CEE + audit en pack. Pour vente maison F/G/E : pack DPE + audit +
                    DDT optimisé.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      MPR Parcours accompagné <ArrowRight className="w-4 h-4" aria-hidden />
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
              href="/renovation-energetique/diagnostic/audit-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Audit énergétique
            </Link>
            <Link
              href="/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              MPR Parcours accompagné <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
