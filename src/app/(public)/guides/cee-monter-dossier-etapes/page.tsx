import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'cee-monter-dossier-etapes'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Monter un dossier CEE : 7 étapes, pièces, délais 2026'
const DESCRIPTION =
  'Monter dossier CEE 2026 : signature AVANT devis, pièces obligatoires, délai 6-12 mois, obligés vs mandataires, cumul MPR, fraude à éviter.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Règle d’or : signer le contrat CEE (obligé ou mandataire) AVANT le devis des travaux. Inverser = dossier rejeté automatiquement.',
  'Pièces obligatoires : contrat CEE, devis signé, facture, attestation sur l’honneur, certificat RGE artisan, DPE avant/après si bouquet.',
  'Délai : dépôt 6 mois après achèvement travaux, instruction 2-6 mois, versement prime 1-2 mois après validation. Total 6-12 mois.',
  'Obligés (EDF, TotalEnergies, Auchan) vs mandataires spécialisés : prix variable, niveau service différent, vérifier agrément DGEC.',
  'Fraude courante : « remise commerciale immédiate » au lieu du vrai circuit = escroquerie. Se faire expliquer clairement le montage.',
]

const howToSteps = [
  {
    name: 'Comparer les offres CEE',
    text: 'Obtenir 3 offres : un obligé (EDF, TotalEnergies, Engie), un supermarché (Auchan, Leclerc), un mandataire spécialisé (Sonergia, Calyxia, Hellio). Vérifier agrément DGEC.',
  },
  {
    name: 'Signer le contrat CEE AVANT devis',
    text: 'Signer l’offre retenue + conditions particulières + barème prime. Obtenir n° de dossier unique. Étape critique : sans ce n° PRÉALABLE, dossier rejeté.',
  },
  {
    name: 'Choisir artisan RGE adapté',
    text: 'Vérifier qualification RGE spécifique au geste sur france-renov.gouv.fr. Devis signé APRÈS signature contrat CEE.',
  },
  {
    name: 'Réaliser les travaux',
    text: 'Travaux par l’artisan RGE. Conserver factures détaillées (matériaux + pose), PV mise en service, certificats performance produits.',
  },
  {
    name: 'Remplir l’attestation sur l’honneur',
    text: 'Formulaire fourni par l’obligé/mandataire — détails ménage, bien, travaux, performance. Signer sans erreur.',
  },
  {
    name: 'Déposer le dossier complet',
    text: 'Sous 6 mois après fin de chantier : factures + attestations + RIB + copie devis signé. Plateforme dédiée obligé ou mandataire.',
  },
  {
    name: 'Recevoir la prime',
    text: 'Après instruction 2-6 mois : virement bancaire direct. Alternativement, réduction immédiate en caisse pour enseignes (CDiscount Énergie, Auchan Énergies).',
  },
]

const faqs = [
  {
    question: 'Quels sont les obligés CEE et comment les contacter ?',
    answer:
      "Liste 2026 — obligés = fournisseurs d'énergie contraints par l'État à financer la rénovation énergétique : (1) Électricité/gaz : EDF Bleu Ciel, ENGIE Solutions, TotalEnergies, Vattenfall, Iberdrola ; (2) Carburants : TotalEnergies, Esso, Shell, Avia, Aristo ; (3) Grande distribution énergies : Auchan Prime Énergie, Leclerc Solutions Rénovation, Carrefour Energies ; (4) Mandataires agréés spécialisés (délégataires officiels) : Sonergia, Hellio (ex-Effy Isolation), Calyxia, GEO PLC, Certinergy. Contact : sites web dédiés CEE (ex : edf.fr/primes-renovation, engie.fr/renovation-energetique), demande devis sous 7-15 j, barèmes consultables en ligne. Comparaison essentielle : écart 10-40 % entre offres pour même chantier.",
  },
  {
    question: 'Pourquoi signer le contrat CEE AVANT le devis est critique ?',
    answer:
      "C'est la règle n°1 des CEE depuis la directive ministérielle 2015 : le rôle INCITATEUR de la prime impose qu'elle soit contractualisée AVANT la décision d'engager les travaux. En pratique : (1) Signer l'offre CEE (obligé ou mandataire) avec n° de dossier ; (2) PUIS demander devis à l'artisan RGE ; (3) Signer devis ; (4) Travaux. Si ordre inversé (devis signé avant contrat CEE), la prime est REFUSÉE automatiquement car les travaux sont censés avoir été décidés sans incitation. Signature le même jour ambigüe — préférer 24 h d'écart avec preuve horodatée. Erreur très fréquente (15 % des dossiers rejetés) qui coûte 2 000-8 000 € de primes perdues.",
  },
  {
    question: 'Quelles primes CEE espérer en 2026 ?',
    answer:
      'Barèmes moyens observés en 2026 (hors bonifications Coup de pouce) : (1) PAC air-eau : 2 500-5 000 € selon logement + revenus ; (2) PAC eau-eau géothermique : 4 000-8 000 € ; (3) Chaudière biomasse (granulés) : 3 500-6 500 € ; (4) Isolation combles perdus (100 m²) : 1 000-2 500 € ; (5) Isolation murs ITE (100 m²) : 3 500-7 000 € ; (6) Fenêtres double vitrage (10 unités) : 800-1 800 € ; (7) VMC double flux : 1 500-3 000 €. Coup de pouce Chauffage et Isolation majore les primes +50-200 % pour ménages modestes. Bonus rénovation globale CEE : +20-30 % si 3+ gestes combinés. Cumul MPR + CEE + TVA 5,5 % possible intégralement.',
  },
  {
    question: 'Comment éviter les fraudes CEE ?',
    answer:
      "Signaux d'alerte DGCCRF 2024 : (1) « Isolation à 1 € » disparu officiellement fin 2020 — toute offre « 1 € » actuelle = fraude ; (2) « Remise commerciale immédiate » sans contrat CEE formalisé = la prime n'est pas versée à l'entreprise, c'est vous qui payez ; (3) Démarchage téléphonique ou à domicile pour CEE interdit depuis mars 2023 (loi n° 2022-113) — un artisan qui démarche par ces canaux = fraude ; (4) Intermédiaire qui facture « frais de montage dossier » >5 % prime = commission abusive ; (5) Cumul MPR + CEE présenté comme impossible = mensonge, c'est TOUJOURS cumulable. Défense : demander agrément DGEC de l'intermédiaire (vérifiable sur registre-nationale-certificats-economies-energie.developpement-durable.gouv.fr), signal.conso.gouv.fr en cas de doute.",
  },
  {
    question: 'Quel délai pour déposer un dossier CEE après travaux ?',
    answer:
      "Délais réglementaires stricts (arrêté 22 décembre 2014 modifié) : (1) Dépôt auprès de l'obligé/mandataire : 6 MOIS à compter de la date d'achèvement des travaux (date facture finale) — dépassement = forclusion, prime perdue ; (2) Après dépôt, instruction obligé : 2-6 mois (obligation contrôle conformité par échantillonnage 1 sur 5-10 dossiers) ; (3) Versement prime : 1-2 mois après validation. Total moyen de la date de fin des travaux au virement : 6-12 mois. Anticiper : conserver TOUTES les pièces, répondre sous 15 j aux demandes de compléments, relancer si silence >3 mois. Les contrôles peuvent intervenir même 3 ans après via PNCEE (Pôle National CEE) : conserver dossier 5 ans minimum.",
  },
]

const sources = [
  {
    label: 'Arrêté 22 déc 2014 — Dépôt CEE',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Loi n° 2022-113 — Interdiction démarchage CEE',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'DGEC — Registre des certificats',
    url: 'https://www.ecologie.gouv.fr',
  },
  { label: 'France-Rénov’ — Aides CEE', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — CEE pratique', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  { label: 'Coup de pouce chauffage 2026', href: '/guides/coup-de-pouce-chauffage-2026' },
  { label: 'MaPrimeRénov’ 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Aides rénovation 2026', href: '/guides/aides-renovation-2026' },
  { label: 'Éco-PTZ 2026', href: '/guides/eco-pret-taux-zero-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Aides financières',
    keywords: ['monter dossier CEE', 'CEE étapes 2026', 'prime CEE comment obtenir', 'fraude CEE'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Monter dossier CEE', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Comment monter un dossier CEE en 7 étapes',
    description:
      'Procédure officielle pour obtenir une prime CEE, de la comparaison des offres au versement final.',
    totalTime: 'P365D',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Monter dossier CEE' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Aides financières · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Monter un dossier CEE : 7 étapes clés
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les Certificats d’Économies d’Énergie peuvent rapporter 2 000-8 000 € par chantier,
              cumulables avec MaPrimeRénov’. Voici la procédure en 7 étapes, la règle critique de la
              signature préalable et les signaux d’alerte pour détecter une fraude.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Barèmes CEE moyens 2026 par geste</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Geste</th>
                    <th className="p-3 border-b border-sand-200">Prime CEE standard</th>
                    <th className="p-3 border-b border-sand-200">Avec Coup de pouce</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PAC air-eau', '2 500-5 000 €', '+50-100 %'],
                    ['PAC géothermique', '4 000-8 000 €', '+30-60 %'],
                    ['Chaudière biomasse', '3 500-6 500 €', '+50-100 %'],
                    ['Isolation combles', '1 000-2 500 €', '+20-50 %'],
                    ['ITE murs', '3 500-7 000 €', '+30-60 %'],
                    ['VMC double flux', '1 500-3 000 €', 'Non majorée'],
                  ].map(([g, p, c]) => (
                    <tr key={g} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{g}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Démarchage CEE INTERDIT depuis 2023.</strong> Un appel, SMS ou visite
                proposant CEE = fraude caractérisée. Loi n° 2022-113. Ne JAMAIS signer sur place.
                Comparer 3 offres en ligne directement via les sites obligés + mandataires agréés.
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
            <Link href="/cee" className="inline-flex items-center gap-1 hover:text-primary-700">
              Espace CEE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
