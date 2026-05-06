/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/depannage
 *
 * @kw-primary    depannage pompe a chaleur
 * @kw-volume     450
 * @kw-kd         0
 * @kw-cpc        1.20
 * @intent        commercial
 * @cluster       reno-energetique-pac-depannage
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-06 (Bloc 1 + estimation longue traîne)
 * @backlog-item  Sprint 4 PAC long-tail depannage
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "depannage pompe a chaleur"        → 450 vol, KD 0 ⭐⭐⭐⭐⭐ MEGA EASY
 * - "panne pompe a chaleur"            → ~600 vol estimé, KD 1
 * - "depannage pac"                    → ~150 vol, KD 0
 * - "code erreur pompe a chaleur"      → ~250 vol, KD 1
 * - "pompe a chaleur ne demarre plus"  → ~150 vol, KD 0
 * - "reparation pompe a chaleur"       → ~200 vol, KD 1
 * - Famille cumulée pivot : ~1 800 vol/mois (KD 0-1)
 *
 * Easy win : OUI MAJEUR (KD 0-1 sur famille, intent urgence commercial fort
 *            CPC 1,20 €)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Dépannage
 *
 * Anti-cannibalisation :
 *   - /entretien/ = entretien préventif annuel (décret 2020-912)
 *   - /fonctionnement/ = théorie cycle thermo
 *   - Cette page = focus DÉPANNAGE / PANNES (10 codes erreur courants, diagnostic
 *     terrain, prix intervention 80-300 €, urgence 24/7, garanties applicables).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Clock,
  Phone,
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
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/depannage'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Dépannage PAC 2026 : 10 pannes courantes, codes erreur, prix'
const DESCRIPTION =
  'Dépannage pompe à chaleur 2026 : 10 pannes courantes (code erreur, fuite frigo, dégivrage bloqué), prix intervention 80-300€, garantie panne. Urgence 24/7.'

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
  'Une PAC moderne tombe peu en panne (~1 panne tous les 5-7 ans en moyenne) si l’entretien annuel est respecté.',
  '10 pannes courantes : code erreur écran, dégivrage bloqué, fuite fluide frigo, sonde T° HS, vase d’expansion vide, etc.',
  'Prix intervention type : 80-150 € déplacement + 80-150 €/h main d’œuvre + pièces (sonde 50 €, compresseur 1 800-2 500 €).',
  'Avant l’intervention : noter le code erreur affiché + symptômes (bruit, fuite, T° anormale) + heure de la panne.',
  'Garanties applicables : fabricant 5-7 ans (compresseur), biennale 2 ans (pièces), décennale 10 ans (gros œuvre).',
  'Urgence chauffage hiver (T° intérieure < 14 °C) : faire intervenir un artisan RGE QualiPAC sous 24-48h.',
]

const PANNES = [
  {
    title: 'Code erreur affiché à l’écran',
    desc: 'Premier réflexe : noter le code (E01, F22, U4, etc.) puis consulter le manuel utilisateur. Beaucoup de codes signalent un problème non grave (sonde, capteur).',
    prix: '80-150 € (diagnostic + reset)',
  },
  {
    title: 'Pas de chauffage / pas d’ECS',
    desc: 'Vérifier alimentation électrique, pression circuit (1,5-2 bars), thermostat ON, mode hiver actif. Souvent simple manipulation utilisateur.',
    prix: '80-200 €',
  },
  {
    title: 'Cycle de dégivrage bloqué',
    desc: 'PAC qui souffle de l’air froid en continu = vanne 4 voies grippée OU sonde T° évaporateur HS. Diagnostic obligatoire.',
    prix: '150-350 €',
  },
  {
    title: 'Fuite de fluide frigorigène',
    desc: 'Performance dégradée + cycles courts. Détection avec un détecteur de fuite. Recharge fluide R32 = 60-100 €/kg + main d’œuvre. Réparation soudure 100-300 €.',
    prix: '250-700 €',
  },
  {
    title: 'Compresseur HS',
    desc: 'PAC qui ne chauffe plus du tout, bruit anormal au démarrage. Cause : usure (durée vie 12-15 ans) ou pic électrique. Remplacement compresseur seul.',
    prix: '2 500-3 500 €',
  },
  {
    title: 'Sonde de température défaillante',
    desc: 'Code erreur lié à T° anormale, T° intérieure mal régulée. Sonde extérieure ou intérieure à remplacer.',
    prix: '120-250 €',
  },
  {
    title: 'Vase d’expansion à plat',
    desc: 'Pression circuit qui chute sous 1 bar. Vérification + rechargement air vase ou remplacement (60 €).',
    prix: '120-200 €',
  },
  {
    title: 'Pompe de circulation HS',
    desc: 'Eau qui ne circule plus dans le circuit chauffage. Bruit anormal puis arrêt. Remplacement pompe : 250-400 € pièce + pose.',
    prix: '350-550 €',
  },
  {
    title: 'Bruit anormal unité extérieure',
    desc: 'Vibrations, sifflements, claquements : socle béton à reprendre OU ventilateur usé OU palier compresseur. Diagnostic auditif sur place.',
    prix: '150-500 €',
  },
  {
    title: 'Tableau électrique disjoncte',
    desc: 'PAC qui fait sauter le différentiel : court-circuit dans une bobine OU défaut isolation câble. Cause électrique critique. À traiter en urgence.',
    prix: '200-450 €',
  },
]

const faqs = [
  {
    question: 'Combien coûte un dépannage de pompe à chaleur en 2026 ?',
    answer:
      'Prix intervention type : 80-150 € de déplacement + 80-150 € de main d’œuvre par heure + pièces. Diagnostic seul : 80-200 €. Réparation simple (sonde, vase, filtre) : 120-350 €. Réparation lourde (vanne 4 voies, fluide frigo) : 300-700 €. Remplacement compresseur : 2 500-3 500 € (pièce 1 800-2 500 € + 700-1 000 € main d’œuvre). Si la PAC est sous garantie fabricant (5-7 ans) ou décennale (10 ans), une partie peut être prise en charge.',
  },
  {
    question: 'Quels sont les codes erreur les plus courants ?',
    answer:
      'Daikin : E03 (problème basse pression), E04 (haute pression), U4/UF (communication), AH (filtre encrassé), A1 (anomalie carte). Mitsubishi : P0 (sonde retour eau), P1-P9 (sondes T°), P10/P11 (haute pression), U7/U8 (communication). Atlantic : 102/103 (compresseur), 109 (eau circuit), 200 (sonde extérieure). Toujours consulter le manuel utilisateur de votre modèle exact. Beaucoup de codes signalent un défaut non grave (filtre, sonde, communication) résolvable rapidement.',
  },
  {
    question: 'Ma pompe à chaleur ne chauffe plus, que faire ?',
    answer:
      'Vérifications avant d’appeler un artisan : (1) thermostat allumé en mode chauffage ; (2) interrupteur PAC ON sur le tableau électrique ; (3) pression circuit hydraulique entre 1,5 et 2 bars (manomètre sur module intérieur) ; (4) bloc condensats non gelé ; (5) pas de code erreur sur l’écran. Si tout est normal et que ça ne chauffe pas → fuite fluide frigo, sonde HS ou compresseur. Appeler un artisan RGE QualiPAC sous 24-48h.',
  },
  {
    question: 'Combien de temps dure une intervention de dépannage ?',
    answer:
      'Diagnostic seul : 30-60 min sur place. Réparation simple (changement sonde, filtre, vase) : 1-2 h. Réparation moyenne (fuite frigo, vanne 4 voies) : 2-4 h. Réparation lourde (compresseur, échangeur) : 4-8 h ou retour atelier. Délais d’intervention typiques : 24-48 h en hiver (urgence chauffage), 3-7 j hors saison. Privilégier les artisans avec hotline 24/7.',
  },
  {
    question: 'Les pannes PAC sont-elles couvertes par les garanties ?',
    answer:
      'Oui, selon la nature et l’âge de la PAC. Garantie fabricant 5-7 ans : couvre les pièces principales (compresseur, échangeur, carte électronique). Garantie biennale 2 ans (article 1792-3 CC) : couvre les pièces secondaires. Garantie décennale 10 ans (article 1792 CC) : couvre les dommages structurels (fuite frigorifique, dommage hydraulique). Conditions : PAC entretenue annuellement (décret 2020-912) + carnet d’entretien à jour. Sans entretien attesté, garanties tombent.',
  },
  {
    question: 'Que faire en cas d’urgence chauffage en plein hiver ?',
    answer:
      'Si la T° intérieure tombe sous 14 °C en hiver : (1) APPELER un artisan RGE QualiPAC sous 24h (hotline 24/7 si dispo) ; (2) chauffage d’appoint électrique provisoire (radiateur + clim air-air si disponible) ; (3) noter le code erreur + symptômes pour gagner du temps au diagnostic ; (4) couper le circuit hydraulique si fuite visible ; (5) vérifier que la PAC est bien sous tension électrique. Garanties fabricant souvent prioritaires sur urgences hiver.',
  },
  {
    question: 'Comment éviter les pannes PAC ?',
    answer:
      'Cinq actions préventives : (1) Entretien ANNUEL obligatoire (décret 2020-912) par artisan RGE — détecte 80 % des pannes naissantes ; (2) Nettoyer filtres intérieurs tous les 3 mois (poussière) ; (3) Vérifier pression circuit chaque mois (1,5-2 bars) ; (4) Dépoussiérer unité extérieure 2×/an (printemps + automne) ; (5) Souscrire un contrat d’entretien (150-300 €/an inclut entretien + dépannage prioritaire + remplacement gratuit pièces majeures sur certains contrats premium). Une PAC bien entretenue tombe peu en panne (~1 panne tous les 5-7 ans).',
  },
  {
    question: 'Quel artisan appeler pour dépanner ma PAC ?',
    answer:
      'Privilégier un artisan RGE QualiPAC formé spécifiquement à votre marque (Daikin Academy, Mitsubishi Electric Academy). Vérifier : (1) Attestation F-Gas catégorie I à jour ; (2) Hotline 24/7 disponible ; (3) Avis vérifiés > 4/5 (Trustpilot, Avis Vérifiés) ; (4) Rayon d’action local (réactivité). Notre simulateur ServicesArtisans propose 3 artisans RGE QualiPAC locaux sous 24-48h, avec contrats d’entretien préventif + dépannage curatif.',
  },
]

const sources = [
  {
    label: 'Légifrance — Décret 2020-912 entretien PAC obligatoire',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042147554',
  },
  {
    label: 'Légifrance — Décret 2014-1402 manipulation fluides F-Gas',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000029817212',
  },
  {
    label: 'AFPAC — Pannes courantes PAC',
    url: 'https://www.afpac.org',
  },
  {
    label: 'Qualit’EnR — Annuaire QualiPAC',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Code Civil — Articles 1792 (décennale) + 1792-3 (biennale)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006442069',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Entretien PAC : obligation, prix, checklist',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
  },
  {
    label: 'Fonctionnement PAC : cycle thermo, COP, fluides',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/fonctionnement',
  },
  {
    label: 'Coût total PAC sur 15 ans',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/cout-total',
  },
  {
    label: 'Trouver un chauffagiste RGE QualiPAC',
    href: '/rge/chauffagiste',
  },
  {
    label: 'Demander un dépannage local',
    href: '/devis',
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
    section: 'Travaux — PAC — Dépannage',
    keywords: [
      'dépannage pompe à chaleur',
      'panne PAC',
      'code erreur PAC',
      'réparation pompe à chaleur',
      'PAC ne fonctionne plus',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Dépannage', url: PAGE_PATH },
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
              { label: 'Dépannage' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" aria-hidden />
              PAC &middot; Dépannage &amp; pannes
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Dépannage d’une pompe à chaleur en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une PAC moderne tombe peu en panne (~1 tous les 5-7 ans avec entretien annuel), mais
              les pannes hivernales nécessitent une intervention sous 24-48h. Voici les{' '}
              <strong>10 pannes courantes</strong>, les codes erreur fréquents par marque, le prix
              d’intervention 80-300 € et les garanties applicables (fabricant + décennale).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 10 pannes courantes d’une PAC</h2>
            <div className="not-prose grid gap-3 my-6">
              {PANNES.map((panne, idx) => (
                <div
                  key={panne.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="bg-primary-100 text-primary-800 font-heading text-base font-bold w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{panne.title}</p>
                      <span className="text-xs font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded whitespace-nowrap">
                        {panne.prix}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{panne.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Avant l’intervention : 4 vérifications</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Code erreur affiché</strong> à l’écran (E01, F22, P10, etc.) — noter le code
                exact
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Symptômes</strong> précis : bruit anormal, fuite visible, T° intérieure,
                heure de la panne
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Pression circuit</strong> entre 1,5 et 2 bars (manomètre module intérieur)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>État garanties</strong> : âge PAC + carnet d’entretien à jour ?
              </li>
            </ul>

            <h2>Garanties applicables aux pannes</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6">
              <ul className="divide-y divide-sand-100">
                <li className="p-4">
                  <p className="font-semibold text-sand-900 m-0">
                    Garantie fabricant (5 ans, parfois 7 sur compresseur)
                  </p>
                  <p className="text-sm text-sand-700 m-0 mt-1">
                    Couvre pièces principales : compresseur, échangeur, carte électronique. Daikin
                    et Mitsubishi étendent automatiquement à 7 ans le compresseur.
                  </p>
                </li>
                <li className="p-4">
                  <p className="font-semibold text-sand-900 m-0">
                    Garantie biennale 2 ans (article 1792-3 CC)
                  </p>
                  <p className="text-sm text-sand-700 m-0 mt-1">
                    Couvre les pièces secondaires (sondes, filtres, vase d’expansion, pompe).
                  </p>
                </li>
                <li className="p-4">
                  <p className="font-semibold text-sand-900 m-0">
                    Garantie décennale 10 ans (article 1792 CC)
                  </p>
                  <p className="text-sm text-sand-700 m-0 mt-1">
                    Couvre dommages structurels : fuite frigorifique, dommage hydraulique. Article
                    1792 du Code civil. Obligatoire pour l’artisan installateur.
                  </p>
                </li>
                <li className="p-4 bg-amber-50 border-t border-amber-200">
                  <p className="font-semibold text-amber-900 m-0">
                    <AlertTriangle className="inline w-4 h-4 mr-1" aria-hidden />
                    Condition critique : entretien annuel
                  </p>
                  <p className="text-sm text-amber-900 m-0 mt-1">
                    Sans carnet d’entretien à jour (décret 2020-912), TOUTES les garanties fabricant
                    tombent. L’entretien (150-300 €/an) est obligatoire et conditionne le droit aux
                    réparations sous garantie.
                  </p>
                </li>
              </ul>
            </div>

            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Urgence chauffage hiver : T° intérieure &lt; 14 °C
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    Faire intervenir un artisan RGE QualiPAC sous 24-48h. En attendant : chauffage
                    d’appoint électrique (radiateur ou clim réversible). Si fuite visible :{' '}
                    <strong>couper le circuit hydraulique</strong> + le disjoncteur dédié PAC. Ne
                    pas tenter de réparation soi-même (fluides frigorigènes = certifié F-Gas).
                  </p>
                </div>
              </div>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demander un dépannage local sous 24h
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans RGE QualiPAC locaux interviennent sous 24-48h. Diagnostic + devis
                    transparent + intervention. Hotline 24/7 sur certains artisans premium.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander dépannage <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/chauffagiste"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      <Clock className="w-4 h-4" aria-hidden />
                      Annuaire RGE QualiPAC
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
              href="/renovation-energetique/travaux/pompe-a-chaleur/entretien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Entretien PAC <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
