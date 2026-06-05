'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DefinirMotDePassePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const tokenFromQuery = searchParams.get('token')
  const codeFromQuery = searchParams.get('code')

  // On mount: check session, parse hash fragment, exchange code, or verify OTP token
  useEffect(() => {
    const init = async () => {
      // 0. Handle PKCE code parameter (from /auth/callback or direct Supabase redirect)
      if (codeFromQuery) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.exchangeCodeForSession(codeFromQuery)
        if (!sessionError && sessionData.user) {
          setUserEmail(sessionData.user.email || null)
          // Clean the URL to remove the code
          window.history.replaceState(null, '', window.location.pathname)
          setChecking(false)
          return
        }
        // Code exchange failed — token may be expired
        setTokenExpired(true)
        setChecking(false)
        return
      }

      // 1. Check if Supabase sent tokens in the hash fragment
      //    (resetPasswordForEmail redirects with #access_token=...&type=recovery)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && type === 'recovery') {
          // Set the session from the hash tokens
          if (refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (!sessionError && sessionData.user) {
              setUserEmail(sessionData.user.email || null)
              // Clear hash from URL to avoid token leakage
              window.history.replaceState(null, '', window.location.pathname)
              setChecking(false)
              return
            }
          }

          // Fallback: try verifyOtp with the access_token as token_hash
          const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: 'recovery',
          })

          if (!verifyError && verifyData.user) {
            setUserEmail(verifyData.user.email || null)
            window.history.replaceState(null, '', window.location.pathname)
            setChecking(false)
            return
          }

          setTokenExpired(true)
          setChecking(false)
          return
        }
      }

      // 2. Check for existing session (user already authenticated)
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        setUserEmail(userData.user.email || null)
        setChecking(false)
        return
      }

      // 3. Check for token in query params (from admin claim flow / setup-password)
      if (tokenFromQuery) {
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenFromQuery,
          type: 'recovery',
        })

        if (verifyError) {
          setTokenExpired(true)
          setChecking(false)
          return
        }

        if (verifyData.user) {
          setUserEmail(verifyData.user.email || null)
          setChecking(false)
          return
        }
      }

      // No session and no token (or token produced no user) — redirect to login
      router.push('/connexion')
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-400',
    'bg-green-600',
  ]

  const isValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setError(null)
    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message || 'Erreur lors de la mise à jour du mot de passe')
        return
      }

      // Re-authenticate with the new password to ensure a clean session
      if (userEmail) {
        await supabase.auth.signInWithPassword({ email: userEmail, password })
      }

      // Determine redirect based on user role.
      // Espace particulier fermé 2026-06-05 : fallback = espace artisan.
      let redirectPath = '/espace-artisan'
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single()
        if (profile?.role === 'artisan') {
          redirectPath = '/espace-artisan'
          setUserRole('artisan')
        } else {
          setUserRole('client')
        }
      }

      setSuccess(true)
      setTimeout(() => router.push(redirectPath), 2000)
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (tokenExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-charcoal-900 mb-2">Lien expiré ou invalide</h1>
          <p className="text-charcoal-600 mb-6">
            Ce lien a expiré ou a déjà été utilisé. Vous pouvez demander un nouveau lien via la page
            de réinitialisation de mot de passe.
          </p>
          <a
            href="/mot-de-passe-oublie"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30"
          >
            Mot de passe oublié
          </a>
          <p className="mt-4 text-xs text-charcoal-400">
            Ou contactez-nous à{' '}
            <a href="mailto:support@servicesartisans.fr" className="text-amber-600 underline">
              support@servicesartisans.fr
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900 mb-4">Mot de passe défini !</h1>
          <p className="text-charcoal-600 mb-4">
            Votre compte est prêt. Redirection vers votre espace
            {userRole === 'artisan' ? ' artisan' : ''}...
          </p>
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Définissez votre mot de passe</h1>
          <p className="text-charcoal-400">
            Votre fiche artisan a été validée. Choisissez un mot de passe pour accéder à votre
            espace.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-sand-500 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white placeholder-charcoal-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="8 caractères minimum"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-sand-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-charcoal-700'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-charcoal-500">
                  Force :{' '}
                  {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Très faible'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-500 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white placeholder-charcoal-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Confirmez votre mot de passe"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-400">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/30"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Valider et accéder à mon espace'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
