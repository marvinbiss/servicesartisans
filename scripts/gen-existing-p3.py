#!/usr/bin/env python3
"""Generate existing-articles Part 3 (articles 13-20)."""
import json

articles = []

# ─── Article 13: prix-plombier-2026-tarifs-horaires ───
articles.append({
    "slug": "prix-plombier-2026-tarifs-horaires",
    "title": "Prix plombier 2026 : tarifs horaires et coût des interventions",
    "excerpt": "Tarif horaire moyen, coût d'un dépannage, prix des installations... Tous les tarifs plomberie actualisés pour 2026.",
    "content": [
        "Les tarifs des plombiers évoluent chaque année en fonction de l'inflation, du coût des matériaux et de la demande. En 2026, les prix restent stables par rapport à 2025, avec une légère hausse de 2 à 3 % sur la main-d'œuvre. Voici le guide complet et actualisé des prix de plomberie pour vous aider à estimer votre budget et [comparer efficacement les devis](/blog/devis-travaux-comment-comparer-choisir).",
        "## Tarif horaire moyen en 2026\n\n### Les fourchettes par région\n\nLe tarif horaire moyen d'un plombier en 2026 est de 45 à 75 euros HT en province et de 65 à 95 euros HT en Île-de-France. Ces tarifs n'incluent pas les fournitures ni les frais de déplacement.\n\n### Les frais de déplacement\n\nLe forfait déplacement varie de 20 à 50 € selon la distance. Certains plombiers l'incluent dans le tarif horaire, d'autres le facturent en supplément. Vérifiez ce point dans le devis.\n\n:::budget\n| Zone | Tarif horaire HT | Déplacement |\n| Province (ville moyenne) | 45 - 65 € | 20 - 30 € |\n| Grande métropole | 55 - 75 € | 25 - 40 € |\n| Île-de-France | 65 - 95 € | 30 - 50 € |\n:::",
        "## Prix des dépannages courants\n\n### Interventions fréquentes\n\n:::budget\n| Dépannage | Prix moyen (MO + fournitures) |\n| Débouchage simple (ventouse, furet) | 90 - 200 € |\n| Débouchage haute pression | 200 - 450 € |\n| Réparation de fuite visible | 120 - 350 € |\n| Réparation de fuite encastrée | 250 - 600 € |\n| Remplacement de chasse d'eau | 100 - 200 € |\n| Remplacement de robinet | 80 - 180 € |\n| Remplacement de cumulus | 400 - 1 200 € |\n:::\n\n:::warning Attention\nLes prix ci-dessus s'entendent hors urgence. Les majorations nuit (20h-8h), week-end et jours fériés peuvent augmenter la facture de 50 à 100 %. Privilégiez les interventions en semaine.\n:::",
        "## Prix des installations neuves\n\n### Équipements et raccordements\n\n| Installation | Prix moyen (pose comprise) |\n| --- | --- |\n| Salle de bain complète | 3 000 - 8 000 € |\n| Cuisine (raccordements) | 500 - 2 000 € |\n| Raccordement tout-à-l'égout | 3 000 - 10 000 € |\n| Chauffe-eau thermodynamique | 2 500 - 4 500 € |\n| Adoucisseur d'eau | 800 - 2 000 € |\n| WC suspendu | 400 - 800 € |\n\nConsultez notre guide pour [choisir votre salle de bain](/blog/renovation-salle-de-bain-budget-etapes) avec les budgets détaillés.\n\n:::info Bon à savoir\nPour les installations neuves, la TVA est de 10 % dans les logements de plus de 2 ans. Si l'installation inclut un équipement performant sur le plan énergétique (chauffe-eau thermodynamique), la TVA est de 5,5 %.\n:::",
        "## Tarifs d'urgence et conseils pour économiser\n\n### Les majorations d'urgence\n\nLes interventions en urgence sont majorées de 50 à 100 %. Prévoyez un budget de 100 à 200 euros pour un simple déplacement d'urgence, avant toute intervention. Un dépannage de nuit peut facilement atteindre 400 à 600 €.\n\n### Comment réduire la facture\n\n1. **Comparez 3 devis minimum** via [ServicesArtisans](/blog/comment-choisir-son-plombier)\n2. **Planifiez** vos travaux en semaine, aux heures ouvrables\n3. **Regroupez** les petites interventions en une seule visite\n4. **Entretenez** : un détartrage annuel du chauffe-eau évite les pannes coûteuses\n5. **Apprenez** les gestes de base : changer un joint ne nécessite pas un plombier\n\n:::tip Conseil pro\nEn cas de fuite, fermez le robinet d'arrêt avant d'appeler un plombier. Cela limite les dégâts et vous permet de prendre le temps de comparer les devis au lieu de payer le tarif d'urgence.\n:::\n\n:::takeaway\n- Tarif horaire : 45-75 € HT en province, 65-95 € HT en Île-de-France\n- Dépannage courant : 100-350 € selon la complexité\n- Les urgences doublent la facture : planifiez quand c'est possible\n- Installation salle de bain complète : 3 000-8 000 €\n- Comparez toujours au moins 3 devis avant de vous engager\n:::",
    ],
    "image": "/images/blog/prix-plombier.jpg",
    "author": "Claire Dubois",
    "authorBio": "Claire Dubois, experte en économie de la construction, analyse les prix du marché et les aides financières pour informer les consommateurs.",
    "date": "2026-02-08",
    "updatedDate": "2026-02-12",
    "readTime": "10 min",
    "category": "Tarifs",
    "tags": ["Plomberie", "Tarifs", "Prix"],
    "faq": [
        {"question": "Le tarif horaire inclut-il les fournitures ?", "answer": "Non, le tarif horaire couvre uniquement la main-d'œuvre. Les fournitures (joints, raccords, tuyaux) et les équipements sont facturés en supplément. Vérifiez ce point dans le devis."},
        {"question": "Un plombier peut-il facturer le déplacement même sans intervention ?", "answer": "Oui, si cela a été convenu au préalable. Pour un dépannage d'urgence, le forfait déplacement (30-80 €) est généralement dû même si l'intervention n'est pas réalisée."},
        {"question": "Les prix sont-ils plus élevés en copropriété ?", "answer": "Les tarifs de main-d'œuvre sont identiques, mais les interventions en copropriété peuvent être plus complexes (accès aux colonnes montantes, coordination avec le syndic) et donc plus longues."},
    ],
})

# ─── Article 14: aide-maprimerenov-2026-montants-conditions ───
articles.append({
    "slug": "aide-maprimerenov-2026-montants-conditions",
    "title": "Aide MaPrimeRénov' 2026 : montants, conditions et démarches",
    "excerpt": "Montants actualisés, conditions d'éligibilité, étapes de la demande... Le guide complet pour obtenir MaPrimeRénov' en 2026 et maximiser vos aides.",
    "content": [
        "MaPrimeRénov' est l'aide phare du gouvernement pour la rénovation énergétique. En 2026, les barèmes ont été révisés pour encourager les rénovations globales plutôt que les travaux isolés. Avec un budget national de plus de 4 milliards d'euros, cette aide permet de financer jusqu'à 90 % du coût des travaux pour les ménages les plus modestes. Voici le guide complet pour en bénéficier.",
        "## Qui peut en bénéficier ?\n\n### Les conditions d'éligibilité\n\nTous les propriétaires peuvent prétendre à MaPrimeRénov', quel que soit leur niveau de revenus :\n\n- **Propriétaires occupants** : résidence principale, logement de plus de 15 ans\n- **Propriétaires bailleurs** : engagement de location pendant 6 ans minimum, jusqu'à 3 logements\n- **Copropriétés** : travaux sur les parties communes votés en AG\n\n### Les conditions sur le logement\n\n- Logement de plus de 15 ans (2 ans pour le remplacement d'une chaudière fioul)\n- Résidence principale (occupée au moins 8 mois par an)\n- Travaux réalisés par un artisan RGE\n\n:::info Bon à savoir\nLes résidences secondaires ne sont pas éligibles à MaPrimeRénov'. Cependant, elles peuvent bénéficier des CEE et de la TVA réduite si elles remplissent les conditions d'ancienneté.\n:::",
        "## Les montants selon les revenus et les travaux\n\n### Le barème 2026\n\n:::budget\n| Travaux | Bleu (très modeste) | Jaune (modeste) | Violet (intermédiaire) | Rose (aisé) |\n| Isolation combles | 25 €/m² | 20 €/m² | 15 €/m² | 7 €/m² |\n| Isolation murs (ITE) | 75 €/m² | 60 €/m² | 40 €/m² | 15 €/m² |\n| PAC air-eau | 5 000 € | 4 000 € | 3 000 € | 0 € |\n| Chaudière biomasse | 7 000 € | 5 500 € | 3 000 € | 0 € |\n| VMC double flux | 2 500 € | 2 000 € | 1 500 € | 0 € |\n:::\n\n### Le Parcours accompagné (rénovation globale)\n\nPour un gain d'au moins 2 classes DPE, le Parcours accompagné offre des taux de prise en charge majorés :\n\n- **Bleu** : 80 à 90 % du coût, plafonné à 63 000 €\n- **Jaune** : 60 à 75 %, plafonné à 54 000 €\n- **Violet** : 45 à 60 %, plafonné à 42 000 €\n- **Rose** : 30 à 40 %, plafonné à 30 000 €\n\n:::tip Conseil pro\nLe Parcours accompagné est beaucoup plus avantageux que le Parcours par geste. Pour une maison classée F, le passage en classe C peut être financé à 80-90 % pour les ménages modestes, contre seulement 40-60 % en gestes isolés.\n:::",
        "## Les travaux éligibles en détail\n\n### Liste des travaux\n\n- **Isolation thermique** : combles, murs, planchers, fenêtres, portes\n- **Changement de chauffage** : PAC, chaudière biomasse, poêle à granulés, réseau de chaleur\n- **Ventilation** : VMC double flux\n- **Audit énergétique** : réalisé par un professionnel RGE Études\n- **Rénovation globale** : bouquet de travaux visant un gain ≥ 2 classes DPE\n\nTous les travaux doivent être réalisés par un artisan [certifié RGE](/blog/label-rge-artisan-travaux-energetiques).\n\n## Comment faire la demande\n\n### Les étapes pas à pas\n\n1. **Créez votre compte** sur maprimerenov.gouv.fr avec votre numéro fiscal\n2. **Obtenez des devis** d'artisans RGE (au moins 1, idéalement 3 pour comparer)\n3. **Déposez votre dossier** en ligne avec les devis et les justificatifs\n4. **Attendez l'accord** (2 à 8 semaines selon le parcours) — ne commencez PAS les travaux avant\n5. **Réalisez les travaux** dans un délai de 1 an (Parcours par geste) ou 2 ans (Parcours accompagné)\n6. **Envoyez la facture finale** pour déclencher le versement de la prime\n\n:::warning Attention\nNe commencez jamais les travaux avant d'avoir reçu la notification d'accord de MaPrimeRénov'. Un chantier démarré prématurément entraîne le rejet automatique de votre demande, sans possibilité de recours.\n:::\n\nPour optimiser votre financement en cumulant toutes les aides, consultez notre [guide du cumul des aides 2026](/blog/aides-renovation-2026-cumul-guide).\n\n:::takeaway\n- MaPrimeRénov' est accessible à tous les propriétaires, sans condition de revenus\n- Le Parcours accompagné offre les aides les plus généreuses (jusqu'à 63 000 €)\n- Les travaux doivent être réalisés par un artisan RGE\n- Ne commencez jamais les travaux avant l'accord officiel\n- Cumulez avec les CEE, l'éco-PTZ et les aides locales pour minimiser votre reste à charge\n:::",
    ],
    "image": "/images/blog/maprimerenov.jpg",
    "author": "Claire Dubois",
    "authorBio": "Claire Dubois, experte en économie de la construction, analyse les prix du marché et les aides financières pour informer les consommateurs.",
    "date": "2026-02-07",
    "updatedDate": "2026-02-12",
    "readTime": "13 min",
    "category": "Aides & Subventions",
    "tags": ["MaPrimeRenov", "Aides", "Renovation"],
    "faq": [
        {"question": "MaPrimeRénov' est-elle cumulable avec les CEE ?", "answer": "Oui, MaPrimeRénov' est parfaitement cumulable avec les CEE, l'éco-PTZ, la TVA à 5,5 % et les aides locales. Le total des aides ne peut pas dépasser le coût TTC des travaux."},
        {"question": "Combien de temps faut-il pour recevoir MaPrimeRénov' ?", "answer": "Le délai d'instruction est de 2 à 4 semaines (Parcours par geste) ou 4 à 8 semaines (Parcours accompagné). Le versement intervient 2 à 4 semaines après l'envoi de la facture."},
        {"question": "Peut-on faire la demande après avoir commencé les travaux ?", "answer": "Non, le dossier doit être déposé et l'accord reçu AVANT le début des travaux. Un chantier démarré prématurément entraîne un rejet automatique."},
    ],
})

# ─── Article 15: comment-verifier-artisan-avant-engager ───
articles.append({
    "slug": "comment-verifier-artisan-avant-engager",
    "title": "Comment vérifier un artisan avant de l'engager ?",
    "excerpt": "SIRET, assurance décennale, qualifications... Les vérifications indispensables pour éviter les mauvaises surprises et s'assurer du sérieux d'un professionnel.",
    "content": [
        "Engager un artisan sans vérification préalable est un risque majeur. Selon le Médiateur de la consommation dans le bâtiment, les litiges avec les artisans représentent plus de 25 % des saisines. La plupart auraient pu être évités par de simples vérifications en amont. Voici les étapes essentielles pour s'assurer du sérieux d'un professionnel avant de lui confier vos travaux.",
        "## Vérifiez le numéro SIRET\n\n### La première vérification\n\nLe SIRET est la carte d'identité de l'entreprise. Vérifiez-le sur ServicesArtisans ou sur le site de l'INSEE (sirene.fr). Il confirme que l'entreprise est bien immatriculée et en activité.\n\n### Ce que révèle le SIRET\n\n- **Existence légale** de l'entreprise\n- **Code APE** : l'activité déclarée correspond-elle au métier exercé ?\n- **Date de création** : une entreprise trop récente (moins de 2 ans) présente un risque supérieur\n- **Statut** : en activité, en liquidation, radiée\n\nPour en savoir plus sur l'importance du SIREN, consultez notre article dédié : [Trouver un artisan vérifié](/blog/trouver-artisan-verifie-siren).\n\n:::warning Attention\nUn artisan peut avoir un SIRET valide mais exercer une activité différente de celle déclarée. Vérifiez que le code APE (activité principale) correspond bien au métier pour lequel vous le sollicitez.\n:::",
        "## Demandez les attestations d'assurance\n\n### La RC professionnelle\n\nTout artisan doit pouvoir fournir une attestation d'assurance responsabilité civile professionnelle à jour. Cette assurance couvre les dommages causés aux tiers pendant les travaux.\n\n### La garantie décennale\n\nPour les travaux de construction ou de rénovation touchant au gros œuvre, la [garantie décennale](/blog/garantie-decennale-tout-savoir) est obligatoire (article 1792 du Code civil). L'attestation doit mentionner :\n\n- Le nom de l'assureur et le numéro de police\n- La période de validité\n- Les activités couvertes\n- La zone géographique\n\n:::tip Conseil pro\nAppelez directement l'assureur mentionné sur l'attestation pour confirmer que la police est toujours en cours. Certains artisans présentent des attestations expirées ou falsifiées.\n:::",
        "## Vérifiez les qualifications\n\n### Les certifications clés\n\n- **RGE** (Reconnu Garant de l'Environnement) : obligatoire pour les travaux énergétiques éligibles aux aides. Vérifiez sur france-renov.gouv.fr. Voir notre [guide du label RGE](/blog/label-rge-artisan-travaux-energetiques)\n- **Qualibat** : certification généraliste du bâtiment, vérifiable sur qualibat.com\n- **Qualifelec** : pour les travaux d'électricité, vérifiable sur qualifelec.fr\n- **Qualit'EnR** : pour les énergies renouvelables (PAC, solaire, bois)\n\nPour un panorama complet, consultez notre guide des [certifications du bâtiment](/blog/qualibat-qualifelec-certifications-batiment).\n\n## Consultez les références et avis\n\n### Les preuves du savoir-faire\n\nDemandez des photos de chantiers précédents et des contacts de clients satisfaits. Un bon artisan est fier de montrer son travail. Sur ServicesArtisans, les avis sont vérifiés et publiés après confirmation de l'intervention.\n\n:::info Bon à savoir\nUn artisan qui refuse de fournir des références doit éveiller votre suspicion. Les professionnels sérieux disposent d'un portfolio de réalisations et de clients satisfaits prêts à témoigner.\n:::\n\n:::takeaway\n- Vérifiez le SIRET sur sirene.fr ou ServicesArtisans : c'est la première étape\n- Demandez les attestations d'assurance RC Pro et décennale en cours de validité\n- Contrôlez les certifications sur les sites officiels des organismes\n- Demandez des références de chantiers similaires au vôtre\n- Comparez au moins 3 devis détaillés avant de vous engager\n- Un artisan qui refuse de fournir ces documents ne doit pas être retenu\n:::",
    ],
    "image": "/images/blog/verifier-artisan.jpg",
    "author": "Sophie Martin",
    "authorBio": "Sophie Martin, rédactrice spécialisée en rénovation et habitat, accompagne les particuliers dans leurs projets depuis plus de 8 ans.",
    "date": "2026-02-06",
    "updatedDate": "2026-02-11",
    "readTime": "11 min",
    "category": "Conseils",
    "tags": ["Verification", "Artisans", "Conseils"],
    "faq": [
        {"question": "Combien de temps prend la vérification d'un artisan ?", "answer": "Les vérifications de base (SIRET, assurance, qualifications) prennent moins de 30 minutes. Sur ServicesArtisans, ces vérifications sont effectuées automatiquement pour chaque professionnel référencé."},
        {"question": "Que faire si l'artisan refuse de fournir son attestation d'assurance ?", "answer": "Ne l'engagez pas. Le refus de fournir une attestation d'assurance est un signal d'alerte majeur. Un professionnel sérieux et assuré n'a aucune raison de refuser cette demande."},
        {"question": "Les avis en ligne sont-ils fiables ?", "answer": "La fiabilité varie selon les plateformes. Sur ServicesArtisans, les avis sont publiés uniquement après vérification de l'intervention. Les avis Google sont moins contrôlés. Croisez toujours plusieurs sources."},
    ],
})

# ─── Article 16: travaux-renovation-energetique-par-ou-commencer ───
articles.append({
    "slug": "travaux-renovation-energetique-par-ou-commencer",
    "title": "Travaux de rénovation énergétique : par où commencer ?",
    "excerpt": "Isolation, chauffage, ventilation... Découvrez l'ordre optimal des travaux de rénovation énergétique pour maximiser les économies et les aides financières.",
    "content": [
        "La rénovation énergétique est un investissement rentable : selon l'ADEME, elle permet de réduire la facture énergétique de 40 à 60 % et de valoriser le bien de 5 à 15 %. Mais l'ordre des travaux est déterminant pour maximiser les économies et éviter les dépenses inutiles. Voici la marche à suivre, étape par étape.",
        "## 1. L'audit énergétique : le point de départ\n\n### Pourquoi un audit ?\n\nCommencez par un audit énergétique pour identifier les points faibles de votre logement. Contrairement au DPE (simple étiquette énergétique), l'audit propose des scénarios de travaux chiffrés et hiérarchisés.\n\n### L'audit est-il obligatoire ?\n\nL'audit est désormais obligatoire pour les logements classés F ou G en cas de vente ([depuis avril 2023](/blog/audit-energetique-dpe-obligations-2026)), et pour les logements classés E depuis janvier 2025. Pour MaPrimeRénov' Parcours accompagné, un audit est systématiquement réalisé par l'Accompagnateur Rénov'.\n\n### Coût et prestataires\n\nComptez 800 à 1 500 € pour un audit complet d'une maison individuelle. Il doit être réalisé par un diagnostiqueur certifié RGE Études ou un bureau d'études thermiques.\n\n:::tip Conseil pro\nL'audit énergétique est éligible à MaPrimeRénov' (jusqu'à 500 € d'aide). C'est un investissement rentable qui optimise la séquence de travaux et maximise les économies.\n:::",
        "## 2. L'isolation en priorité absolue\n\n### Isolez d'abord, chauffez ensuite\n\nC'est la règle d'or de la rénovation énergétique. Une maison bien [isolée](/blog/isolation-thermique-guide) nécessite un système de chauffage moins puissant, donc moins coûteux à l'achat et à l'usage. L'ordre de priorité :\n\n1. **Combles et toiture** : 25-30 % des déperditions\n2. **Murs extérieurs** : 20-25 % des déperditions\n3. **Fenêtres et portes** : 10-15 % des déperditions\n4. **Plancher bas** : 7-10 % des déperditions\n\n:::warning Attention\nNe remplacez pas votre chaudière avant d'avoir isolé. Une PAC dimensionnée pour une maison mal isolée sera surdimensionnée après isolation, ce qui réduit sa performance et sa durée de vie.\n:::\n\n## 3. La ventilation\n\n### Un maillon souvent négligé\n\nUne bonne isolation nécessite une ventilation adéquate. Sans renouvellement d'air suffisant, l'humidité s'accumule et dégrade la qualité de l'air intérieur et les matériaux. Installez une VMC double flux pour renouveler l'air sans perdre de chaleur : elle récupère jusqu'à 90 % de la chaleur de l'air extrait.\n\n## 4. Le chauffage\n\n### Dimensionner au juste besoin\n\nUne fois l'enveloppe du bâtiment traitée, dimensionnez votre nouveau système de [chauffage](/blog/chauffage-solution-economique) en fonction des besoins réels du logement isolé. Un bureau d'études thermiques calculera la puissance nécessaire.\n\n## 5. Les énergies renouvelables\n\n### Le complément idéal\n\nEn complément, envisagez l'installation de panneaux solaires photovoltaïques ou thermiques pour produire votre propre énergie et réduire encore davantage votre facture.\n\n:::info Bon à savoir\nLa rénovation globale (isolation + ventilation + chauffage) est financièrement plus avantageuse que les travaux par geste. Le [Parcours accompagné de MaPrimeRénov'](/blog/aide-maprimerenov-2026-montants-conditions) peut financer jusqu'à 90 % du coût total pour les ménages modestes.\n:::\n\n:::takeaway\n- Commencez par un audit énergétique pour hiérarchiser les travaux\n- Isolez d'abord (combles, murs, fenêtres) avant de changer le chauffage\n- Ne négligez pas la ventilation : indispensable après isolation\n- Dimensionnez le chauffage en fonction des besoins réels après isolation\n- Privilégiez la rénovation globale pour maximiser les aides\n- Tous les travaux doivent être réalisés par un artisan RGE\n:::",
    ],
    "image": "/images/blog/renovation-energetique.jpg",
    "author": "Marc Lefebvre",
    "authorBio": "Marc Lefebvre, ingénieur thermicien et rédacteur technique, vulgarise les aspects complexes de la rénovation énergétique.",
    "date": "2026-02-04",
    "updatedDate": "2026-02-11",
    "readTime": "12 min",
    "category": "Guides",
    "tags": ["Renovation", "Energie", "Travaux"],
    "faq": [
        {"question": "Faut-il isoler avant de changer le chauffage ?", "answer": "Oui, c'est la règle d'or. L'isolation réduit les besoins en chauffage, ce qui permet de dimensionner un système moins puissant et moins coûteux. Inverser l'ordre conduit à un surdimensionnement du chauffage."},
        {"question": "Quel est le retour sur investissement d'une rénovation énergétique ?", "answer": "Le retour sur investissement dépend des travaux et des aides obtenues. En moyenne, une rénovation globale est amortie en 8 à 15 ans grâce aux économies d'énergie. Avec les aides (MaPrimeRénov', CEE), le retour peut descendre à 3-5 ans."},
        {"question": "La rénovation énergétique augmente-t-elle la valeur du bien ?", "answer": "Oui, de 5 à 15 % selon les études. Un logement bien classé au DPE (A ou B) se vend plus facilement et à un prix supérieur. À l'inverse, les passoires thermiques (F, G) subissent une décote de 10 à 20 %."},
    ],
})

# ─── Article 17: devis-travaux-comment-comparer-choisir ───
articles.append({
    "slug": "devis-travaux-comment-comparer-choisir",
    "title": "Devis travaux : comment comparer et choisir ?",
    "excerpt": "Mentions obligatoires, pièges à éviter, critères de comparaison... Apprenez à analyser un devis comme un professionnel pour faire le meilleur choix.",
    "content": [
        "Comparer des devis de travaux ne se résume pas à regarder le prix total. Selon les professionnels du bâtiment, le devis le moins cher est rarement le meilleur choix : il cache souvent des prestations manquantes, des matériaux bas de gamme ou des délais irréalistes. Voici une méthode rigoureuse pour analyser et comparer efficacement vos devis.",
        "## Vérifiez les mentions obligatoires\n\n### La conformité du document\n\nDate, coordonnées, SIRET, détail des prestations, prix HT et TTC, conditions de paiement, durée de validité... Un devis incomplet n'est pas un bon signe. Consultez notre guide détaillé sur [comment lire un devis](/blog/devis-travaux-comprendre) pour la liste complète.\n\n:::warning Attention\nUn devis sans SIRET, sans détail des prestations ou sans taux de TVA est non conforme à la réglementation. Refusez-le et demandez un document complet. C'est un premier filtre efficace pour éliminer les artisans peu sérieux.\n:::",
        "## Comparez poste par poste\n\n### La méthode de comparaison\n\nNe comparez pas uniquement les totaux. Décomposez chaque devis poste par poste :\n\n- **Main-d'œuvre** : tarif horaire ou forfait par prestation\n- **Fournitures** : marque, référence, quantité, prix unitaire\n- **Déplacements** : forfait ou au réel\n- **Frais annexes** : nettoyage fin de chantier, évacuation des déchets, location d'échafaudage\n\n### Créez un tableau comparatif\n\n| Poste | Devis A | Devis B | Devis C |\n| --- | --- | --- | --- |\n| Main-d'œuvre | 2 500 € | 2 800 € | 2 200 € |\n| Fournitures | 3 000 € | 2 500 € | 2 000 € |\n| Déplacement | Inclus | 150 € | Inclus |\n| Nettoyage | Inclus | Non mentionné | 200 € |\n| **Total TTC** | **6 600 €** | **6 540 €** | **5 280 €** |\n\n:::tip Conseil pro\nLe devis C semble le moins cher, mais ses fournitures sont 33 % moins chères que le devis A. Vérifiez les références des matériaux : un prix bas peut signifier une qualité inférieure qui coûtera plus cher à terme (remplacement prématuré, mauvaises performances).\n:::",
        "## Attention aux prestations manquantes\n\n### Le piège du devis incomplet\n\nUn devis moins cher peut simplement omettre certaines prestations. Vérifiez que tous les devis couvrent le même périmètre de travaux :\n\n- Préparation des supports (ponçage, enduit, sous-couche)\n- Évacuation des gravats et déchets\n- Nettoyage de fin de chantier\n- Protection des surfaces non concernées\n- Finitions (joints, plinthes, raccords)\n\n## Le prix n'est pas tout\n\n### Les critères qualitatifs\n\nPrenez en compte des critères au-delà du prix :\n\n- **Réactivité** de l'artisan : temps de réponse, disponibilité\n- **Qualifications** : certifications, labels, formations\n- **Références** : photos de chantiers, avis clients\n- **Délais** : date de début et durée estimée\n- **Garanties** : assurances, conditions de réception\n- **Clarté du devis** : un devis clair reflète un artisan organisé\n\n:::info Bon à savoir\nUn artisan qui prend le temps de vous expliquer son devis, de répondre à vos questions et de visiter le chantier avant de chiffrer est généralement plus fiable qu'un artisan qui envoie un devis standard par email sans visite.\n:::\n\n:::takeaway\n- Ne comparez jamais uniquement les totaux : analysez poste par poste\n- Vérifiez que tous les devis couvrent exactement le même périmètre\n- Un devis anormalement bas cache souvent des prestations manquantes\n- Créez un tableau comparatif pour une analyse objective\n- Le prix n'est qu'un critère parmi d'autres : réactivité, qualifications, références\n- Privilégiez la clarté et la précision du devis comme indicateur de sérieux\n:::",
    ],
    "image": "/images/blog/comparer-devis.jpg",
    "author": "Jean-Pierre Duval",
    "authorBio": "Jean-Pierre Duval, ancien artisan du bâtiment reconverti en journaliste, partage son expertise terrain pour aider les propriétaires à faire les bons choix.",
    "date": "2026-02-02",
    "updatedDate": "2026-02-10",
    "readTime": "11 min",
    "category": "Conseils",
    "tags": ["Devis", "Comparaison", "Travaux"],
    "faq": [
        {"question": "Combien de devis faut-il demander ?", "answer": "Trois devis est le minimum recommandé pour avoir une vision réaliste du marché. Pour les travaux importants (plus de 10 000 €), demandez-en quatre ou cinq."},
        {"question": "Un devis gratuit engage-t-il l'artisan ?", "answer": "Un devis non signé n'engage ni l'artisan ni le client. En revanche, une fois signé par les deux parties, il a valeur de contrat et engage les deux parties sur le contenu et le prix."},
        {"question": "Peut-on négocier un devis de travaux ?", "answer": "Oui, la négociation est courante et acceptée dans le bâtiment. Les leviers les plus efficaces : regrouper les travaux, proposer un calendrier flexible, fournir soi-même les matériaux, ou payer rapidement."},
    ],
})

# ─── Article 18: 10-arnaques-courantes-batiment ───
articles.append({
    "slug": "10-arnaques-courantes-batiment",
    "title": "Les 10 arnaques les plus courantes dans le bâtiment",
    "excerpt": "Faux artisans, devis gonflés, travaux fantômes... Découvrez les arnaques les plus fréquentes dans le secteur du bâtiment et comment vous en protéger efficacement.",
    "content": [
        "Le secteur du bâtiment est malheureusement un terrain propice aux arnaques. La DGCCRF enregistre chaque année plus de 10 000 signalements dans ce secteur, et les pertes financières pour les victimes peuvent atteindre plusieurs dizaines de milliers d'euros. Voici les 10 arnaques les plus courantes et les moyens concrets de les éviter.",
        "## 1. Le faux artisan sans SIRET\n\n### Le risque\n\nCertains individus se présentent comme artisans sans être immatriculés au Registre des Métiers. Sans SIRET, pas d'assurance, pas de garantie décennale, pas de recours en cas de problème.\n\n### La protection\n\nVérifiez toujours le SIRET avant de signer un devis sur [ServicesArtisans](/blog/trouver-artisan-verifie-siren) ou sur sirene.fr.\n\n## 2. L'isolation à 1 euro (supprimée)\n\n### Le risque\n\nCe dispositif a été supprimé en 2021. Tout démarchage téléphonique ou à domicile en son nom est une arnaque. Les escrocs récupèrent vos données personnelles et bancaires.\n\n### La protection\n\nRaccrochez immédiatement et ne communiquez jamais vos coordonnées bancaires par téléphone.\n\n## 3. Le devis gonflé après l'acompte\n\n### Le risque\n\nL'artisan demande un acompte conséquent puis annonce des surcoûts imprévus : « on a découvert un problème caché ». Le chantier est en otage.\n\n### La protection\n\nLimitez toujours l'acompte à 30 % maximum. Exigez un avenant écrit et signé pour tout supplément. Consultez notre guide sur les [clauses du contrat de travaux](/blog/contrat-travaux-clauses-essentielles).\n\n:::warning Attention\nNe payez jamais un supplément sans devis complémentaire écrit et signé. L'artisan ne peut pas modifier unilatéralement le prix convenu dans le devis initial.\n:::",
        "## 4. Les travaux non terminés\n\n### Le risque\n\nL'artisan encaisse le paiement mais ne finit pas les travaux ou disparaît du jour au lendemain.\n\n### La protection\n\nÉchelonnez les paiements : 30 % à la signature, 30 % en cours, 40 % à la [réception des travaux](/blog/reception-travaux-proces-verbal-reserves). Ne payez le solde qu'après vérification complète.\n\n## 5. L'absence d'assurance décennale\n\n### Le risque\n\nSans [garantie décennale](/blog/garantie-decennale-tout-savoir), vous n'avez aucun recours en cas de malfaçon grave pendant 10 ans.\n\n### La protection\n\nExigez l'attestation d'assurance décennale en cours de validité avant le début des travaux. Appelez l'assureur pour confirmer.\n\n## 6-10. Les autres arnaques courantes\n\n### 6. Le démarchage agressif\n\nUn artisan qui frappe à votre porte ou vous appelle pour proposer des travaux urgents. Protection : ne signez jamais lors d'un premier contact. Vous avez 14 jours de rétractation.\n\n### 7. Les matériaux substitués\n\nL'artisan facture des matériaux haut de gamme mais pose du bas de gamme. Protection : vérifiez les marques et références sur les emballages, conservez-les comme preuve.\n\n### 8. La surfacturation de fournitures\n\nL'artisan majore excessivement le prix des fournitures. Protection : vérifiez les prix en magasin ou proposez de fournir vous-même les matériaux.\n\n### 9. Le paiement en espèces\n\nL'artisan propose un « prix ami » contre un paiement en espèces (sans facture). Protection : au-delà de 1 000 €, le paiement en espèces est interdit. Vous perdez toutes les garanties.\n\n### 10. Le faux label RGE\n\nL'artisan affiche un label RGE expiré ou falsifié pour vous vendre des travaux éligibles aux aides. Protection : vérifiez sur france-renov.gouv.fr.\n\n:::tip Conseil pro\nLa meilleure protection contre les arnaques : [vérifiez systématiquement](/blog/comment-verifier-artisan-avant-engager) le SIRET, les assurances, les certifications et les avis avant tout engagement. Sur ServicesArtisans, ces vérifications sont effectuées automatiquement.\n:::\n\n:::takeaway\n- Vérifiez le SIRET, les assurances et les certifications avant tout engagement\n- Ne versez jamais plus de 30 % d'acompte\n- Méfiez-vous du démarchage non sollicité (téléphone ou domicile)\n- Refusez tout paiement en espèces au-delà de 1 000 €\n- Échelonnez les paiements et retenez 5 % jusqu'à la levée des réserves\n- En cas d'arnaque : portez plainte et signalez à la DGCCRF\n:::",
    ],
    "image": "/images/blog/arnaques-batiment.jpg",
    "author": "Isabelle Renault",
    "authorBio": "Isabelle Renault, juriste spécialisée en droit de la construction et de l'immobilier, décrypte la réglementation pour les propriétaires.",
    "date": "2026-01-29",
    "updatedDate": "2026-02-10",
    "readTime": "13 min",
    "category": "Securite",
    "tags": ["Arnaques", "Batiment", "Securite"],
    "faq": [
        {"question": "Que faire si j'ai été victime d'une arnaque ?", "answer": "Portez plainte immédiatement (police ou gendarmerie), signalez sur signal.conso.gouv.fr, contactez votre assurance habitation et consultez une association de consommateurs (UFC-Que Choisir, CLCV)."},
        {"question": "Comment reconnaître un faux devis ?", "answer": "Un faux devis est souvent vague (pas de détail des prestations), sans SIRET, sans mention d'assurance, avec un prix anormalement bas et des conditions de paiement abusives (acompte > 50 %, espèces)."},
        {"question": "Le démarchage à domicile est-il interdit ?", "answer": "Non, mais il est encadré : délai de rétractation de 14 jours, interdiction de percevoir un paiement pendant 7 jours. Le démarchage téléphonique pour la rénovation énergétique est interdit depuis 2020."},
    ],
})

# ─── Article 19: prix-electricien-2026-tarifs-travaux ───
articles.append({
    "slug": "prix-electricien-2026-tarifs-travaux",
    "title": "Prix électricien 2026 : tarifs et coût des travaux",
    "excerpt": "Mise aux normes, installation, dépannage... Tous les prix des travaux d'électricité en 2026 pour estimer votre budget et comparer les devis.",
    "content": [
        "Les travaux d'électricité sont parmi les plus techniques et les plus réglementés du bâtiment. Ils doivent obligatoirement être réalisés dans le respect de la [norme NF C 15-100](/blog/electricite-normes-securite) et, pour les installations neuves ou entièrement rénovées, validés par un contrôle Consuel. Voici le guide complet des prix d'un électricien en 2026.",
        "## Tarif horaire moyen\n\n### Les fourchettes par région\n\nLe tarif horaire moyen d'un électricien est de 40 à 65 euros HT en province et de 55 à 85 euros HT en Île-de-France. Ces tarifs couvrent la main-d'œuvre uniquement.\n\n:::budget\n| Zone | Tarif horaire HT |\n| Province | 40 - 65 € |\n| Grande métropole | 50 - 75 € |\n| Île-de-France | 55 - 85 € |\n:::",
        "## Prix d'une mise aux normes\n\n### Les tarifs détaillés\n\n| Intervention | Prix moyen |\n| --- | --- |\n| Mise aux normes complète (appartement) | 80 - 120 €/m² |\n| Mise aux normes complète (maison) | 70 - 100 €/m² |\n| Mise aux normes du tableau électrique | 600 - 1 500 € |\n| Remplacement d'un tableau vétuste | 800 - 2 000 € |\n| Mise à la terre | 500 - 1 000 € |\n\n:::warning Attention\nUne mise aux normes électrique doit être réalisée par un professionnel certifié Qualifelec. À la fin des travaux, exigez une attestation de conformité Consuel. Sans ce document, votre assurance peut refuser de couvrir un sinistre d'origine électrique.\n:::",
        "## Prix des installations courantes et dépannages\n\n### Installations\n\n:::budget\n| Installation | Prix moyen (pose + fourniture) |\n| Prise électrique | 80 - 150 € |\n| Point lumineux | 100 - 200 € |\n| Interrupteur | 60 - 120 € |\n| Circuit dédié (four, lave-linge) | 150 - 300 € |\n| Tableau électrique neuf | 1 000 - 2 500 € |\n| Borne de recharge véhicule électrique | 800 - 2 000 € |\n:::\n\n### Dépannages\n\n| Dépannage | Prix moyen |\n| --- | --- |\n| Recherche de panne | 80 - 150 € |\n| Remplacement de disjoncteur | 100 - 250 € |\n| Réparation court-circuit | 100 - 300 € |\n| Intervention d'urgence | 100 - 300 € (selon l'heure) |\n\n:::tip Conseil pro\nPour les dépannages, appelez d'abord un électricien local plutôt qu'un service d'urgence national. Les plateformes de dépannage en ligne facturent souvent des commissions élevées qui gonflent la facture finale.\n:::\n\n:::takeaway\n- Tarif horaire : 40-65 € HT en province, 55-85 € HT en Île-de-France\n- Mise aux normes complète : 70-120 €/m² selon le type de logement\n- Exigez une attestation Consuel pour toute installation neuve ou rénovée\n- Vérifiez la certification Qualifelec de votre électricien\n- Les travaux bénéficient de la TVA à 10 % dans les logements de plus de 2 ans\n:::",
    ],
    "image": "/images/blog/prix-electricien.jpg",
    "author": "Claire Dubois",
    "authorBio": "Claire Dubois, experte en économie de la construction, analyse les prix du marché et les aides financières pour informer les consommateurs.",
    "date": "2026-01-27",
    "updatedDate": "2026-02-10",
    "readTime": "10 min",
    "category": "Tarifs",
    "tags": ["Electricite", "Tarifs", "Prix"],
    "faq": [
        {"question": "La mise aux normes électrique est-elle déductible des impôts ?", "answer": "Non, les travaux de mise aux normes électrique ne sont pas déductibles des impôts pour les propriétaires occupants. En revanche, les propriétaires bailleurs peuvent les déduire de leurs revenus fonciers."},
        {"question": "Combien coûte l'installation d'une borne de recharge ?", "answer": "Comptez 800 à 2 000 € tout compris (fourniture + pose). Un crédit d'impôt de 300 € est disponible (75 % du coût, plafonné à 300 €). La borne doit être installée par un électricien certifié IRVE."},
        {"question": "Faut-il un certificat Consuel pour changer un tableau ?", "answer": "Le Consuel est obligatoire pour les installations neuves et les rénovations complètes. Un simple remplacement de tableau dans une installation existante ne nécessite pas de Consuel, mais l'électricien doit fournir une attestation de conformité."},
    ],
})

# ─── Article 20: prix-peintre-batiment-2026-guide-complet ───
articles.append({
    "slug": "prix-peintre-batiment-2026-guide-complet",
    "title": "Prix peintre en bâtiment 2026 : guide complet",
    "excerpt": "Prix au m², coût par pièce, tarifs spéciaux façade... Le guide complet des prix de peinture en 2026 pour estimer votre budget avec précision.",
    "content": [
        "Les prix de peinture varient considérablement selon le type de surface, la qualité de la peinture, l'état des murs et la région. Un écart de 1 à 3 est courant entre un devis d'entrée de gamme et une prestation haut de gamme. Voici les tarifs actualisés pour 2026, pour vous aider à [comparer les devis](/blog/devis-travaux-comment-comparer-choisir) en toute connaissance de cause.",
        "## Prix au mètre carré\n\n### Les tarifs standards\n\n:::budget\n| Surface | Prix moyen (fourniture + pose) |\n| Peinture intérieure murs | 20 - 45 €/m² |\n| Peinture plafond | 25 - 50 €/m² |\n| Peinture boiseries (portes, plinthes) | 30 - 60 €/ml |\n| Peinture façade | 30 - 60 €/m² |\n| Peinture décorative (effet) | 40 - 80 €/m² |\n:::\n\nCes prix incluent la préparation des surfaces (lessivage, rebouchage, ponçage) et l'application de deux couches. La sous-couche est parfois facturée en supplément.",
        "## Prix par pièce (estimation)\n\n### Budget selon la surface\n\n| Pièce | Surface estimée | Prix moyen |\n| --- | --- | --- |\n| Chambre de 12 m² | ~45 m² (murs + plafond) | 400 - 800 € |\n| Salon de 25 m² | ~80 m² (murs + plafond) | 700 - 1 500 € |\n| Cuisine | ~40 m² (hors crédence) | 500 - 1 000 € |\n| Salle de bain | ~30 m² | 400 - 900 € |\n| Cage d'escalier | Variable | 600 - 2 000 € |\n\n:::info Bon à savoir\nLa salle de bain et la cuisine nécessitent des peintures spécifiques résistantes à l'humidité et aux projections de graisse. Ces peintures techniques sont 20 à 40 % plus chères que les peintures standards.\n:::",
        "## Les facteurs qui influencent le prix\n\n### Ce qui fait varier la facture\n\n- **État des murs** : un mur en bon état nécessite peu de préparation, un mur très dégradé peut doubler le temps de travail\n- **Type de peinture** : acrylique standard, glycéro, écologique, peinture à effet\n- **Nombre de couches** : deux couches minimum, parfois trois pour un changement de couleur radical\n- **Hauteur sous plafond** : au-delà de 2,80 m, une majoration de 15-25 % s'applique (échafaudage nécessaire)\n- **Accès difficile** : cage d'escalier, pièce encombrée\n\n### Comment économiser\n\n- Préparez vous-même les murs (rebouchage, ponçage) pour réduire le temps de main-d'œuvre\n- Fournissez la peinture si vous trouvez un bon prix en grande surface de bricolage\n- Regroupez les pièces pour négocier un tarif dégressif\n- Évitez les périodes de forte demande (printemps, été)\n\nPour des conseils sur la réalisation en auto-rénovation, consultez notre guide [Réussir sa peinture intérieure](/blog/peinture-interieure-conseils).\n\n:::tip Conseil pro\nUn bon peintre professionnel coûte plus cher à l'heure mais travaille beaucoup plus vite. Un artisan expérimenté peint 30 à 40 m²/jour contre 10 à 15 m² pour un amateur. Le coût final peut être équivalent.\n:::\n\n:::takeaway\n- Prix murs intérieurs : 20-45 €/m², plafond : 25-50 €/m²\n- Une chambre de 12 m² coûte 400-800 €, un salon de 25 m² 700-1 500 €\n- L'état des murs est le principal facteur de variation du prix\n- Préparer soi-même les murs permet d'économiser 20-30 %\n- Regroupez les pièces pour obtenir un tarif dégressif\n- Fournissez la peinture si vous trouvez un meilleur prix\n:::",
    ],
    "image": "/images/blog/prix-peintre.jpg",
    "author": "Claire Dubois",
    "authorBio": "Claire Dubois, experte en économie de la construction, analyse les prix du marché et les aides financières pour informer les consommateurs.",
    "date": "2026-01-25",
    "updatedDate": "2026-02-09",
    "readTime": "10 min",
    "category": "Tarifs",
    "tags": ["Peinture", "Tarifs", "Prix"],
    "faq": [
        {"question": "Quel est le prix moyen pour repeindre un appartement ?", "answer": "Pour un appartement de 60 m² (3 pièces), comptez 2 500 à 5 000 € pour une peinture professionnelle complète (murs + plafonds). Le prix dépend de l'état des murs et de la qualité de la peinture choisie."},
        {"question": "Faut-il toujours appliquer une sous-couche ?", "answer": "Oui, sauf si vous repeignez dans une teinte très proche sur un mur en bon état. La sous-couche améliore l'adhérence, uniformise l'absorption et réduit le nombre de couches de finition nécessaires."},
        {"question": "La peinture de façade est-elle soumise à autorisation ?", "answer": "Oui, un ravalement ou un changement de couleur de façade nécessite une déclaration préalable de travaux en mairie. En zone ABF, l'accord de l'Architecte des Bâtiments de France est requis."},
    ],
})

with open('/tmp/articles_part3.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Part 3: {len(articles)} articles written to /tmp/articles_part3.json")
