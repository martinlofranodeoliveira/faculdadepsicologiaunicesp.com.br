import { useEffect, useMemo, useRef, useState } from 'react'

import type { CourseLeadSelection } from '../crmLead'
import { POS_COURSES_ENDPOINT, parsePostGraduationCourses, type PostCourse } from '../postCourses'

const CARD_WIDTH = 306
const CARD_GAP = 20
const DEFAULT_OLD_PRICE = '18X R$ 132,00'
const DEFAULT_CURRENT_PRICE = '18X R$ 66,00/MÊS'

type HealthCourse = {
  id: string
  tag: string
  title: string
  oldPrice: string
  price: string
  selection: CourseLeadSelection
}

type TargetPsychologyCourse = {
  title: string
  fallbackValue: string
  aliases: string[]
}

type HealthCoursesSectionProps = {
  onOpenCoursePopup: (selection: CourseLeadSelection) => void
}

const TARGET_PSYCHOLOGY_COURSES: TargetPsychologyCourse[] = [
  {
    title: 'NEUROPSICOLOGIA',
    fallbackValue: 'pos-neuropsicologia',
    aliases: ['NEUROPSICOLOGIA'],
  },
  {
    title: 'PSICOLOGIA ESCOLAR E EDUCACIONAL',
    fallbackValue: 'pos-psicologia-escolar-e-educacional',
    aliases: ['PSICOLOGIA ESCOLAR E EDUCACIONAL'],
  },
  {
    title: 'PSICOLOGIA FORENSE E JURÍDICA',
    fallbackValue: 'pos-psicologia-forense-e-juridica',
    aliases: ['PSICOLOGIA FORENSE E JURIDICA', 'PSICOLOGIA FORENSE E JURÍDICA'],
  },
  {
    title: 'PSICOLOGIA INFANTIL',
    fallbackValue: 'pos-psicologia-infantil',
    aliases: ['PSICOLOGIA INFANTIL'],
  },
  {
    title: 'PSICOLOGIA PASTORAL',
    fallbackValue: 'pos-psicologia-pastoral',
    aliases: ['PSICOLOGIA PASTORAL'],
  },
  {
    title: 'PSICOLOGIA SOCIAL',
    fallbackValue: 'pos-psicologia-social',
    aliases: ['PSICOLOGIA SOCIAL', 'PSICOLOGIA SOCIAL E'],
  },
]

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeComparableText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function courseMatchesTarget(courseLabel: string, target: TargetPsychologyCourse): boolean {
  const normalizedLabel = normalizeComparableText(courseLabel)

  return target.aliases.some((alias) => {
    const normalizedAlias = normalizeComparableText(alias)

    return (
      normalizedLabel === normalizedAlias ||
      normalizedLabel.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedLabel)
    )
  })
}

function normalizeUpperText(value: string): string {
  return normalizeText(value).toUpperCase()
}

function formatCurrentPriceForCard(value: string): string {
  const normalized = normalizeUpperText(value)
  if (!normalized) return DEFAULT_CURRENT_PRICE
  if (/\/M[EÊ]S/i.test(normalized)) return normalized
  return `${normalized}/MÊS`
}

function formatOldPriceForCard(oldValue: string, currentValueWithSuffix: string): string {
  const normalizedOld = normalizeUpperText(oldValue)
  if (!normalizedOld) return ''

  const normalizedCurrent = normalizeUpperText(currentValueWithSuffix.replace(/\/M[EÊ]S$/i, ''))
  if (normalizedOld === normalizedCurrent) return ''

  return normalizedOld
}

function buildFallbackCourse(target: TargetPsychologyCourse): HealthCourse {
  return {
    id: `fallback-${target.fallbackValue}`,
    tag: 'POS EAD',
    title: target.title,
    oldPrice: DEFAULT_OLD_PRICE,
    price: DEFAULT_CURRENT_PRICE,
    selection: {
      courseType: 'pos',
      courseValue: target.fallbackValue,
      courseLabel: target.title,
    },
  }
}

function mapPostCourseToHealthCard(course: PostCourse, target: TargetPsychologyCourse): HealthCourse {
  const price = formatCurrentPriceForCard(course.currentInstallmentPrice)
  const oldPrice = formatOldPriceForCard(course.oldInstallmentPrice, price)

  return {
    id: course.value,
    tag: 'POS EAD',
    title: target.title,
    oldPrice,
    price,
    selection: {
      courseType: 'pos',
      courseValue: course.value,
      courseLabel: course.label,
      courseId: course.courseId,
    },
  }
}

const fallbackHealthCourses: HealthCourse[] = TARGET_PSYCHOLOGY_COURSES.map(buildFallbackCourse)

export function HealthCoursesSection({ onOpenCoursePopup }: HealthCoursesSectionProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [cardsPerView, setCardsPerView] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [healthCourses, setHealthCourses] = useState<HealthCourse[]>(fallbackHealthCourses)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateVisibleCards = () => {
      const viewportWidth = viewport.clientWidth
      const visibleCards = Math.max(1, Math.floor((viewportWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)))
      setCardsPerView(visibleCards)
    }

    updateVisibleCards()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateVisibleCards)
      return () => window.removeEventListener('resize', updateVisibleCards)
    }

    const observer = new ResizeObserver(updateVisibleCards)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const abortController = new AbortController()
    let isMounted = true

    const loadCourses = async () => {
      try {
        const response = await fetch(POS_COURSES_ENDPOINT, {
          method: 'GET',
          signal: abortController.signal,
          headers: {
            Accept: 'text/plain, */*',
          },
        })

        if (!response.ok) {
          return
        }

        const rawText = await response.text()
        const parsedCourses = parsePostGraduationCourses(rawText)
        const usedCourseValues = new Set<string>()

        const resolvedCourses = TARGET_PSYCHOLOGY_COURSES.map((targetCourse) => {
          const matchedCourse = parsedCourses.find((course) => {
            if (usedCourseValues.has(course.value)) return false
            return courseMatchesTarget(course.label, targetCourse)
          })

          if (!matchedCourse) {
            return buildFallbackCourse(targetCourse)
          }

          usedCourseValues.add(matchedCourse.value)
          return mapPostCourseToHealthCard(matchedCourse, targetCourse)
        })

        if (!isMounted) {
          return
        }

        setHealthCourses(resolvedCourses)
      } catch {
        // Mantém fallback quando a API estiver indisponível.
      }
    }

    void loadCourses()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [])

  const maxIndex = useMemo(
    () => Math.max(0, healthCourses.length - cardsPerView),
    [cardsPerView, healthCourses.length],
  )
  const clampedIndex = Math.min(currentIndex, maxIndex)
  const canNavigate = cardsPerView > 1 && maxIndex > 0

  const handlePrev = () => {
    setCurrentIndex((current) => Math.max(0, Math.min(current, maxIndex) - 1))
  }

  const handleNext = () => {
    setCurrentIndex((current) => Math.min(maxIndex, Math.min(current, maxIndex) + 1))
  }

  const offset = cardsPerView > 1 ? clampedIndex * (CARD_WIDTH + CARD_GAP) : 0

  return (
    <section id="pos-graduacao" className="lp-health-ead" aria-label="Pós EAD em Psicologia">
      <div className="lp-health-ead__inner">
        <header className="lp-health-ead__header">
          <h2 className="lp-health-ead__title">PÓS EAD NA ÁREA DA PSICOLOGIA</h2>
          <p className="lp-health-ead__highlight">
            <span>PSICÓLOGOS PÓS-GRADUADOS</span>
            <strong>RECEBEM SALÁRIOS ATÉ 2X MAIORES</strong>
          </p>
        </header>

        <div className="lp-health-ead__carousel">
          <div className="lp-health-ead__carousel-shell">
            <div ref={viewportRef} className="lp-health-ead__viewport">
              <div className="lp-health-ead__track" style={{ transform: `translateX(-${offset}px)` }}>
                {healthCourses.map((course) => (
                  <article key={course.id} className="lp-health-ead-card">
                    <div className="lp-health-ead-card__image-wrap">
                      <img
                        className="lp-health-ead-card__image"
                        src="/landing/pos-ead-health-card.png"
                        alt="Professor em sala de aula"
                        loading="lazy"
                      />
                    </div>

                    <span className="lp-health-ead-card__tag">{course.tag}</span>
                    <h3 className="lp-health-ead-card__title">{course.title}</h3>

                    <div className="lp-health-ead-card__prices">
                      {course.oldPrice ? (
                        <p className="lp-health-ead-card__old-price">
                          De: <span>{course.oldPrice}</span>
                        </p>
                      ) : null}

                      <div className="lp-health-ead-card__price-row">
                        <p className="lp-health-ead-card__price">Por: {course.price}</p>
                        <span className="lp-health-ead-card__badge">FIXOS</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="lp-health-ead-card__cta"
                      onClick={() => onOpenCoursePopup(course.selection)}
                    >
                      INSCREVA-SE
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="lp-health-ead__nav lp-health-ead__nav--prev"
              aria-label="Cursos anteriores"
              onClick={handlePrev}
              disabled={!canNavigate || clampedIndex === 0}
            >
              <img src="/landing/pos-carousel-prev.svg" alt="" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="lp-health-ead__nav lp-health-ead__nav--next"
              aria-label="Próximos cursos"
              onClick={handleNext}
              disabled={!canNavigate || clampedIndex === maxIndex}
            >
              <img src="/landing/pos-carousel-next.svg" alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="lp-health-ead__notice" role="note">
            <span className="lp-health-ead__notice-icon" aria-hidden="true">
              !
            </span>
            <p>
              Os cursos atendem às normativas e exigências estabelecidas pelo CFP e CRP, assegurando
              conformidade com a legislação profissional vigente.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
