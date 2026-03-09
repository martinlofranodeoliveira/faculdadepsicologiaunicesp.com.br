export type PostWorkloadOption = {
  value: string
  label: string
}

export type PsychologyPostCourseCatalogItem = {
  title: string
  fallbackValue: string
  aliases: string[]
  featureLabel: string
  workloads: PostWorkloadOption[]
  fallbackCourseId?: number
  imageSrc?: string
  featured?: boolean
}

export const PSYCHOLOGY_POST_COURSES: PsychologyPostCourseCatalogItem[] = [
  {
    title: 'NEUROPSICOLOGIA',
    fallbackValue: 'pos-neuropsicologia',
    aliases: ['NEUROPSICOLOGIA'],
    imageSrc: '/landing/neuropsicologia.webp',
    featureLabel: 'COM VIDEOAULAS',
    featured: true,
    workloads: [
      { value: '360h-sem-pratica', label: '360h (sem prática)' },
      { value: '460h-com-pratica', label: '460h (com prática)' },
      { value: '720h-com-pratica', label: '720h (com prática)' },
    ],
  },
  {
    title: 'PSICOLOGIA CLÍNICA',
    fallbackValue: 'pos-psicologia-clinica',
    aliases: ['PSICOLOGIA CLINICA', 'PSICOLOGIA CLÍNICA'],
    imageSrc: '/landing/sobre-o-curso-psicologia.webp',
    featureLabel: 'COM VIDEOAULAS',
    fallbackCourseId: 0,
    featured: true,
    workloads: [{ value: '600h', label: '600h' }],
  },
  {
    title: 'PSICOLOGIA ESCOLAR E EDUCACIONAL',
    fallbackValue: 'pos-psicologia-escolar-e-educacional',
    aliases: ['PSICOLOGIA ESCOLAR E EDUCACIONAL'],
    imageSrc: '/landing/psicologia-escolar-e-educacional.webp',
    featureLabel: 'COM VIDEOAULAS',
    featured: true,
    workloads: [
      { value: '420h', label: '420h' },
      { value: '720h', label: '720h' },
    ],
  },
  {
    title: 'PSICOLOGIA FORENSE E JURÍDICA',
    fallbackValue: 'pos-psicologia-forense-e-juridica',
    aliases: ['PSICOLOGIA FORENSE E JURIDICA', 'PSICOLOGIA FORENSE E JURÍDICA'],
    imageSrc: '/landing/psicologia-forense-e-juridica.webp',
    featureLabel: 'COM VIDEOAULAS',
    featured: true,
    workloads: [
      { value: '420h', label: '420h' },
      { value: '720h', label: '720h' },
    ],
  },
  {
    title: 'PSICOLOGIA INFANTIL',
    fallbackValue: 'pos-psicologia-infantil',
    aliases: ['PSICOLOGIA INFANTIL'],
    imageSrc: '/landing/psicologia-infantil.webp',
    featureLabel: 'COM VIDEOAULAS',
    featured: true,
    workloads: [
      { value: '420h', label: '420h' },
      { value: '720h', label: '720h' },
    ],
  },
  {
    title: 'PSICOLOGIA PASTORAL',
    fallbackValue: 'pos-psicologia-pastoral',
    aliases: ['PSICOLOGIA PASTORAL'],
    imageSrc: '/landing/psicologia-pastoral.webp',
    featureLabel: 'COM VIDEOAULAS',
    featured: true,
    workloads: [
      { value: '420h', label: '420h' },
      { value: '720h', label: '720h' },
    ],
  },
  {
    title: 'PSICOLOGIA SOCIAL',
    fallbackValue: 'pos-psicologia-social',
    aliases: ['PSICOLOGIA SOCIAL', 'PSICOLOGIA SOCIAL E'],
    imageSrc: '/landing/psicologia-social.webp',
    featureLabel: 'COM VIDEOAULAS',
    featured: true,
    workloads: [
      { value: '420h', label: '420h' },
      { value: '720h', label: '720h' },
    ],
  },
]

export const FEATURED_PSYCHOLOGY_POST_COURSES = PSYCHOLOGY_POST_COURSES.filter(
  (course) => course.featured && course.imageSrc,
)

export function normalizeComparableCourseText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function normalizeCourseLookupText(value: string): string {
  return normalizeComparableCourseText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function psychologyPostCourseMatches(
  courseLabel: string,
  target: Pick<PsychologyPostCourseCatalogItem, 'aliases'>,
): boolean {
  const normalizedLabel = normalizeCourseLookupText(courseLabel)

  return target.aliases.some((alias) => {
    const normalizedAlias = normalizeCourseLookupText(alias)

    return (
      normalizedLabel === normalizedAlias ||
      normalizedLabel.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedLabel)
    )
  })
}

export function getPsychologyPostCourseByValue(value: string): PsychologyPostCourseCatalogItem | undefined {
  return PSYCHOLOGY_POST_COURSES.find((course) => course.fallbackValue === value)
}

export function buildPostCourseHoursLabel(workloads: PostWorkloadOption[]): string {
  const hourValues = workloads
    .map((workload) => workload.label.match(/(\d+)\s*h/i)?.[1])
    .filter((value): value is string => Boolean(value))

  const uniqueHours = [...new Set(hourValues)]

  if (!uniqueHours.length) return ''
  if (uniqueHours.length === 1) return `${uniqueHours[0]}H`
  if (uniqueHours.length === 2) return `${uniqueHours[0]}H OU ${uniqueHours[1]}H`

  return uniqueHours.map((value) => `${value}H`).join(' | ')
}

export function formatWorkloadLabelForDisplay(value: string): string {
  const match = value.match(/^(\d+)\s*h(.*)$/i)
  if (!match) return value

  const [, hours, suffix] = match
  return `${hours} horas${suffix}`
}

export function getDefaultWorkloadValue(workloads: PostWorkloadOption[]): string {
  return workloads.length === 1 ? workloads[0].value : ''
}
