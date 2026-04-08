import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'

import type { LandingPostCourse } from '../landingModels'

const CARD_WIDTH = 306
const CARD_GAP = 20

type HealthCoursesSectionProps = {
  courses: LandingPostCourse[]
  onOpenCoursePopup: (selection: LandingPostCourse['selection']) => void
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function resolveCourseImage(imageSrc: string) {
  const normalized = normalizeText(imageSrc)
  return normalized || '/course/image_fx_19_1.webp'
}

function resolvePriceLabel(course: LandingPostCourse) {
  const normalized = normalizeText(
    course.currentInstallmentPriceDisplay || course.currentInstallmentPrice,
  )
  return normalized || 'Consulte as condições'
}

export function HealthCoursesSection({
  courses,
  onOpenCoursePopup,
}: HealthCoursesSectionProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [cardsPerView, setCardsPerView] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobileCarousel, setIsMobileCarousel] = useState(false)
  const [mobileCanPrev, setMobileCanPrev] = useState(false)
  const [mobileCanNext, setMobileCanNext] = useState(courses.length > 1)

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
    const viewport = viewportRef.current

    if (!viewport || !isMobileCarousel) {
      setMobileCanPrev(false)
      setMobileCanNext(courses.length > 1)
      return
    }

    const updateMobileScrollState = () => {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
      setMobileCanPrev(viewport.scrollLeft > 2)
      setMobileCanNext(viewport.scrollLeft < maxScrollLeft - 2)

      const track = viewport.querySelector('.lp-health-ead__track') as HTMLElement | null
      const firstCard = track?.querySelector('.lp-health-ead-card') as HTMLElement | null
      if (track && firstCard) {
        const trackStyles = window.getComputedStyle(track)
        const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0
        const step = firstCard.getBoundingClientRect().width + gap
        if (step > 0) {
          setCurrentIndex(Math.round(viewport.scrollLeft / step))
        }
      }
    }

    updateMobileScrollState()
    viewport.addEventListener('scroll', updateMobileScrollState, { passive: true })
    window.addEventListener('resize', updateMobileScrollState)

    return () => {
      viewport.removeEventListener('scroll', updateMobileScrollState)
      window.removeEventListener('resize', updateMobileScrollState)
    }
  }, [courses.length, isMobileCarousel])

  const maxIndex = useMemo(
    () => Math.max(0, courses.length - cardsPerView),
    [cardsPerView, courses.length],
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
    <section id="pos-graduacao" className="lp-health-ead" aria-label="Pós EAD em Psicologia">
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
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <article key={course.id} className="lp-health-ead-card">
                      <div className="lp-health-ead-card__image-wrap">
                        <img
                          className="lp-health-ead-card__image"
                          src={resolveCourseImage(course.imageSrc)}
                          alt={`Imagem do curso ${course.title}`}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                        <div className="lp-health-ead-card__promo-badge">
                          <img 
                            src="/landing/presente-icon-card.webp" 
                            alt="" 
                            className="lp-health-ead-card__promo-icon" 
                            aria-hidden="true"
                          />
                          <span>GANHE +3 PÓS!</span>
                        </div>
                      </div>

                      <div className="lp-health-ead-card__content">
                        <h3 className={`lp-health-ead-card__title ${course.title.length > 35 ? 'lp-health-ead-card__title--long' : ''}`}>
                          {course.title}
                        </h3>

                        <div className="lp-health-ead-card__badges">
                          <div className="lp-health-ead-card__badge-row">
                            <span className="lp-health-ead-card__tag">{course.hoursLabel}</span>
                            <span className="lp-health-ead-card__tag">3 a 12 meses</span>
                          </div>
                          <div className="lp-health-ead-card__badge-row">
                            <span className="lp-health-ead-card__tag">LATO SENSU</span>
                          </div>
                        </div>

                        <div className="lp-health-ead-card__prices">
                          <p className="lp-health-ead-card__old-price">
                            18x de <span>R$ 329,00/Mês</span>
                          </p>
                          <p className="lp-health-ead-card__price">
                            Por 18x de {resolvePriceLabel(course)}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="lp-health-ead-card__cta"
                          onClick={() => onOpenCoursePopup(course.selection)}
                        >
                          SAIBA MAIS
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="lp-health-ead-card">
                    <div className="lp-health-ead-card__prices">
                      <p className="lp-health-ead-card__price-prefix">Cursos em atualização</p>
                      <h3 className="lp-health-ead-card__title">
                        Novas pós-graduações serão exibidas aqui em breve.
                      </h3>
                    </div>
                  </article>
                )}
              </div>
            </div>
          </div>

          <div className="lp-health-ead__pagination-bar">
            <div className="lp-health-ead__dots">
              {Array.from({ length: Math.max(1, maxIndex + 1) }).map((_, idx) => {
                const isActive = isMobileCarousel ? idx === Math.round(currentIndex) : idx === clampedIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Página ${idx + 1}`}
                    onClick={() => {
                      if (isMobileCarousel && viewportRef.current) {
                        const targetLeft = idx * getMobileStep();
                        viewportRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
                      } else {
                        setCurrentIndex(idx);
                      }
                    }}
                    className={`lp-health-ead__dot ${isActive ? 'lp-health-ead__dot--active' : ''}`}
                  >
                    <img
                      src={isActive ? '/landing/icone-carrosel-ball-on.svg' : '/landing/icone-carrosel-ball-off.svg'}
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <div className="lp-health-ead__controls">
              <button
                type="button"
                className="lp-health-ead__nav-btn lp-health-ead__nav-btn--prev"
                aria-label="Cursos anteriores"
                onClick={handlePrev}
                disabled={!canPrev}
              >
                <img src={canPrev ? "/landing/arrow-carrosel-cursos-on.svg" : "/landing/arrow-carrosel-cursos-off.svg"} alt="" aria-hidden="true" />
              </button>

              <button
                type="button"
                className="lp-health-ead__nav-btn lp-health-ead__nav-btn--next"
                aria-label="Próximos cursos"
                onClick={handleNext}
                disabled={!canNext}
              >
                <img src={canNext ? "/landing/arrow-carrosel-cursos-on.svg" : "/landing/arrow-carrosel-cursos-off.svg"} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="lp-health-ead__see-all-wrapper">
            <a href="/pos-graduacao" className="lp-health-ead__see-all">
              VER TODOS OS CURSOS
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
