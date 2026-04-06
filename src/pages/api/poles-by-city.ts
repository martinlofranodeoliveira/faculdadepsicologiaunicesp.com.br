import type { APIRoute } from 'astro'

import { fetchPublicPolesApi, normalizePole } from '@/lib/polesApi'

export const prerender = false

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const cityId = Number.parseInt(url.searchParams.get('cityId') ?? '', 10)

  if (!Number.isFinite(cityId) || cityId <= 0) {
    return new Response(
      JSON.stringify({
        message: 'cityId invalido.',
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
        `poles/by-city/${cityId}`,
        'Nao foi possivel carregar os polos.',
      )
    )
      .map(normalizePole)
      .filter((item): item is NonNullable<ReturnType<typeof normalizePole>> => Boolean(item))
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
        message: error instanceof Error ? error.message : 'Nao foi possivel carregar os polos.',
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
