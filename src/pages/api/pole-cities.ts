import type { APIRoute } from 'astro'

import { fetchPublicPolesApi, normalizePoleCity } from '@/lib/polesApi'

export const prerender = false

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const stateId = Number.parseInt(url.searchParams.get('stateId') ?? '', 10)

  if (!Number.isFinite(stateId) || stateId <= 0) {
    return new Response(
      JSON.stringify({
        message: 'stateId invalido.',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    )
  }

  try {
    const items = (
      await fetchPublicPolesApi(
        `pole-cities?state_id=${stateId}`,
        'Nao foi possivel carregar as cidades.',
      )
    )
      .map(normalizePoleCity)
      .filter((item): item is NonNullable<ReturnType<typeof normalizePoleCity>> => Boolean(item))
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))

    return new Response(
      JSON.stringify({
        data: { items },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'private, max-age=300',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Nao foi possivel carregar as cidades.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    )
  }
}
