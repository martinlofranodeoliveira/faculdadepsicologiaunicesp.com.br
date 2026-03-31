import {
  getGraduationCoursePageSummaries,
  getPostCoursePageSummaries,
} from '@/lib/courseCatalog'

export const prerender = false

type CourseType = 'graduacao' | 'pos'

type RequestPayload = {
  courseType?: CourseType
  courseIds?: unknown
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function isCourseType(value: unknown): value is CourseType {
  return value === 'graduacao' || value === 'pos'
}

export async function POST({ request }: { request: Request }) {
  let body: RequestPayload

  try {
    body = (await request.json()) as RequestPayload
  } catch {
    return jsonResponse({ success: false, message: 'Payload inválido.' }, 400)
  }

  if (!isCourseType(body.courseType)) {
    return jsonResponse({ success: false, message: 'Tipo de curso inválido.' }, 400)
  }

  const requestedIds = Array.isArray(body.courseIds)
    ? body.courseIds
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    : []

  if (!requestedIds.length) {
    return jsonResponse({ success: false, message: 'Nenhum curso informado.' }, 400)
  }

  const uniqueIds = [...new Set(requestedIds)]
  const summaries =
    body.courseType === 'graduacao'
      ? await getGraduationCoursePageSummaries()
      : await getPostCoursePageSummaries()

  const items = uniqueIds
    .map((courseId) => {
      const match = summaries.find((entry) => entry.courseId === courseId)
      if (!match) return null

      return {
        courseId,
        path: match.path,
        title: match.title,
        courseLabel: match.rawLabel || match.title,
        courseValue: match.value,
      }
    })
    .filter(Boolean)

  return jsonResponse({
    data: {
      items,
    },
  })
}
