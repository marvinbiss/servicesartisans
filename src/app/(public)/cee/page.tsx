import type { Metadata } from 'next'
import Link from 'next/link'
import CeeCTA from '@/components/cee/CeeCTA'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import {
  ShieldCheck,
  Home,
  Flame,
  Droplet,
  Wind,
  Settings,
  Zap,
  Package,
  ArrowRight,
  FileCheck2,
  Percent,
  BookOpen,
  TrendingUp,
  Users,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'
import {
  getCeeOperationsByDomaine,
  CEE_DOMAINE_ORDER,
  CEE_DOMAINE_LABELS,
  type CeeDomaine,
  type CeeOperation,
} from '@/lib/cee/catalogue'
import { CEE_CATALOG_UPDATED_AT } from '@/lib/cee/operation-guides-content'
import LastUpdated from '@/components/seo/LastUpdated'

export const revalidate = 86400

const PAGE_PATH = '/cee'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`

const DOMAINE_ICONS: Record<CeeDomaine, React.ComponentType<{ className?: string }>> = {
  enveloppe: Home,
  chauffage: Flame,
  ecs: Droplet,
  ventilation: Wind,
  services: Settings,
  eclairage: Zap,
  autre: Package,
}

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Qu’est-ce qu’une prime CEE exactement\u00a0?',
    answer:
      'Les Certificats d’\u00c9conomies d’\u00c9nergie (CEE) sont un dispositif obligatoire cré\u00e9 par la loi POPE de 2005. L’\u00c9tat impose aux vendeurs d’\u00e9nergie (EDF, Engie, TotalEnergies, Auchan, Leclerc…) de financer des travaux d’\u00e9conomies d’\u00e9nergie chez les particuliers et les entreprises. En contrepartie, ces obligés collectent des certificats (kWh cumac) qu’ils déposent au PNCEE. La prime CEE que vous recevez correspond au rachat de votre gain énergétique par un obligé ou un délégataire. La période P6 a démarré le 1er janvier 2026 avec une obligation annuelle de 1050 TWhc dont 280 TWhc réservés au segment précarité énergétique.',
  },
  {
    question: 'Prime CEE et MaPrimeRénov’ : peut-on cumuler les deux\u00a0?',
    answer:
      'Oui, c’est même la règle. La prime CEE est un dispositif privé (financement obligataire) tandis que MaPrimeRénov’ est une aide publique de l’Anah. Les deux sont cumulables sans plafond spécifique, à condition que le total des aides ne dépasse pas 100 % du coût TTC des travaux — plafond atteint uniquement dans quelques cas de ménages très modestes sur des opérations fortement bonifiées. S’ajoutent aussi la TVA réduite à 5,5 %, l’\u00e9co-PTZ jusqu’\u00e0 50 000 € et d’\u00e9ventuelles aides locales. La règle d’or : l’entreprise doit être RGE à la signature du devis.',
  },
  {
    question: 'Quelles sont les opérations CEE les plus rentables\u00a0?',
    answer:
      'Les opérations "Coup de pouce" sont historiquement celles qui affichent le meilleur rapport travaux/prime. En 2026, les chartes "Coup de pouce Chauffage" (remplacement de chaudière fioul/gaz par une pompe à chaleur ou une chaudière biomasse) et "Coup de pouce Isolation" (combles perdus, planchers bas) sont les plus mobilisées. La fiche BAR-TH-174 (rénovation d’ampleur d’une maison individuelle), qui remplace depuis 2024 l’ancienne BAR-TH-164 abrogée, est également un levier majeur car elle cumule les gains de plusieurs postes. En précarité énergétique, les cours de prime sont environ deux fois supérieurs à ceux du segment classique.',
  },
  {
    question: 'Mon artisan doit-il être RGE pour obtenir une prime CEE\u00a0?',
    answer:
      'Oui, sans exception depuis 2020 pour la quasi-totalité des opérations standardisées résidentielles. La qualification RGE (Reconnu Garant de l’Environnement) doit être en cours de validité à la date de signature du devis (et non au démarrage du chantier). Elle est délivrée par un organisme accrédité COFRAC : Qualibat, Qualit’EnR, Qualifelec, Certibat ou OPQIBI. Chaque fiche d’opération standardisée précise la ou les qualifications acceptées — par exemple Qualibat-7141/7143 pour l’isolation de toiture, QualiPAC pour les pompes à chaleur, QualiBois pour les poêles et chaudières bois.',
  },
  {
    question: 'Combien de temps prend le versement d’une prime CEE\u00a0?',
    answer:
      'Le délai standard est de 4 à 12 semaines après la réception du dossier complet par le délégataire obligé. Le dossier doit contenir : la facture de travaux acquittée, l’attestation sur l’honneur signée, les photos avant/après chantier géotaggées et horodatées (obligatoires depuis la loi du 30 juin 2025), et l’avis d’imposition N-2 pour le segment précarité. La durée varie fortement selon l’obligé choisi : les acteurs spécialisés CEE (Effy, Sonergia) sont historiquement plus rapides que les obligés généralistes. C’est un critère de choix à prendre en compte.',
  },
  {
    question: 'Puis-je obtenir une prime CEE sans passer par un mandataire\u00a0?',
    answer:
      'Oui, c’est même la voie historique : vous pouvez déposer votre dossier directement auprès d’un délégataire obligé (Effy, Sonergia, TotalEnergies…) ou de votre fournisseur d’\u00e9nergie. Le passage par un mandataire CEE tiers s’avère utile quand vous voulez comparer plusieurs obligés, mutualiser plusieurs opérations sur un même chantier, ou sécuriser la conformité réglementaire (photos, AH, OCR factures). Dans tous les cas, la prime finale est identique — seul le service d’accompagnement et le délai de versement varient.',
  },
]

export const metadata: Metadata = {
  title: 'Primes CEE 2026 : certificats d’\u00e9conomies d’\u00e9nergie',
  description:
    'Catalogue des 19 opérations CEE résidentielles couvertes. Qualifications RGE requises, cumul MaPrimeRénov’, villes couvertes. Plateforme de rénovation énergétique avec gestion des primes simplifiée.',
  alternates: getAlternates('/cee'),
  openGraph: {
    locale: 'fr_FR',
    title: 'Primes CEE 2026 — Catalogue complet des opérations',
    description:
      'Toutes les primes CEE résidentielles 2026 : isolation, chauffage, ventilation, régulation. Cumul MaPrimeRénov’ possible.',
    url: PAGE_URL,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Primes CEE 2026 : catalogue complet',
    description:
      'Les 19 opérations CEE résidentielles éligibles en 2026. Cumul MaPrimeRénov’, TVA 5,5 %, artisans RGE.',
  },
}

export default async function CeeHubPage() {
  const grouped = await getCeeOperationsByDomaine().catch(
    () =>
      ({
        enveloppe: [],
        chauffage: [],
        ecs: [],
        ventilation: [],
        services: [],
        eclairage: [],
        autre: [],
      }) as Record<CeeDomaine, CeeOperation[]>
  )

  const totalOps = Object.values(grouped).reduce((sum, ops) => sum + ops.length, 0)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: PAGE_PATH },
  ])

  const collectionSchema = getCollectionPageSchema({
    name: 'Primes CEE 2026 : catalogue des opérations standardisées',
    description:
      'Catalogue complet des opérations standardisées CEE résidentielles couvertes par ServicesArtisans, plateforme de rénovation énergétique avec gestion des primes. Période P6 à compter du 1er janvier 2026.',
    url: PAGE_PATH,
    itemCount: totalOps,
  })

  const faqSchema = getFAQSchema(FAQ)

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: "Certificats d'Économies d'Énergie (CEE)",
    description:
      "Dispositif obligatoire créé par la loi POPE de 2005 : les vendeurs d'énergie (EDF, Engie, TotalEnergies) financent des travaux d'économies d'énergie chez les particuliers et entreprises. Période P6 (2026-2030) : 1 050 TWhc/an dont 280 TWhc précarité énergétique.",
    url: PAGE_URL,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: 'Propriétaires et locataires de logements résidentiels en France',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: [
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
      'https://www.service-public.fr/particuliers/vosdroits/F342',
      'https://france-renov.gouv.fr/aides/cee',
    ],
  })

  const financialProductSchema = getFinancialProductSchema({
    name: 'Prime CEE résidentielle',
    description:
      "Prime versée aux particuliers pour les travaux d'économies d'énergie éligibles (isolation, chauffage, ventilation). Montant variable selon l'opération, la zone climatique, le profil de revenus (classique ou précarité) et le cours du MWh cumac.",
    url: PAGE_URL,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Prime versée directement par l'obligé ou le délégataire. Pas de frais à la charge du bénéficiaire. Cumulable avec MaPrimeRénov', TVA 5,5 % et éco-PTZ.",
  })

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <JsonLd data={governmentServiceSchema} />
      <JsonLd data={financialProductSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Primes CEE' }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Période P6 — 1050 TWhc/an dont 280 précarité
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5">
            Primes CEE 2026 : certificats d’économies d’énergie
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl leading-relaxed">
            Catalogue complet des opérations standardisées CEE résidentielles.{' '}
            {totalOps > 0 ? totalOps : 19} fiches DGEC couvertes, cumulables avec MaPrimeRénov’ et
            la TVA réduite à 5,5 %. Versement par les obligés et délégataires (EDF, Engie,
            TotalEnergies, Effy, Sonergia).
          </p>
          {/* Freshness signal — date de révision éditoriale du catalogue CEE
              (barèmes kWh cumac, bonifications précarité, MPR 2026). TODO :
              brancher sur cee_operations.updated_at quand la table DGEC
              automatisée sera en place. */}
          <LastUpdated
            label="Barèmes CEE vérifiés le"
            date={CEE_CATALOG_UPDATED_AT}
            className="mt-5 text-emerald-100/90"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/guides/aides-renovation-2026"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Guide aides 2026
            </Link>
          </div>
        </div>
      </section>

      {/* Simulateur CTA — surface le simulateur unifié au-dessus du catalogue */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <SimulateurCTA variant="card" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {totalOps > 0 ? totalOps : 19}
            </div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Opérations standardisées couvertes, secteur résidentiel. Source DGEC — arrêtés
              officiels publiés au Journal Officiel.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">1050</div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              TWhc/an d’obligation annuelle sur la période P6 (2026-2030), dont 280 TWhc réservés au
              segment précarité énergétique.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">5</div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Obligés (EDF, Engie, TotalEnergies) et délégataires (Effy, Sonergia).
            </div>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="bg-emerald-50/60 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-start gap-3">
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">Cumul MaPrimeRénov’</div>
              <div className="text-sm text-charcoal-600">
                La prime CEE se cumule avec l’aide Anah sans plafond spécifique.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Percent className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold text-charcoal-900">TVA à 5,5 %</div>
              <div className="text-sm text-charcoal-600">
                Taux réduit automatique sur main-d’&oelig;uvre et matériaux énergétiques.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">Artisans RGE vérifiés</div>
              <div className="text-sm text-charcoal-600">
                Synchronisation hebdomadaire du référentiel ADEME France Rénov’.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <CeeCTA variant="hero" />
      </div>

      {/* Catalogue par domaine */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
          Les 19 opérations CEE résidentielles 2026
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-10 leading-relaxed">
          Chaque fiche d’opération standardisée est identifiée par un code officiel (ex. BAR-EN-101)
          qui en définit les critères techniques. Cliquez sur une opération pour accéder aux
          conditions détaillées et aux artisans RGE qualifiés, ville par ville.
        </p>

        <div className="space-y-10">
          {CEE_DOMAINE_ORDER.map((domaine) => {
            const ops = grouped[domaine]
            if (!ops || ops.length === 0) return null
            const info = CEE_DOMAINE_LABELS[domaine]
            const Icon = DOMAINE_ICONS[domaine]
            return (
              <div key={domaine}>
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900">
                      {info.label}
                    </h3>
                    <p className="text-sm text-charcoal-600 mt-1">{info.tagline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ops.map((op) => (
                    <Link
                      key={op.code}
                      href={`/cee/${op.code.toLowerCase()}`}
                      className="group block p-5 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-md transition"
                    >
                      <div className="text-xs font-semibold text-emerald-700">{op.code}</div>
                      <div className="font-bold text-charcoal-900 mt-1 group-hover:text-emerald-700 transition">
                        {op.nom}
                      </div>
                      {op.coup_de_pouce && (
                        <div className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          Coup de pouce
                        </div>
                      )}
                      <div className="text-sm font-semibold text-emerald-700 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Détails <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Étapes */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-10">
            Comment obtenir une prime CEE&nbsp;?
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                n: 1,
                title: 'Qualifier le projet',
                text: 'Identifiez la fiche d’opération qui correspond à vos travaux (isolation, chauffage, ventilation, régulation). Le catalogue ci-dessus liste les 19 fiches résidentielles couvertes.',
              },
              {
                n: 2,
                title: 'Choisir un artisan RGE',
                text: 'La qualification RGE de l’entreprise doit être active à la signature du devis. Utilisez nos pages ville pour trouver les artisans qualifiés et vérifiés.',
              },
              {
                n: 3,
                title: 'Signer le devis + AH',
                text: 'Le devis et l’attestation sur l’honneur doivent être signés avant le début des travaux. C’est cette date qui fige le cours de la prime.',
              },
              {
                n: 4,
                title: 'Déposer le dossier',
                text: 'Après les travaux, réunissez factures, photos géotaggées et justificatifs puis déposez le dossier auprès du délégataire. Versement 4 à 12 semaines.',
              },
            ].map((step) => (
              <li key={step.n} className="bg-white rounded-xl border border-charcoal-200 p-5">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mb-3">
                  {step.n}
                </div>
                <div className="font-bold text-charcoal-900 mb-1">{step.title}</div>
                <p className="text-sm text-charcoal-600 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-10">
          Questions fréquentes sur les primes CEE
        </h2>
        <div className="space-y-4">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-300 transition p-6"
            >
              <summary className="font-heading font-bold text-lg text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-emerald-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-charcoal-700 mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Comprendre le circuit CEE — liens vers pages satellites éditoriales */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Comprendre le circuit CEE
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
            Trois décisions structurantes avant de lancer un projet&nbsp;: choisir entre mandataire
            et dépôt direct, profiter des bonifications Coup de pouce 2026, et orchestrer le cumul
            avec MaPrimeRénov’.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/cee/coup-de-pouce-2026"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Coup de pouce CEE 2026
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Bonifications CEE en vigueur&nbsp;: chauffage biomasse, rénovation globale,
                précarité énergétique. Montants majorés.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir les bonifications <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/cee/mandataire-vs-direct"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <FileCheck2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Mandataire CEE ou dépôt direct&nbsp;?
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Comparatif des deux circuits de valorisation&nbsp;: délais, garanties, cas d’usage.
                Montant de la prime identique.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Comparer les circuits <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/maprimerenov-cumulaison-cee"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Percent className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Règles de cumul MaPrimeRénov’ &amp; CEE 2026
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Plafonds par profil de revenus, ordre des aides, pièges à éviter et simulateur des
                aides cumulables.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Lire les règles de cumul <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/comparatif-primes-cee-2026"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Comparatif primes CEE 2026
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Effy, Hellio, Sonergia, PrimesEnergie&nbsp;: montants, délais de paiement, avis
                clients, forces et faiblesses.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir le comparatif <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/devenir-partenaire-cee"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Devenir partenaire CEE
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Programme partenaire pour artisans RGE&nbsp;: leads exclusifs, gestion des primes,
                accompagnement technique.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Rejoindre le programme <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href="/leads-exclusifs-vs-partages"
              className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                Leads exclusifs vs partagés
              </div>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Pourquoi les leads exclusifs convertissent 3x plus&nbsp;: coûts, taux de conversion,
                comparatif des plateformes.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Lire le comparatif <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Ressources complémentaires — cross-linking RGE / Qualifications / ADEME */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
          Comprendre l’écosystème RGE
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
          Toute prime CEE nécessite un artisan RGE qualifié. Découvrez les métiers concernés, les
          qualifications officielles et la source des données que nous vérifions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/rge"
            className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
              Annuaire artisans RGE
            </div>
            <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              14 métiers énergétiques (PAC, ITI, PV, poêle bois…) et 500+ villes couvertes avec
              qualifications actives.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Explorer l’annuaire <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/rge/qualifications"
            className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
              Qualifications RGE officielles
            </div>
            <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              QualiPAC, QualiSol, QualiBois Air/Eau, Qualifelec&nbsp;: ce que couvre chaque
              qualification et comment la vérifier.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lire les guides <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/ademe"
            className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <Percent className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div className="font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
              Source officielle ADEME
            </div>
            <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              165&nbsp;000 qualifications synchronisées chaque semaine avec France Rénov’.
              Méthodologie transparente.
            </p>
            <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Voir la méthodologie <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* CTA inline */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <CeeCTA variant="inline" />
      </div>

      {/* CTAs finaux */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">
            Lancez votre projet avec une prime CEE sécurisée
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Demandez un devis gratuit, vérifiez la qualification d’un artisan, ou approfondissez le
            sujet avec nos guides dédiés.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Vérifier un artisan
            </Link>
            <Link
              href="/guides/aides-renovation-2026"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Guide aides 2026
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky CTA mobile — simulateur aides rénovation */}
      <SimulateurCTA variant="sticky-bottom" />
    </>
  )
}
