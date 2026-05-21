#!/usr/bin/env node
/**
 * RGE Spec validator — dependency-free.
 *
 * Reads `docs/spec/rge/v1.0/rge.schema.json` + linked enums + examples and
 * validates that each example matches the schema's structural contract.
 * No ajv install required: we implement the subset of JSON Schema needed
 * for this spec (required, type, pattern, enum, const, minItems, $ref).
 *
 * Exit codes:
 *   0  All valid examples passed AND all invalid examples failed.
 *   1  At least one mismatch detected.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPEC_DIR = resolve(__dirname, '..', 'docs', 'spec', 'rge', 'v1.0')

const loadJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

const SCHEMA = loadJson(join(SPEC_DIR, 'rge.schema.json'))
const ENUMS = {
  organismes: loadJson(join(SPEC_DIR, 'enums/organismes-certificateurs.json')),
  gestes: loadJson(join(SPEC_DIR, 'enums/gestes-rge.json')),
  meta: loadJson(join(SPEC_DIR, 'enums/categories-meta-domaines.json')),
}

const DEFS = SCHEMA.$defs
const ROOT_DEF = DEFS.RgeArtisan

const errors = []

function pushError(path, msg) {
  errors.push(`  - ${path}: ${msg}`)
}

function resolveLocalRef(ref) {
  if (ref === '#/$defs/Address') return DEFS.Address
  if (ref === '#/$defs/GeoLocation') return DEFS.GeoLocation
  if (ref === '#/$defs/Source') return DEFS.Source
  if (ref === '#/$defs/RgeQualification') return DEFS.RgeQualification
  if (ref === '#/$defs/RgeArtisan') return DEFS.RgeArtisan
  return null
}

function resolveEnumRef(ref) {
  if (ref === 'enums/organismes-certificateurs.json') return ENUMS.organismes
  if (ref === 'enums/gestes-rge.json') return ENUMS.gestes
  if (ref === 'enums/categories-meta-domaines.json') return ENUMS.meta
  return null
}

function typeMatches(value, typeSpec) {
  const types = Array.isArray(typeSpec) ? typeSpec : [typeSpec]
  for (const t of types) {
    if (t === 'string' && typeof value === 'string') return true
    if (t === 'number' && typeof value === 'number') return true
    if (t === 'integer' && Number.isInteger(value)) return true
    if (t === 'boolean' && typeof value === 'boolean') return true
    if (t === 'object' && value !== null && typeof value === 'object' && !Array.isArray(value)) return true
    if (t === 'array' && Array.isArray(value)) return true
    if (t === 'null' && value === null) return true
  }
  return false
}

function validateField(value, schema, path) {
  if (schema.$ref) {
    const enumSchema = resolveEnumRef(schema.$ref)
    if (enumSchema) {
      if (!enumSchema.enum.includes(value)) {
        pushError(path, `value "${value}" not in enum from ${schema.$ref}`)
      }
      return
    }
    const localSchema = resolveLocalRef(schema.$ref)
    if (localSchema) {
      validateObject(value, localSchema, path)
      return
    }
    pushError(path, `unknown $ref ${schema.$ref}`)
    return
  }

  if (schema.type !== undefined && !typeMatches(value, schema.type)) {
    pushError(path, `expected type ${JSON.stringify(schema.type)}, got ${value === null ? 'null' : typeof value}`)
    return
  }

  if (schema.const !== undefined && value !== schema.const) {
    pushError(path, `expected const "${schema.const}", got "${value}"`)
  }

  if (schema.enum !== undefined && !schema.enum.includes(value)) {
    pushError(path, `value "${value}" not in inline enum`)
  }

  if (schema.pattern && typeof value === 'string') {
    const re = new RegExp(schema.pattern)
    if (!re.test(value)) {
      pushError(path, `value "${value}" does not match pattern ${schema.pattern}`)
    }
  }

  if (typeof value === 'string' && schema.minLength !== undefined && value.length < schema.minLength) {
    pushError(path, `string length ${value.length} below minLength ${schema.minLength}`)
  }
  if (typeof value === 'string' && schema.maxLength !== undefined && value.length > schema.maxLength) {
    pushError(path, `string length ${value.length} above maxLength ${schema.maxLength}`)
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      pushError(path, `value ${value} below minimum ${schema.minimum}`)
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      pushError(path, `value ${value} above maximum ${schema.maximum}`)
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      pushError(path, `array length ${value.length} below minItems ${schema.minItems}`)
    }
    if (schema.items) {
      value.forEach((item, idx) => {
        validateField(item, schema.items, `${path}[${idx}]`)
      })
    }
  }

  if (schema.type === 'object' || schema.properties) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      validateObject(value, schema, path)
    }
  }
}

function validateObject(value, schema, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    pushError(path, 'expected object')
    return
  }

  const required = schema.required || []
  for (const key of required) {
    if (!(key in value)) {
      pushError(path, `missing required field "${key}"`)
    }
  }

  const properties = schema.properties || {}
  for (const [key, val] of Object.entries(value)) {
    if (properties[key]) {
      validateField(val, properties[key], `${path}.${key}`)
    } else if (schema.additionalProperties === false) {
      pushError(path, `unexpected property "${key}"`)
    }
  }
}

function validateExample(filename, expectValid) {
  errors.length = 0
  const filePath = join(SPEC_DIR, 'examples', filename)
  const data = loadJson(filePath)
  validateObject(data, ROOT_DEF, 'root')
  const passed = errors.length === 0
  if (expectValid && !passed) {
    console.error(`FAIL ${filename} — expected valid, got ${errors.length} errors:`)
    for (const e of errors) console.error(e)
    return false
  }
  if (!expectValid && passed) {
    console.error(`FAIL ${filename} — expected invalid, got 0 errors`)
    return false
  }
  console.log(`PASS ${filename} (${expectValid ? 'valid' : 'invalid, ' + errors.length + ' err(s)'})`)
  return true
}

function main() {
  const all = readdirSync(join(SPEC_DIR, 'examples')).filter((f) => f.endsWith('.json'))
  let allOk = true
  for (const fname of all) {
    const expectValid = !fname.includes('invalid')
    const ok = validateExample(fname, expectValid)
    if (!ok) allOk = false
  }
  if (!allOk) {
    console.error('\nValidation FAILED')
    process.exit(1)
  }
  console.log(`\nAll ${all.length} examples validated OK.`)
  process.exit(0)
}

main()
