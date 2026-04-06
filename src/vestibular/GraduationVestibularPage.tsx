import { useEffect, useState } from 'react'

import { clearJourneyProgress, saveJourneyProgress } from '@/course/journeyProgress'
import { finalizeJourney, updateJourneyStep3 } from '@/lib/journeyClient'
import { storeGraduationThankYouLead } from '@/thankyou/graduationThankYouState'

import { GraduationAdmissionSection } from './components/GraduationAdmissionSection'
import { GraduationEnrollmentOfferStep } from './components/GraduationEnrollmentOfferStep'
import { GraduationEssayWritingStep } from './components/GraduationEssayWritingStep'
import { GraduationEssayThemeStep, type EssayThemeId } from './components/GraduationEssayThemeStep'
import { GraduationSimplifiedStep } from './components/GraduationSimplifiedStep'
import { GraduationVestibularHero } from './components/GraduationVestibularHero'
import { VestibularHeader } from './components/VestibularHeader'
import type { GraduationOfferRow } from './graduationOffer'
import {
  clearGraduationVestibularLead,
  readGraduationVestibularLead,
  storeGraduationVestibularLead,
  type GraduationVestibularLead,
} from './graduationVestibularState'

import './vestibular.css'

export type AdmissionOptionId =
  | 'simplificada'
  | 'redacao'
  | 'transferencia'
  | 'segunda-graduacao'
  | 'enem'

type VestibularStep =
  | 'selection'
  | 'simplified'
  | 'essay-theme'
  | 'essay-writing'
  | 'offer'

type Identity = {
  firstName: string
  fullName: string
  email: string
  phone: string
  journeyId: number | null
  courseId: number | null
  courseLabel: string
  courseValue?: string
}

type GraduationOfferResponse = {
  data?: {
    rows?: GraduationOfferRow[]
  }
  message?: string
}

const defaultIdentity: Identity = {
  firstName: 'Aluno',
  fullName: '',
  email: '',
  phone: '',
  journeyId: null,
  courseId: null,
  courseLabel: '',
  courseValue: undefined,
}

function getFirstName(fullName: string) {
  const [firstName] = fullName.trim().split(/\s+/)
  return firstName || 'Aluno'
}

function mapAdmissionOptionToEntryMethod(optionId: AdmissionOptionId): string {
  switch (optionId) {
    case 'segunda-graduacao':
      return 'segunda_graduacao'
    case 'transferencia':
      return 'transferencia'
    case 'enem':
      return 'enem'
    case 'redacao':
      return 'redacao'
    default:
      return 'simplificada'
  }
}

function mapEntryMethodToAdmissionOption(entryMethod?: string | null): AdmissionOptionId {
  switch (entryMethod) {
    case 'segunda_graduacao':
      return 'segunda-graduacao'
    case 'transferencia':
      return 'transferencia'
    case 'enem':
      return 'enem'
    case 'redacao':
      return 'redacao'
    default:
      return 'simplificada'
  }
}

function getEssayThemeLabel(themeId: EssayThemeId): string {
  return themeId === 'tema-b' ? 'Tema B' : 'Tema A'
}

function buildFallbackOfferRows(courseLabel: string): GraduationOfferRow[] {
  const currentDate = new Date()
  const currentValue = /psicologia/i.test(courseLabel) ? 'R$ 549,00' : 'R$ 449,00'

  return Array.from({ length: 12 }, (_, index) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + index + 1, 10)
    return {
      installment: `${index + 1}ª Mensalidade`,
      value: currentValue,
      dueDate: targetDate.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
    }
  })
}

export function GraduationVestibularPage() {
  const [identity, setIdentity] = useState<Identity>(defaultIdentity)
  const [step, setStep] = useState<VestibularStep>('selection')
  const [selectedOptionId, setSelectedOptionId] = useState<AdmissionOptionId>('simplificada')
  const [selectedEssayThemeId, setSelectedEssayThemeId] = useState<EssayThemeId>('tema-a')
  const [enemRegistration, setEnemRegistration] = useState('')
  const [resumePresentation, setResumePresentation] = useState('')
  const [resumeEssayTitle, setResumeEssayTitle] = useState('')
  const [resumeEssayText, setResumeEssayText] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [offerRows, setOfferRows] = useState<GraduationOfferRow[]>([])
  const [isOfferLoading, setIsOfferLoading] = useState(false)
  const [offerError, setOfferError] = useState('')

  useEffect(() => {
    const storedLead = readGraduationVestibularLead()
    if (!storedLead) return

    const resumedOption = mapEntryMethodToAdmissionOption(storedLead.entryMethod)

    setIdentity({
      firstName: getFirstName(storedLead.fullName),
      fullName: storedLead.fullName,
      email: storedLead.email,
      phone: storedLead.phone ?? '',
      journeyId: storedLead.journeyId ?? null,
      courseId: storedLead.courseId ?? null,
      courseLabel: storedLead.courseLabel ?? 'Psicologia',
      courseValue: storedLead.courseValue,
    })
    setSelectedOptionId(resumedOption)
    setEnemRegistration(storedLead.enemRegistration ?? '')
    setResumePresentation(storedLead.presentationLetter ?? '')
    setResumeEssayTitle(storedLead.essayTitle ?? '')
    setResumeEssayText(storedLead.essayText ?? '')

    if (storedLead.essayThemeId === 'tema-a' || storedLead.essayThemeId === 'tema-b') {
      setSelectedEssayThemeId(storedLead.essayThemeId)
    }

    if ((storedLead.currentStep ?? 0) >= 3) {
      if (resumedOption === 'simplificada') {
        setStep('simplified')
        return
      }

      if (resumedOption === 'redacao') {
        setStep(storedLead.essayText?.trim() ? 'essay-writing' : 'essay-theme')
        return
      }

      setStep('offer')
    }
  }, [])

  useEffect(() => {
    if (!identity.courseId) {
      if (identity.courseLabel) {
        setOfferRows(buildFallbackOfferRows(identity.courseLabel))
      }
      return
    }

    let cancelled = false

    async function loadOffer() {
      setIsOfferLoading(true)
      setOfferError('')

      try {
        const response = await fetch(`/api/graduation-offer?courseId=${identity.courseId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })

        const payload = (await response.json().catch(() => null)) as GraduationOfferResponse | null
        if (!response.ok) {
          throw new Error(
            payload?.message || 'Não foi possível carregar as mensalidades do curso agora.',
          )
        }

        if (cancelled) return
        const rows = Array.isArray(payload?.data?.rows) ? payload.data.rows : []
        setOfferRows(rows.length ? rows : buildFallbackOfferRows(identity.courseLabel || 'Psicologia'))
      } catch (error) {
        if (cancelled) return
        setOfferRows(buildFallbackOfferRows(identity.courseLabel || 'Psicologia'))
        setOfferError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar as mensalidades do curso agora.',
        )
      } finally {
        if (!cancelled) {
          setIsOfferLoading(false)
        }
      }
    }

    void loadOffer()

    return () => {
      cancelled = true
    }
  }, [identity.courseId, identity.courseLabel])

  function persistLeadSnapshot(updates: Partial<GraduationVestibularLead> = {}) {
    if (!identity.fullName.trim()) return

    storeGraduationVestibularLead({
      fullName: identity.fullName,
      email: identity.email,
      phone: identity.phone,
      journeyId: identity.journeyId ?? undefined,
      courseId: identity.courseId ?? undefined,
      courseLabel: identity.courseLabel,
      courseValue: identity.courseValue,
      entryMethod: mapAdmissionOptionToEntryMethod(selectedOptionId),
      presentationLetter: resumePresentation,
      essayThemeId: selectedEssayThemeId,
      essayTitle: resumeEssayTitle,
      essayText: resumeEssayText,
      enemRegistration,
      ...updates,
    })
  }

  async function handleSelectionContinue() {
    if (selectedOptionId === 'enem' && !enemRegistration.trim()) {
      return
    }

    setSubmitError('')
    setIsAdvancing(true)
    const nextStep =
      selectedOptionId === 'simplificada'
        ? 'simplified'
        : selectedOptionId === 'redacao'
          ? 'essay-theme'
          : 'offer'

    persistLeadSnapshot({
      currentStep: nextStep === 'offer' ? 3 : 2,
      enemRegistration,
      entryMethod: mapAdmissionOptionToEntryMethod(selectedOptionId),
    })

    await new Promise((resolve) => window.setTimeout(resolve, 260))

    setStep(nextStep)

    setIsAdvancing(false)
  }

  async function finalizeGraduationFlow(
    step3Payload: Record<string, unknown>,
    storedUpdates: Record<string, unknown> = {},
  ) {
    if (!identity.journeyId || !identity.courseId) {
      setSubmitError(
        'Jornada não encontrada. Volte para a página do curso e reinicie a inscrição.',
      )
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    persistLeadSnapshot({ currentStep: 3, ...storedUpdates })

    try {
      const step3Response = await updateJourneyStep3(identity.journeyId, step3Payload)
      saveJourneyProgress({
        journeyId: identity.journeyId,
        courseType: 'graduacao',
        courseId: identity.courseId,
        courseValue: identity.courseValue,
        courseLabel: identity.courseLabel,
        fullName: identity.fullName,
        email: identity.email,
        phone: identity.phone,
        currentStep: step3Response.current_step ?? 3,
      })

      await finalizeJourney(identity.journeyId)
      storeGraduationThankYouLead({
        fullName: identity.fullName,
        email: identity.email,
      })
      clearJourneyProgress()
      clearGraduationVestibularLead()
      window.location.assign('/graduacao/inscricao-finalizada')
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir sua inscrição agora. Tente novamente em instantes.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSimplifiedContinue(presentation: string) {
    setResumePresentation(presentation)
    await finalizeGraduationFlow(
      {
        entry_method: 'simplificada',
        presentation_letter: presentation,
      },
      {
        presentationLetter: presentation,
      },
    )
  }

  async function handleEssayFinish(payload: { themeId: EssayThemeId; title: string; text: string }) {
    setResumeEssayTitle(payload.title)
    setResumeEssayText(payload.text)
    setSelectedEssayThemeId(payload.themeId)

    await finalizeGraduationFlow(
      {
        entry_method: 'redacao',
        essay_theme_id: payload.themeId,
        essay_theme_label: getEssayThemeLabel(payload.themeId),
        essay_title: payload.title,
        essay_text: payload.text,
      },
      {
        essayThemeId: payload.themeId,
        essayTitle: payload.title,
        essayText: payload.text,
      },
    )
  }

  async function handleOfferFinish() {
    const payload: Record<string, unknown> = {
      entry_method: mapAdmissionOptionToEntryMethod(selectedOptionId),
    }

    if (selectedOptionId === 'enem') {
      payload.enem_registration = enemRegistration.trim()
    }

    await finalizeGraduationFlow(payload)
  }

  const hasActiveLead = Boolean(identity.fullName.trim())

  return (
    <main className="vestibular-page">
      <VestibularHeader firstName={identity.firstName} email={identity.email} />

      <div className="vestibular-page__body">
        {!hasActiveLead ? (
          <section className="vestibular-empty">
            <div className="vestibular-empty__inner">
              <h1>Inicie sua inscrição pela graduação</h1>
              <p>
                Para abrir o fluxo do vestibular corretamente, volte para a página do curso e
                envie seus dados no formulário ou no popup da landing.
              </p>
              <a className="vestibular-empty__cta" href="/graduacao/psicologia">
                Ir para a graduação
              </a>
            </div>
          </section>
        ) : null}

        {hasActiveLead && step === 'selection' ? (
          <>
            <GraduationVestibularHero />
            <GraduationAdmissionSection
              enemRegistration={enemRegistration}
              selectedOptionId={selectedOptionId}
              isContinuing={isAdvancing}
              onContinue={handleSelectionContinue}
              onEnemRegistrationChange={(value) => {
                setSubmitError('')
                setEnemRegistration(value)
              }}
              onSelectOption={(optionId) => {
                setSubmitError('')
                setSelectedOptionId(optionId as AdmissionOptionId)
              }}
            />
          </>
        ) : null}

        {hasActiveLead && step === 'simplified' ? (
          <GraduationSimplifiedStep
            initialPresentation={resumePresentation}
            onBack={() => {
              setSubmitError('')
              setStep('selection')
            }}
            onContinue={handleSimplifiedContinue}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        ) : null}

        {hasActiveLead && step === 'essay-theme' ? (
          <GraduationEssayThemeStep
            selectedThemeId={selectedEssayThemeId}
            onBack={() => {
              setSubmitError('')
              setStep('selection')
            }}
            onSelectTheme={setSelectedEssayThemeId}
            onContinue={() => {
              persistLeadSnapshot({ essayThemeId: selectedEssayThemeId, currentStep: 3 })
              setStep('essay-writing')
            }}
          />
        ) : null}

        {hasActiveLead && step === 'essay-writing' ? (
          <GraduationEssayWritingStep
            initialTitle={resumeEssayTitle}
            initialEssay={resumeEssayText}
            selectedThemeId={selectedEssayThemeId}
            onBack={() => {
              setSubmitError('')
              setStep('essay-theme')
            }}
            onFinish={handleEssayFinish}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        ) : null}

        {hasActiveLead && step === 'offer' ? (
          <GraduationEnrollmentOfferStep
            admissionOptionId={selectedOptionId}
            offerRows={offerRows}
            isOfferLoading={isOfferLoading}
            offerError={offerError}
            onBack={() => {
              setSubmitError('')
              setStep('selection')
            }}
            onFinish={handleOfferFinish}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        ) : null}
      </div>
    </main>
  )
}
