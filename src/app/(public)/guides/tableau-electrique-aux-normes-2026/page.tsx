import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'tableau-electrique-aux-normes-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'

export const revalidate = 86400

const TITLE = 'Tableau électrique norme 2026 : prix'
const DESCRIPTION =
  'Tableau électrique aux normes 2026 : NF C 15-100, différentiels 30 mA type A/AC, disjoncteurs, parafoudre zone 1. Prix 800-2 500 €, Consuel, étapes.'

export const metadata: Metadata = {
  title: TITLE,
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
    authors: [`${SITE_URL}/equipe/marc-lefebvre`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Norme de référence : NF C 15-100 (amendement A5, 2023). Applicable à toute installation neuve ou rénovation totale.',
  'Obligations clés : 1 différentiel 30 mA par 8 circuits, type A pour cuisine/SDB/lave-linge, type AC pour autres, calcul puissance.',
  'Pièces spécifiques : parafoudre obligatoire en zone exposée (Kéraunique >25), disjoncteur branchement 30/45/60 A selon besoins.',
  'Prix 2026 : tableau 8 modules neuf 200-400 €, 13 modules 400-800 €, 18 modules 800-1 500 €, pose 400-1 200 € selon complexité.',
  'Attestation Consuel Q14 obligatoire pour installation neuve / mise aux normes totale. Contrôle 1-5 % des dossiers sur site.',
]

const faqs = [
  {
    question: 'Quand le tableau électrique doit-il être aux normes ?',
    answer:
      "La norme NF C 15-100 s'applique dans 3 cas : (1) Construction neuve — obligatoire dès la livraison, avec attestation Consuel Q14 ; (2) Rénovation totale ou >75 % — mise aux normes complète obligatoire si la surface rénovée dépasse 75 % du logement ou si l'installation est déposée ; (3) Vente/location — diagnostic électrique obligatoire si installation >15 ans (art. L271-4 CCH), recommandations si non-conforme mais pas d'obligation immédiate de mise aux normes. Hors ces cas : pas d'obligation légale stricte pour tableau ancien conforme lors de son installation. Mais une installation obsolète (fusibles à porcelaine, pas de différentiel) expose le client à 80-90 % refus prise en charge assurance en cas de sinistre électrique (incendie, électrocution).",
  },
  {
    question: 'Quelles sont les règles essentielles NF C 15-100 en 2026 ?',
    answer:
      '9 règles structurantes : (1) 1 disjoncteur 30 mA par groupe de 8 circuits maximum ; (2) Type A obligatoire pour circuits cuisine, SDB, lave-linge, lave-vaisselle, IRVE (courants continus résiduels) ; (3) Type AC pour autres circuits ; (4) Calibres circuits : 10 A éclairage, 16 A prises 10/16 A, 20 A prises spécialisées, 32 A cuisson ; (5) 20 % libre en spare pour extensions futures ; (6) Câblage minimum 1,5 mm² éclairage, 2,5 mm² prises, 6 mm² cuisson ; (7) Parafoudre obligatoire si niveau kéraunique zone >25 (sud-ouest, est France) ; (8) ID 650 mA tête de logement ; (9) Prises commandées : limites 8 par disjoncteur 16 A. Pour installation complète : 4-8 circuits minimum, soit 1 à 2 différentiels 30 mA.',
  },
  {
    question: 'Combien coûte la mise aux normes du tableau électrique ?',
    answer:
      'Grille 2026 TTC (fourniture + pose par électricien Qualifelec) : (1) Tableau pré-équipé 8 modules (studio, T1/T2) : 600-1 200 € ; (2) Tableau 13 modules (T3/T4) : 1 200-2 200 € ; (3) Tableau 18-26 modules (maison 100-150 m²) : 2 000-3 500 € ; (4) Tableau >26 modules (grande maison avec IRVE, pompe à chaleur) : 3 500-6 000 €. Coûts additionnels : parafoudre 80-180 €, Consuel Q14 108 € + déplacement 50-100 €, mise à la terre si absente 300-900 €. Le coût peut doubler si pose complète avec remplacement gaine technique (GTL) et adaptation câblage. Aides : TVA 5,5 % si rénovation énergétique, CEE bonus possible avec domotique.',
  },
  {
    question: 'Comment obtenir l’attestation Consuel Q14 ?',
    answer:
      "Attestation de conformité obligatoire pour raccordement Enedis toute installation neuve/rénovée. Procédure : (1) Commande attestation en ligne sur consuel.com : télédéclaration Q14 (neuf) ou Q21 (modifications), tarifs 108-172 € HT selon type ; (2) Électricien Qualifelec réalise l'installation conforme à la NF C 15-100 ; (3) Rédaction formulaire Q14 : description précise circuits, différentiels, protections, plans ; (4) Envoi Consuel : contrôle documentaire systématique + visite terrain aléatoire 1-5 % (priorité sur maisons individuelles) ; (5) Si conforme : attestation visée en 10-15 j, transmise à Enedis pour raccordement compteur ; (6) Si non conforme : rapport défauts à corriger + recontrôle 200-400 €. Électricien assume les frais de recontrôle si faute d'exécution.",
  },
  {
    question: 'Quelles conséquences si tableau non conforme en cas de sinistre ?',
    answer:
      "Impact majeur sur l'assurance. Typique incendie d'origine électrique (15-20 % des sinistres habitation) : (1) Expert mandataire assureur vérifie conformité installation ; (2) Si non-conforme NF C 15-100 : clause d'exclusion activable, refus ou réduction indemnisation 50-100 % ; (3) Typique : logement détruit 120 000 €, tableau obsolète fusible porcelaine = 40-60 000 € remboursés au lieu de 120 000 € ; (4) Responsabilité personnelle locataire/propriétaire si conscience de la non-conformité (arrêté municipal, diagnostic défavorable, recommandation expert) ; (5) En cas d'électrocution d'un tiers (enfant, visiteur) : responsabilité civile personnelle au-delà des plafonds. Investissement 1 500-3 000 € pour mise aux normes = assurance réelle 50 000-300 000 € de risques couverts correctement.",
  },
]

const sources = [
  {
    label: 'NF C 15-100 — AFNOR',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'Consuel — Attestation Q14',
    url: 'https://www.consuel.com',
  },
  { label: 'Promotelec — Norme NF C 15-100', url: 'https://www.promotelec.com' },
  { label: 'Qualifelec — Artisans qualifiés', url: 'https://www.qualifelec.fr' },
]

const relatedGuides = [
  { label: 'Normes électriques NF C 15-100', href: '/guides/normes-electriques' },
  {
    label: 'Panne électrique générale',
    href: '/guides/panne-electrique-generale-conduite',
  },
  { label: 'Prix électricien heure 2026', href: '/guides/prix-electricien-heure-2026' },
  { label: 'Diagnostics immobiliers', href: '/guides/diagnostics-immobiliers' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Réglementation',
    keywords: [
      'tableau électrique aux normes',
      'NF C 15-100 tableau',
      'différentiel 30 mA type A',
      'Consuel Q14',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Tableau électrique', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Tableau électrique' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Tableau électrique aux normes 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un tableau obsolète expose à 50-100 % de refus d’indemnisation en cas de sinistre
              électrique. Voici la norme NF C 15-100 à jour 2026, les 9 règles essentielles, les
              prix de mise aux normes et la procédure Consuel Q14.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Tarifs tableau électrique aux normes</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Taille tableau</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Logement type</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['8 modules', '600-1 200 €', 'Studio / T1-T2'],
                    ['13 modules', '1 200-2 200 €', 'T3 / T4'],
                    ['18-26 modules', '2 000-3 500 €', 'Maison 100-150 m²'],
                    ['>26 modules', '3 500-6 000 €', 'Grande maison + IRVE/PAC'],
                  ].map(([t, p, l]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Jamais toucher à un tableau en bricolage.</strong> Les interventions
                électriques sont RÉSERVÉES aux électriciens Qualifelec. DIY = risque électrocution
                fatal + refus assurance systématique si sinistre + nullité contrat logement loué.
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
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un électricien <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
