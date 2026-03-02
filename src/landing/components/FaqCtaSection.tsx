import { useState } from 'react'

type FaqItem = {
  id: string
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'vestibular',
    question: 'Como funciona o vestibular online?',
    answer:
      'Você faz a prova online, envia os dados solicitados e acompanha o resultado no portal do candidato.',
  },
  {
    id: 'pagamento',
    question: 'Quais são as formas de pagamento?',
    answer:
      'Aceitamos boleto, cartão de crédito e outras opções disponíveis no momento da matrícula.',
  },
  {
    id: 'diploma',
    question: 'O diploma EAD tem a mesma validade?',
    answer:
      'Sim. O diploma EAD reconhecido pelo MEC tem a mesma validade do presencial em todo o território nacional.',
  },
  {
    id: 'suporte',
    question: 'Como funciona o suporte acadêmico?',
    answer:
      'Você conta com tutoria e atendimento por canais digitais para tirar dúvidas sobre conteúdo e rotina do curso.',
  },
]

export function FaqCtaSection() {
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  const handleToggle = (itemId: string) => {
    setOpenItemId((current) => (current === itemId ? null : itemId))
  }

  return (
    <section id="faq-cta" className="lp-faq-cta" aria-label="Perguntas frequentes">
      <div className="lp-faq-cta__inner">
        <h2 className="lp-faq-cta__title">PERGUNTAS FREQUENTES</h2>

        <div className="lp-faq-cta__list">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openItemId === item.id
            const panelId = `faq-cta-answer-${item.id}`

            return (
              <article key={item.id} className={`lp-faq-cta__faq${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="lp-faq-cta__item"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => handleToggle(item.id)}
                >
                  <span>{item.question}</span>
                  <img src="/landing/faq-chevron.svg" alt="" aria-hidden="true" />
                </button>

                {isOpen ? (
                  <div id={panelId} className="lp-faq-cta__answer">
                    <p>{item.answer}</p>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>

        <div className="lp-faq-contact">
          <img className="lp-faq-contact__icon" src="/landing/faq-whatsapp.png" alt="" aria-hidden="true" />

          <div className="lp-faq-contact__text">
            <strong>AINDA TEM DÚVIDAS?</strong>
            <p>O diploma EAD tem a mesma validade?</p>
          </div>

          <button type="button" className="lp-faq-contact__button">
            CONVERSE CONOSCO
          </button>
        </div>
      </div>
    </section>
  )
}
