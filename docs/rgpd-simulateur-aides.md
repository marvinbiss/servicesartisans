# Simulateur aides rénovation — Conformité RGPD V1

**Route** : `/simulateur-aides-renovation`
**Base légale** : Règlement (UE) 2016/679 (RGPD) + Loi Informatique et Libertés mod. 2018
**Responsable de traitement** : ServicesArtisans SAS
**DPO** : à désigner (contact : dpo@servicesartisans.fr)
**Version** : V1 — 2026-04-14
**Statut** : Phase 0 — bloquant avant mise en prod.

---

## 1. Cartographie des données traitées

### 1.1 Données d'identification

| Donnée       | Step | Obligatoire | Finalité                 |
| ------------ | ---- | ----------- | ------------------------ |
| Prénom + Nom | 4    | Oui         | Mise en relation artisan |
| Email        | 4    | Oui         | Envoi estimation + suivi |
| Téléphone    | 4    | Oui         | Contact artisan          |

### 1.2 Données techniques logement

| Donnée               | Step | Obligatoire | Finalité               |
| -------------------- | ---- | ----------- | ---------------------- |
| Type logement        | 1    | Oui         | Éligibilité fiches CEE |
| Résidence principale | 1    | Oui         | Éligibilité CDP        |
| Ancienneté           | 1    | Oui         | Éligibilité >2 ans     |
| Surface habitable    | 1    | Oui         | Calcul forfaits        |
| Code postal          | 1    | Oui         | Zone H1/H2/H3 + IdF    |

### 1.3 Données fiscales & foyer (sensibles)

| Donnée                     | Step | Obligatoire | Finalité       | Durée                                                          |
| -------------------------- | ---- | ----------- | -------------- | -------------------------------------------------------------- |
| Nombre personnes foyer     | 1    | Oui         | Plafond ANAH   | 3 ans max                                                      |
| Revenu Fiscal de Référence | 1    | Oui         | Catégorie ANAH | **90 jours en clair**, puis anonymisation (tranche 10k + hash) |

**⚠️ RFR = donnée sensible** au sens CNIL (information sur la situation économique). Conservation minimale, anonymisation rapide.

### 1.4 Données projet

| Donnée            | Step | Obligatoire | Finalité                  |
| ----------------- | ---- | ----------- | ------------------------- |
| Gestes souhaités  | 2    | Oui         | Calcul aides              |
| Équipement actuel | 2    | Oui         | Éligibilité CDP Chauffage |
| Budget estimé     | 3    | Oui         | Calcul reste à charge     |

### 1.5 Données techniques passives

| Donnée                    | Capture     | Finalité                    | Durée                   |
| ------------------------- | ----------- | --------------------------- | ----------------------- |
| IP (hashée SHA-256 salée) | Automatique | Rate limiting + anti-fraude | 6 mois                  |
| User-Agent                | Automatique | Statistiques + debug        | 6 mois                  |
| Timestamp                 | Automatique | Audit                       | Durée totale estimation |

**Jamais** de capture sans hash : IP en clair interdite.

---

## 2. Bases légales (art. 6 RGPD)

| Traitement                             | Base légale                                 | Justification                                                                     |
| -------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| Calcul estimation + stockage           | **Consentement explicite** (art. 6.1.a)     | L'utilisateur initie volontairement le simulateur                                 |
| Transmission artisan RGE via Pipedrive | **Exécution précontractuelle** (art. 6.1.b) | L'utilisateur demande la mise en relation                                         |
| Anti-fraude (IP hashée, rate limit)    | **Intérêt légitime** (art. 6.1.f)           | Protection du service ; test de mise en balance fait ; impact utilisateur minimal |
| Démarchage commercial ultérieur        | **Consentement séparé** (art. 6.1.a)        | Checkbox distincte et non pré-cochée                                              |
| Obligations légales de conservation    | **Obligation légale** (art. 6.1.c)          | Traces fiscales, opposabilité barèmes                                             |

---

## 3. Consentements

### 3.1 Consentement principal (Step 4)

Texte affiché :

> **☐ J'accepte que ServicesArtisans traite mes données pour calculer mon estimation d'aides et me mettre en relation avec un artisan RGE certifié.**
>
> Vos données sont conservées 3 ans maximum. Vous pouvez exercer vos droits (accès, rectification, suppression, opposition) à tout moment via notre [page dédiée](/rgpd) ou par email à dpo@servicesartisans.fr.

**Caractéristiques** :

- Checkbox **non pré-cochée** (CNIL)
- Validation Step 4 bloquée sans coche
- Timestamp enregistré dans `simulateur_estimations.consent_rgpd_at`
- Texte du consentement versionné (stocké avec la date)

### 3.2 Consentement démarchage (optionnel, séparé)

> **☐ J'accepte de recevoir des conseils personnalisés et offres de ServicesArtisans liés à ma rénovation énergétique.** (Optionnel)

**Caractéristiques** :

- Checkbox séparée
- Non bloquante pour le simulateur
- Révocable à tout moment via lien de désinscription dans chaque email

### 3.3 Refus / retrait

- Le retrait de consentement entraîne :
  - Suppression des données personnelles identifiantes sous 30 jours
  - Conservation anonymisée de l'estimation pour statistiques (agrégats, sans lien avec la personne)
- Aucune conséquence sur la fourniture du service passé.

---

## 4. Durées de conservation

| Catégorie                                     | Durée active                | Anonymisation / Suppression                                     |
| --------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| Coordonnées (nom, email, tel)                 | 3 ans après dernier contact | Suppression totale                                              |
| RFR en clair                                  | **90 jours**                | Remplacé par tranche (ex : « 20k-30k ») + hash salé             |
| Nombre de personnes foyer                     | 3 ans                       | Suppression ou agrégat                                          |
| Code postal                                   | 3 ans                       | Conservé pour stats régionales (agrégé département après 3 ans) |
| Estimation (forfaits, gestes, reste à charge) | 10 ans                      | Conservation légale opposabilité barèmes                        |
| IP hashée                                     | 6 mois                      | Suppression                                                     |
| Logs techniques                               | 6 mois                      | Suppression                                                     |
| Estimation liée à une transaction signée      | Durée contractuelle + 5 ans | Obligation comptable                                            |

**Mécanisme** : cron quotidien `/api/cron/rgpd-anonymize` qui parcourt `simulateur_estimations` et applique les règles ci-dessus selon `created_at` et `pipedrive_deal_id`.

---

## 5. Droits des personnes (art. 15-22 RGPD)

| Droit                          | Délai  | Mécanisme                                                                                                          |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Accès (art. 15)                | 1 mois | Export JSON + PDF depuis `/rgpd/mes-donnees` après login ou par email                                              |
| Rectification (art. 16)        | 1 mois | Via `/rgpd/mes-donnees` ou support                                                                                 |
| Effacement / oubli (art. 17)   | 1 mois | Bouton « Supprimer mes données » + confirmation email                                                              |
| Limitation (art. 18)           | 1 mois | Support ticket                                                                                                     |
| Portabilité (art. 20)          | 1 mois | Export JSON normalisé                                                                                              |
| Opposition (art. 21)           | 1 mois | Désabonnement en 1 clic + confirmation                                                                             |
| Décision automatisée (art. 22) | —      | Non applicable : l'estimation est un calcul déterministe non décisionnel. L'utilisateur garde le choix des gestes. |

### 5.1 Endpoints

| Route                         | Méthode | Rôle                                                           |
| ----------------------------- | ------- | -------------------------------------------------------------- |
| `/rgpd/mes-donnees`           | GET     | Page utilisateur (login requis ou lien signé envoyé par email) |
| `/api/rgpd/export/:publicId`  | GET     | Export JSON complet (signé, expire 48h)                        |
| `/api/rgpd/delete/:publicId`  | POST    | Déclenche workflow suppression (confirm email + 7j délai)      |
| `/api/rgpd/rectify/:publicId` | PATCH   | Correction (soumis à validation support)                       |

---

## 6. Sécurité des traitements (art. 32)

| Mesure                 | Implémentation                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| Chiffrement en transit | TLS 1.3 obligatoire (Vercel + Supabase)                          |
| Chiffrement au repos   | Supabase pgcrypto pour colonnes sensibles (RFR)                  |
| Hachage IP             | SHA-256 + salt stocké env var `RGPD_IP_SALT` (rotation annuelle) |
| Rate limiting          | 5 estimations/IP/heure, 20/jour                                  |
| Accès admin            | `requirePermission('simulateur', 'read')` + MFA obligatoire      |
| Logs d'accès admin     | Table `audit_logs` (cf. CLAUDE.md) — conservation 5 ans          |
| Backups                | Supabase daily backup chiffré, rétention 30 jours                |
| Tests sécurité         | Inclus dans pipeline `/security` + scan trimestriel OWASP        |
| Formation équipe       | Briefing RGPD à l'onboarding                                     |

---

## 7. Sous-traitants (art. 28)

| Sous-traitant   | Rôle                         | Pays                  | Contrat   |
| --------------- | ---------------------------- | --------------------- | --------- |
| Vercel Inc.     | Hébergement web              | États-Unis (CCT)      | DPA signé |
| Supabase        | Base de données + auth       | UE (Frankfurt)        | DPA signé |
| Pipedrive       | CRM (leads qualifiés)        | UE (Estonia, Tallinn) | DPA signé |
| Resend          | Envoi emails transactionnels | UE                    | DPA signé |
| Twilio (si SMS) | SMS transactionnels          | États-Unis (CCT)      | DPA signé |

**Transferts hors UE** : Vercel et Twilio — basés sur les **Clauses Contractuelles Types** de la Commission européenne (décision 2021/914) + évaluation d'impact sur les transferts (TIA) à documenter.

---

## 8. Cookies & traceurs

### 8.1 Inventaire

| Cookie / traceur                    | Type                     | Finalité                    | Durée    | Consentement                         |
| ----------------------------------- | ------------------------ | --------------------------- | -------- | ------------------------------------ |
| `simulateur_session`                | Fonctionnel              | Maintenir l'état du stepper | Session  | Dispensé                             |
| `supabase-auth-token`               | Fonctionnel              | Authentification            | 1 an     | Dispensé                             |
| `plausible` ou analytics équivalent | Statistiques anonymisées | Mesure audience             | 1 an     | Soumis à consentement si non anonyme |
| Pixel Pipedrive (si présent)        | Marketing                | Tracking conversion         | Variable | **Consentement obligatoire**         |

### 8.2 Bannière cookies

Bannière conforme CNIL 2020 :

- Accepter tout / Refuser tout au même niveau visuel
- Paramétrer par catégorie
- Refus aussi simple que l'accord
- Logs de consentement conservés 6 mois

---

## 9. Registre des activités (art. 30)

À tenir et mettre à jour :

```yaml
traitement:
  nom: Simulateur aides rénovation énergétique
  finalite:
    - Calculer une estimation d'aides financières
    - Mettre en relation avec un artisan RGE
  responsable: ServicesArtisans SAS
  dpo: dpo@servicesartisans.fr
  bases_legales: [consentement, execution_precontractuelle, interet_legitime]
  categories_personnes: [prospects_particuliers, locataires, proprietaires]
  categories_donnees:
    - identite: [nom, email, telephone]
    - logement: [surface, anciennete, code_postal]
    - fiscal: [RFR, taille_foyer] # ⚠️ sensible
    - projet: [gestes, budget, equipement_actuel]
    - techniques: [IP_hash, user_agent]
  destinataires_internes: [equipe_simulateur, support, admin]
  destinataires_externes: [artisans_RGE_certifies_valides]
  transferts_hors_UE: [Vercel_US_CCT, Twilio_US_CCT]
  durees_conservation: voir §4
  mesures_securite: voir §6
```

---

## 10. Analyse d'impact (AIPD — art. 35)

### 10.1 Critères de déclenchement

- **Données sensibles** : RFR → oui, concerne la situation économique.
- **Surveillance systématique** : non.
- **Vulnérabilité** : les ménages très modestes sont une catégorie vulnérable.
- **Innovation technologique** : non (calculs classiques).
- **Profilage automatisé avec effet significatif** : non (décision finale reste chez l'utilisateur + artisan).

**Conclusion** : AIPD **recommandée** (non strictement obligatoire) vu la présence du RFR et la cible potentiellement vulnérable. À mener avant passage en production à grande échelle.

### 10.2 Périmètre

- Finalités, bases légales, nécessité, proportionnalité
- Risques pour les personnes (atteinte à la vie privée, discrimination, fraude)
- Mesures de mitigation (§6)
- Consultation DPO + personnes concernées si possible

### 10.3 Livrable

`docs/aipd-simulateur.md` (à créer après V1 en prod si volume > 1000 estimations/mois).

---

## 11. Mineurs (art. 8)

Le simulateur cible les propriétaires/locataires majeurs. Un consentement parental est théoriquement requis pour les < 15 ans.

**Mesure** : ajouter une case à cocher « Je certifie être majeur(e) et titulaire du logement ou mandaté par son propriétaire » au Step 4. Bloquante sans validation.

---

## 12. Notification violations (art. 33-34)

En cas de violation :

- Sous **72h** : notification CNIL (nature, nombre personnes, conséquences, mesures)
- Si risque élevé : information des personnes concernées
- Registre des violations tenu à jour (art. 33.5)
- Runbook : `docs/security/incident-response.md` (à vérifier)

---

## 13. Mentions légales affichées sur le simulateur

**Step 1 (en bas de page)** :

> Les données collectées sont traitées par ServicesArtisans pour calculer votre estimation. Aucune donnée n'est transmise à un tiers avant votre accord explicite (Step 4). [Politique de confidentialité](/confidentialite)

**Step 4 (avant les champs coordonnées)** :

> Vos coordonnées sont nécessaires pour recevoir votre estimation et, si vous le souhaitez, être mis(e) en relation avec un artisan RGE. Conservation : 3 ans. Vos droits : voir [RGPD](/rgpd).

**Step 5 (résultat)** :

> Estimation indicative non contractuelle. Le montant final dépend du devis RGE, de votre avis d'imposition et du cours du kWhc. Barèmes version 2026-01 du 14/04/2026. ID estimation : EST-2026-04-14-xxxxxx

---

## 14. Gouvernance & revue

| Évènement               | Action                                                      |
| ----------------------- | ----------------------------------------------------------- |
| MAJ trimestrielle       | Revue documentation + tests exercice des droits             |
| MAJ barèmes             | Mise à jour texte du consentement si élargissement finalité |
| Nouvel outil            | DPIA préalable                                              |
| Incident sécurité       | Notification CNIL 72h                                       |
| Rotation `RGPD_IP_SALT` | Annuelle                                                    |
| Audit externe           | Recommandé tous les 2 ans                                   |

---

## 15. Checklist avant mise en prod

- [ ] Tables Supabase créées avec colonnes RGPD (`consent_rgpd`, `consent_rgpd_at`, `ip_hash`)
- [ ] Cron `rgpd-anonymize` déployé et testé
- [ ] Bannière cookies conforme CNIL 2020 en place
- [ ] Page `/rgpd/mes-donnees` fonctionnelle (accès, rectification, suppression)
- [ ] Page `/confidentialite` à jour avec mention simulateur
- [ ] DPA signés avec tous les sous-traitants
- [ ] Registre des activités mis à jour
- [ ] Consentement non pré-coché validé par QA
- [ ] Checkbox majorité validée par QA
- [ ] `RGPD_IP_SALT` configuré et rotable
- [ ] Test export JSON utilisateur fonctionnel
- [ ] Test suppression complète fonctionnel (sans orphelins Pipedrive)
- [ ] AIPD entamée ou planifiée

---

## 16. Références

- [CNIL — Simulateurs et calculateurs en ligne](https://www.cnil.fr/)
- [Règlement (UE) 2016/679 — RGPD](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Loi Informatique et Libertés mod. 2018](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000886460)
- Doc technique : `docs/simulateur-architecture.md`
- Pattern Pipedrive (fire-and-forget + DLQ) : mémoire `servicesartisans-pipedrive.md`
