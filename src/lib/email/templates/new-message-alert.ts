/** Escape HTML special chars to prevent XSS in email templates */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Truncate a string to a given length, adding ellipsis if needed */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '...'
}

/** Email alert to artisan when they receive a new message from a client */
export function getNewMessageAlertEmail(data: {
  recipientName: string
  senderName: string
  messagePreview: string
  conversationUrl: string
}) {
  const { recipientName, senderName, messagePreview, conversationUrl } = data
  const preview = truncate(messagePreview, 200)

  return {
    subject: `Nouveau message de ${senderName.replace(/[<>"]/g, '')} — ServicesArtisans`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 20px; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="font-size: 20px; margin-bottom: 16px;">Nouveau message</h2>

  <p style="color: #555; line-height: 1.6;">
    Bonjour ${htmlEscape(recipientName)},<br><br>
    <strong>${htmlEscape(senderName)}</strong> vous a envoy\u00e9 un message :
  </p>

  <div style="background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0;">
    <p style="margin: 0; color: #333; font-style: italic; line-height: 1.6;">
      "${htmlEscape(preview)}"
    </p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${htmlEscape(conversationUrl)}"
       style="background: #2563eb; color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
      R\u00e9pondre
    </a>
  </div>

  <p style="color: #888; font-size: 13px; line-height: 1.5; text-align: center;">
    R\u00e9pondez rapidement pour maintenir une bonne relation avec vos clients.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    Vous recevez cet email car vous \u00eates inscrit sur ServicesArtisans.<br>
    G\u00e9rez vos notifications dans votre <a href="${htmlEscape(conversationUrl)}" style="color: #999;">espace personnel</a>.
  </p>
</body>
</html>`,
  }
}
