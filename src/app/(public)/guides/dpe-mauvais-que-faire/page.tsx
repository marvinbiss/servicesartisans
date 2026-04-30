import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'dpe-mauvais-que-faire'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'DPE E, F, G : que faire en 2026 ?'
const DESCRIPTION =
  'DPE E, F ou G : calendrier interdictions location 2025-2034, travaux à entreprendre, aides MPR, audit énergétique obligatoire, décote vente estimée.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Calendrier interdictions location : G → 2025, F → 2028, E → 2034 (loi Climat 2021).',
  'Décote vente immédiate : -5 à -15 % pour F, -10 à -20 % pour G (étude Notaires 2024).',
  'Audit énergétique obligatoire avant vente d’un logement F ou G (depuis 2023).',
  'Aides 2026 : MaPrimeRénov’ parcours accompagné, gain ≥2 classes = jusqu’à 63 000 € cumulé.',
  'Ordre de priorité travaux : isolation toiture > murs > fenêtres > chauffage > ventilation.',
]

const faqs = [
  {
    question: 'Mon DPE est F ou G : est-ce que je peux encore louer ?',
    answer:
      "Calendrier loi Climat 2021 : depuis le 1er janvier 2023, les logements G+ (>450 kWhEP/m²/an) ne peuvent plus être loués. Depuis le 1er janvier 2025, tous les G sont interdits à la location. Les F seront interdits au 1er janvier 2028, et les E au 1er janvier 2034. Un bail en cours continue jusqu'à sa fin, mais son renouvellement est impossible sans travaux. Sanction : le locataire peut saisir le juge pour obtenir gratuitement la mise aux normes, et le loyer ne peut pas être augmenté.",
  },
  {
    question: 'Quelle décote si je vends un logement avec mauvais DPE ?',
    answer:
      "Étude Conseil Supérieur du Notariat 2024 : décote moyenne sur le prix de vente = -5 à -10 % pour un F, -10 à -20 % pour un G vs un logement D équivalent. La décote est plus forte en zone tendue (Paris, Lyon, Bordeaux) qu'en zone détendue. Certains acquéreurs refusent désormais de visiter un bien F-G. Stratégie : réaliser les travaux avant vente pour monter en classe (gain 3 à 6 % de prix de vente) OU vendre en l'état avec décote affichée.",
  },
  {
    question: 'Quel est le coût moyen pour remonter de G à D ?',
    answer:
      'Pour une maison 100 m² en passoire G (chaudière fioul, fenêtres SV, aucune isolation) : budget type 45 000-75 000 € TTC pour atteindre D. Postes : isolation combles 4 000 €, ITE murs 18 000-28 000 €, fenêtres DV 12 000-18 000 €, pompe à chaleur 14 000 €, VMC 2 500 €, éventuel doublage intérieur refend 3 500 €. Avec aides 2026 (MPR parcours accompagné Jaune) : reste à charge 15 000-35 000 €, finançable en éco-PTZ 50 000 €.',
  },
  {
    question: 'Dois-je faire un audit énergétique obligatoire ?',
    answer:
      "Oui, obligatoire depuis 2023 avant vente d'un logement F ou G (loi Climat art. L126-28-1 CCH). L'audit va plus loin que le DPE : scénarios de travaux avec estimations de coût et de gains. Réalisé par un professionnel certifié (OPQIBI ou équivalent), coût 500-1 200 € TTC. L'audit doit être remis à l'acquéreur dès les premières visites. À partir de 2025, également obligatoire pour les E vendus. Exception : logements F/G construits après 1948 peuvent parfois être exemptés selon nouveau décret.",
  },
  {
    question: 'Par quels travaux faut-il commencer ?',
    answer:
      "Ordre de priorité techniquement optimal (ADEME) : (1) isolation toiture/combles (30 % des déperditions), (2) murs extérieurs (25 %), (3) fenêtres (10-15 %), (4) chauffage (après isolation pour ne pas surdimensionner), (5) ventilation VMC hygro B ou double flux. Erreur fréquente : remplacer la chaudière AVANT d'isoler — on garde des déperditions massives et la nouvelle PAC sera surdimensionnée. Exception : si chaudière fioul obsolète, la remplacer en parallèle.",
  },
  {
    question: 'Les aides suffisent-elles pour financer la rénovation globale ?',
    answer:
      "Oui pour les ménages Bleu et Jaune (modestes) via MaPrimeRénov' parcours accompagné. Exemple projet 60 k€ rénovation globale avec gain 3 classes (G→D) : MPR Jaune couvre 60 % = 36 000 €, Coup de pouce CEE +5 500 €, éco-PTZ jusqu'à 50 000 €. Reste à charge 0 € à 15 000 € selon profil. Profil Rose (revenus supérieurs) : aide réduite à 20-30 % = 12-18 k€, éco-PTZ pour le reste. Dans tous les cas, le cumul MPR+CEE+éco-PTZ+TVA 5,5 % rend le projet finançable sans apport significatif.",
  },
]

const sources = [
  {
    label: 'Loi Climat Résilience 2021',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'Service-public.fr — Interdiction location passoires',
    url: 'https://www.service-public.fr',
  },
  { label: 'Conseil Supérieur du Notariat — Étude DPE', url: 'https://www.notaires.fr' },
  { label: 'France Rénov’ — Rénovation d’ampleur', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Ordre de priorité travaux', url: 'https://agirpourlatransition.ademe.fr' },
]

const relatedGuides = [
  {
    label: 'Passoire thermique : rénovation obligatoire',
    href: '/guides/passoire-thermique-renovation',
  },
  { label: 'Classe énergie F interdite 2028', href: '/guides/classe-energie-f-interdite-2028' },
  { label: 'MaPrimeRénov’ parcours accompagné', href: '/guides/maprimerenov-parcours-accompagne' },
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
    section: 'Rénovation énergétique',
    keywords: [
      'DPE mauvais que faire',
      'passoire thermique',
      'interdiction location F G',
      'rénovation DPE',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'DPE mauvais que faire', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'DPE mauvais que faire' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              DPE mauvais (E, F, G) : que faire en 2026 ?
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un DPE E, F ou G coûte cher : interdiction progressive de louer, décote à la vente,
              factures de chauffage élevées. Voici le calendrier légal 2025-2034, les travaux
              prioritaires et les aides cumulables pour remonter de classe.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Calendrier des interdictions de location (loi Climat 2021)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Classe</th>
                    <th className="p-3 border-b border-sand-200">Date interdiction</th>
                    <th className="p-3 border-b border-sand-200">Conséquence</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['G+ (>450 kWhEP)', '01/01/2023', 'Loyer gelé, interdiction renouvellement'],
                    ['G', '01/01/2025', 'Interdiction location neuve'],
                    ['F', '01/01/2028', 'Interdiction location neuve'],
                    ['E', '01/01/2034', 'Interdiction location neuve'],
                  ].map(([c, d, e]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3 font-semibold">{d}</td>
                      <td className="p-3">{e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Ordre de priorité des travaux</h2>
            <ol>
              <li>
                <strong>Isolation toiture / combles</strong> — 30 % des déperditions, ROI 4-6 ans.
              </li>
              <li>
                <strong>Isolation murs extérieurs (ITE ou ITI)</strong> — 25 %.
              </li>
              <li>
                <strong>Fenêtres double ou triple vitrage</strong> — 10-15 %.
              </li>
              <li>
                <strong>Chauffage performant</strong> (PAC, granulés) — APRÈS isolation pour
                dimensionner correctement.
              </li>
              <li>
                <strong>VMC hygro B ou double flux</strong> — qualité air + 5 % économie.
              </li>
              <li>
                <strong>Plancher bas</strong> (isolation si cave ou vide sanitaire).
              </li>
            </ol>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Stratégie propriétaire bailleur.</strong> Pour louer en 2028, vous avez 2
                ans pour rénover un F. Attendre 2027 = risque de pénurie d’artisans + hausse des
                prix. Démarrer un parcours accompagné MaPrimeRénov’ dès 2026 : 6-9 mois de
                préparation, 3-6 mois de travaux, livraison fin 2027.
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
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Simuler mes aides <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
