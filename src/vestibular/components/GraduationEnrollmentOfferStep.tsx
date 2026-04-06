import { useMemo, useState } from 'react'
import { ArrowLeft, LoaderCircle } from 'lucide-react'

import {
  fetchInstitutionContract,
  type InstitutionContractPayload,
} from '@/lib/institutionContractsClient'

import type { AdmissionOptionId } from '../GraduationVestibularPage'
import type { GraduationOfferRow } from '../graduationOffer'

type Props = {
  admissionOptionId: AdmissionOptionId
  offerRows: GraduationOfferRow[]
  isOfferLoading?: boolean
  offerError?: string
  onBack: () => void
  onFinish: () => Promise<void> | void
  isSubmitting?: boolean
  submitError?: string
}

function getOptionTitle(admissionOptionId: AdmissionOptionId) {
  switch (admissionOptionId) {
    case 'segunda-graduacao':
      return '2° Graduação'
    case 'transferencia':
      return 'Transferência'
    case 'enem':
      return 'ENEM'
    default:
      return 'Ingresso'
  }
}

export function GraduationEnrollmentOfferStep({
  admissionOptionId,
  offerRows,
  isOfferLoading = false,
  offerError,
  onBack,
  onFinish,
  isSubmitting = false,
  submitError,
}: Props) {
  const [hasAcceptedContract, setHasAcceptedContract] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [contractLoading, setContractLoading] = useState(false)
  const [contractError, setContractError] = useState('')
  const [contractContent, setContractContent] = useState<InstitutionContractPayload | null>(null)
  const optionTitle = useMemo(() => getOptionTitle(admissionOptionId), [admissionOptionId])

  async function loadContract() {
    setContractLoading(true)
    setContractError('')

    try {
      const nextContract = await fetchInstitutionContract('graduation')
      setContractContent(nextContract)
    } catch (error) {
      setContractContent(null)
      setContractError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o contrato agora. Tente novamente em instantes.',
      )
    } finally {
      setContractLoading(false)
    }
  }

  function openContractModal() {
    setIsContractModalOpen(true)

    if (contractLoading) return
    if (contractContent || contractError) return

    void loadContract()
  }

  async function handleFinish() {
    if (!hasAcceptedContract) return
    await onFinish()
  }

  return (
    <section className="vestibular-offer" aria-labelledby="vestibular-offer-title">
      <div className="vestibular-offer__inner vestibular-offer__shell">
        <button type="button" className="vestibular-offer__back" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={18} strokeWidth={2.1} aria-hidden="true" />
          <span>Voltar</span>
        </button>

        <h2 id="vestibular-offer-title" className="vestibular-offer__title">
          <span>Vestibular:</span>
          <strong>{optionTitle}</strong>
        </h2>

        <div className="vestibular-offer__card">
          <p className="vestibular-offer__headline">
            Aproveite esta oportunidade!
            <br />
            Para começar a estudar, basta concluir sua matrícula agora!!!
          </p>

          <div className="vestibular-offer__table-box">
            {isOfferLoading ? (
              <div className="vestibular-offer__loading">
                <LoaderCircle size={20} className="is-spinning" />
                <span>Carregando mensalidades...</span>
              </div>
            ) : offerError ? (
              <p className="vestibular-step__validation-error vestibular-offer__table-error">
                {offerError}
              </p>
            ) : (
              <table className="vestibular-offer__table">
                <tbody>
                  {offerRows.map((row) => (
                    <tr key={`${row.installment}-${row.dueDate}`}>
                      <td>{row.installment}</td>
                      <td>{row.value}</td>
                      <td>{row.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <label className="vestibular-offer__contract">
            <input
              type="checkbox"
              checked={hasAcceptedContract}
              onChange={(event) => setHasAcceptedContract(event.target.checked)}
            />
            <span>
              Aceito o{' '}
              <button
                type="button"
                className="vestibular-offer__contract-link"
                onClick={openContractModal}
              >
                contrato de prestação de serviços educacionais
              </button>{' '}
              deste site
            </span>
          </label>

          {submitError ? <p className="vestibular-step__validation-error">{submitError}</p> : null}
        </div>

        <div className="vestibular-offer__footer">
          <button
            type="button"
            className="vestibular-offer__finish"
            onClick={() => void handleFinish()}
            disabled={!hasAcceptedContract || isSubmitting || isOfferLoading || Boolean(offerError)}
          >
            {isSubmitting ? <LoaderCircle size={18} className="is-spinning" /> : null}
            {isSubmitting ? 'FINALIZANDO...' : 'FINALIZAR'}
          </button>
        </div>
      </div>

      {isContractModalOpen ? (
        <div
          className="vestibular-offer__modal-backdrop"
          role="presentation"
          onClick={() => setIsContractModalOpen(false)}
        >
          <div
            className="vestibular-offer__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vestibular-contract-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vestibular-offer__modal-header">
              <h3 id="vestibular-contract-title">
                {contractContent?.title || 'Contrato de prestação de serviços educacionais'}
              </h3>
              <button
                type="button"
                className="vestibular-offer__modal-close"
                aria-label="Fechar contrato"
                onClick={() => setIsContractModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="vestibular-offer__modal-body">
              {contractLoading ? (
                <div className="vestibular-offer__modal-state">
                  <LoaderCircle size={20} className="is-spinning" />
                  <span>Carregando contrato...</span>
                </div>
              ) : contractError ? (
                <div className="vestibular-offer__modal-state is-error">
                  <p>{contractError}</p>
                  <button type="button" onClick={() => void loadContract()}>
                    Tentar novamente
                  </button>
                </div>
              ) : contractContent?.html ? (
                <div
                  className="vestibular-offer__modal-content"
                  dangerouslySetInnerHTML={{ __html: contractContent.html }}
                />
              ) : (
                <div className="vestibular-offer__modal-content is-text">
                  {contractContent?.text || 'Contrato não encontrado para a instituição informada.'}
                </div>
              )}
            </div>

            <div className="vestibular-offer__modal-footer">
              <button
                type="button"
                className="vestibular-offer__modal-confirm"
                onClick={() => setIsContractModalOpen(false)}
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
