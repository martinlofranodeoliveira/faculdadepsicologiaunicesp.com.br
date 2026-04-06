import type { APIRoute } from 'astro'

type ContractType = 'graduation' | 'pos'
type JsonRecord = Record<string, unknown>

type NormalizedInstitutionContract = {
  title: string
  html: string
  text: string
}

const CONTRACT_TITLE_FALLBACK = 'Contrato de prestação de serviços educacionais'

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
  const apiPath = baseHasPublicPrefix(baseUrl)
    ? normalizedPath
    : `api/v1/public/${normalizedPath}`

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

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null
}

function collectCandidateRecords(value: unknown, depth = 0): JsonRecord[] {
  if (depth > 3) return []

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectCandidateRecords(item, depth + 1))
  }

  const record = asRecord(value)
  if (!record) return []

  const nestedRecords = Object.values(record).flatMap((entry) => collectCandidateRecords(entry, depth + 1))
  return [record, ...nestedRecords]
}

function readFirstString(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

function readErrorMessage(payload: unknown, fallback: string): string {
  const record = asRecord(payload)
  if (!record) return fallback

  const message = record.message
  if (typeof message === 'string' && message.trim()) return message.trim()

  const errors = Array.isArray(record.errors) ? record.errors : []
  for (const item of errors) {
    const itemRecord = asRecord(item)
    if (!itemRecord) continue

    const itemMessage = itemRecord.message
    if (typeof itemMessage === 'string' && itemMessage.trim()) return itemMessage.trim()
  }

  return fallback
}

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value)
}

function normalizeContract(payload: unknown): NormalizedInstitutionContract | null {
  const root = asRecord(payload)
  const candidates = root ? collectCandidateRecords(root.data ?? root) : []

  let title = ''
  let html = ''
  let text = ''

  for (const record of candidates) {
    if (!title) {
      title = readFirstString(record, ['title', 'name', 'label', 'contract_title', 'contract_name'])
    }

    if (!html) {
      html = readFirstString(record, ['html', 'content_html', 'contract_html', 'body_html', 'terms_html'])
    }

    if (!text) {
      text = readFirstString(record, ['text', 'content', 'contract_text', 'body', 'description', 'terms_text'])
    }
  }

  if (!html && text && looksLikeHtml(text)) {
    html = text
    text = ''
  }

  if (!text && html && !looksLikeHtml(html)) {
    text = html
    html = ''
  }

  if (!html && !text) return null

  return {
    title: title || CONTRACT_TITLE_FALLBACK,
    html,
    text,
  }
}

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  const typeParam = url.searchParams.get('type')
  const type: ContractType | null =
    typeParam === 'graduation' || typeParam === 'pos' ? typeParam : null

  if (!type) {
    return new Response(
      JSON.stringify({
        message: 'Tipo de contrato inválido.',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    )
  }

  try {
    const response = await fetch(buildPublicApiUrl(`institutions/contracts?type=${type}`), {
      method: 'GET',
      headers: buildHeaders(),
    })

    const payload = (await response.json().catch(() => null)) as JsonRecord | null
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          message: readErrorMessage(payload, 'Não foi possível carregar o contrato.'),
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      )
    }

    const contract = normalizeContract(payload)
    if (!contract) {
      return new Response(
        JSON.stringify({
          message: 'Contrato não encontrado para a instituição informada.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      )
    }

    return new Response(
      JSON.stringify({
        data: contract,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'private, max-age=300',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Não foi possível carregar o contrato.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    )
  }
}
