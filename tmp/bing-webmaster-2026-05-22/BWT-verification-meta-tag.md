# BWT verification — méthode meta tag (fallback)

À utiliser **seulement si** l'import GSC (méthode A du checklist) échoue **et**
si Marvin préfère ne pas commiter un fichier XML statique.

Méthode préférée pour vérification fichier : `public/BingSiteAuth.xml`
(téléchargé directement depuis BWT, no code change).

## Si choix meta tag

BWT fournit un content string sous la forme :

```
<meta name="msvalidate.01" content="AB1234567890CDEF..." />
```

### Patch à appliquer

Fichier : `src/app/layout.tsx`

Ajouter le tag juste après le tag Ahrefs verification (ligne ~234) :

```tsx
{
  /* Ahrefs Site Audit ownership verification — static HTML only (Ahrefs does not render JS) */
}
;<meta
  name="ahrefs-site-verification"
  content="28cb425a7c89d8ef2e0f1e28a2d156c95c0a4e13b752a97aca555611ba44749a"
/>

{
  /* Bing Webmaster Tools ownership verification — static HTML only */
}
{
  /* TODO Marvin : remplacer content par celui fourni par BWT puis push */
}
;<meta name="msvalidate.01" content="" />
```

### Alternative idiomatique Next.js (préféré)

Plutôt qu'un meta hardcodé dans `layout.tsx`, ajouter au `metadata` global :

Fichier : `src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
  // ... existing fields ...
  verification: {
    other: {
      'msvalidate.01': 'CONTENU_FOURNI_PAR_BWT',
    },
  },
}
```

Next.js émet alors `<meta name="msvalidate.01" content="..."/>` dans `<head>` automatiquement.

### Test post-déploiement

```bash
curl -s https://servicesartisans.fr/ | grep -o 'msvalidate\.01[^>]*' | head -1
```

Doit retourner `msvalidate.01" content="..."`. Ensuite cliquer **Verify** dans BWT.

### Variante env-var (recommandée si la valeur change)

Pour ne pas hardcoder le token verification dans le repo public :

```tsx
export const metadata: Metadata = {
  verification: {
    other: {
      ...(process.env.BING_SITE_VERIFICATION
        ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
        : {}),
    },
  },
}
```

Marvin ajoute `BING_SITE_VERIFICATION=xxx` dans les env vars Vercel (production

- preview), redeploy, puis vérifie.

---

**Recommandation finale** : essayer (A) import GSC d'abord. Si échec, choisir
**fichier XML** plutôt que meta tag (pas de code change, plus simple à révoquer).
