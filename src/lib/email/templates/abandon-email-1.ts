/** Escape HTML special chars to prevent XSS in email templates */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Email 1 — 30 min after abandon: "Vos artisans vous attendent" */
export function getAbandonEmail1(data: { service: string; city: string; unsubscribeUrl: string }) {
  const { service, city, unsubscribeUrl } = data

  return {
    subject: `3 artisans disponibles pour votre ${service.replace(/[<>"]/g, '')} à ${city.replace(/[<>"]/g, '')}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 20px; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="font-size: 22px; margin-bottom: 8px;">Vos artisans vous attendent !</h2>

  <p style="color: #555; line-height: 1.6;">
    Vous avez commencé une demande de devis pour <strong>${htmlEscape(service)}</strong> à <strong>${htmlEscape(city)}</strong>,
    mais vous n'êtes pas allé au bout. Pas de souci — vos informations sont sauvegardées.
  </p>

  <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="font-weight: 600; margin: 0 0 12px;">Pourquoi finaliser maintenant ?</p>
    <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 2;">
      <li>✅ <strong>100% gratuit</strong> et sans engagement</li>
      <li>✅ Artisans <strong>vérifiés et assurés</strong></li>
      <li>✅ Réponse <strong>sous 24 heures</strong></li>
    </ul>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://www.servicesartisans.fr/devis"
       style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
      Finaliser ma demande de devis
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
