import { useEffect, useMemo, useState, type FormEventHandler } from 'react'

import type { CatalogPriceItem } from '@/lib/catalogApi'
import { createJourneyStep1 } from '@/lib/journeyClient'
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
  image?: string
  pixText?: string
  workloadOptions?: string[]
  priceItems?: CatalogPriceItem[]
  durationText?: string
}

type FieldErrors = {
  fullName?: string
  email?: string
  phone?: string
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

type WorkloadChoice = {
  value: string
  label: string
  priceLabel: string
  sortHours: number
}

function canUseJourney(selection: CourseLeadSelection, institutionSlug?: string) {
  if (selection.courseType !== 'graduacao') return false
  if (institutionSlug === 'fallback') return false
  return Boolean(selection.courseId && selection.courseId > 0)
}

function normalizeWorkloadKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseHours(value: string) {
  const match = value.match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

function formatCurrencyBrl(amountCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
    .format(amountCents / 100)
    .toUpperCase()
}

function formatInstallmentPriceLabel(amountCents: number, installmentsMax: number) {
  const installments = installmentsMax > 0 ? installmentsMax : 18
  const monthlyAmount = amountCents > 40000 ? Math.round(amountCents / installments) : amountCents
  return `${installments}X ${formatCurrencyBrl(monthlyAmount)}/MÊS`
}

function buildWorkloadChoices(
  workloadOptions: string[] = [],
  priceItems: CatalogPriceItem[] = [],
  fallbackPriceLabel?: string,
) {
  const choiceMap = new Map<string, WorkloadChoice & { rawAmountCents: number }>()

  for (const item of priceItems) {
    const label = item.workloadName.trim() || (item.totalHours ? `${item.totalHours} Horas` : '')
    if (!label) continue

    const key = item.workloadVariantId ? String(item.workloadVariantId) : normalizeWorkloadKey(label)
    const nextChoice = {
      value: key,
      label,
      priceLabel: formatInstallmentPriceLabel(item.amountCents, item.installmentsMax),
      sortHours: item.totalHours || parseHours(label),
      rawAmountCents: item.amountCents,
    }

    const currentChoice = choiceMap.get(key)
    if (!currentChoice || nextChoice.rawAmountCents < currentChoice.rawAmountCents) {
      choiceMap.set(key, nextChoice)
    }
  }

  for (const option of workloadOptions) {
    const normalizedOption = option.trim()
    if (!normalizedOption) continue

    const key = normalizeWorkloadKey(normalizedOption)
    if (!choiceMap.has(key)) {
      choiceMap.set(key, {
        value: key,
        label: normalizedOption,
        priceLabel: fallbackPriceLabel ?? '',
        sortHours: parseHours(normalizedOption),
        rawAmountCents: Number.MAX_SAFE_INTEGER,
      })
    }
  }

  return [...choiceMap.values()]
    .sort((left, right) => left.sortHours - right.sortHours || left.label.localeCompare(right.label))
    .map(({ rawAmountCents, ...choice }) => choice)
}

function resolveCoverImage(image?: string) {
  const normalizedImage = image?.trim() ?? ''
  return normalizedImage || '/course/image_fx_19_1.webp'
}

function resolvePixMessage(pixText?: string) {
  const normalizedPixText = pixText?.trim() ?? ''
  return normalizedPixText || 'Condições comerciais e descontos são confirmados no atendimento.'
}

export function CourseLeadForm({
  selection,
  institutionSlug,
  dark: _dark = false,
  image,
  pixText,
  workloadOptions = [],
  priceItems = [],
  durationText,
}: Props) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [selectedWorkloadValue, setSelectedWorkloadValue] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const isGraduation = selection.courseType === 'graduacao'
  const workloadChoices = useMemo(
    () => buildWorkloadChoices(workloadOptions, priceItems, selection.priceLabel),
    [priceItems, selection.priceLabel, workloadOptions],
  )
  const selectedWorkload = workloadChoices.find((choice) => choice.value === selectedWorkloadValue)
  const effectiveWorkloadChoice = selectedWorkload ?? workloadChoices[0]
  const currentPriceLabel = effectiveWorkloadChoice?.priceLabel || selection.priceLabel || ''
  const pixMessage = resolvePixMessage(pixText)
  const courseCoverImage = resolveCoverImage(image)

  useEffect(() => {
    if (isGraduation || workloadChoices.length === 0) return

    setSelectedWorkloadValue((currentValue) => {
      if (workloadChoices.some((choice) => choice.value === currentValue)) {
        return currentValue
      }
      return workloadChoices[0].value
    })
  }, [isGraduation, workloadChoices])

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setStatus('error')
      setStatusMessage('')
      return
    }

    if (!acceptedTerms) {
      setStatus('error')
      setStatusMessage('Você precisa concordar com os termos.')
      return
    }

    setStatus('submitting')
    setStatusMessage(isGraduation ? 'Preparando sua inscrição...' : 'Enviando seus dados...')

    const selectionToSend: CourseLeadSelection = isGraduation
      ? selection
      : {
          ...selection,
          workloadLabel: effectiveWorkloadChoice?.label || selection.workloadLabel,
          priceLabel: currentPriceLabel || selection.priceLabel,
        }

    try {
      await sendLeadToCrm({
        fullName,
        email,
        phone,
        selection: selectionToSend,
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
    <section className="bg-white flex flex-col gap-[11.5px] lg:gap-4 p-[15px] lg:p-5 rounded-[22px] lg:rounded-[30px] shadow-[0px_4px_21px_0px_rgba(0,0,0,0.25)] w-full max-w-[552px] font-['Liberation_Sans']">
      <div className="bg-[#606060] h-[206px] lg:h-[287px] overflow-hidden rounded-[10px] lg:rounded-[14px] w-full relative">
        <img src={courseCoverImage} alt={selection.courseLabel} className="w-full h-full object-cover" />
      </div>

      <p className="font-semibold text-[11.5px] lg:text-[16px] text-[#212121] font-['Kumbh_Sans'] leading-snug">
        Conheça a {isGraduation ? 'Graduação' : 'Pós-Graduação'} em {selection.courseLabel || 'Psicologia'} e continue sua inscrição.
      </p>

      <h3 className="font-extrabold text-[13px] lg:text-[18px] text-[#0b111f] uppercase leading-[18px] lg:leading-[25px] font-['Kumbh_Sans'] mt-1 lg:mt-0">
        Preencha o formulário para se inscrever
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[10px] lg:gap-[14px]">
        <div>
          <input
            id={`course-lead-name-${selection.courseValue}`}
            name="name"
            value={fullName}
            onChange={(event) => setFullName(normalizeName(event.target.value))}
            placeholder="Nome completo"
            className={`bg-[#e8e9ea] border ${errors.fullName ? 'border-red-500' : 'border-black/15'} rounded-[6px] lg:rounded-lg p-[8.6px] lg:p-3 h-[34.5px] lg:h-12 w-full text-[11.5px] lg:text-base text-black outline-none focus:border-[#14418d]`}
          />
          {errors.fullName && <span className="text-red-500 text-[10px] lg:text-sm mt-1">{errors.fullName}</span>}
        </div>

        <div className="flex flex-col sm:flex-row gap-[10px] lg:gap-[14px]">
          <div className="w-full">
            <input
              id={`course-lead-email-${selection.courseValue}`}
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-mail"
              className={`bg-[#e8e9ea] border ${errors.email ? 'border-red-500' : 'border-black/15'} rounded-[6px] lg:rounded-lg p-[8.6px] lg:p-3 h-[34.5px] lg:h-12 w-full text-[11.5px] lg:text-base text-black outline-none focus:border-[#14418d]`}
            />
            {errors.email && <span className="text-red-500 text-[10px] lg:text-sm mt-1">{errors.email}</span>}
          </div>
          <div className="w-full">
            <input
              id={`course-lead-phone-${selection.courseValue}`}
              name="phone"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhoneMask(event.target.value))}
              placeholder="Telefone"
              className={`bg-[#e8e9ea] border ${errors.phone ? 'border-red-500' : 'border-black/15'} rounded-[6px] lg:rounded-lg p-[8.6px] lg:p-3 h-[34.5px] lg:h-12 w-full text-[11.5px] lg:text-base text-black outline-none focus:border-[#14418d]`}
            />
            {errors.phone && <span className="text-red-500 text-[10px] lg:text-sm mt-1">{errors.phone}</span>}
          </div>
        </div>

        {!isGraduation && workloadChoices.length > 0 ? (
          <div className="relative">
            <select
              value={selectedWorkloadValue}
              onChange={(event) => setSelectedWorkloadValue(event.target.value)}
              className="appearance-none bg-[#eeeeee] border border-black/25 rounded-[6px] lg:rounded-lg px-[8.5px] lg:px-3 pr-8 h-[34.5px] lg:h-[50px] w-full text-[11.4px] lg:text-[16px] text-black leading-tight outline-none focus:border-[#14418d]"
            >
              {workloadChoices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                  {durationText ? ` | ${durationText}` : ''}
                </option>
              ))}
            </select>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-[8.4px] lg:w-[12px]"
              aria-hidden="true"
            >
              <path d="M10.59 0.589966L6 5.16997L1.41 0.589966L0 1.99997L6 7.99997L12 1.99997L10.59 0.589966Z" fill="black" />
            </svg>
          </div>
        ) : null}

        {!isGraduation ? (
          <div className="flex items-center gap-[5px] lg:gap-[7px]">
            <div className="w-[16px] lg:w-[21px] h-[16px] lg:h-[21px] rounded-full border border-red-500 flex items-center justify-center shrink-0 text-red-500 font-bold text-[10px] lg:text-sm">
              !
            </div>
            <p className="text-[#066aff] text-[12px] leading-[1.35] m-0">
              A carga horária e o investimento acompanham a oferta atual publicada no catálogo.
            </p>
          </div>
        ) : null}

        <label className="flex gap-[5px] lg:gap-[7px] items-center mt-1 lg:mt-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="w-[17px] lg:w-6 h-[17px] lg:h-6 rounded border-black/25 shrink-0 accent-[#14418d]"
          />
          <span className="text-[10px] lg:text-[14px] text-black leading-[11.5px] lg:leading-[16px]">
            Ao continuar você concorda com nossos{' '}
            <a href="/termos-de-uso" className="text-[#066aff] underline underline-offset-2">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/politica-de-privacidade" className="text-[#066aff] underline underline-offset-2">
              Política de Privacidade
            </a>
            .
          </span>
        </label>

        {statusMessage && (
          <p className={`text-[10px] lg:text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
            {statusMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-gradient-to-r from-[#14418d] to-[#0c033c] text-white font-extrabold text-[13px] lg:text-[18px] py-[12px] lg:py-[17px] rounded-[8.6px] lg:rounded-[12px] uppercase leading-[17px] lg:leading-[24px] font-['Kumbh_Sans'] hover:opacity-90 disabled:opacity-50 mt-1"
        >
          {status === 'submitting' ? 'Enviando...' : 'Continuar'}
        </button>
      </form>

      {!isGraduation ? (
        <div className="flex flex-col sm:flex-row gap-[16px] lg:gap-4 items-center mt-1 lg:mt-2 w-full">
          <div className="bg-[#04930e] text-white px-[12px] lg:px-3 py-[6px] lg:py-1.5 rounded-[8px] lg:rounded-lg flex items-center justify-between w-[146px] lg:w-auto shrink-0">
            <div className="font-black text-[12px] lg:text-[14px] uppercase leading-[1.05] font-['Kumbh_Sans']">
              30% <br />
              <span className="font-light">OFF</span>
            </div>
            <div className="w-[1px] h-[26px] bg-white/50 shrink-0 mx-2"></div>
            <div className="text-[12px] lg:text-[14px] leading-[1.2] font-['Kumbh_Sans']">
              <strong className="font-extrabold">Desconto</strong>
              <br />
              Pontualidade
            </div>
          </div>
          <div className="flex flex-col justify-center font-['Kumbh_Sans'] w-full">
            <p className="text-black text-[16px] lg:text-[20px] leading-[1.14]">
              A partir de <strong className="font-bold">{currentPriceLabel || selection.priceLabel}</strong>
            </p>
            <p className="text-black/75 text-[12px] lg:text-[14px] font-medium leading-[1.14]">{pixMessage}</p>
          </div>
        </div>
      ) : null}

      <div className="flex justify-start mt-1 lg:mt-2">
        <button type="button" className="text-[#007bf5] text-[12px] font-extrabold uppercase flex items-center gap-1 font-['Kumbh_Sans']">
          Código voucher
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-[-90deg]" aria-hidden="true">
            <path d="M4 4.5L0 0.5H8L4 4.5Z" fill="#007bf5" />
          </svg>
        </button>
      </div>
    </section>
  )
}
