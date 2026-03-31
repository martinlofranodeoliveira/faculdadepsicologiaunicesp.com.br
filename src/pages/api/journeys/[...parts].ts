import { JourneyApiError, requestJourneyApi } from '@/lib/journeyApi'

export const prerender = false

type Context = {
  params: {
    parts?: string
  }
  request: Request
}

const GENERIC_JOURNEY_ERROR_MESSAGE =
  'Não foi possível concluir esta etapa da inscrição agora. Tente novamente em instantes.'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function resolveJourneyPath(partsValue?: string): string | null {
  const parts = (partsValue ?? '').split('/').filter(Boolean)

  if (parts.length === 1 && ['step-1', 'resume', 'pending'].includes(parts[0])) {
    return `journeys/${parts[0]}`
  }

  if (parts.length === 2) {
    const [journeyId, action] = parts
    if (!/^\d+$/.test(journeyId)) return null
    if (!['step-2', 'step-3', 'finalize', 'abandon'].includes(action)) {
      return null
    }
    return `journeys/${journeyId}/${action}`
  }

  return null
}

function isSafeJourneyMessage(message: string): boolean {
  return [
    /é obrigatório/i,
    /precisa ser concluíd[ao]/i,
    /jornada.*não encontrada/i,
    /payload inválido/i,
    /rota .* inválida/i,
    /método não permitido/i,
  ].some((pattern) => pattern.test(message))
}

function isInternalJourneyMessage(message: string): boolean {
  return [
    /sqlstate/i,
    /call to undefined method/i,
    /undefined method/i,
    /stack/i,
    /trace/i,
    /exception/i,
    /syntax error/i,
    /parameter number/i,
    /unauthorized_api_key/i,
  ].some((pattern) => pattern.test(message))
}

function getPublicJourneyErrorMessage(status: number, message: string): string {
  const normalized = message.trim()
  if (!normalized) return GENERIC_JOURNEY_ERROR_MESSAGE

  if (isSafeJourneyMessage(normalized)) return normalized
  if (isInternalJourneyMessage(normalized)) return GENERIC_JOURNEY_ERROR_MESSAGE

  if (status === 401 || status === 403) {
    return 'Não foi possível validar sua inscrição agora. Tente novamente em instantes.'
  }

  if (status >= 500) return GENERIC_JOURNEY_ERROR_MESSAGE
  return normalized
}

async function handle(context: Context) {
  const method = context.request.method.toUpperCase()
  if (method !== 'POST' && method !== 'PATCH') {
    return jsonResponse({ success: false, message: 'Método não permitido.' }, 405)
  }

  const path = resolveJourneyPath(context.params.parts)
  if (!path) {
    return jsonResponse({ success: false, message: 'Rota de jornada inválida.' }, 404)
  }

  const rawBody = await context.request.text()
  let body: unknown

  if (rawBody) {
    try {
      body = JSON.parse(rawBody)
    } catch {
      return jsonResponse({ success: false, message: 'Payload inválido.' }, 400)
    }
  }

  try {
    const result = await requestJourneyApi(path, method as 'POST' | 'PATCH', body)
    return jsonResponse(result.payload, result.status)
  } catch (error) {
    if (error instanceof JourneyApiError) {
      console.error('Erro na Journey API:', {
        path,
        method,
        status: error.status,
        message: error.message,
        details: error.details,
      })

      return jsonResponse(
        {
          success: false,
          message: getPublicJourneyErrorMessage(error.status, error.message),
        },
        error.status,
      )
    }

    return jsonResponse(
      {
        success: false,
        message: 'Não foi possível processar a jornada agora.',
      },
      500,
    )
  }
}

export async function POST(context: Context) {
  return handle(context)
}

export async function PATCH(context: Context) {
  return handle(context)
}
