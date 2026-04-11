# Registre des activités de traitement — ServicesArtisans

**Référence juridique :** Article 30 du Règlement (UE) 2016/679 (RGPD)
**Date de création :** 2026-04-11
**Dernière révision :** 2026-04-11
**Version :** 1.0
**Responsable de la tenue du registre :** {{À COMPLÉTER PAR LE RT — nom du DPO ou du référent RGPD}}

---

## Identité du responsable de traitement

| Champ                                     | Valeur                                                                                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dénomination sociale                      | ServicesArtisans {{À COMPLÉTER PAR LE RT — SAS / SARL ?}}                                                                                                                                  |
| SIRET                                     | {{À COMPLÉTER PAR LE RT}}                                                                                                                                                                  |
| Siège social                              | {{À COMPLÉTER PAR LE RT — adresse postale complète}}                                                                                                                                       |
| Représentant légal                        | {{À COMPLÉTER PAR LE RT — nom du dirigeant}}                                                                                                                                               |
| Email générique                           | contact@servicesartisans.fr                                                                                                                                                                |
| Email DPO                                 | dpo@servicesartisans.fr                                                                                                                                                                    |
| Délégué à la protection des données (DPO) | {{À COMPLÉTER PAR LE RT — désignation obligatoire recommandée compte tenu du volume (>50 000 artisans) et de la nature B2B2C du traitement. À défaut, désigner un référent RGPD interne.}} |
| Autorité de contrôle compétente           | Commission Nationale de l'Informatique et des Libertés (CNIL), 3 Place de Fontenoy, 75007 Paris                                                                                            |

Ce registre couvre l'intégralité des traitements mis en œuvre par ServicesArtisans en qualité de responsable de traitement. Les traitements pour lesquels la société agit en qualité de sous-traitant (au sens de l'article 28 RGPD) font l'objet d'un registre distinct annexé aux contrats correspondants.

---

## Traitement n°1 — Prospection commerciale d'artisans RGE

**Statut :** ACTIF (mis en œuvre à compter du 2026-04-11)
**Criticité :** Élevée — fait l'objet d'une AIPD dédiée (`docs/rgpd/dpia-prospection-rge.md`)

### 1.1 Nom et coordonnées du responsable de traitement

Voir section « Identité du responsable de traitement » ci-dessus. Coordonnées du DPO : dpo@servicesartisans.fr.

### 1.2 Finalités du traitement

- Identifier les artisans titulaires d'une qualification RGE (Reconnu Garant de l'Environnement) présents dans la base Open Data de l'ADEME.
- Les contacter par voie électronique (email) afin de leur proposer l'inscription gratuite sur la plateforme ServicesArtisans et, dans un second temps, la réception de demandes de devis qualifiées correspondant à leur métier et à leur zone d'intervention.
- Alimenter, au fil des refus exprimés, une liste d'opposition (opt-out) afin de garantir la traçabilité du respect du droit d'opposition.

### 1.3 Base légale (RGPD Art. 6)

**Article 6.1.f — Intérêt légitime du responsable de traitement.**

Test de mise en balance (balancing test) :

1. **Intérêt légitime poursuivi.** Développer un service B2B de mise en relation entre particuliers et artisans qualifiés RGE, en s'adressant exclusivement à des professionnels identifiés comme tels dans un registre public administratif. Cet intérêt est légitime, réel, actuel et précis (recommandations CEPD 06/2014 reprises par les lignes directrices EDPB).
2. **Nécessité.** Les données de l'Open Data ADEME constituent la seule source exhaustive, officielle, centralisée et à jour des artisans RGE en France. L'alternative (constitution manuelle d'une base via annuaires privés) serait disproportionnée, lacunaire et conduirait à des erreurs de qualification (artisans non RGE contactés par erreur). Le traitement est donc strictement nécessaire à la finalité.
3. **Mise en balance avec les droits et libertés des personnes concernées.**
   - **Attente raisonnable.** Un artisan figurant dans le registre Open Data RGE, publié par l'ADEME précisément pour permettre aux particuliers et aux professionnels d'identifier les entreprises qualifiées, peut raisonnablement s'attendre à être contacté par des acteurs du secteur de la rénovation énergétique à des fins professionnelles. La publication elle-même a une vocation de mise en relation.
   - **Nature des données.** Il s'agit de données professionnelles (raison sociale, SIRET, email professionnel, téléphone professionnel, adresse de l'établissement, qualifications). Aucune donnée sensible au sens de l'Art. 9 n'est traitée.
   - **Caractère non intrusif.** La prospection est réalisée par email uniquement, à un rythme limité (cadence maximale fixée dans `docs/rgpd/dpia-prospection-rge.md`), sans profilage comportemental, sans enrichissement par sources tierces, sans décision automatisée.
   - **Garanties fortes.** Lien de désinscription en un clic dans chaque email (conforme CPCE L.34-5 et directive ePrivacy), page de politique de confidentialité dédiée, réponse aux demandes de droits sous 30 jours, suppression immédiate sur demande, liste de suppression persistante.
4. **Conclusion.** L'intérêt légitime du responsable de traitement l'emporte, compte tenu des garanties mises en place, sur les droits et libertés des personnes concernées, lesquelles restent à tout moment en mesure de s'opposer au traitement sans justification et avec effet immédiat.

**Articles connexes :**

- CPCE L.34-5 (prospection par voie électronique B2B entre personnes morales et personnes physiques dans l'exercice de leur activité professionnelle) — la CNIL admet le régime de l'opt-out pour la prospection d'un professionnel sur son email professionnel nominatif ou générique, sous réserve que l'objet du message soit en rapport avec sa profession.
- Code de la consommation L.223-1 et s. (Bloctel) — non applicable à la prospection email B2B mais vérification systématique est opérée si un canal téléphonique devait être activé (voir traitement n°1bis en section « à activer »).

### 1.4 Catégories de personnes concernées

Artisans individuels, dirigeants d'entreprise individuelle (EI), micro-entrepreneurs, gérants de SARL/SAS unipersonnelles, dont les coordonnées figurent dans la base Open Data ADEME « Liste des entreprises titulaires d'un signe de qualité RGE » (dataset `liste-des-entreprises-rge-2` publié sur data.gouv.fr).

Volume estimé au 2026-04-11 : environ 50 538 SIRET uniques, dont une proportion significative de personnes physiques (EI, micro-entreprises).

### 1.5 Catégories de données traitées

**Données ordinaires (non sensibles) :**

- Raison sociale / dénomination commerciale
- SIRET, SIREN, NIC
- Code APE/NAF
- Adresse de l'établissement (voie, code postal, commune, département, région)
- Email professionnel (lorsque publié par l'ADEME)
- Téléphone professionnel (lorsque publié par l'ADEME) — non utilisé à des fins de prospection téléphonique sortante en phase 1
- Qualifications RGE détenues (Qualibat, Qualit'EnR, Qualifelec, Certibat, etc.) et dates de validité
- Domaines de travaux couverts (isolation, pompe à chaleur, menuiseries, etc.)
- Métadonnées de prospection : date d'envoi, statut de délivrabilité (bounces), ouvertures agrégées, clics sur lien de désinscription, statut opt-in/opt-out

**Aucune donnée sensible (Art. 9 RGPD)** n'est traitée.
**Aucune donnée relative aux condamnations pénales et infractions (Art. 10 RGPD)** n'est traitée.
**Aucune donnée de mineur** n'est traitée.

### 1.6 Catégories de destinataires

**Internes :**

- Équipe commerciale ServicesArtisans (accès en lecture via interface d'administration authentifiée)
- Équipe technique (accès base de données via credentials `service_role` isolés, audit trail)
- DPO / référent RGPD (accès complet pour instruction des demandes de droits)

**Sous-traitants (Art. 28 RGPD) :**

- **Resend Inc.** — Envoi des emails de prospection. Siège : États-Unis. Garanties : Clauses Contractuelles Types (décision 2021/914). DPA signé.
- **Supabase Inc.** — Hébergement de la base de données PostgreSQL (localisation effective : AWS eu-west-1, Irlande). Garanties : SOC 2 Type II, SCCs, DPA.
- **Vercel Inc.** — Hébergement du site web et des API (logs de requêtes incluant l'adresse IP). Garanties : EU-US Data Privacy Framework, SCCs, DPA.

**Tiers destinataires :** Aucun. Les données de prospection ne sont ni cédées, ni louées, ni vendues, ni échangées avec des tiers.

### 1.7 Transferts hors Union européenne

Oui — transferts vers les États-Unis dans le cadre des prestations des sous-traitants Resend et Vercel.

**Garanties encadrant les transferts (Art. 44 à 49 RGPD) :**

- **Vercel Inc.** — Certifié EU-US Data Privacy Framework (décision d'adéquation de la Commission européenne du 10 juillet 2023). Clauses Contractuelles Types en complément.
- **Resend Inc.** — Clauses Contractuelles Types (modules appropriés au traitement, décision d'exécution (UE) 2021/914 de la Commission du 4 juin 2021).
- **Supabase Inc.** — Données stockées physiquement en Irlande (AWS eu-west-1). Seules les opérations d'administration du service sont susceptibles d'impliquer un accès depuis les États-Unis, encadré par SCCs et SOC 2 Type II.

Une analyse d'impact des transferts (Transfer Impact Assessment — TIA) est consignée dans `docs/rgpd/tia-prospection-rge.md` {{À COMPLÉTER PAR LE RT — fichier à rédiger avant lancement commercial effectif}}.

### 1.8 Durées de conservation

- **Base active :** 3 ans à compter du dernier contact positif émanant de la personne concernée (ouverture d'un email, clic, réponse, création de compte) — conforme à la recommandation CNIL relative à la prospection commerciale.
- **Liste d'opposition (opt-out) :** conservation pérenne, sans limite de durée, afin de garantir la non-resollicitation. Seules les données strictement nécessaires à l'identification sont conservées (email hashé + horodatage du refus).
- **Suppressions bounces (email_suppressions) :** conservation pérenne, même justification.
- **Journaux techniques d'envoi :** 13 mois (alignement sur la durée standard des logs techniques CNIL).

À l'issue de la durée active, les données sont soit anonymisées de manière irréversible, soit supprimées.

### 1.9 Description des mesures de sécurité techniques et organisationnelles (Art. 32 RGPD)

**Mesures techniques :**

- Chiffrement des données en transit : TLS 1.2+ imposé sur l'ensemble des flux (HTTPS, connexion base).
- Chiffrement des données au repos : AES-256 (PostgreSQL Supabase, stockage Vercel).
- Contrôle d'accès à la base : Row Level Security (RLS) PostgreSQL activé sur toutes les tables exposées via l'API client. Accès aux données de prospection réservé au rôle `service_role` isolé (jamais exposé côté client).
- Authentification forte pour les comptes administrateurs (MFA recommandé — {{À CONFIRMER PAR LE RT — état de déploiement du MFA admin}}).
- Journalisation (audit logs) de toutes les actions administratives sensibles sur la table `audit_logs`.
- Rate limiting applicatif sur les endpoints sensibles (middleware Next.js).
- Segmentation des environnements : développement / préproduction / production.

**Mesures organisationnelles :**

- Clause de confidentialité pour tous les collaborateurs et sous-traitants.
- Contrats de sous-traitance RGPD (DPA) signés avec Resend, Supabase, Vercel.
- Procédure documentée de gestion des demandes de droits.
- Procédure documentée de notification des violations de données (Art. 33 et 34 RGPD) : notification CNIL < 72h, notification personnes concernées si risque élevé.
- Revue annuelle du registre des traitements.
- Formation RGPD des collaborateurs à l'embauche et mise à jour annuelle.

### 1.10 Information des personnes et exercice des droits

- Information à la première prise de contact (Art. 14 RGPD — collecte indirecte) : chaque email de prospection contient une mention explicite (source des données ADEME, finalité, base légale, durée, coordonnées DPO, lien vers politique de confidentialité, lien de désinscription en un clic).
- Droits exercables à tout moment : accès, rectification, effacement, opposition, limitation, portabilité (dans la mesure où la portabilité est applicable à un traitement fondé sur l'intérêt légitime — elle ne l'est pas strictement, mais ServicesArtisans l'accorde par politique interne sur demande).
- Canaux d'exercice : dpo@servicesartisans.fr, formulaire `/droit-acces`, formulaire `/droit-opposition`, lien de désinscription dans chaque email (`/api/prospection/optout`).
- Délai de réponse : 1 mois maximum (Art. 12.3 RGPD), extensible de 2 mois en cas de complexité.

---

## Traitement n°2 — Gestion des comptes artisans et clients

**Statut :** ACTIF (depuis l'ouverture du service)

### 2.1 Responsable de traitement

Voir section « Identité du responsable de traitement ».

### 2.2 Finalités

- Création, authentification et administration des comptes utilisateurs (artisans et particuliers) sur la plateforme ServicesArtisans.
- Gestion du processus de revendication de fiche artisan (claim) et vérification du SIRET.
- Gestion du profil public des artisans ayant revendiqué leur fiche.
- Fourniture des services associés au compte (tableau de bord, statistiques de visibilité, gestion des demandes reçues, messagerie interne, gestion des avis).

### 2.3 Base légale

**Article 6.1.b — Exécution d'un contrat** auquel la personne concernée est partie (Conditions Générales d'Utilisation acceptées lors de l'inscription) ou mesures précontractuelles prises à la demande de celle-ci.

Pour les finalités accessoires (statistiques d'usage, amélioration du service) : **Article 6.1.f — Intérêt légitime**.

### 2.4 Catégories de personnes concernées

- Artisans inscrits (qu'ils aient ou non revendiqué une fiche préexistante)
- Particuliers inscrits souhaitant déposer une demande de devis ou gérer leurs favoris
- Représentants légaux d'entreprises artisanales

### 2.5 Catégories de données

- **Identification :** nom, prénom, adresse email, numéro de téléphone (E.164), mot de passe (haché bcrypt côté Supabase Auth), photo de profil le cas échéant.
- **Professionnelles (artisans) :** SIRET fourni lors du claim, raison sociale, adresse du siège, zone d'intervention, métiers exercés, qualifications RGE le cas échéant.
- **Compte :** identifiant interne, `user_type` (client / artisan), rôle, date de création, dernière connexion, statut (actif, suspendu).
- **Connexion :** adresse IP, user-agent (logs Vercel), historique de connexion.

Aucune donnée sensible. Aucune donnée d'infraction.

### 2.6 Destinataires

**Internes :** équipe support, équipe de modération, équipe technique, DPO.
**Sous-traitants :** Supabase (base et authentification), Vercel (hébergement et logs), Resend (emails transactionnels de confirmation, réinitialisation de mot de passe, notifications), Google LLC (OAuth Google si l'utilisateur choisit ce mode de connexion), Microsoft Corp. (Clarity — analytique comportemental avec consentement).
**Tiers :** artisans/clients entre eux via la messagerie interne (données strictement limitées à ce qui est partagé dans les échanges).

### 2.7 Transferts hors UE

Oui — Vercel, Resend, Google, Microsoft (États-Unis). Garanties : EU-US Data Privacy Framework et/ou Clauses Contractuelles Types (décision 2021/914). Supabase : stockage en Irlande.

### 2.8 Durées de conservation

- **Compte actif :** pendant toute la durée d'utilisation du service.
- **Compte inactif :** 3 ans à compter de la dernière connexion, puis anonymisation ou suppression.
- **Logs de connexion :** 1 an.
- **Données de facturation :** 10 ans (Code de commerce, art. L.123-22) le cas échéant.

### 2.9 Mesures de sécurité

Identiques au traitement n°1, avec en supplément :

- Authentification déléguée à Supabase Auth (bcrypt, rotation JWT, rate limiting natif).
- OAuth Google avec scopes minimaux.
- RLS PostgreSQL strict sur l'ensemble des tables utilisateur.
- Protection CSRF sur les mutations.
- Vérification SIRET lors du claim (croisement avec la base ADEME et/ou INSEE).

---

## Traitement n°3 — Dispatch de demandes de devis

**Statut :** ACTIF (fonctionnalité cœur du service)

### 3.1 Responsable de traitement

ServicesArtisans agit en qualité de responsable de traitement pour la collecte et le dispatch du lead. Les artisans destinataires deviennent responsables de traitement indépendants dès qu'ils reçoivent le lead et entrent en relation commerciale avec le particulier.

### 3.2 Finalités

- Collecter la demande de devis d'un particulier (formulaire `/devis`).
- Qualifier la demande (métier, localisation, urgence, budget indicatif).
- Identifier un artisan unique correspondant aux critères (règle métier : 1 lead = 1 artisan, pas de partage, cf. feedback_exclusive_leads_only).
- Transmettre la demande à cet artisan par email et via sa messagerie interne.
- Assurer la traçabilité de la transmission (date, artisan destinataire, statut).
- Assurer le suivi commercial via Pipedrive CRM (création Person + Deal + Note).

### 3.3 Base légale

**Article 6.1.b — Exécution du contrat** (le particulier sollicite explicitement la mise en relation en soumettant le formulaire).
**Article 6.1.a — Consentement** pour les canaux optionnels (SMS, WhatsApp) lorsqu'ils sont activés, avec preuve de consentement tracée dans le champ `consent_proof`.

### 3.4 Catégories de personnes concernées

Particuliers demandeurs de devis (et, lorsqu'ils sont mentionnés, les occupants du logement pour lequel les travaux sont envisagés).

### 3.5 Catégories de données

- Nom, prénom, email, téléphone.
- Adresse du chantier (voie, code postal, commune).
- Description des travaux souhaités, type de logement, surface, budget indicatif, urgence.
- Métadonnées : date de soumission, IP, user-agent, referrer.

Pas de données sensibles, sauf éventuelles indications libres de l'utilisateur dans le champ de description — une mention d'information invite à ne pas y fournir de données sensibles.

### 3.6 Destinataires

**Internes :** équipe support et modération (accès restreint aux demandes signalées).
**Artisan destinataire unique :** la demande lui est transmise et il en devient co-responsable de traitement pour le suivi de sa relation commerciale.
**Sous-traitants :** Supabase, Vercel, Resend, Pipedrive B.V. (CRM, établie aux Pays-Bas — transfert intra-UE).
**Tiers :** Pipedrive est susceptible de sous-traiter certains services aux États-Unis ; garanties SCCs au niveau du DPA Pipedrive.

### 3.7 Transferts hors UE

Pipedrive : siège UE, mais infrastructure partielle aux États-Unis — Clauses Contractuelles Types via le DPA Pipedrive. Les autres sous-traitants comme ci-dessus.

### 3.8 Durées de conservation

- **Demande de devis active :** 3 ans à compter de la soumission.
- **Dossier commercial après mise en relation effective :** 5 ans (prescription commerciale) côté Pipedrive.
- **Données d'anti-fraude / anti-spam (IP, empreinte) :** 1 an.

### 3.9 Mesures de sécurité

Identiques au traitement n°2, avec en supplément :

- Validation serveur stricte (schémas zod).
- Protection anti-bot / rate limiting.
- Chiffrement des emails en transit (TLS MTA-STS recommandé — {{À CONFIRMER PAR LE RT}}).
- Intégration Pipedrive en mode fire-and-forget avec cron de retry 6h (cf. `servicesartisans-pipedrive.md`).

---

## Traitement n°4 — Mandataire CEE (Certificats d'Économies d'Énergie)

**Statut :** À ACTIVER AVANT PRODUCTION (Phase 2 — pivot mandataire CEE, SAS dédiée, cf. `project-servicesartisans-mandataire-cee.md`)
**Ce traitement n'est pas encore mis en œuvre. Son inscription au présent registre est anticipée afin d'encadrer sa conception (privacy by design, Art. 25 RGPD). Il fera l'objet d'une AIPD spécifique avant tout traitement effectif.**

### 4.1 Responsable de traitement

SAS dédiée « ServicesArtisans CEE » (dénomination provisoire) — {{À COMPLÉTER PAR LE RT — SIRET, statuts et coordonnées à publier lors de l'immatriculation}}.

La SAS dédiée sera responsable de traitement. Une convention de co-traitance ou de responsabilité conjointe (Art. 26 RGPD) pourra être signée avec ServicesArtisans SAS pour les flux de données partagés.

### 4.2 Finalités

- Collecter le mandat CEE signé par le particulier bénéficiaire des travaux (signature électronique).
- Constituer le dossier administratif CEE (attestation sur l'honneur, devis, facture, attestation de fin de travaux, pièces justificatives du logement et du bénéficiaire).
- Transmettre le dossier au délégataire CEE partenaire (parmi les 20 délégataires P6 mappés : Effy, Sonergia, TotalEnergies, etc.).
- Assurer le suivi du dossier jusqu'à validation PNCEE et versement de la prime.
- Conserver les pièces justificatives à des fins de contrôle administratif (DGEC, PNCEE).

### 4.3 Base légale

- **Article 6.1.b — Exécution du contrat** (mandat signé par le bénéficiaire) pour la constitution et la transmission du dossier.
- **Article 6.1.c — Obligation légale** pour la conservation des pièces justificatives CEE (arrêté du 4 septembre 2014 modifié relatif aux contrôles dans le cadre du dispositif CEE, et articles R221-22 et s. du Code de l'énergie).

### 4.4 Catégories de personnes concernées

- Particuliers bénéficiaires de travaux d'économies d'énergie
- Occupants du logement si distincts du bénéficiaire
- Artisans réalisant les travaux

### 4.5 Catégories de données

- Identification complète du bénéficiaire (nom, prénom, date de naissance éventuellement, adresse).
- Adresse et caractéristiques du logement (surface, année de construction, type, mode de chauffage).
- Données fiscales pour l'éligibilité aux bonifications « Coup de pouce » (avis d'imposition — **données sensibles par leur nature, niveau de protection renforcé requis**).
- Pièces justificatives (scans).
- Données de l'artisan (SIRET, RGE, devis, factures).
- Signature électronique et données d'horodatage.

**Attention :** les données fiscales et les copies de pièces d'identité impliqueront une AIPD obligatoire (Art. 35 RGPD — liste CNIL des traitements soumis à AIPD : traitement de documents d'identité à grande échelle).

### 4.6 Destinataires

**Internes :** équipe opérations CEE, DPO.
**Sous-traitants pressentis :** éditeur de signature électronique eIDAS ({{À COMPLÉTER PAR LE RT — DocuSign / Yousign / Universign}}), hébergeur qualifié (Supabase maintenu, stockage eu-west), solution d'archivage à valeur probante {{À COMPLÉTER PAR LE RT}}.
**Tiers destinataires :**

- Délégataire CEE partenaire retenu pour le dossier.
- Pôle National des Certificats d'Économies d'Énergie (PNCEE — Ministère de la Transition Écologique) en cas de contrôle.
- DGCCRF en cas de contrôle.
- Organismes de contrôle accrédités (Bureau Veritas, Socotec, etc.) mandatés par le délégataire.

### 4.7 Transferts hors UE

A priori aucun — les sous-traitants CEE retenus devront être hébergés dans l'UE (critère d'architecture imposé en phase de conception).

### 4.8 Durées de conservation

- **Dossier CEE actif :** jusqu'à validation PNCEE + versement de la prime.
- **Archivage à valeur probante :** 9 ans à compter du dépôt au PNCEE (obligation réglementaire de conservation des pièces justificatives CEE — arrêté du 4 septembre 2014).
- **Données fiscales :** strictement limitées à la durée nécessaire à l'instruction du dossier, purge dès validation PNCEE sauf pièces exigées dans le dossier archivé.

### 4.9 Mesures de sécurité (à concevoir)

- Chiffrement renforcé des documents sensibles (AES-256 au repos, TLS 1.3 en transit).
- Cloisonnement de la base CEE vis-à-vis de la base principale ServicesArtisans.
- Traçabilité complète (audit trail) des accès aux dossiers.
- Authentification MFA obligatoire pour les opérateurs CEE.
- Contrat de sous-traitance renforcé avec l'éditeur de signature électronique.
- Revue de sécurité indépendante préalable au lancement.

### 4.10 Conditions d'activation

**Prérequis impératifs avant mise en production :**

1. Immatriculation de la SAS dédiée.
2. AIPD spécifique rédigée et validée par le DPO (Art. 35 RGPD).
3. Désignation formelle d'un DPO (obligatoire compte tenu du traitement à grande échelle de données sensibles).
4. Signature des contrats de sous-traitance.
5. Mise à jour de la politique de confidentialité et des mentions légales.
6. Consultation préalable de la CNIL en cas de risque résiduel élevé (Art. 36 RGPD) — à évaluer lors de l'AIPD.
7. Formation de l'équipe CEE.

---

## Suivi des versions

| Version | Date       | Auteur                    | Nature de la modification                         |
| ------- | ---------- | ------------------------- | ------------------------------------------------- |
| 1.0     | 2026-04-11 | {{À COMPLÉTER PAR LE RT}} | Création initiale du registre (traitements 1 à 4) |

## Procédure de mise à jour

Le présent registre est mis à jour :

- à chaque nouveau traitement mis en œuvre (avant sa mise en production),
- à chaque modification substantielle d'un traitement existant (nouveau destinataire, nouveau sous-traitant, nouvelle finalité, changement de base légale, changement de durée),
- à l'occasion de la revue annuelle systématique (calendrier fixé par le DPO),
- lors de toute demande de l'autorité de contrôle (Art. 30.4 RGPD : le registre doit être mis à disposition de la CNIL sur demande).

---

_Registre tenu au format markdown sous contrôle de version Git. Toute modification laisse une trace auditable dans l'historique du dépôt._
