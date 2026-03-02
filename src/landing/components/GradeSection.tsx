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
      'Filosofia Aplicada a Psicologia',
      'Psicologia: Ciencia e Profissao',
      'Processos Psicologicos Basicos',
      'Metodologia Cientifica',
      'Comunicacao Oral e Escrita',
    ],
  },
  {
    id: '2',
    label: '2',
    name: 'Desenvolvimento e Personalidade',
    totalHours: 360,
    subjects: [
      'Historia da Psicologia',
      'Psicologia do Desenvolvimento: Gestacao e Infancia',
      'Psicologia da Personalidade',
      'Bioestatistica',
      'Fundamentos Antropologicos e Sociologicos',
    ],
  },
  {
    id: '3',
    label: '3',
    name: 'Abordagens e Neurociencias',
    totalHours: 360,
    subjects: [
      'Psicologia Fenomenologica, Existencial e Humanista',
      'Analise do Comportamento',
      'Psicologia do Desenvolvimento: Adolescencia, Vida Adulta e Envelhecimento',
      'Etica Profissional, Legislacao e Contemporaneidade',
      'Neuroanatomofisiologia',
    ],
  },
  {
    id: '4',
    label: '4',
    name: 'Psicanalise e Psicopatologia',
    totalHours: 360,
    subjects: [
      'Fundamentos da Psicanalise',
      'Analise Experimental do Comportamento',
      'Psicopatologia',
      'Tecnicas de Observacao e Entrevista Psicologica',
      'Neuropsicologia',
    ],
  },
  {
    id: '5',
    label: '5',
    name: 'Avaliacao e Direitos Humanos',
    totalHours: 360,
    subjects: [
      'Psicologia Analitica',
      'Psicologia Cognitivo-Comportamental',
      'Farmacologia Geral e Aplicada',
      'Avaliacao Psicologica: tecnicas psicometricas',
      'Inclusao, Diversidade e Direitos Humanos',
    ],
  },
  {
    id: '6',
    label: '6',
    name: 'Educacao e Estagio Basico I',
    totalHours: 360,
    subjects: [
      'Psicologia Historico-Cultural',
      'Psicologia Sistemica',
      'Psicologia Escolar e Educacional',
      'Avaliacao Psicologica: tecnicas projetivas',
      'Estagio Basico I - Observacao',
    ],
  },
  {
    id: '7',
    label: '7',
    name: 'Trabalho e Estagio Basico II',
    totalHours: 360,
    subjects: [
      'Psicologia Organizacional e do Trabalho',
      'Psicologia Social e Comunitaria',
      'Psicologia Juridica',
      'Dinamicas e Vivencias de Grupo',
      'Estagio Basico II - Psicodiagnostico',
    ],
  },
  {
    id: '8',
    label: '8',
    name: 'Saude e Estagio Basico III',
    totalHours: 360,
    subjects: [
      'Saude do Trabalhador',
      'Psicologia Hospitalar e da Saude',
      'Psicologia Clinica e Psicoterapia',
      'Saude Mental e Atencao Psicossocial',
      'Estagio Basico III - Intervencao',
    ],
  },
  {
    id: '9',
    label: '9',
    name: 'Carreira e Estagios Especificos I-II',
    totalHours: 488,
    subjects: [
      'Orientacao Profissional e de Carreira',
      'Intervencao em Emergencias, Crises e Desastres',
      'Planejamento e Implementacao de Politicas de Saude',
      'Trabalho de Conclusao de Curso I',
      'Estagio Especifico I - Enfase 1, 2 ou 3',
      'Estagio Especifico II - Enfase 1, 2 ou 3',
    ],
  },
  {
    id: '10',
    label: '10',
    name: 'Inovacao e Estagios Especificos III-IV',
    totalHours: 488,
    subjects: [
      'Psicologia, Empreendedorismo e Inovacao',
      'Prevencao e Promocao de Saude em Diferentes Contextos',
      'Praticas Emergentes em Psicologia',
      'Trabalho de Conclusao de Curso II',
      'Estagio Especifico III',
      'Estagio Especifico IV',
    ],
  },
]

export function GradeSection() {
  const [openTermId, setOpenTermId] = useState<string | null>(CURRICULUM_TERMS[0]?.id ?? null)

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
                    <span className="lp-grade-curriculum__name">{term.name}</span>
                  </div>

                  <span className="lp-grade-curriculum__hours">{`${term.totalHours}h`}</span>

                  <button
                    type="button"
                    className="lp-grade-curriculum__toggle"
                    aria-label={`Expandir periodo ${index + 1}`}
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
      </div>
    </section>
  )
}
