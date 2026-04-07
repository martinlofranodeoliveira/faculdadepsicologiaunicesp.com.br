import { useEffect, useRef, useState } from 'react'

import type { CatalogCourseSummary } from '@/lib/catalogApi'

type Props = {
  courses: CatalogCourseSummary[]
}

function resolveCourseImage(image?: string) {
  const normalizedImage = image?.trim() ?? ''
  if (!normalizedImage || normalizedImage === '/landing/posgraduacao-banner.webp') {
    return '/course/teacher_working_on_laptop_1.webp'
  }
  return normalizedImage
}

export function RelatedCoursesSection({ courses }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  if (!courses || courses.length === 0) return null

  const resolvePageLeft = (page: number, maxScrollLeft: number, pageCount: number) => {
    if (pageCount <= 1 || maxScrollLeft <= 0) return 0
    return (maxScrollLeft * page) / (pageCount - 1)
  }

  const checkScroll = () => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const maxScrollLeft = Math.max(scrollWidth - clientWidth, 0)
    const nextTotalPages = clientWidth > 0 ? Math.max(1, Math.ceil(maxScrollLeft / clientWidth) + 1) : 1
    const nextPage =
      nextTotalPages <= 1 || maxScrollLeft <= 0
        ? 0
        : Math.min(nextTotalPages - 1, Math.round((scrollLeft / maxScrollLeft) * (nextTotalPages - 1)))

    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < maxScrollLeft - 4)
    setCurrentPage(nextPage)
    setTotalPages(nextTotalPages)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [courses])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return

    const maxScrollLeft = Math.max(scrollRef.current.scrollWidth - scrollRef.current.clientWidth, 0)
    const nextPage =
      direction === 'left'
        ? Math.max(0, currentPage - 1)
        : Math.min(totalPages - 1, currentPage + 1)

    scrollRef.current.scrollTo({
      left: resolvePageLeft(nextPage, maxScrollLeft, totalPages),
      behavior: 'smooth',
    })
    window.setTimeout(checkScroll, 350)
  }

  const scrollToPage = (page: number) => {
    if (!scrollRef.current) return

    const maxScrollLeft = Math.max(scrollRef.current.scrollWidth - scrollRef.current.clientWidth, 0)

    scrollRef.current.scrollTo({ left: resolvePageLeft(page, maxScrollLeft, totalPages), behavior: 'smooth' })
    window.setTimeout(checkScroll, 350)
  }

  return (
    <section className="w-full flex flex-col items-center py-12 lg:py-[80px] bg-white">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="w-full max-w-[1240px] flex flex-col items-start px-4 lg:px-8">
        <div className="flex flex-col mb-6 lg:mb-10 items-start">
          <div className="border border-[rgba(0,0,0,0.55)] lg:border-none rounded-[12px] lg:rounded-none px-[12px] py-[6px] lg:p-0 mb-4 lg:mb-0">
            <p className="font-['Liberation_Sans'] text-[14px] lg:text-[20px] text-black leading-[1.36] lg:leading-snug m-0">
              {'N\u00E3o encontrou o que procurava?'}
            </p>
          </div>
          <h2 className="text-[#f61010] text-[25px] lg:text-[35px] font-extrabold uppercase font-['Kumbh_Sans'] leading-tight m-0 lg:mt-2">
            <span className="text-black">cursos</span>
            <span className="text-[#1b63de]"> relacionados</span>
          </h2>
        </div>

        <div ref={scrollRef} onScroll={checkScroll} className="flex w-full gap-[20px] overflow-x-auto pb-6 snap-x hide-scrollbar">
          {courses.map((course) => (
            <div key={`${course.courseId}-${course.path}`} className="bg-[#f4f4f4] rounded-[16px] p-3 flex flex-col gap-4 shrink-0 w-[280px] lg:w-[306px] snap-start">
              <div className="w-full h-[132px] rounded-[12px] overflow-hidden relative shrink-0">
                <img src={resolveCourseImage(course.image)} alt={course.rawLabel || course.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-[10px] w-full mt-1 flex-wrap">
                <div className="border border-[#09419f] rounded-[7px] px-[7px] py-[4px] flex items-center justify-center shrink-0">
                  <span className="font-['Kumbh_Sans'] text-[10px] lg:text-[12px] text-[#09419f] uppercase tracking-[-0.24px] leading-tight">
                    <strong className="font-bold">RECONHECIDO</strong> MEC
                  </span>
                </div>
                <div className="rounded-[4px] py-[4px] flex items-center justify-center shrink-0">
                  <span className="font-['Kumbh_Sans'] text-[10px] lg:text-[12px] font-bold text-[#09419f] uppercase tracking-[-0.24px] leading-tight">
                    {course.modalityBadge}
                  </span>
                </div>
              </div>

              <h3 className="font-['Kumbh_Sans'] font-bold text-[16px] lg:text-[18px] text-[#010101] leading-[1.2] w-full m-0 line-clamp-2 min-h-[44px]">
                {course.rawLabel || course.title}
              </h3>

              <div className="flex flex-col gap-1 w-full mt-auto">
                <span className="font-['Kumbh_Sans'] font-medium text-[13px] lg:text-[14px] text-black/75 leading-[1.1]">
                  A partir de
                </span>
                <span className="font-['Kumbh_Sans'] font-bold text-[15px] lg:text-[16px] text-[#010101] leading-[1.1]">
                  {course.currentInstallmentPriceMonthly || course.currentInstallmentPrice}
                </span>
              </div>

              <a href={course.path} className="w-full h-[47px] rounded-[12px] bg-gradient-to-r from-[#073588] to-[#041c46] flex items-center justify-center hover:opacity-90 transition-opacity mt-2">
                <span className="font-['Kumbh_Sans'] font-black text-[15px] lg:text-[16px] text-white uppercase leading-[24px]">
                  inscreva-se
                </span>
              </a>
            </div>
          ))}
        </div>

        <div className="w-full flex items-center justify-between mt-8 relative">
          <div className="flex items-center gap-[20px] px-0 lg:px-4">
            <div className="flex gap-[12px]">
              {Array.from({ length: totalPages }, (_, item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`Ir para p\u00E1gina ${item + 1}`}
                  onClick={() => scrollToPage(item)}
                  className={`w-[13px] h-[13px] rounded-full transition-colors ${
                    item === currentPage ? 'bg-[#09419f]' : 'bg-[#d9d9d9] hover:bg-[#bfc9dc]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-[15px] lg:gap-[20px] ml-auto">
            <button
              type="button"
              onClick={() => scroll('left')}
              className={`w-[41px] lg:w-[50px] h-[41px] lg:h-[50px] flex items-center justify-center rounded-full transition-colors ${
                canScrollLeft ? 'bg-[#1b63de] hover:bg-[#1552ba]' : 'bg-[#d9d9d9] cursor-not-allowed'
              }`}
              disabled={!canScrollLeft}
              aria-label="Anterior"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M10.75 4.75L6.5 9L10.75 13.25" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className={`w-[41px] lg:w-[50px] h-[41px] lg:h-[50px] flex items-center justify-center rounded-full transition-colors ${
                canScrollRight ? 'bg-[#1b63de] hover:bg-[#1552ba]' : 'bg-[#d9d9d9] cursor-not-allowed'
              }`}
              disabled={!canScrollRight}
              aria-label={'Pr\u00F3ximo'}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M7.25 4.75L11.5 9L7.25 13.25" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
