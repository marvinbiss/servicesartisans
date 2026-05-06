/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-condensation/entretien
 *
 * @kw-primary    entretien chaudiere gaz
 * @kw-volume     6200
 * @kw-kd         12
 * @kw-cpc        1.05
 * @intent        informational + service
 * @cluster       chauffage-entretien
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster entretien chaudière)
 * @backlog-item  Levier-J-entretien-chaudiere-gaz
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "entretien chaudiere gaz"        6 200 vol, KD 12 ⭐⭐ pivot
 * - "contrat entretien chaudiere"    1 800 vol, KD 8
 * - "prix entretien chaudiere gaz"   1 200 vol, KD 4
 * - "entretien chaudiere obligatoire"  900 vol, KD 5
 * - "entretien chaudiere annuel"       650 vol, KD 3
 * - "tarif entretien chaudiere"        500 vol, KD 2
 * - "attestation entretien chaudiere"  450 vol, KD 1
 * - "entretien chaudiere gaz prix"     400 vol, KD 1
 * - Famille cumulée pivot : ~12 100 vol/mois (intent service récurrent + obligation légale)
 *
 * Easy win : OUI MAJEUR (KD 12 sur pivot, 0 acteur RGE-first sur SERP top 5)
 *            Concurrence Engie/EDF/sites-prix qui poussent contrat sponsorisé sans transparence.
 *            Atout SA : prix nets, obligations légales sourcées Légifrance, conseils choisir pro.
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Chaudière condensation → Entretien
 *
 * Anti-cannibalisation :
 *   - /chauffage                                = hub chauffage (intent achat)
 *   - /chauffage/chaudiere-condensation         = produit chaudière gaz (intent install)
 *   - /chauffage/ramonage                       = entretien conduits fumée (différent du brûleur)
 *   - /chauffage/tubage-cheminee                = pose tubage (intent install)
 *   - /pompe-a-chaleur/entretien                = entretien PAC (autre énergie)
 *   - Cette page = entretien chaudière gaz/condensation (intent service récurrent annuel)
 *
 * YMYL high : obligation légale (Décret 2009-649 modifié 2020-712, Code énergie L224-1),
 * sécurité (intoxication CO2, explosion gaz), assurance habitation (clause attestation),
 * responsabilité civile/pénale en cas de sinistre. Pas d'aide MPR/CEE pour l'entretien.
 *
 * Cite : Décret 2009-649 du 9 juin 2009, Décret 2020-912 du 28 juillet 2020,
 * Code énergie L224-1, Service-public.fr F31894, ADEME, AFG (Association Française du Gaz),
 * QualiGaz Évolution (organisme certificateur), Légifrance.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
  ShieldCheck,
  Wrench,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-condensation/entretien'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Entretien chaudière gaz 2026 : prix & obligation'
const DESCRIPTION =
  'Entretien chaudière gaz 2026 : obligation légale annuelle, prix 100-200 € HT, 12 points de contrôle, contrat ou ponctuel, attestation 2 ans. Choisir un pro QualiGaz.'

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
  'Entretien annuel obligatoire pour toute chaudière gaz 4-400 kW (Décret 2009-649 modifié 2020-912).',
  'Prix moyen 2026 : 100-180 € HT en ponctuel, 130-220 € HT en contrat annuel.',
  '12 points de contrôle dont mesure CO et CO2 fumées, contrôle étanchéité gaz, nettoyage brûleur.',
  "Attestation d'entretien à conserver 2 ans (exigée par l'assurance en cas de sinistre).",
  'Pro QualiGaz Évolution recommandé (mention RGE pour aussi bénéficier des CEE travaux annexes).',
  "Pas d'aide MPR/CEE pour l'entretien (récurrent, hors bouquet travaux).",
]

const PRIX_ENTRETIEN = [
  {
    type: 'Visite ponctuelle (sans contrat)',
    prix: '100-180 € HT',
    detail:
      "Une visite/an payée à l'acte. Convient si le logement vient d'être occupé ou si la chaudière est récente (< 5 ans).",
  },
  {
    type: 'Contrat annuel basique',
    prix: '130-180 € HT/an',
    detail:
      'Visite + nettoyage brûleur + attestation. Pas de pièces ni dépannage inclus. Standard pour chaudière < 10 ans bien entretenue.',
  },
  {
    type: 'Contrat avec pièces et dépannage',
    prix: '180-260 € HT/an',
    detail:
      'Visite annuelle + dépannage 24h/24 + petites pièces (joints, sondes, électrodes). Recommandé si la chaudière a 8-15 ans.',
  },
  {
    type: 'Contrat tout inclus (toutes pièces)',
    prix: '250-400 € HT/an',
    detail:
      "Pièces majeures incluses (corps de chauffe, vase d'expansion, circulateur). Souvent vendu par les énergéticiens (Engie HomeServices, EDF Soluzio). Comparer avec assurance + ponctuel : souvent moins rentable.",
  },
]

const POINTS_CONTROLE = [
  "Vérification visuelle de l'état général de la chaudière (corrosion, fuites, raccords)",
  "Contrôle de l'étanchéité du circuit gaz (sniffer électronique ou eau savonneuse)",
  'Nettoyage du brûleur (démontage, dépoussiérage, contrôle injecteurs)',
  "Nettoyage de l'échangeur primaire (prévient l'entartrage et la baisse de rendement)",
  "Vérification du vase d'expansion (pression de gonflage 1,0-1,5 bar)",
  'Contrôle de la pression du circuit chauffage (1,0-1,5 bar à froid)',
  'Mesure du taux de CO (monoxyde de carbone) — seuil < 100 ppm air ambiant',
  'Mesure du CO2 fumées (3-9 % selon technologie) et calcul rendement combustion',
  'Vérification du tirage et de la conformité du conduit de fumée',
  'Contrôle des sécurités (thermostat, soupape, sonde, anti-retour de flamme)',
  "Vérification du circulateur, des purges et de l'évacuation des condensats",
  "Édition de l'attestation d'entretien (4 mentions obligatoires) + conseils d'utilisation",
]

const QUI_PAIE = [
  {
    cas: 'Vous êtes propriétaire occupant',
    qui: 'Vous',
    detail:
      'À votre charge intégralement. Pas de prise en charge par les aides (MPR/CEE) car récurrent. Déductible du revenu foncier si bien loué (régime réel).',
  },
  {
    cas: 'Vous êtes locataire (loi du 6 juillet 1989, art. 7)',
    qui: 'Locataire',
    detail:
      "L'entretien courant est à la charge du locataire (Décret 87-712 du 26 août 1987, annexe). Le propriétaire reste responsable du remplacement en fin de vie et des grosses réparations (corps de chauffe, vase, etc.).",
  },
  {
    cas: 'Vous êtes propriétaire bailleur',
    qui: 'Locataire (entretien) / vous (réparations)',
    detail:
      "Vous devez vérifier au bail que le locataire a bien effectué l'entretien (clause classique). Vous restez responsable du gros entretien et du remplacement. Bonne pratique : exiger copie de l'attestation tous les ans.",
  },
  {
    cas: 'Vous êtes en copropriété (chaudière collective)',
    qui: 'Syndic via charges',
    detail:
      "L'entretien de la chaudière collective est porté par le syndic. La répartition se fait via les charges récupérables (Décret 87-713). Voir les comptes et le contrat annuel souscrit par le syndic.",
  },
]

const faqs = [
  {
    question: "L'entretien annuel d'une chaudière gaz est-il obligatoire ?",
    answer:
      "Oui. Le Décret n° 2009-649 du 9 juin 2009, modifié par le Décret n° 2020-912 du 28 juillet 2020, impose un entretien annuel à toute chaudière gaz, fioul, bois, charbon ou multi-combustible d'une puissance comprise entre 4 et 400 kW. L'obligation pèse sur l'occupant du logement (propriétaire occupant ou locataire). En cas de sinistre, l'absence d'attestation d'entretien des 2 dernières années peut entraîner un refus partiel ou total de prise en charge par l'assurance habitation.",
  },
  {
    question: "Quel est le prix moyen d'un entretien chaudière gaz en 2026 ?",
    answer:
      'Visite ponctuelle 100-180 € HT (TVA 10 %, soit 110-200 € TTC). Contrat annuel basique 130-180 € HT. Contrat avec dépannage 180-260 € HT. Contrat tout inclus 250-400 € HT. Pour une chaudière condensation récente bien entretenue, la formule ponctuelle est souvent la plus économique. Au-delà de 8-10 ans, un contrat avec dépannage devient pertinent. Prix variables selon zone (+15-25 % en Île-de-France et grandes métropoles).',
  },
  {
    question: 'Quels points sont contrôlés lors de la visite ?',
    answer:
      "Le pro effectue 12 contrôles minimum : étanchéité circuit gaz, nettoyage brûleur, nettoyage échangeur, vérification vase d'expansion, pression circuit, mesure CO et CO2 fumées, contrôle tirage et conduit, vérification sécurités, circulateur et purges, évacuation des condensats. La visite dure 45 min à 1 h 30 selon l'âge et l'état de la chaudière. À l'issue, une attestation comportant 4 mentions obligatoires (efficacité énergétique, polluants atmosphériques, conseils d'utilisation, recommandations de remplacement) vous est remise.",
  },
  {
    question: "Que faire si je n'ai pas d'attestation d'entretien ?",
    answer:
      "Aucune sanction pénale directe, mais 3 risques majeurs : (1) refus partiel ou total d'indemnisation par l'assurance habitation en cas d'incendie ou d'intoxication CO ; (2) responsabilité civile et pénale si dommage à un tiers (voisin) imputable à un défaut d'entretien ; (3) si vous êtes locataire, retenue possible sur le dépôt de garantie en sortie. Solution : programmer un entretien rapidement, conserver l'attestation 2 ans minimum. La date d'effet ne peut pas être rétroactive.",
  },
  {
    question: 'Faut-il prendre un contrat ou payer à la visite ?',
    answer:
      "Pour une chaudière < 10 ans bien entretenue : ponctuel suffisant (100-180 € HT/an). Pour une chaudière 8-15 ans : contrat avec dépannage et petites pièces pertinent (180-260 € HT/an) car les pannes deviennent plus fréquentes (sondes, électrodes, joints). Au-delà de 15 ans : envisager un remplacement plutôt qu'un contrat tout inclus, car le coût du remplacement de pièces majeures (corps de chauffe 800-1 500 €) approche celui d'une nouvelle chaudière.",
  },
  {
    question: "Quel artisan choisir pour l'entretien d'une chaudière gaz ?",
    answer:
      "Plombier-chauffagiste qualifié <strong>QualiGaz Évolution</strong> (organisme habilité par les pouvoirs publics, c'est l'équivalent du PG/PGN/PGP des installateurs). La mention QualiGaz garantit la formation à la sécurité gaz et l'agrément pour les contrôles obligatoires. La mention <strong>RGE</strong> (Reconnu Garant de l'Environnement) est en plus utile si vous comptez faire des travaux d'économie d'énergie : elle ouvre droit aux CEE et MPR. Vérifier : SIRET valide, assurance décennale, certificat QualiGaz à jour.",
  },
  {
    question: 'Quand remplacer plutôt que réparer ?',
    answer:
      "Signaux : (1) chaudière > 15-18 ans avec pannes répétées ; (2) rendement saisonnier ηs < 90 % (vs 92-94 % pour une condensation récente) ; (3) coût des réparations annuelles > 30 % du prix d'une chaudière neuve sur 3 ans ; (4) marque ou modèle abandonné par le fabricant (pièces de rechange introuvables). Si remplacement, privilégier une PAC air-eau si possible (aides MPR + CEE Bleu) plutôt qu'une chaudière condensation gaz (plus aucune aide MPR depuis 2024 sauf hybride).",
  },
  {
    question: "Que vérifier sur l'attestation d'entretien ?",
    answer:
      "L'attestation doit être remise sous 15 jours après la visite et comporte 4 rubriques obligatoires (Arrêté du 15 septembre 2009 modifié) : (1) <strong>Efficacité énergétique</strong> — rendement saisonnier de combustion mesuré ; (2) <strong>Polluants atmosphériques</strong> — taux de CO et CO2 dans les fumées ; (3) <strong>Conseils d'utilisation</strong> — bonnes pratiques régulation/programmation ; (4) <strong>Recommandations</strong> — remplacement éventuel et orientation vers énergies renouvelables. À conserver 2 ans minimum (exigence assurance et bail).",
  },
]

const sources = [
  {
    label: 'Légifrance — Décret n° 2009-649 du 9 juin 2009 (entretien obligatoire)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000020722038',
  },
  {
    label: 'Légifrance — Décret n° 2020-912 du 28 juillet 2020 (refonte)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042169571',
  },
  {
    label: 'Service-Public.fr — Entretien de la chaudière',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31894',
  },
  {
    label: "Code de l'énergie — Article L224-1",
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031060912',
  },
  { label: 'ADEME — Bien entretenir sa chaudière', url: 'https://www.ademe.fr' },
  {
    label: 'AFG — Association Française du Gaz',
    url: 'https://www.afgaz.fr',
  },
  {
    label: 'QualiGaz Évolution — Organisme certificateur gaz',
    url: 'https://www.qualigaz.com',
  },
]

const relatedPages = [
  {
    label: 'Chaudière condensation 2026 — prix & alternatives',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    description: 'Prix posé 4 500-7 500 €, MPR supprimée 2024',
  },
  {
    label: 'Hub Chauffage',
    href: '/renovation-energetique/travaux/chauffage',
    description: '4 grandes familles + comparatif prix',
  },
  {
    label: 'Ramonage cheminée 2026',
    href: '/renovation-energetique/travaux/chauffage/ramonage',
    description: 'Obligation annuelle Décret 2023-741, 50-150 €',
  },
  {
    label: 'PAC air-eau 2026 — alternative recommandée',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Aides MPR + CEE massives vs chaudière gaz',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ cumulables',
  },
  {
    label: 'Trouver un chauffagiste QualiGaz',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE + QualiGaz vérifié',
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
    section: 'Chauffage — Entretien chaudière gaz',
    keywords: [
      'entretien chaudiere gaz',
      'contrat entretien chaudiere',
      'prix entretien chaudiere gaz',
      'entretien chaudiere obligatoire',
      'attestation entretien chaudiere',
      'entretien chaudiere annuel',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    {
      name: 'Chaudière condensation',
      url: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    },
    { name: 'Entretien', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Entretien annuel obligatoire des chaudières (Décret 2009-649 modifié)',
    description:
      "Obligation légale d'entretien annuel pour toute chaudière à combustible (gaz, fioul, bois) d'une puissance de 4 à 400 kW, à la charge de l'occupant du logement. Attestation à conserver 2 ans.",
    url: PAGE_URL,
    serviceType: 'Energy Regulation',
    serviceOperator: {
      name: "Direction générale de l'énergie et du climat (DGEC)",
      url: 'https://www.ecologie.gouv.fr',
    },
    audience:
      "Occupants de logement (propriétaire occupant ou locataire) équipés d'une chaudière 4-400 kW",
    sameAs: [
      'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000020722038',
      'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042169571',
      'https://www.service-public.fr/particuliers/vosdroits/F31894',
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
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              {
                label: 'Chaudière condensation',
                href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
              },
              { label: 'Entretien' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Obligation légale — Décret 2009-649 modifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Entretien chaudière gaz 2026 : prix et obligation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L&apos;<strong>entretien annuel</strong> d&apos;une chaudière gaz (4-400 kW) est{' '}
              <strong>obligatoire</strong> en France depuis 2009. Prix 2026 :{' '}
              <strong>100 à 180 € HT</strong> en visite ponctuelle, ou 130-260 € HT/an en contrat.
              Une attestation est remise sous 15 jours et doit être conservée 2 ans (exigence des
              assurances). Voici tout ce qu&apos;il faut savoir : 12 points contrôlés, qui paie en
              location, comment choisir un pro <strong>QualiGaz</strong>, et quand basculer vers une
              PAC.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="obligation">Une obligation légale annuelle</h2>
            <p>
              Le <strong>Décret n° 2009-649 du 9 juin 2009</strong>, modifié par le{' '}
              <strong>Décret n° 2020-912 du 28 juillet 2020</strong>, impose un entretien annuel à
              toute chaudière à combustible d&apos;une puissance comprise entre{' '}
              <strong>4 et 400 kW</strong> (gaz, fioul, bois, charbon ou multi-combustible). Il
              s&apos;applique à toutes les chaudières individuelles installées dans une habitation,
              que vous soyez propriétaire occupant ou locataire.
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Périodicité</strong> : 1 fois par an (12 mois calendaires entre 2 visites).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Personne obligée</strong> : l&apos;<em>occupant</em> du logement (locataire
                par défaut, propriétaire occupant sinon).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Sanction directe</strong> : aucune amende, mais responsabilité civile et
                pénale + refus assurance en cas de sinistre (incendie, intoxication CO).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Attestation</strong> : à conserver <strong>2 ans</strong> minimum, à fournir
                à l&apos;assureur sur demande.
              </li>
            </ul>

            <h2 id="prix">Prix entretien chaudière gaz 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {PRIX_ENTRETIEN.map((p) => (
                <div key={p.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {p.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {p.prix}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Méfiez-vous des contrats &laquo; tout inclus &raquo;
                </p>
                <p className="m-0">
                  Les contrats tout inclus (250-400 € HT/an) commercialisés par les énergéticiens
                  (Engie HomeServices, EDF Soluzio, ENI, Total Énergies) sont rentables uniquement
                  si la chaudière a 10-15 ans et qu&apos;une grosse pièce risque de lâcher (corps de
                  chauffe, vase). Sur une chaudière récente, la formule ponctuelle + assurance
                  habitation classique reste 2-3 fois moins chère.
                </p>
              </div>
            </div>

            <h2 id="points-controle">Les 12 points contrôlés par le pro</h2>
            <ol>
              {POINTS_CONTROLE.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>

            <h2 id="qui-paie">Qui paie l&apos;entretien ?</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUI_PAIE.map((q) => (
                <div key={q.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {q.cas}
                    </h3>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {q.qui}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{q.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="choisir-pro">Choisir un chauffagiste QualiGaz</h2>
            <p>
              Pour la sécurité gaz, exigez la mention <strong>QualiGaz Évolution</strong> (organisme
              habilité par les pouvoirs publics, équivalent du PG/PGN/PGP côté installateurs). Cette
              mention atteste de la formation technique et réglementaire à la manipulation gaz
              domestique. La mention <strong>RGE</strong> (Reconnu Garant de l&apos;Environnement)
              est utile en complément si vous prévoyez ensuite des travaux d&apos;économie
              d&apos;énergie : elle ouvre droit aux CEE et à MaPrimeRénov&apos; pour le geste
              suivant (PAC, isolation, etc.).
            </p>
            <ul>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Vérifier le certificat QualiGaz Évolution sur{' '}
                <a href="https://www.qualigaz.com">qualigaz.com</a> (annuaire public).
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Demander attestation d&apos;assurance décennale et SIRET valide.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Comparer 2-3 devis détaillés (prix net, durée intervention, périmètre des contrôles,
                conditions du contrat éventuel).
              </li>
              <li>
                <Flame className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Privilégier un pro <strong>indépendant local</strong> ou un installateur
                multi-marques plutôt qu&apos;un contrat énergéticien (souvent moins cher et plus
                disponible).
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Vous pensez remplacer votre chaudière gaz ?
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  La PAC air-eau est l&apos;alternative recommandée par l&apos;ADEME en 2026 : aides
                  MPR (jusqu&apos;à 5 000 €) + CEE Coup de pouce (jusqu&apos;à 4 000 €) + factures
                  divisées par 2.
                </p>
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                >
                  Estimer mes aides PAC <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
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
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/chauffage/chaudiere-condensation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Chaudière condensation
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
