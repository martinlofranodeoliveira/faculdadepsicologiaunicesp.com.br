import { useEffect, useMemo, useRef, useState } from 'react'

import type { MouseEvent } from 'react'

import type { CourseLeadSelection } from '../crmLead'
import {
  FEATURED_PSYCHOLOGY_POST_COURSES,
  buildPostCourseHoursLabel,
  psychologyPostCourseMatches,
  type PsychologyPostCourseCatalogItem,
} from '../psychologyPostCourses'
import { POS_COURSES_ENDPOINT, parsePostGraduationCourses, type PostCourse } from '../postCourses'

const CARD_WIDTH = 306
const CARD_GAP = 20
const DEFAULT_OLD_PRICE = '18X R$ 132,00'
const DEFAULT_CURRENT_PRICE = '18X R$ 86,00/MÊS'

type HealthCourse = {
  id: string
  title: string
  oldPrice: string
  price: string
  hoursLabel: string
  imageSrc: string
  selection: CourseLeadSelection
}

type HealthCoursesSectionProps = {
  onOpenCoursePopup: (selection: CourseLeadSelection) => void
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeUpperText(value: string): string {
  return normalizeText(value).toUpperCase()
}

function applyPostPriceOverride(value: string): string {
  return value.replace(/18X\s+R\$\s*66,00/gi, '18X R$ 86,00')
}

function formatCurrentPriceForCard(value: string): string {
  const normalized = applyPostPriceOverride(normalizeUpperText(value))
  if (!normalized) return DEFAULT_CURRENT_PRICE
  if (/\/M[EÊ]S/i.test(normalized)) return normalized
  return `${normalized}/MÊS`
}

function formatCurrentPriceForDisplay(value: string): string {
  const normalized = applyPostPriceOverride(normalizeText(value))
  if (!normalized) return '18X R$ 86,00 por mês'
  return normalized.replace(/\/m[eê]s/i, ' por mês')
}

function formatOldPriceForCard(oldValue: string, currentValueWithSuffix: string): string {
  const normalizedOld = normalizeUpperText(oldValue)
  if (!normalizedOld) return ''

  const normalizedCurrent = normalizeUpperText(currentValueWithSuffix.replace(/\/M[EÊ]S$/i, ''))
  if (normalizedOld === normalizedCurrent) return ''

  return normalizedOld
}

function buildFallbackCourse(target: PsychologyPostCourseCatalogItem): HealthCourse {
  return {
    id: target.fallbackValue,
    title: target.title,
    oldPrice: DEFAULT_OLD_PRICE,
    price: DEFAULT_CURRENT_PRICE,
    hoursLabel: buildPostCourseHoursLabel(target.workloads),
    imageSrc: target.imageSrc ?? '',
    selection: {
      courseType: 'pos',
      courseValue: target.fallbackValue,
      courseLabel: target.title,
      courseId: target.fallbackCourseId,
      priceLabel: DEFAULT_CURRENT_PRICE,
    },
  }
}

function mapPostCourseToHealthCard(
  course: PostCourse,
  target: PsychologyPostCourseCatalogItem,
): HealthCourse {
  const price = formatCurrentPriceForCard(course.currentInstallmentPrice)
  const oldPrice = formatOldPriceForCard(course.oldInstallmentPrice, price)

  return {
    id: target.fallbackValue,
    title: target.title,
    oldPrice,
    price,
    hoursLabel: buildPostCourseHoursLabel(target.workloads),
    imageSrc: target.imageSrc ?? '',
    selection: {
      courseType: 'pos',
      courseValue: target.fallbackValue,
      courseLabel: course.label,
      courseId: course.courseId,
      priceLabel: price,
    },
  }
}

const fallbackHealthCourses: HealthCourse[] = FEATURED_PSYCHOLOGY_POST_COURSES.map(buildFallbackCourse)

export function HealthCoursesSection({ onOpenCoursePopup }: HealthCoursesSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [cardsPerView, setCardsPerView] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [healthCourses, setHealthCourses] = useState<HealthCourse[]>(fallbackHealthCourses)
  const [isMobileCarousel, setIsMobileCarousel] = useState(false)
  const [mobileCanPrev, setMobileCanPrev] = useState(false)
  const [mobileCanNext, setMobileCanNext] = useState(true)
  const [shouldLoadCourses, setShouldLoadCourses] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadCourses(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setShouldLoadCourses(true)
        observer.disconnect()
      },
      {
        rootMargin: '320px 0px',
      },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [shouldLoadCourses])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateVisibleCards = () => {
      const viewportWidth = viewport.clientWidth
      const visibleCards = Math.max(1, Math.floor((viewportWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)))
      setIsMobileCarousel(viewportWidth <= 1300)
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
    if (!shouldLoadCourses) return

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

        const resolvedCourses = FEATURED_PSYCHOLOGY_POST_COURSES.map((targetCourse) => {
          const matchedCourse = parsedCourses.find((course) => {
            if (usedCourseValues.has(course.value)) return false
            return psychologyPostCourseMatches(course.label, targetCourse)
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

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport || !isMobileCarousel) {
      setMobileCanPrev(false)
      setMobileCanNext(healthCourses.length > 1)
      return
    }

    const updateMobileScrollState = () => {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
      setMobileCanPrev(viewport.scrollLeft > 2)
      setMobileCanNext(viewport.scrollLeft < maxScrollLeft - 2)
    }

    updateMobileScrollState()
    viewport.addEventListener('scroll', updateMobileScrollState, { passive: true })
    window.addEventListener('resize', updateMobileScrollState)

    return () => {
      viewport.removeEventListener('scroll', updateMobileScrollState)
      window.removeEventListener('resize', updateMobileScrollState)
    }
  }, [healthCourses.length, isMobileCarousel])

  const maxIndex = useMemo(
    () => Math.max(0, healthCourses.length - cardsPerView),
    [cardsPerView, healthCourses.length],
  )
  const clampedIndex = Math.min(currentIndex, maxIndex)
  const canNavigateDesktop = cardsPerView > 1 && maxIndex > 0
  const canPrev = isMobileCarousel ? mobileCanPrev : canNavigateDesktop && clampedIndex > 0
  const canNext = isMobileCarousel ? mobileCanNext : canNavigateDesktop && clampedIndex < maxIndex

  const getMobileStep = () => {
    const viewport = viewportRef.current
    if (!viewport) return CARD_WIDTH + CARD_GAP

    const track = viewport.querySelector('.lp-health-ead__track') as HTMLElement | null
    const firstCard = track?.querySelector('.lp-health-ead-card') as HTMLElement | null

    if (!track || !firstCard) return CARD_WIDTH + CARD_GAP

    const trackStyles = window.getComputedStyle(track)
    const parsedGap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0')
    const gap = Number.isFinite(parsedGap) ? parsedGap : 0

    return firstCard.getBoundingClientRect().width + gap
  }

  const handlePrev = () => {
    if (isMobileCarousel) {
      viewportRef.current?.scrollBy({ left: -getMobileStep(), behavior: 'smooth' })
      return
    }

    setCurrentIndex((current) => Math.max(0, Math.min(current, maxIndex) - 1))
  }

  const handleNext = () => {
    if (isMobileCarousel) {
      viewportRef.current?.scrollBy({ left: getMobileStep(), behavior: 'smooth' })
      return
    }

    setCurrentIndex((current) => Math.min(maxIndex, Math.min(current, maxIndex) + 1))
  }

  const offset = cardsPerView > 1 ? clampedIndex * (CARD_WIDTH + CARD_GAP) : 0

  const handleNavigateToCards = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('pos-graduacao-courses')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section
      ref={sectionRef}
      id="pos-graduacao"
      className="lp-health-ead"
      aria-label="Pós EAD em Psicologia"
    >
      <div className="lp-health-ead__inner">
        <a
          className="lp-health-ead__banner-link"
          href="#pos-graduacao-courses"
          onClick={handleNavigateToCards}
          aria-label="Ir para cursos de pós-graduação"
        >
          <picture className="lp-health-ead__banner-picture">
            <source media="(max-width: 768px)" srcSet="/landing/posgraduacao-banner-mobile.webp" />
            <img
              className="lp-health-ead__banner-image"
              src="/landing/posgraduacao-banner.webp"
              alt="Pós-Graduação EAD em Psicologia"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </picture>
        </a>

        <div className="lp-health-ead__carousel" id="pos-graduacao-courses">
          <div className="lp-health-ead__notice" role="note">
            <span className="lp-health-ead__notice-icon" aria-hidden="true">
              !
            </span>
            <p>
              Apenas os Cursos (a partir de 420h) atendem às normativas e exigências estabelecidas
              pelo CRP, assegurando conformidade com a legislação profissional vigente.
            </p>
          </div>

          <div className="lp-health-ead__carousel-shell">
            <div ref={viewportRef} className="lp-health-ead__viewport">
              <div
                className="lp-health-ead__track"
                style={isMobileCarousel ? undefined : { transform: `translateX(-${offset}px)` }}
              >
                {healthCourses.map((course) => (
                  <article key={course.id} className="lp-health-ead-card">
                    <div className="lp-health-ead-card__image-wrap">
                      <img
                        className="lp-health-ead-card__image"
                        src={course.imageSrc}
                        alt={`Imagem do curso ${course.title}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="lp-health-ead-card__badges">
                      <span className="lp-health-ead-card__mec">RECONHECIDO MEC</span>
                      <span className="lp-health-ead-card__hours">{course.hoursLabel}</span>
                    </div>
                    <h3 className="lp-health-ead-card__title">{course.title}</h3>

                    <div className="lp-health-ead-card__prices">
                      <p className="lp-health-ead-card__price-prefix">A partir de</p>
                      <p className="lp-health-ead-card__price">{formatCurrentPriceForDisplay(course.price)}</p>
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
              disabled={!canPrev}
            >
              <img src="/landing/pos-carousel-prev.svg" alt="" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="lp-health-ead__nav lp-health-ead__nav--next"
              aria-label="Próximos cursos"
              onClick={handleNext}
              disabled={!canNext}
            >
              <img src="/landing/pos-carousel-next.svg" alt="" aria-hidden="true" />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
