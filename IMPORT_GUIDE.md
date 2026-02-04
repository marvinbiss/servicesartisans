# 📦 Guide d'Import des Données Google Maps

## 🎯 Ce que fait ce script

Importe **1000 artisans** avec leurs **vrais avis Google** depuis le fichier `Google Maps full information.json` vers Supabase.

### Données importées :
- ✅ **Artisans** → Table `providers` (nom, adresse, téléphone, site, notes, etc.)
- ✅ **Avis Google** → Table `reviews` (contenu, auteur, note, date)
- ✅ **Photos, localisation, horaires**

---

## 🚀 ÉTAPES D'INSTALLATION

### 1️⃣ Vérifiez vos variables d'environnement

Ouvrez votre fichier `.env.local` et vérifiez que vous avez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

⚠️ **IMPORTANT** : Utilisez la `service_role_key`, PAS la `anon_key` !

---

### 2️⃣ Installez les dépendances (si pas déjà fait)

```bash
npm install
```

---

### 3️⃣ Exécutez le script d'import

```bash
npx tsx scripts/import-google-maps-data.ts
```

---

## 📊 CE QUI VA SE PASSER

Le script va :
1. ✅ Lire `Google Maps full information.json`
2. ✅ Transformer les données pour Supabase
3. ✅ Insérer 1000 artisans dans `providers`
4. ✅ Insérer leurs avis dans `reviews`
5. ✅ Afficher la progression en temps réel

**Durée estimée** : 2-3 minutes

---

## 🎉 RÉSULTAT ATTENDU

```
📊 RÉSUMÉ DE L'IMPORT
============================================================
✅ Providers insérés: 1000
✅ Avis insérés: ~5000-10000
❌ Erreurs: 0
============================================================
```

---

## 🔍 VÉRIFICATION

Après l'import, vérifiez dans Supabase :

```sql
-- Compter les providers
SELECT COUNT(*) FROM providers;

-- Compter les avis
SELECT COUNT(*) FROM reviews;

-- Voir un exemple
SELECT name, rating_average, review_count 
FROM providers 
LIMIT 5;
```

---

## ❓ EN CAS DE PROBLÈME

### Erreur "Variables d'environnement manquantes"
➡️ Vérifiez que `.env.local` contient bien `SUPABASE_SERVICE_ROLE_KEY`

### Erreur "permission denied"
➡️ Utilisez la `service_role_key`, pas la `anon_key`

### Erreur "duplicate key"
➡️ Les données existent déjà, videz d'abord les tables :
```sql
DELETE FROM reviews;
DELETE FROM providers;
```

---

## 📞 SUPPORT

Si vous avez des erreurs, copiez-collez le message d'erreur complet !
