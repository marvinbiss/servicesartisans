/** Escape HTML special chars to prevent XSS in email templates */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Email 3 — 72h after abandon: "Dernière relance" */
export function getAbandonEmail3(data: { service: string; city: string; unsubscribeUrl: string }) {
  const { service, city, unsubscribeUrl } = data

  return {
    subject: `Dernière chance : devis gratuit ${service.replace(/[<>"]/g, '')} à ${city.replace(/[<>"]/g, '')}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 20px; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="font-size: 22px; margin-bottom: 8px;">Dernière relance</h2>

  <p style="color: #555; line-height: 1.6;">
    C'est notre dernier message concernant votre demande de <strong>${htmlEscape(service)}</strong> à <strong>${htmlEscape(city)}</strong>.
    Nous ne vous relancerons plus après cet email.
  </p>

  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="font-weight: 600; margin: 0 0 12px;">💬 Ce que disent nos clients</p>
    <p style="color: #555; margin: 0; line-height: 1.5; font-style: italic;">
      « J'hésitais à demander des devis en ligne. Finalement, j'ai reçu 3 propositions en 24h
      et j'ai économisé 800€ par rapport au premier artisan que j'avais contacté seul. »
    </p>
    <p style="color: #888; margin: 8px 0 0; font-size: 13px;">— Marie, Lyon</p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://www.servicesartisans.fr/devis"
       style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
      Obtenir mes devis gratuits
    </a>
    <p style="color: #888; font-size: 13px; margin-top: 8px;">C'est gratuit, sans engagement, et ça prend 30 secondes.</p>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
    Vous recevez cet email car vous avez commencé une demande de devis sur ServicesArtisans. C'est notre dernier message.<br>
    <a href="${htmlEscape(unsubscribeUrl)}" style="color: #999;">Se désinscrire</a>
  </p>
</body>
</html>`,
  }
}
