# Analyse d'Impact relative à la Protection des Données (AIPD / DPIA)

## Traitement : Prospection commerciale d'artisans RGE

**Référence juridique :** Article 35 du Règlement (UE) 2016/679 (RGPD) — Lignes directrices WP 248 rev.01 du G29 (adoptées par le CEPD) — Guide PIA de la CNIL (méthodologie, modèles, bases de connaissances, 3 volets).

**Date de rédaction :** 2026-04-11
**Version :** 1.0
**Responsable de traitement :** ServicesArtisans (cf. `docs/rgpd/registre-traitements.md`)
**Rédacteur :** {{À COMPLÉTER PAR LE RT — DPO ou référent RGPD}}
**Validateur :** {{À COMPLÉTER PAR LE RT — Direction Générale}}

---

## 0. Opportunité d'une AIPD

La CNIL impose la réalisation d'une AIPD dès lors qu'un traitement est susceptible d'engendrer un **risque élevé pour les droits et libertés des personnes physiques** (Art. 35.1 RGPD).

Le traitement « Prospection commerciale d'artisans RGE » ne figure pas directement dans la liste des traitements soumis à AIPD obligatoire publiée par la CNIL (délibération n° 2018-327 du 11 octobre 2018). Toutefois, compte tenu :

- du volume significatif (50 538 SIRET uniques, dont une proportion élevée de personnes physiques / EI / micro-entrepreneurs),
- de la base légale choisie (intérêt légitime, nécessitant un balancing test rigoureux),
- du caractère systématique et automatisé de la collecte et du traitement,
- de la sensibilité particulière de la prospection B2B au regard de la doctrine CNIL,
- de l'ambition top 0.001% mondial fixée par la Direction Générale en matière de conformité,

la réalisation d'une AIPD est **décidée volontairement** à titre de bonne pratique et de privacy by design. Elle permet de documenter le raisonnement de conformité et de fournir un dossier défendable en cas de contrôle.

---

## 1. Description du traitement

### 1.1 Contexte

ServicesArtisans est une plateforme française de mise en relation entre particuliers souhaitant réaliser des travaux et artisans qualifiés. Dans le cadre de son lancement opérationnel (rodage équipes avril 2026) et de son pivot mandataire CEE, la société souhaite constituer une base d'artisans de confiance en s'appuyant sur les données publiques de l'ADEME.

La prospection a pour objectif :

1. **Court terme :** inscrire gratuitement des artisans RGE sur la plateforme, sans aucune contrepartie financière (monétisation volontairement différée à une phase ultérieure).
2. **Moyen terme :** leur proposer de recevoir des leads qualifiés (demandes de devis de particuliers pré-qualifiés).
3. **Long terme :** leur proposer de devenir partenaires du dispositif CEE via la SAS mandataire dédiée.

### 1.2 Périmètre

**Source des données :** Open Data ADEME, dataset « Liste des entreprises titulaires d'un signe de qualité RGE » (identifiant : `liste-des-entreprises-rge-2`), publié et maintenu par l'ADEME sur la plateforme `data.gouv.fr` sous licence ouverte (Licence Ouverte Etalab 2.0).

URL de référence : https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/

**Volumes au 2026-04-11 :**

- 165 000 lignes (une ligne = une combinaison SIRET × qualification)
- 60 000 SIRET uniques (après déduplication)
- ≈ 50 538 SIRET retenus après filtrage qualité (SIRET valide, établissement actif, qualification en cours de validité, coordonnées exploitables)
- Proportion estimée de personnes physiques (EI, micro-entreprises) : ~65 % (donnée à consolider par le pipeline ADEME, cf. `servicesartisans-rge-integration.md`)

**Canaux de prospection activés (phase 1) :**

- Email uniquement (régime opt-out B2B au sens de CPCE L.34-5)

**Canaux non activés (phase 1) :**

- Téléphone sortant (soumis à Bloctel, non pratiqué)
- SMS / WhatsApp (nécessitent un consentement explicite préalable Art. 6.1.a — preuve tracée dans `consent_proof`)
- Courrier postal (non pratiqué)

### 1.3 Cycle de vie des données

```
┌──────────────────────────────────────────────────────────────┐
│  1. INGESTION — Pipeline ADEME (cron hebdomadaire)           │
│     data.gouv.fr → staging → normalisation → DB providers    │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  2. QUALIFICATION — Filtrage qualité                         │
│     SIRET valide (Luhn), établissement actif (INSEE),        │
│     qualification en cours, email syntaxiquement valide,     │
│     pas de présence en liste opt-out ou suppressions         │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  3. SEGMENTATION — Priorisation                              │
│     Segmentation par métier, région, qualifications, score   │
│     Envoi échelonné pour préserver la réputation IP/domaine  │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  4. ENVOI — Resend                                           │
│     Email avec mentions Art. 14 RGPD + lien opt-out 1-clic   │
│     Cadence max : 500 emails/jour/domaine (phase 1)          │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  5. SUIVI — Tracking minimal                                 │
│     Bounces (hard/soft), désinscriptions, clics opt-out      │
│     PAS de tracking pixel ouvrable (anti-dark pattern)       │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  6. TERMINAISON                                              │
│     - Si opt-out → déplacement en liste de suppression       │
│     - Si bounce hard → idem                                  │
│     - Si 3 ans sans interaction → purge/anonymisation        │
│     - Si inscription effective → bascule vers traitement n°2 │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 Parties prenantes

- **Responsable de traitement :** ServicesArtisans (cf. registre).
- **Sous-traitants :** Resend (envoi), Supabase (base), Vercel (hébergement site et API).
- **Personnes concernées :** artisans RGE figurant dans l'Open Data ADEME.
- **Source officielle des données :** ADEME (Agence de l'Environnement et de la Maîtrise de l'Énergie — établissement public).

### 1.5 Référentiels applicables

- RGPD (UE 2016/679) — notamment Art. 5, 6, 12, 13, 14, 15-22, 25, 28, 30, 32, 33, 34, 35, 44-49.
- Loi Informatique et Libertés modifiée (loi n° 78-17 du 6 janvier 1978).
- Code des Postes et Communications Électroniques (CPCE) — Art. L.34-5 (prospection électronique).
- Code de la consommation — Art. L.223-1 et s. (Bloctel, non applicable en l'espèce).
- Directive ePrivacy (2002/58/CE modifiée).
- Lignes directrices CEPD : 05/2020 (consentement), 06/2020 (intérêt légitime), 03/2022 (dark patterns).
- Recommandation CNIL sur la prospection commerciale (délibération du 14 février 2022).
- Guide PIA CNIL (méthodologie, modèles, bases de connaissances).

---

## 2. Nécessité et proportionnalité

### 2.1 Finalité : légitime, déterminée, explicite ?

- **Légitime :** constituer une base de partenaires professionnels pour opérer une activité de mise en relation B2C et préparer un service mandataire CEE — activités économiques licites.
- **Déterminée :** finalité précise (inscription sur la plateforme, proposition de leads, proposition de partenariat CEE), documentée dans le registre des traitements.
- **Explicite :** communiquée aux personnes concernées via la politique de confidentialité et chaque email de prospection (Art. 14 RGPD).

**Évaluation : CONFORME.**

### 2.2 Base juridique

- **Article 6.1.f — Intérêt légitime.** Test de mise en balance détaillé dans le registre (section 1.3 du traitement n°1) et complété en annexe 1 de la présente AIPD.
- **Articulation avec CPCE L.34-5 :** la prospection électronique vers un professionnel identifié dans l'exercice de sa profession sur une adresse email nominative/générique utilisée à titre professionnel est autorisée sous régime opt-out, à la condition que l'objet du message soit en rapport avec la profession sollicitée. La proposition d'inscription à une plateforme de mise en relation pour artisans RGE satisfait cette condition.

**Évaluation : CONFORME — sous réserve de l'effectivité continue des mesures d'information et d'opt-out (cf. sections 3 et 5).**

### 2.3 Minimisation et pertinence des données

| Donnée                | Utilité                              | Minimisée ?                         |
| --------------------- | ------------------------------------ | ----------------------------------- |
| Raison sociale        | Personnalisation email               | Oui                                 |
| SIRET                 | Déduplication, recoupement INSEE     | Oui                                 |
| Email pro             | Canal de contact                     | Oui (unique canal activé)           |
| Adresse établissement | Segmentation géographique            | Oui                                 |
| Qualifications RGE    | Pertinence de l'offre                | Oui                                 |
| Téléphone pro         | Conservé mais NON UTILISÉ en phase 1 | À reconsidérer — voir plan d'action |
| Date de naissance     | Non collectée                        | N/A                                 |
| Données financières   | Non collectées                       | N/A                                 |

**Principe de minimisation (Art. 5.1.c) :** respecté. Une recommandation du plan d'action est néanmoins de ne pas ingérer le champ « téléphone » tant qu'il n'est pas utilisé opérationnellement.

### 2.4 Exactitude

- Synchronisation hebdomadaire depuis l'ADEME (cron) : les données sont toujours < 7 jours par rapport à la source officielle.
- Bounces détectés et purgés automatiquement.
- Demandes de rectification traitées sous 30 jours.

**Conforme Art. 5.1.d.**

### 2.5 Durée de conservation limitée

- 3 ans à compter du dernier contact actif (aligné recommandation CNIL prospection).
- Opt-outs conservés sans limite (justification : preuve du respect du droit d'opposition).
- Purge automatique programmée (cron à implémenter — cf. plan d'action).

**Conforme Art. 5.1.e — sous réserve de la mise en place effective du cron de purge.**

### 2.6 Information des personnes (Art. 13 et 14)

**Collecte indirecte (Art. 14)** : la donnée n'est pas collectée directement auprès de la personne, mais auprès de l'ADEME. L'Art. 14 impose une information **au plus tard au moment de la première communication** à la personne concernée.

Mentions obligatoires délivrées dans chaque email de prospection :

- Identité et coordonnées du responsable de traitement.
- Coordonnées du DPO (dpo@servicesartisans.fr).
- Finalités du traitement et base légale (intérêt légitime).
- Catégories de données concernées (identité professionnelle, email professionnel, données de qualification RGE).
- Source des données (ADEME Open Data, lien vers le dataset data.gouv.fr).
- Destinataires / catégories de destinataires (Resend, Supabase, Vercel).
- Durée de conservation.
- Droits exerçables et modalités.
- Droit d'introduire une réclamation auprès de la CNIL.

**Conforme Art. 14 — sous réserve du déploiement effectif du template email conforme (cf. plan d'action, action n°1).**

### 2.7 Exercice des droits

| Droit                   | Modalité                                                                            | Délai                                               |
| ----------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| Accès (Art. 15)         | dpo@servicesartisans.fr ou `/droit-acces`                                           | 1 mois                                              |
| Rectification (Art. 16) | idem                                                                                | 1 mois                                              |
| Effacement (Art. 17)    | idem, ou opt-out 1-clic                                                             | Immédiat pour opt-out, 1 mois pour effacement total |
| Limitation (Art. 18)    | dpo@servicesartisans.fr                                                             | 1 mois                                              |
| Opposition (Art. 21)    | Lien opt-out dans chaque email (1 clic, pas d'authentification)                     | Immédiat                                            |
| Portabilité (Art. 20)   | Non strictement applicable (base intérêt légitime) — accordée par politique interne | 1 mois                                              |
| Réclamation CNIL        | www.cnil.fr                                                                         | N/A                                                 |

**Conforme — sous réserve que les formulaires `/droit-acces` et `/droit-opposition` soient opérationnels et que l'endpoint `/api/prospection/optout` soit déployé (cf. plan d'action).**

---

## 3. Mesures de sécurité existantes

### 3.1 Confidentialité

| Mesure                 | Description                                                                  | Implémentée                       |
| ---------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| Chiffrement transit    | TLS 1.2+ imposé sur tous les flux HTTP (Vercel, Supabase, Resend)            | Oui                               |
| Chiffrement repos      | AES-256 (Supabase PostgreSQL at rest)                                        | Oui                               |
| Contrôle accès base    | Row Level Security (RLS) activé sur toutes les tables exposées via PostgREST | Oui                               |
| Isolation service_role | Clé service_role uniquement côté serveur, jamais exposée au client           | Oui (vérifié par audits Supabase) |
| Authentification admin | Supabase Auth + liste `ADMIN_EMAILS`                                         | Oui                               |
| MFA admin              | À déployer                                                                   | **Non — action corrective**       |
| Rate limiting          | Middleware Next.js sur endpoints sensibles                                   | Partiel                           |
| Segmentation envs      | dev / preview / prod sur Vercel + Supabase projets distincts                 | Oui                               |

### 3.2 Intégrité

| Mesure                 | Description                                                                      | Implémentée |
| ---------------------- | -------------------------------------------------------------------------------- | ----------- |
| Audit trail            | Table `audit_logs` (user_id, action, resource_type, resource_id, old/new values) | Oui         |
| Contraintes DB         | FK, CHECK, UNIQUE, NOT NULL sur toutes les tables critiques                      | Oui         |
| Migrations versionnées | Toutes les évolutions schéma sous Git (`supabase/migrations/`)                   | Oui         |
| Validation zod         | Tous les endpoints API valident les entrées avec zod                             | Oui         |

### 3.3 Disponibilité

| Mesure     | Description                                  | Implémentée                     |
| ---------- | -------------------------------------------- | ------------------------------- |
| Backups DB | Supabase Point-in-Time Recovery (PITR)       | Oui                             |
| Redondance | Vercel edge network multi-régions            | Oui                             |
| Monitoring | Sentry + Vercel logs + cron `sitemap-health` | Oui                             |
| DRP        | Plan de reprise formalisé                    | **Partiel — action corrective** |

### 3.4 Garde-fous spécifiques à la prospection

| Mesure                      | Description                                                                          | Implémentée                            |
| --------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------- |
| Table `prospection_optouts` | Liste des emails ayant demandé à ne plus être contactés                              | Oui                                    |
| Table `email_suppressions`  | Liste des bounces hard + plaintes                                                    | Oui                                    |
| Check pré-envoi             | Vérification systématique contre opt-outs et suppressions                            | À confirmer — action de validation     |
| `consent_proof`             | Champ dédié pour tracer le consentement (SMS/WhatsApp uniquement)                    | Oui                                    |
| Lien opt-out 1 clic         | Endpoint `/api/prospection/optout` avec token opaque, pas d'authentification requise | **À implémenter — action prioritaire** |

---

## 4. Appréciation des risques

Méthodologie CNIL : pour chacun des 3 scénarios de risque (accès illégitime, modification non désirée, disparition de données), évaluer la gravité (1 négligeable → 4 maximale) et la vraisemblance (1 négligeable → 4 maximale) **avant** et **après** mesures.

### 4.1 Scénario 1 — Accès illégitime aux données de prospection

**Sources de risque :**

- Humaine interne malveillante ou négligente (collaborateur, prestataire).
- Humaine externe : cybercriminel (vol de credentials, phishing, exploitation de vulnérabilité).
- Non humaine : fuite accidentelle (configuration S3 publique, clé exposée dans un dépôt Git public).

**Menaces :**

- Utilisation détournée des clés API Supabase service_role.
- Fuite d'un snapshot base de données.
- Compromission d'un compte administrateur.
- Extraction non autorisée via la console Supabase.

**Impact potentiel sur les personnes :**

- Réception de sollicitations commerciales non désirées (spam) — impact faible en B2B si l'email est professionnel et déjà publié par l'ADEME.
- Croisement avec d'autres bases nominatives — impact modéré.
- Utilisation frauduleuse (usurpation d'identité professionnelle, faux devis) — impact potentiellement élevé.

**Gravité (avant mesures) : 3 — Importante** (l'usurpation d'identité professionnelle ou la revente de listes à des acteurs malveillants pourrait causer un préjudice moral et financier significatif).

**Vraisemblance (avant mesures) : 3 — Importante** (les bases de prospection sont des cibles classiques).

**Mesures d'atténuation en place :** chiffrement TLS + AES-256, RLS, isolation service_role, audit logs, absence d'exposition publique, politique de gestion des secrets.

**Mesures complémentaires (plan d'action) :** MFA obligatoire pour tous les accès administrateurs, rotation trimestrielle des secrets, scan automatisé des dépôts Git (pre-commit hook + CI), tests d'intrusion annuels.

**Gravité (après mesures) : 2 — Limitée.**
**Vraisemblance (après mesures) : 1 — Négligeable.**

### 4.2 Scénario 2 — Modification non désirée des données

**Sources de risque :**

- Bug applicatif (mauvaise migration, script défaillant).
- Erreur humaine (opération manuelle en production).
- Attaque par injection (SQL injection, NoSQL injection).

**Menaces :**

- Corruption des listes opt-out (personnes re-sollicitées à tort).
- Modification des métadonnées de prospection (dates, statuts).
- Altération des adresses email (envois détournés).

**Impact potentiel sur les personnes :**

- Re-sollicitation d'une personne ayant exercé son droit d'opposition — atteinte directe aux droits RGPD.
- Atteinte à la réputation de l'artisan si des données erronées lui sont attribuées.

**Gravité (avant mesures) : 3 — Importante** (la violation du droit d'opposition est considérée par la CNIL comme une atteinte caractérisée).

**Vraisemblance (avant mesures) : 2 — Limitée** (validations zod + contraintes DB + audit trail réduisent significativement la probabilité).

**Mesures d'atténuation en place :** zod validation, contraintes PostgreSQL, migrations versionnées, audit_logs, revue de code obligatoire, tests unitaires (~600 tests).

**Mesures complémentaires :** tests d'intégration spécifiques sur le flow opt-out, alerte automatique en cas de modification massive de `prospection_optouts`, interdiction de tout `DELETE` sans clause `WHERE` via hook applicatif.

**Gravité (après mesures) : 2 — Limitée.**
**Vraisemblance (après mesures) : 1 — Négligeable.**

### 4.3 Scénario 3 — Disparition / indisponibilité des données

**Sources de risque :**

- Incident infrastructure (panne Supabase / Vercel).
- Suppression accidentelle (erreur humaine, `DROP TABLE` malencontreux).
- Ransomware.
- Fin de contrat avec un sous-traitant sans migration préparée.

**Menaces :**

- Perte de la table `prospection_optouts` → impossibilité de respecter les oppositions déjà exprimées.
- Perte du registre des envois → incapacité à prouver le respect des obligations en cas de contrôle.

**Impact potentiel sur les personnes :**

- Re-sollicitation de personnes ayant exercé leur droit d'opposition (atteinte directe).
- Incapacité à répondre à une demande d'accès (atteinte indirecte).

**Gravité (avant mesures) : 3 — Importante.**
**Vraisemblance (avant mesures) : 2 — Limitée.**

**Mesures d'atténuation en place :** Supabase PITR (Point-in-Time Recovery jusqu'à 7 jours), backups quotidiens, versioning des migrations, réplication multi-AZ côté AWS.

**Mesures complémentaires :** export hebdomadaire chiffré des tables `prospection_optouts` et `email_suppressions` vers un stockage froid indépendant (stratégie 3-2-1), procédure de restauration testée semestriellement, plan de reprise d'activité formalisé et validé.

**Gravité (après mesures) : 2 — Limitée.**
**Vraisemblance (après mesures) : 1 — Négligeable.**

### 4.4 Synthèse des risques résiduels

| Scénario                    | Gravité avant | Vraisemblance avant | Gravité après | Vraisemblance après | Risque résiduel |
| --------------------------- | ------------- | ------------------- | ------------- | ------------------- | --------------- |
| 1. Accès illégitime         | 3             | 3                   | 2             | 1                   | Acceptable      |
| 2. Modification non désirée | 3             | 2                   | 2             | 1                   | Acceptable      |
| 3. Disparition              | 3             | 2                   | 2             | 1                   | Acceptable      |

**Conclusion :** aucun risque résiduel élevé n'est identifié après application des mesures existantes et complémentaires. La consultation préalable de la CNIL (Art. 36 RGPD) n'est donc pas requise pour ce traitement, à condition que le plan d'action (section 5) soit intégralement exécuté avant la mise en production.

---

## 5. Plan d'action

Hiérarchisation P0 (bloquant) / P1 (avant scale) / P2 (amélioration continue).

### 5.1 Actions bloquantes (P0) — à exécuter AVANT le premier envoi de prospection

1. **Déployer l'endpoint `/api/prospection/optout`** avec token opaque, sans authentification, effet immédiat, idempotent. Responsable : équipe technique. Échéance : avant J-0 envoi.
2. **Finaliser le template email** avec l'ensemble des mentions Art. 14 RGPD, le lien opt-out visible (pas de dark pattern), l'adresse postale de l'expéditeur, la source des données ADEME et le lien vers la politique de confidentialité. Responsable : DPO + équipe contenu. Échéance : avant J-0.
3. **Mettre à jour la page `/confidentialite`** avec la section dédiée « Données issues de sources publiques » (livrable P1.2). Responsable : équipe technique. Échéance : avant J-0. **FAIT au 2026-04-11.**
4. **Mettre à jour la page `/mentions-legales`** avec le renvoi vers la section dédiée. Responsable : équipe technique. Échéance : avant J-0. **FAIT au 2026-04-11.**
5. **Vérifier qu'aucun SIRET présent dans `prospection_optouts` ou `email_suppressions` ne peut être re-contacté** : test d'intégration automatisé + dry-run manuel sur échantillon de 1 000 destinataires avant le premier envoi de masse. Responsable : équipe technique + DPO. Échéance : J-1.
6. **Activer le MFA pour tous les comptes administrateurs Supabase et Vercel.** Responsable : RSSI / équipe technique. Échéance : avant J-0.
7. **Documenter le registre des traitements** (livrable P1.1). Responsable : DPO. Échéance : avant J-0. **FAIT au 2026-04-11.**

### 5.2 Actions à court terme (P1) — dans les 60 jours suivant le premier envoi

8. **Désigner formellement un DPO** (interne ou externe mutualisé) et notifier la CNIL. Responsable : Direction Générale. Échéance : J+30.
9. **Formaliser le plan de reprise d'activité (PRA)** et tester la restauration de `prospection_optouts` depuis backup. Responsable : RSSI. Échéance : J+45.
10. **Mettre en place l'export hebdomadaire chiffré** des listes sensibles vers stockage froid indépendant. Responsable : équipe technique. Échéance : J+30.
11. **Former l'équipe commerciale** à la doctrine RGPD prospection (1 session obligatoire, émargement tracé). Responsable : DPO. Échéance : J+30.
12. **Rédiger et signer les contrats de sous-traitance (DPA)** avec Resend, Supabase, Vercel si pas déjà fait — archivage dans un espace dédié. Responsable : DPO + juridique. Échéance : J+15.
13. **Mettre en place un scan automatisé des dépôts Git** (pre-commit + CI) pour détecter toute fuite de secret. Responsable : équipe technique. Échéance : J+45.

### 5.3 Actions à moyen terme (P2) — amélioration continue

14. **Audit trimestriel** du respect effectif des durées de conservation (cron de purge à implémenter et vérifier). Responsable : DPO. Cadence : trimestrielle.
15. **Revue annuelle** du registre des traitements et de la présente AIPD. Responsable : DPO. Cadence : annuelle.
16. **Test d'intrusion** (pentest externe) annuel ciblant notamment l'endpoint opt-out et les flux Resend. Responsable : RSSI. Cadence : annuelle.
17. **Indicateurs de pilotage :** taux d'opt-out, taux de plainte (spam), taux de bounce, délai moyen de traitement des demandes de droits. Tableau de bord mensuel transmis au DPO. Responsable : équipe commerciale + DPO.
18. **Suivi doctrine CNIL :** veille juridique trimestrielle sur les recommandations prospection commerciale et intérêt légitime. Responsable : DPO.

---

## 6. Validation

### 6.1 Avis du DPO

_L'analyse d'impact ci-dessus a été conduite selon la méthodologie CNIL. À l'issue de l'analyse, les risques résiduels sont qualifiés d'acceptables sous réserve de l'exécution intégrale du plan d'action P0 avant le premier envoi de prospection. Je recommande la mise en œuvre du traitement après validation formelle par le responsable de traitement._

DPO / référent RGPD : {{À COMPLÉTER PAR LE RT — nom}}
Date : {{À COMPLÉTER}}
Signature : {{À COMPLÉTER}}

### 6.2 Décision du responsable de traitement

_Après examen de l'AIPD et au vu de l'avis du DPO, le responsable de traitement :_

- [ ] approuve la mise en œuvre du traitement ;
- [ ] subordonne la mise en œuvre à l'exécution préalable des actions P0 ;
- [ ] demande une révision de l'analyse ;
- [ ] refuse la mise en œuvre du traitement.

Représentant légal : {{À COMPLÉTER PAR LE RT — nom + fonction}}
Date : {{À COMPLÉTER}}
Signature : {{À COMPLÉTER}}

### 6.3 Consultation préalable CNIL (Art. 36 RGPD)

Au regard de la cartographie des risques résiduels (tous qualifiés d'acceptables après mesures), la consultation préalable de la CNIL n'est pas requise. Cette décision sera reconsidérée en cas :

- d'augmentation substantielle du volume (> 100 000 personnes concernées),
- d'ajout d'un canal de prospection à consentement préalable (SMS, WhatsApp),
- d'enrichissement par sources tierces,
- de profilage comportemental,
- de décision automatisée produisant des effets juridiques.

---

## Annexe 1 — Test de mise en balance (détail)

### Intérêt légitime invoqué

Développer une plateforme B2B2C française de mise en relation entre particuliers et artisans RGE qualifiés, afin (i) de faciliter l'accès des ménages aux aides publiques à la rénovation énergétique (MaPrimeRénov', Coup de pouce CEE), (ii) de soutenir l'activité économique des artisans qualifiés, et (iii) de structurer à terme une offre mandataire CEE au bénéfice des particuliers modestes. Intérêt économique, stratégique et social **qualifié de légitime** au regard du considérant 47 RGPD, qui mentionne explicitement la prospection commerciale comme un cas susceptible de relever de l'intérêt légitime.

### Nécessité du traitement

Aucune alternative moins intrusive ne permet d'atteindre la finalité avec la même efficacité :

- Les annuaires privés et agrégateurs tiers ne disposent pas de l'exhaustivité ni de la qualité de la base ADEME.
- Une campagne publicitaire grand public ne touche pas spécifiquement les artisans RGE.
- Une collecte par consentement préalable (opt-in pur) serait irréaliste compte tenu de l'absence de canal existant vers la population cible.

### Mise en balance avec les droits et libertés

| Facteur                            | Analyse                                                                                           | Impact       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ------------ |
| Nature des données                 | Strictement professionnelles, déjà publiées par l'ADEME                                           | Favorable RT |
| Attente raisonnable                | La publication ADEME vise précisément à permettre l'identification des artisans RGE par des tiers | Favorable RT |
| Statut des personnes               | Professionnels (B2B), non consommateurs                                                           | Favorable RT |
| Sensibilité des données            | Aucune donnée sensible ni infraction                                                              | Favorable RT |
| Caractère intrusif                 | Email uniquement, cadence limitée, pas de profilage                                               | Favorable RT |
| Vulnérabilité des personnes        | Population non vulnérable a priori                                                                | Favorable RT |
| Finalité secondaire surprenante ?  | Non : finalité annoncée à la première prise de contact                                            | Favorable RT |
| Coûts pour la personne             | Nuls (temps de lecture/désinscription marginal)                                                   | Favorable RT |
| Garanties offertes                 | Opt-out 1 clic, info Art. 14 complète, DPO désignable, durée 3 ans max                            | Favorable RT |
| Pouvoir de contrôle de la personne | Maximal (opposition immédiate, sans justification)                                                | Favorable RT |

**Conclusion du balancing test :** l'intérêt légitime du responsable de traitement prévaut sur les droits et libertés des personnes concernées, sous réserve de l'effectivité continue des garanties. Cette conclusion sera réévaluée à chaque revue annuelle de la présente AIPD.

---

## Annexe 2 — Références documentaires internes

- `docs/rgpd/registre-traitements.md` — Registre des activités de traitement (Art. 30)
- `servicesartisans-rge-integration.md` — Pipeline ADEME (mémoire projet)
- `project-servicesartisans-mandataire-cee.md` — Pivot mandataire CEE (mémoire projet)
- `src/app/(public)/confidentialite/page.tsx` — Politique de confidentialité publique
- `src/app/(public)/mentions-legales/page.tsx` — Mentions légales

---

_Document vivant — révision obligatoire : annuelle ou à chaque évolution substantielle du traitement._
