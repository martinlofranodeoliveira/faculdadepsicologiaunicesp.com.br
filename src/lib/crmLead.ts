import { readStoredUtmParams, syncUtmParamsFromUrl } from '@/lib/utm'

const CRM_LEAD_ENDPOINT =
  import.meta.env.VITE_CRM_LEAD_ENDPOINT ?? '/crm-api/administrativo/leads/adicionar'
const CRM_NOT_IDENTIFIED = 'Não identificado'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const NAME_REGEX = /^[\p{L}\s.'-]+$/u

const LEGACY_COURSE_IDS: Record<string, number> = {
  'graduacao-psicologia': 0,
}

export type CourseType = 'graduacao' | 'pos'

export type CourseLeadSelection = {
  courseType: CourseType
  courseValue: string
  courseLabel: string
  courseId?: number
  coursePath?: string
  workloadLabel?: string
  priceLabel?: string
}

export type SendLeadToCrmInput = {
  fullName: string
  email: string
  phone: string
  selection: CourseLeadSelection
  stage?: 'lead' | 'inscrito'
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function formatPhoneMask(value: string): string {
  const digits = normalizePhone(value)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function normalizeName(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/^\s+/, '')
}

export function validateFullName(value: string): string | undefined {
  const normalized = value.trim()
  if (!normalized) return 'Informe seu nome completo.'
  if (normalized.length < 5) return 'Digite nome e sobrenome.'
  if (!NAME_REGEX.test(normalized)) return 'Use apenas letras no nome.'
  if (normalized.split(' ').filter(Boolean).length < 2) return 'Digite nome e sobrenome.'
  return undefined
}

export function validateEmail(value: string): string | undefined {
  const normalized = value.trim()
  if (!normalized) return 'Informe seu e-mail.'
  if (!EMAIL_REGEX.test(normalized)) return 'Digite um e-mail válido.'
  return undefined
}

export function validatePhone(value: string): string | undefined {
  const digits = normalizePhone(value)
  if (!digits) return 'Informe seu WhatsApp.'
  if (digits.length !== 10 && digits.length !== 11) {
    return 'Digite um telefone com DDD válido.'
  }
  return undefined
}

function parseEnvInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeBearerToken(token?: string): string | null {
  if (!token) return null

  let normalized = token.trim()
  if (!normalized) return null

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim()
  }

  if (!normalized) return null
  return normalized.startsWith('Bearer ') ? normalized : `Bearer ${normalized}`
}

function pickTrackingValue(
  source: Record<string, string>,
  aliases: string[],
  fallback = CRM_NOT_IDENTIFIED,
): string {
  for (const alias of aliases) {
    const normalizedAlias = alias.toLowerCase()
    const value = source[normalizedAlias]
    if (value && value.trim()) return value.trim()
  }
  return fallback
}

function getCourseId(selection: CourseLeadSelection) {
  if (typeof selection.courseId === 'number' && selection.courseId > 0) return selection.courseId
  return LEGACY_COURSE_IDS[selection.courseValue] ?? 0
}

function getPipelineStage(selection: CourseLeadSelection, stage: 'lead' | 'inscrito') {
  const isPost = selection.courseType === 'pos'
  if (isPost) {
    return stage === 'inscrito'
      ? parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_INSCRITO_POS, 78)
      : parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_POS, 78)
  }

  return stage === 'inscrito'
    ? parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_INSCRITO_GRAD, 78)
    : parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_GRAD, 78)
}

function getObservation(selection: CourseLeadSelection, stage: 'lead' | 'inscrito') {
  const workloadObservation = selection.workloadLabel?.trim()
    ? ` | Carga horária: ${selection.workloadLabel.trim()}`
    : ''
  const priceObservation = selection.priceLabel?.trim()
    ? ` | Oferta: ${selection.priceLabel.trim()}`
    : ''
  const courseScope = selection.courseType === 'pos' ? 'PÓS-GRADUAÇÃO' : 'GRADUAÇÃO'
  const stageLabel = stage === 'inscrito' ? 'INSCRITO' : 'LEAD'

  return `${courseScope}: ${stageLabel} Site Estruturado Faculdade de Psicologia${workloadObservation}${priceObservation}`
}

export async function sendLeadToCrm({
  fullName,
  email,
  phone,
  selection,
  stage = 'lead',
}: SendLeadToCrmInput): Promise<void> {
  const trackedFromUrl = syncUtmParamsFromUrl(window.location.search)
  const storedTrackingParams = readStoredUtmParams()
  const trackingParams = { ...storedTrackingParams, ...trackedFromUrl }
  const isPost = selection.courseType === 'pos'

  const payload = {
    aluno: 0,
    nome: fullName.trim(),
    email: email.trim(),
    telefone: normalizePhone(phone),
    empresa: parseEnvInteger(import.meta.env.VITE_CRM_EMPRESA, 11),
    matricula: '',
    idCurso: getCourseId(selection),
    curso: selection.courseLabel.trim(),
    etapa: getPipelineStage(selection, stage),
    cpf: '',
    valor: '',
    funil: isPost
      ? parseEnvInteger(import.meta.env.VITE_CRM_FUNIL_POS, 6)
      : parseEnvInteger(import.meta.env.VITE_CRM_FUNIL_GRAD, 6),
    status: parseEnvInteger(import.meta.env.VITE_CRM_STATUS_LEAD, 1),
    observacao: getObservation(selection, stage),
    campanha: pickTrackingValue(trackingParams, ['campanha', 'utm_campaign']),
    midia: pickTrackingValue(trackingParams, ['midia', 'utm_medium']),
    fonte: pickTrackingValue(
      trackingParams,
      ['id_fonte_crm', 'fonte', 'utm_source'],
      import.meta.env.VITE_CRM_FONTE_ID ?? '33',
    ),
    fonteTexto:
      import.meta.env.VITE_CRM_FONTE_TEXTO ?? 'Site Estruturado Faculdade de Psicologia UNICESP',
    origem: import.meta.env.VITE_CRM_ORIGEM ?? '4',
    criativo: pickTrackingValue(trackingParams, ['criativo', 'conteudo_anuncio', 'utm_content']),
    id_clique_google: pickTrackingValue(trackingParams, ['id_clique_google', 'gclid']),
    id_clique_facebbok: pickTrackingValue(trackingParams, [
      'id_clique_facebbok',
      'id_clique_facebook',
      'fbclid',
    ]),
    id_clique_microsoft: pickTrackingValue(trackingParams, ['id_clique_microsoft', 'msclkid']),
    conjunto_de_Anuncios: pickTrackingValue(trackingParams, [
      'conjunto_de_anuncios',
      'adset_name',
      'adset',
      'utm_term',
    ]),
    polo: parseEnvInteger(import.meta.env.VITE_CRM_POLO, 4658),
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const bearerToken = normalizeBearerToken(import.meta.env.VITE_CRM_BEARER_TOKEN)
  if (bearerToken) {
    headers.Authorization = bearerToken
  }

  if (import.meta.env.VITE_CRM_API_KEY) {
    headers['X-API-KEY'] = import.meta.env.VITE_CRM_API_KEY
  }

  const response = await fetch(CRM_LEAD_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`CRM request failed with status ${response.status}`)
  }
}
