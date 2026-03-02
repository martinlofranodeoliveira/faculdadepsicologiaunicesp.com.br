import { readStoredUtmParams, syncUtmParamsFromUrl } from '@/lib/utm'

const CRM_LEAD_ENDPOINT =
  import.meta.env.VITE_CRM_LEAD_ENDPOINT ?? '/crm-api/administrativo/leads/adicionar'
const CRM_NOT_IDENTIFIED = 'Não identificado'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const NAME_REGEX = /^[\p{L}\s.'-]+$/u

const GRADUATION_CRM_COURSE_IDS: Record<string, number> = {
  'graduacao-administracao': 1,
  'graduacao-analise-desenvolvimento-sistemas': 6,
  'graduacao-gestao-recursos-humanos': 5,
  'graduacao-gestao-tecnologia-informacao': 4,
  'graduacao-pedagogia': 2,
  'graduacao-negocios-imobiliarios': 3,
  'graduacao-logistica': 7,
  'graduacao-processos-gerenciais': 8,
  'graduacao-marketing': 9,
  'graduacao-ciencias-contabeis': 11,
  'graduacao-gestao-comercial': 12,
  'graduacao-seguranca-publica': 15,
  'graduacao-gestao-publica': 14,
  'graduacao-servico-social': 16,
  'graduacao-gestao-financeira': 13,
  'graduacao-psicologia': 0,
  'graduacao-enfermagem': 0,
}

export type CourseType = 'graduacao' | 'pos'

export type CourseLeadSelection = {
  courseType: CourseType
  courseValue: string
  courseLabel: string
  courseId?: number
}

export type SendLeadToCrmInput = {
  fullName: string
  email: string
  phone: string
  selection: CourseLeadSelection
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
  if (!digits) return 'Informe seu telefone.'
  if (digits.length !== 10 && digits.length !== 11) {
    return 'Digite um telefone com DDD válido.'
  }
  return undefined
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

function parseEnvInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getGraduationCourseId(courseValue: string): number {
  return GRADUATION_CRM_COURSE_IDS[courseValue] ?? 0
}

function isPostGraduationCourse(courseValue: string): boolean {
  return courseValue.toLowerCase().startsWith('pos-')
}

export async function sendLeadToCrm({
  fullName,
  email,
  phone,
  selection,
}: SendLeadToCrmInput): Promise<void> {
  const trackedFromUrl = syncUtmParamsFromUrl(window.location.search)
  const storedTrackingParams = readStoredUtmParams()
  const trackingParams = { ...storedTrackingParams, ...trackedFromUrl }
  const phoneDigits = normalizePhone(phone)
  const isPostGraduation =
    selection.courseType === 'pos' || isPostGraduationCourse(selection.courseValue)
  const empresaId = parseEnvInteger(import.meta.env.VITE_CRM_EMPRESA, 11)
  const etapaGrad = parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_GRAD, 50)
  const etapaPos = parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_POS, 50)
  const funilGrad = parseEnvInteger(import.meta.env.VITE_CRM_FUNIL_GRAD, 5)
  const funilPos = parseEnvInteger(import.meta.env.VITE_CRM_FUNIL_POS, 5)
  const statusLead = parseEnvInteger(import.meta.env.VITE_CRM_STATUS_LEAD, 1)
  const poloId = parseEnvInteger(import.meta.env.VITE_CRM_POLO, 4658)
  const gradCourseId = getGraduationCourseId(selection.courseValue)
  const postCourseId = selection.courseId ?? 0
  const courseLabel = selection.courseLabel.trim()

  const payload = {
    aluno: 0,
    nome: fullName.trim(),
    email: email.trim(),
    telefone: phoneDigits,
    empresa: empresaId,
    matricula: '',
    idCurso: isPostGraduation ? postCourseId : gradCourseId,
    curso: courseLabel,
    etapa: isPostGraduation ? etapaPos : etapaGrad,
    cpf: '',
    valor: '',
    funil: isPostGraduation ? funilPos : funilGrad,
    status: statusLead,
    observacao: isPostGraduation
      ? 'PÓS-GRADUAÇÃO: Lead Landing Page Faculdade de Psicologia'
      : 'GRADUAÇÃO: Lead Landing Page Faculdade de Psicologia',
    campanha: pickTrackingValue(trackingParams, ['campanha', 'utm_campaign']),
    midia: pickTrackingValue(trackingParams, ['midia', 'utm_medium']),
    fonte: isPostGraduation
      ? '33'
      : pickTrackingValue(
          trackingParams,
          ['id_fonte_crm', 'fonte', 'utm_source'],
          import.meta.env.VITE_CRM_FONTE_ID ?? '33',
        ),
    fonteTexto: import.meta.env.VITE_CRM_FONTE_TEXTO ?? 'Landing Page Faculdade de Psicologia UNICESP',
    origem: import.meta.env.VITE_CRM_ORIGEM ?? '1',
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
    polo: poloId,
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
