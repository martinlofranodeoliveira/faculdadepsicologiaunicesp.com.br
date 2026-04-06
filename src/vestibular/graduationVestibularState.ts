export type GraduationVestibularLead = {
  fullName: string
  email: string
  phone?: string
  cpf?: string
  stateUf?: string
  city?: string
  poleId?: number
  poleName?: string
  pcd?: boolean
  pcdDetails?: string
  journeyId?: number
  courseId?: number
  journeyCourseId?: number
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
      cpf: lead.cpf?.trim(),
      stateUf: lead.stateUf?.trim(),
      city: lead.city?.trim(),
      poleId: lead.poleId,
      poleName: lead.poleName?.trim(),
      pcd: lead.pcd,
      pcdDetails: lead.pcdDetails?.trim(),
      journeyId: lead.journeyId,
      courseId: lead.courseId,
      journeyCourseId: lead.journeyCourseId,
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
      cpf: typeof parsed.cpf === 'string' ? parsed.cpf : undefined,
      stateUf: typeof parsed.stateUf === 'string' ? parsed.stateUf : undefined,
      city: typeof parsed.city === 'string' ? parsed.city : undefined,
      poleId: typeof parsed.poleId === 'number' ? parsed.poleId : undefined,
      poleName: typeof parsed.poleName === 'string' ? parsed.poleName : undefined,
      pcd: typeof parsed.pcd === 'boolean' ? parsed.pcd : undefined,
      pcdDetails: typeof parsed.pcdDetails === 'string' ? parsed.pcdDetails : undefined,
      journeyId: typeof parsed.journeyId === 'number' ? parsed.journeyId : undefined,
      courseId: typeof parsed.courseId === 'number' ? parsed.courseId : undefined,
      journeyCourseId:
        typeof parsed.journeyCourseId === 'number' ? parsed.journeyCourseId : undefined,
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
