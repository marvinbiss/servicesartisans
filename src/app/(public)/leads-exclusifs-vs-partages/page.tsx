import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Euro,
  Clock,
  TrendingUp,
  Target,
  AlertTriangle,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const path = '/leads-exclusifs-vs-partages'

export const metadata: Metadata = {
  title: 'Leads exclusifs vs leads partagés : comparatif pour artisans du bâtiment',
  description:
    'Comparatif objectif entre leads exclusifs et leads partagés pour les artisans. Coût réel, taux de conversion, ROI. Données Habitatpresto, Travaux.com, Effy.',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Leads exclusifs vs leads partagés : le vrai comparatif artisan',
    description:
      'Quel modèle de leads est le plus rentable pour un artisan du bâtiment ? Chiffres, retours terrain et analyse.',
    type: 'article',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
    siteName: 'ServicesArtisans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leads exclusifs vs leads partagés : comparatif artisan',
    description:
      'Coût réel, taux de conversion, ROI. Le comparatif que les plateformes ne vous montrent pas.',
  },
  alternates: getAlternates(path),
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const COMPARISON_TABLE = [
  {
    criteria: 'Nombre d’artisans par lead',
    exclusif: '1 seul',
    partage: '3 à 10 (parfois plus)',
  },
  {
    criteria: 'Taux de conversion moyen',
    exclusif: '20 à 35 %',
    partage: '5 à 12 %',
  },
  {
    criteria: 'Coût par lead (ordre de grandeur)',
    exclusif: '15 à 50 €',
    partage: '1 à 15 € par lead (mais x5 artisans)',
  },
  {
    criteria: 'Coût par chantier signé (CPA)',
    exclusif: '50 à 150 €',
    partage: '80 à 300 € (leads perdus inclus)',
  },
  {
    criteria: 'Temps passé en rappel prospect',
    exclusif: '1 appel, 0 compétition',
    partage: 'Course au rappel, 3 à 5 appels concurrents',
  },
  {
    criteria: 'Qualité de la relation client',
    exclusif: 'Élevée (premier contact = confiance)',
    partage: 'Dégradée (client déjà sollicité 5 fois)',
  },
  {
    criteria: 'Engagement plateforme',
    exclusif: 'Variable (0 à mensuel)',
    partage: 'Abonnement 70 à 220 €/mois (Habitatpresto)',
  },
]

const PLATFORMS = [
  {
    name: 'Habitatpresto',
    model: 'Leads partagés',
    cost: '70 à 220 €/mois (abonnement)',
    sharing: '5 artisans par lead, puis 5 autres si pas de réponse',
    engagement: '6 à 12 mois',
    rating: '4.1/5 Trustpilot (22 % de 1 étoile)',
    weakness: 'Leads froids, zones inactives, résiliation pénalisée à 50 % du restant',
  },
  {
    name: 'Travaux.com',
    model: 'Leads partagés',
    cost: '1 à 90 € par contact',
    sharing: '3 à 5 artisans (jusqu’\u00e0 10 en zone dense)',
    engagement: 'Au lead',
    rating: '4.0/5 Trustpilot (10 000+ avis)',
    weakness: 'Contacts injoignables, projets fictifs, coût élevé sans garantie',
  },
  {
    name: 'Effy',
    model: 'Leads partagés (réseau partenaire)',
    cost: 'Commission sur prime CEE',
    sharing: 'Plusieurs artisans par zone',
    engagement: 'Contractuel',
    rating: '4.4/5 Trustpilot (plaintes SAV)',
    weakness: 'Artisan = sous-traitant anonyme, pas de relation directe client',
  },
  {
    name: 'ServicesArtisans',
    model: 'Leads exclusifs',
    cost: '0 € (phase de lancement)',
    sharing: '1 artisan par lead, toujours',
    engagement: 'Zéro engagement',
    rating: 'Nouveau (2026)',
    weakness: 'Volume en croissance (phase de lancement)',
  },
]

const FAQS = [
  {
    question: 'Un lead exclusif est-il vraiment plus rentable qu’un lead partagé moins cher\u00a0?',
    answer:
      'Oui, dans la majorité des cas. Un lead partagé à 5 € envoyé à 5 artisans coûte en réalité 25 € au total pour le marché. Avec un taux de conversion de 5 à 12 %, le coût par chantier signé dépasse souvent 200 €. Un lead exclusif à 30 € avec 25 % de conversion coûte 120 € par chantier signé. Le calcul est vite fait.',
  },
  {
    question: 'Pourquoi les plateformes vendent-elles des leads partagés\u00a0?',
    answer:
      'Parce que c’est plus rentable pour la plateforme. Un même lead vendu 5 fois rapporte 5 fois plus qu’un lead exclusif. Le modèle avantage la plateforme, pas l’artisan.',
  },
  {
    question: 'Comment vérifier qu’un lead est vraiment exclusif\u00a0?',
    answer:
      'Demandez la garantie par écrit dans les CGV de la plateforme. Si la plateforme ne s’engage pas contractuellement sur l’exclusivité, c’est qu’elle partage. Chez ServicesArtisans, l’exclusivité est une règle non-négociable inscrite dans nos conditions d’utilisation.',
  },
  {
    question: 'Quel volume de leads exclusifs peut-on espérer par mois\u00a0?',
    answer:
      'Le volume dépend de votre zone géographique, de votre métier et de la demande locale. Un plombier-chauffagiste en zone urbaine reçoit plus de demandes qu’un façadier en zone rurale. L’avantage de l’exclusivité, c’est que chaque lead a une probabilité de conversion 3 à 5 fois supérieure.',
  },
  {
    question: 'Les leads partagés sont-ils totalement à éviter\u00a0?',
    answer:
      'Pas forcément. Pour un artisan qui démarre et a besoin de volume rapidement, les leads partagés peuvent servir de complément. Mais le cœur de l’acquisition devrait reposer sur des leads exclusifs ou du bouche-à-oreille. Les artisans expérimentés qui ont calculé leur coût réel par chantier signé quittent généralement les plateformes de leads partagés.',
  },
  {
    question: 'Quelle différence entre un lead exclusif et un lead qualifié\u00a0?',
    answer:
      'Un lead qualifié a été filtré pour correspondre à vos critères (zone, métier, budget). Un lead exclusif n’est envoyé qu’\u00e0 vous. L’idéal, c’est un lead à la fois qualifié ET exclusif. C’est ce que propose ServicesArtisans : filtrage par métier et zone, envoi à un seul artisan.',
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function LeadsExclusifsVsPartagesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Leads exclusifs vs partagés', url: path },
  ])

  const faqSchema = getFAQSchema(FAQS)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Leads exclusifs vs leads partagés : comparatif pour artisans du bâtiment',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ServicesArtisans' },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
    datePublished: '2026-04-12',
    dateModified: '2026-04-12',
    description:
      'Comparatif objectif entre leads exclusifs et leads partagés. Coût réel, taux de conversion, ROI pour les artisans.',
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb items={[{ label: 'Leads exclusifs vs partagés' }]} />

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-emerald-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Target className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Guide artisan — acquisition clients
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Leads exclusifs vs leads partagés&nbsp;: le vrai coût pour un artisan
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Vous payez des leads. Mais combien vous coûte vraiment un chantier signé&nbsp;?
            Comparatif objectif avec les chiffres réels des principales plateformes.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  LE PROBLÈME DES LEADS PARTAGÉS                               */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Le problème des leads partagés
          </h2>
        </div>
        <div className="prose prose-slate max-w-none text-charcoal-700 leading-relaxed">
          <p>
            Quand une plateforme envoie la même demande de devis à 5 artisans, elle multiplie ses
            revenus par 5. L’artisan, lui, divise ses chances de conversion par 5.
          </p>
          <p>
            Le client reçoit 5 appels en 10 minutes. Il signe avec le premier qui décroche (ou le
            moins cher). Les 4 autres artisans ont perdu leur temps, leur argent, et parfois une
            demi-journée de rendez-vous commercial.
          </p>
          <p>
            <strong>Le coût réel d’un lead partagé n’est pas son prix unitaire.</strong> C’est son
            prix divisé par le taux de conversion réel (5 à 12&nbsp;%), multiplié par le temps perdu
            en rendez-vous non-convertis.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TABLEAU COMPARATIF                                           */}
      {/* ============================================================ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Comparatif chiffré
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-sand-200 text-charcoal-700">
                <tr>
                  <th className="text-left p-4 font-semibold">Critère</th>
                  <th className="text-left p-4 font-semibold text-emerald-700">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      Lead exclusif
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-charcoal-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" aria-hidden="true" />
                      Lead partagé
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_TABLE.map((row) => (
                  <tr key={row.criteria} className="border-t border-charcoal-100">
                    <td className="p-4 font-semibold text-charcoal-900 align-top">
                      {row.criteria}
                    </td>
                    <td className="p-4 text-emerald-700 font-semibold align-top">{row.exclusif}</td>
                    <td className="p-4 text-charcoal-500 align-top">{row.partage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-charcoal-500 mt-4 italic">
            Ordres de grandeur basés sur les retours terrain d’artisans et les données publiques des
            plateformes. Les taux de conversion varient selon le métier, la zone et la saisonnalité.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CALCUL CONCRET                                               */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Euro className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Exemple concret&nbsp;: un plombier-chauffagiste
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scénario leads partagés */}
          <div className="p-6 bg-white rounded-2xl border border-charcoal-200">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
              <h3 className="font-heading font-bold text-lg text-charcoal-900">
                Scénario leads partagés
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-charcoal-700">
              <li className="flex items-start gap-2">
                <span className="text-charcoal-400 mt-0.5">&bull;</span>
                <span>
                  Abonnement Habitatpresto&nbsp;: <strong>144&nbsp;€/mois</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-charcoal-400 mt-0.5">&bull;</span>
                <span>20 leads reçus par mois (partagés à 5)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-charcoal-400 mt-0.5">&bull;</span>
                <span>
                  Taux de conversion&nbsp;: 8&nbsp;% → <strong>1,6 chantier/mois</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-charcoal-400 mt-0.5">&bull;</span>
                <span>
                  Coût par chantier signé&nbsp;: <strong className="text-red-600">90&nbsp;€</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-charcoal-400 mt-0.5">&bull;</span>
                <span>+ temps perdu en rappels concurrentiels sur les 18 leads non-convertis</span>
              </li>
            </ul>
          </div>

          {/* Scénario leads exclusifs */}
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <h3 className="font-heading font-bold text-lg text-charcoal-900">
                Scénario leads exclusifs
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-charcoal-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&bull;</span>
                <span>
                  Coût&nbsp;: <strong>0&nbsp;€/mois</strong> (ServicesArtisans, phase lancement)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&bull;</span>
                <span>8 leads exclusifs par mois (moins de volume, meilleure qualité)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&bull;</span>
                <span>
                  Taux de conversion&nbsp;: 25&nbsp;% → <strong>2 chantiers/mois</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&bull;</span>
                <span>
                  Coût par chantier signé&nbsp;:{' '}
                  <strong className="text-emerald-700">0&nbsp;€</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&bull;</span>
                <span>+ temps libéré pour faire les chantiers (pas de course au rappel)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  COMPARATIF PLATEFORMES                                       */}
      {/* ============================================================ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Comparatif des principales plateformes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLATFORMS.map((p) => (
              <article
                key={p.name}
                className={`p-6 rounded-2xl border ${
                  p.name === 'ServicesArtisans'
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white border-charcoal-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-heading font-bold text-lg text-charcoal-900">{p.name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.model.includes('exclusif')
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-charcoal-100 text-charcoal-600 border border-charcoal-200'
                    }`}
                  >
                    {p.model}
                  </span>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="font-semibold text-charcoal-700 w-28 flex-shrink-0">Coût</dt>
                    <dd className="text-charcoal-600">{p.cost}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-charcoal-700 w-28 flex-shrink-0">Partage</dt>
                    <dd className="text-charcoal-600">{p.sharing}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-charcoal-700 w-28 flex-shrink-0">
                      Engagement
                    </dt>
                    <dd className="text-charcoal-600">{p.engagement}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-charcoal-700 w-28 flex-shrink-0">Note</dt>
                    <dd className="text-charcoal-600">{p.rating}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-charcoal-700 w-28 flex-shrink-0">
                      Faiblesse
                    </dt>
                    <dd className="text-charcoal-500 italic">{p.weakness}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <p className="text-xs text-charcoal-500 mt-4 italic">
            Données collectées en avril 2026 sur les sites officiels, Trustpilot et retours
            d’artisans. Les tarifs et conditions peuvent évoluer.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  COMMENT CHOISIR                                              */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Comment choisir&nbsp;?
          </h2>
        </div>
        <div className="prose prose-slate max-w-none text-charcoal-700 leading-relaxed">
          <p>
            Avant de souscrire à une plateforme de leads, calculez votre{' '}
            <strong>coût réel par chantier signé</strong> (CPA). La formule est simple&nbsp;:
          </p>
          <div className="bg-sand-50 border border-charcoal-200 rounded-xl p-5 my-6 not-prose">
            <p className="font-heading font-bold text-charcoal-900 text-center text-lg">
              CPA = coût mensuel total ÷ nombre de chantiers signés
            </p>
          </div>
          <p>
            Incluez tout&nbsp;: abonnement, coût au lead, temps passé en rappels et rendez-vous
            non-convertis (valorisez votre heure à 40-60 €). Un artisan qui passe 2h par semaine à
            rappeler des leads partagés qui ne convertissent pas perd 320 à 480 €/mois en temps.
          </p>
          <p>
            <strong>Règle simple&nbsp;:</strong> si votre CPA dépasse 3 % du montant moyen de vos
            devis, le canal n’est pas rentable. Sur un devis moyen de 5 000 €, c’est 150 € max par
            chantier signé.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
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
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA FINAL                                                    */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Passez aux leads exclusifs
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Inscription gratuite, zéro engagement. Chaque demande de devis vous est envoyée en
            exclusivité.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/devenir-partenaire-cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Rejoindre le programme
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Découvrir les primes CEE
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
