# Disavow — Procédure d'upload Google Search Console

**Fichier canonique** : `docs/seo/disavow-2026-04-29.txt` (45 domaines)
**À faire** : 1 upload manuel via GSC (~5 min). Action ponctuelle, pas récurrente.

## Pourquoi disavow

Audit Ahrefs 2026-04 : **45 backlinks spam** identifiés (PBN classics + SEO spam farms) sur DR 0.6.
Sur un site jeune avec peu de backlinks légitimes, ces liens **diluent l'autorité** et risquent un signal Penguin algorithmique.
Le disavow dit à Google : « ignore ces domaines, ne les compte ni en positif ni en négatif ».

## Procédure (5 minutes)

### 1. Ouvrir l'outil de désaveu

URL directe : https://search.google.com/search-console/disavow-links

Sélectionner la propriété **`sc-domain:servicesartisans.fr`** (Domain property, pas URL-prefix).

### 2. Vérifier l'état actuel

Si un fichier existe déjà → bouton **« Télécharger le fichier de liens désavoués »** pour récupérer la version actuelle.

- Comparer avec `docs/seo/disavow-2026-04-29.txt`.
- Si identique : rien à faire.
- Sinon : continuer étape 3 (le nouvel upload **remplace** complètement l'ancien).

### 3. Uploader le nouveau fichier

- Bouton **« Désavouer les liens »** ou **« Remplacer »**.
- Sélectionner `docs/seo/disavow-2026-04-29.txt` depuis l'explorateur local.
- Confirmer.

### 4. Confirmation

GSC affiche : _« Le fichier a bien été chargé. Google le traitera dans les jours qui suivent. »_

Délai de prise en compte : **~7 à 14 jours** côté Google (recrawl puis ré-évaluation des liens).
Aucune notification de complétion.

### 5. Documenter (optionnel)

Screenshot de la confirmation → `docs/seo/disavow-upload-2026-04-XX.png`.

## Erreurs courantes à éviter

| Erreur                                                            | Conséquence                                |
| ----------------------------------------------------------------- | ------------------------------------------ |
| Mauvaise propriété (URL-prefix vs Domain)                         | Disavow non appliqué sur le domaine entier |
| Format `https://example.com/page` au lieu de `domain:example.com` | Ne désavoue qu'une URL au lieu du domaine  |
| Encodage UTF-16 BOM                                               | Google rejette le fichier — UTF-8 strict   |
| Lignes >2 000 caractères                                          | Rejetée — split sur plusieurs lignes       |
| Suppression d'un domaine légitime par erreur                      | Perte de jus SEO réel                      |

Le fichier `docs/seo/disavow-2026-04-29.txt` est UTF-8, format `domain:` natif Google, lignes <80 caractères. ✅

## Cycle de revue

- **Trimestriel** : ré-export Ahrefs backlinks → diff vs disavow actuel → mise à jour si nouveau spam.
- **Snapshot DR cible** : DR 0.6 → 5+ après nettoyage (3-6 mois pour mesurer l'effet).
- **Suivi** : GSC > Performance avant/après pour repérer un éventuel uplift général (signal Penguin desserré).

## Historique

| Date       | Fichier                                 | Domaines | Notes                                              |
| ---------- | --------------------------------------- | -------- | -------------------------------------------------- |
| 2026-04-18 | `docs/ahrefs-audit-2026-04/disavow.txt` | 44       | Première version, audit initial                    |
| 2026-04-20 | `docs/seo/disavow-2026-04-20.txt`       | 45       | +`rent-a-shop.shop`, raisons catégorisées          |
| 2026-04-29 | `docs/seo/disavow-2026-04-29.txt`       | 45       | **Canonique** — tri alpha, header méta, à uploader |

## Annexe — Critères de sélection (rappel)

Un domaine est listé si **au moins 1** des critères :

1. Flag `is_spam=true` chez Ahrefs.
2. TLD PBN typique (`.shop`, `.icu`, `.top`, `.party`, `.fyi`, `.xyz`, `.agency`, `.website`, `.sale`) + ancre commerciale.
3. Mots-clés SEO-spam dans nom de domaine (`rank`, `seo`, `backlink`, `optimize`, `traffic`).
4. DR élevé (>50) sans aucun signal éditorial (pas de contenu, juste un site de liens).
5. DR=0 + ancre longue exact-match hors thématique.

Domaines **non disavoués volontairement** :

- Annuaires locaux légitimes (même DR faible).
- Médias presse FR.
- Sites métier avec contenu réel.
