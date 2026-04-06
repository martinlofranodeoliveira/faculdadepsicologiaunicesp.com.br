export type CourseRouteInput = {
  courseType: 'graduacao' | 'pos'
  courseValue?: string
  courseLabel: string
}

const POST_SLUG_PREFIXES = [
  'pos-graduacao-em-',
  'pos-graduacao-',
  'posgraduacao-em-',
  'posgraduacao-',
  'pos-em-',
  'pos-',
  'especializacao-em-',
  'especializacao-',
]

const GRADUATION_SLUG_PREFIXES = ['graduacao-em-', 'graduacao-']

export function normalizeComparableText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function toSlug(value: string): string {
  return normalizeComparableText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeCourseSlugByType(
  courseType: CourseRouteInput['courseType'],
  value: string,
): string {
  const fallbackSlug = toSlug(value)
  if (!fallbackSlug) return ''

  let normalizedSlug = fallbackSlug
  const prefixes = courseType === 'pos' ? POST_SLUG_PREFIXES : GRADUATION_SLUG_PREFIXES

  let changed = true
  while (changed) {
    changed = false
    for (const prefix of prefixes) {
      if (normalizedSlug.startsWith(prefix)) {
        normalizedSlug = normalizedSlug.slice(prefix.length)
        changed = true
      }
    }
  }

  return normalizedSlug || fallbackSlug
}

export function stripGraduationModality(label: string): string {
  return label
    .replace(/\s*\((?:semipresencial|presencial|ead)\)\s*/gi, ' ')
    .replace(/\b(?:semipresencial|presencial|ead)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stripPostGraduationPrefix(label: string): string {
  const trimmed = label.trim()
  const normalized = normalizeComparableText(trimmed)

  for (const prefix of ['pos-graduacao em ', 'pos graduação em ', 'especializacao em ']) {
    if (normalized.startsWith(prefix)) {
      return trimmed.slice(prefix.length).trim()
    }
  }

  return trimmed
}

export function isMbaCourseTitle(label: string): boolean {
  const normalized = normalizeComparableText(label)
  return normalized === 'mba' || normalized.startsWith('mba ')
}

export function formatPostCourseHeading(label: string): string {
  const title = stripPostGraduationPrefix(label)
  return isMbaCourseTitle(title) ? title : `Pós-graduação em ${title}`
}

export function getCourseDisplayTitle(input: CourseRouteInput): string {
  if (input.courseType === 'graduacao') {
    return stripGraduationModality(input.courseLabel)
  }

  return stripPostGraduationPrefix(input.courseLabel)
}

export function getCourseSlug(input: CourseRouteInput): string {
  if (input.courseValue) {
    return normalizeCourseSlugByType(input.courseType, input.courseValue)
  }

  return normalizeCourseSlugByType(input.courseType, getCourseDisplayTitle(input))
}

export function getCoursePath(
  input: CourseRouteInput,
  options?: {
    leadSubmitted?: boolean
  },
): string {
  const prefix = input.courseType === 'pos' ? '/pos-graduacao' : '/graduacao'
  const pathname = `${prefix}/${getCourseSlug(input)}`

  if (!options?.leadSubmitted) return pathname
  return `${pathname}?lead=1`
}
