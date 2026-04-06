import { siteConfig } from '@/site/config'
import {
  fallbackGraduationCourses,
  fallbackGraduationCourseSummaries,
  fallbackPostCourses,
  fallbackPostCourseSummaries,
} from '@/site/fallbackCatalog'

import {
  getGraduationCatalogCourseById,
  getGraduationCatalogCourseBySlug,
  getGraduationCatalogCourses,
  getGraduationCatalogCourseSummaries,
  getPostCatalogCourseById,
  getPostCatalogCourseBySlug,
  getPostCatalogCourses,
  getPostCatalogCourseSummaries,
  type CatalogCourse,
  type CatalogCourseSummary,
} from './catalogApi'
import { normalizeComparableText } from './courseRoutes'

export type CoursePageEntry = CatalogCourse
export type CoursePageSummaryEntry = CatalogCourseSummary

function isPrimaryGraduationCourse(course: CatalogCourse | CatalogCourseSummary) {
  const target = normalizeComparableText(siteConfig.primaryGraduationSlug)
  return (
    normalizeComparableText(course.slug) === target ||
    normalizeComparableText(course.value).includes(target) ||
    normalizeComparableText(course.title).includes(target) ||
    normalizeComparableText(course.rawLabel).includes(target)
  )
}

function filterGraduationCourses<T extends CatalogCourse | CatalogCourseSummary>(courses: T[]) {
  return courses.filter((course) => isPrimaryGraduationCourse(course))
}

function filterPostCourses<T extends CatalogCourse | CatalogCourseSummary>(courses: T[]) {
  return courses
}

function useFallbackCourses<T>(courses: T[], fallbackCourses: T[]) {
  return courses.length ? courses : fallbackCourses
}

export async function getGraduationCoursePages(force = false): Promise<CoursePageEntry[]> {
  const courses = filterGraduationCourses(await getGraduationCatalogCourses(force))
  return useFallbackCourses(courses, fallbackGraduationCourses)
}

export async function getPostCoursePages(force = false): Promise<CoursePageEntry[]> {
  const courses = filterPostCourses(await getPostCatalogCourses(force))
  return useFallbackCourses(courses, fallbackPostCourses)
}

export async function getGraduationCoursePageBySlug(
  slug: string,
  force = false,
): Promise<CoursePageEntry | null> {
  const directMatch = await getGraduationCatalogCourseBySlug(slug, force)
  if (directMatch && isPrimaryGraduationCourse(directMatch)) return directMatch

  return fallbackGraduationCourses.find((course) => course.slug === slug) ?? null
}

export async function getPostCoursePageBySlug(
  slug: string,
  force = false,
): Promise<CoursePageEntry | null> {
  const directMatch = await getPostCatalogCourseBySlug(slug, force)
  if (directMatch && filterPostCourses([directMatch]).length) return directMatch

  return fallbackPostCourses.find((course) => course.slug === slug) ?? null
}

export async function getGraduationCoursePageById(
  courseId: number,
  force = false,
): Promise<CoursePageEntry | null> {
  const directMatch = await getGraduationCatalogCourseById(courseId, force)
  if (directMatch && isPrimaryGraduationCourse(directMatch)) return directMatch

  return fallbackGraduationCourses.find((course) => course.courseId === courseId) ?? null
}

export async function getPostCoursePageById(
  courseId: number,
  force = false,
): Promise<CoursePageEntry | null> {
  const directMatch = await getPostCatalogCourseById(courseId, force)
  if (directMatch && filterPostCourses([directMatch]).length) return directMatch

  return fallbackPostCourses.find((course) => course.courseId === courseId) ?? null
}

export async function getGraduationCoursePageSummaries(
  force = false,
): Promise<CoursePageSummaryEntry[]> {
  const courses = filterGraduationCourses(await getGraduationCatalogCourseSummaries(force))
  return useFallbackCourses(courses, fallbackGraduationCourseSummaries)
}

export async function getPostCoursePageSummaries(force = false): Promise<CoursePageSummaryEntry[]> {
  const courses = filterPostCourses(await getPostCatalogCourseSummaries(force))
  return useFallbackCourses(courses, fallbackPostCourseSummaries)
}
