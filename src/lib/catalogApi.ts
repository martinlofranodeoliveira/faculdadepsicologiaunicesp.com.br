import { getCourseDisplayTitle, getCoursePath, normalizeComparableText, toSlug } from './courseRoutes'

export type CourseType = 'graduacao' | 'pos'
export type CourseModality = 'ead' | 'semipresencial' | 'presencial'

export type CatalogPriceItem = {
  id: number
  amountCents: number
  installmentsMax: number
  workloadVariantId: number | null
  workloadName: string
  totalHours: number
  modality: string
  validFrom: string
}

export type CatalogCurriculumDiscipline = {
  id: number
  name: string
  hours: number
  sequence: number
}

export type CatalogCurriculumVariant = {
  id: number
  name: string
  totalHours: number
  disciplines: CatalogCurriculumDiscipline[]
}

export type CatalogCourse = {
  institutionId: number
  institutionName: string
  institutionSlug: string
  courseType: CourseType
  courseId: number
  code: string
  slug: string
  value: string
  path: string
  title: string
  rawLabel: string
  description: string
  seoDescription: string
  areaLabels: string[]
  primaryAreaLabel: string
  areaSlug: string
  modality: CourseModality
  modalityLabel: string
  modalityBadge: string
  offeringModalityText: string
  image: string
  galleryImages: string[]
  posPriceCents: number
  currentInstallmentPrice: string
  currentInstallmentPriceMonthly: string
  oldInstallmentPrice: string
  pixText: string
  fixedInstallments: boolean
  teachingPlanUrl: string
  priceItems: CatalogPriceItem[]
  workloadOptions: string[]
  curriculumVariants: CatalogCurriculumVariant[]
  targetAudience: string
  competenciesBenefits: string
  competitiveDifferentials: string
  durationMonths: number
  durationContinuousMonths: number
  semesterCount: number
  durationText: string
  mecOrdinance: string
  mecOrdinanceDocumentUrl: string
  recognition: string
  recognitionDocumentUrl: string
  mecScore: number | null
  tccRequired: boolean | null
  titulation: string
  laborMarket: string
}

export type CatalogCourseSummary = Pick<
  CatalogCourse,
  | 'institutionId'
  | 'institutionName'
  | 'institutionSlug'
  | 'courseType'
  | 'courseId'
  | 'slug'
  | 'value'
  | 'path'
  | 'title'
  | 'rawLabel'
  | 'image'
  | 'currentInstallmentPrice'
  | 'currentInstallmentPriceMonthly'
  | 'oldInstallmentPrice'
  | 'modality'
  | 'modalityBadge'
  | 'areaSlug'
  | 'primaryAreaLabel'
  | 'fixedInstallments'
>

type ApiEnvelope<T> = {
  data: T
  meta?: Record<string, unknown>
  errors?: Array<{
    code?: string
    message?: string
    details?: unknown
  }>
  message?: string
  trace_id?: string
}

type ApiCourseListItem = {
  id: number
  code?: string | null
  name?: string | null
  level?: string | null
  description?: string | null
  offering_modality?: string | null
  titulation?: string | null
  labor_market?: string | null
  target_audience?: string | null
  competencies_benefits?: string | null
  competitive_differentials?: string | null
  teaching_plan_path?: string | null
  main_image_url?: string | null
  modalities?: string | null
  area_names?: string[] | null
  seo?: ApiSeoBundle | null
  duration_months?: number | null
  duration_continuous_months?: number | null
  semester_count?: number | null
  duration?: string | null
  min_amount_cents?: number | string | null
  max_amount_cents?: number | string | null
  pos_price_cents?: number | string | null
  mec_ordinance?: string | null
  mec_ordinance_document_path?: string | null
  recognition?: string | null
  recognition_document_path?: string | null
  mec_score?: number | string | null
  mec_rating?: number | string | null
  mec_note?: number | string | null
  mec_grade?: number | string | null
  mec_concept?: number | string | null
  nota_mec?: number | string | null
  conceito_mec?: number | string | null
  concept_mec?: number | string | null
  course_concept?: number | string | null
  concept?: number | string | null
  tcc_required?: boolean | null
  requires_tcc?: boolean | null
  has_tcc?: boolean | null
  has_course_completion_work?: boolean | null
  featured_pricing_options?: ApiPricingItem[] | null
  course_disciplines?: ApiCourseDiscipline[] | null
}

type ApiCourseDetail = ApiCourseListItem

type ApiSeoBundle = {
  generic?: ApiSeoFields | null
  institution?: ApiSeoFields | null
  effective?: ApiSeoFields | null
}

type ApiSeoFields = {
  course_name?: string | null
  seo_course_name?: string | null
  slug?: string | null
  seo_slug?: string | null
  description?: string | null
  seo_description?: string | null
  canonical_url?: string | null
  seo_canonical_url?: string | null
  og_image_url?: string | null
  seo_og_image_url?: string | null
}

type ApiCourseImage = {
  original_path?: string | null
  thumb_path?: string | null
}

type ApiCourseMedia = {
  teaching_plan?: {
    teaching_plan_path?: string | null
  } | null
  image?: ApiCourseImage | null
  gallery_items?: Array<{ image_path?: string | null }> | null
  main_image_url?: string | null
  gallery_urls?: string[] | null
}

type ApiPricingItem = {
  id: number
  amount_cents?: number | null
  installments_max?: number | null
  workload_variant_id?: number | null
  workload_name?: string | null
  total_hours?: number | null
  modality?: string | null
  valid_from?: string | null
}

type ApiCourseDiscipline = {
  id?: number | string | null
  name?: string | null
  sort_order?: number | string | null
  sequence_no?: number | string | null
  discipline_hours?: number | string | null
}

type ApiCurriculumVariant = {
  workload_variant_id?: number | null
  workload_variant_name?: string | null
  variant_total_hours?: number | null
  disciplines?: ApiCurriculumDiscipline[] | null
}

type ApiCurriculumDiscipline = {
  discipline_id?: number | null
  discipline_name?: string | null
  discipline_hours?: number | null
  sequence_no?: number | null
}

const DEFAULT_CACHE_TTL_MS = parseCacheTtl(
  readServerEnv('COURSES_API_CACHE_TTL_MS') ?? readServerEnv('VITE_POST_COURSES_CACHE_TTL_MS'),
)
const DEFAULT_PAGE_LIMIT = 100
const cache = new Map<string, { createdAt: number; promise: Promise<unknown> }>()

function readServerEnv(name: keyof ImportMetaEnv | string): string | undefined {
  const viteEnv = (import.meta.env as Record<string, string | boolean | undefined> | undefined) ?? undefined
  const viteValue = viteEnv?.[name]
  if (typeof viteValue === 'string' && viteValue.trim()) return viteValue

  const processValue = process.env[name]
  if (typeof processValue === 'string' && processValue.trim()) return processValue

  return undefined
}

function parseCacheTtl(value: string | undefined): number {
  if (!value) return 300000
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 300000
}

function getApiBaseUrl() {
  const value = readServerEnv('COURSES_API_BASE_URL')?.trim() ?? ''
  return value ? (value.endsWith('/') ? value : `${value}/`) : ''
}

function getApiKey() {
  return readServerEnv('COURSES_API_KEY')?.trim() ?? ''
}

function getInstitutionId() {
  const parsed = Number.parseInt(readServerEnv('COURSES_API_INSTITUTION_ID') ?? '', 10)
  return Number.isInteger(parsed) ? parsed : 0
}

function hasApiConfig() {
  return Boolean(getApiBaseUrl() && getApiKey() && getInstitutionId() > 0)
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function normalizeMultilineText(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function normalizeRichText(value: string | null | undefined): string {
  if (!value) return ''

  const normalized = decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<\/div>\s*<div[^>]*>/gi, '\n\n')
    .replace(/<\/li>\s*<li[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/?(p|div|ul|ol)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')

  return normalizeMultilineText(normalized)
}

function pickSeoFields(seo: ApiSeoBundle | null | undefined) {
  const effective = seo?.effective
  const institution = seo?.institution
  const generic = seo?.generic

  return {
    courseName: normalizeText(
      effective?.course_name || effective?.seo_course_name || institution?.course_name || institution?.seo_course_name || generic?.course_name || generic?.seo_course_name,
    ),
    slug: normalizeText(
      effective?.slug || effective?.seo_slug || institution?.slug || institution?.seo_slug || generic?.slug || generic?.seo_slug,
    ),
    description: normalizeRichText(
      effective?.description || effective?.seo_description || institution?.description || institution?.seo_description || generic?.description || generic?.seo_description,
    ),
    ogImageUrl: normalizeText(
      effective?.og_image_url || effective?.seo_og_image_url || institution?.og_image_url || institution?.seo_og_image_url || generic?.og_image_url || generic?.seo_og_image_url,
    ),
  }
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  return search
}

function buildApiUrl(path: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    throw new Error('COURSES_API_BASE_URL não configurada.')
  }

  const normalizedPath = path.replace(/^\/+/, '')
  const relativePath = /\/api\/v1\/public\/?$/i.test(baseUrl)
    ? normalizedPath.replace(/^api\/v1\/public\/?/i, '')
    : normalizedPath.startsWith('api/v1/public/')
      ? normalizedPath
      : `api/v1/public/${normalizedPath}`

  const url = new URL(relativePath, baseUrl)
  const query = buildQuery(params).toString()
  if (query) url.search = query
  return url.toString()
}

async function apiFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<ApiEnvelope<T>> {
  const apiKey = getApiKey()
  const institutionId = getInstitutionId()

  if (!hasApiConfig()) {
    throw new Error('Catalog API não configurada.')
  }

  const response = await fetch(buildApiUrl(path, params), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-Institution-Id': String(institutionId),
    },
  })

  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!response.ok) {
    throw new Error(json?.message || json?.errors?.[0]?.message || `Courses API request failed with status ${response.status}`)
  }

  if (!json) {
    throw new Error('Courses API returned an empty body.')
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Courses API returned an error.')
  }

  return json
}

async function optionalApiFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<ApiEnvelope<T> | null> {
  try {
    return await apiFetch<T>(path, params)
  } catch {
    return null
  }
}

async function fetchAllPages<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T[]> {
  const items: T[] = []
  let page = 1
  let total = Number.POSITIVE_INFINITY

  while (items.length < total) {
    const envelope = await apiFetch<T[]>(path, {
      ...params,
      page,
      limit: DEFAULT_PAGE_LIMIT,
    })

    const pageItems = Array.isArray(envelope.data) ? envelope.data : []
    items.push(...pageItems)

    const metaTotal = Number(envelope.meta?.total ?? Number.NaN)
    if (Number.isFinite(metaTotal)) {
      total = metaTotal
    } else if (pageItems.length < DEFAULT_PAGE_LIMIT) {
      total = items.length
    }

    if (!pageItems.length || pageItems.length < DEFAULT_PAGE_LIMIT) break
    page += 1
  }

  return items
}

function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)
}

function normalizeAmountCents(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0
}

function withCache<T>(key: string, loader: () => Promise<T>, force = false): Promise<T> {
  if (!force) {
    const cached = cache.get(key)
    if (cached && (DEFAULT_CACHE_TTL_MS === 0 || Date.now() - cached.createdAt <= DEFAULT_CACHE_TTL_MS)) {
      return cached.promise as Promise<T>
    }
  }

  const promise = loader().catch((error) => {
    cache.delete(key)
    throw error
  })

  cache.set(key, {
    createdAt: Date.now(),
    promise,
  })

  return promise
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return []
  const safeConcurrency = Math.max(1, Math.min(concurrency, items.length))
  const results = new Array<R>(items.length)
  let currentIndex = 0

  async function worker() {
    while (currentIndex < items.length) {
      const itemIndex = currentIndex
      currentIndex += 1
      results[itemIndex] = await mapper(items[itemIndex], itemIndex)
    }
  }

  await Promise.all(Array.from({ length: safeConcurrency }, () => worker()))
  return results
}

function resolvePrimaryModality(rawValues: string[]): CourseModality {
  const combined = rawValues.map((value) => normalizeText(value).toLowerCase()).join(' ')
  if (combined.includes('semi')) return 'semipresencial'
  if (combined.includes('presencial') && !combined.includes('ead')) return 'presencial'
  if (combined.includes('ead')) return 'ead'
  if (combined.includes('presencial')) return 'presencial'
  return 'ead'
}

function getModalityLabel(courseType: CourseType, modality: CourseModality) {
  if (courseType === 'pos') {
    if (modality === 'semipresencial') return 'PÓS-GRADUAÇÃO SEMIPRESENCIAL'
    if (modality === 'presencial') return 'PÓS-GRADUAÇÃO PRESENCIAL'
    return 'PÓS-GRADUAÇÃO EAD'
  }

  if (modality === 'semipresencial') return 'GRADUAÇÃO SEMIPRESENCIAL'
  if (modality === 'presencial') return 'GRADUAÇÃO PRESENCIAL'
  return 'GRADUAÇÃO EAD'
}

function getPageModalityLabel(modality: CourseModality) {
  if (modality === 'semipresencial') return 'Semipresencial'
  if (modality === 'presencial') return 'Presencial'
  return 'EAD'
}

function buildPrimaryAreaLabel(areaLabels: string[]) {
  return areaLabels[0] || 'Geral'
}

function buildAreaSlug(areaLabel: string) {
  return toSlug(areaLabel || 'geral') || 'geral'
}

function toAbsoluteMediaUrl(value: string | null | undefined): string {
  const normalized = normalizeText(value)
  if (!normalized) return ''
  if (/^https?:\/\//i.test(normalized)) return normalized

  try {
    return new URL(normalized, getApiBaseUrl()).toString()
  } catch {
    return normalized
  }
}

function resolveDocumentUrl(value: string | null | undefined): string {
  const normalized = normalizeText(value)
  if (!normalized) return ''
  if (/^https?:\/\//i.test(normalized)) return normalized
  if (!normalized.startsWith('/')) return ''

  try {
    return new URL(normalized, getApiBaseUrl()).toString()
  } catch {
    return ''
  }
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = normalizeText(value)
    if (normalized) return normalized
  }
  return ''
}

function normalizePricingItems(items: ApiPricingItem[] | null | undefined): CatalogPriceItem[] {
  return (items ?? [])
    .map((item) => ({
      id: Number(item.id ?? 0),
      amountCents: normalizeAmountCents(item.amount_cents),
      installmentsMax: Number(item.installments_max ?? 0),
      workloadVariantId:
        item.workload_variant_id === null || item.workload_variant_id === undefined
          ? null
          : Number(item.workload_variant_id),
      workloadName: normalizeText(item.workload_name),
      totalHours: Number(item.total_hours ?? 0),
      modality: normalizeText(item.modality),
      validFrom: normalizeText(item.valid_from),
    }))
    .filter((item) => item.id > 0 && item.amountCents > 0)
    .sort((left, right) => {
      if (left.amountCents !== right.amountCents) return left.amountCents - right.amountCents
      if (left.totalHours !== right.totalHours) return left.totalHours - right.totalHours
      return left.installmentsMax - right.installmentsMax
    })
}

function parseMecScoreValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.round(value)
    return rounded >= 1 && rounded <= 5 ? rounded : null
  }

  if (typeof value === 'string') {
    const match = value.match(/\d+(?:[.,]\d+)?/)
    if (!match) return null
    const parsed = Number.parseFloat(match[0].replace(',', '.'))
    if (!Number.isFinite(parsed)) return null
    const rounded = Math.round(parsed)
    return rounded >= 1 && rounded <= 5 ? rounded : null
  }

  return null
}

function resolveMecScore(course: ApiCourseListItem, detail?: ApiCourseDetail | null) {
  const candidates = [
    detail?.mec_score,
    detail?.mec_rating,
    detail?.mec_note,
    detail?.mec_grade,
    detail?.mec_concept,
    detail?.nota_mec,
    detail?.conceito_mec,
    detail?.concept_mec,
    detail?.course_concept,
    detail?.concept,
    course.mec_score,
    course.mec_rating,
    course.mec_note,
    course.mec_grade,
    course.mec_concept,
    course.nota_mec,
    course.conceito_mec,
    course.concept_mec,
    course.course_concept,
    course.concept,
  ]

  for (const candidate of candidates) {
    const score = parseMecScoreValue(candidate)
    if (score) return score
  }

  return null
}

function resolveTccRequired(course: ApiCourseListItem, detail?: ApiCourseDetail | null) {
  const candidates = [
    detail?.tcc_required,
    detail?.requires_tcc,
    detail?.has_tcc,
    detail?.has_course_completion_work,
    course.tcc_required,
    course.requires_tcc,
    course.has_tcc,
    course.has_course_completion_work,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'boolean') return candidate
  }

  return null
}

function parseHoursFromLabel(value: string) {
  const match = value.match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

function normalizeCurriculumVariants(
  variants: ApiCurriculumVariant[] | null | undefined,
): CatalogCurriculumVariant[] {
  return (variants ?? [])
    .map((variant) => ({
      id: Number(variant.workload_variant_id ?? 0),
      name: normalizeText(variant.workload_variant_name) || 'Matriz curricular',
      totalHours: Number(variant.variant_total_hours ?? 0),
      disciplines: (variant.disciplines ?? [])
        .map((discipline) => ({
          id: Number(discipline.discipline_id ?? 0),
          name: normalizeText(discipline.discipline_name),
          hours: Number(discipline.discipline_hours ?? 0),
          sequence: Number(discipline.sequence_no ?? 0),
        }))
        .filter((discipline) => discipline.name)
        .sort((left, right) => left.sequence - right.sequence),
    }))
    .filter((variant) => variant.disciplines.length > 0)
}

function normalizeCourseDisciplinesFallback(
  disciplines: ApiCourseDiscipline[] | null | undefined,
  priceItems: CatalogPriceItem[],
): CatalogCurriculumVariant[] {
  const normalizedDisciplines = (disciplines ?? [])
    .map((discipline) => ({
      id: Number(discipline.id ?? 0),
      name: normalizeText(discipline.name),
      hours: Number(discipline.discipline_hours ?? 0),
      sequence: Number(discipline.sequence_no ?? discipline.sort_order ?? 0),
    }))
    .filter((discipline) => discipline.name)
    .sort((left, right) => left.sequence - right.sequence)

  if (!normalizedDisciplines.length) return []

  const workloadVariants = Array.from(
    new Map(
      priceItems
        .filter((item) => item.totalHours > 0)
        .map((item) => [
          item.workloadVariantId || item.totalHours,
          {
            id: item.workloadVariantId || item.totalHours,
            name: item.workloadName || `${item.totalHours} Horas`,
            totalHours: item.totalHours,
          },
        ]),
    ).values(),
  ).sort((left, right) => left.totalHours - right.totalHours)

  if (!workloadVariants.length) {
    const totalHours = normalizedDisciplines.reduce((sum, discipline) => sum + discipline.hours, 0)
    return [
      {
        id: 1,
        name: totalHours ? `${totalHours} Horas` : 'Matriz curricular',
        totalHours,
        disciplines: normalizedDisciplines,
      },
    ]
  }

  return workloadVariants.map((variant) => {
    const targetHours = variant.totalHours
    const disciplinesForVariant =
      targetHours > 0
        ? normalizedDisciplines.filter((discipline) => {
            const cumulative = normalizedDisciplines
              .slice(0, normalizedDisciplines.indexOf(discipline) + 1)
              .reduce((sum, current) => sum + current.hours, 0)
            return cumulative <= targetHours || cumulative === discipline.hours
          })
        : normalizedDisciplines

    return {
      id: variant.id,
      name: variant.name,
      totalHours: targetHours,
      disciplines: disciplinesForVariant.length ? disciplinesForVariant : normalizedDisciplines,
    }
  })
}

function getFallbackGraduationMonthlyAmount(title: string, modality: CourseModality) {
  const normalizedTitle = normalizeComparableText(title)
  if (normalizedTitle.includes('psicologia')) return 54900
  if (normalizedTitle.includes('pedagogia')) return 24900
  if (modality === 'presencial') return 54900
  return 14900
}

function getFallbackPostMonthlyAmount() {
  return 8600
}

function resolveGraduationMonthlyAmount(course: ApiCourseListItem, priceItems: CatalogPriceItem[], title: string, modality: CourseModality) {
  const directPrice = priceItems[0]?.amountCents || normalizeAmountCents(course.min_amount_cents)
  if (!directPrice) return getFallbackGraduationMonthlyAmount(title, modality)
  return directPrice > 100000 ? Math.round(directPrice / 18) : directPrice
}

function resolvePostTotalPriceCents(course: ApiCourseListItem, priceItems: CatalogPriceItem[]) {
  const posPriceCents = normalizeAmountCents(course.pos_price_cents)
  if (posPriceCents) return posPriceCents

  const directPrice = priceItems[0]?.amountCents || normalizeAmountCents(course.min_amount_cents)
  if (!directPrice) return getFallbackPostMonthlyAmount() * 18
  return directPrice > 40000 ? directPrice : directPrice * 18
}

function getFallbackCourseImage(courseType: CourseType, courseValue: string) {
  if (courseType === 'graduacao') {
    if (courseValue.includes('psicologia')) return '/landing/faculdade-de-psicologia-logo.webp'
    return '/landing/logo-faculdade-unicesp.webp'
  }

  return '/landing/posgraduacao-banner.webp'
}

function resolveCourseImage(
  courseType: CourseType,
  courseValue: string,
  listItem: ApiCourseListItem,
  media?: ApiCourseMedia | null,
) {
  const galleryUrls = (media?.gallery_urls ?? []).map((item) => toAbsoluteMediaUrl(item)).filter(Boolean)
  const image = toAbsoluteMediaUrl(
    firstNonEmpty(
      media?.main_image_url,
      media?.image?.original_path,
      media?.image?.thumb_path,
      listItem.main_image_url,
      pickSeoFields(listItem.seo).ogImageUrl,
      galleryUrls[0],
    ),
  )

  return {
    image: image || getFallbackCourseImage(courseType, courseValue),
    galleryImages: galleryUrls,
  }
}

function buildGeneratedDescription(courseType: CourseType, title: string) {
  if (courseType === 'pos') {
    return `Conheça a Pós-graduação em ${title} e continue sua inscrição.`
  }

  return `Conheça a Graduação em ${title} e continue sua inscrição.`
}

function summarizeCourse(course: CatalogCourse): CatalogCourseSummary {
  return {
    institutionId: course.institutionId,
    institutionName: course.institutionName,
    institutionSlug: course.institutionSlug,
    courseType: course.courseType,
    courseId: course.courseId,
    slug: course.slug,
    value: course.value,
    path: course.path,
    title: course.title,
    rawLabel: course.rawLabel,
    image: course.image,
    currentInstallmentPrice: course.currentInstallmentPrice,
    currentInstallmentPriceMonthly: course.currentInstallmentPriceMonthly,
    oldInstallmentPrice: course.oldInstallmentPrice,
    modality: course.modality,
    modalityBadge: course.modalityBadge,
    areaSlug: course.areaSlug,
    primaryAreaLabel: course.primaryAreaLabel,
    fixedInstallments: course.fixedInstallments,
  }
}

function buildCourseFromApi(
  courseType: CourseType,
  listItem: ApiCourseListItem,
  detail: ApiCourseDetail | null,
  media: ApiCourseMedia | null,
  pricingItems: CatalogPriceItem[],
  curriculumVariants: CatalogCurriculumVariant[],
): CatalogCourse {
  const seo = pickSeoFields(detail?.seo ?? listItem.seo)
  const rawLabel = firstNonEmpty(detail?.name, listItem.name)
  const title = getCourseDisplayTitle({
    courseType,
    courseLabel: seo.courseName || rawLabel,
  })
  const slug = toSlug(seo.slug || title || rawLabel || `curso-${listItem.id}`)
  const value = `${courseType}-${slug}`
  const path = getCoursePath({
    courseType,
    courseValue: value,
    courseLabel: rawLabel,
  })
  const areaLabels = (detail?.area_names ?? listItem.area_names ?? []).map((item) => normalizeText(item)).filter(Boolean)
  const modality = resolvePrimaryModality([
    listItem.modalities ?? '',
    listItem.offering_modality ?? '',
    detail?.offering_modality ?? '',
    ...pricingItems.map((item) => item.modality),
  ])
  const resolvedMedia = resolveCourseImage(courseType, value, { ...listItem, seo: detail?.seo ?? listItem.seo }, media)
  const finalCurriculumVariants =
    curriculumVariants.length > 0
      ? curriculumVariants
      : normalizeCourseDisciplinesFallback(detail?.course_disciplines ?? listItem.course_disciplines, pricingItems)

  const workloadOptions = Array.from(
    new Set(
      [
        ...pricingItems.map((item) => (item.totalHours ? `${item.totalHours} Horas` : '')),
        ...finalCurriculumVariants.map((variant) =>
          variant.totalHours ? `${variant.totalHours} Horas` : variant.name,
        ),
      ].filter(Boolean),
    ),
  ).sort((left, right) => parseHoursFromLabel(left) - parseHoursFromLabel(right))

  const durationMonths = Number(detail?.duration_months ?? listItem.duration_months ?? 0)
  const durationContinuousMonths = Number(
    detail?.duration_continuous_months ?? listItem.duration_continuous_months ?? 0,
  )
  const semesterCount = Number(detail?.semester_count ?? listItem.semester_count ?? 0)
  const durationText =
    normalizeText(detail?.duration ?? listItem.duration) ||
    (semesterCount ? `${semesterCount} semestres` : durationMonths ? `${durationMonths} meses` : '')

  const monthlyGraduationAmount = resolveGraduationMonthlyAmount(listItem, pricingItems, title, modality)
  const postTotalPriceCents = resolvePostTotalPriceCents(listItem, pricingItems)
  const postMonthlyAmount = Math.max(1, Math.round(postTotalPriceCents / 18))

  const currentInstallmentPrice =
    courseType === 'pos'
      ? `18X DE ${formatCurrency(postMonthlyAmount)}`.toUpperCase()
      : `${formatCurrency(monthlyGraduationAmount).toUpperCase()}/MÊS`
  const currentInstallmentPriceMonthly =
    courseType === 'pos'
      ? `18X ${formatCurrency(postMonthlyAmount).toUpperCase()}/MÊS`
      : `${formatCurrency(monthlyGraduationAmount).toUpperCase()}/MÊS`
  const oldInstallmentPrice =
    courseType === 'pos'
      ? `18X ${formatCurrency(Math.round(postMonthlyAmount * 1.53)).toUpperCase()}`
      : modality === 'presencial'
        ? 'De R$ 1.890,00'
        : `De ${formatCurrency(Math.round(monthlyGraduationAmount * 1.4)).toUpperCase()}`

  const description =
    normalizeRichText(firstNonEmpty(detail?.description, listItem.description, seo.description)) ||
    buildGeneratedDescription(courseType, title)
  const seoDescription =
    normalizeRichText(firstNonEmpty(seo.description, detail?.description, listItem.description)) ||
    description

  return {
    institutionId: getInstitutionId(),
    institutionName: 'PSICOLOGIA',
    institutionSlug: 'psicologia',
    courseType,
    courseId: Number(listItem.id ?? 0),
    code: firstNonEmpty(detail?.code, listItem.code),
    slug,
    value,
    path,
    title,
    rawLabel,
    description,
    seoDescription,
    areaLabels,
    primaryAreaLabel: buildPrimaryAreaLabel(areaLabels),
    areaSlug: buildAreaSlug(buildPrimaryAreaLabel(areaLabels)),
    modality,
    modalityLabel: getPageModalityLabel(modality),
    modalityBadge: getModalityLabel(courseType, modality),
    offeringModalityText: normalizeText(detail?.offering_modality ?? listItem.offering_modality),
    image: resolvedMedia.image,
    galleryImages: resolvedMedia.galleryImages,
    posPriceCents: courseType === 'pos' ? postTotalPriceCents : 0,
    currentInstallmentPrice,
    currentInstallmentPriceMonthly,
    oldInstallmentPrice,
    pixText: '',
    fixedInstallments: false,
    teachingPlanUrl: resolveDocumentUrl(media?.teaching_plan?.teaching_plan_path ?? detail?.teaching_plan_path ?? listItem.teaching_plan_path),
    priceItems: pricingItems,
    workloadOptions,
    curriculumVariants: finalCurriculumVariants,
    targetAudience: normalizeRichText(detail?.target_audience ?? listItem.target_audience),
    competenciesBenefits: normalizeRichText(
      detail?.competencies_benefits ?? listItem.competencies_benefits,
    ),
    competitiveDifferentials: normalizeRichText(
      detail?.competitive_differentials ?? listItem.competitive_differentials,
    ),
    durationMonths,
    durationContinuousMonths,
    semesterCount,
    durationText,
    mecOrdinance: normalizeRichText(detail?.mec_ordinance ?? listItem.mec_ordinance),
    mecOrdinanceDocumentUrl: resolveDocumentUrl(
      detail?.mec_ordinance_document_path ?? listItem.mec_ordinance_document_path,
    ),
    recognition: normalizeRichText(detail?.recognition ?? listItem.recognition),
    recognitionDocumentUrl: resolveDocumentUrl(
      detail?.recognition_document_path ?? listItem.recognition_document_path,
    ),
    mecScore: resolveMecScore(listItem, detail),
    tccRequired: resolveTccRequired(listItem, detail),
    titulation: normalizeText(detail?.titulation ?? listItem.titulation),
    laborMarket: normalizeRichText(detail?.labor_market ?? listItem.labor_market),
  }
}

function buildCourseSummaryFromApi(courseType: CourseType, listItem: ApiCourseListItem): CatalogCourseSummary {
  const summaryCourse = buildCourseFromApi(courseType, listItem, null, null, normalizePricingItems(listItem.featured_pricing_options), [])
  return summarizeCourse(summaryCourse)
}

function dedupeCourses<T extends { courseId: number; title: string; modality: string }>(courses: T[]): T[] {
  const deduped = new Map<string, T>()

  for (const course of courses) {
    const key = course.courseId > 0 ? `${course.courseId}:${course.modality}` : `${normalizeComparableText(course.title)}:${course.modality}`
    const current = deduped.get(key)
    if (!current) {
      deduped.set(key, course)
      continue
    }

    const currentScore = (current.title ? 1 : 0) + (current.courseId > 0 ? 1 : 0)
    const nextScore = (course.title ? 1 : 0) + (course.courseId > 0 ? 1 : 0)
    if (nextScore >= currentScore) {
      deduped.set(key, course)
    }
  }

  return [...deduped.values()]
}

async function getCourseList(courseType: CourseType, force = false): Promise<ApiCourseListItem[]> {
  return withCache(`catalog:list:${courseType}`, async () => {
    if (!hasApiConfig()) return []

    const items = await fetchAllPages<ApiCourseListItem>('courses', {
      level: courseType === 'graduacao' ? undefined : courseType,
      show_disciplines: 'N',
      price: 'S',
    })

    return courseType === 'graduacao'
      ? items.filter((course) => normalizeText(course.level).toLowerCase() === 'graduacao')
      : items.filter((course) => normalizeText(course.level).toLowerCase() === 'pos')
  }, force)
}

async function getCourseBundle(courseId: number, force = false) {
  return withCache(`catalog:bundle:${courseId}`, async () => {
    if (!courseId || !hasApiConfig()) {
      return {
        detail: null,
        media: null,
        pricingItems: [] as CatalogPriceItem[],
        curriculumVariants: [] as CatalogCurriculumVariant[],
      }
    }

    const [detailEnvelope, mediaEnvelope, pricingEnvelope, curriculumEnvelope] = await Promise.all([
      optionalApiFetch<ApiCourseDetail>(`courses/${courseId}`),
      optionalApiFetch<ApiCourseMedia>(`courses/${courseId}/media`),
      optionalApiFetch<{ items?: ApiPricingItem[] }>(`courses/${courseId}/pricing-by-workload`),
      optionalApiFetch<{ variants?: ApiCurriculumVariant[] }>(`courses/${courseId}/curriculum`),
    ])

    return {
      detail: detailEnvelope?.data ?? null,
      media: mediaEnvelope?.data ?? null,
      pricingItems: normalizePricingItems(pricingEnvelope?.data?.items),
      curriculumVariants: normalizeCurriculumVariants(curriculumEnvelope?.data?.variants),
    }
  }, force)
}

async function getCatalogCourses(courseType: CourseType, force = false): Promise<CatalogCourse[]> {
  return withCache(`catalog:courses:${courseType}`, async () => {
    if (!hasApiConfig()) return []
    const list = await getCourseList(courseType, force)
    const courses = await mapWithConcurrency(list, 6, async (item) => {
      const bundle = await getCourseBundle(Number(item.id ?? 0), force)
      return buildCourseFromApi(courseType, item, bundle.detail, bundle.media, bundle.pricingItems, bundle.curriculumVariants)
    })
    return dedupeCourses(courses)
  }, force)
}

async function getCatalogCourseSummaries(courseType: CourseType, force = false): Promise<CatalogCourseSummary[]> {
  return withCache(`catalog:summaries:${courseType}`, async () => {
    const list = await getCourseList(courseType, force)
    return dedupeCourses(list.map((item) => buildCourseSummaryFromApi(courseType, item)))
  }, force)
}

async function getCatalogCourseBySlug(
  courseType: CourseType,
  slug: string,
  force = false,
): Promise<CatalogCourse | null> {
  return withCache(`catalog:by-slug:${courseType}:${slug}`, async () => {
    const normalizedSlug = normalizeText(slug)
    if (!normalizedSlug) return null

    const list = await getCourseList(courseType, force)
    const match = list.find((item) => buildCourseSummaryFromApi(courseType, item).slug === normalizedSlug)
    if (!match) return null

    const bundle = await getCourseBundle(Number(match.id ?? 0), force)
    return buildCourseFromApi(courseType, match, bundle.detail, bundle.media, bundle.pricingItems, bundle.curriculumVariants)
  }, force)
}

async function getCatalogCourseById(
  courseType: CourseType,
  courseId: number,
  force = false,
): Promise<CatalogCourse | null> {
  return withCache(`catalog:by-id:${courseType}:${courseId}`, async () => {
    if (!Number.isInteger(courseId) || courseId <= 0) return null

    const list = await getCourseList(courseType, force)
    const match = list.find((item) => Number(item.id ?? 0) === courseId)
    if (!match) return null

    const bundle = await getCourseBundle(courseId, force)
    return buildCourseFromApi(courseType, match, bundle.detail, bundle.media, bundle.pricingItems, bundle.curriculumVariants)
  }, force)
}

export async function getGraduationCatalogCourses(force = false) {
  return getCatalogCourses('graduacao', force)
}

export async function getPostCatalogCourses(force = false) {
  return getCatalogCourses('pos', force)
}

export async function getGraduationCatalogCourseBySlug(slug: string, force = false) {
  return getCatalogCourseBySlug('graduacao', slug, force)
}

export async function getPostCatalogCourseBySlug(slug: string, force = false) {
  return getCatalogCourseBySlug('pos', slug, force)
}

export async function getGraduationCatalogCourseById(courseId: number, force = false) {
  return getCatalogCourseById('graduacao', courseId, force)
}

export async function getPostCatalogCourseById(courseId: number, force = false) {
  return getCatalogCourseById('pos', courseId, force)
}

export async function getGraduationCatalogCourseSummaries(force = false) {
  return getCatalogCourseSummaries('graduacao', force)
}

export async function getPostCatalogCourseSummaries(force = false) {
  return getCatalogCourseSummaries('pos', force)
}

export function splitDifferentials(text: string): string[] {
  const parsed = normalizeMultilineText(text)
    .split(/\n+/)
    .map((line) => line.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean)

  return parsed.length ? parsed : [normalizeText(text)].filter(Boolean)
}
