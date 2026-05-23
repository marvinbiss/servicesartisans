/**
 * /renovation-energetique/travaux/vmc — hub head term VMC (cluster Pilier 2).
 *
 * @kw-primary    vmc
 * @kw-volume     48000
 * @kw-kd         7
 * @kw-cpc        2.10
 * @intent        info
 * @cluster       reno-energetique-vmc-hub
 * @ahrefs-source bloc1
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster GOLDMINE KD avg 0.7)
 * @backlog-item  Sprint1-20-80-vmc-recibler-head-term
 *
 * Re-ciblage 2026-05-06 : hub passe de "vmc double flux" (18 500 vol) au head term
 * "vmc" (48 000 vol KD 7) pour kill cannibalisation avec /vmc-double-flux/ (focus
 * "vmc double flux" 13 374 vol). Hub = panorama 4 types + arbre décision + prix +
 * aides ; sub-pages = focus deep par type.
 *
 * KW cibles validés Bloc 1 v3 (country=fr) :
 * - "vmc"                        → 48 000 vol, KD 7 ⭐⭐⭐⭐⭐ HEAD TERM PIVOT
 * - "vmc simple flux"            → 15 000 vol, KD 2 (sub /simple-flux/)
 * - "vmc hygroréglable"          → 14 000 vol, KD 1 (sub /hygroreglable/)
 * - "vmc double flux"            → 13 374 vol, KD 2 (page sœur /vmc-double-flux/)
 * - "vmc salle de bain"          →  9 800 vol, KD 0 (sub /salle-de-bain/)
 * - "vmc simple flux hygroréglable" → 4 400 vol, KD 1
 * - "entretien vmc"              →  2 400 vol, KD 0 (sub /entretien/)
 * - "vmc installation"           →  1 800 vol, KD 0 (sub /installation/)
 * - "vmc prix"                   →  1 600 vol, KD 0 (couvert par hub)
 * - Cluster cumulé : 215 KW, vol 127 800/mo, KD moyen 0.7 (GOLDMINE)
 *
 * Easy win : OUI MEGA — pas de leader fort sur cluster KD 0.7.
 * Concurrence head : France-Renov #9, Effy #11+. Atout SA : artisans RGE
 * Qualibat 8721 + simulateur aides + comparatif neutre + 4 marques détaillées.
 *
 * Anti-cannibalisation :
 *   - Hub /vmc = panorama tous types + arbre décision + comparatif (ce fichier)
 *   - /vmc/simple-flux = focus simple flux autoréglable + hygroréglable A
 *   - /vmc/hygroreglable = focus hygroréglable A vs B
 *   - /vmc-double-flux (top-level) = focus double flux + prix + récup chaleur
 *   - /vmc/salle-de-bain = pièce humide (NF C 15-100 vol 0/1/2)
 *   - /vmc/entretien = obligation contrat + tarif
 *   - /vmc/installation = process pose + raccordement
 *
 * Marques principales couvertes : Aldes, Atlantic, Helios, Unelvent,
 * Zehnder (top 5 marché VMC France).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Calculator } from 'lucide-react'

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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'VMC 2026 : types, prix, installation et aides (guide complet)'
const DESCRIPTION =
  'VMC 2026 : 4 types comparés (autoréglable, hygro A/B, double flux), prix posés 500-6 500 €, MaPrimeRénov’ jusqu’à 2 500 €, économie 5-25 % chauffage.'

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
  'VMC = Ventilation Mécanique Contrôlée. Obligatoire dans tout logement depuis 1982 (arrêté 24/03/1982).',
  '4 grandes familles : autoréglable (basique), hygroréglable A/B (économe), double flux (récup chaleur).',
  'Prix posé 2026 : 500-1 200 € (autoréglable), 900-2 500 € (hygro), 4 000-6 500 € (double flux).',
  'MaPrimeRénov’ Bleu : jusqu’à 2 500 € (double flux uniquement). CEE Coup de pouce variable.',
  'Économie chauffage : 5-10 % (hygro vs autoréglable), 15-25 % (double flux vs hygro).',
  'Indispensable après isolation lourde (sinon condensation + moisissures).',
]

const TYPES = [
  {
    type: 'VMC autoréglable',
    prix: '500-1 200 € posé',
    aide: 'Aucune (hors CEE marginal)',
    perf: 'Débit constant',
    detail:
      'Débit fixe quelles que soient l’humidité, la fréquentation. Standard ancien, à éviter en rénovation. Conso élec ~30-50 kWh/an.',
    href: '#types-vmc',
  },
  {
    type: 'VMC simple flux hygroréglable',
    prix: '900-2 500 € posé',
    aide: 'CEE 100-300 €',
    perf: 'Débit variable selon humidité',
    detail:
      'Sondes hygrométriques modulent le débit. Type A (bouches hygro) ou B (entrées + bouches hygro). Économie 5-10 % vs autoréglable. **Choix #1 en rénovation classique.**',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
  },
  {
    type: 'VMC simple flux autoréglable basse conso',
    prix: '700-1 800 € posé',
    aide: 'CEE 50-200 €',
    perf: 'Débit fixe + moteur basse conso',
    detail:
      'Autoréglable avec moteur EC haute efficacité (vs AC standard). Conso élec divisée par 4. Bonne option budget serré.',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
  },
  {
    type: 'VMC double flux',
    prix: '4 000-6 500 € posé',
    aide: 'MPR 2 500 € + CEE 500-1 200 €',
    perf: 'Récup chaleur 70-90 %',
    detail:
      'Échangeur thermique récupère la chaleur de l’air sortant. Indispensable après isolation lourde. **Top performance, prix premium.**',
    href: '/renovation-energetique/travaux/vmc-double-flux',
  },
]

const ARBRE_DECISION = [
  {
    profil: 'Logement non isolé, budget serré',
    recommandation: 'VMC simple flux hygroréglable type B',
    justification:
      'Pas la peine d’investir double flux sans isolation préalable. Hygro B suffit pour gérer humidité + petite éco chauffage.',
  },
  {
    profil: 'Logement post-isolation des combles + murs',
    recommandation: 'VMC double flux haute performance',
    justification:
      'L’étanchéité air requiert renouvellement mécanique optimal. Récup chaleur 70-90 % rentabilise sur 5-7 ans.',
  },
  {
    profil: 'Maison neuve / RT2012 / RE2020',
    recommandation: 'VMC double flux thermodynamique',
    justification:
      'Performance maximale exigée par la réglementation. Pré-chauffe en hiver + rafraîchissement été via PAC intégrée.',
  },
  {
    profil: 'Copropriété sans accès gaines centrales',
    recommandation: 'VMC double flux décentralisée (pièce par pièce)',
    justification: 'Modules muraux par pièce, sans modifier la structure. Coût 300-600 €/pièce.',
  },
  {
    profil: 'Petit appartement < 50 m²',
    recommandation: 'VMC simple flux hygro type A',
    justification:
      'Solution économique et suffisante. Double flux disproportionné sur petites surfaces.',
  },
]

const ECO_PAR_TYPE = [
  { type: 'Autoréglable (référence)', eco: '0 % (référence)', conso_elec: '30-50 kWh/an' },
  { type: 'Simple flux hygro A', eco: '5-8 %', conso_elec: '20-35 kWh/an' },
  { type: 'Simple flux hygro B', eco: '8-12 %', conso_elec: '25-45 kWh/an' },
  { type: 'Double flux standard', eco: '15-20 %', conso_elec: '80-150 kWh/an' },
  { type: 'Double flux thermodynamique', eco: '20-25 %', conso_elec: '120-220 kWh/an' },
]

const faqs = [
  {
    question: 'Quel type de VMC choisir en 2026 ?',
    answer:
      'Trois cas typiques. (1) Logement <strong>non isolé, budget serré</strong> : VMC simple flux hygroréglable B (900-2 500 € posée), suffit pour gérer humidité. (2) Logement <strong>post-isolation lourde</strong> (combles + murs + fenêtres) : VMC double flux haute performance (4 000-6 500 €), seule option pour rentabiliser l’isolation. (3) <strong>Maison neuve RT2012/RE2020</strong> : double flux obligatoire de fait, version thermodynamique recommandée. Avant tout investissement, vérifier l’état de l’isolation : VMC double flux sans isolation = gâchis financier.',
  },
  {
    question: 'Quelle est la différence entre VMC simple flux et double flux ?',
    answer:
      'Simple flux : extrait l’air vicié (cuisine, SDB, WC), l’air neuf entre par défaut d’étanchéité (entrées d’air haute fenêtre). Pas de récup chaleur. Prix 500-2 500 €. Double flux : extrait + insuffle de l’air neuf filtré + récupère la chaleur de l’air sortant via un échangeur (70-90 % rendement). Prix 4 000-6 500 €. Économie chauffage 15-25 % vs simple flux. La double flux ne se justifie que dans un logement bien isolé (étanchéité air).',
  },
  {
    question: 'La VMC est-elle obligatoire en France ?',
    answer:
      'Oui. Depuis l’<strong>arrêté du 24 mars 1982</strong>, tout logement neuf doit être équipé d’un système de ventilation permanent. Pour les logements anciens, il n’y a pas d’obligation rétroactive, mais le DPE pénalise fortement l’absence de ventilation efficace. Les bailleurs doivent assurer la ventilation des logements loués (article 1719 Code civil + décret décence du 30/01/2002). Une VMC en panne = motif légal de réparation à la charge du bailleur.',
  },
  {
    question: 'Quelles aides MaPrimeRénov’ et CEE pour la VMC en 2026 ?',
    answer:
      '<strong>MaPrimeRénov’</strong> : VMC double flux uniquement. Bleu 2 500 €, Jaune 2 000 €, Violet 1 500 €, Rose 0 €. Simple flux <strong>non éligible</strong> MPR seul (mais incluse dans MPR Parcours Accompagné si rénovation globale). <strong>CEE Coup de pouce</strong> : 100-300 € (simple flux), 500-1 200 € (double flux). <strong>TVA 5,5 %</strong> automatique sur installation par artisan RGE. <strong>Éco-PTZ</strong> : éligible si bouquet de travaux. Cumul typique double flux : MPR Bleu 2 500 € + CEE 800 € = 3 300 € sur devis 5 500 €.',
  },
  {
    question: 'Combien coûte l’installation d’une VMC ?',
    answer:
      'Prix posé 2026 (maison 100 m², rénovation) : <strong>VMC autoréglable</strong> 500-1 200 €, <strong>VMC simple flux hygroréglable</strong> 900-2 500 €, <strong>VMC double flux standard</strong> 4 000-6 500 €, <strong>VMC double flux thermodynamique</strong> 6 000-9 000 €, <strong>VMC double flux décentralisée</strong> 300-600 €/pièce. Le matériel représente 50-65 %, la pose (caisson + gaines + bouches) 35-50 %. En neuf, divisez le coût par 1,5-2 (intégration plus simple).',
  },
  {
    question: 'Faut-il un artisan RGE pour bénéficier des aides ?',
    answer:
      'Oui, obligatoire. Mention RGE <strong>Qualibat 8721</strong> (ventilation mécanique) ou QualiPAC mention VMC pour la double flux. La mention RGE doit être valide à la date du devis (vérification ADEME). Sans RGE : pas de MPR, pas de CEE, TVA 20 % au lieu de 5,5 %. Notre annuaire liste les artisans RGE certifiés via l’API officielle ADEME mise à jour mensuellement.',
  },
  {
    question: 'Combien de temps pour rentabiliser une VMC double flux ?',
    answer:
      'Reste à charge typique post-aides : 2 200-3 500 € (Bleu/Jaune). Économie chauffage attendue : 200-450 €/an (selon climat et isolation). <strong>ROI 5-7 ans</strong>. Durée de vie : 15-20 ans (caisson), 30+ ans (gaines). Bénéfice non-monétaire : qualité air, silencieux, filtration pollens. Important : ROI calculé après isolation. Sans isolation préalable, ROI 12-15 ans.',
  },
  {
    question: 'Peut-on installer une VMC dans un appartement ?',
    answer:
      'Oui mais selon configuration. <strong>Appartement avec VMC collective</strong> : modification interdite (réseau commun copropriété), entretien à la charge du syndic. <strong>Appartement sans VMC</strong> : installation possible (simple flux extracteur cuisine + SDB) après accord copropriété (perçage façade pour rejet d’air). <strong>Double flux décentralisée</strong> : option idéale en copropriété (modules muraux pièce par pièce, pas de gaines centrales). Coût 300-600 €/pièce.',
  },
]

const sources = [
  { label: 'France Rénov’ — Ventilation logement', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Guide ventilation', url: 'https://www.ademe.fr' },
  { label: 'Anah — MPR VMC double flux', url: 'https://www.anah.gouv.fr' },
  { label: 'Arrêté 24 mars 1982 — Aération logements', url: 'https://www.legifrance.gouv.fr' },
  { label: 'NF DTU 68.3 — Mise en œuvre VMC', url: 'https://www.afnor.org' },
  { label: 'CSTB — Avis techniques ventilation', url: 'https://www.cstb.fr' },
]

const relatedPages = [
  {
    label: 'VMC simple flux',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
    description: 'Prix, comparatif autoréglable vs hygro, conditions CEE',
  },
  {
    label: 'VMC hygroréglable',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
    description: 'Type A vs B, économie chauffage, prix posé',
  },
  {
    label: 'VMC double flux',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Récup chaleur 70-90 %, MPR 2 500 €',
  },
  {
    label: 'Entretien VMC',
    href: '/renovation-energetique/travaux/vmc/entretien',
    description: 'Prix 80-300 €, fréquence, obligations gaz collective',
  },
  {
    label: 'VMC salle de bain : extracteur, débits, normes',
    href: '/renovation-energetique/travaux/vmc/salle-de-bain',
    description: 'Extracteur 60-300 € posé, NF C 15-100 IP44, sans fenêtre',
  },
  {
    label: 'VMC hygroréglable type B (focus deep)',
    href: '/renovation-energetique/travaux/vmc/hygroreglable/type-b',
    description: 'Modulation totale entrées + bouches, économie 8-12 %, 1 200-2 800 € posée',
  },
  {
    label: 'VMC double flux thermodynamique (PAC intégrée)',
    href: '/renovation-energetique/travaux/vmc/double-flux-thermodynamique',
    description: 'Échangeur 85-95 % + PAC, MPR 2 500 €, 6 000-9 000 € posée, ROI 7-12 ans',
  },
  {
    label: 'Branchement et pose VMC : schéma + 9 étapes',
    href: '/renovation-energetique/travaux/vmc/branchement-pose',
    description: 'NF C 15-100, sections câble, volumes humides, mise en service débits',
  },
  {
    label: 'VMI (insufflation, alternative VMC)',
    href: '/renovation-energetique/travaux/vmi',
    description: 'Prix 3 500-7 000 €, idéale rénovation maison ancienne',
  },
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique',
  },
  {
    label: 'Isolation thermique',
    href: '/renovation-energetique/travaux/isolation',
    description: 'À faire AVANT la VMC double flux',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('ventilation', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'VMC',
    keywords: [
      'vmc',
      'vmc simple flux',
      'vmc hygroreglable',
      'vmc double flux',
      'vmc prix',
      'vmc installation',
      'vmc 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'VMC : MaPrimeRénov’ et CEE 2026',
    description:
      'Ventilation Mécanique Contrôlée éligible MaPrimeRénov’ (double flux) et CEE Coup de pouce. Installation par artisan RGE Qualibat 8721 obligatoire pour les aides.',
    url: PAGE_URL,
    serviceType: 'Subvention publique ventilation',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
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
              { label: 'VMC' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Hub VMC 2026 — 4 types comparés
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC 2026 : simple flux, hygro ou double flux ?
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>VMC</strong> (Ventilation Mécanique Contrôlée) est obligatoire dans tout
              logement depuis 1982. Quatre familles existent : <strong>autoréglable</strong>{' '}
              (basique 500-1 200 €), <strong>simple flux hygroréglable</strong> (économe 900-2 500
              €), <strong>double flux</strong> (récup chaleur 4 000-6 500 €) et{' '}
              <strong>double flux thermodynamique</strong> (haut de gamme 6 000-9 000 €). Choix
              selon isolation existante, budget et profil ménage. MaPrimeRénov’ jusqu’à 2 500 €
              (double flux uniquement) + CEE Coup de pouce.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types-vmc">Les 4 grandes familles de VMC</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">
                    Performance : {t.perf} · Aide : {t.aide}
                  </p>
                  <p
                    className="text-sm text-sand-700 m-0"
                    dangerouslySetInnerHTML={{ __html: t.detail }}
                  />
                  {t.href.startsWith('/') && (
                    <Link
                      href={t.href}
                      className="text-sm font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1 mt-2"
                    >
                      Page dédiée <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <h2 id="arbre-decision">Quel type de VMC selon votre profil</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Recommandation</th>
                    <th className="p-3 border-b border-sand-200">Pourquoi</th>
                  </tr>
                </thead>
                <tbody>
                  {ARBRE_DECISION.map((r) => (
                    <tr key={r.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.profil}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.recommandation}</td>
                      <td className="p-3 text-sand-600">{r.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="economie">Économie chauffage par type de VMC</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Économie chauffage</th>
                    <th className="p-3 border-b border-sand-200">Conso élec ventilateur</th>
                  </tr>
                </thead>
                <tbody>
                  {ECO_PAR_TYPE.map((e) => (
                    <tr key={e.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{e.type}</td>
                      <td className="p-3 text-primary-700 font-semibold">{e.eco}</td>
                      <td className="p-3 text-sand-600">{e.conso_elec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500 italic">
              Économies calculées sur facture chauffage type 1 200 €/an, maison 100 m² isolée
              partiellement. Source ADEME — guide ventilation 2026.
            </p>

            <h2 id="aides-vmc">Aides 2026 par type de VMC</h2>
            <p>
              <strong>MaPrimeRénov’</strong> ne finance que la VMC <strong>double flux</strong>{' '}
              (plafond 2 500 € pour le profil Bleu, dégressif jusqu’à 0 € pour le Rose). La VMC
              simple flux n’est éligible à MPR{' '}
              <strong>que dans le cadre du Parcours Accompagné</strong> (rénovation globale gain
              énergétique &gt; 35 %). Les <strong>CEE Coup de pouce</strong> couvrent tous les types
              : 100-300 € (simple flux), 500-1 200 € (double flux). Pour cumuler : RGE Qualibat 8721
              obligatoire, devis avant signature, dépôt MPR puis CEE en parallèle.
            </p>
            <p className="text-sm">
              <Link
                href="/renovation-energetique/aides/maprimerenov-2026"
                className="font-semibold"
              >
                Voir le guide MaPrimeRénov’ 2026 →
              </Link>
              {' · '}
              <Link
                href="/renovation-energetique/aides/cee-certificats-economie-energie"
                className="font-semibold"
              >
                Voir le guide CEE 2026 →
              </Link>
            </p>

            <h2 id="ordre-travaux">Ordre logique des travaux : VMC en dernier</h2>
            <p>
              Une VMC efficace dépend de l’<strong>étanchéité à l’air</strong> du logement. Suivez
              l’ordre : (1) <strong>isolation lourde</strong> (combles + murs + planchers), (2){' '}
              <strong>menuiseries étanches</strong> (fenêtres + portes), (3) chauffage performant,
              (4) <strong>VMC adaptée</strong>. Installer une VMC double flux dans un logement
              passoire = perte d’efficacité 50-70 % (fuites d’air parasites court-circuitent
              l’échangeur).
            </p>

            <h2 id="cta">Trouvez un artisan RGE Qualibat 8721 près de chez vous</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis VMC en 30 secondes</strong> — artisans certifiés RGE pour bénéficier
                des aides MPR + CEE.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis VMC <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <SimulateurAideBox
            serviceKey="vmc"
            estimatedSaving={3700}
            subtitle="MaPrimeRénov' Bleu 2 500 € (double flux) + CEE Coup de pouce 100-1 200 € — éligibilité conditionnée à un artisan RGE Qualibat 8721"
          />

          <LocalProviderShowcase
            providers={providers}
            serviceName="Installateur VMC RGE"
            cityName="France"
          />

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
