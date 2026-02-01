'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Database, Play, Loader2, CheckCircle, AlertCircle,
  MapPin, Briefcase, RefreshCw
} from 'lucide-react'

const DEPARTEMENTS_IDF = [
  { code: '75', name: 'Paris' },
  { code: '77', name: 'Seine-et-Marne' },
  { code: '78', name: 'Yvelines' },
  { code: '91', name: 'Essonne' },
  { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' },
  { code: '94', name: 'Val-de-Marne' },
  { code: '95', name: 'Val-d\'Oise' },
]

const DEPARTEMENTS_POPULAIRES = [
  { code: '13', name: 'Bouches-du-Rhone' },
  { code: '31', name: 'Haute-Garonne' },
  { code: '33', name: 'Gironde' },
  { code: '44', name: 'Loire-Atlantique' },
  { code: '59', name: 'Nord' },
  { code: '69', name: 'Rhone' },
]

const NAF_METIERS = [
  { code: '4321A', name: 'Electricien' },
  { code: '4322A', name: 'Plombier' },
  { code: '4322B', name: 'Chauffagiste' },
  { code: '4332A', name: 'Menuisier' },
  { code: '4333Z', name: 'Carreleur' },
  { code: '4334Z', name: 'Peintre' },
  { code: '4331Z', name: 'Platrier' },
  { code: '4391B', name: 'Couvreur' },
  { code: '4399C', name: 'Macon' },
  { code: '4329A', name: 'Isolation' },
]

interface ImportResult {
  total_fetched: number
  total_inserted: number
  total_skipped: number
  total_errors: number
  departments_processed: string[]
  errors: string[]
}

export default function ImportPage() {
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['75', '92', '93', '94'])
  const [selectedNaf, setSelectedNaf] = useState<string[]>(NAF_METIERS.map(m => m.code))
  const [maxPerDept, setMaxPerDept] = useState(100)
  const [dryRun, setDryRun] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleDept = (code: string) => {
    setSelectedDepts(prev =>
      prev.includes(code)
        ? prev.filter(d => d !== code)
        : [...prev, code]
    )
  }

  const toggleNaf = (code: string) => {
    setSelectedNaf(prev =>
      prev.includes(code)
        ? prev.filter(n => n !== code)
        : [...prev, code]
    )
  }

  const selectAllIdf = () => {
    setSelectedDepts(DEPARTEMENTS_IDF.map(d => d.code))
  }

  const runImport = async () => {
    setIsRunning(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/import/sirene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departments: selectedDepts,
          naf_codes: selectedNaf,
          max_per_department: maxPerDept,
          dry_run: dryRun,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.result)
      } else {
        setError(data.error || 'Erreur inconnue')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                Import SIRENE
              </h1>
              <p className="text-sm text-gray-500">
                Importer les artisans depuis la base INSEE
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Departements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Departements
                </h2>
                <button
                  onClick={selectAllIdf}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Selectionner IDF
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Ile-de-France</p>
                  <div className="flex flex-wrap gap-2">
                    {DEPARTEMENTS_IDF.map(dept => (
                      <button
                        key={dept.code}
                        onClick={() => toggleDept(dept.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedDepts.includes(dept.code)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {dept.code} - {dept.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Autres grandes villes</p>
                  <div className="flex flex-wrap gap-2">
                    {DEPARTEMENTS_POPULAIRES.map(dept => (
                      <button
                        key={dept.code}
                        onClick={() => toggleDept(dept.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedDepts.includes(dept.code)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {dept.code} - {dept.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Metiers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Metiers a importer
              </h2>
              <div className="flex flex-wrap gap-2">
                {NAF_METIERS.map(metier => (
                  <button
                    key={metier.code}
                    onClick={() => toggleNaf(metier.code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedNaf.includes(metier.code)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {metier.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Options</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum par departement
                  </label>
                  <input
                    type="number"
                    value={maxPerDept}
                    onChange={(e) => setMaxPerDept(parseInt(e.target.value) || 100)}
                    min={10}
                    max={1000}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total estime: {selectedDepts.length * maxPerDept} artisans
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Mode simulation</span>
                    <p className="text-sm text-gray-500">
                      Tester sans inserer dans la base
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions & Resultats */}
          <div className="space-y-6">
            {/* Bouton lancer */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <button
                onClick={runImport}
                disabled={isRunning || selectedDepts.length === 0 || selectedNaf.length === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {dryRun ? 'Lancer simulation' : 'Lancer l\'import'}
                  </>
                )}
              </button>

              <div className="mt-4 text-sm text-gray-500">
                <p><strong>Departements:</strong> {selectedDepts.length}</p>
                <p><strong>Metiers:</strong> {selectedNaf.length}</p>
                <p><strong>Mode:</strong> {dryRun ? 'Simulation' : 'Reel'}</p>
              </div>
            </div>

            {/* Resultat */}
            {result && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resultat
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recuperes</span>
                    <span className="font-semibold">{result.total_fetched}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inseres</span>
                    <span className="font-semibold text-green-600">{result.total_inserted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ignores (doublons)</span>
                    <span className="font-semibold text-yellow-600">{result.total_skipped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Erreurs</span>
                    <span className="font-semibold text-red-600">{result.total_errors}</span>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg text-xs text-red-700 max-h-32 overflow-auto">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                    {result.errors.length > 5 && (
                      <p>... et {result.errors.length - 5} autres erreurs</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Erreur</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-900 mb-2">Configuration requise</h3>
              <p className="text-sm text-amber-800 mb-2">
                Ajoutez dans votre fichier <code>.env.local</code> :
              </p>
              <pre className="text-xs bg-amber-100 p-2 rounded overflow-x-auto">
{`INSEE_CONSUMER_KEY=votre_cle
INSEE_CONSUMER_SECRET=votre_secret`}
              </pre>
              <p className="text-xs text-amber-700 mt-2">
                Obtenez vos cles sur <a href="https://api.insee.fr" target="_blank" className="underline">api.insee.fr</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
