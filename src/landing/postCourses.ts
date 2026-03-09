export const POS_COURSES_ENDPOINT =
  import.meta.env.VITE_POS_COURSES_ENDPOINT ??
  '/fasul-courses-api/rotinas/cursos-ia-format-texto-2025-unicesp.php'

export type PostCourse = {
  value: string
  label: string
  url?: string
  courseId?: number
  area: string
  oldInstallmentPrice: string
  currentInstallmentPrice: string
}

function normalizeComparableText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function toSlug(value: string): string {
  return normalizeComparableText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeApiValue(line: string): string {
  const separatorIndex = line.indexOf(':')
  if (separatorIndex < 0) return ''
  return line.slice(separatorIndex + 1).trim()
}

function formatApiInstallmentPrice(value: string): string {
  if (!value) return value

  return value
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*x\s*/i, '$1X ')
    .replace(/R\$\s*/i, 'R$ ')
    .trim()
    .toUpperCase()
}

function fallbackOldInstallmentPrice(): string {
  return '18X R$ 132,00'
}

function fallbackCurrentInstallmentPrice(): string {
  return '18X R$ 86,00'
}

function extractIntegerFromBlock(block: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = block.match(pattern)?.[1]?.trim()
    if (!match) continue

    const parsed = Number.parseInt(match, 10)
    if (Number.isFinite(parsed)) return parsed
  }

  return undefined
}

export function parsePostGraduationCourses(raw: string): PostCourse[] {
  const blocks = raw.split(/\r?\n---\r?\n/g)
  const unique = new Map<string, PostCourse>()

  blocks.forEach((block) => {
    const lines = block
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter(Boolean)

    let disponibilidade = ''
    let nivel = ''
    let nomeCurso = ''
    let nomeArea = ''
    let urlCurso = ''
    let precoDe = ''
    let precoPor = ''

    lines.forEach((line) => {
      const normalizedLine = normalizeComparableText(line)

      if (normalizedLine.startsWith('disponibilidade:')) {
        disponibilidade = normalizeApiValue(line)
        return
      }

      if (normalizedLine.startsWith('nivel:') || normalizedLine.startsWith('nivel :')) {
        nivel = normalizeApiValue(line)
        return
      }

      if (normalizedLine.startsWith('nome do curso:')) {
        nomeCurso = normalizeApiValue(line)
        return
      }

      if (normalizedLine.startsWith('nome area:')) {
        nomeArea = normalizeApiValue(line)
        return
      }

      if (normalizedLine.startsWith('url curso:')) {
        urlCurso = normalizeApiValue(line)
        return
      }

      if (normalizedLine.startsWith('de:')) {
        precoDe = normalizeApiValue(line)
        return
      }

      if (normalizedLine.startsWith('por:')) {
        precoPor = normalizeApiValue(line)
      }
    })

    if (!disponibilidade || !nivel || !nomeCurso || !urlCurso) return

    const disponibilidadeNormalizada = normalizeComparableText(disponibilidade)
    const nivelNormalizado = normalizeComparableText(nivel)

    if (!disponibilidadeNormalizada.includes('disponivel')) return
    if (!nivelNormalizado.includes('pos-graduacao') && !nivelNormalizado.includes('pos graduacao')) {
      return
    }

    const courseName = nomeCurso.replace(/\s+/g, ' ').trim()

    let slug = ''
    try {
      const parsedUrl = new URL(urlCurso)
      const segments = parsedUrl.pathname.split('/').filter(Boolean)
      slug = segments[segments.length - 1] ?? ''
    } catch {
      slug = ''
    }

    if (!slug) slug = toSlug(courseName)
    if (!slug) return

    const value = `pos-${slug}`
    const area = (nomeArea || 'GERAL').replace(/\s+/g, ' ').trim().toUpperCase()
    const courseId = extractIntegerFromBlock(block, [
      /ID\s*(?:do\s*)?Curso:\s*(\d+)/i,
      /id\s*curso:\s*(\d+)/i,
      /idcurso:\s*(\d+)/i,
      /curso\s*id:\s*(\d+)/i,
    ])

    if (!unique.has(value)) {
      unique.set(value, {
        value,
        label: courseName,
        url: urlCurso,
        courseId,
        area,
        oldInstallmentPrice: formatApiInstallmentPrice(precoDe) || fallbackOldInstallmentPrice(),
        currentInstallmentPrice:
          formatApiInstallmentPrice(precoPor) || fallbackCurrentInstallmentPrice(),
      })
    }
  })

  return [...unique.values()].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function isHealthArea(area: string): boolean {
  return normalizeComparableText(area).includes('saude')
}
