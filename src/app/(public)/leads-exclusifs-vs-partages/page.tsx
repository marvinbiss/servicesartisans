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
  title: 'Leads exclusifs vs leads partag\u00e9s : comparatif pour artisans du b\u00e2timent',
  description:
    'Comparatif objectif entre leads exclusifs et leads partag\u00e9s pour les artisans. Co\u00fbt r\u00e9el, taux de conversion, ROI. Donn\u00e9es Habitatpresto, Travaux.com, Effy.',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Leads exclusifs vs leads partag\u00e9s : le vrai comparatif artisan',
    description:
      'Quel mod\u00e8le de leads est le plus rentable pour un artisan du b\u00e2timent ? Chiffres, retours terrain et analyse.',
    type: 'article',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
    siteName: 'ServicesArtisans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leads exclusifs vs leads partag\u00e9s : comparatif artisan',
    description:
      'Co\u00fbt r\u00e9el, taux de conversion, ROI. Le comparatif que les plateformes ne vous montrent pas.',
  },
  alternates: getAlternates(path),
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const COMPARISON_TABLE = [
  {
    criteria: 'Nombre d\u2019artisans par lead',
    exclusif: '1 seul',
    partage: '3 \u00e0 10 (parfois plus)',
  },
  {
    criteria: 'Taux de conversion moyen',
    exclusif: '20 \u00e0 35 %',
    partage: '5 \u00e0 12 %',
  },
  {
    criteria: 'Co\u00fbt par lead (ordre de grandeur)',
    exclusif: '15 \u00e0 50 \u20ac',
    partage: '1 \u00e0 15 \u20ac par lead (mais x5 artisans)',
  },
  {
    criteria: 'Co\u00fbt par chantier sign\u00e9 (CPA)',
    exclusif: '50 \u00e0 150 \u20ac',
    partage: '80 \u00e0 300 \u20ac (leads perdus inclus)',
  },
  {
    criteria: 'Temps pass\u00e9 en rappel prospect',
    exclusif: '1 appel, 0 comp\u00e9tition',
    partage: 'Course au rappel, 3 \u00e0 5 appels concurrents',
  },
  {
    criteria: 'Qualit\u00e9 de la relation client',
    exclusif: '\u00c9lev\u00e9e (premier contact = confiance)',
    partage: 'D\u00e9grad\u00e9e (client d\u00e9j\u00e0 sollicit\u00e9 5 fois)',
  },
  {
    criteria: 'Engagement plateforme',
    exclusif: 'Variable (0 \u00e0 mensuel)',
    partage: 'Abonnement 70 \u00e0 220 \u20ac/mois (Habitatpresto)',
  },
]

const PLATFORMS = [
  {
    name: 'Habitatpresto',
    model: 'Leads partag\u00e9s',
    cost: '70 \u00e0 220 \u20ac/mois (abonnement)',
    sharing: '5 artisans par lead, puis 5 autres si pas de r\u00e9ponse',
    engagement: '6 \u00e0 12 mois',
    rating: '4.1/5 Trustpilot (22 % de 1 \u00e9toile)',
    weakness:
      'Leads froids, zones inactives, r\u00e9siliation p\u00e9nalis\u00e9e \u00e0 50 % du restant',
  },
  {
    name: 'Travaux.com',
    model: 'Leads partag\u00e9s',
    cost: '1 \u00e0 90 \u20ac par contact',
    sharing: '3 \u00e0 5 artisans (jusqu\u2019\u00e0 10 en zone dense)',
    engagement: 'Au lead',
    rating: '4.0/5 Trustpilot (10 000+ avis)',
    weakness: 'Contacts injoignables, projets fictifs, co\u00fbt \u00e9lev\u00e9 sans garantie',
  },
  {
    name: 'Effy',
    model: 'Leads partag\u00e9s (r\u00e9seau partenaire)',
    cost: 'Commission sur prime CEE',
    sharing: 'Plusieurs artisans par zone',
    engagement: 'Contractuel',
    rating: '4.4/5 Trustpilot (plaintes SAV)',
    weakness: 'Artisan = sous-traitant anonyme, pas de relation directe client',
  },
  {
    name: 'ServicesArtisans',
    model: 'Leads exclusifs',
    cost: '0 \u20ac (phase de lancement)',
    sharing: '1 artisan par lead, toujours',
    engagement: 'Z\u00e9ro engagement',
    rating: 'Nouveau (2026)',
    weakness: 'Volume en croissance (phase de lancement)',
  },
]

const FAQS = [
  {
    question:
      'Un lead exclusif est-il vraiment plus rentable qu\u2019un lead partag\u00e9 moins cher\u00a0?',
    answer:
      'Oui, dans la majorit\u00e9 des cas. Un lead partag\u00e9 \u00e0 5 \u20ac envoy\u00e9 \u00e0 5 artisans co\u00fbte en r\u00e9alit\u00e9 25 \u20ac au total pour le march\u00e9. Avec un taux de conversion de 5 \u00e0 12 %, le co\u00fbt par chantier sign\u00e9 d\u00e9passe souvent 200 \u20ac. Un lead exclusif \u00e0 30 \u20ac avec 25 % de conversion co\u00fbte 120 \u20ac par chantier sign\u00e9. Le calcul est vite fait.',
  },
  {
    question: 'Pourquoi les plateformes vendent-elles des leads partag\u00e9s\u00a0?',
    answer:
      'Parce que c\u2019est plus rentable pour la plateforme. Un m\u00eame lead vendu 5 fois rapporte 5 fois plus qu\u2019un lead exclusif. Le mod\u00e8le avantage la plateforme, pas l\u2019artisan.',
  },
  {
    question: 'Comment v\u00e9rifier qu\u2019un lead est vraiment exclusif\u00a0?',
    answer:
      'Demandez la garantie par \u00e9crit dans les CGV de la plateforme. Si la plateforme ne s\u2019engage pas contractuellement sur l\u2019exclusivit\u00e9, c\u2019est qu\u2019elle partage. Chez ServicesArtisans, l\u2019exclusivit\u00e9 est une r\u00e8gle non-n\u00e9gociable inscrite dans nos conditions d\u2019utilisation.',
  },
  {
    question: 'Quel volume de leads exclusifs peut-on esp\u00e9rer par mois\u00a0?',
    answer:
      'Le volume d\u00e9pend de votre zone g\u00e9ographique, de votre m\u00e9tier et de la demande locale. Un plombier-chauffagiste en zone urbaine re\u00e7oit plus de demandes qu\u2019un fa\u00e7adier en zone rurale. L\u2019avantage de l\u2019exclusivit\u00e9, c\u2019est que chaque lead a une probabilit\u00e9 de conversion 3 \u00e0 5 fois sup\u00e9rieure.',
  },
  {
    question: 'Les leads partag\u00e9s sont-ils totalement \u00e0 \u00e9viter\u00a0?',
    answer:
      'Pas forc\u00e9ment. Pour un artisan qui d\u00e9marre et a besoin de volume rapidement, les leads partag\u00e9s peuvent servir de compl\u00e9ment. Mais le c\u0153ur de l\u2019acquisition devrait reposer sur des leads exclusifs ou du bouche-\u00e0-oreille. Les artisans exp\u00e9riment\u00e9s qui ont calcul\u00e9 leur co\u00fbt r\u00e9el par chantier sign\u00e9 quittent g\u00e9n\u00e9ralement les plateformes de leads partag\u00e9s.',
  },
  {
    question: 'Quelle diff\u00e9rence entre un lead exclusif et un lead qualifi\u00e9\u00a0?',
    answer:
      'Un lead qualifi\u00e9 a \u00e9t\u00e9 filtr\u00e9 pour correspondre \u00e0 vos crit\u00e8res (zone, m\u00e9tier, budget). Un lead exclusif n\u2019est envoy\u00e9 qu\u2019\u00e0 vous. L\u2019id\u00e9al, c\u2019est un lead \u00e0 la fois qualifi\u00e9 ET exclusif. C\u2019est ce que propose ServicesArtisans : filtrage par m\u00e9tier et zone, envoi \u00e0 un seul artisan.',
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function LeadsExclusifsVsPartagesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Leads exclusifs vs partag\u00e9s', url: path },
  ])

  const faqSchema = getFAQSchema(FAQS)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Leads exclusifs vs leads partag\u00e9s : comparatif pour artisans du b\u00e2timent',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ServicesArtisans' },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
    datePublished: '2026-04-12',
    dateModified: '2026-04-12',
    description:
      'Comparatif objectif entre leads exclusifs et leads partag\u00e9s. Co\u00fbt r\u00e9el, taux de conversion, ROI pour les artisans.',
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb items={[{ label: 'Leads exclusifs vs partag\u00e9s' }]} />

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
