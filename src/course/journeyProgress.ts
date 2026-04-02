const JOURNEY_PROGRESS_KEY = 'fp:journey-progress'
const JOURNEY_PROGRESS_TTL_MS = 1000 * 60 * 60 * 24 * 7

export type JourneyCourseType = 'graduacao' | 'pos'

export type StoredJourneyProgress = {
  journeyId: number
  journeyUuid?: string
  courseType: JourneyCourseType
  courseId: number
  courseLabel: string
  courseValue?: string
  fullName?: string
  email?: string
  phone?: string
  workloadVariantId?: number
  workloadLabel?: string
  cpf?: string
  pricingId?: number
  paymentPlanLabel?: string
  currentStep?: number | string | null
  status?: string | null
  createdAt: number
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function saveJourneyProgress(progress: Omit<StoredJourneyProgress, 'createdAt'>): void {
  if (!isBrowser()) return

  const payload: StoredJourneyProgress = {
    ...progress,
    createdAt: Date.now(),
  }

  window.sessionStorage.setItem(JOURNEY_PROGRESS_KEY, JSON.stringify(payload))
}

export function readJourneyProgress(): StoredJourneyProgress | null {
  if (!isBrowser()) return null

  const raw = window.sessionStorage.getItem(JOURNEY_PROGRESS_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredJourneyProgress
    if (!parsed.createdAt || Date.now() - parsed.createdAt > JOURNEY_PROGRESS_TTL_MS) {
      clearJourneyProgress()
      return null
    }

    if (!parsed.journeyId || !parsed.courseId || !parsed.courseType) {
      clearJourneyProgress()
      return null
    }

    return parsed
  } catch {
    clearJourneyProgress()
    return null
  }
}

export function clearJourneyProgress(): void {
  if (!isBrowser()) return
  window.sessionStorage.removeItem(JOURNEY_PROGRESS_KEY)
}

export function matchesJourneyProgress(
  progress: Pick<StoredJourneyProgress, 'courseType' | 'courseId' | 'courseLabel' | 'courseValue'>,
  currentCourse: {
    courseType: JourneyCourseType
    courseId?: number
    courseLabel: string
    courseValue?: string
  },
): boolean {
  if (progress.courseType !== currentCourse.courseType) return false

  if (progress.courseId > 0 && currentCourse.courseId && progress.courseId === currentCourse.courseId) {
    return true
  }

  if (progress.courseValue && currentCourse.courseValue) {
    return progress.courseValue === currentCourse.courseValue
  }

  return progress.courseLabel.trim().toLowerCase() === currentCourse.courseLabel.trim().toLowerCase()
}
