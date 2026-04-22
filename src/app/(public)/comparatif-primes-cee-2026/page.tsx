import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Euro,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Building2,
  AlertTriangle,
  FileCheck2,
  Star,
} from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'
import { ArticleMeta } from '@/components/ArticleMeta'

export const revalidate = 86400

const path = '/comparatif-primes-cee-2026'

export const metadata: Metadata = {
  title: 'Primes CEE 2026 : Effy, Hellio, Sonergia',
  description:
    'Comparatif indépendant des 4 principaux acteurs CEE en 2026 : montants, délais de paiement, avis clients, modèle économique. Données vérifiées avril 2026.',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Comparatif primes CEE 2026 : qui offre la meilleure prime ?',
    description:
      'Effy, Hellio, Sonergia, PrimesEnergie : montants, délais, avis clients. Le comparatif que personne ne publie.',
    type: 'article',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
    siteName: 'ServicesArtisans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparatif primes CEE 2026',
    description:
      'Effy vs Hellio vs Sonergia vs PrimesEnergie : qui verse le plus ? Qui paie le plus vite ?',
  },
  alternates: getAlternates(path),
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const ACTORS = [
  {
    name: 'Effy',
    type: 'Mandataire CEE',
    ca: '> 800 M€ (2021)',
    delaiPaiement: '15 jours annoncés (3+ mois signalés)',
    avisNote: '4.4/5',
    avisSource: 'Trustpilot',
    primeMax: "Jusqu'à 5 560 € (Prime Effy)",
    forces: [
      '18-20M visites/an (SEO dominant)',
      'Réseau de 2 200 artisans RGE',
      'Simulateur instantané',
      'Cumul MaPrimeRénov’ intégré',
    ],
    faiblesses: [
      'Leads partagés entre artisans',
      'Refus de dossiers pour motifs mineurs',
      'SAV difficilement joignable',
      'Artisan = sous-traitant anonyme',
    ],
  },
  {
    name: 'Hellio',
    type: 'Délégataire P6',
    ca: '~169 M€, 300+ salariés',
    delaiPaiement: 'Non communiqué publiquement',
    avisNote: 'Variable',
    avisSource: 'Avis Pro',
    primeMax: 'Variable selon opération',
    forces: [
      'Délégataire direct (pas intermédiaire)',
      'Avance de trésorerie aux artisans',
      'Multi-segment (copro, tertiaire, logement social)',
      'Expansion EU (Espagne, Belgique)',
    ],
    faiblesses: [
      'Structure lourde (300 salariés)',
      'Lock-in artisan dans leur réseau',
      'Rachat en cours par Crédit Mutuel (2026)',
      'Leads partagés',
    ],
  },
  {
    name: 'Sonergia',
    type: 'Délégataire P5/P6',
    ca: '~100 M€',
    delaiPaiement: '6 à 10 mois signalés',
    avisNote: '4.0/5',
    avisSource: 'Avis Vérifiés',
    primeMax: 'Variable + Coup de Pouce bonifié',
    forces: [
      'Société à mission (confiance)',
      'Double casquette CEE + MaPrimeRénov’',
      'Contenu éditorial SEO solide',
      'Indépendant (pas filiale grand groupe)',
    ],
    faiblesses: [
      'Délais de paiement très longs',
      'Promesses de montants non tenues (certains avis)',
      'Pas de marketplace artisan visible',
      'Complexité administrative signalée',
    ],
  },
  {
    name: 'PrimesEnergie',
    type: 'Délégataire P6 (depuis 2026)',
    ca: 'Non communiqué',
    delaiPaiement: '40 jours annoncés (2+ mois signalés)',
    avisNote: '5.0/5',
    avisSource: 'Avis Vérifiés (5 734 avis)',
    primeMax: 'Parmi les plus élevées du marché',
    forces: [
      'Note exceptionnelle (5.0/5)',
      'Primes parmi les plus élevées',
      'Processus 100 % en ligne',
      'Contenu SEO dense et pédagogique',
    ],
    faiblesses: [
      'SAV injoignable (répondeur)',
      'Dossiers bloqués 2+ mois sans réponse',
      'Lourdeur administrative (allers-retours)',
      'Pas de marketplace artisan visible',
    ],
  },
]

const KEY_OPERATIONS = [
  {
    code: 'BAR-TH-171',
    nom: 'PAC air/eau',
    primeClassique: '2 500 à 4 000 €',
    primePrecarite: '4 000 à 5 500 €',
  },
  {
    code: 'BAR-EN-101',
    nom: 'Isolation combles',
    primeClassique: '900 à 1 800 €',
    primePrecarite: '1 600 à 2 700 €',
  },
  {
    code: 'BAR-TH-113',
    nom: 'Chaudière biomasse',
    primeClassique: '2 500 à 4 000 €',
    primePrecarite: '4 000 à 5 500 €',
  },
  {
    code: 'BAR-TH-112',
    nom: 'Poêle bois/granulés',
    primeClassique: '800 à 1 500 €',
    primePrecarite: '1 500 à 2 000 €',
  },
  {
    code: 'BAR-EN-103',
    nom: 'Isolation planchers bas',
    primeClassique: '900 à 1 800 €',
    primePrecarite: '1 600 à 2 700 €',
  },
  {
    code: 'BAR-EN-102',
    nom: 'Isolation murs',
    primeClassique: '1 200 à 2 500 €',
    primePrecarite: '2 000 à 3 700 €',
  },
]

const FAQS = [
  {
    question: 'Les montants de primes CEE sont-ils les mêmes chez tous les acteurs\u00a0?',
    answer:
      'Non. Chaque délégataire ou mandataire négocie ses propres barèmes avec les obligés. Les écarts peuvent atteindre 20 à 30 % sur une même opération. C’est pourquoi il est important de comparer avant de s’engager. Les montants affichés sur les sites sont souvent des fourchettes hautes (cas précarité énergétique, zone H1).',
  },
  {
    question: 'Peut-on cumuler prime CEE et MaPrimeRénov’\u00a0?',
    answer:
      'Oui, les deux dispositifs sont cumulables depuis 2020. La prime CEE est versée par le délégataire/mandataire, MaPrimeRénov’ est versée par l’ANAH. Le cumul peut couvrir 80 à 90 % du coût des travaux pour les ménages modestes.',
  },
  {
    question: 'Quels sont les délais réels de paiement des primes CEE\u00a0?',
    answer:
      'Les délais annoncés (15 jours chez Effy, 40 jours chez PrimesEnergie) sont des minima. En pratique, les retours terrain font état de délais de 2 à 6 mois, parfois plus en cas de dossier incomplet ou de pic de demandes. Sonergia est régulièrement critiqué pour des délais de 6 à 10 mois.',
  },
  {
    question: 'Quelle est la différence entre un délégataire et un mandataire CEE\u00a0?',
    answer:
      'Le délégataire reçoit une délégation d’obligation d’un obligé (EDF, TotalEnergies...) et porte le risque réglementaire. Le mandataire agit pour le compte d’un délégataire : il source les chantiers, monte les dossiers et les dépose au PNCEE. Effy est mandataire, Hellio et Sonergia sont délégataires.',
  },
  {
    question: 'Les primes CEE changent-elles en 2026 avec la P6\u00a0?',
    answer:
      'Oui. La 6e période (2026-2030) augmente l’obligation de 27 % (1 050 TWhc/an). Cela soutient les prix des CEE et donc les montants des primes. En revanche, certaines opérations ont été modifiées ou abrogées (BAR-TH-104 remplacée par BAR-TH-171, BAR-TH-164 remplacée par BAR-TH-174/175).',
  },
  {
    question: 'Comment éviter les arnaques aux primes CEE\u00a0?',
    answer:
      'Ne signez jamais un engagement CEE avant d’avoir choisi votre artisan. Vérifiez que l’entreprise qui vous propose la prime est bien référencée comme délégataire ou mandataire. Méfiez-vous des démarchages téléphoniques agressifs promettant des travaux à 1 € (dispositif terminé depuis 2022). Vérifiez que votre artisan est bien qualifié RGE sur france-renov.gouv.fr.',
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ComparatifPrimesCee2026Page() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: 'Comparatif 2026', url: path },
  ])

  const faqSchema = getFAQSchema(FAQS)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    image: `${SITE_URL}/opengraph-image`,
    headline: 'Comparatif primes CEE 2026 : Effy, Hellio, Sonergia, PrimesEnergie',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ServicesArtisans' },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
    datePublished: '2026-04-12',
    dateModified: '2026-04-12',
    description: 'Comparatif indépendant des 4 principaux acteurs CEE en 2026.',
  }

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: "Certificats d'Économies d'Énergie (CEE) — Période 6 (2026-2030)",
    description:
      "Dispositif obligatoire créé par la loi POPE de 2005, codifié aux articles L221-1 à L221-12 du code de l'énergie. Les vendeurs d'énergie (obligés) doivent justifier d'un volume de CEE sous peine de pénalité libératoire versée au Trésor public. La 6e période (P6) couvre le 1er janvier 2026 au 31 décembre 2030 avec une obligation de 1 050 TWhc/an dont 280 TWhc de précarité énergétique.",
    url: `${SITE_URL}${path}`,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience:
      'Propriétaires et locataires de logements résidentiels, copropriétés, bailleurs sociaux, entreprises et collectivités',
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
      "Prime versée au bénéficiaire final pour les travaux d'économies d'énergie éligibles aux opérations standardisées (BAR-TH, BAR-EN). Le montant n'est pas réglementé en euros depuis 2022 — chaque délégataire ou obligé fixe son barème sur la base du cours du MWh cumac, de la zone climatique (H1/H2/H3) et du profil du ménage (classique ou précarité énergétique).",
    url: `${SITE_URL}${path}`,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Prime versée par l'obligé ou le délégataire, financée par les vendeurs d'énergie dans le cadre de leur obligation triennale. Pas de frais facturés au bénéficiaire pour l'instruction du dossier CEE standard. Cumulable avec MaPrimeRénov', TVA 5,5 % et éco-PTZ dans la limite de 100 % du coût TTC des travaux.",
  })

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={governmentServiceSchema} />
      <JsonLd data={financialProductSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb items={[{ label: 'Primes CEE', href: '/cee' }, { label: 'Comparatif 2026' }]} />

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-emerald-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Comparatif — Période 6 (2026-2030)
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Comparatif primes CEE 2026&nbsp;: qui verse le plus&nbsp;? Qui paie le plus vite&nbsp;?
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished="2026-04-12"
            dateModified="2026-04-12"
            className="justify-center mt-4"
          />
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Analyse indépendante des 4 principaux acteurs du marché CEE en France. Montants, délais
            de paiement, avis clients, modèle économique. Données vérifiées avril 2026.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CONTEXTE P6                                                  */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <FileCheck2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Qu'est-ce qui change dans le dispositif CEE en P6 (2026-2030) ?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            {
              value: '1 050 TWhc/an',
              label: 'Obligation annuelle (+27 % vs P5)',
              icon: TrendingUp,
            },
            {
              value: '~9 €/MWhc',
              label: 'Cours CEE classique (spot)',
              icon: Euro,
            },
            {
              value: '~16 €/MWhc',
              label: 'Cours CEE précarité (2x plus)',
              icon: Star,
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center"
              >
                <Icon className="w-5 h-5 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
                <div className="font-heading text-2xl font-extrabold text-charcoal-900">
                  {stat.value}
                </div>
                <div className="text-sm text-charcoal-600 mt-1">{stat.label}</div>
              </div>
            )
          })}
        </div>
        <div className="prose prose-slate max-w-none text-charcoal-700 leading-relaxed">
          <p>
            La 6<sup>e</sup> période des CEE a démarré le 1<sup>er</sup> janvier 2026. L’obligation
            annuelle passe à 1 050 TWhc, dont 280 TWhc de précarité énergétique. Conséquence
            directe&nbsp;: les délégataires recrutent activement et les primes restent à des niveaux
            élevés.
          </p>
          <p>
            Certaines opérations ont été modifiées&nbsp;: BAR-TH-104 (PAC) remplacée par{' '}
            <Link href="/cee/bar-th-171" className="text-emerald-700 font-semibold">
              BAR-TH-171
            </Link>
            , BAR-TH-164 remplacée par BAR-TH-174/175 (rénovation d’ampleur avec MAR). Le geste par
            geste isolation seule n’est plus éligible sans rénovation d’ampleur.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FICHES ACTEURS                                               */}
      {/* ============================================================ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Qui sont les 4 acteurs majeurs du marché des primes CEE en 2026 ?
            </h2>
          </div>
          <div className="space-y-6">
            {ACTORS.map((actor) => (
              <article
                key={actor.name}
                className="p-6 bg-white rounded-2xl border border-charcoal-200"
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="font-heading font-bold text-xl text-charcoal-900">{actor.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                    {actor.type}
                  </span>
                  <span className="text-sm text-charcoal-500">
                    {actor.avisNote} ({actor.avisSource})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-semibold text-charcoal-700">CA&nbsp;:</span>{' '}
                    <span className="text-charcoal-600">{actor.ca}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal-700">Prime max&nbsp;:</span>{' '}
                    <span className="text-emerald-700 font-semibold">{actor.primeMax}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal-700">Délai paiement&nbsp;:</span>{' '}
                    <span className="text-charcoal-600">{actor.delaiPaiement}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-charcoal-700 text-sm mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Forces
                    </h4>
                    <ul className="space-y-1">
                      {actor.forces.map((f) => (
                        <li key={f} className="text-sm text-charcoal-600 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">&bull;</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal-700 text-sm mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Faiblesses
                    </h4>
                    <ul className="space-y-1">
                      {actor.faiblesses.map((f) => (
                        <li key={f} className="text-sm text-charcoal-500 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">&bull;</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  MONTANTS PAR OPÉRATION                                       */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Euro className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Quels sont les montants indicatifs CEE par opération en 2026 (P6) ?
          </h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand-200 text-charcoal-700">
              <tr>
                <th className="text-left p-4 font-semibold">Opération</th>
                <th className="text-left p-4 font-semibold">Code</th>
                <th className="text-left p-4 font-semibold text-emerald-700">Prime classique</th>
                <th className="text-left p-4 font-semibold text-emerald-700">Prime précarité</th>
              </tr>
            </thead>
            <tbody>
              {KEY_OPERATIONS.map((op) => (
                <tr key={op.code} className="border-t border-charcoal-100">
                  <td className="p-4 font-semibold text-charcoal-900 align-top">
                    <Link
                      href={`/cee/${op.code.toLowerCase()}`}
                      className="hover:text-emerald-700 transition"
                    >
                      {op.nom}
                    </Link>
                  </td>
                  <td className="p-4 align-top">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                      {op.code}
                    </span>
                  </td>
                  <td className="p-4 text-charcoal-700 font-semibold align-top">
                    {op.primeClassique}
                  </td>
                  <td className="p-4 text-emerald-700 font-semibold align-top">
                    {op.primePrecarite}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-charcoal-500 mt-4 italic">
          Fourchettes indicatives. Les montants réels dépendent de la zone climatique (H1/H2/H3), de
          la surface, du type de logement et du délégataire choisi. Utilisez le{' '}
          <Link
            href="/simulateur-aides-renovation"
            className="text-emerald-700 font-semibold hover:underline"
          >
            simulateur de prime CEE
          </Link>{' '}
          pour une estimation personnalisée.
        </p>
      </section>

      {/* Simulateur CTA — post-tableau, avant le hero devis */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-6">
        <SimulateurCTA variant="banner" />
      </div>

      {/* CTA hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <CeeCTA variant="hero" />
      </div>

      {/* ============================================================ */}
      {/*  COMMENT CHOISIR                                              */}
      {/* ============================================================ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Comment bien choisir son acteur CEE&nbsp;?
            </h2>
          </div>
          <div className="prose prose-slate max-w-none text-charcoal-700 leading-relaxed">
            <p>
              <strong>1. Comparez les montants réels, pas les montants affichés.</strong> Les sites
              affichent les fourchettes hautes (précarité, zone H1, grande surface). Demandez un
              devis personnalisé avec votre situation exacte.
            </p>
            <p>
              <strong>2. Vérifiez les délais de paiement réels.</strong> Lisez les avis récents (pas
              ceux d’il y a 3 ans) sur Trustpilot et Avis Vérifiés. Cherchez spécifiquement les
              retours sur les délais.
            </p>
            <p>
              <strong>3. Ne signez pas avant d’avoir choisi votre artisan.</strong> La règle CEE
              impose que le dossier soit constitué AVANT le début des travaux. Si vous signez un
              engagement CEE avec un acteur, puis changez d’artisan, le dossier peut être invalidé.
            </p>
            <p>
              <strong>4. Vérifiez le cumul MaPrimeRénov’.</strong> Certains acteurs gèrent les deux
              (Effy, Hellio). D’autres ne font que le CEE. Le cumul peut représenter 80 à 90 % du
              coût des travaux pour les ménages modestes.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group p-5 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition"
            >
              <summary className="font-heading font-bold text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-3">
                <span>{faq.question}</span>
                <span className="text-emerald-600 text-xl font-extrabold group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-charcoal-700 mt-3 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA FINAL                                                    */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Estimez votre prime CEE en 2 minutes
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Simulateur gratuit, sans engagement. Comparez les montants et trouvez un artisan RGE
            qualifié près de chez vous.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Simuler ma prime
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/devenir-partenaire-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Artisan RGE ? Rejoignez-nous
            </Link>
            <Link
              href="/cee/mandataire-vs-direct"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Obligé vs délégataire vs mandataire
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
