import { useState, type FormEventHandler } from 'react'

import {
  createJourneyStep1,
} from '@/lib/journeyClient'
import {
  formatPhoneMask,
  normalizeName,
  sendLeadToCrm,
  validateEmail,
  validateFullName,
  validatePhone,
  type CourseLeadSelection,
} from '@/lib/crmLead'
import { storePostThankYouLead } from '@/thankyou/postThankYouState'
import { storeGraduationVestibularLead } from '@/vestibular/graduationVestibularState'

type Props = {
  selection: CourseLeadSelection
  institutionSlug?: string
  dark?: boolean
}

type FieldErrors = {
  fullName?: string
  email?: string
  phone?: string
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

function canUseJourney(selection: CourseLeadSelection, institutionSlug?: string) {
  if (selection.courseType !== 'graduacao') return false
  if (institutionSlug === 'fallback') return false
  return Boolean(selection.courseId && selection.courseId > 0)
}

export function CourseLeadForm({ selection, institutionSlug, dark = false }: Props) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const formClassName = `lead-card ${dark ? 'lead-card--dark' : ''}`
  const isGraduation = selection.courseType === 'graduacao'

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    setStatus('submitting')
    setStatusMessage(isGraduation ? 'Preparando sua inscrição...' : 'Enviando seus dados...')

    try {
      await sendLeadToCrm({
        fullName,
        email,
        phone,
        selection,
      })

      if (isGraduation) {
        let journeyId: number | undefined
        let currentStep = 1

        if (canUseJourney(selection, institutionSlug)) {
          try {
            const step1 = await createJourneyStep1({
              course_id: selection.courseId,
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.replace(/\D/g, ''),
            })

            journeyId = step1.journey_id
            currentStep = step1.current_step ?? 1
          } catch {
            journeyId = undefined
            currentStep = 1
          }
        }

        storeGraduationVestibularLead({
          fullName,
          email,
          phone,
          journeyId,
          courseId: selection.courseId,
          courseLabel: selection.courseLabel,
          courseValue: selection.courseValue,
          currentStep,
        })

        setStatus('success')
        setStatusMessage('Dados recebidos. Redirecionando para o vestibular...')
        window.setTimeout(() => {
          window.location.assign('/graduacao/vestibular')
        }, 120)
        return
      }

      storePostThankYouLead({
        fullName,
        email,
      })
      setStatus('success')
      setStatusMessage('Dados recebidos. Redirecionando...')
      window.setTimeout(() => {
        window.location.assign('/pos-graduacao/inscricao-finalizada')
      }, 120)
    } catch (error) {
      setStatus('error')
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar agora. Tente novamente em instantes.',
      )
    }
  }

  return (
    <section className={formClassName} aria-label={`Formulário do curso ${selection.courseLabel}`}>
      <header className="lead-card__header">
        <h3>{isGraduation ? 'Começar inscrição' : 'Receber proposta'}</h3>
        <p>
          {isGraduation
            ? 'Preencha seus dados para continuar no fluxo do vestibular desta graduação.'
            : 'Preencha seus dados e siga para a confirmação da sua inscrição na pós-graduação.'}
        </p>
      </header>

      <form className="lead-card__form" onSubmit={handleSubmit}>
        <div className="lead-card__grid">
          <div className={`lead-card__field lead-card__field--full ${errors.fullName ? 'is-invalid' : ''}`}>
            <label htmlFor={`course-lead-name-${selection.courseValue}`}>Nome completo</label>
            <input
              id={`course-lead-name-${selection.courseValue}`}
              name="name"
              value={fullName}
              onChange={(event) => setFullName(normalizeName(event.target.value))}
              placeholder="Digite seu nome"
            />
            {errors.fullName ? <span className="lead-card__error">{errors.fullName}</span> : null}
          </div>

          <div className={`lead-card__field ${errors.email ? 'is-invalid' : ''}`}>
            <label htmlFor={`course-lead-email-${selection.courseValue}`}>E-mail</label>
            <input
              id={`course-lead-email-${selection.courseValue}`}
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
            />
            {errors.email ? <span className="lead-card__error">{errors.email}</span> : null}
          </div>

          <div className={`lead-card__field ${errors.phone ? 'is-invalid' : ''}`}>
            <label htmlFor={`course-lead-phone-${selection.courseValue}`}>WhatsApp</label>
            <input
              id={`course-lead-phone-${selection.courseValue}`}
              name="phone"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhoneMask(event.target.value))}
              placeholder="(00) 00000-0000"
            />
            {errors.phone ? <span className="lead-card__error">{errors.phone}</span> : null}
          </div>
        </div>

        <p className="lead-card__agreement">
          Curso selecionado: <strong>{selection.courseLabel}</strong>
        </p>

        <div className="lead-card__footer">
          <p
            className={`lead-card__status ${
              status === 'error' ? 'is-error' : status === 'success' ? 'is-success' : ''
            }`}
          >
            {statusMessage}
          </p>
          <button className="button-primary" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enviando...' : isGraduation ? 'Ir para o vestibular' : 'Finalizar inscrição'}
          </button>
        </div>
      </form>
    </section>
  )
}
