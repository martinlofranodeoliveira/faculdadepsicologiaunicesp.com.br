import { useEffect, useMemo, useState, type FormEvent } from 'react'

import {
  formatPhoneMask,
  normalizeName,
  sendLeadToCrm,
  validateEmail,
  validateFullName,
  validatePhone,
  type CourseLeadSelection,
} from '../crmLead'
import { OverlaySelect } from './OverlaySelect'
import {
  formatWorkloadLabelForDisplay,
  getDefaultWorkloadValue,
  getPsychologyPostCourseByValue,
} from '../psychologyPostCourses'

type EnrollmentPopupProps = {
  isOpen: boolean
  selection: CourseLeadSelection | null
  onClose: () => void
}

type FieldErrors = {
  workload?: string
  fullName?: string
  email?: string
  phone?: string
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const DEFAULT_POST_PRICE = '18X R$ 86,00/MÊS'

export function EnrollmentPopup({ isOpen, selection, onClose }: EnrollmentPopupProps) {
  const [workload, setWorkload] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const isPostGraduation = selection?.courseType === 'pos'
  const postCourse = useMemo(() => {
    if (!selection || selection.courseType !== 'pos') return undefined
    return getPsychologyPostCourseByValue(selection.courseValue)
  }, [selection])
  const workloadOptions = postCourse?.workloads ?? []
  const resolvedWorkloadOption = workloadOptions.find((item) => item.value === workload)
  const postPriceLabel = selection?.priceLabel ?? DEFAULT_POST_PRICE
  const displayCourseLabel = isPostGraduation
    ? selection?.courseLabel ?? ''
    : (selection?.courseLabel ?? '').replace(/\s+presencial$/i, '').trim()

  const firstErrorMessage = useMemo(() => {
    return errors.workload ?? errors.fullName ?? errors.email ?? errors.phone ?? ''
  }, [errors])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !selection) return

    setFullName('')
    setEmail('')
    setPhone('')
    setErrors({})
    setSubmitStatus('idle')
    setSubmitMessage('')

    if (selection.courseType === 'pos') {
      setWorkload(selection.workloadValue ?? getDefaultWorkloadValue(workloadOptions))
      return
    }

    setWorkload('')
  }, [isOpen, postCourse, selection])

  if (!isOpen || !selection) {
    return null
  }

  const topImageSrc =
    selection.courseType === 'pos'
      ? '/landing/posgraduacao-presencial-psicologia-topo-popup.webp'
      : '/landing/graduacao-presencial-psicologia-topo-popup.webp'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      workload:
        isPostGraduation && !workload ? 'Selecione a carga horária para continuar.' : undefined,
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
    setErrors(nextErrors)

    if (nextErrors.workload || nextErrors.fullName || nextErrors.email || nextErrors.phone) {
      setSubmitStatus('error')
      setSubmitMessage('')
      return
    }

    setSubmitStatus('submitting')
    setSubmitMessage('Enviando seus dados...')

    try {
      await sendLeadToCrm({
        fullName,
        email,
        phone,
        selection: {
          ...selection,
          workloadValue: isPostGraduation ? workload : undefined,
          workloadLabel: isPostGraduation
            ? resolvedWorkloadOption?.label ?? selection.workloadLabel
            : undefined,
        },
      })

      setSubmitStatus('success')
      setSubmitMessage('Cadastro enviado com sucesso.')
      window.location.assign('/obrigado')
    } catch (error) {
      console.error('Erro ao enviar lead para o CRM:', error)
      setSubmitStatus('error')
      setSubmitMessage('Não foi possível enviar agora. Tente novamente em instantes.')
    }
  }

  return (
    <div
      className="lp-enrollment-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lp-enrollment-modal-title"
      onClick={onClose}
    >
      <div className="lp-enrollment-modal__panel" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="lp-enrollment-modal__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <span className="lp-enrollment-modal__close-icon" aria-hidden="true">
            ×
          </span>
        </button>

        <header className="lp-enrollment-modal__top">
          <img
            className="lp-enrollment-modal__top-image"
            src={topImageSrc}
            alt=""
            aria-hidden="true"
          />
        </header>

        <div className="lp-enrollment-modal__content">
          <h2
            id="lp-enrollment-modal-title"
            className={
              isPostGraduation
                ? 'lp-enrollment-modal__title lp-enrollment-modal__title--sr-only'
                : 'lp-enrollment-modal__title'
            }
          >
            Curso: {displayCourseLabel}
          </h2>

          {!isPostGraduation ? (
            <p className="lp-enrollment-modal__subtitle">
              Preencha o formulário para receber mais informações
            </p>
          ) : (
            <p className="lp-enrollment-modal__subtitle lp-enrollment-modal__subtitle--post">
              Preencha o formulário para receber mais informações
            </p>
          )}

          <form className="lp-enrollment-modal__form" onSubmit={handleSubmit} noValidate>
            {isPostGraduation ? (
              <div className="lp-enrollment-modal__select-wrap">
                <OverlaySelect
                  value={workload}
                  options={workloadOptions}
                  placeholder={'Selecione a carga hor\u00E1ria'}
                  ariaLabel={'Selecione a carga hor\u00E1ria'}
                  ariaInvalid={Boolean(errors.workload)}
                  ariaDescribedBy={errors.workload ? 'enrollment-workload-error' : undefined}
                  triggerClassName={`lp-enrollment-modal__select-trigger ${
                    errors.workload ? 'is-invalid' : ''
                  }`}
                  contentClassName="lp-enrollment-modal__select-content"
                  itemClassName="ui-select-item"
                  onValueChange={setWorkload}
                />
              </div>
            ) : null}

            <input
              type="text"
              name="name"
              placeholder="Nome"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(normalizeName(event.target.value))}
              className={`lp-enrollment-modal__input ${errors.fullName ? 'is-invalid' : ''}`}
              aria-invalid={errors.fullName ? 'true' : 'false'}
            />
            <input
              type="email"
              name="email"
              placeholder="Seu melhor email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`lp-enrollment-modal__input ${errors.email ? 'is-invalid' : ''}`}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefone"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhoneMask(event.target.value))}
              className={`lp-enrollment-modal__input ${errors.phone ? 'is-invalid' : ''}`}
              aria-invalid={errors.phone ? 'true' : 'false'}
            />

            <button
              type="submit"
              className="lp-enrollment-modal__submit"
              disabled={submitStatus === 'submitting'}
            >
              {submitStatus === 'submitting' ? 'ENVIANDO...' : 'ENVIAR'}
            </button>
          </form>

          {submitStatus === 'error' && firstErrorMessage ? (
            <p
              className="lp-enrollment-modal__status lp-enrollment-modal__status--error"
              id={errors.workload ? 'enrollment-workload-error' : undefined}
            >
              {firstErrorMessage}
            </p>
          ) : null}

          {submitMessage ? (
            <p
              className={`lp-enrollment-modal__status ${
                submitStatus === 'error' ? 'lp-enrollment-modal__status--error' : ''
              }`}
            >
              {submitMessage}
            </p>
          ) : null}

          {isPostGraduation ? (
            <div className="lp-enrollment-modal__summary">
              <strong className="lp-enrollment-modal__summary-title">
                Curso: {selection.courseLabel}
              </strong>
              <span className="lp-enrollment-modal__summary-workload">
                {resolvedWorkloadOption
                  ? formatWorkloadLabelForDisplay(resolvedWorkloadOption.label)
                  : selection.workloadLabel
                    ? formatWorkloadLabelForDisplay(selection.workloadLabel)
                  : 'Selecione a carga horária'}
              </span>
              <span className="lp-enrollment-modal__summary-price">{postPriceLabel}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
