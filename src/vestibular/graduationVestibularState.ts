export type GraduationVestibularLead = {
  fullName: string
  email: string
  phone?: string
  journeyId?: number
  courseId?: number
  courseLabel?: string
  courseValue?: string
  currentStep?: number
  entryMethod?: string
  presentationLetter?: string
  essayThemeId?: string
  essayTitle?: string
  essayText?: string
  enemRegistration?: string
}

const GRADUATION_VESTIBULAR_STORAGE_KEY = 'graduation-vestibular-lead'

export function storeGraduationVestibularLead(lead: GraduationVestibularLead) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    GRADUATION_VESTIBULAR_STORAGE_KEY,
    JSON.stringify({
      fullName: lead.fullName.trim(),
      email: lead.email.trim(),
      phone: lead.phone?.trim(),
      journeyId: lead.journeyId,
      courseId: lead.courseId,
      courseLabel: lead.courseLabel?.trim(),
      courseValue: lead.courseValue?.trim(),
      currentStep: lead.currentStep,
      entryMethod: lead.entryMethod?.trim(),
      presentationLetter: lead.presentationLetter?.trim(),
      essayThemeId: lead.essayThemeId?.trim(),
      essayTitle: lead.essayTitle?.trim(),
      essayText: lead.essayText?.trim(),
      enemRegistration: lead.enemRegistration?.trim(),
    }),
  )
}

export function readGraduationVestibularLead(): GraduationVestibularLead | null {
  if (typeof window === 'undefined') return null

  const rawValue = window.sessionStorage.getItem(GRADUATION_VESTIBULAR_STORAGE_KEY)
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as Partial<GraduationVestibularLead>
    if (!parsed.fullName || typeof parsed.fullName !== 'string') return null

    return {
      fullName: parsed.fullName,
      email: typeof parsed.email === 'string' ? parsed.email : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
      journeyId: typeof parsed.journeyId === 'number' ? parsed.journeyId : undefined,
      courseId: typeof parsed.courseId === 'number' ? parsed.courseId : undefined,
      courseLabel: typeof parsed.courseLabel === 'string' ? parsed.courseLabel : undefined,
      courseValue: typeof parsed.courseValue === 'string' ? parsed.courseValue : undefined,
      currentStep: typeof parsed.currentStep === 'number' ? parsed.currentStep : undefined,
      entryMethod: typeof parsed.entryMethod === 'string' ? parsed.entryMethod : undefined,
      presentationLetter:
        typeof parsed.presentationLetter === 'string' ? parsed.presentationLetter : undefined,
      essayThemeId: typeof parsed.essayThemeId === 'string' ? parsed.essayThemeId : undefined,
      essayTitle: typeof parsed.essayTitle === 'string' ? parsed.essayTitle : undefined,
      essayText: typeof parsed.essayText === 'string' ? parsed.essayText : undefined,
      enemRegistration:
        typeof parsed.enemRegistration === 'string' ? parsed.enemRegistration : undefined,
    }
  } catch {
    return null
  }
}

export function clearGraduationVestibularLead() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(GRADUATION_VESTIBULAR_STORAGE_KEY)
}
