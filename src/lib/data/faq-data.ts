export const faqCategories = [
  {
    name: 'Général',
    questions: [
      {
        q: "Qu'est-ce que ServicesArtisans ?",
        a: "ServicesArtisans est le 1er annuaire 100% artisans RGE certifiés en France (Qualibat, Qualifelec, QualiPAC, Qualit'EnR), spécialisé dans la rénovation énergétique. Les qualifications RGE sont vérifiées chaque semaine sur la base ADEME (france-renov.gouv.fr) et le SIRET via le registre SIRENE de l'INSEE. Le service est 100% gratuit.",
      },
      {
        q: 'Le service est-il gratuit ?',
        a: "Oui, ServicesArtisans est entièrement gratuit, aussi bien pour les particuliers que pour les artisans RGE référencés. Pas d'abonnement, pas de commission, pas de frais cachés. Vous pouvez rechercher, comparer et contacter autant d'artisans RGE certifiés que vous le souhaitez.",
      },
      {
        q: 'Comment fonctionne ServicesArtisans ?',
        a: "C'est simple : 1) Recherchez un métier RGE et une localisation, 2) Comparez les profils, les qualifications RGE et les avis vérifiés, 3) Contactez directement l'artisan RGE certifié de votre choix pour obtenir un devis gratuit éligible MaPrimeRénov' et CEE.",
      },
      {
        q: "D'où proviennent les données des artisans ?",
        a: "Les données SIRET proviennent du registre SIRENE de l'INSEE (API recherche-entreprises.api.gouv.fr). Les qualifications RGE (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) sont synchronisées chaque semaine avec la base officielle ADEME france-renov.gouv.fr. Seuls les artisans RGE actifs et en cours de validité sont publiés.",
      },
    ],
  },
  {
    name: 'Demande de devis',
    questions: [
      {
        q: 'Comment demander un devis ?',
        a: 'Cliquez sur "Demander un devis", remplissez le formulaire en décrivant votre projet, et nous transmettons votre demande à un artisan RGE certifié exclusif (1 demande = 1 artisan, jamais partagé) de votre région.',
      },
      {
        q: 'Combien de devis vais-je recevoir ?',
        a: 'Un conseiller vous rappelle rapidement pour vous mettre en relation avec des artisans disponibles dans votre zone.',
      },
      {
        q: "Suis-je obligé d'accepter un devis ?",
        a: 'Non, vous êtes libre de refuser tous les devis. Notre service est sans engagement.',
      },
      {
        q: 'Les devis sont-ils vraiment gratuits ?',
        a: 'Oui, les devis sont 100% gratuits et sans engagement. Vous ne payez que si vous décidez de faire appel à un artisan.',
      },
    ],
  },
  {
    name: 'Artisans',
    questions: [
      {
        q: 'Comment sont sélectionnés les artisans ?',
        a: "Nous référençons uniquement les artisans titulaires d'une qualification RGE (Reconnu Garant de l'Environnement) en cours de validité : Qualibat, Qualifelec, QualiPAC, Qualit'EnR. Chaque entreprise est vérifiée SIRET via SIRENE/INSEE et synchronisée chaque semaine avec la base ADEME officielle (france-renov.gouv.fr). Cela couvre 20+ métiers RGE de la rénovation énergétique dans les 101 départements français.",
      },
      {
        q: 'Les artisans sont-ils assurés ?',
        a: "Les artisans RGE référencés sont légalement tenus de disposer d'une garantie décennale (art. L241-1 Code des assurances) — c'est un prérequis pour obtenir et maintenir leur qualification RGE. Nous vous recommandons de la vérifier systématiquement avant de signer tout devis.",
      },
      {
        q: 'Puis-je voir les avis sur un artisan ?',
        a: 'Oui, chaque fiche artisan affiche les avis et notes laissés par les clients précédents.',
      },
    ],
  },
  {
    name: 'Paiement & Garanties',
    questions: [
      {
        q: "Comment payer l'artisan ?",
        a: "Le paiement se fait directement entre vous et l'artisan, selon les modalités convenues ensemble (espèces, chèque, virement, etc.).",
      },
      {
        q: 'Quelles garanties ai-je sur les travaux ?',
        a: 'Les travaux sont couverts par les garanties légales : garantie de parfait achèvement (1 an), garantie biennale (2 ans) et garantie décennale (10 ans) selon la nature des travaux.',
      },
      {
        q: 'Que faire en cas de litige ?',
        a: "Contactez-nous via notre page Contact. Nous vous accompagnons dans la résolution du litige et pouvons servir de médiateur avec l'artisan.",
      },
    ],
  },
  {
    name: 'Compte & Données',
    questions: [
      {
        q: 'Dois-je créer un compte ?',
        a: 'Non, vous pouvez demander un devis sans créer de compte. Cependant, un compte vous permet de suivre vos demandes et de conserver votre historique.',
      },
      {
        q: 'Comment supprimer mon compte ?',
        a: 'Vous pouvez demander la suppression de votre compte et de vos données en nous contactant à dpo@servicesartisans.fr.',
      },
      {
        q: 'Mes données sont-elles protégées ?',
        a: 'Oui, nous respectons le RGPD et protégeons vos données. Consultez notre politique de confidentialité pour plus de détails.',
      },
    ],
  },
]

// Flat array of all FAQ items for the FAQPage structured data schema
export const faqItems: { question: string; answer: string }[] = faqCategories.flatMap((category) =>
  category.questions.map((q) => ({
    question: q.q,
    answer: q.a,
  }))
)
