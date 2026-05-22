/**
 * Page : /renovation-energetique/diagnostic/dpe/classes/d
 *
 * @kw-primary    dpe classe d
 * @kw-volume     300
 * @kw-kd         0
 * @kw-cpc        0.38
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes-d
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (Bloc 1 niche v3)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 3 orphelin DPE classe D (plus gros segment 30 % parc)
 *
 * KW cibles :
 * - "dpe classe d"          → ~300 vol, KD 0 ⭐⭐⭐ PIVOT
 * - "classe d dpe"          → ~150 vol, KD 0
 * - "logement classe d"     → ~100 vol, KD 0
 * - "dpe d"                 → ~150 vol, KD 1
 * - Famille cumulée pivot : ~700 vol/mois (KD 0-1)
 *
 * Anti-cannibalisation :
 *   - Hub /classes/ = recap A-G
 *   - /classes/{e,f,g}/ = focus passoires/pré-passoires
 *   - Cette page = focus D (30 % du parc, le plus gros segment, "médiocre" mais
 *     pas concerné par interdictions location actuelles).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Home, Leaf } from 'lucide-react'

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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes/d'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE classe D 2026 : seuils, % parc, sauts D→C/B'
const DESCRIPTION =
  'DPE classe D en 2026 : 181-250 kWh/m²/an. 30 % du parc résidentiel français — le plus gros segment. Pas concerné par interdictions location. 3 sauts D→C/B/A chiffrés avec aides MPR.'

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
  'DPE classe D : 181 → 250 kWh/m²/an OU 31 → 50 kg CO₂/m²/an (méthode 3CL-2021).',
  '~9 millions de logements concernés, soit 30 % du parc résidentiel principal — le plus gros segment.',
  'Pas concerné par les interdictions location actuelles ni prévues à 10 ans (loi Climat 2021).',
  'Vente sans contrainte particulière : pas d’audit énergétique obligatoire, pas de mention "consommation excessive".',
  'Saut D → C (~ 7-12 K€) recommandé pour confort + facture (~ 600 €/an économies).',
  'Aides 2026 : MaPrimeRénov’ classique (sans bonus passoire), CEE, éco-PTZ. Couverture 30-45 % du devis.',
]

const SEUILS_D = [
  {
    indicateur: 'Énergie primaire',
    seuil: '181 → 250 kWh/m²/an',
    detail: '5 usages réglementaires. Maisons RT 1974-2005 isolées partiellement.',
  },
  {
    indicateur: 'Émissions CO₂',
    seuil: '31 → 50 kg CO₂/m²/an',
    detail: 'Si dépassé seul → bascule en D malgré conso < 181. Cas chauffage gaz récent.',
  },
  {
    indicateur: 'Facture énergétique',
    seuil: '~ 900 - 1 700 €/an',
    detail: 'Pour 100 m². Confort acceptable mais marge d’optimisation 30-40 %.',
  },
]

const SAUTS_D = [
  {
    saut: 'D → C',
    cout: '7 - 12 K€',
    aides: '2 - 5 K€',
    reste: '5 - 7 K€',
    travaux: 'Isolation combles 30 cm + remplacement chaudière gaz ancienne → condensation ou PAC.',
    impact: '~ 600 €/an économies + confort thermique amélioré.',
    rentabilite: 'ROI 8-12 ans. Recommandé pour résidence principale long terme.',
  },
  {
    saut: 'D → B',
    cout: '20 - 32 K€',
    aides: '7 - 14 K€',
    reste: '13 - 18 K€',
    travaux: 'Combles + ITE 14 cm + PAC + ballon thermodynamique + VMC hygroréglable.',
    impact: '~ 1 200 €/an économies. Valorisation +5-8 % à la revente (Notaires de France).',
    rentabilite: 'ROI 11-15 ans. Optimal résidence principale 15+ ans.',
  },
  {
    saut: 'D → A',
    cout: '40 - 60 K€',
    aides: '12 - 22 K€',
    reste: '28 - 38 K€',
    travaux: 'Rénovation BBC complète + photovoltaïque autoconsommation 3-6 kWc + ECS solaire.',
    impact: '~ 1 600 €/an économies + production solaire 1 000-2 000 €/an.',
    rentabilite: 'ROI 16-20 ans. Justifié résidence principale très long terme + écologie.',
  },
]

const sources = [
  {
    label: 'Arrêté du 31 mars 2021 — méthode 3CL-2021',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043301471',
  },
  {
    label: 'Loi Climat et Résilience n° 2021-1104',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'Observatoire DPE-Audit ADEME',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ 2026',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'INSEE — Recensement parc logements 2024',
    url: 'https://www.insee.fr',
  },
]

const faqs = [
  {
    question: 'La classe D est-elle "bonne" ou "mauvaise" ?',
    answer:
      'Classe D = "médiocre" sur l’étiquette officielle DPE (entre les classes "performant" A-B-C et "mauvais" E-F-G). Elle n’est pas une passoire thermique mais reste très répandue (30 % du parc, ~9 millions de logements). Aucune contrainte légale actuellement, mais marge d’optimisation 30-40 % sur la facture énergétique en passant en C ou B.',
  },
  {
    question: 'Mon logement classé D pourra-t-il être interdit à la location ?',
    answer:
      'NON dans le calendrier actuel de la loi Climat 2021 (art. 160). Les interdictions concernent uniquement G (depuis 2025), F (2028), E (2034). La classe D n’est pas prévue dans les échéances actuelles. Cependant, des évolutions législatives futures (UE — directive EPBD ou loi française) pourraient ajouter D à l’horizon 2040+. Aucune obligation actuelle ni à court terme.',
  },
  {
    question: 'Vendre un D en 2026 : décote ?',
    answer:
      'Décote négligeable (< 2 %) vs un C équivalent dans la plupart des régions (Notaires de France 2024). Délai de vente moyen ~75-80 jours, équivalent à la moyenne nationale. Pas d’audit énergétique obligatoire. Pas de mention de consommation excessive. La classe D reste vendable sans contrainte, sauf à anticiper une potentielle évolution réglementaire 2030+.',
  },
  {
    question: 'Quel saut prioriser pour rénover un D ?',
    answer:
      'D → C est le ROI optimal pour la plupart des cas (résidence principale 5-15 ans). Coût 7-12 K€ avec un retour ~ 600 €/an = ROI 12-15 ans, mais surtout gain de confort thermique. D → B (20-32 K€) ne se justifie que pour résidence principale long terme (15+ ans) ou bailleur souhaitant maximiser la valeur à la revente avec un signal "très performant" + bonus saut ≥ 2 classes 1 500 € MaPrimeRénov’.',
  },
  {
    question: 'Quelles aides en 2026 pour rénover une classe D ?',
    answer:
      'MaPrimeRénov’ classique (Parcours accompagné si saut ≥ 2 classes ou rénovation d’ampleur) — sans bonus passoire (réservé F/G). Cumulables : CEE Coup de pouce (chauffage 3-5 K€), éco-PTZ 50 K€ taux 0 sur 20 ans, TVA 5,5 % travaux RGE, exonération taxe foncière 3-5 ans selon commune. Total moyen 30-45 % du devis HT couvert pour ménage modeste, vs 50-65 % pour passoires F/G.',
  },
  {
    question: 'Mon DPE D est-il fiable ?',
    answer:
      'OUI si réalisé après le 1er juillet 2021 (méthode 3CL-2021 unifiée). Les DPE antérieurs sont caducs depuis le 1er janvier 2025 et doivent être refaits. Vérifiez l’authenticité de votre DPE sur l’Observatoire DPE-Audit ADEME en saisissant le numéro à 13 caractères. Erreurs fréquentes 2021-2023 : surface SHAB approximative, hypothèses chauffage, ventilation. En cas de doute, demander un re-DPE par un autre diagnostiqueur certifié.',
  },
]

export default function DpeClasseDPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: '/renovation-energetique/diagnostic/dpe/classes' },
    { name: 'Classe D', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Diagnostic — DPE — Classe D',
    keywords: ['dpe classe d', 'classe d dpe', 'logement classe d', 'dpe d', 'medioere dpe'],
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />

      <main className="bg-sand-50 min-h-screen">
        <Breadcrumb
          items={[
            { label: 'Rénovation énergétique', href: '/renovation-energetique' },
            { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
            { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' },
            { label: 'Classes A à G', href: '/renovation-energetique/diagnostic/dpe/classes' },
            { label: 'Classe D' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Home className="w-3.5 h-3.5" aria-hidden /> Médiocre — 30 % du parc
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              DPE classe D en 2026 : le plus gros segment du parc français
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout sur la classe D : seuils 3CL-2021, 30 % du parc résidentiel principal (~9
              millions de logements), sans contrainte légale actuelle, et 3 sauts de rénovation
              chiffrés (D→C, D→B, D→A) avec aides 2026.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition technique de la classe D
            </h2>
            <p className="text-sand-700 mb-6">
              Méthode 3CL-2021 (arrêté du 31 mars 2021) : la pire des deux notes (énergie primaire
              ou émissions CO₂) est retenue. La classe D bénéficie de seuils relativement larges, ce
              qui explique pourquoi 30 % du parc s’y concentre.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {SEUILS_D.map((s) => (
                <div
                  key={s.indicateur}
                  className="bg-white border-2 border-yellow-100 rounded-xl p-5 shadow-sm"
                >
                  <p className="font-semibold text-yellow-700 text-sm uppercase tracking-wide">
                    {s.indicateur}
                  </p>
                  <p className="font-heading text-2xl font-bold text-sand-900 mt-2 mb-3">
                    {s.seuil}
                  </p>
                  <p className="text-sm text-sand-600 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              3 sauts de classe pour optimiser un D
            </h2>
            <p className="text-sand-700 mb-6">
              Coûts indicatifs HT pour 100 m² SHAB hors zone tendue. Aides moyennes pour ménage
              modeste (MaPrimeRénov’ + CEE). PAS de bonus passoire (réservé F/G).
            </p>
            <div className="space-y-4">
              {SAUTS_D.map((s) => (
                <div
                  key={s.saut}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="font-heading text-2xl font-bold text-accent-700 shrink-0">
                      {s.saut}
                    </div>
                    <div className="flex-1 min-w-[280px]">
                      <p className="text-sand-700 leading-relaxed mb-3">
                        <strong>Travaux : </strong>
                        {s.travaux}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Coût HT</p>
                          <p className="font-semibold text-sand-900">{s.cout}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Aides</p>
                          <p className="font-semibold text-accent-700">{s.aides}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Reste à charge</p>
                          <p className="font-semibold text-sand-900">{s.reste}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Rentabilité</p>
                          <p className="font-semibold text-sand-700 text-xs leading-snug">
                            {s.rentabilite}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-sand-600 mt-3 border-t border-sand-100 pt-3">
                        <Leaf className="inline w-4 h-4 text-accent-600 mr-1" aria-hidden />
                        {s.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10 bg-accent-50 border-2 border-accent-200 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-accent-900 mb-3">
              <Calculator className="inline w-5 h-5 mr-2" aria-hidden />
              Estimer mes aides en 2 minutes
            </h2>
            <p className="text-sm text-accent-800 mb-4 leading-relaxed">
              Le simulateur officiel France Rénov’ calcule MaPrimeRénov’ + CEE + éco-PTZ selon votre
              revenu fiscal et la classe DPE de départ.
            </p>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 bg-accent-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-800 transition-colors"
            >
              Simulateur aides
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <SimulateurAideBox
            serviceKey="isolation"
            estimatedSaving={6500}
            title="Améliorer mon DPE : aides 2026"
            subtitle="MaPrimeRénov' par geste + CEE + Éco-PTZ — gain 1-2 classes"
          />

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {[
                {
                  label: 'Hub Classes DPE A à G',
                  href: '/renovation-energetique/diagnostic/dpe/classes',
                },
                {
                  label: 'DPE classe C — performant',
                  href: '/renovation-energetique/diagnostic/dpe/classes/c',
                },
                {
                  label: 'DPE classe E — interdiction 2034',
                  href: '/renovation-energetique/diagnostic/dpe/classes/e',
                },
                {
                  label: 'Pompe à chaleur — guide complet',
                  href: '/renovation-energetique/travaux/pompe-a-chaleur',
                },
                {
                  label: 'Isolation combles — prix et aides',
                  href: '/renovation-energetique/travaux/isolation/combles',
                },
                {
                  label: 'MaPrimeRénov’ 2026',
                  href: '/renovation-energetique/aides/maprimerenov-2026',
                },
              ].map((g) => (
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
        </article>
      </main>
    </>
  )
}
