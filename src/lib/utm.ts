export type UtmParams = Record<string, string>

const UTM_STORAGE_KEY = 'lp_utm_params'
const TRACKING_KEYS = new Set([
  'campanha',
  'midia',
  'fonte',
  'fonte_texto',
  'fontetexto',
  'origem',
  'criativo',
  'conteudo_anuncio',
  'id_fonte_crm',
  'id_clique_google',
  'id_clique_facebook',
  'id_clique_facebbok',
  'id_clique_microsoft',
  'gclid',
  'fbclid',
  'msclkid',
  'conjunto_de_anuncios',
  'adset',
  'adset_name',
])

function isUtmKey(key: string): boolean {
  return key.toLowerCase().startsWith('utm_')
}

function normalizeTrackingKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[.\s-]+/g, '_')
}

function isTrackingKey(key: string): boolean {
  const normalized = normalizeTrackingKey(key)
  return isUtmKey(normalized) || TRACKING_KEYS.has(normalized)
}

function addTrackingValue(target: UtmParams, key: string, value: string): void {
  const normalizedValue = value.trim()
  if (!normalizedValue) return
  const normalizedKey = normalizeTrackingKey(key)
  if (!isTrackingKey(normalizedKey)) return
  target[normalizedKey] = normalizedValue
}

function extractTrackingFromCookieValue(value: string): UtmParams {
  const extracted: UtmParams = {}
  if (!value) return extracted

  try {
    const parsed = JSON.parse(value) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.entries(parsed as Record<string, unknown>).forEach(([key, entryValue]) => {
        if (typeof entryValue !== 'string') return
        addTrackingValue(extracted, key, entryValue)
      })
    }
  } catch {
    // Continua tentando outros formatos.
  }

  try {
    const params = new URLSearchParams(value)
    params.forEach((entryValue, key) => {
      addTrackingValue(extracted, key, entryValue)
    })
  } catch {
    // Ignora valores em formato não parseável.
  }

  return extracted
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function readTrackingParamsFromCookies(): UtmParams {
  if (typeof window === 'undefined') return {}
  if (!document.cookie) return {}

  const extracted: UtmParams = {}
  const cookies = document.cookie.split(';')

  cookies.forEach((cookie) => {
    const [rawName, ...rawValueParts] = cookie.trim().split('=')
    if (!rawName || rawValueParts.length === 0) return

    const rawValue = rawValueParts.join('=')
    const decodedName = safeDecode(rawName.trim())
    const decodedValue = safeDecode(rawValue.trim())

    if (isTrackingKey(decodedName)) {
      addTrackingValue(extracted, decodedName, decodedValue)
    }

    const parsedFromValue = extractTrackingFromCookieValue(decodedValue)
    Object.entries(parsedFromValue).forEach(([key, value]) => {
      addTrackingValue(extracted, key, value)
    })
  })

  return extracted
}

export function extractUtmParams(search: string): UtmParams {
  const params = new URLSearchParams(search)
  const utm: UtmParams = {}

  params.forEach((value, key) => {
    addTrackingValue(utm, key, value)
  })

  return utm
}

export function readStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {}

  const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY)
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}

    return Object.entries(parsed as Record<string, unknown>).reduce<UtmParams>((acc, [key, value]) => {
      if (!isTrackingKey(key)) return acc
      if (typeof value !== 'string' || !value) return acc
      acc[normalizeTrackingKey(key)] = value
      return acc
    }, {})
  } catch {
    return {}
  }
}

export function writeStoredUtmParams(params: UtmParams): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params))
}

export function syncUtmParamsFromUrl(search: string): UtmParams {
  const fromUrl = extractUtmParams(search)
  const fromStorage = readStoredUtmParams()
  const fromCookies = readTrackingParamsFromCookies()
  const merged = { ...fromStorage, ...fromCookies, ...fromUrl }

  if (Object.keys(merged).length > 0) {
    writeStoredUtmParams(merged)
  }

  return merged
}
