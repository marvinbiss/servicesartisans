'use client'

import { useState } from 'react'
import { Euro, Plus, X } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { TagListField } from './TagListField'
import { useProviderForm } from './useProviderForm'

interface ServicesTarifsSectionProps {
  provider: Record<string, unknown>
  onSaved: (updated: Record<string, unknown>) => void
}

interface ServicePrice {
  name: string
  description: string
  price: string
  duration: string
}

const MAX_SERVICES = 30
const MAX_SERVICE_PRICES = 20

const FIELDS = [
  'services_offered',
  'service_prices',
  'free_quote',
  'hourly_rate_min',
  'hourly_rate_max',
  'payment_methods',
] as const

const PAYMENT_SUGGESTIONS = ['Carte bancaire', 'Virement', 'Chèque', 'Espèces']

export function ServicesTarifsSection({ provider, onSaved }: ServicesTarifsSectionProps) {
  const { formData, setField, isDirty, saving, error, success, handleSave } = useProviderForm(
    provider,
    FIELDS
  )
  const [newService, setNewService] = useState('')

  const onSave = async () => {
    const updated = await handleSave()
    if (updated) onSaved(updated)
  }

  const servicesOffered = (formData.services_offered as string[]) || []
  const servicePrices = (formData.service_prices as ServicePrice[]) || []
  const freeQuote = formData.free_quote !== false
  const hourlyRateMin = formData.hourly_rate_min as number | null
  const hourlyRateMax = formData.hourly_rate_max as number | null
  const paymentMethods = (formData.payment_methods as string[]) || []
  const hourlyRateInvalid =
    hourlyRateMin != null && hourlyRateMax != null && hourlyRateMax < hourlyRateMin

  const setRate = (field: 'hourly_rate_min' | 'hourly_rate_max', raw: string) => {
    if (raw === '') {
      setField(field, null)
      return
    }
    const n = Number(raw)
    if (Number.isFinite(n) && n >= 0) setField(field, n)
  }

  const addService = () => {
    const trimmed = newService.trim()
    if (!trimmed || servicesOffered.length >= MAX_SERVICES) return
    // Case-insensitive duplicate check
    if (servicesOffered.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return
    setField('services_offered', [...servicesOffered, trimmed])
    setNewService('')
  }

  const removeService = (index: number) => {
    setField(
      'services_offered',
      servicesOffered.filter((_, i) => i !== index)
    )
  }

  const addServicePrice = () => {
    if (servicePrices.length >= MAX_SERVICE_PRICES) return
    setField('service_prices', [
      ...servicePrices,
      { name: '', description: '', price: '', duration: '' },
    ])
  }

  const updateServicePrice = (index: number, field: keyof ServicePrice, value: string) => {
    const updated = servicePrices.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setField('service_prices', updated)
  }

  const removeServicePrice = (index: number) => {
    setField(
      'service_prices',
      servicePrices.filter((_, i) => i !== index)
    )
  }

  /** Check if a service price row has empty required fields (name or price) */
  const hasEmptyRequired = (item: ServicePrice): boolean => {
    return item.name.trim() === '' || item.price.trim() === ''
  }

  const servicesAtMax = servicesOffered.length >= MAX_SERVICES
  const pricesAtMax = servicePrices.length >= MAX_SERVICE_PRICES

  return (
    <SectionCard
      title="Services & Tarifs"
      icon={Euro}
      onSave={onSave}
      saving={saving}
      isDirty={isDirty}
      error={error}
      success={success}
    >
      <div className="space-y-8">
        {/* Services offered */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="services-new" className="block text-sm font-medium text-charcoal-700">
              Services proposés
            </label>
            <span className="text-xs text-charcoal-400">
              {servicesOffered.length}/{MAX_SERVICES}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {servicesOffered.map((service, index) => (
              <span
                key={index}
                className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="hover:text-primary-800"
                  aria-label={`Supprimer ${service}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              id="services-new"
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addService()
                }
              }}
              placeholder={servicesAtMax ? 'Limite atteinte' : 'Ajouter un service'}
              maxLength={100}
              disabled={servicesAtMax}
              className="flex-1 px-4 py-2 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 disabled:bg-sand-100 disabled:text-charcoal-400"
            />
            <button
              type="button"
              onClick={addService}
              disabled={servicesAtMax}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              aria-label="Ajouter un service"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {servicesAtMax && (
            <p className="text-xs text-amber-600 mt-1">
              Limite de {MAX_SERVICES} services atteinte.
            </p>
          )}
        </div>

        {/* Service prices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="block text-sm font-medium text-charcoal-700">Grille tarifaire</span>
              <span className="text-xs text-charcoal-400">
                {servicePrices.length}/{MAX_SERVICE_PRICES}
              </span>
            </div>
            <button
              type="button"
              onClick={addServicePrice}
              disabled={pricesAtMax}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {pricesAtMax ? 'Limite atteinte' : 'Ajouter un tarif'}
            </button>
          </div>

          {servicePrices.length === 0 && (
            <p className="text-sm text-charcoal-500 italic bg-sand-50 px-4 py-3 rounded-lg">
              Vos tarifs actuels sont estimés. Ajoutez vos vrais prix pour les remplacer.
            </p>
          )}

          <div className="space-y-4">
            {servicePrices.map((item, index) => {
              const incomplete = hasEmptyRequired(item)
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 relative ${incomplete ? 'border-amber-300 bg-amber-50/30' : 'border-sand-300'}`}
                >
                  <button
                    type="button"
                    onClick={() => removeServicePrice(index)}
                    className="absolute top-3 right-3 text-charcoal-400 hover:text-red-500"
                    aria-label="Supprimer ce tarif"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={`sp-name-${index}`}
                        className="block text-xs text-charcoal-500 mb-1"
                      >
                        Nom de la prestation *
                      </label>
                      <input
                        id={`sp-name-${index}`}
                        type="text"
                        value={item.name}
                        onChange={(e) => updateServicePrice(index, 'name', e.target.value)}
                        maxLength={200}
                        placeholder="Ex: Débouchage canalisation"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm ${
                          item.name.trim() === '' && servicePrices.length > 0
                            ? 'border-amber-300'
                            : 'border-sand-400'
                        }`}
                      />
                      {item.name.trim() === '' && (
                        <p className="text-xs text-amber-600 mt-0.5">Le nom est requis</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor={`sp-price-${index}`}
                        className="block text-xs text-charcoal-500 mb-1"
                      >
                        Prix *
                      </label>
                      <input
                        id={`sp-price-${index}`}
                        type="text"
                        value={item.price}
                        onChange={(e) => updateServicePrice(index, 'price', e.target.value)}
                        maxLength={100}
                        placeholder="Ex: 80 € ou À partir de 50 €"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm ${
                          item.price.trim() === '' && servicePrices.length > 0
                            ? 'border-amber-300'
                            : 'border-sand-400'
                        }`}
                      />
                      {item.price.trim() === '' && (
                        <p className="text-xs text-amber-600 mt-0.5">Le prix est requis</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor={`sp-desc-${index}`}
                        className="block text-xs text-charcoal-500 mb-1"
                      >
                        Description
                      </label>
                      <input
                        id={`sp-desc-${index}`}
                        type="text"
                        value={item.description}
                        onChange={(e) => updateServicePrice(index, 'description', e.target.value)}
                        maxLength={500}
                        placeholder="Détails optionnels"
                        className="w-full px-3 py-2 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`sp-duration-${index}`}
                        className="block text-xs text-charcoal-500 mb-1"
                      >
                        Durée estimée
                      </label>
                      <input
                        id={`sp-duration-${index}`}
                        type="text"
                        value={item.duration}
                        onChange={(e) => updateServicePrice(index, 'duration', e.target.value)}
                        maxLength={50}
                        placeholder="Ex: 1h, 2-3h"
                        className="w-full px-3 py-2 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hourly rate range (mig 306) */}
        <div>
          <span className="block text-sm font-medium text-charcoal-700 mb-2">
            Tarif horaire indicatif
          </span>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label htmlFor="hourly-rate-min" className="block text-xs text-charcoal-500 mb-1">
                Minimum (€/h)
              </label>
              <input
                id="hourly-rate-min"
                type="number"
                min={0}
                max={10000}
                step="0.5"
                value={hourlyRateMin ?? ''}
                onChange={(e) => setRate('hourly_rate_min', e.target.value)}
                placeholder="Ex: 45"
                className="w-full px-3 py-2 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm"
              />
            </div>
            <div>
              <label htmlFor="hourly-rate-max" className="block text-xs text-charcoal-500 mb-1">
                Maximum (€/h)
              </label>
              <input
                id="hourly-rate-max"
                type="number"
                min={0}
                max={10000}
                step="0.5"
                value={hourlyRateMax ?? ''}
                onChange={(e) => setRate('hourly_rate_max', e.target.value)}
                placeholder="Ex: 75"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm ${
                  hourlyRateInvalid ? 'border-amber-400' : 'border-sand-400'
                }`}
              />
            </div>
          </div>
          {hourlyRateInvalid && (
            <p className="text-xs text-amber-600 mt-1">
              Le maximum doit être supérieur ou égal au minimum.
            </p>
          )}
        </div>

        {/* Payment methods (mig 306) */}
        <TagListField
          id="services-payment-methods"
          label="Moyens de paiement acceptés"
          values={paymentMethods}
          max={10}
          maxLength={50}
          placeholder="Ex: Carte bancaire"
          suggestions={PAYMENT_SUGGESTIONS}
          onChange={(values) => setField('payment_methods', values)}
        />

        {/* Free quote toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="services-free-quote" className="text-sm font-medium text-charcoal-700">
            Devis gratuit
          </label>
          <button
            id="services-free-quote"
            type="button"
            role="switch"
            aria-checked={freeQuote}
            onClick={() => setField('free_quote', !freeQuote)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              freeQuote ? 'bg-primary-500' : 'bg-sand-400'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                freeQuote ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </SectionCard>
  )
}
