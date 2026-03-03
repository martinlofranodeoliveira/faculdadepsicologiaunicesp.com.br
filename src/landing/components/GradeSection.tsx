import { useState } from 'react'

type CurriculumTerm = {
  id: string
  label: string
  name: string
  totalHours: number
  subjects: string[]
}

const CURRICULUM_TERMS: CurriculumTerm[] = [
  {
    id: '1',
    label: '1',
    name: 'Fundamentos da Psicologia',
    totalHours: 360,
    subjects: [
      'Filosofia Aplicada à Psicologia',
      'Psicologia: Ciência e Profissão',
      'Processos Psicológicos Básicos',
      'Metodologia Científica',
      'Comunicação Oral e Escrita',
    ],
  },
  {
    id: '2',
    label: '2',
    name: 'Desenvolvimento e Personalidade',
    totalHours: 360,
    subjects: [
      'História da Psicologia',
      'Psicologia do Desenvolvimento: Gestação e Infância',
      'Psicologia da Personalidade',
      'Bioestatística',
      'Fundamentos Antropológicos e Sociológicos',
    ],
  },
  {
    id: '3',
    label: '3',
    name: 'Abordagens e Neurociências',
    totalHours: 360,
    subjects: [
      'Psicologia Fenomenológica, Existencial e Humanista',
      'Análise do Comportamento',
      'Psicologia do Desenvolvimento: Adolescência, Vida Adulta e Envelhecimento',
      'Ética Profissional, Legislação e Contemporaneidade',
      'Neuroanatomofisiologia',
    ],
  },
  {
    id: '4',
    label: '4',
    name: 'Psicanálise e Psicopatologia',
    totalHours: 360,
    subjects: [
      'Fundamentos da Psicanálise',
      'Análise Experimental do Comportamento',
      'Psicopatologia',
      'Técnicas de Observação e Entrevista Psicológica',
      'Neuropsicologia',
    ],
  },
  {
    id: '5',
    label: '5',
    name: 'Avaliação e Direitos Humanos',
    totalHours: 360,
    subjects: [
      'Psicologia Analítica',
      'Psicologia Cognitivo-Comportamental',
      'Farmacologia Geral e Aplicada',
      'Avaliação Psicológica: técnicas psicométricas',
      'Inclusão, Diversidade e Direitos Humanos',
    ],
  },
  {
    id: '6',
    label: '6',
    name: 'Educação e Estágio Básico I',
    totalHours: 360,
    subjects: [
      'Psicologia Histórico-Cultural',
      'Psicologia Sistêmica',
      'Psicologia Escolar e Educacional',
      'Avaliação Psicológica: técnicas projetivas',
      'Estágio Básico I - Observação',
    ],
  },
  {
    id: '7',
    label: '7',
    name: 'Trabalho e Estágio Básico II',
    totalHours: 360,
    subjects: [
      'Psicologia Organizacional e do Trabalho',
      'Psicologia Social e Comunitária',
      'Psicologia Jurídica',
      'Dinâmicas e Vivências de Grupo',
      'Estágio Básico II - Psicodiagnóstico',
    ],
  },
  {
    id: '8',
    label: '8',
    name: 'Saúde e Estágio Básico III',
    totalHours: 360,
    subjects: [
      'Saúde do Trabalhador',
      'Psicologia Hospitalar e da Saúde',
      'Psicologia Clínica e Psicoterapia',
      'Saúde Mental e Atenção Psicossocial',
      'Estágio Básico III - Intervenção',
    ],
  },
  {
    id: '9',
    label: '9',
    name: 'Carreira e Estágios Específicos I-II',
    totalHours: 488,
    subjects: [
      'Orientação Profissional e de Carreira',
      'Intervenção em Emergências, Crises e Desastres',
      'Planejamento e Implementação de Políticas de Saúde',
      'Trabalho de Conclusão de Curso I',
      'Estágio Específico I - Ênfase 1, 2 ou 3',
      'Estágio Específico II - Ênfase 1, 2 ou 3',
    ],
  },
  {
    id: '10',
    label: '10',
    name: 'Inovação e Estágios Específicos III-IV',
    totalHours: 488,
    subjects: [
      'Psicologia, Empreendedorismo e Inovação',
      'Prevenção e Promoção de Saúde em Diferentes Contextos',
      'Práticas Emergentes em Psicologia',
      'Trabalho de Conclusão de Curso II',
      'Estágio Específico III',
      'Estágio Específico IV',
    ],
  },
]

type GradeSectionProps = {
  onOpenPopup?: () => void
}

export function GradeSection({ onOpenPopup }: GradeSectionProps) {
  const [openTermId, setOpenTermId] = useState<string | null>(null)

  const handleToggle = (termId: string) => {
    setOpenTermId((current) => (current === termId ? null : termId))
  }

  return (
    <section id="grade" className="lp-grade-curriculum" aria-label="Grade curricular">
      <div className="lp-grade-curriculum__inner">
        <h2 className="lp-grade-curriculum__title">GRADE CURRICULAR</h2>

        <ul className="lp-grade-curriculum__list">
          {CURRICULUM_TERMS.map((term, index) => {
            const isOpen = openTermId === term.id
            const panelId = `grade-panel-${term.id}`

            return (
              <li key={term.id} className={`lp-grade-curriculum__item${isOpen ? ' is-open' : ''}`}>
                <div className="lp-grade-curriculum__row">
                  <div className="lp-grade-curriculum__summary">
                    <span className="lp-grade-curriculum__semester">{`${term.label}\u00BA Semestre`}</span>
                  </div>

                  <span className="lp-grade-curriculum__hours">{`${term.totalHours}h`}</span>

                  <button
                    type="button"
                    className="lp-grade-curriculum__toggle"
                    aria-label={`Expandir período ${index + 1}`}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => handleToggle(term.id)}
                  >
                    <img src="/landing/grade-chevron.svg" alt="" aria-hidden="true" />
                  </button>
                </div>

                {isOpen ? (
                  <div id={panelId} className="lp-grade-curriculum__panel">
                    <p className="lp-grade-curriculum__panel-title">Disciplinas</p>
                    <ul>
                      {term.subjects.map((subject) => (
                        <li key={subject}>{subject}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>

        <button type="button" className="lp-grade-curriculum__cta" onClick={onOpenPopup}>
          Saiba mais
        </button>
      </div>
    </section>
  )
}
