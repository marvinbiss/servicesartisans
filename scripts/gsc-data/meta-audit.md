# Audit SEO — metaTitle & metaDescription des articles blog

**Date** : 2026-04-03
**Scope** : 324 articles dans 35 fichiers

---

## Statistiques globales

| Métrique | Valeur | % |
|----------|--------|---|
| Total articles | 324 | 100% |
| Avec metaTitle | 153 | 47.2% |
| metaTitle <= 60 chars | 150 | 46.3% |
| metaTitle <= 70 chars | 153 | 47.2% |
| metaTitle avec "2026" | 125 | 38.6% |
| metaTitle avec mot-clé transactionnel | 107 | 33.0% |
| Avec metaDescription | 153 | 47.2% |
| metaDescription <= 155 chars | 153 | 47.2% |
| metaDescription <= 160 chars | 153 | 47.2% |
| metaDescription avec CTA | 41 | 12.7% |

### Résumé des problèmes

| Sévérité | Nombre |
|----------|--------|
| CRITIQUE | 342 |
| IMPORTANT | 77 |
| MINEUR | 112 |
| **Total** | **531** |

---

## Diagnostic par fichier

### Fichiers SANS AUCUN metaTitle (21 fichiers -- priorité maximale)

Ces fichiers n'ont aucun `metaTitle` ni `metaDescription` sur aucun de leurs articles.
Google utilise le `title` brut comme fallback, ce qui n'est PAS optimisé pour le CTR en SERP.

| Fichier | Thématique |
|---------|------------|
| `batch-aides-saisonnier.ts` | Aides + saisonnier |
| `batch-comparatifs-materiaux.ts` | Comparatifs matériaux |
| `batch-diy.ts` | DIY / bricolage |
| `batch-energie-2026.ts` | Énergie 2026 |
| `batch-guides-divers.ts` | Guides divers |
| `batch-inspiration.ts` | Inspiration déco |
| `batch-metiers-3.ts` | Métiers lot 3 |
| `batch-metiers-4.ts` | Métiers lot 4 |
| `batch-metiers-5.ts` | Métiers lot 5 |
| `batch-produits-materiaux.ts` | Produits & matériaux |
| `batch-projets.ts` | Projets travaux |
| `batch-renovation-2026.ts` | Rénovation 2026 |
| `batch-saisonnier-urgence.ts` | Saisonnier urgence |
| `batch-saisonnier.ts` | Saisonnier |
| `batch-securite-energie.ts` | Sécurité & énergie |
| `batch-seo-boost1.ts` | SEO boost lot 1 |
| `batch-seo-boost2.ts` | SEO boost lot 2 |
| `batch-seo-boost3.ts` | SEO boost lot 3 |
| `batch-tutoriels-diy.ts` | Tutos DIY lot 1 |
| `batch-tutoriels-diy-2.ts` | Tutos DIY lot 2 |

### Fichiers AVEC metaTitle (14 fichiers + existing-articles.ts)

| Fichier | Problèmes restants |
|---------|-------------------|
| `existing-articles.ts` | Quelques metaDescription sans CTA |
| `batch-prix.ts` | OK -- bien optimisé |
| `batch-prix-regionaux.ts` | OK -- bien optimisé |
| `batch-prix-btp.ts` | OK |
| `batch-prix-metal-bois.ts` | OK |
| `batch-prix-design.ts` | OK |
| `batch-prix-tech.ts` | OK |
| `batch-prix-services.ts` | OK |
| `batch-prix-villes.ts` | Quelques sans CTA |
| `batch-metiers.ts` | Quelques sans "2026" ou mot-clé transactionnel |
| `batch-conseils.ts` | Quelques sans "2026" ou mot-clé transactionnel |
| `batch-reglementation.ts` | Quelques sans "2026" |
| `batch-aides-2026.ts` | Quelques metaDescription sans CTA |
| `batch-saisonniers-2026.ts` | Quelques metaDescription sans CTA |
| `batch-urgences-guides.ts` | Quelques metaDescription sans CTA |

### Priorités de correction

1. **P0 (171 articles)** : Ajouter metaTitle + metaDescription aux 21 fichiers batch qui en sont dépourvus
2. **P1 (28 articles)** : Ajouter "2026" aux metaTitle qui ne l'ont pas
3. **P1 (46 articles)** : Ajouter un mot-clé transactionnel aux metaTitle qui n'en ont pas
4. **P2 (112 articles)** : Ajouter un CTA aux metaDescription (87.3% des descriptions n'en ont pas)
5. **P2 (3 articles)** : Raccourcir les metaTitle entre 60-70 chars

---

## CRITIQUES (342)

> metaTitle manquant, > 70 chars, ou dupliqué

### `maprimerenovv-guide-complet-2026`
- **Fichier** : `batch-aides-saisonnier.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "MaPrimeRénov' 2026 : montants, conditions et démarches complètes"

### `maprimerenovv-guide-complet-2026`
- **Fichier** : `batch-aides-saisonnier.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "MaPrimeRénov' 2026 : montants, conditions et démarches complètes"

### `cumul-aides-renovation-energetique-2026`
- **Fichier** : `batch-aides-saisonnier.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Cumul des aides rénovation 2026 : MaPrimeRénov' + CEE + éco-PTZ"

### `cumul-aides-renovation-energetique-2026`
- **Fichier** : `batch-aides-saisonnier.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Cumul des aides rénovation 2026 : MaPrimeRénov' + CEE + éco-PTZ"

### `entretien-maison-printemps-2026`
- **Fichier** : `batch-aides-saisonnier.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Check-list entretien maison printemps 2026 : 15 points essentiels"

### `entretien-maison-printemps-2026`
- **Fichier** : `batch-aides-saisonnier.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Check-list entretien maison printemps 2026 : 15 points essentiels"

### `meilleur-isolant-thermique-comparatif`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Quel est le meilleur isolant thermique ? Comparatif 2026"

### `meilleur-isolant-thermique-comparatif`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Quel est le meilleur isolant thermique ? Comparatif 2026"

### `peinture-interieure-guide-choix`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Peinture intérieure : guide pour choisir la bonne"

### `peinture-interieure-guide-choix`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Peinture intérieure : guide pour choisir la bonne"

### `robinetterie-laiton-vs-inox`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Robinetterie : laiton, inox ou zamak ?"

### `robinetterie-laiton-vs-inox`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Robinetterie : laiton, inox ou zamak ?"

### `types-de-carrelage-guide`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Types de carrelage : grès cérame, faïence, pierre naturelle"

### `types-de-carrelage-guide`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Types de carrelage : grès cérame, faïence, pierre naturelle"

### `parquet-massif-vs-contrecolle-vs-stratifie`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Parquet massif, contrecollé ou stratifié ?"

### `parquet-massif-vs-contrecolle-vs-stratifie`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Parquet massif, contrecollé ou stratifié ?"

### `menuiseries-bois-pvc-alu-comparatif`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Menuiseries bois, PVC ou aluminium : le comparatif"

### `menuiseries-bois-pvc-alu-comparatif`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Menuiseries bois, PVC ou aluminium : le comparatif"

### `types-de-tuiles-guide`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Tuiles terre cuite, béton ou ardoise : que choisir ?"

### `types-de-tuiles-guide`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Tuiles terre cuite, béton ou ardoise : que choisir ?"

### `plaque-de-platre-ba13-guide`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Plaque de plâtre BA13 : types et usages"

### `plaque-de-platre-ba13-guide`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Plaque de plâtre BA13 : types et usages"

### `types-enduit-facade`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Enduit de façade : monocouche, traditionnel ou chaux ?"

### `types-enduit-facade`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Enduit de façade : monocouche, traditionnel ou chaux ?"

### `beton-cire-vs-resine-vs-carrelage`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Béton ciré, résine ou carrelage : quel sol choisir ?"

### `beton-cire-vs-resine-vs-carrelage`
- **Fichier** : `batch-comparatifs-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Béton ciré, résine ou carrelage : quel sol choisir ?"

### `preparer-maison-hiver-guide-complet`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Préparer sa Maison pour l\"

### `preparer-maison-hiver-guide-complet`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Préparer sa Maison pour l\"

### `travaux-printemps-liste-priorites`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Travaux de Printemps 2026 : Priorités"

### `travaux-printemps-liste-priorites`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Travaux de Printemps 2026 : Priorités"

### `canicule-adapter-logement-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Canicule 2026 : Adapter son Logement"

### `canicule-adapter-logement-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Canicule 2026 : Adapter son Logement"

### `travaux-avant-vendre-maison-rentables`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Travaux avant de Vendre sa Maison 2026"

### `travaux-avant-vendre-maison-rentables`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Travaux avant de Vendre sa Maison 2026"

### `travaux-copropriete-guide-regles`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Travaux Copropriété 2026 : Règles"

### `travaux-copropriete-guide-regles`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Travaux Copropriété 2026 : Règles"

### `domotique-maison-connectee-guide-debutant`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Domotique 2026 : Guide Maison Connectée"

### `domotique-maison-connectee-guide-debutant`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Domotique 2026 : Guide Maison Connectée"

### `materiaux-ecologiques-construction-guide`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Matériaux Écologiques 2026 : Guide"

### `materiaux-ecologiques-construction-guide`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Matériaux Écologiques 2026 : Guide"

### `etancheite-toiture-terrasse-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Étanchéité Toiture Terrasse : Solutions"

### `etancheite-toiture-terrasse-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Étanchéité Toiture Terrasse : Solutions"

### `renovation-maison-pierre-ancienne-guide`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Maison en Pierre Ancienne : Rénover"

### `renovation-maison-pierre-ancienne-guide`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Maison en Pierre Ancienne : Rénover"

### `nuisibles-maison-prevention-traitement`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Nuisibles : Prévention et Traitement"

### `nuisibles-maison-prevention-traitement`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Nuisibles : Prévention et Traitement"

### `peinture-interieure-diy-guide`
- **Fichier** : `batch-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Peindre son intérieur soi-même : guide complet"

### `peinture-interieure-diy-guide`
- **Fichier** : `batch-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Peindre son intérieur soi-même : guide complet"

### `poser-parquet-flottant-diy`
- **Fichier** : `batch-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Poser du parquet flottant soi-même : tutoriel pas à pas"

### `poser-parquet-flottant-diy`
- **Fichier** : `batch-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Poser du parquet flottant soi-même : tutoriel pas à pas"

### `installer-etageres-rangement-diy`
- **Fichier** : `batch-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Installer étagères et rangements muraux : guide pratique"

### `installer-etageres-rangement-diy`
- **Fichier** : `batch-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Installer étagères et rangements muraux : guide pratique"

### `prix-pompe-a-chaleur-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Pompe à Chaleur en 2026 : Coûts, Aides et Rentabilité"

### `prix-pompe-a-chaleur-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Pompe à Chaleur en 2026 : Coûts, Aides et Rentabilité"

### `prix-panneaux-solaires-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Panneaux Solaires en 2026 : Installation, Rentabilité et Aides"

### `prix-panneaux-solaires-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Panneaux Solaires en 2026 : Installation, Rentabilité et Aides"

### `prix-borne-recharge-domicile-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Borne de Recharge à Domicile en 2026 : Coûts et Installation"

### `prix-borne-recharge-domicile-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Borne de Recharge à Domicile en 2026 : Coûts et Installation"

### `dpe-obligatoire-2026-guide`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "DPE Obligatoire 2026 : Tout ce qui Change pour les Propriétaires"

### `dpe-obligatoire-2026-guide`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "DPE Obligatoire 2026 : Tout ce qui Change pour les Propriétaires"

### `passoire-thermique-interdiction-location-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Passoires Thermiques : Interdiction de Location en 2026"

### `passoire-thermique-interdiction-location-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Passoires Thermiques : Interdiction de Location en 2026"

### `eco-ptz-2026-conditions-montant`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Éco-PTZ 2026 : Conditions, Montants et Comment en Bénéficier"

### `eco-ptz-2026-conditions-montant`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Éco-PTZ 2026 : Conditions, Montants et Comment en Bénéficier"

### `prix-veranda-2026-guide-complet`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Véranda en 2026 : Matériaux, Surfaces et Devis"

### `prix-veranda-2026-guide-complet`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Véranda en 2026 : Matériaux, Surfaces et Devis"

### `extension-maison-prix-m2-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Extension Maison : Prix au m² en 2026 selon le Type"

### `extension-maison-prix-m2-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Extension Maison : Prix au m² en 2026 selon le Type"

### `prix-domotique-maison-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Domotique Maison en 2026 : Solutions et Installation"

### `prix-domotique-maison-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Domotique Maison en 2026 : Solutions et Installation"

### `adaptation-logement-senior-aides-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Adaptation Logement Senior : Aides MaPrimeAdapt' et Prix en 2026"

### `adaptation-logement-senior-aides-2026`
- **Fichier** : `batch-energie-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Adaptation Logement Senior : Aides MaPrimeAdapt' et Prix en 2026"

### `diy-travaux-soi-meme-ou-artisan`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Quels travaux faire soi-même et quand appeler un artisan ?"

### `diy-travaux-soi-meme-ou-artisan`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Quels travaux faire soi-même et quand appeler un artisan ?"

### `tendances-salle-de-bain-2026`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Tendances rénovation salle de bain 2026 : styles, matériaux et budget"

### `tendances-salle-de-bain-2026`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Tendances rénovation salle de bain 2026 : styles, matériaux et budget"

### `prix-domotique-maison-2026`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix installation domotique 2026 : budget complet détaillé"

### `prix-domotique-maison-2026`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix installation domotique 2026 : budget complet détaillé"

### `preparer-maison-revente-travaux-rentables`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Préparer sa maison pour la revente : les travaux les plus rentables"

### `preparer-maison-revente-travaux-rentables`
- **Fichier** : `batch-guides-divers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Préparer sa maison pour la revente : les travaux les plus rentables"

### `tendances-cuisine-2026`
- **Fichier** : `batch-inspiration.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Tendances cuisine 2026 : aménagement, matériaux et couleurs"

### `tendances-cuisine-2026`
- **Fichier** : `batch-inspiration.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Tendances cuisine 2026 : aménagement, matériaux et couleurs"

### `amenagement-terrasse-exterieur-2026`
- **Fichier** : `batch-inspiration.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Aménagement terrasse et extérieur 2026 : idées et budget"

### `amenagement-terrasse-exterieur-2026`
- **Fichier** : `batch-inspiration.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Aménagement terrasse et extérieur 2026 : idées et budget"

### `renovation-combles-amenagement`
- **Fichier** : `batch-inspiration.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Aménager ses combles en 2026 : idées, contraintes et budget"

### `renovation-combles-amenagement`
- **Fichier** : `batch-inspiration.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Aménager ses combles en 2026 : idées, contraintes et budget"

### `comment-choisir-solier-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Solier en 2026 : Le Guide Complet"

### `comment-choisir-solier-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Solier en 2026 : Le Guide Complet"

### `comment-choisir-poseur-parquet-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Poseur de Parquet en 2026 : Le Guide Ultime"

### `comment-choisir-poseur-parquet-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Poseur de Parquet en 2026 : Le Guide Ultime"

### `comment-choisir-zingueur-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Zingueur en 2026 : Le Guide Complet"

### `comment-choisir-zingueur-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Zingueur en 2026 : Le Guide Complet"

### `comment-choisir-miroitier-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Miroitier en 2026 : Le Guide Complet"

### `comment-choisir-miroitier-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Miroitier en 2026 : Le Guide Complet"

### `comment-choisir-storiste-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Storiste en 2026 : Le Guide Complet"

### `comment-choisir-storiste-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Storiste en 2026 : Le Guide Complet"

### `comment-choisir-domoticien-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Domoticien en 2026 : Le Guide Complet"

### `comment-choisir-domoticien-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Domoticien en 2026 : Le Guide Complet"

### `comment-choisir-diagnostiqueur-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Diagnostiqueur Immobilier en 2026 : Le Guide Complet"

### `comment-choisir-diagnostiqueur-guide`
- **Fichier** : `batch-metiers-3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Diagnostiqueur Immobilier en 2026 : Le Guide Complet"

### `comment-choisir-ascensoriste-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Ascensoriste en 2026 : Le Guide Complet"

### `comment-choisir-ascensoriste-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Ascensoriste en 2026 : Le Guide Complet"

### `comment-choisir-metallier-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Métallier en 2026 : Le Guide Expert"

### `comment-choisir-metallier-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Métallier en 2026 : Le Guide Expert"

### `comment-choisir-architecte-interieur-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Architecte d'Intérieur en 2026 : Le Guide Décisif"

### `comment-choisir-architecte-interieur-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Architecte d'Intérieur en 2026 : Le Guide Décisif"

### `comment-choisir-pisciniste-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Pisciniste en 2026 : Le Guide Sans Concession"

### `comment-choisir-pisciniste-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Pisciniste en 2026 : Le Guide Sans Concession"

### `comment-choisir-antenniste-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Antenniste en 2026 : Le Guide Pratique"

### `comment-choisir-antenniste-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Antenniste en 2026 : Le Guide Pratique"

### `comment-choisir-geometre-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Géomètre-Expert en 2026 : Le Guide Complet"

### `comment-choisir-geometre-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Géomètre-Expert en 2026 : Le Guide Complet"

### `comment-choisir-demenageur-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir son Déménageur en 2026 : Le Guide Anti-Arnaques"

### `comment-choisir-demenageur-guide`
- **Fichier** : `batch-metiers-4.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir son Déménageur en 2026 : Le Guide Anti-Arnaques"

### `alarme-maison-guide-complet-2026`
- **Fichier** : `batch-metiers-5.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Alarme Maison 2026 : Guide Complet pour Protéger Votre Domicile"

### `alarme-maison-guide-complet-2026`
- **Fichier** : `batch-metiers-5.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Alarme Maison 2026 : Guide Complet pour Protéger Votre Domicile"

### `protection-cambriolage-securiser-maison-2026`
- **Fichier** : `batch-metiers-5.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Protection Cambriolage 2026 : 12 Mesures pour Sécuriser Votre Maison"

### `protection-cambriolage-securiser-maison-2026`
- **Fichier** : `batch-metiers-5.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Protection Cambriolage 2026 : 12 Mesures pour Sécuriser Votre Maison"

### `metier-plombier-formations-competences`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Métier Plombier : Formation et Carrière"

### `metier-plombier-formations-competences`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Métier Plombier : Formation et Carrière"

### `metier-electricien-formations-certifications`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Métier Électricien : Formations"

### `metier-electricien-formations-certifications`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Métier Électricien : Formations"

### `metier-macon-specialisations-carrieres`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Métier Maçon : Spécialisations"

### `metier-macon-specialisations-carrieres`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Métier Maçon : Spécialisations"

### `metier-couvreur-risques-reglementation`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Métier Couvreur : Risques et Règles"

### `metier-couvreur-risques-reglementation`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Métier Couvreur : Risques et Règles"

### `metier-menuisier-bois-alu-pvc`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Métier Menuisier : Bois, Alu et PVC"

### `metier-menuisier-bois-alu-pvc`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Métier Menuisier : Bois, Alu et PVC"

### `metier-chauffagiste-pompe-chaleur`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Métier Chauffagiste : Ère de la PAC"

### `metier-chauffagiste-pompe-chaleur`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Métier Chauffagiste : Ère de la PAC"

### `metier-peintre-batiment-evolution`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Métier Peintre Bâtiment : Techniques"

### `metier-peintre-batiment-evolution`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Métier Peintre Bâtiment : Techniques"

### `guide-pompe-chaleur-air-eau-2026`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Pompe à Chaleur Air-Eau : Guide Complet 2026"

### `guide-pompe-chaleur-air-eau-2026`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Pompe à Chaleur Air-Eau : Guide Complet 2026"

### `chauffe-eau-thermodynamique-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Chauffe-Eau Thermodynamique : Prix, Avantages et Installation"

### `chauffe-eau-thermodynamique-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Chauffe-Eau Thermodynamique : Prix, Avantages et Installation"

### `guide-carrelage-salle-de-bain`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Carrelage Salle de Bain : Matériaux, Prix et Tendances 2026"

### `guide-carrelage-salle-de-bain`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Carrelage Salle de Bain : Matériaux, Prix et Tendances 2026"

### `parquet-flottant-guide-choix`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Parquet Flottant : Guide de Choix et Prix 2026"

### `parquet-flottant-guide-choix`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Parquet Flottant : Guide de Choix et Prix 2026"

### `chaudiere-gaz-condensation-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Chaudière Gaz à Condensation : Prix et Alternatives 2026"

### `chaudiere-gaz-condensation-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Chaudière Gaz à Condensation : Prix et Alternatives 2026"

### `guide-fenetre-double-vitrage`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Fenêtres Double Vitrage : Prix, Types et Aides 2026"

### `guide-fenetre-double-vitrage`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Fenêtres Double Vitrage : Prix, Types et Aides 2026"

### `isolation-combles-materiaux-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Isolation des Combles : Matériaux, Prix et Aides"

### `isolation-combles-materiaux-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Isolation des Combles : Matériaux, Prix et Aides"

### `guide-volet-roulant-electrique`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Volet Roulant Électrique : Prix, Pose et Domotique"

### `guide-volet-roulant-electrique`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Volet Roulant Électrique : Prix, Pose et Domotique"

### `poele-a-bois-guide-2026`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Poêle à Bois : Guide, Prix et Aides 2026"

### `poele-a-bois-guide-2026`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Poêle à Bois : Guide, Prix et Aides 2026"

### `climatisation-reversible-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Climatisation Réversible : Prix et Installation 2026"

### `climatisation-reversible-guide`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Climatisation Réversible : Prix et Installation 2026"

### `ballon-eau-chaude-guide-choix`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Ballon d\"

### `ballon-eau-chaude-guide-choix`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Ballon d\"

### `porte-entree-guide-securite-isolation`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Porte d\"

### `porte-entree-guide-securite-isolation`
- **Fichier** : `batch-produits-materiaux.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Porte d\"

### `renover-cuisine-guide-complet-etapes`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Rénover sa Cuisine 2026 : Guide Étapes"

### `renover-cuisine-guide-complet-etapes`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Rénover sa Cuisine 2026 : Guide Étapes"

### `amenager-combles-guide-habitables`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Aménager ses Combles 2026 : Guide"

### `amenager-combles-guide-habitables`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Aménager ses Combles 2026 : Guide"

### `installer-pompe-chaleur-air-eau-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Pompe à Chaleur Air-Eau 2026 : Guide"

### `installer-pompe-chaleur-air-eau-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Pompe à Chaleur Air-Eau 2026 : Guide"

### `installer-panneau-solaire-maison-2026`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Panneaux Solaires 2026 : Installation"

### `installer-panneau-solaire-maison-2026`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Panneaux Solaires 2026 : Installation"

### `creer-salle-de-bain-sous-combles`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Salle de Bain sous Combles 2026 : Prix"

### `creer-salle-de-bain-sous-combles`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Salle de Bain sous Combles 2026 : Prix"

### `agrandir-maison-extension-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Agrandir sa Maison 2026 : Les Options"

### `agrandir-maison-extension-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Agrandir sa Maison 2026 : Les Options"

### `renover-facade-ravalement-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Ravalement Façade 2026 : Types et Prix"

### `renover-facade-ravalement-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Ravalement Façade 2026 : Types et Prix"

### `amenager-terrasse-exterieure-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Terrasse Extérieure 2026 : Prix"

### `amenager-terrasse-exterieure-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Terrasse Extérieure 2026 : Prix"

### `installer-climatisation-maison-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Climatisation 2026 : Guide Installation"

### `installer-climatisation-maison-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Climatisation 2026 : Guide Installation"

### `refaire-electricite-maison-ancienne`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Électricité Maison Ancienne 2026"

### `refaire-electricite-maison-ancienne`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Électricité Maison Ancienne 2026"

### `refaire-plomberie-maison-ancienne`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Plomberie Maison Ancienne 2026 : Guide"

### `refaire-plomberie-maison-ancienne`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Plomberie Maison Ancienne 2026 : Guide"

### `poser-carrelage-guide-complet-techniques`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Poser du Carrelage 2026 : Guide"

### `poser-carrelage-guide-complet-techniques`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Poser du Carrelage 2026 : Guide"

### `installer-parquet-massif-contrecolle-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Parquet 2026 : Massif ou Stratifié ?"

### `installer-parquet-massif-contrecolle-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Parquet 2026 : Massif ou Stratifié ?"

### `construire-garage-guide-permis-budget`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Construire un Garage 2026 : Budget"

### `construire-garage-guide-permis-budget`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Construire un Garage 2026 : Budget"

### `amenager-jardin-paysagiste-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Jardin Paysagiste 2026 : Idées et Prix"

### `amenager-jardin-paysagiste-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Jardin Paysagiste 2026 : Idées et Prix"

### `installer-portail-automatique-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Portail Automatique 2026 : Achat et Pose"

### `installer-portail-automatique-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Portail Automatique 2026 : Achat et Pose"

### `remplacer-fenetres-guide-performances`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Remplacer ses Fenêtres 2026 : Économies"

### `remplacer-fenetres-guide-performances`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Remplacer ses Fenêtres 2026 : Économies"

### `installer-vmc-ventilation-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "VMC 2026 : Ventilation et Qualité Air"

### `installer-vmc-ventilation-guide`
- **Fichier** : `batch-projets.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "VMC 2026 : Ventilation et Qualité Air"

### `audit-energetique-dpe-obligations-2026`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Audit et DPE : Obligations 2026"

### `audit-energetique-dpe-obligations-2026`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Audit et DPE : Obligations 2026"

### `reglementation-thermique-re2020-impact`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "RE2020 : Impact Construction et Rénovation"

### `reglementation-thermique-re2020-impact`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "RE2020 : Impact Construction et Rénovation"

### `responsabilite-artisan-maitre-ouvrage`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Responsabilité Artisan : Qui Paie Quoi ?"

### `responsabilite-artisan-maitre-ouvrage`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Responsabilité Artisan : Qui Paie Quoi ?"

### `reception-travaux-proces-verbal-reserves`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Réception Travaux : PV et Réserves"

### `reception-travaux-proces-verbal-reserves`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Réception Travaux : PV et Réserves"

### `litige-artisan-recours-mediation-justice`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Litige Artisan : Recours et Médiation"

### `litige-artisan-recours-mediation-justice`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Litige Artisan : Recours et Médiation"

### `label-rge-artisan-travaux-energetiques`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Label RGE : Pourquoi C\"

### `label-rge-artisan-travaux-energetiques`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Label RGE : Pourquoi C\"

### `qualibat-qualifelec-certifications-batiment`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Qualibat, Qualifelec, Qualit\"

### `qualibat-qualifelec-certifications-batiment`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Qualibat, Qualifelec, Qualit\"

### `diagnostic-immobilier-obligatoire-liste`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Diagnostics Immobiliers 2026 : Liste"

### `diagnostic-immobilier-obligatoire-liste`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Diagnostics Immobiliers 2026 : Liste"

### `amiante-plomb-diagnostic-avant-travaux`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Amiante et Plomb : Diagnostics Travaux"

### `amiante-plomb-diagnostic-avant-travaux`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Amiante et Plomb : Diagnostics Travaux"

### `reglementation-ravalement-facade-obligations`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Ravalement Façade : Obligations Légales"

### `reglementation-ravalement-facade-obligations`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Ravalement Façade : Obligations Légales"

### `urbanisme-regles-construction-extension`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Règles d\"

### `urbanisme-regles-construction-extension`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Règles d\"

### `contrat-travaux-clauses-essentielles`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Contrat Travaux : Clauses Essentielles"

### `contrat-travaux-clauses-essentielles`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Contrat Travaux : Clauses Essentielles"

### `renovation-salle-de-bain-prix-guide-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Rénovation Salle de Bain : Prix et Guide 2026"

### `renovation-salle-de-bain-prix-guide-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Rénovation Salle de Bain : Prix et Guide 2026"

### `renovation-maison-prix-m2-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Rénovation Maison au m² en 2026"

### `renovation-maison-prix-m2-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Rénovation Maison au m² en 2026"

### `cuisine-equipee-prix-pose-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Cuisine Équipée avec Pose en 2026"

### `cuisine-equipee-prix-pose-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Cuisine Équipée avec Pose en 2026"

### `toiture-renovation-prix-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Rénovation Toiture : Prix au m² en 2026"

### `toiture-renovation-prix-2026`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Rénovation Toiture : Prix au m² en 2026"

### `devis-travaux-guide-complet`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Devis Travaux : Guide pour Comparer et Négocier"

### `devis-travaux-guide-complet`
- **Fichier** : `batch-renovation-2026.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Devis Travaux : Guide pour Comparer et Négocier"

### `plombier-urgence-nuit-tarifs`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Plombier d'urgence la nuit : tarifs et conseils 2026"

### `plombier-urgence-nuit-tarifs`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Plombier d'urgence la nuit : tarifs et conseils 2026"

### `chauffagiste-urgence-hiver`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Panne de chauffage en hiver : trouver un chauffagiste en urgence"

### `chauffagiste-urgence-hiver`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Panne de chauffage en hiver : trouver un chauffagiste en urgence"

### `climatisation-panne-canicule`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Climatisation en panne pendant la canicule : que faire ?"

### `climatisation-panne-canicule`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Climatisation en panne pendant la canicule : que faire ?"

### `ramonage-obligatoire-avant-hiver`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Ramonage avant l'hiver : obligations et tarifs 2026"

### `ramonage-obligatoire-avant-hiver`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Ramonage avant l'hiver : obligations et tarifs 2026"

### `degats-gel-canalisation`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Dégâts du gel sur les canalisations : prévention et réparation"

### `degats-gel-canalisation`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Dégâts du gel sur les canalisations : prévention et réparation"

### `nettoyage-gouttiere-automne`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Nettoyage des gouttières en automne : pourquoi c'est essentiel"

### `nettoyage-gouttiere-automne`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Nettoyage des gouttières en automne : pourquoi c'est essentiel"

### `entretien-chaudiere-annuel`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Entretien annuel de la chaudière : obligations et prix 2026"

### `entretien-chaudiere-annuel`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Entretien annuel de la chaudière : obligations et prix 2026"

### `preparer-maison-hiver`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Préparer sa maison pour l'hiver : checklist complète"

### `preparer-maison-hiver`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Préparer sa maison pour l'hiver : checklist complète"

### `entretien-climatisation-printemps`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Entretien climatisation au printemps : les étapes clés"

### `entretien-climatisation-printemps`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Entretien climatisation au printemps : les étapes clés"

### `jardin-printemps-paysagiste`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Préparer son jardin au printemps : quand appeler un paysagiste"

### `jardin-printemps-paysagiste`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Préparer son jardin au printemps : quand appeler un paysagiste"

### `terrasse-ete-preparation`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Préparer sa terrasse pour l'été : nettoyage et réparations"

### `terrasse-ete-preparation`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Préparer sa terrasse pour l'été : nettoyage et réparations"

### `serrure-bloquee-nuit-weekend`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Serrure bloquée la nuit ou le week-end : solutions et tarifs"

### `serrure-bloquee-nuit-weekend`
- **Fichier** : `batch-saisonnier-urgence.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Serrure bloquée la nuit ou le week-end : solutions et tarifs"

### `preparer-maison-hiver-checklist`
- **Fichier** : `batch-saisonnier.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Préparer sa maison pour l\"

### `preparer-maison-hiver-checklist`
- **Fichier** : `batch-saisonnier.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Préparer sa maison pour l\"

### `securite-alarme-maison-guide-2026`
- **Fichier** : `batch-securite-energie.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Alarme maison 2026 : comparatif, prix et installation"

### `securite-alarme-maison-guide-2026`
- **Fichier** : `batch-securite-energie.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Alarme maison 2026 : comparatif, prix et installation"

### `pompe-chaleur-air-eau-guide-2026`
- **Fichier** : `batch-securite-energie.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Pompe à chaleur air-eau en 2026 : prix, aides et rentabilité"

### `pompe-chaleur-air-eau-guide-2026`
- **Fichier** : `batch-securite-energie.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Pompe à chaleur air-eau en 2026 : prix, aides et rentabilité"

### `panneaux-solaires-rentabilite-2026`
- **Fichier** : `batch-securite-energie.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Panneaux solaires 2026 : rentabilité réelle et retour sur investissement"

### `panneaux-solaires-rentabilite-2026`
- **Fichier** : `batch-securite-energie.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Panneaux solaires 2026 : rentabilité réelle et retour sur investissement"

### `maprimerenov-2026-guide-complet-aides-renovation`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "MaPrimeRénov' 2026 : Aides Rénovation"

### `maprimerenov-2026-guide-complet-aides-renovation`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "MaPrimeRénov' 2026 : Aides Rénovation"

### `comment-choisir-artisan-confiance-guide-2026`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Choisir un Artisan de Confiance 2026"

### `comment-choisir-artisan-confiance-guide-2026`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Choisir un Artisan de Confiance 2026"

### `prix-renovation-maison-2026-budget-complet`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Rénovation Maison 2026 : Budget"

### `prix-renovation-maison-2026-budget-complet`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Rénovation Maison 2026 : Budget"

### `pompe-a-chaleur-guide-complet-2026`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Pompe à Chaleur 2026 : Prix et Aides"

### `pompe-a-chaleur-guide-complet-2026`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Pompe à Chaleur 2026 : Prix et Aides"

### `isolation-maison-guide-complet-materiaux-prix-aides`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Isolation Maison 2026 : Prix et Aides"

### `isolation-maison-guide-complet-materiaux-prix-aides`
- **Fichier** : `batch-seo-boost1.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Isolation Maison 2026 : Prix et Aides"

### `dpe-diagnostic-performance-energetique-tout-savoir`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "DPE 2026 : Diagnostic de Performance"

### `dpe-diagnostic-performance-energetique-tout-savoir`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "DPE 2026 : Diagnostic de Performance"

### `devis-travaux-comprendre-comparer-negocier`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Devis Travaux : Comparer et Négocier"

### `devis-travaux-comprendre-comparer-negocier`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Devis Travaux : Comparer et Négocier"

### `renovation-salle-de-bain-guide-complet-prix-2026`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Rénovation Salle de Bain 2026 : Prix"

### `renovation-salle-de-bain-guide-complet-prix-2026`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Rénovation Salle de Bain 2026 : Prix"

### `entretien-maison-calendrier-annuel-checklist`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Entretien Maison : Checklist Annuelle 2026"

### `entretien-maison-calendrier-annuel-checklist`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Entretien Maison : Checklist Annuelle 2026"

### `arnaques-artisans-reconnaitre-eviter-recours`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Arnaques Artisans : Reconnaître et Éviter"

### `arnaques-artisans-reconnaitre-eviter-recours`
- **Fichier** : `batch-seo-boost2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Arnaques Artisans : Reconnaître et Éviter"

### `eco-ptz-2026-pret-taux-zero-renovation`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Éco-PTZ 2026 : Prêt à Taux Zéro Travaux"

### `eco-ptz-2026-pret-taux-zero-renovation`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Éco-PTZ 2026 : Prêt à Taux Zéro Travaux"

### `renovation-energetique-par-ou-commencer`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Rénovation Énergétique 2026 : Par Où Commencer"

### `renovation-energetique-par-ou-commencer`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Rénovation Énergétique 2026 : Par Où Commencer"

### `prix-toiture-2026-refection-reparation-materiaux`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Prix Toiture 2026 : Réfection et Tarifs"

### `prix-toiture-2026-refection-reparation-materiaux`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Prix Toiture 2026 : Réfection et Tarifs"

### `normes-electriques-2026-nfc-15-100-guide`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Normes NF C 15-100 : Guide Complet 2026"

### `normes-electriques-2026-nfc-15-100-guide`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Normes NF C 15-100 : Guide Complet 2026"

### `fuite-eau-urgence-guide-complet-gestes-couts`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Fuite d\"

### `fuite-eau-urgence-guide-complet-gestes-couts`
- **Fichier** : `batch-seo-boost3.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Fuite d\"

### `comment-reparer-fuite-toilette`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Réparer une Fuite de Toilette Soi-Même"

### `comment-reparer-fuite-toilette`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Réparer une Fuite de Toilette Soi-Même"

### `comment-installer-mitigeur-douche`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Installer un Mitigeur de Douche : Tutoriel"

### `comment-installer-mitigeur-douche`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Installer un Mitigeur de Douche : Tutoriel"

### `comment-changer-interrupteur`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Changer un Interrupteur Électrique en Sécurité"

### `comment-changer-interrupteur`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Changer un Interrupteur Électrique en Sécurité"

### `comment-poser-credence-cuisine`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Poser une Crédence de Cuisine : Guide"

### `comment-poser-credence-cuisine`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Poser une Crédence de Cuisine : Guide"

### `comment-reparer-volet-roulant`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Réparer un Volet Roulant Bloqué : Solutions"

### `comment-reparer-volet-roulant`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Réparer un Volet Roulant Bloqué : Solutions"

### `comment-changer-chasse-eau`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Changer un Mécanisme de Chasse d\"

### `comment-changer-chasse-eau`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Changer un Mécanisme de Chasse d\"

### `comment-installer-store-fenetre`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Installer un Store de Fenêtre : Tutoriel"

### `comment-installer-store-fenetre`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Installer un Store de Fenêtre : Tutoriel"

### `comment-poser-lambris-mur`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Poser du Lambris sur un Mur : Guide"

### `comment-poser-lambris-mur`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Poser du Lambris sur un Mur : Guide"

### `comment-enduire-mur-abime`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Enduire un Mur Abîmé avant Peinture"

### `comment-enduire-mur-abime`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Enduire un Mur Abîmé avant Peinture"

### `comment-installer-robinet-machine-laver`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Installer un Robinet de Machine à Laver"

### `comment-installer-robinet-machine-laver`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Installer un Robinet de Machine à Laver"

### `comment-remplacer-joint-fenetre`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Remplacer un Joint de Fenêtre : Isolation"

### `comment-remplacer-joint-fenetre`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Remplacer un Joint de Fenêtre : Isolation"

### `comment-fixer-meuble-mur-placo`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Fixer un Meuble Lourd sur un Mur en Placo"

### `comment-fixer-meuble-mur-placo`
- **Fichier** : `batch-tutoriels-diy-2.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Fixer un Meuble Lourd sur un Mur en Placo"

### `comment-deboucher-wc-guide`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Comment Déboucher un WC : 7 Méthodes Efficaces"

### `comment-deboucher-wc-guide`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Comment Déboucher un WC : 7 Méthodes Efficaces"

### `comment-peindre-mur-guide`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Comment Peindre un Mur : Guide Étape par Étape"

### `comment-peindre-mur-guide`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Comment Peindre un Mur : Guide Étape par Étape"

### `comment-poser-carrelage-sol`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Comment Poser du Carrelage au Sol : Tutoriel Complet"

### `comment-poser-carrelage-sol`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Comment Poser du Carrelage au Sol : Tutoriel Complet"

### `comment-changer-robinet-cuisine`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Comment Changer un Robinet de Cuisine Soi-Même"

### `comment-changer-robinet-cuisine`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Comment Changer un Robinet de Cuisine Soi-Même"

### `comment-installer-prise-electrique`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Installer une Prise Électrique : Guide et Sécurité"

### `comment-installer-prise-electrique`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Installer une Prise Électrique : Guide et Sécurité"

### `comment-refaire-joint-salle-de-bain`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Refaire un Joint de Salle de Bain : Tutoriel"

### `comment-refaire-joint-salle-de-bain`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Refaire un Joint de Salle de Bain : Tutoriel"

### `comment-poser-parquet-flottant`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Poser du Parquet Flottant : Guide Pas à Pas"

### `comment-poser-parquet-flottant`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Poser du Parquet Flottant : Guide Pas à Pas"

### `comment-peindre-plafond`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Comment Peindre un Plafond Sans Traces"

### `comment-peindre-plafond`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Comment Peindre un Plafond Sans Traces"

### `comment-reboucher-trou-mur`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Reboucher un Trou dans un Mur : Techniques"

### `comment-reboucher-trou-mur`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Reboucher un Trou dans un Mur : Techniques"

### `comment-changer-joint-robinet`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Changer un Joint de Robinet qui Fuit"

### `comment-changer-joint-robinet`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Changer un Joint de Robinet qui Fuit"

### `comment-installer-wc-suspendu`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Installer un WC Suspendu : Guide Complet"

### `comment-installer-wc-suspendu`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Installer un WC Suspendu : Guide Complet"

### `comment-poser-etagere-murale`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Poser une Étagère Murale : Fixation et Niveaux"

### `comment-poser-etagere-murale`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Poser une Étagère Murale : Fixation et Niveaux"

### `comment-refaire-electricite-appartement`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Refaire l'Électricité d'un Appartement : Guide"

### `comment-refaire-electricite-appartement`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Refaire l'Électricité d'un Appartement : Guide"

### `comment-isoler-fenetre-froid`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Isoler une Fenêtre du Froid : Solutions Efficaces"

### `comment-isoler-fenetre-froid`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Isoler une Fenêtre du Froid : Solutions Efficaces"

### `comment-deboucher-canalisation-naturellement`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaTitle MANQUANT
- **Fix** : Ajouter un metaTitle optimisé basé sur le title: "Déboucher une Canalisation Naturellement : 5 Astuces"

### `comment-deboucher-canalisation-naturellement`
- **Fichier** : `batch-tutoriels-diy.ts`
- **Problème** : metaDescription MANQUANTE
- **Fix** : Ajouter une metaDescription avec CTA basée sur le title: "Déboucher une Canalisation Naturellement : 5 Astuces"

---

## IMPORTANTS (77)

> Pas de mot-clé transactionnel, pas de "2026", ou metaTitle 60-70 chars

### `aide-installation-borne-recharge-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaTitle entre 60-70 chars: 61 chars
- **Actuel** : `Aides Borne de Recharge VE 2026 : Crédit d'Impôt — Guide 2026`
- **Fix** : Raccourcir à 60 chars pour éviter la troncature

### `entretien-annuel-maison-checklist-complete`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Entretien Maison : checklist annuelle 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `humidite-moisissure-maison-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Humidité et Moisissures : solutions durables`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `humidite-moisissure-maison-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Humidité et Moisissures : solutions durables`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `depannage-urgence-artisan-bons-reflexes`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Dépannage Urgence Maison : les bons réflexes`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `depannage-urgence-artisan-bons-reflexes`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Dépannage Urgence Maison : les bons réflexes`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `travaux-locataire-proprietaire-qui-paye`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Locataire ou Propriétaire : qui paye quoi ?`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `travaux-locataire-proprietaire-qui-paye`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Locataire ou Propriétaire : qui paye quoi ?`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `economiser-facture-energie-astuces`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `15 Astuces pour Réduire sa Facture Énergie`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `economiser-facture-energie-astuces`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `15 Astuces pour Réduire sa Facture Énergie`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `bruit-isolation-phonique-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Isolation Phonique : solutions anti-bruit 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `securiser-maison-cambriolage-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Sécuriser sa Maison : guide anti-cambriolage`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `comment-choisir-electricien-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir son Électricien : 6 critères clés 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-serrurier-conseils`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir un Serrurier : éviter les arnaques 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-menuisier-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir son Menuisier en 2026 : les critères`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-macon-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir son Maçon en 2026 : les bons réflexes`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-couvreur-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir son Couvreur : éviter les pièges 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-climaticien-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir son Climaticien 2026 : certifications`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-cuisiniste-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir son Cuisiniste : 7 critères (2026)`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-entreprise-nettoyage`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir une Entreprise de Nettoyage (2026)`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `tva-reduite-travaux-renovation-guide`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `TVA Travaux 2026 : 5,5%, 10% ou 20% ?`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `permis-construire-declaration-prealable-guide`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Permis ou Déclaration Préalable ? (2026)`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `certificats-economies-energie-cee-guide`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `CEE 2026 : jusqu\`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `eco-pret-taux-zero-guide-complet-2026`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Éco-PTZ 2026 : jusqu\`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `accessibilite-pmr-logement-normes`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Accessibilité PMR : jusqu\`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `accessibilite-pmr-logement-normes`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Accessibilité PMR : jusqu\`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `preparer-chauffage-hiver-2026-check-list`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Chauffage hiver 2026 : check-list entretien`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `travaux-printemps-check-list-2026`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Travaux printemps 2026 : check-list complète`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `preparer-maison-avant-vacances-ete`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Sécuriser sa maison avant les vacances`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `preparer-maison-avant-vacances-ete`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Sécuriser sa maison avant les vacances`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `purger-radiateurs-avant-hiver-guide`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Purger radiateurs : tuto simple avant hiver`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `purger-radiateurs-avant-hiver-guide`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Purger radiateurs : tuto simple avant hiver`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `entretien-toiture-automne-guide`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Entretien toiture automne : guide complet`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `proteger-canalisations-gel-hiver`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Canalisations gel hiver : protection guide`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `entretien-piscine-ouverture-printemps`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Ouverture piscine printemps : guide étapes`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `hivernage-piscine-guide-complet`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Hivernage piscine : guide actif vs passif`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `taille-haies-arbres-reglementation-2026`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Taille haies arbres 2026 : réglementation`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `demoussage-facade-meilleure-periode`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Démoussage façade : période, prix, produits`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `isolation-combles-ete-preparation-hiver`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Isolation combles en été : préparer l\`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `isolation-combles-ete-preparation-hiver`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Isolation combles en été : préparer l\`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `entretien-chauffe-eau-detartrage-annuel`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Détartrage chauffe-eau : quand et combien`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `renovation-energetique-meilleure-saison`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Rénovation énergétique : quelle saison ?`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `renovation-energetique-meilleure-saison`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Rénovation énergétique : quelle saison ?`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `fuite-eau-que-faire-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Fuite d'Eau Urgence : Gestes Immédiats + Plombier`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `fuite-eau-que-faire-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Fuite d'Eau Urgence : Gestes Immédiats + Plombier`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `panne-electricite-nuit-que-faire`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Panne Électrique la Nuit : Diagnostic + Solutions`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `panne-electricite-nuit-que-faire`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Panne Électrique la Nuit : Diagnostic + Solutions`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `serrure-cassee-porte-claquee-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Porte Claquée/Serrure Cassée : Guide Anti-Arnaque`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `chaudiere-en-panne-hiver-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Chaudière en Panne Hiver : Réflexes + Solutions`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `chaudiere-en-panne-hiver-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Chaudière en Panne Hiver : Réflexes + Solutions`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `degat-des-eaux-que-faire-2026`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Dégât des Eaux 2026 : Constat, Assurance, Étapes`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `toiture-fuite-urgence-que-faire`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Fuite Toiture Urgence : Bâchage + Réparation`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `toiture-fuite-urgence-que-faire`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Fuite Toiture Urgence : Bâchage + Réparation`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `canalisation-bouchee-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Canalisation Bouchée : Solutions DIY + Prix Plombier`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `vitre-cassee-urgence-securisation`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Vitre Cassée Urgence : Sécurisation + Remplacement`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `vitre-cassee-urgence-securisation`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Vitre Cassée Urgence : Sécurisation + Remplacement`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `panne-chauffage-bebe-personnes-agees`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Panne Chauffage Bébé/Âgé : Solutions d'Urgence`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `panne-chauffage-bebe-personnes-agees`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Panne Chauffage Bébé/Âgé : Solutions d'Urgence`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `cambriolage-securiser-porte-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Après Cambriolage : Sécuriser Porte en Urgence`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `cambriolage-securiser-porte-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Après Cambriolage : Sécuriser Porte en Urgence`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `comment-choisir-son-plombier`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Choisir son Plombier en 2026 : 7 vérifications`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `tendances-salle-de-bain-2026`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Tendances Salle de Bain 2026 : 8 inspirations`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `peinture-interieure-conseils`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Peinture Intérieure 2026 : Conseils de pros`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `chauffage-solution-economique`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Chauffage Économique 2026 : quel système choisir ?`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `trouver-artisan-verifie-siren`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Vérifier un Artisan par son SIREN : Comment ?`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `trouver-artisan-verifie-siren`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Vérifier un Artisan par son SIREN : Comment ?`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `renovation-maison-par-ou-commencer`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Rénovation Maison : par où commencer ? (2026)`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `artisan-pas-cher-attention-arnaques`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Artisan Pas Cher = Arnaque ? Les signaux 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `prix-plombier-2026-tarifs-horaires`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle entre 60-70 chars: 66 chars
- **Actuel** : `Prix Plombier 2026 : Tarifs Dépannage, Réparation et Devis Gratuit`
- **Fix** : Raccourcir à 60 chars pour éviter la troncature

### `aide-maprimerenov-2026-montants-conditions`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `MaPrimeRénov\`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `aide-maprimerenov-2026-montants-conditions`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `MaPrimeRénov\`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `travaux-renovation-energetique-par-ou-commencer`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Rénovation Énergétique 2026 : ordre des travaux`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `devis-travaux-comment-comparer-choisir`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans "2026"
- **Actuel** : `Comparer des Devis Travaux : 5 critères clés`
- **Fix** : Ajouter "2026" pour le signal de fraîcheur

### `10-arnaques-courantes-batiment`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `10 Arnaques Bâtiment à Connaître en 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `prix-electricien-2026-tarifs-travaux`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle entre 60-70 chars: 67 chars
- **Actuel** : `Prix Électricien 2026 : Tarifs au m², Intervention et Devis Gratuit`
- **Fix** : Raccourcir à 60 chars pour éviter la troncature

### `chauffage-pompe-chaleur-vs-chaudiere-gaz-2026`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `PAC vs Chaudière Gaz 2026 : le vrai comparatif`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

### `droits-obligations-travaux-chez-soi`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaTitle sans mot-clé transactionnel
- **Actuel** : `Travaux à Domicile : droits et obligations 2026`
- **Fix** : Ajouter un mot-clé (Prix, Devis, Guide, Tarif, Gratuit, etc.)

---

## MINEURS (112)

> metaDescription > 160 chars ou sans CTA

### `cee-certificats-economies-energie-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `CEE 2026 : prime énergie de 150 à 5 000€, cumul MaPrimeRénov', conditions. Guide complet pour obtenir vos certificats d'économies d'énergie.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `eco-ptz-2026-pret-taux-zero-renovation`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Éco-PTZ 2026 : prêt sans intérêts de 7 000 à 50 000€, sans condition de revenus. Travaux éligibles, banques, démarches complètes.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `tva-reduite-travaux-5-5-10-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `TVA travaux 2026 : 5,5% pour la rénovation énergétique, 10% pour la rénovation classique, 20% pour le neuf. Conditions et attestations.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `aide-renovation-energetique-paris-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Aides rénovation Paris 2026 : Éco-Rénovons Paris+ jusqu'à 20 000€, aides IDF, cumul MaPrimeRénov'. Toutes les subventions locales.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `aide-renovation-energetique-lyon-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Aides rénovation Lyon 2026 : ÉcoRénov jusqu'à 12 000€, aides Métropole, cumul MaPrimeRénov'. Toutes les subventions lyonnaises.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `aide-renovation-energetique-marseille-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Aides rénovation Marseille 2026 : aides Métropole jusqu'à 10 000€, subventions PACA, cumul MaPrimeRénov'. Guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `aide-renovation-energetique-bordeaux-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Aides rénovation Bordeaux 2026 : aides Métropole jusqu'à 8 000€, subventions Nouvelle-Aquitaine, cumul MaPrimeRénov'. Guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `aide-renovation-energetique-toulouse-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Aides rénovation Toulouse 2026 : aides Métropole jusqu'à 7 000€, subventions Occitanie, cumul MaPrimeRénov'. Guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `mon-accompagnateur-renov-2026-guide`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Mon Accompagnateur Rénov' 2026 : obligatoire pour le parcours accompagné, rôle, coût (pris en charge), trouver un MAR agréé.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `audit-energetique-obligatoire-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Audit énergétique 2026 : obligatoire pour vente F/G, prix 800-1 500€, différence DPE vs audit. Guide complet des obligations.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `passoire-thermique-interdiction-location-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Interdiction location DPE G depuis 2025, DPE F en 2028, DPE E en 2034. Que faire ? Aides, travaux et calendrier pour les bailleurs.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `cumul-aides-renovation-2026-tableau`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Cumul aides rénovation 2026 : MaPrimeRénov' + CEE + éco-PTZ + TVA 5,5% + aides locales. Tableau récapitulatif et plafonds.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `aide-installation-borne-recharge-2026`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Aides borne de recharge 2026 : crédit d'impôt 300€, ADVENIR copropriété jusqu'à 960€, TVA 5,5%. Guide complet installation borne VE.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `cheque-energie-2026-montant-utilisation`
- **Fichier** : `batch-aides-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Chèque énergie 2026 : montants 48 à 277€, éligibilité automatique, utilisation factures et travaux. Guide complet d'utilisation.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `entretien-annuel-maison-checklist-complete`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Checklist entretien maison complète : toiture, plomberie, chauffage, façade. Évitez 15-20% de dépréciation. Téléchargez la liste.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `humidite-moisissure-maison-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Moisissures, condensation, remontées capillaires : identifier la cause et traiter durablement. Solutions de 50 à 5 000€ selon le cas.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `depannage-urgence-artisan-bons-reflexes`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Fuite d\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `travaux-locataire-proprietaire-qui-paye`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Réparations locataire vs propriétaire : qui paye la chaudière, la plomberie, les volets ? Liste officielle des charges par poste.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `economiser-facture-energie-astuces`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `15 astuces testées pour baisser sa facture énergie de 20 à 40%. Isolation, chauffage, habitudes : du plus simple au plus rentable.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `bruit-isolation-phonique-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Isolation phonique murs, sols, plafonds : solutions de 15 à 100€/m². Réduisez le bruit de 30 à 50 dB. Guide technique + prix.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `securiser-maison-cambriolage-solutions`
- **Fichier** : `batch-conseils.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment sécuriser sa maison ? Serrure A2P, alarme, caméra, éclairage : les solutions de 80 à 5 000€. 70% des cambrioleurs fuient en 3 min.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-electricien-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment choisir un électricien fiable ? Qualifelec, RGE, assurance, avis : les 6 critères essentiels. Checklist gratuite + devis.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-serrurier-conseils`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment trouver un serrurier honnête en urgence ? Les 5 signaux d'arnaque + réflexes anti-surfacturation. Tarifs réels inclus.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-carreleur-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment choisir un carreleur ? Qualifications, techniques, assurances : tout vérifier avant de signer. Exemples de pose + devis.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-vitrier-guide`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment choisir un vitrier, y compris en urgence ? Certifications, tarifs normaux, pièges. Ne surpayez plus votre intervention.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-entreprise-nettoyage`
- **Fichier** : `batch-metiers.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment choisir un service de nettoyage pro ? Agréments, assurances, contrat : les critères pour copropriétés et fin de chantier.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-architecte-interieur-2026-tarifs`
- **Fichier** : `batch-prix-design.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs architecte d'intérieur 2026 : consultation 80-200€, projet complet 50-150€/m², suivi chantier 8-15% du budget. Prix réels + conseils.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-decorateur-2026-tarifs`
- **Fichier** : `batch-prix-design.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs décorateur 2026 : conseil déco 50-150€/h, home staging 2 000-5 000€, shopping list 300-800€. Prix réels du marché français.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-ramoneur-2026-tarifs`
- **Fichier** : `batch-prix-design.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs ramoneur 2026 : ramonage cheminée 50-90€, poêle à bois 60-100€, chaudière 80-150€, inspection vidéo 100-200€. Prix réels.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-paysagiste-2026-tarifs`
- **Fichier** : `batch-prix-design.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs paysagiste 2026 : création jardin 30-80€/m², terrasse 80-250€/m², élagage 200-800€, entretien 150-400€/mois. Prix réels.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-pisciniste-2026-tarifs`
- **Fichier** : `batch-prix-design.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs pisciniste 2026 : piscine coque 15 000-30 000€, béton 25 000-60 000€, liner 1 500-4 000€, entretien 100-200€/mois. Prix réels.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-ferronnier-2026-tarifs-ferronnerie`
- **Fichier** : `batch-prix-metal-bois.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs ferronnier 2026 : rampe fer forgé 200-500€/ml, portail 2 500-8 000€, grille 150-400€/ml. Prix réels du marché français.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-poseur-de-parquet-2026-tarifs-pose`
- **Fichier** : `batch-prix-metal-bois.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs poseur de parquet 2026 : stratifié 15-30€/m², contrecollé 25-50€/m², massif 40-80€/m². Prix pose + fourniture par type.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-miroitier-2026-tarifs-vitrage`
- **Fichier** : `batch-prix-metal-bois.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs miroitier 2026 : miroir sur mesure 80-300€/m², crédence verre 150-400€/m², pare-douche 300-1 200€. Prix réels 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-storiste-2026-tarifs-stores-volets`
- **Fichier** : `batch-prix-metal-bois.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs storiste 2026 : store banne 800-4 000€, volet roulant 300-1 200€, pergola bioclimatique 5 000-15 000€. Prix réels + devis.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-artisans-province-vs-paris`
- **Fichier** : `batch-prix-regionaux.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comparatif tarifs artisans Paris vs province 2026 : écarts de 25 à 60% selon le métier. 10 villes comparées + conseils pour économiser.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `index-prix-travaux-2026`
- **Fichier** : `batch-prix-regionaux.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Index officiel des prix travaux 2026 : évolution par métier, tendances des matériaux (+18%). Référence pour comparer vos devis.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-desinsectisation-2026-tarifs`
- **Fichier** : `batch-prix-services.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs désinsectisation 2026 : cafards 80-250€, punaises de lit 150-500€, nid de guêpes 80-200€. Prix réels + conseils pour choisir un pro.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-deratisation-2026-tarifs`
- **Fichier** : `batch-prix-services.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs dératisation 2026 : souris 80-200€, rats 120-400€, contrat annuel 300-1200€. Prix réels constatés + conseils pour choisir un dératiseur.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-renovation-energetique-2026-tarifs`
- **Fichier** : `batch-prix-services.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Budget rénovation énergétique 2026 : audit 300-800€, rénovation globale 15000-60000€. Aides MaPrimeRénov + CEE + éco-PTZ détaillées.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-alarme-securite-2026-tarifs`
- **Fichier** : `batch-prix-tech.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs alarme maison 2026 : alarme sans fil 400-1 800€, vidéosurveillance 800-3 500€, interphone 300-2 000€. Prix réels + guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-antenniste-2026-tarifs`
- **Fichier** : `batch-prix-tech.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs antenniste 2026 : antenne TNT 100-300€, parabole 200-600€, tirage fibre 150-500€. Prix réels + guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-ascensoriste-2026-tarifs`
- **Fichier** : `batch-prix-tech.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs ascensoriste 2026 : ascenseur privatif 15 000-40 000€, monte-escalier 3 000-12 000€, entretien 1 500-3 500€/an. Prix réels.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-diagnostiqueur-2026-tarifs`
- **Fichier** : `batch-prix-tech.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs diagnostiqueur 2026 : DPE 120-250€, amiante 80-200€, pack complet vente 300-700€. Prix réels + obligations légales.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-geometre-2026-tarifs`
- **Fichier** : `batch-prix-tech.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs géomètre 2026 : bornage 800-2 500€, division parcellaire 1 500-4 000€, relevé topo 500-2 000€. Prix réels + guide.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-serrurier-2026-tarifs-interventions`
- **Fichier** : `batch-prix.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs serrurier 2026 : ouverture porte 80-150€, serrure 3 points 250-850€, blindage 600-1 200€. Prix réels + guide anti-arnaque.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-chauffagiste-2026-installation-entretien`
- **Fichier** : `batch-prix.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs chauffagiste 2026 : entretien chaudière 90-180€, PAC 8 000-18 000€, dépannage 100-400€. Prix réels par prestation et région.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-carreleur-2026-pose-fourniture`
- **Fichier** : `batch-prix.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs carreleur 2026 : pose sol 30-70€/m², faïence 40-80€/m², terrasse 50-100€/m². Prix réels fourniture + main-d'oeuvre.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-macon-2026-gros-oeuvre-renovation`
- **Fichier** : `batch-prix.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarifs maçon 2026 : fondations 100-200€/ml, mur parpaing 50-100€/m², dalle béton 60-120€/m². Prix réels par prestation.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-cuisiniste-2026-pose-cuisine`
- **Fichier** : `batch-prix.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Prix cuisine 2026 : entrée de gamme 3 000-6 000€, milieu 6 000-15 000€, haut de gamme 15 000€+. Tarifs pose + fourniture détaillés.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `assurance-dommages-ouvrage-guide-complet`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Assurance dommages-ouvrage expliquée : coût 1-4% du chantier, amende 75 000€ sans. Qui doit souscrire, quand et pourquoi.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `tva-reduite-travaux-renovation-guide`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Quel taux de TVA pour vos travaux ? 5,5% (réno énergétique), 10% (rénovation), 20% (neuf). Conditions détaillées + exemples.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `permis-construire-declaration-prealable-guide`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Permis de construire ou déclaration préalable ? Le seuil des 20m² (40m² en PLU). Délais, documents et cas concrets expliqués.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `certificats-economies-energie-cee-guide`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Primes CEE 2026 : PAC 2 500-4 000€, isolation 10-25€/m². Cumulables avec MaPrimeRénov\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `eco-pret-taux-zero-guide-complet-2026`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Éco-PTZ 2026 : empruntez jusqu\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `accessibilite-pmr-logement-normes`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Normes PMR logement et aides 2026 : MaPrimeAdapt\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `aides-renovation-2026-cumul-guide`
- **Fichier** : `batch-reglementation.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment cumuler MaPrimeRénov\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `preparer-chauffage-hiver-2026-check-list`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Check-list complète pour préparer votre chauffage avant l\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `entretien-climatisation-ete-2026`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Entretien climatisation été 2026 : nettoyage filtres, recharge fluide, contrôle étanchéité. Prix 80-250€, obligations légales et conseils d\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `travaux-printemps-check-list-2026`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Check-list travaux de printemps 2026 : toiture, gouttières, façade, jardin, peinture, terrasse. 20 points à vérifier + prix indicatifs par poste.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `preparer-maison-avant-vacances-ete`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Guide complet pour préparer sa maison avant les vacances d\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `ramonage-obligatoire-2026-reglementation`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Ramonage obligatoire 2026 : 1 à 2 fois/an selon le combustible. Prix 50-120€, certificat pour assurance, amende 450€. Réglementation complète.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `purger-radiateurs-avant-hiver-guide`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment purger ses radiateurs en 6 étapes simples. Matériel nécessaire, ordre de purge, pression circuit. Tuto DIY illustré + conseils pro.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `entretien-toiture-automne-guide`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Entretien toiture automne : nettoyage gouttières 80-200€, démoussage 15-30€/m², inspection tuiles. Guide complet pour préparer l\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `proteger-canalisations-gel-hiver`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Protéger canalisations du gel : manchons isolants 2-8€/m, câble chauffant 15-40€/m, vidange robinets. Guide complet prévention + réparation.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `entretien-piscine-ouverture-printemps`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Ouverture piscine printemps : 12 étapes pour remettre votre bassin en service. Nettoyage, filtration, traitement eau, produits. Budget 100-300€.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `hivernage-piscine-guide-complet`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Hivernage piscine actif ou passif : étapes, produits (50-100€), protection gel. Guide complet pour préserver votre bassin pendant l\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `taille-haies-arbres-reglementation-2026`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Taille haies et arbres 2026 : périodes légales, distance 0,5-2m de la clôture, hauteur max, sanctions. Réglementation complète + droits voisinage.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `demoussage-facade-meilleure-periode`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Démoussage façade : meilleure période automne/printemps, prix 15-40€/m², produits pro. Guide complet pour une façade propre et protégée.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `isolation-combles-ete-preparation-hiver`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Isoler ses combles en été : soufflage 20-35€/m², panneaux 40-80€/m², aides MaPrimeRénov\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `entretien-chauffe-eau-detartrage-annuel`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Détartrage chauffe-eau : tous les 2-3 ans, prix 150-300€. Signes d\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `renovation-energetique-meilleure-saison`
- **Fichier** : `batch-saisonniers-2026.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Calendrier optimal rénovation énergétique : isolation en été, chauffage au printemps, fenêtres au printemps/automne. Planifiez pour économiser.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `fuite-eau-que-faire-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Fuite d'eau : coupez l'arrivée, protégez vos biens, identifiez l'origine. Guide pas à pas + quand appeler un plombier. Prix indicatifs 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `panne-electricite-nuit-que-faire`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Panne d'électricité la nuit : vérifiez le disjoncteur, identifiez la cause, gestes de sécurité. Guide complet + tarifs électricien urgence 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `serrure-cassee-porte-claquee-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Porte claquée, serrure cassée : vrais prix 2026 (80-300€), réflexes anti-arnaque, et comment trouver un serrurier fiable. Guide d'urgence complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `chaudiere-en-panne-hiver-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Chaudière en panne en hiver : vérifiez pression, thermostat, alimentation. Gestes de sécurité, solutions de chauffage d'appoint, prix dépannage 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `degat-des-eaux-que-faire-2026`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Dégât des eaux : constat amiable, déclaration sous 5 jours, recherche de fuite, indemnisation. Guide complet des étapes et droits en 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `toiture-fuite-urgence-que-faire`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Fuite de toiture : bâchage d'urgence, protection intérieure, quand appeler un couvreur. Prix réparation 2026 : 150-2 500€ selon dégâts.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `canalisation-bouchee-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Canalisation bouchée : ventouse, furet, bicarbonate. Méthodes DIY efficaces + quand appeler un plombier. Prix débouchage 2026 : 100-400€.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `vitre-cassee-urgence-securisation`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Vitre cassée : sécurisation immédiate, protection contre le froid et les intrusions, prix remplacement vitrier 2026 : 100-600€ selon type.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `panne-chauffage-bebe-personnes-agees`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Panne de chauffage avec bébé ou personne âgée : maintenir 19°C, solutions d'appoint sûres, risques hypothermie, quand appeler un chauffagiste.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `cambriolage-securiser-porte-urgence`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Après un cambriolage : police, sécurisation porte, déclaration assurance sous 2 jours. Étapes, prix serrurier, droits victimes. Guide 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-peintre-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un peintre en bâtiment : 8 critères clés, certifications Qualibat, questions à poser, red flags. Guide expert pour ne pas se tromper.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-terrassier-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un terrassier : qualifications, engins, assurance décennale, devis détaillé. 7 critères clés + red flags pour ne pas se tromper.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-facadier-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un façadier : Qualibat, RGE, assurance décennale, devis détaillé. Ravalement, ITE, crépi. Prix 2026 et critères de sélection.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-charpentier-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un charpentier : Qualibat, Compagnons du Devoir, spécialisations bois/métal. Critères, prix 2026, red flags à éviter.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-etancheiste-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un étanchéiste : Qualibat 3211/3212, CSFE, assurance décennale. Toit-terrasse, cuvelage, membrane. Prix et critères 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-installateur-panneaux-solaires-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Installateur panneaux solaires : RGE QualiPV obligatoire, dimensionnement, prix 2026 (7 000-15 000€), arnaques. Guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-installateur-alarme-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Installateur alarme : certification NF A2P, APSAD, télésurveillance. Prix installation 2026 : 500-3 000€. Critères et arnaques à éviter.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-ramoneur-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un ramoneur : Qualibat, certification, ramonage obligatoire 1-2x/an, prix 50-120€. Critères, obligations légales et conseils.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-decorateur-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un décorateur d'intérieur : formations, portfolio, tarifs (50-150€/h), différences avec architecte d'intérieur. Guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-ferronnier-guide`
- **Fichier** : `batch-urgences-guides.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Choisir un ferronnier : Qualibat, Meilleur Ouvrier de France, fer forgé, portail, garde-corps. Prix 2026 et critères de sélection.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-son-plombier`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment choisir un plombier fiable ? SIRET, décennale, avis, devis : les 7 vérifications indispensables. 15% des litiges BTP = plomberie.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `renovation-energetique-aides-2026`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `MaPrimeRénov\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `tendances-salle-de-bain-2026`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tendances salle de bain 2026 : douche italienne, matériaux naturels, robinetterie noire. 8 idées déco + budgets. Inspirez-vous.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `devis-travaux-comprendre`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment lire un devis travaux ? Mentions obligatoires, pièges fréquents, astuces de négociation. Économisez jusqu\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `electricite-normes-securite`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Norme NF C 15-100 expliquée : obligations, mise aux normes, diagnostic. 30% des incendies = origine électrique. Vérifiez votre logement.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `peinture-interieure-conseils`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Peinture intérieure réussie : préparation, choix couleurs, techniques pro. Les erreurs qui ruinent le résultat. Guide étape par étape.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `chauffage-solution-economique`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comparatif chauffage 2026 : PAC, poêle à granulés, chaudière gaz. Coûts, économies et aides. Réduisez votre facture de 40 à 60%.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `combien-coute-un-plombier-tarifs-devis`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Tarif horaire plombier 40-90€/h selon région. Débouchage 90-450€, fuite 120-350€, chauffe-eau 400-1 200€. Prix réels 2026.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `trouver-artisan-verifie-siren`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment vérifier un artisan via son SIREN ? Méthode en 3 étapes : INSEE, assurance décennale, Qualibat. Évitez les faux artisans.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `renovation-maison-par-ou-commencer`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Rénovation maison étape par étape : ordre des travaux, budget, choix artisans. Les 5 erreurs qui font exploser le budget. Guide complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `artisan-pas-cher-attention-arnaques`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Devis trop bas = piège ? Les 6 signaux d\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-verifier-artisan-avant-engager`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment vérifier un artisan ? SIRET, décennale, Qualibat, avis clients : checklist complète en 5 min. Ne signez plus les yeux fermés.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `travaux-renovation-energetique-par-ou-commencer`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Rénovation énergétique : dans quel ordre ? Isolation, chauffage, ventilation. Maximisez les aides (40-70% financés). Guide expert.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `devis-travaux-comment-comparer-choisir`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Comment comparer 3 devis travaux ? Les 5 critères au-delà du prix. Écarts de 50% entre artisans pour la même prestation. Guide pratique.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `10-arnaques-courantes-batiment`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Les 10 arnaques les plus courantes dans le bâtiment : faux artisans, devis gonflés, travaux fantômes. Comment les repérer et s\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `prix-electricien-2026-tarifs-travaux`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Découvrez les tarifs d\`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `garantie-decennale-tout-savoir`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Garantie décennale expliquée : couverture, recours, sinistres. 30% des sinistres non déclarés par méconnaissance. Protégez vos travaux.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `comment-choisir-cuisine-equipee-guide`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Cuisine équipée 2026 : matériaux, agencement, budget (3 000 à 40 000€). Les 7 erreurs qui coûtent cher. Guide de choix complet.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `chauffage-pompe-chaleur-vs-chaudiere-gaz-2026`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Pompe à chaleur vs chaudière gaz 2026 : coût, conso, aides. PAC 8 000-16 000€ vs gaz 2 500-8 000€. Quel retour sur investissement ?`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

### `droits-obligations-travaux-chez-soi`
- **Fichier** : `existing-articles.ts`
- **Problème** : metaDescription sans CTA
- **Actuel** : `Travaux chez soi en 2026 : autorisations, horaires légaux, nuisances, responsabilités. Ce que dit la loi. Évitez amendes et conflits.`
- **Fix** : Ajouter un CTA (devis gratuit, comparez, estimez, trouvez, etc.)

