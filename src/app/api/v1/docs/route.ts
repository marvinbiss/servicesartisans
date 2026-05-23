import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { logger } from '@/lib/logger'

/**
 * GET /api/v1/docs
 *
 * Page de documentation HTML de l'API Baromètre des Artisans
 */
export async function GET() {
  try {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>API Baromètre des Artisans — Documentation | ${SITE_NAME}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
    h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; color: #0f172a; }
    h2 { font-size: 1.25rem; font-weight: 700; margin: 2rem 0 0.75rem; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h3 { font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: #334155; }
    p { margin-bottom: 1rem; color: #475569; }
    code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.875rem; color: #0f172a; }
    pre { background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1rem; font-size: 0.8125rem; line-height: 1.7; }
    pre code { background: none; padding: 0; color: inherit; }
    .badge { display: inline-block; background: #2563eb; color: #fff; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-right: 0.5rem; }
    .badge-get { background: #16a34a; }
    .endpoint { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
    .endpoint-url { font-family: monospace; font-size: 0.875rem; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
    th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; }
    th { background: #f8fafc; font-weight: 600; color: #334155; }
    .warn { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    .warn strong { color: #92400e; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .subtitle { color: #64748b; font-size: 1.125rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>API Baromètre des Artisans</h1>
    <p class="subtitle">Accédez aux statistiques agrégées de ${SITE_NAME} sur les artisans du bâtiment en France.</p>

    <div class="warn">
      <strong>Attribution obligatoire</strong> — Toute utilisation des données de cette API doit inclure un lien visible vers
      <a href="${SITE_URL}/barometre">${SITE_URL}/barometre</a> avec la mention
      « Source : ${SITE_NAME} — Baromètre des Artisans ».
    </div>

    <h2>Endpoints</h2>

    <div class="endpoint">
      <p><span class="badge badge-get">GET</span> <span class="endpoint-url">/api/v1/tarifs</span></p>
      <p>Statistiques par métier, optionnellement filtré par localisation.</p>
      <h3>Paramètres</h3>
      <table>
        <tr><th>Param</th><th>Type</th><th>Requis</th><th>Description</th></tr>
        <tr><td><code>metier</code></td><td>string</td><td>Oui</td><td>Slug du métier (ex: <code>plombier</code>)</td></tr>
        <tr><td><code>ville</code></td><td>string</td><td>Non</td><td>Slug de la ville (ex: <code>paris</code>)</td></tr>
        <tr><td><code>departement</code></td><td>string</td><td>Non</td><td>Code département (ex: <code>75</code>)</td></tr>
        <tr><td><code>region</code></td><td>string</td><td>Non</td><td>Slug de la région (ex: <code>ile-de-france</code>)</td></tr>
      </table>
      <h3>Exemple</h3>
      <pre><code>curl "${SITE_URL}/api/v1/tarifs?metier=plombier&ville=paris"</code></pre>
      <pre><code>{
  "success": true,
  "data": [{
    "metier": "Plombier",
    "metier_slug": "plombier",
    "ville": "Paris",
    "nb_artisans": 1250,
    "note_moyenne": 4.35,
    "nb_avis": 8420,
    "taux_verification": 0.4520
  }],
  "attribution": {
    "text": "Source : ${SITE_NAME} — Baromètre des Artisans",
    "url": "${SITE_URL}/barometre"
  }
}</code></pre>
    </div>

    <div class="endpoint">
      <p><span class="badge badge-get">GET</span> <span class="endpoint-url">/api/v1/stats</span></p>
      <p>Statistiques régionales ou départementales — tous les métiers d'une zone.</p>
      <h3>Paramètres</h3>
      <table>
        <tr><th>Param</th><th>Type</th><th>Requis</th><th>Description</th></tr>
        <tr><td><code>region</code></td><td>string</td><td>Non*</td><td>Slug de la région (ex: <code>ile-de-france</code>)</td></tr>
        <tr><td><code>departement</code></td><td>string</td><td>Non*</td><td>Code département (ex: <code>75</code>)</td></tr>
      </table>
      <p>* Un des deux paramètres est requis.</p>
      <h3>Exemple</h3>
      <pre><code>curl "${SITE_URL}/api/v1/stats?region=ile-de-france"</code></pre>
    </div>

    <h2 id="rge">API RGE — Vérification officielle</h2>
    <p>Données synchronisées chaque semaine depuis le répertoire ADEME / annuaire-entreprises RGE officiel.
    Source faisant foi pour les qualifications RGE (Reconnu Garant de l'Environnement) nécessaires à l'éligibilité MaPrimeRénov' et aux CEE.</p>

    <div class="endpoint">
      <p><span class="badge badge-get">GET</span> <span class="endpoint-url">/api/v1/rge/lookup</span></p>
      <p>Vérifie le statut RGE d'une entreprise par SIRET ou SIREN. Retourne la liste des qualifications, leurs organismes et dates de validité.</p>
      <h3>Paramètres</h3>
      <table>
        <tr><th>Param</th><th>Type</th><th>Requis</th><th>Description</th></tr>
        <tr><td><code>siret</code></td><td>string</td><td>Non*</td><td>SIRET 14 chiffres</td></tr>
        <tr><td><code>siren</code></td><td>string</td><td>Non*</td><td>SIREN 9 chiffres</td></tr>
      </table>
      <p>* Un des deux est requis. Le SIRET prime sur le SIREN si les deux sont fournis.</p>
      <h3>Réponse — champ <code>rge_status</code></h3>
      <ul style="margin-left:1.5rem;margin-bottom:1rem;color:#475569;font-size:0.875rem;">
        <li><code>rge_active</code> — qualifications RGE en cours de validité</li>
        <li><code>rge_expired</code> — qualifications expirées (date_fin dépassée)</li>
        <li><code>not_rge</code> — entreprise connue, aucune qualification RGE</li>
        <li><code>not_found</code> — entreprise non référencée dans notre base</li>
      </ul>
      <h3>Exemple</h3>
      <pre><code>curl "${SITE_URL}/api/v1/rge/lookup?siret=83001931100026"</code></pre>
      <pre><code>{
  "identifier": "83001931100026",
  "identifier_type": "siret",
  "found": true,
  "siret": "83001931100026",
  "siren": "830019311",
  "name": "...",
  "address_city": "Lyon",
  "address_postal_code": "69003",
  "specialty": "chauffagiste",
  "rge_status": "rge_active",
  "rge_valid_until": "2027-03-15",
  "rge_organismes": ["Qualit'EnR", "Qualibat"],
  "rge_qualifications": [
    { "code": "QualiPAC", "nom": "Pompe à chaleur", "organisme": "Qualit'EnR", "date_debut": "2024-04-01", "date_fin": "2027-03-31" }
  ],
  "public_url": "${SITE_URL}/services/chauffagiste/lyon/...",
  "source": "ADEME annuaire-entreprises RGE officiel (sync hebdo)"
}</code></pre>
    </div>

    <div class="endpoint">
      <p><span class="badge badge-get">GET</span> <span class="endpoint-url">/api/v1/rge/search</span></p>
      <p>Recherche des artisans RGE actifs (date de fin &gt; aujourd'hui). Jusqu'à 50 résultats par requête, triés par validité décroissante.</p>
      <h3>Paramètres</h3>
      <table>
        <tr><th>Param</th><th>Type</th><th>Requis</th><th>Description</th></tr>
        <tr><td><code>q</code></td><td>string</td><td>Non*</td><td>Recherche partielle dans le nom (max 100 car.)</td></tr>
        <tr><td><code>city</code></td><td>string</td><td>Non*</td><td>Ville — match exact insensible casse</td></tr>
        <tr><td><code>qualification</code></td><td>string</td><td>Non*</td><td>Code RGE (ex: <code>QualiPAC</code>, <code>RGE</code>, <code>Qualibat</code>)</td></tr>
        <tr><td><code>specialty</code></td><td>string</td><td>Non*</td><td>Slug métier (ex: <code>pompe-a-chaleur</code>)</td></tr>
        <tr><td><code>limit</code></td><td>integer</td><td>Non</td><td>1–50, défaut 20</td></tr>
        <tr><td><code>offset</code></td><td>integer</td><td>Non</td><td>Pagination, défaut 0</td></tr>
      </table>
      <p>* Au moins un filtre (<code>q</code>, <code>city</code>, <code>qualification</code> ou <code>specialty</code>) est requis.</p>
      <h3>Exemples</h3>
      <pre><code>curl "${SITE_URL}/api/v1/rge/search?city=lyon&qualification=QualiPAC&limit=20"
curl "${SITE_URL}/api/v1/rge/search?q=RENOV&city=marseille"
curl "${SITE_URL}/api/v1/rge/search?specialty=pompe-a-chaleur&limit=50"</code></pre>
    </div>

    <h2>Cache</h2>
    <p>Les réponses sont mises en cache pendant 1 heure avec un <code>stale-while-revalidate</code> de 24 heures.
    Les données sont agrégées quotidiennement depuis notre base d'artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) synchronisée hebdomadairement avec l'ADEME.</p>

    <h2>Limitations</h2>
    <p>Pas de clé API requise. Rate limit : 60 requêtes/minute par IP. Usage commercial : nous contacter.</p>
    <p>API RGE : max 50 résultats par requête, données rafraîchies chaque semaine depuis la source ADEME.</p>

    <h2>Métiers disponibles</h2>
    <p><code>plombier</code>, <code>electricien</code>, <code>serrurier</code>, <code>chauffagiste</code>,
    <code>peintre-en-batiment</code>, <code>menuisier</code>, <code>carreleur</code>, <code>couvreur</code>,
    <code>macon</code>, <code>jardinier</code>, <code>vitrier</code>, <code>climaticien</code>,
    <code>charpentier</code>, <code>facadier</code>, <code>platrier</code>,
    <code>paysagiste</code>, <code>pompe-a-chaleur</code>, <code>panneaux-solaires</code>,
    <code>isolation-thermique</code>, <code>renovation-energetique</code>, et plus.</p>

    <h2>Contact</h2>
    <p>Questions ? <a href="${SITE_URL}/contact">Contactez-nous</a></p>

    <p style="margin-top: 3rem; font-size: 0.75rem; color: #94a3b8;">
      &copy; ${new Date().getFullYear()} ${SITE_NAME} — Tous droits réservés
    </p>
  </div>
</body>
</html>`

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (error) {
    logger.error('[api/v1/docs] GET failed', error)
    return new Response('Erreur serveur', { status: 500 })
  }
}
