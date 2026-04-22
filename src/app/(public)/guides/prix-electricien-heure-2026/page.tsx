import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Zap, Calculator, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-electricien-heure-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'

export const revalidate = 86400

const TITLE = 'Prix électricien à l’heure 2026'
const DESCRIPTION =
  'Tarif électricien à l’heure 2026 : 45-75 €/h en journée, 90-150 €/h urgence nuit/dimanche. Prix dépannage, déplacement, forfaits courants.'

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
    authors: [`${SITE_URL}/equipe/marc-lefebvre`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Tarif horaire moyen 2026 : 45 à 75 €/h TTC en journée ouvrable.',
  'Urgence nuit, dimanche, férié : 90 à 150 €/h + forfait déplacement 50-100 €.',
  'Dépannage courant (coupure, court-circuit) : 80 à 250 € TTC selon durée et horaire.',
  'Remise aux normes tableau électrique : 800 à 2 500 € TTC.',
  'Un électricien non-qualifié = pas de conformité Consuel, assurance décennale potentiellement caduque.',
]

const faqs = [
  {
    question: 'Combien coûte un électricien à l’heure en 2026 ?',
    answer:
      "Tarif moyen national TTC en journée ouvrable (8h-18h, lundi-vendredi) : 45 à 75 €/h. Île-de-France et PACA : 55 à 85 €/h. Zones rurales : 40 à 60 €/h. Ce prix couvre la main-d'œuvre seule, hors fournitures, hors déplacement. Un bon artisan intègre le déplacement dans le forfait horaire ou facture un forfait fixe (30-60 €) une seule fois.",
  },
  {
    question: 'Quel prix pour une intervention urgence nuit ou week-end ?',
    answer:
      'Les majorations légales (Code du travail) : +50 % la nuit (20h-6h), +100 % dimanche et jours fériés. Tarif réel pratiqué en urgence : 90 à 150 €/h + forfait déplacement 50-100 €. Intervention moyenne 1 h : 140-250 € TTC. Méfiance : les escroqueries se concentrent sur les urgences. Refusez toute intervention sans devis préalable, même verbal.',
  },
  {
    question: 'Quel budget pour refaire une installation électrique complète ?',
    answer:
      "Maison 100 m² rénovation complète : 8 000 à 15 000 € TTC (pose + matériaux + Consuel). Mise aux normes partielle (tableau + 5-10 prises) : 2 000 à 4 500 €. Appartement 70 m² remise aux normes : 6 000 à 10 000 €. Ajoutez 15-25 % si les gaines existantes ne sont pas réutilisables et qu'il faut passer en saignée.",
  },
  {
    question: 'Dois-je prendre un électricien certifié Qualifelec ?',
    answer:
      "Fortement recommandé et parfois indispensable. Qualifelec est la qualification de référence pour l'électricité résidentielle. Pour : pose de borne de recharge IRVE (obligatoire : Qualifelec IRVE), travaux éligibles à des aides (CEE pour modulation), chantiers neufs soumis à Consuel. Pour un dépannage simple, non indispensable mais la qualification atteste d'une formation continue. Vérifiez sur qualifelec.fr.",
  },
  {
    question: 'Combien coûte un diagnostic électrique ?',
    answer:
      "Diagnostic obligatoire vente ou location d'un bien >15 ans : 70 à 150 € par un diagnostiqueur certifié (ni électricien ni entreprise). Diagnostic conseil avant rénovation (compteur, tableau, circuits) par un électricien : 100 à 300 € selon taille du bien. Souvent offert si chantier signé avec l'entreprise ayant réalisé le diagnostic.",
  },
  {
    question: 'Que faire si l’électricien ne peut pas passer rapidement ?',
    answer:
      "En urgence réelle (coupure totale, odeur de brûlé, court-circuit récurrent) : (1) coupez le disjoncteur général au tableau, (2) appelez Enedis au 09 72 67 50 + votre département si suspicion de panne réseau (gratuit), (3) appelez votre assurance habitation qui peut dispatcher un électricien partenaire rapidement. Les plateformes d'urgence proposées en tête des résultats Google sont souvent surévaluées : comparez 2 devis même en urgence si la situation n'est pas dangereuse.",
  },
]

const sources = [
  { label: 'Qualifelec — Annuaire électriciens certifiés', url: 'https://www.qualifelec.fr' },
  { label: 'Consuel — Norme NF C 15-100', url: 'https://www.consuel.com' },
  { label: 'Médiateur national de l’énergie', url: 'https://www.energie-mediateur.fr' },
  { label: 'Signal Conso — Litiges électricité', url: 'https://signal.conso.gouv.fr' },
]

const relatedGuides = [
  { label: 'Normes électriques NF C 15-100', href: '/guides/normes-electriques' },
  { label: 'Éviter les arnaques d’artisans', href: '/guides/eviter-arnaques-artisan' },
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & Électricité',
    keywords: [
      'prix électricien heure',
      'tarif électricien 2026',
      'électricien urgence prix',
      'dépannage électrique',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix électricien à l’heure', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prix électricien à l’heure' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Électricité
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prix électricien à l’heure en 2026 : tarifs moyens et dépannage
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un électricien coûte en moyenne 55 €/h TTC en 2026 en journée ouvrable, avec des
              variations importantes selon la région, la qualification (Qualifelec IRVE, Consuel) et
              les plages horaires d’intervention. Voici la grille complète, les forfaits courants et
              surtout, comment éviter les tarifs gonflés en urgence.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille tarifaire 2026 électricien</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Moment</th>
                    <th className="p-3 border-b border-sand-200">Tarif horaire TTC</th>
                    <th className="p-3 border-b border-sand-200">Déplacement</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Journée ouvrable (8h-18h, lundi-vendredi)', '45 à 75 €/h', '30 à 60 €'],
                    ['Soirée (18h-20h)', '60 à 95 €/h', '40 à 80 €'],
                    ['Nuit (20h-6h)', '90 à 140 €/h', '50 à 100 €'],
                    ['Samedi journée', '60 à 95 €/h', '40 à 80 €'],
                    ['Dimanche / férié', '100 à 150 €/h', '60 à 120 €'],
                  ].map(([m, t, d]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3">{t}</td>
                      <td className="p-3">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes nationales 2026. +15-25 % en Île-de-France, -10-15 % en zones rurales.
              </p>
            </div>

            <h2>Forfaits interventions courantes</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Intervention</th>
                    <th className="p-3 border-b border-sand-200">Forfait TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Remise en route disjoncteur différentiel', '80 à 150 €'],
                    ['Remplacement interrupteur ou prise', '60 à 120 €'],
                    ['Pose d’une prise supplémentaire', '100 à 200 €'],
                    ['Pose d’un point lumineux', '150 à 300 €'],
                    ['Dépannage court-circuit (simple)', '120 à 250 €'],
                    ['Diagnostic électrique complet logement', '100 à 300 €'],
                    ['Remplacement tableau électrique', '800 à 2 500 €'],
                    ['Mise aux normes partielle (5-10 circuits)', '2 000 à 4 500 €'],
                    ['Installation borne de recharge IRVE 7 kW', '1 200 à 2 500 €'],
                    ['Attestation Consuel (si travaux éligibles)', '150 à 250 €'],
                  ].map(([i, p]) => (
                    <tr key={i} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{i}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Arnaque fréquente dépannage.</strong> Tarification abusive en urgence :
                devis verbal « 150 €/h » transformé en facture finale 800-1 500 € pour 1 h
                d’intervention, avec des « fournitures » non justifiées. Exigez un devis écrit AVANT
                intervention, avec durée estimée et coût des fournitures. Refusez le paiement en
                espèces en urgence.
              </p>
            </div>

            <h2>Les qualifications à exiger selon le chantier</h2>
            <ul>
              <li>
                <strong>Électricien généraliste :</strong> Qualifelec (recommandé), décennale à
                jour.
              </li>
              <li>
                <strong>Pose borne recharge IRVE :</strong> Qualifelec IRVE (niveau 1 à 3 selon la
                puissance, obligatoire pour aides ADVENIR).
              </li>
              <li>
                <strong>Photovoltaïque :</strong> QualiPV (Qualit’EnR) RGE pour MaPrimeRénov’.
              </li>
              <li>
                <strong>Domotique avancée :</strong> Qualifelec Domotique.
              </li>
              <li>
                <strong>Tertiaire / haute tension :</strong> habilitations spécifiques (B1V, B2V,
                BR, BC).
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Devis électricien vérifié
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Trouvez un électricien Qualifelec vérifié près de chez vous. SIRET actif,
                    décennale à jour, avis clients réels.
                  </p>
                  <Link
                    href="/services/electricien"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Trouver un électricien <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
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
              Annuaire électriciens <Zap className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
