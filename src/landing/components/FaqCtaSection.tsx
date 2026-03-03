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
    id: 'inscricao-psicologia',
    question: 'Quem pode se inscrever no curso de Psicologia?',
    answer:
      'Podem se inscrever candidatos que concluíram o ensino médio e desejam seguir carreira em Psicologia.',
  },
  {
    id: 'transferencia-retorno',
    question: 'Como funciona a transferência ou retorno?',
    answer:
      'Você pode solicitar análise de histórico para transferência ou retorno, conforme as regras acadêmicas vigentes.',
  },
  {
    id: 'atuacao-psicologo',
    question: 'O que faz um Psicólogo e quais são suas áreas de atuação?',
    answer:
      'O Psicólogo atua em clínicas, hospitais, escolas, empresas e no setor público, promovendo saúde mental e desenvolvimento humano.',
  },
  {
    id: 'disciplinas-principais',
    question: 'Quais são as principais disciplinas do curso de Psicologia?',
    answer:
      'A grade inclui fundamentos da Psicologia, desenvolvimento humano, avaliação psicológica, psicopatologia, práticas e estágios supervisionados.',
  },
  {
    id: 'preparo-mercado',
    question: 'Como o curso de Psicologia prepara os alunos para o mercado de trabalho?',
    answer:
      'A formação combina base teórica, prática supervisionada e desenvolvimento de competências para atuação profissional em diferentes contextos.',
  },
  {
    id: 'carreira-psicologos',
    question: 'Quais são as oportunidades de carreira para Psicólogos formados?',
    answer:
      'Há oportunidades em consultório, saúde, educação, organizações, assistência social, perícia, esporte e outras áreas da Psicologia.',
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
        <h2 className="lp-faq-cta__title">
          PERGUNTAS <span className="lp-faq-cta__title-accent">FREQUENTES</span>
        </h2>

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
