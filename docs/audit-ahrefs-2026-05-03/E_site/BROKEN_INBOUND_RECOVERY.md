# Broken Inbound Recovery — Action #6 finition (Sprint V4)

**Date** : 2026-05-03
**Source data** : `broken_inbound.json` (audit Ahrefs Phase 0) + pull live API Ahrefs `site-explorer/broken-backlinks` + `site-explorer/lost-backlinks` + `site-explorer/all-backlinks?history=lost`.

## Constat 2026-05-03

**Aucun broken inbound exploitable détecté.**

| Source                                                 | Résultat                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| `broken_inbound.json` (audit Phase 0)                  | `{ "backlinks": [] }` — vide                                          |
| API `site-explorer/broken-backlinks` mode `domain`     | 0 résultat                                                            |
| API `site-explorer/broken-backlinks` mode `subdomains` | 0 résultat                                                            |
| API `site-explorer/broken-backlinks` mode `exact`      | 0 résultat                                                            |
| API `site-explorer/all-backlinks?history=lost`         | 0 résultat                                                            |
| `site-explorer/refdomains-history` (déc.→mai)          | Net positif (38 → 75 refdomains) — pas de chute massive à investiguer |

**Lecture** : sur les 158 backlinks live (77 refdomains live), aucun ne pointe vers une URL 404/410/5xx de servicesartisans.fr. Cohérent avec :

- Migrations gone-paths.ts (#5a/5b 2026-04-30 — 51K thin pages 301)
- Disavow #1+#2 (avril 2026, 51 liens / 45 domaines spam supprimés du graphe)
- Tests rge-only sitemap (commit `bb567dcc`+`76a7eb85`)

## Pourquoi cela arrive parfois quand même

Les broken inbound apparaissent quand :

1. Une URL SA est supprimée/renommée et un site externe pointait dessus (ex: pillar refondu, slug renommé)
2. Une 5xx temporaire transforme une 200 en error pour le crawler → Ahrefs flag broken même si fixée depuis
3. Un cron/migration brouille `gone-paths.ts` et casse une URL connue

**ROI typique d'une récup broken inbound** : 1 redirection 301 = transfert de DR/jus du backlink vers la page vivante la plus pertinente. Compté sur 5-10 récups → +0.3 à +0.6 DR (faible isolément, multiplicatif sur 6 mois).

## Procédure de re-pull mensuelle (à automatiser)

```bash
TOKEN=$(cat /c/Users/USER/.secrets/ahrefs.env | tr -d '\r\n ')

# 1. Pull live Ahrefs
curl -sS -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" \
  "https://api.ahrefs.com/v3/site-explorer/broken-backlinks?target=servicesartisans.fr&mode=domain&limit=500&select=url_from,url_to,domain_rating_source,traffic,first_seen,http_code,is_dofollow,anchor" \
  > docs/audit-ahrefs-2026-05-03/E_site/broken_inbound_LIVE.json

# 2. Filtrer DR ≥ 5 (signal autorité) + traffic > 0
python -c "
import json
d = json.load(open('docs/audit-ahrefs-2026-05-03/E_site/broken_inbound_LIVE.json'))
items = d.get('backlinks', [])
filtered = [b for b in items
            if (b.get('domain_rating_source') or 0) >= 5
            and (b.get('traffic') or 0) > 0
            and (b.get('is_dofollow') is True)]
print(f'Total: {len(items)} | After filter: {len(filtered)}')
"
```

**Quand des broken inbound apparaissent, suivre ce playbook** :

### Étape 1 — Trier par valeur

Critères (tous AND) :

- `is_dofollow=true` (sinon pas de transfert de jus)
- `domain_rating_source >= 5` (filtre spam + pages très peu populaires)
- `traffic > 0` (le lien apporte ou apportait du trafic réel)
- `http_code IN (404, 410, 301-loop)` (vraiment cassé)

### Étape 2 — Mapper chaque `url_to` cassée → URL 301 cible

Pour chaque URL morte :

1. **Lookup l'intention** : que cherchait l'auteur du lien ? (anchor text + contexte page source)
2. **Identifier la page vivante la plus pertinente** sur servicesartisans.fr (page guide, pillar, ou fiche métier)
3. **Ajouter une redirection 301 dans `src/lib/seo/gone-paths.ts`** (pattern de regex) — précédence : redirect spécifique > 410 > 404
4. **Vérifier la chaîne** : la redirection ne doit pas créer un loop ou dépasser 2 sauts (Google suit max 10)

### Étape 3 — Émission IndexNow + monitoring

```bash
# Notifier Bing/Yandex pour recrawl rapide
curl -sS -X POST "https://servicesartisans.fr/api/sync-indexnow" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://servicesartisans.fr/<url-cassée>"]}'

# Vérifier la 301 fonctionne
curl -sS -I "https://servicesartisans.fr/<url-cassée>" | head -3
# → doit retourner "HTTP/2 301" + "location: <url-vivante>"
```

### Étape 4 — Mesurer DR à J+30

- DR Ahrefs avant récup : noter
- DR Ahrefs J+30 : check via `subscription-info/limits-and-usage` puis `domain-rating?date=...`
- **Bench** : 5 récups DR-source 5-15 → +0.5-1.5 DR sur SA si toutes pages vivantes pertinentes

## Cadence recommandée

| Fréquence                                              | Action                                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Mensuelle** (1er du mois)                            | Re-pull API broken-backlinks + lost-backlinks ; alerter si N≥3 broken haute-valeur |
| **Trimestrielle**                                      | Audit refdomains-history sur 3 mois pour détecter les chutes anormales             |
| **Post-migration majeure** (gone-paths, sitemap purge) | Re-pull immédiat car risque casse-liens externes                                   |

## Stop-loss

Si après 3 mois le total broken haute-valeur reste à 0 (cas actuel 2026-05) → ne plus prioriser cette action, accepter qu'elle soit dormante. La maintenance mensuelle reste utile (signal d'alerte) mais sans dev récurrent.

## Liens connexes

- `src/lib/seo/gone-paths.ts` — table de redirections 301 + 410
- Action #1 (Phase B drift noindex) : `docs/audit-ahrefs-2026-05-03/E_site/issues.json` — issues hygiène
- Action #10 (outreach 50 cibles) : un broken inbound récupéré = pitch outreach naturel ("on a 301 votre lien, voici la nouvelle URL")
