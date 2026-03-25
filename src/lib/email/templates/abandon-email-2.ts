/** Escape HTML special chars to prevent XSS in email templates */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Email 2 — 24h after abandon: "Ne passez pas à côté" */
export function getAbandonEmail2(data: { service: string; city: string; unsubscribeUrl: string }) {
  const { service, city, unsubscribeUrl } = data

  return {
    subject: `Votre demande de devis ${service.replace(/[<>"]/g, '')} est toujours en attente`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 20px; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="font-size: 22px; margin-bottom: 8px;">Ne passez pas à côté</h2>

  <p style="color: #555; line-height: 1.6;">
    Des centaines de propriétaires trouvent chaque mois leur artisan de confiance sur ServicesArtisans.
    Votre demande de <strong>${htmlEscape(service)}</strong> à <strong>${htmlEscape(city)}</strong> n'attend que vous.
  </p>

  <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="font-weight: 600; margin: 0 0 8px;">⏰ Les artisans se remplissent vite</p>
    <p style="color: #555; margin: 0; line-height: 1.5;">
      Plus vous attendez, plus les délais d'intervention s'allongent.
      Recevez vos devis maintenant pour comparer et choisir sereinement.
    </p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://www.servicesartisans.fr/devis"
       style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
      Recevoir mes devis gratuits
    </a>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
    Vous recevez cet email car vous avez commencé une demande de devis sur ServicesArtisans.<br>
    <a href="${htmlEscape(unsubscribeUrl)}" style="color: #999;">Se désinscrire</a>
  </p>
</body>
</html>`,
  }
}
