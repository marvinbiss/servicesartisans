import type { BlogArticle } from './articles'

/**
 * 10 articles "piliers" de 3 000+ mots — contenus de référence pour dominer les SERPs
 * sur les requêtes à fort volume (rénovation, isolation, PAC, toiture, aides, artisan, etc.).
 *
 * Créé le 2026-04-03.
 */

export const piliersArticles: Record<string, BlogArticle> = {
  // ────────────────────────────────────────────────────────────────────────────
  // 1. RÉNOVATION MAISON — GUIDE ULTIME 2026 (~3 500 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'renovation-maison-guide-ultime-2026': {
    title: 'Rénovation Maison : Le Guide complet 2026 (Budget, Étapes, Aides)',
    excerpt:
      "Tout ce qu'il faut savoir pour rénover sa maison en 2026 : budget par type de rénovation et par pièce, chronologie d'un chantier de 3 mois, check-list administrative, 10 erreurs qui coûtent cher et tableau des aides cumulables.",
    metaTitle: 'Rénovation Maison 2026 : Guide complet Budget',
    metaDescription:
      'Guide complet rénovation maison 2026 : budget 200-2 000 €/m², chronologie chantier, permis, aides cumulables. 10 erreurs à éviter.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-01',
    updatedDate: '2026-04-29',
    readTime: '18 min',
    category: 'Guides',
    tags: ['rénovation', 'maison', 'budget', 'aides', 'guide', '2026'],
    keyTakeaways: [
      'Rénovation légère : 200-500 €/m² — peinture, sols, petites réparations',
      'Rénovation moyenne : 500-1 200 €/m² — cuisine, salle de bain, isolation ciblée',
      'Rénovation lourde : 1 200-2 200 €/m² — remise aux normes complète, structure',
      "Les aides cumulées (MaPrimeRénov' + CEE + Éco-PTZ + TVA 5,5 %) couvrent 30 à 70 % du budget énergétique",
      "Toujours prévoir 10-15 % de marge pour les imprévus, surtout dans l'ancien",
      'Un planning réaliste dure 3 à 6 mois pour une rénovation complète de 100 m²',
    ],
    content: [
      `## Pourquoi rénover sa maison en 2026 ?

Rénover une maison n'est pas un simple coup de peinture : c'est un investissement qui augmente la valeur patrimoniale du bien, réduit les factures énergétiques et améliore le confort de vie quotidien. En 2026, trois facteurs poussent à l'action : le DPE obligatoire pour les locations (interdiction des passoires thermiques classe G depuis janvier 2025, classe F en 2028), les aides financières historiquement généreuses et la hausse du coût de l'énergie qui rend l'isolation de plus en plus rentable.

Ce guide couvre **chaque étape** d'un projet de rénovation : du budget prévisionnel au choix des artisans, en passant par les démarches administratives et les pièges à éviter. Que vous envisagiez un simple rafraîchissement ou une réhabilitation complète, vous trouverez ici les informations concrètes pour prendre les bonnes décisions.`,

      `## Budget par type de rénovation

Le coût d'une rénovation dépend principalement du **niveau d'intervention** : légère, moyenne ou lourde. Voici les fourchettes constatées en 2026, main-d'œuvre incluse.

:::budget
| Type de rénovation | Prix au m² | Budget pour 100 m² | Exemples de travaux |
| Rénovation légère | 200 – 500 € | 20 000 – 50 000 € | Peinture, sols souples, interrupteurs, petites réparations |
| Rénovation moyenne | 500 – 1 200 € | 50 000 – 120 000 € | Cuisine, salle de bain, isolation murs/combles, fenêtres |
| Rénovation lourde | 1 200 – 2 200 € | 120 000 – 220 000 € | Mises aux normes complètes, toiture, charpente, structure |
:::

Ces montants incluent les matériaux, la main-d'œuvre et la TVA applicable (10 % ou 5,5 % selon la nature des travaux) (source : FFB / CAPEB, enquêtes annuelles 2025 ; baromètres Architecteo et Hellowatt 2026). Ils n'incluent pas les honoraires d'architecte (8-15 % du montant HT des travaux) ni les frais de maîtrise d'œuvre.

:::tip Astuce budget
Regroupez vos travaux en un seul chantier plutôt que de les étaler sur plusieurs années. Vous mutualisez les frais d'installation de chantier (500-2 000 €), les déplacements artisans et vous bénéficiez d'un meilleur pouvoir de négociation.
:::`,

      `## Budget détaillé par pièce

Chaque pièce a ses spécificités. Voici les fourchettes moyennes constatées en 2026 pour une rénovation **complète** de chaque pièce :

:::budget
| Pièce | Budget bas | Budget moyen | Budget haut |
| Salle de bain (5-8 m²) | 4 000 € | 10 000 € | 25 000 € |
| Cuisine (10-15 m²) | 5 000 € | 15 000 € | 35 000 € |
| Chambre (12-15 m²) | 2 000 € | 5 000 € | 12 000 € |
| Salon/séjour (25-35 m²) | 3 000 € | 8 000 € | 20 000 € |
| WC (2-3 m²) | 1 500 € | 3 500 € | 8 000 € |
| Entrée/couloir (5-10 m²) | 1 000 € | 3 000 € | 8 000 € |
:::

Pour la **salle de bain**, le poste le plus coûteux est la plomberie (déplacement des arrivées/évacuations d'eau) : de 1 500 à 5 000 €. Consultez notre [guide dédié à la rénovation salle de bain](/blog/prix-renovation-salle-de-bain-guide-complet-2026) pour un détail par élément.

Pour la **cuisine**, c'est l'électroménager et les meubles qui pèsent le plus. Retrouvez notre [guide complet prix cuisine](/blog/prix-renovation-cuisine-guide-complet-2026) avec 3 exemples de devis commentés.`,

      `## Budget par poste technique

Au-delà des pièces, il est utile de connaître le coût de chaque **lot technique** :

:::budget
| Lot technique | Fourchette de prix | Part du budget total |
| Gros œuvre / maçonnerie | 200 – 800 €/m² | 15 – 25 % |
| Toiture / charpente | 80 – 250 €/m² | 10 – 20 % |
| Isolation (murs + combles) | 40 – 150 €/m² | 8 – 15 % |
| Menuiseries extérieures | 500 – 2 000 € / fenêtre | 5 – 12 % |
| Électricité (mise aux normes) | 80 – 150 €/m² | 8 – 12 % |
| Plomberie / sanitaires | 60 – 120 €/m² | 8 – 12 % |
| Chauffage / ventilation | 3 000 – 20 000 € forfait | 8 – 15 % |
| Revêtements (sols + murs) | 30 – 120 €/m² | 5 – 10 % |
| Peinture / finitions | 20 – 60 €/m² | 3 – 8 % |
:::

:::warning Attention aux coûts cachés
N'oubliez pas les postes souvent sous-estimés : désamiantage (20-60 €/m²), déplombage (30-50 €/m² pour les peintures au plomb), traitement termites (2 000-5 000 €), mise en conformité assainissement (5 000-15 000 €). Dans une maison ancienne, ces postes peuvent représenter 10 à 20 % du budget total.
:::`,

      `## Chronologie type d'un chantier de 3 mois

Un projet de rénovation moyenne (100 m², 80 000 € de budget) suit généralement ce calendrier :

**Mois 0 — Préparation (4-8 semaines avant le démarrage)**
- Semaine 1-2 : diagnostic de l'existant, relevés, études techniques
- Semaine 3-4 : demande de 3 à 5 devis, comparaison, négociation
- Semaine 5-6 : dépôt de déclaration préalable ou permis de construire si nécessaire
- Semaine 7-8 : signature des devis, acompte (max 30 %), commande des matériaux

**Mois 1 — Gros œuvre et structure**
- Semaine 1 : installation de chantier, protections, dépose/démolitions
- Semaine 2 : maçonnerie, ouverture/fermeture de murs, reprises de structure
- Semaine 3-4 : toiture si nécessaire, isolation extérieure ou combles

**Mois 2 — Second œuvre**
- Semaine 5-6 : électricité (passage des gaines, tableau), plomberie (alimentation, évacuation)
- Semaine 7 : isolation intérieure, cloisons en placo
- Semaine 8 : pose des menuiseries intérieures et extérieures

**Mois 3 — Finitions**
- Semaine 9-10 : carrelage, faïence, revêtements de sol
- Semaine 11 : peinture, pose de la cuisine et des sanitaires
- Semaine 12 : nettoyage de chantier, levée des réserves, réception des travaux

:::tip Conseil planning
Planifiez votre chantier entre mars et octobre pour bénéficier de conditions météo favorables. Les artisans sont moins disponibles en été (vacances) et les délais de livraison des matériaux s'allongent en automne. Idéalement, démarrez en mars ou septembre.
:::`,

      `## Check-list administrative complète

Avant de démarrer les travaux, vous devez constituer un dossier solide. Voici la check-list exhaustive :

**Démarches obligatoires :**
- [ ] Vérifier le PLU (Plan Local d'Urbanisme) en mairie — certaines restrictions s'appliquent en zone protégée
- [ ] Déclaration préalable de travaux : pour un changement d'aspect extérieur (fenêtres, façade, toiture)
- [ ] Permis de construire : obligatoire si modification de la structure porteuse ou changement de destination
- [ ] Accord copropriété (si applicable) : vote en AG pour les parties communes
- [ ] Diagnostic amiante avant travaux (DAT) : obligatoire pour les immeubles construits avant juillet 1997
- [ ] Diagnostic plomb : obligatoire pour les immeubles construits avant 1949

**Assurances et garanties :**
- [ ] Vérifier l'attestation d'assurance décennale de chaque artisan
- [ ] Souscrire une assurance dommages-ouvrage (DO) — fortement recommandée pour les travaux > 20 000 €
- [ ] Conserver toutes les factures et PV de réception pour la garantie décennale (10 ans)

**Aides financières :**
- [ ] Déposer le dossier MaPrimeRénov' **avant** de signer les devis (obligatoire depuis 2024)
- [ ] S'inscrire sur une plateforme CEE (Certificats d'Économie d'Énergie) avant signature
- [ ] Demander l'Éco-PTZ auprès de votre banque (montage du dossier : 2 à 4 semaines)
- [ ] Vérifier les aides locales (conseil régional, département, commune)

:::warning Point juridique crucial
La souscription d'une assurance dommages-ouvrage (DO) n'est pas "recommandée", elle est **légalement obligatoire** pour le maître d'ouvrage (art. L242-1 du Code des assurances). En pratique, peu de particuliers la souscrivent (coût : 2 à 5 % du montant des travaux), mais elle est votre seule protection en cas de sinistre sur la structure dans les 10 ans suivant les travaux.
:::`,

      `## Les 10 erreurs qui coûtent cher en rénovation

Des années d'expérience auprès des artisans et propriétaires nous ont permis d'identifier les erreurs les plus coûteuses. Évitez-les pour maîtriser votre budget.

:::expert Parole d'expert — Jean-Marc Duval, maître d'œuvre depuis 22 ans
"80 % des dépassements de budget que je constate viennent de trois causes : pas de diagnostic initial sérieux, pas de marge pour les imprévus, et un choix d'artisan uniquement sur le prix le plus bas."
:::

**1. Ne pas faire de diagnostic avant travaux** — Coût de l'erreur : 5 000 à 30 000 €
Découvrir de l'amiante, du plomb, des termites ou un plancher pourri en cours de chantier entraîne un arrêt des travaux et des surcoûts majeurs. Investissez 500 à 1 500 € dans un diagnostic complet avant de démarrer.

**2. Choisir le devis le moins cher** — Coût : 10 000 à 50 000 €
Le moins-disant cache souvent des prestations non incluses, des matériaux bas de gamme ou un artisan non assuré. Comparez les devis ligne par ligne, pas seulement le total. Consultez notre [guide anti-arnaque](/blog/choisir-artisan-guide-anti-arnaque-2026).

**3. Ne pas prévoir de marge pour les imprévus** — Coût : 5 000 à 20 000 €
Dans l'ancien, les surprises sont quasi systématiques. Prévoyez **15 % de marge minimum** (20 % pour les maisons d'avant 1950).

**4. Déplacer la plomberie sans nécessité** — Coût : 2 000 à 8 000 €
Chaque déplacement d'arrivée d'eau ou d'évacuation coûte cher. Conservez la disposition existante tant que possible.

**5. Négliger la ventilation** — Coût : 3 000 à 10 000 €
Une maison isolée sans ventilation performante (VMC simple ou double flux) génère humidité, moisissures et problèmes de santé. Budget VMC : 2 000 à 7 000 €.

**6. Faire les travaux dans le mauvais ordre** — Coût : 3 000 à 15 000 €
Poser le carrelage avant la plomberie, peindre avant l'électricité : des erreurs de séquençage entraînent des reprises coûteuses. Consultez notre [guide "par où commencer"](/blog/travaux-maison-par-ou-commencer-guide-2026).

**7. Oublier les démarches administratives** — Coût : amende de 1 200 à 6 000 € + démolition possible
Des travaux réalisés sans déclaration préalable ou permis de construire peuvent entraîner une obligation de remise en état à vos frais.

**8. Ne pas souscrire d'assurance dommages-ouvrage** — Coût : potentiellement le montant total de la rénovation
En cas de malfaçon structurelle, sans DO, vous devrez attendre la fin d'une procédure judiciaire (2 à 5 ans) pour être indemnisé.

**9. Sous-estimer le coût de l'électricité** — Coût : 3 000 à 12 000 €
La mise aux normes NF C 15-100 d'une maison ancienne coûte facilement 8 000 à 15 000 €. Ne la négligez pas sous peine de refus du Consuel.

**10. Ne pas formaliser la réception des travaux** — Coût : perte des garanties
La réception des travaux (PV de réception signé) est le point de départ de la garantie décennale. Sans ce document, vous perdez vos droits en cas de litige.`,

      `## Tableau des aides cumulables en 2026

La rénovation énergétique bénéficie d'un arsenal d'aides financières cumulables. Voici le panorama complet :

:::budget
| Aide | Montant max | Conditions principales | Cumulable avec |
| MaPrimeRénov' (par geste) | 11 000 € / geste | Logement > 15 ans, artisan RGE | CEE, Éco-PTZ, TVA 5,5 % |
| MaPrimeRénov' Parcours Accompagné | 63 000 € | Gain ≥ 2 classes DPE, MAR obligatoire | CEE, Éco-PTZ, TVA 5,5 % |
| CEE (primes énergie) | 2 000 – 5 000 € | Artisan RGE, fiche standardisée | MaPrimeRénov', Éco-PTZ |
| Éco-PTZ | 50 000 € (prêt 0 %) | Logement > 2 ans | MaPrimeRénov', CEE |
| TVA 5,5 % | Économie ~15 % | Travaux d'amélioration énergétique | Toutes les aides |
| Aides locales (régions, villes) | Variable | Selon collectivité | MaPrimeRénov', CEE |
:::

Pour une simulation complète par profil de revenus, consultez notre [guide dédié aux aides](/blog/aides-renovation-energetique-cumul-2026).

:::tip Cumul maximal
Un ménage aux revenus modestes (profil Bleu) rénovant une maison F peut obtenir jusqu'à **90 % de prise en charge** via le Parcours Accompagné + CEE + TVA 5,5 %. Le reste à charge peut être financé par l'Éco-PTZ à taux zéro.
:::`,

      `## Comment choisir ses artisans pour une rénovation complète ?

Le choix des artisans est **la** décision qui conditionne la réussite ou l'échec de votre rénovation. Voici la méthode :

**Étape 1 : Définir les lots et les corps de métier**
Une rénovation complète implique souvent 4 à 8 corps de métier différents : maçon, [électricien](/services/electricien), [plombier](/services/plombier), carreleur, peintre, menuisier, [couvreur](/services/couvreur) et parfois [chauffagiste](/services/chauffagiste). Identifiez chaque lot précisément.

**Étape 2 : Demander 3 devis par lot**
Utilisez notre [service de devis gratuit](/devis) pour recevoir rapidement des propositions d'artisans vérifiés près de chez vous. Comparez les devis poste par poste, pas uniquement le montant total.

**Étape 3 : Vérifier chaque artisan**
- SIRET actif sur societe.com ou infogreffe.fr
- Assurance décennale en cours de validité (demandez l'attestation)
- Qualification RGE si travaux énergétiques (vérifiable sur france-renov.gouv.fr)
- Avis clients vérifiés (pas seulement sur son propre site)

**Étape 4 : Coordonner les interventions**
Sans maître d'œuvre, c'est à vous de coordonner les artisans. Désignez un "chef de file" (souvent le maçon ou le plombier) et établissez un planning partagé. Un retard sur un lot retarde tous les suivants.

:::warning Ne tombez pas dans le piège du "tout-en-un"
Certaines entreprises générales de rénovation proposent un prix global attractif mais sous-traitent chaque lot au moins-disant. Vérifiez qui intervient réellement sur le chantier et exigez que les sous-traitants soient nommés dans le contrat.
:::`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **FFB** (Fédération Française du Bâtiment) — mercuriale des prix du bâtiment 2025-2026
- **CAPEB** — enquête annuelle sur les tarifs artisanaux (2025)
- **ADEME** — guides pratiques rénovation énergétique (2025)
- **ANAH / MaPrimeRénov'** — barèmes officiels 2026 (plafonds revalorisés de +2,4 %)
- **INSEE** — indice BT01 du coût de la construction
- **Architecteo / Hellowatt** — baromètres prix rénovation 2026
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3, grandes métropoles × 1.15). Dernière mise à jour : avril 2026.`,

      `## FAQ — Rénovation maison 2026`,
    ],
    faq: [
      {
        question: 'Quel est le prix moyen pour rénover entièrement une maison de 100 m² ?',
        answer:
          "Le prix moyen pour une rénovation complète (moyenne) d'une maison de 100 m² se situe entre 50 000 et 120 000 € en 2026, selon l'état initial et le niveau de finition souhaité. Une rénovation lourde (mise aux normes complète) peut atteindre 150 000 à 220 000 €.",
      },
      {
        question: 'Combien de temps durent des travaux de rénovation complète ?',
        answer:
          "Comptez 3 à 6 mois pour une rénovation complète de 100 m², auxquels s'ajoutent 1 à 3 mois de préparation (devis, administratif). Un simple rafraîchissement prend 2 à 4 semaines.",
      },
      {
        question: 'Faut-il un architecte pour rénover sa maison ?',
        answer:
          'Un architecte est obligatoire si la surface de plancher dépasse 150 m² après travaux. En dessous, il est recommandé pour les projets complexes (modification de structure, changement de destination). Ses honoraires représentent 8 à 15 % du montant HT des travaux.',
      },
      {
        question: 'Peut-on vivre dans la maison pendant les travaux ?',
        answer:
          "C'est possible pour un rafraîchissement ou une rénovation partielle pièce par pièce. Pour une rénovation lourde, il est fortement déconseillé d'habiter sur place (poussière, bruit, coupures d'eau/électricité). Prévoyez un budget logement temporaire de 800 à 1 500 €/mois.",
      },
      {
        question: 'Comment financer sa rénovation sans apport ?',
        answer:
          "L'Éco-PTZ permet d'emprunter jusqu'à 50 000 € à taux zéro sur 20 ans. Un prêt travaux classique (taux 3-5 % en 2026) complète le financement. Les aides (MaPrimeRénov' + CEE) sont versées après travaux mais certaines banques acceptent de les déduire du plan de financement.",
      },
      {
        question: 'Quelles sont les aides pour la rénovation en 2026 ?',
        answer:
          "Les principales aides sont : MaPrimeRénov' (jusqu'à 63 000 € en parcours accompagné), les CEE (2 000-5 000 €), l'Éco-PTZ (50 000 € à taux zéro), la TVA à 5,5 % sur les travaux énergétiques et les aides locales. Elles sont cumulables.",
      },
      {
        question: "Quelle est la rentabilité d'une rénovation énergétique ?",
        answer:
          'Une rénovation énergétique bien menée (isolation + chauffage performant) réduit la facture de 40 à 70 % et augmente la valeur du bien de 5 à 15 %. Le retour sur investissement se situe entre 8 et 15 ans, ramené à 3-7 ans après déduction des aides.',
      },
      {
        question: "Faut-il un permis de construire pour rénover l'intérieur ?",
        answer:
          "Non, la rénovation intérieure sans modification de l'aspect extérieur ni de la structure ne nécessite ni permis ni déclaration. En revanche, le changement de fenêtres, la modification de la façade ou la création d'ouvertures nécessitent une déclaration préalable.",
      },
      {
        question: 'Comment éviter les arnaques en rénovation ?',
        answer:
          "Vérifiez systématiquement le SIRET, l'assurance décennale et la qualification RGE de chaque artisan. Ne versez jamais plus de 30 % d'acompte. Méfiez-vous des démarchages à domicile et des prix anormalement bas. Consultez notre guide anti-arnaque détaillé.",
      },
      {
        question: 'Rénovation partielle ou globale : que choisir ?',
        answer:
          "La rénovation globale est plus économique au m² (mutualisation des frais de chantier) et offre de meilleures aides (Parcours Accompagné MaPrimeRénov'). La rénovation partielle convient si le budget est limité ou si seule une pièce nécessite des travaux.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 2. PRIX RÉNOVATION SALLE DE BAIN — GUIDE COMPLET 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'prix-renovation-salle-de-bain-guide-complet-2026': {
    title: 'Prix Rénovation Salle de Bain 2026 : Guide Complet par Élément',
    excerpt:
      'Prix détaillé par élément (douche italienne, baignoire, carrelage, plomberie), 5 niveaux de gamme, 3 exemples de devis commentés et erreurs de conception à éviter pour votre salle de bain.',
    metaTitle: 'Prix Salle de Bain 2026 : Devis Détaillé',
    metaDescription:
      'Prix rénovation salle de bain 2026 : douche italienne, baignoire, carrelage, plomberie. 3 devis réels commentés. Obtenez un devis gratuit.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-04',
    updatedDate: '2026-04-29',
    readTime: '16 min',
    category: 'Tarifs',
    tags: [
      'salle de bain',
      'rénovation',
      'prix',
      'douche italienne',
      'carrelage',
      'plomberie',
      '2026',
    ],
    keyTakeaways: [
      'Budget éco (rafraîchissement) : 2 500 – 5 000 € sans modification de plomberie',
      'Budget standard (rénovation complète) : 8 000 – 15 000 € incluant plomberie et carrelage',
      "Budget haut de gamme : 15 000 – 30 000 € avec matériaux nobles et douche à l'italienne",
      'La douche italienne coûte 1 800 – 6 000 € posée selon les dimensions et finitions',
      "Conserver la disposition existante des arrivées d'eau permet d'économiser 2 000 – 5 000 €",
      "Les aides MaPrimeAdapt' couvrent jusqu'à 70 % pour l'adaptation PMR",
    ],
    content: [
      `## Ce qui détermine le prix d'une rénovation de salle de bain

Le prix d'une rénovation de salle de bain dépend de quatre facteurs principaux : la **surface** (une salle de bain de 4 m² ne coûte pas autant qu'une suite parentale de 12 m²), le **niveau de gamme** des matériaux, l'**ampleur des modifications de plomberie** et la **complexité de la dépose**. Comprendre ces facteurs vous permet de maîtriser votre budget et de faire des arbitrages éclairés.

En 2026, les prix ont légèrement augmenté (+3 % en moyenne par rapport à 2025) en raison de la hausse des coûts de main-d'œuvre qualifiée et de certains matériaux (cuivre, céramique importée). Mais les techniques modernes (receveur extra-plat, panneaux muraux, robinetterie encastrée) permettent d'optimiser les coûts sur la pose. Demandez un [devis gratuit salle de bain](/devis/plombier) pour votre projet.`,

      `## Prix détaillé par élément

### Douche à l'italienne

La douche à l'italienne est l'équipement le plus demandé en 2026. Elle nécessite un receveur extra-plat ou une étanchéité intégrale (SPEC), un caniveau ou une bonde extra-plate et un revêtement antidérapant.

:::budget
| Composant | Entrée de gamme | Milieu de gamme | Haut de gamme |
| Receveur extra-plat (90×120) | 150 – 300 € | 300 – 600 € | 600 – 1 500 € |
| Paroi vitrée fixe (80 cm) | 200 – 400 € | 400 – 800 € | 800 – 1 500 € |
| Robinetterie thermostatique | 150 – 300 € | 300 – 600 € | 600 – 1 200 € |
| Carrelage sol + murs douche | 300 – 600 € | 600 – 1 200 € | 1 200 – 3 000 € |
| Pose complète (plombier + carreleur) | 1 000 – 1 800 € | 1 800 – 2 500 € | 2 500 – 4 000 € |
| **TOTAL douche italienne** | **1 800 – 3 400 €** | **3 400 – 5 700 €** | **5 700 – 11 200 €** |
:::

### Baignoire

:::budget
| Type de baignoire | Fourniture | Pose | Total posé |
| Baignoire acrylique classique | 200 – 600 € | 400 – 800 € | 600 – 1 400 € |
| Baignoire îlot design | 800 – 3 000 € | 600 – 1 200 € | 1 400 – 4 200 € |
| Baignoire balnéo | 1 500 – 5 000 € | 800 – 1 500 € | 2 300 – 6 500 € |
| Baignoire + douche combinée | 600 – 2 000 € | 500 – 1 000 € | 1 100 – 3 000 € |
:::

### Meuble vasque et lavabo

:::budget
| Type | Fourniture | Pose | Total posé |
| Meuble sous-vasque simple | 150 – 400 € | 150 – 300 € | 300 – 700 € |
| Meuble double vasque | 400 – 1 500 € | 200 – 400 € | 600 – 1 900 € |
| Vasque à poser design | 100 – 800 € | 150 – 300 € | 250 – 1 100 € |
| Plan vasque sur mesure | 300 – 2 000 € | 200 – 500 € | 500 – 2 500 € |
:::`,

      `### Carrelage et revêtements

Le carrelage représente un poste important : comptez le prix du matériau **et** de la pose (qui est souvent plus chère que le carreau lui-même en entrée de gamme).

:::budget
| Revêtement | Prix fourni-posé au m² | Surface type 6 m² |
| Carrelage grès cérame (30×30) | 40 – 70 €/m² | 240 – 420 € |
| Carrelage grand format (60×60) | 60 – 120 €/m² | 360 – 720 € |
| Carrelage imitation bois | 50 – 100 €/m² | 300 – 600 € |
| Mosaïque (douche, crédence) | 80 – 200 €/m² | 480 – 1 200 € |
| Faïence murale | 35 – 80 €/m² | 350 – 800 € (10 m² murs) |
| Panneaux muraux PVC/composite | 30 – 80 €/m² | 300 – 800 € (10 m² murs) |
:::

:::tip Astuce économie
Les panneaux muraux PVC ou composite s'installent directement sur le carrelage existant, supprimant la dépose et la préparation du support. Économie : 1 000 – 2 000 € sur une salle de bain de 6 m².
:::

### Plomberie

:::budget
| Intervention | Prix moyen |
| Remplacement robinetterie (sans déplacement des arrivées) | 200 – 600 € |
| Déplacement d'un point d'eau (arrivée + évacuation) | 800 – 2 000 € |
| Création d'un nouveau point d'eau complet | 1 500 – 3 000 € |
| Remplacement colonne de douche | 300 – 800 € |
| Remplacement alimentation générale | 500 – 1 500 € |
| Création d'une évacuation avec pente (sol sur terre-plein) | 1 000 – 3 000 € |
:::

### Électricité

La salle de bain est soumise à la norme NF C 15-100 qui définit des volumes de sécurité :

:::budget
| Intervention | Prix moyen |
| Mise aux normes tableau + différentiel 30 mA | 300 – 800 € |
| Éclairage spot LED encastré (x4) | 200 – 500 € |
| Prise rasoir volume 3 | 80 – 150 € |
| Sèche-serviettes électrique (fourni + posé) | 300 – 1 200 € |
| Miroir éclairant avec prise intégrée | 200 – 800 € |
:::`,

      `## Les 5 niveaux de gamme

Pour y voir clair, voici les 5 niveaux de rénovation avec le budget type pour une salle de bain de 5-6 m² :

**Niveau 1 — Rafraîchissement (2 500 – 5 000 €)** : Peinture spéciale pièce humide, remplacement de la robinetterie, pose de sol vinyle clipsable, changement des accessoires (porte-serviettes, miroir). Aucune modification de plomberie.

**Niveau 2 — Rénovation partielle (5 000 – 10 000 €)** : Remplacement de la douche OU de la baignoire par un modèle neuf, nouveau carrelage au sol, faïence murale, meuble vasque neuf. Plomberie conservée en l'état.

**Niveau 3 — Rénovation complète standard (10 000 – 16 000 €)** : Dépose totale, douche à l'italienne, meuble double vasque, carrelage sol + murs, WC suspendu, plomberie refaite si nécessaire, mise aux normes électriques.

**Niveau 4 — Rénovation premium (16 000 – 25 000 €)** : Idem niveau 3 avec carrelage grand format, robinetterie encastrée, niche éclairée, cloison verrière, sèche-serviettes design, éclairage indirect.

**Niveau 5 — Sur mesure luxe (25 000 – 40 000 €+)** : Matériaux nobles (marbre, tadelakt, bois exotique), baignoire îlot, douche XXL double pommeau, domotique (éclairage, musique, chauffage au sol), menuiserie sur mesure.

:::warning Budget plomberie caché
Le poste "plomberie" est souvent sous-estimé dans les devis d'entrée de gamme. Si votre salle de bain a plus de 25 ans, prévoyez systématiquement 1 500 – 3 000 € pour la mise à niveau des alimentations (remplacement cuivre vétuste par PER) et des évacuations (remplacement plomb par PVC).
:::`,

      `## 3 exemples de devis réels commentés

### Devis n°1 — Rafraîchissement d'une salle de bain de 4 m² (appartement Lyon)

:::budget
| Poste | Montant HT |
| Peinture anti-humidité murs et plafond (12 m²) | 480 € |
| Sol vinyle clipsable (4 m²) | 220 € |
| Colonne de douche thermostatique | 350 € |
| Meuble vasque 60 cm + miroir éclairant | 550 € |
| Accessoires (porte-serviettes, patère, dérouleur) | 120 € |
| Main-d'œuvre (plombier 4h + peintre 2 jours) | 1 280 € |
| **TOTAL HT** | **3 000 €** |
| TVA 10 % (logement > 2 ans) | 300 € |
| **TOTAL TTC** | **3 300 €** |
:::

**Commentaire** : un devis cohérent pour un rafraîchissement sans dépose. Le point fort : la colonne thermostatique (confort + sécurité anti-brûlure). Le point à vérifier : l'état du joint silicone de la baignoire existante (non inclus dans le devis).

### Devis n°2 — Rénovation complète d'une salle de bain de 6 m² (maison Bordeaux)

:::budget
| Poste | Montant HT |
| Dépose complète (baignoire, carrelage, faïence, meuble) | 1 200 € |
| Évacuation gravats (benne) | 350 € |
| Plomberie (alimentation PER + évacuation PVC) | 1 800 € |
| Électricité (mise aux normes + 4 spots LED) | 950 € |
| Receveur douche italienne 120×90 + paroi vitrée | 1 100 € |
| Carrelage sol grès cérame 60×60 (6 m²) | 540 € |
| Faïence murale 30×60 (14 m²) | 980 € |
| Meuble double vasque 120 cm | 750 € |
| WC suspendu bâti-support | 650 € |
| Sèche-serviettes mixte | 420 € |
| Main-d'œuvre (plombier + carreleur + électricien) | 3 800 € |
| **TOTAL HT** | **12 540 €** |
| TVA 10 % | 1 254 € |
| **TOTAL TTC** | **13 794 €** |
:::

**Commentaire** : un devis équilibré pour une rénovation complète en milieu de gamme. Le poste plomberie (1 800 € HT) est justifié par le remplacement complet des alimentations. Point de vigilance : demander le détail des matériaux (marque, référence) pour chaque poste.

### Devis n°3 — Suite parentale haut de gamme de 10 m² (maison Aix-en-Provence)

:::budget
| Poste | Montant HT |
| Dépose + préparation support | 1 800 € |
| Plomberie complète + chauffage au sol | 3 500 € |
| Électricité (domotique, éclairage indirect, miroir connecté) | 2 200 € |
| Douche italienne XXL 160×100 + double pommeau | 2 800 € |
| Baignoire îlot 170×75 | 2 200 € |
| Carrelage grand format 120×60 sol + murs | 3 600 € |
| Double vasque sur mesure en Corian + meuble chêne | 3 500 € |
| Robinetterie encastrée (Grohe Atrio) | 1 800 € |
| WC suspendu sans bride + lave-mains intégré | 1 200 € |
| Main-d'œuvre (4 corps de métier, 3 semaines) | 6 500 € |
| **TOTAL HT** | **29 100 €** |
| TVA 10 % | 2 910 € |
| **TOTAL TTC** | **32 010 €** |
:::

**Commentaire** : un projet ambitieux mais les montants sont cohérents. Le chauffage au sol (inclus dans la plomberie) est un vrai plus pour le confort. La domotique (2 200 €) est un poste optionnel qui peut être supprimé pour économiser.`,

      `## Les erreurs de conception à éviter

**1. Négliger la pente d'évacuation de la douche italienne**
La pente doit être de 1 à 2 cm/m minimum vers la bonde. Si votre sol est un plancher bois ou une dalle béton insuffisamment épaisse, la création de la pente peut nécessiter un rehaussement de tout le sol (surcoût : 800 – 2 000 €). Vérifiez ce point avec votre [plombier](/services/plombier) avant de vous engager.

**2. Choisir un carrelage trop glissant**
En salle de bain, le classement antidérapant est crucial : exigez au minimum un classement **R10** (pieds nus) et **B** (pieds nus en zone humide) pour le sol de la douche. Les carrelages polis grand format sont magnifiques mais dangereux sans traitement antidérapant.

**3. Installer une VMC insuffisante**
Une salle de bain sans extraction mécanique correcte (VMC simple flux hygro B minimum) développera des moisissures en quelques mois, surtout avec une douche italienne ouverte qui génère beaucoup de vapeur. Budget VMC : 500 – 2 000 €.

**4. Sous-dimensionner le ballon d'eau chaude**
Si vous passez d'une baignoire à une douche, le volume d'eau chaude nécessaire diminue. Mais si vous ajoutez une double vasque, un sèche-serviettes et un lave-mains WC, la demande augmente. Faites recalculer le dimensionnement de votre production d'eau chaude.

**5. Oublier l'accessibilité future**
Même si vous n'en avez pas besoin aujourd'hui, préparez la salle de bain pour un usage futur PMR : douche de plain-pied (pas de receveur surélevé), barres de renfort noyées dans le mur (30 € la barre vs 200 € à installer après coup), porte de 80 cm minimum.

:::expert Parole d'expert — Claire Martin, architecte d'intérieur spécialisée en rénovation
"La première erreur que je vois sur les chantiers : vouloir tout caser dans 4 m². Une salle de bain bien conçue avec une douche et un meuble vasque sera toujours plus agréable qu'une salle de bain encombrée avec douche + baignoire + double vasque + WC dans le même espace."
:::`,

      `## Aides et TVA pour la rénovation de salle de bain

**TVA à 10 %** : s'applique automatiquement sur la main-d'œuvre et les matériaux fournis par l'artisan si le logement a plus de 2 ans. Économie de 10 % par rapport à la TVA à 20 %.

**TVA à 5,5 %** : s'applique uniquement sur les travaux d'amélioration de la performance énergétique (par exemple, un sèche-serviettes électrique performant en remplacement d'un convecteur).

**MaPrimeAdapt'** : jusqu'à 22 000 € d'aide pour adapter la salle de bain aux personnes âgées ou en situation de handicap (douche accessible, siège, barres d'appui). Conditions : être propriétaire occupant, logement principal, revenus sous les plafonds.

**Crédit d'impôt** : les équipements spécifiques pour personnes handicapées (siège de douche mural, barre d'appui) ouvrent droit à un crédit d'impôt de 25 % dans la limite de 5 000 € (personne seule) ou 10 000 € (couple).

Pour trouver un [plombier qualifié](/services/plombier) ou un carreleur expérimenté près de chez vous, utilisez notre annuaire d'artisans vérifiés et recevez vos devis en 48h.`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **CAPEB** — enquête annuelle sur les tarifs artisanaux (2025)
- **Travaux.com / Habitatpresto** — baromètre prix rénovation salle de bain 2026 : 900-2 000 €/m²
- **La Maison Saint-Gobain** — guide budget salle de bain 2026
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3, grandes métropoles × 1.15). Dernière mise à jour : avril 2026.`,

      `## FAQ — Prix rénovation salle de bain 2026`,
    ],
    faq: [
      {
        question: 'Quel budget minimum pour rénover une salle de bain ?',
        answer:
          'Le budget minimum pour un rafraîchissement (peinture, sol vinyle, nouvelle robinetterie) est de 2 500 à 5 000 € pour une salle de bain de 4-6 m². Pour une rénovation complète avec dépose, comptez au minimum 8 000 €.',
      },
      {
        question: 'Combien coûte une douche italienne posée ?',
        answer:
          'Une douche italienne complète (receveur + paroi + robinetterie + carrelage + pose) coûte entre 1 800 et 6 000 € en milieu de gamme. En haut de gamme avec mosaïque et robinetterie encastrée, comptez 6 000 à 12 000 €.',
      },
      {
        question: 'Peut-on rénover sa salle de bain sans casser le carrelage ?',
        answer:
          'Oui, plusieurs solutions existent : peinture spéciale carrelage (15-30 €/m²), panneaux muraux collés directement sur le carrelage (30-80 €/m²), ou béton ciré sur carrelage existant (60-120 €/m²). Économie : 1 000 à 3 000 € de dépose évitée.',
      },
      {
        question: 'Combien de temps durent les travaux de rénovation de salle de bain ?',
        answer:
          'Un rafraîchissement prend 2 à 5 jours. Une rénovation complète standard nécessite 2 à 3 semaines. Une suite parentale haut de gamme peut prendre 3 à 4 semaines. Ajoutez 1 semaine de séchage pour le carrelage au sol avant utilisation.',
      },
      {
        question: 'Vaut-il mieux une douche ou une baignoire pour la valeur du bien ?',
        answer:
          "Dans un logement avec une seule salle d'eau, une douche à l'italienne est plus valorisante (perception de modernité). Si vous avez deux salles d'eau, gardez une baignoire dans l'une et une douche dans l'autre. Les familles avec enfants recherchent au moins une baignoire.",
      },
      {
        question: 'Quelles aides pour adapter sa salle de bain seniors ?',
        answer:
          "MaPrimeAdapt' finance jusqu'à 70 % des travaux d'adaptation (max 22 000 €) pour les personnes de 60+ ans en perte d'autonomie ou les personnes handicapées. Le crédit d'impôt de 25 % s'applique aussi sur les équipements spécifiques.",
      },
      {
        question: 'Faut-il un plombier pour rénover sa salle de bain ?',
        answer:
          "Oui, un plombier qualifié est indispensable pour les raccordements eau et la pose du receveur de douche (étanchéité). Il travaille souvent avec un carreleur et un électricien. Comptez 1 500 à 4 000 € de main-d'œuvre plomberie selon la complexité.",
      },
      {
        question: 'Quel carrelage choisir pour une salle de bain ?',
        answer:
          "Privilégiez un grès cérame pleine masse (résistant à l'eau) classé R10 minimum au sol. Format tendance 2026 : 60×60 ou 60×120 au sol, 30×60 en faïence murale. Le carrelage imitation bois (50-100 €/m² posé) offre un rendu chaleureux sans les inconvénients du bois.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 3. PRIX RÉNOVATION CUISINE — GUIDE COMPLET 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'prix-renovation-cuisine-guide-complet-2026': {
    title: 'Prix Rénovation Cuisine 2026 : Guide Complet (Devis, Matériaux, Planning)',
    excerpt:
      'Prix par type de cuisine (en I, en L, en U, îlot), comparatif matériaux plan de travail, budget électroménager et planning type. 3 exemples de devis détaillés.',
    metaTitle: 'Prix Cuisine 2026 : Guide Complet Rénovation',
    metaDescription:
      'Prix rénovation cuisine 2026 : 5 000-35 000 € selon la configuration. Comparatif matériaux, budget électroménager, planning. Devis gratuit.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-07',
    updatedDate: '2026-04-29',
    readTime: '16 min',
    category: 'Tarifs',
    tags: ['cuisine', 'rénovation', 'prix', 'plan de travail', 'électroménager', '2026'],
    keyTakeaways: [
      'Cuisine en I (3 ml) : 5 000 – 12 000 € tout compris',
      'Cuisine en L (5-6 ml) : 8 000 – 20 000 € tout compris',
      'Cuisine en U ou avec îlot : 15 000 – 35 000 €+ tout compris',
      'Le plan de travail pèse 10-20 % du budget meubles : de 50 €/ml (stratifié) à 500 €/ml (granit)',
      "L'électroménager représente 15-30 % du budget total selon la gamme",
      'Planning type : 6 à 10 semaines de la commande à la fin de pose',
    ],
    content: [
      `## Combien coûte la rénovation d'une cuisine en 2026 ?

La cuisine est la pièce la plus complexe à rénover : elle mobilise jusqu'à 5 corps de métier (cuisiniste, [plombier](/services/plombier), [électricien](/services/electricien), carreleur, peintre) et combine mobilier, technique et finitions. En 2026, le budget moyen d'une rénovation complète de cuisine se situe entre **8 000 et 20 000 €** pour un projet standard de 8 à 12 m².

Les prix dépendent fortement de la **configuration** (linéaire, en L, en U, avec îlot), du **niveau de gamme** des meubles et du plan de travail, et de l'**ampleur des travaux techniques** (déplacement de l'évier, modification du réseau électrique, création d'un conduit d'évacuation pour la hotte). Ce guide détaille chaque poste pour que vous puissiez anticiper votre budget au plus juste.`,

      `## Prix par type de cuisine

### Cuisine en I (linéaire)

La cuisine linéaire occupe un seul mur, idéale pour les petits espaces (studios, appartements). Longueur type : 2,5 à 4 mètres linéaires.

:::budget
| Gamme | Meubles + plan de travail | Électroménager | Pose + raccordements | Total |
| Entrée de gamme | 1 500 – 3 000 € | 1 000 – 2 000 € | 1 500 – 2 500 € | 4 000 – 7 500 € |
| Milieu de gamme | 3 000 – 6 000 € | 2 000 – 4 000 € | 2 000 – 3 000 € | 7 000 – 13 000 € |
| Haut de gamme | 6 000 – 12 000 € | 4 000 – 7 000 € | 2 500 – 4 000 € | 12 500 – 23 000 € |
:::

### Cuisine en L

La configuration en L est la plus populaire : elle offre un bon compromis entre espace de rangement, plan de travail et circulation. Longueur type : 4 à 7 mètres linéaires.

:::budget
| Gamme | Meubles + plan de travail | Électroménager | Pose + raccordements | Total |
| Entrée de gamme | 2 500 – 5 000 € | 1 500 – 2 500 € | 2 000 – 3 000 € | 6 000 – 10 500 € |
| Milieu de gamme | 5 000 – 10 000 € | 2 500 – 5 000 € | 2 500 – 4 000 € | 10 000 – 19 000 € |
| Haut de gamme | 10 000 – 18 000 € | 5 000 – 8 000 € | 3 000 – 5 000 € | 18 000 – 31 000 € |
:::

### Cuisine en U

La cuisine en U exploite trois murs, offrant un maximum de rangement et de plan de travail. Elle convient aux pièces d'au moins 10 m².

:::budget
| Gamme | Meubles + plan de travail | Électroménager | Pose + raccordements | Total |
| Entrée de gamme | 4 000 – 7 000 € | 1 500 – 3 000 € | 2 500 – 3 500 € | 8 000 – 13 500 € |
| Milieu de gamme | 7 000 – 14 000 € | 3 000 – 5 500 € | 3 000 – 5 000 € | 13 000 – 24 500 € |
| Haut de gamme | 14 000 – 25 000 € | 5 500 – 9 000 € | 3 500 – 6 000 € | 23 000 – 40 000 € |
:::

### Cuisine avec îlot central

L'îlot central est la star des cuisines ouvertes : il sert de plan de travail supplémentaire, de coin repas et de séparation visuelle avec le séjour. Ajoutez 3 000 à 10 000 € au budget d'une cuisine en L ou en U.

:::budget
| Poste îlot | Entrée de gamme | Milieu de gamme | Haut de gamme |
| Caisson îlot (120×60 cm) | 800 – 1 500 € | 1 500 – 3 000 € | 3 000 – 6 000 € |
| Plan de travail îlot | 300 – 600 € | 600 – 1 500 € | 1 500 – 4 000 € |
| Raccordement plomberie (si évier sur îlot) | 500 – 1 500 € | 500 – 1 500 € | 500 – 2 000 € |
| Raccordement électrique | 300 – 600 € | 300 – 800 € | 500 – 1 200 € |
| Hotte îlot | 300 – 800 € | 800 – 2 000 € | 2 000 – 5 000 € |
:::

:::warning Point technique
Un îlot avec évier ou plaque de cuisson nécessite des raccordements techniques (eau, électricité, évacuation, gaz). Si votre sol est une dalle béton, le passage des canalisations sous chape coûte 1 000 à 3 000 € supplémentaires. En étage sur plancher bois, l'opération est encore plus complexe et coûteuse.
:::`,

      `## Comparatif matériaux plan de travail

Le plan de travail est l'élément le plus sollicité de la cuisine : il doit résister aux chocs, à la chaleur, aux taches et à l'humidité. Voici le comparatif 2026 :

:::budget
| Matériau | Prix au ml (60 cm prof.) | Résistance chaleur | Résistance taches | Entretien | Durée de vie |
| Stratifié HPL | 50 – 150 € | ⚠️ Moyenne | ✅ Bonne | ✅ Facile | 10-15 ans |
| Bois massif (chêne, hêtre) | 100 – 300 € | ⚠️ Moyenne | ⚠️ Moyenne | ⚠️ Huilage régulier | 15-25 ans |
| Quartz (Silestone, Caesarstone) | 200 – 450 € | ✅ Très bonne | ✅ Très bonne | ✅ Facile | 20-30 ans |
| Granit | 250 – 500 € | ✅ Excellente | ✅ Très bonne | ✅ Facile | 30+ ans |
| Dekton / céramique grand format | 300 – 600 € | ✅ Excellente | ✅ Excellente | ✅ Très facile | 30+ ans |
| Corian (solid surface) | 250 – 500 € | ⚠️ Moyenne | ✅ Très bonne | ✅ Réparable | 20-25 ans |
| Inox | 300 – 600 € | ✅ Excellente | ⚠️ Rayures | ⚠️ Traces de doigts | 30+ ans |
:::

:::tip Meilleur rapport qualité-prix
Le **quartz** (type Silestone) offre le meilleur compromis : résistant aux taches et à la chaleur, sans entretien, disponible dans des dizaines de coloris. Pour une cuisine de 4 ml, comptez 800 à 1 800 € fourni-posé.
:::`,

      `## Budget électroménager

L'électroménager représente un poste important. Voici les fourchettes par appareil en 2026 :

:::budget
| Appareil | Entrée de gamme | Milieu de gamme | Haut de gamme |
| Plaque induction 4 feux | 200 – 400 € | 400 – 800 € | 800 – 2 000 € |
| Four encastrable pyrolyse | 250 – 500 € | 500 – 1 000 € | 1 000 – 3 000 € |
| Hotte aspirante | 100 – 300 € | 300 – 800 € | 800 – 2 500 € |
| Réfrigérateur encastrable | 400 – 700 € | 700 – 1 500 € | 1 500 – 3 000 € |
| Lave-vaisselle encastrable | 300 – 500 € | 500 – 1 000 € | 1 000 – 2 000 € |
| Micro-ondes encastrable | 150 – 300 € | 300 – 600 € | 600 – 1 500 € |
| **Total électroménager** | **1 400 – 2 700 €** | **2 700 – 5 700 €** | **5 700 – 14 000 €** |
:::

:::warning Piège classique
Les cuisinistes intègrent souvent un électroménager de marque distributeur dans leur offre "tout compris". Vérifiez les références exactes de chaque appareil : un four "Electrolux" peut coûter 300 € (entrée de gamme) ou 1 500 € (série pro). Le nom de marque ne suffit pas.
:::`,

      `## Planning type d'une rénovation cuisine

Une rénovation cuisine suit un planning précis pour éviter les temps morts et les erreurs de coordination :

**Semaine 1-2 — Conception et commande**
- Prise de mesures par le cuisiniste (visite technique gratuite)
- Validation du plan 3D et des matériaux
- Commande des meubles et du plan de travail (délai fabrication : 3 à 6 semaines)
- Commande de l'électroménager

**Semaine 3-4 — Préparation**
- Dépose de l'ancienne cuisine (1-2 jours)
- Évacuation des gravats
- Travaux de plomberie si déplacement de l'évier (1-2 jours)
- Mise aux normes électrique : ajout de prises, circuit dédié plaque/four (1-2 jours)
- Ragréage du sol si nécessaire

**Semaine 5-6 — Revêtements**
- Pose du carrelage ou revêtement de sol (2-3 jours)
- Peinture des murs et plafond (1-2 jours)
- Pose de la crédence si carrelage (1-2 jours)

**Semaine 7-8 — Installation cuisine**
- Réception et vérification des meubles
- Montage et fixation des meubles bas et hauts (2-3 jours)
- Pose du plan de travail (1 jour)
- Raccordement évier et électroménager (1 jour)

**Semaine 9-10 — Finitions**
- Pose des poignées, joints silicone, plinthes
- Réglage des charnières et tiroirs
- Installation de l'éclairage sous meubles hauts
- Nettoyage final et réception des travaux

:::tip Anticipez les délais de livraison
En 2026, les délais de fabrication des cuisines sur mesure varient de 4 à 8 semaines. Les plans de travail en pierre naturelle (granit, quartz) nécessitent une prise de cotes après pose des meubles, ajoutant 2 à 3 semaines. Commandez tôt pour éviter les mauvaises surprises.
:::`,

      `## Les erreurs coûteuses en rénovation de cuisine

**1. Sous-estimer le nombre de prises électriques** — Coût de correction : 300-800 €
La norme impose 6 prises minimum dont 4 au-dessus du plan de travail. Prévoyez-en plus pour le petit électroménager quotidien (cafetière, grille-pain, robot).

**2. Choisir une hotte sous-dimensionnée** — Impact : odeurs persistantes, graisse sur les meubles
Le débit de la hotte doit être 10 à 12 fois le volume de la pièce. Pour une cuisine ouverte de 30 m³, il faut une hotte de 300 à 360 m³/h minimum.

**3. Négliger le triangle d'activité** — Impact : fatigue, perte de temps au quotidien
Les trois zones (stockage/froid, lavage/préparation, cuisson) doivent former un triangle dont le périmètre ne dépasse pas 6 à 7 mètres.

**4. Installer un îlot dans une cuisine trop petite** — Espace minimum : 15 m²
Il faut au minimum 90 cm de circulation autour de l'îlot (120 cm si des meubles s'ouvrent face à l'îlot).

**5. Oublier l'éclairage plan de travail** — Coût d'ajout après coup : 200-500 €
L'éclairage sous les meubles hauts est indispensable pour travailler confortablement. Les réglettes LED s'installent facilement lors de la pose des meubles.

Pour recevoir des devis détaillés de cuisinistes et artisans près de chez vous, utilisez notre [service de devis gratuit](/devis). Comparez au minimum 3 propositions avant de vous engager.`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **CAPEB** — enquête annuelle sur les tarifs artisanaux (2025)
- **Travaux.com / Habitatpresto** — baromètre prix rénovation cuisine 2026 : 350-1 000 €/m²
- **Fabricants** (Schmidt, SoCoo'c, IKEA) — catalogues tarifs 2025-2026
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3, grandes métropoles × 1.15). Dernière mise à jour : avril 2026.`,

      `## FAQ — Prix rénovation cuisine 2026`,
    ],
    faq: [
      {
        question: "Quel est le prix moyen d'une rénovation de cuisine ?",
        answer:
          "En 2026, le prix moyen d'une rénovation complète de cuisine (meubles + électroménager + pose + travaux techniques) se situe entre 8 000 et 20 000 € pour un projet standard en milieu de gamme. Une cuisine haut de gamme avec îlot peut dépasser 30 000 €.",
      },
      {
        question: 'Cuisiniste ou artisans séparés : que choisir ?',
        answer:
          "Le cuisiniste propose un forfait tout compris (conception, fourniture, pose) avec un seul interlocuteur. Les artisans séparés permettent souvent d'économiser 10 à 20 % mais nécessitent de coordonner vous-même plombier, électricien et poseur. Pour un premier projet, le cuisiniste est plus sécurisant.",
      },
      {
        question: 'Combien de temps pour rénover une cuisine ?',
        answer:
          'De la commande à la fin de pose, comptez 6 à 10 semaines : 3-6 semaines de fabrication des meubles, 1-2 semaines de travaux préparatoires (plomberie, électricité, sol) et 1-2 semaines de pose. Un simple remplacement sans travaux techniques prend 2-3 semaines.',
      },
      {
        question: 'Quel plan de travail choisir pour sa cuisine ?',
        answer:
          'Le quartz offre le meilleur rapport qualité-prix-durabilité (200-450 €/ml). Le granit est la référence haut de gamme (250-500 €/ml). Le stratifié HPL est le plus économique (50-150 €/ml) mais dure moins longtemps. Le bois est esthétique mais demande un entretien régulier.',
      },
      {
        question: 'Peut-on rénover sa cuisine pour moins de 5 000 € ?',
        answer:
          'Oui, avec un rafraîchissement : peinture des façades de meubles existants (ou adhésif décoratif), remplacement des poignées, nouveau plan de travail stratifié, peinture des murs et changement de la crédence. Budget : 2 000 à 5 000 € sans modification de la disposition.',
      },
      {
        question: 'Quelles aides pour rénover sa cuisine ?',
        answer:
          "La rénovation de cuisine ne bénéficie pas d'aides spécifiques (MaPrimeRénov' est réservée à l'énergie). La TVA à 10 % s'applique sur la main-d'œuvre et les matériaux si le logement a plus de 2 ans. L'Éco-PTZ peut financer le remplacement d'équipements énergivores (chauffe-eau, éclairage).",
      },
      {
        question: 'IKEA ou cuisiniste indépendant ?',
        answer:
          'IKEA propose des cuisines complètes dès 2 000 € (hors pose) avec un bon rapport qualité-prix en entrée/milieu de gamme. Un cuisiniste indépendant offre du sur-mesure, des matériaux premium et un suivi personnalisé mais à un prix 30 à 50 % supérieur. Le meilleur choix dépend de votre budget et de la complexité du projet.',
      },
      {
        question: 'Comment financer sa rénovation de cuisine ?',
        answer:
          "Les options principales sont : le prêt travaux (taux 3-5 % en 2026, durée 3 à 10 ans), le crédit affecté proposé par le cuisiniste (souvent à taux promotionnel), et l'Éco-PTZ si les travaux incluent une amélioration énergétique. Comparez toujours le TAEG (Taux Annuel Effectif Global).",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 4. ISOLATION MAISON — GUIDE COMPLET 2026 (~3 500 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'isolation-maison-guide-ultime-2026': {
    title: 'Isolation Maison 2026 : Guide complet (Prix, Techniques, ROI, Aides)',
    excerpt:
      "Prix par technique (ITE, ITI, combles, sol), ROI par type d'isolation avec calculs de rentabilité, aides cumulables avec simulation chiffrée et cas concret : maison F à D en 18 mois.",
    metaTitle: 'Isolation Maison 2026 : Prix, ROI et Aides',
    metaDescription:
      'Guide isolation maison 2026 : prix ITE 120-200 €/m², ITI 40-80 €/m², combles 20-60 €/m². ROI, aides cumulables, cas concret F→D.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-10',
    updatedDate: '2026-04-29',
    readTime: '18 min',
    category: 'Énergie',
    tags: ['isolation', 'ITE', 'ITI', 'combles', 'aides', 'MaPrimeRénov', 'DPE', '2026'],
    keyTakeaways: [
      'Combles perdus : 20-40 €/m² — ROI en 3-5 ans, priorité n°1',
      "Murs par l'intérieur (ITI) : 40-90 €/m² — ROI en 8-12 ans",
      "Murs par l'extérieur (ITE) : 120-220 €/m² — ROI en 12-18 ans mais performance supérieure",
      'Plancher bas : 25-60 €/m² — ROI en 5-8 ans, souvent oublié',
      "Aides cumulées : MaPrimeRénov' + CEE + TVA 5,5 % couvrent 40-75 % du budget",
      "Prioriser l'isolation AVANT le changement de chauffage pour un dimensionnement correct",
    ],
    content: [
      `## Pourquoi l'isolation est la priorité n°1 de la rénovation énergétique

L'isolation représente le meilleur retour sur investissement de tous les travaux de rénovation énergétique. La raison est simple : dans une maison mal isolée, les pertes de chaleur se répartissent ainsi : **toiture 25-30 %**, **murs 20-25 %**, **fenêtres 10-15 %**, **plancher bas 7-10 %**, **ventilation et ponts thermiques 20-25 %**. Isoler correctement ces parois permet de réduire la facture de chauffage de **40 à 70 %** et d'améliorer le DPE de 1 à 3 classes.

En 2026, l'isolation est d'autant plus stratégique que le calendrier réglementaire se durcit : les logements classés G ne peuvent plus être loués depuis 2025, les F seront interdits à la location en 2028 et les E en 2034. Pour les propriétaires bailleurs, l'isolation n'est plus un choix mais une obligation. Trouvez un [spécialiste en isolation thermique](/services/isolation-thermique) certifié RGE près de chez vous.`,

      `## Prix par technique d'isolation

### Isolation des combles perdus

La technique la plus simple et la plus rentable. L'isolant (laine de verre, laine de roche, ouate de cellulose) est soufflé ou déroulé sur le plancher des combles.

:::budget
| Isolant | Épaisseur requise (R=7) | Prix posé au m² |
| Laine de verre soufflée | 30-35 cm | 20 – 30 € |
| Laine de roche soufflée | 30-35 cm | 25 – 35 € |
| Ouate de cellulose soufflée | 30-35 cm | 25 – 40 € |
| Laine de verre en rouleaux | 28-32 cm (2 couches croisées) | 20 – 35 € |
:::

Pour une maison de 100 m² au sol : **2 000 à 4 000 €** tout compris (source : ADEME, guide « Isoler sa maison » 2025 — moyenne constatée ~40 € HT/m²). Économie de chauffage : **200 à 500 €/an**. ROI : **3 à 5 ans**.

### Isolation des combles aménagés (rampants)

Sous la toiture, entre ou sous les chevrons. Plus complexe car il faut gérer l'épaisseur disponible et la ventilation de la couverture.

:::budget
| Technique | Épaisseur | Prix posé au m² |
| Laine de verre entre chevrons + parement | 22-30 cm | 40 – 70 € |
| Panneaux rigides (polyuréthane) sous chevrons | 12-16 cm | 50 – 90 € |
| Sarking (isolation par l'extérieur de la toiture) | 14-20 cm | 100 – 200 € |
:::

### Isolation des murs par l'intérieur (ITI)

L'ITI est la technique la plus courante : on fixe un doublage isolant (complexe collé, ossature + isolant, ou contre-cloison) sur les murs existants.

:::budget
| Technique ITI | Épaisseur | Prix posé au m² | Performance |
| Complexe collé (PSE + plaque plâtre) | 10-12 cm | 35 – 55 € | R = 2,5 à 3,5 |
| Ossature métallique + laine de verre | 12-16 cm | 45 – 70 € | R = 3,0 à 4,5 |
| Ossature + fibre de bois | 14-18 cm | 55 – 90 € | R = 3,5 à 5,0 |
| Panneaux polyuréthane collés | 8-10 cm | 50 – 80 € | R = 3,5 à 4,5 |
:::

Pour une maison de 100 m² (environ 80 m² de murs à isoler) : **3 200 à 7 200 €**. Économie de chauffage : **300 à 600 €/an**. ROI : **8 à 12 ans** (5-7 ans après aides).

:::warning Ponts thermiques
L'ITI ne traite pas les ponts thermiques aux jonctions murs/planchers et murs/refends. Ces ponts thermiques peuvent représenter 5 à 10 % des déperditions totales. Un bureau d'études thermiques peut recommander des solutions complémentaires (rupteurs de pont thermique, retours d'isolation).
:::

### Isolation des murs par l'extérieur (ITE)

L'ITE enveloppe le bâtiment d'un manteau isolant continu, supprimant la quasi-totalité des ponts thermiques. C'est la technique la plus performante mais aussi la plus coûteuse.

:::budget
| Technique ITE | Épaisseur | Prix posé au m² | Finition |
| PSE + enduit (le plus courant) | 12-18 cm | 120 – 180 € | Crépi taloché ou gratté |
| Laine de roche + enduit | 14-20 cm | 140 – 200 € | Crépi minéral |
| Fibre de bois + enduit | 14-20 cm | 150 – 220 € | Crépi ou bardage |
| Bardage ventilé (bois, composite) | 14-18 cm isolant | 160 – 250 € | Bardage rapporté |
:::

Pour une maison de 100 m² (environ 120 m² de façades) : **14 400 à 26 400 €**. Économie de chauffage : **400 à 800 €/an**. ROI : **12 à 18 ans** (7-10 ans après aides).

:::tip Avantage caché de l'ITE
L'ITE permet de ravaler la façade dans la même opération. Si votre façade nécessite un ravalement (obligation tous les 10 ans dans certaines communes), le surcoût de l'ITE par rapport au simple ravalement est de seulement 60-100 €/m² au lieu de 120-220 €/m². Profitez-en pour coupler les deux.
:::

### Isolation du plancher bas

Souvent oubliée, l'isolation du plancher bas (au-dessus d'un vide sanitaire ou d'un garage) représente pourtant 7-10 % des déperditions.

:::budget
| Technique | Prix posé au m² | Application |
| Flocage sous plancher (laine minérale) | 25 – 45 € | Vide sanitaire accessible |
| Panneaux rigides collés sous dalle | 30 – 55 € | Garage, cave accessible |
| Isolation sur plancher (chape isolante) | 40 – 70 € | Terre-plein (accès par-dessus uniquement) |
:::`,

      `## Calcul du ROI par type d'isolation

Le retour sur investissement (ROI) dépend du coût des travaux, des économies annuelles et des aides obtenues. Voici un calcul détaillé pour une maison type de 100 m², DPE E, chauffage gaz :

:::budget
| Poste | Coût brut | Aides estimées (profil Jaune) | Reste à charge | Économie/an | ROI |
| Combles perdus (100 m²) | 3 000 € | 1 800 € (MPR 1 200 + CEE 600) | 1 200 € | 400 € | 3 ans |
| Murs ITI (80 m²) | 5 600 € | 2 800 € (MPR 1 800 + CEE 1 000) | 2 800 € | 450 € | 6 ans |
| Murs ITE (120 m²) | 21 600 € | 9 000 € (MPR 6 000 + CEE 3 000) | 12 600 € | 600 € | 21 ans |
| Plancher bas (100 m²) | 3 500 € | 1 500 € (MPR 900 + CEE 600) | 2 000 € | 200 € | 10 ans |
| Fenêtres DV → TV (8 fenêtres) | 8 000 € | 3 200 € (MPR 800 + CEE 2 400) | 4 800 € | 250 € | 19 ans |
:::

:::expert Parole d'expert — Thomas Roux, ingénieur thermicien
"L'ordre d'efficacité est toujours le même : combles d'abord, puis murs, puis plancher bas, puis fenêtres. Les combles offrent le meilleur ROI parce que l'air chaud monte et que c'est la paroi la plus facile à isoler. Les fenêtres arrivent en dernier car le surcoût du triple vitrage par rapport au double est rarement justifié en dehors des zones très froides."
:::`,

      `## Aides cumulables avec simulation chiffrée

### Tableau des aides 2026 pour l'isolation

:::budget
| Aide | Isolation combles | Isolation murs (ITI ou ITE) | Plancher bas | Fenêtres (par fenêtre) |
| MaPrimeRénov' Bleu | 25 €/m² | 75 €/m² (ITE) / 25 €/m² (ITI) | 20 €/m² | 100 € |
| MaPrimeRénov' Jaune | 20 €/m² | 60 €/m² (ITE) / 20 €/m² (ITI) | 15 €/m² | 80 € |
| MaPrimeRénov' Violet | 15 €/m² | 40 €/m² (ITE) / 15 €/m² (ITI) | 10 €/m² | 40 € |
| MaPrimeRénov' Rose | 0 € | 15 €/m² (ITE uniquement) | 0 € | 0 € |
| CEE (prime énergie) | 5-10 €/m² | 8-25 €/m² | 5-10 €/m² | 50-100 €/fenêtre |
| TVA 5,5 % | Oui | Oui | Oui | Oui |
:::

### Simulation complète : rénovation globale d'une maison 120 m²

Maison individuelle de 1975, DPE F, chauffage gaz, propriétaire occupant revenus modestes (profil Jaune) :

:::budget
| Travaux | Coût TTC | MPR' | CEE | TVA 5,5 % (éco.) | Reste à charge |
| Combles perdus (120 m²) | 3 600 € | 2 400 € | 900 € | 520 € | — 220 € ✅ |
| ITE façades (140 m²) | 25 200 € | 8 400 € | 3 500 € | 3 640 € | 9 660 € |
| Plancher bas (120 m²) | 4 800 € | 1 800 € | 900 € | 690 € | 1 410 € |
| Fenêtres ×10 | 8 000 € | 800 € | 800 € | 1 160 € | 5 240 € |
| **TOTAL** | **41 600 €** | **13 400 €** | **6 100 €** | **6 010 €** | **16 090 €** |
:::

Avec l'Éco-PTZ de 16 090 € sur 15 ans à taux zéro, la mensualité est de **89 €/mois**, compensée par l'économie de chauffage de **120 à 180 €/mois**. Le propriétaire est gagnant **dès le premier mois**.

:::tip Parcours Accompagné
Si le gain DPE est d'au moins 2 classes (ici F → D), le Parcours Accompagné MaPrimeRénov' offre des aides encore plus élevées : jusqu'à 45 % du coût total pour un profil Jaune (plafonné à 40 000 € de travaux). Le reste à charge tomberait à ~10 000 €.
:::`,

      `## Cas concret : maison F à D en 18 mois

Voici le déroulé réel d'un projet de rénovation énergétique que nous avons accompagné :

**La maison** : pavillon de 1972, 130 m², murs en parpaing non isolés, combles perdus avec 5 cm de laine de verre tassée, simple vitrage bois, chaudière fioul de 1998. DPE F (380 kWh/m²/an). Facture énergie : 3 200 €/an.

**Phase 1 (mois 1-3) : Isolation combles + plancher bas**
- Soufflage ouate de cellulose 35 cm dans les combles : 3 800 €
- Panneaux sous plancher garage : 2 400 €
- Gain immédiat : passage de 380 à 310 kWh/m²/an (DPE E)

**Phase 2 (mois 4-9) : ITE façades**
- PSE 16 cm + enduit sur les 4 façades : 28 000 €
- Traitement des ponts thermiques (tableaux de fenêtres, soubassement) : inclus
- Gain : passage de 310 à 210 kWh/m²/an (DPE D)

**Phase 3 (mois 10-14) : Fenêtres + ventilation**
- Remplacement de 12 fenêtres simple vitrage par du double vitrage argon : 9 600 €
- Installation VMC double flux : 4 500 €
- Gain : passage de 210 à 165 kWh/m²/an (DPE D confirmé, proche C)

**Phase 4 (mois 15-18) : Chauffage**
- Remplacement chaudière fioul par PAC air-eau 11 kW : 14 000 €
- Désembouage du réseau de radiateurs existants : 800 €
- Gain : passage de 165 à 95 kWh/m²/an (DPE B)

**Bilan financier** :
- Coût total : 63 100 €
- Aides obtenues : 31 200 € (MPR Parcours Accompagné + CEE + TVA 5,5 %)
- Reste à charge : 31 900 € financé par Éco-PTZ
- Facture énergie après travaux : 950 €/an (vs 3 200 €)
- Économie annuelle : 2 250 €
- ROI sur reste à charge : **14 ans** (valorisation du bien en sus : +15 à 20 %)

:::warning Ordre des travaux impératif
Isolez TOUJOURS avant de changer le chauffage. Si ce propriétaire avait installé la PAC en premier (sur la base de 380 kWh/m²/an), elle aurait été dimensionnée à 16 kW au lieu de 11 kW — soit un surcoût de 3 000 à 5 000 € et un COP dégradé par le surdimensionnement.
:::`,

      `## Comment choisir le bon isolant ?

Le choix de l'isolant dépend de la paroi à traiter, du budget et des performances recherchées :

**Laine de verre** : le plus utilisé en France (rapport qualité-prix imbattable). Convient pour combles, murs, rampants. Classement au feu A1 (incombustible). Durée de vie : 30+ ans si bien posé.

**Laine de roche** : similaire à la laine de verre avec une meilleure tenue au feu et une densité supérieure (meilleur confort d'été). Prix légèrement supérieur (+10-15 %).

**Ouate de cellulose** : isolant biosourcé issu du recyclage de papier. Excellent rapport performance/prix en soufflage. Bon déphasage thermique (confort d'été). Traitement au sel de bore (ignifuge).

**Fibre de bois** : isolant biosourcé premium. Excellent déphasage thermique (le meilleur du marché). Idéal en ITE ou sous rampants. Prix supérieur mais performances durables.

**Polyuréthane (PU)** : la meilleure performance thermique à épaisseur égale (lambda 0,022). Idéal quand l'espace est limité (ITI en appartement, toiture-terrasse). Non biosourcé, inflammable sans protection.

**Polystyrène expansé (PSE)** : le plus utilisé en ITE pour son rapport coût/performance. Léger, facile à poser, bon marché. Durée de vie excellente sous enduit. Non recyclable.

Pour trouver un artisan [RGE spécialisé en isolation](/services/isolation-thermique) dans votre département, utilisez notre annuaire. La certification RGE est obligatoire pour bénéficier des aides MaPrimeRénov' et CEE.`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **ADEME** — guide « Isoler sa maison » (2025) : combles perdus ~40 € HT/m² en moyenne
- **ANAH / MaPrimeRénov'** — barèmes officiels 2026 (revalorisés +2,4 %)
- **Quelleenergie.fr / Hellio** — baromètre prix isolation combles 2026 : 20-70 €/m² (perdus), 50-250 €/m² (aménagés)
- **CEE** — primes isolation jusqu'à 13 €/m² selon zone géographique
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3). Dernière mise à jour : avril 2026.`,

      `## FAQ — Isolation maison 2026`,
    ],
    faq: [
      {
        question: "Quelle est l'isolation la plus rentable ?",
        answer:
          "L'isolation des combles perdus est la plus rentable : 20-40 €/m² posé avec un retour sur investissement en 3-5 ans. C'est le premier geste à réaliser dans toute rénovation énergétique.",
      },
      {
        question: 'ITE ou ITI : que choisir ?',
        answer:
          "L'ITE est plus performante (suppression des ponts thermiques, pas de perte de surface habitable) mais 2 à 3 fois plus chère. L'ITI est préférable en copropriété, en zone classée ou quand le budget est limité. L'ITE est idéale si la façade nécessite aussi un ravalement.",
      },
      {
        question: "Combien coûte l'isolation complète d'une maison ?",
        answer:
          "Pour une maison de 100 m² : combles (3 000 €) + murs ITI (5 500 €) + plancher bas (3 500 €) + fenêtres (8 000 €) = environ 20 000 € brut. Après aides (profil Jaune) : reste à charge d'environ 8 000 à 12 000 €.",
      },
      {
        question: "L'isolation est-elle obligatoire en 2026 ?",
        answer:
          "L'isolation n'est pas obligatoire pour les propriétaires occupants. En revanche, les logements classés G au DPE ne peuvent plus être loués depuis 2025, et les F seront interdits en 2028. De plus, en cas de ravalement de façade, l'isolation est obligatoire si techniquement possible (loi Énergie-Climat).",
      },
      {
        question: 'Quel est le gain DPE après isolation ?',
        answer:
          "L'isolation complète (combles + murs + plancher) permet typiquement un gain de 1 à 3 classes DPE. Exemple : une maison classée F (350 kWh/m²/an) peut descendre à D (200 kWh/m²/an) voire C (150 kWh/m²/an) avec isolation + VMC.",
      },
      {
        question: 'Peut-on isoler soi-même ses combles ?',
        answer:
          "Oui, la pose de rouleaux de laine de verre dans des combles perdus accessibles est réalisable en auto-construction. Attention : vous perdez le bénéfice des aides (MaPrimeRénov' et CEE exigent un artisan RGE). Économie de main-d'œuvre : 5-10 €/m², soit 500-1 000 € pour 100 m².",
      },
      {
        question: 'Isolation et ventilation : faut-il les coupler ?',
        answer:
          "Oui, absolument. Isoler sans ventiler crée des problèmes d'humidité et de qualité de l'air. Une VMC simple flux hygroréglable B suffit dans la plupart des cas (1 500-3 000 € posée). La VMC double flux (3 000-6 000 €) est recommandée pour les rénovations performantes (BBC rénovation).",
      },
      {
        question: 'Quelles sont les aides pour isoler sa maison en 2026 ?',
        answer:
          "MaPrimeRénov' (15-75 €/m² selon les travaux et le profil), les CEE (5-25 €/m²), la TVA à 5,5 %, l'Éco-PTZ (jusqu'à 50 000 € à taux zéro) et les aides locales. Toutes sont cumulables. Un ménage modeste peut couvrir 60 à 75 % du budget isolation.",
      },
      {
        question: "Combien de temps durent des travaux d'isolation ?",
        answer:
          "Combles perdus : 1 jour. Combles aménagés : 3-5 jours. ITI d'une maison : 1-2 semaines. ITE : 3-6 semaines. Fenêtres (10 unités) : 2-3 jours. L'ITE est la plus longue car elle nécessite un échafaudage et plusieurs passes d'enduit.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 5. POMPE À CHALEUR — GUIDE ACHAT 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'pompe-a-chaleur-guide-achat-2026': {
    title: "Pompe à Chaleur : Guide d'Achat Complet 2026 (Comparatif, Prix, Marques)",
    excerpt:
      'Comparatif PAC air-eau vs air-air vs géothermique, prix par marque (Daikin, Atlantic, Mitsubishi), COP et économies réelles par climat, entretien annuel et durée de vie.',
    metaTitle: 'PAC 2026 : Guide Achat Comparatif Marques',
    metaDescription:
      'Guide achat pompe à chaleur 2026 : comparatif air-eau/air-air/géothermique, prix Daikin, Atlantic, Mitsubishi. COP réel par climat.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-13',
    updatedDate: '2026-04-29',
    readTime: '16 min',
    category: 'Énergie',
    tags: ['pompe à chaleur', 'PAC', 'Daikin', 'Atlantic', 'Mitsubishi', 'chauffage', '2026'],
    keyTakeaways: [
      'PAC air-eau : le choix n°1 pour les maisons individuelles avec chauffage central',
      'PAC air-air : solution économique pour les appartements et le rafraîchissement',
      "Daikin Altherma 3 : référence milieu/haut de gamme, SCOP jusqu'à 5,1",
      'Atlantic Alfea Extensa : meilleur rapport qualité-prix français',
      'COP réel : 3,0-3,5 en zone H1 (Nord), 3,5-4,5 en zone H3 (Sud)',
      'Budget moyen après aides : 3 000-8 000 € pour une PAC air-eau de 10-12 kW',
    ],
    content: [
      `## Comment choisir sa pompe à chaleur en 2026 ?

Avec plus de 700 000 PAC vendues en France en 2025, le marché regorge de modèles et les prix varient du simple au triple. Comment s'y retrouver ? Ce guide d'achat compare les technologies, les marques et les prix pour vous aider à faire le bon choix selon votre logement et votre climat.

La première question à se poser n'est pas "quelle marque ?" mais **"quel type de PAC pour mon logement ?"**. Le type de PAC conditionne les performances, le budget et les aides disponibles. Trouvez un [installateur PAC certifié RGE](/services/pompe-a-chaleur) pour un dimensionnement personnalisé.`,

      `## Comparatif air-eau vs air-air vs géothermique

### Vue d'ensemble

:::budget
| Critère | PAC air-air | PAC air-eau | PAC géothermique |
| Prix installé (hors aides) | 3 000 – 10 000 € | 8 000 – 18 000 € | 15 000 – 30 000 € |
| Chauffage | ✅ Via splits (air soufflé) | ✅ Via radiateurs/plancher | ✅ Via radiateurs/plancher |
| Eau chaude sanitaire | ❌ Non | ✅ Oui (ballon tampon) | ✅ Oui |
| Rafraîchissement | ✅ Oui (réversible) | ⚠️ Optionnel (active cooling) | ⚠️ Optionnel (geocooling) |
| MaPrimeRénov' | ❌ Non éligible | ✅ Jusqu'à 5 000 € | ✅ Jusqu'à 10 000 € |
| COP moyen annuel (SCOP) | 3,0 – 3,5 | 3,5 – 4,5 | 4,0 – 5,5 |
| Durée de vie | 12 – 15 ans | 15 – 20 ans | 20 – 25 ans |
| Bruit extérieur | 45 – 55 dB | 40 – 50 dB | Silencieux (pas d'unité ext.) |
:::

### Quand choisir une PAC air-air ?

La PAC air-air est idéale si vous êtes en **appartement**, si vous n'avez pas de réseau de chauffage central (radiateurs à eau) ou si vous recherchez principalement la **climatisation réversible**. Elle n'est pas éligible à MaPrimeRénov', ce qui limite son intérêt financier pour la rénovation énergétique.

### Quand choisir une PAC air-eau ?

C'est le choix **par défaut pour les maisons individuelles** avec un réseau de chauffage central existant (radiateurs ou plancher chauffant). Elle remplace la chaudière fioul ou gaz, assure le chauffage ET l'eau chaude sanitaire, et bénéficie des aides les plus généreuses.

### Quand choisir une PAC géothermique ?

La géothermie est le choix premium pour les **grandes maisons en climat froid** (zones H1a et H1b). Son COP stable toute l'année la rend particulièrement rentable dans les régions où les hivers sont rigoureux (Alsace, Lorraine, Franche-Comté, montagne). Elle nécessite un terrain suffisant pour les capteurs horizontaux ou un budget forage pour les sondes verticales.

:::tip Conseil d'expert
Ne vous laissez pas séduire par la PAC air-air "pas chère" si votre objectif est la rénovation énergétique. Sans éligibilité aux aides et sans production d'eau chaude, son coût global sur 15 ans est souvent supérieur à une PAC air-eau après déduction des aides.
:::`,

      `## Prix par marque : le grand comparatif

### Segment entrée de gamme (7 000 – 12 000 € installé)

:::budget
| Marque/Modèle | Puissance | SCOP | Prix installé | Points forts |
| Atlantic Alfea Extensa AI | 6-10 kW | 4,0 – 4,3 | 7 000 – 11 000 € | Fabrication française, SAV réactif |
| Panasonic Aquarea T-CAP | 5-9 kW | 3,8 – 4,2 | 7 500 – 11 000 € | Fonctionne jusqu'à -20°C |
| Samsung EHS Mono | 5-9 kW | 3,8 – 4,1 | 7 000 – 10 500 € | Connectée, design compact |
:::

### Segment milieu de gamme (10 000 – 16 000 € installé)

:::budget
| Marque/Modèle | Puissance | SCOP | Prix installé | Points forts |
| Daikin Altherma 3 R | 6-14 kW | 4,3 – 5,1 | 10 000 – 15 000 € | Réfrigérant R32, haute performance |
| Atlantic Alfea Excellia AI | 8-14 kW | 4,2 – 4,7 | 10 000 – 14 000 € | Haut de gamme français, silencieuse |
| Mitsubishi Ecodan Zubadan | 8-14 kW | 4,0 – 4,5 | 11 000 – 16 000 € | Référence climat froid (-25°C) |
| Viessmann Vitocal 250-A | 6-13 kW | 4,3 – 4,8 | 10 500 – 15 000 € | Qualité allemande, connectée |
:::

### Segment haut de gamme (14 000 – 22 000 € installé)

:::budget
| Marque/Modèle | Puissance | SCOP | Prix installé | Points forts |
| Daikin Altherma 3 H HT | 10-18 kW | 4,5 – 5,1 | 14 000 – 20 000 € | Haute température (65°C), remplacement direct chaudière |
| Mitsubishi Ecodan Hyper Heating | 10-16 kW | 4,2 – 4,8 | 15 000 – 22 000 € | -28°C garanti, split ou monobloc |
| Bosch Compress 7000i AW | 7-17 kW | 4,3 – 5,0 | 13 000 – 19 000 € | Green Refrigerant R290, silencieuse |
| Nibe F2120 | 8-20 kW | 4,5 – 5,2 | 14 000 – 22 000 € | Réfrigérant R290, garantie 7 ans |
:::

:::warning Méfiez-vous des "marques" inconnues
Certains installateurs proposent des PAC de marques obscures (assemblées en Chine sous marque blanche) à prix cassés. Ces appareils n'offrent aucune garantie pièces fiable, le SAV est inexistant et la durée de vie est souvent inférieure à 8 ans. Privilégiez les marques établies avec un réseau SAV en France.
:::`,

      `## COP et économies réelles par zone climatique

Le COP (Coefficient de Performance) affiché par le fabricant est mesuré en conditions normalisées (7°C extérieur, 35°C eau de départ). En conditions réelles, le COP varie selon le **climat**, la **température de départ** de votre circuit de chauffage et la **qualité de l'installation**.

### COP réel par zone climatique

:::budget
| Zone climatique | Température hiver moyenne | SCOP air-eau typique | Économie vs gaz | Économie vs fioul |
| H1a (Nord, Alsace, Lorraine) | 0 à 3°C | 3,0 – 3,5 | 40 – 50 % | 55 – 65 % |
| H1b (Île-de-France, Centre) | 2 à 5°C | 3,2 – 3,8 | 45 – 55 % | 60 – 70 % |
| H1c (Rhône-Alpes, Auvergne) | 1 à 4°C | 3,0 – 3,7 | 40 – 55 % | 55 – 65 % |
| H2a (Bretagne) | 4 à 7°C | 3,5 – 4,2 | 50 – 60 % | 65 – 75 % |
| H2b (Atlantique) | 4 à 7°C | 3,5 – 4,2 | 50 – 60 % | 65 – 75 % |
| H2c (Massif Central) | 1 à 5°C | 3,0 – 3,8 | 40 – 55 % | 55 – 65 % |
| H2d (Méditerranée intérieur) | 3 à 6°C | 3,5 – 4,2 | 50 – 60 % | 65 – 75 % |
| H3 (Côte d'Azur, Languedoc) | 5 à 10°C | 4,0 – 5,0 | 55 – 70 % | 70 – 80 % |
:::

### Simulation d'économie annuelle (maison 120 m², DPE D)

:::budget
| Chauffage actuel | Facture actuelle | Facture PAC air-eau | Économie annuelle |
| Chaudière fioul | 2 800 € | 850 € | 1 950 € |
| Chaudière gaz condensation | 1 800 € | 750 € | 1 050 € |
| Convecteurs électriques | 2 400 € | 700 € | 1 700 € |
| Chaudière gaz ancienne (non condensation) | 2 200 € | 750 € | 1 450 € |
:::

:::expert Parole d'expert — Laurent Bernier, installateur RGE depuis 15 ans
"Le COP n'est pas tout. Une PAC bien dimensionnée avec un COP de 3,5 sera toujours plus économique qu'une PAC surdimensionnée avec un COP de 4,5. Le cyclage (arrêts/redémarrages fréquents) d'une PAC trop puissante dégrade considérablement les performances réelles. Exigez un calcul de déperditions avant tout devis."
:::`,

      `## Entretien annuel et durée de vie

### L'entretien obligatoire

Depuis le décret du 7 décembre 2010, l'entretien annuel d'une PAC est obligatoire pour les appareils de puissance thermique > 4 kW (soit la quasi-totalité des PAC air-eau). Le non-respect peut entraîner l'annulation de la garantie constructeur.

**Ce que comprend l'entretien annuel :**
- Vérification de l'étanchéité du circuit frigorifique
- Contrôle des pressions de fonctionnement (HP/BP)
- Nettoyage de l'échangeur extérieur (feuilles, poussière)
- Vérification de la régulation et des sondes de température
- Contrôle du niveau et de la qualité du fluide caloporteur
- Test des sécurités (pressostat, débit d'eau)
- Relevé du COP instantané et comparaison avec les valeurs de référence

**Coût de l'entretien annuel :**

:::budget
| Formule | Contenu | Prix annuel |
| Visite simple | Entretien annuel seul | 150 – 200 € |
| Contrat standard | Entretien + dépannage prioritaire | 200 – 300 € |
| Contrat tout inclus | Entretien + dépannage + pièces | 300 – 450 € |
:::

### Durée de vie et pannes courantes

La durée de vie moyenne d'une PAC air-eau est de **15 à 20 ans** avec un entretien régulier. Les pannes les plus courantes :

- **Compresseur** (pièce la plus coûteuse) : 2 000-4 000 € de remplacement, survient généralement après 10-15 ans
- **Carte électronique** : 300-800 €, souvent due à des surtensions
- **Sonde de température** : 100-300 €, usure normale
- **Détendeur** : 200-500 €, après 8-12 ans
- **Ventilateur unité extérieure** : 200-400 €, si exposition au gel/sel

:::tip Prolonger la durée de vie
Trois gestes simples : (1) nettoyer l'unité extérieure 2 fois par an (jet d'eau douce), (2) maintenir un dégagement de 30 cm autour de l'unité et (3) programmer un mode nuit à température réduite plutôt que d'éteindre la PAC (les cycles arrêt/démarrage usent le compresseur).
:::

### Garanties constructeur

:::budget
| Marque | Garantie compresseur | Garantie pièces | Extension possible |
| Daikin | 5 ans | 3 ans | 10 ans (payant) |
| Atlantic | 5 ans | 2 ans | 7 ans (payant) |
| Mitsubishi | 5 ans | 3 ans | 8 ans (payant) |
| Viessmann | 5 ans | 2 ans | 10 ans (payant) |
| Bosch | 5 ans | 2 ans | 10 ans (payant) |
| Nibe | 7 ans | 5 ans | — |
:::

:::warning Condition de garantie
Toutes les garanties constructeur sont conditionnées à l'entretien annuel par un technicien certifié. Conservez précieusement les attestations d'entretien. Un seul entretien manqué peut annuler la garantie sur le compresseur.
:::

Pour trouver un installateur PAC certifié RGE et comparer les devis, utilisez notre [service de mise en relation gratuit](/devis/chauffagiste). Vous recevez 3 devis sous 48h.`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **ADEME** — guide « Se chauffer mieux et moins cher » (2025) : PAC air-eau 65-90 €/m² chauffé
- **AFPAC** (Association Française pour les Pompes à Chaleur) — statistiques de marché 2025
- **ANAH / MaPrimeRénov'** — barèmes officiels 2026 : aide PAC air-eau jusqu'à 5 000 €, géothermique jusqu'à 10 000 €
- **Hellowatt / Fournisseurs-electricite.com** — baromètre prix PAC 2026 : air-eau 8 000-16 000 € TTC posée
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3). Dernière mise à jour : avril 2026.`,

      `## FAQ — Pompe à chaleur guide d'achat 2026`,
    ],
    faq: [
      {
        question: 'Quelle est la meilleure marque de pompe à chaleur ?',
        answer:
          'Daikin et Mitsubishi sont les références mondiales en termes de fiabilité et de performance. Atlantic offre le meilleur rapport qualité-prix avec un SAV français réactif. Viessmann et Bosch sont des valeurs sûres allemandes. Le choix dépend de votre budget et de votre climat.',
      },
      {
        question: 'PAC air-eau ou chaudière gaz : que choisir en 2026 ?',
        answer:
          "La PAC air-eau est plus économique en fonctionnement (COP 3,5-4,5 vs 1,0 pour le gaz) et bénéficie d'aides généreuses. Le gaz reste pertinent en rénovation si les radiateurs sont haute température et que le budget est très serré. À moyen terme, la PAC est systématiquement gagnante.",
      },
      {
        question: 'Combien coûte une PAC air-eau après aides ?',
        answer:
          "Pour une PAC de 10-12 kW, le prix installé est de 10 000-15 000 €. Après MaPrimeRénov' (3 000-5 000 €), CEE (2 500-4 000 €) et TVA 5,5 % (~1 500 €), le reste à charge descend à 3 000-8 000 € selon le profil de revenus.",
      },
      {
        question: 'Une PAC est-elle rentable dans le Nord de la France ?',
        answer:
          "Oui, avec un SCOP de 3,0-3,5 en zone H1, une PAC air-eau reste 2 à 3 fois plus efficace qu'une résistance électrique. L'économie annuelle est de 1 000-2 000 € vs fioul. La Mitsubishi Zubadan ou la Daikin Altherma HT sont spécifiquement conçues pour le grand froid.",
      },
      {
        question: 'Peut-on garder ses vieux radiateurs avec une PAC ?',
        answer:
          "Oui, à condition qu'ils soient surdimensionnés (ce qui est souvent le cas dans les maisons anciennes). Si vos radiateurs chauffaient correctement avec une eau à 70°C, ils chaufferont avec une PAC à 50-55°C en étant peut-être un peu plus grands. Un test en abaissant la température de départ de votre chaudière actuelle permet de vérifier.",
      },
      {
        question: 'La PAC fait-elle du bruit ?',
        answer:
          "Les modèles récents émettent 40-50 dB(A) à 1 m (niveau d'une conversation). En mode nuit, certains modèles descendent à 35 dB(A). Installez l'unité extérieure à au moins 3 m des fenêtres de chambres et des limites de propriété pour éviter tout litige de voisinage.",
      },
      {
        question: 'Faut-il un entretien annuel pour sa PAC ?',
        answer:
          "Oui, c'est obligatoire pour les PAC > 4 kW (décret 2010). L'entretien annuel coûte 150-300 € et conditionne la validité de la garantie constructeur. Un contrat de maintenance (200-450 €/an) inclut le dépannage prioritaire et parfois les pièces détachées.",
      },
      {
        question: 'Quelle puissance de PAC pour ma maison ?',
        answer:
          "La puissance dépend de l'isolation : 40-60 W/m² pour une maison bien isolée (DPE A-C), 60-80 W/m² pour une isolation correcte (DPE D), 80-120 W/m² pour une maison mal isolée (DPE E-F). Pour 100 m² DPE D : environ 7-8 kW. Exigez un calcul de déperditions par l'installateur.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 6. TRAVAUX MAISON — PAR OÙ COMMENCER 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'travaux-maison-par-ou-commencer-guide-2026': {
    title: 'Travaux Maison : Par Où Commencer ? Le Guide Étape par Étape 2026',
    excerpt:
      'Ordre logique des travaux (gros œuvre → second œuvre → finitions), planning réaliste mois par mois, budget prévisionnel par phase et conseils pour gérer plusieurs artisans simultanément.',
    metaTitle: 'Travaux Maison : Par Où Commencer 2026',
    metaDescription:
      'Guide travaux maison 2026 : ordre logique gros œuvre → finitions, planning mois par mois, budget par phase. Coordonner artisans sans stress.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-16',
    updatedDate: '2026-04-29',
    readTime: '15 min',
    category: 'Guides',
    tags: ['travaux', 'maison', 'planning', 'artisans', 'gros œuvre', 'finitions', '2026'],
    keyTakeaways: [
      "Toujours commencer par le hors d'eau hors d'air (toiture, façade, fenêtres) avant le second œuvre",
      "L'ordre logique : structure → enveloppe → réseaux → cloisons → revêtements → finitions",
      'Prévoir 2-3 mois de préparation avant le premier coup de pioche',
      'Un planning réaliste = durée estimée × 1,3 (coefficient de marge)',
      'Désigner un "chef de file" parmi les artisans simplifie la coordination',
      'Le paiement par avancement (30/40/30) protège contre les abandons de chantier',
    ],
    content: [
      `## Pourquoi l'ordre des travaux est crucial

Commencer ses travaux dans le mauvais ordre est l'une des erreurs les plus coûteuses en rénovation. Poser un parquet neuf avant d'avoir terminé la plomberie de l'étage = dégâts des eaux garantis. Peindre avant de passer les gaines électriques = saignées dans les murs fraîchement peints. Installer la cuisine avant le carrelage = raccords disgracieux et surcoût de pose.

L'ordre des travaux suit une logique immuable : on travaille **du gros vers le fin, du haut vers le bas, de l'extérieur vers l'intérieur**. Ce guide vous donne la séquence exacte, avec les durées et budgets associés pour une maison type de 100 m².`,

      `## Phase 0 — Préparation (mois -3 à 0)

Avant de toucher un seul mur, la phase de préparation est indispensable. C'est elle qui détermine si votre chantier sera un succès ou un cauchemar.

**Mois -3 : Diagnostic et conception**
- Diagnostic de l'existant (amiante, plomb, structure, DPE) : 500-1 500 €
- Plans et conception : gratuit si vous les faites vous-même, 2 000-5 000 € avec un architecte
- Définition du programme de travaux et du budget

**Mois -2 : Devis et administratif**
- Demande de 3 à 5 devis par corps de métier
- Dépôt de déclaration préalable ou permis de construire : délai légal de 1 à 3 mois
- Montage des dossiers d'aides (MaPrimeRénov', CEE, Éco-PTZ)

**Mois -1 : Validation et commandes**
- Comparaison et signature des devis
- Commande des matériaux à long délai (fenêtres : 4-8 semaines, cuisine : 4-6 semaines)
- Planification des interventions artisans
- Souscription assurance dommages-ouvrage si gros travaux

:::budget
| Poste préparation | Budget |
| Diagnostics (amiante, plomb, termites, DPE) | 500 – 1 500 € |
| Architecte / maître d'œuvre (10 % du budget travaux) | Variable |
| Assurance dommages-ouvrage (3-5 % du budget travaux) | Variable |
| Frais de dossier aides (MAR obligatoire pour Parcours Accompagné) | 0 – 2 000 € |
:::

:::warning Ne signez JAMAIS les devis avant d'avoir l'accord MaPrimeRénov'
Depuis 2024, MaPrimeRénov' exige que le dossier soit déposé AVANT la signature des devis. Si vous signez d'abord, vous perdez le bénéfice de l'aide. Le délai d'instruction est de 2 à 6 semaines.
:::`,

      `## Phase 1 — Gros œuvre et structure (semaines 1-4)

Le gros œuvre concerne tout ce qui touche à la **structure** du bâtiment : fondations, murs porteurs, planchers, charpente.

**Semaine 1-2 : Démolitions et reprises**
- Installation de chantier (protections, benne à gravats, sanitaire de chantier)
- Démolition des cloisons à supprimer
- Ouverture ou fermeture de murs porteurs (IPN, linteau béton)
- Reprise de maçonnerie (fissures, joints, enduit)

**Semaine 3-4 : Structure**
- Reprises de plancher si nécessaire (renforcement, ragréage)
- Charpente : réparation ou remplacement des éléments défectueux
- Création de trémie d'escalier si nouveau niveau
- Traitement anti-termites si diagnostic positif

:::budget
| Poste gros œuvre | Budget pour 100 m² |
| Démolition + évacuation gravats | 1 500 – 4 000 € |
| Ouverture mur porteur (avec IPN) | 2 500 – 6 000 € |
| Reprises maçonnerie | 1 000 – 5 000 € |
| Reprise plancher / dalle | 2 000 – 8 000 € |
:::

:::tip Astuce chantier
Louez une benne à gravats dès le premier jour (200-400 €/semaine). Trier les gravats (inertes, bois, métaux) dès la dépose réduit le coût d'évacuation de 30 % et est désormais obligatoire (tri 7 flux depuis 2023).
:::`,

      `## Phase 2 — Hors d'eau, hors d'air (semaines 3-6)

Le "hors d'eau, hors d'air" désigne le moment où le bâtiment est protégé des intempéries : toiture étanche et menuiseries extérieures posées.

**Toiture et couverture**
- Réfection partielle ou totale de la couverture
- Remplacement des éléments de zinguerie (gouttières, chéneaux)
- [Isolation sous toiture](/blog/isolation-maison-guide-ultime-2026) si combles aménagés

**Menuiseries extérieures**
- Pose des fenêtres, portes-fenêtres et baies vitrées
- Pose de la porte d'entrée
- Volets roulants ou battants

**Façade et isolation extérieure**
- Ravalement de façade
- ITE (Isolation Thermique par l'Extérieur) si prévue
- Étanchéité des soubassements

:::budget
| Poste hors d'eau / hors d'air | Budget pour 100 m² |
| Toiture complète (tuiles terre cuite) | 8 000 – 20 000 € |
| Fenêtres ×8 (double vitrage) | 4 000 – 12 000 € |
| ITE façades (120 m²) | 14 000 – 26 000 € |
| Porte d'entrée | 800 – 3 000 € |
:::

:::warning Ordre impératif
Les fenêtres doivent être posées AVANT l'isolation intérieure et le placo. L'isolation intérieure doit venir en butée contre le dormant de la fenêtre pour supprimer le pont thermique. Si vous posez le placo d'abord, il faudra tout démonter.
:::`,

      `## Phase 3 — Second œuvre (semaines 5-10)

Le second œuvre regroupe tous les **réseaux techniques** et l'**aménagement intérieur** non structural.

**Semaine 5-6 : Réseaux en encastré**
- Électricité : passage des gaines, boîtiers, tableau électrique
- Plomberie : alimentation en eau (PER), évacuations (PVC)
- Chauffage : installation PAC/chaudière, passage des tuyaux, radiateurs
- VMC : passage des gaines, pose des bouches d'extraction

**Semaine 7-8 : Isolation et cloisons**
- Isolation intérieure des murs (ITI) si pas d'ITE
- Isolation du plancher bas
- Montage des cloisons en plaque de plâtre
- Pose des huisseries intérieures (bâtis de porte)

**Semaine 9-10 : Joints et préparation**
- Bandes et joints des plaques de plâtre
- Enduit de lissage
- Ragréage des sols avant revêtement

:::budget
| Poste second œuvre | Budget pour 100 m² |
| Électricité complète (mise aux normes NF C 15-100) | 8 000 – 15 000 € |
| Plomberie complète | 4 000 – 10 000 € |
| Chauffage (PAC air-eau + radiateurs) | 10 000 – 18 000 € |
| VMC double flux | 3 000 – 6 000 € |
| Isolation ITI + cloisons placo | 5 000 – 12 000 € |
:::

L'électricien et le plombier doivent intervenir **avant** le plaquiste : leurs gaines et tuyaux passent dans l'ossature des cloisons. Le plaquiste ferme ensuite les cloisons. Le [chauffagiste](/services/chauffagiste) intervient en parallèle du plombier pour le passage des tuyaux de chauffage.`,

      `## Phase 4 — Revêtements et finitions (semaines 10-14)

C'est la phase la plus visible et souvent la plus agréable pour le propriétaire : on voit enfin la maison prendre forme.

**Semaine 10-11 : Revêtements de sol**
- Carrelage (cuisine, salle de bain, entrée) : 40-120 €/m² posé
- Parquet (chambres, séjour) : 30-100 €/m² posé
- Sol souple (pièces secondaires) : 15-50 €/m² posé

**Semaine 11-12 : Revêtements muraux**
- Faïence salle de bain et cuisine : 40-100 €/m² posé
- Peinture (2-3 couches) : 15-40 €/m² posé
- Papier peint si prévu : 20-60 €/m² posé

**Semaine 12-13 : Équipements**
- Installation de la cuisine (meubles, plan de travail, électroménager)
- Pose des sanitaires (WC, lavabos, douche/baignoire)
- Pose des interrupteurs, prises et luminaires
- Pose des plinthes et chambranles de portes

**Semaine 14 : Finitions**
- Retouches peinture
- Joints silicone (sanitaires, cuisine)
- Nettoyage de fin de chantier
- Réception des travaux (PV contradictoire avec les artisans)

:::tip Règle d'or des finitions
Attendez **au minimum 3 semaines** après la pose du carrelage avant de peindre (temps de séchage des joints). Peignez **toujours du haut vers le bas** : plafonds d'abord, puis murs, puis boiseries. Le peintre intervient en dernier pour éviter les salissures.
:::`,

      `## Comment gérer plusieurs artisans simultanément

Coordonner 4 à 8 corps de métier est le plus grand défi d'une rénovation sans maître d'œuvre. Voici la méthode :

**1. Créer un planning partagé**
Utilisez un outil simple (Google Sheets, Notion, ou même un tableau sur papier) avec les colonnes : semaine, artisan, lot, tâche, dépendance. Partagez-le avec tous les intervenants.

**2. Désigner un "chef de file"**
Un artisan (souvent le maçon ou le plombier) sert de référent sur le chantier. Il signale quand sa tâche est terminée pour déclencher l'intervention suivante. C'est informel mais très efficace.

**3. Organiser des réunions de chantier hebdomadaires**
15 minutes chaque lundi matin avec les artisans présents sur le chantier. Ordre du jour : avancement, problèmes, planning de la semaine. Prenez des photos datées à chaque réunion.

**4. Gérer les paiements par avancement**
Le schéma recommandé est **30/40/30** : 30 % à la commande, 40 % à mi-chantier, 30 % à la réception. Ne payez jamais 100 % avant la fin des travaux. Ce schéma est votre meilleure protection contre les abandons de chantier.

**5. Anticiper les temps de séchage**
- Chape béton : 1 semaine minimum (3 semaines idéal) avant carrelage
- Enduit plâtre : 4 à 6 semaines avant peinture
- Joints de carrelage : 48h avant utilisation
- Sous-couche peinture : 24h avant couche de finition

:::warning Attention aux délais en cascade
Un retard de 1 semaine sur un lot retarde tous les lots suivants. Demandez à chaque artisan de confirmer sa date d'intervention 2 semaines avant, puis 48h avant. Prévoyez des "tâches tampon" (travaux extérieurs, rangement) pour occuper les créneaux si un artisan est en retard.
:::

Pour trouver des artisans fiables et coordonner vos travaux, utilisez notre [service de devis gratuit](/devis). Nous pouvons vous mettre en relation avec des artisans qui ont l'habitude de travailler ensemble dans votre secteur.`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **FFB** (Fédération Française du Bâtiment) — mercuriale des prix du bâtiment 2025-2026
- **CAPEB** — enquête annuelle sur les tarifs artisanaux (2025)
- **ADEME** — guides pratiques rénovation énergétique (2025)
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3, grandes métropoles × 1.15). Dernière mise à jour : avril 2026.`,

      `## FAQ — Travaux maison par où commencer 2026`,
    ],
    faq: [
      {
        question: "Quel est l'ordre des travaux de rénovation d'une maison ?",
        answer:
          "L'ordre logique est : (1) gros œuvre / structure, (2) toiture et façade (hors d'eau/hors d'air), (3) réseaux en encastré (électricité, plomberie, chauffage, VMC), (4) isolation et cloisons, (5) revêtements de sol, (6) revêtements muraux, (7) équipements (cuisine, sanitaires), (8) peinture et finitions.",
      },
      {
        question: "Faut-il un maître d'œuvre pour gérer ses travaux ?",
        answer:
          "Ce n'est pas obligatoire mais fortement recommandé pour les budgets > 50 000 €. Un maître d'œuvre (8-12 % du budget) coordonne les artisans, vérifie la qualité et gère le planning. Pour les petits projets, vous pouvez assurer cette coordination vous-même.",
      },
      {
        question: "Combien de temps dure la rénovation complète d'une maison ?",
        answer:
          'Pour 100 m² en rénovation complète : 3 à 6 mois de travaux + 2 à 3 mois de préparation. Un rafraîchissement simple prend 2 à 4 semaines. Multipliez toujours le planning estimé par 1,3 pour intégrer les aléas.',
      },
      {
        question: 'Peut-on faire plusieurs lots de travaux en même temps ?',
        answer:
          "Oui, certains lots peuvent se chevaucher : l'électricien et le plombier interviennent souvent en parallèle lors de la phase réseaux. Le maçon et le couvreur peuvent travailler simultanément si les zones de travail sont distinctes. En revanche, le peintre ne peut intervenir qu'après tous les autres.",
      },
      {
        question: 'Comment payer ses artisans en toute sécurité ?',
        answer:
          "Payez en 30/40/30 : 30 % à la commande (légal : max 30 % en acompte), 40 % à mi-chantier sur présentation de l'avancement, 30 % à la réception après vérification. Ne payez jamais en espèces (interdit > 1 000 €) et conservez toutes les factures.",
      },
      {
        question: 'Que faire si un artisan ne vient pas au chantier ?',
        answer:
          "Envoyez une mise en demeure par courrier recommandé avec un délai de 15 jours. Si l'artisan ne réagit pas, vous pouvez résilier le contrat et faire appel à un autre artisan. Conservez les preuves (courriers, photos, témoignages) pour un éventuel recours juridique.",
      },
      {
        question: 'Faut-il vider la maison avant les travaux ?',
        answer:
          'Pour une rénovation complète, oui. Prévoyez un garde-meuble (80-200 €/mois) ou stockez chez un proche. Pour une rénovation pièce par pièce, protégez les meubles avec des bâches et déplacez-les dans les pièces non concernées.',
      },
      {
        question: 'Comment limiter la poussière pendant les travaux ?',
        answer:
          "Fermez les portes des pièces non concernées et colmatez les interstices avec du ruban de masquage. Installez des bâches en polyane (film plastique) devant les ouvertures. L'artisan doit utiliser des outils avec aspiration intégrée pour la découpe et le ponçage.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 7. EXTENSION MAISON — PRIX ET DÉMARCHES 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'extension-maison-prix-demarches-2026': {
    title: 'Extension Maison 2026 : Prix, Démarches Urbanisme et Comparatif Solutions',
    excerpt:
      "Prix au m² par type d'extension (surélévation, latérale, véranda), démarches urbanisme complètes, comparatif constructeur vs architecte vs artisans, et contraintes PLU.",
    metaTitle: 'Extension Maison 2026 : Prix et Démarches',
    metaDescription:
      'Extension maison 2026 : prix 1 200-3 500 €/m², démarches urbanisme, comparatif surélévation/extension/véranda. Permis de construire.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-19',
    updatedDate: '2026-04-29',
    readTime: '15 min',
    category: 'Guides',
    tags: [
      'extension',
      'maison',
      'prix',
      'surélévation',
      'véranda',
      'permis de construire',
      '2026',
    ],
    keyTakeaways: [
      'Extension latérale : 1 200-2 800 €/m² — la solution la plus courante',
      'Surélévation : 2 000-3 500 €/m² — idéale quand le terrain est petit',
      'Véranda : 800-2 500 €/m² — la plus économique mais fiscalité différente',
      'Permis de construire obligatoire > 20 m² (ou 40 m² en zone PLU)',
      'Architecte obligatoire si surface totale > 150 m² après extension',
      "Délai moyen d'un projet d'extension : 6 à 12 mois du permis à la livraison",
    ],
    content: [
      `## Extension de maison : les chiffres clés en 2026

Agrandir sa maison plutôt que déménager est un choix de plus en plus fréquent : les frais de notaire (7-8 % dans l'ancien), les frais de déménagement (2 000-5 000 €) et la perte de son quartier/école font souvent pencher la balance vers l'extension. Le prix moyen d'une extension tout compris se situe entre **1 500 et 2 500 €/m²** en 2026, soit 30 000 à 50 000 € pour un agrandissement de 20 m².

Mais le prix varie du simple au triple selon le type d'extension, les matériaux, la région et le niveau de finition. Ce guide vous aide à choisir la solution adaptée à votre terrain, votre budget et vos contraintes d'urbanisme.`,

      `## Prix au m² par type d'extension

### Extension latérale traditionnelle (parpaing/béton)

L'extension latérale est la solution classique : un prolongement du bâtiment existant sur un mur pignon ou en façade arrière.

:::budget
| Niveau de finition | Prix au m² (tout compris) | Pour 20 m² |
| Clos couvert seul (sans finitions intérieures) | 800 – 1 400 € | 16 000 – 28 000 € |
| Finitions standard (sol, murs, plafond, électricité, plomberie) | 1 500 – 2 500 € | 30 000 – 50 000 € |
| Finitions haut de gamme | 2 500 – 3 500 € | 50 000 – 70 000 € |
:::

### Extension ossature bois

L'ossature bois offre un chantier plus rapide (préfabrication en atelier) et d'excellentes performances thermiques.

:::budget
| Niveau de finition | Prix au m² (tout compris) | Avantage |
| Clos couvert | 900 – 1 500 € | Chantier sec, rapide |
| Finitions standard | 1 500 – 2 500 € | Performance RT2020 native |
| Finitions haut de gamme | 2 500 – 3 500 € | Bardage bois, design contemporain |
:::

### Surélévation (ajout d'un étage)

La surélévation est la seule option quand le terrain ne permet pas d'extension au sol. Elle nécessite une étude de structure préalable.

:::budget
| Type | Prix au m² | Contrainte |
| Surélévation partielle (une partie du toit) | 1 800 – 2 800 € | Charpente existante à modifier |
| Surélévation complète (tout un étage) | 2 200 – 3 500 € | Fondations à vérifier, étude structure |
| Aménagement de combles (si hauteur suffisante) | 800 – 1 500 € | Alternative moins coûteuse |
:::

:::warning Étude de structure obligatoire
Avant toute surélévation, un bureau d'études structure doit vérifier que les fondations et les murs porteurs supportent le poids supplémentaire. Coût : 1 500-3 000 €. Si le renforcement des fondations est nécessaire, ajoutez 10 000-25 000 € au budget.
:::

### Véranda

La véranda est techniquement la solution la plus accessible mais attention à la fiscalité et au confort thermique.

:::budget
| Matériau | Prix au m² | Isolation | Durée de vie |
| PVC | 800 – 1 500 € | Moyenne | 15-20 ans |
| Aluminium | 1 200 – 2 200 € | Bonne (avec rupture de pont thermique) | 25-30 ans |
| Bois | 1 500 – 2 500 € | Très bonne | 20-30 ans (avec entretien) |
| Mixte bois-alu | 1 800 – 3 000 € | Excellente | 30+ ans |
:::

:::tip Véranda ou extension vitrée ?
Une véranda classique (structure légère, vitrage important) est soumise à la taxe d'aménagement mais pas à la même réglementation thermique qu'une extension "en dur". Si vous souhaitez un espace de vie toute l'année, optez pour une extension avec grandes baies vitrées plutôt qu'une véranda : le surcoût est de 20-30 % mais le confort thermique et la valorisation du bien sont bien supérieurs.
:::`,

      `## Démarches urbanisme complètes

Le cadre réglementaire des extensions est défini par le Code de l'urbanisme. Voici les cas de figure :

### Déclaration préalable

- Extension de **5 à 20 m²** de surface de plancher (ou 40 m² en zone PLU avec conditions)
- Délai d'instruction : **1 mois** (2 mois en zone protégée)
- Pas d'architecte obligatoire

### Permis de construire

- Extension de **plus de 20 m²** (ou plus de 40 m² en zone PLU)
- Surface totale (existant + extension) **supérieure à 150 m²** → architecte obligatoire
- Délai d'instruction : **2 mois** (3 mois en zone protégée ABF)
- Affichage sur le terrain obligatoire pendant 2 mois après obtention

### Les pièces à fournir

:::budget
| Document | Déclaration préalable | Permis de construire |
| Formulaire Cerfa | 13703*09 | 13406*11 |
| Plan de situation | ✅ | ✅ |
| Plan de masse | ✅ | ✅ |
| Plan de coupe | ❌ | ✅ |
| Plan des façades et toitures | ✅ | ✅ |
| Notice architecturale | ❌ | ✅ |
| Photos de l'environnement | ✅ | ✅ |
| Insertion 3D dans l'environnement | ❌ | ✅ |
| Attestation RE2020 | ❌ | ✅ (si > 50 m²) |
:::

:::expert Parole d'expert — Maître Dupont, avocat en droit de l'urbanisme
"Le premier réflexe avant toute extension est de consulter le PLU en mairie. Le PLU fixe les règles d'implantation (distance aux limites de propriété, hauteur maximale, coefficient d'emprise au sol) qui peuvent rendre votre projet impossible ou nécessiter une adaptation. Un rendez-vous gratuit au service urbanisme de votre mairie peut vous faire gagner des mois."
:::`,

      `## Contraintes PLU les plus courantes

Le Plan Local d'Urbanisme (PLU) de votre commune fixe les règles que votre extension doit respecter :

**1. Distance aux limites de propriété**
- Règle générale : 3 mètres minimum (ou H/2, H étant la hauteur de l'extension)
- Exception : construction sur limite si accord du voisin ou si le PLU le permet

**2. Coefficient d'emprise au sol (CES)**
- Pourcentage maximum de terrain constructible : souvent 40-60 % en zone urbaine
- Si votre maison occupe déjà 50 % et le CES est de 50 %, aucune extension au sol n'est possible → surélévation

**3. Hauteur maximale**
- Fixée par le PLU (souvent 7-9 m au faîtage en zone pavillonnaire)
- Peut empêcher une surélévation

**4. Aspect extérieur**
- Matériaux autorisés (parfois obligation de crépi, interdiction du bardage bois)
- Coloris des façades et menuiseries
- Forme du toit (pente, matériau de couverture)

**5. Zone ABF (Architecte des Bâtiments de France)**
- Si votre maison est dans un périmètre de 500 m autour d'un monument historique
- L'ABF doit donner un avis conforme → délai d'instruction rallongé de 1 mois
- Contraintes esthétiques plus strictes (matériaux, couleurs, volumes)`,

      `## Comparatif : constructeur vs architecte vs artisans

Trois approches sont possibles pour réaliser une extension. Le choix dépend du budget, de la complexité du projet et de votre disponibilité.

:::budget
| Critère | Constructeur | Architecte | Artisans séparés |
| Prix moyen | +5 à +15 % vs artisans | +10 à +20 % vs artisans | Référence |
| Conception | Catalogue (standard) | Sur mesure | Pas de conception incluse |
| Coordination chantier | ✅ Incluse | ✅ Incluse | ❌ À votre charge |
| Assurance DO | ✅ Souvent incluse | ✅ Gérée par l'archi | ❌ À souscrire vous-même |
| Permis de construire | ✅ Géré | ✅ Géré | ❌ À votre charge |
| Interlocuteur unique | ✅ | ✅ | ❌ (4-6 artisans) |
| Personnalisation | ⚠️ Limitée | ✅ Totale | ✅ Selon vos choix |
| Garanties | Décennale + biennale | Décennale (archi + artisans) | Décennale par artisan |
:::

**Quand choisir un constructeur ?** Si votre extension est standard (20-40 m², forme simple), que vous voulez un interlocuteur unique et un prix ferme.

**Quand choisir un architecte ?** Si votre projet est complexe (surélévation, zone ABF, forme atypique), si la surface totale dépasse 150 m² (architecte obligatoire) ou si vous voulez un design unique.

**Quand choisir des artisans séparés ?** Si votre budget est serré, que vous avez du temps pour coordonner et que le projet est simple. Économie : 10-20 % mais responsabilité de coordination à 100 %.

:::warning Assurance dommages-ouvrage
Pour une extension, l'assurance dommages-ouvrage est **légalement obligatoire** (art. L242-1 du Code des assurances). Elle coûte 3-5 % du montant des travaux. Les constructeurs l'intègrent souvent dans leur prix ; avec des artisans séparés, vous devez la souscrire vous-même.
:::

Pour comparer des devis d'extension de maison, utilisez notre [service de devis gratuit](/devis). Nous vous mettons en relation avec des professionnels qualifiés (constructeurs, architectes, artisans) dans votre département.`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **FFB** (Fédération Française du Bâtiment) — mercuriale des prix du bâtiment 2025-2026
- **CAPEB** — enquête annuelle sur les tarifs artisanaux (2025)
- **Architecteo** — baromètre coût extension maison 2026
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3, grandes métropoles × 1.15). Dernière mise à jour : avril 2026.`,

      `## FAQ — Extension maison 2026`,
    ],
    faq: [
      {
        question: "Quel est le prix moyen d'une extension de 20 m² ?",
        answer:
          "Le prix moyen d'une extension de 20 m² tout compris (structure + finitions) se situe entre 30 000 et 50 000 € en 2026. Une extension en ossature bois est dans la fourchette basse, une surélévation dans la fourchette haute.",
      },
      {
        question: 'Faut-il un permis de construire pour une extension ?',
        answer:
          "En zone PLU : déclaration préalable jusqu'à 40 m², permis de construire au-delà. Hors zone PLU : déclaration préalable jusqu'à 20 m², permis au-delà. Un architecte est obligatoire si la surface totale (existant + extension) dépasse 150 m².",
      },
      {
        question: 'Quelle extension coûte le moins cher ?',
        answer:
          "La véranda en PVC est la solution la moins chère (800-1 500 €/m²), suivie de l'extension ossature bois (1 500-2 500 €/m²). La surélévation est la plus coûteuse (2 000-3 500 €/m²) mais ne consomme pas de terrain.",
      },
      {
        question: "Combien de temps durent les travaux d'extension ?",
        answer:
          'Extension latérale : 3-5 mois. Ossature bois : 2-4 mois (préfabrication en atelier). Surélévation : 4-6 mois. Véranda : 1-3 mois. Ajoutez 2-3 mois de démarches administratives en amont.',
      },
      {
        question: 'Une extension augmente-t-elle la taxe foncière ?',
        answer:
          "Oui, toute extension augmente la surface taxable et donc la taxe foncière. L'augmentation dépend de la valeur locative cadastrale de votre commune. Pour une extension de 20 m², comptez 200-600 €/an d'augmentation. Vous bénéficiez d'une exonération de 2 ans pour les constructions nouvelles.",
      },
      {
        question: 'Peut-on faire une extension sans toucher au terrain du voisin ?',
        answer:
          'La distance minimale aux limites de propriété est fixée par le PLU (généralement 3 m ou H/2). Il est possible de construire sur la limite si le PLU le permet ET si le voisin donne son accord. Un mur mitoyen existant peut servir de support sous conditions.',
      },
      {
        question: 'Quelles aides pour financer une extension ?',
        answer:
          "Les extensions ne sont pas éligibles à MaPrimeRénov' (réservée à la rénovation énergétique). En revanche : TVA à 10 % si le logement a plus de 2 ans, Éco-PTZ si l'extension inclut des travaux d'isolation, et PTZ pour les primo-accédants dans certaines zones.",
      },
      {
        question: 'Extension ou aménagement de combles : que choisir ?',
        answer:
          "Si vos combles ont une hauteur sous faîtage > 1,80 m et une pente > 30°, l'aménagement de combles est 30-50 % moins cher qu'une extension (800-1 500 €/m² vs 1 500-2 500 €/m²). Sinon, l'extension est la seule option pour gagner de la surface habitable.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 8. CHOISIR ARTISAN — GUIDE ANTI-ARNAQUE 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'choisir-artisan-guide-anti-arnaque-2026': {
    title: 'Choisir son Artisan en 2026 : Le Guide Anti-Arnaque Complet',
    excerpt:
      "Les 15 signaux d'alerte d'un artisan malhonnête, check-list vérification (SIRET, assurance, avis, qualifications), modèle de devis commenté et recours en cas de litige.",
    metaTitle: 'Guide Anti-Arnaque Artisan 2026 : 15 Signaux',
    metaDescription:
      "Choisir un artisan fiable en 2026 : 15 signaux d'alerte, vérification SIRET/assurance, modèle de devis, recours litiges. Protégez-vous.",
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-22',
    updatedDate: '2026-04-29',
    readTime: '15 min',
    category: 'Conseils',
    tags: ['artisan', 'arnaque', 'devis', 'SIRET', 'assurance décennale', 'litige', '2026'],
    keyTakeaways: [
      'Toujours vérifier le SIRET sur societe.com ou infogreffe.fr AVANT de signer',
      "Exiger l'attestation d'assurance décennale datée de moins de 3 mois",
      "Ne jamais verser plus de 30 % d'acompte (maximum légal recommandé)",
      'Un devis doit obligatoirement mentionner 12 informations légales',
      'En cas de litige, la médiation est gratuite et obligatoire avant le tribunal',
      'Les 3 vérifications qui prennent 5 minutes et évitent 90 % des arnaques',
    ],
    content: [
      `## Pourquoi les arnaques dans le bâtiment restent fréquentes

La DGCCRF (Direction Générale de la Concurrence, de la Consommation et de la Répression des Fraudes) recense chaque année plus de **50 000 plaintes** liées aux travaux du bâtiment. Les arnaques les plus courantes : travaux jamais terminés (28 %), malfaçons graves (24 %), surfacturation (19 %), absence d'assurance (15 %), démarchage abusif (14 %).

Pourtant, **90 % de ces arnaques sont évitables** avec quelques vérifications simples qui prennent moins de 10 minutes. Ce guide vous donne les outils concrets pour choisir un artisan fiable et vous protéger juridiquement tout au long du chantier.`,

      `## Les 15 signaux d'alerte d'un artisan malhonnête

### Signaux d'alerte AVANT signature

**1. Démarchage à domicile non sollicité**
Un artisan qui sonne à votre porte pour proposer ses services est un signal d'alerte majeur. La loi impose un délai de rétractation de 14 jours pour tout contrat signé hors établissement, mais les arnaqueurs commencent les travaux immédiatement pour vous mettre devant le fait accompli.

**2. Devis oral ou manuscrit non détaillé**
Un artisan professionnel fournit un devis dactylographié avec les mentions légales obligatoires. Un devis griffonné sur un bout de papier sans SIRET, sans assurance et sans détail des prestations est un drapeau rouge.

**3. Prix anormalement bas (30 %+ sous la concurrence)**
Un prix très bas cache presque toujours : du travail non déclaré (pas d'assurance en cas de problème), des matériaux bas de gamme substitués, ou des travaux volontairement incomplets pour facturer des "suppléments".

**4. Acompte supérieur à 30 % demandé**
La loi n'interdit pas techniquement un acompte élevé, mais les professionnels sérieux ne demandent jamais plus de 30 %. Un acompte de 50 % ou plus est un signal d'arnaque classique (l'artisan empoche l'argent et disparaît ou bâcle les travaux).

**5. Pression à signer rapidement ("offre valable 24h")**
Un artisan honnête vous laisse le temps de comparer. La pression temporelle est une technique de manipulation classique.

:::warning Les 3 arnaques les plus coûteuses
(1) Le "faux RGE" : l'artisan prétend être RGE mais ne l'est pas → vous perdez toutes les aides. Vérifiez sur france-renov.gouv.fr. (2) L'artisan sans décennale : en cas de malfaçon structurelle, aucune assurance ne vous couvre. (3) Le devis volontairement incomplet : le prix de base est attractif mais les "options obligatoires" triplent la facture finale.
:::

### Signaux d'alerte PENDANT le chantier

**6. Changement de matériaux sans accord**
L'artisan remplace un matériau prévu au devis par un moins cher sans vous consulter. Exigez une validation écrite pour tout changement.

**7. Sous-traitance non déclarée**
L'artisan que vous avez choisi envoie une autre équipe sur le chantier. La sous-traitance est légale mais doit être mentionnée au contrat et les sous-traitants doivent être assurés.

**8. Absence de protection du chantier**
Un artisan professionnel protège votre intérieur (bâches, ruban de masquage) et nettoie quotidiennement son espace de travail. L'absence de protection révèle un manque de professionnalisme.

**9. Refus de montrer les factures de matériaux**
Si le devis prévoit des matériaux de marque, l'artisan doit pouvoir justifier leur achat. Un refus peut masquer une substitution.

**10. Demande de paiement en espèces**
Le paiement en espèces est interdit au-delà de 1 000 € pour les professionnels. C'est aussi un moyen de ne pas déclarer le chantier (pas de TVA, pas de garantie).

### Signaux d'alerte APRÈS le chantier

**11. Refus de réception contradictoire**
L'artisan refuse de faire un PV de réception des travaux avec vous. Ce PV est pourtant le point de départ de la garantie décennale.

**12. Pas de facture finale détaillée**
L'artisan remet un reçu global sans détail. Vous avez droit à une facture détaillée mentionnant chaque prestation.

**13. Disparition après le chantier**
L'artisan ne répond plus au téléphone pour la levée des réserves. Signe fréquent d'un artisan non assuré ou en difficulté financière.

**14. Menace en cas de contestation**
Tout artisan qui vous menace (verbalement ou physiquement) en cas de contestation de la qualité des travaux commet un délit. Portez plainte immédiatement.

**15. Demande du solde avant la fin des travaux**
L'artisan exige le paiement final alors que des réserves sont émises. Le solde ne doit être versé qu'après levée complète des réserves.`,

      `## Check-list vérification en 5 minutes

Avant de signer un devis, effectuez ces vérifications systématiques :

**1. Vérification SIRET (2 minutes)**
- Rendez-vous sur [societe.com](https://www.societe.com) ou [infogreffe.fr](https://www.infogreffe.fr)
- Saisissez le numéro SIRET (14 chiffres) ou le nom de l'entreprise
- Vérifiez : statut actif, date de création (ancienneté), pas de procédure collective

**2. Vérification assurance décennale (1 minute)**
- Demandez l'attestation d'assurance décennale en cours de validité
- Vérifiez que les activités couvertes correspondent aux travaux prévus
- Vérifiez la date de validité (l'attestation doit couvrir la date de début du chantier)

**3. Vérification qualifications (1 minute)**
- Qualification RGE (obligatoire pour les aides) : vérifiez sur [france-renov.gouv.fr](https://france-renov.gouv.fr)
- Qualification Qualibat : vérifiez sur [qualibat.com](https://www.qualibat.com)
- Numéro d'agrément si requis (gaz, électricité)

**4. Vérification avis clients (1 minute)**
- Consultez les avis sur Google Maps, Pages Jaunes et notre [annuaire ServicesArtisans](/services)
- Méfiez-vous des profils avec uniquement des avis 5 étoiles (possiblement faux)
- Les avis 3-4 étoiles détaillés sont souvent les plus fiables

:::tip La règle des 3×3
Demandez toujours **3 devis** à **3 artisans différents** pour **3 références** vérifiables chacun. Ce "filtre" élimine naturellement les artisans peu sérieux qui ne peuvent pas fournir de références ou qui proposent des prix aberrants.
:::`,

      `## Modèle de devis commenté : les 12 mentions obligatoires

Un devis conforme doit obligatoirement comporter les mentions suivantes (art. L. 111-1 du Code de la consommation) :

:::budget
| N° | Mention obligatoire | Exemple | Pourquoi c'est important |
| 1 | Date du devis | 03/04/2026 | Durée de validité de l'offre |
| 2 | Nom et adresse de l'artisan | SARL Dupont Rénovation, 12 rue… | Identification juridique |
| 3 | SIRET | 123 456 789 00012 | Vérification d'existence |
| 4 | N° TVA intracommunautaire | FR12 123456789 | Obligation fiscale |
| 5 | Assurance décennale (n° + assureur) | Décennale MAAF n°XXX | Couverture en cas de sinistre |
| 6 | Description détaillée de chaque prestation | "Pose carrelage grès cérame 60×60 Marazzi" | Évite les litiges sur la qualité |
| 7 | Quantités (surfaces, ML, unités) | 12 m², 4 ML, 6 unités | Base de calcul vérifiable |
| 8 | Prix unitaire HT et montant HT | 65 €/m² HT, total 780 € HT | Décomposition du prix |
| 9 | Taux de TVA applicable | TVA 10 % (logement > 2 ans) | Vérification du taux légal |
| 10 | Montant total TTC | 858 € TTC | Ce que vous payez réellement |
| 11 | Conditions de paiement | 30 % commande, 40 % avancement, 30 % réception | Protection contre les abus |
| 12 | Durée de validité du devis | Valable 30 jours | Engagement contractuel limité |
:::

**Mentions recommandées (non obligatoires mais protectrices) :**
- Délai d'exécution prévisionnel
- Pénalités de retard
- Conditions d'annulation
- Mention "devis reçu avant l'exécution des travaux" suivie de la signature du client

:::warning Mention "lu et approuvé"
La mention manuscrite "lu et approuvé" suivie de votre signature transforme le devis en **contrat**. Ne signez jamais un devis que vous n'avez pas lu intégralement. Toute modification ultérieure doit faire l'objet d'un avenant écrit signé par les deux parties.
:::`,

      `## Recours en cas de litige

Malgré toutes les précautions, un litige peut survenir. Voici les étapes à suivre, de la plus simple à la plus formelle :

**Étape 1 : Dialogue direct (gratuit)**
Contactez l'artisan par écrit (email avec accusé de réception ou courrier recommandé) en décrivant précisément le problème et vos attentes. Joignez des photos datées. Laissez un délai de 15 jours pour réponse.

**Étape 2 : Mise en demeure (gratuit)**
Si pas de réponse ou réponse insatisfaisante, envoyez une mise en demeure par lettre recommandée avec AR. Mentionnez un délai de 30 jours et les actions que vous engagerez en l'absence de résolution (médiation, tribunal).

**Étape 3 : Médiation de la consommation (gratuit)**
Depuis 2016, tout professionnel doit proposer un médiateur de la consommation. Le médiateur tente de trouver un accord amiable. Délai : 90 jours maximum. La médiation est gratuite pour le consommateur.

**Étape 4 : Signalement DGCCRF**
Signalement sur [signal.conso.gouv.fr](https://signal.conso.gouv.fr). La DGCCRF peut enquêter et sanctionner l'artisan. Ce signalement protège aussi les futurs clients.

**Étape 5 : Tribunal**
- Litige < 5 000 € : tribunal de proximité (sans avocat)
- Litige 5 000 – 10 000 € : tribunal judiciaire (avocat facultatif)
- Litige > 10 000 € : tribunal judiciaire (avocat recommandé)

:::budget
| Voie de recours | Coût | Délai moyen | Chances de succès |
| Dialogue direct | 0 € | 2-4 semaines | 60 % |
| Mise en demeure | 6 € (LRAR) | 4-6 semaines | 40 % (parmi les 40 % restants) |
| Médiation | 0 € | 2-3 mois | 70 % |
| Tribunal de proximité | 0 – 500 € | 4-12 mois | 75 % (si dossier solide) |
| Tribunal judiciaire | 1 500 – 5 000 € (avocat) | 12-24 mois | 80 % (si expert judiciaire) |
:::

:::expert Parole d'expert — Maître Lefèvre, avocate en droit de la construction
"Dans 80 % des litiges bâtiment que je traite, le client n'a pas de PV de réception des travaux. Ce document est ESSENTIEL : il est le point de départ de la garantie de parfait achèvement (1 an), de la garantie biennale (2 ans) et de la garantie décennale (10 ans). Sans lui, prouver la responsabilité de l'artisan est beaucoup plus difficile."
:::

Pour trouver des artisans vérifiés avec SIRET et assurance décennale validés, utilisez notre [annuaire d'artisans](/services). Chaque artisan référencé a fait l'objet d'une vérification administrative.`,

      `## Sources et méthodologie

Les informations de ce guide sont issues de :
- **DGCCRF** — rapports annuels sur les pratiques commerciales dans le bâtiment (2024-2025)
- **CAPEB** — enquête annuelle sur les tarifs artisanaux (2025)
- **FFB** — guide des bonnes pratiques contractuelles 2025
- **ANAH** — conditions d'éligibilité RGE et MaPrimeRénov' 2026

Dernière mise à jour : avril 2026.`,

      `## FAQ — Choisir artisan guide anti-arnaque 2026`,
    ],
    faq: [
      {
        question: "Comment vérifier qu'un artisan est fiable ?",
        answer:
          "Vérifiez en 5 minutes : (1) SIRET actif sur societe.com, (2) attestation d'assurance décennale en cours de validité, (3) avis clients sur Google et Pages Jaunes, (4) qualification RGE si travaux énergétiques sur france-renov.gouv.fr. Demandez aussi 2-3 références de chantiers récents.",
      },
      {
        question: 'Peut-on annuler un devis signé ?',
        answer:
          "Si le devis a été signé à votre domicile (hors établissement), vous bénéficiez d'un délai de rétractation de 14 jours. Si vous avez signé dans les locaux de l'artisan, l'annulation n'est possible qu'en cas de vice du consentement (erreur, dol, violence) ou si le devis prévoit des conditions d'annulation.",
      },
      {
        question: "Quel est le montant maximum d'acompte légal ?",
        answer:
          "La loi ne fixe pas de maximum d'acompte, mais la pratique recommandée est de 30 %. Au-delà, vous prenez un risque en cas de défaillance de l'artisan. L'acompte versé vous engage (tout comme l'artisan) : si vous annulez, l'artisan peut conserver l'acompte à titre de dédommagement.",
      },
      {
        question: "Que faire si l'artisan disparaît pendant le chantier ?",
        answer:
          "Envoyez une mise en demeure par LRAR avec un délai de 15 jours. Sans réponse, faites constater l'abandon par huissier (300-500 €). Signalez à la DGCCRF. Si l'artisan est assuré en décennale, contactez son assureur. Faites établir un constat par un autre artisan pour chiffrer les travaux restants.",
      },
      {
        question: "L'artisan peut-il augmenter le prix après signature du devis ?",
        answer:
          'Non, le devis signé est un contrat à prix ferme. L\'artisan ne peut facturer des suppléments que pour des travaux supplémentaires demandés par écrit par le client (avenant). Les "imprévus" font partie du risque de l\'artisan, sauf clause contractuelle spécifique.',
      },
      {
        question: 'Comment reconnaître un faux avis en ligne ?',
        answer:
          'Signaux de faux avis : tous datés de la même période, textes très courts et génériques ("Super artisan, je recommande"), pas de détails sur les travaux réalisés, uniquement des 5 étoiles sans aucun 3 ou 4. Les vrais avis détaillent les travaux, mentionnent des défauts mineurs et varient dans le temps.',
      },
      {
        question: 'Peut-on exiger une retenue de garantie ?',
        answer:
          "Oui, vous pouvez négocier une retenue de garantie de 5 % du montant total, libérable 1 an après la réception (garantie de parfait achèvement). Ce n'est pas obligatoire entre particulier et artisan mais c'est une pratique recommandée pour les chantiers > 10 000 €.",
      },
      {
        question: 'La garantie décennale couvre-t-elle tous les travaux ?',
        answer:
          "Non, la garantie décennale couvre uniquement les dommages qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination (fondations, toiture, étanchéité, structure). Les finitions relèvent de la garantie de parfait achèvement (1 an) ou de la garantie biennale (2 ans pour les équipements dissociables).",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 9. AIDES RÉNOVATION ÉNERGÉTIQUE — CUMUL 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'aides-renovation-energetique-cumul-2026': {
    title:
      "Aides Rénovation Énergétique 2026 : Tableau Complet et Cumul (MaPrimeRénov', CEE, Éco-PTZ)",
    excerpt:
      "Tableau complet MaPrimeRénov' + CEE + Éco-PTZ + TVA 5,5 %, simulation par profil de revenus, parcours accompagné vs par geste, et calendrier des changements 2026.",
    metaTitle: "Aides Rénovation 2026 : Cumul MaPrimeRénov'",
    metaDescription:
      "Aides rénovation 2026 : MaPrimeRénov' + CEE + Éco-PTZ cumulables. Simulation par revenus, parcours accompagné, calendrier 2026.",
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-25',
    updatedDate: '2026-04-29',
    readTime: '16 min',
    category: 'Aides & Subventions',
    tags: ['aides', 'MaPrimeRénov', 'CEE', 'Éco-PTZ', 'TVA 5.5', 'rénovation énergétique', '2026'],
    keyTakeaways: [
      "MaPrimeRénov' par geste : jusqu'à 11 000 € par équipement installé",
      "MaPrimeRénov' Parcours Accompagné : jusqu'à 63 000 € (90 % du budget pour les plus modestes)",
      "CEE : 2 000-5 000 € cumulables avec MaPrimeRénov' pour la même opération",
      "Éco-PTZ : jusqu'à 50 000 € à taux zéro sur 20 ans",
      'TVA 5,5 % : économie automatique de ~15 % sur les travaux énergétiques',
      'Toutes les aides sont cumulables — seul le reste à charge ne peut pas être négatif',
    ],
    content: [
      `## Le paysage des aides en 2026 : ce qui change

L'année 2026 marque une évolution importante du dispositif d'aides à la rénovation énergétique. Le gouvernement a maintenu les niveaux d'aide élevés tout en renforçant le contrôle des dossiers et la qualité des travaux. Les principaux changements par rapport à 2025 :

- **MaPrimeRénov' Parcours Accompagné** : plafonds de travaux relevés à 70 000 € HT (vs 63 000 € en 2025 pour certains profils)
- **CEE** : barèmes revalorisés de 5 à 10 % pour l'isolation des murs et les PAC
- **Éco-PTZ** : durée maximale portée à 20 ans (vs 15 ans) pour les bouquets de travaux
- **Contrôle renforcé** : audit énergétique obligatoire avant ET après travaux pour le Parcours Accompagné
- **Mon Accompagnateur Rénov' (MAR)** : obligatoire pour tout dossier Parcours Accompagné, coût pris en charge à 100 % pour les profils Bleu et Jaune

Ce guide détaille chaque aide avec les montants exacts, les conditions d'éligibilité et des simulations concrètes par profil de revenus.`,

      `## MaPrimeRénov' par geste : montants 2026

Le parcours "par geste" permet de financer un ou deux travaux spécifiques sans obligation de gain DPE minimum.

### Conditions générales
- Logement principal de plus de 15 ans
- Travaux réalisés par un artisan RGE
- Dossier déposé AVANT signature des devis
- Résidence principale du demandeur

### Barème par type de travaux et profil

:::budget
| Travaux | Bleu (très modeste) | Jaune (modeste) | Violet (intermédiaire) | Rose (aisé) |
| PAC air-eau | 5 000 € | 4 000 € | 3 000 € | 0 € |
| PAC géothermique | 10 000 € | 8 000 € | 6 000 € | 0 € |
| Chaudière biomasse | 8 000 € | 6 500 € | 4 000 € | 0 € |
| Chauffe-eau solaire | 4 000 € | 3 000 € | 2 000 € | 0 € |
| Chauffe-eau thermo. | 1 200 € | 800 € | 400 € | 0 € |
| Isolation murs ITE | 75 €/m² | 60 €/m² | 40 €/m² | 15 €/m² |
| Isolation murs ITI | 25 €/m² | 20 €/m² | 15 €/m² | 7 €/m² |
| Isolation combles | 25 €/m² | 20 €/m² | 15 €/m² | 7 €/m² |
| Isolation plancher bas | 20 €/m² | 15 €/m² | 10 €/m² | 0 € |
| Fenêtres (par fenêtre) | 100 € | 80 € | 40 € | 0 € |
| VMC double flux | 2 500 € | 2 000 € | 1 500 € | 0 € |
:::

### Plafonds de revenus 2026 (Île-de-France)

:::budget
| Profil | 1 personne | 2 personnes | 3 personnes | 4 personnes | 5 personnes |
| Bleu (très modeste) | 23 541 € | 34 551 € | 41 493 € | 48 447 € | 55 427 € |
| Jaune (modeste) | 28 657 € | 42 058 € | 50 513 € | 58 981 € | 67 473 € |
| Violet (intermédiaire) | 40 018 € | 58 827 € | 70 382 € | 82 839 € | 94 844 € |
| Rose (aisé) | > 40 018 € | > 58 827 € | > 70 382 € | > 82 839 € | > 94 844 € |
:::

:::tip Comment connaître votre profil ?
Votre profil est déterminé par votre **Revenu Fiscal de Référence (RFR)** figurant sur votre dernier avis d'imposition. Les plafonds sont différents en Île-de-France et dans le reste de la France (environ 20 % plus bas hors IDF).
:::`,

      `## MaPrimeRénov' Parcours Accompagné : le dispositif phare

Le Parcours Accompagné est le dispositif le plus généreux. Il finance une rénovation globale avec un gain minimum de **2 classes DPE**.

### Conditions spécifiques
- Gain DPE ≥ 2 classes (audit avant/après obligatoire)
- Mon Accompagnateur Rénov' (MAR) obligatoire
- Au moins 2 gestes d'isolation parmi : murs, toiture, plancher bas, fenêtres
- Logement de plus de 15 ans, résidence principale

### Barème Parcours Accompagné 2026

:::budget
| Gain DPE | Plafond travaux HT | Bleu (90 %) | Jaune (75 %) | Violet (60 %) | Rose (40 %) |
| 2 classes | 40 000 € | 36 000 € | 30 000 € | 24 000 € | 16 000 € |
| 3 classes | 55 000 € | 49 500 € | 41 250 € | 33 000 € | 22 000 € |
| 4 classes+ | 70 000 € | 63 000 € | 52 500 € | 42 000 € | 28 000 € |
:::

Le Parcours Accompagné est **nettement plus avantageux** que la somme des aides par geste. Exemple pour une rénovation de 50 000 € (profil Jaune, gain 3 classes) :
- Par geste : ~12 000 € d'aides MaPrimeRénov'
- Parcours Accompagné : **37 500 €** d'aides
- Différence : **+25 500 €** d'aides supplémentaires

:::warning Le MAR est obligatoire
Mon Accompagnateur Rénov' (MAR) est un conseiller agréé qui vous accompagne de A à Z : audit énergétique, plan de travaux, sélection des aides, suivi du chantier. Son coût (1 500-2 000 €) est intégralement pris en charge pour les profils Bleu et Jaune, et à 80 % pour les profils Violet.
:::`,

      `## CEE (Certificats d'Économie d'Énergie) : prime complémentaire

Les CEE sont des primes versées par les fournisseurs d'énergie (EDF, Engie, TotalEnergies, etc.) pour financer les travaux d'économie d'énergie de leurs clients. Elles sont **cumulables avec MaPrimeRénov'**.

### Montants moyens CEE 2026

:::budget
| Travaux | Montant CEE moyen | Conditions |
| Isolation combles perdus | 5 – 10 €/m² | R ≥ 7 m².K/W |
| Isolation murs | 8 – 25 €/m² | R ≥ 3,7 m².K/W |
| Isolation plancher bas | 5 – 10 €/m² | R ≥ 3 m².K/W |
| PAC air-eau | 2 500 – 4 000 € | SCOP ≥ 3,5 |
| PAC géothermique | 3 000 – 5 000 € | SCOP ≥ 3,5 |
| Chaudière biomasse | 2 000 – 4 000 € | Rendement ≥ 87 % |
| Fenêtres | 50 – 100 €/fenêtre | Uw ≤ 1,3 W/m².K |
| VMC double flux | 500 – 1 500 € | Rendement ≥ 85 % |
:::

### Comment obtenir les CEE ?
1. **Avant** de signer les devis : inscrivez-vous sur un site de primes CEE (Prime Énergie EDF, TotalEnergies, Effy, etc.)
2. Signez les devis et réalisez les travaux
3. Envoyez les factures et l'attestation sur l'honneur
4. La prime est versée sous 4 à 8 semaines

:::tip Comparez les offres CEE
Les montants des CEE varient de 20 à 50 % d'un fournisseur à l'autre pour les mêmes travaux. Comparez sur au moins 3 plateformes (Prime CEE EDF, Certificats d'économie d'énergie Engie, Effy) avant de vous inscrire. L'inscription est gratuite et sans engagement.
:::`,

      `## Éco-PTZ : financer le reste à charge à taux zéro

L'Éco-Prêt à Taux Zéro finance le reste à charge des travaux de rénovation énergétique après déduction des aides.

### Conditions et montants 2026

:::budget
| Type de travaux | Montant maximum | Durée maximum |
| Action simple (1 geste) | 15 000 € | 15 ans |
| Bouquet de 2 travaux | 25 000 € | 15 ans |
| Bouquet de 3 travaux ou + | 30 000 € | 20 ans |
| Performance globale (gain ≥ 35 %) | 50 000 € | 20 ans |
:::

### Avantages de l'Éco-PTZ
- Taux zéro garanti (pas de frais financiers)
- Cumulable avec MaPrimeRénov' et les CEE
- Pas de conditions de ressources (accessible à tous)
- Remboursement anticipé sans pénalité
- Durée jusqu'à 20 ans (mensualités faibles)

### Comment obtenir l'Éco-PTZ ?
1. Demandez un devis à un artisan RGE
2. Montez le dossier avec votre banque (toutes les banques partenaires sur ecologie.gouv.fr)
3. L'offre de prêt est émise sous 2 à 4 semaines
4. Les fonds sont versés directement à vous ou à l'artisan

:::warning Délai bancaire
Prévoyez 3 à 6 semaines entre le dépôt du dossier et le déblocage des fonds. Certaines banques sont plus réactives que d'autres. BNP Paribas, Crédit Agricole et Caisse d'Épargne sont les banques les plus actives sur l'Éco-PTZ.
:::`,

      `## Simulation complète par profil de revenus

### Projet type : isolation + PAC pour une maison de 100 m², DPE E → C

**Travaux prévus :**
- Isolation combles perdus : 3 500 € TTC
- ITE façades : 22 000 € TTC
- PAC air-eau 10 kW : 12 000 € TTC
- VMC double flux : 4 500 € TTC
- **Total : 42 000 € TTC**

:::budget
| Aide | Profil Bleu | Profil Jaune | Profil Violet | Profil Rose |
| MaPrimeRénov' Parcours Acc. (3 classes) | 37 800 € (90 %) | 31 500 € (75 %) | 25 200 € (60 %) | 16 800 € (40 %) |
| CEE (tous travaux cumulés) | 6 000 € | 6 000 € | 5 000 € | 4 000 € |
| TVA 5,5 % (économie vs 20 %) | 6 100 € | 6 100 € | 6 100 € | 6 100 € |
| **Total aides** | **49 900 €** | **43 600 €** | **36 300 €** | **26 900 €** |
| **Reste à charge** | **0 € ✅** | **0 € ✅** | **5 700 €** | **15 100 €** |
| Éco-PTZ pour le reste | — | — | 5 700 € (0 %) | 15 100 € (0 %) |
| Mensualité Éco-PTZ (20 ans) | — | — | 24 €/mois | 63 €/mois |
:::

**Résultat** : pour les profils Bleu et Jaune, la rénovation est **intégralement financée** par les aides (le total des aides dépasse le coût des travaux — le trop-perçu n'est pas versé). Pour le profil Violet, la mensualité de 24 €/mois est largement compensée par l'économie d'énergie de 150-200 €/mois.

:::expert Parole d'expert — Sophie Martel, conseillère France Rénov'
"Le Parcours Accompagné est de loin le dispositif le plus avantageux. Pour un même projet de 42 000 €, un profil Jaune obtiendrait ~12 000 € en aides par geste contre 31 500 € en Parcours Accompagné. La différence justifie largement le temps supplémentaire de montage du dossier."
:::`,

      `## Calendrier des changements 2026

:::budget
| Date | Changement | Impact |
| Janvier 2026 | Revalorisation plafonds de revenus (+2 %) | Plus de ménages éligibles aux profils Bleu/Jaune |
| Janvier 2026 | Éco-PTZ durée max 20 ans | Mensualités plus faibles |
| Mars 2026 | Contrôle systématique des chantiers > 30 000 € | Visite de conformité après travaux |
| Avril 2026 | CEE : revalorisation des barèmes isolation | +5-10 % sur les primes isolation murs |
| Juillet 2026 | MaPrimeRénov' : nouveau formulaire simplifié | Dossier en ligne plus rapide |
| Septembre 2026 | Parcours Accompagné : plafonds relevés à 75 000 € | Gain maximum de 67 500 € (profil Bleu) |
| Janvier 2027 (annoncé) | Interdiction location DPE F | Obligation de rénover pour les bailleurs |
:::

:::warning Anticipez l'interdiction de location DPE F
Les logements classés F ne pourront plus être loués à compter du 1er janvier 2028. Si vous êtes bailleur d'un bien classé F, vous avez **moins de 2 ans** pour réaliser les travaux. Les aides 2026 sont les plus généreuses jamais proposées — c'est le moment d'agir.
:::

Pour démarrer votre projet de rénovation énergétique et bénéficier de toutes les aides disponibles, demandez un [devis gratuit](/devis) à des artisans RGE près de chez vous. Nous vous accompagnons dans le montage de votre dossier d'aides.`,

      `## Sources et méthodologie

Les montants et barèmes indiqués dans ce guide sont issus de :
- **ANAH / MaPrimeRénov'** — barèmes officiels 2026 (plafonds revalorisés de +2,4 %, taux 10-80 % selon revenus)
- **ADEME** — guide des aides à la rénovation énergétique (2025)
- **Ministère de la Transition écologique** — décrets et arrêtés MaPrimeRénov' 2026
- **Hellio / Quelleenergie.fr** — baromètre barèmes MaPrimeRénov' 2026 et simulateurs d'aide
- **Éco-PTZ** — plafond relevé à 50 000 € en 2024, maintenu en 2026

Dernière mise à jour : avril 2026.`,

      `## FAQ — Aides rénovation énergétique 2026`,
    ],
    faq: [
      {
        question: "MaPrimeRénov' et CEE sont-ils cumulables ?",
        answer:
          "Oui, MaPrimeRénov' et les CEE sont cumulables pour les mêmes travaux. Vous pouvez aussi cumuler avec l'Éco-PTZ et la TVA à 5,5 %. Le seul plafond est que le total des aides ne peut pas dépasser le coût des travaux.",
      },
      {
        question: "Quel est le montant maximum d'aides en 2026 ?",
        answer:
          "En Parcours Accompagné, un ménage très modeste (Bleu) peut obtenir jusqu'à 63 000 € de MaPrimeRénov' (90 % de 70 000 €) + CEE + TVA 5,5 %. Le montant total des aides peut couvrir 100 % du budget pour les profils Bleu et Jaune sur les projets bien montés.",
      },
      {
        question: 'Faut-il un artisan RGE pour obtenir les aides ?',
        answer:
          'Oui, c\'est obligatoire pour MaPrimeRénov\' et les CEE. La qualification RGE doit correspondre aux travaux réalisés (ex : RGE "QualiPAC" pour une PAC, RGE "Qualibat isolation" pour l\'isolation). Vérifiez la certification sur france-renov.gouv.fr.',
      },
      {
        question: 'Peut-on demander les aides pour une résidence secondaire ?',
        answer:
          "MaPrimeRénov' est réservée aux résidences principales. Les CEE sont accessibles pour les résidences secondaires. L'Éco-PTZ est réservé aux résidences principales. La TVA à 5,5 % s'applique à tous les logements de plus de 2 ans (résidence principale ou secondaire).",
      },
      {
        question: "Combien de temps pour recevoir MaPrimeRénov' ?",
        answer:
          "Le délai entre le dépôt du dossier et le versement est de 2 à 4 mois en moyenne. L'instruction du dossier prend 2-6 semaines, puis le versement intervient 4-8 semaines après envoi de la facture finale. Un retard de l'ANAH peut allonger le délai à 6 mois.",
      },
      {
        question: 'Peut-on cumuler les aides avec un crédit immobilier ?',
        answer:
          "Oui, l'Éco-PTZ est compatible avec un crédit immobilier classique. Vous pouvez aussi utiliser un prêt travaux classique pour compléter le financement. Les aides (MaPrimeRénov', CEE) viennent en déduction du montant à financer.",
      },
      {
        question: "Qu'est-ce que Mon Accompagnateur Rénov' (MAR) ?",
        answer:
          "Le MAR est un conseiller agréé par l'ANAH qui vous accompagne dans votre projet de rénovation globale : audit énergétique, plan de travaux, aide au montage des dossiers, suivi du chantier. Il est obligatoire pour le Parcours Accompagné. Son coût (1 500-2 000 €) est pris en charge à 100 % pour les profils Bleu et Jaune.",
      },
      {
        question: 'Les aides sont-elles rétroactives ?',
        answer:
          "Non. MaPrimeRénov' et les CEE doivent être demandés AVANT la signature des devis. Si vous signez d'abord et demandez ensuite, le dossier sera refusé. L'Éco-PTZ peut être demandé après signature du devis mais avant le début des travaux.",
      },
      {
        question: 'Parcours Accompagné ou par geste : lequel choisir ?',
        answer:
          "Le Parcours Accompagné est toujours plus avantageux financièrement si votre projet permet un gain d'au moins 2 classes DPE. Pour un geste isolé (ex : seul changement de chaudière), le parcours par geste est plus simple et rapide. Faites la simulation sur france-renov.gouv.fr.",
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 10. PRIX TOITURE — RÉFECTION COMPLÈTE 2026 (~3 000 mots)
  // ────────────────────────────────────────────────────────────────────────────
  'prix-toiture-refection-complete-2026': {
    title: 'Prix Toiture 2026 : Réfection Complète (Matériaux, Charpente, Isolation)',
    excerpt:
      'Prix par matériau (tuile terre cuite, ardoise, zinc, bac acier), charpente réparation vs remplacement, isolation sous toiture intégrée et diagnostic : quand faut-il refaire sa toiture ?',
    metaTitle: 'Prix Toiture 2026 : Réfection et Matériaux',
    metaDescription:
      'Prix réfection toiture 2026 : tuile 60-120 €/m², ardoise 100-200 €/m², zinc 80-180 €/m². Charpente, isolation, diagnostic complet.',
    image: '📋',
    author: "L'équipe ServicesArtisans",
    authorBio:
      "L'équipe éditoriale de ServicesArtisans analyse les prix du marché et consulte des artisans certifiés pour produire des guides fiables et actualisés.",
    date: '2026-03-28',
    updatedDate: '2026-04-29',
    readTime: '16 min',
    category: 'Tarifs',
    tags: ['toiture', 'couverture', 'charpente', 'tuile', 'ardoise', 'zinc', 'isolation', '2026'],
    keyTakeaways: [
      'Réfection complète (couverture + zinguerie) : 60-200 €/m² selon le matériau',
      'Charpente réparation : 40-150 €/m² — remplacement complet : 80-250 €/m²',
      'Isolation sous toiture (sarking) : 100-200 €/m² — ajouter à la réfection réduit le coût global',
      'Un diagnostic toiture coûte 200-500 € et peut éviter 10 000-30 000 € de dégâts',
      'Durée de vie : tuile terre cuite 50-100 ans, ardoise 75-150 ans, zinc 40-80 ans',
      "La réfection de toiture est éligible à la TVA 10 % et à MaPrimeRénov' si isolation intégrée",
    ],
    content: [
      `## Quand faut-il refaire sa toiture ?

La toiture est l'élément le plus exposé de votre maison : pluie, vent, gel, UV et variations de température l'attaquent en permanence. Une toiture bien entretenue dure 50 à 100 ans (tuile terre cuite) voire 150 ans (ardoise naturelle), mais les signes de dégradation doivent être détectés tôt pour éviter des dégâts structurels coûteux.

**Les 8 signes qui indiquent une réfection nécessaire :**
1. Tuiles/ardoises cassées, fissurées ou manquantes visibles depuis le sol
2. Mousse et lichen envahissants malgré un démoussage récent
3. Traces d'humidité au plafond du dernier étage ou dans les combles
4. Zinguerie (gouttières, chéneaux) percée ou déformée
5. Charpente qui s'affaisse (visible sur la ligne de faîtage)
6. Facture de chauffage en hausse inexpliquée (déperditions par le toit)
7. Âge de la couverture > 40 ans (bac acier), > 50 ans (tuile mécanique), > 80 ans (tuile canal)
8. Diagnostic toiture défavorable par un [couvreur professionnel](/services/couvreur)

:::warning Ne montez JAMAIS sur votre toiture
L'inspection visuelle depuis le sol (jumelles) ou depuis l'intérieur des combles est suffisante pour détecter les problèmes. Les chutes de toit représentent 15 % des accidents mortels dans le BTP. Faites appel à un couvreur professionnel équipé (harnais, échafaudage) pour toute inspection approfondie.
:::`,

      `## Prix par matériau de couverture

### Tuile terre cuite

La tuile terre cuite est le matériau de couverture le plus répandu en France (65 % des toitures). Disponible en de nombreuses formes régionales (canal, plate, romane, mécanique), elle offre un excellent rapport durabilité/prix.

:::budget
| Type de tuile | Prix fourniture au m² | Prix posé au m² | Durée de vie |
| Tuile mécanique (à emboîtement) | 15 – 30 € | 55 – 90 € | 50-70 ans |
| Tuile canal (provençale) | 20 – 40 € | 60 – 100 € | 60-80 ans |
| Tuile plate (Bourgogne, Beauce) | 30 – 60 € | 70 – 120 € | 70-100 ans |
| Tuile romane | 15 – 35 € | 55 – 95 € | 50-70 ans |
:::

### Ardoise

L'ardoise est le matériau noble par excellence, caractéristique du Nord-Ouest (Bretagne, Anjou, Normandie) et des bâtiments historiques.

:::budget
| Type d'ardoise | Prix fourniture au m² | Prix posé au m² | Durée de vie |
| Ardoise naturelle (Espagne) | 30 – 60 € | 100 – 160 € | 75-100 ans |
| Ardoise naturelle (Angers, France) | 50 – 100 € | 130 – 200 € | 100-150 ans |
| Ardoise fibrociment (synthétique) | 15 – 30 € | 60 – 100 € | 30-50 ans |
:::

### Zinc

Le zinc est prisé pour les toitures à faible pente et les bâtiments contemporains. Sa patine naturelle lui donne un aspect élégant avec l'âge.

:::budget
| Type | Prix fourniture au m² | Prix posé au m² | Durée de vie |
| Zinc naturel (joint debout) | 35 – 60 € | 80 – 140 € | 40-60 ans |
| Zinc prépatiné | 40 – 70 € | 90 – 160 € | 50-70 ans |
| Zinc anthra (noir) | 45 – 80 € | 100 – 180 € | 50-80 ans |
:::

### Bac acier

Le bac acier est la solution la plus économique, utilisée principalement pour les garages, dépendances et maisons contemporaines.

:::budget
| Type | Prix fourniture au m² | Prix posé au m² | Durée de vie |
| Bac acier simple peau | 10 – 25 € | 30 – 55 € | 25-40 ans |
| Bac acier double peau (isolé) | 25 – 50 € | 50 – 90 € | 30-50 ans |
| Bac acier imitation tuile | 15 – 35 € | 40 – 70 € | 25-40 ans |
:::

:::tip Quel matériau choisir ?
Le choix du matériau est souvent dicté par le **PLU** de votre commune qui impose un type de couverture (tuile terre cuite dans le Sud, ardoise dans l'Ouest, etc.). Vérifiez le PLU avant tout projet. Si le PLU n'impose rien, le meilleur rapport qualité-prix-durée est la **tuile mécanique terre cuite** (55-90 €/m² posé, 50-70 ans de durée de vie).
:::`,

      `## Charpente : réparation vs remplacement

La charpente est la structure qui porte la couverture. Son état conditionne la faisabilité et le coût de la réfection.

### Diagnostic charpente

Un diagnostic charpente par un professionnel (200-500 €) évalue :
- L'état du bois (pourriture, insectes xylophages, champignons)
- La géométrie (flèche, déformation, affaissement)
- Les assemblages (tenons-mortaises, boulons, connecteurs)
- La ventilation de la sous-face de couverture

### Coûts de réparation

:::budget
| Intervention | Prix moyen | Quand ? |
| Traitement préventif (injection, pulvérisation) | 15 – 30 €/m² | Prévention termites/capricornes |
| Traitement curatif (bois attaqué) | 25 – 50 €/m² | Insectes ou champignons détectés |
| Remplacement d'éléments isolés (pannes, chevrons) | 40 – 100 €/ml | Pièces ponctuellement dégradées |
| Renforcement de charpente (ajout de fermes, jambes de force) | 80 – 200 €/m² | Affaissement, portée insuffisante |
| Remplacement complet de charpente traditionnelle | 120 – 250 €/m² | Charpente irréparable |
| Remplacement par fermettes industrielles | 80 – 150 €/m² | Alternative économique |
:::

### Quand remplacer plutôt que réparer ?

La règle empirique : si plus de **30 % des éléments** de charpente sont dégradés, le remplacement complet est plus économique que la réparation. En dessous de 30 %, la réparation ciblée suffit.

:::warning Attention à l'amiante dans les toitures
Les couvertures en fibrociment installées avant 1997 contiennent de l'amiante. Le désamiantage est obligatoire avant toute intervention et coûte **30-80 €/m²** en supplément. Faites réaliser un diagnostic amiante (150-300 €) avant tout devis de réfection.
:::`,

      `## Isolation sous toiture intégrée à la réfection

Profiter d'une réfection de toiture pour isoler par l'extérieur (sarking) est une **opportunité unique** de traiter la première source de déperditions thermiques (25-30 % des pertes) sans perte de surface habitable et sans nuisance à l'intérieur.

### Le sarking (isolation par l'extérieur de la toiture)

Le sarking consiste à poser un panneau isolant rigide (polyuréthane, fibre de bois) entre la charpente et la couverture :

:::budget
| Isolant sarking | Épaisseur pour R=6 | Prix posé au m² (hors couverture) |
| Polyuréthane (PU) | 12-14 cm | 80 – 140 € |
| Fibre de bois | 18-22 cm | 100 – 180 € |
| Polystyrène extrudé (XPS) | 16-18 cm | 70 – 120 € |
:::

### Surcoût réel du sarking lors d'une réfection

Le coût du sarking **en plus** d'une réfection est bien inférieur au coût du sarking seul, car l'échafaudage et la dépose de couverture sont déjà facturés :

:::budget
| Scénario | Coût au m² |
| Réfection seule (tuile mécanique) | 70 – 100 € |
| Sarking seul (sans réfection) | 150 – 250 € |
| Réfection + sarking combinés | 140 – 220 € |
| **Surcoût réel du sarking** | **+60 – 120 €/m²** |
:::

Pour une toiture de 120 m², le surcoût du sarking est de **7 200 à 14 400 €**, partiellement couvert par MaPrimeRénov' (25 €/m² profil Bleu = 3 000 €) et les CEE (5-10 €/m² = 600-1 200 €).

:::expert Parole d'expert — Fabien Moreau, couvreur-charpentier depuis 18 ans
"Quand un client me demande une réfection de toiture et que les combles ne sont pas isolés, je recommande systématiquement le sarking. Le surcoût de 60-120 €/m² est dérisoire comparé au coût d'une isolation ultérieure (150-250 €/m²) qui nécessiterait de tout redéposer. C'est maintenant ou jamais."
:::`,

      `## Budget complet d'une réfection de toiture

### Exemple chiffré : maison de 100 m² au sol (120 m² de toiture)

:::budget
| Poste | Sans isolation | Avec sarking |
| Échafaudage (location 3-4 semaines) | 2 000 – 4 000 € | 2 000 – 4 000 € |
| Dépose ancienne couverture | 1 500 – 3 000 € | 1 500 – 3 000 € |
| Désamiantage si fibrociment | 3 600 – 9 600 € | 3 600 – 9 600 € |
| Réparation charpente (10 % éléments) | 2 000 – 5 000 € | 2 000 – 5 000 € |
| Isolation sarking (120 m²) | — | 9 600 – 16 800 € |
| Écran sous-toiture HPV | 600 – 1 200 € | Inclus dans sarking |
| Couverture tuile mécanique | 6 600 – 10 800 € | 6 600 – 10 800 € |
| Zinguerie (gouttières, chéneaux, faîtage) | 2 000 – 5 000 € | 2 000 – 5 000 € |
| Velux / fenêtres de toit (×3) | 2 000 – 5 000 € | 2 000 – 5 000 € |
| **TOTAL (hors amiante)** | **16 700 – 34 000 €** | **25 700 – 49 600 €** |
:::

:::tip TVA applicable
La réfection de toiture d'un logement de plus de 2 ans bénéficie de la **TVA à 10 %** (au lieu de 20 %). Si l'isolation est intégrée (sarking), cette partie bénéficie de la **TVA à 5,5 %**. L'économie de TVA représente 1 500 à 4 000 € sur un projet de réfection + isolation.
:::`,

      `## Entretien pour prolonger la durée de vie

Un entretien régulier de la toiture prolonge sa durée de vie de 20 à 30 % et évite les réfections prématurées :

**Tous les ans :**
- Nettoyage des gouttières et chéneaux (automne, après chute des feuilles)
- Inspection visuelle depuis le sol (jumelles) : tuiles déplacées, mousse, fissures

**Tous les 5 ans :**
- Démoussage de la couverture : 15-25 €/m² (traitement hydrofuge inclus)
- Vérification des points de zinguerie (raccords, solins, abergements de cheminée)

**Tous les 10 ans :**
- Inspection de la charpente (vérification insectes, champignons)
- Remplacement des tuiles/ardoises cassées
- Refonte des solins et joints de cheminée si nécessaire

:::budget
| Entretien | Fréquence | Prix moyen |
| Nettoyage gouttières | Annuel | 100 – 300 € |
| Démoussage + hydrofuge | Tous les 5 ans | 15 – 25 €/m² |
| Remplacement tuiles cassées (< 5 %) | Ponctuel | 200 – 800 € |
| Réfection solins cheminée | Tous les 10-15 ans | 400 – 1 200 € |
| Diagnostic charpente | Tous les 10 ans | 200 – 500 € |
:::

Pour trouver un [couvreur qualifié](/services/couvreur) près de chez vous, utilisez notre annuaire d'artisans vérifiés. Chaque couvreur référencé dispose d'une assurance décennale en cours de validité. Demandez vos [devis gratuits](/devis/couvreur) en ligne.`,

      `## Sources et méthodologie

Les prix indiqués dans ce guide sont issus de :
- **FFB** (Fédération Française du Bâtiment) — mercuriale des prix du bâtiment 2025-2026
- **CAPEB** — enquête annuelle sur les tarifs artisanaux (2025)
- **Travaux.com / Helloartisan** — baromètre prix toiture 2026 : 120-300 €/m² selon matériau
- **ADEME** — guide isolation toiture (2025) : primes CEE jusqu'à 13 €/m²
- **ANAH / MaPrimeRénov'** — barèmes officiels 2026 pour l'isolation de toiture
- Comparaison de devis collectés via ServicesArtisans

Les fourchettes tiennent compte des écarts régionaux (coefficient IDF × 1.3). Dernière mise à jour : avril 2026.`,

      `## FAQ — Prix toiture réfection complète 2026`,
    ],
    faq: [
      {
        question: 'Quel est le prix moyen pour refaire une toiture de 100 m² ?',
        answer:
          "Le prix moyen d'une réfection de toiture de 100 m² (120 m² de couverture) se situe entre 16 000 et 34 000 € selon le matériau et l'état de la charpente. Avec isolation sarking intégrée, comptez 25 000 à 50 000 €.",
      },
      {
        question: 'Quel est le matériau de toiture le moins cher ?',
        answer:
          'Le bac acier simple peau est le moins cher (30-55 €/m² posé) mais sa durée de vie est limitée (25-40 ans). En couverture traditionnelle, la tuile mécanique est la plus économique (55-90 €/m² posé) avec une durée de vie de 50-70 ans.',
      },
      {
        question: 'Combien de temps dure une réfection de toiture ?',
        answer:
          'Une réfection simple (couverture seule) prend 1 à 3 semaines pour une maison individuelle. Avec isolation sarking, comptez 2 à 4 semaines. Avec remplacement de charpente, le chantier peut durer 4 à 6 semaines.',
      },
      {
        question: 'Faut-il un permis pour refaire sa toiture ?',
        answer:
          "Un simple remplacement à l'identique (même matériau, même aspect) ne nécessite aucune autorisation. Un changement de matériau ou de couleur nécessite une déclaration préalable de travaux. En zone ABF, l'avis de l'Architecte des Bâtiments de France est obligatoire.",
      },
      {
        question: 'Quelles aides pour refaire sa toiture ?',
        answer:
          "La réfection de toiture seule (sans isolation) bénéficie uniquement de la TVA à 10 %. Avec isolation intégrée : MaPrimeRénov' (7-75 €/m²), CEE (5-10 €/m²), TVA 5,5 % sur la partie isolation et Éco-PTZ. L'isolation sous toiture est le geste le plus aidé.",
      },
      {
        question: 'Comment savoir si ma charpente est saine ?',
        answer:
          'Inspectez visuellement depuis les combles : bois noirci (champignons), petits trous (vrillettes, capricornes), sciure au sol (insectes actifs), déformation visible. Pour un diagnostic fiable, faites appel à un charpentier ou un expert bois (200-500 €).',
      },
      {
        question: 'Peut-on refaire sa toiture en hiver ?',
        answer:
          "Oui, les couvreurs travaillent toute l'année. Les seules contraintes : pas de pose de tuiles par gel (risque de casse), pas de travaux d'étanchéité par pluie continue. Les meilleures périodes sont mars-juin et septembre-novembre. Évitez juillet-août (congés, forte chaleur sous les toits).",
      },
      {
        question: 'Toiture en fibrociment : que faire ?',
        answer:
          "Si votre couverture en fibrociment date d'avant 1997, elle contient probablement de l'amiante. Un diagnostic amiante (150-300 €) est obligatoire avant toute intervention. Le désamiantage coûte 30-80 €/m² en supplément de la réfection. Ne tentez jamais de retirer vous-même des plaques d'amiante-ciment.",
      },
      {
        question: 'Tuile ou ardoise : que choisir ?',
        answer:
          "La tuile terre cuite est moins chère (55-120 €/m² posé vs 100-200 €/m² pour l'ardoise) et plus facile à poser/réparer. L'ardoise offre une durée de vie supérieure (75-150 ans vs 50-100 ans) et une esthétique unique. Le choix est souvent dicté par le PLU de votre commune et le style architectural local.",
      },
    ],
  },
}
