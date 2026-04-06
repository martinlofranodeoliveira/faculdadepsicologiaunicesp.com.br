import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'

type AdmissionOption = {
  id: string
  title: string
  description: string
}

type Props = {
  enemRegistration: string
  selectedOptionId?: string
  isContinuing?: boolean
  onContinue?: () => void
  onEnemRegistrationChange?: (value: string) => void
  onSelectOption?: (optionId: string) => void
}

const ADMISSION_OPTIONS: AdmissionOption[] = [
  {
    id: 'simplificada',
    title: 'Inscrição simplificada',
    description: 'Inscreva-se agora mesmo enviando apenas uma Carta de Auto-Apresentação.',
  },
  {
    id: 'redacao',
    title: 'Redação',
    description: 'Ingresse na Graduação realizando apenas uma Redação com 15 linhas.',
  },
  {
    id: 'transferencia',
    title: 'Transferência',
    description: 'Faça sua Transferência e aproveite disciplinas de outra instituição.',
  },
  {
    id: 'segunda-graduacao',
    title: '2° Graduação',
    description: 'Se você já possui uma Graduação, ingresse sem realizar o Vestibular.',
  },
  {
    id: 'enem',
    title: 'ENEM',
    description: 'Se você fez o ENEM, utilize sua nota e ingresse sem realizar o Vestibular.',
  },
]

export function GraduationAdmissionSection({
  enemRegistration,
  selectedOptionId = 'simplificada',
  isContinuing = false,
  onContinue,
  onEnemRegistrationChange,
  onSelectOption,
}: Props) {
  const [isAuthorizationModalOpen, setIsAuthorizationModalOpen] = useState(false)
  const isEnemSelected = selectedOptionId === 'enem'
  const canContinue = !isEnemSelected || Boolean(enemRegistration.trim())

  return (
    <section className="vestibular-admission" aria-labelledby="vestibular-admission-title">
      <div className="vestibular-admission__inner">
        <h2 id="vestibular-admission-title">Selecione a forma de ingresso</h2>

        <div className="vestibular-admission__grid" role="list" aria-label="Formas de ingresso">
          {ADMISSION_OPTIONS.map((option) => {
            const isSelected = option.id === selectedOptionId

            return (
              <button
                key={option.id}
                type="button"
                className={`vestibular-admission__option${isSelected ? ' is-selected' : ''}`}
                onClick={() => onSelectOption?.(option.id)}
                role="listitem"
              >
                <span
                  className={`vestibular-admission__radio${isSelected ? ' is-selected' : ''}`}
                  aria-hidden="true"
                />

                <div className="vestibular-admission__option-copy">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className={`vestibular-admission__enem${isEnemSelected ? ' is-active' : ''}`}>
          <h3>Informe o n° de inscrição do ENEM</h3>

          <label className="vestibular-admission__field">
            <input
              type="text"
              inputMode="numeric"
              placeholder="N° de inscrição do ENEM"
              value={enemRegistration}
              onChange={(event) => onEnemRegistrationChange?.(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="vestibular-admission__notice-link"
            onClick={() => setIsAuthorizationModalOpen(true)}
          >
            Ver o aviso de autorização
          </button>
        </div>

        <div className="vestibular-admission__actions">
          <button
            type="button"
            className="vestibular-admission__continue"
            onClick={onContinue}
            disabled={!canContinue || isContinuing}
          >
            {isContinuing ? <LoaderCircle size={18} className="is-spinning" /> : null}
            {isContinuing ? 'CONTINUANDO...' : 'CONTINUAR'}
          </button>
        </div>
      </div>

      {isAuthorizationModalOpen ? (
        <div
          className="vestibular-admission__modal-backdrop"
          role="presentation"
          onClick={() => setIsAuthorizationModalOpen(false)}
        >
          <div
            className="vestibular-admission__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vestibular-authorization-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vestibular-admission__modal-header">
              <h3 id="vestibular-authorization-title">Aviso de autorização</h3>
              <button
                type="button"
                className="vestibular-admission__modal-close"
                aria-label="Fechar aviso de autorização"
                onClick={() => setIsAuthorizationModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="vestibular-admission__modal-body">
              <p>
                Ao preencher o campo n° de inscrição do ENEM, você autoriza a Faculdade de
                Psicologia UNICESP a consultar suas notas no banco oficial do exame para fins de
                classificação e continuidade da inscrição.
              </p>
            </div>

            <div className="vestibular-admission__modal-footer">
              <button
                type="button"
                className="vestibular-admission__modal-confirm"
                onClick={() => setIsAuthorizationModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
