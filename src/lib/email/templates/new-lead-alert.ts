/** Email alert to artisan when they receive a new lead */
export function getNewLeadAlertEmail(data: {
  artisanName: string
  service: string
  city: string
  clientName?: string
  description?: string
  urgency?: string
  dashboardUrl: string
}) {
  const { artisanName, service, city, clientName, description, urgency, dashboardUrl } = data

  return {
    subject: `Nouvelle demande de ${service} à ${city} — Répondez vite !`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 20px; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="font-size: 22px; margin-bottom: 16px;">🔔 Nouvelle demande de devis</h2>

  <p style="color: #555; line-height: 1.6;">
    Bonjour ${artisanName},<br><br>
    ${clientName ? `<strong>${clientName}</strong>` : 'Un client'} recherche un professionnel pour :
  </p>

  <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #888; width: 120px;">Service :</td><td style="font-weight: 600;">${service}</td></tr>
      <tr><td style="padding: 6px 0; color: #888;">Ville :</td><td style="font-weight: 600;">${city}</td></tr>
      ${urgency ? `<tr><td style="padding: 6px 0; color: #888;">Urgence :</td><td style="font-weight: 600; color: ${urgency === 'urgent' ? '#dc2626' : '#555'};">${urgency}</td></tr>` : ''}
      ${description ? `<tr><td style="padding: 6px 0; color: #888; vertical-align: top;">Description :</td><td>${description}</td></tr>` : ''}
    </table>
  </div>

  <div style="background: #fef3c7; border-radius: 10px; padding: 14px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; font-size: 14px; color: #92400e;">
      ⚡ <strong>Les artisans qui répondent en moins de 5 minutes ont 21x plus de chances d'être choisis</strong>
    </p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${dashboardUrl}"
       style="background: #2563eb; color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 18px; display: inline-block;">
      Répondre maintenant
    </a>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
    Vous recevez cet email car vous êtes inscrit sur ServicesArtisans.<br>
    Gérez vos notifications dans votre <a href="${dashboardUrl}" style="color: #999;">espace artisan</a>.
  </p>
</body>
</html>`,
  }
}
