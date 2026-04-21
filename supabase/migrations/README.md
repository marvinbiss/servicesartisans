# Migrations Supabase — conventions & guardrails

## Règle d'or

Numéro de migration **UNIQUE + monotone croissant**. Pas de doublon de préfixe.

Supabase CLI applique les fichiers par ordre lexicographique du nom complet.
En cas de collision (`330_a.sql` + `330_b.sql`), les deux sont appliqués,
mais la table `schema_migrations` ne track que la première version observée
→ drift silencieux possible lors d'un reset/restore.

## Collisions historiques connues (ne pas toucher en prod)

Les doublons suivants existent et ont **déjà été appliqués** en production.
Les renommer provoquerait un re-run. Laissez en l'état, documentez la dette.

| Préfixe | Fichier A                    | Fichier B                              | Statut            |
| ------- | ---------------------------- | -------------------------------------- | ----------------- |
| `330_`  | `fix_noindex_default.sql`    | `massive_naf_specialty_mapping.sql`    | appliqués 2026-02 |
| `365_`  | `newsletter_subscribers.sql` | `provider_claims_claimant_columns.sql` | appliqués 2026-04 |

Si restore/reset de prod : rejouer les deux dans l'ordre alphabétique du nom
complet (ce qui est ce que fait Supabase CLI).

## Guardrail

Avant chaque nouvelle migration, exécuter :

```bash
node scripts/check-migration-unique.mjs
```

Le script échoue si un nouveau fichier ajoute un préfixe déjà utilisé.

## Nomenclature

`NNN_snake_case_short_description.sql` où `NNN` est le prochain entier libre.
Vérifier `ls supabase/migrations/ | awk -F'_' '{print $1}' | sort -n | tail -5`.
