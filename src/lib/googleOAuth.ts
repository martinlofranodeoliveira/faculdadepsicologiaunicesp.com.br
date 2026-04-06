import { randomUUID } from 'node:crypto'

export type GoogleOAuthMailbox = 'graduacao' | 'posgraduacao'

export type GmailAttachmentInput = {
  filename: string
  contentType: string
  contentBase64: string
}

type GoogleTokenSuccess = {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope?: string
  token_type?: string
}

type GoogleTokenError = {
  error?: string
  error_description?: string
}

export type GmailSendInput = {
  mailbox: GoogleOAuthMailbox
  to: string
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  subject: string
  html?: string
  text?: string
  attachments?: GmailAttachmentInput[]
}

type GmailSendSuccess = {
  id: string
  threadId?: string
}

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'
const DEFAULT_FROM_NAME = 'Faculdade de Psicologia'

function readServerEnv(name: keyof ImportMetaEnv | string): string | undefined {
  const viteEnv = (import.meta.env as Record<string, string | boolean | undefined> | undefined) ?? undefined
  const viteValue = viteEnv?.[name]
  if (typeof viteValue === 'string' && viteValue.trim()) return viteValue

  const processValue = process.env[name]
  if (typeof processValue === 'string' && processValue.trim()) return processValue

  return undefined
}

function readEnv(name: keyof ImportMetaEnv): string {
  const value = readServerEnv(name)

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`)
  }

  return value
}

function encodeBase64Url(value: string | Uint8Array) {
  const base64 = Buffer.from(value).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function normalizeEmailList(values?: string[]) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean)
}

function createBoundary(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll('-', '')}`
}

function encodeMimeSubject(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
}

function buildSinglePartContent(input: Pick<GmailSendInput, 'html' | 'text'>) {
  if (input.html) {
    return {
      headers: ['Content-Type: text/html; charset=UTF-8'],
      body: input.html,
    }
  }

  return {
    headers: ['Content-Type: text/plain; charset=UTF-8'],
    body: input.text ?? '',
  }
}

function buildMimeBody(input: GmailSendInput) {
  const attachments = input.attachments ?? []
  const hasAttachments = attachments.length > 0
  const hasAlternative = Boolean(input.html && input.text)

  if (!hasAttachments && !hasAlternative) {
    return buildSinglePartContent(input)
  }

  if (!hasAttachments && hasAlternative) {
    const boundary = createBoundary('alt')

    return {
      headers: [`Content-Type: multipart/alternative; boundary="${boundary}"`],
      body: [
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        '',
        input.text ?? '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        '',
        input.html ?? '',
        `--${boundary}--`,
      ].join('\r\n'),
    }
  }

  const mixedBoundary = createBoundary('mixed')
  const parts: string[] = []

  if (hasAlternative) {
    const alternativeBoundary = createBoundary('alt')
    parts.push(
      `--${mixedBoundary}`,
      `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
      '',
      `--${alternativeBoundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      input.text ?? '',
      `--${alternativeBoundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      input.html ?? '',
      `--${alternativeBoundary}--`,
    )
  } else {
    const single = buildSinglePartContent(input)
    parts.push(`--${mixedBoundary}`, ...single.headers, '', single.body)
  }

  for (const attachment of attachments) {
    parts.push(
      `--${mixedBoundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      attachment.contentBase64,
    )
  }

  parts.push(`--${mixedBoundary}--`)

  return {
    headers: [`Content-Type: multipart/mixed; boundary="${mixedBoundary}"`],
    body: parts.join('\r\n'),
  }
}

function buildRawMimeMessage(input: GmailSendInput) {
  const sender = getGoogleOAuthSenderAddress(input.mailbox)
  const cc = normalizeEmailList(input.cc)
  const bcc = normalizeEmailList(input.bcc)
  const mimeContent = buildMimeBody(input)

  const headers = [
    `From: ${DEFAULT_FROM_NAME} <${sender}>`,
    `To: ${input.to.trim()}`,
    ...(cc.length ? [`Cc: ${cc.join(', ')}`] : []),
    ...(bcc.length ? [`Bcc: ${bcc.join(', ')}`] : []),
    ...(input.replyTo ? [`Reply-To: ${input.replyTo.trim()}`] : []),
    `Subject: ${encodeMimeSubject(input.subject)}`,
    'MIME-Version: 1.0',
    ...mimeContent.headers,
  ]

  return `${headers.join('\r\n')}\r\n\r\n${mimeContent.body}`
}

export function parseGoogleOAuthMailbox(value: string | null | undefined): GoogleOAuthMailbox | null {
  if (value === 'graduacao' || value === 'posgraduacao') return value
  return null
}

export function getGoogleOAuthSenderAddress(mailbox: GoogleOAuthMailbox): string {
  if (mailbox === 'graduacao') {
    return readServerEnv('GOOGLE_GMAIL_GRAD_ADDRESS') || 'graduacao@faculdadepsicologiaunicesp.com.br'
  }

  return readServerEnv('GOOGLE_GMAIL_POS_ADDRESS') || 'posgraduacao@faculdadepsicologiaunicesp.com.br'
}

export function getGoogleOAuthRedirectUri() {
  return readEnv('GOOGLE_OAUTH_REDIRECT_URI')
}

export function getGoogleRefreshTokenEnvName(mailbox: GoogleOAuthMailbox) {
  return mailbox === 'graduacao'
    ? 'GOOGLE_REFRESH_TOKEN_GRADUACAO'
    : 'GOOGLE_REFRESH_TOKEN_POSGRADUACAO'
}

export function getGoogleRefreshToken(mailbox: GoogleOAuthMailbox) {
  return readEnv(getGoogleRefreshTokenEnvName(mailbox))
}

export function buildGoogleAuthorizeUrl(mailbox: GoogleOAuthMailbox) {
  const params = new URLSearchParams({
    client_id: readEnv('GOOGLE_CLIENT_ID'),
    redirect_uri: getGoogleOAuthRedirectUri(),
    response_type: 'code',
    scope: GMAIL_SEND_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    login_hint: getGoogleOAuthSenderAddress(mailbox),
    state: mailbox,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

async function exchangeGoogleToken(body: URLSearchParams) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const payload = (await response.json()) as GoogleTokenSuccess & GoogleTokenError

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || 'Falha ao obter token do Google.')
  }

  return payload
}

export async function exchangeGoogleAuthorizationCode(code: string) {
  return exchangeGoogleToken(
    new URLSearchParams({
      code,
      client_id: readEnv('GOOGLE_CLIENT_ID'),
      client_secret: readEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: getGoogleOAuthRedirectUri(),
      grant_type: 'authorization_code',
    }),
  )
}

export async function exchangeGoogleRefreshToken(refreshToken: string) {
  return exchangeGoogleToken(
    new URLSearchParams({
      client_id: readEnv('GOOGLE_CLIENT_ID'),
      client_secret: readEnv('GOOGLE_CLIENT_SECRET'),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  )
}

export async function sendGmailMessage(input: GmailSendInput) {
  const token = await exchangeGoogleRefreshToken(getGoogleRefreshToken(input.mailbox))
  const raw = encodeBase64Url(buildRawMimeMessage(input))

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  const payload = (await response.json()) as {
    id?: string
    threadId?: string
    error?: { message?: string }
  }

  if (!response.ok || !payload.id) {
    throw new Error(payload.error?.message || 'Falha ao enviar e-mail pelo Gmail.')
  }

  return {
    id: payload.id,
    threadId: payload.threadId,
  } satisfies GmailSendSuccess
}
