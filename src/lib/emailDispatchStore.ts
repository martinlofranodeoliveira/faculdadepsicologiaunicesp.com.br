import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type EmailDispatchRecord = {
  idempotencyKey: string
  createdAt: string
  gmailMessageId: string
  gmailThreadId?: string
  to: string
  subject: string
  courseLevel: string
}

function readServerEnv(name: keyof ImportMetaEnv | string): string | undefined {
  const viteEnv = (import.meta.env as Record<string, string | boolean | undefined> | undefined) ?? undefined
  const viteValue = viteEnv?.[name]
  if (typeof viteValue === 'string' && viteValue.trim()) return viteValue

  const processValue = process.env[name]
  if (typeof processValue === 'string' && processValue.trim()) return processValue

  return undefined
}

function getStoreDir() {
  return readServerEnv('EMAIL_DISPATCH_STORE_DIR') || path.resolve(process.cwd(), '.runtime', 'email-dispatch')
}

function getRecordPath(idempotencyKey: string) {
  const hash = createHash('sha256').update(idempotencyKey).digest('hex')
  return path.join(getStoreDir(), `${hash}.json`)
}

export async function readEmailDispatchRecord(idempotencyKey: string) {
  try {
    const file = await readFile(getRecordPath(idempotencyKey), 'utf8')
    return JSON.parse(file) as EmailDispatchRecord
  } catch {
    return null
  }
}

export async function writeEmailDispatchRecord(record: EmailDispatchRecord) {
  const dir = getStoreDir()
  await mkdir(dir, { recursive: true })
  await writeFile(getRecordPath(record.idempotencyKey), JSON.stringify(record, null, 2), 'utf8')
}
