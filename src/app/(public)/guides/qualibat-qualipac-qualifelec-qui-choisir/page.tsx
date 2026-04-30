import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import JsonLd from '@/components/JsonLd'
import { getFAQSchema } from '@/lib/seo/jsonld'
import Breadcrumb from '@/components/Breadcrumb'
import RgeGuideBlock from '@/components/rge/RgeGuideBlock'
import {
  Award,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  Building2,
  Wind,
  Sun,
  Zap,
  TreePine,
  ExternalLink,
  CheckCircle2,
  Search,
} from 'lucide-react'
import { ArticleMeta } from '@/components/ArticleMeta'

const PAGE_URL = `${SITE_URL}/guides/qualibat-qualipac-qualifelec-qui-choisir`

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Qualibat, QualiPAC, Qualifelec : RGE',
  description:
    'Comparatif des qualifications RGE 2026 : Qualibat, QualiPAC, QualiSol, QualiPV, Qualifelec, QualiBois. Quelle qualification pour quels travaux ?',
  alternates: getAlternates('/guides/qualibat-qualipac-qualifelec-qui-choisir'),
  openGraph: {
    title: 'Qualibat, QualiPAC, Qualifelec, QualiSol : quelle qualification RGE choisir ?',
    description:
      "Comparatif 2026 des qualifications RGE, organismes certificateurs et cas pratiques d'application.",
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qualibat, QualiPAC, Qualifelec, QualiSol : quelle qualification RGE choisir ?',
    description:
      "Comparatif 2026 des qualifications RGE, organismes certificateurs et cas pratiques d'application.",
  },
}

const qualifs = [
  {
    nom: 'Qualibat RGE',
    organisme: 'Qualibat',
    icon: Building2,
    couleur: 'bg-primary-100 text-primary-800',
    travaux: [
      'Isolation des combles, murs, planchers',
      "ITE (Isolation Thermique par l'Extérieur)",
      'Menuiseries extérieures performantes',
      'Couverture et toiture isolée',
      'Plâtrerie isolante ITI',
    ],
    details:
      "Qualibat est l'organisme historique de qualification des entreprises du bâtiment. Ses mentions RGE couvrent l'enveloppe du logement (isolation, menuiseries, toiture) et certains systèmes (solaire thermique). Les codes les plus courants : 7141 (isolation combles), 7143 (isolation murs), 8611 (chaudière bois).",
  },
  {
    nom: 'QualiPAC',
    organisme: "Qualit'EnR",
    icon: Wind,
    couleur: 'bg-teal-100 text-teal-800',
    travaux: [
      'Pompe à chaleur air/eau',
      'Pompe à chaleur géothermique',
      'Pompe à chaleur hybride',
      'Chauffe-eau thermodynamique',
      'Climatisation réversible',
    ],
    details:
      "QualiPAC est délivrée par Qualit'EnR pour les installateurs de pompes à chaleur. Elle certifie la maîtrise du dimensionnement, de la pose et de la mise en service. C'est la mention exigée pour toucher MaPrimeRénov' et les CEE sur une PAC.",
  },
  {
    nom: 'QualiSol',
    organisme: "Qualit'EnR",
    icon: Sun,
    couleur: 'bg-amber-100 text-amber-800',
    travaux: [
      'Chauffe-eau solaire individuel (CESI)',
      'Système solaire combiné (SSC)',
      'Solaire thermique collectif',
    ],
    details:
      "QualiSol est la qualification RGE du solaire thermique. Elle ne concerne pas les panneaux photovoltaïques (couverts par QualiPV), mais bien les capteurs qui chauffent l'eau sanitaire ou alimentent un plancher chauffant.",
  },
  {
    nom: 'QualiPV',
    organisme: "Qualit'EnR",
    icon: Zap,
    couleur: 'bg-yellow-100 text-yellow-800',
    travaux: [
      'Panneaux photovoltaïques en toiture',
      'Ombrières photovoltaïques',
      'Solutions hybrides PV + autoconsommation',
    ],
    details:
      "QualiPV certifie les installateurs de panneaux solaires photovoltaïques. La mention est exigée pour bénéficier de la prime à l'autoconsommation et du tarif de rachat garanti par EDF OA sur les installations jusqu'à 100 kWc.",
  },
  {
    nom: 'Qualifelec RGE',
    organisme: 'Qualifelec',
    icon: Zap,
    couleur: 'bg-orange-100 text-orange-800',
    travaux: [
      'Bornes de recharge IRVE',
      'Installations photovoltaïques',
      'Éclairage performant tertiaire',
      'Pilotage et domotique énergétique',
    ],
    details:
      "Qualifelec est l'organisme historique des électriciens. Il propose plusieurs mentions RGE dont « Efficacité énergétique » pour les travaux qui génèrent des économies d'énergie électrique. Indispensable pour les bornes de recharge IRVE financées par les primes Advenir et les CEE.",
  },
  {
    nom: 'QualiBois',
    organisme: "Qualit'EnR",
    icon: TreePine,
    couleur: 'bg-green-100 text-green-800',
    travaux: [
      'Poêle à bûches',
      'Poêle à granulés',
      'Chaudière biomasse individuelle',
      'Insert et foyer fermé bois',
    ],
    details:
      "QualiBois certifie les installateurs d'appareils de chauffage bois. Elle est exigée pour MaPrimeRénov' sur les poêles et chaudières biomasse, ainsi que pour le Coup de pouce Chauffage lors du remplacement d'une chaudière fossile.",
  },
]

const cas = [
  {
    situation: "J'isole mes combles perdus",
    recommandation: 'Qualibat RGE avec mention isolation (codes 7141, 7142, 7144)',
    aide: "MaPrimeRénov' Isolation + Coup de pouce Isolation CEE + TVA 5,5 %",
  },
  {
    situation: "J'installe une pompe à chaleur air/eau",
    recommandation: 'QualiPAC module CET/PAC',
    aide: "MaPrimeRénov' + Coup de pouce Chauffage CEE + éco-PTZ",
  },
  {
    situation: 'Je pose des panneaux photovoltaïques',
    recommandation: 'QualiPV 36 (≤ 36 kWc) ou QualiPV 500 (≤ 500 kWc)',
    aide: "Prime à l'autoconsommation + tarif de rachat EDF OA",
  },
  {
    situation: 'Je remplace ma chaudière fioul par un poêle à granulés',
    recommandation: 'QualiBois module air',
    aide: "MaPrimeRénov' Bois + Coup de pouce Chauffage CEE + prime sortie fioul",
  },
  {
    situation: "J'installe une borne de recharge véhicule électrique",
    recommandation: 'Qualifelec mention IRVE (niveau 1, 2 ou 3 selon puissance)',
    aide: "Prime Advenir + crédit d'impôt borne de recharge",
  },
  {
    situation: "J'isole mes murs par l'extérieur",
    recommandation: 'Qualibat RGE ITE (codes 7131, 7132)',
    aide: "MaPrimeRénov' Isolation + Coup de pouce Isolation CEE (majoré pour ITE)",
  },
]

const faqItems = [
  {
    question: 'Peut-on avoir plusieurs qualifications RGE ?',
    answer:
      "Oui, et c'est même fréquent. Une entreprise générale peut cumuler Qualibat RGE pour l'isolation, QualiPAC pour la pompe à chaleur et QualiBois pour les poêles à granulés. Chaque qualification est délivrée par l'organisme compétent sur un périmètre précis, avec audit de chantier spécifique.",
  },
  {
    question: 'Qui délivre réellement la certification RGE ?',
    answer:
      "Seuls quatre organismes accrédités par le COFRAC délivrent des qualifications RGE : Qualibat (bâtiment), Qualit'EnR (énergies renouvelables : QualiPAC, QualiSol, QualiPV, QualiBois), Qualifelec (électricité) et Certibat (audit). Toute société se disant « RGE » sans qualification d'un de ces organismes est en infraction.",
  },
  {
    question: "Combien coûte une qualification RGE pour l'artisan ?",
    answer:
      "Le coût annuel varie de 600 à 2 500 € selon l'organisme et la taille de l'entreprise. À cela s'ajoutent les frais de formation initiale (15 à 21 heures par mention), le coût de l'audit de chantier obligatoire tous les 4 ans et les équipements techniques requis.",
  },
  {
    question: 'Comment vérifier une qualification RGE ?',
    answer:
      "L'annuaire officiel est accessible gratuitement sur france-renov.gouv.fr/annuaire-rge. Il suffit d'entrer le SIRET ou le nom de l'entreprise pour obtenir la liste exacte des qualifications détenues, leur date de validité et leur périmètre géographique. Ne vous fiez jamais au seul logo « RGE » affiché sur un devis ou un site internet.",
  },
  {
    question: "Que se passe-t-il si l'artisan cesse d'être RGE après la signature du devis ?",
    answer:
      "L'éligibilité aux aides est figée à la date de signature du devis. Si la qualification était valide ce jour-là, la prime reste acquise même si elle expire pendant le chantier. En revanche, en cas d'audit défavorable et de retrait rétroactif, des recours peuvent être engagés par l'État contre l'artisan.",
  },
  {
    question: "Qualibat et Qualit'EnR sont-ils concurrents ?",
    answer:
      "Non, ils sont complémentaires. Qualibat couvre le bâti (enveloppe, second œuvre, couverture) tandis que Qualit'EnR se concentre sur les systèmes énergétiques renouvelables (PAC, bois, solaire). Une entreprise spécialisée « enveloppe + système » aura typiquement les deux qualifications.",
  },
]

const breadcrumbItems = [
  { label: 'Guides', href: '/guides' },
  { label: 'Qualifications RGE : comparatif' },
]

export default function QualificationsRgePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: 'Qualifications RGE : comparatif', item: PAGE_URL },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    image: `${SITE_URL}/opengraph-image`,
    headline:
      'Qualibat, QualiPAC, Qualifelec, QualiSol : quelle qualification RGE choisir selon vos travaux ?',
    description:
      'Comparatif des qualifications RGE 2026 : Qualibat, QualiPAC, QualiSol, QualiPV, Qualifelec, QualiBois.',
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
            Comparatif RGE 2026
          </div>
          <h1
            data-speakable="true"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-charcoal-900 mb-6 font-heading leading-tight"
          >
            Qualibat, QualiPAC, Qualifelec, QualiSol : quelle qualification RGE choisir ?
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished="2026-04-09"
            dateModified="2026-04-09"
            className="justify-center mt-4"
          />
          <p className="text-lg md:text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            {
              'Derrière le label RGE se cachent une dizaine de qualifications distinctes, chacune adaptée à un type de travaux précis. Ce guide vous aide à exiger la bonne mention sur votre devis.'
            }
          </p>
        </section>

        {/* Tableau comparatif rapide */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading">
            Qualibat, QualiPAC ou Qualifelec&nbsp;: quel comparatif rapide&nbsp;?
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-sand-50">
                <tr>
                  <th className="text-left font-semibold text-charcoal-700 p-4">Qualification</th>
                  <th className="text-left font-semibold text-charcoal-700 p-4">Organisme</th>
                  <th className="text-left font-semibold text-charcoal-700 p-4">
                    Domaine principal
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-sand-200">
                  <td className="p-4 font-semibold text-charcoal-900">Qualibat RGE</td>
                  <td className="p-4 text-charcoal-600">Qualibat</td>
                  <td className="p-4 text-charcoal-600">
                    Enveloppe du bâtiment : isolation, menuiseries, toiture, ITE
                  </td>
                </tr>
                <tr className="border-t border-sand-200">
                  <td className="p-4 font-semibold text-charcoal-900">QualiPAC</td>
                  <td className="p-4 text-charcoal-600">Qualit&apos;EnR</td>
                  <td className="p-4 text-charcoal-600">
                    Pompes à chaleur aérothermiques et géothermiques
                  </td>
                </tr>
                <tr className="border-t border-sand-200">
                  <td className="p-4 font-semibold text-charcoal-900">QualiSol</td>
                  <td className="p-4 text-charcoal-600">Qualit&apos;EnR</td>
                  <td className="p-4 text-charcoal-600">
                    Solaire thermique : chauffe-eau solaire, SSC
                  </td>
                </tr>
                <tr className="border-t border-sand-200">
                  <td className="p-4 font-semibold text-charcoal-900">QualiPV</td>
                  <td className="p-4 text-charcoal-600">Qualit&apos;EnR</td>
                  <td className="p-4 text-charcoal-600">
                    Photovoltaïque : panneaux solaires électriques
                  </td>
                </tr>
                <tr className="border-t border-sand-200">
                  <td className="p-4 font-semibold text-charcoal-900">Qualifelec RGE</td>
                  <td className="p-4 text-charcoal-600">Qualifelec</td>
                  <td className="p-4 text-charcoal-600">
                    Électricité performante, bornes de recharge, domotique
                  </td>
                </tr>
                <tr className="border-t border-sand-200">
                  <td className="p-4 font-semibold text-charcoal-900">QualiBois</td>
                  <td className="p-4 text-charcoal-600">Qualit&apos;EnR</td>
                  <td className="p-4 text-charcoal-600">Poêles et chaudières biomasse</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Détail par qualification */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-8 font-heading">
            Quel est le détail de chaque qualification RGE (Qualibat, QualiPAC, Qualifelec)&nbsp;?
          </h2>
          <div className="space-y-6">
            {qualifs.map((q) => {
              const Icon = q.icon
              return (
                <div
                  key={q.nom}
                  className="bg-white rounded-2xl shadow-sm border border-sand-200 p-6 md:p-8"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${q.couleur}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-charcoal-900">{q.nom}</h3>
                      <p className="text-sm text-charcoal-500">Délivrée par {q.organisme}</p>
                    </div>
                  </div>
                  <p className="text-charcoal-700 mb-4 leading-relaxed">{q.details}</p>
                  <div>
                    <div className="text-sm font-semibold text-charcoal-700 mb-2">
                      Travaux couverts :
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {q.travaux.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-charcoal-600">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Cas pratiques */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading">
            Cas pratiques : quelle qualification pour quel chantier ?
          </h2>
          <div className="space-y-4">
            {cas.map((c) => (
              <div
                key={c.situation}
                className="bg-white rounded-xl shadow-sm border border-sand-200 p-6"
              >
                <div className="font-bold text-charcoal-900 mb-2">{c.situation}</div>
                <div className="text-sm text-charcoal-700 mb-1">
                  <span className="font-semibold">Qualification à exiger :</span> {c.recommandation}
                </div>
                <div className="text-sm text-charcoal-600">
                  <span className="font-semibold">Aides accessibles :</span> {c.aide}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comment vérifier */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 md:p-10 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading flex items-center gap-3">
              <Search className="w-8 h-8" />
              Comment vérifier la qualification RGE d&apos;un artisan&nbsp;?
            </h2>
            <p className="text-green-50 leading-relaxed mb-4">
              {
                "Deux outils officiels permettent de vérifier gratuitement l'ensemble des qualifications RGE d'une entreprise :"
              }
            </p>
            <ul className="space-y-3 text-green-50 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>
                  <strong>Annuaire France Rénov&apos; (ADEME)</strong> — annuaire national de
                  référence, mis à jour quotidiennement.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>
                  <strong>Sites des organismes</strong> : qualibat.com, qualit-enr.org,
                  qualifelec.fr pour une vérification directe.
                </span>
              </li>
            </ul>
            <a
              href="https://france-renov.gouv.fr/annuaire-rge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Annuaire officiel France Rénov&apos;
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-8 font-heading flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-green-600" />
            Questions fréquentes
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

        <RgeGuideBlock variant="generic" />

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Trouvez l&apos;artisan RGE avec la bonne qualification
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              {"Comparez les devis d'artisans certifiés selon le type exact de vos travaux."}
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
