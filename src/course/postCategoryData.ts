import { getPostCoursePageSummaries } from '@/lib/courseCatalog'

export type PostCategoryCourse = {
  path: string
  title: string
  courseLabel: string
  courseValue: string
  courseId: number
  institutionId: number
  image: string
  currentInstallmentPrice: string
  oldInstallmentPrice: string
  modality: string
  modalityBadge: string
  area: string
  areaLabel: string
}

function normalizePriceLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toUpperCase()
}

export async function getPostCategoryCourses(force = false): Promise<PostCategoryCourse[]> {
  const entries = await getPostCoursePageSummaries(force)

  return entries.map((course) => ({
    path: course.path,
    title: course.title,
    courseLabel: course.rawLabel,
    courseValue: course.value,
    courseId: course.courseId,
    institutionId: course.institutionId,
    image: course.image,
    currentInstallmentPrice: normalizePriceLabel(course.currentInstallmentPriceMonthly || course.currentInstallmentPrice),
    oldInstallmentPrice: normalizePriceLabel(course.oldInstallmentPrice),
    modality: course.modality,
    modalityBadge: course.modalityBadge,
    area: course.areaSlug,
    areaLabel: course.primaryAreaLabel,
  }))
}
