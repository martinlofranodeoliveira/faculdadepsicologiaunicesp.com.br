import { useMemo, useState, type FormEventHandler } from 'react'

import {
  formatPhoneMask,
  normalizeName,
  sendLeadToCrm,
  validateEmail,
  validateFullName,
  validatePhone,
  type CourseLeadSelection,
} from '@/lib/crmLead'

type Props = {
  title: string
  description: string
  options: CourseLeadSelection[]
  defaultCourseValue?: string
  redirectWithLeadParam?: boolean
  dark?: boolean
}

type FieldErrors = {
  courseValue?: string
  fullName?: string
  email?: string
  phone?: string
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function QuickLeadForm({
  title,
  description,
  options,
  defaultCourseValue,
  redirectWithLeadParam = false,
  dark = false,
}: Props) {
  const [courseValue, setCourseValue] = useState(defaultCourseValue ?? options[0]?.courseValue ?? '')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const selectedCourse = useMemo(
    () => options.find((option) => option.courseValue === courseValue) ?? options[0],
    [courseValue, options],
  )

  const formClassName = `lead-card ${dark ? 'lead-card--dark' : ''}`

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      courseValue: selectedCourse ? undefined : 'Selecione um curso.',
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean) || !selectedCourse) {
      return
    }

    setStatus('submitting')
    setStatusMessage('Enviando seus dados...')

    try {
      await sendLeadToCrm({
        fullName,
        email,
        phone,
        selection: selectedCourse,
      })

      setStatus('success')
      setStatusMessage('Cadastro recebido. Redirecionando...')

      const redirectPath = selectedCourse.coursePath
      if (redirectPath) {
        window.setTimeout(() => {
          const url = redirectWithLeadParam
            ? `${redirectPath}${redirectPath.includes('?') ? '&' : '?'}lead=1`
            : redirectPath
          window.location.assign(url)
        }, 120)
        return
      }

      window.setTimeout(() => {
        window.location.assign('/obrigado')
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
    <section className={formClassName} aria-label={title}>
      <header className="lead-card__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <form className="lead-card__form" onSubmit={handleSubmit}>
        <div className="lead-card__grid">
          <div className={`lead-card__field lead-card__field--full ${errors.courseValue ? 'is-invalid' : ''}`}>
            <label htmlFor="quick-lead-course">Curso de interesse</label>
            <select
              id="quick-lead-course"
              name="course"
              value={courseValue}
              onChange={(event) => setCourseValue(event.target.value)}
            >
              {options.map((option) => (
                <option key={`${option.courseType}-${option.courseValue}`} value={option.courseValue}>
                  {option.courseLabel}
                </option>
              ))}
            </select>
            {errors.courseValue ? <span className="lead-card__error">{errors.courseValue}</span> : null}
          </div>

          <div className={`lead-card__field ${errors.fullName ? 'is-invalid' : ''}`}>
            <label htmlFor="quick-lead-name">Nome completo</label>
            <input
              id="quick-lead-name"
              name="name"
              value={fullName}
              onChange={(event) => setFullName(normalizeName(event.target.value))}
              placeholder="Digite seu nome"
            />
            {errors.fullName ? <span className="lead-card__error">{errors.fullName}</span> : null}
          </div>

          <div className={`lead-card__field ${errors.email ? 'is-invalid' : ''}`}>
            <label htmlFor="quick-lead-email">E-mail</label>
            <input
              id="quick-lead-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
            />
            {errors.email ? <span className="lead-card__error">{errors.email}</span> : null}
          </div>

          <div className={`lead-card__field lead-card__field--full ${errors.phone ? 'is-invalid' : ''}`}>
            <label htmlFor="quick-lead-phone">WhatsApp</label>
            <input
              id="quick-lead-phone"
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
          Ao continuar, você autoriza contato da equipe acadêmica para orientação sobre o curso escolhido.
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
            {status === 'submitting' ? 'Enviando...' : 'Quero atendimento'}
          </button>
        </div>
      </form>
    </section>
  )
}
