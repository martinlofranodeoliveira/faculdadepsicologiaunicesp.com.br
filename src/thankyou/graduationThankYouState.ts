export type GraduationThankYouLead = {
  fullName: string
  email: string
}

const GRADUATION_THANK_YOU_STORAGE_KEY = 'graduation-thank-you-lead'

export function storeGraduationThankYouLead(lead: GraduationThankYouLead) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    GRADUATION_THANK_YOU_STORAGE_KEY,
    JSON.stringify({
      fullName: lead.fullName.trim(),
      email: lead.email.trim(),
    }),
  )
}

export function readGraduationThankYouLead(): GraduationThankYouLead | null {
  if (typeof window === 'undefined') return null

  const rawValue = window.sessionStorage.getItem(GRADUATION_THANK_YOU_STORAGE_KEY)
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as Partial<GraduationThankYouLead>
    if (!parsed.fullName || typeof parsed.fullName !== 'string') return null

    return {
      fullName: parsed.fullName,
      email: typeof parsed.email === 'string' ? parsed.email : '',
    }
  } catch {
    return null
  }
}
