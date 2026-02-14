#!/usr/bin/env python3
"""Enhance remaining reglementation articles by adding callouts, FAQ, authorBio, updatedDate."""
import json, re

ISABELLE = "Isabelle Renault, juriste spécialisée en droit de la construction et de l'immobilier, décrypte la réglementation pour les propriétaires."
MARC = "Marc Lefebvre, ingénieur thermicien et rédacteur technique, vulgarise les aspects complexes de la rénovation énergétique."
CLAIRE = "Claire Dubois, experte en économie de la construction, analyse les prix du marché et les aides financières pour informer les consommateurs."

# Map slug -> enhancements
enhancements = {
    "reception-travaux-proces-verbal-reserves": {
        "author": "Isabelle Renault", "authorBio": ISABELLE, "updatedDate": "2026-02-10", "readTime": "12 min",
        "extra_content": [
            "\n\n:::warning Attention\nSans réception formelle, vous êtes dans un flou juridique dangereux. Les garanties légales (parfait achèvement, biennale, décennale) ne commencent à courir qu'à partir de la date de réception.\n:::",
            "\n\n:::tip Conseil pro\nFaites-vous accompagner par un expert en bâtiment lors de la réception des travaux importants (coût : 300 à 800 €). Un professionnel détectera des défauts invisibles pour un non-initié.\n:::",
            "\n\n:::info Bon à savoir\nL'article 1er de la loi du 19 décembre 1990 autorise la consignation de 5 % du prix total jusqu'à la levée des réserves. Si les réserves ne sont pas levées dans le délai convenu, vous pouvez utiliser cette somme pour faire intervenir un autre artisan.\n:::",
            "\n\n:::takeaway\n- La réception est le point de départ des trois garanties légales\n- Exigez toujours un PV de réception écrit, daté et signé\n- Formulez des réserves précises avec photos à l'appui\n- Retenez 5 % du prix jusqu'à la levée des réserves\n- Ne payez jamais l'intégralité sans réception formelle\n- Faites-vous accompagner par un expert pour les gros chantiers\n:::",
        ],
        "faq": [
            {"question": "Peut-on refuser de signer le PV de réception ?", "answer": "Oui, si les travaux ne sont pas terminés ou si les désordres sont trop importants. Le refus doit être motivé par écrit. L'artisan devra corriger avant de solliciter une nouvelle réception."},
            {"question": "Que se passe-t-il si l'artisan refuse de venir à la réception ?", "answer": "Envoyez-lui une convocation par LRAR avec un délai de 15 jours. S'il ne se présente pas, vous pouvez procéder à une réception unilatérale, idéalement en présence d'un huissier."},
            {"question": "La réception tacite est-elle valable ?", "answer": "Oui, si vous prenez possession de l'ouvrage et payez l'intégralité sans réserves, les tribunaux peuvent considérer la réception acquise tacitement. Vous perdez alors la possibilité de formuler des réserves."},
        ],
    },
    "litige-artisan-recours-mediation-justice": {
        "author": "Isabelle Renault", "authorBio": ISABELLE, "updatedDate": "2026-02-10", "readTime": "13 min",
        "extra_content": [
            "\n\n:::warning Attention\nNe laissez pas passer les délais de prescription ! Action pour malfaçon (hors décennale) : 5 ans. Décennale : 10 ans. Parfait achèvement : 1 an. Biennale : 2 ans. Passé ces délais, vos recours sont éteints.\n:::",
            "\n\n:::tip Conseil pro\nVotre assurance protection juridique (souvent incluse dans l'assurance habitation) peut prendre en charge les frais d'avocat et d'expertise. Vérifiez votre contrat avant d'engager des frais.\n:::",
            "\n\n:::budget\n| Recours | Coût estimé |\n| Conciliation | Gratuit |\n| Médiation | Gratuit pour le consommateur |\n| Expertise amiable | 800 - 2 000 € |\n| Avocat | 1 500 - 5 000 € |\n| Expertise judiciaire | 2 000 - 8 000 € |\n:::",
            "\n\n:::takeaway\n- Commencez toujours par une réclamation amiable par LRAR\n- La médiation est gratuite et obligatoire avant la justice pour les litiges < 5 000 €\n- Le référé expertise est l'arme efficace en cas d'urgence\n- Votre assurance protection juridique peut couvrir les frais\n- Conservez tous les documents : contrat, devis, factures, photos, échanges\n- Les délais de prescription varient de 1 à 10 ans selon la garantie\n:::",
        ],
        "faq": [
            {"question": "Combien de temps dure une procédure judiciaire en droit de la construction ?", "answer": "En première instance, comptez 12 à 24 mois avec expertise judiciaire. En appel, 12 à 18 mois supplémentaires. La médiation est beaucoup plus rapide : 90 jours maximum."},
            {"question": "Peut-on engager un autre artisan pour finir les travaux ?", "answer": "Oui, après une mise en demeure restée sans effet. Faites constater l'état d'avancement par un huissier avant de faire intervenir un autre professionnel. Conservez les factures pour demander remboursement."},
            {"question": "La médiation est-elle obligatoire avant d'aller en justice ?", "answer": "Pour les litiges inférieurs à 5 000 €, une tentative de résolution amiable (médiation ou conciliation) est obligatoire avant toute saisine du tribunal. Au-delà, elle est fortement recommandée mais pas obligatoire."},
        ],
    },
    "label-rge-artisan-travaux-energetiques": {
        "author": "Marc Lefebvre", "authorBio": MARC, "updatedDate": "2026-02-10", "readTime": "11 min",
        "extra_content": [
            "\n\n:::warning Attention\nSans artisan RGE, pas de MaPrimeRénov', pas de CEE, pas d'éco-PTZ, pas de TVA à 5,5 %. Le label RGE est la clé d'entrée de toutes les aides à la rénovation énergétique. Choisir un artisan non-RGE revient à renoncer à des milliers d'euros d'aides.\n:::",
            "\n\n:::tip Conseil pro\nVérifiez la qualification RGE sur france-renov.gouv.fr et non uniquement sur le certificat présenté par l'artisan. Un certificat expiré ou ne couvrant pas le type de travaux prévu ne vous donne pas droit aux aides.\n:::",
            "\n\n:::takeaway\n- Le label RGE est obligatoire pour accéder aux aides publiques\n- Vérifiez la validité et le domaine de compétence sur france-renov.gouv.fr\n- Les principales mentions : Qualibat RGE, QualiPAC, Qualibois, Qualisol, QualiPV\n- La qualification est valable 4 ans avec audit de suivi tous les 2 ans\n- L'usurpation du label RGE est une pratique trompeuse sanctionnée\n- Sur ServicesArtisans, la qualification RGE est vérifiée et affichée\n:::",
        ],
        "faq": [
            {"question": "Comment vérifier qu'un artisan est bien RGE ?", "answer": "Consultez l'annuaire officiel sur france-renov.gouv.fr. Recherchez par nom, SIRET ou localisation. Le certificat doit mentionner les domaines de compétence et la date de validité."},
            {"question": "Un artisan peut-il perdre son label RGE ?", "answer": "Oui, en cas de non-conformité lors d'un audit de suivi, de plaintes répétées ou de non-respect des critères. L'organisme de qualification suspend ou retire le label."},
            {"question": "Le label RGE garantit-il la qualité des travaux ?", "answer": "Le label garantit une compétence technique attestée par formation, références et audits. Cependant, il ne garantit pas la qualité de chaque chantier individuel. Les avis clients restent un complément indispensable."},
        ],
    },
    "qualibat-qualifelec-certifications-batiment": {
        "author": "Marc Lefebvre", "authorBio": MARC, "updatedDate": "2026-02-09", "readTime": "11 min",
        "extra_content": [
            "\n\n:::info Bon à savoir\nChaque organisme de certification dispose d'un annuaire en ligne : qualibat.com, qualifelec.fr, qualit-enr.org. Recherchez par nom, SIRET ou localisation. Le certificat doit mentionner la raison sociale, le SIRET, les domaines de qualification et la validité.\n:::",
            "\n\n:::warning Attention\nAttention à la différence entre une certification (vérifiée par un organisme indépendant) et une simple déclaration de compétence. Seule la certification offre une garantie vérifiée par des audits réguliers.\n:::",
            "\n\n:::takeaway\n- Qualibat : référence du bâtiment (400+ domaines)\n- Qualifelec : expertise électrique et domotique\n- Qualit'EnR : énergies renouvelables (PAC, solaire, bois)\n- Qualigaz : installations gaz\n- Vérifiez toujours sur les annuaires officiels en ligne\n- Certification ≠ déclaration : seule la certification est vérifiée par un tiers\n:::",
        ],
        "faq": [
            {"question": "Un artisan peut-il exercer sans certification ?", "answer": "Oui, la certification n'est pas obligatoire pour exercer. Cependant, certaines qualifications (RGE notamment) sont obligatoires pour que les clients bénéficient des aides publiques."},
            {"question": "Combien coûte une certification pour un artisan ?", "answer": "Qualibat : 300 à 800 €/an. Qualifelec : 400 à 1 200 €/an. Qualit'EnR : 200 à 600 € par qualification. Ces coûts sont un investissement dans la qualité et la crédibilité professionnelle."},
            {"question": "Comment savoir quelle certification exiger pour mes travaux ?", "answer": "Qualibat pour le bâtiment général, Qualifelec pour l'électricité, Qualit'EnR pour les ENR (PAC, solaire), Qualigaz pour le gaz. Pour les aides publiques, la mention RGE est indispensable."},
        ],
    },
    "diagnostic-immobilier-obligatoire-liste": {
        "author": "Isabelle Renault", "authorBio": ISABELLE, "updatedDate": "2026-02-10", "readTime": "12 min",
        "extra_content": [
            "\n\n:::budget\n| Diagnostic | Coût moyen | Validité |\n| DPE | 100 - 250 € | 10 ans |\n| Amiante | 80 - 150 € | Illimitée si négatif |\n| Plomb (CREP) | 100 - 200 € | Illimitée si négatif |\n| Électricité | 80 - 150 € | 3 ans (vente), 6 ans (location) |\n| Gaz | 100 - 150 € | 3 ans (vente), 6 ans (location) |\n| Termites | 100 - 200 € | 6 mois |\n| Pack complet (appartement) | 400 - 700 € | Variable |\n| Pack complet (maison) | 500 - 900 € | Variable |\n:::",
            "\n\n:::tip Conseil pro\nRegroupez tous les diagnostics chez un même prestataire pour obtenir un tarif pack. Comparez au moins 3 devis. Anticipez : certains diagnostics (termites, ERP) ne sont valables que 6 mois.\n:::",
            "\n\n:::takeaway\n- Le DPE est obligatoire pour toute vente et location (10 ans de validité)\n- Amiante obligatoire pour les biens construits avant juillet 1997\n- Plomb obligatoire pour les biens construits avant janvier 1949\n- Électricité et gaz obligatoires pour les installations de plus de 15 ans\n- Pack complet : 400-700 € (appartement), 500-900 € (maison)\n- Anticipez les diagnostics à courte validité (termites, ERP : 6 mois)\n:::",
        ],
        "faq": [
            {"question": "Qui paie les diagnostics : le vendeur ou l'acheteur ?", "answer": "Les diagnostics sont à la charge du vendeur (pour une vente) ou du propriétaire bailleur (pour une location). L'acheteur ou le locataire ne paie rien."},
            {"question": "Que se passe-t-il si un diagnostic est manquant ?", "answer": "En cas de vente, le vendeur ne peut pas se prévaloir de la clause d'exonération des vices cachés pour les défauts qui auraient été révélés par le diagnostic manquant. En location, le locataire peut demander l'annulation du bail ou une diminution du loyer."},
            {"question": "Les diagnostics sont-ils obligatoires pour une donation ?", "answer": "Oui, les mêmes diagnostics que pour une vente sont obligatoires en cas de donation. Le DDT (Dossier de Diagnostics Techniques) doit être annexé à l'acte notarié."},
        ],
    },
    "amiante-plomb-diagnostic-avant-travaux": {
        "author": "Isabelle Renault", "authorBio": ISABELLE, "updatedDate": "2026-02-10", "readTime": "12 min",
        "extra_content": [
            "\n\n:::warning Attention\nLe non-respect des obligations de diagnostic amiante et plomb avant travaux est puni de 9 000 € d'amende (article L.4741-1 du Code du travail). En cas de mise en danger, jusqu'à 15 000 € d'amende et un an d'emprisonnement.\n:::",
            "\n\n:::budget\n| Diagnostic | Coût moyen |\n| Diagnostic amiante avant travaux (DAAT) | 200 - 800 € |\n| Diagnostic plomb avant travaux | 150 - 400 € |\n| Désamiantage | 25 - 90 €/m² |\n| Traitement plomb (décapage) | 30 - 80 €/m² |\n:::",
            "\n\n:::tip Conseil pro\nN'entamez jamais de travaux dans un bâtiment ancien sans les diagnostics amiante et plomb. Sur notre plateforme, les professionnels référencés connaissent ces obligations et sauront vous orienter vers des diagnostiqueurs certifiés.\n:::",
            "\n\n:::takeaway\n- DAAT obligatoire avant travaux dans les bâtiments d'avant juillet 1997\n- Diagnostic plomb obligatoire dans les bâtiments d'avant janvier 1949\n- L'amiante se trouve dans les dalles, colles, plaques fibrociment, flocages\n- Le plomb se trouve dans les peintures anciennes et les canalisations\n- Le désamiantage doit être réalisé par une entreprise certifiée\n- Sanctions : jusqu'à 15 000 € d'amende et 1 an d'emprisonnement\n:::",
        ],
        "faq": [
            {"question": "Comment savoir si mon bâtiment contient de l'amiante ?", "answer": "Tout bâtiment construit avant le 1er juillet 1997 est susceptible de contenir de l'amiante. Seul un diagnostic amiante réalisé par un professionnel certifié peut confirmer sa présence ou son absence."},
            {"question": "Peut-on réaliser soi-même des travaux dans un bâtiment contenant de l'amiante ?", "answer": "Non, les travaux en présence d'amiante sont strictement encadrés par le Code du travail. Le retrait doit être effectué par une entreprise certifiée, avec un plan de retrait soumis à l'inspection du travail."},
            {"question": "Que faire si on découvre de l'amiante en cours de chantier ?", "answer": "Arrêtez immédiatement les travaux, évacuez la zone et faites appel à un diagnostiqueur certifié. Un plan de retrait devra être élaboré et soumis à l'inspection du travail avant toute reprise."},
        ],
    },
    "accessibilite-pmr-logement-normes": {
        "author": "Claire Dubois", "authorBio": CLAIRE, "updatedDate": "2026-02-10", "readTime": "12 min",
        "extra_content": [
            "\n\n:::budget\n| Travaux d'adaptation | Prix moyen |\n| Remplacement baignoire par douche italienne | 3 000 - 8 000 € |\n| Élargissement de portes | 500 - 1 500 €/porte |\n| Rampe d'accès | 1 500 - 5 000 € |\n| Monte-escalier | 5 000 - 15 000 € |\n| Motorisation volets | 300 - 800 €/fenêtre |\n| Cuisine adaptée | 2 000 - 6 000 € |\n:::",
            "\n\n:::info Bon à savoir\nMaPrimeAdapt', lancée le 1er janvier 2024, finance jusqu'à 70 % des travaux d'adaptation pour les personnes âgées de plus de 70 ans ou en situation de handicap, sous conditions de revenus. Plafond : 22 000 € de travaux, soit une aide maximale de 15 400 €.\n:::",
            "\n\n:::tip Conseil pro\nAvant de commencer les travaux, faites évaluer vos besoins par un ergothérapeute (200 à 500 €, prise en charge possible). Ce professionnel analyse les capacités de la personne et préconise les aménagements adaptés.\n:::",
            "\n\n:::takeaway\n- Normes PMR : portes 90 cm, couloirs 120 cm, douche plain-pied, WC avec aire de 150 cm\n- MaPrimeAdapt' finance jusqu'à 70 % des travaux (plafond 15 400 €)\n- Crédit d'impôt de 25 % pour l'accessibilité (plafond 5 000 €/personne)\n- TVA réduite à 10 % (certains équipements à 5,5 %)\n- Consultez un ergothérapeute pour définir les aménagements adaptés\n- Aides complémentaires : ANAH, caisses de retraite, collectivités locales\n:::",
        ],
        "faq": [
            {"question": "MaPrimeAdapt' est-elle accessible à tous ?", "answer": "Non, elle est réservée aux personnes de plus de 70 ans ou en situation de handicap (GIR 1 à 6, taux d'incapacité ≥ 50 %), sous conditions de revenus. Les propriétaires occupants et bailleurs sont éligibles."},
            {"question": "Faut-il un artisan spécialisé PMR ?", "answer": "Ce n'est pas obligatoire mais fortement recommandé. Un artisan expérimenté en normes PMR garantit le respect des dimensions, pentes et caractéristiques réglementaires. Demandez des références en accessibilité."},
            {"question": "La douche à l'italienne est-elle obligatoire en PMR ?", "answer": "La norme exige une douche de plain-pied sans seuil supérieur à 2 cm. La douche à l'italienne répond naturellement à cette exigence et est la solution la plus couramment installée."},
        ],
    },
    "reglementation-ravalement-facade-obligations": {
        "author": "Isabelle Renault", "authorBio": ISABELLE, "updatedDate": "2026-02-09", "readTime": "11 min",
        "extra_content": [
            "\n\n:::warning Attention\nSi le propriétaire ne respecte pas l'obligation de ravalement, le maire peut prendre un arrêté d'injonction de ravaler dans un délai de 6 mois. En cas de non-exécution, les travaux peuvent être réalisés d'office aux frais du propriétaire.\n:::",
            "\n\n:::budget\n| Type de ravalement | Prix moyen |\n| Nettoyage et peinture | 30 - 60 €/m² |\n| Ravalement complet avec réparation | 50 - 100 €/m² |\n| Ravalement avec ITE | 100 - 200 €/m² |\n| Immeuble 300 m² de façade | 15 000 - 60 000 € |\n:::",
            "\n\n:::tip Conseil pro\nProfitez d'un ravalement obligatoire pour ajouter une isolation par l'extérieur (ITE). Le surcoût est amorti par les économies d'énergie et les aides (MaPrimeRénov', CEE). Depuis le décret n° 2016-711, un ravalement important doit s'accompagner d'une isolation thermique.\n:::",
            "\n\n:::takeaway\n- Le ravalement est une obligation légale (décennale dans certaines communes)\n- Déclaration préalable requise (sauf si identique à l'existant)\n- Obligation d'isolation lors d'un ravalement important (décret 2016-711)\n- Prix : 30-60 €/m² (nettoyage) à 100-200 €/m² (avec ITE)\n- Aides disponibles si le ravalement inclut une ITE\n- En copropriété : vote en AG à la majorité de l'article 25\n:::",
        ],
        "faq": [
            {"question": "Le ravalement est-il obligatoire dans toutes les communes ?", "answer": "Non, seules les communes ayant pris un arrêté en ce sens imposent un ravalement périodique. À Paris, l'obligation est décennale. Renseignez-vous en mairie."},
            {"question": "Faut-il une autorisation pour un ravalement ?", "answer": "Une déclaration préalable est nécessaire sauf si les travaux ne modifient pas l'aspect extérieur. En zone ABF, l'avis de l'Architecte des Bâtiments de France est requis dans tous les cas."},
            {"question": "L'isolation est-elle obligatoire lors d'un ravalement ?", "answer": "Depuis le décret n° 2016-711, un ravalement touchant plus de 50 % de la surface de façade doit s'accompagner d'une isolation thermique, sauf impossibilité technique ou surcoût disproportionné (plus de 5 ans de retour sur investissement)."},
        ],
    },
    "urbanisme-regles-construction-extension": {
        "author": "Isabelle Renault", "authorBio": ISABELLE, "updatedDate": "2026-02-09", "readTime": "12 min",
        "extra_content": [
            "\n\n:::info Bon à savoir\nDemandez un certificat d'urbanisme opérationnel (cerfa n° 13410*05) en mairie avant tout projet. Gratuit, il vous indique les règles applicables, les servitudes et les taxes. Validité : 18 mois.\n:::",
            "\n\n:::warning Attention\nTout projet est soumis à la taxe d'aménagement (articles L.331-1 et suivants). Son montant dépend de la surface créée et du taux communal (1 à 5 %). Pour une extension de 40 m², comptez 2 000 à 5 000 € de taxe.\n:::",
            "\n\n:::takeaway\n- Le PLU fixe les règles de constructibilité de chaque parcelle\n- Distances : variable selon le PLU (5-10 m de la voie, H/2 des limites)\n- Extensions < 5 m² : pas de formalité. 5-40 m² : DP. > 40 m² : PC\n- Surface totale > 150 m² : architecte obligatoire\n- Certificat d'urbanisme : gratuit et indispensable avant tout projet\n- Taxe d'aménagement : 1 à 5 % de la surface créée × valeur forfaitaire\n:::",
        ],
        "faq": [
            {"question": "Où consulter le PLU de ma commune ?", "answer": "Le PLU est consultable en mairie (service urbanisme) et sur geoportail-urbanisme.gouv.fr. Demandez un extrait du règlement pour votre parcelle et un certificat d'urbanisme pour connaître précisément vos droits à construire."},
            {"question": "Peut-on construire en limite de propriété ?", "answer": "Cela dépend du PLU. Certaines zones autorisent la construction en limite séparative, d'autres imposent un recul minimum (souvent 3 m ou la moitié de la hauteur). Consultez le règlement de zone."},
            {"question": "La taxe d'aménagement s'applique-t-elle aux extensions ?", "answer": "Oui, la taxe d'aménagement s'applique à toute surface de plancher créée, y compris les extensions. Le taux communal varie de 1 à 5 %. La valeur forfaitaire est d'environ 886 €/m² en 2026 hors Île-de-France."},
        ],
    },
    "aides-renovation-2026-cumul-guide": {
        "author": "Claire Dubois", "authorBio": CLAIRE, "updatedDate": "2026-02-11", "readTime": "14 min",
        "extra_content": [
            "\n\n:::tip Conseil pro\nLe calendrier idéal : Mois 1-2 : audit énergétique. Mois 2-3 : devis d'artisans RGE. Mois 3-4 : inscription CEE (avant les devis !), dépôt MaPrimeRénov', demande éco-PTZ. Mois 4-5 : signature des devis. Mois 5-8 : travaux. Mois 8-9 : factures et perception des aides.\n:::",
            "\n\n:::warning Attention\nLes erreurs qui font perdre des aides : signer le devis avant l'inscription CEE, commencer les travaux avant l'accord MaPrimeRénov', choisir un artisan non-RGE, ne pas demander l'éco-PTZ avant le début des travaux, oublier les aides locales.\n:::",
            "\n\n:::budget\n| Exemple : rénovation globale maison 100 m² classée F |\n| Travaux (isolation + fenêtres + PAC) | 45 000 € TTC |\n| MaPrimeRénov' (80 %, ménage modeste) | -36 000 € |\n| CEE Coup de pouce | -5 000 € |\n| Reste à charge | 4 000 € |\n| Éco-PTZ (15 ans) | 22 €/mois |\n:::",
            "\n\n:::takeaway\n- Toutes les aides sont cumulables (MaPrimeRénov' + CEE + éco-PTZ + TVA 5,5 % + aides locales)\n- La rénovation globale offre les taux de prise en charge les plus élevés (60-90 %)\n- L'Accompagnateur Rénov' est obligatoire pour le Parcours accompagné\n- Respectez scrupuleusement le calendrier d'inscription aux aides\n- Le reste à charge peut descendre à moins de 10 % pour les ménages modestes\n- N'oubliez pas les aides locales (régions, départements, communes)\n:::",
        ],
        "faq": [
            {"question": "Quel est le reste à charge minimum possible ?", "answer": "Pour les ménages très modestes en rénovation globale, le reste à charge peut descendre à 5-10 % du coût total grâce au cumul MaPrimeRénov' (90 %) + CEE + éco-PTZ. Le total des aides ne peut pas dépasser 100 % du coût TTC."},
            {"question": "L'Accompagnateur Rénov' est-il obligatoire ?", "answer": "Oui, pour le Parcours accompagné de MaPrimeRénov'. Il réalise l'audit, propose les scénarios de travaux et monte les dossiers. Coût : 1 000 à 2 000 €, pris en charge à 100 % pour les ménages modestes."},
            {"question": "Peut-on cumuler les aides locales avec MaPrimeRénov' ?", "answer": "Oui, les aides locales sont cumulables avec toutes les aides nationales, sous réserve que le total ne dépasse pas 100 % du coût TTC des travaux. Renseignez-vous auprès de votre mairie ou sur aides-territoires.beta.gouv.fr."},
        ],
    },
    "contrat-travaux-clauses-essentielles": {
        "author": "Isabelle Renault", "authorBio": ISABELLE, "updatedDate": "2026-02-11", "readTime": "13 min",
        "extra_content": [
            "\n\n:::warning Attention\nRefusez les clauses abusives : clause excluant la garantie décennale (illégale), clause imposant un tribunal éloigné, clause autorisant des modifications de prix unilatérales, clause imposant un paiement intégral avant la fin des travaux.\n:::",
            "\n\n:::tip Conseil pro\nNe signez jamais dans la précipitation. Prenez le temps de lire et de vérifier toutes les clauses. Un bon contrat protège les deux parties et prévient les litiges. Consultez un juriste en droit de la construction pour les marchés importants (> 20 000 €).\n:::",
            "\n\n:::info Bon à savoir\nPour la construction de maison individuelle, le CCMI (loi du 19 décembre 1990) offre des protections renforcées : prix ferme et définitif, pénalités de retard automatiques, garantie de livraison à prix et délais convenus.\n:::",
            "\n\n:::takeaway\n- Le contrat doit identifier les parties (avec SIRET vérifiable)\n- Description détaillée des travaux : nature, matériaux, quantités, prix\n- Échéancier de paiement avec acompte maximum de 30 %\n- Délais d'exécution avec pénalités de retard\n- Assurances en annexe (RC Pro + décennale)\n- Clause de réception avec retenue de garantie de 5 %\n- Clause de médiation préalable obligatoire\n:::",
        ],
        "faq": [
            {"question": "Un contrat écrit est-il obligatoire ?", "answer": "Non, le Code civil n'impose pas de formalisme pour les marchés privés. Cependant, un contrat écrit est votre meilleure protection en cas de litige. Sans écrit, c'est parole contre parole devant le tribunal."},
            {"question": "L'artisan peut-il modifier le prix en cours de chantier ?", "answer": "Non, sauf imprévu majeur non décelable au moment du devis. Toute modification doit faire l'objet d'un avenant écrit signé par les deux parties, avec un devis complémentaire accepté."},
            {"question": "Que doit contenir un avenant au contrat ?", "answer": "L'avenant doit décrire précisément les modifications (travaux supplémentaires, changement de matériaux), le surcoût ou l'économie associée, l'impact sur les délais, et être signé par les deux parties avant exécution."},
        ],
    },
}

# Now write all enhanced articles
with open('/tmp/regl_enhancements.json', 'w', encoding='utf-8') as f:
    json.dump(enhancements, f, ensure_ascii=False, indent=2)

print(f"Enhancements written for {len(enhancements)} articles")
