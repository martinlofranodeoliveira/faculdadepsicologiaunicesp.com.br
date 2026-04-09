import { normalizeComparableText } from '@/lib/courseRoutes'

export type StoredCourseLeadDraft = {
  courseType: 'graduacao' | 'pos'
  courseValue?: string
  courseLabel: string
  courseId?: number
  workloadValue?: string
  workloadLabel?: string
  openStep?: 1 | 2
  leadSubmitted?: boolean
  fullName: string
  email: string
  phone: string
  createdAt: number
}

const COURSE_LEAD_DRAFT_KEY = 'fp:course-lead-draft'
const COURSE_LEAD_DRAFT_TTL_MS = 1000 * 60 * 60 * 6

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function saveCourseLeadDraft(draft: Omit<StoredCourseLeadDraft, 'createdAt'>): void {
  if (!isBrowser()) return

  const payload: StoredCourseLeadDraft = {
    ...draft,
    createdAt: Date.now(),
  }

  window.sessionStorage.setItem(COURSE_LEAD_DRAFT_KEY, JSON.stringify(payload))
}

export function readCourseLeadDraft(): StoredCourseLeadDraft | null {
  if (!isBrowser()) return null

  const raw = window.sessionStorage.getItem(COURSE_LEAD_DRAFT_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredCourseLeadDraft
    if (!parsed.createdAt || Date.now() - parsed.createdAt > COURSE_LEAD_DRAFT_TTL_MS) {
      clearCourseLeadDraft()
      return null
    }

    return parsed
  } catch {
    clearCourseLeadDraft()
    return null
  }
}

export function clearCourseLeadDraft(): void {
  if (!isBrowser()) return
  window.sessionStorage.removeItem(COURSE_LEAD_DRAFT_KEY)
}

export function matchesCourseLeadDraft(
  draft: Pick<StoredCourseLeadDraft, 'courseType' | 'courseValue' | 'courseLabel' | 'courseId'>,
  currentCourse: {
    courseType: 'graduacao' | 'pos'
    courseId?: number
    courseValue?: string
    courseLabel: string
  },
): boolean {
  if (draft.courseType !== currentCourse.courseType) return false

  if (draft.courseId && currentCourse.courseId) {
    return draft.courseId === currentCourse.courseId
  }

  if (draft.courseValue && currentCourse.courseValue) {
    return draft.courseValue === currentCourse.courseValue
  }

  return (
    normalizeComparableText(draft.courseLabel) ===
    normalizeComparableText(currentCourse.courseLabel)
  )
}
