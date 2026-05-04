# SA Lost Keywords Recovery Plan — Chantier #C (Sprint complément)

**Date** : 2026-05-03
**Source** : Ahrefs API live `site-explorer/organic-keywords` avec filter `status=left` (KW présents au 2026-04-03 mais absents au 2026-05-03 dans le top 100 servicesartisans.fr).
**Méthode** : pull live (audit Phase 0 vide pour `sa_lost_keywords_2026-05.csv` et erreur API sur `sa_kw_diff*.json`).

## Pourquoi récupérer plutôt que conquérir

Récupérer un KW perdu (déjà rankée pos 18-50) est **2-5× plus rapide** que conquérir un KW vierge. La page existe, l'autorité a été établie, le crawl Google est régulier. Une simple action (refresh content + maillage interne + IndexNow) suffit souvent à récupérer la position perdue.

## Volume capturable (période 2026-04-03 → 2026-05-03)

| Bucket                                                | KW    | Volume cumulé  |
| ----------------------------------------------------- | ----- | -------------- |
| Total brut KW perdus (status=left)                    | 114   | n/a            |
| Après filtre (non-brand + volume ≥50)                 | 24    | ~12 000/mois   |
| **P0 high value** (vol ≥1000 + pos ≤30 + URL vivante) | **4** | **7 400/mois** |
| **P1 quickwin** (vol ≥200 + pos ≤20)                  | 2     | 550/mois       |
| **P2 long tail**                                      | 18    | 3 880/mois     |

→ Si SA récupère les 4 P0 + 2 P1 (top 10 réaliste à J+30 sans gros effort) → **+8K vol/mois disponible** + récup CTR top 10 = ~250-400 clics/mois additionnels en organique.

## Top 4 P0 high value (à attaquer cette semaine)

| Rank | KW                       | Vol   | KD  | Pos perdue | URL                                 | Status URL  | Action                                                                                                                                 |
| ---- | ------------------------ | ----- | --- | ---------- | ----------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **comment deboucher wc** | 2 200 | 2   | 18         | `/blog/comment-deboucher-wc-guide`  | ✅ HTTP 200 | Refresh content (titre H1, ajout 2-3 H2 "Méthodes naturelles", "Quand appeler un plombier") + maillage interne + IndexNow ping         |
| 2    | **facadier**             | 2 500 | 0   | 22         | `/departements/creuse/facadier`     | ✅ HTTP 200 | URL pSEO département/métier — refresh fallback dept + ajouter section H2 "Trouver un façadier" + lien vers `/services/facadier` parent |
| 3    | **façadier** (accent)    | 1 000 | 0   | 28         | `/departements/creuse/facadier`     | ✅ HTTP 200 | Idem rank 2 — la version accentuée pointe sur la même URL                                                                              |
| 4    | **prix pose carrelage**  | 1 700 | 3   | 19         | `/questions/prix-pose-carrelage-m2` | ✅ HTTP 200 | Refresh barème prix (chiffres 2026 vérifiés) + tableau prix par matériau + lien vers `/services/carreleur`                             |

> 🎯 **Memory cross-check** : `comment deboucher wc`, `facadier`, et `prix pose carrelage` sont tous les 3 listés dans le memory `servicesartisans-ahrefs-benchmark-2026-04-30.md` comme « 3 keywords striking distance pos 18-22 vol 6 400/mois » — confirmation que ce sont des wins documentés.

## Top P1 quickwin

| Rank | KW                | Vol | Pos perdue | URL                                          | Action                                        |
| ---- | ----------------- | --- | ---------- | -------------------------------------------- | --------------------------------------------- |
| 2    | plomberie urgence | 200 | 4          | `/urgence/plombier/saint-julien-en-genevois` | Recheck contenu + IndexNow ping (drop mineur) |
| 14   | serrurier sevran  | 350 | 20         | `/urgence/serrurier/sevran`                  | Refresh + maillage                            |

## Pages avec drops majeurs (P2 mais URL à investiguer)

| KW                      | Vol | Pos perdue | URL                                 | Cause probable                  |
| ----------------------- | --- | ---------- | ----------------------------------- | ------------------------------- |
| serrurier pantin        | 700 | **46**     | `/tarifs/serrurier/pantin`          | Page tarif thin / nuke par algo |
| serrurier aix-les-bains | 600 | **48**     | `/avis/serrurier/aix-les-bains`     | Page avis 0 reviews → thin      |
| plombier biarritz       | 400 | **50**     | `/urgence/plombier/biarritz`        | Page urgence thin / recall      |
| prix serrurier          | 700 | **37**     | `/tarifs/serrurier/vieux-habitants` | URL pSEO problématique          |
| plombier besancon       | 400 | **45**     | `/services/plombier/besancon`       | Page service ville thin         |
| plombier gonesse        | 200 | **53**     | `/services/plombier/gonesse`        | Possible 404 ou redirect cassé  |

> 📌 **Lecture** : ces drops massifs (>40 positions) sont souvent dus à la migration sitemap V3 #1 du 2026-04-29 (140K URLs purge) ou à l'algo Google reconsidérant les pages thin. À investiguer cas par cas si on veut récupérer ces volumes secondaires (~3K vol cumulé).

## Plan d'action (1-2j-dev)

### Sem 1 — Récup P0 (4 KW, 7 400 vol cumulé)

```bash
# 1. Vérifier que les URLs P0 sont accessibles (déjà fait : HTTP 200 OK pour les 3)

# 2. Pour chaque P0, refresh content :
#    - /blog/comment-deboucher-wc-guide : ajouter H2 "Quand appeler un plombier" + maillage
#    - /departements/creuse/facadier : enrichir fallback dept + lien hub
#    - /questions/prix-pose-carrelage-m2 : barème prix 2026

# 3. Notifier IndexNow pour recrawl rapide
curl -sS -X POST "https://servicesartisans.fr/api/sync-indexnow" \
  -H "Content-Type: application/json" \
  -d '{"urls":[
    "https://servicesartisans.fr/blog/comment-deboucher-wc-guide",
    "https://servicesartisans.fr/departements/creuse/facadier",
    "https://servicesartisans.fr/questions/prix-pose-carrelage-m2"
  ]}'

# 4. Mesure J+15 et J+30 via re-pull live (script idempotent)
npx tsx scripts/analyze-sa-lost-keywords.ts
# → Comparer position des 4 P0 avant/après. Cible : 3 sur 4 récupérés top 15
```

### Sem 2 — Investiger drops majeurs P2

Pour les pages avec drop > 40 positions (serrurier pantin, aix-les-bains, plombier biarritz, etc.) :

1. Vérifier que la page est toujours indexable (`noindex` flag, robots.txt)
2. Vérifier que le SIRET / artisan affichés sont vivants (RGE actif)
3. Si la page est correcte mais drop algo → ajout tableau prix dynamique + AggregateRating fallback dept
4. Si la page est devenue thin (0 artisan, 0 reviews) → noindex légitimé

## KPIs attendus J+30

| Métrique                          | Cible J+30      | Cible J+60      |
| --------------------------------- | --------------- | --------------- |
| KW P0 récupérés top 15            | 2/4             | 3/4             |
| KW P0 récupérés top 10            | 1/4             | 2/4             |
| Trafic organique récupéré         | +100 clics/mois | +250 clics/mois |
| KW total avec status=left re-pull | 80 (sur 114)    | 60              |

## Re-run

```bash
# Pull live mensuel (recommandé : 1er du mois)
npx tsx scripts/analyze-sa-lost-keywords.ts
# → Régénère sa_lost_keywords_LIVE.csv + sa_lost_keywords_by_url.csv
```

## Maintenance

- Re-pull mensuel pour détecter de nouveaux KW perdus
- Si les P0 ne se récupèrent pas après 30j → escalader (link-building dédié, refresh majeur)
- Audit dataset Phase 1 (post-2026-05-18 reset Ahrefs) : si toujours sa_kw_diff vide via API → ouvrir ticket support Ahrefs

## Liens connexes

- `scripts/analyze-sa-lost-keywords.ts` — script live pull
- Action #9 (striking distance) : `kw_attack_existing_50.csv` — cibles existantes à booster (différent de récup, mais complémentaire)
- Memory `servicesartisans-ahrefs-benchmark-2026-04-30.md` — confirmation que les 3 P0 étaient déjà identifiés comme wins
