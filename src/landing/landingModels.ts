import type { CourseLeadSelection } from './crmLead'

export type LandingPostCourseWorkload = {
  value: string
  label: string
}

export type LandingCurriculumTerm = {
  id: string
  label: string
  name: string
  totalHours: number
  subjects: string[]
}

export type LandingPostCourse = {
  id: string
  title: string
  imageSrc: string
  currentInstallmentPrice: string
  currentInstallmentPriceDisplay: string
  oldInstallmentPrice: string
  hoursLabel: string
  workloadOptions: LandingPostCourseWorkload[]
  selection: CourseLeadSelection
}

export type LandingPageData = {
  heroSelection: CourseLeadSelection
  postCourses: LandingPostCourse[]
  curriculumTerms: LandingCurriculumTerm[]
}
