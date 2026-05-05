import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Euro,
  FileCheck2,
  Info,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Wallet,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const PAGE_PATH = '/rge/tarifs-audit-energetique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED_AT = '2026-04-09T10:00:00+02:00'
const UPDATED_AT = '2026-04-09T10:00:00+02:00'

type PriceRow = {
  profil: string
  fourchette: string
  details: string
}

const PRICE_RANGES: PriceRow[] = [
  {
    profil: 'Maison individuelle simple, surface < 100 m²',
    fourchette: '500 – 900 € TTC',
    details:
      "Volume compact, une seule zone thermique, peu de complexité constructive. C'est la configuration la plus fréquente pour une ancienne maison de bourg ou un pavillon standard.",
  },
  {
    profil: 'Maison individuelle 100 – 200 m²',
    fourchette: '800 – 1 400 € TTC',
    details:
      "Plusieurs niveaux, parfois combles aménagés et véranda, diversité de parois à relever. La majorité des audits réglementaires en vue d'un Parcours Accompagné se situent dans cette fourchette.",
  },
  {
    profil: 'Maison > 200 m² ou bâti complexe',
    fourchette: '1 200 – 2 000 € TTC et plus',
    details:
      'Maison de maître, corps de ferme, longère, extensions successives, mélange de matériaux anciens et récents. Le relevé terrain et la modélisation prennent davantage de temps.',
  },
  {
    profil: 'Appartement individuel',
    fourchette: 'Rarement pertinent seul',
    details:
      "L'audit réglementaire obligatoire vise avant tout la maison individuelle. En copropriété, la démarche passe par le DPE collectif et, le cas échéant, par un audit global de l'immeuble piloté par le syndic.",
  },
]

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: "L'audit énergétique est-il obligatoire pour toucher MaPrimeRénov' ?",
    answer:
      "Cela dépend du parcours choisi. Pour MaPrimeRénov' par geste (un seul poste de travaux, par exemple une pompe à chaleur seule ou une isolation des combles), l'audit énergétique n'est pas exigé par l'Anah. En revanche, pour le Parcours Accompagné MaPrimeRénov' qui finance un bouquet de travaux avec gain énergétique minimum de deux classes DPE, l'audit énergétique réglementaire est un préalable obligatoire. Il sert à définir les scénarios de travaux, à dimensionner l'aide et à piloter le dossier. L'audit est également obligatoire pour la vente d'une maison classée F ou G depuis le 1er avril 2023, et classe E depuis le 1er janvier 2025, au titre de la loi Climat et Résilience.",
  },
  {
    question: 'Combien de temps un audit énergétique est-il valide ?',
    answer:
      "La durée de validité d'un audit énergétique réglementaire est de 5 ans à compter de sa date de remise. Au-delà de ce délai, il doit être refait si l'on souhaite le mobiliser dans le cadre d'une vente ou d'un dossier d'aides publiques. Cette durée de validité vise à garantir que les hypothèses (prix de l'énergie, référentiels de calcul, état réel du bâti) restent à jour. Si des travaux significatifs ont été réalisés entre-temps, il est également recommandé de faire actualiser l'audit pour refléter la nouvelle réalité du logement.",
  },
  {
    question: 'Puis-je faire plusieurs audits énergétiques ?',
    answer:
      "Oui, rien n'interdit de faire réaliser plusieurs audits énergétiques, notamment pour obtenir un deuxième avis ou comparer les scénarios proposés par différents professionnels. En revanche, les aides publiques (forfait MaPrimeRénov' audit) ne financent qu'un seul audit par logement et par période. Les audits supplémentaires restent donc entièrement à votre charge. En cas de doute sérieux sur la qualité d'un audit reçu, un second avis indépendant coûte moins cher que des travaux mal orientés.",
  },
  {
    question: "L'audit énergétique inclut-il la thermographie infrarouge ?",
    answer:
      "Non, la thermographie infrarouge n'est pas une obligation réglementaire de l'audit énergétique tel que défini par l'arrêté du 4 mai 2022 modifié. C'est toutefois une prestation complémentaire très recommandée, notamment sur les bâtis anciens, car elle permet de détecter visuellement les ponts thermiques, les défauts d'isolation et certaines infiltrations d'air qu'un relevé classique ne verrait pas. Beaucoup d'auditeurs la proposent en option pour 150 à 400 € supplémentaires. Elle se fait idéalement en période de chauffe, avec un écart de température d'au moins 10 °C entre intérieur et extérieur.",
  },
  {
    question: 'Puis-je contester un audit énergétique qui me semble mauvais ?',
    answer:
      "Oui. Un audit énergétique est une prestation intellectuelle soumise aux règles de la responsabilité contractuelle et, pour les professionnels RGE certifiés, au respect d'un référentiel technique. Si l'audit ne respecte pas le cahier des charges de l'arrêté du 4 mai 2022 modifié (absence de scénarios, classement DPE incohérent, calculs manquants), vous pouvez commencer par une réclamation écrite à l'auditeur, puis saisir l'organisme de qualification (Qualibat, OPQIBI) qui peut engager une procédure de contrôle. En dernier recours, le médiateur de la consommation ou le tribunal compétent peuvent être saisis. Un second auditeur qualifié peut produire une contre-expertise.",
  },
  {
    question: "Audit énergétique et DPE : c'est la même chose ?",
    answer:
      "Non, ce sont deux documents distincts même s'ils utilisent des méthodes de calcul proches. Le DPE (Diagnostic de Performance Énergétique) est un diagnostic obligatoire pour la vente ou la location, réalisé par un diagnostiqueur certifié, qui produit une étiquette de A à G et une estimation de consommation. L'audit énergétique réglementaire va beaucoup plus loin : il comprend un relevé complet du bâti, une modélisation thermique détaillée, un classement DPE actuel, et surtout deux scénarios de travaux chiffrés avec classement DPE projeté après travaux, économies d'énergie estimées et coût prévisionnel. Le DPE dit « où vous en êtes », l'audit dit « comment progresser ».",
  },
  {
    question: 'Un audit gratuit ou offert par un installateur est-il fiable ?',
    answer:
      "À considérer avec prudence. Un audit énergétique sérieux représente plusieurs heures de relevé sur site, plusieurs heures de modélisation et la mobilisation d'un professionnel qualifié : il a un coût réel. Lorsqu'il est proposé « gratuit » par un installateur ou un démarcheur, c'est généralement qu'il est financé par la marge d'un contrat de travaux associé, ce qui place l'auditeur en situation de conflit d'intérêts. L'audit risque alors d'orienter les scénarios vers les produits de l'installateur plutôt que vers le meilleur intérêt thermique du logement. Pour être éligible aux aides publiques, l'audit doit en outre être réalisé par un professionnel certifié RGE audit, condition que la plupart des démarcheurs ne remplissent pas.",
  },
]

export const metadata: Metadata = {
  title: 'Tarifs audit énergétique 2026 : aides',
  description:
    "Combien coûte un audit énergétique réglementaire 2026 ? Prix, forfait MaPrimeRénov' audit, aides cumulables, rentabilité, choix auditeur, FAQ.",
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    locale: 'fr_FR',
    title: 'Tarifs audit énergétique 2026 : prix, aides et retour sur investissement',
    description:
      "Prix moyens d'un audit énergétique, forfait MaPrimeRénov' audit, rentabilité et critères de choix d'un auditeur certifié RGE.",
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: 'article',
    publishedTime: PUBLISHED_AT,
    modifiedTime: UPDATED_AT,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs audit énergétique 2026',
    description:
      "Prix, aides MaPrimeRénov' audit et critères de choix d'un auditeur qualifié en 2026.",
  },
}

export default function TarifsAuditEnergetiquePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique RGE', url: '/rge' },
    { name: 'Tarifs audit énergétique', url: PAGE_PATH },
  ])

  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: `${SITE_URL}${PAGE_PATH}`,
    name: 'FAQ — Tarifs audit énergétique',
    includeSpeakable: true,
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    image: `${SITE_URL}/opengraph-image`,
    headline: 'Tarifs audit énergétique 2026 : prix, aides et retour sur investissement',
    description:
      "Guide de référence sur les tarifs de l'audit énergétique réglementaire en 2026 : fourchettes de prix, forfait MaPrimeRénov' audit, rentabilité et critères de choix d'un auditeur certifié RGE.",
    datePublished: PUBLISHED_AT,
    dateModified: UPDATED_AT,
    inLanguage: 'fr-FR',
    url: PAGE_URL,
    mainEntityOfPage: PAGE_URL,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    about: [
      { '@type': 'Thing', name: 'Audit énergétique réglementaire' },
      { '@type': 'Thing', name: "MaPrimeRénov' Parcours Accompagné" },
      { '@type': 'Thing', name: 'Rénovation énergétique' },
    ],
  }

  const jsonLdItems: Record<string, unknown>[] = [breadcrumbSchema, articleSchema]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Rénovation énergétique RGE', href: '/rge' },
          { label: 'Tarifs audit énergétique' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Landmark className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Mis à jour pour MaPrimeRénov' 2026
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5"
          >
            Tarifs audit énergétique 2026 : prix, aides et retour sur investissement
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished={PUBLISHED_AT}
            dateModified={UPDATED_AT}
            className="justify-start mt-2 text-emerald-50/80"
          />
          <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl leading-relaxed">
            Depuis le 1er avril 2023, l'audit énergétique est obligatoire pour vendre une maison
            classée F ou G, et depuis le 1er janvier 2025 pour les maisons classées E. Il est aussi
            la porte d'entrée du Parcours Accompagné MaPrimeRénov'. Ce guide détaille honnêtement
            les fourchettes de prix 2026, les aides mobilisables, la rentabilité réelle et les
            pièges à éviter pour choisir son auditeur.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Obtenir un devis gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/rge/qualifications/architecte-audit-energetique"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-300/30 text-white font-semibold hover:bg-emerald-500/20 transition"
            >
              Guide qualification audit
              <BookOpen className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sommaire rapide */}
      <section className="bg-sand-50 border-y border-charcoal-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wide mb-3">
            Sur cette page
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-charcoal-700 text-sm">
            <li>• Qu'est-ce qu'un audit énergétique réglementaire</li>
            <li>• Qui peut le réaliser</li>
            <li>• Fourchettes de prix 2026</li>
            <li>• Aides mobilisables</li>
            <li>• Est-ce rentable ?</li>
            <li>• Comment choisir son auditeur</li>
            <li>• Questions fréquentes</li>
          </ul>
        </div>
      </section>

      {/* Section 1 — Définition */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <FileCheck2 className="w-7 h-7 text-emerald-700" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900">
              Qu'est-ce qu'un audit énergétique réglementaire&nbsp;?
            </h2>
          </div>
          <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-charcoal-700">
            <p>
              L'audit énergétique réglementaire est un bilan complet de la performance énergétique
              d'un logement. À la différence d'un simple diagnostic, il ne se limite pas à
              photographier l'existant : il produit des{' '}
              <strong>scénarios de travaux chiffrés</strong>, avec le classement DPE actuel, le
              classement DPE projeté après travaux, les économies d'énergie attendues et une
              estimation du coût prévisionnel. L'arrêté du 4 mai 2022 modifié impose qu'au moins
              deux scénarios soient proposés, dont l'un permet d'atteindre la classe B (ou la
              meilleure classe techniquement accessible pour les bâtiments contraints).
            </p>
            <p>
              Le cadre juridique repose sur la <strong>loi Climat et Résilience</strong> (loi
              n°&nbsp;2021-1104 du 22 août 2021) qui a étendu l'obligation d'audit aux ventes de
              maisons individuelles les plus énergivores. Depuis le <strong>1er avril 2023</strong>,
              l'audit est obligatoire pour toute vente de maison individuelle classée{' '}
              <strong>F ou G</strong>. Depuis le <strong>1er janvier 2025</strong>, cette obligation
              a été étendue aux maisons classées <strong>E</strong>. L'audit doit être remis au
              candidat acquéreur dès la première visite, au même titre que le DPE. Le cadre
              technique est défini par l'arrêté du 4 mai 2022 modifié et le décret n°&nbsp;2022-510
              du 8 avril 2022, qui s'appuient sur les articles L.&nbsp;126-28-1 et suivants du code
              de la construction et de l'habitation.
            </p>
            <p>
              <strong>Audit énergétique et DPE ne sont pas la même chose.</strong> Le DPE est un
              diagnostic léger, réalisé par un diagnostiqueur certifié, qui affiche une étiquette de
              A à G. L'audit, lui, est une étude d'ingénierie thermique : il mobilise un bureau
              d'études, un architecte ou un thermicien qualifié, durant plusieurs heures de relevé
              sur site et plusieurs heures de modélisation. Le DPE coûte généralement entre 100 et
              250 € l'audit, lui, se situe à un tout autre ordre de grandeur (voir section prix plus
              bas).
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Qui peut le réaliser */}
      <section className="bg-sand-50 py-16 md:py-20 border-y border-charcoal-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900">
              Qui peut réaliser un audit énergétique réglementaire&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            Seuls quatre types de professionnels sont habilités à réaliser un audit énergétique
            réglementaire en maison individuelle, selon le décret n°&nbsp;2022-780 du 4 mai 2022 :
          </p>
          <ul className="space-y-4 text-charcoal-700">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Architectes</strong> inscrits à l'Ordre (CNOA), sous réserve d'une formation
                complémentaire à l'audit énergétique.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Bureaux d'études</strong> qualifiés <strong>OPQIBI 1905</strong>{' '}
                «&nbsp;Audit énergétique des bâtiments (toutes catégories)&nbsp;» ou{' '}
                <strong>1911</strong> «&nbsp;Audit énergétique des maisons individuelles&nbsp;».
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Entreprises qualifiées Qualibat 8731</strong> «&nbsp;Audit énergétique en
                maison individuelle&nbsp;» ou équivalent reconnu.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Thermiciens certifiés</strong> rattachés à un organisme reconnu
                (certification individuelle type Cerqual, Cequami).
              </span>
            </li>
          </ul>

          <div className="mt-6 p-5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>Important :</strong> la qualification RGE audit est{' '}
                <strong>obligatoire</strong> pour que l'audit soit éligible au forfait MaPrimeRénov'
                audit et ouvre les droits au Parcours Accompagné. Un audit réalisé par un
                professionnel non certifié RGE peut être techniquement correct, mais il ne
                déclenchera aucune aide publique.
              </p>
            </div>
          </div>

          <p className="mt-6 text-charcoal-700 leading-relaxed">
            Pour comprendre en détail le fonctionnement des qualifications et vérifier un
            professionnel, consultez notre guide dédié :{' '}
            <Link
              href="/rge/qualifications/architecte-audit-energetique"
              className="text-emerald-700 font-semibold underline underline-offset-2 hover:text-emerald-800"
            >
              qualification RGE «&nbsp;Architecte – Audit énergétique&nbsp;»
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Section 3 — Combien ça coûte */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <Euro className="w-7 h-7 text-emerald-700" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900">
              Combien coûte un audit énergétique en 2026&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Il n'existe pas de tarif officiel unique pour l'audit énergétique réglementaire : le
            prix est libre et dépend de la surface, de la complexité du bâti, de l'ancienneté du
            logement, de la région, du nombre de scénarios demandés et des prestations
            complémentaires (thermographie, visite de restitution). Les fourchettes ci-dessous sont
            des <strong>ordres de grandeur</strong> constatés sur le marché en 2026, à valider
            systématiquement par un devis.
          </p>

          <div className="mt-8 overflow-x-auto border border-charcoal-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-sand-200 text-charcoal-700 text-sm uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Profil de logement</th>
                  <th className="px-4 py-3">Fourchette indicative</th>
                  <th className="px-4 py-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-200 text-sm">
                {PRICE_RANGES.map((row) => (
                  <tr key={row.profil} className="align-top">
                    <td className="px-4 py-4 font-semibold text-charcoal-900">{row.profil}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-700 whitespace-nowrap">
                      {row.fourchette}
                    </td>
                    <td className="px-4 py-4 text-charcoal-600 leading-relaxed">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-sky-50 border border-sky-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-sky-900 leading-relaxed">
                <p className="mb-2">
                  <strong>Ces fourchettes ne sont pas des prix fermes.</strong> Un même logement
                  peut obtenir deux devis qui s'écartent de 30 à 50 % : c'est normal, la prestation
                  n'est pas normalisée. Les variables principales sont la surface et le volume
                  chauffé, la complexité du bâti (ancien vs récent, extensions, mélanges de
                  matériaux), la région, le nombre de scénarios chiffrés, la présence ou non d'une
                  thermographie et d'une visite de restitution.
                </p>
                <p>
                  <strong>Demandez systématiquement trois devis avant de choisir.</strong> C'est la
                  seule façon d'obtenir un prix juste et de comparer le contenu réel de la
                  prestation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-semibold shadow hover:bg-emerald-800 transition"
            >
              Obtenir jusqu'à 3 devis d'auditeurs qualifiés
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4 — Aides */}
      <section className="bg-sand-50 py-16 md:py-20 border-y border-charcoal-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <Wallet className="w-7 h-7 text-emerald-700" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900">
              Quelles aides permettent de financer un audit énergétique en 2026&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            L'audit énergétique est, dans la plupart des cas, partiellement pris en charge par des
            aides publiques. Trois dispositifs existent en 2026.
          </p>

          <h3 className="font-heading text-xl font-bold text-charcoal-900 mt-6 mb-2">
            1. Forfait MaPrimeRénov' audit
          </h3>
          <p className="text-charcoal-700 leading-relaxed mb-3">
            L'Anah verse un <strong>forfait MaPrimeRénov' audit</strong> aux propriétaires qui font
            réaliser un audit énergétique en amont d'un projet de rénovation. Le montant dépend du
            profil de revenus du ménage (couleurs bleu, jaune, violet, rose) et se situe typiquement
            dans une fourchette de <strong>300 € à 500 € selon le profil</strong>, les ménages les
            plus modestes étant les plus aidés. Les montants exacts sont publiés sur{' '}
            <a
              href="https://www.maprimerenov.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              maprimerenov.gouv.fr
            </a>{' '}
            et évoluent chaque année : consultez-les au moment de votre dossier. Pour en bénéficier,
            l'audit doit impérativement être réalisé par un professionnel certifié RGE audit.
          </p>

          <h3 className="font-heading text-xl font-bold text-charcoal-900 mt-6 mb-2">
            2. Mon Accompagnateur Rénov'
          </h3>
          <p className="text-charcoal-700 leading-relaxed mb-3">
            Créé par le décret n°&nbsp;2022-1035 du 22 juillet 2022, Mon Accompagnateur Rénov' (MAR)
            est un tiers agréé par l'État qui accompagne le ménage dans toutes les étapes de la
            rénovation, audit compris. Son intervention est{' '}
            <strong>obligatoire pour tout dossier en Parcours Accompagné</strong> MaPrimeRénov'
            (bouquet de travaux avec gain d'au moins deux classes DPE). Une partie du coût du MAR
            est prise en charge par l'Anah, jusqu'à 2 000 € pour les ménages très modestes. Lorsque
            l'audit est inclus dans une prestation globale d'accompagnement, la prise en charge peut
            donc aller au-delà du seul forfait audit.
          </p>

          <h3 className="font-heading text-xl font-bold text-charcoal-900 mt-6 mb-2">
            3. Éco-prêt à taux zéro (Éco-PTZ)
          </h3>
          <p className="text-charcoal-700 leading-relaxed mb-3">
            L'Éco-PTZ n'est pas une aide mais un crédit à taux zéro (jusqu'à 50 000 € sur 20 ans),
            qui peut financer l'audit énergétique lorsqu'il est intégré à un projet de travaux
            éligible. Il permet d'étaler le reste à charge sans alourdir le coût global. L'Éco-PTZ
            est cumulable avec MaPrimeRénov' et avec les primes CEE.
          </p>

          <div className="mt-6 p-5 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-900 leading-relaxed">
                <strong>Cas à connaître :</strong> les Certificats d'Économies d'Énergie (CEE) ne
                financent <strong>pas l'audit énergétique seul</strong>. Ils s'appliquent uniquement
                aux travaux physiques d'économies d'énergie listés dans les fiches standardisées
                BAR. En revanche, les CEE restent parfaitement cumulables avec MaPrimeRénov' sur les
                travaux déclenchés par l'audit. Pour la logique de cumul globale, voir notre guide{' '}
                <Link
                  href="/maprimerenov-cumulaison-cee"
                  className="font-semibold underline underline-offset-2"
                >
                  MaPrimeRénov' + CEE
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Rentabilité */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <Scale className="w-7 h-7 text-emerald-700" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900">
              Un audit énergétique est-il rentable en 2026&nbsp;? Analyse honnête
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            La question du retour sur investissement d'un audit énergétique mérite une réponse
            précise. Le coût net réel, après déduction du forfait MaPrimeRénov' audit, se situe
            généralement dans une fourchette de <strong>200 € à 1 000 €</strong> pour la majorité
            des maisons individuelles. La rentabilité s'apprécie sur trois plans.
          </p>

          <h3 className="font-heading text-lg font-bold text-charcoal-900 mt-6 mb-2">
            1. L'audit débloque des aides très supérieures à son coût
          </h3>
          <p className="text-charcoal-700 leading-relaxed mb-3">
            Sans audit, pas d'accès au Parcours Accompagné MaPrimeRénov'. Or le Parcours Accompagné
            plafonne les aides publiques de <strong>40 000 € à 70 000 €</strong> selon le nombre de
            classes DPE gagnées, contre 7 000 à 20 000 € en MPR par geste. Sur un projet de
            rénovation d'ampleur, payer 800 € d'audit (400 € nets après aide) pour débloquer 40 000
            € d'aides supplémentaires est, factuellement, un des meilleurs effets de levier du
            dispositif.
          </p>

          <h3 className="font-heading text-lg font-bold text-charcoal-900 mt-6 mb-2">
            2. L'audit évite les erreurs d'ordre des travaux
          </h3>
          <p className="text-charcoal-700 leading-relaxed mb-3">
            Une erreur courante consiste à remplacer le chauffage avant d'isoler : la nouvelle
            installation est alors surdimensionnée pour un bâti qui sera ensuite isolé, ce qui
            dégrade son rendement et peut provoquer des courts cycles. Un audit sérieux séquence les
            travaux dans le bon ordre (enveloppe d'abord, puis systèmes) et évite ce type d'erreur
            qui peut coûter plusieurs milliers d'euros de matériel mal adapté. À lui seul, ce
            bénéfice rentabilise fréquemment le coût de l'audit.
          </p>

          <h3 className="font-heading text-lg font-bold text-charcoal-900 mt-6 mb-2">
            3. Scénario réaliste chiffré
          </h3>
          <div className="mt-2 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-900 leading-relaxed">
              Maison de 140 m² en zone H2, classée E, propriétaires profil violet. Coût de l'audit :{' '}
              <strong>900 € TTC</strong>. Forfait MaPrimeRénov' audit : environ{' '}
              <strong>400 €</strong>. Reste à charge net : <strong>500 €</strong>. L'audit ouvre un
              dossier Parcours Accompagné avec un bouquet de travaux (isolation combles + isolation
              murs + pompe à chaleur + VMC) chiffré à 38 000 €, aidé à hauteur de ~22 000 € en MPR
              Parcours Accompagné + 3 500 € de primes CEE sur les postes éligibles. Le coût audit de
              500 € nets est entièrement remboursé par la simplification du dossier et par
              l'optimisation du séquencement des travaux.
            </p>
          </div>

          <p className="mt-6 text-charcoal-700 leading-relaxed">
            En résumé : pour un propriétaire qui envisage une rénovation d'ampleur, l'audit est
            quasi systématiquement rentable. Pour un propriétaire qui veut seulement vendre une
            passoire thermique, l'audit est une obligation légale : la question n'est plus sa
            rentabilité mais sa qualité.
          </p>
        </div>
      </section>

      {/* Section 6 — Comment choisir */}
      <section className="bg-sand-50 py-16 md:py-20 border-y border-charcoal-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <ClipboardList className="w-7 h-7 text-emerald-700" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900">
              Comment choisir un auditeur énergétique certifié RGE&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-6">
            Six règles simples permettent d'éviter la majorité des mauvaises surprises.
          </p>
          <ol className="space-y-4 text-charcoal-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                1
              </span>
              <span>
                <strong>Vérifier la qualification RGE audit</strong> sur{' '}
                <a
                  href="https://france-renov.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 underline underline-offset-2"
                >
                  france-renov.gouv.fr
                </a>
                . C'est la seule source officielle. N'acceptez pas un «&nbsp;logo RGE&nbsp;» sur une
                plaquette comme preuve.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                2
              </span>
              <span>
                <strong>Demander au moins trois devis</strong>. Les écarts sont normaux ; comparer
                permet d'identifier la prestation la plus complète, pas nécessairement la moins
                chère.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                3
              </span>
              <span>
                <strong>
                  Exiger la mention «&nbsp;audit réglementaire avec deux scénarios de travaux&nbsp;»
                </strong>{' '}
                conformément à l'arrêté du 4 mai 2022 modifié. Un audit sans scénarios chiffrés
                n'est pas un audit réglementaire.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                4
              </span>
              <span>
                <strong>Vérifier que les scénarios incluent une cible classe C ou mieux</strong>.
                C'est la condition pour ouvrir le maximum d'aides MaPrimeRénov' Parcours Accompagné.
                Un audit qui plafonne à la classe D est souvent sous-dimensionné.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                5
              </span>
              <span>
                <strong>
                  Se méfier des audits «&nbsp;gratuits&nbsp;» ou «&nbsp;offerts&nbsp;»
                </strong>{' '}
                proposés par un installateur. Le conflit d'intérêts est quasi systématique :
                l'auditeur orientera les scénarios vers les produits de l'installateur. Ces audits
                sont par ailleurs rarement éligibles aux aides publiques.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                6
              </span>
              <span>
                <strong>Demander une visite de restitution</strong>. Un bon auditeur ne livre pas
                qu'un PDF : il prend le temps d'expliquer ses calculs, de répondre aux questions et
                de défendre ses scénarios face au propriétaire. Si l'auditeur refuse cet échange,
                changez d'auditeur.
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="group border border-charcoal-200 rounded-xl p-5 bg-white hover:border-emerald-300 transition"
              >
                <summary className="cursor-pointer font-semibold text-charcoal-900 list-none flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-sand-200 text-charcoal-600 flex items-center justify-center group-open:bg-emerald-600 group-open:text-white transition text-sm font-bold"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-charcoal-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">
            Lancez votre audit énergétique avec un professionnel qualifié
          </h2>
          <p className="text-lg text-emerald-50/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Comparez jusqu'à trois devis d'auditeurs RGE certifiés, vérifiez leurs références et
            débloquez votre Parcours Accompagné MaPrimeRénov' en toute sécurité.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Obtenir un devis gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-300/30 text-white font-semibold hover:bg-emerald-500/20 transition"
            >
              Hub rénovation énergétique RGE
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-emerald-500/30">
            <p className="text-sm text-emerald-100/80 mb-3 font-semibold uppercase tracking-wide">
              Pour aller plus loin
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link
                href="/rge/qualifications/architecte-audit-energetique"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Qualification Architecte – Audit énergétique
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/maprimerenov-cumulaison-cee"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Cumul MaPrimeRénov' + CEE
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/cee/bar-th-174/guide"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Guide CEE BAR-TH-174 (rénovation d'ampleur maison individuelle, qui remplace depuis
                2024 l'ancienne BAR-TH-164)
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
