# Wikipedia FR — Bibliographie & analyse notabilité

> **Statut** : Pré-soumission. Date d'analyse : 2026-05-22. À relire avant Brouillon WP:FR.

## 1. Critères de notabilité applicables (WP:NESP / WP:CSA)

L'article ServicesArtisans est soumis à deux jeux de critères :

- [WP:NESP](https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Notori%C3%A9t%C3%A9_des_entreprises_et_soci%C3%A9t%C3%A9s) — notabilité des entreprises (cumulatif strict)
- [WP:CSA](https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Critères_d'admissibilité_des_articles) — règle générale fall-back

Au sein de WP:NESP, le seuil minimum est **deux sources secondaires indépendantes
de qualité couvrant le sujet en profondeur sur une période d'au moins deux
ans**. Pour une entreprise fondée en 2026, ce seuil n'est en général **pas**
atteignable avant fin 2027 / début 2028 — ce qui constitue le principal risque
de cet article.

## 2. État actuel des sources (audit honnête)

### Tier 1 — sources institutionnelles (factuelles, mais non « secondaires »)

Ces sources servent à vérifier les faits techniques (existence légale, registre
RGE, dispositifs publics), mais **ne valent pas comme preuve de notabilité**
sur WP:FR (elles sont primaires ou descriptives d'un dispositif, pas du sujet).

| #   | Source                                   | URL                                                                           | Usage encyclopédique                     |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | Annuaire des entreprises (data.gouv.fr)  | <https://annuaire-entreprises.data.gouv.fr/>                                  | Existence légale, forme juridique, SIREN |
| 2   | Liste des entreprises RGE — ADEME        | <https://data.ademe.fr/datasets/liste-des-entreprises-rge-2>                  | Dataset utilisé par la plateforme        |
| 3   | Liste des entreprises RGE — data.gouv.fr | <https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/>           | Miroir officiel, licence Etalab 2.0      |
| 4   | France Rénov' — annuaire RGE             | <https://france-renov.gouv.fr/annuaire-rge>                                   | Contextualisation du dispositif RGE      |
| 5   | ANAH — MaPrimeRénov'                     | <https://www.anah.gouv.fr/maprimerenov>                                       | Dispositif public lié à l'activité       |
| 6   | Ministère écologie — CEE                 | <https://www.ecologie.gouv.fr/dispositif-des-certificats-deconomies-denergie> | Dispositif CEE en arrière-plan           |
| 7   | Spécification llms.txt                   | <https://llmstxt.org/>                                                        | Standard cité dans la section technique  |

**Comptage WP:NESP** : 0 source secondaire indépendante traitant ServicesArtisans
comme sujet principal. Toutes les sources listées sont des références
contextuelles ou des registres dans lesquels figure la société.

### Tier 2 — sources presse (à acquérir avant soumission Brouillon)

À la date de génération (2026-05-22), aucune mention presse régionale ou
sectorielle traitant ServicesArtisans en profondeur n'a été identifiée. La
mémoire interne `servicesartisans-sprint5-indice-renovation-2026-05-06` indique
un sprint d'outreach médias (Indice Rénovation 2026) **en cours**, dont les
retombées sont attendues mais non encore matérialisées.

**Cibles probables, à monitorer** :

- Presse économique régionale (La Tribune Lyon/Bordeaux, Les Echos Le Cercle)
- Presse spécialisée bâtiment / rénovation (''Le Moniteur'', ''Batiactu'', ''Le Journal de l'Agence'')
- Presse tech / startup (''Frenchweb'', ''Maddyness'', ''Usine Digitale'')
- Couverture data ouverte / civic tech (''Acteurs Publics'', ''La Gazette des Communes'')

### Tier 3 — sources auto-publiées (interdites en `<ref>`)

Conformément à [WP:CIRCULAR](https://fr.wikipedia.org/wiki/Wikipédia:Citez_vos_sources#Sources_circulaires) :

- `servicesartisans.fr/*` — **interdit** en `<ref>` (sauf section « Liens externes » avec parcimonie)
- `servicesartisans.fr/llms.txt`, `/openapi.json`, `/ai.txt` — citables uniquement dans la section technique en tant que document descriptif, **pas** comme preuve de notabilité
- Tout communiqué de presse émis par ServicesArtisans est non recevable

## 3. Recommandation honnête

L'article tel que rédigé dans `ServicesArtisans.wiki` **ne franchira probablement
pas le seuil WP:NESP en l'état**, malgré la rigueur des sources institutionnelles
mobilisées. Trois trajectoires possibles :

### Option A — Attendre les retombées Sprint 5 (recommandé)

- Délai : 1-2 mois post-publication Indice Rénovation 2026
- Pré-requis : ≥ 2 articles de presse régionale ou sectorielle indépendants
  couvrant ServicesArtisans en profondeur (≥ 500 mots chacun, sujet principal)
- Avantage : franchissement WP:NESP raisonnable, faible risque de suppression
- Inconvénient : délai

### Option B — Soumettre en Brouillon avec demande d'avis (acceptable)

- Délai : immédiat
- Pré-requis : utilisation du namespace `Brouillon:ServicesArtisans`,
  demande d'avis sur l'Atelier de relecture
- Avantage : feedback communautaire encadré, pas de pression suppression
- Inconvénient : article restera en brouillon tant que sources Tier 2
  insuffisantes ; risque d'avoir un retour décourageant

### Option C — Publication directe en article principal (déconseillé)

- Délai : immédiat
- Risque : passage en [SI](https://fr.wikipedia.org/wiki/Wikipédia:Suppression_immédiate)
  ou [PàS](https://fr.wikipedia.org/wiki/Wikipédia:Pages_à_supprimer) avec issue probable
  « supprimer » faute de sources secondaires
- Conséquence : l'historique de suppression rend la re-création **plus**
  difficile à terme

**Recommandation** : **Option A**, en commençant Option B dès aujourd'hui pour
ne pas perdre de temps de relecture.

## 4. Critères d'éligibilité à valider avant soumission

- [ ] ≥ 2 sources secondaires indépendantes, ≥ 500 mots, ≥ 1 par an sur 2 ans (idéal NESP)
- [ ] OU ≥ 5 sources secondaires indépendantes ponctuelles couvrant ≥ 3 angles distincts (fallback acceptable selon jurisprudence PàS)
- [ ] Aucune source auto-publiée en `<ref>`
- [ ] Ton encyclopédique (NPOV vérifié — voir `scripts/wikipedia-seed/src/sa_wikipedia/neutrality.py` pour patterns interdits)
- [ ] Tous les noms propres factuels confirmés par registre public (SIREN/SIRET, date Kbis)
- [ ] Le wiki contient ≤ 1 lien externe vers servicesartisans.fr en `<ref>` (idéalement 0)
- [ ] Catégories Wikipédia FR valides (vérifier syntaxe `[[Catégorie:...]]`)

## 5. Données à compléter avant publication

| Champ Infobox    | Valeur actuelle        | Source à utiliser pour compléter                                           |
| ---------------- | ---------------------- | -------------------------------------------------------------------------- |
| SIREN            | _vide_                 | annuaire-entreprises.data.gouv.fr/entreprise/servicesartisans              |
| date de création | « 2026 » (générique)   | Extrait Kbis (date d'immatriculation SAS exacte)                           |
| fondateur(s)     | _vide_                 | À renseigner **uniquement** depuis source secondaire indépendante (presse) |
| siège (commune)  | « France » (générique) | annuaire-entreprises.data.gouv.fr / Kbis                                   |

Tant que ces données ne sont pas confirmées par une **source secondaire**
(et pas seulement par auto-déclaration), il vaut mieux les omettre que les
affirmer puis devoir corriger sous suspicion d'auto-promotion.

## 6. Anti-checklist NPOV (passes obligatoires)

Patterns interdits dans le texte (cf. `scripts/wikipedia-seed/src/sa_wikipedia/neutrality.py`) :

- Superlatifs : `leader`, `incontournable`, `référence`, `n°1`, `meilleur`, `seul à`
- Marketing : `innovant`, `révolutionnaire`, `disruptif`, `next-gen`
- Hype : `parfaitement`, `absolument`, `extrêmement`
- Auto-promo : `notre entreprise`, `nos services`

Le brouillon livré a été rédigé en évitant ces patterns ; relire une dernière fois avant publication.
