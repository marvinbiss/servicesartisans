import type { Metadata } from 'next'
import Link from 'next/link'
import { Waves, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'assainissement-individuel-fosse-septique'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'
const AUTHOR_SLUG = 'jean-pierre-duval'

export const revalidate = 86400

const TITLE = 'Fosse septique 2026 : prix et SPANC'
const DESCRIPTION =
  'Assainissement non collectif 2026 : fosse toutes eaux 6 500-12 500 € TTC, micro-station 7 500-12 000 €, contrôle SPANC obligatoire, mise aux normes 4 ans.'

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
  'ANC (Assainissement Non Collectif) obligatoire si raccord réseau public impossible. 5 millions foyers concernés en France.',
  'Prix 2026 TTC posé : fosse toutes eaux + épandage 6 500-10 000 €, filtre à sable drainé 8 500-12 500 €, micro-station 7 500-12 000 €.',
  'SPANC (Service Public Assainissement Non Collectif) : contrôle périodique 4-10 ans (arrêté 27 avril 2012), redevance 80-200 € par contrôle.',
  'Mise aux normes OBLIGATOIRE dans 4 ans suivant VENTE si installation non conforme (art. L1331-1-1 CSP), ou 1 an si risque sanitaire.',
  'Aides : éco-PTZ 10 000 €, crédit d’impôt certaines communes, prime Agence eau 2 000-4 000 €, TVA 10 % RP >2 ans.',
]

const faqs = [
  {
    question: 'Quelle installation d’assainissement individuel choisir en 2026 ?',
    answer:
      'Choix selon terrain + budget + contraintes (arrêté 7 septembre 2009) : (1) FILIÈRE TRADITIONNELLE : FOSSE TOUTES EAUX 3-4 m³ + ÉPANDAGE SOUTERRAIN (tranchées drainantes longueur 60-120 m) : 6 500-10 000 € posé. Nécessite 150-300 m² surface + perméabilité sol (tests) + drainage aval. Durée vie 25-40 ans ; (2) FILIÈRE COMPACTE AGRÉÉE : filtre à sable drainé ou massif filtrant (60-75 L/m²/jour) : 8 500-12 500 €. Convient petites parcelles <300 m² ; (3) MICRO-STATION À BOUES ACTIVÉES (SBR, biodisques, boues activées continues) : 7 500-12 000 € posée (marques Biorock, Graf, Eparco). Surface 8-15 m² seulement, compact. Vidange 3-4 ans (vs 2-4 ans fosse). CONSOMMATION ÉLECTRIQUE 100-300 kWh/an obligatoire ; (4) FILTRE PLANTÉ DE ROSEAUX : 9 000-14 000 € — écologique, faible maintenance, mais surface 5-10 m²/EH (équivalent habitant) ; (5) TOILETTES SÈCHES + EAUX GRISES ÉPURÉES : 3 000-7 000 €, ultra-écologique mais contraignant usage. Règle : grande parcelle + sol perméable = fosse + épandage (pérennité) ; petite parcelle ou sol imperméable = micro-station. Étude de sol préalable (300-600 €) OBLIGATOIRE pour permis construire neuf.',
  },
  {
    question: 'Comment fonctionne le SPANC et quels contrôles prévoir ?',
    answer:
      'SPANC = Service Public d’Assainissement Non Collectif, compétence obligatoire commune/intercommunalité depuis loi 2006 (art. L2224-8 CGCT). (1) CONTRÔLE PÉRIODIQUE : TOUS LES 4-10 ANS selon commune (le plus souvent 8-10 ans). Vérification fonctionnement + accessibilité + état bacs (arrêté 27 avril 2012) ; (2) CONTRÔLE LORS DE VENTE OBLIGATOIRE (loi 12 juillet 2010 Grenelle 2, art. L1331-1-1 CSP) : diagnostic <3 ans annexé compromis, propriétaire vendeur. Si conforme = OK. Si non-conforme = ACQUÉREUR doit faire travaux sous 4 ANS après vente ; (3) CONTRÔLE NEUF à installation : validation conception (étude sol + plan) + contrôle à la fin travaux (bon fonctionnement) ; (4) REDEVANCE : 80-200 € par contrôle périodique + 100-250 € contrôle vente + 100-300 € contrôle neuf. Redevance peut être annuelle fractionnée 30-60 €/an (facturée eau potable) ; (5) NON-CONFORMITÉ : risque sanitaire ou environnemental (pollution nappe/ruisseau, rejet eaux brutes) = mise aux normes sous 1 AN obligatoire, sinon commune peut exécuter travaux d’office aux frais du propriétaire + amende 15 000 €/an (art. L1331-8 CSP) ; (6) VISITE REFUSÉE : astreinte journalière, procédure contentieuse, sanction pénale art. L1312-1 CSP (3 750 € amende).',
  },
  {
    question: 'Quelles aides financières en 2026 pour l’assainissement individuel ?',
    answer:
      'Aides cumulables : (1) ÉCO-PTZ TRAVAUX ASSAINISSEMENT : jusqu’à 10 000 € sans intérêt sur 10 ans (art. R319-11 CCH, décret 2009-1438). Conditions : installation NON POLLUANTE ET CONSOMME PAS d’énergie (donc pas micro-station électrique), filière traditionnelle fosse + épandage ou filtre à sable. Résidence principale >2 ans, entreprise certifiée ; (2) PRIME AGENCE EAU régionale (Agences Loire-Bretagne, Rhin-Meuse, Seine-Normandie, Rhône-Méditerranée-Corse) : 2 000-4 000 € selon agence + type travaux, sous conditions ressources (plafond 40-60 k€ foyer 4 pers.) + priorité zones à enjeu sanitaire ; (3) TVA 10 % art. 279-0 bis CGI résidence principale >2 ans (pas 5,5 % car pas chauffage/isolation) ; (4) CRÉDIT D’IMPÔT AUTONOMIE SENIORS art. 200 quater A CGI : 25 % plafonné 5 000 € sur 5 ans, pour travaux adaptation senior/handicap si intégré dans bouquet ; (5) AIDES LOCALES communes/département : 500-3 000 € variable ; (6) ANAH MaPrimeRénov Sérénité : inclus dans bouquet rénovation globale (art. 1, décret 2022-1649) ; (7) COLLECTIVITÉS RURALES : prêts bonifiés jusqu’à 8 000 € taux 1-2 %. Total aide ménage modeste fosse 8 000 € : 10 000 éco-PTZ + 3 000 agence eau + 400 TVA = 13 400 € aidés sur 8 000 € (mais éco-PTZ est prêt, pas subvention) — effet : 3 400 € subvention + prêt 0 %.',
  },
  {
    question: 'Quelle entretien et vidange pour une fosse septique ?',
    answer:
      'Obligations entretien (arrêté 7 septembre 2009 + 27 avril 2012) : (1) VIDANGE RÉGULIÈRE fosse toutes eaux : dès atteinte 50 % volume utile boues (généralement 3-4 ANS famille 4 personnes, fosse 3 m³). ARRÊT VIDANGE OBLIGATOIRE. Coût 200-400 € par vidange 3 m³ ; (2) VIDANGEUR AGRÉÉ en préfecture (art. L541-8 Code env.) : justifie évacuation vers station d’épuration conforme. DEMANDER BORDEREAU DE SUIVI DE DÉCHETS (BSD) — conservation 5 ans ; (3) NETTOYAGE PRÉFILTRE (si présent) tous 6 mois DIY : rinçage eau claire ; (4) CONTRÔLE VISUEL bacs dégraisseurs cuisine tous 3 mois + vidange annuelle (50-100 €) ; (5) ENTRETIEN ÉPANDAGE : chasser racines 1x/an (pas arbre moins 3 m tranchées), désengorger tranchées si engorgement (traçage + jet haute pression 200-500 €) ; (6) MICRO-STATION : entretien ANNUEL OBLIGATOIRE par contrat (150-350 €/an) — analyse ph, oxygène dissous, niveau boues, filtre UV, sonde, pompe ; (7) NE JAMAIS JETER dans toilettes/évier (destruction bactéries): eau javel forte concentration, solvants peinture/white-spirit, médicaments, serviettes hygiéniques, lingettes nettoyage (même "biodégradables"), huiles alimentaires. Non-entretien = colmatage fosse (1 000-3 000 € curage), pollution sol, SPANC non-conformité + amende.',
  },
  {
    question: 'Quelles démarches pour installer ou changer un assainissement ?',
    answer:
      'Procédure étape par étape : (1) ÉTUDE DE SOL à la parcelle (filière SPANC imposée) : bureau d’étude agréé réalise tests perméabilité sol (tests LPC ou Porchet) + cartographie + recommandations filière adaptée. Coût 300-600 € ; (2) CHOIX FILIÈRE selon étude + terrain + budget ; (3) CONCEPTION PROJET : plan masse + coupe + descriptif technique par professionnel qualifié (Qualibat, fabricant micro-station) ; (4) DÉCLARATION SPANC : dossier complet déposé mairie/SPANC (Cerfa 13703 pour DP si >5 m² terrassement, ou dossier simplifié pour renouvellement filière sur même emplacement). Délai instruction 1-3 mois selon SPANC + complexité ; (5) AVIS SPANC : favorable avec prescriptions (profondeur, matériaux, pente) ou refus (terrain inadapté) ; (6) TRAVAUX par entreprise spécialisée (Qualibat 2141 assainissement ou certification fabricant micro-station). Durée chantier 3-8 jours selon filière ; (7) CONTRÔLE SPANC FIN TRAVAUX avant remblaiement (DEMANDER AVANT REBOUCHER) : vérification conformité, essais étanchéité, cotes hauteur. Délivrance CERTIFICAT CONFORMITÉ ; (8) MISE EN SERVICE + FORMATION usager (fonctionnement, entretien, alertes). Documents à conserver 30 ANS (durée vie typique installation) : étude sol, plans, avis SPANC, PV travaux, certificat conformité. Essentiel pour vente immobilière.',
  },
]

const sources = [
  {
    label: 'Arrêté 7 septembre 2009 — ANC',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Arrêté 27 avril 2012 — Contrôle', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. L1331-1-1 CSP — Vente', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Agences de l’eau — Aides', url: 'https://www.lesagencesdeleau.fr' },
  { label: 'Qualibat 2141 — Assainissement', url: 'https://www.qualibat.com' },
]

const relatedGuides = [
  { label: 'Fuite eau que faire', href: '/guides/fuite-eau-que-faire' },
  { label: 'Odeur canalisation remède', href: '/guides/odeur-canalisation-remede' },
  { label: 'Diagnostics vente obligatoires', href: '/guides/diagnostics-vente-obligatoires' },
  { label: 'Éco-prêt taux zéro 2026', href: '/guides/eco-pret-taux-zero-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Plomberie',
    keywords: [
      'assainissement individuel prix',
      'fosse septique toutes eaux',
      'micro-station épuration',
      'SPANC contrôle',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Assainissement individuel', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Assainissement individuel' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Waves className="w-3.5 h-3.5" aria-hidden />
              Plomberie · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Assainissement individuel : prix et contrôle 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’assainissement non collectif coûte 6 500-12 500 € TTC posé selon la filière (fosse +
              épandage, filtre, micro-station). Voici les prix 2026, le SPANC, la mise aux normes
              vente et les aides.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix assainissement individuel 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Filière</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC posé</th>
                    <th className="p-3 border-b border-sand-200">Surface terrain</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Fosse TE + épandage', '6 500-10 000 €', '150-300 m²'],
                    ['Filtre à sable drainé', '8 500-12 500 €', '50-100 m²'],
                    ['Micro-station agréée', '7 500-12 000 €', '8-15 m²'],
                    ['Filtre planté roseaux', '9 000-14 000 €', '30-50 m²'],
                  ].map(([f, p, s]) => (
                    <tr key={f} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{f}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{s}</td>
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
              href="/services/plombier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un pro ANC <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
