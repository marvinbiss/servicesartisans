/**
 * Admin Leads API
 * GET: Lead counts + active artisans for a city x metier
 * Uses service_role (bypasses RLS)
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { sanitizeSearchQuery } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify admin with services:read permission
    const auth = await requirePermission('services', 'read')
    if (!auth.success || !auth.admin) return auth.error!

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const cityRaw = searchParams.get('city') || null
    const serviceRaw = searchParams.get('service') || null

    // Sanitize search inputs to prevent ILIKE injection
    const city = cityRaw ? sanitizeSearchQuery(cityRaw) : null
    const service = serviceRaw ? sanitizeSearchQuery(serviceRaw) : null

    // 1. Count leads created (optionally filtered by city/service)
    let leadsQuery = supabase
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })

    if (city) leadsQuery = leadsQuery.ilike('city', `%${city}%`)
    if (service) leadsQuery = leadsQuery.ilike('service_name', `%${service}%`)

    const { count: leadsCreated } = await leadsQuery

    // 2. Count leads assigned (via lead_assignments)
    // Join with devis_requests to filter by city/service
    let assignedQuery = supabase
      .from('lead_assignments')
      .select('id, lead:devis_requests!inner(city, service_name)', { count: 'exact', head: true })

    if (city) assignedQuery = assignedQuery.ilike('lead.city', `%${city}%`)
    if (service) assignedQuery = assignedQuery.ilike('lead.service_name', `%${service}%`)

    const { count: leadsAssigned } = await assignedQuery

    // 3. Active artisans list (optionally filtered by city/service)
    let artisansQuery = supabase
      .from('providers')
      .select('id, stable_id, name, slug, specialty, address_city, is_verified, last_lead_assigned_at')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(100)

    if (city) artisansQuery = artisansQuery.ilike('address_city', `%${city}%`)
    if (service) artisansQuery = artisansQuery.ilike('specialty', `%${service}%`)

    const { data: artisans, error: artisansError } = await artisansQuery

    if (artisansError) {
      console.error('Admin leads artisans error:', artisansError)
    }

    return NextResponse.json({
      leadsCreated: leadsCreated || 0,
      leadsAssigned: leadsAssigned || 0,
      artisans: artisans || [],
      artisanCount: artisans?.length || 0,
      filters: { city, service },
    })
  } catch (error) {
    console.error('Admin leads GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
