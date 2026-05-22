# Sprint 5 — Templates d'emails outreach Indice Rénovation 2026

Trois templates pour la prospection presse autour du baromètre `/barometre/renovation-energetique-2026`. Données strictement issues de sources publiques (ADEME, ANAH, data.gouv). Aucune statistique inventée.

Variables à substituer :

- `{{journalist_name}}` — Prénom Nom du journaliste
- `{{medium_name}}` — Nom du média
- `{{region_specific_stat}}` — Statistique régionale extraite du baromètre (ex. « densité d'entreprises RGE actives en Bretagne », « volume MaPrimeRénov' Hauts-de-France 2025 »)
- `{{barometre_url}}` — `https://servicesartisans.fr/barometre/renovation-energetique-2026`
- `{{embed_url}}` — `https://servicesartisans.fr/api/v1/barometre/renovation/embed.html`

Toutes les statistiques citées dans les emails doivent provenir des sources affichées en bas du baromètre (ADEME Observatoire DPE, ANAH MaPrimeRénov', data.gouv Registre RGE). Ne JAMAIS arrondir ou extrapoler hors du baromètre.

---

## T1 — Court (≤ 80 mots)

**Objet** : Indice Rénovation 2026 — données publiques CC-BY 4.0 pour {{medium_name}}

Bonjour {{journalist_name}},

Nous publions un baromètre public croisant trois sources officielles : Observatoire DPE (ADEME), MaPrimeRénov' 2025 (ANAH), Registre RGE (data.gouv). Pour {{medium_name}}, point d'intérêt possible : {{region_specific_stat}}.

Page : {{barometre_url}}
Embed prêt à coller (licence CC-BY 4.0) : {{embed_url}}

À disposition pour fournir les jeux de données bruts ou un commentaire.

Cordialement,
[Nom] — ServicesArtisans

---

## T2 — Moyen (≤ 150 mots)

**Objet** : Baromètre public Rénovation 2026 — sources ADEME / ANAH / data.gouv, embed CC-BY 4.0

Bonjour {{journalist_name}},

Pour vos prochains sujets rénovation énergétique, nous mettons en ligne l'Indice Rénovation 2026, un baromètre public construit uniquement à partir de sources officielles vérifiables :

- Logements en classe DPE F ou G — Observatoire DPE de l'ADEME
- MaPrimeRénov' distribuées en 2025 — données ANAH
- Entreprises RGE actives au 22 mai 2026 — Registre RGE sur data.gouv

L'angle pour {{medium_name}} : {{region_specific_stat}}.

Tout est embarquable gratuitement sous licence Creative Commons BY 4.0 (crédit ServicesArtisans + lien). Le snippet HTML est ici : {{embed_url}}
La page complète, avec méthodologie et liens sources : {{barometre_url}}

Nous pouvons fournir les jeux de données régionalisés (CSV) ou un commentaire signé.

Cordialement,
[Nom] — ServicesArtisans

---

## T3 — Relance J+5 (≤ 60 mots)

**Objet** : Relance — Indice Rénovation 2026 (sources ADEME / ANAH / data.gouv)

Bonjour {{journalist_name}},

Pour mémoire, l'Indice Rénovation 2026 reste à votre disposition : {{barometre_url}}.

Embed CC-BY 4.0 : {{embed_url}}

Si l'angle {{region_specific_stat}} vous intéresse, je peux extraire les chiffres régionaux et fournir un visuel dédié sous 24 h.

Cordialement,
[Nom] — ServicesArtisans

---

## Règles de rédaction

- Ne JAMAIS citer un chiffre absent du baromètre publié.
- Toujours nommer la source officielle (ADEME / ANAH / data.gouv) à côté de la statistique.
- Pas de superlatif marketing (« leader », « révolutionnaire », « unique »). Description factuelle uniquement.
- Pas de promesse implicite (« vos lecteurs vont adorer »).
- Signature humaine obligatoire (pas « l'équipe ServicesArtisans »).
- Pas d'envoi groupé visible (BCC interdit pour la presse, un email par journaliste).
