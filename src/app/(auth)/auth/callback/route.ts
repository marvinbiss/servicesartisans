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

      // Check if profile exists — create one if this is a first OAuth sign-in
      const adminClient = createAdminClient()
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        // Extract name from OAuth metadata
        const meta = user.user_metadata
        const fullName =
          meta?.full_name ||
          meta?.name ||
          `${meta?.first_name || ''} ${meta?.last_name || ''}`.trim() ||
          user.email?.split('@')[0] ||
          ''

        await adminClient.from('profiles').insert({
          id: user.id,
          email: (user.email || '').toLowerCase(),
          full_name: fullName,
          role: 'client',
          created_at: new Date().toISOString(),
        })
      }

      // Redirect to appropriate dashboard if no specific next URL
      if (next === '/') {
        const defaultRedirect =
          existingProfile?.role === 'artisan' ? '/espace-artisan' : '/espace-client'
        return NextResponse.redirect(`${origin}${defaultRedirect}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
