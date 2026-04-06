import type { CatalogCourse } from '@/lib/catalogApi'
import { getGraduationCoursePageBySlug, getPostCoursePages } from '@/lib/courseCatalog'
import { toSlug } from '@/lib/courseRoutes'
import { siteConfig } from '@/site/config'

import type { CourseLeadSelection } from './crmLead'
import type { LandingPageData, LandingPostCourse, LandingPostCourseWorkload } from './landingModels'

const DEFAULT_HERO_SELECTION: CourseLeadSelection = {
  courseType: 'graduacao',
  courseValue: 'graduacao-psicologia',
  courseLabel: 'Graduação em Psicologia Presencial',
  coursePath: '/graduacao/psicologia',
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizePriceLabel(value: string) {
  return normalizeText(value).toUpperCase()
}

function formatPriceForDisplay(value: string) {
  const normalized = normalizeText(value)
  if (!normalized) return 'Consulte as condições'
  return normalized.replace(/\/m[eê]s/i, ' por mês')
}

function resolveCourseImage(image: string) {
  const normalized = normalizeText(image)
  if (!normalized || normalized.includes('posgraduacao-banner')) {
    return '/course/image_fx_19_1.webp'
  }

  return normalized
}

function buildWorkloadValue(label: string, index: number) {
  const slug = toSlug(label)
  return slug ? slug : `carga-${index + 1}`
}

function buildWorkloadOptions(course: CatalogCourse): LandingPostCourseWorkload[] {
  const unique = new Set<string>()

  return course.workloadOptions
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .filter((label) => {
      const key = label.toLowerCase()
      if (unique.has(key)) return false
      unique.add(key)
      return true
    })
    .sort((left, right) => {
      const leftHours = Number.parseInt(left.match(/(\d+)/)?.[1] ?? '0', 10)
      const rightHours = Number.parseInt(right.match(/(\d+)/)?.[1] ?? '0', 10)

      if (leftHours !== rightHours) return leftHours - rightHours
      return left.localeCompare(right, 'pt-BR')
    })
    .map((label, index) => ({
      value: buildWorkloadValue(label, index),
      label,
    }))
}

function buildHoursLabel(workloadOptions: LandingPostCourseWorkload[]) {
  const uniqueHours = [...new Set(
    workloadOptions
      .map((item) => item.label.match(/(\d+)/)?.[1] ?? '')
      .filter(Boolean),
  )]

  if (!uniqueHours.length) return ''
  if (uniqueHours.length === 1) return `${uniqueHours[0]}H`
  if (uniqueHours.length === 2) return `${uniqueHours[0]}H OU ${uniqueHours[1]}H`

  return uniqueHours.map((item) => `${item}H`).join(' | ')
}

function buildHeroSelection(course: CatalogCourse | null): CourseLeadSelection {
  if (!course) return DEFAULT_HERO_SELECTION

  return {
    courseType: 'graduacao',
    courseValue: course.value || DEFAULT_HERO_SELECTION.courseValue,
    courseLabel: normalizeText(course.rawLabel || course.title) || DEFAULT_HERO_SELECTION.courseLabel,
    courseId: course.courseId > 0 ? course.courseId : DEFAULT_HERO_SELECTION.courseId,
    coursePath: normalizeText(course.path) || DEFAULT_HERO_SELECTION.coursePath,
  }
}

function buildLandingPostCourse(course: CatalogCourse): LandingPostCourse {
  const workloadOptions = buildWorkloadOptions(course)
  const currentInstallmentPrice = normalizePriceLabel(
    course.currentInstallmentPriceMonthly || course.currentInstallmentPrice,
  )
  const oldInstallmentPrice = normalizePriceLabel(course.oldInstallmentPrice)

  return {
    id: course.value || `${course.courseId}`,
    title: normalizeText(course.title || course.rawLabel),
    imageSrc: resolveCourseImage(course.image),
    currentInstallmentPrice,
    currentInstallmentPriceDisplay: formatPriceForDisplay(currentInstallmentPrice),
    oldInstallmentPrice,
    hoursLabel: buildHoursLabel(workloadOptions),
    workloadOptions,
    selection: {
      courseType: 'pos',
      courseValue: course.value,
      courseLabel: normalizeText(course.rawLabel || course.title),
      courseId: course.courseId > 0 ? course.courseId : undefined,
      coursePath: course.path,
      priceLabel: currentInstallmentPrice,
    },
  }
}

function sortPostCourses(courses: LandingPostCourse[]) {
  return [...courses].sort((left, right) =>
    left.selection.courseLabel.localeCompare(right.selection.courseLabel, 'pt-BR'),
  )
}

export async function getLandingPageData(force = false): Promise<LandingPageData> {
  const [graduationCourse, postCourses] = await Promise.all([
    getGraduationCoursePageBySlug(siteConfig.primaryGraduationSlug, force),
    getPostCoursePages(force),
  ])

  return {
    heroSelection: buildHeroSelection(graduationCourse),
    postCourses: sortPostCourses(postCourses.map(buildLandingPostCourse)),
  }
}
