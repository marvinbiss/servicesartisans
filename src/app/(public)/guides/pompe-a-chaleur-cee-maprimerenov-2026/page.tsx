import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import JsonLd from '@/components/JsonLd'
import { getFAQSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import Breadcrumb from '@/components/Breadcrumb'
import RgeGuideBlock from '@/components/rge/RgeGuideBlock'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import CeeCTA from '@/components/cee/CeeCTA'
import {
  Wind,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Snowflake,
  Droplet,
} from 'lucide-react'
import { ArticleMeta } from '@/components/ArticleMeta'

const PAGE_URL = `${SITE_URL}/guides/pompe-a-chaleur-cee-maprimerenov-2026`

export const revalidate = 86400

export const metadata: Metadata = {
  title: "PAC 2026 : CEE + MaPrimeRénov' cumulables",
  description:
    "Types de PAC, barèmes MaPrimeRénov' 2026, coup de pouce CEE chauffage, cumul total, exemple chiffré et obligation QualiPAC. Guide complet 2026.",
  alternates: getAlternates('/guides/pompe-a-chaleur-cee-maprimerenov-2026'),
  openGraph: {
    title: "Pompe à chaleur 2026 : aides CEE + MaPrimeRénov' cumulables",
    description:
      'Toutes les aides 2026 pour financer votre pompe à chaleur : barèmes, cumul, exemple chiffré et artisan QualiPAC obligatoire.',
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: "Pompe à chaleur 2026 : aides CEE + MaPrimeRénov' cumulables",
    description:
      'Toutes les aides 2026 pour financer votre pompe à chaleur : barèmes, cumul, exemple chiffré et artisan QualiPAC obligatoire.',
  },
}

const typesPac = [
  {
    nom: 'PAC air/eau',
    icon: Droplet,
    description:
      "La PAC air/eau capte les calories de l'air extérieur et les transmet à un circuit d'eau chauffée qui alimente radiateurs, plancher chauffant et ballon ECS. C'est la solution la plus courante pour remplacer une chaudière fioul ou gaz en maison individuelle.",
    cop: 'COP moyen 3,5 à 4,5',
    eligible: "Éligible MaPrimeRénov' + Coup de pouce CEE chauffage",
  },
  {
    nom: 'PAC géothermique',
    icon: Thermometer,
    description:
      "La géothermie capte les calories du sol via des capteurs horizontaux ou des sondes verticales. Plus chère à l'installation, elle offre les meilleurs COP du marché et une très grande stabilité de production même par grand froid.",
    cop: 'COP moyen 4 à 5,5',
    eligible: "Éligible MaPrimeRénov' (barème majoré) + CEE",
  },
  {
    nom: 'PAC hybride',
    icon: Wind,
    description:
      "Associe une PAC air/eau à une chaudière gaz à condensation d'appoint. Le système bascule automatiquement sur la chaudière lorsque les températures extérieures rendent la PAC moins performante. Solution adaptée aux logements mal isolés en attente d'une rénovation globale.",
    cop: 'COP global 3 à 4',
    eligible: "Éligible CEE, non éligible MaPrimeRénov' en 2026 pour le bâti neuf",
  },
  {
    nom: 'PAC air/air',
    icon: Snowflake,
    description:
      "La PAC air/air diffuse directement la chaleur (ou le froid en été) via des unités intérieures soufflantes. Très économique à l'achat, elle ne produit pas d'eau chaude sanitaire et n'est pas éligible à MaPrimeRénov', mais reste éligible aux CEE.",
    cop: 'COP moyen 3 à 4',
    eligible: "Éligible CEE uniquement — pas de MaPrimeRénov'",
  },
]

const criteres = [
  "Coefficient de performance (COP) minimum exigé selon le type de PAC (souvent ≥ 3,5 pour l'air/eau).",
  'Classe énergétique saisonnière (ETAS) supérieure à un seuil réglementaire.',
  'Installation réalisée par un artisan titulaire de la mention RGE QualiPAC valide à la date du devis.',
  "Logement achevé depuis au moins 15 ans (ou 2 ans si remplacement d'une chaudière fioul).",
  "Respect des règles de dimensionnement et présence d'un carnet d'intervention signé par l'installateur.",
]

const exempleChiffre = [
  { poste: 'PAC air/eau 12 kW + ballon tampon + raccordements', montant: '≈ 15 000 € TTC' },
  {
    poste: 'TVA appliquée à 5,5 % au lieu de 20 % (économie immédiate)',
    montant: '− 2 000 € environ',
  },
  { poste: "MaPrimeRénov' (profil modeste, barème 2026)", montant: "plusieurs milliers d'€" },
  { poste: 'Coup de pouce CEE Chauffage (remplacement fioul)', montant: "plusieurs milliers d'€" },
  { poste: "Éco-PTZ sur le reste à charge (jusqu'à 50 000 € à 0 %)", montant: 'financement 0 %' },
  { poste: 'Reste à charge après aides (profil modeste)', montant: '10 à 20 % du coût total' },
]

const faqItems = [
  {
    question: 'Quel type de pompe à chaleur est le plus aidé en 2026 ?',
    answer:
      "La PAC air/eau est le système le plus financé en 2026 car il cumule MaPrimeRénov' et le Coup de pouce Chauffage CEE. La PAC géothermique bénéficie d'un barème MaPrimeRénov' majoré mais reste plus rare en raison du coût de forage. La PAC air/air, très populaire, est uniquement éligible aux CEE et non à MaPrimeRénov'.",
  },
  {
    question: 'Le QualiPAC est-il obligatoire ou juste recommandé ?',
    answer:
      "Obligatoire. Sans la mention QualiPAC valide à la date du devis, ni MaPrimeRénov', ni le Coup de pouce CEE, ni la TVA réduite ne peuvent être activés. C'est la seule qualification reconnue par l'État pour l'installation des pompes à chaleur.",
  },
  {
    question: 'Quel COP faut-il viser pour être éligible aux aides ?',
    answer:
      "Pour MaPrimeRénov', la PAC air/eau doit afficher un ETAS supérieur à un seuil réglementaire (environ 126 % basse température ou 111 % moyenne température). Les équipements inscrits sur les catalogues des fabricants mentionnent explicitement « éligible MaPrimeRénov' ». Évitez les modèles d'entrée de gamme qui ne passent pas la grille.",
  },
  {
    question: 'Peut-on remplacer une PAC existante par une autre PAC avec les aides ?',
    answer:
      "Non, pas au titre du Coup de pouce Chauffage qui cible le remplacement de chaudières fossiles (fioul, gaz, charbon). MaPrimeRénov' peut toutefois financer un remplacement PAC → PAC performante dans certaines conditions, notamment si l'ancienne PAC est obsolète ou hors service, avec un gain énergétique prouvé.",
  },
  {
    question: "La PAC peut-elle produire l'eau chaude sanitaire ?",
    answer:
      "Oui. La plupart des PAC air/eau modernes intègrent un ballon de 150 à 250 litres permettant de produire l'ECS par effet thermodynamique. Cette configuration évite l'installation d'un chauffe-eau séparé et améliore le rendement global du système. Les modèles double service sont majoritaires sur le marché 2026.",
  },
  {
    question: "Combien de temps dure l'installation d'une pompe à chaleur ?",
    answer:
      "Pour une PAC air/eau en remplacement d'une chaudière existante, comptez 2 à 4 jours de travaux selon la complexité hydraulique. Une géothermie avec sondes verticales demande 1 à 2 semaines à cause du forage. Prévoir également 24 à 48 h de mise en service et de paramétrage avant utilisation optimale.",
  },
  {
    question: 'Quel entretien est obligatoire sur une pompe à chaleur ?',
    answer:
      "Depuis le décret entretien PAC, un contrôle tous les 2 ans est obligatoire pour les PAC de plus de 4 kW. Il porte sur l'état du fluide frigorigène, le nettoyage des échangeurs, la vérification des pressions et la mesure du COP effectif. L'entretien doit être réalisé par un technicien titulaire de l'attestation de capacité fluides.",
  },
]

const breadcrumbItems = [
  { label: 'Guides', href: '/guides' },
  { label: 'Pompe à chaleur 2026 : aides cumulables' },
]

const G_AUTHOR = authors['claire-dubois']
const G_REVIEWER = getReviewerForAuthor(G_AUTHOR)

export default function PacAidesCumulablesPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Pompe à chaleur 2026 : aides cumulables',
        item: PAGE_URL,
      },
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
    headline: "Pompe à chaleur 2026 : aides CEE + MaPrimeRénov' cumulables",
    description:
      "Types de PAC, barèmes MaPrimeRénov' 2026, coup de pouce CEE chauffage, cumul total, exemple chiffré et obligation QualiPAC.",
    author: G_AUTHOR
      ? {
          '@type': 'Person',
          name: G_AUTHOR.name,
          jobTitle: G_AUTHOR.role,
          url: `${SITE_URL}/equipe/${G_AUTHOR.slug}`,
          ...(G_AUTHOR.methodology &&
            G_AUTHOR.methodology.length > 0 && { skills: G_AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(G_REVIEWER && { reviewedBy: getReviewedByPersonSchema(G_REVIEWER) }),
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
            <Wind className="w-4 h-4" />
            Guide PAC 2026
          </div>
          <h1
            data-speakable="true"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-charcoal-900 mb-6 font-heading leading-tight"
          >
            Pompe à chaleur 2026 : aides CEE + MaPrimeRénov&apos; cumulables
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished="2026-04-09"
            dateModified="2026-04-09"
            className="justify-center mt-4"
          />
          <p className="text-lg md:text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
            {
              "Types de PAC, barèmes MaPrimeRénov' 2026, coup de pouce CEE, cumul total possible et exemple chiffré pour financer jusqu'à 80 % de votre projet avec un artisan QualiPAC."
            }
          </p>
        </section>

        {/* Types de PAC */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-8 font-heading">
            Quelles sont les 4 grandes familles de pompes à chaleur en 2026&nbsp;?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {typesPac.map((t) => {
              const Icon = t.icon
              return (
                <div
                  key={t.nom}
                  className="bg-white rounded-xl shadow-sm border border-sand-200 p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-green-700" />
                    </div>
                    <h3 className="text-lg font-bold text-charcoal-900">{t.nom}</h3>
                  </div>
                  <p className="text-charcoal-600 mb-3 leading-relaxed text-sm">{t.description}</p>
                  <div className="text-xs text-charcoal-500 space-y-1">
                    <div>
                      <strong>Performance :</strong> {t.cop}
                    </div>
                    <div>
                      <strong>Aides :</strong> {t.eligible}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Barèmes MaPrimeRénov */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading">
              Quelles sont les aides MaPrimeRénov&apos; 2026 pour les pompes à chaleur&nbsp;?
            </h2>
            <div className="prose prose-lg max-w-none text-charcoal-700">
              <p>
                {
                  "MaPrimeRénov' finance les PAC air/eau et géothermiques selon les barèmes 2026 en vigueur, avec une prime différenciée pour chaque profil de revenus (Bleu, Jaune, Violet, Rose). Plus le ménage est modeste, plus la prime par geste est élevée."
                }
              </p>
              <p>
                {
                  "Les PAC air/air sont exclues de MaPrimeRénov' depuis plusieurs années : elles ne chauffent pas l'eau sanitaire et sont jugées moins performantes pour la rénovation globale. Elles restent en revanche éligibles aux CEE."
                }
              </p>
              <p>
                {
                  "Depuis 2026, les chaudières gaz — même à très haute performance — ne sont plus éligibles à MaPrimeRénov'. L'État concentre désormais son effort sur les systèmes 100 % décarbonés : PAC, biomasse, solaire thermique, réseaux de chaleur."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Coup de pouce CEE */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 md:p-10 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Qu&apos;est-ce que le Coup de pouce Chauffage CEE 2026 pour les pompes à
              chaleur&nbsp;?
            </h2>
            <p className="text-green-50 leading-relaxed mb-4">
              {
                "Le Coup de pouce Chauffage est une bonification des Certificats d'Économies d'Énergie (CEE) qui cible le remplacement d'une chaudière fioul, charbon ou gaz non condensation par un équipement décarboné performant. Il est versé directement par un obligé ou un délégataire (Effy, Sonergia, TotalEnergies, Engie…)."
              }
            </p>
            <p className="text-green-50 leading-relaxed mb-4">
              {
                "Le montant dépend des revenus du ménage et du type de PAC installée. Pour les ménages très modestes, le cumul CEE + MaPrimeRénov' peut couvrir la quasi-totalité du chantier. Pour les profils supérieurs, la prime CEE reste un complément utile qui descend le reste à charge de plusieurs milliers d'euros."
              }
            </p>
            <ul className="space-y-2 text-green-50">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>
                  Remplacement chaudière fioul, gaz, charbon → PAC air/eau, géothermique ou hybride
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>Artisan QualiPAC obligatoire</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                <span>Lettre d&apos;engagement à signer AVANT le devis de l&apos;artisan</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Critères d'éligibilité */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading">
            Quels sont les critères techniques d&apos;éligibilité des pompes à chaleur aux aides
            2026&nbsp;?
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
            <ul className="space-y-3">
              {criteres.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-charcoal-700">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Exemple chiffré */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6 font-heading flex items-center gap-3">
            <Calculator className="w-8 h-8 text-green-600" />
            Exemple chiffré : remplacer une chaudière fioul par une PAC
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand-50">
                <tr>
                  <th className="text-left font-semibold text-charcoal-700 p-4">Poste</th>
                  <th className="text-right font-semibold text-charcoal-700 p-4">Montant</th>
                </tr>
              </thead>
              <tbody>
                {exempleChiffre.map((e) => (
                  <tr key={e.poste} className="border-t border-sand-200">
                    <td className="p-4 text-charcoal-900">{e.poste}</td>
                    <td className="p-4 text-right font-semibold text-charcoal-900">{e.montant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              {
                "Les montants exacts dépendent du profil de ressources, du délégataire CEE retenu, de la zone climatique et des caractéristiques techniques de l'équipement. Utilisez toujours le simulateur officiel MaPrimeRénov' avant de signer."
              }
            </p>
          </div>
        </section>

        {/* Choix artisan */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-4 font-heading flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-green-600" />
              Comment choisir un artisan QualiPAC pour sa pompe à chaleur&nbsp;?
            </h2>
            <p className="text-charcoal-700 mb-4 leading-relaxed">
              {
                "QualiPAC est la seule qualification RGE reconnue pour les pompes à chaleur. Elle est délivrée par Qualit'EnR après une formation de 21 heures, un examen théorique et un audit de chantier réalisé dans les 24 mois suivant la qualification. L'artisan doit la renouveler tous les 4 ans."
              }
            </p>
            <p className="text-charcoal-700 mb-4 leading-relaxed">
              {
                "Au-delà de la certification, vérifiez que votre installateur : (1) réalise une étude thermique de votre logement, (2) propose un dimensionnement chiffré et justifié (pas un abaque générique), (3) remet un carnet d'intervention complet, (4) fournit un contrat d'entretien pour les années à venir."
              }
            </p>
            <p className="text-charcoal-700 leading-relaxed">
              {
                "Consultez notre guide dédié à la certification RGE et ses qualifications pour comprendre l'écosystème complet."
              }
            </p>
            <Link
              href="/guides/qualibat-qualipac-qualifelec-qui-choisir"
              className="inline-flex items-center gap-2 mt-4 text-green-700 font-semibold hover:text-green-800"
            >
              Voir le guide des qualifications RGE →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-8 font-heading flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-green-600" />
            Questions fréquentes PAC 2026
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

        <RgeGuideBlock variant="service" serviceSlug="pompe-a-chaleur" />

        {/* CTA inline CEE */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <CeeCTA variant="inline" serviceSlug="pompe-a-chaleur" operationCode="BAR-TH-171" />
        </div>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Devis gratuit pour votre pompe à chaleur
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              {
                "Obtenez rapidement un devis personnalisé d'un installateur QualiPAC près de chez vous."
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
                href="/services/pompe-a-chaleur"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-400 transition-colors border border-green-400"
              >
                <Wind className="w-5 h-5" />
                Voir les artisans PAC
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
