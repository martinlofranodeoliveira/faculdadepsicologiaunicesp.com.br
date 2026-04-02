import { useRef, useState, useEffect } from 'react'
import type { CatalogCourseSummary } from '@/lib/catalogApi'

type Props = {
  courses: CatalogCourseSummary[]
}

export function RelatedCoursesSection({ courses }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  if (!courses || courses.length === 0) return null

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [courses])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 326 // card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 500)
    }
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
              Não encontrou o que procurava?
            </p>
          </div>
          <h2 className="text-[#f61010] text-[25px] lg:text-[35px] font-extrabold uppercase font-['Kumbh_Sans'] leading-tight m-0 lg:mt-2">
            <span className="text-black">cursos</span>
            <span className="text-[#1b63de]"> relacionados</span>
          </h2>
        </div>
        
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex w-full gap-[20px] overflow-x-auto pb-6 snap-x hide-scrollbar"
        >
          {courses.map(course => (
            <div key={course.courseId} className="bg-[#f4f4f4] rounded-[16px] p-3 flex flex-col gap-4 shrink-0 w-[280px] lg:w-[306px] snap-start">
              
              <div className="w-full h-[132px] rounded-[12px] overflow-hidden relative shrink-0">
                <img 
                  src={(!course.image || course.image === '/landing/posgraduacao-banner.webp' || course.image.includes('neuropsicologia.jpg')) ? "/course/teacher_working_on_laptop_1.webp" : course.image} 
                  alt={course.rawLabel || course.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="flex items-center gap-[10px] w-full mt-1">
                <div className="border border-[#09419f] rounded-[7px] px-[7px] py-[4px] flex items-center justify-center shrink-0">
                  <span className="font-['Kumbh_Sans'] text-[10px] lg:text-[12px] text-[#09419f] uppercase tracking-[-0.24px] leading-tight">
                    <strong className="font-bold">RECONHECIDO</strong> MEC
                  </span>
                </div>
                <div className="rounded-[4px] py-[4px] flex items-center justify-center shrink-0">
                  <span className="font-['Kumbh_Sans'] text-[10px] lg:text-[12px] font-bold text-[#09419f] uppercase tracking-[-0.24px] leading-tight">
                    360 A 720 HORAS
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
                  R$ {course.currentInstallmentPriceMonthly} por mês
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

        {/* Bottom controls */}
        <div className="w-full flex items-center justify-between mt-8 relative">
          {/* Dots - Left aligned on all screens */}
          <div className="flex items-center gap-[20px] px-0 lg:px-4">
            <div className="flex gap-[12px]">
              {[0, 1, 2, 3].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-[13px] h-[13px] rounded-full ${i === 0 ? 'bg-[#09419f]' : 'bg-[#d9d9d9]'}`}
                />
              ))}
            </div>
          </div>

          {/* Arrows - Pushed to the right */}
          <div className="flex gap-[15px] lg:gap-[20px] ml-auto">
            <button 
              onClick={() => scroll('left')}
              className={`w-[41px] lg:w-[50px] h-[41px] lg:h-[50px] flex items-center justify-center rounded-full transition-opacity ${canScrollLeft ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'}`}
              disabled={!canScrollLeft}
            >
              <img src="/course/frame_1000008993.webp" alt="Anterior" className="w-full h-full object-contain" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className={`w-[41px] lg:w-[50px] h-[41px] lg:h-[50px] flex items-center justify-center rounded-full transition-opacity ${canScrollRight ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'}`}
              disabled={!canScrollRight}
            >
              <img src="/course/frame_1000008992.webp" alt="Próximo" className="w-full h-full object-contain" />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
