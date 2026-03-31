import { useEffect, useMemo, useState } from 'react'

import { finalizeJourney, updateJourneyStep3 } from '@/lib/journeyClient'
import { storeGraduationThankYouLead } from '@/thankyou/graduationThankYouState'

import {
  clearGraduationVestibularLead,
  readGraduationVestibularLead,
  storeGraduationVestibularLead,
} from './graduationVestibularState'

import type { GraduationOfferRow } from './graduationOffer'

type AdmissionOptionId =
  | 'simplificada'
  | 'redacao'
  | 'transferencia'
  | 'segunda-graduacao'
  | 'enem'

type Step = 'selection' | 'details' | 'offer'

const ADMISSION_OPTIONS: Array<{
  id: AdmissionOptionId
  title: string
  description: string
}> = [
  {
    id: 'simplificada',
    title: 'Vestibular simplificado',
    description: 'A jornada mais direta para seguir no processo seletivo.',
  },
  {
    id: 'redacao',
    title: 'Prova por redação',
    description: 'Fluxo com tema, título e texto preparados na própria página.',
  },
  {
    id: 'transferencia',
    title: 'Transferência externa',
    description: 'Continuação simplificada para quem já iniciou outra graduação.',
  },
  {
    id: 'segunda-graduacao',
    title: 'Segunda graduação',
    description: 'Pensado para quem já possui diploma de curso superior.',
  },
  {
    id: 'enem',
    title: 'Nota do ENEM',
    description: 'Entrada usando a identificação do exame nacional.',
  },
] as const

function getFirstName(fullName: string) {
  const [firstName] = fullName.trim().split(/\s+/)
  return firstName || 'Aluno'
}

function getFallbackOfferValue(courseLabel: string) {
  return /psicologia/i.test(courseLabel) ? 'R$ 549,00' : 'R$ 449,00'
}

function buildFallbackOfferRows(courseLabel: string): GraduationOfferRow[] {
  const currentValue = getFallbackOfferValue(courseLabel)
  const currentDate = new Date()

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

function mapEntryMethod(optionId: AdmissionOptionId) {
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

export function GraduationVestibularPage() {
  const [step, setStep] = useState<Step>('selection')
  const [selectedOption, setSelectedOption] = useState<AdmissionOptionId>('simplificada')
  const [presentationLetter, setPresentationLetter] = useState('')
  const [essayThemeId, setEssayThemeId] = useState<'tema-a' | 'tema-b'>('tema-a')
  const [essayTitle, setEssayTitle] = useState('')
  const [essayText, setEssayText] = useState('')
  const [enemRegistration, setEnemRegistration] = useState('')
  const [offerRows, setOfferRows] = useState<GraduationOfferRow[]>([])
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lead, setLead] = useState(() => readGraduationVestibularLead())

  useEffect(() => {
    const storedLead = readGraduationVestibularLead()
    if (!storedLead) return
    setLead(storedLead)
    if (storedLead.entryMethod) {
      const resolvedOption = ADMISSION_OPTIONS.find(
        (option) => mapEntryMethod(option.id) === storedLead.entryMethod,
      )
      if (resolvedOption) {
        setSelectedOption(resolvedOption.id)
      }
    }
    if (storedLead.presentationLetter) setPresentationLetter(storedLead.presentationLetter)
    if (storedLead.essayThemeId === 'tema-a' || storedLead.essayThemeId === 'tema-b') {
      setEssayThemeId(storedLead.essayThemeId)
    }
    if (storedLead.essayTitle) setEssayTitle(storedLead.essayTitle)
    if (storedLead.essayText) setEssayText(storedLead.essayText)
    if (storedLead.enemRegistration) setEnemRegistration(storedLead.enemRegistration)
  }, [])

  useEffect(() => {
    const currentLead = lead

    if (!currentLead?.courseId || currentLead.courseId <= 0) {
      setOfferRows(buildFallbackOfferRows(currentLead?.courseLabel ?? 'Psicologia'))
      return
    }

    const activeLead = currentLead

    let cancelled = false

    async function loadOffer() {
      try {
        const response = await fetch(`/api/graduation-offer?courseId=${activeLead.courseId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })

        const payload = (await response.json().catch(() => null)) as
          | { data?: { rows?: GraduationOfferRow[] } }
          | null

        if (!response.ok) {
          throw new Error('Oferta indisponível')
        }

        if (cancelled) return
        const rows = Array.isArray(payload?.data?.rows) ? payload?.data?.rows : []
        setOfferRows(
          rows.length ? rows : buildFallbackOfferRows(activeLead.courseLabel ?? 'Psicologia'),
        )
      } catch {
        if (cancelled) return
        setOfferRows(buildFallbackOfferRows(activeLead.courseLabel ?? 'Psicologia'))
      }
    }

    void loadOffer()

    return () => {
      cancelled = true
    }
  }, [lead?.courseId, lead?.courseLabel])

  const selectedOptionMeta = useMemo(
    () => ADMISSION_OPTIONS.find((option) => option.id === selectedOption) ?? ADMISSION_OPTIONS[0],
    [selectedOption],
  )

  const canContinueSelection =
    selectedOption === 'transferencia' ||
    selectedOption === 'segunda-graduacao' ||
    selectedOption === 'simplificada' ||
    selectedOption === 'redacao' ||
    selectedOption === 'enem'

  function persistLeadSnapshot() {
    if (!lead) return

    storeGraduationVestibularLead({
      ...lead,
      entryMethod: mapEntryMethod(selectedOption),
      presentationLetter,
      essayThemeId,
      essayTitle,
      essayText,
      enemRegistration,
    })
  }

  function goToDetails() {
    persistLeadSnapshot()

    if (selectedOption === 'transferencia' || selectedOption === 'segunda-graduacao') {
      setStep('offer')
      return
    }

    setStep('details')
  }

  function goToOffer() {
    if (selectedOption === 'redacao' && (!essayTitle.trim() || !essayText.trim())) {
      setSubmitMessage('Preencha o título e o texto da redação para continuar.')
      return
    }

    if (selectedOption === 'simplificada' && !presentationLetter.trim()) {
      setSubmitMessage('Escreva uma breve apresentação para continuar.')
      return
    }

    if (selectedOption === 'enem' && !enemRegistration.trim()) {
      setSubmitMessage('Informe o registro do ENEM para continuar.')
      return
    }

    persistLeadSnapshot()
    setSubmitMessage('')
    setStep('offer')
  }

  async function finishFlow() {
    if (!lead) return

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const payload: Record<string, unknown> = {
        entry_method: mapEntryMethod(selectedOption),
      }

      if (selectedOption === 'simplificada') {
        payload.presentation_letter = presentationLetter.trim()
      }

      if (selectedOption === 'redacao') {
        payload.essay_theme_id = essayThemeId
        payload.essay_title = essayTitle.trim()
        payload.essay_text = essayText.trim()
      }

      if (selectedOption === 'enem') {
        payload.enem_registration = enemRegistration.trim()
      }

      if (lead.journeyId) {
        await updateJourneyStep3(lead.journeyId, payload)
        await finalizeJourney(lead.journeyId)
      }

      storeGraduationThankYouLead({
        fullName: lead.fullName,
        email: lead.email,
      })
      clearGraduationVestibularLead()
      window.location.assign('/graduacao/inscricao-finalizada')
    } catch (error) {
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir sua inscrição agora. Tente novamente em instantes.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!lead) {
    return (
      <main className="vestibular-page">
        <div className="container vestibular-page__shell">
          <section className="vestibular-hero">
            <p className="eyebrow">Vestibular</p>
            <h1>Comece pela página do curso</h1>
            <p>
              Para abrir o fluxo de vestibular corretamente, inicie pela página da graduação e envie seus dados no formulário do curso.
            </p>
            <div className="vestibular-step__actions">
              <a className="button-primary" href="/graduacao/psicologia">
                Ir para a graduação
              </a>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="vestibular-page">
      <div className="container vestibular-page__shell">
        <section className="vestibular-hero">
          <p className="eyebrow">Vestibular</p>
          <h1>{getFirstName(lead.fullName)}, escolha sua forma de ingresso.</h1>
          <p>
            O fluxo já está separado da página do curso para suportar evoluções futuras de regra, UX e integração com a API da jornada.
          </p>
          <div className="vestibular-hero__meta">
            <span className="metric-chip">{lead.courseLabel || 'Graduação'}</span>
            <span className="metric-chip">{lead.email}</span>
          </div>
        </section>

        {step === 'selection' ? (
          <section className="vestibular-step">
            <p className="eyebrow">Etapa 1</p>
            <h2>Selecione a modalidade de ingresso</h2>
            <p>Escolha a forma de entrada que mais combina com o seu momento acadêmico.</p>

            <div className="vestibular-step__options">
              {ADMISSION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`vestibular-option ${selectedOption === option.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedOption(option.id)
                    setSubmitMessage('')
                  }}
                >
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>

            <div className="vestibular-step__actions">
              <span />
              <button className="button-primary" type="button" disabled={!canContinueSelection} onClick={goToDetails}>
                Continuar
              </button>
            </div>
          </section>
        ) : null}

        {step === 'details' ? (
          <section className="vestibular-step">
            <p className="eyebrow">Etapa 2</p>
            <h2>{selectedOptionMeta.title}</h2>
            <p>{selectedOptionMeta.description}</p>

            <div className="vestibular-step__form">
              {selectedOption === 'simplificada' ? (
                <label className="vestibular-step__field">
                  <span>Apresentação breve</span>
                  <textarea
                    value={presentationLetter}
                    onChange={(event) => setPresentationLetter(event.target.value)}
                    placeholder="Conte brevemente sua motivação para ingressar no curso."
                  />
                </label>
              ) : null}

              {selectedOption === 'redacao' ? (
                <>
                  <label className="vestibular-step__field">
                    <span>Tema</span>
                    <select
                      value={essayThemeId}
                      onChange={(event) => setEssayThemeId(event.target.value as 'tema-a' | 'tema-b')}
                    >
                      <option value="tema-a">Tema A</option>
                      <option value="tema-b">Tema B</option>
                    </select>
                  </label>
                  <label className="vestibular-step__field">
                    <span>Título da redação</span>
                    <input
                      value={essayTitle}
                      onChange={(event) => setEssayTitle(event.target.value)}
                      placeholder="Digite o título"
                    />
                  </label>
                  <label className="vestibular-step__field">
                    <span>Texto da redação</span>
                    <textarea
                      value={essayText}
                      onChange={(event) => setEssayText(event.target.value)}
                      placeholder="Desenvolva sua redação aqui."
                    />
                  </label>
                </>
              ) : null}

              {selectedOption === 'enem' ? (
                <label className="vestibular-step__field">
                  <span>Número de inscrição do ENEM</span>
                  <input
                    value={enemRegistration}
                    onChange={(event) => setEnemRegistration(event.target.value)}
                    placeholder="Informe sua inscrição"
                  />
                </label>
              ) : null}
            </div>

            <p className={`vestibular-step__message ${submitMessage ? 'is-error' : ''}`}>
              {submitMessage}
            </p>

            <div className="vestibular-step__actions">
              <button className="button-ghost" type="button" onClick={() => setStep('selection')}>
                Voltar
              </button>
              <button className="button-primary" type="button" onClick={goToOffer}>
                Ver oferta
              </button>
            </div>
          </section>
        ) : null}

        {step === 'offer' ? (
          <section className="vestibular-step">
            <p className="eyebrow">Etapa 3</p>
            <h2>Revise a oferta e conclua</h2>
            <p>Esta etapa fecha a jornada do vestibular e prepara a continuidade comercial do atendimento.</p>

            <div className="vestibular-step__offer-grid">
              {offerRows.slice(0, 6).map((row) => (
                <article key={`${row.installment}-${row.dueDate}`} className="vestibular-step__offer-card">
                  <strong>{row.installment}</strong>
                  <small>{row.dueDate}</small>
                  <strong>{row.value}</strong>
                </article>
              ))}
            </div>

            <p className={`vestibular-step__message ${submitMessage ? 'is-error' : ''}`}>
              {submitMessage}
            </p>

            <div className="vestibular-step__actions">
              <button
                className="button-ghost"
                type="button"
                onClick={() => setStep(selectedOption === 'transferencia' || selectedOption === 'segunda-graduacao' ? 'selection' : 'details')}
              >
                Voltar
              </button>
              <button className="button-primary" type="button" disabled={isSubmitting} onClick={finishFlow}>
                {isSubmitting ? 'Concluindo...' : 'Finalizar inscrição'}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
