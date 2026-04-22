import type { Metadata } from 'next'
import Link from 'next/link'
import { Landmark, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'credit-travaux-pret-personnel-comparatif'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'
const AUTHOR_SLUG = 'claire-dubois'

export const revalidate = 86400

const TITLE = 'Crédit travaux 2026 : éco-PTZ comparé'
const DESCRIPTION =
  'Crédit travaux 2026 : comparatif prêt personnel, éco-PTZ 0 % jusqu’à 30 000 €, prêt immobilier, TAEG 3-9 %, durée 12-120 mois, FICP.'

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
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Éco-PTZ 0 % : jusqu’à 30 000 € (bouquet 3+ travaux), 15 000 € mono-geste, 50 000 € rénovation globale BBC. Remboursement 15-20 ans.',
  'Prêt personnel AFFECTÉ travaux : TAEG 3-6 % (avec devis), protection L312-55 Conso (lie travaux/prêt).',
  'Prêt personnel NON-AFFECTÉ : TAEG 4-9 %, montant 3 000-75 000 €, durée 12-120 mois, souple (pas justificatif).',
  'Prêt immobilier travaux (si achat + rénovation) : TAEG 3,5-4,5 % fixe 15-25 ans, hypothèque ou caution bancaire.',
  'FICP (fichier incidents paiement crédit) consulté systématiquement. Assurance emprunteur facultative mais conseillée (invalidité, décès).',
]

const faqs = [
  {
    question: 'Quel crédit choisir pour financer des travaux en 2026 ?',
    answer:
      '5 options selon montant + profil : (1) ÉCO-PTZ 0 % intérêt (décret 2022-454) : bouquet 3 travaux = 30 000 €, monogeste isolation = 15 000 €, remplacement chaudière seul = 20 000 €, rénovation globale BBC = 50 000 €. Remboursement 15 ans (20 ans si rénovation globale). Conditions : résidence principale >2 ans + artisan RGE + travaux éligibles précis. Cumulable MaPrimeRénov + CEE. Meilleure option si éligible ; (2) PRÊT PERSONNEL AFFECTÉ TRAVAUX (banque ou organisme spécialisé) : 1 500-75 000 €, durée 12-120 mois, TAEG 3-6 % (2026), PROTECTION Code Conso L312-55 (si travaux annulés, prêt annulé gratuitement). Banques : Crédit Agricole, BNP, Cetelem, Sofinco ; (3) PRÊT PERSONNEL NON-AFFECTÉ : 1 500-75 000 €, TAEG 4-9 %, souple (pas justif travaux), MAIS pas de protection L312-55 ; (4) PRÊT IMMOBILIER TRAVAUX intégré dans achat : 3,5-4,5 % fixe 15-25 ans, hypothèque coûteuse mais gros montants ; (5) PRÊT TRAVAUX BANQUE VERTE (Boursorama, Hello bank, BforBank) : 2,5-4,5 % tout numérique ; (6) REVOLVING / CRÉDIT RENOUVELABLE : À ÉVITER ABSOLUMENT, TAEG 15-21 %, dette perpétuelle.',
  },
  {
    question: 'Qu’est-ce que l’éco-PTZ et comment en bénéficier ?',
    answer:
      'Éco-Prêt à Taux Zéro (décret 2022-454 + art. D319-16 CCH) : prêt sans intérêt pour financer travaux rénovation énergétique. (1) MONTANT 2026 : mono-geste 15 000 €, bouquet 2 travaux 25 000 €, bouquet 3+ travaux 30 000 €, remplacement chaudière fioul par PAC/granulés 20 000 €, rénovation globale après audit énergétique + gain 35 % minimum = 50 000 € ; (2) REMBOURSEMENT 15 ans maximum (20 ans rénovation globale) ; (3) CONDITIONS : logement résidence principale >2 ans (ou locataire/copropriétaire), travaux éligibles décret (isolation, chauffage, ECS, ventilation), artisan RGE Qualibat/Qualit’ENR selon geste ; (4) CUMULABLE : MaPrimeRénov + CEE (même bouquet travaux) ; (5) DÉMARCHE : demander devis RGE → constituer dossier + formulaire Cerfa 17400 (auto-diagnostic énergie) → déposer banque (tout réseau bancaire agréé) → acceptation 30-45 jours → travaux sous 3 ans (prolongation possible) → facture + attestation fin travaux → déblocage fonds par tranche ; (6) SANCTIONS NON-RESPECT : remboursement avec intérêts + pénalités bancaires + contrôles ADEME post-travaux. Banques agréées : Crédit Agricole, BNP Paribas, Société Générale, Crédit Mutuel, CIC, Banque Populaire, Caisse Épargne.',
  },
  {
    question: 'Prêt affecté ou non-affecté : quelle protection ?',
    answer:
      'Distinction essentielle Code consommation : (1) PRÊT AFFECTÉ TRAVAUX (art. L312-44 à L312-56) : lie obligatoirement prêt et contrat travaux par MENTION ÉCRITE sur offre. AVANTAGES = (a) protection L312-55 : si artisan ne livre pas travaux ou annulation résolution contrat, prêt est résilié automatiquement GRATUITEMENT, emprunteur rembourse uniquement fonds perçus ; (b) rétractation 14 jours sans frais ; (c) livraison travaux déclenche déblocage fonds par tranche ; (d) plafond 75 000 € et durée max 120 mois (9 ans 5 mois) ; (2) PRÊT NON-AFFECTÉ (personnel classique, art. L312-1 et suivants) : pas de lien travaux-prêt. AVANTAGES = souplesse (pas justif achat), peut tout financer, rapidité déblocage 7-14 jours. INCONVÉNIENTS = aucune protection si artisan défaillant (prêt à rembourser même si travaux pas faits) ; (3) CONSEIL 2026 : privilégier AFFECTÉ si chantier significatif (>5 000 €) + artisan pas connu. Non-affecté acceptable si artisan de confiance + petit chantier + besoin rapidité. TAEG différence souvent +0,5-1 % en faveur AFFECTÉ car risque maîtrisé pour banque.',
  },
  {
    question: 'Comment comparer les offres de crédit travaux ?',
    answer:
      '8 critères clés pour comparer objectivement : (1) TAEG (Taux Annuel Effectif Global) — SEUL indicateur comparable art. L313-4 Code Conso, inclut intérêts + frais dossier + assurance obligatoire. Vérifier chiffre OFFICIEL sur FIPEN (Fiche Information Précontractuelle Européenne) ; (2) DURÉE DE REMBOURSEMENT — plus longue = mensualité plus basse MAIS COÛT TOTAL plus élevé. Calculer coût total = mensualité × nombre échéances ; (3) FRAIS DE DOSSIER — 0 € (organismes en ligne) à 1 % montant (banques traditionnelles), négociables toujours ; (4) PÉNALITÉS REMBOURSEMENT ANTICIPÉ — max 3 % capital restant (art. L312-34), 0 % si intérêts variables ; (5) ASSURANCE EMPRUNTEUR facultative sur crédit consommation (obligatoire crédit immo) — invalidité, décès, perte emploi : comparer TAEG avec/sans, loi Lemoine permet résiliation à tout moment ; (6) MODULATION MENSUALITÉS (pause 2-6 mois, augmentation +30 % mensualité) — flexibilité si coup dur ; (7) ORGANISME : banque traditionnelle (Crédit Agricole 4-6 %, BNP 4,5-6,5 %), banque en ligne (Hello Bank 3-5 %, Boursorama 3-5 %), spécialiste crédit conso (Cetelem 4-7 %, Sofinco 4-7 %, Floa 5-8 %) ; (8) DÉLAI DÉBLOCAGE — 7-14 jours banque en ligne, 21-45 jours banque traditionnelle.',
  },
  {
    question: 'Quels sont les critères d’acceptation d’un crédit travaux ?',
    answer:
      'Règles bancaires 2026 : (1) TAUX D’ENDETTEMENT MAXIMUM 35 % revenus nets mensuels (recommandation HCSF + art. L312-1 Conso) — incluant TOUTES mensualités (immo + conso + pension alimentaire) ; (2) RESTE À VIVRE : 750-1 200 € par personne adulte + 300-500 € par enfant minimum — varie selon banque ; (3) SAUT CHARGE accepté : mensualité crédit nouveau ≤1,2× loyer actuel ; (4) CDI > 3 mois ESSAI ou FONCTIONNAIRE — optimal. CDD/intérim = possible mais justificatifs 6-12 mois, taux majorés +0,5-1,5 % ; (5) INDÉPENDANTS/LIBÉRAUX : 2-3 bilans comptables minimum, revenus moyennes dernière 2-3 années ; (6) FICP — fichier incidents paiement (Banque de France) consulté systématiquement, interdit bancaire = refus automatique (durée fiche 5 ans max). Vérifier statut via banque-france.fr ; (7) ÂGE : 18-75 ans (certains assureurs plafonnent 70 ans pour emprunt immobilier) ; (8) APPORT PERSONNEL : pas obligatoire crédit conso, mais dossier mieux noté si 10-20 % apport ; (9) DOCUMENTS : CNI, justificatif domicile, bulletins salaire 3 derniers, avis imposition 2 ans, RIB, relevé compte 3 mois. Délai traitement : 7-21 jours.',
  },
]

const sources = [
  {
    label: 'Art. L312-1 à L312-93 Code Conso',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Décret 2022-454 — Éco-PTZ 2026', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Banque de France — FICP', url: 'https://www.banque-france.fr' },
  { label: 'HCSF — Recommandations crédit', url: 'https://www.hcsf.gouv.fr' },
  { label: 'ADEME — Financer travaux', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  { label: 'Éco-PTZ taux zéro 2026', href: '/guides/eco-pret-taux-zero-2026' },
  { label: 'MaPrimeRénov 2026', href: '/guides/maprimerenov-2026' },
  { label: 'Aides rénovation 2026', href: '/guides/aides-renovation-2026' },
  { label: 'Budget rénovation', href: '/guides/budget-renovation' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Financement',
    keywords: [
      'crédit travaux comparatif',
      'prêt personnel affecté',
      'éco-PTZ 2026',
      'TAEG prêt travaux',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Crédit travaux', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Crédit travaux' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Landmark className="w-3.5 h-3.5" aria-hidden />
              Financement · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Crédit travaux : comparer les prêts en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Éco-PTZ 0 %, prêt personnel affecté ou non-affecté, prêt immobilier travaux : voici le
              comparatif 2026 des crédits travaux, les TAEG, la protection L312-55 et les critères
              d’acceptation.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Comparatif crédits travaux 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Crédit</th>
                    <th className="p-3 border-b border-sand-200">TAEG</th>
                    <th className="p-3 border-b border-sand-200">Plafond / Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Éco-PTZ', '0 %', '50 000 € / 20 ans'],
                    ['Prêt affecté travaux', '3-6 %', '75 000 € / 120 mois'],
                    ['Prêt personnel non affecté', '4-9 %', '75 000 € / 120 mois'],
                    ['Prêt immobilier travaux', '3,5-4,5 %', 'Illimité / 25 ans'],
                    ['Revolving (à éviter)', '15-21 %', '6 000 € / variable'],
                  ].map(([c, t, p]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3 font-semibold">{t}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
