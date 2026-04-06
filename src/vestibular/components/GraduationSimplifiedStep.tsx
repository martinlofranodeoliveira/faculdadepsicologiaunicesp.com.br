import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, LoaderCircle } from 'lucide-react'

type Props = {
  onBack: () => void
  onContinue: (presentation: string) => Promise<void> | void
  isSubmitting?: boolean
  submitError?: string
  initialPresentation?: string
}

const MIN_PRESENTATION_LINES = 7
const MAX_PRESENTATION_LENGTH = 2500

function measureVisualLines(textarea: HTMLTextAreaElement, value: string) {
  const styles = window.getComputedStyle(textarea)
  const lineHeight = Number.parseFloat(styles.lineHeight)

  if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
    return Math.max(1, value.split(/\r?\n/).length)
  }

  const mirror = document.createElement('div')
  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.pointerEvents = 'none'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.wordBreak = 'break-word'
  mirror.style.overflowWrap = 'break-word'
  mirror.style.boxSizing = styles.boxSizing
  mirror.style.width = `${textarea.clientWidth}px`
  mirror.style.padding = styles.padding
  mirror.style.border = styles.border
  mirror.style.fontFamily = styles.fontFamily
  mirror.style.fontSize = styles.fontSize
  mirror.style.fontWeight = styles.fontWeight
  mirror.style.fontStyle = styles.fontStyle
  mirror.style.letterSpacing = styles.letterSpacing
  mirror.style.lineHeight = styles.lineHeight
  mirror.textContent = value.length > 0 ? value : ' '

  document.body.appendChild(mirror)
  const height = mirror.getBoundingClientRect().height
  mirror.remove()

  return Math.max(1, Math.round(height / lineHeight))
}

export function GraduationSimplifiedStep({
  onBack,
  onContinue,
  isSubmitting = false,
  submitError,
  initialPresentation = '',
}: Props) {
  const [presentation, setPresentation] = useState(initialPresentation)
  const [lineCount, setLineCount] = useState(1)
  const [hasTriedContinue, setHasTriedContinue] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setPresentation(initialPresentation)
  }, [initialPresentation])

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    setLineCount(measureVisualLines(textarea, presentation))
  }, [presentation])

  const characterCount = useMemo(() => presentation.trim().length, [presentation])
  const isValid = characterCount > 0 && characterCount <= MAX_PRESENTATION_LENGTH && lineCount >= MIN_PRESENTATION_LINES

  async function handleContinue() {
    if (!isValid) {
      setHasTriedContinue(true)
      textareaRef.current?.focus()
      return
    }

    await onContinue(presentation.trim())
  }

  return (
    <section className="vestibular-step" aria-labelledby="vestibular-simplified-title">
      <div className="vestibular-step__inner">
        <button type="button" className="vestibular-step__back" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={18} strokeWidth={2.1} aria-hidden="true" />
          <span>Voltar</span>
        </button>

        <h2 id="vestibular-simplified-title" className="vestibular-step__title">
          <span>Conte-nos</span>
          <strong>um pouco sobre você</strong>
        </h2>

        <p className="vestibular-step__description">
          Como vestibular, escreva aqui uma carta de apresentação explicando por que você deseja
          estudar na Faculdade de Psicologia UNICESP, quais são suas expectativas em relação ao
          curso escolhido e quais são seus planos profissionais para o futuro. Seu texto deve
          conter no mínimo 7 linhas. Nossa equipe avaliará sua carta juntamente com sua
          documentação.
        </p>

        <label className="vestibular-step__field">
          <textarea
            ref={textareaRef}
            placeholder="Digite sua apresentação"
            value={presentation}
            maxLength={MAX_PRESENTATION_LENGTH}
            aria-invalid={hasTriedContinue && !isValid}
            onChange={(event) => {
              setPresentation(event.target.value)
              if (hasTriedContinue) setHasTriedContinue(false)
            }}
          />
        </label>

        {hasTriedContinue && !isValid ? (
          <p className="vestibular-step__validation-error">
            Sua carta deve ter no mínimo {MIN_PRESENTATION_LINES} linhas para continuar.
          </p>
        ) : null}

        {submitError ? <p className="vestibular-step__validation-error">{submitError}</p> : null}

        <div className="vestibular-step__actions">
          <p>{`Quantidade de caracteres: ${characterCount}`}</p>
          <button type="button" className="vestibular-step__continue" onClick={handleContinue} disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle size={18} className="is-spinning" /> : null}
            {isSubmitting ? 'ENVIANDO...' : 'CONTINUAR'}
          </button>
        </div>
      </div>
    </section>
  )
}
