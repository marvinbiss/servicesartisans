import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getSafeRedirectPath } from '@/lib/safe-redirect'
import { twoFactorAuth } from '@/lib/auth/two-factor'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session?.user) {
      const user = data.session.user

      // Audit V1 P0-1 — Bypass 2FA via OAuth Google (CVSS 8.1).
      // L'utilisateur qui a activé le 2FA pour mot de passe n'aurait pas
      // dû pouvoir se connecter via OAuth sans challenge TOTP. On signOut
      // immédiatement et on redirige vers un écran d'erreur dédié tant que
      // le flow `verify_login` post-OAuth n'est pas implémenté UI-side.
      try {
        if (await twoFactorAuth.isEnabled(user.id)) {
          await supabase.auth.signOut()
          logger.warn('OAuth callback blocked: 2FA enabled, no post-OAuth challenge yet', {
            userId: user.id,
          })
          return NextResponse.redirect(`${origin}/connexion?error=2fa_oauth_unsupported`)
        }
      } catch (twoFaError) {
        // Fail-CLOSE : si le check 2FA throw, on refuse la session OAuth.
        // Mieux pour la sécurité d'avoir un faux positif occasionnel que
        // de laisser passer en silence un user 2FA-enabled.
        await supabase.auth.signOut()
        logger.error('OAuth 2FA isEnabled() failed, fail-closing session', twoFaError)
        return NextResponse.redirect(`${origin}/connexion?error=2fa_check_failed`)
      }

      // Check if profile exists
      const adminClient = createAdminClient()
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()

      // Décision produit 2026-06-05 : plus d'espace particulier. La connexion
      // OAuth est réservée aux comptes artisan/admin existants :
      //  - profil role='client' → session refusée (compte conservé en DB)
      //  - premier sign-in OAuth (pas de profil) → plus de création de compte
      //    particulier ; on refuse et on oriente vers /inscription-artisan.
      if (!existingProfile || existingProfile.role === 'client') {
        await supabase.auth.signOut()
        logger.warn('OAuth callback blocked: espace réservé aux artisans', {
          userId: user.id,
          hadProfile: Boolean(existingProfile),
        })
        return NextResponse.redirect(`${origin}/connexion?error=espace_artisan_uniquement`)
      }

      // Redirect to appropriate dashboard if no specific next URL
      if (next === '/') {
        const defaultRedirect = existingProfile.role === 'artisan' ? '/espace-artisan' : '/admin'
        return NextResponse.redirect(`${origin}${defaultRedirect}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
