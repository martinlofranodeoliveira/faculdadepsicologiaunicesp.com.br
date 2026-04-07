import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'

import { saveCourseLeadDraft } from '@/course/courseLeadDraft'
import { getCoursePath } from '@/lib/courseRoutes'
import { PRIMARY_GRADUATION_JOURNEY_COURSE_ID } from '@/lib/graduation'
import {
  fetchInstitutionContract,
  type InstitutionContractPayload,
} from '@/lib/institutionContractsClient'
import {
  createJourneyStep1,
  getPendingJourneys,
  resumeJourney,
  updateJourneyStep2,
  type JourneySnapshot,
} from '@/lib/journeyClient'
import type { PoleCityOption, PoleOption, PoleStateOption } from '@/lib/polesApi'
import { readStoredUtmParams, syncUtmParamsFromUrl } from '@/lib/utm'
import {
  readGraduationVestibularLead,
  storeGraduationVestibularLead,
  type GraduationVestibularLead,
} from '@/vestibular/graduationVestibularState'

import {
  formatPhoneMask,
  normalizeName,
  normalizePhone,
  sendLeadToCrm,
  validateEmail,
  validateFullName,
  validatePhone,
  type CourseLeadSelection,
} from '../crmLead'

type EnrollmentPopupProps = {
  isOpen: boolean
  selection: CourseLeadSelection | null
  onClose: () => void
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'
type PopupStep = 1 | 2
type PopupViewMode = 'default' | 'resume'

type FieldErrors = {
  fullName?: string
  email?: string
  phone?: string
  agreement?: string
  cpf?: string
  stateUf?: string
  city?: string
  poleId?: string
  pcd?: string
  pcdDetails?: string
}

type ResumeErrors = {
  email?: string
  agreement?: string
}

type PopupSelectOption = {
  value: string
  label: string
}

type ResolvedGraduationCourse = {
  courseId: number
  journeyCourseId: number
  courseLabel: string
  coursePath?: string
}

const DEFAULT_POST_PRICE = '18X R$ 86,00/MÊS'
const SYNTHETIC_GRADUATION_POLE_VALUE = '__synthetic_city_pole__'

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M11.5 5.5L7 10L11.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SpinnerIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function PopupSelect({ value, options, placeholder, menuLabel, disabled = false, invalid = false, onChange }: { value: string; options: PopupSelectOption[]; placeholder: string; menuLabel: string; disabled?: boolean; invalid?: boolean; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [contentStyle, setContentStyle] = useState<CSSProperties>({})
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = selectedOption?.label ?? placeholder

  useEffect(() => {
    if (!open || disabled) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const margin = 12
      const availableBelow = viewportHeight - rect.bottom - margin
      const availableAbove = rect.top - margin
      const openUpward = availableBelow < 180 && availableAbove > availableBelow
      const maxHeight = Math.max(120, Math.min(230, (openUpward ? availableAbove : availableBelow) - 6))
      const width = Math.min(rect.width, viewportWidth - margin * 2)
      const left = Math.min(Math.max(margin, rect.left), viewportWidth - width - margin)

      setContentStyle({ position: 'fixed', left, top: openUpward ? Math.max(margin, rect.top - 6) : Math.min(viewportHeight - margin, rect.bottom + 6), width, maxHeight, transform: openUpward ? 'translateY(-100%)' : 'none' })
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (rootRef.current?.contains(target) || contentRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [disabled, open])

  return (
    <div ref={rootRef} className={`lp-enroll-popup__select ${invalid ? 'is-invalid' : ''} ${disabled ? 'is-disabled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="lp-enroll-popup__select-wrapper">
        <button
          ref={triggerRef}
          type="button"
          className={`lp-enroll-popup__select-trigger ${!selectedOption ? 'is-placeholder' : ''}`}
          aria-label={menuLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          onClick={() => { if (!disabled) setOpen((current) => !current) }}
          onKeyDown={(event) => {
            if (disabled) return
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setOpen(true)
            }
            if (event.key === 'Escape') setOpen(false)
          }}
        >
          <span className="lp-enroll-popup__select-trigger-text">{displayLabel}</span>
          <span className="lp-enroll-popup__select-trigger-icon" aria-hidden="true"><ChevronDownIcon className="lp-enroll-popup__icon lp-enroll-popup__icon--chevron" /></span>
        </button>

        {open && !disabled && typeof document !== 'undefined'
          ? createPortal(
              <div ref={contentRef} className="lp-enroll-popup__select-content" style={contentStyle} role="listbox" aria-label={menuLabel}>
                {options.map((option) => (
                  <button key={option.value} type="button" role="option" aria-selected={value === option.value} className={`lp-enroll-popup__select-option ${value === option.value ? 'is-selected' : ''}`} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option.value); setOpen(false) }}>
                    {option.label}
                  </button>
                ))}
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readRecordString(record: Record<string, unknown> | undefined, keys: string[]) {
  if (!record) return undefined
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function readRecordNumber(record: Record<string, unknown> | undefined, keys: string[]) {
  if (!record) return undefined
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseInt(value, 10)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return undefined
}

function readRecordBoolean(record: Record<string, unknown> | undefined, keys: string[]) {
  if (!record) return undefined
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['1', 'true', 'sim', 'yes'].includes(normalized)) return true
      if (['0', 'false', 'nao', 'não', 'no'].includes(normalized)) return false
    }
  }
  return undefined
}

function normalizeCurrentStep(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

function normalizeGraduationCourseLabel(selection: CourseLeadSelection): string {
  const normalizedLabel = selection.courseLabel.trim()
  const cleanedLabel = normalizedLabel.replace(/\((?:semipresencial|presencial|ead)\)/gi, ' ').replace(/\b(?:semipresencial|presencial|ead)\b/gi, ' ').replace(/\s+/g, ' ').trim()
  return cleanedLabel || normalizedLabel
}

function matchesStoredLead(storedLead: GraduationVestibularLead | null, selection: CourseLeadSelection): storedLead is GraduationVestibularLead {
  if (!storedLead) return false
  if (storedLead.courseId && selection.courseId) return storedLead.courseId === selection.courseId
  if (storedLead.courseValue && selection.courseValue) return storedLead.courseValue === selection.courseValue
  return storedLead.courseLabel?.trim().toLowerCase() === normalizeGraduationCourseLabel(selection).trim().toLowerCase()
}

function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

function formatCpfMask(value: string): string {
  const digits = normalizeCpf(value)
  if (!digits) return ''
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function validateCpf(value: string): string | undefined {
  const rawDigits = value.replace(/[.\-\/\s]/g, '')
  if (!rawDigits) return 'Informe o CPF.'

  const digits = rawDigits.padStart(11, '0')
  if (digits.length !== 11) return 'Digite um CPF válido.'
  if (/^(\d)\1{10}$/.test(digits)) return 'Digite um CPF válido.'

  for (let target = 9; target < 11; target += 1) {
    let digitSum = 0

    for (let cursor = 0; cursor < target; cursor += 1) {
      digitSum += Number.parseInt(digits[cursor] ?? '0', 10) * ((target + 1) - cursor)
    }

    digitSum = ((10 * digitSum) % 11) % 10

    if (Number.parseInt(digits[target] ?? '0', 10) !== digitSum) {
      return 'Digite um CPF válido.'
    }
  }

  return undefined
}

function hasCompletedGraduationStep2(progress: {
  cpf?: string
  stateUf?: string
  city?: string
  pcd?: boolean
  pcdDetails?: string
}) {
  if (!progress.cpf?.trim()) return false
  if (!progress.stateUf?.trim()) return false
  if (!progress.city?.trim()) return false
  if (typeof progress.pcd !== 'boolean') return false
  if (progress.pcd && !progress.pcdDetails?.trim()) return false
  return true
}

function formatPoleOptionLabel(value: string): string {
  const normalized = value.trim()
  if (!normalized) return ''
  return /^polo\b/i.test(normalized) ? normalized : `Polo ${normalized}`
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
  if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) normalized = normalized.slice(1, -1).trim()
  if (!normalized) return null
  return normalized.startsWith('Bearer ') ? normalized : `Bearer ${normalized}`
}

function pickTrackingValue(source: Record<string, string>, aliases: string[], fallback = 'Não identificado'): string {
  for (const alias of aliases) {
    const normalizedAlias = alias.toLowerCase()
    const value = source[normalizedAlias]
    if (value && value.trim()) return value.trim()
  }
  return fallback
}

async function fetchJson<T>(url: string): Promise<T[]> {
  const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
  const payload = (await response.json().catch(() => null)) as { data?: { items?: T[] }; message?: string } | null
  if (!response.ok) throw new Error(payload?.message || 'Não foi possível carregar os dados agora.')
  return Array.isArray(payload?.data?.items) ? payload.data.items : []
}

async function resolveGraduationCourse(selection: CourseLeadSelection): Promise<ResolvedGraduationCourse> {
  const normalizedLabel = normalizeGraduationCourseLabel(selection)
  if (typeof selection.courseId === 'number' && selection.courseId > 0) {
    return {
      courseId: selection.courseId,
      journeyCourseId: PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
      courseLabel: normalizedLabel,
      coursePath: selection.coursePath,
    }
  }

  const response = await fetch('/api/graduation-primary-course', { method: 'GET', headers: { Accept: 'application/json' } })
  const payload = (await response.json().catch(() => null)) as { data?: { courseId?: number; journeyCourseId?: number; courseLabel?: string; coursePath?: string }; message?: string } | null
  if (!response.ok || !payload?.data?.courseId) {
    throw new Error(payload?.message || 'Não foi possível localizar o curso principal da graduação.')
  }

  return {
    courseId: payload.data.courseId,
    journeyCourseId:
      typeof payload.data.journeyCourseId === 'number' && payload.data.journeyCourseId > 0
        ? payload.data.journeyCourseId
        : PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
    courseLabel: payload.data.courseLabel?.trim() || normalizedLabel,
    coursePath: payload.data.coursePath,
  }
}

function buildGraduationResumeLead(
  snapshot: JourneySnapshot,
  selection: CourseLeadSelection,
  fallbackEmail: string,
  fallbackCourseId?: number,
  fallbackCourseLabel?: string,
  fallbackJourneyCourseId?: number,
): GraduationVestibularLead | null {
  const step1 = isRecord(snapshot.step_1) ? snapshot.step_1 : undefined
  const step2 = isRecord(snapshot.step_2) ? snapshot.step_2 : undefined
  const step3 = isRecord(snapshot.step_3) ? snapshot.step_3 : undefined
  const fullName = readRecordString(step1, ['full_name', 'nome']) ?? ''
  const email = readRecordString(step1, ['email']) ?? fallbackEmail
  if (!fullName || !email) return null

  return {
    fullName,
    email,
    phone: readRecordString(step1, ['phone', 'telefone', 'whatsapp']),
    cpf: readRecordString(step2, ['cpf']),
    stateUf: readRecordString(step2, ['estado', 'state_uf']),
    city: readRecordString(step2, ['cidade', 'city']),
    poleId: readRecordNumber(step2, ['pole_id']),
    poleName: readRecordString(step2, ['polo', 'pole_name']),
    pcd: readRecordBoolean(step2, ['pcd']),
    pcdDetails: readRecordString(step2, ['quais_necessidades', 'pcd_details']),
    journeyId: snapshot.journey_id,
    courseId: fallbackCourseId,
    journeyCourseId:
      readRecordNumber(step1, ['course_id']) ??
      fallbackJourneyCourseId ??
      PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
    courseLabel: readRecordString(step1, ['course_label', 'course_name', 'curso']) ?? fallbackCourseLabel ?? normalizeGraduationCourseLabel(selection),
    courseValue: selection.courseValue,
    currentStep: normalizeCurrentStep(snapshot.current_step),
    entryMethod: readRecordString(step3, ['entry_method']),
    presentationLetter: readRecordString(step3, ['presentation_letter']),
    essayThemeId: readRecordString(step3, ['essay_theme_id']),
    essayTitle: readRecordString(step3, ['essay_title']),
    essayText: readRecordString(step3, ['essay_text']),
    enemRegistration: readRecordString(step3, ['enem_registration', 'enem_code']),
  }
}

async function sendGraduationInscritoToCrm(input: { courseId: number; courseLabel: string; fullName: string; email: string; phone: string; cpf: string; stateUf: string; city: string; poleName?: string; pcd: 'sim' | 'nao'; pcdDetails: string }) {
  const trackedFromUrl = syncUtmParamsFromUrl(window.location.search)
  const storedTrackingParams = readStoredUtmParams()
  const trackingParams = { ...storedTrackingParams, ...trackedFromUrl }
  const empresaId = parseEnvInteger(import.meta.env.VITE_CRM_EMPRESA, 11)
  const etapaLeadGrad = parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_GRAD, 78)
  const etapaInscritoGrad = parseEnvInteger(import.meta.env.VITE_CRM_ETAPA_INSCRITO_GRAD, etapaLeadGrad)
  const funilGrad = parseEnvInteger(import.meta.env.VITE_CRM_FUNIL_GRAD, 6)
  const statusLead = parseEnvInteger(import.meta.env.VITE_CRM_STATUS_LEAD, 1)
  const poloId = parseEnvInteger(import.meta.env.VITE_CRM_POLO, 4658)
  const normalizedCpf = normalizeCpf(input.cpf)
  const normalizedPhone = normalizePhone(input.phone)
  const pcdValue = input.pcd === 'sim' ? 'Sim' : 'Não'
  const observacao = `GRADUACAO: Landing Page Faculdade de Psicologia | Inscrito | CPF: ${normalizedCpf || 'nao informado'} | Estado: ${input.stateUf || 'nao informado'} | Cidade: ${input.city || 'nao informada'} | Polo: ${input.poleName || 'sem polo'} | PCD: ${pcdValue}${input.pcd === 'sim' && input.pcdDetails.trim() ? ` | Detalhes PCD: ${input.pcdDetails.trim()}` : ''}`

  const payload = {
    aluno: 0,
    nome: input.fullName.trim(),
    email: input.email.trim(),
    telefone: normalizedPhone,
    empresa: empresaId,
    matricula: '',
    idCurso: input.courseId,
    curso: input.courseLabel.trim(),
    etapa: etapaInscritoGrad,
    cpf: normalizedCpf,
    valor: '',
    funil: funilGrad,
    status: statusLead,
    observacao,
    campanha: pickTrackingValue(trackingParams, ['campanha', 'utm_campaign']),
    midia: pickTrackingValue(trackingParams, ['midia', 'utm_medium']),
    fonte: pickTrackingValue(trackingParams, ['id_fonte_crm', 'fonte', 'utm_source'], import.meta.env.VITE_CRM_FONTE_ID ?? '33'),
    fonteTexto: import.meta.env.VITE_CRM_FONTE_TEXTO ?? 'Landing Page Faculdade de Psicologia UNICESP',
    origem: import.meta.env.VITE_CRM_ORIGEM ?? '1',
    criativo: pickTrackingValue(trackingParams, ['criativo', 'conteudo_anuncio', 'utm_content']),
    id_clique_google: pickTrackingValue(trackingParams, ['id_clique_google', 'gclid']),
    id_clique_facebbok: pickTrackingValue(trackingParams, ['id_clique_facebbok', 'id_clique_facebook', 'fbclid']),
    id_clique_microsoft: pickTrackingValue(trackingParams, ['id_clique_microsoft', 'msclkid']),
    conjunto_de_Anuncios: pickTrackingValue(trackingParams, ['conjunto_de_anuncios', 'adset_name', 'adset', 'utm_term']),
    polo: poloId,
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const bearerToken = normalizeBearerToken(import.meta.env.VITE_CRM_BEARER_TOKEN)
  if (bearerToken) headers.Authorization = bearerToken
  if (import.meta.env.VITE_CRM_API_KEY) headers['X-API-KEY'] = import.meta.env.VITE_CRM_API_KEY

  const response = await fetch(import.meta.env.VITE_CRM_LEAD_ENDPOINT ?? '/crm-api/administrativo/leads/adicionar', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error(`CRM request failed with status ${response.status}`)
}
function PostEnrollmentPopup({ isOpen, selection, onClose }: EnrollmentPopupProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Pick<FieldErrors, 'fullName' | 'email' | 'phone'>>({})
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const postSelection = selection as CourseLeadSelection
  const displayCourseLabel = postSelection.courseLabel.trim()
  const postPriceLabel = postSelection.priceLabel ?? DEFAULT_POST_PRICE

  const firstErrorMessage = useMemo(() => errors.fullName ?? errors.email ?? errors.phone ?? '', [errors])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    setFullName('')
    setEmail('')
    setPhone('')
    setErrors({})
    setSubmitStatus('idle')
    setSubmitMessage('')
  }, [isOpen, postSelection])

  if (!isOpen || !selection) return null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
    setErrors(nextErrors)

    if (nextErrors.fullName || nextErrors.email || nextErrors.phone) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    setSubmitStatus('submitting')
    setSubmitMessage('Redirecionando para a página do curso...')

    try {
      saveCourseLeadDraft({
        courseType: 'pos',
        courseValue: postSelection.courseValue,
        courseLabel: displayCourseLabel,
        courseId: postSelection.courseId ?? undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phone,
      })

      const targetPath =
        postSelection.coursePath ??
        getCoursePath({
          courseType: 'pos',
          courseValue: postSelection.courseValue,
          courseLabel: displayCourseLabel,
        })

      window.location.assign(targetPath)
    } catch (error) {
      console.error('Erro ao processar o formulário de inscrição:', error)
      setSubmitStatus('error')
      setSubmitMessage('Não foi possível continuar agora. Tente novamente em instantes.')
    }
  }

  return (
    <div className="lp-enrollment-modal" role="dialog" aria-modal="true" aria-labelledby="lp-enrollment-modal-title" onClick={onClose}>
      <div className="lp-enrollment-modal__panel" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="lp-enrollment-modal__close" aria-label="Fechar" onClick={onClose}>
          <span className="lp-enrollment-modal__close-icon" aria-hidden="true">×</span>
        </button>

        <header className="lp-enrollment-modal__top">
          <img className="lp-enrollment-modal__top-image" src="/landing/posgraduacao-presencial-psicologia-topo-popup.webp" alt="" aria-hidden="true" />
        </header>

        <div className="lp-enrollment-modal__content">
          <h2 id="lp-enrollment-modal-title" className="lp-enrollment-modal__title lp-enrollment-modal__title--sr-only">Curso: {displayCourseLabel}</h2>
          <p className="lp-enrollment-modal__subtitle lp-enrollment-modal__subtitle--post">Preencha o formulário para receber mais informações</p>

          <form className="lp-enrollment-modal__form" onSubmit={handleSubmit} noValidate>
            <input type="text" name="name" placeholder="Nome" autoComplete="name" value={fullName} onChange={(event) => setFullName(normalizeName(event.target.value))} className={`lp-enrollment-modal__input ${errors.fullName ? 'is-invalid' : ''}`} aria-invalid={errors.fullName ? 'true' : 'false'} />
            <input type="email" name="email" placeholder="Seu melhor email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={`lp-enrollment-modal__input ${errors.email ? 'is-invalid' : ''}`} aria-invalid={errors.email ? 'true' : 'false'} />
            <input type="tel" name="phone" placeholder="Telefone" autoComplete="tel" value={phone} onChange={(event) => setPhone(formatPhoneMask(event.target.value))} className={`lp-enrollment-modal__input ${errors.phone ? 'is-invalid' : ''}`} aria-invalid={errors.phone ? 'true' : 'false'} />
            <button type="submit" className="lp-enrollment-modal__submit" disabled={submitStatus === 'submitting'}>{submitStatus === 'submitting' ? 'REDIRECIONANDO...' : 'CONTINUAR'}</button>
          </form>

          {submitStatus === 'error' && firstErrorMessage ? <p className="lp-enrollment-modal__status lp-enrollment-modal__status--error">{firstErrorMessage}</p> : null}
          {submitMessage ? <p className={`lp-enrollment-modal__status ${submitStatus === 'error' ? 'lp-enrollment-modal__status--error' : ''}`}>{submitMessage}</p> : null}

          <div className="lp-enrollment-modal__summary">
            <strong className="lp-enrollment-modal__summary-title">Curso: {displayCourseLabel}</strong>
            <span className="lp-enrollment-modal__summary-price">{postPriceLabel}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GraduationEnrollmentPopup({ isOpen, selection, onClose }: EnrollmentPopupProps) {
  const [viewMode, setViewMode] = useState<PopupViewMode>('default')
  const [currentStep, setCurrentStep] = useState<PopupStep>(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [resumeEmail, setResumeEmail] = useState('')
  const [resumeAgreementAccepted, setResumeAgreementAccepted] = useState(false)
  const [resumeErrors, setResumeErrors] = useState<ResumeErrors>({})
  const [resumeMessage, setResumeMessage] = useState('')
  const [resumeLoading, setResumeLoading] = useState(false)
  const [cpf, setCpf] = useState('')
  const [journeyId, setJourneyId] = useState<number | null>(null)
  const [resolvedCourseId, setResolvedCourseId] = useState<number | null>(selection?.courseId ?? null)
  const [resolvedJourneyCourseId, setResolvedJourneyCourseId] = useState<number | null>(null)
  const [stateUf, setStateUf] = useState('')
  const [stateId, setStateId] = useState('')
  const [city, setCity] = useState('')
  const [cityId, setCityId] = useState('')
  const [poleId, setPoleId] = useState('')
  const [pcd, setPcd] = useState('')
  const [pcdDetails, setPcdDetails] = useState('')
  const [stateOptions, setStateOptions] = useState<PoleStateOption[]>([])
  const [cityOptions, setCityOptions] = useState<PoleCityOption[]>([])
  const [poleOptions, setPoleOptions] = useState<PoleOption[]>([])
  const [loadingPoles, setLoadingPoles] = useState(false)
  const [poleMessage, setPoleMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [advanceLoading, setAdvanceLoading] = useState(false)
  const [finalSubmitLoading, setFinalSubmitLoading] = useState(false)
  const [savedLead, setSavedLead] = useState<GraduationVestibularLead | null>(null)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [contractLoading, setContractLoading] = useState(false)
  const [contractError, setContractError] = useState('')
  const [contractContent, setContractContent] = useState<InstitutionContractPayload | null>(null)

  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const cpfInputRef = useRef<HTMLInputElement | null>(null)
  const resumeEmailInputRef = useRef<HTMLInputElement | null>(null)

  const normalizedCourseLabel = useMemo(() => normalizeGraduationCourseLabel(selection as CourseLeadSelection), [selection])
  const selectedPole = useMemo(() => poleOptions.find((option) => String(option.id) === poleId), [poleId, poleOptions])
  const popupPoleOptions = useMemo<PopupSelectOption[]>(() => {
    if (poleOptions.length > 0) {
      return poleOptions.map((option) => ({ value: String(option.id), label: formatPoleOptionLabel(option.name) }))
    }
    if (!cityId || !city) return []
    return [{ value: SYNTHETIC_GRADUATION_POLE_VALUE, label: formatPoleOptionLabel(city) }]
  }, [city, cityId, poleOptions])

  useEffect(() => {
    if (!isOpen || !selection) return

    const storedLead = readGraduationVestibularLead()
    const matchingStoredLead = matchesStoredLead(storedLead, selection) ? storedLead : null
    const hasSavedStep2 = matchingStoredLead ? hasCompletedGraduationStep2(matchingStoredLead) : false

    setViewMode('default')
    setCurrentStep(hasSavedStep2 ? 2 : 1)
    setFullName(matchingStoredLead?.fullName ?? '')
    setEmail(matchingStoredLead?.email ?? '')
    setPhone(matchingStoredLead?.phone ? formatPhoneMask(matchingStoredLead.phone) : '')
    setAgreementAccepted(false)
    setResumeEmail(matchingStoredLead?.email ?? '')
    setResumeAgreementAccepted(false)
    setResumeErrors({})
    setResumeMessage('')
    setResumeLoading(false)
    setCpf(matchingStoredLead?.cpf ? formatCpfMask(matchingStoredLead.cpf) : '')
    setJourneyId(matchingStoredLead?.journeyId ?? null)
    setResolvedCourseId(matchingStoredLead?.courseId ?? selection.courseId ?? null)
    setResolvedJourneyCourseId(matchingStoredLead?.journeyCourseId ?? null)
    setStateUf(matchingStoredLead?.stateUf ?? '')
    setStateId('')
    setCity(matchingStoredLead?.city ?? '')
    setCityId('')
    setPoleId(typeof matchingStoredLead?.poleId === 'number' ? String(matchingStoredLead.poleId) : '')
    setPcd(typeof matchingStoredLead?.pcd === 'boolean' ? (matchingStoredLead.pcd ? 'sim' : 'nao') : '')
    setPcdDetails(matchingStoredLead?.pcdDetails ?? '')
    setStateOptions([])
    setCityOptions([])
    setPoleOptions([])
    setLoadingPoles(false)
    setPoleMessage('')
    setErrors({})
    setSubmitStatus('idle')
    setSubmitMessage('')
    setAdvanceLoading(false)
    setFinalSubmitLoading(false)
    setSavedLead(matchingStoredLead)
    setIsContractModalOpen(false)
    setContractLoading(false)
    setContractError('')
    setContractContent(null)
  }, [isOpen, selection])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (isContractModalOpen) {
        setIsContractModalOpen(false)
        return
      }
      onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isContractModalOpen, isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    if (viewMode === 'resume') {
      window.setTimeout(() => { resumeEmailInputRef.current?.focus() }, 20)
      return
    }
    if (currentStep === 1) {
      window.setTimeout(() => { nameInputRef.current?.focus() }, 20)
      return
    }
    window.setTimeout(() => { cpfInputRef.current?.focus() }, 20)
  }, [currentStep, isOpen, viewMode])

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setLoadingPoles(true)
    setPoleMessage('')
    void fetchJson<PoleStateOption>('/api/pole-states').then((items) => {
      if (!active) return
      setStateOptions(items)
    }).catch((error) => {
      if (!active) return
      setPoleMessage(error instanceof Error ? error.message : 'Não foi possível carregar os estados.')
    }).finally(() => {
      if (active) setLoadingPoles(false)
    })
    return () => { active = false }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || stateId || !stateUf || !stateOptions.length) return
    const normalizedState = stateUf.trim().toLowerCase()
    const matchedState = stateOptions.find((option) => option.stateUf.trim().toLowerCase() === normalizedState || option.stateName.trim().toLowerCase() === normalizedState)
    if (matchedState) {
      setStateId(String(matchedState.id))
      setStateUf(matchedState.stateUf)
    }
  }, [isOpen, stateId, stateOptions, stateUf])
  useEffect(() => {
    if (!isOpen || !stateId) {
      setCityOptions([])
      setCityId('')
      if (!stateId) {
        setCity('')
        setPoleOptions([])
        setPoleId('')
      }
      return
    }

    let active = true
    setLoadingPoles(true)
    setPoleMessage('')
    void fetchJson<PoleCityOption>(`/api/pole-cities?stateId=${stateId}`).then((items) => {
      if (!active) return
      setCityOptions(items)
    }).catch((error) => {
      if (!active) return
      setPoleMessage(error instanceof Error ? error.message : 'Não foi possível carregar as cidades.')
    }).finally(() => {
      if (active) setLoadingPoles(false)
    })

    return () => { active = false }
  }, [isOpen, stateId])

  useEffect(() => {
    if (!isOpen || !city || cityId || !cityOptions.length) return
    const normalizedCity = city.trim().toLowerCase()
    const matchedCity = cityOptions.find((option) => option.name.trim().toLowerCase() === normalizedCity)
    if (matchedCity) {
      setCityId(String(matchedCity.id))
      setCity(matchedCity.name)
    }
  }, [city, cityId, cityOptions, isOpen])

  useEffect(() => {
    if (!isOpen || !cityId) {
      setPoleOptions([])
      if (!cityId) setPoleId('')
      return
    }

    let active = true
    setLoadingPoles(true)
    setPoleMessage('')
    void fetchJson<PoleOption>(`/api/poles-by-city?cityId=${cityId}`).then((items) => {
      if (!active) return
      setPoleOptions(items)
    }).catch((error) => {
      if (!active) return
      setPoleMessage(error instanceof Error ? error.message : 'Não foi possível carregar os polos.')
    }).finally(() => {
      if (active) setLoadingPoles(false)
    })

    return () => { active = false }
  }, [cityId, isOpen])

  useEffect(() => {
    if (!isOpen || !cityId || loadingPoles) return
    if (poleOptions.length > 0) {
      if (poleId === SYNTHETIC_GRADUATION_POLE_VALUE) setPoleId('')
      return
    }
    if (poleId !== SYNTHETIC_GRADUATION_POLE_VALUE) setPoleId(SYNTHETIC_GRADUATION_POLE_VALUE)
  }, [cityId, isOpen, loadingPoles, poleId, poleOptions.length])

  useEffect(() => {
    if (pcd !== 'sim' && pcdDetails) setPcdDetails('')
  }, [pcd, pcdDetails])

  if (!isOpen || !selection) return null
  const activeSelection = selection

  const firstErrorMessage = errors.fullName ?? errors.email ?? errors.phone ?? errors.agreement ?? errors.cpf ?? errors.stateUf ?? errors.city ?? errors.poleId ?? errors.pcd ?? errors.pcdDetails ?? poleMessage ?? ''
  const agreementCopy = (
    <span className="lp-enroll-popup__agreement-copy">
      {'LI E CONCORDO COM OS '}
      <a
        href="/termos-de-uso"
        className="lp-enroll-popup__agreement-button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          openContractModal()
        }}
      >
        TERMOS DO CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS.
      </a>
    </span>
  )
  const contractModal = isContractModalOpen ? (
    <div
      className="lp-enroll-popup__contract-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation()
        setIsContractModalOpen(false)
      }}
    >
      <div
        className="lp-enroll-popup__contract-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lp-enroll-popup-contract-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="lp-enroll-popup__contract-modal-header">
          <h3 id="lp-enroll-popup-contract-title">
            {contractContent?.title || 'Contrato de prestação de serviços educacionais'}
          </h3>
          <button
            type="button"
            className="lp-enroll-popup__contract-modal-close"
            aria-label="Fechar contrato"
            onClick={() => setIsContractModalOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="lp-enroll-popup__contract-modal-body">
          {contractLoading ? (
            <div className="lp-enroll-popup__contract-modal-state">
              <SpinnerIcon className="lp-enroll-popup__spinner" />
              <span>Carregando contrato...</span>
            </div>
          ) : contractError ? (
            <div className="lp-enroll-popup__contract-modal-state is-error">
              <p>{contractError}</p>
              <button type="button" onClick={() => void loadContract()}>
                Tentar novamente
              </button>
            </div>
          ) : contractContent?.html ? (
            <div
              className="lp-enroll-popup__contract-modal-content"
              dangerouslySetInnerHTML={{ __html: contractContent.html }}
            />
          ) : (
            <div className="lp-enroll-popup__contract-modal-content is-text">
              {contractContent?.text || 'Contrato não encontrado para a instituição informada.'}
            </div>
          )}
        </div>

        <div className="lp-enroll-popup__contract-modal-footer">
          <button
            type="button"
            className="lp-enroll-popup__contract-modal-confirm"
            onClick={() => setIsContractModalOpen(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  ) : null

  async function loadContract() {
    setContractLoading(true)
    setContractError('')

    try {
      const nextContract = await fetchInstitutionContract('graduation')
      setContractContent(nextContract)
    } catch (error) {
      setContractContent(null)
      setContractError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o contrato agora. Tente novamente em instantes.',
      )
    } finally {
      setContractLoading(false)
    }
  }

  function openContractModal() {
    setIsContractModalOpen(true)

    if (contractLoading) return
    if (contractContent || contractError) return

    void loadContract()
  }

  function openResumeFlow() {
    setViewMode('resume')
    setResumeEmail(savedLead?.email ?? email.trim())
    setResumeAgreementAccepted(false)
    setResumeErrors({})
    setResumeMessage('')
  }

  function closeResumeFlow() {
    setViewMode('default')
    setResumeErrors({})
    setResumeMessage('')
    setResumeAgreementAccepted(false)
  }

  function hydrateLeadIntoPopup(lead: GraduationVestibularLead) {
    setSavedLead(lead)
    setFullName(lead.fullName)
    setEmail(lead.email)
    setPhone(lead.phone ? formatPhoneMask(lead.phone) : '')
    setCpf(lead.cpf ? formatCpfMask(lead.cpf) : '')
    setJourneyId(lead.journeyId ?? null)
    setResolvedCourseId(lead.courseId ?? activeSelection.courseId ?? null)
    setResolvedJourneyCourseId(lead.journeyCourseId ?? null)
    setStateUf(lead.stateUf ?? '')
    setStateId('')
    setCity(lead.city ?? '')
    setCityId('')
    setPoleId(typeof lead.poleId === 'number' ? String(lead.poleId) : '')
    setPcd(typeof lead.pcd === 'boolean' ? (lead.pcd ? 'sim' : 'nao') : '')
    setPcdDetails(lead.pcdDetails ?? '')
    setErrors({})
    setSubmitStatus('idle')
    setSubmitMessage('')
    setViewMode('default')
    setCurrentStep(2)
  }

  async function handleResumeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: ResumeErrors = {
      email: validateEmail(resumeEmail),
      agreement: resumeAgreementAccepted ? undefined : 'Você precisa concordar com o contrato para continuar.',
    }
    setResumeErrors(nextErrors)
    setResumeMessage('')
    if (nextErrors.email || nextErrors.agreement) return

    setResumeLoading(true)

    try {
      const resolvedCourse = await resolveGraduationCourse(activeSelection)
      const normalizedEmail = resumeEmail.trim()
      const pendingResponse = await getPendingJourneys({ email: normalizedEmail })
      const graduationItems = [...(pendingResponse.items ?? [])]
        .filter((item) => (item.course_level ?? '') === 'graduacao' && item.can_continue !== false)
        .sort((left, right) => {
          const leftTime = left.last_activity_at ? Date.parse(left.last_activity_at) : 0
          const rightTime = right.last_activity_at ? Date.parse(right.last_activity_at) : 0
          return rightTime - leftTime
        })

      const matchingCourseItem = graduationItems.find(
        (item) => item.course_id === resolvedCourse.journeyCourseId,
      )
      const chosenItem = matchingCourseItem ?? graduationItems[0]
      const targetCourseId =
        (typeof chosenItem?.course_id === 'number' && chosenItem.course_id > 0
          ? chosenItem.course_id
          : undefined) ?? resolvedCourse.journeyCourseId
      if (!targetCourseId || targetCourseId <= 0) {
        throw new Error('Não encontramos uma inscrição em andamento para este e-mail.')
      }

      const snapshot = await resumeJourney({ course_id: targetCourseId, email: normalizedEmail })
      if (snapshot.can_continue === false) {
        throw new Error('Não encontramos uma inscrição em andamento para este e-mail.')
      }

      const fallbackCourseLabel = (isRecord(chosenItem?.course) ? readRecordString(chosenItem?.course as Record<string, unknown>, ['name']) : undefined) ?? resolvedCourse.courseLabel
      const lead = buildGraduationResumeLead(
        snapshot,
        activeSelection,
        normalizedEmail,
        resolvedCourse.courseId,
        fallbackCourseLabel,
        targetCourseId,
      )
      if (!lead) throw new Error('Não encontramos uma inscrição em andamento para este e-mail.')

      storeGraduationVestibularLead(lead)
      if ((lead.currentStep ?? 0) >= 3 || hasCompletedGraduationStep2(lead)) {
        window.location.assign('/graduacao/vestibular')
        return
      }

      hydrateLeadIntoPopup(lead)
    } catch (error) {
      setResumeMessage(error instanceof Error ? error.message : 'Não foi possível localizar sua inscrição agora. Tente novamente em instantes.')
    } finally {
      setResumeLoading(false)
    }
  }

  async function handleFirstStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
      agreement: agreementAccepted ? undefined : 'Você precisa concordar com o contrato para continuar.',
    }
    setErrors(nextErrors)
    if (nextErrors.fullName || nextErrors.email || nextErrors.phone || nextErrors.agreement) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    setAdvanceLoading(true)
    setSubmitStatus('submitting')
    setSubmitMessage('')

    try {
      const resolvedCourse = await resolveGraduationCourse(activeSelection)
      const canReuseSavedJourney =
        Boolean(savedLead?.journeyId) &&
        (savedLead?.journeyCourseId ?? savedLead?.courseId) === resolvedCourse.journeyCourseId &&
        savedLead?.fullName.trim().toLowerCase() === fullName.trim().toLowerCase() &&
        savedLead?.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        normalizePhone(savedLead?.phone ?? '') === normalizePhone(phone)

      await sendLeadToCrm({
        fullName,
        email,
        phone,
        selection: { ...activeSelection, courseId: resolvedCourse.courseId, courseLabel: resolvedCourse.courseLabel },
      })

      if (canReuseSavedJourney) {
        setJourneyId(savedLead?.journeyId ?? null)
        setResolvedCourseId(resolvedCourse.courseId)
        setResolvedJourneyCourseId(resolvedCourse.journeyCourseId)
        setCurrentStep(2)
        setSubmitStatus('idle')
        setSubmitMessage('')
        setErrors({})
        return
      }

      const response = await createJourneyStep1({
        course_id: resolvedCourse.journeyCourseId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: normalizePhone(phone),
      })

      const leadSnapshot: GraduationVestibularLead = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizePhone(phone),
        journeyId: response.journey_id,
        courseId: resolvedCourse.courseId,
        journeyCourseId: resolvedCourse.journeyCourseId,
        courseLabel: resolvedCourse.courseLabel,
        courseValue: activeSelection.courseValue,
        currentStep: response.current_step ?? 1,
      }

      setSavedLead(leadSnapshot)
      storeGraduationVestibularLead(leadSnapshot)
      setJourneyId(response.journey_id)
      setResolvedCourseId(resolvedCourse.courseId)
      setResolvedJourneyCourseId(resolvedCourse.journeyCourseId)
      setCurrentStep(2)
      setSubmitStatus('idle')
      setSubmitMessage('')
      setErrors({})
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Não foi possível iniciar sua inscrição agora. Tente novamente em instantes.')
    } finally {
      setAdvanceLoading(false)
    }
  }

  async function handleSecondStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      cpf: validateCpf(cpf),
      stateUf: stateUf ? undefined : 'Selecione o estado.',
      city: city ? undefined : 'Selecione a cidade.',
      poleId: loadingPoles ? 'Aguarde carregar os polos.' : poleOptions.length > 0 && !poleId ? 'Selecione o polo.' : undefined,
      pcd: pcd ? undefined : 'Informe se possui necessidades específicas.',
      pcdDetails: pcd !== 'sim' || pcdDetails.trim() ? undefined : 'Descreva a necessidade para continuar.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    if (!journeyId || !resolvedCourseId) {
      setSubmitStatus('error')
      setSubmitMessage('Não foi possível localizar sua inscrição. Reabra o formulário e tente novamente.')
      return
    }

    setFinalSubmitLoading(true)
    setSubmitStatus('submitting')
    setSubmitMessage('')

    let storedStep = 2

    try {
      try {
        const step2Response = await updateJourneyStep2(journeyId, {
          cpf: normalizeCpf(cpf),
          estado: stateUf,
          cidade: city,
          pcd: pcd === 'sim',
          quais_necessidades: pcd === 'sim' ? pcdDetails.trim() || null : null,
          pole_id: selectedPole?.id ?? null,
          polo: selectedPole?.name ?? null,
        })

        storedStep = step2Response.current_step ?? 2

        try {
          await sendGraduationInscritoToCrm({
            courseId: resolvedCourseId,
            courseLabel: normalizedCourseLabel,
            fullName,
            email,
            phone,
            cpf,
            stateUf,
            city,
            poleName: selectedPole?.name,
            pcd: pcd as 'sim' | 'nao',
            pcdDetails,
          })
        } catch (error) {
          console.warn('Não foi possível enviar a etapa de inscrito da graduação para o CRM:', error)
        }
      } catch (error) {
        console.warn('Não foi possível sincronizar a etapa 2 da graduação nesta etapa:', error)
      }

      storeGraduationVestibularLead({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizePhone(phone),
        cpf: normalizeCpf(cpf),
        stateUf,
        city,
        poleId: selectedPole?.id,
        poleName: selectedPole?.name,
        pcd: pcd === 'sim',
        pcdDetails: pcd === 'sim' ? pcdDetails.trim() || undefined : undefined,
        journeyId,
        courseId: resolvedCourseId,
        journeyCourseId: resolvedJourneyCourseId ?? undefined,
        courseLabel: normalizedCourseLabel,
        courseValue: activeSelection.courseValue,
        currentStep: storedStep,
      })

      setSubmitStatus('success')
      setSubmitMessage('Inscrição iniciada. Redirecionando para o vestibular...')
      window.location.assign('/graduacao/vestibular')
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Não foi possível enviar seus dados agora. Tente novamente em instantes.')
    } finally {
      setFinalSubmitLoading(false)
    }
  }
  return (
    <>
    <div className="lp-enroll-popup" role="dialog" aria-modal="true" aria-labelledby="lp-enroll-popup-title" onClick={onClose}>
      <div className="lp-enroll-popup__panel" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="lp-enroll-popup__close" onClick={onClose} aria-label="Fechar formulário de inscrição">
          <CloseIcon className="lp-enroll-popup__icon lp-enroll-popup__icon--close" />
        </button>

        <div className="lp-enroll-popup__promo" aria-hidden="true">
          <img
            className="lp-enroll-popup__promo-image"
            src="/landing/graduacao-presencial-psicologia-topo-popup.webp"
            alt=""
          />
        </div>

        <div className="lp-enroll-popup__content">
          {viewMode === 'default' && currentStep === 1 ? (
            <p className="lp-enroll-popup__resume">
              Já iniciou sua inscrição?{' '}
              <button type="button" className="lp-enroll-popup__resume-link" onClick={openResumeFlow}>Clique aqui para continuar</button>
            </p>
          ) : null}

          <h2 id="lp-enroll-popup-title" className="lp-enroll-popup__title">
            {viewMode === 'resume' ? 'INFORME SEU E-MAIL PARA CONTINUAR' : 'PREENCHA O FORMULÁRIO PARA SE INSCREVER'}
          </h2>

          {viewMode === 'resume' ? (
            <form className="lp-enroll-popup__form" onSubmit={handleResumeSubmit} noValidate>
              <div className="lp-enroll-popup__field-wrap">
                <input ref={resumeEmailInputRef} type="email" name="resume-email" placeholder="Email" autoComplete="email" value={resumeEmail} onChange={(event) => setResumeEmail(event.target.value)} className={resumeErrors.email ? 'is-invalid' : ''} aria-invalid={resumeErrors.email ? 'true' : 'false'} />
              </div>

              <label className={`lp-enroll-popup__agreement ${resumeErrors.agreement ? 'is-invalid' : ''}`}>
                <input type="checkbox" checked={resumeAgreementAccepted} onChange={(event) => setResumeAgreementAccepted(event.target.checked)} />
                {agreementCopy}
              </label>

              <div className="lp-enroll-popup__actions">
                <button type="button" className="lp-enroll-popup__back" onClick={closeResumeFlow}><ChevronLeftIcon className="lp-enroll-popup__icon lp-enroll-popup__icon--back" /><span>Voltar</span></button>
                <button type="submit" className="lp-enroll-popup__submit" disabled={resumeLoading}>{resumeLoading ? <SpinnerIcon className="lp-enroll-popup__spinner" /> : <span>CONTINUAR</span>}</button>
              </div>

              {resumeMessage ? <p className="lp-enroll-popup__status lp-enroll-popup__status--error">{resumeMessage}</p> : null}
            </form>
          ) : currentStep === 1 ? (
            <form className="lp-enroll-popup__form" onSubmit={handleFirstStepSubmit} noValidate>
              <div className="lp-enroll-popup__field-wrap">
                <input ref={nameInputRef} type="text" name="name" placeholder="Nome completo" autoComplete="name" value={fullName} onChange={(event) => setFullName(normalizeName(event.target.value))} className={errors.fullName ? 'is-invalid' : ''} aria-invalid={errors.fullName ? 'true' : 'false'} />
              </div>

              <div className="lp-enroll-popup__form-grid is-two-columns">
                <div className="lp-enroll-popup__field-wrap">
                  <input type="email" name="email" placeholder="Email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={errors.email ? 'is-invalid' : ''} aria-invalid={errors.email ? 'true' : 'false'} />
                </div>
                <div className="lp-enroll-popup__field-wrap">
                  <input type="tel" name="phone" placeholder="Telefone" autoComplete="tel" value={phone} onChange={(event) => setPhone(formatPhoneMask(event.target.value))} className={errors.phone ? 'is-invalid' : ''} aria-invalid={errors.phone ? 'true' : 'false'} />
                </div>
              </div>

              <label className={`lp-enroll-popup__agreement ${errors.agreement ? 'is-invalid' : ''}`}>
                <input type="checkbox" checked={agreementAccepted} onChange={(event) => setAgreementAccepted(event.target.checked)} />
                {agreementCopy}
              </label>

              <button type="submit" className="lp-enroll-popup__submit" disabled={advanceLoading}>{advanceLoading ? <SpinnerIcon className="lp-enroll-popup__spinner" /> : <span>CONTINUAR</span>}</button>

              {submitMessage ? <p className={`lp-enroll-popup__status ${submitStatus === 'error' ? 'lp-enroll-popup__status--error' : ''}`}>{submitMessage}</p> : submitStatus === 'error' && firstErrorMessage ? <p className="lp-enroll-popup__status lp-enroll-popup__status--error">{firstErrorMessage}</p> : null}
            </form>
          ) : (
            <form className="lp-enroll-popup__form" onSubmit={handleSecondStepSubmit} noValidate>
              <div className="lp-enroll-popup__form-grid lp-enroll-popup__form-grid--graduation-top">
                <div className="lp-enroll-popup__field-wrap lp-enroll-popup__field-wrap--state">
                  <PopupSelect value={stateUf} options={stateOptions.map((option) => ({ value: option.stateUf, label: option.stateUf }))} placeholder="Estado" menuLabel="Selecione o estado" invalid={Boolean(errors.stateUf)} onChange={(value) => {
                    const matchedState = stateOptions.find((option) => option.stateUf === value)
                    setStateUf(value)
                    setStateId(matchedState ? String(matchedState.id) : '')
                    setCity('')
                    setCityId('')
                    setPoleId('')
                    setErrors((currentErrors) => ({ ...currentErrors, stateUf: undefined, city: undefined, poleId: undefined }))
                  }} />
                </div>
                <div className="lp-enroll-popup__field-wrap">
                  <PopupSelect value={city} options={cityOptions.map((option) => ({ value: option.name, label: option.name }))} placeholder="Cidade" menuLabel="Selecione a cidade" disabled={!stateId || loadingPoles} invalid={Boolean(errors.city)} onChange={(value) => {
                    const matchedCity = cityOptions.find((option) => option.name === value)
                    setCity(value)
                    setCityId(matchedCity ? String(matchedCity.id) : '')
                    setPoleId('')
                    setErrors((currentErrors) => ({ ...currentErrors, city: undefined, poleId: undefined }))
                  }} />
                </div>
              </div>

              <div className="lp-enroll-popup__field-wrap">
                <PopupSelect value={poleId} options={popupPoleOptions} placeholder="Polo" menuLabel="Selecione o polo" disabled={!cityId || loadingPoles} invalid={Boolean(errors.poleId)} onChange={(value) => {
                  setPoleId(value)
                  setErrors((currentErrors) => ({ ...currentErrors, poleId: undefined }))
                }} />
              </div>

              <div className="lp-enroll-popup__field-wrap">
                <input ref={cpfInputRef} type="text" name="cpf" placeholder="CPF" autoComplete="off" maxLength={14} value={cpf} onChange={(event) => { setCpf(formatCpfMask(event.target.value)); setErrors((currentErrors) => ({ ...currentErrors, cpf: undefined })) }} className={errors.cpf ? 'is-invalid' : ''} aria-invalid={errors.cpf ? 'true' : 'false'} />
              </div>

              <div className="lp-enroll-popup__form-grid lp-enroll-popup__form-grid--graduation-bottom">
                <div className="lp-enroll-popup__field-wrap lp-enroll-popup__field-wrap--pcd">
                  <PopupSelect value={pcd} options={[{ value: 'nao', label: 'Portador de necessidades: Não' }, { value: 'sim', label: 'Portador de necessidades: Sim' }]} placeholder="Portador de necessidades" menuLabel="Selecione se possui necessidades específicas" invalid={Boolean(errors.pcd)} onChange={(value) => { setPcd(value); setErrors((currentErrors) => ({ ...currentErrors, pcd: undefined, pcdDetails: undefined })) }} />
                </div>
                <div className="lp-enroll-popup__field-wrap">
                  <input type="text" name="pcd-details" placeholder="Qual/Quais" autoComplete="off" disabled={pcd !== 'sim'} value={pcdDetails} onChange={(event) => { setPcdDetails(event.target.value); setErrors((currentErrors) => ({ ...currentErrors, pcdDetails: undefined })) }} className={errors.pcdDetails ? 'is-invalid' : ''} aria-invalid={errors.pcdDetails ? 'true' : 'false'} />
                </div>
              </div>

              <div className="lp-enroll-popup__actions">
                <button type="button" className="lp-enroll-popup__back" onClick={() => { setCurrentStep(1); setSubmitStatus('idle'); setSubmitMessage(''); setErrors({}) }}><ChevronLeftIcon className="lp-enroll-popup__icon lp-enroll-popup__icon--back" /><span>Voltar</span></button>
                <button type="submit" className="lp-enroll-popup__submit" disabled={finalSubmitLoading}>{finalSubmitLoading ? <SpinnerIcon className="lp-enroll-popup__spinner" /> : <span>INSCREVA-SE</span>}</button>
              </div>

              {submitMessage ? <p className={`lp-enroll-popup__status ${submitStatus === 'error' ? 'lp-enroll-popup__status--error' : ''}`}>{submitMessage}</p> : submitStatus === 'error' && firstErrorMessage ? <p className="lp-enroll-popup__status lp-enroll-popup__status--error">{firstErrorMessage}</p> : null}
            </form>
          )}
        </div>
      </div>
    </div>
    {contractModal}
    </>
  )
}

export function EnrollmentPopup(props: EnrollmentPopupProps) {
  if (!props.isOpen || !props.selection) return null
  if (props.selection.courseType === 'pos') return <PostEnrollmentPopup {...props} />
  return <GraduationEnrollmentPopup {...props} />
}
