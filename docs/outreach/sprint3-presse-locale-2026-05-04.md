# Outreach Sprint 3 — Presse locale & blogs rénovation

**Date** : 2026-05-04
**Sprint** : 3 (résiduel) — audit `STRATEGIE-RENOVATION-ENERGETIQUE.md` ligne 241
**Action** : _« Link building : presse locale + blogs rénovation »_
**Statut** : kit prêt à exécuter (aucune action automatisée — outreach humain).

---

## Stratégie

L'outreach **Tier-1 BTP nationale** (LeMoniteur, BatiActu, Capital, Les Echos) est traité dans `tier-1-btp-2026-05-03.md`. Ce kit cible **la presse régionale** : les rédactions locales ont fortement besoin de data territoriales fraîches sur la rénovation énergétique (passoires thermiques, MaPrimeRénov', PAC) car c'est un sujet à fort intérêt lecteur local mais peu sourcé chez eux.

**Hook unique** : 13 datasets régionaux ServicesArtisans + 49 K artisans RGE géolocalisés en open-data CC-BY 4.0. C'est une matière première qu'aucun confrère ne fournit librement réutilisable.

**Cible** : 1 backlink Tier 2-3 par région (DR 30-60) sur 13 régions = +13 refdomains autorité moyenne en M+3.

---

## Matrice presse locale par région

Format pour chaque région : `Média principal (DR estimé) → angle + lien dataset`. Les angles sont à composer comme « data spécifique à la région » plutôt que « pitch corporate ».

### Île-de-France

- **Le Parisien** (DR 86) — rubrique « Habitat » ou « Économie locale »
  - Angle : _« Combien d'artisans RGE dans chaque arrondissement de Paris et au-delà du périph ? »_
  - Dataset : `/datasets/rge` filtré dept 75 / 92 / 93 / 94 / 77 / 78 / 91 / 95
  - Email générique : `redaction@leparisien.fr` ; rubrique habitat : chercher sur LinkedIn « journaliste habitat Le Parisien 2026 »
- **20 Minutes Paris** (DR 88) — section locale Paris
  - Angle : _« Carte des aides MaPrimeRénov' région IDF — l'écart Éco-rénovons Paris+ vs proche couronne »_
  - Dataset : `/datasets/cee-regional-aids` (IDF zone H1a)

### Auvergne-Rhône-Alpes

- **Le Progrès** (DR 78) — édition Lyon / Saint-Étienne / Grenoble
  - Angle : _« Pourquoi la zone climatique H1c offre les forfaits CEE chauffage les plus élevés de France »_
  - Email : `internet@leprogres.fr`
- **Le Dauphiné Libéré** (DR 79) — édition Isère / Savoie / Haute-Savoie
  - Angle : _« Aides régionales montagne : Auvergne-Rhône-Alpes finance le bois-énergie jusqu'à 4 000 € »_
  - Dataset : `/datasets/cee-regional-aids` (ARA + dispositifs régionaux montagne)

### Provence-Alpes-Côte d'Azur

- **La Provence** (DR 73) — rubrique économie / habitat
  - Angle : _« Comment la zone H3 méditerranéenne change la donne MaPrimeRénov' à Marseille »_
  - Dataset : `/datasets/cee-regional-aids` (PACA zone H3) + `/datasets/rge` filtré 13/06/83/84
- **Nice-Matin** (DR 74) — local Nice / Cannes / Antibes
  - Angle : _« Rénovation énergétique 06 : les vrais chiffres derrière la PAC réversible plébiscitée sur la Côte »_

### Occitanie

- **La Dépêche du Midi** (DR 75) — local Toulouse + Sud-Ouest
  - Angle : _« Aides régionales Occitanie pour la rénovation : 2 dispositifs cumulables avec MPR »_
- **Midi Libre** (DR 73) — local Montpellier / Nîmes / Béziers
  - Angle : _« Les passoires thermiques en Occitanie : ce que change l'interdiction G 2025 »_

### Nouvelle-Aquitaine

- **Sud-Ouest** (DR 80) — Bordeaux / La Rochelle / Bayonne
  - Angle : _« Carte des artisans RGE en Nouvelle-Aquitaine : zone H2c, intermédiaire entre Bretagne et PACA »_
- **La Charente Libre** (DR 51) — Angoulême
  - Angle : _« Pour quelques milliers d'euros : le coût réel d'un Mon Accompagnateur Rénov' en Charente »_

### Hauts-de-France

- **La Voix du Nord** (DR 78) — Lille / Roubaix / Tourcoing
  - Angle : _« Le Nord en zone climatique H1a maximise les forfaits CEE — décryptage »_
- **Le Courrier Picard** (DR 56) — Amiens / Beauvais
  - Angle : _« Hauts-de-France : 700 € en moyenne par dossier MPR — ce que cache la moyenne »_

### Grand Est

- **L'Est Républicain** (DR 73) — Lorraine / Bourgogne
  - Angle : _« Grand Est H1b/H1c : la région qui pèse le plus sur le forfait CEE chauffage »_
- **Les Dernières Nouvelles d'Alsace (DNA)** (DR 70) — Strasbourg / Colmar / Mulhouse
  - Angle : _« Aide Climaxion (Région Grand Est) : le complément régional le plus généreux en 2026 »_

### Pays de la Loire

- **Ouest-France** (DR 84) — Nantes / Angers / Le Mans / Saint-Nazaire (édition PdL)
  - Angle : _« Pays de la Loire : carte des artisans RGE et forfaits CEE par dépt »_
- **Le Courrier de l'Ouest** (DR 56) — Angers / Cholet
  - Angle : _« 49 % de constructions pré-1975 en Pays de la Loire : le gisement isolation à exploiter »_

### Bretagne

- **Ouest-France** (DR 84) — édition Bretagne (Rennes / Brest / Quimper)
  - Angle : _« Bretagne, zone H2a océanique : pourquoi la PAC air-eau y est plus performante »_
- **Le Télégramme** (DR 73) — Brest / Quimper / Lorient
  - Angle : _« Aides régionales Bretagne pour la rénovation : ce qui s'ajoute à MaPrimeRénov' »_

### Normandie

- **Ouest-France** (DR 84) — édition Normandie (Caen / Rouen)
  - Angle : _« Normandie : le bois-énergie soutenu par la Région — combien et pour qui ? »_
- **Paris-Normandie** (DR 65) — Rouen / Le Havre
  - Angle : _« Carte des artisans RGE en Normandie — focus pompes à chaleur et isolation »_

### Bourgogne-Franche-Comté

- **Le Bien Public** (DR 53) — Dijon
  - Angle : _« Bourgogne-Franche-Comté : Effilogis, l'aide régionale qui boosse les rénovations BBC »_
- **L'Est Républicain** (DR 73) — édition Doubs / Jura
  - Angle : _« Le Doubs en zone H1c : forfaits CEE chauffage parmi les plus élevés »_

### Centre-Val de Loire

- **La Nouvelle République du Centre-Ouest** (DR 67) — Tours / Poitiers / Châteauroux
  - Angle : _« Centre-Val de Loire : annuaire des artisans RGE par département »_
- **L'Écho Républicain** (DR 47) — Chartres
  - Angle : _« Eure-et-Loir : 12 ans pour amortir une rénovation BBC selon la zone climat »_

### Corse

- **Corse-Matin** (DR 67)
  - Angle : _« Aides régionales Collectivité de Corse Énergie + zone H3 méditerranéenne : combien pour rénover en Corse en 2026 ? »_

---

## Templates email (à adapter par contact)

### Template A — _« Données ouvertes locales »_

> **Sujet** : Données ouvertes — annuaire RGE et aides CEE [RÉGION] librement réutilisables
>
> Bonjour [Prénom],
>
> Nous publions cette semaine en open-data CC-BY 4.0 deux jeux de données utiles pour les rédactions traitant la rénovation énergétique :
>
> - **Annuaire des artisans RGE en [RÉGION]** : [N] entreprises géolocalisées, métier ADEME, qualifications, validité — issu du flux ADEME enrichi.
>   <https://servicesartisans.fr/datasets/rge>
> - **Aides CEE régionales [RÉGION]** : zone climatique RT2012, dispositifs cumulables avec MaPrimeRénov', sources officielles conseil régional.
>   <https://servicesartisans.fr/datasets/cee-regional-aids>
>
> Si un angle local vous intéresse (par exemple : _« [ANGLE PROPOSÉ DANS LA MATRICE] »_), je peux fournir des extraits sur mesure et commenter les écarts.
>
> Bien cordialement,
> Marvin Bissohong, ServicesArtisans

### Template B — _« Pitch lecteur »_

> **Sujet** : [VILLE] : combien d'artisans RGE et combien d'aides MPR en 2026 ?
>
> Bonjour [Prénom],
>
> Pour vos lecteurs propriétaires en [DÉPT], une donnée fraîche : il y a actuellement [N] artisans RGE référencés dans le département, dont [X] en audit énergétique (préalable obligatoire MPR Parcours accompagné). La région [RÉGION] est en zone climatique [ZONE] qui module les forfaits CEE.
>
> J'ai compilé les chiffres locaux et les conditions d'aides 2026 sur des pages dédiées :
>
> - [VILLE] simulateur : <https://servicesartisans.fr/simulateur-aides-renovation/[ville-slug]>
> - Carte RGE [RÉGION] : <https://servicesartisans.fr/carte-artisans-rge/[region-slug]>
> - Aides CEE [RÉGION] : <https://servicesartisans.fr/aides/[region-slug]/renovation>
>
> Si vous préparez un papier sur la rénovation à [VILLE]/[RÉGION] et qu'un commentaire data peut servir, je suis disponible. Aucun argument commercial : la data est libre.
>
> Bien cordialement,
> Marvin Bissohong, ServicesArtisans

### Template C — _« Suivi (J+7) »_

> **Sujet** : Re: [SUJET INITIAL]
>
> Bonjour [Prénom],
>
> Petit suivi sans pression : si l'angle data sur la rénovation énergétique en [RÉGION] vous parle, je peux vous préparer un export CSV custom (par dépt, par tranche de revenus, par opération CEE). Sinon, je passe à autre chose et je vous laisse tranquille.
>
> Belle journée,
> Marvin

---

## Méthodo pas-à-pas

1. **Vérifier l'email avant envoi** : LinkedIn pour le nom + email pattern → tester avec Hunter.io (gratuit 25 req/mois).
2. **Personnaliser** : remplacer `[VILLE]` `[N]` `[X]` `[Prénom]` (jamais « Madame, Monsieur »).
3. **Cadence** : 5 envois/jour max pour rester sous le radar spam. Étaler sur 3 semaines.
4. **Suivi unique J+7** : 1 seule relance, jamais 2.
5. **Tracking** : 1 ligne par contact dans `sprint3-presse-locale-tracking.csv` (créé en parallèle).
6. **Si réponse** : envoyer extrait CSV custom dans les 24h. La réactivité fait la différence.
7. **Mesure** : comptage refdomains gagnés via Ahrefs `site-explorer/refdomains-history` — 1 mesure à J+30 puis M+3.

---

## ROI attendu

**Hypothèse conservatrice (P50)** : 5/13 médias répondent → 3 backlinks publiés en M+3 (DR moyen 65). +3 refdomains haute autorité = +0.5 à +1 DR Ahrefs estimé pour ServicesArtisans.

**Hypothèse haute (P80)** : 8/13 médias répondent → 6 backlinks (3 nationaux Ouest-France/Sud-Ouest, 3 régionaux). +6 refdomains DR 65-84 = +1 à +2 DR estimé.

Couplé au plan ULTRA DOMINATION SEO v2 (objectif M12 : DR 22-32), cette vague Sprint 3 contribue à 5-10 % du palier.

---

## Tracking

Fichier compagnon : `sprint3-presse-locale-tracking.csv`

Colonnes : `media | region | contact_name | contact_email | template | sent_at | reply_at | outcome | url_obtained | dr | notes`

Outcome possible : `pending`, `replied`, `published`, `declined`, `no_reply`.
