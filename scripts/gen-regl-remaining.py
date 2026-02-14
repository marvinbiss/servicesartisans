#!/usr/bin/env python3
"""Generate remaining reglementation articles (4-19) with enhancements."""
import json

ISABELLE = "Isabelle Renault, juriste spécialisée en droit de la construction et de l'immobilier, décrypte la réglementation pour les propriétaires."
MARC = "Marc Lefebvre, ingénieur thermicien et rédacteur technique, vulgarise les aspects complexes de la rénovation énergétique."
CLAIRE = "Claire Dubois, experte en économie de la construction, analyse les prix du marché et les aides financières pour informer les consommateurs."

articles = []

# ─── 4: certificats-economies-energie-cee-guide ───
articles.append({
    "slug": "certificats-economies-energie-cee-guide",
    "title": "Certificats d'économies d'énergie (CEE) : comment en profiter",
    "excerpt": "Les CEE vous permettent de financer une partie de vos travaux de rénovation énergétique grâce aux primes versées par les fournisseurs d'énergie. Mode d'emploi complet.",
    "content": [
        "Le dispositif des Certificats d'Économies d'Énergie (CEE), instauré par la loi POPE du 13 juillet 2005 (articles L.221-1 et suivants du Code de l'énergie), oblige les fournisseurs d'énergie (EDF, Engie, TotalEnergies) à promouvoir l'efficacité énergétique. Concrètement, ils financent une partie de vos travaux via des primes, des bons d'achat ou des prêts bonifiés.",
        "## Quels travaux sont éligibles aux CEE ?\n\nLes opérations standardisées sont listées dans des fiches publiées au Journal officiel. Les plus courantes :\n\n- [Isolation des combles](/blog/isolation-thermique-guide) (fiche BAR-EN-101)\n- Isolation des murs (BAR-EN-102)\n- Remplacement de chaudière par une [pompe à chaleur](/blog/chauffage-pompe-chaleur-vs-chaudiere-gaz-2026) (BAR-TH-104)\n- Fenêtres double vitrage (BAR-EN-104)\n- VMC double flux (BAR-TH-125)\n\n:::info Bon à savoir\nLes fiches d'opérations standardisées définissent précisément les critères techniques (résistance thermique minimale, COP minimum pour les PAC). Un artisan RGE compétent connaît ces exigences et dimensionne les travaux en conséquence.\n:::",
        "## Combien pouvez-vous toucher en 2026 ?\n\nLes montants varient selon la zone climatique (H1, H2, H3), la nature des travaux et vos revenus :\n\n:::budget\n| Travaux | Prime CEE (zone H1, ménage modeste) |\n| Isolation combles perdus | 10 - 12 €/m² |\n| Isolation murs (ITE) | 15 - 25 €/m² |\n| PAC air-eau | 2 500 - 4 000 € |\n| Chaudière biomasse | 3 000 - 5 000 € |\n| Fenêtres double vitrage | 80 - 120 €/fenêtre |\n| VMC double flux | 500 - 1 000 € |\n:::\n\n### Le coup de pouce Rénovation performante\n\nLa prime Coup de pouce bonifie les CEE pour les rénovations globales atteignant un gain énergétique d'au moins 55 %. Le montant peut atteindre 5 000 € pour les ménages modestes. Ce bonus est cumulable avec [MaPrimeRénov'](/blog/aide-maprimerenov-2026-montants-conditions) Parcours accompagné.",
        "## Comment obtenir votre prime CEE ?\n\n### Les étapes\n\n1. **Choisissez un fournisseur** ou un délégataire et inscrivez-vous **AVANT** de signer le devis\n2. **Faites réaliser les travaux** par un artisan [RGE](/blog/label-rge-artisan-travaux-energetiques)\n3. **Envoyez la facture** et l'attestation sur l'honneur\n4. **Recevez votre prime** sous 4 à 8 semaines\n\n:::warning Attention\nLa règle fondamentale est de s'inscrire au dispositif CEE avant la signature du devis. Si vous signez d'abord et demandez la prime ensuite, votre dossier sera refusé. C'est l'erreur la plus fréquente des particuliers et elle est irréparable.\n:::\n\n## Peut-on cumuler les CEE avec d'autres aides ?\n\nOui ! Les CEE sont cumulables avec MaPrimeRénov', l'[éco-PTZ](/blog/eco-pret-taux-zero-guide-complet-2026), la [TVA à 5,5 %](/blog/tva-reduite-travaux-renovation-guide) et les aides locales. Ce cumul peut couvrir jusqu'à 80 % du coût des travaux pour les ménages modestes. Consultez notre [guide du cumul des aides](/blog/aides-renovation-2026-cumul-guide).\n\n## Comparatif des principaux acteurs CEE\n\n| Acteur | Mode de versement | Délai moyen |\n| --- | --- | --- |\n| EDF (Prime énergie) | Virement | 4 semaines |\n| TotalEnergies | Chèque | 6 semaines |\n| Effy | Virement | 3 semaines |\n\n:::tip Conseil pro\nComparez les montants proposés par différents acteurs CEE avant de vous inscrire. Les écarts peuvent atteindre 20-30 % pour une même opération. Utilisez les simulateurs en ligne de chaque fournisseur.\n:::\n\n:::takeaway\n- Inscrivez-vous aux CEE AVANT de signer le devis (règle non négociable)\n- Les primes couvrent 10-30 % du coût des travaux selon les opérations\n- Le Coup de pouce Rénovation performante peut atteindre 5 000 €\n- Les CEE sont cumulables avec toutes les autres aides\n- Comparez les montants entre fournisseurs (écarts de 20-30 %)\n- Les travaux doivent être réalisés par un artisan RGE\n:::",
    ],
    "image": "/images/blog/cee-certificats.jpg",
    "author": "Claire Dubois",
    "authorBio": CLAIRE,
    "date": "2026-01-13",
    "updatedDate": "2026-02-08",
    "readTime": "12 min",
    "category": "Aides & Subventions",
    "tags": ["CEE", "Primes énergie", "Rénovation énergétique", "Aides"],
    "faq": [
        {"question": "Peut-on demander les CEE après avoir signé le devis ?", "answer": "Non, c'est la cause de refus n° 1. L'inscription doit être faite avant la signature du devis. Il n'existe aucune exception ni dérogation à cette règle."},
        {"question": "Les CEE sont-ils imposables ?", "answer": "Non, les primes CEE versées aux particuliers pour des travaux dans leur résidence principale ne sont pas imposables. Elles ne sont pas à déclarer aux impôts."},
        {"question": "Peut-on changer de fournisseur CEE en cours de dossier ?", "answer": "Non, une fois inscrit auprès d'un fournisseur et le dossier engagé, vous ne pouvez pas transférer votre dossier chez un concurrent. D'où l'importance de comparer avant de s'inscrire."},
    ],
})

# ─── 5: eco-pret-taux-zero-guide-complet-2026 ───
articles.append({
    "slug": "eco-pret-taux-zero-guide-complet-2026",
    "title": "Éco-prêt à taux zéro 2026 : conditions et montants",
    "excerpt": "L'éco-PTZ permet d'emprunter jusqu'à 50 000 € sans intérêts pour financer vos travaux de rénovation énergétique. Conditions, plafonds et démarches en 2026.",
    "content": [
        "L'éco-prêt à taux zéro (éco-PTZ) est un prêt sans intérêts, accordé sans condition de revenus, destiné à financer des travaux de rénovation énergétique. Prévu par les articles 244 quater U du CGI et R.319-1 du Code de la construction, il a été prolongé jusqu'au 31 décembre 2027.",
        "## Les conditions d'éligibilité\n\nLe logement doit être une résidence principale, construite depuis plus de 2 ans. Aucune condition de revenus n'est requise. Les travaux doivent être réalisés par un artisan [RGE](/blog/label-rge-artisan-travaux-energetiques).\n\n:::info Bon à savoir\nL'éco-PTZ est accessible aux propriétaires occupants et bailleurs, ainsi qu'aux copropriétés. C'est l'une des rares aides sans condition de revenus, ce qui la rend accessible aux ménages aisés qui ne bénéficient pas de MaPrimeRénov'.\n:::",
        "## Les montants selon le type de travaux\n\n:::budget\n| Type de travaux | Plafond éco-PTZ | Durée max |\n| Action unique | 15 000 € | 15 ans |\n| Bouquet de 2 travaux | 25 000 € | 15 ans |\n| Bouquet de 3 travaux ou plus | 30 000 € | 15 ans |\n| Rénovation globale (gain ≥ 35 %) | 50 000 € | 20 ans |\n:::\n\nPour 30 000 € sur 15 ans, cela représente environ 167 €/mois, sans aucun intérêt.\n\n## Comment obtenir l'éco-PTZ ?\n\n1. Obtenez des devis d'artisans RGE\n2. Remplissez le formulaire emprunteur\n3. Déposez votre dossier auprès d'une banque partenaire (Crédit Agricole, BNP, Banque Postale, Société Générale)\n4. Réalisez les travaux dans un délai de 3 ans\n\n### Le cumul avec MaPrimeRénov'\n\nUn éco-PTZ [MaPrimeRénov'](/blog/aide-maprimerenov-2026-montants-conditions) simplifié permet de financer le reste à charge. Le montant maximal est de 30 000 €. Le formulaire est pré-rempli avec les informations de votre dossier MaPrimeRénov'.\n\n:::warning Attention\nNe commencez pas les travaux avant l'accord de la banque. L'éco-PTZ doit être accordé avant le début des travaux. Conservez tous vos devis et factures.\n:::",
        "## Les travaux éligibles en détail\n\n- [Isolation thermique](/blog/isolation-thermique-meilleures-solutions-2026) de la toiture (R ≥ 6 m².K/W)\n- Isolation des murs (R ≥ 3,7 m².K/W)\n- Remplacement de fenêtres simple vitrage\n- Installation de PAC ou chaudière biomasse\n- VMC double flux\n- Production d'eau chaude sanitaire solaire\n\n:::tip Conseil pro\nCombinez l'éco-PTZ avec MaPrimeRénov' et les [CEE](/blog/certificats-economies-energie-cee-guide) pour un plan de financement optimal. Sur notre plateforme, les artisans RGE référencés peuvent vous établir les devis conformes nécessaires.\n:::\n\n:::takeaway\n- Prêt sans intérêts, sans condition de revenus, jusqu'à 50 000 €\n- Logement de plus de 2 ans, résidence principale\n- Travaux par un artisan RGE obligatoire\n- Cumulable avec MaPrimeRénov', CEE et TVA 5,5 %\n- Durée de remboursement jusqu'à 20 ans\n- Accord de la banque requis AVANT le début des travaux\n:::",
    ],
    "image": "/images/blog/eco-ptz.jpg",
    "author": "Claire Dubois",
    "authorBio": CLAIRE,
    "date": "2026-01-16",
    "updatedDate": "2026-02-09",
    "readTime": "11 min",
    "category": "Aides & Subventions",
    "tags": ["Éco-PTZ", "Prêt", "Rénovation énergétique", "Financement"],
    "faq": [
        {"question": "Toutes les banques proposent-elles l'éco-PTZ ?", "answer": "Non, seules les banques ayant signé une convention avec l'État le proposent. Les principales sont : Crédit Agricole, BNP Paribas, La Banque Postale, Société Générale, Crédit Mutuel, CIC. Contactez votre banque pour vérifier."},
        {"question": "Peut-on obtenir un deuxième éco-PTZ ?", "answer": "Oui, un éco-PTZ complémentaire est possible si le montant total des deux prêts ne dépasse pas 30 000 € (ou 50 000 € pour une rénovation globale). Le deuxième doit être demandé dans les 5 ans suivant le premier."},
        {"question": "L'éco-PTZ est-il compatible avec un prêt immobilier classique ?", "answer": "Oui, l'éco-PTZ n'affecte pas votre capacité d'emprunt pour un prêt immobilier. La banque peut toutefois tenir compte des mensualités dans le calcul du taux d'endettement."},
    ],
})

# ─── 6-16: Remaining articles with enhancements ───

# 6: audit-energetique-dpe-obligations-2026
articles.append({
    "slug": "audit-energetique-dpe-obligations-2026",
    "title": "Audit énergétique et DPE : obligations en 2026",
    "excerpt": "DPE obligatoire, audit énergétique pour les passoires thermiques, calendrier d'interdiction de location : le point complet sur vos obligations en 2026.",
    "content": [
        "Le Diagnostic de Performance Énergétique (DPE) et l'audit énergétique sont au cœur de la politique de rénovation énergétique en France. La loi Climat et Résilience du 22 août 2021 a considérablement renforcé leurs implications, créant de nouvelles obligations pour les propriétaires.",
        "## Le DPE : rappel des fondamentaux\n\nLe DPE classe les logements de A (très performant) à G (passoire thermique) selon leur consommation d'énergie et leurs émissions de GES. Depuis le 1er juillet 2021, il est devenu opposable juridiquement : un acquéreur peut se retourner contre le vendeur si la classe réelle est inférieure à celle annoncée.\n\n:::warning Attention\nUn DPE erroné peut donner lieu à une action en justice de l'acquéreur pour diminution du prix de vente ou annulation de la transaction. Le diagnostiqueur engage sa responsabilité civile professionnelle.\n:::",
        "## L'audit énergétique obligatoire\n\nDepuis le 1er avril 2023, les logements classés F ou G en vente doivent faire l'objet d'un audit énergétique (décret n° 2022-780). Depuis le 1er janvier 2025, cette obligation s'étend aux logements classés E. L'audit propose des scénarios de travaux chiffrés pour atteindre au minimum la classe B.\n\n## Le calendrier d'interdiction de location\n\n| Échéance | Logements concernés |\n| --- | --- |\n| Depuis le 1er janvier 2025 | Classe G interdits à la location |\n| 1er janvier 2028 | Classe F interdits |\n| 1er janvier 2034 | Classe E interdits |\n\n:::warning Attention\nCes interdictions s'appliquent aux nouveaux baux et aux renouvellements. Un locataire en place dans un logement classé G peut exiger de son propriétaire la réalisation de travaux de rénovation énergétique, sous peine de voir le loyer bloqué.\n:::",
        "## Combien coûtent le DPE et l'audit ?\n\n:::budget\n| Diagnostic | Coût moyen |\n| DPE (appartement) | 100 - 200 € |\n| DPE (maison) | 150 - 250 € |\n| Audit énergétique (maison) | 800 - 1 500 € |\n| Audit énergétique (copropriété) | 5 000 - 15 000 € |\n:::\n\nL'audit est réalisé par un diagnostiqueur certifié RGE Études ou un bureau d'études thermiques.\n\n## Le DPE collectif en copropriété\n\nAu 1er janvier 2024 : copropriétés > 200 lots. Au 1er janvier 2025 : 50 à 200 lots. Au 1er janvier 2026 : < 50 lots. Ce DPE collectif est un préalable au plan pluriannuel de travaux (PPT).\n\n:::tip Conseil pro\nSi votre logement est classé F ou G, commandez un audit énergétique pour identifier les travaux prioritaires. Renseignez-vous sur [MaPrimeRénov'](/blog/aide-maprimerenov-2026-montants-conditions) Parcours accompagné (taux de prise en charge majorés pour les passoires thermiques). Consultez un Accompagnateur Rénov' agréé par l'État.\n:::\n\n:::takeaway\n- Le DPE est opposable juridiquement depuis juillet 2021\n- Audit obligatoire pour la vente des logements classés E, F et G\n- Location interdite pour les classes G (2025), F (2028) et E (2034)\n- DPE collectif obligatoire pour toutes les copropriétés d'ici 2026\n- Budget : 100-250 € (DPE), 800-1 500 € (audit maison)\n- L'audit est éligible à MaPrimeRénov' (jusqu'à 500 € d'aide)\n:::",
    ],
    "image": "/images/blog/audit-dpe.jpg",
    "author": "Marc Lefebvre",
    "authorBio": MARC,
    "date": "2026-01-19",
    "updatedDate": "2026-02-10",
    "readTime": "12 min",
    "category": "Réglementation",
    "tags": ["DPE", "Audit énergétique", "Passoires thermiques", "Location"],
    "faq": [
        {"question": "Que faire si mon logement est classé G ?", "answer": "Si vous êtes propriétaire bailleur, vous ne pouvez plus louer à de nouveaux locataires depuis janvier 2025. Réalisez un audit énergétique et engagez des travaux de rénovation (isolation, chauffage). MaPrimeRénov' Parcours accompagné finance jusqu'à 90 % du coût pour les ménages modestes."},
        {"question": "Le DPE est-il fiable ?", "answer": "Le DPE a été profondément réformé en 2021 pour le rendre plus fiable et opposable. Cependant, des écarts subsistent entre diagnostiqueurs. En cas de doute, demandez un second DPE à un autre professionnel."},
        {"question": "L'audit énergétique est-il obligatoire pour une rénovation ?", "answer": "L'audit n'est pas obligatoire pour engager des travaux. Il est obligatoire pour la vente d'un logement classé E, F ou G, et recommandé pour le Parcours accompagné de MaPrimeRénov'."},
    ],
})

# 7: reglementation-thermique-re2020-impact
articles.append({
    "slug": "reglementation-thermique-re2020-impact",
    "title": "RE2020 : impact sur la construction et la rénovation",
    "excerpt": "La Réglementation Environnementale 2020 transforme les exigences de construction neuve. Découvrez ses impacts concrets sur vos projets et les matériaux à privilégier.",
    "content": [
        "Entrée en vigueur le 1er janvier 2022, la RE2020 (décret n° 2021-1004) remplace la RT2012 et marque un tournant majeur dans la construction française. Pour la première fois, la réglementation intègre l'empreinte carbone des bâtiments sur l'ensemble de leur cycle de vie.",
        "## Les trois piliers de la RE2020\n\n1. **Performance énergétique** : indicateur Bbio abaissé de 30 % par rapport à la RT2012\n2. **Réduction de l'empreinte carbone** : indicateurs Ic énergie et Ic construction\n3. **Confort d'été** : seuil de 1 250 degrés-heures d'inconfort maximal\n\n:::info Bon à savoir\nLa RE2020 s'applique aux permis de construire déposés depuis le 1er janvier 2022 pour les logements. Elle ne s'applique pas directement aux rénovations, qui restent soumises à la réglementation thermique par élément.\n:::",
        "## Impact sur les matériaux et le chauffage\n\n### Matériaux de construction\n\nLa prise en compte du carbone favorise les matériaux biosourcés : bois de construction, fibre de bois, ouate de cellulose, chanvre, paille. Le béton traditionnel est pénalisé, poussant vers des bétons bas carbone ou des solutions mixtes bois-béton.\n\n### Chauffage\n\nLa RE2020 élimine le chauffage gaz dans les constructions neuves (seuil de 4 kg CO2/m²/an). Solutions privilégiées : [pompe à chaleur](/blog/chauffage-pompe-chaleur-vs-chaudiere-gaz-2026) air-eau ou air-air, chauffage biomasse, réseau de chaleur urbain, solaire thermique.\n\n:::warning Attention\nSi vous projetez une construction neuve, le chauffage gaz n'est plus une option. Intégrez une pompe à chaleur ou un système biomasse dès la conception du projet.\n:::",
        "## Le calendrier de durcissement et le surcoût\n\n| Échéance | Mesure |\n| --- | --- |\n| 2025 | Abaissement des seuils carbone (Ic construction -15 %) |\n| 2028 | Exigence accrue sur les matériaux biosourcés |\n| 2031 | Objectif de quasi-neutralité carbone |\n\n### Impact sur le coût de construction\n\nSurcoût estimé de 5 à 10 % par rapport à la RT2012, soit 8 000 à 15 000 € supplémentaires sur un budget de 150 000 €. Ce surcoût est compensé par des économies d'énergie annuelles de 300 à 600 €.\n\n## RE2020 et rénovation\n\nLa RE2020 ne s'applique pas directement aux rénovations. Toutefois, ses standards influencent les niveaux de performance exigés pour les aides ([MaPrimeRénov'](/blog/aide-maprimerenov-2026-montants-conditions), [CEE](/blog/certificats-economies-energie-cee-guide)).\n\n:::tip Conseil pro\nPour un projet de construction neuve, travaillez avec un architecte ou maître d'œuvre maîtrisant la RE2020. Les artisans référencés sur notre plateforme sont formés aux nouvelles exigences.\n:::\n\n:::takeaway\n- La RE2020 intègre pour la première fois l'empreinte carbone du bâtiment\n- Le gaz est interdit en construction neuve depuis 2022\n- Les matériaux biosourcés sont favorisés (bois, chanvre, fibre de bois)\n- Surcoût de 5-10 % compensé par les économies d'énergie\n- La RE2020 ne s'applique pas aux rénovations (réglementation par élément)\n- Les exigences se durciront en 2025, 2028 et 2031\n:::",
    ],
    "image": "/images/blog/re2020.jpg",
    "author": "Marc Lefebvre",
    "authorBio": MARC,
    "date": "2026-01-22",
    "updatedDate": "2026-02-09",
    "readTime": "11 min",
    "category": "Réglementation",
    "tags": ["RE2020", "Construction neuve", "Performance énergétique", "Carbone"],
    "faq": [
        {"question": "La RE2020 s'applique-t-elle à ma rénovation ?", "answer": "Non, la RE2020 s'applique uniquement aux constructions neuves. Les rénovations sont soumises à la réglementation thermique par élément (arrêté du 3 mai 2007 modifié), qui impose des performances minimales pour chaque composant remplacé."},
        {"question": "Peut-on encore installer une chaudière gaz dans le neuf ?", "answer": "Non, depuis janvier 2022, les chaudières gaz ne respectent plus le seuil de 4 kg CO2/m²/an imposé par la RE2020 pour les logements neufs. En rénovation, l'installation reste autorisée."},
        {"question": "Les maisons en bois sont-elles favorisées par la RE2020 ?", "answer": "Oui, le bois de construction stocke du carbone et bénéficie d'un bilan carbone favorable dans le calcul RE2020. Les constructions ossature bois ou bois massif (CLT) sont de plus en plus compétitives."},
    ],
})

# For the remaining 12 articles, I'll process them similarly
# Let me continue with articles 8-16 of reglementation

# 8: responsabilite-artisan-maitre-ouvrage
articles.append({
    "slug": "responsabilite-artisan-maitre-ouvrage",
    "title": "Responsabilité artisan et maître d'ouvrage : qui est responsable ?",
    "excerpt": "Garantie de parfait achèvement, garantie biennale, décennale : les responsabilités de l'artisan et du maître d'ouvrage sont encadrées par la loi. Explications.",
    "content": [
        "Le régime de responsabilité des constructeurs, codifié aux articles 1792 et suivants du Code civil, est l'un des plus protecteurs d'Europe pour le maître d'ouvrage. Comprendre qui est responsable de quoi est essentiel avant, pendant et après vos travaux.",
        "## Les trois garanties légales\n\n### Garantie de parfait achèvement (1 an)\n\nPrévue par l'article 1792-6 du Code civil, elle court pendant un an après [réception](/blog/reception-travaux-proces-verbal-reserves). L'artisan doit réparer tous les désordres signalés lors de la réception (réserves) ou notifiés par LRAR durant l'année suivante. C'est la garantie la plus large.\n\n### Garantie biennale (2 ans)\n\nPrévue par l'article 1792-3, elle couvre les éléments d'équipement dissociables : robinetterie, volets, radiateurs, portes intérieures, ballon d'eau chaude.\n\n### Garantie décennale (10 ans)\n\nPrévue par l'article 1792, elle couvre les dommages compromettant la solidité de l'ouvrage. L'artisan est présumé responsable : c'est à lui de prouver qu'il n'est pas fautif. Voir notre [guide complet de la décennale](/blog/garantie-decennale-tout-savoir).\n\n:::warning Attention\nSans réception formelle des travaux, aucune garantie ne court. Exigez toujours un PV de réception écrit, daté et signé par les deux parties. C'est le point de départ de toutes les protections légales.\n:::",
        "## Les obligations du maître d'ouvrage\n\nLe maître d'ouvrage doit :\n\n- Donner accès au chantier dans les conditions prévues\n- Payer les acomptes convenus aux échéances fixées\n- Réceptionner les travaux (ne pas se soustraire à cette obligation)\n- Signaler les désordres dans les délais de chaque garantie\n- Ne pas modifier l'ouvrage sans accord de l'artisan\n\n## La réception des travaux : le moment clé\n\nLa réception est l'acte par lequel le maître d'ouvrage accepte l'ouvrage avec ou sans réserves. C'est le point de départ de toutes les garanties. Exigez toujours un PV de réception écrit, daté et signé. Pour les détails, consultez notre guide sur la [réception des travaux](/blog/reception-travaux-proces-verbal-reserves).\n\n:::tip Conseil pro\nFaites-vous accompagner par un expert en bâtiment lors de la réception des travaux importants. Le coût (300-800 €) est dérisoire comparé aux conséquences d'un défaut non détecté à la réception.\n:::",
        "## Que faire si l'artisan refuse de réparer ?\n\n1. **Mise en demeure** par LRAR avec délai de 15-30 jours\n2. **Médiation** de la consommation (gratuite, 90 jours)\n3. **Expertise amiable** ou judiciaire\n4. **Action en justice** devant le tribunal judiciaire\n\nConservez tous les documents (contrat, devis, factures, échanges écrits, photos). En cas de sous-traitance, l'artisan principal reste seul responsable vis-à-vis du maître d'ouvrage.\n\nPour les étapes détaillées, consultez notre guide sur les [litiges avec un artisan](/blog/litige-artisan-recours-mediation-justice).\n\n:::info Bon à savoir\nVérifiez toujours les assurances de l'artisan avant le début des travaux : RC professionnelle et garantie décennale en cours de validité. Sur ServicesArtisans, ces documents sont vérifiés pour chaque professionnel.\n:::\n\n:::takeaway\n- Trois garanties protègent le maître d'ouvrage : 1 an, 2 ans et 10 ans\n- La garantie décennale repose sur une présomption de responsabilité de l'artisan\n- La réception des travaux est le point de départ de toutes les garanties\n- Le maître d'ouvrage doit respecter ses obligations (paiement, accès, réception)\n- En cas de litige : mise en demeure → médiation → expertise → justice\n- L'artisan reste responsable même en cas de sous-traitance\n:::",
    ],
    "image": "/images/blog/responsabilite-artisan.jpg",
    "author": "Isabelle Renault",
    "authorBio": ISABELLE,
    "date": "2026-01-24",
    "updatedDate": "2026-02-10",
    "readTime": "12 min",
    "category": "Réglementation",
    "tags": ["Responsabilité", "Garantie décennale", "Maître d'ouvrage", "Droit"],
    "faq": [
        {"question": "Que couvre exactement la garantie de parfait achèvement ?", "answer": "Elle couvre TOUS les défauts constatés lors de la réception (réserves) ou signalés par LRAR pendant l'année suivante. C'est la garantie la plus large : elle inclut les défauts esthétiques, fonctionnels et structurels, quelle que soit leur importance."},
        {"question": "La garantie décennale s'applique-t-elle aux travaux de peinture ?", "answer": "Non, la peinture relève de la garantie de parfait achèvement (1 an). La garantie décennale couvre uniquement les dommages compromettant la solidité de l'ouvrage ou le rendant impropre à sa destination."},
        {"question": "Peut-on refuser la réception des travaux ?", "answer": "Oui, si les travaux ne sont pas terminés ou si les désordres sont suffisamment graves pour empêcher une utilisation normale. Le refus doit être motivé par écrit."},
    ],
})

# Continue with remaining articles - simplified for brevity but with full enhancements

remaining_slugs = [
    ("reception-travaux-proces-verbal-reserves", "Réception des travaux : procès-verbal et réserves", "La réception des travaux est une étape juridique décisive. Voici comment rédiger le procès-verbal, formuler des réserves et protéger vos intérêts.", ISABELLE, "2026-01-27", "Réglementation", ["Réception", "Procès-verbal", "Réserves", "Garanties"]),
    ("litige-artisan-recours-mediation-justice", "Litige avec un artisan : recours, médiation et justice", "Travaux mal réalisés, retards, surfacturation ? Découvrez les étapes à suivre pour résoudre un litige avec un artisan, de la médiation au tribunal.", ISABELLE, "2026-01-29", "Réglementation", ["Litige", "Médiation", "Justice", "Recours"]),
    ("label-rge-artisan-travaux-energetiques", "Label RGE : pourquoi c'est indispensable pour vos travaux", "Le label RGE conditionne l'accès aux aides financières. Décryptage de ce label et de ses implications pour vos projets de rénovation énergétique.", MARC, "2026-02-01", "Réglementation", ["RGE", "Label", "Rénovation énergétique", "Qualifications"]),
    ("qualibat-qualifelec-certifications-batiment", "Qualibat, Qualifelec, Qualit'EnR : comprendre les certifications", "Qualibat, Qualifelec, Qualit'EnR, Qualigaz... Le monde des certifications du bâtiment est complexe. Décryptage pour y voir clair et choisir le bon artisan.", MARC, "2026-02-03", "Réglementation", ["Qualibat", "Qualifelec", "Certifications", "Qualifications"]),
    ("diagnostic-immobilier-obligatoire-liste", "Diagnostics immobiliers obligatoires : la liste complète", "DPE, amiante, plomb, électricité, gaz, termites... Quels diagnostics sont obligatoires pour vendre ou louer en 2026 ? Liste complète et tarifs.", ISABELLE, "2026-02-05", "Réglementation", ["Diagnostics", "Immobilier", "DPE", "Vente"]),
    ("amiante-plomb-diagnostic-avant-travaux", "Amiante et plomb : diagnostics obligatoires avant travaux", "Avant d'entamer des travaux dans un bâtiment ancien, les diagnostics amiante et plomb sont obligatoires. Procédures, coûts et obligations de chacun.", ISABELLE, "2026-02-06", "Réglementation", ["Amiante", "Plomb", "Diagnostic", "Sécurité"]),
    ("accessibilite-pmr-logement-normes", "Accessibilité PMR : normes et aides pour adapter son logement", "Adapter un logement pour une personne à mobilité réduite implique de respecter des normes précises. Découvrez les travaux nécessaires et les aides disponibles en 2026.", CLAIRE, "2026-02-07", "Réglementation", ["Accessibilité", "PMR", "Handicap", "Aides"]),
    ("reglementation-ravalement-facade-obligations", "Ravalement de façade : obligations légales et délais", "Le ravalement de façade est une obligation légale dans de nombreuses communes. Délais, sanctions, autorisations et aides : tout ce que vous devez savoir.", ISABELLE, "2026-01-31", "Réglementation", ["Ravalement", "Façade", "Urbanisme", "Obligations"]),
    ("urbanisme-regles-construction-extension", "Règles d'urbanisme : construire et agrandir en toute légalité", "PLU, emprise au sol, hauteur maximale... Les règles d'urbanisme encadrent strictement vos projets de construction et d'extension. Le guide pour ne rien oublier.", ISABELLE, "2026-02-02", "Réglementation", ["Urbanisme", "PLU", "Construction", "Extension"]),
    ("aides-renovation-2026-cumul-guide", "Cumuler les aides rénovation en 2026 : le guide stratégique", "MaPrimeRénov', CEE, éco-PTZ, TVA réduite, aides locales... En 2026, le cumul des aides peut couvrir jusqu'à 90 % du coût de vos travaux. Stratégie optimale.", CLAIRE, "2026-02-09", "Aides & Subventions", ["Aides", "Cumul", "MaPrimeRénov'", "Stratégie"]),
    ("contrat-travaux-clauses-essentielles", "Contrat de travaux : les clauses essentielles à vérifier", "Un contrat de travaux bien rédigé vous protège en cas de litige. Découvrez les clauses indispensables à vérifier avant de signer, et celles à ajouter.", ISABELLE, "2026-02-10", "Réglementation", ["Contrat", "Travaux", "Clauses", "Protection"]),
]

# I'll write these articles' JSON to a file for the assembler
with open('/tmp/regl_remaining_meta.json', 'w', encoding='utf-8') as f:
    json.dump(remaining_slugs, f, ensure_ascii=False, indent=2)

with open('/tmp/regl_part2.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Regl Part 2: {len(articles)} enhanced articles written")
print(f"Remaining: {len(remaining_slugs)} articles to process from original content")
