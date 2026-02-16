'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProspectionNav } from '@/components/admin/prospection/ProspectionNav'
import { ChannelIcon } from '@/components/admin/prospection/StatsCards'
import { ArrowLeft, ArrowRight, Send, AlertCircle } from 'lucide-react'
import type {
  ProspectionChannel,
  AudienceType,
  ProspectionTemplate,
  ProspectionList,
  AIProvider,
} from '@/types/prospection'

type Step = 1 | 2 | 3 | 4 | 5

export default function CreateCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<ProspectionChannel>('email')
  const [audienceType, setAudienceType] = useState<AudienceType>('artisan')
  const [templateId, setTemplateId] = useState('')
  const [listId, setListId] = useState('')
  const [aiAutoReply, setAiAutoReply] = useState(false)
  const [aiProvider, setAiProvider] = useState<AIProvider>('claude')
  const [scheduledAt, setScheduledAt] = useState('')

  // Loaded data
  const [templates, setTemplates] = useState<ProspectionTemplate[]>([])
  const [lists, setLists] = useState<ProspectionList[]>([])

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [templatesRes, listsRes] = await Promise.all([
        fetch('/api/admin/prospection/templates', { signal }),
        fetch('/api/admin/prospection/lists', { signal }),
      ])
      if (!templatesRes.ok) throw new Error(`Erreur serveur templates (${templatesRes.status})`)
      if (!listsRes.ok) throw new Error(`Erreur serveur listes (${listsRes.status})`)
      const [templatesData, listsData] = await Promise.all([templatesRes.json(), listsRes.json()])
      if (templatesData.success) setTemplates(templatesData.data)
      if (listsData.success) setLists(listsData.data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur de chargement')
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData])

  const filteredTemplates = templates.filter(t =>
    t.channel === channel && (!t.audience_type || t.audience_type === audienceType)
  )

  const selectedList = lists.find(l => l.id === listId)
  const selectedTemplate = templates.find(t => t.id === templateId)

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      setError('Le nom de la campagne est requis')
      return
    }
    if (!templateId) {
      setError('Veuillez sélectionner un modèle')
      return
    }
    if (!listId) {
      setError('Veuillez sélectionner une liste de contacts')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/prospection/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          channel,
          audience_type: audienceType,
          template_id: templateId || undefined,
          list_id: listId || undefined,
          ai_auto_reply: aiAutoReply,
          ai_provider: aiProvider,
          scheduled_at: scheduledAt || undefined,
        }),
      })
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`)
      const data = await res.json()
      if (data.success) {
        router.push(`/admin/prospection/campaigns/${data.data.id}`)
      } else {
        setError(data.error?.message || 'Erreur')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur lors de la création')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/prospection/campaigns" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux campagnes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle campagne</h1>
        <p className="text-gray-500 mt-1">Configurez et lancez votre campagne de prospection</p>
      </div>

      <ProspectionNav />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s === step ? 'bg-primary-600 text-white' : s < step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {s}
            </div>
            {s < 5 && <div className={`w-12 h-0.5 ${s < step ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        {/* Step 1: Canal + Audience */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de la campagne</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prospection artisans Paris"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Canal</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['email', 'sms', 'whatsapp'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 ${channel === ch ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <ChannelIcon channel={ch} className="w-5 h-5" />
                    <span className="font-medium">{ch === 'whatsapp' ? 'WhatsApp' : ch.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Audience</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['artisan', 'client', 'mairie'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAudienceType(type)}
                    className={`p-4 rounded-lg border-2 capitalize font-medium ${audienceType === type ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    {type === 'mairie' ? 'Mairies' : type + 's'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Template */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Choisir un modèle</h3>
            {filteredTemplates.length === 0 ? (
              <p className="text-gray-400 py-4">Aucun modèle disponible pour ce canal. Créez-en un d&apos;abord.</p>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplateId(tmpl.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 ${templateId === tmpl.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="font-medium">{tmpl.name}</div>
                    {tmpl.subject && <div className="text-sm text-gray-500 mt-1">Sujet: {tmpl.subject}</div>}
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{tmpl.body}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Liste */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Choisir une liste de contacts</h3>
            {lists.length === 0 ? (
              <p className="text-gray-400 py-4">Aucune liste de contacts. Créez-en une d&apos;abord.</p>
            ) : (
              <div className="space-y-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setListId(list.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 ${listId === list.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{list.name}</span>
                      <span className="text-sm text-gray-500">{list.contact_count} contacts</span>
                    </div>
                    {list.description && <div className="text-sm text-gray-400 mt-1">{list.description}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Config IA */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Réponses IA automatiques</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiAutoReply}
                onChange={(e) => setAiAutoReply(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
              />
              <div>
                <span className="font-medium">Activer les réponses IA</span>
                <p className="text-sm text-gray-500">L&apos;IA répondra automatiquement aux contacts qui répondent</p>
              </div>
            </label>
            {aiAutoReply && (
              <div>
                <label className="block text-sm font-medium mb-2">Fournisseur IA</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAiProvider('claude')}
                    className={`p-4 rounded-lg border-2 ${aiProvider === 'claude' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                  >
                    <div className="font-medium">Claude (Anthropic)</div>
                    <div className="text-xs text-gray-500 mt-1">Excellent en français</div>
                  </button>
                  <button
                    onClick={() => setAiProvider('openai')}
                    className={`p-4 rounded-lg border-2 ${aiProvider === 'openai' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                  >
                    <div className="font-medium">GPT-4o (OpenAI)</div>
                    <div className="text-xs text-gray-500 mt-1">Rapide et polyvalent</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Résumé */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Résumé de la campagne</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Nom</span><span className="font-medium">{name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Canal</span><span className="font-medium capitalize">{channel}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Audience</span><span className="font-medium capitalize">{audienceType}s</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Modèle</span><span className="font-medium">{selectedTemplate?.name || 'Aucun'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Liste</span><span className="font-medium">{selectedList?.name || 'Aucune'} ({selectedList?.contact_count || 0} contacts)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Réponse IA auto</span><span className="font-medium">{aiAutoReply ? `Oui (${aiProvider})` : 'Non'}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Planification (optionnel)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Laissez vide pour sauvegarder en brouillon</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          {step > 1 ? (
            <button onClick={() => setStep((step - 1) as Step)} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4" /> Précédent
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep((step + 1) as Step)}
              disabled={step === 1 && !name}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={saving || !name}
              className="flex items-center gap-2 px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {saving ? 'Création...' : 'Créer la campagne'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
