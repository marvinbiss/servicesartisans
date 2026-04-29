import Link from 'next/link'
import { getQuartiersByVille } from '@/lib/data/france'
import type { LocationContent } from '@/lib/seo/location-content'
import type { CommuneData } from '@/lib/data/commune-data'
import { formatNumber, formatEuro } from '@/lib/data/commune-data'
import type { Service, Location as LocationType } from '@/types'
import type { TradeContent } from '@/lib/data/trade-content'
import PriceTableHTML from '@/components/seo/PriceTableHTML'
import StructuredPricingTable from '@/components/seo/StructuredPricingTable'

interface Props {
  locationContent: LocationContent | null
  communeData: CommuneData | null
  service: Service
  location: LocationType
  locationSlug: string
  providerCount: number
  trade: TradeContent | null
  pricingMultiplier: number
}

export default function SeoContent({
  locationContent,
  communeData,
  service,
  location,
  locationSlug,
  providerCount,
  trade,
  pricingMultiplier,
}: Props) {
  return (
    <>
      {/* Location content (present) */}
      {locationContent && (
        <section className="py-12 bg-sand-50 border-t border-sand-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-8">
              <div className="prose prose-gray max-w-none">
                <h2 className="font-heading border-l-4 border-primary-400 pl-4 !mt-0 text-charcoal-900">
                  Trouver un {service.name.toLowerCase()} à {location.name}
                </h2>
                <p>{locationContent.introText}</p>

                <h3 className="font-heading text-charcoal-800" id="tarifs">
                  Tarifs et prix d'un {service.name.toLowerCase()} à {location.name}
                </h3>
                <p>{locationContent.pricingNote}</p>
                {/* Tarifs intégrés (avant 2026-04-29 cette grille vivait sur
                    /tarifs/[s]/[v] désormais 301 vers cette page — V1 #3 stratégie 140K) */}
                {trade && (
                  <div className="not-prose mt-6 space-y-6">
                    <PriceTableHTML
                      tasks={trade.commonTasks}
                      serviceName={trade.name}
                      serviceSlug={service.slug}
                      location={location.name}
                      locationSlug={locationSlug}
                      multiplier={pricingMultiplier}
                      unit={trade.priceRange.unit}
                    />
                    <StructuredPricingTable
                      serviceSlug={service.slug}
                      serviceName={trade.name}
                      villeName={location.name}
                      villeSlug={locationSlug}
                      tasks={trade.commonTasks}
                      multiplier={pricingMultiplier}
                      unit="€"
                    />
                  </div>
                )}

                <h3 className="font-heading text-charcoal-800">
                  Conseils pour vos travaux à {location.name}
                </h3>
                <ul>
                  {locationContent.localTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>

                <h3 className="font-heading text-charcoal-800">
                  Contexte local : {locationContent.climateLabel}
                </h3>
                <p>{locationContent.climateTip}</p>

                <h3 className="font-heading text-charcoal-800">
                  Zones d'intervention à {location.name}
                </h3>
                <p>{locationContent.quartierText}</p>
                {getQuartiersByVille(locationSlug).length > 0 && (
                  <div className="not-prose flex flex-wrap gap-2 mt-4">
                    {getQuartiersByVille(locationSlug)
                      .slice(0, 10)
                      .map(({ name, slug }) => (
                        <Link
                          key={slug}
                          href={`/villes/${locationSlug}/${slug}`}
                          className="text-sm bg-sand-100 text-primary-600 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          {name}
                        </Link>
                      ))}
                  </div>
                )}

                <p>
                  {locationContent.conclusion} Pour démarrer votre projet,{' '}
                  <Link
                    href={`/services/${service.slug}/${locationSlug}`}
                    className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
                  >
                    demandez un devis gratuit {service.name.toLowerCase()} à {location.name}
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fallback when no locationContent */}
      {!locationContent && (
        <section className="py-12 bg-sand-50 border-t border-sand-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-8">
              <div className="prose prose-gray max-w-none">
                <h2 className="font-heading border-l-4 border-primary-400 pl-4 !mt-0 text-charcoal-900">
                  Trouver un {service.name.toLowerCase()} à {location.name}
                </h2>
                <p>
                  Vous recherchez un {service.name.toLowerCase()} à {location.name} (
                  {location.postal_code}) ? ServicesArtisans vous propose une sélection de{' '}
                  {providerCount} professionnels qualifiés dans votre ville.
                  {location.department_name &&
                    ` Notre annuaire couvre l'ensemble du département ${location.department_name} (${location.department_code}).`}
                </p>
                {trade && (
                  <>
                    <h3>Tarifs indicatifs à {location.name}</h3>
                    <p>
                      Le tarif horaire moyen d'un {service.name.toLowerCase()} à {location.name} se
                      situe entre{' '}
                      <strong>
                        {Math.round(trade.priceRange.min * pricingMultiplier)} et{' '}
                        {Math.round(trade.priceRange.max * pricingMultiplier)}{' '}
                        {trade.priceRange.unit}
                      </strong>
                      . Les prix varient selon la complexité des travaux et le professionnel choisi.{' '}
                      Voir le{' '}
                      <a
                        href="#tarifs"
                        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
                      >
                        détail par prestation
                      </a>{' '}
                      ci-dessus.
                    </p>
                    {trade.certifications && trade.certifications.length > 0 && (
                      <>
                        <h3>Certifications à vérifier</h3>
                        <p>
                          Avant de choisir un {service.name.toLowerCase()}, vérifiez qu'il dispose
                          des certifications suivantes :{' '}
                          {trade.certifications.slice(0, 3).join(', ')}.
                        </p>
                      </>
                    )}
                    <p>
                      Pour obtenir un chiffrage précis,{' '}
                      <Link
                        href={`/services/${service.slug}/${locationSlug}`}
                        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
                      >
                        demandez un devis gratuit {service.name.toLowerCase()} à {location.name}
                      </Link>{' '}
                      directement auprès d'artisans vérifiés.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Data-driven sections */}
      {locationContent?.dataDriven && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {locationContent.dataDriven.socioEconomic && (
              <div className="bg-gradient-to-br from-sand-50 to-clay-50/30 rounded-2xl border border-charcoal-100 p-8">
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-primary-400 pl-4">
                  Contexte socio-économique de {location.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {locationContent.dataDriven.socioEconomic}
                </p>
                {communeData && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {communeData.revenu_median && (
                      <div className="text-center p-3 bg-white rounded-xl border border-charcoal-100">
                        <div className="text-lg font-bold text-primary-600">
                          {formatEuro(communeData.revenu_median)}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Revenu médian/an</div>
                      </div>
                    )}
                    {communeData.nb_logements && (
                      <div className="text-center p-3 bg-white rounded-xl border border-charcoal-100">
                        <div className="text-lg font-bold text-primary-600">
                          {formatNumber(communeData.nb_logements)}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Logements</div>
                      </div>
                    )}
                    {communeData.part_maisons_pct !== null &&
                      communeData.part_maisons_pct !== undefined && (
                        <div className="text-center p-3 bg-white rounded-xl border border-charcoal-100">
                          <div className="text-lg font-bold text-primary-600">
                            {communeData.part_maisons_pct}%
                          </div>
                          <div className="text-xs text-charcoal-500 mt-1">
                            Maisons individuelles
                          </div>
                        </div>
                      )}
                    {communeData.densite_population && (
                      <div className="text-center p-3 bg-white rounded-xl border border-charcoal-100">
                        <div className="text-lg font-bold text-primary-600">
                          {formatNumber(Math.round(communeData.densite_population))}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Hab./km²</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {locationContent.dataDriven.immobilier && (
              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-100 p-8">
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-amber-500 pl-4">
                  Marché immobilier à {location.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {locationContent.dataDriven.immobilier}
                </p>
                {communeData && (communeData.prix_m2_moyen || communeData.prix_m2_maison) && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {communeData.prix_m2_moyen && (
                      <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                        <div className="text-lg font-bold text-amber-700">
                          {formatEuro(communeData.prix_m2_moyen)}/m²
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Prix moyen</div>
                      </div>
                    )}
                    {communeData.prix_m2_maison && (
                      <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                        <div className="text-lg font-bold text-amber-700">
                          {formatEuro(communeData.prix_m2_maison)}/m²
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Maisons</div>
                      </div>
                    )}
                    {communeData.prix_m2_appartement && (
                      <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                        <div className="text-lg font-bold text-amber-700">
                          {formatEuro(communeData.prix_m2_appartement)}/m²
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Appartements</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {locationContent.dataDriven.marcheArtisanal && (
              <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-2xl border border-emerald-100 p-8">
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-emerald-500 pl-4">
                  Marché artisanal à {location.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {locationContent.dataDriven.marcheArtisanal}
                </p>
                {communeData && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {communeData.nb_entreprises_artisanales && (
                      <div className="text-center p-3 bg-white rounded-xl border border-emerald-100">
                        <div className="text-lg font-bold text-emerald-700">
                          {formatNumber(communeData.nb_entreprises_artisanales)}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">
                          Entreprises artisanales
                        </div>
                      </div>
                    )}
                    {communeData.nb_artisans_btp && (
                      <div className="text-center p-3 bg-white rounded-xl border border-emerald-100">
                        <div className="text-lg font-bold text-emerald-700">
                          {formatNumber(communeData.nb_artisans_btp)}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Entreprises BTP</div>
                      </div>
                    )}
                    {communeData.nb_artisans_rge != null && communeData.nb_artisans_rge > 0 && (
                      <div className="text-center p-3 bg-white rounded-xl border border-emerald-100">
                        <div className="text-lg font-bold text-emerald-700">
                          {formatNumber(communeData.nb_artisans_rge)}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Certifiés RGE</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {locationContent.dataDriven.energetique && (
              <div className="bg-gradient-to-br from-orange-50/50 to-red-50/30 rounded-2xl border border-orange-100 p-8">
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-orange-500 pl-4">
                  Performance énergétique à {location.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {locationContent.dataDriven.energetique}
                </p>
                {communeData &&
                  (communeData.pct_passoires_dpe !== null ||
                    communeData.nb_maprimerenov_annuel) && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {communeData.pct_passoires_dpe !== null &&
                        communeData.pct_passoires_dpe !== undefined && (
                          <div className="text-center p-3 bg-white rounded-xl border border-orange-100">
                            <div className="text-lg font-bold text-orange-700">
                              {communeData.pct_passoires_dpe}%
                            </div>
                            <div className="text-xs text-charcoal-500 mt-1">
                              Passoires thermiques (F/G)
                            </div>
                          </div>
                        )}
                      {communeData.nb_dpe_total && (
                        <div className="text-center p-3 bg-white rounded-xl border border-orange-100">
                          <div className="text-lg font-bold text-orange-700">
                            {formatNumber(communeData.nb_dpe_total)}
                          </div>
                          <div className="text-xs text-charcoal-500 mt-1">DPE réalisés</div>
                        </div>
                      )}
                      {communeData.nb_maprimerenov_annuel && (
                        <div className="text-center p-3 bg-white rounded-xl border border-orange-100">
                          <div className="text-lg font-bold text-orange-700">
                            {formatNumber(communeData.nb_maprimerenov_annuel)}
                          </div>
                          <div className="text-xs text-charcoal-500 mt-1">
                            Dossiers MaPrimeRénov'/an
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}

            {locationContent.dataDriven.climatData && (
              <div className="bg-gradient-to-br from-sky-50/50 to-cyan-50/30 rounded-2xl border border-sky-100 p-8">
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-sky-500 pl-4">
                  Climat et saisonnalité à {location.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {locationContent.dataDriven.climatData}
                </p>
                {communeData &&
                  (communeData.jours_gel_annuels !== null ||
                    communeData.precipitation_annuelle !== null) && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {communeData.jours_gel_annuels !== null && (
                        <div className="text-center p-3 bg-white rounded-xl border border-sky-100">
                          <div className="text-lg font-bold text-sky-700">
                            {communeData.jours_gel_annuels}
                          </div>
                          <div className="text-xs text-charcoal-500 mt-1">Jours de gel/an</div>
                        </div>
                      )}
                      {communeData.precipitation_annuelle !== null && (
                        <div className="text-center p-3 bg-white rounded-xl border border-sky-100">
                          <div className="text-lg font-bold text-sky-700">
                            {formatNumber(communeData.precipitation_annuelle)} mm
                          </div>
                          <div className="text-xs text-charcoal-500 mt-1">Précipitations/an</div>
                        </div>
                      )}
                      {communeData.temperature_moyenne_hiver !== null && (
                        <div className="text-center p-3 bg-white rounded-xl border border-sky-100">
                          <div className="text-lg font-bold text-sky-700">
                            {communeData.temperature_moyenne_hiver?.toFixed(1)} °C
                          </div>
                          <div className="text-xs text-charcoal-500 mt-1">Moy. hiver</div>
                        </div>
                      )}
                      {communeData.temperature_moyenne_ete !== null && (
                        <div className="text-center p-3 bg-white rounded-xl border border-sky-100">
                          <div className="text-lg font-bold text-sky-700">
                            {communeData.temperature_moyenne_ete?.toFixed(1)} °C
                          </div>
                          <div className="text-xs text-charcoal-500 mt-1">Moy. été</div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}

            {locationContent.dataDriven.demandeLocale && (
              <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/30 rounded-2xl border border-violet-100 p-8">
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-violet-500 pl-4">
                  Demande locale en {service.name.toLowerCase()} à {location.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {locationContent.dataDriven.demandeLocale}
                </p>
              </div>
            )}

            {locationContent.dataDriven.reglementation && (
              <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/30 rounded-2xl border border-rose-100 p-8">
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-rose-500 pl-4">
                  Réglementation et normes — {service.name.toLowerCase()} à {location.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {locationContent.dataDriven.reglementation}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
