import type { Metadata } from "next"
import Link from "next/link"
import { SITE_URL, SITE_NAME } from "@/lib/seo/config"
import JsonLd from "@/components/JsonLd"
import { getFAQSchema } from "@/lib/seo/jsonld"
import Breadcrumb from "@/components/Breadcrumb"
import RgeGuideBlock from "@/components/rge/RgeGuideBlock"
import {
  Euro,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Calculator,
  ClipboardList,
  Users,
} from "lucide-react"

const PAGE_URL = `${SITE_URL}/guides/maprimerenov-2026-criteres-rge`

export const revalidate = 86400

export const metadata: Metadata = {
  title: "MaPrimeRénov' 2026 : critères RGE, montants et dossier",
  description:
    "MaPrimeRénov' 2026 décryptée : obligation RGE, barèmes par travaux, plafonds de ressources, dossier en 5 étapes, pièges fréquents et cumul CEE.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "MaPrimeRénov' 2026 : critères RGE, montants et dossier",
    description:
      "Barèmes 2026, conditions RGE, dossier pas à pas et cumul avec les CEE pour maximiser votre prime rénovation.",
    url: PAGE_URL,
    type: "article",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "MaPrimeRénov' 2026 : critères RGE, montants et dossier",
    description:
      "Barèmes 2026, conditions RGE, dossier pas à pas et cumul avec les CEE pour maximiser votre prime rénovation.",
  },
}

const profilColors = [
  { nom: "MaPrimeRénov' Bleu", revenus: "Ménages aux revenus très modestes", couleur: "bg-blue-100 text-blue-800 border-blue-200" },
  { nom: "MaPrimeRénov' Jaune", revenus: "Ménages aux revenus modestes", couleur: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { nom: "MaPrimeRénov' Violet", revenus: "Ménages aux revenus intermédiaires", couleur: "bg-purple-100 text-purple-800 border-purple-200" },
  { nom: "MaPrimeRénov' Rose", revenus: "Ménages aux revenus supérieurs", couleur: "bg-pink-100 text-pink-800 border-pink-200" },
]

const etapes = [
  {
    numero: 1,
    titre: "Créer un compte sur maprimerenov.gouv.fr",
    detail:
      "Avant tout devis signé, le propriétaire crée son espace personnel sur le site officiel. L'attribution se fait exclusivement en ligne, aucun dossier papier n'est accepté.",
  },
  {
    numero: 2,
    titre: "Choisir un artisan RGE et obtenir un devis détaillé",
    detail:
      "Le devis doit mentionner le numéro de qualification RGE, les caractéristiques techniques de l'équipement (COP, résistance thermique, etc.), la main-d'œuvre et la TVA à 5,5 %. Aucune prime sans devis RGE.",
  },
  {
    numero: 3,
    titre: "Déposer la demande avant la signature définitive des travaux",
    detail:
      "La demande doit être validée par l'Anah avant le démarrage du chantier. Commencer les travaux sans accord préalable entraîne un refus automatique, sauf acompte limité et daté après la demande.",
  },
  {
    numero: 4,
    titre: "Réaliser les travaux et conserver toutes les factures",
    detail:
      "Chaque facture doit correspondre au devis validé. Un écart sur la marque de la PAC, la surface isolée ou le matériau utilisé peut réduire voire annuler la prime.",
  },
  {
    numero: 5,
    titre: "Demander le paiement en ligne",
    detail:
      "Une fois les travaux terminés, le bénéficiaire télécharge la facture et déclenche le paiement. Le virement intervient généralement sous 15 jours après validation du dossier par l'Anah.",
  },
]

const pieges = [
  "Signer un devis avant de créer son compte MaPrimeRénov' (motif fréquent de refus).",
  "Choisir un artisan dont la qualification RGE a expiré entre le devis et la facture.",
  "Oublier la mention « MaPrimeRénov' » sur le devis ou la facture.",
  "Confondre MaPrimeRénov' Parcours Accompagné (rénovation d'ampleur) et MaPrimeRénov' par geste (monogeste).",
  "Cumuler avec un éco-PTZ sans respecter les conditions techniques du parcours accompagné.",
  "Ne pas conserver les photos avant/après exigées pour l'isolation et les changements de fenêtres.",
]

const travaux = [
  { categorie: "Chauffage & ECS", items: ["Pompe à chaleur air/eau", "Pompe à chaleur géothermique", "Chaudière biomasse (granulés, bûches)", "Chauffe-eau thermodynamique", "Chauffe-eau solaire individuel"] },
  { categorie: "Isolation", items: ["Isolation des combles perdus", "Isolation de la toiture (rampants, sarking)", "Isolation des murs ITE", "Isolation des murs ITI", "Isolation des planchers bas"] },
  { categorie: "Ventilation & audit", items: ["VMC double flux", "Audit énergétique RGE (préalable au parcours accompagné)", "Dépose de cuve à fioul"] },
]

const faqItems = [
  {
    question: "Qui peut bénéficier de MaPrimeRénov' en 2026 ?",
    answer:
      "MaPrimeRénov' est ouverte aux propriétaires occupants, bailleurs et copropriétés, pour un logement construit depuis au moins 15 ans et occupé à titre de résidence principale au moins 8 mois par an. Le logement doit se situer en France métropolitaine ou dans les DROM.",
  },
  {
    question: "Pourquoi l'artisan RGE est-il obligatoire pour MaPrimeRénov' ?",
    answer:
      "La certification RGE (Reconnu Garant de l'Environnement) est la seule garantie reconnue par l'État que l'entreprise maîtrise les règles de l'art des travaux de rénovation énergétique. Sans artisan RGE à la date de signature du devis, la prime est systématiquement refusée, quelle que soit la qualité du chantier.",
  },
  {
    question: "Peut-on cumuler MaPrimeRénov' avec les CEE ?",
    answer:
      "Oui. Les Certificats d'Économies d'Énergie (CEE) se cumulent pleinement avec MaPrimeRénov' en 2026, dans la limite d'un plafond global d'aides. Pour la plupart des gestes (PAC, isolation, chauffage bois), ce cumul est même automatique via les offres « Coup de pouce ».",
  },
  {
    question: "Quel est le délai de versement de la prime ?",
    answer:
      "Après validation du dossier de paiement (facture + éventuelles pièces justificatives), le virement intervient généralement en 15 jours. Les délais peuvent s'allonger en période de forte affluence ou en cas de contrôle aléatoire du dossier.",
  },
  {
    question: "Quelle différence entre MaPrimeRénov' par geste et Parcours Accompagné ?",
    answer:
      "Le parcours « par geste » finance un ou plusieurs travaux simples (changer une chaudière, isoler les combles). Le Parcours Accompagné, obligatoire au-delà de deux gestes et pour les rénovations d'ampleur, impose un audit énergétique et l'intervention d'un Accompagnateur Rénov' agréé, en contrepartie de primes majorées.",
  },
  {
    question: "Que faire si l'artisan perd son RGE pendant le chantier ?",
    answer:
      "La date qui fait foi pour l'éligibilité est la date de signature du devis. Si la qualification RGE était valide à cette date et sur le domaine concerné, la prime reste acquise même si la certification expire pendant les travaux. Conservez une capture d'écran de l'annuaire France Rénov' à la date du devis.",
  },
  {
    question: "Le locataire peut-il demander MaPrimeRénov' ?",
    answer:
      "Non. Seul le propriétaire (occupant ou bailleur) ou le syndicat de copropriétaires peut déposer une demande. Le locataire peut en revanche bénéficier du résultat (confort, économies d'énergie) et demander à son bailleur d'engager la démarche.",
  },
]

const breadcrumbItems = [
  { label: "Guides", href: "/guides" },
  { label: "MaPrimeRénov' 2026 : critères RGE" },
]

export default function MaPrimeRenov2026CriteresRgePage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: "MaPrimeRénov' 2026 : critères RGE", item: PAGE_URL },
    ],
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "MaPrimeRénov' 2026 : critères RGE, montants et dossier",
    description:
      "Guide complet MaPrimeRénov' 2026 : barèmes par travaux, plafonds de ressources, dossier en 5 étapes, obligation RGE et cumul avec les CEE.",
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    datePublished: "2026-04-09",
    dateModified: "2026-04-09",
    mainEntityOfPage: PAGE_URL,
  }

  const faqSchema = getFAQSchema(faqItems)

  return (
    <>
      <JsonLd data={[breadcrumbSchema, articleSchema, faqSchema]} />

      <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Euro className="w-4 h-4" />
            Guide MaPrimeRénov&apos; 2026
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 font-heading leading-tight">
            MaPrimeRénov&apos; 2026 : critères RGE, montants et dossier
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {"Conditions RGE, barèmes 2026 par travaux, plafonds de ressources, dossier pas à pas et cumul avec les CEE : tout ce qu'il faut savoir pour sécuriser votre prime en 2026."}
          </p>
        </section>

        {/* Principe */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading">
              Le principe de MaPrimeRénov&apos; en 2026
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                {"MaPrimeRénov' est l'aide principale de l'État pour financer les travaux de rénovation énergétique des logements. Versée par l'Anah (Agence nationale de l'habitat), elle remplace depuis 2020 le Crédit d'Impôt pour la Transition Énergétique et les aides « Habiter Mieux Agilité »."}
              </p>
              <p>
                {"En 2026, le dispositif conserve deux parcours : un « parcours par geste » pour les petits chantiers (changer une chaudière, isoler les combles) et un « Parcours Accompagné » obligatoire pour les rénovations d'ampleur multi-travaux. Dans les deux cas, la prime est calculée en fonction du revenu fiscal de référence du ménage, du type de travaux et du gain énergétique obtenu."}
              </p>
              <p>
                {"Le montant est fixé à l'avance, par barème, et versé après validation de la facture : vous avancez le financement, puis l'Anah verse la prime sur votre compte bancaire."}
              </p>
            </div>
          </div>
        </section>

        {/* Conditions RGE */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            Conditions RGE obligatoires
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <p className="text-gray-700 mb-6 leading-relaxed">
              {"Le principe est non négociable : sans artisan RGE valide à la date de signature du devis, pas de MaPrimeRénov'. Voici les points de vigilance."}
            </p>
            <ul className="space-y-3">
              {[
                "La qualification RGE doit couvrir le domaine exact des travaux (ex : Qualibat RGE isolation pour des combles, QualiPAC pour une pompe à chaleur).",
                "La date de validité de la certification doit inclure la date de signature du devis.",
                "Les sous-traitants intervenant sur le poste énergétique doivent eux aussi être RGE (en cas de chaîne sous-traitance).",
                "L'artisan doit être immatriculé en France et fournir un SIRET actif.",
                "Les travaux doivent être réalisés en France métropolitaine, en Guadeloupe, Guyane, Martinique, Mayotte ou à La Réunion.",
                "Le logement doit être achevé depuis au moins 15 ans (sauf changement d'une chaudière au fioul où le seuil est de 2 ans).",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Profils revenus */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-heading flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            Les 4 profils de ressources
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {"MaPrimeRénov' segmente les ménages en quatre profils selon le revenu fiscal de référence, corrigé par le nombre de personnes du foyer et la zone géographique (Île-de-France / hors Île-de-France). Plus le profil est modeste, plus la prime par geste est élevée."}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {profilColors.map((p) => (
              <div key={p.nom} className={`rounded-xl border p-5 ${p.couleur}`}>
                <div className="font-bold text-lg mb-1">{p.nom}</div>
                <div className="text-sm">{p.revenus}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-6">
            {"Les plafonds exacts sont actualisés chaque année par arrêté. Consultez le simulateur officiel avant de déposer votre dossier, les seuils évoluent en fonction de l'inflation."}
          </p>
        </section>

        {/* Travaux éligibles */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-heading">
            Travaux éligibles en 2026
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {travaux.map((t) => (
              <div key={t.categorie} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-3">{t.categorie}</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {t.items.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              {"Depuis 2026, les chaudières gaz (même à très haute performance) ne sont plus éligibles à MaPrimeRénov'. Seuls les systèmes décarbonés sont financés : PAC, biomasse, solaire thermique, réseau de chaleur."}
            </p>
          </div>
        </section>

        {/* Dossier en 5 étapes */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-heading flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-green-600" />
            Le dossier en 5 étapes
          </h2>
          <ol className="space-y-4">
            {etapes.map((e) => (
              <li key={e.numero} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shrink-0">
                  {e.numero}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{e.titre}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{e.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Pièges */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            Les pièges fréquents qui font refuser la prime
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <ul className="space-y-3">
              {pieges.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                  <span className="text-amber-900">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cumul CEE */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 md:p-10 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              Cumul avec les CEE : comment maximiser l&apos;aide
            </h2>
            <p className="text-green-50 leading-relaxed mb-4">
              {"Les Certificats d'Économies d'Énergie (CEE) sont distincts de MaPrimeRénov' et restent cumulables en 2026. Dans la pratique, c'est l'artisan ou un délégataire (Effy, Sonergia, TotalEnergies, Engie…) qui monte les deux dossiers en parallèle."}
            </p>
            <p className="text-green-50 leading-relaxed">
              {"Exemple type : pour une pompe à chaleur air/eau remplaçant un fioul, l'aide peut cumuler jusqu'à 5 000 € MaPrimeRénov' (profil modeste), le Coup de pouce chauffage CEE (5 000 € supplémentaires), la TVA 5,5 % et l'éco-PTZ à taux zéro sur le reste à charge. Le tout peut financer 80 à 95 % du chantier pour les ménages très modestes."}
            </p>
            <p className="text-green-100 text-sm mt-4">
              {"Notre guide dédié « Certificats d'Économies d'Énergie (CEE) 2026 » détaille toutes les démarches."}
            </p>
            <Link
              href="/guides/cee-certificats-economies-energie-2026"
              className="inline-flex items-center gap-2 mt-5 bg-white text-emerald-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              Lire le guide CEE 2026
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 font-heading flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-green-600" />
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-gray-900 hover:text-green-700 transition-colors">
                  {item.question}
                  <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <RgeGuideBlock variant="generic" />

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Besoin d&apos;un artisan RGE pour votre dossier MaPrimeRénov&apos; ?
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              {"Obtenez gratuitement un devis auprès d'un professionnel certifié et sécurisez votre prime en quelques minutes."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-8 py-3.5 rounded-xl font-bold hover:bg-green-50 transition-colors"
              >
                <FileCheck className="w-5 h-5" />
                Obtenir mon devis gratuit
              </Link>
              <Link
                href="/verifier-artisan"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-400 transition-colors border border-green-400"
              >
                <ShieldCheck className="w-5 h-5" />
                Vérifier un artisan RGE
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
