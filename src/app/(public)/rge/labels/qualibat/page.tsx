/**
 * Page : /rge/labels/qualibat
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "qualibat"                  → 9 344 vol, KD 2, CPC $0,02, clicks 9 448 ⭐⭐⭐
 * - "qualibat rge"              → variant cumulant ~200-500 vol estimé
 * - "qualibat 5911"             → mention spéc. (longue traîne ~50-100 vol)
 * - "qualibat 7131"             → mention ITE (longue traîne ~50-100 vol)
 * - "qualibat liste"            → variant intent annuaire
 * - Famille cumulée pivot : ~10 000 vol/mois
 *
 * Source : audit Ahrefs API live. Easy win MASSIF (KD 2 sur 9K vol).
 * Easy win : OUI ABSOLU (KD 2, vol > 9 000, clicks > 9 000 dans SERP)
 * Cluster pillar : RGE → Labels et qualifications
 *
 * Anti-cannibalisation :
 *   - /rge/qualifications (hub liste)
 *   - /rge/glossaire (définitions courtes)
 *   - /rge/comment-devenir-rge (process artisan)
 *   - Cette page = monographie label Qualibat (organisme + mentions + obtention + check)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Search,
  Users,
  Building2,
  FileText,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/rge/labels/qualibat'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Qualibat 2026 : qualifications, mentions, vérification'
const DESCRIPTION =
  'Qualibat 2026 : organisme certificateur RGE n°1 en France. 230+ qualifications, mentions RGE, durée 4 ans. Vérifier un Qualibat en 30s + obtention.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Qualibat est l’organisme certificateur RGE n°1 en France (40 % des artisans RGE certifiés).',
  'Plus de 230 qualifications techniques (gros œuvre, second œuvre, rénovation énergétique).',
  'Mentions RGE Qualibat permettent de bénéficier de MaPrimeRénov’, CEE et TVA 5,5 % pour les travaux énergétiques.',
  'Validité 4 ans, audit annuel obligatoire avec audit terrain tous les 4 ans.',
  'Vérification gratuite en 30 secondes sur qualibat.com (annuaire officiel).',
]

const MENTIONS_RGE = [
  {
    code: '5911',
    label: 'Isolation thermique par l’extérieur (ITE)',
    travaux: 'Bardage rapporté, enduit sur isolant, vêture',
    aides: 'MaPrimeRénov’ ITE + Coup de pouce CEE',
  },
  {
    code: '5912',
    label: 'Isolation thermique par l’intérieur (ITI)',
    travaux: 'Doublage isolant murs intérieurs',
    aides: 'MaPrimeRénov’ ITI + CEE',
  },
  {
    code: '7131',
    label: 'Isolation thermique des combles perdus',
    travaux: 'Soufflage laine de verre/roche, ouate de cellulose',
    aides: 'MaPrimeRénov’ combles + Coup de pouce CEE',
  },
  {
    code: '7141',
    label: 'Isolation thermique des combles aménagés',
    travaux: 'Isolation rampants sous toiture',
    aides: 'MaPrimeRénov’ + CEE',
  },
  {
    code: '8112',
    label: 'Installation de chaudière condensation',
    travaux: 'Pose chaudière gaz à condensation',
    aides: 'MaPrimeRénov’ chaudière + CEE',
  },
  {
    code: '8731',
    label: 'Pose de menuiseries extérieures',
    travaux: 'Fenêtres, portes-fenêtres, volets',
    aides: 'MaPrimeRénov’ fenêtres (sous conditions)',
  },
  {
    code: '8211',
    label: 'Couverture (toitures inclinées)',
    travaux: 'Tuiles, ardoises, étanchéité toiture',
    aides: 'MaPrimeRénov’ toiture (si isolation associée)',
  },
]

const ETAPES_OBTENTION = [
  {
    step: 'Dossier candidature',
    detail:
      'L’entreprise dépose un dossier en ligne sur qualibat.com : SIRET, RIB, attestations URSSAF, garantie décennale (obligatoire), CV technique des dirigeants, références chantiers (3 chantiers minimum sur 4 ans).',
  },
  {
    step: 'Examen formel',
    detail:
      'Qualibat vérifie la complétude administrative (Kbis, RC professionnelle, qualifications professionnelles des dirigeants). Délai 4-8 semaines.',
  },
  {
    step: 'Audit technique',
    detail:
      'Pour les mentions RGE (énergétique), un audit chantier est obligatoire dans les 24 premiers mois. Vérifie la conformité des chantiers, la qualité des mises en œuvre, la traçabilité.',
  },
  {
    step: 'Décision Commission',
    detail:
      'La Commission régionale d’examen statue sur la qualification (probatoire 2 ans, puis confirmée pour 2 ans supplémentaires). Recours possible en cas de refus.',
  },
  {
    step: 'Maintien',
    detail:
      'Audit annuel obligatoire (déclaration chantiers + facturation), audit terrain tous les 4 ans pour le renouvellement RGE. Coût annuel : 250-1 500 € selon CA et nombre de qualifications.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que Qualibat ?',
    answer:
      'Qualibat est un organisme indépendant créé en 1949 pour qualifier et certifier les entreprises du bâtiment en France. C’est le 1er organisme certificateur RGE (Reconnu Garant de l’Environnement) avec environ 40 % des artisans RGE certifiés. Il délivre plus de 230 qualifications techniques et certifications, dont les mentions RGE qui ouvrent droit aux aides MaPrimeRénov’, CEE et TVA 5,5 %.',
  },
  {
    question: 'Comment vérifier qu’un artisan est bien Qualibat ?',
    answer:
      'Rendez-vous sur l’annuaire officiel qualibat.com et tapez le nom ou le SIRET de l’entreprise. La fiche affiche en temps réel les qualifications en cours de validité, leur date d’expiration et les mentions RGE associées. La vérification est gratuite et prend 30 secondes. Une attestation Qualibat photocopiée n’est pas suffisante : seule la consultation directe en ligne fait foi.',
  },
  {
    question: 'Quelle différence entre Qualibat et Qualibat RGE ?',
    answer:
      'Qualibat est l’organisme certificateur. « Qualibat RGE » désigne les qualifications Qualibat qui portent une mention RGE (Reconnu Garant de l’Environnement). Toutes les qualifications Qualibat ne sont pas RGE : seules celles correspondant à des travaux énergétiques (isolation, chauffage performant, ENR, menuiseries) le sont. Pour bénéficier des aides publiques, vérifier que la qualification précise « RGE ».',
  },
  {
    question: 'Combien coûte une certification Qualibat pour un artisan ?',
    answer:
      'Le coût annuel varie de 250 à 1 500 € selon le chiffre d’affaires de l’entreprise et le nombre de qualifications détenues. À l’inscription, prévoir 500-2 000 € pour la première qualification (frais de dossier + audit technique). Pour le maintien, audit annuel sur facturation + audit terrain tous les 4 ans pour les RGE (300-800 € par audit).',
  },
  {
    question: 'Quelle est la durée de validité d’une qualification Qualibat ?',
    answer:
      '4 ans pour la qualification standard, avec un cycle : 2 ans probatoires (chantiers audités) puis 2 ans confirmés. Renouvellement obligatoire tous les 4 ans avec audit terrain. Audit annuel administratif obligatoire entre-temps (déclaration chantiers + maintien des assurances + à jour des cotisations sociales).',
  },
  {
    question: 'Quelles sont les principales mentions RGE Qualibat pour la rénovation énergétique ?',
    answer:
      'Les codes les plus fréquents : 5911 (ITE), 5912 (ITI), 7131 (combles perdus), 7141 (combles aménagés), 8112 (chaudière condensation), 8731 (menuiseries). Chaque mention correspond à un poste de travaux précis et conditionne l’éligibilité aux aides publiques. Une entreprise peut détenir plusieurs mentions simultanément.',
  },
  {
    question: 'Que faire si mon artisan a perdu son Qualibat ?',
    answer:
      'Si la qualification est expirée ou suspendue à la date de signature du devis, vous perdez l’éligibilité aux aides (MaPrimeRénov’, CEE) et la TVA passe de 5,5 % à 20 %. Trois actions : (1) vérifier sur qualibat.com, (2) demander à l’artisan une attestation à jour, (3) si suspension récente, attendre la réinscription ou changer d’artisan. Un artisan peut perdre Qualibat pour défaut d’audit, sinistre majeur ou cessation d’activité.',
  },
  {
    question: 'Qualibat ou Qualifelec : laquelle choisir ?',
    answer:
      'Les deux sont des organismes certificateurs RGE distincts et complémentaires. Qualibat couvre principalement le gros œuvre, second œuvre, isolation, menuiseries, plomberie et chauffage. Qualifelec couvre les électriciens (IRVE bornes recharge, domotique, photovoltaïque, normes NF C 15-100). Pour des travaux multi-corps d’état, votre artisan peut être certifié par les deux organismes.',
  },
]

const sources = [
  { label: 'Qualibat — Annuaire officiel', url: 'https://www.qualibat.com' },
  { label: 'France Rénov’ — Annuaire RGE', url: 'https://france-renov.gouv.fr/annuaire-rge' },
  { label: 'Qualit’EnR — Organismes certificateurs RGE', url: 'https://www.qualit-enr.org' },
  {
    label: 'Service-Public.fr — Reconnu Garant Environnement',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35632',
  },
  { label: 'ADEME — Annuaire professionnels rénovation', url: 'https://agir.ademe.fr' },
]

const relatedPages = [
  {
    label: 'QualiPAC : label RGE pompe à chaleur',
    href: '/rge/labels/qualipac',
    description: 'Label spécialisé chauffagistes PAC, conditions et obtention',
  },
  {
    label: 'Comment devenir RGE',
    href: '/rge/comment-devenir-rge',
    description: 'Process complet pour les artisans candidats à la certification',
  },
  {
    label: 'Vérifier un artisan RGE — détecter les fraudes',
    href: '/rge/fraude-rge-comment-verifier',
    description: 'Méthode anti-fraude + cas concrets, vérification annuaire',
  },
  {
    label: 'Toutes les qualifications RGE',
    href: '/rge/qualifications',
    description: 'Vue d’ensemble Qualibat, Qualifelec, Qualit’EnR, OPQIBI',
  },
  {
    label: 'Trouver un artisan Qualibat près de chez vous',
    href: '/rge/renovation-energetique',
    description: 'Annuaire géolocalisé des artisans RGE vérifiés',
  },
  {
    label: 'Pompe à chaleur : prix et aides 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Prix PAC + aides cumulables avec artisan QualiPAC RGE',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'RGE — Labels et qualifications',
    keywords: [
      'qualibat',
      'qualibat rge',
      'qualibat liste',
      'qualibat 5911',
      'qualibat 7131',
      'qualification qualibat',
      'annuaire qualibat',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'RGE', url: '/rge' },
    { name: 'Labels', url: '/rge/labels' },
    { name: 'Qualibat', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'RGE', href: '/rge' }, { label: 'Labels' }, { label: 'Qualibat' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Label RGE &middot; Organisme certificateur
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Qualibat en 2026 : qualifications, mentions et vérification
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Qualibat</strong> est l’organisme certificateur RGE n°1 en France, créé en
              1949. Il qualifie environ <strong>40 % des artisans RGE</strong> certifiés via plus de
              230 qualifications techniques. Les mentions Qualibat RGE conditionnent l’éligibilité
              de vos travaux à MaPrimeRénov’, aux CEE et à la TVA 5,5 %. Voici les mentions clés, la
              procédure d’obtention et la méthode pour vérifier un Qualibat en 30 secondes.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que Qualibat</h2>
            <p>
              Qualibat est une <strong>association loi 1901 indépendante</strong> créée en 1949 pour
              qualifier et certifier les entreprises du bâtiment. Sa mission : attester du sérieux
              technique, financier et juridique des entreprises du BTP. Avec environ
              <strong> 50 000 entreprises qualifiées</strong> en France, Qualibat est le premier
              organisme certificateur du secteur et le n°1 RGE pour les travaux de rénovation
              énergétique.
            </p>
            <ul>
              <li>
                <Building2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>50 000 entreprises</strong> qualifiées en France
              </li>
              <li>
                <FileText className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>230+ qualifications</strong> techniques et certifications
              </li>
              <li>
                <Users className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>~40 % des artisans RGE</strong> en France certifiés Qualibat
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>4 ans de validité</strong>, audit annuel + audit terrain quadriennal
              </li>
            </ul>

            <h2 id="mentions-rge">Mentions Qualibat RGE pour la rénovation énergétique</h2>
            <p>
              Pour bénéficier de MaPrimeRénov’, des CEE et de la TVA 5,5 %, l’artisan doit détenir
              une mention Qualibat <strong>portant la mention RGE</strong> correspondant au poste de
              travaux. Les principaux codes :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Code</th>
                    <th className="p-3 border-b border-sand-200">Libellé</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Travaux</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">
                      Aides associées
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {MENTIONS_RGE.map((m) => (
                    <tr key={m.code} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-bold text-primary-800 whitespace-nowrap">{m.code}</td>
                      <td className="p-3 font-medium">{m.label}</td>
                      <td className="p-3 text-sand-700 hidden md:table-cell">{m.travaux}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{m.aides}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Liste non exhaustive. 230+ qualifications Qualibat existent. Annuaire complet :
                qualibat.com.
              </p>
            </div>

            <h2 id="verifier">Vérifier un Qualibat en 30 secondes</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <ol className="space-y-3 m-0 list-decimal list-inside text-sm">
                <li>
                  Rendez-vous sur{' '}
                  <a
                    href="https://www.qualibat.com"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-primary-700 hover:underline"
                  >
                    qualibat.com
                  </a>{' '}
                  → onglet « Vérifier ».
                </li>
                <li>
                  Tapez le <strong>SIRET</strong> de l’entreprise (14 chiffres) ou son nom exact.
                </li>
                <li>
                  La fiche affiche : qualifications en cours, dates d’expiration, mentions RGE
                  associées.
                </li>
                <li>
                  Vérifiez que la qualification concernée est <strong>en cours de validité</strong>{' '}
                  à la date de signature du devis.
                </li>
                <li>
                  Si la mention RGE est présente, votre devis est éligible aux aides publiques.
                </li>
              </ol>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Attestation papier ne suffit pas</p>
                <p className="m-0">
                  Une copie d’attestation Qualibat, même récente, n’a aucune valeur juridique
                  isolée. Seule la <strong>consultation directe sur qualibat.com</strong> à la date
                  de signature du devis fait foi. C’est ce qui sera contrôlé en cas de litige sur
                  les aides publiques.
                </p>
              </div>
            </div>

            <h2 id="obtention">Comment un artisan obtient Qualibat</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES_OBTENTION.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <h2>Qualibat vs autres organismes RGE</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualibat</strong> : gros œuvre, second œuvre, isolation, chauffage,
                menuiseries, plomberie (n°1 du marché)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualifelec</strong> : électriciens (IRVE bornes recharge, photovoltaïque,
                domotique)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualit’EnR</strong> : énergies renouvelables (QualiPAC pompe à chaleur,
                Qualisol solaire, QualiBois)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>OPQIBI</strong> : bureaux d’études thermiques + audits énergétiques
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Cequami / Céquami</strong> : maisons individuelles (constructeurs)
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Search className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un artisan Qualibat près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Annuaire géolocalisé d’artisans Qualibat RGE vérifiés via l’API officielle
                    france-renov.gouv.fr. Gratuit, sans engagement.
                  </p>
                  <Link
                    href="/rge/renovation-energetique"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Annuaire artisans RGE <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedPages.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-start justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sand-900 m-0">{g.label}</p>
                      <p className="text-xs text-sand-600 mt-1 mb-0">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-1" aria-hidden />
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

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link href="/rge" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Hub RGE
            </Link>
            <Link
              href="/rge/labels/qualipac"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              QualiPAC (PAC) <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
