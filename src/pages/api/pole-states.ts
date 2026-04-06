import type { APIRoute } from 'astro'

import { fetchPublicPolesApi, normalizePoleState } from '@/lib/polesApi'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    const items = (await fetchPublicPolesApi('pole-states', 'Nao foi possivel carregar os estados.'))
      .map(normalizePoleState)
      .filter((item): item is NonNullable<ReturnType<typeof normalizePoleState>> => Boolean(item))
      .sort(
        (left, right) =>
          left.stateName.localeCompare(right.stateName, 'pt-BR') ||
          left.stateUf.localeCompare(right.stateUf, 'pt-BR'),
      )

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
        message: error instanceof Error ? error.message : 'Nao foi possivel carregar os estados.',
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
