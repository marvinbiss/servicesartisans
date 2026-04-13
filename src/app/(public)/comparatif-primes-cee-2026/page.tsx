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
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const path = '/comparatif-primes-cee-2026'

export const metadata: Metadata = {
  title: 'Comparatif primes CEE 2026 : Effy, Hellio, Sonergia, PrimesEnergie',
  description:
    'Comparatif ind\u00e9pendant des 4 principaux acteurs CEE en 2026 : montants, d\u00e9lais de paiement, avis clients, mod\u00e8le \u00e9conomique. Donn\u00e9es v\u00e9rifi\u00e9es avril 2026.',
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
      'Effy, Hellio, Sonergia, PrimesEnergie : montants, d\u00e9lais, avis clients. Le comparatif que personne ne publie.',
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
    ca: '> 800 M\u20ac (2021)',
    delaiPaiement: '15 jours annonc\u00e9s (3+ mois signal\u00e9s)',
    avisNote: '4.4/5',
    avisSource: 'Trustpilot',
    primeMax: "Jusqu'\u00e0 5 560 \u20ac (Prime Effy)",
    forces: [
      '18-20M visites/an (SEO dominant)',
      'R\u00e9seau de 2 200 artisans RGE',
      'Simulateur instantan\u00e9',
      'Cumul MaPrimeR\u00e9nov\u2019 int\u00e9gr\u00e9',
    ],
    faiblesses: [
      'Leads partag\u00e9s entre artisans',
      'Refus de dossiers pour motifs mineurs',
      'SAV difficilement joignable',
      'Artisan = sous-traitant anonyme',
    ],
  },
  {
    name: 'Hellio',
    type: 'D\u00e9l\u00e9gataire P6',
    ca: '~169 M\u20ac, 300+ salari\u00e9s',
    delaiPaiement: 'Non communiqu\u00e9 publiquement',
    avisNote: 'Variable',
    avisSource: 'Avis Pro',
    primeMax: 'Variable selon op\u00e9ration',
    forces: [
      'D\u00e9l\u00e9gataire direct (pas interm\u00e9diaire)',
      'Avance de tr\u00e9sorerie aux artisans',
      'Multi-segment (copro, tertiaire, logement social)',
      'Expansion EU (Espagne, Belgique)',
    ],
    faiblesses: [
      'Structure lourde (300 salari\u00e9s)',
      'Lock-in artisan dans leur r\u00e9seau',
      'Rachat en cours par Cr\u00e9dit Mutuel (2026)',
      'Leads partag\u00e9s',
    ],
  },
  {
    name: 'Sonergia',
    type: 'D\u00e9l\u00e9gataire P5/P6',
    ca: '~100 M\u20ac',
    delaiPaiement: '6 \u00e0 10 mois signal\u00e9s',
    avisNote: '4.0/5',
    avisSource: 'Avis V\u00e9rifi\u00e9s',
    primeMax: 'Variable + Coup de Pouce bonifi\u00e9',
    forces: [
      'Soci\u00e9t\u00e9 \u00e0 mission (confiance)',
      'Double casquette CEE + MaPrimeR\u00e9nov\u2019',
      'Contenu \u00e9ditorial SEO solide',
      'Ind\u00e9pendant (pas filiale grand groupe)',
    ],
    faiblesses: [
      'D\u00e9lais de paiement tr\u00e8s longs',
      'Promesses de montants non tenues (certains avis)',
      'Pas de marketplace artisan visible',
      'Complexit\u00e9 administrative signal\u00e9e',
    ],
  },
  {
    name: 'PrimesEnergie',
    type: 'D\u00e9l\u00e9gataire P6 (depuis 2026)',
    ca: 'Non communiqu\u00e9',
    delaiPaiement: '40 jours annonc\u00e9s (2+ mois signal\u00e9s)',
    avisNote: '5.0/5',
    avisSource: 'Avis V\u00e9rifi\u00e9s (5 734 avis)',
    primeMax: 'Parmi les plus \u00e9lev\u00e9es du march\u00e9',
    forces: [
      'Note exceptionnelle (5.0/5)',
      'Primes parmi les plus \u00e9lev\u00e9es',
      'Processus 100 % en ligne',
      'Contenu SEO dense et p\u00e9dagogique',
    ],
    faiblesses: [
      'SAV injoignable (r\u00e9pondeur)',
      'Dossiers bloqu\u00e9s 2+ mois sans r\u00e9ponse',
      'Lourdeur administrative (allers-retours)',
      'Pas de marketplace artisan visible',
    ],
  },
]

const KEY_OPERATIONS = [
  {
    code: 'BAR-TH-171',
    nom: 'PAC air/eau',
    primeClassique: '2 500 \u00e0 4 000 \u20ac',
    primePrecarite: '4 000 \u00e0 5 500 \u20ac',
  },
  {
    code: 'BAR-EN-101',
    nom: 'Isolation combles',
    primeClassique: '900 \u00e0 1 800 \u20ac',
    primePrecarite: '1 600 \u00e0 2 700 \u20ac',
  },
  {
    code: 'BAR-TH-113',
    nom: 'Chaudi\u00e8re biomasse',
    primeClassique: '2 500 \u00e0 4 000 \u20ac',
    primePrecarite: '4 000 \u00e0 5 500 \u20ac',
  },
  {
    code: 'BAR-TH-112',
    nom: 'Po\u00eale bois/granul\u00e9s',
    primeClassique: '800 \u00e0 1 500 \u20ac',
    primePrecarite: '1 500 \u00e0 2 000 \u20ac',
  },
  {
    code: 'BAR-EN-103',
    nom: 'Isolation planchers bas',
    primeClassique: '900 \u00e0 1 800 \u20ac',
    primePrecarite: '1 600 \u00e0 2 700 \u20ac',
  },
  {
    code: 'BAR-EN-102',
    nom: 'Isolation murs',
    primeClassique: '1 200 \u00e0 2 500 \u20ac',
    primePrecarite: '2 000 \u00e0 3 700 \u20ac',
  },
]

const FAQS = [
  {
    question: 'Les montants de primes CEE sont-ils les m\u00eames chez tous les acteurs\u00a0?',
    answer:
      'Non. Chaque d\u00e9l\u00e9gataire ou mandataire n\u00e9gocie ses propres barèmes avec les oblig\u00e9s. Les \u00e9carts peuvent atteindre 20 \u00e0 30 % sur une m\u00eame op\u00e9ration. C\u2019est pourquoi il est important de comparer avant de s\u2019engager. Les montants affich\u00e9s sur les sites sont souvent des fourchettes hautes (cas pr\u00e9carit\u00e9 \u00e9nerg\u00e9tique, zone H1).',
  },
  {
    question: 'Peut-on cumuler prime CEE et MaPrimeR\u00e9nov\u2019\u00a0?',
    answer:
      'Oui, les deux dispositifs sont cumulables depuis 2020. La prime CEE est vers\u00e9e par le d\u00e9l\u00e9gataire/mandataire, MaPrimeR\u00e9nov\u2019 est vers\u00e9e par l\u2019ANAH. Le cumul peut couvrir 80 \u00e0 90 % du co\u00fbt des travaux pour les m\u00e9nages modestes.',
  },
  {
    question: 'Quels sont les d\u00e9lais r\u00e9els de paiement des primes CEE\u00a0?',
    answer:
      'Les d\u00e9lais annonc\u00e9s (15 jours chez Effy, 40 jours chez PrimesEnergie) sont des minima. En pratique, les retours terrain font \u00e9tat de d\u00e9lais de 2 \u00e0 6 mois, parfois plus en cas de dossier incomplet ou de pic de demandes. Sonergia est r\u00e9guli\u00e8rement critiqu\u00e9 pour des d\u00e9lais de 6 \u00e0 10 mois.',
  },
  {
    question:
      'Quelle est la diff\u00e9rence entre un d\u00e9l\u00e9gataire et un mandataire CEE\u00a0?',
    answer:
      'Le d\u00e9l\u00e9gataire re\u00e7oit une d\u00e9l\u00e9gation d\u2019obligation d\u2019un oblig\u00e9 (EDF, TotalEnergies...) et porte le risque r\u00e9glementaire. Le mandataire agit pour le compte d\u2019un d\u00e9l\u00e9gataire : il source les chantiers, monte les dossiers et les d\u00e9pose au PNCEE. Effy est mandataire, Hellio et Sonergia sont d\u00e9l\u00e9gataires.',
  },
  {
    question: 'Les primes CEE changent-elles en 2026 avec la P6\u00a0?',
    answer:
      'Oui. La 6e p\u00e9riode (2026-2030) augmente l\u2019obligation de 27 % (1 050 TWhc/an). Cela soutient les prix des CEE et donc les montants des primes. En revanche, certaines op\u00e9rations ont \u00e9t\u00e9 modifi\u00e9es ou abrog\u00e9es (BAR-TH-104 remplac\u00e9e par BAR-TH-171, BAR-TH-164 remplac\u00e9e par BAR-TH-174/175).',
  },
  {
    question: 'Comment \u00e9viter les arnaques aux primes CEE\u00a0?',
    answer:
      'Ne signez jamais un engagement CEE avant d\u2019avoir choisi votre artisan. V\u00e9rifiez que l\u2019entreprise qui vous propose la prime est bien r\u00e9f\u00e9renc\u00e9e comme d\u00e9l\u00e9gataire ou mandataire. M\u00e9fiez-vous des d\u00e9marchages t\u00e9l\u00e9phoniques agressifs promettant des travaux \u00e0 1 \u20ac (dispositif termin\u00e9 depuis 2022). V\u00e9rifiez que votre artisan est bien qualifi\u00e9 RGE sur france-renov.gouv.fr.',
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
    headline: 'Comparatif primes CEE 2026 : Effy, Hellio, Sonergia, PrimesEnergie',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ServicesArtisans' },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
    datePublished: '2026-04-12',
    dateModified: '2026-04-12',
    description: 'Comparatif ind\u00e9pendant des 4 principaux acteurs CEE en 2026.',
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
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
            Ce qui change en P6 (2026-2030)
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
              value: '~9 \u20ac/MWhc',
              label: 'Cours CEE classique (spot)',
              icon: Euro,
            },
            {
              value: '~16 \u20ac/MWhc',
              label: 'Cours CEE pr\u00e9carit\u00e9 (2x plus)',
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
              Les 4 acteurs majeurs
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
            Montants indicatifs par opération (P6, 2026)
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
            href="/simulateur-prime-cee"
            className="text-emerald-700 font-semibold hover:underline"
          >
            simulateur de prime CEE
          </Link>{' '}
          pour une estimation personnalisée.
        </p>
      </section>

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
              href="/simulateur-prime-cee"
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
