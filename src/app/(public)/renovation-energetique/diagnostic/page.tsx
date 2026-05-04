/**
 * Page : /renovation-energetique/diagnostic
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "diagnostic energetique"             → 855 vol, KD 53, CPC $0,90 (hub pivot)
 * - "diagnostic de performance energetique" → 150 vol, KD 49
 * - "diagnostics renovation"             → longue traîne
 * - Famille cumulée pivot : ~1 200 vol/mois (hub navigationnel transmettant PageRank)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : NON (KD 49-53) — page hub destinée à siloer les 3 sous-pages
 *            (DPE 93K vol pivot + audit énergétique 1 831 vol + thermographie 1 037 vol KD 0)
 *            qui captent la longue traîne moins compétitive.
 * Cluster pillar : Rénovation Énergétique → Diagnostic
 *
 * Anti-cannibalisation :
 *   - Hub racine /renovation-energetique = panorama 4 clusters
 *   - Cette page = HUB diagnostic (DPE + audit + thermographie comparés)
 *   - Sous-pages : /dpe/, /audit-energetique/, /thermographie/, /audit-energetique-obligatoire/ (alias)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  FileSearch,
  Search,
  Thermometer,
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

const PAGE_PATH = '/renovation-energetique/diagnostic'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Diagnostic énergétique 2026'
const DESCRIPTION =
  'DPE, audit énergétique, thermographie : 3 diagnostics 2026 expliqués (prix, obligation, contenu). Différences et choix selon votre projet.'

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
  '3 diagnostics énergétiques distincts en 2026 : DPE (obligatoire), audit énergétique (rénovation d’ampleur), thermographie (visuelle).',
  'DPE : 100-250 €, obligatoire pour vente/location, valable 10 ans.',
  'Audit énergétique : 500-1 200 €, obligatoire vente F/G + Parcours accompagné MPR, propose 2 scénarios chiffrés.',
  'Thermographie infrarouge : 200-500 €, identifie ponts thermiques + défauts isolation invisibles.',
  'Tous réalisés par diagnostiqueur certifié (DPE) ou bureau d’études (audit) — vérifier la certification.',
  'Cumul recommandé : DPE + audit pour rénovation d’ampleur, thermographie pour ciblage isolation.',
]

const DIAGNOSTICS = [
  {
    icon: ClipboardCheck,
    name: 'DPE — Diagnostic de Performance Énergétique',
    href: '/renovation-energetique/diagnostic/dpe',
    headline: 'Obligatoire vente/location',
    prix: '100-250 € TTC',
    duree: '1-2 h sur place',
    validite: '10 ans',
    quand: 'Vente, location, copropriété (DPE collectif). Renouvellement après travaux importants.',
  },
  {
    icon: FileSearch,
    name: 'Audit énergétique',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    headline: 'Parcours accompagné MPR',
    prix: '500-1 200 € TTC',
    duree: '4-8 h sur place + 1-2 sem rapport',
    validite: 'Pas de durée légale',
    quand: 'Vente F/G/E (obligatoire), Parcours accompagné MPR, projet rénovation > 15 000 €.',
  },
  {
    icon: Thermometer,
    name: 'Thermographie infrarouge',
    href: '/renovation-energetique/diagnostic/thermographie',
    headline: 'Détection visuelle ponts thermiques',
    prix: '200-500 € TTC',
    duree: '1-2 h sur place + 1 sem rapport',
    validite: 'Pas de durée légale',
    quand: 'Avant ITE/ITI, après travaux isolation, doute sur défauts cachés.',
  },
]

const COMPARATIF = [
  {
    critere: 'Obligatoire',
    dpe: 'Oui (vente/location)',
    audit: 'Oui (vente F/G/E)',
    thermo: 'Non',
  },
  { critere: 'Prix moyen', dpe: '100-250 €', audit: '500-1 200 €', thermo: '200-500 €' },
  { critere: 'Validité', dpe: '10 ans', audit: 'N/A', thermo: 'N/A' },
  {
    critere: 'Conclusion',
    dpe: 'Note A à G + recos',
    audit: '2 scénarios chiffrés',
    thermo: 'Cartographie thermique',
  },
  {
    critere: 'Profession',
    dpe: 'Diagnostiqueur certifié',
    audit: 'Bureau d’études / auditeur agréé',
    thermo: 'Thermographe certifié',
  },
  {
    critere: 'Indispensable pour aides',
    dpe: 'Oui (référence performances)',
    audit: 'Oui (Parcours accompagné MPR)',
    thermo: 'Optionnel',
  },
  {
    critere: 'Méthode',
    dpe: 'Calcul conso conventionnelle',
    audit: 'Audit complet + simulations',
    thermo: 'Caméra IR (en hiver)',
  },
]

const QUAND_FAIRE = [
  {
    cas: 'Vous vendez votre logement',
    dia: 'DPE obligatoire + audit énergétique si maison F/G/E (depuis 2025)',
  },
  {
    cas: 'Vous louez votre logement',
    dia: 'DPE obligatoire (annexé au bail). G interdit depuis 2025, F en 2028',
  },
  {
    cas: 'Vous prévoyez Parcours accompagné MPR',
    dia: 'Audit énergétique obligatoire (souvent inclus dans MAR Mon Accompagnateur Rénov’)',
  },
  {
    cas: 'Vous avez des ponts thermiques visibles',
    dia: 'Thermographie pour cartographier les défauts avant travaux isolation',
  },
  {
    cas: 'Vous voulez vérifier la qualité de vos travaux',
    dia: 'Thermographie post-travaux (vérification homogénéité isolation)',
  },
]

const faqs = [
  {
    question: 'Quelle différence entre DPE, audit énergétique et thermographie ?',
    answer:
      'DPE = note officielle A à G obligatoire pour vente/location, calcul conventionnel de la consommation primaire (kWh/m²/an), 100-250 €, validité 10 ans. Audit énergétique = analyse complète + 2 scénarios chiffrés de rénovation, obligatoire vente F/G/E et Parcours accompagné MPR, 500-1 200 €. Thermographie = cartographie visuelle des ponts thermiques par caméra infrarouge, optionnelle, 200-500 €. Les 3 se complètent : DPE pour la note, audit pour le plan, thermographie pour la cartographie.',
  },
  {
    question: 'Lequel est obligatoire en 2026 ?',
    answer:
      'DPE : obligatoire pour toute vente ou location (annexé au bail/compromis). Audit énergétique : obligatoire pour vendre une maison individuelle classée F ou G depuis 2023, étendu aux E depuis le 1er janvier 2025. Obligatoire également pour MaPrimeRénov’ Parcours accompagné. Thermographie : jamais obligatoire (mais recommandée pour rénovations lourdes).',
  },
  {
    question: 'Combien coûtent ces diagnostics au total ?',
    answer:
      'Pour une rénovation d’ampleur typique : DPE 150 € + audit énergétique 800 € + thermographie 350 € = 1 300 € TTC. MaPrimeRénov’ rembourse partiellement le forfait audit (300-500 € selon revenus). Reste à charge net 700-1 000 €. Indispensable pour accéder au Parcours accompagné MPR (jusqu’à 70 000 € de devis pris en charge à 90 % pour Bleu).',
  },
  {
    question: 'Qui réalise ces diagnostics ?',
    answer:
      'DPE : diagnostiqueur immobilier certifié (par un organisme accrédité COFRAC). Liste sur diagnostiqueurs.application.developpement-durable.gouv.fr. Audit énergétique : bureau d’études certifié RGE Études (RGE-OPQIBI 1905) ou auditeur agréé France Rénov’. Thermographie : thermographe certifié (catégorie 1, 2 ou 3 selon norme NF EN ISO 9712). Tous doivent fournir une attestation de certification valide.',
  },
  {
    question: 'Le DPE est-il fiable depuis la réforme de 2021 ?',
    answer:
      'Oui, beaucoup plus qu’avant. Réforme du 1er juillet 2021 : DPE devenu opposable juridiquement (sanctions en cas d’erreur), méthode 3CL-2021 unifiée pour tous les logements, prise en compte de l’usage réel et des occupants. Quelques bugs initiaux (notamment maisons construites avant 1948) corrigés en 2024. DPE valides depuis le 1er juillet 2021 sont fiables et tiennent jusqu’à leur date de fin (10 ans).',
  },
  {
    question: 'Mon DPE actuel est-il encore valide en 2026 ?',
    answer:
      'DPE réalisés AVANT le 1er juillet 2021 : invalides depuis le 1er janvier 2025 (doivent être refaits). DPE réalisés ENTRE le 1er juillet 2021 et le 31 décembre 2024 : valides jusqu’à leur date de fin de validité (10 ans à compter de la réalisation). DPE depuis 2025 : nouvelle version 3CL-2021 stable et opposable.',
  },
  {
    question: 'Faut-il faire l’audit avant ou après le DPE ?',
    answer:
      'Logiquement APRÈS le DPE. Le DPE pose la note initiale (lettre A à G + consommation). L’audit énergétique part de cette note et propose 2 scénarios pour atteindre une note supérieure (gain ≥ 2 classes pour Parcours accompagné MPR). En pratique, les deux sont souvent réalisés successivement par le même bureau d’études (forfait économique 800-1 500 €).',
  },
  {
    question: 'La thermographie est-elle vraiment utile ?',
    answer:
      'Oui dans 2 cas : (1) AVANT isolation pour cartographier précisément les ponts thermiques et défauts cachés (pas visibles à l’œil nu), permettant de dimensionner le projet correctement. (2) APRÈS travaux pour vérifier l’homogénéité de l’isolation et détecter d’éventuels défauts de pose (vide entre panneaux, tassement laine soufflée). Pour une rénovation simple ou un DPE C+ existant, la thermographie est généralement superflue.',
  },
]

const sources = [
  { label: 'France Rénov’ — Diagnostics énergétiques', url: 'https://france-renov.gouv.fr' },
  {
    label: 'Service-Public.fr — DPE',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16096',
  },
  { label: 'ADEME — Méthode 3CL-2021 DPE', url: 'https://www.ademe.fr' },
  { label: 'OPQIBI — Audit énergétique RGE', url: 'https://www.opqibi.com' },
  { label: 'Anah — Audit énergétique MPR', url: 'https://www.anah.gouv.fr' },
]

const relatedPages = [
  {
    label: 'DPE 2026 : tout savoir',
    href: '/renovation-energetique/diagnostic/dpe',
    description: '93 K vol/mois — note A-G, location interdite F/G',
  },
  {
    label: 'Audit énergétique 2026',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Obligatoire vente F/G/E + Parcours accompagné',
  },
  {
    label: 'Thermographie infrarouge',
    href: '/renovation-energetique/diagnostic/thermographie',
    description: 'Détection ponts thermiques + défauts isolation',
  },
  {
    label: 'Passoires thermiques F/G',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Calendrier interdiction location 2025-2034',
  },
  {
    label: 'Parcours accompagné MPR',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Audit obligatoire pour rénovation d’ampleur',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ',
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
    section: 'Diagnostic énergétique',
    keywords: [
      'diagnostic energetique',
      'diagnostic de performance energetique',
      'dpe',
      'audit energetique',
      'thermographie',
      'diagnostic renovation',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: PAGE_PATH },
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
              { label: 'Diagnostic' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Search className="w-3.5 h-3.5" aria-hidden />
              Hub Diagnostic 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Diagnostic énergétique 2026 : DPE, audit, thermographie
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Trois diagnostics distincts encadrent la rénovation énergétique en 2026 :{' '}
              <strong>DPE</strong> (obligatoire pour vente/location, 100-250 €),{' '}
              <strong>audit énergétique</strong> (obligatoire vente F/G/E + Parcours accompagné MPR,
              500-1 200 €), <strong>thermographie infrarouge</strong> (détection visuelle ponts
              thermiques, 200-500 €). Voici comment choisir, leurs prix, leurs obligations et
              comment les combiner pour optimiser une rénovation.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="diagnostics">Les 3 diagnostics énergétiques 2026</h2>
            <div className="not-prose grid gap-4 my-6">
              {DIAGNOSTICS.map((d) => {
                const Icon = d.icon
                return (
                  <Link
                    key={d.name}
                    href={d.href}
                    className="block bg-white border border-sand-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-6 h-6" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                            {d.name}
                          </h3>
                          <span className="text-sm font-bold text-primary-700">{d.prix}</span>
                        </div>
                        <p className="text-xs text-primary-600 font-medium mt-0.5 mb-2 m-0">
                          {d.headline}
                        </p>
                        <dl className="text-xs text-sand-700 space-y-0.5 m-0">
                          <div className="flex gap-2">
                            <dt className="font-semibold">Durée :</dt>
                            <dd className="m-0">{d.duree}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="font-semibold">Validité :</dt>
                            <dd className="m-0">{d.validite}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="font-semibold">Quand :</dt>
                            <dd className="m-0">{d.quand}</dd>
                          </div>
                        </dl>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-2" aria-hidden />
                    </div>
                  </Link>
                )
              })}
            </div>

            <h2 id="comparatif">Comparatif détaillé</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">DPE</th>
                    <th className="p-3 border-b border-sand-200">Audit énergétique</th>
                    <th className="p-3 border-b border-sand-200">Thermographie</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3">{c.dpe}</td>
                      <td className="p-3 text-primary-700">{c.audit}</td>
                      <td className="p-3">{c.thermo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="quand-faire">Quand faire quel diagnostic ?</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUAND_FAIRE.map((q) => (
                <div key={q.cas} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">→ {q.cas}</p>
                  <p className="text-sm text-primary-700 m-0">{q.dia}</p>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre projet rénovation après diagnostic
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul aides MPR + CEE + éco-PTZ selon votre note DPE actuelle et la cible
                    visée. Mise en relation avec un bureau d’études RGE pour audit énergétique.
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

            <h2 id="combinaison">Combinaison optimale rénovation d’ampleur</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>DPE</strong> (note initiale) → audit énergétique (scénarios chiffrés) →
                thermographie (cartographie défauts).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Coût total typique : 1 200-1 800 € TTC (forfait DPE + audit auprès d’un même bureau
                d’études).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                MaPrimeRénov’ rembourse 300-500 € sur l’audit selon catégorie de revenus.
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
              href="/renovation-energetique/aides"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Aides 2026 <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
