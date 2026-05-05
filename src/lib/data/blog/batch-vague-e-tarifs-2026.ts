/**
 * Batch Vague E — Tarifs 2026 (Vague E du plan 40/40 audit STRATEGIE-RENOVATION-ENERGETIQUE.md).
 *
 * KW cibles validés Ahrefs API live (snapshot 2026-05-04, country=fr) :
 * - 'prix-isolation-combles-2026'      → "prix isolation combles" 700 vol, KD 1, CPC $1,00 ⭐⭐⭐⭐ EASY WIN
 *                                       + "prix isolation toiture" 450 vol, KD 0 (variant)
 *                                       Famille cumul ~1 200 vol/mois
 * - 'prix-chaudiere-condensation-2026' → "prix chaudiere condensation" 200 vol, KD 0, CPC $0,70 ⭐⭐⭐⭐ EASY WIN
 * - 'prix-poele-granules-2026'         → "prix poele a granules" 150 vol, KD 5, CPC $0,30 ⭐⭐⭐
 *                                       (orthographe officielle "à" ; slug sans accent par convention)
 * - 'prix-audit-energetique-2026'      → "prix audit energetique" 200 vol, KD 1, CPC $0,70 ⭐⭐⭐⭐
 *
 * Cumul Vague E : ~1 750 vol/mois sur articles très accessibles (KD 0-5, CPC $0,30-1,00)
 *
 * Anti-cannibalisation :
 *   - prix-pompe-a-chaleur-2026       (existe — batch-energie-2026.ts) : pas dupliqué
 *   - prix-fenetre-double-vitrage-2026 (existe — batch-prix.ts) : pas dupliqué
 *   - prix-vmc-double-flux-2026       (existe — batch-prestations-problemes.ts) : pas dupliqué
 *   - prix-isolation-exterieure-ite-m2-2026 (existe — batch-prestations-problemes.ts) : pas dupliqué
 */
import type { BlogArticle } from './articles'

export const vagueETarifs2026Articles: Record<string, BlogArticle> = {
  'prix-isolation-combles-2026': {
    title: 'Prix Isolation des Combles 2026 : tarifs au m², aides et choix de matériau',
    excerpt:
      'Prix isolation combles 2026 : 20 à 70 €/m² selon la technique (soufflage, déroulé, sarking). Aides MaPrimeRénov’ + CEE jusqu’à 4 000 €. Comparatif laine de verre, ouate de cellulose, polyuréthane.',
    metaTitle: 'Prix Isolation Combles 2026 : Tarifs m² + Aides',
    metaDescription:
      'Prix isolation combles 2026 : 20-70 €/m² selon technique. Comparatif matériaux + aides MPR/CEE. Devis 3 artisans RGE.',
    image: '🏠',
    author: 'Claire Dubois',
    date: '2026-05-04',
    readTime: '11 min',
    category: 'Tarifs',
    tags: ['isolation', 'combles', 'prix', 'rénovation énergétique', 'MaPrimeRénov’'],
    keyTakeaways: [
      'Combles perdus en soufflage : 20 à 35 €/m² (la solution la moins chère, idéale pour combles non aménagés).',
      'Combles aménagés en sarking : 50 à 90 €/m² (méthode haut de gamme, isolation par l’extérieur de la toiture).',
      'Aides cumulables 2026 : MaPrimeRénov’ jusqu’à 25 €/m² + CEE Coup de pouce isolation jusqu’à 12 €/m² (modeste/très modeste).',
      'Reste à charge typique pour 100 m² de combles perdus modeste : 800-1 500 € (sur devis brut 3 000-3 500 €).',
      'Délai d’amortissement : 4 à 8 ans selon le système de chauffage (économie chauffage 25-30 %).',
    ],
    faq: [
      {
        question: 'Quel est le prix moyen d’isolation des combles perdus en 2026 ?',
        answer:
          'Pour des combles perdus, comptez 20-35 €/m² en soufflage de laine minérale (la technique la plus utilisée), 30-45 €/m² en panneaux déroulés. Pour 100 m² de combles, le devis brut moyen est de 2 500-4 500 € TTC (matériau + pose). Avec MaPrimeRénov’ + CEE, le reste à charge tombe à 800-1 800 € pour les ménages modestes.',
      },
      {
        question: 'Quelle isolation pour des combles aménagés ?',
        answer:
          'Deux techniques : (1) isolation sous rampants entre chevrons (40-65 €/m², perd 15-20 cm de hauteur sous toit), (2) sarking par l’extérieur (50-90 €/m², ne perd pas de volume habitable mais nécessite de déposer la couverture). Le sarking est privilégié en rénovation lourde ou changement de toiture.',
      },
      {
        question: 'Quel matériau choisir : laine de verre, ouate de cellulose, polyuréthane ?',
        answer:
          'Laine de verre : 20-30 €/m² fourni-posé, R thermique 7 pour 30 cm. Ouate de cellulose (biosourcée) : 25-40 €/m², R thermique 7 pour 30 cm, meilleur déphasage été. Polyuréthane : 35-55 €/m², R thermique 7 pour 18 cm seulement (idéal si hauteur limitée). Pour MaPrimeRénov’, R minimal exigé : 7 m².K/W en combles perdus, 6 en rampants.',
      },
      {
        question: 'Quelles aides pour isoler ses combles en 2026 ?',
        answer:
          'MaPrimeRénov’ : 7 €/m² (rose) à 25 €/m² (bleu très modeste) en combles perdus. CEE Coup de pouce isolation : jusqu’à 12 €/m² pour les modestes/très modestes. TVA réduite à 5,5 % sur matériaux + pose. Éco-PTZ jusqu’à 15 000 € pour le geste isolation seul. Cumul total possible : 25-40 €/m² d’aides selon profil.',
      },
      {
        question: 'Combien de temps pour amortir l’isolation des combles ?',
        answer:
          '4 à 8 ans en moyenne, selon le système de chauffage et la zone climatique. Une isolation correcte (R ≥ 7) réduit les déperditions par la toiture de 70-80 % (les combles représentent 25-30 % des déperditions totales d’une maison non isolée). Économie chauffage typique : 25-30 % sur la facture annuelle.',
      },
    ],
    content: [
      `# Prix Isolation des Combles en 2026 : tarifs au m², aides et choix de matériau

L’isolation des combles est la rénovation énergétique au meilleur rapport coût/économie en France : les combles représentent jusqu’à 30 % des déperditions thermiques d’un logement non isolé, et leur isolation reste accessible (20-90 €/m² selon technique).

En 2026, la combinaison MaPrimeRénov’ + CEE Coup de pouce isolation permet souvent de réduire le reste à charge à moins de 1 500 € pour 100 m² de combles perdus chez un ménage modeste. Voici les prix réels constatés et comment optimiser votre projet.`,

      `## Prix au m² selon la technique d’isolation 2026

**Combles perdus (non aménageables) — soufflage** : 20-35 €/m² fourni-posé. Technique reine pour combles non habitables : la machine projette la laine en vrac sur le plancher des combles, sans casser. Délai pose : 1 jour pour 100 m². Performance R 7 atteignable avec 30 cm.

**Combles perdus — déroulé** : 30-45 €/m². Pose manuelle de panneaux semi-rigides ou rouleaux. Plus précis qu’un soufflage (pas de tassement) mais plus cher en main-d’œuvre. Idéal si plancher praticable.

**Combles aménagés — sous rampants** : 40-65 €/m². Pose entre chevrons + sous-pannes ou contre-cloison BA13. Réduit la hauteur sous toit de 15-20 cm. Méthode standard en rénovation.

**Combles aménagés — sarking (par l’extérieur)** : 50-90 €/m². Pose des panneaux isolants sur les chevrons, sous la couverture. Nécessite de déposer la toiture mais ne perd pas de volume habitable. Cumulable avec une réfection de toiture.

**Isolation des combles + plancher** : ajouter 10-15 €/m² si plancher des combles à isoler également (combles partiellement aménagés).`,

      `## Comparatif matériaux : performance, prix, durabilité

**Laine de verre** : 20-30 €/m² fourni-posé. Conductivité λ ~0,035 W/m.K. R 7 pour 30 cm d’épaisseur. Le matériau le plus utilisé en France (60 % du marché). Avantage : prix et facilité de pose. Inconvénient : déphasage été médiocre (4-5 h).

**Laine de roche** : 22-32 €/m². λ ~0,037. R 7 pour 30 cm. Meilleure résistance au feu (M0) et tenue mécanique. Performance acoustique supérieure.

**Ouate de cellulose (biosourcée)** : 25-40 €/m². λ ~0,038. R 7 pour 30 cm. Excellent déphasage été (10-12 h, idéal climat chaud), recyclée à partir de papier. Privilégier la pose insufflée pour combles aménagés.

**Polyuréthane (PU)** : 35-55 €/m². λ ~0,022 (le plus performant). R 7 pour seulement 18 cm. Idéal si hauteur sous toit limitée. Inconvénient : non biosourcé, prix.

**Fibre de bois** : 35-55 €/m². λ ~0,038. Excellent déphasage été (12-15 h). Matériau biosourcé certifié. Souvent en panneaux rigides pour sarking.

Pour MaPrimeRénov’, le matériau choisi doit atteindre la résistance thermique minimale R 7 m².K/W (combles perdus) ou R 6 (rampants).`,

      `## Aides cumulables en 2026

**MaPrimeRénov’ Geste Isolation** : 7 €/m² (rose, supérieurs) à 25 €/m² (bleu, très modeste) pour combles perdus. 15 €/m² (rose) à 75 €/m² (bleu) pour rampants. Plafond travaux retenu : 80 €/m² (combles perdus) ou 100 €/m² (rampants).

**CEE Coup de pouce isolation** : 10-12 €/m² combles perdus pour modeste/très modeste, 7-10 €/m² pour les autres. Versés directement par le fournisseur d’énergie partenaire (TotalEnergies, Engie, Sonergia, etc.).

**TVA réduite à 5,5 %** : applicable sur le matériau ET la main-d’œuvre, pour tout logement de plus de 2 ans. Le taux normal (20 %) s’applique aux travaux dans le neuf.

**Éco-PTZ** : prêt à taux zéro de 7 000 à 15 000 € pour le geste isolation seul, jusqu’à 50 000 € en bouquet de travaux. Sans conditions de revenus, remboursable sur 15-20 ans.

**Cumul total possible** : 25-40 €/m² d’aides pour les ménages très modestes en zones tendues, ce qui couvre souvent 70-90 % du devis brut.`,

      `## Combien ça coûte vraiment pour ma maison ?

**Maison 100 m² en combles perdus, ménage modeste, soufflage laine de verre R 7** :
- Devis brut : 2 800 € TTC (28 €/m²)
- MaPrimeRénov’ : 1 500 € (15 €/m² classe jaune)
- CEE Coup de pouce : 1 000 € (10 €/m²)
- Reste à charge : ~300 € (peut être nul en cumulant aides locales)

**Maison 80 m² en rampants, ménage intermédiaire, ouate de cellulose** :
- Devis brut : 3 800 € TTC (47 €/m²)
- MaPrimeRénov’ : 1 200 € (15 €/m²)
- CEE : 600 €
- Reste à charge : ~2 000 €

**Maison 120 m² en sarking, ménage supérieur (rose)** :
- Devis brut : 9 000 € TTC (75 €/m²)
- MaPrimeRénov’ : 1 800 € (15 €/m²)
- CEE : 900 €
- Reste à charge : ~6 300 € (mais valorisation immobilière + 5-8 % typique)`,

      `## Pièges à éviter en 2026

**1. L’isolation à 1 €** : disparue depuis 2021 mais des arnaques persistent. Méfiance maximale envers les démarches téléphoniques ou commerciaux à domicile (illégal depuis juillet 2020).

**2. Le sous-dimensionnement** : un R thermique inférieur à 7 ne donne accès à aucune aide et n’optimise pas l’économie d’énergie. Toujours vérifier la résistance thermique sur le devis (R en m².K/W).

**3. L’absence de pare-vapeur** : indispensable côté chaud pour éviter la condensation dans l’isolant. Son omission peut détruire l’isolation en 5-10 ans.

**4. Le tassement de la laine soufflée** : choisir un produit certifié ACERMI avec valeur de tassement précisée. Un tassement de 30 % réduit drastiquement la performance.

**5. L’oubli des liaisons** : les jonctions entre toiture et murs (sablières, pignons) sont des ponts thermiques majeurs. Le devis doit explicitement traiter ces zones.`,

      `## Comment choisir son artisan RGE en 2026

L’artisan doit obligatoirement être certifié RGE (Reconnu Garant de l’Environnement) qualification "QB Combles" ou "Qualibat 7141 isolation par l’intérieur" pour ouvrir droit aux aides.

**Vérifications à faire** :
- Validité de la certification RGE sur france-renov.gouv.fr (date d’expiration, périmètre géographique)
- Attestation d’assurance décennale en cours de validité
- Visite technique obligatoire avant devis (jamais de devis par téléphone)
- 3 devis comparés minimum (écart fréquent de 30-50 % à puissance équivalente)

**Sur le devis**, exiger : marque et référence du matériau, R thermique exact, surface traitée, traitement des points singuliers (trémies, conduits), pose de pare-vapeur, durée de garantie matériau (10 ans minimum).

Délais habituels en 2026 : 1-3 semaines en zones rurales, 4-8 semaines en zones tendues (Île-de-France, PACA, métropoles). Se prendre tôt en amont d’un hiver.`,

      `## Notre avis : l’isolation des combles, le meilleur ROI rénovation 2026

L’isolation des combles reste en 2026 la meilleure rénovation énergétique en termes de coût/efficacité : 20 % du budget total d’une rénovation globale pour 25-30 % des économies.

Pour un propriétaire occupant en classe DPE F ou G, c’est aussi le geste prioritaire pour passer en classe E (1ère étape pour échapper aux interdictions de location 2025-2034 si vente locative envisagée).

Maximiser les aides : passer par Mon Accompagnateur Rénov’ si projet > 5 000 € (obligatoire pour Parcours accompagné MaPrimeRénov’). Comparer 3 devis d’artisans RGE locaux. Vérifier l’éligibilité au CEE Coup de pouce isolation (réservé aux modestes/très modestes mais s’ajoute à MPR sans plafond).

Pour estimer instantanément vos aides et obtenir 3 devis d’artisans RGE vérifiés, utilisez notre [simulateur aides rénovation 2026](/simulateur-aides-renovation).`,
    ],
    authorBio:
      'Claire Dubois est rédactrice spécialisée rénovation énergétique chez ServicesArtisans. Son contenu s’appuie sur les barèmes officiels MaPrimeRénov’ 2026, France Rénov’ et l’ADEME.',
    updatedDate: '2026-05-04',
  },

  'prix-chaudiere-condensation-2026': {
    title: 'Prix Chaudière à Condensation 2026 : tarifs gaz, bois, mixtes',
    excerpt:
      'Prix chaudière à condensation 2026 : 3 500 à 9 000 € pose comprise. Aides MPR + CEE possibles uniquement sur bois (gaz exclu depuis 2024). ROI 7-10 ans. Comparatif marques.',
    metaTitle: 'Prix Chaudière Condensation 2026 : Tarifs Gaz/Bois',
    metaDescription:
      'Prix chaudière condensation 2026 : 3 500-9 000 € pose comprise. Comparatif gaz, bois et fioul + aides 2026. Devis 3 artisans.',
    image: '🔥',
    author: 'Marc Lefebvre',
    date: '2026-05-04',
    readTime: '10 min',
    category: 'Tarifs',
    tags: ['chaudière', 'condensation', 'chauffage', 'prix', 'gaz', 'bois'],
    keyTakeaways: [
      'Chaudière gaz à condensation 2026 : 3 500-6 000 € pose comprise. Plus aucune aide d’État depuis 2024 (exclue MaPrimeRénov’ et CEE).',
      'Chaudière biomasse à condensation (granulés, bûches) : 12 000-22 000 € pose comprise. Éligible MaPrimeRénov’ jusqu’à 5 000 € + CEE.',
      'Chaudière fioul à condensation : interdite à l’installation neuve depuis le 1er juillet 2022 (décret n° 2022-8 du 5 janvier 2022).',
      'Rendement chaudière condensation : 105-110 % (calcul basé sur le PCI), 25-30 % d’économie vs chaudière standard.',
      'TVA 5,5 % sur main-d’œuvre + matériel pour les chaudières biomasse uniquement (gaz au taux normal 20 % depuis mars 2025).',
    ],
    faq: [
      {
        question: 'Quel est le prix d’une chaudière gaz à condensation en 2026 ?',
        answer:
          'Prix moyen 2026 : 3 500 à 6 000 € pose comprise pour une chaudière murale 24 kW (maison 100-150 m²). Une chaudière au sol haute puissance ou avec ballon ECS intégré monte à 5 000-9 000 €. Marques principales : Vaillant, Viessmann, Saunier Duval, De Dietrich, Atlantic. Aucune aide d’État disponible depuis 2024 sur le gaz (TVA passée à 20 % en mars 2025).',
      },
      {
        question: 'Quelles aides pour une chaudière biomasse en 2026 ?',
        answer:
          'MaPrimeRénov’ : jusqu’à 5 000 € pour une chaudière à granulés (4 catégories revenus). CEE Coup de pouce chauffage : jusqu’à 4 000 € pour les ménages modestes. TVA réduite 5,5 % sur la fourniture et la pose. Éco-PTZ jusqu’à 30 000 € sans intérêts. Cumul total : reste à charge typique 4 000-8 000 € pour un budget brut 12 000-18 000 €.',
      },
      {
        question: 'Chaudière à condensation ou pompe à chaleur en 2026 ?',
        answer:
          'La PAC est privilégiée si : maison bien isolée (DPE D ou mieux), région tempérée (zones H2/H3), envie de cumul aides max. La chaudière à condensation reste pertinente si : raccordement au réseau de gaz existant, maison ancienne mal isolée (besoin haute température), budget limité. Mais : zéro aide gaz depuis 2024, TVA 20 % depuis 2025, durabilité PAC supérieure (15-20 ans vs 12-15 ans gaz).',
      },
      {
        question: 'Quelle est la durée de vie d’une chaudière à condensation ?',
        answer:
          'Chaudière gaz à condensation : 12-18 ans avec entretien annuel (obligatoire, décret 2009-649 modifié). Chaudière biomasse : 15-20 ans. L’entretien annuel coûte 100-200 € (gaz), 200-350 € (biomasse). Une chaudière mal entretenue perd 15-20 % de rendement après 5 ans et tombe en panne 2-3× plus souvent.',
      },
      {
        question: 'Pourquoi les chaudières gaz ne sont plus aidées en 2026 ?',
        answer:
          'La France suit l’objectif européen de neutralité carbone 2050. Le gaz fossile (méthane) est progressivement retiré des dispositifs d’aide depuis 2022 (sortie MaPrimeRénov’ janvier 2023, sortie CEE Coup de pouce 2024, fin TVA réduite mars 2025). Seules les chaudières biomasse (granulés, bûches), géothermique et PAC restent aidées. Le réseau gaz reste opérationnel mais sans soutien financier au remplacement.',
      },
    ],
    content: [
      `# Prix Chaudière à Condensation en 2026 : tarifs gaz, bois et mixtes

La chaudière à condensation, qui récupère la chaleur des fumées pour atteindre un rendement de 105-110 % (sur PCI), équipe encore 11 millions de logements en France. Mais en 2026, la donne change : plus aucune aide pour le gaz fossile, pression réglementaire montante, et les chaudières biomasse (granulés, bûches) prennent le relais sur le marché aidé.

Voici les prix réels constatés en 2026, les aides disponibles et les arbitrages à faire selon votre situation.`,

      `## Prix par énergie en 2026

**Chaudière gaz murale à condensation 24 kW** : 3 500-6 000 € pose comprise. Modèle standard pour maison 100-150 m². Marques : Vaillant ecoTEC, Viessmann Vitodens 100, Saunier Duval Themaplus.

**Chaudière gaz au sol haute puissance ou avec ballon ECS intégré** : 5 000-9 000 €. Pour maisons grandes (180 m²+), bâtiments collectifs, ou besoin ECS importants. Marques : De Dietrich, Atlantic, Bosch.

**Chaudière biomasse à granulés (pellets) à condensation** : 12 000-22 000 € pose comprise. Inclut : silo de stockage 500-1 000 kg (1 000-3 000 €), évacuation, raccordement. Marques : ÖkoFEN, Fröling, Hargassner.

**Chaudière biomasse à bûches à condensation** : 8 000-15 000 €. Moins automatisée (chargement manuel), nécessite stockage bois (10-15 stères/an).

**Chaudière mixte bois/gaz** : 15 000-25 000 €. Solution hybride pour ménages voulant garder le gaz en appoint. Devient rare en 2026.

**Chaudière fioul à condensation** : INTERDITE à l’installation neuve depuis le 1er juillet 2022 (décret n° 2022-8). Possible uniquement en remplacement à l’identique d’une chaudière fioul existante (rare, démarche complexe).`,

      `## Aides 2026 : qui a droit à quoi

**Chaudière biomasse (granulés ou bûches)** :
- MaPrimeRénov’ : 1 500 € (rose, supérieurs) à 5 000 € (bleu, très modeste) pour granulés.
- CEE Coup de pouce chauffage : 800-4 000 € selon revenus et fournisseur.
- TVA réduite 5,5 % (matériel + pose).
- Éco-PTZ jusqu’à 30 000 € pour le geste seul.
- Cumul total : 7 000-12 000 € d’aides typiques pour ménage modeste, reste à charge 4 000-8 000 €.

**Chaudière gaz à condensation** :
- MaPrimeRénov’ : EXCLUE depuis janvier 2023.
- CEE Coup de pouce chauffage : EXCLU depuis 2024.
- TVA 20 % (taux normal) depuis mars 2025 (avant : 5,5 %).
- Éco-PTZ : possible uniquement en bouquet de travaux (pas pour la chaudière seule).
- Cumul total : 0-500 € (uniquement aides régionales/communales si existantes).

**Chaudière fioul à condensation** :
- Aucune aide (interdite à l’installation neuve depuis juillet 2022).

**Conclusion** : en 2026, l’aide d’État oriente massivement vers la biomasse ou la PAC, le gaz reste accessible mais devient un investissement 100 % à charge du propriétaire.`,

      `## Rendement et économies réelles

**Rendement chaudière à condensation 2026** : 105-110 % sur PCI (rendement supérieur à 100 % grâce à la récupération de chaleur des fumées). Vs chaudière standard non-condensation : 80-90 %.

**Économie annuelle vs chaudière ancienne (> 15 ans)** :
- Remplacement chaudière gaz standard → condensation : -25 à -30 % de consommation soit 300-700 €/an pour une maison 100-150 m².
- Remplacement chaudière fioul → biomasse : -50 à -60 % de coût énergétique soit 800-1 500 €/an (le bois est moins cher à la calorie).
- Remplacement chaudière fioul → gaz condensation : -15 à -25 % de coût mais -40 % de CO2.

**Amortissement** :
- Gaz condensation 2026 (sans aide) : 7-12 ans.
- Biomasse à granulés (avec aides max) : 5-8 ans.
- Biomasse à bûches : 8-12 ans (moins automatique mais combustible le moins cher).`,

      `## Choisir entre gaz, bois et PAC en 2026

**Privilégier le gaz à condensation si** :
- Raccordement gaz de ville existant.
- Maison ancienne mal isolée (DPE F ou G) avec radiateurs haute température (la PAC perd en rendement).
- Budget travaux serré (3 500-6 000 € de devis brut sans aide).
- Pas de place pour stockage bois ou unité extérieure PAC.

**Privilégier la biomasse (granulés) si** :
- Ménage modeste/très modeste (aides massives jusqu’à 9 000 €).
- Place pour silo de granulés (3-5 m² accessible camion).
- Volonté énergie renouvelable + label bas carbone.
- Maison 80-200 m² (rendement optimal).

**Privilégier la PAC air-eau si** :
- Maison correctement isolée (DPE D ou mieux).
- Radiateurs basse température ou plancher chauffant.
- Région tempérée (zones H2/H3 : Sud, Centre, Ouest).
- Cumul aides max (MPR jusqu’à 5 000 €, CEE jusqu’à 4 000 €).

**Cas hybride (bois + gaz appoint)** : pertinent pour les très grandes maisons (250 m²+) en zone H1 (Nord, Est) où les pics de froid justifient le gaz en complément du bois.`,

      `## Pose et entretien 2026

**Pose chaudière gaz à condensation** : 1-2 jours. Inclut : dépose ancienne chaudière, installation neuve, raccordement gaz/eau/évacuation des condensats (eau acide, conduit PVC obligatoire), mise en service.

**Pose chaudière biomasse** : 3-5 jours. Plus complexe : silo, vis sans fin pour acheminement granulés, conduit fumée résistant aux hautes températures (Inox 904L), évacuation cendres.

**Entretien annuel obligatoire** (décret 2009-649) : à la charge du locataire (location) ou propriétaire (occupant). Coût : 100-200 € (gaz), 200-350 € (biomasse). Inclut : vérification combustion, nettoyage échangeur, contrôle sécurité, mesure des fumées.

**Garantie matériel** : 2-5 ans constructeur, extensible à 7-10 ans avec contrat. La carte électronique est la pièce la plus chère à remplacer (300-700 €), suivie du brûleur (200-500 €).`,

      `## Pièges et arnaques 2026

**1. Le démarchage téléphonique gaz "remplacement gratuit"** : illégal depuis juillet 2020. Les "chaudières à 1 €" n’existent plus depuis 2021. Aucune aide d’État sur le gaz en 2026 : toute promesse de "gratuité" cache une majoration du devis.

**2. La sous-dimension de puissance** : une chaudière sous-dimensionnée tourne à 100 % en permanence, perd 15-20 % de rendement et casse 2× plus vite. Calcul puissance recommandée : 50-100 W/m² selon isolation et zone climatique.

**3. L’oubli du désembouage** : un circuit de chauffage encrassé après 10-15 ans dégrade les performances. Désembouage à prévoir lors du remplacement (200-500 €).

**4. Le conduit fumée non conforme** : la condensation produit de l’eau acide qui détruit les conduits inox standard en 2-5 ans. Exiger un conduit PVC ou polypropylène certifié pour condensation.

**5. Les "chaudières électriques à condensation"** : marketing trompeur, aucun produit ne combine résistance électrique et condensation des fumées.`,

      `## Notre avis 2026 : la chaudière à condensation reste-t-elle un bon choix ?

**OUI pour la biomasse à granulés** : aides massives, énergie locale renouvelable, ROI 5-8 ans, prix granulés stable (350-400 €/tonne en 2026, vs 1 000-1 200 €/an pour chauffer une maison 100 m²).

**MITIGÉ pour le gaz à condensation** : zéro aide, TVA 20 %, prix gaz volatil (+30-50 % entre 2021 et 2024), pression réglementaire qui monte. À considérer uniquement si raccordement existant + maison mal isolée + budget initial serré.

**NON pour le fioul** : interdit à l’installation neuve depuis 2022. Toute chaudière fioul existante devra être remplacée à terme (par PAC, biomasse ou gaz si raccordement disponible).

Pour estimer instantanément vos aides 2026 (biomasse ou PAC) et obtenir 3 devis d’artisans RGE QualiBois ou QualiPAC vérifiés, utilisez notre [simulateur aides rénovation 2026](/simulateur-aides-renovation).`,
    ],
    authorBio:
      'Marc Lefebvre est ingénieur thermicien et rédacteur spécialisé chauffage chez ServicesArtisans. Son contenu s’appuie sur les barèmes officiels MaPrimeRénov’ 2026 et la veille réglementaire France Rénov’.',
    updatedDate: '2026-05-04',
  },

  'prix-poele-granules-2026': {
    title: 'Prix Poêle à Granulés 2026 : tarifs, aides et choix de marque',
    excerpt:
      'Prix poêle à granulés 2026 : 3 000-7 000 € pose comprise. Aides cumulables jusqu’à 4 000 € (MPR + CEE). Comparatif marques (Edilkamin, MCZ, Rika), rendement et autonomie.',
    metaTitle: 'Prix Poêle à Granulés 2026 : Tarifs + Aides',
    metaDescription:
      'Prix poêle à granulés 2026 : 3 000-7 000 € posé. Comparatif marques + aides MPR/CEE jusqu’à 4 000 €. Devis 3 artisans RGE.',
    image: '🔥',
    author: 'Jean-Pierre Duval',
    date: '2026-05-04',
    readTime: '9 min',
    category: 'Tarifs',
    tags: ['poêle', 'granulés', 'pellets', 'chauffage', 'prix', 'biomasse'],
    keyTakeaways: [
      'Poêle à granulés étanche 2026 : 3 000-7 000 € pose comprise selon puissance (6-12 kW) et marque.',
      'Modèle hydraulique (raccordable chauffage central + ECS) : 6 000-12 000 €.',
      'Aides cumulables 2026 : MaPrimeRénov’ jusqu’à 2 500 € + CEE jusqu’à 1 500 € + TVA 5,5 %.',
      'Rendement poêle à granulés 2026 : 88-95 % (label Flamme Verte 7 étoiles minimum).',
      'Coût combustible : 350-400 €/tonne, soit 600-1 200 €/an pour une maison 80-120 m² en chauffage principal.',
    ],
    faq: [
      {
        question: 'Quel est le prix moyen d’un poêle à granulés en 2026 ?',
        answer:
          'Pour un poêle à granulés étanche standard 8-10 kW (chauffe une pièce principale + diffusion 80-120 m²), comptez 3 000-5 500 € pose comprise. Modèle haut de gamme avec programmation Wi-Fi et silencieux : 4 500-7 000 €. Modèle hydraulique (raccordement chauffage central) : 6 000-12 000 €. Marques principales : Edilkamin, MCZ, Rika, Palazzetti, Olsberg.',
      },
      {
        question: 'Quelles aides pour un poêle à granulés en 2026 ?',
        answer:
          'MaPrimeRénov’ : 1 000 € (rose) à 2 500 € (bleu très modeste). CEE Coup de pouce chauffage : 500-1 500 € selon fournisseur. TVA réduite 5,5 % (matériel + pose). Éco-PTZ possible. Cumul total typique : 2 500-4 000 € d’aides pour ménage modeste, reste à charge 1 500-3 000 €.',
      },
      {
        question: 'Quelle puissance choisir pour mon logement ?',
        answer:
          'Règle 100 W/m² en moyenne : maison isolée 60 m² = 6 kW, maison 100 m² = 8-10 kW, maison 150 m² = 10-12 kW. En chauffage d’appoint d’un salon (40-60 m²), un 6-8 kW suffit. En chauffage principal d’une maison entière, privilégier un modèle canalisable (diffusion via gaines vers d’autres pièces) ou hydraulique (raccordé radiateurs).',
      },
      {
        question: 'Quel est le coût annuel des granulés en 2026 ?',
        answer:
          'Prix moyen granulés 2026 : 350-400 €/tonne en sac 15 kg (palette de 1 tonne livrée), 280-330 €/tonne en vrac (livraison camion souffleur, mini 2 tonnes). Consommation moyenne : 1,5-2,5 tonnes/an pour une maison 80-120 m² en chauffage principal, soit 600-1 200 €/an. À comparer aux 1 200-2 500 €/an du gaz ou de l’électricité pour la même surface.',
      },
      {
        question: 'Poêle à granulés ou chaudière à granulés ?',
        answer:
          'Poêle à granulés (3 000-7 000 €) : chauffe 80-120 m² depuis une pièce principale, idéal en complément ou en chauffage principal d’une maison ouverte. Chaudière à granulés (12 000-22 000 €) : alimente le circuit de chauffage central + ECS, idéal pour grande maison (150 m²+) ou si chauffage central existant à remplacer. La chaudière offre plus d’aides (jusqu’à 5 000 € MPR vs 2 500 € pour le poêle).',
      },
    ],
    content: [
      `# Prix Poêle à Granulés en 2026 : tarifs, aides et choix de marque

Le poêle à granulés (ou poêle à pellets) s’est imposé en France comme la solution chauffage biomasse la plus accessible : 200 000 unités installées chaque année depuis 2022, devant les inserts à bois et les chaudières biomasse.

En 2026, son prix reste stable (3 000-7 000 € posé), les aides MaPrimeRénov’ + CEE permettent un reste à charge inférieur à 3 000 € pour les ménages modestes, et le coût du combustible (granulés à 350-400 €/tonne) reste compétitif face au gaz et à l’électricité. Voici les prix réels et le guide d’achat 2026.`,

      `## Prix par type de poêle à granulés 2026

**Poêle à granulés étanche standard 6-10 kW** : 3 000-5 500 € pose comprise. Modèle de base ou intermédiaire, suffisant pour chauffer 80-120 m² depuis le salon. Marques : Edilkamin, MCZ, Palazzetti.

**Poêle à granulés haut de gamme 8-12 kW (programmable, silencieux, design)** : 4 500-7 000 €. Fonctions Wi-Fi, télécommande, mode silence (28-32 dB), réservoir étendu (30-50 kg granulés = autonomie 3-5 jours). Marques : Rika, Hoxter, Wodtke.

**Poêle à granulés canalisable** : 4 500-8 000 €. Permet de diffuser l’air chaud vers 1-3 pièces supplémentaires via gaines isolées. Idéal maison à plusieurs niveaux ou pièces fermées.

**Poêle à granulés hydraulique (raccordable au chauffage central)** : 6 000-12 000 €. Chauffe l’eau pour radiateurs + ECS. Devient une mini-chaudière biomasse, alternative économique à une chaudière complète.

**Poêle à granulés contemporain (design, façade vitrée 4 faces)** : 6 000-10 000 €. Modèles "déco" pour intégration salon haut de gamme.

**Pose** : 800-1 800 € selon configuration (conduit fumée existant ou non, distance murs, traversée plafond/toit). Conduit obligatoirement double paroi isolé (norme NF DTU 24.1).`,

      `## Aides 2026 cumulables

**MaPrimeRénov’ (geste poêle à granulés)** : 1 000 € (rose, supérieurs) à 2 500 € (bleu, très modeste). Plafond travaux retenu : 4 000 €.

**CEE Coup de pouce chauffage** : 500-1 500 € selon fournisseur (TotalEnergies, Engie, Sonergia) et profil revenus.

**TVA réduite 5,5 %** : applicable sur matériel + pose pour tout logement de plus de 2 ans.

**Éco-PTZ** : prêt à taux zéro jusqu’à 15 000 € pour le geste seul, jusqu’à 50 000 € en bouquet de travaux. Sans condition de revenus.

**Aides locales** : certaines régions (Hauts-de-France, Bretagne, Auvergne-Rhône-Alpes), départements et intercommunalités proposent des aides complémentaires (200-1 000 €). À vérifier sur france-renov.gouv.fr ou auprès de votre conseiller France Rénov’.

**Cumul typique** : ménage modeste avec poêle 5 000 € → MPR 1 800 € + CEE 1 200 € + aide régionale 500 € = 3 500 € d’aides, reste à charge 1 500 €.`,

      `## Choix de la marque : comparatif 2026

**Edilkamin (Italie)** : le n° 1 du marché français. Très large gamme (3 000-8 000 €), excellent SAV, pièces détachées disponibles 10+ ans. Modèles phares : Edilkamin Sirio, Tally, Cherie.

**MCZ (Italie)** : haut de gamme design, modèles silencieux, programmation avancée. Prix 4 000-9 000 €. Modèles : MCZ Curve, Halo, Vivo.

**Rika (Autriche)** : top qualité, technologie de combustion (rendement 92-95 %), garantie 5 ans. Prix 5 500-12 000 €. Modèles : Rika Domo, Roco, Como.

**Palazzetti (Italie)** : excellent rapport qualité-prix, design contemporain, durabilité prouvée. Prix 3 500-7 500 €. Modèles : Ecomonoblocco, Adagio.

**Hoxter (Allemagne)** : très haut de gamme, finition irréprochable, prix 7 000-15 000 €. Cible : maisons d’architecte, intégration sur-mesure.

**Wodtke (Allemagne)** : technologie avancée (combustion propre 7 étoiles Flamme Verte). Prix 5 000-10 000 €.

**Critères de choix** : vérifier le label Flamme Verte 7 étoiles (obligatoire pour MPR depuis 2022), le rendement (≥ 90 %), l’émission de particules (< 30 mg/Nm3), la disponibilité du SAV en France (Italie/Allemagne dominent).`,

      `## Coût d’usage : combustible et entretien 2026

**Prix granulés 2026** :
- Sac 15 kg en magasin : 5,50-7,50 € soit 370-500 €/tonne.
- Palette 1 tonne (66 sacs livrés) : 350-400 €/tonne.
- Vrac soufflé (livraison camion mini 2 tonnes) : 280-330 €/tonne. Économie ~80-100 €/tonne mais nécessite silo accessible.

**Consommation annuelle (chauffage principal)** :
- Maison 60 m² isolée : 1,2-1,8 tonne/an = 480-720 €.
- Maison 80-100 m² isolée : 1,5-2,2 tonnes/an = 600-880 €.
- Maison 120-150 m² isolée : 2,0-2,8 tonnes/an = 800-1 120 €.
- Maison 150-200 m² isolée : 2,5-3,5 tonnes/an = 1 000-1 400 €.

**Économie vs autres énergies (maison 100 m²)** :
- Gaz naturel (avec contrat 2026) : 1 200-1 800 €/an → granulés 600-880 € = économie 30-50 %.
- Fioul : 1 800-2 800 €/an → économie 60-70 %.
- Électricité chauffage direct : 1 800-3 000 €/an → économie 50-65 %.

**Entretien annuel** : ramonage 2 fois/an obligatoire (60-100 € chaque), entretien moteur/électronique annuel (150-250 €). Total ~300-450 €/an. Indispensable pour maintenir rendement et garantie.`,

      `## Installation : ce qu’il faut savoir

**Conduit de fumée** : double paroi isolée certifiée NF DTU 24.1. Si conduit existant : tubage obligatoire en inox 904L (résiste aux acides de combustion granulés). Coût tubage : 600-1 500 € selon hauteur.

**Sortie en toiture** : obligatoire à 40 cm minimum au-dessus du faîtage et 8 m du voisin. Sortie ventouse (façade) : tolérée si maison ≤ 2 niveaux et règlement copropriété/PLU le permet.

**Arrivée d’air comburant** : obligatoire en raccordement direct extérieur pour les modèles étanches (norme RT 2012 et RE 2020). Évite l’aspiration de l’air chauffé du logement.

**Alimentation électrique** : prise standard 230 V, consommation moyenne 100-200 W (allumage + ventilateurs). Pas de raccordement spécifique.

**Distance aux matériaux combustibles** : 80 cm minimum à l’avant (rayonnement vitre), 30 cm sur les côtés et l’arrière (sauf modèle isolé renforcé).

**Délai pose** : 1-2 jours pour pose complète + raccordement. Compter 4-8 semaines de délai en haute saison (septembre-novembre).`,

      `## Pièges à éviter en 2026

**1. Le poêle "premier prix" sans label** : poêles à 1 500-2 500 € importés non certifiés Flamme Verte 7 étoiles → ZÉRO aide MPR/CEE, rendement 75-85 % (vs 90-95 % pour modèle aidé), pollution 2-3× supérieure.

**2. La pose par non-RGE QualiBois** : obligatoire pour MPR/CEE. Vérifier la certification sur france-renov.gouv.fr. Une pose non-RGE annule droit aux aides.

**3. La sous-dimension** : un poêle 6 kW dans une maison 130 m² tournera à 100 % en hiver, s’usera prématurément. Toujours calculer 80-100 W/m².

**4. L’oubli du tubage de conduit** : un conduit non tubé pour granulés se dégrade en 1-3 ans (acides de combustion). Coût rénovation : 600-1 500 € évitables si tubage prévu d’emblée.

**5. La mauvaise qualité des granulés** : utiliser uniquement des granulés certifiés DIN+ ou EN+ A1 (taux d’humidité < 10 %, taux de cendres < 0,7 %). Granulés bas de gamme : encrassement rapide, pannes, perte de garantie.`,

      `## Notre avis 2026 : le poêle à granulés, le meilleur ROI biomasse pour <120 m²

Le poêle à granulés reste en 2026 la solution biomasse la plus accessible : investissement 1 500-3 000 € après aides, économie chauffage 30-70 % vs gaz/fioul/élec, ROI 4-7 ans.

**Privilégier le poêle à granulés si** : maison ≤ 120 m² ouverte (salon + pièces communicantes), envie d’un chauffage d’appoint puissant en complément d’une PAC, budget initial limité (vs chaudière à 12 000 €).

**Privilégier la chaudière à granulés si** : maison > 150 m², radiateurs ou plancher chauffant existant, budget aides max disponible (jusqu’à 5 000 € MPR).

**Privilégier l’insert à bois bûches si** : disponibilité bois local gratuit/économique, envie chauffage convivial, budget combustible serré (bûches 100-150 €/m³ vs granulés 350-400 €/tonne).

Pour estimer instantanément vos aides 2026 et obtenir 3 devis d’artisans RGE QualiBois vérifiés, utilisez notre [simulateur aides rénovation 2026](/simulateur-aides-renovation).`,
    ],
    authorBio:
      'Jean-Pierre Duval est expert chauffage biomasse chez ServicesArtisans. Son contenu s’appuie sur les barèmes officiels MaPrimeRénov’ 2026, France Rénov’ et la documentation Flamme Verte.',
    updatedDate: '2026-05-04',
  },

  'prix-audit-energetique-2026': {
    title: 'Prix Audit Énergétique 2026 : tarifs maison, copro, et qui le paye',
    excerpt:
      'Prix audit énergétique 2026 : 500-1 500 € pour maison individuelle, 6-12 € HT/lot pour copro. Obligatoire vente F/G/E + MaPrimeRénov’ Parcours accompagné. Aide MPR jusqu’à 500 €.',
    metaTitle: 'Prix Audit Énergétique 2026 : Tarifs et Aides',
    metaDescription:
      'Prix audit énergétique 2026 : 500-1 500 € maison + aides MPR jusqu’à 500 €. Obligatoire vente F/G/E. Devis 3 auditeurs.',
    image: '📊',
    author: 'Sophie Martin',
    date: '2026-05-04',
    readTime: '9 min',
    category: 'Tarifs',
    tags: ['audit énergétique', 'DPE', 'prix', 'rénovation énergétique', 'MaPrimeRénov’'],
    keyTakeaways: [
      'Audit énergétique maison individuelle 2026 : 500-1 500 € selon surface et complexité.',
      'Audit copropriété : 6-12 € HT/lot, soit 600-2 400 € pour une copro de 100 lots.',
      'Aide MaPrimeRénov’ Audit : 300 € (rose) à 500 € (très modestes), pour audit volontaire ou obligatoire.',
      'Obligatoire pour : vente maison F/G (depuis 2023), vente E (depuis 2025), MPR Parcours accompagné > 5 000 €.',
      'À ne pas confondre avec le DPE (100-250 €) : l’audit propose 2 scénarios chiffrés de travaux pour gagner ≥ 2 classes DPE.',
    ],
    faq: [
      {
        question: 'Quel est le prix moyen d’un audit énergétique en 2026 ?',
        answer:
          'Pour une maison individuelle 100-150 m², comptez 800-1 200 € TTC en moyenne. Maison < 100 m² : 600-900 €. Grande maison ou complexe (> 200 m², plusieurs niveaux, dépendances) : 1 200-1 500 €. Audit copropriété : 6-12 € HT par lot soit 600-2 400 € pour 100 lots. Le prix inclut visite sur site, calculs thermiques 3CL-2021, rapport PDF avec 2 scénarios chiffrés et présentation orale.',
      },
      {
        question: 'Quand l’audit énergétique est-il obligatoire en 2026 ?',
        answer:
          'Trois cas : (1) vente d’une maison individuelle classée F ou G (depuis avril 2023, décret n° 2022-780), (2) vente classée E (depuis janvier 2025), (3) demande de MaPrimeRénov’ Parcours accompagné pour travaux > 5 000 € (depuis 2022). À noter : l’audit est obligatoire pour la vente même si elle ne déclenche pas de travaux. C’est un document d’information pour l’acheteur.',
      },
      {
        question: 'Quelle différence entre DPE et audit énergétique ?',
        answer:
          'DPE (100-250 €) : note A-G + recommandations génériques. Validité 10 ans. Réalisé en 1-2 h par diagnostiqueur certifié. Audit énergétique (500-1 500 €) : analyse thermique approfondie + 2 scénarios chiffrés détaillés (matériau, prix, performance, aides) pour gagner ≥ 2 classes DPE et atteindre la classe B minimum (Parcours accompagné). Validité 5 ans. Réalisé en 4-6 h sur site par auditeur agréé.',
      },
      {
        question: 'Quelles aides pour financer l’audit énergétique en 2026 ?',
        answer:
          'MaPrimeRénov’ Audit : 300 € (rose, supérieurs) à 500 € (bleu, très modeste). Versée au propriétaire après réalisation, sans condition de travaux à faire. Cumulable avec aides régionales (jusqu’à 500 € supplémentaires en Hauts-de-France, Île-de-France, Auvergne-Rhône-Alpes). Si l’audit est obligatoire pour vente, le coût est fiscalement déductible (revenus fonciers ou plus-value selon cas).',
      },
      {
        question: 'Qui peut réaliser un audit énergétique réglementaire ?',
        answer:
          'Trois profils agréés : (1) bureaux d’études thermiques certifiés OPQIBI 1905 ou équivalent, (2) architectes ayant suivi formation spécifique (signature obligatoire), (3) entreprises RGE certifiées "audit énergétique" (Qualibat 8731). Annuaire officiel sur france-renov.gouv.fr. Méfiance envers les "audits" gratuits qui sont du démarchage déguisé : un audit conforme exige 4-6 h sur site et coûte 500 €+ minimum.',
      },
    ],
    content: [
      `# Prix Audit Énergétique en 2026 : tarifs maison, copro et qui le paye

L’audit énergétique est devenu en 2026 un document central de la transition énergétique du bâtiment français : obligatoire pour la vente des passoires thermiques (F/G depuis 2023, E depuis 2025), prérequis pour MaPrimeRénov’ Parcours accompagné (> 5 000 € de travaux), et conseillé avant toute rénovation globale.

À ne pas confondre avec le DPE (qui est une simple notation A-G), l’audit propose 2 scénarios chiffrés de travaux permettant de gagner au moins 2 classes DPE et atteindre la classe B minimum. Voici les prix réels 2026, les aides disponibles et les arbitrages à faire.`,

      `## Prix d’un audit énergétique 2026

**Maison individuelle < 100 m²** : 600-900 € TTC. Maison standard, 1 niveau, isolation et chauffage classiques. Visite 3-4 h, rapport 25-40 pages.

**Maison individuelle 100-150 m²** : 800-1 200 € TTC. Le cas le plus fréquent (60 % des audits). Visite 4-5 h, rapport 30-50 pages avec 2 scénarios.

**Maison individuelle 150-250 m²** : 1 000-1 400 € TTC. Plusieurs niveaux, plusieurs systèmes de chauffage, dépendances. Visite 5-6 h.

**Maison > 250 m² ou complexe** : 1 200-2 000 € TTC. Maisons d’architecte, dépendances multiples, contraintes patrimoniales (secteur sauvegardé), plusieurs zones climatiques.

**Copropriété (audit énergétique réglementaire)** : 6-12 € HT/lot soit 600-1 200 € pour 100 lots, 1 200-2 400 € pour 200 lots. Inclut audit thermique parties communes + recommandations travaux + plan pluriannuel de travaux (PPT) si requis.

**Copropriété — DPE collectif (à ne pas confondre)** : 4-8 € HT/lot. Moins approfondi que l’audit, donne uniquement la note A-G du bâtiment.

**Audit énergétique pour Parcours accompagné MPR seul** : 700-1 200 € TTC. Inclut le suivi par Mon Accompagnateur Rénov’ (souvent partiellement pris en charge si très modeste).`,

      `## Quand l’audit est-il obligatoire en 2026

**Vente d’une maison individuelle F ou G** : OBLIGATOIRE depuis le 1er avril 2023 (décret n° 2022-780). Le rapport doit être annexé au compromis de vente. Vendeur paye.

**Vente d’une maison individuelle E** : OBLIGATOIRE depuis le 1er janvier 2025 (extension du décret 2022-780). Vendeur paye.

**Vente d’un appartement F/G en monopropriété** : NON obligatoire (audit collectif copro suffit si existant), MAIS vivement recommandé.

**MaPrimeRénov’ Parcours accompagné** : OBLIGATOIRE depuis 2022 pour tout dossier > 5 000 € de travaux. L’audit doit identifier 2 scénarios permettant de gagner ≥ 2 classes DPE.

**Copropriétés > 200 lots construites avant 2013** : DPE collectif OBLIGATOIRE depuis 2024.

**Copropriétés 51-200 lots** : DPE collectif OBLIGATOIRE depuis 2025.

**Copropriétés ≥ 50 lots** : DPE collectif OBLIGATOIRE depuis 2028 (toutes copropriétés à terme).

**Hors obligations** : audit volontaire conseillé avant toute rénovation > 10 000 €, ou pour anticiper l’interdiction de location d’une passoire (G en 2025, F en 2028, E en 2034).`,

      `## Aides 2026 pour financer l’audit énergétique

**MaPrimeRénov’ Audit (volontaire ou obligatoire)** :
- Très modestes (bleu) : 500 €
- Modestes (jaune) : 400 €
- Intermédiaires (violet) : 300 €
- Supérieurs (rose) : 0 € (depuis 2024)

L’aide est versée au propriétaire après réalisation, sans condition d’engagement de travaux. Le rapport doit respecter le cahier des charges réglementaire (méthode 3CL-2021, 2 scénarios, présentation orale).

**Aides régionales et locales** :
- Hauts-de-France : jusqu’à 500 € via le pacte régional rénovation.
- Île-de-France : 200-500 € selon dispositif.
- Auvergne-Rhône-Alpes, Grand Est, Occitanie : aides ponctuelles 200-400 €.
- Certaines intercommunalités (métropoles surtout) ajoutent 100-300 €.

**TVA réduite 5,5 %** : applicable sur l’audit énergétique éligible MPR.

**Déductibilité fiscale** :
- Bailleurs : audit déductible des revenus fonciers (réduction d’impôt en année N+1).
- Vendeurs : audit déductible de la plus-value imposable (si non-résidence principale).

**Cumul typique** : ménage très modeste (audit 1 000 € TTC) → MPR 500 € + aide régionale 300 € = 800 € d’aides, reste à charge 200 €.`,

      `## DPE vs audit énergétique : quelle différence concrètement

**DPE (Diagnostic de Performance Énergétique)** :
- Coût : 100-250 € TTC.
- Durée : visite 1-2 h sur site.
- Réalisateur : diagnostiqueur certifié COFRAC (annuaire officiel sur diagnostiqueurs.application.developpement-durable.gouv.fr).
- Contenu : note A-G + étiquette GES + recommandations génériques de travaux (sans chiffrage précis).
- Obligatoire pour : toute vente ou location.
- Validité : 10 ans (depuis 1er juillet 2021).
- Opposable juridiquement : OUI depuis 2021.

**Audit énergétique réglementaire** :
- Coût : 500-1 500 € TTC.
- Durée : visite 4-6 h sur site + 5-10 h de calculs et rédaction.
- Réalisateur : bureau d’études thermique OPQIBI 1905, architecte formé, ou entreprise RGE Qualibat 8731.
- Contenu : analyse thermique détaillée + 2 scénarios chiffrés de travaux (matériau, prix, gain énergétique, aides cumulables, ROI) + présentation orale.
- Obligatoire pour : vente F/G/E maison individuelle + MPR Parcours accompagné.
- Validité : 5 ans.
- Opposable juridiquement : OUI.

**À retenir** : le DPE classe le logement, l’audit propose un plan d’action chiffré pour le sortir de la classe passoire et accéder aux aides max.`,

      `## Comment se déroule un audit énergétique 2026

**Étape 1 — Prise de contact et devis (J-15 à J-7)** : visite préalable possible (gratuite ou ~50 €), envoi devis détaillé (mention obligatoire : méthode 3CL-2021, nombre de scénarios, durée visite, livrables PDF + oral).

**Étape 2 — Visite sur site (J0)** : 4-6 h. L’auditeur relève : surface habitable précise (mesure), isolation toiture/murs/planchers (épaisseurs et matériau), menuiseries (type vitrage, étanchéité air), système de chauffage (modèle, âge, rendement), production ECS, ventilation, exposition (orientation, masques solaires), photos justificatives.

**Étape 3 — Calcul thermique (J+5 à J+15)** : modélisation du bâtiment méthode 3CL-2021, simulation de 2 scénarios de travaux distincts (par exemple : isolation toiture + PAC ; vs isolation murs + chaudière biomasse + VMC double flux). Pour chaque scénario : gain de classe DPE, coût HT et TTC, aides cumulables, reste à charge, ROI années.

**Étape 4 — Restitution écrite (J+15 à J+21)** : rapport PDF 30-50 pages incluant photos, plans cotés, fiches matériaux, devis indicatifs, plannings travaux.

**Étape 5 — Présentation orale (J+15 à J+30)** : RDV de 1 h en visio ou présentiel. L’auditeur explique les scénarios, répond aux questions, oriente vers Mon Accompagnateur Rénov’ si Parcours accompagné envisagé.`,

      `## Pièges et arnaques à éviter en 2026

**1. L’audit "gratuit" via démarchage** : illégal depuis juillet 2020 (interdiction démarchage rénovation énergétique). Tout audit gratuit est en réalité un acte de prospection commerciale visant à pousser des travaux non optimisés. Le RAR dépasse souvent 50 % du devis brut.

**2. L’audit non conforme à la réglementation** : seul un audit réalisé par OPQIBI 1905 / architecte habilité / Qualibat 8731 est valable pour MPR ou vente. Vérifier la qualification sur france-renov.gouv.fr.

**3. Le rapport sans 2 scénarios** : un audit conforme propose OBLIGATOIREMENT 2 scénarios distincts. Un seul scénario = audit non valable pour MPR Parcours accompagné.

**4. L’absence de visite physique** : un audit ne peut PAS être réalisé sur plans uniquement. La visite sur site est obligatoire (4-6 h pour relevés et photos).

**5. Le coût excessif** : au-delà de 1 500-2 000 € pour une maison standard, demandez plusieurs devis. Certains auditeurs facturent 2 500-3 500 € sans justification, profitant de l’urgence MPR.`,

      `## Notre avis 2026 : faire un audit avant ou après devis travaux ?

**AVANT toute rénovation > 5 000 €** : OUI, c’est obligatoire pour MPR Parcours accompagné. L’audit oriente correctement les choix techniques et évite les erreurs coûteuses (par exemple : isoler les combles avant le chauffage, jamais l’inverse).

**AVANT vente d’une passoire F/G/E** : OUI, c’est obligatoire depuis 2023/2025. L’audit donne au vendeur un argumentaire chiffré pour négocier la décote et à l’acheteur une visibilité sur les travaux à prévoir.

**AVANT achat d’une passoire** : RECOMMANDÉ. Demandez à l’acheteur de vous fournir l’audit obligatoire (vous y avez droit). Si non disponible : 800-1 200 € c’est un investissement minime sur une opération de 200 000 €+ qui peut éviter des surprises massives.

**HORS obligation, projet < 5 000 €** : NON, le DPE suffit + diagnostic visuel par artisan RGE.

Pour estimer instantanément vos aides 2026 (audit + travaux) et obtenir 3 devis d’auditeurs énergétiques agréés OPQIBI ou Qualibat 8731, utilisez notre [simulateur aides rénovation 2026](/simulateur-aides-renovation).`,
    ],
    authorBio:
      'Sophie Martin est experte rénovation énergétique chez ServicesArtisans. Son contenu s’appuie sur les barèmes officiels MaPrimeRénov’ 2026, France Rénov’, le décret n° 2022-780 et l’arrêté du 28 février 2023 sur l’audit énergétique réglementaire.',
    updatedDate: '2026-05-04',
  },
}
