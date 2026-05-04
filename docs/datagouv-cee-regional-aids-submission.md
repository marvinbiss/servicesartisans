# Soumission data.gouv.fr — Aides CEE régionales France 2026

**Sprint AI Wave G — 2026-05-03**
**Préparé par** : équipe ServicesArtisans
**Type d'opération** : création initiale (1ère publication)

---

## Page canonique du dataset

- **URL** : <https://servicesartisans.fr/datasets/cee-regional-aids>
- **Index** : <https://servicesartisans.fr/datasets>

## Endpoints data

- **JSON-LD** : <https://servicesartisans.fr/api/datasets/cee-regional-aids.json>
- **CSV** : <https://servicesartisans.fr/api/datasets/cee-regional-aids.csv>

## Fiche descriptive (à coller dans le formulaire data.gouv.fr)

### Titre

> Aides CEE régionales France 2026 — par zone climatique RT2012

### Description (markdown supporté)

```markdown
Inventaire structuré des aides régionales cumulables avec la prime CEE
(Certificats d'Économies d'Énergie) nationale pour la rénovation énergétique
résidentielle. Couverture : 13 régions métropole + Corse. Les régions DOM sont
exclues car elles relèvent du dispositif GUSE distinct.

Pour chaque région, le dataset fournit :

- la **zone climatique RT2012** (H1a, H1b, H1c, H2a, H2b, H2c, H2d, H3) qui
  module les forfaits CEE chauffage et isolation ;
- le **mix résidentiel** (part de maisons individuelles et part de logements
  construits avant 1975) issu du recensement INSEE 2021 ;
- chaque **aide régionale** active en 2026 avec son montant ou plafond, le
  détail du dispositif et l'**URL officielle source** (conseil régional ou
  collectivité émettrice).

Les barèmes sont vérifiés trimestriellement par l'équipe éditoriale
ServicesArtisans. Le champ `last_reviewed_at` (format ISO YYYY-MM-DD) trace
la date de la dernière vérification par région.
```

### Mots-clés (tags)

`CEE`, `certificats économies énergie`, `aides régionales`, `rénovation énergétique`,
`MaPrimeRénov`, `zone climatique`, `RT2012`, `INSEE`, `transition énergétique`,
`données ouvertes`

### Thématiques data.gouv.fr

- Logement et urbanisme
- Énergie
- Territoires et collectivités

### Licence

`Licence Ouverte / Open Licence` ou `Creative Commons Attribution 4.0` (au choix
de data.gouv.fr — l'export technique est CC-BY 4.0).

### Couverture spatiale

- France métropolitaine + Corse
- Régions DOM exclues (dispositif GUSE distinct)

### Couverture temporelle

`2026-01-01` → `2026-12-31`

### Fréquence de mise à jour

Trimestrielle (vérification éditoriale des barèmes régionaux).

---

## Ressources à attacher dans la fiche data.gouv.fr

| Type           | URL                                                               | Format              | Taille estimée |
| -------------- | ----------------------------------------------------------------- | ------------------- | -------------- |
| Page canonique | <https://servicesartisans.fr/datasets/cee-regional-aids>          | HTML                | -              |
| API JSON-LD    | <https://servicesartisans.fr/api/datasets/cee-regional-aids.json> | application/ld+json | <50 KB         |
| Fichier CSV    | <https://servicesartisans.fr/api/datasets/cee-regional-aids.csv>  | text/csv            | <30 KB         |

---

## Schema des champs (CSV plat, one-row-per-aid)

| Champ                       | Type      | Description                                             |
| --------------------------- | --------- | ------------------------------------------------------- |
| `region_slug`               | string    | Slug technique de la région                             |
| `region_name`               | string    | Nom officiel de la région                               |
| `climate_zone`              | enum      | Zone climatique RT2012 (H1a/H1b/H1c/H2a/H2b/H2c/H2d/H3) |
| `pct_maisons_individuelles` | int 0-100 | Part de maisons individuelles (INSEE RP 2021)           |
| `pct_construction_pre_1975` | int 0-100 | Part de logements construits avant 1975 (INSEE RP 2021) |
| `aid_name`                  | string    | Nom officiel de l'aide                                  |
| `aid_montant`               | string    | Montant ou plafond exprimé en français lisible          |
| `aid_detail`                | string    | Description courte du dispositif et conditions          |
| `aid_source_url`            | uri       | URL officielle source                                   |
| `last_reviewed_at`          | date      | Date dernière vérification éditoriale (YYYY-MM-DD)      |

La vue JSON-LD est hiérarchique (1 entry par région avec un tableau
`regional_aids`). Les deux formats portent les mêmes données.

---

## Procédure de soumission

1. Se connecter à <https://www.data.gouv.fr/fr/admin/datasets/new/> (compte
   organisation ServicesArtisans).
2. Coller titre + description ci-dessus.
3. Sélectionner la licence et les thématiques.
4. Attacher les 3 ressources (page canonique + JSON + CSV).
5. Renseigner la couverture spatiale + temporelle.
6. Publier.
7. Coller le lien data.gouv.fr du dataset publié dans `MEMORY.md` projet
   ServicesArtisans.

## Suivi post-publication

- Surveiller les téléchargements / réutilisations sur la page data.gouv.fr (1×/mois).
- Pings IndexNow non requis (ressources `noindex` côté SA, c'est data.gouv.fr
  qui sert le SEO).
- Backlinks attendus : référencement automatique data.gouv → +5-8 DR Ahrefs.
