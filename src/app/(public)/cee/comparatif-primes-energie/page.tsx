/**
 * Page : /cee/comparatif-primes-energie
 *
 * @kw-primary    prime edf
 * @kw-volume     7500
 * @kw-kd         3
 * @kw-cpc        0.70
 * @cluster       cee-primes-energie-comparatif
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  B16 (récap audits 2026-05-06 — Bloc 1 Ahrefs cluster CEE primes)
 *
 * KW cibles validés Ahrefs API live (2026-05-06, country=fr) :
 * - "prime edf"                      → 7 500 vol, KD 3, CPC $0,70 ⭐⭐⭐⭐⭐ PIVOT
 * - "prime energie edf"              → 10 000 vol, KD 2, CPC $0,80 ⭐⭐⭐⭐⭐
 * - "prime cee edf"                  → 6 300 vol, KD 30, CPC $0,90
 * - "prime energie"                  → 4 800 vol, KD 58 (head — capture indirect via H2)
 * - "prime cee"                      → 8 200 vol, KD 48 (head — capture indirect via H1)
 * - "prime coup de pouce"            → 1 200 vol, KD 47
 * - "prime energie engie"            → 1 000 vol, KD 1, CPC $0,80 ⭐⭐⭐⭐
 * - "comparatif prime energie"       →    20 vol, KD null, CPC $1,40
 * - "montant prime energie"          →    40 vol, KD 26
 * - Famille cumulée (KD ≤ 3) : ~18 500 vol/mois accessibles
 * - Famille cumulée totale         : ~30 000 vol/mois (incl. heads dur)
 *
 * Easy win : OUI MAJEUR sur "prime edf" 7 500 vol KD 3 et "prime energie engie"
 * 1 000 vol KD 1. Heads "prime cee" / "prime energie" KD 47-58 = capture indirecte
 * via maillage descendant (cette page = autorité topical sur le cluster).
 *
 * Cluster pillar : CEE → Primes énergie → Comparatif obligés
 *
 * Anti-cannibalisation :
 *   - Hub /cee = catalogue 21 opérations CEE (BAR-TH-104, etc.) avec tableau ops
 *   - /cee/mandataire-vs-direct = guide juridique 3 rôles (obligé/délégataire/mandataire)
 *   - /cee/coup-de-pouce-2026 = bonification Coup de pouce uniquement
 *   - /cee/[operation] = pages dédiées par opération
 *   - Cette page = COMPARATIF des 5 acteurs principaux émettant la prime au public
 *     (EDF, Engie, TotalEnergies, Sonergia, Hellio) — angle "où demander ma prime"
 *     vs hub /cee qui est "quelle opération CEE pour mes travaux".
 *
 * YMYL : aide financière + transparence concurrentielle. Cite DGEC + Légifrance
 *        + sites officiels obligés/mandataires + observatoire CEE PNCEE.
 *        Hedge volontairement les montants exacts (forfait selon zone climatique
 *        + revenus + opération) avec renvoi france-renov.gouv.fr / sites obligés.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Award,
  Building2,
  Calculator,
  CheckCircle2,
  Coins,
  Clock,
  ExternalLink,
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
import {
  getBreadcrumbSchema,
  getCeeGovServiceSchema,
  getCoupDePouceGovServiceSchema,
  getFAQSchema,
  getFinancialProductSchema,
} from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/cee/comparatif-primes-energie'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Prime Énergie 2026 : comparatif EDF, Engie, TotalEnergies, Sonergia'
const DESCRIPTION =
  'Prime énergie / prime CEE 2026 : comparatif EDF, Engie, TotalEnergies, Sonergia, Hellio. Montants, conditions, délai de paiement par obligé.'

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
  'Prime énergie = prime CEE = même dispositif (Certificats d’Économie d’Énergie, créés en 2005, code énergie L221-1).',
  'Tous les obligés et mandataires utilisent le MÊME barème DGEC : la "prime EDF" et la "prime Engie" sont calculées sur les mêmes fiches d’opérations.',
  'La différence : montant exact (chacun ajoute une bonification commerciale 5-15 %), délai de paiement (4-12 semaines), interface dossier, partenaires RGE imposés.',
  'Coup de pouce 2026 (chauffage, isolation) : bonification renforcée pour ménages modestes / très modestes — montants identiques entre obligés (cadre DGEC).',
  'Règle d’or : la demande de prime DOIT être faite AVANT signature du devis — sinon dossier refusé (article R221-22 code énergie).',
  'Cumul possible avec MaPrimeRénov’, éco-PTZ, TVA 5,5 %. Pas avec autre prime CEE pour la même opération (interdiction double valorisation, art. R221-26).',
]

const OBLIGES = [
  {
    nom: 'EDF',
    role: 'Obligé (1er fournisseur électricité France)',
    site: 'particulier.edf.fr/fr/accueil/economies-energie/prime-energie',
    portefeuille: 'Prime Énergie EDF (pour particuliers + pros)',
    avantages:
      'Plus grosse base clients France (28 M comptes), interface mature, paiement sous 4-8 sem post-validation. Réseau RGE imposé Effy (filiale).',
    inconvenients:
      'Montants moyens (pas de bonus excessif). Réseau RGE imposé = moins de souplesse choix artisan.',
    delai: '4-8 semaines après dépôt complet',
    bonification: '5-10 % vs barème DGEC nu',
    coup_pouce: 'OUI Coup de pouce chauffage + isolation 2026',
  },
  {
    nom: 'Engie (Mon Programme pour la Maison)',
    role: 'Obligé (1er fournisseur gaz France)',
    site: 'particuliers.engie.fr/maitrise-energie/prime-energie-engie',
    portefeuille: 'Prime Énergie Engie + Mon Programme pour la Maison',
    avantages:
      'Maturité dossier, suivi appli mobile, bon support. Réseau d’artisans RGE Engie Solutions large. Coup de pouce activé.',
    inconvenients:
      'Réseau partenaire imposé. Montant prime moyen sans bonus excessif. Paiement 5-10 sem.',
    delai: '5-10 semaines',
    bonification: '5-10 %',
    coup_pouce: 'OUI Coup de pouce chauffage + isolation 2026',
  },
  {
    nom: 'TotalEnergies',
    role: 'Obligé (carburants + électricité + gaz)',
    site: 'totalenergies.fr/particuliers/economies-energie/prime-energie',
    portefeuille: 'Prime Énergie TotalEnergies',
    avantages:
      'Bonifications souvent supérieures (10-15 % vs barème nu) sur opérations chauffage. Liberté choix artisan RGE. Suivi en ligne fluide.',
    inconvenients:
      'Marque énergie fossile = image moins "verte" pour certains profils. Délai variable selon opération.',
    delai: '6-12 semaines',
    bonification: '10-15 %',
    coup_pouce: 'OUI Coup de pouce chauffage + isolation 2026',
  },
  {
    nom: 'Sonergia',
    role: 'Délégataire CEE indépendant',
    site: 'sonergia.fr/particulier',
    portefeuille: 'Prime Sonergia (CEE classique + Coup de pouce)',
    avantages:
      'Spécialiste pure-play CEE (pas un fournisseur d’énergie). Bon réseau partenaires RGE locaux. Interface artisan/particulier mature. Souvent partenaire de mandataires (dont SA Energy).',
    inconvenients: 'Marque moins connue grand public. Bonification standard.',
    delai: '4-8 semaines',
    bonification: '5-12 %',
    coup_pouce: 'OUI Coup de pouce chauffage + isolation 2026',
  },
  {
    nom: 'Hellio',
    role: 'Délégataire CEE (filiale ECO-CO2)',
    site: 'hellio.com/particulier/aides-financieres/prime-cee',
    portefeuille: 'Prime CEE Hellio (B2C + copropriétés)',
    avantages:
      'Forte expertise copropriété + B2B. Suivi expert. Bonification compétitive. Réseau d’artisans RGE national.',
    inconvenients:
      'Process administratif plus lourd (justificatifs renforcés). Délai parfois plus long en B2B.',
    delai: '6-12 semaines',
    bonification: '5-12 %',
    coup_pouce: 'OUI Coup de pouce chauffage + isolation 2026',
  },
]

const COMPARATIF_OPERATIONS = [
  {
    operation: 'BAR-TH-104 — PAC air-eau',
    barème_dgec: '~2 500-4 000 € (selon zone + revenus)',
    coup_pouce: '+ 2 500-5 500 € (modeste / très modeste)',
    note: 'Bonification Coup de pouce versée par tous les obligés (cadre DGEC unifié).',
  },
  {
    operation: 'BAR-EN-101 — Isolation combles perdus',
    barème_dgec: '~7-15 €/m² (selon zone + revenus)',
    coup_pouce: '+ 10-12 €/m² (modeste / très modeste)',
    note: 'Aide forfaitaire au m² isolé, plafonnée à 100 m² Coup de pouce.',
  },
  {
    operation: 'BAR-TH-129 — PAC air-air',
    barème_dgec: '~500-1 200 € (selon zone + revenus)',
    coup_pouce: '— (pas Coup de pouce dédié)',
    note: 'Plus modeste vs air-eau. Cumul MaPrimeRénov’ possible.',
  },
  {
    operation: 'BAR-TH-127 — VMC double flux',
    barème_dgec: '~600-1 800 €',
    coup_pouce: '— (pas Coup de pouce dédié)',
    note: 'Cumul MPR Bleu jusqu’à 2 500 € possible.',
  },
  {
    operation: 'BAR-TH-106 — Chaudière biomasse',
    barème_dgec: '~3 000-5 500 €',
    coup_pouce: '+ 2 500-4 000 € (Coup de pouce chauffage)',
    note: 'Souvent en remplacement chaudière fioul/gaz interdite (loi Climat).',
  },
]

const ETAPES_DEPOT = [
  {
    step: 'Choisir un obligé / mandataire',
    detail:
      'Comparer délais paiement, bonification (5-15 %), réseau RGE imposé, qualité interface. Engagement = simulation puis devis liés à un obligé spécifique.',
  },
  {
    step: 'Simulation + accord PRÉALABLE devis',
    detail:
      'OBLIGATOIRE : la prime CEE doit être confirmée AVANT signature du devis (article R221-22 code énergie). Sans accord préalable, dossier refusé.',
  },
  {
    step: 'Signature devis avec artisan RGE imposé',
    detail:
      'Souvent l’obligé impose son réseau RGE partenaire (Effy pour EDF, Engie Solutions, etc.) ou laisse libre choix (TotalEnergies, Sonergia souvent plus souples).',
  },
  {
    step: 'Réalisation travaux + facture',
    detail:
      'Travaux exécutés par RGE conforme au cahier des charges DGEC (ex : SCOP ≥ 3,4 PAC air-eau, R ≥ 7 isolation combles).',
  },
  {
    step: 'Dépôt dossier sous 6 mois',
    detail:
      'Constituer dossier (devis, facture acquittée, attestation RGE valide, photos avant/après) et envoyer à l’obligé sous 6 mois max post-fin travaux.',
  },
  {
    step: 'Versement prime',
    detail:
      'Délai 4-12 semaines selon obligé. Versement par virement bancaire (rare : chèque ou bons d’achat selon obligé).',
  },
]

const faqs = [
  {
    question: 'Quelle est la différence entre prime EDF, prime Engie et prime CEE ?',
    answer:
      'Aucune fondamentalement. La "prime EDF", la "prime Engie" et la "prime CEE" désignent toutes le même dispositif : les Certificats d’Économie d’Énergie (CEE) créés en 2005 (code énergie L221-1). EDF, Engie, TotalEnergies, Sonergia et Hellio sont des obligés ou délégataires qui financent les CEE. Le barème de calcul est unifié (fiches DGEC standardisées). La différence se joue sur la bonification commerciale (5-15 %), le délai de paiement (4-12 semaines), l’interface, et parfois le réseau RGE imposé.',
  },
  {
    question: 'Quel obligé verse la plus grosse prime énergie en 2026 ?',
    answer:
      'Aucun ne se détache durablement : tous appliquent le même barème DGEC + bonification commerciale 5-15 %. TotalEnergies est souvent cité pour des bonifications plus généreuses (10-15 %) sur certaines opérations chauffage, mais ce n’est pas systématique. La meilleure méthode : faire 2-3 simulations en parallèle (sites EDF, Engie, TotalEnergies, Sonergia) avec votre devis et comparer les montants exacts proposés. Le top simulateur : france-renov.gouv.fr (officiel, tous obligés agrégés).',
  },
  {
    question: 'Puis-je cumuler prime EDF + prime Engie pour les mêmes travaux ?',
    answer:
      'NON. L’article R221-26 du code énergie interdit la double valorisation d’une même opération de travaux : un seul obligé/mandataire peut être désigné par dossier. En revanche, vous pouvez cumuler la prime CEE (un seul obligé) avec MaPrimeRénov’ (Anah), l’éco-PTZ, la TVA 5,5 %, et les aides locales. Cumul typique pour une PAC air-eau ménage modeste : MPR ~5 000 € + CEE ~3 500 € + éco-PTZ jusqu’à 30 000 € = 8 500 € de subventions directes.',
  },
  {
    question: 'Faut-il signer le devis AVANT ou APRÈS demande de prime ?',
    answer:
      'AVANT toute signature de devis. C’est la règle d’or : article R221-22 du code énergie impose que l’engagement contractuel (signature du devis) intervienne APRÈS l’accord préalable de l’obligé. Concrètement : (1) demander un devis non signé, (2) faire la simulation chez l’obligé choisi, (3) recevoir le bon de commande/accord avec montant prime, (4) signer le devis, (5) faire les travaux, (6) déposer le dossier final. Toute prime demandée APRÈS signature du devis sera automatiquement REJETÉE par le PNCEE.',
  },
  {
    question: 'Quel est le délai de paiement d’une prime énergie 2026 ?',
    answer:
      'Variable selon obligé et complexité : EDF 4-8 semaines, Engie 5-10 sem, TotalEnergies 6-12 sem, Sonergia 4-8 sem, Hellio 6-12 sem. Le délai démarre au DEPOT du dossier complet (et non à la fin des travaux). Pièces typiquement requises : devis signé, facture acquittée, attestation sur l’honneur, certification RGE de l’artisan, photos avant/après, déclaration de fin travaux. Tout dossier incomplet repart en file d’attente.',
  },
  {
    question: 'L’artisan RGE est-il imposé par l’obligé CEE ?',
    answer:
      'Cela dépend de l’obligé : EDF impose son réseau Effy (filiale), Engie impose Engie Solutions ou réseau partenaire, TotalEnergies est plus souple (libre choix RGE certifié + qualif adaptée), Sonergia et Hellio en délégataires laissent généralement libre choix. Vérifier en amont la liste des artisans agréés/imposés. Si vous avez DÉJÀ un artisan RGE de confiance, privilégier les obligés/mandataires sans réseau imposé (TotalEnergies, Sonergia, Hellio).',
  },
  {
    question: 'Qu’est-ce que le Coup de pouce 2026 et comment ça change ?',
    answer:
      'Le "Coup de pouce" est une bonification renforcée des CEE pour les ménages modestes et très modestes sur certaines opérations stratégiques (chauffage hors gaz/fioul, isolation). En 2026, il est actif sur : remplacement chaudière fioul/gaz par PAC air-eau (+ 2 500-5 500 €), chaudière biomasse (+ 2 500-4 000 €), isolation combles (+ 10-12 €/m²). Le montant est identique chez tous les obligés (cadre DGEC unifié). Cumul automatique avec la prime CEE de base.',
  },
  {
    question: 'Comment vérifier que mon obligé est légitime et solide ?',
    answer:
      'Vérifications : (1) inscription au registre PNCEE (registre-cee.developpement-durable.gouv.fr), (2) si délégataire, vérifier le SIREN sur societe.com et la solvabilité (bilan publié), (3) avis clients (Trustpilot, Google Reviews, signalements DGCCRF), (4) durée d’existence (≥ 5 ans = signal fiabilité), (5) capacité à émettre les CEE auprès du PNCEE. Méfiance envers obligés/délégataires inconnus avec promesse de "+ 30 % de prime" : la bonification commerciale légale est plafonnée empiriquement à 15 % vs barème DGEC.',
  },
]

const sources = [
  {
    label: 'Légifrance — Code énergie L221-1 et suivants (CEE)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023983208/LEGISCTA000023985933',
  },
  {
    label: 'Légifrance — Article R221-22 (accord préalable obligatoire)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031740893',
  },
  {
    label: 'Légifrance — Article R221-26 (interdiction double valorisation)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031740913',
  },
  {
    label: 'Registre national PNCEE (CEE délivrés et obligés)',
    url: 'https://www.registre-cee.developpement-durable.gouv.fr',
  },
  {
    label: 'Service-Public.fr — Certificats d’économies d’énergie',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35624',
  },
  {
    label: 'France Rénov’ — Simulateur officiel CEE + MPR',
    url: 'https://france-renov.gouv.fr/aides/simulation',
  },
  {
    label: 'DGEC — Catalogue fiches d’opérations standardisées',
    url: 'https://www.ecologie.gouv.fr/operations-standardisees-deconomies-denergie',
  },
]

const relatedPages = [
  {
    label: 'Hub CEE : 21 opérations standardisées',
    href: '/cee',
    description: 'Catalogue complet BAR-TH, BAR-EN, BAT-* (chauffage, isolation, ventilation)',
  },
  {
    label: 'Mandataire vs délégataire vs obligé CEE',
    href: '/cee/mandataire-vs-direct',
    description: 'Les 3 rôles juridiques expliqués (code énergie L221-1)',
  },
  {
    label: 'Coup de pouce 2026 (bonification)',
    href: '/cee/coup-de-pouce-2026',
    description: 'Bonus modeste / très modeste chauffage + isolation',
  },
  {
    label: 'CEE PAC air-eau (BAR-TH-104)',
    href: '/cee/bar-th-104',
    description: 'Prime ~2 500-4 000 € + Coup de pouce + cumul MPR',
  },
  {
    label: 'CEE Isolation combles (BAR-EN-101)',
    href: '/cee/bar-en-101',
    description: 'Prime ~7-15 €/m² + Coup de pouce isolation',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ + TVA 5,5 % cumul',
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
    section: 'CEE — Comparatif primes énergie',
    keywords: [
      'prime edf',
      'prime energie edf',
      'prime cee edf',
      'prime energie',
      'prime cee',
      'prime energie engie',
      'prime energie totalenergies',
      'comparatif prime energie',
      'prime coup de pouce',
      'montant prime energie',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'CEE', url: '/cee' },
    { name: 'Comparatif primes énergie', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const finProductSchema = getFinancialProductSchema({
    name: 'Prime Énergie / Prime CEE 2026',
    description:
      'Aide financière issue du dispositif Certificats d’Économie d’Énergie (CEE) versée par les obligés (EDF, Engie, TotalEnergies) ou délégataires (Sonergia, Hellio) pour financer les travaux de rénovation énergétique chez les particuliers, en complément de MaPrimeRénov’.',
    url: PAGE_URL,
    feesAndCommissionsSpecification:
      'Aucune avance ni frais à charge du bénéficiaire. La prime est versée après dépôt du dossier complet (4-12 sem selon obligé). Cumul avec MaPrimeRénov’, éco-PTZ et TVA 5,5 % autorisé (interdiction double valorisation CEE).',
  })
  // GovernmentService — page de comparatif des primes CEE + Coup de pouce 2026.
  // Émet 2 nodes (CEE classique + Coup de pouce bonifié) avec fragment d'URL
  // distinct pour @id uniques.
  const ceeGovSchema = getCeeGovServiceSchema(`${PAGE_URL}#cee`)
  const coupDePouceGovSchema = getCoupDePouceGovServiceSchema(`${PAGE_URL}#coup-de-pouce`)

  const schemas = [
    articleSchema,
    breadcrumbSchema,
    faqSchema,
    finProductSchema,
    ceeGovSchema,
    coupDePouceGovSchema,
  ].filter((s): s is Record<string, unknown> => s !== null)

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'CEE', href: '/cee' }, { label: 'Comparatif primes énergie' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Code énergie L221-1 — Barème DGEC unifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prime Énergie 2026 : comparatif EDF, Engie, TotalEnergies, Sonergia
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Prime énergie</strong>, <strong>prime CEE</strong>, "prime EDF" ou "prime
              Engie" : tous ces termes désignent le même dispositif (Certificats d’Économie
              d’Énergie, code énergie L221-1). Tous les obligés appliquent le même barème DGEC, avec
              une bonification commerciale 5-15 %. Voici le comparatif des 5 acteurs majeurs du
              marché en 2026 — montants, délais, conditions, partenaires RGE — pour choisir celui
              qui maximise votre prime sur votre projet.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="comprendre">Prime énergie, prime CEE, prime EDF : c’est la même chose</h2>
            <p>
              Le marché communique sous différents noms commerciaux mais le dispositif est unique :
              les <strong>Certificats d’Économie d’Énergie (CEE)</strong> créés en 2005 par la loi
              POPE et codifiés à l’article L221-1 du Code de l’énergie. Tous les fournisseurs
              d’énergie (carburants, gaz, électricité, fioul) sont OBLIGÉS de financer des économies
              d’énergie chez les consommateurs. Pour respecter cette obligation, ils versent des
              primes ("prime EDF", "prime Engie", "prime TotalEnergies") aux particuliers qui
              réalisent des travaux éligibles.
            </p>
            <p>
              <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Les <strong>délégataires</strong> (Sonergia, Hellio, GEO PLC) collectent des CEE pour
              le compte d’obligés en échange d’une marge. Les <strong>mandataires</strong> (parfois
              ServicesArtisans Energy en partenariat avec Sonergia) sont des intermédiaires
              opérationnels qui constituent et déposent les dossiers CEE.
            </p>
            <p>
              Le <strong>barème de calcul</strong> est unifié : fiches d’opérations standardisées
              DGEC (BAR-TH-104 PAC air-eau, BAR-EN-101 isolation combles, etc.), montants forfaits
              ou €/m² selon zone climatique (H1/H2/H3) et revenus (modeste / très modeste /
              classique). Ce que chaque obligé peut faire varier : la{' '}
              <strong>bonification commerciale</strong> (5-15 % vs barème DGEC nu), le délai de
              paiement, le réseau RGE imposé, l’interface dossier.
            </p>

            <h2 id="comparatif-obliges">Comparatif des 5 obligés / mandataires majeurs 2026</h2>
            <p>
              Référence : marché B2C français mai 2026. Tous proposent CEE classique + Coup de pouce
              2026 (chauffage hors fossile + isolation).
            </p>
            <div className="not-prose grid gap-3 my-6">
              {OBLIGES.map((o) => (
                <div key={o.nom} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-primary-700 shrink-0 mt-1" aria-hidden />
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{o.nom}</p>
                      <p className="text-xs text-sand-600 m-0">{o.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Portefeuille :</strong> {o.portefeuille}
                  </p>
                  <div className="grid md:grid-cols-3 gap-2 text-xs my-2">
                    <div>
                      <p className="text-sand-500 m-0">Délai paiement</p>
                      <p className="font-medium text-sand-900 m-0">{o.delai}</p>
                    </div>
                    <div>
                      <p className="text-sand-500 m-0">Bonification</p>
                      <p className="font-medium text-primary-700 m-0">{o.bonification}</p>
                    </div>
                    <div>
                      <p className="text-sand-500 m-0">Coup de pouce 2026</p>
                      <p className="font-medium text-sand-900 m-0">{o.coup_pouce}</p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-700 m-0">
                    <strong>+ Avantages :</strong> {o.avantages}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mt-1">
                    <strong>− Limites :</strong> {o.inconvenients}
                  </p>
                  <p className="text-xs text-sand-500 mt-2 mb-0">
                    Site officiel :{' '}
                    <a
                      href={`https://${o.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5"
                    >
                      {o.site} <ExternalLink className="w-3 h-3" aria-hidden />
                    </a>
                  </p>
                </div>
              ))}
            </div>

            <h2 id="montants">Montants prime CEE 2026 par opération (barème DGEC)</h2>
            <p>
              Le barème DGEC est <strong>identique chez tous les obligés</strong>. La bonification
              commerciale (5-15 %) s’ajoute par-dessus. Coup de pouce 2026 = bonification renforcée
              modeste/très modeste sur opérations stratégiques.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Opération</th>
                    <th className="p-3 border-b border-sand-200">Barème DGEC base</th>
                    <th className="p-3 border-b border-sand-200">Coup de pouce 2026</th>
                    <th className="p-3 border-b border-sand-200">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_OPERATIONS.map((c) => (
                    <tr key={c.operation} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold text-sand-900">{c.operation}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.barème_dgec}</td>
                      <td className="p-3 text-sand-700">{c.coup_pouce}</td>
                      <td className="p-3 text-xs text-sand-700">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Montants indicatifs 2026 sous réserve actualisation barème DGEC. Vérifier le montant
              exact via le simulateur officiel{' '}
              <a
                href="https://france-renov.gouv.fr/aides/simulation"
                target="_blank"
                rel="noopener noreferrer"
              >
                france-renov.gouv.fr
              </a>{' '}
              avant tout engagement.
            </p>

            <h2 id="processus">6 étapes pour obtenir sa prime énergie</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES_DEPOT.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Règle d’or : accord PRÉALABLE obligatoire</p>
                <p className="m-0">
                  L’article R221-22 du Code de l’énergie impose que la{' '}
                  <strong>demande de prime CEE soit déposée AVANT signature du devis</strong>. Toute
                  prime demandée APRÈS signature sera automatiquement REJETÉE par le PNCEE (registre
                  national CEE). Plusieurs cas de fraude au "rétro-remplissage" sanctionnés par la
                  DGCCRF en 2024-2025.
                </p>
              </div>
            </div>

            <h2 id="cumul">Cumul prime CEE avec autres aides 2026</h2>
            <p>
              <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              La prime CEE est <strong>cumulable</strong> avec :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> (Anah) — cumul automatique sur déclaration.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> (prêt à taux zéro jusqu’à 30 000 € par geste, 50 000 €
                rénovation d’ampleur).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> sur fourniture + pose RGE (logement &gt; 2 ans).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> (région, département, intercommunalité, ANAH
                sociale).
              </li>
            </ul>
            <p>
              <strong>Interdit (article R221-26)</strong> : cumul de 2 primes CEE pour la même
              opération de travaux (double valorisation = sanction PNCEE + remboursement). Un seul
              obligé/mandataire par dossier.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer toutes vos aides 2026 (CEE + MPR + éco-PTZ)
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané du cumul max selon votre profil + mise en relation avec un
                    artisan RGE local certifié pour le bon réseau d’obligé.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="choisir">Comment choisir le bon obligé pour son projet ?</h2>
            <p>
              <Clock className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              <strong>3 critères de choix prioritaires</strong> :
            </p>
            <ol>
              <li>
                <strong>Liberté de choix RGE</strong> : si vous avez déjà un artisan RGE de
                confiance, privilégier TotalEnergies, Sonergia ou Hellio (libre choix). Éviter
                EDF/Engie qui imposent leur réseau.
              </li>
              <li>
                <strong>Délai de paiement</strong> : EDF et Sonergia rapides (4-8 sem), Hellio et
                TotalEnergies plus lents (6-12 sem). Important si vous avez besoin de la prime pour
                boucler le financement.
              </li>
              <li>
                <strong>Bonification effective</strong> : faire 2-3 simulations en parallèle. Sur
                opérations chauffage (PAC, biomasse), TotalEnergies est souvent compétitif (10-15 %
                bonus). Sur isolation, EDF/Engie/Sonergia se valent.
              </li>
            </ol>
            <p>
              <strong>Notre recommandation 2026</strong> : faire la simulation officielle{' '}
              <a
                href="https://france-renov.gouv.fr/aides/simulation"
                target="_blank"
                rel="noopener noreferrer"
              >
                france-renov.gouv.fr
              </a>{' '}
              (agrège tous les obligés), puis comparer avec 1-2 simulations directes chez les
              obligés/mandataires que vous préférez. Choisir celui qui combine bon montant + bon
              délai + libre choix artisan.
            </p>
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
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link href="/cee" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Hub CEE
            </Link>
            <Link
              href="/cee/coup-de-pouce-2026"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Coup de pouce 2026 <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
