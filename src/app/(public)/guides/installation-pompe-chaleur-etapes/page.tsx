import type { Metadata } from 'next'
import Link from 'next/link'
import { Snowflake, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'installation-pompe-chaleur-etapes'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Installation pompe à chaleur : 7 étapes'
const DESCRIPTION =
  'Installation pompe à chaleur : étude énergétique, dimensionnement, choix air-eau vs air-air, pose, mise en service, aides MaPrimeRénov’ 2026.'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: getAlternates(`/guides/${SLUG}`),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Durée totale : 6 à 14 semaines entre audit et mise en service (administratif + commande + pose).',
  'Étude thermique obligatoire pour PAC air-eau : dimensionnement kW selon surface + isolation + déperditions.',
  'Artisan RGE QualiPAC imposé pour toucher MaPrimeRénov’ (4 000-11 000 €) + Coup de pouce CEE (4 000-5 500 €).',
  'Pose réelle : 2-4 jours pour air-eau, 1-2 jours pour air-air split. Test étanchéité fluide obligatoire.',
  'Mise en service : réglages loi d’eau, courbes de chauffe, contrat d’entretien annuel obligatoire.',
]

const howToSteps = [
  {
    name: 'Audit énergétique / visite technique',
    text: "Visite gratuite d'un artisan RGE QualiPAC pour mesurer la maison (surface, isolation, émetteurs existants, fusibles disponibles) et vérifier la faisabilité technique. Durée 45-90 min. Si audit énergétique payant (150-400 €), il est remboursable via MaPrimeRénov' Sérénité.",
  },
  {
    name: 'Choix du type de PAC',
    text: 'Air-eau (le plus aidé) = remplace chaudière, alimente radiateurs et/ou plancher chauffant + ECS. Air-air (split, climatisation réversible) = moins performant, peu aidé. Géothermique = très performant mais forage 8-15k €. Hybride gaz = chaudière gaz + PAC (cas rare, utile en copro ou grandes surfaces).',
  },
  {
    name: 'Devis détaillé + dossier aides',
    text: "3 devis minimum d'artisans RGE. Devis doit mentionner marque, modèle, COP, SCOP, classe énergétique, puissance kW, dimension unité ext, fluide R32/R290. Constitution dossier MaPrimeRénov' (compte Anah) + Coup de pouce CEE (obligataire EDF/Engie/TotalEnergies) avant signature.",
  },
  {
    name: 'Signature et délai de rétractation',
    text: 'Signature devis vaut commande. 14 jours de rétractation (loi Hamon 2014) depuis votre domicile. Acompte 25-30 % à la signature, reste à 50 % à la livraison, solde à la mise en service. Jamais plus de 70 % avant fin travaux.',
  },
  {
    name: 'Pose et raccordements',
    text: 'Durée 2-4 jours. Jour 1 : dépose ancienne chaudière, protection chantier, implantation unité ext (>2 m voisin, hors gel). Jour 2 : perçage mur, raccords frigoriques, raccordement hydraulique + électrique. Jour 3 : mise sous pression, tirage au vide, charge fluide. Jour 4 : tests, mise en route, pilotage.',
  },
  {
    name: 'Mise en service et courbe de chauffe',
    text: "Réglage de la loi d'eau (courbe température eau selon T extérieure), paramétrage thermostats, équilibrage circuits. Délivrance attestation fluide F-Gas + certificat QualiPAC + facture détaillée. Ces documents sont exigés pour les aides.",
  },
  {
    name: 'Instruction aides + entretien annuel',
    text: "Envoi factures à Anah (MaPrimeRénov') et à l'obligé CEE. Délai paiement 4-10 semaines. Souscription contrat entretien annuel (obligatoire décret 2023-444) : 180-280 €/an incluant visite, nettoyage filtres, contrôle fluide.",
  },
]

const faqs = [
  {
    question: 'Quelle est la durée d’installation d’une pompe à chaleur ?',
    answer:
      "Durée moyenne entre signature et mise en service : 6-14 semaines. Décomposition : 2-4 semaines pour commander le matériel (ruptures fréquentes sur certains modèles), 3-7 jours de pose (air-eau), 1-3 semaines de mise au point et acceptation. En rénovation avec remplacement de chaudière, comptez 8-12 semaines. Une installation neuve dans une maison en construction s'intègre au planning global.",
  },
  {
    question: 'Quelle puissance de pompe à chaleur pour ma maison ?',
    answer:
      'Règle empirique (rénovation standard isolée) : 50-70 W/m² habitables. Maison 100 m² correctement isolée = PAC 5-7 kW. Maison 150 m² avec ITE RT2012 = 8-10 kW. Cette règle est insuffisante — un vrai dimensionnement se fait avec bilan thermique (calcul déperditions DIN EN 12831). Surdimensionner = cycles courts, usure prématurée, surconsommation. Sous-dimensionner = appoint électrique massif, factures élevées.',
  },
  {
    question: 'Peut-on installer une PAC en appartement ?',
    answer:
      "Techniquement oui mais complexe. Air-air (split monosplit ou multisplit) : nécessite accord copropriété + autorisation de percer façade. Air-eau : quasiment impossible en copro car l'unité extérieure pose problème (bruit, esthétique balcon, vote AG). Alternative : pompe à chaleur hybride gaz si chaudière collective individualisable, ou système VMC double-flux thermodynamique pour compléter chauffage gaz existant.",
  },
  {
    question: 'Quelles aides en 2026 pour une pompe à chaleur ?',
    answer:
      "MaPrimeRénov' (air-eau uniquement, air-air non aidé) : 4 000 € Rose (rénovation d'ampleur), 5 000 € Violet, 9 000 € Jaune, 11 000 € Bleu. Coup de pouce CEE chauffage : 4 000 € base, 5 500 € avec offre bonifiée (Izi by EDF, Effy, etc.). TVA 5,5 %. Éco-PTZ pour le reste. Cumul possible MaPrimeRénov' + CEE + éco-PTZ. Total aides peut atteindre 11 000-16 500 € sur PAC à 14 000 € TTC.",
  },
  {
    question: 'Faut-il remplacer les radiateurs pour une PAC ?',
    answer:
      'Pas forcément. Une PAC air-eau fonctionne avec radiateurs haute température existants si la chaudière précédente fonctionnait à 65-70 °C et si la maison est bien isolée. Idéal = basse température (plancher chauffant ou radiateurs dimensionnés). Si radiateurs trop petits : déséquilibre, appoint électrique. Sur une rénovation sérieuse, un équilibrage (vannes thermostatiques, désembouage) suffit souvent. Remplacement radiateurs = 150-400 €/pièce si nécessaire.',
  },
  {
    question: 'Quel est le bruit d’une pompe à chaleur ?',
    answer:
      "Unité extérieure : 45-55 dB à 1 m (équivalent murmure à conversation). Réglementation : décret 2006-1099 limite à 3 dB de dépassement au-delà du bruit ambiant nuit. Placer l'unité >2 m du voisin, sur plots antivibratoires, dans un angle non résonnant. Pour copro : choisir modèle 'silent' (42-45 dB). Les modèles Daikin Altherma, Atlantic Alféa Extensa, Mitsubishi Ecodan restent les plus silencieux du marché 2026.",
  },
]

const sources = [
  { label: 'France Rénov’ — Pompe à chaleur', url: 'https://france-renov.gouv.fr' },
  { label: 'Anah — MaPrimeRénov’ PAC air-eau', url: 'https://www.anah.gouv.fr' },
  {
    label: 'QualiPAC — Qualification installateur',
    url: 'https://www.qualit-enr.org/qualifications/qualipac',
  },
  { label: 'Décret 2023-444 — Entretien PAC', url: 'https://www.legifrance.gouv.fr' },
  { label: 'ADEME — Pompe à chaleur', url: 'https://agirpourlatransition.ademe.fr' },
]

const relatedGuides = [
  {
    label: 'Prix pompe à chaleur air-eau installée',
    href: '/guides/prix-pompe-chaleur-air-eau-installee',
  },
  { label: 'Coup de pouce chauffage 2026', href: '/guides/coup-de-pouce-chauffage-2026' },
  { label: 'Chaudière ne chauffe plus', href: '/guides/chaudiere-ne-chauffe-plus' },
  { label: 'Aides rénovation 2026', href: '/guides/aides-renovation-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux spécialisés',
    keywords: [
      'installation pompe à chaleur',
      'étapes pompe à chaleur',
      'PAC air-eau',
      'MaPrimeRénov PAC',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Installation pompe à chaleur', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Installer une pompe à chaleur',
    description: 'Les 7 étapes pour installer une pompe à chaleur air-eau chez soi.',
    totalTime: 'P8W',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Installation pompe à chaleur' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Snowflake className="w-3.5 h-3.5" aria-hidden />
              Travaux spécialisés · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Installation pompe à chaleur : les 7 étapes détaillées
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Installer une pompe à chaleur représente 6-14 semaines entre l’audit thermique et la
              mise en service — plus long qu’un simple remplacement de chaudière. Voici le parcours
              professionnel complet, de la visite technique à l’acceptation des aides MaPrimeRénov’
              2026.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Planning type — installation PAC air-eau</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Semaine</th>
                    <th className="p-3 border-b border-sand-200">Étape</th>
                    <th className="p-3 border-b border-sand-200">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S1', 'Visite technique', 'Mesure maison, isolation, bilan thermique'],
                    ['S2-S3', 'Devis + aides', '3 devis RGE + dossier MPR + CEE'],
                    ['S3', 'Signature', 'Acompte 25-30 %, rétractation 14j'],
                    ['S4-S7', 'Commande matériel', 'Délais fabricant 3-6 semaines'],
                    ['S8', 'Pose', 'Dépose chaudière + installation PAC 2-4j'],
                    ['S9', 'Mise en service', 'Réglages loi d’eau + réception chantier'],
                    ['S10-S14', 'Instruction aides', 'Paiement MPR + CEE 4-10 semaines'],
                  ].map(([s, e, a]) => (
                    <tr key={s} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{s}</td>
                      <td className="p-3">{e}</td>
                      <td className="p-3">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Les 3 types de pompe à chaleur en maison individuelle</h2>
            <ul>
              <li>
                <strong>Air-eau</strong> : la plus aidée, COP 3,5-4,5, remplace chaudière, 8-14 k€
                TTC installée.
              </li>
              <li>
                <strong>Air-air</strong> (climatiseur réversible) : COP 3-3,5, moins aidée, 4-8 k€
                TTC.
              </li>
              <li>
                <strong>Géothermique</strong> (sol-eau) : COP 4-5, forage 8-15 k€ supplémentaires,
                rentable très long terme.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention aux éco-délinquants.</strong> La DGCCRF recense +40 % de plaintes
                sur les installations PAC en 2024-2025 : devis gonflés, pose bâclée, PAC
                sur-dimensionnée. Toujours 3 devis RGE, vérifier qualification QualiPAC sur
                qualit-enr.org, et refuser démarchage téléphonique (interdit pour la rénovation).
              </p>
            </div>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/services/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un pro RGE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
