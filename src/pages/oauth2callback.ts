import type { APIRoute } from 'astro'

import {
  exchangeGoogleAuthorizationCode,
  getGoogleRefreshTokenEnvName,
  getGoogleOAuthSenderAddress,
  parseGoogleOAuthMailbox,
} from '@/lib/googleOAuth'

export const prerender = false

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderPage(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        background: #0b1730;
        color: #f7f8fb;
        font-family: "Kumbh Sans", Arial, sans-serif;
        margin: 0;
        min-height: 100vh;
      }
      main {
        box-sizing: border-box;
        margin: 0 auto;
        max-width: 880px;
        padding: 48px 24px 80px;
      }
      .card {
        background: #ffffff;
        border-radius: 20px;
        color: #101828;
        padding: 24px;
      }
      h1 {
        margin: 0 0 16px;
      }
      p, li {
        line-height: 1.6;
      }
      code, textarea {
        font-family: Consolas, monospace;
      }
      textarea {
        border: 1px solid rgba(16, 24, 40, 0.16);
        border-radius: 12px;
        box-sizing: border-box;
        min-height: 132px;
        padding: 12px;
        resize: vertical;
        width: 100%;
      }
      .token-line {
        background: #f7f8fb;
        border-radius: 12px;
        display: block;
        margin-top: 12px;
        padding: 14px 16px;
        word-break: break-word;
      }
      .hint {
        color: rgba(16, 24, 40, 0.72);
      }
      a {
        color: #0f62fe;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        ${body}
      </div>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  )
}

export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get('code')
  const oauthError = url.searchParams.get('error')
  const mailbox = parseGoogleOAuthMailbox(url.searchParams.get('state'))

  if (oauthError) {
    return renderPage(
      'OAuth cancelado',
      `<h1>OAuth nao concluido</h1><p>O Google retornou: <code>${escapeHtml(oauthError)}</code></p>`,
      400,
    )
  }

  if (!code) {
    return renderPage(
      'Codigo ausente',
      '<h1>Codigo de autorizacao nao encontrado</h1><p>Abra esta rota somente depois do redirecionamento do Google.</p>',
      400,
    )
  }

  if (!mailbox) {
    return renderPage(
      'State invalido',
      '<h1>Parametro state invalido</h1><p>Refaca o fluxo usando a pagina <code>/google-oauth</code>.</p>',
      400,
    )
  }

  try {
    const token = await exchangeGoogleAuthorizationCode(code)
    const envName = getGoogleRefreshTokenEnvName(mailbox)
    const sender = getGoogleOAuthSenderAddress(mailbox)
    const refreshToken = token.refresh_token || ''

    return renderPage(
      'Refresh token gerado',
      `
        <h1>Refresh token gerado</h1>
        <p><strong>Caixa:</strong> ${escapeHtml(sender)}</p>
        <p><strong>Variavel:</strong> <code>${escapeHtml(envName)}</code></p>
        ${
          refreshToken
            ? `<p><strong>Refresh token:</strong></p>
               <textarea readonly>${escapeHtml(refreshToken)}</textarea>
               <p class="hint">Linha pronta para o <code>.env</code>:</p>
               <span class="token-line"><code>${escapeHtml(envName)}=${escapeHtml(refreshToken)}</code></span>`
            : `<p><strong>O Google nao retornou refresh token.</strong></p>
               <p class="hint">Isso normalmente acontece quando o consentimento anterior ja existe ou quando o app ainda nao esta em modo adequado para emissao persistente.</p>`
        }
        <p class="hint">Access token expira em ${token.expires_in} segundos. O que interessa para o projeto e o refresh token acima.</p>
        <p><a href="/google-oauth">Voltar para a pagina de OAuth</a></p>
      `,
    )
  } catch (error) {
    return renderPage(
      'Falha ao gerar token',
      `<h1>Falha ao trocar o codigo por token</h1><p>${escapeHtml(
        error instanceof Error ? error.message : 'Erro inesperado.',
      )}</p>`,
      500,
    )
  }
}
