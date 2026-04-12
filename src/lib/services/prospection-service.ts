/**
 * Prospection Service — Centralized Supabase queries for campaigns, contacts, lists, templates, conversations, analytics, AI settings
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SupabaseParam = SupabaseClient

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function buildPagination(page: number, limit: number, total: number): PaginationResult {
  return { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) }
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export interface ListCampaignsParams extends PaginationParams {
  status?: string
  channel?: string
}

export async function listCampaigns(supabase: SupabaseParam, params: ListCampaignsParams) {
  const { page, limit, status, channel } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('prospection_campaigns')
    .select(
      '*, template:prospection_templates(id,name,channel), list:prospection_lists(id,name,contact_count)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') query = query.eq('status', status)
  if (channel && channel !== 'all') query = query.eq('channel', channel)

  return query
}

export async function createCampaign(
  supabase: SupabaseParam,
  data: Record<string, unknown>,
  createdBy: string
) {
  return supabase
    .from('prospection_campaigns')
    .insert({ ...data, status: data.scheduled_at ? 'scheduled' : 'draft', created_by: createdBy })
    .select()
    .single()
}

export async function getCampaignById(supabase: SupabaseParam, id: string) {
  return supabase
    .from('prospection_campaigns')
    .select(
      'id, name, description, channel, audience_type, status, template_id, list_id, scheduled_at, started_at, completed_at, batch_size, ai_auto_reply, ai_provider, total_recipients, sent_count, delivered_count, replied_count, failed_count, estimated_cost, actual_cost, created_at, template:prospection_templates(id, name, channel), list:prospection_lists(id, name, contact_count)'
    )
    .eq('id', id)
    .single()
}

export async function updateCampaign(
  supabase: SupabaseParam,
  id: string,
  data: Record<string, unknown>
) {
  return supabase.from('prospection_campaigns').update(data).eq('id', id).select().single()
}

export async function getCampaignStatus(supabase: SupabaseParam, id: string) {
  return supabase.from('prospection_campaigns').select('id, status').eq('id', id).single()
}

export async function deleteCampaign(supabase: SupabaseParam, id: string) {
  return supabase.from('prospection_campaigns').delete().eq('id', id)
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export interface ListContactsParams extends PaginationParams {
  type?: string
  search?: string
  department?: string
  tags?: string
  consent?: string
}

export async function listContacts(supabase: SupabaseParam, params: ListContactsParams) {
  const { page, limit, type, search, department, tags, consent } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('prospection_contacts')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type && type !== 'all') query = query.eq('contact_type', type)
  if (department) query = query.eq('department', department)
  if (consent && consent !== 'all') query = query.eq('consent_status', consent)
  if (tags) query = query.overlaps('tags', tags.split(','))
  if (search) {
    const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
    query = query.or(
      `contact_name.ilike.%${escaped}%,company_name.ilike.%${escaped}%,email.ilike.%${escaped}%,city.ilike.%${escaped}%`
    )
  }

  return query
}

export async function createContact(supabase: SupabaseParam, data: Record<string, unknown>) {
  return supabase
    .from('prospection_contacts')
    .insert({ ...data, source: 'manual' })
    .select()
    .single()
}

export async function getContactById(supabase: SupabaseParam, id: string) {
  return supabase
    .from('prospection_contacts')
    .select(
      'id, contact_type, company_name, contact_name, email, email_canonical, phone, phone_e164, address, postal_code, city, department, region, commune_code, population, artisan_id, source, source_file, source_row, tags, custom_fields, consent_status, opted_out_at, is_active, created_at, updated_at'
    )
    .eq('id', id)
    .single()
}

export async function updateContact(
  supabase: SupabaseParam,
  id: string,
  data: Record<string, unknown>
) {
  return supabase.from('prospection_contacts').update(data).eq('id', id).select().single()
}

export async function softDeleteContact(supabase: SupabaseParam, id: string) {
  return supabase.from('prospection_contacts').update({ is_active: false }).eq('id', id)
}

export async function gdprEraseContact(supabase: SupabaseParam, contactId: string) {
  return supabase.rpc('prospection_gdpr_erase', { p_contact_id: contactId })
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export async function listLists(supabase: SupabaseParam, params: PaginationParams) {
  const { page, limit } = params
  const offset = (page - 1) * limit

  return supabase
    .from('prospection_lists')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
}

export async function createList(
  supabase: SupabaseParam,
  data: Record<string, unknown>,
  createdBy: string
) {
  return supabase
    .from('prospection_lists')
    .insert({ ...data, created_by: createdBy })
    .select()
    .single()
}

export async function getListById(supabase: SupabaseParam, id: string) {
  return supabase
    .from('prospection_lists')
    .select(
      'id, name, description, list_type, filter_criteria, contact_count, created_by, created_at, updated_at'
    )
    .eq('id', id)
    .single()
}

export async function updateList(
  supabase: SupabaseParam,
  id: string,
  data: Record<string, unknown>
) {
  return supabase.from('prospection_lists').update(data).eq('id', id).select().single()
}

export async function deleteList(supabase: SupabaseParam, id: string) {
  return supabase.from('prospection_lists').delete().eq('id', id)
}

// ---------------------------------------------------------------------------
// List Members
// ---------------------------------------------------------------------------

export async function listMembers(
  supabase: SupabaseParam,
  listId: string,
  params: PaginationParams
) {
  const { page, limit } = params
  const offset = (page - 1) * limit

  return supabase
    .from('prospection_list_members')
    .select('*, contact:prospection_contacts(*)', { count: 'exact' })
    .eq('list_id', listId)
    .order('added_at', { ascending: false })
    .range(offset, offset + limit - 1)
}

export async function addMembers(supabase: SupabaseParam, listId: string, contactIds: string[]) {
  const members = contactIds.map((contact_id) => ({ list_id: listId, contact_id }))
  return supabase
    .from('prospection_list_members')
    .upsert(members, { onConflict: 'list_id,contact_id' })
}

export async function removeMembers(supabase: SupabaseParam, listId: string, contactIds: string[]) {
  return supabase
    .from('prospection_list_members')
    .delete()
    .eq('list_id', listId)
    .in('contact_id', contactIds)
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface ListTemplatesParams extends PaginationParams {
  channel?: string | null
  audienceType?: string | null
}

export async function listTemplates(supabase: SupabaseParam, params: ListTemplatesParams) {
  const { page, limit, channel, audienceType } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('prospection_templates')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (channel) query = query.eq('channel', channel)
  if (audienceType) query = query.eq('audience_type', audienceType)

  query = query.range(offset, offset + limit - 1)

  return query
}

export async function createTemplate(
  supabase: SupabaseParam,
  data: Record<string, unknown>,
  createdBy: string
) {
  return supabase
    .from('prospection_templates')
    .insert({ ...data, created_by: createdBy })
    .select()
    .single()
}

export async function getTemplateById(supabase: SupabaseParam, id: string) {
  return supabase
    .from('prospection_templates')
    .select(
      'id, name, channel, audience_type, subject, body, html_body, whatsapp_template_name, whatsapp_template_sid, whatsapp_approved, ai_system_prompt, ai_context, variables, is_active, created_by, created_at, updated_at'
    )
    .eq('id', id)
    .single()
}

export async function updateTemplate(
  supabase: SupabaseParam,
  id: string,
  data: Record<string, unknown>
) {
  return supabase.from('prospection_templates').update(data).eq('id', id).select().single()
}

export async function softDeleteTemplate(supabase: SupabaseParam, id: string) {
  return supabase.from('prospection_templates').update({ is_active: false }).eq('id', id)
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export interface ListConversationsParams extends PaginationParams {
  status?: string
  channel?: string
}

export async function listConversations(supabase: SupabaseParam, params: ListConversationsParams) {
  const { page, limit, status, channel } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('prospection_conversations')
    .select(
      '*, contact:prospection_contacts(id,contact_name,company_name,email,phone,contact_type)',
      { count: 'exact' }
    )
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') query = query.eq('status', status)
  if (channel && channel !== 'all') query = query.eq('channel', channel)

  return query
}

export async function getConversationWithMessages(supabase: SupabaseParam, id: string) {
  const { data: conversation, error: convError } = await supabase
    .from('prospection_conversations')
    .select(
      'id, campaign_id, contact_id, channel, status, ai_provider, ai_replies_count, assigned_to, last_message_at, created_at, contact:prospection_contacts(id, contact_name, company_name, email, phone, contact_type, city), campaign:prospection_campaigns(id, name, channel)'
    )
    .eq('id', id)
    .single()

  if (convError || !conversation) {
    return { conversation: null, messages: [], error: convError }
  }

  const { data: messages, error: msgError } = await supabase
    .from('prospection_conversation_messages')
    .select(
      'id, direction, sender_type, content, ai_provider, ai_model, ai_prompt_tokens, ai_completion_tokens, created_at'
    )
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  return { conversation, messages: messages || [], error: msgError }
}

export async function updateConversation(
  supabase: SupabaseParam,
  id: string,
  data: Record<string, unknown>
) {
  return supabase.from('prospection_conversations').update(data).eq('id', id).select().single()
}

export async function getConversationWithContact(supabase: SupabaseParam, id: string) {
  return supabase
    .from('prospection_conversations')
    .select('*, contact:prospection_contacts(*)')
    .eq('id', id)
    .single()
}

export async function insertConversationMessage(
  supabase: SupabaseParam,
  data: {
    conversation_id: string
    direction: string
    sender_type: string
    content: string
    external_id?: string
  }
) {
  return supabase.from('prospection_conversation_messages').insert(data).select().single()
}

export async function updateConversationLastMessage(supabase: SupabaseParam, id: string) {
  return supabase
    .from('prospection_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', id)
}

// ---------------------------------------------------------------------------
// AI Settings
// ---------------------------------------------------------------------------

export async function getAiSettings(supabase: SupabaseParam) {
  return supabase
    .from('prospection_ai_settings')
    .select(
      'id, default_provider, claude_model, claude_api_key_set, claude_max_tokens, claude_temperature, openai_model, openai_api_key_set, openai_max_tokens, openai_temperature, auto_reply_enabled, max_auto_replies, escalation_keywords, artisan_system_prompt, client_system_prompt, mairie_system_prompt, updated_by, updated_at'
    )
    .limit(1)
    .single()
}

export async function getAiSettingsId(supabase: SupabaseParam) {
  return supabase.from('prospection_ai_settings').select('id').limit(1).single()
}

export async function updateAiSettings(
  supabase: SupabaseParam,
  id: string,
  data: Record<string, unknown>,
  updatedBy: string
) {
  return supabase
    .from('prospection_ai_settings')
    .update({ ...data, updated_by: updatedBy })
    .eq('id', id)
    .select()
    .single()
}
