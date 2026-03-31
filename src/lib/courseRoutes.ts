export type CourseRouteInput = {
  courseType: 'graduacao' | 'pos'
  courseValue?: string
  courseLabel: string
}

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
    if (input.courseValue.startsWith('graduacao-')) {
      return input.courseValue.replace(/^graduacao-/, '')
    }

    if (input.courseValue.startsWith('pos-')) {
      return input.courseValue.replace(/^pos-/, '')
    }
  }

  return toSlug(getCourseDisplayTitle(input))
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
