import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import JsonLd from '@/components/JsonLd'
import { getFAQSchema } from '@/lib/seo/jsonld'
import Breadcrumb from '@/components/Breadcrumb'
import RgeGuideBlock from '@/components/rge/RgeGuideBlock'
import {
  Award,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  ArrowRight,
  Building2,
  Flame,
  Zap,
  Wind,
  CheckCircle2,
  Euro,
  Users,
  Factory,
} from 'lucide-react'

const PAGE_URL = `${SITE_URL}/guides/cee-certificats-economies-energie-2026`

export const revalidate = 86400

export const metadata: Metadata = {
  title: "CEE 2026 : guide complet Certificats d'Économies d'Énergie",
  description:
    "Mécanisme CEE, obligés et délégataires, opérations coup de pouce 2026, éligibilité RGE, démarche et cumul MaPrimeRénov'. Guide complet 2026.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "CEE 2026 : guide complet Certificats d'Économies d'Énergie",
    description:
      "Comprendre les CEE en 2026 : obligés, mandataires, barèmes coup de pouce, cumul MaPrimeRénov' et démarche pas à pas.",
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: "CEE 2026 : guide complet Certificats d'Économies d'Énergie",
    description:
      "Comprendre les CEE en 2026 : obligés, mandataires, barèmes coup de pouce, cumul MaPrimeRénov' et démarche pas à pas.",
  },
}

const acteurs = [
  {
    titre: 'Les obligés',
    icon: Factory,
    description:
      "Fournisseurs d'énergie (électricité, gaz, fioul, carburants) soumis par la loi à un quota d'économies d'énergie exprimé en kWh cumac. Ils doivent prouver à l'État qu'ils ont financé des travaux chez les consommateurs finaux, sous peine d'amende. TotalEnergies, Engie, EDF, ENI, Leclerc Énergies font partie des principaux obligés.",
  },
  {
    titre: 'Les éligibles',
    icon: Users,
    description:
      "Toute personne qui réalise des travaux permettant de générer des économies d'énergie : particuliers, copropriétés, bailleurs sociaux, collectivités, entreprises. Les particuliers touchent la prime CEE directement via l'obligé ou son délégataire.",
  },
  {
    titre: 'Les délégataires',
    icon: Building2,
    description:
      'Sociétés mandatées par les obligés pour collecter les dossiers CEE à leur place : Effy, Sonergia, Hellio, GEO PLC, Certinergy, Capital Énergy. Elles industrialisent la collecte et versent la prime au bénéficiaire.',
  },
  {
    titre: 'Les mandataires',
    icon: ShieldCheck,
    description:
      "Intermédiaires (souvent artisans ou courtiers) qui déposent le dossier CEE au nom du bénéficiaire auprès d'un obligé ou d'un délégataire. Ils doivent être enregistrés au registre national Emmy pour pouvoir agir.",
  },
]

const operations = [
  {
    nom: 'Isolation des combles perdus',
    code: 'BAR-EN-101',
    kwhCumac: 'Volume élevé, dégressif selon zone climatique',
  },
  {
    nom: "Isolation des murs par l'extérieur (ITE)",
    code: 'BAR-EN-102',
    kwhCumac: 'Très forte valorisation, coup de pouce actif',
  },
  {
    nom: 'Isolation des rampants de toiture',
    code: 'BAR-EN-103',
    kwhCumac: 'Éligible coup de pouce Isolation',
  },
  {
    nom: 'Pompe à chaleur air/eau haute performance',
    code: 'BAR-TH-171',
    kwhCumac:
      'Remplace la BAR-TH-104 abrogée 01/01/2024 — SCOP ≥ 4 requis, volume majoré pour sortie chaudière fossile',
  },
  {
    nom: 'Pompe à chaleur hybride',
    code: 'BAR-TH-159',
    kwhCumac: 'Volume intermédiaire, éligible coup de pouce',
  },
  {
    nom: 'Chaudière biomasse individuelle',
    code: 'BAR-TH-113',
    kwhCumac: 'Volume élevé, coup de pouce chauffage',
  },
  {
    nom: 'Système solaire combiné',
    code: 'BAR-TH-143',
    kwhCumac: 'Volume élevé, éligible cumul MPR',
  },
  { nom: 'VMC double flux autoréglable', code: 'BAR-TH-125', kwhCumac: 'Valorisation modérée' },
]

const etapes = [
  {
    numero: 1,
    titre: "Identifier l'opération éligible et l'obligé partenaire",
    detail:
      "Avant signature du devis, vérifiez que le geste figure dans le catalogue officiel des fiches standardisées (BAR-EN, BAR-TH…) et choisissez un obligé ou un délégataire pour porter le dossier. La prime varie sensiblement d'un acteur à l'autre.",
  },
  {
    numero: 2,
    titre: "Signer la « lettre d'engagement » avant le devis",
    detail:
      "Le rôle incitatif des CEE impose une chronologie stricte : la demande (devis ou « lettre d'engagement ») doit être datée AVANT la signature du devis définitif avec l'artisan. Toute inversion entraîne un rejet du dossier.",
  },
  {
    numero: 3,
    titre: 'Faire réaliser les travaux par un artisan RGE',
    detail:
      "Comme pour MaPrimeRénov', les CEE imposent un artisan RGE sur le domaine concerné pour les opérations standardisées liées à l'enveloppe et au chauffage du logement.",
  },
  {
    numero: 4,
    titre: 'Transmettre la facture et les pièces justificatives',
    detail:
      "Facture détaillée, attestation sur l'honneur signée, attestation de TVA à 5,5 %, copie du certificat RGE : l'obligé contrôle la cohérence du dossier avant dépôt au Pôle National des CEE.",
  },
  {
    numero: 5,
    titre: 'Recevoir la prime',
    detail:
      "Une fois le dossier validé, la prime est versée par virement, chèque ou bon d'achat selon l'obligé choisi. Les délais varient de 4 à 12 semaines.",
  },
]

const faqItems = [
  {
    question: "Qu'est-ce qu'un kWh cumac ?",
    answer:
      "Le kWh cumac (pour « cumulé actualisé ») est l'unité officielle des CEE. Elle représente l'économie d'énergie générée par une action sur toute la durée de vie de l'équipement, actualisée à 4 % par an. Un coup de pouce Isolation peut générer plusieurs centaines de milliers de kWh cumac par chantier.",
  },
  {
    question: 'Qui finance vraiment les primes CEE ?',
    answer:
      "Les primes CEE sont intégralement financées par les fournisseurs d'énergie (les « obligés »), qui répercutent le coût sur leurs prix de vente. Il ne s'agit pas d'une aide d'État : aucun impôt n'est mobilisé. C'est un dispositif de marché réglementé par le ministère de la Transition écologique.",
  },
  {
    question: "Peut-on cumuler CEE et MaPrimeRénov' en 2026 ?",
    answer:
      "Oui, le cumul est explicitement prévu et encouragé. Sur une pompe à chaleur air/eau, un ménage modeste peut additionner MaPrimeRénov' et le coup de pouce CEE chauffage pour financer jusqu'à 80 % du chantier. L'artisan ou le délégataire monte les deux dossiers simultanément.",
  },
  {
    question: 'Quelle différence entre fiche standardisée et opération spécifique ?',
    answer:
      "Les fiches standardisées (BAR-EN, BAR-TH, BAT-EN…) couvrent 95 % des travaux courants : isolation, PAC, chaudière bois, VMC, éclairage. Pour les projets industriels ou atypiques, l'opération « spécifique » permet de calculer la prime sur mesure à partir d'une étude d'économies d'énergie validée par un bureau d'études qualifié.",
  },
  {
    question: 'Est-ce que les primes CEE « à 1 € » existent encore ?',
    answer:
      "Les offres « isolation à 1 € » ont été supprimées en juillet 2021 à cause d'abus massifs. Il reste toutefois des « coups de pouce » qui financent une part très significative du reste à charge, notamment sur le chauffage bois, les PAC et l'isolation. Méfiez-vous de toute démarche commerciale insistante promettant « gratuit » sans visite technique.",
  },
  {
    question: 'Faut-il passer par un délégataire ou directement par un obligé ?',
    answer:
      "Les deux circuits sont légaux. Les délégataires (Effy, Sonergia, Hellio…) offrent en général des démarches en ligne simplifiées et des primes compétitives. Les obligés historiques (TotalEnergies, Engie, EDF) proposent parfois des primes majorées pour leurs clients. Le mieux est de comparer avant de signer l'engagement.",
  },
  {
    question: 'Quel contrôle est fait sur les dossiers CEE ?',
    answer:
      "Le Pôle National des CEE (PNCEE), rattaché au ministère, effectue des contrôles a posteriori par échantillonnage, avec visites sur site. En cas de non-conformité (travaux non réalisés, équipement non conforme, artisan non RGE), la prime est récupérée auprès de l'obligé, qui peut se retourner contre le bénéficiaire.",
  },
]

const breadcrumbItems = [{ label: 'Guides', href: '/guides' }, { label: 'CEE 2026' }]

export default function CEE2026Page() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'CEE 2026', item: PAGE_URL },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: "Certificats d'Économies d'Énergie (CEE) 2026 : guide complet",
    description:
      "Mécanisme CEE, obligés et délégataires, opérations coup de pouce 2026, éligibilité RGE, démarche et cumul MaPrimeRénov'.",
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
            <Award className="w-4 h-4" />
            Guide CEE 2026
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading leading-tight">
            Certificats d&apos;Économies d&apos;Énergie (CEE) 2026 : le guide complet
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {
              "Mécanisme, acteurs, opérations les plus primées, coups de pouce 2026, éligibilité RGE, démarche pas à pas et cumul MaPrimeRénov' : tout pour comprendre et activer les CEE."
            }
          </p>
        </section>

        {/* Mécanisme */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading">
              Le mécanisme des CEE, en deux minutes
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                {
                  "Les Certificats d'Économies d'Énergie (CEE) sont nés en 2005 avec la loi POPE. Le principe est aussi simple qu'efficace : l'État impose aux fournisseurs d'énergie (électricité, gaz, fioul, carburants) un quota d'économies d'énergie à atteindre chaque période triennale. Ces fournisseurs, appelés « obligés », doivent prouver qu'ils ont fait réaliser ces économies chez des consommateurs finaux : particuliers, entreprises, collectivités."
                }
              </p>
              <p>
                {
                  "Concrètement, les obligés financent des travaux chez des ménages ou des entreprises (isolation, PAC, chaudière biomasse, éclairage LED…) et reçoivent en contrepartie un « certificat » correspondant aux économies théoriques générées, exprimées en kWh cumac. Chaque certificat obtenu vient abaisser leur obligation. À l'inverse, un obligé qui ne respecte pas son quota paie une pénalité lourde."
                }
              </p>
              <p>
                {
                  "Pour le particulier, les CEE se traduisent par une prime en euros — appelée aussi « prime énergie » — versée à la fin du chantier. Cette prime est cumulable avec MaPrimeRénov', la TVA à 5,5 % et l'éco-PTZ."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Acteurs */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-heading">
            Les 4 acteurs du dispositif
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {acteurs.map((a) => {
              const Icon = a.icon
              return (
                <div
                  key={a.titre}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-green-700" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{a.titre}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{a.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Opérations les plus primées */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading">
            Les opérations les plus primées en 2026
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {
              'Les fiches standardisées du catalogue officiel sont identifiées par un code (BAR pour « bâtiment résidentiel », suivi de la catégorie).'
            }
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-semibold text-gray-700 p-4">Opération</th>
                  <th className="text-left font-semibold text-gray-700 p-4">Code fiche</th>
                  <th className="text-left font-semibold text-gray-700 p-4">Volume CEE</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.code} className="border-t border-gray-100">
                    <td className="p-4 text-gray-900 font-medium">{op.nom}</td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{op.code}</td>
                    <td className="p-4 text-gray-600">{op.kwhCumac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {
              'Les volumes exacts en kWh cumac dépendent de la zone climatique (H1, H2, H3), de la surface traitée et du type de bâtiment. Les simulateurs officiels et ceux des délégataires fournissent un chiffrage précis avant devis.'
            }
          </p>
        </section>

        {/* Coups de pouce */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading">
            Les « coups de pouce » 2026
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Coup de pouce Chauffage</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {
                  "Bonifie les primes pour le remplacement d'une chaudière fioul, gaz non condensation ou charbon par une PAC air/eau, une PAC hybride, une chaudière biomasse ou un raccordement à un réseau de chaleur. Les ménages très modestes peuvent atteindre plusieurs milliers d'euros de prime."
                }
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Coup de pouce Isolation</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {
                  "Majore la prime pour l'isolation des combles perdus, des rampants, des planchers bas et désormais des murs en ITE. Le versement est conditionné à un contrôle sur site et au respect des résistances thermiques R imposées par arrêté."
                }
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Coup de pouce Pilotage</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {
                  "Prime pour l'installation d'un système de régulation et de pilotage intelligent du chauffage : programmateur connecté, robinets thermostatiques, GTB dans les petits collectifs. Cumulable avec le remplacement de chauffage."
                }
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Wind className="w-6 h-6 text-teal-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Coup de pouce Rénovation d&apos;ampleur
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {
                  "Destiné aux rénovations globales qui font sauter au moins deux classes DPE. Il se cumule avec le Parcours Accompagné MaPrimeRénov' et vise les passoires thermiques (F et G)."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Démarche */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-heading">
            La démarche pas à pas
          </h2>
          <ol className="space-y-4">
            {etapes.map((e) => (
              <li
                key={e.numero}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shrink-0">
                  {e.numero}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{e.titre}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{e.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Éligibilité RGE */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 md:p-10 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              L&apos;éligibilité RGE : la condition sine qua non
            </h2>
            <p className="text-green-50 leading-relaxed mb-4">
              {
                "Comme pour MaPrimeRénov', les fiches standardisées du résidentiel (BAR-EN, BAR-TH) imposent un artisan RGE dans le domaine des travaux. C'est une condition de validité du dossier CEE : sans qualification valide à la date du devis, la prime est refusée."
              }
            </p>
            <ul className="space-y-2 text-green-50">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>Qualibat RGE pour l&apos;isolation et les menuiseries</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>QualiPAC pour les pompes à chaleur</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>Qualibois pour les appareils de chauffage bois</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>QualiSol pour le solaire thermique</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Cumul MPR */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center gap-3">
              <Euro className="w-8 h-8 text-green-600" />
              Cumul CEE + MaPrimeRénov&apos; : l&apos;exemple chiffré
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {
                'Un ménage modeste remplace une chaudière fioul par une PAC air/eau de 12 kW, coût TTC 15 000 €.'
              }
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">+</span>
                <span>
                  MaPrimeRénov&apos; (profil modeste, parcours par geste) : plusieurs milliers
                  d&apos;euros selon barème 2026
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">+</span>
                <span>
                  Coup de pouce Chauffage CEE (remplacement fioul) : bonus significatif versé par
                  l&apos;obligé
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">+</span>
                <span>TVA à 5,5 % appliquée directement sur la facture de l&apos;artisan RGE</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">+</span>
                <span>
                  Éco-PTZ à taux zéro sur le reste à charge (jusqu&apos;à 50 000 € sur 20 ans)
                </span>
              </li>
            </ul>
            <p className="text-gray-700 mt-4 leading-relaxed">
              {
                "Résultat : le reste à charge peut descendre à 10-20 % du coût total pour les profils modestes, contre 60-70 % pour les profils supérieurs. Notre guide dédié « Pompe à chaleur 2026 : aides CEE + MaPrimeRénov' cumulables » détaille ce calcul."
              }
            </p>
            <Link
              href="/guides/pompe-a-chaleur-cee-maprimerenov-2026"
              className="inline-flex items-center gap-2 mt-4 text-green-700 font-semibold hover:text-green-800"
            >
              Voir l&apos;exemple chiffré PAC 2026
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-heading flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-green-600" />
            Questions fréquentes sur les CEE
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-gray-900 hover:text-green-700 transition-colors">
                  {item.question}
                  <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <RgeGuideBlock variant="generic" />

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Activez vos CEE avec un artisan RGE certifié
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              {
                "Demandez un devis gratuit à un professionnel RGE près de chez vous et sécurisez vos primes CEE et MaPrimeRénov'."
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
                href="/verifier-artisan"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-400 transition-colors border border-green-400"
              >
                <ShieldCheck className="w-5 h-5" />
                Vérifier un artisan RGE
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
