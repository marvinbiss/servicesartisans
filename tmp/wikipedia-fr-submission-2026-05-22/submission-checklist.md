# Wikipedia FR — Checklist de soumission (brouillon ServicesArtisans)

> **Statut** : Pré-soumission. Date de génération : 2026-05-22. **Aucun appel API
> live**. Risque de suppression rapide identifié — lire en entier avant d'agir.

## TL;DR — Recommandation honnête

**Ne pas soumettre en article principal dans l'immédiat.**

Le brouillon `ServicesArtisans.wiki` est encyclopédiquement correct (NPOV, sources
factuelles vérifiables, sans claim non sourcé), mais ne franchira probablement
pas le seuil WP:NESP (notabilité entreprises) tant que ≥ 2 sources de presse
secondaires indépendantes traitant ServicesArtisans **comme sujet principal**
ne sont pas disponibles.

Trajectoire recommandée :

| Phase | Action                                                                                                                                                                                    | Délai     | Risque                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------ |
| 1     | Créer compte WP:FR + onboarding                                                                                                                                                           | 1 jour    | Nul                      |
| 2     | Déposer le brouillon `Brouillon:ServicesArtisans`                                                                                                                                         | 1 jour    | Faible                   |
| 3     | Demander relecture Atelier de Relecture                                                                                                                                                   | 7-14 j    | Faible                   |
| 4     | Attendre retombées Sprint 5 (outreach médias)                                                                                                                                             | 1-2 mois  | Externe                  |
| 5     | Compléter brouillon avec sources Tier 2 obtenues                                                                                                                                          | 1 semaine | Faible                   |
| 6     | Soumission via [WP:DRP](https://fr.wikipedia.org/wiki/Wikipédia:Demande_de_restauration_de_page)/[WP:F](https://fr.wikipedia.org/wiki/Wikipédia:Pages_à_fusionner) ou publication directe | 1 jour    | Évalué dépendant Phase 4 |

## 1. Pré-requis compte WP:FR

- URL création : <https://fr.wikipedia.org/wiki/Spécial:Créer_un_compte>
- Username : compte humain (idéalement le compte personnel Marvin déjà créé
  pour Wikidata — Wikipedia accepte le SUL « single user login »)
- ⚠️ **Conflit d'intérêts** : si Marvin est cofondateur de l'entreprise sujet,
  il doit **déclarer un COI** ([WP:CCAA](https://fr.wikipedia.org/wiki/Wikipédia:Contributions_rémunérées)) sur sa page utilisateur
  et **ne pas modifier directement** la page une fois publiée (le brouillon
  est une exception tolérée s'il est ensuite proposé à relecture neutre).

## 2. Étapes opérationnelles

### 2a. Vérification absence d'article existant

- Recherche : <https://fr.wikipedia.org/w/index.php?search=ServicesArtisans>
- Recherche variantes : `Services Artisans`, `servicesartisans.fr`
- Si une page (même supprimée) existe → consulter logs avant de re-soumettre

### 2b. Création du brouillon

- URL : <https://fr.wikipedia.org/wiki/Brouillon:ServicesArtisans>
- Coller intégralement le contenu de `ServicesArtisans.wiki`
- En haut du brouillon, déclarer le COI avec template `{{Travail rémunéré|employeur=...|client=...|article=ServicesArtisans}}`
- Résumé d'édition (commit message du wiki) :
  `Création brouillon : annuaire d'artisans français spécialisé en rénovation énergétique. Sources : ADEME, data.gouv.fr, annuaire-entreprises. NPOV check OK.`

### 2c. Demande de relecture neutre

Deux pistes complémentaires :

1. **Atelier de relecture** : <https://fr.wikipedia.org/wiki/Wikipédia:Atelier_de_relecture>
   - Délai : 7-14 jours en moyenne
   - Objectif : feedback sur ton + structure, pas sur l'admissibilité

2. **Atelier graphique / Café du Bistro** : <https://fr.wikipedia.org/wiki/Wikipédia:Le_Bistro>
   - Pour question sur l'admissibilité elle-même
   - Délai : 24-72 h
   - À utiliser **uniquement** quand le brouillon est complet et que vous
     pensez avoir atteint le seuil WP:NESP

### 2d. Validation NPOV automatique

Avant publication, exécuter (depuis le scaffold existant) :

```bash
cd scripts/wikipedia-seed
make install   # première fois uniquement
uv run python -c "
from sa_wikipedia.neutrality import check_neutrality
text = open('../../tmp/wikipedia-fr-submission-2026-05-22/ServicesArtisans.wiki').read()
problems = check_neutrality(text)
print('OK' if not problems else f'PROBLÈMES NPOV: {problems}')
"
```

Le brouillon généré ce jour passe une revue NPOV manuelle (aucun superlatif, ton
purement descriptif), mais la validation automatique du scaffold reste le
gold-standard avant push.

## 3. Critères d'admissibilité (rappel — voir aussi `references-bibliographie.md`)

| Critère                                                         | État actuel  | Bloquant ?        |
| --------------------------------------------------------------- | ------------ | ----------------- |
| ≥ 2 sources secondaires indépendantes en profondeur             | ❌ 0         | **Oui (NESP)**    |
| ≥ 5 sources institutionnelles (Tier 1 — admissibilité fallback) | ✅ 7         | Non               |
| Ton encyclopédique (NPOV)                                       | ✅           | Non               |
| Aucun lien externe servicesartisans.fr en `<ref>`               | ✅           | Non               |
| Catégories Wikipedia FR cohérentes                              | ✅           | Non               |
| Infobox conforme `{{Infobox Entreprise}}`                       | ✅           | Non               |
| Conflit d'intérêts (COI) déclaré                                | ⚠️ à faire   | Non, mais éthique |
| Photo / logo sous licence libre                                 | ⚠️ optionnel | Non               |

**Bloquant principal** : sources secondaires (Tier 2 presse) insuffisantes.

## 4. Risques de suppression et mitigations

| Risque                                     | Probabilité | Mitigation                                                                                                  |
| ------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------- |
| Suppression immédiate (SI) pour auto-promo | Faible      | Brouillon avant article principal, ton NPOV validé, COI déclaré                                             |
| Procédure PàS (page à supprimer)           | Moyenne     | Attendre Tier 2 avant publication ; argumenter sur sources Tier 1 + dispositif RGE comme contexte sectoriel |
| Demande de sources supplémentaires         | Élevée      | Conserver brouillon en jachère 1-2 mois jusqu'aux retombées Sprint 5                                        |
| Rejet pour COI non déclaré                 | Faible      | Déclarer dès dépôt brouillon                                                                                |

## 5. Si suppression survient malgré tout

- ❌ **Ne pas re-créer** immédiatement (cela aggrave : « passage en force »)
- ✅ Documenter les sources Tier 2 manquantes
- ✅ Attendre 6 mois avant nouvelle tentative via [WP:DRP](https://fr.wikipedia.org/wiki/Wikipédia:Demande_de_restauration_de_page)

## 6. Process bot (futur — Pillier 13)

Ce dossier ne concerne **que** la page corporate ServicesArtisans elle-même.

Pour le seed bot Pillier 13 (`scripts/wikipedia-seed/`) qui doit générer 18
articles de stubs sur les qualifications RGE (Qualibat 5911, Qualifelec, etc.),
le process est différent et plus lourd :

1. Bot flag WP:RBOT : <https://fr.wikipedia.org/wiki/Wikipédia:Bot/Requêtes>
2. Discussion communautaire au Bistro : 7-14 j
3. Rate limit ≤ 4 edits/min (vs 60 sur Wikidata)
4. Probation 30 j à débit réduit

Voir `scripts/wikipedia-seed/README.md` pour la trajectoire complète.

## 7. Fichiers livrés (ce dossier)

```
tmp/wikipedia-fr-submission-2026-05-22/
├── ServicesArtisans.wiki         # Brouillon prêt-à-coller dans Brouillon:ServicesArtisans
├── references-bibliographie.md   # Analyse honnête des sources + Tier 1/2/3
└── submission-checklist.md       # Ce fichier
```

## 8. Références utiles

- WP:NESP (notabilité entreprises) : <https://fr.wikipedia.org/wiki/Wikipédia:Notoriété_des_entreprises_et_sociétés>
- WP:CSA (admissibilité générale) : <https://fr.wikipedia.org/wiki/Wikipédia:Critères_d'admissibilité_des_articles>
- WP:CCAA (contributions rémunérées) : <https://fr.wikipedia.org/wiki/Wikipédia:Contributions_rémunérées>
- WP:NPOV : <https://fr.wikipedia.org/wiki/Wikipédia:Neutralité_de_point_de_vue>
- WP:RBOT : <https://fr.wikipedia.org/wiki/Wikipédia:Bot/Requêtes>
- Atelier de relecture : <https://fr.wikipedia.org/wiki/Wikipédia:Atelier_de_relecture>
