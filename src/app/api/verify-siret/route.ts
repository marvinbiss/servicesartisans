import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// ─── Rate limiting (in-memory, per IP) ─────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  if (entry.count > RATE_LIMIT_MAX) {
    return true
  }
  return false
}

// Clean up stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    const keys = Array.from(rateLimitMap.keys())
    keys.forEach((key) => {
      const value = rateLimitMap.get(key)
      if (value && now > value.resetAt) {
        rateLimitMap.delete(key)
      }
    })
  }, 300_000)
}

// ─── Luhn checksum for SIRET ────────────────────────────────────────
function validateSiretLuhn(siret: string): boolean {
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i], 10)
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

// ─── Forme juridique mapping ────────────────────────────────────────
const FORMES_JURIDIQUES: Record<string, string> = {
  "1000": "Entrepreneur individuel",
  "5410": "SARL",
  "5499": "SARL unipersonnelle (EURL)",
  "5498": "SARL unipersonnelle",
  "5505": "SA",
  "5510": "SA",
  "5710": "SAS",
  "5720": "SASU",
  "6540": "Micro-entreprise",
  "5485": "Societe europeenne",
}

function getFormeJuridique(code: string | undefined | null): string {
  if (!code) return "Non renseigne"
  return FORMES_JURIDIQUES[code] || `Code ${code}`
}

// ─── Tranche effectifs mapping ──────────────────────────────────────
const TRANCHES_EFFECTIFS: Record<string, string> = {
  "NN": "Non renseigne",
  "00": "0 salarie",
  "01": "1 ou 2 salaries",
  "02": "3 a 5 salaries",
  "03": "6 a 9 salaries",
  "11": "10 a 19 salaries",
  "12": "20 a 49 salaries",
  "21": "50 a 99 salaries",
  "22": "100 a 199 salaries",
  "31": "200 a 249 salaries",
  "32": "250 a 499 salaries",
  "41": "500 a 999 salaries",
  "42": "1 000 a 1 999 salaries",
  "51": "2 000 a 4 999 salaries",
  "52": "5 000 a 9 999 salaries",
  "53": "10 000 salaries et plus",
}

function getTrancheEffectifs(code: string | undefined | null): string {
  if (!code) return "Non renseigne"
  return TRANCHES_EFFECTIFS[code] || "Non renseigne"
}

// ─── SIREN lookup helpers ────────────────────────────────────────────

function formatSirenResult(
  siren: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unite: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  etab: any,
  source: "insee" | "gouv"
) {
  if (source === "insee") {
    const adresse = etab.adresseEtablissement
    const isActive =
      etab.periodesEtablissement?.[0]?.etatAdministratifEtablissement === "A"
    return {
      found: true,
      siret: etab.siret || `${siren}${etab.nicSiegeUniteLegale || "00001"}`,
      siren,
      denomination:
        unite.denominationUniteLegale ||
        `${unite.prenomUsuelUniteLegale || ""} ${unite.nomUniteLegale || ""}`.trim() ||
        "Non renseigne",
      formeJuridique: getFormeJuridique(unite.categorieJuridiqueUniteLegale),
      dateCreation: unite.dateCreationUniteLegale || "",
      activitePrincipale:
        etab.periodesEtablissement?.[0]?.activitePrincipaleEtablissement || "",
      libelleActivite: "",
      adresse: adresse
        ? {
            numero: adresse.numeroVoieEtablissement || "",
            voie: `${adresse.typeVoieEtablissement || ""} ${adresse.libelleVoieEtablissement || ""}`.trim(),
            codePostal: adresse.codePostalEtablissement || "",
            commune: adresse.libelleCommuneEtablissement || "",
            departement: adresse.codePostalEtablissement?.substring(0, 2) || "",
          }
        : undefined,
      etatAdministratif: isActive ? "Active" : "Fermee",
      isActive,
      trancheEffectifs: getTrancheEffectifs(unite.trancheEffectifsUniteLegale),
      categorieEntreprise: unite.categorieEntreprise || "",
    }
  }
  // gouv
  return {
    found: true,
    siret: etab.siret || `${siren}00001`,
    siren,
    denomination:
      unite?.denomination ||
      unite?.nom_raison_sociale ||
      `${unite?.prenom_1 || ""} ${unite?.nom || ""}`.trim() ||
      "Non renseigne",
    formeJuridique: getFormeJuridique(unite?.categorie_juridique),
    dateCreation: unite?.date_creation || "",
    activitePrincipale: etab.activite_principale || "",
    libelleActivite: etab.libelle_activite_principale || "",
    adresse: {
      numero: etab.numero_voie || "",
      voie: `${etab.type_voie || ""} ${etab.libelle_voie || ""}`.trim(),
      codePostal: etab.code_postal || "",
      commune: etab.libelle_commune || "",
      departement: etab.code_postal?.substring(0, 2) || "",
    },
    etatAdministratif: etab.etat_administratif === "A" ? "Active" : "Fermee",
    isActive: etab.etat_administratif === "A",
    trancheEffectifs: getTrancheEffectifs(unite?.tranche_effectifs),
    categorieEntreprise: unite?.categorie_entreprise || "",
  }
}

// ─── Main handler ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown"

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error: "Trop de requetes. Veuillez patienter une minute avant de reessayer.",
        rateLimited: true,
      },
      { status: 429 }
    )
  }

  const siretParam = request.nextUrl.searchParams.get("siret")
  const sirenParam = request.nextUrl.searchParams.get("siren")

  // Determine if this is a SIREN (9 digits) or SIRET (14 digits) lookup
  const isSirenLookup = !siretParam && !!sirenParam
  const rawValue = (siretParam || sirenParam || "").replace(/\s/g, "")

  if (isSirenLookup) {
    // SIREN: 9 digits
    if (!/^\d{9}$/.test(rawValue)) {
      return NextResponse.json(
        { error: "Le numero SIREN doit contenir exactement 9 chiffres." },
        { status: 400 }
      )
    }
  } else {
    // SIRET: 14 digits
    if (!/^\d{14}$/.test(rawValue)) {
      return NextResponse.json(
        { error: "Le numero SIRET doit contenir exactement 14 chiffres." },
        { status: 400 }
      )
    }
    // Validate Luhn checksum for SIRET
    if (!validateSiretLuhn(rawValue)) {
      return NextResponse.json(
        { error: "Ce numero SIRET est invalide (somme de controle incorrecte)." },
        { status: 400 }
      )
    }
  }

  try {
    const inseeToken = process.env.INSEE_API_TOKEN

    if (isSirenLookup) {
      // ── SIREN lookup: find the company's head establishment ──
      const cleanSiren = rawValue

      // Try INSEE API first
      if (inseeToken) {
        try {
          const inseeRes = await fetch(
            `https://api.insee.fr/entreprises/sirene/V3.11/siren/${cleanSiren}`,
            {
              headers: {
                Authorization: `Bearer ${inseeToken}`,
                Accept: "application/json",
              },
              next: { revalidate: 86400 },
            }
          )

          if (inseeRes.ok) {
            const inseeData = await inseeRes.json()
            const unite = inseeData.uniteLegale
            if (unite) {
              // Get the siege (head establishment) via SIRET endpoint
              const siegeSiret = `${cleanSiren}${unite.nicSiegeUniteLegale || "00001"}`
              const siegeRes = await fetch(
                `https://api.insee.fr/entreprises/sirene/V3.11/siret/${siegeSiret}`,
                {
                  headers: {
                    Authorization: `Bearer ${inseeToken}`,
                    Accept: "application/json",
                  },
                  next: { revalidate: 86400 },
                }
              )
              if (siegeRes.ok) {
                const siegeData = await siegeRes.json()
                if (siegeData.etablissement) {
                  return NextResponse.json(
                    formatSirenResult(cleanSiren, unite, siegeData.etablissement, "insee")
                  )
                }
              }
              // If siege fetch fails, return basic info from unite legale
              return NextResponse.json(
                formatSirenResult(cleanSiren, unite, { siret: siegeSiret }, "insee")
              )
            }
          }
        } catch {
          logger.warn("INSEE SIREN API failed, falling back to data.gouv.fr")
        }
      }

      // Fallback: data.gouv.fr — search by SIREN (unites_legales endpoint)
      const res = await fetch(
        `https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales/${cleanSiren}`,
        { next: { revalidate: 86400 } }
      )

      if (!res.ok) {
        if (res.status === 404) {
          return NextResponse.json({
            found: false,
            siren: cleanSiren,
            siret: cleanSiren,
            message: "Aucune entreprise trouvee pour ce numero SIREN.",
          })
        }
        throw new Error(`data.gouv.fr SIREN API error: ${res.status}`)
      }

      const data = await res.json()
      const uniteLegale = data.unite_legale

      if (!uniteLegale) {
        return NextResponse.json({
          found: false,
          siren: cleanSiren,
          siret: cleanSiren,
          message: "Aucune entreprise trouvee pour ce numero SIREN.",
        })
      }

      // Get the siege establishment
      const siege = uniteLegale.etablissement_siege || uniteLegale.etablissements?.[0] || {}

      return NextResponse.json(
        formatSirenResult(cleanSiren, uniteLegale, siege, "gouv")
      )
    }

    // ── Standard SIRET lookup ──
    const cleanSiret = rawValue

    // Try INSEE API first if token is available
    if (inseeToken) {
      try {
        const inseeRes = await fetch(
          `https://api.insee.fr/entreprises/sirene/V3.11/siret/${cleanSiret}`,
          {
            headers: {
              Authorization: `Bearer ${inseeToken}`,
              Accept: "application/json",
            },
            next: { revalidate: 86400 },
          }
        )

        if (inseeRes.ok) {
          const inseeData = await inseeRes.json()
          const etab = inseeData.etablissement
          if (etab) {
            const unite = etab.uniteLegale
            const adresse = etab.adresseEtablissement
            const isActive =
              etab.periodesEtablissement?.[0]
                ?.etatAdministratifEtablissement === "A"

            return NextResponse.json({
              found: true,
              siret: cleanSiret,
              siren: cleanSiret.substring(0, 9),
              denomination:
                unite.denominationUniteLegale ||
                `${unite.prenomUsuelUniteLegale || ""} ${unite.nomUniteLegale || ""}`.trim() ||
                "Non renseigne",
              formeJuridique: getFormeJuridique(
                unite.categorieJuridiqueUniteLegale
              ),
              dateCreation: unite.dateCreationUniteLegale || "",
              activitePrincipale:
                etab.periodesEtablissement?.[0]
                  ?.activitePrincipaleEtablissement || "",
              libelleActivite: "",
              adresse: {
                numero: adresse.numeroVoieEtablissement || "",
                voie: `${adresse.typeVoieEtablissement || ""} ${adresse.libelleVoieEtablissement || ""}`.trim(),
                codePostal: adresse.codePostalEtablissement || "",
                commune: adresse.libelleCommuneEtablissement || "",
                departement:
                  adresse.codePostalEtablissement?.substring(0, 2) || "",
              },
              etatAdministratif: isActive ? "Active" : "Fermee",
              isActive,
              trancheEffectifs: getTrancheEffectifs(
                unite.trancheEffectifsUniteLegale
              ),
              categorieEntreprise: unite.categorieEntreprise || "",
            })
          }
        }
        // If INSEE fails (404, 500, etc.), fall through to data.gouv.fr
      } catch {
        // INSEE API error, fall through to fallback
        logger.warn("INSEE API failed, falling back to data.gouv.fr")
      }
    }

    // Fallback: data.gouv.fr API (free, no token needed)
    const res = await fetch(
      `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${cleanSiret}`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({
          found: false,
          siret: cleanSiret,
          message: "Aucune entreprise trouvee pour ce numero SIRET.",
        })
      }
      throw new Error(`data.gouv.fr API error: ${res.status}`)
    }

    const data = await res.json()
    const etab = data.etablissement

    if (!etab) {
      return NextResponse.json({
        found: false,
        siret: cleanSiret,
        message: "Aucune entreprise trouvee pour ce numero SIRET.",
      })
    }

    const unite = etab.unite_legale

    return NextResponse.json({
      found: true,
      siret: cleanSiret,
      siren: cleanSiret.substring(0, 9),
      denomination:
        unite?.denomination ||
        unite?.nom_raison_sociale ||
        `${unite?.prenom_1 || ""} ${unite?.nom || ""}`.trim() ||
        "Non renseigne",
      formeJuridique: getFormeJuridique(unite?.categorie_juridique),
      dateCreation: unite?.date_creation || "",
      activitePrincipale: etab.activite_principale || "",
      libelleActivite: etab.libelle_activite_principale || "",
      adresse: {
        numero: etab.numero_voie || "",
        voie: `${etab.type_voie || ""} ${etab.libelle_voie || ""}`.trim(),
        codePostal: etab.code_postal || "",
        commune: etab.libelle_commune || "",
        departement: etab.code_postal?.substring(0, 2) || "",
      },
      etatAdministratif:
        etab.etat_administratif === "A" ? "Active" : "Fermee",
      isActive: etab.etat_administratif === "A",
      trancheEffectifs: getTrancheEffectifs(unite?.tranche_effectifs),
      categorieEntreprise: unite?.categorie_entreprise || "",
    })
  } catch (error) {
    logger.error("SIRET/SIREN public verification error", error)
    return NextResponse.json(
      { error: "Erreur lors de la verification. Veuillez reessayer." },
      { status: 500 }
    )
  }
}
