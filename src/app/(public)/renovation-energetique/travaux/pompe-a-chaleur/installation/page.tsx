/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/installation
 *
 * @kw-primary    installation pompe a chaleur
 * @kw-volume     3300
 * @kw-kd         1
 * @kw-cpc        1.40
 * @intent        commercial
 * @cluster       reno-energetique-pac-installation
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-06 (Bloc 1 — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 4 PAC long-tail installation
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "installation pompe a chaleur"        → 3 300 vol, KD 1 ⭐⭐⭐⭐⭐ PIVOT
 * - "installation pac"                    → ~600 vol, KD 0
 * - "pose pompe a chaleur"                → ~500 vol, KD 0
 * - "installation pompe a chaleur prix"   → ~400 vol, KD 1
 * - "etape installation pompe a chaleur"  → ~250 vol, KD 0
 * - "installer pompe a chaleur"           → ~200 vol, KD 1
 * - "installation pac air eau"            → ~200 vol, KD 1
 * - "duree installation pompe a chaleur"  → ~150 vol, KD 0
 * - Famille cumulée pivot : ~5 600 vol/mois (KD 0-1 = ULTRA EASY WIN)
 *
 * Easy win : OUI MAJEUR (KD 0-1 sur famille entière, intent commercial pré-devis)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Installation
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur/ = comparatif 3 types PAC
 *   - /air-eau-prix/, /air-air-prix/, /geothermie/ = focus prix par type
 *   - /entretien/ = post-installation récurrent
 *   - /consommation/ = budget kWh/an post-installation
 *   - Cette page = focus INSTALLATION (étapes 8 phases, RGE QualiPAC obligatoire,
 *     contraintes site, durée 2-5j, démarches admin, garantie décennale, choix devis).
 *
 * E-E-A-T YMYL :
 *   - Décret 2020-26 (RGE QualiPAC obligatoire MPR/CEE)
 *   - Règlement F-Gas UE 517/2014 (manipulation fluides frigo)
 *   - NF EN 14511 / 14825 (COP/SCOP)
 *   - Norme NF DTU 65.16 (installation thermique)
 *   - AFPAC, Qualit'EnR (annuaire QualiPAC)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Coins,
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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import PrixComparatif from '@/components/conversion/PrixComparatif'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { getHowToSchema } from '@/lib/seo/jsonld'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/installation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Installation pompe à chaleur 2026 : étapes, durée, RGE QualiPAC'
const DESCRIPTION =
  'Installation PAC 2026 : 8 étapes du bilan thermique à la mise en service, durée 2-5 jours, RGE QualiPAC obligatoire pour aides MPR + CEE.'

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
  'Installation PAC complète = 8 étapes, du bilan thermique à la mise en service. Durée chantier : 2 à 5 jours selon configuration.',
  'RGE QualiPAC obligatoire pour MaPrimeRénov’ + Coup de pouce CEE + TVA 5,5 %. Sans label, aucune aide possible.',
  'Coût installation seule (hors équipement) : 2 500 à 5 000 € selon adaptation hydraulique et électrique.',
  'Démarches : déclaration préalable de travaux mairie (façade visible) + Consuel + attestation manipulation fluides F-Gas.',
  'Garantie décennale obligatoire de l’artisan + garantie biennale équipements + garantie fabricant 5-7 ans.',
  'Erreur fréquente : sous-dimensionnement (PAC trop petite) ou sur-dimensionnement (cycles courts → usure prématurée).',
]

const ETAPES = [
  {
    n: 1,
    title: 'Bilan thermique',
    duree: '1-2 h sur site',
    desc: 'L’artisan calcule les déperditions G de la maison (méthode NF EN 12831). Inputs : surface, orientation, isolation, occupants. Output : puissance kW nécessaire.',
  },
  {
    n: 2,
    title: 'Devis détaillé + signature',
    duree: '7 à 14 j entre devis et signature',
    desc: 'Devis transparent : marque/modèle/COP/SCOP, ligne pose, ligne adaptation hydraulique, ligne électrique, options ECS. Délai de rétractation 14 jours pour les devis hors agence.',
  },
  {
    n: 3,
    title: 'Démarches administratives',
    duree: '2 à 6 semaines',
    desc: 'Déclaration préalable mairie (CERFA 13703) si unité visible depuis voie publique ; règlement copropriété ; vérification PLU (zones ABF, classement IBH). Acte sous seing privé MPR + CEE.',
  },
  {
    n: 4,
    title: 'Préparation chantier',
    duree: '1 j',
    desc: 'Vérification arrivée matériel, protection sols et meubles, dépose ancienne chaudière (fioul : dégazage cuve obligatoire, prestation distincte 800-2 500 €).',
  },
  {
    n: 5,
    title: 'Pose unité extérieure',
    duree: '0,5 à 1 j',
    desc: 'Socle béton ou dalles antivibratoires, distance min. 5 m du voisinage (acoustique), > 2 m sol, accès dégagé. Liaisons frigorifiques cuivre passées en fourreau (max 30 m).',
  },
  {
    n: 6,
    title: 'Pose module hydraulique intérieur',
    duree: '0,5 à 1 j',
    desc: 'Local ventilé non humide, raccordement circuit de chauffage existant, vase d’expansion, soupapes de sécurité, bouclage. Filtrage anti-tartre conseillé.',
  },
  {
    n: 7,
    title: 'Adaptation électrique + tableau',
    duree: '0,5 j',
    desc: 'Disjoncteur dédié 32 A, parfois renforcement abonnement (9 → 12 kVA). Test différentiel obligatoire. Consuel en cas de modification du tableau.',
  },
  {
    n: 8,
    title: 'Mise en service + remise documents',
    duree: '2-3 h',
    desc: 'Charge fluide frigo (R32 ou R290), tests COP réels, paramétrage régulation, formation utilisateur. Remise PV mise en service + attestation F-Gas + contrat entretien proposé.',
  },
]

const RGE_REQUIREMENTS = [
  {
    label: 'Label RGE QualiPAC',
    detail:
      'Délivré par Qualit’EnR. Audit annuel + 2 chantiers contrôlés sur 4 ans. Sans QualiPAC : MPR + CEE refusées.',
  },
  {
    label: 'Attestation manipulation fluides F-Gas',
    detail:
      'Décret 2014-1402 + Règlement UE 517/2014. Catégorie I obligatoire pour PAC > 3 kg fluide frigo.',
  },
  {
    label: 'Garantie décennale',
    detail:
      'Article 1792 Code civil. Couvre 10 ans dommages structurels (fuite frigorifique, dommage hydraulique).',
  },
  {
    label: 'Assurance responsabilité civile pro',
    detail:
      'Couverture dommages matériels en cours de chantier. Vérifier attestation à jour avant signature.',
  },
  {
    label: 'Affiliation Qualibat (option)',
    detail:
      'Indice 5111 chauffage + 5912 PAC. Renforce l’E-E-A-T sur les marchés publics et copropriétés.',
  },
]

const ERREURS = [
  {
    title: 'Sous-dimensionnement de la PAC',
    impact: 'Confort -30 %',
    desc: 'PAC trop petite (souvent pour faire baisser le prix). Résultat : appoints électriques fréquents, factures gonflées, COP réel < 2,5. Toujours demander le bilan thermique chiffré.',
  },
  {
    title: 'Sur-dimensionnement (PAC trop grosse)',
    impact: 'Durée vie -40 %',
    desc: 'PAC trop puissante = cycles courts marche/arrêt, usure compresseur, COP médiocre. Exiger une marge max +15 % vs déperditions calculées.',
  },
  {
    title: 'Oubli ballon tampon',
    impact: 'Cycles courts',
    desc: 'Sur radiateurs basse-T° ou installation hybride, le ballon tampon (50-100 L) protège le compresseur. Absent dans 30 % des devis low-cost.',
  },
  {
    title: 'Liaisons frigorifiques mal isolées',
    impact: '-15 % rendement',
    desc: 'Mousse Armaflex 19 mm minimum sur tous les passages extérieurs. Vérifier visuellement après pose. Sinon condensation + perte rendement.',
  },
  {
    title: 'Pas de Consuel demandé',
    impact: 'Garantie tombée',
    desc: 'Modification tableau électrique sans Consuel = installation non conforme = responsabilité de l’artisan engagée. À exiger sur devis.',
  },
]

const DUREE_TYPES = [
  {
    config: 'PAC air-eau remplacement chaudière gaz',
    duree: '2 à 3 jours',
    note: 'Le plus simple : circuit hydraulique existant compatible, pas de plancher chauffant à créer.',
  },
  {
    config: 'PAC air-eau remplacement chaudière fioul',
    duree: '3 à 5 jours',
    note: 'Ajout dégazage + démantèlement cuve fioul (1 j supplémentaire) + parfois refonte hydraulique.',
  },
  {
    config: 'PAC air-air (climatisation réversible)',
    duree: '1 à 2 jours',
    note: 'Pose split + liaisons frigo. Pas de raccordement hydraulique, démarches simples.',
  },
  {
    config: 'PAC géothermique sondes verticales',
    duree: '5 à 10 jours',
    note: 'Forage 80-120 m (1-3 j) + pose hydraulique (2-3 j). Étude géologique obligatoire.',
  },
  {
    config: 'PAC + plancher chauffant neuf',
    duree: '7 à 12 jours',
    note: 'Pose plancher chauffant + chape + séchage 21 j avant mise en service PAC.',
  },
]

const faqs = [
  {
    question: 'Combien de temps dure l’installation d’une pompe à chaleur ?',
    answer:
      'Le chantier dure 2 à 5 jours pour une PAC air-eau standard (remplacement chaudière). Comptez 5 à 10 jours pour une PAC géothermique (forage). Pour PAC air-air (climatisation réversible), 1 à 2 jours suffisent. Au total, comptez 6 à 10 semaines entre signature du devis et mise en service finale (démarches + livraison matériel + chantier).',
  },
  {
    question: 'Est-il obligatoire de prendre un artisan RGE QualiPAC ?',
    answer:
      'Oui pour bénéficier des aides 2026 : MaPrimeRénov’, Coup de pouce CEE et TVA 5,5 % sont conditionnés au label RGE QualiPAC (décret 2020-26). Sans QualiPAC : aucune aide, TVA 20 %, et risque garantie décennale incomplète. Vérifier le label sur qualit-enr.org (annuaire officiel) avant signature.',
  },
  {
    question: 'Quelles démarches administratives pour installer une PAC ?',
    answer:
      'Trois démarches : (1) déclaration préalable de travaux en mairie (CERFA 13703) si l’unité extérieure est visible depuis la voie publique ou si maison classée ABF ; (2) règlement copropriété + AG si copropriété ; (3) Consuel si modification du tableau électrique. L’artisan RGE peut s’en charger contre 200-500 € de prestation administrative.',
  },
  {
    question: 'Combien coûte la pose seule d’une PAC (hors équipement) ?',
    answer:
      'Entre 2 500 et 5 000 € TTC selon la configuration : 2 500-3 500 € pour une PAC air-air simple, 3 500-5 000 € pour une PAC air-eau avec adaptation hydraulique et électrique. Le coût total (équipement + pose) varie de 9 500 € à 22 000 € selon puissance. Voir notre détail prix sur la page dédiée /pac/air-eau-prix.',
  },
  {
    question: 'Peut-on installer une pompe à chaleur soi-même ?',
    answer:
      'Non, pas légalement pour une PAC dimensionnée. Trois raisons : (1) la manipulation des fluides frigorigènes (R32, R290) est réglementée par le décret 2014-1402 et impose une attestation catégorie I ; (2) le label RGE QualiPAC est obligatoire pour les aides ; (3) la garantie fabricant est conditionnée à l’installation par un professionnel certifié. Seules les PAC air-air mono-split prêtes à poser (< 2 kg fluide) peuvent être posées par un particulier formé.',
  },
  {
    question: 'Quelles précautions pour le voisinage (acoustique) ?',
    answer:
      'L’unité extérieure produit 35-55 dB selon le modèle. Réglementation : limite 5 dB la nuit (22h-7h) et 7 dB le jour à 2 m du voisinage le plus proche (article R1336-5 Code santé publique). Conseils : (1) choisir un modèle à 35-39 dB (Mitsubishi, Daikin haut de gamme) ; (2) installer sur dalle antivibratoire ; (3) éviter les angles réfléchissants ; (4) écran végétal possible. En copropriété, accord AG obligatoire.',
  },
  {
    question: 'Quelle garantie après installation d’une PAC ?',
    answer:
      'Trois garanties cumulées : (1) garantie fabricant 5-7 ans sur l’équipement (Mitsubishi étend à 7 ans après enregistrement) ; (2) garantie biennale 2 ans (article 1792-3 CC) sur les pièces ; (3) garantie décennale 10 ans (article 1792 CC) sur l’ouvrage. L’entretien annuel obligatoire (décret 2020-912) doit être respecté pour conserver la garantie fabricant.',
  },
  {
    question: 'Comment choisir un installateur PAC fiable ?',
    answer:
      'Cinq critères : (1) RGE QualiPAC vérifié sur qualit-enr.org ; (2) Attestation F-Gas catégorie I à jour ; (3) Au moins 3 chantiers de référence visités ou photos ; (4) Devis détaillé ligne par ligne (refuser tout « forfait global ») ; (5) Bilan thermique chiffré inclus avant chiffrage. Comparer 3 devis : écart 15-25 % typique. Privilégier les artisans locaux avec SAV en moins de 48 h.',
  },
]

const sources = [
  {
    label: 'Qualit’EnR — Annuaire QualiPAC officiel',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Légifrance — Décret 2014-1402 (manipulation fluides F-Gas)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000029817212',
  },
  {
    label: 'Légifrance — Décret 2020-26 (RGE obligatoire MPR/CEE)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000041399786',
  },
  {
    label: 'Légifrance — Décret 2020-912 (entretien PAC obligatoire)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042147554',
  },
  {
    label: 'AFPAC — Guide installation PAC',
    url: 'https://www.afpac.org',
  },
  {
    label: 'France Rénov’ — Aides PAC 2026',
    url: 'https://france-renov.gouv.fr/aides',
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
    label: 'PAC air-air prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
  },
  {
    label: 'PAC géothermique',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/geothermie',
  },
  {
    label: 'Entretien PAC (obligatoire)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
  },
  {
    label: 'Trouver un chauffagiste RGE QualiPAC',
    href: '/rge/chauffagiste',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('chauffagiste', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — PAC — Installation',
    keywords: [
      'installation pompe à chaleur',
      'installation PAC',
      'pose PAC',
      'étapes installation PAC',
      'durée installation PAC',
      'RGE QualiPAC',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Installation', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Installation PAC : exigences RGE QualiPAC + aides 2026',
    description:
      'Installation pompe à chaleur conforme aux exigences RGE QualiPAC + décret F-Gas + aides MaPrimeRénov’ + Coup de pouce CEE + TVA 5,5 %.',
    url: PAGE_URL,
    serviceType: 'Subvention publique installation pompe à chaleur',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
  })
  const howToSchema = getHowToSchema(
    ETAPES.map((step) => ({ name: step.title, text: step.desc })),
    {
      name: 'Étapes d’installation d’une pompe à chaleur',
      description:
        'Processus complet d’installation d’une PAC en 8 étapes, du bilan thermique à la mise en service.',
      totalTime: 'P5D',
    }
  )
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema, howToSchema].filter(
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
              { label: 'Installation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" aria-hidden />
              PAC &middot; Installation 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Installation d’une pompe à chaleur en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Installer une pompe à chaleur est un chantier <strong>de 2 à 5 jours</strong> découpé
              en 8 étapes officielles, du bilan thermique à la mise en service. Le label{' '}
              <strong>RGE QualiPAC</strong> est obligatoire pour activer les aides MaPrimeRénov’ +
              Coup de pouce CEE + TVA 5,5 %. Voici les étapes, la durée, les démarches admin et les
              5 erreurs qui plombent un chantier.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 8 étapes d’une installation PAC complète</h2>
            <p>
              L’installation d’une PAC suit un processus normé. Tout artisan RGE QualiPAC doit
              respecter ces étapes, traçables sur le PV de mise en service.
            </p>
            <div className="not-prose grid gap-3 my-6">
              {ETAPES.map((step) => (
                <div
                  key={step.n}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="bg-primary-100 text-primary-800 font-heading text-lg font-bold w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                    {step.n}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-base font-semibold text-sand-900 m-0">
                      {step.title}
                      <span className="ml-2 text-xs font-normal text-sand-500">
                        <Clock className="inline w-3 h-3 mr-0.5" aria-hidden />
                        {step.duree}
                      </span>
                    </p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Durée installation selon configuration</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Durée</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {DUREE_TYPES.map((row) => (
                    <tr key={row.config} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.config}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.duree}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Hors délais administratifs (3-6 sem.) et délais livraison équipement (2-4 sem.).
                Ajouter 21 j de séchage chape pour plancher chauffant neuf.
              </p>
            </div>

            <h2>Exigences RGE QualiPAC obligatoires</h2>
            <p>
              Le label <strong>RGE QualiPAC</strong> est délivré par Qualit’EnR. Sans ce label,
              aucune aide 2026 n’est mobilisable (MPR, CEE, TVA 5,5 %).
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6">
              <ul className="divide-y divide-sand-100">
                {RGE_REQUIREMENTS.map((row) => (
                  <li key={row.label} className="p-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{row.label}</p>
                      <p className="text-sm text-sand-700 m-0 mt-1">{row.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <h2>5 erreurs qui plombent un chantier PAC</h2>
            <div className="not-prose grid gap-3 my-6">
              {ERREURS.map((piege) => (
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
                    <p className="text-sm text-sand-700 m-0 mt-1">{piege.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Coût installation seule (hors équipement)</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC air-air mono-split :</strong> 800 - 1 500 € TTC pose + raccordement
                frigorifique
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC air-air multi-split (3-5 unités) :</strong> 2 500 - 4 000 € TTC
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC air-eau remplacement chaudière gaz :</strong> 2 500 - 3 500 € TTC
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC air-eau remplacement chaudière fioul :</strong> 3 500 - 5 500 € TTC
                (inclut dégazage cuve)
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC géothermique sondes verticales :</strong> 8 000 - 15 000 € TTC (forage
                inclus)
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis installation PAC en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans RGE QualiPAC vérifiés vous répondent sous 48h. Bilan thermique inclus
                    + simulation MaPrimeRénov’ et CEE. Comparaison transparente, sans engagement.
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

            <h2>Vérifier la conformité après installation</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PV de mise en service signé</strong> par l’artisan, comportant date,
                paramétrage, COP réel mesuré
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Attestation F-Gas catégorie I</strong> (manipulation fluides frigorigènes)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Documents fabricants</strong> (notice, certificats CE, garantie)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Facture détaillée</strong> avec mention RGE QualiPAC et TVA 5,5 %
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Contrat d’entretien annuel</strong> (obligatoire décret 2020-912 sous 2 ans
                après pose)
              </li>
              <li>
                <ClipboardCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Demande aides MPR + CEE</strong> dans les 9 mois suivant la facture
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="Prix posée 2026 : 5 marques RGE QualiPAC installées"
            caption="Tarifs pose comprise (équipement + main d'œuvre + hydraulique), hors aides. Source : devis artisans RGE QualiPAC 2026."
            withSchema
            rows={[
              {
                brand: 'Daikin',
                model: 'Altherma 3 H HT',
                priceRange: '12 000 – 18 000 €',
                cop: 4.3,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Pose 2-3 j, RGE QualiPAC obligatoire',
                highlight: true,
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan PUZ-WM',
                priceRange: '11 500 – 17 500 €',
                cop: 4.2,
                warranty: '5 ans (7 ans auto)',
                rating: 4.5,
                notes: 'Pose 2-3 j, garantie 7 ans automatique',
              },
              {
                brand: 'Atlantic',
                model: 'Alfea Excellia',
                priceRange: '10 000 – 15 000 €',
                cop: 4.0,
                warranty: '2 – 5 ans',
                rating: 4.0,
                notes: 'Fabrication France, réseau RGE étendu',
              },
              {
                brand: 'Daikin',
                model: 'Altherma H Hybrid',
                priceRange: '14 000 – 21 000 €',
                cop: 4.5,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Pose 3-5 j (raccord gaz), seul hybride MPR',
              },
              {
                brand: 'Hitachi',
                model: 'Yutaki S',
                priceRange: '11 000 – 16 500 €',
                cop: 4.1,
                warranty: '5 ans',
                rating: 4.0,
                notes: 'Pose 2 j (bi-bloc compact)',
              },
            ]}
          />
          <SimulateurAideBox
            serviceKey="pompe-a-chaleur"
            estimatedSaving={5000}
            subtitle="MaPrimeRénov' jusqu'à 5 000 € + CEE BAR-TH-171 ~4 000 €"
          />
          <LocalProviderShowcase
            providers={providers}
            serviceName="chauffagiste RGE QualiPAC"
            cityName=""
            max={3}
          />
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

      <FinalCtaSection
        heading="Demandez vos devis pose pompe à chaleur"
        description="Recevez 3 devis d'artisans RGE QualiPAC en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=pompe-a-chaleur',
          intent: 'final-devis-installation',
        }}
        secondaryCta={{
          label: 'Voir les chauffagistes RGE',
          href: '/rge/chauffagiste',
        }}
        accent="blue"
        trustLine="Artisans RGE QualiPAC • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
