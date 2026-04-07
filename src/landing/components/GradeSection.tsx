import { useState } from 'react'

import type { LandingCurriculumTerm } from '../landingModels'

type GradeSectionProps = {
  terms?: LandingCurriculumTerm[]
  onOpenPopup?: () => void
}

function formatTermLabel(label: string) {
  return /^\d+$/.test(label) ? `${label}\u00BA Semestre` : label
}

export function GradeSection({ terms = [], onOpenPopup }: GradeSectionProps) {
  const [openTermId, setOpenTermId] = useState<string | null>(null)

  const handleToggle = (termId: string) => {
    setOpenTermId((current) => (current === termId ? null : termId))
  }

  return (
    <section id="grade" className="lp-grade-curriculum" aria-label="Grade curricular">
      <div className="lp-grade-curriculum__inner">
        <h2 className="lp-grade-curriculum__title">GRADE CURRICULAR</h2>

        <ul className="lp-grade-curriculum__list">
          {terms.map((term, index) => {
            const isOpen = openTermId === term.id
            const panelId = `grade-panel-${term.id}`

            return (
              <li key={term.id} className={`lp-grade-curriculum__item${isOpen ? ' is-open' : ''}`}>
                <div className="lp-grade-curriculum__row">
                  <div className="lp-grade-curriculum__summary">
                    <span className="lp-grade-curriculum__semester">{formatTermLabel(term.label)}</span>
                  </div>

                  <span className="lp-grade-curriculum__hours">{`${term.totalHours}h`}</span>

                  <button
                    type="button"
                    className="lp-grade-curriculum__toggle"
                    aria-label={`Expandir item ${index + 1}`}
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
