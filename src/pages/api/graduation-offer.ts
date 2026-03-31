import type { APIRoute } from 'astro'

import { getGraduationCoursePageById } from '@/lib/courseCatalog'
import { buildGraduationOfferData } from '@/vestibular/graduationOffer'

export const prerender = false

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, max-age=300',
    },
  })
}

export const GET: APIRoute = async ({ url }) => {
  const courseId = Number.parseInt(url.searchParams.get('courseId') ?? '', 10)
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return jsonResponse({ message: 'courseId inválido.' }, 400)
  }

  try {
    const course = await getGraduationCoursePageById(courseId)
    const offer = buildGraduationOfferData(course)

    if (!course || !offer) {
      return jsonResponse({ message: 'Oferta da graduação não encontrada.' }, 404)
    }

    return jsonResponse({
      data: offer,
    })
  } catch (error) {
    return jsonResponse(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a oferta da graduação.',
      },
      500,
    )
  }
}
