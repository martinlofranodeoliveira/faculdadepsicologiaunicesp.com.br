import type { APIRoute } from 'astro'

import { buildGoogleAuthorizeUrl, parseGoogleOAuthMailbox } from '@/lib/googleOAuth'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  const mailbox = parseGoogleOAuthMailbox(url.searchParams.get('mailbox'))

  if (!mailbox) {
    return new Response('Mailbox invalido. Use "graduacao" ou "posgraduacao".', { status: 400 })
  }

  try {
    return Response.redirect(buildGoogleAuthorizeUrl(mailbox), 302)
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Nao foi possivel iniciar o fluxo OAuth.',
      { status: 500 },
    )
  }
}
