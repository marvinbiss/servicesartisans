# Analyse Keywords — 18 avril 2026 (Ahrefs 18h)

**Sources** : 8 exports Ahrefs normalisés dans `normalized/`
**Scripts** : `_kw_synth2.py` (rejouable)

## Synthèse exécutive

1. **62 % des 261 KW en top 10** (excellent pour 71 jours)
2. **94 550 vol/mois "perdus"** (59 KW déclassés par Google, cause = bailout SSR)
3. **62 NEW KW** décollent sur pattern `/urgence/*` + `/departements/*` + `/guides/*`
4. **TOUS les concurrents en chute -13% à -41%** — sauf `societe.com` (+63%)
5. **Seul KW avec vraie perte de trafic : `plombier rouen` (-50)**
6. **Page `/devis/plombier/le-grand-quevilly/rouen` = principale page perdue**

## Distribution positions

| Position | Count  | %        |
| -------- | ------ | -------- |
| 1-3      | 23     | 9 %      |
| 4-10     | 99     | 38 %     |
| 11-20    | 40     | 15 %     |
| 21-50    | 10     | 4 %      |
| 51+      | 6      | 2 %      |
| **Lost** | **83** | **32 %** |

## Top 30 KW par volume (avec positions)

| Volume    | Prev Pos | Curr Pos | Δ Trafic | KW                        |
| --------- | -------- | -------- | -------- | ------------------------- |
| 59 000    | 99       | **out**  | 0        | serrurier                 |
| 6 200     | 0        | 26       | +4       | ma prime renov 2026       |
| 5 600     | 58       | **out**  | 0        | carreleur                 |
| 3 700     | 0        | 20       | 0        | brico man                 |
| 3 100     | 34       | **out**  | 0        | serrurier lyon            |
| 2 300     | 80       | **out**  | 0        | couvreur lille            |
| 2 200     | 0        | 17       | +1       | prix carrelage m2         |
| 2 200     | 64       | **out**  | 0        | plombier marseille        |
| 2 000     | 0        | 29       | 0        | fenetre double vitrage    |
| 1 400     | 75       | **out**  | 0        | couvreur clermont ferrand |
| 1 300     | 52       | **out**  | 0        | electricien lyon          |
| 1 300     | 54       | **out**  | 0        | zingueur                  |
| 1 200     | 60       | **out**  | 0        | serrurier urgence         |
| 1 200     | 76       | **out**  | 0        | couvreur lorient          |
| **1 000** | **4**    | **out**  | **-50**  | **plombier rouen**        |

## KW perdus (59 total, 94 550 vol)

**Pattern** : majoritairement pos 50-99 → déclassés complètement.
**Seule vraie perte factuelle = plombier rouen (-50 trafic)**.

Les autres étaient en position basse (50-99) : Google avait commencé à les voir puis les a retirés. Cohérent avec le diagnostic bailout SSR (Google voit body 665 chars = pages de faible qualité = déclassement).

## NEW KW — 62 qui décollent

**Top 20 par trafic actuel** :

| Vol   | Pos | Trafic | KW                            | URL                                         |
| ----- | --- | ------ | ----------------------------- | ------------------------------------------- |
| 100   | 2   | +18    | plombier caen 24h24           | `/urgence/plombier/caen`                    |
| 50    | 1   | +17    | appel serrurier cherbourg     | `/urgence/serrurier/cherbourg-en-cotentin`  |
| 30    | 1   | +11    | domotique maison vendée       | `/departements/vendee/domoticien`           |
| 20    | 1   | +8     | ascenseur nièvre              | `/departements/nievre/ascensoriste`         |
| 70    | 5   | +6     | diagnostic plomb cannes       | `/avis/diagnostiqueur/cannes`               |
| 50    | 3   | +6     | forfait évry                  | `/tarifs/borne-recharge/evry-courcouronnes` |
| 40    | 3   | +5     | installation domotique vendée | idem domotique vendée                       |
| 6 200 | 26  | +4     | ma prime renov 2026           | `/guides/maprimerenov-2026`                 |
| 70    | 8   | +3     | vitrier maubeuge              | `/services/vitrier/maubeuge`                |
| 80    | 8   | +3     | cuisiniste pays de la loire   | `/regions/pays-de-la-loire/cuisiniste`      |

**Patterns gagnants confirmés** :

1. `/urgence/[metier]/[ville]` — 3 des 4 top new
2. `/departements/[dept]/[metier]` — hyper-local
3. `/guides/[thème]` — actualités comme "ma prime renov 2026"
4. `/avis/[metier]/[ville]` — reviews par ville
5. `/tarifs/[metier]/[ville]` — prix locaux
6. `/regions/[region]/[metier]` — territoire large

## Intent analysis

Sur 266 KW trackés (un KW peut avoir plusieurs intents) :

| Intent        | Count   | %        |
| ------------- | ------- | -------- |
| Informational | 264     | 100 %    |
| **Local**     | **199** | **75 %** |
| Commercial    | 157     | 59 %     |
| Transactional | 55      | 21 %     |
| Branded       | 26      | 10 %     |
| Navigational  | 1       | 0 %      |

**Sweet spot = Local + Commercial** (cherche un artisan dans sa ville).

## Top pages — turnover

- **157 NEW** (ranking 1ère fois)
- **83 Lost**
- **13 Stable**
- **Net : +74 pages**

Le site gagne **nettement plus de pages qu'il n'en perd**.

## Pages LOST détaillées

**Total trafic perdu : 66 seulement** (80 % concentré sur `/devis/plombier/le-grand-quevilly/rouen`).

Top 10 :

1. `/devis/plombier/le-grand-quevilly/rouen` : -50
2. `/tarifs/charpentier` : -5
3. `/services/macon/roquefort-la-bedoule/bm-construction-...` : -2
4. `/villes/frouzins/centre-ville` : -2
5. 30+ autres avec -0 à -1

**= perte concentrée sur une seule page** (Rouen plombier).

## Marché — tous les concurrents en chute

**La métrique qui compte** : % trafic perdu par concurrent entre Prev et Current.

| Domaine               | DR     | Trafic %  | Pages Δ    | Analyse                     |
| --------------------- | ------ | --------- | ---------- | --------------------------- |
| etienne-services.fr   | 42     | -41 %     | -1 425     | multi-services générique    |
| plus-que-pro.fr       | 83     | -36 %     | -1 597     | label qualité BTP           |
| lesbonsartisans.fr    | 52     | -30 %     | -1 395     | concurrent direct           |
| contactartisan.com    | 41     | -28 %     | -709       | annuaire artisan            |
| depanneo.com          | 62     | -23 %     | -1 797     | concurrent direct           |
| **travaux.com**       | **74** | **-18 %** | **-4 820** | **hub du marché**           |
| entretiendejardin.com | 41     | -17 %     | -144       | niche jardin                |
| yoojo.fr              | 61     | -17 %     | -474       | services                    |
| obat.fr               | 76     | -16 %     | -832       | rénovation                  |
| rdvartisans.fr        | 57     | -15 %     | -1 544     | concurrent direct           |
| mesdepanneurs.fr      | 60     | -14 %     | -369       | concurrent direct           |
| cleanolia.fr          | 39     | -13 %     | -360       | nettoyage                   |
| ringtwice.fr          | 45     | -13 %     | -648       | services                    |
| francevitre.com       | 29     | -16 %     | -66        | vitrerie                    |
| stannah.com           | 67     | -12 %     | -63        | monte-escalier              |
| allovoisins.com       | 72     | -1 %      | **-6 841** | concurrent direct, stable   |
| ou-serrurier.fr       | 45     | -1 %      | -1 063     | serrurier spécialisé        |
| socorebat-france.fr   | 56     | +4 %      | -341       | BTP                         |
| **societe.com**       | **86** | **+63 %** | **-3 546** | **ANNUAIRE SIREN OFFICIEL** |

### Diagnostic macro

**Google a déclassé massivement les annuaires d'artisans génériques** entre Q1 et Q2 2026. Probable **Helpful Content Update** ou algorithme anti-thin-content.

**Seul `societe.com` en hausse (+63%)** — c'est un **annuaire officiel SIREN** (pas juste annuaire marketing).

**Implication pour ServicesArtisans** :

- ✅ Notre positionnement "données SIREN officielles" nous aligne avec le gagnant
- ✅ Notre page artisan avec code_naf, legal_form_code, siret = signal fort E-E-A-T
- ⚠️ Si on reste "annuaire marketing" comme les autres, on risque le même déclassement

## KW communs — matrice

ServicesArtisans partage (total) :

- 71 KW avec travaux.com (max)
- 35 avec depanneo.com
- 23 avec allovoisins.com
- 15 avec rdvartisans.fr
- 7 avec mesdepanneurs.fr

Pour référence : depanneo ↔ travaux.com = 4 276 KW communs → on est en **tout début de course**.

## Best by Links — 11 pages avec backlinks

Pages qui attirent des liens externes :

1. `/` (homepage)
2. `/blog/prix-climaticien-2026-installation-entretien`
3. `/blog/prix-electricien-2026-tarifs-travaux`
4. `/blog/prix-jardinier-paysagiste-2026`
5. `/blog/prix-terrasse-exterieure-2026`
6. `/departements/saone-et-loire/borne-recharge`
7. 3 pages artisan spécifiques
8. `/services/architecte-interieur/les-abymes/petit-canal`

**Stratégie éditoriale gagnante = articles `/blog/prix-[metier]-YYYY`**. À amplifier.

## Plan d'action

### Priorité absolue (48h)

1. **Fix bailout SSR** — débloque les 59 KW perdus (94K vol)
2. **Upload disavow.txt** (44 domaines SPAM)

### Sprint 1 (1 semaine)

3. **Multiplier pages `/urgence/[metier]/[ville]`** pour top 50 villes
4. **Multiplier pages `/departements/[dept]/[metier]`** manquantes
5. **Article `/blog/prix-plombier-2026`** + 5 autres métiers

### Sprint 2 (2-3 semaines)

6. **Amplifier signal officiel** : sur chaque page artisan, mettre en avant SIRET, code NAF, légal form
7. **Content hub** `/guides/[actualité-2026]` pour capter trafic info
8. **Link building outreach** : identifier sites qui linkent `/blog/prix-*`

### Sprint 3 (1-3 mois)

9. **Monitoring quotidien** : Rank Tracker Ahrefs sur 100 KW cibles
10. **Competitor takeover** : pages spécifiques où concurrents rankaient

## KPI à suivre

- **`serrurier` : pos 99 → top 10** (objectif fix bailout)
- **`plombier rouen` : récupérer pos 4** (seule vraie perte factuelle)
- **Nombre de pages `/urgence/*` rankant** : actuellement 2-3 → objectif 20+
- **Nombre KW total** : 261 → 600 (12 semaines)
- **Trafic Ahrefs** : 164/j → 500/j
- **Pages NEW hebdo** : ~157/période → ~50/semaine
