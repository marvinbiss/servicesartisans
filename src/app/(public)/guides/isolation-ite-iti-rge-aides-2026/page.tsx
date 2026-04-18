import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import JsonLd from '@/components/JsonLd'
import { getFAQSchema } from '@/lib/seo/jsonld'
import Breadcrumb from '@/components/Breadcrumb'
import RgeGuideBlock from '@/components/rge/RgeGuideBlock'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import {
  Snowflake,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  CheckCircle2,
  Home,
  Building2,
  Ruler,
  AlertTriangle,
} from 'lucide-react'

const PAGE_URL = `${SITE_URL}/guides/isolation-ite-iti-rge-aides-2026`

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Isolation ITE vs ITI 2026 : comparatif, artisan RGE et aides',
  description:
    "ITE ou ITI en 2026 : différences, matériaux, prix au m², MaPrimeRénov' Isolation, Coup de pouce CEE et obligation Qualibat RGE. Guide comparatif complet.",
  alternates: getAlternates('/guides/isolation-ite-iti-rge-aides-2026'),
  openGraph: {
    title: 'Isolation ITE vs ITI 2026 : comparatif, artisan RGE et aides cumulables',
    description:
      "Choisir entre isolation par l'extérieur et par l'intérieur : matériaux, coûts, aides 2026 et critères RGE.",
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Isolation ITE vs ITI 2026 : comparatif, artisan RGE et aides cumulables',
    description:
      "Choisir entre isolation par l'extérieur et par l'intérieur : matériaux, coûts, aides 2026 et critères RGE.",
  },
}

const comparatif = [
  {
    critere: 'Principe',
    ite: "Isolation posée sur la façade extérieure, recouverte d'un enduit ou d'un bardage",
    iti: "Isolation posée côté intérieur contre les murs existants, recouverte d'un parement (placo, lambris)",
  },
  {
    critere: 'Perte de surface habitable',
    ite: "Aucune perte — gain de confort sans sacrifier d'espace",
    iti: 'Perte de 5 à 15 cm par mur traité, soit 3 à 5 m² pour une maison type',
  },
  {
    critere: 'Performance thermique',
    ite: 'Excellente — supprime les ponts thermiques de dalle et de refends',
    iti: 'Bonne — mais ponts thermiques résiduels aux jonctions murs-planchers',
  },
  {
    critere: 'Coût au m² de paroi',
    ite: 'Entre 100 et 250 €/m² selon matériau et finition',
    iti: 'Entre 50 et 120 €/m² selon matériau et épaisseur',
  },
  {
    critere: 'Aspect extérieur',
    ite: 'Modifie la façade (enduit neuf ou bardage bois/composite)',
    iti: "Invisible depuis l'extérieur — idéal en zone protégée ABF",
  },
  {
    critere: 'Durée de chantier',
    ite: '3 à 6 semaines pour une maison individuelle',
    iti: '1 à 3 semaines selon la surface traitée',
  },
  {
    critere: 'Occupation du logement',
    ite: 'Possible pendant les travaux',
    iti: 'Chantier pièce par pièce, parfois contraignant',
  },
]

const materiaux = [
  {
    nom: 'Laine de verre',
    r: 'R typique 3,5 à 7 m²·K/W',
    usage: 'ITI principalement',
    prix: 'Le plus économique au m²',
  },
  {
    nom: 'Laine de roche',
    r: 'R typique 3,5 à 7 m²·K/W',
    usage: 'ITE et ITI — bon comportement au feu',
    prix: 'Coût intermédiaire',
  },
  {
    nom: 'Polystyrène expansé (PSE)',
    r: 'R typique 3 à 6 m²·K/W',
    usage: 'ITE dominante',
    prix: 'Coût maîtrisé',
  },
  {
    nom: 'Polystyrène extrudé (XPS)',
    r: 'R typique 3 à 5 m²·K/W',
    usage: 'Soubassement, points sensibles',
    prix: 'Légèrement supérieur au PSE',
  },
  {
    nom: 'Polyuréthane (PUR)',
    r: 'R typique 4 à 8 m²·K/W',
    usage: 'ITE et ITI — R élevé, faible épaisseur',
    prix: 'Coût supérieur, haute performance',
  },
  {
    nom: 'Laine de bois',
    r: 'R typique 3,5 à 6 m²·K/W',
    usage: 'ITE et ITI — biosourcé, déphasage estival',
    prix: 'Matériau premium, prime bonifiée CEE',
  },
  {
    nom: 'Ouate de cellulose',
    r: 'R typique 4 à 7 m²·K/W',
    usage: 'ITI, insufflation murs creux',
    prix: 'Biosourcé, bonne inertie',
  },
]

const faqItems = [
  {
    question: 'ITE ou ITI : laquelle choisir ?',
    answer:
      "Si votre façade n'est pas classée et que le budget le permet, l'ITE est techniquement supérieure : pas de perte de surface, traitement complet des ponts thermiques, rénovation esthétique de la façade. L'ITI reste pertinente si vous êtes en copropriété sans accord d'AG pour toucher à la façade, en zone ABF, ou si vous rénovez pièce par pièce au fil du temps.",
  },
  {
    question: "Faut-il obligatoirement un artisan RGE pour l'isolation ?",
    answer:
      "Oui, absolument. Pour bénéficier de MaPrimeRénov' Isolation, du Coup de pouce CEE Isolation, de la TVA à 5,5 % et de l'éco-PTZ, l'entreprise doit détenir une qualification Qualibat RGE sur le domaine exact (7131 ou 7132 pour l'ITE, 7133 ou 7134 pour l'ITI).",
  },
  {
    question: 'Quelle résistance thermique R viser ?',
    answer:
      "Les aides imposent des résistances thermiques minimales : environ R ≥ 3,7 m²·K/W pour les murs et R ≥ 7 m²·K/W pour les combles perdus. Ces seuils garantissent une performance durable. Un isolant moins épais qui ne les atteint pas sera techniquement installable mais n'ouvrira droit à aucune prime.",
  },
  {
    question: "L'ITE est-elle compatible avec une maison ancienne en pierre ?",
    answer:
      "Oui, mais avec précautions. Les murs anciens (pierre, pisé, colombages) ont besoin de respirer. On privilégie alors des isolants perméables à la vapeur d'eau (laine de bois, fibre de bois, chanvre) et des enduits à la chaux. Un diagnostic par un bureau d'études spécialisé est fortement recommandé avant travaux.",
  },
  {
    question: 'Peut-on faire ITE et ITI sur un même logement ?',
    answer:
      "C'est rarement justifié économiquement : le cumul double les coûts sans doubler la performance. En revanche, une maison peut recevoir une ITE en façade et un renforcement ITI ponctuel sur un mur mitoyen non traitable de l'extérieur. C'est une stratégie courante en rénovation d'ampleur.",
  },
  {
    question: "Quelles aides pour l'isolation des murs en 2026 ?",
    answer:
      "Cumul MaPrimeRénov' Isolation + Coup de pouce Isolation CEE (majoré pour l'ITE en 2026) + TVA à 5,5 % + éco-PTZ. Les primes sont calculées au m² de paroi traitée et dépendent du profil de ressources du ménage ainsi que de la zone climatique (H1, H2, H3).",
  },
  {
    question: "Combien de temps dure un chantier d'isolation ITE ?",
    answer:
      "Pour une maison individuelle de 100 m² au sol avec environ 150 m² de façade, comptez 3 à 5 semaines : échafaudage, pose de l'isolant, treillis, enduit ou bardage, finitions. Les conditions météo (pluie, gel) peuvent prolonger le chantier car la plupart des enduits ne se posent pas en dessous de 5 °C.",
  },
]

const breadcrumbItems = [
  { label: 'Guides', href: '/guides' },
  { label: 'Isolation ITE vs ITI 2026' },
]

export default function IsolationIteItiPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'Isolation ITE vs ITI 2026', item: PAGE_URL },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Isolation ITE vs ITI 2026 : comparatif, artisan RGE et aides cumulables',
    description:
      "Différences, matériaux, coûts, MaPrimeRénov' Isolation, Coup de pouce CEE et obligation Qualibat RGE en 2026.",
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    datePublished: '2026-04-09',
    dateModified: '2026-04-09',
    mainEntityOfPage: PAGE_URL,
  }

  const faqSchema = getFAQSchema(faqItems)

  return (
    <>
      <JsonLd data={[breadcrumbSchema, articleSchema, faqSchema]} />

      <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Snowflake className="w-4 h-4" />
            Guide Isolation 2026
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-charcoal-900 mb-6 font-heading leading-tight">
            Isolation ITE vs ITI 2026 : comparatif, artisan RGE et aides cumulables
          </h1>
          <p className="text-lg md:text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            {
              "ITE par l'extérieur ou ITI par l'intérieur ? Matériaux, coûts au m², MaPrimeRénov' Isolation, Coup de pouce CEE et obligation Qualibat RGE — toutes les clés pour trancher en 2026."
            }
          </p>
        </section>

        {/* Différence */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-charcoal-900">
                  ITE — Isolation Thermique par l&apos;Extérieur
                </h2>
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                {
                  "L'ITE consiste à envelopper le bâtiment d'un manteau isolant posé côté façade, puis à le recouvrir d'un enduit ou d'un bardage. C'est la solution la plus performante car elle supprime la quasi-totalité des ponts thermiques et protège la structure des variations de température."
                }
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-purple-700" />
                </div>
                <h2 className="text-xl font-bold text-charcoal-900">
                  ITI — Isolation Thermique par l&apos;Intérieur
                </h2>
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                {
                  "L'ITI pose l'isolant côté intérieur, contre les murs existants, avec un parement de finition (plaque de plâtre, lambris). Moins chère et plus simple à mettre en œuvre, elle laisse la façade intacte mais réduit légèrement la surface habitable."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Tableau comparatif */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading">
            Quel est le comparatif détaillé ITE vs ITI&nbsp;?
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-sand-50">
                <tr>
                  <th className="text-left font-semibold text-charcoal-700 p-4">Critère</th>
                  <th className="text-left font-semibold text-charcoal-700 p-4">ITE</th>
                  <th className="text-left font-semibold text-charcoal-700 p-4">ITI</th>
                </tr>
              </thead>
              <tbody>
                {comparatif.map((c) => (
                  <tr key={c.critere} className="border-t border-sand-200">
                    <td className="p-4 font-semibold text-charcoal-900">{c.critere}</td>
                    <td className="p-4 text-charcoal-600">{c.ite}</td>
                    <td className="p-4 text-charcoal-600">{c.iti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Matériaux */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading">
            Quels matériaux isolants choisir pour une ITE ou une ITI&nbsp;?
          </h2>
          <p className="text-charcoal-700 mb-6 leading-relaxed">
            {
              'Le choix du matériau dépend de la technique retenue (ITE ou ITI), de la performance visée (résistance thermique R), de la sensibilité environnementale du chantier et du budget disponible.'
            }
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {materiaux.map((m) => (
              <div key={m.nom} className="bg-white rounded-xl shadow-sm border border-sand-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-charcoal-900">{m.nom}</h3>
                </div>
                <div className="text-xs text-charcoal-600 space-y-1">
                  <div>{m.r}</div>
                  <div>
                    <strong>Usage :</strong> {m.usage}
                  </div>
                  <div>
                    <strong>Prix :</strong> {m.prix}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Aides 2026 */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 md:p-10 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Quelles sont les aides à l&apos;isolation en 2026&nbsp;?
            </h2>
            <div className="space-y-4 text-green-50 leading-relaxed">
              <p>
                <strong>MaPrimeRénov&apos; Isolation :</strong>{' '}
                {
                  "prime forfaitaire par m² de paroi traitée, versée par l'Anah après validation du dossier. Les montants sont plus élevés pour les profils Bleu et Jaune (ménages modestes), plus modestes pour les profils Violet et Rose."
                }
              </p>
              <p>
                <strong>Coup de pouce Isolation CEE :</strong>{' '}
                {
                  "bonifie les primes énergie des obligés sur les combles, les rampants, les planchers bas et les murs en ITE. Cumulable avec MaPrimeRénov' sans décote."
                }
              </p>
              <p>
                <strong>TVA 5,5 % :</strong>{' '}
                {
                  "appliquée directement par l'artisan sur la facture (fourniture + pose). Ne demande aucune démarche côté propriétaire, mais impose la qualification RGE de l'entreprise."
                }
              </p>
              <p>
                <strong>Éco-PTZ :</strong>{' '}
                {
                  "prêt à taux zéro jusqu'à 30 000 € pour un geste d'isolation, jusqu'à 50 000 € pour une rénovation globale. Remboursable sur 15 à 20 ans sans intérêt."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Qualibat RGE */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            Pourquoi Qualibat RGE est-il obligatoire pour les aides isolation&nbsp;?
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
            <p className="text-charcoal-700 mb-4 leading-relaxed">
              {
                "Pour l'isolation, la qualification RGE de référence est Qualibat, délivrée par l'organisme du même nom. Les codes à exiger sur le devis dépendent du domaine :"
              }
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-charcoal-700">
                  <strong>7131 / 7132</strong> — Isolation thermique par l&apos;extérieur (ITE) avec
                  enduit ou bardage
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-charcoal-700">
                  <strong>7133 / 7134</strong> — Isolation thermique par l&apos;intérieur (ITI) avec
                  ou sans finition
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-charcoal-700">
                  <strong>7141</strong> — Isolation des combles perdus par soufflage
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-charcoal-700">
                  <strong>7142</strong> — Isolation des rampants de toiture (sarking, panneaux)
                </span>
              </li>
            </ul>
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                {
                  'Un devis mentionnant seulement « RGE » sans préciser le code Qualibat et la date de validité doit vous alerter. Demandez toujours une copie du certificat à jour.'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Choisir ITE ou ITI */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-4 font-heading">
              ITE ou ITI : comment trancher ?
            </h2>
            <div className="prose prose-lg max-w-none text-charcoal-700">
              <p>
                <strong>Choisissez l&apos;ITE si :</strong>{' '}
                {
                  "votre façade peut être transformée sans contrainte réglementaire, vous souhaitez rénover simultanément l'esthétique, le budget tient la route et le logement est occupé pendant les travaux. C'est l'option techniquement la plus performante."
                }
              </p>
              <p>
                <strong>Choisissez l&apos;ITI si :</strong>{' '}
                {
                  "vous êtes en copropriété sans accord d'AG pour l'extérieur, votre bâtiment est dans un périmètre protégé ABF, votre budget est serré ou vous préférez rénover pièce par pièce au fil des années. L'ITI reste une solution efficace si elle est bien dimensionnée."
                }
              </p>
              <p>
                {
                  "Dans tous les cas, un diagnostic thermique préalable (par un professionnel qualifié ou un bureau d'études) permet de prioriser les parois à traiter et d'estimer les gains réels en kWh/an économisés."
                }
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-8 font-heading flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-green-600" />
            Questions fréquentes sur l&apos;isolation 2026
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="bg-white rounded-xl shadow-sm border border-sand-200 group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-charcoal-900 hover:text-green-700 transition-colors">
                  {item.question}
                  <span className="ml-4 text-charcoal-400 group-open:rotate-45 transition-transform text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 leading-relaxed border-t border-sand-100 pt-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <RgeGuideBlock variant="service" serviceSlug="isolation-thermique" />

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Devis gratuit pour votre projet d&apos;isolation
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              {
                "Obtenez rapidement un devis d'un artisan Qualibat RGE certifié pour votre projet ITE ou ITI."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-8 py-3.5 rounded-xl font-bold hover:bg-green-50 transition-colors"
              >
                <FileCheck className="w-5 h-5" />
                Obtenir mon devis gratuit
              </Link>
              <Link
                href="/services/isolation-thermique"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-400 transition-colors border border-green-400"
              >
                <Snowflake className="w-5 h-5" />
                Voir les artisans isolation
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky CTA mobile — simulateur aides rénovation */}
      <SimulateurCTA variant="sticky-bottom" />
    </>
  )
}
