export type PoleStateOption = {
  id: number
  stateUf: string
  stateName: string
}

export type PoleCityOption = {
  id: number
  name: string
}

export type PoleOption = {
  id: number
  name: string
}

type JsonRecord = Record<string, unknown>

function readServerEnv(name: keyof ImportMetaEnv | string): string | undefined {
  const viteEnv = (import.meta.env as Record<string, string | boolean | undefined> | undefined) ?? undefined
  const viteValue = viteEnv?.[name]
  if (typeof viteValue === 'string' && viteValue.trim()) return viteValue

  const processValue = process.env[name]
  if (typeof processValue === 'string' && processValue.trim()) return processValue

  return undefined
}

function normalizeBaseUrl(value: string | undefined): string {
  const normalized = value?.trim() ?? ''
  if (!normalized) return ''
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function baseHasPublicPrefix(baseUrl: string): boolean {
  if (!baseUrl) return false

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '')
    return /\/api\/v1\/public$/i.test(pathname)
  } catch {
    return /\/api\/v1\/public\/?$/i.test(baseUrl)
  }
}

function buildPublicApiUrl(path: string): string {
  const baseUrl = normalizeBaseUrl(readServerEnv('COURSES_API_BASE_URL'))
  if (!baseUrl) throw new Error('COURSES_API_BASE_URL não configurada.')

  const normalizedPath = path.replace(/^\/+/, '')
  const apiPath = baseHasPublicPrefix(baseUrl) ? normalizedPath : `api/v1/public/${normalizedPath}`

  return new URL(apiPath, baseUrl).toString()
}

function buildHeaders(): Record<string, string> {
  const apiKey = readServerEnv('COURSES_API_KEY')
  const institutionId = readServerEnv('COURSES_API_INSTITUTION_ID')

  if (!apiKey) throw new Error('COURSES_API_KEY não configurada.')
  if (!institutionId) throw new Error('COURSES_API_INSTITUTION_ID não configurada.')

  return {
    Accept: 'application/json',
    'X-API-Key': apiKey,
    'X-Institution-Id': institutionId,
  }
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const record = payload as JsonRecord

  const message = record.message
  if (typeof message === 'string' && message.trim()) return message.trim()

  const errors = Array.isArray(record.errors) ? record.errors : []
  for (const item of errors) {
    if (item && typeof item === 'object' && typeof item.message === 'string' && item.message.trim()) {
      return item.message.trim()
    }
  }

  return fallback
}

function extractItems(payload: unknown): JsonRecord[] {
  if (!payload || typeof payload !== 'object') return []
  const record = payload as JsonRecord

  if (Array.isArray(record.data)) {
    return record.data.filter((item: unknown): item is JsonRecord => Boolean(item) && typeof item === 'object')
  }

  if (
    record.data &&
    typeof record.data === 'object' &&
    Array.isArray((record.data as JsonRecord).items)
  ) {
    return ((record.data as JsonRecord).items as unknown[]).filter(
      (item): item is JsonRecord => Boolean(item) && typeof item === 'object',
    )
  }

  if (Array.isArray(record.items)) {
    return record.items.filter((item: unknown): item is JsonRecord => Boolean(item) && typeof item === 'object')
  }

  return []
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

function readString(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

export async function fetchPublicPolesApi(path: string, fallbackMessage: string): Promise<JsonRecord[]> {
  const response = await fetch(buildPublicApiUrl(path), {
    method: 'GET',
    headers: buildHeaders(),
  })

  const payload = (await response.json().catch(() => null)) as JsonRecord | null
  if (!response.ok) {
    throw new Error(readErrorMessage(payload, fallbackMessage))
  }

  return extractItems(payload)
}

export function normalizePoleState(record: JsonRecord): PoleStateOption | null {
  const id = parsePositiveInt(record.id ?? record.state_id)
  const stateUf = readString(record, ['uf', 'state_uf', 'sigla']).toUpperCase()
  const stateName = readString(record, ['name', 'state_name', 'title'])

  if (!id) return null
  if (!stateUf && !stateName) return null

  return {
    id,
    stateUf: stateUf || stateName,
    stateName: stateName || stateUf,
  }
}

export function normalizePoleCity(record: JsonRecord): PoleCityOption | null {
  const id = parsePositiveInt(record.id ?? record.city_id)
  const name = readString(record, ['name', 'city_name', 'city_text', 'title'])

  if (!id || !name) return null

  return {
    id,
    name,
  }
}

export function normalizePole(record: JsonRecord): PoleOption | null {
  const id = parsePositiveInt(record.id ?? record.pole_id)
  const name = readString(record, ['name', 'pole_name', 'title'])
  const status = readString(record, ['status']).toLowerCase()

  if (!id || !name) return null
  if (status && status !== 'active') return null

  return {
    id,
    name,
  }
}
