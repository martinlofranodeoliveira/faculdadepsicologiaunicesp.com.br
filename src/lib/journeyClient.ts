export type JourneyStep1Response = {
  journey_id: number
  journey_uuid?: string
  course_level?: string
  current_step?: number
  next_step?: number | string | null
}

export type JourneyStepProgressResponse = {
  journey_id: number
  course_level?: string
  current_step?: number
  next_step?: number | string | null
}

export type JourneyFinalizeResponse = {
  journey_id: number
  admission_id?: number | null
  student_id?: number | null
  course_level?: string
  status?: string | null
  message?: string | null
}

export type JourneyStepPayload = Record<string, unknown>

type JourneyEnvelope<T> = {
  data?: T
  errors?: Array<{
    code?: string
    message?: string
    details?: unknown
  }>
  message?: string
  details?: unknown
}

const GENERIC_JOURNEY_ERROR_MESSAGE =
  'Não foi possível concluir esta etapa da inscrição agora. Tente novamente em instantes.'

function sanitizeJourneyMessage(message: string | undefined): string {
  const normalized = message?.trim() ?? ''
  if (!normalized) return GENERIC_JOURNEY_ERROR_MESSAGE

  if (
    /sqlstate|call to undefined method|undefined method|stack|trace|exception|syntax error|parameter number/i.test(
      normalized,
    )
  ) {
    return GENERIC_JOURNEY_ERROR_MESSAGE
  }

  return normalized
}

async function requestJourney<T>(
  path: string,
  method: 'POST' | 'PATCH',
  payload?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })

  const envelope = (await response.json().catch(() => null)) as JourneyEnvelope<T> | null

  if (!response.ok || !envelope?.data) {
    const message = sanitizeJourneyMessage(
      envelope?.message ||
        envelope?.errors?.find((item) => item?.message)?.message ||
        'Não foi possível atualizar sua inscrição agora.',
    )
    throw new Error(message)
  }

  return envelope.data
}

export function createJourneyStep1(payload: Record<string, unknown>) {
  return requestJourney<JourneyStep1Response>('/api/journeys/step-1', 'POST', payload)
}

export function updateJourneyStep3(journeyId: number, payload: Record<string, unknown>) {
  return requestJourney<JourneyStepProgressResponse>(`/api/journeys/${journeyId}/step-3`, 'PATCH', payload)
}

export function finalizeJourney(journeyId: number, payload?: Record<string, unknown>) {
  return requestJourney<JourneyFinalizeResponse>(`/api/journeys/${journeyId}/finalize`, 'POST', payload)
}
