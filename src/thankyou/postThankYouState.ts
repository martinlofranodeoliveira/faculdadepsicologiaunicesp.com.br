export type PostThankYouLead = {
  fullName: string
  email: string
}

const POST_THANK_YOU_STORAGE_KEY = 'post-thank-you-lead'

export function storePostThankYouLead(lead: PostThankYouLead) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    POST_THANK_YOU_STORAGE_KEY,
    JSON.stringify({
      fullName: lead.fullName.trim(),
      email: lead.email.trim(),
    }),
  )
}

export function readPostThankYouLead(): PostThankYouLead | null {
  if (typeof window === 'undefined') return null

  const rawValue = window.sessionStorage.getItem(POST_THANK_YOU_STORAGE_KEY)
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as Partial<PostThankYouLead>
    if (!parsed.fullName || typeof parsed.fullName !== 'string') return null

    return {
      fullName: parsed.fullName,
      email: typeof parsed.email === 'string' ? parsed.email : '',
    }
  } catch {
    return null
  }
}
