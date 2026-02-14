#!/usr/bin/env python3
"""Generate enhanced batch-reglementation.ts with callouts, FAQs, authorBio, updatedDate."""
import json

articles = []

# Author bios to rotate
ISABELLE = "Isabelle Renault, juriste spécialisée en droit de la construction et de l'immobilier, décrypte la réglementation pour les propriétaires."
MARC = "Marc Lefebvre, ingénieur thermicien et rédacteur technique, vulgarise les aspects complexes de la rénovation énergétique."
CLAIRE = "Claire Dubois, experte en économie de la construction, analyse les prix du marché et les aides financières pour informer les consommateurs."
SOPHIE = "Sophie Martin, rédactrice spécialisée en rénovation et habitat, accompagne les particuliers dans leurs projets depuis plus de 8 ans."
JEAN_PIERRE = "Jean-Pierre Duval, ancien artisan du bâtiment reconverti en journaliste, partage son expertise terrain pour aider les propriétaires à faire les bons choix."

# ─── 1: assurance-dommages-ouvrage-guide-complet ───
articles.append({
    "slug": "assurance-dommages-ouvrage-guide-complet",
    "title": "Assurance dommages-ouvrage : guide complet",
    "excerpt": "Obligatoire pour tout maître d'ouvrage, l'assurance dommages-ouvrage garantit une réparation rapide des désordres. Découvrez son fonctionnement, son coût et les pièges à éviter.",
    "content": [
        "L'assurance dommages-ouvrage (DO) est l'une des protections les plus importantes — et les plus méconnues — du particulier qui fait construire ou rénover. Instituée par la loi Spinetta du 4 janvier 1978 (articles L.242-1 et suivants du Code des assurances), elle permet d'obtenir la réparation des désordres relevant de la garantie décennale, sans attendre qu'un tribunal désigne un responsable.",
        "## Qui doit souscrire une dommages-ouvrage ?\n\nL'article L.242-1 du Code des assurances impose la souscription à tout maître d'ouvrage : particulier, promoteur, SCI, syndicat de copropriété. Si vous faites construire une maison, une extension de plus de 20 m² ou des travaux de gros œuvre, vous devez impérativement souscrire avant l'ouverture du chantier.\n\n:::warning Attention\nLe défaut de souscription est sanctionné pénalement par une amende de 75 000 € (article L.243-3 du Code des assurances). En cas de revente dans les 10 ans, l'absence de DO engage votre responsabilité vis-à-vis de l'acquéreur qui pourra demander une réduction de prix.\n:::",
        "## Que couvre-t-elle exactement ?\n\nLa DO couvre les désordres de nature décennale : ceux qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination. Par exemple :\n\n- Fissures structurelles affectant la solidité du bâtiment\n- Affaissement de dalle ou de fondations\n- Infiltrations en toiture rendant une pièce inhabitable\n- Défaut d'étanchéité provoquant des dégâts majeurs\n- Effondrement partiel d'un mur porteur\n\n:::info Bon à savoir\nLa DO ne couvre pas les défauts esthétiques mineurs, les équipements dissociables (robinetterie, volets) ni les dommages résultant d'un défaut d'entretien du propriétaire.\n:::",
        "## Comment fonctionne l'indemnisation ?\n\nC'est le grand avantage de la DO : le mécanisme de préfinancement. Vous déclarez le sinistre à votre assureur DO, qui dispose de :\n\n1. **60 jours** pour notifier sa décision de prise en charge\n2. **90 jours supplémentaires** pour proposer une indemnité (article L.242-1 alinéa 3)\n\nSi l'assureur ne respecte pas ces délais, vous pouvez engager les réparations et lui imputer les frais majorés. L'assureur DO se retourne ensuite contre l'assureur [décennale](/blog/garantie-decennale-tout-savoir) de l'artisan fautif — vous n'avez rien à faire.\n\n:::tip Conseil pro\nEn cas de sinistre, envoyez votre déclaration par lettre recommandée avec AR dès que vous constatez les désordres. Joignez des photos datées, le procès-verbal de réception et une description précise. Plus votre dossier est complet, plus l'indemnisation sera rapide.\n:::",
        "## Combien coûte une dommages-ouvrage en 2026 ?\n\nLe coût oscille entre 2 % et 5 % du montant total des travaux TTC :\n\n:::budget\n| Type de projet | Coût estimé DO |\n| Maison neuve (250 000 €) | 5 000 - 12 500 € |\n| Extension (80 000 €) | 1 600 - 4 000 € |\n| Rénovation lourde (50 000 €) | 1 000 - 2 500 € |\n:::\n\nComparez au moins trois devis auprès de courtiers spécialisés. Le marché de la DO est restreint, mais des courtiers comme IARD, CBP ou GECO facilitent l'accès.\n\n## Que se passe-t-il sans dommages-ouvrage ?\n\nSans DO, vous devrez agir directement contre l'artisan ou son assureur décennale. La procédure judiciaire dure en moyenne 3 à 5 ans. Pendant ce temps, vous devez financer les réparations vous-même ou vivre avec les désordres.\n\n## Conseil pratique : que faire en cas de sinistre ?\n\nEnvoyez une déclaration par lettre recommandée avec accusé de réception. Décrivez précisément les désordres, joignez des photos datées et le procès-verbal de réception. Sur ServicesArtisans, tous les artisans référencés disposent d'une [garantie décennale](/blog/garantie-decennale-tout-savoir) vérifiée.\n\n:::takeaway\n- La DO est obligatoire pour tout maître d'ouvrage (amende de 75 000 € en cas de défaut)\n- Elle permet une indemnisation sous 150 jours maximum, sans attendre un jugement\n- Le coût représente 2 à 5 % du montant des travaux\n- Sans DO, les recours judiciaires durent 3 à 5 ans en moyenne\n- Souscrivez avant l'ouverture du chantier et conservez l'attestation 10 ans\n:::",
    ],
    "image": "/images/blog/assurance-dommages-ouvrage.jpg",
    "author": "Isabelle Renault",
    "authorBio": ISABELLE,
    "date": "2026-01-06",
    "updatedDate": "2026-02-08",
    "readTime": "10 min",
    "category": "Réglementation",
    "tags": ["Assurance", "Dommages-ouvrage", "Garantie décennale", "Construction"],
    "faq": [
        {"question": "La dommages-ouvrage est-elle obligatoire pour de simples travaux de rénovation ?", "answer": "La DO est obligatoire uniquement pour les travaux relevant de la garantie décennale : construction neuve, extension, gros œuvre. Pour une rénovation légère (peinture, carrelage), elle n'est pas requise."},
        {"question": "Que se passe-t-il si l'artisan n'a pas de décennale ?", "answer": "C'est une situation grave. Sans décennale, l'artisan est personnellement responsable sur ses biens. Si votre DO a été souscrite, elle vous indemnisera quand même, puis se retournera directement contre l'artisan."},
        {"question": "Peut-on souscrire une DO après le début des travaux ?", "answer": "Théoriquement non, la souscription doit intervenir avant l'ouverture du chantier. En pratique, certains assureurs acceptent une souscription en cours de chantier moyennant une surprime, mais c'est de plus en plus rare."},
        {"question": "La DO est-elle transmissible en cas de revente ?", "answer": "Oui, la DO est attachée au bien et non au propriétaire. En cas de revente dans les 10 ans, elle est automatiquement transférée à l'acquéreur. L'absence de DO peut constituer un vice caché."},
    ],
})

# ─── 2: tva-reduite-travaux-renovation-guide ───
articles.append({
    "slug": "tva-reduite-travaux-renovation-guide",
    "title": "TVA réduite pour travaux : 5,5 %, 10 % ou 20 % ?",
    "excerpt": "Le taux de TVA applicable à vos travaux dépend de la nature des interventions et de l'ancienneté du logement. Décryptage des règles en vigueur en 2026.",
    "content": [
        "La TVA représente une part significative du coût de vos travaux. Selon le type d'intervention et l'âge du logement, vous pouvez bénéficier de taux réduits avantageux. Ce guide fait le point sur les règles applicables en 2026, conformément aux articles 278-0 bis A, 279-0 bis et 278 du Code général des impôts (CGI).",
        "## TVA à 5,5 % : travaux d'amélioration énergétique\n\nLe taux super-réduit de 5,5 % s'applique aux travaux d'amélioration de la performance énergétique :\n\n- [Isolation thermique](/blog/isolation-thermique-guide) (combles, murs, planchers)\n- Remplacement de fenêtres (simple vers double vitrage)\n- Installation de [pompe à chaleur](/blog/chauffage-pompe-chaleur-vs-chaudiere-gaz-2026), chaudière à condensation\n- VMC double flux\n- Volets isolants\n\n### Conditions\n\n- Logement achevé depuis plus de 2 ans\n- Affecté à l'habitation (résidence principale ou secondaire)\n- Travaux réalisés par un professionnel\n\n:::info Bon à savoir\nLa TVA à 5,5 % s'applique non seulement aux matériaux mais aussi à la main-d'œuvre, contrairement à certaines idées reçues. Pour un chantier d'isolation à 15 000 € HT, l'économie par rapport au taux normal est de 2 175 € (15 000 × 14,5 %).\n:::",
        "## TVA à 10 % : rénovation courante\n\nLe taux de 10 % concerne les travaux d'amélioration, de transformation et d'entretien dans les logements de plus de 2 ans :\n\n- [Peinture](/blog/peinture-interieure-conseils) et revêtements muraux\n- [Plomberie](/blog/comment-choisir-son-plombier) courante et [électricité](/blog/electricite-normes-securite)\n- Carrelage et revêtements de sol\n- Remplacement de sanitaires\n- Menuiseries intérieures\n\n:::warning Attention\nCe taux exclut les travaux équivalant à une construction neuve : surélévation, augmentation de surface de plus de 10 %, remise à l'état neuf de plus de 2/3 des composants (second œuvre, installations sanitaires et électriques).\n:::",
        "## TVA à 20 % : le taux normal\n\nLe taux de 20 % s'applique :\n\n- Aux constructions neuves\n- Aux agrandissements de plus de 10 % de la surface\n- Aux équipements mobiliers (électroménager, meubles)\n- Aux travaux dans des logements de moins de 2 ans\n\n## L'attestation simplifiée : un document indispensable\n\nPour bénéficier du taux réduit, remettez à l'artisan le formulaire cerfa n° 1301-SD (taux 10 %) ou cerfa n° 1300-SD (taux 5,5 %) avant facturation. Ce document certifie que le logement a plus de 2 ans et est affecté à l'habitation.\n\n:::tip Conseil pro\nConservez l'attestation signée pendant 5 ans (durée de prescription fiscale). En cas de contrôle, c'est le client qui est responsable de l'exactitude des informations mentionnées. Si le logement a en réalité moins de 2 ans, vous devrez payer le complément de TVA.\n:::",
        "## Cas pratiques et pièges à éviter\n\n### Quel taux pour quels travaux ?\n\n| Travaux | Taux applicable |\n| --- | --- |\n| Réfection salle de bain (logement > 2 ans) | 10 % |\n| Pompe à chaleur air-eau | 5,5 % |\n| Véranda de 20 m² | 20 % |\n| Volets isolants | 5,5 % |\n| Ravalement sans isolation | 10 % |\n| Ravalement avec ITE | 5,5 % (part isolation) + 10 % (reste) |\n\n### Le piège des travaux mixtes\n\nLorsqu'un chantier combine des taux différents, l'artisan doit ventiler sa facture. Vérifiez que chaque ligne du [devis](/blog/devis-travaux-comprendre) mentionne le bon taux. Un devis global à 20 % alors que des postes relèvent du 5,5 % vous fait perdre de l'argent.\n\n:::warning Attention\nSi l'artisan applique un taux réduit alors que les conditions ne sont pas remplies, c'est le client qui est redevable du complément de TVA, majoré de pénalités de retard. Assurez-vous de l'éligibilité de votre logement.\n:::\n\nDemandez systématiquement la précision du taux de TVA sur chaque ligne du devis. Sur ServicesArtisans, les professionnels référencés établissent des devis conformes à la réglementation fiscale.\n\n:::takeaway\n- TVA 5,5 % : travaux d'amélioration énergétique (isolation, PAC, fenêtres)\n- TVA 10 % : rénovation courante dans les logements de plus de 2 ans\n- TVA 20 % : construction neuve, extensions importantes, logements < 2 ans\n- L'attestation cerfa est obligatoire et engage la responsabilité du client\n- Vérifiez la ventilation des taux sur les devis mixtes\n- Conservez les attestations pendant 5 ans minimum\n:::",
    ],
    "image": "/images/blog/tva-travaux.jpg",
    "author": "Claire Dubois",
    "authorBio": CLAIRE,
    "date": "2026-01-08",
    "updatedDate": "2026-02-07",
    "readTime": "11 min",
    "category": "Réglementation",
    "tags": ["TVA", "Fiscalité", "Rénovation", "Travaux"],
    "faq": [
        {"question": "La TVA réduite s'applique-t-elle aux résidences secondaires ?", "answer": "Oui, la TVA à 10 % et à 5,5 % s'appliquent aux résidences secondaires de plus de 2 ans, à condition qu'elles soient affectées à l'habitation. Les locaux professionnels et commerciaux ne sont pas éligibles."},
        {"question": "Qui est responsable en cas d'erreur de taux de TVA ?", "answer": "Le client est responsable de l'exactitude des informations déclarées sur l'attestation (ancienneté du logement, affectation). L'artisan est responsable de la bonne application du taux sur la facture. En cas de redressement, les deux parties peuvent être mises en cause."},
        {"question": "Peut-on bénéficier de la TVA réduite en fournissant soi-même les matériaux ?", "answer": "Non, la TVA réduite s'applique uniquement aux matériaux fournis et posés par le professionnel. Si vous achetez les matériaux vous-même, ils seront facturés à 20 % en magasin."},
    ],
})

# For the remaining articles, I'll add the enhancements (callouts, faq, authorBio, updatedDate)
# to the existing content structure but keep them more concise to fit

# ─── 3: permis-construire-declaration-prealable-guide ───
articles.append({
    "slug": "permis-construire-declaration-prealable-guide",
    "title": "Permis de construire ou déclaration préalable : que choisir ?",
    "excerpt": "Selon la nature et l'ampleur de vos travaux, vous devez déposer un permis de construire ou une simple déclaration préalable. Voici comment faire le bon choix.",
    "content": [
        "Avant de lancer vos travaux, une question administrative cruciale se pose : faut-il un permis de construire (PC) ou une déclaration préalable de travaux (DP) ? Le Code de l'urbanisme (articles R.421-1 à R.421-17) définit précisément les seuils. Se tromper de procédure expose à des sanctions pouvant aller jusqu'à la démolition de l'ouvrage.",
        "## Quand faut-il une déclaration préalable ?\n\nLa DP est requise pour :\n\n- Les constructions nouvelles créant entre 5 et 20 m² de surface de plancher\n- Les modifications de l'aspect extérieur (ravalement, changement de fenêtres)\n- Les changements de destination sans modification de structure\n- Les clôtures dans certaines zones protégées\n- Les piscines de 10 à 100 m² non couvertes\n\n:::info Bon à savoir\nEn zone urbaine couverte par un PLU, le seuil de la déclaration préalable est relevé à 40 m² pour les extensions (au lieu de 20 m²). Cela facilite considérablement les projets d'agrandissement en ville.\n:::",
        "## Quand faut-il un permis de construire ?\n\nLe PC est obligatoire pour :\n\n- Les constructions de plus de 20 m² (ou 40 m² en zone PLU urbaine)\n- Les changements de destination avec modification de structure\n- Tout projet portant la surface totale au-delà de 150 m² (recours à un architecte obligatoire, article R.431-2)\n\n### Les délais d'instruction en 2026\n\n| Procédure | Délai d'instruction |\n| --- | --- |\n| Déclaration préalable | 1 mois (2 mois en zone ABF) |\n| PC maison individuelle | 2 mois |\n| PC autres projets | 3 mois |\n\n:::warning Attention\nSans réponse dans le délai d'instruction, l'autorisation est réputée accordée tacitement. Cependant, demandez toujours un certificat de non-opposition en mairie pour prouver l'accord tacite — c'est indispensable pour les banques et assureurs.\n:::",
        "## Le contenu du dossier et les erreurs fréquentes\n\n### Pour une DP\n\nCerfa n° 13703*09, plan de situation, plan de masse, plans de façades, insertion paysagère.\n\n### Pour un PC\n\nCerfa n° 13406*10 avec notice descriptive, plan en coupe du terrain, attestation [RE2020](/blog/reglementation-thermique-re2020-impact) et éventuellement attestation de l'architecte.\n\n### Les erreurs fréquentes\n\n- Sous-estimer la surface créée (oublier les combles aménageables, mezzanines)\n- Oublier l'emprise au sol des débords de toiture\n- Ne pas vérifier le PLU (hauteur maximale, couleur de façade, pente de toit)\n- Ignorer les servitudes d'urbanisme\n\n## Cas particulier : les zones ABF\n\nÀ proximité d'un monument historique (périmètre de 500 m) ou en site patrimonial remarquable, l'Architecte des Bâtiments de France doit donner un avis conforme. Le délai est majoré d'un mois.\n\n## Que faire en cas de refus ?\n\nVous disposez de 2 mois pour un recours gracieux auprès du maire, puis d'un recours contentieux devant le tribunal administratif.\n\n:::tip Conseil pro\nAvant tout projet, consultez le PLU de votre commune et le cadastre sur geoportail-urbanisme.gouv.fr. Les artisans référencés sur notre plateforme connaissent les démarches administratives et peuvent vous orienter.\n:::\n\n:::takeaway\n- Déclaration préalable : 5 à 20 m² (ou 40 m² en zone PLU urbaine)\n- Permis de construire : au-delà de 20 m² (ou 40 m² en zone PLU)\n- Architecte obligatoire si la surface totale dépasse 150 m²\n- Délais : 1 mois (DP), 2-3 mois (PC), +1 mois en zone ABF\n- Absence d'autorisation : amende de 1 200 à 6 000 €/m² + démolition possible\n:::",
    ],
    "image": "/images/blog/permis-construire.jpg",
    "author": "Isabelle Renault",
    "authorBio": ISABELLE,
    "date": "2026-01-11",
    "updatedDate": "2026-02-07",
    "readTime": "12 min",
    "category": "Réglementation",
    "tags": ["Permis de construire", "Urbanisme", "Déclaration préalable", "Travaux"],
    "faq": [
        {"question": "Peut-on commencer les travaux dès le dépôt de la demande ?", "answer": "Non, vous devez attendre la fin du délai d'instruction ET l'affichage de l'autorisation sur le terrain pendant 2 mois (délai de recours des tiers). Des travaux commencés prématurément sont considérés comme réalisés sans autorisation."},
        {"question": "Faut-il un architecte pour une extension de 35 m² ?", "answer": "Non, sauf si la surface totale de la maison après extension dépasse 150 m². En dessous de ce seuil, vous pouvez déposer le dossier vous-même."},
        {"question": "Combien de temps un permis de construire est-il valable ?", "answer": "Un permis de construire est valable 3 ans. Les travaux doivent commencer dans ce délai. Une prolongation d'un an est possible sur demande avant l'expiration."},
    ],
})

# Write to JSON for further assembly
with open('/tmp/regl_part1.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Regl Part 1: {len(articles)} articles written")
