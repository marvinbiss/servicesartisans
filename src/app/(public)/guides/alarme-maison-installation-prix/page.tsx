import type { Metadata } from 'next'
import Link from 'next/link'
import { Siren, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'alarme-maison-installation-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'
const AUTHOR_SLUG = 'marc-lefebvre'

export const revalidate = 86400

const TITLE = 'Alarme maison 2026 : prix, pose'
const DESCRIPTION =
  'Alarme maison 2026 : 300-2 500 € TTC installée, télésurveillance 25-50 €/mois, NF EN 50131-1 grade 2, réduction assurance 5-15 %. Devis gratuit.'

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
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix 2026 TTC installée : kit DIY 150-600 €, kit pro installé 800-2 500 €, télésurveillance 25-50 €/mois + 0-350 € frais ouverture.',
  'Norme NF EN 50131-1 grade 2 recommandée habitation + certification APSAD type P2/P3 pour maisons à risque.',
  'Réduction assurance habitation 5-15 % sur cotisation si alarme certifiée + télésurveillance (varie selon assureur).',
  'Caméras = déclaration CNIL obligatoire si vidéosurveillance public (art. 26 RGPD) + panneau information visible.',
  'Installation DIY légale (2,4 GHz sans licence) mais pose pro recommandée (paramétrage + garantie + assurance).',
]

const faqs = [
  {
    question: 'Quel prix pour installer une alarme maison en 2026 ?',
    answer:
      'Prix 2026 TTC installée selon ambition : (1) KIT DIY BASIQUE 1-2 pièces (centrale + sirène + 3-4 détecteurs ouverture + PIR) : 150-350 € — bricolage, Xiaomi, Aqara, Somfy Protect ; (2) KIT DIY ÉTOFFÉ maison 100 m² (centrale + 6-10 détecteurs + 2 PIR + télécommandes + carillon) : 400-800 € — Somfy One, Ajax Starter, Yale ; (3) KIT PRO INSTALLÉ maison 100 m² (Daitem, Diagral, Bosch) : 800-1 500 € — marques pro, paramétrage + garantie ; (4) PRO HAUT DE GAMME maison 150 m² avec caméras HD + centrale autonome + dôme vidéo + sirène 120 dB : 1 500-2 500 € — pose pro + branchement ; (5) TÉLÉSURVEILLANCE complète : +25-50 €/mois abonnement (Verisure, Telem2 Sureté, Securitas Direct, Nexecur) + frais ouverture 0-350 €. Frais cachés : sirène intérieure supplémentaire 80-200 €, batterie secours 50-150 €, connectivité GSM/3G 100-250 €, paramétrage box domotique 150-400 €.',
  },
  {
    question: 'Alarme filaire, radio ou hybride : que choisir ?',
    answer:
      'Comparatif 3 technologies : (1) FILAIRE — câblage 12-24 V entre centrale et détecteurs, fiabilité maximale, pas de pile à changer, sécurité (pas de brouillage radio), MAIS requiert saignées murs + pose en construction ou rénovation lourde, coût pose élevé (+40-60 % vs radio), rare en rénovation résidentielle ; (2) RADIO 868 MHz (standard européen protégé) — installation rapide sans câblage, pile lithium 3-5 ans dans chaque détecteur, portée 30-100 m + répéteurs, MAIS risque brouillage volontaire (jammers vendus sur internet, illégaux), changement piles nécessaire. Supervision de ligne 433 MHz anti-brouillage = +20 % vs 868 MHz seul ; (3) HYBRIDE (centrale filaire + détecteurs radio extensibles) : solution middle ground, pose rapide + fiabilité centrale ; (4) CONNECTÉE IP / WIFI : radio + accès distant smartphone, Xiaomi, Somfy, Ajax — pratique mais nécessite box internet + batterie secours (panne internet = alarme aveugle si pas de GSM). Recommandation 2026 : radio 868 MHz avec supervision de ligne + GSM secours pour résidentiel.',
  },
  {
    question: 'Télésurveillance ou alarme autonome : est-ce rentable ?',
    answer:
      'Comparatif économique : (1) ALARME AUTONOME (sans télésurveillance) : coût unique 400-2 000 €, dissuade 75-85 % des cambriolages selon INHESJ, MAIS pas de levée de doute ni intervention pro, déclenchement = voisins prévenus ou usager seul ; (2) TÉLÉSURVEILLANCE : 25-50 €/mois soit 300-600 €/an = 3 000-6 000 € sur 10 ans, opérateur APSAD type P3 reçoit alerte, vérifie par audio/vidéo, appelle propriétaire + police/gardiennage si confirmation, intervention 30-60 min garantie. Intervention physique sur site inclus chez certains opérateurs (Verisure, Securitas Direct) ; (3) RÉDUCTION ASSURANCE : 5-15 % sur cotisation annuelle (ex : cotisation 600 €/an → économie 60 € si 10 % réduction — soit ~1 an d’abonnement amorti sur 5-10 ans) ; (4) RENTABILITÉ : maison isolée + bijoux/biens >20 000 € + résidence secondaire = télésurveillance ; résidence principale + bon voisinage + absences courtes = autonome + alertes smartphone suffisant ; (5) Attention clauses résiliation : engagement 12-48 mois, frais résiliation 100-500 €, lire conditions générales.',
  },
  {
    question: 'Quelles normes et certifications respecter ?',
    answer:
      'Référentiels 2026 : (1) NF EN 50131-1 — norme européenne classement 4 grades selon risque : GRADE 1 (risque faible, résidentiel DIY), GRADE 2 (risque moyen, recommandé habitation pro), GRADE 3 (risque élevé, commerces), GRADE 4 (risque très élevé, bijouteries) ; (2) APSAD (Assurance Sécurité Prévention) : certifications système P2 (agrément Loïc partiel), P3 (agrément complet bâtiment) ; (3) NF EN 50131-5-3 : anti-brouillage radio obligatoire grade 2+ ; (4) MARQUAGE CE obligatoire sur centrale + sirène + détecteurs (conformité UE) ; (5) RÉDUCTION ASSURANCE : exige souvent NF EN 50131-1 grade 2 minimum + certificat installation conforme ; (6) INSTALLATION PRO CERTIFIÉE : société doit détenir numéro CNAPS (Conseil national activités privées sécurité, obligatoire depuis 2012, art. L611-1 CSI). Vérifier sur CNAPS.fr ; (7) Caméras avec vidéosurveillance = déclaration CNIL + RGPD art. 26, panneau information RGPD visible. Non-conformité : déclenchement chez voisin, assurance refuse réduction, sinistre non indemnisé si installation DIY non conforme.',
  },
  {
    question: 'Comment réduire les fausses alarmes ?',
    answer:
      'Sources principales + solutions : (1) ANIMAUX DOMESTIQUES — installer PIR (infrarouge passif) anti-animaux avec cut-off <25 kg ou double technologie PIR+hyperfréquence ; (2) INSECTES SUR CAPTEUR — poser répulsif insectes + dépoussiérer tous 2-3 mois ; (3) RIDEAUX/OBJETS MOUVANTS — ne pas positionner PIR face à chauffage radiateur, courant d’air rideau ; (4) ALARMES MAL PARAMÉTRÉES (T1 seuil détection trop bas, zone trop sensible) — vérif paramétrage installateur ; (5) PILE FAIBLE — changer avant 80 % décharge, indicateur LED + app mobile ; (6) DÉTECTEURS OUVERTURE MAL RÉGLÉS — aimant/reed trop écarté (2-3 mm max, vérif porte/fenêtre gonflées par humidité) ; (7) TÉLÉSURVEILLANCE FACTUREE : opérateur majore 80-150 € si >3 fausses alarmes/an (art. 23 arrêté 16 février 2015). Au-delà 5 fausses alarmes/an, opérateur peut suspendre service. Tests mensuels recommandés : déclencher volontairement 1x/mois pour vérifier batterie, sirène, comm centrale. Procédure annuelle entretien pro : 80-150 € HT conseillée.',
  },
]

const sources = [
  {
    label: 'NF EN 50131-1 — Systèmes alarme',
    url: 'https://www.afnor.org',
  },
  { label: 'APSAD — Certifications P2/P3', url: 'https://www.apsad.fr' },
  { label: 'CNAPS — Sociétés agréées', url: 'https://www.cnaps.interieur.gouv.fr' },
  { label: 'CNIL — Vidéosurveillance', url: 'https://www.cnil.fr' },
  { label: 'INHESJ — Risques cambriolage', url: 'https://www.inhesj.fr' },
]

const relatedGuides = [
  { label: 'Domotique installation smart home', href: '/guides/domotique-installation-smart-home' },
  { label: 'Porte claquée serrurier prix', href: '/guides/porte-claquee-serrurier-prix' },
  {
    label: 'Serrurier arnaques tarifs honnêtes',
    href: '/guides/serrurier-arnaques-tarifs-honnetes',
  },
  { label: 'Assurance habitation travaux', href: '/guides/assurance-habitation-travaux' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Sécurité',
    keywords: [
      'alarme maison prix',
      'télésurveillance prix',
      'NF EN 50131-1 APSAD',
      'installation alarme',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Alarme maison', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Alarme maison' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Siren className="w-3.5 h-3.5" aria-hidden />
              Sécurité · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Alarme maison : prix et installation 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une alarme coûte 150-2 500 € TTC installée selon le type (kit DIY, pro, avec caméras)
              et la télésurveillance 25-50 €/mois. Voici les prix 2026, les normes NF EN 50131-1, la
              CNIL et l’impact assurance.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix alarmes maison 2026 installées</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                    <th className="p-3 border-b border-sand-200">Cible</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Kit DIY 1-2 pièces', '150-350 €', 'Studio, appartement'],
                    ['Kit DIY maison 100 m²', '400-800 €', 'Bricoleur motivé'],
                    ['Kit pro installé 100 m²', '800-1 500 €', 'Maison individuelle'],
                    ['Pro + caméras 150 m²', '1 500-2 500 €', 'Haut de gamme'],
                    ['Télésurveillance /mois', '25-50 €', 'Intervention pro 24/7'],
                  ].map(([c, p, u]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{u}</td>
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
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un installateur alarme <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
