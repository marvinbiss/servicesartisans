# Sprint 5 — Suivi outreach Indice Rénovation 2026

Tracker manuel d'envoi pour Marvin. À tenir à jour à chaque envoi / relance / réponse / publication.

## Tableau de suivi

| Date envoi | Média                      | Statut envoi | Date réponse | Backlink (URL publiée) | DR gain estimé | Notes |
| ---------: | -------------------------- | ------------ | -----------: | ---------------------- | -------------: | ----- |
|            | La Tribune                 | pending      |              |                        |                |       |
|            | Les Échos Patrimoine       | pending      |              |                        |                |       |
|            | Le Moniteur                | pending      |              |                        |                |       |
|            | Batiactu                   | pending      |              |                        |                |       |
|            | PAP.fr                     | pending      |              |                        |                |       |
|            | Le Particulier (Le Figaro) | pending      |              |                        |                |       |
|            | Capital                    | pending      |              |                        |                |       |
|            | Ouest-France               | pending      |              |                        |                |       |
|            | Sud Ouest                  | pending      |              |                        |                |       |
|            | La Voix du Nord            | pending      |              |                        |                |       |
|            | La Dépêche du Midi         | pending      |              |                        |                |       |
|            | France Bleu                | pending      |              |                        |                |       |

**Statuts possibles** : `pending` → `sent` → `bounced` / `replied_negative` / `replied_positive` / `published` / `closed`.

**DR gain estimé** : noter le DR Ahrefs effectif du domaine au moment de la publication (pas l'estimé statique). Calculer le gain composé à J+30 via la commande `sa-seo` / requête Ahrefs `backlinks`.

## Cadence recommandée

1. **J0** — Envoi T1 (court) à 6 médias prioritaires (Le Moniteur, Batiactu, La Tribune, Les Échos Patrimoine, Capital, Ouest-France).
2. **J+2** — Envoi T2 (moyen) aux 6 médias restants (PAP, Le Particulier, Sud Ouest, Voix du Nord, La Dépêche, France Bleu).
3. **J+5** — Relance T3 sur tous les médias sans réponse.
4. **J+10** — Audit Ahrefs `backlinks` pour confirmer les liens reçus et noter les DR effectifs.

Un envoi par jour ouvré maximum par média. Pas de BCC presse. Une signature humaine, pas « l'équipe ».

## Targets gates — déclenchement Sprint 5

### Gate 1 — Diffusion (5+ embeds live)

- Critère : 5 médias ou plus ont publié un article OU un embed pointant vers `/barometre/renovation-energetique-2026` avec crédit conforme CC-BY 4.0.
- Validation : audit via Ahrefs `backlinks` filtré sur `target_url contient barometre/renovation` + vérif manuelle de la mention de crédit.
- Si atteint : Sprint 5 considéré comme déclenché commercialement, on passe à la phase « consolidation backlinks ».

### Gate 2 — Autorité (1+ Tier 1 backlink DR ≥ 50)

- Critère : au moins un backlink dofollow obtenu depuis un domaine de DR Ahrefs ≥ 50 (typiquement parmi Le Moniteur, Batiactu, La Tribune, Les Échos Patrimoine, Capital, Le Particulier, Ouest-France).
- Validation : Ahrefs `backlinks?target=barometre&mode=domain` + filtre `domain_rating>=50`.
- Si atteint : déclenche bascule du baromètre vers page « pillar » avec maillage interne renforcé depuis `/aides/*` et `/rge/*`.

### Suivi quotidien

- Vérifier Sentry pour anomalies sur `/api/v1/barometre/renovation/embed.html` (charge, 5xx, timeouts).
- Logger toute mention détectée (Google Alerts sur « Indice Rénovation 2026 ServicesArtisans ») dans la colonne _Notes_ du tableau.
- Si un média demande des données régionalisées brutes : préparer CSV depuis le baromètre, publier sur `/data/` (CC-BY 4.0), envoyer le lien plutôt que le fichier en pièce jointe.

## Sources factuelles autorisées dans les échanges

Aucune statistique non listée ci-dessous ne doit être citée dans un email, un commentaire ou un follow-up :

- Observatoire DPE — ADEME (millésime indiqué sur la page du baromètre)
- MaPrimeRénov' — ANAH (publications ouvertes, millésime indiqué)
- Registre RGE — data.gouv (licence Etalab 2.0, date d'extraction indiquée)

Toute statistique additionnelle (Cerema, Insee, Capeb, FFB, etc.) requiert ajout préalable à la page du baromètre avec sa source explicite avant de pouvoir être citée en outreach.
