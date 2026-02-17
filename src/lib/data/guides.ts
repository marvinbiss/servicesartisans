/**
 * Guides pratiques SEO — 30 guides long-form en français.
 * Sprint 6 du plan SEO domination.
 */

export interface Guide {
  slug: string
  title: string
  metaDescription: string
  category: 'choisir' | 'entretien' | 'reglementation' | 'economiser' | 'urgence'
  relatedServices: string[]
  sections: { title: string; content: string }[]
  faq: { q: string; a: string }[]
  lastUpdated: string
}

export const guides: Guide[] = [
  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE : CHOISIR (8 guides)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'comment-choisir-son-plombier',
    title: 'Comment choisir son plombier en 2026 ?',
    metaDescription: 'Guide complet pour choisir un plombier fiable : vérifications SIRET, assurances, labels, tarifs moyens et pièges à éviter.',
    category: 'choisir',
    relatedServices: ['plombier', 'chauffagiste', 'salle-de-bain'],
    sections: [
      {
        title: 'Vérifier les qualifications et assurances',
        content: `Avant de confier vos travaux de plomberie à un professionnel, plusieurs vérifications s'imposent. Tout d'abord, assurez-vous que le plombier possède un numéro SIRET valide en le contrôlant sur le site de l'INSEE ou sur societe.com. Ce numéro garantit que l'entreprise est officiellement enregistrée et qu'elle exerce en toute légalité.

Ensuite, demandez une copie de son assurance responsabilité civile professionnelle et de sa garantie décennale. Ces deux assurances sont obligatoires pour tout artisan du bâtiment en France. La responsabilité civile couvre les dommages causés pendant l'intervention, tandis que la garantie décennale protège vos travaux pendant dix ans après leur réalisation.

Vérifiez également que le plombier est inscrit au Répertoire des Métiers, ce qui atteste de sa qualification artisanale. Si vous avez besoin de travaux liés au gaz, assurez-vous qu'il détient la qualification PG (Professionnel du Gaz), obligatoire depuis 2020 pour toute intervention sur une installation de gaz.`
      },
      {
        title: 'Comparer les devis et comprendre les tarifs',
        content: `Un plombier sérieux fournit toujours un devis écrit et détaillé avant de commencer les travaux. Ce document doit mentionner le coût de la main-d'œuvre, le prix des fournitures, le taux de TVA applicable (10 % en rénovation, 20 % en neuf) et la durée estimée du chantier.

Pour obtenir une vision réaliste du marché, demandez au moins trois devis auprès de professionnels différents. En 2026, le tarif horaire moyen d'un plombier se situe entre 50 et 90 euros selon la région et la complexité de l'intervention. Les interventions d'urgence (nuit, week-end, jours fériés) font l'objet de majorations pouvant atteindre 50 à 100 % du tarif de base.

Méfiez-vous des devis anormalement bas qui peuvent cacher des malfaçons ou l'absence d'assurances. À l'inverse, un prix élevé ne garantit pas nécessairement une meilleure qualité. Comparez les prestations détaillées plutôt que les totaux.`
      },
      {
        title: 'Repérer les labels et certifications de qualité',
        content: `Plusieurs labels permettent d'identifier un plombier compétent et fiable. La qualification Qualibat (numéros 5111 et 5112 pour la plomberie sanitaire) atteste d'un niveau de compétence vérifié par un organisme indépendant. Le label RGE (Reconnu Garant de l'Environnement) est indispensable si vos travaux concernent la performance énergétique : il conditionne l'accès aux aides de l'État comme MaPrimeRénov'.

Les certifications QualiPAC (pompes à chaleur) et QualiSol (chauffe-eau solaire) sont également des gages de compétence pour les installations spécifiques. Enfin, Qualigaz délivre les certificats de conformité gaz, obligatoires pour toute nouvelle installation ou modification d'un réseau de gaz.

Ces labels ne sont pas de simples étiquettes commerciales : ils impliquent un audit régulier de l'entreprise, une vérification des compétences techniques et un contrôle des assurances. Un artisan labellisé engage sa réputation auprès de l'organisme certificateur.`
      },
      {
        title: 'Évaluer la réputation et le bouche-à-oreille',
        content: `Les avis en ligne constituent un bon indicateur de la fiabilité d'un plombier, à condition de les analyser avec discernement. Privilégiez les plateformes qui vérifient l'authenticité des avis (avis certifiés après intervention). Un professionnel ayant une vingtaine d'avis positifs détaillés est généralement plus fiable qu'un artisan sans aucun retour client.

Le bouche-à-oreille reste la méthode la plus fiable pour trouver un bon plombier. Demandez des recommandations à votre entourage, à vos voisins ou au syndic de votre copropriété. Un artisan recommandé par plusieurs personnes de confiance offre une garantie supplémentaire de sérieux.

N'hésitez pas à demander des références de chantiers récents au plombier et à contacter ses anciens clients. Un professionnel confiant dans la qualité de son travail acceptera sans difficulté de vous fournir ces contacts.`
      },
      {
        title: 'Les pièges à éviter absolument',
        content: `Certaines pratiques doivent vous alerter immédiatement. Un plombier qui refuse de fournir un devis écrit, qui exige un paiement intégral avant le début des travaux ou qui insiste pour être payé exclusivement en espèces présente des signaux d'alerte sérieux.

Méfiez-vous également des démarchages téléphoniques non sollicités et des artisans qui se présentent spontanément à votre porte. En cas d'urgence, ne cédez pas à la panique : prenez le temps de vérifier le SIRET du plombier et d'obtenir un devis, même sommaire, avant toute intervention.

Enfin, sachez que le délai de rétractation de 14 jours s'applique pour les travaux contractés à domicile (hors urgence). Si un artisan vous a fait signer un devis sous pression, vous disposez de ce délai pour annuler sans frais.`
      },
    ],
    faq: [
      { q: 'Quel est le tarif horaire moyen d\'un plombier en 2026 ?', a: 'Le tarif horaire moyen d\'un plombier se situe entre 50 et 90 euros HT en 2026, selon la région et la complexité de l\'intervention. En Île-de-France, comptez 70 à 90 €/h, contre 50 à 70 €/h en province. Les interventions d\'urgence sont majorées de 50 à 100 %.' },
      { q: 'Comment vérifier le SIRET d\'un plombier ?', a: 'Rendez-vous sur le site sirene.fr ou societe.com et saisissez le nom de l\'entreprise ou son numéro SIRET. Vous pourrez vérifier que l\'entreprise est bien enregistrée, active, et qu\'elle exerce dans le domaine de la plomberie (code NAF 43.22A ou 43.22B).' },
      { q: 'La garantie décennale est-elle obligatoire pour un plombier ?', a: 'Oui, la garantie décennale est obligatoire pour tout artisan du bâtiment, y compris les plombiers. Elle couvre les dommages compromettant la solidité de l\'ouvrage ou le rendant impropre à sa destination pendant 10 ans après la réception des travaux.' },
      { q: 'Faut-il un plombier RGE pour bénéficier de MaPrimeRénov\' ?', a: 'Oui, pour bénéficier de MaPrimeRénov\' et des Certificats d\'Économies d\'Énergie (CEE), les travaux doivent être réalisés par un professionnel certifié RGE. Vérifiez la validité du label sur le site france-renov.gouv.fr.' },
      { q: 'Peut-on négocier le devis d\'un plombier ?', a: 'Oui, la négociation est courante dans l\'artisanat. Comparez plusieurs devis et n\'hésitez pas à discuter le prix, surtout pour des travaux importants. Un plombier peut accorder une remise de 5 à 15 % sur un chantier conséquent.' },
      { q: 'Que faire si le plombier fait mal les travaux ?', a: 'Signalez les malfaçons par lettre recommandée avec accusé de réception dans les plus brefs délais. Le plombier est tenu de réparer les désordres au titre de la garantie de parfait achèvement (1 an) ou de la garantie décennale (10 ans). En cas de litige, saisissez le médiateur de la consommation.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comment-choisir-son-electricien',
    title: 'Comment choisir son électricien en 2026 ?',
    metaDescription: 'Guide pratique pour sélectionner un électricien qualifié : normes NF C 15-100, certifications Consuel, labels et tarifs.',
    category: 'choisir',
    relatedServices: ['electricien', 'domoticien', 'borne-recharge'],
    sections: [
      {
        title: 'Les qualifications indispensables',
        content: `L'électricité est un domaine où la sécurité ne tolère aucun compromis. Un électricien qualifié doit impérativement posséder une habilitation électrique valide (BR, B1 ou B2 selon le type de travaux), délivrée par son employeur après une formation spécifique. Cette habilitation atteste qu'il maîtrise les risques électriques et sait intervenir en toute sécurité.

Vérifiez que l'artisan est inscrit au Répertoire des Métiers et qu'il possède un numéro SIRET actif. Son code NAF doit correspondre à l'activité d'installation électrique (43.21A). Comme tout artisan du bâtiment, il doit être couvert par une assurance responsabilité civile professionnelle et une garantie décennale.

Pour l'installation de bornes de recharge pour véhicules électriques, la certification IRVE (Infrastructure de Recharge pour Véhicules Électriques) est obligatoire depuis 2017. Sans cette qualification, l'installateur ne peut pas délivrer le certificat de conformité et vous ne pourrez pas bénéficier du crédit d'impôt.`
      },
      {
        title: 'Comprendre les normes et le Consuel',
        content: `La norme NF C 15-100 est la référence incontournable pour toute installation électrique en France. Elle définit les règles de conception, de réalisation et de vérification des installations électriques basse tension. Un électricien compétent la connaît sur le bout des doigts et s'y conforme systématiquement.

Le Consuel (Comité National pour la Sécurité des Usagers de l'Électricité) délivre l'attestation de conformité électrique, obligatoire pour toute nouvelle installation ou rénovation complète avant la mise sous tension par Enedis. Le coût du contrôle Consuel varie de 120 à 180 euros selon le type d'installation.

Un bon électricien vous accompagne dans les démarches Consuel et vous remet un dossier technique complet comprenant le schéma unifilaire de l'installation, la liste des circuits et les calibres des protections. Ce dossier est précieux pour toute intervention future sur votre installation.`
      },
      {
        title: 'Comparer les devis électriques',
        content: `Un devis d'électricien doit détailler précisément chaque poste : nombre de points lumineux, de prises, de circuits spécialisés, type de tableau électrique, marque et référence du matériel utilisé. Le tarif horaire moyen d'un électricien en 2026 se situe entre 45 et 80 euros HT selon la région.

Pour une mise aux normes d'un tableau électrique, les prix varient de 800 à 2 500 euros. Une rénovation complète de l'électricité d'un appartement de 60 m² coûte entre 5 000 et 10 000 euros. Ces écarts de prix s'expliquent par la complexité de l'installation existante, la qualité du matériel choisi et la région.

Demandez toujours que le devis précise la marque du matériel (Legrand, Schneider, Hager sont les références en France) et le nombre exact de modules du tableau. Un devis vague sur les fournitures peut masquer l'utilisation de matériel bas de gamme non conforme.`
      },
      {
        title: 'Labels et certifications à privilégier',
        content: `La certification Qualifelec est la référence dans le domaine de l'électricité. Elle valide les compétences techniques de l'entreprise dans différentes spécialités : installations courants forts, courants faibles, photovoltaïque, IRVE. Vérifiez la validité du certificat sur le site qualifelec.fr.

Le label RGE est indispensable si vos travaux concernent la performance énergétique (chauffage électrique, VMC, isolation des réseaux). Il conditionne l'accès à MaPrimeRénov' et aux CEE. La qualification Qualibat 5411 à 5416 atteste de compétences vérifiées en installation électrique.

Pour les installations domotiques et les systèmes connectés, la certification KNX Partner ou la qualification Somfy Expert garantissent une maîtrise des technologies de maison intelligente. Ces compétences spécifiques sont de plus en plus recherchées avec l'essor de la domotique.`
      },
      {
        title: 'Les erreurs courantes à éviter',
        content: `La première erreur est de choisir un électricien uniquement sur le critère du prix. Une installation électrique mal réalisée présente des risques d'incendie et d'électrocution. Les incendies d'origine électrique représentent environ 25 % des incendies domestiques en France, souvent à cause d'installations vétustes ou non conformes.

Ne faites jamais appel à un électricien qui propose de travailler sans devis écrit ou qui n'est pas en mesure de fournir une attestation d'assurance décennale. De même, méfiez-vous des artisans qui acceptent de réaliser une installation sans respecter la norme NF C 15-100 sous prétexte de réduire les coûts.

Enfin, ne négligez pas le diagnostic électrique préalable pour les installations de plus de 15 ans. Ce diagnostic, réalisé par un professionnel certifié, identifie les points de non-conformité et permet d'établir un plan de travaux hiérarchisé par urgence et par budget.`
      },
    ],
    faq: [
      { q: 'Combien coûte une mise aux normes électrique complète ?', a: 'Pour un appartement de 60 m², la mise aux normes complète coûte entre 5 000 et 10 000 euros. Pour une maison de 100 m², comptez 8 000 à 15 000 euros. Le prix dépend de l\'état de l\'installation existante et du nombre de circuits à créer.' },
      { q: 'Le diagnostic électrique est-il obligatoire ?', a: 'Le diagnostic électrique est obligatoire pour la vente d\'un logement dont l\'installation a plus de 15 ans et pour la mise en location de tout logement. Il coûte entre 100 et 200 euros et est valable 3 ans pour la vente, 6 ans pour la location.' },
      { q: 'Quelle est la différence entre Qualifelec et Qualibat ?', a: 'Qualifelec est spécifique aux métiers de l\'électricité et du génie climatique, tandis que Qualibat couvre l\'ensemble des métiers du bâtiment. Les deux organismes délivrent des qualifications RGE. Qualifelec est généralement considéré comme plus spécialisé pour l\'électricité.' },
      { q: 'Faut-il un électricien certifié IRVE pour une prise renforcée ?', a: 'Non, la certification IRVE n\'est obligatoire que pour l\'installation d\'une borne de recharge (wallbox) de plus de 3,7 kW. Une simple prise renforcée de type Green\'Up peut être installée par tout électricien qualifié.' },
      { q: 'Comment savoir si mon installation est dangereuse ?', a: 'Les signes d\'alerte sont : des fusibles qui sautent régulièrement, des prises qui chauffent, des odeurs de brûlé, l\'absence de prise de terre, un tableau avec des fusibles à broche anciens ou l\'absence de disjoncteur différentiel 30 mA.' },
      { q: 'Un particulier peut-il faire ses travaux électriques ?', a: 'Légalement oui, mais c\'est fortement déconseillé. Le particulier engage sa responsabilité en cas d\'accident. De plus, l\'attestation Consuel sera exigée pour le raccordement et les assurances habitation peuvent refuser l\'indemnisation en cas de sinistre sur une installation non conforme.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comment-choisir-son-serrurier',
    title: 'Comment choisir son serrurier en 2026 ?',
    metaDescription: 'Évitez les arnaques : guide pour trouver un serrurier honnête, vérifier ses qualifications et comprendre les tarifs réels.',
    category: 'choisir',
    relatedServices: ['serrurier', 'alarme-securite'],
    sections: [
      {
        title: 'Le secteur de la serrurerie : attention aux arnaques',
        content: `La serrurerie est malheureusement l'un des secteurs les plus touchés par les pratiques frauduleuses. Les plaintes pour facturation abusive après une intervention de serrurerie figurent parmi les plus fréquentes auprès de la DGCCRF. Le scénario classique : une personne enfermée dehors fait appel à un serrurier trouvé dans l'urgence, qui facture une intervention simple à un prix exorbitant.

Pour éviter ces situations, la meilleure stratégie est de rechercher un serrurier de confiance avant d'en avoir besoin. Notez ses coordonnées et gardez-les dans votre téléphone. En cas d'urgence, vous aurez ainsi un professionnel fiable à contacter immédiatement, sans céder à la panique.

Sachez que la DGCCRF effectue régulièrement des contrôles dans le secteur de la serrurerie. N'hésitez pas à signaler toute pratique abusive sur la plateforme SignalConso du gouvernement.`
      },
      {
        title: 'Vérifier les qualifications du serrurier',
        content: `Un serrurier qualifié possède un CAP ou un BEP en serrurerie-métallerie, complété par une expérience professionnelle. Vérifiez son inscription au Répertoire des Métiers et la validité de son SIRET. Son assurance responsabilité civile professionnelle doit couvrir les interventions sur les systèmes de sécurité.

La certification A2P (Assurance Prévention Protection) est un gage de qualité pour les serrures et les serruriers. Un serrurier qui installe et recommande des serrures certifiées A2P connaît les produits de qualité et saura vous conseiller sur le niveau de sécurité adapté à votre logement.

Les serruriers membres du SNMI (Syndicat National des Métiers de l'Industrie) ou de la FFCR (Fédération Française des Constructeurs de Serrures) respectent un code de déontologie qui encadre les pratiques tarifaires et la qualité des interventions.`
      },
      {
        title: 'Comprendre les tarifs réels en serrurerie',
        content: `Une ouverture de porte simple (sans remplacement de serrure) coûte en moyenne entre 80 et 200 euros en journée. Ce tarif inclut le déplacement et l'intervention. Si le cylindre doit être remplacé, ajoutez 50 à 150 euros pour la fourniture selon le niveau de sécurité.

Les majorations en dehors des heures ouvrables sont encadrées par la loi : elles doivent être clairement annoncées avant l'intervention. En pratique, les majorations nocturnes varient de 50 à 100 % et celles du week-end de 25 à 50 %. Un serrurier honnête vous annonce le prix total estimé par téléphone avant de se déplacer.

Le changement complet d'une serrure multipoints certifiée A2P coûte entre 300 et 1 200 euros (fourniture et pose), selon le niveau de certification (A2P*, A2P** ou A2P***). Un blindage de porte se situe entre 800 et 2 500 euros.`
      },
      {
        title: 'Les bons réflexes en cas d\'urgence',
        content: `Si vous êtes enfermé dehors, commencez par vérifier toutes les ouvertures possibles (fenêtre entrouverte, porte de service, baie vitrée). Contactez votre voisin, votre gardien d'immeuble ou votre propriétaire qui peut détenir un double de clé.

Si l'intervention d'un serrurier est nécessaire, ne cédez pas à la panique. Appelez un professionnel identifié à l'avance ou demandez une recommandation à votre assurance habitation, qui dispose souvent d'un réseau de serruriers partenaires. Exigez un devis par téléphone avant le déplacement.

Pendant l'intervention, restez présent et observez le travail réalisé. Un serrurier compétent ouvre une porte en quelques minutes sans endommager la serrure dans la majorité des cas. Si l'artisan tente de vous vendre un remplacement complet de serrure alors qu'une simple ouverture suffit, c'est un signal d'alarme.`
      },
    ],
    faq: [
      { q: 'Combien coûte une ouverture de porte claquée ?', a: 'Une ouverture de porte claquée (sans clé à l\'intérieur) coûte entre 80 et 150 euros en journée. Si la clé est restée à l\'intérieur, le prix est similaire. Le remplacement du cylindre n\'est généralement pas nécessaire dans ce cas.' },
      { q: 'Comment reconnaître un serrurier arnaqueur ?', a: 'Les signaux d\'alerte sont : refus de donner un prix par téléphone, démontage de la serrure sans tenter l\'ouverture, facturation d\'un cylindre « haute sécurité » à un prix exorbitant, paiement en espèces uniquement, absence de facture détaillée.' },
      { q: 'Mon assurance habitation couvre-t-elle le serrurier ?', a: 'La plupart des assurances habitation incluent une garantie assistance qui prend en charge les frais de serrurier en cas de perte de clé, vol ou effraction. Vérifiez votre contrat et contactez votre assureur avant d\'appeler un serrurier.' },
      { q: 'Qu\'est-ce qu\'une serrure A2P ?', a: 'A2P (Assurance Prévention Protection) est une certification délivrée par le CNPP. Elle classe les serrures en 3 niveaux de résistance à l\'effraction : A2P* (5 min), A2P** (10 min), A2P*** (15 min). Pour une résidence principale, le niveau A2P** est recommandé.' },
      { q: 'Faut-il changer la serrure en emménageant ?', a: 'C\'est fortement recommandé. Vous ne savez pas combien de doubles de clés circulent. Remplacez au minimum le cylindre de la porte d\'entrée (50 à 150 euros) pour garantir votre sécurité.' },
      { q: 'Le serrurier peut-il intervenir le dimanche ?', a: 'Oui, de nombreux serruriers proposent un service 7j/7. Attendez-vous à une majoration de 25 à 50 % le dimanche et de 50 à 100 % la nuit. Demandez toujours le tarif total estimé avant le déplacement.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comment-choisir-son-couvreur',
    title: 'Comment choisir son couvreur en 2026 ?',
    metaDescription: 'Guide pour sélectionner un couvreur qualifié : certifications Qualibat, assurances, tarifs toiture et points de vigilance.',
    category: 'choisir',
    relatedServices: ['couvreur', 'charpentier', 'zingueur', 'etancheiste'],
    sections: [
      {
        title: 'Pourquoi le choix du couvreur est crucial',
        content: `La toiture est l'élément le plus exposé de votre habitation. Une intervention de couverture mal réalisée peut entraîner des infiltrations, des dégâts structurels et des coûts de réparation considérables. Le choix d'un couvreur compétent et fiable est donc une décision qui engage la pérennité de votre patrimoine immobilier.

Un couvreur qualifié maîtrise les différents types de couverture (tuiles, ardoises, zinc, bac acier), les techniques de pose propres à chaque matériau et les règles d'étanchéité. Il connaît les DTU (Documents Techniques Unifiés) applicables à la couverture, notamment le DTU 40 qui couvre l'ensemble des travaux de toiture.

En France, les conditions climatiques varient considérablement d'une région à l'autre. Un bon couvreur adapte ses techniques et ses matériaux au climat local : tuiles canal dans le Sud, ardoises en Bretagne et en Normandie, tuiles mécaniques dans le Nord.`
      },
      {
        title: 'Les qualifications et assurances obligatoires',
        content: `La garantie décennale est absolument indispensable pour les travaux de couverture. Elle couvre les défauts d'étanchéité et les malfaçons pendant 10 ans après la réception des travaux. Exigez une attestation d'assurance décennale en cours de validité et vérifiez qu'elle couvre bien l'activité de couverture.

La qualification Qualibat est un gage de compétence reconnu. Les qualifications 3111 à 3154 couvrent les différentes spécialités de la couverture (tuiles, ardoises, zinc, étanchéité). Un couvreur Qualibat a été audité par un organisme indépendant qui a vérifié ses compétences, ses références et ses assurances.

Pour les travaux d'isolation de toiture (sarking, isolation des combles), la certification RGE est nécessaire pour bénéficier des aides financières. Le label Éco Artisan ou la mention RGE Qualibat 7131 attestent de cette compétence spécifique.`
      },
      {
        title: 'Comprendre les tarifs de couverture',
        content: `Les tarifs de couverture varient considérablement selon le matériau, la surface, la pente du toit et l'accessibilité du chantier. En 2026, comptez en moyenne 40 à 60 euros le m² pour une couverture en tuiles mécaniques, 60 à 100 euros le m² pour des tuiles plates ou des ardoises, et 80 à 120 euros le m² pour une couverture en zinc à joints debout.

Un devis de couverture doit détailler les postes suivants : dépose de l'ancienne couverture, fourniture et pose du nouveau matériau, traitement de la charpente si nécessaire, pose des éléments de ventilation, zinguerie (gouttières, chéneaux, noues) et échafaudage. L'échafaudage représente souvent 10 à 15 % du coût total.

Les réparations ponctuelles (remplacement de tuiles cassées, reprise de faîtage) coûtent entre 300 et 1 500 euros selon l'ampleur des dégâts. Un contrat d'entretien annuel (inspection, nettoyage, petites réparations) se négocie entre 200 et 500 euros par an.`
      },
      {
        title: 'Précautions avant et pendant le chantier',
        content: `Avant le début des travaux, vérifiez que le couvreur a souscrit une assurance responsabilité civile professionnelle couvrant les dommages aux biens voisins (chute de matériaux, détérioration de clôtures). Pour les chantiers importants, un constat d'état des lieux des propriétés adjacentes est recommandé.

Pendant le chantier, assurez-vous que l'échafaudage est conforme aux normes de sécurité et que le couvreur utilise des équipements de protection individuelle (harnais, casque). Un chantier bien organisé avec des zones de stockage propres et un bâchage temporaire en cas de pluie témoigne du professionnalisme de l'entreprise.

À la fin des travaux, demandez un procès-verbal de réception mentionnant les éventuelles réserves. Ce document est essentiel pour faire valoir la garantie décennale en cas de problème ultérieur. Conservez précieusement le devis, la facture et l'attestation d'assurance décennale.`
      },
    ],
    faq: [
      { q: 'Quand faut-il refaire sa toiture ?', a: 'Une toiture en tuiles a une durée de vie de 30 à 50 ans, une couverture en ardoise de 70 à 100 ans, et une toiture en zinc de 80 à 100 ans. Faites inspecter votre toiture tous les 5 ans et après chaque tempête pour détecter les problèmes avant qu\'ils ne s\'aggravent.' },
      { q: 'Combien coûte une réfection de toiture de 100 m² ?', a: 'Pour une maison de 100 m² de toiture, comptez entre 8 000 et 15 000 euros en tuiles mécaniques, 12 000 à 20 000 euros en ardoises et 15 000 à 25 000 euros en zinc. Ces prix incluent la dépose, la fourniture, la pose et la zinguerie.' },
      { q: 'Le couvreur peut-il intervenir en hiver ?', a: 'Oui, mais certaines interventions sont déconseillées par temps de gel ou de pluie. Les réparations urgentes (fuite, tuiles envoyées par le vent) sont réalisées toute l\'année. Les réfections complètes sont idéalement planifiées entre avril et octobre.' },
      { q: 'Faut-il un permis de construire pour refaire la toiture ?', a: 'Non, un simple remplacement à l\'identique ne nécessite aucune autorisation. En revanche, un changement de matériau ou de couleur nécessite une déclaration préalable. En zone ABF (Architecte des Bâtiments de France), l\'accord de l\'ABF est obligatoire.' },
      { q: 'L\'entretien de toiture est-il déductible des impôts ?', a: 'Les travaux d\'entretien courant ne sont pas déductibles. En revanche, l\'isolation de la toiture peut bénéficier de MaPrimeRénov\' et des CEE si les travaux sont réalisés par un artisan RGE. Le taux de TVA réduit à 5,5 % s\'applique aux travaux d\'amélioration énergétique.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comment-choisir-son-chauffagiste',
    title: 'Comment choisir son chauffagiste en 2026 ?',
    metaDescription: 'Guide pour choisir un chauffagiste qualifié : labels RGE, certifications PG et QualiPAC, tarifs et aides financières.',
    category: 'choisir',
    relatedServices: ['chauffagiste', 'pompe-a-chaleur', 'climaticien', 'ramoneur'],
    sections: [
      {
        title: 'Le chauffagiste : un métier réglementé',
        content: `Le métier de chauffagiste est l'un des plus réglementés du bâtiment, en raison des enjeux de sécurité liés au gaz et à la combustion. Depuis 2020, tout professionnel intervenant sur une installation de gaz doit détenir la qualification PG (Professionnel du Gaz), vérifiable sur le site pg.gazdefrance.com.

Au-delà de cette obligation légale, un chauffagiste compétent maîtrise les différentes technologies de chauffage : chaudières gaz à condensation, pompes à chaleur, systèmes hybrides, poêles à granulés et planchers chauffants. Le choix du système le plus adapté dépend de votre logement, de votre budget et des réglementations en vigueur.

Avec l'interdiction progressive des chaudières au fioul et les objectifs de décarbonation du bâtiment, le chauffagiste joue un rôle de conseil essentiel. Un bon professionnel vous oriente vers la solution la plus économique et la plus écologique, en tenant compte des aides financières disponibles.`
      },
      {
        title: 'Labels et certifications à exiger',
        content: `La certification RGE est incontournable pour bénéficier de MaPrimeRénov', des CEE et de l'éco-prêt à taux zéro. Vérifiez la validité du label sur france-renov.gouv.fr. Attention, le RGE couvre des domaines spécifiques : un chauffagiste RGE pour les chaudières gaz n'est pas nécessairement qualifié pour les pompes à chaleur.

La certification QualiPAC atteste de la compétence pour l'installation de pompes à chaleur (aérothermie et géothermie). Avec le développement massif des PAC en France, cette qualification est devenue un critère de sélection majeur. QualiSol certifie la compétence pour les systèmes de chauffage solaire.

La qualification Qualibat 5211 à 5213 couvre les installations thermiques et de génie climatique. Un chauffagiste Qualibat a été audité par un organisme indépendant, ce qui constitue une garantie supplémentaire de compétence et de fiabilité.`
      },
      {
        title: 'Comprendre les devis et les tarifs',
        content: `Le remplacement d'une chaudière gaz par un modèle à condensation coûte entre 3 000 et 6 000 euros pose comprise. L'installation d'une pompe à chaleur air-eau se situe entre 8 000 et 16 000 euros, tandis qu'une PAC géothermique peut atteindre 15 000 à 25 000 euros. Ces investissements sont significativement réduits par les aides financières.

Un devis de chauffagiste doit détailler : le matériel (marque, modèle, puissance), la main-d'œuvre, les raccordements, la mise en service, les frais de dépose de l'ancien équipement et le coût de la régulation (thermostat, programmateur). Demandez que le devis mentionne le COP (coefficient de performance) pour les pompes à chaleur.

L'entretien annuel obligatoire d'une chaudière gaz coûte entre 100 et 200 euros. Un contrat d'entretien incluant le dépannage prioritaire est recommandé (150 à 300 euros par an). Pour une pompe à chaleur, l'entretien obligatoire tous les 2 ans coûte entre 150 et 300 euros.`
      },
      {
        title: 'Aides financières et retour sur investissement',
        content: `En 2026, les aides à la rénovation énergétique du chauffage sont substantielles. MaPrimeRénov' peut couvrir jusqu'à 90 % du coût d'une pompe à chaleur pour les ménages les plus modestes. Les CEE (Certificats d'Économies d'Énergie) apportent un complément de 2 000 à 5 000 euros selon le type d'équipement.

L'éco-prêt à taux zéro permet de financer jusqu'à 50 000 euros de travaux de rénovation énergétique sans intérêts. Certaines collectivités locales proposent des aides complémentaires qui peuvent réduire encore le reste à charge.

Un bon chauffagiste intègre le calcul des aides dans sa proposition commerciale et vous accompagne dans les démarches administratives. Méfiez-vous des artisans qui ne mentionnent pas les aides ou qui proposent de les déduire directement du devis sans votre accord explicite.`
      },
    ],
    faq: [
      { q: 'Quelle est la meilleure solution de chauffage en 2026 ?', a: 'La pompe à chaleur air-eau est la solution la plus recommandée en 2026 pour la plupart des logements. Elle divise par 3 la consommation par rapport à un chauffage électrique et bénéficie d\'aides financières importantes. Pour les logements très bien isolés, le poêle à granulés couplé à des radiateurs électriques performants est une alternative économique.' },
      { q: 'L\'entretien de la chaudière est-il obligatoire ?', a: 'Oui, l\'entretien annuel de toute chaudière (gaz, fioul, bois) est obligatoire depuis le décret du 9 juin 2009. Pour les pompes à chaleur de plus de 4 kW, un contrôle est obligatoire tous les 2 ans. L\'attestation d\'entretien est exigible par l\'assureur en cas de sinistre.' },
      { q: 'Combien coûte l\'installation d\'une pompe à chaleur ?', a: 'L\'installation d\'une PAC air-eau coûte entre 8 000 et 16 000 euros avant aides. Après déduction de MaPrimeRénov\' et des CEE, le reste à charge peut descendre à 2 000-5 000 euros selon vos revenus. Le retour sur investissement est généralement atteint en 5 à 8 ans.' },
      { q: 'Peut-on garder ses radiateurs avec une pompe à chaleur ?', a: 'Oui, une pompe à chaleur air-eau est compatible avec les radiateurs existants (eau chaude). La PAC remplace simplement la chaudière comme source de chaleur. Pour les radiateurs haute température, un modèle de PAC haute température (65-80 °C) est recommandé.' },
      { q: 'Faut-il un chauffagiste PG pour une chaudière gaz ?', a: 'Oui, depuis 2020, tout professionnel intervenant sur une installation de gaz domestique doit détenir la qualification PG. Cette obligation couvre l\'installation, l\'entretien et le dépannage. Vérifiez la qualification sur le site officiel avant de confier vos travaux.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comment-choisir-son-peintre',
    title: 'Comment choisir son peintre en bâtiment en 2026 ?',
    metaDescription: 'Guide pour choisir un peintre en bâtiment : qualifications, tarifs au m², techniques et conseils pour un résultat impeccable.',
    category: 'choisir',
    relatedServices: ['peintre-en-batiment', 'facadier', 'platrier', 'decorateur'],
    sections: [
      {
        title: 'Les compétences d\'un peintre professionnel',
        content: `Le métier de peintre en bâtiment ne se résume pas à appliquer de la peinture sur un mur. Un peintre qualifié maîtrise la préparation des supports (enduit, ponçage, impression), le choix des produits adaptés à chaque surface et l'application de différentes techniques (rouleau, pistolet, brosse). Il sait également poser du papier peint, des toiles de verre et réaliser des finitions décoratives.

Pour les travaux extérieurs (ravalement de façade), le peintre doit maîtriser les enduits de façade, les traitements hydrofuges et les peintures spéciales (anti-mousse, élastiques, anti-pollution). La connaissance des réglementations locales en matière de couleurs et de matériaux est également indispensable.

Un bon peintre est avant tout un bon préparateur. La qualité du résultat final dépend à 80 % de la préparation du support. Méfiez-vous d'un artisan qui propose de peindre directement sans traiter les fissures, les taches d'humidité ou les défauts du support.`
      },
      {
        title: 'Qualifications et assurances',
        content: `La qualification Qualibat 6111 à 6142 couvre les différentes spécialités de la peinture en bâtiment : peinture intérieure, peinture extérieure, revêtements muraux et ravalement. Un peintre Qualibat a été audité et ses compétences vérifiées par un organisme indépendant.

L'assurance décennale est obligatoire pour les travaux de ravalement de façade, car ils touchent au clos et couvert du bâtiment. Pour les travaux de peinture intérieure, la responsabilité civile professionnelle est le minimum exigible. Dans les deux cas, demandez une copie de l'attestation d'assurance.

Le label RGE est pertinent si les travaux de peinture sont associés à une isolation thermique par l'extérieur (ITE). Cette technique, de plus en plus courante, permet de bénéficier de MaPrimeRénov' et des CEE pour la partie isolation.`
      },
      {
        title: 'Tarifs moyens et devis détaillé',
        content: `Les tarifs d'un peintre en bâtiment varient de 20 à 45 euros le m² pour une peinture intérieure (préparation comprise) et de 30 à 70 euros le m² pour un ravalement de façade. Le prix dépend de l'état du support, du nombre de couches nécessaires et de la qualité de la peinture choisie.

Un devis de peintre doit détailler : la surface à peindre (en m²), la préparation du support (enduit, ponçage, impression), le nombre de couches, la marque et la référence de la peinture, le traitement des boiseries et la protection du mobilier. Le coût de la peinture elle-même ne représente que 15 à 25 % du budget total.

Pour un appartement de 70 m² (murs et plafonds), comptez entre 3 000 et 6 000 euros pour une peinture intérieure complète. Un ravalement de façade pour une maison individuelle de 150 m² de façade se situe entre 6 000 et 12 000 euros selon l'état du support et la technique utilisée.`
      },
      {
        title: 'Conseils pour un résultat optimal',
        content: `Planifiez vos travaux de peinture extérieure entre avril et octobre, lorsque les températures sont comprises entre 10 et 25 degrés et que l'humidité est faible. La peinture intérieure peut être réalisée toute l'année, à condition d'assurer une bonne ventilation pendant et après l'application.

Investissez dans une peinture de qualité professionnelle (Tollens, Sikkens, Zolpan) plutôt que dans une peinture premier prix. Le surcoût de la fourniture est faible par rapport au coût de la main-d'œuvre, et le résultat sera nettement supérieur en termes de tenue, de couvrance et de durabilité.

Demandez au peintre de réaliser un échantillon sur une surface de test avant de valider la couleur définitive. Les nuanciers et les simulateurs en ligne donnent une idée, mais la perception de la couleur varie considérablement en fonction de l'éclairage naturel de la pièce.`
      },
    ],
    faq: [
      { q: 'Combien de temps faut-il pour peindre un appartement ?', a: 'Pour un appartement de 70 m² (murs et plafonds), comptez 5 à 8 jours de travail pour un peintre professionnel. Ce délai inclut la préparation (2-3 jours), l\'application des couches (2-3 jours) et les finitions (1-2 jours). Prévoyez un délai supplémentaire si l\'état des murs nécessite un enduit important.' },
      { q: 'Quelle peinture choisir pour une salle de bain ?', a: 'Optez pour une peinture acrylique spéciale pièces humides, classée A+ pour la qualité de l\'air intérieur. Les peintures glycéro, plus résistantes à l\'humidité, émettent davantage de COV et sont de moins en moins utilisées. Un traitement anti-moisissure préalable est indispensable si des taches sont présentes.' },
      { q: 'Le ravalement de façade est-il obligatoire ?', a: 'Dans certaines communes, un arrêté municipal peut imposer le ravalement de façade tous les 10 ans. À Paris, le ravalement est obligatoire à la demande de la mairie. En copropriété, le syndic peut mettre le ravalement au vote de l\'assemblée générale. Renseignez-vous en mairie.' },
      { q: 'Peut-on peindre soi-même pour économiser ?', a: 'La peinture intérieure est l\'un des travaux les plus accessibles aux bricoleurs. Cependant, un résultat professionnel exige une bonne préparation du support et une maîtrise de la technique. Pour les plafonds, les pièces en hauteur et les façades, l\'intervention d\'un professionnel est recommandée.' },
      { q: 'Combien coûte un ravalement de façade au m² ?', a: 'Le ravalement de façade coûte entre 30 et 70 euros le m² selon la technique : nettoyage simple (30-40 €/m²), piquage et enduit (40-60 €/m²), isolation thermique par l\'extérieur (80-150 €/m²). À cela s\'ajoutent les frais d\'échafaudage (10-20 €/m²).' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comment-choisir-son-macon',
    title: 'Comment choisir son maçon en 2026 ?',
    metaDescription: 'Guide complet pour choisir un maçon qualifié : qualifications, assurances, tarifs gros œuvre et conseils de chantier.',
    category: 'choisir',
    relatedServices: ['macon', 'terrassier', 'carreleur'],
    sections: [
      {
        title: 'Le maçon : pilier du gros œuvre',
        content: `Le maçon est l'artisan fondamental de la construction. Il réalise les fondations, élève les murs, coule les dalles et assure la solidité structurelle du bâtiment. Une maçonnerie mal réalisée peut compromettre l'ensemble de la construction et engendrer des coûts de reprise considérables.

Les compétences d'un maçon qualifié vont bien au-delà de la pose de parpaings. Il maîtrise le béton armé, les différents types de blocs (béton, brique, pierre), les enduits de façade, le drainage des fondations et les techniques parasismiques dans les zones concernées.

Pour les maisons individuelles, le maçon intervient souvent comme entreprise principale, coordonnant les autres corps de métier. Sa capacité à organiser un chantier, à respecter les délais et à communiquer clairement est aussi importante que sa compétence technique.`
      },
      {
        title: 'Vérifications essentielles avant de signer',
        content: `L'assurance décennale est absolument critique pour les travaux de maçonnerie. Toute malfaçon dans le gros œuvre (fissures structurelles, problèmes de fondations, défauts d'étanchéité) peut compromettre la solidité de l'ouvrage. Vérifiez que l'attestation couvre bien les travaux de maçonnerie et de béton armé.

La qualification Qualibat 2111 à 2194 couvre les différentes spécialités de la maçonnerie : gros œuvre, béton armé, maçonnerie de pierre, rénovation du patrimoine. Pour les travaux importants (extension, surélévation), exigez une qualification correspondant à la taille du chantier.

Pour les projets de construction neuve ou d'extension de plus de 20 m², un permis de construire est obligatoire et les plans doivent être signés par un architecte si la surface totale après travaux dépasse 150 m². Le maçon doit travailler en coordination avec l'architecte et le bureau d'études structure.`
      },
      {
        title: 'Comprendre les tarifs du gros œuvre',
        content: `Les tarifs de maçonnerie varient considérablement selon le type de travaux. La construction d'un mur en parpaings coûte entre 40 et 70 euros le m², la maçonnerie en briques entre 50 et 90 euros le m², et la maçonnerie en pierre de taille entre 150 et 400 euros le m².

Le coulage d'une dalle béton se facture entre 50 et 100 euros le m² selon l'épaisseur et le ferraillage. Les fondations représentent souvent 10 à 15 % du coût total d'une construction neuve. Une extension de 30 m² en maçonnerie traditionnelle coûte entre 30 000 et 60 000 euros hors finitions.

Le terrassement, souvent réalisé par le maçon ou sous-traité à un terrassier, est un poste à ne pas négliger. Il représente 5 à 10 % du budget de construction et conditionne la solidité des fondations. Un devis de maçonnerie doit clairement indiquer si le terrassement est inclus ou non.`
      },
      {
        title: 'Suivi de chantier et réception des travaux',
        content: `Pour un chantier de maçonnerie important, un suivi régulier est indispensable. Visitez le chantier au moins une fois par semaine et prenez des photos à chaque étape. Les points de contrôle essentiels sont : la profondeur et le ferraillage des fondations, l'aplomb des murs, le niveau des dalles et la qualité des joints.

La réception des travaux est l'acte qui déclenche les garanties légales (garantie de parfait achèvement d'un an, garantie biennale de deux ans, garantie décennale de dix ans). Formalisez cette réception par un procès-verbal signé, en mentionnant les éventuelles réserves.

En cas de litige, le recours à un expert en bâtiment est recommandé avant toute action judiciaire. Un constat d'huissier avec photos peut constituer une preuve précieuse. La médiation de la consommation est une voie de résolution amiable gratuite à privilégier avant le tribunal.`
      },
    ],
    faq: [
      { q: 'Combien coûte une extension de maison en maçonnerie ?', a: 'Une extension en maçonnerie traditionnelle coûte entre 1 000 et 2 000 euros le m² hors finitions (gros œuvre seul). Pour une extension complète clé en main (gros œuvre + second œuvre + finitions), comptez 1 800 à 3 500 euros le m² selon la région et les prestations.' },
      { q: 'Quelle est la durée de validité de la garantie décennale ?', a: 'La garantie décennale court pendant 10 ans à compter de la réception des travaux. Elle couvre les dommages compromettant la solidité de l\'ouvrage ou le rendant impropre à sa destination. Conservez l\'attestation d\'assurance décennale du maçon pendant toute cette période.' },
      { q: 'Faut-il un architecte pour une extension ?', a: 'L\'intervention d\'un architecte est obligatoire si la surface de plancher totale après travaux dépasse 150 m². En dessous, l\'architecte n\'est pas obligatoire mais reste recommandé pour les projets complexes. Un permis de construire est nécessaire pour toute extension de plus de 20 m².' },
      { q: 'Comment vérifier la qualité du béton utilisé ?', a: 'Demandez au maçon la fiche technique du béton utilisé : la classe de résistance (C25/30 est le standard pour les fondations), la classe d\'exposition (XC, XS, XF selon l\'environnement) et le rapport eau/ciment. Pour les chantiers importants, des éprouvettes de contrôle peuvent être réalisées.' },
      { q: 'Peut-on construire en hiver ?', a: 'La maçonnerie est déconseillée par temps de gel (température inférieure à 5 °C). Le mortier et le béton ne prennent pas correctement et la solidité est compromise. Si les travaux sont inévitables, des additifs antigel et une protection thermique du chantier sont nécessaires, ce qui augmente le coût.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comment-choisir-son-menuisier',
    title: 'Comment choisir son menuisier en 2026 ?',
    metaDescription: 'Guide pour choisir un menuisier compétent : spécialités, qualifications, tarifs fenêtres et portes, labels et conseils.',
    category: 'choisir',
    relatedServices: ['menuisier', 'poseur-de-parquet', 'storiste', 'charpentier'],
    sections: [
      {
        title: 'Menuisier intérieur ou extérieur : deux métiers distincts',
        content: `Le terme « menuisier » recouvre en réalité plusieurs spécialités distinctes. Le menuisier d'intérieur fabrique et pose les placards, dressings, escaliers, portes intérieures et agencements sur mesure. Le menuisier d'extérieur (ou poseur de menuiseries) installe les fenêtres, portes d'entrée, volets et vérandas.

Identifiez clairement votre besoin avant de rechercher un artisan. Un menuisier ébéniste excelle dans le travail du bois massif et la fabrication sur mesure, tandis qu'un poseur de menuiseries industrielles maîtrise l'installation de fenêtres PVC, aluminium et mixtes avec les exigences d'étanchéité et d'isolation associées.

Certains menuisiers sont spécialisés dans la restauration du patrimoine (fenêtres anciennes, boiseries, parquets). Cette compétence est recherchée pour les bâtiments classés ou en secteur sauvegardé, où le remplacement à l'identique est souvent imposé par l'Architecte des Bâtiments de France.`
      },
      {
        title: 'Qualifications et labels de qualité',
        content: `La qualification Qualibat 4311 à 4394 couvre les différentes spécialités de la menuiserie : menuiserie bois, PVC, aluminium, fermetures et volets. Le label RGE est indispensable pour les travaux d'amélioration de la performance énergétique (remplacement de fenêtres, isolation), car il conditionne l'accès aux aides financières.

Les labels des fabricants (Technal, Internorm, Tryba) certifient que le poseur a suivi une formation spécifique et respecte les préconisations de pose du fabricant. Un menuisier agréé par un fabricant offre une garantie de pose en plus de la garantie produit.

Le label Menuiseries 21, délivré par la FFB, identifie les entreprises de menuiserie engagées dans une démarche de qualité globale. La certification Qualicoat atteste de la qualité du laquage de l'aluminium, un critère important pour les menuiseries extérieures en aluminium.`
      },
      {
        title: 'Tarifs et aides financières pour les fenêtres',
        content: `Le remplacement d'une fenêtre coûte entre 300 et 800 euros en PVC, 500 à 1 200 euros en aluminium et 600 à 1 500 euros en bois, fourniture et pose comprises. Une porte d'entrée se situe entre 1 500 et 4 000 euros selon le matériau et le niveau de sécurité.

Le remplacement des fenêtres bénéficie de MaPrimeRénov' et des CEE si les nouvelles menuiseries respectent les exigences de performance thermique (Uw ≤ 1,3 W/m²K pour les fenêtres, Ud ≤ 1,7 W/m²K pour les portes). Le montant des aides varie de 40 à 100 euros par fenêtre selon vos revenus.

Pour une maison de 10 fenêtres, le remplacement complet représente un investissement de 5 000 à 15 000 euros avant aides. Le retour sur investissement se situe entre 8 et 15 ans grâce aux économies de chauffage, mais le confort est immédiat (suppression des courants d'air, réduction du bruit).`
      },
      {
        title: 'Points de vigilance à la commande et à la pose',
        content: `Lors de la commande de menuiseries, vérifiez les performances thermiques (coefficient Uw) et acoustiques (indice Rw) des produits proposés. Le vitrage doit être adapté à l'exposition : double vitrage standard pour les façades protégées, vitrage à contrôle solaire pour les baies exposées au sud.

La qualité de la pose est aussi importante que la qualité du produit. Exigez une pose en applique intérieure ou en tunnel selon la configuration, avec un calfeutrement soigné (mousse expansive, mastic, membrane d'étanchéité). Les ponts thermiques au niveau des dormants sont la cause principale de condensation autour des fenêtres.

Après la pose, vérifiez l'ouverture et la fermeture de chaque ouvrant, l'étanchéité à l'eau et à l'air, le fonctionnement des poignées et des systèmes de ventilation intégrés. Le procès-verbal de réception doit lister les éventuelles réserves à corriger par le menuisier.`
      },
    ],
    faq: [
      { q: 'PVC, aluminium ou bois : quelle menuiserie choisir ?', a: 'Le PVC offre le meilleur rapport qualité-prix et d\'excellentes performances thermiques. L\'aluminium est plus fin et plus design, idéal pour les grandes baies vitrées. Le bois est le plus écologique et le plus esthétique, mais nécessite un entretien régulier. Les menuiseries mixtes (bois-alu) combinent les avantages des deux matériaux.' },
      { q: 'Combien de temps pour remplacer toutes les fenêtres ?', a: 'Le remplacement de 10 fenêtres prend généralement 3 à 5 jours. Chaque fenêtre nécessite 2 à 4 heures de pose selon la configuration. Les délais de fabrication sur mesure sont de 4 à 8 semaines après la prise de cotes.' },
      { q: 'Le remplacement des fenêtres est-il éligible à MaPrimeRénov\' ?', a: 'Oui, le remplacement de fenêtres simple vitrage par du double ou triple vitrage est éligible à MaPrimeRénov\'. Le montant de l\'aide varie de 40 à 100 euros par fenêtre selon vos revenus. Les travaux doivent être réalisés par un artisan RGE.' },
      { q: 'Faut-il un permis pour changer les fenêtres ?', a: 'Si vous changez le matériau, la couleur ou les dimensions des fenêtres, une déclaration préalable de travaux est nécessaire. En secteur protégé (ABF), l\'accord de l\'Architecte des Bâtiments de France est obligatoire. Un remplacement strictement à l\'identique ne nécessite aucune formalité.' },
      { q: 'Quelle est la durée de vie d\'une fenêtre ?', a: 'Une fenêtre PVC dure 25 à 35 ans, une fenêtre aluminium 30 à 40 ans et une fenêtre bois bien entretenue 40 à 60 ans. Le double vitrage a une durée de vie de 20 à 30 ans (perte de gaz argon). Le remplacement des joints tous les 10-15 ans prolonge la durée de vie de l\'ensemble.' },
    ],
    lastUpdated: '2026-02-01',
  },
  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE : ENTRETIEN (7 guides)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'entretien-chaudiere-guide',
    title: 'Entretien de chaudière : le guide complet 2026',
    metaDescription: 'Tout savoir sur l\'entretien obligatoire de votre chaudière : fréquence, prix, réglementation et conseils pratiques.',
    category: 'entretien',
    relatedServices: ['chauffagiste', 'ramoneur'],
    sections: [
      { title: 'L\'entretien annuel : une obligation légale', content: `L'entretien annuel de la chaudière est obligatoire en France depuis le décret du 9 juin 2009, quel que soit le type de combustible (gaz, fioul, bois, granulés). Cette obligation concerne aussi bien les propriétaires que les locataires, ces derniers étant responsables de l'entretien courant.

L'entretien doit être réalisé par un professionnel qualifié qui délivre une attestation d'entretien dans les 15 jours suivant la visite. Ce document est précieux : votre assureur peut l'exiger en cas de sinistre lié au chauffage. Conservez-le pendant au moins 2 ans.

En cas de non-respect de cette obligation, le locataire s'expose à une retenue sur le dépôt de garantie et le propriétaire peut voir sa responsabilité engagée en cas d'accident. Les compagnies d'assurance peuvent également refuser d'indemniser un sinistre si l'entretien n'a pas été effectué.` },
      { title: 'Que comprend l\'entretien de chaudière ?', content: `L'entretien standard d'une chaudière gaz comprend : le nettoyage du corps de chauffe et du brûleur, la vérification des organes de sécurité (thermocouple, pressostats), le contrôle de la combustion (mesure du taux de CO), le nettoyage du conduit de raccordement, la vérification de l'étanchéité des circuits gaz et eau, et le réglage du brûleur pour optimiser le rendement.

Pour une chaudière fioul, l'entretien inclut en plus le remplacement du gicleur, le nettoyage du filtre à fioul et le contrôle du réservoir. Pour une chaudière bois ou granulés, le ramonage du conduit de fumée fait partie intégrante de l'entretien.

Le technicien mesure le taux de monoxyde de carbone (CO) dans l'ambiance. Si le taux dépasse 20 ppm, il est tenu de vous alerter et de prendre des mesures correctives. Le CO est un gaz inodore et mortel qui cause encore une trentaine de décès par an en France.` },
      { title: 'Prix et contrats d\'entretien', content: `L'entretien annuel ponctuel coûte entre 100 et 200 euros pour une chaudière gaz, 150 à 250 euros pour une chaudière fioul et 150 à 300 euros pour une chaudière bois ou granulés. Ces tarifs varient selon la région et le type d'appareil.

Un contrat d'entretien annuel est souvent plus avantageux : pour 150 à 300 euros par an, il inclut la visite annuelle obligatoire, le dépannage prioritaire et parfois les pièces d'usure courante. Certains contrats haut de gamme incluent le remplacement des pièces défectueuses.

Comparez les offres de contrat en vérifiant : le délai d'intervention garanti en cas de panne, les pièces incluses ou exclues, les horaires couverts (journée ou 24h/24) et les conditions de résiliation. Un contrat avec un délai d'intervention de 24 à 48 heures est un bon compromis entre prix et réactivité.` },
      { title: 'Quand remplacer plutôt qu\'entretenir ?', content: `Une chaudière a une durée de vie moyenne de 15 à 25 ans selon le type et l'entretien. Au-delà de 15 ans, les pannes deviennent plus fréquentes et les pièces de rechange plus difficiles à trouver. Si le coût des réparations dépasse 30 à 40 % du prix d'un appareil neuf, le remplacement est préférable.

Les signes qui doivent vous alerter : une augmentation anormale de la consommation de combustible, des bruits inhabituels, des variations de température, une flamme jaune ou orangée au lieu de bleue (chaudière gaz), ou un taux de CO ambiant élevé lors de l'entretien.

Le remplacement d'une vieille chaudière par un modèle à condensation ou une pompe à chaleur peut réduire votre facture de chauffage de 20 à 40 %. Avec les aides financières de 2026 (MaPrimeRénov', CEE), le reste à charge est souvent inférieur au coût cumulé des réparations sur quelques années.` },
    ],
    faq: [
      { q: 'L\'entretien de chaudière est-il à la charge du locataire ?', a: 'Oui, l\'entretien courant de la chaudière est à la charge du locataire, conformément au décret du 26 août 1987. Le propriétaire est responsable du remplacement de l\'appareil en cas de vétusté. En cas de doute, consultez votre bail.' },
      { q: 'Quand faire l\'entretien de sa chaudière ?', a: 'L\'idéal est de planifier l\'entretien en septembre-octobre, avant le début de la saison de chauffe. Cela permet de détecter les éventuels problèmes avant les premiers froids et d\'éviter les files d\'attente des chauffagistes en plein hiver.' },
      { q: 'Que risque-t-on sans entretien de chaudière ?', a: 'Sans entretien, vous risquez une panne en plein hiver, une surconsommation de combustible, un risque d\'intoxication au CO et un refus d\'indemnisation par votre assurance en cas de sinistre. L\'amende théorique est rare mais la responsabilité civile est engagée.' },
      { q: 'L\'entretien d\'une pompe à chaleur est-il obligatoire ?', a: 'Oui, depuis le 1er juillet 2020, l\'entretien des pompes à chaleur de plus de 4 kW est obligatoire tous les 2 ans. Il comprend la vérification du circuit frigorifique, le contrôle des performances et la vérification des organes de sécurité. Coût : 150 à 300 euros.' },
      { q: 'Peut-on changer de prestataire d\'entretien en cours de contrat ?', a: 'Oui, un contrat d\'entretien peut être résilié chaque année à sa date anniversaire, avec un préavis de 1 à 3 mois selon les conditions générales. La résiliation doit être envoyée par lettre recommandée avec accusé de réception.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'entretien-toiture-guide',
    title: 'Entretien de toiture : guide pratique 2026',
    metaDescription: 'Comment entretenir votre toiture : fréquence d\'inspection, nettoyage, démoussage, réparations courantes et tarifs.',
    category: 'entretien',
    relatedServices: ['couvreur', 'zingueur', 'etancheiste', 'charpentier'],
    sections: [
      { title: 'Pourquoi entretenir régulièrement sa toiture', content: `La toiture protège votre habitation des intempéries et représente un investissement important. Un entretien régulier prévient les infiltrations, prolonge la durée de vie des matériaux et préserve la valeur de votre patrimoine immobilier. Une toiture négligée peut entraîner des dégâts considérables sur la charpente et l'isolation.

Les mousses, lichens et algues qui s'installent sur les tuiles retiennent l'humidité et accélèrent la dégradation des matériaux. Ils peuvent également provoquer des remontées capillaires sous les tuiles, causant des infiltrations invisibles depuis l'intérieur. Un démoussage régulier est donc essentiel.

L'entretien de toiture est aussi une question de sécurité. Des tuiles déplacées ou cassées peuvent tomber lors d'une tempête et blesser quelqu'un. Les gouttières bouchées provoquent des débordements qui endommagent les façades et les fondations.` },
      { title: 'Le calendrier d\'entretien idéal', content: `Inspectez votre toiture visuellement depuis le sol au moins deux fois par an : au printemps (après l'hiver) et à l'automne (avant l'hiver). Recherchez les tuiles déplacées, cassées ou manquantes, les traces de mousse, l'état des solins et des faîtages.

Le nettoyage des gouttières doit être effectué au moins deux fois par an, au printemps et en automne, surtout si des arbres surplombent le toit. Des gouttières bouchées provoquent des débordements qui endommagent la façade et peuvent compromettre les fondations.

Faites réaliser une inspection professionnelle complète tous les 5 ans par un couvreur qualifié. Cette inspection inclut l'examen de la sous-toiture, des points de pénétration (cheminée, velux), de la ventilation et de l'état général de la charpente. Le coût d'une inspection se situe entre 150 et 300 euros.` },
      { title: 'Démoussage et nettoyage : méthodes et prix', content: `Le démoussage d'une toiture peut être réalisé par application d'un produit anti-mousse (traitement curatif), par nettoyage haute pression ou par brossage manuel. La méthode haute pression est rapide mais peut endommager les tuiles fragiles (tuiles anciennes, ardoises). Le traitement chimique est plus doux mais nécessite plusieurs semaines pour agir.

Le coût du démoussage varie de 15 à 30 euros le m² selon la méthode et l'accessibilité. Pour une toiture de 100 m², comptez entre 1 500 et 3 000 euros. L'application d'un traitement hydrofuge après le démoussage (10 à 20 euros le m²) prolonge l'effet du traitement de 5 à 10 ans.

Attention aux entreprises de démoussage qui pratiquent le démarchage à domicile avec des prix attractifs. Vérifiez toujours le SIRET, l'assurance et les références avant de confier vos travaux. Le droit de rétractation de 14 jours s'applique pour les contrats signés à domicile.` },
      { title: 'Réparations courantes et quand intervenir', content: `Les réparations courantes de toiture comprennent : le remplacement de tuiles cassées (20 à 50 euros par tuile, pose comprise), la reprise de faîtage (30 à 60 euros le mètre linéaire), le remplacement de solins autour des cheminées (200 à 500 euros) et la réparation de gouttières (50 à 200 euros par mètre linéaire).

Une intervention rapide après une tempête limite les dégâts. Si vous constatez des tuiles déplacées, bâchez provisoirement la zone et contactez un couvreur rapidement. Déclarez le sinistre à votre assurance habitation dans les 5 jours suivant la tempête (10 jours pour une catastrophe naturelle).

Le remplacement complet de la toiture est nécessaire lorsque les réparations ponctuelles ne suffisent plus : tuiles poreuses généralisées, charpente affaiblie, isolation inexistante. C'est souvent l'occasion de refaire l'isolation de la toiture et de bénéficier des aides à la rénovation énergétique.` },
    ],
    faq: [
      { q: 'À quelle fréquence faut-il démousser sa toiture ?', a: 'Le démoussage est recommandé tous les 3 à 5 ans selon l\'exposition et l\'environnement. Les toitures orientées au nord, ombragées par des arbres ou situées en zone humide nécessitent un démoussage plus fréquent (tous les 2-3 ans).' },
      { q: 'Peut-on marcher sur une toiture en tuiles ?', a: 'Marcher sur une toiture est dangereux et doit être réservé aux professionnels équipés (harnais, échelle de toit). Certaines tuiles (tuiles canal, tuiles anciennes) sont fragiles et se cassent sous le poids. Ne montez jamais sur un toit mouillé ou par vent fort.' },
      { q: 'Le nettoyage haute pression abîme-t-il les tuiles ?', a: 'Oui, une pression trop élevée peut éroder la surface des tuiles et réduire leur étanchéité. La pression doit être limitée à 80-100 bars et le jet orienté dans le sens de la pente. Pour les tuiles anciennes ou fragiles, préférez un traitement chimique ou un brossage.' },
      { q: 'Mon assurance couvre-t-elle les dégâts de toiture ?', a: 'L\'assurance habitation couvre les dégâts causés par les tempêtes, la grêle et les catastrophes naturelles. Elle ne couvre pas le vieillissement normal ni le défaut d\'entretien. Déclarez tout sinistre dans les 5 jours et conservez les preuves (photos, factures).' },
      { q: 'Combien coûte un contrat d\'entretien toiture ?', a: 'Un contrat d\'entretien annuel de toiture coûte entre 200 et 500 euros par an. Il comprend une inspection visuelle, le nettoyage des gouttières, le remplacement des tuiles cassées et de petites réparations. C\'est un investissement rentable pour prévenir les gros travaux.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'entretien-plomberie-guide',
    title: 'Entretien de la plomberie : prévenir les pannes',
    metaDescription: 'Guide d\'entretien plomberie : prévention des fuites, détartrage, hivernage des canalisations et gestes d\'entretien courant.',
    category: 'entretien',
    relatedServices: ['plombier', 'chauffagiste', 'salle-de-bain'],
    sections: [
      { title: 'Les gestes d\'entretien au quotidien', content: `L'entretien régulier de votre plomberie permet d'éviter les pannes coûteuses et les dégâts des eaux. Quelques gestes simples au quotidien suffisent à maintenir vos installations en bon état de fonctionnement.

Nettoyez régulièrement les filtres de robinet (aérateurs ou mousseurs) qui s'encrassent avec le calcaire. Un aérateur bouché réduit le débit et provoque des projections. Dévissez-le, laissez-le tremper dans du vinaigre blanc pendant une heure, puis rincez-le.

Vérifiez l'absence de fuite sous les éviers et lavabos au moins une fois par mois. Une micro-fuite ignorée peut causer des dégâts importants : humidité, moisissures, dégradation du meuble et éventuellement dégât des eaux chez le voisin du dessous.` },
      { title: 'Le détartrage des installations', content: `Le calcaire est l'ennemi numéro un de la plomberie, surtout dans les régions à eau dure (Nord, Est, Bassin parisien). Il réduit le débit des canalisations, diminue l'efficacité du chauffe-eau et endommage la robinetterie.

Le chauffe-eau doit être détartré tous les 2 à 5 ans selon la dureté de l'eau. Un chauffe-eau entartré consomme jusqu'à 30 % d'énergie supplémentaire et sa durée de vie est réduite de moitié. Le détartrage coûte entre 100 et 200 euros pour un chauffe-eau électrique.

Pour les canalisations, un détartrage préventif tous les 5 ans est recommandé dans les zones calcaires. L'installation d'un adoucisseur d'eau (1 500 à 3 000 euros) est un investissement rentable à long terme qui protège l'ensemble des canalisations, des appareils sanitaires et de l'électroménager.` },
      { title: 'Préparer l\'hiver : l\'hivernage des canalisations', content: `Le gel est la cause principale des ruptures de canalisation en hiver. L'eau qui gèle augmente de volume de 9 %, ce qui peut faire éclater même les tuyaux en cuivre. Les canalisations les plus vulnérables sont celles situées dans les combles non isolés, les garages, les caves non chauffées et les murs extérieurs.

Avant les premières gelées, isolez les canalisations exposées avec des manchons en mousse ou en laine minérale. Fermez les robinets extérieurs et purgez les canalisations correspondantes. Si vous vous absentez en hiver, maintenez le chauffage à au moins 7 degrés pour éviter le gel des canalisations intérieures.

En cas de gel, ne tentez jamais de dégeler un tuyau avec une flamme nue (chalumeau, sèche-cheveux en contact). Utilisez un radiateur soufflant à distance ou des serpillières imbibées d'eau chaude. Si le tuyau a éclaté, coupez immédiatement l'arrivée d'eau et appelez un plombier.` },
      { title: 'Quand faire appel à un professionnel', content: `Certaines situations nécessitent l'intervention d'un plombier professionnel : fuite importante, canalisation bouchée résistant aux méthodes simples, bruit anormal dans les canalisations (coup de bélier), chute de pression inhabituelle, traces d'humidité au plafond ou présence d'odeurs d'égout.

Un contrôle annuel de votre installation par un plombier permet de détecter les problèmes naissants : joints usés, raccords oxydés, flexibles fragilisés, groupe de sécurité du chauffe-eau défaillant. Le coût d'une visite de contrôle (80 à 150 euros) est dérisoire par rapport aux frais d'un dégât des eaux.

Pour les installations anciennes de plus de 30 ans, une inspection par caméra des canalisations d'évacuation (200 à 500 euros) peut révéler des problèmes invisibles : fissures, racines infiltrées, effondrement partiel. Cette inspection est particulièrement recommandée avant l'achat d'un bien immobilier.` },
    ],
    faq: [
      { q: 'Comment éviter les bouchons de canalisation ?', a: 'Installez des grilles de protection sur les éviers et douches pour retenir les cheveux et débris. Ne versez jamais de graisse dans l\'évier (laissez-la figer puis jetez-la à la poubelle). Versez régulièrement de l\'eau bouillante dans les canalisations pour dissoudre les dépôts de savon.' },
      { q: 'Quelle est la durée de vie des canalisations ?', a: 'Les tuyaux en cuivre durent 50 à 80 ans, en PER 50 ans environ, en PVC d\'évacuation 40 à 50 ans. Les tuyaux en plomb (interdits depuis 1995) et en acier galvanisé (sujets à la corrosion) doivent être remplacés prioritairement.' },
      { q: 'Comment réduire sa consommation d\'eau ?', a: 'Installez des mousseurs économiques sur les robinets (réduction de 30 à 50 % du débit), un mitigeur thermostatique sur la douche, une chasse d\'eau double débit et réparez immédiatement les fuites. Un robinet qui goutte gaspille jusqu\'à 5 litres par heure, soit 120 litres par jour.' },
      { q: 'Faut-il un adoucisseur d\'eau ?', a: 'Un adoucisseur est recommandé si la dureté de votre eau dépasse 25 °f (degrés français). Il protège les canalisations et les appareils du calcaire. Coût : 1 500 à 3 000 euros installation comprise, plus 50 à 100 euros par an de sel. Renseignez-vous sur la dureté de votre eau auprès de votre fournisseur.' },
      { q: 'Comment couper l\'eau en cas d\'urgence ?', a: 'Le robinet d\'arrêt général se trouve généralement près du compteur d\'eau, dans la cave, le garage ou un placard technique. En appartement, il est souvent dans la cuisine ou la salle de bain. Repérez-le à l\'avance et vérifiez qu\'il fonctionne (tournez-le doucement dans les deux sens une fois par an).' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'entretien-electricite-guide',
    title: 'Entretien de l\'installation électrique : le guide',
    metaDescription: 'Comment entretenir votre installation électrique : vérifications périodiques, signes d\'alerte et normes de sécurité.',
    category: 'entretien',
    relatedServices: ['electricien', 'domoticien'],
    sections: [
      { title: 'Vérifications que vous pouvez faire vous-même', content: `Certaines vérifications électriques simples peuvent être réalisées par tout particulier sans risque. Testez le disjoncteur différentiel 30 mA chaque mois en appuyant sur le bouton « test » : le dispositif doit se déclencher immédiatement. S'il ne se déclenche pas, faites-le remplacer en urgence par un électricien.

Vérifiez régulièrement l'état de vos prises et interrupteurs : une prise qui chauffe, un interrupteur qui grésille ou une odeur de brûlé sont des signes d'alerte nécessitant une intervention rapide. Ne surchargez jamais une prise avec des multiprises en cascade, car cela peut provoquer un échauffement et un incendie.

Assurez-vous que votre tableau électrique est accessible, propre et correctement étiqueté. Chaque disjoncteur doit être identifié (cuisine, chambres, salon, etc.) pour faciliter les interventions en cas de problème. Un tableau bien organisé est le signe d'une installation soignée.` },
      { title: 'Le diagnostic électrique périodique', content: `Même si le diagnostic électrique n'est obligatoire que pour la vente ou la location d'un logement de plus de 15 ans, il est recommandé de faire vérifier votre installation tous les 10 ans par un professionnel. Le coût d'un diagnostic complet se situe entre 100 et 250 euros selon la taille du logement.

Le diagnostic vérifie la conformité à la norme NF C 15-100 sur plusieurs points critiques : présence d'un appareil général de commande et de protection, présence d'un dispositif différentiel 30 mA, mise à la terre effective, protection mécanique des conducteurs et absence de matériel vétuste ou inadapté.

Les installations de plus de 25 ans présentent souvent des non-conformités significatives. Les plus fréquentes sont l'absence de prise de terre dans les pièces d'eau, l'absence de disjoncteur différentiel 30 mA et la présence de fils électriques en tissu (installations d'avant les années 1970).` },
      { title: 'Mise aux normes : quand et pourquoi', content: `La mise aux normes complète n'est obligatoire que pour les constructions neuves et les rénovations totales. Pour les installations existantes, les travaux de mise en sécurité portent sur les six points essentiels définis par la norme : protection générale, différentiel 30 mA, mise à la terre, protection des fils, matériel adapté et absence de risques de contact direct.

Le coût d'une mise en sécurité partielle varie de 1 500 à 4 000 euros pour un appartement de 60 m². Une mise aux normes complète (réfection totale) coûte 5 000 à 10 000 euros. L'investissement est justifié par la sécurité de votre famille et la valorisation de votre bien immobilier.

En copropriété, les parties communes électriques (éclairage, ascenseur, portail) doivent être contrôlées régulièrement. Le syndic est responsable de la conformité des installations communes. Le plan pluriannuel de travaux obligatoire depuis 2023 doit intégrer la mise aux normes électrique si nécessaire.` },
      { title: 'Sécurité électrique au quotidien', content: `Les incendies d'origine électrique représentent environ 25 % des incendies domestiques en France, soit plus de 50 000 par an. La plupart sont causés par des installations vétustes, des multiprises surchargées ou du matériel défectueux. La prévention passe par des gestes simples et un entretien régulier.

N'utilisez que du matériel conforme aux normes françaises et européennes (marquage NF ou CE). Évitez les rallonges permanentes et les multiprises bon marché. Débranchez les appareils que vous n'utilisez pas et ne laissez jamais un chargeur branché à vide, car il continue de consommer et peut surchauffer.

Installez des détecteurs de fumée à chaque niveau de votre habitation (obligatoire depuis 2015). Pour une protection renforcée, les détecteurs de fumée interconnectés alertent simultanément dans toutes les pièces. Un détecteur de monoxyde de carbone est également recommandé si vous avez une chaudière à combustion.` },
    ],
    faq: [
      { q: 'À quelle fréquence tester le disjoncteur différentiel ?', a: 'Le disjoncteur différentiel 30 mA doit être testé chaque mois en appuyant sur le bouton « test ». S\'il ne se déclenche pas, faites-le remplacer immédiatement. Ce dispositif est votre protection principale contre l\'électrocution.' },
      { q: 'Comment savoir si mon installation est dangereuse ?', a: 'Les signes d\'alerte sont : prises qui chauffent, interrupteurs qui grésillent, odeur de brûlé, fusibles qui sautent fréquemment, absence de prise de terre, fils électriques en tissu ou encore tableau avec des fusibles à broche. En cas de doute, faites réaliser un diagnostic par un électricien.' },
      { q: 'Les multiprises sont-elles dangereuses ?', a: 'Les multiprises de qualité ne sont pas dangereuses si elles sont utilisées correctement. Ne branchez jamais une multiprise sur une autre multiprise et ne dépassez pas la puissance maximale indiquée (souvent 3 500 W). Évitez les multiprises bas de gamme sans protection contre les surtensions.' },
      { q: 'Faut-il un parafoudre ?', a: 'Un parafoudre est obligatoire dans les zones AQ2 (définies par arrêté préfectoral) et recommandé partout. Il protège vos équipements électroniques contre les surtensions causées par la foudre. Le coût d\'installation est de 200 à 500 euros, bien inférieur au coût de remplacement des appareils endommagés.' },
      { q: 'Combien coûte le remplacement d\'un tableau électrique ?', a: 'Le remplacement d\'un tableau électrique coûte entre 800 et 2 500 euros selon le nombre de circuits et les protections nécessaires. Ce prix inclut le nouveau tableau, les disjoncteurs, les différentiels et la main-d\'œuvre. C\'est un investissement essentiel pour la sécurité.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'entretien-climatisation-guide',
    title: 'Entretien de la climatisation : guide pratique',
    metaDescription: 'Tout sur l\'entretien de votre climatisation : nettoyage des filtres, recharge de gaz, obligations légales et tarifs.',
    category: 'entretien',
    relatedServices: ['climaticien', 'chauffagiste', 'pompe-a-chaleur'],
    sections: [
      { title: 'L\'entretien obligatoire de la climatisation', content: `Depuis le 1er juillet 2020, les systèmes de climatisation contenant plus de 2 kg de fluide frigorigène (soit la plupart des installations de plus de 5 kW) doivent être contrôlés par un professionnel certifié tous les 2 ans. Cette obligation est inscrite dans le Code de l'environnement.

Le contrôle obligatoire porte sur l'étanchéité du circuit frigorifique, la quantité de fluide, le bon fonctionnement des organes de sécurité et les performances énergétiques de l'appareil. Le technicien doit détenir une attestation de capacité pour la manipulation des fluides frigorigènes.

Le non-respect de cette obligation expose à des sanctions pouvant aller jusqu'à 1 500 euros d'amende. Au-delà de l'aspect réglementaire, un entretien régulier réduit la consommation d'énergie de 15 à 25 % et prolonge la durée de vie de l'appareil de 5 à 10 ans.` },
      { title: 'Nettoyage des filtres : le geste essentiel', content: `Le nettoyage des filtres est le geste d'entretien le plus important et le plus simple à réaliser soi-même. Des filtres encrassés réduisent le débit d'air, augmentent la consommation d'énergie et dégradent la qualité de l'air intérieur en favorisant le développement de bactéries et de moisissures.

Pour les climatiseurs split, nettoyez les filtres de l'unité intérieure toutes les 2 à 4 semaines pendant la période d'utilisation. Retirez le filtre, aspirez la poussière avec un aspirateur, puis lavez-le à l'eau tiède savonneuse. Laissez-le sécher complètement avant de le remettre en place.

Les unités extérieures doivent également être nettoyées régulièrement. Dégagez les feuilles et débris autour de l'unité et nettoyez les ailettes du condenseur au jet d'eau à basse pression. Un échangeur encrassé réduit significativement les performances et peut provoquer une surchauffe du compresseur.` },
      { title: 'Problèmes courants et solutions', content: `Les problèmes les plus fréquents sont : une baisse de performance (l'appareil ne refroidit plus suffisamment), des mauvaises odeurs, des bruits anormaux, des fuites d'eau et une surconsommation d'énergie. La plupart de ces problèmes sont liés à un défaut d'entretien.

Les mauvaises odeurs proviennent généralement de moisissures dans le bac à condensats ou sur l'évaporateur. Un nettoyage complet avec un produit antimicrobien spécifique résout le problème. Si les odeurs persistent, faites appel à un professionnel pour un nettoyage en profondeur.

Une fuite de fluide frigorigène se manifeste par une baisse progressive des performances et la formation de givre sur l'unité intérieure. Seul un technicien certifié peut diagnostiquer et réparer la fuite, puis recharger le circuit. La manipulation de fluides frigorigènes par un non-professionnel est interdite et dangereuse.` },
      { title: 'Tarifs d\'entretien et contrats', content: `L'entretien annuel d'un climatiseur split coûte entre 100 et 200 euros. Pour un système multi-split ou gainable, comptez 150 à 350 euros. Le contrôle obligatoire biennal avec vérification du circuit frigorifique se situe entre 150 et 300 euros.

Un contrat d'entretien annuel est recommandé pour les installations importantes. Pour 150 à 400 euros par an, il inclut une ou deux visites de contrôle, le nettoyage complet, la vérification du fluide frigorigène et un dépannage prioritaire en cas de panne.

Le remplacement d'un climatiseur en fin de vie coûte entre 1 500 et 3 500 euros pour un split mural et 3 000 à 8 000 euros pour un système multi-split. Les modèles récents consomment 20 à 40 % de moins que les appareils de plus de 10 ans.` },
    ],
    faq: [
      { q: 'À quelle fréquence nettoyer les filtres de climatisation ?', a: 'Nettoyez les filtres toutes les 2 à 4 semaines pendant la période d\'utilisation intensive (été). En mi-saison, un nettoyage mensuel suffit. Remplacez les filtres usés une fois par an ou selon les recommandations du fabricant.' },
      { q: 'La climatisation est-elle nocive pour la santé ?', a: 'Non, si elle est correctement entretenue et utilisée. Les risques surviennent avec des filtres sales (allergies, infections) ou un écart de température trop important avec l\'extérieur (chocs thermiques). Maintenez un écart de 5 à 7 °C maximum et nettoyez régulièrement les filtres.' },
      { q: 'Combien coûte une recharge de gaz climatisation ?', a: 'Une recharge de fluide frigorigène coûte entre 150 et 400 euros selon la quantité et le type de fluide. Attention : une recharge ne résout pas le problème si la fuite n\'est pas réparée. Exigez une recherche de fuite avant toute recharge.' },
      { q: 'Peut-on utiliser la climatisation réversible en hiver ?', a: 'Oui, la climatisation réversible (pompe à chaleur air-air) est efficace en chauffage jusqu\'à des températures extérieures de -5 à -15 °C selon les modèles. Son COP de 3 à 4 en fait un mode de chauffage économique en mi-saison et dans les régions à hiver doux.' },
      { q: 'Quelle est la durée de vie d\'un climatiseur ?', a: 'Un climatiseur split bien entretenu dure 10 à 15 ans. Un système gainable peut durer 15 à 20 ans. Le compresseur est la pièce maîtresse : sa durée de vie dépend directement de la qualité de l\'entretien (nettoyage des filtres, vérification du fluide).' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'entretien-facade-guide',
    title: 'Entretien de façade : quand et comment agir ?',
    metaDescription: 'Guide complet d\'entretien de façade : nettoyage, ravalement, traitement anti-mousse, obligations légales et tarifs.',
    category: 'entretien',
    relatedServices: ['facadier', 'peintre-en-batiment', 'macon'],
    sections: [
      { title: 'Pourquoi entretenir sa façade', content: `La façade est la première protection de votre habitation contre les intempéries. Elle joue un rôle essentiel dans l'isolation thermique et l'étanchéité du bâtiment. Une façade en mauvais état entraîne des infiltrations, des pertes de chaleur et une dévalorisation de votre bien immobilier.

L'encrassement naturel des façades est inévitable : pollution atmosphérique en zone urbaine, développement de mousses et lichens en zone humide, salinité en bord de mer. Sans entretien, ces agressions accélèrent la dégradation des enduits et des joints, ouvrant la voie aux infiltrations d'eau.

Dans certaines communes, le ravalement de façade est obligatoire tous les 10 ans (arrêté municipal). À Paris, la mairie peut envoyer une injonction de ravaler. En copropriété, le ravalement figure au plan pluriannuel de travaux et son coût est réparti entre les copropriétaires.` },
      { title: 'Les différentes techniques de nettoyage', content: `Le nettoyage à haute pression est la méthode la plus rapide, adaptée aux façades en béton ou en pierre dure. La pression doit être adaptée au matériau pour éviter les détériorations. Les façades en pierre tendre, en brique ou en enduit ancien nécessitent un nettoyage à basse pression ou par ruissellement d'eau.

Le gommage et l'hydrogommage projettent des micro-particules (sable fin, bicarbonate) mélangées à de l'eau. Ces techniques sont plus douces et conviennent aux façades fragiles ou aux bâtiments historiques. Elles permettent un nettoyage en profondeur sans abîmer le parement.

Le nettoyage chimique utilise des produits spécifiques selon le type de salissure : anti-mousse pour les végétaux, décapant pour les traces de pollution, détergent alcalin pour les graisses. Le choix du produit doit être adapté au matériau de la façade pour éviter toute réaction chimique dommageable.` },
      { title: 'Ravalement de façade : étapes et coûts', content: `Un ravalement complet comprend plusieurs étapes : diagnostic de l'état de la façade, installation de l'échafaudage, nettoyage, réparation des fissures et des joints, application de l'enduit ou de la peinture de finition, et traitement hydrofuge ou anti-mousse.

Le coût d'un ravalement varie de 30 à 70 euros le m² pour un nettoyage et une peinture, et de 50 à 100 euros le m² pour un ravalement complet avec reprise d'enduit. L'isolation thermique par l'extérieur (ITE) ajoute 80 à 150 euros le m² mais permet de bénéficier de MaPrimeRénov'.

L'échafaudage représente un poste important : 10 à 20 euros le m² pour une installation standard. Pour les immeubles élevés ou les accès difficiles, des techniques de travaux sur cordes (escalade) peuvent réduire ce coût. Les autorisations d'occupation du domaine public sont à la charge de l'entreprise.` },
      { title: 'Traitements préventifs et durabilité', content: `L'application d'un traitement hydrofuge après le ravalement protège la façade de l'eau et de la pollution pendant 5 à 10 ans. Ce traitement invisible laisse respirer le mur tout en empêchant l'eau de s'infiltrer. Son coût (10 à 20 euros le m²) est largement rentabilisé par l'allongement de la durée de vie du ravalement.

Le traitement anti-mousse préventif est particulièrement recommandé pour les façades exposées au nord ou ombragées. Appliqué après le nettoyage, il retarde l'apparition des mousses et lichens de 3 à 5 ans. Les produits biodégradables sont à privilégier pour respecter l'environnement.

Pour les façades en pierre, un traitement consolidant peut être nécessaire si la pierre est friable ou fissurée. Ce traitement à base de silicate d'éthyle pénètre dans la pierre et reconstitue le liant sans modifier l'aspect de surface. Il doit être réalisé par un professionnel spécialisé en restauration de pierre.` },
    ],
    faq: [
      { q: 'Le ravalement de façade est-il obligatoire ?', a: 'Dans certaines communes, un arrêté municipal impose le ravalement tous les 10 ans. À Paris, la mairie peut envoyer une injonction de ravaler. En l\'absence d\'arrêté, le ravalement n\'est pas obligatoire mais reste recommandé pour préserver le bâtiment.' },
      { q: 'Combien coûte un ravalement de façade ?', a: 'Le ravalement coûte de 30 à 100 euros le m² selon la technique. Pour une maison de 150 m² de façade, comptez 5 000 à 15 000 euros. Avec isolation thermique par l\'extérieur, le budget monte à 15 000 à 30 000 euros mais bénéficie d\'aides financières importantes.' },
      { q: 'Faut-il une autorisation pour ravaler sa façade ?', a: 'Oui, une déclaration préalable de travaux est nécessaire pour tout ravalement modifiant l\'aspect extérieur (changement de couleur, de matériau). En secteur ABF, l\'accord de l\'Architecte des Bâtiments de France est obligatoire. Un ravalement à l\'identique ne nécessite qu\'une déclaration simple.' },
      { q: 'Quelle est la meilleure saison pour ravaler ?', a: 'La période idéale se situe entre avril et octobre, par temps sec, avec des températures entre 5 et 30 °C et une humidité relative inférieure à 80 %. Évitez les périodes de gel, de pluie prolongée et de forte chaleur qui compromettent la prise des enduits et peintures.' },
      { q: 'L\'ITE est-elle rentable ?', a: 'L\'isolation thermique par l\'extérieur permet de réduire les pertes de chaleur par les murs de 20 à 25 %. Le surcoût par rapport à un ravalement simple est de 50 à 80 euros le m², mais les aides (MaPrimeRénov\', CEE) peuvent couvrir 40 à 75 % du montant. Le retour sur investissement se situe entre 8 et 15 ans.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'entretien-menuiseries-guide',
    title: 'Entretien des menuiseries : fenêtres, portes et volets',
    metaDescription: 'Guide d\'entretien des menuiseries : nettoyage, graissage, remplacement des joints et conseils par matériau.',
    category: 'entretien',
    relatedServices: ['menuisier', 'vitrier', 'storiste'],
    sections: [
      { title: 'Entretien selon le matériau', content: `Chaque matériau de menuiserie nécessite un entretien spécifique. Les menuiseries en PVC sont les plus faciles à entretenir : un nettoyage à l'eau savonneuse deux fois par an suffit. Évitez les produits abrasifs et les solvants qui peuvent jaunir ou rayer la surface.

Les menuiseries en aluminium nécessitent un nettoyage régulier pour conserver leur aspect. En zone littorale ou urbaine polluée, nettoyez-les au moins quatre fois par an avec un produit neutre. Le thermolaquage de l'aluminium peut se ternir avec le temps ; un lustrage annuel avec un produit spécifique ravive l'éclat.

Les menuiseries en bois demandent le plus d'attention. Une lasure ou une peinture microporeuse doit être renouvelée tous les 3 à 5 ans pour les menuiseries extérieures exposées. Un ponçage léger avant l'application de la nouvelle couche assure une bonne adhérence. Le bois non traité grise et se dégrade rapidement sous l'effet des UV et de l'humidité.` },
      { title: 'Joints et quincaillerie : les points d\'usure', content: `Les joints d'étanchéité des fenêtres ont une durée de vie de 10 à 15 ans. Avec le temps, ils se rétractent, se durcissent et perdent leur souplesse. Des joints usés provoquent des infiltrations d'air et d'eau qui augmentent la facture de chauffage et peuvent endommager les menuiseries.

Le remplacement des joints est une opération simple et peu coûteuse : 5 à 15 euros par mètre linéaire de joint, pose comprise. Vérifiez l'état des joints chaque automne en passant la main le long de la fenêtre fermée : si vous sentez un courant d'air, les joints doivent être remplacés.

La quincaillerie (charnières, crémones, gâches) doit être graissée une fois par an avec un lubrifiant approprié (huile de vaseline ou spray silicone). Une quincaillerie bien entretenue garantit un fonctionnement fluide et prolonge la durée de vie des menuiseries. Vérifiez le serrage des vis de fixation et remplacez les pièces usées.` },
      { title: 'Volets et stores : entretien spécifique', content: `Les volets roulants nécessitent un nettoyage annuel des lames à l'eau savonneuse et un contrôle du bon fonctionnement du mécanisme. Lubrifiez les coulisses avec un spray silicone et vérifiez l'état des attaches de tablier. Un volet roulant motorisé doit être testé régulièrement (montée, descente, arrêt).

Les volets battants en bois doivent être repeints ou relasurés tous les 3 à 5 ans. Vérifiez les gonds et les espagnolettes, et remplacez les éléments rouillés. Pour les volets en aluminium ou PVC, un simple nettoyage annuel suffit.

Les stores bannes nécessitent un brossage de la toile au printemps et un nettoyage à l'eau tiède avec un savon doux. Ne repliez jamais un store mouillé (risque de moisissures). En fin de saison, appliquez un produit imperméabilisant sur la toile. Le mécanisme doit être lubrifié annuellement et les bras vérifiés par un professionnel.` },
      { title: 'Quand remplacer plutôt que réparer', content: `Le remplacement des menuiseries est préférable lorsque les performances thermiques sont insuffisantes (simple vitrage, profils non isolés), que le bois est pourri en profondeur, que les mécanismes sont irréparables ou que l'étanchéité ne peut plus être assurée par un simple changement de joints.

Les fenêtres de plus de 20 ans en simple vitrage ou en double vitrage de première génération méritent d'être remplacées. Les menuiseries modernes offrent des performances thermiques 2 à 3 fois supérieures et un confort acoustique nettement amélioré.

Le remplacement partiel est parfois possible : changement du vitrage en conservant le châssis, remplacement d'un ouvrant en conservant le dormant, ou ajout d'un survitrage. Ces solutions intermédiaires sont moins coûteuses qu'un remplacement complet mais offrent des gains de performance limités.` },
    ],
    faq: [
      { q: 'À quelle fréquence entretenir les menuiseries bois ?', a: 'Les menuiseries en bois exposées nécessitent une lasure ou peinture microporeuse tous les 3 à 5 ans, un contrôle annuel de l\'état des joints et de la quincaillerie, et un traitement fongicide si des traces de pourriture apparaissent.' },
      { q: 'Comment réparer un joint de fenêtre ?', a: 'Retirez l\'ancien joint avec un cutter, nettoyez la rainure, puis insérez le nouveau joint en commençant par un angle. Les joints en EPDM ou en silicone sont les plus durables. Le coût est de 5 à 15 euros par mètre linéaire si vous le faites vous-même.' },
      { q: 'Comment débloquer un volet roulant ?', a: 'Si le volet est bloqué, coupez l\'alimentation électrique, ouvrez le coffre et vérifiez que les lames ne sont pas désalignées. Nettoyez les coulisses et lubrifiez avec du spray silicone. Si le moteur est en cause, faites appel à un storiste professionnel.' },
      { q: 'Les menuiseries PVC jaunissent-elles ?', a: 'Les menuiseries PVC de qualité résistent au jaunissement grâce aux additifs anti-UV. Les modèles premier prix peuvent jaunir après 10-15 ans d\'exposition. Un nettoyage avec du bicarbonate de soude ou un produit rénovateur spécifique peut atténuer le jaunissement.' },
      { q: 'Combien coûte le remplacement d\'un double vitrage ?', a: 'Le remplacement d\'un vitrage seul (sans changer le châssis) coûte entre 100 et 300 euros par fenêtre selon les dimensions et le type de vitrage (standard, phonique, sécurit). C\'est une solution économique quand le châssis est en bon état.' },
    ],
    lastUpdated: '2026-02-01',
  },
  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE : RÉGLEMENTATION (5 guides)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'normes-electriques-nfc-15-100',
    title: 'Norme NF C 15-100 : tout comprendre en 2026',
    metaDescription: 'Décryptage de la norme NF C 15-100 : nombre de prises par pièce, protections obligatoires, mises aux normes et tarifs.',
    category: 'reglementation',
    relatedServices: ['electricien', 'domoticien', 'borne-recharge'],
    sections: [
      { title: 'Qu\'est-ce que la norme NF C 15-100 ?', content: `La norme NF C 15-100 est la référence réglementaire pour toutes les installations électriques basse tension en France. Elle définit les règles de conception, de réalisation et de vérification des installations dans les bâtiments d'habitation, les locaux professionnels et les ERP.

Cette norme est régulièrement mise à jour pour intégrer les évolutions technologiques et les retours d'expérience en matière de sécurité. La dernière révision majeure date de 2015, avec des amendements successifs. Elle impose des exigences minimales en termes de nombre de circuits, de protections et d'équipements par pièce.

La norme NF C 15-100 est d'application obligatoire pour les constructions neuves et les rénovations complètes. Pour les installations existantes, seule la mise en sécurité est exigée lors de la vente ou de la location, portant sur les six points de sécurité définis par l'arrêté du 28 septembre 2017.` },
      { title: 'Les exigences par pièce', content: `Le séjour doit comporter au minimum 5 prises de courant pour une surface inférieure à 28 m² et 7 prises au-delà, plus un point d'éclairage au plafond et une prise de communication (RJ45). Chaque chambre nécessite 3 prises minimum, un point d'éclairage et une prise de communication.

La cuisine est la pièce la plus exigeante : 6 prises dont 4 au-dessus du plan de travail, plus des circuits spécialisés pour le four, les plaques de cuisson, le lave-vaisselle et le lave-linge si celui-ci est installé en cuisine. Un point d'éclairage au plafond est obligatoire.

La salle de bain est divisée en volumes de sécurité (0 à 2) qui déterminent les équipements autorisés à chaque emplacement. Le volume 0 (intérieur de la baignoire ou du receveur) n'admet aucun appareil électrique. Le volume 1 autorise uniquement un chauffe-eau instantané TBTS. Le volume 2 accepte les luminaires et le chauffe-eau de classe I.` },
      { title: 'Les protections obligatoires', content: `Le tableau électrique doit comporter un disjoncteur de branchement (disjoncteur général), au moins deux interrupteurs différentiels 30 mA de type A et AC, et des disjoncteurs divisionnaires calibrés selon les circuits (10A pour l'éclairage, 16A pour les prises, 20A pour les circuits spécialisés, 32A pour la plaque de cuisson).

La prise de terre est obligatoire et doit assurer une résistance inférieure à 100 ohms (préconisation 50 ohms). Toutes les masses métalliques des pièces d'eau doivent être reliées à la liaison équipotentielle locale. Le parafoudre est obligatoire dans les zones AQ2 à risque de foudre.

Depuis 2016, un espace technique électrique du logement (ETEL) doit être prévu pour le tableau électrique, avec des dimensions minimales de 60 cm de large et 25 cm de profondeur. Cet espace doit être accessible et dégagé de tout obstacle.` },
      { title: 'Mise en conformité : démarches et coûts', content: `La mise aux normes complète d'un logement ancien coûte entre 5 000 et 15 000 euros selon la surface et l'état de l'installation existante. Une mise en sécurité partielle (les 6 points essentiels) se situe entre 1 500 et 4 000 euros.

Les travaux doivent être réalisés par un électricien qualifié. Pour une rénovation complète, l'attestation de conformité Consuel est obligatoire avant la mise sous tension. Le coût du contrôle Consuel est de 120 à 180 euros selon le type d'installation.

Le diagnostic électrique, obligatoire pour la vente d'un logement de plus de 15 ans, identifie les non-conformités par rapport aux 6 points de sécurité. Il est réalisé par un diagnostiqueur certifié et coûte entre 100 et 250 euros. Sa durée de validité est de 3 ans pour la vente et 6 ans pour la location.` },
    ],
    faq: [
      { q: 'La mise aux normes NF C 15-100 est-elle obligatoire pour un logement ancien ?', a: 'Non, la mise aux normes complète n\'est obligatoire que pour les constructions neuves et les rénovations totales. Pour un logement ancien, seule la mise en sécurité (6 points essentiels) est exigée lors de la vente ou de la location.' },
      { q: 'Combien de prises faut-il dans une cuisine ?', a: 'La norme NF C 15-100 impose un minimum de 6 prises dans une cuisine, dont 4 au-dessus du plan de travail. S\'ajoutent les circuits spécialisés : four, plaques de cuisson, lave-vaisselle, et éventuellement lave-linge et congélateur.' },
      { q: 'Le disjoncteur différentiel 30 mA est-il obligatoire ?', a: 'Oui, au moins deux interrupteurs différentiels 30 mA sont obligatoires : un de type A (protégeant les circuits plaques et lave-linge) et un de type AC (pour les autres circuits). Ils protègent les personnes contre les risques d\'électrocution.' },
      { q: 'Qu\'est-ce que l\'attestation Consuel ?', a: 'Le Consuel délivre une attestation de conformité électrique obligatoire pour toute nouvelle installation ou rénovation complète. Sans cette attestation, Enedis ne peut pas mettre l\'installation sous tension. Le contrôle coûte 120 à 180 euros.' },
      { q: 'Les travaux électriques partiels doivent-ils respecter la norme ?', a: 'Oui, tout circuit modifié ou ajouté doit respecter la norme NF C 15-100 en vigueur. Cependant, il n\'est pas obligatoire de mettre aux normes l\'ensemble de l\'installation lors de travaux partiels, à condition de ne pas créer de danger.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'reglementation-gaz-2026',
    title: 'Réglementation gaz en 2026 : ce qui change',
    metaDescription: 'Nouvelles obligations gaz 2026 : qualification PG, RE2020, entretien obligatoire et aides au remplacement des chaudières.',
    category: 'reglementation',
    relatedServices: ['chauffagiste', 'plombier', 'ramoneur'],
    sections: [
      { title: 'La qualification PG : obligatoire depuis 2020', content: `Depuis le 1er janvier 2020, tout professionnel intervenant sur une installation de gaz naturel ou GPL doit détenir la qualification PG (Professionnel du Gaz). Cette obligation couvre l'installation, la modification, l'entretien et le dépannage des appareils et des canalisations de gaz.

La qualification PG est délivrée par les organismes PG-GP (Professionnel du Gaz - Gaz Propane) et remplace l'ancien système d'attestation de capacité. Elle est valable pour une durée limitée et doit être renouvelée régulièrement, garantissant ainsi la mise à jour des compétences.

Faire appel à un professionnel non qualifié PG pour des travaux de gaz expose le particulier à des risques de sécurité (fuite de gaz, intoxication au CO) et à des problèmes d'assurance. En cas d'accident, l'absence de qualification du professionnel peut entraîner un refus d'indemnisation.` },
      { title: 'RE2020 et l\'avenir du gaz dans le neuf', content: `La Réglementation Environnementale 2020 (RE2020), entrée en vigueur le 1er janvier 2022, interdit de fait les chaudières gaz comme mode de chauffage principal dans les logements neufs. Le seuil d'émission de CO2 fixé à 4 kg/m²/an élimine les énergies fossiles du chauffage des constructions neuves.

Cette restriction ne concerne que le neuf. Les logements existants peuvent conserver leur chaudière gaz et même la remplacer par un modèle neuf. Cependant, les aides financières orientent fortement vers les pompes à chaleur et les systèmes hybrides (PAC + appoint gaz).

L'avenir du gaz passe par la décarbonation du réseau : injection de biogaz et, à plus long terme, d'hydrogène vert. GRDF prévoit un réseau 100 % gaz renouvelable à l'horizon 2050. En attendant, les chaudières gaz à très haute performance énergétique (THPE) restent une solution pertinente en rénovation.` },
      { title: 'Entretien et contrôle des installations gaz', content: `L'entretien annuel de la chaudière gaz est obligatoire et doit être réalisé par un professionnel qualifié PG. Il comprend la vérification du brûleur, le nettoyage du corps de chauffe, le contrôle des organes de sécurité et la mesure du taux de monoxyde de carbone.

Le certificat de conformité gaz (Qualigaz) est obligatoire pour toute nouvelle installation ou modification importante du réseau de gaz. Il atteste que l'installation respecte la réglementation en vigueur (arrêté du 2 août 1977 modifié). Le coût du contrôle Qualigaz est de 150 à 250 euros.

En copropriété, le diagnostic gaz des parties communes est obligatoire tous les 6 ans. Les colonnes montantes de gaz vétustes font l'objet d'un programme de renouvellement par GRDF. Le syndic doit veiller à la conformité des installations communes et informer les copropriétaires des travaux nécessaires.` },
      { title: 'Aides au remplacement des chaudières gaz', content: `Le remplacement d'une vieille chaudière gaz par une pompe à chaleur bénéficie d'aides substantielles en 2026 : MaPrimeRénov' (jusqu'à 5 000 euros selon les revenus), CEE (2 000 à 4 000 euros) et coup de pouce chauffage. Le reste à charge pour une PAC air-eau peut descendre à 2 000-4 000 euros.

Le remplacement par une chaudière gaz à condensation bénéficie de la prime CEE mais n'est plus éligible à MaPrimeRénov' depuis 2023. L'éco-prêt à taux zéro reste accessible pour financer le remplacement sans intérêts, jusqu'à 15 000 euros pour un mono-geste.

Les systèmes hybrides (PAC + chaudière gaz) constituent un compromis intéressant : la PAC assure le chauffage en mi-saison et la chaudière prend le relais par grand froid. Ce système bénéficie des mêmes aides qu'une PAC seule et offre une sécurité de chauffage appréciable.` },
    ],
    faq: [
      { q: 'Peut-on encore installer une chaudière gaz en 2026 ?', a: 'Oui, en rénovation, l\'installation d\'une chaudière gaz reste autorisée. Seules les constructions neuves sont concernées par l\'interdiction RE2020. En rénovation, une chaudière gaz à condensation reste une option valable, même si les aides financières favorisent les pompes à chaleur.' },
      { q: 'Comment vérifier la qualification PG d\'un chauffagiste ?', a: 'La qualification PG est vérifiable sur le site officiel pg.pro. Vous pouvez rechercher un professionnel par nom, SIRET ou localisation. Le chauffagiste doit pouvoir présenter son attestation de qualification en cours de validité.' },
      { q: 'Le détecteur de CO est-il obligatoire ?', a: 'Le détecteur de monoxyde de carbone n\'est pas encore obligatoire en France pour les particuliers, contrairement au détecteur de fumée. Il est cependant fortement recommandé dans tout logement équipé d\'un appareil à combustion (chaudière gaz, fioul, bois, cheminée).' },
      { q: 'Quel est le coût d\'un certificat Qualigaz ?', a: 'Le contrôle de conformité Qualigaz coûte entre 150 et 250 euros selon le type d\'installation. Il est obligatoire pour toute nouvelle installation gaz ou modification importante (changement de chaudière, ajout d\'un appareil). Le certificat est valable sans limite de durée.' },
      { q: 'Les chaudières fioul sont-elles interdites ?', a: 'L\'installation de nouvelles chaudières 100 % fioul est interdite depuis le 1er juillet 2022. Les chaudières fioul existantes peuvent continuer à fonctionner et être entretenues. Le remplacement par une PAC, une chaudière biomasse ou un système hybride est fortement subventionné.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'diagnostic-dpe-obligations',
    title: 'DPE 2026 : obligations et conséquences',
    metaDescription: 'Tout sur le Diagnostic de Performance Énergétique : nouvelles obligations, impact sur la location, aides à la rénovation.',
    category: 'reglementation',
    relatedServices: ['diagnostiqueur', 'isolation-thermique', 'renovation-energetique', 'chauffagiste'],
    sections: [
      { title: 'Le DPE : un diagnostic devenu central', content: `Le Diagnostic de Performance Énergétique (DPE) classe les logements de A (très performant) à G (passoire thermique) selon leur consommation d'énergie et leurs émissions de gaz à effet de serre. Depuis la réforme de 2021, le DPE est devenu opposable juridiquement, ce qui signifie que le propriétaire engage sa responsabilité sur les résultats affichés.

En 2026, les implications du DPE sont majeures pour les propriétaires bailleurs. Les logements classés G sont déjà interdits à la location depuis le 1er janvier 2025. Les logements classés F seront interdits à la location à partir du 1er janvier 2028, et les logements classés E à partir du 1er janvier 2034.

Le DPE est obligatoire pour toute vente ou location d'un logement. Sa durée de validité est de 10 ans. Les DPE réalisés avant le 1er juillet 2021 avec l'ancienne méthode doivent être refaits avant leur date d'expiration. Le coût d'un DPE se situe entre 100 et 250 euros.` },
      { title: 'Impact sur la location et la valeur du bien', content: `L'interdiction de location des passoires thermiques a un impact direct sur la valeur des biens immobiliers. Un logement classé F ou G subit une décote de 5 à 15 % par rapport à un logement classé D ou E dans le même secteur. À l'inverse, un logement classé A ou B bénéficie d'une surcote de 5 à 10 %.

Pour les propriétaires bailleurs, la mise en conformité est urgente. Les travaux de rénovation énergétique nécessaires pour passer de G à E ou D coûtent en moyenne 15 000 à 40 000 euros, mais les aides (MaPrimeRénov', CEE, éco-PTZ) peuvent couvrir 40 à 75 % du montant selon les revenus.

L'audit énergétique est obligatoire depuis 2023 pour la vente d'un logement classé F ou G, et depuis 2025 pour les logements classés E. Cet audit, plus détaillé que le DPE, propose des scénarios de travaux chiffrés et les gains de performance attendus. Son coût se situe entre 500 et 1 000 euros.` },
      { title: 'Les travaux pour améliorer son DPE', content: `L'isolation thermique est le levier le plus efficace pour améliorer le DPE. L'isolation des combles permet de gagner 1 à 2 classes (coût : 20 à 50 euros le m²). L'isolation des murs par l'extérieur fait gagner 1 à 3 classes (coût : 80 à 150 euros le m²). Le remplacement des fenêtres apporte un gain de 0,5 à 1 classe (coût : 300 à 800 euros par fenêtre).

Le remplacement du système de chauffage est le deuxième levier majeur. Passer d'une chaudière gaz ancienne à une pompe à chaleur fait gagner 1 à 2 classes. L'installation d'une ventilation mécanique contrôlée (VMC) double flux améliore le DPE tout en garantissant la qualité de l'air intérieur.

Un parcours de rénovation globale (isolation + chauffage + ventilation) est la stratégie la plus efficace pour sauter plusieurs classes. MaPrimeRénov' Rénovation globale offre un forfait de 5 000 à 10 000 euros pour les rénovations qui atteignent un saut d'au moins 2 classes énergétiques.` },
      { title: 'Choisir son diagnostiqueur DPE', content: `Le diagnostiqueur DPE doit être certifié par un organisme accrédité par le Cofrac (Comité français d'accréditation). La certification est nominative, valable 7 ans et doit être renouvelée par un examen. Vérifiez la certification de votre diagnostiqueur sur le site du ministère de la Transition écologique.

Le diagnostiqueur doit être indépendant et impartial : il ne peut pas réaliser les travaux de rénovation qu'il recommande. Cette indépendance garantit l'objectivité du diagnostic. Méfiez-vous des entreprises de rénovation qui proposent un DPE « offert » en échange d'un contrat de travaux.

Depuis la réforme de 2021, la méthode de calcul 3CL-DPE est la seule autorisée. Elle prend en compte les caractéristiques du bâti, des équipements et la consommation conventionnelle d'énergie. Le diagnostiqueur doit visiter le logement et collecter des données précises sur l'isolation, le chauffage, la ventilation et la production d'eau chaude.` },
    ],
    faq: [
      { q: 'Mon logement est classé G, puis-je encore le louer ?', a: 'Non, depuis le 1er janvier 2025, les logements classés G ne peuvent plus être mis en location. Les baux en cours restent valides mais ne peuvent pas être renouvelés. Vous devez réaliser des travaux pour atteindre au minimum la classe F (puis E à partir de 2028) avant de relouer.' },
      { q: 'Combien coûte un DPE ?', a: 'Un DPE coûte entre 100 et 250 euros selon la taille du logement et la région. Il est valable 10 ans. L\'audit énergétique, plus complet, coûte 500 à 1 000 euros et est obligatoire pour la vente des logements classés E, F ou G.' },
      { q: 'Le DPE est-il opposable ?', a: 'Oui, depuis la réforme du 1er juillet 2021, le DPE est juridiquement opposable. L\'acquéreur ou le locataire peut se retourner contre le vendeur ou le bailleur si le DPE s\'avère erroné, et engager la responsabilité du diagnostiqueur.' },
      { q: 'Comment passer de F à D au DPE ?', a: 'Le passage de F à D nécessite généralement un bouquet de travaux : isolation des combles et/ou des murs, remplacement des fenêtres et modernisation du chauffage. Budget moyen : 15 000 à 30 000 euros avant aides. Un audit énergétique permet d\'identifier les travaux les plus efficaces.' },
      { q: 'Les aides couvrent-elles le coût des travaux DPE ?', a: 'Les aides (MaPrimeRénov\', CEE, éco-PTZ) peuvent couvrir 40 à 75 % du coût des travaux selon vos revenus. Pour les ménages très modestes, le reste à charge peut être inférieur à 10 %. Un conseiller France Rénov\' peut vous aider à monter le dossier gratuitement.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'accessibilite-pmr-logement',
    title: 'Accessibilité PMR du logement : normes et travaux',
    metaDescription: 'Guide de l\'accessibilité PMR : normes, travaux d\'adaptation du logement, aides financières et artisans qualifiés.',
    category: 'reglementation',
    relatedServices: ['plombier', 'electricien', 'macon', 'carreleur', 'salle-de-bain'],
    sections: [
      { title: 'Les normes d\'accessibilité en vigueur', content: `L'accessibilité des logements aux personnes à mobilité réduite (PMR) est encadrée par la loi du 11 février 2005 et ses décrets d'application. Les constructions neuves et les parties communes des immeubles existants doivent respecter des normes précises en matière de largeur de passage, de hauteur d'équipements et d'accès aux différentes pièces.

Pour les logements neufs, la réglementation impose des caractéristiques minimales : largeur des portes de 90 cm minimum, absence de ressaut supérieur à 2 cm, une salle d'eau accessible au rez-de-chaussée, et un cheminement praticable depuis l'extérieur jusqu'à l'intérieur du logement.

Pour les logements existants, l'adaptation n'est pas obligatoire mais peut être financée par des aides spécifiques. L'objectif est de permettre à la personne de vivre le plus autonomement possible dans son logement, en adaptant les équipements à ses besoins spécifiques.` },
      { title: 'Les travaux d\'adaptation courants', content: `La salle de bain est souvent la première pièce à adapter : remplacement de la baignoire par une douche à l'italienne (2 000 à 5 000 euros), installation de barres d'appui (100 à 300 euros pièce), rehausseur de WC (50 à 200 euros) et siège de douche rabattable (150 à 500 euros).

L'accès au logement peut nécessiter l'installation d'une rampe d'accès (500 à 3 000 euros), l'élargissement des portes (300 à 800 euros par porte) ou l'installation d'un monte-escalier (3 000 à 8 000 euros) ou d'un ascenseur privatif (15 000 à 30 000 euros).

À l'intérieur, les adaptations courantes comprennent : l'abaissement des prises et interrupteurs, l'installation d'un éclairage automatique, la motorisation des volets roulants, et l'adaptation de la cuisine (plan de travail réglable en hauteur, évier à siphon déporté).` },
      { title: 'Aides financières pour l\'adaptation', content: `MaPrimeAdapt', lancée en 2024, est la principale aide pour l'adaptation du logement au vieillissement et au handicap. Elle peut couvrir 50 à 70 % du coût des travaux selon les revenus, dans la limite de 22 000 euros de travaux. Les bénéficiaires sont les personnes de plus de 70 ans ou en situation de handicap.

L'ANAH (Agence Nationale de l'Habitat) propose des aides complémentaires pour les travaux d'adaptation. Les caisses de retraite, les mutuelles et les conseils départementaux peuvent également participer au financement. La PCH (Prestation de Compensation du Handicap) couvre les aménagements liés au handicap.

Un ergothérapeute peut évaluer les besoins d'adaptation et préconiser les travaux les plus pertinents. Cette expertise (200 à 500 euros, souvent prise en charge) permet d'optimiser le budget en ciblant les aménagements les plus utiles au quotidien.` },
      { title: 'Choisir un artisan spécialisé PMR', content: `L'adaptation du logement nécessite des artisans sensibilisés aux problématiques PMR. Certains plombiers, électriciens et maçons ont suivi des formations spécifiques et possèdent une expérience dans l'aménagement de logements pour personnes handicapées ou âgées.

Le label Handibat, délivré par la CAPEB, identifie les artisans formés à l'accessibilité et à l'adaptation du logement. Le label Silverbat est spécifique à l'adaptation au vieillissement. Ces labels garantissent une formation spécifique et une sensibilité aux besoins des personnes à mobilité réduite.

Un coordonnateur de travaux (ergothérapeute, architecte spécialisé) est recommandé pour les projets d'adaptation complexes. Il assure la cohérence des travaux entre les différents corps de métier et vérifie que les aménagements répondent effectivement aux besoins de la personne.` },
    ],
    faq: [
      { q: 'Combien coûte l\'adaptation d\'une salle de bain PMR ?', a: 'L\'adaptation complète d\'une salle de bain (douche italienne, barres d\'appui, WC rehaussé, revêtement antidérapant) coûte entre 4 000 et 10 000 euros. Avec MaPrimeAdapt\', le reste à charge peut descendre à 1 500-4 000 euros selon les revenus.' },
      { q: 'MaPrimeAdapt\' est-elle cumulable avec d\'autres aides ?', a: 'Oui, MaPrimeAdapt\' est cumulable avec les aides des caisses de retraite, des mutuelles et de certaines collectivités locales. Elle n\'est pas cumulable avec MaPrimeRénov\' pour les mêmes travaux. Un conseiller France Rénov\' peut optimiser le plan de financement.' },
      { q: 'Faut-il un diagnostic avant les travaux d\'adaptation ?', a: 'Un diagnostic d\'accessibilité par un ergothérapeute ou un architecte spécialisé est fortement recommandé. Il identifie les besoins prioritaires et optimise le budget. Ce diagnostic coûte 200 à 500 euros et est souvent pris en charge par les aides.' },
      { q: 'Un monte-escalier est-il éligible aux aides ?', a: 'Oui, l\'installation d\'un monte-escalier est éligible à MaPrimeAdapt\' et au crédit d\'impôt de 25 % pour les dépenses d\'aménagement du logement des personnes âgées ou handicapées. Le coût d\'un monte-escalier se situe entre 3 000 et 8 000 euros.' },
      { q: 'L\'adaptation PMR valorise-t-elle le bien immobilier ?', a: 'Oui, un logement adapté PMR est un argument de vente dans un marché qui vieillit. Les aménagements comme la douche italienne, l\'ascenseur privatif ou la domotique sont recherchés par un large public, au-delà des seules personnes à mobilité réduite.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'aides-renovation-energetique-2026',
    title: 'Aides à la rénovation énergétique 2026 : le guide',
    metaDescription: 'Toutes les aides à la rénovation énergétique en 2026 : MaPrimeRénov\', CEE, éco-PTZ, TVA réduite et aides locales.',
    category: 'reglementation',
    relatedServices: ['renovation-energetique', 'isolation-thermique', 'chauffagiste', 'pompe-a-chaleur', 'panneaux-solaires'],
    sections: [
      { title: 'MaPrimeRénov\' en 2026 : montants et conditions', content: `MaPrimeRénov' est la principale aide de l'État pour la rénovation énergétique des logements. En 2026, le dispositif distingue deux parcours : MaPrimeRénov' Mono-geste (un seul type de travaux) et MaPrimeRénov' Rénovation globale (bouquet de travaux visant un saut d'au moins 2 classes DPE).

Les montants varient selon les revenus du ménage (4 catégories : très modestes, modestes, intermédiaires, supérieurs) et le type de travaux. Pour une pompe à chaleur air-eau, l'aide varie de 2 000 à 5 000 euros. Pour une isolation des murs par l'extérieur, de 40 à 75 euros le m². Pour la rénovation globale, un forfait de 5 000 à 10 000 euros.

Les conditions d'éligibilité sont : être propriétaire du logement (occupant ou bailleur), que le logement ait plus de 15 ans, que les travaux soient réalisés par un artisan RGE, et que le logement soit une résidence principale (ou un logement loué). Les démarches se font en ligne sur maprimerenov.gouv.fr.` },
      { title: 'Les Certificats d\'Économies d\'Énergie (CEE)', content: `Les CEE sont financés par les fournisseurs d'énergie (EDF, Engie, TotalEnergies) qui ont l'obligation de promouvoir les économies d'énergie. Les primes CEE sont cumulables avec MaPrimeRénov' et peuvent atteindre 2 000 à 5 000 euros selon les travaux.

Le Coup de pouce chauffage est une prime CEE bonifiée pour le remplacement d'une chaudière gaz ou fioul par une PAC ou une chaudière biomasse. Le montant varie de 2 500 à 4 000 euros selon les revenus. Le Coup de pouce isolation finance l'isolation des combles et planchers bas.

Pour bénéficier des CEE, les travaux doivent être réalisés par un professionnel RGE et la demande doit être faite avant la signature du devis. Comparez les offres CEE de plusieurs fournisseurs car les montants peuvent varier significativement pour les mêmes travaux.` },
      { title: 'Éco-prêt à taux zéro et TVA réduite', content: `L'éco-prêt à taux zéro (éco-PTZ) permet de financer jusqu'à 50 000 euros de travaux de rénovation énergétique sans intérêts. La durée de remboursement peut aller jusqu'à 20 ans. Il est accessible sans conditions de ressources et cumulable avec toutes les autres aides.

Les travaux de rénovation énergétique bénéficient d'un taux de TVA réduit à 5,5 % (au lieu de 20 %). Ce taux s'applique aux travaux d'isolation, de remplacement de chauffage, d'installation de fenêtres performantes et de ventilation mécanique contrôlée. Les travaux d'entretien et d'amélioration classiques bénéficient d'une TVA à 10 %.

Pour bénéficier de l'éco-PTZ, les travaux doivent être réalisés par un artisan RGE dans un logement achevé depuis plus de 2 ans. Le prêt est accordé par les banques partenaires sur présentation des devis. Il peut financer un mono-geste ou un bouquet de travaux.` },
      { title: 'Optimiser le financement de sa rénovation', content: `La clé d'un financement optimisé est de combiner toutes les aides disponibles. Un exemple concret : pour l'installation d'une PAC air-eau à 12 000 euros, un ménage modeste peut obtenir 5 000 euros de MaPrimeRénov', 3 000 euros de CEE et financer le solde de 4 000 euros par un éco-PTZ, soit un reste à charge de 0 euro en trésorerie.

Les conseillers France Rénov' (ex-FAIRE) accompagnent gratuitement les particuliers dans leur projet de rénovation. Ils réalisent un bilan énergétique simplifié, proposent un parcours de travaux adapté et aident au montage des dossiers de financement. Prenez rendez-vous sur france-renov.gouv.fr.

Certaines collectivités locales (régions, départements, communes) proposent des aides complémentaires. Par exemple, la prime énergie de la Région Île-de-France ou le chèque énergie de certaines métropoles. Renseignez-vous auprès de votre conseiller France Rénov' pour identifier toutes les aides locales disponibles.` },
    ],
    faq: [
      { q: 'MaPrimeRénov\' et CEE sont-ils cumulables ?', a: 'Oui, MaPrimeRénov\' et les CEE sont cumulables. Cependant, le cumul des aides ne peut pas dépasser 90 % du coût des travaux pour les ménages très modestes et 75 % pour les autres ménages. L\'éco-PTZ est également cumulable avec ces deux dispositifs.' },
      { q: 'Faut-il un artisan RGE pour bénéficier des aides ?', a: 'Oui, la certification RGE de l\'artisan est une condition indispensable pour bénéficier de MaPrimeRénov\', des CEE et de l\'éco-PTZ. Vérifiez la validité du label sur france-renov.gouv.fr avant de signer le devis.' },
      { q: 'Peut-on bénéficier des aides en tant que bailleur ?', a: 'Oui, les propriétaires bailleurs sont éligibles à MaPrimeRénov\' et aux CEE. Le logement doit être loué comme résidence principale du locataire pendant au moins 6 ans après les travaux. Les montants d\'aide sont identiques à ceux des propriétaires occupants.' },
      { q: 'Comment obtenir l\'éco-PTZ ?', a: 'L\'éco-PTZ est accordé par les banques partenaires (la plupart des grandes banques). Présentez les devis des travaux et l\'attestation RGE de l\'artisan. Le prêt est accordé sans conditions de ressources, dans la limite de 50 000 euros sur 20 ans maximum.' },
      { q: 'Les travaux doivent-ils être réalisés par une seule entreprise ?', a: 'Non, vous pouvez faire appel à plusieurs artisans RGE pour les différents postes de travaux. Chaque artisan doit être RGE pour sa spécialité. Pour MaPrimeRénov\' Rénovation globale, un accompagnateur Rénov\' (Mon Accompagnateur Rénov\') est obligatoire.' },
    ],
    lastUpdated: '2026-02-01',
  },
  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE : ÉCONOMISER (5 guides)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'reduire-facture-chauffage',
    title: 'Réduire sa facture de chauffage : 10 solutions efficaces',
    metaDescription: 'Guide pratique pour réduire votre facture de chauffage : isolation, réglage, équipements performants et gestes du quotidien.',
    category: 'economiser',
    relatedServices: ['chauffagiste', 'isolation-thermique', 'pompe-a-chaleur', 'renovation-energetique'],
    sections: [
      { title: 'Optimiser le réglage de son chauffage', content: `La première source d'économie ne coûte rien : baisser la température de 1 degré réduit la facture de 7 %. L'ADEME recommande 19 degrés dans les pièces de vie et 16 degrés dans les chambres. Un thermostat programmable ajuste automatiquement la température selon vos horaires de présence.

Les robinets thermostatiques sur les radiateurs permettent de régler la température pièce par pièce. Un bureau orienté sud n'a pas besoin du même chauffage qu'une chambre au nord. L'investissement (30 à 80 euros par robinet) est rentabilisé en une à deux saisons de chauffe.

La purge des radiateurs à eau chaude doit être réalisée chaque automne. Un radiateur mal purgé contient des bulles d'air qui réduisent sa performance de 10 à 20 %. L'opération est simple : ouvrez la vis de purge jusqu'à ce que l'eau s'écoule régulièrement, puis refermez.` },
      { title: 'Isoler pour réduire les déperditions', content: `L'isolation est le levier le plus efficace pour réduire durablement la facture de chauffage. Les toitures et combles non isolés représentent 25 à 30 % des pertes de chaleur, les murs 20 à 25 %, les fenêtres 10 à 15 % et les planchers bas 7 à 10 %.

L'isolation des combles perdus est le premier chantier à réaliser : un gain immédiat de 20 à 25 % sur la facture pour un coût de 20 à 50 euros le m². En rénovation, l'isolation des murs par l'intérieur (30 à 60 euros le m²) ou par l'extérieur (80 à 150 euros le m²) offre un retour sur investissement en 5 à 10 ans.

Le remplacement des fenêtres simple vitrage par du double vitrage performant réduit les pertes par les vitrages de 40 à 50 %. En attendant le remplacement, des solutions provisoires existent : joints adhésifs, film isolant, rideaux thermiques et boudins de porte.` },
      { title: 'Choisir un équipement de chauffage performant', content: `Le remplacement d'une vieille chaudière (rendement 70-80 %) par une chaudière à condensation (rendement 95-110 %) réduit la consommation de 15 à 30 %. Le passage à une pompe à chaleur divise la facture de chauffage par 3 à 4 grâce à son coefficient de performance.

Le poêle à granulés est une alternative économique pour le chauffage d'appoint ou principal des maisons bien isolées. Le coût du combustible (granulés de bois) est parmi les plus bas du marché énergétique. Un poêle à granulés de 10 kW coûte entre 2 000 et 5 000 euros pose comprise.

La domotique et les thermostats connectés permettent de piloter finement le chauffage à distance. Un thermostat connecté avec programmation intelligente réduit la consommation de 10 à 25 % en adaptant le chauffage aux habitudes de vie et aux conditions météo en temps réel.` },
      { title: 'Les gestes du quotidien qui comptent', content: `Fermez les volets et rideaux la nuit pour réduire les pertes de chaleur par les fenêtres de 30 à 50 %. À l'inverse, ouvrez les volets des fenêtres exposées au sud en journée pour bénéficier des apports solaires gratuits.

Aérez votre logement 5 à 10 minutes par jour en ouvrant grand les fenêtres, plutôt que de laisser une fenêtre entrebâillée en permanence. L'aération rapide renouvelle l'air sans refroidir les murs et les meubles, qui restituent leur chaleur une fois la fenêtre refermée.

Ne placez pas de meubles devant les radiateurs et ne couvrez pas les convecteurs. Un radiateur obstrué perd jusqu'à 40 % de son efficacité. Un réflecteur de chaleur (feuille aluminium) placé derrière un radiateur situé sur un mur extérieur réduit les pertes de 5 à 10 %.` },
    ],
    faq: [
      { q: 'Combien peut-on économiser en baissant le chauffage de 1 degré ?', a: 'Baisser la température de 1 degré réduit la facture de chauffage d\'environ 7 %. Pour un foyer dépensant 1 500 euros par an de chauffage, cela représente une économie de 105 euros par an. Avec un thermostat programmable, l\'économie atteint 15 à 25 %.' },
      { q: 'L\'isolation des combles est-elle le premier chantier à faire ?', a: 'Oui, l\'isolation des combles offre le meilleur rapport coût/économie. Pour un coût de 1 500 à 3 000 euros (maison de 80 m²), vous économisez 20 à 25 % sur votre facture de chauffage. Le retour sur investissement est de 2 à 4 ans seulement.' },
      { q: 'Un thermostat connecté fait-il vraiment économiser ?', a: 'Oui, un thermostat connecté avec programmation intelligente permet de réduire la consommation de 10 à 25 %. L\'investissement (150 à 300 euros) est rentabilisé en moins d\'un an. Les modèles les plus avancés apprennent vos habitudes et s\'adaptent à la météo.' },
      { q: 'Faut-il éteindre le chauffage quand on s\'absente ?', a: 'Non, il ne faut pas éteindre complètement le chauffage. Baissez le thermostat à 14-16 degrés pour une absence de quelques heures et à 12 degrés pour une absence prolongée. Relancer un chauffage à fond consomme plus que maintenir une température de base.' },
      { q: 'Le chauffage au bois est-il vraiment économique ?', a: 'Oui, le bois est l\'énergie de chauffage la moins chère au kWh (4 à 6 centimes contre 10 à 15 centimes pour le gaz et 15 à 20 centimes pour l\'électricité). Un poêle à granulés permet de chauffer une maison de 100 m² pour 500 à 800 euros par an.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'isolation-thermique-guide-complet',
    title: 'Isolation thermique : le guide complet 2026',
    metaDescription: 'Guide complet de l\'isolation thermique : matériaux, techniques, prix au m², aides financières et retour sur investissement.',
    category: 'economiser',
    relatedServices: ['isolation-thermique', 'renovation-energetique', 'facadier', 'couvreur', 'menuisier'],
    sections: [
      { title: 'Les différentes zones à isoler', content: `L'isolation thermique d'un logement doit être pensée globalement. Les principales zones de déperdition sont, par ordre d'importance : la toiture (25-30 % des pertes), les murs (20-25 %), les fenêtres (10-15 %), les planchers bas (7-10 %) et les ponts thermiques (5-10 %).

L'isolation de la toiture peut se faire par l'intérieur (sous les rampants ou sur le plancher des combles perdus) ou par l'extérieur (sarking). L'isolation des murs se réalise par l'intérieur (ITI) ou par l'extérieur (ITE). Chaque technique a ses avantages et ses limites en termes de coût, de performance et d'impact sur l'espace habitable.

Une approche globale est préférable à des interventions ponctuelles. Un audit énergétique (500 à 1 000 euros) permet d'identifier les zones de déperdition prioritaires et de planifier les travaux dans l'ordre le plus efficace. MaPrimeRénov' Rénovation globale encourage cette approche avec des forfaits bonifiés.` },
      { title: 'Les matériaux isolants : comparatif', content: `Les laines minérales (laine de verre, laine de roche) sont les isolants les plus utilisés en France. Elles offrent un bon rapport performance/prix (5 à 15 euros le m² pour une résistance thermique R=5) et sont incombustibles. Leur durée de vie est de 30 à 50 ans.

Les isolants biosourcés (ouate de cellulose, fibre de bois, laine de chanvre, liège) séduisent par leur faible impact environnemental et leur excellent confort d'été (forte inertie thermique). Ils sont 20 à 50 % plus chers que les laines minérales mais offrent un meilleur déphasage thermique.

Les isolants synthétiques (polystyrène expansé, polyuréthane) offrent la meilleure performance pour la plus faible épaisseur, ce qui est un avantage quand l'espace est limité. Le polyuréthane projeté est particulièrement efficace pour l'isolation des sols et des combles difficiles d'accès.` },
      { title: 'Prix et retour sur investissement', content: `L'isolation des combles perdus coûte 20 à 50 euros le m² (soufflage de laine minérale). L'isolation des combles aménagés revient à 40 à 80 euros le m² (panneaux sous rampants). L'ITE coûte 80 à 150 euros le m², l'ITI 30 à 60 euros le m². L'isolation du plancher bas se situe entre 25 et 50 euros le m².

Le retour sur investissement varie selon le poste : 2 à 4 ans pour les combles perdus, 5 à 8 ans pour l'ITI, 8 à 15 ans pour l'ITE. Ces durées sont calculées hors aides financières. Avec MaPrimeRénov' et les CEE, le retour sur investissement est divisé par 2 environ.

Pour une maison de 100 m² non isolée (classe F ou G), une isolation complète (combles + murs + fenêtres) coûte entre 25 000 et 45 000 euros avant aides. Les aides peuvent couvrir 40 à 70 % du montant, ramenant le reste à charge à 8 000-20 000 euros.` },
      { title: 'Les erreurs à éviter en isolation', content: `La première erreur est d'isoler sans traiter la ventilation. Une maison bien isolée mais mal ventilée accumule l'humidité, provoquant condensation, moisissures et dégradation des matériaux. L'installation d'une VMC (ventilation mécanique contrôlée) est indispensable lors de tout projet d'isolation.

L'erreur fréquente en ITE est de négliger le traitement des ponts thermiques au niveau des balcons, des appuis de fenêtre et des liaisons mur-plancher. Ces ponts thermiques non traités peuvent annuler jusqu'à 30 % du gain de l'isolation, créant des points froids propices à la condensation.

Ne sous-dimensionnez pas l'épaisseur d'isolant. La résistance thermique minimale recommandée est de R=7 pour les combles, R=4 pour les murs et R=3 pour les planchers. Isoler en dessous de ces valeurs limite le gain énergétique et vous prive des aides financières qui exigent des performances minimales.` },
    ],
    faq: [
      { q: 'Par où commencer l\'isolation de sa maison ?', a: 'Commencez par l\'isolation des combles (25-30 % des pertes de chaleur pour un coût modéré), puis les murs (20-25 % des pertes) et enfin les fenêtres et planchers. Un audit énergétique permet de hiérarchiser les travaux selon leur rapport coût/efficacité.' },
      { q: 'ITE ou ITI : que choisir ?', a: 'L\'ITE (isolation par l\'extérieur) est plus performante car elle traite les ponts thermiques et ne réduit pas la surface habitable. Mais elle est 2 à 3 fois plus chère que l\'ITI. L\'ITI est recommandée quand l\'ITE est impossible (façade classée, mitoyenneté) ou quand le budget est limité.' },
      { q: 'La ouate de cellulose est-elle un bon isolant ?', a: 'Oui, la ouate de cellulose offre d\'excellentes performances thermiques (lambda 0,038-0,042) et un très bon confort d\'été grâce à sa forte inertie. Elle est écologique (papier recyclé) et 10 à 20 % moins chère que la fibre de bois. Elle est idéale pour l\'isolation des combles par soufflage.' },
      { q: 'L\'isolation fait-elle gagner des classes DPE ?', a: 'Oui, l\'isolation des combles fait gagner 1 à 2 classes, l\'isolation des murs 1 à 2 classes, et le remplacement des fenêtres 0,5 à 1 classe. Une isolation complète (combles + murs + fenêtres) peut faire passer un logement de G à D ou C.' },
      { q: 'Peut-on isoler en été ?', a: 'Oui, l\'isolation peut être réalisée toute l\'année. L\'été est même la période idéale pour les travaux d\'ITE car les enduits de façade sèchent mieux. Planifiez les travaux 2 à 3 mois à l\'avance car les artisans RGE sont très demandés.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'comparer-devis-artisans',
    title: 'Comment comparer les devis d\'artisans efficacement',
    metaDescription: 'Méthode pour comparer les devis d\'artisans : mentions obligatoires, pièges à éviter, négociation et checklist complète.',
    category: 'economiser',
    relatedServices: ['plombier', 'electricien', 'macon', 'peintre-en-batiment', 'couvreur'],
    sections: [
      { title: 'Les mentions obligatoires d\'un devis', content: `Un devis d'artisan est un document contractuel qui engage les deux parties une fois signé. La loi impose des mentions obligatoires : identification de l'entreprise (raison sociale, SIRET, adresse), date du devis et sa durée de validité, description détaillée de chaque prestation, prix unitaires et total HT et TTC, taux de TVA applicable, conditions de paiement et délai d'exécution.

Le devis doit distinguer clairement le coût de la main-d'œuvre, le prix des fournitures et les frais annexes (déplacement, échafaudage, location de matériel). Cette ventilation est essentielle pour comparer les offres et vérifier que les artisans ont bien compris la même prestation.

Un artisan sérieux prend le temps de visiter le chantier avant d'établir son devis. Un devis réalisé par téléphone ou sur photo présente un risque élevé de surcoûts en cours de chantier. Si un artisan refuse de se déplacer pour établir un devis, passez votre chemin.` },
      { title: 'La méthode pour comparer efficacement', content: `Demandez au minimum trois devis pour le même projet. Rédigez un cahier des charges précis décrivant les travaux souhaités, les matériaux envisagés et les contraintes éventuelles. Transmettez ce même document à chaque artisan pour obtenir des devis comparables.

Créez un tableau comparatif avec les postes principaux en lignes et les artisans en colonnes. Comparez poste par poste plutôt que le total global. Un devis moins cher au total peut cacher des économies sur la qualité des matériaux ou l'étendue des travaux.

Vérifiez les qualifications et assurances de chaque artisan avant de comparer les prix. Un artisan moins cher mais sans garantie décennale vous expose à des risques financiers considérables en cas de malfaçon. Le critère du prix ne doit intervenir qu'entre des offres de qualité comparable.` },
      { title: 'Décrypter les différences de prix', content: `Un écart de prix de 10 à 20 % entre des devis comparables est normal et s'explique par les différences de charges, d'expérience et de marges entre les entreprises. Au-delà de 30 % d'écart, cherchez l'explication : matériaux différents, prestations exclues ou incluses, ou qualité d'exécution disparate.

Le matériel représente souvent 30 à 50 % du coût total. Vérifiez les marques et références proposées par chaque artisan. Un devis utilisant du matériel de grande marque (Grohe, Legrand, Weber) sera naturellement plus cher qu'un devis avec du matériel sans marque.

Les frais annexes peuvent faire varier significativement le total : évacuation des déchets, protection du mobilier, nettoyage de fin de chantier, location d'échafaudage. Demandez que ces postes soient systématiquement inclus dans le devis pour éviter les surprises.` },
      { title: 'Négocier sans dévaloriser le travail', content: `La négociation est courante et acceptée dans l'artisanat du bâtiment, à condition de rester respectueux. Un artisan peut accorder une remise de 5 à 10 % sur un chantier important, surtout en période creuse (janvier-mars). Mentionnez les devis concurrents comme levier de négociation, sans bluffer.

Plutôt que de négocier uniquement sur le prix, proposez des alternatives : fourniture des matériaux par vous-même (attention, cela limite la garantie), regroupement de plusieurs travaux, planification en période creuse ou paiement anticipé contre remise.

Ne négociez jamais en dessous du seuil de rentabilité de l'artisan. Un artisan contraint d'accepter un prix trop bas compensera en réduisant la qualité des matériaux ou en bâclant l'exécution. Un travail bien fait à un prix juste est toujours préférable à un travail au rabais.` },
    ],
    faq: [
      { q: 'Combien de devis faut-il demander ?', a: 'Demandez au minimum 3 devis pour tout projet de travaux. Pour les chantiers importants (plus de 10 000 euros), 4 à 5 devis permettent d\'avoir une vision plus précise du marché. Au-delà de 5, la comparaison devient complexe sans gain significatif.' },
      { q: 'Un devis est-il payant ?', a: 'Le devis est généralement gratuit pour les artisans du bâtiment. Certains professionnels (architectes, bureaux d\'études) peuvent facturer l\'étude préalable, mais cela doit être annoncé à l\'avance. Un artisan qui facture un devis simple sans prévenir n\'est pas fiable.' },
      { q: 'Peut-on annuler un devis signé ?', a: 'Si le devis a été signé à domicile (suite à un démarchage), vous bénéficiez d\'un délai de rétractation de 14 jours. Si vous avez sollicité l\'artisan vous-même, le devis signé est un contrat ferme. La résiliation n\'est possible qu\'avec l\'accord de l\'artisan, moyennant éventuellement des indemnités.' },
      { q: 'Le devis le moins cher est-il le meilleur ?', a: 'Non, le devis le moins cher n\'est pas nécessairement le meilleur. Un prix anormalement bas peut cacher des matériaux de qualité inférieure, des prestations exclues ou l\'absence d\'assurances. Comparez les devis poste par poste et vérifiez les qualifications avant de choisir.' },
      { q: 'Quelle est la durée de validité d\'un devis ?', a: 'La durée de validité d\'un devis est celle indiquée sur le document (généralement 1 à 3 mois). Passé ce délai, l\'artisan n\'est plus tenu de maintenir les prix. Si aucune durée n\'est mentionnée, le devis est considéré comme valable pendant un délai raisonnable (environ 3 mois).' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'negocier-travaux-renovation',
    title: 'Négocier ses travaux de rénovation : astuces et méthodes',
    metaDescription: 'Techniques pour négocier vos travaux de rénovation : timing, regroupement, fournitures et astuces pour économiser 10 à 20 %.',
    category: 'economiser',
    relatedServices: ['macon', 'peintre-en-batiment', 'menuisier', 'plombier', 'electricien'],
    sections: [
      { title: 'Choisir le bon moment pour négocier', content: `Le timing est un levier de négociation majeur dans le bâtiment. La période de janvier à mars est traditionnellement creuse pour les artisans, qui sont plus enclins à accorder des remises pour remplir leur carnet de commandes. À l'inverse, la période avril-octobre est chargée et les prix sont fermes.

Si vos travaux ne sont pas urgents, planifiez-les en basse saison. Un peintre en février ou un couvreur en mars sera plus disponible et plus flexible sur les tarifs qu'en plein été. L'économie peut atteindre 10 à 15 % par rapport à la haute saison.

La flexibilité sur les dates est un atout considérable. Un artisan qui peut intercaler votre chantier entre deux projets importants optimise son planning et peut vous faire bénéficier de cette souplesse sous forme de remise.` },
      { title: 'Regrouper les travaux pour réduire les coûts', content: `Le regroupement de plusieurs postes de travaux auprès d'un même artisan ou d'une même entreprise permet d'obtenir des remises de volume. Un plombier qui refait la salle de bain et la cuisine en même temps proposera un tarif global inférieur à la somme de deux interventions séparées.

L'entreprise générale de rénovation coordonne les différents corps de métier et négocie les prix pour vous. Si la marge de l'entreprise générale (15 à 25 %) vous semble élevée, comparez avec le coût de coordination que vous supporteriez en gérant vous-même les artisans (temps, erreurs, retards).

Le groupement de commandes entre voisins ou copropriétaires est une stratégie efficace pour les travaux communs : ravalement de façade, isolation de toiture, remplacement de chaudières. Un artisan qui réalise 5 chantiers dans le même immeuble réduit ses frais de déplacement et peut accorder une remise collective.` },
      { title: 'La fourniture des matériaux : économie ou risque ?', content: `Fournir vous-même les matériaux peut permettre d'économiser 10 à 20 % sur le poste fournitures, en achetant dans les enseignes professionnelles ou en profitant de promotions. Cependant, cette économie s'accompagne de risques et de contraintes.

Si vous fournissez les matériaux, l'artisan n'est pas responsable de leur qualité ni de leur adéquation avec les travaux. Sa garantie est limitée à la main-d'œuvre. En cas de problème lié au matériau, vous ne pourrez pas invoquer la garantie décennale du professionnel.

Le meilleur compromis est souvent de négocier les prix des fournitures avec l'artisan. Demandez-lui de vous indiquer les références exactes et comparez avec les prix en magasin. Certains artisans acceptent de facturer les fournitures au prix coûtant s'ils sont assurés d'obtenir le chantier.` },
      { title: 'Les aides financières comme levier d\'économie', content: `Les aides à la rénovation énergétique (MaPrimeRénov', CEE, éco-PTZ) peuvent réduire le coût de vos travaux de 40 à 70 %. Intégrez ces aides dans votre budget dès la phase de devis. Un artisan qui connaît les dispositifs d'aide vous orientera vers les travaux éligibles.

Le taux de TVA réduit (5,5 % pour la rénovation énergétique, 10 % pour les travaux d'entretien et d'amélioration) est un avantage automatique pour les logements de plus de 2 ans. Vérifiez que l'artisan applique bien le taux réduit sur son devis.

Renseignez-vous sur les aides locales avant de signer les devis. Certaines communes, départements ou régions proposent des subventions complémentaires qui peuvent faire basculer la rentabilité d'un projet. Le conseiller France Rénov' de votre territoire connaît toutes les aides disponibles.` },
    ],
    faq: [
      { q: 'Peut-on négocier les tarifs d\'un artisan ?', a: 'Oui, la négociation est courante dans le bâtiment. Un artisan peut accorder 5 à 15 % de remise selon le volume du chantier, la période et la concurrence. Présentez des devis concurrents comme levier, sans agressivité. Ne négociez jamais en dessous du seuil de qualité.' },
      { q: 'Est-il rentable de fournir soi-même les matériaux ?', a: 'L\'économie est de 10 à 20 % sur les fournitures, mais vous perdez la garantie de l\'artisan sur les matériaux. C\'est rentable pour les matériaux standards (peinture, carrelage) mais risqué pour les équipements techniques (chaudière, tableau électrique) qui nécessitent une garantie fabricant.' },
      { q: 'Un artisan fait-il un meilleur prix en janvier ?', a: 'Oui, la période janvier-mars est creuse pour la plupart des artisans. Les remises peuvent atteindre 10 à 15 % par rapport à la haute saison (avril-octobre). Les travaux intérieurs (peinture, plomberie, électricité) se prêtent bien à cette planification hivernale.' },
      { q: 'Faut-il verser un acompte à l\'artisan ?', a: 'Un acompte de 20 à 30 % à la signature du devis est courant pour les chantiers importants. Il sécurise la commande des matériaux. Ne versez jamais plus de 30 % à la commande. Le solde est payé à la réception des travaux, après vérification de la qualité.' },
      { q: 'Comment éviter les malfaçons lors d\'une rénovation ?', a: 'Choisissez des artisans qualifiés (Qualibat, RGE), vérifiez les assurances (décennale obligatoire), visitez des chantiers antérieurs, suivez régulièrement l\'avancement et formalisez la réception des travaux par un PV écrit avec mention des éventuelles réserves.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'aides-maprimerenov-guide',
    title: 'MaPrimeRénov\' 2026 : guide complet des aides',
    metaDescription: 'Guide détaillé MaPrimeRénov\' 2026 : montants, conditions, démarches, artisans RGE et simulation de vos aides.',
    category: 'economiser',
    relatedServices: ['renovation-energetique', 'isolation-thermique', 'pompe-a-chaleur', 'chauffagiste', 'menuisier'],
    sections: [
      { title: 'MaPrimeRénov\' : comment ça marche ?', content: `MaPrimeRénov' est une aide de l'État distribuée par l'ANAH (Agence Nationale de l'Habitat) pour financer les travaux de rénovation énergétique des logements. Elle remplace l'ancien crédit d'impôt transition énergétique (CITE) et les aides de l'ANAH « Habiter Mieux ».

L'aide est versée après la réalisation des travaux, sur présentation des factures. Le montant dépend de vos revenus (4 catégories : bleu, jaune, violet, rose) et du type de travaux réalisés. Les ménages les plus modestes (bleu) bénéficient des aides les plus élevées.

Les travaux doivent être réalisés par un professionnel certifié RGE (Reconnu Garant de l'Environnement). La demande d'aide doit être déposée en ligne sur maprimerenov.gouv.fr avant le début des travaux. Le versement intervient dans un délai de 2 à 4 mois après le dépôt du dossier complet.` },
      { title: 'Les montants par type de travaux en 2026', content: `L'isolation des combles et toitures est subventionnée de 15 à 25 euros par m² selon les revenus. L'isolation des murs par l'extérieur bénéficie de 40 à 75 euros par m². Le remplacement des fenêtres simple vitrage est aidé de 40 à 100 euros par fenêtre.

Pour le chauffage, les aides sont plus substantielles : 2 000 à 5 000 euros pour une pompe à chaleur air-eau, 5 000 à 11 000 euros pour une PAC géothermique, 1 000 à 2 500 euros pour un poêle à granulés, et 1 000 à 2 000 euros pour un chauffe-eau thermodynamique.

MaPrimeRénov' Rénovation globale offre un forfait de 5 000 à 10 000 euros pour les projets visant un saut d'au moins 2 classes DPE. Ce parcours est obligatoire pour les projets dépassant 2 gestes de travaux et nécessite l'intervention d'un Accompagnateur Rénov'.` },
      { title: 'Les conditions d\'éligibilité', content: `Le logement doit avoir plus de 15 ans (2 ans pour les remplacements de chaudières fioul). Il doit être occupé comme résidence principale au moins 8 mois par an. Les propriétaires bailleurs sont éligibles à condition de louer le logement comme résidence principale pendant 6 ans minimum.

Les conditions de ressources déterminent la catégorie de revenus : bleu (très modestes), jaune (modestes), violet (intermédiaires) et rose (supérieurs). Les plafonds de revenus varient selon la composition du foyer et la localisation (Île-de-France ou province). Les ménages rose ne sont éligibles qu'à MaPrimeRénov' Rénovation globale.

Les copropriétés peuvent bénéficier de MaPrimeRénov' Copropriétés pour les travaux sur les parties communes (isolation de la façade, changement du système de chauffage collectif). L'aide est versée au syndicat de copropriétaires et peut atteindre 25 % du montant des travaux.` },
      { title: 'Les démarches pas à pas', content: `Étape 1 : Identifiez les travaux à réaliser grâce à un audit énergétique ou les conseils d'un espace France Rénov'. Étape 2 : Obtenez des devis d'artisans RGE. Étape 3 : Créez votre compte sur maprimerenov.gouv.fr et déposez votre demande avec les devis.

Étape 4 : Attendez la confirmation d'éligibilité de l'ANAH (délai : 2 à 6 semaines). Étape 5 : Faites réaliser les travaux par l'artisan RGE. Étape 6 : Transmettez les factures acquittées sur votre espace en ligne. Étape 7 : Recevez le virement de la prime (2 à 4 mois).

Attention : ne commencez jamais les travaux avant d'avoir reçu la confirmation d'éligibilité. Les travaux démarrés avant le dépôt de la demande ne sont pas éligibles. Conservez tous les justificatifs (devis, factures, attestations RGE) pendant 5 ans en cas de contrôle.` },
    ],
    faq: [
      { q: 'Puis-je cumuler MaPrimeRénov\' avec d\'autres aides ?', a: 'Oui, MaPrimeRénov\' est cumulable avec les CEE, l\'éco-PTZ et les aides locales. Le cumul total ne peut pas dépasser 90 % du coût des travaux pour les ménages très modestes et 75 % pour les autres. La TVA à 5,5 % s\'applique en plus.' },
      { q: 'Comment trouver un artisan RGE ?', a: 'Recherchez un artisan RGE sur france-renov.gouv.fr en indiquant votre localisation et le type de travaux. Vérifiez que le certificat RGE est en cours de validité et correspond bien à la nature des travaux prévus. Demandez une copie du certificat avant de signer le devis.' },
      { q: 'Quel délai pour recevoir MaPrimeRénov\' ?', a: 'Le délai total entre le dépôt de la demande et le versement de la prime est de 3 à 6 mois. La confirmation d\'éligibilité prend 2 à 6 semaines, puis le versement intervient 2 à 4 mois après la transmission des factures. Planifiez votre trésorerie en conséquence.' },
      { q: 'MaPrimeRénov\' est-elle imposable ?', a: 'Non, MaPrimeRénov\' n\'est pas imposable. Elle ne constitue pas un revenu et ne doit pas être déclarée aux impôts. De même, les CEE et les aides de l\'ANAH ne sont pas imposables.' },
      { q: 'Peut-on faire les travaux soi-même ?', a: 'Non, les travaux doivent impérativement être réalisés par un professionnel certifié RGE pour bénéficier de MaPrimeRénov\'. L\'auto-rénovation n\'est pas éligible. Cette condition garantit la qualité des travaux et la performance énergétique attendue.' },
    ],
    lastUpdated: '2026-02-01',
  },
  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE : URGENCE (5 guides)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'que-faire-degat-des-eaux',
    title: 'Dégât des eaux : que faire étape par étape',
    metaDescription: 'Procédure complète en cas de dégât des eaux : gestes d\'urgence, déclaration assurance, constat amiable et travaux.',
    category: 'urgence',
    relatedServices: ['plombier', 'peintre-en-batiment', 'electricien'],
    sections: [
      { title: 'Les gestes d\'urgence immédiats', content: `Face à un dégât des eaux, la priorité est de limiter l'étendue des dégâts. Coupez immédiatement l'arrivée d'eau au robinet d'arrêt général (généralement situé près du compteur, dans la cave ou un placard technique). Si le dégât provient de l'étage supérieur, prévenez votre voisin pour qu'il fasse de même.

Coupez l'électricité dans les zones touchées par l'eau pour éviter tout risque d'électrocution. Ne touchez jamais un appareil électrique avec les mains mouillées ou les pieds dans l'eau. En cas de doute sur la sécurité électrique, coupez le disjoncteur général.

Protégez vos meubles et objets de valeur en les éloignant de la zone inondée. Épongez l'eau stagnante avec des serpillières et des bassines. Prenez des photos de tous les dégâts avant de commencer le nettoyage : elles seront indispensables pour votre déclaration d'assurance.` },
      { title: 'Déclaration d\'assurance et constat amiable', content: `Vous disposez de 5 jours ouvrés pour déclarer le sinistre à votre assurance habitation (2 jours en cas de catastrophe naturelle). La déclaration peut être faite par téléphone, en ligne ou par lettre recommandée. Joignez les photos des dégâts, les factures des biens endommagés et une estimation des réparations.

Si le dégât implique un tiers (voisin du dessus, copropriété), remplissez un constat amiable de dégât des eaux avec toutes les parties concernées. Ce document est disponible auprès de votre assureur ou téléchargeable en ligne. Chaque partie conserve un exemplaire et en transmet un à son assureur.

L'assurance peut mandater un expert pour évaluer les dégâts. L'expert intervient généralement dans un délai de 8 à 15 jours. En attendant, ne jetez pas les éléments endommagés sans l'accord de l'expert. Conservez les pièces défectueuses et les biens détériorés comme preuves.` },
      { title: 'Recherche de fuite et réparation', content: `La recherche de fuite doit être confiée à un plombier professionnel équipé de matériel de détection (caméra thermique, corrélateur acoustique, gaz traceur). Le coût d'une recherche de fuite se situe entre 200 et 600 euros selon la difficulté. Certaines assurances prennent en charge ce coût.

Les fuites les plus fréquentes proviennent des joints de robinetterie, des raccords de machine à laver, des canalisations encastrées corrodées ou des flexibles de chauffe-eau. La réparation coûte entre 100 et 500 euros pour une fuite simple, et 500 à 2 000 euros pour une fuite encastrée nécessitant l'ouverture d'un mur ou d'un plancher.

Après la réparation de la fuite, laissez sécher les zones touchées pendant au moins 2 à 4 semaines avant d'entreprendre les travaux de remise en état. Un déshumidificateur professionnel accélère le séchage et prévient le développement de moisissures.` },
      { title: 'Travaux de remise en état', content: `La remise en état après un dégât des eaux comprend généralement : le séchage des structures, le traitement anti-moisissures, la réfection des peintures et papiers peints, le remplacement des revêtements de sol endommagés et la remise en état des plafonds.

Le coût de la remise en état varie de 1 000 à 10 000 euros selon l'ampleur des dégâts. La peinture des murs et plafonds touchés coûte 15 à 30 euros le m². Le remplacement d'un parquet stratifié revient à 20 à 50 euros le m². La réfection d'un plafond en placo coûte 30 à 60 euros le m².

Votre assurance habitation prend en charge les frais de remise en état après application de la franchise (généralement 150 à 300 euros). La vétusté du bien est déduite de l'indemnisation. Pour les biens mobiliers, l'indemnisation se fait en valeur de remplacement si vous avez souscrit cette option.` },
    ],
    faq: [
      { q: 'Quel délai pour déclarer un dégât des eaux ?', a: 'Vous disposez de 5 jours ouvrés à compter de la découverte du sinistre pour le déclarer à votre assurance. En cas de catastrophe naturelle, le délai est de 10 jours après la publication de l\'arrêté au Journal officiel. Déclarez le plus tôt possible pour accélérer l\'indemnisation.' },
      { q: 'Qui paie les réparations en cas de dégât des eaux ?', a: 'L\'assurance habitation du responsable du dégât prend en charge les réparations chez les tiers. Si la fuite vient de chez vous, votre assurance couvre les dégâts chez le voisin. Si la fuite vient des parties communes, c\'est l\'assurance de la copropriété qui intervient.' },
      { q: 'La franchise est-elle toujours appliquée ?', a: 'Oui, la franchise s\'applique systématiquement sauf si votre contrat prévoit une absence de franchise. Elle est généralement de 150 à 300 euros. Si le dégât est causé par un tiers identifié, votre assureur exerce un recours contre l\'assurance du responsable, mais la franchise reste à votre charge.' },
      { q: 'Peut-on choisir son plombier ou son artisan ?', a: 'Oui, vous êtes libre de choisir votre artisan pour les réparations. Votre assurance peut recommander des professionnels partenaires mais ne peut pas vous les imposer. Demandez plusieurs devis et transmettez-les à votre assureur pour validation avant le début des travaux.' },
      { q: 'Comment prévenir les dégâts des eaux ?', a: 'Vérifiez régulièrement l\'état des joints et flexibles (durée de vie 5-10 ans), fermez le robinet de la machine à laver après chaque utilisation, faites entretenir votre chaudière et votre chauffe-eau annuellement, et installez un détecteur de fuite connecté sous les points d\'eau.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'urgence-plomberie-guide',
    title: 'Urgence plomberie : guide des bons réflexes',
    metaDescription: 'Que faire en cas d\'urgence plomberie : fuite, canalisation bouchée, chauffe-eau en panne. Gestes d\'urgence et tarifs.',
    category: 'urgence',
    relatedServices: ['plombier', 'chauffagiste'],
    sections: [
      { title: 'Fuite d\'eau : les gestes qui sauvent', content: `En cas de fuite d'eau, le premier réflexe est de couper l'arrivée d'eau. Le robinet d'arrêt général se trouve généralement près du compteur d'eau. En appartement, il est souvent sous l'évier de la cuisine ou dans un placard technique. Repérez-le à l'avance pour ne pas perdre de temps en cas d'urgence.

Si la fuite est localisée sur un appareil (machine à laver, chauffe-eau), fermez uniquement le robinet d'arrivée de cet appareil. Placez un récipient sous la fuite et épongez l'eau pour limiter les dégâts. En cas de fuite importante au plafond, percez un trou au point le plus bas pour évacuer l'eau de manière contrôlée et éviter l'effondrement.

Coupez l'électricité si l'eau est en contact avec des prises ou des appareils électriques. Ne tentez pas de colmater une fuite sur un tuyau sous pression avec du ruban adhésif : seul un raccord de réparation provisoire ou un collier de serrage peut contenir temporairement la pression.` },
      { title: 'Canalisation bouchée : solutions rapides', content: `Avant d'appeler un plombier, tentez un débouchage mécanique avec une ventouse. Placez la ventouse sur l'orifice d'évacuation, créez une dépression en appuyant fermement, puis tirez d'un coup sec. Répétez l'opération plusieurs fois. Cette méthode fonctionne dans 50 % des cas pour les bouchons légers.

Si la ventouse ne suffit pas, essayez un mélange de bicarbonate de soude et de vinaigre blanc : versez 6 cuillères à soupe de bicarbonate suivies de 25 cl de vinaigre blanc, laissez agir 30 minutes, puis rincez à l'eau bouillante. Cette méthode écologique est efficace contre les bouchons de graisse.

Pour les bouchons tenaces, un furet manuel (disponible en quincaillerie pour 10 à 30 euros) permet d'atteindre les obstructions situées dans les canalisations. En cas d'échec, faites appel à un plombier qui utilisera un furet électrique ou un hydrocurage haute pression.` },
      { title: 'Chauffe-eau en panne : diagnostic rapide', content: `Si votre chauffe-eau ne produit plus d'eau chaude, vérifiez d'abord le disjoncteur dédié au tableau électrique. Un disjoncteur qui a sauté peut simplement être réenclenché. Si le problème persiste, vérifiez le contacteur jour/nuit et le thermostat de sécurité (bouton rouge à réarmer sous le capot du chauffe-eau).

Un chauffe-eau qui fuit par le groupe de sécurité est normal pendant la chauffe (l'eau qui se dilate est évacuée). En revanche, une fuite permanente indique un groupe de sécurité défaillant (remplacement : 50 à 150 euros) ou une cuve percée (remplacement du chauffe-eau nécessaire).

Si l'eau chaude est tiède ou insuffisante, la résistance est probablement entartrée. Un détartrage (100 à 200 euros) résout le problème dans la plupart des cas. Si le chauffe-eau a plus de 10-15 ans et que les pannes se multiplient, le remplacement est souvent plus économique que les réparations répétées.` },
      { title: 'Tarifs d\'urgence et comment éviter les arnaques', content: `Les tarifs d'un plombier d'urgence varient selon l'horaire : 100 à 250 euros en journée ouvrable, 200 à 400 euros le soir et le week-end, 300 à 600 euros la nuit et les jours fériés. Ces tarifs incluent le déplacement et une intervention simple (réparation de fuite, débouchage).

Pour éviter les arnaques, préparez-vous avant l'urgence : notez les coordonnées d'un plombier de confiance recommandé par votre entourage ou votre assurance. En cas d'urgence, demandez un devis par téléphone avant le déplacement. Un plombier honnête vous donne une fourchette de prix.

Méfiez-vous des plombiers trouvés en urgence sur internet qui affichent des prix d'appel bas (« déplacement à 1 euro »). Le prix réel est souvent révélé une fois sur place, quand vous êtes en position de faiblesse. Privilégiez les plombiers ayant une adresse physique vérifiable et des avis clients authentiques.` },
    ],
    faq: [
      { q: 'Combien coûte un plombier en urgence la nuit ?', a: 'Une intervention de plomberie d\'urgence la nuit coûte entre 250 et 600 euros selon la complexité. Les majorations nocturnes (50 à 100 %) et du week-end (25 à 50 %) sont légales mais doivent être annoncées avant le déplacement. Exigez un devis même en urgence.' },
      { q: 'Comment couper l\'eau en cas de fuite ?', a: 'Fermez le robinet d\'arrêt général situé près du compteur d\'eau (cave, placard technique, regard extérieur). En appartement, il est souvent sous l\'évier ou dans les WC. Si vous ne le trouvez pas, appelez le service des eaux de votre commune qui peut couper l\'eau au compteur.' },
      { q: 'Mon assurance prend-elle en charge le plombier d\'urgence ?', a: 'La plupart des assurances habitation incluent une assistance d\'urgence qui couvre les frais de plombier en cas de fuite importante. Le plafond de prise en charge varie de 150 à 500 euros selon les contrats. Appelez votre assureur avant d\'appeler un plombier.' },
      { q: 'Peut-on colmater soi-même une fuite provisoirement ?', a: 'Pour les petites fuites, un collier de réparation (5-15 euros en quincaillerie) ou du mastic époxy (résine bicomposant) peut tenir quelques jours en attendant le plombier. Pour les fuites sous pression, seul un robinet d\'arrêt peut stopper l\'eau. Ne comptez pas sur du ruban adhésif.' },
      { q: 'Que faire si les WC sont bouchés ?', a: 'Utilisez une ventouse spéciale WC en créant un mouvement de va-et-vient vigoureux. Si cela ne suffit pas, versez un seau d\'eau chaude (pas bouillante) d\'une certaine hauteur pour créer une pression. En dernier recours, un furet à manivelle permet de briser les bouchons solides.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'urgence-electricite-guide',
    title: 'Urgence électrique : que faire et qui appeler',
    metaDescription: 'Guide des urgences électriques : panne de courant, court-circuit, odeur de brûlé. Gestes de sécurité et contacts utiles.',
    category: 'urgence',
    relatedServices: ['electricien'],
    sections: [
      { title: 'Panne de courant : diagnostic rapide', content: `En cas de panne de courant, vérifiez d'abord si la coupure est générale (tout le quartier) ou limitée à votre logement. Regardez si les voisins ont de la lumière ou si l'éclairage public fonctionne. Si la panne est générale, elle relève d'Enedis (numéro d'urgence : 09 72 67 50 + numéro du département).

Si la panne est limitée à votre logement, vérifiez le disjoncteur général. S'il a sauté, réenclenchez-le. S'il saute à nouveau immédiatement, un court-circuit est présent dans votre installation. Débranchez tous les appareils, puis réenclenchez le disjoncteur et rebranchez les appareils un par un pour identifier le fautif.

Si seule une partie du logement est concernée, un disjoncteur divisionnaire a probablement sauté. Identifiez le circuit concerné au tableau électrique, débranchez les appareils sur ce circuit, puis réenclenchez le disjoncteur. Si le problème persiste, faites appel à un électricien.` },
      { title: 'Court-circuit et odeur de brûlé : réagir vite', content: `Une odeur de brûlé ou de plastique fondu est un signal d'alerte majeur qui peut précéder un incendie. Coupez immédiatement le disjoncteur général et débranchez l'appareil suspect. N'essayez pas de localiser l'origine de l'odeur dans le tableau électrique si vous n'êtes pas qualifié.

Si de la fumée se dégage d'une prise ou d'un interrupteur, coupez le courant et n'utilisez plus cette prise. Un échauffement localisé peut être dû à un faux contact, un fil desserré ou une surcharge. Seul un électricien peut diagnostiquer et réparer le problème en toute sécurité.

En cas de début d'incendie électrique, n'utilisez jamais d'eau pour éteindre les flammes. Coupez le courant si c'est possible sans danger, puis utilisez un extincteur à CO2 ou à poudre. Si l'incendie se développe, évacuez immédiatement et appelez les pompiers (18 ou 112).` },
      { title: 'Électrocution : les gestes de premier secours', content: `Si une personne est en contact avec une source électrique, ne la touchez pas directement. Coupez d'abord le courant au disjoncteur général. Si vous ne pouvez pas couper le courant, utilisez un objet isolant (bâton en bois sec, chaise en plastique) pour éloigner la victime de la source électrique.

Appelez immédiatement le SAMU (15) ou les pompiers (18). Même si la victime semble aller bien, une électrocution peut provoquer des troubles cardiaques retardés. Une surveillance médicale de 24 heures est recommandée.

Si la victime est inconsciente mais respire, placez-la en position latérale de sécurité. Si elle ne respire plus, pratiquez la réanimation cardio-pulmonaire (massage cardiaque et bouche-à-bouche) en attendant les secours. L'utilisation d'un défibrillateur automatique externe (DAE) peut être vitale.` },
      { title: 'Quand appeler un électricien d\'urgence', content: `Un électricien d'urgence est nécessaire lorsque le disjoncteur saute de manière répétée, lorsqu'une odeur de brûlé persiste après avoir coupé le courant, lorsqu'une prise ou un interrupteur présente des traces de brûlure, ou lorsqu'un court-circuit a été identifié sans pouvoir en déterminer l'origine.

Le tarif d'un électricien d'urgence varie de 100 à 200 euros en journée et de 200 à 400 euros le soir et le week-end. Ces tarifs couvrent le diagnostic et les réparations simples. Les interventions complexes (remplacement d'un tableau, recherche de court-circuit dans les murs) font l'objet d'un devis complémentaire.

Pour les pannes en dehors des heures ouvrables, contactez d'abord Enedis si la panne est générale. Si la panne est interne, certains artisans proposent un service d'urgence 24h/24. Vérifiez les avis et le SIRET avant de faire intervenir un électricien inconnu, surtout la nuit.` },
    ],
    faq: [
      { q: 'Mon disjoncteur saute sans raison, que faire ?', a: 'Un disjoncteur qui saute régulièrement indique soit une surcharge (trop d\'appareils branchés), soit un défaut d\'isolement (fuite de courant). Débranchez les appareils gourmands et réenclenchez. Si le problème persiste, faites contrôler l\'installation par un électricien.' },
      { q: 'Qui appeler pour une coupure de courant générale ?', a: 'Appelez Enedis au 09 72 67 50 + numéro de votre département (ex : 09 72 67 50 75 pour Paris). Enedis gère le réseau de distribution et intervient gratuitement pour les pannes du réseau public. Les pannes internes à votre logement relèvent de votre responsabilité.' },
      { q: 'Peut-on réenclencher soi-même le disjoncteur ?', a: 'Oui, vous pouvez réenclencher le disjoncteur général ou les disjoncteurs divisionnaires. S\'il saute immédiatement après le réenclenchement, ne forcez pas : un court-circuit est présent. Débranchez tous les appareils avant de réessayer, et faites appel à un électricien si le problème persiste.' },
      { q: 'Les surtensions peuvent-elles endommager mes appareils ?', a: 'Oui, les surtensions (foudre, incident réseau) peuvent détruire les appareils électroniques sensibles (TV, ordinateur, box internet). Un parafoudre au tableau (200-500 euros) protège l\'ensemble de l\'installation. Des multiprises avec protection contre les surtensions ajoutent une sécurité supplémentaire.' },
      { q: 'L\'assurance couvre-t-elle les dommages électriques ?', a: 'L\'assurance habitation couvre les dommages causés par un incendie d\'origine électrique et les dégâts de foudre. La garantie « dommages électriques » (option) couvre les appareils endommagés par une surtension. Vérifiez votre contrat et déclarez le sinistre dans les 5 jours.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'urgence-serrurerie-guide',
    title: 'Urgence serrurerie : porte claquée ou effraction',
    metaDescription: 'Guide d\'urgence serrurerie : porte claquée, perte de clé, effraction. Tarifs réels, bons réflexes et arnaques à éviter.',
    category: 'urgence',
    relatedServices: ['serrurier', 'alarme-securite'],
    sections: [
      { title: 'Porte claquée : ne paniquez pas', content: `Une porte claquée est la situation d'urgence serrurerie la plus fréquente. Avant d'appeler un serrurier, vérifiez toutes les solutions alternatives : fenêtre entrouverte accessible, porte de service, baie vitrée non verrouillée. Contactez votre voisin qui peut détenir un double de clé, votre gardien d'immeuble ou votre propriétaire.

Si aucune alternative n'existe, appelez un serrurier de confiance identifié à l'avance. Le coût d'une ouverture de porte claquée (serrure non verrouillée) est de 80 à 200 euros en journée. Le serrurier utilise généralement un bypass, une radio ou un crochet pour ouvrir sans endommager la serrure.

Important : une porte claquée ne nécessite pas le remplacement de la serrure. Si le serrurier vous propose de changer le cylindre alors que la porte s'est simplement claquée (sans tour de clé), refusez. La serrure n'est pas endommagée et fonctionne normalement une fois la porte ouverte.` },
      { title: 'Perte ou vol de clé : sécuriser votre logement', content: `En cas de perte de clé, le remplacement du cylindre est recommandé par mesure de sécurité. Vous ne savez pas qui a pu trouver votre clé ni s'il peut identifier votre adresse. Le remplacement d'un cylindre standard coûte entre 80 et 200 euros (fourniture et pose).

En cas de vol de clé (avec vos papiers d'identité mentionnant votre adresse), le remplacement du cylindre est urgent et prioritaire. Déposez une plainte au commissariat et informez votre assurance habitation. Certains contrats prennent en charge le remplacement de la serrure en cas de vol de clé.

Profitez du remplacement pour passer à un cylindre de sécurité certifié A2P. Un cylindre A2P* résiste au crochetage et au bumping pendant au moins 5 minutes. Le surcoût par rapport à un cylindre standard est de 50 à 150 euros, un investissement raisonnable pour la sécurité de votre logement.` },
      { title: 'Après un cambriolage : les étapes', content: `Après un cambriolage, ne touchez à rien et appelez immédiatement la police (17) ou la gendarmerie. Les enquêteurs doivent constater les traces d'effraction et relever les empreintes avant que vous ne nettoyiez. Faites un inventaire des objets volés et prenez des photos des dégâts.

Déposez plainte dans les 24 heures et déclarez le sinistre à votre assurance dans les 2 jours ouvrés. L'assurance couvre les biens volés (avec franchise et plafond) et les dégâts matériels liés à l'effraction (porte enfoncée, serrure forcée, fenêtre cassée).

Faites sécuriser votre logement en urgence par un serrurier : remplacement de la porte si elle a été enfoncée, changement de toutes les serrures, pose de points de sécurité supplémentaires. La plupart des assurances prennent en charge les frais de sécurisation provisoire dans les 48 heures suivant le cambriolage.` },
      { title: 'Prévenir les urgences serrurerie', content: `La meilleure prévention est d'avoir un double de clé chez un voisin de confiance ou dans un coffre à clé sécurisé (cadenas à code fixé au mur). Certains serruriers proposent un service de conservation de double moyennant un abonnement annuel.

Investissez dans une serrure de qualité. Une serrure 3 points certifiée A2P est le minimum recommandé pour une porte d'entrée. Pour les logements à risque, une serrure 5 ou 7 points avec un cylindre haute sécurité offre une protection renforcée.

Installez un entrebâilleur sur votre porte d'entrée pour vérifier l'identité des visiteurs sans ouvrir complètement. Une caméra de surveillance connectée ou un visiophone offre une sécurité supplémentaire et dissuade les cambrioleurs.` },
    ],
    faq: [
      { q: 'Combien coûte l\'ouverture d\'une porte claquée ?', a: 'L\'ouverture d\'une porte claquée coûte 80 à 200 euros en journée, 150 à 350 euros le soir et week-end, et 250 à 500 euros la nuit. Ces tarifs concernent une ouverture sans destruction. Si la serrure est verrouillée (avec un tour de clé), le tarif est plus élevé car l\'intervention est plus complexe.' },
      { q: 'Faut-il changer la serrure après une porte claquée ?', a: 'Non, une porte claquée n\'endommage pas la serrure. Le remplacement du cylindre est inutile si la porte s\'est simplement refermée sans tour de clé. Méfiez-vous du serrurier qui insiste pour changer le cylindre dans ce cas : c\'est une pratique abusive courante.' },
      { q: 'Mon assurance couvre-t-elle le serrurier après un cambriolage ?', a: 'Oui, l\'assurance habitation couvre les frais de serrurier et de remplacement de la porte et des serrures endommagées lors d\'un cambriolage. Déclarez le sinistre dans les 2 jours ouvrés et conservez toutes les factures. La franchise s\'applique généralement.' },
      { q: 'Comment éviter de se faire arnaquer par un serrurier ?', a: 'Identifiez un serrurier de confiance à l\'avance (bouche-à-oreille, recommandation de l\'assurance). Demandez un tarif par téléphone avant le déplacement. Refusez toute intervention sans devis préalable. Ne payez jamais en espèces et exigez une facture détaillée.' },
      { q: 'Qu\'est-ce qu\'une serrure certifiée A2P ?', a: 'A2P (Assurance Prévention Protection) certifie la résistance d\'une serrure à l\'effraction. Il y a 3 niveaux : A2P* (5 min de résistance), A2P** (10 min), A2P*** (15 min). Pour un appartement, le niveau A2P** est recommandé. Le coût d\'un cylindre A2P** est de 100 à 250 euros.' },
    ],
    lastUpdated: '2026-02-01',
  },
  {
    slug: 'urgence-chauffage-guide',
    title: 'Panne de chauffage en hiver : que faire en urgence',
    metaDescription: 'Guide d\'urgence chauffage : diagnostic rapide, gestes d\'attente, tarifs dépannage et solutions de chauffage provisoire.',
    category: 'urgence',
    relatedServices: ['chauffagiste', 'electricien', 'plombier'],
    sections: [
      { title: 'Diagnostic rapide avant d\'appeler', content: `Avant d'appeler un chauffagiste, effectuez quelques vérifications simples qui résolvent le problème dans 30 % des cas. Vérifiez le thermostat : les piles sont-elles chargées ? Le réglage de température est-il correct ? Le mode de programmation est-il adapté ?

Pour une chaudière gaz, vérifiez que la pression du circuit de chauffage est entre 1 et 1,5 bar (manomètre sur la chaudière). Si la pression est trop basse, ajoutez de l'eau par le robinet de remplissage. Si la chaudière affiche un code erreur, consultez le manuel ou recherchez le code sur internet.

Pour un radiateur électrique qui ne chauffe plus, vérifiez le disjoncteur au tableau, le fil pilote et le thermostat intégré. Un radiateur froid alors que les autres fonctionnent indique un problème localisé (fusible du circuit, thermostat du radiateur, fil desserré).` },
      { title: 'Gestes d\'attente en cas de panne prolongée', content: `En attendant l'intervention du chauffagiste, préservez la chaleur existante : fermez les volets et rideaux, bouchez les courants d'air sous les portes avec des boudins ou des serviettes, et regroupez la famille dans une seule pièce pour concentrer la chaleur corporelle.

Un chauffage d'appoint électrique (radiateur soufflant, bain d'huile) peut maintenir une température acceptable dans une pièce. Attention : ne dépassez pas 2 000 watts sur une même prise et ne laissez jamais un chauffage d'appoint sans surveillance. Les chauffages à pétrole ou à gaz d'appoint nécessitent une ventilation permanente.

Si la température descend en dessous de 10 degrés pendant plus de 24 heures et que des canalisations sont exposées au gel, ouvrez légèrement les robinets pour maintenir une circulation d'eau qui empêche le gel. Vidangez les canalisations extérieures si possible.` },
      { title: 'Dépannage chauffage : tarifs et délais', content: `Le dépannage d'une chaudière gaz coûte entre 100 et 300 euros en journée ouvrable. Les pannes les plus fréquentes sont : la sonde de température défaillante (50 à 150 euros de pièce), la pompe de circulation en panne (200 à 400 euros), le brûleur encrassé (nettoyage inclus dans l'entretien) et la carte électronique défectueuse (200 à 500 euros).

Si vous avez un contrat d'entretien, le dépannage est souvent inclus ou à tarif réduit, avec un délai d'intervention prioritaire de 24 à 48 heures. Sans contrat, le délai peut atteindre 3 à 5 jours en plein hiver, période de forte demande pour les chauffagistes.

Pour les pompes à chaleur, le dépannage est plus coûteux (150 à 500 euros) car les interventions nécessitent souvent un technicien spécialisé en fluides frigorigènes. Le remplacement du compresseur (pièce maîtresse de la PAC) coûte 1 000 à 3 000 euros, main-d'œuvre comprise.` },
      { title: 'Prévenir les pannes de chauffage', content: `L'entretien annuel obligatoire de la chaudière est la meilleure prévention contre les pannes hivernales. Planifiez-le en septembre-octobre, avant la saison de chauffe. Le technicien détecte les signes d'usure et remplace les pièces fragiles avant qu'elles ne cassent en plein hiver.

Purgez vos radiateurs chaque automne. L'air emprisonné dans le circuit réduit l'efficacité du chauffage et peut provoquer des bruits et des dysfonctionnements. La purge est simple : ouvrez la vis de purge en haut du radiateur jusqu'à ce que l'eau s'écoule régulièrement.

Vérifiez la pression du circuit de chauffage au moins une fois par mois pendant la saison de chauffe. Une baisse de pression régulière indique une fuite dans le circuit (raccord, radiateur, vase d'expansion). Faites rechercher et réparer la fuite par un chauffagiste avant qu'elle ne s'aggrave.` },
    ],
    faq: [
      { q: 'Ma chaudière affiche un code erreur, que faire ?', a: 'Notez le code erreur et consultez le manuel d\'utilisation ou recherchez-le sur internet. Certains codes correspondent à des problèmes simples (pression basse, thermostat mal réglé) que vous pouvez résoudre vous-même. Si le code indique un défaut technique, appelez un chauffagiste.' },
      { q: 'Combien de temps peut-on rester sans chauffage ?', a: 'Un logement bien isolé perd environ 1 °C par heure sans chauffage par temps froid (0 °C dehors). Après 12 à 24 heures, la température intérieure peut descendre en dessous de 10 °C, ce qui est dangereux pour les personnes fragiles et risqué pour les canalisations (gel).' },
      { q: 'Mon propriétaire doit-il payer le dépannage ?', a: 'L\'entretien courant et les petites réparations sont à la charge du locataire. Le remplacement de la chaudière ou les réparations importantes (pompe, échangeur) sont à la charge du propriétaire. En cas de panne, contactez votre propriétaire qui doit assurer le bon fonctionnement du chauffage.' },
      { q: 'Peut-on utiliser un chauffage d\'appoint au pétrole ?', a: 'Les chauffages au pétrole sont déconseillés en intérieur en raison des risques d\'intoxication au CO. Si vous les utilisez en dernier recours, aérez la pièce 5 minutes toutes les heures et ne les laissez jamais fonctionner la nuit. Préférez un radiateur électrique d\'appoint, plus sûr.' },
      { q: 'Le dépannage est-il couvert par le contrat d\'entretien ?', a: 'Cela dépend de votre contrat. Les contrats basiques (100-150 euros/an) incluent l\'entretien annuel mais pas le dépannage. Les contrats premium (200-350 euros/an) incluent le dépannage avec main-d\'œuvre gratuite et parfois les pièces. Vérifiez les conditions de votre contrat.' },
    ],
    lastUpdated: '2026-02-01',
  },
]

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(g => g.slug === slug)
}

export function getGuideSlugs(): string[] {
  return guides.map(g => g.slug)
}

export function getGuidesByCategory(cat: string): Guide[] {
  return guides.filter(g => g.category === cat)
}
