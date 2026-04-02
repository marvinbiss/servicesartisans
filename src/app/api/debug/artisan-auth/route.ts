import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const userAgent = request.headers.get('user-agent') ?? 'unknown'

  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Step 1: Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({
        timestamp,
        userAgent,
        step1_auth: {
          userId: null,
          email: null,
          error: authError?.message ?? 'No authenticated user',
        },
        message: 'Auth failed — remaining steps skipped.',
      })
    }

    const userId = authData.user.id
    const email = authData.user.email

    const step1 = { userId, email, error: null }

    // Step 2: Profile with RLS
    const { data: profileRls, error: profileRlsError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', userId)
      .single()

    const step2 = {
      profile: profileRls,
      error: profileRlsError?.message ?? null,
    }

    // Step 3: Profile with admin client (bypass RLS)
    const { data: profileAdmin, error: profileAdminError } = await adminClient
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', userId)
      .single()

    const step3 = {
      profile: profileAdmin,
      error: profileAdminError?.message ?? null,
    }

    // Step 4: Provider with RLS
    const { data: providerRls, error: providerRlsError } = await supabase
      .from('providers')
      .select('id, name, is_active, user_id')
      .eq('user_id', userId)
      .limit(1)

    const step4 = {
      provider: providerRls?.[0] ?? null,
      error: providerRlsError?.message ?? null,
    }

    // Step 5: Provider with admin client
    const { data: providerAdmin, error: providerAdminError } = await adminClient
      .from('providers')
      .select('id, name, is_active, user_id')
      .eq('user_id', userId)
      .limit(1)

    const step5 = {
      provider: providerAdmin?.[0] ?? null,
      error: providerAdminError?.message ?? null,
    }

    // Step 6: Active provider with RLS
    const { data: providerActiveRls, error: providerActiveRlsError } =
      await supabase
        .from('providers')
        .select('id, name, is_active, user_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)

    const step6 = {
      provider: providerActiveRls?.[0] ?? null,
      error: providerActiveRlsError?.message ?? null,
    }

    // Step 7: Exact same SELECT as /api/artisan/stats (to find column errors)
    const { data: providerFull, error: providerFullError } = await supabase
      .from('providers')
      .select('id, stable_id, slug, specialty, address_city, address_postal_code, is_verified, name, description, bio, phone, email, siret, avatar_url, services_offered, service_prices, opening_hours, website')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)

    const step7 = {
      provider: providerFull?.[0] ? { id: providerFull[0].id, name: providerFull[0].name } : null,
      columnCount: providerFull?.[0] ? Object.keys(providerFull[0]).length : 0,
      error: providerFullError?.message ?? null,
      errorCode: providerFullError?.code ?? null,
      errorDetails: providerFullError?.details ?? null,
    }

    // Step 8: RPC call
    let step8: { hasData: boolean; error: string | null }
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_artisan_dashboard_stats',
        { p_artisan_id: userId, p_period: 'month' }
      )
      step8 = {
        hasData: rpcData != null,
        error: rpcError?.message ?? null,
      }
    } catch (rpcCatchError) {
      step8 = {
        hasData: false,
        error:
          rpcCatchError instanceof Error
            ? rpcCatchError.message
            : String(rpcCatchError),
      }
    }

    return NextResponse.json({
      timestamp,
      userAgent,
      step1_auth: step1,
      step2_profile_rls: step2,
      step3_profile_admin: step3,
      step4_provider_rls: step4,
      step5_provider_admin: step5,
      step6_provider_active_rls: step6,
      step7_provider_full_select: step7,
      step8_rpc: step8,
    })
  } catch (err) {
    return NextResponse.json({
      timestamp,
      userAgent,
      fatal_error:
        err instanceof Error ? err.message : String(err),
    })
  }
}
