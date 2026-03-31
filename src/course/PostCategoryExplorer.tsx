import { startTransition, useDeferredValue, useMemo, useState } from 'react'

import type { PostCategoryCourse } from './postCategoryData'

type Props = {
  courses: PostCategoryCourse[]
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function PostCategoryExplorer({ courses }: Props) {
  const [query, setQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('todos')
  const deferredQuery = useDeferredValue(query)

  const areas = useMemo(() => {
    const uniqueAreas = new Map<string, string>()
    courses.forEach((course) => {
      uniqueAreas.set(course.area, course.areaLabel)
    })

    return [
      { value: 'todos', label: 'Todos os cursos' },
      ...[...uniqueAreas.entries()].map(([value, label]) => ({ value, label })),
    ]
  }, [courses])

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalizeText(deferredQuery)

    return courses.filter((course) => {
      const matchesArea = selectedArea === 'todos' || course.area === selectedArea
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(course.title).includes(normalizedQuery) ||
        normalizeText(course.courseLabel).includes(normalizedQuery)

      return matchesArea && matchesQuery
    })
  }, [courses, deferredQuery, selectedArea])

  return (
    <div className="catalog-explorer">
      <section className="catalog-explorer__toolbar surface-card">
        <div className="catalog-explorer__search">
          <label className="sr-only" htmlFor="catalog-search">
            Buscar curso
          </label>
          <input
            id="catalog-search"
            name="search"
            value={query}
            onChange={(event) => {
              const nextValue = event.target.value
              startTransition(() => {
                setQuery(nextValue)
              })
            }}
            placeholder="Buscar por nome do curso"
          />
        </div>

        <div className="catalog-explorer__chips" role="tablist" aria-label="Filtrar por área">
          {areas.map((area) => (
            <button
              key={area.value}
              type="button"
              className={selectedArea === area.value ? 'is-active' : ''}
              onClick={() => {
                startTransition(() => {
                  setSelectedArea(area.value)
                })
              }}
            >
              {area.label}
            </button>
          ))}
        </div>
      </section>

      <div className="catalog-explorer__summary">
        <strong>{filteredCourses.length}</strong>
        <span>{filteredCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}</span>
      </div>

      <div className="catalog-grid">
        {filteredCourses.map((course) => (
          <article key={course.path} className="catalog-card surface-card">
            <div className="catalog-card__media">
              <img src={course.image} alt={course.title} loading="lazy" decoding="async" />
              <span className="catalog-card__badge">{course.modalityBadge}</span>
            </div>

            <div className="catalog-card__body">
              <p className="catalog-card__area">{course.areaLabel}</p>
              <h3>{course.title}</h3>
              <p className="catalog-card__course-label">{course.courseLabel}</p>

              <div className="catalog-card__pricing">
                <small>{course.oldInstallmentPrice}</small>
                <strong>{course.currentInstallmentPrice}</strong>
              </div>

              <a className="button-primary" href={course.path}>
                Ver página do curso
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
