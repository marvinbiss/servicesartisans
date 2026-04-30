import type { Metadata } from 'next'
import Link from 'next/link'
import { Droplets, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'adoucisseur-eau-prix-pose'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'
const AUTHOR_SLUG = 'jean-pierre-duval'

export const revalidate = 86400

const TITLE = 'Adoucisseur d’eau 2026 : prix, pose'
const DESCRIPTION =
  'Adoucisseur 2026 : prix 1 000-3 500 € TTC posé, volumétrique 15-25 L, marque NF, entretien sel 80-150 €/an. Comparez les devis gratuits.'

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
  'Prix 2026 TTC posé : adoucisseur volumétrique 15-25 L (2-4 personnes) 1 000-1 800 €, 30 L (5-6 personnes) 1 500-2 500 €, haut de gamme domotique 2 500-3 500 €.',
  'Pertinent si TH >20-25°f (eau dure calcaire). Tester eau : bandelettes 5-10 €, laboratoire 20-40 €, site ARS départemental gratuit.',
  'Règles sanitaires : certificat ACS (attestation conformité sanitaire) + marque NF Adoucisseur (CSTB) obligatoires pour raccord réseau eau potable.',
  'Entretien : sel régénération 25-40 kg/mois = 80-150 €/an + nettoyage bac à sel 1x/an + changement cartouche pré-filtre 30-60 €/an.',
  'Installation plombier après arrivée générale + by-pass obligatoire + évacuation saumure + point jardin/ext. non adouci (arrosage plantes).',
]

const faqs = [
  {
    question: 'Mon eau est-elle assez dure pour justifier un adoucisseur ?',
    answer:
      'Classification dureté eau TH (Titre Hydrotimétrique en °f français, 1°f = 10 mg calcaire/L) : (1) 0-7°f = très douce — aucun adoucisseur nécessaire, eau agressive corrosion métaux ; (2) 7-15°f = douce — pas d’adoucisseur ; (3) 15-25°f = moyennement dure — adoucisseur optionnel ; (4) 25-40°f = dure (majeure partie France urbaine : Paris, Lyon, Lille, Marseille, Bassin Parisien, Jura) — adoucisseur RECOMMANDÉ ; (5) >40°f = très dure (Haute-Savoie, Alpes calcaires, Alsace, Charente) — adoucisseur FORTEMENT CONSEILLÉ. Vérifier dureté eau locale : (a) ARS département site internet (rapport annuel qualité eau potable, commune par commune — gratuit) ; (b) bandelettes test 5-10 € en drogue/jardinerie (précision ±2°f) ; (c) laboratoire 20-40 € analyse complète. Symptômes eau dure : dépôts blancs robinetterie/verres, savon mousse peu, linge rêche, peau sèche, chaudière entartrée (panne 5-10 ans au lieu 15-20 ans), lave-linge durée vie -30 %.',
  },
  {
    question: 'Quel prix pour un adoucisseur d’eau installé en 2026 ?',
    answer:
      'Prix 2026 TTC fourniture + pose par plombier : (1) ADOUCISSEUR VOLUMÉTRIQUE 10-14 L (studio, 1-2 personnes) : 800-1 300 € ; (2) ADOUCISSEUR VOLUMÉTRIQUE 15-25 L (2-4 personnes, appartement/maison) : 1 000-1 800 € — standard ; (3) ADOUCISSEUR VOLUMÉTRIQUE 30 L (5-6 personnes, maison familiale) : 1 500-2 500 € ; (4) ADOUCISSEUR 35-50 L (>6 personnes ou grande maison) : 2 000-3 000 € ; (5) ADOUCISSEUR CONNECTÉ domotique (BWT Perla, Kinetico Premier, Culligan Aqua Plus) : 2 500-3 500 € — pilotage smartphone, consommation optimisée, alertes ; (6) ADOUCISSEUR CHRONOVOLUMÉTRIQUE (écologique -30 % sel) : 2 000-3 000 €. Répartition coût typique (adoucisseur 20 L 1 500 € posé) : appareil + bac sel 900-1 200 €, vanne + robinets by-pass 80-150 €, raccords + ficelles + pre-filtre 60-120 €, pose + mise service 300-500 €. Frais cachés : évacuation eaux saumure (10-30 L/régénération) percement mur 150-400 €, création arrivée électrique étanche 100-250 €, réservoir sel 25 kg appoint initial 20-30 €.',
  },
  {
    question: 'Quels sont les risques santé ou corrosion d’une eau adoucie ?',
    answer:
      'Points d’attention sanitaires + techniques : (1) SODIUM ASSIMILÉ (résultat échange ionique calcaire Ca²⁺/Mg²⁺ → sodium Na⁺) : max 200 mg/L selon OMS eau potable. Eau très dure adoucie complètement peut dépasser 250-400 mg Na/L. Peu de risque adultes sains, mais DÉCONSEILLÉ aux régimes SANS SEL (hypertension, insuffisance cardiaque) ; (2) NOURRISSONS : ne pas préparer biberons avec eau adoucie (reins immatures), utiliser eau en bouteille faiblement minéralisée ; (3) POINT D’EAU NON ADOUCI obligatoire cuisine ou robinet potable + arrosage jardin (plantes souffrent du sel) ; (4) CORROSION MÉTAUX : eau adoucie <10°f TH = agressive, peut corroder canalisations cuivre + chauffe-eau acier. CORRECTION : maintenir 8-15°f résiduel (réglage vanne mélangeuse) ; (5) LEGIONELLA : bac à sel humide + tuyaux stagnants = terrain favorable. Nettoyer bac à sel annuel (vider + désinfecter eau javel 10 %) + purger si absence >1 mois ; (6) NORMES ACS (Attestation Conformité Sanitaire) + NF Adoucisseur (marque CSTB) OBLIGATOIRES (art. R1321-50 CSP). Vérifier documents installateur.',
  },
  {
    question: 'Quelle est la consommation de sel et d’eau d’un adoucisseur ?',
    answer:
      'Consommation variables selon modèle + usage : (1) SEL : régénération déclenche quand résine saturée, 25-40 kg/mois famille 4 personnes TH 30°f (= 80-150 €/an à 30 €/sac 25 kg), 8-12 kg/mois appartement 2 personnes ; (2) SEL EN PASTILLES NORMÉES NF — éviter sel industriel déneigeant (impuretés). Marques : Esco, Axal Pro, Aquasel, Culligan ; (3) EAU REJETÉE SAUMURE : 40-80 L/régénération = 150-300 L/semaine famille 4 (impact facture eau +5-10 %) ; (4) ÉLECTRICITÉ : négligeable <10 kWh/an (horloge + vanne motorisée) ; (5) VOLUMÉTRIQUE INTELLIGENT économise 20-40 % sel vs chronologique (régénère selon usage réel, pas chaque J+X) ; (6) OPTIMISATION : régler TH résiduel 8-12°f (pas 0°f), bypass jardin obligatoire, arrêt adoucisseur si maison vide >7 jours (arrêt régénération = économie). Coût global annuel adoucisseur 20 L famille 4 personnes : 120 € sel + 60 € eau saumure + 5 € électricité + 40 € cartouche pré-filtre = ~225 €/an vs économie entartrage 250-450 €/an (chaudière, machines, tuyaux).',
  },
  {
    question: 'Qui peut installer un adoucisseur et quel entretien prévoir ?',
    answer:
      'Installation RÉSERVÉE PLOMBIER QUALIFIÉ (Qualibat 5311 plomberie) : (1) Raccord arrivée principale eau AVANT chauffe-eau + vanne by-pass 3 voies obligatoire (déshabilite adoucisseur si maintenance) ; (2) Point sortie eau non adoucie : cuisine/robinet potable + arrosage extérieur + lave-vaisselle (optionnel) ; (3) ÉVACUATION SAUMURE raccordée évacuation eaux usées (pas ruissellement jardin = corrosion sol) ; (4) Alimentation élec étanche IP44 minimum 230 V ; (5) ATTESTATION DE CONFORMITÉ remise par installateur ; (6) Aménagement abri ventilé (garage, buanderie) si extérieur (gel = rupture, stocker sel sec) ; (7) AUTOCONSTRUCTION : légale mais dénonce assurance habitation en cas dégât des eaux + certification ACS perdue. ENTRETIEN : (a) Appoint sel tous 4-6 semaines (ne jamais laisser bac vide : résine sèche = panne) 80-150 €/an ; (b) Vérif niveau sel 1x/mois, dépoussiérage capteurs ; (c) Nettoyage bac sel + désinfection eau javel annuel (1-2h DIY ou 80-120 € pro) ; (d) Changement cartouche pré-filtre anti-sédiment 5 µm tous 6-12 mois (10-30 € cartouche) ; (e) Désinfection résine tous 5 ans (produit spé 40-80 € + plombier 100-200 €) ; (f) Remplacement résine complète 10-15 ans (300-500 €). Contrat entretien pro : 120-250 €/an tout compris recommandé.',
  },
]

const sources = [
  {
    label: 'Art. R1321-1 à R1321-50 CSP',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'ACS — Attestation sanitaire', url: 'https://www.acs.eau.gouv.fr' },
  { label: 'CSTB — Marque NF Adoucisseur', url: 'https://www.cstb.fr' },
  { label: 'Ministère Santé — Dureté eau', url: 'https://solidarites-sante.gouv.fr' },
  { label: 'Qualibat 5311 — Plomberie sanitaire', url: 'https://www.qualibat.com' },
]

const relatedGuides = [
  { label: 'Fuite eau que faire', href: '/guides/fuite-eau-que-faire' },
  { label: 'Dégât eaux responsabilités voisin', href: '/guides/degat-eaux-responsabilites-voisin' },
  { label: 'Plombier tarif horaire 2026', href: '/guides/plombier-tarif-horaire-2026' },
  { label: 'Chauffe-eau thermodynamique prix', href: '/guides/chauffe-eau-thermodynamique-prix' },
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
      'adoucisseur eau prix',
      'adoucisseur volumétrique',
      'NF Adoucisseur ACS',
      'entretien adoucisseur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Adoucisseur d’eau', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Adoucisseur d’eau' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              Plomberie · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Adoucisseur d’eau : prix et pose 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un adoucisseur d’eau coûte 1 000-3 500 € TTC posé selon le volume et ouvre une
              économie sur chaudière et appareils électroménagers. Voici les prix 2026, la norme ACS
              et l’entretien annuel.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix adoucisseurs posés 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Volume</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC posé</th>
                    <th className="p-3 border-b border-sand-200">Foyer cible</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Volumétrique 10-14 L', '800-1 300 €', '1-2 personnes'],
                    ['Volumétrique 15-25 L', '1 000-1 800 €', '2-4 personnes'],
                    ['Volumétrique 30 L', '1 500-2 500 €', '5-6 personnes'],
                    ['Volumétrique 35-50 L', '2 000-3 000 €', '>6 personnes'],
                    ['Connecté domotique', '2 500-3 500 €', 'Haut de gamme'],
                  ].map(([v, p, f]) => (
                    <tr key={v} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{v}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{f}</td>
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
              Trouver un plombier Qualibat <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
