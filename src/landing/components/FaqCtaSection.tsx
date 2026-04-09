import { useState } from 'react'

const FAQ_WHATSAPP_HREF =
  'https://wa.me/5511947966982?text=Ol%C3%A1,%20estou%20no%20site%20da%20Faculdade%20de%20Psicologia%20e%20quero%20atendimento%20pelo%20WhatsApp.'

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
      'O vestibular é realizado de forma digital, com foco em facilitar o seu acesso ao Ensino Superior. Além da prova online, você pode ingressar utilizando sua nota do ENEM, como Segunda Graduação (aproveitando disciplinas já cursadas) ou via transferência externa de outra Instituição.',
  },
  {
    id: 'pagamento',
    question: 'Quais são as formas de pagamento?',
    answer:
      'Buscamos facilitar o seu acesso ao Ensino Superior com opções flexíveis. Você pode realizar o pagamento das mensalidades via PIX, garantindo a baixa imediata no sistema, ou através de cartão de crédito, com a possibilidade de parcelamento. Nosso objetivo é que a questão financeira não seja um obstáculo para a sua Formação Profissional.',
  },
  {
    id: 'inscricao-psicologia',
    question: 'Quem pode se inscrever no curso de Psicologia?',
    answer:
      'Qualquer pessoa que tenha concluído o Ensino Médio. Este curso é ideal para quem possui vocação para o cuidado humano, responsabilidade ética e o desejo de liderar equipes de Saúde em ambientes de alta tecnologia.',
  },
  {
    id: 'transferencia-retorno',
    question: 'Como funciona a transferência ou retorno?',
    answer:
      'Para quem vem de outra Instituição, o processo de transferência é focado no aproveitamento de créditos: basta apresentar seu Histórico e as Ementas das Disciplinas cursadas para que nossa Coordenação analise as equivalências. Já para ex-alunos que desejam retomar o sonho da Graduação, o processo é simplificado através de um requerimento de retorno junto à nossa secretaria Acadêmica (sujeito à disponibilidade de vaga na turma correspondente).',
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
            <p>Fale com nossas consultoras no WhatsApp</p>
          </div>

          <a
            href={FAQ_WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer"
            className="lp-faq-contact__button"
            aria-label="Converse conosco pelo WhatsApp"
          >
            CONVERSE CONOSCO
          </a>
        </div>
      </div>
    </section>
  )
}
