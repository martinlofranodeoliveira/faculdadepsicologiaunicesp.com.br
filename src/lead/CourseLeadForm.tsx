import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

import {
  clearCourseLeadDraft,
  matchesCourseLeadDraft,
  readCourseLeadDraft,
  saveCourseLeadDraft,
} from '@/course/courseLeadDraft'
import {
  clearJourneyProgress,
  matchesJourneyProgress,
  readJourneyProgress,
  saveJourneyProgress,
  type StoredJourneyProgress,
} from '@/course/journeyProgress'
import type { CatalogPriceItem } from '@/lib/catalogApi'
import { getCoursePath } from '@/lib/courseRoutes'
import { PRIMARY_GRADUATION_JOURNEY_COURSE_ID } from '@/lib/graduation'
import {
  fetchInstitutionContract,
  type InstitutionContractPayload,
  type InstitutionContractType,
} from '@/lib/institutionContractsClient'
import {
  createJourneyStep1,
  finalizeJourney,
  getPendingJourneys,
  resumeJourney,
  updateJourneyStep2,
  type JourneyPendingItem,
  type JourneySnapshot,
} from '@/lib/journeyClient'
import {
  formatPhoneMask,
  normalizeName,
  normalizePhone,
  sendLeadToCrm,
  validateEmail,
  validateFullName,
  validatePhone,
  type CourseLeadSelection,
} from '@/lib/crmLead'
import {
  resolveRegulatoryBodyDisplayLabel,
  resolveRegulatoryBodySupportingText,
} from '@/lib/regulatoryBody'
import { storePostThankYouLead } from '@/thankyou/postThankYouState'
import { storeGraduationVestibularLead } from '@/vestibular/graduationVestibularState'

type Props = {
  selection: CourseLeadSelection
  institutionSlug?: string
  dark?: boolean
  image?: string
  pixText?: string
  workloadOptions?: string[]
  priceItems?: CatalogPriceItem[]
  durationText?: string
  oldInstallmentPrice?: string
  regulatoryBodyId?: number | null
  regulatoryBodyName?: string
  regulatoryBodyComplement?: string
}

type FieldErrors = {
  fullName?: string
  email?: string
  phone?: string
  agreement?: string
  workload?: string
  cpf?: string
  paymentPlan?: string
}

type ResumeFieldErrors = {
  email?: string
  agreement?: string
  courseId?: string
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'
type ResumeMode = 'default' | 'lookup' | 'select'

type SelectOption = {
  value: string
  label: string
}

type PaymentPlanOption = {
  value: string
  label: string
  pricingId?: number
  amountCents: number
  installmentsMax: number
}

type PaymentPlanGroup = {
  value: string
  label: string
  workloadVariantId?: number
  totalHours: number
  pricingId?: number | null
  currentInstallmentText: string
  oldInstallmentText: string
  pixText: string
  options: PaymentPlanOption[]
}

type ResumeCourseRoute = {
  courseId: number
  path: string
  title: string
  courseLabel: string
  courseValue?: string
}

type ResumeCourseOption = {
  journeyId: number
  journeyUuid?: string
  courseId: number
  courseLabel: string
  courseValue?: string
  displayTitle: string
  path: string
  currentStep: number
  canContinue: boolean
  status?: string | null
  fullName: string
  email: string
  phone: string
  workloadVariantId?: number
  workloadLabel?: string
  cpf?: string
  pricingId?: number
  paymentPlanLabel?: string
}

type CourseFormSelectProps = {
  value: string
  options: SelectOption[]
  placeholder: string
  menuLabel: string
  disabled?: boolean
  invalid?: boolean
  onChange: (value: string) => void
}

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

function SpinnerIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6.25V10.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="13.3" r="0.9" fill="currentColor" />
    </svg>
  )
}

function CourseFormSelect({
  value,
  options,
  placeholder,
  menuLabel,
  disabled = false,
  invalid = false,
  onChange,
}: CourseFormSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        setOpen(false)
      }}
    >
      <button
        type="button"
        aria-label={menuLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        disabled={disabled}
        className={[
          'flex h-[50px] w-full items-center justify-between rounded-[8px] border bg-[#eeeeee] px-3 text-left font-["Liberation_Sans"] text-[16px] leading-[20px] text-black outline-none transition',
          invalid ? 'border-[#d53030]' : 'border-[rgba(0,0,0,0.25)]',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-[#066aff] focus:border-[#066aff]',
          !selectedOption ? 'text-black/80' : '',
        ].join(' ')}
        onClick={() => {
          if (disabled) return
          setOpen((current) => !current)
        }}
      >
        <span className="truncate pr-4">{selectedOption?.label ?? placeholder}</span>
        <ChevronDownIcon className={['h-4 w-4 shrink-0 text-[#0f2e62] transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && !disabled ? (
        <div role="listbox" aria-label={menuLabel} className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[14px] border border-[rgba(0,0,0,0.12)] bg-white shadow-[0_20px_50px_rgba(15,46,98,0.18)]">
          <div className="max-h-64 overflow-y-auto py-2">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    'flex w-full items-center justify-between px-4 py-3 text-left font-["Liberation_Sans"] text-[15px] text-[#0b111f] transition',
                    isSelected ? 'bg-[#edf4ff] font-semibold text-[#14418d]' : 'hover:bg-[#f5f7fb]',
                  ].join(' ')}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <span className="pr-4">{option.label}</span>
                  {isSelected ? <span className="text-[#14418d]">✓</span> : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function canUseJourney(selection: CourseLeadSelection, institutionSlug?: string) {
  if (selection.courseType !== 'graduacao') return false
  if (institutionSlug === 'fallback') return false
  return Boolean(selection.courseId && selection.courseId > 0)
}

function normalizeWorkloadKey(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function normalizeWorkloadText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\bhoras?\b/gi, 'h').replace(/[().]/g, ' ').replace(/\bsem pratica\b/gi, ' ').replace(/\bcom pratica\b/gi, ' ').replace(/\s+/g, ' ').toLowerCase().trim()
}

function extractWorkloadHours(value: string): number[] {
  return [...new Set((value.match(/\d+/g) ?? []).map((item) => Number.parseInt(item, 10)).filter(Number.isFinite))]
}

function parseHours(value: string) {
  const match = value.match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

function normalizeCurrentStep(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}
function normalizePriceLabel(
  value: string,
  options?: {
    includeDeAfterInstallments?: boolean
  },
) {
  const normalized = value.replace(/\s+/g, ' ').replace(/R\$/gi, 'R$ ').replace(/\s+\/\s*M[ÊE]S/gi, '/MÊS').replace(/\/M[ÊE]S/gi, '/MÊS').trim()
  if (!normalized) return ''

  const withoutLeadingDe = normalized.replace(/^(\d+\s*x?)\s+de\s+/i, '$1 ').trim()
  const withInstallments = withoutLeadingDe.replace(/^(\d+\s*x?)\s*/i, (_match, installments: string) => {
    const base = installments.toUpperCase().replace(/\s+/g, '')
    return options?.includeDeAfterInstallments ? `${base} DE ` : `${base} `
  })

  return withInstallments.replace(/\s{2,}/g, ' ').trim().toUpperCase()
}

function formatCurrencyBrl(amountCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountCents / 100).toUpperCase()
}

function formatPaymentPlanAmountLabel(amountCents: number, installmentsMax: number) {
  const installments = installmentsMax > 0 ? installmentsMax : 18

  if (installments <= 1) {
    return `${installments}X ${formatCurrencyBrl(amountCents)}`
  }

  return `${installments}X ${formatCurrencyBrl(amountCents)}/MÊS`
}

function formatInstallmentPriceLabel(amountCents: number, installmentsMax: number) {
  return formatPaymentPlanAmountLabel(amountCents, installmentsMax)
}

function formatMarketingInstallmentPriceLabel(amountCents: number, installmentsMax: number) {
  return formatPaymentPlanAmountLabel(amountCents, installmentsMax)
}

function getPostOldInstallmentAmountCents(currentMonthlyAmountCents: number) {
  if (!currentMonthlyAmountCents) return 0

  return Math.ceil(currentMonthlyAmountCents / (1 - 0.738) / 100) * 100
}

function formatOldInstallmentPriceLabel(amountCents: number, installmentsMax: number) {
  const oldAmountCents = getPostOldInstallmentAmountCents(amountCents)
  if (!oldAmountCents) return ''

  const installments = installmentsMax > 0 ? installmentsMax : 18
  return `${installments}X ${formatCurrencyBrl(oldAmountCents)}/MÊS`
}

function normalizeMarketingPriceLabel(value?: string) {
  const normalized = normalizePriceLabel(value || '')
  if (!normalized) return ''
  if (/\/M[ÊE]S\b/i.test(normalized)) return normalized
  return /^\d+\s*X\b/i.test(normalized) ? `${normalized}/MÊS` : normalized
}

function getPreferredPaymentGroupPricingItem(items: CatalogPriceItem[]) {
  const recurringItems = items.filter((item) => item.installmentsMax > 1 && item.amountCents > 0)

  if (!recurringItems.length) {
    return items.find((item) => item.amountCents > 0) ?? null
  }

  const exactPreferredItem = recurringItems.find((item) => item.installmentsMax === 18)
  if (exactPreferredItem) return exactPreferredItem

  return [...recurringItems].sort((left, right) => {
    if (left.installmentsMax !== right.installmentsMax) {
      return right.installmentsMax - left.installmentsMax
    }

    if (left.amountCents !== right.amountCents) {
      return left.amountCents - right.amountCents
    }

    return left.id - right.id
  })[0] ?? null
}

function resolvePaymentGroupCurrentInstallmentText(
  items: CatalogPriceItem[],
  fallbackPriceLabel?: string,
) {
  const preferredItem = getPreferredPaymentGroupPricingItem(items)

  if (preferredItem?.amountCents) {
    return formatMarketingInstallmentPriceLabel(
      preferredItem.amountCents,
      preferredItem.installmentsMax,
    )
  }

  return normalizeMarketingPriceLabel(fallbackPriceLabel)
}

function resolvePaymentGroupOldInstallmentText(items: CatalogPriceItem[]) {
  const preferredItem = getPreferredPaymentGroupPricingItem(items)

  if (!preferredItem?.amountCents) return ''

  return formatOldInstallmentPriceLabel(preferredItem.amountCents, preferredItem.installmentsMax)
}

function formatPixText(amountCents: number) {
  return amountCents > 0 ? `*À vista no PIX: ${formatCurrencyBrl(amountCents)}` : ''
}

function resolvePaymentGroupPixText(items: CatalogPriceItem[]) {
  const singleInstallmentPixItem = items.find(
    (item) => item.installmentsMax === 1 && (item.pixAmountCents ?? 0) > 0,
  )
  if ((singleInstallmentPixItem?.pixAmountCents ?? 0) > 0) {
    return formatPixText(singleInstallmentPixItem?.pixAmountCents ?? 0)
  }

  const preferredPricingItem = getPreferredPaymentGroupPricingItem(items)
  if ((preferredPricingItem?.pixAmountCents ?? 0) > 0) {
    return formatPixText(preferredPricingItem?.pixAmountCents ?? 0)
  }

  const firstPixItem = items.find((item) => (item.pixAmountCents ?? 0) > 0)
  if ((firstPixItem?.pixAmountCents ?? 0) > 0) {
    return formatPixText(firstPixItem?.pixAmountCents ?? 0)
  }

  return ''
}

function resolvePaymentPlanOptionLabel(item: CatalogPriceItem) {
  const normalizedApiLabel = normalizePriceLabel(item.paymentPlanName || '')
  if (normalizedApiLabel) return normalizedApiLabel
  return formatInstallmentPriceLabel(item.amountCents, item.installmentsMax)
}

function findExistingPaymentPlanGroupKey(
  groupMap: Map<string, PaymentPlanGroup>,
  label: string,
  totalHours: number,
  workloadVariantId?: number,
) {
  const normalizedLabel = normalizeWorkloadText(label)

  for (const [key, group] of groupMap.entries()) {
    if (workloadVariantId && group.workloadVariantId === workloadVariantId) return key
    if (normalizedLabel && normalizeWorkloadText(group.label) === normalizedLabel) return key
    if (totalHours > 0 && group.totalHours === totalHours) return key
  }

  return null
}

function buildPaymentPlanGroups(
  workloadOptions: string[] = [],
  priceItems: CatalogPriceItem[] = [],
  fallbackPriceLabel?: string,
) {
  const groupMap = new Map<string, PaymentPlanGroup & { items: CatalogPriceItem[] }>()
  const shouldCreateFallbackWorkloadGroups = priceItems.length === 0

  for (const item of priceItems) {
    const label = item.workloadName.trim() || (item.totalHours ? `${item.totalHours} Horas` : '')
    if (!label) continue

    const totalHours = item.totalHours || parseHours(label)
    const existingKey = findExistingPaymentPlanGroupKey(
      groupMap,
      label,
      totalHours,
      item.workloadVariantId ?? undefined,
    )
    const key = existingKey || (item.workloadVariantId ? String(item.workloadVariantId) : normalizeWorkloadKey(label))
    const currentGroup = groupMap.get(key)
    const nextGroup: PaymentPlanGroup & { items: CatalogPriceItem[] } = currentGroup ?? {
      value: key,
      label,
      workloadVariantId: item.workloadVariantId ?? undefined,
      totalHours,
      pricingId: null,
      currentInstallmentText: '',
      oldInstallmentText: '',
      pixText: '',
      options: [],
      items: [],
    }

    if (!currentGroup) {
      groupMap.set(key, nextGroup)
    }

    if (
      !nextGroup.items.some(
        (existingItem) =>
          existingItem.id === item.id &&
          existingItem.workloadVariantId === item.workloadVariantId &&
          existingItem.installmentsMax === item.installmentsMax &&
          existingItem.amountCents === item.amountCents,
      )
    ) {
      nextGroup.items.push(item)
    }

    if (
      !nextGroup.options.some(
        (option) =>
          option.pricingId === item.id ||
          (option.amountCents === item.amountCents && option.installmentsMax === item.installmentsMax),
      )
    ) {
      nextGroup.options.push({
        value: String(item.id),
        label: resolvePaymentPlanOptionLabel(item),
        pricingId: item.id,
        amountCents: item.amountCents,
        installmentsMax: item.installmentsMax,
      })
    }
  }

  if (shouldCreateFallbackWorkloadGroups) {
    for (const option of workloadOptions) {
      const label = option.trim()
      if (!label) continue

      const totalHours = parseHours(label)
      const existingKey = findExistingPaymentPlanGroupKey(groupMap, label, totalHours)
      if (existingKey) continue

      const key = normalizeWorkloadKey(label)
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          value: key,
          label,
          totalHours,
          pricingId: null,
          currentInstallmentText: '',
          oldInstallmentText: '',
          pixText: '',
          options: fallbackPriceLabel
            ? [
                {
                  value: `${key}-fallback`,
                  label: normalizePriceLabel(fallbackPriceLabel, { includeDeAfterInstallments: true }),
                  amountCents: 0,
                  installmentsMax: 18,
                },
              ]
            : [],
          items: [],
        })
      }
    }
  }

  return [...groupMap.values()]
    .map((group) => {
      const sortedItems = [...group.items].sort((left, right) => {
        if (left.installmentsMax !== right.installmentsMax) {
          return left.installmentsMax - right.installmentsMax
        }

        return left.amountCents - right.amountCents
      })
      const sortedOptions = [...group.options].sort(
        (left, right) => left.amountCents - right.amountCents || left.installmentsMax - right.installmentsMax,
      )
      const preferredPricingItem = getPreferredPaymentGroupPricingItem(sortedItems)

      return {
        value: group.value,
        label: group.label,
        workloadVariantId: group.workloadVariantId,
        totalHours: group.totalHours,
        pricingId: preferredPricingItem?.id ?? sortedOptions[0]?.pricingId ?? null,
        currentInstallmentText: resolvePaymentGroupCurrentInstallmentText(
          sortedItems,
          fallbackPriceLabel,
        ),
        oldInstallmentText: resolvePaymentGroupOldInstallmentText(sortedItems),
        pixText: resolvePaymentGroupPixText(sortedItems),
        options: sortedOptions,
      }
    })
    .sort((left, right) => left.totalHours - right.totalHours || left.label.localeCompare(right.label))
}

function findMatchingPaymentPlanGroup(
  groups: PaymentPlanGroup[],
  progress: Pick<StoredJourneyProgress, 'workloadVariantId' | 'workloadLabel'>,
) {
  if (progress.workloadVariantId) {
    const matchByVariant = groups.find((group) => group.workloadVariantId === progress.workloadVariantId)
    if (matchByVariant) return matchByVariant
  }

  if (progress.workloadLabel?.trim()) {
    const normalizedLabel = normalizeWorkloadText(progress.workloadLabel)
    const matchByLabel = groups.find((group) => normalizeWorkloadText(group.label) === normalizedLabel)
    if (matchByLabel) return matchByLabel

    const hours = extractWorkloadHours(progress.workloadLabel)
    if (hours.length) {
      const matchByHours = groups.find((group) => hours.includes(group.totalHours))
      if (matchByHours) return matchByHours
    }
  }

  return groups.length === 1 ? groups[0] : null
}

function resolveCoverImage(image?: string) {
  const normalizedImage = image?.trim() ?? ''
  return normalizedImage || '/course/image_fx_19_1.webp'
}

function resolvePixMessage(pixText?: string) {
  return pixText?.trim() ?? ''
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function formatCpfMask(value: string) {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function buildResumeOption(
  snapshot: JourneySnapshot | JourneyPendingItem,
  courseType: CourseLeadSelection['courseType'],
  fallbackCourseId: number | undefined,
  fallbackCourseName: string | undefined,
  fallbackEmail: string,
): ResumeCourseOption | null {
  const step1 = isRecord(snapshot.step_1) ? snapshot.step_1 : undefined
  const step2 = isRecord(snapshot.step_2) ? snapshot.step_2 : undefined
  const pendingItem = snapshot as JourneyPendingItem

  const courseId =
    readRecordNumber(step1, ['course_id']) ??
    (typeof pendingItem.course_id === 'number' ? pendingItem.course_id : undefined) ??
    fallbackCourseId

  if (!courseId || courseId <= 0) return null

  const rawCourseName =
    (isRecord(pendingItem.course) ? readRecordString(pendingItem.course as Record<string, unknown>, ['name']) : undefined) ||
    fallbackCourseName ||
    `Curso ${courseId}`

  return {
    journeyId: snapshot.journey_id,
    journeyUuid: snapshot.journey_uuid,
    courseId,
    courseLabel: rawCourseName,
    displayTitle: rawCourseName,
    path: getCoursePath({ courseType, courseLabel: rawCourseName }),
    currentStep: normalizeCurrentStep(snapshot.current_step),
    canContinue: snapshot.can_continue !== false,
    status: snapshot.status ?? null,
    fullName: readRecordString(step1, ['full_name', 'nome']) || '',
    email: readRecordString(step1, ['email']) || fallbackEmail,
    phone: readRecordString(step1, ['phone', 'whatsapp']) || '',
    workloadVariantId: readRecordNumber(step2, ['workload_variant_id']) ?? readRecordNumber(step1, ['workload_variant_id']),
    workloadLabel: readRecordString(step2, ['workload_label', 'workload_name']) ?? readRecordString(step1, ['workload_label', 'workload_name']) ?? (() => {
      const workloadVariant = pendingItem.workload_variant
      if (!isRecord(workloadVariant)) return undefined
      const totalHours = readRecordNumber(workloadVariant as Record<string, unknown>, ['total_hours'])
      if (totalHours && totalHours > 0) return `${totalHours} Horas`
      return readRecordString(workloadVariant as Record<string, unknown>, ['name'])
    })(),
    cpf: readRecordString(step2, ['cpf']),
    pricingId: readRecordNumber(step2, ['pricing_id']),
    paymentPlanLabel: readRecordString(step2, ['payment_plan_label']),
  }
}

async function fetchResumeCourseRoutes(
  courseType: CourseLeadSelection['courseType'],
  courseIds: number[],
): Promise<Map<number, ResumeCourseRoute>> {
  const uniqueIds = [...new Set(courseIds.filter((value) => Number.isInteger(value) && value > 0))]
  if (!uniqueIds.length) return new Map()

  const response = await fetch('/api/course-routes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ courseType, courseIds: uniqueIds }),
  })

  const payload = (await response.json().catch(() => null)) as { data?: { items?: ResumeCourseRoute[] }; message?: string } | null
  if (!response.ok) {
    throw new Error(payload?.message || 'Não foi possível localizar os cursos da inscrição.')
  }

  const items = Array.isArray(payload?.data?.items) ? payload.data.items : []
  return new Map(items.map((item) => [item.courseId, item]))
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-[12px] font-medium text-[#d53030]">{message}</p>
}

function PostInfoRow({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  const content = (
    <>
      <AlertIcon className="h-[21px] w-[21px] shrink-0 text-black" />
      <span className="font-['Liberation_Sans'] underline underline-offset-2">{children}</span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className="flex items-center gap-[7px] text-[12px] leading-[20px] text-[#066aff]"
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  return <div className="flex items-center gap-[7px] text-[12px] leading-[20px] text-[#066aff]">{content}</div>
}

function parseMonthlyAmountFromLabel(value: string) {
  const match = value.match(/R\$\s*([\d.]+,\d{2})/i)
  if (!match) return null
  return Number.parseFloat(match[1].replace(/\./g, '').replace(',', '.'))
}

function formatDiscountPercent(oldPriceLabel?: string, currentPriceLabel?: string) {
  const oldAmount = parseMonthlyAmountFromLabel(oldPriceLabel ?? '')
  const currentAmount = parseMonthlyAmountFromLabel(currentPriceLabel ?? '')
  if (!oldAmount || !currentAmount || oldAmount <= currentAmount) return null

  const discount = ((oldAmount - currentAmount) / oldAmount) * 100
  return String(Math.floor(discount))
}

function PostPriceCard({
  priceLabel,
  pixMessage,
  oldPriceLabel,
}: {
  priceLabel: string
  pixMessage: string
  oldPriceLabel?: string
}) {
  const discountPercent = formatDiscountPercent(oldPriceLabel, priceLabel)

  return (
    <div className="mt-[4px]">
      <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:gap-[16px]">
        <div className="flex h-[59px] w-full max-w-[195px] items-center justify-between overflow-hidden rounded-[8px] bg-[#04930e] px-[12px] py-[6px] text-white">
          <div className="w-[46px] font-['Kumbh_Sans'] text-[16px] font-black leading-[1.05]">
            <div>{discountPercent ? `${discountPercent}%` : 'Oferta'}</div>
            <div className="font-light uppercase">{discountPercent ? 'OFF' : 'Ativa'}</div>
          </div>
          <div className="h-[26px] w-px bg-white/45" />
          <div className="pr-1 font-['Kumbh_Sans'] text-[16px] leading-[1.15]">
            <strong className="block font-extrabold">Desconto</strong>
            <span className="font-normal">Pontualidade</span>
          </div>
        </div>

        <div className="flex-1 font-['Kumbh_Sans'] text-[#0b111f]">
          {oldPriceLabel ? (
            <p className="text-[14px] font-normal leading-[1.14] text-black line-through">{oldPriceLabel}</p>
          ) : null}
          <p className="text-[22px] font-normal leading-[1.14] text-black">
            <span>Por: </span>
            <span className="font-bold">{priceLabel}</span>
          </p>
          {pixMessage ? (
            <p className="mt-[2px] text-[14px] font-medium leading-[1.14] text-black/50">{pixMessage}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export function CourseLeadForm({
  selection,
  institutionSlug,
  dark: _dark = false,
  image,
  pixText: _pixText,
  workloadOptions = [],
  priceItems = [],
  oldInstallmentPrice,
  regulatoryBodyName = '',
  regulatoryBodyComplement = '',
}: Props) {
  const isGraduation = selection.courseType === 'graduacao'
  const currentCoursePath = selection.coursePath || (typeof window !== 'undefined' ? window.location.pathname : '')
  const courseCoverImage = resolveCoverImage(image)
  const paymentPlanGroups = buildPaymentPlanGroups(
    workloadOptions,
    priceItems,
    selection.priceLabel,
  )
  const workloadSelectOptions = paymentPlanGroups.map((group) => ({ value: group.value, label: group.label }))
  const initialWorkloadValue = paymentPlanGroups[0]?.value ?? ''
  const initialPaymentPlanValue = paymentPlanGroups[0]?.options[0]?.value ?? ''

  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [cpf, setCpf] = useState('')
  const [selectedWorkloadValue, setSelectedWorkloadValue] = useState(initialWorkloadValue)
  const [selectedPaymentPlanValue, setSelectedPaymentPlanValue] = useState(initialPaymentPlanValue)
  const [voucherOpen, setVoucherOpen] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [advanceLoading, setAdvanceLoading] = useState(false)
  const [crmLeadSubmitted, setCrmLeadSubmitted] = useState(false)
  const [crmInscritoSubmitted, setCrmInscritoSubmitted] = useState(false)
  const [resumeMode, setResumeMode] = useState<ResumeMode>('default')
  const [resumeEmail, setResumeEmail] = useState('')
  const [resumeAgreementAccepted, setResumeAgreementAccepted] = useState(false)
  const [resumeErrors, setResumeErrors] = useState<ResumeFieldErrors>({})
  const [resumeLoading, setResumeLoading] = useState(false)
  const [resumeMessage, setResumeMessage] = useState('')
  const [resumeOptions, setResumeOptions] = useState<ResumeCourseOption[]>([])
  const [selectedResumeJourneyId, setSelectedResumeJourneyId] = useState('')
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false)
  const [contractLoading, setContractLoading] = useState(false)
  const [contractError, setContractError] = useState('')
  const [contractContent, setContractContent] = useState<InstitutionContractPayload | null>(null)
  const [loadedContractType, setLoadedContractType] = useState<InstitutionContractType | null>(null)

  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const cpfInputRef = useRef<HTMLInputElement | null>(null)
  const resumeEmailInputRef = useRef<HTMLInputElement | null>(null)

  const selectedWorkloadGroup = paymentPlanGroups.find((group) => group.value === selectedWorkloadValue) ?? null
  const paymentPlanSelectOptions = (selectedWorkloadGroup?.options ?? []).map((option) => ({ value: option.value, label: option.label }))
  const selectedPaymentPlan = selectedWorkloadGroup?.options.find((option) => option.value === selectedPaymentPlanValue) ?? null
  const contractType: InstitutionContractType = isGraduation ? 'graduation' : 'pos'
  const selectedPaymentPlanLabel =
    selectedPaymentPlan?.label ||
    selectedWorkloadGroup?.options[0]?.label ||
    normalizePriceLabel(selection.priceLabel || '', { includeDeAfterInstallments: true })
  const visiblePriceLabel =
    selectedWorkloadGroup?.currentInstallmentText || normalizeMarketingPriceLabel(selection.priceLabel)
  const visibleOldInstallmentPrice =
    selectedWorkloadGroup?.oldInstallmentText || oldInstallmentPrice?.trim() || ''
  const visiblePixMessage = resolvePixMessage(selectedWorkloadGroup?.pixText)
  const internshipRegulatoryBodyLabel = resolveRegulatoryBodyDisplayLabel(
    regulatoryBodyName,
    regulatoryBodyComplement,
  )
  const internshipRegulatoryBodySupportingText = resolveRegulatoryBodySupportingText(
    regulatoryBodyName,
    regulatoryBodyComplement,
    internshipRegulatoryBodyLabel,
  )
  const showInternshipInfoLink = !isGraduation && Boolean(internshipRegulatoryBodyLabel)
  const internshipWorkloadLabel =
    selectedWorkloadGroup?.label?.trim() ||
    workloadOptions[0]?.trim() ||
    'a carga horária selecionada'

  useEffect(() => {
    if (isGraduation || paymentPlanGroups.length === 0) return

    setSelectedWorkloadValue((currentValue) => {
      if (paymentPlanGroups.some((group) => group.value === currentValue)) return currentValue
      return paymentPlanGroups[0].value
    })
  }, [isGraduation, paymentPlanGroups])

  useEffect(() => {
    if (isGraduation) return

    setSelectedPaymentPlanValue((currentValue) => {
      const options = selectedWorkloadGroup?.options ?? []
      if (!options.length) return ''
      if (options.some((option) => option.value === currentValue)) return currentValue
      return options[0].value
    })
  }, [isGraduation, selectedWorkloadGroup])

  useEffect(() => {
    const draft = readCourseLeadDraft()
    const storedJourney = readJourneyProgress()
    const matchesCurrentDraft = draft && matchesCourseLeadDraft(draft, {
      courseType: selection.courseType,
      courseId: selection.courseId,
      courseValue: selection.courseValue,
      courseLabel: selection.courseLabel,
    }) ? draft : null
    const matchesCurrentJourney = storedJourney && matchesJourneyProgress(storedJourney, {
      courseType: selection.courseType,
      courseId: selection.courseId,
      courseValue: selection.courseValue,
      courseLabel: selection.courseLabel,
    }) ? storedJourney : null

    if (matchesCurrentDraft) {
      setFullName(matchesCurrentDraft.fullName)
      setEmail(matchesCurrentDraft.email)
      setPhone(matchesCurrentDraft.phone)
      setResumeEmail(matchesCurrentDraft.email)
      if (matchesCurrentDraft.leadSubmitted) {
        setCrmLeadSubmitted(true)
      }

      if (!isGraduation && matchesCurrentDraft.openStep === 2) {
        const matchedGroup =
          (matchesCurrentDraft.workloadValue
            ? paymentPlanGroups.find((group) => group.value === matchesCurrentDraft.workloadValue)
            : null) ??
          findMatchingPaymentPlanGroup(paymentPlanGroups, {
            workloadLabel: matchesCurrentDraft.workloadLabel,
          })

        if (matchedGroup) {
          setSelectedWorkloadValue(matchedGroup.value)
          setSelectedPaymentPlanValue(matchedGroup.options[0]?.value ?? '')
          setAcceptedTerms(true)
          setStep(2)
        }
      }
    } else if (matchesCurrentJourney?.email) {
      setResumeEmail(matchesCurrentJourney.email)
    }

    if (matchesCurrentJourney) {
      setCrmLeadSubmitted(true)
      if (normalizeCurrentStep(matchesCurrentJourney.currentStep) >= 2) {
        setCrmInscritoSubmitted(true)
      }
    }

    if (!matchesCurrentJourney || isGraduation) return

    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('resume') !== '1') return

    hydrateResumeIntoCurrentCourse(matchesCurrentJourney)
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`)
  }, [
    isGraduation,
    selection.courseId,
    selection.courseLabel,
    selection.courseType,
    selection.courseValue,
  ])

  function hydrateResumeIntoCurrentCourse(progress: StoredJourneyProgress) {
    if (progress.fullName) setFullName(progress.fullName)
    if (progress.email) {
      setEmail(progress.email)
      setResumeEmail(progress.email)
    }
    if (progress.phone) setPhone(formatPhoneMask(progress.phone))
    if (progress.cpf) setCpf(formatCpfMask(progress.cpf))
    setAcceptedTerms(true)
    setResumeMode('default')
    setResumeMessage('')
    setResumeOptions([])
    setSelectedResumeJourneyId('')

    const matchedGroup = findMatchingPaymentPlanGroup(paymentPlanGroups, progress)
    if (matchedGroup) {
      setSelectedWorkloadValue(matchedGroup.value)
      const matchedPaymentPlan =
        (progress.pricingId ? matchedGroup.options.find((option) => option.pricingId === progress.pricingId) : undefined) ??
        (progress.paymentPlanLabel ? matchedGroup.options.find((option) => option.label === progress.paymentPlanLabel) : undefined) ??
        matchedGroup.options[0] ??
        null

      setSelectedPaymentPlanValue(matchedPaymentPlan?.value ?? '')
    }

    setStep(2)
    window.setTimeout(() => {
      cpfInputRef.current?.focus()
    }, 60)
  }

  function buildStoredJourneyProgress(option: ResumeCourseOption): Omit<StoredJourneyProgress, 'createdAt'> {
    return {
      journeyId: option.journeyId,
      journeyUuid: option.journeyUuid,
      courseType: selection.courseType,
      courseId: option.courseId,
      courseLabel: option.courseLabel,
      courseValue: option.courseValue,
      fullName: option.fullName,
      email: option.email,
      phone: option.phone,
      workloadVariantId: option.workloadVariantId,
      workloadLabel: option.workloadLabel,
      cpf: option.cpf,
      pricingId: option.pricingId,
      paymentPlanLabel: option.paymentPlanLabel,
      currentStep: option.currentStep,
      status: option.status,
    }
  }

  async function loadContract(type: InstitutionContractType) {
    setContractLoading(true)
    setContractError('')

    try {
      const nextContract = await fetchInstitutionContract(type)
      setContractContent(nextContract)
      setLoadedContractType(type)
    } catch (error) {
      setContractContent(null)
      setLoadedContractType(type)
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
    if (loadedContractType === contractType && (contractContent || contractError)) return

    void loadContract(contractType)
  }

  async function submitCrmStage(stage: 'lead' | 'inscrito') {
    if (stage === 'lead' && crmLeadSubmitted) return
    if (stage === 'inscrito' && crmInscritoSubmitted) return

    const selectionToSend: CourseLeadSelection = isGraduation
      ? selection
      : {
          ...selection,
          workloadLabel: selectedWorkloadGroup?.label || selection.workloadLabel,
          priceLabel: stage === 'inscrito'
            ? selectedPaymentPlan?.label || selectedPaymentPlanLabel || selection.priceLabel
            : visiblePriceLabel || selection.priceLabel,
        }

    await sendLeadToCrm({
      fullName,
      email,
      phone,
      selection: selectionToSend,
      stage,
      context: isGraduation ? 'default' : 'course-page',
      voucherCode: isGraduation ? undefined : voucherCode,
      cpf: stage === 'inscrito' ? normalizeCpf(cpf) : undefined,
    })

    if (stage === 'lead') {
      setCrmLeadSubmitted(true)
      return
    }

    setCrmInscritoSubmitted(true)
  }

  async function ensureJourney() {
    const matchingJourney = readJourneyProgress()
    if (matchingJourney && matchesJourneyProgress(matchingJourney, {
      courseType: selection.courseType,
      courseId: selection.courseId,
      courseValue: selection.courseValue,
      courseLabel: selection.courseLabel,
    })) {
      return matchingJourney.journeyId
    }

    if (!selection.courseId || selection.courseId <= 0) {
      throw new Error('Curso indisponível para iniciar a jornada agora.')
    }

    if (!isGraduation && !selectedWorkloadGroup?.workloadVariantId) {
      throw new Error('Carga horária indisponível para iniciar a inscrição deste curso.')
    }

    const payload = isGraduation
      ? {
          course_id: selection.courseId,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: normalizePhone(phone),
        }
      : {
          course_id: selection.courseId,
          nome: fullName.trim(),
          email: email.trim(),
          whatsapp: normalizePhone(phone),
          workload_variant_id: selectedWorkloadGroup?.workloadVariantId ?? undefined,
          voucher_code: voucherCode.trim() || undefined,
        }

    const response = await createJourneyStep1(payload)
    saveJourneyProgress({
      journeyId: response.journey_id,
      journeyUuid: response.journey_uuid,
      courseType: selection.courseType,
      courseId: selection.courseId,
      courseValue: selection.courseValue,
      courseLabel: selection.courseLabel,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: normalizePhone(phone),
      workloadVariantId: selectedWorkloadGroup?.workloadVariantId ?? undefined,
      workloadLabel: selectedWorkloadGroup?.label,
      currentStep: response.current_step ?? 1,
    })

    return response.journey_id
  }

  function validatePostStep1() {
    return {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
      workload: selectedWorkloadGroup ? undefined : 'Selecione a carga horária.',
      agreement: acceptedTerms ? undefined : 'Você precisa concordar com o contrato para continuar.',
    } satisfies FieldErrors
  }

  function validatePostStep2() {
    return {
      cpf: validateCpf(cpf),
      paymentPlan: selectedPaymentPlan ? undefined : 'Selecione o plano de pagamento.',
    } satisfies FieldErrors
  }
  async function goToSecondStep() {
    const nextErrors = validatePostStep1()
    setErrors(nextErrors)
    setSubmitStatus('idle')
    setSubmitMessage('')

    if (nextErrors.fullName || nextErrors.email || nextErrors.phone || nextErrors.workload || nextErrors.agreement) {
      return
    }

    setAdvanceLoading(true)

    try {
      await submitCrmStage('lead')
      await ensureJourney()
      saveCourseLeadDraft({
        courseType: selection.courseType,
        courseValue: selection.courseValue,
        courseLabel: selection.courseLabel,
        courseId: selection.courseId,
        workloadValue: selectedWorkloadGroup?.value,
        workloadLabel: selectedWorkloadGroup?.label,
        openStep: 2,
        leadSubmitted: true,
        fullName: fullName.trim(),
        email: email.trim(),
        phone,
      })

      setStep(2)
      window.setTimeout(() => {
        cpfInputRef.current?.focus()
      }, 60)
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(
        error instanceof Error ? error.message : 'Não foi possível iniciar sua inscrição agora. Tente novamente em instantes.',
      )
    } finally {
      setAdvanceLoading(false)
    }
  }

  function openResumeFlow() {
    const draft = readCourseLeadDraft()
    const storedJourney = readJourneyProgress()
    const matchesCurrentDraft = draft && matchesCourseLeadDraft(draft, {
      courseType: selection.courseType,
      courseId: selection.courseId,
      courseValue: selection.courseValue,
      courseLabel: selection.courseLabel,
    }) ? draft : null
    const matchesCurrentJourney = storedJourney && matchesJourneyProgress(storedJourney, {
      courseType: selection.courseType,
      courseId: selection.courseId,
      courseValue: selection.courseValue,
      courseLabel: selection.courseLabel,
    }) ? storedJourney : null

    setResumeMode('lookup')
    setResumeErrors({})
    setResumeMessage('')
    setResumeOptions([])
    setSelectedResumeJourneyId('')
    setResumeAgreementAccepted(false)
    setResumeEmail(matchesCurrentDraft?.email || matchesCurrentJourney?.email || email.trim())

    window.setTimeout(() => {
      resumeEmailInputRef.current?.focus()
    }, 30)
  }

  function closeResumeFlow() {
    setResumeMode('default')
    setResumeErrors({})
    setResumeMessage('')
    setResumeOptions([])
    setSelectedResumeJourneyId('')
    setResumeAgreementAccepted(false)
  }

  async function continueWithResumeOption(option: ResumeCourseOption) {
    if (!option.courseId || option.courseId <= 0) {
      throw new Error('Curso indisponível para continuar a inscrição.')
    }

    const refreshedSnapshot = await resumeJourney({ course_id: option.courseId, email: resumeEmail.trim() })
    const refreshedOption = buildResumeOption(
      refreshedSnapshot,
      selection.courseType,
      option.courseId,
      option.courseLabel,
      resumeEmail.trim(),
    )

    if (!refreshedOption) {
      throw new Error('Não foi possível retomar esta inscrição agora.')
    }

    refreshedOption.displayTitle = option.displayTitle
    refreshedOption.path = option.path
    refreshedOption.courseLabel = option.courseLabel
    refreshedOption.courseValue = option.courseValue

    if (refreshedOption.fullName || refreshedOption.email || refreshedOption.phone) {
      saveCourseLeadDraft({
        courseType: selection.courseType,
        courseValue: refreshedOption.courseValue,
        courseLabel: refreshedOption.courseLabel,
        courseId: refreshedOption.courseId,
        workloadLabel: refreshedOption.workloadLabel,
        openStep: normalizeCurrentStep(refreshedOption.currentStep) >= 2 ? 2 : 1,
        leadSubmitted: true,
        fullName: refreshedOption.fullName,
        email: refreshedOption.email,
        phone: formatPhoneMask(refreshedOption.phone),
      })
    }

    saveJourneyProgress(buildStoredJourneyProgress(refreshedOption))
    setCrmLeadSubmitted(true)
    if (normalizeCurrentStep(refreshedOption.currentStep) >= 2) {
      setCrmInscritoSubmitted(true)
    }

    if (refreshedOption.courseId !== selection.courseId) {
      window.location.assign(`${refreshedOption.path}?resume=1`)
      return
    }

    hydrateResumeIntoCurrentCourse(buildStoredJourneyProgress(refreshedOption) as StoredJourneyProgress)
  }

  async function handleResumeLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: ResumeFieldErrors = {
      email: validateEmail(resumeEmail),
      agreement: resumeAgreementAccepted ? undefined : 'Você precisa concordar com o contrato para continuar.',
    }
    setResumeErrors(nextErrors)
    setResumeMessage('')

    if (nextErrors.email || nextErrors.agreement) return

    setResumeLoading(true)

    try {
      const normalizedEmail = resumeEmail.trim()
      const pendingResponse = await getPendingJourneys({ email: normalizedEmail })
      const filteredPendingItems = (pendingResponse.items ?? []).filter((item) => {
        if ((item.course_level ?? '') !== selection.courseType) return false
        return item.can_continue !== false
      })

      const optionMap = new Map<number, ResumeCourseOption>()
      for (const item of filteredPendingItems) {
        const option = buildResumeOption(
          item,
          selection.courseType,
          typeof item.course_id === 'number' ? item.course_id : undefined,
          isRecord(item.course) ? readRecordString(item.course as Record<string, unknown>, ['name']) : undefined,
          normalizedEmail,
        )
        if (option) optionMap.set(option.journeyId, option)
      }

      try {
        if (selection.courseId && selection.courseId > 0) {
          const currentCourseResume = await resumeJourney({ course_id: selection.courseId, email: normalizedEmail })
          if (currentCourseResume.can_continue !== false) {
            const currentOption = buildResumeOption(
              currentCourseResume,
              selection.courseType,
              selection.courseId,
              selection.courseLabel,
              normalizedEmail,
            )
            if (currentOption) optionMap.set(currentOption.journeyId, currentOption)
          }
        }
      } catch {
        // Ignora quando este curso não tem jornada retomável para o e-mail informado.
      }

      const options = [...optionMap.values()]
      if (!options.length) {
        setResumeMessage('Não encontramos uma inscrição em andamento para este e-mail.')
        return
      }

      const routeMap = await fetchResumeCourseRoutes(selection.courseType, options.map((option) => option.courseId))
      const mappedOptions = options.map((option) => {
        const route = routeMap.get(option.courseId)
        const isCurrentCourse = option.courseId === selection.courseId

        return {
          ...option,
          displayTitle: route?.title || option.displayTitle,
          courseLabel: route?.courseLabel || (isCurrentCourse ? selection.courseLabel : option.courseLabel),
          courseValue: route?.courseValue || (isCurrentCourse ? selection.courseValue : option.courseValue),
          path: route?.path || (isCurrentCourse ? currentCoursePath : getCoursePath({ courseType: selection.courseType, courseLabel: option.courseLabel, courseValue: option.courseValue })),
        }
      })

      if (mappedOptions.length === 1) {
        await continueWithResumeOption(mappedOptions[0])
        return
      }

      setResumeOptions(mappedOptions)
      setSelectedResumeJourneyId(String(mappedOptions[0]?.journeyId ?? ''))
      setResumeMode('select')
      setResumeMessage('')
    } catch (error) {
      setResumeMessage(error instanceof Error ? error.message : 'Não foi possível localizar sua inscrição agora. Tente novamente em instantes.')
    } finally {
      setResumeLoading(false)
    }
  }

  async function handleResumeSelection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const selectedOption = resumeOptions.find((option) => String(option.journeyId) === selectedResumeJourneyId)
    if (!selectedOption) {
      setResumeErrors({ courseId: 'Selecione um curso para continuar.' })
      return
    }

    setResumeErrors({})
    setResumeLoading(true)
    setResumeMessage('')

    try {
      await continueWithResumeOption(selectedOption)
    } catch (error) {
      setResumeMessage(error instanceof Error ? error.message : 'Não foi possível retomar sua inscrição agora. Tente novamente em instantes.')
    } finally {
      setResumeLoading(false)
    }
  }

  async function handleGraduationSubmit() {
    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
      agreement: acceptedTerms ? undefined : 'Você precisa concordar com o contrato.',
    }
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    setSubmitStatus('submitting')
    setSubmitMessage('Preparando sua inscrição...')

    try {
      await sendLeadToCrm({ fullName, email, phone, selection })

      let journeyId: number | undefined
      let currentStep = 1

      if (canUseJourney(selection, institutionSlug)) {
        try {
          const step1 = await createJourneyStep1({
            course_id: PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
            full_name: fullName.trim(),
            email: email.trim(),
            phone: normalizePhone(phone),
          })

          journeyId = step1.journey_id
          currentStep = step1.current_step ?? 1
        } catch {
          journeyId = undefined
          currentStep = 1
        }
      }

      storeGraduationVestibularLead({
        fullName,
        email,
        phone,
        journeyId,
        courseId: selection.courseId,
        journeyCourseId: PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
        courseLabel: selection.courseLabel,
        courseValue: selection.courseValue,
        currentStep,
      })

      setSubmitStatus('success')
      setSubmitMessage('Dados recebidos. Redirecionando para o vestibular...')
      window.setTimeout(() => {
        window.location.assign('/graduacao/vestibular')
      }, 120)
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Não foi possível enviar agora. Tente novamente em instantes.')
    }
  }

  async function handlePostFinalSubmit() {
    const nextErrors = { ...validatePostStep1(), ...validatePostStep2() }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitStatus('submitting')
    setSubmitMessage('Processando sua inscrição...')

    try {
      const journeyId = await ensureJourney()
      if (!selectedWorkloadGroup?.workloadVariantId || !selectedPaymentPlan?.pricingId) {
        throw new Error('Carga horária ou plano de pagamento indisponíveis para este curso.')
      }

      const defaultPoleId = Number.parseInt(import.meta.env.VITE_JOURNEY_DEFAULT_POLE_ID ?? '', 10)
      const step2Payload: Record<string, unknown> = {
        cpf: normalizeCpf(cpf),
        workload_variant_id: selectedWorkloadGroup.workloadVariantId,
        pricing_id: selectedPaymentPlan.pricingId,
        payment_plan_label: selectedPaymentPlan.label,
        voucher_code: voucherCode.trim() || undefined,
      }

      if (Number.isInteger(defaultPoleId) && defaultPoleId > 0) {
        step2Payload.pole_id = defaultPoleId
      }

      const step2Response = await updateJourneyStep2(journeyId, step2Payload)
      try {
        await submitCrmStage('inscrito')
      } catch (error) {
        console.warn('Não foi possível enviar a etapa de inscrito da pós para o CRM:', error)
      }

      saveJourneyProgress({
        journeyId,
        courseType: selection.courseType,
        courseId: selection.courseId || 0,
        courseValue: selection.courseValue,
        courseLabel: selection.courseLabel,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizePhone(phone),
        workloadVariantId: selectedWorkloadGroup.workloadVariantId,
        workloadLabel: selectedWorkloadGroup.label,
        cpf: normalizeCpf(cpf),
        pricingId: selectedPaymentPlan.pricingId,
        paymentPlanLabel: selectedPaymentPlan.label,
        currentStep: step2Response.current_step ?? 2,
      })

      const finalizeResponse = await finalizeJourney(journeyId, { voucher_code: voucherCode.trim() || undefined })

      clearCourseLeadDraft()
      clearJourneyProgress()
      storePostThankYouLead({ fullName: fullName.trim(), email: email.trim() })
      setSubmitStatus('success')
      setSubmitMessage(finalizeResponse.message || 'Inscrição concluída. Redirecionando...')
      window.setTimeout(() => {
        window.location.assign('/pos-graduacao/inscricao-finalizada')
      }, 100)
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Não foi possível concluir sua inscrição agora. Tente novamente em instantes.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isGraduation) {
      await handleGraduationSubmit()
      return
    }

    if (step === 1) {
      await goToSecondStep()
      return
    }

    await handlePostFinalSubmit()
  }
  if (!isGraduation) {
    const isLookupMode = resumeMode === 'lookup'
    const isSelectMode = resumeMode === 'select'
    const showResumeHint = resumeMode === 'default' || isSelectMode
    const postAgreementCopy = (
      <span>
        {'LI E CONCORDO COM OS '}
        <a
          href="#course-contract"
          className="font-semibold text-[#1e5ec8] underline underline-offset-2"
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
        className="fixed inset-0 z-[80] flex items-center justify-center bg-[#07122d]/70 px-4 py-6"
        role="presentation"
        onClick={() => setIsContractModalOpen(false)}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-contract-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 border-b border-[#e4e8f0] px-5 py-4 lg:px-6">
            <h3 id="course-contract-title" className="font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase leading-tight text-[#0b111f]">
              {contractContent?.title || 'Contrato de prestação de serviços educacionais'}
            </h3>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e0ea] text-[24px] leading-none text-[#0f2e62] transition hover:border-[#1e5ec8] hover:text-[#1e5ec8]"
              aria-label="Fechar contrato"
              onClick={() => setIsContractModalOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 lg:px-6 lg:py-5">
            {contractLoading ? (
              <div className="flex items-center gap-3 text-[14px] font-medium text-[#0f2e62]">
                <SpinnerIcon className="h-5 w-5 animate-spin" />
                <span>Carregando contrato...</span>
              </div>
            ) : contractError ? (
              <div className="flex flex-col gap-3 text-[14px] text-[#273245]">
                <p>{contractError}</p>
                <button
                  type="button"
                  className="inline-flex w-fit items-center justify-center rounded-[12px] bg-gradient-to-r from-[#14418d] to-[#0c033c] px-4 py-3 font-['Kumbh_Sans'] text-[14px] font-extrabold uppercase text-white"
                  onClick={() => void loadContract(contractType)}
                >
                  Tentar novamente
                </button>
              </div>
            ) : contractContent?.html ? (
              <div
                className="prose prose-sm max-w-none text-[#273245]"
                dangerouslySetInnerHTML={{ __html: contractContent.html }}
              />
            ) : (
              <div className="whitespace-pre-line text-[14px] leading-[1.55] text-[#273245]">
                {contractContent?.text || 'Contrato não encontrado para a instituição informada.'}
              </div>
            )}
          </div>

          <div className="border-t border-[#e4e8f0] px-5 py-4 lg:px-6">
            <button
              type="button"
              className="inline-flex h-[48px] items-center justify-center rounded-[14px] bg-gradient-to-r from-[#14418d] to-[#0c033c] px-6 font-['Kumbh_Sans'] text-[15px] font-extrabold uppercase text-white transition hover:opacity-95"
              onClick={() => setIsContractModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    ) : null
    const internshipInfoModal = isInternshipModalOpen ? (
      <div
        className="fixed inset-0 z-[81] flex items-center justify-center bg-[#07122d]/70 px-4 py-6"
        role="presentation"
        onClick={() => setIsInternshipModalOpen(false)}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-internship-info-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 border-b border-[#e4e8f0] px-5 py-4 lg:px-6">
            <h3
              id="course-internship-info-title"
              className="font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase leading-tight text-[#0b111f]"
            >
              Estágio e Prática Obrigatória
            </h3>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e0ea] text-[24px] leading-none text-[#0f2e62] transition hover:border-[#1e5ec8] hover:text-[#1e5ec8]"
              aria-label="Fechar aviso sobre estágio e prática obrigatória"
              onClick={() => setIsInternshipModalOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-6">
            <div className="flex flex-col gap-4 text-[14px] leading-[1.6] text-[#273245]">
              <p>
                {`Este curso possui chancela do conselho de classe do ${internshipRegulatoryBodyLabel}. Alguns componentes práticos, estágios e exigências acadêmicas podem variar conforme a carga horária escolhida e a matriz curricular vigente.`}
              </p>
              {internshipRegulatoryBodySupportingText ? (
                <p className="font-semibold text-[#0f2e62]">{internshipRegulatoryBodySupportingText}</p>
              ) : null}
              <p>{`Carga horária selecionada: ${internshipWorkloadLabel}.`}</p>
              <p>
                A confirmação das atividades obrigatórias, quando aplicáveis, acontece na trilha
                acadêmica do curso e nas orientações fornecidas pela instituição durante a jornada
                do aluno.
              </p>
            </div>
          </div>

          <div className="border-t border-[#e4e8f0] px-5 py-4 lg:px-6">
            <button
              type="button"
              className="inline-flex h-[48px] items-center justify-center rounded-[14px] bg-gradient-to-r from-[#14418d] to-[#0c033c] px-6 font-['Kumbh_Sans'] text-[15px] font-extrabold uppercase text-white transition hover:opacity-95"
              onClick={() => setIsInternshipModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    ) : null

    return (
      <>
        <section className="w-full max-w-[552px] rounded-[30px] bg-white p-[20px] shadow-[0_4px_21px_rgba(0,0,0,0.25)]">
        <div className="overflow-hidden rounded-[14px] bg-[#d7dbe4]">
          <img src={courseCoverImage} alt={selection.courseLabel} className="block h-[220px] w-full object-cover lg:h-[287px]" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 font-['Kumbh_Sans'] text-[16px] font-semibold leading-[24px] text-[#212121]">
          {showResumeHint ? (
            <>
              <span>Já iniciou sua inscrição?</span>
              <button type="button" className="font-semibold text-[#066aff] underline underline-offset-2" onClick={openResumeFlow}>Clique aqui para continuar</button>
            </>
          ) : (
            <>
              <span>Ainda não se inscreveu?</span>
              <button type="button" className="font-semibold text-[#066aff] underline underline-offset-2" onClick={closeResumeFlow}>Clique aqui e inscreva-se</button>
            </>
          )}
        </div>

        <div className="mt-[10px]">
          <h2 className="font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase leading-[25px] text-[#0b111f]">
            {isLookupMode ? 'Informe seu e-mail para continuar' : isSelectMode ? 'Selecione o curso' : 'Preencha o formulário para se inscrever'}
          </h2>
        </div>

        <form className="mt-[14px] flex flex-col gap-[14px]" onSubmit={isLookupMode ? handleResumeLookup : isSelectMode ? handleResumeSelection : handleSubmit} noValidate>
          {isLookupMode ? (
            <>
              <div>
                <input
                  ref={resumeEmailInputRef}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  maxLength={120}
                  value={resumeEmail}
                  onChange={(event) => setResumeEmail(event.target.value)}
                  className={['h-[48px] w-full rounded-[8px] border bg-[#e8e9ea] px-3 font-[\"Liberation_Sans\"] text-[16px] text-black outline-none transition placeholder:text-black/80', resumeErrors.email ? 'border-[#d53030]' : 'border-[rgba(0,0,0,0.15)] focus:border-[#066aff]'].join(' ')}
                />
                <FieldError message={resumeErrors.email} />
              </div>

              <label className="flex items-start gap-[7px] text-[14px] leading-[16px] text-black">
                <input type="checkbox" checked={resumeAgreementAccepted} onChange={(event) => setResumeAgreementAccepted(event.target.checked)} className="mt-0.5 h-[24px] w-[24px] shrink-0 rounded-[4px] border border-black/40 accent-[#066aff]" />
                {postAgreementCopy}
              </label>
              <FieldError message={resumeErrors.agreement} />

              <button type="submit" className="mt-[2px] flex h-[51px] w-full items-center justify-center rounded-[12px] bg-gradient-to-r from-[#14418d] to-[#0c033c] font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase text-white transition hover:opacity-95 disabled:opacity-60" disabled={resumeLoading}>
                {resumeLoading ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : <span>Continuar</span>}
              </button>
            </>
          ) : isSelectMode ? (
            <>
              <div>
                <CourseFormSelect value={selectedResumeJourneyId} options={resumeOptions.map((option) => ({ value: String(option.journeyId), label: option.displayTitle }))} placeholder="Selecione o curso" menuLabel="Selecione o curso" invalid={Boolean(resumeErrors.courseId)} onChange={setSelectedResumeJourneyId} />
                <FieldError message={resumeErrors.courseId} />
              </div>

              <button type="submit" className="mt-[2px] flex h-[51px] w-full items-center justify-center rounded-[12px] bg-gradient-to-r from-[#14418d] to-[#0c033c] font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase text-white transition hover:opacity-95 disabled:opacity-60" disabled={resumeLoading}>
                {resumeLoading ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : <span>Continuar</span>}
              </button>
            </>
          ) : step === 1 ? (
            <>
              <div>
                <input ref={nameInputRef} type="text" placeholder="Nome completo" autoComplete="name" maxLength={120} value={fullName} onChange={(event) => setFullName(normalizeName(event.target.value))} className={['h-[48px] w-full rounded-[8px] border bg-[#e8e9ea] px-3 font-[\"Liberation_Sans\"] text-[16px] text-black outline-none transition placeholder:text-black/80', errors.fullName ? 'border-[#d53030]' : 'border-[rgba(0,0,0,0.15)] focus:border-[#066aff]'].join(' ')} />
                <FieldError message={errors.fullName} />
              </div>

              <div className="grid gap-[14px] sm:grid-cols-2">
                <div>
                  <input type="email" placeholder="Email" autoComplete="email" maxLength={120} value={email} onChange={(event) => setEmail(event.target.value)} className={['h-[48px] w-full rounded-[8px] border bg-[#e8e9ea] px-3 font-[\"Liberation_Sans\"] text-[16px] text-black outline-none transition placeholder:text-black/80', errors.email ? 'border-[#d53030]' : 'border-[rgba(0,0,0,0.15)] focus:border-[#066aff]'].join(' ')} />
                  <FieldError message={errors.email} />
                </div>

                <div>
                  <input type="tel" inputMode="numeric" placeholder="Telefone" autoComplete="tel-national" maxLength={15} value={phone} onChange={(event) => setPhone(formatPhoneMask(event.target.value))} className={['h-[48px] w-full rounded-[8px] border bg-[#e8e9ea] px-3 font-[\"Liberation_Sans\"] text-[16px] text-black outline-none transition placeholder:text-black/80', errors.phone ? 'border-[#d53030]' : 'border-[rgba(0,0,0,0.15)] focus:border-[#066aff]'].join(' ')} />
                  <FieldError message={errors.phone} />
                </div>
              </div>

              <div>
                <CourseFormSelect value={selectedWorkloadValue} options={workloadSelectOptions} placeholder="Selecione a carga horária" menuLabel="Selecione a carga horária" invalid={Boolean(errors.workload)} onChange={setSelectedWorkloadValue} />
                <FieldError message={errors.workload} />
              </div>

              {!advanceLoading && showInternshipInfoLink ? (
                <PostInfoRow onClick={() => setIsInternshipModalOpen(true)}>
                  Saiba mais sobre o Estágio e a Prática Obrigatória
                </PostInfoRow>
              ) : null}

              <label className="flex items-start gap-[7px] text-[14px] leading-[16px] text-black">
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-0.5 h-[24px] w-[24px] shrink-0 rounded-[4px] border border-black/40 accent-[#066aff]" />
                {postAgreementCopy}
              </label>
              <FieldError message={errors.agreement} />

              <button type="submit" className="mt-[2px] flex h-[51px] w-full items-center justify-center rounded-[12px] bg-gradient-to-r from-[#14418d] to-[#0c033c] font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase text-white transition hover:opacity-95 disabled:opacity-60" disabled={advanceLoading} aria-busy={advanceLoading}>
                {advanceLoading ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : <span>Continuar</span>}
              </button>

              <PostPriceCard
                priceLabel={visiblePriceLabel}
                pixMessage={visiblePixMessage}
                oldPriceLabel={visibleOldInstallmentPrice}
              />

              <div className="mt-1">
                <button type="button" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.02em] text-[#1e5ec8]" onClick={() => setVoucherOpen((current) => !current)}>
                  <span>Código voucher</span>
                  <ChevronDownIcon className={['h-3.5 w-3.5 transition-transform', voucherOpen ? 'rotate-180' : ''].join(' ')} />
                </button>
              </div>

              {voucherOpen ? (
                <div className="flex gap-2 rounded-[12px] border border-[#d7dce5] bg-white p-2">
                  <input type="text" placeholder="Digite aqui o voucher caso tenha" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} className="h-10 flex-1 rounded-[10px] bg-[#eef1f5] px-3 text-[14px] text-[#0b111f] outline-none" />
                  <button type="button" className="shrink-0 rounded-[10px] px-3 text-[13px] font-semibold text-[#1e5ec8]" onClick={() => setVoucherCode('')}>Remover</button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div>
                <input ref={cpfInputRef} type="text" inputMode="numeric" placeholder="CPF" autoComplete="off" maxLength={14} value={cpf} onChange={(event) => setCpf(formatCpfMask(event.target.value))} className={['h-[48px] w-full rounded-[8px] border bg-[#e8e9ea] px-3 font-[\"Liberation_Sans\"] text-[16px] text-black outline-none transition placeholder:text-black/80', errors.cpf ? 'border-[#d53030]' : 'border-[rgba(0,0,0,0.15)] focus:border-[#066aff]'].join(' ')} />
                <FieldError message={errors.cpf} />
              </div>

              <div>
                <CourseFormSelect value={selectedPaymentPlanValue} options={paymentPlanSelectOptions} placeholder="Plano de pagamento" menuLabel="Selecione o plano de pagamento" invalid={Boolean(errors.paymentPlan)} onChange={setSelectedPaymentPlanValue} />
                <FieldError message={errors.paymentPlan} />
              </div>

              {showInternshipInfoLink ? (
                <PostInfoRow onClick={() => setIsInternshipModalOpen(true)}>
                  Saiba mais sobre o Estágio e a Prática Obrigatória
                </PostInfoRow>
              ) : null}

              <div className="mt-[2px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" className="inline-flex h-[50px] items-center justify-center gap-1 rounded-[12px] border border-[#d9e0ea] px-5 font-['Kumbh_Sans'] text-[15px] font-bold text-[#0f2e62] transition hover:border-[#1e5ec8] hover:text-[#1e5ec8]" onClick={() => { setErrors({}); setSubmitStatus('idle'); setSubmitMessage(''); setStep(1) }}>
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span>Voltar</span>
                </button>

                <button type="submit" className="flex h-[51px] w-full items-center justify-center rounded-[12px] bg-gradient-to-r from-[#14418d] to-[#0c033c] px-6 font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase text-white transition hover:opacity-95 disabled:opacity-60 sm:w-auto" disabled={submitStatus === 'submitting'} aria-busy={submitStatus === 'submitting'}>
                  {submitStatus === 'submitting' ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : <span>Continuar inscrição</span>}
                </button>
              </div>

              <PostPriceCard
                priceLabel={visiblePriceLabel}
                pixMessage={visiblePixMessage}
                oldPriceLabel={visibleOldInstallmentPrice}
              />

              <div className="mt-1">
                <button type="button" className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.02em] text-[#1e5ec8]" onClick={() => setVoucherOpen((current) => !current)}>
                  <span>Código voucher</span>
                  <ChevronDownIcon className={['h-3.5 w-3.5 transition-transform', voucherOpen ? 'rotate-180' : ''].join(' ')} />
                </button>
              </div>

              {voucherOpen ? (
                <div className="flex gap-2 rounded-[12px] border border-[#d7dce5] bg-white p-2">
                  <input type="text" placeholder="Digite aqui o voucher caso tenha" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} className="h-10 flex-1 rounded-[10px] bg-[#eef1f5] px-3 text-[14px] text-[#0b111f] outline-none" />
                  <button type="button" className="shrink-0 rounded-[10px] px-3 text-[13px] font-semibold text-[#1e5ec8]" onClick={() => setVoucherCode('')}>Remover</button>
                </div>
              ) : null}
            </>
          )}

          {resumeMessage ? <p className="text-[13px] font-medium text-[#d53030]">{resumeMessage}</p> : null}
          {submitMessage ? <p className={['text-[13px] font-medium', submitStatus === 'error' ? 'text-[#d53030]' : 'text-[#1f8b43]'].join(' ')}>{submitMessage}</p> : null}
        </form>
        </section>
        {contractModal}
        {internshipInfoModal}
      </>
    )
  }

  const graduationAgreementCopy = (
    <span>
      {'LI E CONCORDO COM OS '}
      <a
        href="#course-contract"
        className="font-semibold text-[#1e5ec8] underline underline-offset-2"
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
  const graduationContractModal = isContractModalOpen ? (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#07122d]/70 px-4 py-6"
      role="presentation"
      onClick={() => setIsContractModalOpen(false)}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-contract-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#e4e8f0] px-5 py-4 lg:px-6">
          <h3 id="course-contract-title" className="font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase leading-tight text-[#0b111f]">
            {contractContent?.title || 'Contrato de prestação de serviços educacionais'}
          </h3>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e0ea] text-[24px] leading-none text-[#0f2e62] transition hover:border-[#1e5ec8] hover:text-[#1e5ec8]"
            aria-label="Fechar contrato"
            onClick={() => setIsContractModalOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 lg:px-6 lg:py-5">
          {contractLoading ? (
            <div className="flex items-center gap-3 text-[14px] font-medium text-[#0f2e62]">
              <SpinnerIcon className="h-5 w-5 animate-spin" />
              <span>Carregando contrato...</span>
            </div>
          ) : contractError ? (
            <div className="flex flex-col gap-3 text-[14px] text-[#273245]">
              <p>{contractError}</p>
              <button
                type="button"
                className="inline-flex w-fit items-center justify-center rounded-[12px] bg-gradient-to-r from-[#14418d] to-[#0c033c] px-4 py-3 font-['Kumbh_Sans'] text-[14px] font-extrabold uppercase text-white"
                onClick={() => void loadContract(contractType)}
              >
                Tentar novamente
              </button>
            </div>
          ) : contractContent?.html ? (
            <div
              className="prose prose-sm max-w-none text-[#273245]"
              dangerouslySetInnerHTML={{ __html: contractContent.html }}
            />
          ) : (
            <div className="whitespace-pre-line text-[14px] leading-[1.55] text-[#273245]">
              {contractContent?.text || 'Contrato não encontrado para a instituição informada.'}
            </div>
          )}
        </div>

        <div className="border-t border-[#e4e8f0] px-5 py-4 lg:px-6">
          <button
            type="button"
            className="inline-flex h-[48px] items-center justify-center rounded-[14px] bg-gradient-to-r from-[#14418d] to-[#0c033c] px-6 font-['Kumbh_Sans'] text-[15px] font-extrabold uppercase text-white transition hover:opacity-95"
            onClick={() => setIsContractModalOpen(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
    <section className="w-full max-w-[552px] rounded-[30px] bg-white p-[15px] shadow-[0_4px_21px_rgba(0,0,0,0.25)] lg:p-5">
      <div className="overflow-hidden rounded-[14px] bg-[#d7dbe4]">
        <img src={courseCoverImage} alt={selection.courseLabel} className="block h-[220px] w-full object-cover lg:h-[287px]" />
      </div>

      <p className="mt-4 font-['Kumbh_Sans'] text-[13px] font-semibold leading-snug text-[#212121] lg:text-[16px]">Conheça a Graduação em {selection.courseLabel || 'Psicologia'} e continue sua inscrição.</p>
      <h3 className="mt-2 font-['Kumbh_Sans'] text-[18px] font-extrabold uppercase leading-[1.15] text-[#0b111f] lg:text-[22px]">Preencha o formulário para se inscrever</h3>

      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
        <div>
          <input ref={nameInputRef} type="text" placeholder="Nome completo" value={fullName} onChange={(event) => setFullName(normalizeName(event.target.value))} className={['h-12 w-full rounded-[12px] border bg-[#eef1f5] px-4 text-[15px] text-[#0b111f] outline-none transition', errors.fullName ? 'border-[#d53030]' : 'border-transparent focus:border-[#1e5ec8]'].join(' ')} />
          <FieldError message={errors.fullName} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <input type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} className={['h-12 w-full rounded-[12px] border bg-[#eef1f5] px-4 text-[15px] text-[#0b111f] outline-none transition', errors.email ? 'border-[#d53030]' : 'border-transparent focus:border-[#1e5ec8]'].join(' ')} />
            <FieldError message={errors.email} />
          </div>

          <div>
            <input type="tel" placeholder="Telefone" value={phone} onChange={(event) => setPhone(formatPhoneMask(event.target.value))} className={['h-12 w-full rounded-[12px] border bg-[#eef1f5] px-4 text-[15px] text-[#0b111f] outline-none transition', errors.phone ? 'border-[#d53030]' : 'border-transparent focus:border-[#1e5ec8]'].join(' ')} />
            <FieldError message={errors.phone} />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-[12px] bg-[#f7f9fc] px-3 py-3 text-[12px] leading-[1.35] text-[#273245]">
          <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#1e5ec8]" />
          {graduationAgreementCopy}
        </label>
        <FieldError message={errors.agreement} />

        {submitMessage ? <p className={['text-[13px] font-medium', submitStatus === 'error' ? 'text-[#d53030]' : 'text-[#1f8b43]'].join(' ')}>{submitMessage}</p> : null}

        <button type="submit" disabled={submitStatus === 'submitting'} className="mt-1 flex h-[54px] w-full items-center justify-center rounded-[14px] bg-gradient-to-r from-[#14418d] to-[#0c033c] font-['Kumbh_Sans'] text-[16px] font-extrabold uppercase text-white transition hover:opacity-95 disabled:opacity-60">
          {submitStatus === 'submitting' ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : <span>Continuar</span>}
        </button>
      </form>
    </section>
    {graduationContractModal}
    </>
  )
}
