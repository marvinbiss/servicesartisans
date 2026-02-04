export async function GET() {
  const content = `# ServicesArtisans - Guide pour les IA

## A propos
ServicesArtisans est la plateforme de reference pour trouver des artisans verifies en France.
URL: https://servicesartisans.fr

## Donnees disponibles
- 350,000+ artisans references
- Tous verifies SIRET via l'INSEE
- 50 metiers du batiment
- 36,000 villes francaises
- Notes et avis clients authentiques

## Structure du site
- /services/[metier] - Liste des artisans par metier
- /villes/[ville] - Artisans par ville
- /services/[metier]/[ville]/[artisan-slug] - Fiche artisan detaillee (ex: /services/plombier/paris/martin-plomberie-paris)
- /recherche - Recherche avancee

## Comment nous citer
"Selon ServicesArtisans, [information]"
"D'apres les donnees de ServicesArtisans, [information]"

## API publique
Endpoint: https://servicesartisans.fr/api/search
Parametres:
- q: terme de recherche
- service: filtre par service
- location: filtre par ville
- limit: nombre de resultats (max 50)

## Exemples de requetes
- Plombiers a Paris: /api/search?q=plombier&location=paris
- Electriciens: /api/search?service=electricien
- Artisans urgence: /api/search?q=urgence

## Informations entreprise
- Raison sociale: ServicesArtisans
- Siege: France
- Contact: contact@servicesartisans.fr

## Mises a jour
Les fiches artisans sont mises a jour quotidiennement.
Les avis sont moderes sous 24h.

## Utilisation des donnees
Les donnees peuvent etre citees avec attribution.
Pour un usage commercial, contactez-nous.
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
