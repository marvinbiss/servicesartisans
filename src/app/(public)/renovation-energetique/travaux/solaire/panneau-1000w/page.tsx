/**
 * Page : /renovation-energetique/travaux/solaire/panneau-1000w
 *
 * @kw-primary    panneau solaire 1000w
 * @kw-volume     2100
 * @kw-kd         1
 * @kw-cpc        0.45
 * @cluster       2
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster solaire orphelin)
 * @backlog-item  Levier-E2-panneau-1000w
 *
 * KW cibles (Ahrefs Bloc 1 v3, country=fr) :
 * - "panneau solaire 1000w"        → 2 100 vol, KD 1 ⭐⭐⭐ pivot
 * - "kit panneau solaire 1000w"    → ~600 vol estimé, KD 1
 * - "kit solaire plug and play"    → ~400 vol estimé (Beem, Sunology, Sunethic)
 * - "panneau solaire autoconsommation" → ~800 vol estimé, KD 5
 * - Famille cumulée pivot : ~3 900 vol/mois
 *
 * Anti-cannibalisation :
 *   - Hub /travaux/solaire = installation pro 3-9 kWc + aides EDF OA
 *   - Cette page = kits DIY 1 kWc (intent autoconso plug&play sans installateur)
 *   - /solaire/nettoyage (Levier E) = entretien post-install
 *
 * YMYL medium : sécurité électrique (raccordement, Consuel) +
 * cadre réglementaire (déclaration préalable Enedis, plafond ≤ 3 kWc DIY).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Plug,
  Zap,
  ShieldCheck,
  Calculator,
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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/panneau-1000w'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Panneau solaire 1000W (1 kWc) 2026 : kit, prix, réglementation'
const DESCRIPTION =
  'Panneau solaire 1000W (~1 kWc) en kit plug & play 2026 : 600-1 200 €. Production 1 100-1 250 kWh/an au sud. Déclaration Enedis obligatoire.'

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
  '« 1000 W » = 1 kWc en pratique : 2-3 panneaux 330-500 Wc selon le kit. Adapté autoconso résidentielle ou tertiaire de base.',
  'Prix 2026 d’un kit 1 kWc plug & play : 600 à 1 200 € TTC. Pose en 1 h sans pro (prise renforcée 16 A).',
  'Production réelle 2026 (cristallin mono, sud France) : 1 100 à 1 250 kWh/an, soit 200-280 €/an d’économie autoconso.',
  'Déclaration préalable Enedis OBLIGATOIRE même en plug & play (gratuite, en ligne). Sans cela = installation illégale.',
  'Pas de prime EDF OA Solaire ni de revente surplus en DIY pur. Aide possible uniquement via QualiPV (ne s’applique donc pas en kit autonome).',
  'Garantie kit 5-10 ans (vs 25 ans pose pro). Onduleur central durée 8-12 ans.',
]

const KITS_TYPES = [
  {
    type: 'Kit Beem Energy / Sunology / Sunethic plug & play 1 kWc',
    prix: '900 - 1 400 € TTC',
    install: 'DIY 1-2 h, prise 230 V renforcée',
    note: 'Onduleur intégré micro-inverter. Idéal balcon/terrasse. Inclinaison ajustable. Pas de Consuel.',
  },
  {
    type: 'Kit autoconso 1 kWc avec micro-onduleurs',
    prix: '700 - 1 100 € TTC',
    install: 'DIY 2-4 h selon nombre de panneaux',
    note: '2-3 panneaux 330-500 Wc + 1 micro-onduleur par panneau. Bon rendement partiel ombre.',
  },
  {
    type: 'Kit autoconso 1 kWc onduleur central',
    prix: '600 - 900 € TTC',
    install: 'DIY 3-5 h',
    note: 'Onduleur unique, prix plus bas. Si un panneau ombré → toute la chaîne perd en performance.',
  },
  {
    type: 'Kit avec batterie de stockage 1 kWh',
    prix: '1 500 - 2 800 € TTC',
    install: 'DIY 4-6 h (intermédiaire) à pro recommandé',
    note: 'Couvre éclairage soir + petits appareils en autonomie. ROI long (12-18 ans) sauf zone PV cher.',
  },
]

const REGLEMENTATION = [
  {
    title: 'Déclaration préalable Enedis (DP)',
    must: 'Obligatoire',
    desc: 'Toute installation PV raccordée au réseau (même 1 kWc et plug & play) doit être déclarée à Enedis via le formulaire en ligne (gratuit, sous 2 semaines). Référentiel : article D342-1 du Code de l’énergie. Pas de DP = installation illégale.',
  },
  {
    title: 'Plafond DIY ≤ 3 kWc en monophasé',
    must: 'Obligatoire',
    desc: 'Au-delà de 3 kWc, le Consuel (attestation de conformité électrique) est obligatoire et nécessite intervention pro. En triphasé, le plafond est plus haut mais la réglementation Consuel s’applique aussi.',
  },
  {
    title: 'Déclaration préalable mairie (DP travaux)',
    must: 'Selon zone',
    desc: 'Si fixation au sol > 1,8 m de haut ou installation visible de la voie publique en zone protégée (ABF, secteur sauvegardé) : DP travaux nécessaire. Plug & play balcon en zone non protégée : pas de DP travaux.',
  },
  {
    title: 'Pas de prime EDF OA Solaire en DIY pur',
    must: 'Limitation',
    desc: 'La prime à l’autoconsommation EDF OA et la revente surplus exigent un installateur RGE QualiPV + Consuel. Un kit DIY ne donne pas accès à ces aides. Pour cumul aides : faire poser par un pro QualiPV.',
  },
  {
    title: 'Assurance habitation à informer',
    must: 'Recommandé',
    desc: 'Informez votre assureur habitation (avenant souvent gratuit). En cas d’incendie ou de dégât des eaux lié à l’installation non déclarée, la prise en charge peut être refusée.',
  },
]

const PRODUCTION = [
  { region: 'Sud France (Marseille, Perpignan)', prod: '1 200 - 1 350 kWh/an' },
  { region: 'Sud-Ouest (Toulouse, Bordeaux)', prod: '1 100 - 1 250 kWh/an' },
  { region: 'Centre / Île-de-France (Paris, Lyon)', prod: '950 - 1 100 kWh/an' },
  { region: 'Ouest / Normandie (Rennes, Caen)', prod: '850 - 1 000 kWh/an' },
  { region: 'Nord / Est (Lille, Strasbourg)', prod: '800 - 950 kWh/an' },
]

const faqs = [
  {
    question: '« Panneau solaire 1000W » : c’est quoi exactement ?',
    answer:
      '« 1000 W » correspond à une puissance crête de 1 kWc (kilowatt-crête), c’est-à-dire la puissance maximale instantanée que peut délivrer le panneau dans des conditions standard de test (1000 W/m² rayonnement, 25 °C, AM 1.5). En pratique, un kit 1 kWc se compose de 2-3 panneaux modernes (330-500 Wc l’unité). La production réelle annuelle dépend du climat : 800-1 350 kWh/an selon la région française.',
  },
  {
    question: 'Combien coûte un kit panneau solaire 1000W en 2026 ?',
    answer:
      'Entre 600 et 1 200 € TTC pour un kit DIY 1 kWc avec onduleur central. Les kits plug & play (Beem, Sunology, Sunethic) coûtent 900-1 400 € (prix justifié par micro-onduleurs intégrés et facilité de pose 1 h). Avec batterie de stockage 1 kWh : 1 500-2 800 €. Les kits low-cost AliExpress < 500 € sont à éviter (qualité variable, garantie inexistante en France).',
  },
  {
    question: 'Combien d’électricité produit un panneau 1000W par an ?',
    answer:
      'Un kit 1 kWc orienté plein sud à 30° d’inclinaison produit 800 (Nord) à 1 350 kWh/an (Sud). Avec un taux d’autoconso de 70 % (consommation immédiate frigo, box, éclairage), cela représente 560 à 950 kWh consommés directement, soit 100 à 220 €/an d’économie sur la facture EDF (tarif heures pleines régulé 2026). Le surplus injecté est perdu (pas de revente possible en DIY pur).',
  },
  {
    question: 'Quelles sont les démarches obligatoires en 2026 ?',
    answer:
      'Une seule démarche minimale : la déclaration préalable Enedis via le formulaire en ligne (gratuit, validation sous 2 semaines). Référence : article D342-1 du Code de l’énergie. Pour un kit > 3 kWc en monophasé, attestation Consuel obligatoire (≈ 250 €) avec intervention d’un pro. Informez aussi votre assureur habitation. Sans déclaration Enedis, l’installation est illégale et peut être démontée sur ordonnance.',
  },
  {
    question: 'Puis-je revendre mon surplus avec un kit DIY ?',
    answer:
      'Non. La revente surplus à EDF OA Solaire (~0,12-0,15 €/kWh selon trimestre CRE) exige un installateur RGE QualiPV + attestation Consuel + raccordement Enedis dédié avec compteur de production. Un kit DIY plug & play ne remplit aucune de ces 3 conditions. Si la revente surplus est un objectif, il faut passer par un pro QualiPV (cf hub solaire). Sinon, l’autoconso uniquement reste rentable (200-280 €/an).',
  },
  {
    question: 'Plug & play (Beem, Sunology) ou kit avec onduleur ?',
    answer:
      'Plug & play = pose en 1 h, branche sur prise 230 V renforcée 16 A, pas de pro. Idéal balcon, terrasse, jardin pour 1-2 panneaux. Inconvénient : ~10-15 % plus cher à puissance équivalente. Kit avec onduleur central = moins cher, mais demande tirage câble vers tableau électrique + disjoncteur dédié (DIY 3-5 h, ou pro 200-400 €). Choix : plug & play si débutant ou location ; kit standard si propriétaire bricoleur.',
  },
  {
    question: 'Quelle est la durée de vie réelle d’un kit DIY ?',
    answer:
      'Panneaux : 25 ans à 80-85 % de production (garantie fabricant typique 25 ans). Onduleur central : 8-12 ans (à remplacer 1-2 fois sur la durée). Micro-onduleurs : 15-20 ans. Connectique MC4 : 25 ans (à serrer correctement à la pose). En pratique, un kit DIY bien posé tient 20-25 ans avec 1 remplacement onduleur intermédiaire.',
  },
  {
    question: 'Faut-il payer la TVA sur un kit autoconso ?',
    answer:
      'Oui : un kit DIY est taxé TVA 20 % (matériel sans pose). La TVA réduite 10 % ne s’applique qu’aux installations réalisées par un pro (logement > 2 ans, puissance ≤ 3 kWc). Donc privilégier un installateur RGE pour les installations 3 kWc dimensionnées « projet sérieux » — l’économie de TVA (1 000-1 500 €) compense souvent le surcoût de la pose pro.',
  },
]

const sources = [
  {
    label: 'Légifrance — Article D342-1 Code énergie (déclaration Enedis)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023987151/',
  },
  {
    label: 'Enedis — Déclaration en ligne installation PV',
    url: 'https://www.enedis.fr/raccordement-photovoltaique',
  },
  { label: 'Consuel — Attestation conformité électrique', url: 'https://www.consuel.com' },
  { label: 'CRE — Tarifs achat photovoltaïque trimestriels', url: 'https://www.cre.fr' },
  {
    label: 'France Rénov’ — Photovoltaïque résidentiel',
    url: 'https://france-renov.gouv.fr/aides/aides-photovoltaique',
  },
  { label: 'ADEME — Photovoltaïque autoconsommation', url: 'https://librairie.ademe.fr' },
]

const relatedPages = [
  {
    label: 'Hub Solaire (installation pro 3-9 kWc + aides EDF OA)',
    href: '/renovation-energetique/travaux/solaire',
  },
  {
    label: 'Nettoyage panneau solaire (entretien)',
    href: '/renovation-energetique/travaux/solaire/nettoyage',
  },
  {
    label: 'Guide prix panneau solaire 2026',
    href: '/guides/panneau-solaire-prix-rentabilite',
  },
  {
    label: 'Trouver un artisan QualiPV',
    href: '/rge/qualipv',
  },
  {
    label: 'Hub Aides 2026 (MPR, CEE, éco-PTZ)',
    href: '/renovation-energetique/aides',
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
    section: 'Travaux — Solaire — Kit 1 kWc',
    keywords: [
      'panneau solaire 1000w',
      'kit panneau solaire 1 kWc',
      'kit solaire plug and play',
      'panneau solaire autoconsommation',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Panneau solaire 1000W', url: PAGE_PATH },
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
              { label: 'Solaire', href: '/renovation-energetique/travaux/solaire' },
              { label: 'Panneau solaire 1000W' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Plug className="w-3.5 h-3.5" aria-hidden />
              Solaire &middot; Kit 1 kWc autoconso
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Panneau solaire 1000W (1 kWc) en 2026 : kit, prix, réglementation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un kit <strong>1000 W = 1 kWc</strong> coûte 600 à 1 200 € TTC en DIY (plug & play
              900-1 400 €). Production annuelle : 800-1 350 kWh selon votre région. Économie estimée
              : 200-280 €/an d’autoconso. La <strong>déclaration Enedis</strong> est obligatoire
              même en plug & play. Pas de revente surplus possible sans installateur RGE QualiPV.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>4 catégories de kits 1 kWc en 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de kit</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Pose</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {KITS_TYPES.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 hidden md:table-cell">{row.install}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs publics 2026, hors options (suiveur solaire, batterie additionnelle,
                wattmètre connecté).
              </p>
            </div>

            <h2>Production attendue par région</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6">
              <ul className="divide-y divide-sand-100">
                {PRODUCTION.map((row) => (
                  <li
                    key={row.region}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <span className="text-sand-800">{row.region}</span>
                    <span className="font-semibold text-primary-800 whitespace-nowrap">
                      {row.prod}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-sand-500 p-3 border-t border-sand-100">
                Production cristallin mono, orienté sud, inclinaison 30°. Source : PVGIS-EU
                (Commission européenne).
              </p>
            </div>

            <h2>Réglementation 2026 : 5 obligations</h2>
            <div className="not-prose grid gap-3 my-6">
              {REGLEMENTATION.map((rule) => (
                <div
                  key={rule.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{rule.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          rule.must === 'Obligatoire'
                            ? 'text-red-800 bg-red-50'
                            : rule.must === 'Limitation'
                              ? 'text-amber-800 bg-amber-50'
                              : 'text-sand-700 bg-sand-100'
                        }`}
                      >
                        {rule.must}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    DIY = pas d’aides EDF OA ni de revente surplus.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    La prime à l’autoconsommation EDF OA Solaire et le tarif d’achat surplus exigent
                    un installateur RGE QualiPV + Consuel + compteur de production. Un kit DIY ne
                    remplit aucune de ces conditions. Si la rentabilité aides incluses est un
                    objectif, passez par un pro QualiPV (économie sur 20 ans : +3 000 à 6 000 €).
                  </p>
                </div>
              </div>
            </div>

            <h2>Économies réelles 2026</h2>
            <p>
              Pour un kit 1 kWc en région Lyon (production 1 050 kWh/an) avec 70 % d’autoconso à
              0,21 €/kWh tarif régulé EDF :
            </p>
            <ul>
              <li>
                <Zap className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Production : 1
                050 kWh/an
              </li>
              <li>
                <Zap className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Autoconso :
                ~735 kWh/an = <strong>155 €/an d’économie</strong>
              </li>
              <li>
                <Calculator className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Surplus
                injecté (315 kWh) : perdu (pas de revente DIY)
              </li>
              <li>
                <Sun className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> ROI sur kit 900
                € : ~6-7 ans (hors remplacement onduleur ~150 €)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Sur 25
                ans : ~3 500 € économisés (vs 900 € investis)
              </li>
            </ul>

            <h2>Quand passer plutôt par un installateur pro ?</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Vous
                visez ≥ 3 kWc (Consuel obligatoire de toute façon)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Vous
                voulez la prime EDF OA + revente surplus (cumul ~3-6 K€ sur 5-20 ans)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Vous
                bénéficiez de la TVA 10 % (économie ~10 % vs DIY TVA 20 %)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Toiture inclinée &gt; 25° ou hauteur &gt; 3 m (sécurité travail en hauteur)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Garantie décennale étanchéité de la couverture (uniquement chez un pro)
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
        </div>
      </div>
    </>
  )
}
