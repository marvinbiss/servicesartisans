interface InternalLink {
  text: string
  href: string
}

/**
 * Maps keywords found in article slugs and tags to their corresponding
 * service pages. Used to generate contextual "Services associés" links.
 */
const serviceMapping: Record<string, { slug: string; label: string }> = {
  // Plombier / Plomberie
  'plombier': { slug: 'plombier', label: 'plombier' },
  'plomberie': { slug: 'plombier', label: 'plombier' },
  'canalisations': { slug: 'plombier', label: 'plombier' },
  // Électricien / Électricité
  'électricien': { slug: 'electricien', label: 'électricien' },
  'electricien': { slug: 'electricien', label: 'électricien' },
  'électricité': { slug: 'electricien', label: 'électricien' },
  'electricite': { slug: 'electricien', label: 'électricien' },
  'domotique': { slug: 'electricien', label: 'électricien' },
  // Serrurier / Serrurerie
  'serrurier': { slug: 'serrurier', label: 'serrurier' },
  'serrurerie': { slug: 'serrurier', label: 'serrurier' },
  'serrure': { slug: 'serrurier', label: 'serrurier' },
  // Chauffagiste / Chauffage
  'chauffagiste': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chauffage': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chaudière': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chaudiere': { slug: 'chauffagiste', label: 'chauffagiste' },
  'pompe à chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
  'pompe-a-chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
  // Menuisier / Menuiserie
  'menuisier': { slug: 'menuisier', label: 'menuisier' },
  'menuiserie': { slug: 'menuisier', label: 'menuisier' },
  'fenêtre': { slug: 'menuisier', label: 'menuisier' },
  'fenêtres': { slug: 'menuisier', label: 'menuisier' },
  'fenetres': { slug: 'menuisier', label: 'menuisier' },
  // Carreleur / Carrelage
  'carreleur': { slug: 'carreleur', label: 'carreleur' },
  'carrelage': { slug: 'carreleur', label: 'carreleur' },
  // Couvreur / Toiture
  'couvreur': { slug: 'couvreur', label: 'couvreur' },
  'toiture': { slug: 'couvreur', label: 'couvreur' },
  'couverture': { slug: 'couvreur', label: 'couvreur' },
  // Peintre en bâtiment
  'peintre': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'peinture': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'ravalement': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'façade': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  // Maçon / Maçonnerie
  'maçon': { slug: 'macon', label: 'maçon' },
  'macon': { slug: 'macon', label: 'maçon' },
  'maçonnerie': { slug: 'macon', label: 'maçon' },
  'maconnerie': { slug: 'macon', label: 'maçon' },
  'gros œuvre': { slug: 'macon', label: 'maçon' },
  // Climaticien / Climatisation
  'climaticien': { slug: 'climaticien', label: 'climaticien' },
  'climatisation': { slug: 'climaticien', label: 'climaticien' },
  'pac air-air': { slug: 'climaticien', label: 'climaticien' },
  // Jardinier paysagiste
  'jardinier': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  'paysagiste': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  'jardin': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  'paysagisme': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  // Vitrier
  'vitrier': { slug: 'vitrier', label: 'vitrier' },
  'vitrerie': { slug: 'vitrier', label: 'vitrier' },
  'vitrage': { slug: 'vitrier', label: 'vitrier' },
  'double vitrage': { slug: 'vitrier', label: 'vitrier' },
  // Cuisiniste
  'cuisiniste': { slug: 'cuisiniste', label: 'cuisiniste' },
  'cuisine': { slug: 'cuisiniste', label: 'cuisiniste' },
  // Solier / Moquettiste
  'solier': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
  'parquet': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
  'revêtement de sol': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
  // Entreprise de nettoyage
  'nettoyage': { slug: 'entreprise-de-nettoyage', label: 'entreprise de nettoyage' },
  // Charpentier
  'charpentier': { slug: 'charpentier', label: 'charpentier' },
  'charpente': { slug: 'charpentier', label: 'charpentier' },
  // Terrassier
  'terrassier': { slug: 'terrassier', label: 'terrassier' },
  'terrassement': { slug: 'terrassier', label: 'terrassier' },
  // Zingueur
  'zingueur': { slug: 'zingueur', label: 'zingueur' },
  'zinguerie': { slug: 'zingueur', label: 'zingueur' },
  'gouttière': { slug: 'zingueur', label: 'zingueur' },
  'gouttiere': { slug: 'zingueur', label: 'zingueur' },
  // Étanchéiste
  'étanchéiste': { slug: 'etancheiste', label: 'étanchéiste' },
  'etancheiste': { slug: 'etancheiste', label: 'étanchéiste' },
  'étanchéité': { slug: 'etancheiste', label: 'étanchéiste' },
  'etancheite': { slug: 'etancheiste', label: 'étanchéiste' },
  // Façadier
  'façadier': { slug: 'facadier', label: 'façadier' },
  'facadier': { slug: 'facadier', label: 'façadier' },
  'enduit': { slug: 'facadier', label: 'façadier' },
  // Plâtrier
  'plâtrier': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  'platrier': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  'plaquiste': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  'placo': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  // Métallier / Ferronnier
  'métallier': { slug: 'metallier-serrurier', label: 'métallier serrurier' },
  'metallier': { slug: 'metallier-serrurier', label: 'métallier serrurier' },
  'ferronnier': { slug: 'ferronnier', label: 'ferronnier' },
  'ferronnerie': { slug: 'ferronnier', label: 'ferronnier' },
  // Storiste
  'storiste': { slug: 'storiste', label: 'storiste' },
  'store': { slug: 'storiste', label: 'storiste' },
  'volet roulant': { slug: 'storiste', label: 'storiste' },
  // Salle de bain
  'salle de bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'salle-de-bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  // Architecte intérieur / Décorateur
  'architecte intérieur': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'architecte-interieur': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'décorateur': { slug: 'decorateur-interieur', label: 'décorateur d\'intérieur' },
  'decorateur': { slug: 'decorateur-interieur', label: 'décorateur d\'intérieur' },
  'décoration': { slug: 'decorateur-interieur', label: 'décorateur d\'intérieur' },
  // Domoticien
  'domoticien': { slug: 'domoticien', label: 'domoticien' },
  'maison connectée': { slug: 'domoticien', label: 'domoticien' },
  // Pompe à chaleur (distinct du chauffagiste)
  'installateur pac': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  // Panneaux solaires
  'panneaux solaires': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'panneau solaire': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'photovoltaïque': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'photovoltaique': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  // Isolation thermique
  'isolation': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation thermique': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolant': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  // Rénovation énergétique
  'rénovation énergétique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'renovation-energetique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  // Borne de recharge
  'borne de recharge': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'borne-recharge': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'irve': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  // Ramoneur
  'ramoneur': { slug: 'ramoneur', label: 'ramoneur' },
  'ramonage': { slug: 'ramoneur', label: 'ramoneur' },
  // Pisciniste
  'pisciniste': { slug: 'pisciniste', label: 'pisciniste' },
  'piscine': { slug: 'pisciniste', label: 'pisciniste' },
  // Alarme / Sécurité
  'alarme': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'alarme-securite': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'vidéosurveillance': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  // Antenniste
  'antenniste': { slug: 'antenniste', label: 'antenniste' },
  'antenne': { slug: 'antenniste', label: 'antenniste' },
  // Ascensoriste
  'ascensoriste': { slug: 'ascensoriste', label: 'ascensoriste' },
  'ascenseur': { slug: 'ascensoriste', label: 'ascensoriste' },
  // Diagnostiqueur
  'diagnostiqueur': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic immobilier': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'dpe': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  // Géomètre
  'géomètre': { slug: 'geometre-expert', label: 'géomètre expert' },
  'geometre': { slug: 'geometre-expert', label: 'géomètre expert' },
  'bornage': { slug: 'geometre-expert', label: 'géomètre expert' },
  // Désinsectisation / Dératisation
  'désinsectisation': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'desinsectisation': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'punaise': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'dératisation': { slug: 'deratisation', label: 'dératiseur' },
  'deratisation': { slug: 'deratisation', label: 'dératiseur' },
  // Déménageur
  'déménageur': { slug: 'demenageur', label: 'déménageur' },
  'demenageur': { slug: 'demenageur', label: 'déménageur' },
  'déménagement': { slug: 'demenageur', label: 'déménageur' },
  'demenagement': { slug: 'demenageur', label: 'déménageur' },
  // Poseur de parquet
  'poseur de parquet': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'poseur-de-parquet': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'parquet massif': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'parquet flottant': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'parquet stratifié': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'parquet stratifie': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'pose parquet': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'vitrification': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'ponçage parquet': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  'poncage parquet': { slug: 'poseur-de-parquet', label: 'poseur de parquet' },
  // Miroitier
  'miroitier': { slug: 'miroitier', label: 'miroitier' },
  'miroiterie': { slug: 'miroitier', label: 'miroitier' },
  'miroir sur mesure': { slug: 'miroitier', label: 'miroitier' },
  'crédence verre': { slug: 'miroitier', label: 'miroitier' },
  'credence verre': { slug: 'miroitier', label: 'miroitier' },
  'verrière': { slug: 'miroitier', label: 'miroitier' },
  'verriere': { slug: 'miroitier', label: 'miroitier' },
  'paroi de douche': { slug: 'miroitier', label: 'miroitier' },
  // Ébéniste
  'ébéniste': { slug: 'ebeniste', label: 'ébéniste' },
  'ebeniste': { slug: 'ebeniste', label: 'ébéniste' },
  'ébénisterie': { slug: 'ebeniste', label: 'ébéniste' },
  'ebenisterie': { slug: 'ebeniste', label: 'ébéniste' },
  'meuble sur mesure': { slug: 'ebeniste', label: 'ébéniste' },
  'restauration meuble': { slug: 'ebeniste', label: 'ébéniste' },
  'marqueterie': { slug: 'ebeniste', label: 'ébéniste' },
  'bois massif': { slug: 'ebeniste', label: 'ébéniste' },
  // Paysagiste (service distinct de jardinier)
  'aménagement paysager': { slug: 'paysagiste', label: 'paysagiste' },
  'amenagement paysager': { slug: 'paysagiste', label: 'paysagiste' },
  'création jardin': { slug: 'paysagiste', label: 'paysagiste' },
  'creation jardin': { slug: 'paysagiste', label: 'paysagiste' },
  'conception paysagère': { slug: 'paysagiste', label: 'paysagiste' },
  'conception paysagere': { slug: 'paysagiste', label: 'paysagiste' },
  'engazonnement': { slug: 'paysagiste', label: 'paysagiste' },
  'arrosage automatique': { slug: 'paysagiste', label: 'paysagiste' },
  // Jardinier — mots-clés supplémentaires (slug correct : jardinier)
  'tonte': { slug: 'jardinier', label: 'jardinier' },
  'tonte pelouse': { slug: 'jardinier', label: 'jardinier' },
  'élagage': { slug: 'jardinier', label: 'jardinier' },
  'elagage': { slug: 'jardinier', label: 'jardinier' },
  'taille de haie': { slug: 'jardinier', label: 'jardinier' },
  'entretien jardin': { slug: 'jardinier', label: 'jardinier' },
  'désherbage': { slug: 'jardinier', label: 'jardinier' },
  'desherbage': { slug: 'jardinier', label: 'jardinier' },
  // Solier — mots-clés supplémentaires (slug correct : solier)
  'moquette': { slug: 'solier', label: 'solier moquettiste' },
  'sol souple': { slug: 'solier', label: 'solier moquettiste' },
  'lino': { slug: 'solier', label: 'solier moquettiste' },
  'linoleum': { slug: 'solier', label: 'solier moquettiste' },
  'sol pvc': { slug: 'solier', label: 'solier moquettiste' },
  'sol vinyle': { slug: 'solier', label: 'solier moquettiste' },
  // Nettoyage — mots-clés supplémentaires (slug correct : nettoyage)
  'nettoyage industriel': { slug: 'nettoyage', label: 'nettoyage professionnel' },
  'nettoyage professionnel': { slug: 'nettoyage', label: 'nettoyage professionnel' },
  'ménage': { slug: 'nettoyage', label: 'nettoyage professionnel' },
  'menage': { slug: 'nettoyage', label: 'nettoyage professionnel' },
  'propreté': { slug: 'nettoyage', label: 'nettoyage professionnel' },
  'proprete': { slug: 'nettoyage', label: 'nettoyage professionnel' },
  // Plâtrier — mots-clés supplémentaires (slug correct : platrier)
  'plâtre': { slug: 'platrier', label: 'plâtrier plaquiste' },
  'platre': { slug: 'platrier', label: 'plâtrier plaquiste' },
  'cloison': { slug: 'platrier', label: 'plâtrier plaquiste' },
  'faux plafond': { slug: 'platrier', label: 'plâtrier plaquiste' },
  'doublage': { slug: 'platrier', label: 'plâtrier plaquiste' },
  // Métallier — mots-clés supplémentaires (slug correct : metallier)
  'garde-corps': { slug: 'metallier', label: 'métallier' },
  'escalier métallique': { slug: 'metallier', label: 'métallier' },
  'escalier metallique': { slug: 'metallier', label: 'métallier' },
  'structure métallique': { slug: 'metallier', label: 'métallier' },
  'structure metallique': { slug: 'metallier', label: 'métallier' },
  'soudure': { slug: 'metallier', label: 'métallier' },
  // Décorateur — mots-clés supplémentaires (slug correct : decorateur)
  'home staging': { slug: 'decorateur', label: 'décorateur d\'intérieur' },
  'agencement intérieur': { slug: 'decorateur', label: 'décorateur d\'intérieur' },
  'agencement interieur': { slug: 'decorateur', label: 'décorateur d\'intérieur' },
  'relooking intérieur': { slug: 'decorateur', label: 'décorateur d\'intérieur' },
  'relooking interieur': { slug: 'decorateur', label: 'décorateur d\'intérieur' },
  // Diagnostiqueur — mots-clés supplémentaires (slug correct : diagnostiqueur)
  'diagnostic amiante': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic termites': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic plomb': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic gaz': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic électricité': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  'diagnostic electricite': { slug: 'diagnostiqueur', label: 'diagnostiqueur immobilier' },
  // Géomètre — mots-clés supplémentaires (slug correct : geometre)
  'cadastre': { slug: 'geometre', label: 'géomètre expert' },
  'arpentage': { slug: 'geometre', label: 'géomètre expert' },
  'division parcellaire': { slug: 'geometre', label: 'géomètre expert' },
  'plan topographique': { slug: 'geometre', label: 'géomètre expert' },
  'mesurage loi carrez': { slug: 'geometre', label: 'géomètre expert' },
  // Plombier — mots-clés supplémentaires
  'fuite d\'eau': { slug: 'plombier', label: 'plombier' },
  'robinet': { slug: 'plombier', label: 'plombier' },
  'chauffe-eau': { slug: 'plombier', label: 'plombier' },
  'ballon d\'eau chaude': { slug: 'plombier', label: 'plombier' },
  'cumulus': { slug: 'plombier', label: 'plombier' },
  'débouchage': { slug: 'plombier', label: 'plombier' },
  'debouchage': { slug: 'plombier', label: 'plombier' },
  // Électricien — mots-clés supplémentaires
  'tableau électrique': { slug: 'electricien', label: 'électricien' },
  'tableau electrique': { slug: 'electricien', label: 'électricien' },
  'prise électrique': { slug: 'electricien', label: 'électricien' },
  'prise electrique': { slug: 'electricien', label: 'électricien' },
  'câblage': { slug: 'electricien', label: 'électricien' },
  'cablage': { slug: 'electricien', label: 'électricien' },
  'mise aux normes électriques': { slug: 'electricien', label: 'électricien' },
  'mise aux normes electriques': { slug: 'electricien', label: 'électricien' },
  // Serrurier — mots-clés supplémentaires
  'blindage de porte': { slug: 'serrurier', label: 'serrurier' },
  'porte blindée': { slug: 'serrurier', label: 'serrurier' },
  'porte blindee': { slug: 'serrurier', label: 'serrurier' },
  'cylindre': { slug: 'serrurier', label: 'serrurier' },
  'verrou': { slug: 'serrurier', label: 'serrurier' },
  // Chauffagiste — mots-clés supplémentaires
  'radiateur': { slug: 'chauffagiste', label: 'chauffagiste' },
  'plancher chauffant': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chauffe-eau thermodynamique': { slug: 'chauffagiste', label: 'chauffagiste' },
  'entretien chaudière': { slug: 'chauffagiste', label: 'chauffagiste' },
  'entretien chaudiere': { slug: 'chauffagiste', label: 'chauffagiste' },
  // Menuisier — mots-clés supplémentaires
  'porte': { slug: 'menuisier', label: 'menuisier' },
  'volet bois': { slug: 'menuisier', label: 'menuisier' },
  'escalier bois': { slug: 'menuisier', label: 'menuisier' },
  'aménagement placard': { slug: 'menuisier', label: 'menuisier' },
  'amenagement placard': { slug: 'menuisier', label: 'menuisier' },
  'dressing': { slug: 'menuisier', label: 'menuisier' },
  // Carreleur — mots-clés supplémentaires
  'faïence': { slug: 'carreleur', label: 'carreleur' },
  'faience': { slug: 'carreleur', label: 'carreleur' },
  'mosaïque': { slug: 'carreleur', label: 'carreleur' },
  'mosaique': { slug: 'carreleur', label: 'carreleur' },
  'pose de carrelage': { slug: 'carreleur', label: 'carreleur' },
  'carreaux de ciment': { slug: 'carreleur', label: 'carreleur' },
  // Couvreur — mots-clés supplémentaires
  'ardoise': { slug: 'couvreur', label: 'couvreur' },
  'tuile': { slug: 'couvreur', label: 'couvreur' },
  'réfection toiture': { slug: 'couvreur', label: 'couvreur' },
  'refection toiture': { slug: 'couvreur', label: 'couvreur' },
  'chéneau': { slug: 'couvreur', label: 'couvreur' },
  'cheneau': { slug: 'couvreur', label: 'couvreur' },
  // Maçon — mots-clés supplémentaires
  'fondation': { slug: 'macon', label: 'maçon' },
  'dalle béton': { slug: 'macon', label: 'maçon' },
  'dalle beton': { slug: 'macon', label: 'maçon' },
  'parpaing': { slug: 'macon', label: 'maçon' },
  'mur porteur': { slug: 'macon', label: 'maçon' },
  'extension maison': { slug: 'macon', label: 'maçon' },
  // Climaticien — mots-clés supplémentaires
  'clim': { slug: 'climaticien', label: 'climaticien' },
  'clim réversible': { slug: 'climaticien', label: 'climaticien' },
  'clim reversible': { slug: 'climaticien', label: 'climaticien' },
  'vmc': { slug: 'climaticien', label: 'climaticien' },
  'ventilation': { slug: 'climaticien', label: 'climaticien' },
  // Cuisiniste — mots-clés supplémentaires
  'cuisine équipée': { slug: 'cuisiniste', label: 'cuisiniste' },
  'cuisine equipee': { slug: 'cuisiniste', label: 'cuisiniste' },
  'plan de travail': { slug: 'cuisiniste', label: 'cuisiniste' },
  'ilot central': { slug: 'cuisiniste', label: 'cuisiniste' },
  'aménagement cuisine': { slug: 'cuisiniste', label: 'cuisiniste' },
  'amenagement cuisine': { slug: 'cuisiniste', label: 'cuisiniste' },
  // Charpentier — mots-clés supplémentaires
  'fermette': { slug: 'charpentier', label: 'charpentier' },
  'ossature bois': { slug: 'charpentier', label: 'charpentier' },
  'combles': { slug: 'charpentier', label: 'charpentier' },
  'toiture bois': { slug: 'charpentier', label: 'charpentier' },
  'charpente traditionnelle': { slug: 'charpentier', label: 'charpentier' },
  // Terrassier — mots-clés supplémentaires
  'excavation': { slug: 'terrassier', label: 'terrassier' },
  'nivellement': { slug: 'terrassier', label: 'terrassier' },
  'enrochement': { slug: 'terrassier', label: 'terrassier' },
  'viabilisation': { slug: 'terrassier', label: 'terrassier' },
  'remblai': { slug: 'terrassier', label: 'terrassier' },
  // Zingueur — mots-clés supplémentaires
  'zinc': { slug: 'zingueur', label: 'zingueur' },
  'noue': { slug: 'zingueur', label: 'zingueur' },
  'descente eau': { slug: 'zingueur', label: 'zingueur' },
  'descente eaux pluviales': { slug: 'zingueur', label: 'zingueur' },
  // Étanchéiste — mots-clés supplémentaires
  'toiture terrasse': { slug: 'etancheiste', label: 'étanchéiste' },
  'membrane étanchéité': { slug: 'etancheiste', label: 'étanchéiste' },
  'membrane etancheite': { slug: 'etancheiste', label: 'étanchéiste' },
  'bitume': { slug: 'etancheiste', label: 'étanchéiste' },
  'infiltration': { slug: 'etancheiste', label: 'étanchéiste' },
  // Façadier — mots-clés supplémentaires
  'crépi': { slug: 'facadier', label: 'façadier' },
  'crepi': { slug: 'facadier', label: 'façadier' },
  'ravalement façade': { slug: 'facadier', label: 'façadier' },
  'ravalement facade': { slug: 'facadier', label: 'façadier' },
  'ite': { slug: 'facadier', label: 'façadier' },
  'isolation extérieure': { slug: 'facadier', label: 'façadier' },
  'isolation exterieure': { slug: 'facadier', label: 'façadier' },
  // Ferronnier — mots-clés supplémentaires
  'fer forgé': { slug: 'ferronnier', label: 'ferronnier' },
  'fer forge': { slug: 'ferronnier', label: 'ferronnier' },
  'grille': { slug: 'ferronnier', label: 'ferronnier' },
  'portail fer': { slug: 'ferronnier', label: 'ferronnier' },
  'rampe escalier fer': { slug: 'ferronnier', label: 'ferronnier' },
  // Storiste — mots-clés supplémentaires
  'volet': { slug: 'storiste', label: 'storiste' },
  'brise-soleil': { slug: 'storiste', label: 'storiste' },
  'pergola': { slug: 'storiste', label: 'storiste' },
  'store banne': { slug: 'storiste', label: 'storiste' },
  'motorisation volet': { slug: 'storiste', label: 'storiste' },
  // Salle de bain — mots-clés supplémentaires
  'douche': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'baignoire': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'rénovation salle de bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'renovation salle de bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'douche italienne': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  // Domoticien — mots-clés supplémentaires
  'smart home': { slug: 'domoticien', label: 'domoticien' },
  'maison intelligente': { slug: 'domoticien', label: 'domoticien' },
  'automatisation': { slug: 'domoticien', label: 'domoticien' },
  'objets connectés': { slug: 'domoticien', label: 'domoticien' },
  'objets connectes': { slug: 'domoticien', label: 'domoticien' },
  // Pompe à chaleur — mots-clés supplémentaires
  'pac': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  'pac air-eau': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  'géothermie': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  'geothermie': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  'aérothermie': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  'aerothermie': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  // Panneaux solaires — mots-clés supplémentaires
  'solaire': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'autoconsommation': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'onduleur': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'micro-onduleur': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  // Isolation thermique — mots-clés supplémentaires
  'laine de verre': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'laine de roche': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation combles': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation murs': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation phonique': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'ouate de cellulose': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  // Rénovation énergétique — mots-clés supplémentaires
  'audit énergétique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'audit energetique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'maprimerénov': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'maprimerenov': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'cee': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'performance énergétique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'performance energetique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  // Borne de recharge — mots-clés supplémentaires
  'véhicule électrique': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'vehicule electrique': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'wallbox': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'recharge voiture': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  // Ramoneur — mots-clés supplémentaires
  'cheminée': { slug: 'ramoneur', label: 'ramoneur' },
  'cheminee': { slug: 'ramoneur', label: 'ramoneur' },
  'conduit fumée': { slug: 'ramoneur', label: 'ramoneur' },
  'conduit fumee': { slug: 'ramoneur', label: 'ramoneur' },
  'poêle à bois': { slug: 'ramoneur', label: 'ramoneur' },
  'poele a bois': { slug: 'ramoneur', label: 'ramoneur' },
  // Pisciniste — mots-clés supplémentaires
  'construction piscine': { slug: 'pisciniste', label: 'pisciniste' },
  'entretien piscine': { slug: 'pisciniste', label: 'pisciniste' },
  'liner': { slug: 'pisciniste', label: 'pisciniste' },
  'spa': { slug: 'pisciniste', label: 'pisciniste' },
  'local technique piscine': { slug: 'pisciniste', label: 'pisciniste' },
  // Alarme / Sécurité — mots-clés supplémentaires
  'sécurité maison': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'securite maison': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'télésurveillance': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'telesurveillance': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'détecteur de fumée': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'detecteur de fumee': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  // Antenniste — mots-clés supplémentaires
  'parabole': { slug: 'antenniste', label: 'antenniste' },
  'tnt': { slug: 'antenniste', label: 'antenniste' },
  'réception tv': { slug: 'antenniste', label: 'antenniste' },
  'reception tv': { slug: 'antenniste', label: 'antenniste' },
  'satellite': { slug: 'antenniste', label: 'antenniste' },
  // Ascensoriste — mots-clés supplémentaires
  'monte-charge': { slug: 'ascensoriste', label: 'ascensoriste' },
  'monte-escalier': { slug: 'ascensoriste', label: 'ascensoriste' },
  'élévateur': { slug: 'ascensoriste', label: 'ascensoriste' },
  'elevateur': { slug: 'ascensoriste', label: 'ascensoriste' },
  'accessibilité pmr': { slug: 'ascensoriste', label: 'ascensoriste' },
  'accessibilite pmr': { slug: 'ascensoriste', label: 'ascensoriste' },
  // Désinsectisation — mots-clés supplémentaires
  'punaise de lit': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'cafard': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'blatte': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'guêpe': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'guepe': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'frelon': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'nuisibles': { slug: 'desinsectisation', label: 'désinsectiseur' },
  // Dératisation — mots-clés supplémentaires
  'rat': { slug: 'deratisation', label: 'dératiseur' },
  'souris': { slug: 'deratisation', label: 'dératiseur' },
  'rongeur': { slug: 'deratisation', label: 'dératiseur' },
  'rongeurs': { slug: 'deratisation', label: 'dératiseur' },
  // Déménageur — mots-clés supplémentaires
  'garde-meuble': { slug: 'demenageur', label: 'déménageur' },
  'monte-meuble': { slug: 'demenageur', label: 'déménageur' },
  'emballage déménagement': { slug: 'demenageur', label: 'déménageur' },
  'emballage demenagement': { slug: 'demenageur', label: 'déménageur' },
  // Peintre en bâtiment — mots-clés supplémentaires
  'tapisserie': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'papier peint': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'enduit décoratif': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'enduit decoratif': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'lasure': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  // Vitrier — mots-clés supplémentaires
  'triple vitrage': { slug: 'vitrier', label: 'vitrier' },
  'fenêtre cassée': { slug: 'vitrier', label: 'vitrier' },
  'fenetre cassee': { slug: 'vitrier', label: 'vitrier' },
  'remplacement vitre': { slug: 'vitrier', label: 'vitrier' },
  // Architecte d'intérieur — mots-clés supplémentaires
  'rénovation intérieure': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'renovation interieure': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'aménagement intérieur': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'amenagement interieur': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'optimisation espace': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
}

/**
 * Determines which service pages are relevant for a given article
 * based on its slug, category and tags.
 */
export function getRelatedServiceLinks(
  slug: string,
  category: string,
  tags: string[]
): InternalLink[] {
  const links: InternalLink[] = []
  const addedSlugs = new Set<string>()

  // Build search terms from the slug (split on hyphens) and lowered tags
  const slugWords = slug.toLowerCase()
  const searchTerms = [slugWords, ...tags.map((t) => t.toLowerCase())]

  // Top 5 cities for service×ville cross-links
  const TOP_CITIES = [
    { name: 'Paris', slug: 'paris' },
    { name: 'Lyon', slug: 'lyon' },
    { name: 'Marseille', slug: 'marseille' },
    { name: 'Toulouse', slug: 'toulouse' },
    { name: 'Nice', slug: 'nice' },
  ]

  let firstServiceSlug: string | null = null

  for (const term of searchTerms) {
    for (const [keyword, service] of Object.entries(serviceMapping)) {
      if (term.includes(keyword) && !addedSlugs.has(service.slug)) {
        links.push({
          text: `Trouver un ${service.label} qualifié`,
          href: `/services/${service.slug}`,
        })
        // Add top-city variants for the first matched service only
        if (!firstServiceSlug) {
          firstServiceSlug = service.slug
          for (const city of TOP_CITIES) {
            links.push({
              text: `${service.label.charAt(0).toUpperCase() + service.label.slice(1)} à ${city.name}`,
              href: `/services/${service.slug}/${city.slug}`,
            })
          }
        }
        addedSlugs.add(service.slug)
      }
    }
  }

  // Always add devis link for Tarifs articles
  if (category === 'Tarifs') {
    links.push({ text: 'Obtenir mon devis gratuit', href: '/devis' })
  }

  // Add general links based on category
  if (category === 'Réglementation' || category === 'Aides & Subventions') {
    links.push({ text: 'Comment ça marche ?', href: '/comment-ca-marche' })
  }

  if (category === 'Fiches métier') {
    links.push({ text: 'Devenir artisan partenaire', href: '/inscription-artisan' })
  }

  // Add urgence link when relevant
  if (
    tags.some((t) => t.toLowerCase() === 'urgence') ||
    slug.includes('urgence') ||
    slug.includes('depannage')
  ) {
    links.push({ text: 'Artisan en urgence', href: '/urgence' })
  }

  // Limit to 5 links max
  return links.slice(0, 5)
}

interface ArticleMeta {
  category: string
  tags: string[]
  title: string
  readTime?: string
}

/**
 * Scores and selects the most relevant related articles based on
 * shared category and overlapping tags.
 */
export function getRelatedArticleSlugs(
  currentSlug: string,
  category: string,
  tags: string[],
  allSlugs: string[],
  allArticlesMap: Record<string, ArticleMeta>
): { slug: string; title: string; category: string; readTime: string }[] {
  const currentTags = tags.map((t) => t.toLowerCase())

  const scored = allSlugs
    .filter((s) => s !== currentSlug)
    .map((s) => {
      const article = allArticlesMap[s]
      if (!article) return { slug: s, title: '', category: '', readTime: '', score: 0 }

      let score = 0

      // Same category => +2
      if (article.category === category) score += 2

      // Each overlapping tag => +3
      const articleTags = article.tags.map((t) => t.toLowerCase())
      for (const tag of articleTags) {
        if (currentTags.includes(tag)) score += 3
      }

      return { slug: s, title: article.title, category: article.category, readTime: article.readTime || '', score }
    })
    .filter((s) => s.score > 0 && s.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  return scored
}
