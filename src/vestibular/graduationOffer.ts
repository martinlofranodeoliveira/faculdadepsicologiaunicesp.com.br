import type { CatalogCourse, CatalogPriceItem } from '@/lib/catalogApi'

export type GraduationOfferRow = {
  dueDate: string
  installment: string
  value: string
}

export type GraduationOfferData = {
  courseId: number
  currentInstallmentValue: string
  installmentsMax: number
  rows: GraduationOfferRow[]
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatCurrencyFromCents(value: number): string {
  return CURRENCY_FORMATTER.format(value / 100)
}

function parseCurrencyTextToCents(value: string | undefined): number {
  const normalized = value?.trim() ?? ''
  if (!normalized) return 0

  const match = normalized.match(/R\$\s*([\d.]+,\d{2})/i)
  if (!match) return 0

  const numeric = Number.parseFloat(match[1].replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(numeric) || numeric <= 0) return 0

  return Math.round(numeric * 100)
}

function getSelectedPriceItem(course: CatalogCourse | null): CatalogPriceItem | null {
  if (!course?.priceItems.length) return null
  return course.priceItems[0] ?? null
}

function getSemesterCount(course: CatalogCourse | null, selectedPriceItem: CatalogPriceItem | null): number {
  const directSemesterCount = Number(course?.semesterCount ?? 0)
  if (Number.isFinite(directSemesterCount) && directSemesterCount > 0) {
    return directSemesterCount
  }

  const durationMonths = Number(course?.durationMonths ?? 0)
  if (Number.isFinite(durationMonths) && durationMonths > 0) {
    return Math.max(1, Math.ceil(durationMonths / 6))
  }

  const continuousDurationMonths = Number(course?.durationContinuousMonths ?? 0)
  if (Number.isFinite(continuousDurationMonths) && continuousDurationMonths > 0) {
    return Math.max(1, Math.ceil(continuousDurationMonths / 6))
  }

  const installmentsMax = Number(selectedPriceItem?.installmentsMax ?? 0)
  if (Number.isFinite(installmentsMax) && installmentsMax > 0) {
    return Math.max(1, Math.ceil(installmentsMax / 6))
  }

  return 5
}

function buildFirstDueDate() {
  const currentDate = new Date()
  const dueDay = currentDate.getDate() <= 15 ? 10 : 15

  return {
    dueDay,
    baseYear: currentDate.getFullYear(),
    baseMonth: currentDate.getMonth() + 1,
  }
}

function formatDueDate(
  schedule: { dueDay: number; baseYear: number; baseMonth: number },
  offsetMonths: number,
): string {
  const targetDate = new Date(schedule.baseYear, schedule.baseMonth + offsetMonths, schedule.dueDay)
  return targetDate.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  })
}

function getInstallmentLabel(index: number): string {
  return `${index + 1}ª Mensalidade`
}

export function buildGraduationOfferData(course: CatalogCourse | null): GraduationOfferData | null {
  if (!course?.courseId) return null

  const selectedPriceItem = getSelectedPriceItem(course)
  const installmentValueCents =
    selectedPriceItem?.amountCents ||
    parseCurrencyTextToCents(course.currentInstallmentPriceMonthly) ||
    parseCurrencyTextToCents(course.currentInstallmentPrice)

  const semesterCount = getSemesterCount(course, selectedPriceItem)
  const installmentsMax = Math.max(1, semesterCount * 6)
  const currentInstallmentValue = installmentValueCents
    ? formatCurrencyFromCents(installmentValueCents)
    : course.currentInstallmentPriceMonthly.replace(/\/.*/u, '').trim()
  const dueDateSchedule = buildFirstDueDate()

  return {
    courseId: course.courseId,
    currentInstallmentValue,
    installmentsMax,
    rows: Array.from({ length: installmentsMax }, (_, index) => ({
      installment: getInstallmentLabel(index),
      value: currentInstallmentValue,
      dueDate: formatDueDate(dueDateSchedule, index),
    })),
  }
}
