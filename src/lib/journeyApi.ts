export type JourneyApiEnvelope<T> = {
  data: T
  meta?: Record<string, unknown>
  errors?: Array<{
    code?: string
    message?: string
    details?: unknown
  }>
  trace_id?: string
}

export class JourneyApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'JourneyApiError'
    this.status = status
    this.details = details
  }
}

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
  if (!baseUrl) {
    throw new JourneyApiError('COURSES_API_BASE_URL não configurada.', 500)
  }

  const normalizedPath = path.replace(/^\/+/, '')
  const apiPath = baseHasPublicPrefix(baseUrl)
    ? normalizedPath
    : `api/v1/public/${normalizedPath}`

  return new URL(apiPath, baseUrl).toString()
}

function buildHeaders(): Record<string, string> {
  const apiKey = readServerEnv('COURSES_API_KEY')
  const institutionId = readServerEnv('COURSES_API_INSTITUTION_ID')

  if (!apiKey) {
    throw new JourneyApiError('COURSES_API_KEY não configurada.', 500)
  }

  if (!institutionId) {
    throw new JourneyApiError('COURSES_API_INSTITUTION_ID não configurada.', 500)
  }

  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-Institution-Id': institutionId,
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const envelope = payload as { errors?: Array<{ message?: string }>; message?: string }
    if (typeof envelope.message === 'string' && envelope.message.trim()) return envelope.message.trim()
    const firstError = envelope.errors?.find((item) => typeof item?.message === 'string' && item.message.trim())
    if (firstError?.message) return firstError.message.trim()
  }

  return fallback
}

function parseJourneyPayload(raw: string): unknown {
  if (!raw) return { data: null, errors: [] }

  try {
    return JSON.parse(raw)
  } catch {
    return {
      data: null,
      errors: [],
      message: raw.trim() || undefined,
    }
  }
}

export async function requestJourneyApi<T>(
  path: string,
  method: 'POST' | 'PATCH',
  body?: unknown,
): Promise<{ status: number; payload: JourneyApiEnvelope<T> }> {
  const response = await fetch(buildPublicApiUrl(path), {
    method,
    headers: buildHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const raw = await response.text()
  const payload = parseJourneyPayload(raw) as JourneyApiEnvelope<T> & { message?: string }

  if (!response.ok) {
    throw new JourneyApiError(
      getErrorMessage(payload, `Journey API request failed with status ${response.status}`),
      response.status,
      payload,
    )
  }

  return {
    status: response.status,
    payload,
  }
}
