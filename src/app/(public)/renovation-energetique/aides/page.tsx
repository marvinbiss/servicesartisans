/**
 * Page : /renovation-energetique/aides
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "aides renovation energetique"        → 200 vol, KD 63, CPC null, clicks 255
 * - "aide renovation"                     → 567 vol, KD 72, CPC $1,50
 * - "ma prime renov"                      → 56 980 vol, KD 67, CPC $1,40 (cluster pivot)
 * - "cee"                                 → 20 831 vol, KD 54, CPC $1,20
 * - "eco ptz"                             → 5 289 vol, KD 49, CPC $0,60
 * - Famille cumulée pivot : ~85 000 vol/mois (intent navigationnel/informationnel large)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : NON (KD 47-72 sur les KW concentrés) — page hub destinée à siloer les 7 sub-pages
 *            (MPR×4 + CEE + éco-PTZ + Coup de pouce) qui captent la longue traîne sub-cluster.
 * Cluster pillar : Rénovation Énergétique → Aides
 *
 * Anti-cannibalisation :
 *   - Existe /guides/maprimerenov-* et /guides/cee-* (ciblent intent how-to spécifique)
 *   - Cette page = HUB navigationnel + comparaison + cumul aides (intent général "quelles aides ?")
 *   - Liens internes prioritaires vers les 7 sub-pages cluster + simulateur
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Banknote,
  Calculator,
  CheckCircle2,
  Coins,
  PiggyBank,
  Landmark,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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

const PAGE_PATH = '/renovation-energetique/aides'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Aides rénovation 2026 : MPR + CEE + PTZ'
const DESCRIPTION =
  'MaPrimeRénov, CEE, éco-PTZ, TVA 5,5 % : panorama des aides 2026 cumulables (montants, éligibilité, démarche). Simulateur intégré + artisans RGE.'

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
  "4 dispositifs principaux en 2026 : MaPrimeRénov' (subvention), CEE Coup de pouce (prime artisan), éco-PTZ (prêt 0 %), TVA 5,5 % (réduction).",
  "MaPrimeRénov' Parcours accompagné : jusqu'à 70 000 € pour rénovation d'ampleur (gain ≥ 2 classes DPE).",
  'CEE Coup de pouce chauffage : 2 500-5 000 € pour PAC, chaudière biomasse, isolation.',
  'Éco-PTZ : prêt 50 000 € sans intérêts sur 20 ans, cumulable avec MPR + CEE.',
  "TVA 5,5 % automatique sur main-d'œuvre + matériaux avec artisan RGE certifié.",
  'Cumul typique pour ménages modestes : reste à charge 10-30 % du devis total.',
]

const AIDES = [
  {
    slug: 'maprimerenov-2026',
    name: "MaPrimeRénov' 2026",
    icon: Banknote,
    headline: 'Subvention principale État',
    amount: "Jusqu'à 70 000 €",
    eligibility:
      'Tous propriétaires (occupant ou bailleur). Logement > 15 ans. Artisan RGE obligatoire.',
    bonus: 'Bonus sortie passoire (F/G) + bonus BBC (atteinte classe A ou B).',
    href: '/renovation-energetique/aides/maprimerenov-2026',
  },
  {
    slug: 'cee-certificats-economie-energie',
    name: "CEE — Certificats d'Économie d'Énergie",
    icon: Sparkles,
    headline: "Prime versée par l'artisan",
    amount: '500 € à 5 000 €',
    eligibility:
      'Tous propriétaires + locataires (avec accord bailleur). Pas de plafond ressources.',
    bonus: 'Coup de pouce chauffage (PAC, biomasse) + Coup de pouce isolation.',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
  },
  {
    slug: 'eco-ptz-pret-zero',
    name: 'Éco-PTZ — Prêt à Taux Zéro',
    icon: Landmark,
    headline: 'Prêt 0 % sur 20 ans',
    amount: "Jusqu'à 50 000 €",
    eligibility: 'Propriétaires. Logement > 2 ans. Travaux par artisan RGE.',
    bonus: "Cumulable avec MaPrimeRénov' + CEE. Sans condition de ressources.",
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
  },
  {
    slug: 'prime-coup-de-pouce',
    name: 'Prime Coup de Pouce',
    icon: PiggyBank,
    headline: 'Bonification CEE chauffage',
    amount: '2 500 € à 5 000 €',
    eligibility: 'Remplacement chaudière fioul/gaz par PAC ou biomasse. Tous propriétaires.',
    bonus: 'Cumulable MPR + éco-PTZ. Versée sous 2-6 semaines après travaux.',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
  },
]

const CUMUL_EXAMPLE = [
  {
    project: 'PAC air-eau (10 kW) — ménage très modeste',
    devis: '14 000 €',
    mpr: '11 000 €',
    cee: '5 000 €',
    ecoptz: '0 €',
    tva: 'incluse 5,5 %',
    reste: '0 € (excédent → financement complémentaire)',
    note: 'Excédent CEE+MPR > devis : possible si bonification Coup de pouce maximale.',
  },
  {
    project: 'Isolation combles 100 m² — ménage modeste',
    devis: '4 500 €',
    mpr: '2 500 €',
    cee: '1 200 €',
    ecoptz: '0 €',
    tva: 'incluse 5,5 %',
    reste: '800 €',
    note: 'Reste à charge couvrable par éco-PTZ si projet groupé.',
  },
  {
    project: "Rénovation d'ampleur (PAC + isolation toiture + ITE) — modeste",
    devis: '55 000 €',
    mpr: '38 000 € (Parcours accompagné)',
    cee: '4 500 €',
    ecoptz: '12 500 €',
    tva: 'incluse 5,5 %',
    reste: '0 € à charge immédiate (reste à payer sur 20 ans à 0 %)',
    note: "Mon Accompagnateur Rénov' obligatoire pour Parcours accompagné.",
  },
]

const ETAPES = [
  {
    step: 'Audit ou diagnostic',
    detail:
      "Pour les rénovations d'ampleur (> 5 000 € MPR), audit énergétique obligatoire (500-1 200 €). Pour gestes simples, devis artisan RGE suffit.",
  },
  {
    step: 'Création du compte sur france-renov.gouv.fr',
    detail:
      "Plateforme officielle France Rénov'. Demande MaPrimeRénov' à faire AVANT signature du devis (sauf urgence justifiée).",
  },
  {
    step: "Choix d'un artisan RGE",
    detail:
      "RGE = Reconnu Garant de l'Environnement. Obligatoire pour MPR, CEE, éco-PTZ, TVA 5,5 %. Annuaire officiel sur france-renov.gouv.fr.",
  },
  {
    step: 'Signature devis + acceptation MPR',
    detail:
      'Notification MPR sous 15 jours. Devis signé doit mentionner mention RGE artisan + matériaux conformes critères de performance.',
  },
  {
    step: 'Travaux + facture',
    detail:
      'Délai max 2 ans entre acceptation MPR et facture. Facture détaillée avec performances équipements (Ucompo, R isolant, COP PAC).',
  },
  {
    step: 'Versement aides',
    detail:
      'MPR : 4-8 semaines après facture. CEE : 2-6 semaines. Éco-PTZ : versement banque selon échéancier travaux.',
  },
]

const faqs = [
  {
    question: 'Quelle est la principale aide à la rénovation énergétique en 2026 ?',
    answer:
      "MaPrimeRénov' reste l'aide principale en 2026. Elle se décline en deux parcours : \"Par geste\" (jusqu'à 11 000 € pour un seul équipement type PAC géothermique) et \"Parcours accompagné\" (jusqu'à 70 000 € pour rénovation globale avec gain ≥ 2 classes DPE). Distribuée par l'Anah et complétée par les CEE Coup de pouce, l'éco-PTZ et la TVA réduite à 5,5 %.",
  },
  {
    question: 'Toutes ces aides sont-elles cumulables ?',
    answer:
      "Oui dans la quasi-totalité des cas. MaPrimeRénov' + CEE + éco-PTZ + TVA 5,5 % se cumulent pour un même projet. Limites : (1) le total des aides ne peut excéder 90 % du devis pour les ménages très modestes (75 % modestes, 60 % intermédiaires, 40 % supérieurs). (2) Les aides locales (région, département, commune) viennent en complément mais peuvent être plafonnées différemment.",
  },
  {
    question: 'Faut-il obligatoirement un artisan RGE ?',
    answer:
      "Oui pour bénéficier de MaPrimeRénov', CEE, éco-PTZ et TVA 5,5 %. RGE (Reconnu Garant de l'Environnement) regroupe Qualibat, QualiPAC, Qualifelec, Qualisol, Qualibois selon le métier. La mention doit être valide à la date de signature du devis. Vérification obligatoire sur france-renov.gouv.fr ou via notre annuaire RGE vérifié quotidiennement.",
  },
  {
    question: "Quel est le plafond de ressources pour MaPrimeRénov' ?",
    answer:
      "MaPrimeRénov' est ouverte à tous les ménages mais le montant dépend de 4 catégories de revenus (très modeste/modeste/intermédiaire/supérieur) basées sur le RFR (revenu fiscal de référence) et la composition du foyer. Exemple Île-de-France : très modeste = RFR ≤ 23 768 € (1 personne), modeste = ≤ 28 933 €, intermédiaire = ≤ 40 404 €, supérieur = > 40 404 €. En province, plafonds réduits d'environ 15-20 %.",
  },
  {
    question: 'Quelles aides pour un propriétaire-bailleur ?',
    answer:
      'Les bailleurs ont accès à MaPrimeRénov\' depuis 2022 (catégorie "Bleu/Jaune/Violet/Rose" suivant ressources locataire), aux CEE, et à l\'éco-PTZ "logement loué". Plafond de 3 logements maximum par bailleur sur 5 ans. Engagement de location pendant 6 ans à un loyer encadré. Idéal pour sortir un logement de la classe F ou G avant les interdictions de location 2028 et 2034.',
  },
  {
    question: 'Quelles aides pour les copropriétés ?',
    answer:
      "MaPrimeRénov' Copropriété finance jusqu'à 25 % des travaux pour rénovations d'ampleur (gain ≥ 35 % énergie). Bonification +500 € à +1 500 € par logement pour sortie passoire. Décision en assemblée générale obligatoire. Cumul possible avec CEE Coup de pouce Copropriété. Accompagnement par un syndic et un Mon Accompagnateur Rénov' Copro.",
  },
  {
    question: "Quand demander MaPrimeRénov' : avant ou après les travaux ?",
    answer:
      "Avant signature du devis (et donc avant les travaux). La règle est stricte : la demande MPR doit être créée et notifiée AVANT acceptation du devis par le client. Une exception existe en cas d'urgence (équipement en panne irréparable) avec justificatif. Les travaux doivent être terminés sous 2 ans après notification d'octroi.",
  },
  {
    question: 'Quelles aides régionales et départementales existent ?',
    answer:
      'Plus de 200 aides locales recensées en 2026 (région, département, agglo, commune). Exemples : Île-de-France "Énergie Habitat" jusqu\'à 4 000 €, Bretagne "Aide Habitat", Hauts-de-France PassRénoCopro, Métropole de Lyon "Écoréno\'v" jusqu\'à 4 000 €. Annuaire complet sur france-renov.gouv.fr (filtre par code postal). Cumulables avec aides nationales dans la limite du plafond global.',
  },
]

const sources = [
  { label: "France Rénov' — Toutes les aides", url: 'https://france-renov.gouv.fr/aides' },
  { label: "Anah — MaPrimeRénov' barèmes 2026", url: 'https://www.anah.gouv.fr' },
  {
    label: 'Service-Public.fr — Aides rénovation énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/N321',
  },
  {
    label: 'Ministère Transition Écologique — CEE',
    url: 'https://www.ecologie.gouv.fr/certificats-deconomies-denergie',
  },
  {
    label: 'ADEME — Guide aides financières 2026',
    url: 'https://librairie.ademe.fr/changement-climatique-et-energie/4541-aides-financieres-2026.html',
  },
]

const relatedPages = [
  {
    label: 'Aides panneau solaire 2026 — EDF OA, TVA, IR',
    href: '/renovation-energetique/aides/panneau-solaire-2026',
    description: 'PV PAS éligible MPR/CEE — prime EDF OA + TVA 10 % + IR exonéré',
  },
  {
    label: "MaPrimeRénov' 2026 : guide complet",
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes, parcours, démarche A à Z',
  },
  {
    label: "CEE — Certificats d'Économie d'Énergie",
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Prime artisan, Coup de pouce, montants',
  },
  {
    label: 'Éco-PTZ : prêt à taux zéro',
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
    description: "Jusqu'à 50 000 € sans intérêts sur 20 ans",
  },
  {
    label: 'Prime Coup de Pouce',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: 'Bonification CEE PAC + biomasse',
  },
  {
    label: 'Prime CEE / Prime énergie / Prime EDF',
    href: '/renovation-energetique/aides/prime-energie',
    description: 'Comparer les obligés (EDF, Engie, Sonergia, Auchan…)',
  },
  {
    label: 'Simulateur aides rénovation 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation personnalisée en 2 minutes',
  },
  {
    label: 'Trouver un artisan RGE',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié quotidiennement',
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
    section: 'Aides rénovation énergétique',
    keywords: [
      'aides renovation energetique',
      'aide renovation',
      'ma prime renov',
      'cee',
      'eco ptz',
      'coup de pouce chauffage',
      'tva 5.5',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides publiques rénovation énergétique France 2026',
    description:
      "Ensemble des aides nationales : MaPrimeRénov' (Anah), CEE (Ministère Transition Écologique), éco-PTZ (banques agréées), TVA 5,5 %. Cumul possible jusqu'à 90 % du devis pour les ménages très modestes.",
    url: PAGE_URL,
    serviceType: 'Aide financière publique',
    audience: 'Propriétaires occupants, bailleurs et copropriétés',
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
              { label: 'Aides' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Coins className="w-3.5 h-3.5" aria-hidden />
              Barèmes 2026 à jour
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Aides rénovation énergétique 2026 : panorama complet
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Quatre aides nationales structurent le financement de la rénovation énergétique en
              2026 : <strong>MaPrimeRénov’</strong> jusqu’à 70 000 €,{' '}
              <strong>CEE Coup de pouce</strong> 500-5 000 €, <strong>éco-PTZ</strong> 50 000 € à 0
              %, et <strong>TVA 5,5 %</strong> automatique avec artisan RGE. Cumulables, elles
              peuvent ramener le reste à charge à <strong>10-30 % du devis</strong> pour un ménage
              modeste. Voici comment.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="aides-principales">Les 4 aides principales en 2026</h2>
            <div className="not-prose grid gap-4 my-6">
              {AIDES.map((a) => {
                const Icon = a.icon
                return (
                  <Link
                    key={a.slug}
                    href={a.href}
                    className="block bg-white border border-sand-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-6 h-6" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                            {a.name}
                          </h3>
                          <span className="text-sm font-bold text-primary-700">{a.amount}</span>
                        </div>
                        <p className="text-xs text-primary-600 font-medium mt-0.5 mb-2 m-0">
                          {a.headline}
                        </p>
                        <p className="text-sm text-sand-700 m-0">{a.eligibility}</p>
                        <p className="text-xs text-sand-500 mt-2 mb-0 italic">{a.bonus}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-2" aria-hidden />
                    </div>
                  </Link>
                )
              })}
            </div>

            <h2 id="cumul">Cumul des aides : 3 exemples chiffrés</h2>
            <div className="not-prose grid gap-3 my-6">
              {CUMUL_EXAMPLE.map((c) => (
                <div key={c.project} className="bg-white border border-sand-200 rounded-xl p-5">
                  <p className="font-semibold text-sand-900 m-0 mb-3">{c.project}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <span className="text-sand-600">Devis total</span>
                    <span className="text-sand-900 font-medium text-right">{c.devis}</span>
                    <span className="text-sand-600">MaPrimeRénov’</span>
                    <span className="text-primary-700 font-medium text-right">- {c.mpr}</span>
                    <span className="text-sand-600">CEE Coup de pouce</span>
                    <span className="text-primary-700 font-medium text-right">- {c.cee}</span>
                    <span className="text-sand-600">Éco-PTZ</span>
                    <span className="text-primary-700 font-medium text-right">- {c.ecoptz}</span>
                    <span className="text-sand-600">TVA 5,5 %</span>
                    <span className="text-sand-700 text-right">{c.tva}</span>
                    <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                      Reste à charge
                    </span>
                    <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                      {c.reste}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 italic mt-3 mb-0">{c.note}</p>
                </div>
              ))}
            </div>

            <h2 id="etapes">6 étapes pour obtenir vos aides</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES.map((s, i) => (
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

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Simulez vos aides en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul officiel basé sur les barèmes 2026 (MaPrimeRénov’, CEE, éco-PTZ).
                    Résultat instantané + mise en relation Mon Accompagnateur Rénov’ si Parcours
                    accompagné.
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

            <h2 id="aides-locales">Aides locales : région, département, commune</h2>
            <p>
              Plus de 200 aides locales s’ajoutent aux dispositifs nationaux en 2026. Exemples
              majeurs : Île-de-France <em>Énergie Habitat</em> jusqu’à 4 000 €, Métropole du Grand
              Lyon <em>Écoréno’v</em> jusqu’à 4 000 €, Bretagne <em>Aide Habitat</em>,
              Hauts-de-France <em>PassRénoCopro</em>. L’annuaire officiel France Rénov’ permet de
              filtrer par code postal et type de travaux. Toutes ces aides sont cumulables avec
              MaPrimeRénov’ dans la limite du plafond global de 90 % du devis pour les ménages très
              modestes.
            </p>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-primary-900">
                <p className="font-semibold m-0 mb-1">Anti-arnaque RGE</p>
                <p className="m-0">
                  Démarchage téléphonique <strong>interdit</strong> depuis juillet 2020 pour la
                  rénovation énergétique. Aucune aide ne se sollicite par téléphone non sollicité.
                  Ne signez jamais le jour-même d’une visite commerciale. Vérifiez la mention RGE de
                  l’artisan sur france-renov.gouv.fr.
                </p>
              </div>
            </div>

            <h2 id="comparatif">Tableau comparatif rapide</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Aide</th>
                    <th className="p-3 border-b border-sand-200">Nature</th>
                    <th className="p-3 border-b border-sand-200">Plafond</th>
                    <th className="p-3 border-b border-sand-200">Conditions ressources</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">MaPrimeRénov’</td>
                    <td className="p-3">Subvention</td>
                    <td className="p-3">70 000 €</td>
                    <td className="p-3">Oui (4 catégories)</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">CEE Coup de pouce</td>
                    <td className="p-3">Prime artisan</td>
                    <td className="p-3">5 000 €</td>
                    <td className="p-3">Non (bonification ménages modestes)</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Éco-PTZ</td>
                    <td className="p-3">Prêt 0 %</td>
                    <td className="p-3">50 000 €</td>
                    <td className="p-3">Non</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">TVA 5,5 %</td>
                    <td className="p-3">Réduction taux</td>
                    <td className="p-3">Sans plafond</td>
                    <td className="p-3">Non (artisan RGE obligatoire)</td>
                  </tr>
                </tbody>
              </table>
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
              href="/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Rénovation énergétique
            </Link>
            <Link
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE rénovation <TrendingUp className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>

          <p className="sr-only">
            <CheckCircle2 className="inline" aria-hidden /> Page mise à jour selon barèmes officiels
            2026 France Rénov’, Anah et Service-Public.fr.
          </p>
        </div>
      </div>
    </>
  )
}
