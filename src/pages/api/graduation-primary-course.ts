import type { APIRoute } from 'astro'

import { getGraduationCoursePageBySlug } from '@/lib/courseCatalog'
import { PRIMARY_GRADUATION_JOURNEY_COURSE_ID } from '@/lib/graduation'
import { siteConfig } from '@/site/config'

export const prerender = false

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export const GET: APIRoute = async () => {
  try {
    const course = await getGraduationCoursePageBySlug(siteConfig.primaryGraduationSlug)

    if (!course) {
      return jsonResponse({ message: 'Curso principal da graduação não encontrado.' }, 404)
    }

    return jsonResponse({
      data: {
        courseId: course.courseId,
        journeyCourseId: PRIMARY_GRADUATION_JOURNEY_COURSE_ID,
        courseValue: course.value,
        courseLabel: course.rawLabel || course.title,
        coursePath: course.path,
      },
    })
  } catch (error) {
    return jsonResponse(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o curso principal da graduação.',
      },
      500,
    )
  }
}
